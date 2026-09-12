# §205 — POST-120 EXPERT HAZLENZ REMEDIATION IMPLEMENTATION

Written 2026-09-07, immediately after the authorized zero-provider-call remediation slice completed.

**TERMINAL:**
`EXPERT_HAZLENZ_POST_120_REMEDIATION_IMPLEMENTED — PRODUCT_OWNER_REVIEW_AND_HOSTED_TRANSPORT_SMOKE_REQUIRED`

**THIS IS NOT ACCEPTANCE.** Every §205 result is deterministic behaviour on hand-written input.
No provider call was made, so nothing here establishes what a model will emit. That question is
what the fresh acceptance cohort exists for.

| Boundary | Actual |
|---|---|
| Provider calls | **0** |
| Database operations | **0** |
| Production / customer activation | **NONE** |
| Successor promotion | **NONE** |
| Prompt / contract / priority mutation | **NONE** — the §199-executed vNext prompt and the `OwedFact` contract are byte-unchanged |
| Commit / push / tag / deploy | **NOT PERFORMED** |
| Files modified outside §205 namespace | **0** |

---

## 1. EXACT FILES CHANGED

All new, all §205-namespaced. **No pre-existing file was modified.** The §202 `recordAdditive`, the
frozen §196 projection, the §199-executed vNext prompt, and every §203 successor module are
byte-unchanged; §205 extends them by construction and delegates to them unmodified.

| File | Lines | sha256 (16) | Purpose |
|---|---|---|---|
| `backend/scripts/lib/expert-205-first-pass-instruction-r2.ts` | 251 | `dd8b33e1c6dbdaac` | RR-1/RR-2A/RR-2B/RR-3/RR-5 instruction successor |
| `backend/scripts/lib/expert-205-declaration-preservation.ts` | 262 | `4c350fcac98a48e5` | RR-7 contract completeness / safety-fact preservation |
| `backend/scripts/lib/expert-205-additive-append.ts` | 227 | `d15655a9bf96ddc7` | T1 append-only additive evidence |
| `backend/scripts/lib/expert-205-governed-transport.ts` | 303 | `7ec6216773eb6a13` | governed capability-present transport + size budget |
| `backend/scripts/lib/expert-205-property-preservation-audit.ts` | 254 | `41767bd6f1935c6c` | RR-4 invariant audit + O1/O4 conclusion |
| `backend/scripts/lib/expert-205-escalation-design.ts` | 278 | `53e3ef787782f251` | RR-6 deterministic escalation design (not activated) |
| `backend/scripts/lib/expert-205-remediation-fixtures.ts` | 517 | `dfbe4c962209b802` | the fifteen-fixture local matrix |
| `backend/scripts/lib/expert-205-acceptance-cohort.ts` | 415 | `9e1d7b8743c93462` | fresh cohort manifest, instrument, proposed gates |
| `backend/scripts/test-205-remediation.ts` | 632 | `3adeee4b8ef0b3ed` | remediation suite (92 assertions) |
| `backend/scripts/test-205-acceptance-design.ts` | 170 | `df6f25ab7f4de6e1` | acceptance-design suite (35 assertions) |
| `backend/tsconfig.scripts-205.json` | 9 | `74598530d70cca45` | §205 experiment-scope typecheck |

Plus this report and the doc updates listed in §15.

---

## 2. F1 / F2 / F4 / F7 REMEDIATION EVIDENCE

All four are **first-pass declaration defects**, so all four are answered by the R2 instruction
successor and by nothing else. R2 is built by appending one block to vNext's own exported line
arrays; `reconstructVNextLines` removes exactly that block and reproduces vNext **byte-identically**
in both the governed and non-governed variants — asserted, not assumed.

| Defect | Block | What it does | Evidence it rests on |
|---|---|---|---|
| **F1** | RR-1 | every independent decision-critical fact gets its own entry; a fact only mentioned in prose is lost. Explicitly states two entries are owed only where two independent facts exist, and that a two-part property is ONE fact | SF-02 (U04 `A`/`H`=INCORRECT) |
| **F2** | RR-2A | the branch difference must be grounded in supplied material; an imagined adverse state is not a gap | SF-04 (U06 `B`/`I`, U07 `F`/`G`=INCORRECT) |
| **F4** | RR-3 | the three verification states, with state 3 ("performed and did NOT establish") named as the one that gets lost | SF-08 U17 (`C`,`E`=PARTIALLY_CORRECT) |
| **F7** | RR-2B | `decisionIfA`/`decisionIfB` may state only what their own branch plus established context justifies. Names **both** recorded shapes verbatim | SF-07 U14 `decisionIfA`; SF-11 U19 `decisionIfB` |

