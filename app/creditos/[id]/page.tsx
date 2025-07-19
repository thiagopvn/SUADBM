"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockData } from "@/firebase/mockData";
import { formatCurrency, formatDate, getStatusColor, calculateTotalSpent } from "@/lib/utils";
import type { Credito, Despesa } from "@/types";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  FileText,
  CreditCard
} from "lucide-react";

export default function CreditoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const [credito, setCredito] = useState<Credito | null>(null);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [filteredDespesas, setFilteredDespesas] = useState<Despesa[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  useEffect(() => {
    // Carregar dados do crédito específico
    const creditoId = params.id as string;
    const creditoData = mockData.creditos[creditoId];
    
    if (creditoData) {
      setCredito(creditoData);
      const despesasList = Object.values(creditoData.despesas);
      setDespesas(despesasList);
      setFilteredDespesas(despesasList);
    }
  }, [params.id]);

  useEffect(() => {
    // Aplicar filtros
    let filtered = despesas;

    if (searchTerm) {
      filtered = filtered.filter(despesa => 
        despesa.objeto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        despesa.processoSEI.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "todos") {
      filtered = filtered.filter(despesa => despesa.status === statusFilter);
    }

    setFilteredDespesas(filtered);
  }, [searchTerm, statusFilter, despesas]);

  if (!credito) {
    return <div>Carregando...</div>;
  }

  const totalGasto = credito ? calculateTotalSpent(credito.despesas) : 0;

  const saldoDisponivel = credito.valorGlobal - totalGasto;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <button 
            onClick={() => router.push('/creditos')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Créditos
          </button>

          <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {credito.creditoCodigo}
                </h1>
                <p className="text-gray-600 mb-4">{credito.acaoEixo}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>Ano: {credito.anoExercicio}</span>
                  <span>•</span>
                  <span>Natureza: {credito.natureza}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Valor Global
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(credito.valorGlobal)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Gasto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalGasto)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Saldo Disponível
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(saldoDisponivel)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Despesas</CardTitle>
                <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar Nova Despesa
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Pesquisar por objeto ou processo SEI..."
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-gray-400 w-4 h-4" />
                  <select
                    className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="todos">Todos os status</option>
                    <option value="Planejado">Planejado</option>
                    <option value="Empenhado">Empenhado</option>
                    <option value="Liquidado">Liquidado</option>
                    <option value="Pago">Pago</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Processo SEI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Objeto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nota de Empenho
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ordem Bancária
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prest. Contas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDespesas.map((despesa) => (
                      <tr key={despesa.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(despesa.status)}>
                            {despesa.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {despesa.processoSEI}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate" title={despesa.objeto}>
                            {despesa.objeto}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(despesa.valorTotal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {despesa.notaEmpenho ? (
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3 text-gray-400" />
                              {despesa.notaEmpenho}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {despesa.ordemBancaria ? (
                            <div className="flex items-center gap-1">
                              <CreditCard className="w-3 h-3 text-gray-400" />
                              {despesa.ordemBancaria}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {despesa.dataPrestacaoContas ? (
                            <span className="text-green-600">✓ {formatDate(despesa.dataPrestacaoContas)}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}