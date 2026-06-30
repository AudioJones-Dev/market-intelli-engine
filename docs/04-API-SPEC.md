# 04 — API Specification

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft  
**Status:** Integration specification

## Integration Principles

1. External APIs must be wrapped behind provider interfaces.
2. Raw responses must be stored when they influence a recommendation.
3. Secrets must be environment-managed and never committed.
4. Retry policies must be explicit.
5. API failures must be observable and recoverable.

## Provider Interfaces

### Market Provider

```ts
interface MarketProvider {
  listMarkets(params: MarketQueryParams): Promise<Market[]>;
  getMarket(ticker: string): Promise<Market>;
}
```

### Research Provider

```ts
interface ResearchProvider {
  researchMarket(input: ResearchRequest): Promise<ResearchResult>;
}
```

### Model Provider

```ts
interface ModelProvider {
  generateStructuredOutput<T>(input: ModelRequest): Promise<T>;
}
```

### Delivery Provider

```ts
interface DeliveryProvider {
  deliverReport(report: Report): Promise<DeliveryResult>;
}
```

## Kalshi Provider

Purpose: market ingestion and settlement lookup.

MVP scope:

- List active markets.
- Fetch market details.
- Fetch settlement/outcome data if available through API.

Out of scope:

- Order placement.
- Portfolio balance.
- Trade execution.
- Private account actions.

Required normalized fields:

- ticker
- event_ticker
- title
- category
- status
- close_time
- yes_bid
- yes_ask
- last_price
- volume
- open_interest
- raw_json

Failure modes:

- API unavailable.
- Rate limited.
- Schema changed.
- Empty response.
- Partial data.

Retry policy:

- Retry transient 429/5xx responses with exponential backoff.
- Do not retry deterministic 4xx configuration errors.

## Perplexity Provider

Purpose: external research and source discovery.

MVP scope:

- Generate evidence dossiers for selected markets.
- Return source links where available.
- Separate facts, evidence for, evidence against, unknowns.

Required request context:

- Market title.
- Market ticker.
- Outcome condition.
- Expiration/settlement timing.
- Category.
- Settlement source if known.
- Research instructions.

Required output:

- Summary.
- Facts.
- Evidence for.
- Evidence against.
- Unknowns.
- Source URLs.
- Source quality assessment.

Failure modes:

- No useful sources.
- Contradictory sources.
- Provider timeout.
- Malformed response.
- Missing citations.

Retry policy:

- Retry timeouts and 5xx.
- Do not convert low-quality research into a recommendation.

## OpenAI/LLM Provider

Purpose: structured probability estimation, counterargument generation, report drafting.

Rules:

- No free-form unversioned calls.
- Prompt ID and version required.
- Output schema required.
- Model name stored.
- Temperature configured per prompt.
- Raw output stored.

MVP LLM tasks:

1. Normalize research evidence.
2. Estimate probability from evidence.
3. Generate counterargument.
4. Produce report sections.

## Supabase

Purpose: system of record.

Required use:

- Market snapshots.
- Research dossiers.
- Probability estimates.
- Recommendations.
- Prediction ledger.
- Decision journal.
- Outcomes.
- Calibration scores.
- Workflow runs.

Security:

- Service role key must only be used server-side.
- Client-side public access is out of scope for MVP.

## Slack / Email / Obsidian Delivery

MVP delivery target should be configurable. Markdown report generation is required; delivery integrations are optional until report storage works.

Recommended priority:

1. Markdown file output.
2. Email or Slack delivery.
3. Obsidian sync.

## Environment Variables

| Variable | Purpose |
|---|---|
| `KALSHI_API_BASE_URL` | Kalshi API base URL |
| `KALSHI_API_KEY` | Only if private endpoints are later required |
| `PERPLEXITY_API_KEY` | Research provider |
| `OPENAI_API_KEY` | Model provider |
| `SUPABASE_URL` | Database URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side DB access |
| `REPORT_DELIVERY_TARGET` | markdown/slack/email/obsidian |

## API Readiness Requirement

Any new API usage must document:

- Endpoint.
- Authentication.
- Rate limits.
- Request schema.
- Response schema.
- Failure modes.
- Retry policy.
- Timeout.
- Storage impact.
- ADR requirement if architectural.