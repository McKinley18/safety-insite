# §226 — FINAL BOUNDED FIRST-PASS SEMANTIC PROPERTY REMEDIATION

**Provider calls 0 · Database operations 0 · Commit / push / tag / deploy NONE ·
Architecture expanded NO · New semantic authority NO · Deterministic semantic inference NO ·
Schema changed NO · §224 rewritten NO.**

---

## Root causes

**Candidate-state bypass.** §224's declaration trigger builds its input set out of the model's own
labels: "Take every candidate you yourself put at UNKNOWN or INSUFFICIENT_EVIDENCE, every candidate
you marked requiresUserConfirmation true, and every unknown you named in an uncertainty statement."
On §225 H5 the remediated arm asserted every concern `ACTIVE` at `HIGH` confidence with
`requiresUserConfirmation: false` and no uncertainty statement, including one whose own reasoning
says the soil classification "cannot be relied upon to judge whether the unsupported sides will
hold". The enumerated set was empty, the trigger never fired, and zero declarations were emitted
against two owed properties. `assertedConditionState` is an output conclusion and §224 used it as an
input predicate, so an incorrect state suppresses declaration of the fact needed to justify that
state.

**Property selection.** GATE 13 forbids the H2 and H3 substitutions in terms — both are control
states, and both are named. It was not permissive; it was **unreached**. GATE 13 is framed
throughout as a rule about controls, and its test opens "take your own branchA — the control working
exactly as intended", so a model reaches it only after classifying its own property as
control-shaped. More generally, a deny-list can only refuse what somebody enumerated in advance, and
a real observation produces substitutions nobody listed.

**Required artifact.** §224 GATE 13 says the carve-out for an artifact that is itself the governing
requirement is one "which GATE 8 already carves out". **It does not.** GATE 8 carves out the act
alone, and closes by sending records the other way: "A missing record or an old reading belongs in
`notEstablishedBecause` ... and stays there." GATE 12's choosing test terminates on the act for the
same reason. The base contract carves out the required act in two places and the required artifact in
none. On §225 H7 both arms named the underlying examination rather than the current report the
written scheme makes the precondition, so this is inherited from the base and was **not** introduced
by §224. The operative confusion is between a record that is evidence about a state and a record
whose existence or currency is itself the requirement.

**One mechanism, three instances.** Every §224 rule is keyed on an enumeration the model must first
place itself into. A model that does not place itself there never evaluates the rule. Full detail,
with the quoted instruction text for each, in `SECTION-226-ROOT-CAUSE.md`.

**Ruled out with evidence**, not assumption: output shape and transport (§225 recorded 8/8 clean on
both arms, zero truncation, zero stringified fields), token pressure, representation and schema
capacity (§223), and restraint damage from §224 (H8 held, with a witnessed negative).

---

## Files changed

| | |
|---|---|
| **Runtime files changed** | **0** |
| **Prompt files changed** | **0 modified.** 1 added: `backend/scripts/lib/expert-226-property-selection-capability.ts`, an additive successor derived from §224 by construction |
| **Schema files changed** | **0.** The §210J wire schema is re-exported through §224 and `assertSchemaUnchanged226` proves all three are byte-identical |
| Instrument added | `backend/scripts/lib/expert-226-capability-instrument.ts` (validation only, imported by no runtime path) |
| Harness added | `backend/scripts/build-226-instrument-freeze.ts`, `backend/scripts/test-226-property-selection-capability.ts` |

Nothing under `src/` references either §224 or §226, and the production build (`include:
["src/**/*"]`) cannot reach them.

### The prompt change

**Two blocks, 114 lines, at two unique anchors, using only fields the schema already carries.** §224's
own text is left exactly where it is and qualified in place — the same move §224 made on §210J's
subordination sentence.

**Block 1 — `THAT ENUMERATION IS WHERE YOU START AND NOT WHERE YOU STOP`**, inserted immediately
before §224's line "For each one, apply the test in its full form:", so it widens the set the §224
three-limbed test runs over, at the point where that set is built. The three-limbed test itself is
untouched: §225 showed it works when it is reached. The block states that
`assertedConditionState`, `confidence` and `requiresUserConfirmation` are conclusions and not
evidence; widens the input set to every candidate that bears materially on the decision, whatever
state was assigned; states the question from the decision ("WHAT PROPOSITION MUST BE TRUE OR FALSE"
then "DO THE FACTS YOU WERE GIVEN ACTUALLY ESTABLISH THAT PROPOSITION?"); requires the model to read
its own reasoning back against its own label; and requires the analysis to run once per
decision-controlling proposition rather than once per work activity, so one established hazard
cannot discharge an open sibling.

