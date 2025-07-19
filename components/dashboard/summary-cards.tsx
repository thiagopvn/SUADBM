"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { 
  DollarSign, 
  TrendingDown, 
  Wallet,
  FileText 
} from "lucide-react";

interface SummaryCardsProps {
  totalGlobal: number;
  totalGasto: number;
  saldoDisponivel: number;
  totalCreditos: number;
}

export function SummaryCards({ 
  totalGlobal, 
  totalGasto, 
  saldoDisponivel, 
  totalCreditos 
}: SummaryCardsProps) {
  const cards = [
    {
      title: "Valor Global Consolidado",
      value: formatCurrency(totalGlobal),
      icon: DollarSign,
      description: "Total de todos os créditos",
      color: "text-blue-600"
    },
    {
      title: "Total Gasto",
      value: formatCurrency(totalGasto),
      icon: TrendingDown,
      description: "Despesas pagas",
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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