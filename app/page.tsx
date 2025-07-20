"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { LineChartComponent } from "@/components/charts/line-chart";
import { PieChartComponent } from "@/components/charts/pie-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { useCreditos } from "@/hooks/use-creditos";
import { useDespesas } from "@/hooks/use-despesas";
import { firebaseService } from "@/lib/firebase-service";
import { FirebaseTest } from "@/components/debug/FirebaseTest";
import type { DashboardData, DespesaWithCreditos } from "@/types";

export default function DashboardPage() {
  const { creditosWithCalculations, loading: loadingCreditos, error: errorCreditos } = useCreditos();
  const { despesasWithCredits, loading: loadingDespesas } = useDespesas();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    valorGlobalConsolidado: 0,
    valorEmpenhado: 0,
    valorLiquidadoPago: 0,
    saldoDisponivel: 0,
    totalCreditos: 0,
    chartData: [],
    pieData: [],
    recentDespesas: []
  });
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await firebaseService.getDashboardData(selectedYear);
        
        // Data for line chart (evolution by year)
        const chartData = creditosWithCalculations
          .filter(c => !selectedYear || c.anoExercicio === selectedYear)
          .map(c => ({
            ano: c.anoExercicio,
            valor: c.valorGlobal
          }))
          .sort((a, b) => a.ano - b.ano);
        
        // Data for pie chart (distribution by action/axis)
        const acaoMap = new Map();
        creditosWithCalculations
          .filter(c => !selectedYear || c.anoExercicio === selectedYear)
          .forEach(c => {
            const current = acaoMap.get(c.acaoEixo) || 0;
            acaoMap.set(c.acaoEixo, current + c.valorGlobal);
          });
        
        const pieData = Array.from(acaoMap.entries()).map(([name, value]) => ({
          name: name.length > 30 ? name.substring(0, 30) + '...' : name,
          value
        }));
        
        // Recent expenses
        const recentDespesas = despesasWithCredits
          .filter(d => !selectedYear || d.creditosAssociados.some(c => 
            creditosWithCalculations.find(credito => credito.id === c.creditoId)?.anoExercicio === selectedYear
          ))
          .sort((a, b) => {
            const dateA = a.dataPagamento || a.dataEmpenho || '1900-01-01';
            const dateB = b.dataPagamento || b.dataEmpenho || '1900-01-01';
            return new Date(dateB).getTime() - new Date(dateA).getTime();
          })
          .slice(0, 5);
        
        setDashboardData({
          ...data,
          chartData,
          pieData,
          recentDespesas
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    if (creditosWithCalculations.length > 0) {
      loadDashboardData();
    }
  }, [creditosWithCalculations, despesasWithCredits, selectedYear]);

  const years = [...new Set(creditosWithCalculations.map(c => c.anoExercicio))].sort((a, b) => b - a);

  // Loading state
  if (loadingCreditos || loadingDespesas) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">
                Carregando dashboard...
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (errorCreditos) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center items-center h-64">
              <div className="text-red-500">
                Erro ao carregar dados: {errorCreditos}
              </div>
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
              Dashboard - Visão Geral
            </h1>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filtro por ano:</label>
              <select
                value={selectedYear || "todos"}
                onChange={(e) => setSelectedYear(e.target.value === "todos" ? undefined : parseInt(e.target.value))}
                className="border rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos os anos</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          
          <FirebaseTest />
          
          <SummaryCards
            valorGlobalConsolidado={dashboardData.valorGlobalConsolidado}
            valorEmpenhado={dashboardData.valorEmpenhado}
            valorLiquidadoPago={dashboardData.valorLiquidadoPago}
            saldoDisponivel={dashboardData.saldoDisponivel}
            totalCreditos={dashboardData.totalCreditos}
          />
          
          <div className="grid gap-6 mt-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Valor Global por Ano</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChartComponent data={dashboardData.chartData} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Ação/Eixo</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChartComponent data={dashboardData.pieData} />
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Últimas Despesas Adicionadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentDespesas.map((despesa) => (
                  <div key={despesa.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{despesa.objeto}</p>
                        <Badge className={getStatusColor(despesa.status)}>
                          {despesa.status}
                        </Badge>
                        {despesa.fontesDeRecurso.length > 1 && (
                          <Badge variant="secondary">
                            {despesa.fontesDeRecurso.length} créditos
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {despesa.processoSEI} • Créditos: {despesa.creditosAssociados.map(c => c.creditoCodigo).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(despesa.valorTotal)}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(despesa.dataPagamento || despesa.dataEmpenho)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {dashboardData.recentDespesas.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma despesa encontrada
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}