# §267 — EXPERT PRODUCT INTEGRATION DEFECT CLOSURE

Request versioning · analysis coexistence · read authority boundary · dismissal over-restriction

**Branch** `beta/expert-hazlenz-validated-candidate-2026-09-12`
**Base** `01459250` (§266 readiness review)
**Provider calls** 0 · **Production database operations** 0 · **Push / tag / deploy** 0

---

## 1. What was wrong, and why the previous acceptance did not catch it

§265's suite passed every case and shipped two defects that made Expert unusable in the product.
Both escaped for one structural reason: **the suite exercised the route with requests it wrote
itself, against observations it created fresh.** The product does neither.

- **The observation is never fresh.** The Expert panel only renders once a deterministic analysis
  exists, so in the product *every* Expert request lands on an observation that already owns
  analysis rows and request-version state. Every §265 case used a brand-new observation, where
  `requestVersion: 1` was correct by accident.
- **The request is not hand-authored.** §266 found the shipped client hardcoding
  `requestVersion: 1` while the suite supplied the same field itself, correctly. A suite that
  writes the request cannot detect that the client writes a different one.

§267 therefore adds an acceptance case whose request body is **constructed by
`frontend-next/lib/expert/expertApi.ts` itself**, captured out of that module's own network seam,
and posted verbatim onto an observation that already carries a deterministic analysis.

---

## 2. P0-1 — Expert request-version conflict

### Root cause

`expertApi.ts` sent `requestVersion: 1` on every Expert request. Nothing adjudicated it before
spend: `claimExecution` recorded whatever it was handed and returned `mayCallProvider: true`. The
collision was discovered downstream in `persistAuthoritativeAnalysis`, whose check
(`execution.requestVersion <= latest.requestVersion`) runs **after** the provider has answered —
so the product spent a hosted leg and then returned 409 *"A newer analysis request already
exists."*

A client-chosen version is a client-chosen collision. The browser does not hold the observation's
analysis history, cannot see an execution another tab has in flight, and cannot reserve an ordinal.

### Design adopted — hierarchy option 1, the server derives it

The ordinal is allocated in `claimExecution`, inside the transaction holding the
`hazlenz-analysis:<observationId>` advisory lock — the same lock every other write to this table
takes, which is what makes read-then-allocate correct rather than racy.

`highestReservedRequestVersion` reads **two** tables. `hazlenz_analyses` holds ordinals that have
been *used*; `expert_analysis_executions` holds ordinals *reserved* by a claim whose provider call
has not returned. An Expert execution sits in `ANALYSIS_RUNNING` for the length of two hosted legs,
during which its ordinal exists nowhere in the analyses table — so a deterministic rerun consulting
only that table would allocate the same number and fail on the unique index as a 500. The
deterministic persistence path now consults the same helper, which converts that race into the
truthful 409 its client already knows how to resynchronise from.

A client-supplied version is **adjudicated, not obeyed and not ignored**. Obeying it is the defect;
ignoring it would execute a request whose stated identity the server privately disagreed with.

| supplied | outcome |
|---|---|
| absent | server allocates — the shipped client's path |
| equal to the allocation | accepted; agreement is not invention |
| lower | **refused 409 pre-spend** — the §266 defect exactly |
| higher | **refused 409 pre-spend** — a client inventing sequencing |

### The actual frontend request, before and after

```
BEFORE  {"idempotencyKey":"expert-<observationId>-0","requestVersion":1}
AFTER   {"idempotencyKey":"expert-<observationId>-0","taskContext":"…"}
```

Captured by executing the real module, not by reading it.

### Measured

| case | result |
|---|---|
| real client request on an observation already carrying a deterministic analysis | **201**, `ANALYSIS_AVAILABLE` |
| resulting rows | `client_supplied@v1` (current) + `server_authored@v2` (current) |
| stale `requestVersion: 1` (the §266 payload) | **409**, **provider-entry delta 0** |
| invented `requestVersion: 99` | **409**, **provider-entry delta 0** |
| execution / analysis rows written for a refused request | 0 / 0 |

Provider-entry is measured as a **delta** across the refused request, not a cumulative total.
`ExpertAnalysisExecutionService` is the only class that can reach the transport — §262 keeps
`ExpertAnalysisService` provider-free by construction — so the count is complete.

