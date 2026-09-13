# EXPERT HAZLENZ — CURRENT STATE

**Read this and `HAZLENZ_INVARIANTS.md`. That is the default context.** Together about 2,500 words.
Machine-readable equivalent: `verification/current/EXPERT-HAZLENZ-STATE.json`.

Refreshed at **§269** (2026-09-13). Supersedes the §229 text, which described a layer with no
production caller — that has not been true since §246.

Everything below is **current truth only**. It is not a history. Evidence pointers are at the end.

---

## 1. What Expert HazLenz is

A second, semantic analysis layer that runs **alongside** deterministic HazLenz on one observation.
It may propose hazards, required controls and an immediate safety posture the deterministic engine
did not reach, and it may declare that a decision-critical fact is unresolved.

It is **advisory**. Deterministic HazLenz remains the customer-authoritative analysis path.

## 2. Current candidate

| | |
|---|---|
| identity | `0b12adf6e44e4586ec2be27c5274dafd8a36b2c1042dfe34d543b51d5be70bee` |
| label | §259 successor |
| contract | `hazlenz.expert.first-pass.259` |
| protected modules | 29 |
| verify it | `npm run hazlenz:verify` |

The identity is a digest over 22 elements. `hazlenz:verify` recomputes all of them from live source
and writes nothing.

## 3. Product integration status

**Implemented and reachable, behind the strongest authorization profile in the product.**

```
POST /inspections/observations/:id/expert-analyses                          execute
POST /inspections/observations/:id/expert-analyses/:analysisId/settlement   confirm or override
GET  /inspections/observations/:id/expert-analyses/current                  read state   §265

all three: JwtGuard · EntitlementGuard('fullSafeScope') · RolesGuard · Throttle
```

The read carries the same profile as the two writes deliberately — a read of a safety analysis is
not a lesser act than producing one — and it writes nothing, so refreshing an interface cannot
spend. It exists because a browser holds nothing after a reload: without it the only ways to learn
an analysis's state are to re-execute it or to keep believing a cached copy.

The settlement route serves confirm and override as **one** action with two outcomes: one
eligibility rule, one concurrency guarantee, one audit path, one state-machine edge.

- The server runs the deterministic analysis itself and builds the Expert input from it.
- The client may send only `idempotencyKey` and optional `requestVersion`, `taskContext` and
  `answeredClarifications`. **No server-owned field is declarable**, so the DTO plus the global
  `whitelist + forbidNonWhitelisted` pipe rejects any attempt with 400.
- **§267: the shipped client sends no `requestVersion` and the server derives it.** The execution
  ordinal is allocated in `claimExecution`, under the `hazlenz-analysis:<observationId>` advisory
  lock, from the highest ordinal already reserved across `hazlenz_analyses` **and**
  `expert_analysis_executions` — the second table being what holds an ordinal for the length of a
  provider call. A version a client *does* send is adjudicated rather than obeyed: equal to the
  allocation it is accepted as agreement; stale or invented it is refused **409 before the
  transport is reachable**, with a provider-entry count of zero. §265 hardcoded `1`, which the
  deterministic analysis already owned, so every real Expert run spent a leg and then collided.
- An execution row is written in `ANALYSIS_RUNNING` **before** any provider contact.
- The result is persisted with `producer = server_authored`, protected by a database CHECK
  constraint requiring a real execution row.

Source: `backend/src/safescope-v2/expert-hazlenz-product/`.

## 4. What is proven

