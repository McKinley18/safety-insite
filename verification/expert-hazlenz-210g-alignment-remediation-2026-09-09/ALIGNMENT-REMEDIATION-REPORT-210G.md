# §210G — FINAL R4 DECLARATION-WIDE SEMANTIC ALIGNMENT

**`EXPERT_HAZLENZ_R4_DECLARATION_WIDE_ALIGNMENT_IMPLEMENTED — FINAL_R4_HOSTED_CONFIRMATION_REQUIRED`**

Provider calls **0**. Database operations **0**. No customer or production activation. No commit,
push, tag or deploy. E1–E4 not rerun. §210F raw evidence, projection, contract validation, call
ledger and adjudication all untouched. R5, R6 and R7 not modified.

---

## 1. The instruction change

One appended block on top of §210E, built the way §210E was built on §210C: inserted before the same
unique closing anchor, reversible byte for byte. **Neither `expert-first-pass-instruction-210c.ts`
nor `expert-first-pass-instruction-210e.ts` is edited**, so their identities and suites are
untouched.

| | |
|---|---|
| Module | `backend/scripts/lib/expert-first-pass-instruction-210g.ts` |
| Version | `hazlenz.expert.first-pass-instruction.210g-R4B` |
| Base | `hazlenz.expert.first-pass-instruction.210e-R4-R7` (`874d26d4…`, the exact prompt §210F tested) |
| Plain identity | **`0f547b124afe0f6db51af6a63af8c42273f34c81b3d1ee4f291c93d6dba76591`** |
| Governed identity | **`32b10f090c136b2e7b302d798de52193f1bd01296f364e189488457006a494e0`** |
| Prose removed | none |

**ONE gate, numbered GATE 12**, continuing §210E's GATE 8–11 without collision in either variant.
The authorization asked for one declaration-wide gate and the suite asserts the block contains
exactly one.

**GATE 12 — the whole entry answers one property: the one you wrote.** `missingFact` is the
invariant. `branchA`, `branchB`, `decisionIfA`, `decisionIfB` and every bound question are read back
against it, and each must answer or act on that property. The rule is stated over the contract's own
field names, which is what keeps it case-independent; no §210F vocabulary appears anywhere in it.

Inside the one gate, each requirement the authorization named:

- **The state-world test.** Picture the world where the state is true and nobody has measured,
  inspected or written anything down, then read your own `branchA` and `branchB` and ask whether
  they put that world on the true side.
- **Repair direction.** Bring every field back to the property, never cut detail out of the property
  to make it agree with the branches. This closes off the destructive-repair route §210C introduced
  and §210D's D1.Q4 was built to catch.
- **The branch requirement.** Branches divide the property, not known from unknown, confirmed from
  unconfirmed, tested from untested, or written down from not written down. Nothing having been
  established is what leaves the entry unresolved and is never a finding that the bad state is true.
- **The decision requirement.** `decisionIfA` follows from `branchA` being true, not from somebody
  having produced a result to that effect.
- **The clarification requirement.** A bound question may still ask for evidence and usually should.
  Asking does not turn the property into whether the reading was taken; what it means is the answer
  has to settle the property.
- **The property-selection check.** Ask what you would need if you could simply see the workplace as
  it is. If seeing it would settle the entry, the checking is evidence. If seeing it would leave the
  decision still turning on whether the required act was carried out, the act is the property.
- **Shape 2 named directly.** Asking whether the cleaning ran instead of whether anything harmful is
  still there; whether the thing was examined instead of whether it will carry the load.

The block opens by saying it **adds no new reason to declare anything**, so GATE 12 cannot become a
source of extra declarations.

### The narrowing, which is the point

R4B could become the next defect by pushing every branch toward a physical condition, which would
break the entries where performing an act is the owed property. That is the §210F E4 shape, which
passed both mandatory overcorrection questions, and it is the thing this slice must not spend.

GATE 12 therefore ends by saying that where seeing the workplace would leave the decision still
turning on whether the required act occurred, **the act IS the property — write it, in `missingFact`
and in the branches both**, and that GATE 8 said this case is not rare and this gate does not take it
back. The suite asserts the narrowing is stated, asserts it names what it protects
(`SECTION_210F_E4_Q3_AND_E4_Q4`), and asserts the block contains no absolute prohibition on any word.

## 2. There is deliberately no deterministic half

R7 carried one. R4B carries **none**, and that is a decision rather than an omission.

"The cube tests have not yet confirmed adequate strength" is a well-formed sentence. Deciding that
it tracks the evidence rather than the state means reading it **as safety semantics**, which
deterministic code in this architecture may never do — it may validate, project and refuse
model-authored semantics, never invent or reconstruct them. A keyword rule over *confirmed*,
*tested* or *shows* would refuse legitimate act-shaped branches, including every branch of the E4
shape this slice is required to protect, and would be manufacturing a semantic verdict it has no
authority to reach.

