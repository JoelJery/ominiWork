import { Router } from 'express';
import { db } from '../db.ts';

const router = Router();

// Demo login
router.post('/demo', (req, res) => {
  const user = db.getUser('user-me') || db.getUsers()[0];
  const context = db.getWorkContext(user.id);
  res.json({
    success: true,
    user,
    workContext: context,
    token: 'demo-session-token',
  });
});

// Reset demo state
router.post('/reset-demo', (req, res) => {
  db.resetDemoData();
  const user = db.getUser('user-me');
  const context = db.getWorkContext(user?.id || 'user-me');
  res.json({
    success: true,
    message: 'Demo state reset successfully',
    user,
    workContext: context,
  });
});

// Login
router.post('/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    // If not found, create or return demo
    return res.status(404).json({ error: 'User not found. Use "Try Demo" or register an account.' });
  }

  const context = db.getWorkContext(user.id);
  res.json({
    success: true,
    user,
    workContext: context,
    token: `token-${user.id}`,
  });
});

// Register
router.post('/register', (req, res) => {
  const { name, email, role, skills } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const newUser = db.createUser({
    id: `user-${Date.now()}`,
    name,
    email,
    role: role || 'Team Member',
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    skills: Array.isArray(skills) ? skills : ['Collaboration'],
    created_at: new Date().toISOString(),
  });

  const context = db.getWorkContext(newUser.id);
  res.json({
    success: true,
    user: newUser,
    workContext: context,
    token: `token-${newUser.id}`,
  });
});

// Current user
router.get('/me', (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || 'user-me';
  const user = db.getUser(userId) || db.getUser('user-me');
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const context = db.getWorkContext(user.id);
  res.json({ user, workContext: context });
});

// Update current user profile (name, role, skills, avatar)
router.put('/profile', (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || 'user-me';
  const user = db.getUser(userId) || db.getUser('user-me');
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { name, role, avatar_url, skills } = req.body;
  const updates: Partial<typeof user> = {};

  if (typeof name === 'string' && name.trim().length > 0) {
    updates.name = name.trim();
  }
  if (typeof role === 'string' && role.trim().length > 0) {
    updates.role = role.trim();
  }
  if (typeof avatar_url === 'string' && avatar_url.trim().length > 0) {
    updates.avatar_url = avatar_url.trim();
  }
  if (Array.isArray(skills)) {
    updates.skills = skills;
  }

  const updatedUser = db.updateUser(user.id, updates);
  const context = db.getWorkContext(user.id);

  res.json({
    success: true,
    user: updatedUser,
    workContext: context,
    message: 'Profile updated successfully',
  });
});

export default router;
