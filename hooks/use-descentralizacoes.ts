'use client';

import { useState, useEffect, useCallback } from 'react';
import { firebaseService } from '@/lib/firebase-service';
import type { Credito, CreditoWithCalculations } from '@/types';

export function useDescentralizacoes() {
  const [descentralizacoes, setDescentralizacoes] = useState<Record<string, Credito>>({});
  const [descentralizacoesWithCalculations, setDescentralizacoesWithCalculations] = useState<CreditoWithCalculations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDescentralizacoes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [descentralizacoesData, descentralizacoesCalculations] = await Promise.all([
        firebaseService.getAllCreditos(),
        firebaseService.getCreditosWithCalculations()
      ]);
      
      setDescentralizacoes(descentralizacoesData);
      setDescentralizacoesWithCalculations(descentralizacoesCalculations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch descentralizacoes');
      console.error('Erro ao buscar descentralizações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDescentralizacao = useCallback(async (descentralizacao: Omit<Credito, 'id'>) => {
    try {
      setError(null);
      const id = await firebaseService.createCredito(descentralizacao);
      await fetchDescentralizacoes(); // Refresh data
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create descentralizacao');
      throw err;
    }
  }, [fetchDescentralizacoes]);

  const updateDescentralizacao = useCallback(async (id: string, updates: Partial<Credito>) => {
    try {
      setError(null);
      await firebaseService.updateCredito(id, updates);
      await fetchDescentralizacoes(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update descentralizacao');
      throw err;
    }
  }, [fetchDescentralizacoes]);

  const deleteDescentralizacao = useCallback(async (id: string) => {
    try {
      setError(null);
      await firebaseService.deleteCredito(id);
      await fetchDescentralizacoes(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete descentralizacao');
      throw err;
    }
  }, [fetchDescentralizacoes]);

  // Helper function to get descentralizacoes available for use (with positive balance)
  const getDescentralizacoesDisponiveis = useCallback(() => {
    return descentralizacoesWithCalculations.filter(descentralizacao => descentralizacao.saldoDisponivel > 0);
  }, [descentralizacoesWithCalculations]);

  useEffect(() => {
    fetchDescentralizacoes();
  }, [fetchDescentralizacoes]);

  return {
    descentralizacoes,
    descentralizacoesWithCalculations,
    descentralizacoesDisponiveis: getDescentralizacoesDisponiveis(),
    loading,
    error,
    refetch: fetchDescentralizacoes,
    createDescentralizacao,
    updateDescentralizacao,
    deleteDescentralizacao,
  };
}