R7's deterministic half was safe because filler is a **closed set of whole-field literals**, matched
after trimming and never as a substring. Nothing is inferred from meaning.

The suite asserts this positively: the projection still carries **18** refusal codes, no code named
for R4B exists, and `NON_SEMANTIC_PLACEHOLDER_VALUE` is still present and still routed through
`CONTRACT_INCOMPLETENESS_CODES`.

## 3. Closed mechanisms are not disturbed

R5, R6, R7, §210C's GATE 2 and GATE 3, independent fact preservation, RR-7 and the governed-stage
architecture are all untouched. The suite asserts GATE 2, GATE 3, GATE 9, GATE 10 and GATE 11 are
still present, that the whole §210E block survives byte for byte, that no §210E line was reworded,
and that the new block does not so much as mention a closed gate by number — GATE 12 cites only
GATE 8, which it continues.

## 4. Static-token delta — measured

| | Plain | Governed |
|---|---:|---:|
| Characters before | 52,409 | 53,746 |
| Characters after | 55,398 | 56,735 |
| **Added characters** | **+2,989** | **+2,989** |
| **Estimated added tokens** | **~+1,047** | **~+1,047** |

Estimated from the §208 ratio of 69,968 body bytes to 24,512 input tokens. A derived estimate from
real cohort data, **not a tokenizer result**.

For scale: §210B-2 added 3,482 characters, §210C added 2,858, §210E added 3,279. §210G is the
smallest successor amendment of the three that carry a narrowing. Cumulative first-pass prompt is now
55,432 bytes, roughly 19,408 tokens estimated.

Projected effect on a future run: about **+1,047 input tokens per call**. At the configured rate of
USD 2 per million input tokens that is roughly **+0.0021 USD per call**, or **+0.0063 USD across
three calls**.

## 5. Local fixture results

Eight fixtures in `backend/scripts/lib/section-210g-alignment-fixtures.ts`, covering the eight
distinctions the authorization names. Each carries a **concrete declaration shape** — the five
contract fields plus the bound question — because R4B is about whether those fields agree with each
other, and a scenario alone cannot show that.

| Fixture | Intent | Alignment verdict | What it holds |
|---|---|---|---|
| `FX-R4B-A-STATE-ADEQUATE-TEST-ABSENT` | prevent defect | ALIGNED | A sound but unexamined crane rope is `branchA`. The missed examination is why the entry is unresolved, not a finding of wear. |
| `FX-R4B-B-STATE-INADEQUATE-TEST-SAYS-ADEQUATE` | prevent defect | ALIGNED | Passing wall-thickness readings taken at the wrong location do not settle the property. The state stays authoritative. |
| `FX-R4B-C-CLEANING-PROCESS-VERSUS-RESIDUAL-STATE` | prevent defect | ALIGNED | The property is whether combustible deposit remains, not whether the strip-out finished. |
| `FX-R4B-D-INSPECTION-PROCESS-VERSUS-LOAD-CAPACITY` | prevent defect | ALIGNED | The property is whether the grating will carry the load, not whether it was inspected. |
| `FX-R4B-E-REQUIRED-ACT-IS-THE-PROPERTY` | **counter-control** | ALIGNED | A handover that was or was not given. Perfect sight of the workplace does not settle it, so the act stays in the property and in both branches. |
| `FX-R4B-F-PROPERTY-CORRECT-BRANCHES-PROXY` | prevent defect | **DRIFTED_TO_EVIDENCE** | Correct property, branches partitioned on whether readings exist. The §210F E1 shape in a different setting. |
| `FX-R4B-G-PROPERTY-CORRECT-CLARIFICATION-EVIDENCE-BASED` | **counter-control** | ALIGNED | The bound question asks for an insulation resistance test and that is correct, because the answer settles the property. |
| `FX-R4B-H-PROPERTY-CORRECT-DECISION-EVIDENCE-CONDITIONED` | prevent defect | **DRIFTED_TO_EVIDENCE** | Correct property and correct branches, decisions conditioned on locating a certificate. Isolates the decision field, which no other fixture does. |

The fixture checker enforces an invariant the suite then asserts: **the alignment verdict and the
state-world placement may never disagree.** A shape that puts the state-true-and-unestablished world
on the adverse side is `DRIFTED_TO_EVIDENCE` by construction; an entry whose property is the act
posits no such world and cannot drift to its own evidence. It also refuses any fixture that replays
§210D, §210E or §210F vocabulary, names a prior case, or labels its own answer.

**`test-210g-alignment-remediation.ts` — 87 passed, 0 failed.**

These are frozen expectations, not results. **No fixture here can pass or fail on model behaviour**,
and unlike §210E's R7 fixtures there is nothing executed against a checker that reads meaning,
because R4B has no deterministic half. **A semantic PASS may only be claimed from a hosted run.**

