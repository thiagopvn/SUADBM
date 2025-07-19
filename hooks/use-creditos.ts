'use client';

import { useState, useEffect, useCallback } from 'react';
import { firebaseService } from '@/lib/firebase-service';
import type { Credito } from '@/types';

export function useCreditos() {
  const [creditos, setCreditos] = useState<Record<string, Credito>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await firebaseService.getAllCreditos();
      setCreditos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch credits');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCredito = useCallback(async (credito: Omit<Credito, 'id'>) => {
    try {
      setError(null);
      const id = await firebaseService.createCredito(credito);
      await fetchCreditos(); // Refresh data
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create credit');
      throw err;
    }
  }, [fetchCreditos]);

  const updateCredito = useCallback(async (id: string, updates: Partial<Credito>) => {
    try {
      setError(null);
      await firebaseService.updateCredito(id, updates);
      await fetchCreditos(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update credit');
      throw err;
    }
  }, [fetchCreditos]);

  const deleteCredito = useCallback(async (id: string) => {
    try {
      setError(null);
      await firebaseService.deleteCredito(id);
      await fetchCreditos(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete credit');
      throw err;
    }
  }, [fetchCreditos]);

  useEffect(() => {
    fetchCreditos();
  }, [fetchCreditos]);

  return {
    creditos,
    loading,
    error,
    refetch: fetchCreditos,
    createCredito,
    updateCredito,
    deleteCredito,
  };
}