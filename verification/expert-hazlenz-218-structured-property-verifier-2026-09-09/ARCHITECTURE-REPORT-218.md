# §218 — STRUCTURED PROPERTY-SEMANTIC VERIFIER ARCHITECTURE

**Provider calls 0 · Database operations 0 · No customer activation · No commit · No push · No tag ·
No deploy.**

Every figure below is computed by `scripts/build-218-architecture-record.ts` from the live modules,
or printed by `scripts/test-218-structured-property-verifier.ts`. Nothing is transcribed by hand.

---

## 1. §217 EVIDENCE, PRESERVED

Unchanged, unreclassified, and held as data in `expert-218-legacy-compatibility.ts` so the suite
asserts it rather than a prose restatement:

| | |
|---|---|
| HF1 evidence proxy accepted | **2** — K1, K2 |
| HF2 property-invalid routed as clarification | **1** — K2 |
| HF4 sibling nomination | **1** — K4 |
| HF3, HF5, HF6, HF7 | **0** |
| K3 legitimate act-as-property control | **PASS** |
| K4 target property | correctly accepted |
| K4 sibling nomination | attempted by provider, deterministically refused |
| Classification | HF1 = CLASS A · HF2 = CLASS A · HF4 = CLASS B |
| KR-1 | **OPEN** |

The four §217 evidence files are pinned by sha256 in the proof suite and verified UNTOUCHED, the
frozen preregistration digest `99f9f6b8…` among them. No historical result is rewritten, upgraded,
rescored or reclassified.

---

## 2. THE DEFECT §218 ADDRESSES, AS §217 DIAGNOSED IT

§216 wrote its own stopping rule into a constant: if a material property-identity failure survived
the next confirmation, the answer was to be a structured semantic decision step, not more text.
§217 produced that failure twice and named the mechanism.

On K1 and K2 the verifier reached for the **absence-is-the-substantive-adverse-state exception** —
which §216 carries, correctly, for BRANCHES — and used it to answer the **PROPERTY** question:

> K2: *"an absence-shaped branchB is legitimate here because the substantive adverse state IS the
> absence of the calibration check itself"*

Two frames, both applicable-sounding, applied to one case, and the model picked the easier one. A
frame chosen inside free reasoning cannot be inspected. So property identity stops being something
the verifier reasons about on the way to a disposition and becomes something it **declares in closed
enums, before the disposition, in fields the architecture can read**.

---

## 3. WHAT WAS BUILT

Six modules under `backend/scripts/lib/`, one proof suite, one record generator, one scoped
tsconfig. Nothing is wired to production; nothing outside §218 imports any of it.

### 3.1 The contract — `expert-218-property-review-contract.ts`

One top-level object added to the §212 response schema, required, with five required fields:

| field | kind | closed set |
|---|---|---|
| `targetDeclarationId` | mechanical, copied | — |
| `propertySemanticRole` | model semantic | 5 members |
| `propertyValidity` | model semantic | VALID · INVALID · UNCERTAIN |
| `decisionControllingProperty` | model semantic, **advisory** | — |
| `propertyReviewReason` | model semantic | — |

The five roles are `UNDERLYING_SAFETY_STATE`, `REQUIRED_ACT_ITSELF`, `REQUIRED_ARTIFACT_ITSELF`,
`EVIDENCE_FOR_ANOTHER_PROPERTY`, `AMBIGUOUS_OR_UNRESOLVED`. The act and the artifact have their own
members deliberately: a single "not a state" member would have made every certificate and every
briefing look alike, and the architecture would have degenerated into *all records are evidence
proxies*. The evidence member is defined by the counterfactual — remove the evidence from the
scenario and ask whether the underlying condition could still independently be fine or bad — never
by a vocabulary.

**Additive by construction.** Removing `propertyReview` reproduces the §212 schema **byte for byte**
(6,094 bytes both ways, asserted). The builder refuses to load against a drifted base.

`decisionControllingProperty` is verifier-advisory. It never becomes an OwedFact, is never settled,
never reaches customer-authoritative truth, and is never parsed for meaning by deterministic code.
The suite asserts by source inspection that no §218 architecture module imports a fact constructor
or projection.

### 3.2 The consistency layer — `expert-218-property-consistency.ts`

Nineteen codes. The whole decision surface is eleven inputs, every one of them presence, closed-set
membership, exact string equality, or whole-field filler:

