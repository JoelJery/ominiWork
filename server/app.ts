import express, { Express } from 'express';
import { db } from './db.ts';
import authRoutes from './routes/auth.ts';
import statusRoutes from './routes/status.ts';
import teamRoutes from './routes/team.ts';
import eventsRoutes from './routes/events.ts';
import integrationsRoutes from './routes/integrations.ts';
import messagesRoutes from './routes/messages.ts';
import aiRoutes from './routes/ai.ts';

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  // Mount API endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/status', statusRoutes);
  app.use('/api/team', teamRoutes);
  app.use('/api/events', eventsRoutes);
  app.use('/api/integrations', integrationsRoutes);
  app.use('/api/messages', messagesRoutes);
  app.use('/api', aiRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'OmniWork Interruptibility Layer API',
      timestamp: new Date().toISOString(),
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
      database: db.getStorageInfo(),
    });
  });

  return app;
}

export const app = createApp();
