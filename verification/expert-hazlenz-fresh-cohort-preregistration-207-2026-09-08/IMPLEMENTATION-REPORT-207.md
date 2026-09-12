# §207 — FRESH EXPERT ACCEPTANCE TRUTH SPECIFICATION AND PREREGISTRATION

Written 2026-09-08, immediately after the authorized zero-provider-call preregistration slice.

**TERMINAL:**
`EXPERT_HAZLENZ_FRESH_COHORT_PREREGISTRATION_FROZEN — PRODUCT_OWNER_REVIEW_AND_COHORT_EXECUTION_AUTHORIZATION_REQUIRED`

**THIS IS NOT ACCEPTANCE, AND IT IS NOT EVEN A REVIEWED SPECIFICATION.** §207 fixed the
expectations and pinned their identity before any output exists. Whether those expectations are
*right* is the product-owner review, and that review is **not recorded**. The execution gate holds a
separate blocker for it.

| Boundary | Actual |
|---|---|
| Provider calls | **0** |
| Database operations | **0** |
| Production / customer activation | **NONE** |
| Successor promotion | **NONE** |
| Commit / push / tag / deploy | **NOT PERFORMED** |
| Files modified outside the §207 namespace | **0 source files.** Five documentation files updated by targeted edit |
| §205 lib integrity | all eight sha256 prefixes still match the §205 and §206 records |
| Pre-existing uncommitted work | untouched |

---

## 1. D08 — FINAL RECORDED RULING

**D08 IS CLOSED, IN FAVOUR OF THE CURRENT ARCHITECTURE.**

The governing rule is recorded as: **MODEL AUTHORS SEMANTIC SAFETY CONTENT.**

**Deterministic code MAY:** validate · reject · refuse admission · preserve unresolved truth ·
normalize representation without semantic change · project valid model-authored declarations.

**Deterministic code MUST NOT:** invent missing semantic content · reconstruct semantics from
generated prose · repair missing branch meaning · infer decision divergence · recreate the retired
semantic matcher.

**Evidence base:** §204 at 120/120 — six of eight defect mechanisms (F1, F2, F4, F5, F7, F8)
originate before projection, where no representation or reconstruction change reaches them; §205 §2,
which recorded rather than engineered around the fact that **F7 is not reachable by deterministic
code** (both overreach fixtures are structurally well-formed and admitted, and a boundary check that
refused them would have to decide what a branch supports — which is the §160 matcher); §206
introduced no contrary evidence.

**Reopens only if** later acceptance evidence demonstrates a concrete architectural contradiction.
**Preregistered gate G11 is the run-time expression of this ruling**, and a G11 failure in the fresh
cohort reopens D08. The gate is worded so that this is not rhetorical: it fails if any repair,
reconstruction or prose-parsing recovery is found on the executed path.

**Consequence carried into the design, not just recorded:** gate G9 (unsupported downstream
overreach) is preregistered as **HUMAN-ADJUDICATED AND STAYS THAT WAY**, and the §207 suite asserts
that wording. The frozen truth specification lists `prohibitedDecisionClaims` per fact so F7 is
gradeable, and no code compares them to anything.

---

## 2. D15 — FINAL RECORDED RULING

**D15 IS CLOSED: `O1_RETAINED`, `O4_AVAILABLE_NOT_ADOPTED`.** O2 and O5 are not evidence-supported.

**Rationale, as recorded:**

- §205's qualifier audit found no demonstrated preservation defect requiring canonical
  representation mutation — five annotated qualifier classes across five fixtures, **zero
  violations**, every class surviving in verifier-visible fields.
- O4 was **built and exercised rather than dismissed**: `buildO4SidecarForComparison` constructs the
  §201 sidecar and resolves the property back from a `factKey`. It works. Its remaining benefit
  after the R2 instruction is reviewability, which is real but weak against a second store that can
  disagree with the `OwedFact` it annotates, plus migration and hash-pin consequence.
- §206 introduced no contrary evidence.

**O4 is not adopted merely because it has been implemented successfully.**

**The revisit trigger is RETAINED AND LIVE:** a second consequential axis-Q loss in the fresh
cohort, **or** a recorded reviewer difficulty attributable to the missing back-reference. The fresh
cohort is the first genuine opportunity for either to fire — §204's single counterexample was U09
(F3), and axis Q is adjudicated on three facts in this instrument (AC-13, AC-14, AC-15).

---

## 3. FILES CHANGED

All new, all §207-namespaced. **No pre-existing source file was modified.**

| File | Lines | sha256 (16) |
|---|---|---|
| `backend/scripts/lib/expert-207-truth-specification.ts` | 3835 | `1e9b03e73bc55049` |
| `backend/scripts/lib/expert-207-gates.ts` | 770 | `8b429cdf6d3e5773` |
| `backend/scripts/lib/expert-207-protocols.ts` | 384 | `23f75ff5bcfe09de` |
| `backend/scripts/lib/expert-207-preregistration.ts` | 348 | `fdc4cd2e68d3ddcd` |
| `backend/scripts/lib/expert-207-execution-gate.ts` | 155 | `2153e6aa32861994` |
| `backend/scripts/freeze-207-preregistration.ts` | 63 | `182fb0e444c22cf5` |
| `backend/scripts/render-207-artifacts.ts` | 370 | `b16053e28951a505` |
| `backend/scripts/test-207-preregistration.ts` | 672 | `abc5a1de5c696115` |
| `backend/tsconfig.scripts-207.json` | 11 | `2242b24be6aaf931` |

Evidence directory `verification/expert-hazlenz-fresh-cohort-preregistration-207-2026-09-08/`:
`PREREGISTRATION-207.json` (the frozen record), `TRUTH-SPECIFICATION-207.md`,
`GATES-AND-APPLICABILITY-207.md`, `EXECUTION-GATE-PROOF-207.txt`, and this report. The three
rendered artifacts are **derived from the frozen source**, so they cannot drift from the hashed
payload.

