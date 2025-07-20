'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Despesa, FonteDeRecurso, Credito, CreditoWithCalculations } from '@/types';

interface DespesaFormProps {
  onSubmit: (despesa: Omit<Despesa, 'id'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<Despesa>;
  isEditing?: boolean;
  creditosDisponiveis: CreditoWithCalculations[];
}

export function DespesaForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isEditing = false,
  creditosDisponiveis 
}: DespesaFormProps) {
  const [formData, setFormData] = useState({
    processoSEI: initialData?.processoSEI || '',
    objeto: initialData?.objeto || '',
    status: initialData?.status || 'Planejado' as const,
    dataEmpenho: initialData?.dataEmpenho || '',
    notaEmpenho: initialData?.notaEmpenho || '',
    dataPagamento: initialData?.dataPagamento || '',
    ordemBancaria: initialData?.ordemBancaria || '',
    dataPrestacaoContas: initialData?.dataPrestacaoContas || '',
    prestacaoContasInfo: initialData?.prestacaoContasInfo || '',
    metaAssociada: initialData?.metaAssociada || '',
    acaoAssociada: initialData?.acaoAssociada || '',
  });

  const [fontesDeRecurso, setFontesDeRecurso] = useState<FonteDeRecurso[]>(
    initialData?.fontesDeRecurso || [{ creditoId: '', valorUtilizado: 0 }]
  );

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const statusOptions: Array<{ value: Despesa['status']; label: string }> = [
    { value: 'Planejado', label: 'Planejado' },
    { value: 'Empenhado', label: 'Empenhado' },
    { value: 'Liquidado', label: 'Liquidado' },
    { value: 'Pago', label: 'Pago' },
    { value: 'Cancelado', label: 'Cancelado' },
  ];

  // Calcular valor total em tempo real
  const valorTotal = fontesDeRecurso.reduce((total, fonte) => total + fonte.valorUtilizado, 0);

  const adicionarFonteDeRecurso = () => {
    setFontesDeRecurso([...fontesDeRecurso, { creditoId: '', valorUtilizado: 0 }]);
  };

  const removerFonteDeRecurso = (index: number) => {
    if (fontesDeRecurso.length > 1) {
      setFontesDeRecurso(fontesDeRecurso.filter((_, i) => i !== index));
    }
  };

  const atualizarFonteDeRecurso = (index: number, campo: keyof FonteDeRecurso, valor: string | number) => {
    const novasFontes = [...fontesDeRecurso];
    if (campo === 'creditoId') {
      novasFontes[index].creditoId = valor as string;
    } else if (campo === 'valorUtilizado') {
      novasFontes[index].valorUtilizado = typeof valor === 'number' ? valor : parseFloat(valor as string) || 0;
    }
    setFontesDeRecurso(novasFontes);
  };

  const obterSaldoDisponivel = (creditoId: string): number => {
    const credito = creditosDisponiveis.find(c => c.id === creditoId);
    return credito?.saldoDisponivel || 0;
  };

  const obterCreditoCodigo = (creditoId: string): string => {
    const credito = creditosDisponiveis.find(c => c.id === creditoId);
    return credito?.creditoCodigo || '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.processoSEI.trim()) {
      newErrors.processoSEI = 'Processo SEI é obrigatório';
    }

    if (!formData.objeto.trim()) {
      newErrors.objeto = 'Objeto é obrigatório';
    }

    if (!formData.metaAssociada.trim()) {
      newErrors.metaAssociada = 'Meta associada é obrigatória';
    }

    if (!formData.acaoAssociada.trim()) {
      newErrors.acaoAssociada = 'Ação associada é obrigatória';
    }

    // Validar fontes de recurso
    fontesDeRecurso.forEach((fonte, index) => {
      if (!fonte.creditoId) {
        newErrors[`fonte_${index}_credito`] = 'Selecione um crédito';
      }
      
      if (fonte.valorUtilizado <= 0) {
        newErrors[`fonte_${index}_valor`] = 'Valor deve ser maior que zero';
      }

      if (fonte.creditoId && fonte.valorUtilizado > obterSaldoDisponivel(fonte.creditoId)) {
        newErrors[`fonte_${index}_valor`] = 'Valor excede o saldo disponível';
      }
    });

    if (valorTotal <= 0) {
      newErrors.valorTotal = 'O valor total da despesa deve ser maior que zero';
    }

    // Validation based on status
    if (formData.status !== 'Planejado') {
      if (!formData.dataEmpenho) {
        newErrors.dataEmpenho = 'Data de empenho é obrigatória para status diferente de Planejado';
      }
      if (!formData.notaEmpenho.trim()) {
        newErrors.notaEmpenho = 'Nota de empenho é obrigatória para status diferente de Planejado';
      }
    }

    if (formData.status === 'Pago') {
      if (!formData.dataPagamento) {
        newErrors.dataPagamento = 'Data de pagamento é obrigatória para status Pago';
      }
      if (!formData.ordemBancaria.trim()) {
        newErrors.ordemBancaria = 'Ordem bancária é obrigatória para status Pago';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const despesaData: Omit<Despesa, 'id'> = {
        ...formData,
        fontesDeRecurso: fontesDeRecurso.filter(fonte => fonte.creditoId && fonte.valorUtilizado > 0),
        valorTotal,
        dataEmpenho: formData.dataEmpenho || null,
        notaEmpenho: formData.notaEmpenho || null,
        dataPagamento: formData.dataPagamento || null,
        ordemBancaria: formData.ordemBancaria || null,
        dataPrestacaoContas: formData.dataPrestacaoContas || null,
        prestacaoContasInfo: formData.prestacaoContasInfo || null,
      };
      
      await onSubmit(despesaData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Editar Despesa' : 'Nova Despesa'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seção Informações Básicas */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Processo SEI *
                </label>
                <input
                  type="text"
                  value={formData.processoSEI}
                  onChange={(e) => handleInputChange('processoSEI', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.processoSEI ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: SEI-270003/000946/2024"
                />
                {errors.processoSEI && (
                  <p className="text-red-500 text-sm mt-1">{errors.processoSEI}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objeto *
              </label>
              <textarea
                value={formData.objeto}
                onChange={(e) => handleInputChange('objeto', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.objeto ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Descrição do objeto da despesa"
                rows={2}
              />
              {errors.objeto && (
                <p className="text-red-500 text-sm mt-1">{errors.objeto}</p>
              )}
            </div>
          </div>

          {/* Seção Fontes de Recurso */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Fontes de Recurso</h3>
              <button
                type="button"
                onClick={adicionarFonteDeRecurso}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Adicionar Fonte
              </button>
            </div>

            <div className="space-y-4">
              {fontesDeRecurso.map((fonte, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Fonte {index + 1}</h4>
                    {fontesDeRecurso.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removerFonteDeRecurso(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Crédito *
                      </label>
                      <select
                        value={fonte.creditoId}
                        onChange={(e) => atualizarFonteDeRecurso(index, 'creditoId', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors[`fonte_${index}_credito`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Selecione um crédito</option>
                        {creditosDisponiveis.map(credito => (
                          <option key={credito.id} value={credito.id}>
                            {credito.creditoCodigo} - Saldo: {credito.saldoDisponivel.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </option>
                        ))}
                      </select>
                      {errors[`fonte_${index}_credito`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`fonte_${index}_credito`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor Utilizado (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={fonte.valorUtilizado}
                        onChange={(e) => atualizarFonteDeRecurso(index, 'valorUtilizado', parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors[`fonte_${index}_valor`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        min="0"
                        max={fonte.creditoId ? obterSaldoDisponivel(fonte.creditoId) : undefined}
                      />
                      {errors[`fonte_${index}_valor`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`fonte_${index}_valor`]}</p>
                      )}
                      {fonte.creditoId && (
                        <p className="text-xs text-gray-500 mt-1">
                          Saldo disponível: {obterSaldoDisponivel(fonte.creditoId).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Visualização do Total */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Valor Total da Despesa:</span>
                <span className="text-lg font-bold text-blue-600">
                  {valorTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </span>
              </div>
              {errors.valorTotal && (
                <p className="text-red-500 text-sm mt-1">{errors.valorTotal}</p>
              )}
            </div>
          </div>

          {/* Seção Informações Complementares */}
          {formData.status !== 'Planejado' && (
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informações de Empenho</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Empenho *
                  </label>
                  <input
                    type="date"
                    value={formData.dataEmpenho}
                    onChange={(e) => handleInputChange('dataEmpenho', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.dataEmpenho ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.dataEmpenho && (
                    <p className="text-red-500 text-sm mt-1">{errors.dataEmpenho}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nota de Empenho *
                  </label>
                  <input
                    type="text"
                    value={formData.notaEmpenho}
                    onChange={(e) => handleInputChange('notaEmpenho', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.notaEmpenho ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: 2024NE00123"
                  />
                  {errors.notaEmpenho && (
                    <p className="text-red-500 text-sm mt-1">{errors.notaEmpenho}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {formData.status === 'Pago' && (
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informações de Pagamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Pagamento *
                  </label>
                  <input
                    type="date"
                    value={formData.dataPagamento}
                    onChange={(e) => handleInputChange('dataPagamento', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.dataPagamento ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.dataPagamento && (
                    <p className="text-red-500 text-sm mt-1">{errors.dataPagamento}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordem Bancária *
                  </label>
                  <input
                    type="text"
                    value={formData.ordemBancaria}
                    onChange={(e) => handleInputChange('ordemBancaria', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.ordemBancaria ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: 2024OB45678"
                  />
                  {errors.ordemBancaria && (
                    <p className="text-red-500 text-sm mt-1">{errors.ordemBancaria}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Outras Informações */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Outras Informações</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Prestação de Contas
                </label>
                <input
                  type="date"
                  value={formData.dataPrestacaoContas}
                  onChange={(e) => handleInputChange('dataPrestacaoContas', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Informações da Prestação de Contas
                </label>
                <input
                  type="text"
                  value={formData.prestacaoContasInfo}
                  onChange={(e) => handleInputChange('prestacaoContasInfo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Observações sobre a prestação de contas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Associada *
                </label>
                <input
                  type="text"
                  value={formData.metaAssociada}
                  onChange={(e) => handleInputChange('metaAssociada', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.metaAssociada ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: meta_01"
                />
                {errors.metaAssociada && (
                  <p className="text-red-500 text-sm mt-1">{errors.metaAssociada}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ação Associada *
                </label>
                <input
                  type="text"
                  value={formData.acaoAssociada}
                  onChange={(e) => handleInputChange('acaoAssociada', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.acaoAssociada ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: acao_01"
                />
                {errors.acaoAssociada && (
                  <p className="text-red-500 text-sm mt-1">{errors.acaoAssociada}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Despesa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}