"use client";

import { Card } from "@/components/ui/card";
import { FileText, Download, Calendar, Filter } from "lucide-react";

export default function RelatoriosPage() {
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
      status: "Processando"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Gere e baixe relatórios do sistema</p>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Calendar className="w-4 h-4 mr-2" />
            Período
          </button>
        </div>
      </div>

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
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  relatorio.status === 'Disponível'
                    ? 'text-blue-600 bg-blue-100 hover:bg-blue-200'
                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                }`}
                disabled={relatorio.status !== 'Disponível'}
              >
                <Download className="w-4 h-4 mr-1" />
                Baixar
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Gerar Relatório Personalizado
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Relatório
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Execução Orçamentária</option>
              <option>Despesas por Período</option>
              <option>Créditos por Status</option>
              <option>Prestação de Contas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Início
            </label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Fim
            </label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <FileText className="w-4 h-4 mr-2" />
            Gerar Relatório
          </button>
        </div>
      </Card>
    </div>
  );
}