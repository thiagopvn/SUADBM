"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card } from "@/components/ui/card";
import { useCreditos } from "@/hooks/use-creditos";
import { useDespesas } from "@/hooks/use-despesas";
import { formatCurrency } from "@/lib/utils";
import { FileText, Download, Calendar, Filter } from "lucide-react";

export default function RelatoriosPage() {
  const { creditos, creditosWithCalculations } = useCreditos();
  const { despesasWithCredits } = useDespesas();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [customReport, setCustomReport] = useState({
    type: 'execucao',
    startDate: '',
    endDate: ''
  });
  const [filters, setFilters] = useState({
    showFilters: false,
    period: 'all'
  });

  const relatorios = [
    {
      id: 1,
      titulo: "Relatório de Execução Orçamentária",
      descricao: "Demonstrativo da execução orçamentária por período",
      ultimaAtualizacao: "15/07/2025",
      status: "Disponível"
    },
    {
      id: 2,
      titulo: "Relatório de Créditos por Ação/Eixo",
      descricao: "Agrupamento de créditos por categoria de ação/eixo",
      ultimaAtualizacao: "12/07/2025",
      status: "Disponível"
    },
    {
      id: 3,
      titulo: "Relatório de Despesas Liquidadas",
      descricao: "Listagem de todas as despesas liquidadas no período",
      ultimaAtualizacao: "10/07/2025",
      status: "Disponível"
    },
    {
      id: 4,
      titulo: "Relatório de Prestação de Contas",
      descricao: "Status da prestação de contas por crédito",
      ultimaAtualizacao: "08/07/2025",
      status: "Disponível"
    }
  ];

  const handleDownloadReport = async (reportId: number, title: string) => {
    setLoading(true);
    setMessage('');
    
    try {
      // Generate report data based on report type
      let reportData;
      
      switch (reportId) {
        case 1: // Execução Orçamentária
          reportData = generateBudgetExecutionReport();
          break;
        case 2: // Créditos por Ação/Eixo
          reportData = generateCreditsByActionReport();
          break;
        case 3: // Despesas Liquidadas
          reportData = generateLiquidatedExpensesReport();
          break;
        case 4: // Prestação de Contas
          reportData = generateAccountabilityReport();
          break;
        default:
          throw new Error('Tipo de relatório não encontrado');
      }
      
      downloadCSV(reportData, `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      setMessage('Relatório baixado com sucesso!');
    } catch (error) {
      setMessage('Erro ao gerar relatório.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCustomReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customReport.startDate || !customReport.endDate) {
      setMessage('Por favor, selecione as datas de início e fim.');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      let reportData;
      
      switch (customReport.type) {
        case 'execucao':
          reportData = generateBudgetExecutionReport(customReport.startDate, customReport.endDate);
          break;
        case 'despesas':
          reportData = generateExpensesByPeriodReport(customReport.startDate, customReport.endDate);
          break;
        case 'creditos':
          reportData = generateCreditsByActionReport();
          break;
        case 'prestacao':
          reportData = generateAccountabilityReport(customReport.startDate, customReport.endDate);
          break;
        default:
          throw new Error('Tipo de relatório inválido');
      }
      
      const reportTypes = {
        execucao: 'Execucao_Orcamentaria',
        despesas: 'Despesas_por_Periodo',
        creditos: 'Creditos_por_Status',
        prestacao: 'Prestacao_de_Contas'
      };
      
      downloadCSV(reportData, `${reportTypes[customReport.type as keyof typeof reportTypes]}_${customReport.startDate}_${customReport.endDate}.csv`);
      setMessage('Relatório personalizado gerado com sucesso!');
    } catch (error) {
      setMessage('Erro ao gerar relatório personalizado.');
    } finally {
      setLoading(false);
    }
  };

  const generateBudgetExecutionReport = (startDate?: string, endDate?: string) => {
    return creditosWithCalculations.map(credito => ({
      'Código do Crédito': credito.creditoCodigo,
      'Ano': credito.anoExercicio,
      'Ação/Eixo': credito.acaoEixo,
      'Origem': credito.origem?.tipo === 'Ano vigente' ? 'Ano vigente' : 'Anos anteriores',
      'Valor Global': formatCurrency(credito.valorGlobal),
      'Valor Empenhado': formatCurrency(credito.valorEmpenhado),
      'Valor Pago': formatCurrency(credito.valorPago),
      'Saldo Disponível': formatCurrency(credito.saldoDisponivel),
      'Percentual Executado': `${((credito.valorPago / credito.valorGlobal) * 100).toFixed(2)}%`
    }));
  };

  const generateCreditsByActionReport = () => {
    const groupedByAction = creditosWithCalculations.reduce((acc, credito) => {
      const action = credito.acaoEixo;
      if (!acc[action]) {
        acc[action] = {
          totalCreditos: 0,
          valorTotal: 0,
          valorEmpenhado: 0,
          valorPago: 0
        };
      }
      acc[action].totalCreditos++;
      acc[action].valorTotal += credito.valorGlobal;
      acc[action].valorEmpenhado += credito.valorEmpenhado;
      acc[action].valorPago += credito.valorPago;
      return acc;
    }, {} as Record<string, any>);
    
    return Object.entries(groupedByAction).map(([action, data]) => ({
      'Ação/Eixo': action,
      'Total de Créditos': data.totalCreditos,
      'Valor Total': formatCurrency(data.valorTotal),
      'Valor Empenhado': formatCurrency(data.valorEmpenhado),
      'Valor Pago': formatCurrency(data.valorPago),
      'Saldo Disponível': formatCurrency(data.valorTotal - data.valorPago - data.valorEmpenhado)
    }));
  };

  const generateLiquidatedExpensesReport = () => {
    return despesasWithCredits
      .filter(despesa => despesa.status === 'Liquidado' || despesa.status === 'Pago')
      .map(despesa => ({
        'Créditos Associados': despesa.creditosAssociados.map(c => c.creditoCodigo).join(', '),
        'Processo SEI': despesa.processoSEI,
        'Objeto': despesa.objeto,
        'Valor Total': formatCurrency(despesa.valorTotal),
        'Status': despesa.status,
        'Data de Empenho': despesa.dataEmpenho || '-',
        'Nota de Empenho': despesa.notaEmpenho || '-',
        'Data de Pagamento': despesa.dataPagamento || '-',
        'Fontes de Financiamento': despesa.fontesDeRecurso.length > 1 ? 'Múltiplas' : 'Única'
      }));
  };

  const generateAccountabilityReport = (startDate?: string, endDate?: string) => {
    return creditosWithCalculations.map(credito => {
      const despesasDoCredito = despesasWithCredits.filter(d => 
        d.fontesDeRecurso.some(fonte => fonte.creditoId === credito.id)
      );
      const totalDespesas = despesasDoCredito.length;
      const despesasComPrestacao = despesasDoCredito.filter(d => d.dataPrestacaoContas).length;
      
      return {
        'Código do Crédito': credito.creditoCodigo,
        'Ação/Eixo': credito.acaoEixo,
        'Total de Despesas': totalDespesas,
        'Despesas com Prestação': despesasComPrestacao,
        'Percentual de Compliance': totalDespesas > 0 ? `${((despesasComPrestacao / totalDespesas) * 100).toFixed(2)}%` : '0%',
        'Status': despesasComPrestacao === totalDespesas ? 'Completo' : 'Pendente'
      };
    });
  };

  const generateExpensesByPeriodReport = (startDate: string, endDate: string) => {
    return despesasWithCredits
      .filter(despesa => {
        const expenseDate = despesa.dataEmpenho;
        return expenseDate && expenseDate >= startDate && expenseDate <= endDate;
      })
      .map(despesa => ({
        'Créditos Associados': despesa.creditosAssociados.map(c => c.creditoCodigo).join(', '),
        'Data de Empenho': despesa.dataEmpenho,
        'Processo SEI': despesa.processoSEI,
        'Objeto': despesa.objeto,
        'Valor Total': formatCurrency(despesa.valorTotal),
        'Status': despesa.status,
        'Financiamento': despesa.fontesDeRecurso.length > 1 ? 'Composto' : 'Único'
      }));
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      throw new Error('Nenhum dado encontrado para o relatório');
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
                <p className="text-gray-600">Gere e baixe relatórios do sistema</p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </button>
                <select
                  value={filters.period}
                  onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <option value="all">Todos os períodos</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-md text-sm ${
                message.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}

            {filters.showFilters && (
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Filtros Avançados</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status do Crédito
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>Todos</option>
                      <option>Disponível</option>
                      <option>Atenção</option>
                      <option>Crítico</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Origem do Crédito
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>Todas</option>
                      <option>Ano vigente</option>
                      <option>Anos anteriores</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Mínimo
                    </label>
                    <input 
                      type="number" 
                      placeholder="R$ 0,00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatorios.map((relatorio) => (
                <Card key={relatorio.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {relatorio.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {relatorio.descricao}
                        </p>
                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                          <span>Última atualização: {relatorio.ultimaAtualizacao}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            relatorio.status === 'Disponível' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {relatorio.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownloadReport(relatorio.id, relatorio.titulo)}
                      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        relatorio.status === 'Disponível'
                          ? 'text-blue-600 bg-blue-100 hover:bg-blue-200'
                          : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      }`}
                      disabled={relatorio.status !== 'Disponível' || loading}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      {loading ? 'Gerando...' : 'Baixar'}
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Gerar Relatório Personalizado
              </h3>
              <form onSubmit={handleGenerateCustomReport} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Relatório
                    </label>
                    <select 
                      value={customReport.type}
                      onChange={(e) => setCustomReport(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="execucao">Execução Orçamentária</option>
                      <option value="despesas">Despesas por Período</option>
                      <option value="creditos">Créditos por Status</option>
                      <option value="prestacao">Prestação de Contas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Início
                    </label>
                    <input 
                      type="date" 
                      value={customReport.startDate}
                      onChange={(e) => setCustomReport(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Fim
                    </label>
                    <input 
                      type="date" 
                      value={customReport.endDate}
                      onChange={(e) => setCustomReport(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {loading ? 'Gerando...' : 'Gerar Relatório'}
                  </button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}