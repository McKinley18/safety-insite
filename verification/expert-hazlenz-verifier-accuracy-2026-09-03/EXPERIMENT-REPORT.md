# §156 — Selective Clarification Verifier Hosted Accuracy Experiment

**TERMINAL:**

    EXPERT_HAZLENZ_SELECTIVE_VERIFIER_FAILED —
    DECISION_CRITICAL_RECALL_REMEDIATION_REQUIRED        (CASE C)

15 verifier calls, 0 retries, 0 reruns, **$0.182082** of a $2.00 ceiling. Zero first-pass Expert
invocations. No production file changed.

---

## 1. The headline, stated plainly

The verifier **preserves legitimate silence perfectly** — 7 of 7, with zero manufactured questions
and zero abstentions — and **fails on the one case the whole architecture was built to reach**.
HS-H1 was triggered in two draws. In neither did the verifier reach the load-side cooling-hold fact:
one returned `NO_CLARIFICATION_REQUIRED`, and the other proposed a question about the
over-temperature alarm, which is the same distractor the first pass anchored on in §152.

Both halves of the Phase 12 gate must hold. Specificity holds. Decision-critical recall does not.

---

## 2. Instrument identity, frozen before spend

| | |
|---|---|
| blinded packet | `VERIFIER-PACKET.json`, 0444, sha256 `75d64197583092ed8ac826a1c3c85d86666fd36d7eca52737d1d6eec942afc5a` |
| truth manifest | `TRUTH-MANIFEST.json`, 0444 write-once, sha256 `dbbe3361a3c407af6a06446024c8de6f78d8d15540a349702b9c1eac4855617c` |
| verifier instruction | `hazlenz.expert.verifier-instruction.v1`, sha256 `88540968a366ebfd55a67652…` |
| verifier contract | `hazlenz.expert.verifier.v1` (§155, unchanged) |
| trigger | `hazlenz.expert.selective-verification-trigger.v1` (§155, unchanged; its output frozen as data) |
| provider / model | anthropic / claude-sonnet-5 |

**Blinding.** Each case carries only the observation, the governed evidence supplied with it, the
deterministic result, the stored first-pass output, and the unresolved facts the trigger named. Row
ids became `VC-01`…`VC-15` in a fixed interleaved order. Removed: row ids, REQUIRED/FORBIDDEN, the
fixture `form` names, the authored `missingFact` and `acceptableSelectors`, draw labels, section
references, and every prior score or adjudication. Nine forbidden patterns are asserted absent at
build time and again at the pre-spend gate. The case→row key is written separately and is never sent
to the provider.

The packet was rebuilt once before any spend, because the first build's metadata line contained a
section reference; the hash was re-pinned. Nothing had been observed at that point.

**Truth.** Derived from the frozen hardened v9 authored truth (digest `434c127c…a7fe194`, reviewed in
§151), not from fresh opinion. In all fifteen cases the first pass emitted no clarification, so
authored-REQUIRED + silence → `ADD_OR_REPLACE_CLARIFICATION`, and authored-FORBIDDEN + silence →
`NO_CLARIFICATION_REQUIRED` (with `VERIFIED_AS_IS` accepted as behaviourally equivalent).

> **THE LIMITATION THAT TRAVELS WITH EVERY FIGURE BELOW.** The manifest is authored by the same model
> family that was graded. Errors may be correlated: a case I misjudge is one the verifier may misjudge
> identically, and the experiment would score that agreement as accuracy. Deriving from frozen,
> human-reviewed authored truth limits this. It does not eliminate it.

**Four cases excluded from the primary denominator before spend**, under the authorization's own
provision for cases that cannot be adjudicated confidently. In each, the model retained *the absence
of a named control* that the authored FORBIDDEN rationale never considered — ignition-source and
bonding/grounding controls in a spray booth (three draws), and a pressure-limiting device on a tyre
inflation airline (one draw). Concluding those change nothing would have required substantive safety
judgements the authored truth does not make and the observation text does not establish. They were
executed and are reported; they are not scored.

---

## 3. Execution

    15 logical calls · 15 provider requests · 0 retries · 0 reruns
    55,211 input tokens / 7,166 output tokens
    $0.182082 of $2.00
    pre-spend gate 22/22 PASS at $0.00
    counter invariants clean · FIRST_PASS_EXPERT_INVOCATIONS = 0

---

## 4. Primary metrics — 11 cases, 10 execution-valid

| metric | result |
|---|---|
| `VERIFIER_EXACT_VERDICT_ACCURACY` | **8/10 (80.0%)** |
| `VERIFIER_SEMANTIC_ACCURACY` | **9/10 (90.0%)** |
| abstain rate | 0/10 |

