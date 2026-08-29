# InSite v1.0 — production governed knowledge release cutover

**Date:** 2026-08-28 · **Repository HEAD:** `45251d38a4e800bbff461708aa4c77061feade56`, branch
`main`, upstream `origin/main`, 0 staged, 4 stashes, 24 tags — unchanged by this operation.

```
TERMINAL = HAZLENZ_PRODUCTION_GOVERNED_CUTOVER_BLOCKED
           — PRODUCTION_DATABASE_CREDENTIAL_REQUIRED (PHASE 2)
```

**No production transition was executed.** Phases 0, 1 and the whole of the executable design work
are complete, the runbook is written and has been **rehearsed end to end against a disposable
database, including every refusal path**. Phases 3–8 require the production `DATABASE_URL`, which by
this operation's own credential boundary is loaded only into the product owner's Terminal. That is
the blocker, and it is the designed hand-off rather than a failure.

```
PRODUCTION_SCHEMA_COMPATIBLE        = TRUE   (carried forward from the 2026-08-28 remediation)
GOVERNED_RELEASE_MATERIALIZED       = FALSE  (in production; rehearsed OK)
REVIEWER_APPROVAL_REPLAY_COMPLETE   = FALSE  (in production; rehearsed OK, 64/64)
GOVERNED_RELEASE_FINALIZED          = FALSE  (in production; gates rehearsed 8/8 pass)
GOVERNED_RELEASE_ACTIVATED          = FALSE  (in production; rehearsed OK)
CUSTOMER_GOVERNED_MODE_ENABLED      = FALSE
POST_CUTOVER_CUSTOMER_ACCEPTANCE    = FALSE
PROVIDER_CALLS_MADE                 = 0
COMMIT / PUSH / TAG / DEPLOY / RENDER MUTATION = NONE
```

---

## 1. Phase 0 — preservation and source of truth

Read: `docs/INSITE_ENGINEERING_BLUEPRINT.md`, `docs/INSITE_CURRENT_STATE.json`,
`verification/insite-v1-production-schema-remediation-2026-08-28/STATUS.md`,
`verification/insite-v1-reviewer-governance-2026-08-28/{STATUS.md,REVIEWER_LEDGER.json,APPROVAL_DECISIONS.json}`,
`verification/insite-v1-pre-production-governance-reconciliation-2026-08-28/STATUS.md`, and the
governed release source: `backend/src/standards/releases/` plus
`definitions/federal-core-2026-08-28.1.json`.

**Worktree inventory, start and end.** HEAD `45251d38a4e8`, branch `main`, upstream `origin/main`,
0 staged, 9 modified, 1 deleted, 4 stashes, 24 tags. Untracked entries went 2,155 → 2,156: the one
new entry is this evidence directory. Nothing was reset, restored, cleaned, stashed or rebased.
`frontend-next/tsconfig.json` is byte-identical at start and end —
sha256 `73990cd12c472ec2f0793da8d0d7fc359ec15b020d3833b748acbebb7b858535` — and was not touched.

**Every decision below is taken from a checksum-bound ledger, never from prose.** The
prose-vs-ledger cross-check was run with the repository's own `releaseCitationKey()`, not a
re-implementation:

| cross-check | result |
|---|---|
| `APPROVAL_DECISIONS.json` entries | **64**, every one `decision: "approved"` |
| distinct reviewer identities in the ledger | **1** — `insite-product-owner-authorized-regulatory-content-review` |
| distinct reviewer roles | **1** — `regulatory-content-reviewer (non-attorney, non-agency)` |
| distinct record checksums | **64**, all sha256 hex, all carrying `decidedAt` |
| ledger dispositions in `REVIEWER_LEDGER.json` | **72 reviewed = 64 APPROVE + 8 REJECT_CORRECTION_REQUIRED** |
| decision citation keys **==** definition member keys | **true** (64 = 64, exact set equality) |
| ledger APPROVE keys **==** definition member keys | **true** |
| rejected records appearing in the definition | **0** |
| rejected records appearing in the decision ledger | **0** |
| `definitions/federal-core-2026-08-28.1.json` | 64 members, `expectedManifestChecksum` = `680540d9…`, file sha256 `64192865209068e4956ab4ae8c7d7ec6260742cdc6479bc36f615b432cb49da1` — matches the reviewer-governance record |

