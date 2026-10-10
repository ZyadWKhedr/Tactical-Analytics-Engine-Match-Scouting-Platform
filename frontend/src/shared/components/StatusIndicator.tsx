import React from 'react';
import { useHealthQuery } from '../api/queries';
import { cn } from '../lib/utils';

interface StatusIndicatorProps {
  className?: string;
  showLatency?: boolean;
}

/**
 * Real database and API status indicator polled every 30s.
 * Displays green/amber/red based on actual response from GET /api/health.
 */
export function StatusIndicator({ className, showLatency = true }: StatusIndicatorProps) {
  const { data, isLoading, isError } = useHealthQuery();

  if (isLoading) {
    return (
      <div className={cn('inline-flex items-center gap-1.5 text-xs text-zinc-400 font-mono', className)}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500" />
        </span>
        <span>Unknown (probing...)</span>
      </div>
    );
  }

  if (isError || !data || data.db === 'down') {
    return (
      <div className={cn('inline-flex items-center gap-1.5 text-xs text-rose-400 font-mono', className)} title="Database or API service unreachable">
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
        </span>
        <span>DB Disconnected</span>
      </div>
    );
  }

  const isDegraded = data.latencyMs > 500;
  const dotColor = isDegraded ? 'bg-amber-400' : 'bg-emerald-400';
  const textColor = isDegraded ? 'text-amber-300' : 'text-zinc-300';

  return (
    <div
      className={cn('inline-flex items-center gap-2 text-xs font-mono', textColor, className)}
      title={`Database: ${data.db} | Latency: ${data.latencyMs}ms | Version: ${data.version ?? '1.0.0'}`}
    >
      <span className="relative flex h-2 w-2">
        <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-60', dotColor)} />
        <span className={cn('relative inline-flex rounded-full h-2 w-2', dotColor)} />
      </span>
      <span className="tabular-nums">
        PGSQL Active {showLatency && <span className="text-zinc-500 ml-1">({data.latencyMs}ms)</span>}
      </span>
    </div>
  );
}
