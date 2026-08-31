---
title: 'MIE Data Visualization Standard'
status: 'binding interface contract'
version: '1.0.0'
inherits: 'docs/design/DESIGN_SYSTEM_SNAPSHOT.md'
---

# Data Visualization Standard

Binding rules for every chart MIE produces, in any medium.

**Applicability.** The MVP emits Markdown and has no rendering layer
(`docs/01-PRD.md`, `docs/14-ADR.md` ADR-0006). Until a frontend ADR is approved:

- §§1–3 and §§13–17 bind **now** — they govern textual alternatives, provenance, precision,
  and honesty rules that apply to tables and prose descriptions of data.
- §§4–12 bind **when a chart is first rendered**, whether in a future UI, an HTML/PDF export,
  or a generated image committed to `reports/`.

**No chart may be produced that does not satisfy §1.**

## 1. The Three Non-Negotiables

Every chart, everywhere, always:

1. **A textual alternative that states the conclusion** (§13). Not a description of appearance.
2. **Provenance and a snapshot timestamp** (§14). What data, from when, under which prompt/model
   version.
3. **An honest axis** (§15). No truncation on probability scales, no dual axes, no inverted scales.

A chart failing any of these is not shippable, regardless of how it looks.

## 2. Chart Design Principles

1. **The chart must not imply more precision than the estimate has.** MIE outputs estimates under
   uncertainty; a crisp line implies measurement. Uncertainty renders alongside the estimate
   wherever it exists (§6).
2. **Static-legible.** Every chart must be fully readable as a still image with no interaction,
   no hover, and no animation. Tooltips may add detail; they may never _carry_ required meaning.
3. **Structure over decoration.** Inherited. No gradients, no glow, no 3D, no drop shadows on
   marks, no background images.
4. **Direct labels beat legends.** Label the series at its terminus. A legend forces a lookup
   round-trip and fails first for CVD readers.
5. **Gridlines recede.** `--border-subtle`, horizontal only where a value must be read across.
   No full grids.

## 3. Encoding Rules

| Encoding             | Permitted use                                                                |
| -------------------- | ---------------------------------------------------------------------------- |
| Position             | Primary. Always prefer it.                                                   |
| Length               | Magnitudes with a true zero baseline.                                        |
| Direct label         | Any value the reader must read exactly.                                      |
| Shape / dash pattern | **Required** to differentiate series, in addition to color (§12).            |
| Color hue            | Category, **always redundant** with shape or label.                          |
| Color lightness      | Ordered/sequential magnitude (§11).                                          |
| Area                 | Uncertainty bands only. Never for magnitude comparison.                      |
| Angle / pie          | **Prohibited.** No pie or donut charts anywhere in MIE.                      |
| Opacity              | Layering only. **Never** encodes confidence (`MIE_DESIGN_ADAPTATION.md` §8). |

Marks that carry meaning must reach **≥3:1** contrast against the surface and against adjacent
marks (criterion A-3).

## 4. Probability Charts

Estimated probability over time, single market.

- Y axis: **fixed `0.0`–`1.0`. Never truncated.** Probability has natural bounds; truncating
  them manufactures apparent movement. This is the single most-violated chart rule in
  forecasting products, and it is prohibited here without exception.
- Y ticks at `0.0 / 0.25 / 0.50 / 0.75 / 1.00`. A `--border-subtle` reference rule at `0.50`.
- X axis: time, ascending left to right, ISO-formatted ticks.
- Series color `--system`. Line weight 2px. No area fill under the line — fill implies
  cumulative quantity.
- Uncertainty band required where a range exists (§6).
- Points where evidence was refreshed are marked, so the reader can distinguish a _revision_
  from a _drift_.

## 5. Forecast-versus-Market Charts

The comparison the product exists to make. Highest-stakes chart in the system.

- Two series on one `0.0`–`1.0` axis:
  - **Market-implied probability** — `--system`, solid.
  - **Estimated probability** — `--text-primary`, dashed.