Documentation updated by targeted edit: `docs/expert-hazlenz/EXPERT-HAZLENZ-DECISION-REGISTER.md`
(D08, D15, D14), `docs/expert-hazlenz/CURRENT-EXPERT-HAZLENZ-STATE.md`,
`docs/expert-hazlenz/EXPERT-HAZLENZ-NEXT-WORK.md`, `docs/INSITE_ENGINEERING_BLUEPRINT.md`,
`docs/INSITE_CURRENT_STATE.json`.

**Why the §205 manifest was extended and not edited.** `expert-205-acceptance-cohort.ts` is one of
the eight §205 lib files whose hashes are recorded in the §205 report **and** re-verified in the
§206 report. §207 builds its adjudication plan by construction from the §205 axis sets with a
declared amendment set appended; `reconstruct205AxisSets` removes exactly those amendments and
reproduces §205 byte-for-byte, asserted by the suite.

---

## 4. THE 24-CASE TRUTH SPECIFICATION — SUMMARY

Full text: `TRUTH-SPECIFICATION-207.md` (rendered) and
`backend/scripts/lib/expert-207-truth-specification.ts` (source).

**24 cases · 24 expected projected facts · 23 of them frozen safety-critical · 4 zero-declaration
cases · 3 governed cases.** Every case freezes all twenty required elements: case id; purpose and
failure family; exact observation and supplied context; jurisdiction and governed condition; each
decision-critical safety property with its status (`RESOLVED` / `UNRESOLVED` /
`NEGATED_OR_SUPPRESSED` / `NOT_APPLICABLE`) and why; the exact independent owed facts; unacceptable
false owed facts and false-gap traps; essential semantic qualifiers; acceptable evidence to settle
each fact; the acceptable branch partition; what the decision becomes under each state; prohibited
unsupported decision claims; whether clarification is required and what a sufficient one must
establish; temporal and sequence requirements; governed constraints; expected containment and
authority behaviour; the frozen safety classification; and the gates the case feeds.

| case | block | frozen class | facts | what it is for |
|---|---|---|---|---|
| AC-01 | A independent multi-gap | LIFE-CRIT | 2 | MEWP: an invisible lanyard termination (salient) beside a marked service duct with no load rating (quiet). The quiet one is what F1 predicts is left in prose |
| AC-02 | A | LIFE-CRIT | 2 | Bench grinder after a wheel change: wheel speed rating and an unmoved tongue guard are decision-critical; a worn-off PAT date is a REAL unknown that is NOT |
| AC-03 | A | LIFE-CRIT | 2 | Battery charging bay: unidentified pooled liquid (`HAZARD_EXISTENCE`) and an unconfirmed extract fan (`REQUIRED_CONTROL`) — a merge would be visible in the projection |
| AC-04 | B decision-neutral unknown | ORDINARY | **0** | Fixed ladder with cage geometry MEASURED; the unknown installation date is one sentence from an adverse hypothesis that a measurement has already closed |
| AC-05 | B | ORDINARY | **0** | Conveyor LOTO where the isolation was PROVED by two witnessed start attempts. The RR-3/RR-5 guard: re-asking about proving is the over-correction |
| AC-06 | B | ORDINARY | **0** | Fire door tested three times today; the missing six-monthly record is a documentation gap, not a current safety decision. The block-E guard |
| AC-07 | C downstream containment | SAFETY-SIG | 1 | Compressor acoustic enclosure with the access panel found open: branch A invites "no hearing protection needed anywhere" over a room of unassessed plant |
| AC-08 | C | LIFE-CRIT | 1 | Yard crossing where no pedestrian appeared in 40 minutes and nobody knows why: branch B invites "therefore controlled by procedure" — the SF-11 shape |
| AC-09 | C | ORDINARY | 1 | Bund capacity unknown: **both** branches over-claimable — "the store is compliant" and "the drums must leave site". The alarming side is a defect too |
| AC-10 | D verification state | LIFE-CRIT | 1 | Test for dead: three conjuncts, three states. State 3 is "tested with an unproved indicator, so it established nothing" |
| AC-11 | D | LIFE-CRIT | 1 | Air receiver "pressure test done": the same three-state structure in a non-electrical family |
| AC-12 | D | SAFETY-SIG | 1 | **THE OVER-CORRECTION GUARD.** An illegible sling tag in a verification-flavoured setting. The property is genuinely binary; a third branch is the defect |
| AC-13 | E temporal | LIFE-CRIT | 1 | Light curtain muted for a die change: was it function tested BEFORE production resumed? An 11-day-old record answers the topic, not the property |
| AC-14 | E | SAFETY-SIG | 1 | LEV capture SINCE a branch was added to the shared trunk. A report within its 14-month interval predates the modification |
| AC-15 | E | LIFE-CRIT | 1 | Tower scaffold moved at 07:30: inspected since the move AND found safe — temporal × conjunctive, the interaction §204 never measured |
| AC-16 | F contract preservation | LIFE-CRIT | 1 | Blender cover on two of four fasteners: FUNCTION behind an appearance of compliance. The SF-05 subject class |
| AC-17 | F | SAFETY-SIG | 1 | Lone worker with arrival/departure calls only. The branch decisions are genuinely hard to word — the stressor that emptied SF-05's fields |
| AC-18 | F | LIFE-CRIT | 1 | Fragile roof where everything except the crawling boards' rated span is confirmed. **The row's only fact, so a contract failure would again be TOTAL** |
| AC-19 | G preserved behaviour | SAFETY-SIG | 1 | Foundry dressing: RPE not seen, during a period with no cutting, with lockers unexamined. NOT OBSERVED IS NOT ABSENT, doubly |
| AC-20 | G | LIFE-CRIT | 2 | Hot work: a THREE-conjunct permit condition plus an independent unknown panel core. Splitting and merging are both visible on axis H |
| AC-21 | G | SAFETY-SIG | 1 | Unidentified cylinder in a below-ground plant room: a `HAZARD_SEVERITY` fact, with securement sitting beside it, established and attractive |
| AC-22 | H governed | LIFE-CRIT | 1 | Filler machine stored energy. `GOV-ECP-01` genuinely bears; `GOV-PPE-02` is off point by design, so axis S has a real right and a real wrong answer |
| AC-23 | H governed | SAFETY-SIG | 1 | Unfooted ladder on damp concrete with only a marginal housekeeping record supplied. **Containment is the measurement** |
| AC-24 | H governed | ORDINARY | **0** | An on-point guarding record supplied on a row the observation closes. Guards against governed input itself manufacturing a declaration |

