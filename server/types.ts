export type UserStatus = 'Focus' | 'Available' | 'Away';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string;
  skills: string[];
  created_at: string;
  password_hash?: string;
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

export interface StatusHistoryItem {
  id: string;
  user_id: string;
  status: UserStatus;
  message: string;
  created_at: string;
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
