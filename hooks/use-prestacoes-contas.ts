'use client';

import { useState, useEffect } from 'react';
import { database } from '@/firebase/config';
import { ref, onValue, off } from 'firebase/database';
import { firebaseService } from '@/lib/firebase-service';
import type { PrestacaoContas } from '@/types';

export function usePrestacaoContas(creditoId: string) {
  const [prestacoes, setPrestacoes] = useState<PrestacaoContas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!creditoId) {
      setPrestacoes([]);
      setLoading(false);
      return;
    }

    const prestacoesRef = ref(database, 'prestacoesContas');
    
    const unsubscribe = onValue(
      prestacoesRef,
      (snapshot) => {
        try {
          if (!snapshot.exists()) {
            setPrestacoes([]);
            setLoading(false);
            return;
          }

          const allPrestacoes = snapshot.val();
          const creditoPrestacoes: PrestacaoContas[] = [];
          
          Object.entries(allPrestacoes).forEach(([id, prestacao]) => {
            const pc = prestacao as PrestacaoContas;
            if (pc.creditoId === creditoId) {
              // Atualizar status baseado na data atual
              const hoje = new Date().toISOString().split('T')[0];
              let status = pc.status;
              
              if (pc.status !== 'Entregue' && hoje > pc.prazoFinal) {
                status = 'Em Atraso';
              }
              
              creditoPrestacoes.push({ ...pc, id, status });
            }
          });
          
          setPrestacoes(creditoPrestacoes.sort((a, b) => a.prazoFinal.localeCompare(b.prazoFinal)));
          setError(null);
        } catch (err) {
          console.error('Error processing prestações:', err);
          setError('Erro ao processar prestações de contas');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Firebase error:', error);
        setError('Erro ao carregar prestações de contas');
        setLoading(false);
      }
    );

    return () => {
      off(prestacoesRef);
    };
  }, [creditoId]);

  // Métodos para manipular prestações
  const createPrestacao = async (prestacao: Omit<PrestacaoContas, 'id'>) => {
    try {
      setError(null);
      return await firebaseService.createPrestacaoContas(prestacao);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar prestação';
      setError(message);
      throw err;
    }
  };

  const updatePrestacao = async (id: string, updates: Partial<PrestacaoContas>) => {
    try {
      setError(null);
      await firebaseService.updatePrestacaoContas(id, updates);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar prestação';
      setError(message);
      throw err;
    }
  };

  const deletePrestacao = async (id: string) => {
    try {
      setError(null);
      await firebaseService.deletePrestacaoContas(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar prestação';
      setError(message);
      throw err;
    }
  };

  const marcarComoEntregue = async (id: string, processoSEI: string, observacoes?: string) => {
    try {
      setError(null);
      await firebaseService.updatePrestacaoContas(id, {
        status: 'Entregue',
        processoSEI,
        observacoes,
        dataEntrega: new Date().toISOString()
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao marcar como entregue';
      setError(message);
      throw err;
    }
  };

  const vincularDespesas = async (prestacaoId: string, despesaIds: string[]) => {
    try {
      setError(null);
      await firebaseService.updatePrestacaoContas(prestacaoId, {
        despesasVinculadas: despesaIds
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao vincular despesas';
      setError(message);
      throw err;
    }
  };

  return {
    prestacoes,
    loading,
    error,
    createPrestacao,
    updatePrestacao,
    deletePrestacao,
    marcarComoEntregue,
    vincularDespesas
  };
}