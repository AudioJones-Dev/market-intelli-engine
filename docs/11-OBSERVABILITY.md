# 11 — Observability

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft

## Principle

If a workflow cannot be monitored, it is not production-ready.

## Required Logging

Every workflow must log:

- Workflow run ID.
- Workflow name.
- Stage.
- Start time.
- End time.
- Status.
- Input count.
- Output count.
- Provider API count.
- Failure count.
- Error details when applicable.

## Metrics

MVP metrics:

| Metric | Purpose |
|---|---|
| markets_ingested_count | Verify ingestion volume |
| research_queue_count | Verify ranking output |
| research_success_count | Track research reliability |
| analysis_success_count | Track probability generation |
| report_generated_count | Verify report output |
| workflow_duration_seconds | Identify performance regressions |
| provider_error_count | Track external failures |
| calibration_scored_count | Verify outcome scoring |

## Health Checks

Minimum checks:

- Supabase reachable.
- Kalshi provider reachable.
- Perplexity provider reachable.
- OpenAI/model provider reachable.
- Last daily run status.
- Last report generated time.

## Alerts

MVP alert conditions:

- Daily ingestion fails.
- Report generation fails.
- External provider errors exceed threshold.
- No market snapshots created in 24 hours.
- Settlement workflow fails repeatedly.

## Error Taxonomy

- `provider_unavailable`
- `rate_limited`
- `schema_validation_failed`
- `missing_required_input`
- `low_research_quality`
- `model_output_invalid`
- `database_write_failed`
- `report_generation_failed`

## Runbooks

Each production workflow should eventually have a runbook documenting:

- Symptoms.
- Likely causes.
- Diagnostic queries.
- Manual recovery steps.
- Escalation path.

## Definition of Stable Tie-In

A feature is not stable until logs and metrics confirm expected behavior across the observation window.