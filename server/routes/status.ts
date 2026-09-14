import { Router } from 'express';
import { db } from '../db.ts';

const router = Router();

// Get active user's work context
router.get('/me', (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || 'user-me';
  const context = db.getWorkContext(userId);
  if (!context) {
    return res.status(404).json({ error: 'Context not found' });
  }
  res.json({ workContext: context });
});

// Update active user's work context / status
router.post('/update', (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || 'user-me';
  const { status, project, task, message, interrupt_for, expires_at } = req.body;

  if (!status || !['Focus', 'Available', 'Away'].includes(status)) {
    return res.status(400).json({ error: 'Valid status ("Focus", "Available", "Away") is required' });
  }

  const updated = db.updateWorkContext(userId, {
    status,
    project: project !== undefined ? project : '',
    task: task !== undefined ? task : '',
    message: message !== undefined ? message : '',
    interrupt_for: interrupt_for !== undefined ? interrupt_for : '',
    expires_at: expires_at !== undefined ? expires_at : null,
  });

  res.json({
    success: true,
    workContext: updated,
    message: `Status updated to ${status}`,
  });
});

// Return to Available
router.post('/return-available', (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || 'user-me';
  const updated = db.updateWorkContext(userId, {
    status: 'Available',
    message: 'Free for a quick discussion or questions.',
    interrupt_for: 'Any questions or collaboration',
    expires_at: null,
  });

  res.json({
    success: true,
    workContext: updated,
    message: 'Returned to Available status',
  });
});

// Status history
router.get('/history', (req, res) => {
  const userId = req.query.userId as string | undefined;
  const history = db.getStatusHistory(userId);
  res.json({ history });
});

export default router;
