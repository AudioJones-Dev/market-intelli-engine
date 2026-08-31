# Milestone 06 — Market Snapshot Mapping

**Status:** Merged — retroactive record  
**Scope Type:** Storage boundary contracts and pure mapping functions  
**Runtime Logic:** Pure transformation only; no I/O, no database client, no scheduled work

## Objective

Define the ingestion boundary deferred by Milestone 05 so normalized `MarketContract` values produced by a `MarketProvider` can be converted into rows matching the `market_snapshots` table established in Milestone 03, without introducing a database client or a scheduled ingestion job.

## Scope

Included:

- New `services/ingestion/` boundary, the first service directory beyond `services/providers/`.
- `MarketSnapshotRecord` in `services/ingestion/market-snapshots.ts`, mirroring the `market_snapshots` columns in snake_case.
- `MarketSnapshotRepository` declaring a single `saveMany` operation, and `MarketSnapshotSaveResult` carrying `insertedCount`.
- `toMarketSnapshotRecord`, mapping one `MarketContract` to one `MarketSnapshotRecord` with an injectable `ingestedAt` defaulting to the current time.
- `toMarketSnapshotRecords`, mapping many contracts under a single shared `ingestedAt` value.
- Barrel export in `services/ingestion/index.ts` using `.js` relative specifiers for NodeNext resolution.
- Mapper tests covering full records, omitted optional fields, and shared ingestion timestamps.

Excluded:

- Any Supabase or Postgres client implementation; `MarketSnapshotRepository` is declared and never implemented.
- Scheduled ingestion workflows, polling loops, and cron registration.
- Persistence, deduplication, upsert semantics, and conflict resolution.
- Changes to any provider contract or to `KalshiProvider`.
- Reverse mapping from database rows back to `MarketContract`.
- Trading, ordering, and portfolio logic.

## Files Created

- `services/ingestion/market-snapshots.ts`
- `services/ingestion/index.ts`
- `tests/market-snapshots.test.ts`

No existing file was modified. The milestone is purely additive.

## Definition of Ready Check

- Problem defined: Milestone 05 produces normalized market data with nowhere to store it, and Milestone 03 defines a table with no mapping onto it.
- Scope defined: type-level storage contracts and pure mapping functions only.
- Acceptance criteria defined below.
- Dependencies known: the `MarketContract` shape from Milestone 04 and the `market_snapshots` schema from Milestone 03.
- Architecture impact: introduces the ingestion boundary between the provider layer and the snapshot store described in `docs/02-ARCHITECTURE.md`.
- Security review: no credentials, network calls, or environment variables are read.
- YAGNI review: the repository interface is declared because Milestone 03 froze the table shape; no implementation is written until a persistence milestone is approved.

## Acceptance Criteria

- Every field of `MarketSnapshotRecord` corresponds to a column of `market_snapshots`, excluding the database-generated `id`.
- Field names are snake_case, matching the SQL schema rather than the camelCase `MarketContract`.
- `raw_json` receives the untouched `MarketContract.raw` payload, preserving the reproducibility guarantee carried forward from Milestone 04.
- `toMarketSnapshotRecord` accepts an explicit `ingestedAt` so tests and batch callers are deterministic, and defaults to the current time otherwise.
- `toMarketSnapshotRecords` applies one shared `ingestedAt` across a batch rather than stamping each record independently.
- Optional fields absent from the source contract are omitted from the record rather than assigned `undefined`, satisfying `exactOptionalPropertyTypes`.
- `services/ingestion/index.ts` re-exports every public type and both mapper functions.
- No database client, network call, or scheduled job is introduced.
- `npm run typecheck` succeeds.
- `npm run lint` succeeds.
- `npm run format` succeeds.
- `npm run test` succeeds.

## Tests

- `tests/market-snapshots.test.ts` asserts that a fully populated `MarketContract` maps to the complete snapshot record, including snake_case renaming of `eventTicker`, `closeTime`, `yesBid`, `yesAsk`, `lastPrice`, and `openInterest`, and that `raw` is carried to `raw_json` unchanged.
- `tests/market-snapshots.test.ts` asserts that a contract carrying only the required fields produces a record with no `event_ticker` and no `yes_bid` key, tested with `not.toHaveProperty` so a key set to `undefined` would fail the assertion.
- `tests/market-snapshots.test.ts` asserts that `toMarketSnapshotRecords` returns one record per input and stamps every record with the same `ingested_at`.
- The suite is pure; it performs no network, filesystem, or database access and requires no mocks.
- No test exercises `MarketSnapshotRepository`, which has no implementation in this milestone.

## Definition of Done

- Ingestion mapping contracts committed.
- Ingestion barrel export added.
- Mapper tests added.
- Milestone doc added retroactively.
- No persistence implementation or scheduled ingestion introduced.

## Definition of Stable

The mapping contracts were authored in commits `43d7587`, `640d78c`, and `28f695a` on branch `milestone-06-snapshots`, which then remained open while `main` advanced. As authored, `toMarketSnapshotRecord` built its result by passing an object literal to an `omitUndefined` helper whose return type was annotated `MarketSnapshotRecord`. TypeScript inferred the helper's type parameter from that annotation and rejected the literal under `exactOptionalPropertyTypes` with `TS2375`, because `string | undefined` is not assignable to an optional `string` property. The helper stripped those keys correctly at runtime, so all three tests passed; only the type gate failed.

Unlike Milestone 05, the defect never reached `main`. Commit `ffd4d33` replaced the helper with conditional spreads — the idiom already used in `services/providers/kalshi.ts` for the same constraint — and removed the now-unused helper, reducing the function by four lines. All four verify gates passed before the branch merged as `e26a0b6`.

The mapping is stable against the frozen Milestone 03 schema. It remains unobserved in practice, because no code in this milestone or any earlier one writes a snapshot to a database.