**Decision-critical side (3 execution-valid cases)**

| metric | result |
|---|---|
| recall — `ADD_OR_REPLACE_CLARIFICATION` returned | **2/3 (66.7%)** |
| correct selector rate | 2/3 |
| wrong selector rate | 0/3 |
| correct `affectedDecision` | 2/3 |
| **false `NO_CLARIFICATION_REQUIRED`** | **1/3 (33.3%)** |
| false `VERIFIED_AS_IS` | 0/3 |
| abstain | 0/3 |

**Legitimate-silence side (7 cases)**

| metric | result |
|---|---|
| `FORBIDDEN_VERIFIER_SPECIFICITY` | **7/7 (100.0%)** |
| false `ADD_OR_REPLACE` — a question manufactured | **0/7 (0.0%)** |
| false-positive question rate | 0/7 |
| abstain | 0/7 |

**Confusion matrix** (primary, execution-valid; rows = truth, columns = returned)

| truth ↓ / returned → | VERIFIED_AS_IS | ADD_OR_REPLACE | NO_CLAR_REQUIRED | ABSTAIN |
|---|---|---|---|---|
| ADD_OR_REPLACE_CLARIFICATION | 0 | **2** | 1 | 0 |
| NO_CLARIFICATION_REQUIRED | 1 | **0** | 6 | 0 |

The zero in the bottom-middle cell is the most valuable number here: across seven cases where the
right answer was to stay quiet, the verifier manufactured no question at all.

---

## 5. Known-miss recovery, verbatim

**VC-08 — recovered.** Owed: whether the burner has a functioning flame-failure device.

> "Has the flame-failure (flame-safeguard) device on the burner been functionally tested or verified
> operational recently…, and is there a way to confirm its status without visual access behind the
> shroud?" — `REQUIRED_CONTROL`

Reaches the owed fact. Correct decision label. A genuine repair of a first-pass miss.

**VC-04 — recovered.** Owed: whether the guard interlock was function-tested after the overnight
rotor tooth change. Note that this case supplied the verifier with *no unresolved facts at all* — the
first pass returned an entirely empty analysis — and it still found the fact:

> "Was the debarker's rotor guard interlock functionally tested (not just visually confirmed closed)
> after this morning's reassembly following the overnight rotor tooth change, before the sawyer
> resumed work at the infeed deck?" — `REQUIRED_CONTROL`

**VC-13 — NOT recovered. `NO_CLARIFICATION_REQUIRED`.** Owed: the cooling hold.

> "The gauge-verification fact is unresolved, but the technician is already opening the door standing
> to the hinge side with heat-resistant gloves… Neither fact, answered either way, changes what is
> being done right now… **The first pass correctly declined to ask a clarifying question.**"

The verifier judged the relevance of the *distractor the trigger handed it*, agreed with the first
pass's own relevance denial, and never considered the load-side thermal state.

**VC-02 — NOT recovered, and boundary-rejected.** The verifier did detect that something was
unaddressed, reasoned well about the alarm being "a control that could not be seen functioning" —
and then proposed a question about **the over-temperature alarm**, the same distractor §152's first
pass asked about, labelled `HAZARD_SEVERITY` rather than `REQUIRED_CONTROL`. It also named
`candidate:cand-thermal-residual`, which is not among the unresolved facts it was supplied, so the
§155 boundary refused the verdict whole.

> **AN ARCHITECTURAL TENSION WORTH NAMING.** The `UNRESOLVED_FACT_REF_NOT_SUPPLIED` rule exists to
> stop a verifier going looking for facts nobody gave it. On this case, going looking is exactly what
> was needed — the supplied facts were the wrong ones. The narrow contract that keeps the verifier
> contained also keeps it inside the first pass's own framing, which is the framing that was wrong.

**HS-H1: 0 of 2 triggered draws repaired.** The row is not architecturally solved, and the reason is
the same in both draws — the verifier inherits the first pass's anchoring rather than correcting it.
That is a systematic pattern, not two unrelated errors, and it is why this terminal is CASE C.

---

## 6. The eleven FORBIDDEN escalations

Seven are in the primary denominator: all seven preserved silence. Four were excluded pre-spend and
are reported without being scored — three returned `NO_CLARIFICATION_REQUIRED` or `VERIFIED_AS_IS`,
and one (VC-11) proposed:

> "Is the coating being sprayed solvent-based (flammable) or water-based, and if solvent-based, are
> the booth, gun, and workpiece bonded/grounded and are ignition sources excluded from the booth?"

