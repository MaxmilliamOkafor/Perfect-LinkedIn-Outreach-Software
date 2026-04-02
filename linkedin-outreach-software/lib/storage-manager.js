/**
 * LinkedIn Outreach Software — Storage Manager
 * Handles all Chrome storage operations for leads, settings, and outreach history.
 * Zero limitations — everything stored locally.
 */

const StorageManager = {
  KEYS: {
    LEADS: 'los_leads',
    SETTINGS: 'los_settings',
    OUTREACH_HISTORY: 'los_outreach_history',
    TEMPLATES: 'los_templates',
    STATS: 'los_stats'
  },

  DEFAULT_SETTINGS: {
    openaiApiKey: '',
    aiModel: 'gpt-4o-mini',
    showBadge: true,
    autoExtract: true,
    defaultTone: 'professional',
    userName: '',
    userTitle: '',
    userCompany: '',
    userEmail: '',
    userPhone: '',
    userLinkedIn: '',
    theme: 'dark'
  },

  DEFAULT_TEMPLATES: [
    {
      id: 'cold_outreach',
      name: 'Cold Outreach',
      icon: '🎯',
      prompt: `Write a concise, professional cold outreach email to {name} who is {title} at {company}. My name is {userName} and I am {userTitle} at {userCompany}. The email should be personalized based on their profile and demonstrate genuine interest. Keep it under 150 words. Be warm but professional.`
    },
    {
      id: 'linkedin_connect',
      name: 'LinkedIn Connection',
      icon: '🤝',
      prompt: `Write a short LinkedIn connection request message (max 300 characters) to {name}, {title} at {company}. My name is {userName}, {userTitle} at {userCompany}. Make it personal and genuine — reference something specific about their role or company. No generic messages.`
    },
    {
      id: 'job_application',
      name: 'Job Application',
      icon: '💼',
      prompt: `Write a tailored cover email for applying to the {jobTitle} position at {company}. The job description mentions: {jobDescription}. My name is {userName}, I am {userTitle} at {userCompany}. The recruiter/hiring manager is {name}. Make it compelling, specific to the role, and under 200 words.`
    },
    {
      id: 'recruiter_response',
      name: 'Recruiter Response',
      icon: '📩',
      prompt: `Write a professional response to a recruiter named {name} from {company} about the {jobTitle} role. Express genuine interest, highlight relevant experience, and ask thoughtful questions about the role. My name is {userName}, {userTitle} at {userCompany}. Keep it under 150 words.`
    },
    {
      id: 'followup',
      name: 'Follow-Up',
      icon: '🔄',
      prompt: `Write a follow-up email to {name}, {title} at {company}. My name is {userName}, {userTitle} at {userCompany}. Reference our previous interaction and provide value. Be brief (under 100 words), direct, and include a clear call to action.`
    },
    {
      id: 'networking',
      name: 'Networking',
      icon: '🌐',
      prompt: `Write a networking outreach message to {name}, {title} at {company}. I'm {userName}, {userTitle} at {userCompany}. Ask for an informational conversation or coffee chat. Be genuine, mention a shared interest or connection point, and keep it under 120 words.`
    }
  ],

  // ─── Core CRUD ────────────────────────────

  async get(key) {
    return new Promise(resolve => {
      chrome.storage.local.get(key, result => resolve(result[key]));
    });
  },

  async set(key, value) {
    return new Promise(resolve => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  },

  // ─── Settings ─────────────────────────────

  async getSettings() {
    const settings = await this.get(this.KEYS.SETTINGS);
    return { ...this.DEFAULT_SETTINGS, ...(settings || {}) };
  },

  async updateSettings(updates) {
    const current = await this.getSettings();
    const merged = { ...current, ...updates };
    await this.set(this.KEYS.SETTINGS, merged);
    return merged;
  },

  // ─── Leads ────────────────────────────────

  async getLeads() {
    return (await this.get(this.KEYS.LEADS)) || [];
  },

  async saveLead(lead) {
    const leads = await this.getLeads();
    const existing = leads.findIndex(l => l.linkedinUrl === lead.linkedinUrl);

    const entry = {
      ...lead,
      id: lead.id || `lead_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      savedAt: lead.savedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: lead.status || 'new',
      notes: lead.notes || '',
      outreachCount: lead.outreachCount || 0
    };

    if (existing >= 0) {
      leads[existing] = { ...leads[existing], ...entry };
    } else {
      leads.unshift(entry);
    }

    await this.set(this.KEYS.LEADS, leads);
    await this.incrementStat('leadsSaved');
    return entry;
  },

  async deleteLead(id) {
    let leads = await this.getLeads();
    leads = leads.filter(l => l.id !== id);
    await this.set(this.KEYS.LEADS, leads);
  },

  async updateLead(id, updates) {
    const leads = await this.getLeads();
    const idx = leads.findIndex(l => l.id === id);
    if (idx >= 0) {
      leads[idx] = { ...leads[idx], ...updates, updatedAt: new Date().toISOString() };
      await this.set(this.KEYS.LEADS, leads);
      return leads[idx];
    }
    return null;
  },

  async findLeadByUrl(url) {
    const leads = await this.getLeads();
    return leads.find(l => l.linkedinUrl === url) || null;
  },

  // ─── Outreach History ─────────────────────

  async saveOutreach(outreach) {
    const history = (await this.get(this.KEYS.OUTREACH_HISTORY)) || [];
    history.unshift({
      ...outreach,
      id: `out_${Date.now()}`,
      createdAt: new Date().toISOString()
    });
    // Keep last 500 entries
    if (history.length > 500) history.length = 500;
    await this.set(this.KEYS.OUTREACH_HISTORY, history);
    await this.incrementStat('messagesDrafted');
  },

  async getOutreachHistory(leadId) {
    const history = (await this.get(this.KEYS.OUTREACH_HISTORY)) || [];
    if (leadId) return history.filter(h => h.leadId === leadId);
    return history;
  },

  // ─── Templates ────────────────────────────

  async getTemplates() {
    const custom = (await this.get(this.KEYS.TEMPLATES)) || [];
    return [...this.DEFAULT_TEMPLATES, ...custom];
  },

  async saveCustomTemplate(template) {
    const custom = (await this.get(this.KEYS.TEMPLATES)) || [];
    custom.push({
      ...template,
      id: `custom_${Date.now()}`,
      isCustom: true
    });
    await this.set(this.KEYS.TEMPLATES, custom);
  },

  // ─── Stats ────────────────────────────────

  async getStats() {
    return (await this.get(this.KEYS.STATS)) || {
      leadsSaved: 0,
      messagesDrafted: 0,
      emailsFound: 0,
      profilesViewed: 0
    };
  },

  async incrementStat(key) {
    const stats = await this.getStats();
    stats[key] = (stats[key] || 0) + 1;
    await this.set(this.KEYS.STATS, stats);
    return stats;
  },

  // ─── Export ───────────────────────────────

  async exportLeadsCSV() {
    const leads = await this.getLeads();
    if (!leads.length) return '';

    const headers = ['Name', 'Title', 'Company', 'Email', 'Phone', 'LinkedIn URL', 'Status', 'Notes', 'Saved At'];
    const rows = leads.map(l => [
      l.name || '',
      l.title || '',
      l.company || '',
      (l.emails || []).join('; '),
      (l.phones || []).join('; '),
      l.linkedinUrl || '',
      l.status || '',
      (l.notes || '').replace(/"/g, '""'),
      l.savedAt || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.map(c => `"${c}"`).join(','))
    ].join('\n');

    return csv;
  }
};

// Make available globally for content scripts and as module
if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
}
