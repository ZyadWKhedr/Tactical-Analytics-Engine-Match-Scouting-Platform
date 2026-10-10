import React from 'react';
import { cn } from '../lib/utils';

export interface PercentileMetric {
  label: string;
  percentile: number; // 0 - 100
  rawValue?: string | number;
  benchmark?: string;
  category?: 'attack' | 'defence' | 'possession' | 'transition';
}

interface PercentileBarsProps {
  metrics?: PercentileMetric[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function PercentileBars({
  metrics,
  title = 'Tactical Percentile Profile',
  subtitle = 'Benchmarked against European Top-5 league averages (50th percentile = median)',
  className,
}: PercentileBarsProps) {
  const defaultMetrics: PercentileMetric[] = [
    { label: 'Attack Efficiency', percentile: 88, rawValue: '8.8 / 10', category: 'attack' },
    { label: 'Defensive Solidity', percentile: 64, rawValue: '6.4 / 10', category: 'defence' },
    { label: 'Right Flank Danger', percentile: 94, rawValue: 'Top 6%', category: 'attack' },
    { label: 'Set Piece Defence', percentile: 28, rawValue: 'Bottom 30%', category: 'defence' },
    { label: 'High Press Recovery', percentile: 72, rawValue: '14.2 / 90', category: 'transition' },
  ];

  const items = metrics && metrics.length > 0 ? metrics : defaultMetrics;

  return (
    <div className={cn('p-4 rounded-xl bg-[var(--panel)] border border-[var(--border)] space-y-3 font-sans', className)}>
      <div className="border-b border-[var(--border)] pb-2">
        <h4 className="text-xs sm:text-sm font-bold text-[var(--text)]">{title}</h4>
        {subtitle && <p className="text-3xs text-[var(--text-3)]">{subtitle}</p>}
      </div>

      <div className="space-y-3">
        {items.map((m, idx) => {
          const isHigh = m.percentile >= 75;
          const isLow = m.percentile <= 35;
          const barColor = isHigh
            ? 'bg-[var(--accent)]'
            : isLow
            ? 'bg-rose-500'
            : 'bg-emerald-500';

          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-2xs">
                <span className="text-[var(--text)] font-medium">{m.label}</span>
                <div className="flex items-center gap-2 font-mono">
                  {m.rawValue && <span className="text-3xs text-[var(--text-3)]">{m.rawValue}</span>}
                  <span className="tabular-nums font-bold text-[var(--text)] text-2xs">
                    {Math.round(m.percentile)}%
                  </span>
                </div>
              </div>

              {/* Progress Bar with 50% Median benchmark line */}
              <div className="relative h-2 w-full rounded-full bg-[var(--panel-2)] border border-[var(--border)] overflow-hidden">
                {/* 50th Percentile Marker Line */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[var(--text-3)]/30 z-10" />
                <div
                  className={cn('h-full rounded-full transition-all duration-500', barColor)}
                  style={{ width: `${Math.min(Math.max(m.percentile, 2), 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
