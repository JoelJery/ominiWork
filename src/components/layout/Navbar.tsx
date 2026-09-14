import React, { useState } from 'react';
import {
  Bell,
  Sparkles,
  Shield,
  Layers,
  ChevronDown,
  LogOut,
  RotateCcw,
  User as UserIcon,
  CheckCircle2,
  Clock,
  CircleDot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useApp } from '../../context/AppContext.tsx';

export const Navbar: React.FC = () => {
  const { user, workContext, logout, resetDemo } = useAuth();
  const {
    unreadCount,
    openNotificationsDrawer,
    openWorkContextModal,
    openDemoWalkthrough,
    syncedToolNotice,
    showToast
  } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getStatusBadge = () => {
    const status = workContext?.status || 'Available';
    switch (status) {
      case 'Focus':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
          dot: 'bg-indigo-600 animate-pulse',
          label: 'Focus',
          icon: <Clock className="w-3.5 h-3.5 mr-1" />
        };
      case 'Away':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
          dot: 'bg-amber-600',
          label: 'Away',
          icon: <CircleDot className="w-3.5 h-3.5 mr-1" />
        };
      case 'Available':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
          dot: 'bg-emerald-500',
          label: 'Available',
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <header id="omniwork-navbar" className="sticky top-0 z-30 w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand & Tagline */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-100">
                OmniWork
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                Interruptibility Layer
              </span>
            </div>
            <p className="hidden md:block text-xs text-zinc-500 dark:text-zinc-400">
              Know before you interrupt.
            </p>
          </div>
        </div>

        {/* Center: Live Sync & Status Action */}
        <div className="flex items-center space-x-3">
          {syncedToolNotice && (
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="truncate max-w-[220px]">Synced: {syncedToolNotice}</span>
            </div>
          )}

          {/* User Status Switcher Button */}
          <button
            id="navbar-status-button"
            onClick={openWorkContextModal}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] ${statusBadge.bg}`}
            title="Click to change your work context"
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${statusBadge.dot}`} />
            {statusBadge.icon}
            <span>{statusBadge.label}</span>
            {workContext?.expires_at && (
              <span className="ml-1.5 opacity-80">until {workContext.expires_at}</span>
            )}
          </button>
        </div>

        {/* Right: Golden Demo Walkthrough, Notifications, User Menu */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Golden Demo button */}
          <button
            id="navbar-demo-walkthrough-btn"
            onClick={openDemoWalkthrough}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            <span className="hidden sm:inline">Demo Walkthrough</span>
            <span className="sm:hidden">Demo</span>
          </button>

          {/* Notifications / Focus Boundary Drawer */}
          <button
            id="navbar-notifications-btn"
            onClick={openNotificationsDrawer}
            className="relative p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Focus boundary: Queued messages"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              id="navbar-user-dropdown-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-300 dark:ring-zinc-700"
              />
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 hidden sm:block" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {user?.name || 'Guest User'}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{user?.role || 'Team Member'}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      openWorkContextModal();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center space-x-2"
                  >
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span>Edit Work Context</span>
                  </button>

                  <button
                    onClick={async () => {
                      setDropdownOpen(false);
                      await resetDemo();
                      showToast('Reset to clean initial demo state', 'info');
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4 text-zinc-400" />
                    <span>Reset Demo State</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                      showToast('Logged out of session', 'info');
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
