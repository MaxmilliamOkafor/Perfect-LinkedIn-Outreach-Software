/**
 * LinkedIn Outreach Software — Background Service Worker
 * Handles sidebar management, AI API calls, context menus, and message routing.
 */

// ─── Side Panel Setup ────────────────────────

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});

// ─── Context Menu ───────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'los-draft-outreach',
    title: '🚀 Draft Outreach Message',
    contexts: ['page'],
    documentUrlPatterns: ['https://*.linkedin.com/*']
  });

  chrome.contextMenus.create({
    id: 'los-save-lead',
    title: '💾 Save as Lead',
    contexts: ['page'],
    documentUrlPatterns: ['https://*.linkedin.com/*']
  });

  // Initialize default settings if first install
  chrome.storage.local.get('los_settings', (result) => {
    if (!result.los_settings) {
      chrome.storage.local.set({
        los_settings: {
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
        }
      });
    }
  });
});

// ─── Context Menu Handlers ──────────────────

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'los-draft-outreach') {
    openSidePanel(tab);
  } else if (info.menuItemId === 'los-save-lead') {
    chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_PROFILE' }, (response) => {
      if (response && response.name) {
        saveLead(response);
      }
    });
  }
});

// ─── Extension Icon Click ───────────────────

chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('linkedin.com')) {
    openSidePanel(tab);
  }
});

// ─── Side Panel Opener ──────────────────────

async function openSidePanel(tab) {
  try {
    await chrome.sidePanel.open({ tabId: tab.id });
    await chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: 'sidebar.html',
      enabled: true
    });
  } catch (e) {
    console.warn('[LOS] Side panel error:', e);
    // Fallback: use popup
  }
}

// ─── Message Router ─────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'OPEN_SIDEBAR':
      if (sender.tab) {
        openSidePanel(sender.tab);
      }
      sendResponse({ ok: true });
      break;

    case 'PROFILE_DETECTED':
    case 'JOB_DETECTED':
      // Forward to sidebar if open
      broadcastToSidebar(message);
      sendResponse({ ok: true });
      break;

    case 'AI_DRAFT':
      handleAIDraft(message.data).then(sendResponse);
      return true; // Async response

    case 'SAVE_LEAD':
      saveLead(message.data).then(sendResponse);
      return true;

    case 'GET_LEADS':
      getLeads().then(sendResponse);
      return true;

    case 'DELETE_LEAD':
      deleteLead(message.data.id).then(sendResponse);
      return true;

    case 'UPDATE_LEAD':
      updateLead(message.data.id, message.data.updates).then(sendResponse);
      return true;

    case 'GET_SETTINGS':
      getSettings().then(sendResponse);
      return true;

    case 'UPDATE_SETTINGS':
      updateSettings(message.data).then(sendResponse);
      return true;

    case 'GET_STATS':
      getStats().then(sendResponse);
      return true;

    case 'EXPORT_CSV':
      exportCSV().then(sendResponse);
      return true;

    case 'GET_TEMPLATES':
      getTemplates().then(sendResponse);
      return true;

    case 'SAVE_OUTREACH':
      saveOutreach(message.data).then(sendResponse);
      return true;

    case 'GET_PAGE_DATA':
      // Forward to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_PAGE_DATA' }, sendResponse);
        }
      });
      return true;

    default:
      break;
  }
});

// ─── AI Drafting ────────────────────────────

