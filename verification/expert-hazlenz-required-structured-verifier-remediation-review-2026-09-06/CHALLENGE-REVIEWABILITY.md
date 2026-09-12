# §188 — Challenge reviewability

**n = 1.** One challenge-bearing execution across fifteen: `HR-04` replicate 3, challenging
`owed:guarding:fixed_guard_fastenings_currently_secure`.

---

## The two figures, kept apart

```
CHALLENGE_REVIEWABILITY_OBSERVED        = PENDING_HUMAN_ADJUDICATION / 1
PREREGISTERED_THRESHOLD_EVALUATION      = NOT_MEANINGFULLY_ESTIMABLE
```

**Why the first is pending.** `CHALLENGE_REVIEWABILITY` is one of the ten strict semantic axes the
frozen preregistration assigns to human judgement. The numerator is not known and this model does
not supply it. The `x` in `x / 1` stays `x`.

**Why the second is `NOT_MEANINGFULLY_ESTIMABLE`, whatever `x` turns out to be.** The frozen gate is:

> `>= 80% reviewable, <= 20% representation failures; NOT_EXERCISED if no challenge-bearing
> executions occur`

`NOT_EXERCISED` does not apply — a challenge did occur. But on a single observation the literal
arithmetic can only return `0%` or `100%`. Both clear or fail an 80% threshold trivially, and
neither estimates a population proportion. One opportunity is not evidence that free-text challenge
representation is adequate, and it is not evidence that it is inadequate either.

**The gate is not changed retroactively.** It stands exactly as preregistered, and it will be
computed literally once the verdict is supplied — `score-188-strict-semantic-gate-2026-09-06.ts`
emits the literal percentage alongside the caveat rather than instead of it. What is refused is the
separate step of *reporting one observation as a rate*, which the preregistration never authorized
and which would be a claim about population behaviour that this cohort cannot support.

Do not write "100% reviewable" or "0% representation failures" anywhere. Write `x / 1`.

---

## The material, so the reviewer needs nothing else

**Execution:** `HR-04` replicate 3, sequence position 14, block 3.
**Verdict:** `NO_CLARIFICATION_REQUIRED` · **corrected contract admission:** ADMITTED.
**Fact challenged:** `owed:guarding:fixed_guard_fastenings_currently_secure` — whether the fixed
guard over the head drum nip point is currently secured sufficiently for safe operation.

**Challenge reason, verbatim:**

> The observation states the guard is in position and no tools rest on it; this is a direct, visible
> confirmation the guard is performing its function. The fastenings' torque-check timing is a
> routine maintenance record detail, not an indicator of current insecurity. Answering the
> current-securement question either way would not change today's action absent any observed anomaly
> (gap, looseness, displacement) -- the routine pre-start check and observed guard-in-position
> already form the basis on which the conveyor is operated today. This is a magnitude/interval-type
> concern rather than a decision-changing binary fact.

**The reviewability question, as the frozen packet states it:**

> Can a reviewer determine the asserted evidence-to-fact relationship without reconstructing a
> missing material premise? Disagreeing with the conclusion does not make the reason unreviewable; a
> representation failure is when the reviewer must infer what property the cited evidence supposedly
> establishes.

**REVIEWABLE / REPRESENTATION_FAILURE:** `______`

Three further axes attach to this same execution and are separate questions:
`CHALLENGE_CORRECTNESS`, `CHALLENGE_EVIDENCE_RELEVANCE`, `CHALLENGE_TARGET_RELEVANCE`. A challenge
can be perfectly reviewable and wrong; that combination is the useful one, because it is the one a
human can act on.

---

## What the single challenge does not establish

- Not that challenge is being used as a substitute for clarification — one in fifteen.
- Not that challenge representation is adequate, nor that it is inadequate.
- Not anything about challenge *frequency*: the frozen instruction says in terms "There is no
  expected number of bindings and no expected number of challenges either."
- Not a settlement. `CHALLENGE_FACT_VALIDITY` bridges to an `ArbitrationRequest` typed
  `settles: false` / `factStatusUnchanged: true`. The fact stayed `UNRESOLVED` and its coverage
  warning stayed live. That is mechanical, and it is a PASS.

If the reviewability instrument is to be exercised at a useful `n`, it needs a cohort designed to
elicit challenges. That is a separate design question and is **not** authorized here.
