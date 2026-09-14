import {
  User,
  WorkContext,
  Teammate,
  WorkEvent,
  IntegrationStatus,
  QueuedMessage,
  InterruptionEvaluation,
  CatchUpBrief,
  ExplainWhyResult,
  UserStatus,
} from '../types/index.ts';

const memoryStore = new Map<string, string>();

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Handle sandboxed iframe restrictions gracefully
    }
    return memoryStore.get(key) ?? null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Handle sandboxed iframe restrictions gracefully
    }
    memoryStore.set(key, value);
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Handle sandboxed iframe restrictions gracefully
    }
    memoryStore.delete(key);
  },
};

const getHeaders = () => {
  const userId = safeStorage.getItem('omniwork_user_id') || 'user-me';
  return {
    'Content-Type': 'application/json',
    'x-user-id': userId,
  };
};

export const api = {
  // Auth
  async loginDemo(): Promise<{ user: User; workContext: WorkContext; token: string }> {
    const res = await fetch('/api/auth/demo', { method: 'POST', headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to login with demo');
    const data = await res.json();
    safeStorage.setItem('omniwork_user_id', data.user.id);
    return data;
  },

  async resetDemo(): Promise<{ user: User; workContext: WorkContext }> {
    const res = await fetch('/api/auth/reset-demo', { method: 'POST', headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to reset demo');
    return res.json();
  },

  async login(email: string): Promise<{ user: User; workContext: WorkContext; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to login');
    }
    const data = await res.json();
    safeStorage.setItem('omniwork_user_id', data.user.id);
    return data;
  },

  async register(name: string, email: string, role: string, skills: string[]): Promise<{ user: User; workContext: WorkContext }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, role, skills }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register');
    }
    const data = await res.json();
    safeStorage.setItem('omniwork_user_id', data.user.id);
    return data;
  },

  async getMe(): Promise<{ user: User; workContext: WorkContext }> {
    const res = await fetch('/api/auth/me', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  async updateProfile(updates: { name?: string; role?: string; avatar_url?: string; skills?: string[] }): Promise<{ user: User; workContext: WorkContext }> {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update profile');
    }
    return res.json();
  },

  // Status & Work Context
  async updateStatus(params: {
    status: UserStatus;
    project?: string;
    task?: string;
    message?: string;
    interrupt_for?: string;
    expires_at?: string | null;
  }): Promise<{ workContext: WorkContext }> {
    const res = await fetch('/api/status/update', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  async returnToAvailable(): Promise<{ workContext: WorkContext }> {
    const res = await fetch('/api/status/return-available', {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to return to available');
    return res.json();
  },

  // Team
  async getTeam(): Promise<{ team: Teammate[] }> {
    const res = await fetch('/api/team', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch team');
    return res.json();
  },

  async getTeamPulse(): Promise<{
    counts: { available: number; focus: number; away: number };
    summary: string;
  }> {
    const res = await fetch('/api/team/pulse', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch team pulse');
    return res.json();
  },

  // AI Features
  async structureContext(input: string): Promise<{
    status: UserStatus;
    message: string;
    project: string;
    task: string;
    until: string | null;
    interrupt_for: string;
  }> {
    const res = await fetch('/api/structure-context', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ input }),
    });
    if (!res.ok) throw new Error('Failed to structure context');
    return res.json();
  },

  async generateStatusMessage(input: string, tone?: string): Promise<{
    allVariations: { professional: string; friendly: string; concise: string };
  }> {
    const res = await fetch('/api/generate-status-message', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ input, tone }),
    });
    if (!res.ok) throw new Error('Failed to generate status message');
    return res.json();
  },

  async checkInterruption(params: {
    teammateId?: string;
    teammateName?: string;
    status?: string;
    interruptPreference?: string;
    customMessage?: string;
    expiresAt?: string | null;
    userRequest: string;
    urgency: 'Quick question' | 'Important' | 'Urgent';
  }): Promise<InterruptionEvaluation> {
    const res = await fetch('/api/check-interruption', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to check interruption');
    return res.json();
  },

  async generateMessage(params: {
    recipientId?: string;
    recipientName?: string;
    recipientStatus?: string;
    recipientTask?: string;
    rawGoal: string;
    tone: 'Professional' | 'Friendly' | 'Concise' | 'Urgent';
  }): Promise<{ generatedMessage: string; tone: string; isRecipientFocused: boolean }> {
    const res = await fetch('/api/generate-message', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to generate message');
    return res.json();
  },

  async askOmni(question: string): Promise<{
    answer: string;
    sources: Array<{ name: string; status: string; detail: string }>;
    suggestedFollowUps?: string[];
  }> {
    const res = await fetch('/api/ask-omni', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error('Failed to query OmniWork AI');
    return res.json();
  },

  async getTeamRecommendations(skillOrTopic: string): Promise<{
    matches: Array<{
      user: User;
      status: UserStatus;
      expires_at: string | null;
      matchScore: number;
      reason: string;
    }>;
  }> {
    const res = await fetch('/api/team-recommendation', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ skillOrTopic }),
    });
    if (!res.ok) throw new Error('Failed to get team recommendations');
    return res.json();
  },

  // Events & Catch-Up
  async getEvents(): Promise<{ events: WorkEvent[] }> {
    const res = await fetch('/api/events', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  async getCatchUpBrief(): Promise<CatchUpBrief> {
    const res = await fetch('/api/events/brief', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to generate catch-up brief');
    return res.json();
  },

  async explainWhy(eventTitle: string, eventDetail?: string): Promise<ExplainWhyResult> {
    const res = await fetch('/api/events/explain-why', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ eventTitle, eventDetail }),
    });
    if (!res.ok) throw new Error('Failed to explain why');
    return res.json();
  },

  // Integrations
  async getIntegrations(): Promise<{ integrations: IntegrationStatus[] }> {
    const res = await fetch('/api/integrations', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch integrations');
    return res.json();
  },

  async toggleIntegration(id: string): Promise<{ success: boolean; integrations: IntegrationStatus[] }> {
    const res = await fetch(`/api/integrations/${id}/toggle`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to toggle integration');
    return res.json();
  },

  // Queued Messages
  async getMessages(): Promise<{ messages: QueuedMessage[]; unreadCount: number }> {
    const res = await fetch('/api/messages', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  async sendMessage(params: {
    recipient_id: string;
    urgency: 'Quick question' | 'Important' | 'Urgent';
    body: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/messages/send', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  async markMessagesRead(): Promise<{ success: boolean }> {
    const res = await fetch('/api/messages/mark-read', {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to mark messages as read');
    return res.json();
  },
};
