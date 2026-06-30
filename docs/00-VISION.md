# 00 — Vision

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft  
**Status:** Canonical foundation document

## North Star

Produce transparent, evidence-backed probability estimates whose calibration improves over time.

MIE is not designed to be an automated trading bot. It is an evidence intelligence platform that converts market questions into structured research, probability estimates, expected-value comparisons, and measurable calibration feedback.

## Opening Principle

> Every prediction is a hypothesis. Every outcome is feedback. Every feedback loop improves the system.

## Problem Statement

Prediction markets expose useful probability signals, but retail and independent analysts often lack a disciplined system for:

- Collecting relevant evidence.
- Separating facts, assumptions, inference, speculation, and opinion.
- Estimating independent probabilities.
- Comparing those estimates to market-implied probabilities.
- Tracking whether forecasts were well calibrated.
- Learning from wrong predictions.

MIE solves this by creating an auditable research and calibration loop around market forecasting.

## Mission

Create a reproducible market research engine that ingests prediction markets, gathers evidence, estimates probabilities, calculates expected value, generates transparent reports, and learns from outcomes.

## Product Philosophy

MIE optimizes for:

1. Evidence quality.
2. Reproducibility.
3. Explainability.
4. Calibration.
5. Engineering discipline.

MIE does not optimize for excitement, narrative conviction, or one-off wins.

## Constitution

1. **Truth over prediction** — The system exists to estimate probabilities from evidence, not to be right by narrative force.
2. **Evidence before reasoning** — No recommendation without an evidence package.
3. **Reasoning must be auditable** — Every recommendation must be reproducible from stored inputs.
4. **Every prediction is measured** — No forecast disappears after publication.
5. **YAGNI is mandatory** — If a feature does not improve MVP research quality, it waits.
6. **Human approval required** — The system never executes trades.
7. **Everything is versioned** — Prompts, models, schemas, calculations, reports, and decisions.
8. **Calibration beats confidence** — Forecast quality is measured empirically.
9. **Provider agnostic** — Kalshi is the first market provider, not the permanent boundary.
10. **No black boxes** — Every output must explain evidence, counterevidence, unknowns, confidence, and expected value.

## MVP Definition

The MVP is complete only when MIE can:

1. Ingest Kalshi markets.
2. Filter and prioritize research-worthy markets.
3. Perform automated evidence gathering.
4. Estimate probabilities from evidence.
5. Compare estimated probabilities to market-implied probabilities.
6. Compute expected value.
7. Generate a human-readable research report.
8. Record predictions.
9. Track settlement outcomes.
10. Produce calibration metrics.

## Explicit Non-Goals

The MVP excludes:

- Automated trading.
- Portfolio optimization.
- Kelly sizing.
- Multi-provider prediction markets.
- Live websocket market updates.
- Mobile app.
- Custom frontend.
- User accounts.
- Team collaboration.
- Real-time alerting beyond scheduled reports.
- Reinforcement learning.
- Fine-tuned forecasting models.

## Success Metrics

| Area | MVP Success Metric |
|---|---|
| Ingestion | Daily market snapshot completes successfully |
| Research | Top-ranked markets receive structured evidence packages |
| Analysis | Each researched market receives probability, confidence, EV, and recommendation |
| Reporting | Daily report is generated and stored |
| Auditability | Every recommendation can be traced to evidence and prompt version |
| Calibration | Settled predictions produce Brier score and calibration review |

## Strategic Long-Term Vision

MIE begins with Kalshi, Perplexity, OpenAI, and Supabase. Long term, the same evidence-to-probability engine can support forecasting across prediction markets, macroeconomic releases, weather events, corporate events, supply-chain risks, and operational business decisions.

The durable asset is not a trading script. The durable asset is a measured decision-support system.