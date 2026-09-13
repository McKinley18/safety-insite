# §266 — CONTROLLED HUMAN BETA READINESS CLOSURE REVIEW

**Terminal: `SAFETY_INSITE_CONTROLLED_BETA_NOT_YET_READY — FINITE_P0_CLOSURE_PLAN_AUTHORIZATION_REQUIRED`** (Case B)

Provider calls **0**. Production database operations **0**. Production code changes **0**.
Pushes, tags, deploys **0**. §259 identity `0b12adf6…70bee` unchanged, drift 0, 29/29 protected
modules present.

---

## 1. The verdict, and what kind of "not ready" this is

**The safety-authority architecture is sound and is not what blocks beta.** Server-authored
execution, deterministic admission, the persisted confirmation gate, human settlement, one
effective-decision derivation and an activated downstream guard all hold under §262/§264/§265
evidence, and §266 re-verified the evidence base rather than re-running it.

What blocks beta is **integration and operations**. Nine P0 items, every one finite, none requiring
redesign. This is Case B, not Case C.

Three of the nine were **measured, not inferred**. §266 ran one read-only probe against a
disposable `test_insite_*` database with the transport substituted and zero provider calls, because
the directive says do not guess.

---

## 2. The three measured defects

### P0-1 — The shipped Expert client cannot execute, and spends money failing

`frontend-next/lib/expert/expertApi.ts` hardcodes `requestVersion: 1`. The Expert panel renders
only inside the HazLenz step, which requires a deterministic analysis to exist — and that analysis
already occupies `requestVersion 1`.

Measured:

```
DETERMINISTIC analysis stored: status=201 requestVersion=1
EXPERT route as shipped:      status=409  "A newer analysis request already exists."
   PROVIDER LEGS SPENT BY THIS REQUEST: 1
   execution rows: [{"executionState":"ANALYSIS_FAILED","requestVersion":1,
                     "failureKind":"PERSISTENCE_CONFLICT"}]
```

The refusal happens at **persistence, after the provider leg**. Every attempt costs a real hosted
call in production and returns a conflict the user cannot act on.

**§265's acceptance missed this because every §265 case created a fresh observation with no prior
deterministic analysis.** The one case that did use two versions hand-supplied `requestVersion: 2`;
the shipped client sends `1`. The suite exercised the route with an author-chosen request shape
rather than the client's actual request — which is the same class of error this project already
guards against for the *provider* request, applied one layer out.

### P0-2 — A successful Expert run supersedes the customer-authoritative analysis

Expert and deterministic analyses share one per-observation `requestVersion` sequence and one
`status='current'` slot. Measured, after Expert at version 2:

```
[{"producer":"client_supplied","requestVersion":1,"status":"superseded",...},
 {"producer":"server_authored","requestVersion":2,"status":"current",...}]
```

The workspace restores `analyses.filter(status !== 'superseded').sort(requestVersion DESC)[0]` and
casts it to `HazLenzAnalysisResult` (`page.tsx:778, 855, 969, 1814`). After any Expert run it
therefore restores an **Expert** snapshot into the deterministic UI — the step degrades, and
`analysisId` points subsequent reviews at the Expert analysis.

It also means an **advisory** layer supersedes the customer-authoritative record. Invariant 30 holds
in behaviour; at the data level the currency flag now says otherwise.

### P0-3 / P1 — Expert analyses are readable outside the authority boundary

`GET /inspections/:id` returns `observations.analyses` unfiltered. Measured:

```
{"producer":"server_authored","state":"ANALYSIS_AVAILABLE","status":"current","v":2,
 "snapshotKind":"EXPERT_HAZLENZ_SERVER_AUTHORED_ANALYSIS","posture":"CONTINUE_WITH_CONTROLS"}
   entitlement guard on that route: ABSENT (JwtGuard only)
```

