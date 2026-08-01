# Reports

Generated reports and report templates live here.

MVP report types:

- Daily market intelligence report.
- Weekly calibration report.
- Market dossier.
- Settlement postmortem.

## Structure

```text
reports/
├── templates/     # committed report templates
└── generated/     # generated output — git-ignored
```

Generated local output goes under `reports/generated/`, which is ignored by git.

## Standard

Report structure is fixed by [`docs/design/ANALYST_REPORT_STANDARD.md`](../docs/design/ANALYST_REPORT_STANDARD.md).

Because the MVP has no frontend, the report **is** the product surface — that standard is an
acceptance contract, not a style guide. A report ships only when it passes the §14 conformance
checklist.

Key requirements:

- Front matter with `snapshot_at` (the data's timestamp) distinct from `generated_at`.
- Fixed section and table column order across every run.
- Every substantive claim labeled `[FACT]` / `[ASSUMPTION]` / `[INFERENCE]` / `[SPECULATION]` /
  `[OPINION]`, per `docs/01-PRD.md` US-006.
- Every `[FACT]` resolving to a Source Appendix entry; failed sources listed, never dropped.
- Evidence For and Against structurally identical.
- Partial runs labeled inline at every affected value.
- YES and NO given equivalent treatment — no outcome-directional framing or coloring.
