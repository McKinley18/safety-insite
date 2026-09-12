# §224 PHASE A — ROOT CAUSE

**Provider calls 0 · Database operations 0.** Diagnosis from the §221 recorded first-pass outputs
and the composed §210J instruction. No speculation is offered where evidence is absent.

---

## The short version

Both Class A families are instruction defects, not representation defects. §223's finding holds: the
structured representation needed to express the correct result already exists, and no schema change
is required to reach either.

**Recall.** The declaration list is subordinate to the clarification list *by construction*. A first
pass that asks no question cannot declare a fact, and §221 IG1 and IG8 both asked none. Neither
broke the contract.

**Property selection.** Every property gate separates the *state* from the *evidence or process*
that would establish it. A control's operating state is neither, so it passes every gate, and the
`affectedDecision` vocabulary independently licenses it.

---

## RC1 — the declaration is gated on the question

`STATING AN UNRESOLVED FACT IN FULL` opens:

> The test is the one you have already applied: a fact belongs here only when you can name two
> materially different answers that would lead to two DIFFERENT CURRENT outcomes, and the correct
> choice between them cannot be made without it. **If you would not have asked about it, do not
> declare it.**

That last sentence makes the declaration list a subset of the clarification list. Tracing every path
that can *add* an entry confirms it:

- the **RETENTION BRIDGE** finds a recognised unknown and routes it to
  `decisionCriticalClarifications`: "If YES, there MUST be a decisionCriticalClarification for it";
- the **FOUR CHECKS**, check 2, then routes a question to a declaration;
- **GATE 2** repeats that link from the question end;
- every other gate states of itself, three times over, "They add no new reason to declare anything".

So the only way into the declaration list runs through a question. No path starts at a candidate.

**Observed in IG1 and IG8.** Both emitted `decisionCriticalClarifications: []` and
`unresolvedFactDeclarations: []`. Under this contract that pairing is not a violation.

## RC2 — the threshold is missing the "which control" limb

GATE 3 reads:

> For each entry, read `decisionIfA` against `decisionIfB` and ask what would have to happen NOW
> under each answer. **If the required action today is materially the same either way, DELETE THE
> ENTRY.**

IG1 answered that at the granularity of *whether to act*, and recorded the reasoning in its own
words:

> uncertainty: "The exact vertical rise of the ladder is not established, which affects how severe a
> fall from the uncaged section could be, **though the presence of the hazard itself does not depend
> on this figure**."
>
> summary: "The exact rise is unmeasured ... **but it does not change the immediate need to address
> the missing fall protection**."

That reasoning is internally coherent under GATE 3 as written. The fall hazard is `ACTIVE` under
both branches, so "the required action today" — address the missing fall protection — looks the same
either way.

It is wrong because the rise determines *which* fall protection is required, not *whether* some
action is owed. The frozen truth treats it as decision-critical for exactly that reason. GATE 3 does
not ask that question, and nothing else in the contract asks it either.

## RC3 — the negative conclusion is unwitnessed

Check 2 of the FOUR CHECKS permits discharge two ways:

> exactly one of these must be true: an entry in `unresolvedFactDeclarations` states it; **or you
> have concluded it does not change today's action after all**, and it is therefore not an
> unresolved fact.

The RETENTION BRIDGE offers the same exit more bluntly: "If NO, say nothing."

Neither requires the conclusion to be recorded anywhere. So the second branch can be taken in prose,
and the output is indistinguishable from a gap that was simply dropped.

**Observed in IG8.** Its own `CAND-3` stands at `INSUFFICIENT_EVIDENCE`, `confidence: LOW`,
`requiresUserConfirmation: true`, with reasoning that ends "**which is a distinct but related gap**".
The summary then asserts:

> "**No decision-critical fact is missing**: the current state, exposure, and lack of any control are
> all directly stated."

and `uncertainty.statements` is `[]`. A blanket prose negative discharged a check that its own
candidate contradicts, and nothing in the output can detect the contradiction.

**Classification: candidate/declaration inconsistency, enabled by an unwitnessed escape.** The two
are one defect. The inconsistency is possible only because the negative needs no witness.

## RC4 — control state versus hazard state is an instruction priority conflict

This one is not a missing rule so much as two rules pulling opposite ways.

GATE 8 keeps the *process* out of the property — "checked, inspected, tested, measured, verified,
documented, recorded, available, seen earlier: all of those are finding out". GATE 12 names the same
drift from the branch end. Both are tests of **state versus evidence**.

A control's operating state is a genuine state of the world. Applying GATE 8's own test to IG10's
declared property: picture the fan running with nobody having heard it — the property is satisfied.
It passes. GATE 12's test: branchA and branchB divide fan-running from fan-stopped, not known from
unknown. It passes.

Meanwhile the `affectedDecision` vocabulary licenses it outright:

> `REQUIRED_CONTROL` — the hazard and the applicable framework are settled; which control is
> required, **or whether a specific control was applied**.

**Observed in IG10.** Declared property: *"Whether the plant room ventilation fan is currently
running (cycling) on its run-on timer"*, labelled `REQUIRED_CONTROL`. Frozen controlling property:
whether the plant-room atmosphere is safe to enter.

Two further details make the materiality concrete. First, the model knew the real question — its own
`decisionWhileUnresolved` reads "Treat the room as having no verified means of detecting or clearing
a CO2 release". Second, `decisionIfA` says that with the fan confirmed running "entry can continue",
which is a settlement path that would authorise entry on the wrong grounds.

The gap in the contract: nothing subordinates a control's state to the hazard state **when the
hazard state is itself open**. `REQUIRED_CONTROL` is correct when the condition is settled and only
the control question remains. On IG10 the condition was not settled.

---

## Root causes not found

Stated so the absence is on the record rather than implied.

- **Output or token pressure.** IG1 used 1,296 output tokens, IG8 1,652, IG10 2,913, all against a
  4,000-token limit with `stopReason: tool_use`. None was truncated. IG2's truncation is a separate,
  contained Class B defect and is not a cause of either Class A family.
- **Representation or schema gap.** The candidate carries `assertedConditionState` with `UNKNOWN`
  and `INSUFFICIENT_EVIDENCE`; `uncertainty.statements` can carry a witnessed negative; the
  declaration carries twelve fields including `decisionWhileUnresolved`. Every result the frozen
  truth requires is expressible on the existing schema.
- **Output contract reliability.** All three cases returned well-formed output that parsed and
  projected. IG3 and IG7's malformation is the separate Class B family.

## What this means for the remediation

Four causes, three of them one family. RC1 and RC3 are the two halves of a single missing link:
nothing carries a recognised unknown into the declaration list, and nothing records the decision not
to. RC2 is a threshold too coarse by one limb. RC4 is a precedence rule that was never stated.

All four are reachable by instruction. None requires a new layer, a second verifier, a schema field,
or deterministic inference.
