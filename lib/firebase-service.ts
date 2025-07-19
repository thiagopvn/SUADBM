'use client';

import { database } from '@/firebase/config';
import { ref, push, set, get, remove, update, child } from 'firebase/database';
import type { Credito, Despesa, MockData } from '@/types';

// Error handling utility
class FirebaseServiceError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'FirebaseServiceError';
  }
}

// Database service class
export class FirebaseService {
  private static instance: FirebaseService;
  
  private constructor() {}
  
  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  // Credits CRUD operations
  async getAllCreditos(): Promise<Record<string, Credito>> {
    try {
      const creditosRef = ref(database, 'creditos');
      const snapshot = await get(creditosRef);
      return snapshot.exists() ? snapshot.val() : {};
    } catch (error) {
      throw new FirebaseServiceError('Failed to fetch credits', error);
    }
  }

  async getCreditoById(id: string): Promise<Credito | null> {
    try {
      const creditoRef = ref(database, `creditos/${id}`);
      const snapshot = await get(creditoRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      throw new FirebaseServiceError(`Failed to fetch credit ${id}`, error);
    }
  }

  async createCredito(credito: Omit<Credito, 'id'>): Promise<string> {
    try {
      const creditosRef = ref(database, 'creditos');
      const newCreditoRef = push(creditosRef);
      const creditoId = newCreditoRef.key!;
      
      const creditoWithId: Credito = {
        ...credito,
        id: creditoId,
        despesas: {}
      };
      
      await set(newCreditoRef, creditoWithId);
      return creditoId;
    } catch (error) {
      throw new FirebaseServiceError('Failed to create credit', error);
    }
  }

  async updateCredito(id: string, updates: Partial<Credito>): Promise<void> {
    try {
      const creditoRef = ref(database, `creditos/${id}`);
      await update(creditoRef, updates);
    } catch (error) {
      throw new FirebaseServiceError(`Failed to update credit ${id}`, error);
    }
  }

  async deleteCredito(id: string): Promise<void> {
    try {
      const creditoRef = ref(database, `creditos/${id}`);
      await remove(creditoRef);
    } catch (error) {
      throw new FirebaseServiceError(`Failed to delete credit ${id}`, error);
    }
  }

  // Expenses CRUD operations
  async createDespesa(creditoId: string, despesa: Omit<Despesa, 'id'>): Promise<string> {
    try {
      const despesasRef = ref(database, `creditos/${creditoId}/despesas`);
      const newDespesaRef = push(despesasRef);
      const despesaId = newDespesaRef.key!;
      
      const despesaWithId: Despesa = {
        ...despesa,
        id: despesaId
      };
      
      await set(newDespesaRef, despesaWithId);
      
      // Update credit balance
      await this.updateCreditoSaldo(creditoId);
      
      return despesaId;
    } catch (error) {
      throw new FirebaseServiceError(`Failed to create expense for credit ${creditoId}`, error);
    }
  }

  async updateDespesa(creditoId: string, despesaId: string, updates: Partial<Despesa>): Promise<void> {
    try {
      const despesaRef = ref(database, `creditos/${creditoId}/despesas/${despesaId}`);
      await update(despesaRef, updates);
      
      // Update credit balance
      await this.updateCreditoSaldo(creditoId);
    } catch (error) {
      throw new FirebaseServiceError(`Failed to update expense ${despesaId}`, error);
    }
  }

  async deleteDespesa(creditoId: string, despesaId: string): Promise<void> {
    try {
      const despesaRef = ref(database, `creditos/${creditoId}/despesas/${despesaId}`);
      await remove(despesaRef);
      
      // Update credit balance
      await this.updateCreditoSaldo(creditoId);
    } catch (error) {
      throw new FirebaseServiceError(`Failed to delete expense ${despesaId}`, error);
    }
  }

  // Calculate and update credit balance
  private async updateCreditoSaldo(creditoId: string): Promise<void> {
    try {
      const credito = await this.getCreditoById(creditoId);
      if (!credito) return;

      const totalGasto = Object.values(credito.despesas || {})
        .filter(despesa => despesa.status === 'Pago')
        .reduce((total, despesa) => total + despesa.valorTotal, 0);

      const saldoAtual = credito.valorGlobal - totalGasto;
      
      await this.updateCredito(creditoId, { saldoAtual });
    } catch (error) {
      throw new FirebaseServiceError(`Failed to update credit balance for ${creditoId}`, error);
    }
  }

  // Metas and Actions
  async getMetasAcoes(): Promise<Record<string, { descricao: string }>> {
    try {
      const metasRef = ref(database, 'metasAcoes');
      const snapshot = await get(metasRef);
      return snapshot.exists() ? snapshot.val() : {};
    } catch (error) {
      throw new FirebaseServiceError('Failed to fetch metas and actions', error);
    }
  }

  async createMetaAcao(id: string, descricao: string): Promise<void> {
    try {
      const metaRef = ref(database, `metasAcoes/${id}`);
      await set(metaRef, { descricao });
    } catch (error) {
      throw new FirebaseServiceError(`Failed to create meta/action ${id}`, error);
    }
  }

  // Utility methods
  async initializeWithMockData(mockData: MockData): Promise<void> {
    try {
      const dbRef = ref(database);
      await set(dbRef, mockData);
    } catch (error) {
      throw new FirebaseServiceError('Failed to initialize with mock data', error);
    }
  }

  async exportData(): Promise<MockData> {
    try {
      const dbRef = ref(database);
      const snapshot = await get(dbRef);
      return snapshot.exists() ? snapshot.val() : { creditos: {}, metasAcoes: {}, fechamentosAnuais: {} };
    } catch (error) {
      throw new FirebaseServiceError('Failed to export data', error);
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      const testRef = ref(database, '.info/connected');
      const snapshot = await get(testRef);
      return snapshot.exists() && snapshot.val() === true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const firebaseService = FirebaseService.getInstance();