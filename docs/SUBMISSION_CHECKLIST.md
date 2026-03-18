# StableHacks Submission Checklist

Updated: March 19, 2026 (Asia/Jakarta)

Use this checklist before final lock-in on DoraHacks.

## 1) Team Metadata

- [ ] Project name set to `CompliPay AI`
- [ ] Team member list finalized
- [ ] Country/contact fields verified

## 2) Required Links

- [x] Public GitHub repository URL valid
- [ ] Final Loom demo URL (max 3 minutes) added
- [x] Public demo URL valid (`https://compli-pay-ai.vercel.app/`)

## 3) Product Validation

- [x] Payment create flow validated
- [x] Compliance decision flow validated (`ALLOW`, `REVIEW`, `BLOCK`)
- [x] Transaction evidence visible
- [x] Audit trail evidence visible
- [x] Batch execute flow validated for `ALLOW`-eligible items

## 4) Security and Deployment Readiness

- [x] `/api/*` backend runtime verified on Vercel
- [x] `/api/health` returns `ok: true`
- [x] Persistence mode verified (`sqlite+postgres-snapshot` when `DATABASE_URL` set)
- [x] Required security env vars present:
  - [x] `AUTH_PBKDF2_ITERATIONS`
  - [x] `SESSION_TOKEN_PEPPER`
  - [x] `TRUST_PROXY`
- [x] Security rollout runbook reviewed (`docs/SECURITY_ROLLOUT_RUNBOOK.md`)

## 5) Documentation Sync Gate

- [x] `README.md` aligned to deployed implementation
- [x] `docs/ARCHITECTURE.md` aligned to current runtime model
- [x] `docs/ROADMAP.md` aligned to latest status
- [x] `docs/PROJECT_COMPLETION_AUDIT.md` aligned to latest readiness estimate
- [x] `docs/PROJECT_AUDIT_REPORT.md` aligned to latest findings
- [x] `docs/UI_UX_DESIGN.md` aligned to current UX behavior
- [x] `docs/DEMO_RUNBOOK.md` aligned to current demo steps

## 6) Demo Dry-Run Gate

- [ ] Dry-run #1 completed end-to-end
- [ ] Dry-run #2 completed end-to-end
- [ ] Dry-run #3 completed end-to-end

## 7) Final Submission Lock

- [ ] All DoraHacks fields reviewed one final time
- [ ] Submission completed before deadline lock
- [ ] Final confirmation screenshots and links archived
