# InSite v1.0 — customer governed-mode production cutover: BLOCKED BEFORE MUTATION

**Date:** 2026-08-29 · **Repository HEAD:** `45251d38a4e800bbff461708aa4c77061feade56`, branch
`main`, `origin/main` at the same SHA, ahead/behind `0/0` — unchanged by this operation.

```
TERMINAL = HAZLENZ_CUSTOMER_GOVERNED_CUTOVER_BLOCKED
           -- RENDER_ENV_MUTATION_TOOLING_AND_ACCEPTANCE_CREDENTIAL_REQUIRED
```

**No Render environment variable was changed. No production mutation of any kind occurred.** The
operation stopped at the Phase 5 boundary, as Phase 5's own precondition requires (it may run "ONLY
after Phases 1-4 pass", and Phase 4 cannot be executed here).

**This is a Phase 5 EXECUTION blocker, not the Phase 3 identity blocker.** A suitable bounded
acceptance identity **was** established from existing verification evidence without production
mutation (§4), so `ACCEPTANCE_IDENTITY_REQUIRED` would misreport the state. The three other defined
terminals do not fit either, and §9 says why for each.

---

## 1. What was completed, and what was not

| phase | outcome |
|---|---|
| 0 — preservation | **DONE** — inventory unchanged (§10) |
| 1 — prove current legacy customer state | **DONE, MEASURED** — 252 executed assertions (§3) |
| 2 — derive the smallest safe cutover from source | **DONE** — all 10 required items (§5) |
| 3 — choose a bounded acceptance subject | **DONE** — identity established (§4) |
| 4 — pre-cutover acceptance baseline | **BLOCKED** — needs an authenticated production session (§8) |
| 5 — Render configuration mutation | **NOT ATTEMPTED** — no tooling exists (§8), and Phase 4 did not pass |
| 6 — boot / runtime acceptance | not reached |
| 7 — customer governed-mode acceptance | not reached |
| 8 — negative / isolation acceptance | not reached |
| 9 — rollback proof | **DONE, MEASURED**, incl. a material finding (§6) |
| 10 — regression | **PARTIAL** — 836 governance/cutover assertions executed (§7) |
| 11 — evidence + master state | **DONE** (§11) |
| 12 — git / deployment boundary | **HELD** — no commit, no push, no deploy |

## 2. Pre-cutover configuration state — now positively established

The product owner manually inspected the Render Environment page for `safety-insite-backend` and
confirmed that **none** of the ten `GOVERNED_CUTOVER_*` variables exist. This closes the
`VALUE_UNVERIFIED` gap recorded on 2026-08-29 in
`../insite-v1-production-governed-cutover-2026-08-28/FINAL_STATUS.md` §5.

```
GOVERNED_CUTOVER_MODE                  ABSENT
GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST     ABSENT
GOVERNED_CUTOVER_ORG_ALLOWLIST         ABSENT
GOVERNED_CUTOVER_PRODUCTION_ACK        ABSENT
GOVERNED_CUTOVER_PRODUCTION_SHADOW_ACK ABSENT
GOVERNED_CUTOVER_SHADOW_STAGE          ABSENT
GOVERNED_CUTOVER_KILL_SWITCH           ABSENT
GOVERNED_CUTOVER_SHADOW_COHORT_BPS     ABSENT
GOVERNED_CUTOVER_SHADOW_COHORT_SALT    ABSENT
GOVERNED_CUTOVER_OBSERVABILITY         ABSENT
```

```
CUSTOMER_GOVERNED_MODE_ENABLED  = FALSE
CUSTOMER_GOVERNED_MODE_VERIFIED = TRUE   (was FALSE; closed by the owner's dashboard observation)
```

## 3. Phase 1 — the legacy customer state, MEASURED

The absence of every variable resolves ordinary production requests to the legacy path. This was
not merely read from source; it was executed. A probe over the real exported functions, run with
the production account id and a control id:

```
                                mode      effective   reason           influencesOutput
acceptance identity, no vars    LEGACY    LEGACY      MODE_IS_LEGACY   false
any other customer, no vars     LEGACY    LEGACY      MODE_IS_LEGACY   false
```

Each required sub-claim, with where it is enforced:

| claim | mechanism |
|---|---|
| no account allowlist configured | `GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST` absent -> `parseAllowlist('')` -> empty `Set` |
| no organization allowlist configured | `GOVERNED_CUTOVER_ORG_ALLOWLIST` absent -> empty `Set` |
| governed eligibility is false | `resolveCutoverMode({})` -> `LEGACY` / `DEFAULT_NO_CONFIGURATION`; `resolveCutoverEnablement()` returns `MODE_IS_LEGACY` **before** the allowlists are even read |
| the active release is NOT bound merely because its pointer exists | `resolveInspectionReleaseBinding()` returns `GOVERNED_MODE_INACTIVE` **before touching the database** when `!modeInfluencesCustomerOutput(mode)`; `readActiveRelease()` is unreachable |
| ordinary `inspection.knowledgeReleaseId` stays NULL | `resolveKnowledgeReleaseId()` takes the non-influencing branch -> `resolveKnowledgeReleaseProvenance()` with no argument -> `knowledgeReleaseId: null` |
| governed retrieval does not silently replace legacy | `orchestrateShadowRequest()` short-circuits on `effectiveMode === 'LEGACY'` and runs the pipeline with a `null` context — **no code in `standards/cutover/` executes at all** |

**Executed proof — 252 assertions, 0 failures, nothing weakened:**

| suite | result |
|---|---|
| `npm run test:kg4a-default-off` | **51 passed, 0 failed** |
| `npm run test:kg4d-default-off` | **121 passed, 0 failed** |
| `npm run test:kg4c-disabled-deployment` | **80 passed, 0 failed** |

`kg4a-default-off` is deliberately non-vacuous: its Part 4 proves the seam **does** return verified
governed content for `1910.212(a)(1)` when explicitly configured — *"the SAME user, the SAME
database, the SAME approved citation — with default config there is no context at all."* The
silence in Part 3 is a real default-off, not an empty corpus.

## 4. Phase 3 — the bounded acceptance identity

Established from existing verification evidence, with **no production mutation and no database
connection**.

```
userId : e9a25131-dfa4-40ce-90ff-8ab3d884d8ef
source : docs/INSITE_CURRENT_STATE.json -> stage1PreflightVerdict (recorded 2026-08-21)
```

| property | recorded value |
|---|---|
| basis | the operator's own production account; email matches the repository owner |
| ordinary customer? | **no** — `stage1AccountIsOrdinaryCustomer: false` |
| role | `Auditor` |
| `planCode` | `company` |
| `subscriptionStatus` | `active` |
| organization | the **only** live user in its organization |
| allowlist identifier type | `users.id` UUID, matched against `principal.userId` from the JWT, exact string membership in a comma-separated list |

**Entitlement re-proved from source rather than inherited.** `normalizeBillingTier()`
(`billing/plan-entitlements.ts:146`) maps the retired code `company` to `pro`, and
`proEntitlements.fullSafeScope = true`. `POST /safescope-v2/classify` carries
`@RequireEntitlement('fullSafeScope')`, so this identity can reach the only endpoint that exercises
customer governed mode.

**Why the other recorded identity is unusable.** The v1 live-acceptance account
`d07f56aa-8145-414c-b63d-1c17e0296831` is Free with `subscriptionStatus: none`, and
`freeEntitlements.fullSafeScope = false` — classify returns 402, exactly as that phase measured.
Making it usable would require granting Pro or completing a payment; both are prohibited, and Phase
7 forbids payment outright. It is recorded here as rejected, not silently skipped.

**Every governed entry point is the same one.** `orchestrateShadowRequest`,
`GovernedCutoverContext.create` and `resolveInspectionReleaseBinding` are reachable from exactly one
controller — `safescope-v2.controller.ts` `classify` — plus the persistence hook
`inspection.service.ts:537`. There is no lower-entitlement route that could stand in.

## 5. Phase 2 — the cutover contract, derived from source

Read from `standards/cutover/cutover-mode.ts` and `production-shadow-authorization.ts`. No value is
invented.

**1. Legal `GOVERNED_CUTOVER_MODE` values** — the frozen closed set `GOVERNED_CUTOVER_MODES`:
`LEGACY`, `SHADOW`, `GOVERNED_WITH_FALLBACK`, `GOVERNED_STRICT`. Matched after `trim()` +
`toUpperCase()`. Anything else -> `LEGACY` with `INVALID_MODE_VALUE`. `Boolean(env.X)` is never
used, so `"true"`, `"1"`, `"yes"`, `"off"` are all invalid rather than enabling.

**The correct choice is `GOVERNED_WITH_FALLBACK`.** `GOVERNED_STRICT` is documented in source as
*"DELIBERATELY NOT A CANDIDATE FOR THE CUSTOMER DEFAULT"* — it would strip HazLenz-authored text
from every citation the release cannot back. `SHADOW` does not make governed standards
authoritative at all.