```
propertyReview (presence and object shape)
propertyReview.targetDeclarationId       exact string equality only
propertyReview.propertySemanticRole      closed-set membership only
propertyReview.propertyValidity          closed-set membership only
propertyReview.decisionControllingProperty   non-blank and whole-field filler only
propertyReview.propertyReviewReason      non-blank and whole-field filler only
verdict                                  closed-set membership only
owedFactDeclarations[].factKey           exact string equality only
owedFactDeclarations[].declaration       closed-set membership only
owedFactDeclarations[].challengeGround   closed-set membership only
owedFactDeclarations[].propertyMismatchKind  closed-set membership only
```

The filler test is `isNonSemanticFiller` — the §210E R7 rule already in the first-pass projection,
**reused rather than reinvented**. It decides that a field is a non-answer; it does not decide what
an answer means. No keyword classifier exists anywhere in §218.

**Role against validity.** `EVIDENCE_FOR_ANOTHER_PROPERTY` must be `INVALID`;
`AMBIGUOUS_OR_UNRESOLVED` must be `UNCERTAIN`. Both directions are cross-field pairings of two
model-authored enums, not classifications.

**Validity against disposition.**

| validity | required | refused |
|---|---|---|
| INVALID | target declared `CHALLENGE_FACT_VALIDITY`, ground `PROPERTY_IDENTITY_MISMATCH`, kind implied by the role | `VERIFIED_AS_IS` · `ADD_OR_REPLACE_CLARIFICATION` |
| UNCERTAIN | verdict `ABSTAIN` | everything else · challenging identity |
| VALID | ordinary representation and clarification review may proceed | challenging identity |

**Fail closed.** Missing, malformed, placeholder, non-member or internally contradictory: the route
is `FAIL_CLOSED`, the raw output is preserved, the target remains unresolved, no clarification
changes, nothing is settled, and the missing semantic judgement is never inferred.

### 3.3 The instruction — `expert-218-property-instruction.ts`

This is **not** another prompt remediation and §216's stopping rule is honoured in a typed constant:
the primary remedy is `STRUCTURED_OUTPUT_PLUS_DETERMINISTIC_CROSS_FIELD_CONSISTENCY`, and the block
exists only because a new required field with no explanation is a worse instrument than one with an
explanation.

The one thing it says that no earlier block said is the separation §217 diagnosed. The absence rule
is restated **affirmatively first** — an absence-shaped branchB is correct and should be left alone
— and only then bounded: it answers a BRANCH question, and it is not how the PROPERTY question is
decided.

Inserted at one unique anchor immediately before the §216 ladder. Removing it reproduces the §216
prompt **byte for byte** (asserted).

### 3.4 Fixtures, legacy compatibility, readiness

`expert-218-fixtures.ts` (F1–F12 plus three negative controls),
`expert-218-legacy-compatibility.ts`, `expert-218-hosted-readiness.ts`.

---

## 4. SIZE ACCOUNTING

### Schema

| | |
|---|---|
| §212 schema | 6,094 bytes · 38 nodes · 9 enums · 35 enum members |
| §218 schema | 8,247 bytes · 45 nodes · 11 enums · 43 enum members |
| delta | **+2,153 bytes · +7 nodes · +2 enums · +8 enum members** |

The provider's stated refusal metric is COMPILED GRAMMAR COMPLEXITY and the threshold is
undocumented. Two enums of five and three members expand well beyond their serialised length. §199
was refused at ~19,060 first-pass bytes and accepted at ~18,620; the verifier request is a much
smaller request with visible headroom, and **that headroom is the reason this is proposed, not a
claim that it will pass.**

### Instruction

| | |
|---|---|
| §216 prompt | 19,712 characters |
| §218 prompt | 24,210 characters |
| added / removed | **+4,498 / 0** |
| estimated token delta | **~+1,576** |

Estimated at 69,968 / 24,512 bytes per token from the frozen §208 first-pass leg. An estimate, not a
tokenizer result. This is the largest single verifier prompt addition in the programme and is
reported as such: the block explains five new required fields and separates two rules §217 showed
being confused. §216's weld counterfactual and its "a good proxy is still a proxy" paragraph were
dropped from the draft rather than restated, and the suite asserts that each appears exactly once in
the assembled prompt.

---

## 5. FIXTURES — RUN, NOT DESCRIBED

