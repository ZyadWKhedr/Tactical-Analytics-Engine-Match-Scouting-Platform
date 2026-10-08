import {
  BlueprintOut,
  HeatmapOut,
  MatchSummary,
  MatchupOut,
  MetaOut,
  PaginatedPlayers,
  PassingNetworkOut,
  PlayerProfile,
  ShotOut,
  SquadRatingOut,
  SwotOut,
  TeamSummary,
  TeamXgOut,
  ZonesOut,
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api/v1';

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${errorBody || res.statusText}`);
  }
  return res.json();
}

export const api = {
  getMeta: () => fetchJson<MetaOut>('/meta'),
  getTeams: (competitionId?: number) =>
    fetchJson<TeamSummary[]>(competitionId ? `/teams?competition_id=${competitionId}` : '/teams'),
  getTeam: (teamId: number) => fetchJson<TeamSummary>(`/teams/${teamId}`),
  getBlueprint: (teamId: number) => fetchJson<BlueprintOut>(`/teams/${teamId}/blueprint`),
  getSwot: (teamId: number) => fetchJson<SwotOut>(`/teams/${teamId}/swot`),
  getZones: (teamId: number) => fetchJson<ZonesOut>(`/teams/${teamId}/zones`),
  getTeamXg: (teamId: number) => fetchJson<TeamXgOut>(`/teams/${teamId}/xg`),
  getSquadRatings: (competitionId?: number) =>
    fetchJson<SquadRatingOut[]>(competitionId ? `/ratings/squads?competition_id=${competitionId}` : '/ratings/squads'),
  getPlayerRatings: (params?: {
    positionGroup?: string;
    minMinutes?: number;
    teamId?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.positionGroup && params.positionGroup !== 'All') query.set('position_group', params.positionGroup);
    if (params?.minMinutes !== undefined) query.set('min_minutes', String(params.minMinutes));
    if (params?.teamId) query.set('team_id', String(params.teamId));
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    return fetchJson<PaginatedPlayers>(`/ratings/players?${query.toString()}`);
  },
  getPlayerProfile: (playerId: number) => fetchJson<PlayerProfile>(`/ratings/players/${playerId}`),
  getMatches: (params?: { competitionId?: number; teamId?: number; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.competitionId) query.set('competition_id', String(params.competitionId));
    if (params?.teamId) query.set('team_id', String(params.teamId));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    return fetchJson<MatchSummary[]>(`/matches?${query.toString()}`);
  },
  getMatchShots: (matchId: number) => fetchJson<ShotOut[]>(`/matches/${matchId}/shots`),
  getPassingNetwork: (matchId: number, teamId: number, minPasses = 2) =>
    fetchJson<PassingNetworkOut>(`/matches/${matchId}/passing-network?team_id=${teamId}&min_passes=${minPasses}`),
  getHeatmap: (params?: { teamId?: number; playerId?: number; matchId?: number; typeId?: number; nx?: number; ny?: number }) => {
    const query = new URLSearchParams();
    if (params?.teamId) query.set('team_id', String(params.teamId));
    if (params?.playerId) query.set('player_id', String(params.playerId));
    if (params?.matchId) query.set('match_id', String(params.matchId));
    if (params?.typeId !== undefined) query.set('type_id', String(params.typeId));
    if (params?.nx) query.set('nx', String(params.nx));
    if (params?.ny) query.set('ny', String(params.ny));
    return fetchJson<HeatmapOut>(`/visuals/heatmap?${query.toString()}`);
  },
  getMatchup: (teamA: number, teamB: number) => fetchJson<MatchupOut>(`/matchup?team_a=${teamA}&team_b=${teamB}`),
};