---

## 3. P0-2 — deterministic / Expert analysis-currentness collision

### Root cause

One overloaded concept. `requestVersion` and `status` together expressed a single linear analysis
stream per observation, and both producers wrote into it. A successful Expert run therefore marked
the customer-authoritative deterministic analysis `superseded` and became `current` itself; the
workspace restored the newest non-superseded row and cast it to `HazLenzAnalysisResult`, so the
deterministic UI received an Expert snapshot and read it through the wrong schema.

### The split

| field | means | scope |
|---|---|---|
| `requestVersion` | a **request ordinal** | shared across producers; **confers no authority** |
| `status` | **currentness** | scoped **per producer** |

- **CURRENT DETERMINISTIC ANALYSIS** — the newest non-superseded `client_supplied` row.
- **CURRENT EXPERT ANALYSIS** — the newest non-superseded `server_authored` row.
- **Supersession rules.** A new deterministic analysis supersedes the prior deterministic one; a
  new Expert analysis supersedes the prior Expert one. **Cross-producer supersession is
  prohibited**, decided by one predicate, `maySupersede`. No historical row is rewritten.

There is deliberately **no** selector answering "the newest non-superseded analysis" without naming
a producer — neither `currentAnalysisOfFamily` on the server nor
`currentDeterministicAnalysis` in the browser can be called without saying which family is meant.
Repairing the four workspace call sites in place would have left the ambiguous question askable.

### No schema casting

`GET /inspections/:id` no longer serves an Expert `resultSnapshot` at all, so the deterministic
consumer cannot cast one. `resultSnapshot` became optional on the client type and both restore
sites guard it, so an absent snapshot restores nothing rather than restoring a wrong analysis.

### Persistence / query review

| path | classification | change |
|---|---|---|
| inspection workspace load (`InspectionService.get`) | **DETERMINISTIC CURRENT** + **GENERIC METADATA ONLY** for Expert | Expert rows projected; deterministic untouched |
| observation load | same relation, same method | inherited |
| deterministic finalize (`addAnalysis`) | **DETERMINISTIC CURRENT** | supersedes only `client_supplied`; ordinal checked globally |
| Expert panel load (`readExpertAnalysisForObservation`) | **EXPERT CURRENT** | already producer-scoped at §265; unchanged |
| Expert persist (`persistAuthoritativeAnalysis`) | **EXPERT CURRENT** | supersedes only `server_authored`; ordinal checked globally |
| history (Expert read route) | **ALL HISTORY** | unchanged; carries producer, state, version, status |
| finding linkage (`finalizeFinding`) | **GENERIC METADATA ONLY** | resolves the review's own `analysisId`; no "latest" semantics |
| report load / snapshot | inherits `InspectionService.get` | Expert snapshot no longer copied in |

`observations.analyses` is loaded in exactly one place in the backend, which is why the projection
has a single application point.

### Migration — required, and this is the one place query repair was insufficient

Query repair was attempted first and is what ships for every read and every supersession decision.
It was **refused by the database**:

```
duplicate key value violates unique constraint "uq_hazlenz_analysis_current"
→ surfaced as PERSISTENCE_FAILED_AFTER_PROVIDER_ANSWERED
```

`uq_hazlenz_analysis_current` — `UNIQUE ("observationId") WHERE "status" = 'current'`, created by
§5 when the table had one producer — is the single-currentness rule expressed in the schema. No
amount of query scoping satisfies an index that permits one row where the product needs two.

**Migration `1800000021000-ProducerScopedAnalysisCurrentness`** replaces it with
`uq_hazlenz_analysis_current_by_producer` — `UNIQUE ("observationId", "producer") WHERE "status" =
'current'`. Same table, same partial predicate, one column narrower in scope. **No column added,
dropped or widened; no row rewritten; no backfill.** The new index is created before the old one is
dropped, so there is no instant at which the table is unprotected. `down` will legitimately fail on
any database where an observation already carries both a current deterministic and a current Expert
analysis — that failure is correct and is not repaired, because making the revert succeed would
mean destroying one of the two.

**No production migration was executed.** It was applied only to disposable `test_insite_*`
databases created and dropped by the §263 wrapper.

### Measured