No `fullSafeScope` gate, no `effectiveDecision`, no `authorityStatement`. Classified **DIRECT BYPASS
EXISTS** and held at **P1**, not P0, because nothing renders it today: the frontend reads that array
only to restore the deterministic analysis, and the report PDF's `extractStandard` looks for
`executiveJudgment` / `standardsReasoning` / `primaryCitation`, none of which an Expert snapshot has.
So an unsettled proposal does not *become* an authoritative product fact. But the containment is a
property of what happens to be written, not of a guard, and a future feature would bypass it with no
compiler or runtime indication.

---

## 3. The five remaining downstream consumers

§266 answered this by import analysis rather than by reasoning about call paths. **The only
production readers of `HazLenzAnalysis` are `inspection.service.ts`, the `expert-hazlenz-product`
module, and entity relation declarations.** `reports`, `pdf`, `notifications`, `intelligence`,
`action-engine` and `corrective-actions` reference neither the entity nor the table.

| consumer | classification |
|---|---|
| finding finalization | **EXPLICITLY_GUARDED** (§265) |
| completion readiness / transition | **NOT APPLICABLE** — reads findings and reviews only; transitively contained because completion requires finalization |
| corrective-action creation | **NOT APPLICABLE** — runs only on the finalized branch inside the guarded method |
| report finalization / export | **TRANSITIVELY_CONTAINED** — with the snapshot-copy caveat below |
| notifications | **NOT APPLICABLE** |
| executive summary | **NOT APPLICABLE** |
| analytics | **NOT APPLICABLE** |

**Recommendation: transitive containment is sufficient for a controlled beta** — four of the five
never read an analysis at all — **but only once the `GET /inspections/:id` exposure is closed**,
because that is the single place where containment rests on what is written rather than on a guard.

The required answer to "can an `ANALYSIS_AWAITING_CONFIRMATION` raw Expert proposal become an
authoritative product fact through any of these paths today?" is **NO** for every one.

---

## 4. Deployment is the sharpest operational finding

Three facts compose into one blocker:

1. `migrationsRun: false`; `start:render` does not migrate; the only migration script is
   `typeorm-ts-node-commonjs` against `src/`, and **neither `ts-node` nor `src/` exists in the
   runtime image**. Production cannot migrate itself.
2. §256 recorded production applied through `1800000018000`. The branch carries `1800000019000` and
   `1800000020000`, both unapplied.
3. Render **autoDeploy is on**.

The consequence is larger than Expert. The `HazLenzAnalysis` entity now declares `producer`,
`analysisState`, `confirmationRequired`, `expertExecutionId` (019000) and `settlementReviewId`
(020000). TypeORM selects all declared columns, so against the current production schema **every
read of `hazlenz_analyses` fails — including the core deterministic `finalizeFinding` path**.

It is finite: `typeorm` is already a production dependency and
`dist/database/{data-source,migrations}` are already in the image, so
`typeorm -d dist/database/data-source.js migration:run` works as a release command.

**Why production is currently consistent:** `HEAD` is **9 commits ahead of `origin/main` and 0
behind**. The entire Expert integration is local-only. Production has neither the code nor the
schema, which is why nothing is broken today — and why the push, the migration and the deploy must
be sequenced deliberately rather than triggered by a push.

---

## 5. What is genuinely ready

Worth stating plainly, because ten BLOCKER domains overstate the picture.

- **Production boot is fail-closed.** `validateProductionEnvironment()` refuses to start without
  `DATABASE_URL`, a ≥32-character non-development `JWT_SECRET`, HTTPS `FRONTEND_URL` and
  `PASSWORD_RESET_FRONTEND_URL`, `STORAGE_S3_BUCKET`, and exact HTTPS `CORS_ORIGINS`; and it refuses
  `DEV_AUTH_BYPASS`, `DEV_FORCE_PRO`, `DEV_EXPOSE_RESET_TOKEN` and `TYPEORM_SYNCHRONIZE` in
  production. Object storage is therefore a **precondition of booting**, not a runtime surprise.
