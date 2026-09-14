import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Clock,
  CheckCircle2,
  CircleDot,
  Check,
  RefreshCw,
  Sliders,
  Send,
  Wand2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { UserStatus } from '../../types/index.ts';

export const WorkContextModal: React.FC = () => {
  const { workContext, setWorkContext } = useAuth();
  const { workContextModalOpen, closeWorkContextModal, showToast, setSyncedToolNotice } = useApp();

  // Mode: Form vs AI Writer
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');

  // Form states
  const [status, setStatus] = useState<UserStatus>('Focus');
  const [project, setProject] = useState('');
  const [task, setTask] = useState('');
  const [message, setMessage] = useState('');
  const [interruptFor, setInterruptFor] = useState('');
  const [expiresAt, setExpiresAt] = useState<string | null>('6:00 PM');
  const [saving, setSaving] = useState(false);

  // ✨ AI Status Writer state
  const [naturalInput, setNaturalInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStructuredResult, setAiStructuredResult] = useState<{
    status: UserStatus;
    message: string;
    project: string;
    task: string;
    until: string | null;
    interrupt_for: string;
  } | null>(null);

  // AI Tone generator state
  const [toneVariations, setToneVariations] = useState<{
    professional: string;
    friendly: string;
    concise: string;
  } | null>(null);
  const [generatingTone, setGeneratingTone] = useState(false);

  useEffect(() => {
    if (workContext) {
      setStatus(workContext.status);
      setProject(workContext.project || '');
      setTask(workContext.task || '');
      setMessage(workContext.message || '');
      setInterruptFor(workContext.interrupt_for || '');
      setExpiresAt(workContext.expires_at);
    }
  }, [workContext, workContextModalOpen]);

  if (!workContextModalOpen) return null;

  // Handle AI Status Writer Generation
  const handleAIStructure = async () => {
    if (!naturalInput.trim()) return;
    setAiLoading(true);
    try {
      const result = await api.structureContext(naturalInput);
      setAiStructuredResult(result);
    } catch (err) {
      showToast('Failed to structure with AI, using fallback', 'warning');
    } finally {
      setAiLoading(false);
    }
  };

  // Apply AI Structured Result to Form
  const handleApplyAIResult = () => {
    if (!aiStructuredResult) return;
    setStatus(aiStructuredResult.status);
    setMessage(aiStructuredResult.message);
    setProject(aiStructuredResult.project);
    setTask(aiStructuredResult.task);
    setInterruptFor(aiStructuredResult.interrupt_for);
    setExpiresAt(aiStructuredResult.until);
    setActiveTab('manual');
    showToast('Applied AI structured context. You can save or adjust details.');
  };

  // Handle AI Tone Generation
  const handleGenerateTones = async () => {
    const textToTransform = message || naturalInput || 'Working on my project';
    setGeneratingTone(true);
    try {
      const data = await api.generateStatusMessage(textToTransform);
      setToneVariations(data.allVariations);
    } catch (e) {
      showToast('Could not generate message variations', 'warning');
    } finally {
      setGeneratingTone(false);
    }
  };

  // Save changes to backend
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.updateStatus({
        status,
        project,
        task,
        message: message || `${status} mode`,
        interrupt_for: interruptFor || (status === 'Focus' ? 'Critical blockers only' : 'Open for questions'),
        expires_at: expiresAt,
      });

      setWorkContext(res.workContext);
      showToast(`Work context updated: ${status}`);
      const projectText = res.workContext.project ? ` — Working on ${res.workContext.project}` : '';
      setSyncedToolNotice(`Slack: ${status}${projectText}`);
      closeWorkContextModal();
    } catch (err) {
      showToast('Error saving work context', 'warning');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        id="work-context-modal"
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Work Context & Availability
              </h3>
              <p className="text-xs text-zinc-500">
                Declare your status and communication boundaries
              </p>
            </div>
          </div>
          <button
            onClick={closeWorkContextModal}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: ✨ AI Status Writer vs Manual Form */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            id="tab-ai-writer"
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'ai'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ AI Status Writer</span>
          </button>
          <button
            id="tab-manual-context"
            onClick={() => setActiveTab('manual')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'manual'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize Fields</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {/* TAB 1: AI STATUS WRITER */}
          {activeTab === 'ai' ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                  <span>Describe what you are working on in plain English:</span>
                  <span className="text-[11px] text-zinc-400">Zero surveillance • AI structures your intent</span>
                </label>
                <div className="relative">
                  <textarea
                    id="ai-status-input"
                    rows={3}
                    value={naturalInput}
                    onChange={e => setNaturalInput(e.target.value)}
                    placeholder="e.g. I'm finishing the frontend for the checkout project and don't want interruptions until 8 PM."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Quick sample pills */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-zinc-400 mr-1">Try example:</span>
                <button
                  type="button"
                  onClick={() => setNaturalInput("I'm finishing the frontend for the checkout project and don't want interruptions until 8 PM.")}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                >
                  "Finishing checkout frontend until 8 PM"
                </button>
                <button
                  type="button"
                  onClick={() => setNaturalInput("Working on payment integration for Checkout 2.0 until 8 PM. Only interrupt me for production issues.")}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                >
                  "Checkout 2.0 payment integration"
                </button>
                <button
                  type="button"
                  onClick={() => setNaturalInput("Free for a quick discussion or questions about the design token updates.")}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                >
                  "Free for quick discussion"
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  id="ai-structure-generate-btn"
                  onClick={handleAIStructure}
                  disabled={aiLoading || !naturalInput.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center space-x-2 disabled:opacity-50 transition-all"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                  <span>{aiLoading ? 'Structuring...' : '✨ Structure with AI'}</span>
                </button>
              </div>

              {/* AI Structured Result Card (User must review before applying) */}
              {aiStructuredResult && (
                <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>AI Structured Proposal (Review before applying)</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-200/60 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                      Status: {aiStructuredResult.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-800/80 border border-indigo-100 dark:border-indigo-900/40">
                      <span className="font-semibold text-zinc-500 text-[10px] block">Message:</span>
                      <span className="text-zinc-800 dark:text-zinc-200">{aiStructuredResult.message}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-800/80 border border-indigo-100 dark:border-indigo-900/40">
                      <span className="font-semibold text-zinc-500 text-[10px] block">Project:</span>
                      <span className="text-zinc-800 dark:text-zinc-200">{aiStructuredResult.project || 'None'}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-800/80 border border-indigo-100 dark:border-indigo-900/40">
                      <span className="font-semibold text-zinc-500 text-[10px] block">Task:</span>
                      <span className="text-zinc-800 dark:text-zinc-200">{aiStructuredResult.task || 'None'}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-800/80 border border-indigo-100 dark:border-indigo-900/40">
                      <span className="font-semibold text-zinc-500 text-[10px] block">Until:</span>
                      <span className="text-zinc-800 dark:text-zinc-200">{aiStructuredResult.until || 'Unset'}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-800/80 border border-indigo-100 dark:border-indigo-900/40 sm:col-span-2">
                      <span className="font-semibold text-zinc-500 text-[10px] block">Interrupt for:</span>
                      <span className="text-zinc-800 dark:text-zinc-200">{aiStructuredResult.interrupt_for || 'Standard rules'}</span>
                    </div>
                  </div>

                  {/* Buttons: [Apply], [Edit], [Regenerate] */}
                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-indigo-200/60 dark:border-indigo-800/40">
                    <button
                      type="button"
                      onClick={handleAIStructure}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Regenerate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleApplyAIResult();
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200"
                    >
                      Edit Fields
                    </button>
                    <button
                      id="ai-apply-structured-btn"
                      type="button"
                      onClick={async () => {
                        handleApplyAIResult();
                        // Auto-save on apply
                        setSaving(true);
                        try {
                          const res = await api.updateStatus({
                            status: aiStructuredResult.status,
                            project: aiStructuredResult.project,
                            task: aiStructuredResult.task,
                            message: aiStructuredResult.message,
                            interrupt_for: aiStructuredResult.interrupt_for || 'Critical blockers only',
                            expires_at: aiStructuredResult.until,
                          });
                          setWorkContext(res.workContext);
                          showToast(`Applied & saved: ${aiStructuredResult.status}`);
                          const projectText = res.workContext.project ? ` — Working on ${res.workContext.project}` : '';
                          setSyncedToolNotice(`Slack: ${aiStructuredResult.status}${projectText}`);
                          closeWorkContextModal();
                        } finally {
                          setSaving(false);
                        }
                      }}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center space-x-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply Now</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: MANUAL FIELD CUSTOMIZATION */
            <div className="space-y-4">
              {/* Status Radio Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Select Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('Focus')}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
                      status === 'Focus'
                        ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="text-xs font-bold">Focus</div>
                      <div className="text-[10px] text-zinc-400">Deep work mode</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('Available')}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
                      status === 'Available'
                        ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-xs font-bold">Available</div>
                      <div className="text-[10px] text-zinc-400">Open for questions</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('Away')}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
                      status === 'Away'
                        ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <CircleDot className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="text-xs font-bold">Away</div>
                      <div className="text-[10px] text-zinc-400">Stepped out</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Status Message + AI Message Tone Generator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Status Message
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateTones}
                    disabled={generatingTone}
                    className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>{generatingTone ? 'Generating tones...' : '✨ Polish with AI Tones'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={status === 'Focus' ? 'Working on authentication — please avoid interruptions.' : 'Free for a quick discussion.'}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />

                {/* Tone Variations Picker */}
                {toneVariations && (
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2 mt-2">
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                      Choose Tone:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setMessage(toneVariations.professional)}
                        className="p-2 text-left rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 text-xs text-zinc-700 dark:text-zinc-200 transition-all"
                      >
                        <span className="font-bold text-[10px] text-indigo-600 block">Professional</span>
                        <span className="line-clamp-2">{toneVariations.professional}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessage(toneVariations.friendly)}
                        className="p-2 text-left rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 text-xs text-zinc-700 dark:text-zinc-200 transition-all"
                      >
                        <span className="font-bold text-[10px] text-emerald-600 block">Friendly</span>
                        <span className="line-clamp-2">{toneVariations.friendly}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessage(toneVariations.concise)}
                        className="p-2 text-left rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 text-xs text-zinc-700 dark:text-zinc-200 transition-all"
                      >
                        <span className="font-bold text-[10px] text-purple-600 block">Concise</span>
                        <span className="line-clamp-2">{toneVariations.concise}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Project & Task */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Project
                  </label>
                  <input
                    type="text"
                    value={project}
                    onChange={e => setProject(e.target.value)}
                    placeholder="e.g. Checkout 2.0"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Current Task
                  </label>
                  <input
                    type="text"
                    value={task}
                    onChange={e => setTask(e.target.value)}
                    placeholder="e.g. Frontend implementation"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Expiration Time / Preset Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                  <span>Until (Expiration Time)</span>
                  <span className="text-[11px] text-zinc-400">Status auto-clears when expired</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={expiresAt || ''}
                    onChange={e => setExpiresAt(e.target.value || null)}
                    placeholder="e.g. 8:00 PM, 30m, 2h"
                    className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  {expiresAt && (
                    <button
                      type="button"
                      onClick={() => setExpiresAt(null)}
                      className="text-xs text-zinc-400 hover:text-zinc-600 px-2 py-1"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Preset pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['30m', '1h', '2h', '3:30 PM', '6:00 PM', '8:00 PM'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setExpiresAt(preset)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                        expiresAt === preset
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interrupt for */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Interrupt for (Declared Boundaries)
                </label>
                <input
                  type="text"
                  value={interruptFor}
                  onChange={e => setInterruptFor(e.target.value)}
                  placeholder="e.g. Critical blockers, production issues only"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Syncs to Slack, Teams & Calendar</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={closeWorkContextModal}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              id="save-work-context-btn"
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm flex items-center space-x-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save & Declare Status'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
