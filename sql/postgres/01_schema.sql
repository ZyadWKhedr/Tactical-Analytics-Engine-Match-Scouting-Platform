-- =============================================================================
-- sql/postgres/01_schema.sql
-- PostgreSQL relational schema for the Tactical Analytics Engine.
--
-- Source: Wyscout public dataset (Pappalardo et al., 2019) converted to SPADL.
-- All event coordinates are canonical 105 m x 68 m, attacking left -> right
-- for the acting team (see docs/06_ai_rules_and_work_rules.md §3.2).
--
-- Idempotent: safe to re-run. Drops and recreates the `core` schema.
-- =============================================================================

DROP SCHEMA IF EXISTS core CASCADE;
CREATE SCHEMA core;
SET search_path TO core, public;

-- -----------------------------------------------------------------------------
-- Lookup tables (SPADL vocabularies)
-- -----------------------------------------------------------------------------
CREATE TABLE action_types (
    type_id     SMALLINT PRIMARY KEY,
    type_name   VARCHAR(40) NOT NULL UNIQUE
);

CREATE TABLE results (
    result_id   SMALLINT PRIMARY KEY,
    result_name VARCHAR(40) NOT NULL UNIQUE
);

CREATE TABLE bodyparts (
    bodypart_id   SMALLINT PRIMARY KEY,
    bodypart_name VARCHAR(40) NOT NULL UNIQUE
);

-- -----------------------------------------------------------------------------
-- Competitions
-- -----------------------------------------------------------------------------
CREATE TABLE competitions (
    competition_id   INTEGER PRIMARY KEY,
    season_id        INTEGER NOT NULL,
    competition_name VARCHAR(80) NOT NULL,
    season_name      VARCHAR(20) NOT NULL,
    country_name     VARCHAR(60) NOT NULL,
    format           VARCHAR(30)
);

-- -----------------------------------------------------------------------------
-- Teams
-- -----------------------------------------------------------------------------
CREATE TABLE teams (
    team_id        INTEGER PRIMARY KEY,
    team_name      VARCHAR(80) NOT NULL,
    official_name  VARCHAR(120),
    short_name     VARCHAR(40),
    city           VARCHAR(80),
    country        VARCHAR(60),
    team_type      VARCHAR(20) NOT NULL CHECK (team_type IN ('club', 'national'))
);

-- -----------------------------------------------------------------------------
-- Players
-- -----------------------------------------------------------------------------
CREATE TABLE players (
    player_id        INTEGER PRIMARY KEY,
    short_name       VARCHAR(80) NOT NULL,
    first_name       VARCHAR(80),
    last_name        VARCHAR(80),
    role_code        VARCHAR(4),             -- GK / DF / MD / FW (Wyscout)
    role_name        VARCHAR(30),
    birth_date       DATE,
    height_cm        SMALLINT CHECK (height_cm IS NULL OR height_cm BETWEEN 140 AND 220),
    weight_kg        SMALLINT CHECK (weight_kg IS NULL OR weight_kg BETWEEN 40 AND 130),
    foot             VARCHAR(10),
    nationality      VARCHAR(60),
    current_team_id  INTEGER REFERENCES teams(team_id)
);

-- -----------------------------------------------------------------------------
-- Fixtures: scheduling metadata for every game (known before kick-off)
-- -----------------------------------------------------------------------------
CREATE TABLE fixtures (
    fixture_id      BIGINT PRIMARY KEY,               -- = Wyscout match wyId
    competition_id  INTEGER NOT NULL REFERENCES competitions(competition_id),
    season_id       INTEGER NOT NULL,
    gameweek        SMALLINT,
    round_id        INTEGER,
    kickoff_utc     TIMESTAMPTZ NOT NULL,
    venue           VARCHAR(120),
    home_team_id    INTEGER NOT NULL REFERENCES teams(team_id),
    away_team_id    INTEGER NOT NULL REFERENCES teams(team_id),
    status          VARCHAR(20) NOT NULL,
    CHECK (home_team_id <> away_team_id)
);

-- -----------------------------------------------------------------------------
-- Matches: outcome of a played fixture (1:1 with fixtures)
-- -----------------------------------------------------------------------------
CREATE TABLE matches (
    match_id        BIGINT PRIMARY KEY REFERENCES fixtures(fixture_id) ON DELETE CASCADE,
    label           VARCHAR(160) NOT NULL,
    home_team_id    INTEGER NOT NULL REFERENCES teams(team_id),
    away_team_id    INTEGER NOT NULL REFERENCES teams(team_id),
    home_score      SMALLINT NOT NULL CHECK (home_score >= 0),
    away_score      SMALLINT NOT NULL CHECK (away_score >= 0),
    home_score_ht   SMALLINT,
    away_score_ht   SMALLINT,
    home_score_pen  SMALLINT,
    away_score_pen  SMALLINT,
    winner_team_id  INTEGER REFERENCES teams(team_id),   -- NULL = draw
    duration        VARCHAR(20) NOT NULL,                -- Regular / ExtraTime / Penalties
    home_formation  VARCHAR(10),
    away_formation  VARCHAR(10),
    n_events        INTEGER NOT NULL DEFAULT 0
);

