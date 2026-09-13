# §261 — Expert HazLenz Server-Side Integration Foundation

Persistence, execution state and the deterministic confirmation rule. **Provider calls 0.
Production database operations 0. Pushes, tags, deployments 0.**

## 1. What this slice is, and what it deliberately is not

It implements the trustworthy substrate that must exist *before* Expert provider execution is
connected to a user-facing route. It does not invoke the provider, does not wire
`runExpertHazLenzAnalysis` into any route, exposes no Expert frontend workflow, implements no
confirmation or override UI, changes no billing, configures no object storage and changes no
deployment configuration.

The absence of the provider is structural rather than disciplinary: `ExpertAnalysisService` imports
a data source, two repositories and `InspectionService`, and nothing else. Test P0 asserts this
against the service's import graph — not against a substring, because the service's own
documentation names the entry point in order to state that it is absent.

## 2. The trust boundary, made explicit in data

`producer` is a closed two-value vocabulary. `client_supplied` means the content arrived in a
request body — the deterministic path calls `/safescope-v2/classify`, holds the result client-side
and posts it back, and the server does not establish that what it stores equals what it returned.
`server_authored` means the content was produced inside a server-owned execution under an execution
record created before any spend.

The existing deterministic path was **not** retrofitted into the Expert authority model. It keeps
writing `engineVersion: "hazlenz-production"`, it keeps its own idempotency and versioning, and it
now records what it has always been.

Server-authored provenance cannot be conferred by metadata. There are exactly two assignment sites
for `producer` in the codebase: `InspectionService.addAnalysis` writes the literal
`'client_supplied'`, and `ExpertAnalysisService.persistAuthoritativeAnalysis` writes the literal
`'server_authored'`. Neither reads a DTO field. Four independent layers close the forgery path:

1. `CreateAnalysisSnapshotDto` declares no producer, state, confirmation or execution field.
2. The global `ValidationPipe` runs `whitelist` + `forbidNonWhitelisted`, so an extra body property
   is a 400 rather than a silently ignored field.
3. `repository.create` is handed an explicit literal object, so no partial-entity merge exists.
4. A CHECK constraint requires `producer = 'server_authored'` to carry a non-NULL `expertExecutionId`
   and `client_supplied` to carry NULL — enforced in the database, which outlives the process.

Test P2-E demonstrates layer 4 by attempting the forgery in **raw SQL**, bypassing every TypeScript
layer; the database rejects it.

## 3. The deterministic confirmation rule

Pure server logic over closed-vocabulary structured fields. No prose is read and no model is asked.
`POSTURE_PERMITS_CONTINUED_WORK` is imported from the frozen §233 contract and is not restated,
re-derived or inferred from a posture's name.

Confirmation is REQUIRED when the admitted posture's `requiredBy` contains either

* **(a)** an entry whose `driverRole` is `UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION`, or
* **(b)** an entry whose `driverRole` is `UNRESOLVED_RESPONSE_OR_FOLLOW_UP` **while**
  `POSTURE_PERMITS_CONTINUED_WORK[posture]` is true.

**Both directions are preserved.** Branch (a) catches over-restriction, the only direction §254
observed. Branch (b) catches under-restriction, which §254 did not observe, which nothing excludes,
and which is the dangerous direction. The rule was not narrowed to the observed failure. Tests R5-A
and R5-B assert that neither branch alone would catch what the other does.

**Restraint is asserted, not assumed.** An established-condition driver alone never triggers
confirmation (R2-C), and a follow-up classification under a *non-permitting* posture does not
either (R4-C, R4-D) — work is already held, so nothing continues on that classification. The rule
does not make every posture confirmable.

**Unknown or impossible structured state fails closed** with a distinct code per cause, and a
failed-closed determination is recorded separately from a substantive one, because the same flag
means different things to a reviewer and to anyone diagnosing the pipeline.

**C2 is consumed, never reimplemented.** The rule consumes the structural consequence of
`NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER` and neither weakens nor replaces the
admission invariant. A load-time guard aborts if
`UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION` ever stops being a decision-controlling role, so the
rule cannot outlive the guarantee it depends on.

## 4. Persisted once, never recomputed

The flag is computed at authoritative persistence time and stored. Test P5 proves this is real
rather than claimed: the stored snapshot is rewritten to content the current rule scores as *not*
requiring confirmation, and the stored flag still reads `true` (P5-A) while the live rule
genuinely disagrees (P5-C), so the assertion is not vacuous. Which rule produced the flag is
recorded on the execution record's `confirmationRuleVersion`.

A fifth column was not added to `hazlenz_analyses`: §260 froze exactly four, and rule provenance is
execution provenance in the same sense as the contract versions beside it.

## 5. Pre-spend execution identity

The execution row is inserted in `ANALYSIS_RUNNING` **before** the first provider call. Every
pre-existing idempotency control protects the write, which happens after the money is spent.

The unique index `(observationId, idempotencyKey)` — not application logic — decides which of two
concurrent claimants wins, because a read-then-write check has a window through which both would
spend two provider legs. Test P3-F issues three genuinely concurrent claims and asserts exactly one
spender; P3-G asserts exactly one row exists.

