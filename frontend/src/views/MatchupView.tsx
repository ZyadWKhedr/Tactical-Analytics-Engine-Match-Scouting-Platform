import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { MatchupOut, TeamSummary } from '../api/types';
import { RadarChart } from '../components/RadarChart';
import { AlertCircle, ChevronRight, Scale, ShieldAlert, Swords, Trophy, Zap } from 'lucide-react';

interface Props {
  teams: TeamSummary[];
  teamA?: number;
  teamB?: number;
  onSelectTeamA?: (teamId: number) => void;
  onSelectTeamB?: (teamId: number) => void;
  defaultTeamA?: number;
  defaultTeamB?: number;
}

export const MatchupView: React.FC<Props> = ({
  teams,
  teamA: propTeamA,
  teamB: propTeamB,
  onSelectTeamA,
  onSelectTeamB,
  defaultTeamA,
  defaultTeamB,
}) => {
  const [localTeamA, setLocalTeamA] = useState<number>(
    propTeamA ?? defaultTeamA ?? (teams[0] ? teams[0].team.team_id : 1613)
  );
  const [localTeamB, setLocalTeamB] = useState<number>(
    propTeamB ?? defaultTeamB ?? (teams[1] ? teams[1].team.team_id : 1659)
  );
  const [matchup, setMatchup] = useState<MatchupOut | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const activeTeamA = propTeamA ?? localTeamA;
  const activeTeamB = propTeamB ?? localTeamB;

  // Safety guard: ensure activeTeamA and activeTeamB never collide on identical clubs
  useEffect(() => {
    if (activeTeamA === activeTeamB && teams.length > 1) {
      const fallback = teams.find((t) => t.team.team_id !== activeTeamA);
      if (fallback) {
        if (onSelectTeamB) {
          onSelectTeamB(fallback.team.team_id);
        } else {
          setLocalTeamB(fallback.team.team_id);
        }
      }
    }
  }, [activeTeamA, activeTeamB, teams, onSelectTeamB]);

  const handleSetTeamA = (newA: number) => {
    if (newA === activeTeamB) {
      if (onSelectTeamB) onSelectTeamB(activeTeamA);
      else setLocalTeamB(activeTeamA);
    }
    if (onSelectTeamA) onSelectTeamA(newA);
    else setLocalTeamA(newA);
  };

  const handleSetTeamB = (newB: number) => {
    if (newB === activeTeamA) {
      if (onSelectTeamA) onSelectTeamA(activeTeamB);
      else setLocalTeamA(activeTeamB);
    }
    if (onSelectTeamB) onSelectTeamB(newB);
    else setLocalTeamB(newB);
  };

  const handleSwap = () => {
    if (onSelectTeamA && onSelectTeamB) {
      onSelectTeamA(activeTeamB);
      onSelectTeamB(activeTeamA);
    } else {
      const oldA = activeTeamA;
      setLocalTeamA(activeTeamB);
      setLocalTeamB(oldA);
    }
  };

  useEffect(() => {
    if (activeTeamA && activeTeamB && activeTeamA !== activeTeamB) {
      setLoading(true);
      api.getMatchup(activeTeamA, activeTeamB)
        .then((data) => setMatchup(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [activeTeamA, activeTeamB]);

  const sortedTeams = [...teams].sort((a, b) =>
    a.team.name.localeCompare(b.team.name)
  );

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>⚔️ Head-to-Head Tactical Matchup Simulator</h2>
          <p className="subtitle">
            Cross-matrix friction points: project exploitable spatial corridors, pressing traps, and historical head-to-head record.
          </p>
        </div>
        <div className="controls-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', whiteSpace: 'nowrap' }}>
              Team A:
            </span>
            <select
              className="select-input select-large"
              value={activeTeamA}
              onChange={(e) => handleSetTeamA(Number(e.target.value))}
            >
              {sortedTeams.map((t) => (
                <option key={`a-${t.team.team_id}`} value={t.team.team_id}>
                  {t.team.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="btn-swap-teams"
            onClick={handleSwap}
            title="Swap Teams (Team A ⇄ Team B)"
          >
            ⇄
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', whiteSpace: 'nowrap' }}>
              Team B:
            </span>
            <select
              className="select-input select-large"
              value={activeTeamB}
              onChange={(e) => handleSetTeamB(Number(e.target.value))}
            >
              {sortedTeams.map((t) => (
                <option key={`b-${t.team.team_id}`} value={t.team.team_id}>
                  {t.team.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading || !matchup ? (
        <div className="loading-state">Simulating tactical friction points...</div>
      ) : (
        <div className="matchup-layout">
          {/* Clash Card */}
          <div className="card clash-card">
            <div className="clash-side side-left">
              <span className="clash-team-name">{matchup.team_a.team.name}</span>
              <span className="clash-archetype">{matchup.team_a.playstyle.label}</span>
              <div className="rating-pill rating-highlight" style={{ marginTop: '8px' }}>
                Rating: {matchup.team_a.rating.team.toFixed(2)} ★
              </div>
            </div>

            <div className="clash-center">
              <span className="swords-icon">⚔️</span>
              <div className="rating-edge-badge">
                Edge: {matchup.rating_edge > 0 ? `+${matchup.rating_edge.toFixed(2)} Team A` : `${Math.abs(matchup.rating_edge).toFixed(2)} Team B`}
              </div>
            </div>

            <div className="clash-side side-right">
              <span className="clash-team-name">{matchup.team_b.team.name}</span>
              <span className="clash-archetype">{matchup.team_b.playstyle.label}</span>
              <div className="rating-pill rating-highlight" style={{ marginTop: '8px' }}>
                Rating: {matchup.team_b.rating.team.toFixed(2)} ★
              </div>
            </div>
          </div>

          {/* Tactical Axis Deltas */}
          <div className="card">
            <h3 className="section-title">
              <Scale size={18} className="icon-gold" /> Tactical Axis Divergence (Team A vs Team B)
            </h3>
            <div className="stats-cards-grid">
              <div className="stat-card">
                <span className="stat-label">Possession Dominance Battle</span>
                <span className="stat-value text-blue">
                  {matchup.axis_deltas.possession_dominance > 0 ? `+${matchup.axis_deltas.possession_dominance}` : matchup.axis_deltas.possession_dominance}%
                </span>
                <span className="stat-sub">
                  {matchup.team_a.playstyle.axes.possession_dominance.toFixed(1)}% vs {matchup.team_b.playstyle.axes.possession_dominance.toFixed(1)}%
                </span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Pressing Intensity Differential</span>
                <span className="stat-value text-red">
                  {matchup.axis_deltas.press_intensity > 0 ? `+${matchup.axis_deltas.press_intensity}` : matchup.axis_deltas.press_intensity}%
                </span>
                <span className="stat-sub">
                  {matchup.team_a.playstyle.axes.press_intensity.toFixed(1)}% vs {matchup.team_b.playstyle.axes.press_intensity.toFixed(1)}%
                </span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Defensive Line Depth</span>
                <span className="stat-value text-gold">
                  {matchup.axis_deltas.low_block > 0 ? `+${matchup.axis_deltas.low_block}` : matchup.axis_deltas.low_block}%
                </span>
                <span className="stat-sub">
                  {matchup.team_a.playstyle.axes.low_block.toFixed(1)}% vs {matchup.team_b.playstyle.axes.low_block.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Exploitable Vectors */}
          <div className="split-columns">
            <div className="card card-strength">
              <h3 className="section-title text-green">
                <Zap size={18} /> Team A Exploitable Advantages
              </h3>
              <p className="section-subtitle">
                Phases where Team A strength significantly exceeds Team B defensive rating.
              </p>
              <div className="swot-items-list">
                {matchup.team_a.exploitable_phases.map((ep, idx) => (
                  <div key={idx} className="swot-metric-row">
                    <span className="metric-label">{ep.phase}</span>
                    <span className="percentile-text text-green">+{ep.gap.toFixed(1)} pts advantage</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '8px' }}>
                  Target Vulnerable Zones in {matchup.team_b.team.name}:
                </h4>
                {matchup.team_a.target_zones.map((tz, i) => (
                  <div key={i} className="target-zone-tag">
                    🎯 {tz.zone} (Vuln Index: {tz.vulnerability_index.toFixed(1)})
                  </div>
                ))}
              </div>
            </div>

            <div className="card card-weakness">
              <h3 className="section-title text-red">
                <ShieldAlert size={18} /> Team B Threat Vectors
              </h3>
              <p className="section-subtitle">
                Phases where Team B attack poses high danger to Team A defensive frame.
              </p>
              <div className="swot-items-list">
                {matchup.team_b.exploitable_phases.map((ep, idx) => (
                  <div key={idx} className="swot-metric-row">
                    <span className="metric-label">{ep.phase}</span>
                    <span className="percentile-text text-red">+{ep.gap.toFixed(1)} pts advantage</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '8px' }}>
                  Target Vulnerable Zones in {matchup.team_a.team.name}:
                </h4>
                {matchup.team_b.target_zones.map((tz, i) => (
                  <div key={i} className="target-zone-tag">
                    🎯 {tz.zone} (Vuln Index: {tz.vulnerability_index.toFixed(1)})
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Historical Head-to-Head Record */}
          <div className="card">
            <h3 className="section-title">
              <Trophy size={18} className="icon-gold" /> Head-to-Head Match Record ({matchup.head_to_head.length} matches in database)
            </h3>
            {matchup.head_to_head.length > 0 ? (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Competition</th>
                    <th>Home Club</th>
                    <th>Score</th>
                    <th>Away Club</th>
                    <th>Venue</th>
                  </tr>
                </thead>
                <tbody>
                  {matchup.head_to_head.map((m) => (
                    <tr key={m.match_id}>
                      <td>{new Date(m.kickoff_utc).toLocaleDateString()}</td>
                      <td>{m.competition_name}</td>
                      <td className="font-semibold">{m.home.name}</td>
                      <td className="font-bold">
                        {m.home_score} - {m.away_score}
                      </td>
                      <td className="font-semibold">{m.away.name}</td>
                      <td>{m.venue || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-state">No direct competitive encounters found between these clubs in the current dataset.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
