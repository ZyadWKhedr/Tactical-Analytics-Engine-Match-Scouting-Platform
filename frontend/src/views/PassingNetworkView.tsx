import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { MatchSummary, PassingNetworkOut, TeamSummary } from '../api/types';
import { Pitch } from '../components/Pitch';
import { Network, Share2, Sliders } from 'lucide-react';

interface Props {
  teams: TeamSummary[];
  selectedTeamId: number;
}

export const PassingNetworkView: React.FC<Props> = ({ teams, selectedTeamId }) => {
  const [matches, setMatches] = useState<MatchSummary[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchSummary | null>(null);
  const [teamSide, setTeamSide] = useState<number>(selectedTeamId);
  const [minPasses, setMinPasses] = useState<number>(2);
  const [network, setNetwork] = useState<PassingNetworkOut | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch matches involving selected team
  useEffect(() => {
    api.getMatches({ teamId: selectedTeamId, limit: 15 })
      .then((data) => {
        setMatches(data);
        if (data.length > 0) {
          setSelectedMatch(data[0]);
          setTeamSide(selectedTeamId);
        }
      })
      .catch((err) => console.error(err));
  }, [selectedTeamId]);

  // Fetch passing network for selected match and team
  useEffect(() => {
    if (selectedMatch) {
      setLoading(true);
      api.getPassingNetwork(selectedMatch.match_id, teamSide, minPasses)
        .then((data) => setNetwork(data))
        .catch((err) => {
          console.error(err);
          setNetwork(null);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedMatch, teamSide, minPasses]);

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>🕸️ Directed Tactical Passing Networks</h2>
          <p className="subtitle">
            Spatial player centroids computed from successful possessions with pairwise sequence volume edges (temporal window &lt; 5.0s).
          </p>
        </div>
        <div className="controls-row">
          <select
            className="select-input select-large"
            value={selectedMatch?.match_id || ''}
            onChange={(e) => {
              const m = matches.find((m) => m.match_id === Number(e.target.value));
              if (m) {
                setSelectedMatch(m);
                setTeamSide(m.home.team_id);
              }
            }}
          >
            {matches.map((m) => (
              <option key={m.match_id} value={m.match_id}>
                {m.home.name} {m.home_score} - {m.away_score} {m.away.name} ({new Date(m.kickoff_utc).toLocaleDateString()})
              </option>
            ))}
          </select>

          {selectedMatch && (
            <div className="btn-group">
              <button
                className={`btn-pill ${teamSide === selectedMatch.home.team_id ? 'active' : ''}`}
                onClick={() => setTeamSide(selectedMatch.home.team_id)}
              >
                {selectedMatch.home.name} (Home)
              </button>
              <button
                className={`btn-pill ${teamSide === selectedMatch.away.team_id ? 'active' : ''}`}
                onClick={() => setTeamSide(selectedMatch.away.team_id)}
              >
                {selectedMatch.away.name} (Away)
              </button>
            </div>
          )}

          <div className="slider-wrap">
            <span className="slider-label">Min Passes: {minPasses}</span>
            <input
              type="range"
              min="1"
              max="5"
              value={minPasses}
              onChange={(e) => setMinPasses(Number(e.target.value))}
              className="range-input"
            />
          </div>
        </div>
      </div>

      <div className="split-columns">
        {/* Pitch Network Visualizer */}
        <div className="card">
          <div className="card-header-flex">
            <div>
              <h3 className="section-title">
                <Network size={18} className="icon-blue" /> Passing Connectivity Graph
              </h3>
              <p className="section-subtitle">
                {network
                  ? `${network.nodes.length} player centroids, ${network.edges.length} passing vectors (threshold ≥ ${minPasses})`
                  : 'Computing network graph...'}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Synthesizing pairwise passing chains...</div>
          ) : network ? (
            <Pitch passingNetwork={network} />
          ) : (
            <div className="empty-state">No pass chains found meeting the threshold criteria.</div>
          )}
        </div>

        {/* Centrality & Influence Table */}
        <div className="card">
          <h3 className="section-title">📊 Node Centrality & Hub Leaders</h3>
          <p className="section-subtitle">
            Graph centrality derived from pass completion and receipt distribution.
          </p>
          {network && (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Centroid (X, Y)</th>
                  <th>Completed</th>
                  <th>Received</th>
                  <th>Degree Centrality</th>
                </tr>
              </thead>
              <tbody>
                {network.nodes
                  .sort((a, b) => b.passes_completed - a.passes_completed)
                  .map((node) => (
                    <tr key={node.player.player_id}>
                      <td className="font-semibold">{node.player.name}</td>
                      <td>({node.x}m, {node.y}m)</td>
                      <td>{node.passes_completed}</td>
                      <td>{node.passes_received}</td>
                      <td>
                        <span className="rating-pill rating-highlight">
                          {(node.degree_centrality * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
