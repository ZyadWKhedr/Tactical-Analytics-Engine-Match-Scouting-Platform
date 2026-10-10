import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  useOpponentBlueprintQuery,
  useZonesQuery,
  useMatchShotsQuery,
  usePassingNetworkQuery,
  useMatchesQuery,
} from '../../shared/api/queries';
import { ChartCard } from '../../shared/components/ChartCard';
import { DataTable } from '../../shared/components/DataTable';
import { ShotMap } from '../../shared/components/ShotMap';
import { PassNetwork } from '../../shared/components/PassNetwork';
import { ZoneGrid } from '../../shared/components/ZoneGrid';
import { formatNumber, formatPercent, formatPercentile, getRatingColor } from '../../shared/lib/utils';
import { useI18n } from '../../shared/i18n';
import {
  Shield,
  Activity,
  Crosshair,
  Compass,
  Sliders,
} from 'lucide-react';
import type { PressTrigger, TopPlayer } from '../../api/types';

interface OpponentReportPageProps {
  teamId: number;
}

export function OpponentReportPage({ teamId }: OpponentReportPageProps) {
  const [activeTab, setActiveTab] = useState<'blueprint' | 'zones' | 'shots' | 'network'>('blueprint');
  const { t } = useI18n();

  // Queries
  const { data: blueprint, isLoading: bpLoading, isError: bpError, refetch: refetchBp } =
    useOpponentBlueprintQuery(teamId);
  const { data: zonesData, isLoading: zonesLoading } = useZonesQuery(teamId);
  const { data: recentMatches } = useMatchesQuery({ teamId, limit: 1 });
  const latestMatchId = recentMatches?.[0]?.match_id;

  const { data: shotsData, isLoading: shotsLoading } = useMatchShotsQuery(latestMatchId);
  const { data: passingData, isLoading: passLoading } = usePassingNetworkQuery(latestMatchId, teamId);

  // Press Triggers Columns
  const pressColumns: ColumnDef<PressTrigger, any>[] = [
    {
      accessorKey: 'trigger',
      header: 'Situational Trigger',
      cell: (info) => (
        <span className="font-medium text-foreground">{info.getValue()}</span>
      ),
    },
    {
      accessorKey: 'engagement_rate',
      header: 'Press Rate',
      cell: (info) => (
        <span className="font-mono tabular-nums text-emerald-500 font-semibold">
          {formatPercent(info.getValue<number>())}
        </span>
      ),
    },
    {
      accessorKey: 'league_rate',
      header: 'League Avg',
      cell: (info) => (
        <span className="font-mono tabular-nums text-muted-foreground">
          {formatPercent(info.getValue<number>())}
        </span>
      ),
    },
    {
      accessorKey: 'lift',
      header: 'Lift Factor',
      cell: (info) => {
        const lift = info.getValue<number>();
        return (
          <span className="font-mono tabular-nums text-foreground">
            {lift > 0 ? `+${(lift * 100).toFixed(1)}%` : `${(lift * 100).toFixed(1)}%`}
          </span>
        );
      },
    },
    {
      accessorKey: 'z',
      header: 'Z-Score',
      cell: (info) => (
        <span className="font-mono tabular-nums text-muted-foreground">
          {formatNumber(info.getValue<number>(), 2)}σ
        </span>
      ),
    },
    {
      accessorKey: 'opportunities',
      header: 'Sample (n)',
      cell: (info) => (
        <span className="font-mono tabular-nums text-muted-foreground">
          {info.getValue()} opps
        </span>
      ),
    },
  ];

  // Key Players Columns
  const playerColumns: ColumnDef<TopPlayer, any>[] = [
    {
      accessorKey: 'player.name',
      header: t.scoutedPlayers,
      cell: (info) => (
        <span className="font-medium text-foreground">{info.getValue()}</span>
      ),
    },
    {
      accessorKey: 'position',
      header: t.role,
      cell: (info) => (
        <span className="font-mono text-2xs text-muted-foreground">{info.getValue<string>() || '—'}</span>
      ),
    },
    {
      accessorKey: 'rating',
      header: t.rating,
      cell: (info) => (
        <span className={getRatingColor(info.getValue<number>())}>
          {formatNumber(info.getValue<number>(), 1)}
        </span>
      ),
    },
    {
      accessorKey: 'percentile_in_position',
      header: 'Pos. Percentile',
      cell: (info) => (
        <span className="font-mono text-foreground">
          {formatPercentile(info.getValue<number>())}
        </span>
      ),
    },
  ];

  if (bpLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3 min-h-[400px]">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-xs font-mono text-muted-foreground">
          {t.loading}
        </span>
      </div>
    );
  }

  if (bpError || !blueprint) {
    return (
      <div className="p-8">
        <ChartCard
          title={t.opponentReport}
          isError
          errorMessage="Failed to retrieve opponent data from the analytics engine."
          onRetry={() => refetchBp()}
        >
          <div />
        </ChartCard>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Opponent Header Banner */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-2xs font-mono text-muted-foreground mb-1">
              <span className="px-2 py-0.5 rounded bg-surface border border-border text-foreground">
                {blueprint.competition_name || 'League Scouting'}
              </span>
              <span>{t.sample}: {blueprint.matches} {t.matches}</span>
              <span>•</span>
              <span className="text-emerald-500 dark:text-emerald-400">
                {t.playstyle}: {blueprint.playstyle?.label || 'Balanced'} ({((blueprint.playstyle?.confidence ?? 0.8) * 100).toFixed(0)}% {t.conf})
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Shield className="w-6 h-6 text-emerald-500 dark:text-emerald-400 shrink-0" />
              {blueprint.team?.name || 'Club'}
            </h1>
          </div>

          {/* Rating Triplet Badges */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded border border-border bg-surface text-center min-w-[80px]">
              <span className="text-3xs uppercase font-mono text-muted-foreground block">{t.overallRating}</span>
              <span className={getRatingColor(blueprint.rating?.team)}>
                {formatNumber(blueprint.rating?.team, 1)}
              </span>
            </div>
            <div className="px-3.5 py-1.5 rounded border border-border bg-surface text-center min-w-[80px]">
              <span className="text-3xs uppercase font-mono text-muted-foreground block">{t.attack}</span>
              <span className="font-mono text-base font-bold text-foreground">
                {formatNumber(blueprint.rating?.attack, 1)}
              </span>
            </div>
            <div className="px-3.5 py-1.5 rounded border border-border bg-surface text-center min-w-[80px]">
              <span className="text-3xs uppercase font-mono text-muted-foreground block">{t.defence}</span>
              <span className="font-mono text-base font-bold text-foreground">
                {formatNumber(blueprint.rating?.defence, 1)}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('blueprint')}
            className={`px-3 py-1.5 rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'blueprint'
                ? 'bg-surface text-emerald-500 dark:text-emerald-400 border border-border font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> {t.blueprintTendencies}
          </button>
          <button
            onClick={() => setActiveTab('zones')}
            className={`px-3 py-1.5 rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'zones'
                ? 'bg-surface text-emerald-500 dark:text-emerald-400 border border-border font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> {t.pitchZones}
          </button>
          <button
            onClick={() => setActiveTab('shots')}
            className={`px-3 py-1.5 rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'shots'
                ? 'bg-surface text-emerald-500 dark:text-emerald-400 border border-border font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface/50'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" /> {t.shotMaps}
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`px-3 py-1.5 rounded text-xs font-medium inline-flex items-center gap-1.5 transition-colors shrink-0 ${
              activeTab === 'network'
                ? 'bg-surface text-emerald-500 dark:text-emerald-400 border border-border font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> {t.passingNetwork}
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'blueprint' && (
        <div className="space-y-6">
          {/* Tactical Radar / Dimensions Bar Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Playstyle Axes Dimensions */}
            <ChartCard
              title={t.playstyleFingerprint}
              subtitle="6 continuous tactical dimensions (0-100 scale)"
              sampleSize={`n = ${blueprint.matches} ${t.matches}`}
              units="Normalized Index"
            >
              <div className="space-y-3 pt-2">
                {[
                  { label: 'Possession Dominance', val: blueprint.playstyle?.axes?.possession_dominance ?? 50 },
                  { label: 'Low Block Frequency', val: blueprint.playstyle?.axes?.low_block ?? 50 },
                  { label: 'Pressing Intensity', val: blueprint.playstyle?.axes?.press_intensity ?? 50 },
                  { label: 'Directness in Build-up', val: blueprint.playstyle?.axes?.directness ?? 50 },
                  { label: 'Flank Width Usage', val: blueprint.playstyle?.axes?.width_usage ?? 50 },
                  { label: 'Counter Transition Threat', val: blueprint.playstyle?.axes?.transition_threat ?? 50 },
                ].map((axis) => (
                  <div key={axis.label} className="space-y-1 text-xs">
                    <div className="flex justify-between text-2xs font-mono">
                      <span className="text-muted-foreground font-sans">{axis.label}</span>
                      <span className="text-foreground font-semibold">{axis.val.toFixed(0)} / 100</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, axis.val))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* SWOT Strengths & Weaknesses */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <ChartCard
                  title={t.strengths}
                  sampleSize={`${blueprint.strengths?.length ?? 0} items`}
                  units="League percentile"
                >
                  <div className="space-y-2.5">
                    {blueprint.strengths?.slice(0, 4).map((item) => (
                      <div
                        key={item.metric}
                        className="p-2.5 rounded border border-emerald-500/20 bg-emerald-500/5 text-xs"
                      >
                        <div className="flex items-center justify-between font-sans">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{item.label}</span>
                          <span className="text-2xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            {formatPercentile(item.percentile)}
                          </span>
                        </div>
                        <div className="text-2xs text-muted-foreground mt-1 font-mono">
                          Value: {formatNumber(item.value, 2)} {item.unit || ''} ({item.phase})
                        </div>
                      </div>
                    ))}
                  </div>
                </ChartCard>

                {/* Weaknesses */}
                <ChartCard
                  title={t.weaknesses}
                  sampleSize={`${blueprint.weaknesses?.length ?? 0} items`}
                  units="League percentile"
                >
                  <div className="space-y-2.5">
                    {blueprint.weaknesses?.slice(0, 4).map((item) => (
                      <div
                        key={item.metric}
                        className="p-2.5 rounded border border-rose-500/20 bg-rose-500/5 text-xs"
                      >
                        <div className="flex items-center justify-between font-sans">
                          <span className="font-semibold text-rose-600 dark:text-rose-400">{item.label}</span>
                          <span className="text-2xs font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                            {formatPercentile(item.percentile)}
                          </span>
                        </div>
                        <div className="text-2xs text-muted-foreground mt-1 font-mono">
                          Value: {formatNumber(item.value, 2)} {item.unit || ''} ({item.phase})
                        </div>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              </div>
            </div>
          </div>

          {/* Press Triggers & Blind Spots */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title={t.situationalPressTriggers}
              subtitle="Where opponent aggressively commits pressing actions"
              sampleSize={`${blueprint.press_triggers?.length ?? 0} patterns`}
              units="Lift over league"
            >
              <DataTable
                columns={pressColumns}
                data={blueprint.press_triggers || []}
                pageSize={4}
                searchPlaceholder=""
              />
            </ChartCard>

            <ChartCard
              title={t.pressBlindSpots}
              subtitle="Situations with low opponent engagement / delayed recovery"
              sampleSize={`${blueprint.press_blind_spots?.length ?? 0} patterns`}
              units="Negative lift"
            >
              <DataTable
                columns={pressColumns}
                data={blueprint.press_blind_spots || []}
                pageSize={4}
                searchPlaceholder=""
              />
            </ChartCard>
          </div>

          {/* Key Players & Deterministic Game Plan Directives */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ChartCard
                title={t.keyPlayerThreats}
                subtitle="Top rated individuals by position"
                sampleSize={`${blueprint.top_players?.length ?? 0} ${t.scoutedPlayers}`}
                units="1-10 Scale"
              >
                <DataTable
                  columns={playerColumns}
                  data={blueprint.top_players || []}
                  pageSize={4}
                  searchPlaceholder=""
                />
              </ChartCard>
            </div>

            <div className="lg:col-span-2">
              <ChartCard
                title={t.tacticalGamePlan}
                subtitle="Deterministic rule-based directives synthesized from SWOT and Zone vulnerabilities"
                sampleSize="Coach Briefing"
              >
                <div className="space-y-3 pt-1">
                  {blueprint.game_plan && blueprint.game_plan.length > 0 ? (
                    blueprint.game_plan.map((directive, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded border border-border bg-surface text-xs"
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 font-mono flex items-center justify-center shrink-0 text-2xs font-bold">
                          {idx + 1}
                        </div>
                        <p className="text-foreground leading-relaxed font-sans">{directive}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground font-mono p-4">
                      {t.noRecords}
                    </div>
                  )}
                </div>
              </ChartCard>
            </div>
          </div>
        </div>
      )}

      {/* 6x5 Pitch Zones Tab */}
      {activeTab === 'zones' && (
        <ChartCard
          title={t.pitchZones}
          subtitle="Reliability-calibrated conceded entries, conceded xT and shot chains across 30 pitch sectors"
          sampleSize={`n = ${blueprint.matches} ${t.matches}`}
          units="Vulnerability Index (0-1.0)"
          isLoading={zonesLoading}
        >
          {zonesData ? (
            <div className="max-w-4xl mx-auto py-2">
              <ZoneGrid data={zonesData} />
            </div>
          ) : (
            <div className="text-xs text-muted-foreground font-mono py-8 text-center">
              {t.noRecords}
            </div>
          )}
        </ChartCard>
      )}

      {/* xG Shot Maps Tab */}
      {activeTab === 'shots' && (
        <ChartCard
          title={t.shotMaps}
          subtitle="Event-level shot distribution on standard 105m × 68m coordinate surface"
          sampleSize={`Match #${latestMatchId || 'Recent'}`}
          units="Circle area = √xG"
          isLoading={shotsLoading}
        >
          {shotsData && shotsData.length > 0 ? (
            <div className="max-w-3xl mx-auto py-2">
              <ShotMap shots={shotsData} />
            </div>
          ) : (
            <div className="text-xs text-muted-foreground font-mono py-8 text-center">
              {t.noRecords}
            </div>
          )}
        </ChartCard>
      )}

      {/* Passing Network Tab */}
      {activeTab === 'network' && (
        <ChartCard
          title={t.passingNetwork}
          subtitle="Node coordinates = player average position; Link width = pass exchange frequency"
          sampleSize={`Match #${latestMatchId || 'Recent'}`}
          units="≥ 2 completed passes"
          isLoading={passLoading}
        >
          {passingData && passingData.nodes?.length > 0 ? (
            <div className="max-w-3xl mx-auto py-2">
              <PassNetwork data={passingData} />
            </div>
          ) : (
            <div className="text-xs text-muted-foreground font-mono py-8 text-center">
              {t.noRecords}
            </div>
          )}
        </ChartCard>
      )}
    </div>
  );
}
