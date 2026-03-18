# CompliPay AI Security Rollout Runbook

Updated: March 19, 2026 (Asia/Jakarta)

## Scope

This runbook covers deployment and operations for:
- PBKDF2 password hashing and legacy migration path
- hashed session tokens at rest
- RBAC-protected mutation endpoints
- rate limiting with explicit proxy trust
- Vercel deployment with optional Postgres snapshot persistence

## 1) Required Environment Variables

Set these in Vercel (Production, Preview, Development as needed):

- `AUTH_PASSWORD_SALT`
- `AUTH_PBKDF2_ITERATIONS` (recommended `210000`)
- `SESSION_TOKEN_PEPPER`
- `SESSION_TTL_HOURS` (recommended `24`)
- `TRUST_PROXY` (`1` for Vercel)
- `DASHSCOPE_API_KEY`
- `AI_BASE_URL`
- `AI_MODEL`

Recommended:
- `DATABASE_URL` (Supabase session pooler URI for persistence snapshot)
- `CORS_ORIGIN` (restrict origins if needed)
- `USDC_TOKEN_MINT`
- `USDT_TOKEN_MINT`

## 2) `DATABASE_URL` Guidance (Supabase)

Use Session pooler URI (IPv4-friendly):

`postgresql://postgres.<project-ref>:<password>@aws-1-<region>.pooler.supabase.com:5432/postgres`

Notes:
- Replace `<password>` with your database password.
- This enables `sqlite+postgres-snapshot` mode in health response.
- Do not expose this URI client-side.

## 3) Pre-Deployment Checklist

1. Confirm all required env vars are set in Vercel.
2. Confirm `TRUST_PROXY` is explicitly set.
3. Trigger a fresh deployment after env updates.
4. Keep rollback point available in Deployments tab.

## 4) Post-Deployment Verification

Run these checks on production URL:

1. `GET /api/health` returns:
   - `ok: true`
   - `aiConfigured: true` (if key is set)
   - `persistence: sqlite+postgres-snapshot` (if `DATABASE_URL` configured)
2. Login works with demo admin account.
3. Viewer cannot execute privileged mutations.
4. Admin/operator can create -> run compliance -> execute payment.
5. AI chat endpoint responds and rate-limit headers are present.

## 5) Migration Behavior

### Password hashes
- Legacy SHA-256 passwords remain temporarily valid.
- On successful login, legacy hash is upgraded to PBKDF2.

### Sessions
- Sessions are stored as hashed tokens.
- Legacy/plain session rows are cleaned on logout and migrated on valid request path.

## 6) Optional Force Re-Login Procedure

To invalidate all active sessions:

```sql
DELETE FROM sessions;
```

Effect: all users must login again.

## 7) Secret Rotation Guidance

1. Rotate `SESSION_TOKEN_PEPPER` when you intentionally want all sessions invalidated.
2. Rotate `AUTH_PASSWORD_SALT` only after legacy migration/reset planning.
3. Keep `AUTH_PBKDF2_ITERATIONS` at or above `120000` (project default: `210000`).

## 8) Rollback Plan

1. Open Vercel Deployments.
2. Roll back to previous healthy deployment.
3. Re-check env vars if rollback also includes config mismatch.
4. Validate `/api/health` and login flow again.

## 9) Operational Watchpoints

Monitor for:
- repeated `401` login failures (credential/env mismatch)
- repeated `429` responses (rate limiting tuning)
- model-provider errors on `/api/ai/chat`
- persistence mode drift (`sqlite` vs `sqlite+postgres-snapshot`)
