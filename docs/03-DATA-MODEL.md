# 03 — Data Model

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft  
**Status:** Data model specification

## System of Record

Supabase Postgres is the MVP system of record.

## Data Model Principles

1. Store raw provider responses.
2. Store normalized records separately.
3. Preserve timestamps for reproducibility.
4. Never overwrite prediction ledger entries.
5. Version prompts, models, formulas, and schemas.
6. Prefer append-only records for forecasts and outcomes.
7. Every decision-producing input is immutable or content-addressed. New information creates a
   new record, never an update (`docs/18-DECISION-REPRODUCIBILITY.md`).
8. No version column may hold `latest`, `current`, or `production`. Those name a moving pointer,
   not a reconstructable state.
9. Forecast, economic score, and recommendation are separate records
   (`docs/08-SCORING.md`). A forecast must be storable with no market price present.

## Core Tables

### `providers`

Tracks external providers.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | text | `kalshi`, `perplexity`, `openai` |
| provider_type | text | market, research, model, delivery |
| config_json | jsonb | Non-secret config only |
| is_active | boolean | Provider enabled flag |
| created_at | timestamptz | Insert time |

### `market_snapshots`

Immutable snapshots of provider market data.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| provider | text | `kalshi` for MVP |
| ticker | text | Market ticker |
| event_ticker | text | Event/group ticker where available |
| title | text | Market title |
| category | text | Provider category |
| status | text | open/closed/settled/etc. |
| close_time | timestamptz | Market close time |
| yes_bid | numeric | Best yes bid if available |
| yes_ask | numeric | Best yes ask if available |
| last_price | numeric | Last trade price if available |
| volume | numeric | Provider volume field |
| open_interest | numeric | Provider open interest field |
| raw_json | jsonb | Full provider payload |
| ingested_at | timestamptz | Snapshot time |

Indexes:

- `(provider, ticker)`
- `(ingested_at)`
- `(status, close_time)`

### `research_queue`

Bounded list of markets selected for research.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| market_snapshot_id | uuid | FK to market_snapshots |
| rank | integer | Rank within run |
| opportunity_score | numeric | Ranking score |
| reason | text | Why selected |
| run_id | uuid | FK to workflow_runs |
| created_at | timestamptz | Insert time |

### `research_dossiers`

Stores raw and normalized research output.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| market_snapshot_id | uuid | FK |
| provider | text | `perplexity` for MVP |
| prompt_version | text | Research prompt version |
| raw_response | jsonb | Full provider response |
| facts | jsonb | Structured facts |
| evidence_for | jsonb | Supporting evidence |
| evidence_against | jsonb | Contradictory evidence |
| unknowns | jsonb | Missing/uncertain items |
| sources | jsonb | URLs and metadata |
| research_quality_score | numeric | 0-100 |
| created_at | timestamptz | Insert time |

### `probability_estimates`

Stores model-generated probability outputs.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| market_snapshot_id | uuid | FK |
| research_dossier_id | uuid | FK |
| model_provider | text | e.g. openai |
| model_name | text | model identifier |
| prompt_version | text | Probability prompt version |
| estimated_probability | numeric | 0.0 to 1.0 |
| confidence_score | numeric | 0-100 |
| assumptions | jsonb | Explicit assumptions |
| counterarguments | jsonb | Opposing case |
| invalidation_conditions | jsonb | What would change estimate |
| raw_response | jsonb | Full model output |
| created_at | timestamptz | Insert time |

### `recommendations`

Stores EV and recommendation output.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| market_snapshot_id | uuid | FK |
| probability_estimate_id | uuid | FK |
| market_probability | numeric | Derived from price |
| estimated_probability | numeric | From probability_estimates |
| edge | numeric | estimated minus market |
| expected_value | numeric | EV per contract |
| research_grade | text | A/B/C/D/F |
| recommendation | text | buy_candidate/watch/pass/avoid |
| rationale | text | Human-readable summary |
| created_at | timestamptz | Insert time |

### `prediction_ledger`

Append-only canonical forecast record.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| recommendation_id | uuid | FK |
| ticker | text | Market ticker |
| prediction_timestamp | timestamptz | Published time |
| market_snapshot_json | jsonb | Frozen market state |
| evidence_snapshot_json | jsonb | Frozen evidence state |
| model_snapshot_json | jsonb | Prompt/model/formula versions |
| estimated_probability | numeric | Forecast probability |
| market_probability | numeric | Market probability |
| recommendation | text | Final recommendation |
| is_final | boolean | Immutable once true |

### `decision_journal`

Captures reasoning summary and retrospective.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| ledger_id | uuid | FK |
| reasoning_summary | text | Concise explanation |
| strongest_case_for | text | Supportive argument |
| strongest_case_against | text | Opposing argument |
| known_unknowns | text | Missing evidence |
| post_settlement_review | text | Filled after settlement |
| created_at | timestamptz | Insert time |
| updated_at | timestamptz | Last update |

