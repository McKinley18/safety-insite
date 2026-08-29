# InSite v1.0 — production governed knowledge release cutover: FINAL STATUS

**Date:** 2026-08-29 · **Repository HEAD:** `45251d38a4e800bbff461708aa4c77061feade56`, branch
`main`, upstream `origin/main` at the same SHA — unchanged by this operation.

This document closes the operation that `STATUS.md` left open. `STATUS.md` recorded the runbook as
built and rehearsed but **blocked at Phase 2** on the production credential. The product owner then
executed the runbook themselves against production, and the transcripts in `transcripts/` are that
run. This file reconciles them and records the one thing that remains unverifiable with the
currently available tooling.

**This operation is READ-ONLY.** It connected to no database, requested no credential, issued no
Render command, called no provider, and committed, pushed, tagged and deployed nothing. It reads
transcripts, reads source, reads the public health endpoints, and writes documentation.

```
TERMINAL = HAZLENZ_PRODUCTION_GOVERNANCE_RELEASE_ACTIVE
           -- RENDER_GOVERNED_CONFIGURATION_MANUAL_VERIFICATION_REQUIRED
```

---

## 1. The ten recorded facts

| # | fact | state | evidence |
|---|---|---|---|
| 1 | **Schema compatibility restoration completed** | `TRUE` | `../insite-v1-production-schema-remediation-2026-08-28/STATUS.md`; re-proved at the head of every transcript below |
| 2 | **Governed release materialized** | `TRUE` | `transcripts/02-materialize.txt` |
| 3 | **64 approvals replayed successfully** | `TRUE` | `transcripts/03-replay-approvals.txt` |
| 4 | **Activation validation passed** | `TRUE` | `transcripts/04-validate.txt` |
| 5 | **Release activated** | `TRUE` | `transcripts/05-activate.txt` |
| 6 | **Post-activation governance proof passed** | `TRUE` | `transcripts/06-post-proof.txt` |
| 7 | **Final runtime proof passed** | `TRUE` | §4 below — executed separately, after the transcript |
| 8 | **Production credential removed from operator shell** | `DATABASE_URL unset: YES` | product-owner attestation; not re-requested |
| 9 | **Render governed-mode configuration verification** | **`NOT_VERIFIABLE_READ_ONLY`** | §5 |
| 10 | **Customer-visible governed-mode cutover** | **`NOT AUTHORIZED`** | §6, §7 |

## 2. Target proof — every step re-proved production before acting

All seven executed steps begin with the same read-only resolution through
`backend/src/database/data-source.ts`, inside `BEGIN READ ONLY`:

```
database            = neondb
latestMigration     = InspectionKnowledgeReleaseBinding1800000018000
ledgerRows          = 50   (OBSERVED, not asserted)
migrations > 1800000015000 = UserAuthoredFindingProvenance1800000016000,
                             InspectionDisplayNumber1800000017000,
                             InspectionKnowledgeReleaseBinding1800000018000
schemaColumns       = inspection.displayNumber, inspection.knowledgeReleaseId,
                      inspection_findings.source
```

The `test_*` disposable-database guard and the `safescope` refusal path were rehearsed before the
run (`TARGET_GUARD_REHEARSAL.txt`) and were not weakened for it.

## 3. The production cutover, as measured

**Pre-state (`01-pre-snapshot.txt`), before any write:** 0 releases, 0 release records, 0 decision
rows, 0 knowledge-release events, active pointer `null`, 0 rejected records reachable, 12
inspections, 3 inspection findings, 2,390 `standards_master` rows. The immutable-identity conflict
check returned `release_present: false` — nothing was overwritten.

**Materialization (`02`)** — `outcome: prepared`, `status: provisional`, `recordCount: 64`,
manifest `680540d9…`, **`reproducedPinnedManifest: true`**, `legacyCorpusRowsRead: 0`,
`placeholderSourceRecords: 0`, `verifiedInOnePass: true`, `rejected_records_included: 0`,
`decision_rows_so_far: 0`. Review state after `prepare`: `mechanically_validated: 64`,
`reviewer_approved: 0` — the measured proof that materialization does **not** create approvals.

