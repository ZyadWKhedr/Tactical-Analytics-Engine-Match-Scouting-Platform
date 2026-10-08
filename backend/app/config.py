"""
Runtime configuration.

Every setting can be overridden with an environment variable (or a `.env`
file in the repository root), e.g.::

    DATABASE_URL=postgresql://user:pass@localhost:5432/tactical
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

REPO_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=REPO_ROOT / ".env", extra="ignore")

    # If unset, an embedded PostgreSQL 16 server (pgserver) is started from
    # data/pgdata so the project runs with zero manual database setup.
    database_url: str | None = None
    database_name: str = "tactical"

    models_dir: Path = REPO_ROOT / "models"
    data_dir: Path = REPO_ROOT / "data"
    pgdata_dir: Path = REPO_ROOT / "data" / "pgdata"

    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            v_stripped = v.strip()
            if v_stripped.startswith("[") and v_stripped.endswith("]"):
                try:
                    return json.loads(v_stripped)
                except Exception:
                    pass
            return [origin.strip() for origin in v_stripped.split(",") if origin.strip()]
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()
