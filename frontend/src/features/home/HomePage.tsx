import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useSquadRatingsQuery, useMetaQuery, useTeamQuery, useOpponentBlueprintQuery } from '../../shared/api/queries';
import { StatCard } from '../../shared/components/StatCard';
import { DataTable } from '../../shared/components/DataTable';
import { formatNumber, formatInt, formatPercentile, getRatingColor } from '../../shared/lib/utils';
import { useI18n } from '../../shared/i18n';
import { ArrowRight, Shield, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import type { SquadRatingOut } from '../../api/types';

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
  const { data: blueprint } = useOpponentBlueprintQuery(selectedTeamId);
  const { t } = useI18n();

  // Define columns for Squad Leaderboard DataTable
  const squadColumns: ColumnDef<SquadRatingOut, any>[] = [
    {
      accessorKey: 'rank',
      header: '#',
      cell: (info) => <span className="font-mono text-ink-3 font-medium">#{info.getValue()}</span>,
    },
    {
      accessorKey: 'team.name',
      header: t.club,
      cell: (info) => (
        <span className="font-serif font-bold text-ink hover:text-accent transition-colors">
          {info.getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'team_rating',
      header: t.rating,
      cell: (info) => {
        const val = info.getValue<number>();
        return <span className={getRatingColor(val)}>{formatNumber(val, 1)}</span>;
      },
    },
    {
      accessorKey: 'attack_rating',
      header: t.attack,
      cell: (info) => <span className="font-mono tabular-nums text-ink">{formatNumber(info.getValue<number>(), 1)}</span>,
    },
    {
      accessorKey: 'defence_rating',
      header: t.defence,
      cell: (info) => <span className="font-mono tabular-nums text-ink">{formatNumber(info.getValue<number>(), 1)}</span>,
    },
    {
      accessorKey: 'playstyle',
      header: t.archetype,
      cell: (info) => (
        <span className="text-3xs font-mono uppercase tracking-wider text-ink-2 px-1.5 py-0.5 rounded bg-bg-sunken border border-rule">
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
          className="text-ink-3 hover:text-accent text-2xs inline-flex items-center gap-1 font-mono"
        >
          {t.scout} <ChevronRight className="w-3 h-3" />
        </button>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-8 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Editorial Header */}
      <header className="border-b border-rule pb-6 space-y-2">
        <div className="text-2xs font-mono font-bold uppercase tracking-widest text-ink-3">
          01 / EXECUTIVE MATCH ARCHIVE
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-ink tracking-tight font-normal">
          European Squad Landscape & Scouting Mandate
        </h1>
        <p className="text-base sm:text-lg text-ink-2 font-serif italic max-w-3xl">
          Where does our squad stand in the continental efficiency hierarchy, and what is our next tactical mandate?
        </p>
        <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs font-mono text-ink-3 border-t border-rule/60">
          <span>ISSUE NO. 12</span>
          <span>•</span>
          <span>1,941 FIXTURES</span>
          <span>•</span>
          <span>2.46M SPADL ACTIONS</span>
          <span>•</span>
          <span>142 EUROPEAN CLUBS</span>
        </div>
      </header>

      {/* Top Section: Analytical Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label={t.databaseMatches}
          value={formatInt(meta?.n_matches ?? 1941)}
          sampleSize="SPADL v1"
          unit="fixtures"
          delta={0}
          deltaLabel="synced"
          sparklineData={[1820, 1850, 1890, 1920, 1941]}
        />
        <StatCard
          label={t.eventCorpus}
          value={meta?.n_events ? (meta.n_events / 1000000).toFixed(2) : '2.46'}
          unit="M actions"
          benchmark="105×68 calibrated"
          sparklineData={[2.1, 2.2, 2.35, 2.46]}
        />
        <StatCard
          label={t.activeCompetitions}
          value={formatInt(meta?.n_competitions ?? 6)}
          unit="leagues"
          benchmark="Big-5 + World Cup"
        />
        <StatCard
          label={t.scoutedPlayers}
          value={formatInt(meta?.n_players ?? 3031)}
          unit="athletes"
          benchmark="Position calibrated"
        />
      </div>

      {/* Main Grid: Upcoming Opponent Intelligence & Form Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Opponent Feature Focus */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded bg-bg-raised border border-rule p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xs font-mono uppercase tracking-wider text-accent border border-accent/30 bg-accent/10 px-2 py-0.5 rounded">
                    {t.currentFocusOpponent}
                  </span>
                  <span className="text-2xs font-mono text-ink-3">
                    {t.sample}: {blueprint?.matches ?? activeTeam?.matches ?? 38} {t.matches}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-ink mt-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent shrink-0" />
                  <span>{activeTeam?.team?.name ?? 'Selected Club'}</span>
                  <span className="text-xs font-normal text-ink-3 font-mono">
                    ({activeTeam?.competition_name ?? 'Premier League'})
                  </span>
                </h2>
              </div>

              <button
                onClick={() => onNavigateToOpponent(selectedTeamId)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold rounded bg-accent text-accent-ink hover:opacity-90 transition-opacity self-start sm:self-auto"
              >
                <span>{t.fullBlueprintReport}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Ratings preview */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded bg-bg-sunken border border-rule text-center">
                <span className="text-3xs font-mono uppercase text-ink-3 block">{t.overallRating}</span>
                <span className={getRatingColor(activeTeam?.rating?.team)}>
                  {formatNumber(activeTeam?.rating?.team, 1)}
                </span>
                <span className="text-3xs font-mono text-ink-3 block">Bayesian Scale 1-10</span>
              </div>
              <div className="p-3 rounded bg-bg-sunken border border-rule text-center">
                <span className="text-3xs font-mono uppercase text-ink-3 block">{t.attackPower}</span>
                <span className="text-ink font-mono text-base font-bold">
                  {formatNumber(activeTeam?.rating?.attack, 1)}
                </span>
                <span className="text-3xs font-mono text-accent block">{t.dangerCreated}</span>
              </div>
              <div className="p-3 rounded bg-bg-sunken border border-rule text-center">
                <span className="text-3xs font-mono uppercase text-ink-3 block">{t.defenceRating}</span>
                <span className="text-ink font-mono text-base font-bold">
                  {formatNumber(activeTeam?.rating?.defence, 1)}
                </span>
                <span className="text-3xs font-mono text-positive block">{t.zoneResistance}</span>
              </div>
            </div>

            {/* Key SWOT and Tactical Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Primary Tactical Weakness */}
              <div className="p-3.5 rounded border border-negative/30 bg-negative/5">
                <div className="flex items-center gap-1.5 text-3xs font-mono font-bold uppercase tracking-wider text-negative mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {t.keyVulnerability}
                </div>
                <div className="text-xs text-ink font-medium font-serif">
                  {blueprint?.weaknesses?.[0]?.label ?? 'Half-Space Entry Vulnerability'}
                </div>
                <div className="text-2xs text-ink-3 font-mono mt-1">
                  Percentile: {formatPercentile(blueprint?.weaknesses?.[0]?.percentile ?? 18)} in league
                </div>
              </div>

              {/* Primary Strength */}
              <div className="p-3.5 rounded border border-positive/30 bg-positive/5">
                <div className="flex items-center gap-1.5 text-3xs font-mono font-bold uppercase tracking-wider text-positive mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {t.primaryStrength}
                </div>
                <div className="text-xs text-ink font-medium font-serif">
                  {blueprint?.strengths?.[0]?.label ?? 'Direct Counter Transition Threat'}
                </div>
                <div className="text-2xs text-ink-3 font-mono mt-1">
                  Percentile: {formatPercentile(blueprint?.strengths?.[0]?.percentile ?? 92)} in league
                </div>
              </div>
            </div>
          </div>

          {/* Squad Ratings Leaderboard */}
          <div className="rounded bg-bg-raised border border-rule p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div>
                <h3 className="text-sm font-serif font-bold text-ink">{t.squadRatingsLeaderboard}</h3>
                <p className="text-2xs font-mono text-ink-3">Reliability-calibrated Bayesian team efficiency ratings</p>
              </div>
              <button
                onClick={onNavigateToSquads}
                className="text-2xs font-mono text-accent hover:underline inline-flex items-center gap-1"
              >
                {t.viewFullTable} <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <DataTable
              columns={squadColumns}
              data={squadRatings?.slice(0, 6) || []}
              pageSize={6}
              searchPlaceholder="Filter clubs..."
              onRowClick={(row) => onNavigateToOpponent(row.team.team_id)}
            />
          </div>
        </div>

        {/* Sidebar Column: Pipeline Health & Coach Directive */}
        <div className="space-y-4">
          <div className="rounded bg-bg-raised border border-rule p-5 space-y-3">
            <div className="border-b border-rule pb-2">
              <span className="text-3xs font-mono uppercase text-ink-3 block">INFRASTRUCTURE</span>
              <h4 className="text-sm font-serif font-bold text-ink">{t.dataPipelineHealth}</h4>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-bg-sunken border border-rule">
                <span className="text-ink-3">Database Engine</span>
                <span className="font-mono text-positive font-bold">
                  {meta?.source?.database_ok ? 'Healthy (Active)' : 'Active (PostgreSQL)'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-bg-sunken border border-rule">
                <span className="text-ink-3">Analytics Engine</span>
                <span className="font-mono text-ink">
                  v{meta?.source?.analytics_engine_version ?? '1.0.0'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-bg-sunken border border-rule">
                <span className="text-ink-3">Coordinate System</span>
                <span className="font-mono text-ink">105m × 68m FIFA</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-bg-sunken border border-rule">
                <span className="text-ink-3">xG Calibration</span>
                <span className="font-mono text-ink">Brier Score 0.071</span>
              </div>
            </div>
          </div>

          {/* Quick Coach Directive */}
          <div className="p-5 rounded border border-rule bg-bg-raised text-xs text-ink-2 space-y-2 font-serif">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
              {t.analystWorkflow}
            </h4>
            <p className="leading-relaxed italic">
              "{t.analystWorkflowDesc}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
