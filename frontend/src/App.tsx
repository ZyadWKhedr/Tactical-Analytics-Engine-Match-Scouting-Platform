import React, { useState, useEffect } from 'react';
import './App.css';
import { api } from './api/client';
import { MetaOut, TeamSummary } from './api/types';
import { OverviewView } from './views/OverviewView';
import { BlueprintView } from './views/BlueprintView';
import { SquadRatingsView } from './views/SquadRatingsView';
import { SwotView } from './views/SwotView';
import { XgView } from './views/XgView';
import { HeatmapView } from './views/HeatmapView';
import { PassingNetworkView } from './views/PassingNetworkView';
import { MatchupView } from './views/MatchupView';
import { PlayerRatingsView } from './views/PlayerRatingsView';
import {
  Activity,
  Award,
  Database,
  Flame,
  LayoutDashboard,
  Network,
  Shield,
  Swords,
  Target,
  Users,
  Zap,
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [meta, setMeta] = useState<MetaOut | null>(null);
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number>(1613); // Default: Newcastle United
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    api.getMeta()
      .then((m) => {
        setMeta(m);
        setConnected(true);
      })
      .catch((err) => {
        console.error('Failed to connect to API:', err);
        setConnected(false);
      });

    api.getTeams()
      .then((t) => {
        setTeams(t);
        if (t.length > 0 && !t.some((x) => x.team.team_id === selectedTeamId)) {
          setSelectedTeamId(t[0].team.team_id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSelectTeam = (teamId: number) => {
    setSelectedTeamId(teamId);
    setActiveTab('blueprint');
  };

  return (
    <div className="app-layout">
      {/* Tactical Navigation Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-title">
            <span style={{ fontSize: '1.4rem' }}>⚽</span>
            <span>TACTICAL OS</span>
          </div>
          <div className="brand-subtitle">Match Scouting Engine</div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} /> Executive Overview
          </button>

          <button
            className={`nav-item ${activeTab === 'blueprint' ? 'active' : ''}`}
            onClick={() => setActiveTab('blueprint')}
          >
            <Target size={18} /> Opponent Blueprint
          </button>

          <button
            className={`nav-item ${activeTab === 'squads' ? 'active' : ''}`}
            onClick={() => setActiveTab('squads')}
          >
            <Award size={18} /> Squad Ratings
          </button>

          <button
            className={`nav-item ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            <Users size={18} /> Player Scouting
          </button>

          <button
            className={`nav-item ${activeTab === 'swot' ? 'active' : ''}`}
            onClick={() => setActiveTab('swot')}
          >
            <Zap size={18} /> Strengths / Weaknesses
          </button>

          <button
            className={`nav-item ${activeTab === 'xg' ? 'active' : ''}`}
            onClick={() => setActiveTab('xg')}
          >
            <Activity size={18} /> Expected Goals (xG)
          </button>

          <button
            className={`nav-item ${activeTab === 'networks' ? 'active' : ''}`}
            onClick={() => setActiveTab('networks')}
          >
            <Network size={18} /> Passing Networks
          </button>

          <button
            className={`nav-item ${activeTab === 'heatmaps' ? 'active' : ''}`}
            onClick={() => setActiveTab('heatmaps')}
          >
            <Flame size={18} /> Action Heatmaps
          </button>

          <button
            className={`nav-item ${activeTab === 'matchup' ? 'active' : ''}`}
            onClick={() => setActiveTab('matchup')}
          >
            <Swords size={18} /> Matchup Simulator
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="connection-indicator">
            <span className={`status-dot ${connected ? '' : 'dot-red'}`} />
            <span>{connected ? 'PostgreSQL Active (1.9k games)' : 'Connecting to API...'}</span>
          </div>
        </div>
      </aside>

      {/* Main Analytical Dashboard Content */}
      <main className="main-content">
        {activeTab === 'overview' && (
          <OverviewView meta={meta} onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'blueprint' && (
          <BlueprintView
            teams={teams}
            selectedTeamId={selectedTeamId}
            onSelectTeamId={setSelectedTeamId}
          />
        )}

        {activeTab === 'squads' && (
          <SquadRatingsView
            competitions={meta?.competitions || []}
            onSelectTeam={handleSelectTeam}
          />
        )}

        {activeTab === 'players' && <PlayerRatingsView />}

        {activeTab === 'swot' && (
          <SwotView
            teams={teams}
            selectedTeamId={selectedTeamId}
            onSelectTeamId={setSelectedTeamId}
          />
        )}

        {activeTab === 'xg' && (
          <XgView
            teams={teams}
            selectedTeamId={selectedTeamId}
            onSelectTeamId={setSelectedTeamId}
          />
        )}

        {activeTab === 'networks' && (
          <PassingNetworkView teams={teams} selectedTeamId={selectedTeamId} />
        )}

        {activeTab === 'heatmaps' && (
          <HeatmapView
            teams={teams}
            selectedTeamId={selectedTeamId}
            onSelectTeamId={setSelectedTeamId}
          />
        )}

        {activeTab === 'matchup' && (
          <MatchupView teams={teams} defaultTeamA={selectedTeamId} />
        )}
      </main>
    </div>
  );
}

export default App;
