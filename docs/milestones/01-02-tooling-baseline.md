# Milestone 01/02 — Repository Structure and Tooling Baseline

**Status:** Proposed for implementation PR  
**Scope Type:** Scaffolding only  
**Runtime Logic:** None

## Objective

Finalize the repository structure and add a lightweight TypeScript tooling baseline so future Codex milestones have consistent verification gates before runtime implementation begins.

## Scope

Included:

- Node package metadata.
- TypeScript configuration.
- ESLint configuration.
- Prettier configuration.
- Vitest configuration.
- GitHub Actions CI workflow.
- Placeholder directories for services, workflows, reports, scripts, and tests.
- Smoke test to verify test harness.

Excluded:

- Kalshi API integration.
- Perplexity API integration.
- Supabase schema implementation.
- Runtime service code.
- Report generation logic.
- Trading logic.

## Definition of Ready Check

- Problem defined: future implementation needs deterministic tooling.
- Scope defined: scaffolding and verification only.
- Acceptance criteria defined below.
- Dependencies known: Node 20, npm, TypeScript, ESLint, Prettier, Vitest.
- Architecture impact: none beyond repository tooling.
- Security review: no secrets added.
- YAGNI review: tooling is required before implementation.

## Acceptance Criteria

- `npm install` succeeds.
- `npm run typecheck` succeeds.
- `npm run lint` succeeds.
- `npm run format` succeeds.
- `npm run test` succeeds.
- GitHub Actions CI runs these checks on PRs and pushes to `main`.
- No runtime business logic is introduced.

## Definition of Done

- Tooling files committed.
- Placeholder directories documented.
- CI workflow added.
- Smoke test added.
- MVP non-goals preserved.

## Definition of Stable

After merge, CI must pass on `main` for the first observation run. No further stability period is required because this milestone contains no runtime workflow.
