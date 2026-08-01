---
title: 'MIE Design Adaptation'
status: 'binding interface contract'
version: '1.0.0'
inherits: 'docs/design/DESIGN_SYSTEM_SNAPSHOT.md'
---

# MIE Design Adaptation

How the inherited Editorial Intelligence Systems language maps onto prediction-market analysis.

**Scope boundary.** This document assigns _domain meaning_ to inherited tokens. It never changes
a token's value and never introduces a new one. Values live in
[`DESIGN_SYSTEM_SNAPSHOT.md`](DESIGN_SYSTEM_SNAPSHOT.md); that file outranks this one.

**Implementation boundary.** MIE has no frontend and the MVP does not add one
(`docs/00-VISION.md`, `docs/01-PRD.md`). Sections 1–7 and 11–13 bind **today**, because they
govern Markdown report output. Sections 8–10 describe interface behavior and bind **only after
a frontend ADR is approved** (`docs/14-ADR.md`). They are written now so that the contract
exists before the pressure to ship a dashboard does.

## 1. MIE Design Thesis

> An analytical command surface, not a trading casino.

MIE presents _estimates under uncertainty_ that a human then judges. Every presentation decision
follows from that:

1. **The interface must not add confidence the evidence does not support.** Visual emphasis is a
   claim. Emphasis without evidentiary backing is a lie told in CSS.
2. **Neutrality about outcomes, opinion about quality.** MIE has no view on whether YES or NO is
   "good." It has a strong view on whether the _research_ is strong or weak. Color follows the
   second axis, never the first.
3. **Density is a feature.** The user is an analyst comparing many markets. Dense, scannable,
   monospaced data beats airy marketing layout.
4. **Provenance is content, not chrome.** Timestamps, source counts, prompt versions, and snapshot
   times are first-class — the system's core claim is auditability.
5. **No urgency theater.** Prediction markets invite gambling-product patterns. MIE refuses them
   categorically (§13).

Inherited thesis — _Apple restraint × Linear product polish × Palantir operational seriousness_ —
applies unchanged. MIE sits nearest the Palantir pole.

## 2. Semantic Color Mapping

MIE's required mapping. Every use of color must trace to a row here.

| Token                                       | MIE meaning                                                                      | Concrete MIE uses                                                                                                                                        |
| ------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--signal` (yellow `#E8FF5A`)               | Primary analyst action · actionable edge · selected insight · threshold crossing | The single most important next action; computed edge where it crosses a recommendation threshold; the currently selected market; the human decision gate |
| `--system` (blue `#4DACFF`)                 | Neutral data · market prices · probabilities · links · system structure          | Market-implied probability, estimated probability, prices, source links, table structure, workflow identifiers, focus rings                              |
| `--success` (green `#3DFFB0`)               | Confirmed successful **system state** · favorable calibration                    | Workflow `succeeded`; settlement recorded; Brier score improving against baseline; evidence-integrity check passed                                       |
| `--warning` (amber `#FFB340`)               | Uncertainty · partial evidence · stale information · caution                     | Workflow `partial`; stale sources; wide spread; low liquidity; confidence below threshold; research grade C/D                                            |
| `--danger` (red `#FF4545`)                  | Rule ambiguity · provenance failure · disqualifying risk · destructive action    | Ambiguous settlement terms; missing/unreachable source; research grade F; contradicted evidence; irreversible controls                                   |
| `--bg-base` / `--surface-1` / `--surface-2` | Analyst workbench and operational surfaces                                       | Default canvas for all interactive analysis                                                                                                              |
| `--paper` / `--ink`                         | Long-form dossiers · printable forecasts · retrospectives · exports              | Report exports, postmortems, print output                                                                                                                |

### 2.1 The YES/NO neutrality rule — non-negotiable

**Do not map YES to green and NO to red.**

