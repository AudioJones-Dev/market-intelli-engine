# 02 — Architecture

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft  
**Status:** Architecture specification

## Architectural Objective

Build a simple, auditable batch-processing platform that turns market data into evidence-backed probability estimates and calibration records.

## YAGNI Position

The MVP uses scheduled batch workflows. No websocket streaming, frontend, distributed agent mesh, autonomous trading, or portfolio optimizer is required.

## Domain Boundary

MIE is a research, forecasting, expected-value analysis, and calibration platform. It is **not**
a brokerage, portfolio manager, or execution system. This boundary is architectural, not merely
scope, and is defined in [`adr/0008-mie-domain-boundary.md`](../adr/0008-mie-domain-boundary.md).

MIE **may not own**: brokerage authentication or credentials · live or paper order submission ·
portfolio allocation · position sizing · margin calculations · trade reconciliation · intraday
position management · autonomous capital deployment · stop-loss execution · account-level risk
enforcement.

MIE computes expected value per contract. **EV is analysis; sizing is execution.** The boundary
is crossed when a quantity of contracts, an allocation fraction, an account balance, or an open
position enters the model.

Recommendations are produced for human review. **A recommendation is not an execution
instruction.**

## Analytical Layer Separation

Scoring is separated into four independently versioned layers (`docs/08-SCORING.md`):

```text
Layer 1  Probability estimation   → forecast record        (no price required)
Layer 2  Forecast calibration     → calibration record     (forecast + outcome only)
Layer 3  Economic scoring         → economic score         (bound to a market snapshot)
Layer 4  Recommendation policy    → recommendation record
```

A good forecast can identify a bad trade; a profitable trade can follow from a poor forecast and
luck. Combining these into one score makes both unmeasurable. No opaque "master score" may
replace the layers.

## High-Level Flow

```text
Scheduler
  -> Kalshi Provider
  -> Market Snapshot Store
  -> Market Ranking Engine
  -> Research Queue
  -> Perplexity Research Provider
  -> Evidence Normalizer
  -> Probability Engine
  -> EV Calculator
  -> Report Generator
  -> Prediction Ledger
  -> Outcome + Calibration Engine
```

## System Components

### 1. Scheduler

Responsible for launching recurring jobs.

MVP options:

- n8n workflow.
- Supabase scheduled Edge Function.
- GitHub Actions cron for local prototype only.

Default recommendation: n8n or Supabase scheduled Edge Functions.

### 2. Market Provider Interface

Defines the contract for market ingestion.

```ts
interface MarketProvider {
  listMarkets(params: MarketQueryParams): Promise<Market[]>;
  getMarket(ticker: string): Promise<Market>;
}
```

MVP implementation:

- `KalshiProvider`

Deferred:

- PolymarketProvider
- MetaculusProvider
- ManifoldProvider

### 3. Market Snapshot Store

Stores raw and normalized market data. This is critical for reproducibility.

### 4. Market Ranking Engine

Filters and ranks markets by research suitability.

Inputs:

- Status.
- Close time.
- Liquidity fields.
- Spread fields where available.
- Category.
- Manual allow/deny lists.

Output:

- Bounded research queue.

### 5. Research Provider Interface

```ts
interface ResearchProvider {
  researchMarket(input: ResearchRequest): Promise<ResearchResult>;
}
```

MVP implementation:

- `PerplexityProvider`

### 6. Evidence Normalizer

Converts provider output into a canonical evidence schema:

- Facts.
- Evidence for.
- Evidence against.
- Unknowns.
- Source URLs.
- Source quality.
- Recency.
- Contradictions.

### 7. Probability Engine

Uses structured evidence to produce probability estimate and confidence.

Important constraint: the system should support an analysis mode where the model receives market question and evidence before seeing market price, reducing anchoring risk.

### 8. EV Calculator

Calculates:

- Market-implied probability.
- Estimated edge.
- Expected value.
- Recommendation band.

### 9. Report Generator

Produces Markdown reports for human review.

