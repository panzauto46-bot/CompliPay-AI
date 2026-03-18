# CompliPay AI Architecture

Updated: March 19, 2026 (Asia/Jakarta)
Version: v3 (Vercel + persistence sync)

## 1) System Overview

CompliPay AI runs as a full-stack product:
- Frontend: React + TypeScript (Vite)
- API: Express (`server/server.js`)
- Primary storage: SQLite (`server/data/complipay.db`)
- Optional durability layer: Postgres snapshot mirror via `DATABASE_URL`
- Chain integration: Solana execution path with simulation fallback
- AI integration: DashScope-compatible chat completion endpoint

Goal: enforce policy-first programmable payments with clear audit evidence.

## 2) Runtime Components

### Frontend (`src/`)
- `context/AuthContext.tsx`
  - login/logout/session refresh
  - protected-route auth state
- `context/AppDataContext.tsx`
  - `/api/bootstrap` hydration
  - payment/compliance/execution/wallet/audit mutations
- `pages/*`
  - operational surfaces: Dashboard, Payments, Compliance, AI Agent, Audit Trail, Transactions, Wallets, Settings
  - public surfaces: Landing, Login
- `components/Layout.tsx`
  - desktop hover sidebar behavior
  - role-consistent navigation shell

### API backend (`server/server.js`)
Single service currently contains:
- authentication and session lifecycle
- RBAC middleware
- validation and rate limiting
- payments/compliance/execution logic
- AI proxy
- wallet refresh
- audit append pipeline

### Vercel adapter (`api/`)
- `api/index.js` rewrites `/api/:path*` requests to Express format
- `api/_app.js` exposes Express app handler
- `vercel.json` rewrites all non-API routes to `index.html`

This allows one Vercel project to host both SPA and API under the same origin.

## 3) Data and Persistence Model

### SQLite tables
- `users`
- `sessions`
- `payments`
- `transactions`
- `compliance_alerts`
- `ai_tasks`
- `wallets`
- `audit_events`
- `app_state_snapshots` (used when remote snapshot persistence is enabled)

### Persistence behavior
- Base mode: SQLite only (`persistence: "sqlite"` in health response).
- Extended mode: SQLite plus periodic snapshot to Postgres when `DATABASE_URL` is set (`persistence: "sqlite+postgres-snapshot"`).

Health endpoint:
- `GET /api/health` returns `ok`, `aiConfigured`, `model`, and `persistence`.

## 4) API Surface

### Public
- `GET /api/health`
- `POST /api/auth/login`

### Authenticated
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/bootstrap`
- `POST /api/ai/chat`

### Admin/Operator only
- `POST /api/payments`
- `POST /api/payments/:id/compliance`
- `POST /api/payments/:id/ai-recommendation`
- `POST /api/payments/:id/execute`
- `POST /api/payments/batch-execute`
- `POST /api/compliance/alerts/:id/resolve`
- `POST /api/wallets/refresh`

## 5) End-to-End Execution Flow

1. User signs in on `/login`.
2. Frontend stores bearer token in `sessionStorage` and loads `/api/bootstrap`.
3. User creates a payment contract.
4. Compliance engine evaluates and returns `allow/review/block` with reasons.
5. AI recommendation can be requested (policy does not get bypassed).
6. Execution is allowed only for `allow` decisions.
7. Transaction evidence and audit events are persisted and rendered in UI.

Batch mode:
- Only selected payments with `allow` decision are eligible for batch execution.
- API returns per-item result summary (`completed/simulated/failed`).

## 6) Security Model

Implemented controls:
- PBKDF2 password hashing (`AUTH_PBKDF2_ITERATIONS`) with legacy hash migration support.
- Hashed session tokens at rest (`SESSION_TOKEN_PEPPER`).
- RBAC enforcement for privileged endpoints.
- Input schema validation on critical mutations.
- Rate limiting:
  - login endpoint keyed by client IP
  - AI chat keyed by user+IP
- Explicit proxy trust (`TRUST_PROXY`) for correct IP handling.
- Security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: no-referrer`

## 7) UI/UX State Relevant to Architecture

- Desktop sidebar supports hover-open and auto-hide behavior.
- Login page includes password visibility control and back-to-landing navigation.
- Privileged action buttons are hidden/disabled for viewer role.
- Evidence-first views: Transactions and Audit Trail are linked to each execution lifecycle.

## 8) Current Limitations

- Backend is monolithic in one file (`server/server.js`).
- Automated integration tests are still limited.
- OpenAPI contract is not published.
- Settings and some integration forms remain partly demo-oriented.
- Provider-grade external connectors are still shallow.

## 9) Next Hardening Targets

1. Split backend into route/service modules.
2. Add integration smoke tests for auth/compliance/execution.
3. Add structured logs and observability for production diagnostics.
4. Deepen wallet/compliance provider integrations.
5. Publish machine-readable API contract.