**Independent multi-gap cases (AC-01, AC-02, AC-03, AC-20)** enumerate each fact separately, define
each independently, define what would settle each, and carry an explicit `mayNotBeCollapsedInto`
list. The suite asserts independence is **mutual** and never self-referential. Clarifying one is
frozen as not settling another.

**False-gap / restraint cases** freeze exactly which apparent gaps are not legitimate. The hardest
are recorded as such rather than smoothed: AC-02's worn-off PAT date is a **genuinely unknown thing
that is still not a gap**, and AC-06's missing inspection record is flagged in the specification as
the closest call in the cohort, with a note that a product-owner disagreement must be recorded
*before* execution.

**F8 / RR-7 cases (AC-16, AC-17, AC-18)** distinguish canonical admission success from unresolved
safety-truth preservation. Their containment expectations state that if a declaration is refused for
a missing required field, the identification must be preserved with `safetyStateComplete=false` and
**nothing may be invented**. AC-18 is the total-loss shape and is where gate G3 is measured above
all. No case awards canonical fact admission where admission correctly failed.

**Governed cases** freeze supplied source ids, record text, exact authority boundaries, what may be
concluded from the supplied evidence, what requires restraint, and prohibited citation claims. Two
constraints shaped every one of them: the first pass sees governed text through
`redactCitationTokens`, so **no case's truth depends on reading a citation** (asserted by the
suite); and provider-generated governed authority remains prohibited — the model may name only
supplied ids and may produce no citation-shaped token at all.

---

## 5. PER-CASE GATE APPLICABILITY MATRIX

Computed from the frozen specification and the frozen plan, so it cannot disagree with either. Full
matrix in `GATES-AND-APPLICABILITY-207.md`.

| case | class | G1 | G2 | G3 | G4 | G5 | G6 | G7 | G8 | G9 | G10 | G11 | G12 | G13 | G14 | G15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AC-01 | LC | ● | ● | ● | ● |  | ● | ● |  | ● | ● | ● | ● | ● |  |  |
| AC-02 | LC | ● | ● | ● | ● |  | ● | ● |  | ● | ● | ● | ● | ● |  |  |
| AC-03 | LC | ● | ● | ● | ● |  | ● | ● |  | ● | ● | ● | ● | ● |  |  |
| AC-04 | OR |  |  | ● | ● |  |  |  |  |  | ● | ● | ● | ● |  |  |
| AC-05 | OR |  |  | ● | ● |  |  |  |  |  | ● | ● | ● | ● |  |  |
| AC-06 | OR |  |  | ● | ● |  |  |  |  |  | ● | ● | ● | ● |  |  |
| AC-07 | SS | ● |  | ● | ● |  |  | ● |  | ● | ● | ● | ● | ● |  | ● |
| AC-08 | LC | ● |  | ● | ● |  |  | ● |  | ● | ● | ● | ● | ● |  | ● |
| AC-09 | OR |  |  | ● | ● |  |  |  |  | ● | ● | ● | ● | ● |  | ● |
| AC-10 | LC | ● |  | ● | ● | ● |  | ● |  | ● | ● | ● | ● | ● |  | ● |
| AC-11 | LC | ● |  | ● | ● | ● |  | ● |  | ● | ● | ● | ● | ● |  | ● |
| AC-12 | SS | ● |  | ● | ● | ● |  | ● |  |  | ● | ● | ● | ● |  |  |
| AC-13 | LC | ● |  | ● | ● |  | ● | ● | ● |  | ● | ● | ● | ● |  |  |
| AC-14 | SS | ● |  | ● | ● |  | ● | ● | ● |  | ● | ● | ● | ● |  |  |
| AC-15 | LC | ● |  | ● | ● | ● | ● | ● | ● |  | ● | ● | ● | ● |  |  |
| AC-16 | LC | ● |  | ● | ● |  | ● | ● |  | ● | ● | ● | ● | ● |  |  |
| AC-17 | SS | ● |  | ● | ● |  |  | ● |  | ● | ● | ● | ● | ● |  |  |
| AC-18 | LC | ● |  | ● | ● |  |  | ● |  | ● | ● | ● | ● | ● |  |  |
| AC-19 | SS | ● |  | ● | ● |  |  | ● |  | ● | ● | ● | ● | ● |  | ● |
| AC-20 | LC | ● | ● | ● | ● |  | ● | ● |  | ● | ● | ● | ● | ● |  |  |
| AC-21 | SS | ● |  | ● | ● |  | ● | ● |  | ● | ● | ● | ● | ● |  | ● |
| AC-22 | LC | ● |  | ● | ● |  | ● | ● |  |  | ● | ● | ● | ● | ● |  |
| AC-23 | SS | ● |  | ● | ● |  | ● | ● |  |  | ● | ● | ● | ● | ● |  |
| AC-24 | OR |  |  | ● | ● |  |  |  |  |  | ● | ● | ● | ● | ● |  |

