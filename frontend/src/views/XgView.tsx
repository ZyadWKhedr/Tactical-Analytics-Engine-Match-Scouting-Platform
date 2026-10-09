import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { MatchSummary, ShotOut, TeamSummary, TeamXgOut } from '../api/types';
import { Pitch } from '../components/Pitch';
import { Award, BarChart2, Crosshair, Flame, Play, Target } from 'lucide-react';

interface Props {
  teams: TeamSummary[];
  selectedTeamId: number;
  onSelectTeamId: (id: number) => void;
}

export const XgView: React.FC<Props> = ({ teams, selectedTeamId, onSelectTeamId }) => {
  const [teamXg, setTeamXg] = useState<TeamXgOut | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [matchShots, setMatchShots] = useState<ShotOut[] | null>(null);
  const [selectedShotActionId, setSelectedShotActionId] = useState<number | null>(null);
  const [zoomBox, setZoomBox] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getTeamXg(selectedTeamId)
      .then((data) => {
        setTeamXg(data);
        if (data.timeline.length > 0) {
          setSelectedMatchId(data.timeline[0].match_id);
          setSelectedShotActionId(null);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedTeamId]);

  useEffect(() => {
    if (selectedMatchId) {
      setSelectedShotActionId(null);
      api.getMatchShots(selectedMatchId)
        .then((shots) => setMatchShots(shots))
        .catch((err) => console.error(err));
    }
  }, [selectedMatchId]);

  const xgDiff = teamXg ? teamXg.goals_for - teamXg.xg_for : 0;

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>🎯 Expected Goals (xG) & Shot Efficiency</h2>
          <p className="subtitle">
            Calibrated logistic regression model based on Euclidean distance, visible goal angle, shot type, and assist delivery.
          </p>
        </div>
        <div>
          <select
            className="select-input select-large"
            value={selectedTeamId}
            onChange={(e) => onSelectTeamId(Number(e.target.value))}
          >
            {teams.map((t) => (
              <option key={t.team.team_id} value={t.team.team_id}>
                {t.team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading || !teamXg ? (
        <div className="loading-state">Computing xG models and shot chains...</div>
      ) : (
        <div className="xg-dashboard">
          {/* Headline Stats Cards */}
          <div className="stats-cards-grid">
            <div className="card stat-card">
              <span className="stat-label">Expected Goals (xG)</span>
              <span className="stat-value text-blue">{teamXg.xg_for.toFixed(1)}</span>
              <span className="stat-sub">{teamXg.shots_for} Total Shots</span>
            </div>

            <div className="card stat-card">
              <span className="stat-label">Actual Goals</span>
              <span className="stat-value text-green">{teamXg.goals_for}</span>
              <span className="stat-sub">
                {xgDiff >= 0 ? `+${xgDiff.toFixed(1)} Overperforming` : `${xgDiff.toFixed(1)} Underperforming`}
              </span>
            </div>

            <div className="card stat-card">
              <span className="stat-label">Non-Penalty xG (npxG)</span>
              <span className="stat-value text-gold">{teamXg.npxg_for.toFixed(1)}</span>
              <span className="stat-sub">Open play & set pieces</span>
            </div>

            <div className="card stat-card">
              <span className="stat-label">Shot Quality (xG/Shot)</span>
              <span className="stat-value">{teamXg.xg_per_shot.toFixed(3)}</span>
              <span className="stat-sub">Average conversion probability</span>
            </div>
          </div>

          {/* Interactive Match Shot Map & Match Selection */}
          <div className="split-columns">
            <div className="card">
              <div className="card-header-flex">
                <div>
                  <h3 className="section-title">
                    <Crosshair size={18} /> Match Shot Map Visualizer
                  </h3>
                  <p className="section-subtitle">
                    Select a fixture below to inspect all individual shots, visible angles, and assist origins.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    className={`btn-toggle-zoom ${zoomBox ? 'active' : ''}`}
                    onClick={() => setZoomBox(!zoomBox)}
                    title="Toggle 2.5x zoom into attacking penalty area"
                  >
                    {zoomBox ? '🔍 Full Pitch' : '🎯 Box Zoom (2.5x)'}
                  </button>
                  {selectedMatchId && (
                    <span className="tag-pill">
                      {matchShots ? `${matchShots.length} shots recorded` : 'Loading shots...'}
                    </span>
                  )}
                </div>
              </div>

              <Pitch
                shots={matchShots}
                zoomBox={zoomBox}
                selectedShotActionId={selectedShotActionId}
                onSelectShot={(sh) => setSelectedShotActionId(sh ? sh.action_id : null)}
              />

              <div className="shot-legend">
                <div className="legend-item">
                  <span className="legend-dot dot-green" /> Goal Scored (⚽)
                </div>
                <div className="legend-item">
                  <span className="legend-dot dot-blue" /> Saved / Missed Shot
                </div>
                <div className="legend-item">
                  <span className="legend-circle-small" /> Bubble size = xG probability
                </div>
              </div>

              {/* Accessible Match Shot Roster Table */}
              {matchShots && matchShots.length > 0 && (
                <div className="shot-roster-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Fixture Shot Log ({matchShots.length} attempts)
                    </h4>
                    {selectedShotActionId && (
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.78rem', cursor: 'pointer' }}
                        onClick={() => setSelectedShotActionId(null)}
                      >
                        Clear selection
                      </button>
                    )}
                  </div>
                  <div className="shot-roster-table">
                    <table className="custom-table" style={{ fontSize: '0.82rem' }}>
                      <thead>
                        <tr>
                          <th>Min</th>
                          <th>Shooter</th>
                          <th>Outcome</th>
                          <th>xG</th>
                          <th>Delivery / Body</th>
                          <th>Assist By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...matchShots]
                          .sort((a, b) => a.minute - b.minute)
                          .map((sh) => {
                            const isSelected = selectedShotActionId === sh.action_id;
                            return (
                              <tr
                                key={sh.action_id}
                                className={`table-row-hover ${isSelected ? 'shot-row-selected' : ''}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSelectedShotActionId(isSelected ? null : sh.action_id)}
                              >
                                <td className="font-semibold">{sh.minute}'</td>
                                <td>{sh.player.name}</td>
                                <td>
                                  <span
                                    className="tag-pill"
                                    style={{
                                      backgroundColor: sh.is_goal ? 'rgba(34, 197, 94, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                                      color: sh.is_goal ? '#4ade80' : '#38bdf8',
                                    }}
                                  >
                                    {sh.is_goal ? 'Goal ⚽' : 'Shot 🎯'}
                                  </span>
                                </td>
                                <td className="font-semibold">{sh.xg.toFixed(2)}</td>
                                <td style={{ textTransform: 'capitalize' }}>
                                  {sh.bodypart || sh.shot_type || '—'}
                                </td>
                                <td>{sh.assister?.name || '—'}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Top Individual Finishers & Creators */}
            <div className="card">
              <h3 className="section-title">⭐ Top Individual Shot Contributors</h3>
              <p className="section-subtitle">
                Players ranked by cumulative expected goals and assist delivery threat.
              </p>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Shots</th>
                    <th>Goals</th>
                    <th>xG</th>
                    <th>xA</th>
                  </tr>
                </thead>
                <tbody>
                  {teamXg.top_players.map((p) => (
                    <tr key={p.player.player_id}>
                      <td className="font-semibold">{p.player.name}</td>
                      <td>{p.shots}</td>
                      <td style={{ color: p.goals > 0 ? '#4ade80' : 'inherit' }}>{p.goals}</td>
                      <td>{p.xg.toFixed(2)}</td>
                      <td>{p.xa.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Match Timeline Table */}
          <div className="card">
            <h3 className="section-title">Season Fixture-by-Fixture xG Log</h3>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Opponent</th>
                    <th>Venue</th>
                    <th>Score</th>
                    <th>xG For</th>
                    <th>Outcome Delta</th>
                    <th>Inspect</th>
                  </tr>
                </thead>
                <tbody>
                  {teamXg.timeline.map((m) => {
                    const isSelected = selectedMatchId === m.match_id;
                    const diff = m.goals_for - m.xg_for;
                    return (
                      <tr
                        key={m.match_id}
                        className={`table-row-hover ${isSelected ? 'row-selected' : ''}`}
                      >
                        <td>{new Date(m.kickoff_utc).toLocaleDateString()}</td>
                        <td className="font-semibold">{m.opponent.name}</td>
                        <td>{m.is_home ? 'Home' : 'Away'}</td>
                        <td className="font-bold">
                          {m.goals_for} - {m.goals_against}
                        </td>
                        <td>{m.xg_for.toFixed(2)}</td>
                        <td style={{ color: diff >= 0 ? '#4ade80' : '#f87171' }}>
                          {diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}
                        </td>
                        <td>
                          <button
                            className={`btn-action ${isSelected ? 'btn-active' : ''}`}
                            onClick={() => setSelectedMatchId(m.match_id)}
                          >
                            {isSelected ? 'Viewing' : 'Shot Map'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
