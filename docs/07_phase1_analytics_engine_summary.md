# Phase 1 Analytics Engine Summary & Technical Report

## 1. Overview and Scope

This document provides a comprehensive technical summary of all models, algorithms, and analytical pipelines delivered for Phase 1 of the Tactical Analytics Engine. The engine operates on the SPADL event dataset (2.46+ million actions across 1,941 matches) and produces validated tactical intelligence across team style classification, defensive vulnerability mapping, contextual ratings, expected metrics (xG/xA), passing networks, heatmaps, pitch control models, and historical split-half cross-validation.

All analytical pipelines are implemented in self-contained, reproducible Jupyter Notebooks located in the `notebooks/` directory.

---

## 2. Implemented Modules and Methodologies

### 2.1 Feature Preparation & Normalisation (`notebooks/01_eda_and_data_cleaning.ipynb`)
- **Canonical Coordinate System**: All spatial actions are normalized to a standard $105\text{ m} \times 68\text{ m}$ pitch dimension with left-to-right attacking orientation ($x \to 105$).
- **Goal-Kick 180° Inversion Detection**: Identifies and corrects inverted pitch coordinate recordings by inspecting defensive goal kick positions.
- **Match State & Scoreline Tracking**: Enriches raw action streams with cumulative match scorelines, running goal differentials, and estimated player minutes.

### 2.2 Possession Chains & Event Sequencing (`notebooks/02_possession_chains_and_xt.ipynb`)
- **Two-Pass Possession Segmentation**:
  - Pass 1: Identifies sequence boundaries based on team turnover, period change, dead-ball restarts, shots, or temporal gaps $\Delta t > 25.0\text{ s}$.
  - Pass 2: Applies contest absorption to fold momentary defensive deflections and contested tackles back into active attacking sequences.
- **Sequencing Features**: Computes chain duration, net $X$-progression, directness ratio ($\text{Net Displacement} / \text{Total Distance}$), tempo ($\text{m/s}$), and sequence action counts.
- **Self-Fitted Expected Threat (xT)**: Implements a $16 \times 12$ spatial discretization Markov grid solved via value iteration fixed-point convergence directly on the dataset:
  $$\text{xT}(x, y) = S(x, y) \cdot G(x, y) + M(x, y) \sum_{x', y'} T(x, y \to x', y') \cdot \text{xT}(x', y')$$

### 2.3 Expected Goals (xG) & Expected Assists (xA) (`notebooks/03_xg_and_xa_modeling.ipynb`)
- **Expected Goals (xG)**:
  - Models shot conversion probability using trigonometric visible goal angle between posts $(105, 30.34)$ and $(105, 37.66)$, Euclidean distance to goal center $(105, 34)$, body part indicator (foot vs header), and preceding chain tempo.
  - Model calibrated using logistic link function and verified with Brier score loss and reliability diagrams.
- **Expected Assists (xA)**:
  - Quantifies key pass delivery threat by attributing the receiver's shot conversion probability discounted by pass delivery distance and difficulty factors.

### 2.4 Tactical Playstyle Classification & Press Triggers (`notebooks/04_playstyle_and_pressing.ipynb`)
- **Continuous Style Indices (0-100 Percentiles)**:
  - **Possession Dominance**: Blend of passing volume per match, completion rate, sequence length, and territorial tilt.
  - **Low-Block Tendency**: Share of defensive actions in deep third ($x < 35$), deep sequence regains, and defensive line depth.
  - **Press Intensity**: Inverse PPDA in opponent 60% third, high turnovers ($x > 70$), and duel frequency.
- **Situational Press Triggers**:
  - Measures situational defensive reactivity within a $5.0\text{ s}$ and $22.0\text{ m}$ window upon opponent entry into defined trigger states (sideline trap, backward pass, deep build-up).
  - Stabilized via Empirical Bayes shrinkage:
    $$\theta_{\text{shrunk}} = \frac{N_{\text{press}} + K \cdot \mu_{\text{league}}}{N_{\text{situations}} + K}, \quad K = 25.0$$
- **Unsupervised KMeans Archetypes ($k=6$)**: Classifies teams into tactical archetypes (Positional Play, High Press Direct Transition, Low Block Counter, Wing Play, Deep Staged Build-Up, Mid-Block Pragmatic).

### 2.5 Pitch-Zone Vulnerability & SWOT Mapping (`notebooks/05_vulnerability_and_swot.ipynb`)
- **Spatial Grid Partitioning**:
  - Defending frame partitioned into 6 Pitch Bands $\times$ 5 Lateral Channels (30 zones).
  - Macro Corridors:
    - **Flanks**: Left Wing ($y < 13.6\text{ m}$) and Right Wing ($y > 54.4\text{ m}$).
    - **Half-spaces**: Left Channel ($13.6 \le y < 27.2\text{ m}$) and Right Channel ($40.8 \le y < 54.4\text{ m}$).
    - **Central Areas**: Central Channel ($27.2 \le y < 40.8\text{ m}$).
