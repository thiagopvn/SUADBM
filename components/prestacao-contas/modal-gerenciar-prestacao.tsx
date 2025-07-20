'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Save, 
  X,
  Package,
  Calendar,
  AlertCircle
} from 'lucide-react';
import type { PrestacaoContas, Despesa } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';

interface ModalGerenciarPrestacaoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prestacao: PrestacaoContas | null;
  despesasCredito: Despesa[];
  onSalvar: (prestacaoId: string, dados: { processoSEI: string; observacoes?: string; despesasVinculadas?: string[] }) => Promise<void>;
}

export function ModalGerenciarPrestacao({ 
  open, 
  onOpenChange, 
  prestacao, 
  despesasCredito,
  onSalvar 
}: ModalGerenciarPrestacaoProps) {
  const [processoSEI, setProcessoSEI] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [despesasSelecionadas, setDespesasSelecionadas] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (prestacao) {
      setProcessoSEI(prestacao.processoSEI || '');
      setObservacoes(prestacao.observacoes || '');
      setDespesasSelecionadas(prestacao.despesasVinculadas || []);
      setErro('');
    }
  }, [prestacao]);

  const handleSalvar = async () => {
    if (!prestacao) return;

    if (prestacao.status !== 'Entregue' && !processoSEI.trim()) {
      setErro('O número do processo SEI é obrigatório');
      return;
    }

    setSalvando(true);
    setErro('');

    try {
      await onSalvar(prestacao.id, {
        processoSEI: processoSEI.trim(),
        observacoes: observacoes.trim(),
        despesasVinculadas: despesasSelecionadas
      });
      onOpenChange(false);
    } catch (err) {
      setErro('Erro ao salvar as alterações');
      console.error(err);
    } finally {
      setSalvando(false);
    }
  };

  const toggleDespesa = (despesaId: string) => {
    setDespesasSelecionadas(prev => 
      prev.includes(despesaId) 
        ? prev.filter(id => id !== despesaId)
        : [...prev, despesaId]
    );
  };

  const despesasElegiveis = despesasCredito.filter(d => 
    d.status === 'Pago' || d.status === 'Liquidado'
  );

  if (!prestacao) return null;

  const isEntregue = prestacao.status === 'Entregue';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Prestação de Contas</DialogTitle>
          <DialogDescription>
            {prestacao.periodoLabel} - Prazo: {formatDate(prestacao.prazoFinal)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status atual */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            {prestacao.status === 'Entregue' ? (
              <Badge className="bg-green-100 text-green-800">Entregue</Badge>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
            )}
          </div>

          {/* Formulário de entrega */}
          {!isEntregue && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Marcar como Entregue
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="processoSEI" className="block text-sm font-medium text-gray-700 mb-1">
                    Nº do Processo SEI *
                  </label>
                  <input
                    id="processoSEI"
                    type="text"
                    value={processoSEI}
                    onChange={(e) => setProcessoSEI(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: SEI-270042/000123/2024"
                  />
                </div>

                <div>
                  <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
                    Observações (opcional)
                  </label>
                  <textarea
                    id="observacoes"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Adicione observações relevantes..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Informações de entrega (se já entregue) */}
          {isEntregue && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Processo SEI:</span>
                <span className="text-sm">{prestacao.processoSEI}</span>
              </div>
              {prestacao.dataEntrega && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Data de Entrega:</span>
                  <span className="text-sm">{formatDate(prestacao.dataEntrega)}</span>
                </div>
              )}
              {prestacao.observacoes && (
                <div className="mt-2">
                  <span className="text-sm font-medium">Observações:</span>
                  <p className="text-sm text-gray-600 mt-1">{prestacao.observacoes}</p>
                </div>
              )}
            </div>
          )}

          {/* Lista de despesas para vincular */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Despesas Vinculadas ({despesasSelecionadas.length})
            </h3>
            
            {despesasElegiveis.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                Nenhuma despesa elegível encontrada. Apenas despesas com status &ldquo;Liquidado&rdquo; ou &ldquo;Pago&rdquo; podem ser vinculadas.
              </p>
            ) : (
              <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                {despesasElegiveis.map((despesa) => (
                  <label
                    key={despesa.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={despesasSelecionadas.includes(despesa.id)}
                      onChange={() => toggleDespesa(despesa.id)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      disabled={isEntregue}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{despesa.processoSEI}</span>
                        <Badge className={
                          despesa.status === 'Pago' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }>
                          {despesa.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">{despesa.objeto}</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatCurrency(despesa.valorTotal)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
              {erro}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={salvando}
          >
            <X className="w-4 h-4 mr-2 inline" />
            Cancelar
          </button>
          
          {!isEntregue && (
            <button
              onClick={handleSalvar}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              disabled={salvando}
            >
              <Save className="w-4 h-4 mr-2 inline" />
              {salvando ? 'Salvando...' : 'Salvar e Marcar como Entregue'}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}