**Over-correction is guarded explicitly.** RR-3 carries the line *"THIS IS A TEST TO APPLY, NOT A
SHAPE TO IMPOSE"* — because SF-11's exposure fact is genuinely binary and was recorded `E`=CORRECT,
so a universal ternary rule would break a passing case. RR-1 carries *"This is not a request for
more entries"* for the same reason on the other axis. Both lines are asserted by the suite.

### The residual limit, stated rather than buried

**F7 IS NOT REACHABLE BY DETERMINISTIC CODE, AND §205 DID NOT PRETEND OTHERWISE.**

Fixtures FX-08 (positive-branch overreach) and FX-09 (negative-branch overreach) reproduce the
SF-07 and SF-11 shapes exactly. **Both are ADMITTED by the projection** — and that is the finding.
"No additional respiratory or engineering control of any kind is required" is a well-formed,
non-identical, genuinely diverging decision. A boundary check that refused it would have to decide
what the branch supports, which is the §160 semantic matcher this programme retired.

So F7 is answered by the RR-2B instruction and by adjudication only. Gate G9 is the measurement.
This is recorded as `RR2B.overreach-is-structurally-well-formed` in the suite so it cannot be
forgotten.

---

## 3. RR-7 IMPLEMENTATION

**Adopted as a separate structural requirement, per the product-owner decision.**

`preserveIdentifiedSafetyFacts` reads a completed projection plus the declarations that produced it
and preserves every **semantic identification** whose declaration failed **structural admission**.

Fixture FX-10 reproduces the SF-05 failure byte for byte:

```
codes  = [REQUIRED_FIELD_MISSING, REQUIRED_FIELD_MISSING]
detail = ["decisionIfA is empty", "decisionIfB is empty"]
facts  = 0
```

Under §204 the safety question then vanished. Under RR-7:

```
facts                 = 0          (unchanged — a refused declaration still yields no OwedFact)
preserved             = 1
safetyStateComplete   = false      FAIL CLOSED
totalLossOnThisRow    = true       the SF-05 signature, now visible
identifiedProperty    = "Whether opening the interlocked gate actually stops hazardous motion"
absentRequiredFields  = [decisionIfA, decisionIfB]
presentFields         = branchA, branchB, missingFact, observationSpan, … (verbatim)
```

**Nothing is invented.** `decisionIfA` was empty; it stays empty; no value is composed, inferred
from `branchA`, copied from a sibling, or defaulted. The suite asserts that neither field appears in
`presentFields`.

**The record cannot become a conclusion.** `UnresolvedSafetyFactRecord` has no `factKey`, no
`status` and no `priority`, and carries `admissible: false`, `mayBeSettled: false`,
`mayCloseTheAnalysis: false` as type-level literals. It is deliberately outside the ledger state
machine: adding an `OwedFactStatus` member would put a structurally invalid thing where `transition`
and the three `TRANSITION_AUTHORITIES` would have to have an opinion about it.

**Two distinctions the implementation holds:**

- **Empty row ≠ total loss.** FX-12 (a genuinely sufficient row, zero declarations) returns
  `safetyStateComplete = true`. FX-10 returns false. The pair is the assertion.
- **Contract incompleteness ≠ authority violation.** A declaration refused for
  `PROHIBITED_REGULATORY_CITATION` is `CONTAINED_AUTHORITY_VIOLATION` and its content is **not**
  carried forward — preserving it would be the containment failure with an extra step. The two code
  sets are asserted disjoint.

---

## 4. T1 IMPLEMENTATION

Repaired as **adjudication / evidence-tooling infrastructure. NOT an Expert semantic defect** —
`isAnExpertSemanticDefectRepair: false` is a type-level literal asserted by the suite.

`recordAdditive` in §202 is **left exactly as it is**, and the historical ledger is untouched. The
repair is a successor that stores additive evidence structurally and derives the legacy flat field
as a read view.