- Both directly labeled at the terminus. Distinguished by **dash pattern**, not color alone.
- The gap between them is the _edge_. Shade it only when it crosses a recommendation threshold
  from `docs/08-SCORING.md`; use `--signal` at low alpha. Below threshold the gap is unshaded.
  This is the sanctioned use of signal-yellow in charts and the only one.
- **Neither series is "good."** No green/red, no up/down arrows, no directional coloring. The
  chart shows disagreement, not correctness (`MIE_DESIGN_ADAPTATION.md` §2.1).
- Never plot the two on separate axes or separate scales. Both are probabilities on `0`–`1`;
  a dual axis here would fabricate or conceal edge.

## 6. Probability Ranges and Uncertainty Bands

- Rendered as a filled band around the point estimate, same hue as the series, low alpha,
  no border stroke.
- The band's meaning must be stated in the caption — credible interval, min/max across
  runs, or scenario range. **An unlabeled band is prohibited**; readers will assume a
  confidence interval that MIE may not be computing.
- Where confidence is `LOW` (`MIE_DESIGN_ADAPTATION.md` §8), the band is **required**.
- Where no interval exists, show the point estimate and state "no interval computed."
  Never imply a range that was not calculated.
- Bands never extend outside `0.0`–`1.0`. Clamp and note the clamp.

## 7. Market-Price History

- Y axis: price on the same `0.0`–`1.0` scale as probability, so price and probability charts
  are visually comparable. If cents are used, label the axis in cents and stay consistent
  within a report.
- Series `--system`.
- **No candlesticks. No volume bars styled as a trading terminal. No flashing or ticking.**
  (`MIE_DESIGN_ADAPTATION.md` §13.)
- Spread renders as a band between bid and ask, not as two competing lines.
- Low-liquidity periods are marked with a `--warning` rule and a text label — price movement
  on thin volume is not signal, and the chart must say so.

## 8. Evidence Timelines

Evidence items positioned along a time axis, terminating at the market's close date.

- Each item: a mark at its publication time, plus its status glyph and label from
  `MIE_DESIGN_ADAPTATION.md` §6.
- **Evidence-for and evidence-against are visually equivalent** — same mark, same weight,
  differentiated by row/lane and text label, not by color. Disconfirming evidence is normal
  output, not a warning state.
- Stale items (`--warning`) carry their age as text.
- The recency window boundary renders as a labeled vertical rule.
- Market close renders as a labeled vertical rule in `--border-strong`.
- Density: when items collide, stack in lanes. Never jitter randomly — position must remain
  readable as time.

## 9. Calibration Curves

Reliability diagram: mean forecast probability (x) against observed frequency (y), by bucket.
Buckets are fixed by `docs/09-CALIBRATION.md` (deciles, `0-10%` … `90-100%`).

- Square aspect ratio. Both axes `0.0`–`1.0`. **Distortion of aspect misrepresents calibration**,
  so the square is mandatory, not stylistic.
- Perfect-calibration diagonal in `--border-strong`, dashed, labeled `PERFECT CALIBRATION`.
- Observed points in `--system`, connected.
- **Bucket sample size must be shown** — as point size, or better, as a mono `n=` label per
  point. A bucket with `n=3` and a bucket with `n=300` look identical otherwise, and the
  reader will over-read the sparse one. This is the most likely way a calibration chart
  misleads.
- Buckets below the configured minimum sample size render `--text-muted` with an explicit
  `LOW n` label, and are excluded from any trend claim.
- Deviation above the diagonal is _underconfidence_; below is _overconfidence_. Label both
  regions in text. **Do not color one green and one red** — neither is a moral failing, and
  both are actionable in different ways.

## 10. Brier Score and Signal-Decay Charts

**Brier score over time**

- Y axis starts at `0`. Brier is bounded `0`–`1` (`docs/09-CALIBRATION.md`); **lower is better**,
  and the axis must be labeled `BRIER (LOWER IS BETTER)` because the convention is not universal
  and an unlabeled falling line reads as bad news.
