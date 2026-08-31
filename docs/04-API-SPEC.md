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

The interfaces below are the shipped contracts in `services/providers/`, re-exported from the
`services/providers/index.ts` barrel.

Two conventions hold across all four:

- Every interface exposes `readonly name: string` and `health(): Promise<ProviderHealth>`.
- Every payload result type (`MarketContract`, `ResearchResult`, `ModelResult`, `DeliveryResult`)
  carries a `provider` field and a `raw` escape hatch preserving the untouched upstream payload,
  so any recommendation can be reproduced from stored data. `raw` is `unknown` and required
  everywhere except `DeliveryResult`, where it is optional.

Shared types live in `services/providers/types.ts`: `ProviderKind`, `ProviderHealthStatus`,
`ProviderHealth`, `ProviderErrorContext`, and `class ProviderError extends Error`.

### Market Provider

Source: `services/providers/market.ts`

```ts
interface MarketProvider {
  readonly name: string;
  health(): Promise<ProviderHealth>;
  listMarkets(params: MarketQueryParams): Promise<MarketListResult>;
  getMarket(ticker: string): Promise<MarketContract>;
}

interface MarketListResult {
  markets: MarketContract[];
  nextCursor?: string;
}
```

`MarketContract` is the normalized market entity; `MarketQueryParams` accepts optional `status`,
`category`, `limit`, and `cursor`.

### Research Provider

Source: `services/providers/research.ts`

```ts
interface ResearchProvider {
  readonly name: string;
  health(): Promise<ProviderHealth>;
  researchMarket(input: ResearchRequest): Promise<ResearchResult>;
}
```

### Model Provider

Source: `services/providers/model.ts`

```ts
interface ModelProvider {
  readonly name: string;
  health(): Promise<ProviderHealth>;
  runStructured<TInput, TOutput>(request: ModelRequest<TInput>): Promise<ModelResult<TOutput>>;
}
```

`ModelRequest<TInput>` carries `promptId`, `promptVersion`, `modelName`, `temperature`, a
`responseFormat` JSON schema, and the typed `input`. `ModelResult<TOutput>` echoes the prompt and
model identifiers alongside the typed `output` and the `raw` response.

### Delivery Provider

Source: `services/providers/delivery.ts`

```ts
interface DeliveryProvider {
  readonly name: string;
  health(): Promise<ProviderHealth>;
  deliverReport(report: ReportPayload): Promise<DeliveryResult>;
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

Implementation status (`services/providers/kalshi.ts`):

- Implemented: `health()`, `listMarkets()`, `getMarket()`. Read-only, unauthenticated — no
  order, portfolio, or trading endpoints are called.
- `MarketQueryParams.status`, `limit`, and `cursor` are mapped to query parameters.
  `MarketQueryParams.category` is accepted by the interface but is **not** sent to the Kalshi
  API; the returned `category` is inferred locally from the event ticker prefix. Category
  filtering is therefore not yet available at the provider level.
- Settlement/outcome lookup is not implemented.

Failure modes:

- API unavailable.
- Rate limited.
- Schema changed.
- Empty response.
- Partial data.

Retry policy:

- **Not implemented.** There is no backoff and no retry loop anywhere in the codebase; a failed
  call surfaces to the caller immediately.
- What exists today is retryability *classification*. Every failure is raised as a
  `ProviderError` whose `ProviderErrorContext` carries `retryable: boolean` plus `statusCode`
  where known: `true` for network-level failures and for HTTP 429/5xx, `false` for deterministic
  4xx responses and malformed payloads.
- When retry orchestration is built, it must honour that flag — retry transient 429/5xx with
  exponential backoff, and never retry deterministic 4xx configuration errors. Until then this
  is an intent, not a behaviour.

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