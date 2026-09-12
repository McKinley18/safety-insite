# §187A — First-pass stimulus review

**Written after the five first-pass calls and BEFORE any verifier spend**, because a MATERIAL
confound stops a row rather than being explained afterwards.

Five calls, all `providerOk = true`, all normalized `VALID`, no contract failure. Cost $0.26255.

## What the five first-pass executions produced

| row | candidates | clarifications | uncertainty | the question asked |
|---|---|---|---|---|
| HR-01 | 0 | 1 | 0 | "Was the flame-failure device / burner flame-tested during Monday's service, even though it is not recorded on the certificate?" |
| **HR-04** | 0 | **0** | 0 | **— none asked —** |
| HR-06 | 0 | 1 | 0 | "Was the rotor guard interlock switch functionally tested (not just visually confirmed in place) after the tooth change and before this restart?" |
| HR-08 | 0 | 1 | 0 | "Has the auger drive's own local isolator been locked out (or otherwise verified de-energized) separately from the main dryer panel lockout?" |
| HR-09 | 0 | 1 | 0 | "Has the accumulator pressure been confirmed at zero (or a safe residual level) by reading the gauge, rather than merely cycling the dump valve without checking the result?" |

`hazardCandidates` is 0 and `summary` is empty on **all five** rows. Being uniform, that is not a
differential confound between rows; it is recorded because it means the verifier receives a thin
first-pass block on every row.

## `FIRST_PASS_STIMULUS_CONFOUND = MINOR`

**Rationale.** There is one real asymmetry: HR-04's verifier executions will read
`FIRST-PASS ANALYSIS — CLARIFICATIONS ASKED / (none asked)`, while the other four read a clarification
that is on-target for their owed fact. The verifier's task on HR-04 is therefore *raise what was
missed*; on the other four it is *verify what was already asked*. Those are not the same task.

It is classified MINOR rather than MATERIAL for three reasons:

1. **It is a genuine product of the real path**, not an artifact of construction. The authorization
   required the stimulus be provider-generated; this is what the first pass actually did on the
   frozen observation. Replacing or repairing it would be authoring the stimulus.
2. **The owed-fact treatment is uniform.** Every one of the fifteen verifier executions receives
   exactly one product-owner-reviewed unresolved owed fact, byte-identical across replicates. The
   asymmetry is in the first-pass block, not in the structured input under test.
3. **The design already isolates HR-04.** Per-row floors are evaluated per row, and HR-04 carries its
   own A/B/C/D classification and its own gate. Nothing about HR-04 depends on being comparable to
   the other four.

**The condition attached to it:** HR-04's result must never be reported without stating that its
first pass asked nothing, and the pooled 12/15 figure must always be shown beside the per-row
breakdown. It must not be silently averaged away.

## A second caveat, recorded now rather than discovered later

The four non-HR-04 first-pass questions each already name the owed property fairly precisely — the
flame test, the interlock *function* rather than its presence, the auger's *own* isolator, the gauge
*reading* rather than the valve cycling. The verifier on those rows is therefore largely being asked
to preserve an already-competent question.

That makes preservation **easier** than it would be against a weak or displaced first pass, and it
means a high preservation score on HR-01/HR-06/HR-08/HR-09 is weaker evidence about the verifier
than the same score would be against a poor stimulus. This is a limit on what the result can claim,
and it is stated before the results exist so it cannot be read as a post-hoc excuse.

## Independent note on HR-04

HR-04's first pass emitted zero clarifications. §179 recorded HR-04 emitting zero clarifications on
all three of its first-pass replicates. This is a fresh single sample that is consistent with that
prior observation.

That is an **observed result only**. No causal claim is made, this is one execution rather than a
replicated design, and §179 is historical first-pass evidence that is not a contemporaneous control
for anything here.

## Decision

Proceed to the fifteen verifier executions. No row is stopped.
