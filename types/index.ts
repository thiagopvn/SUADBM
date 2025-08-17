// Tipos principais do sistema SICOF

// Nova estrutura para fontes de recurso - agora com dados de transação
export interface FonteDeRecurso {
  id: string; // ID único para cada fonte
  creditoId: string;
  valorUtilizado: number;
  notaEmpenho?: string;
  dataEmpenho?: string;
  ordemBancaria?: string;
  dataPagamento?: string;
  // NOVOS CAMPOS ADICIONADOS
  notaLiquidacao?: string;
  valorLiquidado?: number;
  quantidade?: number;
  valorUnitario?: number;
}

// Tipo para rastreabilidade de origem dos créditos
export type OrigemCredito = 
  | { tipo: 'Ano vigente'; descricao: string }
  | { tipo: 'Anos anteriores'; creditosAnteriores: string[]; };

// Interface Despesa reformulada - container para fontes de recurso
export interface Despesa {
  id: string;
  objeto: string;
  processoSEI: string;
  natureza: string; // MOVIDO DE Credito - natureza é específica do objeto/despesa
  status: 'Planejado' | 'Empenhado' | 'Liquidado' | 'Pago' | 'Cancelado';
  fontesDeRecurso: FonteDeRecurso[]; // Array de objetos FonteDeRecurso com transações individuais
  valorTotal: number; // Calculado pela soma de valorUtilizado das fontes
  // Removidos campos de transação que agora estão em FonteDeRecurso
  dataPrestacaoContas: string | null;
  prestacaoContasInfo: string | null;
  metaAssociada: string;
  acaoAssociada: string;
  // NOVO CAMPO ADICIONADO
  planoDeTrabalho?: string;
}

// Interface Credito reformulada - com suporte a múltiplos eixos
export interface Credito {
  id: string;
  creditoCodigo: string;
  anoExercicio: number;
  eixos: string[]; // NOVO CAMPO: Array de strings para múltiplos eixos (VPS, ECV, etc.)
  valorGlobal: number;
  origem: OrigemCredito; // NOVO CAMPO DE RASTREABILIDADE
  dataLancamento: string; // Formato YYYY-MM-DD - gatilho para prestação de contas
  // REMOVIDO: natureza - agora pertence a cada despesa/objeto específico
}

export interface MetaAcao {
  descricao: string;
}

export interface FechamentoAnual {
  totalDevolvido: number;
  dataFechamento: string;
  usuarioResponsavel: string;
}

export interface MockData {
  creditos: Record<string, Credito>;
  despesas: Record<string, Despesa>; // Despesas agora são independentes
  metasAcoes: Record<string, MetaAcao>;
  fechamentosAnuais: Record<string, FechamentoAnual>;
}

export interface DashboardData {
  valorGlobalConsolidado: number;
  valorEmpenhado: number;
  valorLiquidado: number;
  valorPago: number;
  saldoDisponivel: number; // Calculado: valorGlobalConsolidado - valorEmpenhado
  percentualEmpenhado: number; // Percentual do valor global que foi empenhado
  percentualLiquidado: number; // Percentual do valor empenhado que foi liquidado
  totalCreditos: number;
  chartData: ChartDataPoint[];
  pieData: PieDataPoint[];
  recentDespesas: DespesaWithCreditos[];
}

export interface ChartDataPoint {
  ano: number;
  valor: number;
}

export interface PieDataPoint {
  name: string;
  value: number;
}

// Interfaces derivadas atualizadas para nova arquitetura
export interface DespesaWithCreditos extends Despesa {
  creditosAssociados: { creditoId: string; creditoCodigo: string; valorUtilizado: number }[];
}

export interface CreditoWithCalculations extends Credito {
  valorEmpenhado: number;
  valorLiquidado: number;
  valorPago: number;
  saldoDisponivel: number; // Calculado: valorGlobal - (valorPago + valorEmpenhado)
}

// Novo tipo para operações de financiamento composto
export interface FinanciamentoComposto {
  despesaId: string;
  fontesDeRecurso: FonteDeRecurso[];
  valorTotalDespesa: number;
}

export interface PrestacaoContas {
  id: string;
  creditoId: string; // ID do crédito pai
  ano: number;
  periodoLabel: string; // Ex: "1ª Prestação (até 30/10/2024)"
  prazoFinal: string; // Formato YYYY-MM-DD
  status: 'Pendente' | 'Em Atraso' | 'Entregue';
  dataEntrega?: string | null;
  processoSEI?: string | null;
  despesasVinculadas: string[]; // Array de IDs das despesas
  observacoes?: string | null;
}