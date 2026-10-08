import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { BlueprintOut, TeamSummary, ZoneCell, ZonesOut } from '../api/types';
import { Pitch } from '../components/Pitch';
import { RadarChart } from '../components/RadarChart';
import { AlertCircle, AlertTriangle, CheckCircle, Crosshair, HelpCircle, Shield, Target, Zap } from 'lucide-react';

interface Props {
  teams: TeamSummary[];
  selectedTeamId: number;
  onSelectTeamId: (id: number) => void;
}

export const BlueprintView: React.FC<Props> = ({ teams, selectedTeamId, onSelectTeamId }) => {
  const [blueprint, setBlueprint] = useState<BlueprintOut | null>(null);
  const [zones, setZones] = useState<ZonesOut | null>(null);
  const [selectedZone, setSelectedZone] = useState<ZoneCell | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getBlueprint(selectedTeamId),
      api.getZones(selectedTeamId),
    ])
      .then(([bp, zn]) => {
        setBlueprint(bp);
        setZones(zn);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedTeamId]);

  const radarData = blueprint
    ? Object.entries(blueprint.phase_scores).map(([phase, val]) => ({
        label: phase.replace('phase_', '').replace('_', ' ').toUpperCase(),
        value: val,
      }))
    : [];

  return (
    <div className="view-container">
      {/* Top Header & Team Selector */}
      <div className="view-header">
        <div>
          <h2>📋 Opponent Scouting Blueprint</h2>
          <p className="subtitle">
            Machine-readable tactical DNA, press reaction probabilities, spatial vulnerabilities, and match preparation recommendations.
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
                {t.team.name} ({t.rating.team.toFixed(1)} ★ | {t.playstyle.label})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading || !blueprint ? (
        <div className="loading-state">Generating opponent blueprint dossier...</div>
      ) : (
        <div className="blueprint-grid">
          {/* Executive Tactical Profile Card */}
          <div className="card card-hero">
            <div className="dossier-header">
              <div>
                <span className="badge-competition">{blueprint.competition_name || 'League Tier 1'}</span>
                <h1 className="dossier-title">{blueprint.team.name}</h1>
                <p className="dossier-meta">
                  Archetype: <strong>{blueprint.playstyle.archetype || blueprint.playstyle.label}</strong> • Matches Analyzed: {blueprint.matches}
                </p>
              </div>
              <div className="ratings-cluster">
                <div className="rating-box">
                  <span className="rating-num">{blueprint.rating.team.toFixed(1)}</span>
                  <span className="rating-lbl">Overall</span>
                </div>
                <div className="rating-box">
                  <span className="rating-num attack-text">{blueprint.rating.attack.toFixed(1)}</span>
                  <span className="rating-lbl">Attack</span>
                </div>
                <div className="rating-box">
                  <span className="rating-num defence-text">{blueprint.rating.defence.toFixed(1)}</span>
                  <span className="rating-lbl">Defence</span>
                </div>
              </div>
            </div>

            {/* Continuous Style Axes Bar Cluster */}
            <div className="axes-bars-grid">
              <div className="axis-item">
                <div className="axis-label-row">
                  <span>Possession Dominance</span>
                  <span>{blueprint.playstyle.axes.possession_dominance.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill fill-blue"
                    style={{ width: `${blueprint.playstyle.axes.possession_dominance}%` }}
                  />
                </div>
              </div>

              <div className="axis-item">
                <div className="axis-label-row">
                  <span>Low Block Depth</span>
                  <span>{blueprint.playstyle.axes.low_block.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill fill-amber"
                    style={{ width: `${blueprint.playstyle.axes.low_block}%` }}
                  />
                </div>
              </div>

              <div className="axis-item">
                <div className="axis-label-row">
                  <span>Press Intensity</span>
                  <span>{blueprint.playstyle.axes.press_intensity.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill fill-red"
                    style={{ width: `${blueprint.playstyle.axes.press_intensity}%` }}
                  />
                </div>
              </div>

              {blueprint.playstyle.axes.directness !== undefined && (
                <div className="axis-item">
                  <div className="axis-label-row">
                    <span>Directness Ratio</span>
                    <span>{blueprint.playstyle.axes.directness?.toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill fill-emerald"
                      style={{ width: `${blueprint.playstyle.axes.directness || 50}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tactical Game Plan Directives */}
          <div className="card">
            <h3 className="section-title">
              <Zap size={18} className="icon-gold" /> Tactical Game Plan Directives
            </h3>
            <p className="section-subtitle">
              Deterministic scouting rules derived from spatial vulnerability vectors and Bayesian pressing triggers.
            </p>
            <div className="game-plan-list">
              {blueprint.game_plan.map((directive, i) => (
                <div key={i} className="game-plan-item">
                  <div className="directive-number">{i + 1}</div>
                  <div className="directive-text">{directive}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pitch Vulnerability vs Tactical Phase Radar */}
          <div className="split-columns">
            <div className="card">
              <div className="card-header-flex">
                <div>
                  <h3 className="section-title">
                    <Target size={18} className="icon-red" /> Pitch-Zone Vulnerability Grid
                  </h3>
                  <p className="section-subtitle">
                    Defending frame: 6 bands × 5 lateral channels. Color intensity reflects reliability-calibrated vulnerability index.
                  </p>
                </div>
                {selectedZone && (
                  <span className="tag-pill">
                    Selected: {selectedZone.zone_name} ({selectedZone.vulnerability_index.toFixed(1)})
                  </span>
                )}
              </div>
              <Pitch
                zones={zones?.grid}
                selectedZoneId={selectedZone?.zone_id}
                onSelectZone={(z) => setSelectedZone(z)}
              />
              <div className="corridor-summary-row">
                {zones?.corridors.map((c) => (
                  <div key={c.corridor} className="corridor-box">
                    <span className="corridor-title">{c.corridor.replace('_', ' ').toUpperCase()}</span>
                    <span className="corridor-val">{c.mean_vulnerability.toFixed(1)} idx</span>
                    <span className="corridor-sub">{c.conceded_shot_chains} shot chains</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="section-title">
                <Shield size={18} className="icon-blue" /> Tactical Phase Radar Profile
              </h3>
              <p className="section-subtitle">
                Percentile ratings across all 9 tactical phases of play compared to league baselines.
              </p>
              <RadarChart data={radarData} size={350} />
            </div>
          </div>

          {/* Press Triggers & Blind Spots Cluster */}
          <div className="split-columns">
            <div className="card">
              <h3 className="section-title">
                <AlertTriangle size={18} className="icon-red" /> Situational Press Triggers
              </h3>
              <p className="section-subtitle">
                Opponent reacts aggressively within 5s / 22m when these on-ball situations occur (+Lift vs league).
              </p>
              <div className="trigger-list">
                {blueprint.press_triggers.map((pt, i) => (
                  <div key={i} className="trigger-item trigger-hot">
                    <div className="trigger-info">
                      <span className="trigger-name">{pt.trigger}</span>
                      <span className="trigger-stats">
                        {pt.opportunities} situations • z-score: +{pt.z.toFixed(2)}
                      </span>
                    </div>
                    <div className="trigger-metrics">
                      <span className="trigger-rate">{(pt.engagement_rate * 100).toFixed(1)}%</span>
                      <span className="trigger-lift">+{pt.lift.toFixed(2)}x lift</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="section-title">
                <CheckCircle size={18} className="icon-green" /> Pressing Blind Spots
              </h3>
              <p className="section-subtitle">
                Areas and actions where opponent under-engages compared to league baseline. Safe build-up channels.
              </p>
              <div className="trigger-list">
                {blueprint.press_blind_spots.map((pt, i) => (
                  <div key={i} className="trigger-item trigger-cool">
                    <div className="trigger-info">
                      <span className="trigger-name">{pt.trigger}</span>
                      <span className="trigger-stats">
                        {pt.opportunities} situations • z-score: {pt.z.toFixed(2)}
                      </span>
                    </div>
                    <div className="trigger-metrics">
                      <span className="trigger-rate">{(pt.engagement_rate * 100).toFixed(1)}%</span>
                      <span className="trigger-lift text-cool">{pt.lift.toFixed(2)}x lift</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Squad Players Card */}
          <div className="card">
            <h3 className="section-title">⭐ Core Squad Influencers</h3>
            <div className="players-scouting-grid">
              {blueprint.top_players.map((tp) => (
                <div key={tp.player.player_id} className="player-scout-card">
                  <div className="player-rating-badge">{tp.rating.toFixed(2)}</div>
                  <div className="player-scout-info">
                    <span className="player-name">{tp.player.name}</span>
                    <span className="player-position">{tp.position || 'Squad Member'}</span>
                    <span className="player-minutes">{(tp.minutes || 0).toFixed(0)} est. mins</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
