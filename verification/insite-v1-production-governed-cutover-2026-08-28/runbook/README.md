# InSite v1.0 — production governed-cutover runbook

Prepared 2026-08-28. **Nothing in this directory has been executed against production by Claude.**
Every command below must be run by the product owner, in their own Terminal, in the shell that
holds the production `DATABASE_URL`.

## Credential boundary

The production `DATABASE_URL` is never pasted into the conversation, never written to disk and never
echoed. Load it once, in the Terminal you will run these steps from:

```bash
cd /Users/mckinley/Desktop/Safety_InSite
read -rs DATABASE_URL     # type/paste the URL; nothing is displayed; press Enter
export DATABASE_URL
```

`read -rs` keeps the value out of the shell history and off the screen.

### Why the exported variable is load-bearing, and why every step re-proves the target

`backend/src/database/data-source.ts` resolves the connection as `process.env.DATABASE_URL || DB_*`,
and every operator script starts with `import 'dotenv/config'`. dotenv does **not** override an
already-exported variable, so the exported production URL wins. But `backend/.env` **also defines
`DATABASE_URL`**, pointing at the local `safescope` development database — measured, not assumed:
with no export, the resolution probe returns `safescope`. If the export were missing, the *identical
command* would mutate the development database.

`lib-guard.sh` therefore resolves the target through exactly that mechanism (dotenv, then
`DATABASE_URL`) inside `BEGIN READ ONLY`, and **refuses every step** unless:

| assertion | required value |
|---|---|
| `current_database()` | `neondb` |
| latest migration | `InspectionKnowledgeReleaseBinding1800000018000` |
| migrations above `1800000015000` | exactly the three remediation migrations, in order |
| schema columns | `inspection.displayNumber`, `inspection.knowledgeReleaseId`, `inspection_findings.source` |

The ledger **row count is observed and reported, never asserted** — the production ledger is
baselined, so its row count is not the repository's migration position.

This guard was tested before hand-off: with no export it refuses, and pointed at the local
`safescope` database it refuses and names every failed assertion. It never printed the credential.

## The steps

Run them **one at a time**, reading the output, and stop at the first one that does not meet its
stated REQUIRED conditions. Tee each to the transcript directory:

```bash
cd verification/insite-v1-production-governed-cutover-2026-08-28/runbook
T=../transcripts

bash 00-target-proof.sh      2>&1 | tee $T/00-target-proof.txt
bash 01-pre-snapshot.sh      2>&1 | tee $T/01-pre-snapshot.txt
bash 02-materialize.sh       2>&1 | tee $T/02-materialize.txt
bash 03-replay-approvals.sh  2>&1 | tee $T/03-replay-approvals.txt
bash 04-validate.sh          2>&1 | tee $T/04-validate.txt
bash 05-activate.sh          2>&1 | tee $T/05-activate.txt
bash 06-post-proof.sh        2>&1 | tee $T/06-post-proof.txt
```

| step | phase | transition | writes |
|---|---|---|---|
| `00-target-proof.sh` | 2 | resolved-target proof | none |
| `01-pre-snapshot.sh` | 3 | production governance pre-state | none |
| `02-materialize.sh` | 4 | `release -- prepare` — 64 members, manifest `680540d9…` | release row + 64 snapshot records, one transaction |
| `03-replay-approvals.sh` | 5 | 64 × `review:release-record -- approve`, each with its preserved `--expected-checksum` | 64 append-only decision rows |
| `04-validate.sh` | 6 | status, approval checksum, `prepare --dry-run`, `activate --dry-run` | none |
| `05-activate.sh` | 7 | `release -- activate` | active-release pointer only |
| `06-post-proof.sh` | 8 | post-activation read-only proof | none |

**Steps 02 and 03 are separate on purpose.** `prepare` reproduces release *content*; it leaves all
64 records `mechanically_validated` and recreates no approval. Collapsing them is how a release gets
activated that nobody read — and activation is refused by the `governedRecordsPresent` gate with
zero approved members.

### If step 1 shows the release already exists

* **same id, same manifest `680540d9…`** — step 02 will report `idempotent_no_op`. That is the
  documented idempotent path; continue.
* **same id, different manifest** — **HARD STOP.** `prepare` refuses with `MANIFEST_WOULD_CHANGE`
  and writes nothing. Do not repair by editing production data. Report
  `HAZLENZ_PRODUCTION_GOVERNED_CUTOVER_BLOCKED — RELEASE_MATERIALIZATION_MISMATCH`.

### If step 1 shows an active release already exists

The runbook assumes the active pointer is `none`. If it is not, **stop and re-read the
authorization** rather than overriding. (`EXPECTED_CURRENT` exists only so a *deliberate*,
re-authorized value can be supplied: `EXPECTED_CURRENT=<id> bash 05-activate.sh`.)

## What this runbook does NOT do

No commit, push, tag, deploy, Render configuration change, `GOVERNED_CUTOVER_MODE` change,
allowlist change, provider/LLM call, Stripe work, migration, seed, historical inspection binding, or
`knowledgeReleaseId` back-fill. Activation moves the control-plane pointer only. Customers see
exactly what they saw before: mode and allowlist are independent, separately-authorized locks, and
both default to off.

## Credential cleanup (Phase 10)

```bash
unset DATABASE_URL
[ -z "${DATABASE_URL+x}" ] && echo "DATABASE_URL is absent"
```

The value is never printed.
