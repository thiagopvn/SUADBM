"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface LineChartProps {
  data: Array<{
    ano: number;
    valor: number;
  }>;
}

export function LineChartComponent({ data }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="ano" />
        <YAxis tickFormatter={(value) => formatCurrency(value)} />
        <Tooltip 
          formatter={(value: number) => formatCurrency(value)}
          labelFormatter={(label) => `Ano: ${label}`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="valor" 
          stroke="#2563eb" 
          name="Valor Global"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}