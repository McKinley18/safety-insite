# §228 — TARGETED INTEGRATED REVALIDATION: STOPPED BEFORE PROVIDER SPEND

**0 provider calls · USD 0.00 · 0 database operations · nothing frozen · no commit, push, tag or
deploy.**

The §228 authorization contains an explicit stop clause:

> Provider calls: use the frozen design's exact call count. Spend: use the frozen design's projected
> spend and hard ceiling. Before spending, report both.
> **If the design does not already specify them unambiguously: STOP before provider spend and report
> the deficiency.**

That clause is triggered. This document is the deficiency report.

---

## 1. What the "design already produced after §227" actually is

It is one prose section of the §227 report, headed **"Recommended next phase — DESIGNED, NOT
EXECUTED, NOT AUTHORIZED"**. It is a ten-bullet scope list naming the paths to exercise. It is not an
executable frozen design.

Searched, and absent:

- `verification/expert-hazlenz-228*` — does not exist
- `backend/scripts/lib/expert-228-*.ts` and `backend/scripts/*228*` — do not exist
- `SECTION-227-FROZEN-PROTOCOL.json` — carries no next-phase, design, call-plan or spend block
- `grep revalidation` across `docs/` and `backend/scripts/` — the only hit is that §227 prose
- `git status` across `docs/`, `backend/scripts/`, `verification/` — no untracked §228 material

## 2. The three mandatory parameters

| parameter | specified by the design | value |
|---|---|---|
| provider call count | **NO** | — |
| projected spend | **NO** | — |
| hard ceiling | **NO** | — |
| case count | **NO** | — |

The §227 scope paragraph contains no number of any kind.

**The §221 numbers were considered and refused as substitutes.** `expert-221-integrated-instrument.ts`
pins 22 maximum calls, USD 1.3127 projected, USD 1.78 ceiling, 10 cases and 19 planned calls. Those
are §221's frozen numbers for §221's cohort. Adopting them would substitute a prior instrument's
authorization for a design that was never authored, and would have me set the parameters the §228
order reserved to the frozen design. Invariant 21 — preregistration precedes execution.

## 3. Pre-spend coverage verification

The §228 order requires verifying the design covers every required path before spending. Assessed
against the ten §227 bullets as written.

| # | required path | §227 scope | gap |
|---|---|---|---|
| 1 | declaration → owed-fact projection | **YES** | — |
| 2 | exact-property preservation | **PARTIAL** | §227 stops at the ledger; §228 requires the same proposition through verifier, review packet, authority and settlement |
| 3 | verifier routing | **PARTIAL** | §228 names three minimum routes; the design assigns none to a case |
| 4 | KR-1 property authority A–E | **PARTIAL** | The five-step sequence is not decomposed into preregistered steps. This is the path §221 never exercised, so it carries the least machinery and the most authoring risk |
| 5 | human CONFIRM_PROPERTY | **PARTIAL** | The three negative limbs are unstated. Observing a confirmation is easy; proving it did not approve evidence, settle or authorize work needs explicit negative assertions |
| 6 | human CORRECT_PROPERTY | **YES** | The limb that the original property must not settle is not separately stated |
| 7 | evidence authority distinct | **YES** | — |
| 8 | satisfactory settlement | **YES** | — |
| 9 | adverse / KEEP_UNRESOLVED | **PARTIAL** | KEEP_UNRESOLVED is not named in the §227 scope at all; sibling intactness is implied, not required |
| 10 | RR-7 | **PARTIAL** | The limb that a preserved malformed record cannot settle is unstated |
| 11 | safe / negated restraint | **YES** | — |
| 12 | governed regulatory grounding | **PARTIAL** | Five sub-requirements, none stated. The off-point-source limb needs a deliberately off-point supplied record in the payload, which is case-authoring work |

**Five covered, seven partial, of twelve.**

## 4. Four §228 requirements absent from the design entirely

