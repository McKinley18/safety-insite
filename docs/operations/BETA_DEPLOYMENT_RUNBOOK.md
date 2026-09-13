# BETA DEPLOYMENT RUNBOOK — Safety InSite v1.0

Established at **§268**. **This runbook has never been executed.** It is the ordered procedure that
must be followed for the first controlled-beta deployment, not a record of one.

Every step is either a command you run or a check with a stated pass condition. A step that does not
pass **stops the release**. There is no step whose failure is acceptable to continue past.

> **The rule this whole document exists to enforce:** it must be impossible for new application code
> to become active against the old database schema. §266 measured what that state does — the
> `HazLenzAnalysis` entity declares five columns the pre-019000 schema lacks, TypeORM selects all of
> them, so **every** read of `hazlenz_analyses` fails, including the core deterministic
> `finalizeFinding` path. The failure is not confined to Expert.

---

## §269 UPDATE — WHAT IS ALREADY CLOSED, AND WHAT §269 ADDED

§269 executed the live-infrastructure lane against production without deploying anything. It changed
the starting state of this runbook. Read this before step 0.

**Already closed by §269 — do not repeat, only confirm unchanged:**

| runbook step | §269 result |
|---|---|
| 2 — deployment control | **CLOSED.** Render `autoDeploy=no`, `autoDeployTrigger=off` on `srv-d7kl74jeo5us73deaor0`. Verified that a production env-var change did **not** trigger a deploy. Vercel Git auto-deploy also disabled (`gitProviderOptions.createDeployments=disabled`) |
| 3 — back up and verify | **CLOSED.** Full logical backup of production taken and a restore rehearsed into a disposable database: 76/76 tables, 7049/7049 rows, zero differences |
| 9 — verify storage | **INFRASTRUCTURE CLOSED.** R2 bucket `insite-production` verified live: upload, authorised download with checksum match, delete, no residue, unsigned access refused, no public policy. The *product-route* round-trip in step 9 still stands |
| 4/5 — migrate and verify | **MECHANISM PROVEN, NOT RUN.** `migrate:prod --dry-run` executed against production: reached the database and correctly reported migrations pending. Production remains at `1800000018000` with `019000/020000/021000` all absent |

**The four steps §269 flagged were CLOSED at §270 — confirm, do not repeat:**

| §269 flagged | §270 result |
|---|---|
| `ANTHROPIC_API_KEY` absent | **CONFIGURED.** Validated non-semantically against `GET /v1/models` (lists models, invokes none, bills nothing): credential valid, `claude-sonnet-5` available |
| `healthCheckPath` empty | **SET to `/health/ready`.** Verified on the service record and exercised by a restart |
| `ENABLE_MAINTENANCE_SEED=true` | **SET to `false`**, after confirming the knowledge base is fully seeded (2274 chunks, 138 documents, 2390 standards, 0 empty, 0 orphaned, newest document 2026-05-24). Applied to the running process by a same-SHA restart |
| `EXPERT_EXECUTION_ENABLED=false` | **UNCHANGED — still `false`**, and must stay false until step 11 |

**Also closed at §270:** the billing redirect defect, and the stale `buildTimestamp`.

---

### §270 — BUILD TIMESTAMP IS NOW A RELEASE STEP

`getBuildMetadata()` now resolves `buildTimestamp` from `BUILD_TIMESTAMP` →
`RENDER_BUILD_TIMESTAMP` → `VERCEL_DEPLOYMENT_CREATED_AT` → `SOURCE_DATE_EPOCH` → the checked-in
literal, and reports which source answered in a new `buildTimestampSourceStatus` field. A malformed
value is rejected rather than echoed onto the health endpoint.

`build:render` is bare `tsc` and Render supplies no build-time timestamp, so §270 took the third of
the three options §270 permitted — injection by the release process rather than a stamping build
step, because changing the build pipeline immediately before a first release is the riskier trade.

**Add to step 6 below**, immediately before the deployment is triggered:

```bash
# Set BUILD_TIMESTAMP on the service first, so /health/version reports when this build was
# actually produced rather than falling back to the checked-in literal.
BUILD_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
```

**Forgetting this is now safe.** It no longer produces a confident wrong date — it produces
`buildTimestampSourceStatus: "BUILD_FALLBACK"`, which says on its face that the timestamp is not a
stamp. That visibility is the actual fix; the injection is the convenience.

