# 08 — Scoring

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft

## Purpose

Define deterministic formulas and rules for market probability, edge, expected value, evidence quality, confidence, research grade, and recommendation labels.

## Scoring-Layer Separation

MIE separates four analytical layers. They must not collapse into one calculation.

**A good forecast can identify a bad trade. A profitable trade can result from a poorly
calibrated forecast and luck.** Measuring these together makes both unmeasurable — a combined
score cannot tell you whether the probability model improved or the market simply moved.

```text
Evidence package
    ↓
Probability estimation          (Layer 1)
    ↓
Forecast record
    ↓
Forecast calibration            (Layer 2)
```

Separately:

```text
Forecast probability
+ Current market snapshot
+ Liquidity and spread conditions
    ↓
Economic scoring                (Layer 3)
    ↓
Recommendation policy           (Layer 4)
```

### Layer 1 — Probability Estimation

**Purpose:** estimate the probability that the event will settle as YES.

Inputs: market question · settlement rules · normalized evidence · evidence quality · unknowns ·
assumptions · counterarguments.

Outputs: estimated probability · probability range where supported · confidence score ·
assumptions · invalidation conditions · forecast-method version.

Market price should be withheld during the first probability-estimation pass when configured, to
reduce anchoring (`docs/02-ARCHITECTURE.md` §7). Whether it was withheld is recorded on the
forecast and surfaced in reports (`docs/18-DECISION-REPRODUCIBILITY.md`).

**This layer never sees price when the anchoring control is active, and therefore never
produces edge, EV, or a recommendation.**

### Layer 2 — Forecast Calibration

**Purpose:** evaluate whether estimated probabilities align with realized outcomes over time.

Inputs: immutable forecast · verified settlement outcome.

Outputs: Brier score · probability bucket · calibration error · category-level performance ·
model and prompt attribution.

**Forecast calibration does not evaluate whether a market trade was profitable.** It requires
only the forecast and the outcome — no price, no edge, no EV. See `docs/09-CALIBRATION.md`.

### Layer 3 — Economic Scoring

**Purpose:** determine whether the difference between estimated probability and available market
price represents a potentially favorable economic opportunity.

Inputs: estimated probability · current market snapshot · executable-side price · spread ·
liquidity · applicable fees · time to expiration · configured uncertainty penalty.

Outputs: market-implied probability · raw edge · adjusted edge · expected value · economic-risk
flags · scoring-policy version.

**Economic scoring is bound to a specific market snapshot.** The same forecast scored against a
different snapshot is a different economic score, not an update to the existing one.

### Layer 4 — Recommendation Policy

**Purpose:** translate forecast quality and economic scoring into a human-reviewable label.

Inputs: forecast probability · forecast confidence · evidence grade · expected value · adjusted
edge · liquidity flags · settlement ambiguity · recommendation-policy version.

Outputs: `buy_candidate` · `watch` · `pass` · `avoid` · recommendation rationale · human-review
requirements.

**A recommendation is not a trade instruction** (`adr/0008-mie-domain-boundary.md`).

### Prohibited

- Combining the layers into a single opaque "master score."
- Deriving calibration from realized profit or simulated P&L.
- Producing an economic score that does not reference a timestamped market snapshot.
- Versioning recommendation thresholds together with probability methodology — they change for
  different reasons and must be independently attributable.

### Versioning

Each layer carries its own version identifier, changed independently:

| Layer | Version identifier |
|---|---|
| 1 — Probability estimation | `forecast_method_version` |
| 2 — Forecast calibration | `calibration_method_version` |
| 3 — Economic scoring | `scoring_policy_version` |
| 4 — Recommendation policy | `recommendation_policy_version` |

## Market Probability

For a YES contract priced in dollars:

```text
market_probability = yes_price
```

For prices represented in cents:

```text
market_probability = yes_price_cents / 100
```

If both bid and ask are present, use configurable mode:

- Conservative: use ask price for buy-side YES evaluation.
- Midpoint: `(yes_bid + yes_ask) / 2`.
- Last price: use only for historical/summary view.

MVP default: conservative ask price when evaluating buy candidate.

## Edge

```text
edge = estimated_probability - market_probability
```

## Expected Value

For YES contract:

```text
EV = (p * (1 - price)) - ((1 - p) * price)
```

Where:

- `p` = estimated probability.
- `price` = contract cost in dollars from 0 to 1.

## Evidence Quality Score

Score 0-100.

| Factor | Weight |
|---|---:|
| Source authority | 25 |
| Source recency | 20 |
| Direct relevance | 20 |
| Contradictory evidence coverage | 15 |
| Settlement specificity | 10 |
| Completeness | 10 |

## Confidence Score

Confidence is not probability. Confidence measures reliability of the estimate.

Inputs:

- Evidence quality.
- Agreement among sources.
- Settlement clarity.
- Historical predictability of category.
- Missing evidence penalty.

## Research Grade

| Grade | Meaning |
|---|---|
| A | Strong evidence, clear settlement, low ambiguity |
| B | Good evidence, manageable uncertainty |
| C | Usable but incomplete evidence |
| D | Weak evidence or high ambiguity |
| F | Insufficient for recommendation |

## Recommendation Rules

MVP defaults:

| Condition | Recommendation |
|---|---|
| Research grade F | `pass` |
| EV < 0 | `pass` |
| Confidence < 65 | `watch` |
| Edge >= 0.15 and confidence >= 80 and grade A/B | `buy_candidate` |
| Edge >= 0.08 and confidence >= 70 and grade A/B/C | `buy_candidate` |
| Edge > 0 and confidence >= 65 | `watch` |
| Low liquidity or wide spread | `watch` or `pass` |

## Label Definitions

### `buy_candidate`

Research indicates positive expected value under current assumptions. This is not a trade instruction.

### `watch`

Potentially interesting but not sufficiently strong, complete, or liquid.

### `pass`

No positive EV or evidence quality is insufficient.

### `avoid`

Evidence suggests market is misaligned against the candidate side or settlement risk is unacceptable.

## Risk Flags

- Low liquidity.
- Wide spread.
- Ambiguous settlement.
- Source conflict.
- High volatility before close.
- Evidence stale.
- Model uncertainty high.

## YAGNI Exclusions

Deferred from MVP:

- Kelly sizing.
- Portfolio exposure limits.
- Automated position sizing.
- Multi-leg strategy optimization.
- Real-money P&L attribution.

## Change Policy

Formula or threshold changes require:

- ADR.
- Version bump — of the **affected layer only** (see Scoring-Layer Separation).
- Backtest or replay when possible.
- Calibration impact note.
- Lifecycle promotion through `docs/19-PROMOTION-AND-RETIREMENT-POLICY.md`. A threshold change
  is a decision-producing component change and may not go straight to production.

Recommendation-threshold changes are singled out for care: loosening a threshold raises
candidate volume immediately and degrades precision slowly, so volume is a guardrail metric,
never a success metric.