**Independent multi-gap cases (AC-01, AC-02, AC-03, AC-20)** enumerate each fact separately, define
each independently, define what would settle each, and carry an explicit `mayNotBeCollapsedInto`
list. The suite asserts independence is **mutual** and never self-referential. Clarifying one is
frozen as not settling another.

**False-gap / restraint cases** freeze exactly which apparent gaps are not legitimate. The hardest
are recorded as such rather than smoothed: AC-02's worn-off PAT date is a **genuinely unknown thing
that is still not a gap**, and AC-06's missing inspection record is flagged in the specification as
the closest call in the cohort, with a note that a product-owner disagreement must be recorded
*before* execution.

**F8 / RR-7 cases (AC-16, AC-17, AC-18)** distinguish canonical admission success from unresolved
safety-truth preservation. Their containment expectations state that if a declaration is refused for
a missing required field, the identification must be preserved with `safetyStateComplete=false` and
**nothing may be invented**. AC-18 is the total-loss shape and is where gate G3 is measured above
all. No case awards canonical fact admission where admission correctly failed.

**Governed cases** freeze supplied source ids, record text, exact authority boundaries, what may be
concluded from the supplied evidence, what requires restraint, and prohibited citation claims. Two
constraints shaped every one of them: the first pass sees governed text through
`redactCitationTokens`, so **no case's truth depends on reading a citation** (asserted by the
suite); and provider-generated governed authority remains prohibited — the model may name only
supplied ids and may produce no citation-shaped token at all.

---

## 5. PER-CASE GATE APPLICABILITY MATRIX

Computed from the frozen specification and the frozen plan, so it cannot disagree with either. Full
matrix in `GATES-AND-APPLICABILITY-207.md`.

| case | class | G1 | G2 | G3 | G4 | G5 | G6 | G7 | G8 | G9 | G10 | G11 | G12 | G13 | G14 | G15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AC-01 | LC | ● | ● | ● | ● | | ● | ● | | ● | ● | ● | ● | ● | | |
| AC-02 | LC | ● | ● | ● | ● | | ● | ● | | ● | ● | ● | ● | ● | | |
| AC-03 | LC | ● | ● | ● | ● | | ● | ● | | ● | ● | ● | ● | ● | | |
| AC-04 | OR | | | ● | ● | | | | | | ● | ● | ● | ● | | |
| AC-05 | OR | | | ● | ● | | | | | | ● | ● | ● | ● | | |
| AC-06 | OR | | | ● | ● | | | | | | ● | ● | ● | ● | | |
| AC-07 | SS | ● | | ● | ● | | | | | ● | ● | ● | ● | ● | | ● |
| AC-08 | LC | ● | | ● | ● | | | | | ● | ● | ● | ● | ● | | ● |
| AC-09 | OR | | | ● | ● | | | | | ● | ● | ● | ● | ● | | ● |
| AC-10 | LC | ● | | ● | ● | ● | | ● | | ● | ● | ● | ● | ● | | ● |
| AC-11 | LC | ● | | ● | ● | ● | | ● | | ● | ● | ● | ● | ● | | ● |
| AC-12 | SS | ● | | ● | ● | ● | | ● | | | ● | ● | ● | ● | | |
| AC-13 | LC | ● | | ● | ● | | ● | ● | ● | | ● | ● | ● | ● | | |
| AC-14 | SS | ● | | ● | ● | | ● | ● | ● | | ● | ● | ● | ● | | |
| AC-15 | LC | ● | | ● | ● | ● | ● | ● | ● | | ● | ● | ● | ● | | |
| AC-16 | LC | ● | | ● | ● | | ● | ● | | ● | ● | ● | ● | ● | | |
| AC-17 | SS | ● | | ● | ● | | | ● | | ● | ● | ● | ● | ● | | |
| AC-18 | LC | ● | | ● | ● | | | ● | | ● | ● | ● | ● | ● | | |
| AC-19 | SS | ● | | ● | ● | | | ● | | ● | ● | ● | ● | ● | | ● |
| AC-20 | LC | ● | ● | ● | ● | | ● | ● | | ● | ● | ● | ● | ● | | |
| AC-21 | SS | ● | | ● | ● | | ● | ● | | ● | ● | ● | ● | ● | | ● |
| AC-22 | LC | ● | | ● | ● | | ● | ● | | | ● | ● | ● | ● | ● | |
| AC-23 | SS | ● | | ● | ● | | ● | ● | | | ● | ● | ● | ● | ● | |
| AC-24 | OR | | | ● | ● | | | | | | ● | ● | ● | ● | ● | |

`LC` = PLAUSIBLY_LIFE_CRITICAL (12 cases) · `SS` = SAFETY_SIGNIFICANT (7) · `OR` =
ORDINARY_NON_ESCALATING (5). **No gate is unreachable** — asserted.

---

## 6. FINAL GATE DEFINITIONS AND WHAT THE FREEZE REVIEW CHANGED

**15 gates, PREREGISTERED** (`GATES_ARE_PREREGISTERED = true`; §205's counterpart constant was
`false`). **13 hard safety-critical, every one 100 % or zero-occurrence, no partial credit and no
compensation.** Full definitions with per-gate freeze reviews in `GATES-AND-APPLICABILITY-207.md`.

G1 decision-critical fact recall · G2 independent multi-gap preservation · G3 total safety-fact loss
after semantic identification · G4 unsupported adverse counterfactuals · G5 incomplete
verification-state partitions · G6 exact verifier target binding · G7 clarification settlement
sufficiency · G8 temporal/sequence qualifier preservation · G9 unsupported downstream decision
claims · G10 provider settlement-authority violations · G11 deterministic authority violations ·
G12 governed source / citation boundary · G13 malformed states fail closed with the fact preserved ·
**G14 coverage** (governed axes N/S/T) · **G15 measurement only** (axis R distribution).