Either outcome may be analytically or financially relevant. Coloring one green and one red
encodes a preference the system does not hold, and nudges the analyst toward YES bias — a
documented failure mode in the exact product category MIE operates in.

```text
YES / NO            → equivalent neutral surfaces, equivalent type weight, equivalent labels
Estimated edge      → --signal  (only when it crosses a recommendation threshold)
Market data         → --system
Risk or invalidity  → --warning / --danger
```

Green and red in MIE describe **system and evidence state**, never market direction.

Correct: `NO · 0.62` and `YES · 0.38` in identical `--text-primary` on identical surfaces,
with the _edge_ — not the side — carrying `--signal` if it crossed a threshold.

Incorrect: a green YES pill and a red NO pill. Incorrect: a green up-arrow on a rising price.

### 2.2 Color is never the sole indicator

Every state-bearing element carries a **text label or shape** in addition to color. This is a
WCAG requirement (1.4.1) and an inherited hard rule, and it is doubly binding in MIE because
Markdown — the MVP's only output format — has no color at all. Any status that cannot survive
being rendered as plain text is not specified correctly.

Test: strip all color. Is every state still unambiguous? If not, the design is wrong.

### 2.3 Signal-yellow budget

Inherited hard rule: signal-yellow is never decorative. In MIE:

- **At most one** signal-yellow element per report section or view region.
- Reserved for the **decision edge** — the thing the analyst should act on or look at next.
- A market that is `pass` gets **no** signal-yellow. Nothing to act on.
- If every row is highlighted, nothing is. Highlighting is a scarce budget, spent by the
  ranking engine's output, not by the renderer's enthusiasm.

## 3. Typography Mapping

| Inherited role  | Font    | MIE use                                                                                                                                                                     |
| --------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Display / H1–H4 | Syne    | Report titles, market questions, section headings                                                                                                                           |
| Body / Lead     | DM Sans | Narrative analysis, evidence summaries, reasoning, counterarguments                                                                                                         |
| Label / data    | DM Mono | **All numerics and system markers** — probabilities, prices, edge, EV, Brier scores, confidence, grades, tickers, timestamps, prompt versions, workflow IDs, snapshot times |

### 3.1 Numerics are always mono

Every number an analyst compares vertically must be DM Mono with **tabular alignment**. Digits
must line up column-wise; a probability column in a proportional font is unreadable at scan speed.

### 3.2 Precision is fixed per quantity type

Inconsistent precision reads as inconsistent rigor and defeats column scanning.

| Quantity                                | Format                                                            | Example                     |
| --------------------------------------- | ----------------------------------------------------------------- | --------------------------- |
| Probability (estimated, market-implied) | 2 dp, `0.000`–`1.000` range shown as `0.00`                       | `0.62`                      |
| Edge                                    | 2 dp, always signed                                               | `+0.14`, `-0.03`            |
| Expected value                          | 3 dp, always signed                                               | `+0.082`                    |
| Price                                   | 2 dp dollars, or integer cents — pick one per report and state it | `0.38`                      |
| Confidence                              | integer 0–100                                                     | `78`                        |
| Evidence quality                        | integer 0–100                                                     | `64`                        |
| Brier score                             | 4 dp                                                              | `0.1842`                    |
| Research grade                          | single uppercase letter                                           | `B`                         |
| Timestamps                              | ISO 8601 with timezone                                            | `2026-07-31T06:00:00-04:00` |

Never mix percent and decimal notation for probability within one report.

### 3.3 Do not mix mono into prose

Inherited rule. Narrative analysis is DM Sans. Mono is the intelligence layer — labels, data,
system state — not a texture to sprinkle into sentences. Inline values inside a sentence are the
one exception, and they stay mono.

## 4. Spacing, Layout, and Data Density

Spacing scale, gutters, and section rhythm are inherited unchanged (snapshot §3.6).

MIE-specific density rules:

