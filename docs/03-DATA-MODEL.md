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

## Data Retention

MVP should retain all prediction-related records indefinitely. Raw research provider payloads may later receive retention policy, but not before calibration value is evaluated.

## RLS Policy

MVP may run single-user/server-side only. If Supabase client access is introduced, RLS must be defined before exposure.

## Migration Strategy

All schema changes must be represented as SQL migrations under `database/migrations/` and require ADR if they alter core domain tables after baseline.