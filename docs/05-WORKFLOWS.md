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

## Human Review

The system produces recommendations only. Human approval is required before any trade or capital allocation action.