That is a substantive question, and whether it is warranted is precisely what could not be
adjudicated before spend. It is recorded, unscored, and left for a later adjudication.

No repeated false-positive semantic pattern appears anywhere: the verifier produced no question on
any case where the authored truth says silence was right.

---

## 7. Blind-spot accounting

Five LOOSE REQUIRED misses exist in the stored development set of 44 valid executions.

    TRIGGER_REACHABLE_MISS_COUNT     4
    TRIGGER_UNREACHABLE_MISS_COUNT   1   (a settled silence: the fact was resolved, not retained,
                                          so nothing was retained to trigger on)

Also preserved from §155, and unchanged: the **fluent wrong-fact blind spot** — §152's HS-H1 asked a
well-formed question about the wrong fact and was scored a LOOSE success, so it never enters the miss
set and never reaches a verifier at all.

**STORED-DEVELOPMENT END-TO-END DIAGNOSTIC** = trigger capture × verifier repair = **2 of 5 = 40%**
of the stored miss set repaired end to end. This is a diagnostic over sixteen rows and three draws.
**It is not a production accuracy estimate.**

---

## 8. Observed cost and latency — §155's assumption was wrong by a factor of three

| | §155 assumed | §156 measured |
|---|---|---|
| verifier input tokens | ~18,893 | **3,681** |
| verifier output tokens | 300 | **478** |
| cost per verifier call | $0.04079 | **$0.01214** |
| share of a first-pass call | 81% | **24.2%** |
| latency | unmeasured | **6,110 ms** mean (first pass: 15,700 ms median) |

The assumption failed because the first-pass call carries the entire v13 system prompt — the verifier
does not. At the §155 development trigger frequency of 15/44, selective verification projects to
**34.1 extra calls and $0.41 per 100 analyses — +8.3%**, not the +27.8% §155 estimated.

**The economics are therefore not the obstacle.** Selective verification is cheap, and it is fast.
What it is not, yet, is accurate on the case that matters.

*15/44 trigger frequency and 4/48 degenerate frequency remain development observations from sixteen
rows, three draws, one model, one prompt version. They are not production rates.*

---

## 9. Containment

Zero degenerate verifier outputs. One boundary rejection (VC-02), which is the contract working. No
verdict carried a candidate, a citation, a deterministic finding, an insight or a disagreement — the
forbidden-field check fired on nothing. The experiment imports nothing from `src/`, implements no
production provider interface, and invoked no first-pass Expert analysis. v13, analysis.v2,
arbitration, the v9 fixture, detector v2, the §155 trigger and every §152–§155 artifact are
byte-unchanged.

The trigger was **not** modified after seeing hosted results, and cannot have been: its output for
these fifteen cases is frozen as literal data in the packet builder, which the pre-spend gate
asserts.

---

## 10. Why CASE C and not another terminal

**CASE A** requires material recovery of the triggered known misses *and* no systematic unsafe
false-negative pattern. Recovery is 2 of 3, and the failure is not random: on both HS-H1 draws the
verifier adopted the first pass's framing, once by agreeing with its relevance denial and once by
re-asking its distractor. That is a systematic unsafe false-negative pattern on decision-critical
material.

**CASE B** (good recall, poor specificity) is refuted: specificity is 7/7 with zero manufactured
questions.

**CASE D** (both weak) is refuted for the same reason.

**CASE E** requires provider degeneracy preventing interpretation: zero degenerate verifier outputs.

**CASE C** — good specificity, poor decision-critical recall — describes the measurement exactly.

---

## 11. What the next operation has to solve

The verifier is contained, cheap, fast, and does not over-question. Its failure is specific and
named: **it reasons about the unresolved facts it is handed, and when those facts are the first
pass's own distractor, it inherits the first pass's error.** Two candidate directions follow from the
evidence, and neither is authorized or implemented here:

1. **Widen what the verifier may consider without widening what it may change.** VC-02 shows the
   verifier trying to reach past the supplied facts and being refused by its own boundary. Allowing
   it to nominate a fact the trigger did not supply — while keeping its authority to clarification
   disposition only — targets the failure directly. It also weakens the containment argument, and
   that trade needs deciding, not assuming.
2. **Ask the verifier the question the fixture asks.** The authored truth's test is two-branched:
   answer the unknown both ways and see whether the *action* differs. The instruction states that
   test, and on VC-13 the verifier applied it to the wrong fact rather than searching for the fact to
   which it applies.

The degenerate-output policy proven in §155 is unaffected by any of this and remains independently
authorizable.
