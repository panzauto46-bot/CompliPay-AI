# CompliPay AI UI/UX Design Blueprint (v2)

Updated: March 17, 2026 (implementation-aligned)

This document maps UX intent to the current product state in repository.

## 1) Design Objectives

- Deliver a trusted institutional interface for stablecoin operations.
- Keep compliance outcomes visible before execution actions.
- Make the payment flow clear: create -> verify -> decide -> execute -> audit.
- Present on-chain evidence and audit context in one navigation system.

## 2) UX Principles

- Trust first: compliance and risk status are always visible near actions.
- Fast operations: high-frequency actions are reachable quickly from Payments and Dashboard.
- Human control: AI gives guidance, but policy and user role still govern execution.
- Explainability: compliance decisions include reasons and severity context.
- Evidence by default: transaction/audit references are surfaced in operational views.

## 3) Role-Based Experience

- Admin/operator:
  - Can create payments, run compliance, request recommendations, execute, resolve alerts, refresh wallets.
- Viewer:
  - Read-only access for sensitive operational surfaces.
  - UI now explicitly hides or disables privileged controls in key screens.

## 4) Information Architecture

Main navigation:
- Dashboard
- Payments
- Compliance
- AI Agent
- Audit Trail
- Transactions
- Wallets
- Settings

Supporting routes:
- Landing
- Login

## 5) Primary Demo Flow

1. Sign in as admin or operator.
2. Open Payments and create a programmable payment.
3. Run compliance and inspect decision/reasons.
4. Request AI recommendation.
5. Execute payment (manual or AI mode).
6. Verify transaction evidence in Transactions.
7. Verify lifecycle evidence in Audit Trail.

## 6) Screen Blueprint (Current)

### A) Login and Session
- Email/password sign-in with demo credentials.
- Session-backed protected navigation.

### B) Dashboard
- KPI cards and chart summaries.
- Recent transactions and compliance alerts.

### C) Payments
- Payment list with filters/search.
- Create modal with policy fields.
- Compliance, recommendation, and execution controls.
- Batch execution controls for privileged roles.

### D) Compliance
- Alert monitoring and severity/status views.
- Alert detail modal and resolve action (privileged roles only).

### E) AI Agent
- Live chat panel (authenticated backend proxy).
- Task visualization for automation themes.

### F) Transactions
- Filterable transaction list.
- Evidence modal with explorer linkage and export support.

### G) Wallets
- Wallet inventory and balance refresh.
- Read-only vs manage actions based on role.

## 7) Visual Direction

- Dark institutional base with strong contrast hierarchy.
- Status semantics:
  - Green for pass/healthy states,
  - Amber for review/investigation,
  - Red for block/high risk,
  - Cyan/violet for AI and action emphasis.
- Dense but readable layout tuned for operations dashboard behavior.

## 8) Motion and Interaction

- Lightweight transitions for cards, modals, and action feedback.
- Avoid decorative-only motion; prioritize operational clarity.
- Action buttons reflect in-progress states where applicable.

## 9) Responsive Strategy

- Desktop-first operations layout.
- Mobile support via collapsible sidebar and stacked content.
- Tables and evidence views remain accessible on smaller screens.

## 10) Accessibility and Compliance UX

- Core action paths remain keyboard reachable.
- Critical statuses use text labels in addition to color.
- Compliance reasons are displayed as readable text lists.
- Timestamp presentation should stay explicit in future timezone enhancement work.

## 11) Implementation Notes and Gaps

Implemented and aligned:
- Role-aware operational gating.
- Policy-first flow in payment execution UX.
- Evidence-centric transaction and audit surfaces.

Still limited:
- Settings area remains partly presentation-level.
- Some integration controls in wallet/settings are still demo-oriented.

## 12) Handoff Outputs

- `docs/UI_UX_DESIGN.md` (this document)
- `design-system/tokens.css`
- `prototype/index.html`
- `prototype/styles.css`
- `prototype/app.js`
