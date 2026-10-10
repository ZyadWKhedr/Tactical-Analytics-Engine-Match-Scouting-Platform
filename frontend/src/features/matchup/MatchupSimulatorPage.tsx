import React from 'react';
import { useMatchupQuery, useTeamsQuery } from '../../shared/api/queries';
import { ChartCard } from '../../shared/components/ChartCard';
import { formatNumber, getRatingColor } from '../../shared/lib/utils';
import { Shield, Swords, ArrowRight } from 'lucide-react';

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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Matchup Header & Selectors */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Team A selector */}
          <div className="flex-1 w-full flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-400 shrink-0" />
            <div className="w-full">
              <span className="text-3xs uppercase font-mono text-zinc-500 block">Team A (Home / Focus)</span>
              <select
                value={teamAId}
                onChange={(e) => onSelectTeamA(Number(e.target.value))}
                className="w-full mt-1 h-8 px-2.5 text-sm font-semibold rounded border border-zinc-700 bg-zinc-800 text-zinc-100 font-sans"
              >
                {teams?.map((t) => (
                  <option key={t.team.team_id} value={t.team.team_id}>
                    {t.team.name} ({t.rating.team.toFixed(1)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
              <Swords className="w-4 h-4" />
            </div>
            <span className="text-3xs font-mono text-zinc-500 mt-1">H2H SIM</span>
          </div>

          {/* Team B selector */}
          <div className="flex-1 w-full flex items-center gap-3 text-right">
            <div className="w-full">
              <span className="text-3xs uppercase font-mono text-zinc-500 block">Team B (Opponent)</span>
              <select
                value={teamBId}
                onChange={(e) => onSelectTeamB(Number(e.target.value))}
                className="w-full mt-1 h-8 px-2.5 text-sm font-semibold rounded border border-zinc-700 bg-zinc-800 text-zinc-100 font-sans"
              >
                {teams?.map((t) => (
                  <option key={t.team.team_id} value={t.team.team_id}>
                    {t.team.name} ({t.rating.team.toFixed(1)})
                  </option>
                ))}
              </select>
            </div>
            <Shield className="w-8 h-8 text-sky-400 shrink-0" />
          </div>
        </div>
      </div>

      {/* Matchup Analytics Card */}
      <ChartCard
        title="Tactical Matchup Simulation"
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
            <div className="grid grid-cols-3 gap-4 text-center p-4 rounded bg-zinc-950/60 border border-zinc-800">
              <div>
                <span className="text-2xs font-mono text-zinc-400 block">{matchup.team_a.team.name}</span>
                <span className={getRatingColor(matchup.team_a.rating.team)}>
                  {formatNumber(matchup.team_a.rating.team, 1)}
                </span>
              </div>
              <div className="border-x border-zinc-800 flex flex-col justify-center">
                <span className="text-3xs font-mono text-zinc-500 block">RATING DELTA</span>
                <span className="font-mono text-sm font-bold text-zinc-200">
                  {matchup.rating_edge > 0 ? `+${matchup.rating_edge.toFixed(2)}` : matchup.rating_edge.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-2xs font-mono text-zinc-400 block">{matchup.team_b.team.name}</span>
                <span className={getRatingColor(matchup.team_b.rating.team)}>
                  {formatNumber(matchup.team_b.rating.team, 1)}
                </span>
              </div>
            </div>

            {/* Tactical Exploitation Edges */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Phase Exploitation Opportunities
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matchup.team_a.exploitable_phases.map((edge) => (
                  <div
                    key={edge.phase}
                    className="p-3 rounded border border-emerald-950/80 bg-emerald-950/20 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-emerald-300 block">{edge.phase}</span>
                      <span className="text-2xs text-zinc-400 font-mono">
                        Att: {formatNumber(edge.attacker_score, 1)} vs Def: {formatNumber(edge.defender_score, 1)}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-3xs text-zinc-500 block">Gap</span>
                      <span className="text-emerald-400 font-bold">+{formatNumber(edge.gap, 2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </ChartCard>
    </div>
  );
}