| property | evidence |
|---|---|
| the stored server-authored analysis is what the server obtained from the frozen path | §262 |
| a client cannot author the result, in 10 attempted field forgeries or in raw SQL | §262 |
| 3 concurrent duplicates → 1 execution, 1 spender, 1 provider entry, 1 analysis | §262 case I |
| a refusal is never rendered as an available analysis | §262 case E |
| a provider failure creates no analysis row at all | §262 |
| `declarationId`, `controlId`, `dischargingControlRef`, `resolvedByDeclarationIds` survive persistence and the response | §262 H3/H4 |
| a cross-workspace caller cannot learn whether the observation exists | §262 case H, §263 |
| the transmitted system prompt is bound to the frozen candidate before attribution | §262 |
| a reviewer can confirm a pending classification, and the Expert result stays byte-identical | §264 case C |
| a reviewer can replace it, and the human value becomes authoritative while the proposal is preserved | §264 case D |
| two co-authorized reviewers racing one pending analysis produce exactly one settlement | §264 N13 |
| a retry creates no duplicate review or audit row | §264 C-13 |
| a settled state cannot be minted without a real review row | `ck_hazlenz_analysis_settlement` |
| the browser withholds an unsettled conclusion, and fails closed with no derivation at all | §265 case K |
| a finding cannot be finalized from an unsettled Expert analysis — 0 findings, 0 corrective actions | §265 case L |
| the same review finalizes once a person settles it | §265 case M |
| an override is consumed as the human value, never the Expert proposal | §265 case N |

## 5. What is deliberately not proven

- **Governed citation: not exercised at all.** Every execution transmits zero governed records, so
  Expert may cite nothing. Fail-closed on purpose — the only available source of approved regulatory
  text was the client-supplied snapshot, and accepting that would let a request inject text labelled
  as governed.
- **The frontend against a deployed instance:** §265 built the workflow and proved it against the
  local stack over real HTTP with a substituted transport. No deployed instance has served it.
- **Downstream activation beyond one consumer.** §265 activated **finding finalization** and
  nothing else. The other five consumers §260 section 11 names — completion readiness,
  corrective-action creation, report finalization and export, notifications, the executive summary
  — are **contained** rather than guarded: they reach an Expert conclusion only through a finalized
  finding today, and a future feature that reads an analysis directly would bypass that. A settled
  analysis still reconciles **zero** findings; the guard **refuses**, it does not create.
- **Reviewer revision of a settled analysis.** Not built. One settlement per analysis, carried as a
  deferred product decision rather than as a claim that the decision is permanently irreversible.
- **Live provider transport from a deployed instance:** never spent.
- **Report generation:** blocked, no object storage configured.

## 6. Accepted v1.0 limitations

1. **Driver-role classification.** The model decides whether an unresolved fact controls
   continuation or is routine follow-up, and §254 saw it err toward over-restriction. The product
   does not rely on that being right — see section 7.
2. **The deterministic basis is computed twice.** The route runs its own deterministic analysis for
   Expert's premises; the inspector is looking at a separately persisted one. That is what makes the
   premises server-owned, and the two may diverge.
3. **`ANALYSIS_UNRESOLVED` covers two shapes** — a contained declaration refusal with an admitted
   posture, and a whole-output refusal with preserved truth — because §252 gives
   `PRESERVE_UNRESOLVED` precedence deliberately. The execution record distinguishes them.

## 7. The human-confirmation rule

Deterministic, computed once at persistence time, stored, never recomputed on read. It runs **only**
on an admitted analysis.

> Confirmation is REQUIRED when the admitted posture's `requiredBy` contains **either**
> (a) a `driverRole` of `UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION`, **or**
> (b) a `driverRole` of `UNRESOLVED_RESPONSE_OR_FOLLOW_UP` while the posture permits continued work.

Branch (a) catches over-restriction, the direction §254 observed. Branch (b) catches
under-restriction, which was never observed and is the dangerous direction. **Neither may be
dropped.** An unreadable posture fails closed.

## 8. Current trust boundary

| path | what the server knows |
|---|---|
| deterministic | the client calls `/safescope-v2/classify`, holds the result, posts it back. The server does **not** establish that what it stores equals what it returned. Every historical row is `client_supplied`. |
| Expert | the server ran it. `server_authored` is assigned from a literal in one service and cannot be conferred by metadata. |

## 9. Analysis states and the human boundary

All eight states are reachable as of §264.

```
ANALYSIS_AWAITING_CONFIRMATION --confirm--> ANALYSIS_CONFIRMED
                               --change---> ANALYSIS_OVERRIDDEN
```

A reviewer settles the **named classification entries** the rule fired on, keyed by `refKind:ref`,
answering in a two-member closed vocabulary: `CONTROLS_WHETHER_WORK_CONTINUES` or
`DOES_NOT_CONTROL_WHETHER_WORK_CONTINUES`. They do not re-author the analysis, and hazard
identification, citations, control text, declarations, raw output and provenance are **not
addressable** by the action.

