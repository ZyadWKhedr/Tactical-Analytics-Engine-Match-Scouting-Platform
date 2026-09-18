# AI Governance, Working Rules & Analytical Standards

## 1. Scope & Objective

This document establishes the binding standards, operating principles, AI behavioral guidelines, and mathematical integrity rules governing all development, modeling, and analysis within this project.

---

## 2. AI Operating Rules & Prompt Engineering Protocol

1. **Deterministic Reproducibility**:
   - All statistical algorithms, Bayesian priors, stochastic simulations, and clustering pipelines must explicitly set seeds (e.g., `random_state=42`).
   - Any LLM or AI-assisted component generating scouting narratives must enforce zero-temperature or strict schema validation.

2. **No Data Snooping / Leakage Prevention**:
   - Out-of-sample evaluations, cross-validation, and split-half reliability tests must strictly partition training and evaluation sets before fitting priors or parameters (e.g. xT surfaces, positional regression weights).
   - Inferences must never leverage future timestamps within the same match.

3. **Ground Truth & Attribution Invariants**:
   - Where ground truth is unobserved (such as home/away tags, referee decisions, official substitutions), the system must never hallucinate values. Derived metrics must explicitly carry confidence annotations (e.g. `minutes_est`, `position_confidence`).

4. **Self-Auditing & Bias Correction**:
   - Every metric introduced must be subjected to a face-validity check and split-half reliability calculation. Metrics showing non-repeatable signal ($r < 0.20$) or negative correlation must be pruned or shrunk via Empirical Bayes.

---

## 3. Engineering & Work Rules

### 3.1 Code Architecture Standards
- **Notebook-Centric Core**: Production analytics pipelines, exploratory data analyses, model trainings, and validations must reside in numbered, self-contained Jupyter Notebooks (`notebooks/*.ipynb`) with structured Markdown explanations before each code cell.
- **Root Application**: Interactive scouting tools and dashboards must reside in `app.py` in the root directory, with dependencies documented in `requirements.txt`.
- **Relational Data Tier**: Database schemas, bulk loaders, and analytical SQL scripts must reside in `sql/`.
- **Model Storage**: All model parameters, generated feature tables, lookup dictionaries, and JSON dossiers must be stored in `models/`.
- **Visual Assets**: All generated tactical charts, pitch heatmaps, and validation plots must be saved to `figures/`.

### 3.2 Numerical & Mathematical Invariants
- **Coordinate Consistency**: All spatial features must assume the canonical $105\text{ m} \times 68\text{ m}$ coordinate system, attacking left-to-right ($x \to 105$).
- **Shrinkage on Sparse Samples**: Percentiles, ratings, and transition probabilities must apply Empirical Bayes or additive Bayesian priors to prevent outliers with tiny denominators from skewing distributions.
- **Scale Anchoring**: All tactical indices and SWOT metrics must adhere to standardized scales:
  - Percentiles: $[0.0, 100.0]$
  - Ratings: $[1.0, 10.0]$ (anchored at $\mu = 6.5$)
  - Expected Threat: Non-negative monotonic surface peaking at the goal line.

---

## 4. Analytical Quality Assurance Checklist

- [x] Canonical pitch orientation verified via goal kick positions.
- [x] Possession chains handle contest deflections via contest absorption.
- [x] xT value iteration verified for monotonic convergence.
- [x] Playstyle axes computed independently without forced collinearity.
- [x] Zone vulnerability weights derived from split-half empirical reliability.
- [x] Ratings adjust for role, opponent resistance, game state, and sample size.
- [x] All CSV tables exported with both CSV and Parquet formats in `models/`.
- [x] Interactive web interface operational via `app.py`.
