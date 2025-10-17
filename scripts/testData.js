// Dados de teste para o sistema SUAD CBMERJ
const testData = {
  creditos: {
    "credito1": {
      id: "credito1",
      creditoCodigo: "2025-001-VPS",
      valorGlobal: 500000,
      anoExercicio: 2025,
      eixos: ["VPS", "ECV"],
      origem: {
        tipo: "Descentralização",
        numero: "DESC-2025-001",
        data: "2025-01-15"
      },
      natureza: "Custeio",
      dataLancamento: "2025-01-15"
    },
    "credito2": {
      id: "credito2",
      creditoCodigo: "2025-002-ECV",
      valorGlobal: 750000,
      anoExercicio: 2025,
      eixos: ["ECV"],
      origem: {
        tipo: "Descentralização",
        numero: "DESC-2025-002",
        data: "2025-02-01"
      },
      natureza: "Investimento",
      dataLancamento: "2025-02-01"
    },
    "credito3": {
      id: "credito3",
      creditoCodigo: "2025-003-VPS",
      valorGlobal: 300000,
      anoExercicio: 2025,
      eixos: ["VPS"],
      origem: {
        tipo: "Descentralização",
        numero: "DESC-2025-003",
        data: "2025-03-10"
      },
      natureza: "Custeio",
      dataLancamento: "2025-03-10"
    }
  },
  despesas: {
    "despesa1": {
      id: "despesa1",
      processoSEI: "00123-2025",
      objeto: "Aquisição de equipamentos de combate a incêndio",
      valorTotal: 150000,
      status: "Empenhado",
      fontesDeRecurso: [
        {
          id: "fonte1",
          creditoId: "credito1",
          valorUtilizado: 150000,
          notaEmpenho: "2025NE000123",
          dataEmpenho: "2025-02-15",
          notaLiquidacao: "2025NL000045",
          valorLiquidado: 150000
        }
      ],
      metaAssociada: "META-001",
      acaoAssociada: "ACAO-001"
    },
    "despesa2": {
      id: "despesa2",
      processoSEI: "00456-2025",
      objeto: "Manutenção de viaturas operacionais",
      valorTotal: 200000,
      status: "Pago",
      fontesDeRecurso: [
        {
          id: "fonte2",
          creditoId: "credito2",
          valorUtilizado: 200000,
          notaEmpenho: "2025NE000456",
          dataEmpenho: "2025-03-01",
          ordemBancaria: "2025OB000123",
          dataPagamento: "2025-03-15",
          notaLiquidacao: "2025NL000078",
          valorLiquidado: 200000
        }
      ],
      metaAssociada: "META-002",
      acaoAssociada: "ACAO-002"
    },
    "despesa3": {
      id: "despesa3",
      processoSEI: "00789-2025",
      objeto: "Treinamento de bombeiros",
      valorTotal: 100000,
      status: "Planejado",
      fontesDeRecurso: [
        {
          id: "fonte3",
          creditoId: "credito3",
          valorUtilizado: 100000
        }
      ],
      metaAssociada: "META-001",
      acaoAssociada: "ACAO-003"
    }
  },
  prestacoesContas: {
    "prestacao1": {
      id: "prestacao1",
      creditoId: "credito1",
      ano: 2025,
      periodoLabel: "1ª Prestação (até 15/05/2025)",
      prazoFinal: "2025-05-15",
      status: "Pendente",
      despesasVinculadas: ["despesa1"]
    },
    "prestacao2": {
      id: "prestacao2",
      creditoId: "credito2",
      ano: 2025,
      periodoLabel: "1ª Prestação (até 01/06/2025)",
      prazoFinal: "2025-06-01",
      status: "Pendente",
      despesasVinculadas: ["despesa2"]
    }
  },
  metasAcoes: {
    "META-001": { descricao: "Modernização de equipamentos" },
    "META-002": { descricao: "Manutenção da frota" },
    "ACAO-001": { descricao: "Aquisição de EPIs" },
    "ACAO-002": { descricao: "Manutenção preventiva" },
    "ACAO-003": { descricao: "Capacitação técnica" }
  },
  fechamentosAnuais: {}
};

module.exports = { testData };