- **Analytical tables use the tight end of the scale.** Row padding `--sp-sm` (8px) vertical,
  `--sp-md` (16px) horizontal. Marketing rhythm (`py-16 sm:py-24`) is for report _narrative_
  sections, never for data tables.
- **Vertical rhythm inside a dossier follows the reading unit,** not a fixed section pitch. An
  evidence list is a tight stack; a red-team objection is a breathing block.
- **Copy column stays capped** at `--copy-max` (720px) for narrative. Tables and charts may use
  full `--page-max` width.
- **Radius is restrained.** Inherited `--r-md` (10px) for controls, `--r-card` (20px) for panels.
  Data tables get **no** radius — a rounded data grid reads as consumer software. Note the
  unresolved upstream radius decision (snapshot §5.3); MIE follows implementation values.
- **Borders carry hierarchy, not shadows.** Inherited. At most one `--shadow-card` per view.

## 5. Table Standards

Tables are MIE's primary presentation form. They are load-bearing.

**Structure**

- Header row on `--surface-2`, labels in DM Mono uppercase, tracked `0.1em`.
- Row dividers `--border-subtle` only. **No zebra striping. No full grid lines.** (Inherited.)
- Numeric columns right-aligned; text columns left-aligned. Never center numerics.
- Column order follows the analytical argument: identity → market data → estimate → comparison →
  quality → recommendation.

**Canonical daily-report column order**

```text
Ticker | Question | Market Prob | Est Prob | Edge | EV | Conf | Grade | Rec
```

Placing `Market Prob` before `Est Prob` is deliberate: it reads as _what the market says, then
what we say, then the difference_ — the argument the report exists to make.

**Emphasis**

- The recommendation column is the only column permitted `--signal`, and only for
  `buy_candidate` rows.
- Never color an entire row. Row-level color reads as YES/NO sentiment and violates §2.1.
- Risk flags render as a separate mono column or a footnote marker, never as row tint.

**Overflow**

- Tables scroll horizontally inside their own container. The page body never scrolls
  horizontally.
- Below `640px`, tables become stacked definition lists — one market per card, label/value pairs.
  Never shrink type below `t-small` to force a table to fit.

## 6. Evidence-Status Treatments

Derived from `docs/02-ARCHITECTURE.md` §6 and `docs/08-SCORING.md`.

| Status       | Color       | Required text/shape | Meaning                                                    |
| ------------ | ----------- | ------------------- | ---------------------------------------------------------- |
| Verified     | `--system`  | `VERIFIED`          | Source reachable, directly relevant, within recency window |
| Corroborated | `--system`  | `CORROBORATED ×N`   | N independent sources agree                                |
| Partial      | `--warning` | `PARTIAL`           | Evidence exists but incomplete on a material dimension     |
| Stale        | `--warning` | `STALE · <age>`     | Outside the configured recency window; age always shown    |
| Contradicted | `--danger`  | `CONTRADICTED`      | Sources conflict materially and conflict is unresolved     |
| Unverifiable | `--danger`  | `UNVERIFIABLE`      | Source unreachable, paywalled, or provenance broken        |
| Absent       | `--danger`  | `MISSING`           | A required evidence dimension returned nothing             |

**Evidence-for vs evidence-against are visually equivalent.** Both are neutral surfaces with
identical type treatment. Contradicting evidence is not a warning state — it is _the point_.
Only _unresolved contradiction between sources_ is a warning; disconfirming evidence about the
outcome is normal, healthy research output.

Evidence quality score (0–100) renders as a mono numeral plus its band label, never as a bare
colored bar.

## 7. Forecast-Status Treatments

Recommendation labels are fixed by `docs/08-SCORING.md`. Their presentation:

