'use client';

import { useState } from 'react';
import { database } from '@/firebase/config';
import { ref, set } from 'firebase/database';

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

export default function ImportDataButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleImport = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const dbRef = ref(database);
      await set(dbRef, testData);

      setMessage(`✅ Dados importados com sucesso!
      - ${Object.keys(testData.creditos).length} créditos
      - ${Object.keys(testData.despesas).length} despesas
      - ${Object.keys(testData.prestacoesContas).length} prestações de contas
      - ${Object.keys(testData.metasAcoes).length} metas/ações`);
    } catch (err) {
      console.error('Erro ao importar:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Importar Dados de Teste</h2>

      <p className="text-gray-600 mb-4">
        Clique no botão abaixo para popular o banco de dados com dados de teste.
      </p>

      <button
        onClick={handleImport}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Importando...' : 'Importar Dados de Teste'}
      </button>

      {message && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <pre className="text-green-800 whitespace-pre-wrap">{message}</pre>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
