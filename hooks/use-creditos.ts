'use client';

import { useState, useEffect, useCallback } from 'react';
import { firebaseService } from '@/lib/firebase-service';
import type { Credito, CreditoWithCalculations } from '@/types';

export function useCreditos() {
  const [creditos, setCreditos] = useState<Record<string, Credito>>({});
  const [creditosWithCalculations, setCreditosWithCalculations] = useState<CreditoWithCalculations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [creditosData, creditosCalculations] = await Promise.all([
        firebaseService.getAllCreditos(),
        firebaseService.getCreditosWithCalculations()
      ]);
      setCreditos(creditosData);
      setCreditosWithCalculations(creditosCalculations);
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

  // Helper function to get credits available for use (with positive balance)
  const getCreditosDisponiveis = useCallback(() => {
    return creditosWithCalculations.filter(credito => credito.saldoDisponivel > 0);
  }, [creditosWithCalculations]);

  useEffect(() => {
    fetchCreditos();
  }, [fetchCreditos]);

  return {
    creditos,
    creditosWithCalculations,
    creditosDisponiveis: getCreditosDisponiveis(),
    loading,
    error,
    refetch: fetchCreditos,
    createCredito,
    updateCredito,
    deleteCredito,
  };
}