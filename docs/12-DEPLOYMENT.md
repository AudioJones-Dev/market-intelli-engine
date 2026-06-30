# 12 — Deployment

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft

## MVP Deployment Goal

Run scheduled ingestion, research, analysis, reporting, and calibration workflows reliably with minimal infrastructure.

## Recommended MVP Deployment

- Supabase Postgres for storage.
- Supabase Edge Functions or n8n for scheduling/orchestration.
- GitHub repository for source control and documentation.
- Environment-based secrets.
- Markdown report output first.

## Environments

### Local

Purpose: development and testing.

Requirements:

- `.env.local` ignored.
- Test database or Supabase dev project.
- Mock provider fixtures.

### Staging

Purpose: safe workflow validation.

Requirements:

- Separate Supabase project or schema.
- Non-production report destination.
- Limited API run volume.

### Production

Purpose: daily operating system.

Requirements:

- Production Supabase project.
- Production secrets.
- Monitoring.
- Scheduled workflows.
- Backup policy.

## Deployment Gates

Before production deployment:

- DoR satisfied.
- DoD satisfied.
- Security checklist complete.
- Required ADRs approved.
- Database migration reviewed.
- Rollback plan documented.

## Rollback Policy

Every deployment must answer:

- Can this be reverted?
- What data is affected?
- Does rollback require migration reversal?
- How are partially completed workflow runs handled?

## Configuration

Configuration should be environment-driven.

Examples:

- Provider enable flags.
- Research queue limit.
- Market filters.
- Recommendation thresholds.
- Report destination.

## Definition of Stable

A deployed feature becomes stable only after the defined observation window confirms:

- Successful scheduled runs.
- No critical defects.
- Expected logs/metrics.
- Documentation matches implementation.
- Retrospective completed if issues occurred.