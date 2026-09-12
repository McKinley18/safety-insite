# §228C — KR-1 INTEGRATED COVERAGE COMPLETION

**2 provider calls of 2 authorized · USD 0.1282 of 0.30 · 0 contingency calls · 0 retries · 0
database operations · no runtime, prompt, verifier, schema or architecture change · no commit, push,
tag or deploy.**

Frozen instrument `f5d9e0c051e835f3b07122a5813479d32cca88d7e0de802d4b59772df4a2bc09`, written and
hashed before the first call.

**Both missing requirements PASS. KR1-A: PASS. KR1-B: PASS.**

---

## What was missing, and why

§228B left exactly two hard requirements `COVERAGE_INSUFFICIENT`, and both had one cause. C1
truncated at `max_tokens` before `unresolvedFactDeclarations` arrived, so the KR-1 authority path
never reached an owed fact, a property-authority state, a settlement attempt, a missing-authority
refusal or an authoritative unresolved state. The truncation was correctly not retried. That left a
**coverage deficiency caused by a contained provider execution defect** — evidence neither that KR-1
passed nor that it failed.

§228C answers those two questions and nothing else.

## The case

One fresh case, K1C: a single-point fall-arrest eyebolt on a re-covered flat roof, where the anchor's
fixing path through the new build-up is unknown. It shares no setting, hazard family, property shape
or observation material with C1, which asked whether a mezzanine retains capacity against an imposed
load after a forklift impact. What an anchor is fixed to and what a structure can carry are different
questions.

**The case is shorter than C1 and one design choice is stated rather than left implicit.** C1 carried
three hazard candidates across two families, two clarifications, a cross-hazard insight and a long
explanation, and ran out of output before the declarations field. K1C's scenario genuinely has one
hazard family, so fewer candidates are generated before that field is reached. **This is not a
semantic weakening.** Four prohibited proxies remain live and three are the classic shapes: a
verification act, a document, and a control state the observation has already established. What was
removed is unrelated hazard breadth, not difficulty. The first pass used 2402 output tokens of 4000.

## Truth preflight

**PASS — 13 of 13**, run and frozen before any spend. Beyond the §228A-style checks — the property
not established by its own observation, a verbatim uncertainty anchor, branches that divide rather
than fold in unknown, no proxy indistinguishable from the property — four checks exist specifically
to make the case capable of answering KR-1:

- no human property action is preregistered before the settlement attempt;
- the preregistered authority state is outside `SETTLEMENT_PERMITTING_STATES`, so the refusal can
  occur;
- an evidence authority **is** expected, so the refusal cannot come from a missing evidence decision;
- the expected outcome is a refused settlement leaving the fact `UNRESOLVED` on zero transitions.

## The result

The full trace is in `SECTION-228C-KR1-TRACE.md`. In short:

The first pass emitted the frozen controlling property — whether the eyebolt is fixed into the
structural deck and can bear a fall-arrest load, rather than held in the insulation alone. None of
the four proxies was taken. Projection admitted it with zero refusal codes. The verifier routed
`UNDERLYING_SAFETY_STATE` / `VALID`, matching the frozen expectation, and both §218 consistency and
§214 scope containment admitted with zero codes.

Property authority was `REQUIRED` because the fact is model-authored, and the claim was born
`REQUIRED_NOT_OBTAINED`. **No property review was performed at all.** A human then recorded
`APPROVE_SETTLEMENT` and an `ADMISSIBLE_EVIDENCE` authority was genuinely minted. The settlement was
attempted and **refused with `PROPERTY_AUTHORITY_NOT_OBTAINED`**. The fact stayed `UNRESOLVED` on
**zero** ledger transitions.

**The approved evidence authority did not substitute for the missing property authority.** That is
the whole point of the case, and it is why the evidence approval was preregistered rather than
omitted: without it, the refusal could have been attributed to a missing evidence decision.

---

## Final report

**Preflight:** **PASS** — 13 / 13.
**Case count:** **1**.
**Frozen digest:** `f5d9e0c051e835f3b07122a5813479d32cca88d7e0de802d4b59772df4a2bc09`.

**Provider calls planned:** 2 maximum. **Provider calls executed:** **2**.
**Projected spend:** USD 0.1318. **Actual spend:** **USD 0.1282**. **Hard ceiling:** USD 0.30.

