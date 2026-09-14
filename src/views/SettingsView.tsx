import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Clock,
  Bell,
  RotateCcw,
  LogOut,
  Check,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useApp } from '../context/AppContext.tsx';

export const SettingsView: React.FC = () => {
  const { user, updateProfile, logout, resetDemo } = useAuth();
  const { showToast, refreshTeammates } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState(user?.role || '');
  const [isSaving, setIsSaving] = useState(false);
  const [defaultFocusDuration, setDefaultFocusDuration] = useState('2 hours');
  const [autoClearEnabled, setAutoClearEnabled] = useState(true);
  const [boundaryNotificationLevel, setBoundaryNotificationLevel] = useState('Critical blockers only');

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setRole(user.role);
    }
  }, [user]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty', 'warning');
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({ name: name.trim(), role: role.trim() });
      await refreshTeammates();
      showToast('Profile and focus preferences updated successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="settings-view" className="space-y-6 pb-12 max-w-3xl mx-auto text-left">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-indigo-500" />
          <span>Account & Focus Settings</span>
        </h2>
        <p className="text-xs text-zinc-500">
          Customize your profile, focus session defaults, and notification boundaries
        </p>
      </div>

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500/30"
            />
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{user?.name}</h3>
              <p className="text-xs text-zinc-500">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Role Title
              </label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>

        {/* Boundary Rules */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Focus Boundary Defaults</span>
          </h4>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">
                  Default Focus Session Length
                </span>
                <span className="text-zinc-500">Preset duration when setting quick focus</span>
              </div>
              <select
                value={defaultFocusDuration}
                onChange={e => setDefaultFocusDuration(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none"
              >
                <option>45 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
                <option>Until end of day</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">
                  Auto-Clear When Expired
                </span>
                <span className="text-zinc-500">Automatically return status to Available when timer expires</span>
              </div>
              <input
                type="checkbox"
                checked={autoClearEnabled}
                onChange={e => setAutoClearEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">
                  Default Interruption Preference
                </span>
                <span className="text-zinc-500">Rules evaluated by OmniWork AI when teammates check contact</span>
              </div>
              <input
                type="text"
                value={boundaryNotificationLevel}
                onChange={e => setBoundaryNotificationLevel(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none w-56"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-3">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 disabled:opacity-50 shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Demo State Control & Logout */}
      <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            Hackathon Demo Controls
          </h5>
          <p className="text-xs text-zinc-500">
            Reset all database records to the initial clean presentation state
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={async () => {
              await resetDemo();
              showToast('Demo data reset to clean initial seed');
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
