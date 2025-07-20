"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Filter } from "lucide-react";
import type { CreditoWithCalculations, Credito } from "@/types";
import { useCreditos } from "@/hooks/use-creditos";
import { CreditoForm } from "@/components/forms/credito-form";

export default function CreditosPage() {
  const router = useRouter();
  const { creditos, creditosWithCalculations, loading, error, createCredito } = useCreditos();
  const [filteredCreditos, setFilteredCreditos] = useState<CreditoWithCalculations[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("todos");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setFilteredCreditos(creditosWithCalculations);
  }, [creditosWithCalculations]);

  useEffect(() => {
    // Aplicar filtros
    let filtered = creditosWithCalculations;

    if (searchTerm) {
      filtered = filtered.filter(credito => 
        credito.creditoCodigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        credito.acaoEixo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedYear !== "todos") {
      filtered = filtered.filter(credito => 
        credito.anoExercicio.toString() === selectedYear
      );
    }

    setFilteredCreditos(filtered);
  }, [searchTerm, selectedYear, creditosWithCalculations]);

  const years = [...new Set(creditosWithCalculations.map(c => c.anoExercicio))].sort((a, b) => b - a);

  const handleCreateCredito = async (creditoData: Omit<Credito, 'id'>) => {
    try {
      await createCredito(creditoData);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create credito:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Carregando créditos...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center items-center h-64">
              <div className="text-red-500">Erro ao carregar créditos: {error}</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Gestão de Créditos
            </h1>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Novo Crédito
            </button>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Pesquisar por código ou ação/eixo..."
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-gray-400 w-4 h-4" />
                  <select
                    className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    <option value="todos">Todos os anos</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ano
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código do Crédito
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ação / Eixo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Global
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Empenhado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saldo Disponível
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCreditos.map((credito) => {
                  const saldoPercentual = ((credito.saldoDisponivel / credito.valorGlobal) * 100).toFixed(0);
                  const status = parseInt(saldoPercentual) > 50 ? "Disponível" : 
                                parseInt(saldoPercentual) > 20 ? "Atenção" : "Crítico";
                  
                  return (
                    <tr 
                      key={credito.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/creditos/${credito.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {credito.anoExercicio}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {credito.creditoCodigo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={credito.acaoEixo}>
                          {credito.acaoEixo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <Badge variant={credito.origem?.tipo === 'Ano vigente' ? 'default' : 'secondary'}>
                          {credito.origem?.tipo === 'Ano vigente' ? 'Ano vigente' : 'Anos anteriores'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(credito.valorGlobal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                        {formatCurrency(credito.valorEmpenhado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {formatCurrency(credito.valorPago)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {formatCurrency(credito.saldoDisponivel)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={status === "Disponível" ? "default" : 
                                  status === "Atenção" ? "secondary" : "destructive"}
                        >
                          {saldoPercentual}% - {status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredCreditos.length === 0 && !loading && (
            <div className="bg-white shadow rounded-md p-8 text-center">
              <div className="text-gray-500">
                {creditosWithCalculations.length === 0 
                  ? "Nenhum crédito encontrado. Adicione o primeiro crédito!"
                  : "Nenhum crédito corresponde aos filtros aplicados."
                }
              </div>
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <CreditoForm
          onSubmit={handleCreateCredito}
          onCancel={() => setShowForm(false)}
          creditosAnteriores={Object.values(creditos)}
        />
      )}
    </div>
  );
}