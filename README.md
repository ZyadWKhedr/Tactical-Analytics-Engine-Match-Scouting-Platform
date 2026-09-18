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

## Quickstart Guide

### 1. Installation

Clone the repository and install required packages:
```bash
git clone https://github.com/your-username/tactical-football-analytics.git
cd "final project"
pip install -r requirements.txt
```

### 2. Launch the Interactive Scouting Web Application

```bash
streamlit run app.py
```
This opens the tactical scouting application in your default browser at `http://localhost:8501`.

### 3. Running the Jupyter Notebooks

Open Jupyter Lab or Notebook to step through the modular analysis pipeline:
```bash
jupyter lab
```
Navigate to `notebooks/` and run notebooks `01` through `07` in sequence.

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
