# §208 — FRESH EXPERT HAZLENZ ACCEPTANCE COHORT EXECUTION

Executed 2026-09-08 against the frozen §207 preregistration.

**TERMINAL:**
`EXPERT_HAZLENZ_FRESH_COHORT_EXECUTED — PRODUCT_OWNER_ADJUDICATION_OF_177_JUDGMENTS_REQUIRED`

**EXECUTION COMPLETING IS NOT ACCEPTANCE.** All three legs ran, the evidence is complete, and
**zero of the 177 preregistered judgments have been supplied** — every verdict must carry
`PRODUCT_OWNER` attribution, no agent may write one, and no code path in this slice does. Thirteen
of the fifteen gates are therefore `AWAITING_ADJUDICATION` and the acceptance determination is
`NOT_DETERMINABLE`.

| Boundary | Actual |
|---|---|
| Frozen preregistration identity | `879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4` — verified, pin agreed, unchanged throughout |
| Provider calls | **50** of hard ceiling 57 |
| Provider spend | **USD 2.308554** of hard ceiling 6.00 |
| Retries | **0** of 6 |
| Database operations | **0** |
| Production / customer activation | NONE |
| Commit / push / tag / deploy | NOT PERFORMED |
| Truth / gate / denominator changes | **NONE** |
| Prompt / contract / representation / escalation changes | **NONE** |

---

## 1. EXECUTION-GATE RESULT

Checked before every stage, three times, with identical output:

```
pin              : 879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4
source identity  : 879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4
record verified  : VERIFIED
authorization    : SECTION-208-PRODUCT-OWNER-AUTHORIZATION-2026-09-08
permitted        : true
```

The executor additionally refuses to proceed unless the gate's identity **equals the identity the
product owner authorized**, so a drifted-but-self-consistent preregistration would abort before any
call rather than execute a different specification.

