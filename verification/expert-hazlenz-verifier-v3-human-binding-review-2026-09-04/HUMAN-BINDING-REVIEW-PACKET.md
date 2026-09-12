# Verifier-v3 — 12-pair human binding review packet

**FOR HUMAN ADJUDICATION. Prepared §168, 2026-09-04. Zero provider calls.**

Twelve clarification/owed-fact pairs produced by verifier protocol v3. For each pair the
question to answer is whether the clarification **actually asks for the owed fact it
declared it covers**. A declaration is not a proof, and no automated check in this
repository can settle it.

**This packet assigns no disposition.** Record answers in
`BINDING-ADJUDICATION-FORM.json`, whose every verdict field is `null`.

<!-- NEUTRALITY-DISCLOSURE-START -->
## What is deliberately absent

No historical v2 outcome, no pass/fail label, no scorer result, no expected adjudication,
no per-draw success/failure status, and no model self-assessment. The verifier's own
`rationale` is **excluded**: it is the model arguing for its own answer, and reading a
persuasive defence before judging the thing it defends is not review. It is preserved
verbatim in `../expert-hazlenz-verifier-v3-scoped-falsification-2026-09-04/RUN-RECORDS.jsonl`
and may be consulted **after** a disposition is recorded.

The `COMPOUND SHAPE` line is a structural flag on punctuation and conjunctions only. It
marks where to look and decides nothing.
<!-- NEUTRALITY-DISCLOSURE-END -->

---

## Observation VC-08

> A grain dryer is running on the farm drying floor. The burner unit sits at the far end of the plenum behind a steel shroud, and from the walkway the flame-failure device and its wiring are behind that shroud and cannot be seen. Grain dust has settled on the horizontal surfaces of the walkway and on the motor housings. An operative is clearing a blockage at the discharge auger with the dryer running.

### Owed fact supplied to the verifier

```
factKey:            owed:hs-a1:flame_failure_safeguard_functional_status
affectedDecision:   REQUIRED_CONTROL
whyUnresolved:      the observation states the safeguard cannot be seen from the walkway and states nothing about its functional status
evidenceSpan:       the flame-failure device and its wiring are behind that shroud and cannot be seen
branchA:            the safeguard is functional
  decision if A:    drying continues under the existing controls
branchB:            the safeguard is bypassed, failed or otherwise nonfunctional
  decision if B:    the burner is shut down and the safeguard restored before drying continues
```

---

### PAIR VC-08-1

**bindingFactKey:** `owed:hs-a1:flame_failure_safeguard_functional_status`

**Proposed clarification, verbatim:**

> Can the flame-failure device and its wiring be visually or functionally verified as operating correctly (e.g., via inspection panel, test signal, or maintenance log), or is its status currently unknown?

**affectedDecision:** `REQUIRED_CONTROL`

**owedFactDeclarations:**

- `owed:hs-a1:flame_failure_safeguard_functional_status` → `BOUND_BY_CLARIFICATION`

**Additive nomination present.** Its proof, verbatim:

```
missingFact:           Whether the discharge auger and its drive can be de-energized/locked out (or is otherwise required to be) while the operative clears the blockage, or whether clearing live is the only available method
observationSpan:       An operative is clearing a blockage at the discharge auger with the dryer running.
notEstablishedBecause: The text states the auger is being cleared while running but does not state whether isolation/lockout equipment exists or was bypassed, nor whether procedure requires shutdown for this task.
affectedDecision:      REQUIRED_CONTROL
branchA:               No lockout/isolation capability exists or is required for this clearing method, and running-clearance is an accepted procedure
  decision if A:       Work may continue as observed provided other guarding is in place
branchB:               Lockout/isolation is available and required but was not used
  decision if B:       Work must stop immediately, the auger de-energized and locked out, before clearing resumes
whyNecessaryNow:       The operative is currently exposed to an active entanglement hazard while the machine runs; this is an immediate life-safety concern that determines whether the observed work practice must be halted right now, not at a later review.
```

**Resulting state**

| | |
|---|---|
| owed fact status after | `COVERED` |
| coverage transitions | `flame_failure_safeguard_functional_status` UNRESOLVED → COVERED via ADMITTED_BINDING |
| ledger facts before → after | 1 → 2 |
| uncovered fact keys | `nominated:VC-08-1` |
| TARGET_COVERAGE_WARNING | `true` |
| customer-visible question strings | 1 |
| COMPOUND SHAPE (structural flag only) | not flagged |

---

### PAIR VC-08-2

