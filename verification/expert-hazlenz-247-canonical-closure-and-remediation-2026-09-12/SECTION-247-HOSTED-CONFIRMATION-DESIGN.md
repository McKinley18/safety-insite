# §247 — Driver-Role Hosted Confirmation: Frozen Instrument

**FROZEN, NOT EXECUTED. Provider calls to date: 0.**

Everything below is preregistered. No provider output has been seen, and the threshold is fixed here
before any spend. Executing this instrument requires separate product-owner authorization.

## Purpose, and what it is not

Its sole purpose is to determine whether the §247 driver-role representation materially improves
role coherence. It is **not** final acceptance, not a capability cohort, and not a whole-product
measurement. §242A is spent and is not reused.

## Size and cost

Six cases, one first-pass call each. No verifier leg: the verifier passed every §243 leg it ran and
is not under test here. Estimated spend at the frozen model's published rates is under USD 1.00.

## The six cases

Each is a fresh observation. **None reuses a §243 observation, verbatim or paraphrased.** Each is
written so that exactly one of the five distinctions the authorization names is the thing being
tested, and each carries a trap in the opposite direction so that a uniformly cautious or uniformly
permissive model fails.

| # | Case | Distinction under test | The trap it carries |
|---|---|---|---|
| H1 | A scaffold with one missing guardrail section on the north face; the gap is physically barriered off with Heras fencing and the crew are working on the south face. | clearly negated condition | over-restriction: the guardrail gap is real and looks like a cessation driver until the barrier is weighed |
| H2 | A confined-space entry in progress with gas testing current, a top-man posted, and no rescue plan on site. | real cessation driver | under-restriction: the current gas test invites treating the missing rescue plan as follow-up |
| H3 | A mobile elevating work platform being operated on a slab whose loading capacity the site file does not record. | genuine decision-critical uncertainty | over-restriction: the unknown is present-state and controlling, but must not become a cessation driver |
| H4 | A hot-works permit that expires at 16:00 with work due to finish at 15:30, weather clear. | manufactured/speculative possibility | over-restriction: "what if it overruns" is a future contingency and must stay non-controlling |
| H5 | An excavation with battered sides in stable ground, spoil set back, and no ladder within 25 metres of the working position. | real continue-with-controls driver | both: the access defect needs a control, not cessation, and not nothing |
| H6 | A lifting operation with a valid thorough-examination certificate, a competent slinger, and an exclusion zone that one delivery driver has walked through once. | follow-up / non-controlling uncertainty | under-restriction: a one-off incursion is a follow-up, but a real one |

## Preregistered truth

For every case, frozen before execution.

| # | Owed facts | Roles that MUST be present | Roles that MUST be absent | Posture |
|---|---|---|---|---|
| H1 | none | ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION | any CESSATION; any CONTROLS | CONTINUE |
| H2 | none | ESTABLISHED_CONDITION_REQUIRING_CESSATION | UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION | STOP |
| H3 | slab loading capacity | UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION | any CESSATION | STOP or CONTINUE_WITH_CONTROLS |
| H4 | none | none, or UNRESOLVED_RESPONSE_OR_FOLLOW_UP | UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION; any CESSATION | CONTINUE |
| H5 | none | ESTABLISHED_CONDITION_REQUIRING_CONTROLS | any CESSATION | CONTINUE_WITH_CONTROLS |
| H6 | none | UNRESOLVED_RESPONSE_OR_FOLLOW_UP | UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION; any CESSATION | CONTINUE or CONTINUE_WITH_CONTROLS |

**Under-restriction traps** (an answer here is an unsafe failure and a hard gate): H2 answered without
a cessation driver; H5 answered with no controls driver and no control; H3 answered as CONTINUE with
the capacity unknown unaddressed.

**Over-restriction traps** (an answer here is a restraint failure and counts against coherence): H1
answered with any cessation or controls driver; H4 answered with a controlling role on the permit
expiry; H6 answered with a controlling role on the incursion.

## Success threshold — frozen

Four hard gates, each pass/fail at zero occurrence or 100%, none compensable by any aggregate:

1. **Unsafe under-restriction: 0 occurrences.** Any one fails the confirmation outright.
2. **Manufactured or negated condition given a cessation driver: 0 occurrences** across H1 and H4.
3. **K6-invalid output: 0 occurrences.** Under the §247 union this should be structurally
   impossible; a single occurrence means the union is not being enforced and is a stop.
4. **Structural admission: 6 of 6.** An inadmissible analysis is a failure, not a missing datum.

Then the coherence measure, which is what the slice is actually testing:

5. **Role-presence coherence ≥ 5 of 6 cases (0.833).** A case counts only when its emitted role set
   contains every role the table requires present and none it requires absent. §243 measured 0.60 on
   the equivalent quantity, so 0.833 is a material improvement and not a cosmetic one. Four of six
   (0.667) does not pass.

6. **Justification completeness: 6 of 6.** Every cessation driver names an alongside control and why
   it is insufficient; every controls driver names a discharging control that appears in its own
   `requiredControls`. This is structural and deterministic code checks it.

All six must hold. **The threshold is frozen at this line and may not be lowered after results are
seen.**

## The stopping rule, restated

This is the **final** bounded representational attempt at the driver-role mechanism. §239 broadened
the driver representation once; §247 added the justification and closed K6. If this confirmation does
not meet the threshold, the answer is

    EXPERT_HAZLENZ_DRIVER_ROLE_CAPABILITY_LIMIT_REMAINS

and a product-owner capability decision. Not another role taxonomy, not another semantic sidecar, not
another verifier, not another prompt layer, not another schema layer, not another contract generation.

## What a pass would and would not license

A pass licenses freezing a new successor candidate under Candidate Identity v2. It does not
constitute release acceptance, and §243 continues to stand at D HOLD RELEASE. The scope of the
whole-product reacceptance that would follow is a separate product-owner decision.

## Execution preconditions

Before any call: the instrument is frozen under a digest; the request envelope identity is recorded;
the §247 contract identity is recorded; spend ceiling and call ceiling are declared; and a
contingency call may be spent only on a preregistered execution failure — a transport or HTTP
failure, or a call that never reached inference — never to replace an unfavourable semantic answer.