Each fixture is put through the **real** checkers: v3 admission, the §212 vocabulary rule, the §214
scope rule and the §218 consistency layer.

| id | role | validity | outcome | result |
|---|---|---|---|---|
| F1 ultrasonic thickness survey | EVIDENCE | INVALID | challenge | admitted, `PROPERTY_CHALLENGED` |
| F2 LOLER examination certificate | EVIDENCE | INVALID | challenge | admitted, `PROPERTY_CHALLENGED` |
| F3 buried-services briefing | REQUIRED_ACT | VALID | verify | admitted, may proceed |
| F4 confined-space entry permit | REQUIRED_ARTIFACT | VALID | verify | admitted, may proceed |
| F5 temporary edge protection | UNDERLYING_STATE | VALID | verify | admitted, may proceed |
| F6 "is the tank farm adequate" | AMBIGUOUS | UNCERTAIN | abstain | admitted, abstain route |
| F7 INVALID + clarification | EVIDENCE | INVALID | refused | `INVALID_PROPERTY_ROUTED_TO_CLARIFICATION` |
| F8 INVALID + VERIFIED_AS_IS | EVIDENCE | INVALID | refused | `INVALID_PROPERTY_VERIFIED_AS_IS` |
| F9 UNCERTAIN + replacement | AMBIGUOUS | UNCERTAIN | refused | `UNCERTAIN_PROPERTY_NOT_ABSTAINED` |
| F10 LEV, weak question | UNDERLYING_STATE | VALID | replace question | admitted, clarification route open |
| F11 pool chlorine check | EVIDENCE | INVALID | challenge | admitted, `PROPERTY_CHALLENGED` |
| F12 two-fact observation | UNDERLYING_STATE | VALID | refused | `NOMINATION_OUTSIDE_TARGET_SCOPE` |

**8 of 8** compliant outputs admitted by all four layers with zero vocabulary codes. **4 of 4**
refusal fixtures refused, each by the exact code it was built for, from the layer that owns it.

**F11 is the instrument.** A wrong property beside an excellent question about the right underlying
condition — the §215 H2 and §217 K2 shape. The property is declared before the question is reached
and the route to a clarification is refused in code, so a good clarification cannot rescue a bad
property.

**F2 against F4 is the document contrast.** A certificate of thorough examination is a record of a
finding about the hoist; an entry permit is itself the requirement before entry. Same object kind,
different role, opposite outcome. This is what stops the architecture becoming *all records are
evidence proxies*.

---

## 6. NEGATIVE CONTROLS

Three strategies, none reachable from any architecture module (asserted by source inspection):

| control | score on the eight scorable fixtures | fails on |
|---|---|---|
| vocabulary-only role classification | 4 / 8 | F3, F4, F5, F6 |
| clarification-first routing | 4 / 8 | F1, F2, F6, F11 |
| challenge-everything | 3 / 8 | F3, F4, F5, F6, F10 |

No strategy scores full marks, so the fixture set discriminates rather than agreeing with anything.

---

## 7. COMPATIBILITY AND WHAT WAS NOT ADDED

**Verdict set unchanged** — 4 verdicts, 3 owed-fact declarations, 3 challenge grounds, 2 mismatch
kinds, 3 representation concerns. Nothing added to any of them.

> **One naming discrepancy, recorded rather than absorbed.** The authorization lists the existing
> verdict set as `VERIFIED_AS_IS / CHALLENGE_FACT_VALIDITY / ADD_OR_REPLACE_CLARIFICATION /
> ABSTAIN`. In the implemented architecture `CHALLENGE_FACT_VALIDITY` is an **owed-fact declaration**,
> not a verdict; the verdict set is `VERIFIED_AS_IS / ADD_OR_REPLACE_CLARIFICATION /
> NO_CLARIFICATION_REQUIRED / ABSTAIN`. §218 implements the routing against the real structures:
> INVALID requires the `CHALLENGE_FACT_VALIDITY` declaration on the target, and the accompanying
> verdict is the one §216 resolved from the existing set — `ABSTAIN`.

**One §216 refusal is overturned, and recorded as such.** §216 declined to forbid `VERIFIED_AS_IS`
alongside a property-identity challenge, because a challenge addresses the FACT and a verdict
addresses the CLARIFICATION layer, so a rule refusing it would refuse a right answer. That reasoning
applied to an architecture with no structured property decision. With `propertyValidity` explicit,
INVALID and VERIFIED_AS_IS are two statements about the same proposition that cannot both hold.
§216's original reason is preserved verbatim in substance in `SUPERSEDED_REFUSALS_216`.

