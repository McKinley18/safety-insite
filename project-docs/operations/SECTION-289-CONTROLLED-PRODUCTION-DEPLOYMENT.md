# §289 — CONTROLLED PRODUCTION DEPLOYMENT SEQUENCE

**Threshold A: the candidate running in production infrastructure, with no external beta users.**

This is the candidate-exact successor to
[`DEPLOYMENT-RUNBOOK.md`](DEPLOYMENT-RUNBOOK.md) (§268, updated at §269/§270). It is **additive**:
the §268 runbook is not rewritten, and everything in it that is still true is still true. This
document exists because three of its facts went stale when the candidate moved from
`0f36d497` to `94e29634`, and one of them was never right.

**Nothing in this document has been executed.** §289 prepared it. Executing it requires
product-owner authorization.

---

## What changed since the §268 runbook, and why this document exists

| §268/§269 runbook says | Actually true for this candidate | Consequence if not corrected |
|---|---|---|
| Migration backlog is **three**: `019000`, `020000`, `021000` | **Four.** `1800000022000 CorrectiveActionLifecycle` shipped with §287 | Step 5's pass condition would be met with a migration still pending |
| Expected schema version after migrating is **`1800000021000`** | **`1800000022000`** | Steps 5 and 8 would accept a schema the build does not support |
| Step 3: *"Render dashboard → the Postgres instance → Backups"* | **There is no Render Postgres instance.** Production is **Neon**, `us-east-1`, database `neondb` | The operator looks for a thing that does not exist, at the one step that is the only way back from a bad migration |
| Backups are *"Render-managed and external"*, `UNVERIFIED_LIVE` | The **platform** retention window is still unread. The **operator-controlled logical backup path is proven**, twice | The step reads as unachievable when it is in fact achievable today |

The third row is the serious one. `BACKUP-AND-RESTORE.md` and `ROLLBACK-MODEL.md` both name Render
as the database platform. Registered as `OPS-1`.

---

## Preconditions — all verified at §289, re-confirm before executing

| | precondition | §289 result |
|---|---|---|
| P1 | Candidate is committed and has an exact identity | `94e2963427c46b4d69dcdd8664c4754c5fc72c37` |
| P2 | Release build passes on that exact source | backend `tsc` clean; frontend `tsc --noEmit` clean; `next build` 25/25 pages |
| P3 | HazLenz identity and protected modules intact | successor `8c163b31…`, 29/29 modules, 0 evidence drift |
| P4 | Production migration head read, pending list classified | head `1800000018000`; 4 pending; **zero drift**; none destructive |
| P5 | Migrations rehearsed forward on a copy of production | 4/4 applied, 1 s, schema READY 54/54 |
| P6 | Rollback rehearsed backward on the same copy | 4/4 reverted, 1 s, **content restored exactly** |
| P7 | Fresh backup taken and restore verified by content checksum | 76/76 tables identical, digest `da17e9b7…` |
| P8 | Production object storage verified live, non-destructively | 12/12 checks PASS, 0 residue |
| P9 | Render deployment control established | `autoDeploy=no`, `autoDeployTrigger=off` |
| P10 | Vercel deployment control established | `gitProviderOptions.createDeployments=disabled` |
| P11 | Expert is off | `EXPERT_EXECUTION_ENABLED=false` |
| P12 | No backend secret is exposed to Vercel Preview | 4 variables, all public-prefixed |

**If any precondition fails at execution time, stop.** A failing precondition is a reason to stop
before spend, not a thing to repair on the way past.

---

## The sequence

Each step states the command, the pass condition, and — because that is the part that actually
matters — **what to do when it fails**.

### 0. Freeze

```bash
git rev-parse HEAD     # RELEASE_SHA — record it; every later step names this value
```

Nothing may be pushed to the deployed ref after this point until the release completes or is rolled
back.

**RELEASE_SHA for this release: `94e2963427c46b4d69dcdd8664c4754c5fc72c37`.**

