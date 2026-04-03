/**
 * LinkedIn Outreach Pro — Popup Logic
 * Quick stats dashboard with real-time data
 */

(function () {
  'use strict';

  async function init() {
    await loadStats();
    setupListeners();
  }

  async function loadStats() {
    try {
      // Leads count
      const leads = await send('GET_LEADS') || [];
      setText('#popup-leads', leads.length);

      // Active campaigns
      const campaigns = await send('GET_CAMPAIGNS') || [];
      const active = campaigns.filter(c => c.status === 'active');
      setText('#popup-campaigns', active.length);

      // Total sent
      const totalSent = campaigns.reduce((s, c) => s + (c.stats?.sent || 0), 0);
      setText('#popup-sent', totalSent);

      // Response rate
      const totalReplied = campaigns.reduce((s, c) => s + (c.stats?.replied || 0), 0);
      const rate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0;
      setText('#popup-rate', rate + '%');

      // Automation status
      const autoStatus = await send('GET_AUTO_STATUS');
      const dot = document.getElementById('popup-auto-dot');
      const label = document.getElementById('popup-auto-label');

      if (autoStatus?.isRunning && !autoStatus?.isPaused) {
        dot.className = 'popup-auto-dot running';
        label.textContent = `Automation: Running (${autoStatus.queueLength} in queue)`;
      } else if (autoStatus?.isPaused) {
        dot.className = 'popup-auto-dot paused';
        label.textContent = 'Automation: Paused';
      } else {
        dot.className = 'popup-auto-dot';
        label.textContent = 'Automation: Idle';
      }

      // Daily counters
      const counters = await send('GET_DAILY_COUNTERS') || {};
      setText('#popup-conn-today', counters.connectionsPerDay || 0);
      setText('#popup-msg-today', counters.messagesPerDay || 0);
      setText('#popup-visit-today', counters.profileVisitsPerDay || 0);

    } catch (e) {
      console.warn('[Popup] Load error:', e);
    }
  }

  function setupListeners() {
    document.getElementById('btn-open-sidebar')?.addEventListener('click', async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url?.includes('linkedin.com')) {
        chrome.runtime.sendMessage({ type: 'OPEN_SIDEBAR' });
        window.close();
      } else {
        // Navigate to LinkedIn first
        chrome.tabs.create({ url: 'https://www.linkedin.com/feed/' });
        window.close();
      }
    });

    document.getElementById('btn-quick-save')?.addEventListener('click', async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url?.includes('linkedin.com')) {
        chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_PROFILE' }, (profile) => {
          if (profile && profile.name) {
            chrome.runtime.sendMessage({ type: 'SAVE_LEAD', data: profile }, () => {
              const btn = document.getElementById('btn-quick-save');
              btn.textContent = '✓ Saved!';
              btn.style.color = '#00e676';
              btn.style.borderColor = 'rgba(0, 230, 118, 0.3)';
              setTimeout(() => loadStats(), 500);
            });
          }
        });
      }
    });
  }

  function send(type, data) {
    return new Promise(resolve => {
      chrome.runtime.sendMessage({ type, data }, response => {
        if (chrome.runtime.lastError) resolve(null);
        else resolve(response);
      });
    });
  }

  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  }

  init();
})();
