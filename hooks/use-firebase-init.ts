'use client';

import { useEffect, useState } from 'react';
import { firebaseService } from '@/lib/firebase-service';
import { mockData } from '@/firebase/mockData';

export function useFirebaseInit() {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if data already exists
        const existingCreditos = await firebaseService.getAllCreditos();
        
        // If no data exists, initialize with mock data
        if (Object.keys(existingCreditos).length === 0) {
          console.log('No data found. Initializing with mock data...');
          await firebaseService.initializeWithMockData(mockData);
          console.log('Firebase initialized with mock data');
        }
        
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