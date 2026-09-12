# §188 — Root cause: `proposedClarification` = 0 / 15

**Read-only review. No source was modified. No prompt wording is proposed here — the semantic
diagnosis is not complete, because it cannot be completed without the human adjudication.**

The instruction for this section is explicit that the analysis must not begin by assuming every row
required a question. It does not. It begins by asking what a `proposedClarification` would have
*meant* on each execution, and the answer is not the same on all fifteen.

---

## 1. The rate is measured against the wrong denominator

The verifier is a **second-pass reviewer of a clarification set**, not a first-pass question
generator. Its jurisdiction, stated in the first sentence of the system prompt, is "whether the
clarification set is right". Emitting a `proposedClarification` therefore requires verdict
`ADD_OR_REPLACE_CLARIFICATION`, which asserts that *a fact that would change what is done now is not
asked about*.

That assertion is only available when there is something to add. From `FIRST-PASS-STIMULI.json`:

| row | first-pass clarifications asked | could a proposal be owed? |
|---|---|---|
| HR-01 | 1 — *"Was the flame-failure device / burner flame-tested during Monday's service, even though it is not recorded on the certificate?"* | only if that question fails to reach the owed fact |
| HR-06 | 1 — *"Was the rotor guard interlock switch functionally tested (not just visually confirmed in place) after the tooth change and before this restart?"* | only if that question fails to reach the owed fact |
| HR-08 | 1 — *"Has the auger drive's own local isolator been locked out (or otherwise verified de-energized) separately from the main dryer panel lockout?"* | only if that question fails to reach the owed fact |
| HR-09 | 1 — *"Has the accumulator pressure been confirmed at zero (or a safe residual level) by reading the gauge, rather than merely cycling the dump valve without checking the result?"* | only if that question fails to reach the owed fact |
| **HR-04** | **0 — asked nothing** | **yes, unconditionally** |

So the fifteen executions split into two populations that must not be averaged:

- **12 executions (HR-01, HR-06, HR-08, HR-09 × 3).** A first-pass question targeting the owed fact
  was already on the record. Zero proposals is the **contract-prescribed output** here *conditional
  on* the existing question being adequate. Whether it is adequate is the human axes
  `CLARIFICATION_TARGET_CORRECT` and `CLARIFICATION_EVIDENCE_SUFFICIENT`. **Pending.**
- **3 executions (HR-04 × 3).** Nothing was asked. A proposal was structurally available and was the
  expected output if a clarification was necessary. The verifier declined 3/3.

**`0 / 15` conflates a design-expected zero with a contested one.** The honest statements are:

```
PROPOSED_CLARIFICATIONS_EMITTED                          = 0 / 15   (mechanical, correct as far as it goes)
EXECUTIONS_WHERE_A_PROPOSAL_WAS_UNCONDITIONALLY_AVAILABLE = 3 / 15  (HR-04 only)
PROPOSALS_ON_THOSE                                        = 0 / 3
EXECUTIONS_WHERE_ZERO_IS_CORRECT_IFF_THE_EXISTING_QUESTION_SUFFICES = 12 / 15  (PENDING)
```

`0/15` must not be reported as a behavioural clarification-suppression rate. `0/3` is the figure
that carries the contested behaviour, and even it is small.

---

## 2. Hypotheses the evidence eliminates deterministically

**`acceptableEvidence` interpreted too loosely — ELIMINATED, mechanically.**
`V3SuppliedOwedFact` (`expert-verifier-instruction-v3.ts:325`) has no `acceptableEvidence` field,
and `buildVerifierV3UserPrompt` never prints one. It is `null` on all five rows under the §184/§185
derivation and was **never transmitted**. The verifier could not have consulted it, loosely or
otherwise. Recorded at §187A and re-confirmed at §187B pre-resume check 7.

**Bias toward challenge rather than clarification — NOT SUPPORTED.**
One challenge in fifteen, on one row. Challenge is not being used as a substitute route.

**Bias toward `STILL_UNRESOLVED` without an actionable question — NOT SUPPORTED as a *substitute*.**
Twelve executions declared `STILL_UNRESOLVED`, but on all twelve an actionable question already
existed on the record. `STILL_UNRESOLVED` was the bookkeeping token accompanying deference to that
question, not a way of parking a fact with nothing asked. (It is also, per
`CONTRACT-FAILURE-ROOT-CAUSE.md` §3, the only token available for that situation.)