| Requirement | How it is met | Assertion |
|---|---|---|
| existing additive evidence never overwritten | entries are appended to an ordered list; the flat field is derived | `T1.nothing-overwritten` |
| repeated additions preserve order | dense 1-based `seq`, never reassigned | `T1.order-preserved` |
| batch identity remains visible | `batchId` on every entry; a blank one is refused | `T1.batch-identity-visible`, `T1.refuses-missing-batch-identity` |
| historical ledger immutable | nothing writes to `VERDICT-LEDGER-204.jsonl`; §202 unmodified | `T1.effects` |
| migration/replay shows no prior mutation | pre-T1 flat text adopted as one `LEGACY_FLAT` entry, byte-identical; idempotent | `T1.legacy-text-byte-identical`, `T1.adoption-is-idempotent`, `T1.legacy-prefix-survives` |
| caller-side concatenation no longer required | callers pass only new text | `T1.no-caller-side-concatenation-needed` |

**The property migration depends on:** a single entry derives to exactly its own bytes with no
separator, so adopting the existing §204 worksheet changes nothing. Asserted as
`T1.single-entry-view-has-no-separator`. A two-entry derived view is byte-identical to what §204's
caller-side concatenation produced, so the flat field is a genuine read view and not a new format.

---

## 5. GOVERNED TRANSPORT IMPLEMENTATION

The §199 failure, verbatim from the run log:

```
rejection=COMPILED_GRAMMAR_TOO_LARGE::the compiled grammar is too large, which would cause
  performance issues. simplify your tool schemas or reduce the number of strict tools.
```

The repair is §202's separate-stage architecture, now **proven routed end to end and within
budget**, offline. `routeGovernedRow` obtains its first-pass binding from §202's own
`firstPassBindingUnderSeparateStage()`, which throws if the binding it returns is not
capability-ABSENT — so the routing cannot silently drift back to the rejected shape.

**Measured, this run:**

| Schema | Bytes | Effective-grammar identity |
|---|---|---|
| routed first pass (capability-ABSENT) | **18,730** | `c0df75103834b03c` |
| retired capability-PRESENT (never sent) | 19,152 | `09825bd0e1b3de13` |
| separate governed stage | **1,478** | `58faca1cd094af1b` |

| Check | Result |
|---|---|
| **C1** routed first-pass schema is byte-identical to the ABSENT schema §199 executed on 10/10 rows | HELD |
| **C2** the retired PRESENT shape is not what the routed path sends (different grammar identity; binding carries 0 ids) | HELD |
| **C3** the governed stage is constructible and materially smaller (1,478 B vs 18,730 B) | HELD |
| **C4** the largest single compiled schema on the routed path is the one §199 accepted | HELD |
| **C5** the §202 authority boundary is unchanged — 4 permitted / 11 forbidden authority statements; the stage schema names neither `factKey` nor `priority` | HELD |

**Authority boundary preserved:** governed text is not copied into model-authored citation
authority, the provider selects only supplied structured governed source ids, deterministic code
owns authorized governed-source lookup and rendering, and unsupported citation-shaped output stays
contained and fail-closed.

### What this claim is, exactly

**CONSTRUCTIBLE AND WITHIN THE ACCEPTED ENVELOPE — not PROVIDER ACCEPTED.**
`PROVES_THE_PROVIDER_WILL_ACCEPT_IT: false` is a literal in the module and is asserted. §199
measured a **433-byte margin** between an accepted and a rejected request and concluded byte size is
not the provider's metric; §203 records the effective-grammar identity as an explicit proxy. Only
the 2–4 call hosted transport smoke can upgrade this, and it is not authorized here.

---

## 6. LOCAL REGRESSION RESULTS — ACTUALLY EXECUTED

| Suite | Result |
|---|---|
| `test-205-remediation.ts` | **92 passed, 0 failed** (exit 0) |
| `test-205-acceptance-design.ts` | **35 passed, 0 failed** (exit 0) |
| `tsc -p tsconfig.scripts-205.json` | clean — **EXPERIMENT_SCOPE_TYPECHECK (§205)**, not repo-wide `tsc clean` |
| `test-203-boundary-guards.ts` | 52 passed, 0 failed (exit 0) |
| `test-203-grammar-identity.ts` | 45 passed, 0 failed (exit 0) |
| `test-203-identity-collision.ts` | 63 passed, 0 failed (exit 0) |
| `test-203-schema-closure-redteam.ts` | 107 passed, 0 failed (exit 0) |
| `test-202-authority-boundary-guards.ts` | 83 passed, 0 failed (exit 0) |
| `test-202-adjudication-grouping.ts` | exit 0 — 21 review units, **0 semantic verdicts supplied** |
| `test-202-governed-binding-stage.ts` | exit 0 |
| `test-202-grammar-identity-and-cache.ts` | exit 0 |
| `test-204-value-shape-closure.ts` | 36 passed, 0 failed (exit 0) |

