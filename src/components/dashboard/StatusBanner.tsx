import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  CircleDot,
  Edit3,
  RotateCcw,
  Sparkles,
  Layers,
  BellRing,
  ExternalLink,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { UserStatus } from '../../types/index.ts';

export const StatusBanner: React.FC = () => {
  const { user, workContext, setWorkContext } = useAuth();
  const { openWorkContextModal, openNotificationsDrawer, unreadCount, showToast, setSyncedToolNotice } = useApp();
  const [updating, setUpdating] = useState(false);

  const status = workContext?.status || 'Available';

  const quickSwitch = async (newStatus: UserStatus) => {
    if (newStatus === status) return;
    setUpdating(true);
    try {
      let defaultMsg = 'Available for a quick discussion.';
      let interruptFor = 'Any questions or collaboration';
      let expiresAt: string | null = null;

      if (newStatus === 'Focus') {
        defaultMsg = workContext?.project
          ? `Working on ${workContext.project} — please avoid interruptions.`
          : 'In Focus mode — please avoid interruptions.';
        interruptFor = 'Critical blockers & production outages';
        expiresAt = '6:00 PM';
      } else if (newStatus === 'Away') {
        defaultMsg = 'Stepped away — back shortly.';
        interruptFor = 'Urgent emergencies only';
        expiresAt = '30m';
      }

      const res = await api.updateStatus({
        status: newStatus,
        project: workContext?.project || '',
        task: workContext?.task || '',
        message: defaultMsg,
        interrupt_for: interruptFor,
        expires_at: expiresAt,
      });

      setWorkContext(res.workContext);
      showToast(`Status updated to ${newStatus}`);
      const projectText = res.workContext.project ? ` — Working on ${res.workContext.project}` : '';
      setSyncedToolNotice(`Slack: ${newStatus}${projectText}`);
    } catch (err) {
      showToast('Failed to update status', 'warning');
    } finally {
      setUpdating(false);
    }
  };

  const returnToAvailable = async () => {
    setUpdating(true);
    try {
      const res = await api.returnToAvailable();
      setWorkContext(res.workContext);
      showToast('Returned to Available status');
      setSyncedToolNotice('Slack: Available');
    } catch (err) {
      showToast('Failed to reset status', 'warning');
    } finally {
      setUpdating(false);
    }
  };

  const getStyle = () => {
    switch (status) {
      case 'Focus':
        return {
          container: 'bg-gradient-to-br from-indigo-900/10 via-zinc-900/5 to-violet-900/10 dark:from-indigo-950/40 dark:via-zinc-900/60 dark:to-violet-950/40 border-indigo-200/80 dark:border-indigo-800/60',
          badge: 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30',
          accent: 'text-indigo-600 dark:text-indigo-400',
        };
      case 'Away':
        return {
          container: 'bg-gradient-to-br from-amber-900/10 via-zinc-900/5 to-orange-900/10 dark:from-amber-950/40 dark:via-zinc-900/60 dark:to-orange-950/40 border-amber-200/80 dark:border-amber-800/60',
          badge: 'bg-amber-600 text-white shadow-sm shadow-amber-600/30',
          accent: 'text-amber-600 dark:text-amber-400',
        };
      case 'Available':
      default:
        return {
          container: 'bg-gradient-to-br from-emerald-900/10 via-zinc-900/5 to-teal-900/10 dark:from-emerald-950/40 dark:via-zinc-900/60 dark:to-teal-950/40 border-emerald-200/80 dark:border-emerald-800/60',
          badge: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30',
          accent: 'text-emerald-600 dark:text-emerald-400',
        };
    }
  };

  const style = getStyle();

  return (
    <div id="dashboard-status-banner" className="space-y-3">
      {/* Focus Notification Boundary Callout */}
      {status === 'Focus' && unreadCount > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200">
          <div className="flex items-center space-x-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="font-semibold">Notification boundary active:</span>
            <span>You have {unreadCount} message{unreadCount === 1 ? '' : 's'} waiting silently. Review when you're ready.</span>
          </div>
          <button
            onClick={openNotificationsDrawer}
            className="font-medium underline hover:text-indigo-600 dark:hover:text-indigo-300 ml-2"
          >
            Review Waiting Messages
          </button>
        </div>
      )}

      {/* Main Status Hero Card */}
      <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${style.container}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left info */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${style.badge}`}>
                {status === 'Focus' && <Clock className="w-3.5 h-3.5 animate-pulse" />}
                {status === 'Available' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {status === 'Away' && <CircleDot className="w-3.5 h-3.5" />}
                <span>{status}</span>
              </span>

              {workContext?.expires_at && (
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Until {workContext.expires_at}</span>
                </span>
              )}

              {workContext?.project && (
                <span className="px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {workContext.project}
                </span>
              )}
            </div>

            {/* Custom status message */}
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              "{workContext?.message || 'Available for collaboration.'}"
            </h2>

            {/* Interrupt preference */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
              {workContext?.task && (
                <div>
                  <span className="font-medium text-zinc-500 dark:text-zinc-400">Task: </span>
                  <span>{workContext.task}</span>
                </div>
              )}
              {workContext?.interrupt_for && (
                <div>
                  <span className="font-medium text-zinc-500 dark:text-zinc-400">Interrupt for: </span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{workContext.interrupt_for}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="status-edit-context-btn"
              onClick={openWorkContextModal}
              disabled={updating}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm flex items-center space-x-1.5 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 dark:text-indigo-600" />
              <span>✨ Edit Work Context</span>
            </button>

            {status !== 'Available' ? (
              <button
                id="status-return-available-btn"
                onClick={returnToAvailable}
                disabled={updating}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center space-x-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Return to Available</span>
              </button>
            ) : (
              <button
                id="status-quick-focus-btn"
                onClick={() => quickSwitch('Focus')}
                disabled={updating}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center space-x-1.5 transition-all"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Set Focus</span>
              </button>
            )}

            {status !== 'Away' && (
              <button
                id="status-quick-away-btn"
                onClick={() => quickSwitch('Away')}
                disabled={updating}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center space-x-1.5 transition-all"
              >
                <CircleDot className="w-3.5 h-3.5" />
                <span>Set Away</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