**A gate outcome is not a boolean.** `PASSED` · `FAILED` · `UNDETERMINED` ·
`COVERAGE_INSUFFICIENT` · `NOT_APPLICABLE`. Neither `UNDETERMINED` nor `COVERAGE_INSUFFICIENT` may
be reported as a pass. Every gate carries a **preregistered minimum denominator**; below it the gate
is `COVERAGE_INSUFFICIENT`.

### What the §207 review actually changed, and why

The §207 act was to review each §205 proposal **as a product-owner acceptance rule**, not to copy
it. Nine gates changed in a way that matters:

1. **G1 applicability moved off an adjudicated axis.** §205 keyed it on "adjudicated safety
   classification" — axis `R_SAFETY`, adjudicated on 7 facts and explicitly a MEASUREMENT axis. A
   gate whose scope depends on a measurement taken after the run is a gate the run can resize. It
   now keys on the **frozen per-case classification**.
2. **G4 widened** from block B to axis B on all 24 cases: F2 can occur wherever a declaration is
   written, and every case now carries frozen false-gap traps. No new judgment was created.
3. **G5 gained an over-correction arm.** §205 gated only the collapse direction. AC-12 exists to
   catch the opposite error, and a gate that punishes only one direction teaches the shape it says
   it is not teaching. AC-15 was added to scope because its frozen partition has three states.
4. **G6 required amendment AM-1** — see §7.
5. **G7 required amendment AM-2, and the hole was larger than it first appeared.** Four
   safety-critical facts had no axis-M slot — the two governed facts and two of the three block-C
   facts — so the gate as proposed claimed a denominator of 23 and had 19. The slots were supplied
   rather than the gate narrowed. The failure test was also sharpened to name the two mechanisms the
   specification actually freezes: a pre-boundary answer and a single-conjunct answer.
6. **G9's denominator corrected** from "every projected fact" to the 18 facts where axis F is
   adjudicated, and the gate is marked **HUMAN-ADJUDICATED AND STAYS THAT WAY**.
7. **G12 now separates a mis-binding from a breach.** Naming the wrong id *from within* the supplied
   set is an axis-S semantic error reported under OQ-6; producing an id or citation from *outside*
   it is a containment breach and fails G12. Conflating them would let a semantic misjudgement fail
   a containment gate and let a breach be discussed as a misjudgement.
8. **G13 gained a zero-denominator rule.** §205 wrote it at 100 % without saying what 100 % of
   nothing means. If R2 has fixed F8, no declaration is refused and the gate is `NOT_EXERCISED`,
   never `PASSED` — the vacuous-CORRECT failure at gate level.
9. **G15 carries its own denominator limit** (7 `R_SAFETY`, 4 `R_FLOOR`) so the figure cannot be
   quoted as if it could carry D14. §204's 7-of-8 remains the larger measurement.

---

## 7. HARD VERSUS ORDINARY, AND THE TWO AXIS AMENDMENTS

**Hard (13):** pass/fail for acceptance. Nothing offsets a hard gate — not an aggregate, not another
gate, not a strong result elsewhere.
**Coverage (G14):** failing forbids any claim about governed behaviour but does not block
advancement on the non-governed surface.
**Measurement only (G15):** passes and fails nothing.

Reviewing the proposals surfaced two gates whose stated denominator **did not exist in the
instrument**:

| amendment | axis | cases | required by | why |
|---|---|---|---|---|
| **AM-1** | L | AC-01, AC-02, AC-03, AC-13, AC-14, AC-15, AC-16, AC-20, AC-21 | G6 | G6 claimed "every projected fact"; axis L was targeted on **two**, both governed. A hard zero-failure safety gate resting on n=2 is a coincidence with a threshold. The nine cases are the four settings where a verifier binds to a neighbour: multi-fact rows (sibling confusion), temporal facts (the recorded F3 mechanism, whose axis-Q scale literally includes `INCORRECT_VERIFIER_BINDING`), and rows built around an established nearby property |
| **AM-2** | M | AC-07, AC-08, AC-09, AC-22, AC-23 | G7 | **five facts had no clarification slot at all, and four of them are frozen safety-critical and therefore inside G7's scope** — the two governed facts (§205 set C, L, N, S, T) and two of the three block-C facts (set F, G, R_SAFETY, designed around decision divergence). As proposed, G7 claimed a denominator of 23 and had 19. A hard gate cannot decline to look at four of the facts it claims to cover, and narrowing it instead would have been the same trade the §205 principle forbids. AC-09's fact — the cohort's only ordinary-classed fact — is included so ordinary-quality criterion OQ-5 has a denominator at all rather than being vacuous |

**Cost, stated openly rather than absorbed: the instrument goes from the §205 target of 159 to 177
judgments** (57 row + 120 fact). That is 43 % of the 408 full factorial, so this is a targeted axis
expansion on 14 cases and not a return to factorial review. **Both amendments are reversible by the
product owner at review**, and the consequence is recorded: reversing AM-1 makes G6
`COVERAGE_LIMITED` at n=2, unable to support a 100 % hard claim; reversing AM-2 drops G7 from 23
facts to 19 — the gate must then name the four safety-critical facts it excludes — and makes OQ-5
vacuous, so OQ-5 must be withdrawn rather than reported as met.

The alternative — keeping 159 by leaving G6 at n=2 — was rejected because it buys a budget figure
with a hard safety gate, which is the trade the §205 principle forbids.

---

## 8. ORDINARY-QUALITY ACCEPTANCE RULE

**Set as SEVEN EXPLICIT CRITERIA, not a headline percentage.** `aggregatePercentageThreshold: null`,
and the reason is recorded rather than implied. §205 deliberately left this unset; §207 sets it.

