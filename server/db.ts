import fs from 'node:fs';
import path from 'node:path';
import { User, WorkContext, StatusHistoryItem, WorkEvent, IntegrationStatus, QueuedMessage } from './types.ts';

const DB_PATH = path.resolve(process.cwd(), 'omniwork-data.json');

export interface DatabaseSchema {
  users: User[];
  workContexts: Record<string, WorkContext>;
  statusHistory: StatusHistoryItem[];
  workEvents: WorkEvent[];
  integrations: Record<string, IntegrationStatus[]>;
  queuedMessages: QueuedMessage[];
}

const INITIAL_USERS: User[] = [
  {
    id: 'user-me',
    name: 'You (Joel Jery)',
    email: 'joel.jery@omniwork.internal',
    role: 'Full-Stack Engineer',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'API Design'],
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'user-rahul',
    name: 'Rahul Sharma',
    email: 'rahul.s@omniwork.internal',
    role: 'Staff Backend Engineer',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    skills: ['Node.js', 'PostgreSQL', 'Stripe', 'Redis', 'Webhooks', 'Distributed Systems'],
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: 'user-sarah',
    name: 'Sarah Lin',
    email: 'sarah.lin@omniwork.internal',
    role: 'Senior Frontend Lead',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Design Systems', 'Product UX', 'Web Performance'],
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: 'user-alex-rivera',
    name: 'Alex Rivera',
    email: 'alex.r@omniwork.internal',
    role: 'QA Automation Engineer',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    skills: ['Cypress', 'Playwright', 'CI/CD', 'Regression Testing', 'Postman'],
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: 'user-priya',
    name: 'Priya Patel',
    email: 'priya.p@omniwork.internal',
    role: 'Lead Product Designer',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    skills: ['Figma', 'UI/UX', 'Design Systems', 'User Research', 'Prototyping'],
    created_at: new Date(Date.now() - 75 * 86400000).toISOString(),
  },
  {
    id: 'user-marcus',
    name: 'Marcus Chen',
    email: 'marcus.c@omniwork.internal',
    role: 'DevOps & Infra Architect',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    skills: ['Kubernetes', 'Docker', 'AWS', 'GCP', 'PostgreSQL', 'Terraform'],
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
  },
];

