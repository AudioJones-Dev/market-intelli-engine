---
title: 'MIE Analyst Report Standard'
status: 'binding — applies to MVP output'
version: '1.0.0'
inherits: 'docs/design/DESIGN_SYSTEM_SNAPSHOT.md'
---

# Analyst Report Standard

The report **is** the MIE product surface for the MVP. There is no frontend
(`docs/00-VISION.md`, `docs/01-PRD.md`), so this document binds today — it is not deferred.

Reports satisfy US-006 and US-007 in `docs/01-PRD.md` and are produced by Milestones 18 and 24
in `docs/15-CODEX-BUILD-PLAN.md`.

## 1. Principles

1. **The report must be readable without the system.** A reader with no access to the database
   must be able to follow the argument and check it. Every claim carries its source.
2. **Epistemic status is explicit, always.** The reader must never have to guess whether a
   sentence is a fact, an assumption, an inference, speculation, or opinion (§4).
3. **Structure is stable across runs.** Same headings, same order, same tables, every day. An
   analyst comparing Tuesday to Wednesday should be diffing content, not layout.
4. **Plain text is the substrate.** Markdown has no color. Every status must survive as text
   (`MIE_DESIGN_ADAPTATION.md` §2.2). This constraint is a feature — it forces the semantics to
   be real rather than decorative.
5. **Uncertainty is never smoothed away.** Ranges, low confidence, missing evidence, and partial
   runs are stated at the point of use, not buried in a footer.
6. **No recommendation is an instruction.** The system produces analysis; a human decides
   (`docs/00-VISION.md` constitution §6).

## 2. Location and Naming

Per `reports/README.md`, generated output lives under `reports/generated/` (git-ignored).
Templates live under `reports/templates/`.

```text
reports/
├── templates/
│   ├── daily-report.md
│   ├── market-dossier.md
│   ├── weekly-calibration.md
│   └── settlement-postmortem.md
└── generated/                        # git-ignored
    ├── daily/2026-07-31-daily.md
    ├── dossiers/2026-07-31-KXPRES-24.md
    ├── calibration/2026-W31-calibration.md
    └── postmortems/KXPRES-24-postmortem.md
```

Naming: `YYYY-MM-DD` for daily, ISO week `YYYY-Www` for weekly, ticker for dossiers and
postmortems. Sortable, greppable, collision-free.

## 3. Markdown Report Structure — MVP

### 3.1 Universal front matter

Every generated report opens with a machine-readable block. This is the report's provenance
record and satisfies the reproducibility requirement in `docs/01-PRD.md`.

```yaml
---
report_type: daily | weekly_calibration | dossier | postmortem
report_date: 2026-07-31
generated_at: 2026-07-31T06:14:22-04:00
snapshot_at: 2026-07-31T06:00:00-04:00 # data timestamp, NOT render time
workflow_run_id: <uuid>
workflow_status: succeeded | partial # partial requires §3.3
market_provider: kalshi
research_provider: perplexity
versions:
  prompt: <version>
  model: <model-id>
  scoring: <version>
  ranking: <version>
price_basis: conservative_ask | midpoint | last
markets_ingested: <n>
markets_ranked: <n>
markets_researched: <n>
---
```

`snapshot_at` and `generated_at` are distinct fields and must never be collapsed.

### 3.2 Daily report — canonical section order

```markdown
# Daily Market Intelligence — 2026-07-31

> Analysis only. No position is recommended or executed. Human review required.

## Run Summary

## Buy Candidates

## Watch

## Passed and Why

## Market Dossiers

## Risk Register

## Methodology Manifest

## Source Appendix
```

Order is fixed. Rationale: the reader gets run integrity first (can I trust this run?), then
the actionable few, then the reasoning, then the audit trail.

**Run Summary** — counts, status, and any degradation. If nothing is actionable, say so plainly:
"No markets met `buy_candidate` criteria." A report with no candidates is a successful report.

**Buy Candidates / Watch** — the summary table, column order fixed by
`MIE_DESIGN_ADAPTATION.md` §5:

```markdown
| Ticker      | Question                        | Mkt Prob | Est Prob |    Edge |       EV | Conf | Grade | Rec             |
| ----------- | ------------------------------- | -------: | -------: | ------: | -------: | ---: | :---: | --------------- |
| `KXPRES-24` | Will X occur before 2026-11-05? |   `0.49` |   `0.62` | `+0.13` | `+0.082` | `74` |  `B`  | `BUY CANDIDATE` |
```

