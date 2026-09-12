# §225 — BOUNDED HOSTED FIRST-PASS DECLARATION CAPABILITY CONFIRMATION

**16 provider calls of 18 authorized · USD 1.2994 of 1.76 · 0 retries · 0 database operations ·
No commit, push, tag or deploy.**

Frozen protocol `4ebc81b73a6df5c7a60d2a6051abb5bd2450ebf49ad49e428c77293920e3572e`, written and
digested before the first call and verified unchanged by the scorer.

---

## Preflight

**PASS**, fifteen checks. Case count 8, planned calls 16 within a ceiling of 18, frozen truth
present for every scored case, both arms defined as designed, prompt and schema identities pinned,
remediated arm on the §224 successor contract, comparison arm on the §210J predecessor, no case
derived from IG1, IG8 or IG10, caching disabled, no pre-existing evidence file, API key resolved.

**P8 is the check that makes this a controlled comparison:** the user prompt and wire schema are
byte-identical across arms on all eight cases, and only the instruction identity differs.

**P11, the §224 instrument-authoring defect.** §225 does not depend on it. The §225 cases are H1–H8,
authored separately, and the §225 gates are transcribed from the §224 design document's acceptance
section, which makes no reference to the local instrument's per-case expected table. The frozen §224
instrument is preserved exactly and was not repaired or rewritten.

### Stated pre-execution risk, recorded before spending

§224 froze each case's identity, setting, trap and controlling property, plus the arms, model,
caching, call count, spend, ceiling, judgment structure and acceptance criteria. It did **not**
author the observation text, supplied context, hazard families or near-neighbour annotation. §225
authored those, constrained by the frozen trap and controlling property.

The paired design means authoring bias cannot manufacture a *difference* between arms. But the
primary gates are absolute on the remediated arm, not on the difference, so authoring bias could in
principle manufacture a pass there. That was recorded in the frozen protocol before any call and is
repeated here. It is not mitigated away.

---

## Results

| | cases | calls | spend |
|---|---|---|---|
| planned | 8 | 16 (+2 contingency) | USD 1.4002 projected |
| executed | 8 | **16** | **USD 1.2994** |

### Remediated arm — §224

| measure | result |
|---|---|
| declaration recall | **6 / 7** — H5 failed |
| controlling-property identity | **3 / 7** — H2, H3, H7 failed |
| independence | **0 / 1** — H5 failed |
| restraint | **1 / 1** |
| required-act control | **PASS** (H6, borderline) |
| required-artifact control | **FAIL** (H7) |
| output-shape reliability | **8 / 8 clean** — zero transport, truncation, unparseable or stringified-field failures |

### Predecessor arm — §210J

| measure | result |
|---|---|
| declaration recall | 4 / 7 |
| controlling-property identity | 1 / 7 |
| independence | 0 / 1 |
| restraint | 1 / 1 |
| required-act control | PASS (borderline) |
| required-artifact control | FAIL |
| output-shape reliability | 8 / 8 clean |

### Primary gate result

| gate | arm | status |
|---|---|---|
| G1 declaration recall | remediated | **FAIL** (H5) |
| G2 controlling-property identity | remediated | **FAIL** (H2, H3, H7) |
| G3 independence | remediated | **FAIL** (H5) |
| G4 restraint | remediated | **PASS** |
| G5 required-act control | remediated | **PASS** |
| G6 required-artifact control | remediated | **FAIL** (H7) |
| G7 instrument discriminates | predecessor | **PASS** |

**Four of six remediated-arm primary gates fail.** No aggregate was computed, and the predecessor
arm's result was not permitted to weaken any of them.

Three judgments are marked BORDERLINE in the scored results and are flagged so they can be
re-adjudicated: H1 property identity on the remediated arm, and H6 property identity on both arms.
None of them changes a gate outcome.

---

## Observed successor improvement

**Real, and largest exactly where §224 predicted it.**

On H1 and H3 the predecessor arm emitted zero declarations and zero clarifications on observations
where the frozen truth owes a property — the IG1 and IG8 failure shapes reproduced on fresh facts.
The remediated arm emitted a declaration on each. Recall moved from 4/7 to 6/7 with the instruction
as the only variable.

On H4 the property itself moved, and that result is the cleanest in the run. The predecessor named
"whether the scaffold's structural condition **has been assessed by a competent person**" — a
verification act. The remediated arm named "whether the scaffold's structural components **are
currently sound**" — the condition. GATE 13 did what it was written to do.