**bindingFactKey:** `owed:hs-a1:flame_failure_safeguard_functional_status`

**Proposed clarification, verbatim:**

> Is the flame-failure device confirmed to be functional (e.g., via a recent test, remote indicator, or maintenance log), and separately, has the discharge auger's drive been locked out or de-energized for the operative currently clearing the blockage, or is the auger flighting still powered/live during that clearing operation?

**affectedDecision:** `REQUIRED_CONTROL`

**owedFactDeclarations:**

- `owed:hs-a1:flame_failure_safeguard_functional_status` → `BOUND_BY_CLARIFICATION`

**Additive nomination present.** Its proof, verbatim:

```
missingFact:           Whether the discharge auger drive has been locked out/de-energized specifically for the operative currently clearing the blockage, or whether the auger flighting remains live/powered during that clearing task.
observationSpan:       An operative is clearing a blockage at the discharge auger with the dryer running.
notEstablishedBecause: The span states the dryer is running while clearing occurs but does not state whether the auger drive specifically has been isolated (locked out) as a distinct control from the dryer's overall operation, so it is consistent with either an isolated auger or a live, powered auger during the clearing task.
affectedDecision:      REQUIRED_CONTROL
branchA:               The auger drive has been locked out/de-energized for the clearing task
  decision if A:       The clearing task may continue as a controlled maintenance activity under existing lockout practice
branchB:               The auger flighting remains live/powered while the operative clears the blockage
  decision if B:       The clearing task must stop immediately and the auger must be locked out before the operative resumes clearing the blockage
whyNecessaryNow:       The operative is actively exposed to the auger at this moment; if the auger is live, an immediate caught-in injury risk exists that requires the work to stop now, not at a later review.
```

**Resulting state**

| | |
|---|---|
| owed fact status after | `COVERED` |
| coverage transitions | `flame_failure_safeguard_functional_status` UNRESOLVED → COVERED via ADMITTED_BINDING |
| ledger facts before → after | 1 → 2 |
| uncovered fact keys | `nominated:VC-08-2` |
| TARGET_COVERAGE_WARNING | `true` |
| customer-visible question strings | 1 |
| COMPOUND SHAPE (structural flag only) | **flagged** — "and separately,"; parenthetical followed by ", and"; multiple disjunctions |

---

### PAIR VC-08-3

**bindingFactKey:** `owed:hs-a1:flame_failure_safeguard_functional_status`

**Proposed clarification, verbatim:**

> Is the flame-failure device confirmed to be functional (e.g., through a recent test or verification log), and separately, has the discharge auger drive been locked out/de-energized before the operative began clearing the blockage?

**affectedDecision:** `REQUIRED_CONTROL`

**owedFactDeclarations:**

- `owed:hs-a1:flame_failure_safeguard_functional_status` → `BOUND_BY_CLARIFICATION`

**Additive nomination present.** Its proof, verbatim:

```
missingFact:           Whether the discharge auger drive was locked out/de-energized before the operative began clearing the blockage
observationSpan:       An operative is clearing a blockage at the discharge auger with the dryer running.
notEstablishedBecause: The span states the dryer is running while the operative clears the blockage but does not state whether the auger drive specifically was isolated/de-energized (locked out) for this task, which is consistent with either proper lockout of that component or with it remaining live.
affectedDecision:      REQUIRED_CONTROL
branchA:               The auger drive was locked out/de-energized before clearing began
  decision if A:       Clearing continues as a properly controlled maintenance task under existing procedures
branchB:               The auger drive remains energized/live during clearing
  decision if B:       Work must stop immediately and the auger must be de-energized and locked out before clearing resumes
whyNecessaryNow:       The operative is actively engaged in the clearing task at this moment per the observation, so the entanglement exposure is live and requires immediate resolution rather than deferral to a later review
```

**Resulting state**

| | |
|---|---|
| owed fact status after | `COVERED` |
| coverage transitions | `flame_failure_safeguard_functional_status` UNRESOLVED → COVERED via ADMITTED_BINDING |
| ledger facts before → after | 1 → 2 |
| uncovered fact keys | `nominated:VC-08-3` |
| TARGET_COVERAGE_WARNING | `true` |
| customer-visible question strings | 1 |
| COMPOUND SHAPE (structural flag only) | **flagged** — "and separately,"; parenthetical followed by ", and" |

---

### PAIR VC-08-4

**bindingFactKey:** `owed:hs-a1:flame_failure_safeguard_functional_status`

**Proposed clarification, verbatim:**