The human decision lives in `human_reviews` under two new decision values. The Expert result is
**never rewritten** by settlement: `resultSnapshot` still holds exactly what the server obtained, so
the proposal and the decision remain separately attributable.

**No finding is reconciled from any Expert analysis**, settled or not. The API says so explicitly
(`findingsReconciled: false`). §265 did not change that. What it added is the opposite act: a
finding that cites a server-authored Expert analysis cannot be **finalized** unless that analysis
carries a settled conclusion.

## 9b. The effective decision — ask this, do not reconstruct it

`ExpertAnalysisService.effectiveDecisionFor(analysis)` is the one derivation of whether an analysis
carries a settled operational conclusion. It is total over the state vocabulary with no default
branch, and it distinguishes five different reasons for *no* conclusion — awaiting a human, refused,
refused with truth preserved, unavailable, still running — so a consumer can never flatten them into
"no hazards".

Downstream features must consume it rather than reading `analysisState` themselves.

§265 moved the derivation and its one settlement lookup into `ExpertEffectiveDecisionService`, in a
leaf module that imports two repositories and nothing else. The reason is structural: the first real
consumer is `InspectionService.finalizeFinding`, and the Expert product module already imports
`InspectionModule` — leaving the derivation there would have forced the consumer to re-derive
authority locally to escape the cycle, which is the exact failure the function exists to prevent.
There is still one implementation; it is now reachable from both sides.

## 10. Known environmental and live gaps

**Amended at §269, which contacted the live environment for the first time.** Four of these were
unverified only because no section had looked.

| gap | status |
|---|---|
| object storage / report generation | **RESOLVED §269.** Cloudflare R2, bucket `insite-production`, verified live: upload, authorised download with sha256 match, unsigned GET and LIST refused, no public policy, delete, zero residue. The bucket already holds `evidence/` and `report/` objects |
| running production SHA | **RESOLVED §269.** `de655d2f6e4c0ff7b0de17f9ccfbd3668138a936`, = `origin/main`, `versionSourceStatus: RENDER_GIT_COMMIT`. The mechanism was already deployed |
| production instance plan | **RESOLVED §269, SUPERSEDED §272.** §269 measured the Render **free** plan, 1 instance, oregon: cold start 39.8 s → 503, then 5.2 s. §272: the plan was changed in the Render Dashboard to the smallest paid compute plan, **`0.5c-512mb`**, still 1 instance, still oregon. The change auto-triggered deploy `dep-dajckf3m8hqs73fp3u90` (trigger `service_updated`) on the **same artifact** — SHA still `de655d2f6e4c0ff7b0de17f9ccfbd3668138a936`, no new code. Re-measured `/health/ready`: **41.8 s cold on free immediately before the change, 0.27 s / 0.22 s / 0.23 s after**. Paid instances do not spin down, so the free-tier sleeping / cold-start blocker is **CLOSED**. Not a beta-release authorization |
| error-monitoring ingestion | **RESOLVED §269.** Render ingests and indexes; verified by inducing a production request and retrieving it by exact path |
| live provider transport | UNVERIFIED LIVE. **§270 superseded the credential half:** `ANTHROPIC_API_KEY` is now **set in production** and was validated against the provider model-list endpoint, which invokes no model and bills nothing. The transport itself is still unexercised, because no §272 command calls a provider |
| live billing | UNVERIFIED LIVE |

`hazlenz:verify` reports the remaining two as their own outcomes. They are never converted into a
pass or a failure. Note that `hazlenz:verify` still prints `ENVIRONMENTALLY_BLOCKED` for storage
because it reads the *local* environment; that is correct for what it measures and is not a
statement about production.

## 9c. Two producers, two currentness slots — §267

Deterministic HazLenz and Expert HazLenz **coexist on one observation and are not interchangeable
versions of one analysis.** §266 measured what happens when they are treated as one linear stream:
an Expert run marked the customer-authoritative deterministic analysis `superseded`, the workspace
restored the newest non-superseded row, and the deterministic UI was handed an Expert snapshot it
read through the wrong schema.

