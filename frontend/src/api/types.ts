export interface TeamRef {
  team_id: number;
  name: string;
  country?: string | null;
  team_type?: 'club' | 'national' | null;
}

export interface PlayerRef {
  player_id: number;
  name: string;
}

export interface CompetitionOut {
  competition_id: number;
  season_id: number;
  name: string;
  season: string;
  country: string;
  n_matches: number;
}

export interface MetaOut {
  n_competitions: number;
  n_matches: number;
  n_events: number;
  n_teams: number;
  n_players: number;
  n_shots: number;
  competitions: CompetitionOut[];
  source: {
    database: string;
    database_ok: boolean;
    analytics_dir: string;
    analytics_engine_version: string;
  };
}

export interface PlaystyleAxes {
  possession_dominance: number;
  low_block: number;
  press_intensity: number;
  directness?: number | null;
  width_usage?: number | null;
  transition_threat?: number | null;
}

export interface PlaystyleOut {
  label: string;
  confidence: number;
  archetype?: string | null;
  descriptors?: string | null;
  axes: PlaystyleAxes;
}

export interface RatingTriplet {
  team: number;
  attack: number;
  defence: number;
}

export interface TeamSummary {
  team: TeamRef;
  competition_id?: number | null;
  competition_name?: string | null;
  matches: number;
  rating: RatingTriplet;
  playstyle: PlaystyleOut;
}

export interface SquadRatingOut {
  rank: number;
  team: TeamRef;
  competition_name?: string | null;
  matches: number;
  team_rating: number;
  attack_rating: number;
  defence_rating: number;
  overall_strength?: number | null;
  form_z?: number | null;
  goal_diff_p90?: number | null;
  xt_diff_p90?: number | null;
  playstyle?: string | null;
}

export interface RatingComponents {
  progression?: number | null;
  creation?: number | null;
  finishing?: number | null;
  retention?: number | null;
  defending?: number | null;
  discipline?: number | null;
}

export interface PlayerRatingOut {
  player: PlayerRef;
  team?: TeamRef | null;
  position_group?: string | null;
  position_confidence?: number | null;
  matches: number;
  minutes: number;
  rating: number;
  percentile_overall?: number | null;
  percentile_in_position?: number | null;
  components: RatingComponents;
  goals: number;
  xg: number;
  xa: number;
}

export interface PaginatedPlayers {
  total: number;
  items: PlayerRatingOut[];
}

export interface PressTrigger {
  trigger: string;
  engagement_rate: number;
  league_rate: number;
  lift: number;
  z: number;
  opportunities: number;
}

export interface ZoneSummary {
  zone: string;
  vulnerability_index: number;
  z?: number | null;
  opponent_entries?: number | null;
  xt_conceded_per_entry?: number | null;
  shot_chains_conceded?: number | null;
  goals_conceded_via_zone?: number | null;
  clean_recovery_rate?: number | null;
}

export interface SwotItem {
  metric: string;
  label: string;
  phase: string;
  value?: number | null;
  unit?: string | null;
  percentile: number;
  higher_is_better?: boolean | null;
  description?: string | null;
  verdict: string;
}

export interface SwotOut {
  team: TeamRef;
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  phase_scores: Record<string, number>;
  metrics: SwotItem[];
  profile_balance?: number | null;
}

export interface ZoneCell {
  zone_id: number;
  zone_name: string;
  band: number;
  channel: number;
  band_name: string;
  channel_name: string;
  corridor: 'flank' | 'half_space' | 'central';
  vulnerability_index: number;
  conceded_entries_p90: number;
  conceded_xt_per_entry: number;
  conceded_shot_chains: number;
  conceded_goals: number;
  clean_recovery_rate?: number | null;
  exposure_rank_in_team?: number | null;
}

export interface CorridorSummary {
  corridor: 'flank' | 'half_space' | 'central';
  mean_vulnerability: number;
  conceded_shot_chains: number;
  conceded_goals: number;
}