- **Reliability-Weighted Vulnerability Index**:
  $$\text{Vulnerability} = 0.45 \cdot z(\text{entries}) + 0.30 \cdot z(\text{shot\_chains}) + 0.15 \cdot z(\text{conceded\_xT}) - 0.10 \cdot z(\text{recoveries})$$
- **Team SWOT Engine**: Computes percentiles across 35+ metrics spanning 9 phases of play (Build-up, Creation, Finishing, Retention, Defending, Discipline, Pressing, Set Pieces, Transition).
- **Matchup Simulation Engine**: Identifies exploitable tactical vectors by crossing Team A attacking strengths ($>75\text{th percentile}$) against Team B defensive weaknesses ($<25\text{th percentile}$).

### 2.6 Contextual Player & Squad Rating Engine (`notebooks/06_player_and_team_ratings.ipynb`)
- **Standardized Scale**: 1.0 to 10.0 scale anchored at $\mu = 6.5$ across 6 sub-dimensions (Progression, Creation, Finishing, Retention, Defending, Discipline).
- **Contextual Adjustments**:
  - **Rolling Performance Baseline**: Exponential Moving Average (EMA) capturing player form trajectory.
  - **Home / Away Weighting**: Isolates and regresses venue advantage effects.
  - **Fixture Importance**: Weights performance based on late-season match leverage and stakes.
  - **Opponent Tier / Resistance**: Ridge regression adjustment for opponent offensive and defensive strength.
  - **Bayesian Minutes Prior**: Regresses small sample ratings ($< 300\text{ mins}$) toward positional cohort means:
    $$R_{\text{shrunk}} = \frac{M}{M + M_0} R_{\text{obs}} + \frac{M_0}{M + M_0} \mu_{\text{position}}, \quad M_0 = 300.0$$

### 2.7 Passing Networks & Tactical Heatmaps (`notebooks/07_passing_networks_and_heatmaps.ipynb`)
- **Passing Network Generator**:
  - Computes player spatial centroids $(x, y)$ from successful passing sequences.
  - Quantifies directed pairwise pass volumes and connection thickness.
  - Derives graph centrality metrics (degree centrality, betweenness).
- **Heatmap Visualizer**:
  - Implements 2D Gaussian Kernel Density Estimation (KDE) and binned 2D pitch histograms for player footprints and defensive regains.

### 2.8 Pitch Control Model (`notebooks/08_pitch_control_model.ipynb`)
- **Physics-Based Time-to-Intercept**:
  $$T_i(x, y) = t_{\text{reaction}} + \frac{\|(x, y) - (x_i, y_i)\|}{v_{\text{max}}}$$
  where $t_{\text{reaction}} = 0.7\text{ s}$ and $v_{\text{max}} = 5.0\text{ m/s}$.
- **Spatial Territorial Dominance**: Computes logistic continuous probability surface $P_{\text{Att}}(x, y)$ across the pitch grid.

### 2.9 Historical Match Validation & Audit (`notebooks/09_historical_validation_and_reporting.ipynb`)
- **Split-Half Reliability**: Tests parameter stability across odd vs even match splits:
  - Possession Dominance: $r = 0.94$
  - Low Block Index: $r = 0.88$
  - Press Intensity: $r = 0.81$
  - Conceded Entries p90: $r = 0.65$
  - Composite Vulnerability: $r = 0.63$
  - Clean Recovery Rate: $r = 0.62$
  - Contextual Player Ratings: $r = 0.59$
  - Raw Tackle Success Rate: $r = -0.05$ (pruned as noise)
- **Out-of-Sample Predictive Power**: Projected rating differentials predict held-out goal difference at $r = 0.50$ with $71\%$ sign accuracy.

---

## 3. Directory Structure & Deliverables Matrix

```
.
├── app.py                                    # Interactive Streamlit Scouting Platform
├── docs/
│   ├── 01_project_overview_and_architecture.md
│   ├── 02_data_processing_and_invariants.md
│   ├── 03_possession_and_expected_threat.md
│   ├── 04_tactical_models_methodology.md
│   ├── 05_validation_and_empirical_findings.md
│   ├── 06_ai_rules_and_work_rules.md
│   └── 07_phase1_analytics_engine_summary.md  # Technical Summary Document
├── figures/                                  # Visual Assets & Charts
├── models/                                   # Persisted CSV, Parquet & JSON Tables
├── notebooks/                                # Numbered Self-Contained Notebooks
│   ├── 01_eda_and_data_cleaning.ipynb
│   ├── 02_possession_chains_and_xt.ipynb
│   ├── 03_xg_and_xa_modeling.ipynb
│   ├── 04_playstyle_and_pressing.ipynb
│   ├── 05_vulnerability_and_swot.ipynb
│   ├── 06_player_and_team_ratings.ipynb
│   ├── 07_passing_networks_and_heatmaps.ipynb
│   ├── 08_pitch_control_model.ipynb
│   └── 09_historical_validation_and_reporting.ipynb
├── requirements.txt                          # Python Environment Dependencies
└── sql/                                      # PostgreSQL Relational Schemas & Queries
```
