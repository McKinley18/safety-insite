# §157 — Verifier v2: Bounded Fact Nomination

**TERMINAL:**

    EXPERT_HAZLENZ_SELECTIVE_VERIFIER_V2_FAILED —
    DECISION_CRITICAL_DISCOVERY_INSUFFICIENT              (CASE C)

Local matrix 46/46. Hosted: 15 calls, 0 retries, 0 reruns, **$0.262272** of a $1.00 ceiling, 0
first-pass invocations, 0 production files changed.

---

## 1. The three things that must be said first

**1. HS-H1 is still not recovered — 0 of 2, and one draw regressed.** VC-13 returned
`NO_CLARIFICATION_REQUIRED` exactly as under v1. VC-02, which under v1 at least produced an
`ADD_OR_REPLACE_CLARIFICATION` (on the wrong fact), now returns `NO_CLARIFICATION_REQUIRED`. Neither
draw reached the cooling hold. **Decision-critical recall fell from 2/3 to 1/3.**

**2. Legitimate silence survived the new authority intact — 7/7, zero manufactured questions, zero
false nominations.** The thing §156 got right, v2 did not break. That was the live risk in granting
nomination authority and it did not materialise.

**3. THE ONE CASE WHERE NOMINATION WORKED PERFECTLY IS THE CASE MY HARNESS DESTROYED.** VC-04
produced a complete, correct, admissible nomination — it named the interlock function-test fact, with
a verbatim observation span, the right affected decision, and genuinely diverging branches — and then
hit `max_tokens: 1600`, which I set, before it could emit the `proposedClarification` the contract
requires. The admission rule refused the verdict for `PROPOSAL_REQUIRED_FOR_THIS_VERDICT`. **That is
destroyed output, not a model failure, and it is my defect.** No rerun was authorized and none was
performed.

---

## 2. Identity

| | |
|---|---|
| verifier contract | `hazlenz.expert.verifier.v2` (v1 preserved byte-unchanged beside it) |
| verifier instruction | `hazlenz.expert.verifier-instruction.v2`, sha256 `ffc63119b5a30ec8…` |
| packet | the §156 packet **reused unchanged**, sha256 `75d64197…942afc5a` |
| truth manifest | the §156 manifest **reused unchanged**, sha256 `dbbe3361…4855617c` |
| provider / model | anthropic / claude-sonnet-5 |
| pre-spend gate | 18/18 PASS at $0.00 |

No §156 verifier outcome was exposed to the v2 verifier: the packet file never contained one, and the
gate asserts that plus the absence of every answer-key pattern.

> **THE STANDARD CARRIES §157's OWN CAVEAT.** It was authored by the model family being graded and has
> not been independently reviewed. These are development figures. See
> `docs/EXPERT-EVALUATION-TRUTH-AUTHORITY.md`.

## 3. Phase 11 gates

| gate | v2 | v1 |
|---|---|---|
| exact verdict accuracy | 8/10 (80.0%) | 8/10 (80.0%) |
| semantic accuracy | 8/10 (80.0%) | 9/10 (90.0%) |
| **A. decision-critical recall** | **1/3 (33.3%)** | 2/3 (66.7%) |
| **B. selector accuracy** | **1/3** | 2/3 |
| correct affectedDecision | 1/3 | 2/3 |
| false `NO_CLARIFICATION_REQUIRED` | **2/3** | 1/3 |
| **C. legitimate-silence specificity** | **7/7 (100%)** | 7/7 (100%) |
| false `ADD_OR_REPLACE` | 0/7 | 0/7 |
| **D. nomination count** | **1/15** | n/a |
| **E. nomination accuracy** | 0/1 scored — see §1.3 | n/a |
| **F. false nomination count** | **0** | n/a |
| **G. abstain count** | 0 | 0 |
| **H. boundary rejection count** | 1 (VC-04, harness truncation) | 1 (VC-02, the v1 ref rule) |

## 4. HS-H1

**VC-02 (R2)** — v1 `ADD_OR_REPLACE_CLARIFICATION` → v2 `NO_CLARIFICATION_REQUIRED`. The new step
demonstrably ran; the verifier wrote:

> "I also considered whether there is a fact not raised that would change the decision (e.g. whether
> the door opening itself is being done in a controlled/gradual manner…) — but the observation
> already describes PPE and hinge-side positioning as the controls in use, and no plausible alternate
> answer to an unasked fact would produce a different action given the information supplied."

It searched, nominated nothing, and reasoned itself further from the owed fact than v1 had. The
cooling hold is never mentioned.

**VC-13 (R3)** — `NO_CLARIFICATION_REQUIRED` under both versions, same shape.

    HS-H1 RECOVERED: 0/2

The load-side fact was not reached in four hosted attempts across two verifier versions.

## 5. What the nomination mechanism did prove, on the case that was destroyed

VC-04's nomination, verbatim from the stored record:

> **missingFact** — "Whether the rotor guard interlock switch was functionally tested/verified to
> actually stop or prevent rotor operation when the guard is opened, following the overnight rotor
> tooth change and reassembly, before the machine was returned to service."
>
> **observationSpan** — "The machine was returned to service this morning after a rotor tooth change
> carried out overnight by the maintenance fitter, who has gone off shift." *(verbatim; the span
> check passed)*
>
> **branchA → decisionIfA** — tested and confirmed → "Normal operation continues as observed."
> **branchB → decisionIfB** — not tested → "Operation should be halted and the guard interlock
> functionally verified (or the machine placed back under lockout/tagout)…"

That is exactly the fact the frozen v9 authored truth names, proved in exactly the two-branch form the
admission rule demands, arising from a generic instruction that contains no fixture vocabulary. The
mechanism works. **The experiment cannot score it, because I truncated the response.**

Note what this case was: the first pass returned an *entirely empty analysis* and supplied **no
unresolved facts at all**. There was nothing to reason about except by discovery — which is precisely
what nomination is for.

## 6. The harness defect, stated as its own diagnostic

    HARNESS_DEFECT: max_tokens set to 1600 in the §157 probe
    AFFECTED: 1 of 15 cases (VC-04), stop_reason max_tokens, output exactly 1600
    ALL OTHER 14: stop_reason tool_use, output 473-1412
    CONSEQUENCE: a complete nomination lost its proposedClarification and was refused whole
    CLASSIFICATION: DESTROYED_OUTPUT — a measurement defect, not a model defect
    RERUN: NOT AUTHORIZED, NOT PERFORMED

The budget was marginal for exactly the verdict shape that matters: the two `ADD_OR_REPLACE` cases
consumed 1,412 and 1,600 output tokens while every silence verdict fit in 473–850. A nomination plus
its proof plus a proposed clarification is the largest payload the contract permits, and I sized the
ceiling against the average rather than against it.

## 7. Containment

Zero degenerate provider outputs. Zero forbidden fields. Zero nominations on any case where silence
was correct. One boundary rejection, and it fired correctly on an incomplete object — the rule did its
job even though the incompleteness was mine. The probe imports nothing from `src/`, invoked no
first-pass analysis, and v13, analysis.v2, arbitration, the v9 fixture, detector v2, the §155 trigger
and verifier contract v1 are all byte-unchanged.

## 8. Cost

| | v2 | v1 |
|---|---|---|
| input tokens | 5,114 | 3,681 |
| output tokens | 726 | 478 |
| cost per call | **$0.01748** | $0.01214 |
| share of a first pass | **34.9%** | 24.2% |
| latency | 8,632 ms | 6,110 ms |
| per 100 analyses at 15/44 | +$0.60, **+11.9%** | +$0.41, +8.3% |

The longer instruction costs about 1,400 extra input tokens per call. Still cheap; still not the
obstacle. *15/44 remains a development observation, not a production rate.*

## 9. Why CASE C, and what it means

CASE A requires HS-H1 genuinely repaired on reachable draws — it was not. CASE B requires HS-H1 to
recover — it did not, and false nominations were zero anyway. CASE D would blame provider output; the
provider's output was fine and the one destroyed case was destroyed by my token ceiling, so using D
would misattribute my defect to the model. **CASE C describes it: specificity holds, discovery is
insufficient.**

The sharper reading is that v2 tested two things at once and they came apart:

- **The nomination MECHANISM is sound.** It is provable, containable, cheap, produced zero false
  positives across fifteen cases, and on the one case where the first pass supplied nothing it found
  the owed fact and proved it correctly.
- **The nomination TRIGGER inside the model is not firing where it is needed.** On both HS-H1 draws
  the verifier ran the new step, considered unasked facts, and concluded there were none — while the
  owed fact sat in the observation. The instruction's guard ("the answer is usually NO") protected
  specificity and did not cost anything measurable on the silence cases; whether it also suppressed
  discovery on HS-H1 is not established by this run and is the obvious next hypothesis.

There is a pattern across §156 and §157 worth naming: **four hosted attempts, two verifier versions,
and the cooling hold has never been mentioned once.** Both versions reason fluently about chamber
instrumentation. Something about that observation makes the load-side fact hard to see, and it may
not be a verifier-design problem at all.

## 10. What the next operation should decide

1. **Re-run VC-04 alone under an adequate token ceiling** — the cheapest missing measurement in the
   whole programme, and it is the difference between "nomination works" as a claim and as an
   anecdote.
2. **Test whether the "usually NO" guard is suppressing discovery**, by varying only that clause. It
   is one instruction line and it is the only difference plausibly responsible for VC-02's regression.
3. **Consider that HS-H1 may be the wrong instrument.** Four attempts, two versions, one blind spot,
   and a fixture whose owed fact requires domain knowledge about autoclave liquid loads that the
   observation gestures at but never states. Before a third verifier version, it is worth asking a
   human whether the authored truth for that row is reachable from the observation at all — which is
   an adjudication question, not an engineering one, and §157's truth-authority policy says exactly
   who has to answer it.