Numerics in backticks (mono when rendered), right-aligned, at the precision fixed in
`MIE_DESIGN_ADAPTATION.md` §3.2.

**Passed and Why** — required, not optional. The passed set is where the ranking engine's
judgment is auditable. One line per market with the disqualifying reason.

### 3.3 Partial-run labeling

When `workflow_status: partial`, the report must:

1. State it in **Run Summary**, naming which stages or markets are missing and why.
2. Mark every affected value **inline** with `[PARTIAL]` at the point of use.
3. Never silently omit an affected market from a table — include the row with `—` and a reason.

A reader landing mid-document must be unable to mistake partial output for complete output
(`docs/05-WORKFLOWS.md`; `MIE_DESIGN_ADAPTATION.md` §11).

### 3.4 Market dossier structure

One per researched market. Inline in the daily report for candidates; separate file for
full dossiers.

```markdown
### `KXPRES-24` — Will X occur before 2026-11-05?

**Recommendation:** `BUY CANDIDATE` · **Grade:** `B` · **Confidence:** `74` (MODERATE)

|                            |                       Value |
| -------------------------- | --------------------------: |
| Market-implied probability |                      `0.49` |
| Estimated probability      |        `0.62` `[0.48–0.71]` |
| Edge                       |                     `+0.13` |
| Expected value             |                    `+0.082` |
| Price basis                |          `conservative_ask` |
| Closes                     | `2026-11-05T23:59:00-05:00` |

#### Settlement Rules

#### Epistemic Summary

#### Evidence For

#### Evidence Against

#### Unknowns and Missing Evidence

#### Probability Reasoning

#### Red-Team Objections

#### Invalidation Conditions

#### Risk Flags
```

**Settlement Rules comes first.** If the resolution criteria are ambiguous, that finding
outranks the probability estimate and must be encountered before it
(`MIE_DESIGN_ADAPTATION.md` §9):

```markdown
#### Settlement Rules

**[RULE AMBIGUITY]** The contract does not define whether <term> includes <case>.
Live interpretations:

1. <interpretation A> — implies resolution YES under current facts.
2. <interpretation B> — implies resolution NO under current facts.

This ambiguity is not resolved by available evidence. Estimates below assume
interpretation (1); under (2) the estimate would be approximately `0.20`.
```

A market carrying `[RULE AMBIGUITY]` may not be presented as `BUY CANDIDATE` regardless of
computed EV.

## 4. Epistemic Labeling — Facts, Assumptions, Inference, Speculation, Opinion

`docs/01-PRD.md` US-006 requires the report to distinguish **five** categories. Every
substantive claim carries exactly one label.

| Label           | Definition                                                 | Requirement                                                                     |
| --------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `[FACT]`        | Verifiable claim about the world, attributable to a source | **Must** carry a source reference                                               |
| `[ASSUMPTION]`  | Taken as true to proceed; not established                  | **Must** state what breaks if false                                             |
| `[INFERENCE]`   | Derived from stated facts by explicit reasoning            | **Must** name the facts it derives from                                         |
| `[SPECULATION]` | Plausible but unsupported                                  | **Must not** influence the probability estimate; if it did, it is an assumption |
| `[OPINION]`     | Judgment call, including analyst/model preference          | **Must** be attributable to the system, not to a source                         |

```markdown
- `[FACT]` Agency Y published Z on 2026-07-12. [S3]
- `[INFERENCE]` Given [S3] and the 90-day statutory window, the decision falls before 2026-10-10.
- `[ASSUMPTION]` No extension is granted. Historical base rate ~15%; if granted, estimate drops to ~0.40.
- `[SPECULATION]` Reporting suggests internal disagreement, but no source confirms it. Not weighted.
- `[OPINION]` The market appears to underweight the statutory deadline.
```

Rules:

- **Unlabeled prose is prohibited** in analytical sections. Narrative framing sentences are
  permitted only in Run Summary.
- A `[FACT]` without a source reference is a defect, not a style issue.
- `[SPECULATION]` may never appear in the probability reasoning chain.
- Where the model cannot classify a claim, it is `[SPECULATION]` by default. Uncertainty
  resolves downward, never upward.

## 5. Evidence For / Against Layout

Both sections use **identical structure, identical formatting, identical ordering rules**. No
visual or structural asymmetry (`MIE_DESIGN_ADAPTATION.md` §6). Disconfirming evidence is
normal research output.

