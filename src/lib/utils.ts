
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TimeFrame } from "@/types/crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, compact = false): string {
  if (value === undefined || value === null) return 'N/A';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
    notation: compact ? 'compact' : 'standard',
    compactDisplay: 'short',
  });
  
  return formatter.format(value);
}

export function formatNumber(value: number, compact = false): string {
  if (value === undefined || value === null) return 'N/A';
  
  const formatter = new Intl.NumberFormat('en-US', {
    notation: compact ? 'compact' : 'standard',
    compactDisplay: 'short',
  });
  
  return formatter.format(value);
}

export function formatDateByTimeframe(timestamp: number, timeframe: TimeFrame): string {
  const date = new Date(timestamp);
  
  switch (timeframe) {
    case '1D':
      return formatTime(date);
    case '1W':
      return formatDayMonth(date);
    case '1M':
      return formatDayMonth(date);
    case '3M':
      return formatMonthYear(date, false);
    case '1Y':
      return formatMonthYear(date, false);
    case '5Y':
      return formatMonthYear(date, true);
    default:
      return formatDayMonthYear(date);
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function formatDayMonth(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

function formatMonthYear(date: Date, shortYear = false): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: shortYear ? '2-digit' : 'numeric'
  });
}

function formatDayMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