| field | means | scope |
|---|---|---|
| `requestVersion` | a **request ordinal** | shared across producers; **confers no authority** |
| `status` | **currentness** | scoped **per producer** |

- There is a **current deterministic analysis** and a **current Expert analysis**. Neither
  supersedes the other; `maySupersede` permits supersession only within one family.
- Enforced by `uq_hazlenz_analysis_current_by_producer` — UNIQUE `(observationId, producer)` WHERE
  `status = 'current'` — created by migration **1800000021000**, which replaced §5's single-slot
  index. This is the one place query repair was insufficient: the old index refused the repaired
  code outright.
- **History ordering does not define currentness.** After `D1 → E1 → E2`, D1 is still the current
  deterministic analysis; after `D1 → E1 → D2`, E1 is still the current Expert analysis.
- One implementation each side: `expert-analysis-currentness.ts` on the server,
  `currentDeterministicAnalysis` in `frontend-next/lib/canonicalWorkflowApi.ts`. There is
  deliberately **no** selector that answers "the newest non-superseded analysis" without naming a
  producer.

**`GET /inspections/:id` withholds Expert content.** `client_supplied` rows pass through unchanged;
`server_authored` rows are projected to lifecycle metadata with `resultSnapshot` removed and
`expertResultWithheld: true` set. That payload never reconstructs `effectiveDecision` — the Expert
read route, under the full authority profile, is the only place Expert analysis content is served.

**Dismissal is not gated; finalization still is.** Finalization asserts a finding *on the basis of*
an operational conclusion, so it consumes one. Dismissal *rejects* the proposed finding and consumes
nothing, so §267 released it: a reviewer is not made to settle a classification for a hazard they
are rejecting. A dismissal leaves the analysis in `ANALYSIS_AWAITING_CONFIRMATION`, writes no
settlement, creates no corrective action, and creates no effective decision.

## 10b. The frontend, as of §265, amended at §267

`frontend-next/components/inspection/expert/`, reached from the HazLenz step of the inspection
workspace. It is **additive**: the deterministic analysis is unchanged and is still rendered in full
beneath it.

**The browser derives no authority.** `lib/expert/expertPresentation.ts` copies
`effectiveDecision.settledForUse`, `confirmationRequired` and the server's confirmation subject
rather than computing any of them. The single line that matters is a copy, not an expression:

```ts
const mayPresentAsSettled = decision?.settledForUse === true;
```

`frontend-next/scripts/check-expert-frontend-authority-boundary.mjs` fails if that line becomes an
expression, if a state name is used to produce an authority flag anywhere in the feature, if the
driver-role vocabulary appears, if a server-owned field is added to a request body, or if an
Expert result is routed through the legacy `saveAnalysisSnapshot` path. It was checked against a
deliberately reintroduced violation and failed, so it is a live guard rather than a decoration.

All eight states render distinctly. `ANALYSIS_FAILED` is reachable only from the execution
response — a provider failure writes no analysis row — so the execution response is adapted into
the read shape and passed through the same total state map rather than through a second presenter.

## 10c. Deployment safety and operational controls — §268

**The rule:** it must be impossible for new application code to become active against the old
database schema. §266 measured why — the `HazLenzAnalysis` entity declares five columns the
pre-`019000` schema lacks, so **every** read of `hazlenz_analyses` fails, including the core
deterministic `finalizeFinding` path.

Three independent mechanisms, and only the third is not procedural:

1. `npm run migrate:prod` runs as an explicit release step **before** activation. It loads the
   **compiled** `dist/database/data-source.js` and the production `typeorm` dependency — no
   `ts-node`, no `src/`, no devDependency — verifies the schema in the same command, and exits
   non-zero on failure. `migrate && start` never reaches `start`.
2. `docs/operations/BETA_DEPLOYMENT_RUNBOOK.md` orders MIGRATE → VERIFY SCHEMA → DEPLOY, with
   autoDeploy disabled first. **Superseded at §272: Render autoDeploy is OFF**
   (`autoDeploy: "no"`, `autoDeployTrigger: "off"`, read from the service API), as is Vercel Git
   auto-deploy. The ordering remains a precondition of any push; what changed is that the platform
   no longer deploys on its own while that ordering is being followed.
