# Milestone 04 — Provider Interfaces

**Status:** Merged — retroactive record  
**Scope Type:** Type-level provider contracts  
**Runtime Logic:** Minimal; `ProviderError` is the only executable construct

## Objective

Define the market, research, model, and delivery provider contracts required by `docs/15-CODEX-BUILD-PLAN.md` Phase 0 so later ingestion, research, and reporting milestones code against interfaces rather than vendor SDKs.

## Scope

Included:

- Shared provider vocabulary in `services/providers/types.ts`: `ProviderKind`, `ProviderHealthStatus`, `ProviderHealth`, `ProviderErrorContext`, and `ProviderError`.
- Market contract surface in `services/providers/market.ts`: `MarketQueryParams`, `MarketContract`, `MarketListResult`, and `MarketProvider`.
- Research contract surface in `services/providers/research.ts`: `ResearchRequest`, `ResearchSource`, `ResearchResult`, and `ResearchProvider`.
- Model contract surface in `services/providers/model.ts`: `JsonSchema`, `ModelResponseFormat`, `ModelRequest`, `ModelResult`, and `ModelProvider`.
- Delivery contract surface in `services/providers/delivery.ts`: `ReportPayload`, `DeliveryResult`, and `DeliveryProvider`.
- Barrel export in `services/providers/index.ts` using `.js` relative specifiers for NodeNext resolution.
- Mock-based contract tests for the market and research interfaces.

Excluded:

- Concrete provider implementations for Kalshi, Perplexity, OpenAI, or any delivery channel.
- HTTP clients, authentication, credential handling, and retry or backoff policy.
- Persistence of provider output.
- Contract tests for `ModelProvider` and `DeliveryProvider`.
- Trading logic.

## Files Created

- `services/providers/types.ts`
- `services/providers/market.ts`
- `services/providers/research.ts`
- `services/providers/model.ts`
- `services/providers/delivery.ts`
- `services/providers/index.ts`
- `tests/providers-contract.test.ts`

## Definition of Ready Check

- Problem defined: ingestion and research milestones need stable provider boundaries before vendor code lands.
- Scope defined: interface declarations and a single error class only.
- Acceptance criteria defined below.
- Dependencies known: TypeScript with `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes`; Vitest.
- Architecture impact: establishes the provider abstraction layer described in `docs/02-ARCHITECTURE.md`.
- Security review: no secrets, credentials, or network calls introduced.
- YAGNI review: all four provider kinds are named in the approved build plan and are required before Phase 1.

## Acceptance Criteria

- Every provider interface exposes `readonly name: string` and `health(): Promise<ProviderHealth>`.
- `MarketContract`, `ResearchResult`, `ModelResult`, and `DeliveryResult` each carry a `provider` field identifying their origin.
- `MarketContract`, `ResearchResult`, and `ModelResult` carry a required `raw` field preserving the untouched upstream payload for reproducibility, consistent with the frozen-snapshot criterion in `docs/milestones/03-supabase-baseline-schema.md`. `DeliveryResult.raw` is optional because a delivery channel need not return a payload.
- `ModelProvider.runStructured` is generic over input and output types and requires a `ModelResponseFormat` declaring a JSON schema.
- `ProviderError` carries a `ProviderErrorContext` with `providerName`, `providerKind`, `operation`, and `retryable`.
- `services/providers/index.ts` re-exports every public type and the `ProviderError` class.
- `npm run typecheck` succeeds.
- `npm run lint` succeeds.
- `npm run test` succeeds.
- No vendor SDK, network call, or trading capability is introduced.

## Tests

- `tests/providers-contract.test.ts` declares a mock `MarketProvider` and asserts the returned market list.
- `tests/providers-contract.test.ts` declares a mock `ResearchProvider` and asserts the returned research result.
- `tests/providers-contract.test.ts` constructs a `ProviderError` and asserts that `retryable` and `statusCode` survive on `context`.
- The load-bearing assertion in each mock case is that the mock typechecks against the interface; the runtime expectation is secondary.
- `ModelProvider` and `DeliveryProvider` have no contract test in this milestone.

## Definition of Done

- Provider contract modules committed.
- Barrel export added.
- Market and research contract tests added.
- Milestone doc added retroactively.
- No runtime provider implementation included.

## Definition of Stable

Contracts merged in commit `1237a5b` and were exercised for the first time by the Kalshi implementation in Milestone 05, which required no change to the market contract. The interfaces are treated as stable until a second concrete provider of the same kind demonstrates a missing field.
