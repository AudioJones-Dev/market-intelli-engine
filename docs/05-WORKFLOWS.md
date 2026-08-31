# 05 — Workflows

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft

## Workflow Principles

1. Workflows are orchestrated by scheduler/queue, not direct agent-to-agent calls.
2. Every workflow writes a `workflow_runs` record.
3. Every workflow must be restartable or safely fail.
4. Partial failures must be visible.
5. Reports may include partial results only when labeled clearly.

## Daily Morning Workflow

Target time: 6:00 AM ET.

```text
1. Start workflow_runs record.
2. Ingest active Kalshi markets.
3. Store raw and normalized snapshots.
4. Filter and rank markets.
5. Create research queue.
6. Run research for selected markets.
7. Normalize evidence.
8. Estimate probabilities.
9. Calculate EV and recommendations.
10. Generate daily report.
11. Store prediction ledger entries.
12. Mark workflow complete.
```

## Midday Refresh Workflow

Target time: 12:00 PM ET.

Purpose: detect meaningful market movement after morning report.

MVP behavior:

- Re-ingest market prices.
- Compare against morning snapshot.
- Flag markets with significant price change.
- Do not rerun full research unless configured.

## Evening Expiration Workflow

Target time: 4:30 PM ET.

Purpose: identify markets near expiration and update status.

MVP behavior:

- Pull latest market snapshots.
- Flag expiring markets.
- Update report/watch list.

## Settlement Workflow

Purpose: match settled markets to prediction ledger entries.

```text
1. Find unresolved ledger entries with elapsed close/settlement window.
2. Query provider or configured settlement source.
3. Store outcome.
4. Score forecast.
5. Update decision journal with retrospective placeholder.
```

## Weekly Calibration Workflow

Target: Sunday evening.

Outputs:

- Number of predictions.
- Number settled.
- Brier score.
- Calibration by bucket.
- Best performing categories.
- Worst performing categories.
- Repeated failure modes.
- Prompt/model changes recommended.

## Decision Manifest Generation

Every workflow that produces a recommendation must emit a decision manifest as part of the same
run (`docs/18-DECISION-REPRODUCIBILITY.md`).

- The manifest is written **before** the recommendation is considered complete. A recommendation
  without a manifest is an incomplete record, not a fast path.
- Manifest assembly failure degrades the market to `partial` and suppresses the recommendation.
  It does not emit an unmanifested recommendation.
- No manifest field may contain `latest`, `current`, or `production`.

## Promotion Review Workflow

Cadence: on demand, human-initiated.

```text
1. Collect shadow-run outputs for the candidate component.
2. Compare against the current approved component over the same inputs.
3. Assemble the promotion evidence package (docs/19 § Minimum Promotion Evidence).
4. Record sample size and any sample-size limitation.
5. Present for human decision.
6. Record the promotion record, including rollback target.
7. Activate at the recorded effective timestamp.
```

An agent may run every step except 5 and 6. **No agent may approve a change it proposed.**

## Suspension Workflow

May be triggered automatically or manually
(`docs/19-PROMOTION-AND-RETIREMENT-POLICY.md` § Automatic Suspension Conditions).

```text
1. Detect the suspension condition.
2. Set the component lifecycle state to `suspended`.
3. Fail closed — affected stages produce no output.
4. Mark affected workflow runs `partial` and label affected values inline.
5. Record the suspension with reason and timestamp.
6. Alert.
```

**Fail closed means no recommendation, not a fallback recommendation.** Silently substituting a
previous component version would produce output whose manifest does not match what ran.

## Historical Replay Workflow

> **Deferred** — Milestone 31 (`docs/15-CODEX-BUILD-PLAN.md`). Specified now so the manifest is
> designed to support it; provenance cannot be retrofitted.

```text
1. Load historical immutable inputs by decision manifest ID.
2. Re-run selected stages against those inputs.
3. Write the replayed output to separate storage.
4. Compare historical output against replayed output.
5. Record divergence as a finding.
```

Replay **never overwrites the original recommendation**. Divergence is itself a result — it
means an input was less immutable than the manifest claimed.

## Component Gating

Before any decision-producing stage executes, the workflow must verify the component's lifecycle
state:

| State | Behavior |
|---|---|
| `approved` | Runs; output is official |
| `shadow` | Runs; output written to separate storage; never reaches a report |
| `experimental` | Does not run in production workflows |
| `reviewed` | Does not run in production workflows |
| `suspended` | Does not run; stage fails closed |
| `retired` | Does not run |

An unrecognized or unversioned component is treated as `suspended`.

## Failure Recovery Workflow

Failure records must include:

- Workflow name.
- Stage.
- Input parameters.
- Error message.
- Stack trace if available.
- Whether retry is safe.
- Suggested remediation.

## Workflow Status Values

- `queued`
- `running`
- `succeeded`
- `partial`
- `failed`
- `cancelled`

## Minimum Observability

Each workflow logs:

- Start time.
- End time.
- Records read.
- Records written.
- External API calls.
- Failures.
- Skipped records.

## MVP Schedule

| Workflow | Cadence | Required MVP? |
|---|---:|---|
| Daily Morning Research | Daily | Yes |
| Settlement | Daily | Yes |
| Weekly Calibration | Weekly | Yes |
| Midday Refresh | Daily | Optional MVP |
| Evening Expiration | Daily | Optional MVP |
| Promotion Review | On demand | Yes — human-initiated |
| Suspension | Event-driven | Yes |
| Historical Replay | On demand | Deferred |

## Human Review

The system produces recommendations only. Human approval is required before any trade or capital allocation action.