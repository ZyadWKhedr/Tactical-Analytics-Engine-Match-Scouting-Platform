"""
Tactical Analytics Engine: REST API Application.
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from backend.app.api import matches, matchup, meta, ratings, teams, visuals, xg
from backend.app.config import get_settings
from backend.app.repository import get_repository

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Preload repository & database engine on startup
    log.info("Initializing Tactical Analytics Engine repository...")
    repo = get_repository()
    log.info("Repository warm: %d teams in memory", len(repo.get_team_lookup()))
    yield


settings = get_settings()

app = FastAPI(
    title="Tactical Analytics Engine API",
    description="""
Enterprise football intelligence and scouting REST API.
Operates on 2.46M SPADL events across 1,941 matches:
- Continuous Playstyle Classification & KMeans Archetypes
- Reliability-calibrated 6x5 Pitch Zone Vulnerability Grids
- 35+ Metric SWOT Catalogues & Tactical Phase Scores
- Situational Press Triggers & Blind Spot Propensities
- 1.0 - 10.0 Contextual Squad & Player Performance Ratings
- Calibrated Expected Goals (xG) & Expected Assists (xA)
- Tactical Passing Networks & 2D Spatial Density Heatmaps
- Automated Opponent Scouting Blueprints & Head-to-Head Matchup Simulations
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API v1 Router Registration
app.include_router(meta.router, prefix="/api/v1")
app.include_router(teams.router, prefix="/api/v1")
app.include_router(ratings.router, prefix="/api/v1")
app.include_router(xg.router, prefix="/api/v1")
app.include_router(matches.router, prefix="/api/v1")
app.include_router(visuals.router, prefix="/api/v1")
app.include_router(matchup.router, prefix="/api/v1")


@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy", "service": "tactical-analytics-api", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
