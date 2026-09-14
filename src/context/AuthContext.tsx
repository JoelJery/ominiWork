import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, WorkContext } from '../types/index.ts';
import { api, safeStorage } from '../services/api.ts';

const FALLBACK_DEMO_USER: User = {
  id: 'user-me',
  name: 'You (Joel Jery)',
  email: 'joel.jery@omniwork.internal',
  role: 'Full-Stack Engineer',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'API Design'],
  created_at: new Date().toISOString(),
};

const FALLBACK_DEMO_WORK_CONTEXT: WorkContext = {
  id: 'ctx-user-me',
  user_id: 'user-me',
  status: 'Focus',
  project: 'Checkout 2.0',
  task: 'Finishing idempotency key retry handler and PR review before deploy',
  message: 'In deep focus until 6:00 PM. Working on Checkout 2.0 critical paths.',
  interrupt_for: 'Critical blockers & production outages only',
  expires_at: '6:00 PM',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function withTimeout<T>(promise: Promise<T>, ms = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Network request timed out')), ms)),
  ]);
}

interface AuthContextType {
  user: User | null;
  workContext: WorkContext | null;
  loading: boolean;
  loginDemo: () => Promise<void>;
  login: (email: string) => Promise<void>;
  register: (name: string, email: string, role: string, skills: string[]) => Promise<void>;
  updateProfile: (updates: { name?: string; role?: string; avatar_url?: string; skills?: string[] }) => Promise<void>;
  logout: () => void;
  resetDemo: () => Promise<void>;
  setWorkContext: (ctx: WorkContext) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workContext, setWorkContext] = useState<WorkContext | null>(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    try {
      setLoading(true);
      const data = await withTimeout(api.getMe(), 2500);
      setUser(data.user);
      setWorkContext(data.workContext);
    } catch (e) {
      // If no valid session or server pending, attempt demo login
      try {
        const demoData = await withTimeout(api.loginDemo(), 2500);
        setUser(demoData.user);
        setWorkContext(demoData.workContext);
      } catch (err) {
        console.warn('Backend unavailable or slow, activating immediate demo mode:', err);
        setUser(FALLBACK_DEMO_USER);
        setWorkContext(FALLBACK_DEMO_WORK_CONTEXT);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const loginDemo = async () => {
    setLoading(true);
    try {
      const data = await api.loginDemo();
      setUser(data.user);
      setWorkContext(data.workContext);
    } catch (err) {
      setUser(FALLBACK_DEMO_USER);
      setWorkContext(FALLBACK_DEMO_WORK_CONTEXT);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string) => {
    setLoading(true);
    try {
      const data = await api.login(email);
      setUser(data.user);
      setWorkContext(data.workContext);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, role: string, skills: string[]) => {
    setLoading(true);
    try {
      const data = await api.register(name, email, role, skills);
      setUser(data.user);
      setWorkContext(data.workContext);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: { name?: string; role?: string; avatar_url?: string; skills?: string[] }) => {
    try {
      const data = await api.updateProfile(updates);
      setUser(data.user);
      if (data.workContext) {
        setWorkContext(data.workContext);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      // Fallback local update
      if (user) {
        setUser({ ...user, ...updates });
      }
    }
  };

  const logout = () => {
    safeStorage.removeItem('omniwork_user_id');
    setUser(null);
    setWorkContext(null);
  };

  const resetDemo = async () => {
    setLoading(true);
    try {
      const data = await api.resetDemo();
      setUser(data.user);
      setWorkContext(data.workContext);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workContext,
        loading,
        loginDemo,
        login,
        register,
        updateProfile,
        logout,
        resetDemo,
        setWorkContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