```markdown
#### Evidence For

| #   | Claim                                      | Status            | Source   | Published    |   Age | Quality |
| --- | ------------------------------------------ | ----------------- | -------- | ------------ | ----: | ------: |
| E1  | `[FACT]` Agency Y published Z              | `VERIFIED`        | [S3]     | `2026-07-12` | `19d` |    `82` |
| E2  | `[FACT]` Precedent case resolved similarly | `CORROBORATED ×2` | [S1][S5] | `2026-06-02` | `59d` |    `71` |

#### Evidence Against

| #   | Claim                                         | Status         | Source | Published    |    Age | Quality |
| --- | --------------------------------------------- | -------------- | ------ | ------------ | -----: | ------: |
| C1  | `[FACT]` Statutory extension provision exists | `VERIFIED`     | [S2]   | `2026-05-30` |  `62d` |    `88` |
| C2  | `[FACT]` Two prior cases were extended        | `STALE · 210d` | [S7]   | `2026-01-02` | `210d` |    `54` |
```

- Status values are fixed by `MIE_DESIGN_ADAPTATION.md` §6.
- Every row carries a bracketed source reference resolving to the Source Appendix (§9).
- Age is always shown alongside the absolute date.
- **If Evidence Against is empty, that is a finding, not a blank section.** Render:
  "No disconfirming evidence was found. This is unusual and may indicate incomplete
  research rather than a one-sided case." An empty counterevidence section without this
  note is a defect — it is precisely the failure mode `docs/01-PRD.md` risk table calls out.

## 6. Forecast, Range, and Market Comparison

```markdown
#### Probability Reasoning

**Estimate:** `0.62` · **Range:** `[0.48–0.71]` · **Confidence:** `74` (MODERATE)
**Range basis:** scenario spread across the three interpretations in Settlement Rules.

`[INFERENCE]` Base rate for this contract class is ~0.45 [S8]. Evidence E1 and E2 shift
upward; C1 and C2 bound the upside. ...

#### Market Comparison

|                            |              Value |
| -------------------------- | -----------------: |
| Market-implied probability |             `0.49` |
| Estimated probability      |             `0.62` |
| Edge                       |            `+0.13` |
| Expected value             |           `+0.082` |
| Basis                      | `conservative_ask` |

`[INFERENCE]` Edge of `+0.13` exceeds the `0.08` threshold at confidence `74`
(`docs/08-SCORING.md`), yielding `BUY CANDIDATE`.
```

Rules:

- **The range's basis must always be stated.** An unlabeled interval will be read as a
  credible interval (`DATA_VISUALIZATION_STANDARD.md` §6).
- Where confidence is `LOW`, the range is required.
- Where no range was computed, write "no interval computed" — never imply one.
- Probability and confidence never share a format (`MIE_DESIGN_ADAPTATION.md` §8).
- **YES and NO receive equivalent treatment.** Never write "good news for YES." State the
  probability and the edge.

## 7. Red-Team Objections

Required for every `buy_candidate`. A candidate with no recorded objection has not been
tested.

```markdown
#### Red-Team Objections

**O1 — The base rate is doing all the work.**
`[OPINION]` E1 and E2 may be reworded restatements of the same underlying event.
If so, effective corroboration is 1, not 2, and the estimate should fall toward `0.52`.
**Status:** unresolved. **Would resolve by:** independent confirmation from a non-[S3] source.

**O2 — Extension precedent is undercounted.**
`[FACT]` C2 is `STALE · 210d` and was down-weighted. `[OPINION]` If the extension regime
changed after 2026-01, C2 may be more relevant than its age suggests.
**Status:** unresolved. **Would resolve by:** checking for regime change post-2026-01.
```

- Minimum one objection per `buy_candidate`. "No objections found" is not acceptable output;
  if the model produces none, the report records `RED-TEAM STAGE PRODUCED NO OBJECTIONS` as a
  **quality defect flag**, which is itself a finding.
- Each objection states its **status** and **what would resolve it**.
- Objections are never rebutted away silently. An objection judged unpersuasive is marked
  `addressed` with the reasoning shown.

## 8. Invalidation Conditions

Required for every forecast (`docs/01-PRD.md` US-004). These are the forecast's falsifiers and
are what makes it a hypothesis rather than an opinion.

```markdown
#### Invalidation Conditions

This forecast should be revised or withdrawn if:

1. An extension is granted before `2026-10-10`. → estimate falls to approximately `0.40`.
2. [S3] is retracted or materially corrected. → estimate reverts toward base rate `0.45`.
3. The settlement ambiguity resolves toward interpretation (2). → estimate falls to `0.20`.
4. No decision is published by `2026-10-25`. → confidence drops below `65`; re-grade to `WATCH`.
```

