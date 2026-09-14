import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Users,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { api } from '../services/api.ts';
import { useApp } from '../context/AppContext.tsx';

interface ChatMessage {
  id: string;
  sender: 'user' | 'omni';
  text: string;
  sources?: Array<{ name: string; status: string; detail: string }>;
  suggestedFollowUps?: string[];
  timestamp: string;
}

export const AskOmniView: React.FC = () => {
  const { teammates, openShouldIInterrupt, openMessageWriter } = useApp();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'omni',
      text: "Hello! I'm OmniWork's Team Availability Assistant. Ask me anything about who is free, who has specific technical skills, or whether someone can be reached right now.",
      timestamp: 'Just now',
    },
  ]);

  const promptChips = [
    'Who is available right now?',
    'Who knows PostgreSQL and is free?',
    'Is Rahul free to chat?',
    'Who can help with Stripe payments?',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || question;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await api.askOmni(textToSend);
      const omniMsg: ChatMessage = {
        id: `omni-${Date.now()}`,
        sender: 'omni',
        text: response.answer,
        sources: response.sources,
        suggestedFollowUps: response.suggestedFollowUps,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, omniMsg]);
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: `omni-err-${Date.now()}`,
        sender: 'omni',
        text: "I'm having trouble analyzing live team status right now. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ask-omni-view" className="space-y-6 pb-12 max-w-4xl mx-auto text-left">
      {/* View Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <span>OmniWork AI Assistant</span>
        </h2>
        <p className="text-xs text-zinc-500">
          Query live team availability, focus sessions, and domain skills in real time
        </p>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[11px] font-semibold text-zinc-400">Try asking:</span>
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-zinc-850 hover:bg-indigo-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-750 shadow-xs hover:border-indigo-300 transition-all"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 min-h-[420px] flex flex-col justify-between">
        {/* Messages List */}
        <div className="space-y-4 flex-1 overflow-y-auto">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'omni' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Grounded Teammates Mentions */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-700/60 space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Live status references:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.sources.map((s, idx) => {
                        const teammate = teammates.find(t => t.name === s.name);
                        return (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700/70 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                                {s.name}
                              </span>
                              <span className="text-[11px] text-zinc-500">
                                {s.status} • {s.detail}
                              </span>
                            </div>
                            {teammate && (
                              <button
                                onClick={() => openShouldIInterrupt(teammate)}
                                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline ml-2 flex-shrink-0"
                              >
                                Check
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-2 text-[10px] text-zinc-400 text-right">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3 text-xs text-zinc-500">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <span>Analyzing live database and availability records...</span>
            </div>
          )}
        </div>

        {/* Query Input Box */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Ask Omni: e.g. Who knows PostgreSQL and is available right now?"
              className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-sm flex items-center space-x-1.5 disabled:opacity-50 transition-all"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="mt-2 text-[11px] text-zinc-400 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Strictly grounded in self-declared team statuses. Never uses device monitoring.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