async function handleAIDraft(data) {
  const settings = await getSettings();

  if (!settings.openaiApiKey) {
    // Use template fallback
    return templateFallback(data.variables);
  }

  try {
    let prompt = data.templatePrompt;
    Object.entries(data.variables).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value || 'N/A');
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.openaiApiKey}`
      },
      body: JSON.stringify({
        model: settings.aiModel || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert outreach copywriter. Write personalized, compelling outreach messages.
Rules:
- Be genuine and human, NEVER robotic or generic
- Personalize based on the recipient's specific info given
- Keep concise and action-oriented
- Use a ${settings.defaultTone || 'professional'} tone
- No clichés ("I hope this finds you well", "I came across your profile")
- Include a clear call to action
- Sound like a real person`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API ${response.status}`);
    }

    const result = await response.json();
    const msg = result.choices?.[0]?.message?.content?.trim();

    return { success: true, message: msg, source: 'ai', model: settings.aiModel };

  } catch (error) {
    console.error('[LOS] AI error:', error);
    const fallback = templateFallback(data.variables);
    return { ...fallback, error: error.message, source: 'fallback' };
  }
}

function templateFallback(vars) {
  const firstName = (vars.name || 'there').split(' ')[0];
  const company = vars.company || 'your company';
  const userName = vars.userName || '';
  const userTitle = vars.userTitle || '';
  const jobTitle = vars.jobTitle || '';

  let message;
  if (jobTitle) {
    message = `Hi ${firstName},\n\nI'm excited about the ${jobTitle} opportunity at ${company}. ${userTitle ? `As a ${userTitle}` : 'With my background'}, I believe I can bring meaningful value to your team.\n\nWould you be open to a brief conversation?\n\nBest regards,\n${userName}`;
  } else {
    message = `Hi ${firstName},\n\nI noticed your impressive work at ${company}. ${userTitle ? `I'm ${userName}, ${userTitle}.` : ''}\n\nI'd love to connect and explore potential synergies. Would you be open to a quick chat?\n\nBest,\n${userName}`;
  }

  return { success: true, message, source: 'template' };
}

// ─── Storage Wrappers ───────────────────────

async function getSettings() {
  return new Promise(resolve => {
    chrome.storage.local.get('los_settings', r => {
      resolve(r.los_settings || {});
    });
  });
}

async function updateSettings(updates) {
  const current = await getSettings();
  const merged = { ...current, ...updates };
  return new Promise(resolve => {
    chrome.storage.local.set({ los_settings: merged }, () => resolve(merged));
  });
}

async function getLeads() {
  return new Promise(resolve => {
    chrome.storage.local.get('los_leads', r => resolve(r.los_leads || []));
  });
}

async function saveLead(lead) {
  const leads = await getLeads();
  const existing = leads.findIndex(l => l.linkedinUrl === lead.linkedinUrl);
  const entry = {
    ...lead,
    id: lead.id || `lead_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    savedAt: lead.savedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: lead.status || 'new',
    notes: lead.notes || ''
  };

  if (existing >= 0) leads[existing] = { ...leads[existing], ...entry };
  else leads.unshift(entry);

  return new Promise(resolve => {
    chrome.storage.local.set({ los_leads: leads }, () => resolve(entry));
  });
}

async function deleteLead(id) {
  let leads = await getLeads();
  leads = leads.filter(l => l.id !== id);
  return new Promise(resolve => {
    chrome.storage.local.set({ los_leads: leads }, () => resolve({ ok: true }));
  });
}

async function updateLead(id, updates) {
  const leads = await getLeads();
  const idx = leads.findIndex(l => l.id === id);
  if (idx >= 0) {
    leads[idx] = { ...leads[idx], ...updates, updatedAt: new Date().toISOString() };
    return new Promise(resolve => {
      chrome.storage.local.set({ los_leads: leads }, () => resolve(leads[idx]));
    });
  }
  return null;
}

async function getStats() {
  return new Promise(resolve => {
    chrome.storage.local.get('los_stats', r => {
      resolve(r.los_stats || { leadsSaved: 0, messagesDrafted: 0, emailsFound: 0, profilesViewed: 0 });
    });
  });
}

async function getTemplates() {
  return new Promise(resolve => {
    chrome.storage.local.get('los_templates', r => {
      resolve(r.los_templates || []);
    });
  });
}

async function saveOutreach(data) {
  return new Promise(resolve => {
    chrome.storage.local.get('los_outreach_history', r => {
      const history = r.los_outreach_history || [];
      history.unshift({ ...data, id: `out_${Date.now()}`, createdAt: new Date().toISOString() });
      if (history.length > 500) history.length = 500;
      chrome.storage.local.set({ los_outreach_history: history }, () => resolve({ ok: true }));
    });
  });
}

async function exportCSV() {
  const leads = await getLeads();
  if (!leads.length) return { csv: '' };

  const headers = ['Name', 'Title', 'Company', 'Email', 'Phone', 'LinkedIn URL', 'Status', 'Notes', 'Saved At'];
  const rows = leads.map(l => [
    l.name || '', l.title || '', l.company || '',
    (l.foundEmails || l.emails || []).map(e => e.email || e).join('; '),
    (l.foundPhones || l.phones || []).map(p => p.phone || p).join('; '),
    l.linkedinUrl || '', l.status || '', (l.notes || '').replace(/"/g, '""'), l.savedAt || ''
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
  return { csv };
}

function broadcastToSidebar(message) {
  // The sidebar listens via chrome.runtime.onMessage
  // It will receive the same messages broadcast through the runtime
}

// ─── Global Error Handler ───────────────────

self.addEventListener('unhandledrejection', (e) => {
  console.warn('[LOS] Unhandled rejection:', e.reason);
  e.preventDefault();
});
