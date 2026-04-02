/**
 * LinkedIn Outreach Software — Popup Logic
 */

(function () {
  'use strict';

  async function init() {
    await loadStats();
    await checkAIStatus();
    checkIfLinkedIn();
    setupListeners();
  }

  async function loadStats() {
    chrome.runtime.sendMessage({ type: 'GET_STATS' }, (stats) => {
      if (stats) {
        document.getElementById('stat-leads').textContent = stats.leadsSaved || 0;
        document.getElementById('stat-messages').textContent = stats.messagesDrafted || 0;
      }
    });

    chrome.runtime.sendMessage({ type: 'GET_LEADS' }, (leads) => {
      if (leads) {
        document.getElementById('stat-leads').textContent = leads.length || 0;
      }
    });
  }

  async function checkAIStatus() {
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (settings) => {
      const statusEl = document.getElementById('ai-status');
      const statusText = document.getElementById('ai-status-text');
      const setupBtn = document.getElementById('btn-setup-ai');

      if (settings && settings.openaiApiKey) {
        statusText.textContent = `AI Ready — ${settings.aiModel || 'gpt-4o-mini'}`;
        setupBtn.textContent = 'Change';
      } else {
        statusEl.classList.add('no-key');
        statusText.textContent = 'No API key — using templates';
        setupBtn.textContent = 'Add Key';
      }
    });
  }

  function checkIfLinkedIn() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.url || !tab.url.includes('linkedin.com')) {
        document.getElementById('not-linkedin').style.display = 'block';
      }
    });
  }

  function setupListeners() {
    // Open sidebar
    document.getElementById('btn-open-sidebar').addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.sidePanel.open({ tabId: tabs[0].id }).then(() => {
            chrome.sidePanel.setOptions({
              tabId: tabs[0].id,
              path: 'sidebar.html',
              enabled: true
            });
          }).catch(console.warn);
          window.close();
        }
      });
    });

    // Export
    document.getElementById('btn-export').addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'EXPORT_CSV' }, (result) => {
        if (!result || !result.csv) {
          alert('No leads to export');
          return;
        }
        const blob = new Blob([result.csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `linkedin_leads_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
    });

    // Setup AI
    document.getElementById('btn-setup-ai').addEventListener('click', () => {
      const key = prompt('Enter your OpenAI API Key (stored locally only):');
      if (key && key.trim()) {
        chrome.runtime.sendMessage({
          type: 'UPDATE_SETTINGS',
          data: { openaiApiKey: key.trim() }
        }, () => {
          checkAIStatus();
        });
      }
    });

    // Settings
    document.getElementById('btn-popup-settings').addEventListener('click', (e) => {
      e.preventDefault();
      // Open sidebar with settings
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.sidePanel.open({ tabId: tabs[0].id }).catch(console.warn);
          window.close();
        }
      });
    });
  }

  init();
})();