- **No committed secrets.** A pattern scan over all tracked files found one match: a redaction-test
  fixture label. The `CREDENTIAL_*` evidence files record presence/absence states by design and
  contain no values.
- **Entitlement is trustworthy in both directions**, and a controlled *unpaid* beta is already
  provisionable safely: `POST /admin/entitlement-grants` with `source: 'pilot'` is platform-admin
  only, requires a reason and a future expiry, caps at 90 days, and is audited. **No plan bypass is
  needed.**
- **Tenant isolation** answers NotFound rather than Forbidden throughout, including on the §265 read
  route.
- **Claims language is materially correct.** Live copy already says HazLenz "acts purely as a
  decision-support advisory tool", "never auto-finalizes findings, declares violations, creates
  official citations, or replaces qualified safety professionals", and "does not... determine
  compliance, or make final decisions". §266 found **no claim that conflicts with accepted
  capability**.
- **Auditability is strong**: `security_audit_events` across authentication, entitlement denial,
  analysis creation and settlement; `expert_analysis_executions` carries full provenance.
- **Historical evidence integrity is intact**: 91 manifests, 5,549 members, 0 new drift; all six
  §26x packages verify byte-clean.

---

## 6. The two provenance incidents

### §264 digest index defect — RESOLVED, root cause established

`0be6f8c33bc494…` is **the §262 package digest**, reproducible today from
`verification/expert-hazlenz-262-…/REPORT-262.sha256`. §264 carried §262's value forward into
`verification/current/EXPERT-HAZLENZ-STATE.json` instead of computing its own.

Classified exactly as the directive requires: **CURRENT-STATE INDEX METADATA DEFECT, not
frozen-evidence corruption.** All six §26x packages verify byte-clean. The §265 commit touched **no
frozen package member** — only `verification/current/`, which is mutable by design. The correction
was already made at §265 and records both values; §266 adds the root cause. No historical §264
member was modified.

### Worktree incident — PROCESS CONTROL INCIDENT, not an integrity risk

**Process control incident.** `git checkout --` was used in §265 contrary to CLAUDE.md. It restored
a tracked evidence file that had been staged as deleted. No content was discarded.

**Unexplained sibling-file churn — classified A, local-worktree hygiene, NOT B.** The evidence:

- `ecfr-1910-146 3.xml` has **birth time 2026-08-26 16:23:12**, inode 15701482 — it predates this
  session by two and a half weeks. A rename preserves both, so whatever happened renumbered a name;
  it created and destroyed nothing.
- All three copies are byte-identical to the tracked file (`d3dc555e…b182`).
- The tracked file is **clean against HEAD**.
- The package manifest `SHA256SUMS.txt` references only the canonical path, with the matching digest.
- **No `" N.xml"` duplicate was ever tracked in any commit**, so none can enter a commit, a build
  from git, or a deployed artifact.
- Exactly two such files exist repo-wide, both in this one directory.

Release provenance is establishable. **Case D does not apply.** Attribution of the rename is not
established and §266 did not guess; the most likely cause is an external process touching that
directory, and no sibling was renamed or deleted in §266.

---

## 7. Worktree contamination of deployment

**Contained for the backend, by two independent mechanisms.** `verification/` lives at the
repository root and the Dockerfile's build context is `backend/`, so no evidence file — duplicate or
otherwise — can enter the image. The runtime stage copies only `dist`, `scripts` and four `src`
subdirectories.

**One residual risk, recorded rather than closed.** There is **no `.dockerignore` anywhere**, and
the build stage is `COPY . .` over `backend/`. If an image is ever built from a **local worktree**
rather than from a clean git checkout, untracked files enter the build context — including
`backend/.env`, which is gitignored and contains real configuration. Remote builds from git are
unaffected.

---

## 8. Controlled beta definition, cohort and scope

