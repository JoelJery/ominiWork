import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  RefreshCw,
  Edit2,
  Clock,
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';

export const MessageWriterModal: React.FC = () => {
  const {
    messageWriterModalOpen,
    messageRecipient,
    initialMessageGoal,
    closeMessageWriter,
    showToast,
  } = useApp();

  const [rawGoal, setRawGoal] = useState('');
  const [tone, setTone] = useState<'Professional' | 'Friendly' | 'Concise' | 'Urgent'>('Friendly');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (initialMessageGoal) {
      setRawGoal(initialMessageGoal);
    } else if (messageRecipient) {
      setRawGoal(`Ask ${messageRecipient.name.split(' ')[0]} to look at my frontend code.`);
    }
    setGeneratedMessage('');
    setIsEditing(false);
  }, [messageRecipient, initialMessageGoal, messageWriterModalOpen]);

  if (!messageWriterModalOpen || !messageRecipient) return null;

  const isFocused = messageRecipient.workContext.status === 'Focus';

  const handleGenerate = async () => {
    if (!rawGoal.trim()) return;
    setLoading(true);
    try {
      const res = await api.generateMessage({
        recipientId: messageRecipient.id,
        recipientName: messageRecipient.name,
        recipientStatus: messageRecipient.workContext.status,
        recipientTask: messageRecipient.workContext.task,
        rawGoal,
        tone,
      });
      setGeneratedMessage(res.generatedMessage);
      setIsEditing(false);
    } catch (e) {
      showToast('Could not generate message with AI, using fallback', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const messageToSend = generatedMessage || rawGoal;
    if (!messageToSend.trim()) return;
    setSending(true);
    try {
      await api.sendMessage({
        recipient_id: messageRecipient.id,
        urgency: tone === 'Urgent' ? 'Urgent' : 'Quick question',
        body: messageToSend,
      });

      showToast(`Message queued respectfully for ${messageRecipient.name}`);
      closeMessageWriter();
    } catch (e) {
      showToast('Failed to queue message', 'warning');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        id="message-writer-modal"
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                ✨ AI Message Writer
              </h3>
              <p className="text-xs text-zinc-500">
                Craft respectful, context-aware messages
              </p>
            </div>
          </div>
          <button
            onClick={closeMessageWriter}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-left">
          {/* Subtle Focus mode reminder if recipient is focused */}
          {isFocused && (
            <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-start space-x-2.5 text-xs text-indigo-900 dark:text-indigo-200">
              <Clock className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="font-semibold">{messageRecipient.name} is currently in Focus mode</span>
                {messageRecipient.workContext.expires_at && (
                  <span> until {messageRecipient.workContext.expires_at}</span>
                )}
                .
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">
                  Your message will be formatted respectfully to acknowledge their focus session.
                </p>
              </div>
            </div>
          )}

          {/* Recipient summary */}
          <div className="flex items-center space-x-3 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">To:</span>
            <div className="flex items-center space-x-2">
              <img
                src={messageRecipient.avatar_url}
                alt={messageRecipient.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {messageRecipient.name}
              </span>
              <span className="text-zinc-400">({messageRecipient.role})</span>
            </div>
          </div>

          {/* User intent input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
              What do you want to say?
            </label>
            <textarea
              id="message-writer-goal-input"
              rows={2}
              value={rawGoal}
              onChange={e => setRawGoal(e.target.value)}
              placeholder="e.g. Ask Sarah to look at my frontend code."
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          {/* Tone Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
              Select Tone
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Friendly', 'Professional', 'Concise', 'Urgent'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                    tone === t
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Action button: Generate */}
          <button
            id="message-writer-generate-btn"
            onClick={handleGenerate}
            disabled={loading || !rawGoal.trim()}
            className="w-full py-2 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Generating message...' : '✨ Generate Message'}</span>
          </button>

          {/* Generated Message Display / Edit Box */}
          {generatedMessage && (
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Composed ({tone})</span>
                </span>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center space-x-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{isEditing ? 'Done editing' : 'Edit'}</span>
                </button>
              </div>

              {isEditing ? (
                <textarea
                  rows={3}
                  value={generatedMessage}
                  onChange={e => setGeneratedMessage(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 outline-none resize-none"
                />
              ) : (
                <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed bg-white dark:bg-zinc-900/60 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  "{generatedMessage}"
                </p>
              )}

              {/* Action buttons: [Regenerate], [Send] */}
              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate</span>
                </button>

                <button
                  id="message-writer-send-btn"
                  type="button"
                  onClick={handleSend}
                  disabled={sending}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? 'Queuing...' : 'Send Message'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
