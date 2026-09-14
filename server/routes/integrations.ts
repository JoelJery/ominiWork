import { Router } from 'express';
import { db } from '../db.ts';

const router = Router();

router.get('/', (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || 'user-me';
  const integrations = db.getIntegrations(userId);
  res.json({ integrations });
});

router.post('/:id/toggle', (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || 'user-me';
  const integrations = db.toggleIntegration(userId, req.params.id);
  res.json({ success: true, integrations });
});

export default router;
