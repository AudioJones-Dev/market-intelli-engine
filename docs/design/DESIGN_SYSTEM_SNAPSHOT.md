---
title: 'MIE Design System Snapshot'
status: 'controlled read-only snapshot'
snapshot_version: '1.0.0'
snapshot_date: '2026-07-31'
design_language: 'Editorial Intelligence Systems'
local_policy:
  editable: false
  update_method: controlled-resnapshot
---

# Design System Snapshot — Market Intelligence Engine

**This file is a controlled, read-only snapshot. Do not edit token values here.**

Market Intelligence Engine does not own a visual identity. It inherits the canonical
Audio Jones / AJ Digital **Editorial Intelligence Systems** design language. This document
pins the exact upstream state that MIE is built against, so that divergence between MIE and
the canonical system is _detectable_ rather than silent.

## 1. Canonical Source

```yaml
canonical_source:
  repository: AudioJones-Dev/audiojones.com
  path: docs/design/DESIGN.md
  document_version: '2.0.0'
  document_last_updated: '2026-05-23'
  source_commit: 8c27a8ab0f3bf83a7e3945cae50d92473a6e5c10 # last commit touching docs/design/DESIGN.md
  source_commit_date: '2026-06-14'
  repo_head_at_snapshot: 8ab7de423715883423622d95e65add1385f7a124
  repo_head_date: '2026-07-06'
  implementation_of_record: src/app/globals.css

corroborating_source:
  repository: AudioJones-Dev/WEAREAJDIGITAL.COM
  paths:
    - docs/DESIGN.md
    - docs/design/globals.reference.css
    - src/app/globals.css
  source_commit: 7328768ee407481841f4a4261692e3083f143eaf
  source_commit_date: '2026-06-04'
  role: 'Independent second implementation. Used to confirm token agreement, not as canon.'

local_policy:
  editable: false
  update_method: controlled-resnapshot
  token_drift: prohibited
  new_tokens: prohibited-without-upstream-adoption
```

Both source repositories were inspected directly at the commits above. Where the canonical
**document** and the canonical **implementation** disagree, this snapshot records the conflict
in §5 rather than silently picking a winner.

## 2. Precedence

When sources conflict, resolve in this order:

1. **Canonical implementation** — `audiojones.com` `src/app/globals.css`. Shipped values are truth.
2. **Canonical document** — `audiojones.com` `docs/design/DESIGN.md`. Intent and rules.
3. **This snapshot** — MIE's pinned view of 1 and 2.
4. **`MIE_DESIGN_ADAPTATION.md`** — domain semantics only. May _assign meaning_ to a token;
   may never _change_ a token's value.

MIE-local documents can never outrank upstream. If MIE needs a value that does not exist
upstream, that is an upstream request (§4), not a local addition.

## 3. Snapshot — Inherited Tokens

These are recorded for reference and drift detection. They are **not** a place to make changes.

### 3.1 Color — brand accents

| Token             | Value     | Canonical role                                                           |
| ----------------- | --------- | ------------------------------------------------------------------------ |
| `--signal-yellow` | `#E8FF5A` | Primary accent. Signal emergence, strategic activation, operator action. |
| `--signal-soft`   | `#F0FF85` | Hover / lighter signal variation.                                        |
| `--accent-blue`   | `#4DACFF` | Data, links, system framework, structural accents.                       |
| `--accent-red`    | `#FF4545` | Critical / destructive / P0.                                             |
| `--accent-amber`  | `#FFB340` | Warning / partial readiness / P1.                                        |
| `--accent-green`  | `#3DFFB0` | Positive operational state, completion.                                  |

### 3.2 Color — dark surfaces (primary canvas)

| Token             | Value     | Canonical role                                                                              |
| ----------------- | --------- | ------------------------------------------------------------------------------------------- |
| `--bg-base`       | `#080808` | Page background — base operational canvas.                                                  |
| `--surface-1`     | `#0F0F0F` | Card / alternating section background.                                                      |
| `--surface-2`     | `#161616` | Elevated card / table head / structural container.                                          |
| `--border-subtle` | `#1E1E1E` | Default structural borders.                                                                 |
| `--border-strong` | `#2A2A2A` | Emphasized hierarchy / active borders.                                                      |
| `--text-primary`  | `#E8E8E8` | Body text default.                                                                          |
| `--text-muted`    | `#808080` | Muted metadata, labels, timestamps. **See §5.1 — implementation value, not the doc value.** |

### 3.3 Color — light split (`.surface-light`, opt-in)

| Token            | Value     | Canonical role                                        |
| ---------------- | --------- | ----------------------------------------------------- |
| `--paper`        | `#F8FAFC` | Light clarity layer. Opt-in only; dark stays primary. |
| `--surface`      | `#F5F5F5` | Light surface.                                        |
| `--surface-soft` | `#EEF2F6` | Light secondary surface.                              |
| `--ink`          | `#111111` | Light-surface primary text.                           |
| `--ink-muted`    | `#4B5563` | Light-surface secondary text.                         |