3. **`/health/ready` fails closed** when required migrations are absent, so an instance that
   skipped 1 and 2 never becomes ready rather than silently serving broken reads. A schema *ahead*
   of the build is READY — that is a deliberate code rollback, not a fault.

`migrationsRun` stays **false**. Explicit migration makes failure visible and separately auditable.

### The Expert kill switch

`EXPERT_EXECUTION_ENABLED` — production must set exactly `true` or `false` or **boot fails**.
"Nobody set it" and "somebody decided it" must not produce the same running system for the one
control reached for in an emergency.

It disables Expert **execution**, not Safety InSite. Still working while disabled: the deterministic
workflow end to end, reads of existing Expert analyses, and **settlement** of analyses already
awaiting confirmation — the last one deliberately, because disabling it would strand every analysis
in `ANALYSIS_AWAITING_CONFIRMATION` and block inspection completion.

### Spend ceilings and leg accounting

Per-workspace **analysis count** and **cost**, both configurable, both counting *started*
executions because failures and refusals spend too. Enforced after authorization and **before**
`claimExecution`, so a refusal writes no execution row and the transport is never reachable —
measured provider-entry delta **0** on every refusal path.

**One analysis is not one provider call.** A verifier-reaching analysis records 2 legs; one whose
verifier is deliberately not reached records 1. Cost is `NULL` when unmeasured, never a false zero.

Provider usage reaches the product through `ExpertLegUsageReporter`, a **side channel on the seam**,
because `ExpertLegResponse` lives in `expert-hazlenz-analysis.ts` — element 5 of the §259 candidate
identity — and the Anthropic adapter is a protected module. Neither could be edited.

### Observability

17 events on the closed `safety-insite.operational-event.v1` schema, with redaction **by
construction**: values coerced to bounded scalars, keys whose *name* looks credential- or
content-bearing dropped. Passing an observation to the emitter does not log the observation.

> **This is emission, not monitoring** — and it is still not monitoring. What changed at §269 is
> that a **collector** was found, verified and given a review path. `NO_ERROR_MONITORING` is
> **closed**, on the collector, not on the emitter.

**§269 amendment.** Render ingests this service's stdout and stderr, retains it, and indexes it by
level, type, HTTP path, status code and time. Verified live rather than assumed: a production request
was induced at a unique path and that exact record retrieved seconds later with structured labels.
Events are severity-routed — `info` to stdout, `warning` and `error` to stderr — which is what lets
Render label them.

Reviewing it is `npm run ops:events` (read-only; shells out to the authenticated Render CLI so no
credential reaches this repository). Push alerting on service failure is Render's own
`notifyOnFail`. The signal → observer → responder table is
`docs/operations/MONITORING_AND_ALERTING.md`.

**The one honest gap:** the 17-event vocabulary has never appeared in production, because the code
that emits it is not deployed. Absence before the release is *expected*, not healthy, and
`ops:events` says so rather than printing a reassuring zero. §269 verified the shape instead —
8 of 8 representative events emitted by the compiled emitter and parsed back by the reviewer, with a
planted provider key, observation text and `Authorization` header all `[redacted]`.

## 11. Current beta blockers

**Five P0s as of §269** (was six), none of them an Expert architecture defect, and none of them an
engineering gap. See `verification/current/BETA-BLOCKERS.json` — **the only current register**.
Historical `RELEASE_BLOCKERS.md` files under `verification/` record blockers that were live at the
time and are not current status.