export interface ZonesOut {
  team: TeamRef;
  grid: ZoneCell[];
  corridors: CorridorSummary[];
  entry_routes: Record<string, number>;
}

export interface TopPlayer {
  player: PlayerRef;
  position?: string | null;
  minutes?: number | null;
  rating: number;
  percentile_in_position?: number | null;
}

export interface BlueprintOut {
  team: TeamRef;
  competition_name?: string | null;
  matches: number;
  rating: RatingTriplet;
  playstyle: PlaystyleOut;
  sequence_predictability?: number | null;
  press_triggers: PressTrigger[];
  press_blind_spots: PressTrigger[];
  most_vulnerable_zones: ZoneSummary[];
  most_solid_zones: ZoneSummary[];
  most_attacked_zone?: string | null;
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  phase_scores: Record<string, number>;
  top_players: TopPlayer[];
  game_plan: string[];
}

export interface XgMatchRow {
  match_id: number;
  kickoff_utc: string;
  opponent: TeamRef;
  is_home: boolean;
  goals_for: number;
  goals_against: number;
  xg_for: number;
  xg_against: number;
}

export interface XgPlayerRow {
  player: PlayerRef;
  shots: number;
  goals: number;
  xg: number;
  xa: number;
  key_passes: number;
}

export interface TeamXgOut {
  team: TeamRef;
  matches: number;
  shots_for: number;
  shots_against: number;
  goals_for: number;
  goals_against: number;
  xg_for: number;
  xg_against: number;
  npxg_for: number;
  xg_per_shot: number;
  timeline: XgMatchRow[];
  top_players: XgPlayerRow[];
}

export interface ShotOut {
  action_id: number;
  team_id: number;
  player: PlayerRef;
  period_id: number;
  minute: number;
  x: number;
  y: number;
  xg: number;
  is_goal: boolean;
  shot_type: string;
  bodypart: string;
  assister?: PlayerRef | null;
  xa?: number | null;
}

export interface MatchSummary {
  match_id: number;
  competition_id: number;
  competition_name: string;
  gameweek?: number | null;
  kickoff_utc: string;
  venue?: string | null;
  home: TeamRef;
  away: TeamRef;
  home_score: number;
  away_score: number;
  home_xg?: number | null;
  away_xg?: number | null;
}

export interface HeatmapOut {
  nx: number;
  ny: number;
  pitch_length: number;
  pitch_width: number;
  counts: number[][];
  max_count: number;
  n_actions: number;
  filter: Record<string, any>;
  density: number[][];
  sigma: number;
  p98_count: number;
}

export interface NetworkNode {
  player: PlayerRef;
  x: number;
  y: number;
  passes_completed: number;
  passes_received: number;
  degree_centrality: number;
  betweenness: number;
}

export interface NetworkEdge {
  source: number;
  target: number;
  count: number;
}

export interface PassingNetworkOut {
  match_id: number;
  team: TeamRef;
  min_passes: number;
  total_passes: number;
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface MatchupEdge {
  phase: string;
  attacker_score: number;
  defender_score: number;
  gap: number;
}

export interface MatchupSide {
  team: TeamRef;
  rating: RatingTriplet;
  playstyle: PlaystyleOut;
  exploitable_phases: MatchupEdge[];
  target_zones: ZoneSummary[];
}

export interface MatchupOut {
  team_a: MatchupSide;
  team_b: MatchupSide;
  rating_edge: number;
  axis_deltas: Record<string, number>;
  head_to_head: MatchSummary[];
}

export interface PlayerProfile {
  player: PlayerRef;
  full_name?: string | null;
  role?: string | null;
  birth_date?: string | null;
  height_cm?: number | null;
  foot?: string | null;
  nationality?: string | null;
  current_team?: TeamRef | null;
  appearances: number;
  starts: number;
  minutes_played: number;
  rating?: PlayerRatingOut | null;
  shots: number;
  goals: number;
  xg: number;
  xa: number;
  key_passes: number;
}
