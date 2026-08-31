# ADR-0008 — Market Intelligence Engine Domain Boundary

## Status

Accepted — ratified by the operator 2026-08-01 (decision D-11)

## Date

2026-07-31

> **Numbering note.** This repository currently carries two ADR numbering spaces: the inline
> "Initial Decisions" list in `docs/14-ADR.md` (ADR-0001 … ADR-0007) and the file registry under
> `adr/` (`0001-supabase-kalshi-perplexity-batch-mvp.md`). They collide at ADR-0001. This ADR
> takes **0008** — the next number free in the inline list — to avoid creating a third collision.
> Reconciling the two spaces is a separate human decision; see `docs/14-ADR.md` § ADR Registry
> and Numbering. Accepted ADRs are deliberately not renumbered here, because renumbering an
> accepted decision breaks every reference to it.

## Context

Market Intelligence Engine is an evidence-first research and forecasting platform whose initial
domain is Kalshi prediction markets.

The system:

- ingests market information;
- gathers and normalizes evidence;
- estimates event probabilities;
- calculates deterministic expected value;
- produces recommendations for human review;
- records immutable prediction entries;
- measures calibration after settlement.

The system does not currently manage capital, brokerage accounts, portfolios, or trade
execution.

Prediction-market research and live trading execution have materially different:

- security requirements;
- credential requirements;
- regulatory implications;
- latency requirements;
- failure tolerances;
- risk calculations;
- data models;
- deployment controls;
- operational responsibilities.

Allowing these concerns to enter the MIE MVP would weaken the current architecture and expand
the security and operational surface before the forecasting loop has been validated.

The existing constitution already states that the system never executes trades
(`docs/00-VISION.md` §6) and that no automated trading is in scope (ADR-0004,
`adr/0001-supabase-kalshi-perplexity-batch-mvp.md`). Those are **scope** statements. This ADR
converts them into an **architectural boundary** with enumerated prohibitions and an enforcement
list, so the constraint survives contributors who never read the vision document.

## Decision

Market Intelligence Engine is a research, forecasting, decision-support, and calibration
platform.

MIE **may**:

- collect market and external evidence;
- estimate probabilities;
- calculate edge and expected value;
- classify opportunities;
- generate analyst reports;
- record recommendations;
- measure calibration;
- produce human-reviewable trade candidates.

MIE **may not own**:

- brokerage authentication;
- broker API credentials;
- live order submission;
- paper order submission;
- portfolio allocation;
- position sizing;
- margin calculations;
- trade reconciliation;
- intraday position management;
- autonomous capital deployment;
- stop-loss execution;
- account-level risk enforcement.

Any future trading-related capability requires:

1. A separate ADR.
2. A separate security threat model.
3. A separate execution and risk specification.
4. Separate credentials and secrets.
5. Independent deployment approval.
6. Human approval.
7. A determination of whether the capability belongs in a separate repository or separately
   deployable service.

## Alternatives Considered

1. **Rely on the existing scope statements alone.** Rejected: `docs/00-VISION.md` and ADR-0004
   state that trading is out of scope, but neither enumerates the adjacent capabilities
   (position sizing, portfolio state, paper execution) that would arrive one at a time without
   ever presenting as "adding trading."
2. **Define the boundary as a security policy only** (`docs/10-SECURITY.md`). Rejected: a
   credential prohibition stops broker authentication but not portfolio modelling or position
   sizing, which need no credentials and would still expand the domain.
3. **Build MIE as a general market operating system now, with execution gated by a flag.**
   Rejected: a runtime flag is not an architectural boundary. It couples the research loop's
   deployment, data model, and blast radius to execution concerns before the forecasting loop
   has demonstrated value.

## Consequences

### Positive

- Preserves the current MVP boundary.
- Reduces credential and financial risk.
- Keeps Kalshi forecasting independently testable.
- Prevents research agents from gaining execution authority.
- Allows future trading systems to reuse MIE doctrine without sharing unsafe runtime
  responsibilities.

### Negative

- Some future systems may duplicate small amounts of infrastructure.
- Shared contracts may require later extraction.
- Cross-system integrations will require explicit interfaces.

These costs are acceptable because premature sharing would create greater coupling and
operational risk.

### Risks

- A capability may be introduced under research framing (for example, "simulated position
  sizing for EV realism") that is functionally portfolio management. The enforcement list below
  is written by capability, not by naming, to reduce this.
- MIE already computes `expected_value` per contract. EV is analysis, not sizing; the boundary
  is crossed when a quantity, allocation fraction, or account balance enters the model.

## Enforcement

The following changes require a new ADR and human approval:

- adding broker integrations;
- adding paper or live order execution;
- introducing position-sizing logic;
- introducing portfolio-level risk;
- storing brokerage credentials;
- introducing real-time trade management;
- allowing agents to initiate capital-allocation actions.

Practical tripwires — any of these indicates the boundary is being approached:

- a new secret, environment variable, or config key naming a broker or exchange account;
- any field representing a **quantity of contracts**, **capital allocated**, **account
  balance**, or **open position**;
- any dependency on a brokerage or order-routing SDK;
- any workflow whose success depends on an order acknowledgement;
- any agent output interpreted as an instruction rather than a recommendation.

## YAGNI Review

- **Does this solve an MVP requirement?** It protects one. The MVP's auditability and security
  posture both depend on the system holding no execution authority.
- **Can this wait?** No. Boundaries are cheap to state before the first violation and expensive
  afterwards.
- **Is this speculative?** The ADR adds no capability and no code. It constrains future work.
- **Can existing architecture solve this?** Existing docs state the scope but do not enumerate
  the boundary or its enforcement triggers.

## Non-Goals

This ADR does not prevent MIE from generating research-backed trade candidates.

It prevents MIE from executing or managing those trades.

## Approval

Approved by: Operator, 2026-08-01 (decision D-11).

The domain boundary is in force. MIE is a research, forecasting, expected-value analysis, and
calibration platform. It holds no brokerage credentials, no execution authority, and no
portfolio state. The capabilities enumerated under **Decision** are prohibited, and the
**Enforcement** list requires a new ADR, an independent threat model, separate credentials, and
human approval before any of them is reconsidered.

Capabilities beyond this boundary are **not deferred roadmap items**. They belong to a separate
bounded system (`docs/13-ROADMAP.md` § Outside the MIE Domain).