### `outcomes`

Stores settlement result.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| ledger_id | uuid | FK |
| ticker | text | Market ticker |
| resolved_outcome | boolean | True if forecasted event occurred |
| settlement_value | numeric | 0 or 1 where applicable |
| settlement_source | text | Source used |
| settled_at | timestamptz | Settlement timestamp |
| raw_settlement_json | jsonb | Provider settlement payload |

### `calibration_scores`

Stores forecast scoring.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| ledger_id | uuid | FK |
| brier_score | numeric | `(probability - outcome)^2` |
| log_loss | numeric | Optional if valid inputs available |
| probability_bucket | text | e.g. 60-70% |
| realized_ev | numeric | If simulated position exists |
| scored_at | timestamptz | Score time |

### `workflow_runs`

Tracks scheduled jobs.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| workflow_name | text | ingestion/research/report/etc. |
| status | text | running/succeeded/failed/partial |
| started_at | timestamptz | Start |
| ended_at | timestamptz | End |
| input_json | jsonb | Parameters |
| output_json | jsonb | Counts/results |
| error_json | jsonb | Error details |

## Scoring-Layer and Reproducibility Records

> **Status: proposed, not yet migrated.** The baseline migration
> `database/migrations/0001_initial_schema.sql` has shipped and implements `recommendations` as
> a **single combined table** holding market probability, estimated probability, edge, EV,
> research grade, and recommendation label together. The records below split that into three,
> and add records that do not exist at all.
>
> This is a schema change after baseline and therefore **requires an ADR and a new migration**
> (`docs/14-ADR.md`). Existing rows must be migrated or the old table retained and deprecated —
> the prediction ledger references `recommendation_id`, so it cannot simply be dropped.

These records implement the four-layer separation in `docs/08-SCORING.md` and the decision
manifest in `docs/18-DECISION-REPRODUCIBILITY.md`.

### `forecasts`

Layer 1 output. **Must remain valid even if no market price is available.**

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| market_id | uuid | Subject market |
| research_dossier_id | uuid | FK to evidence |
| estimated_probability | numeric | 0.0 to 1.0 |
| probability_low | numeric | Range lower bound, nullable |
| probability_high | numeric | Range upper bound, nullable |
| confidence_score | numeric | 0-100 |
| research_grade | text | A/B/C/D/F |
| assumptions | jsonb | Explicit assumptions |
| counterarguments | jsonb | Opposing case |
| invalidation_conditions | jsonb | What would change the estimate |
| forecast_method_version | text | e.g. `probability-policy-v1` |
| market_price_visible_during_estimation | boolean | Anchoring control state |
| ach_matrix_id | uuid | FK to ach_matrices |
| signal_class | text | Signal class that generated the forecast — per-class calibration (`docs/09-CALIBRATION.md`) |
| created_at | timestamptz | Insert time |

### `ach_matrices`

Immutable Analysis of Competing Hypotheses record. Procedure: `docs/21-ACH-PROCEDURE.md`.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| market_snapshot_id | uuid | FK |
| research_dossier_id | uuid | FK |
| hypotheses | jsonb | id, statement, settles (YES/NO/AMBIGUOUS) |
| cells | jsonb | evidence_id, hypothesis_id, score (-2..2), rationale |
| excluded_evidence | jsonb | Retained with exclusion reason — never dropped |
| diagnosticity | jsonb | Per evidence item |
| inconsistency | jsonb | Weighted inconsistency per hypothesis |
| coverage | jsonb | Diagnostic-item count per hypothesis |
| leading_hypothesis_id | text | Lowest weighted inconsistency |
| low_coverage_flag | boolean | Leader leads by absence of evidence |
| critical_evidence_ids | jsonb | Items whose removal flips the ranking |
| ach_procedure_version | text | e.g. `v1` |
| created_at | timestamptz | Insert time |

No probability column. ACH produces a ranking, never a probability
(`docs/21-ACH-PROCEDURE.md` §9).

No price, edge, or EV column appears here. That is the point of the separation.

### `economic_scores`

Layer 3 output. **Must reference a specific market snapshot.**

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| forecast_id | uuid | FK to forecasts |
| market_snapshot_id | uuid | FK to market_snapshots — required |
| market_probability | numeric | Derived from price |
| price_mode | text | conservative_ask / midpoint / last |
| executable_price | numeric | Side-appropriate price used |
| spread | numeric | Where available |
| liquidity_status | text | acceptable / thin / unacceptable |
| spread_status | text | acceptable / wide |
| raw_edge | numeric | estimated minus market |
| adjusted_edge | numeric | After uncertainty penalty |
| expected_value | numeric | EV per contract |
| economic_risk_flags | jsonb | Liquidity, spread, expiry proximity |
| scoring_policy_version | text | e.g. `economic-policy-v1` |
| created_at | timestamptz | Insert time |

### `recommendation_records`