**Controlled beta means:** named invited users only; every user a competent safety professional;
Expert output explicitly advisory with human review expected on every finding; no autonomous
operational reliance; a named feedback channel; monitored rollout with a working disable; published
beta terms and privacy notice; disclosed known limitations; and production-grade security and tenant
isolation with no beta exemptions. Beta is **not** a justification for missing fundamental safety or
security controls.

**Recommended cohort: 3–5 named safety professionals across 1–2 organizations.** Small enough that
every analysis can be read by the team, which is the point of a beta whose goal is learning. Cost
exposure stays bounded while no spend ceiling exists.

**Regulatory scope: stage it. Start with OSHA General Industry only.** This is a product-readiness
recommendation, not a semantic one — Expert's coverage spans all three, but every additional regime
multiplies the review surface while the observability to detect a problem does not yet exist. Add
OSHA Construction once monitoring is live; MSHA last.

---

## 9. The one live smoke, designed and NOT executed

**Purpose:** prove deployed server → real provider → §259 Expert path → deterministic admission →
persistence → product response. **Semantic quality is not benchmarked.**

- **Trigger:** one authenticated user initiates **one** Expert analysis on **one** freshly created
  observation, through the real frontend, against the deployed instance.
- **Preregistered maximum provider legs: 2** — one first-pass, plus one verifier leg **only if the
  first pass admits a declaration**. A refusal or a preserved-unresolved outcome reaches 1.
- **Preregistered spend ceiling: USD 0.50**, well above the ~USD 0.03 §255 measured per analysis and
  low enough that an unexpected loop is visible.
- **Success:** `ADMIT`, `REFUSE` **or** `PRESERVE_UNRESOLVED` all count, provided the route behaves
  correctly — an execution row written before contact, provenance persisted, the response honest
  about its state, and the transport seam counting exactly the predicted legs.
- **Failure that stops everything:** more legs than predicted, a persisted analysis with no
  execution row, `producer` anything other than `server_authored`, or raw provider output in the
  response.
- **Preconditions:** all nine P0 closed; `/health/version` returns the expected SHA; the transport
  seam confirms it is **not** substituted.

---

## 10. Closure sequence — five parallel lanes

Independent work is not serialized. The critical path is **LIVE INFRASTRUCTURE**, not engineering.

| lane | items | notes |
|---|---|---|
| **ENGINEERING** | P0-1 version allocation, P0-2 producer-scoped currency, P0-7 spend ceiling + Expert flag, then P1 inspection-payload exposure | P0-1 and P0-2 are one change in one area |
| **LIVE INFRASTRUCTURE** | P0-3 migration release command, P0-6 storage provisioning, P0-9 push and deploy sequencing | longest pole; start immediately |
| **LEGAL / POLICY** | P0-4 beta terms + privacy notice, P0-5 third-party model disclosure | no engineering prerequisite; start immediately; **do not downgrade because engineering is ready** |
| **SECURITY / OPERATIONS** | P0-8 error monitoring, backups posture | monitoring gates the beta's own purpose |
| **PRODUCT / UX** | cohort selection, limitations disclosure, dismissal-gating decision | decisions, not code |

**Shortest sequence:** start LEGAL and LIVE INFRASTRUCTURE on day one, since neither depends on
engineering. ENGINEERING closes P0-1/P0-2 together, then P0-7. Monitoring lands before any user
touches the system. Push and deploy happen **last and only after** the migration release command
exists, because with autoDeploy on, the push *is* the deploy.

**Next recommended authorization: §267 — Expert product integration defect closure**, covering P0-1,
P0-2 and the inspection-payload exposure. It is the only lane that is purely engineering, it is
small, and until it closes the Expert workflow does not function at all — which makes every other
lane premature.

---

## 11. What §266 did not do

No production code was changed. No infrastructure was mutated. No provider was called. Nothing was
deployed, pushed or tagged. No migration was executed against any non-disposable database. No legal
drafting was performed beyond recovering the §256 inventory. The probe in section 2 created and
dropped its own `test_insite_*` database and left no file in the worktree.
