import React from 'react';
import { cn, formatNumber } from '../lib/utils';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  delta?: number | null;
  deltaLabel?: string;
  sampleSize?: string;
  sparklineData?: number[];
  benchmark?: string;
  className?: string;
  status?: 'positive' | 'negative' | 'neutral';
}

export function StatCard({
  label,
  value,
  unit,
  delta,
  deltaLabel,
  sampleSize,
  sparklineData,
  benchmark,
  className,
  status,
}: StatCardProps) {
  // Determine delta color semantics
  let deltaColor = 'text-zinc-400 bg-zinc-800/60 border-zinc-700/40';
  let DeltaIcon = Minus;

  if (delta !== null && delta !== undefined) {
    if (delta > 0) {
      DeltaIcon = ArrowUpRight;
      if (status === 'negative') {
        deltaColor = 'text-rose-400 bg-rose-950/40 border-rose-800/40';
      } else {
        deltaColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
      }
    } else if (delta < 0) {
      DeltaIcon = ArrowDownRight;
      if (status === 'positive') {
        deltaColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
      } else {
        deltaColor = 'text-rose-400 bg-rose-950/40 border-rose-800/40';
      }
    }
  }

  // Render minimal SVG sparkline
  const renderSparkline = (data: number[]) => {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 64;
    const height = 24;

    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const lastX = width;
    const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2;

    return (
      <svg width={width} height={height} className="overflow-visible stroke-zinc-400 fill-none">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <circle cx={lastX} cy={lastY} r="2" className="fill-emerald-400 stroke-none" />
      </svg>
    );
  };

  return (
    <div
      className={cn(
        'rounded-lg border border-zinc-800/80 bg-zinc-900/50 p-3.5 shadow-sm hover:border-zinc-700/80 transition-colors',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-2xs font-medium uppercase tracking-wider text-zinc-400 truncate">{label}</span>
        {sampleSize && <span className="text-2xs font-mono text-zinc-500">{sampleSize}</span>}
      </div>

      <div className="mt-1.5 flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold tracking-tight font-mono tabular-nums text-zinc-100">
            {typeof value === 'number' ? formatNumber(value) : value ?? '—'}
          </span>
          {unit && <span className="text-xs font-mono text-zinc-400">{unit}</span>}
        </div>

        {sparklineData && sparklineData.length > 1 && (
          <div className="text-zinc-500">{renderSparkline(sparklineData)}</div>
        )}
      </div>

      {(delta !== null && delta !== undefined || benchmark) && (
        <div className="mt-2 flex items-center justify-between gap-2 text-2xs">
          {delta !== null && delta !== undefined && (
            <div className={cn('inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border font-mono', deltaColor)}>
              <DeltaIcon className="w-3 h-3" />
              <span>{delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}</span>
              {deltaLabel && <span className="text-zinc-400 ml-0.5 font-sans">{deltaLabel}</span>}
            </div>
          )}
          {benchmark && <span className="text-zinc-500 font-mono ml-auto">{benchmark}</span>}
        </div>
      )}
    </div>
  );
}
