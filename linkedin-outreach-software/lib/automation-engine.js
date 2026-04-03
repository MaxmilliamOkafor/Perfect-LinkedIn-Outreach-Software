/**
 * LinkedIn Outreach Pro — Automation Engine
 * Core queue system for executing LinkedIn actions with human-like delays.
 * Zero limitations — all controls are user-configurable safety measures.
 */

const AutomationEngine = {
  // ─── State ─────────────────────────────────
  queue: [],
  isRunning: false,
  isPaused: false,
  currentAction: null,
  dailyCounters: {},
  listeners: [],

  // ─── Default Safety Limits (user-adjustable) ──
  DEFAULT_LIMITS: {
    connectionsPerDay: 50,
    messagesPerDay: 100,
    profileVisitsPerDay: 150,
    followsPerDay: 50,
    endorsementsPerDay: 30,
    minDelayMs: 3000,
    maxDelayMs: 8000,
    longPauseAfter: 15,    // Pause for extra time after N actions
    longPauseMs: 30000     // 30 second long pause
  },

  // ─── Action Types ──────────────────────────
  ACTION_TYPES: {
    VISIT_PROFILE: 'visit_profile',
    SEND_CONNECTION: 'send_connection',
    SEND_MESSAGE: 'send_message',
    FOLLOW: 'follow',
    ENDORSE: 'endorse',
    WITHDRAW_CONNECTION: 'withdraw_connection',
    LIKE_POST: 'like_post',
    COMMENT_POST: 'comment_post',
    VIEW_PROFILE: 'view_profile'
  },

  // ─── Initialize ────────────────────────────
  async init() {
    await this._loadDailyCounters();
    await this._loadQueue();
    console.log('[AutoEngine] Initialized. Queue:', this.queue.length, 'items');
  },

  // ─── Queue Management ─────────────────────
  async enqueue(action) {
    const entry = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: action.type,
      data: action.data || {},
      campaignId: action.campaignId || null,
      sequenceId: action.sequenceId || null,
      stepIndex: action.stepIndex || 0,
      leadId: action.leadId || null,
      priority: action.priority || 5,
      retries: 0,
      maxRetries: action.maxRetries || 3,
      status: 'queued',
      createdAt: new Date().toISOString(),
      scheduledFor: action.scheduledFor || null,
      error: null
    };
    this.queue.push(entry);
    this._sortQueue();
    await this._saveQueue();
    this._emit('action_queued', entry);
    return entry;
  },

  async enqueueBatch(actions) {
    const entries = [];
    for (const action of actions) {
      const entry = await this.enqueue(action);
      entries.push(entry);
    }
    return entries;
  },

  async removeFromQueue(actionId) {
    this.queue = this.queue.filter(a => a.id !== actionId);
    await this._saveQueue();
    this._emit('action_removed', { id: actionId });
  },

  async clearQueue() {
    this.queue = [];
    await this._saveQueue();
    this._emit('queue_cleared');
  },

  // ─── Execution Control ────────────────────
  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this._emit('engine_started');
    console.log('[AutoEngine] Started. Processing queue...');
    await this._processLoop();
  },

  pause() {
    this.isPaused = true;
    this._emit('engine_paused');
    console.log('[AutoEngine] Paused');
  },

  resume() {
    if (!this.isRunning) return this.start();
    this.isPaused = false;
    this._emit('engine_resumed');
    console.log('[AutoEngine] Resumed');
    this._processLoop();
  },

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    this.currentAction = null;
    this._emit('engine_stopped');
    console.log('[AutoEngine] Stopped');
  },

  // ─── Main Processing Loop ────────────────
  async _processLoop() {
    while (this.isRunning && !this.isPaused) {
      const next = this._getNextAction();
      if (!next) {
        console.log('[AutoEngine] Queue empty or no ready actions. Stopping.');
        this.isRunning = false;
        this._emit('queue_empty');
        break;
      }

      // Check daily limits
      const limitKey = this._getLimitKey(next.type);
      const limits = await this._getLimits();
      const count = this.dailyCounters[limitKey] || 0;
      const limit = limits[limitKey] || Infinity;

      if (count >= limit) {
        console.log(`[AutoEngine] Daily limit reached for ${limitKey}: ${count}/${limit}`);
        next.status = 'limit_reached';
        this._emit('limit_reached', { type: next.type, count, limit });
        // Skip this type, try next
        continue;
      }

      // Execute the action
      this.currentAction = next;
      next.status = 'running';
      this._emit('action_started', next);

      try {
        const result = await this._executeAction(next);
        next.status = 'completed';
        next.completedAt = new Date().toISOString();
        next.result = result;

        // Increment daily counter
        this.dailyCounters[limitKey] = (this.dailyCounters[limitKey] || 0) + 1;
        await this._saveDailyCounters();

        // Remove from queue
        this.queue = this.queue.filter(a => a.id !== next.id);
        await this._saveQueue();

        this._emit('action_completed', next);
        console.log(`[AutoEngine] ✓ ${next.type} completed`);

        // Long pause after N actions
        const totalToday = Object.values(this.dailyCounters).reduce((a, b) => a + b, 0);
        if (totalToday % (limits.longPauseAfter || 15) === 0) {
          console.log('[AutoEngine] Taking a long pause...');
          await this._sleep(limits.longPauseMs || 30000);
        }

      } catch (error) {
        console.error(`[AutoEngine] ✕ ${next.type} failed:`, error);
        next.retries++;
        next.error = error.message;

        if (next.retries >= next.maxRetries) {
          next.status = 'failed';
          this.queue = this.queue.filter(a => a.id !== next.id);
          this._emit('action_failed', next);
        } else {
          next.status = 'queued';
          this._emit('action_retrying', next);
        }
        await this._saveQueue();
      }

      this.currentAction = null;

      // Human-like delay between actions
      if (this.isRunning && !this.isPaused) {
        const delay = this._getRandomDelay(limits);
        console.log(`[AutoEngine] Waiting ${(delay/1000).toFixed(1)}s before next action...`);
        await this._sleep(delay);
      }
    }
  },

  // ─── Action Execution ─────────────────────
  async _executeAction(action) {
    // Send the action to the content script for execution
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ url: '*://*.linkedin.com/*' }, (tabs) => {
        if (!tabs || !tabs.length) {
          reject(new Error('No LinkedIn tab found'));
          return;
        }

        const tab = tabs[0];
        chrome.tabs.sendMessage(tab.id, {
          type: 'EXECUTE_ACTION',
          action: {
            type: action.type,
            data: action.data
          }
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          if (response && response.success) {
            resolve(response);
          } else {
            reject(new Error(response?.error || 'Action failed'));
          }
        });
      });
    });
  },

  // ─── Daily Counters ───────────────────────
  async _loadDailyCounters() {
    return new Promise(resolve => {
      chrome.storage.local.get('los_daily_counters', (r) => {
        const data = r.los_daily_counters || {};
        const today = new Date().toISOString().split('T')[0];

        // Reset if it's a new day
        if (data.date !== today) {
          this.dailyCounters = { date: today };
        } else {
          this.dailyCounters = data;
        }
        resolve();
      });
    });
  },

  async _saveDailyCounters() {
    const today = new Date().toISOString().split('T')[0];
    this.dailyCounters.date = today;
    return new Promise(resolve => {
      chrome.storage.local.set({ los_daily_counters: this.dailyCounters }, resolve);
    });
  },

  getDailyCounters() {
    return { ...this.dailyCounters };
  },

  async resetDailyCounters() {
    this.dailyCounters = { date: new Date().toISOString().split('T')[0] };
    await this._saveDailyCounters();
  },

  // ─── Queue Persistence ────────────────────
  async _loadQueue() {
    return new Promise(resolve => {
      chrome.storage.local.get('los_action_queue', (r) => {
        this.queue = r.los_action_queue || [];
        resolve();
      });
    });
  },

  async _saveQueue() {
    return new Promise(resolve => {
      chrome.storage.local.set({ los_action_queue: this.queue }, resolve);
    });
  },

  // ─── Limits ───────────────────────────────
  async _getLimits() {
    return new Promise(resolve => {
      chrome.storage.local.get('los_automation_limits', (r) => {
        resolve({ ...this.DEFAULT_LIMITS, ...(r.los_automation_limits || {}) });
      });
    });
  },

  async updateLimits(newLimits) {
    const current = await this._getLimits();
    const merged = { ...current, ...newLimits };
    return new Promise(resolve => {
      chrome.storage.local.set({ los_automation_limits: merged }, () => resolve(merged));
    });
  },

  // ─── Helpers ──────────────────────────────
  _getNextAction() {
    const now = new Date();
    return this.queue.find(a => {
      if (a.status !== 'queued') return false;
      if (a.scheduledFor && new Date(a.scheduledFor) > now) return false;
      return true;
    });
  },

  _sortQueue() {
    this.queue.sort((a, b) => {
      // Priority first (lower = higher priority)
      if (a.priority !== b.priority) return a.priority - b.priority;
      // Then by creation time
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  },

  _getLimitKey(actionType) {
    const map = {
      'visit_profile': 'profileVisitsPerDay',
      'view_profile': 'profileVisitsPerDay',
      'send_connection': 'connectionsPerDay',
      'send_message': 'messagesPerDay',
      'follow': 'followsPerDay',
      'endorse': 'endorsementsPerDay',
      'withdraw_connection': 'connectionsPerDay',
      'like_post': 'profileVisitsPerDay',
      'comment_post': 'messagesPerDay'
    };
    return map[actionType] || 'profileVisitsPerDay';
  },

  _getRandomDelay(limits) {
    const min = limits.minDelayMs || 3000;
    const max = limits.maxDelayMs || 8000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // ─── Event System ─────────────────────────
  on(event, callback) {
    this.listeners.push({ event, callback });
  },

  off(event, callback) {
    this.listeners = this.listeners.filter(l => !(l.event === event && l.callback === callback));
  },

  _emit(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try { l.callback(data); }
        catch (e) { console.warn('[AutoEngine] Listener error:', e); }
      });
  },

  // ─── Stats ────────────────────────────────
  getStatus() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      queueLength: this.queue.length,
      currentAction: this.currentAction,
      dailyCounters: { ...this.dailyCounters },
      pendingActions: this.queue.filter(a => a.status === 'queued').length,
      failedActions: this.queue.filter(a => a.status === 'failed').length
    };
  }
};

// Export
if (typeof globalThis !== 'undefined') {
  globalThis.AutomationEngine = AutomationEngine;
}
