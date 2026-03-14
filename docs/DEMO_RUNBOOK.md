# CompliPay AI Demo Runbook (3 Minutes)

## Goal
Deliver a clean end-to-end demonstration aligned with StableHacks judging criteria.

## Pre-Demo Setup
- Open app: `http://localhost:5173/`
- Open dashboard page: `http://localhost:5173/dashboard`
- Ensure a payment contract is available (or create one live)
- Keep `Payments`, `Compliance`, `Transactions`, and `Audit Trail` pages ready in tabs

## Demo Flow

### 1) Problem and Positioning (20-30s)
- Explain institutional need: programmable payments + mandatory compliance + auditability.

### 2) Create Payment Contract (30-45s)
- Go to `Payments`.
- Create a new programmable payment (amount, recipient, conditions).
- Show contract appears in the list.

### 3) Run Compliance (30-45s)
- Open payment details.
- Click `Run Compliance`.
- Show decision badge (`ALLOW/REVIEW/BLOCK`) and reason messages.

### 4) AI Recommendation (20-30s)
- Click `AI Recommend`.
- Show recommendation text and policy-aware behavior.

### 5) Execute Payment (30-45s)
- Click `Execute Now` on an `ALLOW` contract.
- Confirm feedback message with tx signature/network status.

### 6) Audit Evidence (30-45s)
- Go to `Transactions`.
- Open the latest transaction.
- Click explorer link.
- Highlight compliance status and transaction metadata.
- Go to `Audit Trail`.
- Filter by `Execution` and show the lifecycle evidence log for the same payment.

### 7) Close (10-20s)
- Summarize: compliance-gated automation, on-chain proof, institutional fit.

## Backup Plan
- If real network execution falls back to simulation:
  - explicitly mention fallback mode in UI
  - still show full compliance and audit flow
  - show generated explorer link format for expected production behavior
