# 20 — MIOS Methodology Adoption

**Project:** Market Intelligence Engine (MIE)
**Version:** 0.1 specification draft
**Source:** Market Intelligence Operating System (MIOS) — cross-disciplinary synthesis
**Status:** Partial adoption with mandatory exclusions

## Purpose

Record what MIE adopts from the MIOS synthesis, what it adapts, and what it **must not** adopt.

MIOS is a comparative synthesis across social arbitrage, systematic quant, event-driven
strategies, alternative data, OSINT tradecraft, military decision theory, Bayesian forecasting,
and systems thinking. It proposes an eight-layer architecture for pre-consensus signal discovery.

This document is the adoption gate. **MIOS is a source, not an authority** — where it conflicts
with MIE's constitution (`docs/00-VISION.md`) or domain boundary
(`adr/0008-mie-domain-boundary.md`), MIE's own documents win.

## 1. Epistemic Status of MIOS Itself

MIOS labels its own claims by evidence class and explicitly flags its limits. MIE preserves
those labels rather than flattening them into doctrine. Three self-declared limits are
load-bearing for how MIE may use it:

1. **The integrated architecture is unvalidated.** MIOS §9 states plainly that no publicly
   audited fund has disclosed a system combining all eight layers, and that "its aggregate
   effectiveness as an integrated system has not been empirically tested or published in any
   source reviewed here." The eight-layer design is **synthesized inference**, not established
   practice.
2. **Social arbitrage is a single-practitioner case study.** MIOS §11 states that no
   peer-reviewed backtest of social arbitrage as a repeatable strategy was found; the evidence
   is one audited track record, with roughly 5× the volatility of an S&P 500 ETF.
3. **Several component descriptions are third-party reconstructions.** The Renaissance
   "six-layer loop" is an interpretive reconstruction from a podcast investigation, not firm
   disclosure.

**Consequence for MIE.** MIOS supplies **method**, not **expected return**. MIE adopts its
structuring techniques and imports none of its performance claims. No MIE document, prompt, or
report may cite MIOS as evidence that a signal class is profitable.

This is not a weakness in the adoption — it is the correct relationship. MIE's constitution says
the system exists to measure forecasts, not to be right by narrative force. **An untested
methodology is exactly the kind of claim MIE's calibration loop is built to evaluate.** MIE
should treat MIOS-derived signal classes as hypotheses under measurement, tagging forecasts with
the signal class that generated them so calibration can report per-class Brier scores over time.
If MIOS-style signals carry no predictive value in Kalshi markets, MIE is the instrument that
will show it.

### Citation gap

The MIOS document carries numbered citation markers `[1]`–`[30]` with **no accompanying
reference list**. Under `docs/design/ANALYST_REPORT_STANDARD.md` §4, a `[FACT]` whose source
reference does not resolve is a defect. MIOS claims may therefore be carried into MIE
documentation as **method descriptions**, but any MIOS claim used as evidence in an analyst
report must first resolve to a real source in the Source Appendix. Requesting the bibliography
is decision D-9 (`docs/design/DESIGN_SYSTEM_SNAPSHOT.md` §7).

## 2. Mandatory Exclusions — Domain Boundary

**Two MIOS layers are prohibited in MIE and may not be implemented.**

| MIOS layer | Status | Reason |
|---|---|---|
| **Layer 6 — Position Construction & Risk Sizing** | **PROHIBITED** | `adr/0008-mie-domain-boundary.md` prohibits position sizing, portfolio allocation, and margin calculation |
| **Layer 7 — Execution as Signal Preservation** | **PROHIBITED** | ADR-0008 prohibits live and paper order submission and order-routing dependencies |

Adopting MIOS wholesale would breach the domain boundary ratified in ADR-0008. This is the
single most important finding in this document.

The breach is not hypothetical or a matter of naming. MIOS Layer 6 is described as "size for
asymmetric risk/reward; hedge event-outcome uncertainty" and Layer 7 as "treat execution as
alpha preservation, not passive order placement." Both are execution-domain functions. Sizing
requires a capital base and a position quantity; execution requires order routing. Each trips
the tripwires enumerated in ADR-0008 § Enforcement.

**MIE implements MIOS layers 1–5 and 8 only.** The pipeline terminates at a human-reviewable
recommendation. What a human does with that recommendation is outside MIE.

MIOS's own framing supports this split: it describes Layers 1–5 as discovery and verification
and Layers 6–7 as deployment. MIE is a discovery and measurement system.

