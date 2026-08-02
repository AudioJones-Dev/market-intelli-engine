# Services

Runtime implementation lives here. Service boundaries are implemented one at a time, as each
milestone satisfies the Definition of Ready.

## Implemented

- `providers/` — the external-boundary layer. It defines the provider contracts for the four
  dependencies the engine talks to (market data, research, model inference, report delivery),
  the shared provider error and health types, and the read-only Kalshi market provider.

  Interface signatures are specified in
  [`docs/04-API-SPEC.md`](../docs/04-API-SPEC.md). They are deliberately not restated here, so
  the spec stays the single source of truth.

## Planned

The remaining service boundaries in the canonical repository structure
(`docs/02-ARCHITECTURE.md`) are not implemented yet:

- `ingestion/`
- `ranking/`
- `research/`
- `analysis/`
- `scoring/`
- `reporting/`

An earlier revision of this README also listed `calibration/`. The Calibration Engine is a
named architecture component, but the canonical repository structure in
`docs/02-ARCHITECTURE.md` does not assign it a `services/` directory. Its location is unresolved
and is not claimed here.