- Series `--system`. A `--border-strong` reference line at the baseline being compared against
  (e.g. the market's own Brier, or `0.25` for an uninformative `0.5` forecast) — a Brier score
  with no reference is uninterpretable.
- `--success` is permitted **only** on an explicitly-labeled "improvement against baseline"
  annotation, never as the series color.
- Rolling windows must state their window length in the caption.

**Signal-decay charts** — how evidence value degrades with age.

- X: age of evidence. Y: measured or modeled contribution to forecast quality.
- If the decay curve is **modeled rather than measured**, it must be labeled `MODELED` and
  its assumptions stated. Presenting an assumed decay as an observation is a provenance
  failure (§14).
- Recency-window thresholds render as labeled vertical rules.

## 11. Categorical and Sequential Scales

The inherited palette is a **semantic state palette, not a chart scale**. It was designed for
states seen one at a time, not series seen side by side. Constraints follow from that.

### 11.1 Categorical

- **Maximum 5 categorical series.** There are five accent hues and MIE may not invent more
  (snapshot §4). If the data has more than five categories, aggregate, small-multiple, or use
  a table. Do not reuse a hue.
- Preferred order when fewer are needed, chosen for maximum separation under CVD (§12):
  1. `--system` (blue)
  2. `--text-primary`
  3. `--signal` (yellow) — only if it does not conflict with its "actionable edge" meaning
  4. `--danger` (red)
  5. `--success` (green)
- **Every series carries a shape or dash pattern in addition to hue** (§3).
- Categorical hue must never coincidentally imply semantic meaning. If a series happens to
  land on `--danger`, and that series is not a risk, re-order the assignment.

### 11.2 Sequential

The palette contains **no sequential ramp** and MIE may not create one.

Sanctioned mechanism: a **single-hue lightness/alpha ramp** of one inherited token over the
surface — no new hue is introduced. Default `--system` at stepped alpha.

- **Discrete steps only. Maximum 5.** A continuous gradient cannot be read back to a value and
  invites false precision.
- Every step is labeled with its numeric range.
- Ordering must be monotonic in lightness so it survives greyscale printing.
- **No diverging scales without an explicit, labeled, meaningful midpoint.** A diverging scale
  on YES/NO probability is prohibited — it re-encodes the direction bias §2.1 forbids. Diverging
  is permitted for _edge_ (which has a true zero) and for _calibration deviation_.

> **Ratification needed.** The alpha-ramp mechanism introduces no new hue but does introduce
> derived values. Flagged as decision D-5 in `DESIGN_SYSTEM_SNAPSHOT.md` §7.

## 12. Color-Blind-Safe Interpretation

Verified by simulation (Viénot/Brettel/Mollon dichromat projection; CIE76 ΔE in Lab) against
the inherited accents. Minimum pairwise separation by condition:

| Condition        | Weakest pair                 |       ΔE | Assessment                     |
| ---------------- | ---------------------------- | -------: | ------------------------------ |
| Normal           | `--signal` / `--warning`     |     49.9 | Well separated                 |
| Protanopia       | `--signal` / `--warning`     |     27.2 | Acceptable                     |
| **Deuteranopia** | **`--signal` / `--warning`** | **17.9** | **Weak — mitigation required** |
| Tritanopia       | `--system` / `--success`     |     23.6 | Acceptable                     |

Findings:

- **No pair collapses entirely.** The palette's accents differ strongly in lightness, which
  carries most of the separation. This is why the inherited design language's emphasis on
  lightness-based hierarchy is load-bearing and must not be traded for hue-based hierarchy.
- **`--signal` (yellow) and `--warning` (amber) are weakly separated under deuteranopia
  (ΔE 17.9).** This is semantically dangerous in MIE: signal means _actionable edge_, amber
  means _caution / stale / uncertain_. Confusing them inverts the analytical message.
  **Mitigation, mandatory:** signal and warning may never be adjacent categorical series in the
  same chart, and any element carrying either must include its text label
  (`MIE_DESIGN_ADAPTATION.md` §2.2). Where both must appear, separate them by position or lane.
- `--system` / `--success` under tritanopia (ΔE 23.6) is acceptable but should not be the only
  differentiator for adjacent thin marks.

Requirements:

- Every chart must remain fully interpretable in **greyscale**. Test by desaturating.
- Never use hue as the sole differentiator (§3).
- Never use red/green as opposed endpoints of a scale.

## 13. Textual Alternatives

**Every chart has one. In Markdown reports, the textual alternative is the primary artifact.**

It must state **the conclusion the chart supports**, with the numbers that support it — not a
description of the visual.

- Prohibited: "A line chart showing probability over time with a blue line."
- Required: "Estimated probability rose from 0.41 to 0.62 between 2026-07-14 and 2026-07-31
  while market-implied probability moved 0.44 to 0.49. Edge widened from -0.03 to +0.13,
  crossing the 0.08 `buy_candidate` threshold on 2026-07-26. Confidence 74 (MODERATE)."

Requirements:

- Include the direction, magnitude, endpoints, and any threshold crossing.
- Include the same provenance and snapshot timestamp as the chart (§14).
- State uncertainty where it exists.
- If the chart shows nothing conclusive, **say so** — "no material change" is a valid and
  useful alternative text. Do not manufacture a narrative to fill the slot.

## 14. Chart Provenance and Snapshot Timestamps

Every chart carries a provenance block, rendered in DM Mono `--text-muted`, adjacent to the
chart (a caption, not a tooltip):

```text
SOURCE     kalshi · <ticker>
SNAPSHOT   2026-07-31T06:00:00-04:00
WINDOW     2026-07-01 .. 2026-07-31
RUN        <workflow_run_id>
VERSIONS   prompt <v> · model <id> · scoring <v>
BASIS      market_probability = conservative ask
```

Rules:

- **The snapshot timestamp is the data's timestamp, not the render time.** These differ, and
  conflating them is a correctness failure — a chart rendered today from a week-old snapshot
  must say so.
- Batch cadence must be evident. Nothing may imply live data (`docs/05-WORKFLOWS.md`).
- Where the chart includes partial results, it is labeled `PARTIAL` with the missing scope
  named (`MIE_DESIGN_ADAPTATION.md` §11).
- Where any displayed value derives from a configurable formula (price basis, EV formula,
  recency window), the configuration is named. `docs/08-SCORING.md` allows multiple price
  bases; a chart that does not say which one it used is not reproducible, which violates the
  project's reproducibility requirement (`docs/01-PRD.md`).

## 15. Axis Honesty

Hard prohibitions. Each has a specific failure mode in forecasting products.

| Prohibited                                                     | Why                                                            |
| -------------------------------------------------------------- | -------------------------------------------------------------- |
| Truncated probability axis                                     | Manufactures apparent movement on a naturally bounded quantity |
| Truncated zero-baseline axis on any length encoding            | Distorts magnitude comparison                                  |
| Dual Y axes                                                    | Lets the author choose the correlation the reader sees         |
| Inverted axes without an explicit label                        | Reverses the reader's conclusion                               |
| Non-linear (log) scale without an explicit label               | Compresses differences invisibly                               |
| Non-uniform time spacing on a linear time axis                 | Fabricates or hides rate of change                             |
| Aspect ratios that flatten or exaggerate slope to make a point | Slope is the message                                           |
| Cherry-picked windows presented as the full history            | Selection is an argument; state the window                     |

Additional requirements:

- Every axis is labeled with its quantity **and unit**.
- Probability and price axes are always `0`–`1` (or `0`–`100¢`), always full-range.
- Where a window is deliberately narrowed, the caption states the full available range.
- Bar charts always start at zero. No exceptions.

## 16. ACH Matrices

Analysis of Competing Hypotheses — hypotheses as columns, evidence items as rows, cells
recording each item's consistency with each hypothesis.

> **Procedure now specified — D-6 closed.** The analytical procedure is defined in
> [`docs/21-ACH-PROCEDURE.md`](../21-ACH-PROCEDURE.md): hypothesis enumeration, consistency
> scoring, diagnosticity, weighted inconsistency, coverage, and sensitivity analysis. Adoption
> scope and exclusions are recorded in [`docs/20-MIOS-METHODOLOGY.md`](../20-MIOS-METHODOLOGY.md).
> This section remains the **presentation** contract; the two documents must stay consistent.

Presentation rules:

- Rendered as a **table**, not a heatmap. Cells carry a symbol and text, never color alone.
- Cell values use a fixed symbol set, always accompanied by text:
  `++` strongly consistent · `+` consistent · `0` neutral/not diagnostic ·
  `-` inconsistent · `--` strongly inconsistent · `N/A` not applicable
- **Hypotheses receive equivalent visual treatment.** No hypothesis is styled as the favored
  one — ACH exists specifically to counter confirmation bias, and highlighting a leading
  hypothesis defeats the method.
- ACH is scored by **disconfirmation**: the informative signal is inconsistency. Evidence rows
  with the highest diagnosticity sort to the top, and diagnosticity is shown as a mono numeral.
- Non-diagnostic rows (diagnosticity `0`) are **retained and marked**, never hidden. How much of
  the evidence base was inert is itself a finding.
- Each hypothesis column shows its **coverage count**; a `LOW COVERAGE` hypothesis carries that
  label as text, because a hypothesis leading by absence of evidence must not read the same as
  one leading by weight of it.
- **Critical evidence** (items whose removal flips the ranking) is marked in the row, with its
  verification status adjacent.
- Evidence rows carry their status treatment from `MIE_DESIGN_ADAPTATION.md` §6, and their
  source reference.
- Rows are never colored by whether they support the leading hypothesis.

## 17. Source-Confidence Displays

- Source quality (0–100, `docs/08-SCORING.md`) renders as a **mono numeral plus its band
  label** — never a bare colored bar or a star rating. A bar invites comparison the score
  does not support.
- The score's contributing factors (authority, recency, relevance, contradiction coverage,
  settlement specificity, completeness) are inspectable, not collapsed into an opaque number.