### 1. Push the candidate  ← *requires product-owner authorization*

The candidate is **committed locally and not pushed**. `origin/beta/expert-hazlenz-validated-candidate-2026-09-12`
is still at `0f36d497`.

§289 deliberately did not push, for one reason: a push to this branch has previously produced a
Git-sourced Vercel **preview** deployment even with `createDeployments=disabled` (register `IN-2`).
A push is therefore not a purely local act.

**Pass condition:** `git ls-remote origin <ref>` reports `RELEASE_SHA`.
**On failure:** stop. Nothing downstream can proceed without a pushed SHA.

### 2. Re-verify the candidate gates against the pushed SHA

```bash
cd backend && npm run beta:readiness && npm run hazlenz:verify && npm run verify:274-successor-identity
cd ../frontend-next && npx tsc --noEmit && npm run check:release-contract-parity
```

**Pass condition:** all exit 0; `hazlenz:verify` reports 29/29 protected modules.
**On failure:** stop. Do not deploy a candidate whose identity does not verify.

### 3. Take a fresh production backup

```bash
PGD=/opt/homebrew/opt/libpq/bin/pg_dump          # 17-or-newer client REQUIRED
DIRECT=$(echo "$DATABASE_URL" | sed 's/-pooler//')   # direct Neon endpoint, not the pooler
"$PGD" "$DIRECT" -Fc -f release-backup-$(date -u +%Y%m%dT%H%M%SZ).dump
shasum -a 256 release-backup-*.dump               # record this
```

**Pass condition:** exit 0, dump written, sha256 recorded. §289 baseline: 14.4 s, ~7.8 MB.
**On failure:** **stop, and do not migrate.** This backup is the only path back from a bad
migration. A release without it is a release with no rollback for the one surface that cannot be
rolled back by redeploying.

### 4. Verify the backup