> Is the flame-failure device confirmed to be functional (e.g., via a recent test, maintenance log, or control-panel status indicator), or is its operability unverified since it cannot be visually inspected from the walkway?

**affectedDecision:** `REQUIRED_CONTROL`

**owedFactDeclarations:**

- `owed:hs-a1:flame_failure_safeguard_functional_status` → `BOUND_BY_CLARIFICATION`

**Additive nomination present.** Its proof, verbatim:

```
missingFact:           Whether the discharge auger's drive/energy source was locked out, de-energized, or otherwise isolated before the operative began clearing the blockage, or whether the auger remains energized and capable of unexpected motion during the clearing operation.
observationSpan:       An operative is clearing a blockage at the discharge auger with the dryer running.
notEstablishedBecause: The span states only that the dryer is running while the blockage is cleared; it does not state whether the auger drive specifically was isolated, locked out, or otherwise rendered safe for manual clearing, nor whether the operative is using tools that keep hands clear of the flighting.
affectedDecision:      REQUIRED_CONTROL
branchA:               The auger drive was locked out/isolated (or the specific auger segment is de-energized) before manual clearing began
  decision if A:       The clearing operation may continue as a controlled maintenance task under the existing lockout/isolation procedure
branchB:               The auger drive remains energized and capable of engaging during the manual clearing operation
  decision if B:       Work must stop immediately and the auger must be locked out/de-energized before any further manual clearing, due to imminent entanglement/caught-in hazard
whyNecessaryNow:       The operative is presently exposed to the auger while it is described as running; whether energy isolation has occurred determines whether this is an immediate life-safety stop-work situation or an already-controlled task, and this cannot wait for a later review given the ongoing exposure.
```

**Resulting state**

| | |
|---|---|
| owed fact status after | `COVERED` |
| coverage transitions | `flame_failure_safeguard_functional_status` UNRESOLVED → COVERED via ADMITTED_BINDING |
| ledger facts before → after | 1 → 2 |
| uncovered fact keys | `nominated:VC-08-4` |
| TARGET_COVERAGE_WARNING | `true` |
| customer-visible question strings | 1 |
| COMPOUND SHAPE (structural flag only) | **flagged** — multiple disjunctions |

---

### PAIR VC-08-5

**bindingFactKey:** `owed:hs-a1:flame_failure_safeguard_functional_status`

**Proposed clarification, verbatim:**

> Has the flame-failure device's functional status been verified (e.g., via inspection, test log, or maintenance record) since it cannot be visually confirmed from the walkway due to the shroud?

**affectedDecision:** `REQUIRED_CONTROL`

**owedFactDeclarations:**

- `owed:hs-a1:flame_failure_safeguard_functional_status` → `BOUND_BY_CLARIFICATION`

**Additive nomination present.** Its proof, verbatim:

```
missingFact:           Whether the discharge auger's drive was locked out/de-energized before the operative began clearing the blockage
observationSpan:       An operative is clearing a blockage at the discharge auger with the dryer running.
notEstablishedBecause: The text states the dryer is running and the operative is clearing the blockage but does not state whether the auger drive itself was isolated, locked out, or otherwise de-energized prior to the clearing operation.
affectedDecision:      REQUIRED_CONTROL
branchA:               The auger drive was isolated/locked out before clearing began (dryer runs but auger drive is de-energized)
  decision if A:       Work continues as a controlled maintenance activity under existing lockout procedure
branchB:               The auger drive remains energized and capable of unexpected motion during clearing
  decision if B:       Work must stop immediately and the auger must be locked out/de-energized before any further clearing, per machine-guarding/LOTO requirements
whyNecessaryNow:       An operative is currently exposed to entanglement hazard; if the auger is energized during this clearing task, that is an active, ongoing life-safety violation requiring immediate intervention rather than a matter for later review.
```

**Resulting state**

| | |
|---|---|
| owed fact status after | `COVERED` |
| coverage transitions | `flame_failure_safeguard_functional_status` UNRESOLVED → COVERED via ADMITTED_BINDING |
| ledger facts before → after | 1 → 2 |
| uncovered fact keys | `nominated:VC-08-5` |
| TARGET_COVERAGE_WARNING | `true` |
| customer-visible question strings | 1 |
| COMPOUND SHAPE (structural flag only) | not flagged |

---

### PAIR VC-08-6

**bindingFactKey:** `owed:hs-a1:flame_failure_safeguard_functional_status`

**Proposed clarification, verbatim:**

> Can facility personnel confirm, by physical inspection or functional test (not visual sighting from the walkway), whether the flame-failure device on the burner is currently functional and properly wired, since it cannot be seen from the walkway due to the shroud?

