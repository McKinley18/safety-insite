# §224 — FIRST-PASS DECISION-CRITICAL PROPERTY DECLARATION CAPABILITY

**Provider calls 0 · Database operations 0 · Commit / push / tag / deploy NONE ·
Architecture expanded NO · New semantic authority NO · Deterministic semantic inference NO ·
Schema changed NO.**

---

## Root causes

**Declaration recall — the declaration list is subordinate to the clarification list by
construction.** `STATING AN UNRESOLVED FACT IN FULL` says in as many words: "If you would not have
asked about it, do not declare it." Every path that can add an entry runs through a question: the
retention bridge routes a recognised unknown to a clarification, and the four checks then route a
clarification to a declaration. Every other gate states of itself "They add no new reason to declare
anything." A first pass that asks nothing declares nothing, and that is contract-compliant. IG1 and
IG8 each emitted zero clarifications and zero declarations while carrying their own candidate at
UNKNOWN or INSUFFICIENT_EVIDENCE with `requiresUserConfirmation: true`.

Two contributing causes sit on the same family. The threshold in GATE 3 asks only whether "the
required action today is materially the same either way", which IG1 answered at the level of whether
to act rather than which control is required — its own uncertainty statement records the reasoning.
And the escape from the consistency check is unwitnessed: the contract permits discharge by
concluding the fact "does not change today's action after all" with no structured record, so IG8
discharged it with a blanket prose negative that contradicts its own CAND-3.

**Property selection — an instruction priority conflict.** Every property gate separates the state
from the evidence or process that would establish it. A control's operating state is neither. It is
a genuine state of the world, it passes GATE 8's picture test and GATE 12's branch test, and the
`affectedDecision` vocabulary independently defines `REQUIRED_CONTROL` as covering "whether a
specific control was applied" — which licenses it outright. Nothing subordinates the control's state
to the hazard state when the hazard state is itself open. IG10 declared whether the ventilation fan
was running against a frozen property of whether the atmosphere was safe to enter, and every gate
passed it.

Ruled out with evidence: output or token pressure (1,296, 1,652 and 2,913 output tokens against a
4,000 limit, all `stopReason: tool_use`), representation or schema gap, and output contract
reliability. Full detail in `SECTION-224-ROOT-CAUSE.md`.

---

## Files changed

| | |
|---|---|
| **Runtime files changed** | **0** |
| **Prompt files changed** | **0 modified.** 1 added: `backend/scripts/lib/expert-224-declaration-capability.ts`, an additive successor that derives from §210J by construction |
| **Schema files changed** | **0.** The §210J wire schema is re-exported and `assertSchemaUnchanged` proves the bytes are identical |
| Instrument added | `backend/scripts/lib/expert-224-capability-instrument.ts` (validation only, imported by no runtime path) |
| Harness added | `backend/scripts/build-224-instrument-freeze.ts`, `backend/scripts/test-224-declaration-capability.ts` |

All twelve §221-pinned module digests verified unchanged, including `expert-210j-first-pass-contract.ts`
at `7f1000b8…`. Removing both §224 blocks reproduces the §210J prompt byte for byte, in both the
plain and governed-binding variants.

### What the remediation adds

Two instruction blocks, at two unique anchors, using only fields the schema already carries.

**THE DECLARATION TRIGGER**, inserted where the subordination sentence is read. It gives the
declaration list its own trigger keyed on the model's own candidate states, states the threshold in
three limbs with "WHICH CONTROL IS REQUIRED" as the middle one, requires a witnessed negative in
`uncertainty.statements` when a recognised unknown is set aside, and names a blanket negative as
insufficient. It also restates that this is not a quota and that UNKNOWN alone is never a reason to
declare.

**GATE 13 — THE PROPERTY IS THE CONDITION, NOT THE CONTROL**, appended where the other gates end. It
subordinates a control's operating state to the condition when the condition is open, gives a test
that grants branchA and asks whether the safety decision is then made, preserves the required-act
and required-artifact carve-out GATE 8 already holds, and closes the `REQUIRED_CONTROL` licence.

---

## Local instrument

