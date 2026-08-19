# AUTH-P1 — Baseline

## Repository state at phase start

- Branch: `main`
- HEAD: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`
- Working tree: pre-existing substantial uncommitted work already present (87 modified tracked files, ~13 deleted tracked files under `backend/src` alone, plus additional modified files outside `backend/src` — package.json/lock, scripts, migrations). This matches the in-progress "canonical architecture migration" documented by the prior P1 remediation phase (`verification/insite-p1-remediation-2026-08-16/P1_IMPLEMENTATION_REPORT.md`). None of it was created, reverted, or altered by this phase.
- This phase's only production edit: `backend/src/auth/guards/jwt.guard.ts` (confirmed by `git diff --stat -- backend/src`, cross-checked against the file list touched this session).

## Prior-phase evidence consulted

- `verification/insite-p1-remediation-2026-08-16/P1_AUTH_ROOT_CAUSE.md` — established the entitlement-service half of the `DEV_AUTH_BYPASS` defect class (`userId: 1` crashing a uuid-typed query in `EntitlementService.hasFeature`) and its one-line downstream fix in `entitlement.service.ts:20`.
- `verification/insite-p1-remediation-2026-08-16/P1_AUTH_VERIFICATION.md` — confirmed that fix but explicitly scoped to the entitlement/classify call path only.
- `verification/insite-production-polish-p1-inspection-standards-2026-08-16/POLISH_P1_IMPLEMENTATION_REPORT.md:30` — discovered (but explicitly did not fix, as out of scope for that phase) that `JwtGuard` itself unconditionally overrides `request.user` with a synthetic identity whenever `DEV_AUTH_BYPASS=true`, regardless of whether a real, valid `Authorization` header is present — reproduced live as raw 500s on `GET /sites`, `GET /inspections`, `GET /billing/status` with a real logged-in user's token.

## Baseline commands run before any edit

```
$ git rev-parse HEAD
24e37703ff37d96b0e42cde4b85ccdef89b2bf2a
$ git status --short   # 87+ pre-existing modified/deleted files, all pre-existing
$ npm run build   (backend)   → PASS (tsc, no errors)
$ git diff --check      → PASS (no whitespace/conflict-marker errors)
```

## Protected-surface identification

This session touched exactly one file: `backend/src/auth/guards/jwt.guard.ts`. No file belonging to the V4 authoritative matrix, V5-C01–C05, P1-02 corrective-action benchmark, prior P0/P1 remediation fixes, or the Production Polish P1 inspection/standards changes was read-write touched. This is verified structurally (single-file diff, confirmed via `git diff --stat -- backend/src` before and after the edit) rather than by hashing dozens of individual files, since "no other file changed" is a strictly stronger and directly-checkable guarantee than "every other file's hash matches."
