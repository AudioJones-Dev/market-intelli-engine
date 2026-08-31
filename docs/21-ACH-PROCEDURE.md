# 21 — Analysis of Competing Hypotheses (ACH) Procedure

**Project:** Market Intelligence Engine (MIE)
**Version:** 0.1 specification draft
**Adopted from:** MIOS Layer 5 (`docs/20-MIOS-METHODOLOGY.md`)
**Closes:** decision D-6

## Purpose

Define the executable ACH procedure: how hypotheses are enumerated, how consistency is scored,
how diagnosticity is computed, and how the result feeds — but does not replace — the probability
estimate.

`docs/design/DATA_VISUALIZATION_STANDARD.md` §16 specifies ACH **presentation** and flagged the
absence of the **procedure** as blocking. This document supplies it.

## Why ACH

ACH exists to counteract confirmation bias. It works by **disconfirmation**: the analytically
useful signal is which hypotheses the evidence rules *out*, not which it supports. A body of
evidence that is consistent with the favoured hypothesis is usually consistent with several
others too, and therefore carries almost no information.

This inverts the natural failure mode of an LLM-driven research pipeline, which will otherwise
assemble a persuasive case for whichever outcome it considered first.

## 1. Hypothesis Enumeration

Hypotheses are **resolution paths**, not outcomes. `YES` and `NO` alone are not an ACH — a
two-hypothesis matrix over a binary contract has almost no discriminating power, because most
evidence bears on *mechanism*, not on the final bit.

Rules:

1. **Minimum three, maximum seven** hypotheses. Below three, ACH degenerates to a yes/no
   argument. Above seven, per-cell judgements become unreliable.
2. Each hypothesis is a **distinct causal path to a settlement state**, phrased so a reader can
   say what would have to be true for it to hold.
3. Hypotheses must be **mutually exclusive** at the level of mechanism and, taken together,
   should approach exhaustiveness. Residual probability mass belongs to a `H-OTHER` catch-all.
4. **A settlement-ambiguity hypothesis is mandatory** where the contract's resolution criteria
   admit more than one reading. Rule ambiguity is MIE's highest-severity analytical finding
   (`docs/design/MIE_DESIGN_ADAPTATION.md` §9), and it must be a candidate explanation, not a
   footnote.
5. **Hypotheses receive equivalent treatment.** No hypothesis is designated the base case,
   preferred, or "our thesis" at enumeration time. Designating a favourite before scoring
   defeats the method.
6. Each hypothesis is tagged with the settlement state it implies: `YES`, `NO`, or `AMBIGUOUS`.

Multiple hypotheses may share a settlement state. That is expected and informative — three
independent paths to `NO` is a materially different situation from one.

## 2. Evidence Admission

Evidence items come from the normalized evidence set (`docs/02-ARCHITECTURE.md` §6). Each
carries its status, source reference, age, and quality score
(`docs/design/MIE_DESIGN_ADAPTATION.md` §6).

- Items with status `UNVERIFIABLE` or `MISSING` are **excluded from scoring** but **retained in
  the matrix** marked `EXCLUDED`, with the reason. Silently dropping failed sources overstates
  evidence strength.
- `SPECULATION` never enters an ACH matrix (`ANALYST_REPORT_STANDARD.md` §4).
- Evidence **for** and **against** enter identically. There is no separate treatment.

## 3. Consistency Scoring

For every (evidence item, hypothesis) cell, score how consistent the item is with the hypothesis
**assuming that hypothesis is true**.

| Symbol | Score | Meaning |
|---|---:|---|
| `++` | +2 | Strongly consistent — expected if this hypothesis holds |
| `+` | +1 | Consistent |
| `0` | 0 | Neutral / not diagnostic for this hypothesis |
| `−` | −1 | Inconsistent |
| `−−` | −2 | Strongly inconsistent — hard to explain if this hypothesis holds |
| `N/A` | — | Not applicable; excluded from this row's computation |

The question is always *"if this hypothesis were true, would I expect to see this?"* — never
*"does this support my view?"*

## 4. Diagnosticity

