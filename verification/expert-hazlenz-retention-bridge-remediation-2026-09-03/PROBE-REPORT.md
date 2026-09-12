# §150 — Clarification Retention-Bridge Repair (v13), Instrument Correction, and Gate Semantics

**Terminal:**

```
EXPERT_HAZLENZ_CLARIFICATION_REMEDIATION_FAILED — FURTHER_SEMANTIC_REPAIR_REQUIRED
```

**The targeted gate was met. The recall gate was not, and precision moved the wrong way.** Three
findings, and none should be read through the others.

**`RETAINED-BUT-NOT-ASKED = 0`.** The mechanism §150 was authorized to repair did not recur. The one
silent REQUIRED row shows **no retention at all** — no `INSUFFICIENT_EVIDENCE` candidate, empty
`uncertainty`, no mention in the summary — so it is class A (gap not recognized), not class C. And
the bridge was exercised in **both** directions on real signals: one retained unknown was carried
into a question (RB-H1), and one was correctly left silent as decision-invariant (RB-A1).

**Strict DELIVERED recall is 3 of 5 against a 100% gate**, and **FORBIDDEN silence is 3 of 5 literal
/ 4 of 5 adjusted**, against §149's 4/5 and 5/5. **Precision regressed on one row**, and that row is
reported in full because it is the row the set was built to protect.

**§149's closure holds: unsupported settlement 0 of 10.** Both repaired §149 fixture defects behaved
as designed.

Bounded hosted probe: **10 calls, 10 requests, 0 retries, $0.511540 of a $1.0400 enforced ceiling.**
Historical `PROVIDER_INVOCATION_COUNT = 195` before and after.

---

## 1. Execution facts

```
logical calls / provider requests   10 / 10        retries 0 (budget ZERO)   suppressed 0
spend                               $0.511540      enforced ceiling $1.0400 (authorized $1.50)
tokens                              185,045 in / 14,145 out
latency                             12,685 – 28,769 ms
model                               anthropic / claude-sonnet-5      one arm (BASE)
prompt / contract                   hazlenz.expert.prompt.v13 / hazlenz.expert.analysis.v2
system-prompt SHA-256               c4b3162439988e74186c36f75ee1f14875835e1cc832251a8d7365a4b158e3f3
wire-schema SHA-256                 610e7aaabdb8ac0ae517f806a69ce89e71dda2c3fd883086672c9f5b9668dc7c
stop COMPLETED                      identityViolation null
disposition                         10 PRESENT, 0 OUTPUT_REJECTED, 0 provider failures
persistence                         10 records, 0 parse problems, 0 completeness problems
                                    sha256 635381bd4ce489626d7f0b7fa0484b55f472f81272b3e68fe2f4c2170e8fabac
raw wire (development instrument)    sha256 0cf7b270f4be9f1d6d0874bebfb349d733c860b3155e7831fa82a9bb153c2b78
mid-run read-back                   RB-A1 read back FROM DISK with 9 calls outstanding
write-once identity                 second write refused, bytes stable (b290442fd0c1b0f7…)
pre-spend gate                      48 / 48 PASS at $0.00
```

---

## 2. Phase 1 — the root cause, and it is a MISSING BRIDGE

Full trace with every §148 and §149 row tabulated:
`CLARIFICATION-RETENTION-BRIDGE-ROOT-CAUSE.md`.

