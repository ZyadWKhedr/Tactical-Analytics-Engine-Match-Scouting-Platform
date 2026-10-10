"""
PostgreSQL connection management.

Resolution order:
1. ``DATABASE_URL`` (env / .env): use any external PostgreSQL server.
2. Otherwise start (or attach to) an embedded PostgreSQL 16 server via
   ``pgserver`` whose data directory lives in ``data/pgdata``.
"""
from __future__ import annotations

import logging
from functools import lru_cache

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine, make_url

from .config import get_settings

log = logging.getLogger(__name__)


def _embedded_server_uri() -> str:
    try:
        import pgserver  # imported lazily: only needed without DATABASE_URL

        settings = get_settings()
        settings.pgdata_dir.mkdir(parents=True, exist_ok=True)
        # cleanup_mode=None keeps the server running after this process exits, so
        # the ETL and API processes share the same server.
        server = pgserver.get_server(str(settings.pgdata_dir), cleanup_mode=None)
        uri = make_url(server.get_uri()).set(drivername="postgresql+psycopg2")
        # make sure the application database exists
        admin = create_engine(uri, isolation_level="AUTOCOMMIT")
        with admin.connect() as conn:
            exists = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :n"), {"n": settings.database_name}
            ).scalar()
            if not exists:
                conn.execute(text(f'CREATE DATABASE "{settings.database_name}"'))
        admin.dispose()
        return uri.set(database=settings.database_name).render_as_string(hide_password=False)
    except Exception as e:
        log.warning("Embedded PostgreSQL (pgserver) not available: %s. Falling back to SQLite.", e)
        return "sqlite:///tactical.db"


@lru_cache
def get_database_url() -> str:
    settings = get_settings()
    if settings.database_url:
        url = make_url(settings.database_url)
        if url.drivername in ("postgresql", "postgres"):
            url = url.set(drivername="postgresql+psycopg2")
        return url.render_as_string(hide_password=False)
    return _embedded_server_uri()


@lru_cache
def get_engine() -> Engine:
    url_str = get_database_url()
    log.info("Connecting to %s", make_url(url_str).render_as_string(hide_password=True))
    if url_str.startswith("sqlite"):
        from sqlalchemy import event
        import os

        db_path = os.path.abspath("tactical.db")
        engine = create_engine(url_str)

        @event.listens_for(engine, "connect")
        def set_sqlite_attach(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            try:
                cursor.execute(f"ATTACH DATABASE '{db_path}' AS core")
            except Exception:
                pass
            cursor.close()

        # Create core tables if not exist for sqlite compatibility
        with engine.connect() as conn:
            conn.execute(text("CREATE TABLE IF NOT EXISTS teams (team_id INTEGER PRIMARY KEY, team_name TEXT, country TEXT, team_type TEXT, city TEXT, official_name TEXT)"))
            conn.execute(text("CREATE TABLE IF NOT EXISTS players (player_id INTEGER PRIMARY KEY, short_name TEXT, first_name TEXT, last_name TEXT, role_name TEXT, current_team_id INTEGER, birth_date TEXT, passport_area_name TEXT, weight REAL, height REAL, foot TEXT)"))
            conn.execute(text("CREATE TABLE IF NOT EXISTS competitions (competition_id INTEGER PRIMARY KEY, season_id INTEGER, competition_name TEXT, season_name TEXT, country_name TEXT)"))
            conn.execute(text("CREATE TABLE IF NOT EXISTS fixtures (fixture_id INTEGER PRIMARY KEY, competition_id INTEGER, gameweek INTEGER, kickoff_utc TEXT, home_team_id INTEGER, away_team_id INTEGER, home_score INTEGER, away_score INTEGER, status TEXT)"))
            conn.execute(text("CREATE TABLE IF NOT EXISTS matches (match_id INTEGER PRIMARY KEY, home_team_id INTEGER, away_team_id INTEGER, home_score INTEGER, away_score INTEGER)"))
            conn.execute(text("CREATE TABLE IF NOT EXISTS events (event_id INTEGER PRIMARY KEY, match_id INTEGER, team_id INTEGER, player_id INTEGER, start_x REAL, start_y REAL, end_x REAL, end_y REAL, time_seconds REAL, action_id INTEGER, period_id INTEGER, result_name TEXT)"))
            conn.execute(text("CREATE TABLE IF NOT EXISTS shots (shot_id INTEGER PRIMARY KEY, team_id INTEGER, match_id INTEGER, player_id INTEGER, xg REAL, is_goal INTEGER)"))
            conn.execute(text("CREATE TABLE IF NOT EXISTS lineups (match_id INTEGER, team_id INTEGER, player_id INTEGER, jersey_number INTEGER, is_starter INTEGER, minutes_played REAL, short_name TEXT, role_name TEXT)"))
            
            # Check if teams table is populated
            count = conn.execute(text("SELECT COUNT(*) FROM teams")).scalar() or 0
            if count == 0:
                import pandas as pd
                teams_file = os.path.join("data", "teams.csv")
                if os.path.exists(teams_file):
                    tdf = pd.read_csv(teams_file)
                    for _, row in tdf.iterrows():
                        tid = int(row["team_id"])
                        conn.execute(
                            text("INSERT OR IGNORE INTO teams (team_id, team_name, country, team_type) VALUES (:tid, :tname, :cntry, 'club')"),
                            {"tid": tid, "tname": f"Team {tid}", "cntry": "Global"}
                        )
                players_file = os.path.join("data", "players.csv")
                if os.path.exists(players_file):
                    pdf = pd.read_csv(players_file)
                    for _, row in pdf.iterrows():
                        pid = int(row["player_id"])
                        conn.execute(
                            text("INSERT OR IGNORE INTO players (player_id, short_name, role_name) VALUES (:pid, :pname, 'Player')"),
                            {"pid": pid, "pname": f"Player {pid}"}
                        )
            conn.commit()
        return engine
    return create_engine(
        url_str,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        connect_args={"options": "-c search_path=core,public"},
    )

