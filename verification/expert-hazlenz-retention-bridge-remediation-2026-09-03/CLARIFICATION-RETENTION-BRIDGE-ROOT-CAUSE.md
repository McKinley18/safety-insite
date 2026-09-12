# §150 — Clarification Retention-Bridge Root-Cause Trace (US-D1)

**Status: ROOT CAUSE ESTABLISHED. Attribution: PROMPT SEMANTICS — a MISSING BRIDGE, not a wrong rule.**

Reconstructed from `verification/expert-hazlenz-unsupported-settlement-remediation-2026-09-03/`
(`RUN-RECORDS.jsonl` `bcc985ca…`, `RAW-WIRE.jsonl` `67303d30…`) and
`verification/expert-hazlenz-threshold-arbitration-remediation-2026-09-03/` (`RAW-WIRE.jsonl`
`017857d1…`), all verified byte-identical to their recorded hashes before this trace began. Zero
provider calls. $0.00.

---

## 1. The six-stage trace of US-D1

| stage | finding |
|---|---|
| **1. Was a fact missing?** | **YES** — whether advance warning and a taper were already set out upstream of the point the operative had reached. |
| **2. Was it decision-changing?** | **YES** — inside a signed closure the finding is his orientation and vehicle position; outside one, the work stops. |
| **3. Did Expert recognize the uncertainty?** | **YES, explicitly and correctly.** |
| **4. Where was it represented?** | **THREE channels, none of them the clarification list.** |
| **5. Was a clarification generated?** | **NO.** Zero on the wire. |
| **6. What allowed it?** | **Nothing forbade it. See §3.** |
| **7. Did a downstream layer remove it?** | **NO.** `RAW-WIRE.jsonl` shows zero clarifications *emitted*; normalization, arbitration and linkage removed nothing. |

**Stage 3 is the finding that changes the diagnosis.** The model did not settle the fact, and it said
so in terms:

> *"…is noted as a possible, lower-confidence procedural gap given the high-risk nature of solo
> lane-closure work, **though the observation does not establish this as confirmed absent**."*

**Stage 4 — the three channels the doubt actually occupied:**

1. **Candidate state.** `cand-single-op-no-signaler` = **`INSUFFICIENT_EVIDENCE`**.
2. **Candidate reasoning.** *"Evidence is limited to the absence of any mention of a second person,
   so this is raised with lower confidence as a possible procedural gap rather than a confirmed
   one."*
3. **`expertExplanation.summary`**, quoted above.

And `uncertainty.statements` was **empty**. That emptiness is the hinge, and §3 explains why it was
*contract-compliant*.

**This is class C, and only class C:**

| class | shape | US-D1 |
|---|---|---|
| A | gap not recognized | **no** — stage 3 |
| B | gap recognized, settled by unsupported inference | **no** — §149 measured 0/10, and this row explicitly refused the strengthening |
| **C** | **gap recognized and retained, no question emitted** | **YES** |
| D | question emitted, destroyed downstream | **no** — stage 7 |

---

## 2. The comparison set

Every row of §148 and §149, by candidate state and clarification emission. Nothing is sampled.

| row | § | expectation | clarifications emitted | `INSUFFICIENT_EVIDENCE` candidates |
|---|---|---|---|---|
| TR-A1 | 148 | REQUIRED | 2 | 1 |
| TR-C1 | 148 | REQUIRED | 1 | 1 |
| TR-D1 | 148 | REQUIRED | 1 | 1 |
| TR-C2 | 148 | REQUIRED | 1 | 0 |
| **TR-E1** | 148 | REQUIRED | **0** | **0** |
| US-A1 | 149 | REQUIRED | 1 | 0 |
| **US-B1** | 149 | REQUIRED | **1** | **1** |
| US-C1 | 149 | REQUIRED | 1 | 0 |
| **US-D1** | 149 | REQUIRED | **0** | **1** |
| US-E1 | 149 | REQUIRED | 1 | 0 |
| TR-B1/B2/B3/B4, TR-F1 | 148 | FORBIDDEN | 0 | **0** |
| US-F1/G1/H1/I1/J1 | 149 | FORBIDDEN | 0 (US-I1: 1) | **0** |

