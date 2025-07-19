'use client';

import { useState, useCallback } from 'react';
import { firebaseService } from '@/lib/firebase-service';
import type { Despesa } from '@/types';

export function useDespesas(creditoId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDespesa = useCallback(async (despesa: Omit<Despesa, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const id = await firebaseService.createDespesa(creditoId, despesa);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [creditoId]);

  const updateDespesa = useCallback(async (despesaId: string, updates: Partial<Despesa>) => {
    try {
      setLoading(true);
      setError(null);
      await firebaseService.updateDespesa(creditoId, despesaId, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [creditoId]);

  const deleteDespesa = useCallback(async (despesaId: string) => {
    try {
      setLoading(true);
      setError(null);
      await firebaseService.deleteDespesa(creditoId, despesaId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [creditoId]);

  return {
    loading,
    error,
    createDespesa,
    updateDespesa,
    deleteDespesa,
  };
}