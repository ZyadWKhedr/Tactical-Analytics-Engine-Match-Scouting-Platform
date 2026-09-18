-- =============================================================================
-- 01_schema_and_tables.sql
-- Database and Table Creation for Tactical Football Events
-- =============================================================================

CREATE DATABASE IF NOT EXISTS football_events;
USE football_events;

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS bodyparts;
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS types;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS games;

-- 1. Games Table
CREATE TABLE games (
    game_id BIGINT PRIMARY KEY
);

-- 2. Teams Table
CREATE TABLE teams (
    team_id BIGINT PRIMARY KEY
);

-- 3. Players Table
CREATE TABLE players (
    player_id BIGINT PRIMARY KEY
);

-- 4. Action Types Table
CREATE TABLE types (
    type_id INT PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL
);

-- 5. Results Table
CREATE TABLE results (
    result_id INT PRIMARY KEY,
    result_name VARCHAR(100) NOT NULL
);

-- 6. Body Parts Table
CREATE TABLE bodyparts (
    bodypart_id INT PRIMARY KEY,
    bodypart_name VARCHAR(100) NOT NULL
);

-- 7. Events / Actions Table
CREATE TABLE events (
    event_id BIGINT NOT NULL,
    game_id BIGINT NOT NULL,
    period_id INT NOT NULL,
    timeSeconds FLOAT NOT NULL,
    team_id BIGINT NOT NULL,
    player_id BIGINT NOT NULL,
    start_x FLOAT NOT NULL,
    start_y FLOAT NOT NULL,
    end_x FLOAT NOT NULL,
    end_y FLOAT NOT NULL,
    original_event_id FLOAT NULL,
    bodypart_id INT NOT NULL,
    type_id INT NOT NULL,
    result_id INT NOT NULL,
    action_id INT NOT NULL,
    
    PRIMARY KEY (event_id),
    CONSTRAINT fk_events_game FOREIGN KEY (game_id) REFERENCES games(game_id),
    CONSTRAINT fk_events_team FOREIGN KEY (team_id) REFERENCES teams(team_id),
    CONSTRAINT fk_events_player FOREIGN KEY (player_id) REFERENCES players(player_id),
    CONSTRAINT fk_events_bodypart FOREIGN KEY (bodypart_id) REFERENCES bodyparts(bodypart_id),
    CONSTRAINT fk_events_type FOREIGN KEY (type_id) REFERENCES types(type_id),
    CONSTRAINT fk_events_result FOREIGN KEY (result_id) REFERENCES results(result_id)
);
