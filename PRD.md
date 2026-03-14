# Product Requirements Document (PRD)

## Product Name
CompliPay AI

## Version
StableHacks 2026 Edition (v2)

## 0. Hackathon Context and Track Selection

### Event Context
- Event: StableHacks 2026
- Format: Fully online (DoraHacks)
- Hackathon period: March 13, 2026 - March 22, 2026
- Demo Day (Top 10 only): Zurich, May 28, 2026

### Selected Track (Primary)
- **Programmable Stablecoin Payments**

### Secondary Alignment (Non-primary for MVP)
- Cross-Border Stablecoin Treasury (only as a future extension)

### Mandatory Prerequisites (for all tracks)
- KYC (Know Your Customer)
- KYT (Know Your Transaction)
- AML (Anti-Money Laundering)
- Travel Rule

## 1. Product Overview

CompliPay AI is a Solana-based institutional payment system that enables programmable stablecoin payments with a built-in compliance layer and auditability. It is designed for regulated institutions that need fast settlement, policy enforcement, and transparent controls.

The MVP focuses on:
- Programmable payment contracts
- Compliance-first execution gates
- AI-assisted operational decisions
- On-chain transaction evidence on Solana testnet

## 2. Problem Statement

Institutions handling cross-border value transfer face:
- slow and expensive traditional rails
- fragmented compliance processes
- manual risk operations
- weak real-time transparency for auditors and regulators

They need a system that combines fast settlement and strict compliance controls in one workflow.

## 3. Target Users

### Primary Users
- Treasury managers at financial institutions
- Compliance officers
- Payment operations teams

### Secondary Users
- Internal auditors
- External regulators/examiners
- Institutional partners (custody/payment infra)

## 4. Hackathon Goals

CompliPay AI MVP must demonstrate:
1. End-to-end programmable payment flow on Solana testnet
2. Mandatory compliance checks before execution
3. AI-assisted execution decisioning
4. On-chain evidence (transaction hash + explorer link)
5. Clear, complete, and submission-ready project artifacts

## 5. Scope

### 5.1 In-Scope (MVP)
- Create programmable payment instruction (escrow/milestone/subscription/treasury transfer)
- Run compliance screening: KYC, KYT, AML, Travel Rule
- Apply policy decision matrix (`ALLOW`, `REVIEW`, `BLOCK`)
- Execute allowed payment on Solana testnet
- Display tx hash and explorer deep link in audit trail
- Dashboard for payment status, alerts, and operational logs
- Lightweight AI agent for execution recommendation and/or controlled auto-execution

### 5.2 Out-of-Scope (for hackathon MVP)
- Mainnet production rollout
- Full enterprise custody integration (real Fireblocks signing in production mode)
- Multi-chain support
- Full legal/compliance vendor certification process
- RWA/commodity issuance module

## 6. Functional Requirements

### FR-001: Payment Contract Creation
- User can create a programmable payment with:
  - payer
  - beneficiary
  - token
  - amount
  - trigger type
  - execution conditions
- Acceptance criteria:
  - payment contract record is saved
  - contract can be reviewed before execution

### FR-002: KYC Gate
- Execution requires verified sender and beneficiary profile status.
- Acceptance criteria:
  - if KYC incomplete, status = `BLOCK`
  - blocked contract cannot be executed

### FR-003: KYT Gate
- Transaction risk check scores each payment.
- Acceptance criteria:
  - low/medium risk can continue to next checks
  - high risk becomes `REVIEW` or `BLOCK` based on threshold policy

### FR-004: AML Gate
- Address/entity sanction and AML risk screening is required.
- Acceptance criteria:
  - sanctioned counterparty -> `BLOCK`
  - non-sanctioned -> continue flow

### FR-005: Travel Rule Gate
- Sender and receiver metadata must exist for threshold-triggered transfers.
- Acceptance criteria:
  - missing required Travel Rule data -> `REVIEW` or `BLOCK`
  - complete data -> continue flow

### FR-006: Policy Decision Engine
- Engine returns final decision: `ALLOW`, `REVIEW`, `BLOCK`.
- Acceptance criteria:
  - only `ALLOW` can execute automatically
  - `REVIEW` requires manual approval
  - `BLOCK` is terminal until data/policy changes

### FR-007: Solana Testnet Execution
- Allowed payment executes on Solana testnet.
- Acceptance criteria:
  - confirmed transaction hash is stored
  - explorer link is shown in UI

### FR-008: Audit Trail
- Every action and decision is logged with timestamp and actor/source.
- Acceptance criteria:
  - log includes compliance decision and tx reference (if executed)
  - logs are filterable by status/type/time

### FR-009: AI Assistance
- AI agent provides operational suggestion for timing/routing/execution mode.
- Acceptance criteria:
  - suggestion is visible in UI
  - AI cannot bypass compliance policy engine

### FR-010: Submission Mode Demo
- System supports a clean 3-minute demo flow.
- Acceptance criteria:
  - happy-path demo can be run from start to finish without manual code edits

## 7. Non-Functional Requirements

- Security:
  - no secret/private key exposed in frontend
  - environment variables used for sensitive config
- Reliability:
  - app supports deterministic demo path for judges