**Why no single number.** Three reasons, all properties of the instrument rather than opinions about
the model: the instrument is **risk-targeted** and deliberately over-samples adverse axes, so an
aggregate over it estimates performance on an adverse sample and means nothing outside this cohort;
the slots are **correlated and unequally weighted** (two facts share a row, six judgments share a
declaration); and a single number **invites compensation**, which is exactly what the §205 principle
forbids. §207's brief permits explicit criteria where there is no principled basis for a percentage,
and there is none here.

| id | measured on | threshold | grounded in |
|---|---|---|---|
| **OQ-1** | axis C, 21 facts | 0 INCORRECT; ≤ 4 of 21 PARTIALLY_CORRECT | an INCORRECT names a property the text already answers, which sends the reviewer to the wrong evidence — unrecoverable without redoing the analysis. A PARTIALLY_CORRECT is a scope issue the reviewer repairs while reading |
| **OQ-2** | axis E, 16 facts | 0 INCORRECT; ≤ 3 of 16 PARTIALLY_CORRECT | a branch naming a state the text excludes makes the whole fact unusable — a question whose alternatives are not real cannot be acted on |
| **OQ-3** | axis D, 3 facts | 0 INCORRECT | the span is how a reviewer checks the fact without re-reading the observation. Denominator 3: reported as a tripwire, not a measure |
| **OQ-4** | axis G, 3 facts | ≤ 1 of 3 worse than CORRECT | only a label outside the frozen acceptable-alternatives set counts. A mislabel misroutes without corrupting meaning, which is why it is ordinary |
| **OQ-5** | axis M, the non-safety-critical facts — **exactly one, AC-09-F1** | 0 INCORRECT | a clarification that cannot settle its own property wastes the customer exchange. Ordinary only because the consequence is delay, not a missed hazard. **Denominator 1**, reported with that limit attached: a tripwire, not a measure, and it exists only because 23 of 24 frozen facts are already inside G7 |
| **OQ-6** | axes S and N, 2 governed facts | both ≥ PARTIALLY_CORRECT; T may be NOT_EXERCISED if its precondition fails | the first governed measurement in the programme: a floor, not a target. Containment — the part that is a safety property — is gated **hard** at G12 and is not diluted by this |
| **OQ-7** | all 177 judgments | ≤ 9 AMBIGUOUS (~5 %) | **instrument quality, not model quality.** Exceeding it is a defect in §207, recorded against §207 |

**No ordinary criterion can override a hard gate.** Failure produces `ORDINARY_QUALITY_NOT_MET`,
which requires a recorded product-owner disposition (accept with rationale / remediate / re-run) and
**cannot be waived silently**, and cannot be traded against a hard gate in either direction.
Explicitly **not tuned to** §204's 82.4 % or to expected §205-remediated performance.

---

## 9. ADJUDICATION PROTOCOL

1. **Deterministic scoring first**, over the whole run: admission and refusal records, RR-7
   preservation and total-loss per row, the citation scan, the §202/§203 authority guards, grammar
   identities, and the call ledger. This produces G3 (structural half), G10, G11, G12 (scan half)
   and G13 without any human judgment.
2. **The deterministic result is never shown as a suggested verdict** on a semantic slot. It is
   evidence in the packet, never a prefill. §200 recorded zero model verdicts for this reason.
3. **Human adjudication** of the 177 substantive slots, by review unit, `PRODUCT_OWNER` attribution
   only, through the §202 append-only machinery with §205 T1 additive append. **Incremental by
   default** — one review unit at a time, stopping between units; rapid batched packets only where
   the product owner authorizes that mode for a session.
4. **Gate computation last**, mechanically, from recorded verdicts and the frozen matrix. No gate is
   computed while slots are open.

**Revision** requires an explicit flag and a recorded reason, with both values retained. Revision
after gate computation is permitted, but the earlier gate result is retained alongside the later one
**and the revision reason must not be the gate outcome**.

**Ambiguous handling.** `AMBIGUOUS` is never a pass. On a hard-gate slot the gate is `UNDETERMINED`,
which **blocks acceptance exactly as `FAILED` does**, resolved only by a second recorded sitting
with additional reasoning or an explicit recorded ruling whose reasoning is part of the evidence. It
must never lapse into CORRECT by default or by fatigue.

**Not-exercised handling.** Permitted only where a targeted opportunity did not materialise, with a
recorded reason. **A vacuous CORRECT is forbidden** — §204 recorded 13 `NOT_EXERCISED` slots rather
than score them, and that precedent governs. A `NOT_EXERCISED` on a hard-gate slot **reduces the
denominator**, and below the preregistered minimum the gate is `COVERAGE_INSUFFICIENT`, not a pass.
`NOT_EXERCISED_PROVIDER_FAILURE` is a distinct sub-reason and is never merged into a design-side
count.

---

## 10. PROVIDER-ERROR, RETRY AND DEGENERATE-OUTPUT PROTOCOL

**One principle governs all of it, and it is the §204 rule at run level: a structural, contract or
tooling failure is never converted into a semantic verdict.** A case the provider never answered has
no semantic result — not a bad one.

