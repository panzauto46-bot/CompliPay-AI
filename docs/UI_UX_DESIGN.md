# CompliPay AI UI/UX Design Blueprint (v3)

Updated: March 19, 2026 (Asia/Jakarta)

This document maps UX intent to the current deployed product behavior.

## 1) Design Objectives

- Deliver a trust-first institutional operations interface.
- Keep policy and compliance status close to action buttons.
- Make end-to-end flow explicit: create -> evaluate -> decide -> execute -> audit.
- Keep evidence visible without leaving the main workflow.

## 2) UX Principles

- Policy first: execution is visually and functionally gated by compliance.
- Operational speed: frequent actions are one or two clicks away.
- Explainability: decisions include score and reason text.
- Human-in-the-loop AI: AI recommends; policy and role still decide.
- Evidence continuity: transaction and audit references remain connected.

## 3) Role-Based UX

### Admin and operator
- Can create payments, run compliance, request recommendation, execute, resolve alerts, refresh wallets.

### Viewer
- Read-only posture for privileged action surfaces.
- Mutation controls hidden or disabled where appropriate.

## 4) Information Architecture

Primary navigation:
- Dashboard
- Payments
- Compliance
- AI Agent
- Audit Trail
- Transactions
- Wallets
- Settings

Supporting routes:
- Landing (`/`)
- Login (`/login`)

## 5) Current Interaction Patterns

### Sidebar behavior
- Desktop: sidebar opens on hover from left edge and auto-hides on mouse leave.
- Mobile: sidebar opens with menu button and closes with backdrop/toggle.

### Login behavior
- Password visibility toggle (eye icon).
- Back navigation button: `Back to Landing`.
- Friendly backend connectivity error hints.

### Payments behavior
- Create modal validates required fields.
- Decision badges: `ALLOW`, `REVIEW`, `BLOCK`, `Not Checked`.
- Batch action only executes eligible `ALLOW` items.

## 6) Primary Demo Flow (Current)

1. Login as admin.
2. Create payment contract.
3. Run compliance and inspect decision/score.
4. Request AI recommendation.
5. Execute payment.
6. Verify evidence in Transactions.
7. Verify lifecycle in Audit Trail.

## 7) Screen Blueprint (Current)

### A) Login
- Email/password auth
- Demo credential shortcuts
- Session-aware redirect

### B) Dashboard
- KPI overview
- Volume chart
- Recent transactions and alerts

### C) Payments
- Filter/search
- Create modal
- Compliance/AI/execute controls
- Batch selection and batch execute

### D) Compliance
- Alert list by severity/status
- Resolve action for privileged roles

### E) AI Agent
- Authenticated chat panel
- Task cards and operational context

### F) Transactions
- Filterable table
- Evidence modal and CSV export

### G) Wallets
- Wallet cards and refresh
- Role-aware operational actions

### H) Settings
- Profile/security/integration shell
- Still partly demo-oriented

## 8) Visual Direction

- Dark institutional base and high contrast hierarchy.
- Semantic states:
  - Green: allow/success/healthy
  - Amber: review/investigating
  - Red: blocked/high risk
  - Cyan/Violet: action and AI emphasis

## 9) Responsive Strategy

- Desktop-first operations layout.
- Mobile uses stacked content and collapsible navigation.
- Core actions remain reachable on smaller screens.

## 10) Accessibility Notes

- Core flows remain keyboard reachable.
- Status is conveyed by text labels, not color only.
- Error messages are explicit and readable.

## 11) Current UX Gaps

- Settings depth remains limited.
- Some integration forms are still placeholders.
- Advanced evidence workflows can be expanded for enterprise reporting.

## 12) Handoff Outputs

- `docs/UI_UX_DESIGN.md`
- `design-system/tokens.css`
- `prototype/index.html`
- `prototype/styles.css`
- `prototype/app.js`
