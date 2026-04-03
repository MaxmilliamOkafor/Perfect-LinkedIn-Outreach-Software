/**
 * LinkedIn Outreach Pro — Campaign Manager
 * Create, manage, and track automation campaigns.
 * Unlimited campaigns, leads, and sequences — zero paywalls.
 */

const CampaignManager = {
  STORAGE_KEY: 'los_campaigns',

  // ─── Campaign CRUD ─────────────────────────
  async createCampaign(campaign) {
    const campaigns = await this.getCampaigns();

    const entry = {
      id: `camp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: campaign.name || 'Untitled Campaign',
      description: campaign.description || '',
      sequenceTemplateId: campaign.sequenceTemplateId || 'cold_outreach',
      customSteps: campaign.customSteps || null,
      status: 'draft', // draft, active, paused, completed
      leads: campaign.leads || [],
      connectionNote: campaign.connectionNote || '',
      messageTemplateId: campaign.messageTemplateId || null,
      customMessage: campaign.customMessage || '',
      tags: campaign.tags || [],
      sequence: null, // Will be populated when started
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      pausedAt: null,
      stats: {
        totalLeads: (campaign.leads || []).length,
        sent: 0,
        accepted: 0,
        replied: 0,
        failed: 0,
        responseRate: 0
      }
    };

    campaigns.unshift(entry);
    await this._save(campaigns);
    return entry;
  },

  async getCampaigns() {
    return new Promise(resolve => {
      chrome.storage.local.get(this.STORAGE_KEY, r => {
        resolve(r[this.STORAGE_KEY] || []);
      });
    });
  },

  async getCampaign(id) {
    const campaigns = await this.getCampaigns();
    return campaigns.find(c => c.id === id) || null;
  },

  async updateCampaign(id, updates) {
    const campaigns = await this.getCampaigns();
    const idx = campaigns.findIndex(c => c.id === id);
    if (idx >= 0) {
      campaigns[idx] = { ...campaigns[idx], ...updates, updatedAt: new Date().toISOString() };
      await this._save(campaigns);
      return campaigns[idx];
    }
    return null;
  },

  async deleteCampaign(id) {
    let campaigns = await this.getCampaigns();
    campaigns = campaigns.filter(c => c.id !== id);
    await this._save(campaigns);
  },

  // ─── Campaign Lifecycle ────────────────────
  async startCampaign(id) {
    const campaign = await this.getCampaign(id);
    if (!campaign) throw new Error('Campaign not found');
    if (!campaign.leads.length) throw new Error('Campaign has no leads');

    // Create sequence from template
    const sequence = SequenceRunner.createSequence(
      campaign.sequenceTemplateId,
      campaign.leads,
      campaign.customSteps
    );

    // Apply connection note and custom message to leads
    sequence.leads.forEach(lead => {
      lead.connectionNote = campaign.connectionNote;
      lead.customMessage = campaign.customMessage;
    });

    campaign.sequence = sequence;
    campaign.status = 'active';
    campaign.startedAt = new Date().toISOString();

    await this.updateCampaign(id, campaign);

    // Schedule first batch of actions
    const actions = await SequenceRunner.scheduleSequenceActions(sequence, id);

    // Enqueue actions in the automation engine
    if (typeof AutomationEngine !== 'undefined') {
      await AutomationEngine.enqueueBatch(actions);
    }

    return campaign;
  },

  async pauseCampaign(id) {
    return this.updateCampaign(id, {
      status: 'paused',
      pausedAt: new Date().toISOString()
    });
  },

  async resumeCampaign(id) {
    const campaign = await this.getCampaign(id);
    if (!campaign || !campaign.sequence) return null;

    campaign.status = 'active';
    campaign.pausedAt = null;

    // Re-schedule pending actions
    const actions = await SequenceRunner.scheduleSequenceActions(campaign.sequence, id);
    if (typeof AutomationEngine !== 'undefined') {
      await AutomationEngine.enqueueBatch(actions);
    }

    await this.updateCampaign(id, campaign);
    return campaign;
  },

  async completeCampaign(id) {
    return this.updateCampaign(id, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });
  },

  // ─── Lead Management in Campaign ──────────
  async addLeadsToCampaign(campaignId, newLeads) {
    const campaign = await this.getCampaign(campaignId);
    if (!campaign) return null;

    const existingUrls = new Set(campaign.leads.map(l => l.linkedinUrl));
    const unique = newLeads.filter(l => !existingUrls.has(l.linkedinUrl));

    campaign.leads.push(...unique);
    campaign.stats.totalLeads = campaign.leads.length;

    // If campaign is active, add them to the sequence
    if (campaign.status === 'active' && campaign.sequence) {
      const newSequenceLeads = unique.map(lead => ({
        leadId: lead.id || lead.linkedinUrl,
        name: lead.name,
        linkedinUrl: lead.linkedinUrl,
        currentStep: 0,
        status: 'pending',
        connectionNote: campaign.connectionNote,
        customMessage: campaign.customMessage
      }));
      campaign.sequence.leads.push(...newSequenceLeads);
    }

    await this.updateCampaign(campaignId, campaign);
    return campaign;
  },

  async removeLeadFromCampaign(campaignId, leadUrl) {
    const campaign = await this.getCampaign(campaignId);
    if (!campaign) return null;

    campaign.leads = campaign.leads.filter(l => l.linkedinUrl !== leadUrl);
    campaign.stats.totalLeads = campaign.leads.length;

    if (campaign.sequence) {
      campaign.sequence.leads = campaign.sequence.leads.filter(l => l.linkedinUrl !== leadUrl);
    }

    await this.updateCampaign(campaignId, campaign);
    return campaign;
  },

  // ─── Analytics ─────────────────────────────
  async updateCampaignStats(campaignId) {
    const campaign = await this.getCampaign(campaignId);
    if (!campaign || !campaign.sequence) return null;

    const seq = campaign.sequence;
    campaign.stats = {
      totalLeads: seq.leads.length,
      sent: seq.leads.filter(l => l.currentStep > 0).length,
      accepted: seq.leads.filter(l => l.status === 'completed').length,
      replied: seq.leads.filter(l => l.stoppedReason === 'replied').length,
      failed: seq.leads.filter(l => l.status === 'failed').length,
      responseRate: 0
    };

    if (campaign.stats.sent > 0) {
      campaign.stats.responseRate = Math.round(
        (campaign.stats.replied / campaign.stats.sent) * 100
      );
    }

    await this.updateCampaign(campaignId, campaign);
    return campaign.stats;
  },

  async getOverallStats() {
    const campaigns = await this.getCampaigns();
    return {
      total: campaigns.length,
      active: campaigns.filter(c => c.status === 'active').length,
      paused: campaigns.filter(c => c.status === 'paused').length,
      completed: campaigns.filter(c => c.status === 'completed').length,
      draft: campaigns.filter(c => c.status === 'draft').length,
      totalLeads: campaigns.reduce((sum, c) => sum + (c.stats?.totalLeads || 0), 0),
      totalSent: campaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0),
      totalReplied: campaigns.reduce((sum, c) => sum + (c.stats?.replied || 0), 0),
      avgResponseRate: campaigns.length > 0
        ? Math.round(campaigns.reduce((sum, c) => sum + (c.stats?.responseRate || 0), 0) / campaigns.length)
        : 0
    };
  },

  // ─── CSV Import ────────────────────────────
  parseCSV(csvText) {
    const lines = csvText.split('\n').filter(Boolean);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
    const leads = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].match(/(".*?"|[^,]+)/g) || [];
      const lead = {};

      headers.forEach((header, idx) => {
        const val = (values[idx] || '').replace(/^"|"$/g, '').trim();
        // Map common CSV header names to our schema
        if (['name', 'full name', 'fullname'].includes(header)) lead.name = val;
        else if (['first name', 'firstname', 'first'].includes(header)) lead.firstName = val;
        else if (['last name', 'lastname', 'last'].includes(header)) lead.lastName = val;
        else if (['title', 'job title', 'position', 'role'].includes(header)) lead.title = val;
        else if (['company', 'organization', 'employer'].includes(header)) lead.company = val;
        else if (['email', 'email address', 'e-mail'].includes(header)) lead.email = val;
        else if (['phone', 'phone number', 'mobile'].includes(header)) lead.phone = val;
        else if (['linkedin', 'linkedin url', 'profile url', 'url', 'linkedin profile'].includes(header)) lead.linkedinUrl = val;
        else if (['location', 'city'].includes(header)) lead.location = val;
        else if (['notes', 'note'].includes(header)) lead.notes = val;
      });

      // Build full name if only first/last given
      if (!lead.name && (lead.firstName || lead.lastName)) {
        lead.name = `${lead.firstName || ''} ${lead.lastName || ''}`.trim();
      }

      // Only include if we have at least a name or URL
      if (lead.name || lead.linkedinUrl) {
        lead.id = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        lead.savedAt = new Date().toISOString();
        lead.status = 'new';
        lead.source = 'csv_import';
        leads.push(lead);
      }
    }

    return leads;
  },

  // ─── Storage ──────────────────────────────
  async _save(campaigns) {
    return new Promise(resolve => {
      chrome.storage.local.set({ [this.STORAGE_KEY]: campaigns }, resolve);
    });
  }
};

if (typeof globalThis !== 'undefined') {
  globalThis.CampaignManager = CampaignManager;
}
if (typeof window !== 'undefined') {
  window.CampaignManager = CampaignManager;
}