**2. Allowlist semantics** — comma-separated, `trim()`ed, empties filtered, exact string membership.
`GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST` matches `principal.userId`; `GOVERNED_CUTOVER_ORG_ALLOWLIST`
matches `principal.organizationId`. The principal is derived from the authenticated JWT only —
**there is deliberately no request-scoped override of any kind**, so a customer can enable governed
retrieval neither for themselves nor for anyone else.

**3. Is an allowlist mandatory?** **Yes.** `if (accounts.size === 0 && organizations.size === 0)
return off('NO_ALLOWLIST_CONFIGURED')`. A governed mode with no allowlist enables nobody — setting
the mode alone is inert. **This is what makes a bounded rollout the architecture's native shape:
there is no "all customers" switch short of naming them.**

**4. `GOVERNED_CUTOVER_PRODUCTION_ACK`** — required, exact value
`I_ACKNOWLEDGE_GOVERNED_CUTOVER`. Compared after `trim()` only; **case is significant**. In
production, any non-`LEGACY` mode without it sets `productionGuardTriggered` and
`assertCutoverConfigurationSafeForProduction()` **throws at boot**.

**5. Kill switch** — must **not** be set. `resolveKillSwitch()` is deliberately permissive: **any**
non-empty, non-whitespace value engages it. Leave `GOVERNED_CUTOVER_KILL_SWITCH` absent.

**6. Shadow variables** — **not needed**, and must stay absent. In `orchestrateShadowRequest()` the
governed-delivery branch (`effectiveMode !== 'SHADOW'`) returns **before**
`resolveProductionShadowAuthorization()` is consulted, so `SHADOW_STAGE`, `PRODUCTION_SHADOW_ACK`,
`SHADOW_COHORT_BPS` and `SHADOW_COHORT_SALT` have no effect on `GOVERNED_WITH_FALLBACK`. The stage
ceiling on named principals therefore does not apply either.

**7. Customers not in an allowlist** — `NOT_ALLOWLISTED` -> `effectiveMode: LEGACY`. Measured.

**8. Both allowlists absent** — `NO_ALLOWLIST_CONFIGURED` -> `effectiveMode: LEGACY`. Measured.

**9. Boot-time refusal conditions** — `validateProductionEnvironment()` (`main.ts:12`) calls
`assertCutoverConfigurationSafeForProduction()` first and unconditionally. It throws on (a) an
unrecognised `GOVERNED_CUTOVER_MODE`, and (b) any non-`LEGACY` mode in production without the exact
acknowledgement sentinel.

> **OPERATIONAL WARNING.** Because (b) throws rather than degrades, saving
> `GOVERNED_CUTOVER_MODE` **without** `GOVERNED_CUTOVER_PRODUCTION_ACK` in the same change would
> crash-loop production. All three variables must be saved together in one Render update.

**10. Rollback** — §6.

**Measured behaviour of the proposed configuration** (real exported functions, control ids):

```
                                          mode                     effective                reason
acceptance identity, allowlisted          GOVERNED_WITH_FALLBACK   GOVERNED_WITH_FALLBACK   ACCOUNT_ALLOWLISTED
NON-allowlisted customer                  GOVERNED_WITH_FALLBACK   LEGACY                   NOT_ALLOWLISTED
unauthenticated / no principal            GOVERNED_WITH_FALLBACK   LEGACY                   NO_PRINCIPAL
mode set but allowlist EMPTY              GOVERNED_WITH_FALLBACK   LEGACY                   NO_ALLOWLIST_CONFIGURED
mode set, ACK MISSING                     LEGACY                   LEGACY                   MODE_IS_LEGACY   (boot would throw)
```

**The exact change to make — three variables, together, and nothing else:**

```
GOVERNED_CUTOVER_MODE              = GOVERNED_WITH_FALLBACK
GOVERNED_CUTOVER_PRODUCTION_ACK    = I_ACKNOWLEDGE_GOVERNED_CUTOVER
GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST = e9a25131-dfa4-40ce-90ff-8ab3d884d8ef
```

Leave **absent**: `GOVERNED_CUTOVER_ORG_ALLOWLIST` (it would enable every member of the account's
organization), `GOVERNED_CUTOVER_KILL_SWITCH`, and all five shadow variables. Change **no** other
Render variable — not `DATABASE_URL`, Stripe, JWT, provider keys or any unrelated setting.