**Approval replay (`03`)** — the binding proof passed first: the 64 preserved decisions bind 1:1,
**by exact record checksum**, to the 64 records production materialized. Then 64 individual
approvals: **`approved=64 already_approved=0 failed=0`**. Post-replay effective state is
`reviewer_approved: 64` and nothing else; `decision_rows 64`, `distinct_checksums 64`,
`distinct_reviewers 1`, `non_approve_decisions 0`. Rejected-record integrity: **0 rows**.

**Validation (`04`, zero writes)** — `prepare --dry-run` → **`idempotent_no_op`**,
`reproducedPinnedManifest: true`; approval-state checksum
`3bbd2785e1ffb1319ac0d69d62c24f0e7a0a88b27b60b5f5350dfacd0d42975a` over 64 records;
`activate --dry-run` → **all 8 gates pass, `failedGates: []`, `wouldSucceed: true`,
`writesPerformed: 0`**, including `governedRecordsPresent: 64 of 64 snapshot records are
reviewer-approved`. SQL-recomputed snapshot integrity: `rejected_members 0`,
`distinct_citation_keys 64`.

**Activation (`05`)** — `outcome: activated`, `previousReleaseId: null`,
`activeReleaseAfter: federal-core-2026-08-28.1`, `activeManifestAfter: 680540d9…`, actor
`insite-product-owner-authorized-regulatory-content-review`.

**Post-activation proof (`06`)** —

| property | measured |
|---|---|
| release status | **`active`**, `activatedAt 2026-08-29T00:04:00.696Z`, `manifest_is_pinned: true` |
| active pointers | **exactly 1** |
| snapshot records | **64** |
| approved / not approved | **64 / 0** |
| records without a checksum-bound decision | **0** |
| reviewer identity recorded | `insite-product-owner-authorized-regulatory-content-review` |
| reviewer role recorded | `regulatory-content-reviewer (non-attorney, non-agency)` |
| the 8 rejected records, anywhere | **0 rows** |
| historical inspections | **12**, of which **0** bound to a release |
| inspection findings | **3** — present, unchanged |
| `standards_master` | **2,390** — present, unchanged |
| audit trail | **64 × `record_approval` + 1 × `activation`, all `succeeded`** |

The single pointer move is recorded in full, with all 8 gates and the reason string:
*"Control-plane activation only; customer governed mode and allowlist are NOT enabled by this
step."*

**No historical inspection was back-filled.** `inspections_bound_to_a_release` is 0 before and
after — consistent with migration `1800000018000` carrying no `UPDATE`, and with §6 below.

## 4. The runtime proof, and why `06` ends where it does

`transcripts/06-post-proof.txt` **ends at the line `=== RUNTIME (public, read-only) ===`** with no
output beneath it. That file is preserved byte-for-byte as historical evidence and has **not** been
edited to appear complete. The script's final section did not record a result: the public `/health`
request timed out transiently while `/health/ready` returned `200`.

The missing runtime proof was completed by a **separately executed** public request:

```json
{"status":"ok","database":"up","timestamp":"2026-08-29T00:36:44.979Z",
 "version":{"appName":"safety-insite-backend",
            "gitCommit":"45251d38a4e800bbff461708aa4c77061feade56",
            "buildTimestamp":"2026-06-19T20:42:00Z",
            "nodeEnv":"production","versionSourceStatus":"RENDER_GIT_COMMIT"}}
```
`/health/ready` → **200**.

**The earlier timeout is not a governance failure and must not be recorded as one.** A subsequent
request to the same endpoint returned the expected production identity and `database: up`; the
timeout is consistent with a free-instance cold start, and `/health/ready` returned 200 throughout.
Nothing about it touches release state, approvals or the active pointer.

Deployed SHA is `45251d38a4e800bbff461708aa4c77061feade56` — **unchanged**. No deploy occurred.

## 5. Render governed-mode configuration — NOT verifiable read-only

### 5.1 The exact variable names, read from source

Traced to `backend/src/standards/cutover/cutover-mode.ts` and
`backend/src/standards/cutover/production-shadow-authorization.ts`. **Not guessed.**

