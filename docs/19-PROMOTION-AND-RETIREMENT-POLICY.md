# 19 — Promotion and Retirement Policy

**Project:** Market Intelligence Engine (MIE)
**Version:** 0.1 specification draft

## Purpose

Define the lifecycle for decision-producing MIE components — how prompts, agents, ranking
methods, forecasting policies, scoring formulas, providers, and thresholds move from
experimentation into approved operation, and back out again.

Two rules sit above the rest:

> **No agent may promote its own proposed change.**
> **No single favorable outcome is sufficient evidence for promotion.**

The second exists because MIE forecasts probabilities. A component that produced a correct call
on a `0.62` forecast has produced one sample from a distribution, not evidence of improvement.
Promoting on outcome rather than on calibration is the specific failure mode this policy
prevents — and it is the same distinction `docs/design/ANALYST_REPORT_STANDARD.md` §12 draws
between a process error and a reasonable probabilistic miss.

This policy applies to:

prompts · agents · model configurations · market-ranking rules · evidence-quality rules ·
probability methods · scoring formulas · recommendation thresholds · source providers ·
calibration methods.

## Lifecycle States

```text
experimental
    ↓
shadow
    ↓
reviewed
    ↓
approved
    ↓
suspended
    ↓
retired
```

A component may also move **backward** when evidence weakens. The arrows are the common path,
not a ratchet.

### Experimental

The component is under development.

- May run in local or isolated test environments.
- May use historical or synthetic inputs.
- **May not affect production recommendations.**
- Outputs must be labeled experimental.
- No operator reliance is assumed.

### Shadow

The component runs against production-like inputs but does not affect official outputs.

- Outputs are recorded separately.
- Results are compared with the approved component.
- No production recommendation is changed.
- No human-review queue is altered.
- Shadow performance must be measurable.

> Shadow outputs must never reach a report. If a shadow result appears in analyst-facing output,
> it has affected the decision loop regardless of which table it was written to.

### Reviewed

The component has completed its required evaluation and is awaiting a human decision.

Required evidence should include: test results · replay results where available · comparison
against the current approved component · calibration implications · failure-mode analysis ·
security implications · rollback procedure · **sample-size limitations**.

> Sample size is called out explicitly because calibration evidence over a handful of settled
> markets is not evidence. `docs/design/ANALYST_REPORT_STANDARD.md` §11 already requires
> low-`n` calibration buckets to be excluded from trend claims; the same threshold governs
> promotion.

### Approved

The component may influence official MIE outputs.

Approval requires: designated human approver · recorded approval decision · approved version
identifier · activation timestamp · **rollback target** · observability coverage · acceptance
criteria satisfied.

### Suspended

The component is temporarily prohibited from influencing official outputs.

Triggers may include: schema incompatibility · provider outage · unacceptable evidence quality ·
calibration deterioration · abnormal recommendation behavior · unresolved security concern ·
unexplained output drift · failure to meet observability requirements.

**A suspended component must fail closed.** Producing no recommendation is always acceptable;
producing an ungoverned one is not. This is consistent with `docs/02-ARCHITECTURE.md`'s failure
philosophy — a stage failure degrades the run to `partial`, and partial results are labeled
(`docs/05-WORKFLOWS.md`).

### Retired

The component is permanently removed from active use.

Historical references and artifacts **must remain available** for reproducibility
(`docs/18-DECISION-REPRODUCIBILITY.md`). Retirement removes a component from future use; it
never removes it from the record of past decisions.

Retirement must record: reason · replacement where applicable · effective date · affected
versions · migration notes · historical decision references.

## Promotion Authority

Agents **may**:

- identify weaknesses;
- propose experiments;
- generate retrospective findings;
- recommend changes.

Agents **may not**:

- approve their own prompt changes;
- modify production thresholds;
- activate new models;
- promote experimental strategies;
- deploy scoring-policy changes;
- remove human approval requirements.

