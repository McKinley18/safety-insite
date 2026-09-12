# §221 — INTEGRATED EXPERT PIPELINE VALIDATION: EXECUTION AND DERIVATION

**Provider calls 13 of 22 · Spend USD 0.8898 of 1.78 · Database operations 0 · Retries 0 ·
No remediation of the instrument · No commit · No push · No tag · No deploy.**

Frozen digest `82487b704e7601476481bbbe803d1b3299742478404e8df65f0149330302e1f6`, verified before
transmission and unchanged after. Ten cases, twelve families, twelve hard gates, sixty-two
product-owner judgment slots.

**HARD-GATE OUTCOMES ARE NOT COMPUTED IN THIS REPORT.** Adjudication comes first, gate computation
last. Nothing below states or implies which verdict would make a gate pass.

---

## 1. THE COMPATIBILITY CANARY PASSED

The §210J first-pass wire schema had never been transmitted hosted, and the freeze recorded the risk
before execution rather than discovering it after:

| | |
|---|---|
| §210J schema as sent | **19,127 bytes** |
| size at which §199 was refused on grammar complexity | 19,060 bytes |
| call 1 (IG1 first pass) | **HTTP 200, reached inference** |

The successor first-pass schema transports. That question is answered and is classified separately
from semantic behaviour.

---

## 2. WHAT THE PIPELINE ACTUALLY PRODUCED

| case | first pass | declarations field | facts in ledger | verifier calls | settlement exercise |
|---|---|---|---|---|---|
| IG1 ordinary hazard | NO_FAILURE | array, **empty** | 0 | 0 | none frozen |
| IG2 two independent gaps | **OUTPUT_TRUNCATED** | **absent** | 0 | 0 | **NOT_EXERCISED** |
| IG3 KR-1 evidence proxy | NO_FAILURE, **45 output tokens** | **absent** | 0 | 0 | **NOT_EXERCISED** |
| IG4 legitimate required act | NO_FAILURE | array, 1 | 1 | 1 | **REACHED** |
| IG5 legitimate required artifact | NO_FAILURE | array, 1 | 1 | 1 | **REACHED** |
| IG6 insufficient evidence | NO_FAILURE | array, 1 | 1 | 1 | none frozen |
| IG7 adjacent property | NO_FAILURE | **string, not array** | 0 | 0 | none frozen |
| IG8 governed grounding | NO_FAILURE | array, **empty** | 0 | 0 | none frozen |
| IG9 negated / actually safe | NO_FAILURE | array, **empty** | 0 | 0 | none frozen |
| IG10 RR-7 | NO_FAILURE | array, 1 | 1 | 0, elided by design | none frozen |

**Four of ten cases carried a decision-critical fact into the owed-fact ledger.** One more, IG9,
correctly carried none. The remaining five produced output that was empty, truncated, or not the
shape the contract requires.

### The five defective first-pass results, stated exactly

- **IG1 and IG8** returned a well-formed but **empty** `unresolvedFactDeclarations` array and zero
  clarifications, while identifying the hazard correctly in prose. IG1's explanation names the
  unmeasured ladder rise as *"a low-confidence severity-relevant gap"* and declares no fact for it.
- **IG2** hit `max_tokens` at 4,000 output tokens with the declarations field absent entirely.
- **IG3** returned **45 output tokens**: `expertHazardCandidates` as a bare string and every other
  field null.
- **IG7** returned `unresolvedFactDeclarations` as a **JSON string** rather than an array.

IG3 is the case that matters most for the programme's open question. **The KR-1 evidence-proxy
instrument never reached the verifier, the property-authority boundary or any settlement path.** The
§220 containment claim is therefore **NOT_EXERCISED** end to end by this run, which is not a pass and
is not a failure of that containment.

---

## 3. WHERE THE PIPELINE RAN END TO END, IT BEHAVED AS DESIGNED

**IG4, the satisfactory settlement.** Property authority was born `REQUIRED_NOT_OBTAINED`, the
reviewer confirmed the property, the evidence was approved as a separate recorded decision, and the
fact moved to `SETTLED_BY_EVIDENCE` on exactly one ledger transition.

**IG5, the keep-unresolved path.** The reviewer declined to confirm. The state was recorded as
`DECLINED_KEEP_UNRESOLVED`, the evidence authority still minted, and the settlement was **refused**
with `PROPERTY_AUTHORITY_NOT_OBTAINED`. The fact stayed `UNRESOLVED` with zero transitions.

**IG10, the RR-7 exercise.** The provider identified a decision-critical property — whether the plant
room ventilation fan is running on its run-on timer. The frozen harness replaced one required branch
decision with the filler in a **copy**; the raw provider record on disk is untouched. The projection
refused it with `NON_SEMANTIC_PLACEHOLDER_VALUE`, created no owed fact, and preserved the identified
property in a `STRUCTURALLY_INVALID_DECLARATION` record. Nothing was invented.

**The review packet.** On both cases that reached it, every field the §221 rule requires was present:
observation span, proposed property, HazLenz explanation, both branches and both decisions, the
unresolved action, the existing clarification, the verifier's advisory controlling property, and the
three controls.

