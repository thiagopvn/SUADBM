"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { LineChartComponent } from "@/components/charts/line-chart";
import { PieChartComponent } from "@/components/charts/pie-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getStatusColor, calculateTotalSpent } from "@/lib/utils";
import { useCreditos } from "@/hooks/use-creditos";
import { useFirebaseInit } from "@/hooks/use-firebase-init";
import type { DashboardData, DespesaWithCredito } from "@/types";

export default function DashboardPage() {
  const { initialized, loading: initLoading, error: initError } = useFirebaseInit();
  const { creditos, loading: creditosLoading, error: creditosError } = useCreditos();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalGlobal: 0,
    totalGasto: 0,
    saldoDisponivel: 0,
    totalCreditos: 0,
    chartData: [],
    pieData: [],
    recentDespesas: []
  });

  useEffect(() => {
    if (!initialized || Object.keys(creditos).length === 0) return;
    
    // Process Firebase data
    const creditosList = Object.values(creditos);
    
    // Calculate totals
    const totalGlobal = creditosList.reduce((sum, c) => sum + c.valorGlobal, 0);
    const totalGasto = creditosList.reduce((sum, c) => {
      return sum + calculateTotalSpent(c.despesas || {});
    }, 0);
    const saldoDisponivel = totalGlobal - totalGasto;
    
    // Data for line chart (evolution by year)
    const chartData = creditosList
      .map(c => ({
        ano: c.anoExercicio,
        valor: c.valorGlobal
      }))
      .sort((a, b) => a.ano - b.ano);
    
    // Data for pie chart (distribution by action/axis)
    const acaoMap = new Map();
    creditosList.forEach(c => {
      const current = acaoMap.get(c.acaoEixo) || 0;
      acaoMap.set(c.acaoEixo, current + c.valorGlobal);
    });
    
    const pieData = Array.from(acaoMap.entries()).map(([name, value]) => ({
      name: name.length > 30 ? name.substring(0, 30) + '...' : name,
      value
    }));
    
    // Recent expenses
    const allDespesas: DespesaWithCredito[] = [];
    creditosList.forEach(c => {
      Object.values(c.despesas || {}).forEach((d) => {
        allDespesas.push({
          ...d,
          creditoCodigo: c.creditoCodigo
        });
      });
    });
    
    const recentDespesas = allDespesas
      .sort((a, b) => {
        const dateA = a.dataPagamento || a.dataEmpenho || '1900-01-01';
        const dateB = b.dataPagamento || b.dataEmpenho || '1900-01-01';
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .slice(0, 5);
    
    setDashboardData({
      totalGlobal,
      totalGasto,
      saldoDisponivel,
      totalCreditos: creditosList.length,
      chartData,
      pieData,
      recentDespesas
    });
  }, [initialized, creditos]);

  // Loading state
  if (initLoading || creditosLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">
                {initLoading ? 'Inicializando sistema...' : 'Carregando dashboard...'}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (initError || creditosError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-center items-center h-64">
              <div className="text-red-500">
                Erro ao carregar dados: {initError || creditosError}
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
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Dashboard - Visão Geral
          </h1>
          
          <SummaryCards
            totalGlobal={dashboardData.totalGlobal}
            totalGasto={dashboardData.totalGasto}
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
                      </div>
                      <p className="text-sm text-gray-500">
                        {despesa.processoSEI} • Crédito: {despesa.creditoCodigo}
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
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}