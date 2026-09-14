import { Router } from 'express';
import { db } from '../db.ts';
import { generateTeamPulse } from '../ai/gemini.ts';

const router = Router();

// Get team members with their current live status
router.get('/', (req, res) => {
  const users = db.getUsers();
  const contexts = db.getAllWorkContexts();

  const team = users.map(user => {
    const ctx = contexts[user.id] || {
      id: `ctx-${user.id}`,
      user_id: user.id,
      status: 'Available',
      project: '',
      task: '',
      message: 'Available',
      interrupt_for: 'Open for questions',
      expires_at: null,
      created_at: '',
      updated_at: '',
    };

    return {
      ...user,
      workContext: ctx,
    };
  });

  res.json({ team });
});

// Team Pulse summary
router.get('/pulse', async (req, res) => {
  const users = db.getUsers();
  const contexts = db.getAllWorkContexts();

  const teamData = users.map(u => {
    const ctx = contexts[u.id];
    return {
      name: u.name,
      status: ctx?.status || 'Available',
      task: ctx?.task || ctx?.project || '',
      expires_at: ctx?.expires_at || null,
    };
  });

  const pulse = await generateTeamPulse(teamData);
  res.json(pulse);
});

// Get individual teammate details
router.get('/:id', (req, res) => {
  const user = db.getUser(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'Teammate not found' });
  }
  const context = db.getWorkContext(user.id);
  res.json({ user, workContext: context });
});

export default router;
