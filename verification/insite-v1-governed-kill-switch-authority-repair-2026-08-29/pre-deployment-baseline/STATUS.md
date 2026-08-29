# Pre-deployment baseline completion — the gates the repair phase could not execute

**Date:** 2026-08-29 · **Repository HEAD:** `45251d38a4e800bbff461708aa4c77061feade56`, branch
`main`, `origin/main` at the same SHA, ahead/behind `0/0`. **Production SHA:** `45251d38…`.
**HEAD is unchanged by this operation.** Nothing was staged, committed, pushed, tagged or deployed.

```
TERMINAL = HAZLENZ_GOVERNED_KILL_SWITCH_REPAIR_FULLY_ACCEPTED
           -- COMMIT_PUSH_PRODUCTION_DEPLOYMENT_AUTHORIZATION_REQUIRED
```

**This is a separate, additive section.** It does not rewrite the repair phase's record in
`../STATUS.md`; that document's §8.2 named exactly what could not be executed and why, and this
section closes those items. **Zero production source or test files were changed by this
operation** — it is verification only. The one failure that survives is classified, not repaired
(§7).

---

## 1. Why the gates were blocked, and what changed

The repair phase reported those suites as NOT PROVEN because the ordinary local `safescope`
database has no governed release schema, and the repository's protected-database guard correctly
refuses to let a mutating suite touch it. Neither fact was a defect. The remedy was to build the
environment the suites were always written for: **a disposable governed database, and a disposable
API instance** — not to relax a guard.

**No guard was weakened, bypassed or edited.** `PROTECTED_DATABASE_NAMES`,
`DISPOSABLE_NAME_PATTERN`, the ownership marker table and
`KG_TEST_DB_INITIALIZE_OWNERSHIP` are byte-identical to HEAD. Where a suite refused, it was given
a database it could legitimately claim — never permission to claim one it could not.

## 2. Phase 1 — the qualified disposable environment

Eleven databases were created for this operation. Every one is on `127.0.0.1`, matches the
repository's own `^test_[a-z0-9_]+$` disposable pattern, is absent from
`PROTECTED_DATABASE_NAMES`, and carries the full schema. **The resolved host and database name
were printed and checked before every mutable command** (`transcripts/01-…`, `03-…`, `20-…`,
`50-…`).

**The governed baseline fixture — `test_kg_predeploy_baseline_20260829`:**

| property | measured |
|---|---|
| migrations applied | **50** |
| latest migration | `InspectionKnowledgeReleaseBinding1800000018000` (`1800000018000`) |
| governance tables present | `regulatory_releases`, `regulatory_release_records`, `regulatory_release_record_reviews`, `standards_master`, `inspection`, `inspection_findings`, `hazlenz_analyses` |
| required columns | `inspection.knowledgeReleaseId`, `inspection.displayNumber`, `hazlenz_analyses.knowledgeReleaseId`, `inspection_findings.source` |

Ownership markers, written by the suites themselves at claim time
(`transcripts/95-database-qualification-summary.txt`):

| database | role | ownership marker |
|---|---|---|
| `test_kg_predeploy_baseline_20260829` | governed fixture, cloned from for the rest | *(read-only; never claimed)* |
| `test_kg_binding_20260829` | release binding acceptance | `release-binding-acceptance` |
| `test_kg_activation_20260829` | activation acceptance | `release-activation-acceptance` |
| `test_kg_misc_20260829` | identity / provenance | `test:governed-corpus-matrix` |
| `test_kg_relscope_20260829` | governed customer workflow + live kill-switch probe | `verify:release-scoped-customer-workflow` |
| `test_kg_shadow_20260829` | SHADOW-posture acceptance | *(suites did not claim)* |
| `test_kg_corpusmatrix_20260829` | seeded legacy corpus matrix | `test:governed-corpus-matrix` |
| `test_kg_extra_20260829`, `test_kg_approval_20260829`, `test_kg_workflow_20260829` | spare clones | *(unclaimed)* |
| `test_v1_predeploy_api_20260829` | LEGACY-posture API + HazLenz scorers | `verify:canonical-report-frontend-contract` |

