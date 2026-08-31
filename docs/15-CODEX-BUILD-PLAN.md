# 15 — Codex Build Plan

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft

## Codex Execution Rule

Do not ask Codex to build the entire project in one prompt.

Codex should execute small, reviewable milestones. Each milestone must satisfy Definition of Ready before implementation and Definition of Done before merge.

## Milestone Template

```md
# Milestone XX — Title

## Objective

## Scope

## Explicit Non-Goals

## Files to Create/Modify

## Dependencies

## Acceptance Criteria

## Tests

## Definition of Done

## Definition of Stable
```

## Phase 0 — Repository Foundation

### Milestone 01 — Repository structure

Create baseline folders:

- `docs/`
- `adr/`
- `database/migrations/`
- `prompts/`
- `services/`
- `workflows/`
- `reports/`
- `scripts/`
- `tests/`

Acceptance criteria:

- Structure exists.
- README references docs.
- No implementation logic yet.

### Milestone 02 — Tooling baseline

Add formatting, linting, testing framework, environment example, and ignore files.

### Milestone 03 — Supabase baseline migration

Create initial schema migration for core tables.

### Milestone 04 — Provider interfaces

Implement market, research, model, and delivery provider interfaces.

## Phase 1 — Ingestion

### Milestone 05 — Kalshi provider

Implement `KalshiProvider` for market listing and market detail retrieval.

### Milestone 06 — Market snapshot persistence

Store raw and normalized market snapshots.

### Milestone 07 — Ingestion workflow

Create scheduled/manual ingestion job with workflow run logging.

## Phase 2 — Ranking and Research

### Milestone 08 — Market ranking engine

Implement deterministic filtering and opportunity score.

### Milestone 09 — Research queue persistence

Store ranked market candidates.

### Milestone 10 — Perplexity provider

Implement research provider wrapper.

### Milestone 11 — Research dossier storage

Store raw and normalized research output.

### Milestone 12 — Evidence normalizer

Convert research output into canonical evidence schema.

## Phase 3 — Analysis

### Milestone 13 — Prompt registry

Implement prompt loading/versioning.

### Milestone 14 — Probability engine

Generate structured probability estimates.

### Milestone 15 — Counterargument and ACH stage

Generate the ACH matrix and the opposing case. Procedure: `docs/21-ACH-PROCEDURE.md`.

**Unblocked.** This milestone was previously blocked on decision D-6 — ACH presentation was
specified with no procedure behind it. The procedure now exists.

Scope:

- `MIE-ACH-MATRIX` prompt producing hypotheses and consistency cells only.
- **Deterministic post-processing outside the model:** diagnosticity, weighted inconsistency,
  coverage, sensitivity. The model supplies judgements; the arithmetic must not be an LLM output.
- Persist the full matrix — every cell, including non-diagnostic and excluded rows — referencing
  evidence IDs and source provenance.

Acceptance criteria:

- ≥3 and ≤7 hypotheses, each tagged `YES` / `NO` / `AMBIGUOUS`.
- Hypotheses enumerated before any probability estimate is visible to the agent.
- A settlement-ambiguity hypothesis is present where resolution criteria are contestable.
- Non-diagnostic items retained and marked, never dropped.
- Coverage computed; `LOW COVERAGE` leaders flagged and barred from being reported as the leader
  unedited.
- Sensitivity analysis identifies critical evidence, which propagates into the forecast's
  invalidation conditions.
- **No code path converts inconsistency scores into a probability.** Add a test asserting this.
- Fewer than three defensible hypotheses returns insufficient rather than a padded set.

### Milestone 16 — EV calculator

Calculate market probability, edge, and EV.

### Milestone 17 — Recommendation engine

Apply rule-based recommendation labels.

## Phase 4 — Reporting

### Milestone 18 — Daily report generator

Generate Markdown daily report.

**Presentation requirements — binding.** The report is the MVP product surface, so
`docs/design/ANALYST_REPORT_STANDARD.md` is an acceptance contract for this milestone, not a
style guide. Required:

- Universal front matter with `snapshot_at` distinct from `generated_at` (§3.1).
- Fixed section order (§3.2) and fixed table column order (§3.2).
- Fixed numeric precision per quantity type (`MIE_DESIGN_ADAPTATION.md` §3.2).
- All five epistemic labels — `[FACT]` / `[ASSUMPTION]` / `[INFERENCE]` / `[SPECULATION]` /
  `[OPINION]` — applied to every substantive claim, satisfying `docs/01-PRD.md` US-006 (§4).
- Every `[FACT]` resolving to a Source Appendix entry; failed sources listed, never dropped (§9).
- Evidence For and Against structurally identical; empty counterevidence explicitly annotated (§5).
- `[RULE AMBIGUITY]` rendered above any estimate it undermines; such markets never presented as
  `buy_candidate` (§3.4).
