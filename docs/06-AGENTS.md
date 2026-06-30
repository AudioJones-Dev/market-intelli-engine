# 06 — Agents

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft

## Agent Principle

Agents do not call each other directly. Workflow orchestration passes structured inputs between stages. This prevents agent spaghetti and keeps execution observable, retryable, and testable.

## Agent Contract Standard

Every agent must define:

- Purpose.
- Inputs.
- Outputs.
- Prompt ID/version if LLM-based.
- Response schema.
- Failure modes.
- Retry policy.
- Acceptance criteria.

## Agent 1 — Market Scanner

Purpose: retrieve and normalize market data.

Inputs:

- Provider name.
- Market filters.
- Run ID.

Outputs:

- Raw market snapshots.
- Normalized market records.
- Ingestion counts.

Failure modes:

- API unavailable.
- Provider schema change.
- Missing fields.

Acceptance criteria:

- Stores raw provider payload.
- Stores normalized market snapshot.
- Does not overwrite previous snapshots.

## Agent 2 — Market Ranker

Purpose: select research-worthy markets.

Inputs:

- Current market snapshots.
- Ranking configuration.

Outputs:

- Research queue.
- Opportunity score.
- Selection rationale.

Rules:

- Avoid closed markets.
- Avoid obviously illiquid markets unless explicitly configured.
- Avoid markets too close to expiration unless expiration scan.
- Bounded output list.

## Agent 3 — Research Agent

Purpose: gather evidence for selected markets through Perplexity.

Inputs:

- Market title.
- Ticker.
- Outcome condition.
- Expiration date.
- Category.
- Settlement source if known.

Outputs:

- Facts.
- Evidence for.
- Evidence against.
- Unknowns.
- Source URLs.
- Source quality notes.

Failure behavior:

- If research quality is low, mark dossier as insufficient.
- Do not fabricate evidence.

## Agent 4 — Evidence Normalizer

Purpose: convert raw research into canonical evidence schema.

Inputs:

- Raw research provider response.
- Market context.

Outputs:

- Structured evidence object.
- Research quality score.
- Contradiction flags.

## Agent 5 — Probability Agent

Purpose: estimate probability from structured evidence.

Inputs:

- Market question.
- Settlement rules.
- Structured evidence.
- Unknowns.

Outputs:

- Estimated probability.
- Confidence score.
- Assumptions.
- Counterarguments.
- Invalidation conditions.

Important: analysis should support a mode where market price is withheld until after probability estimation to reduce anchoring.

## Agent 6 — Counterargument Agent

Purpose: generate the strongest opposing case.

Inputs:

- Evidence package.
- Probability estimate.
- Initial recommendation.

Outputs:

- Strongest contrary interpretation.
- Evidence gaps.
- Failure modes.
- Conditions that would reverse the thesis.

## Agent 7 — Recommendation Agent

Purpose: combine probability, market price, EV, confidence, and research quality into a final label.

Outputs:

- `buy_candidate`
- `watch`
- `pass`
- `avoid`

Rules are defined in `08-SCORING.md`.

## Agent 8 — Report Agent

Purpose: generate reports from structured records.

Rules:

- Distinguish facts from assumptions and inference.
- Include counterarguments.
- Include unknowns.
- Include recommendation rationale.
- Never imply certainty.

## Agent 9 — Calibration Agent

Purpose: score settled predictions and produce calibration feedback.

Outputs:

- Brier score.
- Calibration bucket.
- Retrospective notes.
- Weekly summary.

## Universal Agent Stop Conditions

An agent must stop or mark output insufficient when:

- Required inputs are missing.
- Required schema cannot be satisfied.
- Evidence is insufficient.
- Source quality is unacceptable.
- Settlement condition is ambiguous.
- Required API failed after retries.

## Human Approval Matrix

Human approval is required for:

- New provider.
- Prompt contract change.
- Recommendation threshold change.
- Database migration.
- Deployment to production.
- Any trading-related capability.