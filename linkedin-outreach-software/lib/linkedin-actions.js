/**
 * LinkedIn Outreach Pro — LinkedIn Actions
 * Direct LinkedIn page interactions — clicks buttons, fills forms, navigates.
 * Executed by the content script on LinkedIn pages.
 */

const LinkedInActions = {
  // ─── Action Router ─────────────────────────
  async execute(action) {
    console.log('[LinkedInActions] Executing:', action.type, action.data);

    switch (action.type) {
      case 'visit_profile':
      case 'view_profile':
        return await this.visitProfile(action.data);
      case 'send_connection':
        return await this.sendConnectionRequest(action.data);
      case 'send_message':
        return await this.sendMessage(action.data);
      case 'follow':
        return await this.followProfile(action.data);
      case 'endorse':
        return await this.endorseSkills(action.data);
      case 'withdraw_connection':
        return await this.withdrawConnection(action.data);
      case 'like_post':
        return await this.likePost(action.data);
      case 'comment_post':
        return await this.commentOnPost(action.data);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  },

  // ─── Visit Profile ─────────────────────────
  async visitProfile(data) {
    if (data.url && !window.location.href.includes(data.url)) {
      window.location.href = data.url;
      await this._sleep(3000);
    }
    // Simulate human-like scrolling
    await this._humanScroll();
    return { success: true, action: 'visit_profile', url: data.url };
  },

  // ─── Send Connection Request ───────────────
  async sendConnectionRequest(data) {
    // Navigate if needed
    if (data.url && !window.location.href.includes(data.url.split('?')[0])) {
      window.location.href = data.url;
      await this._sleep(3000);
    }

    // Find the Connect button (multiple selectors for LinkedIn's ever-changing UI)
    const connectBtn = this._findButton([
      'button[aria-label*="Invite"][aria-label*="connect"]',
      'button[aria-label*="Connect"]',
      '.pvs-profile-actions button[aria-label*="connect" i]',
      'main button.artdeco-button--primary',
      'button:has(span:contains("Connect"))'
    ]);

    if (!connectBtn) {
      // Try the "More" dropdown
      const moreBtn = this._findButton([
        'button[aria-label="More actions"]',
        '.artdeco-dropdown__trigger'
      ]);
      if (moreBtn) {
        this._humanClick(moreBtn);
        await this._sleep(1000);
        const connectInMenu = this._findByText('Connect', 'div[role="menuitem"], li button, span');
        if (connectInMenu) {
          this._humanClick(connectInMenu.closest('button, div[role="menuitem"], li') || connectInMenu);
          await this._sleep(1000);
        }
      }
    } else {
      this._humanClick(connectBtn);
      await this._sleep(1000);
    }

    // If there's a "Add a note" button in the modal, add the note
    if (data.note) {
      const addNoteBtn = this._findByText('Add a note', 'button');
      if (addNoteBtn) {
        this._humanClick(addNoteBtn);
        await this._sleep(500);

        const noteInput = document.querySelector('#custom-message, textarea[name="message"], .connect-button-send-invite__custom-message');
        if (noteInput) {
          await this._humanType(noteInput, data.note.substring(0, 300));
          await this._sleep(500);
        }
      }
    }

    // Click Send
    const sendBtn = this._findByText('Send', 'button') ||
                    document.querySelector('button[aria-label="Send invitation"]') ||
                    document.querySelector('button[aria-label="Send now"]');
    if (sendBtn) {
      this._humanClick(sendBtn);
      await this._sleep(1000);
    }

    return { success: true, action: 'send_connection', url: data.url, note: !!data.note };
  },

  // ─── Send Message ──────────────────────────
  async sendMessage(data) {
    if (data.url && !window.location.href.includes(data.url.split('?')[0])) {
      window.location.href = data.url;
      await this._sleep(3000);
    }

    // Click the Message button on the profile
    const msgBtn = this._findButton([
      'button[aria-label*="Message"]',
      '.pvs-profile-actions button:has(span:contains("Message"))',
      'a[href*="messaging"]'
    ]);

    if (msgBtn) {
      this._humanClick(msgBtn);
      await this._sleep(2000);
    }

    // Find the message input
    const msgInput = document.querySelector(
      '.msg-form__contenteditable, ' +
      'div[role="textbox"][contenteditable="true"], ' +
      '.msg-form__msg-content-container div[contenteditable]'
    );

    if (msgInput && data.message) {
      // Focus and type
      msgInput.focus();
      await this._sleep(300);
      
      // Use execCommand for contenteditable divs
      msgInput.innerHTML = '';
      document.execCommand('insertText', false, data.message);
      msgInput.dispatchEvent(new Event('input', { bubbles: true }));
      await this._sleep(500);

      // Click Send
      const sendBtn = document.querySelector(
        '.msg-form__send-button, ' +
        'button[type="submit"].msg-form__send-button, ' +
        'button.msg-form__send-btn'
      );
      if (sendBtn && !sendBtn.disabled) {
        this._humanClick(sendBtn);
        await this._sleep(1000);
      }
    }

    return { success: true, action: 'send_message', url: data.url };
  },

  // ─── Follow Profile ────────────────────────
  async followProfile(data) {
    if (data.url && !window.location.href.includes(data.url.split('?')[0])) {
      window.location.href = data.url;
      await this._sleep(3000);
    }

    const followBtn = this._findButton([
      'button[aria-label*="Follow"]',
      'button:has(span:contains("Follow"))'
    ]);

    if (followBtn) {
      this._humanClick(followBtn);
      await this._sleep(1000);
    }

    return { success: true, action: 'follow', url: data.url };
  },

  // ─── Endorse Skills ────────────────────────
  async endorseSkills(data) {
    if (data.url && !window.location.href.includes(data.url.split('?')[0])) {
      window.location.href = data.url;
      await this._sleep(3000);
    }

    // Scroll to skills section
    const skillsSection = document.querySelector('#skills, [id*="skill"]');
    if (skillsSection) {
      skillsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await this._sleep(1500);
    }

    // Find endorse buttons
    const endorseBtns = document.querySelectorAll(
      'button[aria-label*="Endorse"], .pvs-list__action button'
    );

    const count = data.count || 3;
    let endorsed = 0;

    for (let i = 0; i < Math.min(count, endorseBtns.length); i++) {
      const btn = endorseBtns[i];
      if (btn && !btn.classList.contains('artdeco-button--muted')) {
        this._humanClick(btn);
        endorsed++;
        await this._sleep(1500);
      }
    }

    return { success: true, action: 'endorse', endorsed, url: data.url };
  },

  // ─── Withdraw Connection ───────────────────
  async withdrawConnection(data) {
    if (data.url && !window.location.href.includes(data.url.split('?')[0])) {
      window.location.href = data.url;
      await this._sleep(3000);
    }

    const pendingBtn = this._findByText('Pending', 'button');
    if (pendingBtn) {
      this._humanClick(pendingBtn);
      await this._sleep(1000);

      const withdrawBtn = this._findByText('Withdraw', 'button');
      if (withdrawBtn) {
        this._humanClick(withdrawBtn);
        await this._sleep(1000);
      }
    }

    return { success: true, action: 'withdraw_connection', url: data.url };
  },

  // ─── Like Post ─────────────────────────────
  async likePost(data) {
    if (data.url && !window.location.href.includes(data.url)) {
      window.location.href = data.url;
      await this._sleep(3000);
    }

    const likeBtn = document.querySelector(
      'button[aria-label*="Like"], ' +
      '.react-button__trigger, ' +
      'button.reactions-react-button'
    );

    if (likeBtn) {
      this._humanClick(likeBtn);
      await this._sleep(1000);
    }

    return { success: true, action: 'like_post', url: data.url };
  },

  // ─── Comment on Post ───────────────────────
  async commentOnPost(data) {
    if (data.url && !window.location.href.includes(data.url)) {
      window.location.href = data.url;
      await this._sleep(3000);
    }

    // Click comment button to open input
    const commentBtn = document.querySelector(
      'button[aria-label*="Comment"], .comment-button'
    );
    if (commentBtn) {
      this._humanClick(commentBtn);
      await this._sleep(1500);
    }

    // Find comment input
    const commentInput = document.querySelector(
      '.ql-editor[contenteditable="true"], ' +
      '.comments-comment-box__form div[contenteditable]'
    );

    if (commentInput && data.text) {
      commentInput.focus();
      await this._sleep(300);
      document.execCommand('insertText', false, data.text);
      commentInput.dispatchEvent(new Event('input', { bubbles: true }));
      await this._sleep(500);

      // Submit
      const submitBtn = document.querySelector(
        'button.comments-comment-box__submit-button, ' +
        'button[type="submit"][class*="comment"]'
      );
      if (submitBtn && !submitBtn.disabled) {
        this._humanClick(submitBtn);
        await this._sleep(1000);
      }
    }

    return { success: true, action: 'comment_post', url: data.url };
  },

  // ─── Scrape Search Results for Bulk Import ──
  scrapeSearchResults() {
    const results = [];
    const cards = document.querySelectorAll(
      '.reusable-search__result-container, ' +
      '.entity-result, ' +
      '.search-results-container li'
    );

    cards.forEach((card, idx) => {
      if (idx >= 50) return;
      try {
        const nameEl = card.querySelector(
          '.entity-result__title-text a span[aria-hidden="true"], ' +
          '.entity-result__title-text a, ' +
          'a .t-roman'
        );
        const titleEl = card.querySelector('.entity-result__primary-subtitle');
        const locEl = card.querySelector('.entity-result__secondary-subtitle');
        const linkEl = card.querySelector('a[href*="/in/"]');
        const imgEl = card.querySelector('img.presence-entity__image, img.EntityPhoto-circle-5');

        const name = nameEl ? nameEl.textContent.replace(/\s+/g, ' ').trim() : '';
        if (name) {
          results.push({
            name,
            title: titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '',
            location: locEl ? locEl.textContent.replace(/\s+/g, ' ').trim() : '',
            linkedinUrl: linkEl ? linkEl.href.split('?')[0] : '',
            profileImage: imgEl ? imgEl.src : ''
          });
        }
      } catch (e) { /* skip */ }
    });

    return results;
  },

  // ─── Human-like Helpers ────────────────────
  _humanClick(el) {
    if (!el) return;
    // Simulate human-like click with small random offset
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 4;
    const y = rect.top + rect.height / 2 + (Math.random() - 0.5) * 4;

    el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: x, clientY: y }));
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: x, clientY: y }));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: x, clientY: y }));
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: y }));
  },

  async _humanType(input, text) {
    input.focus();
    input.value = '';
    for (const char of text) {
      input.value += char;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await this._sleep(30 + Math.random() * 70);
    }
    input.dispatchEvent(new Event('change', { bubbles: true }));
  },

  async _humanScroll() {
    const scrollSteps = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < scrollSteps; i++) {
      window.scrollBy({
        top: 200 + Math.random() * 400,
        behavior: 'smooth'
      });
      await this._sleep(800 + Math.random() * 1200);
    }
  },

  _findButton(selectors) {
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el) return el;
      } catch (e) { /* skip */ }
    }
    return null;
  },

  _findByText(text, tagSelector = '*') {
    const elements = document.querySelectorAll(tagSelector);
    for (const el of elements) {
      if (el.textContent.trim() === text || el.textContent.trim().includes(text)) {
        return el;
      }
    }
    return null;
  },

  _sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
};

if (typeof window !== 'undefined') {
  window.LinkedInActions = LinkedInActions;
}
