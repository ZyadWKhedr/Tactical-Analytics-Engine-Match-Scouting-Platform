-- =============================================================================
-- 04_tactical_analytics_queries.sql
-- Advanced Analytical SQL Queries for Tactical Scouting
-- =============================================================================

USE football_events;

-- 1. Match Action Volume & Share by Team
SELECT 
    e.game_id,
    e.team_id,
    COUNT(*) AS total_actions,
    SUM(CASE WHEN t.type_name = 'pass' THEN 1 ELSE 0 END) AS total_passes,
    SUM(CASE WHEN t.type_name = 'pass' AND r.result_name = 'success' THEN 1 ELSE 0 END) AS successful_passes,
    CAST(SUM(CASE WHEN t.type_name = 'pass' AND r.result_name = 'success' THEN 1 ELSE 0 END) * 100.0 / 
         NULLIF(SUM(CASE WHEN t.type_name = 'pass' THEN 1 ELSE 0 END), 0) AS DECIMAL(5,2)) AS pass_accuracy_pct
FROM events e
JOIN types t ON e.type_id = t.type_id
JOIN results r ON e.result_id = r.result_id
GROUP BY e.game_id, e.team_id
ORDER BY e.game_id, total_actions DESC;

-- 2. High-Press Regains in Attacking Third (x >= 70m)
SELECT 
    e.team_id,
    COUNT(*) AS high_regains,
    COUNT(DISTINCT e.game_id) AS games_played,
    CAST(COUNT(*) * 1.0 / COUNT(DISTINCT e.game_id) AS DECIMAL(5,2)) AS high_regains_per_game
FROM events e
JOIN types t ON e.type_id = t.type_id
WHERE t.type_name IN ('tackle', 'interception', 'recovery', 'foul')
  AND e.start_x >= 70.0
GROUP BY e.team_id
ORDER BY high_regains_per_game DESC;

-- 3. Shot Conversion & Box Entry Statistics by Player
SELECT TOP 20
    e.player_id,
    COUNT(CASE WHEN t.type_name = 'shot' THEN 1 END) AS total_shots,
    COUNT(CASE WHEN t.type_name = 'shot' AND r.result_name = 'success' THEN 1 END) AS total_goals,
    CAST(COUNT(CASE WHEN t.type_name = 'shot' AND r.result_name = 'success' THEN 1 END) * 100.0 /
         NULLIF(COUNT(CASE WHEN t.type_name = 'shot' THEN 1 END), 0) AS DECIMAL(5,2)) AS shot_conversion_pct
FROM events e
JOIN types t ON e.type_id = t.type_id
JOIN results r ON e.result_id = r.result_id
GROUP BY e.player_id
HAVING COUNT(CASE WHEN t.type_name = 'shot' THEN 1 END) >= 15
ORDER BY total_goals DESC, shot_conversion_pct DESC;

-- 4. Spatial Zone Pass Distribution (Final Third vs Defensive Third)
SELECT 
    e.team_id,
    SUM(CASE WHEN e.start_x < 35.0 THEN 1 ELSE 0 END) AS defensive_third_actions,
    SUM(CASE WHEN e.start_x BETWEEN 35.0 AND 70.0 THEN 1 ELSE 0 END) AS middle_third_actions,
    SUM(CASE WHEN e.start_x > 70.0 THEN 1 ELSE 0 END) AS final_third_actions,
    CAST(SUM(CASE WHEN e.start_x > 70.0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS DECIMAL(5,2)) AS deep_territory_pct
FROM events e
GROUP BY e.team_id
ORDER BY deep_territory_pct DESC;
