import { z } from 'zod';

export const HealthSchema = z.object({
  api: z.string().default('ok'),
  db: z.enum(['ok', 'down']).default('ok'),
  latencyMs: z.number().default(0),
  status: z.string().optional(),
  service: z.string().optional(),
  version: z.string().optional(),
});

export const TeamRefSchema = z.object({
  team_id: z.number(),
  name: z.string(),
  country: z.string().nullable().optional(),
  team_type: z.enum(['club', 'national']).nullable().optional(),
});

export const PlayerRefSchema = z.object({
  player_id: z.number(),
  name: z.string(),
});

export const CompetitionOutSchema = z.object({
  competition_id: z.number(),
  season_id: z.number(),
  name: z.string(),
  season: z.string(),
  country: z.string(),
  n_matches: z.number(),
});

export const DataSourceInfoSchema = z.object({
  database: z.string(),
  database_ok: z.boolean(),
  analytics_dir: z.string(),
  analytics_engine_version: z.string(),
});

export const MetaOutSchema = z.object({
  n_competitions: z.number(),
  n_matches: z.number(),
  n_events: z.number(),
  n_teams: z.number(),
  n_players: z.number(),
  n_shots: z.number(),
  competitions: z.array(CompetitionOutSchema),
  source: DataSourceInfoSchema,
});

export const PlaystyleAxesSchema = z.object({
  possession_dominance: z.number(),
  low_block: z.number(),
  press_intensity: z.number(),
  directness: z.number().nullable().optional(),
  width_usage: z.number().nullable().optional(),
  transition_threat: z.number().nullable().optional(),
});

export const PlaystyleOutSchema = z.object({
  label: z.string(),
  confidence: z.number(),
  archetype: z.string().nullable().optional(),
  descriptors: z.string().nullable().optional(),
  axes: PlaystyleAxesSchema,
});

export const RatingTripletSchema = z.object({
  team: z.number(),
  attack: z.number(),
  defence: z.number(),
});

export const TeamSummarySchema = z.object({
  team: TeamRefSchema,
  competition_id: z.number().nullable().optional(),
  competition_name: z.string().nullable().optional(),
  matches: z.number(),
  rating: RatingTripletSchema,
  playstyle: PlaystyleOutSchema,
});

export const SquadRatingOutSchema = z.object({
  rank: z.number(),
  team: TeamRefSchema,
  competition_name: z.string().nullable().optional(),
  matches: z.number(),
  team_rating: z.number(),
  attack_rating: z.number(),
  defence_rating: z.number(),
  overall_strength: z.number().nullable().optional(),
  form_z: z.number().nullable().optional(),
  goal_diff_p90: z.number().nullable().optional(),
  xt_diff_p90: z.number().nullable().optional(),
  playstyle: z.string().nullable().optional(),
});

export const PressTriggerSchema = z.object({
  trigger: z.string(),
  engagement_rate: z.number(),
  league_rate: z.number(),
  lift: z.number(),
  z: z.number(),
  opportunities: z.number(),
});

export const ZoneSummarySchema = z.object({
  zone: z.string(),
  vulnerability_index: z.number(),
  z: z.number().nullable().optional(),
  opponent_entries: z.number().nullable().optional(),
  xt_conceded_per_entry: z.number().nullable().optional(),
  shot_chains_conceded: z.number().nullable().optional(),
  goals_conceded_via_zone: z.number().nullable().optional(),
  clean_recovery_rate: z.number().nullable().optional(),
});

export const SwotItemSchema = z.object({
  metric: z.string(),
  label: z.string(),
  phase: z.string(),
  value: z.number().nullable().optional(),
  unit: z.string().nullable().optional(),
  percentile: z.number(),
  higher_is_better: z.boolean().nullable().optional(),
  description: z.string().nullable().optional(),
  verdict: z.string(),
});

export const TopPlayerSchema = z.object({
  player: PlayerRefSchema,
  position: z.string().nullable().optional(),
  minutes: z.number().nullable().optional(),
  rating: z.number(),
  percentile_in_position: z.number().nullable().optional(),
});

