# Phase 6 — Adversarial review of both positions

Both cases are built to their strongest form before either is judged. The Sonnet case is built
from what the transcripts *could* have argued, not only what they did argue — steel-manning
requires giving it its best available argument.

---

# A. The strongest case FOR the current R6 oracle
### *(no independent current `machine_guarding` candidate)*

**Supporting product semantics.** Four independent surfaces already encode this, three predating
the Expert fixtures (PHASE2): the deterministic engine's 1910.212 predicate resolves
`NOT_APPLICABLE` at 0.96 on this exact sentence; golden scenario 7 is *named* "Not Guarding
alone"; the Expert corpus pairs `R6` (forbidden) against `V7` (required) on a one-fact
difference; and the fixture's own charter states that noise on a safety tool is a cost the
inspector pays on every observation.

**Supporting safety reasoning.** The guard's function is to prevent contact with hazardous
*motion*. A verified zero-energy state removes motion. The control that replaced the guard is
strictly stronger than the guard: a guard prevents contact with a moving part; verified LOTO
prevents the part from moving at all. Raising a guarding hazard here inverts the safety
hierarchy — it treats the removal of a lower-order control as a hazard while a higher-order
control that subsumes it is stated, verified, and independently witnessed.

**Regulatory basis (from the repository's corpus, PHASE3).** 1910.212's own
`nonApplicabilityQuestions` ask whether *"employee contact is not reasonably possible"* and
whether *"the task is service or maintenance where lockout/tagout may be the more specific
controlling standard."* Both resolve in favour of non-applicability on R6. 1910.147's
non-applicability test — *"Was the equipment fully de-energized and verified before employee
exposure?"* — is satisfied affirmatively.

**Assumptions required.** Only one: that "verified at zero" and "a second worker verified the
isolation" mean what they say. That is the same assumption the product makes about every stated
fact, and prompt v6 states it as a rule (*"treat a stated step as done"*).

**Failure mode if adopted.** Under-calling a guard-off condition where a control is *claimed* but
weaker than claimed. This is the real risk, and it is the risk the corpus was explicitly built
to bound: `V1`–`V6` each degrade the control by exactly one fact and each require recall.
Empirically the risk did not materialise on the hosted model — `U-B` (merely stopped),
`U-C` (incomplete control), `U-F`, `T5` and `R4` all **passed** hosted under v6, with zero
routing misses across 18 opportunities (§114.5). The suppression is narrow and measured, not
speculative.

---

# B. The strongest case FOR Sonnet's repeated behaviour
### *(the removed guard remains an independent `machine_guarding` candidate)*

This case deserves better than the transcripts made for it. Its best form:

**Supporting product semantics.** Prompt v6 instruction 1 says, in plain language: *"Any hazard
you think may be present that is NOT already in the deterministic findings above. **Include it
even if you are unsure** — set confidence LOW and requiresUserConfirmation true."* Expert was
shown a deterministic set containing **only** `lockout_tagout`/`CONTROLLED`. `machine_guarding`
genuinely was absent from it. All nine responses set `requiresUserConfirmation: true` and
`relationshipToDeterministic: ADDITIONAL_TO_DETERMINISTIC`. **The model is executing instruction
1 on the input it was given.** The Expert layer is additive and advisory by contract
(`expert-contract.types.ts` header, `D-110`), the candidate carries an explicit confirmation
flag, and it stands beside — never inside — the deterministic result.

**Supporting safety reasoning.** A LOTO is a *temporary* control on a *permanent* machine
configuration. The guard's absence outlives the isolation: the isolation will be released, and at
that moment the guard's absence becomes lethal. A safety professional walking a plant floor and
seeing an open press with a guard on the bench does not think "nothing to note" — they think
"that guard must go back before this runs," and they say so. §114.8 records exactly this:
*"on its own terms, one a human safety professional might also make."* The deterministic finding
`isActionable: false / requiredActions: []` means this observation produces **no action item at
all** — and a real inspection of an open, de-guarded press plausibly should leave one.

**Regulatory basis.** Guard restoration before re-energization is genuine professional practice.
The failure mode it prevents — a machine returned to service de-guarded — is a well-known and
severe one.

**Assumptions required.** Three, and each is load-bearing:
1. that "may be present" in instruction 1 extends to a hazard whose only pathway is a
   transition the observation does not state;
2. that a *future* prerequisite is appropriately represented as a *current* candidate;
3. **that `assertedConditionState: ACTIVE` is the right label for it.**

**Failure mode if adopted.** Assumption 3 is where the case collapses, and it collapses on the
product's own vocabulary rather than on a judgment call. `EXPERT_CONDITION_STATES` offers
`ACTIVE`, `CONTROLLED`, `HYPOTHETICAL`, `INSUFFICIENT_EVIDENCE` and `UNKNOWN`. Prompt v6's hard
prohibitions say: *"NEVER assert a condition is ACTIVE when the observation does not establish
present exposure. If you cannot establish the state, say INSUFFICIENT_EVIDENCE or UNKNOWN. Both
are real answers."* Six of nine hosted reps (all of v5 and v6) asserted **`ACTIVE`** — a
present-tense exposure claim on a machine at verified zero energy. That is not a defensible
advisory note; it is a false statement about the current state, filed against a deterministic
decision that reads `NOT_APPLICABLE` at 0.96.

And assumption 2 fails on generality: "the guard will need to go back" is true of every
correctly executed LOTO involving guard removal. A product that emits an advisory on a textbook
observation emits one on everything, which is the precision cost the R6 fixture exists to
measure.

---

# C. What the transcripts add that neither side anticipated

**The model's own output contradicts itself, in the direction of the oracle.**

v6 rep 3's summary reads: *"…so this is raised as a low-confidence candidate pending confirmation
**rather than an active finding**."* The candidate it accompanies carries
`assertedConditionState: "ACTIVE"`. The model is describing the advisory, hedged, non-active
thing that case B argues for — and then filing it under the one label case B cannot defend. Its
prose agrees with the oracle about the *state*; only the field disagrees.

**The `machine_guarding` candidate is also mis-routed under the contract.** It contradicts a
deterministic determination, which the contract routes to `disagreements`
(`CONTRADICTS_DETERMINISTIC` → *"it routes to a disagreement, which is evidence"*). All nine
filed it as `ADDITIONAL_TO_DETERMINISTIC`. In fairness to the model, it could not have known: the
1910.212 `NOT_APPLICABLE` decision **was never in its input** (PHASE2). This cuts both ways and
is the strongest single fact in case B — but it indicts the *input projection*, not the oracle.

---

# Adjudication of the two cases

Case B establishes something real: **the model is partly complying with instruction 1 on an
incomplete input, and its behaviour is more reasonable than "the model is ignoring the
instructions" implies.** §114.8's instinct — that a human professional might make the same call
— is fair, and this adjudication endorses it as far as it goes.

It does not go as far as overturning the oracle, for three reasons that are independent of each
other:

1. **The state claim is false.** `ACTIVE` on a verified zero-energy machine is not a hedge the
   product can ship, and the model had `CONTROLLED`, `UNKNOWN` and `INSUFFICIENT_EVIDENCE`
   available and instructed.
2. **The justification is invented.** Every consequence across all nine reps is hedged on a
   condition the responder supplied, and one (v6 rep 3's gravity mechanism) contradicts a stated
   fact.
3. **The oracle is not an isolated assertion.** Overturning it requires simultaneously
   overturning a production deterministic predicate, a protected golden expectation, and the
   `R6`/`V7` contrast pair — none of which the hosted evidence touches.

**Case A stands. Case B correctly identifies a defect — in the input projection and in the
oracle's *encoding*, not in the oracle's *semantics*.**
