# Data Processing, Schema & Invariant Enforcement

## 1. Data Schema & Core Inputs

The system processes event data structured according to the SPADL (Spatial Play Actions for Data Analytics) representation, stored in the [`data/`](file:///data) directory:

- **Total Actions**: 2,462,726 actions across 1,941 games.
- **Entities**: 142 clubs, 3,031 players, 19 atomic action types.
- **Relational Tables in `data/`**:
  - `data/games.csv`: Unique identifier `game_id`.
  - `data/teams.csv`: Club IDs.
  - `data/players.csv`: Player IDs.
  - `data/types.csv`: Action types (pass, dribble, shot, tackle, interception, etc.).
  - `data/results.csv`: Outcome indicators (success, fail, offside, own_goal).
  - `data/bodyparts.csv`: Foot, head/body, other.
  - `data/actions.csv`: Coordinate-level events ($x \in [0, 105], y \in [0, 68]$).
  - `data/events.csv`: Raw event feeds.
  - `data/events_normalized.csv`: Pre-normalized event records.

---

## 2. Spatial Normalisation: Pitch Inversion Detection

In raw data streams, team attacking direction is frequently inconsistent or flipped:
- In the unadjusted feed, teams attack towards $x = 0$, placing penalty spots at $x \approx 10.5$ and goal kicks at $x \approx 100$.
- To standardise the pitch into a canonical forward orientation where teams always attack from left to right ($x \to 105$), a **180° rotation** is required:
  $$x_{\text{canonical}} = 105 - x_{\text{raw}}$$
  $$y_{\text{canonical}} = 68 - y_{\text{raw}}$$
- **Critical Insight**: A naive horizontal reflection ($x \to 105 - x$) would invert the $y$-axis, turning right wingers into left wingers. The 180° rotation preserves wing chirality and tactical geometry.

---

## 3. Match Context Derivation

The raw feed contains no scoreboard metadata, line-up rosters, or match timer clocks. The pipeline reconstructs ground truth through event calculus:

### Scoreline & Game State
- Shots with `result_id == 1` are recorded as goals for the acting team.
- `bad_touch` actions with `result_id == 3` represent own goals and are awarded to the opposition.
- Game state is computed before each action as:
  $$\Delta G(t) = G_{\text{acting}}(t) - G_{\text{opponent}}(t)$$

### Playing Time Estimation
- In the absence of sub timestamps, each player's active window $[t_{\text{first}}, t_{\text{last}}]$ is snapped to match period bounds (0s or 2700s+):
  $$\text{minutes\_est} = \frac{t_{\text{last\_snapped}} - t_{\text{first\_snapped}}}{60}$$

### Role Centroid Inference
- Positional groups are inferred by taking the median $(x, y)$ coordinates of each player's open-play actions:
  - **GK**: $x < 15, |y - 34| < 12$
  - **CB**: $x \in [15, 38], |y - 34| < 14$
  - **FB/WB**: $x \in [15, 55], |y - 34| \ge 14$
  - **CM/DM**: $x \in [38, 65], |y - 34| < 15$
  - **WM/Winger**: $x \in [55, 90], |y - 34| \ge 15$
  - **CF/Striker**: $x \in [65, 105], |y - 34| < 15$