**Two measured facts fall out, and they point in opposite directions.**

**(a) `INSUFFICIENT_EVIDENCE` is a highly specific signal in this data.** It appears on **five rows,
every one of them REQUIRED**, and on **zero of the ten FORBIDDEN rows**. Where the model reaches for
that state, a question has so far always been owed.

**(b) And it does NOT terminate the doubt — sometimes.** Four of those five rows *did* emit a
clarification. **So the failure is not "the candidate state swallows the question."** If it were,
TR-A1, TR-C1, TR-D1 and US-B1 would all have failed too.

That rules out the tempting explanation and forces the real one.

### 2.1 Why the four succeeded — and none of them succeeded because a rule required it

Read against the shipped contract, each of the four was pushed into the clarification list by
**something else that happened to apply**:

- **US-B1** and **TR-C1** — a **supplied governed record** whose stated condition could not be
  evaluated. v11's threshold limb governs this directly (*"an aggregate the record itself says to
  combine"*), and it names the clarification list as the destination.
- **TR-D1** and **TR-A1** — the unknown concerned a **control or a rescue arrangement attached to a
  hazard the model had already asserted ACTIVE**. There is no candidate state that can hold *"the
  hazard is live and I do not know whether the control was applied"*, so the clarification list was
  the only expressible channel.
- **US-A1, US-C1, US-E1** (no `INSUFFICIENT_EVIDENCE` at all) — same structure: the hazard was
  established and only the control or scope was open.

**US-D1 has neither driver.** No governed record, no threshold, and the unknown *is itself* a
candidate-shaped proposition — *does a supervision/traffic-management gap exist?* — so the model had
a legal, contract-blessed place to put it. It put it there, and the matter was disposed of.

> **Whether a retained unknown becomes a question is currently INCIDENTAL.** It happens when some
> other rule independently names the clarification list. Nothing in the contract makes it
> obligatory.

---

## 3. The established root cause — the contract has no bridge, and actively routes away from the one it has

Four mechanisms in v12 move something into `decisionCriticalClarifications`. Each is checked against
US-D1:

| mechanism | antecedent | reaches US-D1? |
|---|---|---|
| **THE COUNTERFACTUAL TEST** | you have identified a missing fact and are deciding whether to ask | **NO.** By the time the model reached list 2, the fact had been dispatched into list 1 as a candidate. It was no longer an open item awaiting a decision. |
| **THE NO-LOSS RULE** — *"if something you identified meets the criteria for one of the typed lists, it MUST appear in that list"* | a thing is at risk of surviving **only in free text** | **NO.** Its stated purpose is *"Free text supplements the structure; it never replaces it."* Here the thing DID reach a typed list — the wrong one. The rule guards against loss to prose, not against a doubt being disposed of by a candidate state. |
| **THE SETTLEMENT CHECK** — *"find every place you **asserted, assumed or concluded** a condition"* | the model **over-committed** | **NO.** US-D1 did the opposite: it explicitly declined to conclude. The antecedent is false. |
| **LIST 6, UNCERTAINTY** — *"If an uncertainty can be phrased as a question that would change a decision, it is a decisionCriticalClarification, not an uncertainty"* | the doubt landed in `uncertainty.statements` | **NO — and this is the sharp edge.** See below. |

### 3.1 The one existing bridge is switched off by the sentence immediately before it

List 6 reads, in full:

> **6. UNCERTAINTY -> uncertainty.statements**
> **ONLY residual ambiguity you could not turn into a candidate, a question or an insight.**
> It is not an overflow channel. If an uncertainty can be phrased as a question that would change a
> decision, it is a decisionCriticalClarification, not an uncertainty.

The second sentence is a real bridge — *uncertainty → clarification* — and it is the only one in the
contract. **The first sentence disqualifies US-D1 from ever reaching it.** The model *could* turn the
doubt into a candidate, so by the contract's own instruction the doubt does not belong in
`uncertainty`. It went to list 1 instead, `uncertainty.statements` came back empty, and the bridge
never applied.

**The empty `uncertainty` array on US-D1 is not an omission. It is compliance.**

