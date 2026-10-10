import React, { useState, useMemo } from 'react';
import { useSquadRatingsQuery, useHeatmapQuery } from '../../shared/api/queries';
import { PitchHeatmap } from '../../shared/components/PitchHeatmap';
import { FormTimeline } from '../../shared/components/FormTimeline';
import { formatNumber, getRatingColor } from '../../shared/lib/utils';
import { useI18n } from '../../shared/i18n';
import {
  Search,
  ArrowUpDown,
  ChevronRight,
  ExternalLink,
  X,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';
import type { SquadRatingOut } from '../../api/types';

interface SquadRatingsPageProps {
  onSelectTeam: (teamId: number) => void;
  selectedCompetitionId?: number;
}

export function SquadRatingsPage({ onSelectTeam, selectedCompetitionId }: SquadRatingsPageProps) {
  const { data: squadRatings, isLoading, isError, refetch } = useSquadRatingsQuery(selectedCompetitionId);
  const { t } = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'team_rating' | 'attack_rating' | 'defence_rating'>('team_rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedRowTeam, setSelectedRowTeam] = useState<SquadRatingOut | null>(null);
  const [showAllRows, setShowAllRows] = useState(false);
  const [matchRange, setMatchRange] = useState<'all' | '10' | '5'>('all');

  const { data: inspectedHeatmap } = useHeatmapQuery(
    selectedRowTeam ? { teamId: selectedRowTeam.team.team_id, sigma: 1.2 } : undefined
  );

  // Filter & Sort
  const filteredSquads = useMemo(() => {
    let list = [...(squadRatings || [])];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.team.name.toLowerCase().includes(q) ||
          (s.competition_name && s.competition_name.toLowerCase().includes(q)) ||
          (s.playstyle && s.playstyle.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      const valA = a[sortField] ?? 0;
      const valB = b[sortField] ?? 0;
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
    return list;
  }, [squadRatings, searchQuery, sortField, sortOrder]);

  const displayedSquads = showAllRows ? filteredSquads : filteredSquads.slice(0, 10);

  const handleSort = (field: 'team_rating' | 'attack_rating' | 'defence_rating') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Scatter plot geometry calculations
  const scatterMinX = 5.0;
  const scatterMaxX = 9.5;
  const scatterMinY = 5.0;
  const scatterMaxY = 9.5;

  const topAttackSquad = squadRatings ? [...squadRatings].sort((a, b) => b.attack_rating - a.attack_rating)[0] : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6 font-sans">
      {/* 1. COMPACT PAGE HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded">
              {t.squadRatings}
            </span>
            <span className="text-xs text-[var(--text-3)]">•</span>
            <span className="text-xs text-[var(--text-2)] font-medium">European Benchmarks</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight mt-1">
            {topAttackSquad
              ? `${filteredSquads.filter((s) => s.attack_rating > 8.4).length} clubs rate elite in attacking phase`
              : t.squadRatingsQuestion}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-3)] mt-0.5">
            Objective Bayesian team ratings benchmarked across European Top-5 leagues
          </p>
        </div>

        {/* Filter & Range Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--panel)] p-0.5 text-xs font-medium">
            <button
              onClick={() => setMatchRange('all')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                matchRange === 'all' ? 'bg-[var(--panel-2)] text-[var(--text)] font-bold shadow-xs' : 'text-[var(--text-3)] hover:text-[var(--text)]'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setMatchRange('10')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                matchRange === '10' ? 'bg-[var(--panel-2)] text-[var(--text)] font-bold shadow-xs' : 'text-[var(--text-3)] hover:text-[var(--text)]'
              }`}
            >
              Last 10
            </button>
            <button
              onClick={() => setMatchRange('5')}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                matchRange === '5' ? 'bg-[var(--panel-2)] text-[var(--text)] font-bold shadow-xs' : 'text-[var(--text-3)] hover:text-[var(--text)]'
              }`}
            >
              Last 5
            </button>
          </div>
        </div>
      </header>

      {/* 2. ATTACK VS DEFENCE QUADRANT SCATTER VISUAL */}
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--accent)]" />
              <h2 className="text-sm sm:text-base font-bold text-[var(--text)]">
                {t.attackVsDefenceTitle}
              </h2>
            </div>
            <p className="text-3xs sm:text-xs text-[var(--text-3)] mt-0.5">
              Top-Right represents elite two-way teams; Bottom-Right indicates deep defensive blocks
            </p>
          </div>

          <div className="flex items-center gap-4 text-3xs font-mono text-[var(--text-3)]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] inline-block" />
              <span>Elite Tier (&gt;8.0)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Balanced</span>
            </div>
          </div>
        </div>

        {/* Scatter Canvas Box */}
        <div className="relative w-full h-[320px] sm:h-[380px] rounded-lg bg-[var(--panel-2)]/50 border border-[var(--border)] overflow-hidden select-none">
          {/* Axis Center Crosshairs (at rating 7.25) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--border)] border-r border-dashed border-[var(--text-3)]/30" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-[var(--border)] border-b border-dashed border-[var(--text-3)]/30" />

          {/* Quadrant Labels */}
          <div className="absolute top-3 right-3 text-3xs font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded border border-[var(--accent)]/20">
            {t.quadrantTopRight}
          </div>
          <div className="absolute top-3 left-3 text-3xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {t.quadrantTopLeft}
          </div>
          <div className="absolute bottom-3 right-3 text-3xs font-bold uppercase tracking-wider text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
            {t.quadrantBottomRight}
          </div>
          <div className="absolute bottom-3 left-3 text-3xs font-bold uppercase tracking-wider text-[var(--text-3)] bg-[var(--panel)] px-2 py-0.5 rounded border border-[var(--border)]">
            {t.quadrantBottomLeft}
          </div>

          {/* Axis Titles */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-3xs font-mono uppercase tracking-wider text-[var(--text-3)] font-bold">
            {t.attack} Rating →
          </div>
          <div className="absolute top-1/2 left-2 -translate-y-1/2 -rotate-90 text-3xs font-mono uppercase tracking-wider text-[var(--text-3)] font-bold origin-left">
            {t.defence} Rating →
          </div>

          {/* Squad Scatter Points */}
          {filteredSquads.map((squad) => {
            const posX = ((squad.attack_rating - scatterMinX) / (scatterMaxX - scatterMinX)) * 90 + 5;
            const posY = 95 - (((squad.defence_rating - scatterMinY) / (scatterMaxY - scatterMinY)) * 90 + 5);
            const isSelected = selectedRowTeam?.team.team_id === squad.team.team_id;
            const isHigh = squad.team_rating >= 8.2;

            return (
              <div
                key={squad.team.team_id}
                onClick={() => setSelectedRowTeam(squad)}
                style={{ left: `${posX}%`, top: `${posY}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all group z-10`}
              >
                <div
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-4xs font-bold border transition-transform duration-200 ${
                    isSelected
                      ? 'bg-[var(--accent)] border-white scale-150 ring-4 ring-[var(--accent)]/30 z-30'
                      : isHigh
                      ? 'bg-[var(--accent)] border-[var(--panel)] text-white group-hover:scale-135'
                      : 'bg-emerald-500 border-[var(--panel)] text-white group-hover:scale-135'
                  }`}
                >
                  {squad.team.name.slice(0, 1)}
                </div>

                {/* Hover Pin Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none z-40 whitespace-nowrap">
                  <div className="px-2 py-1 rounded bg-[var(--panel)] border border-[var(--border)] shadow-xl text-3xs text-[var(--text)] font-sans space-y-0.5">
                    <div className="font-bold">{squad.team.name}</div>
                    <div className="text-4xs text-[var(--text-3)] font-mono">
                      Att: {squad.attack_rating.toFixed(1)} • Def: {squad.defence_rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="w-1.5 h-1.5 bg-[var(--panel)] border-r border-b border-[var(--border)] rotate-45 -mt-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. RANKED TABLE LISTING */}
      <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--panel)] space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">
              {t.rankedStandings}
            </h3>
            <p className="text-3xs text-[var(--text-3)] mt-0.5">Click any row to inspect deep tactical profile</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search club name..."
              className="w-full ps-9 pe-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--panel-2)] text-[var(--text)] placeholder:text-[var(--text-3)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="rounded-xl border border-[var(--border)] overflow-hidden divide-y divide-[var(--border)]">
          <div className="grid grid-cols-12 gap-3 p-3 text-3xs font-bold uppercase tracking-wider text-[var(--text-3)] bg-[var(--panel-2)] select-none font-mono">
            <div className="col-span-1 text-center">{t.rank}</div>
            <div className="col-span-4 sm:col-span-4">{t.club}</div>
            <div
              onClick={() => handleSort('team_rating')}
              className="col-span-3 sm:col-span-3 cursor-pointer hover:text-[var(--text)] flex items-center gap-1"
            >
              <span>{t.rating}</span>
              <ArrowUpDown className="w-3 h-3" />
            </div>
            <div
              onClick={() => handleSort('attack_rating')}
              className="col-span-2 sm:col-span-2 text-end cursor-pointer hover:text-[var(--text)] flex items-center justify-end gap-1"
            >
              <span>{t.attack}</span>
              <ArrowUpDown className="w-3 h-3" />
            </div>
            <div
              onClick={() => handleSort('defence_rating')}
              className="col-span-2 sm:col-span-2 text-end cursor-pointer hover:text-[var(--text)] flex items-center justify-end gap-1"
            >
              <span>{t.defence}</span>
              <ArrowUpDown className="w-3 h-3" />
            </div>
          </div>

          {/* Table Rows */}
          {displayedSquads.map((squad, idx) => {
            const isSelected = selectedRowTeam?.team.team_id === squad.team.team_id;
            return (
              <div
                key={squad.team.team_id}
                onClick={() => setSelectedRowTeam(squad)}
                className={`grid grid-cols-12 gap-3 p-3 items-center text-xs cursor-pointer transition-colors ${
                  isSelected ? 'bg-[var(--accent)]/10 border-s-2 border-[var(--accent)]' : 'hover:bg-[var(--panel-2)]'
                }`}
              >
                <div className="col-span-1 text-center font-mono text-[var(--text-3)] font-semibold">
                  #{idx + 1}
                </div>

                <div className="col-span-4 sm:col-span-4 min-w-0">
                  <div className="font-semibold text-[var(--text)] truncate">{squad.team.name}</div>
                  <div className="text-3xs text-[var(--text-3)]">{squad.competition_name || 'Ligue 1'}</div>
                </div>

                {/* Overall Rating Bar */}
                <div className="col-span-3 sm:col-span-3 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-[var(--panel-2)] border border-[var(--border)] overflow-hidden hidden sm:block">
                    <div
                      className="h-full bg-[var(--accent)] rounded-full"
                      style={{ width: `${(squad.team_rating / 10) * 100}%` }}
                    />
                  </div>
                  <span dir="ltr" className={`font-mono font-bold tabular-nums text-xs ${getRatingColor(squad.team_rating)}`}>
                    {formatNumber(squad.team_rating, 1)}
                  </span>
                </div>

                <div dir="ltr" className="col-span-2 sm:col-span-2 text-end font-mono tabular-nums text-[var(--text)] font-semibold">
                  {formatNumber(squad.attack_rating, 1)}
                </div>

                <div dir="ltr" className="col-span-2 sm:col-span-2 text-end font-mono tabular-nums text-[var(--text)] font-semibold">
                  {formatNumber(squad.defence_rating, 1)}
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Toggle */}
        <div className="flex justify-center pt-1">
          <button
            onClick={() => setShowAllRows(!showAllRows)}
            className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>{showAllRows ? 'Show Top 10 Only' : `View All ${filteredSquads.length} Clubs`}</span>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* 4. SIDE PANEL / DRAWER ON ROW CLICK */}
      {selectedRowTeam && (
        <div className="p-5 rounded-xl border border-[var(--accent)]/30 bg-[var(--panel)] shadow-xl animate-in fade-in duration-150 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div>
              <span className="text-3xs font-bold font-mono uppercase tracking-wider text-[var(--accent)]">Selected Team Dossier</span>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5">{selectedRowTeam.team.name}</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTeam(selectedRowTeam.team.team_id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity cursor-pointer"
              >
                <span>{t.fullScoutReport}</span>
                <ExternalLink className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
              <button
                onClick={() => setSelectedRowTeam(null)}
                className="p-1.5 rounded-lg text-[var(--text-3)] hover:text-[var(--text)] hover:bg-[var(--panel-2)] transition-colors cursor-pointer"
                title={t.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <PitchHeatmap
              data={inspectedHeatmap}
              title={`${selectedRowTeam.team.name} ${t.attackingDangerCreation}`}
              subtitle="Action concentration across 105×68m pitch"
              sampleSize={`${selectedRowTeam.matches || 38} ${t.matches}`}
            />

            <div className="space-y-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)]">
                <FormTimeline
                  title={`${selectedRowTeam.team.name} ${t.opponentRecentForm}`}
                  subtitle={t.recentFormSubtitle}
                />
              </div>

              <div className="p-4 rounded-xl bg-[var(--panel-2)] border border-[var(--border)] text-xs space-y-1">
                <span className="font-bold text-[var(--text)] block">{t.tacticalBlueprint}:</span>
                <p className="text-[var(--text-2)] leading-relaxed">
                  Archetype: <span className="font-semibold text-[var(--text)]">{selectedRowTeam.playstyle || 'Balanced'}</span>. Goal differential: <span dir="ltr" className="font-mono text-emerald-500 font-bold">+{selectedRowTeam.goal_diff_p90?.toFixed(2) ?? '0.42'}</span> / 90.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
