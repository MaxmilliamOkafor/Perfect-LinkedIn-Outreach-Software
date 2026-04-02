/**
 * LinkedIn Outreach Software — Profile Scraper
 * Extracts profile data, job listings, and recruiter info from LinkedIn pages.
 * Uses a multi-selector fallback approach for maximum compatibility.
 */

const ProfileScraper = {

  /**
   * Try multiple selectors, return first match
   */
  _q(selectors) {
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el && el.textContent.trim()) return el;
      } catch (e) { /* skip invalid selectors */ }
    }
    return null;
  },

  /**
   * Try multiple selectors, return all matches
   */
  _qAll(selectors) {
    for (const sel of selectors) {
      try {
        const els = document.querySelectorAll(sel);
        if (els.length > 0) return els;
      } catch (e) { /* skip */ }
    }
    return [];
  },

  /**
   * Clean text — remove extra whitespace
   */
  _clean(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
  },

  /**
   * Extract profile data from a LinkedIn profile page (works for ANY profile)
   */
  extractProfile() {
    const data = {
      name: '',
      firstName: '',
      lastName: '',
      title: '',
      company: '',
      companyUrl: '',
      location: '',
      about: '',
      linkedinUrl: '',
      profileImage: '',
      connectionDegree: '',
      emails: [],
      phones: [],
      websites: [],
      experience: [],
      education: []
    };

    try {
      // ─── URL ───────────────────────────
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      data.linkedinUrl = canonicalLink ? canonicalLink.href : window.location.href.split('?')[0];

      // ─── NAME (many fallbacks) ─────────
      const nameEl = this._q([
        'h1.text-heading-xlarge',
        '.pv-text-details__left-panel h1',
        '.top-card-layout__title',
        'h1[tabindex="-1"]',
        '.artdeco-entity-lockup__title',
        'h1.top-card-layout__title',
        '.pv-top-card--list li:first-child',
        '[data-anonymize="person-name"]',
        'main h1'
      ]);
      data.name = nameEl ? this._clean(nameEl.textContent) : '';

      // Remove "Pronouns" suffixes like "(he/him)" etc
      data.name = data.name.replace(/\s*\(.*?\)\s*$/, '').trim();

      // Split name
      if (data.name) {
        const parts = data.name.split(' ').filter(Boolean);
        data.firstName = parts[0] || '';
        data.lastName = parts.slice(1).join(' ') || '';
      }

      // ─── HEADLINE / TITLE ─────────────
      const titleEl = this._q([
        '.text-body-medium.break-words',
        '.pv-text-details__left-panel .text-body-medium',
        '.top-card-layout__headline',
        '.pv-top-card--list .text-body-medium',
        '[data-anonymize="headline"]',
        '.profile-topcard__summary-position',
        '.artdeco-entity-lockup__subtitle',
        'main section .text-body-medium'
      ]);
      data.title = titleEl ? this._clean(titleEl.textContent) : '';

      // ─── COMPANY ──────────────────────
      const companyEl = this._q([
        '.pv-text-details__right-panel button[aria-label*="company"]',
        '.pv-text-details__right-panel a',
        '.pv-text-details__right-panel .inline-show-more-text',
        'a[data-tracking-control-name="public_profile_topcard-current-company"]',
        '.pv-top-card--experience-list-item a',
        '.top-card-layout__summary-list a',
        '[data-anonymize="company-name"]',
        '.experience-item__subtitle',
        'button[aria-label="Current company"]'
      ]);

      if (companyEl) {
        data.company = this._clean(companyEl.textContent);
        data.companyUrl = companyEl.href || '';
      }

      // Fallback: extract company from title/headline
      if (!data.company && data.title) {
        // Patterns: "Role at Company" or "Role @ Company"
        const atMatch = data.title.match(/(?:\bat\b|\@)\s+(.+?)(?:\||$)/i);
        if (atMatch) {
          data.company = atMatch[1].trim();
        }
      }

      // ─── LOCATION ─────────────────────
      const locEl = this._q([
        '.text-body-small.inline.t-black--light.break-words',
        '.pv-text-details__left-panel .text-body-small',
        '.top-card-layout__first-subline',
        '[data-anonymize="location"]',
        '.pv-top-card--list-bullet li',
        'span.top-card-layout__first-subline',
        '.profile-topcard__location-data'
      ]);
      data.location = locEl ? this._clean(locEl.textContent) : '';
      // Clean up location - remove "Contact info" text
      data.location = data.location.replace(/·?\s*Contact info\s*$/i, '').trim();

      // ─── ABOUT SECTION ────────────────
      const aboutEl = this._q([
        '#about ~ .display-flex .inline-show-more-text',
        '#about ~ .display-flex .pv-shared-text-with-see-more span[aria-hidden="true"]',
        '#about + div + div .inline-show-more-text',
        '.pv-about__summary-text',
        '.pv-shared-text-with-see-more .inline-show-more-text',
        '.about-section__text',
        '[data-anonymize="about-description"]',
        '.core-section-container__content p',
        '#about ~ div span[aria-hidden="true"]'
      ]);
      data.about = aboutEl ? this._clean(aboutEl.textContent).substring(0, 500) : '';

      // ─── PROFILE IMAGE ────────────────
      const imgEl = this._q([
        '.pv-top-card-profile-picture__image--show',
        '.pv-top-card-profile-picture__image',
        'img.pv-top-card-profile-picture__image',
        '.profile-photo-edit__preview',
        'img[src*="profile-displayphoto-shrink"]',
        '.top-card-layout__entity-image-container img',
        'img.artdeco-entity-image',
        '.presence-entity__image',
        '.pv-top-card__photo',
        'img.profile-topcard__photo'
      ]);
      data.profileImage = imgEl ? (imgEl.src || imgEl.getAttribute('data-delayed-url') || '') : '';

      // ─── CONNECTION DEGREE ────────────
      const allSmallText = document.querySelectorAll('.text-body-small, .dist-value, .pv-text-details__separator');
      for (const el of allSmallText) {
        const t = el.textContent || '';
        if (t.includes('1st')) { data.connectionDegree = '1st'; break; }
        if (t.includes('2nd')) { data.connectionDegree = '2nd'; break; }
        if (t.includes('3rd')) { data.connectionDegree = '3rd'; break; }
      }

      // ─── CONTACT INFO ─────────────────
      this._extractContactInfo(data);

      // ─── EXPERIENCE ───────────────────
      this._extractExperience(data);

    } catch (e) {
      console.warn('[LOS] Profile extraction error:', e);
    }

    return data;
  },

  /**
   * Extract visible contact info from profile — scans the whole page
   */
  _extractContactInfo(data) {
    // 1. Check the contact info modal / section
    const contactSections = document.querySelectorAll(
      '.pv-contact-info, .ci-email, .ci-phone, .ci-websites, ' +
      '.pv-contact-info__contact-type, [data-section="contactinfo"], ' +
      '.artdeco-modal__content'
    );

    contactSections.forEach(section => {
      // Emails from mailto links
      section.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        const email = link.href.replace('mailto:', '').trim().toLowerCase();
        if (email && !data.emails.includes(email)) data.emails.push(email);
      });

      // Phone numbers from tel links
      section.querySelectorAll('a[href^="tel:"]').forEach(link => {
        const phone = link.href.replace('tel:', '').trim();
        if (phone && !data.phones.includes(phone)) data.phones.push(phone);
      });

      // Phones from text content
      section.querySelectorAll('.t-14, .pv-contact-info__ci-container, .ci-phone span').forEach(el => {
        const text = this._clean(el.textContent);
        const phoneMatch = text.match(/[\+]?[\d\s\-\(\)\.]{7,}/);
        if (phoneMatch) {
          const phone = phoneMatch[0].trim();
          if (!data.phones.includes(phone)) data.phones.push(phone);
        }
      });

      // Websites
      section.querySelectorAll('a[href]:not([href^="mailto:"]):not([href^="tel:"]):not([href*="linkedin.com"])').forEach(link => {
        const href = link.href;
        if (href && !href.includes('linkedin.com') && !data.websites.includes(href)) {
          data.websites.push(href);
        }
      });
    });

    // 2. Scan the ENTIRE page for email patterns in visible text
    const bodyText = document.body.innerText || '';
    const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
    const foundEmails = bodyText.match(emailRegex) || [];
    foundEmails.forEach(email => {
      const clean = email.toLowerCase().trim();
      if (!clean.includes('linkedin.com') &&
          !clean.includes('example.com') &&
          !clean.includes('sentry.io') &&
          !clean.includes('w3.org') &&
          !data.emails.includes(clean)) {
        data.emails.push(clean);
      }
    });

    // 3. Scan for phone number patterns
    const phoneRegex = /(?:\+?\d{1,3}[\s\-\.]?)?\(?\d{2,4}\)?[\s\-\.]?\d{3,4}[\s\-\.]?\d{3,4}/g;
    const foundPhones = bodyText.match(phoneRegex) || [];
    foundPhones.forEach(phone => {
      const clean = phone.trim();
      // Must have at least 7 digits
      if (clean.replace(/\D/g, '').length >= 7 && !data.phones.includes(clean)) {
        data.phones.push(clean);
      }
    });
  },

  /**
   * Extract work experience
   */
  _extractExperience(data) {
    // Multiple selector strategies for experience items
    const expContainers = this._qAll([
      '#experience ~ .pvs-list__outer-container .pvs-entity--padded',
      '#experience ~ div .pvs-list__paged-list-item',
      '.experience-section .pv-entity__summary-info',
      '.experience-item',
      '#experience-section .pv-profile-section__card-item'
    ]);

    expContainers.forEach((item, idx) => {
      if (idx >= 3) return;
      const titleEl = item.querySelector('.t-bold span[aria-hidden="true"]') ||
                       item.querySelector('.t-bold') ||
                       item.querySelector('h3');
      const companyEl = item.querySelector('.t-normal span[aria-hidden="true"]') ||
                         item.querySelector('.t-normal:not(.t-bold)') ||
                         item.querySelector('h4, .pv-entity__secondary-title');
      
      const expTitle = titleEl ? this._clean(titleEl.textContent) : '';
      const expCompany = companyEl ? this._clean(companyEl.textContent) : '';
      
      if (expTitle || expCompany) {
        data.experience.push({ title: expTitle, company: expCompany });
        // Fill company if not found from header
        if (!data.company && expCompany && idx === 0) {
          data.company = expCompany;
        }
      }
    });
  },

  /**
   * Extract job listing data from a LinkedIn job page
   */
  extractJobListing() {
    const data = {
      jobTitle: '',
      company: '',
      companyUrl: '',
      location: '',
      description: '',
      jobUrl: '',
      recruiter: null,
      postedDate: '',
      applicants: '',
      workplaceType: '',
      employmentType: ''
    };

    try {
      data.jobUrl = window.location.href.split('?')[0];

      // Job title
      const titleEl = this._q([
        '.job-details-jobs-unified-top-card__job-title h1',
        '.job-details-jobs-unified-top-card__job-title a',
        '.job-details-jobs-unified-top-card__job-title',
        '.jobs-unified-top-card__job-title a',
        '.jobs-unified-top-card__job-title',
        'h1.t-24',
        '.jobs-details__main-content h1',
        'h2.t-24',
        '.top-card-layout__title'
      ]);
      data.jobTitle = titleEl ? this._clean(titleEl.textContent) : '';

      // Company
      const companyEl = this._q([
        '.job-details-jobs-unified-top-card__company-name a',
        '.job-details-jobs-unified-top-card__company-name',
        '.jobs-unified-top-card__company-name a',
        '.jobs-unified-top-card__company-name',
        '.top-card-layout__second-subline a',
        '.topcard__org-name-link'
      ]);
      if (companyEl) {
        data.company = this._clean(companyEl.textContent);
        data.companyUrl = companyEl.href || '';
      }

      // Location
      const locEl = this._q([
        '.job-details-jobs-unified-top-card__bullet',
        '.job-details-jobs-unified-top-card__workplace-type',
        '.jobs-unified-top-card__bullet',
        '.jobs-unified-top-card__workplace-type',
        '.top-card-layout__first-subline',
        '.topcard__flavor:nth-child(2)'
      ]);
      data.location = locEl ? this._clean(locEl.textContent) : '';

      // Description
      const descEl = this._q([
        '.jobs-description__content .jobs-box__html-content',
        '.jobs-description__content',
        '#job-details .jobs-box__html-content',
        '.jobs-description-content__text',
        '.show-more-less-html__markup',
        '.description__text'
      ]);
      data.description = descEl ? this._clean(descEl.textContent).substring(0, 2000) : '';

      // Recruiter / Hiring manager
      const recruiterCard = this._q([
        '.hirer-card__hirer-information',
        '.jobs-poster__header',
        '.jobs-poster__name',
        '.hiring-team-card',
        '.job-details-jobs-unified-top-card__hiring-manager'
      ]);

      if (recruiterCard) {
        const recruiterLink = recruiterCard.querySelector('a[href*="/in/"]') ||
                               recruiterCard.querySelector('a');
        data.recruiter = {
          name: recruiterLink ? this._clean(recruiterLink.textContent) : '',
          linkedinUrl: recruiterLink ? recruiterLink.href : '',
          title: '',
          profileImage: ''
        };

        const recruiterTitleEl = recruiterCard.querySelector('.text-body-small, .t-normal, span:not(:first-child)');
        if (recruiterTitleEl) {
          data.recruiter.title = this._clean(recruiterTitleEl.textContent);
        }

        const recruiterImg = recruiterCard.querySelector('img');
        if (recruiterImg) {
          data.recruiter.profileImage = recruiterImg.src || '';
        }
      }

      // Posted date
      const dateEl = this._q([
        '.jobs-unified-top-card__posted-date',
        '.posted-time-ago__text',
        '.job-details-jobs-unified-top-card__primary-description-container span'
      ]);
      data.postedDate = dateEl ? this._clean(dateEl.textContent) : '';

    } catch (e) {
      console.warn('[LOS] Job extraction error:', e);
    }

    return data;
  },

  /**
   * Extract search results (people listings)
   */
  extractSearchResults() {
    const results = [];
    const cards = this._qAll([
      '.reusable-search__result-container',
      '.search-results-container li',
      '.entity-result'
    ]);

    cards.forEach((card, idx) => {
      if (idx >= 25) return;
      try {
        const nameEl = card.querySelector('.entity-result__title-text a span[aria-hidden="true"]') ||
                         card.querySelector('.entity-result__title-text a') ||
                         card.querySelector('a .t-roman');
        const titleEl = card.querySelector('.entity-result__primary-subtitle') ||
                         card.querySelector('.entity-result__summary');
        const locEl = card.querySelector('.entity-result__secondary-subtitle');
        const linkEl = card.querySelector('a[href*="/in/"]') ||
                        card.querySelector('.entity-result__title-text a');

        const name = nameEl ? this._clean(nameEl.textContent) : '';
        if (name) {
          results.push({
            name,
            title: titleEl ? this._clean(titleEl.textContent) : '',
            location: locEl ? this._clean(locEl.textContent) : '',
            linkedinUrl: linkEl ? linkEl.href.split('?')[0] : ''
          });
        }
      } catch (e) { /* skip */ }
    });

    return results;
  }
};

if (typeof window !== 'undefined') {
  window.ProfileScraper = ProfileScraper;
}
