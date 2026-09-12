# Phase 2 — the hazard-actuality rule

## The distinction

A fact can be:

1. true;
2. relevant to a hazard family;
3. worth reasoning about in context;

without independently establishing a CURRENT actionable hazard. §112's R6 responses conflate (2)
with a conclusion that only (an additional, unstated) fact about present exposure could support —
"the guard was removed" is true and is relevant to `machine_guarding` as a family, but nothing in
the observation establishes that anyone is currently exposed to the point of operation, that the
machine can currently move, or that any hazardous interaction is presently occurring.

## The rule

Before a candidate is raised as a CURRENT hazard (any `assertedConditionState` other than
`HYPOTHETICAL` or a genuinely unknown state), the reasoning must point to a current hazardous
state, exposure, interaction, or actionable present condition — not merely a fact that would be
hazardous under a different, hypothetical, or future operating state. Concretely: do not infer
current actuality solely because the same fact would constitute a hazard if some OTHER fact (not
stated, not evidenced) were also true — an unnamed bystander being present, an unstated
re-energization occurring, an unstated active task at the point of operation. Future
re-energization, future operation, future access, or future process changes must not be silently
converted into current exposure.

## What this is NOT

This is explicitly not "LOTO suppresses machine guarding" or "verified zero energy means a missing
guard is always safe" — both named as unsafe in this operation's authorization and confirmed unsafe
by the adversarial corpus (`ADVERSARIAL_RECALL_FIXTURES`, V1–V8): a missing guard remains
candidate-worthy whenever a CURRENT fact supports exposure — energy not actually verified at zero,
stored energy remaining, no isolation device applied at all, a second uncontrolled source, the
machine merely stopped rather than isolated, an auto-restart capability, a worker actually reaching
into the point of operation right now, or an active task creating a different current exposure. The
rule is about whether TODAY'S facts establish a hazard, not about which hazard family the fact
belongs to.