The 8 excluded citations, and their normalized keys as the repository computes them:
`30cfr57.14107(a)`, `30cfr56.14105`, `29cfr1910.219`, `29cfr1910.132(a)`, `29cfr1926.95(a)`,
`30cfr56.15006`, `29cfr1926.602(a)(9)(ii)`, `30cfr56.9100(a)`.

**Reviewer identity is represented exactly as established and no further.** The role string
carries `(non-attorney, non-agency)` on its face. No attorney, OSHA, MSHA, PE, CIH, CSP or
autonomous-AI reviewer is claimed anywhere in this operation, and the replay writes the ledger's own
identity strings rather than minting new ones.

## 2. Phase 1 — the production runbook, derived from source

Command names were **proved, not guessed**. Every transition below was traced to the module that
performs it.

| # | transition | exact command | affects | idempotent? | transaction? | refuses on |
|---|---|---|---|---|---|---|
| A | **materialization** | `npm run release -- prepare --release-id federal-core-2026-08-28.1` → `scripts/regulatory-release.ts` → `prepareGovernedRelease()` | **only** the named `--release-id`; no prefix, no fuzzy match, no "latest" | **yes** — identical manifest returns `idempotent_no_op` | **yes**, one transaction; `--dry-run` runs in a transaction that is *always* rolled back | `MANIFEST_CHECKSUM_PIN_MISMATCH`, `RECORD_CHECKSUM_PIN_MISMATCH`, `MANIFEST_WOULD_CHANGE`, `RELEASE_IMMUTABLE`, `DEFINITION_MEMBER_NOT_IN_SOURCE_SET`, `MEMBERSHIP_NOT_REPRODUCED`, `ONE_PASS_VERIFICATION_FAILED` |
| B | **approval replay** | `npm run review:release-record -- approve --release … --citation … --expected-checksum … --reviewer … --role …` → `ReleaseRecordReviewService.approveRecord()` | one record version at a time | **yes** — `already_approved` is a no-op success, not a duplicate row; append-only | **yes**, per-release `pg_advisory_xact_lock` | `releaseExists`, `recordExists`, `checksumMatches` (stale review), `approvalDigestMatches`, `reviewerIdentified`, `frozenStateEligible` |
| C | **finalization / validation** | `release -- status --release-id`, `review:release-record -- approval-checksum`, `release -- prepare --dry-run`, `release -- activate --dry-run` | read-only | n/a | dry runs roll back and emit **no** lifecycle event | reports every failed activation gate by name |
| D | **activation** | `npm run release -- activate --release-id … --expected-manifest … --expected-current … --actor …` | the active-release **pointer** only | **yes** — `already_active` | **yes**, advisory lock + compare-and-swap **inside** the transaction + partial unique index `uq_regulatory_release_active` | `UNKNOWN_RELEASE`, `MANIFEST_MISMATCH`, `STALE_EXPECTED_CURRENT`, any failed gate |
| E | **read-only verification** | `runbook/06-post-proof.sh`, all SQL inside `BEGIN READ ONLY` | nothing | n/a | n/a | n/a |

**Materialization and approval replay are two transitions and cannot be collapsed.** Proved from
source and re-measured in rehearsal: `prepare` leaves `reviewState { unreviewed: 0,
mechanically_validated: 64, reviewer_approved: 0 }`, and `evaluateActivation`'s
`governedRecordsPresent` gate refuses activation while zero members are reviewer-approved. There is
no `publish`, no `--latest`, no bulk approval and no HTTP route for either.

**No governed `finalize` command exists, and none is missing.** The lifecycle is
`draft -> provisional (finalized) -> active -> superseded | rolled_back`: `provisional` *is* the
finalized state, written by `prepare`. `seed:regulatory-release` (`finalize-regulatory-release.ts`)
is the **legacy corpus** finalizer and is not on the governed path. The finalization *contract* is
`evaluateActivation()`, and step 4 runs it with zero writes.

## 3. Phase 2 — credential boundary, and the trap it defends against

The production `DATABASE_URL` was **not requested in chat, not written to disk and never echoed**.
The runbook expects `read -rs DATABASE_URL ; export DATABASE_URL` in the owner's own Terminal.

**The trap, measured rather than assumed.** `backend/src/database/data-source.ts` resolves
`process.env.DATABASE_URL || DB_*`, and every operator script begins `import 'dotenv/config'`.
dotenv v17 does not override an exported variable, so an exported production URL wins — **but
`backend/.env` itself defines `DATABASE_URL`, pointing at the local `safescope` development
database.** With no export, the resolution probe returns `safescope`. The identical command would
therefore mutate the development database if the export were missing.

