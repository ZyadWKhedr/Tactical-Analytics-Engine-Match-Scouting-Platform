import React, { useState } from 'react';
import { cn, formatNumber } from '../lib/utils';
import { useI18n } from '../i18n';
import { BarChart3, List, Table } from 'lucide-react';

export interface MatchResultItem {
  matchId?: number;
  date?: string;
  opponent: string;
  isHome: boolean;
  scoreFor: number;
  scoreAgainst: number;
  xgFor?: number;
  xgAgainst?: number;
  result?: 'W' | 'D' | 'L';
}

interface FormTimelineProps {
  matches?: MatchResultItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function FormTimeline({
  matches,
  title,
  subtitle,
  className,
}: FormTimelineProps) {
  const [viewMode, setViewMode] = useState<'rows' | 'chart' | 'table'>('rows');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const { t, language } = useI18n();

  const defaultMatches: MatchResultItem[] = [
    { matchId: 101, date: '24 Aug', opponent: 'AS Monaco', isHome: true, scoreFor: 3, scoreAgainst: 2, xgFor: 2.1, xgAgainst: 1.4, result: 'W' },
    { matchId: 102, date: '31 Aug', opponent: 'Olympique Marseille', isHome: false, scoreFor: 2, scoreAgainst: 0, xgFor: 1.8, xgAgainst: 0.9, result: 'W' },
    { matchId: 103, date: '14 Sep', opponent: 'Paris Saint-Germain', isHome: false, scoreFor: 1, scoreAgainst: 4, xgFor: 0.8, xgAgainst: 3.2, result: 'L' },
    { matchId: 104, date: '21 Sep', opponent: 'OGC Nice', isHome: true, scoreFor: 1, scoreAgainst: 1, xgFor: 1.5, xgAgainst: 1.2, result: 'D' },
    { matchId: 105, date: '28 Sep', opponent: 'Stade Rennais', isHome: true, scoreFor: 2, scoreAgainst: 1, xgFor: 1.9, xgAgainst: 1.0, result: 'W' },
  ];

  const items = matches && matches.length > 0 ? matches : defaultMatches;

  return (
    <div className={cn('p-4 sm:p-5 space-y-3.5 font-sans w-full overflow-hidden', className)}>
      {/* 100% Contained Header: Title block + Full-Width Segmented Switcher */}
      <div className="border-b border-[var(--border)] pb-3 space-y-2.5">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-[var(--text)] leading-snug">
            {title || t.opponentRecentForm}
          </h4>
          <p className="text-3xs sm:text-xs text-[var(--text-3)] mt-0.5 leading-relaxed">
            {subtitle || t.recentFormSubtitle}
          </p>
        </div>

        {/* View Mode Toggle: Responsive 3-column grid that fills container width exactly */}
        <div className="grid grid-cols-3 gap-1 rounded-lg border border-[var(--border)] bg-[var(--panel-2)] p-1 w-full text-xs font-medium">
          <button
            type="button"
            onClick={() => setViewMode('rows')}
            className={cn(
              'py-1 px-1.5 rounded-md transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 text-3xs font-semibold min-w-0 truncate',
              viewMode === 'rows'
                ? 'bg-[var(--panel)] text-[var(--text)] font-bold shadow-xs'
                : 'text-[var(--text-3)] hover:text-[var(--text)]'
            )}
            title={t.matchCards}
          >
            <List className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{language === 'ar' ? 'البطاقات' : 'Cards'}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('chart')}
            className={cn(
              'py-1 px-1.5 rounded-md transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 text-3xs font-semibold min-w-0 truncate',
              viewMode === 'chart'
                ? 'bg-[var(--panel)] text-[var(--text)] font-bold shadow-xs'
                : 'text-[var(--text-3)] hover:text-[var(--text)]'
            )}
            title={t.xgTrendChart}
          >
            <BarChart3 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{language === 'ar' ? 'المسار' : 'Trend'}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={cn(
              'py-1 px-1.5 rounded-md transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 text-3xs font-semibold min-w-0 truncate',
              viewMode === 'table'
                ? 'bg-[var(--panel)] text-[var(--text)] font-bold shadow-xs'
                : 'text-[var(--text-3)] hover:text-[var(--text)]'
            )}
            title={t.fullTable}
          >
            <Table className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{language === 'ar' ? 'الجدول' : 'Table'}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: FULLY RESPONSIVE MATCH ROWS */}
      {viewMode === 'rows' && (
        <div className="space-y-2 pt-0.5">
          {items.map((m, idx) => {
            const outcome =
              m.result ||
              (m.scoreFor > m.scoreAgainst ? 'W' : m.scoreFor === m.scoreAgainst ? 'D' : 'L');
            const outcomeLabel =
              language === 'ar'
                ? outcome === 'W'
                  ? 'فوز'
                  : outcome === 'D'
                  ? 'تعادل'
                  : 'خسارة'
                : outcome;

            const badgeStyle =
              outcome === 'W'
                ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                : outcome === 'D'
                ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                : 'bg-rose-500/15 text-rose-500 border-rose-500/30';

            const xgF = m.xgFor ?? (m.scoreFor * 0.8 + 0.4);
            const xgA = m.xgAgainst ?? (m.scoreAgainst * 0.8 + 0.3);
            const xgDelta = xgF - xgA;

            return (
              <div
                key={idx}
                className="p-2.5 sm:p-3 rounded-xl bg-[var(--panel-2)] border border-[var(--border)] hover:border-[var(--accent)] hover:shadow-xs transition-all space-y-2"
              >
                {/* Line 1: Outcome Badge + Full Opponent Name + Score */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className={cn(
                        'w-6 h-6 rounded-md text-3xs font-bold font-mono border flex items-center justify-center shrink-0',
                        badgeStyle
                      )}
                    >
                      {outcomeLabel}
                    </div>
                    <div className="font-bold text-xs text-[var(--text)] truncate" title={m.opponent}>
                      {m.opponent}
                    </div>
                  </div>

                  <div dir="ltr" className="text-sm font-mono font-bold text-[var(--text)] tabular-nums shrink-0">
                    {m.scoreFor} - {m.scoreAgainst}
                  </div>
                </div>

                {/* Line 2: Venue & Date on start + xG & Delta on end */}
                <div className="flex items-center justify-between text-3xs text-[var(--text-3)] font-mono pt-1.5 border-t border-[var(--border)]/60">
                  <div className="flex items-center gap-1.5 font-sans">
                    <span>{m.isHome ? (language === 'ar' ? 'داخل الأرض' : 'Home') : (language === 'ar' ? 'خارج الأرض' : 'Away')}</span>
                    {m.date && <span>• {m.date}</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <span dir="ltr" className="text-emerald-500 font-bold">{formatNumber(xgF, 1)}</span>
                    <span className="text-[var(--text-3)]">/</span>
                    <span dir="ltr" className="text-rose-500 font-bold">{formatNumber(xgA, 1)} xG</span>
                    <span dir="ltr" className={xgDelta >= 0 ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                      ({xgDelta >= 0 ? `+${formatNumber(xgDelta, 2)}` : formatNumber(xgDelta, 2)})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: VISUAL xG PERFORMANCE TREND CHART (No Emojis) */}
      {viewMode === 'chart' && (
        <div className="space-y-3 pt-1">
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between text-3xs font-mono gap-2 px-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                <span className="text-[var(--text)]">{t.xgCreated}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" />
                <span className="text-[var(--text)]">{t.xgConceded}</span>
              </div>
            </div>

            <span className="text-[var(--text-3)]">xG Delta</span>
          </div>

          {/* SVG Visual Chart */}
          <div className="relative w-full h-48 rounded-xl bg-[var(--panel-2)]/60 border border-[var(--border)] p-3 flex flex-col justify-end select-none overflow-hidden">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-x-3 top-5 border-b border-dashed border-[var(--border)] text-4xs font-mono text-[var(--text-3)] flex justify-end">
              <span>3.0 xG</span>
            </div>
            <div className="absolute inset-x-3 top-20 border-b border-dashed border-[var(--border)] text-4xs font-mono text-[var(--text-3)] flex justify-end">
              <span>2.0 xG</span>
            </div>
            <div className="absolute inset-x-3 top-32 border-b border-dashed border-[var(--border)] text-4xs font-mono text-[var(--text-3)] flex justify-end">
              <span>1.0 xG</span>
            </div>

            {/* Bars Column Grid */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-4 h-28 items-end relative z-10">
              {items.slice(0, 5).map((m, idx) => {
                const xgF = m.xgFor ?? (m.scoreFor * 0.8 + 0.4);
                const xgA = m.xgAgainst ?? (m.scoreAgainst * 0.8 + 0.3);
                const heightF = Math.min(100, (xgF / 3.5) * 100);
                const heightA = Math.min(100, (xgA / 3.5) * 100);
                const isHovered = hoveredIdx === idx;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="flex flex-col items-center h-full justify-end cursor-pointer group"
                  >
                    {/* Goals text indicator (No Emojis) */}
                    <div className="mb-1 text-3xs font-mono font-bold text-[var(--text)]">
                      {m.scoreFor}G
                    </div>

                    {/* Dual Bars (Created vs Conceded) */}
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      {/* xG For */}
                      <div
                        style={{ height: `${heightF}%` }}
                        className={cn(
                          'w-2.5 sm:w-4 rounded-t-sm bg-emerald-500 transition-all group-hover:bg-emerald-400',
                          isHovered && 'ring-2 ring-emerald-400'
                        )}
                      />
                      {/* xG Against */}
                      <div
                        style={{ height: `${heightA}%` }}
                        className={cn(
                          'w-2.5 sm:w-4 rounded-t-sm bg-rose-500 transition-all group-hover:bg-rose-400',
                          isHovered && 'ring-2 ring-rose-400'
                        )}
                      />
                    </div>

                    {/* X-Axis Match Label */}
                    <div className="mt-1.5 text-center w-full">
                      <div className="text-3xs font-bold text-[var(--text)] truncate">
                        {m.opponent.split(' ').pop()}
                      </div>
                      <div className="text-4xs font-mono text-[var(--text-3)]" dir="ltr">
                        {m.scoreFor}-{m.scoreAgainst}
                      </div>
                    </div>

                    {/* Hover Detail Card */}
                    {isHovered && (
                      <div
                        dir="ltr"
                        className="absolute bottom-full mb-2 z-30 p-2 rounded-lg bg-[var(--panel)] border border-[var(--border)] shadow-xl text-3xs text-[var(--text)] whitespace-nowrap backdrop-blur-md pointer-events-none"
                      >
                        <div className="font-bold border-b border-[var(--border)] pb-0.5 mb-1">
                          {m.opponent} ({m.isHome ? 'Home' : 'Away'})
                        </div>
                        <div className="space-y-0.5 font-mono text-4xs">
                          <div className="text-emerald-500">xG Created: {formatNumber(xgF, 2)}</div>
                          <div className="text-rose-500">xG Conceded: {formatNumber(xgA, 2)}</div>
                          <div className="text-[var(--text-3)]">Score: {m.scoreFor} - {m.scoreAgainst}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: FULL DATA TABLE (No Emojis) */}
      {viewMode === 'table' && (
        <div className="rounded-xl border border-[var(--border)] overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--panel-2)] border-b border-[var(--border)] text-3xs font-mono font-bold uppercase tracking-wider text-[var(--text-3)]">
                <th className="p-2.5">{t.matches}</th>
                <th className="p-2.5">{t.venue}</th>
                <th className="p-2.5 text-center">{t.goals}</th>
                <th className="p-2.5 text-end" dir="ltr">{t.xgCreated}</th>
                <th className="p-2.5 text-end" dir="ltr">{t.xgConceded}</th>
                <th className="p-2.5 text-end" dir="ltr">{t.differential}</th>
                <th className="p-2.5 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--panel)] font-mono">
              {items.map((m, idx) => {
                const xgF = m.xgFor ?? (m.scoreFor * 0.8 + 0.4);
                const xgA = m.xgAgainst ?? (m.scoreAgainst * 0.8 + 0.3);
                const delta = xgF - xgA;
                const outcome =
                  m.result ||
                  (m.scoreFor > m.scoreAgainst ? 'W' : m.scoreFor === m.scoreAgainst ? 'D' : 'L');

                return (
                  <tr key={idx} className="hover:bg-[var(--panel-2)] transition-colors text-3xs">
                    <td className="p-2.5 font-sans font-semibold text-[var(--text)]">{m.opponent}</td>
                    <td className="p-2.5 text-[var(--text-3)] font-sans">
                      {m.isHome ? (language === 'ar' ? 'داخل الأرض' : 'Home') : (language === 'ar' ? 'خارج الأرض' : 'Away')}
                    </td>
                    <td className="p-2.5 text-center font-bold text-[var(--text)] tabular-nums" dir="ltr">
                      {m.scoreFor} - {m.scoreAgainst}
                    </td>
                    <td className="p-2.5 text-end text-emerald-500 font-bold tabular-nums" dir="ltr">
                      {formatNumber(xgF, 2)}
                    </td>
                    <td className="p-2.5 text-end text-rose-500 font-bold tabular-nums" dir="ltr">
                      {formatNumber(xgA, 2)}
                    </td>
                    <td className="p-2.5 text-end font-bold tabular-nums" dir="ltr">
                      <span className={delta >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                        {delta >= 0 ? `+${formatNumber(delta, 2)}` : formatNumber(delta, 2)}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-4xs font-bold border',
                          outcome === 'W'
                            ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                            : outcome === 'D'
                            ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                        )}
                      >
                        {outcome}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
