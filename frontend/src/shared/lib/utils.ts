import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(val: number | null | undefined, decimals = 2): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return Number(val).toFixed(decimals);
}

export function formatInt(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return Math.round(val).toLocaleString('en-US');
}

export function formatPercent(val: number | null | undefined, decimals = 1): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return `${(val * 100).toFixed(decimals)}%`;
}

export function formatPercentile(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const rounded = Math.round(val);
  const suffix = ['th', 'st', 'nd', 'rd'][(rounded % 10 > 3 || Math.floor((rounded % 100) / 10) === 1) ? 0 : rounded % 10];
  return `${rounded}${suffix}`;
}

export function formatRating(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return Number(val).toFixed(1);
}

export function getRatingColor(val: number | null | undefined): string {
  if (val === null || val === undefined) return 'text-muted-foreground font-mono';
  if (val >= 7.5) return 'text-emerald-600 dark:text-emerald-400 font-bold font-mono';
  if (val >= 6.5) return 'text-emerald-600 dark:text-emerald-400 font-mono';
  if (val >= 5.5) return 'text-foreground font-mono';
  if (val >= 4.5) return 'text-amber-600 dark:text-amber-400 font-mono';
  return 'text-rose-600 dark:text-rose-400 font-bold font-mono';
}

export function getDeltaColor(val: number | null | undefined): string {
  if (val === null || val === undefined || val === 0) return 'text-muted-foreground font-mono';
  return val > 0 ? 'text-emerald-600 dark:text-emerald-400 font-mono' : 'text-rose-600 dark:text-rose-400 font-mono';
}
