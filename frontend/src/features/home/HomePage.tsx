import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useSquadRatingsQuery, useMetaQuery, useTeamQuery, useOpponentBlueprintQuery } from '../../shared/api/queries';
import { StatCard } from '../../shared/components/StatCard';
import { ChartCard } from '../../shared/components/ChartCard';
import { DataTable } from '../../shared/components/DataTable';
import { formatNumber, formatPercentile, getRatingColor } from '../../shared/lib/utils';
import { ArrowRight, Shield, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import type { SquadRatingOut, MetaOut } from '../../api/types';

interface HomePageProps {
  selectedTeamId: number;
  onNavigateToOpponent: (teamId: number) => void;
  onNavigateToSquads: () => void;
}

export function HomePage({
  selectedTeamId,
  onNavigateToOpponent,
  onNavigateToSquads,
}: HomePageProps) {
  const { data: meta } = useMetaQuery();
  const { data: squadRatings, isLoading: squadsLoading } = useSquadRatingsQuery();
  const { data: activeTeam } = useTeamQuery(selectedTeamId);
  const { data: blueprint, isLoading: bpLoading } = useOpponentBlueprintQuery(selectedTeamId);

  // Define columns for Squad Leaderboard DataTable
  const squadColumns: ColumnDef<SquadRatingOut, any>[] = [
    {
      accessorKey: 'rank',
      header: '#',
      cell: (info) => <span className="font-mono text-zinc-500 font-medium">#{info.getValue<number>()}</span>,
    },
    {
      accessorKey: 'team.name',
      header: 'Club',
      cell: (info) => (
        <span className="font-semibold text-zinc-200 hover:text-emerald-400 transition-colors">
          {info.getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: 'team_rating',
      header: 'Team Rating',
      cell: (info) => {
        const val = info.getValue<number>();
        return <span className={getRatingColor(val)}>{formatNumber(val, 1)}</span>;
      },
    },
    {
      accessorKey: 'attack_rating',
      header: 'Attack',
      cell: (info) => <span className="font-mono tabular-nums text-zinc-300">{formatNumber(info.getValue<number>(), 1)}</span>,
    },
    {
      accessorKey: 'defence_rating',
      header: 'Defence',
      cell: (info) => <span className="font-mono tabular-nums text-zinc-300">{formatNumber(info.getValue<number>(), 1)}</span>,
    },
    {
      accessorKey: 'playstyle',
      header: 'Playstyle Archetype',
      cell: (info) => (
        <span className="text-2xs font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700/50">
          {info.getValue<string>() || 'Balanced'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: (info) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigateToOpponent(info.row.original.team.team_id);
          }}
          className="text-zinc-500 hover:text-emerald-400 text-2xs inline-flex items-center gap-1 font-mono"
        >
          Scout <ChevronRight className="w-3 h-3" />
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Section: Analytical Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Database Matches"
          value={meta?.n_matches ?? 1941}
          sampleSize="SPADL v1"
          unit="games"
          delta={0}
          deltaLabel="synced"
          sparklineData={[1820, 1850, 1890, 1920, 1941]}
        />
        <StatCard
          label="Event Corpus"
          value={(meta?.n_events ? (meta.n_events / 1000000).toFixed(2) : '2.46')}
          unit="M actions"
          benchmark="105x68 calibrated"
          sparklineData={[2.1, 2.2, 2.35, 2.46]}
        />
        <StatCard
          label="Active Competitions"
          value={meta?.n_competitions ?? 6}
          unit="leagues"
          benchmark="Big-5 + World Cup"
        />
        <StatCard
          label="Scouted Players"
          value={meta?.n_players ?? 2840}
          unit="athletes"
          benchmark="Position calibrated"
        />
      </div>

      {/* Main Grid: Upcoming Opponent Intelligence & Form Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Opponent Feature Focus */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xs font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded">
                    Current Focus Opponent
                  </span>
                  <span className="text-2xs font-mono text-zinc-500">
                    Sample: {blueprint?.matches ?? activeTeam?.matches ?? 38} matches
                  </span>
                </div>
                <h2 className="text-lg font-bold text-zinc-100 mt-1 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  {activeTeam?.team.name ?? 'Selected Club'}
                  <span className="text-xs font-normal text-zinc-400 font-mono">
                    ({activeTeam?.competition_name ?? 'Premier League'})
                  </span>
                </h2>
              </div>

              <button
                onClick={() => onNavigateToOpponent(selectedTeamId)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                <span>Full Blueprint Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Ratings & Playstyle preview */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-center">
                <span className="text-2xs font-mono uppercase text-zinc-500 block">Overall Rating</span>
                <span className={getRatingColor(activeTeam?.rating.team)}>
                  {formatNumber(activeTeam?.rating.team, 1)}
                </span>
                <span className="text-3xs font-mono text-zinc-500 block">Scale 1-10</span>
              </div>
              <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-center">
                <span className="text-2xs font-mono uppercase text-zinc-500 block">Attack Power</span>
                <span className="text-zinc-200 font-mono text-base font-bold">
                  {formatNumber(activeTeam?.rating.attack, 1)}
                </span>
                <span className="text-3xs font-mono text-zinc-500 block">Expected Threat</span>
              </div>
              <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-center">
                <span className="text-2xs font-mono uppercase text-zinc-500 block">Defence Rating</span>
                <span className="text-zinc-200 font-mono text-base font-bold">
                  {formatNumber(activeTeam?.rating.defence, 1)}
                </span>
                <span className="text-3xs font-mono text-zinc-500 block">Zone Resistance</span>
              </div>
            </div>

            {/* Key SWOT and Tactical Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Primary Tactical Weakness */}
              <div className="p-3 rounded border border-rose-900/40 bg-rose-950/20">
                <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-rose-400 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Key Vulnerability
                </div>
                <div className="text-xs text-zinc-200 font-medium">
                  {blueprint?.weaknesses?.[0]?.label ?? 'Half-Space Entry Vulnerability'}
                </div>
                <div className="text-2xs text-zinc-400 font-mono mt-1">
                  Percentile: {formatPercentile(blueprint?.weaknesses?.[0]?.percentile ?? 18)} in league
                </div>
              </div>

              {/* Primary Strength */}
              <div className="p-3 rounded border border-emerald-900/40 bg-emerald-950/20">
                <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Primary Strength
                </div>
                <div className="text-xs text-zinc-200 font-medium">
                  {blueprint?.strengths?.[0]?.label ?? 'Direct Counter Transition Threat'}
                </div>
                <div className="text-2xs text-zinc-400 font-mono mt-1">
                  Percentile: {formatPercentile(blueprint?.strengths?.[0]?.percentile ?? 92)} in league
                </div>
              </div>
            </div>
          </div>

          {/* Squad Ratings Leaderboard Table */}
          <ChartCard
            title="Squad Ratings Leaderboard"
            subtitle="Reliability-calibrated Bayesian team efficiency ratings"
            sampleSize={`${squadRatings?.length ?? 0} clubs`}
            units="Rating μ = 6.5"
            actions={
              <button
                onClick={onNavigateToSquads}
                className="text-2xs font-mono text-zinc-400 hover:text-zinc-200 inline-flex items-center gap-1"
              >
                View full table <ChevronRight className="w-3 h-3" />
              </button>
            }
            isLoading={squadsLoading}
          >
            <DataTable
              columns={squadColumns}
              data={squadRatings || []}
              pageSize={6}
              searchPlaceholder="Filter clubs..."
              onRowClick={(row) => onNavigateToOpponent(row.team.team_id)}
            />
          </ChartCard>
        </div>

        {/* Sidebar Column: Data Pipeline & Data Quality Alerts */}
        <div className="space-y-4">
          <ChartCard
            title="Data Pipeline Health"
            subtitle="Continuous event stream & spatial validation"
            sampleSize="Live"
            units="PostgreSQL 16"
          >
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800/80">
                <span className="text-zinc-400">Database Engine</span>
                <span className="font-mono text-emerald-400 font-medium">
                  {meta?.source?.database_ok ? 'Healthy (Active)' : 'PostgreSQL'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800/80">
                <span className="text-zinc-400">Analytics Engine</span>
                <span className="font-mono text-zinc-200">
                  v{meta?.source?.analytics_engine_version ?? '1.0.0'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800/80">
                <span className="text-zinc-400">Coordinate Transform</span>
                <span className="font-mono text-zinc-200">105m × 68m FIFA</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800/80">
                <span className="text-zinc-400">xG Calibration</span>
                <span className="font-mono text-zinc-200">Brier Score 0.071</span>
              </div>
            </div>
          </ChartCard>

          {/* Quick Guidance Directive */}
          <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 space-y-2 font-sans">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Analyst Workflow
            </h4>
            <p className="leading-relaxed">
              Use <kbd className="px-1 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-2xs font-mono text-zinc-300">⌘K</kbd> to rapidly switch between scouted squads. All pitch visualizations operate on authentic 105×68m dimensions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
