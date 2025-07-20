"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import type { Credito, Despesa, PrestacaoContas, CreditoWithCalculations } from "@/types";
import { useCreditos } from "@/hooks/use-creditos";
import { useDespesas } from "@/hooks/use-despesas";
import { usePrestacaoContas } from "@/hooks/use-prestacoes-contas";
import { DespesaForm } from "@/components/forms/despesa-form";
import { TabelaPrestacoes } from "@/components/prestacao-contas/tabela-prestacoes";
import { ModalGerenciarPrestacao } from "@/components/prestacao-contas/modal-gerenciar-prestacao";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  FileText,
  CreditCard,
  ClipboardList,
  Receipt,
  Link
} from "lucide-react";

export default function CreditoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const creditoId = params.id as string;
  
  const { creditos, creditosDisponiveis, loading: loadingCreditos } = useCreditos();
  const { despesasWithCredits, createDespesa, updateDespesa, deleteDespesa, getDespesasByCredito } = useDespesas();
  
  const [credito, setCredito] = useState<Credito | null>(null);
  const [creditoCalculations, setCreditoCalculations] = useState<CreditoWithCalculations | null>(null);
  const [despesasDoCredito, setDespesasDoCredito] = useState<typeof despesasWithCredits>([]);
  const [filteredDespesas, setFilteredDespesas] = useState<typeof despesasWithCredits>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showDespesaForm, setShowDespesaForm] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null);
  const [modalPrestacaoAberto, setModalPrestacaoAberto] = useState(false);
  const [prestacaoSelecionada, setPrestacaoSelecionada] = useState<PrestacaoContas | null>(null);
  
  // Hook para prestações de contas
  const { 
    prestacoes, 
    marcarComoEntregue,
    vincularDespesas 
  } = usePrestacaoContas(creditoId);

  // Encontrar o crédito específico
  useEffect(() => {
    if (creditos && creditoId) {
      const creditoEncontrado = creditos[creditoId];
      if (creditoEncontrado) {
        setCredito(creditoEncontrado);
      }
    }
  }, [creditos, creditoId]);

  // Encontrar os cálculos do crédito
  useEffect(() => {
    if (creditosDisponiveis && creditoId) {
      const creditoComCalculos = creditosDisponiveis.find(c => c.id === creditoId);
      if (creditoComCalculos) {
        setCreditoCalculations(creditoComCalculos);
      }
    }
  }, [creditosDisponiveis, creditoId]);

  // Filtrar despesas relacionadas ao crédito
  useEffect(() => {
    if (despesasWithCredits && creditoId) {
      const despesasFiltradas = getDespesasByCredito(creditoId);
      setDespesasDoCredito(despesasFiltradas);
      setFilteredDespesas(despesasFiltradas);
    }
  }, [despesasWithCredits, creditoId, getDespesasByCredito]);

  // Aplicar filtros de busca e status
  useEffect(() => {
    let filtered = despesasDoCredito;

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
  }, [searchTerm, statusFilter, despesasDoCredito]);

  const handleCreateDespesa = async (despesaData: Omit<Despesa, 'id'>) => {
    try {
      await createDespesa(despesaData);
      setShowDespesaForm(false);
    } catch (error) {
      console.error('Failed to create despesa:', error);
    }
  };

  const handleUpdateDespesa = async (despesaData: Omit<Despesa, 'id'>) => {
    if (!editingDespesa) return;
    
    try {
      await updateDespesa(editingDespesa.id, despesaData);
      setEditingDespesa(null);
    } catch (error) {
      console.error('Failed to update despesa:', error);
    }
  };

  const handleDeleteDespesa = async (despesaId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;
    
    try {
      await deleteDespesa(despesaId);
    } catch (error) {
      console.error('Failed to delete despesa:', error);
    }
  };

  const renderMultipleCreditIndicator = (despesa: typeof despesasWithCredits[0]) => {
    if (despesa.fontesDeRecurso.length <= 1) return null;

    const tooltip = despesa.creditosAssociados
      .map(credito => `${credito.creditoCodigo}: ${formatCurrency(credito.valorUtilizado)}`)
      .join(', ');

    return (
      <div className="flex items-center gap-1" title={tooltip}>
        <Link className="w-3 h-3 text-blue-500" />
        <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
          {despesa.fontesDeRecurso.length} fontes
        </span>
      </div>
    );
  };

  if (loadingCreditos) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Carregando detalhes do crédito...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!credito) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center items-center h-64">
              <div className="text-red-500">Crédito não encontrado!</div>
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
                  <span>•</span>
                  <span>Origem: {credito.origem?.tipo === 'Ano vigente' ? 'Ano vigente' : 'Anos anteriores'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
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
                    Valor Empenhado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(creditoCalculations?.valorEmpenhado || 0)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Valor Pago
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(creditoCalculations?.valorPago || 0)}
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
                    {formatCurrency(creditoCalculations?.saldoDisponivel || 0)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="despesas" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="despesas" className="flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Despesas
              </TabsTrigger>
              <TabsTrigger value="prestacao-contas" className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Prestação de Contas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="despesas">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Despesas</CardTitle>
                    <button 
                      onClick={() => setShowDespesaForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                    >
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
                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="text-gray-400 w-4 h-4" />
                      <select
                        className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                              <div className="flex items-center gap-2">
                                {formatCurrency(despesa.valorTotal)}
                                {renderMultipleCreditIndicator(despesa)}
                              </div>
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
                                <button 
                                  onClick={() => setEditingDespesa(despesa)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteDespesa(despesa.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {filteredDespesas.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        {despesasDoCredito.length === 0 
                          ? "Nenhuma despesa encontrada. Adicione a primeira despesa!"
                          : "Nenhuma despesa corresponde aos filtros aplicados."
                        }
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prestacao-contas">
              <Card>
                <CardHeader>
                  <CardTitle>Controle de Prestação de Contas</CardTitle>
                </CardHeader>
                <CardContent>
                  <TabelaPrestacoes 
                    prestacoes={prestacoes}
                    onGerenciar={(prestacao) => {
                      setPrestacaoSelecionada(prestacao);
                      setModalPrestacaoAberto(true);
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {showDespesaForm && (
        <DespesaForm
          onSubmit={handleCreateDespesa}
          onCancel={() => setShowDespesaForm(false)}
          creditosDisponiveis={creditosDisponiveis}
        />
      )}

      {editingDespesa && (
        <DespesaForm
          onSubmit={handleUpdateDespesa}
          onCancel={() => setEditingDespesa(null)}
          initialData={editingDespesa}
          isEditing={true}
          creditosDisponiveis={creditosDisponiveis}
        />
      )}

      <ModalGerenciarPrestacao
        open={modalPrestacaoAberto}
        onOpenChange={setModalPrestacaoAberto}
        prestacao={prestacaoSelecionada}
        despesasCredito={despesasDoCredito}
        onSalvar={async (prestacaoId, dados) => {
          if (dados.despesasVinculadas) {
            await vincularDespesas(prestacaoId, dados.despesasVinculadas);
          }
          if (dados.processoSEI) {
            await marcarComoEntregue(prestacaoId, dados.processoSEI, dados.observacoes);
          }
        }}
      />
    </div>
  );
}