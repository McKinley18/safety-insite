# §247 — Slice 1: Driver-Role Justification

Zero provider calls. The representation is implemented and proved locally. **No claim is made here
about changed model generation**; only the frozen hosted confirmation can establish that.

## The mechanism being repaired, preserved from §244

Every posture defect in §243 was a **driver-role selection** defect. Posture is a dependent variable:
a cessation driver forces STOP, required controls exist only under continue-with-controls, and the
model does not choose a posture and then justify it. The four posture misses were a strict subset of
the six role-presence breaches, and there was no posture miss without a role breach. Family E is not
independent. So posture labels were not tuned, no special-case STOP suppression was added, and the
repair target is role selection alone.

Two sub-mechanisms were demonstrated. **A1, established-condition role inflation**: C5 carried a
worker behind a reversing vehicle as requiring cessation on an observation naming a banksman in radio
contact; M1 carried a blocked nozzle with thirteen of fourteen sprays working as requiring a control;
M8 carried three established conditions as requiring controls where the frozen truth requires none.
**A2, manufactured fact promoted to the controlling role**: M8's storm cell sixty miles out with a
documented trigger distance, and G5's hold-to-run availability.

## The representational gap

A driver role was emitted as a **bare enum**. Nothing obliged the model to confront, at the moment of
role assignment, what the observation had already established. A cessation driver carried no
obligation to name the alongside control; a controls driver carried no link to the control that
discharges it; nothing separated an unstated present state from a future contingency.

## What was added

One structured object on every basis entry, `roleJustification`, in a single additive successor
contract (`expert-247-posture-contract.ts`). No second layer was added: K6 lives in the same
successor because both change the same node.

**The closed vocabulary**, which is what distinguishes the four kinds the authorization names:

| `epistemicCharacter` | Meaning |
|---|---|
| `ESTABLISHED_CONDITION` | the observation states it; any control stated alongside the work is part of what is established and must be weighed |
| `UNRESOLVED_DECISION_CRITICAL` | a **present** state the observation does not settle, whose resolution one way permits the work and the other does not |
| `MANUFACTURED_OR_SPECULATIVE` | a possibility, contingency, future event or check the observation does not raise |
| `FOLLOW_UP_NON_CONTROLLING` | unresolved, and its resolution changes only what is done about it |

**The four minimum fields** the authorization requires: `factualBasis` (what the observation
establishes, including any alongside control), `unresolvedElement` (the one open thing, or null),
`whyDecisionMaterial` (why resolving it could change the immediate decision), and
`whyControllingNotFollowUp` (why this role rather than follow-up).

**Two role-specific obligations**, each targeting a demonstrated mechanism. A cessation driver must
name `alongsideControlConsidered` and `whyAlongsideControlInsufficient` — C5 would have had to name
the banksman and argue it inadequate. A controls driver must name `dischargingControlRef`, the exact
control text from its own `requiredControls` — M8 emitted three controls drivers and three controls
with nothing tying any of them together.

## The one table that is the safety content

`ROLE_EPISTEMIC_CHARACTERS_247` maps each role to the characters it may carry. One row is the repair:
**`MANUFACTURED_OR_SPECULATIVE` appears against no controlling role.** A fact the model itself labels
manufactured cannot drive continuation. That is A2, made unrepresentable rather than refused after the
fact. A load-time guard fails the module if any controlling role is ever given that character.

## Where the line between model and code sits

The provider supplies the judgement. Deterministic code checks **representational consistency only**:
required-field presence, closed-vocabulary membership, role-to-character admissibility, and whether a
per-driver control reference resolves to one of the model's own `requiredControls` strings.

It never decides that a condition is actually established, never decides that a fact is actually
decision-critical, never reads meaning out of prose and never scans keywords. The M8 check compares a
string the model wrote in one field against strings the model wrote in another field of the same
analysis; it says nothing about whether any control is adequate. `roleJustificationEffect247()` states
all five negatives as data so a report cannot overstate the module.

## Local proof

`test-247-driver-role-and-k6`: **33 of 33 pass.** Named mechanism results:

| Case | Result under the new representation |
|---|---|
| C5 | a cessation driver that never confronts the alongside control is **refused**; one that does is admitted, and its content is never judged |
| M8 / M1 | a controls driver with no discharging control is **refused**; a dangling reference that matches none of its own controls is **refused** |
| M8 storm | a fact labelled manufactured in a controlling role is **refused** and counted, never repaired into another role |
| G5 | a hold-to-run fact labelled decision-critical is **still admitted** |

The G5 row is the §244 preregistered expectation, preserved exactly and deliberately not revised: this
representation would have barred M8's storm fact and would **not** necessarily have barred G5's. That
expectation was written before implementation and is not being rewritten after it.

## Additive successor

`build247PostureSchemaProperty()` reduces to the §239 property byte for byte, and `build247SystemPrompt`
reduces to the §239 prompt byte for byte, both asserted. No driver role was added or removed. §233 through
§239 are not edited and remain reproducible from the tree.

## The stopping rule

This is the **final** bounded representational attempt at this mechanism. §239 broadened the driver
representation once; §247 is the second and last. If the frozen hosted confirmation does not meet its
threshold, the return is `EXPERT_HAZLENZ_DRIVER_ROLE_CAPABILITY_LIMIT_REMAINS` and a product-owner
capability decision — not another taxonomy, sidecar, verifier, prompt layer, schema layer or contract
generation.
