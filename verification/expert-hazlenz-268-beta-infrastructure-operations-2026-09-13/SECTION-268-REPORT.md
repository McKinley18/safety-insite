# §268 — BETA INFRASTRUCTURE AND OPERATIONS P0 CLOSURE

Migration safety · deployment control · observability · spend guards · kill switch

**Branch** `beta/expert-hazlenz-validated-candidate-2026-09-12` · **Base** `5c8ed095` (§267)
**Provider calls** 0 · **Production database operations** 0 · **Live configuration changes** 0
**Push / tag / deploy** 0

> **This terminal means the local engineering mechanisms exist. It does not mean production is
> ready.** Live infrastructure and the entire legal lane remain open, and are listed in §10.

---

## 1. The primary deployment safety rule

> It must be impossible for new application code to become active against the old database schema.

This is now enforced by **three independent mechanisms**, not one. That matters because the first
two are procedural and the third is not:

| # | mechanism | fails how |
|---|---|---|
| 1 | `npm run migrate:prod` runs as an explicit release step **before** activation | exits non-zero; `migrate && start` never reaches `start` |
| 2 | The runbook orders MIGRATE → VERIFY SCHEMA → DEPLOY, with autoDeploy disabled first | a human step, so it can be skipped |
| 3 | `/health/ready` **fails closed** when required migrations are absent | an instance that skipped 1 and 2 never becomes ready rather than silently serving broken reads |

§266 measured why the third matters: the `HazLenzAnalysis` entity declares five columns the
pre-`019000` schema lacks, TypeORM selects all of them, so **every** read of `hazlenz_analyses`
fails — including the core deterministic `finalizeFinding` path. The blast radius is the whole
product, not Expert.

---

## 2. The production migration command

### Why the existing one could not be used

```
"migration:run": "typeorm-ts-node-commonjs -d src/database/data-source.ts migration:run"
```

Needs `ts-node` (a devDependency; the image installs `--omit=dev`) and `src/` (the image copies
`dist`, `scripts` and four `src/safescope-v2` data directories — `src/database` is not among them).
The repository's only migration command could not run in the artifact that gets deployed.

### What replaced it

```
"migrate:prod": "node scripts/release/migrate.js"
```

| piece | why it is actually present in the image |
|---|---|
| plain `.js` in `scripts/` | `scripts/` is already `COPY`d; the current `CMD` already runs `scripts/render-start-diagnostic.js` from it |
| `dist/database/data-source.js` | `dist` is copied whole, and `data-source.ts` **already** resolves its own migrations glob by whether it is running as `.ts` or `.js` — so no change to it was needed |
| `typeorm` | a production **dependency** (`^0.3.31`), not a devDependency |

No `ts-node`, no `src/`, no devDependency, no interactive step. `migrationsRun` stays **false** —
explicit execution makes failure visible and separately auditable.

`--dry-run` reports what would apply and changes nothing. The command **verifies the schema in the
same step**, using `evaluateSchemaReadiness` — the same evaluator the running application serves at
`/health/ready`, so the release step and the runtime probe cannot disagree about what "current"
means.

### Measured on a never-migrated disposable database

| | |
|---|---|
| all three backlog migrations applied | `1800000019000` → `1800000020000` → `1800000021000`, in ascending order |
| post-migration verification | `schema verification READY`, in the same command |
| second invocation | clean no-op, exit 0 — a retried release is not an error and does not re-apply |
| failure (unreachable database) | **exit 1**, `MUST NOT be activated`, error not swallowed |
| `migrate && echo REACHED_APPLICATION_START` | **never reached** the second command |
| credentials in output | none — host and database name only |

---

## 3. Deployment ordering and autoDeploy

**Render autoDeploy is ON, and with it on *pushing IS deploying*** — there is no point in the
sequence at which migrations could run first. §268 changed **no live configuration** (it was
forbidden to), so this is a documented procedure, not a completed act.

`docs/operations/BETA_DEPLOYMENT_RUNBOOK.md`, steps in order:

```
PREPARE → FREEZE SHA → DISABLE AUTODEPLOY → BACKUP → RUN MIGRATIONS → VERIFY SCHEMA
→ DEPLOY EXACT SHA → VERIFY RUNNING SHA → VERIFY READINESS → VERIFY STORAGE → VERIFY AUTH
→ ONE EXPERT LIVE SMOKE → MONITOR → ROLLBACK / DISABLE EXPERT IF NEEDED
```

