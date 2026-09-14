import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Play,
  Layers,
  ArrowRight,
  ShieldCheck,
  Compass,
  MessageSquare,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

interface WalkthroughStep {
  number: number;
  title: string;
  tagline: string;
  description: string;
  category: 'Overview' | 'Status & Boundaries' | 'Interruption AI' | 'Catch-Up & Trace' | 'Team Intelligence' | 'Privacy';
  actionLabel?: string;
  onAction?: () => void;
}

export const DemoWalkthroughModal: React.FC = () => {
  const {
    demoWalkthroughOpen,
    closeDemoWalkthrough,
    setCurrentView,
    openWorkContextModal,
    openNotificationsDrawer,
    teammates,
    openShouldIInterrupt,
    openMessageWriter,
  } = useApp();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!demoWalkthroughOpen) return null;

  const steps: WalkthroughStep[] = [
    {
      number: 1,
      title: 'The Core Problem',
      tagline: 'Remote work interruption fatigue',
      description: 'Remote and hybrid teams face constant interruption fatigue. Teammates interrupt without knowing if someone is in deep focus, or they hesitate to reach out for critical blockers.',
      category: 'Overview',
      actionLabel: 'Explore Dashboard',
      onAction: () => {
        setCurrentView('dashboard');
        closeDemoWalkthrough();
      }
    },
    {
      number: 2,
      title: 'Introducing OmniWork',
      tagline: 'An interruptibility layer, not a virtual office',
      description: 'OmniWork is an interruptibility and context layer with zero employee surveillance. Status is strictly self-declared, answering the question: "Should I interrupt right now?"',
      category: 'Overview',
    },
    {
      number: 3,
      title: 'Declaring Deep Focus',
      tagline: 'Self-declared focus session',
      description: 'Enter your work context using plain English: "Finishing payment integration for Checkout 2.0 until 8 PM. Only interrupt for production issues."',
      category: 'Status & Boundaries',
      actionLabel: 'Open ✨ AI Status Writer',
      onAction: () => {
        closeDemoWalkthrough();
        openWorkContextModal();
      }
    },
    {
      number: 4,
      title: 'AI Status Structuring',
      tagline: 'Structured boundaries without tedious forms',
      description: "Gemini structures your input into Status (Focus), Project (Checkout 2.0), Task (Payment integration), Until (8:00 PM), and Interrupt For (Production issues). You review before applying.",
      category: 'Status & Boundaries',
      actionLabel: 'Open Modal to View AI Structuring',
      onAction: () => {
        closeDemoWalkthrough();
        openWorkContextModal();
      }
    },
    {
      number: 5,
      title: 'Active Focus State',
      tagline: 'Visible boundaries across your team',
      description: 'Your status updates instantly on the dashboard with a focus indicator, timer until 8:00 PM, and your declared boundary rules.',
      category: 'Status & Boundaries',
      actionLabel: 'View Status Banner',
      onAction: () => {
        setCurrentView('dashboard');
        closeDemoWalkthrough();
      }
    },
    {
      number: 6,
      title: 'Tool Sync Preview',
      tagline: 'Bi-directional companion sync',
      description: 'Notice the top bar: "Synced: Slack: Focus — Working on Checkout 2.0". OmniWork integrates as a lightweight companion layer.',
      category: 'Status & Boundaries',
    },
    {
      number: 7,
      title: 'Focus Notification Boundary',
      tagline: 'Silent queueing during deep work',
      description: 'During Focus mode, non-urgent messages are held silently: "3 messages waiting. Review when you\'re ready." No noisy pings or context switching.',
      category: 'Status & Boundaries',
      actionLabel: 'Review Waiting Messages',
      onAction: () => {
        closeDemoWalkthrough();
        openNotificationsDrawer();
      }
    },
    {
      number: 8,
      title: 'Team Directory View',
      tagline: 'See who is open and who is locked in',
      description: 'Navigate to the Team Directory to view everyone\'s status, active project, until time, and skill tags (PostgreSQL, Stripe, React).',
      category: 'Team Intelligence',
      actionLabel: 'Go to Team Directory',
      onAction: () => {
        setCurrentView('team');
        closeDemoWalkthrough();
      }
    },
    {
      number: 9,
      title: 'Live Team Statuses',
      tagline: 'Transparent context without surveillance',
      description: 'See Rahul focused on Stripe webhook retry logic until 3:30 PM, Sarah available for frontend reviews, and Priya away until 4:00 PM.',
      category: 'Team Intelligence',
      actionLabel: 'View Team Grid',
      onAction: () => {
        setCurrentView('team');
        closeDemoWalkthrough();
      }
    },
    {
      number: 10,
      title: 'AI Team Pulse',
      tagline: 'Real-time narrative availability summary',
      description: 'The Team Pulse card synthesizes overall team availability in natural language, so managers and teammates know the vibe at a glance.',
      category: 'Team Intelligence',
    },
    {
      number: 11,
      title: 'Interruption Check: Better to Wait',
      tagline: 'AI checks if your request respects focus',
      description: 'Select Rahul (Focus). Ask: "Can you look at my PR?" AI evaluates the request against his declared preference and recommends: BETTER TO WAIT.',
      category: 'Interruption AI',
      actionLabel: 'Test Interruption Check',
      onAction: () => {
        const rahul = teammates.find(t => t.name.includes('Rahul')) || teammates[1];
        if (rahul) {
          closeDemoWalkthrough();
          openShouldIInterrupt(rahul);
        }
      }
    },
    {
      number: 12,
      title: 'Interruption Check: Appropriate to Interrupt',
      tagline: 'Critical issues break through respectfully',
      description: 'Now ask Rahul: "Production checkout webhook is failing." Gemini recognizes this matches his rule for critical blockers and advises: APPROPRIATE TO INTERRUPT.',
      category: 'Interruption AI',
      actionLabel: 'Test Urgent Interruption',
      onAction: () => {
        const rahul = teammates.find(t => t.name.includes('Rahul')) || teammates[1];
        if (rahul) {
          closeDemoWalkthrough();
          openShouldIInterrupt(rahul);
        }
      }
    },
    {
      number: 13,
      title: '✨ AI Message Writer',
      tagline: 'Draft respectful, context-aware messages',
      description: 'When reaching out, OmniWork crafts a polite message that acknowledges their focus state without causing cognitive overload.',
      category: 'Interruption AI',
      actionLabel: 'Open AI Message Writer',
      onAction: () => {
        const sarah = teammates.find(t => t.name.includes('Sarah')) || teammates[0];
        if (sarah) {
          closeDemoWalkthrough();
          openMessageWriter(sarah);
        }
      }
    },
    {
      number: 14,
      title: 'Adaptive Tone Selection',
      tagline: 'Friendly, Professional, Concise, or Urgent',
      description: 'Switch tones instantly. A friendly note for Sarah vs. a concise production alert for on-call engineers.',
      category: 'Interruption AI',
    },
    {
      number: 15,
      title: 'Catch-Up Hub',
      tagline: 'Async briefing after focus sessions',
      description: 'Returning from 2 hours of focus? Head to Catch-Up Hub instead of scrolling through 200 unread Slack messages.',
      category: 'Catch-Up & Trace',
      actionLabel: 'Open Catch-Up Hub',
      onAction: () => {
        setCurrentView('catchup');
        closeDemoWalkthrough();
      }
    },
    {
      number: 16,
      title: 'Caught Up in 45 Seconds',
      tagline: 'AI synthesized executive brief',
      description: 'The AI extracts 1 Blocker, 2 Decisions, and 1 Action item directly affecting your projects, saving 20 minutes of message scanning.',
      category: 'Catch-Up & Trace',
      actionLabel: 'View AI Brief',
      onAction: () => {
        setCurrentView('catchup');
        closeDemoWalkthrough();
      }
    },
    {
      number: 17,
      title: 'Categorized Work Events',
      tagline: 'Blockers, Decisions, Actions, and FYIs',
      description: 'Structured badges allow immediate triage of what actually requires your input.',
      category: 'Catch-Up & Trace',
    },
    {
      number: 18,
      title: 'Explain Why Feature',
      tagline: 'Audit decisions with factual evidence',
      description: 'Why was the checkout launch moved to Monday? Click "Explain Why" on that decision item.',
      category: 'Catch-Up & Trace',
      actionLabel: 'Go to Catch-Up & Test "Explain Why"',
      onAction: () => {
        setCurrentView('catchup');
        closeDemoWalkthrough();
      }
    },
    {
      number: 19,
      title: 'Factual Evidence Timeline',
      tagline: 'Zero hallucination audit trail',
      description: 'OmniWork displays the exact sequence of events from 10:10 AM test failure to 11:00 AM sync to 11:15 AM reschedule. Completely grounded.',
      category: 'Catch-Up & Trace',
    },
    {
      number: 20,
      title: 'Ask Omni Assistant',
      tagline: 'Team intelligence answering availability queries',
      description: 'Ask: "Who knows PostgreSQL and is available right now?" OmniWork synthesizes: Sarah is available now; Rahul is in focus until 3:30 PM.',
      category: 'Team Intelligence',
      actionLabel: 'Open OmniWork AI',
      onAction: () => {
        setCurrentView('ask-omni');
        closeDemoWalkthrough();
      }
    },
    {
      number: 21,
      title: 'The Privacy Promise',
      tagline: 'Zero surveillance. Better boundaries.',
      description: 'No keyloggers, no mouse tracking, no webcam monitoring, no productivity scores. OmniWork is human-first software that treats employees with dignity.',
      category: 'Privacy',
      actionLabel: 'View Privacy Manifesto',
      onAction: () => {
        setCurrentView('integrations');
        closeDemoWalkthrough();
      }
    },
  ];

  const currentStep = steps[currentStepIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div
        id="demo-walkthrough-modal"
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Golden Demo Walkthrough
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Step {currentStep.number} of {steps.length}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                21-step interactive narrative for hackathon judges
              </p>
            </div>
          </div>
          <button
            onClick={closeDemoWalkthrough}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1">
          <div
            className="bg-indigo-600 h-1 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400">
              {currentStep.category}
            </span>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {currentStep.title}
            </h2>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              {currentStep.tagline}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pt-2">
              {currentStep.description}
            </p>
          </div>

          {/* Action Trigger Card */}
          {currentStep.actionLabel && currentStep.onAction && (
            <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-950 dark:text-indigo-200 block">
                  Try this step in the live app:
                </span>
                <span className="text-xs text-zinc-500">
                  Opens the corresponding component immediately
                </span>
              </div>
              <button
                id="walkthrough-step-action-btn"
                onClick={currentStep.onAction}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center space-x-1.5 transition-all"
              >
                <span>{currentStep.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Step Quick-Jump Carousel */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Jump to any step:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {steps.map((s, idx) => (
                <button
                  key={s.number}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                    idx === currentStepIndex
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : idx < currentStepIndex
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-400'
                  }`}
                  title={s.title}
                >
                  {s.number}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex items-center justify-between">
          <button
            onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
            disabled={currentStepIndex === 0}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 disabled:opacity-30 flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-xs text-zinc-400">
            {currentStepIndex + 1} / {steps.length}
          </div>

          <button
            onClick={() => {
              if (currentStepIndex < steps.length - 1) {
                setCurrentStepIndex(prev => prev + 1);
              } else {
                closeDemoWalkthrough();
              }
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm flex items-center space-x-1"
          >
            <span>{currentStepIndex < steps.length - 1 ? 'Next Step' : 'Finish Demo'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
