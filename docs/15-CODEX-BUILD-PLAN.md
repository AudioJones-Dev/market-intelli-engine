# 15 — Codex Build Plan

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft

## Codex Execution Rule

Do not ask Codex to build the entire project in one prompt.

Codex should execute small, reviewable milestones. Each milestone must satisfy Definition of Ready before implementation and Definition of Done before merge.

## Milestone Template

```md
# Milestone XX — Title

## Objective

## Scope

## Explicit Non-Goals

## Files to Create/Modify

## Dependencies

## Acceptance Criteria

## Tests

## Definition of Done

## Definition of Stable
```

## Phase 0 — Repository Foundation

### Milestone 01 — Repository structure

Create baseline folders:

- `docs/`
- `adr/`
- `database/migrations/`
- `prompts/`
- `services/`
- `workflows/`
- `reports/`
- `scripts/`
- `tests/`

Acceptance criteria:

- Structure exists.
- README references docs.
- No implementation logic yet.

### Milestone 02 — Tooling baseline

Add formatting, linting, testing framework, environment example, and ignore files.

### Milestone 03 — Supabase baseline migration

Create initial schema migration for core tables.

### Milestone 04 — Provider interfaces

Implement market, research, model, and delivery provider interfaces.

## Phase 1 — Ingestion

### Milestone 05 — Kalshi provider

Implement `KalshiProvider` for market listing and market detail retrieval.

### Milestone 06 — Market snapshot persistence

Store raw and normalized market snapshots.

### Milestone 07 — Ingestion workflow

Create scheduled/manual ingestion job with workflow run logging.

## Phase 2 — Ranking and Research

### Milestone 08 — Market ranking engine

Implement deterministic filtering and opportunity score.

### Milestone 09 — Research queue persistence

Store ranked market candidates.

### Milestone 10 — Perplexity provider

Implement research provider wrapper.

### Milestone 11 — Research dossier storage

Store raw and normalized research output.

### Milestone 12 — Evidence normalizer

Convert research output into canonical evidence schema.

## Phase 3 — Analysis

### Milestone 13 — Prompt registry

Implement prompt loading/versioning.

### Milestone 14 — Probability engine

Generate structured probability estimates.

### Milestone 15 — Counterargument stage

Generate opposing case and missing evidence summary.

### Milestone 16 — EV calculator

Calculate market probability, edge, and EV.

### Milestone 17 — Recommendation engine

Apply rule-based recommendation labels.

## Phase 4 — Reporting

### Milestone 18 — Daily report generator

Generate Markdown daily report.

### Milestone 19 — Prediction ledger

Persist immutable forecast records.

### Milestone 20 — Decision journal

Persist reasoning summary and retrospective placeholder.

## Phase 5 — Outcomes and Calibration

### Milestone 21 — Settlement lookup

Fetch/update settled market outcomes.

### Milestone 22 — Outcome persistence

Store settlement records.

### Milestone 23 — Calibration scoring

Calculate Brier score and buckets.

### Milestone 24 — Weekly calibration report

Generate weekly calibration report.

## Phase 6 — Operations

### Milestone 25 — Observability baseline

Add logs, workflow metrics, and status records.

### Milestone 26 — Error taxonomy

Standardize error classes and failure records.

### Milestone 27 — Deployment configuration

Add environment config and deployment instructions.

### Milestone 28 — Runbooks

Add runbooks for ingestion, research, reporting, and settlement failures.

## Phase 7 — Hardening

### Milestone 29 — Contract tests

Add provider contract tests.

### Milestone 30 — Prompt tests

Add prompt fixture tests for required schemas.

### Milestone 31 — Replay test harness

Run analysis against stored fixtures.

### Milestone 32 — Definition of Stable observation

Document first production observation window.

## Deferred Milestones

Do not implement until ADR approved:

- Frontend dashboard.
- Slack/email/Obsidian delivery beyond Markdown storage.
- Multi-provider markets.
- Additional research providers.
- Kelly sizing.
- Trade execution.

## Codex Prompt Seed

```text
You are implementing Market Intelligence Engine (MIE). Follow the repository specification exactly. Do not add speculative features. Do not implement trading. Before coding, verify the milestone satisfies Definition of Ready. After coding, verify acceptance criteria and tests. If the spec is ambiguous, stop and request clarification instead of inventing architecture.
```