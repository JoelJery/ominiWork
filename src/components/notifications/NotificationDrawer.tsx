import React from 'react';
import {
  X,
  Bell,
  Clock,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

export const NotificationDrawer: React.FC = () => {
  const {
    notificationsDrawerOpen,
    closeNotificationsDrawer,
    queuedMessages,
    markMessagesRead,
    openMessageWriter,
    teammates,
    showToast
  } = useApp();
  const { workContext } = useAuth();

  if (!notificationsDrawerOpen) return null;

  const isFocusMode = workContext?.status === 'Focus';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          id="notification-drawer"
          className="w-screen max-w-md bg-white dark:bg-zinc-900 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col animate-in slide-in-from-right duration-200"
        >
          {/* Header */}
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Notification Boundaries
                </h3>
                <p className="text-xs text-zinc-500">
                  Quiet buffer while you are in focus
                </p>
              </div>
            </div>
            <button
              onClick={closeNotificationsDrawer}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Focus Boundary Callout Banner */}
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-950 dark:text-indigo-200">
                <span className="font-bold block">
                  {isFocusMode ? 'Focus Shield Active' : 'Boundary Buffer'}
                </span>
                <p className="mt-0.5 text-indigo-800 dark:text-indigo-300 leading-relaxed">
                  These messages were queued silently so your concentration was not broken.
                  Review at your own pace when ready.
                </p>
              </div>
            </div>
          </div>

          {/* Message List */}
          <div className="p-4 overflow-y-auto space-y-3 flex-1 text-left">
            {queuedMessages.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                <p className="text-xs font-medium">All caught up! No waiting messages.</p>
              </div>
            ) : (
              queuedMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`p-4 rounded-xl border text-xs space-y-2.5 transition-all ${
                    !msg.read
                      ? 'bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60'
                      : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={msg.sender_avatar}
                        alt={msg.sender_name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {msg.sender_name}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        msg.urgency === 'Urgent'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {msg.urgency}
                    </span>
                  </div>

                  <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed">
                    "{msg.body}"
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-400">
                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                      onClick={() => {
                        const sender = teammates.find(t => t.id === msg.sender_id);
                        if (sender) {
                          closeNotificationsDrawer();
                          openMessageWriter(sender, `Replying to your message: "${msg.body}"`);
                        } else {
                          showToast('Quick reply ready');
                        }
                      }}
                      className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Reply Respectfully</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex items-center justify-between">
            <button
              onClick={async () => {
                await markMessagesRead();
                showToast('Marked all waiting messages as read');
              }}
              disabled={queuedMessages.length === 0}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 disabled:opacity-40"
            >
              Mark All Read
            </button>
            <button
              onClick={closeNotificationsDrawer}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