**The protected development database was never migrated, seeded or written.** Measured at the end
of the operation: `safescope` holds **1 user** and **35 migrations** (the disposable databases hold
50, so `safescope` was demonstrably not migrated), and it carries **no** ownership marker table.
`test:release-binding-acceptance` had earlier refused it by name — that refusal is what this
operation worked *with*, not around.

## 3. Phase 2 — the governed fixture, materialized through the reviewed mechanism

Both releases were built with `npm run release -- prepare`, the same command the production
runbook uses, and both **reproduced their pinned manifests exactly**:

| release | members | manifest | pin reproduced | legacy corpus rows read |
|---|---|---|---|---|
| `federal-core-2026-08-28.1` | **64** | `680540d994cedb9384912cb7a3ccd28d798756bd787a84a530c8076ed3a668cb` | **true** | **0** |
| `federal-core-2026-07-30.1` | **35** | `14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b` | **true** | **0** |

`rejected_records_included = 0` — none of the 8 reviewer-rejected records is a member of the
candidate snapshot.

**The 64 reviewer approvals were REPLAYED, not invented.** Before a single approval was sent, the
preserved ledger (`../../insite-v1-reviewer-governance-2026-08-28/APPROVAL_DECISIONS.json`) was
proved to bind **1:1 by exact record checksum** to the 64 materialized records, with one reviewer
identity and no duplicate checksums. Each decision was then replayed individually through
`npm run review:release-record -- approve` with its own `--expected-checksum`:

```
BINDING PROOF OK — 64 preserved decisions bind 1:1 by exact record checksum
approved=64  already_approved=0  failed=0
```

No expected governance content was altered to accommodate the repair.

## 4. Phase 3 — every previously unexecuted governance gate

All run against the qualified environment. **Nothing weakened; no assertion deleted; no expected
result edited.**

| # | gate | result |
|---|---|---|
| 1 | `test:governed-release-reachability` | **514 / 514** — approved members reachable **64/64**; **rejected records reaching approval 0/8** |
| 2 | `test:governed-authority-precedence` | **42 / 42** |
| 3 | `test:finding-governed-authority` | **17 / 17** |
| 3 | `test:finding-governed-integration` | **19 / 19** |
| 4 | `test:release-binding-acceptance` | **25 / 25** |
| 5 | `test:approval-contract` | **57 / 0** |
| 6 | `test:release-identity-immutability` | **8 / 8** |
| 6 | `test:release-identity-ownership-exemption` | **7 / 7** |
| 7 | `test:release-activation-acceptance` | **43 / 43** |
| 8 | `verify:release-scoped-customer-workflow` | **35 / 35** |
| 9 | rejected-record reachability | **0 of 8** reach approval, in three independent suites |
| 10 | `test:governed-corpus-matrix` | **60 / 60** |
| 11 | `test:knowledge-release-provenance` | **27 / 27** |
| 11 | `test:kg5b-release-construction` | **102 / 102** |
| 11 | `test:kg5b-approval-continuity` | **29 / 29** |
| 11 | `test:kg5b-operator-cli` | **64 / 65** — see §7, classified, NOT repaired |

`test:approval-contract` — recorded in blueprint §89 as refusing under the release-identity guard
because it created its work database without an ownership marker — **now passes 57/0**. It
self-provisions `test_kg3f_contract_run` from its own source corpus `test_kg3f_contract_20260820`
and claims it (`claim=NEW`); the source corpus is not modified. The fix is in the uncommitted
`backend/scripts/test-approval-contract.ts`, which predates this operation and was not edited here.

### 4.1 The 8 rejected records, adversarially, three ways