> ### THE ESTABLISHED ROOT CAUSE
>
> **v10's SETTLEMENT CHECK catches a gap you RESOLVED. v12's NOT-OBSERVED-IS-NOT-ABSENT stops you
> resolving it. NOTHING CATCHES A GAP YOU CORRECTLY LEFT OPEN.**
>
> A decision-critical unknown may terminate in `assertedConditionState`, in `reasoning`, or in the
> summary, and every rule in the contract is satisfied. There is no path from *a doubt correctly
> retained* to `decisionCriticalClarifications`, and the single existing bridge — from `uncertainty`
> — is closed to exactly the doubts that found a candidate-shaped home.

Name for the mechanism, free of this row's facts: **RETENTION WITHOUT PROMOTION**. It is a **sixth**
mechanism, distinct from the five that precede it.

---

## 4. Why the repair must be a bridge and not a lowered bar

**`INSUFFICIENT_EVIDENCE ⇒ ASK` is refused, and the measured data does not support it either.** The
state is a legitimate, load-bearing answer — the hard prohibition *"If you cannot establish the
state, say INSUFFICIENT_EVIDENCE or UNKNOWN. Both are real answers"* exists to stop the model
asserting `ACTIVE` without present exposure, and weakening it would reopen a defect §112–§115 closed.
Some insufficiency is decision-invariant or non-actionable, and §147's whole precision half exists to
keep those silent.

**The bridge is a CONJUNCTION, and the counterfactual gate stays binding:**

```
      RECOGNIZED UNKNOWN   +   ANSWER WOULD CHANGE A CONTRACT-VALID DECISION
                              ↓
                    A CLARIFICATION MUST EXIST
```

not

```
      INSUFFICIENT_EVIDENCE  →  ASK
```

**What the measured data does support** is that the trigger is cheap to check and has not yet
misfired: `INSUFFICIENT_EVIDENCE` occurred on 5 rows, all REQUIRED, and on none of the 10 FORBIDDEN
rows. That is a small sample and is reported as one — it is evidence that a bridge keyed on
*retention* would not have fired where silence was owed, not proof that it never will.

**And the repair must be additive.** Five things must not move: the `INSUFFICIENT_EVIDENCE` state
itself, the seven NOT-DECISION-CRITICAL shapes, the counterfactual test's five conditions, v12's
settlement semantics (§149 measured 0/10 unsupported settlements — a closed defect), and v11's
threshold and routing rules.

---

## 5. What the repair must reach, stated as channels

The doubt must be caught wherever it terminates, because US-D1 put it in three places at once:

1. **`assertedConditionState`** — a candidate left `INSUFFICIENT_EVIDENCE` or `UNKNOWN`;
2. **`reasoning` / `evidenceBasis`** — prose that names a fact as unresolved, unconfirmed, not
   established, or known only with low confidence;
3. **`expertExplanation.summary`** — the same, in the customer-facing paragraph;
4. **`uncertainty.statements`** — already bridged, and the existing sentence must survive verbatim.

And the self-check must run **at the end**, over the model's own finished output, for the same reason
THE SETTLEMENT CHECK does: a doubt that has already been written down is only visible by re-reading
what was written.

---

## 6. Two fixture defects, established and to be repaired before any spend

Both were found by reading §149's output and are recorded there; neither changes a historical score.

**US-D1's observation presupposes the fact it withholds.** It says *"Traffic is passing in **the open
lane**"*, and the definite article presupposes that another lane is closed — which is the very
closure state the row intended to leave unknown. A defensible reading settles the question from the
text. **The row cannot be reused as a scored row**; it needs a structural analogue whose observation
neither states nor presupposes the missing fact.

**US-I1's "deterministic derivation" was not deterministic.** I claimed a supply cable removed at
both ends establishes that the conveyor cannot be energised. It establishes that **no supply path
exists now**; concluding that none exists **throughout the work** requires the unstated premise that
nobody reconnects it — and the row itself states that a second fitter is at the enclosure door. The
model asked whether the disconnection is locked or tagged and **was right**. The row must leave the
FORBIDDEN denominator and be replaced by a derivation whose conclusion follows without adding a
premise.

**§149's literal scores stand unchanged: FORBIDDEN silence 4/5 literal, 5/5 adjusted.**
