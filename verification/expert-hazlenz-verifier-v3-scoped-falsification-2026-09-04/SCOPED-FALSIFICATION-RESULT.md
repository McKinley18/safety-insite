# Scoped hosted verifier-v3 binding falsification — result

**§167, 2026-09-04. 12 hosted provider calls. Actual cost $0.29139 of a $0.68 cap. 0 retries,
0 replacement calls, 0 first-pass invocations, 0 database operations, 0 files changed under
`backend/src/`.**

---

## Terminal

```
EXPERT_HAZLENZ_VERIFIER_V3_SCOPED_FALSIFICATION_PASSED —
BOUNDED_RELIABILITY_INTEGRATION_REVIEW_REQUIRED
```

Binding was hosted-usable, falsifiers B, C and E did not fire, and model target recovery was
materially better on the scoped sample. **Read §7 before quoting any of it.**

---

## 1. Headline counts

| | §163 (v2, no binding) | §167 (v3, binding) |
|---|---|---|
| **HS-A1 target reached** | **3/10** | **6/6** |
| HS-A1 target displaced by the auger fact | 7/10 | 0/6 |
| HS-A1 settled silence | 0/10 | 0/6 |
| **HS-E1 target reached** | **1/10** | **6/6** |
| HS-E1 settled silence | **8/10** | **0/6** |
| HS-E1 wrong-fact clarification | 1/10 | 0/6 |

**12/12 draws bound the owed key, and on all 12 the independent semantic column agreed.** Every
draw was execution-valid, contract-admitted, non-degenerate, non-truncated, with 0 forbidden-field
violations.

**These are exact counts on a bounded development sample of 12 draws over 2 rows. They are not a
rate, not an accuracy percentage, and not a production property.** No inferential test was
preregistered and none was performed.

---

## 2. The separation that decides how this is read

A populated `bindingFactKey` is a **declaration**, not evidence that the question reaches the fact.
Two independent columns were computed and never merged:

| | what it asks | who scores it | result |
|---|---|---|---|
| `ARCHITECTURE_DETECTION_SUCCESS` | did the closed-set machinery bind, account for every owed fact, preserve the ledger, and keep the warning honest? | code | **TRUE** |
| `MODEL_SEMANTIC_RECOVERY_SUCCESS` | did the **model** reach the human-authoritative target? | frozen §162 targets | **TRUE** — 12/12 |

**The columns agreed on every draw** (`columnDisagreements: []`). No draw bound the owed key while
failing the target cue, and none reached the cue without binding. That agreement is the reassuring
part of this run — but it is agreement between a declaration and a cue matcher, not a proof, and
**human sampling of the 12 bound pairs remains the §164 measurement obligation**. The verbatim
question is recorded beside every match in `FALSIFICATION-SCORES.json` so a human can check it.

---

## 3. Falsifier matrix

| | falsifier | result |
|---|---|---|
| **A** | binding usability | `BINDING_PROTOCOL_HOSTED_EXERCISED = TRUE` — 12/12 admitted bindings, 12/12 to the owed key. **Not triggered.** |
| **B** | owed-target preservation | `CORE_BINDING_CLAIM_FALSIFIED = FALSE` — HS-A1 **0/6** and HS-E1 **0/6** failed to bind or declare, against the frozen threshold of ≥2 of 6. **Not triggered.** |
| **C** | additive, not substitutive | `FALSIFIER_C_TRIGGERED = FALSE` — 0 facts removed, 0 preservation violations, 0 implicit-coverage side effects across all 12 draws. The ledger **grew** on all 5 nomination draws. |
| **D** | false question manufacture | `FALSIFIER_D_TESTABLE = FALSE` — **not computed.** See §5. |
| **E** | coverage warning | `FALSIFIER_E_TRIGGERED = FALSE` — 0 draws had an authoritative supplied owed fact unresolved while the warning was FALSE. |
| **F** | question burden (scoped) | `QUESTION_BURDEN_UNACCEPTABLE = FALSE` against the frozen §164 criterion — HS-A1 mean 1.83 distinct facts/draw (max 2), HS-E1 mean 1.00 (max 1). |

The frozen thresholds for B and F were fixed in §164/§166 **before** any result was seen and are not
reinterpreted here.

### A note on the coverage warning that is easy to misread

`TARGET_COVERAGE_WARNING` was TRUE on HS-A1 draws 1–5 and FALSE on the other seven. That is **not**
the owed target going uncovered. On those five draws the verifier bound the flame-failure target
*and* nominated the auger gap; the **nominated** fact then sat `UNRESOLVED` in the ledger, and the
§165 stricter rule fires on any unresolved fact. The owed target was `COVERED` on all 12 draws.
This is the machinery behaving correctly and is reported rather than netted away.