- Invalidation conditions with stated effects for every forecast (§8).
- Methodology Manifest including the anchoring-control state (§10).
- Partial runs labeled inline at every affected value, not only in the header (§3.3).
- YES/NO given equivalent treatment; no outcome-directional coloring or framing (§6).

Acceptance: a generated report passes the §14 conformance checklist.

### Milestone 19 — Prediction ledger

Persist immutable forecast records.

### Milestone 20 — Decision journal

Persist reasoning summary and retrospective placeholder.

## Phase 5 — Outcomes and Calibration

### Milestone 21 — Settlement lookup

Fetch/update settled market outcomes.

### Milestone 22 — Outcome persistence

Store settlement records.

### Milestone 23 — Calibration scoring

Calculate Brier score and buckets.

### Milestone 24 — Weekly calibration report

Generate weekly calibration report.

**Presentation requirements — binding**
(`docs/design/ANALYST_REPORT_STANDARD.md` §11, §12):

- Per-bucket sample size `n` is mandatory; buckets below the minimum are marked
  `LOW n — not interpretable` and excluded from trend claims.
- Deviation is signed and labeled in words (underconfident / overconfident). Neither is framed
  as good or bad, and neither is color-coded.
- Brier scores are reported against a stated baseline.
- Confidence calibration is reported separately from probability calibration.
- Settlement postmortems distinguish **process error** from **reasonable probabilistic miss**
  (§12). Conflating them degrades calibration and is a correctness defect.

## Phase 3.5 — Governance and Reproducibility

These milestones are prerequisites for treating any recommendation as auditable. They are
sequenced after the analysis phase because they record what that phase produces, and before
reporting because reports must surface manifest and version state.

### Milestone 17a — Domain-boundary ratification

Ratify `adr/0008-mie-domain-boundary.md`. No code. Acceptance: ADR approved; `README.md`,
`docs/02-ARCHITECTURE.md`, `docs/06-AGENTS.md`, `docs/10-SECURITY.md`, and `docs/13-ROADMAP.md`
reference the boundary; no broker credential or execution adapter exists in the repository.

### Milestone 17b — Scoring-layer separation

Split the combined `recommendations` table into `forecasts`, `economic_scores`, and
`recommendation_records` (`docs/03-DATA-MODEL.md`).

**Requires an ADR and a migration** — the baseline migration
`database/migrations/0001_initial_schema.sql` has shipped with the combined shape, and
`prediction_ledger` holds an FK to `recommendation_id`, so the old table cannot simply be
dropped.

Acceptance:

- A forecast can be written with **no market price present**.
- Every economic score references a `market_snapshot_id`.
- Each layer carries its own version column.
- No combined "master score" column exists.

### Milestone 17c — Component versioning and registry

Implement `component_versions` and `promotion_records`. Every decision-producing component
resolves to an explicit version. Acceptance: no component resolves via `latest`, `current`, or
`production`; unversioned components are treated as `suspended`.

### Milestone 17d — Agent execution records

Implement `agent_executions`, written **per invocation**. Acceptance: a retried stage produces
multiple rows; prompt, model, schema, and lifecycle state are captured on each.

### Milestone 17e — Source provenance and content hashing

Promote sources from `jsonb` to addressable `source_provenance` rows with content hashes.
Acceptance: every `[FACT]` in a report resolves to a provenance row
(`docs/design/ANALYST_REPORT_STANDARD.md` §9); unverifiable sources are recorded, never dropped.

### Milestone 17f — Decision manifests

Implement `decision_manifests` and emit one per recommendation. Acceptance: the ten-point
Minimum Reproducibility Test (`docs/18-DECISION-REPRODUCIBILITY.md`) passes for any
recommendation ID; a recommendation without a manifest is suppressed rather than published.

### Milestone 17g — Promotion-state enforcement

Gate every decision-producing stage on lifecycle state (`docs/05-WORKFLOWS.md` § Component
Gating). Acceptance: `shadow` output never reaches a report; `suspended` components fail closed
and produce no fallback; the run degrades to `partial` and labels affected values inline.

### Milestone 17h — Governance tests

Automated tests, run in CI, asserting:

1. No version field contains `latest`, `current`, or `production`.
2. Every recommendation has a complete decision manifest.
3. Forecast records validate with no price present.
4. Every economic score references a market snapshot.
5. Calibration inputs exclude price, edge, EV, and realized EV.
6. No schema field represents contract quantity, capital, balance, or open position
   (domain-boundary tripwire).
7. No dependency provides brokerage or order-routing capability.
8. Unapproved or unversioned components cannot execute in a production workflow path.

Tests 6 and 7 are the executable form of the domain boundary. A boundary asserted only in prose
is one that erodes without anyone noticing.

## Phase 6 — Operations

### Milestone 25 — Observability baseline

Add logs, workflow metrics, and status records.

### Milestone 26 — Error taxonomy

Standardize error classes and failure records.

### Milestone 27 — Deployment configuration