Promotion requires a human decision recorded in the governance ledger.

The separation matters most where it is least visible: the calibration agent
(`docs/06-AGENTS.md` Agent 9) exists to recommend prompt and model changes, and is therefore the
component most likely to propose changes to itself. Its output is evidence for a human decision,
never the decision.

## Minimum Promotion Evidence

Promotion from `shadow` to `reviewed` requires:

1. Defined hypothesis.
2. Defined success metrics.
3. Defined guardrail metrics.
4. Sufficient evaluation sample, or an explicit sample-size limitation.
5. Comparison with the current approved method.
6. Known failure modes.
7. Replay or backtest where applicable.
8. Calibration-impact assessment.
9. Operational-cost assessment.
10. Rollback plan.

Guardrail metrics are distinct from success metrics: a change may improve its target metric
while degrading recommendation volume, cost, or evidence quality. Both must be stated in
advance, so that a post-hoc favorable reading of an unstated metric cannot justify promotion.

## Promotion Criteria by Component Type

### Prompt or Agent Change

schema adherence · evidence completeness · contradiction coverage · hallucination or
unsupported-claim rate · probability calibration · output stability · cost and latency ·
failure rate.

### Ranking-Rule Change

research yield · percentage of selected markets producing usable dossiers · category
concentration · liquidity quality · expiration suitability · missed-opportunity analysis.

### Probability-Method Change

Brier score · calibration by bucket · largest misses · category stability · confidence
calibration · overconfidence frequency · underconfidence frequency.

> Evaluated against a stated baseline. A Brier score with no reference point is uninterpretable
> (`docs/design/DATA_VISUALIZATION_STANDARD.md` §10).

### Recommendation-Threshold Change

recommendation volume · positive-EV precision · false-positive rate · evidence-grade
distribution · liquidity and settlement-risk distribution · **sensitivity to small probability
changes**.

> Threshold changes are the cheapest way to manufacture apparent improvement — loosening a
> threshold raises candidate volume immediately and degrades precision slowly. Volume is a
> guardrail metric here, never a success metric.

### Provider Change

source quality · availability · latency · schema stability · provenance quality · rate limits ·
cost · coverage · contradiction handling · security review.

## Automatic Suspension Conditions

A production component should be automatically or manually suspended when:

- required schemas fail repeatedly;
- source provenance is missing;
- settlement rules cannot be interpreted;
- market data is stale beyond policy;
- recommendation volume exceeds expected bounds;
- evidence-quality scores collapse;
- a provider produces unexplained structural drift;
- a critical security issue is identified;
- calibration degrades beyond an approved threshold;
- reproducibility requirements cannot be satisfied.

## Change Control

Every approved change requires: new explicit version · ADR when architecturally material ·
changelog entry · activation date · previous-version reference · migration or compatibility
note · rollback procedure.

## Historical Integrity

Promotion, suspension, and retirement **must not alter historical decisions**.

Historical records retain:

- the component version originally used;
- the policy active at decision time;
- the original output;
- the original human disposition.

Retroactively re-scoring past decisions under a new policy would destroy the calibration record,
which is the system's only evidence that it is improving.

## Governance Record

```json
{
  "promotion_record_id": "uuid",
  "component_type": "probability_prompt",
  "component_id": "probability-estimation",
  "component_version": "v4",
  "previous_state": "shadow",
  "new_state": "approved",
  "evidence_package_id": "uuid",
  "approved_by": "human-operator-id",
  "approval_notes": "Approved after replay and shadow comparison.",
  "rollback_version": "v3",
  "effective_at": "timestamp"
}
```

## Acceptance Criteria

- Every production decision component has a lifecycle state.
- Experimental components cannot influence official reports.
- Shadow outputs are stored separately.
- Promotion requires recorded human approval.
- Agents cannot promote themselves.
- Approved components have rollback targets.
- Suspended components fail closed.
- Retired versions remain historically traceable.