## 6. Phase 9 — the rollback contract, MEASURED, with a material finding

| # | action | measured effect on `effectiveMode` | complete rollback? |
|---|---|---|---|
| R1 | clear `GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST` | `LEGACY` / `NO_ALLOWLIST_CONFIGURED` | **YES** |
| R2 | set `GOVERNED_CUTOVER_MODE = LEGACY` | `LEGACY` / `MODE_IS_LEGACY` | **YES** |
| R3 | set `GOVERNED_CUTOVER_KILL_SWITCH` | **`GOVERNED_WITH_FALLBACK` / `ACCOUNT_ALLOWLISTED`** | **NO** |

> ### FINDING — the kill switch is a delivery brake, not a rollback
>
> Engaging `GOVERNED_CUTOVER_KILL_SWITCH` stops governed content reaching the customer: it is
> checked inside `orchestrateShadowRequest()`, which returns the pristine legacy payload with
> `skipReason: 'KILL_SWITCH_ENGAGED'`. But it does **not** change enablement, and it is **not read
> at all** by the two call sites that decide durable state. Verified by grep: there is no
> kill-switch reference in `inspection-release-binding.ts`, `inspection.service.ts`,
> `cutover-mode.ts` or `safescope-v2.controller.ts`.
>
> Both `resolveInspectionReleaseBinding()` (controller line 328) and `resolveKnowledgeReleaseId()`
> (`inspection.service.ts:537`) read `resolveCutoverEnablement(...).effectiveMode`, which with the
> kill switch engaged still reports `GOVERNED_WITH_FALLBACK`. So an allowlisted principal's new
> inspection would **still be bound** to the active release and
> `inspection.knowledgeReleaseId` would **still be written** — and that binding is *write-once*, so
> it persists after the incident.
>
> **Therefore R1 or R2 is the rollback. R3 is an incident brake to be used alongside one of them,
> never instead of one.** R1 is the most surgical: it carries no boot risk, whereas any edit to
> `GOVERNED_CUTOVER_MODE` re-enters the boot guard.
>
> Recorded as a finding, not repaired. No production code was changed by this operation.

## 7. Phase 10 — regression actually executed

Run locally with `DATABASE_URL` unset. **Nothing was weakened; no expected output was updated.**

| suite | result | recorded baseline |
|---|---|---|
| `test:kg4a-default-off` | **51 / 0** | 51 / 0 |
| `test:kg4a-cutover-contract` | **146 / 0** | — |
| `test:kg4c-disabled-deployment` | **80 / 0** | 80 / 0 |
| `test:kg4c-production-shadow-contract` | **438 / 0** | 438 / 0 |
| `test:kg4d-default-off` | **121 / 0** | 121 / 0 |
| **total** | **836 passed, 0 failed** | |

**Stated plainly as a limit:** the protected HazLenz floor (recognition 43/43, actionable 43/43,
life-critical 35/35, Population-A precision 100 %, forbidden emissions 0) and the customer-workflow
suites (user-authored findings, offline `clientRequestId`, report replacement, broad workflow) were
**NOT re-run**. This operation changed no production code, no scorer and no test, and performed no
cutover, so there is nothing for them to regress against. They remain a requirement of the
*executed* cutover, not of this blocked preparation. The four known-failing suites and the
unresolved-jurisdiction ranking defect remain OPEN and were not touched.

## 8. The two blockers, stated exactly

### B1 — Render environment variables cannot be mutated with the available tooling

Phase 5 authorizes the change; no mechanism exists here to apply it. Render CLI **v2.20.0**:

* `render --help` — no `env` subcommand.
* `render services update --help` — 24 flags (`--auto-deploy`, `--branch`, `--build-command`,
  `--start-command`, `--plan`, `--num-instances`, …) and **not one environment-variable flag**.
* `render ea` — only `kv`, `objects`, `pg`.

There is no `render.yaml` blueprint in the repository to edit, and editing one would be a source
change requiring a deploy — which Phase 12 forbids. Upgrading the CLI, or extracting the CLI's
stored session credential to call the Render REST API, were both deliberately **not** attempted:
each exceeds the authorized scope, and the second breaks the credential boundary this programme has
held throughout.

**The environment change must be made by the product owner in the Render dashboard.**

### B2 — Phases 4, 7 and 8 require an authenticated production session

Every governed entry point is behind `JwtGuard`. Proving the pre-cutover baseline (Phase 4), the
governed acceptance (Phase 7) and the non-allowlisted isolation control (Phase 8) all require
issuing authenticated requests as `e9a25131-…` — and, for Phase 8, as a second identity. No
credential for either is recorded in the repository, and requesting account credentials is outside
this operation's authorization.

