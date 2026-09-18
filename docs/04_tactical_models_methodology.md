# Tactical Models Methodology

## 1. Playstyle Classification & Press Triggers

### Continuous Tactical Axes (0–100 Percentiles)
Teams are evaluated along three continuous, unconstrained tactical axes:
1. **Possession Dominance**: Blend of possession share, pass completion rate, sequence length, and territorial tilt.
2. **Low Block Tendency**: Proportion of defensive actions in the deep defensive third ($x < 35$), deep sequence regains, and low defensive engagement line.
3. **Press Intensity**: Inverse PPDA (Passes Per Defensive Action in attacking 60% of the pitch), high turnovers forced ($x > 70$), and counter-press speed.

> **Tactical Note**: Low Block and Press Intensity are non-orthogonal. A team can operate a disciplined low block while maintaining explosive counter-press triggers upon opponent zone entry.

### Unsupervised KMeans Archetypes
K-Means clustering ($k = 6$) groups clubs into tactical archetypes:
- *Possession Dominant (Positional Play)*
- *High-Pressing Direct Transition*
- *Balanced Low Block Counter-Attacking*
- *Direct Wing Play / High Volume Crossing*
- *Deep Staged Build-Up*
- *Mid-Block Pragmatic*

### Press Triggers
Evaluates situational reactivity: given an opponent enters a specific tactical state (e.g., sideline backward pass, trapped fullback), what is the probability of a defensive intervention within $5.0\text{ s}$ and $22\text{ m}$? Rates are adjusted via Empirical Bayes shrinkage against league expectations.

---

## 2. Defensive Zone Vulnerability Index

Defensive vulnerability is assessed across a $6 \times 5$ grid (30 zones) in the defending team's frame of reference.

### Signal Breakdown & Reliability Calibration
To measure true structural vulnerability rather than pure volume of opponent attacks, signals are normalised **per opponent entry** into that zone:
- $\text{conceded\_entries\_p90}$ (Split-half $r = 0.647$)
- $\text{conceded\_shot\_chains\_per\_entry}$ (Split-half $r = 0.244$)
- $\text{clean\_recovery\_rate}$ (Split-half $r = 0.085$)
- $\text{conceded\_xt\_per\_entry}$ (Split-half $r = 0.081$)
- $\text{conceded\_goals\_per\_entry}$ (Split-half $r = 0.074$)

### Reliability-Weighted Vulnerability Formula
$$\text{Vulnerability Index} = 0.45 \cdot z(\text{entries}) + 0.30 \cdot z(\text{shot\_chains}) + 0.15 \cdot z(\text{conceded\_xT}) - 0.10 \cdot z(\text{recoveries})$$
This reliability-weighted composite doubles out-of-sample zone lift and lifts stability from $r=0.36$ to $r=0.63$.

---

## 3. Team SWOT & Head-to-Head Matchup Matrix

- Evaluates ~35 high-signal tactical metrics spanning Build-up, Final Third Creation, Transition Defense, Pressing, Set Pieces, and Rest Defense.
- Translates raw rates into league percentiles with strict polarity control (higher is always better).
- The **Matchup Engine** projects pairwise tactical advantages by crossing Team A's offensive strengths ($>75\text{th percentile}$) against Team B's defensive weaknesses ($<25\text{th percentile}$), highlighting optimal zones of attack.

---

## 4. Contextual Player & Team Ratings

Ratings are scaled from 1.0 to 10.0 (anchored at 6.5 league average) across six sub-dimensions:
1. **Progression**: xT added via passes/carries, line-breaking passes.
2. **Creation**: Shot assists, key passes, box entries.
3. **Finishing**: Shot conversion over expected, shot accuracy.
4. **Retention**: Pass completion vs difficulty, low turnover rate under pressure.
5. **Defending**: Clean recoveries, interceptions, tackles per minute, ground duels.
6. **Discipline**: Low foul concessions and avoidance of dangerous turnovers.

### Contextual Adjustments:
- **Two-Way Ridge Regression**: Isolates team offensive potency vs opponent defensive resistance.
- **Game State Decay**: Down-weights output accrued in comfortable leading positions (+2 or +3) to avoid stat inflation.
- **Bayesian Minutes Prior**: Regresses small-sample ratings towards positional cohort means:
  $$R_{\text{shrunk}} = \frac{M}{M + M_0} R_{\text{obs}} + \frac{M_0}{M + M_0} \mu_{\text{position}}$$
