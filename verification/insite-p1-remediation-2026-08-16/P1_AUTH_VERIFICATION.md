# P1-01 — Dev Auth Bypass — Fix and Verification

## Contract chosen (Phase 3)

The bypass mode's own design (`backend/.env.example`: `DEV_AUTH_BYPASS`, `DEV_FORCE_PRO`, `DEV_FORCE_EXPERT`, all independently togglable) already encodes the intended contract: plain `DEV_AUTH_BYPASS=true` should behave as an unauthenticated-but-context-present **free-tier** synthetic user (so free-tier gating can be exercised locally), and `DEV_FORCE_PRO`/`DEV_FORCE_EXPERT` are explicit opt-in escalations for testing paid features. That contract was never actually broken — the bug is that the free-tier path, when it correctly falls through to a "not entitled" check, crashes instead of returning a clean denial. The fix restores that existing, already-correct contract rather than inventing a new one: **explicit bypass of only auth, while retaining accurate app/entitlement context** — free tier is still free tier, it just now fails safely instead of crashing.

## Production change

`backend/src/auth/entitlements/entitlement.service.ts:20` — one line:

```diff
- if (!userId) return false;
+ if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) return false;
```

This mirrors the UUID-format check already present two lines below in the same request lifecycle (`entitlement.guard.ts:45`, guarding the `actorUserId` written to the security-audit log) — the fix makes the DB-query call site defensive the same way its sibling call site already is, rather than introducing a new pattern. No tier/authorization/entitlement *logic* changed: a real user with a real UUID id and a real grant is queried exactly as before (confirmed below); only a non-UUID-shaped id (which previously could only ever reach the database and crash it) is now short-circuited to "not entitled," a legitimate and correct answer for an id that cannot correspond to any real grant row.

## Verification (live, port 4000/4001, disposable DB `test_p1_20260816`)

| Scenario | Pre-fix | Post-fix |
|---|---|---|
| `DEV_AUTH_BYPASS=true`, no force flags, `POST /safescope-v2/classify` | `HTTP 500` `{"statusCode":500,"message":"Internal server error"}` | `HTTP 402` `{"message":"A paid subscription is required for this feature.","code":"PAID_SUBSCRIPTION_REQUIRED","entitlement":"fullSafeScope"}` |
| `DEV_AUTH_BYPASS=true` + `DEV_FORCE_PRO=true`, same request | (not tested pre-fix; same crash would occur since it hits the identical code path only when the free-tier fallback is reached, which it isn't here — see note) | `HTTP 201` — full classify succeeds end-to-end |
| Real login (`DEV_AUTH_BYPASS=false`), real user with a granted `expert` entitlement, `POST /safescope-v2/classify` | `HTTP 201` (unaffected by this bug; real UUIDs always worked) | `HTTP 201` — unchanged |
| No `Authorization` header at all, `DEV_AUTH_BYPASS=false` | `HTTP 401` | `HTTP 401` — unchanged |
| Full 228-case authoritative V4 matrix, real login | N/A (matrix always used `DEV_AUTH_BYPASS=false` per P0's own workaround) | **228/228** — see `P1_POST_P0_228_BASELINE.md` |

Note: with `DEV_FORCE_PRO=true`, `hasEntitlement('pro', 'fullSafeScope')` returns `true` at `entitlement.service.ts:19`, before the userId/grants query is ever reached — so this configuration was never exposed to the crash either before or after the fix; it is included here to confirm the intended "escalate to test paid features" dev workflow produces a fully working HazLenz review, not just a non-crashing one.

## Results required by the task

- Documented/default local configuration (`DEV_AUTH_BYPASS=true` as actually set in `backend/.env`) works: **confirmed** — no crash, clean bounded 402 for the (by-design) unentitled free tier, full success (201) once a developer opts into `DEV_FORCE_PRO`/`DEV_FORCE_EXPERT`.
- HazLenz review does not raw-500: **confirmed**, all scenarios above.
- Production auth/authorization remains unchanged: **confirmed** — real-user login/entitlement path (UUID ids) is byte-for-byte the same code path with the same outcome; the only behavior change is for non-UUID ids, which previously could only crash.
- Cross-user authorization tests remain green: re-verified in `P1_REGRESSION.md` alongside the other P0/P1 regression scenarios.
