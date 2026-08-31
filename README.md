# Market Intelligence Engine (MIE)

> **Build systems that improve because they are measured—not because they are trusted.**

Market Intelligence Engine is an evidence-first research and forecasting platform for prediction-market analysis. The MVP ingests Kalshi markets, prioritizes research-worthy opportunities, gathers external evidence, estimates probabilities, compares them to market-implied probabilities, calculates expected value, generates explainable reports, and tracks calibration over time.

## North Star

Produce transparent, evidence-backed probability estimates whose calibration improves over time.

## Project Motto

> Evidence is collected. Probabilities are estimated. Decisions are explained. Outcomes are measured. The system improves.

## MVP Scope

MIE v1 focuses on the minimum system required to produce auditable forecasts:

1. Ingest and snapshot Kalshi markets.
2. Filter and prioritize markets for research.
3. Collect structured evidence using Perplexity.
4. Estimate event probabilities from evidence.
5. Compare estimated probabilities to market-implied probabilities.
6. Calculate expected value.
7. Generate human-readable reports.
8. Record predictions in an immutable ledger.
9. Track settlement outcomes.
10. Measure calibration over time.

## Explicit Non-Goals

MVP does **not** include automated trading, portfolio optimization, Kelly sizing, multi-provider market ingestion, additional research providers, custom frontend, mobile app, user accounts, live websocket streaming, reinforcement learning, fine-tuned forecasting models, Slack/email/Obsidian delivery beyond Markdown storage, a shared design-system package, HTML/PDF report rendering, or live data visualization.

The authoritative deferral list is the Deferred Milestones section of `docs/15-CODEX-BUILD-PLAN.md`.

## Governance

This repository follows:

- YAGNI by default.
- Evidence before reasoning.
- Calibration over confidence.
- Reproducible recommendations.
- Human approval before trade execution.
- ADRs for architectural changes.
- Definition of Ready before implementation.
- Definition of Done before merge.
- Definition of Stable after deployment observation.
- Inherited design system; no MIE-local colors, fonts, or component conventions.
- Explicit domain boundary; no execution authority.
- Reproducible decision manifests for every recommendation.
- Separated forecasting and economic-scoring layers.
- Governed promotion lifecycle; agents cannot promote their own changes.

## Specification Index

The canonical specification lives in `docs/`:

- `docs/00-VISION.md`
- `docs/01-PRD.md`
- `docs/02-ARCHITECTURE.md`
- `docs/03-DATA-MODEL.md`
- `docs/04-API-SPEC.md`
- `docs/05-WORKFLOWS.md`
- `docs/06-AGENTS.md`
- `docs/07-PROMPTS.md`
- `docs/08-SCORING.md`
- `docs/09-CALIBRATION.md`
- `docs/10-SECURITY.md`
- `docs/11-OBSERVABILITY.md`
- `docs/12-DEPLOYMENT.md`
- `docs/13-ROADMAP.md`
- `docs/14-ADR.md`
- `docs/15-CODEX-BUILD-PLAN.md`
- `docs/16-GOVERNANCE.md`
- `docs/17-SHARED-CONTRACT-CANDIDATES.md`
- `docs/18-DECISION-REPRODUCIBILITY.md`
- `docs/19-PROMOTION-AND-RETIREMENT-POLICY.md`
- `docs/20-MIOS-METHODOLOGY.md`
- `docs/21-ACH-PROCEDURE.md`

Alongside the numbered specification:

- `docs/milestones/` — per-milestone completion records for merged milestones
- `adr/` — architecture decision records

### Domain Boundary

MIE is a research, forecasting, expected-value analysis, and calibration platform. It is **not**
a brokerage, portfolio manager, or execution system — see
[`adr/0008-mie-domain-boundary.md`](adr/0008-mie-domain-boundary.md).

**Recommendations are not execution instructions.** MIE holds no brokerage credentials, submits
no orders live or paper, and manages no positions or portfolio state. Any future trading
capability is a separate bounded system requiring its own ADR, threat model, credentials, and
deployment approval.

### Design Contract

MIE inherits the canonical Audio Jones / AJ Digital **Editorial Intelligence Systems** design
language. It does not define an independent visual identity. These documents are binding:

- `docs/design/DESIGN_SYSTEM_SNAPSHOT.md` — controlled read-only snapshot of the canonical system
- `docs/design/MIE_DESIGN_ADAPTATION.md` — domain semantics for prediction-market analysis
- `docs/design/DATA_VISUALIZATION_STANDARD.md` — chart rules
- `docs/design/ANALYST_REPORT_STANDARD.md` — report structure (**binding for the MVP**)

**Ratified 2026-08-01** (ADR-0007). These documents are MIE's binding visual contract: MIE may
define domain-specific semantic mappings but may not invent an independent palette, typography
system, spacing system, or component language.

The MVP remains frontend-free. The report standard binds today because the report is the
product surface.

## Repository Layout

Top-level directories (root config files omitted):

```text
market-intelli-engine/
├── README.md
├── docs/          # canonical specification, milestone records, design contract
├── adr/           # architecture decision records
├── database/      # Supabase migrations
├── services/      # runtime service boundaries (providers/ implemented)
├── workflows/     # scheduled workflow definitions (not yet populated)
├── scripts/       # utility scripts (not yet populated)
├── prompts/       # versioned prompt registry (not yet populated)
├── reports/       # report templates and generated output (not yet populated)
├── tests/         # Vitest suites
└── .github/       # CI workflow
```

The canonical structure, including planned `services/` subdirectories, is defined in
[`docs/02-ARCHITECTURE.md`](docs/02-ARCHITECTURE.md).

## Getting Started

Requires Node.js. `package.json` declares `engines.node` as `>=20.0.0`; CI runs Node 24, so
match CI when in doubt.

```bash
npm install
cp .env.example .env   # then fill in the required values
npm run verify
```

`npm run verify` chains the four gates CI enforces on every pull request and on every push to
`main`: `typecheck`, `lint`, `format`, and `test`. A change is not ready to merge until it
passes.

`.env.example` enumerates the environment variables the specification requires — see
`docs/04-API-SPEC.md`. No runtime code reads them yet. `.env` itself is git-ignored and must
never be committed.

> Note for Windows contributors: the repository has no `.gitattributes`, so with
> `core.autocrlf=true` files are checked out with CRLF and the Prettier `format` gate can fail
> locally on files you did not touch. CI checks out LF and is the authoritative result.

## Current Status

Milestones 01–05 of the 32-milestone plan in
[`docs/15-CODEX-BUILD-PLAN.md`](docs/15-CODEX-BUILD-PLAN.md) are merged:

- **01–02** — repository structure and tooling baseline
- **03** — Supabase baseline migration
- **04** — provider interface contracts
- **05** — read-only Kalshi market provider

Nothing downstream of the provider layer is implemented yet: no ingestion, ranking, research,
probability estimation, EV calculation, reporting, ledger, or calibration. Each remaining
milestone must satisfy the Definition of Ready before implementation begins.