**Nomination suppressed by the prompt's prior — NOT AN EXPLANATION OF THIS RATE.**
`nominatedFact` = 0/15, and the prompt does carry an explicit prior: *"THE ANSWER IS USUALLY NO, AND
NO IS A GOOD ANSWER."* But that prior sits inside step 4 and governs **nomination of an additional
fact**, not the clarification decision on the supplied fact. It is scoped, and within its scope a
zero rate is what it asks for. It is not evidence about `proposedClarification`.

---

## 3. Where the instruction is strict, and where the pressure actually sits

The instruction is **not** loose about sufficiency. Step 3 states the strict test in as many words:

> A question that reaches a DIFFERENT unresolved fact does not count, however well posed it is: the
> test is whether an answer to the question as written **would settle the fact that changes the
> decision.**

That is settle-level sufficiency, not topic identification. The step-3 text does not license
confusing "identifies the topic" with "sufficient to settle". So the twelve deferrals are not
attributable to a permissive instruction on its face; whether the model *applied* the strict test it
was given is the pending human axis.

The real asymmetry is elsewhere, in step 2 and step 5, and it is one-sided in a specific way. The
prompt supplies **three named heuristics**: two that exclude a fact from being decision-critical,
and one that includes it.

| heuristic | direction | prompt location |
|---|---|---|
| MAGNITUDE — "how long, how often, how many, how large" | excludes | step 2 |
| A DETAIL WITH ITS CONTROL ALREADY IN PLACE | excludes | step 2 |
| A CONTROL THAT CANNOT BE SEEN IS NOT A CONTROL THAT WAS CHECKED | includes | step 2 |

Plus, on the verdict itself:

> `NO_CLARIFICATION_REQUIRED` — […] This is an assertion, and it is a normal, frequent and correct
> answer. **Asking anyway costs a real person real time and buries the questions that matter.**

**The observed behaviour tracks these three heuristics exactly, and the split is clean.** On
HR-01, HR-06, HR-08 and HR-09 the rationales invoke the *inclusionary* heuristic by name — HR-01 #1:
"This is a case of an unobservable control"; HR-09 #2: "a classic 'control that cannot be seen is
not a control that was checked' situation" — and every one of those twelve returned
`VERIFIED_AS_IS`, preserving the fact.

On HR-04 all three rationales invoke the two *exclusionary* heuristics by name — "This is a
magnitude/detail-with-control-in-place situation" (#1), "requiring evidence beyond what any normal
fixed-guard maintenance program provides" (#2), "a magnitude/interval question dressed as a binary
fact" (#3) — and replicate 3 explicitly **declines** the inclusionary one:

> There is also no unseen/uninspected control here analogous to the "control that cannot be seen"
> pattern -- **the guard is directly observed present and in position**.

That sentence is the hinge of the whole result. The model treated the *visibility of the guard* as
disqualifying the unseen-control heuristic, and the owed fact is not about the guard's visibility —
it is about whether the guard's **fastenings are currently secure**. Whether visibility of a
component establishes anything about the securement of its fastenings is
`NO_NEARBY_PROPERTY_SUBSTITUTION`, and it is the adjudication. See
`HR-04-ADJACENT-FACT-REVIEW.md`.

**So the pattern is row-specific in its outcome and systematic in its mechanism.** One row produced
every declination; but the mechanism that produced them — which of three named heuristics the model
selects, and on what evidence it decides a control is "seen" — is general and would apply to any row
where the hazardous property is invisible while its housing is visible.

---

## 4. Row by row

Each row carried exactly one supplied owed fact (`suppliedOwedFactCountPerExecution: 1`).

### HR-01 — burner flame-failure safeguard

*Owed:* `owed:fire:burner_flame_failure_safeguard_function_verified` — whether the safeguard was
verified to shut off fuel on loss of flame.
*Evidence available:* the certificate lists a nozzle change and filter clean, does not record a
flame test; the device cannot be seen from the walkway.
*Provider did:* `VERIFIED_AS_IS` × 3, deferring to the first-pass question. #3 additionally asserted
`BOUND_BY_CLARIFICATION` and was refused whole (see `CONTRACT-FAILURE-ROOT-CAUSE.md`).
*Human adjudication says clarification remained necessary:* **PENDING.**

### HR-04 — fixed guard fastenings

*Owed:* `owed:guarding:fixed_guard_fastenings_currently_secure` — whether the guard over the head
drum nip point is **currently secured sufficiently for safe operation**.
*Evidence available:* the guard "is in position"; a pre-start check was initialled covering **belt
tracking and lubrication**; fastenings "last torque-checked at the annual service"; "no tools rest
on the guard".
*Provider did:* `NO_CLARIFICATION_REQUIRED` × 3 — an affirmative assertion that the fact is
genuinely unresolved *and* that answering it changes nothing. One challenge. No proposal. No
binding. Fact left unresolved 3/3.
*Human adjudication says clarification remained necessary:* **PENDING.**

