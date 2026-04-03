/**
 * LinkedIn Outreach Pro — Sequence Runner
 * Multi-step campaign sequence orchestration.
 * Handles scheduling, conditional logic, and pre-built templates.
 */

const SequenceRunner = {
  // ─── Pre-Built Sequence Templates ──────────
  TEMPLATES: [
    {
      id: 'cold_outreach',
      name: 'Cold Outreach',
      icon: '🎯',
      description: 'Visit → Wait 1d → Connect+Note → Wait 3d → Message → Wait 5d → Follow-up',
      steps: [
        { type: 'visit_profile', delay: 0, label: 'Visit Profile' },
        { type: 'wait', delay: 86400000, label: 'Wait 1 day' },
        { type: 'send_connection', delay: 0, label: 'Send Connection Request', useNote: true },
        { type: 'wait', delay: 259200000, label: 'Wait 3 days' },
        { type: 'send_message', delay: 0, label: 'Send First Message', messageTemplate: 'cold_outreach' },
        { type: 'wait', delay: 432000000, label: 'Wait 5 days' },
        { type: 'send_message', delay: 0, label: 'Follow-up Message', messageTemplate: 'followup' }
      ]
    },
    {
      id: 'job_application',
      name: 'Job Application',
      icon: '💼',
      description: 'Visit → Connect+Note → Wait 2d → Application Message → Wait 5d → Follow-up',
      steps: [
        { type: 'visit_profile', delay: 0, label: 'Visit Profile' },
        { type: 'send_connection', delay: 5000, label: 'Connect with Note', useNote: true },
        { type: 'wait', delay: 172800000, label: 'Wait 2 days' },
        { type: 'send_message', delay: 0, label: 'Application Message', messageTemplate: 'job_application' },
        { type: 'wait', delay: 432000000, label: 'Wait 5 days' },
        { type: 'send_message', delay: 0, label: 'Follow-up', messageTemplate: 'followup' }
      ]
    },
    {
      id: 'networking',
      name: 'Networking',
      icon: '🌐',
      description: 'Visit → Follow → Wait 1d → Connect+Note → Wait 3d → Chat Request',
      steps: [
        { type: 'visit_profile', delay: 0, label: 'Visit Profile' },
        { type: 'follow', delay: 5000, label: 'Follow' },
        { type: 'wait', delay: 86400000, label: 'Wait 1 day' },
        { type: 'send_connection', delay: 0, label: 'Connect with Note', useNote: true },
        { type: 'wait', delay: 259200000, label: 'Wait 3 days' },
        { type: 'send_message', delay: 0, label: 'Chat Request', messageTemplate: 'networking' }
      ]
    },
    {
      id: 'recruiter_response',
      name: 'Recruiter Response',
      icon: '📩',
      description: 'Visit → Connect+Note → Wait 1d → Thank You + Interest Message',
      steps: [
        { type: 'visit_profile', delay: 0, label: 'Visit Profile' },
        { type: 'send_connection', delay: 5000, label: 'Connect with Note', useNote: true },
        { type: 'wait', delay: 86400000, label: 'Wait 1 day' },
        { type: 'send_message', delay: 0, label: 'Interest Message', messageTemplate: 'recruiter_response' }
      ]
    },
    {
      id: 'content_engagement',
      name: 'Content Engagement',
      icon: '❤️',
      description: 'Like Post → Comment → Wait 1d → Connect+Note → Wait 3d → Message',
      steps: [
        { type: 'like_post', delay: 0, label: 'Like Their Post' },
        { type: 'comment_post', delay: 5000, label: 'Leave a Comment' },
        { type: 'wait', delay: 86400000, label: 'Wait 1 day' },
        { type: 'send_connection', delay: 0, label: 'Connect with Note', useNote: true },
        { type: 'wait', delay: 259200000, label: 'Wait 3 days' },
        { type: 'send_message', delay: 0, label: 'Send Message', messageTemplate: 'cold_outreach' }
      ]
    },
    {
      id: 'warm_followup',
      name: 'Warm Follow-Up',
      icon: '🔥',
      description: 'Visit → Endorse Skills → Wait 1d → Connect+Note → Wait 2d → Message',
      steps: [
        { type: 'visit_profile', delay: 0, label: 'Visit Profile' },
        { type: 'endorse', delay: 5000, label: 'Endorse Top Skills', data: { count: 3 } },
        { type: 'wait', delay: 86400000, label: 'Wait 1 day' },
        { type: 'send_connection', delay: 0, label: 'Connect with Note', useNote: true },
        { type: 'wait', delay: 172800000, label: 'Wait 2 days' },
        { type: 'send_message', delay: 0, label: 'Send Message', messageTemplate: 'cold_outreach' }
      ]
    }
  ],

  // ─── Create a Sequence Instance ────────────
  createSequence(templateId, leads, customSteps = null) {
    const template = customSteps ? { steps: customSteps } : this.TEMPLATES.find(t => t.id === templateId);
    if (!template) throw new Error(`Template not found: ${templateId}`);

    return {
      id: `seq_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      templateId: templateId || 'custom',
      templateName: template.name || 'Custom Sequence',
      steps: template.steps.map((step, idx) => ({
        ...step,
        index: idx
      })),
      leads: leads.map(lead => ({
        leadId: lead.id || lead.linkedinUrl,
        name: lead.name,
        linkedinUrl: lead.linkedinUrl,
        currentStep: 0,
        status: 'pending', // pending, active, completed, paused, failed, stopped
        startedAt: null,
        completedAt: null,
        lastActionAt: null,
        nextActionAt: null,
        error: null
      })),
      status: 'draft', // draft, active, paused, completed
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      stats: {
        totalLeads: leads.length,
        completed: 0,
        failed: 0,
        active: 0,
        pending: leads.length
      }
    };
  },

  // ─── Schedule Next Actions for a Sequence ──
  async scheduleSequenceActions(sequence, campaignId) {
    const actions = [];
    const now = Date.now();

    for (const lead of sequence.leads) {
      if (lead.status !== 'pending' && lead.status !== 'active') continue;

      const step = sequence.steps[lead.currentStep];
      if (!step) {
        lead.status = 'completed';
        lead.completedAt = new Date().toISOString();
        continue;
      }

      // Skip 'wait' steps — calculate delay for next action
      if (step.type === 'wait') {
        lead.currentStep++;
        lead.nextActionAt = new Date(now + step.delay).toISOString();
        continue;
      }

      // Create the action
      const scheduledFor = lead.nextActionAt || new Date().toISOString();
      actions.push({
        type: step.type,
        data: {
          url: lead.linkedinUrl,
          ...step.data,
          note: step.useNote ? lead.connectionNote : undefined,
          message: lead.customMessage || undefined
        },
        campaignId,
        sequenceId: sequence.id,
        leadId: lead.leadId,
        stepIndex: lead.currentStep,
        scheduledFor,
        priority: 5
      });

      lead.status = 'active';
      lead.startedAt = lead.startedAt || new Date().toISOString();
    }

    return actions;
  },

  // ─── Advance a Lead to Next Step ───────────
  advanceLead(sequence, leadId) {
    const lead = sequence.leads.find(l => l.leadId === leadId);
    if (!lead) return null;

    lead.currentStep++;
    lead.lastActionAt = new Date().toISOString();

    if (lead.currentStep >= sequence.steps.length) {
      lead.status = 'completed';
      lead.completedAt = new Date().toISOString();
      sequence.stats.completed++;
      sequence.stats.active = Math.max(0, sequence.stats.active - 1);
    } else {
      // Calculate next action time based on wait steps
      let delay = 0;
      let nextStep = lead.currentStep;
      while (nextStep < sequence.steps.length && sequence.steps[nextStep].type === 'wait') {
        delay += sequence.steps[nextStep].delay;
        nextStep++;
        lead.currentStep = nextStep;
      }
      lead.nextActionAt = new Date(Date.now() + delay).toISOString();
    }

    // Update sequence stats
    this._updateStats(sequence);
    return lead;
  },

  // ─── Stop a Lead in a Sequence ─────────────
  stopLead(sequence, leadId, reason = 'replied') {
    const lead = sequence.leads.find(l => l.leadId === leadId);
    if (!lead) return null;

    lead.status = 'stopped';
    lead.stoppedReason = reason;
    lead.completedAt = new Date().toISOString();

    this._updateStats(sequence);
    return lead;
  },

  // ─── Update Stats ──────────────────────────
  _updateStats(sequence) {
    sequence.stats = {
      totalLeads: sequence.leads.length,
      completed: sequence.leads.filter(l => l.status === 'completed').length,
      failed: sequence.leads.filter(l => l.status === 'failed').length,
      active: sequence.leads.filter(l => l.status === 'active').length,
      pending: sequence.leads.filter(l => l.status === 'pending').length,
      stopped: sequence.leads.filter(l => l.status === 'stopped').length
    };

    // Check if all leads are done
    if (sequence.stats.pending === 0 && sequence.stats.active === 0) {
      sequence.status = 'completed';
      sequence.completedAt = new Date().toISOString();
    }
  },

  // ─── Get Template Info ─────────────────────
  getTemplates() {
    return this.TEMPLATES.map(t => ({
      id: t.id,
      name: t.name,
      icon: t.icon,
      description: t.description,
      stepCount: t.steps.length,
      steps: t.steps.map(s => s.label)
    }));
  },

  getTemplate(id) {
    return this.TEMPLATES.find(t => t.id === id);
  },

  // ─── Format Delay ──────────────────────────
  formatDelay(ms) {
    if (ms < 3600000) return `${Math.round(ms / 60000)} min`;
    if (ms < 86400000) return `${Math.round(ms / 3600000)} hours`;
    return `${Math.round(ms / 86400000)} days`;
  }
};

if (typeof globalThis !== 'undefined') {
  globalThis.SequenceRunner = SequenceRunner;
}
if (typeof window !== 'undefined') {
  window.SequenceRunner = SequenceRunner;
}