**The accent palette in §3.1 is not usable as text on these surfaces.** See §5.2.

### 3.4 Semantic aliases

| Alias       | Resolves to            |
| ----------- | ---------------------- |
| `--signal`  | `var(--signal-yellow)` |
| `--system`  | `var(--accent-blue)`   |
| `--metric`  | `var(--signal-yellow)` |
| `--success` | `var(--accent-green)`  |
| `--warning` | `var(--accent-amber)`  |
| `--danger`  | `var(--accent-red)`    |

Components reference **aliases**, never raw hex.

### 3.5 Typography

| Token             | Family  | Weights                      | Role                                               |
| ----------------- | ------- | ---------------------------- | -------------------------------------------------- |
| `--font-headline` | Syne    | 500–800                      | Display and all heading levels.                    |
| `--font-accent`   | Syne    | 500–800                      | Editorial accents (V2 collapses onto Syne).        |
| `--font-body`     | DM Sans | 300/400/500/700 + italic 400 | Body, UI, paragraph copy.                          |
| `--font-mono`     | DM Mono | 400/500                      | Labels, data, metrics, timestamps, system markers. |

Fallback stacks (Space Grotesk, Inter, monospace defaults) are inherited verbatim.
**No new font dependencies.**

### 3.6 Spacing, radius, motion

```yaml
spacing:
  { xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px, 4xl: 96px, 5xl: 128px }
radius: { sm: 6px, md: 10px, lg: 16px, card: 20px, panel: 24px, pill: 9999px } # see §5.3 — unresolved upstream
motion:
  easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)'
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)'
  durFast: '120ms'
  durBase: '180ms'
  durSlow: '320ms'
```

### 3.7 Inherited prohibitions

Carried over verbatim from canonical §16 and binding on MIE:

generic AI purple gradients · playful SaaS aesthetics · confetti / gamification ·
excessive glassmorphism · 3D blobs · neon cyberpunk clichés · over-rounded consumer UI ·
template-driven layouts · noisy dashboard clutter · unnecessary animation ·
arbitrary color additions · soft edtech styling · ecommerce urgency styling ·
discount/sale-style accent usage · vague AI chatbot visuals ·
decorative effects that don't clarify hierarchy

## 4. Resnapshot Process

A resnapshot is the **only** sanctioned way this file changes.

1. **Detect.** Diff upstream `docs/design/DESIGN.md` and `src/app/globals.css` against the
   `source_commit` recorded in §1.
2. **Review.** Classify each change:
   - _Value change_ to an inherited token → assess MIE impact, especially contrast (§5) and
     any chart scale in `DATA_VISUALIZATION_STANDARD.md`.
   - _New token_ → decide whether MIE adopts it. Adoption is opt-in, not automatic.
   - _Rule change_ → check for conflict with `MIE_DESIGN_ADAPTATION.md` semantics.
   - _Brand doctrine / voice change_ → **out of scope for design adoption.** Route to the
     brand owner. Do not encode voice or positioning in MIE design docs.
3. **Verify contrast.** Any changed color must be re-checked against the acceptance criteria
   in `MIE_DESIGN_ADAPTATION.md` §11 before adoption. Upstream AA claims are not accepted
   on trust — §5.1 exists because one did not hold.
4. **Propose.** Open a PR that updates _only_ this file plus any MIE doc whose semantics
   changed. Bump `snapshot_version`. Update `source_commit`.
5. **Approve.** Human approval required. Upstream changes are **not** auto-adopted; a
   canonical change is a proposal to MIE, not an instruction.
6. **Record.** Append to §6.

**Upstream changes require review before adoption.** MIE may lag canonical deliberately —
lagging with a recorded SHA is a governed state; drifting without one is not.

### Prohibited without resnapshot

- Editing any value in §3.
- Introducing a color, font, spacing step, radius, or motion curve not in §3.
- Re-mapping a semantic alias to a different raw value.
- Adopting an upstream change by copying it into MIE docs without updating `source_commit`.

## 5. Known Conflicts and Drift at Snapshot Time

These are recorded, not resolved. Each is flagged for the human decisions listed in §7.

### 5.1 `--text-muted` — canonical document is stale, and the stale value fails AA

| Source                                                      | Value     |
| ----------------------------------------------------------- | --------- |
| `audiojones.com` `docs/design/DESIGN.md` §5.1 (`textMuted`) | `#666666` |
| `audiojones.com` `src/app/globals.css`                      | `#808080` |
| `WEAREAJDIGITAL.COM` `src/app/globals.css`                  | `#808080` |

Both shipped implementations agree on `#808080` and both annotate it as a deliberate bump
for WCAG AA. The canonical document was not updated to match.

Measured contrast (WCAG 2.1 relative luminance):