An evidence item is diagnostic only if it **discriminates between hypotheses**.

```text
diagnosticity(e) = max_h score(e,h) − min_h score(e,h)
```

| Diagnosticity | Interpretation | Handling |
|---:|---|---|
| 0 | Consistent with every hypothesis equally | **Non-diagnostic** — excluded from scoring, retained in matrix |
| 1–2 | Weakly diagnostic | Scored |
| 3–4 | Strongly diagnostic | Scored; flagged as a critical item |

Non-diagnostic evidence is the most common analytical trap: it feels like support, adds volume
to a report, and changes nothing. It is retained in the matrix precisely so a reader can see how
much of the evidence base was inert.

Rows sort by descending diagnosticity (`DATA_VISUALIZATION_STANDARD.md` §16).

## 5. Hypothesis Scoring — Weighted Inconsistency

Following Heuer, hypotheses are scored on **inconsistency only**. Positive scores do not
contribute. A hypothesis survives by not being contradicted.

```text
credibility(e)   = source_quality(e) / 100          # 0.0 – 1.0
inconsistency(h) = Σ over diagnostic e of  credibility(e) × |min(0, score(e,h))|
```

**Lower inconsistency = more tenable.** The leading hypothesis is the least contradicted one,
not the most supported one.

Credibility weighting means a strongly inconsistent item from a weak source damages a hypothesis
less than a mildly inconsistent item from a strong one — which is the correct behaviour, and is
why source quality must be scored before ACH runs, not after.

## 6. Coverage Check — Mandatory

Weighted inconsistency has a structural weakness that must be corrected for: **a hypothesis no
evidence touches scores zero and therefore appears to lead.** Absence of contradiction is not
support.

```text
coverage(h) = count of diagnostic evidence items where score(e,h) ≠ 0
```

Rules:

- A hypothesis with `coverage < 3` is marked `LOW COVERAGE`.
- A `LOW COVERAGE` hypothesis **may not be reported as the leading hypothesis** without an
  explicit flag stating that it leads by absence of evidence rather than by weight of it.
- If the top-ranked hypothesis is `LOW COVERAGE`, the correct output is usually a research gap,
  not a forecast. Record it as a missing-evidence finding.

## 7. Sensitivity Analysis — Mandatory

Identify **critical evidence**: any single item whose removal changes the hypothesis ranking.

```text
for each diagnostic item e:
    recompute inconsistency(h) for all h with e removed
    if the top-ranked hypothesis changes → e is CRITICAL
```

Every critical item must be reported by name, with its source and verification status. A ranking
that depends on one unverified item is a ranking that should not be acted on — and the report
must say so rather than presenting the conclusion at face value.

## 8. Worked Example

Market: *"Will agency Y approve X before 2026-11-05?"*

Hypotheses:

| ID | Hypothesis | Settles |
|---|---|---|
| H1 | Approved within the statutory window | `YES` |
| H2 | Approved, but after the deadline | `NO` |
| H3 | Rejected outright | `NO` |
| H4 | Deadline extended; unresolved at expiry | `NO` |

Matrix:

| # | Evidence | Cred | H1 | H2 | H3 | H4 | Diag |
|---|---|---:|:--:|:--:|:--:|:--:|---:|
| E1 | Draft decision published 2026-07-12 | 0.82 | `++` | `+` | `−−` | `−` | 4 |
| E3 | Two prior cases were extended (stale, 210d) | 0.54 | `−` | `+` | `0` | `++` | 3 |
| E2 | Statutory 90-day window ends 2026-10-10 | 0.88 | `+` | `−` | `0` | `−` | 2 |
| E4 | Agency maintains a public docket | 1.00 | `0` | `0` | `0` | `0` | 0 — **non-diagnostic** |

Weighted inconsistency:

| Hypothesis | Contributing negatives | Inconsistency | Coverage |
|---|---|---:|---:|
| **H1** | E3 (−1 × 0.54) | **0.54** | 3 |
| H2 | E2 (−1 × 0.88) | 0.88 | 3 |
| H3 | E1 (−2 × 0.82) | 1.64 | 1 — `LOW COVERAGE` |
| H4 | E1 (−1 × 0.82), E2 (−1 × 0.88) | 1.70 | 3 |

