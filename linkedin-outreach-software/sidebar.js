/**
 * LinkedIn Outreach Software — Sidebar Logic
 * Handles tabs, profile display, AI drafting, lead management, and settings.
 */

(function () {
  'use strict';

  // ─── State ────────────────────────────────
  let currentProfile = null;
  let currentJob = null;
  let currentPageType = null;
  let selectedTemplate = null;
  let settings = {};
  let allLeads = [];

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
    loadLeads();
    listenForUpdates();
    // Request page data with retries (content script may still be loading)
    requestPageDataWithRetry(0);
  }

  function requestPageDataWithRetry(attempt) {
    requestPageData().then(gotData => {
      if (!gotData && attempt < 6) {
        console.log(`[LOS Sidebar] No data yet, retry ${attempt + 1}/6...`);
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
      if (badge) badge.textContent = 'AI Powered';
      if (indicator) {
        indicator.textContent = '';
        indicator.className = 'ai-indicator';
        indicator.innerHTML = '<span class="ai-dot"></span> AI Ready';
      }
    } else {
      if (badge) badge.textContent = 'Templates';
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
      });
    });
  }

  // ─── Template Grid ────────────────────────
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

    // Auto-select first
    selectTemplate(DEFAULT_TEMPLATES[0], grid.querySelector('.template-card'));
  }

  function selectTemplate(template, cardEl) {
    $$('.template-card').forEach(c => c.classList.remove('active'));
    if (cardEl) cardEl.classList.add('active');
    selectedTemplate = template;

    // Update composer context
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
    // Generate AI message
    $('#btn-generate')?.addEventListener('click', generateMessage);
    $('#btn-regenerate')?.addEventListener('click', generateMessage);

    // Copy message
    $('#btn-copy')?.addEventListener('click', copyMessage);

    // Copy as email
    $('#btn-copy-email')?.addEventListener('click', openAsEmail);

    // Save lead
    $('#btn-save-lead')?.addEventListener('click', saveLead);

    // Draft outreach from profile
    $('#btn-draft-outreach')?.addEventListener('click', () => {
      $('#tab-outreach')?.click();
    });

    // Draft from recruiter card
    $('#btn-draft-recruiter')?.addEventListener('click', () => {
      // Auto-select job application template
      const jobTemplate = DEFAULT_TEMPLATES.find(t => t.id === 'job_application');
      const card = $('[data-template-id="job_application"]');
      if (jobTemplate && card) selectTemplate(jobTemplate, card);
      $('#tab-outreach')?.click();
    });

    // Settings
    $('#btn-settings')?.addEventListener('click', openSettings);
    $('#btn-close-settings')?.addEventListener('click', closeSettings);
    $('#btn-save-settings')?.addEventListener('click', saveSettings);

    // Refresh — tell content script to re-extract, then fetch
    $('#btn-refresh')?.addEventListener('click', async () => {
      const tabs = await chrome.tabs.query({ url: '*://*.linkedin.com/*' });
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'REFRESH_DATA' }, () => {
          setTimeout(() => requestPageDataWithRetry(0), 1000);
        });
      }
    });

    // Export CSV
    $('#btn-export')?.addEventListener('click', exportLeads);

    // Search leads
    $('#leads-search-input')?.addEventListener('input', filterLeads);
  }

  // ─── Page Data ────────────────────────────
  async function requestPageData() {
    try {
      // Query the active LinkedIn tab directly
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs.find(t => t.url && t.url.includes('linkedin.com'));

      if (!tab) {
        // Try all LinkedIn tabs
        const allTabs = await chrome.tabs.query({ url: '*://*.linkedin.com/*' });
        if (allTabs.length > 0) {
          return await queryTab(allTabs[0]);
        }
        console.log('[LOS Sidebar] No LinkedIn tab found');
        return false;
      }

      return await queryTab(tab);
    } catch (e) {
      console.warn('[LOS Sidebar] Failed to get page data:', e);
      return false;
    }
  }

  async function queryTab(tab) {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_DATA' }, (data) => {
        if (chrome.runtime.lastError) {
          console.warn('[LOS Sidebar] Tab query error:', chrome.runtime.lastError.message);
          resolve(false);
          return;
        }
        if (data && (data.profile?.name || data.job?.jobTitle)) {
          currentPageType = data.pageType;
          currentProfile = data.profile;
          currentJob = data.job;
          renderPageData();
          console.log('[LOS Sidebar] Got data:', data.profile?.name || data.job?.jobTitle);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  function renderPageData() {
    // Reset
    $('#contact-empty').style.display = 'flex';
    $('#profile-card').style.display = 'none';
    $('#contact-section').style.display = 'none';
    $('#phone-section').style.display = 'none';
    $('#job-card').style.display = 'none';

    if (currentProfile && currentProfile.name) {
      renderProfile(currentProfile);
    }

    if (currentJob && currentJob.jobTitle) {
      renderJob(currentJob);
    }

    // Update composer context
    if (selectedTemplate) {
      selectTemplate(selectedTemplate, $(`.template-card[data-template-id="${selectedTemplate.id}"]`));
    }
  }

  function renderProfile(profile) {
    $('#contact-empty').style.display = 'none';
    $('#profile-card').style.display = 'block';

    $('#profile-name').textContent = profile.name || '—';
    $('#profile-title').textContent = profile.title || '—';
    $('#profile-company').textContent = profile.company || '—';
    $('#profile-location').textContent = profile.location || '';

    // Avatar
    const avatarEl = $('#profile-avatar');
    if (profile.profileImage) {
      avatarEl.innerHTML = `<img src="${profile.profileImage}" alt="${profile.name}">`;
    } else {
      const initials = (profile.firstName?.[0] || '') + (profile.lastName?.[0] || '');
      avatarEl.innerHTML = `<span class="avatar-placeholder">${initials || '👤'}</span>`;
    }

    // Emails
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
          <button class="btn-copy-sm" data-copy="${item.email}" title="Copy">
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

    // Phones
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
          <button class="btn-copy-sm" data-copy="${phone}" title="Copy">
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
    $('#contact-empty').style.display = 'none';
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

    // Build variables
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

        // Save to outreach history
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
      console.error('[LOS Sidebar] Generation error:', e);
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
      // Fallback
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
    if (currentProfile?.foundEmails?.length) {
      email = currentProfile.foundEmails[0].email;
    }

    const subject = currentJob?.jobTitle
      ? `Re: ${currentJob.jobTitle} at ${currentJob.company || ''}`
      : `Reaching out`;

    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.open(mailto, '_blank');
  }

  // ─── Lead Management ──────────────────────
  async function saveLead() {
    if (!currentProfile || !currentProfile.name) return;

    const lead = {
      ...currentProfile,
      status: 'new'
    };

    const result = await sendMessage('SAVE_LEAD', lead);
    if (result) {
      showToast(`${currentProfile.name} saved!`, 'success');
      loadLeads();
    }
  }

  async function loadLeads() {
    allLeads = await sendMessage('GET_LEADS') || [];
    renderLeads(allLeads);
  }

  function renderLeads(leads) {
    const list = $('#leads-list');
    const empty = $('#leads-empty');
    const count = $('#lead-count');

    if (!list) return;

    count.textContent = `${leads.length} lead${leads.length !== 1 ? 's' : ''}`;

    if (!leads.length) {
      list.innerHTML = '';
      list.appendChild(empty);
      empty.style.display = 'flex';
      return;
    }

    empty.style.display = 'none';
    list.innerHTML = '';

    leads.forEach(lead => {
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

      // Delete handler
      item.querySelector('.lead-delete').addEventListener('click', async (e) => {
        e.stopPropagation();
        await sendMessage('DELETE_LEAD', { id: lead.id });
        showToast('Lead deleted', 'info');
        loadLeads();
      });

      // Click to load profile
      item.addEventListener('click', () => {
        currentProfile = lead;
        renderProfile(lead);
        $('#tab-contact')?.click();
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

  // ─── Settings Panel ───────────────────────
  async function openSettings() {
    $('#settings-overlay').style.display = 'block';

    // Populate fields
    $('#setting-api-key').value = settings.openaiApiKey || '';
    $('#setting-model').value = settings.aiModel || 'gpt-4o-mini';
    $('#setting-tone').value = settings.defaultTone || 'professional';
    $('#setting-name').value = settings.userName || '';
    $('#setting-title').value = settings.userTitle || '';
    $('#setting-company').value = settings.userCompany || '';
    $('#setting-email').value = settings.userEmail || '';
  }

  function closeSettings() {
    $('#settings-overlay').style.display = 'none';
  }

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
        resolve(response);
      });
    });
  }

  function showToast(message, type = 'success') {
    const existing = document.querySelector('.los-sidebar-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `los-sidebar-toast`;
    toast.style.cssText = `
      position: fixed;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      z-index: 9999;
      opacity: 0;
      transition: all 0.3s ease;
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
