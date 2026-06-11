import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { getStoredUser, setStoredUser, removeStoredUser } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const login = useCallback((userData: User) => {
    setStoredUser(userData);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    removeStoredUser();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      setStoredUser(updated);
      return updated;
    });
  }, []);

  return { user, loading, login, logout, updateUser, isAuthenticated: !!user };
}