`runbook/lib-guard.sh` closes this. It resolves the target through *exactly* that mechanism, inside
`BEGIN READ ONLY`, and refuses every step unless `current_database() = neondb`, the latest migration
is `InspectionKnowledgeReleaseBinding1800000018000`, the migrations above `1800000015000` are
exactly the three remediation migrations in order, and all three new columns exist. The ledger row
count is **observed and reported, never asserted** — the production ledger is baselined, so its row
count is not the repository's migration position.

**The guard was rehearsed against the shipped file** (`TARGET_GUARD_REHEARSAL.txt`): it refuses with
no export (G1), refuses when pointed at the local `safescope` database and names all four failed
assertions (G2), and refuses a correctly-migrated but non-production database (G3). It printed no
credential in any case.

## 4. Phases 3–8 — NOT EXECUTED against production

They require the credential. What is recorded instead is a **complete rehearsal** of the identical
scripts against the disposable database `test_prodcutover_20260828` (created for this operation,
migrated to `InspectionKnowledgeReleaseBinding1800000018000`, retained).

`rehearsal/00-target-proof.txt` … `rehearsal/06-post-proof.txt`,
`rehearsal/99-refusal-rehearsal.txt`.

| step | rehearsed result |
|---|---|
| 00 target proof | database, latest migration, three newer migrations, three columns — all as required |
| 01 pre-snapshot | 0 releases, 0 release records, 0 decisions, 0 events, active pointer `null`, 0 rejected records reachable |
| 02 materialize | `outcome: prepared`, `recordCount: 64`, manifest `680540d9…`, **`reproducedPinnedManifest: true`**, `legacyCorpusRowsRead: 0`, `placeholderSourceRecords: 0`, `verifiedInOnePass: true`, `rejected_records_included: 0`, `decision_rows_so_far: 0` |
| 03 replay | binding proof passed (64 preserved decisions bind 1:1 **by exact record checksum** to the 64 materialized records); **approved=64 already_approved=0 failed=0**; effective state `reviewer_approved: 64` and nothing else; `distinct_checksums 64`, `distinct_reviewers 1`, `non_approve_decisions 0`; rejected rows **0** |
| 04 validate | `prepare --dry-run` → **`idempotent_no_op`**, `reproducedPinnedManifest: true`; `activate --dry-run` → **all 8 gates pass, `failedGates: []`, `wouldSucceed: true`, `writesPerformed: 0`**, including `governedRecordsPresent: 64 of 64 snapshot records are reviewer-approved` |
| 05 activate | `outcome: activated`, `previousReleaseId: null`, `activeManifestAfter: 680540d9…` |
| 06 post-proof | status `active`, exactly one active pointer, `approved 64 / not_approved 0`, `records_without_a_checksum_bound_decision 0`, reviewer identity recorded on all 64, rejected rows **0**, `inspections_bound_to_a_release 0`, audit trail = 64 `record_approval` + 1 `activation`, all `succeeded` |

### The refusal paths, measured — nothing was relaxed to obtain a pass

| # | attempt | result |
|---|---|---|
| N1 | re-approve an already-approved version | `already_approved` — no duplicate decision row |
| N2 | approve stating a checksum the release does not hold | **REFUSED**, exit 2, `STALE REVIEW` |
| N3 | approve one of the **8 rejected** citations | **REFUSED**, exit 2 — *"holds no record for citation key `29cfr1910.132(a)`"* |
| N4 | re-prepare the **active** release | **REFUSED**, exit 2, `RELEASE_IMMUTABLE`; nothing rewritten |
| N5 | re-activate the active release | `already_active` — idempotent |
| N6 | activate with a **stale** `--expected-current` | **REFUSED**, exit 2, `STALE_EXPECTED_CURRENT` |
| N7 | activate with a **wrong** `--expected-manifest` | **REFUSED**, exit 2, `MANIFEST_MISMATCH` |

N3 is the citation-laundering proof at the mechanism level: a rejected record is a member of no
release snapshot, so there is no record for an approval to attach to, in any environment.

## 5. Production runtime, observed read-only

```json
{"status":"ok","database":"up","timestamp":"2026-08-28T22:01:23.064Z",
 "version":{"appName":"safety-insite-backend",
            "gitCommit":"45251d38a4e800bbff461708aa4c77061feade56",
            "nodeEnv":"production","versionSourceStatus":"RENDER_GIT_COMMIT"}}
```
`/health/ready` → **200**. Deployed SHA **unchanged**. Render service config read read-only
(`autoDeploy=yes`, `autoDeployTrigger=commit`, `branch=main`, `rootDir=backend`,
`startCommand=npm run start:render`) — **no Render mutation command was issued.**

