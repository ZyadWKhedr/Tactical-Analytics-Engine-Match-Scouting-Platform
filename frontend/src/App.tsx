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
  const [matchupTeamB, setMatchupTeamB] = useState<number>(1659); // Default: AFC Bournemouth
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let isSubscribed = true;

    const pollApi = async () => {
      try {
        const m = await api.getMeta();
        if (!isSubscribed) return;
        setMeta(m);
        setConnected(true);

        const t = await api.getTeams();
        if (!isSubscribed) return;
        setTeams(t);
        if (t.length > 0 && !t.some((x) => x.team.team_id === selectedTeamId)) {
          setSelectedTeamId(t[0].team.team_id);
          if (t.length > 1) {
            setMatchupTeamB(t[1].team.team_id);
          }
        }
      } catch {
        if (!isSubscribed) return;
        setConnected(false);
        // Retry every 1.5 seconds until backend finishes initializing
        timer = setTimeout(pollApi, 1500);
      }
    };

    pollApi();
    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, []);

  const handleSelectTeamId = (teamId: number) => {
    if (teamId === matchupTeamB) {
      // Auto-swap: Team B gets the previous active team so duplicates never occur
      setMatchupTeamB(selectedTeamId);
    }
    setSelectedTeamId(teamId);
  };

  const handleSelectTeam = (teamId: number) => {
    handleSelectTeamId(teamId);
    setActiveTab('blueprint');
  };

  return (
    <div className="app-layout">
      {/* Tactical Navigation Sidebar */}
      <aside className="sidebar">
        <div
          className="sidebar-header"
          onClick={() => setActiveTab('overview')}
          title="Return to Executive Overview"
        >
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
            onSelectTeamId={handleSelectTeamId}
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
            onSelectTeamId={handleSelectTeamId}
          />
        )}

        {activeTab === 'xg' && (
          <XgView
            teams={teams}
            selectedTeamId={selectedTeamId}
            onSelectTeamId={handleSelectTeamId}
          />
        )}

        {activeTab === 'networks' && (
          <PassingNetworkView teams={teams} selectedTeamId={selectedTeamId} />
        )}

        {activeTab === 'heatmaps' && (
          <HeatmapView
            teams={teams}
            selectedTeamId={selectedTeamId}
            onSelectTeamId={handleSelectTeamId}
          />
        )}

        {activeTab === 'matchup' && (
          <MatchupView
            teams={teams}
            teamA={selectedTeamId}
            teamB={matchupTeamB}
            onSelectTeamA={(newA) => {
              if (newA === matchupTeamB) {
                setMatchupTeamB(selectedTeamId);
              }
              setSelectedTeamId(newA);
            }}
            onSelectTeamB={(newB) => {
              if (newB === selectedTeamId) {
                setSelectedTeamId(matchupTeamB);
              }
              setMatchupTeamB(newB);
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;
