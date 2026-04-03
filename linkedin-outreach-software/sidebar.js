/**
 * LinkedIn Outreach Pro — Sidebar Logic
 * Handles Dashboard, Campaigns, Pipeline, Contacts, Outreach tabs,
 * campaign creation wizard, automation controls, and settings.
 */

(function () {
  'use strict';

  // ─── State ────────────────────────────────
  let currentProfile = null;
  let currentJob = null;
  let currentPageType = null;
  let selectedTemplate = null;
  let selectedSequenceTemplate = 'cold_outreach';
  let settings = {};
  let allLeads = [];
  let allCampaigns = [];
  let campaignSelectedLeads = new Set();
  let csvImportedLeads = [];
  let currentFilter = 'all';

  const DEFAULT_TEMPLATES = [
    { id: 'cold_outreach', name: 'Cold Outreach', icon: '🎯', prompt: `Write a concise, professional cold outreach email to {name} who is {title} at {company}. My name is {userName} and I am {userTitle} at {userCompany}. The email should be personalized based on their profile and demonstrate genuine interest. Keep it under 150 words. Be warm but professional.` },
    { id: 'linkedin_connect', name: 'Connection', icon: '🤝', prompt: `Write a short LinkedIn connection request message (max 300 characters) to {name}, {title} at {company}. My name is {userName}, {userTitle} at {userCompany}. Make it personal and genuine. No generic messages.` },
    { id: 'job_application', name: 'Job Apply', icon: '💼', prompt: `Write a tailored cover email for applying to the {jobTitle} position at {company}. The job description mentions: {jobDescription}. My name is {userName}, I am {userTitle} at {userCompany}. The recruiter/hiring manager is {name}. Make it compelling, specific to the role, and under 200 words.` },
    { id: 'recruiter_response', name: 'Recruiter', icon: '📩', prompt: `Write a professional response to a recruiter named {name} from {company} about the {jobTitle} role. Express genuine interest, highlight relevant experience. My name is {userName}, {userTitle} at {userCompany}. Keep it under 150 words.` },
    { id: 'followup', name: 'Follow-Up', icon: '🔄', prompt: `Write a follow-up email to {name}, {title} at {company}. My name is {userName}, {userTitle} at {userCompany}. Reference our previous interaction and provide value. Be brief (under 100 words).` },
    { id: 'networking', name: 'Networking', icon: '🌐', prompt: `Write a networking outreach message to {name}, {title} at {company}. I'm {userName}, {userTitle} at {userCompany}. Ask for an informational conversation. Be genuine, keep it under 120 words.` }
  ];

  // ─── DOM Elements ─────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ─── Init ─────────────────────────────────
  async function init() {
    await loadSettings();
    setupTabs();
    setupTemplateGrid();
    setupEventListeners();
    setupCampaignCreator();
    loadLeads();
    loadCampaigns();
    loadDashboard();
    loadPipeline();
    listenForUpdates();
    requestPageDataWithRetry(0);
  }

  function requestPageDataWithRetry(attempt) {
    requestPageData().then(gotData => {
      if (!gotData && attempt < 6) {
        setTimeout(() => requestPageDataWithRetry(attempt + 1), 1500);
      }
    });
  }

  // ─── Settings ─────────────────────────────
  async function loadSettings() {
    settings = await sendMessage('GET_SETTINGS') || {};
    updateAIStatus();
  }

  function updateAIStatus() {
    const badge = $('#ai-badge');
    const indicator = $('#ai-indicator');

    if (settings.openaiApiKey) {
      if (badge) badge.textContent = 'AI POWERED';
      if (indicator) {
        indicator.className = 'ai-indicator';
        indicator.innerHTML = '<span class="ai-dot"></span> AI Ready';
      }
    } else {
      if (badge) badge.textContent = 'UNLIMITED';
      if (indicator) {
        indicator.className = 'ai-indicator no-key';
        indicator.innerHTML = '<span class="ai-dot"></span> No API Key';
      }
    }
  }

  // ─── Tabs ─────────────────────────────────
  function setupTabs() {
    $$('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.tab').forEach(t => t.classList.remove('active'));
        $$('.tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const panel = $(`#panel-${tab.dataset.tab}`);
        if (panel) panel.classList.add('active');

        // Refresh data when switching tabs
        if (tab.dataset.tab === 'campaigns') loadCampaigns();
        if (tab.dataset.tab === 'pipeline') loadPipeline();
        if (tab.dataset.tab === 'contacts') loadLeads();
        if (tab.dataset.tab === 'dashboard') loadDashboard();
      });
    });
  }

  // ════════════════════════════════════════════
  // DASHBOARD
  // ════════════════════════════════════════════

  async function loadDashboard() {
    // Load leads count
    const leads = await sendMessage('GET_LEADS') || [];
    $('#dash-leads').textContent = leads.length;

    // Load campaign stats
    const campaigns = await sendMessage('GET_CAMPAIGNS') || [];
    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    $('#dash-campaigns').textContent = activeCampaigns.length;

    // Overall stats
    const stats = await sendMessage('GET_STATS') || {};
    $('#dash-sent').textContent = stats.messagesDrafted || 0;

    // Response rate
    const totalSent = campaigns.reduce((s, c) => s + (c.stats?.sent || 0), 0);
    const totalReplied = campaigns.reduce((s, c) => s + (c.stats?.replied || 0), 0);
    const rate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0;
    $('#dash-rate').textContent = rate + '%';

    // Daily counters
    loadDailyCounters();

    // Automation status
    updateAutoStatus();

    // Recent activity
    loadRecentActivity();
  }

  async function loadDailyCounters() {
    const counters = await sendMessage('GET_DAILY_COUNTERS') || {};
    const limits = await sendMessage('GET_AUTOMATION_LIMITS') || {};

    const connections = counters.connectionsPerDay || 0;
    const messages = counters.messagesPerDay || 0;
    const visits = counters.profileVisitsPerDay || 0;
    const connLimit = limits.connectionsPerDay || 50;
    const msgLimit = limits.messagesPerDay || 100;
    const visitLimit = limits.profileVisitsPerDay || 150;

    $('#counter-connections').style.width = Math.min(100, (connections / connLimit) * 100) + '%';
    $('#counter-connections-val').textContent = `${connections}/${connLimit}`;
    $('#counter-messages').style.width = Math.min(100, (messages / msgLimit) * 100) + '%';
    $('#counter-messages-val').textContent = `${messages}/${msgLimit}`;
    $('#counter-visits').style.width = Math.min(100, (visits / visitLimit) * 100) + '%';
    $('#counter-visits-val').textContent = `${visits}/${visitLimit}`;
  }

  function updateAutoStatus() {
    const dot = $('#auto-status-dot');
    const label = $('#auto-status-label');
    const detail = $('#auto-status-detail');
    const btn = $('#btn-auto-toggle');

    // Check with background
    sendMessage('GET_AUTO_STATUS').then(status => {
      if (!status) {
        dot.className = 'auto-status-indicator';
        label.textContent = 'Idle';
        detail.textContent = 'No active automations';
        btn.className = 'btn-auto-toggle';
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        return;
      }

      if (status.isRunning && !status.isPaused) {
        dot.className = 'auto-status-indicator running';
        label.textContent = 'Running';
        detail.textContent = `${status.queueLength} actions in queue`;
        btn.className = 'btn-auto-toggle running';
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
      } else if (status.isPaused) {
        dot.className = 'auto-status-indicator paused';
        label.textContent = 'Paused';
        detail.textContent = `${status.queueLength} actions pending`;
        btn.className = 'btn-auto-toggle';
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
      } else {
        dot.className = 'auto-status-indicator';
        label.textContent = 'Idle';
        detail.textContent = `${status.queueLength || 0} queued actions`;
        btn.className = 'btn-auto-toggle';
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
      }
    });
  }

  async function loadRecentActivity() {
    const activities = await sendMessage('GET_RECENT_ACTIVITIES') || [];
    const feed = $('#activity-feed');

    if (!activities.length) {
      feed.innerHTML = '<div class="empty-state small"><span class="empty-icon">📊</span><p>No activity yet. Start a campaign to see updates here.</p></div>';
      return;
    }

    feed.innerHTML = '';
    activities.slice(0, 10).forEach(act => {
      const icons = {
        'stage_change': '📋', 'note_added': '📝', 'send_connection': '🤝',
        'send_message': '💬', 'visit_profile': '👁️', 'follow': '➕',
        'endorse': '⭐', 'campaign_started': '🚀'
      };
      const icon = icons[act.type] || '⚡';
      const time = timeAgo(act.timestamp);

      const el = document.createElement('div');
      el.className = 'activity-item';
      el.innerHTML = `
        <div class="activity-icon">${icon}</div>
        <div class="activity-text">${formatActivity(act)}</div>
        <span class="activity-time">${time}</span>
      `;
      feed.appendChild(el);
    });
  }

  function formatActivity(act) {
    switch (act.type) {
      case 'stage_change': return `Lead moved to <strong>${act.to}</strong>`;
      case 'note_added': return `Note added`;
      case 'send_connection': return `Connection request sent`;
      case 'send_message': return `Message sent`;
      case 'visit_profile': return `Profile visited`;
      case 'follow': return `Profile followed`;
      case 'endorse': return `Skills endorsed`;
      case 'campaign_started': return `Campaign <strong>${act.details?.name || ''}</strong> started`;
      default: return act.type.replace(/_/g, ' ');
    }
  }

  // ════════════════════════════════════════════
  // CAMPAIGNS
  // ════════════════════════════════════════════

  async function loadCampaigns() {
    allCampaigns = await sendMessage('GET_CAMPAIGNS') || [];
    renderCampaigns(allCampaigns);
  }

  function renderCampaigns(campaigns) {
    const list = $('#campaign-list');
    const empty = $('#campaigns-empty');

    if (!campaigns.length) {
      list.innerHTML = '';
      list.appendChild(empty);
      empty.style.display = 'flex';
      return;
    }

    empty.style.display = 'none';
    list.innerHTML = '';

    campaigns.forEach(camp => {
      const progress = camp.stats?.totalLeads > 0
        ? Math.round((camp.stats.sent / camp.stats.totalLeads) * 100)
        : 0;

      const card = document.createElement('div');
      card.className = 'campaign-card';
      card.dataset.status = camp.status;
      card.innerHTML = `
        <div class="campaign-card-header">
          <span class="campaign-name">${camp.name}</span>
          <span class="campaign-status ${camp.status}">${camp.status}</span>
        </div>
        <div class="campaign-meta">
          <span>👥 ${camp.stats?.totalLeads || 0} leads</span>
          <span>📤 ${camp.stats?.sent || 0} sent</span>
          <span>💬 ${camp.stats?.replied || 0} replied</span>
        </div>
        <div class="campaign-progress">
          <div class="campaign-progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="campaign-actions">
          ${camp.status === 'draft' ? `<button data-action="start" data-id="${camp.id}">▶ Start</button>` : ''}
          ${camp.status === 'active' ? `<button data-action="pause" data-id="${camp.id}">⏸ Pause</button>` : ''}
          ${camp.status === 'paused' ? `<button data-action="resume" data-id="${camp.id}">▶ Resume</button>` : ''}
          <button data-action="delete" data-id="${camp.id}" class="danger">✕</button>
        </div>
      `;

      // Action handlers
      card.querySelectorAll('button[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleCampaignAction(btn.dataset.action, btn.dataset.id);
        });
      });

      list.appendChild(card);
    });
  }

  async function handleCampaignAction(action, id) {
    switch (action) {
      case 'start':
        await sendMessage('START_CAMPAIGN', { id });
        showToast('Campaign started! 🚀', 'success');
        break;
      case 'pause':
        await sendMessage('PAUSE_CAMPAIGN', { id });
        showToast('Campaign paused', 'info');
        break;
      case 'resume':
        await sendMessage('RESUME_CAMPAIGN', { id });
        showToast('Campaign resumed', 'success');
        break;
      case 'delete':
        if (confirm('Delete this campaign?')) {
          await sendMessage('DELETE_CAMPAIGN', { id });
          showToast('Campaign deleted', 'info');
        }
        break;
    }
    loadCampaigns();
    loadDashboard();
  }

  // ─── Campaign Creator ────────────────────
  function setupCampaignCreator() {
    // Open creator
    $('#btn-new-campaign')?.addEventListener('click', openCampaignCreator);
    $('#btn-create-first-campaign')?.addEventListener('click', openCampaignCreator);

    // Close creator
    $('#btn-close-creator')?.addEventListener('click', closeCampaignCreator);

    // Step navigation
    $('#btn-creator-next-1')?.addEventListener('click', () => goToCreatorStep(2));
    $('#btn-creator-back-2')?.addEventListener('click', () => goToCreatorStep(1));
    $('#btn-creator-next-2')?.addEventListener('click', () => goToCreatorStep(3));
    $('#btn-creator-back-3')?.addEventListener('click', () => goToCreatorStep(2));

    // Connection note char count
    $('#campaign-conn-note')?.addEventListener('input', () => {
      const val = $('#campaign-conn-note').value;
      $('#conn-note-count').textContent = `${val.length}/300`;
    });

    // Lead source tabs
    $$('.lead-source-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.lead-source-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        $$('.lead-source-panel').forEach(p => p.style.display = 'none');
        $(`#source-${btn.dataset.source}`).style.display = 'block';
      });
    });

    // Select all leads
    $('#select-all-leads')?.addEventListener('change', (e) => {
      const checked = e.target.checked;
      $$('#lead-select-list input[type="checkbox"]').forEach(cb => {
        cb.checked = checked;
        const leadId = cb.dataset.leadId;
        if (checked) campaignSelectedLeads.add(leadId);
        else campaignSelectedLeads.delete(leadId);
      });
      updateSelectedCount();
    });

    // CSV drop zone
    const dropZone = $('#csv-drop-zone');
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleCSVFile(file);
      });
    }

    $('#csv-file-input')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleCSVFile(file);
    });

    // Import from search
    $('#btn-import-search')?.addEventListener('click', importFromSearch);

    // Launch campaign
    $('#btn-launch-campaign')?.addEventListener('click', launchCampaign);
  }

  function openCampaignCreator() {
    $('#campaign-creator').style.display = 'flex';
    campaignSelectedLeads.clear();
    csvImportedLeads = [];
    goToCreatorStep(1);
  }

  function closeCampaignCreator() {
    $('#campaign-creator').style.display = 'none';
  }

  async function goToCreatorStep(step) {
    $$('.creator-step').forEach(s => s.style.display = 'none');
    $(`#creator-step-${step}`).style.display = 'block';

    if (step === 2) {
      // Render sequence templates
      renderSequenceTemplates();
    }

    if (step === 3) {
      // Render lead selection
      await renderLeadSelection();
    }
  }

  function renderSequenceTemplates() {
    const container = $('#sequence-templates');
    if (!container) return;
    container.innerHTML = '';

    const templates = typeof SequenceRunner !== 'undefined'
      ? SequenceRunner.getTemplates()
      : [
          { id: 'cold_outreach', name: 'Cold Outreach', icon: '🎯', description: 'Visit → Connect → Message → Follow-up' },
          { id: 'job_application', name: 'Job Application', icon: '💼', description: 'Visit → Connect → Apply → Follow-up' },
          { id: 'networking', name: 'Networking', icon: '🌐', description: 'Visit → Follow → Connect → Chat' },
          { id: 'recruiter_response', name: 'Recruiter Response', icon: '📩', description: 'Visit → Connect → Interest Message' },
          { id: 'content_engagement', name: 'Content Engagement', icon: '❤️', description: 'Like → Comment → Connect → Message' },
          { id: 'warm_followup', name: 'Warm Follow-Up', icon: '🔥', description: 'Visit → Endorse → Connect → Message' }
        ];

    templates.forEach(t => {
      const el = document.createElement('div');
      el.className = `seq-template ${t.id === selectedSequenceTemplate ? 'selected' : ''}`;
      el.innerHTML = `
        <span class="seq-template-icon">${t.icon}</span>
        <div class="seq-template-info">
          <div class="seq-template-name">${t.name}</div>
          <div class="seq-template-desc">${t.description}</div>
        </div>
      `;
      el.addEventListener('click', () => {
        $$('.seq-template').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
        selectedSequenceTemplate = t.id;
      });
      container.appendChild(el);
    });
  }

  async function renderLeadSelection() {
    const leads = await sendMessage('GET_LEADS') || [];
    const list = $('#lead-select-list');
    list.innerHTML = '';

    if (!leads.length) {
      list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px;font-size:12px;">No saved leads. Save leads from LinkedIn profiles first, or import a CSV.</p>';
      return;
    }

    leads.forEach(lead => {
      const el = document.createElement('div');
      el.className = 'lead-select-item';
      el.innerHTML = `
        <input type="checkbox" data-lead-id="${lead.id}" ${campaignSelectedLeads.has(lead.id) ? 'checked' : ''}>
        <div>
          <div class="lead-select-name">${lead.name || '—'}</div>
          <div class="lead-select-detail">${lead.company || ''} ${lead.title ? '• ' + lead.title : ''}</div>
        </div>
      `;

      const cb = el.querySelector('input');
      cb.addEventListener('change', () => {
        if (cb.checked) campaignSelectedLeads.add(lead.id);
        else campaignSelectedLeads.delete(lead.id);
        updateSelectedCount();
      });

      el.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT') {
          cb.checked = !cb.checked;
          cb.dispatchEvent(new Event('change'));
        }
      });

      list.appendChild(el);
    });

    updateSelectedCount();
  }

  function updateSelectedCount() {
    const total = campaignSelectedLeads.size + csvImportedLeads.length;
    $('#selected-count').textContent = `${total} selected`;
  }

  function handleCSVFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      if (typeof CampaignManager !== 'undefined') {
        csvImportedLeads = CampaignManager.parseCSV(text);
      } else {
        // Basic CSV parsing fallback
        const lines = text.split('\n').filter(Boolean);
        csvImportedLeads = lines.slice(1).map((line, i) => {
          const parts = line.split(',').map(p => p.replace(/"/g, '').trim());
          return { id: `csv_${Date.now()}_${i}`, name: parts[0] || '', linkedinUrl: parts[1] || '' };
        }).filter(l => l.name);
      }

      $('#csv-preview').style.display = 'block';
      $('#csv-preview-text').textContent = `${csvImportedLeads.length} leads imported from CSV`;
      updateSelectedCount();
    };
    reader.readAsText(file);
  }

  async function importFromSearch() {
    try {
      const tabs = await chrome.tabs.query({ url: '*://*.linkedin.com/*' });
      if (!tabs.length) {
        showToast('No LinkedIn tab found', 'error');
        return;
      }

      chrome.tabs.sendMessage(tabs[0].id, { type: 'SCRAPE_SEARCH_RESULTS' }, (results) => {
        if (!results || !results.length) {
          showToast('No search results found on current page', 'error');
          return;
        }

        csvImportedLeads = results.map(r => ({
          ...r,
          id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          source: 'linkedin_search'
        }));

        showToast(`${csvImportedLeads.length} leads imported from search!`, 'success');
        updateSelectedCount();
      });
    } catch (e) {
      showToast('Failed to import from search', 'error');
    }
  }

  async function launchCampaign() {
    const name = $('#campaign-name')?.value?.trim();
    if (!name) {
      showToast('Please enter a campaign name', 'error');
      goToCreatorStep(1);
      return;
    }

    // Gather selected leads
    const savedLeads = await sendMessage('GET_LEADS') || [];
    const selected = savedLeads.filter(l => campaignSelectedLeads.has(l.id));
    const allSelectedLeads = [...selected, ...csvImportedLeads];

    if (!allSelectedLeads.length) {
      showToast('Please select or import at least one lead', 'error');
      return;
    }

    // Create campaign
    const campaign = await sendMessage('CREATE_CAMPAIGN', {
      name,
      description: $('#campaign-desc')?.value?.trim() || '',
      sequenceTemplateId: selectedSequenceTemplate,
      connectionNote: $('#campaign-conn-note')?.value?.trim() || '',
      leads: allSelectedLeads
    });

    if (campaign) {
      showToast(`Campaign "${name}" created with ${allSelectedLeads.length} leads!`, 'success');
      closeCampaignCreator();
      loadCampaigns();
      loadDashboard();
    }
  }

  // ════════════════════════════════════════════
  // PIPELINE
  // ════════════════════════════════════════════

  async function loadPipeline() {
    const overview = await sendMessage('GET_PIPELINE_OVERVIEW') || [];
    const leads = await sendMessage('GET_LEADS') || [];
    const crmData = await sendMessage('GET_ALL_CRM_DATA') || {};
    const container = $('#pipeline-stages');
    container.innerHTML = '';

    const stages = overview.length ? overview : [
      { id: 'new', name: 'New', icon: '🆕', count: 0 },
      { id: 'contacted', name: 'Contacted', icon: '📤', count: 0 },
      { id: 'connected', name: 'Connected', icon: '🤝', count: 0 },
      { id: 'replied', name: 'Replied', icon: '💬', count: 0 },
      { id: 'meeting', name: 'Meeting', icon: '📅', count: 0 },
      { id: 'won', name: 'Won', icon: '🏆', count: 0 },
      { id: 'lost', name: 'Lost', icon: '✕', count: 0 }
    ];

    // Count leads per stage
    const stageCounts = {};
    stages.forEach(s => { stageCounts[s.id] = 0; });

    const leadStages = crmData.leadStages || {};
    leads.forEach(lead => {
      const stage = leadStages[lead.id] || lead.status || 'new';
      if (stageCounts[stage] !== undefined) stageCounts[stage]++;
      else stageCounts['new']++;
    });

    stages.forEach(stage => {
      const count = stageCounts[stage.id] || 0;
      const stageEl = document.createElement('div');
      stageEl.className = 'pipeline-stage';
      stageEl.innerHTML = `
        <div class="pipeline-stage-header" data-stage="${stage.id}">
          <div class="pipeline-stage-left">
            <span class="pipeline-stage-icon">${stage.icon}</span>
            <span class="pipeline-stage-name">${stage.name}</span>
          </div>
          <span class="pipeline-stage-count">${count}</span>
        </div>
        <div class="pipeline-stage-leads" id="pipeline-${stage.id}"></div>
      `;

      // Toggle expand
      stageEl.querySelector('.pipeline-stage-header').addEventListener('click', () => {
        stageEl.classList.toggle('expanded');
        if (stageEl.classList.contains('expanded')) {
          renderPipelineLeads(stage.id, leads, leadStages);
        }
      });

      container.appendChild(stageEl);
    });
  }

  function renderPipelineLeads(stageId, leads, leadStages) {
    const container = $(`#pipeline-${stageId}`);
    container.innerHTML = '';

    const stageLeads = leads.filter(l => {
      const s = leadStages[l.id] || l.status || 'new';
      return s === stageId;
    });

    if (!stageLeads.length) {
      container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:10px;font-size:11px;">No leads in this stage</p>';
      return;
    }

    stageLeads.forEach(lead => {
      const initial = (lead.firstName?.[0] || lead.name?.[0] || '?').toUpperCase();
      const el = document.createElement('div');
      el.className = 'pipeline-lead';
      el.innerHTML = `
        <div class="pipeline-lead-avatar">${initial}</div>
        <div class="pipeline-lead-info">
          <div class="pipeline-lead-name">${lead.name || '—'}</div>
          <div class="pipeline-lead-company">${lead.company || ''}</div>
        </div>
      `;

      el.addEventListener('click', () => {
        currentProfile = lead;
        renderPageData();
        $('#tab-dashboard')?.click();
      });

      container.appendChild(el);
    });
  }

  // ════════════════════════════════════════════
  // CONTACTS (Leads)
  // ════════════════════════════════════════════

  async function loadLeads() {
    allLeads = await sendMessage('GET_LEADS') || [];
    renderLeads(allLeads);
  }

  function renderLeads(leads) {
    const list = $('#leads-list');
    const empty = $('#leads-empty');
    const count = $('#lead-count');

    if (!list) return;

    // Apply filter
    let filtered = leads;
    if (currentFilter !== 'all') {
      filtered = leads.filter(l => (l.status || 'new') === currentFilter);
    }

    count.textContent = `${filtered.length} contact${filtered.length !== 1 ? 's' : ''}`;

    if (!filtered.length) {
      list.innerHTML = '';
      list.appendChild(empty);
      empty.style.display = 'flex';
      return;
    }

    empty.style.display = 'none';
    list.innerHTML = '';

    filtered.forEach(lead => {
      const item = document.createElement('div');
      item.className = 'lead-item';
      const initials = (lead.firstName?.[0] || lead.name?.[0] || '?').toUpperCase();
      const statusClass = `status-${lead.status || 'new'}`;

      item.innerHTML = `
        <div class="lead-avatar-sm">${initials}</div>
        <div class="lead-details">
          <div class="lead-name">${lead.name || '—'}</div>
          <div class="lead-title-text">${lead.company || ''} ${lead.title ? '• ' + lead.title : ''}</div>
        </div>
        <span class="lead-status ${statusClass}">${lead.status || 'new'}</span>
        <button class="lead-delete" data-id="${lead.id}" title="Delete">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      `;

      item.querySelector('.lead-delete').addEventListener('click', async (e) => {
        e.stopPropagation();
        await sendMessage('DELETE_LEAD', { id: lead.id });
        showToast('Lead deleted', 'info');
        loadLeads();
      });

      item.addEventListener('click', () => {
        currentProfile = lead;
        renderPageData();
        $('#tab-dashboard')?.click();
      });

      list.appendChild(item);
    });
  }

  function filterLeads() {
    const query = $('#leads-search-input')?.value?.toLowerCase() || '';
    const filtered = allLeads.filter(l =>
      (l.name || '').toLowerCase().includes(query) ||
      (l.company || '').toLowerCase().includes(query) ||
      (l.title || '').toLowerCase().includes(query)
    );
    renderLeads(filtered);
  }

  async function exportLeads() {
    const result = await sendMessage('EXPORT_CSV');
    if (!result || !result.csv) {
      showToast('No leads to export', 'error');
      return;
    }
    const blob = new Blob([result.csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkedin_leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Leads exported!', 'success');
  }

  // ════════════════════════════════════════════
  // TEMPLATE GRID & AI OUTREACH
  // ════════════════════════════════════════════

  function setupTemplateGrid() {
    const grid = $('#template-grid');
    if (!grid) return;
    grid.innerHTML = '';

    DEFAULT_TEMPLATES.forEach(t => {
      const card = document.createElement('div');
      card.className = 'template-card';
      card.dataset.templateId = t.id;
      card.innerHTML = `
        <span class="template-icon">${t.icon}</span>
        <span class="template-name">${t.name}</span>
      `;
      card.addEventListener('click', () => selectTemplate(t, card));
      grid.appendChild(card);
    });

    selectTemplate(DEFAULT_TEMPLATES[0], grid.querySelector('.template-card'));
  }

  function selectTemplate(template, cardEl) {
    $$('.template-card').forEach(c => c.classList.remove('active'));
    if (cardEl) cardEl.classList.add('active');
    selectedTemplate = template;

    const ctx = $('#composer-context');
    if (ctx) {
      if (currentProfile) {
        ctx.textContent = `Drafting ${template.name.toLowerCase()} for ${currentProfile.name || 'unknown'} at ${currentProfile.company || 'unknown company'}`;
      } else if (currentJob) {
        ctx.textContent = `Drafting ${template.name.toLowerCase()} for ${currentJob.jobTitle || 'job'} at ${currentJob.company || 'unknown company'}`;
      } else {
        ctx.textContent = `Select a profile or job listing to personalize your ${template.name.toLowerCase()} message.`;
      }
    }
  }

  // ─── Event Listeners ──────────────────────
  function setupEventListeners() {
    $('#btn-generate')?.addEventListener('click', generateMessage);
    $('#btn-regenerate')?.addEventListener('click', generateMessage);
    $('#btn-copy')?.addEventListener('click', copyMessage);
    $('#btn-copy-email')?.addEventListener('click', openAsEmail);
    $('#btn-save-lead')?.addEventListener('click', saveLead);

    $('#btn-draft-outreach')?.addEventListener('click', () => { $('#tab-outreach')?.click(); });
    $('#btn-draft-recruiter')?.addEventListener('click', () => {
      const jobTemplate = DEFAULT_TEMPLATES.find(t => t.id === 'job_application');
      const card = $('[data-template-id="job_application"]');
      if (jobTemplate && card) selectTemplate(jobTemplate, card);
      $('#tab-outreach')?.click();
    });

    $('#btn-add-to-campaign')?.addEventListener('click', () => {
      $('#tab-campaigns')?.click();
      openCampaignCreator();
    });

    $('#btn-settings')?.addEventListener('click', openSettings);
    $('#btn-close-settings')?.addEventListener('click', closeSettings);
    $('#btn-save-settings')?.addEventListener('click', saveSettings);

    $('#btn-refresh')?.addEventListener('click', async () => {
      const tabs = await chrome.tabs.query({ url: '*://*.linkedin.com/*' });
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'REFRESH_DATA' }, () => {
          setTimeout(() => requestPageDataWithRetry(0), 1000);
        });
      }
    });

    $('#btn-export')?.addEventListener('click', exportLeads);
    $('#leads-search-input')?.addEventListener('input', filterLeads);

    // Filter chips
    $$('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        $$('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.dataset.filter;
        renderLeads(allLeads);
      });
    });

    // Automation toggle
    $('#btn-auto-toggle')?.addEventListener('click', async () => {
      const status = await sendMessage('GET_AUTO_STATUS');
      if (status?.isRunning && !status?.isPaused) {
        await sendMessage('PAUSE_AUTOMATION');
        showToast('Automation paused', 'info');
      } else {
        await sendMessage('START_AUTOMATION');
        showToast('Automation started! 🚀', 'success');
      }
      setTimeout(updateAutoStatus, 500);
    });
  }

  // ─── Page Data ────────────────────────────
  async function requestPageData() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs.find(t => t.url && t.url.includes('linkedin.com'));

      if (!tab) {
        const allTabs = await chrome.tabs.query({ url: '*://*.linkedin.com/*' });
        if (allTabs.length > 0) return await queryTab(allTabs[0]);
        return false;
      }
      return await queryTab(tab);
    } catch (e) {
      return false;
    }
  }

  async function queryTab(tab) {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_DATA' }, (data) => {
        if (chrome.runtime.lastError) { resolve(false); return; }
        if (data && (data.profile?.name || data.job?.jobTitle)) {
          currentPageType = data.pageType;
          currentProfile = data.profile;
          currentJob = data.job;
          renderPageData();
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  function renderPageData() {
    // Profile card
    $('#profile-card').style.display = 'none';
    $('#contact-section').style.display = 'none';
    $('#phone-section').style.display = 'none';
    $('#job-card').style.display = 'none';

    if (currentProfile && currentProfile.name) renderProfile(currentProfile);
    if (currentJob && currentJob.jobTitle) renderJob(currentJob);
    if (selectedTemplate) {
      selectTemplate(selectedTemplate, $(`.template-card[data-template-id="${selectedTemplate.id}"]`));
    }
  }

  function renderProfile(profile) {
    $('#profile-card').style.display = 'block';

    $('#profile-name').textContent = profile.name || '—';
    $('#profile-title').textContent = profile.title || '—';
    $('#profile-company').textContent = profile.company || '—';
    $('#profile-location').textContent = profile.location || '';

    const avatarEl = $('#profile-avatar');
    if (profile.profileImage) {
      avatarEl.innerHTML = `<img src="${profile.profileImage}" alt="${profile.name}">`;
    } else {
      const initials = (profile.firstName?.[0] || '') + (profile.lastName?.[0] || '');
      avatarEl.innerHTML = `<span class="avatar-placeholder">${initials || '👤'}</span>`;
    }

    if (profile.foundEmails && profile.foundEmails.length > 0) {
      $('#contact-section').style.display = 'block';
      const list = $('#email-list');
      list.innerHTML = '';
      profile.foundEmails.forEach(item => {
        const conf = item.confidence;
        const confClass = conf >= 70 ? 'confidence-high' : conf >= 40 ? 'confidence-medium' : 'confidence-low';
        const confLabel = conf === 100 ? 'Verified' : `${conf}%`;
        const el = document.createElement('div');
        el.className = 'contact-item';
        el.innerHTML = `
          <span class="contact-value">${item.email}</span>
          <span class="contact-confidence ${confClass}">${confLabel}</span>
          <button class="btn-copy-sm" title="Copy">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          </button>
        `;
        el.querySelector('.btn-copy-sm').addEventListener('click', (e) => {
          e.stopPropagation();
          copyText(item.email);
        });
        list.appendChild(el);
      });
    }

    if (profile.foundPhones && profile.foundPhones.length > 0) {
      $('#phone-section').style.display = 'block';
      const list = $('#phone-list');
      list.innerHTML = '';
      profile.foundPhones.forEach(item => {
        const phone = item.phone || item;
        const el = document.createElement('div');
        el.className = 'contact-item';
        el.innerHTML = `
          <span class="contact-value">${phone}</span>
          <span class="contact-confidence confidence-high">Verified</span>
          <button class="btn-copy-sm" title="Copy">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
          </button>
        `;
        el.querySelector('.btn-copy-sm').addEventListener('click', (e) => {
          e.stopPropagation();
          copyText(phone);
        });
        list.appendChild(el);
      });
    }
  }

  function renderJob(job) {
    $('#job-card').style.display = 'block';
    $('#job-title').textContent = job.jobTitle || '—';
    $('#job-company').textContent = job.company || '—';
    $('#job-location').textContent = job.location || '';

    if (job.recruiter && job.recruiter.name) {
      $('#recruiter-card').style.display = 'block';
      $('#recruiter-name').textContent = job.recruiter.name;
      $('#recruiter-title').textContent = job.recruiter.title || '';
    } else {
      $('#recruiter-card').style.display = 'none';
    }
  }

  // ─── AI Message Generation ────────────────
  async function generateMessage() {
    if (!selectedTemplate) return;
    const btnGenerate = $('#btn-generate');
    const loading = $('#composer-loading');
    const output = $('#composer-output');

    btnGenerate.disabled = true;
    loading.style.display = 'flex';
    output.style.display = 'none';

    const vars = {
      name: currentProfile?.name || currentJob?.recruiter?.name || '',
      title: currentProfile?.title || currentJob?.recruiter?.title || '',
      company: currentProfile?.company || currentJob?.company || '',
      userName: settings.userName || '',
      userTitle: settings.userTitle || '',
      userCompany: settings.userCompany || '',
      jobTitle: currentJob?.jobTitle || '',
      jobDescription: currentJob?.description?.substring(0, 500) || '',
      about: currentProfile?.about || ''
    };

    try {
      const result = await sendMessage('AI_DRAFT', {
        templatePrompt: selectedTemplate.prompt,
        variables: vars
      });

      loading.style.display = 'none';
      output.style.display = 'block';
      btnGenerate.disabled = false;

      if (result && result.message) {
        $('#output-text').textContent = result.message;
        const sourceEl = $('#output-source');
        sourceEl.textContent = result.source === 'ai' ? '✨ AI Generated' : result.source === 'template' ? '📝 Template' : '⚠️ Fallback';
        sourceEl.className = `output-source ${result.source}`;

        sendMessage('SAVE_OUTREACH', {
          leadName: vars.name,
          company: vars.company,
          template: selectedTemplate.id,
          message: result.message,
          source: result.source
        });
      }
    } catch (e) {
      loading.style.display = 'none';
      btnGenerate.disabled = false;
    }
  }

  // ─── Copy & Email ─────────────────────────
  async function copyMessage() {
    const text = $('#output-text')?.textContent;
    if (!text) return;
    await copyText(text);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied!', 'success');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied!', 'success');
    }
  }

  function openAsEmail() {
    const text = $('#output-text')?.textContent;
    if (!text) return;
    let email = '';
    if (currentProfile?.foundEmails?.length) email = currentProfile.foundEmails[0].email;
    const subject = currentJob?.jobTitle
      ? `Re: ${currentJob.jobTitle} at ${currentJob.company || ''}`
      : `Reaching out`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`, '_blank');
  }

  // ─── Lead Management ──────────────────────
  async function saveLead() {
    if (!currentProfile || !currentProfile.name) return;
    const result = await sendMessage('SAVE_LEAD', { ...currentProfile, status: 'new' });
    if (result) {
      showToast(`${currentProfile.name} saved!`, 'success');
      loadLeads();
      loadDashboard();
    }
  }

  // ─── Settings Panel ───────────────────────
  async function openSettings() {
    $('#settings-overlay').style.display = 'block';
    $('#setting-api-key').value = settings.openaiApiKey || '';
    $('#setting-model').value = settings.aiModel || 'gpt-4o-mini';
    $('#setting-tone').value = settings.defaultTone || 'professional';
    $('#setting-name').value = settings.userName || '';
    $('#setting-title').value = settings.userTitle || '';
    $('#setting-company').value = settings.userCompany || '';
    $('#setting-email').value = settings.userEmail || '';

    // Load automation limits
    const limits = await sendMessage('GET_AUTOMATION_LIMITS') || {};
    $('#setting-limit-connections').value = limits.connectionsPerDay || 50;
    $('#setting-limit-messages').value = limits.messagesPerDay || 100;
    $('#setting-limit-visits').value = limits.profileVisitsPerDay || 150;
    $('#setting-delay-min').value = Math.round((limits.minDelayMs || 3000) / 1000);
    $('#setting-delay-max').value = Math.round((limits.maxDelayMs || 8000) / 1000);
  }

  function closeSettings() { $('#settings-overlay').style.display = 'none'; }

  async function saveSettings() {
    const updates = {
      openaiApiKey: $('#setting-api-key')?.value?.trim() || '',
      aiModel: $('#setting-model')?.value || 'gpt-4o-mini',
      defaultTone: $('#setting-tone')?.value || 'professional',
      userName: $('#setting-name')?.value?.trim() || '',
      userTitle: $('#setting-title')?.value?.trim() || '',
      userCompany: $('#setting-company')?.value?.trim() || '',
      userEmail: $('#setting-email')?.value?.trim() || ''
    };

    settings = await sendMessage('UPDATE_SETTINGS', updates) || settings;
    updateAIStatus();

    // Save automation limits
    await sendMessage('UPDATE_AUTOMATION_LIMITS', {
      connectionsPerDay: parseInt($('#setting-limit-connections')?.value) || 50,
      messagesPerDay: parseInt($('#setting-limit-messages')?.value) || 100,
      profileVisitsPerDay: parseInt($('#setting-limit-visits')?.value) || 150,
      minDelayMs: (parseInt($('#setting-delay-min')?.value) || 3) * 1000,
      maxDelayMs: (parseInt($('#setting-delay-max')?.value) || 8) * 1000
    });

    closeSettings();
    showToast('Settings saved!', 'success');
  }

  // ─── Message Listener ─────────────────────
  function listenForUpdates() {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'PROFILE_DETECTED') {
        currentProfile = msg.data;
        currentPageType = 'profile';
        renderPageData();
      }
      if (msg.type === 'JOB_DETECTED') {
        currentJob = msg.data;
        currentPageType = 'job';
        renderPageData();
      }
    });
  }

  // ─── Helpers ──────────────────────────────
  function sendMessage(type, data) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type, data }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('[Sidebar] Message error:', chrome.runtime.lastError.message);
          resolve(null);
          return;
        }
        resolve(response);
      });
    });
  }

  function timeAgo(date) {
    if (!date) return '';
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 30) return `${days}d`;
    return new Date(date).toLocaleDateString();
  }

  function showToast(message, type = 'success') {
    const existing = document.querySelector('.los-sidebar-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'los-sidebar-toast';
    toast.style.cssText = `
      position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%) translateY(20px);
      padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; z-index: 9999;
      opacity: 0; transition: all 0.3s ease;
      background: ${type === 'success' ? 'rgba(0, 230, 118, 0.15)' : type === 'error' ? 'rgba(255, 82, 82, 0.15)' : 'rgba(0, 212, 255, 0.15)'};
      color: ${type === 'success' ? '#00e676' : type === 'error' ? '#ff5252' : '#00d4ff'};
      border: 1px solid ${type === 'success' ? 'rgba(0, 230, 118, 0.3)' : type === 'error' ? 'rgba(255, 82, 82, 0.3)' : 'rgba(0, 212, 255, 0.3)'};
      backdrop-filter: blur(10px);
    `;
    toast.textContent = `${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'} ${message}`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // ─── Start ────────────────────────────────
  init();
})();
