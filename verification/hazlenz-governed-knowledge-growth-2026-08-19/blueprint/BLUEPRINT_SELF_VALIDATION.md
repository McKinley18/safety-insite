# InSite Engineering Blueprint — self-validation record

**Task:** create `docs/INSITE_ENGINEERING_BLUEPRINT.md` + `docs/INSITE_CURRENT_STATE.json`
**Date:** 2026-08-21 · **Repository:** `/Users/mckinley/Desktop/Safety_InSite`
**Branch:** `release/insite-rc-2026-08-18` · **HEAD:** `5f050858227ca11cf90d2f6bf64148e70a018b64`
**Scope:** documentation only. No production code, configuration, database or verification artifact
was modified. Nothing committed, pushed or deployed. KG-4C **not started**.

---

## 1. JSON parses

```
node -e "require('docs/INSITE_CURRENT_STATE.json')"   -> JSON PARSE OK
top-level keys: 23 · reverify entries: 28
```

No comments, valid strict JSON. Values that could not be verified cheaply
(`mutable.runtime.runningServices`, `activeRelease`, `databaseSchemaState`, `environmentVariables`,
and the `insite-hazlenz-verified-baseline-2026-08-19` tag target) are recorded as `null` and listed in
`reverify` rather than guessed.

## 2. Referenced file paths exist

All backtick-quoted repository/evidence paths in the blueprint were extracted and resolved against the
working tree (excluding `node_modules`, `.next`, `.git`, `dist`, `build`):

```
paths referenced: 125    resolved: 125    unresolved: 0
```

Includes every production module in the ownership map (§19), every cutover and release module, every
migration file named, and every phase artifact in the evidence index.

## 3. Package script names verified against `backend/package.json`

```
npm run <script> references in the blueprint: 46
unknown / invented script names:               0
```

Every command in §15 was read from `backend/package.json` (178 scripts at time of writing). No script
name was invented. Mutating commands are individually marked **MUT — OWNED DISPOSABLE DB REQUIRED**.

## 4. Migration names verified against the repository

```
migrations referenced: 1800000014000-ApprovalProvenanceContract   -> file present
KG migration chain 1800000010000 … 1800000014000                  -> all present
backend/src/database/migrations/*.ts                              -> 46 files
```

**No migration was applied to any database by this task.** The claim that the KG migrations are absent
from the original `safescope` development database is carried forward from prior slice evidence and is
listed under `reverify` — it was **not** re-probed here, because probing was unnecessary for a
documentation task.

## 5. HEAD / branch / status verified

| Check | Start | End |
|---|---|---|
| HEAD | `5f050858227ca11cf90d2f6bf64148e70a018b64` | **unchanged** |
| Branch | `release/insite-rc-2026-08-18` | **unchanged** |
| Stashes | 4 | **4 — untouched** |
| Tags | 23 | **23 — untouched** |
| Working-tree entries | 96 | 98 (+2 new `docs/` files; this artifact lands inside the already-untracked `verification/…/` tree, which git reports as one collapsed entry) |

## 6. No protected file was changed unintentionally

| Manifest | Result |
|---|---|
| `kg-3e/unrelated-worktree-changes.sha256` (unrelated work, 18 files) | **18/18 OK** |
| `kg-4b/kg4b-changed-files.sha256` (14 files) | **14/14 OK** |
| `kg-4a/kg4a-changed-files.sha256` (22 files) | 17/22 OK, **5 FAILED** — see below |
| Protected gold set `gold-set-script-v3.ts` | sha256 `93184abc…647cd3` — **matches**, unchanged |

The five KG-4A mismatches are `fallback-contract.ts`, `governed-resolution.ts`,
`governed-cutover-context.ts`, `safescope-v2.service.ts` and `backend/package.json`. These are exactly
the files **KG-4B intentionally changed** (the shadow comparator, the `customerVisible` fix, and +8
registered scripts), and all five are covered by the KG-4B manifest, which verifies **14/14 OK**. This
is expected KG-4A → KG-4B drift recorded in the KG-4B evidence, **not** damage from this task: no file
outside `docs/` and this artifact directory was written.

## 7. Contradiction scan

Cross-checked between the two new files and against the source artifacts:

* corpus figures — KG-3E `22/23` emitted-approved vs KG-3F `23/23`: both present, both explicitly
  labelled with their checkpoint, so the later value does not silently overwrite the earlier one;
* `bee47ebe…` (34-record clean seed) vs `14a34fea…` (35-record KG-4A/4B seed): both recorded with the
  seed they belong to;
* `test:kg3f-customer-path-disconnection` 9/9 is stated as passing **and** as architecturally
  superseded — recorded in three places (§12, §13.4, §20) with the same conclusion;
* MSHA-TRAFFIC-01 31/31 → 30/31 is stated once as an adjudicated correction and never as a regression;
* migration count (46), script count (178), tag count (23) and stash count (4) agree between the
  blueprint, the JSON and the live repository.

No contradiction found.

## 8. Stale-statement scan

Every drift-prone value carries a `MUST_REVERIFY` marker or sits under `mutable.*` in the JSON with a
matching `reverify` entry: HEAD, branch, upstream, working-tree entry count, stash count, tag count and
tag targets, migration count, package-script count, verification-root count, source-file line numbers
in §9, corpus counts, active release, manifest checksums, running services, environment variables, and
the "not applied to the SafeScope dev DB" claim.

Three statements were re-tagged during this scan: the 82 verification roots, the 178 package scripts,
and the "573 customer-path files" source scan (now scoped `VERIFIED_AT_CHECKPOINT` KG-4A).

Every measured score in §12 is presented under an explicit "`VERIFIED_AT_CHECKPOINT` — re-run the
command to claim it now" header rather than as a timeless property.

## 9. No secrets

Regex scan of both files for `password=`, `secret=<value>`, `api_key`, private-key headers and
credentialed Postgres URLs: **0 hits in each file**. Connection strings appear only as
`postgresql://$U@127.0.0.1:5432/test_*` shapes inherited from the reproduction docs, with no password
component; `JWT_SECRET=<32+ chars>` is a placeholder, never a value.

## 10. No customer PII

Email-address scan of both files: **0 tokens**. No customer names, observation text, inspection
content, account identifiers or user ids appear. Test account addresses from the reproduction docs
(`kg4a-a@example.com`, `kg4b-shadow@example.com`) were deliberately **not** carried into the blueprint.
Shadow telemetry is described as carrying content digests only, which is what the KG-4B privacy review
(14 markers, 0 found) established.

---

## Result

> ### `BLUEPRINT_SELF_VALIDATION_PASSED`

All ten checks pass. The one non-clean result (KG-4A manifest 17/22) is explained, expected, and
independently covered by the KG-4B manifest at 14/14.
