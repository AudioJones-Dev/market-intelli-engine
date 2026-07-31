# 09 — Calibration

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft

## Purpose

Calibration determines whether MIE's probability estimates match observed outcomes over time.

The system should improve because forecasts are measured, not because outputs sound confident.

## Calibration Is Not Profitability

Calibration is **Layer 2** in `docs/08-SCORING.md`. It evaluates the forecast against the
outcome, and nothing else.

- Calibration requires only an immutable forecast and a verified settlement outcome. It requires
  **no price, no edge, no expected value, and no simulated position.**
- A well-calibrated forecast can identify an unattractive trade. A profitable trade can follow
  from a poorly calibrated forecast and luck. Scoring them together makes neither measurable.
- **Recommendation policy is evaluated separately** from probability calibration. "Were the
  probabilities right?" and "were the `buy_candidate` labels well chosen?" are different
  questions with different remedies — the first points at the probability method, the second at
  thresholds.

`realized_ev` in `calibration_scores` (`docs/03-DATA-MODEL.md`) is therefore an economic
diagnostic, not a calibration metric. It must never enter the Brier score, the bucket
assignment, or any promotion decision about a probability method.

## Attribution

Every calibration record must be attributable to the components that produced the forecast:

- prompt ID and version;
- agent ID and version;
- model provider and identifier;
- forecast-method version;
- evidence-normalization policy version.

Without attribution, calibration is descriptive — it says the system's forecasts drifted, but
not which change caused the drift, and so cannot support the promotion decisions in
`docs/19-PROMOTION-AND-RETIREMENT-POLICY.md`.

Historical calibration scores remain connected to their original decision manifests
(`docs/18-DECISION-REPRODUCIBILITY.md`) and are **never re-scored under a later policy**.
Retroactive re-scoring destroys the only evidence that the system is improving.

## Core Metrics

### Brier Score

For binary events:

```text
brier_score = (forecast_probability - outcome)^2
```

Where outcome is `1` if the event occurs and `0` otherwise.

Lower is better.

### Log Loss

Optional MVP+ metric. Use only when probabilities are clipped away from exactly 0 or 1.

### Calibration Buckets

Forecasts should be grouped into probability buckets:

- 0-10%
- 10-20%
- 20-30%
- 30-40%
- 40-50%
- 50-60%
- 60-70%
- 70-80%
- 80-90%
- 90-100%

For each bucket, compare average forecast probability to actual occurrence rate.

## Calibration Workflow

```text
1. Identify settled prediction ledger entries.
2. Fetch or confirm final outcome.
3. Store outcome.
4. Calculate Brier score.
5. Assign probability bucket.
6. Update calibration score table.
7. Generate weekly calibration summary.
```

## Weekly Calibration Report

Required sections:

- Total predictions.
- Settled predictions.
- Average Brier score.
- Calibration by bucket.
- Best categories.
- Weakest categories.
- Largest misses.
- Repeated evidence gaps.
- Prompt/model changes recommended.

## Decision Journal Retrospective

After settlement, each material forecast should answer:

1. What did we predict?
2. What happened?
3. What evidence mattered most?
4. What evidence was missing or overweighted?
5. Was the forecast wrong, or was it a reasonable probabilistic miss?
6. What should change in future research?

## Confidence Calibration

Confidence score should be evaluated separately from probability.

Example question:

> When the system says confidence is 80+, are those estimates actually more reliable than confidence 60-70?

## MVP Acceptance Criteria

- Every settled prediction has an outcome record.
- Every settled prediction has a Brier score.
- Weekly report summarizes calibration.
- Calibration output can be traced back to ledger and evidence.

## Deferred Metrics

- Category-specific model benchmarking.
- Probability recalibration curves.
- Realized vs expected EV simulation.
- Prompt-version A/B testing.
- Model tournament evaluation.