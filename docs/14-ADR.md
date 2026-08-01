# 14 — Architecture Decision Records

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft

## ADR Purpose

Architecture Decision Records capture material decisions so the project can evolve without losing context.

## ADR Registry and Numbering

> **Known defect — reconciliation required.** This repository carries two ADR numbering spaces:
>
> 1. The inline "Initial Decisions" list below (ADR-0001 … ADR-0007).
> 2. The file registry under `adr/`, currently `0001-supabase-kalshi-perplexity-batch-mvp.md`.
>
> They collide at ADR-0001: the inline entry is "Use Supabase as system of record" while the
> file covers Supabase, Kalshi, Perplexity, batch, Markdown, and no-trading together — i.e. the
> file consolidates what the inline list splits across ADR-0001 … ADR-0006.
>
> New ADRs take the next number free in the inline list and are filed under `adr/`, so
> `adr/0008-mie-domain-boundary.md` is ADR-0008. Accepted ADRs are **not** renumbered here —
> renumbering an accepted decision breaks every reference to it. Reconciling the two spaces
> (most likely by superseding the inline list with files) is a human decision and should carry
> its own ADR.

## ADR Required When

- Database schema changes after baseline.
- Provider interfaces change.
- New market provider added.
- New research provider added.
- Scoring formula changes.
- Recommendation thresholds change.
- Production infrastructure changes.
- Security model changes.
- Trading capability proposed.
- MVP scope changes.
- Trade execution, brokerage integration, position sizing, or portfolio state is proposed
  (`adr/0008-mie-domain-boundary.md`).
- Any shared contract is extracted into a package
  (`docs/17-SHARED-CONTRACT-CANDIDATES.md`).
- A new decision-producing model or provider is introduced.
- A material scoring change is made to any of the four analytical layers
  (`docs/08-SCORING.md`).
- Shared runtime infrastructure is introduced across systems.
- A security boundary changes (`docs/10-SECURITY.md`).

## ADR Template

```md
# ADR-0000 — Title

## Status

Proposed | Accepted | Superseded | Rejected

## Date

YYYY-MM-DD

## Context

What problem or decision needs resolution?

## Decision

What decision was made?

## Alternatives Considered

1. Option A
2. Option B
3. Option C

## Consequences

### Positive

- 

### Negative

- 

### Risks

- 

## YAGNI Review

- Does this solve an MVP requirement?
- Can this wait?
- Is this speculative?
- Can existing architecture solve this?

## Approval

Approved by:
```

## Initial Decisions

### ADR-0001 — Use Supabase as system of record

Status: Accepted.

Rationale: Supabase provides Postgres durability, SQL queries, easy API access, and enough scheduling support for MVP.

### ADR-0002 — Use Kalshi as first market provider only

Status: Accepted.

Rationale: Single provider reduces MVP complexity while provider abstraction preserves future extensibility.

### ADR-0003 — Use Perplexity as first research provider only

Status: Accepted.

Rationale: Perplexity satisfies live research needs for MVP. Other research providers are deferred.

### ADR-0004 — No automated trading in MVP

Status: Accepted.

Rationale: MIE is a research and decision-support system. Human approval remains mandatory.

### ADR-0005 — Scheduled batch workflows over streaming

Status: Accepted.

Rationale: Daily research reports do not require live market streaming. Batch is simpler and more observable.

### ADR-0006 — Markdown reports first

Status: Accepted.

Rationale: Markdown is auditable, easy to version, and sufficient for MVP report delivery.

### ADR-0007 — Inherit the Audio Jones / AJ Digital design system

Status: **Accepted** — ratified by the operator 2026-08-01 (decision D-4 in
`docs/design/DESIGN_SYSTEM_SNAPSHOT.md` §7).

Rationale: MIE is an AJ Digital product surface and should not carry an independent visual
identity. Adopting the canonical Editorial Intelligence Systems language now — as documentation
only — establishes the interface contract before any UI exists, so future work inherits rather
than invents. MVP scope is unchanged: no frontend, no new dependencies, no application code.

Consequences: MIE may not define its own colors, fonts, spacing, radii, or component
conventions. It may define domain semantics (`MIE_DESIGN_ADAPTATION.md`). Upstream design
changes require a governed resnapshot rather than automatic adoption.

### ADR-0008 — Market Intelligence Engine domain boundary

Status: **Proposed** — see [`adr/0008-mie-domain-boundary.md`](../adr/0008-mie-domain-boundary.md).

Rationale: converts the existing "no trading" scope statement into an architectural boundary
with enumerated prohibitions and enforcement triggers. ADR-0004 states that MVP excludes
automated trading; it does not enumerate the adjacent capabilities — position sizing, portfolio
state, paper execution — that would arrive one at a time without ever presenting as "adding
trading."

### ADR-0009 — MIOS adoption scope and exclusions

Status: **Accepted** — ratified by the operator 2026-08-01 (decision D-10). See
[`adr/0009-mios-adoption-scope.md`](../adr/0009-mios-adoption-scope.md).

Rationale: MIE adopts MIOS layers 1–5 and 8. **Layers 6 (Position Construction & Risk Sizing)
and 7 (Execution as Signal Preservation) are excluded** — they are execution-domain functions
prohibited by ADR-0008. MIOS is adopted as method, not as evidence of return; it declares its own
integrated architecture untested. Closes decision D-6 by supplying the ACH procedure
(`docs/21-ACH-PROCEDURE.md`).

## Frontend ADR Gate

**No analyst interface may be implemented until a frontend ADR is approved.** This gate is
required by `docs/13-ROADMAP.md` (Phase 3) and `docs/15-CODEX-BUILD-PLAN.md` (Deferred
Milestones). Adopting a design system does **not** authorize building UI.

A frontend ADR must, at minimum, address:

1. **Evidence of value** — MVP has produced useful reports and calibration data over a
   measured period. Per `docs/13-ROADMAP.md`, Phase 2 does not begin until MVP proves
   operational value.
2. **The problem the UI solves** that Markdown reports demonstrably do not.
3. **Scope** — which of the deferred surfaces in `docs/13-ROADMAP.md` are in the first cut.
4. **Design-system consumption** — whether tokens are vendored, published as a shared package,
   or re-implemented from the snapshot. A shared design-system package is itself a separate
   decision requiring its own ADR.
5. **Resolution of upstream ambiguity** — radius and container-width decisions are unresolved
   upstream (`DESIGN_SYSTEM_SNAPSHOT.md` §5.3, decision D-7) and must be settled first.
6. **Accessibility plan** — how criteria A-1…A-12 (`MIE_DESIGN_ADAPTATION.md` §12.2) will be
   verified and enforced in CI.
7. **Visual-regression testing** — see `docs/15-CODEX-BUILD-PLAN.md`, Deferred Milestone F-04.
8. **Hosting, authentication, and security model** — `docs/10-SECURITY.md` notes that client
   access introduces requirements the MVP does not have. User accounts are a separate ADR.
9. **YAGNI review** and the promotion criteria in `docs/13-ROADMAP.md`.

An ADR is also required before adopting a **shared design-system package**, before any
**live data visualization**, and before any **public or multi-user surface**.