| P0 | status after §269 |
|---|---|
| `PRODUCTION_MIGRATION_NOT_YET_EXECUTED` (renamed from `NO_PRODUCTION_MIGRATION_MECHANISM`) | MECHANISM_READY / LIVE_EXECUTION_PENDING_RELEASE. Dry-run reached production and reported pending; 019/020/021 confirmed absent |
| `NO_TERMS_NO_PRIVACY_POLICY` | DRAFTED at §269 / counsel review required |
| `NO_THIRD_PARTY_MODEL_DISCLOSURE` | DRAFTED at §269 / counsel review required |
| `BETA_CANDIDATE_NOT_PUSHED` | unchanged — HEAD is **12** ahead of `origin/main` (was 9 at §266) |
| `PRODUCTION_PROVIDER_CREDENTIAL_ABSENT` | **raised §269, CLOSED §270.** `ANTHROPIC_API_KEY` is set in production and was validated against the provider model-list endpoint. Retained here as the record of a closed blocker |

§269 closed `REPORT_GENERATION_BLOCKED` — its premise was false for production, which has had object
storage configured all along — and `NO_ERROR_MONITORING`. It also closed deployment control on
**both** platforms: Render `autoDeploy=no/off`, and Vercel `createDeployments=disabled`, the latter
being a hazard no prior section had recorded.

> **The §269 finding that mattered most.** `EXPERT_EXECUTION_ENABLED` was **absent** in production,
> and `validateProductionEnvironment` requires it to be exactly `true` or `false`. **The beta
> candidate could not have booted.** Every other requirement of the production boot contract was
> already satisfied, so this single variable was the entire gap. It is now `false`. Verified by
> executing the *compiled* validator — the one `dist/main.js` calls — against the live 37-variable
> production environment.

§268 closed `NO_SPEND_CEILING_OR_KILL_SWITCH` outright, and closed the *engineering* half of
`NO_PRODUCTION_MIGRATION_MECHANISM` and `NO_ERROR_MONITORING`. It also closed the §266
build-context finding (`backend/.dockerignore` — a real `.env` and a `.env.backup-*` were sitting
in the build context) and the §267 stale mutation registry.

§265 closed `NO_EXPERT_FRONTEND`. §267 closed `EXPERT_CLIENT_VERSION_COLLISION`,
`EXPERT_SUPERSEDES_DETERMINISTIC_ANALYSIS`,
`EXPERT_ANALYSIS_READABLE_OUTSIDE_THE_AUTHORITY_BOUNDARY` and
`FINALIZATION_GUARD_ALSO_BLOCKS_DISMISSAL`.

## 12. Next implementation step

**The release, and a counsel review no engineering work can substitute for.**

§269 closed the live-infrastructure lane. What is left in Lane A is execution that belongs to the
release by design; what is left in Lane B is not engineering at all.

1. **Product owner classifies the seven legal drafts** in `docs/legal/`. This is the only remaining
   P0 that is not a release execution step. All seven currently read
   `INTERNAL BETA DRAFT — LEGAL COUNSEL REVIEW STATUS: NOT YET APPROVED`, and engineering cannot
   change that by doing more engineering.
2. ~~**Set `ANTHROPIC_API_KEY`** on the Render service~~ — **DONE at §270.** Present and validated against the provider model-list endpoint; the smoke itself is still unrun.
3. ~~**Set `healthCheckPath` to `/health/ready`**~~ — **DONE.** The service reports
   `healthCheckPath: "/health/ready"`, so Render probes readiness and restarts an unready instance.
4. ~~**Decide `ENABLE_MAINTENANCE_SEED`**~~ — **DONE.** It is `false` in production. It gates a
   route that runs `ALTER TABLE` and `dataSource.synchronize(false)` against production, bypassing
   `TYPEORM_SYNCHRONIZE=false`; with the flag off, that route is unreachable.
5. **Execute `docs/operations/BETA_DEPLOYMENT_RUNBOOK.md`**, whose §269 preamble records which steps
   are already closed, ending with the one authorised Expert live smoke (1 analysis, ≤2 provider
   legs, ≤ USD 0.50).

### Superseded — §268's next step, now done

**Live infrastructure and legal.** Deployment control is established on both platforms; storage,
backups, the running SHA, the instance shape, the production security configuration and a monitoring
collector are all verified live; the seven legal artifacts are drafted. What §268 could not do from
a local session, §269 did against the live environment.

### Superseded — §267's next step, now done

