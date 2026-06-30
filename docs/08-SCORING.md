# 08 — Scoring

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft

## Purpose

Define deterministic formulas and rules for market probability, edge, expected value, evidence quality, confidence, research grade, and recommendation labels.

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
- Version bump.
- Backtest or replay when possible.
- Calibration impact note.