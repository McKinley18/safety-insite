# AUTH-P1 — Implementation Report

## Change

`backend/src/auth/guards/jwt.guard.ts`, `JwtGuard.canActivate` — full before/after in git; summary:

1. **Precedence fix**: the `Authorization` header is now checked and, if present, validated (`jwt.verify`) *before* the `DEV_AUTH_BYPASS` branch is ever consulted. A present-and-valid token always wins. A present-but-invalid token is rejected (`401`) and never falls through to the synthetic identity. The bypass branch now only runs when no `Authorization` header was sent at all.
2. **Synthetic identity fix**: the bypass identity's `userId` changed from the JS number literal `1` to a fixed, structurally-valid UUID string (`00000000-0000-4000-8000-000000000001`), so it no longer crashes uuid-typed ownership columns (`sites.ownerUserId`, `inspections.ownerUserId`, etc.) on read paths.

No other file was modified. No migration was needed (no schema change). No frontend change was needed (frontend already sends both a real token when present and the dev-org header; the backend now correctly prioritizes the former).

## Why this is the minimum root fix

Both defects were physically located in one function, in the same guard that manufactures identity for every protected route in the application — this is the single, correct choke point per the task's own Phase 7 instruction ("repair the guard/auth layer rather than adding route-specific patches"). No route-specific conditionals were added anywhere. The prior P1 phase's downstream defensive fix (`entitlement.service.ts:20`) was deliberately left in place as harmless, still-correct defense-in-depth, per explicit instruction.

## Preserved downstream workarounds

- `entitlement.service.ts:20` uuid-format guard — kept, unmodified.
- `safescope-v2.controller.ts`'s `getLocalDevBypassUserId()`/`localDevAuthBypassEnabled` fallback — kept, unmodified (already effectively unreachable given `JwtGuard` always populates a non-`viewer`-mapped `request.user` under bypass; not part of this defect, out of scope to touch).

## Verification performed (see companion artifacts for full evidence)

- Live reproduction of the pre-fix defect using the real, committed guard body against a genuine JWT (`AUTH_MATRIX.md`, `AUTH_LIVE_REPRODUCTION.md`).
- Full auth matrix (bypass × token × force-pro) against a disposable database with two real registered/logged-in users (`AUTH_MATRIX.md`).
- Two-user cross-authorization isolation on sites and inspections, under bypass mode with distinct valid tokens (`AUTH_TWO_USER_AUTHORIZATION.md`).
- Real-browser login and dashboard verification against the fixed backend (`AUTH_FRONTEND_BROWSER_VERIFICATION.md`).
- Full regression: HazLenz V4 228/228, billing regression 24/24, backend/frontend builds, `git diff --check` (`AUTH_REGRESSION.md`).

## Database safety

All live verification ran against a disposable database (`test_authp1_20260816`), created fresh for this phase, with `DATABASE_URL` explicitly overridden and resolved-target printed/verified before every migration and mutating command. The original `safescope` development database's `DATABASE_URL` was never used for any command in this phase. The disposable database and both ad hoc local server processes were torn down at the end of the phase (see final report).
