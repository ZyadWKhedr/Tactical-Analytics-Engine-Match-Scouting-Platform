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
  const dotColor = isDegraded ? 'bg-warning' : 'bg-positive';
  const textColor = isDegraded ? 'text-warning' : 'text-ink';

  return (
    <div
      className={cn('inline-flex items-center gap-2 text-xs font-sans font-medium px-2 py-1 rounded bg-bg-sunken border border-rule', textColor, className)}
      title={`Database: ${data.db} | Latency: ${data.latencyMs}ms | Version: ${data.version ?? '1.0.0'}`}
    >
      <span className="relative flex h-2 w-2">
        <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-60', dotColor)} />
        <span className={cn('relative inline-flex rounded-full h-2 w-2', dotColor)} />
      </span>
      <span className="tabular-nums font-mono text-2xs">
        {data.db === 'ok' ? 'Live DB' : 'Offline'} {showLatency && <span className="text-ink-3 ml-0.5">({data.latencyMs}ms)</span>}
      </span>
    </div>
  );
}
