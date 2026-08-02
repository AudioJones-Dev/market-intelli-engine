# 02 — Architecture

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft  
**Status:** Architecture specification

## Architectural Objective

Build a simple, auditable batch-processing platform that turns market data into evidence-backed probability estimates and calibration records.

## YAGNI Position

The MVP uses scheduled batch workflows. No websocket streaming, frontend, distributed agent mesh, autonomous trading, or portfolio optimizer is required.

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
  readonly name: string;
  health(): Promise<ProviderHealth>;
  listMarkets(params: MarketQueryParams): Promise<MarketListResult>;
  getMarket(ticker: string): Promise<MarketContract>;
}
```

`listMarkets` returns a paging envelope, not a bare array:

```ts
interface MarketListResult {
  markets: MarketContract[];
  nextCursor?: string;
}
```

`MarketContract` is the normalized market entity. It carries a `provider` field and a
`raw: unknown` escape hatch holding the untouched upstream payload, which is what makes the
snapshot store reproducible. See `services/providers/market.ts` for the full shape.

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
  readonly name: string;
  health(): Promise<ProviderHealth>;
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

Scores settled forecasts using Brier score, calibration buckets, and realized EV where applicable.

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
- Adding trade execution.
- Adding frontend/user accounts.
- Changing scoring formulas.
- Changing recommendation thresholds.
- Introducing new infrastructure.
- Adopting a design-system resnapshot or an upstream design change.
- Adding a shared design-system package or HTML/PDF report rendering.