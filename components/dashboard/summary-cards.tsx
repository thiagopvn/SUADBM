"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { 
  DollarSign, 
  TrendingDown, 
  Wallet,
  FileText,
  ArrowUpCircle
} from "lucide-react";

interface SummaryCardsProps {
  valorGlobalConsolidado: number;
  valorEmpenhado: number;
  valorLiquidadoPago: number;
  saldoDisponivel: number;
  totalCreditos: number;
}

export function SummaryCards({ 
  valorGlobalConsolidado, 
  valorEmpenhado,
  valorLiquidadoPago, 
  saldoDisponivel, 
  totalCreditos 
}: SummaryCardsProps) {
  const cards = [
    {
      title: "Valor Global Consolidado",
      value: formatCurrency(valorGlobalConsolidado),
      icon: DollarSign,
      description: "Total de todos os créditos",
      color: "text-blue-600"
    },
    {
      title: "Valor Empenhado",
      value: formatCurrency(valorEmpenhado),
      icon: ArrowUpCircle,
      description: "Recursos já comprometidos",
      color: "text-yellow-600"
    },
    {
      title: "Valor Liquidado/Pago",
      value: formatCurrency(valorLiquidadoPago),
      icon: TrendingDown,
      description: "Despesas efetivamente pagas",
      color: "text-red-600"
    },
    {
      title: "Saldo Disponível",
      value: formatCurrency(saldoDisponivel),
      icon: Wallet,
      description: "Valor disponível para uso",
      color: "text-green-600"
    },
    {
      title: "Total de Créditos",
      value: totalCreditos.toString(),
      icon: FileText,
      description: "Número de descentralizações",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}