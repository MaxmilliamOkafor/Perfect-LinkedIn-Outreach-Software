/**
 * LinkedIn Outreach Software — AI Drafter
 * Uses OpenAI GPT to generate tailored outreach messages.
 * User provides their own API key — zero limitations.
 */

const AIDrafter = {
  /**
   * Draft an outreach message using OpenAI
   */
  async draftMessage(templatePrompt, variables, settings) {
    const apiKey = settings.openaiApiKey;

    // Fill in template variables
    let prompt = templatePrompt;
    Object.entries(variables).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value || 'N/A');
    });

    // If no API key, use smart template fallback
    if (!apiKey) {
      return this._templateFallback(variables);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: settings.aiModel || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert outreach copywriter. You write personalized, compelling outreach messages that get responses. 
Key rules:
- Be genuine and human — NEVER sound robotic or generic
- Personalize based on the recipient's specific role, company, and background
- Keep messages concise and action-oriented
- Use a ${settings.defaultTone || 'professional'} tone
- Never use clichés like "I hope this email finds you well" or "I came across your profile"
- Always include a clear, specific call to action
- Sound like a real person, not a template`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `API error: ${response.status}`);
      }

      const result = await response.json();
      const message = result.choices?.[0]?.message?.content?.trim();

      if (!message) throw new Error('Empty response from AI');

      return {
        success: true,
        message,
        model: settings.aiModel || 'gpt-4o-mini',
        source: 'ai'
      };

    } catch (error) {
      console.error('[LOS] AI Drafting error:', error);
      return {
        success: false,
        error: error.message,
        message: this._templateFallback(variables).message,
        source: 'fallback'
      };
    }
  },

  /**
   * Smart template fallback when no API key is set
   */
  _templateFallback(vars) {
    const name = vars.name || 'there';
    const firstName = name.split(' ')[0];
    const company = vars.company || 'your company';
    const title = vars.title || 'your role';
    const userName = vars.userName || 'I';
    const userTitle = vars.userTitle || '';
    const userCompany = vars.userCompany || '';
    const jobTitle = vars.jobTitle || '';

    let message = '';

    if (jobTitle) {
      // Job application template
      message = `Hi ${firstName},

I'm excited about the ${jobTitle} opportunity at ${company}. ${userTitle ? `As a ${userTitle}${userCompany ? ` at ${userCompany}` : ''}` : 'With my background'}, I believe I can bring meaningful value to your team.

I'd love to discuss how my experience aligns with what you're looking for. Would you be open to a brief conversation?

Best regards,
${userName}`;
    } else {
      // General outreach template
      message = `Hi ${firstName},

I noticed your work as ${title} at ${company} — impressive background.${userTitle ? ` I'm ${userName}, ${userTitle}${userCompany ? ` at ${userCompany}` : ''}.` : ''}

I'd love to connect and explore potential synergies. Would you be open to a quick chat this week?

Best,
${userName}`;
    }

    return {
      success: true,
      message,
      source: 'template'
    };
  },

  /**
   * Generate a LinkedIn connection note (max 300 chars)
   */
  async draftConnectionNote(variables, settings) {
    const templatePrompt = `Write a LinkedIn connection request message (STRICT MAX 300 characters) to {name}, {title} at {company}. I'm {userName}, {userTitle} at {userCompany}. Make it personal and specific. No generic messages. Return ONLY the message text, nothing else.`;

    const result = await this.draftMessage(templatePrompt, variables, settings);

    // Enforce 300 char limit for LinkedIn
    if (result.message && result.message.length > 300) {
      result.message = result.message.substring(0, 297) + '...';
    }

    return result;
  },

  /**
   * Generate a subject line for emails
   */
  async draftSubjectLine(variables, settings) {
    if (!settings.openaiApiKey) {
      const name = variables.name?.split(' ')[0] || '';
      const company = variables.company || '';
      return {
        success: true,
        message: variables.jobTitle
          ? `Re: ${variables.jobTitle} opportunity at ${company}`
          : `Quick question, ${name}`,
        source: 'template'
      };
    }

    const prompt = `Write 1 email subject line for outreach to {name}, {title} at {company}. ${variables.jobTitle ? `Regarding the ${variables.jobTitle} role.` : ''} Make it compelling and personal. Max 60 characters. Return ONLY the subject line.`;

    return this.draftMessage(prompt, variables, settings);
  }
};

if (typeof window !== 'undefined') {
  window.AIDrafter = AIDrafter;
}