## 3. Adopted Layer Mapping

| MIOS layer | MIE component | Status |
|---|---|---|
| 1 — Signal Sourcing | Research provider, evidence collection (`docs/02-ARCHITECTURE.md` §5) | Adopted, adapted — see §4 |
| 2 — Triangulation & OSINT Verification | Evidence normalizer, `source_provenance` (`docs/03-DATA-MODEL.md`) | Adopted |
| 3 — Bayesian Belief Ledger | Probability engine + prediction ledger + calibration (`docs/09-CALIBRATION.md`) | Adopted — already substantially present |
| 4 — Systems / Second-Order Mapping | Probability reasoning, invalidation conditions | Adopted as reasoning discipline |
| 5 — Hypothesis Red-Team (ACH) | Counterargument agent + ACH procedure (`docs/21-ACH-PROCEDURE.md`) | Adopted — **closes decision D-6** |
| 6 — Position Construction & Risk Sizing | — | **PROHIBITED** (§2) |
| 7 — Execution as Signal Preservation | — | **PROHIBITED** (§2) |
| 8 — Governance / Decay Monitoring | Promotion lifecycle (`docs/19-PROMOTION-AND-RETIREMENT-POLICY.md`) | Adopted — already present |

Layers 3 and 8 required no new work: MIE's Brier-scored calibration loop already implements the
superforecasting discipline MIOS Layer 3 describes, and `docs/19` already implements the
signal-decay governance of Layer 8, including the automatic-suspension triggers that correspond
to MIOS's "Sharpe-degradation kill-switch."

## 4. Adaptations Required

MIOS is written for **discretionary equity investing**. MIE trades **binary event contracts on
Kalshi**. Four adaptations follow.

### 4.1 Tier 1 observation is unavailable

MIOS's information hierarchy is: Tier 1 personal observation → Tier 2 social/search confirmation
→ Tier 3 mainstream media → Tier 4 analyst coverage.

**MIE is a scheduled batch system with no human observer in the loop**
(`docs/05-WORKFLOWS.md`). It cannot perform Tier 1 street-level observation, which MIOS itself
rates as having low automation potential.

MIE therefore operates from **Tier 2 onward**. This is a genuine and permanent capability
limit, not a temporary gap, and it must be stated rather than papered over: MIE's earliest
possible detection point is later than a human observer's. The compensating advantage is
breadth and consistency — MIE evaluates every ranked market on every run, and records what it
saw, which an individual observer does not.

Tier is recorded on each evidence item so that calibration can test whether Tier-2 evidence
carries predictive value in this domain.

### 4.2 Tier maps to staleness, not just recency

MIOS treats Tier 3 (mainstream media) as "window closing" and Tier 4 (analyst coverage) as an
exit signal. In MIE's evidence model these map to evidence-status treatments
(`docs/design/MIE_DESIGN_ADAPTATION.md` §6): Tier 3/4 saturation is a signal that the market has
likely already priced the information, and is recorded as an economic-risk flag on the economic
score (`docs/08-SCORING.md` Layer 3) — **not** as a probability adjustment.

This distinction matters and follows directly from MIE's layer separation: *how likely the event
is* (Layer 1) and *whether the market has already priced it* (Layer 3) are different questions.
MIOS blends them; MIE must not.

### 4.3 "Pure play" selection does not transfer

MIOS's stock-selection filter — find the public company most directly affected by a trend — has
no analogue in binary event contracts. A Kalshi market already names its own resolution
condition. The corresponding MIE discipline is **settlement-rule interpretation**
(`docs/design/ANALYST_REPORT_STANDARD.md` §3.4): confirming the contract resolves on the thing
the evidence actually bears on. Rule ambiguity is MIE's equivalent of picking the wrong ticker,
and it is the higher-severity failure.

### 4.4 Speed-versus-rigor is resolved toward rigor

MIOS §10 records an unresolved tension: observational investing prizes being early and accepts
less formal verification, while OSINT tradecraft and superforecasting prize calibration and
disconfirmation.

**MIE resolves this toward rigor, by constitution, and the resolution is not discretionary.**
`docs/00-VISION.md` states: evidence before reasoning; no recommendation without an evidence
package; calibration beats confidence; the system does not optimize for one-off wins. A batch
system running on a daily cadence has already forfeited the speed pole — attempting to compete
on latency while retaining batch architecture would produce the worst of both.

