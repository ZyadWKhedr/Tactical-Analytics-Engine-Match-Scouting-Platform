import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { CompetitionOut, SquadRatingOut } from '../api/types';
import { Shield, TrendingUp, Trophy, Zap } from 'lucide-react';

interface Props {
  competitions: CompetitionOut[];
  onSelectTeam: (teamId: number) => void;
}

export const SquadRatingsView: React.FC<Props> = ({ competitions, onSelectTeam }) => {
  const [squads, setSquads] = useState<SquadRatingOut[]>([]);
  const [selectedComp, setSelectedComp] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'rating' | 'attack' | 'defence' | 'form'>('rating');

  useEffect(() => {
    setLoading(true);
    api.getSquadRatings(selectedComp)
      .then((data) => setSquads(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedComp, competitions]);

  const sortedSquads = [...squads].sort((a, b) => {
    if (sortBy === 'attack') return b.attack_rating - a.attack_rating;
    if (sortBy === 'defence') return b.defence_rating - a.defence_rating;
    if (sortBy === 'form') return (b.form_z || 0) - (a.form_z || 0);
    return b.team_rating - a.team_rating;
  });

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>⭐ Squad Contextual Ratings Leaderboard</h2>
          <p className="subtitle">
            Contextual two-way Ridge performance ratings on a 1.0 – 10.0 scale (μ = 6.5) adjusting for opponent tier and game state.
          </p>
        </div>
        <div className="controls-row">
          <select
            className="select-input"
            value={selectedComp || ''}
            onChange={(e) => setSelectedComp(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">All Competitions ({competitions.length})</option>
            {competitions.map((c) => (
              <option key={c.competition_id} value={c.competition_id}>
                {c.name} ({c.n_matches} matches)
              </option>
            ))}
          </select>
          <div className="btn-group">
            <button
              className={`btn-pill ${sortBy === 'rating' ? 'active' : ''}`}
              onClick={() => setSortBy('rating')}
            >
              Overall Rating
            </button>
            <button
              className={`btn-pill ${sortBy === 'attack' ? 'active' : ''}`}
              onClick={() => setSortBy('attack')}
            >
              Attack Strength
            </button>
            <button
              className={`btn-pill ${sortBy === 'defence' ? 'active' : ''}`}
              onClick={() => setSortBy('defence')}
            >
              Defence Strength
            </button>
            <button
              className={`btn-pill ${sortBy === 'form' ? 'active' : ''}`}
              onClick={() => setSortBy('form')}
            >
              Recent Form
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading squad performance matrices...</div>
      ) : (
        <div className="card-table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Rank</th>
                <th>Club</th>
                <th>League</th>
                <th>Matches</th>
                <th>Team Rating</th>
                <th>Attack</th>
                <th>Defence</th>
                <th>Goal Diff p90</th>
                <th>Playstyle Archetype</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedSquads.map((sq, idx) => (
                <tr key={sq.team.team_id} className="table-row-hover">
                  <td>
                    <span className={`rank-badge rank-${idx < 3 ? idx + 1 : 'other'}`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td>
                    <div className="team-cell">
                      <span className="team-name">{sq.team.name}</span>
                      <span className="team-country">{sq.team.country || 'Club'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="tag-pill">{sq.competition_name || 'Domestic'}</span>
                  </td>
                  <td>{sq.matches}</td>
                  <td>
                    <span className="rating-pill rating-highlight">
                      {sq.team_rating.toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span className="rating-pill attack-pill">
                      {sq.attack_rating.toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span className="rating-pill defence-pill">
                      {sq.defence_rating.toFixed(2)}
                    </span>
                  </td>
                  <td style={{ color: (sq.goal_diff_p90 || 0) >= 0 ? '#4ade80' : '#f87171' }}>
                    {sq.goal_diff_p90 ? (sq.goal_diff_p90 > 0 ? `+${sq.goal_diff_p90.toFixed(2)}` : sq.goal_diff_p90.toFixed(2)) : '0.00'}
                  </td>
                  <td>
                    <span className="archetype-badge">{sq.playstyle || 'Balanced'}</span>
                  </td>
                  <td>
                    <button
                      className="btn-action"
                      onClick={() => onSelectTeam(sq.team.team_id)}
                    >
                      Dossier →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