| suite | measurement |
|---|---|
| `governed-release-reachability` | rejected records reaching approval: **0/8**, against a positive control of 64/64 approved members that DO reach `APPROVED_GOVERNED_CONTENT` |
| `finding-governed-authority` | each of the 8 resolves `REJECTED_GOVERNED_CONTENT`, `member=false`, `reviewer=none` |
| `release-binding-acceptance` | `NOT_IN_RELEASE` under release-scoped retrieval, and `REJECTED_GOVERNED_CONTENT` under the **active, bound** release |

Citation-string equality still confers nothing: *"citation-string equality confers nothing while
that citation IS approved and active — `LEGACY_CODE_RESIDENT_CONTENT`"*, with the positive control
in the same suite showing that genuinely resolving the member **does** confer approval.

## 5. Phase 4 — the exact HazLenz protected floor, re-measured

Driven through the **real customer workflow over HTTP** against a disposable API instance
(`127.0.0.1:4231`, `NODE_ENV=test`) and the disposable database
`test_v1_predeploy_api_20260829` — register → disposable Pro grant → site → inspection →
observation → `POST /safescope-v2/classify` → `POST …/analyses` → reconciliation →
`GET /inspections/{id}`. **No `test:hazlenz-core` PASS was substituted for these numbers.**

**API target proof, measured rather than assumed** (`transcripts/22-api-target-proof.txt`):

```
users in disposable test_v1_predeploy_api_20260829  BEFORE 0 -> AFTER 1
users in protected  safescope                       BEFORE 1 -> AFTER 1   (unchanged)
```

| metric | measured | required |
|---|---|---|
| `LEVEL1_RECOGNITION_RECALL` | **100.0 % (43/43)** | 43/43 |
| recognition, life-critical | **35/35** | 35/35 |
| `ACTIONABLE_FINDING_COVERAGE` | **100.0 % (43/43)** | 43/43 |
| `LIFE_CRITICAL_ACTIONABLE_COVERAGE` | **100.0 % (35/35)** | 35/35 |
| Population-A case-level precision | **100.0 %** | 100 % |
| forbidden-family count | **0** | 0 |
| rows with a forbidden family | **0** | — |
| total dangerous omissions (A+B) | **0** | — |
| total life-critical omissions | **0** | — |
| `recognizedButNotActionable` | **[]** | empty |

`measurements/actionable-predeploy-baseline.json` is **field-for-field identical** on
`recognition` and `actionable` to the recorded post-repair baseline
`../../insite-v1-hazlenz-actionable-coverage-2026-08-28/measurements/actionable-after.json`. No
corpus row, scorer threshold or expectation was adjusted.

The unresolved-jurisdiction ranking defect was **not** touched. The scorer's separate standards
axis reports `HAZARD_PRESENT_STANDARD_EXPECTED_BUT_MISSING: 26` — that axis is scored separately
by design, and this disposable database deliberately carries no seeded legacy `standards_master`;
it is not part of the recognition or actionability floor and is not a regression signal.

Deterministic gates, re-run in the same session: `test:hazlenz-core` **PASS** (44 constituent
suites, 276 assertions), `test:hazlenz-precision` PASS, `test:hazlenz-level1-recall` PASS (17),
`test:hazlenz-actionable-coverage` PASS (17), `test:hazlenz-source-authority` PASS,
`test:hazlenz-standards-jurisdiction` PASS (16 checks, **0 wrong-jurisdiction citations**).

## 6. Phase 5 — customer workflow regression

Ordinary LEGACY customer behaviour, against the disposable API.

| suite | result |
|---|---|
| `test:user-authored-findings` | **47 / 0** |
| `test:offline-sync-idempotency` (offline / `clientRequestId`) | **23 / 0** |
| `test:report-replacement-failure-safety` | **16 / 0** |
| `test:canonical-workflow` (broad inspection workflow) | **passed: true** — 25 scenarios, 4 cross-user denials, mass-assignment rejected |
| `test:persisted-decomposition-findings` | **passed: true** — stale-version write correctly `409` |
| `verify:hazlenz-actionable-workflow` | **66 / 0** |
| `verify:canonical-report-frontend-contract` | **15 / 15** |
| `test:knowledge-release-provenance` (binding-dependent) | **27 / 27** |
| `test:kg4e-report-field-exclusion` | **9 / 0** |

