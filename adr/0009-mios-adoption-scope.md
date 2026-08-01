# ADR-0009 — MIOS Adoption Scope and Exclusions

## Status

Proposed

## Date

2026-08-01

## Context

The Market Intelligence Operating System (MIOS) synthesis has been supplied as MIE's
cross-disciplinary methodology. It compares social arbitrage, systematic quant, event-driven
strategies, alternative data, OSINT tradecraft, military decision theory (OODA), Bayesian
forecasting, and systems thinking, and proposes an eight-layer architecture for pre-consensus
signal discovery.

MIOS was previously recorded as a blocking gap (decision D-6): `DATA_VISUALIZATION_STANDARD.md`
§16 specified ACH presentation but no procedure existed for hypothesis enumeration, consistency
scoring, or diagnosticity.

Two properties of MIOS require an explicit adoption decision rather than silent incorporation.

**First, two of its eight layers breach MIE's domain boundary.** MIOS Layer 6 (Position
Construction & Risk Sizing) and Layer 7 (Execution as Signal Preservation) are execution-domain
functions. `adr/0008-mie-domain-boundary.md` prohibits position sizing, portfolio allocation,
margin calculation, and live or paper order submission. Adopting MIOS as written would breach a
boundary ratified one commit earlier — and would do so under the cover of "adopting an approved
methodology," which is precisely the incremental path ADR-0008 was written to prevent.

**Second, MIOS declares itself unvalidated.** Its §9 states that no publicly audited fund has
disclosed a system combining all eight layers and that the integrated architecture's
effectiveness "has not been empirically tested or published in any source reviewed here." Its
§11 records that social arbitrage has no peer-reviewed backtest and rests on a single audited
practitioner track record with roughly 5× the volatility of an S&P 500 ETF. Several component
descriptions are third-party reconstructions rather than firm disclosure.

MIE's constitution requires evidence before reasoning and calibration over confidence. Adopting
an explicitly untested architecture as doctrine would contradict that.

## Decision

**MIE adopts MIOS layers 1–5 and 8. Layers 6 and 7 are excluded and prohibited.**

MIE adopts MIOS as **method**, not as **evidence of return**. No MIE document, prompt, or report
may cite MIOS as evidence that any signal class is profitable.

MIOS-derived signal classes are treated as **hypotheses under measurement**. Forecasts record
the signal class that generated them so calibration can report per-class Brier scores. If
MIOS-style signals carry no predictive value in Kalshi markets, MIE's calibration loop is the
instrument that will demonstrate it.

Four adaptations are recorded in `docs/20-MIOS-METHODOLOGY.md` §4:

1. **Tier 1 personal observation is unavailable.** MIE is a scheduled batch system with no human
   observer; it operates from Tier 2 onward. This is a permanent capability limit.
2. **Tier 3/4 saturation is an economic-risk flag, not a probability adjustment.** How likely an
   event is (Layer 1) and whether the market has already priced it (Layer 3) are separate
   questions under `docs/08-SCORING.md`. MIOS blends them; MIE does not.
3. **"Pure play" equity selection does not transfer** to binary event contracts. The
   corresponding discipline is settlement-rule interpretation.
4. **The speed-versus-rigor tension resolves toward rigor**, by constitution. A daily batch
   system has already forfeited the latency pole.

The ACH procedure is specified in `docs/21-ACH-PROCEDURE.md`, closing D-6.

## Alternatives Considered

1. **Adopt MIOS in full.** Rejected: breaches ADR-0008.
2. **Adopt MIOS layers 6–7 in a "simulation only" form** — modelled position sizing without
   capital. Rejected: ADR-0008's tripwires are written by capability, not by naming. A schema
   field representing contract quantity or allocation fraction trips the boundary whether or not
   it is labelled simulated, and "simulated sizing" is the most likely first step across it.
3. **Adopt MIOS as validated doctrine.** Rejected: the document declares itself untested, and
   treating it otherwise would contradict the constitution's "calibration beats confidence."
4. **Decline MIOS entirely.** Rejected: layers 1–5 and 8 supply real structuring discipline —
   most importantly the ACH procedure that was already recorded as a blocking gap — and layers 3
   and 8 largely describe practices MIE already implements.

## Consequences

### Positive

- Closes D-6 with an executable ACH procedure.
- Supplies formal disconfirmation discipline, countering the natural failure mode of an
  LLM-driven pipeline assembling a persuasive case for whichever outcome it considered first.
- Confirms MIE's existing calibration and promotion machinery already satisfies MIOS layers 3
  and 8, requiring no new work there.
- Preserves the ADR-0008 boundary against an adoption that would have quietly crossed it.

### Negative

- MIE forgoes MIOS's earliest detection tier and accepts a structurally later entry point.
- ACH adds a mandatory stage to the analysis pipeline, increasing cost and latency per market.
- Per-signal-class calibration requires more settled markets before any class reaches an
  interpretable sample size.

### Risks

- ACH can be performed as ritual — a matrix produced to satisfy a checklist while the conclusion
  was formed elsewhere. The ordering constraint (hypotheses enumerated before any probability
  estimate is visible) and the coverage check are the mitigations, and both are testable.
- A hypothesis no evidence touches scores as least-contradicted and appears to lead. The
  mandatory coverage check exists specifically to catch this.

## YAGNI Review

- **Does this solve an MVP requirement?** Yes. ACH was already a specified presentation with no
  procedure behind it; Milestone 15 could not have been implemented.
- **Can this wait?** The exclusion decision cannot — MIOS is now in the repository, and an
  unrecorded scope leaves layers 6–7 apparently sanctioned.
- **Is this speculative?** No new capability is added. Layers 3 and 8 are already built.
- **Can existing architecture solve this?** Existing docs specify ACH presentation but no
  procedure.

## Non-Goals

This ADR does not validate MIOS's performance claims, adopt its return expectations, or
authorize any execution, sizing, or portfolio capability.

## Approval

Approved by:
