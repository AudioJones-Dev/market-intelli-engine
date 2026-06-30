# 16 — Governance Gates

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft

## Purpose

This document defines the governance gates that control work from idea through stable operation.

## Lifecycle

```text
Idea
  -> Problem Definition
  -> Definition of Ready
  -> ADR if required
  -> Implementation
  -> Definition of Done
  -> Deployment
  -> Definition of Stable
  -> Calibration Review
  -> Continuous Improvement
```

## Definition of Ready (DoR)

A work item is READY only when uncertainty has been reduced to an acceptable engineering level.

Required checklist:

- Problem defined.
- Business value stated.
- Success metric defined.
- Included scope defined.
- Excluded scope defined.
- Explicit non-goals listed.
- Acceptance criteria are objective and testable.
- Dependencies are known.
- Affected architecture components identified.
- API requirements documented.
- Data requirements documented.
- AI contract defined if AI is involved.
- Prompt contract defined if LLM call is involved.
- Security review completed if applicable.
- Observability requirements defined.
- Testing strategy identified.
- Rollback strategy documented.
- Documentation updates identified.
- Risks and assumptions documented.
- YAGNI review passed.
- ADR complete if required.
- Human approval complete if required.

If any required item is missing, the task returns to refinement.

## AI-Specific Ready Requirements

Before any AI agent begins work, it must know:

- Objective.
- Inputs.
- Outputs.
- Constraints.
- Expected schema.
- Acceptance criteria.
- Failure behavior.
- Retry policy.
- Logging requirements.

If any are missing, the AI must stop rather than inventing behavior.

## Definition of Done (DoD)

A work item is DONE only when:

- Acceptance criteria are satisfied.
- Required tests pass.
- Documentation is updated.
- Logs/metrics are implemented where required.
- Errors are handled safely.
- Secrets are not exposed.
- ADR is added if architecture changed.
- YAGNI review still passes.
- Code is reviewed.
- No known critical defect remains.

## Definition of Stable (DoS)

A deployed feature is STABLE only after:

- It has run successfully for the defined observation window.
- No critical defects have been identified.
- Performance targets have been met.
- Logs and metrics confirm expected behavior.
- Documentation matches implementation.
- Any incident or defect has a retrospective.

Default observation window: 7 days for scheduled production workflows unless otherwise specified.

## Human Approval Matrix

Human approval is required for:

- Production deployment.
- Database migration.
- Prompt behavior changes.
- Recommendation threshold changes.
- New provider.
- Security/secrets changes.
- Any trading-related capability.

## Engineering Decision Hierarchy

Resolve decisions in this order:

1. Safety.
2. Truthfulness/evidence quality.
3. Architecture.
4. Simplicity.
5. Performance.
6. Developer experience.
7. Convenience.

## Final Rule

> Implementation begins only after uncertainty has been reduced to an acceptable engineering level—not after enthusiasm has been expressed.