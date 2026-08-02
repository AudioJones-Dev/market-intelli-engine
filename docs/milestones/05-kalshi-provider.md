# Milestone 05 — Kalshi Provider

**Status:** Merged — retroactive record  
**Scope Type:** Runtime provider implementation  
**Runtime Logic:** Read-only Kalshi HTTP access, normalization, and error classification

## Objective

Implement the read-only `KalshiProvider` required by `docs/15-CODEX-BUILD-PLAN.md` Phase 1 so market listing and market detail retrieval satisfy the `MarketProvider` contract established in Milestone 04.

## Scope

Included:

- `KalshiProviderConfig` with a required `baseUrl` and an optional injectable `fetchFn`.
- `KalshiProvider implements MarketProvider` with `name` fixed to `kalshi`.
- Trailing-slash normalization of the configured base URL in the constructor.
- `listMarkets` against `GET {baseUrl}/markets` with optional `status`, `limit`, and `cursor` query parameters, plus `nextCursor` propagation.
- `getMarket` against `GET {baseUrl}/markets/{ticker}` with the ticker URL-encoded.
- `health` implemented as a single-market probe reporting `healthy` or `unavailable`.
- Normalization of Kalshi snake_case payload fields to the camelCase `MarketContract` shape, with numeric coercion of string-valued price and size fields.
- Category inference from the leading segment of `event_ticker`.
- `ProviderError` classification distinguishing retryable from non-retryable failures.
- Export of `KalshiProvider` and `KalshiProviderConfig` from `services/providers/index.ts`.
- Mocked-fetch tests covering listing, detail retrieval, retryable server errors, and fail-fast input validation.

Excluded:

- Authentication; only unauthenticated public read endpoints are called.
- Any write, order, portfolio, or trading endpoint, per the repository rule in `docs/15-CODEX-BUILD-PLAN.md` that trading is not implemented.
- Retry, backoff, or rate-limit handling; retryability is classified but never acted upon.
- Mapping of `MarketQueryParams.category` to a Kalshi query parameter.
- Persistence of market snapshots, which is deferred to Milestone 06.
- A `degraded` health state, which is never produced.
- Any second market provider.

## Files Created

- `services/providers/kalshi.ts`
- `tests/kalshi-provider.test.ts`

Modified: `services/providers/index.ts` gained the `KalshiProvider` and `KalshiProviderConfig` exports.

## Definition of Ready Check

- Problem defined: MIE cannot ingest anything until a concrete market source exists behind the `MarketProvider` contract.
- Scope defined: read-only listing and detail retrieval for a single provider.
- Acceptance criteria defined below.
- Dependencies known: Milestone 04 provider contracts, the Kalshi public trade API, and the platform `fetch` global on Node 20 or later.
- Architecture impact: supplies the `KalshiProvider` named in `docs/02-ARCHITECTURE.md`.
- Security review: no credentials, tokens, or environment secrets are read; only public read endpoints are called.
- YAGNI review: single-provider scope matches the approved MVP decision to ship Kalshi only.

## Acceptance Criteria

- `KalshiProvider` satisfies `MarketProvider` without widening the contract.
- A configured base URL with a trailing slash produces the same request URL as one without.
- `listMarkets` sets `status`, `limit`, and `cursor` query parameters only when supplied.
- `getMarket` rejects a blank or whitespace-only ticker with a non-retryable `ProviderError` before any request is issued.
- `getMarket` rejects a detail response lacking a `market` key with a non-retryable `ProviderError`.
- A thrown network request produces a retryable `ProviderError`.
- A non-ok response produces a `ProviderError` whose `retryable` flag is true only for status `429` or status `500` and above, and whose `statusCode` records the response status.
- Normalization requires `ticker`, `title`, and `status`, and otherwise raises a non-retryable `ProviderError`.
- Every normalized `MarketContract` sets `provider` to `kalshi` and preserves the complete upstream payload at `raw`.
- Optional fields are omitted rather than assigned `undefined`, satisfying `exactOptionalPropertyTypes`.
- `health` returns a `ProviderHealth` in all cases and never throws.
- `npm run typecheck` succeeds.
- `npm run lint` succeeds.
- `npm run test` succeeds.
- No authenticated, write, or trading endpoint is called.

## Tests

- `tests/kalshi-provider.test.ts` asserts that `listMarkets` emits the expected query string and normalizes a market, including string-to-number coercion of price and size fields and category inference from `event_ticker`.
- `tests/kalshi-provider.test.ts` asserts that `getMarket` requests the exact expected URL, which proves the trailing slash is stripped from the configured base URL.
- `tests/kalshi-provider.test.ts` asserts that a `503` response rejects with a `ProviderError` whose context carries `retryable: true` and `statusCode: 503`.
- `tests/kalshi-provider.test.ts` asserts that a blank ticker rejects with a `ProviderError` and that the fetch mock was never called.
- Every case injects a `vi.fn<typeof fetch>` mock, so the suite performs no network access.

## Definition of Done

- Kalshi provider implementation committed.
- Provider barrel export updated.
- Mocked provider tests added.
- Milestone doc added retroactively.
- Read-only scope preserved; no trading capability introduced.

## Definition of Stable

The implementation merged in commit `60f4ad0` did not satisfy the `npm run typecheck` or `npm run format` gate. Normalization assigned `undefined` to optional keys that `exactOptionalPropertyTypes` forbids, the fetch mocks were untyped, and two assertions in the test suite exceeded the configured print width. Commit `32196f9` restored all four verify gates by spreading optional keys conditionally rather than widening the provider contracts to accept `undefined`, typing each mock as `typeof fetch`, and reformatting the test file. The milestone is therefore stable only from `32196f9` onward, and remains subject to observation against the live Kalshi API, which no test in this milestone exercises.
