import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Sparkles,
  Compass,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  CircleDot
} from 'lucide-react';
import { StatusBanner } from '../components/dashboard/StatusBanner.tsx';
import { TeamPulse } from '../components/dashboard/TeamPulse.tsx';
import { TeammateCard } from '../components/dashboard/TeammateCard.tsx';
import { useApp } from '../context/AppContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { UserStatus } from '../types/index.ts';

export const DashboardView: React.FC = () => {
  const { teammates, setCurrentView, openDemoWalkthrough } = useApp();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | UserStatus>('All');

  const filteredTeammates = teammates.filter(t => {
    // Exclude current user from team list or keep them marked as "You"
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.workContext.project && t.workContext.project.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.skills && t.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesStatus =
      statusFilter === 'All' ? true : t.workContext.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div id="dashboard-view" className="space-y-6 pb-12 text-left">
      {/* 1. Status Banner */}
      <StatusBanner />

      {/* 2. Team Pulse & Fast Catch-Up Promo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <TeamPulse />
        </div>

        {/* Catch-Up Teaser Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/5 via-violet-900/5 to-purple-900/10 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/70 dark:border-indigo-800/60 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
              <Compass className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Catch-Up Hub</span>
            </div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Caught Up in 45 Seconds
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Returning from a deep focus session? Get an instant AI brief of blockers, decisions, and action items.
            </p>
          </div>

          <button
            id="dashboard-open-catchup-btn"
            onClick={() => setCurrentView('catchup')}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-xs flex items-center justify-between transition-all"
          >
            <span>Read 45s Catch-Up Brief</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
          </button>
        </div>
      </div>

      {/* 3. Team Directory Header & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>Team Directory</span>
            </h3>
            <p className="text-xs text-zinc-500">
              Know before you interrupt. Check availability and respect declared focus.
            </p>
          </div>

          {/* Search and Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name, role, skill..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20 w-44 sm:w-56"
              />
            </div>

            {/* Status pills */}
            <div className="flex rounded-xl p-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              {(['All', 'Available', 'Focus', 'Away'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === s
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Teammates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeammates.map(teammate => (
            <TeammateCard
              key={teammate.id}
              teammate={teammate}
              isCurrentUser={teammate.id === user?.id}
            />
          ))}
        </div>

        {filteredTeammates.length === 0 && (
          <div className="py-12 text-center text-zinc-400 space-y-2">
            <Users className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700" />
            <p className="text-xs">No teammates match your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
