import type { MockData } from "@/types";

export const mockData: MockData = {
  creditos: {
    "DC00005_2019": {
      id: "DC00005_2019",
      creditoCodigo: "2019DC00005",
      anoExercicio: 2019,
      valorGlobal: 2328318.16,
      acaoEixo: "VALORIZAÇÃO DOS PROFISSIONAIS DE SEGURANÇA PÚBLICA",
      natureza: "I-449000",
      dataLancamento: "2019-01-01",
      origem: { tipo: 'Original', descricao: 'Crédito original do ano de 2019' }
    },
    "DC00006_2020": {
      id: "DC00006_2020",
      creditoCodigo: "2020DC00006",
      anoExercicio: 2020,
      valorGlobal: 1850000.00,
      acaoEixo: "MODERNIZAÇÃO DAS UNIDADES OPERACIONAIS",
      natureza: "I-339030",
      dataLancamento: "2020-01-01",
      origem: { tipo: 'Original', descricao: 'Crédito original do ano de 2020' }
    },
    "DC00007_2021": {
      id: "DC00007_2021",
      creditoCodigo: "2021DC00007",
      anoExercicio: 2021,
      valorGlobal: 3200000.00,
      acaoEixo: "VALORIZAÇÃO DOS PROFISSIONAIS DE SEGURANÇA PÚBLICA",
      natureza: "I-449052",
      dataLancamento: "2021-01-01",
      origem: { tipo: 'Original', descricao: 'Crédito original do ano de 2021' }
    }
  },
  despesas: {
    "despesa_01": {
      id: "despesa_01",
      processoSEI: "SEI-270003/000946/2024",
      objeto: "BICICLETA ERGOMÉTRICA (CARDIO)",
      valorTotal: 9833.33,
      status: "Pago",
      dataEmpenho: "2024-05-10",
      notaEmpenho: "2024NE00123",
      dataPagamento: "2024-06-15",
      ordemBancaria: "2024OB45678",
      dataPrestacaoContas: "2024-07-01",
      prestacaoContasInfo: "Documentação OK.",
      metaAssociada: "meta_01",
      acaoAssociada: "acao_01",
      fontesDeRecurso: [{ creditoId: "DC00005_2019", valorUtilizado: 9833.33 }]
    },
    "despesa_02": {
      id: "despesa_02",
      processoSEI: "SEI-270003/000947/2024",
      objeto: "ESTEIRA PROFISSIONAL",
      valorTotal: 30000.00,
      status: "Empenhado",
      dataEmpenho: "2024-05-15",
      notaEmpenho: "2024NE00124",
      dataPagamento: null,
      ordemBancaria: null,
      dataPrestacaoContas: null,
      prestacaoContasInfo: null,
      metaAssociada: "meta_01",
      acaoAssociada: "acao_01",
      fontesDeRecurso: [{ creditoId: "DC00005_2019", valorUtilizado: 30000.00 }]
    },
    "despesa_03": {
      id: "despesa_03",
      processoSEI: "SEI-270003/000950/2024",
      objeto: "MATERIAL DE EXPEDIENTE",
      valorTotal: 50000.00,
      status: "Pago",
      dataEmpenho: "2024-03-10",
      notaEmpenho: "2024NE00100",
      dataPagamento: "2024-04-15",
      ordemBancaria: "2024OB40000",
      dataPrestacaoContas: "2024-05-01",
      prestacaoContasInfo: "Prestação de contas aprovada.",
      metaAssociada: "meta_02",
      acaoAssociada: "acao_02",
      fontesDeRecurso: [{ creditoId: "DC00006_2020", valorUtilizado: 50000.00 }]
    },
    "despesa_04": {
      id: "despesa_04",
      processoSEI: "SEI-270003/000960/2024",
      objeto: "COMPUTADORES DESKTOP",
      valorTotal: 70000.00,
      status: "Liquidado",
      dataEmpenho: "2024-06-01",
      notaEmpenho: "2024NE00150",
      dataPagamento: null,
      ordemBancaria: null,
      dataPrestacaoContas: null,
      prestacaoContasInfo: null,
      metaAssociada: "meta_03",
      acaoAssociada: "acao_03",
      fontesDeRecurso: [{ creditoId: "DC00007_2021", valorUtilizado: 70000.00 }]
    }
  },
  metasAcoes: {
    "meta_01": {
      descricao: "Melhorar capacidade física da tropa"
    },
    "meta_02": {
      descricao: "Modernizar infraestrutura administrativa"
    },
    "meta_03": {
      descricao: "Atualizar parque tecnológico"
    },
    "acao_01": {
      descricao: "Aquisição de equipamentos de ginástica"
    },
    "acao_02": {
      descricao: "Compra de material administrativo"
    },
    "acao_03": {
      descricao: "Renovação de equipamentos de TI"
    }
  },
  fechamentosAnuais: {
    "2019": {
      totalDevolvido: 125430.50,
      dataFechamento: "2019-12-31",
      usuarioResponsavel: "admin@cbmerj.rj.gov.br"
    },
    "2020": {
      totalDevolvido: 87900.00,
      dataFechamento: "2020-12-31",
      usuarioResponsavel: "admin@cbmerj.rj.gov.br"
    }
  }
};