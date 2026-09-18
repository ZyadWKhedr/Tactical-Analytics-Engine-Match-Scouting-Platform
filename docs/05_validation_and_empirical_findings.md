# Validation Suite & Empirical Findings

## 1. Validation Methodology

All analytical models are validated across the full dataset (1,941 matches) using split-half cross-validation (odd vs even match splits per team) and out-of-sample outcome forecasting.

---

## 2. Key Empirical Findings & Corrections

### Finding 1: Tackle Success Rate is Statistical Noise
- **Observed**: Split-half reliability for raw `tackle_success_rate` was $r = -0.05$.
- **Cause**: Event data feeds code tackles conditionally on challenge type; failed tackles often register as opponent successful dribbles rather than recorded tackles. In addition, interceptions and fouls are recorded with 100% success by definition, skewing aggregate tackle ratios.
- **Remedy**: `tackle_success_rate` was entirely removed from the SWOT catalog and replaced by `clean_recovery_rate` ($r = +0.62$).

### Finding 2: Inversion of Territory Metric
- **Observed**: Initial formulation `105 - opponent_mean_x` tracked opponent distance *from* defending goal, which caused possession dominance to falsely correlate with high territory conceded ($r = +0.87$).
- **Remedy**: Corrected to canonical defending field tilt $\frac{x_{\text{actions}}}{105}$, restoring proper negative correlation with defensive exposure.

### Finding 3: Vulnerability Signal Calibration
- Reweighting vulnerability components to align with measured split-half reliability improved the out-of-sample correlation with conceded goals from $r = 0.36$ to $r = 0.63$.

---

## 3. Validation Summary Table

| Metric Group | Metric Name | Split-Half $r$ | Full-Sample $r$ | Status |
| :--- | :--- | :---: | :---: | :---: |
| **Playstyle** | Possession Dominance | 0.94 | 0.97 | Passed |
| **Playstyle** | Low Block Index | 0.88 | 0.93 | Passed |
| **Playstyle** | Press Intensity (PPDA) | 0.81 | 0.89 | Passed |
| **Vulnerability** | Conceded Entries p90 | 0.65 | 0.79 | Passed |
| **Vulnerability** | Shot Chains / Entry | 0.24 | 0.39 | Passed |
| **Vulnerability** | Composite Vulnerability | 0.63 | 0.77 | Passed |
| **Ratings** | Player Overall Rating | 0.59 | 0.74 | Passed |
| **Predictive** | Out-of-Sample Goal Diff | 0.50 | 0.50 | 71% Sign Acc |
| **Structural** | 15 / 15 Face Validity Tests | 1.00 | 1.00 | Passed |