Add environment config and deployment instructions.

### Milestone 28 — Runbooks

Add runbooks for ingestion, research, reporting, and settlement failures.

## Phase 7 — Hardening

### Milestone 29 — Contract tests

Add provider contract tests.

### Milestone 30 — Prompt tests

Add prompt fixture tests for required schemas.

### Milestone 31 — Replay test harness

Run analysis against stored fixtures.

### Milestone 32 — Definition of Stable observation

Document first production observation window.

## Deferred Milestones

Do not implement until ADR approved:

- Frontend dashboard.
- Slack/email/Obsidian delivery beyond Markdown storage.
- Multi-provider markets.
- Additional research providers.
- Kelly sizing.
- Trade execution.
- Shared design-system package.
- HTML/PDF report rendering.
- Live data visualization.

### Deferred — Analyst Interface

**Blocked by the frontend ADR gate** (`docs/14-ADR.md`). Listed so scope is bounded in advance,
not to authorize work. Surfaces, in the order `docs/13-ROADMAP.md` would sequence them:

market candidate inbox · contract-rules viewer · evidence timeline · source-quality matrix ·
ACH hypothesis table · forecast probability history · market-price comparison ·
red-team objections · human decision gate · calibration dashboard · settlement postmortems

All must consume `docs/design/DESIGN_SYSTEM_SNAPSHOT.md` tokens without local additions, and
satisfy `MIE_DESIGN_ADAPTATION.md` §§8–10 (confidence presentation, rule ambiguity, approval
controls). The ACH hypothesis table is additionally blocked on the missing MIOS methodology
(decision D-6).

### Deferred — F-04: Visual Regression Testing

**Required before any UI milestone is DONE.** Deferred with the frontend, specified now so the
requirement is not negotiated under delivery pressure.

Scope when a frontend ADR is approved:

1. **Token-drift test.** Assert that every design token consumed by MIE matches
   `DESIGN_SYSTEM_SNAPSHOT.md` §3 exactly. Fails on any local addition, edit, or re-mapping.
   This is the enforcement mechanism for the prohibition in `docs/16-GOVERNANCE.md` and must run
   even for non-visual changes.
2. **Contrast test.** Automated WCAG check asserting criteria A-1, A-2, A-3
   (`MIE_DESIGN_ADAPTATION.md` §12.2) against actual rendered surfaces. Computed, not asserted.
3. **Screenshot baselines** for each analyst surface, at minimum 390px / 768px / 1280px, in dark
   and paper modes. Diffs require human review; baselines are never auto-updated.
4. **Greyscale render test** — every chart must remain interpretable desaturated
   (`DATA_VISUALIZATION_STANDARD.md` §12).
5. **Reduced-motion snapshot** — assert no animation on data regions and full legibility with
   `prefers-reduced-motion: reduce`.
6. **Chart conformance lint** — axis range, provenance block presence, textual-alternative
   presence (`DATA_VISUALIZATION_STANDARD.md` §18).
7. **Report conformance test** — applies **now**, not deferred: assert the
   `ANALYST_REPORT_STANDARD.md` §14 checklist against generated Markdown (front matter fields,
   section order, epistemic labels, unresolved source references, unlabeled partial values).

## Codex Prompt Seed

```text
You are implementing Market Intelligence Engine (MIE). Follow the repository specification exactly. Do not add speculative features. Do not implement trading. Before coding, verify the milestone satisfies Definition of Ready. After coding, verify acceptance criteria and tests. If the spec is ambiguous, stop and request clarification instead of inventing architecture.

Design constraints: MIE inherits the Audio Jones / AJ Digital design system and defines no visual identity of its own. Do not introduce colors, fonts, spacing steps, radii, or component conventions that are not in docs/design/DESIGN_SYSTEM_SNAPSHOT.md. Do not use raw hex values. Do not build a frontend — it is gated behind an ADR. When generating reports, docs/design/ANALYST_REPORT_STANDARD.md is an acceptance contract, not a style guide. Never map YES to green and NO to red. If a value you need does not exist upstream, stop and raise it rather than inventing one.

Domain boundary: MIE is research, forecasting, expected-value analysis, and calibration. Do not add brokerage credentials, order submission (live or paper), position sizing, portfolio state, or any field representing contract quantity, capital, account balance, or open position. EV is analysis; sizing is execution. A recommendation is not an instruction. See adr/0008-mie-domain-boundary.md.

Governance: keep the four analytical layers separate — probability estimation, forecast calibration, economic scoring, recommendation policy — each independently versioned. Never build a combined master score. A forecast must be storable with no market price present. Calibration takes the forecast and outcome only, never price or profit. Every recommendation emits a decision manifest; no version field may contain "latest", "current", or "production". Every decision-producing component carries a lifecycle state; only approved components affect official output, and suspended components fail closed with no fallback. Agents propose changes; only a recorded human approval promotes one.
```