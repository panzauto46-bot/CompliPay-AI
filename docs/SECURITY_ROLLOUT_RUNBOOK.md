# CompliPay AI Security Rollout Runbook

## Scope

This runbook covers rollout and operations for:
- PBKDF2 password hashing with legacy SHA-256 compatibility.
- Hashed session tokens stored at rest in SQLite.
- Tighter RBAC on privileged mutation endpoints.
- Safer rate limiting with explicit proxy trust configuration.

## Required Environment Variables

Configure these before deployment:
- `AUTH_PASSWORD_SALT`
- `AUTH_PBKDF2_ITERATIONS`
- `SESSION_TOKEN_PEPPER`
- `TRUST_PROXY`
- `SERVER_PORT`
- `SESSION_TTL_HOURS`

Optional but recommended for wallet accuracy:
- `USDC_TOKEN_MINT`
- `USDT_TOKEN_MINT`
- `SOLANA_RPC_ENDPOINT`

Recommended `TRUST_PROXY` values:
- `false` for direct public API without reverse proxy.
- `1` when exactly one trusted reverse proxy is in front.
- explicit subnet/value when infrastructure requires it.

## Pre-Deployment Checklist

1. Backup `server/data/complipay.db`.
2. Confirm all required environment variables are set in the target environment.
3. Verify `TRUST_PROXY` is explicitly configured.
4. Validate rollback package is available.
5. Announce expected authentication behavior change to operators.

## Deployment Steps

1. Deploy code and environment variable changes together.
2. Start the API service and confirm startup log includes security hardening message.
3. Verify `GET /api/health` returns `ok: true`.
4. Execute smoke tests:
   - login success with existing account
   - protected endpoint access with valid token
   - role-restricted endpoint blocked for viewer
   - AI chat endpoint returns rate-limit headers and behaves per user+IP
5. Monitor 429 responses and auth errors for 15-30 minutes.

## Password Migration Behavior

- Existing SHA-256 legacy password hashes remain valid initially.
- On successful login, a legacy hash is replaced with PBKDF2 automatically.
- Keep `AUTH_PASSWORD_SALT` stable until migration window is complete.

## Session Migration Behavior

- New sessions are stored as hashed tokens.
- Existing raw-token sessions are migrated to hashed storage on successful request.
- Logout deletes both hashed and legacy token forms for compatibility.

## Force Re-Login Procedure (Optional)

Use this if you want immediate session invalidation after deployment:

```sql
DELETE FROM sessions;
```

Impact:
- All active users must sign in again.
- No data loss outside session state.

## Secret Rotation Guidance

1. Rotate `SESSION_TOKEN_PEPPER` first only when you are ready to invalidate all sessions.
2. Rotate `AUTH_PASSWORD_SALT` only after legacy SHA-256 users are migrated or reset.
3. Keep `AUTH_PBKDF2_ITERATIONS` at or above `120000`.

## Rollback Plan

1. Stop service.
2. Restore previous application build.
3. Restore previous environment values.
4. If required, restore database backup.
5. Restart service and rerun smoke tests.

## Post-Deployment Verification

1. Confirm viewer cannot execute:
   - payment create
   - compliance run
   - AI recommendation mutation
   - wallet refresh
2. Confirm admin/operator flows still succeed.
3. Confirm AI chat rate limit headers are present.
4. Confirm payment creation rejects invalid payload formats.