| sequence | result |
|---|---|
| D1 → E1 | D1 **current**, E1 **current**; workspace reload selects D1; Expert panel serves E1 |
| D1 → E1 → E2 | D1 **current**, E2 **current**, E1 **superseded** *within the Expert lineage* |
| D1 → E1 → D2 | D2 **current**, D1 **superseded**, E1 **still current** |
| history | both producers present, each preserving producer, state, version, status |

History ordering does not confer authority: the newest history item is Expert while the current
deterministic analysis is older, and that is asserted directly.

---

## 4. P1 — inspection payload exposure

### Before

`GET /inspections/:id` returned `observations.analyses` whole, including `server_authored` rows in
any state with `resultSnapshot` intact, behind `JwtGuard` alone — no entitlement, no
`effectiveDecision`, no confirmation framing.

### After

`InspectionService.get` applies a projection. `client_supplied` rows pass through **byte for
byte**. `server_authored` rows become a summary carrying `id`, `observationId`, `producer`,
`status`, `analysisState`, `requestVersion`, `engineVersion`, `createdAt`, plus
`expertResultWithheld: true` and a pointer to the Expert route.

- **A projection, not a filter.** Removing the rows would hide that an Expert analysis exists and
  would make the deterministic reader look correct for the wrong reason.
- **It constructs, it does not delete.** A column added to the entity later does not leak by
  default; it reaches a generic reader only if someone adds it on purpose.
- **Status metadata is not a conclusion.** `ANALYSIS_AWAITING_CONFIRMATION` names a lifecycle
  position — it says a human has not settled anything, the opposite of leaking a conclusion. The
  posture, hazard reasoning, driver role, required controls and unresolved declarations are all
  withheld.
- **It does not reconstruct `effectiveDecision`**, per §267: an ordinary inspection read must not
  derive Expert authority.

**Authorization is unchanged and still enforced.** The Expert read route keeps `JwtGuard`,
`EntitlementGuard('fullSafeScope')`, `RolesGuard`, tenant isolation through the same choke point
and its own throttle. Measured: unauthenticated → **401**; unentitled → **402
PAID_SUBSCRIPTION_REQUIRED**, with no Expert content in the body.

**Report snapshot, closed by the same change and recorded as a consequence rather than claimed as a
separate fix.** `CanonicalReportsService.generate` obtains its inspection from
`InspectionService.get`, so `snapshotInspection` now copies the projected analyses.

---

## 5. Finding dismissal — over-restriction corrected

§265 placed the authority gate ahead of the finalized/dismissed branch, so it refused a
**dismissal** of a finding whose review cited an unsettled Expert analysis.

**Product-owner decision (§267): this is over-restriction.** Finalization asserts an authoritative
finding *on the basis of* an operational conclusion — it writes a finding the report reads and
creates a corrective action whose urgency derives from that conclusion — so it consumes the
conclusion. Dismissal *rejects* the proposed finding and consumes nothing. It also trapped the
user: a dismissed finding is how an inspection reaches completion.

The gate now runs inside the `status === 'finalized'` branch. Nothing else about it changed.

| assertion | result |
|---|---|
| finalization on `ANALYSIS_AWAITING_CONFIRMATION` | still **409** |
| dismissal of the same finding | **201**, status `dismissed` |
| Expert analysis afterwards | still `ANALYSIS_AWAITING_CONFIRMATION` |
| `settlementReviewId` afterwards | NULL — not confirmed, not overridden |
| `deriveEffectiveDecision` afterwards | `NONE_AWAITING_HUMAN_CONFIRMATION`, `settledForUse: false`, `humanSettled: false`, 0 entries |
| corrective actions created | 0 |
| audit | `finding_review_finalized` with `status: 'dismissed'`, reviewer, review and analysis |

Dismissal does not mark the analysis confirmed or overridden, does not rewrite the snapshot, does
not create an effective conclusion, and implies neither "safe" nor "no hazard exists" — it records
one reviewer rejecting one proposed finding, attributably.

---

## 6. Two historical expectations were REVERSED, not relaxed

Two frozen assertions encoded the very behaviour §267 prohibits. Both are recorded here explicitly
rather than quietly edited.

