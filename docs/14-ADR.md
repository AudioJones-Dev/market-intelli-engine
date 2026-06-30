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