- Performance:
  - core dashboard actions respond within acceptable UX latency
- Usability:
  - UI must be legible, clean, and consistent for institutional audience
- Traceability:
  - each compliance decision and payment state is auditable

## 8. Compliance Rules and Decision Matrix

### Mandatory Checks
- KYC: identity/business verification required
- KYT: transaction behavior/risk monitoring
- AML: sanctions/illicit finance screening
- Travel Rule: sender/receiver information transfer compliance

### Decision Matrix
- `ALLOW`: all mandatory checks pass
- `REVIEW`: one or more checks uncertain or threshold-triggered
- `BLOCK`: one or more hard-fail checks (e.g., sanction hit)

### Policy Principle
- Compliance decisions are authoritative.
- AI and automation can only operate inside policy boundaries.

## 9. System Architecture

### Frontend
- React dashboard for operations, compliance center, AI panel, and audit view

### Backend/API
- Payment orchestration
- Compliance policy evaluation
- Audit event persistence

### Blockchain Layer
- Solana testnet transaction submission and confirmation

### AI Layer
- LLM-assisted recommendation and controlled execution helper

## 10. Technical Stack

### Blockchain
- Solana

### Smart Contract / Program Layer
- Rust + Anchor (or direct Solana program interaction where appropriate)

### Frontend
- React + Vite + TypeScript

### Backend
- Node.js (preferred for MVP speed)

### Storage
- Database for operational/compliance logs
- Optional decentralized artifacts (IPFS) for non-sensitive references

## 11. Demo Script (3 Minutes Max)

1. Open dashboard and show institutional context.
2. Create programmable payment contract.
3. Run KYC/KYT/AML/Travel Rule checks.
4. Show policy decision (`ALLOW` path).
5. Trigger AI recommendation and execute payment.
6. Show Solana testnet tx hash + explorer link.
7. Show audit trail entries for regulator/auditor review.

## 12. Submission Requirements Checklist (StableHacks)

### Team and Eligibility
- Team submission only (no solo submission)
- Project built on Solana
- MVP/live prototype/private beta required (concept-only not allowed)

### Required Submission Artifacts
- Project name, team members, country
- Public GitHub repository
- Loom video (max 3 minutes)
- Testnet demo link or technical overview video
- Submission completed before deadline lock

### Recommended Support Assets
- Architecture diagram
- Compliance policy decision table
- Demo runbook for judges

## 13. Timeline and Internal Milestones

### External Timeline
- Hackathon start: March 13, 2026
- Submission deadline: March 22, 2026 (follow DoraHacks final cutoff time)

### Internal Delivery Plan
- March 15-16: finalize scope, architecture, and selected track
- March 17-18: payment flow + compliance engine MVP
- March 19-20: Solana testnet integration + audit trail
- March 21: polish UI, stabilize demo flow, rehearse pitch
- March 22: record Loom, finalize submission, submit before cutoff

## 14. Judging Criteria Alignment

### Team Execution and Technical Readiness
- working MVP with executable flow and stable demo

### Institutional Fit and Compliance Awareness
- explicit compliance gates and decision controls

### Stablecoin Infrastructure Innovativeness
- programmable execution + AI assistance + policy guardrails

### Scalability and Adoption Potential
- modular architecture for institution onboarding and process expansion

### Submission Clarity and Completeness
- all required artifacts, clear narrative, reproducible demo

## 15. Risks and Mitigations

- Risk: Solana integration delays
  - Mitigation: freeze smart contract scope early; prioritize testnet transaction success
- Risk: compliance logic too broad for timeline
  - Mitigation: implement deterministic rule matrix first, then iterate
- Risk: demo instability
  - Mitigation: maintain scripted fallback path and dry-run checklist
- Risk: incomplete submission package
  - Mitigation: use artifact checklist and final-day review gate

## 16. Definition of Done (100% Hackathon-Ready)

CompliPay AI is considered complete for StableHacks submission when all statements below are true:

1. Selected track is explicitly **Programmable Stablecoin Payments**.
2. Mandatory compliance checks (KYC, KYT, AML, Travel Rule) exist in decision flow.
3. At least one programmable payment executes on Solana testnet.
4. Tx hash and explorer link are visible in the product demo.
5. Audit trail captures compliance decision and execution event.
6. Public GitHub repo is up-to-date and accessible.
7. Loom video (<= 3 minutes) explains problem, approach, and live solution.
8. Testnet demo link or technical overview video is included.
9. Team metadata (project/team/country) is complete.
10. Submission is sent before DoraHacks deadline lock.

## 17. Post-Hackathon Roadmap

- Production-grade custody integrations
- Advanced risk scoring and monitoring pipelines
- Real FX and market data integration (including optional SIX data feed access)
- Institutional API suite for payment orchestration
- Multi-region compliance policy templates

## 18. Execution Reference

- Project overview and setup: `README.md`
- Detailed execution plan: `docs/ROADMAP.md`
- Technical architecture: `docs/ARCHITECTURE.md`
- Demo procedure: `docs/DEMO_RUNBOOK.md`
- Final submission checklist: `docs/SUBMISSION_CHECKLIST.md`
