import React from 'react';
import { useMatchupQuery, useTeamsQuery } from '../../shared/api/queries';
import { ChartCard } from '../../shared/components/ChartCard';
import { formatNumber, getRatingColor } from '../../shared/lib/utils';
import { useI18n } from '../../shared/i18n';
import { Shield, Swords, Target, History } from 'lucide-react';

interface MatchupSimulatorPageProps {
  teamAId: number;
  teamBId: number;
  onSelectTeamA: (id: number) => void;
  onSelectTeamB: (id: number) => void;
}

export function MatchupSimulatorPage({
  teamAId,
  teamBId,
  onSelectTeamA,
  onSelectTeamB,
}: MatchupSimulatorPageProps) {
  const { data: teams } = useTeamsQuery();
  const { data: matchup, isLoading, isError, refetch } = useMatchupQuery(teamAId, teamBId);
  const { t } = useI18n();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Matchup Header & Selectors */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          {/* Team A selector */}
          <div className="flex-1 w-full flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-500 shrink-0" />
            <div className="w-full">
              <span className="text-3xs uppercase font-mono text-muted-foreground block">{t.teamA}</span>
              <select
                value={teamAId}
                onChange={(e) => onSelectTeamA(Number(e.target.value))}
                className="w-full mt-1 h-8 px-2.5 text-xs sm:text-sm font-semibold rounded border border-border bg-surface text-foreground font-sans"
              >
                {teams?.map((tItem) => (
                  <option key={tItem.team.team_id} value={tItem.team.team_id}>
                    {tItem.team.name} ({tItem.rating.team.toFixed(1)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-muted-foreground">
              <Swords className="w-4 h-4" />
            </div>
            <span className="text-3xs font-mono text-muted-foreground mt-1">{t.h2hSim}</span>
          </div>

          {/* Team B selector */}
          <div className="flex-1 w-full flex items-center gap-3">
            <div className="w-full text-start md:text-end">
              <span className="text-3xs uppercase font-mono text-muted-foreground block">{t.teamB}</span>
              <select
                value={teamBId}
                onChange={(e) => onSelectTeamB(Number(e.target.value))}
                className="w-full mt-1 h-8 px-2.5 text-xs sm:text-sm font-semibold rounded border border-border bg-surface text-foreground font-sans"
              >
                {teams?.map((tItem) => (
                  <option key={tItem.team.team_id} value={tItem.team.team_id}>
                    {tItem.team.name} ({tItem.rating.team.toFixed(1)})
                  </option>
                ))}
              </select>
            </div>
            <Shield className="w-8 h-8 text-sky-500 shrink-0" />
          </div>
        </div>
      </div>

      {/* Matchup Analytics Card */}
      <ChartCard
        title={t.tacticalMatchupSim}
        subtitle="Phase-by-phase tactical delta and structural exploitation edges"
        sampleSize="Bayesian Engine"
        units="Rating Edge"
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
      >
        {matchup && (
          <div className="space-y-6 pt-2">
            {/* Rating Comparison Row */}
            <div className="grid grid-cols-3 gap-3 text-center p-4 rounded bg-surface border border-border">
              <div>
                <span className="text-2xs font-mono text-muted-foreground block">{matchup.team_a?.team?.name || 'Team A'}</span>
                <span className={getRatingColor(matchup.team_a?.rating?.team)}>
                  {formatNumber(matchup.team_a?.rating?.team, 1)}
                </span>
              </div>
              <div className="border-x border-border flex flex-col justify-center">
                <span className="text-3xs font-mono text-muted-foreground block">{t.ratingDelta}</span>
                <span className="font-mono text-sm font-bold text-foreground">
                  {matchup.rating_edge > 0 ? `+${matchup.rating_edge.toFixed(2)}` : matchup.rating_edge.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-2xs font-mono text-muted-foreground block">{matchup.team_b?.team?.name || 'Team B'}</span>
                <span className={getRatingColor(matchup.team_b?.rating?.team)}>
                  {formatNumber(matchup.team_b?.rating?.team, 1)}
                </span>
              </div>
            </div>

            {/* Tactical Exploitation Edges */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {t.phaseExploitation}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matchup.team_a?.exploitable_phases?.length > 0 ? (
                  matchup.team_a.exploitable_phases.map((edge) => (
                    <div
                      key={edge.phase}
                      className="p-3 rounded border border-emerald-500/20 bg-emerald-500/5 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 block">{edge.phase}</span>
                        <span className="text-2xs text-muted-foreground font-mono">
                          Att: {formatNumber(edge.attacker_score, 1)} vs Def: {formatNumber(edge.defender_score, 1)}
                        </span>
                      </div>
                      <div className="text-end font-mono">
                        <span className="text-3xs text-muted-foreground block">Gap</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{formatNumber(edge.gap, 2)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded border border-border bg-surface text-xs text-muted-foreground font-mono col-span-2">
                    Even tactical friction across all phases (no dominant phase mismatch).
                  </div>
                )}
              </div>
            </div>

            {/* Target Exploitation Zones */}
            {matchup.team_a?.target_zones && matchup.team_a.target_zones.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-rose-500" />
                  Opponent Defensive Blind Spots ({matchup.team_b?.team?.name})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {matchup.team_a.target_zones.map((zone) => (
                    <div key={zone.zone} className="p-2.5 rounded border border-rose-500/20 bg-rose-500/5 text-xs">
                      <div className="font-semibold text-foreground">{zone.zone}</div>
                      <div className="text-2xs font-mono text-muted-foreground mt-1">
                        Vuln Index: <span className="text-rose-500 font-bold">{formatNumber(zone.vulnerability_index, 2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historical Head-to-Head */}
            <div className="space-y-3 pt-2 border-t border-border">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-muted-foreground" />
                {t.headToHeadHistory}
              </h4>
              {matchup.head_to_head && matchup.head_to_head.length > 0 ? (
                <div className="space-y-2">
                  {matchup.head_to_head.map((m) => (
                    <div
                      key={m.match_id}
                      className="p-2.5 rounded border border-border bg-surface flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-foreground">{m.home.name}</span>
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-card border border-border text-foreground">
                        {m.home_score} - {m.away_score}
                      </span>
                      <span className="font-medium text-foreground">{m.away.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground font-mono p-3 rounded bg-surface border border-border">
                  {t.noH2HHistory}
                </div>
              )}
            </div>
          </div>
        )}
      </ChartCard>
    </div>
  );
}
