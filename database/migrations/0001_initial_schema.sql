-- Market Intelligence Engine baseline schema
-- Milestone 03: executable Supabase/Postgres baseline migration.
-- Scope: core storage tables only. No runtime logic, providers, or trading features.

create extension if not exists pgcrypto;

create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  provider_type text not null check (provider_type in ('market', 'research', 'model', 'delivery')),
  config_json jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (name, provider_type)
);

create table if not exists workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_name text not null,
  status text not null check (status in ('queued', 'running', 'succeeded', 'partial', 'failed', 'cancelled')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  input_json jsonb not null default '{}'::jsonb,
  output_json jsonb not null default '{}'::jsonb,
  error_json jsonb
);

create index if not exists workflow_runs_name_started_idx on workflow_runs (workflow_name, started_at desc);
create index if not exists workflow_runs_status_idx on workflow_runs (status);

create table if not exists market_snapshots (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  ticker text not null,
  event_ticker text,
  title text not null,
  category text,
  status text not null,
  close_time timestamptz,
  yes_bid numeric(10, 6),
  yes_ask numeric(10, 6),
  last_price numeric(10, 6),
  volume numeric(20, 6),
  open_interest numeric(20, 6),
  raw_json jsonb not null default '{}'::jsonb,
  ingested_at timestamptz not null default now()
);

create index if not exists market_snapshots_provider_ticker_idx on market_snapshots (provider, ticker);
create index if not exists market_snapshots_ingested_at_idx on market_snapshots (ingested_at desc);
create index if not exists market_snapshots_status_close_time_idx on market_snapshots (status, close_time);

