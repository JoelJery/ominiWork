import { Router } from 'express';
import { db } from '../db.ts';
import { generateCatchUpBrief, explainWhy } from '../ai/gemini.ts';

const router = Router();

// Get work events
router.get('/', (req, res) => {
  const events = db.getWorkEvents();
  res.json({ events });
});

// Add work event
router.post('/', (req, res) => {
  const { team_id, source, category, title, detail, project, target_user, action_required, time_display } = req.body;
  if (!source || !category || !title) {
    return res.status(400).json({ error: 'Source, category, and title are required' });
  }

  const newEvent = db.addWorkEvent({
    team_id: team_id || 'team-omni',
    source,
    category,
    title,
    detail: detail || '',
    project: project || 'General',
    target_user,
    action_required: Boolean(action_required),
    time_display: time_display || 'Just now',
  });

  res.json({ success: true, event: newEvent });
});

// Generate AI Catch-Up Brief
router.get('/brief', async (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || 'user-me';
  const context = db.getWorkContext(userId);
  const events = db.getWorkEvents();

  const brief = await generateCatchUpBrief(events, context?.project);
  res.json(brief);
});

// Explain Why
router.post('/explain-why', async (req, res) => {
  const { eventTitle, eventDetail } = req.body;
  if (!eventTitle) {
    return res.status(400).json({ error: 'eventTitle is required' });
  }

  const allEvents = db.getWorkEvents();
  const explanation = await explainWhy(eventTitle, allEvents);
  res.json(explanation);
});

export default router;
