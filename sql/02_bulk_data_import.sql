-- =============================================================================
-- 02_bulk_data_import.sql
-- Bulk Loading Script for Dimension & Fact Tables from data/
-- =============================================================================

USE football_events;

-- Note: Adjust relative or absolute CSV file paths according to your environment.

-- 1. Import Games
BULK INSERT games
FROM 'data/games.csv'
WITH (
    FORMAT = 'CSV',
    FIRSTROW = 2,
    FIELDQUOTE = '"',
    TABLOCK
);

-- 2. Import Teams
BULK INSERT teams
FROM 'data/teams.csv'
WITH (
    FORMAT = 'CSV',
    FIRSTROW = 2,
    FIELDQUOTE = '"',
    TABLOCK
);

-- 3. Import Players
BULK INSERT players
FROM 'data/players.csv'
WITH (
    FORMAT = 'CSV',
    FIRSTROW = 2,
    FIELDQUOTE = '"',
    TABLOCK
);

-- 4. Import Action Types
BULK INSERT types
FROM 'data/types.csv'
WITH (
    FORMAT = 'CSV',
    FIRSTROW = 2,
    FIELDQUOTE = '"',
    TABLOCK
);

-- 5. Import Action Results
BULK INSERT results
FROM 'data/results.csv'
WITH (
    FORMAT = 'CSV',
    FIRSTROW = 2,
    FIELDQUOTE = '"',
    TABLOCK
);

-- 6. Import Body Parts
BULK INSERT bodyparts
FROM 'data/bodyparts.csv'
WITH (
    FORMAT = 'CSV',
    FIRSTROW = 2,
    FIELDQUOTE = '"',
    TABLOCK
);

-- 7. Import Events / Actions
BULK INSERT events
FROM 'data/events.csv'
WITH (
    FORMAT = 'CSV',
    FIRSTROW = 2,
    FIELDQUOTE = '"',
    TABLOCK
);

-- Verification of loaded row counts
SELECT 'games' AS table_name, COUNT(*) AS row_count FROM games
UNION ALL
SELECT 'teams', COUNT(*) FROM teams
UNION ALL
SELECT 'players', COUNT(*) FROM players
UNION ALL
SELECT 'types', COUNT(*) FROM types
UNION ALL
SELECT 'results', COUNT(*) FROM results
UNION ALL
SELECT 'bodyparts', COUNT(*) FROM bodyparts
UNION ALL
SELECT 'events', COUNT(*) FROM events;
