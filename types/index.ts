// Tipos principais do sistema SICOF

export interface Despesa {
  id: string;
  processoSEI: string;
  objeto: string;
  valorUnitario: number;
  quantidade: number;
  valorTotal: number;
  status: 'Planejado' | 'Empenhado' | 'Liquidado' | 'Pago' | 'Cancelado';
  dataEmpenho: string | null;
  notaEmpenho: string | null;
  dataPagamento: string | null;
  ordemBancaria: string | null;
  dataPrestacaoContas: string | null;
  prestacaoContasInfo: string | null;
  metaAssociada: string;
  acaoAssociada: string;
}

export interface Credito {
  id: string;
  creditoCodigo: string;
  anoExercicio: number;
  valorGlobal: number;
  acaoEixo: string;
  natureza: string;
  saldoAtual: number;
  despesas: Record<string, Despesa>;
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
  metasAcoes: Record<string, MetaAcao>;
  fechamentosAnuais: Record<string, FechamentoAnual>;
}

export interface DashboardData {
  totalGlobal: number;
  totalGasto: number;
  saldoDisponivel: number;
  totalCreditos: number;
  chartData: ChartDataPoint[];
  pieData: PieDataPoint[];
  recentDespesas: DespesaWithCredito[];
}

export interface ChartDataPoint {
  ano: number;
  valor: number;
}

export interface PieDataPoint {
  name: string;
  value: number;
}

export interface DespesaWithCredito extends Despesa {
  creditoCodigo: string;
}

export interface CreditoWithCalculations extends Credito {
  valorGasto: number;
}