Ten cases, frozen at digest `c68fe8c048ff5c92d8f70c502e60daf42d0c877a307a5ba8d9ec69d68566f418`
**before the remediation was written**. Three replay the §221 recorded outputs for IG1, IG8 and
IG10; seven are authored. Run against both contracts.

| measure | exercised | §210J baseline | §224 remediated |
|---|---|---|---|
| RECALL | 8 | 8 compliant, 0 defective | 6 compliant, **2 defective** |
| PRECISION | 2 | 2 compliant, 0 defective | 2 compliant, 0 defective |
| PROPERTY IDENTITY | 6 | 4 compliant, 2 defective | 3 compliant, **3 defective** |
| INDEPENDENCE | 1 | 0 compliant, 1 defective | 0 compliant, 1 defective |

"Defective" is the instrument catching a defect in the output under test. The baseline column is the
§221 failure reproduced: it calls IG1 and IG8 compliant, because under that contract they are, and
it lets IG10's control-state substitution through.

**Hard local requirements — all met, none offset by any other.**

| requirement | result |
|---|---|
| decision-critical declaration recall | **100%** — every omitted owed property caught |
| exact controlling-property identity | **100%** — every forbidden substitution caught |
| over-correction on a required act or artifact that IS the property | **0** |
| independent fact preservation | **100%** |
| safe / negated false declarations | **0** |
| ordinary non-decision-critical false declarations | **0** |
| deterministic semantic invention | **0** |

Capability assertions: **33 passed, 0 failed.**

### An instrument-authoring defect, recorded not repaired

Seven of forty per-case preregistration-conformance checks mismatched. The frozen table was authored
one-measure-per-case, while a case that owes a property and emits a declaration genuinely exercises
RECALL and PROPERTY IDENTITY as well. Every mismatch resolved to COMPLIANT — the non-failing
direction — and no hard requirement depends on that table.

**The frozen instrument is not revised.** Expectations are frozen before evaluation and are not
redefined after a result is seen. This is recorded as a §224 instrument-authoring defect for the
next instrument, on the same footing as §221's D1 gate-coverage gap.

### What the local instrument does and does not establish

It establishes **contract discrimination**: the §210J contract cannot tell the §221 Class A failures
apart from correct restraint, and the §224 contract can, while leaving both restraint cases and both
required-act/artifact cases exactly where they were.

It establishes **nothing about how a model will behave.** It makes no provider call. Per
`HAZLENZ_INVARIANTS`, a contract change is never evidence that a behavioural defect is repaired.
That question belongs to the hosted confirmation designed and not executed here.

---

## Affected regressions and typecheck

| suite | result |
|---|---|
| §205 declaration preservation | 92 passed, 0 failed |
| §210E final remediation | 103 passed, 0 failed |
| §210J epistemic schema / projection | 99 PASS, 0 FAIL |
| §214 scope containment | 68 PASS, 0 FAIL |
| §218 structured property verifier | 113 PASS, 0 FAIL |
| §220 KR-1 property authority | 43 PASS, 0 FAIL |
| §221 preregistration | 53 passed, 0 failed |
| §224 capability suite | 33 passed, 0 failed |

**604 assertions, zero failures.** `tsc --noEmit -p tsconfig.scripts-221.json` clean.
`tsc --noEmit -p tsconfig.json` — the production build — clean.

Validation level used: **LEVEL 2**, the affected subsystem, per `VALIDATION_EFFICIENCY_PLAN.md`. No
higher level was needed, because the question is whether a first-pass instruction change breaks a
first-pass or downstream contract, and no provider behaviour is claimed.

---

## §223 context architecture, measured

| | words |
|---|---|
| `CONTEXT_INDEX.md` | 436 |
| `EXPERT_HAZLENZ_CURRENT_STATE.md` | 1,667 |
| `HAZLENZ_INVARIANTS.md` | 918 |
| `SOURCE_OF_TRUTH_MAP.md` | 790 |
| composed §210J system prompt, built not stored | 9,315 |
| composed §210J wire schema, built | 2,818 |
| §210J contract module, lines 1–235 | 1,654 |
| **total loaded** | **17,598** |
| historical default (`INSITE_ENGINEERING_BLUEPRINT.md` plus the superseded `docs/expert-hazlenz/` package) | 314,888 |