**Add to step 7 below:** confirm `/health/version` reports
`buildTimestampSourceStatus: "BUILD_TIMESTAMP"` and a timestamp within minutes of the deploy. If it
reports `BUILD_FALLBACK`, the injection was missed — not a release stopper, but fix it before the
next one.

> **A note on why this section never names the later step titles literally.** `beta:readiness`
> asserts the runbook's ordering by first occurrence of each step title, and that ordering — migrate
> and verify schema BEFORE deploy — is the whole safety property this document exists to enforce.
> A preamble that quoted the later titles would move their first occurrence above the migration
> steps and break the check. The check is right; the prose defers to it.

---

## 0. PREPARE

| | |
|---|---|
| Migration backlog | `1800000019000`, `1800000020000`, `1800000021000` — all three **unapplied** (re-confirmed live at §269) |
| Expected schema version after migrating | `1800000021000` |
| Render `autoDeploy` | **OFF as of §269** — step 2 is already satisfied; confirm, do not re-do |
| Running production SHA | `de655d2f6e4c0ff7b0de17f9ccfbd3668138a936` (= `origin/main`), deployed manually 2026-08-29 |

```bash
cd backend
npm run beta:readiness          # every local gate, no live contact
npm run hazlenz:precommit       # full verification tier
```

**Pass condition:** both exit 0.

---

## 1. FREEZE THE SHA

```bash
git rev-parse HEAD              # record this value; it is RELEASE_SHA for every later step
```

Nothing may be pushed to the deployed branch after this point until the release completes or is
rolled back.

---

## 2. DISABLE AUTODEPLOY / ESTABLISH DEPLOYMENT CONTROL

**Do this before the push, not after.** With `autoDeploy` ON, *pushing IS deploying* — the code
would go live before step 5 runs, which is exactly the unsafe ordering this runbook prevents.

In the Render dashboard, for the backend service: **Settings → Build & Deploy → Auto-Deploy → No**.

**Pass condition:** the service shows Auto-Deploy disabled.

> **If Auto-Deploy cannot be disabled or otherwise controlled, STOP.** That is a blocker, not an
> inconvenience: without it there is no point in the sequence at which migrations can run before
> code activates. Escalate to the product owner rather than proceeding.

The alternative, if the platform offers a pre-deploy hook, is to set the pre-deploy command to
`npm run migrate:prod` and leave autoDeploy on. That achieves the same ordering *inside* the
platform. `npm run start:release` (migrate `&&` start as the container command) is a third option
and is **only** safe on a single-instance service — on multiple replicas every instance would race
to migrate.

---

## 3. BACK UP AND VERIFY THE DATABASE

```
Render dashboard → the Postgres instance → Backups → confirm a recent backup exists
Trigger a manual backup and record its identifier.
```

**Pass condition:** a backup exists, taken *after* the last write you care about, and you have
written down how to restore it. See `docs/operations/ROLLBACK_MODEL.md`.

> This is the step with no code behind it. §268 could not provision backups and did not pretend to;
> `BACKUPS_AND_RETENTION` remains `UNVERIFIED_LIVE` in the beta register until this is confirmed
> against the live platform once.

---

## 4. RUN MIGRATIONS

Against the production database, from the built artifact, **before** any new code serves traffic.

```bash
npm run migrate:prod:dry-run    # reports what WOULD apply; changes nothing
npm run migrate:prod            # applies, then verifies schema in the same command
```

**Pass condition:** exit 0 and the output ends with `RELEASE MIGRATION OK`.

**On failure:** the command exits non-zero and prints `MUST NOT be activated`. Each migration runs
in its own transaction, so none is half-applied. **Stop.** Do not deploy. Diagnose, then either fix
forward or restore the step-3 backup.

---

## 5. VERIFY SCHEMA

`npm run migrate:prod` already verifies, using the same evaluation the running application serves.
Confirm independently:

```bash
npm run migrate:show:prod
```

**Pass condition:** no migration is listed as pending; expected schema version is `1800000021000`.

---

## 6. DEPLOY THE EXACT SHA

Deploy `RELEASE_SHA` from step 1 — the specific commit, chosen deliberately, not "latest".

**Pass condition:** the platform reports the deploy succeeded and names `RELEASE_SHA`.

---

## 7. VERIFY THE RUNNING SHA

