/**
 * LinkedIn Outreach Pro — CRM Manager
 * Full CRM pipeline with stages, tags, notes, and activity tracking.
 * Everything stored locally — zero limitations.
 */

const CRMManager = {
  // ─── Pipeline Stages ───────────────────────
  STAGES: [
    { id: 'new', name: 'New', icon: '🆕', color: '#00d4ff' },
    { id: 'contacted', name: 'Contacted', icon: '📤', color: '#a78bfa' },
    { id: 'connected', name: 'Connected', icon: '🤝', color: '#818cf8' },
    { id: 'replied', name: 'Replied', icon: '💬', color: '#fbbf24' },
    { id: 'meeting', name: 'Meeting', icon: '📅', color: '#fb923c' },
    { id: 'won', name: 'Won', icon: '🏆', color: '#34d399' },
    { id: 'lost', name: 'Lost', icon: '✕', color: '#f87171' }
  ],

  STORAGE_KEY: 'los_crm_data',

  // ─── Initialize ────────────────────────────
  async init() {
    const data = await this._load();
    if (!data.tags) data.tags = [];
    if (!data.activities) data.activities = [];
    await this._save(data);
  },

  // ─── Lead Stage Management ─────────────────
  async moveToStage(leadId, stageId) {
    const data = await this._load();
    if (!data.leadStages) data.leadStages = {};

    const prevStage = data.leadStages[leadId] || 'new';
    data.leadStages[leadId] = stageId;

    // Log activity
    await this._logActivity(data, {
      leadId,
      type: 'stage_change',
      from: prevStage,
      to: stageId,
      timestamp: new Date().toISOString()
    });

    await this._save(data);
    return stageId;
  },

  async getLeadStage(leadId) {
    const data = await this._load();
    return (data.leadStages || {})[leadId] || 'new';
  },

  async getLeadsByStage(stageId) {
    const data = await this._load();
    const stages = data.leadStages || {};
    const leadIds = Object.entries(stages)
      .filter(([_, stage]) => stage === stageId)
      .map(([id]) => id);
    return leadIds;
  },

  async getPipelineOverview() {
    const data = await this._load();
    const stages = data.leadStages || {};
    const counts = {};

    this.STAGES.forEach(s => { counts[s.id] = 0; });
    Object.values(stages).forEach(stageId => {
      counts[stageId] = (counts[stageId] || 0) + 1;
    });

    return this.STAGES.map(s => ({
      ...s,
      count: counts[s.id] || 0
    }));
  },

  // ─── Tags ──────────────────────────────────
  async addTag(leadId, tag) {
    const data = await this._load();
    if (!data.leadTags) data.leadTags = {};
    if (!data.leadTags[leadId]) data.leadTags[leadId] = [];

    if (!data.leadTags[leadId].includes(tag)) {
      data.leadTags[leadId].push(tag);
    }

    // Track all used tags
    if (!data.tags) data.tags = [];
    if (!data.tags.includes(tag)) {
      data.tags.push(tag);
    }

    await this._save(data);
    return data.leadTags[leadId];
  },

  async removeTag(leadId, tag) {
    const data = await this._load();
    if (!data.leadTags || !data.leadTags[leadId]) return [];
    data.leadTags[leadId] = data.leadTags[leadId].filter(t => t !== tag);
    await this._save(data);
    return data.leadTags[leadId];
  },

  async getLeadTags(leadId) {
    const data = await this._load();
    return (data.leadTags || {})[leadId] || [];
  },

  async getAllTags() {
    const data = await this._load();
    return data.tags || [];
  },

  async getLeadsByTag(tag) {
    const data = await this._load();
    const tags = data.leadTags || {};
    return Object.entries(tags)
      .filter(([_, leadTags]) => leadTags.includes(tag))
      .map(([id]) => id);
  },

  // ─── Notes ─────────────────────────────────
  async addNote(leadId, note) {
    const data = await this._load();
    if (!data.leadNotes) data.leadNotes = {};
    if (!data.leadNotes[leadId]) data.leadNotes[leadId] = [];

    const entry = {
      id: `note_${Date.now()}`,
      text: note,
      createdAt: new Date().toISOString()
    };

    data.leadNotes[leadId].unshift(entry);

    // Log activity
    await this._logActivity(data, {
      leadId,
      type: 'note_added',
      noteId: entry.id,
      timestamp: entry.createdAt
    });

    await this._save(data);
    return entry;
  },

  async getLeadNotes(leadId) {
    const data = await this._load();
    return (data.leadNotes || {})[leadId] || [];
  },

  async deleteNote(leadId, noteId) {
    const data = await this._load();
    if (!data.leadNotes || !data.leadNotes[leadId]) return;
    data.leadNotes[leadId] = data.leadNotes[leadId].filter(n => n.id !== noteId);
    await this._save(data);
  },

  // ─── Activity Timeline ────────────────────
  async _logActivity(data, activity) {
    if (!data.activities) data.activities = [];
    data.activities.unshift({
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
    });
    // Keep last 1000
    if (data.activities.length > 1000) data.activities.length = 1000;
  },

  async logAction(leadId, actionType, details = {}) {
    const data = await this._load();
    await this._logActivity(data, {
      leadId,
      type: actionType,
      details,
      timestamp: new Date().toISOString()
    });
    await this._save(data);
  },

  async getLeadActivities(leadId) {
    const data = await this._load();
    return (data.activities || []).filter(a => a.leadId === leadId);
  },

  async getRecentActivities(limit = 50) {
    const data = await this._load();
    return (data.activities || []).slice(0, limit);
  },

  // ─── Bulk Operations ──────────────────────
  async bulkMoveToStage(leadIds, stageId) {
    const data = await this._load();
    if (!data.leadStages) data.leadStages = {};
    leadIds.forEach(id => { data.leadStages[id] = stageId; });
    await this._save(data);
  },

  async bulkAddTag(leadIds, tag) {
    for (const id of leadIds) {
      await this.addTag(id, tag);
    }
  },

  async bulkDelete(leadIds) {
    const data = await this._load();
    leadIds.forEach(id => {
      delete (data.leadStages || {})[id];
      delete (data.leadTags || {})[id];
      delete (data.leadNotes || {})[id];
    });
    if (data.activities) {
      data.activities = data.activities.filter(a => !leadIds.includes(a.leadId));
    }
    await this._save(data);
  },

  // ─── Smart Filters ────────────────────────
  async filterLeads(leads, filters = {}) {
    const data = await this._load();
    let filtered = [...leads];

    // Filter by stage
    if (filters.stage) {
      const stageLeadIds = Object.entries(data.leadStages || {})
        .filter(([_, s]) => s === filters.stage)
        .map(([id]) => id);
      filtered = filtered.filter(l => stageLeadIds.includes(l.id));
    }

    // Filter by tag
    if (filters.tag) {
      const tagLeadIds = Object.entries(data.leadTags || {})
        .filter(([_, tags]) => tags.includes(filters.tag))
        .map(([id]) => id);
      filtered = filtered.filter(l => tagLeadIds.includes(l.id));
    }

    // Filter by company
    if (filters.company) {
      filtered = filtered.filter(l =>
        (l.company || '').toLowerCase().includes(filters.company.toLowerCase())
      );
    }

    // Filter by search query
    if (filters.query) {
      const q = filters.query.toLowerCase();
      filtered = filtered.filter(l =>
        (l.name || '').toLowerCase().includes(q) ||
        (l.company || '').toLowerCase().includes(q) ||
        (l.title || '').toLowerCase().includes(q)
      );
    }

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(l => new Date(l.savedAt) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(l => new Date(l.savedAt) <= new Date(filters.dateTo));
    }

    return filtered;
  },

  // ─── Get Full Lead Data ────────────────────
  async getLeadCRMData(leadId) {
    const data = await this._load();
    return {
      stage: (data.leadStages || {})[leadId] || 'new',
      tags: (data.leadTags || {})[leadId] || [],
      notes: (data.leadNotes || {})[leadId] || [],
      activities: (data.activities || []).filter(a => a.leadId === leadId)
    };
  },

  // ─── Storage ──────────────────────────────
  async _load() {
    return new Promise(resolve => {
      chrome.storage.local.get(this.STORAGE_KEY, r => {
        resolve(r[this.STORAGE_KEY] || {
          leadStages: {},
          leadTags: {},
          leadNotes: {},
          tags: [],
          activities: []
        });
      });
    });
  },

  async _save(data) {
    return new Promise(resolve => {
      chrome.storage.local.set({ [this.STORAGE_KEY]: data }, resolve);
    });
  }
};

if (typeof globalThis !== 'undefined') {
  globalThis.CRMManager = CRMManager;
}
if (typeof window !== 'undefined') {
  window.CRMManager = CRMManager;
}
