/**
 * LinkedIn Outreach Software — Utilities
 * Shared helper functions used across all modules.
 */

const LOS = window.LOS || {};

LOS.Utils = {
  /**
   * Wait for an element to appear in the DOM
   */
  waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);

      const observer = new MutationObserver((_, obs) => {
        const el = document.querySelector(selector);
        if (el) {
          obs.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for ${selector}`));
      }, timeout);
    });
  },

  /**
   * Debounce function calls
   */
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  /**
   * Generate a unique ID
   */
  generateId() {
    return `los_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Clean text — remove extra whitespace and line breaks
   */
  cleanText(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
  },

  /**
   * Extract domain from URL or company name
   */
  extractDomain(input) {
    if (!input) return '';
    // If it's a URL, extract domain
    try {
      const url = new URL(input);
      return url.hostname.replace('www.', '');
    } catch {
      // If it's a company name, make a guess
      return input
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 30) + '.com';
    }
  },

  /**
   * Detect the current LinkedIn page type
   */
  detectPageType() {
    const url = window.location.href;
    if (url.includes('/in/')) return 'profile';
    if (url.includes('/jobs/view/') || url.includes('/jobs/collections/')) return 'job';
    if (url.includes('/company/')) return 'company';
    if (url.includes('/search/results/people')) return 'search_people';
    if (url.includes('/search/results/')) return 'search';
    if (url.includes('/jobs/')) return 'jobs_list';
    if (url.includes('/messaging/')) return 'messaging';
    return 'other';
  },

  /**
   * Check if we're on a LinkedIn page
   */
  isLinkedIn() {
    return window.location.hostname.includes('linkedin.com');
  },

  /**
   * Format a date to relative time
   */
  timeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  },

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
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
      return true;
    }
  },

  /**
   * Show a toast notification
   */
  showToast(message, type = 'success', duration = 3000) {
    const existing = document.getElementById('los-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'los-toast';
    toast.className = `los-toast los-toast-${type}`;
    toast.innerHTML = `
      <span class="los-toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span class="los-toast-msg">${message}</span>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('los-toast-show'));
    setTimeout(() => {
      toast.classList.remove('los-toast-show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

window.LOS = LOS;