**Beta infrastructure and operations.** The Expert workflow now functions against a real
observation, so the remaining lanes are no longer blocked behind it. In dependency order: the
production migration mechanism **before any push** (autoDeploy is OFF as of §272, so the push
itself is the deliberate act); object storage, which
production cannot boot without; a spend ceiling and an explicit Expert enable flag; error
monitoring. The **legal** lane has no engineering prerequisite and should already be running in
parallel.

Carried forward, none of it blocking: the remaining five §260 section 11 downstream guards; the
governed-evidence loader; reviewer revision of a settled analysis; and everything under section 10
that needs a live environment.

## 13. Safe commands

```
npm run hazlenz:status              what state are we in            (reads, computes nothing)
npm run hazlenz:verify              is that state true              (read-only, 0 provider calls)
npm run hazlenz:check               after a small change            (verify + unit + build)
npm run hazlenz:integration:test    route/auth/idempotency          (creates and drops its own DB)
npm run hazlenz:precommit           before an authorized commit     (everything except live)
npm run hazlenz:evidence            did accepted evidence change
npm run beta:readiness              are the deployment mechanisms in place (contacts nothing live)
npm run migrate:prod                the production migration command (needs DATABASE_URL)
npm run migrate:prod:dry-run        what would apply; changes nothing
npm run release:verify-sha          is the intended commit the one serving requests
npm run release:check-build-context can a secret enter the Docker build context
```

```
cd frontend-next && npm run check:expert-request-construction
```
§267. Runs the real `lib/expert/expertApi.ts` and reports the request it actually transmits. §265's
acceptance hand-authored its request bodies and therefore could not see that the shipped client
sent a different one; this measures the code that constructs it.

**Before running any other `verification`-adjacent script**, check
`verification/current/MUTATING-SCRIPTS.json`. 252 scripts write into accepted historical evidence
packages and 101 more have write behaviour a static reader could not resolve. §258 ran two of them
without noticing.

**§268 refreshed that registry** — 1049 scripts, and `test-265` is now correctly
`WRITES_HISTORICAL_OUTPUT` / sandbox-required. Two classifier extensions were needed: it scanned
`.ts` only (so the plain-JavaScript release scripts, including the one that migrates production
schema, were invisible) and its mutation pattern recognised only the CLI form `migration:run` (so
`scripts/release/migrate.js` read as `READ_ONLY`).

**Every evidence-writing suite is now gated.** §265, §267 and §268 all route writes through
`scripts/lib/evidence-write-gate.ts`, off unless `HAZLENZ_WRITE_EVIDENCE=1`. No assertion is gated —
only the side effect of overwriting an accepted package, which is what lets `hazlenz:evidence` mean
"something changed" rather than "a suite ran again". It is still worth running
`git status verification/` after `hazlenz:precommit`.

## 14. Evidence pointers

Do not load these for ordinary development.

| what | where |
|---|---|
| candidate identity §259 | `verification/expert-hazlenz-259-carrier-coherence-2026-09-12/` |
| product integration architecture §260 | `verification/expert-hazlenz-260-.../` |
| persistence and authority foundation §261 | `verification/expert-hazlenz-261-.../` |
| authoritative route §262 | `verification/expert-hazlenz-262-.../` |
| recall optimization §263 | `verification/expert-hazlenz-263-.../` |
| human confirmation boundary §264 | `verification/expert-hazlenz-264-.../` |
| frontend workflow and first downstream consumer §265 | `verification/expert-hazlenz-265-.../` |
| beta readiness closure review §266 | `verification/expert-hazlenz-266-.../` |
| product integration defect closure §267 | `verification/expert-hazlenz-267-.../` |
| beta infrastructure and operations §268 | `verification/expert-hazlenz-268-.../` |
| beta deployment runbook | `docs/operations/BETA_DEPLOYMENT_RUNBOOK.md` |
| rollback model | `docs/operations/ROLLBACK_MODEL.md` |
| historical archive index (142 directories) | `verification/expert-hazlenz-229-.../SECTION-229-HISTORICAL-ARCHIVE-INDEX.md` |
| what to read for a given task | `docs/hazlenz/current/CONTEXT_INDEX.md` |
| rules that must not be violated | `docs/hazlenz/current/HAZLENZ_INVARIANTS.md` |
