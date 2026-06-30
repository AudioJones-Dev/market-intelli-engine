# Milestone 03 — Supabase Baseline Schema

**Status:** Proposed for implementation PR  
**Scope Type:** Database migration  
**Runtime Logic:** None

## Objective

Replace the placeholder migration with an executable Supabase/Postgres baseline schema aligned with `docs/03-DATA-MODEL.md`.

## Scope

Included:

- `providers`
- `workflow_runs`
- `market_snapshots`
- `research_queue`
- `research_dossiers`
- `probability_estimates`
- `recommendations`
- `prediction_ledger`
- `decision_journal`
- `outcomes`
- `calibration_scores`
- Required indexes
- Basic check constraints
- `decision_journal.updated_at` trigger

Excluded:

- RLS policies
- Seed data
- Provider integration
- Runtime services
- Supabase client code
- Edge Functions
- Trading logic

## Definition of Ready Check

- Problem defined: MIE needs durable storage before ingestion/research implementation.
- Scope defined: executable baseline schema only.
- Acceptance criteria defined below.
- Dependencies known: Supabase/Postgres with `pgcrypto` extension.
- Architecture impact: implements approved data model.
- Security review: no secrets added; RLS deferred because MVP remains server-side.
- YAGNI review: schema supports approved MVP and excludes deferred product features.

## Acceptance Criteria

- Migration is valid Postgres SQL.
- Tables from the approved data model are represented.
- Prediction records support reproducibility through frozen JSON snapshots.
- Probability fields are constrained to 0..1.
- Recommendation labels are constrained to approved values.
- Workflow statuses are constrained to approved values.
- No trading/account/portfolio tables are introduced.

## Definition of Done

- Placeholder migration replaced.
- Milestone doc added.
- Schema remains aligned with MVP scope.
- No runtime implementation included.

## Definition of Stable

After merge, migration must be applied successfully in a non-production Supabase project before being promoted for production use.
