import React, { useState } from 'react';
import { Users, Search, Sparkles, Filter, Code, Briefcase } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { TeammateCard } from '../components/dashboard/TeammateCard.tsx';
import { TeamPulse } from '../components/dashboard/TeamPulse.tsx';
import { UserStatus } from '../types/index.ts';

export const TeamView: React.FC = () => {
  const { teammates } = useApp();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | UserStatus>('All');

  // Extract all unique skills across team
  const allSkills = Array.from(
    new Set(teammates.flatMap(t => t.skills || []))
  );

  const filteredTeammates = teammates.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.role.toLowerCase().includes(search.toLowerCase()) ||
      (t.workContext.project && t.workContext.project.toLowerCase().includes(search.toLowerCase()));

    const matchesSkill = selectedSkill ? t.skills?.includes(selectedSkill) : true;
    const matchesStatus = statusFilter === 'All' ? true : t.workContext.status === statusFilter;

    return matchesSearch && matchesSkill && matchesStatus;
  });

  return (
    <div id="team-directory-view" className="space-y-6 pb-12 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <span>Team Directory & Boundaries</span>
          </h2>
          <p className="text-xs text-zinc-500">
            Real-time availability, focus topics, and declared interruption boundaries
          </p>
        </div>
      </div>

      {/* Team Pulse */}
      <TeamPulse />

      {/* Filter and Skill Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search team by name, role, or project..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Status Filter */}
          <div className="flex rounded-xl p-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            {(['All', 'Available', 'Focus', 'Away'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
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

        {/* Skill filter chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <span className="text-zinc-400 text-[11px] mr-1 flex items-center space-x-1">
            <Code className="w-3 h-3" />
            <span>Filter by skill:</span>
          </span>
          {selectedSkill && (
            <button
              onClick={() => setSelectedSkill(null)}
              className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
            >
              Clear filter ({selectedSkill})
            </button>
          )}
          {allSkills.map(skill => (
            <button
              key={skill}
              onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-all ${
                selectedSkill === skill
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeammates.map(teammate => (
          <TeammateCard
            key={teammate.id}
            teammate={teammate}
            isCurrentUser={teammate.id === user?.id}
          />
        ))}
      </div>
    </div>
  );
};
