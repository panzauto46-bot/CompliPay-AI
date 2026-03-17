# StableHacks Submission Checklist

Use this checklist before final lock-in on DoraHacks.

## 1) Team Metadata
- [ ] Project name is `CompliPay AI`.
- [ ] Team member list is complete.
- [ ] Country and contact details are complete.

## 2) Required Links
- [ ] Public GitHub repository URL is valid.
- [ ] Loom demo URL is available (max 3 minutes).
- [ ] Public demo URL or technical overview video URL is available.

## 3) Product Validation
- [ ] At least one payment execution flow is demonstrated.
- [ ] Compliance decision flow is shown (`ALLOW`, `REVIEW`, `BLOCK`).
- [ ] Transaction hash and explorer link are visible.
- [ ] Audit trail evidence is shown in the demo.

## 4) Security and Deployment Readiness
- [ ] Backend deployment is confirmed for `/api/*` runtime.
- [ ] Required security env vars are set:
  - [ ] `AUTH_PBKDF2_ITERATIONS`
  - [ ] `SESSION_TOKEN_PEPPER`
  - [ ] `TRUST_PROXY`
- [ ] Optional wallet mint env vars are reviewed (`USDC_TOKEN_MINT`, `USDT_TOKEN_MINT`).
- [ ] Security rollout runbook reviewed (`docs/SECURITY_ROLLOUT_RUNBOOK.md`).

## 5) Documentation Sync Gate
- [ ] `README.md` is aligned with current implementation.
- [ ] `docs/ARCHITECTURE.md` is aligned with backend-driven architecture.
- [ ] `docs/ROADMAP.md` and audit docs reflect current status.
- [ ] `docs/PROJECT_COMPLETION_AUDIT.md` matches latest weighted readiness values.
- [ ] UI/UX and demo flow docs are still accurate.

## 6) Demo Dry-Run Gate
- [ ] Dry-run #1 completed without blocker.
- [ ] Dry-run #2 completed without blocker.
- [ ] Dry-run #3 completed without blocker.

## 7) Final Submission
- [ ] All DoraHacks fields reviewed for accuracy.
- [ ] Submission completed before deadline lock.
- [ ] Final confirmation screenshot and links archived.
