# §149 — Unsupported-Settlement Root-Cause Trace (TR-E1)

**Status: ROOT CAUSE ESTABLISHED. Attribution: PROMPT SEMANTICS.**

Reconstructed from `verification/expert-hazlenz-threshold-arbitration-remediation-2026-09-03/`
(`RUN-RECORDS.jsonl` `3727a5ec…`, `RAW-WIRE.jsonl` `017857d1…`, both verified byte-identical to their
recorded hashes before this trace began). Zero provider calls. $0.00.

---

## 1. The trace, sentence by sentence

### 1.1 What the observation actually says

The row supplies exactly one sentence about gas monitoring:

> *"…no gas monitor **is visible** at the surface or on the man…"*

That sentence establishes one thing: **a visibility fact, from the inspector's vantage point, at the
moment of the visit.** It does not establish that no monitor exists, that no monitoring is occurring,
that no test was performed before entry, or that no other control exists.

### 1.2 What the model bound, and it bound it correctly

```
candidate  atmo-hazard   family atmospheric_hazard   state ACTIVE   confidence HIGH
evidence[0]  offsets 265–319
             "no gas monitor is visible at the surface or on the man"
```

**The quote is exact, contiguous, in-bounds and correctly attributed.** The evidence-binding boundary
did its job perfectly. `EVIDENCE_OUT_OF_BOUNDS` did not fire and should not have. **The defect is not
in the grounding path, and no amount of grounding enforcement would have caught it.**

### 1.3 Where the crossing happens — `evidenceBasis`

> *"The chamber is connected to the foul sewer… and there is **no gas monitoring equipment present at
> all**."*

**This is the crossing point, and it is one field away from the quote that contradicts it.** The
model wrote `is visible` into `evidence` and `present at all` into `evidenceBasis`, in the same
object. **`not visible` became `not present`.**

### 1.4 And it crosses a SECOND time — `reasoning`

> *"The **complete absence of any gas monitor**, either on the worker or at the surface, means the
> atmosphere inside the chamber is currently **unassessed and unmonitored** while a person occupies
> it."*

There are **two** unsupported steps here, and collapsing them into one would misdescribe the defect:

| # | from | to | what is smuggled in |
|---|---|---|---|
| **1** | *not visible* | *not present at all* | **VISIBILITY → EXISTENCE.** The inspector's vantage point is treated as exhaustive. |
| **2** | *no monitor present* | *unassessed and unmonitored* | **EQUIPMENT → ACTIVITY, and PRESENT → PAST.** Even granting step 1, the absence of an instrument now does not establish that no pre-entry test happened. A test performed and the instrument pocketed or returned to the van satisfies "no monitor visible" exactly. |

Step 2 is the one that destroys the clarification, because the authored missing fact was *"whether
the chamber atmosphere was tested **before** this entry."* **That is a fact about the past, and step 2
erases it with an observation about the present.**

### 1.5 The summary, and the point at which the question ceases to exist

> *"…this is an active permit-required confined space entry with an **unmonitored** atmospheric
> hazard… the observation itself establishes both the confined space and atmospheric exposures as
> present right now **with no controls in place**."*

*"The observation itself establishes"* is the model reporting its own state: it believes it **read**
this, not that it inferred it. `decisionCriticalClarifications: []`, `uncertainty.statements: []`.
**Nothing was retained anywhere.** The question did not lose a contest; it was never a candidate for
one, because by the time the counterfactual test ran, the fact was settled.

### 1.6 And worst-case reasoning WAS used correctly, in the same response

This matters, because it shows the model already draws the distinction the repair needs — in one
field and not in another:

> insight `csa-1`: *"**If** the unmonitored atmosphere incapacitates the worker, the absence of a
> tripod/winch and harness removes any means of non-entry rescue…"*

That is a conditional, used to explain a consequence. It is exactly the legitimate use. **The failure
is not that the model reasons about the worst case; it is that in `evidenceBasis` it wrote the worst
case down as a fact.**

---

## 2. Why v11 does not reach this — the established gap

The v11 `WHAT COUNTS AS ESTABLISHED` block has four limbs. Each is checked against TR-E1:

| v11 limb | antecedent | reaches TR-E1? |
|---|---|---|
| *"if you ASSUMED the worse of two possible states"* | the model knows it assumed | **NO.** The model did not experience a choice. It believed it was reading a stated fact. |
| *"…because the conditions RESEMBLE the ones it covers"* | reasoning from similarity | **NO.** No resemblance step occurred. |
| *"A THRESHOLD IS NOT A GAP"* (§148) | a supplied record turning on a value | **NO.** No record was supplied and no threshold is in play. |
| *"a fact **nobody mentioned** is not thereby absent, and not thereby present"* | **the text is silent** | **NO — and this is the gap.** |

**The fourth limb is the one that should have caught it, and its antecedent is false.** The
observation **does** mention the gas monitor. It mentions it *negatively*, about a *weaker predicate*
than the one the model went on to assert.

> ### THE ESTABLISHED ROOT CAUSE
>
> **v11 governs facts the text is SILENT about, and facts the model INVENTED. It does not govern a
> fact the text states NEGATIVELY about one predicate and the model then asserts about a STRONGER
> one.** Under v11 the model's reasoning is locally valid at every step: the observation states
> something, so the fact is ESTABLISHED, so the counterfactual test is never entered.

Name for the mechanism, kept free of this row's facts:
**PREDICATE STRENGTHENING ON A STATED NEGATIVE** — reading a *failure to observe* as *evidence of
absence*. It is a **fifth** mechanism, distinct from the four §147 caught.