Restore it into a disposable PostgreSQL 17 target and compare **content**, not row counts, using the
collation-pinned checksum query in
[`../preservation/v1-beta/SAFETY-INSITE-V1-BETA-BUILD-AND-RESTORE-GUIDE.md`](../preservation/v1-beta/SAFETY-INSITE-V1-BETA-BUILD-AND-RESTORE-GUIDE.md#33-restoring-and-proving-the-restore-is-real)
§3.3.

**Pass condition:** every table's checksum matches production.
**On failure:** stop. An unverified backup is not a backup.

### 5. Run the approved migrations

```bash
cd backend
npm run migrate:prod:dry-run    # must report migrations PENDING
npm run migrate:prod            # applies, then verifies schema in the same command
```

**Approved set — exactly these four, in this order, and nothing else:**

`1800000019000` → `1800000020000` → `1800000021000` → `1800000022000`

**Pass condition:** output ends with `RELEASE MIGRATION OK`, `applied / expected 54/54`, expected
schema version `1800000022000`.

**On failure — MIGRATION FAILURE, see rollback §MF below.**

> **`outcomes` is not in this set and must not be added.** No migration creates it. Note that the
> table nonetheless already exists in production — see `DB-4` — but that is a fact to be resolved,
> not a reason to add a migration here.

### 6. Verify migration head and schema independently

```bash
npm run migrate:show:prod
```

**Pass condition:** nothing pending; head `1800000022000`.
**On failure:** stop before deploying. Step 5 did not take effect against the database this build
will actually use.

### 7. Deploy the exact backend SHA

Deploy `RELEASE_SHA` to `srv-d7kl74jeo5us73deaor0` — the specific commit, not "latest".

Set `BUILD_TIMESTAMP` on the service immediately before triggering, so `/health/version` reports
when the build was produced rather than the checked-in literal.

**Pass condition:** Render reports the deploy succeeded and names `RELEASE_SHA`.
**On failure — BACKEND FAILURE, §BF.**

### 8. Verify the running backend

```bash
npm run release:verify-sha -- --url=https://safescope-backend.onrender.com --expected=$RELEASE_SHA
curl -fsS https://safescope-backend.onrender.com/health/ready
```

**Pass condition:** `RUNNING SHA OK`; HTTP 200; `"status":"ready"`; `expectedSchemaVersion`
`1800000022000`; `buildTimestampSourceStatus` **not** `BUILD_FALLBACK`.

A 503 with `schema: behind` means step 5 did not reach this instance's database.
**On failure — BACKEND FAILURE, §BF.**

### 9. Deploy the exact frontend SHA

Deploy `RELEASE_SHA` to Vercel production, deliberately, through the production deployment path.
This step is also the first deliberate exercise of that path (`IN-2`): record what triggered it and
what it produced.

**Pass condition:** the production alias `https://safety-insite.vercel.app` resolves to a deployment
whose `gitSource.sha` is `RELEASE_SHA`.
**On failure — FRONTEND FAILURE, §FF.**

### 10. Verify frontend identity

Read the deployment's `meta.githubCommitSha` back from the Vercel API and confirm it equals
`RELEASE_SHA`. Do not infer it from the deploy log.

### 11. Verify frontend/backend compatibility

**Pass condition:** the frontend's version is ≥ the backend's `minimumSupportedFrontendVersion`
(`1.0.0`), and the version-skew banner does not fire on a fresh load.
**On failure — COMPATIBILITY FAILURE, §CF.**

### 12. Confirm Expert is still disabled

**Pass condition:** `EXPERT_EXECUTION_ENABLED=false` on the running service. This is a *check*, not
a change.

### 13. Non-provider production smoke

Register → log in → create a site → run an inspection → record an observation → complete → generate
a report → download it. No Expert analysis at any point.

**Pass condition:** every step succeeds and a report PDF downloads.

### 14. Verify storage through the product route

**Pass condition:** the report generated in step 13 is stored in `insite-production`, retrieved
through the authenticated route, and its checksum matches. This is the half of `ST-2` that
infrastructure verification cannot establish.
**On failure — STORAGE FAILURE, §SF.**

### 15. Verify authentication

**Pass condition:** register, log in, refresh, log out all succeed; a cross-tenant read answers
`404`; an unauthenticated read of a report is refused.
**On failure — AUTH FAILURE, §AF.**

### 16. Verify report generation and download

**Pass condition:** a regeneration after a material change produces a second revision; the first is
retained, byte-identical, still downloadable, and marked superseded.

> Note `D-046`: revision history is implemented on the server and **not reachable from the client**.
> Verify it through the API. Do not record a client-side absence as a server-side failure.
**On failure — REPORT FAILURE, §RF.**

### 17. Verify monitoring

**Pass condition:** an induced error-severity operational event is observable in the Render log
stream within one minute.

> This is *emission plus retrieval*, which is the honest ceiling today. There is no aggregation and
> no alerting; `MO-1` stays open, and passing this step does not close it.

### 18–20. Expert activation, provider smoke, production acceptance

**Out of scope for Threshold A and out of scope for this document.** Expert activation is a
product-owner decision (`HZ-2`); the bounded provider smoke is separately authorised and separately
budgeted; production acceptance is `PA-1` and is a Threshold **B** item.

---

## Rollback decision points

Reach for the narrowest lever that addresses the symptom. The ordering below is the order of
narrowness, not the order of preference.

### §MF — MIGRATION FAILURE

**Symptom:** step 5 exits non-zero; output says `MUST NOT be activated`.

Each migration runs in its own transaction, so **none is half-applied**. The schema is at whatever
the last successful migration left.

1. **Do not deploy.** The old code is still running and is still correct against the old schema.
2. Read `migrate:show:prod` to establish exactly which migrations did apply.
3. Prefer a **forward fix**. Restoring loses every write since step 3.
4. If the schema genuinely must go backward, restore the step-3 backup and accept the documented
   write loss — a product-owner decision, not an operational convenience.

**Do not run `down()` against production to recover.** §289 proved all four `down()` paths execute
cleanly *on a database with no Expert analyses and no settlements*. That is today's production
state; it will not be the state after the system is used, and `1800000019000`'s `down()` does not
self-enforce — it would drop `expert_analysis_executions` and four columns, destroying every Expert
analysis's provenance and cost accounting.

### §BF — BACKEND FAILURE

**Symptom:** step 7 fails, or step 8 does not report `RUNNING SHA OK` / `status: ready`.

1. Redeploy the previous backend commit `de655d2f6e4c0ff7b0de17f9ccfbd3668138a936`.
2. **Leave the schema forward.** It is additive and backward-compatible; `/health/ready` treats a
   database ahead of the build as READY by design.
3. Set `EXPERT_EXECUTION_ENABLED=false` at the same time if it was ever turned on — rolling back
   past §267 with `uq_hazlenz_analysis_current_by_producer` in place reintroduces the §266 P0-2
   selection defect for as long as the rollback lasts.

**Decision point:** if the backend cannot be made ready within the window, roll back rather than
iterate forward. A production with no users costs nothing to roll back and a great deal to leave
half-deployed.

### §FF — FRONTEND FAILURE

**Symptom:** step 9 or 10 fails.

Promote the previous production deployment (`dpl_GBe9WvS8rEu36xDKbmFUhXPDFdAB`, SHA `de655d2f`).
This is independent of the backend and touches no data. The new backend serving an older frontend is
a supported state as long as the older frontend is ≥ `minimumSupportedFrontendVersion`.

### §CF — COMPATIBILITY FAILURE

**Symptom:** step 11 fails — the deployed frontend is below the backend's minimum supported version,
or the skew banner fires persistently.

The two halves are deliberately not atomic, so this is a **recoverable ordering problem, not a
corruption**. Roll the *frontend* forward to `RELEASE_SHA` rather than rolling the backend back:
the backend is the half that has already migrated.

**If the frontend cannot be moved forward**, roll the backend back per §BF. Do not leave a client
population below the supported floor.

### §SF — STORAGE FAILURE

**Symptom:** step 14 fails — the report is not stored, not retrievable, or its checksum does not
match.

1. **Do not roll back the database.** Storage failure loses no relational data.
2. Distinguish the three causes before acting: wrong bucket (configuration), unauthorized
   credentials (secret), or an integrity mismatch (a genuine defect — a retrieved object whose
   sha256 does not match the recorded digest is *refused* by design, which is correct behaviour and
   a real signal).
3. An integrity mismatch is a **stop**. The other two are configuration fixes that do not require a
   rollback.

### §AF — AUTH FAILURE

**Symptom:** step 15 fails, in either direction.

A **cross-tenant read that succeeds** is the most serious failure in this entire sequence. It is not
a degraded state to be triaged — roll the backend back immediately per §BF and treat it as a defect
requiring its own section. Entitlement and tenant isolation are server-authoritative and are the
product's load-bearing guarantees.

A failure in the other direction (legitimate auth refused) is a normal rollback per §BF.

### §RF — REPORT FAILURE

**Symptom:** step 16 fails.

1. If a *revision was lost or overwritten* — stop and roll back per §BF. Report immutability is a
   compliance guarantee (`RR-2`), and a product that silently replaces a filed report is worse than
   one that refuses to generate.
2. If generation merely *fails* — no data is lost. Fix forward; this does not require a rollback.

**The distinction is whether an existing artifact changed, not whether a new one appeared.**

---

## What this sequence deliberately does not do

* It does not enable Expert HazLenz.
* It does not make a provider call or spend anything.
* It does not create or invite an external user.
* It does not claim legal clearance.
* It does not close Threshold B or Threshold C.

Even on a completely successful execution, **external beta remains BLOCKED.**