| Label           | Color          | Required text   | Rationale                                                  |
| --------------- | -------------- | --------------- | ---------------------------------------------------------- |
| `buy_candidate` | `--signal`     | `BUY CANDIDATE` | The actionable edge. The one thing worth acting on.        |
| `watch`         | `--system`     | `WATCH`         | Neutral data state, not a warning. Nothing is wrong.       |
| `pass`          | `--text-muted` | `PASS`          | Deliberately de-emphasized. Correct and unremarkable.      |
| `avoid`         | `--danger`     | `AVOID`         | Disqualifying risk — settlement risk or adverse alignment. |

`buy_candidate` is **not** green. Green means _system state confirmed_, not _good trade_. A
positive-EV candidate is a hypothesis, not a win. Green here would import exactly the
casino semantics §2.1 forbids.

`pass` is muted rather than red. Most markets should be `pass`; that is the ranking engine
working. Rendering the common case as an alarm trains the analyst to ignore alarms.

**Research grade**

| Grade | Color       | Treatment                    |
| ----- | ----------- | ---------------------------- |
| A, B  | `--system`  | Mono letter, neutral         |
| C, D  | `--warning` | Mono letter + band label     |
| F     | `--danger`  | Mono letter + `INSUFFICIENT` |

## 8. Confidence and Uncertainty Presentation

> Applies to future UI. Report-side equivalents in `ANALYST_REPORT_STANDARD.md`.

Confidence is **not** probability (`docs/08-SCORING.md`). They must never share a visual form —
two 0–100 numbers in identical treatment will be conflated.

- **Probability** → mono decimal `0.00`–`1.00`, may carry `--system`.
- **Confidence** → mono integer `0`–`100` with an explicit `CONF` label, and a band word
  (`LOW` / `MODERATE` / `HIGH`). Never rendered as a percentage. Never colored `--system`.

**Uncertainty is never hidden.** A point probability shown alone overstates precision.

- Show the range whenever one exists: `0.62 [0.48–0.71]`.
- The interval is `--text-muted`; the point estimate is `--text-primary`. Subordinate, not absent.
- Where confidence is `LOW`, the range is **required**, not optional.
- Never render a probability as a filled progress bar. A bar implies a measured proportion; this
  is an estimate. Use a numeral with an interval.

**Confidence must not be encoded as color saturation or opacity.** Fading low-confidence rows
makes them harder to read exactly when they need scrutiny, and fails contrast requirements.
Encode confidence in an explicit labeled column.

## 9. Rule-Ambiguity Presentation

> Applies to future UI.

Settlement-rule ambiguity is the highest-severity analytical finding in MIE. A market whose
resolution criteria are unclear can produce a correct forecast and still settle against you —
the estimate was never the risk.

- Always `--danger`, always with the text `RULE AMBIGUITY`.
- Rendered **above** the probability estimate, never below or beside it. Position encodes
  precedence: the reader must encounter the ambiguity before the number it undermines.
- Must state _which clause_ is ambiguous and _which interpretations_ are live — never a bare flag.
- A market flagged for rule ambiguity may not display `buy_candidate` styling, regardless of
  computed EV. The presentation layer enforces this even if scoring does not.

Provenance failure (`UNVERIFIABLE` / `MISSING`, §6) gets the same precedence-above-the-number
treatment.

## 10. Human Approval Controls

> Applies to future UI. MIE executes no trades (`docs/00-VISION.md` constitution §6).

The decision gate is the one place signal-yellow is unambiguously correct: it is the primary
operator action.

- The approval control states **what is being approved**, in full, adjacent to the control.
  Never a bare "Approve."
- Destructive or irreversible controls are `--danger` and require an explicit confirmation step.
- **No default-selected affirmative.** The gate opens neutral.
- No countdowns, no expiring windows, no "act now." Urgency theater around a capital decision is
  a dark pattern (§13).
- Approval state changes are recorded with actor and timestamp, both mono, both visible.
- The gate must render the invalidation conditions from the forecast alongside the control.

## 11. States: Empty, Loading, Partial, Error

MIE's workflow statuses are fixed by `docs/05-WORKFLOWS.md`:
`queued` · `running` · `succeeded` · `partial` · `failed` · `cancelled`.

