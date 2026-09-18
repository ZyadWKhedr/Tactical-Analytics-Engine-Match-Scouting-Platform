# Possession Chains & Expected Threat (xT)

## 1. Two-Pass Possession Chain Segmentation

Possession chains segment the continuous action stream into discrete tactical possessions.

### Pass 1: Primary Boundary Cuts
A new chain is created whenever:
- Possession changes team.
- Period / half changes.
- A dead-ball restart occurs (throw-in, goal kick, corner, free kick).
- A shot is taken.
- The time interval between consecutive actions exceeds $\Delta t > 25.0\text{ s}$.

### Pass 2: Contest Absorption
In high-pressure situations, defensive disruptions (tackles, blocked crosses, incomplete clearances) often deflect the ball right back to the attacking side. If a lone opponent defensive touch (tackle, interception, clearance, block, bad touch) is immediately followed by the original team regaining control within 3 seconds, that action is absorbed into the attacking chain rather than splintering the attack into three artificial fragments.

---

## 2. Possession Chain Metrics

Each completed chain carries rich descriptive attributes:
- **Duration**: Elapsed time $t_{\text{end}} - t_{\text{start}}$.
- **Progression**: Net forward displacement $\Delta X = x_{\text{end}} - x_{\text{start}}$.
- **Directness**: Ratio of displacement to total distance traversed $\frac{\sqrt{\Delta X^2 + \Delta Y^2}}{\sum \text{step distance}}$.
- **Speed**: Progression speed in meters per second ($\text{m/s}$).
- **Regain Origin**: High press ($x > 70$), Midfield ($x \in [35, 70]$), Deep build-up ($x < 35$), or Set piece.
- **Outcome**: Box Entry, Final Third Entry, Shot, Goal, or Turnover.

---

## 3. Expected Threat (xT) Model

The Expected Threat model estimates the probability that a possession starting in grid zone $z$ will result in a goal within the next $k$ actions.

### Discretization & Grid
- **Pitch Dimensions**: $105\text{ m} \times 68\text{ m}$.
- **Grid Layout**: 16 horizontal bins $\times$ 12 vertical bins ($192$ cells).

### Mathematical Formulation
For each zone $z \in \{1, \dots, 192\}$:
$$xT(z) = s(z) \cdot g(z) + m(z) \sum_{z'} T(z \to z') \cdot xT(z')$$

Where:
- $s(z)$: Probability of shooting from zone $z$.
- $g(z)$: Goal conversion probability given a shot from zone $z$.
- $m(z) = 1 - s(z)$: Probability of moving (passing/dribbling) from zone $z$.
- $T(z \to z')$: Transition probability of moving the ball from zone $z$ to zone $z'$.

### Fixed-Point Iterative Solution
The value vector $\mathbf{xT}$ is solved via value iteration until convergence:
$$\mathbf{xT}^{(k+1)} = \mathbf{s} \odot \mathbf{g} + \mathbf{m} \odot (T \cdot \mathbf{xT}^{(k)}), \quad \|\mathbf{xT}^{(k+1)} - \mathbf{xT}^{(k)}\|_\infty < 10^{-6}$$

### Spatial Regularisation & Bayesian Shrinkage
To prevent small-sample cells (e.g. corner flags or distant sidelines with 1 accidental shot) from overfitting, shooting and scoring probabilities are shrunk towards the league baseline:
$$\hat{g}(z) = \frac{N_{\text{goals}}(z) + \alpha \cdot g_{\text{league}}}{N_{\text{shots}}(z) + \alpha}, \quad \alpha = 10$$