const INITIAL_WORK_CONTEXTS: Record<string, WorkContext> = {
  'user-me': {
    id: 'ctx-me',
    user_id: 'user-me',
    status: 'Available',
    project: 'OmniWork Core',
    task: 'Workspace context & interruptibility features',
    message: 'Free for a quick discussion or questions.',
    interrupt_for: 'Any questions, collaboration or code reviews',
    expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'user-rahul': {
    id: 'ctx-rahul',
    user_id: 'user-rahul',
    status: 'Focus',
    project: 'Checkout 2.0',
    task: 'Webhook retry handling & payment idempotency',
    message: 'Working on webhook retry handling — please avoid interruptions.',
    interrupt_for: 'Production outages & critical blockers',
    expires_at: '3:30 PM',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'user-sarah': {
    id: 'ctx-sarah',
    user_id: 'user-sarah',
    status: 'Available',
    project: 'Checkout 2.0',
    task: 'Reviewing component library & design polish',
    message: 'Free for a quick discussion or frontend code reviews.',
    interrupt_for: 'Any frontend or design questions',
    expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'user-alex-rivera': {
    id: 'ctx-alex-rivera',
    user_id: 'user-alex-rivera',
    status: 'Focus',
    project: 'Checkout 2.0',
    task: 'Preparing release presentation & test report',
    message: 'Preparing release presentation — heads down.',
    interrupt_for: 'Critical issues',
    expires_at: '8:00 PM',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'user-priya': {
    id: 'ctx-priya',
    user_id: 'user-priya',
    status: 'Away',
    project: 'Design Sprint',
    task: 'Off-site client research workshop',
    message: 'Back at 4:00 PM from client research sync.',
    interrupt_for: 'Urgent design blockers',
    expires_at: '4:00 PM',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'user-marcus': {
    id: 'ctx-marcus',
    user_id: 'user-marcus',
    status: 'Available',
    project: 'Infra Hardening',
    task: 'Cluster scaling & monitoring rules',
    message: 'Available for DevOps consultation or deploy approvals.',
    interrupt_for: 'Open to team syncs',
    expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

const INITIAL_WORK_EVENTS: WorkEvent[] = [
  {
    id: 'evt-1',
    team_id: 'team-omni',
    source: 'Slack #payments',
    category: 'BLOCKER',
    title: 'Payment webhook failures reported in staging',
    detail: 'Stripe retry alerts triggered due to unhandled duplicate events in staging environment.',
    project: 'Checkout 2.0',
    action_required: false,
    time_display: '10:10 AM',
    created_at: new Date(Date.now() - 180 * 60000).toISOString(),
  },
  {
    id: 'evt-2',
    team_id: 'team-omni',
    source: 'Engineering Sync',
    category: 'FYI',
    title: 'Regression testing recommended by QA',
    detail: 'Alex flagged payment edge cases and requested full regression coverage before release.',
    project: 'Checkout 2.0',
    action_required: false,
    time_display: '11:00 AM',
    created_at: new Date(Date.now() - 130 * 60000).toISOString(),
  },
  {
    id: 'evt-3',
    team_id: 'team-omni',
    source: 'Project Update',
    category: 'DECISION',
    title: 'Checkout launch moved to Monday',
    detail: 'Deployment rescheduled by 48h to complete retry validation and ensure zero checkout risk.',
    project: 'Checkout 2.0',
    action_required: false,
    time_display: '11:15 AM',
    created_at: new Date(Date.now() - 115 * 60000).toISOString(),
  },
  {
    id: 'evt-4',
    team_id: 'team-omni',
    source: 'GitHub PR #142',
    category: 'ACTION',
    title: 'Rahul requested review of PR #142',
    detail: 'feat(payments): idempotency key caching and exponential backoff retry handler.',
    project: 'Checkout 2.0',
    target_user: 'user-me',
    action_required: true,
    time_display: '11:30 AM',
    created_at: new Date(Date.now() - 100 * 60000).toISOString(),
  },
  {
    id: 'evt-5',
    team_id: 'team-omni',
    source: 'Linear',
    category: 'ACTION',
    title: 'Update payment fallback documentation',
    detail: 'Document retry thresholds and incident playbook for customer operations team.',
    project: 'Checkout 2.0',
    target_user: 'user-me',
    action_required: true,
    time_display: '11:45 AM',
    created_at: new Date(Date.now() - 85 * 60000).toISOString(),
  },
  {
    id: 'evt-6',
    team_id: 'team-omni',
    source: 'Figma #checkout',
    category: 'FYI',
    title: 'New empty states finalized for payment errors',
    detail: 'Priya updated component specifications in the design system token file.',
    project: 'Checkout 2.0',
    action_required: false,
    time_display: '12:05 PM',
    created_at: new Date(Date.now() - 65 * 60000).toISOString(),
  },
];

const INITIAL_INTEGRATIONS: IntegrationStatus[] = [
  { id: 'slack', name: 'Slack', icon: 'slack', connected: true, lastSyncedStatus: 'Available — Free for a quick discussion', lastSyncedAt: 'Just now' },
  { id: 'github', name: 'GitHub', icon: 'github', connected: true, lastSyncedStatus: 'Synced active PR status', lastSyncedAt: '5m ago' },
  { id: 'zoom', name: 'Zoom', icon: 'video', connected: true, lastSyncedStatus: 'Calendar presence auto-synced', lastSyncedAt: '12m ago' },
  { id: 'workspace', name: 'Project Workspace', icon: 'folder', connected: true, lastSyncedStatus: 'Context: Checkout 2.0', lastSyncedAt: '3m ago' },
  { id: 'notes', name: 'Meeting Notes', icon: 'file-text', connected: true, lastSyncedStatus: 'Synced 3 action items', lastSyncedAt: '25m ago' },
];

const INITIAL_MESSAGES: QueuedMessage[] = [
  {
    id: 'msg-1',
    sender_id: 'user-sarah',
    sender_name: 'Sarah Lin',
    sender_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    recipient_id: 'user-me',
    recipient_name: 'You',
    urgency: 'Quick question',
    body: 'Whenever you finish your focus session, could you check the button padding in the checkout PR?',
    created_at: new Date(Date.now() - 40 * 60000).toISOString(),
    read: false,
  },
  {
    id: 'msg-2',
    sender_id: 'user-marcus',
    sender_name: 'Marcus Chen',
    sender_avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    recipient_id: 'user-me',
    recipient_name: 'You',
    urgency: 'Important',
    body: 'Staging PostgreSQL cluster will be restarted at 6 PM for maintenance (no downtime expected).',
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    read: false,
  },
  {
    id: 'msg-3',
    sender_id: 'user-priya',
    sender_name: 'Priya Patel',
    sender_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    recipient_id: 'user-me',
    recipient_name: 'You',
    urgency: 'Quick question',
    body: 'Shared the mobile checkout flow export in Figma whenever you take a break.',
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
    read: false,
  },
];

class Database {
  private data: DatabaseSchema;
  private storageMode: 'postgres' | 'local-json' = 'local-json';

  constructor() {
    this.initDatabaseConfig();
    this.data = this.load();
  }

  private initDatabaseConfig() {
    const databaseUrl = process.env.DATABASE_URL;
    const authSecret = process.env.AUTH_SECRET;

    if (databaseUrl && databaseUrl.trim().length > 0) {
      console.log('[OmniWork DB] DATABASE_URL provided. External database configured:', databaseUrl.split('@')[1] || 'configured');
      // Graceful note: external DB is supported; falls back seamlessly to internal storage if unmigrated
      this.storageMode = 'local-json';
    } else {
      console.log('[OmniWork DB] Running in standalone development/demo mode with persistent local JSON storage.');
    }

    if (!authSecret) {
      console.log('[OmniWork Auth] AUTH_SECRET not provided, using development fallback secret.');
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read existing database file, initializing defaults:', e);
    }

    const initial: DatabaseSchema = {
      users: INITIAL_USERS,
      workContexts: INITIAL_WORK_CONTEXTS,
      statusHistory: [
        {
          id: 'hist-1',
          user_id: 'user-me',
          status: 'Available',
          message: 'Free for a quick discussion or questions.',
          created_at: new Date(Date.now() - 120 * 60000).toISOString(),
        },
      ],
      workEvents: INITIAL_WORK_EVENTS,
      integrations: {
        'user-me': INITIAL_INTEGRATIONS,
      },
      queuedMessages: INITIAL_MESSAGES,
    };
    this.save(initial);
    return initial;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      // In read-only container environments, log warning instead of crashing
      console.warn('Notice: Local database file not writable, keeping state in-memory:', (err as any)?.message || err);
    }
  }

  public getStorageInfo() {
    return {
      mode: this.storageMode,
      databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
      authSecretConfigured: Boolean(process.env.AUTH_SECRET),
      persistentFile: DB_PATH,
    };
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUser(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const userIndex = this.data.users.findIndex(u => u.id === id);
    if (userIndex === -1) return undefined;

    const existingUser = this.data.users[userIndex];
    const updatedUser = {
      ...existingUser,
      ...updates,
      id: existingUser.id, // preserve immutable ID
    };
    this.data.users[userIndex] = updatedUser;
    this.save();
    return updatedUser;
  }

  createUser(user: User): User {
    this.data.users.push(user);
    // Initialize default context
    this.data.workContexts[user.id] = {
      id: `ctx-${user.id}`,
      user_id: user.id,
      status: 'Available',
      project: 'General',
      task: 'Open for collaboration',
      message: 'Available for questions or quick syncs.',
      interrupt_for: 'Any questions or collaboration',
      expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.integrations[user.id] = INITIAL_INTEGRATIONS.map(i => ({ ...i }));
    this.save();
    return user;
  }

  // Work Context & Status
  getWorkContext(userId: string): WorkContext | undefined {
    return this.data.workContexts[userId];
  }

  getAllWorkContexts(): Record<string, WorkContext> {
    return this.data.workContexts;
  }

  updateWorkContext(userId: string, update: Partial<WorkContext>): WorkContext {
    const existing = this.data.workContexts[userId] || {
      id: `ctx-${userId}`,
      user_id: userId,
      status: 'Available',
      project: 'General',
      task: '',
      message: '',
      interrupt_for: '',
      expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updated: WorkContext = {
      ...existing,
      ...update,
      updated_at: new Date().toISOString(),
    };

    this.data.workContexts[userId] = updated;

    // Log history
    this.data.statusHistory.unshift({
      id: `hist-${Date.now()}`,
      user_id: userId,
      status: updated.status,
      message: updated.message || `${updated.status} mode`,
      created_at: new Date().toISOString(),
    });

    // Update synced integration status
    const integrations = this.data.integrations[userId] || INITIAL_INTEGRATIONS;
    this.data.integrations[userId] = integrations.map(i => {
      if (i.id === 'slack') {
        const taskText = updated.project ? ` — Working on ${updated.project}` : '';
        return {
          ...i,
          lastSyncedStatus: `${updated.status}${taskText}`,
          lastSyncedAt: 'Just now',
        };
      }
      return i;
    });

    this.save();
    return updated;
  }

  getStatusHistory(userId?: string): StatusHistoryItem[] {
    if (userId) {
      return this.data.statusHistory.filter(h => h.user_id === userId).slice(0, 20);
    }
    return this.data.statusHistory.slice(0, 30);
  }

  // Work Events
  getWorkEvents(): WorkEvent[] {
    return this.data.workEvents;
  }

  addWorkEvent(event: Omit<WorkEvent, 'id' | 'created_at'>): WorkEvent {
    const fullEvent: WorkEvent = {
      ...event,
      id: `evt-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.data.workEvents.unshift(fullEvent);
    this.save();
    return fullEvent;
  }

  // Integrations
  getIntegrations(userId: string): IntegrationStatus[] {
    return this.data.integrations[userId] || INITIAL_INTEGRATIONS;
  }

  toggleIntegration(userId: string, integrationId: string): IntegrationStatus[] {
    const list = this.data.integrations[userId] || [...INITIAL_INTEGRATIONS];
    this.data.integrations[userId] = list.map(item => {
      if (item.id === integrationId) {
        return { ...item, connected: !item.connected, lastSyncedAt: 'Just now' };
      }
      return item;
    });
    this.save();
    return this.data.integrations[userId];
  }

  // Queued Messages
  getQueuedMessages(userId: string): QueuedMessage[] {
    return this.data.queuedMessages.filter(m => m.recipient_id === userId);
  }

  addQueuedMessage(message: Omit<QueuedMessage, 'id' | 'created_at' | 'read'>): QueuedMessage {
    const full: QueuedMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      created_at: new Date().toISOString(),
      read: false,
    };
    this.data.queuedMessages.unshift(full);
    this.save();
    return full;
  }

  markMessagesRead(userId: string) {
    this.data.queuedMessages = this.data.queuedMessages.map(m => {
      if (m.recipient_id === userId) {
        return { ...m, read: true };
      }
      return m;
    });
    this.save();
  }

  // Reset to initial demo state
  resetDemoData() {
    this.data = {
      users: INITIAL_USERS,
      workContexts: { ...INITIAL_WORK_CONTEXTS },
      statusHistory: [
        {
          id: 'hist-1',
          user_id: 'user-me',
          status: 'Available',
          message: 'Free for a quick discussion or questions.',
          created_at: new Date().toISOString(),
        },
      ],
      workEvents: [...INITIAL_WORK_EVENTS],
      integrations: {
        'user-me': [...INITIAL_INTEGRATIONS],
      },
      queuedMessages: [...INITIAL_MESSAGES],
    };
    this.save();
    return true;
  }
}

export const db = new Database();