**affectedDecision:** `REQUIRED_CONTROL`

**owedFactDeclarations:**

- `owed:hs-a1:flame_failure_safeguard_functional_status` → `BOUND_BY_CLARIFICATION`

**Additive nomination:** none emitted.

**Resulting state**

| | |
|---|---|
| owed fact status after | `COVERED` |
| coverage transitions | `flame_failure_safeguard_functional_status` UNRESOLVED → COVERED via ADMITTED_BINDING |
| ledger facts before → after | 1 → 1 |
| uncovered fact keys | none |
| TARGET_COVERAGE_WARNING | `false` |
| customer-visible question strings | 1 |
| COMPOUND SHAPE (structural flag only) | not flagged |

---

## Observation VC-04

> A sawmill debarker is running and a sawyer is standing at the infeed deck rolling logs onto the chain. The machine's guard door over the rotor is closed and its interlock switch is in place. The machine was returned to service this morning after a rotor tooth change carried out overnight by the maintenance fitter, who has gone off shift. The sawyer is working from the deck and is not reaching into the throat.

### Owed fact supplied to the verifier

```
factKey:            owed:hs-e1:rotor_guard_interlock_function_verified
affectedDecision:   REQUIRED_CONTROL
whyUnresolved:      the observation states the machine was returned to service and states nothing about whether the guard interlock protective function was verified after reassembly
evidenceSpan:       The machine was returned to service this morning after a rotor tooth change carried out overnight by the maintenance fitter, who has gone off shift.
branchA:            the interlock protective function was verified before return to service
  decision if A:    the debarker continues to run as observed
branchB:            the interlock protective function was not verified before return to service
  decision if B:    the protective function is verified before the debarker continues to run
```

---

### PAIR VC-04-1

**bindingFactKey:** `owed:hs-e1:rotor_guard_interlock_function_verified`

**Proposed clarification, verbatim:**

> Was the rotor guard interlock's protective function (not just its physical closure) tested and confirmed to actually stop/prevent rotor operation when the guard is opened, following this morning's return to service after the overnight rotor tooth change?

**affectedDecision:** `REQUIRED_CONTROL`

**owedFactDeclarations:**

- `owed:hs-e1:rotor_guard_interlock_function_verified` → `BOUND_BY_CLARIFICATION`

**Additive nomination:** none emitted.

**Resulting state**

| | |
|---|---|
| owed fact status after | `COVERED` |
| coverage transitions | `rotor_guard_interlock_function_verified` UNRESOLVED → COVERED via ADMITTED_BINDING |
| ledger facts before → after | 1 → 1 |
| uncovered fact keys | none |
| TARGET_COVERAGE_WARNING | `false` |
| customer-visible question strings | 1 |
| COMPOUND SHAPE (structural flag only) | not flagged |

---

### PAIR VC-04-2

**bindingFactKey:** `owed:hs-e1:rotor_guard_interlock_function_verified`

**Proposed clarification, verbatim:**

> Was the rotor guard interlock's protective function (i.e., that opening/actuating the guard door actually stops or de-energizes the rotor) functionally tested and verified after the overnight rotor tooth change and before the debarker was returned to service this morning, or was only the physical closure/positioning of the guard and switch confirmed?

**affectedDecision:** `REQUIRED_CONTROL`

**owedFactDeclarations:**

- `owed:hs-e1:rotor_guard_interlock_function_verified` → `BOUND_BY_CLARIFICATION`

**Additive nomination:** none emitted.

**Resulting state**

| | |
|---|---|
| owed fact status after | `COVERED` |
| coverage transitions | `rotor_guard_interlock_function_verified` UNRESOLVED → COVERED via ADMITTED_BINDING |
| ledger facts before → after | 1 → 1 |
| uncovered fact keys | none |
| TARGET_COVERAGE_WARNING | `false` |
| customer-visible question strings | 1 |
| COMPOUND SHAPE (structural flag only) | **flagged** — multiple disjunctions |

---

### PAIR VC-04-3

**bindingFactKey:** `owed:hs-e1:rotor_guard_interlock_function_verified`

**Proposed clarification, verbatim:**

> Was the rotor guard interlock's protective function (i.e., that opening the guard actually stops or prevents rotor operation) tested and confirmed after the overnight rotor tooth change and before the debarker was returned to service this morning?

**affectedDecision:** `REQUIRED_CONTROL`

**owedFactDeclarations:**

- `owed:hs-e1:rotor_guard_interlock_function_verified` → `BOUND_BY_CLARIFICATION`

