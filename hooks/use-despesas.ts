'use client';

import { useState, useEffect, useCallback } from 'react';
import { firebaseService } from '@/lib/firebase-service';
import type { Despesa, DespesaWithCreditos } from '@/types';

export function useDespesas() {
  const [despesas, setDespesas] = useState<Record<string, Despesa>>({});
  const [despesasWithCredits, setDespesasWithCredits] = useState<DespesaWithCreditos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDespesas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [despesasData, despesasWithCreditInfo] = await Promise.all([
        firebaseService.getAllDespesas(),
        firebaseService.getDespesasWithCreditInfo()
      ]);
      setDespesas(despesasData);
      setDespesasWithCredits(despesasWithCreditInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, []);

  const createDespesa = useCallback(async (despesa: Omit<Despesa, 'id'>) => {
    try {
      setError(null);
      const id = await firebaseService.createDespesa(despesa);
      await fetchDespesas(); // Refresh data
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense');
      throw err;
    }
  }, [fetchDespesas]);

  const updateDespesa = useCallback(async (despesaId: string, updates: Partial<Despesa>) => {
    try {
      setError(null);
      await firebaseService.updateDespesa(despesaId, updates);
      await fetchDespesas(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
      throw err;
    }
  }, [fetchDespesas]);

  const deleteDespesa = useCallback(async (despesaId: string) => {
    try {
      setError(null);
      await firebaseService.deleteDespesa(despesaId);
      await fetchDespesas(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
      throw err;
    }
  }, [fetchDespesas]);

  // Helper functions for filtering and analyzing expenses
  const getDespesasByCredito = useCallback((creditoId: string) => {
    return despesasWithCredits.filter(despesa => 
      despesa.fontesDeRecurso.some(fonte => fonte.creditoId === creditoId)
    );
  }, [despesasWithCredits]);

  const getDespesasByStatus = useCallback((status: Despesa['status']) => {
    return despesasWithCredits.filter(despesa => despesa.status === status);
  }, [despesasWithCredits]);

  const getTotalValueByCredito = useCallback((creditoId: string) => {
    return despesasWithCredits.reduce((total, despesa) => {
      const fonteCredito = despesa.fontesDeRecurso.find(fonte => fonte.creditoId === creditoId);
      return total + (fonteCredito ? fonteCredito.valorUtilizado : 0);
    }, 0);
  }, [despesasWithCredits]);

  useEffect(() => {
    fetchDespesas();
  }, [fetchDespesas]);

  return {
    despesas,
    despesasWithCredits,
    loading,
    error,
    refetch: fetchDespesas,
    createDespesa,
    updateDespesa,
    deleteDespesa,
    getDespesasByCredito,
    getDespesasByStatus,
    getTotalValueByCredito,
  };
}