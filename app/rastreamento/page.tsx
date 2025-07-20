'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, FileText, DollarSign, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { firebaseService } from '@/lib/firebase-service';
import type { Despesa, Credito } from '@/types';

interface DespesaDetalhes extends Despesa {
  fontesComCreditos: Array<{
    fonte: {
      id: string;
      creditoId: string;
      valorUtilizado: number;
      notaEmpenho?: string;
      dataEmpenho?: string;
      ordemBancaria?: string;
      dataPagamento?: string;
    };
    credito: Credito;
  }>;
}

export default function RastreamentoPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [resultadosDespesas, setResultadosDespesas] = useState<Despesa[]>([]);
  const [resultadosCreditos, setResultadosCreditos] = useState<Credito[]>([]);
  const [despesaSelecionada, setDespesaSelecionada] = useState<DespesaDetalhes | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const buscarResultados = useCallback(async () => {
    if (!searchTerm.trim()) {
      setResultadosDespesas([]);
      setResultadosCreditos([]);
      return;
    }

    try {
      setSearching(true);
      const [despesas, creditos] = await Promise.all([
        firebaseService.searchDespesasByObjeto(searchTerm.trim()),
        firebaseService.searchCreditosByCodigo(searchTerm.trim())
      ]);

      setResultadosDespesas(despesas);
      setResultadosCreditos(creditos);
    } catch (error) {
      console.error('Erro ao buscar resultados:', error);
    } finally {
      setSearching(false);
    }
  }, [searchTerm]);

  const visualizarDetalhes = async (despesaId: string) => {
    try {
      const detalhes = await firebaseService.getDespesaDetailsWithCredits(despesaId);
      if (detalhes) {
        setDespesaSelecionada(detalhes);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da despesa:', error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      buscarResultados();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, buscarResultados]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Dashboard
          </button>

          <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Rastreamento Universal
              </h1>

              {/* Campo de Pesquisa Universal */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Digite o objeto da despesa ou código do crédito..."
                />
                {searching && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 mt-2">
                Busque por objetos de despesas (ex: &quot;Helicóptero&quot;) ou códigos de créditos (ex: &quot;2024DC00001&quot;)
              </p>
            </div>

      {(resultadosDespesas.length > 0 || resultadosCreditos.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Seção Resultados por Despesa */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Despesas Encontradas ({resultadosDespesas.length})
              </h2>
            </div>

            {resultadosDespesas.length === 0 && searchTerm ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma despesa encontrada com o termo &quot;{searchTerm}&quot;
              </p>
            ) : (
              <div className="space-y-3">
                {resultadosDespesas.map(despesa => (
                  <div
                    key={despesa.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {despesa.objeto}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          SEI: {despesa.processoSEI}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            despesa.status === 'Pago' ? 'bg-green-100 text-green-800' :
                            despesa.status === 'Empenhado' ? 'bg-yellow-100 text-yellow-800' :
                            despesa.status === 'Planejado' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {despesa.status}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {despesa.valorTotal.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </span>
                          <span>
                            {despesa.fontesDeRecurso.length} fonte{despesa.fontesDeRecurso.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => visualizarDetalhes(despesa.id)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seção Resultados por Crédito */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center mb-4">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Créditos Encontrados ({resultadosCreditos.length})
              </h2>
            </div>

            {resultadosCreditos.length === 0 && searchTerm ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum crédito encontrado com o termo &quot;{searchTerm}&quot;
              </p>
            ) : (
              <div className="space-y-3">
                {resultadosCreditos.map(credito => (
                  <div
                    key={credito.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {credito.creditoCodigo}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Ano: {credito.anoExercicio}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {credito.valorGlobal.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </span>
                          <span>
                            {credito.eixos.length} eixo{credito.eixos.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {credito.eixos.map((eixo, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {eixo.split('(')[0].trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/creditos/${credito.id}`)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Auditoria
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Despesa */}
      {showDetailsModal && despesaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Detalhes da Despesa
              </h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setDespesaSelecionada(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* Informações Básicas */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Informações Gerais
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Objeto:</p>
                    <p className="text-sm text-gray-900">{despesaSelecionada.objeto}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Processo SEI:</p>
                    <p className="text-sm text-gray-900">{despesaSelecionada.processoSEI}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status:</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      despesaSelecionada.status === 'Pago' ? 'bg-green-100 text-green-800' :
                      despesaSelecionada.status === 'Empenhado' ? 'bg-yellow-100 text-yellow-800' :
                      despesaSelecionada.status === 'Planejado' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {despesaSelecionada.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Valor Total:</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {despesaSelecionada.valorTotal.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fontes de Recurso com Transações */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Fontes de Recurso e Transações
              </h3>
              <div className="space-y-4">
                {despesaSelecionada.fontesComCreditos.map((item, index) => (
                  <div key={item.fonte.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">
                        Fonte {index + 1} - {item.credito.creditoCodigo}
                      </h4>
                      <span className="text-sm font-semibold text-blue-600">
                        {item.fonte.valorUtilizado.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {/* Informações do Empenho */}
                      {item.fonte.notaEmpenho && (
                        <>
                          <div>
                            <p className="font-medium text-gray-700">Nota de Empenho:</p>
                            <p className="text-gray-900">{item.fonte.notaEmpenho}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Data de Empenho:</p>
                            <p className="text-gray-900">
                              {item.fonte.dataEmpenho ? 
                                new Date(item.fonte.dataEmpenho).toLocaleDateString('pt-BR') : 
                                '-'
                              }
                            </p>
                          </div>
                        </>
                      )}

                      {/* Informações do Pagamento */}
                      {item.fonte.ordemBancaria && (
                        <>
                          <div>
                            <p className="font-medium text-gray-700">Ordem Bancária:</p>
                            <p className="text-gray-900">{item.fonte.ordemBancaria}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Data de Pagamento:</p>
                            <p className="text-gray-900">
                              {item.fonte.dataPagamento ? 
                                new Date(item.fonte.dataPagamento).toLocaleDateString('pt-BR') : 
                                '-'
                              }
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Informações do Crédito */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-700 mb-1">Crédito de Origem:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.credito.eixos.map((eixo, eixoIndex) => (
                          <span 
                            key={eixoIndex}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {eixo.split('(')[0].trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setDespesaSelecionada(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Fechar
              </button>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </main>
    </div>
  );
}