**Additive nomination:** none emitted.

**Resulting state**

| | |
|---|---|
| owed fact status after | `COVERED` |
| coverage transitions | `rotor_guard_interlock_function_verified` UNRESOLVED → COVERED via ADMITTED_BINDING |
| ledger facts before → after | 1 → 1 |
| uncovered fact keys | none |
| TARGET_COVERAGE_WARNING | `false` |
| customer-visible question strings | 1 |
| COMPOUND SHAPE (structural flag only) | not flagged |

---

### PAIR VC-04-4

**bindingFactKey:** `owed:hs-e1:rotor_guard_interlock_function_verified`

**Proposed clarification, verbatim:**

> Was the guard-door interlock's protective function (i.e., that the rotor stops/de-energizes when the guard is opened) functionally tested after the overnight rotor tooth change and before the debarker was returned to service this morning?

**affectedDecision:** `REQUIRED_CONTROL`

**owedFactDeclarations:**

- `owed:hs-e1:rotor_guard_interlock_function_verified` → `BOUND_BY_CLARIFICATION`

**Additive nomination:** none emitted.

**Resulting state**

| | |
|---|---|
| owed fact status after | `COVERED` |
| coverage transitions | `rotor_guard_interlock_function_verified` UNRESOLVED → COVERED via ADMITTED_BINDING |
| ledger facts before → after | 1 → 1 |
| uncovered fact keys | none |
| TARGET_COVERAGE_WARNING | `false` |
| customer-visible question strings | 1 |
| COMPOUND SHAPE (structural flag only) | not flagged |

---

### PAIR VC-04-5

**bindingFactKey:** `owed:hs-e1:rotor_guard_interlock_function_verified`

**Proposed clarification, verbatim:**

> Was the rotor guard interlock's protective function (i.e., that opening/disturbing the guard actually stops or de-energizes the rotor) functionally tested and verified after the overnight rotor tooth change and before the debarker was returned to service this morning?

**affectedDecision:** `REQUIRED_CONTROL`

**owedFactDeclarations:**

- `owed:hs-e1:rotor_guard_interlock_function_verified` → `BOUND_BY_CLARIFICATION`

**Additive nomination:** none emitted.

**Resulting state**

| | |
|---|---|
| owed fact status after | `COVERED` |
| coverage transitions | `rotor_guard_interlock_function_verified` UNRESOLVED → COVERED via ADMITTED_BINDING |
| ledger facts before → after | 1 → 1 |
| uncovered fact keys | none |
| TARGET_COVERAGE_WARNING | `false` |
| customer-visible question strings | 1 |
| COMPOUND SHAPE (structural flag only) | not flagged |

---

### PAIR VC-04-6

**bindingFactKey:** `owed:hs-e1:rotor_guard_interlock_function_verified`

**Proposed clarification, verbatim:**

> Was the rotor guard interlock's protective function (i.e., that it actually cuts power/stops the rotor when the guard is opened) tested and verified before the debarker was returned to service this morning, following the overnight rotor tooth change?

**affectedDecision:** `REQUIRED_CONTROL`

**owedFactDeclarations:**

- `owed:hs-e1:rotor_guard_interlock_function_verified` → `BOUND_BY_CLARIFICATION`

**Additive nomination:** none emitted.

**Resulting state**

| | |
|---|---|
| owed fact status after | `COVERED` |
| coverage transitions | `rotor_guard_interlock_function_verified` UNRESOLVED → COVERED via ADMITTED_BINDING |
| ledger facts before → after | 1 → 1 |
| uncovered fact keys | none |
| TARGET_COVERAGE_WARNING | `false` |
| customer-visible question strings | 1 |
| COMPOUND SHAPE (structural flag only) | not flagged |

---

## The six questions to answer for each pair

| | question |
|---|---|
| A | Does the clarification actually ask for the supplied owed fact? |
| B | Would an answer to the clarification resolve that owed fact? |
| C | Is the `affectedDecision` appropriate? |
| D | Does the clarification introduce an unsupported assumption? |
| E | Does the question materially distort or narrow the owed fact? |
| F | If compound, can each factual component be answered independently? |

## Allowed dispositions, one per pair

```
BINDING_SEMANTICALLY_CORRECT
BINDING_PARTIALLY_CORRECT
BINDING_INCORRECT
BINDING_AMBIGUOUS
```

Keyword or lexical similarity may not decide any of these, and the evaluated model may not
adjudicate itself.

Reviewer: ______________________  Date: ____________
