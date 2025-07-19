import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Despesa } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatDate(date: string | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Planejado': 'bg-gray-100 text-gray-800',
    'Empenhado': 'bg-blue-100 text-blue-800',
    'Liquidado': 'bg-yellow-100 text-yellow-800',
    'Pago': 'bg-green-100 text-green-800',
    'Cancelado': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function calculateTotalSpent(despesas: Record<string, Despesa>): number {
  return Object.values(despesas).reduce((total, despesa) => {
    if (despesa.status === 'Pago') {
      return total + (despesa.valorTotal || 0);
    }
    return total;
  }, 0);
}

export function calculateSaldoAtual(valorGlobal: number, despesas: Record<string, Despesa>): number {
  const totalSpent = calculateTotalSpent(despesas);
  return valorGlobal - totalSpent;
}