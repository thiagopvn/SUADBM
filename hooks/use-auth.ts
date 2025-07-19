'use client';

import { useState, useEffect, useCallback } from 'react';
import { auth } from '@/firebase/config';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    }, (error) => {
      setError(error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    try {
      setError(null);
      await signOut(auth);
      // Optionally redirect to login page
      window.location.href = '/login';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    logout,
    clearError,
    isAuthenticated: !!user,
  };
}