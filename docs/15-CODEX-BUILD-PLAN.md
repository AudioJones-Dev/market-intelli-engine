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

### Milestone 15 — Counterargument stage

Generate opposing case and missing evidence summary.

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
```