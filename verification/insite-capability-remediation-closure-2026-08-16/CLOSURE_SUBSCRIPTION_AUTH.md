# CLOSURE — Subscription Entitlement + AUTH-P1 Regression (Live Re-Run)

Date: 2026-08-16. Branch `main`, HEAD `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`.

## Infrastructure

Three backend instances against the same disposable DB (`test_hazlenz_closure_20260816`),
`DATABASE_URL` explicitly exported for every process:

| Port | Config | Purpose |
|---|---|---|
| 4320 | `DEV_AUTH_BYPASS=true` | bypass-ON matrix rows, Free/Paid entitlement checks |
| 4321 | `DEV_AUTH_BYPASS=false` | bypass-OFF matrix rows, true-anonymous checks |
| 4322 | `DEV_AUTH_BYPASS=true`, `DEV_FORCE_PRO=true` | Force-Pro isolation checks |

Real users registered via `/auth/register` (no fabricated rows): User A
(`authp1-closure-a@example.test`, free tier), User B (`authp1-closure-b@example.test`, free
tier), and a Paid/Expert user (`matrix-closure-20260816@example.test`, granted `fullSafeScope`
via the disposable-DB-gated `scripts/grant-test-entitlement.ts`, which independently confirmed
`NODE_ENV=test` + an allowlisted disposable DB name before writing).

## AUTH-P1 matrix result: **PASS** (all scenarios)

| Bypass | Token | Force Pro | Route | Result | Match to `AUTH_MATRIX.md` baseline |
|---|---|---|---|---|---|
| OFF | none | OFF | GET /sites | `401 No token provided` | Same |
| OFF | valid A | OFF | GET /sites | `200`, only A's site, correct `ownerUserId` | Same |
| OFF | invalid | OFF | GET /sites | `401 Invalid token` | Same |
| ON | none | OFF | GET /sites | `200`, synthetic dev identity, empty list, no 500 | Same |
| ON | valid A | OFF | GET /sites | `200`, only A's site, identity preserved | Same |
| ON | valid B | OFF | GET /sites | `200`, only B's site, identity preserved | Same |
| ON | invalid | OFF | GET /sites | `401 Invalid token` — no silent fallback to bypass identity | Same |
| ON | valid A | OFF | GET /billing/status | `200`, `tier: free`, real plan | Same |
| ON | none | OFF | GET /billing/status | `200`, no 500 | Same |
| ON | valid A | OFF | POST /safescope-v2/classify | `402 PAID_SUBSCRIPTION_REQUIRED` — clean deny, not 500 | Same |
| ON+FORCE_PRO | none | ON | GET /billing/status | `200`, `tier: pro`, `hasProAccess: true` (synthetic identity escalated) | Same |
| ON+FORCE_PRO | valid A | ON | GET /billing/status | `200`, `tier: free`, `hasProAccess: false` — **A's real entitlement NOT escalated by Force-Pro** | Same |
| ON+FORCE_PRO | valid A | ON | GET /sites | `200`, only A's real site — identity integrity intact under Force-Pro | Same |

No identity collapse (A and B always see only their own data). No raw 500 anywhere in the
matrix. Invalid tokens are always rejected, never silently swapped for a synthetic or wrong-user
identity, in both bypass states — confirming the `JwtGuard` precedence fix from the AUTH-P1
remediation phase holds on current HEAD.

## Subscription entitlement matrix result: **PASS**

| Tier | Action | Result |
|---|---|---|
| Anonymous | POST /actions (corrective action) | `401 No token provided` |
| Anonymous | (any protected inspection data route) | `401`, consistent with the matrix above |
| Free (user A) | GET /sites (allowed Free functionality) | `200`, own data only |
| Free (user A) | POST /safescope-v2/classify (paid workflow) | `402 PAID_SUBSCRIPTION_REQUIRED`, `entitlement: fullSafeScope` |
| Free (user A) | POST /actions (corrective-action creation) | `402 PAID_SUBSCRIPTION_REQUIRED`, `entitlement: correctiveActionAssignments` — **the exact fix verified in the prior remediation phase, confirmed still in effect** |
| Paid/Expert | GET /billing/status | `tier: expert`, `fullSafeScope: true`, `correctiveActionAssignments: true`, `professionalReports: true` |
| Paid/Expert | POST /actions (corrective-action creation) | `201`, persisted (`id: 6ccbe9f1-...`, `statusCode: open`) |

`DEV_FORCE_PRO` verified structurally separate from real identity: it only ever changes the
synthetic bypass user's billing fields, never `request.user.userId` or a real user's stored
entitlement — confirmed live via the Force-Pro instance above, matching `AUTH_CONTRACT.md`'s
documented contract.

## Regression classification

No failures. Every scenario matches the documented baseline behavior from the original AUTH-P1
and capability-remediation phases. The corrective-action entitlement fix (Free → 402, Paid → 201)
that was the headline P1 fix of the prior phase is independently re-confirmed live here, not
inferred from git diff.
