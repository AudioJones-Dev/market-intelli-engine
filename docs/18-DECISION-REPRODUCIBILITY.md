# 18 — Decision Reproducibility

**Project:** Market Intelligence Engine (MIE)
**Version:** 0.1 specification draft

## Principle

Every material MIE recommendation must be reproducible from immutable or content-addressed
inputs.

The system must preserve what it knew, when it knew it, which rules it used, and which human
disposition followed.

`docs/01-PRD.md` already requires that "every recommendation must be reproducible from stored
inputs." This document defines what "stored inputs" must actually contain. **An immutable
recommendation with mutable inputs is not reproducible** — freezing the output while the prompt,
model, threshold, or source underneath it can still change preserves the conclusion and loses
the argument.

## Required Decision Manifest

Each recommendation must reference a decision manifest containing:

### Workflow Identity

workflow run ID · workflow name · workflow version · correlation ID · start timestamp ·
completion timestamp.

### Market Context

market ID · provider · provider market identifier · market snapshot ID · raw provider payload
reference · normalized snapshot schema version · retrieval timestamp · market close time ·
settlement-rules version or content hash.

> Settlement rules are hashed, not merely referenced. Providers can revise contract wording
> after listing; a recommendation built on the prior wording must remain traceable to it. This
> is also what makes a `[RULE AMBIGUITY]` finding
> (`docs/design/ANALYST_REPORT_STANDARD.md` §3.4) auditable after the fact.

### Evidence Context

evidence dossier ID · normalized evidence IDs · raw research response reference · source
provenance records · evidence schema version · evidence-normalization policy version · retrieval
timestamps · content hashes where practical.

### Agent and Model Context

agent ID · agent version · prompt ID · prompt version · system-prompt version · provider · model
identifier · model configuration · tool configuration · output schema version.

> Recorded **per invocation**, not per stage. A stage that retried, or that made several model
> calls, produces several agent-execution records.

### Forecast Context

forecast-method version · estimated probability · probability range · confidence score ·
research grade · assumptions · counterarguments · unknowns · invalidation conditions · **whether
market price was visible**.

> The price-visibility flag is required. `docs/02-ARCHITECTURE.md` §7 supports withholding price
> during estimation to reduce anchoring; whether that mode was active changes how much
> independent signal the forecast carries. It is surfaced in reports as the anchoring-control
> field (`docs/design/ANALYST_REPORT_STANDARD.md` §10).

### Economic Context

economic-scoring policy version · market-price mode · executable-side price · spread · liquidity ·
edge · expected value · applicable penalties · economic-risk flags.

### Recommendation Context

recommendation-policy version · recommendation threshold version · recommendation label ·
rationale · risk flags · generated timestamp.

### Human Context

human disposition · reviewer identity · review timestamp · review notes · conditions or override
reason · applicable approval-policy version.

## Version Identifier Policy

Versions must be explicit and stable.

Acceptable examples:

- `research-agent-v1.2.0`
- `probability-prompt-v3`
- `evidence-schema-v1`
- `economic-policy-v2`
- `recommendation-thresholds-2026-07`
- Git commit SHA
- immutable content hash

Labels such as `latest`, `current`, or `production` are **insufficient for historical
reconstruction**. They name a moving pointer, so the manifest records where the pointer was
aimed rather than what was used. A manifest containing `latest` is a manifest that will
silently become wrong.

## Mutation Policy

Historical decision manifests must not be updated when:

- a prompt changes;
- a model changes;
- a threshold changes;
- a source is refreshed;
- a market price changes;
- a recommendation policy changes.

New information creates a **new** snapshot, forecast, score, or recommendation. This extends the
existing append-only principle in `docs/03-DATA-MODEL.md` from the prediction ledger to every
decision-producing input.

## Replay Capability

The system should support a future replay mode that:

1. loads historical immutable inputs;
2. reruns selected processing stages;
3. records the new output separately;
4. compares the historical output with the replayed output;
5. **never overwrites the original recommendation**.

Replay is the test that reproducibility is real rather than asserted. Divergence between the
historical and replayed output is itself a finding — it means an input was not as immutable as
the manifest claimed. Deferred to Milestone 31 (`docs/15-CODEX-BUILD-PLAN.md`); the manifest
must be designed to support it from the start, because retrofitting provenance is not possible
after the fact.

## Minimum Reproducibility Test

Given a recommendation ID, an operator must be able to identify:

1. The market snapshot used.
2. The evidence used.
3. The sources used.
4. The prompt and agent versions used.
5. The model/provider used.
6. The probability method used.
7. The economic-scoring policy used.
8. The recommendation policy used.
9. The human disposition.
10. The final settlement and calibration record, when available.

This is testable and should be implemented as a governance test, not left as documentation.

## Manifest Example

```json
{
  "decision_manifest_id": "uuid",
  "recommendation_id": "uuid",
  "workflow_run_id": "uuid",
  "market_snapshot_id": "uuid",
  "evidence_dossier_id": "uuid",
  "agent_executions": [
    {
      "agent_id": "probability-agent",
      "agent_version": "1.0.0",
      "prompt_id": "probability-estimation",
      "prompt_version": "3",
      "provider": "provider-name",
      "model": "model-name"
    }
  ],
  "forecast_method_version": "probability-policy-v1",
  "economic_scoring_version": "economic-policy-v1",
  "recommendation_policy_version": "recommendation-policy-v1",
  "source_commit": "git-sha",
  "created_at": "timestamp"
}
```

## Current Gap Assessment

Measured against the shipped baseline schema
(`database/migrations/0001_initial_schema.sql`) — these are the deltas this document creates.
Each requires an ADR and a migration; see `docs/03-DATA-MODEL.md`.

| Requirement | Current state | Gap |
|---|---|---|
| Decision manifest | No table | **Missing entirely** |
| Agent execution record | No table | **Missing entirely** |
| Source provenance rows + content hash | Sources are `jsonb` in `research_dossiers` | Not addressable, not hashed |
| Addressable evidence items | Evidence is `jsonb` | No per-item IDs |
| Settlement-rules hash | Not captured | Missing |
| Price-visibility flag | Not captured | Missing |
| Workflow version, trigger, correlation ID | `workflow_runs` lacks them | Partial |
| Policy versions (economic, recommendation) | Not captured | Missing |
| Human disposition | No table | **Missing entirely** |

`prediction_ledger` already freezes market, evidence, and model state as JSON snapshots, which
covers part of the intent. The gap is that those snapshots are opaque blobs rather than
references to immutable, individually addressable records — sufficient to read, insufficient to
replay or to query across decisions.

## Acceptance Criteria

- Every recommendation has a decision manifest.
- No material input is referenced by `latest`.
- Historical inputs remain immutable.
- Market snapshots include timestamps.
- Prompt and model versions are preserved.
- Policy changes create new versions.
- Replay never overwrites historical decisions.
- Recommendation-to-settlement traceability is testable.
