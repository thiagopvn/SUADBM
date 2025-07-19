'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Credito } from '@/types';

interface CreditoFormProps {
  onSubmit: (credito: Omit<Credito, 'id'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<Credito>;
  isEditing?: boolean;
}

export function CreditoForm({ onSubmit, onCancel, initialData, isEditing = false }: CreditoFormProps) {
  const [formData, setFormData] = useState({
    creditoCodigo: initialData?.creditoCodigo || '',
    anoExercicio: initialData?.anoExercicio || new Date().getFullYear(),
    valorGlobal: initialData?.valorGlobal || 0,
    acaoEixo: initialData?.acaoEixo || '',
    natureza: initialData?.natureza || '',
    saldoAtual: initialData?.saldoAtual || 0,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      const creditoData: Omit<Credito, 'id'> = {
        ...formData,
        saldoAtual: isEditing ? formData.saldoAtual : formData.valorGlobal,
        despesas: initialData?.despesas || {},
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
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
              Ação/Eixo *
            </label>
            <input
              type="text"
              value={formData.acaoEixo}
              onChange={(e) => handleInputChange('acaoEixo', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.acaoEixo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: VALORIZAÇÃO DOS PROFISSIONAIS DE SEGURANÇA PÚBLICA"
            />
            {errors.acaoEixo && (
              <p className="text-red-500 text-sm mt-1">{errors.acaoEixo}</p>
            )}
          </div>

          <div>
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

          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saldo Atual (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.saldoAtual}
                onChange={(e) => handleInputChange('saldoAtual', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          )}

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