-- -----------------------------------------------------------------------------
-- Lineups: one row per player who was in a match-day squad
-- -----------------------------------------------------------------------------
CREATE TABLE lineups (
    match_id        BIGINT  NOT NULL REFERENCES matches(match_id) ON DELETE CASCADE,
    team_id         INTEGER NOT NULL REFERENCES teams(team_id),
    player_id       INTEGER NOT NULL REFERENCES players(player_id),
    jersey_number   SMALLINT,
    is_starter      BOOLEAN NOT NULL,
    minutes_played  SMALLINT NOT NULL CHECK (minutes_played BETWEEN 0 AND 130),
    PRIMARY KEY (match_id, player_id)
);

-- -----------------------------------------------------------------------------
-- Events: SPADL actions (one row per on-ball action)
-- -----------------------------------------------------------------------------
CREATE TABLE events (
    match_id           BIGINT   NOT NULL REFERENCES matches(match_id) ON DELETE CASCADE,
    action_id          INTEGER  NOT NULL,          -- order within match
    original_event_id  BIGINT,                     -- Wyscout event id
    period_id          SMALLINT NOT NULL CHECK (period_id BETWEEN 1 AND 5),
    time_seconds       REAL     NOT NULL CHECK (time_seconds >= 0),  -- within period
    match_seconds      REAL     NOT NULL CHECK (match_seconds >= 0), -- normalized clock
    team_id            INTEGER  NOT NULL REFERENCES teams(team_id),
    player_id          INTEGER  NOT NULL REFERENCES players(player_id),
    type_id            SMALLINT NOT NULL REFERENCES action_types(type_id),
    result_id          SMALLINT NOT NULL REFERENCES results(result_id),
    bodypart_id        SMALLINT NOT NULL REFERENCES bodyparts(bodypart_id),
    start_x            REAL NOT NULL CHECK (start_x BETWEEN 0 AND 105),
    start_y            REAL NOT NULL CHECK (start_y BETWEEN 0 AND 68),
    end_x              REAL NOT NULL CHECK (end_x   BETWEEN 0 AND 105),
    end_y              REAL NOT NULL CHECK (end_y   BETWEEN 0 AND 68),
    PRIMARY KEY (match_id, action_id)
);

-- -----------------------------------------------------------------------------
-- Shots with xG / xA (written by etl/xg_xa.py)
-- -----------------------------------------------------------------------------
CREATE TABLE shots (
    match_id            BIGINT   NOT NULL,
    action_id           INTEGER  NOT NULL,
    team_id             INTEGER  NOT NULL REFERENCES teams(team_id),
    player_id           INTEGER  NOT NULL REFERENCES players(player_id),
    period_id           SMALLINT NOT NULL,
    match_seconds       REAL     NOT NULL,
    x                   REAL     NOT NULL,
    y                   REAL     NOT NULL,
    distance_m          REAL     NOT NULL,
    angle_rad           REAL     NOT NULL,
    shot_type           VARCHAR(20) NOT NULL,    -- open_play / freekick / penalty
    bodypart            VARCHAR(20) NOT NULL,
    is_goal             BOOLEAN  NOT NULL,
    xg                  REAL     NOT NULL CHECK (xg BETWEEN 0 AND 1),
    assist_action_id    INTEGER,
    assister_id         INTEGER REFERENCES players(player_id),
    xa                  REAL CHECK (xa IS NULL OR xa BETWEEN 0 AND 1),
    PRIMARY KEY (match_id, action_id),
    FOREIGN KEY (match_id, action_id) REFERENCES events(match_id, action_id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Squad ratings (loaded from Persons 2/3 output: models/team_ratings.parquet)
-- -----------------------------------------------------------------------------
CREATE TABLE squad_ratings (
    team_id               INTEGER PRIMARY KEY REFERENCES teams(team_id),
    matches               SMALLINT NOT NULL,
    team_rating           REAL NOT NULL CHECK (team_rating BETWEEN 1 AND 10),
    attack_rating         REAL NOT NULL CHECK (attack_rating BETWEEN 1 AND 10),
    defence_rating        REAL NOT NULL CHECK (defence_rating BETWEEN 1 AND 10),
    attack_strength       REAL,
    defence_strength      REAL,
    overall_strength      REAL,
    form_z                REAL,
    goal_diff_p90         REAL,
    xt_diff_p90           REAL,
    possession_dominance  REAL CHECK (possession_dominance BETWEEN 0 AND 100),
    low_block             REAL CHECK (low_block BETWEEN 0 AND 100),
    press_intensity       REAL CHECK (press_intensity BETWEEN 0 AND 100),
    playstyle             VARCHAR(60),
    playstyle_confidence  REAL,
    engine_version        VARCHAR(20) NOT NULL,
    loaded_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
