export type UserStatus = 'Focus' | 'Available' | 'Away';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string;
  skills: string[];
  created_at: string;
}

export interface WorkContext {
  id: string;
  user_id: string;
  status: UserStatus;
  project: string;
  task: string;
  message: string;
  interrupt_for: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Teammate extends User {
  workContext: WorkContext;
}

export type EventCategory = 'BLOCKER' | 'DECISION' | 'ACTION' | 'FYI';

export interface WorkEvent {
  id: string;
  team_id: string;
  source: string;
  category: EventCategory;
  title: string;
  detail: string;
  project: string;
  target_user?: string;
  action_required: boolean;
  time_display: string;
  created_at: string;
}

export interface IntegrationStatus {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  lastSyncedStatus?: string;
  lastSyncedAt?: string;
}

export interface QueuedMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  recipient_id: string;
  recipient_name: string;
  urgency: 'Quick question' | 'Important' | 'Urgent';
  body: string;
  created_at: string;
  read: boolean;
}

export interface InterruptionEvaluation {
  verdict: 'APPROPRIATE TO CONTACT' | 'BETTER TO WAIT' | 'APPROPRIATE TO INTERRUPT';
  reason: string;
  status: string;
  interruptionPreference: string;
  suggestedAction: string;
}

export interface CatchUpBrief {
  readTimeSeconds: number;
  headline: string;
  blockers: WorkEvent[];
  decisions: WorkEvent[];
  actions: WorkEvent[];
  fyis: WorkEvent[];
  summary: string;
}

export interface EvidenceItem {
  time: string;
  source: string;
  note: string;
}

export interface ExplainWhyResult {
  explanation: string;
  evidenceTimeline: EvidenceItem[];
}