## 6. Governed mode — what is and is not provable

`GOVERNED_CUTOVER_MODE`, `GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST` and
`GOVERNED_CUTOVER_ORG_ALLOWLIST` are **Render environment variables, not database state**. They
were **not changed** — this operation issues no Render command at all — but their *values* are not
readable read-only: the Render CLI (v2.20.0) exposes no env-var subcommand, no application route
exposes the mode, and the start diagnostic does not print it.

Two things *are* established. First, `assertCutoverConfigurationSafeForProduction()` runs at boot
and throws on an unrecognised value, and on any non-legacy mode without
`GOVERNED_CUTOVER_PRODUCTION_ACK=I_ACKNOWLEDGE_GOVERNED_CUTOVER`; the service is up, so the value is
not invalid and is not an unacknowledged governed mode. Second, a governed mode with **no** allowlist
enables nobody (`NO_ALLOWLIST_CONFIGURED`). That is not the same as proving the mode is `LEGACY`.

**`CUSTOMER_GOVERNED_MODE_STATUS = NOT_CHANGED_BY_THIS_OPERATION; VALUE_UNVERIFIED`** — confirm in
the Render dashboard rather than inferring it.

## 7. What this operation changed

| path | change |
|---|---|
| `verification/insite-v1-production-governed-cutover-2026-08-28/` | **new** — this directory: `STATUS.md`, `TARGET_GUARD_REHEARSAL.txt`, `runbook/` (8 files), `rehearsal/` (8 transcripts), empty `transcripts/` for the production run |
| `docs/INSITE_ENGINEERING_BLUEPRINT.md` | appended §89 |
| `docs/INSITE_CURRENT_STATE.json` | current-state fields only; historical entries untouched |

`INSITE_CURRENT_STATE.json` changes are confined to `generatedBy` (prepended, history preserved),
`checkpoint`, `readiness`, `actionsPerformedByThisTask` and a new `productionGovernedCutover` block.
No key was removed; `knownCaveats`, `nextSlice` and `productionPosture` carry the *previous*
session's uncommitted edits and were deliberately left alone. The superseded
`actionsPerformedByThisTask` record was byte-identical to HEAD's and remains recoverable with
`git show HEAD:docs/INSITE_CURRENT_STATE.json`. The blueprint change is **purely additive** — 462
insertions, 0 deletions.

**No production runtime code, no backend script, no test, no scorer and no release definition was
modified.** The runbook composes existing reviewed commands; it adds no new approval, activation or
construction path.

**Disposable database created and retained:** `test_prodcutover_20260828` (local, `test_*`,
migrated and driven through the full sequence). `safescope` was never a mutation target; the only
statements ever issued against it were `SELECT`s inside `BEGIN READ ONLY` during the guard rehearsal.

**Credential hygiene, verified rather than asserted:** every file in this directory was scanned —
**0** `postgres://`/`postgresql://` URIs of any kind, **0** Neon host or endpoint identifiers, **0**
`sslmode=` values, **0** passwords and **0** bearer tokens across every transcript. `lib-guard.sh`
contains the string `sslmode=require` twice, as a literal in the TLS branch it copies from
`data-source.ts` — a code path, not a value.

## 8. Carried forward, unrepaired and not silently closed

* The **unresolved-jurisdiction ranking defect remains OPEN**.
* The **four known-failing regression suites remain OPEN**.
* The HazLenz protected floor (recognition 43/43, actionable 43/43, life-critical 35/35,
  Population-A precision 100 %, forbidden emissions 0) is **untouched** by this operation, which
  changed no hazard behaviour and ran no scorer.
* `LIVE_PAYMENT_PROOF = FALSE`, `DEFERRED_UNTIL_FIRST_GENUINE_CUSTOMER_TRANSACTION` — unchanged.
* **InSite v1.0 is not launch-ready, and this operation does not make it so.** It prepares and
  proves a bounded control-plane cutover; it proves nothing about production governance state,
  because no production governance state was read or written.

## 9. To complete Phases 3–10

Follow `runbook/README.md`. Steps run one at a time, each stopping on its own REQUIRED conditions,
each tee'd into `transcripts/`. Then `unset DATABASE_URL`.