| State       | Color          | Treatment                                                                                                                                                             |
| ----------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Empty       | `--text-muted` | State _why_ it is empty and what would populate it. "No markets met the ranking threshold on 2026-07-31" — never a bare "No data."                                    |
| `queued`    | `--text-muted` | Mono label + queue position if known                                                                                                                                  |
| `running`   | `--system`     | Mono label + stage name. Skeletons preserve final layout — no spinners over data regions, no layout shift on arrival                                                  |
| `succeeded` | `--success`    | Mono label + completion timestamp                                                                                                                                     |
| `partial`   | `--warning`    | **Mandatory.** Mono label + exactly which stages/markets are missing and why. Partial results are always labeled inline, at the point of use — never only in a header |
| `failed`    | `--danger`     | Mono label + stage + error class + whether retry is safe (`docs/05-WORKFLOWS.md`)                                                                                     |
| `cancelled` | `--text-muted` | Mono label + actor + timestamp                                                                                                                                        |

**Partial is the state MIE must get right.** `docs/05-WORKFLOWS.md` permits partial results in
reports "only when labeled clearly." Presentation requirement: a partial result is labeled **at
the value**, not only at the top of the document. A reader who scrolls into the middle of a
report must be unable to mistake a partial result for a complete one.

**Never fabricate a value to fill a slot.** Missing is `—` plus an explicit reason. A zero, a
dash without explanation, or a carried-forward stale value are all failures.

## 12. Responsive, Accessibility, Reduced Motion

### 12.1 Responsive

Inherited mobile-first rules apply. MIE additions:

- Data tables degrade to stacked cards below `640px` (§5). Never horizontal-scroll a table as
  the mobile strategy of record; never shrink type to fit.
- Charts get a **textual alternative** at narrow widths rather than an unreadable miniature
  (`DATA_VISUALIZATION_STANDARD.md`).
- No horizontal page overflow at any width. Wide content scrolls inside its own container.
- Minimum supported viewport: 390px (iPhone 13), inherited.

### 12.2 Accessibility — acceptance criteria

These are testable and binding on any future UI, and on HTML/PDF report output.

| #    | Criterion                                                           | Threshold                                                      |
| ---- | ------------------------------------------------------------------- | -------------------------------------------------------------- |
| A-1  | Body text contrast                                                  | ≥ 4.5:1 against its actual surface                             |
| A-2  | Large text (≥24px, or ≥19px bold) and UI component boundaries       | ≥ 3:1                                                          |
| A-3  | Non-text meaning-bearing graphics (chart marks, status dots, rules) | ≥ 3:1 against adjacent colors                                  |
| A-4  | Color is never the sole carrier of meaning                          | Text or shape always present (§2.2)                            |
| A-5  | Keyboard focus visible on every interactive control                 | Inherited 2px `--accent-blue` focus ring                       |
| A-6  | Full keyboard operability                                           | No pointer-only interaction                                    |
| A-7  | Semantic headings, one `<h1>`, no skipped levels                    | —                                                              |
| A-8  | Data tables use `<th>`, `scope`, and a `<caption>`                  | —                                                              |
| A-9  | Touch targets                                                       | ≥ 44×44px                                                      |
| A-10 | Charts have a text alternative conveying the same conclusion        | §12.4                                                          |
| A-11 | Status not distinguishable by hue alone for CVD readers             | Verified against deuteranopia/protanopia/tritanopia simulation |
| A-12 | `prefers-reduced-motion` honored                                    | §12.3                                                          |

**Verified against the inherited palette on MIE surfaces** (WCAG 2.1 relative luminance,
computed at snapshot time):

