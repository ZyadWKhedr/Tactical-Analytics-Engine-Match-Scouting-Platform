import React from 'react';
import { cn } from '../lib/utils';
import { ErrorState } from './ErrorState';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  sampleSize?: string;
  units?: string;
  legend?: React.ReactNode;
  actions?: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function ChartCard({
  title,
  subtitle,
  sampleSize,
  units,
  legend,
  actions,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  children,
  className,
  contentClassName,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4 shadow-xs flex flex-col justify-between',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
            {sampleSize && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-2xs font-mono text-muted-foreground bg-surface border border-border">
                {sampleSize}
              </span>
            )}
            {units && (
              <span className="text-2xs font-mono text-muted-foreground">[{units}]</span>
            )}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        {(actions || legend) && (
          <div className="flex items-center gap-3">
            {legend && <div className="text-xs text-muted-foreground flex items-center gap-2">{legend}</div>}
            {actions && <div className="flex items-center gap-1.5">{actions}</div>}
          </div>
        )}
      </div>

      {/* Body */}
      <div className={cn('flex-1 relative min-h-[160px]', contentClassName)}>
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-card/60 backdrop-blur-xs rounded">
            <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            <span className="text-2xs font-mono text-muted-foreground">Computing spatial tensors...</span>
          </div>
        ) : isError ? (
          <ErrorState message={errorMessage} onRetry={onRetry} />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
