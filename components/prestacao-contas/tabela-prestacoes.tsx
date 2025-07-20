'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  FileCheck, 
  AlertCircle, 
  Clock,
  FileText,
  Package
} from 'lucide-react';
import type { PrestacaoContas } from '@/types';
import { formatDate } from '@/lib/utils';

interface TabelaPrestacoesProps {
  prestacoes: PrestacaoContas[];
  onGerenciar: (prestacao: PrestacaoContas) => void;
}

export function TabelaPrestacoes({ prestacoes, onGerenciar }: TabelaPrestacoesProps) {
  const getStatusBadge = (prestacao: PrestacaoContas) => {
    const hoje = new Date().toISOString().split('T')[0];
    
    if (prestacao.status === 'Entregue') {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <FileCheck className="w-3 h-3 mr-1" />
          Entregue
        </Badge>
      );
    } else if (prestacao.status === 'Pendente' && hoje > prestacao.prazoFinal) {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          Em Atraso
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pendente
        </Badge>
      );
    }
  };

  const formatarDataAbertura = (prestacao: PrestacaoContas) => {
    // Calcula a data de abertura (4 meses antes do prazo)
    const prazo = new Date(prestacao.prazoFinal);
    const abertura = new Date(prazo);
    abertura.setMonth(abertura.getMonth() - 4);
    return formatDate(abertura.toISOString());
  };

  if (prestacoes.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Nenhuma prestação de contas encontrada para este crédito.</p>
        <p className="text-sm text-gray-400 mt-2">As prestações serão geradas automaticamente após o lançamento do crédito.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Período
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data de Abertura
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prazo Final
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Processo SEI
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Itens Vinculados
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {prestacoes.map((prestacao) => (
            <tr key={prestacao.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {prestacao.periodoLabel}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatarDataAbertura(prestacao)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(prestacao.prazoFinal)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(prestacao)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {prestacao.processoSEI ? (
                  <div className="flex items-center gap-1 text-gray-900">
                    <FileText className="w-4 h-4 text-gray-400" />
                    {prestacao.processoSEI}
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className={prestacao.despesasVinculadas.length > 0 ? "text-gray-900" : "text-gray-400"}>
                    {prestacao.despesasVinculadas.length} {prestacao.despesasVinculadas.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onGerenciar(prestacao)}
                  className="text-primary-600 hover:text-primary-900 font-medium"
                >
                  Gerenciar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}