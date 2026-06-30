# 10 — Security

**Project:** Market Intelligence Engine (MIE)  
**Version:** 0.1 specification draft

## Security Principles

1. Never commit secrets.
2. Use least privilege.
3. Keep trade execution out of MVP.
4. Store enough audit data to reproduce recommendations.
5. Do not log sensitive credentials.
6. Human approval is required for production deployment and secrets changes.

## Secret Management

Secrets must be stored in the deployment environment or a secret manager.

Required secrets:

- `PERPLEXITY_API_KEY`
- `OPENAI_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Optional future `KALSHI_API_KEY`

Never store secrets in:

- Markdown docs.
- GitHub issues.
- Commit history.
- Reports.
- Logs.

## Authentication

MVP can be server-side only. User authentication is deferred.

If frontend/client access is later introduced:

- RLS required.
- Auth required.
- ADR required.

## Authorization

MVP service should have only the permissions needed to:

- Read market data.
- Write database records.
- Generate reports.
- Deliver reports.

Trade execution permissions are prohibited in MVP.

## Logging Policy

Logs may include:

- Workflow ID.
- Provider name.
- Status code.
- Record counts.
- Error category.

Logs must not include:

- API keys.
- Bearer tokens.
- Full secret-bearing headers.
- Sensitive account data.

## Data Sensitivity

MVP data is primarily market/research data. If personal notes, account balances, or trading records are later added, security classification must be updated by ADR.

## Human Approval Required

- Adding or rotating secrets.
- Production deployment.
- Database migration.
- New provider.
- New delivery destination.
- Any trading capability.

## Incident Response

If a secret is exposed:

1. Treat it as compromised.
2. Revoke/rotate provider credential.
3. Update environment secret.
4. Verify no secret remains in logs or repo.
5. Document incident and remediation.

## MVP Security Acceptance Criteria

- `.env` is ignored.
- Example environment file contains no real secrets.
- Service role key is not exposed client-side.
- Logs redact secrets.
- No trading credentials are required.