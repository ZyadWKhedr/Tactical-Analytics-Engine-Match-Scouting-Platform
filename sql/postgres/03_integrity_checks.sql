-- =============================================================================
-- sql/postgres/03_integrity_checks.sql
-- Data-integrity & relationship validation. Every query should return 0
-- (or the expected count) after a clean load. Used by etl/validate_db.py.
-- =============================================================================
SET search_path TO core, public;

-- name: matches_without_fixture
SELECT COUNT(*) FROM matches m LEFT JOIN fixtures f ON f.fixture_id = m.match_id WHERE f.fixture_id IS NULL;

-- name: matches_without_events
SELECT COUNT(*) FROM matches m WHERE NOT EXISTS (SELECT 1 FROM events e WHERE e.match_id = m.match_id);

-- name: events_team_not_in_match
SELECT COUNT(*) FROM events e JOIN matches m USING (match_id)
WHERE e.team_id NOT IN (m.home_team_id, m.away_team_id);

-- name: lineup_team_not_in_match
SELECT COUNT(*) FROM lineups l JOIN matches m USING (match_id)
WHERE l.team_id NOT IN (m.home_team_id, m.away_team_id);

-- name: matches_without_two_lineups
SELECT COUNT(*) FROM (
  SELECT m.match_id FROM matches m LEFT JOIN lineups l USING (match_id)
  GROUP BY m.match_id HAVING COUNT(DISTINCT l.team_id) <> 2
) t;

-- name: starters_not_eleven
SELECT COUNT(*) FROM (
  SELECT match_id, team_id FROM lineups WHERE is_starter
  GROUP BY match_id, team_id HAVING COUNT(*) <> 11
) t;

-- name: duplicate_original_events
SELECT COUNT(*) FROM (
  SELECT match_id, original_event_id, type_id FROM events
  WHERE original_event_id IS NOT NULL
  GROUP BY 1, 2, 3 HAVING COUNT(*) > 1
) t;

-- name: non_monotonic_clock
SELECT COUNT(*) FROM (
  SELECT match_seconds < LAG(match_seconds) OVER (PARTITION BY match_id ORDER BY action_id) AS back
  FROM events
) t WHERE back;

-- name: goals_mismatch_score
-- Goals from events (shot success + own goals) vs. official score. Wyscout has
-- a handful of known feed gaps; reported, not fatal.
SELECT COUNT(*) FROM matches m
LEFT JOIN (
  SELECT e.match_id,
         SUM(CASE WHEN (e.type_id IN (11,12,13) AND e.result_id = 1 AND e.team_id = m2.home_team_id)
                    OR (e.result_id = 3 AND e.team_id = m2.away_team_id) THEN 1 ELSE 0 END) AS hg,
         SUM(CASE WHEN (e.type_id IN (11,12,13) AND e.result_id = 1 AND e.team_id = m2.away_team_id)
                    OR (e.result_id = 3 AND e.team_id = m2.home_team_id) THEN 1 ELSE 0 END) AS ag
  FROM events e JOIN matches m2 USING (match_id)
  WHERE e.period_id <= 4
  GROUP BY e.match_id
) g USING (match_id)
WHERE COALESCE(g.hg, 0) <> m.home_score OR COALESCE(g.ag, 0) <> m.away_score;

-- name: squad_ratings_orphans
SELECT COUNT(*) FROM squad_ratings s LEFT JOIN teams t USING (team_id) WHERE t.team_id IS NULL;

-- name: shots_xg_out_of_range
SELECT COUNT(*) FROM shots WHERE xg < 0 OR xg > 1;
