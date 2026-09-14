import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Teammate, QueuedMessage, WorkEvent } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';

export type ViewType = 'dashboard' | 'team' | 'catchup' | 'ask-omni' | 'integrations' | 'settings';

interface AppContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  teammates: Teammate[];
  refreshTeammates: () => Promise<void>;
  teamPulse: { counts: { available: number; focus: number; away: number }; summary: string } | null;
  refreshTeamPulse: () => Promise<void>;
  queuedMessages: QueuedMessage[];
  unreadCount: number;
  refreshMessages: () => Promise<void>;
  markMessagesRead: () => Promise<void>;
  // Modals
  workContextModalOpen: boolean;
  openWorkContextModal: () => void;
  closeWorkContextModal: () => void;
  // Should I Interrupt
  shouldIInterruptModalOpen: boolean;
  targetTeammate: Teammate | null;
  openShouldIInterrupt: (teammate: Teammate) => void;
  closeShouldIInterrupt: () => void;
  // Message Writer
  messageWriterModalOpen: boolean;
  messageRecipient: Teammate | null;
  initialMessageGoal: string;
  openMessageWriter: (recipient: Teammate, initialGoal?: string) => void;
  closeMessageWriter: () => void;
  // Explain Why
  explainWhyModalOpen: boolean;
  targetEvent: WorkEvent | null;
  openExplainWhy: (event: WorkEvent) => void;
  closeExplainWhy: () => void;
  // Demo Walkthrough
  demoWalkthroughOpen: boolean;
  openDemoWalkthrough: () => void;
  closeDemoWalkthrough: () => void;
  // Notifications Drawer
  notificationsDrawerOpen: boolean;
  openNotificationsDrawer: () => void;
  closeNotificationsDrawer: () => void;
  // Toast
  toast: { message: string; type: 'success' | 'info' | 'warning' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  // Tool Sync Notice
  syncedToolNotice: string | null;
  setSyncedToolNotice: (notice: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const FALLBACK_TEAMMATES: Teammate[] = [
  {
    id: 'user-me',
    name: 'You (Joel Jery)',
    email: 'joel.jery@omniwork.internal',
    role: 'Full-Stack Engineer',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'API Design'],
    created_at: new Date().toISOString(),
    workContext: {
      id: 'ctx-user-me',
      user_id: 'user-me',
      status: 'Focus',
      project: 'Checkout 2.0',
      task: 'Finishing idempotency key retry handler and PR review before deploy',
      message: 'In deep focus until 6:00 PM. Working on Checkout 2.0 critical paths.',
      interrupt_for: 'Critical blockers & production outages only',
      expires_at: '6:00 PM',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  {
    id: 'user-rahul',
    name: 'Rahul Sharma',
    email: 'rahul.s@omniwork.internal',
    role: 'Staff Backend Engineer',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    skills: ['Node.js', 'PostgreSQL', 'Stripe', 'Redis', 'Webhooks', 'Distributed Systems'],
    created_at: new Date().toISOString(),
    workContext: {
      id: 'ctx-rahul',
      user_id: 'user-rahul',
      status: 'Focus',
      project: 'Checkout 2.0',
      task: 'Investigating Stripe 3D Secure 2.0 authentication edge-cases',
      message: 'Deep into Stripe webhook retry logs. Please do not interrupt unless checkout fails.',
      interrupt_for: 'Checkout or payment service outages',
      expires_at: '5:30 PM',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  {
    id: 'user-sarah',
    name: 'Sarah Lin',
    email: 'sarah.lin@omniwork.internal',
    role: 'Senior Frontend Lead',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Design Systems', 'Product UX', 'Web Performance'],
    created_at: new Date().toISOString(),
    workContext: {
      id: 'ctx-sarah',
      user_id: 'user-sarah',
      status: 'Available',
      project: 'Design System Migration',
      task: 'Reviewing component library tokens & documentation',
      message: 'Free for questions, PR reviews, and frontend quick-syncs.',
      interrupt_for: 'Any questions, PR reviews, or design discussions',
      expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  {
    id: 'user-alex-rivera',
    name: 'Alex Rivera',
    email: 'alex.r@omniwork.internal',
    role: 'QA Automation Engineer',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    skills: ['Cypress', 'Playwright', 'CI/CD', 'Regression Testing', 'Postman'],
    created_at: new Date().toISOString(),
    workContext: {
      id: 'ctx-alex-r',
      user_id: 'user-alex-rivera',
      status: 'Available',
      project: 'Checkout 2.0',
      task: 'Running end-to-end regression test suite on staging',
      message: 'Available to verify PRs or assist with test debugging.',
      interrupt_for: 'Test failures and staging deployment checks',
      expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  {
    id: 'user-priya',
    name: 'Priya Patel',
    email: 'priya.p@omniwork.internal',
    role: 'Lead Product Designer',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    skills: ['Figma', 'UI/UX', 'Design Systems', 'User Research', 'Prototyping'],
    created_at: new Date().toISOString(),
    workContext: {
      id: 'ctx-priya',
      user_id: 'user-priya',
      status: 'Away',
      project: 'Checkout 2.0',
      task: 'User interview synthesis with 5 beta merchants',
      message: 'Conducting customer interviews until 4:30 PM.',
      interrupt_for: 'Urgent design blocker or design handoff review',
      expires_at: '4:30 PM',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  },
  {
    id: 'user-marcus',
    name: 'Marcus Chen',
    email: 'marcus.c@omniwork.internal',
    role: 'Staff DevOps & Infra',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    skills: ['Kubernetes', 'Terraform', 'GCP', 'PostgreSQL', 'Monitoring', 'Docker'],
    created_at: new Date().toISOString(),
    workContext: {
      id: 'ctx-marcus',
      user_id: 'user-marcus',
      status: 'Available',
      project: 'Infrastructure Scaling',
      task: 'Database read-replica load tests & latency monitoring',
      message: 'Monitoring deployment pipelines. Available for infra questions.',
      interrupt_for: 'Deployment pipelines and infrastructure issues',
      expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, workContext } = useAuth();
  
  // Read initial view from window.location.hash if present (e.g. #catchup, #team)
  const getInitialView = (): ViewType => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const validViews: ViewType[] = ['dashboard', 'team', 'catchup', 'ask-omni', 'integrations', 'settings'];
      if (validViews.includes(hash as ViewType)) {
        return hash as ViewType;
      }
    }
    return 'dashboard';
  };

  const [currentView, setCurrentViewState] = useState<ViewType>(getInitialView);

  const setCurrentView = useCallback((view: ViewType) => {
    setCurrentViewState(view);
    if (typeof window !== 'undefined') {
      window.location.hash = view;
    }
  }, []);

  // Listen for hash changes when navigating via back/forward or direct links
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const validViews: ViewType[] = ['dashboard', 'team', 'catchup', 'ask-omni', 'integrations', 'settings'];
      if (validViews.includes(hash as ViewType)) {
        setCurrentViewState(hash as ViewType);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [teammates, setTeammates] = useState<Teammate[]>(FALLBACK_TEAMMATES);
  const [teamPulse, setTeamPulse] = useState<{ counts: { available: number; focus: number; away: number }; summary: string } | null>(null);
  const [queuedMessages, setQueuedMessages] = useState<QueuedMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Modals
  const [workContextModalOpen, setWorkContextModalOpen] = useState(false);
  const [shouldIInterruptModalOpen, setShouldIInterruptModalOpen] = useState(false);
  const [targetTeammate, setTargetTeammate] = useState<Teammate | null>(null);
  const [messageWriterModalOpen, setMessageWriterModalOpen] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<Teammate | null>(null);
  const [initialMessageGoal, setInitialMessageGoal] = useState<string>('');
  const [explainWhyModalOpen, setExplainWhyModalOpen] = useState(false);
  const [targetEvent, setTargetEvent] = useState<WorkEvent | null>(null);
  const [demoWalkthroughOpen, setDemoWalkthroughOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);

  // Feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [syncedToolNotice, setSyncedToolNotice] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  const refreshTeammates = useCallback(async () => {
    try {
      const data = await api.getTeam();
      setTeammates(data.team);
    } catch (err) {
      console.error('Failed to load team:', err);
    }
  }, []);

  const refreshTeamPulse = useCallback(async () => {
    try {
      const data = await api.getTeamPulse();
      setTeamPulse(data);
    } catch (err) {
      console.error('Failed to load team pulse:', err);
    }
  }, []);

  const refreshMessages = useCallback(async () => {
    try {
      const data = await api.getMessages();
      setQueuedMessages(data.messages);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, []);

  const markMessagesRead = async () => {
    try {
      await api.markMessagesRead();
      setUnreadCount(0);
      setQueuedMessages(prev => prev.map(m => ({ ...m, read: true })));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  useEffect(() => {
    if (user) {
      refreshTeammates();
      refreshTeamPulse();
      refreshMessages();
    }
  }, [user, refreshTeammates, refreshTeamPulse, refreshMessages]);

  // Sync tool notice when user's work context changes
  useEffect(() => {
    if (workContext) {
      const projectText = workContext.project ? ` — Working on ${workContext.project}` : '';
      setSyncedToolNotice(`Slack: ${workContext.status}${projectText}`);
    }
  }, [workContext]);

  const openWorkContextModal = () => setWorkContextModalOpen(true);
  const closeWorkContextModal = () => setWorkContextModalOpen(false);

  const openShouldIInterrupt = (teammate: Teammate) => {
    setTargetTeammate(teammate);
    setShouldIInterruptModalOpen(true);
  };
  const closeShouldIInterrupt = () => {
    setShouldIInterruptModalOpen(false);
    setTargetTeammate(null);
  };

  const openMessageWriter = (recipient: Teammate, initialGoal?: string) => {
    setMessageRecipient(recipient);
    setInitialMessageGoal(initialGoal || '');
    setMessageWriterModalOpen(true);
  };
  const closeMessageWriter = () => {
    setMessageWriterModalOpen(false);
    setMessageRecipient(null);
    setInitialMessageGoal('');
  };

  const openExplainWhy = (event: WorkEvent) => {
    setTargetEvent(event);
    setExplainWhyModalOpen(true);
  };
  const closeExplainWhy = () => {
    setExplainWhyModalOpen(false);
    setTargetEvent(null);
  };

  const openDemoWalkthrough = () => setDemoWalkthroughOpen(true);
  const closeDemoWalkthrough = () => setDemoWalkthroughOpen(false);

  const openNotificationsDrawer = () => setNotificationsDrawerOpen(true);
  const closeNotificationsDrawer = () => setNotificationsDrawerOpen(false);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        teammates,
        refreshTeammates,
        teamPulse,
        refreshTeamPulse,
        queuedMessages,
        unreadCount,
        refreshMessages,
        markMessagesRead,
        workContextModalOpen,
        openWorkContextModal,
        closeWorkContextModal,
        shouldIInterruptModalOpen,
        targetTeammate,
        openShouldIInterrupt,
        closeShouldIInterrupt,
        messageWriterModalOpen,
        messageRecipient,
        initialMessageGoal,
        openMessageWriter,
        closeMessageWriter,
        explainWhyModalOpen,
        targetEvent,
        openExplainWhy,
        closeExplainWhy,
        demoWalkthroughOpen,
        openDemoWalkthrough,
        closeDemoWalkthrough,
        notificationsDrawerOpen,
        openNotificationsDrawer,
        closeNotificationsDrawer,
        toast,
        showToast,
        syncedToolNotice,
        setSyncedToolNotice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};
