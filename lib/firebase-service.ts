'use client';

import { database } from '@/firebase/config';
import { ref, push, set, get, remove, update, child } from 'firebase/database';
import type { Credito, Despesa, MockData, PrestacaoContas, CreditoWithCalculations, FonteDeRecurso } from '@/types';

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
      const creditos = snapshot.exists() ? snapshot.val() : {};
      
      // Ensure all creditos have required properties
      Object.values(creditos).forEach((credito: any) => {
        if (credito && !credito.eixos) {
          credito.eixos = [];
        }
      });
      
      return creditos;
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

  async getCreditosWithCalculations(): Promise<CreditoWithCalculations[]> {
    try {
      const creditos = await this.getAllCreditos();
      const despesas = await this.getAllDespesas();
      
      const creditosArray: CreditoWithCalculations[] = [];
      
      Object.entries(creditos).forEach(([id, credito]) => {
        const creditoId = credito.id;
        
        // Calcular valores utilizados nas despesas para este crédito
        let valorEmpenhado = 0;
        let valorPago = 0;
        
        Object.values(despesas).forEach(despesa => {
          (despesa.fontesDeRecurso || []).forEach(fonte => {
            if (fonte.creditoId === creditoId) {
              // Considerar empenho se a fonte tem nota de empenho
              if (fonte.notaEmpenho && fonte.dataEmpenho) {
                valorEmpenhado += fonte.valorUtilizado;
              }
              // Considerar pago se a fonte tem ordem bancária
              if (fonte.ordemBancaria && fonte.dataPagamento) {
                valorPago += fonte.valorUtilizado;
              }
            }
          });
        });
        
        const saldoDisponivel = credito.valorGlobal - (valorPago + valorEmpenhado);
        
        creditosArray.push({
          ...credito,
          eixos: credito.eixos || [],
          valorEmpenhado,
          valorPago,
          saldoDisponivel
        });
      });
      
      return creditosArray;
    } catch (error) {
      throw new FirebaseServiceError('Failed to fetch credits with calculations', error);
    }
  }

  async createCredito(credito: Omit<Credito, 'id'>): Promise<string> {
    try {
      const creditosRef = ref(database, 'creditos');
      const newCreditoRef = push(creditosRef);
      const creditoId = newCreditoRef.key!;
      
      const creditoWithId: Credito = {
        ...credito,
        id: creditoId
      };
      
      await set(newCreditoRef, creditoWithId);
      
      // Gerar primeira obrigação de prestação de contas
      await this.gerarPrimeiraObrigacao(creditoId, credito.dataLancamento);
      
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
      // Verificar se existem despesas usando este crédito
      const despesas = await this.getAllDespesas();
      const despesasComCredito = Object.values(despesas).filter(despesa => 
        despesa.fontesDeRecurso.some(fonte => fonte.creditoId === id)
      );
      
      if (despesasComCredito.length > 0) {
        throw new FirebaseServiceError('Cannot delete credit: expenses are using this credit');
      }
      
      const creditoRef = ref(database, `creditos/${id}`);
      await remove(creditoRef);
      
      // Remover prestações de contas associadas
      const prestacoes = await this.getAllPrestacoesByCredito(id);
      for (const prestacao of prestacoes) {
        await this.deletePrestacaoContas(prestacao.id);
      }
    } catch (error) {
      throw new FirebaseServiceError(`Failed to delete credit ${id}`, error);
    }
  }

  // Expenses CRUD operations (now independent)
  async getAllDespesas(): Promise<Record<string, Despesa>> {
    try {
      const despesasRef = ref(database, 'despesas');
      const snapshot = await get(despesasRef);
      const despesas = snapshot.exists() ? snapshot.val() : {};
      
      // Ensure all despesas have required properties
      Object.values(despesas).forEach((despesa: any) => {
        if (despesa && !despesa.fontesDeRecurso) {
          despesa.fontesDeRecurso = [];
        }
      });
      
      return despesas;
    } catch (error) {
      throw new FirebaseServiceError('Failed to fetch expenses', error);
    }
  }

  async getDespesaById(id: string): Promise<Despesa | null> {
    try {
      const despesaRef = ref(database, `despesas/${id}`);
      const snapshot = await get(despesaRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      throw new FirebaseServiceError(`Failed to fetch expense ${id}`, error);
    }
  }

  async createDespesa(despesa: Omit<Despesa, 'id'>): Promise<string> {
    try {
      // Validar se há saldo suficiente nos créditos
      await this.validarSaldoCreditos(despesa.fontesDeRecurso);
      
      const despesasRef = ref(database, 'despesas');
      const newDespesaRef = push(despesasRef);
      const despesaId = newDespesaRef.key!;
      
      // Gerar IDs únicos para cada fonte de recurso
      const fontesComIds = despesa.fontesDeRecurso.map(fonte => ({
        ...fonte,
        id: fonte.id || push(ref(database)).key!
      }));
      
      const despesaWithId: Despesa = {
        ...despesa,
        id: despesaId,
        fontesDeRecurso: fontesComIds
      };
      
      await set(newDespesaRef, despesaWithId);
      
      return despesaId;
    } catch (error) {
      throw new FirebaseServiceError('Failed to create expense', error);
    }
  }

  async updateDespesa(despesaId: string, updates: Partial<Despesa>): Promise<void> {
    try {
      // Se as fontes de recurso foram alteradas, validar saldos e gerar IDs
      if (updates.fontesDeRecurso) {
        await this.validarSaldoCreditos(updates.fontesDeRecurso, despesaId);
        
        // Garantir que todas as fontes tenham IDs únicos
        updates.fontesDeRecurso = updates.fontesDeRecurso.map(fonte => ({
          ...fonte,
          id: fonte.id || push(ref(database)).key!
        }));
      }
      
      const despesaRef = ref(database, `despesas/${despesaId}`);
      await update(despesaRef, updates);
    } catch (error) {
      throw new FirebaseServiceError(`Failed to update expense ${despesaId}`, error);
    }
  }

  async deleteDespesa(despesaId: string): Promise<void> {
    try {
      const despesaRef = ref(database, `despesas/${despesaId}`);
      await remove(despesaRef);
    } catch (error) {
      throw new FirebaseServiceError(`Failed to delete expense ${despesaId}`, error);
    }
  }

  // Validation methods for the new architecture
  private async validarSaldoCreditos(fontesDeRecurso: FonteDeRecurso[], despesaIdExcluir?: string): Promise<void> {
    const creditosComCalculos = await this.getCreditosWithCalculations();
    const despesas = await this.getAllDespesas();
    
    for (const fonte of fontesDeRecurso) {
      const credito = creditosComCalculos.find(c => c.id === fonte.creditoId);
      if (!credito) {
        throw new FirebaseServiceError(`Credit ${fonte.creditoId} not found`);
      }
      
      // Calcular saldo considerando a despesa atual (se estiver editando)
      let saldoDisponivel = credito.saldoDisponivel;
      
      if (despesaIdExcluir) {
        const despesaAnterior = despesas[despesaIdExcluir];
        if (despesaAnterior) {
          const fonteAnterior = despesaAnterior.fontesDeRecurso.find(f => f.creditoId === fonte.creditoId);
          if (fonteAnterior) {
            saldoDisponivel += fonteAnterior.valorUtilizado;
          }
        }
      }
      
      if (fonte.valorUtilizado > saldoDisponivel) {
        throw new FirebaseServiceError(
          `Insufficient balance in credit ${credito.creditoCodigo}. Available: ${saldoDisponivel}, Required: ${fonte.valorUtilizado}`
        );
      }
    }
  }

  // Dashboard calculations with new architecture
  async getDashboardData(anoFiltro?: number): Promise<{
    valorGlobalConsolidado: number;
    valorEmpenhado: number;
    valorLiquidadoPago: number;
    saldoDisponivel: number;
    totalCreditos: number;
  }> {
    try {
      const creditos = await this.getAllCreditos();
      const despesas = await this.getAllDespesas();
      
      let valorGlobalConsolidado = 0;
      let valorEmpenhado = 0;
      let valorLiquidadoPago = 0;
      let totalCreditos = 0;
      
      // Filtrar créditos por ano se especificado
      const creditosFiltrados = Object.values(creditos).filter(credito => 
        !anoFiltro || credito.anoExercicio === anoFiltro
      );
      
      totalCreditos = creditosFiltrados.length;
      valorGlobalConsolidado = creditosFiltrados.reduce((total, credito) => total + credito.valorGlobal, 0);
      
      // Calcular valores das despesas baseado nas transações individuais
      Object.values(despesas).forEach(despesa => {
        despesa.fontesDeRecurso.forEach(fonte => {
          const credito = creditosFiltrados.find(c => c.id === fonte.creditoId);
          if (credito) {
            // Considerar empenhado se a fonte tem nota de empenho
            if (fonte.notaEmpenho && fonte.dataEmpenho) {
              valorEmpenhado += fonte.valorUtilizado;
            }
            // Considerar pago se a fonte tem ordem bancária
            if (fonte.ordemBancaria && fonte.dataPagamento) {
              valorLiquidadoPago += fonte.valorUtilizado;
            }
          }
        });
      });
      
      const saldoDisponivel = valorGlobalConsolidado - (valorLiquidadoPago + valorEmpenhado);
      
      return {
        valorGlobalConsolidado,
        valorEmpenhado,
        valorLiquidadoPago,
        saldoDisponivel,
        totalCreditos
      };
    } catch (error) {
      throw new FirebaseServiceError('Failed to calculate dashboard data', error);
    }
  }

  // Helper methods for expenses with credit information
  async getDespesasWithCreditInfo(): Promise<Array<Despesa & { creditosAssociados: Array<{ creditoId: string; creditoCodigo: string; valorUtilizado: number }> }>> {
    try {
      const despesas = await this.getAllDespesas();
      const creditos = await this.getAllCreditos();
      
      return Object.values(despesas).map(despesa => ({
        ...despesa,
        creditosAssociados: despesa.fontesDeRecurso.map(fonte => ({
          creditoId: fonte.creditoId,
          creditoCodigo: creditos[fonte.creditoId]?.creditoCodigo || 'N/A',
          valorUtilizado: fonte.valorUtilizado
        }))
      }));
    } catch (error) {
      throw new FirebaseServiceError('Failed to fetch expenses with credit info', error);
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
      return snapshot.exists() ? snapshot.val() : { 
        creditos: {}, 
        despesas: {}, 
        metasAcoes: {}, 
        fechamentosAnuais: {} 
      };
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

  // Prestação de Contas operations
  async getAllPrestacoesByCredito(creditoId: string): Promise<PrestacaoContas[]> {
    try {
      const prestacoesRef = ref(database, 'prestacoesContas');
      const snapshot = await get(prestacoesRef);
      
      if (!snapshot.exists()) return [];
      
      const allPrestacoes = snapshot.val();
      const creditoPrestacoes: PrestacaoContas[] = [];
      
      Object.entries(allPrestacoes).forEach(([id, prestacao]) => {
        const pc = prestacao as PrestacaoContas;
        if (pc.creditoId === creditoId) {
          // Ensure despesasVinculadas is always an array
          creditoPrestacoes.push({ 
            ...pc, 
            id,
            despesasVinculadas: pc.despesasVinculadas || []
          });
        }
      });
      
      return creditoPrestacoes.sort((a, b) => a.prazoFinal.localeCompare(b.prazoFinal));
    } catch (error) {
      throw new FirebaseServiceError(`Failed to fetch prestações for credit ${creditoId}`, error);
    }
  }

  async createPrestacaoContas(prestacao: Omit<PrestacaoContas, 'id'>): Promise<string> {
    try {
      const prestacoesRef = ref(database, 'prestacoesContas');
      const newPrestacaoRef = push(prestacoesRef);
      const prestacaoId = newPrestacaoRef.key!;
      
      const prestacaoWithId: PrestacaoContas = {
        ...prestacao,
        id: prestacaoId
      };
      
      await set(newPrestacaoRef, prestacaoWithId);
      return prestacaoId;
    } catch (error) {
      throw new FirebaseServiceError('Failed to create prestação de contas', error);
    }
  }

  async updatePrestacaoContas(id: string, updates: Partial<PrestacaoContas>): Promise<void> {
    try {
      const prestacaoRef = ref(database, `prestacoesContas/${id}`);
      await update(prestacaoRef, updates);
      
      // Se marcada como entregue, gerar próxima obrigação
      if (updates.status === 'Entregue') {
        const prestacaoSnapshot = await get(prestacaoRef);
        if (prestacaoSnapshot.exists()) {
          const prestacao = { ...prestacaoSnapshot.val(), id } as PrestacaoContas;
          await this.gerarProximaObrigacao(prestacao);
        }
      }
    } catch (error) {
      throw new FirebaseServiceError(`Failed to update prestação ${id}`, error);
    }
  }

  async deletePrestacaoContas(id: string): Promise<void> {
    try {
      const prestacaoRef = ref(database, `prestacoesContas/${id}`);
      await remove(prestacaoRef);
    } catch (error) {
      throw new FirebaseServiceError(`Failed to delete prestação ${id}`, error);
    }
  }

  // Geração automática de obrigações
  async gerarPrimeiraObrigacao(creditoId: string, dataLancamento: string): Promise<void> {
    try {
      const credito = await this.getCreditoById(creditoId);
      if (!credito) throw new Error('Crédito não encontrado');

      const prazoFinal = this.calcularProximoPrazo(dataLancamento);
      
      await this.createPrestacaoContas({
        creditoId,
        ano: new Date(dataLancamento).getFullYear(),
        periodoLabel: `1ª Prestação (até ${this.formatarData(prazoFinal)})`,
        prazoFinal,
        status: 'Pendente',
        despesasVinculadas: []
      });
    } catch (error) {
      throw new FirebaseServiceError('Failed to generate first obligation', error);
    }
  }

  async gerarProximaObrigacao(prestacaoAnterior: PrestacaoContas): Promise<void> {
    try {
      const credito = await this.getCreditoById(prestacaoAnterior.creditoId);
      if (!credito) return;

      // Determinar número da próxima prestação
      const prestacoes = await this.getAllPrestacoesByCredito(prestacaoAnterior.creditoId);
      const numeroPrestacao = prestacoes.length + 1;

      const prazoFinal = this.calcularProximoPrazo(prestacaoAnterior.prazoFinal);
      
      await this.createPrestacaoContas({
        creditoId: prestacaoAnterior.creditoId,
        ano: new Date(prazoFinal).getFullYear(),
        periodoLabel: `${numeroPrestacao}ª Prestação (até ${this.formatarData(prazoFinal)})`,
        prazoFinal,
        status: 'Pendente',
        despesasVinculadas: []
      });
    } catch (error) {
      throw new FirebaseServiceError('Failed to generate next obligation', error);
    }
  }

  // Utilidades privadas
  private calcularProximoPrazo(dataBase: string): string {
    const data = new Date(dataBase);
    data.setMonth(data.getMonth() + 4);
    return data.toISOString().split('T')[0];
  }

  private formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  // Search methods for tracking
  async searchDespesasByObjeto(searchTerm: string): Promise<Despesa[]> {
    try {
      const despesas = await this.getAllDespesas();
      return Object.values(despesas).filter(despesa => {
        const searchLower = searchTerm.toLowerCase();
        
        // Busca no objeto e processo SEI
        if (despesa.objeto.toLowerCase().includes(searchLower) ||
            despesa.processoSEI.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Busca nas notas de empenho e ordens bancárias das fontes
        if (despesa.fontesDeRecurso && despesa.fontesDeRecurso.length > 0) {
          return despesa.fontesDeRecurso.some(fonte => 
            (fonte.notaEmpenho && fonte.notaEmpenho.toLowerCase().includes(searchLower)) ||
            (fonte.ordemBancaria && fonte.ordemBancaria.toLowerCase().includes(searchLower))
          );
        }
        
        return false;
      });
    } catch (error) {
      throw new FirebaseServiceError('Failed to search expenses', error);
    }
  }

  async searchCreditosByCodigo(searchTerm: string): Promise<Credito[]> {
    try {
      const creditos = await this.getAllCreditos();
      return Object.values(creditos).filter(credito => 
        credito.creditoCodigo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      throw new FirebaseServiceError('Failed to search credits', error);
    }
  }

  // Get expense details with full credit and transaction information
  async getDespesaDetailsWithCredits(despesaId: string): Promise<Despesa & {
    fontesComCreditos: Array<{
      fonte: FonteDeRecurso;
      credito: Credito;
    }>
  } | null> {
    try {
      const despesa = await this.getDespesaById(despesaId);
      if (!despesa) return null;

      const creditos = await this.getAllCreditos();
      const fontesComCreditos = despesa.fontesDeRecurso.map(fonte => ({
        fonte,
        credito: creditos[fonte.creditoId]
      })).filter(item => item.credito);

      return {
        ...despesa,
        fontesComCreditos
      };
    } catch (error) {
      throw new FirebaseServiceError('Failed to get expense details', error);
    }
  }

  // Get all expenses funded by a specific credit
  async getDespesasByCreditoId(creditoId: string): Promise<Array<{
    despesa: Despesa;
    participacao: FonteDeRecurso;
  }>> {
    try {
      const despesas = await this.getAllDespesas();
      const result: Array<{ despesa: Despesa; participacao: FonteDeRecurso }> = [];

      Object.values(despesas).forEach(despesa => {
        const fonte = despesa.fontesDeRecurso.find(f => f.creditoId === creditoId);
        if (fonte) {
          result.push({ despesa, participacao: fonte });
        }
      });

      return result;
    } catch (error) {
      throw new FirebaseServiceError('Failed to get expenses by credit', error);
    }
  }
}

// Export singleton instance
export const firebaseService = FirebaseService.getInstance();