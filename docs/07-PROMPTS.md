# 07 — Prompt Contracts

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft

## Prompt Governance

No production AI call may use an unversioned prompt.

Every prompt must define:

- Prompt ID.
- Version.
- Purpose.
- Inputs.
- Constraints.
- Output schema.
- Model.
- Temperature.
- Failure behavior.

## Prompt ID Format

```text
MIE-[DOMAIN]-[TASK]-vMAJOR.MINOR.PATCH
```

Example:

```text
MIE-RESEARCH-DOSSIER-v0.1.0
```

## Required Prompt Contracts

### MIE-RESEARCH-DOSSIER-v0.1.0

Purpose: gather structured evidence for a market.

Inputs:

- Market title.
- Ticker.
- Outcome condition.
- Expiration/settlement date.
- Category.
- Settlement source.

Output schema:

```json
{
  "summary": "string",
  "facts": ["string"],
  "evidence_for": ["string"],
  "evidence_against": ["string"],
  "unknowns": ["string"],
  "sources": [{"title": "string", "url": "string", "quality": "high|medium|low"}],
  "research_quality_score": 0
}
```

Constraints:

- Separate facts from inference.
- Include contradictory evidence.
- Mark missing evidence.
- Do not produce a recommendation.
- Record an evidence **tier** per item (`docs/20-MIOS-METHODOLOGY.md` §4.1). MIE operates from
  Tier 2 onward; Tier 1 personal observation is unavailable to a batch system.
- Search- and social-trend evidence must be **seasonally adjusted** (multi-year view) or
  explicitly labelled unadjusted. An unadjusted trend spike is not evidence of change.
- Tier 3/4 saturation (mainstream media, analyst coverage) is recorded as an observation about
  **information diffusion**, not as support for the outcome. It feeds the economic-risk flags in
  Layer 3, never the probability estimate (`docs/20-MIOS-METHODOLOGY.md` §4.2).

### MIE-PROBABILITY-ESTIMATE-v0.1.0

Purpose: estimate event probability from evidence.

Inputs:

- Market question.
- Settlement rules.
- Evidence dossier.
- Unknowns.

Output schema:

```json
{
  "estimated_probability": 0.0,
  "confidence_score": 0,
  "assumptions": ["string"],
  "key_evidence": ["string"],
  "counterarguments": ["string"],
  "invalidation_conditions": ["string"],
  "reasoning_summary": "string"
}
```

Constraints:

- Probability must be between 0 and 1.
- Confidence must be between 0 and 100.
- Do not use market price unless explicitly provided in input.
- Do not imply certainty.

### MIE-ACH-MATRIX-v0.1.0

Purpose: enumerate competing resolution hypotheses and score the evidence against them.
Procedure is defined in `docs/21-ACH-PROCEDURE.md`.

Inputs:

- Market question.
- Settlement rules.
- Normalized evidence dossier with per-item IDs, quality scores, and status.

Output schema:

```json
{
  "hypotheses": [
    {
      "id": "H1",
      "statement": "string",
      "settles": "YES|NO|AMBIGUOUS"
    }
  ],
  "cells": [
    {
      "evidence_id": "E1",
      "hypothesis_id": "H1",
      "score": 2,
      "rationale": "string"
    }
  ],
  "excluded_evidence": [{ "evidence_id": "string", "reason": "string" }],
  "ach_procedure_version": "v1"
}
```

Constraints:

- Minimum 3, maximum 7 hypotheses; each a distinct causal path, not a bare outcome.
- Include a settlement-ambiguity hypothesis wherever resolution criteria are contestable.
- **Enumerate hypotheses before seeing any probability estimate.** Do not designate a preferred
  hypothesis.
- Cell scores are integers in `[-2, 2]`; every non-zero cell carries a rationale citing the
  evidence item.
- Do not omit a hypothesis for seeming unlikely. Do not pad the set to reach three — return
  insufficient instead.
- Do not compute a probability. Diagnosticity, inconsistency, coverage, and sensitivity are
  computed deterministically outside the model.

### MIE-COUNTERARGUMENT-v0.1.0

Purpose: produce the strongest opposing case, informed by the ACH matrix.

Output schema:

```json
{
  "strongest_opposing_case": "string",
  "missing_evidence": ["string"],
  "failure_modes": ["string"],
  "probability_adjustment_risk": "low|medium|high"
}
```

### MIE-REPORT-DAILY-v0.1.0

Purpose: create human-readable daily report from structured records.

Required sections:

- Executive summary.
- Top opportunities.
- Watch list.
- Pass/avoid list.
- Evidence highlights.
- Counterarguments.
- Unknowns.
- Calibration notes if available.

Constraints:

- Never say the system is certain.
- Always label recommendation as research only.
- Use concise explanation.

## Prompt Test Requirements

Each prompt must be tested against:

- Valid input.
- Missing evidence.
- Contradictory evidence.
- Ambiguous settlement condition.
- Low-quality sources.
- Invalid model output.

## Prompt Change Policy

A prompt version change requires:

- Version bump.
- Changelog entry.
- Test fixture update.
- ADR if it changes recommendation behavior.