```bash
npm run release:verify-sha -- --url=https://<backend-host> --expected=<RELEASE_SHA>
```

**Pass condition:** `RUNNING SHA OK`.

This refuses an answer sourced from `BUILD_FALLBACK`, because that value is a checked-in literal
that no build step stamps — matching against it would confirm a coincidence. If it refuses on those
grounds, stamp `GIT_COMMIT` (`docker build --build-arg GIT_COMMIT=$(git rev-parse HEAD)`) or rely on
Render's own `RENDER_GIT_COMMIT`, and re-verify.

---

## 8. VERIFY READINESS

```bash
curl -fsS https://<backend-host>/health/ready
curl -fsS https://<backend-host>/health/schema
```

**Pass condition:** HTTP 200, `"status":"ready"`, `"schema":"current"`,
`expectedSchemaVersion` = `1800000021000`.

A 503 with `"schema":"behind"` means step 4 did not take effect against the database this instance
is actually using. **Stop and reconcile before sending any traffic.**

---

## 9. VERIFY STORAGE

```bash
# One upload and one download round-trip through the product, as the app's own user.
```

**Pass condition:** an inspection report generates and downloads.

> Production **cannot boot** without `STORAGE_S3_BUCKET`, so a running instance implies a bucket is
> configured. It does not imply the bucket is the right one, writable, or private. This step is what
> establishes that, and `REPORT_GENERATION_BLOCKED` stays open until it passes once.

---

## 10. VERIFY AUTH

**Pass condition:** register, log in, refresh, and log out all succeed against the deployed
frontend; a cross-tenant read answers `404`.

---

## 11. RUN ONE EXPERT LIVE SMOKE

**This is the only authorized provider spend, and it is authorized separately from this runbook.**

Preserved from the §266 design, unchanged:

| | |
|---|---|
| Scope | **ONE** user-initiated analysis |
| Provider legs | maximum **2** (authoring + verifier) |
| Spend ceiling | **USD 0.50** |
| Acceptable transport outcomes | `ADMIT`, `REFUSE`, `PRESERVE_UNRESOLVED` — provided the complete deployed path behaves correctly |

Before initiating it, set the beta ceilings so the platform itself bounds the run:

```
EXPERT_EXECUTION_ENABLED=true
EXPERT_DAILY_ANALYSIS_LIMIT_PER_WORKSPACE=1
EXPERT_DAILY_COST_LIMIT_USD_PER_WORKSPACE=0.50
```

**Pass condition:** the analysis reaches a persisted outcome; `expert_analysis_executions` records
two provider legs with non-null token counts and a non-null `costUsd`; the emitted
`expert.provider.usage_recorded` event carries `transportSubstituted: false`.

> A non-null `costUsd` here is also the first live confirmation that the §268 usage side-channel
> works against the real provider. Locally it is necessarily null, because a substituted transport
> reports no tokens.

---

## 12. MONITOR

Watch for the first hour. The events to watch, all on the
`safety-insite.operational-event.v1` schema:

| event | means |
|---|---|
| `expert.execution.failed` | provider or transport problem |
| `expert.provider.transport_failure` | the provider was not reachable |
| `expert.control.spend_limit_refused` | a workspace hit its ceiling |
| `expert.confirmation.required` | an analysis is waiting on a human — watch the age of this queue |
| `schema.readiness_failed` | an instance is serving against the wrong schema |
| `report.generation_failed` / `storage.operation_failed` | storage problems |

> **These are emitted, not collected.** Until a log drain or error reporter is provisioned, watching
> means reading the platform's log stream. `NO_ERROR_MONITORING` stays open until an induced failure
> is observed arriving in a monitoring surface within one minute.

---

## 13. ROLLBACK OR DISABLE EXPERT IF NEEDED

Two independent levers. **Reach for the first one first** — it is narrower, faster, and costs
nothing:

**A. Disable Expert only** (seconds, no redeploy, no data change):

```
EXPERT_EXECUTION_ENABLED=false
```

Expert execution is refused before the provider seam; the deterministic HazLenz workflow, existing
Expert analyses, and settlement of analyses already awaiting confirmation all keep working.

**B. Roll back the application** — see `docs/operations/ROLLBACK_MODEL.md`. **Do not roll back the
database to do it.** The schema is forward-compatible with the previous application version, and the
migration `DOWN` paths are forward-only in practice once real beta data exists.
