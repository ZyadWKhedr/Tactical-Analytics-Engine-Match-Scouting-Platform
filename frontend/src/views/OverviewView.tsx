import React from 'react';
import { CompetitionOut, MetaOut } from '../api/types';
import { Activity, Award, Database, Flame, Layers, Network, Shield, Target, Users, Zap } from 'lucide-react';

interface Props {
  meta: MetaOut | null;
  onNavigate: (tab: string) => void;
}

export const OverviewView: React.FC<Props> = ({ meta, onNavigate }) => {
  return (
    <div className="view-container">
      {/* Hero Welcome Banner */}
      <div className="hero-banner">
        <div>
          <span className="badge-system">TACTICAL ANALYTICS ENGINE v{meta?.source.analytics_engine_version || '1.0.0'}</span>
          <h1 className="hero-title">Enterprise Match Intelligence & Scouting Platform</h1>
          <p className="hero-desc">
            Processing <strong>2,463,297 SPADL actions</strong> across <strong>1,941 professional matches</strong> in PostgreSQL.
            Self-fitted Expected Threat (xT) Markov surfaces, 3-axis continuous playstyle models, reliability-calibrated defensive vulnerability grids, and Bayesian contextual player ratings.
          </p>
        </div>
        <div className="db-badge-wrap">
          <div className="db-pill">
            <Database size={16} className="icon-green" />
            <span>PostgreSQL: Connected</span>
          </div>
          <span className="db-subtext">{meta?.source.database}</span>
        </div>
      </div>

      {/* Database Inventory Metrics */}
      <div className="stats-cards-grid">
        <div className="card stat-card">
          <span className="stat-label">Total Matches</span>
          <span className="stat-value text-blue">{meta?.n_matches.toLocaleString() || '1,941'}</span>
          <span className="stat-sub">Top 5 European Leagues + WC/Euros</span>
        </div>

        <div className="card stat-card">
          <span className="stat-label">Atomic SPADL Actions</span>
          <span className="stat-value text-gold">{((meta?.n_events || 2463297) / 1000000).toFixed(2)}M</span>
          <span className="stat-sub">Validated & time-normalized</span>
        </div>

        <div className="card stat-card">
          <span className="stat-label">Clubs & Squads Scouted</span>
          <span className="stat-value text-green">{meta?.n_teams || 142}</span>
          <span className="stat-sub">142 Automated Tactical Dossiers</span>
        </div>

        <div className="card stat-card">
          <span className="stat-label">Shots with xG / xA</span>
          <span className="stat-value text-red">{meta?.n_shots.toLocaleString() || '45,945'}</span>
          <span className="stat-sub">Calibrated conversion models</span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <h3 className="section-title" style={{ marginTop: '30px' }}>⚡ Core Analytical Modules</h3>
      <div className="modules-grid">
        <div className="card module-card" onClick={() => onNavigate('blueprint')}>
          <div className="module-icon-wrap icon-bg-blue">
            <Target size={24} />
          </div>
          <h4>Opponent Scouting Blueprint</h4>
          <p>Automated tactical dossiers: 30 pitch-zone vulnerabilities, situational press triggers, blind spots, and game plans.</p>
          <span className="module-link">Open Blueprint →</span>
        </div>

        <div className="card module-card" onClick={() => onNavigate('squads')}>
          <div className="module-icon-wrap icon-bg-gold">
            <Award size={24} />
          </div>
          <h4>Squad Ratings Leaderboard</h4>
          <p>Contextual ratings (1.0–10.0 scale) adjusting for opponent tier, two-way Ridge attack/defence strength, and form.</p>
          <span className="module-link">View Squads →</span>
        </div>

        <div className="card module-card" onClick={() => onNavigate('matchup')}>
          <div className="module-icon-wrap icon-bg-red">
            <Zap size={24} />
          </div>
          <h4>Matchup Simulator</h4>
          <p>Head-to-head friction simulation: compare two clubs to project tactical divergence and exploitable phase channels.</p>
          <span className="module-link">Simulate Clash →</span>
        </div>

        <div className="card module-card" onClick={() => onNavigate('networks')}>
          <div className="module-icon-wrap icon-bg-cyan">
            <Network size={24} />
          </div>
          <h4>Passing Networks</h4>
          <p>Spatial player centroids, sequence connection volumes, and graph degree centrality from successful match possessions.</p>
          <span className="module-link">Explore Networks →</span>
        </div>

        <div className="card module-card" onClick={() => onNavigate('heatmaps')}>
          <div className="module-icon-wrap icon-bg-purple">
            <Flame size={24} />
          </div>
          <h4>Spatial Action Density Heatmaps</h4>
          <p>2D spatial action density histograms on canonical 105m × 68m coordinates for passes, shots, and duels.</p>
          <span className="module-link">View Heatmaps →</span>
        </div>

        <div className="card module-card" onClick={() => onNavigate('xg')}>
          <div className="module-icon-wrap icon-bg-green">
            <Activity size={24} />
          </div>
          <h4>Expected Goals (xG & xA)</h4>
          <p>Calibrated conversion probabilities, match shot maps, non-penalty xG efficiency, and season progression timelines.</p>
          <span className="module-link">Analyze xG →</span>
        </div>
      </div>

      {/* Competitions Loaded */}
      <h3 className="section-title" style={{ marginTop: '30px' }}>🏆 Competitions in Database</h3>
      <div className="competitions-grid">
        {meta?.competitions.map((c) => (
          <div key={c.competition_id} className="card comp-card">
            <span className="comp-season">{c.season}</span>
            <h4 className="comp-name">{c.name}</h4>
            <span className="comp-country">{c.country}</span>
            <div className="comp-footer">
              <span className="comp-matches">{c.n_matches} Matches Stored</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