The kill-switch repair alters no legacy behaviour: every one of these ran with **no**
`GOVERNED_CUTOVER_*` variable set, which is the shipped production posture.

## 7. Phase 8 — the one surviving failure, classified and NOT repaired

**`test:kg5b-operator-cli` — 64 / 65.**

```
FAIL  sources reports the 35 governed candidate records :: 72
```

**Classification: D — a stale expected result reflecting a genuinely changed intended contract.**

The assertion (`scripts/test-kg5b-operator-cli.ts:416`) pins `governedSourceRecords === 35`. The
version-controlled governed source set now holds **72** records: the 2026-08-28 authoritative
regulatory source acquisition grew it 35 → 72, which the blueprint records as an intended change,
and from which the 64-member reviewed release is derived.

**It is not category A.** Both the assertion file and the governed source set are committed at
`45251d38` and are **unmodified by this operation** (`git status --porcelain` reports neither).
Nothing in the kill-switch repair's diff — `standards/cutover/cutover-kill-switch.ts` (new),
`cutover-mode.ts`, `production-shadow-authorization.ts`, `shadow-request-orchestration.ts` — can
reach the governed source set. The failure exists at HEAD, independent of the repair.

**No change was made.** Per the operation's Phase 8 rule for categories B/C/D, this is reported
rather than repaired. Updating the pin from 35 to 72 is a one-line change, but it is an assertion
about governed corpus size and belongs to whoever owns that contract, not to a verification pass.

### 7.1 Failures that were environment defects, resolved by fixing the environment

Each was **category C**, and each passed once the environment matched what the suite documents.
None required a source or test change.

| suite | first observation | cause | after |
|---|---|---|---|
| `test:offline-sync-idempotency` | 20/3 — evidence upload `500` | server started without `STORAGE_PROVIDER=local_test` / `STORAGE_LOCAL_ROOT` | **23 / 0** |
| `test:canonical-workflow`, `test:user-authored-findings`, `test:persisted-decomposition-findings` | `429 Too Many Requests` / undefined-field cascade | `/auth/register` is throttled at 5/min; suites were run back-to-back | **all pass** when spaced |
| `test:kg4e-report-field-exclusion` | 8/1 — SHADOW NULL-provenance obligation | pointed at the GOVERNED database, whose findings legitimately carry provenance | **9 / 0** against the LEGACY database |
| `test:kg4d-integration-e2e` | provenance not NULL "in SHADOW" | pointed at a `GOVERNED_WITH_FALLBACK` server | **42 / 0** against a real SHADOW server |
| `test:kg4b-default-off` | 30/1 — "both accounts authenticate" | needs a server in SHADOW with exactly one allowlisted account | **48 / 0** |
| `test:kg4b-privacy-review`, `test:kg4b-shadow-determinism` | `ENOENT shadow-events.jsonl` | need `CORPUS_DIR` naming a recorded shadow corpus | **26 / 0** and **18 / 0** |
| `test:kg4e-telemetry-privacy-v2` | usage error | needs an events file argument | **PASS** — fields outside the v2 allowlist **0**, 12 canary patterns applied |
| `test:governed-corpus-matrix` | fixture spans OSHA GI (0) / Construction (0) / MSHA (0) | needs a seeded legacy `standards_master` | **60 / 60** |
| `test:verify-canonical-report-frontend-contract` | `UNCLAIMED_DATABASE` | the guard working exactly as designed | **15 / 15** after a database-specific claim |

