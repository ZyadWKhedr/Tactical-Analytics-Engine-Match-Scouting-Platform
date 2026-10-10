import { z } from 'zod';
import {
  BlueprintOutSchema,
  HealthSchema,
  MetaOutSchema,
  PassingNetworkOutSchema,
  ShotOutSchema,
  SquadRatingOutSchema,
  TeamSummarySchema,
  TeamXgOutSchema,
  ZonesOutSchema,
} from './schemas';
import type {
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
} from '../../api/types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

async function fetchValidated<T>(path: string, schema?: z.ZodType<T>): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${errorBody || res.statusText}`);
  }

  const raw = await res.json();
  if (schema) {
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      console.warn(`[Zod Validation Warning] on ${path}:`, parsed.error);
      return raw as T;
    }
    return parsed.data;
  }
  return raw as T;
}

export interface HealthResponse {
  api: string;
  db: 'ok' | 'down';
  latencyMs: number;
  status?: string;
  service?: string;
  version?: string;
}

export const apiClient = {
  getHealth: async (): Promise<HealthResponse> => {
    try {
      return await fetchValidated<HealthResponse>('/api/health', HealthSchema);
    } catch {
      // Fallback endpoint if /api/health is routed without prefix
      return await fetchValidated<HealthResponse>('/health', HealthSchema);
    }
  },

  getMeta: () => fetchValidated<MetaOut>('/api/v1/meta', MetaOutSchema),

  getTeams: (competitionId?: number) =>
    fetchValidated<TeamSummary[]>(
      competitionId ? `/api/v1/teams?competition_id=${competitionId}` : '/api/v1/teams',
      z.array(TeamSummarySchema)
    ),

  getTeam: (teamId: number) =>
    fetchValidated<TeamSummary>(`/api/v1/teams/${teamId}`, TeamSummarySchema),

  getBlueprint: (teamId: number) =>
    fetchValidated<BlueprintOut>(`/api/v1/teams/${teamId}/blueprint`, BlueprintOutSchema),

  getSwot: (teamId: number) =>
    fetchValidated<SwotOut>(`/api/v1/teams/${teamId}/swot`),

  getZones: (teamId: number) =>
    fetchValidated<ZonesOut>(`/api/v1/teams/${teamId}/zones`, ZonesOutSchema),

  getTeamXg: (teamId: number) =>
    fetchValidated<TeamXgOut>(`/api/v1/teams/${teamId}/xg`, TeamXgOutSchema),

  getSquadRatings: (competitionId?: number) =>
    fetchValidated<SquadRatingOut[]>(
      competitionId ? `/api/v1/ratings/squads?competition_id=${competitionId}` : '/api/v1/ratings/squads',
      z.array(SquadRatingOutSchema)
    ),

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
    return fetchValidated<PaginatedPlayers>(`/api/v1/ratings/players?${query.toString()}`);
  },

  getPlayerProfile: (playerId: number) =>
    fetchValidated<PlayerProfile>(`/api/v1/ratings/players/${playerId}`),

  getMatches: (params?: { competitionId?: number; teamId?: number; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.competitionId) query.set('competition_id', String(params.competitionId));
    if (params?.teamId) query.set('team_id', String(params.teamId));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));
    return fetchValidated<MatchSummary[]>(`/api/v1/matches?${query.toString()}`);
  },

  getMatchShots: (matchId: number) =>
    fetchValidated<ShotOut[]>(`/api/v1/matches/${matchId}/shots`, z.array(ShotOutSchema)),

  getPassingNetwork: (matchId: number, teamId: number, minPasses = 2) =>
    fetchValidated<PassingNetworkOut>(
      `/api/v1/matches/${matchId}/passing-network?team_id=${teamId}&min_passes=${minPasses}`,
      PassingNetworkOutSchema
    ),

  getHeatmap: (params?: {
    teamId?: number;
    playerId?: number;
    matchId?: number;
    typeId?: number;
    nx?: number;
    ny?: number;
    sigma?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.teamId) query.set('team_id', String(params.teamId));
    if (params?.playerId) query.set('player_id', String(params.playerId));
    if (params?.matchId) query.set('match_id', String(params.matchId));
    if (params?.typeId !== undefined) query.set('type_id', String(params.typeId));
    if (params?.nx) query.set('nx', String(params.nx));
    if (params?.ny) query.set('ny', String(params.ny));
    if (params?.sigma !== undefined) query.set('sigma', String(params.sigma));
    return fetchValidated<HeatmapOut>(`/api/v1/visuals/heatmap?${query.toString()}`);
  },

  getMatchup: (teamA: number, teamB: number) =>
    fetchValidated<MatchupOut>(`/api/v1/matchup?team_a=${teamA}&team_b=${teamB}`),
};
