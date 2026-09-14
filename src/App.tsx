import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { TeamView } from './views/TeamView.tsx';
import { CatchUpView } from './views/CatchUpView.tsx';
import { AskOmniView } from './views/AskOmniView.tsx';
import { IntegrationsPrivacyView } from './views/IntegrationsPrivacyView.tsx';
import { SettingsView } from './views/SettingsView.tsx';
import { AuthView } from './views/AuthView.tsx';

// Modals & Drawers
import { WorkContextModal } from './components/modals/WorkContextModal.tsx';
import { ShouldIInterruptModal } from './components/modals/ShouldIInterruptModal.tsx';
import { MessageWriterModal } from './components/modals/MessageWriterModal.tsx';
import { ExplainWhyModal } from './components/modals/ExplainWhyModal.tsx';
import { DemoWalkthroughModal } from './components/modals/DemoWalkthroughModal.tsx';
import { NotificationDrawer } from './components/notifications/NotificationDrawer.tsx';

// Mobile Bottom Nav Icons
import {
  LayoutDashboard,
  Users,
  Compass,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { currentView, setCurrentView, toast } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold">Initializing OmniWork Interruptibility Layer...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased font-sans">
      {/* 1. Global Navigation Bar */}
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* 2. Desktop Sidebar */}
        <Sidebar />

        {/* 3. Main Content Stage */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl overflow-y-auto">
          {currentView === 'dashboard' && <DashboardView />}
          {currentView === 'team' && <TeamView />}
          {currentView === 'catchup' && <CatchUpView />}
          {currentView === 'ask-omni' && <AskOmniView />}
          {currentView === 'integrations' && <IntegrationsPrivacyView />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* 4. Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 flex justify-around py-2 px-1">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium ${
            currentView === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => setCurrentView('team')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium ${
            currentView === 'team' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500'
          }`}
        >
          <Users className="w-4 h-4 mb-0.5" />
          <span>Team</span>
        </button>
        <button
          onClick={() => setCurrentView('catchup')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium ${
            currentView === 'catchup' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500'
          }`}
        >
          <Compass className="w-4 h-4 mb-0.5" />
          <span>Catch-Up</span>
        </button>
        <button
          onClick={() => setCurrentView('ask-omni')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium ${
            currentView === 'ask-omni' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          <span>Ask Omni</span>
        </button>
        <button
          onClick={() => setCurrentView('integrations')}
          className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium ${
            currentView === 'integrations' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500'
          }`}
        >
          <ShieldCheck className="w-4 h-4 mb-0.5" />
          <span>Privacy</span>
        </button>
      </div>

      {/* 5. Modals & Drawers */}
      <WorkContextModal />
      <ShouldIInterruptModal />
      <MessageWriterModal />
      <ExplainWhyModal />
      <DemoWalkthroughModal />
      <NotificationDrawer />

      {/* 6. Global Feedback Toast */}
      {toast && (
        <div className="fixed bottom-16 sm:bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center space-x-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-800 dark:border-zinc-200">
            {toast.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('OmniWork caught uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 text-left">
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-bold text-base">Unable to render view</h3>
            </div>
            <p className="text-xs text-zinc-500">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Reload OmniWork
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
