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

### Governance and Reproducibility Metrics

| Metric | Purpose |
|---|---|
| active_component_versions | Which version of each decision component is live |
| shadow_run_count | Shadow evaluation volume |
| approved_run_count | Official run volume, for shadow-vs-approved comparison |
| shadow_approved_divergence_rate | How often shadow disagrees with approved — the core promotion signal |
| schema_validation_failure_count | Schema failures by component; a suspension trigger |
| evidence_quality_failure_count | Evidence-quality collapse; a suspension trigger |
| recommendation_volume | Drift detector — a threshold change shows here first |
| recommendation_volume_drift | Deviation from expected bounds; a suspension trigger |
| manifest_completeness_rate | Share of recommendations with a complete decision manifest |
| unresolved_version_reference_count | Manifests containing `latest`/`current`/`production` — must be zero |
| suspended_component_events | Suspensions, with reason |
| promotion_events | Promotions, with approver |
| rollback_events | Rollbacks, with target version |
| failed_closed_count | Stages that produced no output due to gating |

`manifest_completeness_rate` and `unresolved_version_reference_count` are the two metrics that
make reproducibility falsifiable rather than aspirational. A manifest that exists but references
a moving pointer satisfies the first and fails the second, which is why both are tracked.

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
- A recommendation is produced without a complete decision manifest.
- An unapproved or unversioned component is invoked in a production workflow.
- A component enters `suspended`.
- Recommendation volume exits expected bounds.

## Error Taxonomy

- `provider_unavailable`
- `rate_limited`
- `schema_validation_failed`
- `missing_required_input`
- `low_research_quality`
- `model_output_invalid`
- `database_write_failed`
- `report_generation_failed`
- `manifest_incomplete`
- `unversioned_component`
- `component_suspended`
- `unapproved_component_invoked`

## Runbooks

Each production workflow should eventually have a runbook documenting:

- Symptoms.
- Likely causes.
- Diagnostic queries.
- Manual recovery steps.
- Escalation path.

## Definition of Stable Tie-In

A feature is not stable until logs and metrics confirm expected behavior across the observation window.