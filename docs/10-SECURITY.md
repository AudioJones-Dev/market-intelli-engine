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
7. MIE holds no execution authority and no brokerage credentials.

## Execution Boundary

Per [`adr/0008-mie-domain-boundary.md`](../adr/0008-mie-domain-boundary.md):

- **MIE stores no brokerage credentials.** Not live, not paper, not read-only account access.
- **MIE has no order-execution authority.** No live orders, no paper orders, no order-routing
  dependency.
- **No agent may initiate a capital-allocation action** (`docs/06-AGENTS.md`).
- MIE holds no account balances, position quantities, or portfolio state.

Any future execution capability requires an **independent threat model**, separate credentials, a
separate deployment approval, and its own ADR. It may not inherit MIE's service identity,
secrets, or database role.

### Credential tripwires

Treat any of the following as a boundary violation requiring review before merge:

- a secret, environment variable, or config key naming a broker, exchange account, or trading
  API;
- a dependency on a brokerage or order-routing SDK;
- a schema field representing contract quantity, capital allocated, account balance, or open
  position.

`KALSHI_API_KEY` (listed below as optional/future) is scoped to **read-only market data**.
Provisioning it with trading permissions would breach this boundary regardless of how it is used
in code.

### Component authorization

Unapproved components cannot access production decision workflows. Only components in the
`approved` lifecycle state may influence official outputs
(`docs/19-PROMOTION-AND-RETIREMENT-POLICY.md`); `experimental`, `reviewed`, `suspended`, and
`retired` components fail closed. This is an authorization control, not merely a quality gate —
it bounds which code paths can produce operator-facing conclusions.

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
- No brokerage credential exists in any environment, secret store, or example file.
- No dependency provides order submission or brokerage connectivity.
- No schema field represents contract quantity, capital, balance, or open position.
- Only `approved` components execute in production workflows.