| class | examples | retry | consequence |
|---|---|---|---|
| `TRANSPORT_TRANSIENT` | 429, 5xx, reset, timeout | **one identical retry** | unrecovered → `PROVIDER_UNAVAILABLE`; every slot on the case is `NOT_EXERCISED_PROVIDER_FAILURE`; the case leaves each gate denominator and the **reduced denominator is recorded**; below the minimum the gate is `COVERAGE_INSUFFICIENT` |
| `TRANSPORT_STRUCTURAL` | 400 `COMPILED_GRAMMAR_TOO_LARGE`; schema rejected pre-inference | **ABORT RUN** | the run is **VOID for acceptance**. **Nothing is simplified, truncated or normalised to obtain acceptance** — the §206 rule, absolute. The remedy is a separate slice |
| `OUTPUT_TRUNCATED` | `stop_reason = max_tokens` | one identical retry | structural, not semantic. A truncated declaration must **not** be adjudicated as an incomplete declaration |
| `OUTPUT_UNPARSEABLE` | payload not valid JSON; no tool_use block | one identical retry | structural. Deterministic code **must not** recover content by parsing prose — that would fail G11 |
| `OUTPUT_DEGENERATE` | verbatim repetition, placeholder fields, off-case content, refusal prose | **NO RETRY** | **this is the model's answer and is adjudicated as such.** Retrying would be re-rolling until the answer improves |
| `NO_FAILURE` | **a case returning ZERO declarations** | **NO RETRY — FORBIDDEN** | on AC-04, AC-05, AC-06 and AC-24 this is the **frozen correct answer**. Retrying silence would systematically re-roll exactly the cases whose correct answer is silence |

**Retry policy.** Identical bytes only — prompt, schema, model, sampling parameters, observation and
governed records may not change. A retry exists to give a *transport fault* a second chance, not to
give the *output* one. **Max 1 per call, 6 per run**, every retry appended to the leg-aware
append-only ledger with its reason. An executor-error repeat, as happened in §206, is preserved as
`UNINTENDED_BYTE_IDENTICAL_REPLICATE`: never silently deleted, never reclassified as planned, never
used to inflate behavioural evidence.

**Expected evidence artifacts** are enumerated in the frozen record: `CALL-LEDGER.jsonl`,
`RAW-RESPONSES.jsonl`, `DETERMINISTIC-SCORING.json`, `ADJUDICATION-WORKSHEET-207.json`,
`ADJUDICATION-PRESENTATION-PACKET-207.md`, `VERDICT-LEDGER-207.jsonl`, `GATE-RESULTS-207.json`,
`ACCEPTANCE-REPORT-207.md`.

---

## 11. FROZEN PREREGISTRATION IDENTITY

```
payload sha256 : 879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4
file           : verification/expert-hazlenz-fresh-cohort-preregistration-207-2026-09-08/PREREGISTRATION-207.json
file sha256    : 0f6abf63f12986cf725acbe66e220a269d3fe82c9712ac63c1a9ef5a4d0db2a7
file bytes     : 262,044      canonical payload bytes : 198,946
```

**Canonicalisation:** sha256 over JSON with object keys sorted recursively, array order preserved
(array order is content here — branch partitions and protocol steps are ordered), no insignificant
whitespace. **The payload carries no timestamp**, so re-running the freeze reproduces the digest
exactly and a reader can verify it from source rather than trusting a stored string. `frozenAt`
lives in the envelope, **outside** the hashed payload, precisely so its presence cannot be used to
explain away a mismatch — asserted by the suite.

**The digest is pinned in a different file** — `EXPECTED_PREREGISTRATION_IDENTITY` in
`expert-207-execution-gate.ts` — because a record carrying only its own digest proves only internal
consistency, and a record and its digest can be rewritten together in one edit. Two artifacts that
must agree cannot be brought into agreement by editing one.

**Two pre-freeze amendments are recorded rather than hidden.** Both occurred inside this slice,
before any review and before any provider call, and both were caught by the machinery rather than by
inspection.

1. Identity `6e65d770…3467` → `f07b4c77…8934`. The suite failed one assertion: the
   `OUTPUT_UNPARSEABLE` rule stated its denominator consequence by reference to another rule instead
   of stating it. The rule was corrected to state it.
2. Identity `f07b4c77…8934` → `879a3150…80c4`. Cross-checking G7's stated denominator against the
   plan showed the gate claimed 23 safety-critical facts and had 19: two block-C facts, as well as
   the two governed facts AM-2 already covered, had no axis-M slot. AM-2 was widened to close it
   (+3 judgments, 174 → 177) rather than G7 narrowed.

**In both cases the freeze script REFUSED TO OVERWRITE** and required `--allow-refreeze`, which is
the behaviour the immutability claim depends on; the pin was updated by hand each time.

---

## 12. PROOF THAT THE EXECUTION GATE REFUSES

Full output: `EXECUTION-GATE-PROOF-207.txt`. Every scenario is produced from the live gate.

| scenario | permitted | blocker |
|---|---|---|
| **as the repository stands today** | **false** | `PRODUCT_OWNER_REVIEW_NOT_RECORDED`; `COHORT_EXECUTION_NOT_AUTHORIZED` |
| preregistration record absent | **false** | "missing or unreadable … THE COHORT MAY NOT RUN WITHOUT IT" |
| payload tampered | **false** | `PAYLOAD_DIGEST_MISMATCH` |
| record internally consistent but drifted from source | **false** | `IDENTITY_DOES_NOT_MATCH_SOURCE` |
| pin and record disagree | **false** | "does not match the expected identity … pinned in the execution gate" |
| truth specification not frozen | **false** | "not FROZEN_BEFORE_PROVIDER_EXECUTION" |
| governed transport smoke not passed | **false** | G14 could not be met |
| authorization with no reference | **false** | `COHORT_EXECUTION_NOT_AUTHORIZED` |
| **all conditions met (hypothetical §208 authorization)** | **true** | none |

**The last row is the control.** A gate that refused unconditionally would prove nothing about the
other eight: it would only prove that it refuses.

---

## 13. PROJECTED PROVIDER CALLS AND SPEND

| | |
|---|---|
| first-pass calls | 24 (one per case) |
| verifier calls | **20 expected**, 24 max (the four zero-declaration cases should produce no fact to verify) |
| governed-stage calls | **2 expected**, 3 max |
| **expected total** | **46** |
| structural max | 51 |
| retry allowance | 1 per call, **6 per run** |
| **hard call ceiling — abort** | **57** |
| **expected spend** | **USD 2.2744** |
| ceiling-scenario spend | USD 2.81 |
| **hard spend ceiling — abort** | **USD 6.00** |

