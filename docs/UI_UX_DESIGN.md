# CompliPay AI UI/UX Design Blueprint (v1)

This document translates the PRD into a UI/UX plan ready for prototyping and hackathon presentation.

## 1. Design Objectives

- Deliver a trusted institutional experience for cross-border payment operations.
- Make compliance feel automated while remaining clear to human reviewers.
- Enable users to execute programmable payments in a few explicit steps.
- Surface on-chain proof and audit status in real time.

## 2. UX Principles

- Trust First: risk status, compliance status, and audit evidence are always visible.
- Fast to Execute: core tasks (create payment, run checks, execute) are reachable within 3 clicks from dashboard.
- Human in Control: AI provides recommendations and actions, while users keep manual override authority.
- Explainable Compliance: every KYC/KYT/AML/Travel Rule result must include reason and severity.
- Audit by Design: every action includes timestamp, actor, tx hash, and finality status.

## 3. Target Personas

- Treasury Manager (Primary)
  Focus: fast execution, low cost, and FX efficiency.
- Compliance Officer (Primary)
  Focus: KYC/KYT/AML validation and regulator-ready audit trail.
- Ops Analyst (Secondary)
  Focus: payment status monitoring and incident handling.
- Regulator/Auditor (Secondary)
  Focus: tamper-proof transaction evidence and Travel Rule traceability.

## 4. Information Architecture

- Auth & Access
  - Sign in
  - Role-based session
- Onboarding
  - KYC/KYB submission
  - Verification progress
- Dashboard
  - KPI overview
  - Alert center
- Payments
  - Create programmable payment
  - Templates: Escrow, Milestone, Subscription, Treasury
- Compliance Center
  - KYC/KYT/AML/Travel Rule status
  - Risk explanations
- AI Agent
  - Recommendation feed
  - Auto-execute with approval rules
- Audit Trail
  - On-chain transaction log
  - Explorer deep links
- Integrations
  - Institutional wallet (example: Fireblocks)
  - Compliance provider connectors

## 5. Primary User Flow (Demo Flow)

1. User signs in to the institutional dashboard.
2. User completes or reviews KYC/KYB status.
3. User creates a programmable payment contract.
4. User runs compliance checks.
5. AI agent executes the payment according to policy.
6. System displays tx hash on Solana testnet.
7. User reviews final audit trail evidence.

## 6. Screen Blueprint

### A. Login + KYC Screen

Purpose:
- Validate institutional identity before payment access.

Components:
- Brand header + environment badge (Testnet/Mainnet).
- Enterprise login form.
- KYC stepper (Identity, Docs, Sanctions, Approval).
- Risk notice panel.

Primary CTA:
- Continue to Verification

### B. Operations Dashboard

Purpose:
- Provide real-time operational overview.

Components:
- KPI cards: daily volume, settlement speed, compliance pass rate, active contracts.
- Urgent alerts panel (high risk, pending approvals).
- Quick actions: New Payment, Run Compliance, Execute with AI.

Primary CTA:
- Create Payment Contract

### C. Programmable Payment Builder

Purpose:
- Configure payment logic with clear business rules.

Components:
- Input payer, beneficiary, token, amount.
- Trigger rules: Escrow / Milestone / Subscription / Treasury.
- Schedule + fallback action.
- Approval policy toggle (manual approval vs threshold-based auto).

Primary CTA:
- Save Contract Draft
- Run Compliance Check

### D. Compliance Command Center

Purpose:
- Present KYC/KYT/AML/Travel Rule outcomes with explainability.

Components:
- Status matrix by compliance category.
- Risk score meter.
- Reason codes and mitigation recommendations.
- Audit action log (who approved what).

Primary CTA:
- Approve & Continue
- Escalate for Review

### E. AI Payment Agent Panel

Purpose:
- Automate payment execution and treasury optimization.

Components:
- AI recommendations (route, timing, FX conversion).
- Simulation output (estimated fee, ETA, confidence).
- Policy compliance guardrails.

Primary CTA:
- Execute with AI Agent
- Switch to Manual Execution

### F. On-Chain Audit Trail

Purpose:
- Present transaction evidence for auditors/regulators.

Components:
- Tx table: Contract ID, Tx Hash, Amount, Status, Timestamp.
- Status filter: Pending/Confirmed/Flagged.
- Solana explorer links.
- Export report (CSV/PDF).

Primary CTA:
- Open Explorer
- Export Audit Report

## 7. Visual Direction

- Brand personality: institutional, futuristic, transparent, action-oriented.
- Color direction:
  - Deep ocean/navy for trust foundation.
  - Teal for success/active states.
  - Amber for warnings.
  - Coral/red for high risk.
- Typography:
  - Heading: Space Grotesk (confident, modern).
  - Body/UI: Manrope (clean, readable).
  - Data/tx hash: IBM Plex Mono (audit readability).
- Background style:
  - Dark gradient + subtle grid for financial infrastructure feel.

## 8. Motion & Interaction

- Page load: stagger reveal for cards (120ms interval).
- Status changes: badge transition + subtle pulse on new tx.
- Alert behavior: high-risk cards include a light border glow.
- Avoid noisy animation: focus on meaningful operational feedback.

## 9. Responsive Strategy

- Desktop-first for operations teams, mobile still fully functional.
- Mobile behavior:
  - Sidebar becomes top navigation.
  - KPI cards become horizontal scroll.
  - Audit table becomes card list.

## 10. Accessibility & Compliance UX

- Main text contrast meets minimum WCAG AA.
- Statuses are not color-only (icon + label text required).
- Keyboard navigable for primary actions.
- Timestamps support explicit timezone display (UTC/local toggle).

## 11. Handoff Outputs in This Repo

- `docs/UI_UX_DESIGN.md` -> this UX blueprint.
- `design-system/tokens.css` -> design tokens and base styles.
- `prototype/index.html` -> interactive one-page prototype.
- `prototype/styles.css` -> visual styling and responsive layout.
- `prototype/app.js` -> compliance + AI execution interaction simulation.