## 6. Protected regression — exact counts

| Suite | Result |
|---|---|
| §205 remediation | **92 passed, 0 failed** |
| §207 preregistration | **144 passed, 0 failed** |
| §209 batch recorder | **116 passed, 0 failed** |
| §210B-1 structural | **55 passed, 0 failed** |
| §210B-2 semantic | **36 passed, 0 failed** |
| §210C residual | **92 passed, 0 failed** |
| §210E final | **103 passed, 0 failed** |
| §210G alignment (new) | **87 passed, 0 failed** |
| **Total** | **725 passed, 0 failed** |

Project type check clean. Two independent construction checks confirm nothing frozen moved: the
§210D preregistration builder still reproduces **`55510f9c…`** and the §210F preregistration builder
still reproduces **`2c186aa1…`**, both exactly.

§210F persisted evidence is unchanged — raw responses, call ledger, projection and contract
validation all still carry their execution-time write, and the adjudication is byte-identical at
`c0d09ab7…`. The pinned v15 prompt is still `bfe564c2…`.

## 7. Expected effect on R4, and what would falsify it

Stated as expectations. Nothing here has been tested against a model.

**Shape 1, evidence-conditioned branches — expected to be fixed by the state-world test applied to
the branches.** The risk is the counter-control case: a model that now refuses to let an act appear
in a branch even where the act is the property. `FX-R4B-E` is the local guard and G3 is the real one.

**Shape 2, the establishment process as the property — expected to be fixed by the
property-selection check.** The risk is a model that becomes reluctant to name any process, which is
the same overcorrection from the other side, and again G3 is the test.

**The interaction to watch.** §210C's GATE 2 pushes toward emitting and GATE 3 toward deleting;
§210E's GATE 8 narrows the property and GATE 11 withholds incomplete entries; GATE 12 now pulls every
field toward the property. Five opposed pressures act on the same entry. §210D showed the first pair
balanced and §210F showed the second pair balanced with both narrowings intact, but that GATE 12 does
not disturb either balance is an expectation, not a measurement.

**What would falsify the slice most cheaply:** a G3 result where the model writes a state-shaped
property for an act-shaped fact, or hedges a sole-blocker decision. Either would mean R4B
over-restrained and the E4 gain was spent.

## 8. Recommended final hosted confirmation

**Three cases, R4-only.** Not another broad cohort and not another four-axis experiment. R5, R6 and
R7 are closed on §210F targeted evidence and are not re-probed as targets, though they will be
observed where the cases naturally exercise them.

| Case | Target | Shape |
|---|---|---|
| **G1** | Shape 1 | An underlying state with a measurement or test that has not been taken, where the state and the evidence clearly come apart. Adjudicated on whether the branches classify the state-true-and-unmeasured world on the true side, not only on whether `missingFact` is pure. |
| **G2** | Shape 2 | An underlying state produced by an establishment process that has run, or partly run, where the tempting property is whether the process completed. Adjudicated on whether the property tracks the resulting state. |
| **G3** | Counter-control | One fact where performance of a required act IS the property and there is no sibling blocker. **Mandatory and load-bearing.** Must show the act named in `missingFact` and in the branches, and the sole-blocker decision left unhedged. |

**G3 is the case that fails if the narrowing was lost**, exactly as E4 was for §210E. G1 and G3
together are the only evidence that GATE 12 aligns the branches without forbidding an act-shaped
one; neither alone would show it.

Suggested axis set, deliberately narrow: property purity, **declaration-wide alignment** (new, the
R4B axis), branch partition basis, decision basis, clarification validity, overcorrection control,
and false-gap restraint. Retain the clarification-binding and containment observations as **recorded
but not re-targeted**, since re-opening closed mechanisms as targets is what turns a slice into a
cohort.

No replay of E1–E4, no noun substitutions, capability-ABSENT on every case, no verifier and no
governed-stage call. Preregister and freeze before execution as §210D and §210F were.

**Projected cost** from §210F's measured medians plus the §210G delta: **27,237 input and 2,449
output tokens per call**, which at the configured rates is **0.0790 USD per call** and **0.2369 USD
for three**, uncached per TBR-20. Worst case, every call running to the 4,000-token allowance on an
input 1,000 tokens above projection, is **0.2894 USD**. A ceiling of **0.35 USD** sits above that, so
no case can be forced to stop.

## STOP

Local implementation, fixtures, suite and the confirmation recommendation are complete. No provider
call was made. No case was rerun. Nothing was remediated beyond R4B, and no closed mechanism was
touched. No verifier testing was started.

**S6 remains NOT_EXERCISED.** Nothing in §210F or §210G bears on it, and governed evidence stays in
the separate governed stage.
