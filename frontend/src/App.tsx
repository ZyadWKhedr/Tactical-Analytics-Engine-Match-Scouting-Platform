import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell, NavTab } from './features/layout/AppShell';
import { HomePage } from './features/home/HomePage';
import { OpponentReportPage } from './features/opponent/OpponentReportPage';
import { SquadRatingsPage } from './features/squad/SquadRatingsPage';
import { PlayerScoutingPage } from './features/players/PlayerScoutingPage';
import { MatchupSimulatorPage } from './features/matchup/MatchupSimulatorPage';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { useUrlState } from './shared/lib/useUrlState';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

function DashboardApp() {
  const { getParam, getNumParam, setParams } = useUrlState();

  const urlTab = (getParam('tab', 'home') as NavTab) || 'home';
  const urlTeamId = getNumParam('teamId', 1613); // Default to Newcastle United (1613)
  const urlCompId = getNumParam('competitionId', undefined);

  const [activeTab, setActiveTab] = useState<NavTab>(urlTab);
  const [selectedTeamId, setSelectedTeamId] = useState<number>(urlTeamId || 1613);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<number | undefined>(urlCompId);
  const [matchupTeamB, setMatchupTeamB] = useState<number>(1659); // AFC Bournemouth

  // Synchronize state changes to URL query parameters
  useEffect(() => {
    setParams({
      tab: activeTab,
      teamId: selectedTeamId,
      competitionId: selectedCompetitionId ?? null,
    });
  }, [activeTab, selectedTeamId, selectedCompetitionId, setParams]);

  const handleSelectTeam = (teamId: number) => {
    setSelectedTeamId(teamId);
    setActiveTab('opponent');
  };

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      selectedTeamId={selectedTeamId}
      onSelectTeamId={setSelectedTeamId}
      selectedCompetitionId={selectedCompetitionId}
      onSelectCompetitionId={setSelectedCompetitionId}
    >
      {activeTab === 'home' && (
        <HomePage
          selectedTeamId={selectedTeamId}
          onNavigateToOpponent={handleSelectTeam}
          onNavigateToSquads={() => setActiveTab('squads')}
        />
      )}

      {activeTab === 'opponent' && (
        <OpponentReportPage teamId={selectedTeamId} />
      )}

      {activeTab === 'squads' && (
        <SquadRatingsPage
          selectedCompetitionId={selectedCompetitionId}
          onSelectTeam={handleSelectTeam}
        />
      )}

      {activeTab === 'players' && (
        <PlayerScoutingPage />
      )}

      {activeTab === 'matchup' && (
        <MatchupSimulatorPage
          teamAId={selectedTeamId}
          teamBId={matchupTeamB}
          onSelectTeamA={setSelectedTeamId}
          onSelectTeamB={setMatchupTeamB}
        />
      )}
    </AppShell>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <DashboardApp />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