Three ways to get the ordering, in preference order: **disable autoDeploy** and run the migration
manually; **a pre-deploy hook** set to `npm run migrate:prod`; or `npm run start:release`
(`migrate && start` as the container command) — which is provided but is **only safe on a single
instance**, because every replica would otherwise race to migrate. That is why it is not the
default `CMD`.

**If autoDeploy cannot be disabled or controlled, the runbook says STOP and escalate.** It is a
blocker, not an inconvenience.

---

## 4. Schema readiness and running SHA

`/health/ready` previously answered a database-connectivity question, which cannot distinguish a
healthy deployment from one that raced ahead of its migrations. It now also compares the migrations
**shipped in this artifact** against TypeORM's `migrations` table.

Self-maintaining by construction: EXPECTED comes from the migration files in the artifact, resolved
the same way the datasource resolves them, so adding a migration adds an expectation with no second
list to forget. Comparison is on the numeric **timestamp**, not the class name — a rename does not
change which migration ran.

It fails closed in every direction it can: no `migrations` table → not ready; table unreadable →
not ready; **no migration files in the artifact → not ready, reported as a BUILD fault**, because
"expected: none" would otherwise make every database trivially ready — the check would pass loudest
exactly when it had lost the ability to check.

A schema **ahead** of the artifact is **READY**, deliberately: that is what a code rollback onto a
forward-migrated database looks like, and §6 depends on being able to do it.

`/health/live` is left alone, so "restart me" and "do not route to me" stay distinguishable.
`/health/schema` exposes the position alone for the runbook's VERIFY SCHEMA step.

**Running SHA.** `npm run release:verify-sha -- --url=… --expected=<sha>` compares the deployed
commit against the intended one. It **refuses an answer sourced from `BUILD_FALLBACK`** — the
checked-in `src/build-info.ts` literal that no build step stamps and which currently names a June
commit — because matching against it would confirm a coincidence. The Dockerfile now accepts
`--build-arg GIT_COMMIT`; Render supplies `RENDER_GIT_COMMIT` itself.

---

## 5. The Expert kill switch and the spend ceilings

### The distinction that is the whole design

`EXPERT_EXECUTION_ENABLED=false` disables **Expert execution**, not Safety InSite.

| disabled | still available |
|---|---|
| any Expert execution reaching a provider | the deterministic HazLenz workflow end to end |
| | reading existing Expert analyses under normal authority rules |
| | **settling** an analysis already awaiting confirmation |

Settlement stays available **deliberately**. Disabling it too would strand every analysis already
in `ANALYSIS_AWAITING_CONFIRMATION`: the reviewer could neither settle the classification nor
finalize the finding resting on it, and the inspection could not be completed. The switch exists to
stop spend and stop new advisory output; a human settling a conclusion the product **already
obtained** spends nothing.

**The production value must be explicit.** `validateProductionEnvironment` requires exactly `true`
or `false` and fails boot otherwise — the same posture `STORAGE_S3_BUCKET` already takes. "Nobody
set it" and "somebody decided it" must not produce the same running system for the one control an
operator reaches for in an emergency.

### The ceilings

Two, because each covers the other's blind spot. A **count** is knowable before the request runs
and does not depend on the provider reporting usage; a **cost ceiling** means what the business
cares about but is necessarily retrospective. Either can refuse.

Both count **started** executions, not completed ones — a failed or refused execution still spent
provider legs, and a ceiling that counted only successes would let a workspace spend without limit
as long as its analyses kept failing. Scoped by organization, falling back to the requesting user
for individual accounts (a null-scoped query would pool every individual account into one shared
ceiling).

### Measured

| | |
|---|---|
| Expert disabled → execution request | **503**, `EXPERT_EXECUTION_DISABLED`, `providerCallsMade: 0` |
| provider-entry delta | **0** |
| execution rows written | **0** — nothing falsely recorded as having run |
| deterministic workflow while disabled | analysis persists, review succeeds, **finding finalizes** |
| reading an existing Expert analysis while disabled | **200** |
| re-enabling | works with no redeploy |
| below ceiling (limit 2) | analyses 1 and 2 execute |
| at ceiling | 3rd refused **503**, `WORKSPACE_ANALYSIS_CEILING_REACHED`, provider-entry delta **0** |
| cost ceiling | refuses independently of the count, provider-entry delta **0** |
| scope | the other workspace is unaffected |

The gate runs **after** authorization and **before** `claimExecution`, so a refusal discloses
nothing to a caller who cannot reach the observation and writes nothing for one who can. The kill
switch is checked **first**, without reading usage at all, so an emergency disable works when the
usage accounting is the thing that is broken.

