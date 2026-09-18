# Tactical Analytics Engine: Project Overview & Architecture

## Executive Summary

The **Tactical Analytics Engine** is an advanced, production-grade football intelligence and match scouting system. It transforms raw event-stream data (SPADL format with 2.46+ million actions across 1,941 matches) into high-fidelity tactical intelligence, automated team dossiers, style classifications, zone vulnerability heatmaps, SWOT matrices, and contextual player/team performance ratings.

---

## Deliverables Summary

| Deliverable | Description | Storage Location |
| :--- | :--- | :--- |
| **Playstyle Classification** | 3-axis continuous indices (Possession, Low Block, Press Intensity) + discrete archetypes + unsupervised KMeans validation. | `models/team_playstyles.csv` |
| **Press Triggers** | Situation-specific pressing propensity under 5s/22m window with Empirical-Bayes shrinkage. | `models/press_triggers.csv` |
| **Zone Vulnerabilities** | 6×5 tactical pitch grid exposure index weighted by split-half reliability. | `models/zone_vulnerabilities.csv` |
| **Team SWOT** | Catalogue of ~35 metrics across 9 phases of play with directional polarity and matchup matrix. | `models/team_swot.csv`, `models/swot_metrics.csv` |
| **Contextual Ratings** | Player & team ratings on a 1–10 scale anchored at 6.5, adjusted for role, opponent strength (Ridge regression), game state, and minutes played. | `models/player_ratings.csv`, `models/team_ratings.csv` |
| **Team Dossiers** | Hierarchical, machine-readable JSON scouting reports combining all analytical layers per club. | `models/team_dossiers.json` |
| **Scouting Application** | Interactive Streamlit web application for exploration, match simulation, and tactical visualizer. | `app.py` |

---

## End-to-End System Architecture

```
                                  RAW DATA SOURCES
                  (actions.csv, events.csv, teams, players, games)
                                         │
                                         ▼
                             CANONICAL NORMALISATION
                   - 180° Pitch Inversion (Goal Kick Detection)
                   - Scoreline Tracking & Own-Goal Resolution
                   - Inferred Match Minutes & Role Centroids
                                         │
                                         ▼
                          POSSESSION CHAIN SEGMENTATION
                   - Two-pass temporal cuts (< 25s gap, restart, shot)
                   - Contest absorption (defensive contacts folded)
                   - Chain metrics: progression, directness, speed
                                         │
                                         ▼
                            EXPECTED THREAT (xT) MODEL
                   - 16×12 Spatial Grid Markov transition matrix
                   - Monotonic goal probability fixed-point solving
                   - Empirical Bayes spatial smoothing
                                         │
          ┌──────────────────────────────┼──────────────────────────────┐
          ▼                              ▼                              ▼
   PLAYSTYLE ENGINE             ZONE VULNERABILITY               SWOT & RATINGS
  - 3 Continuous Axes           - 6×5 Pitch Defensive Grid     - 35 Tactical Metrics
  - KMeans Archetypes           - Conceded Threat / Entry      - 2-Way Ridge Strength
  - Press Trigger Bayesian      - Reliability Reweighting      - Role & Game State Adjust
          └──────────────────────────────┬──────────────────────────────┘
                                         │
                                         ▼
                          PERSISTENCE & SCOUTING LAYER
                   - Models & Data Tables (`models/*.csv`, `*.json`)
                   - Interactive Scouting Dashboard (`app.py`)
                   - Research Notebooks (`notebooks/*.ipynb`)
```

---

## Key Technical Innovations

1. **Self-Fitted Expected Threat (xT)**: Fitted directly on the dataset rather than borrowed from external leagues, eliminating transfer bias.
2. **Contest Absorption in Possession Chains**: Prevents single attacks from artificially splintering into multiple sequences due to momentary deflections or tackles.
3. **Reliability-Calibrated Vulnerability Index**: Uses split-half cross-validation coefficients to weight spatial metrics, boosting signal reliability from $r=0.36$ to $r=0.63$.
4. **Context-Aware Ratings**: Eliminates "stat-padding" bias by discounting actions during garbage time/leading states while rewarding contributions against high-difficulty defensive blocks.
