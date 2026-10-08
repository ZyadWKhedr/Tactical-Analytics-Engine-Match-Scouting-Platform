# Tactical Analytics Engine & Match Scouting Platform

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.30+-FF4B4B.svg)](https://streamlit.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An enterprise-grade, mathematical football scouting and tactical intelligence platform. The system processes over **2.46 million SPADL event actions** across **1,941 professional matches** to build self-fitted Expected Threat (xT) surfaces, 3-axis continuous playstyle models, reliability-calibrated zone vulnerability grids, team SWOT catalogues, and contextual player ratings.

---

## Repository Structure

```
final project/
│
├── app.py                          # Interactive Streamlit scouting & intelligence web app
├── requirements.txt                # Python dependencies
├── README.md                       # Master project overview and user guide
│
├── data/                           # Raw datasets & relational dimension/fact tables
│   ├── actions.csv                 # 2.46M SPADL atomic action event stream
│   ├── events.csv                  # Raw match event feed
│   ├── events_normalized.csv       # Pre-normalized event records
│   ├── games.csv                   # Match identifier registry (1,941 games)
│   ├── teams.csv                   # Team identifier registry (142 clubs)
│   ├── players.csv                 # Player identifier registry (3,031 players)
│   ├── types.csv                   # Action type lookup definitions
│   ├── results.csv                 # Outcome definitions (success, fail, etc.)
│   └── bodyparts.csv               # Action body part definitions
│
├── docs/                           # Technical documentation & governance rules
│   ├── 01_project_overview_and_architecture.md
│   ├── 02_data_processing_and_invariants.md
│   ├── 03_possession_and_expected_threat.md
│   ├── 04_tactical_models_methodology.md
│   ├── 05_validation_and_empirical_findings.md
│   └── 06_ai_rules_and_work_rules.md
│
├── figures/                        # High-resolution tactical diagrams & visual assets
│   ├── xt_surface_heatmap.png
│   ├── playstyle_clusters.png
│   ├── zone_vulnerability_grid.png
│   ├── tactical_radar_sample.png
│   ├── player_ratings_distribution.png
│   └── validation_reliability_chart.png
│
├── models/                         # Output tables, model weights, and JSON team dossiers
│   ├── team_dossiers.json          # Machine-readable comprehensive team scouting profiles
│   ├── run_metadata.json           # Execution metrics and run timestamp
│   ├── team_playstyles.csv         # Playstyles, continuous axes, and archetypes
│   ├── zone_vulnerabilities.csv    # 6x5 defensive grid vulnerability indices
│   ├── team_swot.csv               # Team SWOT metric ratings and phase scores
│   ├── swot_metrics.csv            # Metric-level percentiles and directionality
│   ├── player_ratings.csv          # Contextual player ratings (1-10 scale)
│   ├── team_ratings.csv            # Contextual team ratings and attack/def strength
│   ├── player_match_ratings.csv    # Match-level player rating evaluations
│   ├── player_match_metrics.csv    # Raw and p90 match-level player statistics
│   ├── team_match_metrics.csv      # Match-level team tactical metrics
│   ├── team_season.csv             # Aggregated season baselines
│   ├── team_strength.csv           # Two-way Ridge team offensive/defensive ratings
│   ├── entry_routes.csv            # Defensive entry route distributions
│   ├── press_triggers.csv          # Bayesian press reaction probabilities
│   └── shot_ngrams.csv             # Shot creation sequence patterns
│
├── notebooks/                      # Sequential, fully-commented Jupyter Notebooks
│   ├── 01_eda_and_data_cleaning.ipynb
│   ├── 02_possession_chains_and_xt.ipynb
│   ├── 03_tactical_features_and_baselines.ipynb
│   ├── 04_playstyle_and_pressing.ipynb
│   ├── 05_vulnerability_and_swot.ipynb
│   ├── 06_player_and_team_ratings.ipynb
│   └── 07_validation_and_reporting.ipynb
│
└── sql/                            # Production SQL schema, bulk import, and analytical queries
    ├── 01_schema_and_tables.sql
    ├── 02_bulk_data_import.sql
    ├── 03_indexes_and_performance.sql
    └── 04_tactical_analytics_queries.sql
```

---

## Setup from Scratch (Clean Machine Guide)

Follow these steps to set up and run the entire platform on a clean developer machine.

### 1. Prerequisites & Environment Setup

- **Python**: 3.10+ (tested on Python 3.11).
- **Node.js**: 18+ (tested on Node.js 20+ / 24) for the React dashboard.

Create and activate a virtual environment:
```bash
# Clone the repository
git clone https://github.com/ZyadWKhedr/Tactical-Analytics-Engine-Match-Scouting-Platform.git
cd Tactical-Analytics-Engine-Match-Scouting-Platform

# Create Python virtual environment
python -m venv .venv

# Activate on Windows:
.venv\Scripts\activate
# Activate on Linux/macOS:
source .venv/bin/activate

# Install all runtime, ETL, API, and testing dependencies
pip install -r requirements.txt
```

---

### 2. Raw Data Placement (`data/wyscout/`)

The raw Wyscout event data files (gitignored) must be placed in `data/wyscout/`. The ETL loader (`etl/load_wyscout.py`) expects the following 17 JSON files:
```
data/wyscout/
├── competitions.json
├── teams.json
├── players.json
├── matches_England.json
├── events_England.json
├── matches_Spain.json
├── events_Spain.json
├── matches_Italy.json
├── events_Italy.json
├── matches_Germany.json
├── events_Germany.json
├── matches_France.json
├── events_France.json
├── matches_European_Championship.json
├── events_European_Championship.json
├── matches_World_Cup.json
└── events_World_Cup.json
```

---

### 3. Database Configuration & Platform Portability

The platform supports two database modes:
1. **Embedded PostgreSQL (Zero Setup)**: If `DATABASE_URL` is omitted, the engine uses [`pgserver`](https://github.com/frostming/pgserver) to run an embedded PostgreSQL 16 instance storing data in `data/pgdata`. No external PostgreSQL installation or Docker container is required.
2. **External PostgreSQL**: Define `DATABASE_URL` in a `.env` file in the repository root:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/tactical
   ```

> [!WARNING]
> **Cross-Platform Portability**: PostgreSQL cluster directories (`data/pgdata`) are binary-compiled and **not portable across different operating systems**. If cloning on Linux or macOS, do not copy a Windows `data/pgdata` folder; initialize a fresh database via the ETL pipeline below.

---

### 4. Running the ETL Pipeline

Run the ETL in the following exact sequence:

```bash
# Step 1: Ingest raw Wyscout JSON -> validate -> deduplicate -> load into PostgreSQL
python -m etl.load_wyscout

# (Optional: run with '--limit 1' for a fast 1-match smoke test per league)
# python -m etl.load_wyscout --limit 1

# Step 2: Calibrate Expected Goals (xG) and Expected Assists (xA) models
python -m etl.xg_xa
```

Outputs:
- Schema `core` populated in PostgreSQL (`matches`, `teams`, `players`, `events`, `lineups`, `fixtures`, `squad_ratings`, `shots`).
- Validation report: `etl/reports/etl_report.json`.
- Serialized models: `models/shots_xg.parquet` and `models/xg_model.json`.

---

### 5. Launching the Services

> [!NOTE]
> **Dashboard Roles**:
> - `frontend/` (React + TypeScript + Vite): The primary **Phase 1 Scouting Dashboard** (Person 4 deliverable) featuring the interactive pitch visualizer, tactical radars, opponent blueprints, passing networks, and matchup simulator.
> - `app.py` (Streamlit in root): The earlier exploratory data interface (legacy Phase 0 prototype).

#### Option A: Unified Launcher
- **Windows**:
  ```bat
  start_all.bat
  ```
- **Linux / macOS**:
  ```bash
  chmod +x start.sh
  ./start.sh
  # Or via Makefile:
  make run
  ```

#### Option B: Individual Services

1. **Launch the FastAPI REST API (port 8000)**:
   ```bash
   uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
   # Or on Windows: start_api.bat
   ```
   Interactive OpenAPI documentation is available at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

2. **Launch the React Frontend (port 5173)**:
   ```bash
   cd frontend
   npm install
   npm run dev
   # Or on Windows: start_dashboard.bat
   ```
   Dashboard available at **[http://localhost:5173](http://localhost:5173)**.  
   *(Vite proxies API calls to `http://127.0.0.1:8000`. To customize the backend target, set `VITE_API_BASE` in `frontend/.env`).*

3. **Legacy Streamlit Explorer (Optional)**:
   ```bash
   streamlit run app.py
   ```

---

### 6. Running Validation & Test Suites

```bash
# 1. Run the mathematical and tactical logic integrity audit:
python verify_logic.py

# 2. Run the FastAPI contract and endpoint integration test suite:
python -m pytest tests/test_api.py -v
```

---

### 7. Running the Research Notebooks (Persons 1–3)

Open Jupyter Lab to inspect the underlying research and model calibration notebooks:
```bash
jupyter lab
```
Navigate to `notebooks/` and run notebooks `01` through `09` in sequence.

---

## Core Modeling Innovations

1. **Self-Fitted Expected Threat (xT)**:
   - Fitted on a $16 \times 12$ spatial pitch discretization directly on the 2.46M actions dataset via Markov fixed-point iteration.
2. **Two-Pass Possession Segmentation with Contest Absorption**:
   - Defensive deflections and brief contest disruptions are absorbed into ongoing possessions to prevent splintering attacks.
3. **Reliability-Calibrated Zone Vulnerability**:
   - Defensive zone exposure is normalized *per opponent entry* and weighted according to measured split-half reliability coefficients ($r = 0.63$).
4. **Contextual Ratings Engine**:
   - Ratings evaluate players on a $1.0 - 10.0$ scale ($\mu = 6.5$) adjusting for opponent resistance (two-way Ridge regression), game-state decay, and Bayesian shrinkage on minutes played.

---

## Technical Documentation

Detailed technical design documents, statistical proofs, and governing principles are organized in [`docs/`](file:///docs):
- [01. Overview & System Architecture](file:///docs/01_project_overview_and_architecture.md)
- [02. Data Processing & Spatial Invariants](file:///docs/02_data_processing_and_invariants.md)
- [03. Possession Chains & Expected Threat](file:///docs/03_possession_and_expected_threat.md)
- [04. Tactical Models Methodology](file:///docs/04_tactical_models_methodology.md)
- [05. Validation Suite & Empirical Findings](file:///docs/05_validation_and_empirical_findings.md)
- [06. AI Governance & Work Rules](file:///docs/06_ai_rules_and_work_rules.md)