Restraint held. On H8 both arms declared nothing, and the remediated arm additionally recorded a
witnessed negative naming the controls it had checked. The witnessed-negative requirement fired
without pushing the model into declaring. That is one case, and one case does not generalise.

---

## Remaining material defect

**One mechanism, and it is the important finding of this run.**

The §224 declaration trigger is keyed on the model's **own candidate states** — `UNKNOWN`,
`INSUFFICIENT_EVIDENCE`, or `requiresUserConfirmation`. On H5 the remediated arm asserted every
concern `ACTIVE` at `HIGH` confidence, including one whose own reasoning reads that the soil
classification "cannot be relied upon to judge whether the unsupported sides will hold". The trigger
never fired, and zero declarations were emitted against two owed properties. The predecessor arm
marked that same concern `INSUFFICIENT_EVIDENCE` with `requiresUserConfirmation: true` and also
declared nothing.

**A trigger keyed on a self-reported state can be bypassed by self-reporting a different state**, and
nothing in the contract cross-checks the asserted state against the reasoning that accompanies it.
Whether the remediation caused that shift cannot be established from one paired case and is not
claimed.

**Property substitution survives on three of seven cases.** H2 and H3 both substituted a control
state for the condition, which is the IG10 shape the remediation was written to close, and H3 is the
case that exists to test it. H7 moved in the other direction, naming the underlying act where the
frozen property is the artifact that is itself the statutory precondition; both arms did this, so it
is not introduced by the remediation.

**One further defect, not gated but material.** On H4 the remediated `missingFact` names the
condition while `branchA` and `branchB` still divide inspected from not-inspected — the drift GATE 12
forbids, surviving into the branches after the property itself was corrected. A declaration whose
branches divide inspected from not-inspected can be settled by producing an inspection rather than by
establishing soundness.

**A defect in the §225 case authoring, recorded not repaired.** H5's second owed property, "whether
the cable is protected from damage", is stated as established by the observation itself — "the cable
is not ducted, covered or slung" — so it is not genuinely open, and both arms were right to treat it
as a known active hazard. That was my authoring error. The H5 gates still fail on the first property,
the soil classification, which is genuinely unknown and determines which support system is required,
so no gate outcome turns on the error. The frozen protocol is not revised.

---

## Interpretation

**B — REMEDIATION PARTIALLY EFFECTIVE.** Behaviour improves materially against the predecessor on
declaration recall and on one property-selection case, and four primary gates still fail.

No remediation cycle was started. §225 stops at reporting.

---

## Final report

**Preflight integrity:** PASS (15 checks).
**Cases:** 8. **Calls planned:** 18 (16 planned + 2 contingency).
**Calls executed:** 16. **Spend:** USD 1.2994. **Hard ceiling:** USD 1.76.

**Remediated arm** — declaration recall 6/7 · property identity 3/7 · independence 0/1 ·
restraint 1/1 · required-act control PASS · required-artifact control FAIL ·
output-shape reliability 8/8 clean.

**Predecessor arm** — declaration recall 4/7 · property identity 1/7 · independence 0/1 ·
restraint 1/1 · required-act control PASS · required-artifact control FAIL ·
output-shape reliability 8/8 clean.

**Primary gate result:** FAIL — G1, G2, G3 and G6 fail on the remediated arm; G4, G5 and G7 pass.

**Observed successor improvement:** declaration recall 4/7 to 6/7 and property identity 1/7 to 3/7,
with the instruction as the only variable; the IG1 and IG8 shapes closed on H1 and H3; a verification
act corrected to the condition on H4; restraint preserved on H8.

**Remaining material defect:** the declaration trigger is keyed on self-reported candidate state and
is bypassed when the model asserts ACTIVE instead, which cost both H5 gates; control-state
substitution for the condition survives on H2 and H3; the artifact-shaped property is not retained on
H7.

**Architecture changed:** NO. **Prompt changed during execution:** NO. **Schema changed:** NO.
**Provider retries for semantic preference:** 0. **Database operations:** 0.
**Commit / push / tag / deploy:** NONE.

**Context sources loaded:** 7 — the context index, the two always-read documents, the §224 design and
report, and two code sections for the executor and assembly pattern.
**Approximate context size:** about 7,800 words. The 308,000-word development blueprint was not
loaded.

---

**TERMINAL:
`EXPERT_HAZLENZ_FIRST_PASS_DECLARATION_CAPABILITY_PARTIALLY_CONFIRMED — PRODUCT_OWNER_REVIEW_REQUIRED`**

Do not remediate. Do not rerun. Integrated revalidation is not authorized.