**Exercises not reached.** The **adverse settlement** (family 12) and the
**refused-for-missing-authority** and **CORRECT_PROPERTY** exercises were all `NOT_EXERCISED`,
because IG2 and IG3 produced no admitted owed fact for them to act on.

---

## 4. AN EXECUTOR DEFECT, RECORDED RATHER THAN HIDDEN

The first invocation **crashed after call 10**. IG7 returned `unresolvedFactDeclarations` as a JSON
string, and my executor assumed an array.

That is a **harness defect, not an instrument defect**, and it is mine. What was done about it:

- A fail-closed guard was added **to the executor only**: a declarations field that is not an array
  is recorded as a structural provider defect and the verifier leg is elided. The malformed field is
  **never parsed or repaired**.
- A `--resume` path was added on the §210H pattern: every leg already in the ledger is refused, so
  no call already drawn can be drawn twice.
- **No pinned artifact was touched.** The instrument, the assembly path, both §218 modules, the
  §210J contract and projection, the property-authority module and the settlement-review module all
  still hash to the values recorded in the freeze, verified after execution.
- No prompt, schema, deterministic rule, review state, frozen truth, case or model changed.

The resumed invocation drew calls 11 to 13 and skipped the ten already drawn. IG7's verifier leg was
elided because the pipeline cannot project a string, which is the correct fail-closed outcome and is
recorded as a **contained provider defect**.

---

## 5. SPEND

| leg | calls | cost |
|---|---|---|
| first pass | 10 | 0.7628 |
| verifier | 3 | 0.1270 |
| **total** | **13** | **0.8898** |

Ceiling 1.78, projected 1.3127. Nine calls of the authorized twenty-two were not spent, because
seven verifier legs had no admitted declaration to review and two were elided by the frozen design.
No frozen coverage was cut to save money; the calls were unavailable, not withheld.

---

## 6. ADJUDICATION PACKET — 62 SLOTS, ALL EMPTY

`ADJUDICATION-PACKET-221.json` carries every slot with `verdict: null` and `attribution: null`.

| | |
|---|---|
| slots emitted | 62 |
| slots prefilled by automation | **0** |
| gate outcomes computed | **false** |

Permitted verdicts are `PASS`, `FAIL`, `AMBIGUOUS`, `NOT_EXERCISED`. Per the frozen rule, an
`AMBIGUOUS` verdict on a hard-gate judgment means that gate cannot pass from that judgment, and
ambiguity may not be resolved after the fact to obtain a terminal. Many slots will be answered
`NOT_EXERCISED` on this evidence; `NOT_EXERCISED` is never `PASS`.

Each slot names its case, its axis, the gate it feeds, and exactly what to read. No slot carries an
expected answer, a hint, or any statement about which verdict would make a gate pass.

---

## 7. LOCAL VERIFICATION

Run after evidence persistence, with no production code changed to obtain green status.

| | |
|---|---|
| protected suites | **20** |
| assertions | **1,600** |
| failures | **0** |
| §220 §219 replay | 32 / 32 |

Includes RR-7 and declaration preservation (§205 92/92, §210E 103/103), first-pass projection and
§210J settlement (99/99), §214 sibling containment (68/68), §218 structured verifier (113/113), §220
property-authority boundary (43/43), the §221 preregistration suite (53/53), and the human
settlement and review state machines (§182-derived suites, 328 assertions across three files).

Experiment-scope typecheck `tsconfig.scripts-221.json`: clean.

**Historical evidence unchanged.** Every `.sha256` across the §213, §215, §217, §218, §219 and §220
evidence directories verifies with `shasum -c`. Zero failures. No historical result is reclassified.

---

## 8. WHAT IS AND IS NOT ESTABLISHED

**Established.** The successor first-pass schema transports. The complete path — observation, first
pass, projection, ledger, verifier, deterministic containment, property authority, human review,
authorized settlement — runs end to end and produces the designed authoritative outcomes on the
cases that reached it. The §220 boundary permitted a satisfactory settlement on one recorded human
confirmation and refused one where the reviewer declined. RR-7 preserved an identified property
through a refusal without inventing anything.

**Not established.** Whether the system contains a live KR-1 property mistake, because IG3 never
produced one to contain. Whether an adverse settlement moves exactly one fact, because IG2 produced
no fact. Whether the governed-grounding boundary holds under a real declaration, because IG8
declared none. Whether two independent gaps survive together, for the same reason.

**Observed and awaiting adjudication.** Five of ten first-pass results were empty, truncated or
malformed. On IG1 and IG8 the hazard was identified in prose while no decision-critical fact was
declared. What that means for the customer-authoritative outcome, and for the gates, is a
product-owner judgment and is not made here.

---

**TERMINAL:
`EXPERT_HAZLENZ_INTEGRATED_PIPELINE_VALIDATION_AWAITING_PRODUCT_OWNER_ADJUDICATION`**

**KR-1 = OPEN — HUMAN-GATED V1.0 LIMITATION**

The frozen protocol is complete through evidence persistence, deterministic derivation, the frozen
exercises and regression. The sixty-two adjudication slots are the remaining step before hard-gate
computation and a §221 terminal.
