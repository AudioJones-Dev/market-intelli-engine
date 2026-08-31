# 17 — Shared Contract Candidates

**Project:** Market Intelligence Engine (MIE)
**Version:** 0.1 specification draft
**Status:** Candidate register — **authorizes nothing**

> **Numbering note.** Proposed as `16-` in the originating brief; `docs/16-GOVERNANCE.md`
> already exists, so this document takes `17-`. The reproducibility and promotion documents
> shift to `18-` and `19-` correspondingly.

## Purpose

Document concepts in Market Intelligence Engine that may later be reusable across forecasting,
research, simulation, and trading-intelligence systems.

This document identifies possible shared contracts but **does not authorize package
extraction**. It exists so that a future extraction decision has a written starting point
instead of an archaeology exercise — and so that "we'll share this later" stops being an
argument for building it generically now.

## YAGNI Policy

A contract must not be moved into a shared package until:

1. At least two implemented systems require it.
2. Both systems use substantially the same semantics.
3. The abstraction reduces duplication without increasing coupling.
4. Ownership and versioning are defined.
5. Migration costs are justified.
6. An ADR approves extraction.

**Naming similarity alone is not sufficient evidence that two concepts should share an
implementation.** Two systems both having a thing called `Recommendation` says nothing about
whether they mean the same thing by it.

Until every condition holds, these contracts live inside MIE, in MIE's own tables and types.
One implemented system is not evidence of a general pattern — it is evidence of one
implementation.

## Candidate Contracts

Each candidate lists the concepts a shared version would need. Field names below are
descriptive, not normative; MIE's own naming lives in `docs/03-DATA-MODEL.md`.

### WorkflowRun

Represents one orchestrated workflow execution.

Required concepts: workflow run ID · workflow name · workflow version · status · trigger type ·
start time · end time · input reference · output reference · retry count · failure stage ·
error reference · parent workflow run ID · correlation ID.

> MIE today implements a subset in `workflow_runs` (`docs/03-DATA-MODEL.md`). Workflow version,
> trigger type, retry count, failure stage, parent run, and correlation ID are **not yet
> present** and are required by `docs/18-DECISION-REPRODUCIBILITY.md`.

### EvidenceRecord

Represents one normalized piece of evidence.

Required concepts: evidence ID · subject or market ID · claim · evidence type · supporting or
opposing classification · source reference · source authority · source recency · directness ·
provenance · retrieved timestamp · contradiction state · extraction method · confidence or
quality score.

> MIE today stores evidence as `jsonb` blobs inside `research_dossiers`, not as addressable
> rows. Per-item IDs are a prerequisite for the reproducibility manifest.

### DecisionRecord

Represents one system recommendation or decision-support output.

Required concepts: decision ID · subject ID · workflow run ID · decision type · recommendation ·
estimated probability · confidence · assumptions · counterarguments · unknowns · invalidation
conditions · scoring-policy version · created timestamp · human disposition.

### AgentExecution

Represents one bounded agent invocation.

Required concepts: execution ID · agent ID · agent version · prompt ID · prompt version ·
provider · model · input schema version · output schema version · workflow run ID · start time ·
end time · status · retry count · error reference · token or cost metadata where available.

> MIE has **no** agent-execution record today. Model and prompt version are recorded per
> estimate, not per invocation, so a retried or multi-call stage is not currently reconstructable.

### SourceProvenance

Represents the origin and retrieval context of evidence.

Required concepts: source ID · canonical URL · publisher · author when available · published
date · retrieved date · content hash · source type · authority classification · original
provider response reference.

> Content hashing is what makes a source claim verifiable after the page changes. See
> `docs/18-DECISION-REPRODUCIBILITY.md`.

### ModelVersion

Represents the model and configuration used for an analysis.

Required concepts: provider · model identifier · model version when available · temperature ·
tool configuration · system-prompt version · prompt-template version · execution date.

### Recommendation

Represents a human-reviewable recommendation.

MIE recommendation values: `buy_candidate` · `watch` · `pass` · `avoid`.

**A recommendation is not an execution instruction** (`adr/0008-mie-domain-boundary.md`).

Future systems may use a different recommendation taxonomy and **must not** be forced to inherit
MIE-specific values. This is the clearest example of a contract that looks shareable and is not:
the shape is generic, the vocabulary is domain-bound, and the thresholds behind it
(`docs/08-SCORING.md`) are Kalshi-specific.

### HumanApproval

Represents a consequential human review.

Required concepts: approval ID · decision ID · reviewer ID · disposition · timestamp · comments ·
conditions · policy version · expiration time where applicable.

### OutcomeRecord

Represents the realized outcome used to evaluate a prior forecast.

Required concepts: outcome ID · subject ID · settlement status · outcome value · settlement
source · settlement timestamp · verification state · dispute or ambiguity note.

### CalibrationRecord

Represents the evaluation of a forecast against an outcome.

Required concepts: calibration ID · decision ID · outcome ID · estimated probability · actual
outcome · Brier score · probability bucket · category · model version · prompt version ·
scoring-policy version.

> Attribution fields (model, prompt, scoring-policy version) are what make calibration
> actionable rather than merely descriptive — see `docs/09-CALIBRATION.md`.

## Explicitly Domain-Specific Concepts

The following should remain MIE-specific unless future evidence supports generalization:

- Kalshi ticker semantics;
- YES and NO contract fields;
- binary contract settlement;
- Kalshi implied-probability calculations;
- prediction-market expected-value formulas;
- settlement-rule interpretation;
- MIE recommendation thresholds;
- Kalshi liquidity rules.

Binary settlement is the load-bearing assumption. A forecasting system over continuous,
multi-outcome, or scalar events shares almost none of MIE's scoring layer, and a "shared"
abstraction that accommodates both would be an interface with no behavior.

## Extraction Gate

Before extracting any shared contract, produce an ADR containing:

- both consuming systems;
- semantic comparison;
- differences and incompatibilities;
- proposed package ownership;
- versioning policy;
- backward-compatibility policy;
- migration plan;
- rollback plan.

The ADR must name the **second** consuming system and describe its implemented use. A planned,
proposed, or hypothetical second consumer does not satisfy the gate.

## Acceptance Criteria

- Shared candidates are documented.
- No shared package is created.
- Kalshi-specific fields remain inside the MIE domain.
- Interfaces use explicit schema versions.
- Future extraction requires an ADR.
- MIE implementation remains independently deployable.