**The §227 residual containment inspection.** §228 requires classifying the five §227 residual
branch/decision defects CONTAINED or UNCONTAINED where naturally exercised. §227 recorded those
defects *after* its design paragraph was written. No observation slot or classification rule exists
for them anywhere.

**The gate-coverage authoring repair.** §227 stated it as a precondition: the gap that produced
§221's six `COVERAGE_INSUFFICIENT` results "must be repaired in that instrument before it is frozen,
not in a later report". No repaired denominator scheme was authored. Measured from the §221
instrument at zero cost:

| gate | cases listing it | judgment slots feeding it |
|---|---|---|
| IG12 | 10 | **1** |
| IG1 | 9 | **1** |
| IG5 | 8 | 6 |
| IG4 | 4 | 2 |

Freezing a §228 instrument without repairing this reproduces `COVERAGE_INSUFFICIENT`, and invariant
23 makes that neither a pass nor repairable afterwards.

**Preregistered human actions.** §228 execution discipline requires them. No human action is assigned
to any case, because no case exists.

**The pre-spend truth preflight inputs.** The §226/§227 preflight is a function over authored cases:
established facts, unresolved properties, non-facts, prohibited proxies, expected declaration count,
controlling property, human action, evidence action, expected settlement, expected final state. With
zero cases it has nothing to check. **It cannot be run, and therefore cannot pass.**

## 5. One §228 question answered at zero cost

**Is `assertedConditionState` load-bearing downstream? For deterministic authority logic: NO.**

Established by static inspection, no code changed, no calls made. Zero occurrences in every module on
the integrated authority path: §210J declaration projection, the §212 verifier payload, the owed-fact
ledger, owed-fact binding, property authority, settlement review, and governed-evidence derivation.
`expert-221-assembly.ts` references neither the field nor the selective-verification trigger. No
deterministic step in the integrated path infers safety truth from the label.

**One qualification, which matters for how a §228 cohort should observe.** The label *is* transmitted
to the second model pass as prose — `expert-verifier-instruction-v3.ts:371` renders
`state=${assertedConditionState}` into the verifier prompt. §227 recorded on K7 that the label can
contradict the model's own reasoning. A §228 cohort should observe whether a wrong label visibly
moves the verifier's nomination. The verifier is advisory and cannot settle, so this is an
observation, not grounds for a new gate. Reported, not modified.

A separate module, `expert-selective-verification-trigger.ts`, does branch on the field. It is
imported only by `expert-verifier-contract.ts` and by test and probe scripts, and is not on the
integrated path.

## 6. Why the seven required output files were not produced

`SECTION-228-FROZEN-PROTOCOL.json`, `SECTION-228-RAW-RESULTS.json`,
`SECTION-228-INTEGRATED-RESULTS.json`, `SECTION-228-AUTHORITY-TRACE.md`,
`SECTION-228-RESIDUAL-CONTAINMENT.md` and `SECTION-228-REPORT.md` are each a record of an executed
run. No run occurred.

Authoring a frozen protocol here would mean choosing the call count, spend and ceiling the §228 order
reserved to the design. A results, trace or containment file with no execution behind it would be a
fabricated record. Invariant 27: an authored artifact is never evidence of behaviour.

## 7. What is required before §228 can spend

1. **A product-owner decision** fixing case count, exact provider call count, projected spend and
   hard ceiling.
2. **A §228 instrument** authored as an additive successor to `expert-221-integrated-instrument.ts`
   (invariant 26), assigning all twelve required paths to named cases and decomposing KR-1 into its
   five preregistered steps.
3. **A repaired denominator scheme** — every gate a case lists as exercised must be fed by at least
   one authored judgment slot.
4. **Observation slots and a CONTAINED/UNCONTAINED rule** for the five §227 residual defects.
5. **Preregistered human actions** per case, each with its expected authoritative end state.
6. **A governed-evidence payload** carrying both an on-point authorized record and a deliberately
   off-point one, so requirement 12 has a genuine opportunity to fail.
