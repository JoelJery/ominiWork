import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Layers,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Slack,
  Calendar,
  Github,
  Trello,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api.ts';
import { IntegrationStatus } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useApp } from '../context/AppContext.tsx';

export const IntegrationsPrivacyView: React.FC = () => {
  const { workContext } = useAuth();
  const { showToast } = useApp();
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const data = await api.getIntegrations();
      setIntegrations(data.integrations);
    } catch (e) {
      showToast('Failed to load integrations', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      const res = await api.toggleIntegration(id);
      setIntegrations(res.integrations);
      showToast(`Integration updated`);
    } catch (e) {
      showToast('Failed to toggle integration', 'warning');
    }
  };

  const zeroSurveillancePoints = [
    {
      title: 'No Keyboard Tracking',
      desc: 'We never count keystrokes, analyze typing cadence, or inspect input streams.',
    },
    {
      title: 'No Mouse or Cursor Tracking',
      desc: 'Zero telemetry on cursor velocity, idle time, or hardware movement.',
    },
    {
      title: 'No Webcam Monitoring',
      desc: 'No camera snapshots, pupil dilation checks, or facial presence verification.',
    },
    {
      title: 'No Screen Capture',
      desc: 'No background window captures, screenshot timers, or application sniffing.',
    },
    {
      title: 'No Productivity Scores',
      desc: 'We reject automated scoring algorithms that turn human focus into corporate surveillance.',
    },
    {
      title: 'Explicit User Declaration Only',
      desc: 'All status and focus sessions are voluntarily declared and editable by the employee.',
    },
  ];

  return (
    <div id="integrations-privacy-view" className="space-y-8 pb-12 max-w-5xl mx-auto text-left">
      {/* 1. Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-indigo-500" />
          <span>Integrations & Privacy Manifesto</span>
        </h2>
        <p className="text-xs text-zinc-500">
          OmniWork is an interruptibility layer built on human dignity, not surveillance.
        </p>
      </div>

      {/* 2. The Core Philosophy Callout */}
      <div className="p-6 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-800/80 border border-zinc-800 shadow-md space-y-4">
        <div className="flex items-center space-x-2 text-indigo-400">
          <EyeOff className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">The Privacy Promise</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
          "OmniWork does not monitor your work. It protects your attention."
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
          Traditional enterprise tools equate visibility with surveillance—tracking keystrokes, taking sneaky webcam photos, or generating toxic productivity percentages. OmniWork takes the opposite stance: your work context is 100% self-declared, temporary, and under your sole control.
        </p>
      </div>

      {/* 3. 6 Zero-Surveillance Guarantees */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
          <Lock className="w-4 h-4 text-emerald-500" />
          <span>6 Zero-Surveillance Guarantees</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {zeroSurveillancePoints.map((pt, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1.5"
            >
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{pt.title}</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {pt.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Live Companion Sync Preview */}
      <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-200 text-xs font-bold">
            <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Bi-Directional Tool Sync Status</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Sync</span>
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-800/90 border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-semibold text-zinc-500 text-[10px] block">Currently Broadcasted:</span>
            <span className="font-mono text-zinc-900 dark:text-zinc-100 font-bold">
              Slack: {workContext?.status || 'Available'}
              {workContext?.project ? ` — Working on ${workContext.project}` : ''}
              {workContext?.expires_at ? ` (until ${workContext.expires_at})` : ''}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Updated via explicit declaration
          </span>
        </div>
      </div>

      {/* 5. Connected Workplace Tools */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Connected Work Tools
          </h4>
          <span className="text-xs text-zinc-500">Sync status & calendar context</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {integrations.map(integ => (
            <div
              key={integ.id}
              className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-200 font-bold">
                  {integ.icon === 'slack' && <Slack className="w-5 h-5 text-purple-500" />}
                  {integ.icon === 'calendar' && <Calendar className="w-5 h-5 text-blue-500" />}
                  {integ.icon === 'github' && <Github className="w-5 h-5" />}
                  {integ.icon === 'jira' && <Trello className="w-5 h-5 text-sky-500" />}
                </div>
                <div>
                  <h5 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                    {integ.name}
                  </h5>
                  <p className="text-[11px] text-zinc-500">
                    {integ.connected
                      ? `Synced: ${integ.lastSyncedStatus || 'Active status'}`
                      : 'Disconnected'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleToggle(integ.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  integ.connected
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                }`}
              >
                {integ.connected ? 'Connected' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
