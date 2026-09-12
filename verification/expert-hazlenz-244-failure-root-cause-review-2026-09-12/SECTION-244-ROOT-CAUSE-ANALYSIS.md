# §244 — Root-Cause Analysis, Families A and E

Zero provider calls. No remediation performed.

## The single locus

The §239 contract makes the posture label a dependent variable. A cessation driver forces STOP. A
permitting posture forbids a resumption dependency. Required controls exist only under
continue-with-controls. The model does not choose a posture and then justify it; it chooses a set
of driver roles, and the posture is whatever those roles permit.

Therefore every posture defect in §243 is a **driver-role selection** defect, and the evidence
confirms it: the four posture misses are a strict subset of the six role-presence breaches, and
there is no posture miss without a role breach.

This answers the directive's instruction not to solve the problem by weakening STOP language.
Weakening STOP language would address nothing, because STOP was the coherent consequence of the
roles the model chose.

## Family A root cause

Two sub-mechanisms, both of them role-selection errors.

**A1. Established-condition role inflation.** On C5 the model carried a worker on foot behind a
reversing vehicle, and a defeated reversing camera, as conditions whose current state on its own
requires the work to cease. The transmitted definition of that role says cessation applies when
"no control operated alongside the work would make continued exposure acceptable". A banksman in
radio contact with an agreed stop signal is exactly such a control, and the frozen truth names it.
On M1 a blocked dust nozzle with thirteen of fourteen sprays working was carried as requiring an
immediate control, where the frozen truth requires nothing today. On M8 three established
conditions were carried as requiring controls where the frozen truth requires none.

**A2. Manufactured fact promoted to the continuation-controlling role.** On M8 the model declared
whether the tracked storm cell is inside the documented trigger distance, and made it a driver of
continuation. On G5 it declared whether a hold-to-run mode the observation states exists is
available and functional, and made that a driver.

## What is NOT the cause

**Not missing guidance.** The transmitted role definitions already draw every distinction the
frozen truth relies on. The no-immediate-action role explicitly says "A hazard can be real, present
and active and still be here. This is a real answer." The cessation role explicitly conditions on
no alongside-control sufficing. The follow-up role explicitly covers a fact whose resolution
changes only what is done about it. This guidance is not absent, vague or in conflict.

**Not the declaration gate alone.** Three of the seven manufactured declarations that reached the
posture basis were correctly routed to follow-up, by the same model on the same run. C5 and M1 each
manufactured a fact and then correctly refused to let it control continuation. The model can make
the controlling-versus-follow-up distinction and demonstrably does.

**Not the verifier.** Every one of the six verifier legs returned a VALID property review, and five
were clean. The verifier did not cause a single role error, and on the six cases where it ran it
did not contradict a correct model property.

**Not the deterministic admission contract.** It refused fourteen of twenty-four calls and admitted
nothing it should have refused. HS11 and HS17 recorded zero occurrences. The contract did its job.

**Not excessive declaration recall bias in the usual sense.** Declaration recall was perfect at
3 of 3 and controlling-property identity was perfect at 3 of 3. The model never missed a property
it owed and never substituted a prohibited proxy. It over-produces, it does not under-produce.

## The representational gap, stated precisely

A driver role is emitted as a bare enum. Nothing in the representation obliges the model to
confront, at the moment of role assignment, the facts the observation has already established about
that condition.

- A cessation driver carries no obligation to name the alongside control it considered and say why
  it is insufficient. C5 would have had to name a banksman and argue it inadequate.
- A controls driver carries no per-driver link to the control that discharges it. M8 emitted three
  controls drivers and then, for one of them, restated an existing written procedure as the control.
- A declaration carries `branchA`, `branchB` and `decisionWhileUnresolved`, but nothing distinguishes
  an unstated **present state** from a **future contingency** or a **pending action or record**.
  M8's storm fact is a future contingency: the observation establishes sixty miles, a documented
  trigger distance, a written procedure and active monitoring, so what is genuinely open is whether
  the cell later closes, which is not a present unknown.

This is the only gap in the representation that the §243 evidence supports. It is narrow.

## Honest limit on what closing that gap would achieve

A temporal-character field on declarations would, on the frozen outputs, have barred M8's storm
fact from a controlling role. It would not have barred G5's hold-to-run fact, which the model would
plausibly classify as an unstated present state. A cessation-justification field would have forced
C5 to confront the banksman, but whether it would have changed the answer is unknowable from the
frozen outputs.

So the gap is real and worth closing, and closing it does not guarantee the behaviour changes. The
residual after the representation is complete is **semantic capability**: the model does not
reliably let an explicitly stated negating fact lower a condition's disposition. §239 already
broadened the driver representation once. If a bounded contract slice plus a hosted confirmation
does not move role-presence coherence, the correct next step is a product-owner capability decision
and not a further architectural layer.

## Family E conclusion

Posture and controls do not need to be joined, because they are already joined. C5 exposes no
second defect. The requirement the directive states, that a posture be supported by its basis and
by required controls where applicable, is already enforced in both directions by the §233 and §239
projections. The repair target remains role selection.

The one thing §243 shows is worth adding is a **per-driver** link from a controls driver to the
control that discharges it. Today the link is only at posture level, which is why M8 could emit
three controls drivers and three controls without any of them being tied to each other.