`test:kg4b-shadow-determinism` verified its own discipline on the way out: *"HARD: source record
count unchanged (35)"*, *"HARD: the source's active release is unchanged"*, 7 layout databases
dropped.

## 8. Phase 6 — cutover re-assertion, including a LIVE end-to-end emergency-stop proof

### 8.1 The protected cutover floor

| suite | result | floor |
|---|---|---|
| `test:kg4a-default-off` | **52 / 0** | 51 → 52 (**one assertion ADDED** by the repair phase, none removed) |
| `test:kg4a-cutover-contract` | **146 / 0** | 146 |
| `test:kg4c-disabled-deployment` | **80 / 0** | 80 |
| `test:kg4c-production-shadow-contract` | **438 / 0** | 438 |
| `test:kg4d-default-off` | **121 / 0** | 121 |
| **protected floor** | **837 / 0** | **≥ 837 required — met** |
| `test:governed-kill-switch-authority` | **115 / 0** | — |
| `reproduce:governed-kill-switch-defect` | **REPAIRED — 16 / 0** | — |
| kg4d-orchestration 151, kg4b-shadow-contract 123, kg4b-shadow-adversarial 84, kg4a-provenance-pinning 53, kg4a-governed-resolution 99, kg4b-default-off 48, kg4d-integration-e2e 42, kg4a-governed-e2e 35, kg4b-privacy-review 26, kg4b-shadow-determinism 18, kg4e-report-field-exclusion 9 | all **0 failed** | — |
| **cutover-family total** | **1,640 / 0** | — |

### 8.2 The emergency stop, proved against a RUNNING SERVER

The repair phase proved the resolver in-process. This proves the **server the customer actually
talks to**, including the controller call site that resolved the release binding before the repair.
Real HTTP, `POST /safescope-v2/classify` with an `inspectionId`, against
`test_kg_relscope_20260829` with `federal-core-2026-08-28.1` ACTIVE and one allowlisted account.
Only the kill-switch variable changed between the three phases
(`transcripts/60-live-kill-switch.txt`).

| phase | server configuration | classify | new `inspection.knowledgeReleaseId` | pre-existing bound inspection |
|---|---|---|---|---|
| **A — kill OFF** | `GOVERNED_WITH_FALLBACK` + ack + allowlist | `201` | **`federal-core-2026-08-28.1`** — bound | `federal-core-2026-08-28.1` |
| **B — kill ON** | identical + `GOVERNED_CUTOVER_KILL_SWITCH=engaged` | `201` | **NULL** | **`federal-core-2026-08-28.1` — intact** |
| **C — kill released** | identical, switch removed, nothing else | `201` | **`federal-core-2026-08-28.1`** — bound again | `federal-core-2026-08-28.1` |

Every bound/unbound inspection in the database afterwards:

```
Release-scoped workflow …    federal-core-2026-08-28.1
Successor …                  workflow-fixture.successor
kill-switch kill-OFF-1       federal-core-2026-08-28.1
kill-switch kill-ON          NULL
kill-switch kill-OFF-restored federal-core-2026-08-28.1
```

Read against the frozen pre-repair reproduction — where the identical configuration with the switch
engaged **wrote** `federal-core-2026-08-28.1` onto a new inspection — this is the defect closed on
a live server: **no new governed eligibility, no new release binding, no new `knowledgeReleaseId`,
zero durable binding writes, existing provenance intact, and the customer path still served
(`201`)**.

`verify:release-scoped-customer-workflow` **35/35** on the same server independently confirms the
positive half: with the stop released, governed delivery genuinely works end to end, the reopened
inspection preserves its original release after a newer one is activated, and a NEW inspection
binds to the newly active release.

## 9. Phase 7 — type and build

| gate | result |
|---|---|
| backend `tsc --noEmit` | **clean, 0 errors** |
| frontend `tsc --noEmit` | **3 errors, all 3 inside `.next/`** generated duplicate artifacts (`routes.d 3.ts`, `cache-life.d 3.ts`, dated 2026-08-28 14:04). **0 source errors.** Pre-existing and unrelated. |
| frontend `next build` (production) | **exit 0**, all routes prerendered |