**Approximate routine context reduction: 94% smaller.** More than half of what was loaded is the
instruction under repair, which no reduction could avoid.

**Was historical material loaded?** Yes, and legitimately: the §221 recorded first-pass output for
IG1, IG8 and IG10, under the index's "reproducing a historical defect" reason. It was queried with a
script and only the three cases were read, per the index's own rule never to load a raw provider leg
into a prompt. No frozen artifact was modified; all §221 and §222 digests re-verify.

**Was CONTEXT_INDEX routing sufficient?** Yes. Its first-pass section named the right four sources,
and its instruction not to read the ancestor modules — "§210J composes them; reading the composed
output is enough" — was correct and saved six module reads.

**Source duplication encountered.** One, already recorded in `SOURCE_OF_TRUTH_MAP.md`:
`src/.../expert-prompt.ts` declares `EXPERT_PROMPT_VERSION = 'hazlenz.expert.prompt.v15'`, a second
independent version line for the same leg, and is not on the §221 assembly path for the system
prompt. §224 did not touch it. It remains the most likely source of a future wrong-prompt incident.

**Documentation correction needed?** No factual error was found in the §223 current-state documents.
Two additive gaps are reported and deliberately not written in, for a later authorized slice.

First, `CONTEXT_INDEX.md` routes first-pass work to the §210J contract module but does not say that
the composed instruction has no stored copy and must be rendered from it, nor name a command that
does so.

Second, a manifest-path inconsistency §223 introduced. `REPORT-221.sha256` and `REPORT-222.sha256`
list bare filenames and verify from inside their own directory; `REPORT-223.sha256` and now
`REPORT-224.sha256` list repo-root-relative paths and verify only from the repository root. Both are
internally correct and both verify clean, but an engineer who runs `shasum -c` from the wrong
directory gets fifteen FAILED lines that look like evidence drift and are not. The archive index
proposed in `VALIDATION_EFFICIENCY_PLAN.md` should state the convention, and new manifests should
pick one.

---

## Final report

**Root cause — declaration recall:** the declaration list is subordinate to the clarification list by
construction, with a threshold missing the "which control is required" limb and an unwitnessed
negative escape.
**Root cause — property selection:** an instruction priority conflict in which a control's operating
state passes every state-versus-evidence gate and is separately licensed by the `REQUIRED_CONTROL`
vocabulary, with no rule subordinating it to an open hazard state.

**Files changed:** 4 added, 0 modified.
**Runtime files changed:** 0.
**Prompt files changed:** 0 modified; 1 additive successor added.
**Schema files changed:** 0.

**Local instrument** — cases 10 · recall 100% · precision 100% (0 false declarations on either
restraint case) · property identity 100% (0 over-corrections) · independence 100%.

**Affected regressions:** 604 assertions, 0 failures.
**Typecheck:** clean, experiment scope and production build.

**Architecture expanded:** NO.
**New semantic authority introduced:** NO.
**Deterministic semantic inference introduced:** NO.

**Context sources loaded:** 7, totalling about 17,600 words.
**Approximate context reduction vs historical workflow:** about 94%.

**Hosted confirmation** — calls proposed **18** (8 cases × 2 arms, plus 2 contingency) · projected
spend **USD 1.4002** · hard ceiling **USD 1.76**. Designed, not executed, and not authorized.

**Provider calls actually made:** 0.
**Database operations:** 0.
**Commit / push / tag / deploy:** NONE.

---

**TERMINAL:
`EXPERT_HAZLENZ_FIRST_PASS_DECLARATION_CAPABILITY_REMEDIATED — BOUNDED_HOSTED_CONFIRMATION_AUTHORIZATION_REQUIRED`**

Do not begin hosted confirmation. §224 stops here.

One thing should stay visible when that authorization is considered. Everything above is a contract
that can now tell the three §221 Class A failures apart from correct behaviour. Whether a model
given that contract declares the owed property, and names the controlling one, is not established
and is not claimed.