---

## 3. The five states the authorization enumerates — what v11 distinguishes today

| | state | v11 today |
|---|---|---|
| **A** | positive evidence of absence | **Not named.** Treated identically to B, because both are "the text says something". |
| **B** | failure to observe something | **Not named.** Collapses into A. **This is the defect.** |
| **C** | unknown status | Named, but **only** via *"a fact nobody mentioned"* — i.e. only when the text is SILENT. |
| **D** | absence highly likely on context | **Not named at all.** Nothing tells the model that likelihood is not establishment. |
| **E** | worst-case assumption for risk reasoning | Named for the *assume-then-describe* case, but **nothing says a worst-case branch may EXPLAIN a consequence and must not SETTLE the fact.** |

**Directly answering the authorization's question: YES. The model is currently permitted to use a
worst-case assumption as though it were an established factual state**, because the only thing
standing against it is a bullet whose antecedent requires the model to have noticed it was assuming —
and on TR-E1 it did not, since it had a real sentence to point at.

---

## 4. The comparison set — establishing the boundary without fixture wording

Eight cases, reconstructed to locate the common boundary rather than to justify a rule already
written.

| case | § | what the text did | what the model did | v11 limb that governs | outcome |
|---|---|---|---|---|---|
| **LP-B2** | §142 | gave a physical profile | concluded a permit-space **classification** | resemblance | miss (repaired v10) |
| **EV-A4** | §146 | left an interlock state open | **assumed** the adverse branch, reported it as fact | worst-case | miss (repaired v10) |
| **EV-A6** | §146 | gave a value on an unstated datum | read across incomparable bases | threshold | miss (repaired v10/v11) |
| **TR-E1** | §148 | **stated a NEGATIVE about visibility** | asserted absence, then non-activity | **none** | **miss — OPEN** |
| **TR-A1** | §148 | **silent** on the auger panel's state | asked | *"nobody mentioned"* | **recovered** |
| **TR-C2** | §148 | **silent** on the component weights | asked | threshold limb (i), aggregate form | **recovered** |
| **TR-B3** | §148 | stated value, basis and side | computed and moved on | threshold, affirmative | **correctly silent** |
| **TR-F1** | §148 | stated every fact and witnessed the control | asked nothing | ordinary | **correctly silent** |

**The boundary is visible in one column.** Every case v11 handles is one where the text is either
**SILENT** (TR-A1, TR-C2 → ask) or **COMPLETE** (TR-B3, TR-F1 → silent). TR-E1 is the third
possibility the contract never named: the text **SPEAKS, PARTIALLY, IN THE NEGATIVE**. A partial
negative reads like completeness and behaves like silence, and v11 has no limb for it.

**The two recoveries prove the repair must be narrow.** TR-A1 and TR-C2 are already correct and are
reached by different limbs; a broad "be more doubtful" instruction would not improve them and would
put TR-B3 and TR-F1 at risk. **The repair must attach to the STATED-NEGATIVE case specifically.**

---

## 5. Why no layer below the model can fix this

**Grounding is a PROVENANCE check, not an ENTAILMENT check.** The prompt says so in terms — *"The
quote is matched by EXACT STRING SEARCH against the observation. It is not read for meaning."*
`normalizeExpertOutput` verifies that `evidence[].quotedText` occurs verbatim in the source. It does
not, and cannot, verify that `evidenceBasis` is entailed by the span it cites.

Building that check would mean deciding whether *"there is no gas monitoring equipment present at
all"* follows from *"no gas monitor is visible…"* — **deterministic semantic inference over
free-form model prose.** §148 evaluated and refused exactly that capability for the arbitration
stage, on measured evidence: a keyword rule that looked correct in sample derived the deleting label
from the word *"actually"* out of sample, and arbitration's n=1 hosted population cannot calibrate a
rule that destroys output. **The same refusal applies here with more force**, because an entailment
checker would gate candidates rather than questions.

**Attribution: PROMPT SEMANTICS. Prompt-only repair is both correct and the only available layer.**

---

## 6. What the repair must and must not do

**Must:**
1. Name **failure to observe** as its own state, distinct from **positive evidence of absence**.
2. State that a negative observation about one predicate does not license an assertion about a
   stronger one — *not visible* ≠ *not present*; *not present now* ≠ *never done*.
3. Separate **explaining** a consequence with a worst-case branch (legitimate, and the model already
   does it correctly in `crossHazardInsights`) from **settling** the fact with one (forbidden).
4. Say that likelihood, common practice and expected configuration do not establish a fact.
5. Attach the rule where the crossing happens — the prose that accompanies a quote — not only to the
   clarification test, because on TR-E1 the fact was settled in `evidenceBasis` long before the
   counterfactual test ran.

**Must not:**
- Regress the four v10/v11 limbs, the scoped invariance rule, the conjunctive threshold reopening,
  THE SETTLEMENT CHECK or the `affectedDecision` self-check.
- Introduce a quota, a keyword trigger, a domain rule, or any wording taken from TR-E1's facts.
- Make the model doubt a fact the text states plainly and completely — TR-B3 and TR-F1 are the
  controls that must not move.
- Suppress a candidate. **TR-E1's `atmospheric_hazard` candidate is correct and must survive**; a
  sewer chamber connected to a foul sewer is a real hazard whether or not a monitor is present. The
  defect is the destroyed QUESTION, not the raised hazard, and a repair that trades one for the other
  is the §101/§105 failure this programme exists to prevent.
