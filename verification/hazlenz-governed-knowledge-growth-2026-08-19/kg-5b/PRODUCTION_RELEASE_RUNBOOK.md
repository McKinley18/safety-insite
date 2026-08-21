# KG-5B — Production governed-release operation runbook

**Every mutable step below is a single reviewed command.** No ad-hoc Node snippet is required at
any point; KG-5A's activation rehearsal needed one, and closing that gap is KG5A-DISC-03.

Each step names its preconditions, its success evidence, its failure behaviour and its stop/rollback
instruction. **No secrets appear here.** `<production>` stands for the production `DATABASE_URL`,
which the operator supplies from the platform's own secret store and never pastes into a file.

The whole sequence was rehearsed end to end on a disposable database built to production's exact
pre-KG shape (40 migrations, latest `RefreshTokens1800000008000`, 2,390 legacy corpus rows with
`source_key` NULL on every row): `npm run rehearse:kg5b-operator-sequence`, **58/58 assertions**,
**46 reviewed commands, 0 ad-hoc snippets**.

---

## Before you begin

| Precondition | How to confirm |
|---|---|
| The KG release package is committed, pushed and merged to `main` | steps 1–3 below |
| Production `GOVERNED_CUTOVER_*` variables are all **absent** | platform environment inspection |
| Production SHADOW is **OFF** | `GOVERNED_CUTOVER_SHADOW_*` absent |
| You have a named reviewer identity for approvals | not a service account, not `kg*-reviewer` |

**Steps 7–13 are separate authorizations from steps 1–6.** Preparing a release, approving records,
finalizing and activating are four distinct decisions and must not be bundled into one approval.

---

## 1 — Commit the KG release package · AUTHORIZATION REQUIRED

Commits **A–F** per KG-5A §3, plus KG-5B's files (see `STATUS.md` §2). Excludes the 18 frontend
theme files, the 13 unrelated files, and the single `KG5A-DISC-02` hunk in
`frontend-next/app/inspection-workspace/page.tsx`.

* **Success:** `git status` shows only unrelated work remaining.
* **Failure:** nothing is committed; the tree is unchanged.
* **Stop:** do not proceed to step 2 until the diff has been reviewed.

## 2 — Push `release/insite-rc-2026-08-18` · AUTHORIZATION REQUIRED

## 3 — Merge to `main` · AUTHORIZATION REQUIRED

Render's `safety-insite-backend` auto-deploys `main`, so **this merge causes step 5**. Authorize it
only when you are ready for the deployment.

## 4 — Apply the six production migrations · AUTHORIZATION REQUIRED

```
cd backend
DATABASE_URL=<production> npm run migration:run
```

* **Preconditions:** a database backup exists; production is at the 40-migration pre-KG schema.
* **Success:** six `has been executed successfully` lines; `SELECT count(*) FROM migrations` = 46.
* **Evidence:** all six `up()` bodies are additive DDL with **no data backfill** — `ADD COLUMN IF
  NOT EXISTS` (all nullable, no defaults, so no table rewrite), `CREATE TABLE IF NOT EXISTS`,
  `CREATE INDEX IF NOT EXISTS`, one `CHECK`. Rehearsed twice: KG-5A on
  `test_kg5a_prodshape_20260821` (data fingerprint byte-identical before and after) and KG-5B on a
  production-shaped clone (2,390-row corpus digest unchanged).
* **Failure:** each migration is its own transaction; a failure leaves the previous ones applied and
  is safe to re-run — the second run reports `No migrations are pending`.
* **Rollback:** not required. All six are additive and nullable, so the previously deployed commit
  `97941ca2` runs unchanged against the migrated schema. A downgrade exists
  (`npx typeorm-ts-node-commonjs -d src/database/data-source.ts migration:revert`) but should not be
  the plan. **KG-5B adds no seventh migration**, so this set is exactly what was rehearsed.

## 5 — Deploy with every `GOVERNED_CUTOVER_*` absent · automatic from `main`

* **Success:** service healthy; `/health` → `{"status":"ok","database":"up"}`.
* **Rollback:** redeploy `97941ca2` from `main`. No database action.

## 6 — Verify production LEGACY / no-op

Run KG-5A §8's checklist against production: an authenticated analysis returns **0 governed keys**
(`governedDeliveryState`, `governedFallbackReason`, `governedTextUnavailable`, `knowledgeReleaseId`
all absent), **0** `kg4c.shadow-comparison.v2` events, and `backingStatus` never takes
`APPROVED_GOVERNED_CONTENT`.

* **Failure:** stop. Do not proceed to step 7. Redeploy `97941ca2`.

---

## 7 — Prepare the governed release · AUTHORIZATION REQUIRED

**Dry run first. It writes nothing.**

```
cd backend
DATABASE_URL=<production> npm run release -- prepare \
  --release-id federal-core-2026-07-30.1 --dry-run
```

* **Success:** `"recordCount": 35`, `"reproducedPinnedManifest": true`,
  `"manifestChecksum": "14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b"`,
  `"placeholderSourceRecords": 0`, `"legacyCorpusRowsRead": 0`.
* **If `reproducedPinnedManifest` is false — STOP.** The command has already refused and written
  nothing. It means the governed content no longer reproduces what 27 recorded reviews refer to.

Then, for real:

```
DATABASE_URL=<production> npm run release -- prepare --release-id federal-core-2026-07-30.1
```

* **Success:** `"outcome": "prepared"`, `"status": "provisional"`, `"verifiedInOnePass": true`,
  `"reviewState": {"reviewer_approved": 0}`.
* **What this does NOT do:** it does not write to `standards_master`, it does not approve anything,
  and it does not activate anything. Confirm with:
  `SELECT count(*) FILTER (WHERE source_key IS NOT NULL), count(*) FILTER (WHERE release_id IS NOT NULL) FROM standards_master;`
  → **`0 | 0`**, and `SELECT count(*) FROM standards_master;` → **2390**.