Leading hypothesis: **H1**, least contradicted.

**Sensitivity.** Remove E1: H3's inconsistency falls to `0.00` and it becomes top-ranked. **E1
is critical.** It is also the item carrying H1's support, so if E1 were retracted the analysis
would invert from a `YES` lean to a `NO` lean. E1's verification status is therefore the single
most important fact in this dossier and must be reported as such.

Note also that three of four paths settle `NO` while the least-contradicted path settles `YES`.
That tension is real information and must survive into the probability reasoning — it is exactly
what a bare `YES/NO` matrix would have destroyed.

## 9. Relationship to the Probability Estimate

**ACH produces a ranking. It does not produce a probability.**

Converting weighted inconsistency into a probability would manufacture false precision: the
scores are ordinal judgements, the credibility weights are heuristic, and the hypothesis set is
not guaranteed exhaustive. MIE does not normalise inconsistency scores into probabilities, and
any implementation that does is defective.

ACH **constrains and informs** the Layer 1 probability estimate (`docs/08-SCORING.md`):

1. The forecast's probability reasoning must state the leading hypothesis and its settlement
   state, and explain any divergence — if the estimate leans against the leading hypothesis, say
   why.
2. Critical evidence (§7) must appear in the forecast's **invalidation conditions**
   (`ANALYST_REPORT_STANDARD.md` §8), with its effect on the estimate stated.
3. A `LOW COVERAGE` leader (§6) caps confidence and should usually reduce the research grade.
4. Where a settlement-ambiguity hypothesis ranks first or second, the market carries
   `[RULE AMBIGUITY]` and may not be presented as `buy_candidate` regardless of computed EV
   (`MIE_DESIGN_ADAPTATION.md` §9).
5. Multiple independent paths to one settlement state is evidence about that state's likelihood
   and must be reasoned about explicitly, not by counting rows.

ACH runs **before** the probability estimate and, when the anchoring control is active, without
market price (`docs/02-ARCHITECTURE.md` §7).

## 10. Reproducibility

The ACH matrix is a decision-producing artifact and is versioned accordingly
(`docs/18-DECISION-REPRODUCIBILITY.md`):

- The full matrix — every cell, including non-diagnostic and excluded rows — is stored, not just
  the ranking.
- Each cell references the evidence item's ID and source provenance record.
- The scoring version (`ach_procedure_version`) is recorded on the forecast.
- The matrix is immutable. New evidence produces a **new** matrix and a new forecast, never an
  edit.

## 11. Agent Constraints

ACH is generated by the counterargument stage (`docs/06-AGENTS.md` Agent 6, Milestone 15).

- The agent must enumerate hypotheses **before** seeing any prior probability estimate, to avoid
  reverse-engineering a matrix that supports a conclusion already formed.
- The agent may not designate a preferred hypothesis at enumeration time.
- The agent must not omit a hypothesis on the grounds that it seems unlikely — that judgement is
  the matrix's job.
- If the agent cannot produce three defensible hypotheses, it returns insufficient rather than
  padding the set. A padded matrix is worse than none: it produces a confident ranking over
  hypotheses nobody believed.
- Consistency scores must cite which evidence item drives each non-zero cell.

## 12. Acceptance Criteria

- Every researched market with a probability estimate has a stored ACH matrix.
- Every matrix has ≥3 hypotheses, each tagged `YES` / `NO` / `AMBIGUOUS`.
- A settlement-ambiguity hypothesis is present wherever resolution criteria are contestable.
- Diagnosticity is computed per item; non-diagnostic items are retained and marked.
- Hypotheses are scored on weighted inconsistency only.
- Coverage is computed; `LOW COVERAGE` leaders are flagged.
- Sensitivity analysis identifies and reports all critical evidence.
- Critical evidence appears in the forecast's invalidation conditions.
- No implementation converts inconsistency scores into a probability.
- Matrices are immutable and reference evidence IDs and source provenance.