**Five rules were considered and refused**, including deriving the role from property text when the
model omits it, and checking that `decisionControllingProperty` concerns the target rather than a
sibling. The second is a **stated residual**: sibling containment stays where §214 put it — on the
structured nomination, refused by request shape — and the prose half remains instruction-led,
because comparing two prose statements for topic is a semantic judgement this architecture reserves.

**Legacy.** Exactly one field is mechanical (`targetDeclarationId`, present in the request and
copied); the four judgements are model-authored and are never inferred. A §217-shaped output cannot
be upgraded — the adapter refuses on `SEMANTIC_FIELD_NOT_AUTHORED`, run rather than asserted. Four
adaptation routes are recorded as refused. The reason this matters is concrete: §217 K1's own
rationale reads *"This is a case where the act itself is the required control"* — a confident, wrong
role statement. An adapter that mined prose would have recorded `REQUIRED_ACT_ITSELF` and `VALID`
for a case the frozen truth marks FAIL, and the §218 gate would have passed on manufactured
evidence.

---

## 8. LOCAL HOSTED-READINESS GATE — 16 / 16 YES

Every item answered by calling the real code.

| # | item | evidence |
|---|---|---|
| 1 | `propertySemanticRole` reaches the schema | closed enum of 5, required |
| 2 | `propertyValidity` reaches the schema | closed enum of 3, required |
| 3 | `decisionControllingProperty` reaches output | present, required, advisory |
| 4 | `propertyReviewReason` reaches output | present, required |
| 5 | exact target identity reaches the review | `PROPERTY_REVIEW_TARGET_MISMATCH` fires |
| 6 | INVALID cannot VERIFY_AS_IS | `INVALID_PROPERTY_VERIFIED_AS_IS` |
| 7 | INVALID cannot ADD_OR_REPLACE_CLARIFICATION | `INVALID_PROPERTY_ROUTED_TO_CLARIFICATION` |
| 8 | UNCERTAIN routes ABSTAIN / fail closed | `UNCERTAIN_PROPERTY_NOT_ABSTAINED`; abstain route admitted |
| 9 | legitimate `REQUIRED_ACT_ITSELF` can pass | may proceed |
| 10 | legitimate `REQUIRED_ARTIFACT_ITSELF` can pass | may proceed |
| 11 | correct `UNDERLYING_SAFETY_STATE` can pass | may proceed |
| 12 | evidence proxy challenged with existing vocabulary | 3 grounds, 2 kinds, 3 concerns — unchanged |
| 13 | unresolved / adverse distinction preserved | §212 three-worlds section carried unchanged |
| 14 | sibling containment preserved | `NOMINATION_OUTSIDE_TARGET_SCOPE`; §214 reads its 6 inputs, unchanged |
| 15 | provider cannot settle | `CHALLENGE_CLAIMS_TO_SETTLE_THE_FACT` |
| 16 | historical frozen evidence unchanged | `LEGACY_OUTPUT_MAY_NOT_BE_UPGRADED` |

**What a clean gate does NOT mean.** It means the architecture can represent the required decision,
refuse the prohibited shapes and preserve what §212, §214 and §216 established. It establishes
**nothing** about whether a provider will classify a property correctly under the new
representation. That is precisely the open question.

---

## 9. REGRESSION — 24 SUITES, 1,847 ASSERTIONS, 0 FAILURES

Provider calls 0. Database operations 0.

| suite | result |
|---|---|
| §201 governed binding stage | 59 / 59 |
| §201 owed-property representation | 59 / 59 |
| §201 verifier vNext candidates | 216 / 216 |
| §201 harness hardening | 67 / 67 |
| §203 boundary guards | 52 / 52 |
| §203 grammar identity | 45 / 45 |
| §203 identity collision | 63 / 63 |
| §203 schema-closure red team | 107 / 107 |
| §210J epistemic schema remediation | 98 / 98 |
| §211 verifier validation design | 74 / 74 |
| §212 verifier architecture remediation | 99 / 99 |
| §212 projection ancestry | PASS |
| §214 verifier semantic remediation | 68 / 68 |
| §215 preregistration | 45 / 45 |
| §216 disposition remediation | 70 / 70 |
| §217 preregistration | 43 / 43 |
| **§218 structured property verifier** | **113 / 113** |
| verifier v3 binding protocol | 49 / 49 |
| verifier v3.1 remediation | 69 / 69 |
| v3 development integration | 40 / 40 |
| §202 authority boundary guards | 83 / 83 |
| unsupported settlement | 129 / 129 |
| clarification settlement | 148 / 148 |
| authority merge | 51 / 51 |

