# AUTH-P1 — Auth Contract (implemented)

## Precedence rule

`JwtGuard.canActivate` now evaluates in this order, for every request regardless of `DEV_AUTH_BYPASS`:

1. **`Authorization` header present** → attempt `jwt.verify`.
   - Valid → `request.user = decoded` (the real authenticated identity). Bypass is never consulted.
   - Invalid/expired → `401 Unauthorized` ("Invalid token"). Never falls back to a synthetic identity — presenting a credential is a declared intent to authenticate as that identity, and a broken credential must fail visibly, not silently resolve to a different (fake) user.
2. **No `Authorization` header** →
   - `DEV_AUTH_BYPASS=true` and `NODE_ENV !== 'production'` → synthetic development identity (`userId` is now the fixed, structurally-valid UUID `00000000-0000-4000-8000-000000000001`, tier from `DEV_FORCE_EXPERT`/`DEV_FORCE_PRO`/default-free exactly as before).
   - Otherwise → `401 Unauthorized` ("No token provided").

## Production

`DEV_AUTH_BYPASS` is inert in production by two independent layers: `JwtGuard` itself checks `NODE_ENV !== 'production'`, and `validateProductionEnvironment()` (`backend/src/config/validate-production-environment.ts:28-33`, invoked at boot in `main.ts`) hard-fails process startup if `DEV_AUTH_BYPASS`/`DEV_FORCE_PRO`/`DEV_FORCE_EXPERT` are `true` under `NODE_ENV=production`. This phase did not need to add a new guardrail — this one already existed and was verified in place (see `AUTH_ENVIRONMENT_SAFETY.md`).

## DEV_FORCE_PRO / DEV_FORCE_EXPERT

These flags only ever influence the **synthetic bypass identity's tier** (step 2 above). Because a supplied, valid token now always short-circuits at step 1 before bypass is even consulted, `DEV_FORCE_PRO`/`DEV_FORCE_EXPERT` can no longer affect a real authenticated user's entitlement — confirmed live in `AUTH_LIVE_REPRODUCTION.md` (mode E with token: real user stays on their true free-tier entitlement; mode E without token: synthetic identity gets `pro`). Identity and entitlement escalation remain structurally separate: the force-tier flags never touch `request.user.userId`/ownership, only the synthetic user's billing fields.

## Why this contract, not an alternative

The task brief allowed for "valid identity always wins" to be revisited if repository architecture proved a different deliberate contract. It does not: every other bypass touchpoint in the repo (`safescope-v2.controller.ts`'s `getLocalDevBypassUserId()`, the prior P1 fix's own reasoning in `P1_AUTH_VERIFICATION.md`) already assumes "a real user's real identity, when present, is authoritative" — none of them assume bypass should ever override a real, valid credential. This phase's fix makes the code match that already-implied, already-relied-upon contract; it does not invent a new one.
