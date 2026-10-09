import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { HeatmapOut, TeamSummary } from '../api/types';
import { Pitch } from '../components/Pitch';
import { Activity, Flame, Layers } from 'lucide-react';

interface Props {
  teams: TeamSummary[];
  selectedTeamId: number;
  onSelectTeamId: (id: number) => void;
}

export const HeatmapView: React.FC<Props> = ({ teams, selectedTeamId, onSelectTeamId }) => {
  const [heatmap, setHeatmap] = useState<HeatmapOut | null>(null);
  const [actionType, setActionType] = useState<number | undefined>(undefined);
  const [resolution, setResolution] = useState<{ nx: number; ny: number }>({ nx: 32, ny: 24 });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getHeatmap({
      teamId: selectedTeamId,
      typeId: actionType,
      nx: resolution.nx,
      ny: resolution.ny,
      sigma: 0,
    })
      .then((data) => setHeatmap(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedTeamId, actionType, resolution]);

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>🗺️ Spatial Action Density Heatmaps</h2>
          <p className="subtitle">
            Binned 2D histogram density on canonical 105m × 68m pitch coordinate system (attacking left → right).
          </p>
        </div>
        <div className="controls-row">
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

          <select
            className="select-input"
            value={actionType !== undefined ? actionType : ''}
            onChange={(e) => setActionType(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">All On-Ball Actions</option>
            <option value="0">Passes Completed & Attempted</option>
            <option value="11">Shots & Attempts</option>
            <option value="9">Tackles & Ground Duels</option>
            <option value="18">Clearances & Deflections</option>
            <option value="7">Take-ons & Dribbles</option>
            <option value="10">Interceptions</option>
          </select>

          <select
            className="select-input"
            value={`${resolution.nx}x${resolution.ny}`}
            onChange={(e) => {
              const [nx, ny] = e.target.value.split('x').map(Number);
              setResolution({ nx, ny });
            }}
          >
            <option value="16x12">Coarse Grid (16 × 12)</option>
            <option value="32x24">Standard Grid (32 × 24)</option>
            <option value="48x36">Fine Grid (48 × 36)</option>
          </select>
        </div>
      </div>

      {loading && !heatmap ? (
        <div className="loading-state">Generating 2D spatial action density matrix...</div>
      ) : (
        <div className="card">
          <div className="card-header-flex">
            <div>
              <h3 className="section-title">
                <Flame size={18} className="icon-gold" /> Spatial Event Density Surface
              </h3>
              <p className="section-subtitle">
                {heatmap ? `Analyzed ${heatmap.n_actions.toLocaleString()} atomic events on a ${heatmap.nx}×${heatmap.ny} spatial lattice.` : ''}
              </p>
            </div>
            <span className="tag-pill">Attacking: Left → Right</span>
          </div>

          <Pitch heatmap={heatmap} />

          <div className="heatmap-legend-bar">
            <span>Low Intensity</span>
            <div className="gradient-bar" />
            <span>Maximum Concentration</span>
          </div>
        </div>
      )}
    </div>
  );
};
