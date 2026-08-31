# Reports

Generated reports and report templates will live here. This directory currently contains only
this README; neither subdirectory below exists yet.

MVP report types:

- Daily market intelligence report.
- Weekly calibration report.
- Market dossier.
- Settlement postmortem.

## Planned structure

```text
reports/
├── templates/     # committed report templates — not created yet
└── generated/     # generated output — git-ignored, never committed
```

Generated local output will go under `reports/generated/`, which is already ignored by git.

## Standard

Report structure is fixed by [`docs/design/ANALYST_REPORT_STANDARD.md`](../docs/design/ANALYST_REPORT_STANDARD.md).

Because the MVP has no frontend, the report **is** the product surface — that standard is an
acceptance contract, not a style guide. A report ships only when it passes the §14 conformance
checklist.

Key requirements (§ references point at the standard; §14 is the full checklist):

- Front matter with `snapshot_at` (the data's timestamp) distinct from `generated_at` (§3.1).
- Fixed section and table column order across every run (§3.2).
- Every substantive claim labeled `[FACT]` / `[ASSUMPTION]` / `[INFERENCE]` / `[SPECULATION]` /
  `[OPINION]`, per `docs/01-PRD.md` US-006 (§4).
- Every `[FACT]` resolving to a Source Appendix entry; failed sources listed, never dropped
  (§4, §9).
- Evidence For and Against structurally identical (§5).
- Partial runs labeled inline at every affected value (§3.3).
- YES and NO given equivalent treatment — no outcome-directional framing or coloring (§6).
