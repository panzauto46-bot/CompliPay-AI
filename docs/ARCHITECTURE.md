# CompliPay AI Architecture

## 1) High-Level Overview

CompliPay AI is a frontend-first MVP with local orchestration logic that simulates an institutional payment operations stack:

- **Presentation Layer**: React pages for operations, compliance, AI, transactions, and audit evidence.
- **Orchestration Layer**: `AppDataContext` coordinates payment lifecycle, compliance, AI recommendation, execution, and logs.
- **Policy Layer**: deterministic compliance engine (`compliancePolicy.ts`) returns `ALLOW`, `REVIEW`, or `BLOCK`.
- **Execution Layer**: Solana executor (`solanaExecutor.ts`) attempts real testnet/devnet transaction submission and explicit simulation fallback.

## 2) Core Runtime Components

### `src/context/AppDataContext.tsx`

Central source of truth for:
- Programmable payments
- Transactions
- Compliance alerts
- AI tasks
- Audit events

Main actions:
- `createPayment`
- `runCompliance`
- `requestAIRecommendation`
- `executePayment`
- `resolveAlert`
- `exportTransactionsCsv`

### `src/lib/compliancePolicy.ts`

Evaluates:
- KYC
- KYT
- AML
- Travel Rule

Returns:
- `decision`: `allow | review | block`
- `score`
- per-check status
- reason list
- timestamp

### `src/lib/solanaExecutor.ts`

Execution strategy:
1. Attempt real transfer on **testnet**
2. Fallback to real transfer on **devnet**
3. If network constraints persist, create explicit **simulated** result

Returned evidence:
- transaction signature
- explorer URL
- network used
- `simulated` flag

## 3) End-to-End Data Flow

1. User creates payment contract in `Payments`.
2. `runCompliance` evaluates policy and stores result.
3. `requestAIRecommendation` generates guidance constrained by policy outcome.
4. `executePayment` enforces compliance gate:
   - only `ALLOW` can execute
   - `REVIEW`/`BLOCK` are denied
5. Successful/simulated execution writes transaction + explorer reference.
6. All major lifecycle steps append to `auditEvents`.
7. `Dashboard`, `Compliance`, `Transactions`, and `AuditTrail` read from the same context state.

## 4) Auditability Model

Audit evidence contains:
- category (`payment`, `compliance`, `execution`, `ai`)
- action (`created`, `evaluated`, `completed`, etc.)
- human-readable message
- timestamp
- optional `paymentId` and `transactionId` linkage

This enables:
- traceability from business intent -> policy decision -> on-chain execution
- filterable review for compliance teams and judges

## 5) Security and Guardrails (MVP Scope)

- Policy gate is authoritative before execution.
- AI cannot bypass compliance outcomes.
- No private institutional keys are embedded.
- Solana execution uses ephemeral runtime keypairs for demo behavior.

## 6) MVP Limitations and Next Hardening

Not yet production-grade:
- external identity/compliance provider integrations
- enterprise custody and role approval flows
- backend persistence and signed audit artifacts
- robust retry queues and SLO monitoring

These are planned in post-hackathon hardening phases.
