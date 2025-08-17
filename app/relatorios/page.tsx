"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card } from "@/components/ui/card";
import { useDescentralizacoes } from "@/hooks/use-descentralizacoes";
import { useDespesas } from "@/hooks/use-despesas";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Filter, FileText, Edit2, X, Download } from "lucide-react";
import type { DespesaWithCreditos, CreditoWithCalculations, FonteDeRecurso } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

interface RelatorioItem {
  id: string;
  comprovanteDespesa: string;
  especificacao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  destinacaoPosExecucao: string;
  originalData: {
    despesa: DespesaWithCreditos;
    fonte: FonteDeRecurso;
    credito: CreditoWithCalculations;
  };
}

interface FiltroFormData {
  dataInicio: string;
  dataFim: string;
  descentralizacaoCredito: string;
  naturezaDespesa: 'todos' | 'investimento' | 'custeio';
  statusFinanceiro: 'empenhado' | 'liquidado';
}

export default function RelatoriosPage() {
  const { descentralizacoes, descentralizacoesWithCalculations } = useDescentralizacoes();
  const { despesasWithCredits } = useDespesas();
  
  const [filtros, setFiltros] = useState<FiltroFormData>({
    dataInicio: '',
    dataFim: '',
    descentralizacaoCredito: '',
    naturezaDespesa: 'todos',
    statusFinanceiro: 'empenhado'
  });
  
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [relatorioItems, setRelatorioItems] = useState<RelatorioItem[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  const handleInputChange = (field: keyof FiltroFormData, value: string) => {
    setFiltros(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return filtros.descentralizacaoCredito !== '';
  };

  const filtrarDespesas = () => {
    setLoading(true);
    try {
      const creditoSelecionado = descentralizacoesWithCalculations.find(
        c => c.id === filtros.descentralizacaoCredito
      );
      
      if (!creditoSelecionado) {
        alert('Descentralização de crédito não encontrada');
        return;
      }

      let despesasFiltradas = despesasWithCredits.filter(despesa => {
        // Verificar se a despesa tem fonte de recurso vinculada ao crédito selecionado
        const temFonteDoCredito = despesa.fontesDeRecurso.some(fonte => 
          fonte.creditoId === filtros.descentralizacaoCredito
        );
        
        if (!temFonteDoCredito) return false;

        // Filtrar por natureza da despesa baseado na própria despesa
        if (filtros.naturezaDespesa === 'investimento' && !despesa.natureza?.startsWith('I')) {
          return false;
        }
        if (filtros.naturezaDespesa === 'custeio' && !despesa.natureza?.startsWith('C')) {
          return false;
        }

        // Filtrar por status financeiro
        if (filtros.statusFinanceiro === 'empenhado' && despesa.status === 'Planejado') {
          return false;
        }
        if (filtros.statusFinanceiro === 'liquidado' && 
            !['Liquidado', 'Pago'].includes(despesa.status)) {
          return false;
        }

        // Filtrar por período (se especificado)
        if (filtros.dataInicio && filtros.dataFim) {
          const temDataNoPeriodo = despesa.fontesDeRecurso.some(fonte => {
            const dataReferencia = filtros.statusFinanceiro === 'empenhado' 
              ? fonte.dataEmpenho 
              : fonte.dataPagamento;
            
            return dataReferencia && 
              dataReferencia >= filtros.dataInicio && 
              dataReferencia <= filtros.dataFim;
          });
          
          if (!temDataNoPeriodo) return false;
        }

        return true;
      });

      // Transformar em itens do relatório
      const items: RelatorioItem[] = [];
      
      despesasFiltradas.forEach(despesa => {
        despesa.fontesDeRecurso.forEach(fonte => {
          if (fonte.creditoId === filtros.descentralizacaoCredito) {
            const credito = descentralizacoesWithCalculations.find(c => c.id === fonte.creditoId)!;
            
            items.push({
              id: `${despesa.id}-${fonte.id}`,
              comprovanteDespesa: despesa.processoSEI,
              especificacao: despesa.objeto,
              quantidade: fonte.quantidade || 1,
              valorUnitario: fonte.valorUnitario || fonte.valorUtilizado,
              valorTotal: fonte.valorUtilizado,
              destinacaoPosExecucao: 'Executante',
              originalData: { despesa, fonte, credito }
            });
          }
        });
      });

      setRelatorioItems(items);
      setShowModal(true);
    } catch (error) {
      console.error('Erro ao filtrar despesas:', error);
      alert('Erro ao filtrar despesas');
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (itemId: string, field: string, value: string) => {
    setRelatorioItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, [field]: value }
        : item
    ));
  };

  const calcularSubtotal = () => {
    return relatorioItems.reduce((total, item) => total + item.valorTotal, 0);
  };

  const gerarDocumentoWord = () => {
    const creditoSelecionado = descentralizacoesWithCalculations.find(
      c => c.id === filtros.descentralizacaoCredito
    );
    
    const subtotal = calcularSubtotal();

    // Criar linhas da tabela
    const tableRows = [
      // Cabeçalho
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "COMPROVANTE DE DESPESA", alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: "ESPECIFICAÇÃO", alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: "QUANTIDADE", alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: "VALOR UNITÁRIO", alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: "VALOR TOTAL", alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: "DESTINAÇÃO PÓS EXECUÇÃO", alignment: AlignmentType.CENTER })] }),
        ]
      }),
      // Dados
      ...relatorioItems.map(item => new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: item.comprovanteDespesa, alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: item.especificacao, alignment: AlignmentType.LEFT })] }),
          new TableCell({ children: [new Paragraph({ text: item.quantidade.toString(), alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: formatCurrency(item.valorUnitario), alignment: AlignmentType.RIGHT })] }),
          new TableCell({ children: [new Paragraph({ text: formatCurrency(item.valorTotal), alignment: AlignmentType.RIGHT })] }),
          new TableCell({ children: [new Paragraph({ text: item.destinacaoPosExecucao, alignment: AlignmentType.CENTER })] }),
        ]
      })),
      // Subtotal
      new TableRow({
        children: [
          new TableCell({ 
            children: [new Paragraph({ 
              children: [new TextRun({ text: "SUBTOTAL OU TOTAL", bold: true })], 
              alignment: AlignmentType.CENTER 
            })],
            columnSpan: 4
          }),
          new TableCell({ children: [new Paragraph({ 
            children: [new TextRun({ text: formatCurrency(subtotal), bold: true })], 
            alignment: AlignmentType.RIGHT 
          })] }),
          new TableCell({ children: [new Paragraph({ text: "", alignment: AlignmentType.CENTER })] }),
        ]
      })
    ];

    return new Document({
      sections: [{
        properties: {},
        children: [
          // Cabeçalho
          new Paragraph({
            text: "🇧🇷",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "GOVERNO DO ESTADO DO RIO DE JANEIRO",
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "SECRETARIA DE ESTADO DE DEFESA CIVIL",
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "CORPO DE BOMBEIROS MILITAR DO ESTADO DO RIO DE JANEIRO",
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "PRESTAÇÃO DE CONTAS DE CONVÊNIO",
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "RELATÓRIO DE EXECUÇÃO FÍSICO-FINANCEIRA",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          // Informações do crédito
          new Paragraph({
            children: [
              new TextRun({ text: "Descentralização de Crédito: ", bold: true }),
              new TextRun({ text: creditoSelecionado?.creditoCodigo || '' })
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Naturezas das Despesas: ", bold: true }),
              new TextRun({ text: relatorioItems.length > 0 ? [...new Set(relatorioItems.map(item => item.originalData.despesa.natureza))].join(', ') : 'N/A' })
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Período: ", bold: true }),
              new TextRun({ text: filtros.dataInicio ? `${filtros.dataInicio} a ${filtros.dataFim}` : 'Todos os períodos' })
            ],
            spacing: { after: 400 }
          }),

          // Tabela
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: tableRows,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            }
          }),

          // Rodapé
          new Paragraph({
            children: [
              new TextRun({ text: "Local e Data: ", bold: true }),
              new TextRun({ text: `Rio de Janeiro, ${new Date().toLocaleDateString('pt-BR')}` })
            ],
            spacing: { before: 800, after: 1200 }
          }),

          // Assinaturas
          new Paragraph({
            text: "",
            spacing: { after: 800 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "________________________________                    ________________________________" })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "ALEXANDRE PADILLA", bold: true }),
              new TextRun({ text: "                                                CHARBIO MARCHETT", bold: true })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Coordenador Geral                                                    Diretor Técnico",
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "SUAD CBMERJ                                                         SUAD CBMERJ",
            alignment: AlignmentType.CENTER
          })
        ]
      }]
    });
  };

  const exportarParaWord = async () => {
    try {
      setLoading(true);
      const document = gerarDocumentoWord();
      
      // Gerar o arquivo DOCX
      const buffer = await Packer.toBuffer(document);

      // Fazer download do arquivo
      const creditoSelecionado = descentralizacoesWithCalculations.find(
        c => c.id === filtros.descentralizacaoCredito
      );
      const filename = `Relatorio_Prestacao_Contas_${creditoSelecionado?.creditoCodigo?.replace(/[^a-zA-Z0-9]/g, '_') || 'DC'}_${new Date().toISOString().split('T')[0]}.docx`;
      
      saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), filename);
      
      setShowModal(false);
      alert('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      alert('Erro ao exportar relatório para Word');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            {/* Cabeçalho */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gerador de Relatório de Prestação de Contas
              </h1>
              <p className="text-gray-600">
                Filtre despesas, pré-visualize e exporte para Word
              </p>
            </div>

            {/* Painel de Filtros */}
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filtros do Relatório
              </h2>
              
              <div className="space-y-4">
                {/* Primeira linha: Período */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início (Opcional)
                    </label>
                    <input
                      type="date"
                      value={filtros.dataInicio}
                      onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Fim (Opcional)
                    </label>
                    <input
                      type="date"
                      value={filtros.dataFim}
                      onChange={(e) => handleInputChange('dataFim', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Segunda linha: DC */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descentralização de Crédito (DC) *
                  </label>
                  <select
                    value={filtros.descentralizacaoCredito}
                    onChange={(e) => handleInputChange('descentralizacaoCredito', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione uma descentralização</option>
                    {descentralizacoesWithCalculations
                      .filter(credito => credito && credito.id && credito.creditoCodigo)
                      .map(credito => (
                      <option key={credito.id} value={credito.id}>
                        {credito.anoExercicio} - {credito.creditoCodigo} - {formatCurrency(credito.valorGlobal || 0)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Terceira linha: Natureza e Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Natureza da Despesa
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'todos', label: 'Todos' },
                        { value: 'investimento', label: 'Investimento (Naturezas que começam com I)' },
                        { value: 'custeio', label: 'Custeio (Naturezas que começam com C)' }
                      ].map(option => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            name="naturezaDespesa"
                            value={option.value}
                            checked={filtros.naturezaDespesa === option.value}
                            onChange={(e) => handleInputChange('naturezaDespesa', e.target.value as any)}
                            className="mr-2"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Financeiro
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'empenhado', label: 'Empenhado' },
                        { value: 'liquidado', label: 'Liquidado' }
                      ].map(option => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            name="statusFinanceiro"
                            value={option.value}
                            checked={filtros.statusFinanceiro === option.value}
                            onChange={(e) => handleInputChange('statusFinanceiro', e.target.value as any)}
                            className="mr-2"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de Ação */}
              <div className="mt-6">
                <button
                  onClick={filtrarDespesas}
                  disabled={!isFormValid() || loading}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  {loading ? 'Gerando...' : 'Gerar Relatório'}
                </button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Modal de Pré-visualização */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-7xl h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Pré-visualização do Relatório de Prestação de Contas
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {/* Cabeçalho do Documento */}
            <div className="text-center mb-6 p-4 border-b">
              <div className="text-4xl mb-2">🇧🇷</div>
              <h1 className="text-lg font-bold">GOVERNO DO ESTADO DO RIO DE JANEIRO</h1>
              <h2 className="text-base">SECRETARIA DE ESTADO DE DEFESA CIVIL</h2>
              <h2 className="text-base">CORPO DE BOMBEIROS MILITAR DO ESTADO DO RIO DE JANEIRO</h2>
              <h1 className="text-lg font-bold mt-4">PRESTAÇÃO DE CONTAS DE CONVÊNIO</h1>
              <h2 className="text-base">RELATÓRIO DE EXECUÇÃO FÍSICO-FINANCEIRA</h2>
            </div>

            {/* Informações do Crédito */}
            <div className="mb-4 text-sm">
              {(() => {
                const creditoSelecionado = descentralizacoesWithCalculations.find(
                  c => c.id === filtros.descentralizacaoCredito
                );
                return (
                  <>
                    <p><strong>Descentralização de Crédito:</strong> {creditoSelecionado?.creditoCodigo || ''}</p>
                    <p><strong>Naturezas das Despesas:</strong> {relatorioItems.length > 0 ? [...new Set(relatorioItems.map(item => item.originalData.despesa.natureza))].join(', ') : 'N/A'}</p>
                    <p><strong>Período:</strong> {filtros.dataInicio ? `${filtros.dataInicio} a ${filtros.dataFim}` : 'Todos os períodos'}</p>
                  </>
                );
              })()}
            </div>

            {/* Tabela Editável */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 border text-center font-medium">COMPROVANTE DE DESPESA</th>
                    <th className="px-3 py-2 border text-center font-medium">ESPECIFICAÇÃO</th>
                    <th className="px-3 py-2 border text-center font-medium">QUANTIDADE</th>
                    <th className="px-3 py-2 border text-center font-medium">VALOR UNITÁRIO</th>
                    <th className="px-3 py-2 border text-center font-medium">VALOR TOTAL</th>
                    <th className="px-3 py-2 border text-center font-medium">DESTINAÇÃO PÓS EXECUÇÃO</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorioItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 border text-center">
                        <input
                          type="text"
                          value={item.comprovanteDespesa}
                          onChange={(e) => handleEditItem(item.id, 'comprovanteDespesa', e.target.value)}
                          className="w-full text-center bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded"
                        />
                      </td>
                      <td className="px-3 py-2 border">
                        {item.especificacao}
                      </td>
                      <td className="px-3 py-2 border text-center">
                        {item.quantidade}
                      </td>
                      <td className="px-3 py-2 border text-right">
                        {formatCurrency(item.valorUnitario)}
                      </td>
                      <td className="px-3 py-2 border text-right">
                        {formatCurrency(item.valorTotal)}
                      </td>
                      <td className="px-3 py-2 border text-center">
                        <select
                          value={item.destinacaoPosExecucao}
                          onChange={(e) => handleEditItem(item.id, 'destinacaoPosExecucao', e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded"
                        >
                          <option value="Executante">Executante</option>
                          <option value="Concedente">Concedente</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold">
                    <td colSpan={4} className="px-3 py-2 border text-center">
                      SUBTOTAL OU TOTAL
                    </td>
                    <td className="px-3 py-2 border text-right">
                      {formatCurrency(calcularSubtotal())}
                    </td>
                    <td className="px-3 py-2 border"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Rodapé do Documento */}
            <div className="mt-8 text-sm">
              <p><strong>Local e Data:</strong> Rio de Janeiro, {new Date().toLocaleDateString('pt-BR')}</p>
              
              <div className="flex justify-between mt-12">
                <div className="text-center">
                  <div className="border-b border-black w-48 mb-2 pb-8"></div>
                  <p className="font-bold">ALEXANDRE PADILLA</p>
                  <p>Coordenador Geral</p>
                  <p>SUAD CBMERJ</p>
                </div>
                
                <div className="text-center">
                  <div className="border-b border-black w-48 mb-2 pb-8"></div>
                  <p className="font-bold">CHARBIO MARCHETT</p>
                  <p>Diretor Técnico</p>
                  <p>SUAD CBMERJ</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé do Modal */}
          <div className="flex justify-between items-center pt-4 border-t bg-gray-50 px-6 py-4">
            <div>
              <p className="text-sm text-gray-600">
                <strong>Subtotal:</strong> {formatCurrency(calcularSubtotal())}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Fechar
              </button>
              <button
                onClick={exportarParaWord}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                {loading ? 'Exportando...' : 'Salvar e Exportar para Word'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}