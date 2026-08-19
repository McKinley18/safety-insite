# AUTH-P1 — Live Reproduction

Full request/response evidence lives in `AUTH_MATRIX.md` (post-fix matrix, all modes) and the pre-fix defect isolation in that same file's "Pre-fix vs post-fix" section (backed by `prefix-repro/prefix_demo.js`, a byte-verbatim extract of the committed pre-fix `JwtGuard.canActivate` body, run against a real JWT freshly issued by the live backend). This file records the chain traced for each reproduced mode, per Phase 2/3's request.

## Mode D (bypass ON, valid token) — the reported defect

```
request → Authorization: Bearer <real JWT for user A>
  → JwtGuard.canActivate (pre-fix): DEV_AUTH_BYPASS branch evaluated FIRST, returns true
    before authHeader is ever read
  → request.user = { userId: 1, email: 'dev@sentinelsafety.local', ... }  (synthetic, wrong)
  → downstream: any uuid-typed ownership query using request.user.userId as "1" → 500
    ("invalid input syntax for type uuid")
  → response: raw 500 (sites/inspections) or silently-wrong identity (billing, no uuid crash
    since UserSubscription.userId is varchar — instead a real user would see billing state
    that doesn't belong to them)
```

Post-fix chain for the identical request:

```
request → Authorization: Bearer <real JWT for user A>
  → JwtGuard.canActivate: authHeader present → jwt.verify succeeds
  → request.user = decoded JWT (real userId, real email) — bypass branch never reached
  → downstream: uuid-typed query uses A's real UUID → correct, scoped result
  → response: 200, A's own data only
```

## Mode C (bypass ON, no token) — second, previously-undocumented defect found this phase

```
request → no Authorization header
  → JwtGuard.canActivate (pre-fix and post-fix both reach the bypass branch here — this part
    of the control flow is correct in both versions)
  → PRE-FIX: request.user.userId = 1 (JS number)
    → GET /sites → `site.ownerUserId = :scopeId` with scopeId=1 → Postgres uuid column
      rejects `1` → 500 (same failure class as the entitlement-service bug the prior P1
      phase fixed at one call site, but unfixed here)
  → POST-FIX: request.user.userId = '00000000-0000-4000-8000-000000000001' (valid uuid
    shape) → query executes normally, matches zero rows (no site owned by that identity
    yet) → 200, empty list
```

Confirmed live post-fix: `GET /sites`, `GET /inspections`, `GET /billing/status` all return `200` with no token, bypass on (`AUTH_MATRIX.md`).

## Modes A/B and malformed token — unaffected, confirmed unchanged

Bypass OFF behaves identically pre- and post-fix (the fix only reorders/adds a check inside the bypass-adjacent path; the non-bypass `authHeader` branch's logic — verify or reject — is unchanged code, same `jwt.verify`/`catch` block, only moved earlier in the function). Confirmed live: no token → 401; valid token → 200 with correct identity; garbage token → 401 "Invalid token" — both bypass ON and bypass OFF.