* **Failure:** the whole construction is one transaction. Any failure leaves no release row, no
  release record, no staging table and no change to `standards_master`. Re-run it.
* **Re-running is safe:** a second run reports `"outcome": "idempotent_no_op"`.

> **NEVER run `npm run seed:safescope-standards` against production.** It is the pipeline KG-5A
> measured rewriting five live rows and then crashing on a unique-index collision. It now refuses
> before its first write on any corpus holding regulations the governed source set does not name, so
> production is protected — but the command is still the wrong command.

## 8 — Reviewer re-attestation and new reviews · AUTHORIZATION REQUIRED

Read `kg-5a/PRODUCTION_RELEASE_REVIEW_PACKET.md`: **27 REATTEST, 8 NEW_REVIEW_REQUIRED, 0 EXCLUDE**.
KG-5B re-verified that every one of those 35 rows still names the same `recordChecksum`, the same
`substantiveContentDigest`, the same `sourceIdentityDigest` and the same `approvalDigest`, so the
packet applies unchanged.

For each record, read it first:

```
DATABASE_URL=<production> npm run review:release-record -- show \
  --release federal-core-2026-07-30.1 --citation "<citation>"
```

then approve it, naming the exact checksum you read:

```
DATABASE_URL=<production> npm run review:release-record -- approve \
  --release federal-core-2026-07-30.1 --citation "<citation>" \
  --expected-checksum <the recordChecksum shown> \
  --reviewer <your real identity> --role <your role> --note "<what you confirmed>"
```

* **One record at a time. There is no bulk approval path and none may be added.**
* **Success:** the command prints the appended decision with `approvalContractVersion: 2`.
* **Failure:** a wrong `--expected-checksum` is refused with exit 2 and writes nothing.
* **The 8 NEW_REVIEW_REQUIRED records need a fresh clause-by-clause review, not a re-attestation.**
  None of the 8 is in the 23-citation emitted set, so leaving them unapproved costs Stage-1
  nothing: they resolve `UNAPPROVED_RECORD`, which the fallback contract handles and which is
  never BLOCKING.

## 9 — Finalization gates (activation dry run) · no authorization needed, it writes nothing

```
DATABASE_URL=<production> npm run release -- activate \
  --release-id federal-core-2026-07-30.1 \
  --expected-manifest 14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b \
  --expected-current none --actor <your identity> --dry-run
```

* **Success:** `"wouldSucceed": true`, `"failedGates": []`, and all **eight** gates listed as passed.
* **Failure:** `"wouldSucceed": false` names the failing gate. `governedRecordsPresent` failing means
  no record has been approved yet — return to step 8.
* **Evidence it is inert:** the dry run runs no pointer move and writes **no** lifecycle event.

## 10 — Activate, with SHADOW still OFF · AUTHORIZATION REQUIRED

```
DATABASE_URL=<production> npm run release -- activate \
  --release-id federal-core-2026-07-30.1 \
  --expected-manifest 14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b \
  --expected-current none --actor <your identity> --reason "<why now>"
```

* **`--expected-current none` is not boilerplate.** It states your belief that nothing is active.
  The belief is re-checked **inside the transaction, under the advisory lock**, so if another
  operator moved the pointer while you were reading this page, your command is refused rather than
  silently overwriting their change.
* **Success:** `"outcome": "activated"`, `"activeReleaseAfter": "federal-core-2026-07-30.1"`.
* **Failure:** exit 2 with a named refusal — `UNKNOWN_RELEASE`, `MANIFEST_MISMATCH`,
  `STALE_EXPECTED_CURRENT`, or a failing gate. Nothing moved.
* **Rollback:** step 13.

## 11 — Verify the pointer

```
DATABASE_URL=<production> npm run release -- status
```

* **Success:** `activeRelease` is the release you named, `activeManifest` is `14a34fea…`, and
  `manifestVerifies` is `true` for every release listed.

## 12 — Re-verify production LEGACY / no-op with a release active

Repeat step 6. **An active governed release must change nothing a customer can see.** KG-5A measured
this against the exact packaged tree: 0 governed keys, 0 shadow events,
`APPROVED_GOVERNED_CONTENT` never emitted.

* **Failure:** roll back immediately (step 13), then redeploy `97941ca2`.

## 13 — Rollback (only if needed)

```
DATABASE_URL=<production> npm run release -- rollback \
  --release-id <the exact prior release id> \
  --expected-current federal-core-2026-07-30.1 \
  --actor <your identity> --reason "<why>" --dry-run
```

then re-run without `--dry-run`.

* **Both identities are mandatory.** There is no "roll back one step".
* **Nothing is deleted.** The release rolled off is marked `rolled_back`, keeps its manifest and
  keeps all of its records, so historical provenance stays resolvable.
* **If there is no prior release**, rollback is not the remedy: redeploy `97941ca2`, whose code
  never reads the active-release pointer at all (`test:kg4c-disabled-deployment`, 80/80).

## 14 — Stage-1 SHADOW · A SEPARATE AUTHORIZATION, NOT PART OF THIS SEQUENCE

Do not enable any `GOVERNED_CUTOVER_*` variable as part of the above. Before SHADOW is authorized,
read `STATUS.md` §7 (`KG5B-DISC-01`): against production's real corpus, 15 of the 27 approved
records classify `CONTENT_DIFFERENCE`/`BLOCKING`, because production carries the full eCFR section
dump where the governed record carries the reviewed clause-accurate artifact. That is a corpus
adjudication item, it does not block SHADOW observation, and it **must** be resolved before any
governed *delivery*.
