"""
API response contracts (Pydantic v2).

These models are the single source of truth for the REST interface. FastAPI
renders them as OpenAPI at ``/docs``; the React client mirrors them in
``frontend/src/api/types.ts``.

Scales (docs/06 §3.2): ratings 1-10 (μ = 6.5), percentiles / indices 0-100,
coordinates 105 x 68 m attacking left -> right.
"""
from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


# ----------------------------------------------------------------------------- shared
class TeamRef(BaseModel):
    team_id: int
    name: str
    country: str | None = None
    team_type: Literal["club", "national"] | None = None


class PlayerRef(BaseModel):
    player_id: int
    name: str


class CompetitionOut(BaseModel):
    competition_id: int
    season_id: int
    name: str
    season: str
    country: str
    n_matches: int


class DataSourceInfo(BaseModel):
    database: str = Field(description="PostgreSQL server (password hidden)")
    database_ok: bool
    analytics_dir: str
    analytics_engine_version: str


class MetaOut(BaseModel):
    n_competitions: int
    n_matches: int
    n_events: int
    n_teams: int
    n_players: int
    n_shots: int
    competitions: list[CompetitionOut]
    source: DataSourceInfo


# ----------------------------------------------------------------------------- teams / ratings
class PlaystyleAxes(BaseModel):
    possession_dominance: float
    low_block: float
    press_intensity: float
    directness: float | None = None
    width_usage: float | None = None
    transition_threat: float | None = None


class PlaystyleOut(BaseModel):
    label: str
    confidence: float
    archetype: str | None = None
    descriptors: str | None = None
    axes: PlaystyleAxes


class RatingTriplet(BaseModel):
    team: float = Field(ge=1, le=10)
    attack: float = Field(ge=1, le=10)
    defence: float = Field(ge=1, le=10)


class TeamSummary(BaseModel):
    team: TeamRef
    competition_id: int | None
    competition_name: str | None
    matches: int
    rating: RatingTriplet
    playstyle: PlaystyleOut


class SquadRatingOut(BaseModel):
    rank: int
    team: TeamRef
    competition_name: str | None
    matches: int
    team_rating: float
    attack_rating: float
    defence_rating: float
    overall_strength: float | None
    form_z: float | None
    goal_diff_p90: float | None
    xt_diff_p90: float | None
    playstyle: str | None


class RatingComponents(BaseModel):
    progression: float | None
    creation: float | None
    finishing: float | None
    retention: float | None
    defending: float | None
    discipline: float | None


class PlayerRatingOut(BaseModel):
    player: PlayerRef
    team: TeamRef | None
    position_group: str | None
    position_confidence: float | None
    matches: int
    minutes: float
    rating: float = Field(ge=1, le=10)
    percentile_overall: float | None
    percentile_in_position: float | None
    components: RatingComponents
    goals: int = 0
    xg: float = 0.0
    xa: float = 0.0


class PaginatedPlayers(BaseModel):
    total: int
    items: list[PlayerRatingOut]


# ----------------------------------------------------------------------------- blueprint / swot / zones
class PressTrigger(BaseModel):
    trigger: str
    engagement_rate: float
    league_rate: float
    lift: float
    z: float
    opportunities: int


class ZoneSummary(BaseModel):
    zone: str
    vulnerability_index: float
    z: float | None = None
    opponent_entries: int | None = None
    xt_conceded_per_entry: float | None = None
    shot_chains_conceded: int | None = None
    goals_conceded_via_zone: int | None = None
    clean_recovery_rate: float | None = None


class SwotItem(BaseModel):
    metric: str
    label: str
    phase: str
    value: float | None
    unit: str | None
    percentile: float = Field(ge=0, le=100)
    higher_is_better: bool | None = None
    description: str | None = None
    verdict: str


class SwotOut(BaseModel):
    team: TeamRef
    strengths: list[SwotItem]
    weaknesses: list[SwotItem]
    phase_scores: dict[str, float]
    metrics: list[SwotItem]
    profile_balance: float | None = None


class ZoneCell(BaseModel):
    zone_id: int
    zone_name: str
    band: int = Field(description="0 = own goal line ... 5 = opponent goal line")
    channel: int = Field(description="lateral channel index 0..4")
    band_name: str
    channel_name: str
    corridor: Literal["flank", "half_space", "central"]
    vulnerability_index: float
    conceded_entries_p90: float
    conceded_xt_per_entry: float
    conceded_shot_chains: int
    conceded_goals: int
    clean_recovery_rate: float | None
    exposure_rank_in_team: int | None


class CorridorSummary(BaseModel):
    corridor: Literal["flank", "half_space", "central"]
    mean_vulnerability: float
    conceded_shot_chains: int
    conceded_goals: int


class ZonesOut(BaseModel):
    team: TeamRef
    grid: list[ZoneCell]
    corridors: list[CorridorSummary]
    entry_routes: dict[str, float]