**Block 2 — `GATE 14. GRANT THE BRANCH AND SEE IF THE DECISION IS MADE`**, appended where the gates
end, after GATE 13. One sufficiency test, applied to every entry, with **no precondition that the
model first classify its own property**: grant branchA outright and ask whether the safety decision
is then made. It names the six things it might be moving off, works four bad/better pairs, and
states the **stop rule** in the same breath so the test bounds over-correction in both directions.
It preserves GATE 8 and GATE 12's required-act carve-out verbatim in intent, and adds the
required-**artifact** carve-out the base never had, with the test that separates a record that is
evidence from a record whose existence or currency is itself the requirement.

### The additive chain, proved not asserted

Removing both §226 blocks reproduces the §224 prompt **byte for byte**, in both the plain and
governed-binding variants; removing §224's two blocks in turn reproduces §210J byte for byte. Every
one of §224's own lines survives unaltered in §226. Both anchors were verified unique in both
variants before insertion, and the builder aborts loudly against a drifted base.

| | |
|---|---|
| composed §226 instruction, plain | `dcf2f2bdfcff97378f40a86a36201a0d53043489faebd0b28d8fe935a50712c0` |
| composed §226 instruction, governed binding | `154a04a60dc6fb5c42a319120afdcb628b4557cb656ec9733d516134053036b2` |
| wire schema | identical to §210J and §224, asserted in the suite |
| instruction size | 10,059 words (§224) to 11,328 words (§226) |

---

## Local instrument

**Ten cases, seven measures, both contracts, frozen at
`a8de1a56ed87502fd9257633e54ec98d7d9488878f7606b3bf6e8da49fffc31a`.** Each case enumerates
established facts, genuinely unresolved properties with the reason each is open, non-facts,
prohibited adjacent and proxy properties with their kinds, the expected declaration count, the exact
controlling properties, and whether required-act or required-artifact semantics apply. Every measure
is preregistered for every case **under both contracts**.

### Instrument preflight: 19 of 19 PASS — and it did its job twice

**The preflight caught two authoring defects before the instrument was frozen. Both were repaired in
the development instrument, which is what the check is for.**

