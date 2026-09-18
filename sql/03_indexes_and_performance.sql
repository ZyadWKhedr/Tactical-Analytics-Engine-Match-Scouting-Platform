-- =============================================================================
-- 03_indexes_and_performance.sql
-- Performance Optimization, B-Tree Indexes & Partitioning Support
-- =============================================================================

USE football_events;

-- Composite & Covering Indexes for Match-Level Tactical Traversal
CREATE INDEX idx_events_game_time 
ON events(game_id, period_id, timeSeconds);

CREATE INDEX idx_events_team_game 
ON events(team_id, game_id);

CREATE INDEX idx_events_player_game 
ON events(player_id, game_id);

CREATE INDEX idx_events_type_result 
ON events(type_id, result_id);

CREATE INDEX idx_events_spatial 
ON events(start_x, start_y, end_x, end_y);

-- Inspect index status
SELECT 
    t.name AS table_name,
    i.name AS index_name,
    i.type_desc
FROM sys.indexes i
JOIN sys.tables t ON i.object_id = t.object_id
WHERE t.name = 'events';