class TopPlayer(BaseModel):
    player: PlayerRef
    position: str | None
    minutes: float | None
    rating: float
    percentile_in_position: float | None


class BlueprintOut(BaseModel):
    team: TeamRef
    competition_name: str | None
    matches: int
    rating: RatingTriplet
    playstyle: PlaystyleOut
    sequence_predictability: float | None
    press_triggers: list[PressTrigger]
    press_blind_spots: list[PressTrigger]
    most_vulnerable_zones: list[ZoneSummary]
    most_solid_zones: list[ZoneSummary]
    most_attacked_zone: str | None
    strengths: list[SwotItem]
    weaknesses: list[SwotItem]
    phase_scores: dict[str, float]
    top_players: list[TopPlayer]
    game_plan: list[str] = Field(description="Deterministic, rule-based scouting recommendations")


# ----------------------------------------------------------------------------- xG / xA
class XgMatchRow(BaseModel):
    match_id: int
    kickoff_utc: datetime
    opponent: TeamRef
    is_home: bool
    goals_for: int
    goals_against: int
    xg_for: float
    xg_against: float


class XgPlayerRow(BaseModel):
    player: PlayerRef
    shots: int
    goals: int
    xg: float
    xa: float
    key_passes: int


class TeamXgOut(BaseModel):
    team: TeamRef
    matches: int
    shots_for: int
    shots_against: int
    goals_for: int
    goals_against: int
    xg_for: float
    xg_against: float
    npxg_for: float
    xg_per_shot: float
    timeline: list[XgMatchRow]
    top_players: list[XgPlayerRow]


class ShotOut(BaseModel):
    action_id: int
    team_id: int
    player: PlayerRef
    period_id: int
    minute: float
    x: float
    y: float
    xg: float
    is_goal: bool
    shot_type: str
    bodypart: str
    assister: PlayerRef | None = None
    xa: float | None = None


class XgModelOut(BaseModel):
    model: str
    features: list[str]
    coefficients: dict[str, float]
    intercept: float
    penalty_xg: float
    validation: dict


# ----------------------------------------------------------------------------- matches
class MatchSummary(BaseModel):
    match_id: int
    competition_id: int
    competition_name: str
    gameweek: int | None
    kickoff_utc: datetime
    venue: str | None
    home: TeamRef
    away: TeamRef
    home_score: int
    away_score: int
    home_xg: float | None = None
    away_xg: float | None = None


class LineupPlayer(BaseModel):
    player: PlayerRef
    jersey_number: int | None
    is_starter: bool
    minutes_played: int
    role: str | None


class TeamMatchStats(BaseModel):
    team: TeamRef
    shots: int
    shots_on_target_proxy: int
    xg: float
    passes: int
    pass_accuracy: float
    possession_share: float
    lineup: list[LineupPlayer]


class MatchDetail(BaseModel):
    summary: MatchSummary
    duration: str
    home_stats: TeamMatchStats
    away_stats: TeamMatchStats
    n_events: int


# ----------------------------------------------------------------------------- pitch visuals
class HeatmapOut(BaseModel):
    nx: int
    ny: int
    pitch_length: float = 105.0
    pitch_width: float = 68.0
    counts: list[list[int]] = Field(description="counts[iy][ix], iy along width (0 = y 0), ix along length")
    max_count: int
    n_actions: int
    filter: dict


class NetworkNode(BaseModel):
    player: PlayerRef
    x: float
    y: float
    passes_completed: int
    passes_received: int
    degree_centrality: float
    betweenness: float


class NetworkEdge(BaseModel):
    source: int
    target: int
    count: int


class PassingNetworkOut(BaseModel):
    match_id: int
    team: TeamRef
    min_passes: int
    total_passes: int
    nodes: list[NetworkNode]
    edges: list[NetworkEdge]


# ----------------------------------------------------------------------------- matchup / players
class MatchupEdge(BaseModel):
    phase: str
    attacker_score: float
    defender_score: float
    gap: float


class MatchupSide(BaseModel):
    team: TeamRef
    rating: RatingTriplet
    playstyle: PlaystyleOut
    exploitable_phases: list[MatchupEdge]
    target_zones: list[ZoneSummary]


class MatchupOut(BaseModel):
    team_a: MatchupSide
    team_b: MatchupSide
    rating_edge: float = Field(description="team_a.team - team_b.team rating")
    axis_deltas: dict[str, float]
    head_to_head: list[MatchSummary]


class PlayerProfile(BaseModel):
    player: PlayerRef
    full_name: str | None
    role: str | None
    birth_date: str | None
    height_cm: int | None
    foot: str | None
    nationality: str | None
    current_team: TeamRef | None
    appearances: int
    starts: int
    minutes_played: int
    rating: PlayerRatingOut | None
    shots: int
    goals: int
    xg: float
    xa: float
    key_passes: int
