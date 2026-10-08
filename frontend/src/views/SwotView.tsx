import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { SwotOut, TeamSummary } from '../api/types';
import { CheckCircle2, ChevronDown, Filter, HelpCircle, XCircle } from 'lucide-react';

interface Props {
  teams: TeamSummary[];
  selectedTeamId: number;
  onSelectTeamId: (id: number) => void;
}

export const SwotView: React.FC<Props> = ({ teams, selectedTeamId, onSelectTeamId }) => {
  const [swot, setSwot] = useState<SwotOut | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.getSwot(selectedTeamId)
      .then((data) => setSwot(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedTeamId]);

  const phases = swot
    ? ['All', ...Array.from(new Set(swot.metrics.map((m) => m.phase)))]
    : ['All'];

  const filteredMetrics = swot
    ? swot.metrics.filter((m) => selectedPhase === 'All' || m.phase === selectedPhase)
    : [];

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h2>⚡ Strengths & Weaknesses (SWOT Catalogue)</h2>
          <p className="subtitle">
            35+ verified tactical metrics across 9 phases of play evaluated against league distributions (percentile 0 – 100).
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
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
          >
            {phases.map((p) => (
              <option key={p} value={p}>
                Phase: {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading || !swot ? (
        <div className="loading-state">Loading SWOT tactical catalogue...</div>
      ) : (
        <div className="swot-layout">
          {/* Top Key Highlights */}
          <div className="split-columns">
            <div className="card card-strength">
              <h3 className="section-title text-green">
                <CheckCircle2 size={18} /> Top Strategic Strengths (≥ 75th %tile)
              </h3>
              <div className="swot-items-list">
                {swot.strengths.map((s, idx) => (
                  <div key={idx} className="swot-metric-row">
                    <div className="swot-metric-info">
                      <span className="metric-label">{s.label}</span>
                      <span className="metric-phase-pill">{s.phase}</span>
                    </div>
                    <div className="metric-percentile-wrap">
                      <span className="percentile-text text-green">{s.percentile.toFixed(1)}%</span>
                      <div className="progress-bar mini-bar">
                        <div
                          className="progress-fill fill-emerald"
                          style={{ width: `${s.percentile}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card card-weakness">
              <h3 className="section-title text-red">
                <XCircle size={18} /> Critical Vulnerabilities (≤ 25th %tile)
              </h3>
              <div className="swot-items-list">
                {swot.weaknesses.map((w, idx) => (
                  <div key={idx} className="swot-metric-row">
                    <div className="swot-metric-info">
                      <span className="metric-label">{w.label}</span>
                      <span className="metric-phase-pill">{w.phase}</span>
                    </div>
                    <div className="metric-percentile-wrap">
                      <span className="percentile-text text-red">{w.percentile.toFixed(1)}%</span>
                      <div className="progress-bar mini-bar">
                        <div
                          className="progress-fill fill-red"
                          style={{ width: `${w.percentile}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Full Metrics Inventory Table */}
          <div className="card">
            <h3 className="section-title">Full Metric Breakdown ({filteredMetrics.length} indicators)</h3>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Tactical Phase</th>
                    <th>Observed Value</th>
                    <th style={{ width: '220px' }}>League Percentile</th>
                    <th>Evaluation Verdict</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMetrics.map((m, idx) => {
                    const isStr = m.verdict.includes('strength');
                    const isWeak = m.verdict.includes('weakness');
                    return (
                      <tr key={idx} className="table-row-hover">
                        <td className="font-semibold">{m.label}</td>
                        <td>
                          <span className="tag-pill">{m.phase}</span>
                        </td>
                        <td>
                          {m.value !== null && m.value !== undefined
                            ? `${m.value.toFixed(2)} ${m.unit || ''}`
                            : '—'}
                        </td>
                        <td>
                          <div className="percentile-table-cell">
                            <span>{m.percentile.toFixed(1)}%</span>
                            <div className="progress-bar mini-bar">
                              <div
                                className={`progress-fill ${isStr ? 'fill-emerald' : isWeak ? 'fill-red' : 'fill-blue'}`}
                                style={{ width: `${m.percentile}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`verdict-pill ${
                              isStr ? 'verdict-green' : isWeak ? 'verdict-red' : 'verdict-gray'
                            }`}
                          >
                            {m.verdict}
                          </span>
                        </td>
                        <td className="description-cell">{m.description || '—'}</td>
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