Layer 4 output. References **both** a forecast and an economic score.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| forecast_id | uuid | FK to forecasts |
| economic_score_id | uuid | FK to economic_scores |
| recommendation | text | buy_candidate/watch/pass/avoid |
| recommendation_policy_version | text | e.g. `recommendation-policy-v1` |
| rationale | jsonb | Rule trace, not prose |
| risk_flags | jsonb | Risk flags applied |
| created_at | timestamptz | Insert time |

A recommendation is not an execution instruction (`adr/0008-mie-domain-boundary.md`).

### `agent_executions`

One bounded agent invocation. Recorded **per invocation**, not per stage — a retried or
multi-call stage produces multiple rows.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| workflow_run_id | uuid | FK |
| agent_id | text | e.g. `probability-agent` |
| agent_version | text | Component version |
| prompt_id | text | Prompt identifier |
| prompt_version | text | Prompt version |
| system_prompt_version | text | System prompt version |
| provider | text | Model provider |
| model | text | Model identifier |
| model_config | jsonb | Temperature, tools |
| input_schema_version | text | Input contract version |
| output_schema_version | text | Output contract version |
| lifecycle_state | text | experimental/shadow/approved |
| status | text | succeeded/failed |
| retry_count | integer | Attempts |
| error_ref | text | Error reference |
| cost_metadata | jsonb | Tokens/cost where available |
| started_at | timestamptz | Start |
| ended_at | timestamptz | End |

### `source_provenance`

Addressable sources with retrieval context. Today sources are `jsonb` inside
`research_dossiers` and are neither addressable nor hashed.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| research_dossier_id | uuid | FK |
| canonical_url | text | Source URL |
| publisher | text | Publisher |
| author | text | Where available |
| published_at | timestamptz | Publication date, nullable |
| retrieved_at | timestamptz | Retrieval time |
| content_hash | text | Hash of retrieved content |
| source_type | text | Classification |
| authority_classification | text | Authority band |
| tier | integer | MIOS information tier, 2-4. Tier 1 is unavailable to a batch system (`docs/20-MIOS-METHODOLOGY.md` §4.1) |
| seasonally_adjusted | boolean | Required for search/social trend evidence; unadjusted must be labelled |
| raw_response_ref | text | Provider payload reference |
| verification_state | text | verified/stale/unverifiable |

Content hashing is what makes a source claim checkable after the page changes.

### `decision_manifests`

Binds every input behind one recommendation. See `docs/18-DECISION-REPRODUCIBILITY.md`.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| recommendation_id | uuid | FK to recommendation_records |
| workflow_run_id | uuid | FK |
| market_snapshot_id | uuid | FK |
| evidence_dossier_id | uuid | FK |
| settlement_rules_hash | text | Contract wording at decision time |
| agent_execution_ids | jsonb | Array of FKs |
| forecast_method_version | text | Layer 1 version |
| scoring_policy_version | text | Layer 3 version |
| recommendation_policy_version | text | Layer 4 version |
| evidence_schema_version | text | Evidence contract version |
| source_commit | text | Git SHA of the producing code |
| created_at | timestamptz | Insert time |

No column may hold `latest`, `current`, or `production`.

### `human_approvals`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| recommendation_id | uuid | FK |
| reviewer_id | text | Reviewer identity |
| disposition | text | approved/rejected/deferred |
| notes | text | Review notes |
| conditions | jsonb | Conditions or override reason |
| approval_policy_version | text | Policy in force |
| expires_at | timestamptz | Where applicable |
| created_at | timestamptz | Review time |

### `component_versions` and `promotion_records`

Lifecycle state for decision-producing components. See
`docs/19-PROMOTION-AND-RETIREMENT-POLICY.md`.

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| component_type | text | prompt/agent/model/ranking/scoring/threshold/provider |
| component_id | text | Component identifier |
| component_version | text | Explicit version |
| lifecycle_state | text | experimental/shadow/reviewed/approved/suspended/retired |
| rollback_version | text | Rollback target |
| effective_at | timestamptz | Activation |
| retired_at | timestamptz | Retirement, nullable |

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| component_type | text | Component class |
| component_id | text | Component identifier |
| component_version | text | Version promoted |
| previous_state | text | Prior lifecycle state |
| new_state | text | New lifecycle state |
| evidence_package_id | uuid | Supporting evidence |
| approved_by | text | Human approver — never an agent |
| approval_notes | text | Rationale |
| rollback_version | text | Rollback target |
| effective_at | timestamptz | Activation |

## Data Retention

MVP should retain all prediction-related records indefinitely. Raw research provider payloads may later receive retention policy, but not before calibration value is evaluated.

## RLS Policy

MVP may run single-user/server-side only. If Supabase client access is introduced, RLS must be defined before exposure.

## Migration Strategy

All schema changes must be represented as SQL migrations under `database/migrations/` and require ADR if they alter core domain tables after baseline.