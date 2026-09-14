import { Router } from 'express';
import { db } from '../db.ts';
import {
  structureContext,
  generateStatusMessages,
  checkInterruption,
  generateMessage,
  askOmniAssistant,
  generateCatchUpBrief,
  explainWhy,
  generateTeamPulse,
} from '../ai/gemini.ts';

const router = Router();

// 1. Structure work context from natural language
router.post('/structure-context', async (req, res) => {
  const { input } = req.body;
  if (!input) {
    return res.status(400).json({ error: 'Input text is required' });
  }

  const result = await structureContext(input);
  res.json(result);
});

// 2. Generate status message variations in different tones
router.post('/generate-status-message', async (req, res) => {
  const { input, tone } = req.body;
  if (!input) {
    return res.status(400).json({ error: 'Input text is required' });
  }

  const variations = await generateStatusMessages(input);
  if (tone && variations[tone.toLowerCase() as keyof typeof variations]) {
    return res.json({
      selectedTone: tone,
      message: variations[tone.toLowerCase() as keyof typeof variations],
      allVariations: variations,
    });
  }

  res.json({ allVariations: variations });
});

// Alias: /api/generate-status
router.post('/generate-status', async (req, res) => {
  const { input, tone } = req.body;
  if (!input) return res.status(400).json({ error: 'Input text is required' });
  const variations = await generateStatusMessages(input);
  res.json({ allVariations: variations });
});

// 3. Check Contact / "Should I Interrupt?"
async function handleInterruptionEvaluation(req: any, res: any) {
  const {
    teammateId,
    teammateName: providedName,
    status: providedStatus,
    interruptPreference: providedPref,
    customMessage: providedMsg,
    expiresAt: providedExpires,
    userRequest,
    urgency,
  } = req.body;

  if (!userRequest) {
    return res.status(400).json({ error: 'userRequest is required' });
  }

  // Look up real teammate context from DB if teammateId is provided
  let teammateName = providedName || 'Teammate';
  let status = providedStatus || 'Focus';
  let customMessage = providedMsg || '';
  let interruptPreference = providedPref || '';
  let expiresAt = providedExpires || null;

  if (teammateId) {
    const teammate = db.getUser(teammateId);
    const ctx = db.getWorkContext(teammateId);
    if (teammate) teammateName = teammate.name;
    if (ctx) {
      status = ctx.status;
      customMessage = ctx.message || ctx.task;
      interruptPreference = ctx.interrupt_for;
      expiresAt = ctx.expires_at;
    }
  }

  const result = await checkInterruption({
    teammateName,
    status,
    customMessage,
    interruptPreference,
    expiresAt,
    userRequest,
    urgency: urgency || 'Quick question',
  });

  res.json(result);
}

router.post('/check-interruption', handleInterruptionEvaluation);
router.post('/interruptibility', handleInterruptionEvaluation);

// 4. AI Message Writer
router.post('/generate-message', async (req, res) => {
  const { recipientId, recipientName: pName, recipientStatus: pStatus, rawGoal, tone } = req.body;

  if (!rawGoal) {
    return res.status(400).json({ error: 'rawGoal is required' });
  }

  let recipientName = pName || 'Teammate';
  let recipientStatus = pStatus || 'Available';
  let recipientTask = '';

  if (recipientId) {
    const user = db.getUser(recipientId);
    const ctx = db.getWorkContext(recipientId);
    if (user) recipientName = user.name;
    if (ctx) {
      recipientStatus = ctx.status;
      recipientTask = ctx.task;
    }
  }

  const result = await generateMessage({
    recipientName,
    recipientStatus,
    recipientTask,
    rawGoal,
    tone: tone || 'Friendly',
  });

  res.json(result);
});

// 5. Ask Omni (OmniWork AI Team Availability Assistant)
router.post('/ask-omni', async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'question is required' });
  }

  const users = db.getUsers();
  const contexts = db.getAllWorkContexts();

  const teamData = users.map(u => {
    const ctx = contexts[u.id];
    return {
      name: u.name,
      role: u.role,
      skills: u.skills,
      status: ctx?.status || 'Available',
      project: ctx?.project || '',
      task: ctx?.task || '',
      message: ctx?.message || '',
      interrupt_for: ctx?.interrupt_for || '',
      expires_at: ctx?.expires_at || null,
    };
  });

  const response = await askOmniAssistant(question, teamData);
  res.json(response);
});

// 6. AI Team Member Matching / Recommendation
router.post('/team-recommendation', async (req, res) => {
  const { skillOrTopic } = req.body;
  if (!skillOrTopic) {
    return res.status(400).json({ error: 'skillOrTopic is required' });
  }

  const users = db.getUsers();
  const contexts = db.getAllWorkContexts();

  const query = skillOrTopic.toLowerCase();
  const matches = users
    .map(u => {
      const ctx = contexts[u.id];
      const hasSkill = u.skills.some(s => s.toLowerCase().includes(query));
      const roleMatch = u.role.toLowerCase().includes(query);
      const isAvailable = ctx?.status === 'Available';

      let score = 0;
      if (hasSkill) score += 50;
      if (roleMatch) score += 25;
      if (isAvailable) score += 25;

      let reason = '';
      if (hasSkill && isAvailable) {
        reason = `Expert in ${query} and currently Available.`;
      } else if (hasSkill && !isAvailable) {
        reason = `Strongest match for ${query}, but currently in ${ctx?.status} mode until ${ctx?.expires_at || 'later'}.`;
      } else if (isAvailable) {
        reason = `Currently available, but general or different specialty.`;
      } else {
        reason = `In ${ctx?.status} mode.`;
      }

      return {
        user: u,
        status: ctx?.status || 'Available',
        expires_at: ctx?.expires_at,
        matchScore: score,
        reason,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  res.json({ matches });
});

// 7. Team Summary
router.get('/team-summary', async (req, res) => {
  const users = db.getUsers();
  const contexts = db.getAllWorkContexts();
  const teamData = users.map(u => {
    const ctx = contexts[u.id];
    return {
      name: u.name,
      status: ctx?.status || 'Available',
      task: ctx?.task || '',
      expires_at: ctx?.expires_at || null,
    };
  });

  const { counts, summary } = await generateTeamPulse(teamData);
  res.json({ counts, summary });
});

// 8. Generate Brief
router.post('/generate-brief', async (req, res) => {
  const events = db.getWorkEvents();
  const brief = await generateCatchUpBrief(events, req.body.project);
  res.json(brief);
});

// 9. Explain Why
router.post('/explain-why', async (req, res) => {
  const { eventTitle } = req.body;
  const events = db.getWorkEvents();
  const explanation = await explainWhy(eventTitle || 'Checkout launch moved to Monday', events);
  res.json(explanation);
});

export default router;
