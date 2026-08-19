# P1-01 — Dev Auth Bypass Raw 500 — Root Cause

## Reproduction (live, full 228-case scale)

Method: real local backend (`node dist/main.js`, disposable DB `test_p1_20260816`), started with the repository's own active `backend/.env` bypass setting (`DEV_AUTH_BYPASS=true`, no `DEV_FORCE_PRO`/`DEV_FORCE_EXPERT` — i.e. the exact configuration actually present in the repo, not the `.env.example` template default of `false`). All 228 HazLenz classify requests from the frozen V4 matrix manifest were sent against this configuration.

**Result: 228/228 requests raw-500'd.** Every single call failed with the identical stack trace (520 occurrences in the server log):

```
QueryFailedError: invalid input syntax for type uuid: "1"
    at ... SelectQueryBuilder.getOne ...
    at async EntitlementService.hasFeature (entitlement.service.js:33:23)
    at async EntitlementGuard.canActivate (entitlement.guard.js:44:13)
```

Client-visible response, captured directly via curl against the unmodified pre-fix build:

```
HTTP/1.1 500 Internal Server Error
{"statusCode":500,"message":"Internal server error"}
```

This is the exact "raw HTTP 500" the task brief describes — a generic, undifferentiated internal-error body with no indication of what happened or what to do, surfacing on the documented default local dev configuration for the exact HazLenz review workflow.

## Chain (request → response)

1. **Frontend auth state**: `frontend-next/lib/safescope.ts:60-77` — a logged-in dev user's browser sends a real `Authorization: Bearer <jwt>` header, plus (in any non-production `NODE_ENV`) an `x-dev-organization-id: dev-local-workspace` header, anticipating that the backend's bypass mode will use it. An unauthenticated dev browsing without logging in sends no bearer token at all. Either way, the frontend's behavior is irrelevant to the crash — see next step.
2. **Backend guard**: `backend/src/auth/guards/jwt.guard.ts:20-49` (`JwtGuard.canActivate`). When `DEV_AUTH_BYPASS === 'true'` and `NODE_ENV !== 'production'`, the guard **unconditionally** short-circuits — it does not check whether an `Authorization` header is even present, and does not attempt to verify any token that was sent. It overwrites `request.user` with a hardcoded synthetic object:
   ```ts
   request.user = {
     userId: 1,               // <-- a JS number literal, not a UUID string
     email: 'dev@sentinelsafety.local',
     planCode: tier,          // 'free' unless DEV_FORCE_PRO/DEV_FORCE_EXPERT is set
     ...
   };
   ```
   `getDevBypassTier()` (lines 11-16) returns `'free'` unless `DEV_FORCE_PRO=true` or `DEV_FORCE_EXPERT=true` is exported — neither is set in the repo's active `backend/.env`.
3. **Entitlement guard/context**: the classify route is decorated `@RequireEntitlement('fullSafeScope')` (`safescope-v2.controller.ts:237`). `free` tier's `fullSafeScope` entitlement is `false` (`backend/src/billing/plan-entitlements.ts:54-55`), so `EntitlementGuard.canActivate` (`entitlement.guard.ts:24-43`) falls through to `EntitlementService.hasFeature(user, 'fullSafeScope')`.
4. **The crash**: `entitlement.service.ts:14-31` (pre-fix) did `const userId = String(user?.userId || '')` → `"1"`, then queried `this.grants.findOne({ where: { userId: "1", ... } })`. `EntitlementGrant.userId` is a `uuid`-typed Postgres column. Postgres rejects `"1"` as a UUID literal and throws `QueryFailedError: invalid input syntax for type uuid: "1"`. Nothing in the guard/service catches this, and no global exception filter is registered in `main.ts` (the repo's `AllExceptionsFilter` in `backend/src/common/filters/http-exception.filter.ts` is defined but never wired via `app.useGlobalFilters()` or `APP_FILTER` — confirmed by repo-wide grep). Nest's own built-in fallback handler catches the otherwise-uncaught error at the framework boundary and emits the generic `{"statusCode":500,"message":"Internal server error"}` body — which is what reaches the client.
5. **First invalid assumption**: `JwtGuard`'s bypass path assumes any consumer of `request.user.userId` either doesn't touch the database with it, or that a JS number silently stringified to `"1"` is an acceptable identifier everywhere downstream. `EntitlementGuard.canActivate` itself (two lines below the crash site, at `entitlement.guard.ts:45-46`) already defends against exactly this — it validates `user.userId` against a UUID regex before using it in a security-audit-log write — but `EntitlementService.hasFeature`, called one line earlier in the same method, has no equivalent guard. The inconsistency between these two adjacent call sites is the proximate defect.

Interesting/notable: `safescope-v2.controller.ts`'s own `getLocalDevBypassUserId()` (lines 155-164) *also* anticipates bypass mode and substitutes a stable non-numeric placeholder (`'local-dev-bypass-user'`) for governance-context purposes — but that code path never executes for this bug, because `EntitlementGuard` runs and throws before the controller method body is ever reached.

## Classification

Not: no user, missing workspace/site ownership, missing persistence FK, or route-specific guard mismatch. It is exactly: **synthetic bypass user with a field (`userId: 1`) of the wrong type for a downstream UUID-typed database query, hit on a call path that lacks the defensive type check its sibling call path already has.**
