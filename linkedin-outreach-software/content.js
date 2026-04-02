/**
 * LinkedIn Outreach Software — Content Script
 * Injected on LinkedIn pages to add the outreach badge, detect profiles/jobs,
 * and communicate with the sidebar/background.
 */

(function () {
  'use strict';

  // Prevent double-injection
  if (window.__LOS_INJECTED) return;
  window.__LOS_INJECTED = true;

  const BADGE_ID = 'los-outreach-badge';
  const RECRUITER_BTN_CLASS = 'los-recruiter-btn';

  let currentProfileData = null;
  let currentJobData = null;
  let currentPageType = null;
  let badgeElement = null;

  // ─── Initialization ────────────────────────

  function init() {
    console.log('[LOS] LinkedIn Outreach Software initialized');
    observePageChanges();
    processCurrentPage();
  }

  // ─── Page Change Observer ──────────────────

  function observePageChanges() {
    let lastUrl = location.href;

    // URL change detection
    const urlObserver = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(processCurrentPage, 800);
      }
    });

    urlObserver.observe(document.body, { childList: true, subtree: true });

    // Also handle LinkedIn's SPA navigation
    window.addEventListener('popstate', () => setTimeout(processCurrentPage, 500));
  }

  // ─── Page Processing ──────────────────────

  function processCurrentPage() {
    const pageType = LOS.Utils.detectPageType();
    currentPageType = pageType;

    // Remove old badge if page changed
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
      default:
        break;
    }
  }

  // ─── Profile Page Handler ─────────────────

  async function handleProfilePage() {
    try {
      // Wait for profile content to load
      await LOS.Utils.waitForElement('h1.text-heading-xlarge, [data-anonymize="person-name"], .artdeco-entity-lockup__title', 5000);
      await new Promise(r => setTimeout(r, 500)); // Allow lazy content

      currentProfileData = ProfileScraper.extractProfile();
      if (!currentProfileData.name) return;

      const contacts = ContactFinder.findContacts(currentProfileData);
      currentProfileData.foundEmails = contacts.emails;
      currentProfileData.foundPhones = contacts.phones;

      injectBadge('profile');

      // Notify background script
      chrome.runtime.sendMessage({
        type: 'PROFILE_DETECTED',
        data: currentProfileData
      }).catch(() => {});

    } catch (e) {
      console.warn('[LOS] Profile page handling error:', e);
    }
  }

  // ─── Job Page Handler ─────────────────────

  async function handleJobPage() {
    try {
      await LOS.Utils.waitForElement('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, h1.t-24', 5000);
      await new Promise(r => setTimeout(r, 500));

      currentJobData = ProfileScraper.extractJobListing();
      if (!currentJobData.jobTitle) return;

      injectBadge('job');

      // Inject recruiter quick-action button if recruiter found
      if (currentJobData.recruiter) {
        injectRecruiterButton();
      }

      chrome.runtime.sendMessage({
        type: 'JOB_DETECTED',
        data: currentJobData
      }).catch(() => {});

    } catch (e) {
      console.warn('[LOS] Job page handling error:', e);
    }
  }

  // ─── Jobs List Handler ────────────────────

  function handleJobsList() {
    // Add subtle overlay buttons on job cards, re-run when list updates
    const container = document.querySelector('.jobs-search-results-list, .scaffold-layout__list');
    if (!container) return;

    const observer = new MutationObserver(LOS.Utils.debounce(() => {
      addJobCardButtons(container);
    }, 500));

    observer.observe(container, { childList: true, subtree: true });
    addJobCardButtons(container);
  }

  function addJobCardButtons(container) {
    const cards = container.querySelectorAll('.job-card-container, .jobs-search-results__list-item');
    cards.forEach(card => {
      if (card.querySelector(`.${RECRUITER_BTN_CLASS}`)) return;

      const btn = document.createElement('button');
      btn.className = RECRUITER_BTN_CLASS;
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>`;
      btn.title = 'Draft outreach for this job';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Navigate to the job to extract details
        const link = card.querySelector('a[href*="/jobs/view"]');
        if (link) link.click();
        setTimeout(() => openSidebar(), 1000);
      });

      card.style.position = 'relative';
      card.appendChild(btn);
    });
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
    const label = type === 'job' ? 'Outreach' : type === 'search' ? 'Outreach' : 'Outreach';

    badgeElement.innerHTML = `
      <div class="los-badge-inner">
        <span class="los-badge-icon">${icon}</span>
        <span class="los-badge-label">${label}</span>
        <span class="los-badge-pulse"></span>
      </div>
    `;

    badgeElement.addEventListener('click', openSidebar);

    document.body.appendChild(badgeElement);

    // Animation
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

  // ─── Recruiter Button Injection ───────────

  function injectRecruiterButton() {
    const recruiterSection = document.querySelector('.hirer-card__hirer-information, .jobs-poster');
    if (!recruiterSection || recruiterSection.querySelector(`.${RECRUITER_BTN_CLASS}`)) return;

    const btn = document.createElement('button');
    btn.className = `${RECRUITER_BTN_CLASS} los-recruiter-inline`;
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
      <span>Draft Outreach</span>
    `;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openSidebar();
    });

    recruiterSection.style.position = 'relative';
    recruiterSection.appendChild(btn);
  }

  // ─── Sidebar Communication ────────────────

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
        sendResponse({
          pageType: currentPageType,
          profile: currentProfileData,
          job: currentJobData
        });
        break;

      case 'REFRESH_DATA':
        processCurrentPage();
        sendResponse({ ok: true });
        break;

      case 'EXTRACT_PROFILE':
        currentProfileData = ProfileScraper.extractProfile();
        const contacts = ContactFinder.findContacts(currentProfileData);
        currentProfileData.foundEmails = contacts.emails;
        currentProfileData.foundPhones = contacts.phones;
        sendResponse(currentProfileData);
        break;

      default:
        break;
    }
    return true; // Keep channel open for async
  });

  // ─── Start ────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
