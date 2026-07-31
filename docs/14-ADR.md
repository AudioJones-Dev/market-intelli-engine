# 14 — Architecture Decision Records

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft

## ADR Purpose

Architecture Decision Records capture material decisions so the project can evolve without losing context.

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

Status: **Proposed** — requires operator ratification (decision D-4 in
`docs/design/DESIGN_SYSTEM_SNAPSHOT.md` §7).

Rationale: MIE is an AJ Digital product surface and should not carry an independent visual
identity. Adopting the canonical Editorial Intelligence Systems language now — as documentation
only — establishes the interface contract before any UI exists, so future work inherits rather
than invents. MVP scope is unchanged: no frontend, no new dependencies, no application code.

Consequences: MIE may not define its own colors, fonts, spacing, radii, or component
conventions. It may define domain semantics (`MIE_DESIGN_ADAPTATION.md`). Upstream design
changes require a governed resnapshot rather than automatic adoption.

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