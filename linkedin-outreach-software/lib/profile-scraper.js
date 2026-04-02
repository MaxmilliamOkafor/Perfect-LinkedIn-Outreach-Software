/**
 * LinkedIn Outreach Software — Profile Scraper
 * Extracts profile data, job listings, and recruiter info from LinkedIn pages.
 */

const ProfileScraper = {
  /**
   * Extract profile data from a LinkedIn profile page
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
      // Get the canonical LinkedIn URL
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      data.linkedinUrl = canonicalLink ? canonicalLink.href : window.location.href.split('?')[0];

      // Name
      const nameEl = document.querySelector('h1.text-heading-xlarge') ||
                      document.querySelector('.pv-top-card--list li') ||
                      document.querySelector('[data-anonymize="person-name"]') ||
                      document.querySelector('.artdeco-entity-lockup__title');
      data.name = nameEl ? LOS.Utils.cleanText(nameEl.textContent) : '';

      // Split name
      if (data.name) {
        const parts = data.name.split(' ');
        data.firstName = parts[0] || '';
        data.lastName = parts.slice(1).join(' ') || '';
      }

      // Headline / Title
      const titleEl = document.querySelector('.text-body-medium.break-words') ||
                       document.querySelector('[data-anonymize="headline"]') ||
                       document.querySelector('.pv-top-card--list .text-body-medium');
      data.title = titleEl ? LOS.Utils.cleanText(titleEl.textContent) : '';

      // Company (from headline or experience)
      const companyLink = document.querySelector('.pv-top-card--experience-list-item a') ||
                           document.querySelector('[data-anonymize="company-name"]');
      if (companyLink) {
        data.company = LOS.Utils.cleanText(companyLink.textContent);
        data.companyUrl = companyLink.href || '';
      } else if (data.title && data.title.includes(' at ')) {
        data.company = data.title.split(' at ').pop().trim();
      }

      // Location
      const locEl = document.querySelector('.text-body-small.inline.t-black--light.break-words') ||
                     document.querySelector('[data-anonymize="location"]') ||
                     document.querySelector('.pv-top-card--list-bullet li');
      data.location = locEl ? LOS.Utils.cleanText(locEl.textContent) : '';

      // About section
      const aboutSection = document.querySelector('#about ~ .display-flex .inline-show-more-text') ||
                            document.querySelector('.pv-about__summary-text') ||
                            document.querySelector('[data-anonymize="about-description"]');
      data.about = aboutSection ? LOS.Utils.cleanText(aboutSection.textContent).substring(0, 500) : '';

      // Profile image
      const imgEl = document.querySelector('.pv-top-card-profile-picture__image--show') ||
                     document.querySelector('.presence-entity__image') ||
                     document.querySelector('.pv-top-card__photo');
      data.profileImage = imgEl ? (imgEl.src || imgEl.getAttribute('data-delayed-url') || '') : '';

      // Connection degree
      const degreeEl = document.querySelector('.dist-value') ||
                        document.querySelector('.pv-top-card--list .text-body-small');
      if (degreeEl) {
        const text = degreeEl.textContent;
        if (text.includes('1st')) data.connectionDegree = '1st';
        else if (text.includes('2nd')) data.connectionDegree = '2nd';
        else if (text.includes('3rd')) data.connectionDegree = '3rd';
      }

      // Contact info section (if expanded)
      this._extractContactInfo(data);

      // Experience
      this._extractExperience(data);

    } catch (e) {
      console.warn('[LOS] Profile extraction error:', e);
    }

    return data;
  },

  /**
   * Extract visible contact info from profile
   */
  _extractContactInfo(data) {
    // Look for visible contact info section
    const contactSection = document.querySelector('.pv-contact-info');
    if (contactSection) {
      // Emails
      const emailLinks = contactSection.querySelectorAll('a[href^="mailto:"]');
      emailLinks.forEach(link => {
        const email = link.href.replace('mailto:', '').trim();
        if (email && !data.emails.includes(email)) data.emails.push(email);
      });

      // Phones
      const phoneEls = contactSection.querySelectorAll('.ci-phone .pv-contact-info__ci-container .t-14');
      phoneEls.forEach(el => {
        const phone = LOS.Utils.cleanText(el.textContent);
        if (phone && !data.phones.includes(phone)) data.phones.push(phone);
      });

      // Websites
      const websiteLinks = contactSection.querySelectorAll('.ci-websites a');
      websiteLinks.forEach(link => {
        if (link.href && !data.websites.includes(link.href)) {
          data.websites.push(link.href);
        }
      });
    }

    // Also scan the entire visible page for email patterns
    const bodyText = document.body.innerText;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const foundEmails = bodyText.match(emailRegex) || [];
    foundEmails.forEach(email => {
      const clean = email.toLowerCase().trim();
      if (!clean.includes('linkedin.com') && !clean.includes('example.com') && !data.emails.includes(clean)) {
        data.emails.push(clean);
      }
    });

    // Scan for phone numbers
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const foundPhones = bodyText.match(phoneRegex) || [];
    foundPhones.forEach(phone => {
      const clean = phone.trim();
      if (!data.phones.includes(clean)) data.phones.push(clean);
    });
  },

  /**
   * Extract work experience
   */
  _extractExperience(data) {
    const expItems = document.querySelectorAll('#experience ~ .pvs-list__outer-container .pvs-entity--padded');
    expItems.forEach((item, idx) => {
      if (idx >= 3) return; // First 3 entries
      const titleEl = item.querySelector('.t-bold span[aria-hidden="true"]');
      const companyEl = item.querySelector('.t-normal span[aria-hidden="true"]');
      data.experience.push({
        title: titleEl ? LOS.Utils.cleanText(titleEl.textContent) : '',
        company: companyEl ? LOS.Utils.cleanText(companyEl.textContent) : ''
      });
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
      const titleEl = document.querySelector('.job-details-jobs-unified-top-card__job-title') ||
                       document.querySelector('.jobs-unified-top-card__job-title') ||
                       document.querySelector('h1.t-24');
      data.jobTitle = titleEl ? LOS.Utils.cleanText(titleEl.textContent) : '';

      // Company
      const companyEl = document.querySelector('.job-details-jobs-unified-top-card__company-name') ||
                         document.querySelector('.jobs-unified-top-card__company-name a');
      if (companyEl) {
        data.company = LOS.Utils.cleanText(companyEl.textContent);
        data.companyUrl = companyEl.href || '';
      }

      // Location
      const locEl = document.querySelector('.job-details-jobs-unified-top-card__bullet') ||
                     document.querySelector('.jobs-unified-top-card__bullet');
      data.location = locEl ? LOS.Utils.cleanText(locEl.textContent) : '';

      // Description
      const descEl = document.querySelector('.jobs-description__content') ||
                      document.querySelector('#job-details .jobs-box__html-content') ||
                      document.querySelector('.jobs-description-content__text');
      data.description = descEl ? LOS.Utils.cleanText(descEl.textContent).substring(0, 2000) : '';

      // Recruiter / Hiring manager
      const recruiterCard = document.querySelector('.hirer-card__hirer-information') ||
                             document.querySelector('.jobs-poster__name');
      if (recruiterCard) {
        const recruiterName = recruiterCard.querySelector('.hirer-card__hirer-information a') ||
                               recruiterCard.querySelector('a');
        data.recruiter = {
          name: recruiterName ? LOS.Utils.cleanText(recruiterName.textContent) : '',
          linkedinUrl: recruiterName ? recruiterName.href : '',
          title: '',
          profileImage: ''
        };

        const recruiterTitle = recruiterCard.querySelector('.hirer-card__hirer-information span') ||
                                recruiterCard.querySelector('.t-normal');
        if (recruiterTitle) {
          data.recruiter.title = LOS.Utils.cleanText(recruiterTitle.textContent);
        }
      }

      // Posted date
      const dateEl = document.querySelector('.jobs-unified-top-card__posted-date') ||
                      document.querySelector('.posted-time-ago__text');
      data.postedDate = dateEl ? LOS.Utils.cleanText(dateEl.textContent) : '';

      // Applicants
      const applicantsEl = document.querySelector('.jobs-unified-top-card__applicant-count');
      data.applicants = applicantsEl ? LOS.Utils.cleanText(applicantsEl.textContent) : '';

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
    const cards = document.querySelectorAll('.reusable-search__result-container');

    cards.forEach((card, idx) => {
      if (idx >= 25) return;
      try {
        const nameEl = card.querySelector('.entity-result__title-text a span[aria-hidden="true"]');
        const titleEl = card.querySelector('.entity-result__primary-subtitle');
        const locEl = card.querySelector('.entity-result__secondary-subtitle');
        const linkEl = card.querySelector('.entity-result__title-text a');

        results.push({
          name: nameEl ? LOS.Utils.cleanText(nameEl.textContent) : '',
          title: titleEl ? LOS.Utils.cleanText(titleEl.textContent) : '',
          location: locEl ? LOS.Utils.cleanText(locEl.textContent) : '',
          linkedinUrl: linkEl ? linkEl.href.split('?')[0] : ''
        });
      } catch (e) {
        // Skip malformed cards
      }
    });

    return results;
  }
};

if (typeof window !== 'undefined') {
  window.ProfileScraper = ProfileScraper;
}
