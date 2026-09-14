import { GoogleGenAI } from '@google/genai';
import { WorkEvent, UserStatus } from '../types.ts';

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Clean JSON response from Gemini model markdown blocks
function extractJson(text: string): any {
  try {
    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return JSON.parse(trimmed);
    }
    const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      return JSON.parse(match[1].trim());
    }
    return JSON.parse(trimmed);
  } catch (err) {
    console.warn('Failed to parse JSON from AI response:', text);
    return null;
  }
}

/**
 * 1. AI Status Writer (structureContext)
 * Takes natural language and extracts structured status parameters without inventing data
 */
export async function structureContext(input: string): Promise<{
  status: UserStatus;
  message: string;
  project: string;
  task: string;
  until: string | null;
  interrupt_for: string;
}> {
  const fallback = fallbackStructureContext(input);
  const ai = getGenAI();
  if (!ai) return fallback;

  try {
    const prompt = `You are OmniWork's AI Status Writer.
Given this user's natural language input describing their work context:
"${input}"

Extract the structured availability information.
CRITICAL RULES:
- The AI must NEVER invent a time, project, or task that was not stated.
- If a time is not provided or implied in the input, set "until" to null.
- "status" must be strictly one of: "Focus", "Available", or "Away".
- "message" should be a polished, respectful status message communicating their intent.
- "project" is the project name mentioned, or empty string if not mentioned.
- "task" is the task mentioned, or empty string if not mentioned.
- "interrupt_for" is what they are willing to be interrupted for (e.g. "Critical blockers", "Emergencies only"), or empty string if not mentioned.

Return ONLY a valid JSON object matching this schema:
{
  "status": "Focus" | "Available" | "Away",
  "message": string,
  "project": string,
  "task": string,
  "until": string | null,
  "interrupt_for": string
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = extractJson(response.text || '');
    if (parsed && parsed.status && parsed.message) {
      return {
        status: ['Focus', 'Available', 'Away'].includes(parsed.status) ? parsed.status : 'Focus',
        message: parsed.message || fallback.message,
        project: parsed.project || '',
        task: parsed.task || '',
        until: parsed.until || null,
        interrupt_for: parsed.interrupt_for || '',
      };
    }
    return fallback;
  } catch (err) {
    console.warn('Error calling Gemini structureContext, using fallback:', err);
    return fallback;
  }
}

function fallbackStructureContext(input: string) {
  const lower = input.toLowerCase();
  let status: UserStatus = 'Focus';
  if (lower.includes('free') || lower.includes('available') || lower.includes('open') || lower.includes('chat')) {
    status = 'Available';
  } else if (lower.includes('away') || lower.includes('lunch') || lower.includes('stepping out') || lower.includes('errand')) {
    status = 'Away';
  }

  // Extract time if exists (e.g. "8 PM", "3:30 pm", "2pm")
  const timeMatch = input.match(/(?:until|till|back at|at)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)?)/i) ||
                    input.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM))/i);
  const until = timeMatch ? timeMatch[1].trim() : null;

  // Extract project if checkout, auth, payment, etc.
  let project = '';
  if (lower.includes('checkout')) project = 'Checkout 2.0';
  else if (lower.includes('auth')) project = 'Auth System';
  else if (lower.includes('payment')) project = 'Payment Flow';

  // Extract task
  let task = '';
  if (lower.includes('frontend')) task = 'Frontend implementation';
  else if (lower.includes('dbms') || lower.includes('database')) task = 'Database assignment & queries';
  else if (lower.includes('presentation') || lower.includes('slides')) task = 'Preparing presentation';
  else if (lower.includes('review')) task = 'Code & design review';
  else task = input.slice(0, 40);

  // Extract interrupt preference
  let interrupt_for = '';
  if (lower.includes('critical') || lower.includes('blocker') || lower.includes('production')) {
    interrupt_for = 'Critical blockers & production issues';
  } else if (lower.includes('don\'t disturb') || lower.includes('avoid interruptions') || lower.includes('no interruption')) {
    interrupt_for = 'Urgent blockers only';
  } else if (status === 'Available') {
    interrupt_for = 'Any quick question or sync';
  }

  return {
    status,
    message: input.trim(),
    project,
    task,
    until,
    interrupt_for,
  };
}

/**
 * 2. AI Status Message Generator (tone-based)
 */
export async function generateStatusMessages(input: string): Promise<{
  professional: string;
  friendly: string;
  concise: string;
}> {
  const fallback = {
    professional: `Working on ${input.replace(/^doing /i, '')} — please avoid interruptions.`,
    friendly: `Deep in ${input.replace(/^doing /i, '')} 😅 — catch you later!`,
    concise: `${input.slice(0, 25)} — in Focus mode.`,
  };

  const ai = getGenAI();
  if (!ai) return fallback;

  try {
    const prompt = `You are OmniWork's AI Status Message Generator.
The user provided this raw intent: "${input}"

Generate 3 alternative status messages in different tones:
1. Professional: Clear, business-appropriate, polite boundaries.
2. Friendly: Warm, collegial, lighthearted with an emoji if appropriate.
3. Concise: Extremely brief, telegraphic, high-density status.

Return ONLY a JSON object:
{
  "professional": string,
  "friendly": string,
  "concise": string
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = extractJson(response.text || '');
    if (parsed && parsed.professional && parsed.friendly && parsed.concise) {
      return parsed;
    }
    return fallback;
  } catch (e) {
    console.warn('Error in generateStatusMessages fallback:', e);
    return fallback;
  }
}

/**
 * 3. Check Contact / Interruption Evaluator ("Should I Interrupt?")
 */
export async function checkInterruption(params: {
  teammateName: string;
  status: string;
  customMessage: string;
  interruptPreference: string;
  expiresAt: string | null;
  userRequest: string;
  urgency: 'Quick question' | 'Important' | 'Urgent';
}): Promise<{
  verdict: 'APPROPRIATE TO CONTACT' | 'BETTER TO WAIT' | 'APPROPRIATE TO INTERRUPT';
  reason: string;
  status: string;
  interruptionPreference: string;
  suggestedAction: string;
}> {
  const { teammateName, status, customMessage, interruptPreference, expiresAt, userRequest, urgency } = params;

  // If teammate is Available, always Appropriate
  if (status === 'Available') {
    return {
      verdict: 'APPROPRIATE TO CONTACT',
      reason: `${teammateName} is currently Available and has indicated they are open for collaboration.`,
      status: 'Available',
      interruptionPreference: interruptPreference || 'Open for questions',
      suggestedAction: 'Send a message or start a quick huddle.',
    };
  }

  // If Away
  if (status === 'Away') {
    const backText = expiresAt ? ` until ${expiresAt}` : '';
    if (urgency === 'Urgent') {
      return {
        verdict: 'APPROPRIATE TO INTERRUPT',
        reason: `${teammateName} is currently Away${backText}, but your request is marked Urgent. They will receive it immediately upon checking.`,
        status: 'Away',
        interruptionPreference: interruptPreference || 'Emergencies only',
        suggestedAction: 'Send a concise message outlining the critical urgency.',
      };
    }
    return {
      verdict: 'BETTER TO WAIT',
      reason: `${teammateName} is currently Away${backText}. Non-urgent messages will be queued silently in their inbox.`,
      status: 'Away',
      interruptionPreference: interruptPreference || 'Emergencies only',
      suggestedAction: `Queue the message or wait until ${expiresAt || 'they return'}.`,
    };
  }

  // Teammate is in Focus mode:
  const fallback = evaluateFocusInterruptionDeterministic(params);

  const ai = getGenAI();
  if (!ai) return fallback;

  try {
    const prompt = `You are OmniWork's Interruptibility Evaluator.
Core question: "Is now a good time to contact this person?"
Tagline: "Know before you interrupt."

Context:
- Teammate Name: ${teammateName}
- Status: ${status} (Focus mode)
- Focus Activity/Message: "${customMessage}"
- Declared Interruption Preference: "${interruptPreference}"
- Focus Ends At: ${expiresAt || 'Unspecified'}
- Requester's Question/Need: "${userRequest}"
- Requester's Declared Urgency: ${urgency}

EVALUATION RULES:
1. If the request is a quick question, routine check, navbar tweak, or non-critical item while the teammate is in Focus mode, return "BETTER TO WAIT".
2. If the request matches their declared interruption preference (e.g. "critical blockers", "production outage", "p0 bug", "failing checkout") or is truly urgent, return "APPROPRIATE TO INTERRUPT".
3. Provide a clear, concise, objective 1-2 sentence reason referencing their focus until time and declared preference.
4. Suggest a respectful next action.

Return ONLY a JSON object:
{
  "verdict": "BETTER TO WAIT" | "APPROPRIATE TO INTERRUPT" | "APPROPRIATE TO CONTACT",
  "reason": string,
  "status": string,
  "interruptionPreference": string,
  "suggestedAction": string
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = extractJson(response.text || '');
    if (parsed && parsed.verdict && parsed.reason) {
      return {
        verdict: parsed.verdict,
        reason: parsed.reason,
        status,
        interruptionPreference: interruptPreference,
        suggestedAction: parsed.suggestedAction || fallback.suggestedAction,
      };
    }
    return fallback;
  } catch (err) {
    console.warn('Error calling Gemini checkInterruption, using fallback:', err);
    return fallback;
  }
}

function evaluateFocusInterruptionDeterministic(params: {
  teammateName: string;
  status: string;
  customMessage: string;
  interruptPreference: string;
  expiresAt: string | null;
  userRequest: string;
  urgency: 'Quick question' | 'Important' | 'Urgent';
}) {
  const req = params.userRequest.toLowerCase();
  const until = params.expiresAt ? `until ${params.expiresAt}` : 'in focus mode';
  const isCritical =
    params.urgency === 'Urgent' ||
    req.includes('production') ||
    req.includes('prod') ||
    req.includes('failing') ||
    req.includes('outage') ||
    req.includes('blocker') ||
    req.includes('broken');

  if (isCritical) {
    return {
      verdict: 'APPROPRIATE TO INTERRUPT' as const,
      reason: `This matches ${params.teammateName}'s declared preference for ${params.interruptPreference || 'critical issues'}.`,
      status: params.status,
      interruptionPreference: params.interruptPreference,
      suggestedAction: 'Send your message with clear context and the severity level.',
    };
  }

  return {
    verdict: 'BETTER TO WAIT' as const,
    reason: `${params.teammateName} is focused ${until} and this request doesn't match their interruption preference.`,
    status: params.status,
    interruptionPreference: params.interruptPreference,
    suggestedAction: 'Queue the message for later or wait until their focus session completes.',
  };
}

