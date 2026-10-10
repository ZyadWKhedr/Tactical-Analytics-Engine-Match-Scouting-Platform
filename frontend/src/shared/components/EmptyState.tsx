import React from 'react';
import { cn } from '../lib/utils';

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
        'flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 text-zinc-400 min-h-[160px]',
        className
      )}
    >
      <div className="w-7 h-7 rounded-full border border-zinc-700 bg-zinc-800 flex items-center justify-center mb-2 text-zinc-500 font-mono text-xs">
        Ø
      </div>
      <h4 className="text-xs font-medium text-zinc-300">{title}</h4>
      <p className="text-2xs text-zinc-500 mt-1 max-w-sm">{description}</p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