Each condition states the **trigger** and the **expected effect on the estimate**. A condition
without a stated effect is not actionable.

## 9. Source Appendix

```markdown
## Source Appendix

| Ref | Title | Publisher | URL   | Published    | Retrieved    | Quality | Status         |
| --- | ----- | --------- | ----- | ------------ | ------------ | ------: | -------------- |
| S1  | ...   | ...       | <url> | `2026-06-02` | `2026-07-31` |    `71` | `VERIFIED`     |
| S7  | ...   | ...       | <url> | `2026-01-02` | `2026-07-31` |    `54` | `STALE · 210d` |
| S9  | ...   | ...       | <url> | —            | `2026-07-31` |       — | `UNVERIFIABLE` |
```

- Every bracketed reference in the body resolves here. Unresolved references are a defect.
- **Failed sources are listed, never dropped.** Omitting `UNVERIFIABLE` sources overstates
  evidence strength (`DATA_VISUALIZATION_STANDARD.md` §17).
- Both `Published` and `Retrieved` are required; a missing publication date renders `—` and
  caps the source's quality band.

## 10. Methodology Manifest

Closes every report. Makes the run reproducible from the document alone.

```markdown
## Methodology Manifest

| Component                 | Version / Setting                                       |
| ------------------------- | ------------------------------------------------------- |
| Ranking engine            | `v1.2.0`                                                |
| Research prompt           | `research/market-evidence@v3`                           |
| Probability prompt        | `analysis/probability@v5`                               |
| Red-team prompt           | `analysis/counterargument@v2`                           |
| Model                     | `<model-id>`                                            |
| Scoring formulas          | `docs/08-SCORING.md` @ `v1.1.0`                         |
| Price basis               | `conservative_ask`                                      |
| Recency window            | `90d`                                                   |
| EV formula                | `EV = (p × (1 − price)) − ((1 − p) × price)`            |
| Recommendation thresholds | `edge ≥ 0.08 ∧ conf ≥ 70 ∧ grade ∈ {A,B,C}`             |
| Anchoring control         | price withheld from probability stage: `true` / `false` |
| Workflow run              | `<uuid>`                                                |
| Snapshot                  | `2026-07-31T06:00:00-04:00`                             |
```

The **anchoring control** field is required. `docs/02-ARCHITECTURE.md` §7 specifies an analysis
mode where the model sees evidence before price; whether that mode was active materially changes
how much independent signal the estimate carries, and the reader must be told.

## 11. Weekly Calibration Report

Sections fixed by `docs/09-CALIBRATION.md`.

```markdown
# Weekly Calibration — 2026-W31

## Summary

## Calibration by Bucket

## Best and Weakest Categories

## Largest Misses

## Repeated Evidence Gaps

## Recommended Prompt / Model Changes

## Methodology Manifest
```

```markdown
## Calibration by Bucket

| Bucket    |    n | Mean Forecast | Observed Rate | Deviation | Note                        |
| --------- | ---: | ------------: | ------------: | --------: | --------------------------- |
| `0.0–0.1` | `14` |        `0.06` |        `0.07` |   `+0.01` |                             |
| `0.6–0.7` |  `3` |        `0.64` |        `0.33` |   `-0.31` | `LOW n — not interpretable` |
```

- **Sample size `n` is mandatory per bucket** and buckets below the minimum are marked
  `LOW n — not interpretable` and excluded from trend claims
  (`DATA_VISUALIZATION_STANDARD.md` §9).
- Deviation is signed. Positive = underconfident, negative = overconfident. Both are labeled
  in words; neither is framed as good or bad.
- Brier scores are reported **against a stated baseline** — an unreferenced Brier is
  uninterpretable (`DATA_VISUALIZATION_STANDARD.md` §10).
- **Confidence calibration is reported separately from probability calibration**
  (`docs/09-CALIBRATION.md`): are confidence-80+ forecasts actually more reliable than
  confidence 60–70?

## 12. Settlement Postmortem

Answers the six questions in `docs/09-CALIBRATION.md`.

```markdown
# Postmortem — `KXPRES-24`

|                        |                       Value |
| ---------------------- | --------------------------: |
| Forecast probability   |                      `0.62` |
| Outcome                |                    `NO` (0) |
| Brier score            |                    `0.3844` |
| Confidence at forecast |                        `74` |
| Settled                | `2026-11-06T09:00:00-05:00` |

## What We Predicted

## What Happened

## Which Evidence Mattered Most

## What Was Missing or Overweighted

## Wrong, or a Reasonable Probabilistic Miss?

## What Should Change
```

