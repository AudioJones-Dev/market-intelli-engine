# 13 — Roadmap

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft

## Roadmap Principle

Do not build Phase 2 until MVP proves operational value through calibration, reproducibility, and report usefulness.

## Phase 0 — Specification

Deliverables:

- Vision.
- PRD.
- Architecture.
- Data model.
- API specs.
- Workflows.
- Agents.
- Prompts.
- Scoring.
- Calibration.
- Security.
- Observability.
- Deployment.
- ADR template.
- Codex build plan.

## Phase 1 — MVP Build

Capabilities:

1. Repository bootstrap.
2. Supabase schema.
3. Kalshi ingestion provider.
4. Market ranking.
5. Perplexity research provider.
6. Evidence normalization.
7. Probability estimation.
8. EV calculation.
9. Markdown daily report.
10. Prediction ledger.
11. Settlement/outcome tracking.
12. Weekly calibration report.

## Phase 2 — Operational Hardening

Only after MVP is running:

- Better retry queues.
- Richer runbooks.
- Additional report destinations.
- Improved source quality scoring.
- Prompt evaluation harness.
- Historical replay tests.

## Phase 3 — Product Expansion

Requires ADR and evidence of value:

- Frontend dashboard.
- Multi-provider market ingestion.
- Advanced alerting.
- Category-specific forecasting adapters.
- Automated research backfills.

## Explicitly Deferred

- Automated trading.
- Kelly sizing.
- Portfolio optimizer.
- User accounts.
- Mobile app.
- Reinforcement learning.
- Fine-tuned forecasting models.

## Promotion Criteria

A feature may move from future roadmap to active scope only if:

- It supports the North Star.
- It improves measured forecast quality, reproducibility, or operational reliability.
- It satisfies Definition of Ready.
- It passes YAGNI review.
- Required ADR is approved.