---

## 6. Provider-leg and cost accounting

### The §266 gap, and why the obvious fix was unavailable

`ExpertLegResponse` carries `{ ok, toolInput, failureKind, detail }` and drops usage, so the cost
columns on `expert_analysis_executions` were never populated. Adding a `usage` field to it is **not
available**: it is declared in `expert-hazlenz/expert-hazlenz-analysis.ts`, which is **element 5 of
the §259 candidate identity** (`entryPoint`, a sha256 of that file) — one character changes the
candidate. The other obvious place, `anthropic-expert-provider.ts`, is one of the **29 protected
modules**.

So usage travels **beside** the response. `ExpertLegUsageReporter` is a side channel declared on the
product seam; `HostedExpertSemanticTransport` — neither frozen nor protected — already parses the
provider's whole response envelope and now keeps `usage.input_tokens` / `output_tokens` instead of
discarding them. `take` semantics, not `get`: reading clears, so a stale reading cannot be
attributed to a later leg.

Recorded **before** the refusal branches, because a refused, truncated or structurally invalid
answer still cost money. Written in a `finally`, so usage is recorded on every path including the
ones that throw.

### One analysis is not one provider call

§255 measured an unconditional verifier leg. Both shapes are measured rather than assumed:

| fixture | legs | why |
|---|---|---|
| `A_ADMITTED_NO_CONFIRMATION` | **1** | admits with no unresolved declaration → verifier deliberately not reached (`NO_ADMITTED_DECLARATION`) |
| `B_ADMITTED_CONFIRMATION_REQUIRED` | **2** | carries an unresolved declaration → verifier leg runs |

Asserting a constant 2 would have been wrong in the other direction — it would fail on a
legitimately single-leg analysis.

**Cost is NULL locally, and that is correct.** A substituted transport reports no tokens; NULL means
"not measured", and a zero would make an unmeasured analysis look free to the cost ceiling. The
usage event carries `transportSubstituted: true` so a null cost in a local run is never mistaken for
a hosted call that reported nothing.

**Timeout and retry:** 180s per leg; **one attempt per leg, no automatic retry anywhere on the
product path**, so worst-case spend is bounded by the leg count rather than by a retry policy. A
human retry reuses the idempotency key and resolves to the execution that already ran.

---

## 7. Observability — stated honestly

**Seventeen** structured events on the closed `safety-insite.operational-event.v1` vocabulary,
covering the whole §268 minimum set: execution started / admitted / refused / unresolved / failed,
provider transport and verifier failure, usage recorded, kill-switch and spend-limit refusals,
request-version conflicts, confirmation required and settled, storage and report failures, and
schema-readiness and migration failures.

**Redaction is by construction, not by review.** `emit` does not accept arbitrary objects: values
are coerced to bounded scalars, any key whose **name** looks credential- or content-bearing is
dropped, nested objects are reduced to a shape description, and long strings are truncated. Passing
an observation to the emitter does not log the observation. Measured: no raw provider output, no
observation text, no credential, no reviewer prose in any emitted event.