---

## 4. What the verifier actually did

**HS-E1 is the sharpest result.** §163 fell silent on 8 of 10 draws. Under v3 all six draws asked
about the interlock's **protective function**, and every one of them explicitly distinguished it
from physical closure — the exact boundary the §162 truth draws:

> "Was the rotor guard interlock's protective function (**not just its physical closure**) tested
> and confirmed to actually stop/prevent rotor operation when the guard is opened…"

> "…functionally tested and verified after the overnight rotor tooth change and before the debarker
> was returned to service this morning, **or was only the physical closure** confirmed?"

**HS-A1 carried both gaps.** Five of six draws bound the flame-failure target **and** nominated the
auger-isolation gap additively — the `SIMULTANEOUS_INDEPENDENT_GAPS` shape, which the v2 contract
structurally could not express. The §165 disposition's classification of the auger fact as
`VALID_BUT_TARGET_DISPLACED` **never had to be applied**, because the condition it depends on — the
auger fact appearing *without* flame-target coverage — did not arise once.

---

## 5. Falsifier D remains untestable, and this run is not evidence on it

```
FALSIFIER_D_TESTABLE = FALSE
reason: NO HUMAN-AUTHORITATIVE SILENCE TRUTH AVAILABLE
```

No false-question rate, legitimate-silence specificity or manufactured-question precision was
computed, and none may be derived from this run. HS-J1, HS-N1, HS-P1 and HS-R1 were not used
anywhere — gate D.3 asserted their absence from every request before spend.

**The absence of obviously bad questions in these 12 draws is not evidence on D.** Both cases are
`REQUIRED` rows where a question was the right answer; nothing here tests whether binding provokes a
question where silence was correct. B and D were §164's decisive pair. **B passed and D was not
asked.**

---

## 6. Observations that are not falsifier triggers but should not be lost

1. **HS-A1 draw 6 dropped the auger gap entirely.** It bound the flame-failure target and emitted no
   nomination. Under the owner's `SIMULTANEOUS_INDEPENDENT_GAPS` framing a genuine decision-critical
   gap went unrepresented on 1 of 6 draws. Falsifier C is not triggered — nothing was *erased* — but
   additive nomination was used on 5 of 6, not 6 of 6.
2. **Two HS-A1 draws emitted a compound question string.** Draws 2 and 3 packed the flame-failure
   question and the auger question into one `question` field *while also* carrying the nomination.
   One string containing two questions is harder for a person at the workplace to answer
   unambiguously, and the §165 budget's combination rule would not have authorised combining them
   (different equipment). This is a presentation defect the current contract does not catch.
3. **Draw-to-draw wording varied while intent did not.** All 12 questions are distinct strings. The
   §163 instability finding concerned *semantic* outcome, and on this sample semantic outcome was
   stable at 12/12 while wording remained variable.

---

## 7. What this experiment does **not** establish — read before quoting §1

### The manipulation bundles three changes, and this design cannot attribute among them

v3 differs from v2 in three ways at once:

1. the **binding protocol** (`bindingFactKey`, closed-set membership);
2. the **per-fact declaration requirement** (`owedFactDeclarations`, every key accounted for);
3. a **richer statement of the owed fact** — v2's packet supplied the flame-failure fact as a
   candidate ref and an uncertainty sentence; v3 supplies `whyUnresolved`, `branchA`, `branchB` and
   the two-branch `decisionDivergence` explicitly.

**The third is a substantially stronger prompt cue than v2 carried**, and this experiment cannot say
how much of the 3/10 → 6/6 and 1/10 → 6/6 movement is attributable to binding rather than to being
told the fact more fully. A design that separated them would need a third arm supplying the richer
fact statement *without* the binding protocol, and no such arm was purchased. **Any claim that
"binding fixed displacement" overstates what was measured; what was measured is that the v3 package
as a whole moved the outcome.**

### Other limits

- **12 draws, 2 rows, one model, one day.** Not a rate.
- Both rows are `REQUIRED`. Nothing here measures behaviour where silence is correct.
- The §162 cue instrument identifies candidate text; the classification traces to the human-authored
  target. It is not a semantic proof, and §160's retirement of `B_selectorAccuracy` as a scorer
  stands.
- HS-A1's owed fact was supplied *alone*, deliberately. Production owed sets will often carry
  several facts, and nothing here measures binding behaviour under a larger closed set.
- No production or customer path was touched. v3 is not activated anywhere.

---

## 8. Execution accounting