Experiment-scope typecheck `tsconfig.scripts-218.json`: clean. Reported as
EXPERIMENT_SCOPE_TYPECHECK (§218), never as `tsc` clean.

§213 has no local suite; it was a hosted execution and its evidence is pinned instead.

---

## 10. RECOMMENDED FINAL STRUCTURED CONFIRMATION — NOT AUTHORIZED, NOT FROZEN, NOT EXECUTED

**5 new cases · 5 verifier calls · 0 executed in §218.**

| case | mechanism | required | hard gate if wrong | local fixture |
|---|---|---|---|---|
| A1 | evidence proxy, latent physical state | EVIDENCE / INVALID / challenge | evidence proxy accepted | F1 |
| A2 | evidence proxy, document or certificate | EVIDENCE / INVALID / challenge | evidence proxy accepted | F2 |
| A3 | legitimate required act | REQUIRED_ACT / VALID / left alone | legitimate act challenged | F3 |
| A4 | legitimate required artifact | REQUIRED_ARTIFACT / VALID / left alone | legitimate artifact challenged | F4 |
| A5 | correct underlying safety state | UNDERLYING_STATE / VALID / left alone | correct state challenged | F5 |

Three of the five must be left alone, so a challenge-everything verifier cannot pass the set. The
five observations are **not authored here**; authoring, freezing and digesting them is the next
slice under its own authorization. No §213, §215 or §217 observation may be reused as a scored case.

### Projected cost and hard ceiling

Projected from §217 **measured** tokens (median 11,600 in / 1,155 out per call, $2.00 per million
input and $10.00 per million output) plus the **measured** §218 prompt delta (+1,576 tokens) and
schema delta (+754 tokens), with a stated allowance of 160 output tokens for the five new fields.

| | |
|---|---|
| calls | 5 |
| projected tokens per call | 13,930 in / 1,315 out |
| **projected spend** | **USD 0.2051** |
| **hard ceiling** | **USD 0.28** |
| retries authorized | 0 |

35% headroom, the basis §211 and §214 used and §213, §215 and §217 all stayed inside. A projection,
not a production cost claim.

### Future hard gates — zero occurrences, no aggregate compensation

evidence proxy accepted as a valid property · INVALID property routed to clarification-only
correction · legitimate act wrongly challenged · legitimate artifact wrongly challenged · correct
underlying state wrongly challenged · target-binding violation · sibling escape ·
unresolved-to-adverse collapse · provider settlement-authority violation.

No aggregate percentage is reported and no gate may be offset by another or by a quality score.

---

## 11. STOPPING RULE

**§218 is the final standalone verifier architecture intervention.**

If the five-call structured confirmation still produces a material evidence-proxy property
misclassification:

- do **not** return to prompt tuning;
- do **not** add another verifier gate;
- do **not** automatically add another architecture layer.

Report instead that the remaining defect appears to be **provider semantic classification capability
under the explicit representation**, and the product owner decides between:

**A.** existing human review and fail-closed controls are sufficient for the supported scope;
**B.** an independent non-provider safety control is required;
**C.** the provider or model is not yet capable enough for the intended Expert role.

---

## 12. LIMITS

- This is a recommendation, not a preregistration. Nothing is frozen by sha256 for execution.
- The local gate establishes representability and refusal. It establishes nothing about hosted
  classification behaviour.
- KR-1 remains **OPEN**. No §213, §215 or §217 result is reclassified.
- Sibling containment on `decisionControllingProperty` prose is instruction-led and is a stated
  residual, not a deterministic guarantee.
- No protocol version is claimed. A version number is earned by a preregistered hosted run, and
  §218 has made none.
- Nothing in §218 is reachable from a production or customer path.

---

**TERMINAL:
`EXPERT_HAZLENZ_STRUCTURED_PROPERTY_VERIFIER_IMPLEMENTED — FINAL_STRUCTURED_VERIFIER_CONFIRMATION_AUTHORIZATION_REQUIRED`**