The fifth section is the one that matters and the easiest to get wrong. A `0.62` forecast on
an event that did not occur is **not necessarily an error** — it is expected 38% of the time.
The postmortem must distinguish:

- **Process error** — evidence was available and missed, reasoning was flawed, a red-team
  objection was dismissed wrongly. → actionable.
- **Probabilistic miss** — the process was sound and the low-probability branch occurred.
  → not actionable; over-correcting here degrades calibration.

Conflating these is the primary way a calibration loop makes a system worse. The postmortem
states which one it was, and why.

Outcomes are reported neutrally. No celebratory or self-critical framing
(`MIE_DESIGN_ADAPTATION.md` §13).

## 13. Future HTML / PDF Mapping

> Deferred. Requires ADR approval (`docs/14-ADR.md`; ADR-0006 fixes Markdown-first for MVP).

When rendered formats are approved, the Markdown structure maps directly — the Markdown is the
canonical content model and rendering adds presentation only:

| Markdown element    | Dark (screen)                                | Paper (print / export)           |
| ------------------- | -------------------------------------------- | -------------------------------- |
| `#` / `##` / `###`  | Syne, `--text-primary`                       | Syne, `--ink`                    |
| Body prose          | DM Sans, `--text-primary`                    | DM Sans, `--ink`                 |
| Backticked numerics | DM Mono, tabular                             | DM Mono, tabular                 |
| Table header        | `--surface-2`, mono uppercase                | `--surface-soft`, mono uppercase |
| Table rows          | dividers `--border-subtle` only              | dividers `--border-light` only   |
| `[FACT]` etc.       | mono label, `--text-muted`                   | mono label, `--ink-muted`        |
| `BUY CANDIDATE`     | `--signal` + text                            | **text only** — see below        |
| `[RULE AMBIGUITY]`  | `--danger` + text                            | **text + rule** — see below      |
| Front matter        | not rendered; surfaced as a provenance block | same                             |

**Paper-mode constraint — binding.** The inherited accent palette fails contrast on `--paper`
(`DESIGN_SYSTEM_SNAPSHOT.md` §5.2; signal-yellow measures **1.06:1**, effectively invisible).
Therefore on paper surfaces:

- Accents may be used **only** as fills, rules, and area marks that carry a redundant text label.
- Accents may **never** be text, thin strokes, or the sole encoding of meaning.
- All paper text is `--ink` / `--ink-muted`.
- Status is carried by **type weight, rules, and text**, not hue.

MIE must not invent paper-mode accent variants (snapshot §4). Upstream decision D-2 is required
before accent-bearing paper exports ship.

**Paper-mode editorial layout** — inherited editorial rules apply: Syne headings, DM Sans body at
generous leading, copy column capped at `--copy-max`, selective `<hr>` dividers, at most one
pull-quote per dossier. Tables may use full width. Print requirements: page breaks never split a
table row or an evidence item from its source reference; the provenance block repeats in the
running footer; URLs print in full in the Source Appendix rather than as bare link text.

## 14. Conformance Checklist

A report ships only when:

- [ ] Front matter complete; `snapshot_at` distinct from `generated_at` (§3.1)
- [ ] Section order matches §3.2 exactly
- [ ] Every substantive claim carries one of the five epistemic labels (§4)
- [ ] Every `[FACT]` resolves to a Source Appendix entry (§4, §9)
- [ ] Evidence For and Against are structurally identical; empty counterevidence is annotated (§5)
- [ ] Range basis stated, or "no interval computed" (§6)
- [ ] Every `buy_candidate` has ≥1 red-team objection with status (§7)
- [ ] Every forecast has invalidation conditions with stated effects (§8)
- [ ] Failed and unverifiable sources listed, not dropped (§9)
- [ ] Methodology Manifest present, including anchoring-control state (§10)
- [ ] Partial runs labeled inline at every affected value (§3.3)
- [ ] `[RULE AMBIGUITY]` precedes any estimate it undermines; no such market shown as candidate (§3.4)
- [ ] Calibration buckets carry `n`; low-`n` buckets excluded from trend claims (§11)
- [ ] YES/NO and evidence-for/against treated equivalently throughout
- [ ] No prohibited pattern (`MIE_DESIGN_ADAPTATION.md` §13)
