import React, { useState } from 'react';
import { Sparkles, RefreshCw, Users, CheckCircle2, Clock, CircleDot } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const TeamPulse: React.FC = () => {
  const { teamPulse, refreshTeamPulse, teammates } = useApp();
  const [loading, setLoading] = useState(false);

  const availableCount = teammates.filter(t => t.workContext.status === 'Available').length;
  const focusCount = teammates.filter(t => t.workContext.status === 'Focus').length;
  const awayCount = teammates.filter(t => t.workContext.status === 'Away').length;

  const handleRefresh = async () => {
    setLoading(true);
    await refreshTeamPulse();
    setLoading(false);
  };

  return (
    <div id="team-pulse-section" className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Team Pulse
          </h3>
          <span className="text-xs text-zinc-500">Live Status Snapshot</span>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Refresh pulse summary"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Counts Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Available */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
          <div>
            <div className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-200 leading-tight">
              {availableCount}
            </div>
            <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              Available
            </div>
          </div>
        </div>

        {/* Focus */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/40 flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse flex-shrink-0" />
          <div>
            <div className="text-base sm:text-lg font-bold text-indigo-950 dark:text-indigo-200 leading-tight">
              {focusCount}
            </div>
            <div className="text-[11px] font-medium text-indigo-700 dark:text-indigo-400">
              In Focus
            </div>
          </div>
        </div>

        {/* Away */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800/40 flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
          <div>
            <div className="text-base sm:text-lg font-bold text-amber-950 dark:text-amber-200 leading-tight">
              {awayCount}
            </div>
            <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
              Away
            </div>
          </div>
        </div>
      </div>

      {/* AI Pulse Summary Text */}
      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/50 flex items-start space-x-2.5">
        <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {teamPulse?.summary ||
            `Most of the team is currently available (${availableCount} available). Rahul is focused on webhook retry handling until 3:30 PM, while Priya is away.`}
        </p>
      </div>
    </div>
  );
};