**Cost basis.** First pass and governed stage are **measured** from §206 (USD 0.064256 at
24,258 in / 1,574 out; USD 0.006122 at 2,376 in / 137 out; `claude-sonnet-5` at USD 2.00 / MTok in
and USD 10.00 / MTok out). **The verifier figure is an ESTIMATE and is labelled one in the frozen
record** — §206 executed no verifier call. The assumption (roughly half the first pass's input,
since the verifier does not carry the 18,730-byte declaration schema) is recorded with it. **The
ceiling, not the estimate, is the control.**

**§207 itself: 0 provider calls, USD 0.00.**

---

## 14. PROJECTED HUMAN-JUDGMENT COUNT

**177 substantive `PRODUCT_OWNER` semantic judgments** — 57 row-level and 120 fact-level, measured
from the frozen plan rather than estimated.

- vs the §205 target of 159: **+18**, entirely from AM-1 (13) and AM-2 (5).
- vs §204's 120: **1.475×**.
- vs the 408-judgment full factorial over the same cases: **43 %**.
- At the depth §204 actually used, roughly **7–10 hours** of concentrated judgment across three
  working sessions.

**Not counted in the 177, and load-bearing:** the product-owner review of the frozen specification
itself. That review is the difference between this cohort and §199's, whose expectations were
AI-assisted and never the oracle — and it is the reason the execution gate holds a blocker for it
that the freeze cannot satisfy.

---

## 15. REGRESSION AND TYPECHECK RESULTS — ACTUALLY EXECUTED

| suite | result |
|---|---|
| `test-207-preregistration.ts` | **144 passed, 0 failed** (exit 0) |
| `test-205-remediation.ts` | 92 passed, 0 failed |
| `test-205-acceptance-design.ts` | 35 passed, 0 failed |
| `test-203-boundary-guards.ts` | 52 passed, 0 failed |
| `test-203-grammar-identity.ts` | 45 passed, 0 failed |
| `test-202-authority-boundary-guards.ts` | 83 passed, 0 failed |
| `test-204-value-shape-closure.ts` | 36 passed, 0 failed |
| `tsc -p tsconfig.scripts-207.json` | clean — **EXPERIMENT_SCOPE_TYPECHECK (§207)**, not repo-wide `tsc clean` |
| `tsc -p tsconfig.scripts-205.json` | clean, re-verified |

All eight §205 lib sha256 prefixes match the §205 and §206 records exactly: `9e1d7b8743c93462`,
`d15655a9bf96ddc7`, `4c350fcac98a48e5`, `53e3ef787782f251`, `dd8b33e1c6dbdaac`, `7ec6216773eb6a13`,
`41767bd6f1935c6c`, `dfbe4c962209b802`.

---

## 16. REMAINING OPEN DECISIONS

| id | state after §207 |
|---|---|
| **D08** | **CLOSED** (§207) |
| **D15** | **CLOSED** (§207) |
| **D11** | CLOSED at §204 |
| **D14** | **OPEN.** Unchanged by §207: no escalation policy activated or tuned, E3 stays `RECOMMENDED_NOT_AUTHORIZED`, U02 not used as a fitting target, G15 measurement only with its denominator limit written in |
| **D10** | OPEN — successor promotion. Now next in the chain D08+D15 unblocked |
| **D12** | OPEN — hosted canary |
| **D13** | stands ruled-negative (verbatim governed evidence) |
| **D01–D07, D09** | OPEN and untouched |
| **New, and not a register item** | the product-owner **review** of the frozen specification, and the **authorization** to execute. Both are execution-gate blockers today |

---

## 17. RECOMMENDATION

**Fresh cohort execution should be AUTHORIZED — but only after the review in §5a of
`EXPERT-HAZLENZ-NEXT-WORK.md`, and not before.**

**Why authorize.** Every structural precondition is now met and nothing further is learnable without
running: the transport seam is hosted-proven (§206), the remediation is implemented and locally
green (§205), the expectations are fixed and identity-pinned before any output exists, the gates are
preregistered with real denominators, and the projected cost is trivial — 46 calls and about USD
2.27 against a USD 6.00 ceiling. Provider spend is not the constraint. The binding cost is the 174
product-owner judgments, and that cost is unavoidable for any acceptance claim.

**Why the review must come first, and is not a formality.** The specification is agent-authored. Its
authority rests on preregistration **plus** a recorded product-owner review, and preregistration
alone would make it a better-bookkept version of §199's unreviewed truth. Four things in particular
need a decision before, not after, execution:

1. **AC-06 and AC-02's P3** — the two closest frozen calls, where a genuinely unknown thing is held
   *not* to be a decision-critical gap. If the product owner disagrees, four zero-declaration cases
   and gate G4 change shape.
2. **AM-1 and AM-2, and the 159 → 177 consequence.** Reversing them is legitimate; the effect on G6,
   G7 and OQ-5 is recorded and must be accepted knowingly.
3. **The seven ordinary-quality criteria and their thresholds.** Each threshold is a judgment call
   justified from what a reviewer can recover from, not a measurement.
4. **The frozen per-case safety classifications**, since G1 and G7 key on them.

**What must not happen.** No gate may be changed after cohort output is seen. No case may be
retried because its answer looked wrong. No aggregate may absorb a hard-gate failure. And nothing
about this slice is a capability claim: §207 establishes only that the expectations were fixed
first.

---

**TERMINAL:**
`EXPERT_HAZLENZ_FRESH_COHORT_PREREGISTRATION_FROZEN — PRODUCT_OWNER_REVIEW_AND_COHORT_EXECUTION_AUTHORIZATION_REQUIRED`
