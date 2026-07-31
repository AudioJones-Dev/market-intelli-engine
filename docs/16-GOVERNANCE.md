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

## Design Governance

MIE inherits the canonical Audio Jones / AJ Digital **Editorial Intelligence Systems** design
language. MIE does not own a visual identity and may not create one.

Binding documents:

- `docs/design/DESIGN_SYSTEM_SNAPSHOT.md` — controlled read-only snapshot; records the canonical
  source repository, path, and commit.
- `docs/design/MIE_DESIGN_ADAPTATION.md` — domain semantics.
- `docs/design/DATA_VISUALIZATION_STANDARD.md` — chart rules.
- `docs/design/ANALYST_REPORT_STANDARD.md` — report structure. **Binding for the MVP.**

### Precedence

1. Canonical implementation (`audiojones.com` `src/app/globals.css`).
2. Canonical document (`audiojones.com` `docs/design/DESIGN.md`).
3. `DESIGN_SYSTEM_SNAPSHOT.md`.
4. MIE adaptation documents — may assign meaning to a token, never change its value.

### Prohibited without approval

The following are defects, not style preferences, and block Definition of Done:

- Introducing a color, font, spacing step, radius, or motion curve not in the snapshot.
- Using a raw hex value in place of a semantic token.
- Re-mapping a semantic alias to a different raw value.
- Editing token values in the snapshot (it is read-only; use the resnapshot process).
- Inventing a MIE-local component convention that diverges from the canonical component rules.
- Mapping YES to green and NO to red, or any outcome-directional color coding.
- Adopting an upstream design change without a resnapshot and human approval.

If a required value does not exist upstream, that is an **upstream request**, not a local
addition. Open the request; do not work around it.

### Upstream changes are proposals, not instructions

Canonical upstream changes are **not** automatically adopted. Each requires review against the
resnapshot process (`DESIGN_SYSTEM_SNAPSHOT.md` §4), including a contrast re-verification, and
human approval. MIE may deliberately lag canonical; lagging with a recorded commit SHA is a
governed state, drifting without one is not.

### Accessibility acceptance criteria

Criteria A-1 through A-12 in `MIE_DESIGN_ADAPTATION.md` §12.2 are acceptance criteria, not
guidelines. They apply to any rendered output — future UI, HTML/PDF reports, and generated chart
images. Work that produces rendered output is not DONE until they pass.

Contrast claims inherited from upstream documentation are **not accepted on trust**. Any newly
adopted or changed color must be measured. This rule exists because a documented canonical token
value (`--text-muted: #666666`) was found to fail WCAG AA on every MIE surface; see
`DESIGN_SYSTEM_SNAPSHOT.md` §5.1.

## Human Approval Matrix

Human approval is required for:

- Production deployment.
- Database migration.
- Prompt behavior changes.
- Recommendation threshold changes.
- New provider.
- Security/secrets changes.
- Any trading-related capability.
- Design-system resnapshot or adoption of an upstream design change.
- Any change to MIE semantic color mapping or report structure.
- Any frontend work (see the frontend ADR gate in `docs/14-ADR.md`).

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