| variable | source | required pre-cutover value |
|---|---|---|
| `GOVERNED_CUTOVER_MODE` | `cutover-mode.ts:103` | **unset, empty, or `LEGACY`** |
| `GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST` | `cutover-mode.ts:104` | **unset or empty** |
| `GOVERNED_CUTOVER_ORG_ALLOWLIST` | `cutover-mode.ts:105` | **unset or empty** |
| `GOVERNED_CUTOVER_PRODUCTION_ACK` | `cutover-mode.ts:106` | **unset** (sentinel: `I_ACKNOWLEDGE_GOVERNED_CUTOVER`) |
| `GOVERNED_CUTOVER_PRODUCTION_SHADOW_ACK` | `production-shadow-authorization.ts:41` | unset |
| `GOVERNED_CUTOVER_SHADOW_STAGE` | `production-shadow-authorization.ts:42` | unset or `STAGE_0_DISABLED` |
| `GOVERNED_CUTOVER_KILL_SWITCH` | `production-shadow-authorization.ts:43` | unset (disabling only; never enables) |
| `GOVERNED_CUTOVER_SHADOW_COHORT_BPS` | `production-shadow-authorization.ts:44` | unset or `0` |
| `GOVERNED_CUTOVER_SHADOW_COHORT_SALT` | `production-shadow-authorization.ts:45` | unset |
| `GOVERNED_CUTOVER_OBSERVABILITY` | `cutover-observability.ts:207` et al. | unset (telemetry only) |

The first four are the ones that decide customer behaviour. The rest are shadow-only and are
structurally incapable of changing customer output (§6).

### 5.2 Why the values could not be read

Every read-only avenue available in this environment was tried and none exposes an environment
variable:

* **Render CLI v2.20.0** — `render --help` lists no `env` subcommand.
  `render services --output json` returns the service configuration and **no `envVars` field**. It
  confirmed, read-only: `id=srv-d7kl74jeo5us73deaor0`, `name=safety-insite-backend`,
  `autoDeploy=yes`, `autoDeployTrigger=commit`, `branch=main`, `rootDir=backend`,
  `startCommand=npm run start:render`, `url=https://safescope-backend.onrender.com`,
  `suspended=not_suspended`. `render ea` offers only `kv`, `objects` and `pg`.
* **No blueprint** — the repository contains no `render.yaml`, so there is no infrastructure-as-code
  declaration to read (and a declaration would not be proof of the effective dashboard value).
* **No application route** — no controller reads `GOVERNED_CUTOVER_MODE`; nothing under
  `standards/cutover/` is reachable from an HTTP handler that reports it.
* **No boot diagnostic** — `backend/scripts/render-start-diagnostic.js` prints `NODE_ENV`, `PORT`,
  masked `DATABASE_URL`/`JWT_SECRET`, `FRONTEND_URL`, `DEV_AUTH_BYPASS` and
  `NEXT_PUBLIC_DISABLE_AUTH`. It prints **no** `GOVERNED_CUTOVER_*` variable.

**No Render mutation command was issued, and no CLI credential was read from disk or used to call
the Render API.** Upgrading the CLI was deliberately not attempted: the authorization is bounded to
currently available tooling.

### 5.3 What a healthy boot does and does not prove

`validateProductionEnvironment()` (`backend/src/main.ts:12`) calls
`assertCutoverConfigurationSafeForProduction()` **first and unconditionally**. It throws when
`GOVERNED_CUTOVER_MODE` holds an unrecognised value, and when it holds any non-`LEGACY` valid mode
in production without `GOVERNED_CUTOVER_PRODUCTION_ACK=I_ACKNOWLEDGE_GOVERNED_CUTOVER`.

The service is up, so the configuration is exactly one of:

1. `GOVERNED_CUTOVER_MODE` unset or empty → `LEGACY`; **or**
2. `GOVERNED_CUTOVER_MODE = LEGACY`; **or**
3. `GOVERNED_CUTOVER_MODE ∈ {SHADOW, GOVERNED_WITH_FALLBACK, GOVERNED_STRICT}` **and**
   `GOVERNED_CUTOVER_PRODUCTION_ACK` is set to the exact sentinel.