create table if not exists research_queue (
  id uuid primary key default gen_random_uuid(),
  market_snapshot_id uuid not null references market_snapshots (id) on delete cascade,
  rank integer not null check (rank > 0),
  opportunity_score numeric(8, 4) not null default 0,
  reason text,
  run_id uuid references workflow_runs (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (run_id, market_snapshot_id)
);

create index if not exists research_queue_run_rank_idx on research_queue (run_id, rank);
create index if not exists research_queue_market_snapshot_idx on research_queue (market_snapshot_id);

create table if not exists research_dossiers (
  id uuid primary key default gen_random_uuid(),
  market_snapshot_id uuid not null references market_snapshots (id) on delete cascade,
  provider text not null,
  prompt_version text not null,
  raw_response jsonb not null default '{}'::jsonb,
  facts jsonb not null default '[]'::jsonb,
  evidence_for jsonb not null default '[]'::jsonb,
  evidence_against jsonb not null default '[]'::jsonb,
  unknowns jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  research_quality_score numeric(5, 2) check (
    research_quality_score is null
    or (research_quality_score >= 0 and research_quality_score <= 100)
  ),
  created_at timestamptz not null default now()
);

create index if not exists research_dossiers_market_snapshot_idx on research_dossiers (market_snapshot_id);
create index if not exists research_dossiers_created_at_idx on research_dossiers (created_at desc);

create table if not exists probability_estimates (
  id uuid primary key default gen_random_uuid(),
  market_snapshot_id uuid not null references market_snapshots (id) on delete cascade,
  research_dossier_id uuid references research_dossiers (id) on delete set null,
  model_provider text not null,
  model_name text not null,
  prompt_version text not null,
  estimated_probability numeric(8, 6) not null check (
    estimated_probability >= 0
    and estimated_probability <= 1
  ),
  confidence_score numeric(5, 2) check (
    confidence_score is null
    or (confidence_score >= 0 and confidence_score <= 100)
  ),
  assumptions jsonb not null default '[]'::jsonb,
  counterarguments jsonb not null default '[]'::jsonb,
  invalidation_conditions jsonb not null default '[]'::jsonb,
  raw_response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists probability_estimates_market_snapshot_idx on probability_estimates (market_snapshot_id);
create index if not exists probability_estimates_research_dossier_idx on probability_estimates (research_dossier_id);
create index if not exists probability_estimates_created_at_idx on probability_estimates (created_at desc);

create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  market_snapshot_id uuid not null references market_snapshots (id) on delete cascade,
  probability_estimate_id uuid not null references probability_estimates (id) on delete cascade,
  market_probability numeric(8, 6) not null check (
    market_probability >= 0
    and market_probability <= 1
  ),
  estimated_probability numeric(8, 6) not null check (
    estimated_probability >= 0
    and estimated_probability <= 1
  ),
  edge numeric(9, 6) not null,
  expected_value numeric(12, 8) not null,
  research_grade text not null check (research_grade in ('A', 'B', 'C', 'D', 'F')),
  recommendation text not null check (recommendation in ('buy_candidate', 'watch', 'pass', 'avoid')),
  rationale text,
  created_at timestamptz not null default now()
);

create index if not exists recommendations_market_snapshot_idx on recommendations (market_snapshot_id);
create index if not exists recommendations_probability_estimate_idx on recommendations (probability_estimate_id);
create index if not exists recommendations_created_at_idx on recommendations (created_at desc);

create table if not exists prediction_ledger (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references recommendations (id) on delete restrict,
  ticker text not null,
  prediction_timestamp timestamptz not null default now(),
  market_snapshot_json jsonb not null,
  evidence_snapshot_json jsonb not null default '{}'::jsonb,
  model_snapshot_json jsonb not null default '{}'::jsonb,
  estimated_probability numeric(8, 6) not null check (
    estimated_probability >= 0
    and estimated_probability <= 1
  ),
  market_probability numeric(8, 6) not null check (
    market_probability >= 0
    and market_probability <= 1
  ),
  recommendation text not null check (recommendation in ('buy_candidate', 'watch', 'pass', 'avoid')),
  is_final boolean not null default true
);

create unique index if not exists prediction_ledger_recommendation_unique_idx on prediction_ledger (recommendation_id);
create index if not exists prediction_ledger_ticker_idx on prediction_ledger (ticker);
create index if not exists prediction_ledger_timestamp_idx on prediction_ledger (prediction_timestamp desc);

create or replace function prevent_final_prediction_ledger_mutation()
returns trigger as $$
begin
  if old.is_final then
    raise exception 'final prediction_ledger rows are immutable; append a correction instead';
  end if;

  return old;
end;
$$ language plpgsql;

drop trigger if exists prediction_ledger_prevent_final_update on prediction_ledger;
create trigger prediction_ledger_prevent_final_update
before update on prediction_ledger
for each row
execute function prevent_final_prediction_ledger_mutation();

drop trigger if exists prediction_ledger_prevent_final_delete on prediction_ledger;
create trigger prediction_ledger_prevent_final_delete
before delete on prediction_ledger
for each row
execute function prevent_final_prediction_ledger_mutation();

create table if not exists decision_journal (
  id uuid primary key default gen_random_uuid(),
  ledger_id uuid not null references prediction_ledger (id) on delete cascade,
  reasoning_summary text not null,
  strongest_case_for text,
  strongest_case_against text,
  known_unknowns text,
  post_settlement_review text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (ledger_id)
);

create index if not exists decision_journal_ledger_idx on decision_journal (ledger_id);

create table if not exists outcomes (
  id uuid primary key default gen_random_uuid(),
  ledger_id uuid not null references prediction_ledger (id) on delete cascade,
  ticker text not null,
  resolved_outcome boolean not null,
  settlement_value numeric(8, 6) not null check (
    settlement_value >= 0
    and settlement_value <= 1
  ),
  settlement_source text,
  settled_at timestamptz not null default now(),
  raw_settlement_json jsonb not null default '{}'::jsonb,
  unique (ledger_id)
);

create index if not exists outcomes_ticker_idx on outcomes (ticker);
create index if not exists outcomes_settled_at_idx on outcomes (settled_at desc);

create table if not exists calibration_scores (
  id uuid primary key default gen_random_uuid(),
  ledger_id uuid not null references prediction_ledger (id) on delete cascade,
  brier_score numeric(12, 8) not null check (brier_score >= 0),
  log_loss numeric(12, 8),
  probability_bucket text not null,
  realized_ev numeric(12, 8),
  scored_at timestamptz not null default now(),
  unique (ledger_id)
);

create index if not exists calibration_scores_bucket_idx on calibration_scores (probability_bucket);
create index if not exists calibration_scores_scored_at_idx on calibration_scores (scored_at desc);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists decision_journal_set_updated_at on decision_journal;
create trigger decision_journal_set_updated_at
before update on decision_journal
for each row
execute function set_updated_at();
