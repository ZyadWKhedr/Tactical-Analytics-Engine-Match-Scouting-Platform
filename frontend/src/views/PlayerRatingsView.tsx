import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { PlayerProfile, PlayerRatingOut } from '../api/types';
import { RadarChart } from '../components/RadarChart';
import { Search, Sliders, User, X } from 'lucide-react';

export const PlayerRatingsView: React.FC = () => {
  const [players, setPlayers] = useState<PlayerRatingOut[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [position, setPosition] = useState<string>('All');
  const [minMinutes, setMinMinutes] = useState<number>(450);
  const [search, setSearch] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getPlayerRatings({
      positionGroup: position,
      minMinutes,
      search,
      limit: 50,
    })
      .then((data) => {
        setPlayers(data.items);
        setTotal(data.total);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [position, minMinutes, search]);

  useEffect(() => {
    if (selectedPlayerId) {
      api.getPlayerProfile(selectedPlayerId)
        .then((p) => setPlayerProfile(p))
        .catch((err) => console.error(err));
    } else {
      setPlayerProfile(null);
    }
  }, [selectedPlayerId]);

  const radarData = playerProfile?.rating?.components
    ? [
        { label: 'Progression', value: (playerProfile.rating.components.progression || 0) * 10 },
        { label: 'Creation', value: (playerProfile.rating.components.creation || 0) * 10 },
        { label: 'Finishing', value: (playerProfile.rating.components.finishing || 0) * 10 },
        { label: 'Retention', value: (playerProfile.rating.components.retention || 0) * 10 },
        { label: 'Defending', value: (playerProfile.rating.components.defending || 0) * 10 },
        { label: 'Discipline', value: (playerProfile.rating.components.discipline || 0) * 10 },
      ]
    : [];

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>⭐ Contextual Player Ratings & Scouting Engine</h2>
          <p className="subtitle">
            Contextual ratings (1.0 – 10.0 scale, anchored at μ = 6.5) adjusting for opponent tier, game state, role expectations, and Bayesian shrinkage.
          </p>
        </div>
        <div className="controls-row">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search player name..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="select-input"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            <option value="All">All Positions</option>
            <option value="Center Back">Center Back</option>
            <option value="Full Back">Full Back</option>
            <option value="Defensive Midfield">Defensive Midfield</option>
            <option value="Central Midfield">Central Midfield</option>
            <option value="Attacking Midfield">Attacking Midfield</option>
            <option value="Winger">Winger</option>
            <option value="Striker">Striker</option>
            <option value="Goalkeeper">Goalkeeper</option>
          </select>

          <div className="slider-wrap">
            <span className="slider-label">Min Minutes: {minMinutes}m</span>
            <input
              type="range"
              min="0"
              max="2500"
              step="100"
              value={minMinutes}
              onChange={(e) => setMinMinutes(Number(e.target.value))}
              className="range-input"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Evaluating player ratings across 2.46M actions...</div>
      ) : (
        <div className="card">
          <div className="card-header-flex">
            <h3 className="section-title">
              Scouted Talent Pool ({total.toLocaleString()} players qualifying)
            </h3>
            <span className="tag-pill">Showing top {players.length}</span>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Club</th>
                  <th>Position</th>
                  <th>Matches</th>
                  <th>Minutes</th>
                  <th>Rating</th>
                  <th>Pos %tile</th>
                  <th>Goals</th>
                  <th>xG</th>
                  <th>xA</th>
                  <th>Profile</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.player.player_id} className="table-row-hover">
                    <td className="font-semibold">{p.player.name}</td>
                    <td>{p.team?.name || '—'}</td>
                    <td>
                      <span className="tag-pill">{p.position_group || 'Universal'}</span>
                    </td>
                    <td>{p.matches}</td>
                    <td>{Math.round(p.minutes)}m</td>
                    <td>
                      <span className="rating-pill rating-highlight">{p.rating.toFixed(2)}</span>
                    </td>
                    <td>
                      <span className="percentile-text text-green">
                        {p.percentile_in_position?.toFixed(1) || '50.0'}%
                      </span>
                    </td>
                    <td>{p.goals}</td>
                    <td>{p.xg.toFixed(2)}</td>
                    <td>{p.xa.toFixed(2)}</td>
                    <td>
                      <button
                        className="btn-action"
                        onClick={() => setSelectedPlayerId(p.player.player_id)}
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Player Profile Modal */}
      {playerProfile && (
        <div className="modal-overlay" onClick={() => setSelectedPlayerId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{playerProfile.full_name || playerProfile.player.name}</h2>
                <p className="subtitle">
                  {playerProfile.role || 'Player'} • {playerProfile.current_team?.name || 'Club'} • {playerProfile.nationality || 'International'}
                </p>
              </div>
              <button className="btn-close" onClick={() => setSelectedPlayerId(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="stats-cards-grid">
                <div className="stat-card">
                  <span className="stat-label">Performance Rating</span>
                  <span className="stat-value text-gold">
                    {playerProfile.rating?.rating.toFixed(2) || '6.50'}
                  </span>
                  <span className="stat-sub">1.0 – 10.0 scale</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Appearances</span>
                  <span className="stat-value">{playerProfile.appearances}</span>
                  <span className="stat-sub">{playerProfile.starts} Starts ({playerProfile.minutes_played}m)</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Goals / xG</span>
                  <span className="stat-value text-green">
                    {playerProfile.goals} <small style={{ fontSize: '0.8rem', color: '#94a3b8' }}>({playerProfile.xg} xG)</small>
                  </span>
                  <span className="stat-sub">{playerProfile.shots} Total Shots</span>
                </div>
              </div>

              {radarData.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ textAlign: 'center', marginBottom: '10px', color: '#94a3b8' }}>
                    Tactical Contribution Radar
                  </h4>
                  <RadarChart data={radarData} size={320} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
