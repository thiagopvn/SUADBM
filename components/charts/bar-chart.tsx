"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface BarChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

// Enhanced color palette with gradients
const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald  
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6366F1', // Indigo
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-1">{label}</p>
        <p className="text-blue-600">
          <span className="font-medium">Valor: </span>
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

// Custom label formatter
const formatXAxisLabel = (value: string) => {
  // Truncate long labels and add ellipsis
  if (value.length > 15) {
    return value.substring(0, 15) + '...';
  }
  return value;
};

export function BarChartComponent({ data }: BarChartProps) {
  // Sort data by value in descending order for better visualization
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={sortedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 80,
          }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name"
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={formatXAxisLabel}
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={(value) => {
              if (value >= 1000000) {
                return `${(value / 1000000).toFixed(1)}M`;
              } else if (value >= 1000) {
                return `${(value / 1000).toFixed(0)}K`;
              }
              return value.toString();
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            radius={[4, 4, 0, 0]}
            stroke="#ffffff"
            strokeWidth={1}
          >
            {sortedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Legend with values */}
      <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
        {sortedData.map((entry, index) => (
          <div key={entry.name} className="flex items-center justify-between py-1 px-2 hover:bg-gray-50 rounded">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-gray-700 font-medium" title={entry.name}>
                {entry.name}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}