| Foreground                 | on `#080808` | on `#0F0F0F` | on `#161616` | Verdict  |
| -------------------------- | -----------: | -----------: | -----------: | -------- |
| `--text-primary` `#E8E8E8` |        16.35 |        15.64 |        14.77 | A-1 pass |
| `--text-muted` `#808080`   |         5.07 |         4.85 |         4.58 | A-1 pass |
| `--signal` `#E8FF5A`       |        18.01 |        17.24 |        16.27 | A-1 pass |
| `--system` `#4DACFF`       |         8.26 |         7.91 |         7.46 | A-1 pass |
| `--success` `#3DFFB0`      |        15.38 |        14.72 |        13.90 | A-1 pass |
| `--warning` `#FFB340`      |        11.23 |        10.75 |        10.15 | A-1 pass |
| `--danger` `#FF4545`       |         5.90 |         5.65 |         5.33 | A-1 pass |

The full accent palette clears AA body text on all three dark surfaces. **This is why MIE is
dark-first and why paper mode is constrained** — the same palette fails comprehensively on
`--paper` (snapshot §5.2). Note that `--text-muted` passes only at the implementation value
`#808080`; the stale documented `#666666` fails A-1 on every surface.

### 12.3 Reduced motion

Inherited: honor `prefers-reduced-motion: reduce` — disable transforms, retain opacity.

MIE additions:

- No motion on data regions. Values must not animate, count up, tick, or transition on update.
  Animated numbers are unreadable and imply liveness that batch processing does not have.
- Chart entrance animation is decorative and must be disabled under reduced motion. Charts must
  be fully legible in a static screenshot — the primary consumption mode for a report.
- Nothing auto-advances, auto-refreshes, or auto-scrolls.
- No motion exceeds `--dur-slow` (320ms).

### 12.4 Textual alternatives

Every chart carries a text alternative stating the same conclusion the visual encodes — not a
description of the chart's appearance.

- Bad: "A line chart with a blue line trending upward."
- Good: "Estimated probability rose from 0.41 to 0.62 between 2026-07-14 and 2026-07-31, while
  market-implied probability moved 0.44 to 0.49; the gap widened from -0.03 to +0.13."

In Markdown reports, the textual alternative **is** the primary artifact (`ANALYST_REPORT_STANDARD.md`).

## 13. Prohibited Patterns

All inherited prohibitions (snapshot §3.7) apply. MIE adds category-specific prohibitions —
these exist because prediction markets sit adjacent to gambling products, and their conventions
are actively harmful to calibrated judgment:

**Categorically prohibited**

- Flashing, pulsing, or ticking prices
- Celebratory animation, confetti, sound, or haptics on any outcome
- Streak counters, badges, levels, leaderboards, or any gamification
- Loss-recovery prompts, "win it back," or any re-engagement nudge after a miss
- Urgency theater: countdowns, "closing soon" pressure, artificial scarcity
- Green/red emotional coding of market direction or of YES/NO (§2.1)
- Portfolio-value hero numbers, P&L tickers, or balance-forward framing
- Live-motion effects implying real-time data when the system is batch (`docs/05-WORKFLOWS.md`)
- Confidence conveyed by saturation, glow, or opacity (§8)
- Any presentation implying MIE executes trades or gives financial advice

**Prohibited as design shortcuts**

- Raw hex values in place of tokens
- New colors, fonts, spacing steps, or radii not in the snapshot
- Coloring an entire table row
- Progress bars for probability (§8)
- Truncated or dual axes on charts (`DATA_VISUALIZATION_STANDARD.md`)
- Charts without a snapshot timestamp and provenance
- Emoji as status indicators in analytical output

## 14. Conformance

A change conforms when:

1. Every color traces to a §2 row.
2. Every numeric is DM Mono at the §3.2 precision.
3. Every status carries text or shape, not color alone (§2.2).
4. YES and NO receive equivalent treatment (§2.1).
5. Accessibility criteria A-1…A-12 pass (§12.2).
6. No token was added, changed, or re-mapped (snapshot §4).
7. No prohibited pattern appears (§13).
