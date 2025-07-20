'use client';

import { useEffect, useState } from 'react';
import { firebaseService } from '@/lib/firebase-service';

export function useFirebaseInit() {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simply verify Firebase connection
        await firebaseService.getAllCreditos();
        
        setInitialized(true);
      } catch (err) {
        console.error('Failed to initialize Firebase:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize database');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  return {
    initialized,
    loading,
    error,
  };
}