/**
 * LinkedIn Outreach Software — Content Script
 * Injected on LinkedIn pages to detect profiles/jobs, add the outreach badge,
 * scrape contact data, and relay everything to the sidebar.
 */

(function () {
  'use strict';

  if (window.__LOS_INJECTED) return;
  window.__LOS_INJECTED = true;

  const BADGE_ID = 'los-outreach-badge';
  const RECRUITER_BTN_CLASS = 'los-recruiter-btn';

  let currentProfileData = null;
  let currentJobData = null;
  let currentPageType = null;
  let badgeElement = null;
  let lastUrl = location.href;
  let retryCount = 0;

  // ─── Init ─────────────────────────────────

  function init() {
    console.log('[LOS] LinkedIn Outreach Software v1.0 initialized');
    processCurrentPage();
    observePageChanges();
  }

  // ─── Page Change Observer ─────────────────

  function observePageChanges() {
    // Watch for URL changes (LinkedIn SPA)
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        retryCount = 0;
        setTimeout(() => processCurrentPage(), 600);
      }
    }, 500);

    // Also watch for DOM mutations (content loading after navigation)
    const observer = new MutationObserver(debounce(() => {
      const pageType = detectPageType();
      if (pageType === 'profile' && (!currentProfileData || !currentProfileData.name)) {
        processCurrentPage();
      }
      if (pageType === 'job' && (!currentJobData || !currentJobData.jobTitle)) {
        processCurrentPage();
      }
    }, 1500));

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ─── Debounce ─────────────────────────────

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  // ─── Page Type Detection ──────────────────

  function detectPageType() {
    const url = window.location.href;
    if (url.match(/linkedin\.com\/in\/[^/]+/)) return 'profile';
    if (url.includes('/jobs/view/') || url.match(/\/jobs\/collections\/.*currentJobId/)) return 'job';
    if (url.includes('/company/')) return 'company';
    if (url.includes('/search/results/people')) return 'search_people';
    if (url.includes('/search/results/')) return 'search';
    if (url.includes('/jobs/')) return 'jobs_list';
    if (url.includes('/messaging/')) return 'messaging';
    return 'other';
  }

  // ─── Process Current Page ─────────────────

  function processCurrentPage() {
    const pageType = detectPageType();
    currentPageType = pageType;
    console.log('[LOS] Processing page type:', pageType);

    removeBadge();

    switch (pageType) {
      case 'profile':
        handleProfilePage();
        break;
      case 'job':
        handleJobPage();
        break;
      case 'jobs_list':
        handleJobsList();
        break;
      case 'search_people':
        handlePeopleSearch();
        break;
    }
  }

  // ─── Profile Page Handler ─────────────────

  async function handleProfilePage() {
    try {
      // Wait for the profile name to load — try multiple selectors
      const nameSelectors = [
        'h1.text-heading-xlarge',
        '.pv-text-details__left-panel h1',
        '.top-card-layout__title',
        'h1[tabindex="-1"]',
        'main h1'
      ];

      let nameFound = false;
      for (const sel of nameSelectors) {
        try {
          await waitForElement(sel, 3000);
          nameFound = true;
          break;
        } catch { /* try next */ }
      }

      if (!nameFound && retryCount < 5) {
        retryCount++;
        console.log(`[LOS] Name not found, retry ${retryCount}/5 in 1s...`);
        setTimeout(() => handleProfilePage(), 1000);
        return;
      }

      // Give LinkedIn a moment to finish rendering dynamic content
      await sleep(500);

      currentProfileData = ProfileScraper.extractProfile();
      console.log('[LOS] Extracted profile:', currentProfileData.name, '|', currentProfileData.company);

      if (!currentProfileData.name) {
        if (retryCount < 5) {
          retryCount++;
          setTimeout(() => handleProfilePage(), 1500);
          return;
        }
        console.warn('[LOS] Could not extract profile name after retries');
        return;
      }

      // Find contact info
      const contacts = ContactFinder.findContacts(currentProfileData);
      currentProfileData.foundEmails = contacts.emails;
      currentProfileData.foundPhones = contacts.phones;

      console.log('[LOS] Found', contacts.emails.length, 'emails,', contacts.phones.length, 'phones');

      // Show the outreach badge
      injectBadge('profile');

      // Notify background / sidebar
      chrome.runtime.sendMessage({
        type: 'PROFILE_DETECTED',
        data: currentProfileData
      }).catch(() => {});

    } catch (e) {
      console.warn('[LOS] Profile handling error:', e);
      if (retryCount < 5) {
        retryCount++;
        setTimeout(() => handleProfilePage(), 2000);
      }
    }
  }

  // ─── Job Page Handler ─────────────────────

  async function handleJobPage() {
    try {
      const jobSelectors = [
        '.job-details-jobs-unified-top-card__job-title',
        '.jobs-unified-top-card__job-title',
        'h1.t-24',
        '.top-card-layout__title'
      ];

      let found = false;
      for (const sel of jobSelectors) {
        try {
          await waitForElement(sel, 3000);
          found = true;
          break;
        } catch { /* try next */ }
      }

      if (!found && retryCount < 3) {
        retryCount++;
        setTimeout(() => handleJobPage(), 1500);
        return;
      }

      await sleep(500);
      currentJobData = ProfileScraper.extractJobListing();

      if (!currentJobData.jobTitle) return;

      console.log('[LOS] Extracted job:', currentJobData.jobTitle, 'at', currentJobData.company);

      injectBadge('job');

      if (currentJobData.recruiter) {
        injectRecruiterButton();
      }

      chrome.runtime.sendMessage({
        type: 'JOB_DETECTED',
        data: currentJobData
      }).catch(() => {});

    } catch (e) {
      console.warn('[LOS] Job handling error:', e);
    }
  }

  // ─── Jobs List Handler ────────────────────

  function handleJobsList() {
    injectBadge('search');
  }

  // ─── People Search Handler ────────────────

  function handlePeopleSearch() {
    injectBadge('search');
  }

  // ─── Badge Injection ──────────────────────

  function injectBadge(type) {
    if (document.getElementById(BADGE_ID)) return;

    badgeElement = document.createElement('div');
    badgeElement.id = BADGE_ID;
    badgeElement.className = `los-badge los-badge-${type}`;

    const icon = type === 'job' ? '💼' : type === 'search' ? '🔍' : '🚀';

    badgeElement.innerHTML = `
      <div class="los-badge-inner">
        <span class="los-badge-icon">${icon}</span>
        <span class="los-badge-label">Outreach</span>
        <span class="los-badge-pulse"></span>
      </div>
    `;

    badgeElement.addEventListener('click', openSidebar);
    document.body.appendChild(badgeElement);

    requestAnimationFrame(() => {
      badgeElement.classList.add('los-badge-visible');
    });
  }

  function removeBadge() {
    const existing = document.getElementById(BADGE_ID);
    if (existing) {
      existing.classList.remove('los-badge-visible');
      setTimeout(() => existing.remove(), 300);
    }
    badgeElement = null;
  }

  // ─── Recruiter Button ─────────────────────

  function injectRecruiterButton() {
    const sections = document.querySelectorAll(
      '.hirer-card__hirer-information, .jobs-poster__header, .jobs-poster, .hiring-team-card'
    );

    sections.forEach(section => {
      if (section.querySelector(`.${RECRUITER_BTN_CLASS}`)) return;

      const btn = document.createElement('button');
      btn.className = `${RECRUITER_BTN_CLASS} los-recruiter-inline`;
      btn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
        <span>Draft Outreach</span>
      `;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openSidebar();
      });

      section.style.position = 'relative';
      section.appendChild(btn);
    });
  }

  // ─── Sidebar ──────────────────────────────

  function openSidebar() {
    chrome.runtime.sendMessage({
      type: 'OPEN_SIDEBAR',
      data: {
        pageType: currentPageType,
        profile: currentProfileData,
        job: currentJobData
      }
    }).catch(() => {});
  }

  // ─── Message Handler ──────────────────────

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'GET_PAGE_DATA':
        // If no data yet, try extracting now
        if (!currentProfileData && !currentJobData) {
          const pt = detectPageType();
          if (pt === 'profile') {
            currentProfileData = ProfileScraper.extractProfile();
            if (currentProfileData.name) {
              const contacts = ContactFinder.findContacts(currentProfileData);
              currentProfileData.foundEmails = contacts.emails;
              currentProfileData.foundPhones = contacts.phones;
            }
          } else if (pt === 'job') {
            currentJobData = ProfileScraper.extractJobListing();
          }
        }

        sendResponse({
          pageType: currentPageType || detectPageType(),
          profile: currentProfileData,
          job: currentJobData
        });
        break;

      case 'REFRESH_DATA':
        retryCount = 0;
        currentProfileData = null;
        currentJobData = null;
        processCurrentPage();
        sendResponse({ ok: true });
        break;

      case 'EXTRACT_PROFILE':
        currentProfileData = ProfileScraper.extractProfile();
        if (currentProfileData.name) {
          const contacts = ContactFinder.findContacts(currentProfileData);
          currentProfileData.foundEmails = contacts.emails;
          currentProfileData.foundPhones = contacts.phones;
        }
        sendResponse(currentProfileData);
        break;
    }
    return true;
  });

  // ─── Helpers ──────────────────────────────

  function waitForElement(selector, timeout = 5000) {
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
        reject(new Error(`Timeout: ${selector}`));
      }, timeout);
    });
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ─── Start ────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 500));
  } else {
    setTimeout(init, 500);
  }

})();