An **offline preflight** ran first, at zero cost: it constructed all 24 first-pass requests and
confirmed the execution gate, the authorized identity, and that **no first-pass request carried a
governed-binding property anywhere in its body** (the §206 guard's precondition). Largest request
body 69,858 B — the §199 rejection was on grammar, not body size, and §206's accepted first pass was
69,177 B.

## 2. FROZEN PREREGISTRATION IDENTITY USED

`879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4`

Recorded on every first-pass evidence record. Re-verified after execution: the §207 suite still
passes **144/0** and all five §207 module hashes are unchanged, so the specification graded is the
specification frozen.

## 3–4. PROVIDER CALLS AND SPEND

| leg | calls | outcome |
|---|---|---|
| first pass | 24 | 24 reached inference, `tool_use`, HTTP 200 |
| governed stage | 1 | reached inference, `tool_use`, HTTP 200 |
| verifier | 25 | 24 reached inference; **1 rejected before inference at HTTP 400** (executor defect 2) |
| **total** | **50** | |

**USD 2.308554.** Against the §207 projection of USD 2.2744 expected and 46 calls expected — four
calls above expectation (24 admitted facts drove 24 verifier calls rather than the projected 20, and
one call was lost to executor defect 2), and USD 0.034 above. Both hard ceilings were approached but
never neared: 50 of 57 calls, 38 % of the spend ceiling.

## 5. PROVIDER / INFRASTRUCTURE FAILURES

| class | count | detail |
|---|---|---|
| `NO_FAILURE` | 49 | |
| `TRANSPORT_STRUCTURAL` | 1 | verifier call 26, HTTP 400, `tools.0.custom: Invalid schema: Enum value 'SUPPLIED_FACT' does not match declared type '['string','null']'`, **USD 0.00** |
| `TRANSPORT_TRANSIENT` | 0 | |
| `OUTPUT_TRUNCATED` | 0 | no call hit `max_tokens` |
| `OUTPUT_UNPARSEABLE` | 0 | every accepted call returned a parseable `tool_use` block |
| `OUTPUT_DEGENERATE` | 0 | no verbatim repetition, no placeholder fields, no off-case content |

**The one structural rejection was NOT a rejection of the preregistered artifact.** It is
classified as `SECTION_208_EXECUTOR_VERIFIER_TRANSPORT_PARAMETERISATION_DEFECT` and is documented in
full in `EXECUTOR-DEFECT-REGISTER-208.md` entry 2 — see §21 below. **The §199 grammar failure
(`COMPILED_GRAMMAR_TOO_LARGE`) did not recur on any leg.**

## 6. RETRIES

**Zero.** The retry budget of 6 was untouched. No transient failure occurred, and the frozen rule
that degenerate output and zero-declaration output are **never** retried was never engaged, because
neither arose in a form that could have tempted it.

## 7. EXECUTION-VALID CASE COUNT

**24 of 24.** Every case's first pass reached inference and returned contract-usable output. No case
left any gate denominator for a provider reason.

## 8. PER-CASE STRUCTURAL OUTCOMES

All values below are **deterministic and structural**. None is a semantic verdict.

| case | frozen expected facts | declarations | admitted | refused | RR-7 preserved | safetyStateComplete | totalLoss |
|---|---|---|---|---|---|---|---|
| AC-01 | 2 | 2 | 2 | 0 | 0 | true | false |
| AC-02 | 2 | 2 | 2 | 0 | 0 | true | false |
| AC-03 | **2** | 1 | **1** | 0 | 0 | true | false |
| AC-04 | **0** | **0** | 0 | 0 | 0 | true | false |
| AC-05 | **0** | **1** | 1 | 0 | 0 | true | false |
| AC-06 | **0** | **0** | 0 | 0 | 0 | true | false |
| AC-07 | **1** | **2** | 2 | 0 | 0 | true | false |
| AC-08 | 1 | 1 | 1 | 0 | 0 | true | false |
| AC-09 | 1 | 1 | 1 | 0 | 0 | true | false |
| AC-10 | 1 | 1 | 1 | 0 | 0 | true | false |
| AC-11 | 1 | 1 | 1 | 0 | 0 | true | false |
| AC-12 | 1 | 1 | 1 | 0 | 0 | true | false |
| AC-13 | 1 | 1 | 1 | 0 | 0 | true | false |
| AC-14 | 1 | 1 | 1 | 0 | 0 | true | false |
| AC-15 | 1 | 1 | 1 | 0 | 0 | true | false |
| AC-16 | 1 | 1 | 1 | 0 | 0 | true | false |
| AC-17 | 1 | 1 | 1 | 0 | 0 | true | false |
| AC-18 | 1 | 1 | 1 | 0 | 0 | true | false |
| AC-19 | 1 | 1 | 1 | 0 | 0 | true | false |
| AC-20 | 2 | 2 | 2 | 0 | 0 | true | false |
| AC-21 | 1 | 1 | 1 | 0 | 0 | true | false |
| AC-22 | 1 | 1 | 1 | 0 | 0 | true | false |
| AC-23 | **1** | **0** | 0 | 0 | 0 | true | false |
| AC-24 | **0** | **0** | 0 | 0 | 0 | true | false |

**24 admitted facts across the cohort**, matching the frozen design's total of 24 — though not case
by case: four cases diverge from their frozen expected count (AC-03, AC-05, AC-07, AC-23), and each
of those divergences is a **question for axes A, B and I**, not a structural finding. This report
does not judge them.

## 9. DECLARATION / PRESERVATION / PROJECTION RESULTS

- **Zero declarations were refused by the projection** once executor defect 1 was corrected. Every
  one of the 24 declarations carried all eleven required fields, a verbatim observation span, a
  member `affectedDecision`, non-identical branches and diverging decisions.
- **RR-7 therefore had nothing to preserve, on any row.** `preservedCount = 0` and
  `safetyStateComplete = true` on all 24 cases, and `totalLossOnThisRow` is false everywhere.
- **The §204 F8 signature — a semantically correct reading destroyed by an empty required field —
  did not recur structurally in this run.** That is a structural observation about contract
  compliance and **not** a semantic verdict; whether the declarations were semantically correct is
  what the 177 judgments decide.
- Consequence for gate G13: its denominator is **zero refused declarations**, so it is
  `NOT_EXERCISED_ZERO_DENOMINATOR` — **not** `PASSED`. §207 froze that rule precisely so a gate
  could not report a pass on an empty denominator.

## 10. VERIFIER RESULTS

24 verifier calls, one per admitted fact, all reaching inference.

| verdict | count |
|---|---|
| `VERIFIED_AS_IS` | 22 |
| `ADD_OR_REPLACE_CLARIFICATION` | 2 (AC-02 fact 1, AC-22) |

**Verifier admission (v3.3 contract): 23 admitted, 1 refused.** The refusal is AC-22:

```
codes = [PROPOSAL_REQUIRED_FOR_THIS_VERDICT,
         SOURCE_MODE_MISSING_ON_A_CLARIFICATION,
         NOMINATION_FIELD_MISSING]
```

— an `ADD_OR_REPLACE_CLARIFICATION` verdict emitted without the replacement proposal the contract
requires. That is a **verifier contract-compliance observation**, recorded structurally; whether it
degrades the verdict semantically is axis L's question.

**Axis L and gate G6 carry a disclosed fidelity limitation** — see §21, executor defect 3.

## 11. GOVERNED-STAGE RESULTS

One governed call was made, on AC-22. AC-23 and AC-24 admitted no fact, so the governed stage was
**correctly not called** on either (`NO_PROJECTED_FACTS_TO_BIND`); on AC-24 zero declarations is the
frozen correct answer, and on AC-23 the absence is an axis-A question.

AC-22's governed stage returned a single top-level key `bindings`:

```json
{"bindings": [{
  "factRef": "F1",
  "determination": "BINDS",
  "governedEvidenceSourceIds": ["GOV-ECP-01"],
  "bearingStatement": "This record describes the requirement that stored or residual energy be
    dissipated or restrained by methods such as blocking or bleeding down, which bears on whether
    such a method exists on the machine."
}]}
```

Structurally: it named **only** the supplied bearing record and **did not** name the deliberately
off-point `GOV-PPE-02`; it addressed the fact by its **minted reference `F1`**, never by a factKey;
and it returned **no HazLenz-owned field**. Whether the binding is semantically apt is axes N, S and
T — **not judged here**.

## 12. AUTHORITY-BOUNDARY RESULTS

Deterministic scans over every provider payload from every leg:

| check | result |
|---|---|
| citation-shaped strings in any output field | **0** |
| forbidden expert field names (`citation`, `cfr`, `regulation`, …) | **0** |
| provider-forbidden `OwedFact` fields (`status`, `priority`, `acceptableEvidence`, `settled`, …) | **0** |
| `factKey` returned by the provider anywhere | **0** |
| governed ids named outside the supplied set | **0** |
| governed ids named from within the supplied set | 1 (`GOV-ECP-01`, AC-22) |

**Gate G10 (provider settlement authority): PASSED**, deterministically, on a denominator of 50
calls against a minimum of 24. **Gate G11 (deterministic authority): PASSED on its automated half** —
the executed path performs no repair, no reconstruction and no prose parsing; the projection refuses
malformed declarations and RR-7 preserves without composing any field. The recorded human check
remains outstanding. **Gate G12's containment half (the scan): clean on all 24 cases**; its semantic
half, axis N on AC-22, is open.

## 13. DEGENERATE OUTPUTS

**None.** The degeneracy detector — deliberately narrow and structural: verbatim repetition beyond
twice, placeholder tokens in required fields, reference to another case — fired on zero cases. No
output was retried on quality grounds, which the frozen protocol forbids in any event.

## 14. THE 177-JUDGMENT ADJUDICATION STATUS

**177 slots created. 0 verdicts supplied. 177 open.**

This is not an omission and it is not deferral of work I could have done. Every verdict must carry
`PRODUCT_OWNER` attribution; no agent, no default and no code path may supply one. §200 recorded
zero model verdicts on 152 slots for the same reason, and §204's 120 verdicts were all
product-owner-attributed. **The deterministic scoring ran first and is in the packet as evidence; it
is not shown as a suggested answer on any semantic slot, and no slot carries a prefill.**

| | |
|---|---|
| slots | **177** — exactly the frozen budget (57 row + 120 fact) |
| verdicts supplied | **0** |
| slots with a genuine opportunity | 166 |
| slots with **no opportunity** | **11** (see below) |
| diagnostic observations recorded | 2 |

**The 11 no-opportunity slots**, each recorded with its reason and each **reducing** the denominator
of the gates it feeds — never scored, never a pass:

| slots | cause |
|---|---|
| `AC-03.FACT2.{C,E,F,M,L}` | the frozen design expected 2 facts on AC-03; the run produced 1 |
| `AC-23.FACT1.{C,L,M,N,S,T}` | the frozen design expected 1 fact on AC-23; the run produced 0 |

**Resulting live denominators against the preregistered minima** — this is the coverage picture the
adjudicator inherits:

| gate | live slots | no opportunity | minimum | headroom |
|---|---|---|---|---|
| G1 | 19 | 0 | 15 | 4 |
| G2 | 8 | 0 | 4 | 4 |
| G3 | 48 | 0 | 20 | 28 |
| G4 | 29 | 0 | 20 | 9 |
| G5 | 7 | 0 | 3 | 4 |
| **G6** | **13** | 2 | **12** | **1** |
| G7 | 21 | 2 | 18 | 3 |
| G8 | 6 | 0 | 3 | 3 |
| G9 | 17 | 1 | 14 | 3 |
| G14 | 3 (AC-22 N/S/T) | 3 (AC-23) | 1 | 2 |
| G15 | 11 | 0 | 0 | 11 |

**G6 has headroom of one.** A single further `NOT_EXERCISED` from the adjudicator on an axis-L slot
takes it to `COVERAGE_INSUFFICIENT`, which is not a pass. That is a live risk on a hard gate and the
adjudicator should know it before starting.

## 15. ALL FIFTEEN GATE OUTCOMES

| gate | kind | denominator / min | outcome |
|---|---|---|---|
| G1 decision-critical fact recall | HARD | 0 / 15 | `AWAITING_ADJUDICATION` |
| G2 independent multi-gap preservation | HARD | 0 / 4 | `AWAITING_ADJUDICATION` |
| G3 total safety-fact loss | HARD | 0 / 20 | `AWAITING_ADJUDICATION` (structural half clean: 0 silent total losses) |
| G4 unsupported adverse counterfactuals | HARD | 0 / 20 | `AWAITING_ADJUDICATION` |
| G5 incomplete verification-state partitions | HARD | 0 / 3 | `AWAITING_ADJUDICATION` |
| G6 exact verifier target binding | HARD | 0 / 12 | `AWAITING_ADJUDICATION` — and see the fidelity disclosure |
| G7 clarification settlement sufficiency | HARD | 0 / 18 | `AWAITING_ADJUDICATION` |
| G8 temporal/sequence preservation | HARD | 0 / 3 | `AWAITING_ADJUDICATION` |
| G9 unsupported downstream claims | HARD | 0 / 14 | `AWAITING_ADJUDICATION` |
| **G10 provider settlement authority** | HARD | **50 / 24** | **PASSED** (fully deterministic) |
| **G11 deterministic authority** | HARD | **1 / 1** | **PASSED_AUTOMATED_HALF** (recorded human check outstanding) |
| G12 governed citation boundary | HARD | 24 / 20 | `AWAITING_ADJUDICATION` — scan half clean on 24 cases, axis N open |
| **G13 malformed states fail closed** | HARD | **0 / 0** | **NOT_EXERCISED_ZERO_DENOMINATOR** — no declaration was refused, so there was nothing to preserve. **This is not a pass** |
| G14 governed axis coverage | COVERAGE | 0 / 1 | `AWAITING_ADJUDICATION` — achievable via AC-22, which carries all three axes |
| G15 priority floor distribution | MEASUREMENT | 0 / 0 | `AWAITING_ADJUDICATION` |

**Acceptance determination: `NOT_DETERMINABLE — adjudication is incomplete`.**

## 16. ORDINARY-QUALITY OUTCOMES

All seven criteria are `AWAITING_ADJUDICATION`: each is computed from the same recorded verdicts.
No aggregate percentage was invented, and none will be. No ordinary criterion may override a hard
gate in either direction, and if any fails the run records `ORDINARY_QUALITY_NOT_MET` and requires
an explicit advancement disposition.

## 17. HARD-GATE FAILURES

**None recorded — and none can be recorded yet.** Eleven of the thirteen hard gates are awaiting
adjudication; G10 passed; G13 is `NOT_EXERCISED_ZERO_DENOMINATOR`, which is neither a pass nor a
failure. **No hard gate has passed on human evidence, because no human evidence exists yet.**

## 18. PREREGISTRATION DEFECTS

**One, recorded in `PREREGISTRATION-DEFECT-REGISTER-208.md`, and it is NON-MATERIAL.**

`ENTRY 1` — the §207 block-H header states that *"the first pass sees the record text through
`redactCitationTokens`"*. Under the frozen separate-stage architecture the first pass receives **no
governed records at all**; the governed relation crosses on its own call. Discovered **before the
first provider call**, while building the executor.

**The frozen truth was NOT repaired and NOT regraded.** The constraint that sentence produces — that
no case's truth may depend on reading a governed citation — is satisfied *more strongly* under the
real architecture. No frozen expectation, no gate, no denominator and no judgment is affected;
descriptive text on AC-22, AC-23 and AC-24 is. The stale §200 axis names
(`FIRST_PASS_GOVERNED_SOURCE_ID_BINDING`, `FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING`) carry
the same stale locator and are likewise left unrepaired.

## 19. NON-PREREGISTERED DIAGNOSTIC OBSERVATIONS

Recorded separately; **these affect no gate and no acceptance outcome.**

1. **AC-05 produced one admitted fact where the frozen design expected zero.** The instrument gives
   block-B cases no fact-axis slots, so the fact receives none; over-production is measured by row
   axes B and I, which are per row. The declaration and its full content are preserved in the packet.
2. **AC-07 produced two admitted facts where the frozen design expected one.** Same treatment: no
   extra fact slots — that would expand the instrument mid-adjudication, which §208 forbids — and
   the surplus fact is preserved in full. The five fact-axis slots on AC-07 are bound **mechanically
   to produced fact 1 in projection order**, and the slot carries a `pairingNote` telling the
   adjudicator to confirm that correspondence against the frozen truth and re-bind if it differs.
3. **AC-23 produced zero declarations while its `expertHazardCandidates` array carried four
   candidates and its summary describes the ladder hazard at length.** Structurally: hazard
   candidates and unresolved-fact declarations are different outputs, and this row populated one and
   not the other. Whether that is the F1 mechanism — a fact left in prose — is axis A's question and
   is deliberately not answered here.

## 20. D14 EVIDENCE AND RECOMMENDATION

**D14 REMAINS OPEN. No escalation policy was activated, tuned or fitted, and E3 remains
`RECOMMENDED_NOT_AUTHORIZED`.** No option was exercised and `U02` was not used as a fitting target.

**Recommendation: do NOT rule D14 on this slice's evidence, and specifically do not rule it before
adjudication.** Gate G15 is measurement-only and its axis-R denominators are **7 `R_SAFETY` and 4
`R_FLOOR` judgments**, all currently unfilled. §207 wrote that limit into the gate itself so the
figure could not later be quoted as if it carried D14, and that constraint binds now. §204's 7-of-8
`FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE` remains the larger measurement; the correct time to rule
D14 is when the fresh axis-R distribution exists and can be set beside it.

## 21. FILES CHANGED

**New §208-namespaced code** (none of it modifies any §205, §206 or §207 file):

| file | purpose |
|---|---|
| `backend/scripts/preflight-208-acceptance-cohort.ts` | offline preflight, zero cost |
| `backend/scripts/execute-208-acceptance-cohort.ts` | the three-stage executor |
| `backend/scripts/rederive-208-projection.ts` | corrected projection from persisted raw output |
| `backend/scripts/score-208-deterministic.ts` | deterministic scoring, before any human verdict |
| `backend/scripts/build-208-adjudication.ts` | 177-slot worksheet and presentation packet, no prefills |
| `backend/scripts/compute-208-gates.ts` | mechanical gate computation |
| `backend/tsconfig.scripts-208.json` | §208 experiment-scope typecheck |

**Evidence directory** `verification/expert-hazlenz-fresh-cohort-execution-208-2026-09-08/`:
`CALL-LEDGER-208.jsonl` (append-only, leg-aware, 50 records) · `RAW-FIRST-PASS-208.jsonl` ·
`PROJECTION-208.jsonl` (original, preserved) · `PROJECTION-208-CORRECTED.jsonl` ·
`RAW-GOVERNED-208.jsonl` · `RAW-VERIFIER-208.jsonl` ·
`RAW-VERIFIER-208.ABORTED-ATTEMPT-1.jsonl` (preserved) · `DETERMINISTIC-SCORING-208.json` ·
`ADJUDICATION-WORKSHEET-208.json` · `ADJUDICATION-PRESENTATION-PACKET-208.md` ·
`GATE-RESULTS-208.json` · `EXECUTOR-DEFECT-REGISTER-208.md` ·
`PREREGISTRATION-DEFECT-REGISTER-208.md` · this report.

### THREE EXECUTOR DEFECTS — REPORTED, NOT ABSORBED

All three are defects in the **§208 harness**. None is a model, contract, transport or truth defect.
Full text in `EXECUTOR-DEFECT-REGISTER-208.md`.

**Defect 1 — first-pass projection called with a non-empty supplied governed set.**
`projectDeclaredOwedFacts` infers *capability present* from a non-empty supplied set and then
demands a `governedEvidenceSourceIds` array. The §208 first pass is capability-ABSENT on every case
and is structurally forbidden from producing that field. On **AC-22** this refused the row's only
declaration — which carried all eleven required fields correctly — with
`GOVERNED_SOURCE_IDS_NOT_AN_ARRAY`. Left uncorrected it would have presented a
`PLAUSIBLY_LIFE_CRITICAL` case as a total owed-fact loss attributable to the model or the contract.
It belonged to neither. **Corrected by re-deriving the projection from the persisted raw output with
`suppliedGovernedSourceIds: []`; zero provider calls; the original file preserved byte-untouched;
exactly one case changed (AC-22: admitted 0→1, refused 1→0) and the other 23 are bit-identical.**

**Defect 2 — verifier tool transmitted in Anthropic strict mode.** §199 executed the verifier leg
8/8 at HTTP 200 with `input_schema: VERIFIER_V3_2_RESPONSE_SCHEMA` and **no** `strict` flag; the
§208 executor set `strict: true` on every leg. The provider rejected the strict wrapper, not the
schema. **Corrected by transmitting the verifier tool exactly as §199 did. THE VERIFIER RESPONSE
SCHEMA, SYSTEM PROMPT AND ADMISSION CONTRACT ARE BYTE-UNCHANGED** — the correction removes a wrapper
the harness added and changes what is *transmitted*, not what is *judged*. Cost of the defect: one
ledger entry at USD 0.00.

**Why this was not treated as the run-void condition.** The frozen `TRANSPORT_STRUCTURAL` rule
exists for a provider refusing the *intended* artifact — the §199 `COMPILED_GRAMMAR_TOO_LARGE`
shape, which no correct harness could avoid. Here the intended artifact is *known acceptable to this
provider* and the harness sent something else. Voiding an acceptance run over a harness wrapper
would be the §204 error in its other direction: converting a tooling failure into a verdict about
the system under test. **If the product owner disagrees with that classification, the run is void
and this report is the evidence for that decision — the rejected call is preserved in the ledger as
call 26 and the aborted stage file is preserved rather than deleted.**

**Defect 3 — verifier received an empty hazard-candidate block on every call.** The executor read
`fp.hazardCandidates` from the *parsed payload*, where the field is `expertHazardCandidates`;
`hazardCandidates` is §199's *persisted* field name. So all 24 verifier prompts said
`FIRST-PASS ANALYSIS — HAZARD CANDIDATES / (none raised)` when the cohort had raised **49
candidates**. Everything else was supplied correctly — the full observation, the clarifications (25
across 20 cases), the uncertainty, the summary, and the complete owed fact with factKey,
affectedDecision, whyUnresolved, evidence span, both branches and both branch decisions.

**This was NOT corrected by re-running**, because a corrected verifier leg is 24 further calls and
the ledger stands at 50 against a hard ceiling of 57. Manufacturing headroom would be exactly the ad
hoc repair the authorization forbids. **Axis L (13 live slots) and gate G6 therefore rest on a
verifier input of lower fidelity than §199's**, and the disclosure is attached to **every axis-L
slot** in the worksheet so no judgment is formed without it. **Whether G6 can carry a 100 % hard
claim on this evidence is a product-owner decision**; the frozen protocol's own remedy applies — a
bounded replacement, here a 24-call verifier re-run at roughly USD 0.60 under a new authorization.

## 22. REGRESSION AND INTEGRITY RESULTS

| check | result |
|---|---|
| `test-207-preregistration` | **144 passed, 0 failed** (re-run after execution) |
| §205 lib sha256 prefixes (all eight) | **unchanged** — `9e1d7b8743c93462`, `d15655a9bf96ddc7`, `4c350fcac98a48e5`, `53e3ef787782f251`, `dd8b33e1c6dbdaac`, `7ec6216773eb6a13`, `41767bd6f1935c6c`, `dfbe4c962209b802` |
| §207 lib sha256 prefixes (all five) | **unchanged** — `1e9b03e73bc55049`, `8b429cdf6d3e5773`, `23f75ff5bcfe09de`, `fdc4cd2e68d3ddcd`, `2153e6aa32861994` |
| preregistration record on disk | `VERIFIED` — hashes to its own digest and to the source |
| `tsc -p tsconfig.scripts-208.json` | clean — **EXPERIMENT_SCOPE_TYPECHECK (§208)**, not a repo-wide `tsc clean` |

## 23. RESULTING TERMINAL

`EXPERT_HAZLENZ_FRESH_COHORT_EXECUTED — PRODUCT_OWNER_ADJUDICATION_OF_177_JUDGMENTS_REQUIRED`

## 24. RECOMMENDATION FOR EXPERT HAZLENZ ADVANCEMENT

**No advancement recommendation is available, and none should be inferred from this run.**

The frozen acceptance rules are explicit that execution completing is not acceptance, and that a
favourable aggregate impression may not substitute for the gates. **Eleven of thirteen hard gates
have no evidence at all yet.** Every structural result in this report — zero refusals, zero
containment breaches, zero degenerate outputs, a clean provider-authority scan — is consistent with
a system that is working and equally consistent with one whose *semantics* fail on the axes that
matter. Those are precisely the axes no deterministic check may decide, by D08.

**What the product owner should do next, in order:**

1. **Decide the executor-defect classifications**, especially defect 2. If the strict-wrapper
   rejection is ruled a genuine `TRANSPORT_STRUCTURAL` event, the run is void and nothing below
   applies.
2. **Decide whether a bounded 24-call verifier re-run is required** before axis L is adjudicated,
   given defect 3. Doing it *before* adjudication is cheaper than discovering afterwards that G6
   cannot carry its claim — and G6 already has a coverage headroom of one.
3. **Adjudicate the 177 judgments** — incrementally by default, one review unit at a time, against
   the frozen observation, the frozen truth, the actual output and the frozen instructions, with the
   deterministic scoring as evidence and never as a suggested answer. Read the four divergent cases
   (AC-03, AC-05, AC-07, AC-23) and the AC-22 verifier admission refusal with particular care.
4. **Compute the gates** mechanically, then the ordinary-quality criteria, then rule D14, then
   decide advancement.

**No second cohort is authorized and none was run.** No case was regenerated, no failure was tuned
away, and every divergence from the frozen expectation is preserved exactly as it occurred.

---

**TERMINAL:**
`EXPERT_HAZLENZ_FRESH_COHORT_EXECUTED — PRODUCT_OWNER_ADJUDICATION_OF_177_JUDGMENTS_REQUIRED`
