/**
 * LinkedIn Outreach Software — Contact Finder
 * Generates likely email addresses using common patterns + company domain.
 * No API limitations — all pattern-based logic runs locally.
 */

const ContactFinder = {
  /**
   * Common email patterns used by companies
   * {f} = first name, {l} = last name, {fi} = first initial, {li} = last initial
   */
  PATTERNS: [
    { pattern: '{f}.{l}@{d}',       label: 'first.last',       confidence: 0.85 },
    { pattern: '{f}{l}@{d}',         label: 'firstlast',        confidence: 0.70 },
    { pattern: '{fi}{l}@{d}',        label: 'flast',            confidence: 0.60 },
    { pattern: '{f}@{d}',            label: 'first',            confidence: 0.50 },
    { pattern: '{f}_{l}@{d}',        label: 'first_last',       confidence: 0.45 },
    { pattern: '{f}-{l}@{d}',        label: 'first-last',       confidence: 0.40 },
    { pattern: '{l}.{f}@{d}',        label: 'last.first',       confidence: 0.35 },
    { pattern: '{l}{f}@{d}',         label: 'lastfirst',        confidence: 0.30 },
    { pattern: '{fi}.{l}@{d}',       label: 'f.last',           confidence: 0.30 },
    { pattern: '{l}@{d}',            label: 'last',             confidence: 0.25 },
    { pattern: '{f}{li}@{d}',        label: 'firstl',           confidence: 0.25 },
    { pattern: '{fi}{li}@{d}',       label: 'fl',               confidence: 0.15 }
  ],

  /**
   * Known company domains (shortcut mapping)
   */
  KNOWN_DOMAINS: {
    'google': 'google.com',
    'alphabet': 'google.com',
    'microsoft': 'microsoft.com',
    'apple': 'apple.com',
    'amazon': 'amazon.com',
    'meta': 'meta.com',
    'facebook': 'meta.com',
    'netflix': 'netflix.com',
    'salesforce': 'salesforce.com',
    'oracle': 'oracle.com',
    'ibm': 'ibm.com',
    'tesla': 'tesla.com',
    'uber': 'uber.com',
    'airbnb': 'airbnb.com',
    'stripe': 'stripe.com',
    'shopify': 'shopify.com',
    'spotify': 'spotify.com',
    'linkedin': 'linkedin.com',
    'twitter': 'x.com',
    'snap': 'snap.com',
    'snapchat': 'snap.com',
    'tiktok': 'tiktok.com',
    'bytedance': 'bytedance.com',
    'adobe': 'adobe.com',
    'intel': 'intel.com',
    'nvidia': 'nvidia.com',
    'samsung': 'samsung.com',
    'dell': 'dell.com',
    'hp': 'hp.com',
    'cisco': 'cisco.com',
    'vmware': 'vmware.com',
    'slack': 'slack.com',
    'zoom': 'zoom.us',
    'dropbox': 'dropbox.com',
    'square': 'squareup.com',
    'paypal': 'paypal.com',
    'deloitte': 'deloitte.com',
    'mckinsey': 'mckinsey.com',
    'bcg': 'bcg.com',
    'bain': 'bain.com',
    'goldman sachs': 'gs.com',
    'jp morgan': 'jpmorgan.com',
    'jpmorgan': 'jpmorgan.com',
    'morgan stanley': 'morganstanley.com',
    'bank of america': 'bofa.com',
    'wells fargo': 'wellsfargo.com',
    'citigroup': 'citi.com',
    'hsbc': 'hsbc.com',
    'barclays': 'barclays.com'
  },

  /**
   * Generate possible email addresses for a contact
   */
  generateEmails(firstName, lastName, company, companyUrl) {
    if (!firstName || !company) return [];

    const f = firstName.toLowerCase().replace(/[^a-z]/g, '');
    const l = (lastName || '').toLowerCase().replace(/[^a-z]/g, '');
    const fi = f.charAt(0);
    const li = l ? l.charAt(0) : '';
    const domain = this._resolveDomain(company, companyUrl);

    if (!domain || domain.includes('linkedin.com')) return [];

    const results = [];
    this.PATTERNS.forEach(({ pattern, label, confidence }) => {
      if (!l && pattern.includes('{l}')) return; // Skip last-name patterns if no last name

      const email = pattern
        .replace('{f}', f)
        .replace('{l}', l)
        .replace('{fi}', fi)
        .replace('{li}', li)
        .replace('{d}', domain);

      results.push({
        email,
        pattern: label,
        confidence: Math.round(confidence * 100),
        domain,
        source: 'pattern'
      });
    });

    return results;
  },

  /**
   * Resolve company name to domain
   */
  _resolveDomain(company, companyUrl) {
    // Check known companies first
    const companyLower = company.toLowerCase().trim();
    for (const [name, domain] of Object.entries(this.KNOWN_DOMAINS)) {
      if (companyLower.includes(name)) return domain;
    }

    // Try to extract from company LinkedIn URL
    if (companyUrl && companyUrl.includes('linkedin.com/company/')) {
      const slug = companyUrl.split('/company/')[1]?.split(/[/?]/)[0] || '';
      if (slug) return slug.replace(/-/g, '') + '.com';
    }

    // Clean company name into a domain guess
    return companyLower
      .replace(/\b(inc|llc|ltd|corp|co|group|holdings|international|solutions|technologies|technology|consulting|services|partners)\b\.?/gi, '')
      .replace(/[^a-z0-9]/g, '')
      .trim() + '.com';
  },

  /**
   * Merge scraped emails with generated patterns
   */
  mergeContacts(scrapedEmails, generatedEmails) {
    const all = [];
    const seen = new Set();

    // Scraped emails get highest confidence
    (scrapedEmails || []).forEach(email => {
      const lower = email.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        all.push({
          email: lower,
          pattern: 'verified',
          confidence: 100,
          source: 'linkedin'
        });
      }
    });

    // Generated emails
    (generatedEmails || []).forEach(entry => {
      if (!seen.has(entry.email)) {
        seen.add(entry.email);
        all.push(entry);
      }
    });

    // Sort by confidence
    all.sort((a, b) => b.confidence - a.confidence);
    return all;
  },

  /**
   * Get all contact info for a profile
   */
  findContacts(profileData) {
    const generated = this.generateEmails(
      profileData.firstName,
      profileData.lastName,
      profileData.company,
      profileData.companyUrl
    );

    const merged = this.mergeContacts(profileData.emails, generated);

    return {
      emails: merged,
      phones: (profileData.phones || []).map(p => ({
        phone: p,
        source: 'linkedin',
        confidence: 100
      })),
      websites: profileData.websites || []
    };
  }
};

if (typeof window !== 'undefined') {
  window.ContactFinder = ContactFinder;
}
