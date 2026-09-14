import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from './server/app.ts';

const PORT = process.env.PORT || 3000;
const distPath = path.join(process.cwd(), 'dist');

// Serve static assets from Vite build in production
app.use(express.static(distPath));

// Fallback to index.html for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`OmniWork production server running on http://0.0.0.0:${PORT}`);
});