### HR-06 — rotor guard door interlock

*Owed:* `owed:guarding:rotor_guard_interlock_protective_function_verified` — whether the interlock's
protective function was verified after the tooth change, before return to service.
*Evidence available:* guard door closed, interlock switch "in place"; return-to-service log records
the tooth change, carries no interlock test result.
*Provider did:* `VERIFIED_AS_IS` × 3, `STILL_UNRESOLVED` × 3. The most consistent row; all three
rationales distinguish "in place" from "functionally tested".
*Human adjudication says clarification remained necessary:* **PENDING.**

### HR-08 — auger drive isolation

*Owed:* `owed:energy:auger_drive_isolation_verified_before_work` — whether the drive was isolated and
proved dead before work at the blockage.
*Evidence available:* main dryer panel locked, personal lock applied, panel proved dead; the auger
drive has its own local isolator and the lockout log shows no entry against it; fans still running.
*Provider did:* `VERIFIED_AS_IS` × 3. #2 additionally asserted `BOUND_BY_CLARIFICATION` and was
refused whole.
*Human adjudication says clarification remained necessary:* **PENDING.**

### HR-09 — stored hydraulic energy

*Owed:* `owed:energy:stored_hydraulic_energy_dissipated_before_line_break` — whether accumulator
energy was dissipated and confirmed at zero before the hose is broken.
*Evidence available:* pump stopped, isolator locked, witnessed; dump valve cycled and left open; the
accumulator gauge "sits behind the tank shroud unread since".
*Provider did:* `VERIFIED_AS_IS` × 3, `STILL_UNRESOLVED` × 3. All three distinguish cycling a valve
from confirming zero pressure.
*Human adjudication says clarification remained necessary:* **PENDING.**

---

## 5. A frozen human datum that bears on this, and its exact scope

The §175 balanced clarification instrument carries a product-owner-supplied verdict on each of these
row texts:

```
HR-01  HUMAN_CLARIFICATION_REQUIRED = true   HIGH
HR-04  HUMAN_CLARIFICATION_REQUIRED = true   HIGH
HR-06  HUMAN_CLARIFICATION_REQUIRED = true   HIGH
HR-08  HUMAN_CLARIFICATION_REQUIRED = true   HIGH
HR-09  HUMAN_CLARIFICATION_REQUIRED = true   HIGH
```

`verdictProvenance: PRODUCT_OWNER_SUPPLIED_AI_ASSISTED`.

**Its scope must be stated precisely and not exceeded.** This verdict answers *"does this row
require a clarification at all"* — a row-level question, from a different instrument, formed before
and independently of any §184 owed-fact derivation. It does **not** answer whether the §187-supplied
owed fact is the fact that clarification is owed on, nor whether the first pass's question reaches
it, nor any of the ten §187 semantic axes.

It is surfaced here because it is directly relevant material a reviewer should hold, and because on
HR-04 the verifier returned `NO_CLARIFICATION_REQUIRED` three times on a row the product owner
marked as requiring a clarification with HIGH confidence. **That juxtaposition is not a verdict.**
It is recorded, it is not resolved, and it must not be substituted for the §187 adjudication.

---

## 6. What remains undiagnosed, and why

The semantic diagnosis is **incomplete by construction**, and no prompt wording is proposed here.

The whole question — was zero the right number of proposals — reduces to whether each first-pass
question actually settles its owed fact, and whether HR-04's owed fact was genuinely not
decision-changing. Both are `REQUIRES_HUMAN_TRUTH` under
`V3_ADMISSION_RULE_CLASSIFICATION`, and the frozen preregistration states that this model does not
decide them.

Proposing prompt wording now would mean tuning an instruction against an unmeasured outcome. The
remediation that follows the adjudication will be different depending on which of these it turns out
to be, and they are not the same defect:

- the twelve deferrals are correct and HR-04 is a genuine adjacent-property substitution → the
  remediation is about the *inclusionary* heuristic's boundary, not about question volume;
- the deferrals are wrong because the first-pass questions stop short of settling → the remediation
  is about step 3's sufficiency test, and the verifier's clarification-proposal behaviour is
  under-triggered generally;
- both are correct → there is no clarification-policy defect and `0/15` is a design-expected result
  reported against a misleading denominator.