**Case 3 is not excluded**, so a healthy boot does **not** establish the required state. It is
narrowing evidence, not proof, and it is recorded as narrowing evidence.

```
CUSTOMER_GOVERNED_MODE_STATUS = NOT_CHANGED_BY_THIS_OPERATION; VALUE_UNVERIFIED
```

### 5.4 What must be checked manually

In the Render dashboard for `safety-insite-backend` (`srv-d7kl74jeo5us73deaor0`) → **Environment**,
confirm the ten variables in §5.1 hold their required values. The first four are decisive; if
`GOVERNED_CUTOVER_MODE` is unset or `LEGACY`, the allowlists cannot matter, and if both allowlists
are unset or empty, the mode cannot matter (§6).

## 6. Customer-behaviour safety boundary — proved from source

**The question:** does `federal-core-2026-08-28.1` being the active release, by itself, opt ordinary
production customers into governed behaviour?

**The answer: no** — and the active pointer is not even an input to the decision. Traced end to end
through the real customer path (`POST /safescope-v2/classify`):

1. **Mode.** `resolveCutoverMode()` (`cutover-mode.ts:120`) returns `LEGACY` for unset, empty,
   whitespace, wrong-case and every unrecognised string. `Boolean(env.X)` is never used, so
   `"false"`, `"0"`, `"off"` all resolve to `LEGACY` via `INVALID_MODE_VALUE`. **No missing variable
   can enable cutover.**
2. **Enablement.** `resolveCutoverEnablement()` (`cutover-mode.ts:207`) returns
   `effectiveMode: 'LEGACY'` on `MODE_IS_LEGACY`, and — decisively — on
   **`NO_ALLOWLIST_CONFIGURED`** when `GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST` and
   `GOVERNED_CUTOVER_ORG_ALLOWLIST` are both empty. **A governed mode with no allowlist enables
   nobody.** The principal comes from the authenticated JWT only; there is no request-scoped
   override, so a customer cannot enable governed retrieval for themselves or anyone else.
3. **Active-release binding.** `resolveInspectionReleaseBinding()`
   (`inspection-release-binding.ts:112`) returns `GOVERNED_MODE_INACTIVE` **before touching the
   database** when `!modeInfluencesCustomerOutput(mode)`. `readActiveRelease()` — the only
   `SELECT … WHERE status = 'active'` on this path — is therefore never reached, and
   `inspection.knowledgeReleaseId` is never written. This is why 12 historical inspections remain
   at 0 bound with the release ACTIVE.
4. **Retrieval.** `orchestrateShadowRequest()` (`shadow-request-orchestration.ts:230`) short-circuits
   on `effectiveMode === 'LEGACY'` and runs the pipeline with a `null` context: **no code in
   `standards/cutover/` executes at all.** `GovernedCutoverContext.create()` likewise returns `null`
   rather than a LEGACY context, so call sites cannot route through governed code by accident.
5. **Display.** `hydrateFindingScopedStandards(result, null)` leaves `governed` undefined and
   `resolveStandardsBacking()` takes its pre-KG-4A branch — the legacy `standards_master` path
   (2,390 rows), byte-for-byte today's behaviour.
6. **Persistence.** `resolveKnowledgeReleaseId()` (`inspection.service.ts:537`) gates on
   `modeInfluencesCustomerOutput(effectiveMode)`; LEGACY and SHADOW both return **NULL**. A
   `knowledgeReleaseId` supplied in a request body is treated as an untrusted claim and discarded
   unless the server independently agrees on both mode and release.

**Shadow variables cannot reach a customer.** `GOVERNED_CUTOVER_SHADOW_COHORT_BPS` can make a
principal cohort-eligible without an allowlist, but only via
`resolveProductionShadowAuthorization()`, which is reached only *after* the LEGACY short-circuit in
step 4 — so with empty allowlists it is never consulted. It also requires
`locks.SERVER_MODE = (configured.mode === 'SHADOW')`, and `productionShadowAckAuthorizes()` returns
true for `SHADOW` alone. SHADOW never sets `knowledgeReleaseId`, never changes ranking, membership,
count, text, citation or backing status.