| case | asserted | why it is stale |
|---|---|---|
| §261 `P4-G` | the prior current analysis was superseded by the Expert run | the row is `client_supplied` (its own `P2-A` asserts so) — it required **cross-producer supersession** |
| §262 `R12-C` | the legacy row was superseded | same: `rows[0]` is the `client_supplied` row (its own `R12-A` asserts so) |

Both were written in good faith when `hazlenz_analyses` had one currentness slot and "the prior
current analysis" had one possible meaning. **Neither was weakened.** §261's one status check became
three assertions pinning the whole currentness model; §262 kept its substantive clause — the legacy
row is neither deleted nor relabelled — and gained a second case asserting one current row per
producer. Both suites are net stronger: §261 71/71 (was 69), §262 95/95 (was 94).

---

## 7. An instrument-integrity defect found and fixed: `hazlenz:precommit` could not pass twice

`test-265-expert-product-acceptance.ts` runs inside `hazlenz:integration:inner` and wrote
`SECTION-265-READ-PAYLOAD-SHAPE.json` into the **frozen** §265 package on every run. That artifact
contains per-run UUIDs and timestamps, so a re-run cannot reproduce it. Measured across three runs
of the same suite:

```
recorded in REPORT-265.sha256   3860eeddf39e81f0
run A                           4e8813174bf6dbad
run B                           de2e9ccb6ec1c2fd
```

The diff was confined **entirely** to UUIDs and timestamps — `analysisState`, `producer`,
`requestVersion`, `status`, `admission` and every other field were identical, which is itself
evidence that §267 did not change the §265 read payload shape. That re-run and its diff are
preserved in this package as `SECTION-267-265-READ-PAYLOAD-SHAPE-RERUN.json` and
`SECTION-267-265-PAYLOAD-SHAPE-RERUN.diff`; the §265 bytes on disk were restored to exactly what
§265 accepted.

The consequence was structural: `hazlenz:precommit` ran the integration suites and then
`hazlenz:evidence`, which correctly reported the `DIGEST_MISMATCH` its own earlier step had just
caused. §265 itself passed only because its manifest was computed *after* that write. **§267 is the
first section to re-run precommit after §265 froze**, which is why it surfaced now.

Fixed by making the §265 suite's evidence writes opt-in (`SECTION_265_WRITE_EVIDENCE=1`). **No
assertion was weakened** — every case still runs and still fails the build. Only the side effect of
overwriting an accepted package was removed, which is what lets the evidence guard mean "something
changed" rather than "the suite ran again". §267's own acceptance artifact is run-stable by
construction: identifiers are redacted before it is written, so a later section re-running this
suite reproduces it byte for byte.

**`verification/current/MUTATING-SCRIPTS.json` is stale and did not warn.** It was generated at
§263 and carries no entry for `test-264-…` or `test-265-…`, both of which are in
`hazlenz:integration:inner`. Regenerating it is outside §267's authorized scope and is recorded as
carried-forward work.

---

## 8. Candidate integrity

| | |
|---|---|
| §259 identity before | `0b12adf6e44e4586ec2be27c5274dafd8a36b2c1042dfe34d543b51d5be70bee` |
| §259 identity after | `0b12adf6e44e4586ec2be27c5274dafd8a36b2c1042dfe34d543b51d5be70bee` |
| protected modules | 29/29, unchanged |
| prompt / wire-schema / admission / projection / verifier / driver-role | 0 changes |

§267 changed request identity, currentness, a read boundary and a downstream gate. It touched no
semantic layer.

---

## 9. Scope discipline

Not begun, per §267: storage provisioning, deployment remediation, migration/deployment execution,
provider smoke, billing configuration, monitoring implementation, legal drafting, prompt
optimization, Expert semantic tuning.

**One defect was found and deliberately NOT fixed.** `EntitlementGuard` refuses with HTTP **402**
(`PAID_SUBSCRIPTION_REQUIRED`); `expertApi.ts` maps only **403** to `EXPERT_NOT_ENTITLED`, so an
unentitled user sees a generic error instead of "Expert analysis is not included in this plan". The
read is correctly refused and no Expert content is served — it is a wrong message, not a wrong
authorization. It is not one of the four defects §267 authorized and was not raised by §266, so it
is registered as a new **P2** rather than fixed opportunistically.
