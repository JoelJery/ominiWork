import React from 'react';
import {
  LayoutDashboard,
  Users,
  Compass,
  Sparkles,
  ShieldCheck,
  Settings,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useApp, ViewType } from '../../context/AppContext.tsx';

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView } = useApp();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Home Dashboard', icon: LayoutDashboard },
    { id: 'team', label: 'Team Directory', icon: Users },
    { id: 'catchup', label: 'Catch-Up Hub', icon: Compass, badge: 'AI Brief' },
    { id: 'ask-omni', label: 'OmniWork AI', icon: Sparkles, badge: 'Live' },
    { id: 'integrations', label: 'Integrations & Privacy', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside id="omniwork-sidebar" className="w-64 flex-shrink-0 hidden md:flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4 min-h-[calc(100vh-4rem)]">
      {/* Navigation list */}
      <nav className="space-y-1.5 flex-1">
        <div className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Workplace Layer
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-zinc-900' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-zinc-700 text-zinc-200 dark:bg-zinc-300 dark:text-zinc-800'
                      : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Philosophy Callout Card */}
      <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="rounded-xl p-3.5 bg-zinc-100/80 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/40 text-left">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-semibold">Zero Surveillance</span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            No keyloggers, no mouse tracking, no screen capture. Status is strictly self-declared.
          </p>
          <button
            onClick={() => setCurrentView('integrations')}
            className="mt-2 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 flex items-center space-x-1 hover:underline"
          >
            <span>Read privacy promise</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
};
