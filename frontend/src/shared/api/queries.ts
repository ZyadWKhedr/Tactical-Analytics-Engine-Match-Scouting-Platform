import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';

export const queryKeys = {
  health: ['health'] as const,
  meta: ['meta'] as const,
  teams: (competitionId?: number) => ['teams', competitionId] as const,
  team: (teamId: number) => ['team', teamId] as const,
  blueprint: (teamId: number) => ['blueprint', teamId] as const,
  swot: (teamId: number) => ['swot', teamId] as const,
  zones: (teamId: number) => ['zones', teamId] as const,
  teamXg: (teamId: number) => ['teamXg', teamId] as const,
  squadRatings: (competitionId?: number) => ['squadRatings', competitionId] as const,
  playerRatings: (params?: Record<string, any>) => ['playerRatings', params] as const,
  playerProfile: (playerId: number) => ['playerProfile', playerId] as const,
  matches: (params?: Record<string, any>) => ['matches', params] as const,
  matchShots: (matchId: number) => ['matchShots', matchId] as const,
  passingNetwork: (matchId: number, teamId: number, minPasses?: number) =>
    ['passingNetwork', matchId, teamId, minPasses] as const,
  heatmap: (params?: Record<string, any>) => ['heatmap', params] as const,
  matchup: (teamA: number, teamB: number) => ['matchup', teamA, teamB] as const,
};

/**
 * Health telemetry polled every 30s.
 * Queries /api/health -> runs SELECT 1 against PostgreSQL on the backend.
 */
export function useHealthQuery() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => apiClient.getHealth(),
    refetchInterval: 30_000,
    staleTime: 15_000,
    retry: 2,
  });
}

export function useMetaQuery() {
  return useQuery({
    queryKey: queryKeys.meta,
    queryFn: () => apiClient.getMeta(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTeamsQuery(competitionId?: number) {
  return useQuery({
    queryKey: queryKeys.teams(competitionId),
    queryFn: () => apiClient.getTeams(competitionId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTeamQuery(teamId: number) {
  return useQuery({
    queryKey: queryKeys.team(teamId),
    queryFn: () => apiClient.getTeam(teamId),
    enabled: Boolean(teamId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useOpponentBlueprintQuery(teamId: number) {
  return useQuery({
    queryKey: queryKeys.blueprint(teamId),
    queryFn: () => apiClient.getBlueprint(teamId),
    enabled: Boolean(teamId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useSwotQuery(teamId: number) {
  return useQuery({
    queryKey: queryKeys.swot(teamId),
    queryFn: () => apiClient.getSwot(teamId),
    enabled: Boolean(teamId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useZonesQuery(teamId: number) {
  return useQuery({
    queryKey: queryKeys.zones(teamId),
    queryFn: () => apiClient.getZones(teamId),
    enabled: Boolean(teamId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useTeamXgQuery(teamId: number) {
  return useQuery({
    queryKey: queryKeys.teamXg(teamId),
    queryFn: () => apiClient.getTeamXg(teamId),
    enabled: Boolean(teamId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useSquadRatingsQuery(competitionId?: number) {
  return useQuery({
    queryKey: queryKeys.squadRatings(competitionId),
    queryFn: () => apiClient.getSquadRatings(competitionId),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlayerRatingsQuery(params?: {
  positionGroup?: string;
  minMinutes?: number;
  teamId?: number;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: queryKeys.playerRatings(params),
    queryFn: () => apiClient.getPlayerRatings(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useMatchesQuery(params?: { competitionId?: number; teamId?: number; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: queryKeys.matches(params),
    queryFn: () => apiClient.getMatches(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useMatchShotsQuery(matchId?: number) {
  return useQuery({
    queryKey: queryKeys.matchShots(matchId || 0),
    queryFn: () => apiClient.getMatchShots(matchId!),
    enabled: Boolean(matchId),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePassingNetworkQuery(matchId?: number, teamId?: number, minPasses = 2) {
  return useQuery({
    queryKey: queryKeys.passingNetwork(matchId || 0, teamId || 0, minPasses),
    queryFn: () => apiClient.getPassingNetwork(matchId!, teamId!, minPasses),
    enabled: Boolean(matchId && teamId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHeatmapQuery(params?: {
  teamId?: number;
  playerId?: number;
  matchId?: number;
  typeId?: number;
  nx?: number;
  ny?: number;
  sigma?: number;
}) {
  return useQuery({
    queryKey: queryKeys.heatmap(params),
    queryFn: () => apiClient.getHeatmap(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMatchupQuery(teamA?: number, teamB?: number) {
  return useQuery({
    queryKey: queryKeys.matchup(teamA || 0, teamB || 0),
    queryFn: () => apiClient.getMatchup(teamA!, teamB!),
    enabled: Boolean(teamA && teamB),
    staleTime: 2 * 60 * 1000,
  });
}
