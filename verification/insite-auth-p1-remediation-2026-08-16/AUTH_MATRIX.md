# AUTH-P1 — Auth Matrix (live, disposable DB `test_authp1_20260816`, fixed backend)

Backend run locally against a disposable Postgres database (`test_authp1_20260816`, created and migrated fresh for this phase; the original `safescope` dev database was never targeted — verified via explicit `DATABASE_URL` override and resolved-target print before every migration/mutating command). Real users A/B registered and logged in through the real `/auth/register` + `/auth/login` endpoints; no user rows or tokens were fabricated.

| Bypass | Token | Force Pro | Route | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| OFF | none | OFF | GET /sites | 401 unauthenticated | `401 {"message":"No token provided"}` | PASS |
| OFF | none | OFF | GET /inspections | 401 unauthenticated | `401 {"message":"No token provided"}` | PASS |
| OFF | none | OFF | GET /billing/status | 401 unauthenticated | `401 {"message":"No token provided"}` | PASS |
| OFF | valid A | OFF | GET /sites | user A's data | `200`, `ownerUserId` = A's real UUID, only A's site | PASS |
| OFF | invalid/garbage | OFF | GET /sites | rejected | `401 {"message":"Invalid token"}` | PASS |
| ON | none | OFF | GET /sites | supported dev identity, no 500 | `200 {"data":[],...}` | PASS |
| ON | none | OFF | GET /inspections | supported dev identity, no 500 | `200` | PASS |
| ON | none | OFF | GET /billing/status | supported dev identity, no 500 | `200`, free tier | PASS |
| ON | valid A | OFF | GET /sites | user A's data, identity preserved | `200`, only A's site, `ownerUserId` = A's real UUID | PASS |
| ON | valid B | OFF | GET /sites | user B's data, identity preserved | `200`, only B's site, `ownerUserId` = B's real UUID | PASS |
| ON | valid A | OFF | GET /billing/status | A's real (free) plan | `200 {"tier":"free",...}` — matches A's actual registered plan | PASS |
| ON | none | ON (Force Pro) | GET /billing/status | dev identity + Pro entitlement | `200 {"tier":"pro","hasProAccess":true,...}` | PASS |
| ON | valid A | ON (Force Pro) | GET /billing/status | A's real identity, **not** escalated | `200 {"tier":"free","hasProAccess":false,...}` — Force-Pro did not leak into a real user's entitlement | PASS |
| ON | valid A | ON (Force Pro) | GET /sites | A's real data, identity integrity preserved under Force-Pro | `200`, only A's site | PASS |
| ON | valid A | OFF | POST /safescope-v2/classify | real free-tier user, clean deny (not 500) | `402 {"code":"PAID_SUBSCRIPTION_REQUIRED"}` | PASS |
| ON | valid A/B | OFF | GET /actions (corrective actions) | no 500 | `200 {"data":[],...}` for none/A/B | PASS |
| ON | invalid/garbage | OFF | GET /sites | rejected, NOT silently swapped for synthetic identity | `401 {"message":"Invalid token"}` | PASS |

## Pre-fix vs post-fix (mode: bypass ON, valid token A)

Live logic-level reproduction using the actual pre-fix `JwtGuard.canActivate` body (verbatim from `git show HEAD`) fed a real JWT freshly issued by the running backend's `/auth/login` for user A:

```
Real authenticated identity from valid token: {"userId":"146e60b3-1fd4-4861-8d72-456d67804a91","email":"authp1-usera@example.com"}
request.user after PRE-FIX JwtGuard.canActivate (bypass ON, valid token supplied): {"userId":1,"email":"dev@sentinelsafety.local"}
DEFECT CONFIRMED: valid authenticated identity silently discarded and replaced with synthetic bypass identity.
```

Post-fix, the same request against the live running server returns user A's own site list with `ownerUserId` equal to A's real UUID (see matrix row "ON / valid A / OFF / GET /sites" above) — the defect is closed.

## Malformed token

Bypass OFF and ON both reject a garbage/invalid token with a clean `401 {"message":"Invalid token"}` — never silently accepted as a different real user, and never falls through to the synthetic bypass identity when bypass is enabled (the guard treats "a credential was presented" as a hard commitment to validate it, independent of bypass state).
