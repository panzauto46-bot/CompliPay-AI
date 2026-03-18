# CompliPay AI Roadmap

Updated: March 19, 2026 (Asia/Jakarta)  
Version: v5 (production-demo sync)

## 0) Current Status

- Demo/MVP readiness: very high.
- Production readiness estimate: 90%.
- Production deployment validation: completed on Vercel (`/api/*` live).
- Persistence validation: completed (`DATABASE_URL` + `sqlite+postgres-snapshot` health status).
- Main remaining gaps:
  - automated tests,
  - deeper provider-grade integrations,
  - final submission assets (Loom and lock-in proof).

## 1) Delivery Phases (0% -> 100%)

### Final Target
Deliver a stable, auditable, policy-gated payment platform that is submission-ready and demo-safe.

### Phase 1 - Scope and Environment (0% -> 15%)
Status: 100%

Completed:
- Scope locked to Programmable Stablecoin Payments track.
- Frontend + backend runtime stabilized.
- Core docs baseline completed.

### Phase 2 - Core Payment Execution (15% -> 35%)
Status: 100%

Completed:
- API-backed programmable payment lifecycle.
- Manual and batch execution flows.
- Solana evidence (`txHash`, network, explorer URL, simulation flag).

### Phase 3 - Compliance Controls (35% -> 55%)
Status: 84%

Completed:
- Deterministic KYC/KYT/AML/Travel Rule checks.
- Server-side execution gate (`allow` required).
- Persistent compliance alerts + resolve flow.

Remaining:
- richer external provider scenario coverage.

### Phase 4 - Audit and Evidence Layer (55% -> 70%)
Status: 86%

Completed:
- Append-only audit events with payment/transaction linkage.
- Transaction evidence surfaced in UI.
- CSV export for transaction records.

Remaining:
- regulator-specific export bundles beyond CSV.

### Phase 5 - AI Assistant and Guardrails (70% -> 82%)
Status: 82%

Completed:
- Authenticated AI chat proxy to DashScope-compatible endpoint.
- Policy-constrained recommendation flow.
- Rate limiting on AI chat endpoint.

Remaining:
- deeper grounding and policy knowledge tooling.

### Phase 6 - UI/UX Stabilization (82% -> 92%)
Status: 93%

Completed:
- Consistent operations dashboard UI.
- Role-aware UI gating for privileged actions.
- Sidebar hover-expand/collapse behavior (desktop).
- Login page back-to-landing action.
- Batch execution UX clarity (`ALLOW` eligibility messaging).

Remaining:
- deeper persistence in Settings/integration forms.

### Phase 7 - Submission Packaging (92% -> 97%)
Status: 84%

Completed:
- README, architecture, roadmap, and audit docs synced.
- Security rollout runbook, demo runbook, submission checklist updated.
- Production deployment and persistence verification documented.

Remaining:
- final Loom video,
- final team metadata lock,
- final public submission proof capture.

### Phase 8 - Final QA and Submission (97% -> 100%)
Status: 72%

Completed:
- end-to-end flow validated on hosted deployment.
- auth, payment, compliance, and transaction evidence verified.

Remaining:
- structured repeat dry-runs,
- final submission lock-in artifacts.

## 2) Workstream Tracking

| Workstream | Weight | Current % | Notes |
|---|---:|---:|---|
| Scope and Setup | 15% | 100% | Stable baseline complete. |
| Core Payment Execution | 20% | 100% | Single + batch execution fully integrated. |
| Compliance Engine | 20% | 84% | Deterministic flow complete, provider depth pending. |
| Audit and Evidence | 15% | 86% | Persisted and visible evidence chain. |
| AI Guardrails | 12% | 82% | Live AI path with policy boundaries. |
| UI/UX | 10% | 93% | Demo-strong interaction quality. |
| Submission Assets | 8% | 84% | Mostly complete; final media pending. |

Weighted readiness: about 90%.

## 3) Page-Level Snapshot

| Page | Current % | Notes |
|---|---:|---|
| Landing (`/`) | 96% | Pitch-ready presentation quality. |
| Login (`/login`) | 96% | Stable auth, password toggle, back-to-landing action. |
| Dashboard (`/dashboard`) | 84% | KPI + charting + operational context stable. |
| Payments (`/payments`) | 95% | Full lifecycle + improved batch UX + role controls. |
| Compliance (`/compliance`) | 84% | Alert lifecycle integrated and persistent. |
| AI Agent (`/ai-agent`) | 83% | Live chat path and policy boundaries active. |
| Audit Trail (`/audit-trail`) | 84% | Filterable append-only evidence flow. |
| Transactions (`/transactions`) | 82% | Evidence and export flow stable. |
| Wallets (`/wallets`) | 72% | RPC refresh active, provider depth pending. |
| Settings (`/settings`) | 62% | Useful shell, deeper persistence still pending. |

## 4) Required Quality Gates Before Submission

- Gate A: end-to-end payment flow works without code edits.
- Gate B: compliance allow/review/block scenarios can be demonstrated.
- Gate C: transaction and audit evidence are visible in UI.
- Gate D: all core docs reflect actual implementation.
- Gate E: security env vars validated in deployment target.
- Gate F: production `/api/*` runtime and persistence mode verified.

## 5) Post-Hackathon Path

### Phase A - Hardening (0% -> 40%)
- Add automated integration tests.
- Split backend into route/service modules.
- Add structured logs and error telemetry.

### Phase B - Pilot Readiness (40% -> 75%)
- Integrate production-grade compliance connectors.
- Integrate institutional custody flows.
- Expand governance and approval controls.

### Phase C - Demo Day Readiness (75% -> 100%)
- Reliability tuning and fallback scripts.
- Final narrative packaging and judge Q&A preparation.

## 6) Key Risks and Mitigations

- Risk: limited automated regression protection.
  - Mitigation: prioritize integration smoke tests for auth/compliance/execution.
- Risk: external provider behavior mismatch.
  - Mitigation: deterministic local compliance engine remains primary fallback.
- Risk: submission asset delays.
  - Mitigation: lock owner/deadline for Loom and final proof capture.
