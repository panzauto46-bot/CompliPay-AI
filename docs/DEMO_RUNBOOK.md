# CompliPay AI Demo Runbook (3 Minutes)

Updated: March 19, 2026 (Asia/Jakarta)

## Goal

Deliver one clear narrative:
policy-gated programmable payments with auditable execution evidence.

## Pre-Demo Setup

- Open app: `https://compli-pay-ai.vercel.app/`
- Verify backend health: `https://compli-pay-ai.vercel.app/api/health`
- Login as admin user.
- Keep these pages ready:
  - Payments
  - Compliance
  - Transactions
  - Audit Trail

## Demo Flow

### 1) Positioning (20-30s)
- Problem: institutions need automation, but cannot skip compliance and audit.
- Claim: CompliPay AI enforces policy before execution.

### 2) Create Contract (30-45s)
- Go to `Payments`.
- Click `Create Payment`.
- Fill name, amount, recipient, and conditions.
- Submit and show new contract appears in list.

### 3) Run Compliance (30-45s)
- Open the payment detail modal.
- Click `Run Compliance`.
- Show decision and score (`ALLOW`, `REVIEW`, or `BLOCK`).

### 4) AI Recommendation (20-30s)
- Click `AI Recommend`.
- Show policy-aware recommendation text.
- Explain that AI does not bypass policy gate.

### 5) Execute (30-45s)
- For `ALLOW`, click `Execute Now` (or `Execute With AI`).
- Show success/feedback banner and tx/network metadata.

### 6) Evidence and Audit (30-45s)
- Open `Transactions` and show newest row.
- Highlight compliance status, tx hash, network, and simulation marker if present.
- Open `Audit Trail` and show related lifecycle events.

### 7) Close (10-20s)
- Summary: compliant execution + AI support + verifiable evidence.

## Batch Variant (Optional)

- Select multiple payments in `Payments`.
- Explain eligibility text: only `ALLOW` items are executable.
- Click `Batch Execute ALLOW`.
- Show summarized results (completed/simulated/failed).

## Backup Plan

If chain execution falls back to simulation:
- explicitly call out simulation mode,
- still show compliance decision and audit trail integrity,
- emphasize deterministic policy gate and traceability.

## Demo Credentials

- Admin: `admin@complipay.ai` / `Admin123!`
- Operator: `ops@complipay.ai` / `Ops123!`
- Viewer: `viewer@complipay.ai` / `View123!`
