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
    url = get_database_url()
    log.info("Connecting to %s", make_url(url).render_as_string(hide_password=True))
    return create_engine(
        url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        connect_args={"options": "-c search_path=core,public"},
    )