| Foreground                 | on `#080808` | on `#0F0F0F` | on `#161616` |
| -------------------------- | -----------: | -----------: | -----------: |
| `#666666` (document)       |         3.49 |         3.34 |         3.15 |
| `#808080` (implementation) |         5.07 |         4.85 |         4.58 |

`#666666` fails the 4.5:1 body-text threshold on every MIE surface.

**MIE resolution:** `--text-muted` is `#808080`. Per §2, implementation outranks document.
This is load-bearing for MIE specifically — muted text carries timestamps, source labels,
and provenance markers, which are exactly the values an analyst must be able to read.
An upstream doc correction is requested (§7, D-1).

### 5.2 Accent palette is unusable as text on the paper surface

Measured contrast against `--paper` `#F8FAFC`:

| Foreground                  | Ratio | AA body (4.5) | AA large / UI (3.0) |
| --------------------------- | ----: | ------------- | ------------------- |
| `--ink` `#111111`           | 18.05 | pass          | pass                |
| `--accent-red` `#FF4545`    |  3.24 | **fail**      | pass                |
| `--accent-blue` `#4DACFF`   |  2.32 | **fail**      | **fail**            |
| `--accent-amber` `#FFB340`  |  1.70 | **fail**      | **fail**            |
| `--accent-green` `#3DFFB0`  |  1.24 | **fail**      | **fail**            |
| `--signal-yellow` `#E8FF5A` |  1.06 | **fail**      | **fail**            |

The palette is tuned for a dark canvas. On paper it collapses — signal-yellow at 1.06:1 is
effectively invisible.

This is material for MIE because paper mode is the intended surface for printable dossiers,
exports, and postmortems. Upstream has not needed paper-mode accents because its light split
is used for comparison panels, not for accent-bearing analytical content.

**MIE resolution (constraint, not a new token):** on paper surfaces, accent colors may be
used only as **fills, rules, and area marks that carry a redundant text label**. They may
never be used as text, as thin strokes, or as the sole encoding of meaning. Paper-mode text
is `--ink` / `--ink-muted`. Enforced in `ANALYST_REPORT_STANDARD.md` and
`DATA_VISUALIZATION_STANDARD.md`.

A paper-mode accent set is requested upstream (§7, D-2). MIE **must not** invent one.

### 5.3 Unresolved upstream decisions inherited as open

Canonical `DESIGN.md` §19 records these as deferred and unowned. MIE inherits the ambiguity
and must not resolve it locally:

- **Radius.** External Brand Kit specifies `4px` everywhere; implementation ships `10px`
  controls / `20px` cards with documented rationale. MIE pins the **implementation** values
  in §3.6 and will follow whichever way upstream settles.
- **Container width.** Five values across sources (`1180/1360`, `1200/1440`, `1280`). MIE
  has no shipped UI, so this is inert today. It must be resolved before any frontend ADR.

### 5.4 Product-noun divergence between the two canonical repos

`audiojones.com` uses "Founder Intelligence Systems" (rebranded 2026-06-14, commit `8c27a8a`).
`WEAREAJDIGITAL.COM` still uses "Applied Intelligence Systems" (2026-06-04).

This is **brand doctrine, not a design token.** MIE takes no position and uses neither noun.
Flagged for the brand owner (§7, D-3). MIE inherits the _visual_ system only.

## 6. Snapshot History

| Version | Date       | Source commit | Change                                                                                                                    |
| ------- | ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2026-07-31 | `8c27a8ab`    | Initial snapshot. Records V2 Editorial Intelligence Systems tokens, four drift findings (§5), and the resnapshot process. |

## 7. Human Decisions Required

| ID  | Decision                                                                                                                                                                  | Owner                   | Blocking?                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ----------------------------------- |
| D-1 | Correct `--text-muted` to `#808080` in canonical `DESIGN.md` §5.1                                                                                                         | Design owner (upstream) | No — MIE follows implementation     |
| D-2 | Define a paper-mode accent set upstream, or ratify MIE's fills-with-labels constraint                                                                                     | Design owner (upstream) | Blocks accent-bearing paper exports |
| D-3 | Reconcile "Founder" vs "Applied" Intelligence Systems                                                                                                                     | Brand owner             | No — MIE uses neither               |
| D-4 | Ratify this snapshot as MIE's binding visual contract                                                                                                                     | Operator                | Yes                                 |
| D-5 | Ratify single-hue alpha ramps as the sanctioned sequential chart scale (`DATA_VISUALIZATION_STANDARD.md` §11.2) — introduces no new hue but does introduce derived values | Design owner            | Blocks sequential-scale charts      |
| D-6 | Supply the MIOS methodology that defines MIE's ACH procedure — **absent from this repository** (`DATA_VISUALIZATION_STANDARD.md` §16)                                     | Operator                | Blocks ACH output                   |
| D-7 | Resolve upstream radius and container-width ambiguity (§5.3)                                                                                                              | Design owner (upstream) | Blocks frontend ADR                 |