| | |
|---|---|
| model | `claude-sonnet-5` (attested identical on all 12 responses) |
| planned / issued | 12 / 12 |
| retries · replacements · first-pass calls | 0 · 0 · 0 |
| input / output tokens | 75,600 / 14,019 |
| **actual cost** | **$0.29139** |
| hard prospective cap | $0.68 |
| worst case per call (guard unit) | $0.05600 |
| cap compliance | **TRUE** — the guard checked `spent + $0.05600 <= $0.68` before every request |
| frozen request hashes | VC-08 `c1e5407a121c60b7…` · VC-04 `94b47273776d3794…` |

Both request bodies were frozen, hashed and written to `FROZEN-REQUESTS.json` **before** the first
call, and asserted equal to the hashes §166's preflight recorded. Every attempt was appended and
`fsync`ed before the next request was issued; nothing was overwritten.

**Pre-spend gate: 25/25 PASS at $0.00 spent.**

---

## 9. Historical integrity

| artifact | status |
|---|---|
| §163 `DRAW-RUN-RECORDS.jsonl` | **unchanged** — sha256 `7e84cef427d8c126…`, 20 records, read only |
| verifier instruction v3 | `678160c95bc7db38…` — unchanged before, during and after spend |
| verifier v3 response schema | `1bddc1a51fb2d1ca…` — unchanged |
| verifier instruction v2 | `ffc63119b5a30ec8…` — byte-unchanged |
| §156 packet · v13 prompt · v9 fixture | unchanged |
| §164, §165, §166 artifacts | **0 tracked modifications** |
| `backend/src/` | 8 pre-existing modified files, identical to the session-start snapshot; **0 touched by this operation** |

---

## 10. Protected regression — all green

`SOURCE_PROJECT_TSC` exit 0. `test:expert-verifier-v3-protocol` 49/49 ·
`test:expert-bounded-reliability` 44/44 · reliability-architecture 69 · verifier-v2-contract 46 ·
contract-foundation 56 · routing-contract 67 · measurement-layer 66 · fixture-hardening 76 ·
clarification-settlement 148 · affected-decision-arbitration 41 · unsupported-settlement 129 ·
retention-bridge 123 · level1-recall PASS · actionable-coverage PASS · guarding-applicability 16/16
· governed-kill-switch-authority 115. **0 failures.**

`DEGENERATE_OUTPUT_POLICY_STATUS = PROVEN_LOCAL / AWAITING_HOSTED_INTEGRATION` — unchanged. Zero
degenerate responses occurred, so the policy was never exercised and remains unproven in hosted use.

---

## 11. Determinations

| | |
|---|---|
| A `BINDING_PROTOCOL_HOSTED_EXERCISED` | **TRUE** |
| B `CORE_BINDING_CLAIM_FALSIFIED` | **FALSE** |
| C `FALSIFIER_C_TRIGGERED` | **FALSE** |
| D `FALSIFIER_D_TESTABLE` | **FALSE** |
| E `FALSIFIER_E_TRIGGERED` | **FALSE** |
| F `QUESTION_BURDEN_UNACCEPTABLE` | **FALSE** |
| G `ARCHITECTURE_DETECTION_SUCCESS` | **TRUE** |
| H `MODEL_SEMANTIC_RECOVERY_SUCCESS` | **TRUE** (12/12) |
| I target displacement | **decreased materially on this sample** — HS-A1 7/10 → 0/6 |
| J settled silence | **decreased materially on this sample** — HS-E1 8/10 → 0/6 |
| K further semantic remediation required? | **Not on the failure modes §163 measured.** Two lesser defects remain (§6): a dropped valid gap on 1/6, and compound question strings on 2/6. Neither is a §163 failure mode and neither is currently caught by the contract. |
| L bounded reliability integration still worth pursuing? | **Yes, and the case is stronger.** The deterministic layer did everything asked of it, and the failure modes it was built to *detect* did not occur — which means its value is now mostly unexercised rather than disproven. The conditional second draw (policy C) never fired, because no draw fell silent. |

---

## 12. Exact next authorization required

1. **Human sampling of the 12 bound pairs.** The §164 obligation. Both columns agreeing is not proof
   a binding is truthful, and 12 pairs is a small, cheap, zero-cost review.
2. **Decide whether to disentangle the three-way confound in §7.** A third arm — richer owed-fact
   statement without the binding protocol — is the only way to attribute the movement. It is
   optional; the practical question may be whether the *package* works, not which part does.
3. **Silence-control construction and independent human review**, which is the only route to
   `FALSIFIER_D_TESTABLE = TRUE`. Until then no over-questioning or precision claim may rest on this
   architecture.
4. **Bounded reliability integration review** — the terminal this run hands over. Note that policy
   C's conditional second draw was never exercised here.

No production activation. No customer activation. No claim of production accuracy or reliability.