- Source recency always shows **absolute date and relative age**: `2026-07-12 · 19d`.
- Corroboration count is explicit: `CORROBORATED ×3`.
- **Never display a source-quality score without its source.** An unattributed quality score
  is unauditable and violates the project's evidence-traceability requirement.
- Unreachable or paywalled sources render `--danger` with `UNVERIFIABLE` and are **never**
  silently dropped from counts. A count that excludes failures overstates evidence strength.

## 18. Conformance Checklist

A chart ships only when all of these hold:

- [ ] Textual alternative states the conclusion with numbers (§13)
- [ ] Provenance block present; snapshot timestamp is the data's, not the render's (§14)
- [ ] Probability/price axes full-range `0`–`1`, labeled with units (§15)
- [ ] No dual axes, no truncation, no unlabeled log scale (§15)
- [ ] Every series differentiated by shape or dash, not hue alone (§3, §12)
- [ ] `--signal` and `--warning` not adjacent categorical series (§12)
- [ ] Legible in greyscale (§12)
- [ ] Meaning-bearing marks ≥3:1 contrast (§3)
- [ ] Uncertainty shown where it exists; band meaning labeled (§6)
- [ ] YES/NO and evidence-for/against treated equivalently (§5, §8)
- [ ] Fully legible as a static image; no meaning in hover or motion (§2)
- [ ] Reduced-motion honored; no animated values (`MIE_DESIGN_ADAPTATION.md` §12.3)
- [ ] No new tokens introduced (snapshot §4)
