# CompliPay AI Architecture

Updated: March 17, 2026 (Asia/Jakarta)

## 1) System Overview

CompliPay AI uses a fullstack architecture (React + Express + SQLite + Solana RPC).

Layers:
- Presentation: React app (`src/`) with protected routes and role-aware UI.
- Application API: Express server (`server/server.js`) for auth, payments, compliance, execution, AI proxy, wallets, and audit logging.
- Persistence: SQLite (`server/data/complipay.db`) with WAL mode.
- Blockchain: Solana testnet/devnet execution with simulated fallback.
- External services: DashScope-compatible LLM endpoint and optional compliance provider endpoint.

## 2) Runtime Components

### Frontend
- `src/context/AuthContext.tsx`
  - Login/logout/session refresh.
  - Auth state for route protection.
- `src/context/AppDataContext.tsx`
  - Bootstrap data loading.
  - Mutations for payment lifecycle, compliance, execution, alerts, wallets, and audit updates.
- `src/lib/api.ts`
  - Bearer token request wrapper.
  - Token persistence using `sessionStorage` with legacy migration from `localStorage`.

### Backend
- `server/server.js` (single-file service)
  - Auth:
    - PBKDF2 password verification with legacy SHA-256 compatibility migration.
    - Session token hashing at rest (SQLite stores hashed token).
  - Authorization:
    - RBAC on privileged mutation endpoints (`admin`, `operator`).
    - Viewer role is read-only in UI and blocked on privileged APIs.
  - Compliance:
    - Deterministic policy checks (KYC, KYT, AML, Travel Rule).
    - Optional external compliance provider call.
  - Execution:
    - Policy-gated payment execution.
    - Solana testnet first, devnet fallback, simulation fallback.
    - Batch execution endpoint with per-item result summary.
  - AI:
    - Authenticated chat proxy with user+IP rate limit strategy.
  - Wallets:
    - Balance refresh from RPC.
    - SPL balance path for USDC/USDT when mint env vars are configured.
  - Audit:
    - Append-only event logging linked to payment and/or transaction IDs.

## 3) Data Model (SQLite)

Tables:
- `users`
- `sessions`
- `payments`
- `transactions`
- `compliance_alerts`
- `ai_tasks`
- `wallets`
- `audit_events`

Key model notes:
- `sessions.token` stores hashed tokens.
- `payments.compliance_result_json` stores compliance decisions and reasons.
- `transactions` tracks execution network, simulation status, asset layer, and batch ID.
- `audit_events` is the main traceability ledger for operations and policy actions.

## 4) End-to-End Flow

1. User signs in with email/password.
2. Frontend stores auth token in session scope and loads `/api/bootstrap`.
3. Operator/admin creates payment contract.
4. Compliance is evaluated (`allow`, `review`, `block`).
5. AI recommendation can be requested (policy-constrained guidance).
6. Execution is allowed only when compliance decision is `allow`.
7. Transaction evidence and audit events are persisted and reflected in UI.

## 5) Security Model

Implemented controls:
- PBKDF2 password hashing (`AUTH_PBKDF2_ITERATIONS`), legacy hash migration support.
- Hashed session tokens at rest (`SESSION_TOKEN_PEPPER`).
- Schema-based payload validation for critical endpoints.
- Explicit proxy trust control (`TRUST_PROXY`).
- Rate limiting:
  - Login endpoint keyed by IP.
  - Authenticated AI chat endpoint keyed by user+IP.
- Security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: no-referrer`

## 6) Known Limitations

Current limitations:
- Server remains monolithic in a single file.
- No automated test suite in repository.
- No OpenAPI spec generation.
- Wallet accuracy for USDC/USDT depends on mint env configuration.
- Settings and some integration screens remain partially presentation-focused.

## 7) Next Hardening Targets

Planned:
- Break server into route/service modules.
- Add integration tests for auth/compliance/execution.
- Add structured logs and error telemetry.
- Add provider-level wallet/compliance integrations for pilot readiness.
