# §255 — Capability Boundary and Product Consequence: Final Report

Zero provider calls. Zero database operations. No remediation. No production code changed. No commit,
no push, no tag, no deploy.

## Terminal

    EXPERT_HAZLENZ_DRIVER_ROLE_CAPABILITY_BOUNDARY_ACCEPTED —
    WHOLE_PRODUCT_BETA_READINESS_REVIEW_AUTHORIZATION_REQUIRED

## What §255 did

Recorded the accepted capability boundary and produced the whole-product blocker inventory. Nothing
was built, tuned, rescored or repaired. No new role taxonomy, justification field, validator,
verifier, prompt patch, schema patch, micro-probe or seventh case exists. The six frozen cases were
not redrawn and not rescored.

## The boundary

    BOUNDED EXPERT CAPABILITY LIMIT —
    AUTONOMOUS DRIVER-ROLE ASSIGNMENT NOT ACCEPTED FOR v1.0

Role-presence coherence was 2/6 admission-aware and 4/6 on raw output, against a frozen floor of 5/6.
Both are below the floor.

Expert HazLenz may still produce the underlying analysis. The continuation-controlling versus
follow-up distinction is human-confirmed wherever it materially decides whether work stops, holds,
continues with controls, or continues while a follow-up remains open. The confirmation stays narrow:
HazLenz presents its conclusion and the relevant facts, and the user confirms or changes the
operational classification. Until confirmed, an uncertain classification never becomes authoritative
settlement, and silence is never read as confirmation.

**§255 authorizes the boundary, not the implementation.**

The H6 architectural finding is recorded in full: a model-generated structured justification for a
driver role does not establish that the role it justifies is correct. On H6 the justification was
present, fluent, and wrong. That closes the door on answering this with more explanation.

This is a capability failure and not an unsafe product escape — every miss was over-restrictive, and
excessive restriction is still a real product defect because it stops permitted work and erodes trust.

## The inventory

**8 blockers, 10 risks, 3 polish items, 6 accepted limitations**, in
`SECTION-255-BETA-READINESS-BLOCKERS.md` with the machine-readable form alongside. Two entries are
marked UNVERIFIED rather than guessed: production object-storage provisioning and live billing
configuration are not established either way by the repository.

The three findings that most change the picture, all newly measured in this section:

**Expert has no production caller.** `runExpertHazLenzAnalysis` is invoked by scripts only; no
controller, route or service reaches it. Everything proved across §246 to §254 is currently
unreachable by a user.

**Delivered-analysis yield is 3 of 6, and only one refusal is a driver-role defect.** H3 and H4 fail
on self-consistency and exact self-reference, both independent of the §255 boundary. Human role
confirmation does not raise the yield; yield needs its own answer.

**Expert costs 43,713 input tokens and USD 0.1123 per analysis with no prompt caching configured and
no per-tenant spend cap.** Input tokens dominate, and this is a configuration question rather than a
capability one.

Deployment posture is also worth flagging before any beta plan: deployed `45251d38a4e8` is two
commits behind local HEAD, the worktree carries 812 uncommitted entries, and `autoDeploy` on `main`
means a commit is a production deploy while migrations are applied out of band.

## Preserved from §254

Six provider calls, USD 0.673574, 262,277 input and 14,902 output tokens, `claude-sonnet-5`. Zero
transport failures, zero conformance violations, zero semantic inventions, zero unsafe escaped
outputs, zero settlement attempts. Candidate identity frozen across the run, all six observation
payloads byte-identical, §252 and §253 evidence still valid, and the `dischargingControlRef`
contradiction not materially encountered.

H2 is preserved as field evidence that the §253 alongside-control repair operates as intended.

## The next decision

The driver-role research loop is finished. The next step is a whole-product Expert beta-readiness
review against the inventory above, which requires your authorization. I have not started one, and
no further semantic experiment is proposed.

## Evidence

    SECTION-255-CAPABILITY-BOUNDARY.md
    SECTION-255-BETA-READINESS-BLOCKERS.md
    SECTION-255-BLOCKER-INVENTORY.json

STOP.
