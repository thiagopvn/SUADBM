'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Credito, OrigemCredito } from '@/types';

interface CreditoFormProps {
  onSubmit: (credito: Omit<Credito, 'id'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<Credito>;
  isEditing?: boolean;
  creditosAnteriores?: Credito[]; // Para selecionar quando origem for "Restos"
}

export function CreditoForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  isEditing = false, 
  creditosAnteriores = [] 
}: CreditoFormProps) {
  const [formData, setFormData] = useState({
    creditoCodigo: initialData?.creditoCodigo || '',
    anoExercicio: initialData?.anoExercicio || new Date().getFullYear(),
    valorGlobal: initialData?.valorGlobal || 0,
    acaoEixo: initialData?.acaoEixo || '',
    natureza: initialData?.natureza || '',
    dataLancamento: initialData?.dataLancamento || new Date().toISOString().split('T')[0],
  });

  // Gerenciar origem do crédito
  const [tipoOrigemSelecionado, setTipoOrigemSelecionado] = useState<'Original' | 'Restos'>(
    initialData?.origem?.tipo || 'Original'
  );
  
  const [origemOriginal, setOrigemOriginal] = useState<string>(
    initialData?.origem?.tipo === 'Original' ? initialData.origem.descricao : 'Descentralização de crédito original para o ano vigente vindo de Brasília'
  );
  
  const [creditosAnterioresSelecionados, setCreditosAnterioresSelecionados] = useState<string[]>(
    initialData?.origem?.tipo === 'Restos' ? initialData.origem.creditosAnteriores : []
  );

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Eixos disponíveis conforme especificação
  const eixosDisponiveis = [
    'Valorização dos Profissionais de Segurança Pública (VPS)',
    'Enfrentamento à Criminalidade Violenta (ECV)',
    'Fortalecimento das Instituições de Segurança Pública e Defesa Social (FISPDS)',
    'Redução de Mortes Violentas Intencionais e combate ao crime organizado (RMVI)',
    'Enfrentamento à Violência contra a Mulher (EVM)',
    'Melhoria da Qualidade de Vida dos Profissionais de Segurança Pública (MQV)'
  ];

  const adicionarCreditoAnterior = () => {
    setCreditosAnterioresSelecionados([...creditosAnterioresSelecionados, '']);
  };

  const removerCreditoAnterior = (index: number) => {
    setCreditosAnterioresSelecionados(
      creditosAnterioresSelecionados.filter((_, i) => i !== index)
    );
  };

  const atualizarCreditoAnterior = (index: number, creditoId: string) => {
    const novosCreditos = [...creditosAnterioresSelecionados];
    novosCreditos[index] = creditoId;
    setCreditosAnterioresSelecionados(novosCreditos);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.creditoCodigo.trim()) {
      newErrors.creditoCodigo = 'Código do crédito é obrigatório';
    }

    if (formData.anoExercicio < 2000 || formData.anoExercicio > 2100) {
      newErrors.anoExercicio = 'Ano do exercício deve estar entre 2000 e 2100';
    }

    if (formData.valorGlobal <= 0) {
      newErrors.valorGlobal = 'Valor global deve ser maior que zero';
    }

    if (!formData.acaoEixo.trim()) {
      newErrors.acaoEixo = 'Ação/Eixo é obrigatório';
    }

    if (!formData.natureza.trim()) {
      newErrors.natureza = 'Natureza é obrigatória';
    }

    if (!formData.dataLancamento) {
      newErrors.dataLancamento = 'Data de lançamento é obrigatória';
    }

    // Validar origem
    if (tipoOrigemSelecionado === 'Original') {
      if (!origemOriginal.trim()) {
        newErrors.origemOriginal = 'Descrição da origem é obrigatória';
      }
    } else if (tipoOrigemSelecionado === 'Restos') {
      if (creditosAnterioresSelecionados.length === 0 || 
          creditosAnterioresSelecionados.some(id => !id.trim())) {
        newErrors.creditosAnteriores = 'Selecione pelo menos um crédito anterior válido';
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
      
      // Construir objeto origem
      const origem: OrigemCredito = tipoOrigemSelecionado === 'Original' 
        ? { tipo: 'Original', descricao: origemOriginal }
        : { tipo: 'Restos', creditosAnteriores: creditosAnterioresSelecionados.filter(id => id.trim()) };

      const creditoData: Omit<Credito, 'id'> = {
        ...formData,
        origem,
        dataLancamento: formData.dataLancamento,
      };
      
      await onSubmit(creditoData);
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
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Editar Crédito' : 'Novo Crédito'}
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
                  Código do Crédito *
                </label>
                <input
                  type="text"
                  value={formData.creditoCodigo}
                  onChange={(e) => handleInputChange('creditoCodigo', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.creditoCodigo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 2024DC00001"
                />
                {errors.creditoCodigo && (
                  <p className="text-red-500 text-sm mt-1">{errors.creditoCodigo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ano do Exercício *
                </label>
                <input
                  type="number"
                  value={formData.anoExercicio}
                  onChange={(e) => handleInputChange('anoExercicio', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.anoExercicio ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="2000"
                  max="2100"
                />
                {errors.anoExercicio && (
                  <p className="text-red-500 text-sm mt-1">{errors.anoExercicio}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Global (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valorGlobal}
                  onChange={(e) => handleInputChange('valorGlobal', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.valorGlobal ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                />
                {errors.valorGlobal && (
                  <p className="text-red-500 text-sm mt-1">{errors.valorGlobal}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Lançamento *
                </label>
                <input
                  type="date"
                  value={formData.dataLancamento}
                  onChange={(e) => handleInputChange('dataLancamento', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.dataLancamento ? 'border-red-500' : 'border-gray-300'
                  }`}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.dataLancamento && (
                  <p className="text-red-500 text-sm mt-1">{errors.dataLancamento}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Esta data inicia o ciclo de prestação de contas a cada 4 meses
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ação/Eixo *
              </label>
              <select
                value={formData.acaoEixo}
                onChange={(e) => handleInputChange('acaoEixo', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.acaoEixo ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione um eixo</option>
                {eixosDisponiveis.map(eixo => (
                  <option key={eixo} value={eixo}>
                    {eixo}
                  </option>
                ))}
              </select>
              {errors.acaoEixo && (
                <p className="text-red-500 text-sm mt-1">{errors.acaoEixo}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Natureza *
              </label>
              <input
                type="text"
                value={formData.natureza}
                onChange={(e) => handleInputChange('natureza', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.natureza ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: I-449000"
              />
              {errors.natureza && (
                <p className="text-red-500 text-sm mt-1">{errors.natureza}</p>
              )}
            </div>
          </div>

          {/* Seção Origem do Crédito */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Origem do Crédito</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Origem *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="Original"
                    checked={tipoOrigemSelecionado === 'Original'}
                    onChange={(e) => setTipoOrigemSelecionado(e.target.value as 'Original')}
                    className="mr-2"
                  />
                  Ano vigente (Original)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="Restos"
                    checked={tipoOrigemSelecionado === 'Restos'}
                    onChange={(e) => setTipoOrigemSelecionado(e.target.value as 'Restos')}
                    className="mr-2"
                  />
                  Anos anteriores (Restos)
                </label>
              </div>
            </div>

            {tipoOrigemSelecionado === 'Original' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição da Origem *
                </label>
                <textarea
                  value={origemOriginal}
                  onChange={(e) => setOrigemOriginal(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.origemOriginal ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Descreva a origem do crédito (ex: descentralização de Brasília)"
                  rows={2}
                />
                {errors.origemOriginal && (
                  <p className="text-red-500 text-sm mt-1">{errors.origemOriginal}</p>
                )}
              </div>
            )}

            {tipoOrigemSelecionado === 'Restos' && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Créditos de Anos Anteriores *
                  </label>
                  <button
                    type="button"
                    onClick={adicionarCreditoAnterior}
                    className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                  >
                    <Plus className="w-3 h-3" />
                    Adicionar
                  </button>
                </div>

                <div className="space-y-2">
                  {creditosAnterioresSelecionados.map((creditoId, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <select
                        value={creditoId}
                        onChange={(e) => atualizarCreditoAnterior(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecione um crédito anterior</option>
                        {creditosAnteriores
                          .filter(c => c.anoExercicio < formData.anoExercicio)
                          .map(credito => (
                            <option key={credito.id} value={credito.id}>
                              {credito.creditoCodigo} ({credito.anoExercicio}) - {credito.valorGlobal.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              })}
                            </option>
                          ))}
                      </select>
                      {creditosAnterioresSelecionados.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removerCreditoAnterior(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {creditosAnterioresSelecionados.length === 0 && (
                  <button
                    type="button"
                    onClick={adicionarCreditoAnterior}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-gray-400 hover:text-gray-700"
                  >
                    Clique para adicionar um crédito anterior
                  </button>
                )}

                {errors.creditosAnteriores && (
                  <p className="text-red-500 text-sm mt-1">{errors.creditosAnteriores}</p>
                )}
              </div>
            )}
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
              {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Crédito'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}