Where MIOS's disciplines conflict, MIE takes the OSINT/superforecasting side. Practically: MIE
would rather miss an early entry than publish an unverified one.

## 5. Adopted Practices, by Discipline

Method only. No performance claim attaches to any row.

| MIOS discipline | Adopted into MIE | Where |
|---|---|---|
| Social arbitrage — signal tiering | Evidence tier recorded per item; Tier 3/4 saturation as a pricing-risk flag | §4.1–4.2 |
| Social arbitrage — seasonal adjustment | Search/social trend evidence must be seasonally adjusted or labelled unadjusted | `docs/07-PROMPTS.md` |
| Quant — many weak independent signals | Calibration reported per signal class, not pooled | `docs/09-CALIBRATION.md` |
| Quant — signal decay kill-switch | Automatic suspension triggers | `docs/19` |
| Quant — scheduled reinvention | Promotion/retirement lifecycle | `docs/19` |
| Event-driven — completion probability | Settlement-condition probability reasoning | `docs/08-SCORING.md` Layer 1 |
| Alt-data — point-in-time integrity | Immutable snapshots; no look-ahead | `docs/18-DECISION-REPRODUCIBILITY.md` |
| Alt-data — crowding erodes edge | Tier 3/4 saturation flag | §4.2 |
| OSINT — triangulation, ≥3 independent sources | Corroboration count on evidence status | `MIE_DESIGN_ADAPTATION.md` §6 |
| OSINT — ACH, devil's advocacy, red-teaming | Formal ACH procedure | `docs/21-ACH-PROCEDURE.md` |
| OSINT — confidence-levelled conclusions | Confidence score distinct from probability | `docs/08-SCORING.md` |
| OODA — Orient as centre of gravity | Assumptions and invalidation conditions logged per forecast | `docs/03-DATA-MODEL.md` |
| OODA — Destruction and Creation | Belief updates recorded, not silently overwritten | `docs/18` |
| Superforecasting — frequent small updates | Append-only forecast records; new evidence creates a new forecast | `docs/18` |
| Superforecasting — Brier self-audit | Already core to MIE | `docs/09-CALIBRATION.md` |
| Superforecasting — update magnitude ∝ diagnosticity | Diagnosticity scoring in ACH | `docs/21-ACH-PROCEDURE.md` |
| Systems thinking — reinforcing vs balancing loops | Trend-durability reasoning in probability rationale | §6 |
| Systems thinking — delays cause oscillation | Invalidation conditions must state timing triggers | `ANALYST_REPORT_STANDARD.md` §8 |

## 6. Systems Mapping (Layer 4) — Scope

Adopted as a **reasoning discipline**, not a modelling subsystem. MIOS itself rates causal-loop
mapping as subjective and hard to backtest.

Each forecast's probability reasoning should state whether the mechanism driving the event is
self-reinforcing, self-limiting, or neither, and identify any feedback delay that could cause
the event to occur later than the evidence suggests. Delay is the practically important part:
MIOS notes that missing feedback delays causes premature entry and exit, which in a
fixed-expiry binary contract is not merely early — it is wrong, because the contract settles on
a date regardless of whether the thesis was eventually correct.

Formal causal-loop diagrams are **not** required and are not an MVP deliverable.

## 7. What MIE Explicitly Does Not Adopt

| Not adopted | Reason |
|---|---|
| Layer 6 — position construction, risk sizing, hedging | ADR-0008 domain boundary |
| Layer 7 — execution as signal preservation | ADR-0008 domain boundary |
| Tier 1 personal observation | Not available to a batch system (§4.1) |
| "Pure play" equity selection | No analogue in binary contracts (§4.3) |
| Any MIOS performance or return claim | Unvalidated; single-practitioner case study (§1) |
| The claim that the integrated 8-layer architecture is effective | Self-declared as untested (§1) |
| Options strategies, holding-period tactics | Execution domain |
| "Getting inside the opponent's decision cycle" as a design goal | MIE competes on calibration, not latency (§4.4) |

## 8. Acceptance Criteria

- MIOS layers 6 and 7 are absent from MIE specifications and implementation.
- No MIE document or prompt cites MIOS as evidence of profitability.
- Evidence items record their tier.
- Tier 3/4 saturation is an economic-risk flag, never a probability adjustment.
- ACH is specified as an executable procedure (`docs/21-ACH-PROCEDURE.md`).
- Calibration can report Brier scores per signal class.
- MIOS claims used as report evidence resolve to a real Source Appendix entry.