Note that B2 is not merely a missing secret: the acceptance is a live production write (a new
inspection, bound to the active release). It belongs with the operator, in the same way the
production `DATABASE_URL` operations did.

## 9. Why none of the three pre-defined terminals was used

* `HAZLENZ_PRODUCTION_GOVERNED_MODE_BOUNDED_ACCEPTANCE_COMPLETE` — the acceptance did not run.
* `HAZLENZ_CUSTOMER_GOVERNED_CUTOVER_BLOCKED — UNIVERSAL_ROLLOUT_AUTHORIZATION_REQUIRED` — **does
  not apply, and reporting it would be wrong.** The architecture's smallest supported mode *is*
  bounded: an allowlist is mandatory, so there is no universal rollout to be forced into. Nothing
  here needs universal-rollout authorization.
* `HAZLENZ_CUSTOMER_GOVERNED_CUTOVER_ROLLED_BACK — REMEDIATION_REQUIRED` — nothing was changed, so
  nothing was rolled back.
* Phase 3's `ACCEPTANCE_IDENTITY_REQUIRED` — the identity **was** established (§4). Using this label
  would misdescribe the blocker and send the owner to solve the wrong problem.

## 10. Worktree state

Unchanged from the start of this operation: HEAD and `origin/main` both
`45251d38a4e800bbff461708aa4c77061feade56`, ahead/behind `0/0`, 0 staged, 9 modified, 1 deleted,
2,156 untracked entries (this evidence directory is one of them), 4 stashes, 24 tags. Nothing was
reset, restored, cleaned, stashed or rebased.

`frontend-next/tsconfig.json` remains byte-identical at
`73990cd12c472ec2f0793da8d0d7fc359ec15b020d3833b748acbebb7b858535` — the known contamination,
untouched. A temporary probe script was written into `backend/scripts/`, executed, and deleted; its
absence was verified.

## 11. What this operation changed, and did not

| path | change |
|---|---|
| `verification/insite-v1-customer-governed-mode-cutover-2026-08-29/STATUS.md` | **new** — this file |
| `docs/INSITE_ENGINEERING_BLUEPRINT.md` | appended §91 |
| `docs/INSITE_CURRENT_STATE.json` | current-state fields only; historical entries untouched |

```
COMMIT / PUSH / TAG / DEPLOY                    = NONE
RENDER MUTATION / ENV VAR CHANGE                = NONE
PRODUCTION DATABASE CONNECTION / MUTATION       = NONE
DATABASE_URL REQUESTED OR USED                  = NO
PROVIDER / LLM CALLS                            = 0
PAYMENT                                         = NONE
PRODUCTION RUNTIME CODE / SCORER / TEST CHANGED = NONE
```

## 12. State flags

```
PRODUCTION_GOVERNED_RELEASE_ACTIVE        = TRUE   (federal-core-2026-08-28.1)
CUSTOMER_GOVERNED_MODE_ENABLED            = FALSE
CUSTOMER_GOVERNED_MODE_VERIFIED           = TRUE   (all ten variables confirmed ABSENT)
BOUNDED_ACCEPTANCE_IDENTITY_ESTABLISHED   = TRUE   (e9a25131-...)
BOUNDED_CUSTOMER_GOVERNED_MODE_ENABLED    = FALSE
UNIVERSAL_CUSTOMER_GOVERNED_MODE_ENABLED  = FALSE
POST_CUTOVER_CUSTOMER_ACCEPTANCE          = FALSE
```

Nothing in this document describes or authorizes a universal rollout.

## 13. Next authorization required

1. The product owner sets the **three** variables in §5 together, in the Render dashboard, on
   `safety-insite-backend` (`srv-d7kl74jeo5us73deaor0`), changing nothing else. Render restarts the
   service from the **same** commit, so `gitCommit` must remain `45251d38…` — an environment change
   is not a source deployment.
2. The owner confirms `/health` = ok / `database` = up / `/health/ready` = 200 and that the boot
   guard did not throw.
3. Acceptance (Phases 6-8) is then run as the acceptance identity, with a second non-allowlisted
   identity as the isolation control, and the transcripts reconciled here.

Standing property, unchanged: `autoDeploy=yes` with `autoDeployTrigger=commit` on `main` means
**pushing to `origin/main` is itself a production deployment**. The environment change must not be
combined with a source deployment.
