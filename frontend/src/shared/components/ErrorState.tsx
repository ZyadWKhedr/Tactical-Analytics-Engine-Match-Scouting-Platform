import React from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Data retrieval failure',
  message = 'An error occurred while communicating with the analytics engine.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-lg border border-rose-900/40 bg-rose-950/20 text-rose-200 min-h-[220px]',
        className
      )}
    >
      <AlertCircle className="w-8 h-8 text-rose-400 mb-3" />
      <h4 className="text-sm font-semibold tracking-tight text-rose-100">{title}</h4>
      <p className="text-xs text-rose-300/80 mt-1 max-w-sm font-mono">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-rose-800 bg-rose-900/40 hover:bg-rose-900/70 text-rose-100 transition-colors focus:outline-none focus:ring-1 focus:ring-rose-400"
        >
          <RotateCw className="w-3.5 h-3.5" />
          Retry query
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  title = 'No records found',
  description = 'No match events or scouting observations match the current filter criteria.',
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 text-zinc-400 min-h-[200px]',
        className
      )}
    >
      <div className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-800 flex items-center justify-center mb-3 text-zinc-500 font-mono text-xs">
        Ø
      </div>
      <h4 className="text-sm font-medium text-zinc-300">{title}</h4>
      <p className="text-xs text-zinc-500 mt-1 max-w-sm">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