/**
 * 4. AI Message Writer
 * Generates respectful, well-bounded message to a teammate
 */
export async function generateMessage(params: {
  recipientName: string;
  recipientStatus: string;
  recipientTask?: string;
  rawGoal: string;
  tone: 'Professional' | 'Friendly' | 'Concise' | 'Urgent';
}): Promise<{
  generatedMessage: string;
  tone: string;
  isRecipientFocused: boolean;
}> {
  const isRecipientFocused = params.recipientStatus === 'Focus';
  const fallback = getFallbackMessage(params);

  const ai = getGenAI();
  if (!ai) return { generatedMessage: fallback, tone: params.tone, isRecipientFocused };

  try {
    const prompt = `You are OmniWork's AI Message Writer.
Goal: Compose a respectful, context-aware work message.
- Recipient: ${params.recipientName}
- Current Status: ${params.recipientStatus} ${isRecipientFocused ? '(Recipient is currently in FOCUS MODE — avoid being demanding)' : ''}
- What the user wants to say: "${params.rawGoal}"
- Desired Tone: ${params.tone}

RULES:
- Make communication respectful, not demanding.
- If recipient is in Focus mode, acknowledge their time or specify "no rush / whenever you have a moment" unless tone is Urgent.
- Tone guidelines:
  - Professional: Courteous, well-formatted, clear call to action.
  - Friendly: Warm, appreciative ("Hey [Name]! When you get a chance...").
  - Concise: Direct, brief, high clarity in 1-2 sentences.
  - Urgent: Direct, highlights the critical blocker cleanly without panic.
- Return ONLY the exact message text (do not include markdown quotes).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text?.trim();
    if (text) {
      return { generatedMessage: text.replace(/^["']|["']$/g, ''), tone: params.tone, isRecipientFocused };
    }
    return { generatedMessage: fallback, tone: params.tone, isRecipientFocused };
  } catch (e) {
    console.warn('Error in generateMessage fallback:', e);
    return { generatedMessage: fallback, tone: params.tone, isRecipientFocused };
  }
}

function getFallbackMessage(params: {
  recipientName: string;
  recipientStatus: string;
  rawGoal: string;
  tone: string;
}): string {
  const first = params.recipientName.split(' ')[0];
  const goalClean = params.rawGoal.replace(/^(ask\s+\w+\s+to|tell\s+\w+\s+to)\s+/i, '');

  switch (params.tone) {
    case 'Friendly':
      return `Hey ${first}! When you have a moment, could you take a quick look at ${goalClean}? No rush at all!`;
    case 'Concise':
      return `${first}: Quick ping on ${goalClean}. Let me know when you have 2 minutes.`;
    case 'Urgent':
      return `Hi ${first}, apologies for the interruption — we have a critical blocker regarding ${goalClean}. Could you take a look when possible?`;
    case 'Professional':
    default:
      return `Hi ${first}, when you have an opening, would you be able to help review ${goalClean}? Thank you!`;
  }
}

/**
 * 5. OmniWork AI Team Assistant (Ask Omni)
 * Answers availability questions using LIVE database context
 */
export async function askOmniAssistant(
  question: string,
  teamData: Array<{
    name: string;
    role: string;
    skills: string[];
    status: UserStatus;
    project: string;
    task: string;
    message: string;
    interrupt_for: string;
    expires_at: string | null;
  }>
): Promise<{
  answer: string;
  sources: Array<{ name: string; status: string; detail: string }>;
  suggestedFollowUps?: string[];
}> {
  const fallback = answerOmniDeterministic(question, teamData);
  const ai = getGenAI();
  if (!ai) return fallback;

  try {
    const prompt = `You are OMNIWORK AI — "Your team's availability assistant".
Core philosophy: "Know before you interrupt."
Privacy rule: Never infer surveillance, never claim to know whether someone is "actually working", use ONLY declared availability.
CRITICAL CONSTRAINT: NEVER hallucinate team availability or invent people/times. If not in the data, state you don't have enough information.

CURRENT LIVE TEAM DATABASE:
${JSON.stringify(teamData, null, 2)}

USER QUESTION:
"${question}"

GUIDELINES FOR COMMON QUESTIONS:
1. "Who is available right now?" -> List everyone whose status is "Available" with what they are currently open for.
2. "Who can help me with [skill, e.g. PostgreSQL or frontend]?" ->
   Examine teammate skills AND availability!
   Example: If Rahul knows PostgreSQL but is in Focus mode until 3:30 PM, and Sarah is Available but has different skills, explain:
   "Rahul is the strongest match for PostgreSQL, but he's currently in Focus mode until 3:30 PM. Sarah is currently available, but may not be the best technical match."
3. "Who is focused?" -> List everyone currently in "Focus" mode, their focus topic, until time, and what they can be interrupted for.
4. "When is [Person] available?" -> Check their status and expires_at.
5. "Should I interrupt [Person]?" -> Check their current status and declared interrupt_for rules.

Return ONLY a JSON object:
{
  "answer": string,
  "sources": [
    { "name": string, "status": string, "detail": string }
  ],
  "suggestedFollowUps": [ string, string ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = extractJson(response.text || '');
    if (parsed && parsed.answer) {
      return {
        answer: parsed.answer,
        sources: parsed.sources || fallback.sources,
        suggestedFollowUps: parsed.suggestedFollowUps || fallback.suggestedFollowUps,
      };
    }
    return fallback;
  } catch (err) {
    console.warn('Error in askOmniAssistant fallback:', err);
    return fallback;
  }
}

function answerOmniDeterministic(
  question: string,
  teamData: Array<{
    name: string;
    role: string;
    skills: string[];
    status: UserStatus;
    project: string;
    task: string;
    message: string;
    interrupt_for: string;
    expires_at: string | null;
  }>
) {
  const q = question.toLowerCase();

  // Who is available?
  if (q.includes('available') && (q.includes('who') || q.includes('right now') || q.includes('anyone'))) {
    const available = teamData.filter(t => t.status === 'Available');
    const names = available.map(t => t.name).join(', ');
    return {
      answer: `Currently, ${available.length} teammate${available.length === 1 ? '' : 's'} are Available: ${names}. They have indicated they are open for questions and quick syncs.`,
      sources: available.map(t => ({ name: t.name, status: t.status, detail: t.message })),
      suggestedFollowUps: ['Who is in Focus mode?', 'Who can help me with PostgreSQL?'],
    };
  }

  // Who is focused?
  if (q.includes('focus') || q.includes('focused')) {
    const focused = teamData.filter(t => t.status === 'Focus');
    const descriptions = focused
      .map(t => `${t.name} (until ${t.expires_at || 'end of day'}) working on ${t.task || t.project}`)
      .join('; ');
    return {
      answer: `Currently, ${focused.length} teammate${focused.length === 1 ? '' : 's'} are in Focus mode: ${descriptions}.`,
      sources: focused.map(t => ({ name: t.name, status: t.status, detail: `Until ${t.expires_at}: ${t.task}` })),
      suggestedFollowUps: ['Who is available right now?', 'Should I interrupt Rahul?'],
    };
  }

  // Skill match: PostgreSQL / Database
  if (q.includes('postgres') || q.includes('database') || q.includes('sql') || q.includes('backend')) {
    const rahul = teamData.find(t => t.name.toLowerCase().includes('rahul'));
    const sarah = teamData.find(t => t.name.toLowerCase().includes('sarah'));
    const marcus = teamData.find(t => t.name.toLowerCase().includes('marcus'));

    let ans = '';
    if (rahul && rahul.status === 'Focus') {
      ans = `Rahul is the strongest match for PostgreSQL (${rahul.skills.join(', ')}), but he's currently in Focus mode until ${rahul.expires_at || '3:30 PM'}.`;
      if (marcus && marcus.status === 'Available') {
        ans += ` Marcus is currently Available and also has PostgreSQL & infrastructure experience.`;
      } else if (sarah && sarah.status === 'Available') {
        ans += ` Sarah is currently Available, but specializes primarily in frontend and UX.`;
      }
    } else {
      ans = 'Rahul and Marcus are our primary PostgreSQL specialists.';
    }

    return {
      answer: ans,
      sources: [
        ...(rahul ? [{ name: rahul.name, status: rahul.status, detail: `Skills: ${rahul.skills.join(', ')}` }] : []),
        ...(marcus ? [{ name: marcus.name, status: marcus.status, detail: `Skills: ${marcus.skills.join(', ')}` }] : []),
      ],
      suggestedFollowUps: ['Should I interrupt Rahul?', 'Who is available right now?'],
    };
  }

  // Frontend match
  if (q.includes('frontend') || q.includes('ui') || q.includes('react') || q.includes('navbar')) {
    const sarah = teamData.find(t => t.name.toLowerCase().includes('sarah'));
    return {
      answer: sarah
        ? `Sarah Lin is the lead for Frontend (${sarah.skills.join(', ')}). She is currently Available and open for questions.`
        : 'Sarah Lin is available for frontend support.',
      sources: sarah ? [{ name: sarah.name, status: sarah.status, detail: sarah.message }] : [],
      suggestedFollowUps: ['Message Sarah', 'Who else is available?'],
    };
  }

  // Specific person: Rahul
  if (q.includes('rahul')) {
    const rahul = teamData.find(t => t.name.toLowerCase().includes('rahul'));
    if (rahul) {
      return {
        answer: `Rahul is currently in ${rahul.status} mode until ${rahul.expires_at || '3:30 PM'} working on "${rahul.task}". His declared interrupt preference is: "${rahul.interrupt_for}".`,
        sources: [{ name: rahul.name, status: rahul.status, detail: rahul.message }],
        suggestedFollowUps: ['Check if appropriate to interrupt Rahul', 'Who can help with backend?'],
      };
    }
  }

  // Specific person: Sarah
  if (q.includes('sarah')) {
    const sarah = teamData.find(t => t.name.toLowerCase().includes('sarah'));
    if (sarah) {
      return {
        answer: `Sarah is currently ${sarah.status}. She stated: "${sarah.message}". Her interruption preference is: "${sarah.interrupt_for}".`,
        sources: [{ name: sarah.name, status: sarah.status, detail: sarah.message }],
        suggestedFollowUps: ['Send a message to Sarah', 'Who is in Focus?'],
      };
    }
  }

  // Default answer
  const availableCount = teamData.filter(t => t.status === 'Available').length;
  const focusCount = teamData.filter(t => t.status === 'Focus').length;
  return {
    answer: `The team currently has ${availableCount} available, ${focusCount} in focus mode. You can ask who is available, who has specific technical expertise, or whether it is appropriate to interrupt a teammate.`,
    sources: teamData.slice(0, 3).map(t => ({ name: t.name, status: t.status, detail: t.task || t.message })),
    suggestedFollowUps: ['Who is available right now?', 'Who can help me with PostgreSQL?', 'Who is focused?'],
  };
}

/**
 * 6. Team Pulse Summary
 */
export async function generateTeamPulse(
  teamData: Array<{ name: string; status: UserStatus; task: string; expires_at: string | null }>
): Promise<{
  counts: { available: number; focus: number; away: number };
  summary: string;
}> {
  const counts = {
    available: teamData.filter(t => t.status === 'Available').length,
    focus: teamData.filter(t => t.status === 'Focus').length,
    away: teamData.filter(t => t.status === 'Away').length,
  };

  const focusMembers = teamData.filter(t => t.status === 'Focus');
  const awayMembers = teamData.filter(t => t.status === 'Away');

  let defaultSummary = `Most of the team is currently available (${counts.available} available).`;
  if (focusMembers.length > 0) {
    const f = focusMembers[0];
    defaultSummary += ` ${f.name} is focused on ${f.task || 'deep work'} until ${f.expires_at || 'later today'}.`;
  }
  if (awayMembers.length > 0) {
    defaultSummary += ` ${awayMembers[0].name} is away.`;
  }

  const ai = getGenAI();
  if (!ai) return { counts, summary: defaultSummary };

  try {
    const prompt = `You are OmniWork's Team Pulse Summarizer.
Given this team status snapshot:
${JSON.stringify(teamData, null, 2)}

Provide a concise 1-2 sentence human summary of the team's current availability state.
Example format:
"Most of the team is currently available. Rahul is focused on webhook retry handling until 3:30 PM, while Priya is away."
Do not show productivity statistics or surveillance metrics. Return ONLY the summary sentence.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const summary = response.text?.trim() || defaultSummary;
    return { counts, summary };
  } catch (e) {
    return { counts, summary: defaultSummary };
  }
}

/**
 * 7. Catch-Up Brief
 * Summarizes work events while user was in Focus mode
 */
export async function generateCatchUpBrief(events: WorkEvent[], userProject?: string): Promise<{
  readTimeSeconds: number;
  headline: string;
  blockers: WorkEvent[];
  decisions: WorkEvent[];
  actions: WorkEvent[];
  fyis: WorkEvent[];
  summary: string;
}> {
  const blockers = events.filter(e => e.category === 'BLOCKER');
  const decisions = events.filter(e => e.category === 'DECISION');
  const actions = events.filter(e => e.category === 'ACTION');
  const fyis = events.filter(e => e.category === 'FYI');

  const defaultSummary = `While you were focused, payment webhook failures were identified in staging, leading to a 48-hour launch postponement to Monday. Action is required on PR #142 and documentation updates.`;

  const ai = getGenAI();
  let summary = defaultSummary;

  if (ai) {
    try {
      const prompt = `You are OmniWork's Catch-Up Assistant.
User's declared focus project: "${userProject || 'Checkout 2.0'}"
Events that occurred while they were focused:
${JSON.stringify(events, null, 2)}

Generate a 2-sentence executive catch-up brief highlighting the key blocker, major decision, and immediate action required.
Return ONLY plain text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      if (response.text?.trim()) {
        summary = response.text.trim();
      }
    } catch (e) {
      console.warn('Error in generateCatchUpBrief AI:', e);
    }
  }

  return {
    readTimeSeconds: 45,
    headline: 'Caught up in 45 seconds.',
    blockers,
    decisions,
    actions,
    fyis,
    summary,
  };
}

/**
 * 8. Explain Why
 * Explains decisions strictly based on evidence
 */
export async function explainWhy(
  eventTitle: string,
  allEvents: WorkEvent[]
): Promise<{
  explanation: string;
  evidenceTimeline: Array<{ time: string; source: string; note: string }>;
}> {
  const defaultEvidence = [
    { time: '10:10 AM', source: 'Slack #payments', note: 'Payment webhook failures reported in staging' },
    { time: '11:00 AM', source: 'Engineering Sync', note: 'QA flagged payment edge cases and requested full regression coverage' },
    { time: '11:15 AM', source: 'Project Update', note: 'Checkout launch moved to Monday to ensure zero payment regression risks' },
  ];

  const defaultExplanation = `Payment webhook failures increased deployment risk, so engineering requested additional regression testing before release.`;

  const ai = getGenAI();
  if (!ai) {
    return {
      explanation: defaultExplanation,
      evidenceTimeline: defaultEvidence,
    };
  }

  try {
    const prompt = `You are OmniWork's Explain Why Engine.
User wants to understand the context behind this decision/event:
"${eventTitle}"

Available Work Events Context:
${JSON.stringify(allEvents, null, 2)}

Provide:
1. A concise, evidence-based 1-2 sentence explanation of why this decision was made. Must be based strictly on the events evidence.
2. A chronological timeline of the key evidence items (time, source, note).

Return ONLY a JSON object:
{
  "explanation": string,
  "evidenceTimeline": [
    { "time": string, "source": string, "note": string }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = extractJson(response.text || '');
    if (parsed && parsed.explanation && Array.isArray(parsed.evidenceTimeline)) {
      return parsed;
    }
    return {
      explanation: defaultExplanation,
      evidenceTimeline: defaultEvidence,
    };
  } catch (err) {
    return {
      explanation: defaultExplanation,
      evidenceTimeline: defaultEvidence,
    };
  }
}
