# 01 — Product Requirements Document

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft  
**Status:** Product specification

## Product Summary

Market Intelligence Engine is a scheduled research and probability-analysis platform. It pulls prediction markets, prioritizes research-worthy candidates, gathers evidence, estimates probabilities, compares those probabilities against market prices, computes expected value, generates reports, and tracks forecast calibration.

## Primary User

The primary MVP user is an independent analyst/operator who wants disciplined market research, not automated trade execution.

## User Jobs

1. See which markets are worth attention.
2. Understand the strongest evidence for and against each outcome.
3. Compare independent probability estimates against market prices.
4. Avoid low-quality or weakly researched trades.
5. Track whether the system is well calibrated over time.

## Core User Stories

### US-001 — Market ingestion

As an analyst, I want Kalshi markets pulled on schedule so that I have a fresh market universe to evaluate.

**Acceptance Criteria**

- Given the scheduled ingestion job runs, when Kalshi is reachable, then active markets are stored as timestamped snapshots.
- The system stores enough market metadata to recreate the market state used for analysis.
- Failed ingestion produces an error record and does not corrupt previous snapshots.

### US-002 — Market prioritization

As an analyst, I want the system to rank markets so that research cost is spent only on viable opportunities.

**Acceptance Criteria**

- Markets are filtered by status, time to close, spread, volume/open interest where available, and category fit.
- The output is a bounded research queue.
- Ranking logic is deterministic and versioned.

### US-003 — Research dossier

As an analyst, I want every researched market to have a structured evidence package so that recommendations are not free-form guesses.

**Acceptance Criteria**

- Evidence includes facts, supporting evidence, contradicting evidence, unknowns, and source links.
- The research provider response is stored.
- The normalized evidence object is stored separately from raw provider output.

### US-004 — Probability estimate

As an analyst, I want the system to estimate probability from evidence so that I can compare it to market-implied probability.

**Acceptance Criteria**

- The probability engine receives evidence and market question context.
- Output includes probability, confidence, assumptions, counterarguments, and invalidation conditions.
- Output conforms to a schema.

### US-005 — Expected value analysis

As an analyst, I want expected value calculated for each candidate so that price and probability are compared explicitly.

**Acceptance Criteria**

- Market-implied probability is derived from price.
- Edge is calculated as estimated probability minus market probability.
- Expected value is calculated using configured formulas.
- Recommendation is derived by rules, not ad hoc language.

### US-006 — Reporting

As an analyst, I want a concise daily report so that I can review opportunities quickly.

**Acceptance Criteria**

- Report includes top opportunities, pass/watch reasons, evidence summaries, probability estimates, edge, EV, confidence, and risks.
- Report is stored in `reports/` or the configured delivery target.
- Report distinguishes facts, assumptions, inference, speculation, and opinion.

### US-007 — Calibration

As an analyst, I want settled predictions scored so that the system improves from outcomes.

**Acceptance Criteria**

- Settled markets are matched to predictions.
- Brier score and basic calibration metrics are calculated.
- Weekly calibration summary identifies failure modes and lessons.

## Functional Requirements

| ID | Requirement |
|---|---|
| FR-001 | Pull Kalshi markets via provider interface. |
| FR-002 | Store market snapshots in Supabase. |
| FR-003 | Rank markets into research queue. |
| FR-004 | Query Perplexity for evidence packages. |
| FR-005 | Normalize evidence into structured schema. |
| FR-006 | Generate probability estimates with an LLM. |
| FR-007 | Calculate market probability, edge, and expected value. |
| FR-008 | Generate daily research report. |
| FR-009 | Store prediction ledger entries. |
| FR-010 | Track outcomes and calibration metrics. |

## Non-Functional Requirements

| Category | Requirement |
|---|---|
| Reproducibility | Every recommendation must be reproducible from stored inputs. |
| Observability | Every scheduled job must log success/failure and key counts. |
| Security | Secrets must be environment-managed and never committed. |
| Maintainability | Provider-specific code must be isolated behind interfaces. |
| Testability | Core scoring and parsing logic must have unit tests. |
| Reliability | Failed jobs must fail safely and preserve previous data. |

## MVP Constraints

- No trade execution.
- No user management.
- No frontend required.
- Scheduled batch jobs are sufficient.
- Perplexity is the only required research provider.
- Kalshi is the only required market provider.
- Supabase is the system of record.

## Product Risks

| Risk | Mitigation |
|---|---|
| Low-quality evidence | Require source quality scoring and counterevidence. |
| Hallucinated analysis | Force structured evidence and schema validation. |
| Overconfidence | Track calibration and confidence separately. |
| Scope creep | Enforce YAGNI and ADR gates. |
| API instability | Provider wrappers and retry policies. |

## MVP Done Criteria

MVP is done when a scheduled run can produce an auditable daily report from current Kalshi market data and later score those predictions against outcomes.