7. **The §226/§227 truth-consistency preflight** run over the authored cases and passing, before the
   freeze and before the hash.

---

## Final report

**Preflight:** **NOT RUN** — it is a function over authored cases and no case exists. It cannot pass.

**Frozen package digest:** **NONE** — nothing was frozen.

**Cases:** 0. **Provider calls authorized:** **UNSPECIFIED BY THE DESIGN**. **Provider calls
executed:** **0**.

**Projected spend:** **UNSPECIFIED**. **Actual spend:** **USD 0.00**. **Hard ceiling:**
**UNSPECIFIED**.

Every exercised-path line below is `NOT_EXERCISED`, for one reason: the instrument was never authored,
so no stage ran. Invariant 23 — `NOT_EXERCISED` is never a pass.

| path | result |
|---|---|
| Declaration → projection | NOT_EXERCISED |
| Exact-property preservation | NOT_EXERCISED |
| Verifier routing | NOT_EXERCISED |
| KR-1 missing-authority refusal | NOT_EXERCISED |
| CONFIRM_PROPERTY | NOT_EXERCISED |
| CORRECT_PROPERTY | NOT_EXERCISED |
| Evidence authority | NOT_EXERCISED |
| Satisfactory settlement | NOT_EXERCISED |
| Adverse / KEEP_UNRESOLVED | NOT_EXERCISED |
| RR-7 | NOT_EXERCISED |
| Safe / negated restraint | NOT_EXERCISED |
| Governed grounding | NOT_EXERCISED |

**Decision-critical fact preservation:** NOT_EXERCISED.
**Independent-fact preservation:** NOT_EXERCISED.
**Unsafe authorizations:** 0 — no authorization path ran.
**Wrong-property settlements:** 0 — no settlement path ran.
**Provider-only settlements:** 0 — no provider call was made.
**Deterministic semantic invention:** 0 — no deterministic stage ran.
**Governed-authority violations:** 0 — no governed evidence was supplied.

These zeros are the arithmetic of an unexecuted run. **None of them is evidence of containment.**

**§227 residual branch/decision defects observed:** 0. **Contained:** 0. **Uncontained:** 0. No case
ran in which they could arise.

**`assertedConditionState` load-bearing downstream:** **NO** for deterministic authority logic, on
static inspection. It is transmitted to the verifier model as prose. See section 5.

**Integrated hard requirements passed:** **0 / 13.** None failed. None was exercised.

**Overall integrated result:** **INCONCLUSIVE.**

**Architecture changed:** NO. **Prompt changed:** NO. **Schema changed:** NO.
**Semantic-preference retries:** 0. **Database operations:** 0.

**Context sources loaded:** 6 — `CONTEXT_INDEX.md`, `EXPERT_HAZLENZ_CURRENT_STATE.md`,
`HAZLENZ_INVARIANTS.md`, `SECTION-227-REPORT.md`, `SECTION-227-FROZEN-PROTOCOL.json` (key structure
only, queried not read), and `expert-221-integrated-instrument.ts` (structure and coverage functions).
Plus targeted greps over the authority-path modules for the `assertedConditionState` finding. The
308,000-word development blueprint was not loaded. **Approximate context size:** about 9,500 words.

**Commit / push / tag / deploy:** NONE.

---

## Classification

**INCONCLUSIVE — instrument not authored.**

This is a governance and authoring deficiency, not a system defect. Nothing here is evidence for or
against the Expert HazLenz pipeline. The §227 terminal
`INTEGRATED_REVALIDATION_AUTHORIZATION_REQUIRED` was correct: what §227 produced was a recommendation
that an integrated revalidation be designed, and the design step itself has not happened.

**TERMINAL:
`EXPERT_HAZLENZ_TARGETED_INTEGRATED_REVALIDATION_INCONCLUSIVE — PRODUCT_OWNER_REVIEW_REQUIRED`**

STOP.