**First, at the initial run: P8 failed.** Two enumerated non-facts were lexically confusable with
established facts on the same case ("which fitter padlocked the product line valve" against "the
product line valve is shut and padlocked"). They were distinct propositions, but a non-fact that a
deterministic classifier cannot separate from an established fact is an instrument defect whatever
the author meant. Both were re-authored.

**Second, and more important: the first freeze was discarded.** After that freeze, scoring produced
**12 preregistration mismatches across three cases**, all from one cause: the expectation table and
the evaluator disagreed about what `DECLARATION_RECALL` means when an entry is emitted **for** the
owed gap but **names** the wrong property. That is precisely the §224 instrument-authoring defect
recurring, and §226 was authorized to correct that discipline rather than repeat it.

There is no provider here and no outcome to see. The evaluator is deterministic over authored
fixtures, so a disagreement between the two halves of the instrument is **instrument
self-consistency**, not a result. So the freeze was discarded, the development instrument was
repaired, and two checks were added that make the disagreement impossible to freeze through:

- **P15** — every emitted entry is attributed to a real owed property of its own case;
- **P16** — the preregistered expectations and the evaluator already agree, case by case, measure by
  measure, contract by contract.

**The repair itself keeps the two measures independent.** Attribution is now preregistered per
declaration fixture: which owed gap the entry reaches for. An entry that reaches for the owed gap and
names a control state **discharges recall and fails property identity**, which is how §225 scored
H2 and H3. Collapsing them would let one hard gate answer for another, which `HAZLENZ_INVARIANTS`
22 forbids. The frozen instrument that the results were computed against has never been revised: it
was frozen once, with both checks passing, and scored once.

### Results

**Preregistration conformance: 140 of 140 matched, 0 mismatched.** Capability assertions: **31
passed, 0 failed.**

| case | shape | §224 | §226 |
|---|---|---|---|
| L1 | bypass under an `ACTIVE` label | recall unreachable, bypassed | recall caught, reached |
| L2 | bypass under a `CONTROLLED` label | recall unreachable, bypassed | recall caught, reached |
| L3 | control-state substitution, anticipated | identity caught | identity caught |
| L4 | substitution nobody enumerated | **survives** | identity caught |
| L5 | legitimate required act | not over-corrected | not over-corrected |
| L6 | artifact undercut to the act it records | **survives** | identity caught |
| L7 | legitimate required artifact | not over-corrected | not over-corrected |
| L8 | two independent properties, one absorbed | absorption invisible | recall and independence caught |
| L9 | safe / negated restraint | compliant | compliant |
| L10 | ordinary non-decision-critical restraint | compliant | compliant |

**Hard local requirements — all met, none offset by any other.**

| requirement | result |
|---|---|
| decision-critical declaration recall | **100%** — all 3 omissions caught |
| exact controlling-property identity | **100%** — all 3 substitutions caught |
| independent property preservation | **100%** — the absorption caught |
| restraint false declarations | **0** — 2 restraint cases, neither flagged |
| required-act over-correction | **0** |
| required-artifact over-correction | **0** |
| candidate-state bypass cases | **0** — 3 exercised, none bypassed |
| deterministic semantic invention | **0** |
| no regression | every defect §224 caught, §226 also catches |
| no restraint movement | neither restraint case moved between the contracts |

### What the local instrument does and does not establish

It establishes **contract discrimination**, and §225 sharpened what that has to mean. The §225
failures were not cases where §224 permitted the wrong answer — GATE 13 forbids H2 and H3 in terms.
They failed because the rule was never reached. So this instrument asks whether the contract's own
stated rule **reaches** the output: does the trigger reach a candidate labelled `ACTIVE`; does the
property rule reach a substitution nobody enumerated; does the artifact carve-out exist at all. A
deny-list rule is bypassed by falling outside the list. An unconditional test is not.

It establishes **nothing about how a model will behave.** It makes no provider call. Per
`HAZLENZ_INVARIANTS` 27, a contract change is never evidence that a behavioural defect is repaired.
That question belongs to the hosted confirmation designed here and not executed.

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
| §226 capability suite | **31 passed, 0 failed** |

**635 assertions, zero failures.** `tsc --noEmit -p tsconfig.scripts-221.json` clean.
`tsc --noEmit -p tsconfig.json` — the production build — clean.

All §224 and §225 frozen evidence re-verifies: `shasum -c REPORT-224.sha256` and
`shasum -c REPORT-225.sha256` both clean from the repository root. No frozen artifact was modified.

Validation level used: **LEVEL 2**, the affected subsystem, per `VALIDATION_EFFICIENCY_PLAN.md`. No
higher level is warranted, because the question is whether a first-pass instruction change breaks a
first-pass or downstream contract, and no provider behaviour is claimed.

---

## §223 context architecture, measured

| source | words |
|---|---|
| `CONTEXT_INDEX.md` | 436 |
| `EXPERT_HAZLENZ_CURRENT_STATE.md` | 1,667 |
| `HAZLENZ_INVARIANTS.md` | 918 |
| `SECTION-225-REPORT.md` | 1,494 |
| `SECTION-224-ROOT-CAUSE.md` | 1,234 |
| `SECTION-224-REPORT.md` | 1,904 |
| `expert-224-declaration-capability.ts` | 2,409 |
| `expert-224-capability-instrument.ts`, two regions | 2,444 |
| composed §224 prompt, three regions, rendered not stored | 2,825 |
| §225 frozen protocol and scored results, script-queried | about 1,150 |
| **total loaded** | **about 16,500** |
| historical default (blueprint plus the superseded package) | 314,889 |

**Approximate routine context reduction: about 95% smaller.** More than half of what was loaded is
the instruction under repair and its predecessor's evidence, which no routing could avoid.

**Was historical material loaded?** Yes, and legitimately, under the index's "reproducing a
historical defect" reason: the §225 frozen protocol and scored results for H2, H3, H5, H6 and H7. It
was **queried with a script** and only the relevant fields were read, per the index's own rule never
to load a raw provider leg into a prompt. `RAW-225.jsonl` was never opened.

**Was `CONTEXT_INDEX` routing sufficient?** Yes, with one gap. Its first-pass section named the right
modules and its instruction not to read the ancestor instruction modules held. The gap: **the index
routes first-pass work to the contract module but does not say that the composed instruction has no
stored copy and must be rendered from it, nor name a command that does so.** §224 reported the same
gap. Diagnosing RC6 and RC7 required reading GATE 8, GATE 12 and the §224 trigger as composed, which
meant rendering the prompt to a scratch file first. That is two sections in a row where the same
missing sentence cost the same detour.

**Source duplication encountered.** One, already on record in `SOURCE_OF_TRUTH_MAP.md`:
`src/.../expert-prompt.ts` declares `EXPERT_PROMPT_VERSION = 'hazlenz.expert.prompt.v15'`, a second
independent version line for the same leg, not on the §221 assembly path. §226 did not touch it. It
remains the most likely source of a future wrong-prompt incident.

**Manifest path convention.** `REPORT-226.sha256` lists repository-root-relative paths and verifies
from the repository root, matching §223 and §224. §221 and §222 use bare filenames and verify from
inside their own directory. Both are internally correct; an engineer running `shasum -c` from the
wrong directory gets a wall of FAILED lines that look like evidence drift and are not. The
convention should be stated in the archive index `VALIDATION_EFFICIENCY_PLAN.md` proposes. This is
the second section to report it.

---

## Final report

**Candidate-state bypass root cause:** the §224 declaration trigger enumerates its input set out of
the model's own `assertedConditionState`, `requiresUserConfirmation` and uncertainty statements, so
asserting a settled state empties the set and the trigger never fires. A conclusion was used as the
evidence for itself.

**Property-selection root cause:** GATE 13 is a deny-list of kinds, framed as a rule about controls
and tested through a control-shaped branchA, so it is reached only by a model that has already
classified its own property. It forbade both §225 substitutions and examined neither, and a
deny-list cannot refuse a substitution nobody enumerated.

**Required-artifact root cause:** §224 relied on a GATE 8 artifact carve-out that does not exist.
GATE 8 and GATE 12 each carve out the required act and neither carves out the required artifact,
while GATE 8 explicitly sends "a missing record" to `notEstablishedBecause`. Both §225 arms undercut
the artifact to the act, so it is a base-contract defect inherited, not introduced.

**Files changed:** 4 added, 0 modified.
**Prompt change:** 2 additive blocks, 114 lines, 0 files modified. §224 reconstructs byte for byte;
§210J reconstructs through it byte for byte.
**Schema change:** NONE. Byte-identical across §210J, §224 and §226.

**Local cases:** 10, seven measures, both contracts, 140 preregistered verdicts.
**Instrument preflight:** 19/19 PASS. Two authoring defects caught and repaired before the freeze;
the first freeze was discarded when scoring revealed an expectation/evaluator disagreement, and two
checks (P15, P16) were added so that disagreement cannot be frozen through again.
**Declaration recall:** 100% — all 3 omissions caught.
**Property identity:** 100% — all 3 substitutions caught, including one no deny-list enumerated.
**Independence:** 100% — the absorbed sibling caught.
**Restraint:** 2 cases, 0 false declarations, neither moved between the contracts.
**Required act:** 0 over-corrections.
**Required artifact:** 0 over-corrections.
**Candidate-state bypass:** 3 exercised, 0 bypassed.

**Affected regressions:** 635 assertions, 0 failures.
**Typecheck:** clean, experiment scope and production build.

**Architecture expanded:** NO.
**New semantic authority:** NO.
**Deterministic semantic inference:** NO.

**Hosted confirmation proposed:**
cases: **8**, all fresh, one per required shape, single arm.
calls: **8** planned plus **2** contingency, contingency spendable only on transport failure.
projected spend: **USD 0.72**.
hard ceiling: **USD 1.10**.
Designed in `SECTION-226-HOSTED-CONFIRMATION-DESIGN.md`. **Not executed. Not authorized.**

**Provider calls actually made:** 0.
**Database operations:** 0.
**Context sources loaded:** 10, about 16,500 words.
**Approximate context reduction:** about 95% against the historical default.
**Commit / push / tag / deploy:** NONE.

---

## What should stay visible when the hosted authorization is considered

Three things.

**The successor is a contract that can now reach what it forbids.** §224 already forbade the H2 and
H3 substitutions and never examined them. Whether a model given GATE 14 actually grants its own
branchA and acts on the answer is not established here and is not claimed.

**The confirmation is single-arm by design and cannot attribute.** §225 established causality on a
paired instrument and that does not need repeating. The cost is that a §226 pass cannot be separated
from case authoring. That limit is stated before any spend and is not mitigated away.

**The stop rule is not discretionary.** If a properly controlled hosted confirmation still materially
fails exact property selection or declaration recall, §227-style prompt tuning does not begin. Three
bounded instruction slices will have acted on three separately diagnosed mechanisms, and a fourth
would be evidence about the method rather than about the contract.

---

**TERMINAL:
`EXPERT_HAZLENZ_FIRST_PASS_SEMANTIC_CAPABILITY_REMEDIATED —
FINAL_BOUNDED_HOSTED_CONFIRMATION_AUTHORIZATION_REQUIRED`**

Do not begin the hosted confirmation. §226 stops here.