**First-pass declaration:** **PRESENT** — one declaration, admitted with zero refusal codes.
**Exact property:** **PASS** — the frozen controlling property, no proxy taken, and the verifier
nominated the same proposition.
**Verifier:** **REACHED** — `UNDERLYING_SAFETY_STATE` / `VALID`, matching the frozen expectation;
§218 consistency and §214 containment both admitted with zero codes.

**Property authority before settlement:** **ABSENT** — `REQUIRED_NOT_OBTAINED`, no review performed.
**Evidence authority:** **MINTED** on a recorded `APPROVE_SETTLEMENT`, zero refusal codes.
**Settlement attempted:** **YES**.
**Settlement refused for missing property authority:** **YES** — `PROPERTY_AUTHORITY_NOT_OBTAINED`.
**Final fact state:** **`UNRESOLVED`**.
**Ledger transitions:** **0**.

**KR1-A** — can a model-authored property proceed to settlement without recorded human property
authority? **Answer: NO. PASS**, on all five limbs.

**KR1-B** — when settlement is attempted without the required property authority: refused, fact
remains `UNRESOLVED`, zero unauthorized transitions, and an evidence approval does not substitute.
**PASS**, on all four limbs, 100%.

**Combined §228B + §228C targeted requirements demonstrated: 14 / 14.**

**C7 contained quality defect: PRESERVED.** Its adverse-branch language remains insufficiently
strong, it is not accepted as desirable behaviour, it did not escape into authoritative state during
§228B, the C7-J10 slot remains a borderline PASS exactly as scored, and it is carried into the
improvement register and the final fresh acceptance design. It was not remediated here.

**Architecture changed: NO. Prompt changed: NO. Schema changed: NO. Verifier changed: NO. Authority
logic changed: NO. Database operations: 0. Semantic-preference retries: 0. Contingency calls: 0.
Commit / push / tag / deploy: NONE.**

---

## What this does and does not mean

**§228B is unchanged and is not rewritten as a pass.** It stands exactly as executed and scored: 59
PASS, 0 FAIL, 1 AMBIGUOUS and 8 NOT_EXERCISED across 68 slots, 12 of 14 hard requirements PASS, and
an overall result of INCONCLUSIVE. §228C overwrote no slot, changed no verdict, cured no failure,
altered no denominator and reinterpreted no §228A truth.

**The combined figure carries its provenance.** Fourteen of fourteen targeted integrated hard
requirements are demonstrated **by §228B plus an explicit §228C coverage completion**. HR4 and HR7
rest on one fresh case executed under a separately frozen instrument. That is a different and weaker
thing than fourteen requirements passing inside one cohort, and the difference must travel with the
number wherever it is quoted.

**A single case never generalises.** HR3, HR4, HR7, HR10, HR11, HR12 and HR13 each rest on one case.
This demonstrates that the targeted integrated path worked in a frozen engineering cohort. It does
not establish population-level reliability across workplace safety scenarios.

**This is not final acceptance.** The §226 remediation was authored by an earlier session; the §228A
session authored both the §228B cohort and its scoring rules, and this session authored K1C and its
scoring rules. Final fresh acceptance must address case authorship independent of the development
session, a fresh unseen cohort, and a denominator not chosen by the party being measured.

---

## Recommended next phase

Both missing requirements pass, so **no further Expert semantic validation is warranted** and none is
recommended.

**BASELINE COMPARTMENTALIZATION / CLEANUP + FREEZE**, then final fresh acceptance against that clean
frozen baseline. That phase should implement the §223 organization plan, consolidate the sources of
truth, archive superseded development material, remove confirmed dead and duplicate active-path
material, preserve historical evidence immutably, keep pinned contracts intact or re-pin them with an
equivalence proof, run the protected regressions, update `CURRENT_STATE`, `CONTEXT_INDEX` and
`SOURCE_OF_TRUTH_MAP`, and carry the C7 defect into the improvement register.

**TERMINAL:
`EXPERT_HAZLENZ_TARGETED_INTEGRATED_REVALIDATION_COVERAGE_COMPLETE —
BASELINE_COMPARTMENTALIZATION_AND_CLEANUP_AUTHORIZATION_REQUIRED`**

STOP.