**Preserved §204 behaviours, verified in the suite:**

- `SUCCESSOR.closed-key-set-still-refuses` — §203 divergence D2 unaffected.
- `FX-01.both-independent-gaps-survive` / `.no-merge` — two independent declarations project to two
  distinct facts on their own affectedDecision types.
- `FX-07` — a conjunctive property stays ONE fact with both components (RR-1's stated boundary).
- `RR7.empty-row-is-not-a-loss` — clean-row suppression stays distinguishable from total loss.
- `FX-11` — the `NOT_OBSERVED_IS_NOT_ABSENT` shape with a contained `decisionIfB`.
- `RR6.nothing-reaches-life-critical`, `T1.refuses-non-product-owner`, `TRANSPORT.effects` — no
  provider settlement authority anywhere; deterministic governed-source authority intact.

**No hosted behaviour claim is made from any fixture.** `HOSTED_BEHAVIOUR_CLAIMS_PERMITTED = false`
is asserted.

---

## 7. O1 versus O4 — CONCLUSION

**O1 RETAINED AS BASELINE. O4 `AVAILABLE_NOT_ADOPTED`. O2 and O5 not evidence-supported.**

RR-4's invariant — *no decision-critical property semantic may disappear before verifier review* —
is enforced at declaration time by the R2 instruction and checked at design time by
`auditPropertyPreservation`. Five annotated qualifier classes across five fixtures:
`BEFORE_AFTER_SEQUENCING`, `ACTUAL_CONTROL_RESULT`, `POINT_OR_LOCATION_OF_VERIFICATION`,
`EXPOSURE_CONDITION`, `CONJUNCTION` — **0 violations**; every class survives in verifier-visible
fields.

**The audit is deliberately not a text classifier.** It consumes product-owner-declared annotations.
Deciding at runtime which qualifier classes a model-authored property depends on would be the §160
semantic matcher; `auditableAtRuntime: false` says so in the module and is asserted.

**The decisive argument is not the 1-in-8 loss ratio — it is where the defects live.** Six of the
eight §204 mechanisms (F1, F2, F4, F5, F7, F8) originate before projection. No representation change
reaches any of them. F6 is deterministic policy. Only F3 has a projection component, and its own
record locates the operative harm in the clarification wording.

O4 was **built and exercised** rather than dismissed: `buildO4SidecarForComparison` constructs the
§201 sidecar and resolves the property back from a `factKey`. It works. Its remaining benefit after
R2 is reviewability, which is real and weak relative to a second store that can disagree with the
`OwedFact` it annotates, plus migration and hash-pin consequence.

**Revisit trigger, recorded:** a second consequential axis-Q loss in the fresh cohort, **or** a
recorded reviewer difficulty attributable to the missing back-reference. Neither exists today.

---

## 8. RR-6 DETERMINISTIC ESCALATION DESIGN RECOMMENDATION

Designed and locally exercised against the eight §204 facts. **Nothing is activated.** The shipped
floor remains the §196 constant `OTHER`; Ruling 5 is unchanged; D14 stays open.

| Option | correctly raised | over-raised | still under-escalated |
|---|---|---|---|
| **E0** unchanged constant floor | 0 | 0 | **7** |
| **E1** affectedDecision floor map | 6 | **1** | 1 |
| **E2** + deterministic corroboration | 0 | 0 | 7 |
| **E3** + person present during activity | **6** | **0** | 1 |

**Recommended for authorization: E3.** Rationale, measured rather than asserted:

- **E1's over-raise is the real finding.** Six of eight facts are `REQUIRED_CONTROL`, and that set
  spans all three safety classifications — four `PLAUSIBLY_LIFE_CRITICAL`, one
  `SAFETY_SIGNIFICANT`, and U07, which the product owner explicitly recorded as **not**
  under-escalated. **`affectedDecision` alone cannot separate them.**
- **E2 is untested, not conservative.** No §204 row carried a deterministic finding, so its column
  is structurally uninformative and must not be chosen on this evidence.
- **E3** adds one further trusted HazLenz task-state input and is the only option that separates
  U07 from the four life-critical facts on inputs the model does not author.
- **No option reaches `LIFE_CRITICAL`** — the value that raises `UNRESOLVED_SAFETY_STATE`. Asserted.

**Honest limits:** n = 8, one cohort, one run — E3 is **fitted to the eight facts it was exercised
on** and is a hypothesis, not a validated policy. One fact (U02, `HAZARD_SEVERITY`) stays
under-escalated under every option. Where the person-present reading is itself uncertain, E3 must
fail toward `OTHER`.

**Returned separately for PRODUCT_OWNER authorization.** `recommendationIsAuthorized: false`.

---

## 9. FRESH COHORT MANIFEST

**24 fresh cases.** The §199 twelve cannot serve as their own acceptance evidence — RR-2B quotes
their recorded failures almost literally, so a pass on them would measure fitting.

| Block | Cases | Targets |
|---|---|---|
| A — independent multi-gap | AC-01…03 | F1 (§204 n=1, failed) |
| B — decision-neutral unknown | AC-04…06 | F2, guards S2 |
| C — downstream-claim containment | AC-07…09 | **F7 — both branch sides** |
| D — verification-state completeness | AC-10…12 | F4, F5, **plus an over-correction guard** |
| E — temporal scope | AC-13…15 | F3, incl. temporal × conjunctive (never measured) |
| F — contract preservation | AC-16…18 | F8 / RR-7 |
| G — preserved behaviour + coverage | AC-19…21 | S8, S5 (3 conjuncts), `HAZARD_SEVERITY` |
| H — governed evidence | AC-22…24 | **the §204 coverage hole**; incl. a no-gap control |

Replication achieved: F1=3, F2=3, F3=3, F4=3, F7=3, F8=3, governed=3. Guards: S2=4, S5=2, S8=1.

**AC-12 is the over-correction guard** — a genuinely binary property in a verification-flavoured
setting, so RR-3 cannot pass by always producing three branches.

---

## 10. RISK-TARGETED ADJUDICATION INSTRUMENT

Each case declares the axes its design genuinely exercises; only those are adjudicated.
`NOT_EXERCISED` stays available where a targeted opportunity does not materialise — targeting is
design intent, not a guarantee, and a vacuous CORRECT remains forbidden.

```
24 cases  ->  57 row judgments + 102 fact judgments = 159 total
              full factorial would be 408  (39% of it; 249 judgments saved)
```

Axis H is targeted only where the design expects more than one projected fact. AC-10 and AC-15 were
trimmed for that reason — a single-fact case gives multi-gap preservation no genuine opportunity, so
the judgment would buy a foregone conclusion. The budget saving was a side effect, not the motive.

---

## 11. PROPOSED PREREGISTERED GATES

**15 gates, PROPOSED not preregistered** (`GATES_ARE_PREREGISTERED = false`). Preregistration is an
act the product owner performs before the cohort runs.

**13 hard safety-critical gates, every one 100 % or zero-occurrence — no partial credit:**
G1 safety-critical fact recall · G2 independent multi-gap preservation · G3 total safety-fact loss
after semantic identification · G4 unsupported adverse branches · G5 incomplete verification-state
partitions · G6 exact verifier target binding · G7 clarification settlement sufficiency ·
G8 temporal/sequence loss causing wrong settlement · G9 unsupported downstream overreach ·
G10 provider settlement authority violations · G11 deterministic authority violations ·
G12 governed source / citation containment · G13 malformed states fail closed with fact preserved.

Mapping to the §204 register: F1→G2, F2→G4, F3→G8, F4→G5, F7→G9, F8→G3.

**G14 (coverage)** — governed axes N/S/T must carry real verdicts. Failing it does **not** block
advancement on the non-governed surface but **forbids any claim about governed behaviour**.

**G15 (measurement only)** — the axis-R distribution. Passes and fails nothing; RR-6 is diagnostic
and D14 is the decision.

**The broader ordinary-quality aggregate threshold is deliberately left unset.** §204's 82.4 % is a
descriptive figure from a different cohort, not a bar. Proposing one here would let the remediation
grade itself.

**Execution gate.** `executionPermitted` refuses today with three blockers: truth specification is
`DRAFT_NOT_REVIEWED`; the hosted transport smoke has not passed; the gates are proposed. Product-
owner review alone does not unblock it — the freeze is a separate act, asserted separately.

---

## 12. ESTIMATED PROVIDER CALLS AND COST

| Stage | Calls | Notes |
|---|---|---|
| §205 (this slice) | **0** | actual |
| Hosted governed transport smoke | **2–4** | infrastructure/callability only |
| Fresh acceptance cohort, one pass | ~24 first pass + ~20 verifier + ~3 governed nomination = **~47** | |
| With one re-run after a fix | **~95** | |

Cost basis: `claude-sonnet-5` as used in the recorded run, **$2.00 / MTok input and $10.00 / MTok
output**. Token volumes grounded on the measured request size (18,730 B schema; ~63.7 KB total
request ≈ 16 K input tokens).

- Transport smoke: **well under $1.**
- One cohort pass: ~568 K input + ~115 K output ≈ **$2.30.**
- Including re-runs: **under $10**; with a cross-provider replication arm, **under $25.**

**Provider spend is not the constraint and must not drive scoping.**

---

## 13. ESTIMATED HUMAN JUDGMENT COUNT

**159 substantive PRODUCT_OWNER semantic judgments** — measured from the manifest, not estimated.

- vs §204's 120: **1.33×**.
- vs a full-factorial 24-case instrument (~408): **39 %**.
- At the depth actually used in §204 (fact axes take materially longer than row axes):
  **roughly 6–9 hours** of concentrated judgment, across two or three working sessions.

Additional product-owner time **before** any run, and not in the 159: authoring and reviewing the
24 cases' truth specification, then freezing it. That review is the load-bearing difference between
this cohort and §199's, whose expectations were AI-assisted and never the oracle.

---

## 14. REMAINING STEPS TO EXPERT ADVANCEMENT

1. **Product owner reviews this §205 implementation evidence.** ← the immediate gate.
2. **Hosted governed capability-present TRANSPORT SMOKE, 2–4 calls.** Infrastructure/callability
   only; **not** governed behavioural acceptance. Upgrades C1–C5 from CONSTRUCTIBLE to REACHES
   INFERENCE.
3. **Rule D08 (all four parts) and D15 together** — §205 §7 supplies the evidence; no new run needed.
   Can proceed in parallel with steps 1–2.
4. **Author, review and FREEZE the 24-case truth specification** before anything runs.
5. **Preregister the gates**, adding the ordinary-quality aggregate threshold the product owner sets.
6. **Execute ONE bounded hosted acceptance cohort** (~47 calls) and score deterministically first.
7. **Risk-targeted PRODUCT_OWNER adjudication** — 159 judgments through the append-only,
   `PRODUCT_OWNER`-attributed machinery, now genuinely append-only after T1.
8. **Rule D14** using RR-6's design plus the fresh axis-R distribution.
9. **Decide Expert HazLenz advancement.** Only then are D10 (successor promotion) and D12 in scope.

**Nothing beyond step 1 is authorized by this document.**

---

## 15. DOCUMENTATION UPDATED (targeted edits only)

- `docs/INSITE_ENGINEERING_BLUEPRINT.md` — §205 section; next-gate paragraph revised.
- `docs/INSITE_CURRENT_STATE.json` — `expertHazlenzPackage.postRemediation205` block added.
- `docs/expert-hazlenz/CURRENT-EXPERT-HAZLENZ-STATE.md` — terminal and state table.
- `docs/expert-hazlenz/EXPERT-HAZLENZ-DECISION-REGISTER.md` — D08, D14, D15 annotated.
- `docs/expert-hazlenz/EXPERT-HAZLENZ-NEXT-WORK.md` — post-§205 execution order.
  *(The §205 brief named this file `NEXT-WORK.md`; the repository file is
  `EXPERT-HAZLENZ-NEXT-WORK.md` and that is the one updated. No file was renamed.)*

---

## 16. NOTHING WAS FAILED CLOSED

Every authorized remediation was implementable without a new product-owner architecture decision.
Two things were deliberately **not** implemented, and both were explicit product-owner instructions
rather than blockers:

- **No `OwedFact` representation mutation** — O1 retained per decision 3/4; O4 available, not adopted.
- **No escalation policy activation** — RR-6 designed and returned for authorization per the brief.

One genuine limitation is recorded rather than engineered around: **F7 cannot be caught by
deterministic code** (§2). It is answered by instruction and adjudication, and gate G9 measures it.

---

**TERMINAL:**
`EXPERT_HAZLENZ_POST_120_REMEDIATION_IMPLEMENTED — PRODUCT_OWNER_REVIEW_AND_HOSTED_TRANSPORT_SMOKE_REQUIRED`
