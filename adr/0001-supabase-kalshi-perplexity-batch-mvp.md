# ADR-0001 — Supabase, Kalshi, Perplexity, and Batch MVP

## Status

Accepted

## Date

2026-06-30

## Context

MIE requires a disciplined MVP architecture for evidence-backed prediction-market research. The project must avoid speculative complexity while preserving future extensibility.

## Decision

For MVP:

- Use Supabase Postgres as the system of record.
- Use Kalshi as the only market provider.
- Use Perplexity as the only research provider.
- Use scheduled batch workflows instead of live websocket streaming.
- Generate Markdown reports first.
- Exclude automated trading.

## Alternatives Considered

1. Google Sheets or Airtable as primary database.
2. Multi-provider market ingestion from day one.
3. Live streaming market updates.
4. Custom dashboard before report generation.
5. Automated trade execution.

## Consequences

### Positive

- Simpler MVP.
- More auditable pipeline.
- Lower operational complexity.
- Clear provider abstraction without multi-provider build.

### Negative

- No real-time market reaction in MVP.
- No multi-market-provider comparison in MVP.
- Report-first UX may be less polished than dashboard.

### Risks

- Kalshi API changes may break ingestion.
- Perplexity research quality may vary by category.
- Batch cadence may miss fast-moving opportunities.

## YAGNI Review

This decision satisfies MVP needs and avoids speculative features. Future providers, dashboards, and trading functionality require separate ADRs.

## Approval

Approved as bootstrap architecture.