```
Activating a release moves a CONTROL-PLANE pointer that no ordinary customer request reads.
The pointer becomes an input only after modeInfluencesCustomerOutput(mode) is already true --
i.e. GOVERNED_WITH_FALLBACK or GOVERNED_STRICT, with the principal named on an allowlist.
```

**This proof is conditional on its antecedent.** It establishes that the required legacy/empty
configuration produces no customer-visible change. It does **not** establish that production holds
that configuration — §5 could not read it. Both halves must be stated together.

## 7. State after this operation

```
PRODUCTION_SCHEMA_COMPATIBLE              = TRUE
PRODUCTION_GOVERNED_RELEASE_MATERIALIZED  = TRUE
PRODUCTION_GOVERNED_RELEASE_REVIEWED      = TRUE   (64/64, checksum-bound)
PRODUCTION_GOVERNED_RELEASE_ACTIVE        = TRUE
PRODUCTION_GOVERNED_RELEASE_ID            = federal-core-2026-08-28.1
PRODUCTION_GOVERNED_RELEASE_MANIFEST      = 680540d994cedb9384912cb7a3ccd28d798756bd787a84a530c8076ed3a668cb
CUSTOMER_GOVERNED_MODE_ENABLED            = FALSE  (not enabled by any step here)
CUSTOMER_GOVERNED_MODE_VERIFIED           = FALSE  (Render values not readable read-only)
POST_CUTOVER_CUSTOMER_ACCEPTANCE          = FALSE
PROVIDER_CALLS                            = 0
COMMIT / PUSH / TAG / DEPLOY / RENDER MUTATION / DB CONNECTION = NONE (this operation)
```

**Control-plane activation is not customer-visible activation.** The release being `active` is a
governance fact about the control plane. It is recorded as such and must never be reported as
customer governed mode.

## 8. Carried forward, unrepaired and not silently closed

* The **unresolved-jurisdiction ranking defect remains OPEN**.
* The **four known-failing regression suites remain OPEN**.
* The HazLenz protected floor is **untouched** — no hazard behaviour changed, no scorer ran.
* `LIVE_PAYMENT_PROOF = FALSE`, `DEFERRED_UNTIL_FIRST_GENUINE_CUSTOMER_TRANSACTION` — unchanged.
* Four tracked frontend check scripts still fail against committed source (§89 / OPEN-4).
* **InSite v1.0 is not launch-ready, and nothing here makes it so.**

## 9. What this operation changed

| path | change |
|---|---|
| `verification/insite-v1-production-governed-cutover-2026-08-28/FINAL_STATUS.md` | **new** — this file |
| `docs/INSITE_ENGINEERING_BLUEPRINT.md` | appended §90 |
| `docs/INSITE_CURRENT_STATE.json` | current-state fields only; historical entries untouched |

`STATUS.md`, `TARGET_GUARD_REHEARSAL.txt`, `runbook/`, `rehearsal/` and all eight files in
`transcripts/` are **preserved unmodified**. `transcripts/01-materialize.txt` (51 bytes,
`bash: 01-materialize.sh: No such file or directory`) is retained as-is: it records a mistyped
filename that produced no database contact, and the step was then run correctly as
`02-materialize.sh`.

`frontend-next/tsconfig.json` is byte-identical to its recorded baseline
`73990cd12c472ec2f0793da8d0d7fc359ec15b020d3833b748acbebb7b858535` and was not touched.

## 10. The next authorization required

> **Enable customer governed mode in production** — set `GOVERNED_CUTOVER_MODE` and a bounded
> `GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST` / `GOVERNED_CUTOVER_ORG_ALLOWLIST` on
> `safety-insite-backend`, plus `GOVERNED_CUTOVER_PRODUCTION_ACK`.

That is a **Render environment mutation and a customer-visible behaviour change**, and it is
explicitly **NOT AUTHORIZED** by this operation. It should not be requested until §5.4's manual
dashboard verification has established the current values, because remediating an unexpected value
is itself a product-owner decision.

Note the standing deployment property: `autoDeploy=yes` with `autoDeployTrigger=commit` on `main`
means **pushing to `origin/main` is a production deployment**. Nothing here was committed or pushed.
