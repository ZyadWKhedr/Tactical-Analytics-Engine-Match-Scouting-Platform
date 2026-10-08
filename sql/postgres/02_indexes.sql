-- =============================================================================
-- sql/postgres/02_indexes.sql
-- Indexes tuned for the API access paths (per match, per team, per player).
-- Run AFTER bulk load for speed.
-- =============================================================================
SET search_path TO core, public;

CREATE INDEX IF NOT EXISTS ix_fixtures_competition   ON fixtures (competition_id, kickoff_utc);
CREATE INDEX IF NOT EXISTS ix_fixtures_home          ON fixtures (home_team_id);
CREATE INDEX IF NOT EXISTS ix_fixtures_away          ON fixtures (away_team_id);

CREATE INDEX IF NOT EXISTS ix_matches_home           ON matches (home_team_id);
CREATE INDEX IF NOT EXISTS ix_matches_away           ON matches (away_team_id);

CREATE INDEX IF NOT EXISTS ix_lineups_player         ON lineups (player_id);
CREATE INDEX IF NOT EXISTS ix_lineups_team_match     ON lineups (team_id, match_id);

CREATE INDEX IF NOT EXISTS ix_players_team           ON players (current_team_id);

CREATE INDEX IF NOT EXISTS ix_events_match_team_type ON events (match_id, team_id, type_id);
CREATE INDEX IF NOT EXISTS ix_events_team            ON events (team_id);
CREATE INDEX IF NOT EXISTS ix_events_player          ON events (player_id);
CREATE INDEX IF NOT EXISTS ix_events_type            ON events (type_id);

CREATE INDEX IF NOT EXISTS ix_shots_team             ON shots (team_id);
CREATE INDEX IF NOT EXISTS ix_shots_player           ON shots (player_id);
CREATE INDEX IF NOT EXISTS ix_shots_assister         ON shots (assister_id);

ANALYZE;