> **This is the EMISSION layer, and §268 forbids calling it monitoring.** Nothing collects, retains,
> alerts on or routes these events. There is still no error-monitoring or structured-logging
> dependency in either workspace — **checked, not assumed**. Every candidate destination (Sentry,
> Datadog, Better Stack, Render's own stream) ingests structured stdout, so emitting the canonical
> shape first and choosing a destination second is the order that does not have to be undone. But
> `NO_ERROR_MONITORING` **remains a P0**, and its closure proof is unchanged: an induced failure
> appears in a monitoring surface within one minute.

---

## 8. Rollback

`docs/operations/ROLLBACK_MODEL.md`. Governing rule:

> A database rollback must never destroy human settlements or Expert analyses in order to restore
> older application code.

The supported path is **application rollback onto a forward-migrated schema** — all three backlog
migrations are additive and backward-compatible with the previous application version, which is
exactly why `/health/ready` treats an ahead-of-build schema as READY.

**Production rollback is NOT "run every DOWN."** All three are forward-only once real beta data
exists, and **two of the three enforce it themselves**: `1800000020000` already refuses when
settlements exist (§264 built that in), and `1800000021000` cannot recreate the stricter
single-current index on any observation carrying both a current deterministic and a current Expert
analysis — the normal state after any Expert run. `1800000019000` does **not** self-enforce; its
`DOWN` would destroy every execution record and Expert provenance column and must never be run
against a database that has served beta traffic.

**One caveat, recorded rather than glossed:** rolling application code back past §267 while
`1800000021000` remains applied reintroduces the §266 P0-2 selection defect for the duration,
because the relaxed index lets the old query find two current rows. Set
`EXPERT_EXECUTION_ENABLED=false` at the same time if that is ever done.

---

## 9. Build-context hygiene and the mutation registry

**`.dockerignore` did not exist** while the Dockerfile does `COPY . .`. A real `backend/.env`
(DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY) **and** a `.env.backup-before-clean-db-*` were both
present on disk when §268 checked — so this was live, not theoretical. The runtime stage copies
little, but the **build stage layer** still contained them and layers are part of image history.

`npm run release:check-build-context` evaluates the rules using Docker's own matching semantics
(per-segment `filepath.Match`, `**` spanning segments, last-matching-rule-wins) **without needing a
daemon**, so it runs in `hazlenz:test` on any machine. It asserts in **both directions** — secrets
excluded, and the files the build and runtime need still included.

**The guard caught a real hole in the first draft of the rules:** Docker anchors patterns at the
context root, so a bare `*.pem` excludes `private.pem` and **not** `tls/private.pem`. Every secret
pattern is now written twice, anchored and `**/`-prefixed. It checks the RULES, exactly; a real
`docker build` against a daemon remains a separate live step.

**Mutation registry** regenerated: **1049** scripts (was 1005). `test-265` is now correctly
`WRITES_HISTORICAL_OUTPUT` / sandbox-required and listed under `writesAcceptedHistoricalEvidence`.
Two minimal classifier extensions were needed, each closing a case where the registry was
structurally unable to see or label a real mutator:

1. it scanned `.ts` only, so the §268 release scripts — plain JavaScript precisely so they run in
   the production image without `ts-node` — were invisible, **including the one that migrates
   production schema**;
2. its database-mutation pattern recognised only the CLI form `migration:run`, so
   `scripts/release/migrate.js` was classified `READ_ONLY`. It now also recognises `runMigrations`
   and `undoLastMigration`, and is correctly `MUTATES_DATABASE`.

**Mutation safety rule satisfied:** all three evidence-writing suites (§265, §267, §268) now route
writes through one shared gate, `scripts/lib/evidence-write-gate.ts`, off unless
`HAZLENZ_WRITE_EVIDENCE=1`. This generalises §267's suite-specific variable — three conventions for
one rule is how the rule gets forgotten. **No assertion is gated**; only the side effect of
overwriting an accepted package.

---

## 10. What §268 did NOT close

| | status |
|---|---|
| Disable autoDeploy; run the production migrations | **live act, forbidden here** — `NO_PRODUCTION_MIGRATION_MECHANISM` stays P0 until done |
| Object storage provisioning + one report round-trip | **P0**, `REPORT_GENERATION_BLOCKED` |
| Error-monitoring **ingestion** | **P0**, `NO_ERROR_MONITORING` — emission exists, collection does not |
| Terms, Privacy Notice, third-party model disclosure | **P0 ×2**, untouched by design |
| Push the candidate | **P0**, dependency now satisfiable |
| Backups enabled + one rehearsed restore | `UNVERIFIED_LIVE` — the verification is now *defined* in the rollback model |
| Provider credential validity | `UNVERIFIED_LIVE` — only the variable name and boot behaviour were checked; no secret value was read |
| The one Expert live smoke | **not run.** Design preserved: 1 analysis, ≤2 provider legs, ≤ USD 0.50 |

**Remaining beta P0 count: 6** (was 7 at §267; `NO_SPEND_CEILING_OR_KILL_SWITCH` closed).

**Entitlement UX P2** (`EntitlementGuard` returns 402 while `expertApi.ts` maps only 403) carried
forward unchanged — authorization itself is correct, and the infrastructure work did not require
touching it.

---

## 11. Candidate integrity

| | |
|---|---|
| §259 identity before | `0b12adf6e44e4586ec2be27c5274dafd8a36b2c1042dfe34d543b51d5be70bee` |
| §259 identity after | `0b12adf6e44e4586ec2be27c5274dafd8a36b2c1042dfe34d543b51d5be70bee` |
| protected modules | 29/29 unchanged |
| Expert semantic changes | 0 — no prompt, wire-schema, admission, projection, verifier or driver-role change |

The usage side channel exists precisely so that carrying cost data back did **not** require editing
`expert-hazlenz-analysis.ts` (identity element 5) or `anthropic-expert-provider.ts` (protected).
