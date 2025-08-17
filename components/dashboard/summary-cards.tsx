"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { 
  DollarSign, 
  TrendingDown, 
  Wallet,
  FileText,
  ArrowUpCircle,
  Target,
  CheckCircle,
  Activity
} from "lucide-react";

interface SummaryCardsProps {
  valorGlobalConsolidado: number;
  valorEmpenhado: number;
  valorLiquidado: number;
  valorPago: number;
  saldoDisponivel: number;
  percentualEmpenhado: number;
  percentualLiquidado: number;
  totalCreditos: number;
}

interface ProgressBarProps {
  percentage: number;
  color: string;
}

function ProgressBar({ percentage, color }: ProgressBarProps) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
      <div 
        className={`h-2 rounded-full transition-all duration-500 ease-out ${color}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
}

export function SummaryCards({ 
  valorGlobalConsolidado, 
  valorEmpenhado,
  valorLiquidado,
  valorPago,
  saldoDisponivel, 
  percentualEmpenhado,
  percentualLiquidado,
  totalCreditos 
}: SummaryCardsProps) {
  const mainCards = [
    {
      title: "Valor Global Consolidado",
      value: formatCurrency(valorGlobalConsolidado),
      icon: DollarSign,
      description: "Total de todos os créditos",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100"
    },
    {
      title: "Saldo Disponível",
      value: formatCurrency(saldoDisponivel),
      icon: Wallet,
      description: "Valor disponível para uso",
      color: "text-green-600",
      bgColor: "bg-green-50",
      iconBg: "bg-green-100"
    },
    {
      title: "Total de Créditos",
      value: totalCreditos.toString(),
      icon: FileText,
      description: "Número de descentralizações",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100"
    }
  ];

  const metricsCards = [
    {
      title: "Controle de Empenho",
      subtitle: "Do valor global",
      empenhado: formatCurrency(valorEmpenhado),
      disponivel: formatCurrency(saldoDisponivel),
      percentage: percentualEmpenhado,
      icon: Target,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      iconBg: "bg-orange-100",
      progressColor: "bg-orange-500"
    },
    {
      title: "Execução Financeira",
      subtitle: "Do valor empenhado",
      empenhado: formatCurrency(valorLiquidado),
      disponivel: formatCurrency(valorEmpenhado - valorLiquidado),
      percentage: percentualLiquidado,
      icon: Activity,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      iconBg: "bg-indigo-100",
      progressColor: "bg-indigo-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cards principais */}
      <div className="grid gap-4 md:grid-cols-3">
        {mainCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className={`${card.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {card.title}
                </CardTitle>
                <div className={`${card.iconBg} p-2 rounded-full`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cards de métricas de controle */}
      <div className="grid gap-4 md:grid-cols-2">
        {metricsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className={`${card.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    {card.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{card.subtitle}</p>
                </div>
                <div className={`${card.iconBg} p-3 rounded-full`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {index === 0 ? "Empenhado" : "Liquidado"}
                    </span>
                    <span className={`text-lg font-bold ${card.color}`}>
                      {card.empenhado}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {index === 0 ? "Disponível" : "Pendente"}
                    </span>
                    <span className="text-lg font-semibold text-gray-600">
                      {card.disponivel}
                    </span>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Progresso</span>
                      <span className={`text-sm font-bold ${card.color}`}>
                        {card.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <ProgressBar percentage={card.percentage} color={card.progressColor} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}