MVP target:

- Daily report.
- Weekly calibration review.

Output structure is fixed by `docs/design/ANALYST_REPORT_STANDARD.md`. Because the MVP has no
frontend, the report is the product surface, so that standard is an acceptance contract rather
than a style guide. Templates live in `reports/templates/`; generated output in
`reports/generated/`.

### 10. Prediction Ledger

Immutable record of each recommendation and its inputs.

### 11. Decision Journal

Stores reasoning summaries, counterarguments, and post-settlement retrospectives.

### 12. Calibration Engine

Scores settled forecasts using Brier score and calibration buckets. Calibration uses the
forecast and the outcome only — realized EV is an economic diagnostic recorded alongside it, and
never an input to the Brier score or bucket assignment (`docs/09-CALIBRATION.md`).

### 13. Decision Manifest Builder

Assembles the immutable record binding every input behind a recommendation: market snapshot,
evidence dossier, source provenance, agent executions, settlement-rules hash, and the version of
each analytical layer. Required for every recommendation
(`docs/18-DECISION-REPRODUCIBILITY.md`).

### 14. Component Registry and Promotion Gate

Holds the lifecycle state of every decision-producing component — prompt, agent, model config,
ranking rule, scoring formula, threshold, provider
(`docs/19-PROMOTION-AND-RETIREMENT-POLICY.md`).

Enforcement responsibilities:

- Only `approved` components may influence official outputs.
- `experimental` and `shadow` components write to separate storage and never reach a report.
- `suspended` components **fail closed** — no recommendation is produced. Producing nothing is
  always acceptable; producing an ungoverned recommendation is not.
- Agents may propose changes; only a recorded human approval promotes one.

## Repository Structure

```text
market-intelli-engine/
├── README.md
├── docs/
├── adr/
├── database/
│   └── migrations/
├── prompts/
├── services/
│   ├── providers/
│   ├── ingestion/
│   ├── ranking/
│   ├── research/
│   ├── analysis/
│   ├── scoring/
│   └── reporting/
├── workflows/
├── reports/
├── scripts/
└── tests/
```

## Sequence: Daily Research Run

```text
1. Scheduler starts daily run.
2. KalshiProvider lists active markets.
3. Raw markets are stored.
4. Normalized market snapshots are created.
5. Ranking engine selects top N markets.
6. PerplexityProvider researches each selected market.
7. Evidence normalizer stores structured evidence.
8. Probability engine estimates probability and confidence.
9. EV calculator compares estimate to market price.
10. Report generator creates daily report.
11. Prediction ledger stores recommendation records.
```

## Failure Philosophy

Failures should be isolated by stage.

- Ingestion failure must not delete existing data.
- Research failure for one market must not fail the entire run.
- Analysis failure must produce a diagnostic error record.
- Report generation should include partial results when safe.

## Architectural Decisions Locked for MVP

| Decision | Rationale |
|---|---|
| Batch scheduler over websocket | Simpler and sufficient for daily research. |
| Supabase as system of record | SQL, history, durability, easy API access. |
| Kalshi only | Single provider reduces MVP complexity. |
| Perplexity only | Research provider abstraction without multi-provider build. |
| Markdown reports | Human-readable and easy to archive. |
| No trading | Keeps system research-only and human-in-the-loop. |

## Required ADRs

An ADR is required for:

- Adding market providers.
- Adding research providers.
- Changing database schema after baseline migration.
- Adding trade execution, brokerage integration, position sizing, or portfolio state
  (`adr/0008-mie-domain-boundary.md`).
- Adding frontend/user accounts.
- Changing scoring formulas.
- Changing recommendation thresholds.
- Introducing new infrastructure.
- Adopting a design-system resnapshot or an upstream design change.
- Adding a shared design-system package or HTML/PDF report rendering.
- Extracting any shared contract into a package (`docs/17-SHARED-CONTRACT-CANDIDATES.md`).
- Introducing a new decision-producing model or provider.
- Changing a security boundary.