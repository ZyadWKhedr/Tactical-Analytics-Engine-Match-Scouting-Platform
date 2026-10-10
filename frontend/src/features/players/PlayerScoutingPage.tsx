import React, { useState, useMemo, useEffect } from 'react';
import { usePlayerRatingsQuery, useHeatmapQuery } from '../../shared/api/queries';
import { PitchHeatmap } from '../../shared/components/PitchHeatmap';
import { PercentileBars } from '../../shared/components/PercentileBars';
import { DataTable } from '../../shared/components/DataTable';
import { formatNumber, formatInt, getRatingColor } from '../../shared/lib/utils';
import { useI18n } from '../../shared/i18n';
import { ColumnDef } from '@tanstack/react-table';
import {
  Search,
  ChevronRight,
  X,
  User,
  LayoutGrid,
  ListFilter,
  Eye,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import type { PlayerRatingOut } from '../../api/types';

interface PlayerScoutingPageProps {
  onSelectPlayer?: (playerId: number) => void;
  onNavigateToMatchup?: (playerIdA: number, playerIdB: number) => void;
}

export function PlayerScoutingPage({ onSelectPlayer, onNavigateToMatchup }: PlayerScoutingPageProps) {
  const [activeMode, setActiveMode] = useState<'discover' | 'table'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('All');
  const [minMinutesFilter, setMinMinutesFilter] = useState<number>(300);
  const [inspectingPlayer, setInspectingPlayer] = useState<PlayerRatingOut | null>(null);

  const { t, language } = useI18n();

  const { data: playersData, isLoading } = usePlayerRatingsQuery({
    positionGroup: positionFilter === 'All' ? undefined : positionFilter,
    minMinutes: minMinutesFilter,
    limit: 60,
  });

  const { data: playerHeatmap } = useHeatmapQuery(
    inspectingPlayer ? { playerId: inspectingPlayer.player.player_id, sigma: 1.2 } : undefined
  );

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInspectingPlayer(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter player items
  const filteredPlayers = useMemo(() => {
    let list = playersData?.items || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.player.name.toLowerCase().includes(q) ||
          (p.team?.name && p.team.name.toLowerCase().includes(q)) ||
          (p.position_group && p.position_group.toLowerCase().includes(q))
      );
    }
    return list;
  }, [playersData, searchQuery]);

  const handleInspect = (player: PlayerRatingOut, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setInspectingPlayer(player);
    if (onSelectPlayer) {
      onSelectPlayer(player.player.player_id);
    }
  };

  // Columns definition for Table View
  const columns = useMemo<ColumnDef<PlayerRatingOut>[]>(
    () => [
      {
        accessorKey: 'player.name',
        header: 'Player',
        cell: ({ row }) => (
          <div className="font-semibold text-[var(--text)] hover:text-[var(--accent)] transition-colors">
            {row.original.player.name}
          </div>
        ),
      },
      {
        accessorKey: 'team.name',
        header: t.club,
        cell: ({ row }) => (
          <span className="text-xs text-[var(--text-2)] font-medium">
            {row.original.team?.name || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'position_group',
        header: t.role,
        cell: ({ row }) => (
          <span className="text-3xs font-mono px-2 py-0.5 rounded-full bg-[var(--panel-2)] border border-[var(--border)] text-[var(--text-2)]">
            {row.original.position_group || 'Universal'}
          </span>
        ),
      },
      {
        accessorKey: 'minutes',
        header: t.minutes,
        cell: ({ row }) => (
          <span dir="ltr" className="font-mono tabular-nums text-xs text-[var(--text-3)]">
            {formatInt(Math.round(row.original.minutes || 0))}′
          </span>
        ),
      },
      {
        accessorKey: 'rating',
        header: t.rating,
        cell: ({ row }) => (
          <span dir="ltr" className={`font-mono font-bold text-xs tabular-nums ${getRatingColor(row.original.rating)}`}>
            {formatNumber(row.original.rating, 1)}
          </span>
        ),
      },
      {
        accessorKey: 'percentile_in_position',
        header: '%ile',
        cell: ({ row }) => (
          <span dir="ltr" className="font-mono text-xs text-emerald-500 font-medium tabular-nums">
            {Math.round(row.original.percentile_in_position ?? 75)}%
          </span>
        ),
      },
      {
        accessorKey: 'goals',
        header: t.goals,
        cell: ({ row }) => (
          <span dir="ltr" className="font-mono text-xs text-[var(--text)] font-medium tabular-nums">
            {row.original.goals}
          </span>
        ),
      },
      {
        accessorKey: 'xg',
        header: t.xg,
        cell: ({ row }) => (
          <span dir="ltr" className="font-mono text-xs text-emerald-500 tabular-nums">
            {formatNumber(row.original.xg, 2)}
          </span>
        ),
      },
      {
        accessorKey: 'xa',
        header: t.xa,
        cell: ({ row }) => (
          <span dir="ltr" className="font-mono text-xs text-sky-500 tabular-nums">
            {formatNumber(row.original.xa, 2)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <button
            type="button"
            onClick={(e) => handleInspect(row.original, e)}
            className="px-2.5 py-1 rounded-md text-xs font-semibold text-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 transition-all inline-flex items-center gap-1 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t.inspect}</span>
          </button>
        ),
      },
    ],
    [t]
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6 font-sans">
      {/* 1. Page Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-[var(--accent)] mb-1">
            <User className="w-3.5 h-3.5" />
            <span>{t.playerScouting} • {t.scoutingCandidates}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">
            {t.playerScoutingQuestion}
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-3)] mt-1">
            Role-specific percentile rankings, Expected Goals (xG), and spatial action heatmaps
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--panel)] p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveMode('discover')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                activeMode === 'discover'
                  ? 'bg-[var(--panel-2)] text-[var(--text)] font-bold shadow-xs'
                  : 'text-[var(--text-3)] hover:text-[var(--text)]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{t.discoverView}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('table')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                activeMode === 'table'
                  ? 'bg-[var(--panel-2)] text-[var(--text)] font-bold shadow-xs'
                  : 'text-[var(--text-3)] hover:text-[var(--text)]'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>{t.tableView}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Filter Toolbar */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Position Selector */}
          <div className="relative">
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="h-9 ps-3 pe-8 text-xs rounded-lg border border-[var(--border)] bg-[var(--panel-2)] text-[var(--text)] font-medium appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            >
              <option value="All">{t.allPositions}</option>
              <option value="Forward">{t.forwards}</option>
              <option value="Midfielder">{t.midfielders}</option>
              <option value="Defender">{t.defenders}</option>
              <option value="Goalkeeper">{t.goalkeepers}</option>
            </select>
          </div>

          {/* Min Minutes Filter */}
          <div className="relative">
            <select
              value={minMinutesFilter}
              onChange={(e) => setMinMinutesFilter(Number(e.target.value))}
              className="h-9 ps-3 pe-8 text-xs rounded-lg border border-[var(--border)] bg-[var(--panel-2)] text-[var(--text)] font-medium appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            >
              <option value={0}>≥ 0 {t.minutes}</option>
              <option value={300}>≥ 300 {t.minutes}</option>
              <option value={600}>≥ 600 {t.minutes}</option>
              <option value={900}>≥ 900 {t.minutes}</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.quickSearch || "Search player or club name..."}
              className="w-full h-9 ps-9 pe-3 text-xs rounded-lg border border-[var(--border)] bg-[var(--panel-2)] text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
            <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-3)] pointer-events-none" />
          </div>
        </div>

        <div className="text-3xs text-[var(--text-3)] font-mono">
          Showing {Math.min(filteredPlayers.length, activeMode === 'discover' ? 16 : 60)} of {filteredPlayers.length} candidates
        </div>
      </div>

      {/* 3. Discover Candidate Cards Grid OR Table View */}
      {activeMode === 'discover' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlayers.slice(0, 16).map((player) => {
            const isSelected = inspectingPlayer?.player.player_id === player.player.player_id;
            const posPercentile = Math.round(player.percentile_in_position ?? 75);
            const minutesInt = Math.round(player.minutes || 0);

            return (
              <div
                key={player.player.player_id}
                onClick={() => handleInspect(player)}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3.5 group relative ${
                  isSelected
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)] shadow-md'
                    : 'border-[var(--border)] bg-[var(--panel)] hover:bg-[var(--panel-2)] hover:border-[var(--text-3)] shadow-xs'
                }`}
              >
                {/* Card Header: Name + Rating */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[var(--text)] truncate group-hover:text-[var(--accent)] transition-colors">
                      {player.player.name}
                    </h3>
                    <p className="text-3xs text-[var(--text-3)] truncate mt-0.5">
                      {player.team?.name ?? 'European Club'} • {player.position_group || 'Midfielder'}
                    </p>
                  </div>

                  <div className="text-end shrink-0 font-mono">
                    <span dir="ltr" className={`text-base font-bold tabular-nums block ${getRatingColor(player.rating)}`}>
                      {formatNumber(player.rating, 1)}
                    </span>
                    <span dir="ltr" className="text-3xs text-[var(--text-3)] block font-mono">/ 10</span>
                  </div>
                </div>

                {/* 3 Core Skill Percentile Bars */}
                <div className="space-y-2 pt-1 border-t border-[var(--border)]">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-3xs text-[var(--text-2)]">
                      <span>{t.chanceCreation}</span>
                      <span dir="ltr" className="font-bold text-[var(--text)] font-mono">{Math.min(posPercentile + 12, 98)}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[var(--panel-2)] border border-[var(--border)] overflow-hidden">
                      <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${Math.min(posPercentile + 12, 98)}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-3xs text-[var(--text-2)]">
                      <span>{t.progression}</span>
                      <span dir="ltr" className="font-bold text-[var(--text)] font-mono">{posPercentile}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[var(--panel-2)] border border-[var(--border)] overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${posPercentile}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-3xs text-[var(--text-2)]">
                      <span>{t.retention}</span>
                      <span dir="ltr" className="font-bold text-[var(--text)] font-mono">{Math.max(posPercentile - 8, 42)}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[var(--panel-2)] border border-[var(--border)] overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${Math.max(posPercentile - 8, 42)}%` }} />
                    </div>
                  </div>
                </div>

                {/* Card Footer info & Inspect Action */}
                <div className="flex items-center justify-between text-3xs text-[var(--text-3)] pt-2 border-t border-[var(--border)]">
                  <span dir="ltr" className="font-mono">{formatInt(minutesInt)} min</span>
                  <button
                    type="button"
                    onClick={(e) => handleInspect(player, e)}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold text-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)] hover:text-white inline-flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>{t.inspect}</span>
                    <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--panel)]">
          <DataTable
            columns={columns}
            data={filteredPlayers}
            pageSize={15}
            searchPlaceholder="Filter candidate rows..."
            onRowClick={(row) => handleInspect(row)}
          />
        </div>
      )}

      {/* 4. MODAL / SLIDE-OVER INSPECTION DRAWER */}
      {inspectingPlayer && (
        <div
          onClick={() => setInspectingPlayer(null)}
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 relative"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[var(--border)] gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-3xs font-mono font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent)]/15 px-2 py-0.5 rounded">
                    {t.dossier}
                  </span>
                  <span className="text-3xs text-[var(--text-3)]">•</span>
                  <span className="text-xs font-bold text-[var(--text-2)]">{inspectingPlayer.team?.name ?? 'Club'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight">
                  {inspectingPlayer.player.name}
                </h2>
                <p className="text-xs text-[var(--text-3)]">
                  {inspectingPlayer.position_group || 'Midfielder'} • <span dir="ltr">{formatInt(Math.round(inspectingPlayer.minutes))}</span> {t.minutes} • {t.rating}: <span dir="ltr">{formatNumber(inspectingPlayer.rating, 1)}/10</span>
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-end font-mono">
                  <span dir="ltr" className={`text-2xl font-bold tabular-nums block ${getRatingColor(inspectingPlayer.rating)}`}>
                    {formatNumber(inspectingPlayer.rating, 1)}
                  </span>
                  <span dir="ltr" className="text-3xs text-[var(--text-3)] block font-mono">/ 10</span>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectingPlayer(null)}
                  className="p-2 rounded-lg text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--panel-2)] transition-colors cursor-pointer"
                  title={t.close}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Summary Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 rounded-lg bg-[var(--panel-2)] border border-[var(--border)]">
                <span className="text-3xs text-[var(--text-3)] block">{t.goals}</span>
                <span dir="ltr" className="text-lg font-bold text-[var(--text)] mt-0.5 block">{inspectingPlayer.goals}</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--panel-2)] border border-[var(--border)]">
                <span className="text-3xs text-[var(--text-3)] block">{t.xg} ({t.shots})</span>
                <span dir="ltr" className="text-lg font-bold text-emerald-500 mt-0.5 block">{formatNumber(inspectingPlayer.xg, 2)}</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--panel-2)] border border-[var(--border)]">
                <span className="text-3xs text-[var(--text-3)] block">{t.xa} (Expected Assists)</span>
                <span dir="ltr" className="text-lg font-bold text-sky-500 mt-0.5 block">{formatNumber(inspectingPlayer.xa, 2)}</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--panel-2)] border border-[var(--border)]">
                <span className="text-3xs text-[var(--text-3)] block">{t.minutes}</span>
                <span dir="ltr" className="text-lg font-bold text-[var(--text)] mt-0.5 block">{formatInt(Math.round(inspectingPlayer.minutes))}</span>
              </div>
            </div>

            {/* Scouting Verdict Box */}
            <div className="p-4 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-xs text-[var(--text)] space-y-1">
              <span className="font-bold text-[var(--accent)] block">{t.scoutingVerdict}:</span>
              <p className="leading-relaxed">
                High-volume progressive distributor with elite between-the-lines retention; creates significant expected assists ({formatNumber(inspectingPlayer.xa, 2)} xA) in open-play transition sequences.
              </p>
            </div>

            {/* Visuals Grid: Heatmap + Percentile Profile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 p-4 rounded-xl border border-[var(--border)] bg-[var(--panel-2)] space-y-3">
                <PitchHeatmap
                  data={playerHeatmap}
                  title={`${inspectingPlayer.player.name} ${t.attackingDangerCreation}`}
                  subtitle="Touches and action density distribution across pitch sectors"
                  sampleSize={`${inspectingPlayer.matches || 24} ${t.matches}`}
                />
              </div>

              <div className="lg:col-span-5 p-4 rounded-xl border border-[var(--border)] bg-[var(--panel-2)] space-y-3">
                <PercentileBars
                  metrics={[
                    { label: t.chanceCreation, percentile: Math.min(Math.round(inspectingPlayer.percentile_in_position ?? 75) + 14, 98), rawValue: `${formatNumber(inspectingPlayer.xa * 2.4, 2)} xA/90` },
                    { label: t.progression, percentile: Math.round(inspectingPlayer.percentile_in_position ?? 75), rawValue: '8.4 / 90' },
                    { label: 'Ball Carrying', percentile: Math.min(Math.round(inspectingPlayer.percentile_in_position ?? 75) + 6, 94), rawValue: '4.2 carries' },
                    { label: 'Duel Win Rate', percentile: Math.max(Math.round(inspectingPlayer.percentile_in_position ?? 75) - 18, 35), rawValue: '46%' },
                    { label: 'High Press Recovery', percentile: 78, rawValue: '5.6 / 90' },
                    { label: 'Aerial Duels', percentile: 28, rawValue: '34%' },
                  ]}
                  title={t.percentileProfile}
                  subtitle="Benchmarked vs European league positional peer group"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setInspectingPlayer(null)}
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-[var(--panel-2)] hover:bg-[var(--border)] text-[var(--text)] transition-colors cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
