"use client";

import { useEffect, useState } from 'react';
import { database } from '@/firebase/config';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import { firebaseService } from '@/lib/firebase-service';
import type { Credito, Despesa } from '@/types';

export function useCreditos() {
  const [creditos, setCreditos] = useState<Credito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const creditosRef = ref(database, 'creditos');
    
    const unsubscribe = onValue(creditosRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const creditosArray = Object.keys(data).map(key => ({
            ...data[key],
            id: key
          }));
          setCreditos(creditosArray);
        } else {
          setCreditos([]);
        }
        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar créditos');
        setLoading(false);
      }
    }, (err) => {
      setError('Erro de conexão com Firebase');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const adicionarCredito = async (credito: Omit<Credito, 'id'>) => {
    try {
      const creditosRef = ref(database, 'creditos');
      const novoCreditoRef = push(creditosRef);
      const creditoId = novoCreditoRef.key!;
      
      await set(novoCreditoRef, {
        ...credito,
        id: creditoId,
        despesas: {}
      });
      
      // Gerar primeira obrigação de prestação de contas
      if (credito.dataLancamento) {
        await firebaseService.gerarPrimeiraObrigacao(creditoId, credito.dataLancamento);
      }
      
      return creditoId;
    } catch (err) {
      throw new Error('Erro ao adicionar crédito');
    }
  };

  const atualizarCredito = async (id: string, credito: Partial<Credito>) => {
    try {
      const creditoRef = ref(database, `creditos/${id}`);
      await update(creditoRef, credito);
    } catch (err) {
      throw new Error('Erro ao atualizar crédito');
    }
  };

  const removerCredito = async (id: string) => {
    try {
      const creditoRef = ref(database, `creditos/${id}`);
      await remove(creditoRef);
    } catch (err) {
      throw new Error('Erro ao remover crédito');
    }
  };

  return {
    creditos,
    loading,
    error,
    adicionarCredito,
    atualizarCredito,
    removerCredito
  };
}

export function useCredito(id: string | null) {
  const [credito, setCredito] = useState<Credito | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setCredito(null);
      setLoading(false);
      return;
    }

    const creditoRef = ref(database, `creditos/${id}`);
    
    const unsubscribe = onValue(creditoRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          setCredito({ ...data, id });
        } else {
          setCredito(null);
        }
        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar crédito');
        setLoading(false);
      }
    }, (err) => {
      setError('Erro de conexão com Firebase');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const adicionarDespesa = async (despesa: Omit<Despesa, 'id'>) => {
    if (!id) throw new Error('ID do crédito não fornecido');
    
    try {
      const despesasRef = ref(database, `creditos/${id}/despesas`);
      const novaDespesaRef = push(despesasRef);
      await set(novaDespesaRef, {
        ...despesa,
        id: novaDespesaRef.key
      });
      return novaDespesaRef.key;
    } catch (err) {
      throw new Error('Erro ao adicionar despesa');
    }
  };

  const atualizarDespesa = async (despesaId: string, despesa: Partial<Despesa>) => {
    if (!id) throw new Error('ID do crédito não fornecido');
    
    try {
      const despesaRef = ref(database, `creditos/${id}/despesas/${despesaId}`);
      await update(despesaRef, despesa);
    } catch (err) {
      throw new Error('Erro ao atualizar despesa');
    }
  };

  const removerDespesa = async (despesaId: string) => {
    if (!id) throw new Error('ID do crédito não fornecido');
    
    try {
      const despesaRef = ref(database, `creditos/${id}/despesas/${despesaId}`);
      await remove(despesaRef);
    } catch (err) {
      throw new Error('Erro ao remover despesa');
    }
  };

  return {
    credito,
    loading,
    error,
    adicionarDespesa,
    atualizarDespesa,
    removerDespesa
  };
}