A collision is classified from persisted state alone: running, completed, failed-retryable, or
failed-terminal. A transport failure is retryable because no semantic answer was ever obtained. A
refusal is **terminal**: the provider answered and deterministic admission refused it, and
re-spending would be shopping for a different answer to the same question.

## 6. H3/H4 structural identity

`resultSnapshot` is written whole. There is no field list, no mapper and no projection between the
admitted structure and the column, so there is nothing that could flatten a structural identity to
prose — and that absence, rather than a repair, is the mechanism.

Proven on real structures: declaration IDs (P6-A), `resumeCondition.resolvedByDeclarationIds`
resolving against them by identity (P6-B, P6-C), `controlId` per required control (P6-D),
`dischargingControlRef` surviving **as the id** and resolving to a persisted control (P6-E, P6-F),
and the `refKind:ref` pair the confirmation subject binds to (P6-G).

P6-H compares the whole tree for loss. The comparison is canonicalized over *object key order*
because `jsonb` normalizes key order as a property of the storage type — no key is dropped and no
value altered. Array order, which `jsonb` does preserve and on which declaration and control
sequencing depends, is asserted to match exactly (P6-J).

## 7. Refusal and failure are outcomes, never generic success

A user must never see a generic successful analysis when the authoritative result was refused.
`deriveAnalysisState` enforces this by ordering: transport failure, then whole-output refusal, then
preserved unresolved truth, and only an explicit `ADMIT` reaches an available state. There is no
default branch — an underivable combination throws rather than resolving to something benign
(R9-H). A transport failure creates **no analysis row at all** (P9-F).

## 8. Audit

`addAnalysis` wrote no audit event while findings and reviews both did, so the one act producing
the record every finding derives from had no trail. Both producers now emit `analysis_created`
under one action name, distinguished by the `producer` field, inside the same transaction as the
row they describe.

No raw provider payload or model prose reaches generic audit metadata — asserted in P7-H, which
searches the serialized metadata for the fixture's prose. Raw output lives on the execution record
under the same access controls as the analysis it produced.

## 9. Authorization

No new mechanism was introduced, which is the point. Every entry point routes through
`InspectionService.authorizeObservation` → `findAccessible`, answering NotFound rather than
Forbidden so no existence leaks. An execution id is never trusted as a bare key: it is resolved as
`findOne({ id, observationId })` after the observation is authorized — the pattern `addReview`
already uses.

P8-E is the sharp case: workspace B authorizes its **own** observation and then presents workspace
A's execution id. It is refused, and P8-F confirms no cross-workspace linkage was created.

No route is exposed in this slice. Because every method authorizes internally, the later route's
`JwtGuard` + `EntitlementGuard('fullSafeScope')` + `RolesGuard` + dedicated `Throttle` profile is
additive; the tenant check cannot be skipped by a caller that forgets it, and the Expert path does
not inherit the persistence route's JwtGuard-only posture.

## 10. Documented naming adjustment

§261 lists the admitted-and-settled state as `ANALYSIS_AVAILABLE_NO_CONFIRMATION_REQUIRED`; §260
froze it as `ANALYSIS_AVAILABLE`. The **frozen §260 name is used**.

Semantic equivalence: the "no confirmation required" half of the longer name is not an independent
fact. It is exactly the persisted `confirmationRequired = false`, written to the same row by the
same rule in the same transaction. The pair (`ANALYSIS_AVAILABLE`, `confirmationRequired = false`)
is therefore identical in meaning to `ANALYSIS_AVAILABLE_NO_CONFIRMATION_REQUIRED`, and
(`ANALYSIS_AWAITING_CONFIRMATION`, `confirmationRequired = true`) is the only other admitted shape
the derivation produces. Encoding the flag in both the state name and the column would create two
places to disagree — the defect class §253 existed to remove. All eight required states are
representable and distinct (R9-I); none is collapsed.

## 11. Candidate integrity

The §259 successor identity was recomputed from the tree before and after implementation by a
read-only script that writes nothing. All 22 elements match the recorded values, drift 0, and the
composite is `0b12adf6e44e4586ec2be27c5274dafd8a36b2c1042dfe34d543b51d5be70bee` both times.

Protected modules: 29 present, 0 missing. No file under `expert-hazlenz/`,
`expert-hazlenz-adapters/` or `scripts/lib/` was modified — §261 code lives in a new sibling
directory `src/safescope-v2/expert-hazlenz-product/`, mirroring how `expert-hazlenz-adapters/` is
already a sibling that keeps the candidate tree clean.

No accepted evidence package was mutated. `verify-229-protected-identities.ts` writes to a target
path and was given a scratchpad path rather than its default.

## 12. Deferred, and why

Finding reconciliation is **not** run on the Expert path in this slice. §260 section 11 blocks
finding finalization before confirmation, so materializing findings from an unconfirmed Expert
posture would assert precisely the authority the boundary withholds. That belongs to the downstream
authority-guard slice. The legacy path's reconciliation is unchanged.