`frontend-next/tsconfig.json` was snapshotted before the build and re-hashed after: **byte-identical
at `73990cd12c472ec2f0793da8d0d7fc359ec15b020d3833b748acbebb7b858535`**, unchanged. It was not
edited to hide anything, and the build did not rewrite it.

## 10. Phase 9 — disposal

The eleven databases created by this operation were dropped after this evidence was captured
(`transcripts/99-disposal.txt`). Nothing else was removed: no pre-existing evidence database, no
user data, no repository file, no worktree change.

Two pre-existing databases were touched by suites' own designed behaviour, and are recorded rather
than glossed: `test:approval-contract` recreates its per-run working database
`test_kg3f_contract_run` from the untouched source corpus `test_kg3f_contract_20260820`, and
`test:kg4b-shadow-determinism` created and then dropped its own 7 layout databases while verifying
its source corpus was unchanged.

## 11. Worktree state

```
HEAD                = 45251d38a4e800bbff461708aa4c77061feade56
branch              = main   upstream = origin/main   ahead/behind = 0/0
staged              = 0
tracked modified    = 13 modified + 1 deleted  (unchanged from the repair phase — this operation
                      changed NO source or test file)
untracked           = the pre-existing set, the repair phase's 4 new files, and this evidence
stashes             = 4 (untouched)
tags                = 24 (untouched)
```

```
SOURCE OR TEST FILES CHANGED BY THIS OPERATION  = NONE
COMMIT / PUSH / TAG / DEPLOY                    = NONE
RENDER MUTATION / ENV VAR CHANGE                = NONE
PRODUCTION DATABASE CONNECTION / MUTATION       = NONE
PRODUCTION DATABASE_URL REQUESTED OR USED       = NO
DEVELOPMENT DATABASE `safescope` MUTATED        = NO (1 user, 35 migrations, no ownership marker)
PROVIDER / LLM CALLS                            = 0
PAYMENT                                         = NONE
CUSTOMER GOVERNED MODE ENABLED IN PRODUCTION    = NO
GOVERNED CORPUS / PRODUCTION ACTIVE RELEASE     = UNCHANGED
PROTECTED GUARD WEAKENED OR EDITED              = NONE
```

## 12. What remains true about production

Production runs `45251d38…` and **still contains the emergency-stop defect**. No
`GOVERNED_CUTOVER_*` variable exists there, so it is not reachable by any customer today — it
becomes reachable the moment the bounded cutover is performed. Blueprint §91.6 remains an accurate
description of the deployed system.

## 13. Remaining limitations

1. **The repair is still not in production**, and remains uncommitted and unpushed.
2. **`test:kg5b-operator-cli` 64/65** — a stale 35-record pin against a 72-record governed source
   set. Pre-existing at HEAD, unrelated to the repair, deliberately not repaired here (§7).
3. **No live production request** exercised the repaired path. Everything here is a disposable
   local environment.
4. The unresolved-jurisdiction ranking defect and `OPEN-4
   PRE_PRODUCTION_GOVERNANCE_RECONCILIATION_REQUIRED` (four failing frontend check scripts) are
   carried forward unchanged.

## 14. Next authorization required

**Commit, push and deploy the kill-switch repair — which are ONE action, not three.**
`autoDeploy=yes` with `autoDeployTrigger=commit` on `main` means pushing to `origin/main` **is** a
production deployment of `safety-insite-backend`. There is no deployment-neutral way to preserve
this work on `main`.

The bounded customer cutover (blueprint §91.4's three Render variables) should be performed **only
after** that deployment: the emergency stop is a precondition for the cutover, not a follow-up.

Nothing in this document authorizes a commit, a push, a deploy, a Render change, a production
database change, a governed-mode enablement or a universal rollout.
