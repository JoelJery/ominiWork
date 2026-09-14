import React from 'react';
import {
  Clock,
  CheckCircle2,
  CircleDot,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { Teammate } from '../../types/index.ts';
import { useApp } from '../../context/AppContext.tsx';

interface TeammateCardProps {
  teammate: Teammate;
  isCurrentUser?: boolean;
}

export const TeammateCard: React.FC<TeammateCardProps> = ({ teammate, isCurrentUser }) => {
  const { openShouldIInterrupt, openMessageWriter } = useApp();
  const { workContext } = teammate;
  const status = workContext.status;

  const getStatusBadge = () => {
    switch (status) {
      case 'Focus':
        return {
          pill: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
          dot: 'bg-indigo-600 animate-pulse',
          label: 'Focus',
        };
      case 'Away':
        return {
          pill: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
          dot: 'bg-amber-500',
          label: 'Away',
        };
      case 'Available':
      default:
        return {
          pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
          dot: 'bg-emerald-500',
          label: 'Available',
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div
      id={`teammate-card-${teammate.id}`}
      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
    >
      {/* Top row: Avatar, Name, Role, Status badge */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={teammate.avatar_url}
                alt={teammate.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-zinc-800"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white dark:ring-zinc-900 ${badge.dot}`}
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {teammate.name}
                </h4>
                {isCurrentUser && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    You
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500">{teammate.role}</p>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.pill}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${badge.dot}`} />
              {badge.label}
            </span>
            {workContext.expires_at && (
              <div className="text-[10px] text-zinc-400 mt-1 flex items-center justify-end space-x-0.5">
                <Clock className="w-2.5 h-2.5" />
                <span>Until {workContext.expires_at}</span>
              </div>
            )}
          </div>
        </div>

        {/* Declared Work Context Message */}
        <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/80">
          <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium line-clamp-2">
            "{workContext.message || 'Available for collaboration.'}"
          </p>
          {workContext.project && (
            <div className="mt-1 flex items-center space-x-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              <Briefcase className="w-3 h-3 text-zinc-400" />
              <span className="truncate">{workContext.project} • {workContext.task || 'Working'}</span>
            </div>
          )}
        </div>

        {/* Interruption Preference */}
        <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
          <span className="font-medium text-zinc-500">Interrupt for: </span>
          <span className="text-zinc-800 dark:text-zinc-200 font-medium">
            {workContext.interrupt_for || (status === 'Focus' ? 'Critical blockers only' : 'Open for questions')}
          </span>
        </div>

        {/* Skill tags */}
        {teammate.skills && teammate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {teammate.skills.slice(0, 3).map((skill, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              >
                {skill}
              </span>
            ))}
            {teammate.skills.length > 3 && (
              <span className="text-[10px] text-zinc-400 self-center">
                +{teammate.skills.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action buttons */}
      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center space-x-2">
        <button
          id={`teammate-interrupt-btn-${teammate.id}`}
          onClick={() => openShouldIInterrupt(teammate)}
          className="flex-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60 flex items-center justify-center space-x-1.5 transition-all"
          title="Check if now is a good time to interrupt"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Should I Interrupt?</span>
        </button>

        <button
          id={`teammate-message-btn-${teammate.id}`}
          onClick={() => openMessageWriter(teammate)}
          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center space-x-1 transition-all"
          title="Compose respectful message"
        >
          <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
          <span className="hidden sm:inline">Message</span>
        </button>
      </div>
    </div>
  );
};