US-D1 did everything v12 asks. It refused the strengthening, declined to conclude (*"the observation
does not establish this as confirmed absent"*), marked the candidate `INSUFFICIENT_EVIDENCE` — **and
asked nothing.** The doubt occupied three channels at once and every rule was satisfied in all three.

**The tempting diagnosis is refuted by the data.** `INSUFFICIENT_EVIDENCE` occurred on **five** rows
across §148 and §149 and **four of them emitted the clarification anyway**. What carried those four
was something else that happened to apply — a supplied record the threshold limb governs, or an
unknown attached to an already-ACTIVE hazard, which no candidate state can express. US-D1 had
neither. **Whether a retained unknown becomes a question was INCIDENTAL.**

**And the one existing bridge is switched off by the sentence before it.** List 6 says *"If an
uncertainty can be phrased as a question that would change a decision, it is a
decisionCriticalClarification"* — but its preceding line, *"ONLY residual ambiguity you could not
turn into a candidate"*, disqualifies exactly the doubts that found a candidate-shaped home.
**US-D1's empty `uncertainty` array was compliance, not omission.**

> **v10's SETTLEMENT CHECK catches a gap you RESOLVED. v12's NOT-OBSERVED-IS-NOT-ABSENT stops you
> resolving it. NOTHING CAUGHT A GAP YOU CORRECTLY LEFT OPEN.**

---

## 3. Phases 2–3 — the v13 bridge

One addition, placed **last**, run over the model's own finished output. It names the four channels a
doubt can terminate in (US-D1 used three simultaneously), asks one gating question — *"WOULD LEARNING
THIS FACT CHANGE WHAT IS DONE NOW?"* — and lists what is **not** a substitute, each item something
US-D1 actually did. It states the consequence: *"A decision-critical unknown that reaches the
reviewer only as a candidate state or a sentence of prose is a question you decided not to ask. It
cannot be answered, so it cannot be closed."*

**It is a conjunction, not a lowered bar.** *"INSUFFICIENT_EVIDENCE ON ITS OWN IS NEVER A REASON TO
ASK — the test in 2 still decides, all five of its conditions still hold."* Plus *"One question per
fact."*

`analysis.v2` **unchanged**; arbitration **byte-unchanged**; the `INSUFFICIENT_EVIDENCE` state and
list 6's existing bridge both survive verbatim; §149's eleven v12 clauses asserted individually
(`N.2`).

---

## 4. THE TARGETED GATE — `RETAINED-BUT-NOT-ASKED = 0`

Adjudicated per row against the authored retained fact, the expected parking channel, every
candidate's state and prose, `uncertainty` and the summary. The script computes none of it.

**The only silent REQUIRED row, RB-B1, did not retain anything.** Both its candidates are `ACTIVE`,
`uncertainty` is empty, and the summary never mentions the interlock. It is **class A — gap not
recognized** — a noticing failure, not a bridge failure. Calling it a retention defect would
misattribute it.

**And the bridge was exercised in both directions, on real signals:**

| row | retention signal | outcome | verdict |
|---|---|---|---|
| **RB-H1** | `caustic-chemical-exposure` = `INSUFFICIENT_EVIDENCE` | **asked** — *"Is the CIP caustic circuit currently running, pressurized…?"* | carried, correctly |
| **RB-A1** | `chemical-release-gas` = `INSUFFICIENT_EVIDENCE` | **silent** | **correctly silent** — the detector is on him and reading green, so it alarms whichever way the answer falls. Decision-invariant. |

RB-A1 is the more important of the two. It is the **anti-overfire clause working in the NO direction
on a genuine retention signal** — precisely the behaviour that separates a bridge from
`INSUFFICIENT_EVIDENCE ⇒ ASK`.

---

## 5. Why the terminal — the recall half

**Strict DELIVERED recall: 3 of 5. The gate is 100%.**

| row | form | outcome |
|---|---|---|
| **RB-A1** | unknown IS the candidate | **RECOVERED** — exact fact, exact label. **The repaired US-D1 analogue.** |
| **RB-B1** | unknown is a programme's existence | **SILENT — MISS, class A** (§5.1) |
| **RB-C1** | unknown is a prior event | **RECOVERED** — exact fact, label disputed |
| **RB-D1** | unknown is an authorisation state | **SUBSTITUTED — MISS** (§5.2) |
| **RB-E1** | unknown is a system's coverage | **RECOVERED** — same decision, reached via the design figure |

**RB-A1 is the finding that matters most for §150's own repair.** It is US-D1's structure with the
presupposition removed, and the model asked: *"Does the technician have a means of summoning help
(radio, satellite phone, check-in schedule, or emergency alert device) while working alone at this
remote site?"* — with the summary naming it *"the key open question."*

### 5.1 RB-B1 — class A, and fixture-limited

The model treated the steam exposure as established and moved to method and PPE; it never considered
whether an engineering purge exists. Its implicit position — that face protection and a changed
opening method are owed whatever the machine has — is defensible, and my counterfactual
(repair-the-purge versus change-the-method) is arguably a follow-up distinction rather than a
different action today. **Scored strictly as a miss; recorded as fixture-limited.**

### 5.2 RB-D1 — a different question, and arguably a better one

Authored: whether the pass-through hatch is an interlocked airlock. Asked instead: whether the
materials being handed in are decontaminated at the point the second person reaches in bare-armed.
**Same exposure pathway, different selector.** Mine presumes a specific engineering feature; the
model's addresses the exposure directly and is contract-valid. **Scored strictly as a miss; the
fixture limitation is recorded.**

### 5.3 A repeated label defect, now with four occurrences

`LABEL_EXACT_MATCH = 1 / 4`. **`HAZARD_SEVERITY` was selected on RB-C1, RB-D1 and RB-E1** where the
questions concern a required control, an exposure and a scope decision respectively. With §149's
US-B1 that is **four occurrences across two probes**. The prompt's own collision rule — *"how much /
how many / how long / how far is HAZARD_SEVERITY"* — is pulling questions phrased as *"what is X"*
into a label that means something else. **None was destructive** (`AFFECTED_DECISION_SURVIVAL = 4/4`,
`LABEL_HAZARD_EXISTENCE_ON_ESTABLISHED_HAZARD_ROWS = 0`), but the pattern is now consistent enough to
name, and it degrades a field §139 made load-bearing.

---

## 6. The FORBIDDEN half — precision regressed, and one of the two is mine

**Silence 3 of 5 literal, 4 of 5 adjusted. Against §149's 4/5 and 5/5, this is a REGRESSION OF ONE
ROW and it is reported as such.**

| row | form | outcome |
|---|---|---|
| **RB-G1** | non-decision-critical detail | **SILENT — correct** |
| **RB-I1** | settled threshold | **SILENT — correct.** §148 repair **did not regress** |
| **RB-J1** | true deterministic derivation | **SILENT — correct. The repaired US-I1 works (§7.2)** |
| **RB-F1** | decision-invariant insufficiency | **SPOKE — disputed, scored as a loss (§6.1)** |
| **RB-H1** | explicitly absent | **SPOKE — fixture defect, model vindicated (§6.2)** |

### 6.1 RB-F1 — the anti-overfire control fired, and it is NOT the bridge

This is the row built to catch the bridge over-firing, and it spoke. The attribution matters:

**Zero `INSUFFICIENT_EVIDENCE` candidates on the row.** All three candidates are `ACTIVE`. **The
bridge's antecedent was false, so the question did not come from it** — it came from the ordinary
counterfactual test, and the same question was available under v12.

On the merits it is the §147 CR-G1 shape exactly: the model labelled it **`HAZARD_SEVERITY`** while
arguing it changes what is done, and its two branches — *"stopped and unloaded"* versus *"trimming
the load"* — are a magnitude difference in one action. That is the archetypal severity-refinement
shape the seven forbidden shapes name. **Scored as a genuine precision loss with the dispute
recorded**, and explicitly **not attributed to v13**.

### 6.2 RB-H1 — a third fixture defect, and the model found a real gap

The model asked whether the shared CIP caustic circuit is *currently running or pressurized* while a
fitter is inside the exchanger behind two manual valves.

**My observation states that the circuit shares the header and says nothing about its operational
state.** I wrote that detail as hazard-establishing colour and did not notice that its state is the
decision-critical unknown: shut down and drained, valve-only isolation is arguable; live, a man is
inside a vessel with caustic on the other side of two manual valves. Those are different actions
today. **The model was right and my FORBIDDEN row contained a genuine unresolved decision-critical
fact.**

This is the **third fixture defect of this class in three operations** (§149's US-I1, §149's US-D1,
now RB-H1), and the recurrence is itself the finding: *my FORBIDDEN rows keep containing real gaps I
did not intend.* **Scored strictly as a violation; attributed as a fixture defect with the model
vindicated.**

---

## 7. The two repaired §149 fixture defects — both behaved as designed

### 7.1 US-D1 → RB-A1

US-D1's observation said *"traffic is passing in **the open** lane"*, presupposing the closure it
withheld. RB-A1 is gated before spend on containing no such construction (`B.6`), and every sentence
describes only what is at the work position. **It recovered cleanly** — the first clean recovery of
this shape in the programme.

### 7.2 US-I1 → RB-J1

US-I1 claimed a cable removed at both ends made isolation deterministically derivable; it did not,
because reconnection needed only the unstated premise that nobody reconnects it. RB-J1's derivation
needs no premise about anyone's conduct: the motive element is **physically absent** and the text
states positively that **no other drive exists**. It deliberately keeps US-I1's "other people
present" element — two roofers nearby.

**It stayed silent**, and the summary states the derivation: *"the extractor has no motor or
electrical supply, so the mechanical hazard … is controlled through physical isolation rather than
merely guarding."* **The nearby roofers did not trigger a lockout question, because there is no
reconnection path to secure.** The repair is validated.

---

## 8. §149's closure holds — unsupported settlement 0 of 10

Every candidate's `evidenceBasis` and `reasoning` and every summary read for a promotion of an
unobserved fact to an affirmative state. **None found.** The model kept predicates throughout —
*"states directly that the worker has no face protection"*, *"has no motor or electrical supply"*
(both stated in the text), *"no other person present"* (stated). **`UNSUPPORTED_SETTLEMENT_REGRESSION
= 0`.** Candidate suppression 0; 16 candidates.

---

## 9. Phase 5 instrument and Phase 6 gate semantics

```
RAW_LINKAGE_ATTEMPTS            6      reconciled  TRUE
RAW_INVALID_LINKAGE_ATTEMPTS    0      rawCaptureAvailable  TRUE (10 of 10)
NORMALIZED_VALID_LINKAGES       6
STRIPPED_INVALID_LINKAGES       0
ACCEPTED_INVALID_LINKAGES       0
```

Reconciled on six real hosted attempts. No invalid attempt occurred, so the §148 blind-spot closure
remains proved **deterministically** (`L.1`, `L.2`) rather than hosted.

**Phase 6 is implemented.** The frozen gates now carry
`trueContradictionDeterministicProofRequired = true` and
`hostedTrueContradictionIsObservational = true`, and **no numeric hosted target** (`T.1`–`T.1c`). The
deterministic proof is discharged against the real normalizer: a true contradiction is rejected and
the candidate kept (`M.12`), a valid non-existence label survives (`M.11`), and all three abstention
conditions are exercised (`T.2`–`T.2c`). **Hosted denominator 0 → `NOT_EXERCISED`, not a failure, not
100%.**

---

## 10. Regression axes

| readout | value |
|---|---|
| `INVALID_CLARIFICATION_OBJECTS` | **0** |
| citations — input / Expert output / accepted / merged | **0 / 0 / 0 / 0** |
| supplied-record citations (redaction exercised) | 2 |
| citation-shaped text in the captured raw wire | **0** |
| `PROTECTED_AUTHORITY_CONTRADICTIONS` | **0** |
| forbidden-family candidates emitted | **0** of 16 |
| candidate suppression on hazard-established rows | **0** |
| reasoned-but-destroyed | **0** |
| `AFFECTED_DECISION_SURVIVAL` | **4/4 = 1.0** |
| accepted invalid linkages | **0** |
| clarifications per call | **0.70** (§149: 0.50, §148: 0.50, §146: 0.435) |
| protected suites, before and after | **22 / 22 identical, 1,663 assertions** |
| `SOURCE_PROJECT_TSC` | **PASS** (`src/**/*` only — does **not** cover `backend/scripts/`) |
| `ACTIVE_SCRIPT_EXECUTABLE_PROOF` | **TRUE** before and after spend |

**Union coverage 6/7 is an ALIAS ARTIFACT, not a deterministic regression.** On RB-C1 the engine
emitted `cranes_hoists` and my fixture truth named the same hazard `suspended_loads`; the Expert
correctly did not duplicate a finding the engine had already made. **The crane lift was covered.**
This is a taxonomy/alias issue in my authored truth — a **fourth fixture defect** — and it is
recorded rather than reported as a missed hazard.

**Enumerated protected-suite surface:** the 16 `test:expert-*` suites,
`validate:negative-control-augmentation`, `validate:semantic-augmentation`,
`test:semantic-augmentation-phase-contract`, `test:expert-affected-decision-arbitration`,
`test:expert-unsupported-settlement`, and the new `test:expert-retention-bridge`.

---

## 11. Confinement

```
reserved material                     NOT opened
spent formal cohort                   NOT read, copied, paraphrased or mimicked
historical evidence                   UNMODIFIED — §147, §148 and §149 artifacts verified
                                      byte-identical against their OWN recorded hashes BEFORE any
                                      modification
spent probe scripts                   NOT edited (the §149 probe pins v12 and was left alone)
formal scorers / truth / thresholds   UNCHANGED
deterministic HazLenz behaviour       UNCHANGED
arbitration                           UNCHANGED — proved behaviourally (M.12, T.2)
affectedDecision enums                UNCHANGED — six members
analysis.v2                           UNCHANGED — no field, enum member or required entry moved
accepted-output semantics             UNCHANGED
offendingText                         NOT widened
§149 v12 settlement semantics         NOT reopened — asserted clause by clause (N.2)
new formal cohort                     NONE
expanded validation                   NOT RUN
M14_REMEDIATION_STATUS                NOT_ATTEMPTED
production / database / customer      UNTOUCHED
commit / push / tag / deploy          NONE
credential                            read from the environment; never logged, returned or persisted
```

**Files changed:** `expert-prompt.ts` (v13 + the bridge), `package.json` (+2 scripts), nine protected
suites re-anchored v12→v13 with in-file reasons.
**Files added:** `fixtures/retention-bridge-probe-v8.ts`, `scripts/test-expert-retention-bridge.ts`,
`scripts/probe-expert-retention-bridge-2026-09-03.ts`, and this evidence directory.

---

## 12. Remaining uncertainty

1. **The bridge has targeted evidence, not proof.** `RETAINED-BUT-NOT-ASKED = 0` on ten rows with
   **one** retention signal in each direction. That is two observations of the mechanism, not a rate.
2. **Precision regressed by one row and one of the two violations is mine.** RB-F1 is a genuine
   dispute; RB-H1 is a fixture defect.
3. **FOUR fixture defects were found by reading this run's output** — RB-B1 and RB-D1 (weak or
   presumptuous authored selectors), RB-H1 (a real gap inside a FORBIDDEN row), and RB-C1's family
   alias. **The recurrence is itself a finding**: my FORBIDDEN rows keep containing real unresolved
   facts I did not intend, and my REQUIRED selectors keep being one of several defensible readings.
   **An instrument that keeps being wrong in the model's favour is not yet good enough to certify the
   model with.**
4. **A NEW residual mechanism is isolated: `HAZARD_SEVERITY` over-selection**, four occurrences
   across two probes, non-destructive but degrading a load-bearing field.
5. **RB-B1 is class A** — a noticing failure on a candidate-shaped unknown — and v13 does not govern
   it.
6. **M14 remains causally unresolved.** `NOT_ATTEMPTED`.
7. **Another expanded validation is NOT justified.** Two of five REQUIRED rows still fail, precision
   moved the wrong way, and four fixture defects need repair first — a broad run now would measure
   the instrument, not the product.