export const BlueprintOutSchema = z.object({
  team: TeamRefSchema,
  competition_name: z.string().nullable().optional(),
  matches: z.number(),
  rating: RatingTripletSchema,
  playstyle: PlaystyleOutSchema,
  sequence_predictability: z.number().nullable().optional(),
  press_triggers: z.array(PressTriggerSchema),
  press_blind_spots: z.array(PressTriggerSchema),
  most_vulnerable_zones: z.array(ZoneSummarySchema),
  most_solid_zones: z.array(ZoneSummarySchema),
  most_attacked_zone: z.string().nullable().optional(),
  strengths: z.array(SwotItemSchema),
  weaknesses: z.array(SwotItemSchema),
  phase_scores: z.record(z.string(), z.number()),
  top_players: z.array(TopPlayerSchema),
  game_plan: z.array(z.string()),
});

export const ShotOutSchema = z.object({
  action_id: z.number(),
  team_id: z.number(),
  player: PlayerRefSchema,
  period_id: z.number(),
  minute: z.number(),
  x: z.number(),
  y: z.number(),
  xg: z.number(),
  is_goal: z.boolean(),
  shot_type: z.string(),
  bodypart: z.string(),
  assister: PlayerRefSchema.nullable().optional(),
  xa: z.number().nullable().optional(),
});

export const NetworkNodeSchema = z.object({
  player: PlayerRefSchema,
  x: z.number(),
  y: z.number(),
  passes_completed: z.number(),
  passes_received: z.number(),
  degree_centrality: z.number(),
  betweenness: z.number(),
});

export const NetworkEdgeSchema = z.object({
  source: z.number(),
  target: z.number(),
  count: z.number(),
});

export const PassingNetworkOutSchema = z.object({
  match_id: z.number(),
  team: TeamRefSchema,
  min_passes: z.number(),
  total_passes: z.number(),
  nodes: z.array(NetworkNodeSchema),
  edges: z.array(NetworkEdgeSchema),
});

export const ZoneCellSchema = z.object({
  zone_id: z.number(),
  zone_name: z.string(),
  band: z.number(),
  channel: z.number(),
  band_name: z.string(),
  channel_name: z.string(),
  corridor: z.enum(['flank', 'half_space', 'central']),
  vulnerability_index: z.number(),
  conceded_entries_p90: z.number(),
  conceded_xt_per_entry: z.number(),
  conceded_shot_chains: z.number(),
  conceded_goals: z.number(),
  clean_recovery_rate: z.number().nullable().optional(),
  exposure_rank_in_team: z.number().nullable().optional(),
});

export const ZonesOutSchema = z.object({
  team: TeamRefSchema,
  grid: z.array(ZoneCellSchema),
  corridors: z.array(
    z.object({
      corridor: z.enum(['flank', 'half_space', 'central']),
      mean_vulnerability: z.number(),
      conceded_shot_chains: z.number(),
      conceded_goals: z.number(),
    })
  ),
  entry_routes: z.record(z.string(), z.number()),
});

export const XgMatchRowSchema = z.object({
  match_id: z.number(),
  kickoff_utc: z.string(),
  opponent: TeamRefSchema,
  is_home: z.boolean(),
  goals_for: z.number(),
  goals_against: z.number(),
  xg_for: z.number(),
  xg_against: z.number(),
});

export const XgPlayerRowSchema = z.object({
  player: PlayerRefSchema,
  shots: z.number(),
  goals: z.number(),
  xg: z.number(),
  xa: z.number(),
  key_passes: z.number(),
});

export const TeamXgOutSchema = z.object({
  team: TeamRefSchema,
  matches: z.number(),
  shots_for: z.number(),
  shots_against: z.number(),
  goals_for: z.number(),
  goals_against: z.number(),
  xg_for: z.number(),
  xg_against: z.number(),
  npxg_for: z.number(),
  xg_per_shot: z.number(),
  timeline: z.array(XgMatchRowSchema),
  top_players: z.array(XgPlayerRowSchema),
});
