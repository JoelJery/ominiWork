import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Clock,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Layers,
  ChevronRight,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { ExplainWhyResult } from '../../types/index.ts';

export const ExplainWhyModal: React.FC = () => {
  const { explainWhyModalOpen, targetEvent, closeExplainWhy, showToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ExplainWhyResult | null>(null);

  useEffect(() => {
    if (targetEvent && explainWhyModalOpen) {
      setLoading(true);
      api.explainWhy(targetEvent.title, targetEvent.detail)
        .then(res => {
          setResult(res);
        })
        .catch(err => {
          showToast('Could not fetch explanation', 'warning');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [targetEvent, explainWhyModalOpen, showToast]);

  if (!explainWhyModalOpen || !targetEvent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        id="explain-why-modal"
        className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Explain Why
              </h3>
              <p className="text-xs text-zinc-500">
                Grounded factual trace from team communication
              </p>
            </div>
          </div>
          <button
            onClick={closeExplainWhy}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-left">
          {/* Target Event Card */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {targetEvent.category} • {targetEvent.project}
              </span>
              <span>{targetEvent.time_display}</span>
            </div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              {targetEvent.title}
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              {targetEvent.detail}
            </p>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Sparkles className="w-6 h-6 text-indigo-500 animate-spin" />
              <p className="text-xs text-zinc-500">Analyzing work events and factual evidence...</p>
            </div>
          ) : result ? (
            <div className="space-y-5 animate-in fade-in">
              {/* Grounded Explanation */}
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Synthesized Explanation</span>
                </div>
                <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  {result.explanation}
                </p>
              </div>

              {/* Evidence Timeline */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Evidence Timeline
                </h5>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-700">
                  {result.evidenceTimeline.map((item, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-zinc-900" />
                      <div className="p-3 rounded-lg bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-xs space-y-1">
                        <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                            {item.source}
                          </span>
                          <span>{item.time}</span>
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                          {item.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zero Hallucination Guarantee */}
              <div className="text-[11px] text-zinc-400 flex items-center space-x-1.5 pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Evidence strictly sourced from logged communications. Never hallucinated.</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
