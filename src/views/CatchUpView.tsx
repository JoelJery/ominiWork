import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  Clock,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  Info,
  HelpCircle,
  FileText,
  RefreshCw,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api.ts';
import { CatchUpBrief, WorkEvent } from '../types/index.ts';
import { useApp } from '../context/AppContext.tsx';
import { FALLBACK_CATCH_UP_BRIEF } from '../data/fallbackBrief.ts';

export const CatchUpView: React.FC = () => {
  const { openExplainWhy, showToast } = useApp();
  const [brief, setBrief] = useState<CatchUpBrief | null>(FALLBACK_CATCH_UP_BRIEF);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'BLOCKER' | 'DECISION' | 'ACTION'>('ALL');

  const loadBrief = async () => {
    setLoading(true);
    try {
      const data = await api.getCatchUpBrief();
      setBrief(data);
    } catch (err) {
      console.warn('Could not fetch catch-up brief from server, using local fallback brief:', err);
      showToast('Loaded offline catch-up brief', 'info');
      setBrief(prev => prev || FALLBACK_CATCH_UP_BRIEF);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrief();
  }, []);

  const allItems = brief
    ? [...brief.blockers, ...brief.decisions, ...brief.actions, ...brief.fyis]
    : [];

  const filteredItems = allItems.filter(item => {
    if (activeFilter === 'ALL') return true;
    return item.category === activeFilter;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'BLOCKER':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
          icon: <AlertOctagon className="w-3.5 h-3.5 mr-1" />,
        };
      case 'DECISION':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
        };
      case 'ACTION':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
          icon: <Calendar className="w-3.5 h-3.5 mr-1" />,
        };
      case 'FYI':
      default:
        return {
          bg: 'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
          icon: <Info className="w-3.5 h-3.5 mr-1" />,
        };
    }
  };

  return (
    <div id="catch-up-view" className="space-y-6 pb-12 text-left">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
              <Compass className="w-5 h-5 text-indigo-500" />
              <span>Catch-Up Hub</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              ⚡ 45-Second Brief
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Skip message overload. Catch up instantly with structured AI executive synthesis.
          </p>
        </div>

        <button
          onClick={loadBrief}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 flex items-center space-x-1.5 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Regenerate Brief</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <Sparkles className="w-7 h-7 text-indigo-500 animate-spin" />
          <p className="text-xs font-medium text-zinc-500">Synthesizing 45-second catch-up brief...</p>
        </div>
      ) : brief ? (
        <>
          {/* Executive Brief Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/10 via-zinc-900/5 to-violet-900/10 dark:from-indigo-950/40 dark:via-zinc-900/40 dark:to-violet-950/40 border border-indigo-200/80 dark:border-indigo-800/60 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-200/60 dark:border-indigo-800/40 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {brief.headline}
                </h3>
              </div>

              <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                <Clock className="w-3.5 h-3.5" />
                <span>Estimated read time: {brief.readTimeSeconds} seconds</span>
              </div>
            </div>

            {/* AI Executive Summary Narrative */}
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
              {brief.summary}
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-rose-200/80 dark:border-rose-900/60">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
                  Blockers
                </span>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {brief.blockers.length}
                </span>
                <span className="text-[11px] text-zinc-500 block">Requires unblocking</span>
              </div>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-indigo-200/80 dark:border-indigo-900/60">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  Decisions
                </span>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {brief.decisions.length}
                </span>
                <span className="text-[11px] text-zinc-500 block">Timeline & scope shifts</span>
              </div>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-amber-200/80 dark:border-amber-900/60">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                  Action Items
                </span>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {brief.actions.length}
                </span>
                <span className="text-[11px] text-zinc-500 block">Assigned to you</span>
              </div>

              <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  FYI Updates
                </span>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {brief.fyis.length}
                </span>
                <span className="text-[11px] text-zinc-500 block">Informational logs</span>
              </div>
            </div>
          </div>

          {/* Categorized Filter Tabs */}
          <div className="flex items-center space-x-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            {(['ALL', 'BLOCKER', 'DECISION', 'ACTION'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === cat
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {cat === 'ALL' ? 'All Updates' : `${cat}s`}
              </button>
            ))}
          </div>

          {/* Event Items List */}
          <div className="space-y-3">
            {filteredItems.map(item => {
              const badge = getCategoryBadge(item.category);
              const canExplainWhy = item.category === 'DECISION' || item.category === 'BLOCKER';

              return (
                <div
                  key={item.id}
                  id={`work-event-${item.id}`}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg}`}>
                        {badge.icon}
                        <span>{item.category}</span>
                      </span>
                      <span className="text-xs font-medium text-zinc-500">
                        {item.project}
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <span className="text-xs text-zinc-400">
                        {item.source} ({item.time_display})
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {item.title}
                    </h4>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {item.detail}
                    </p>

                    {item.target_user && (
                      <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 pt-0.5">
                        Assigned to: {item.target_user}
                      </div>
                    )}
                  </div>

                  {/* Right: Explain Why Button for decisions & blockers */}
                  {canExplainWhy && (
                    <button
                      id={`explain-why-btn-${item.id}`}
                      onClick={() => openExplainWhy(item)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center space-x-1.5 transition-all self-start sm:self-center flex-shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Explain Why</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="py-16 px-6 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Catch-Up Brief Ready
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Tap regenerate to fetch the latest summary of blockers, decisions, and action items.
            </p>
          </div>
          <button
            onClick={loadBrief}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm inline-flex items-center space-x-2 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Catch-Up Brief</span>
          </button>
        </div>
      )}
    </div>
  );
};
