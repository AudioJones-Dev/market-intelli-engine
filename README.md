# Market Intelligence Engine (MIE)

> **Build systems that improve because they are measured—not because they are trusted.**

Market Intelligence Engine is an evidence-first research and forecasting platform for prediction-market analysis. The MVP ingests Kalshi markets, prioritizes research-worthy opportunities, gathers external evidence, estimates probabilities, compares them to market-implied probabilities, calculates expected value, generates explainable reports, and tracks calibration over time.

## North Star

Produce transparent, evidence-backed probability estimates whose calibration improves over time.

## Project Motto

> Evidence is collected. Probabilities are estimated. Decisions are explained. Outcomes are measured. The system improves.

## MVP Scope

MIE v1 focuses on the minimum system required to produce auditable forecasts:

1. Ingest and snapshot Kalshi markets.
2. Filter and prioritize markets for research.
3. Collect structured evidence using Perplexity.
4. Estimate event probabilities from evidence.
5. Compare estimated probabilities to market-implied probabilities.
6. Calculate expected value.
7. Generate human-readable reports.
8. Record predictions in an immutable ledger.
9. Track settlement outcomes.
10. Measure calibration over time.

## Explicit Non-Goals

MVP does **not** include automated trading, portfolio optimization, Kelly sizing, multi-provider market ingestion, custom frontend, mobile app, user accounts, live websocket streaming, reinforcement learning, or fine-tuned forecasting models.

## Governance

This repository follows:

- YAGNI by default.
- Evidence before reasoning.
- Calibration over confidence.
- Reproducible recommendations.
- Human approval before trade execution.
- ADRs for architectural changes.
- Definition of Ready before implementation.
- Definition of Done before merge.
- Definition of Stable after deployment observation.

## Specification Index

The canonical specification lives in `docs/`:

- `docs/00-VISION.md`
- `docs/01-PRD.md`
- `docs/02-ARCHITECTURE.md`
- `docs/03-DATA-MODEL.md`
- `docs/04-API-SPEC.md`
- `docs/05-WORKFLOWS.md`
- `docs/06-AGENTS.md`
- `docs/07-PROMPTS.md`
- `docs/08-SCORING.md`
- `docs/09-CALIBRATION.md`
- `docs/10-SECURITY.md`
- `docs/11-OBSERVABILITY.md`
- `docs/12-DEPLOYMENT.md`
- `docs/13-ROADMAP.md`
- `docs/14-ADR.md`
- `docs/15-CODEX-BUILD-PLAN.md`

## Current Status

Status: Specification authoring.

Implementation should not begin until the relevant milestone satisfies the Definition of Ready.