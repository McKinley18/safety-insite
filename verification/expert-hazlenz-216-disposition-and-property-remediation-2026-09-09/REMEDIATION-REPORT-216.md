# §216 — TARGETED VERIFIER DISPOSITION AND PROPERTY-IDENTITY REMEDIATION

**Scope executed.** Provider calls 0. Database operations 0. No schema change. No new verdict. No
first-pass change. No §215 rerun. No customer or production activation. No commit, push, tag or
deploy.

**Terminal reached.**

```
EXPERT_HAZLENZ_VERIFIER_DISPOSITION_AND_PROPERTY_REMEDIATION_IMPLEMENTED —
FINAL_MINIMAL_VERIFIER_CONFIRMATION_AUTHORIZATION_REQUIRED
```

No structural conflict was discovered. The verdict vocabulary already contains the member a property
challenge needs, and the disposition inconsistency turns out to be structurally closed already.

**Stated first: KR-1 remains OPEN.** Local fixtures show the required disposition is representable
and that a clarification-first strategy fails on the cases built for it. Nothing here is hosted
evidence, and no §215 result is reclassified.

---

## 1. THE STRUCTURAL REVIEW — AND ITS ANSWER

§216 asked whether the structured contract can enforce any part of disposition consistency without
semantic inference, naming the example: a property-identity ground ought to be incompatible with
routing the same target through a clarification replacement.

**It already is, and no new rule was added.** Running the real checkers, every route by which an
output could declare `CHALLENGE_FACT_VALIDITY` on the target and also propose a clarification for
that target is refused today:

| Route | Refused by |
|---|---|
| a proposal with no `clarificationSourceMode` | v3 — `SOURCE_MODE_MISSING_ON_A_CLARIFICATION` |
| `SUPPLIED_FACT` with no binding key | v3 — `BINDING_KEY_MISSING_FOR_SUPPLIED_MODE` |
| `SUPPLIED_FACT` bound to the challenged target | v3 — `BOUND_DECLARATION_DISAGREES_WITH_BINDING_KEY` |
| `NOMINATED_FACT` plus a nomination | §214 — `NOMINATION_OUTSIDE_TARGET_SCOPE` |

The matrix is **computed by calling `checkVerifierV3Output` and `checkScopeContainment`**, not
described, so a later contract change that reopened the hole fails the suite.

**What this means for R-V4.** The §215 defect is not that the contract permits an inconsistent
disposition. It is that the verifier never declared the mismatch: H1 and H2 emitted
`BOUND_BY_CLARIFICATION` with `challengeGround: null`, which is structurally identical to a
legitimate clarification replacement. Separating the two means deciding whether the property is
wrong, which is the model's job. **R-V4 is therefore instruction-led, and the structural layer's
contribution is that the wrong route is already shut once the ground is declared.**

**Three candidate rules were considered and refused.** The sharpest: forbidding `VERIFIED_AS_IS`
alongside a property challenge. A challenge addresses the fact and the verdict addresses the
clarification layer, so the combination may be correct, and a rule refusing it would refuse a right
answer. The instruction resolves the ambiguity instead.

### Which verdict accompanies a property challenge

Resolved from the **existing** vocabulary, so no verdict is added. `VERIFIED_AS_IS` asserts the first
pass asked the right question, which is false when the fact is under challenge.
`NO_CLARIFICATION_REQUIRED` asserts the unknown does not change what is done today, a different
claim. **`ABSTAIN` is documented as asserting nothing**, and a verifier that thinks the fact is about
the wrong thing genuinely cannot say which clarification is right until that is arbitrated. The block
names it.

---

## 2. R-V4 — THE ORDERED LADDER

```
1. IS THE PROPERTY ITSELF THE RIGHT ONE?   if not → CHALLENGE, ground, kind, ABSTAIN, STOP HERE
2. THE PROPERTY IS RIGHT                    branches and decisions aligned? → representation concern
3. FIELDS SOUND                             does the bound question settle THAT property? → replace
4. OTHERWISE                                VERIFIED_AS_IS
```

Each step is reached only if the one before it passed, and step 1 ends the decision:

> DO NOT propose a question for a fact whose property you have just said is the wrong property. A
> better question does not make a wrong fact right; **it hides it**.

---

## 3. R-V5 — THE PROPERTY-IDENTITY STANDARD

§215 H1 called its evidence proxy *"a reasonable proxy for the real underlying safety property"* and
kept it. §214's role test asked whether the condition survives the artifact; H1 answered that
correctly and then treated a good proxy as good enough. The successor adds the missing half.

> **THE PROPERTY TEST. Two questions, and the property has to pass BOTH.**
>
> ONE. If you knew this proposed property with certainty, would that ANSWER the safety question in
> front of you? Not narrow it. Not make it likely. Answer it.
>
> TWO. Could this proposed property be satisfied, or be absent, while the condition the decision
> really turns on is independently fine or independently bad?

And the standard §215 exposed, refused by name:

> **AND A GOOD PROXY IS STILL A PROXY.** Evidence can be highly probative. It can be legally
> required. It can be the only practical way anyone would ever find out. None of that makes it the
> thing whose truth decides. "A reasonable proxy", "the usual proof", "the available documentation"
> and "the practical test" are all descriptions of EVIDENCE.

**The act-as-property case is inside the test, not beside it.** Knowing the briefing was held *does*
answer the safety question, because the doing of it is the requirement, so an act property passes
both halves. The unchanged "you must not spend it" paragraph follows immediately.

---

## 4. PROMPT SIZE

| | |
|---|---:|
| Removed | **3,222 chars** across 39 lines |
| Added | **3,917 chars** across 47 lines |
| **Net vs §214** | **+698 chars** |
| **Estimated net tokens** | **~+245** |
| Net vs v3.2 | +6,714 chars, ~+2,352 tokens |

Block 93 → 104 lines. **47% of §214's non-blank lines carried verbatim**, measured by line diff
rather than asserted. More than half the block was rewritten to gain 698 characters, which is the
tightening the authorization asked for rather than an append. The §214 block is superseded, not
followed: removing the §216 block reproduces the v3.2 prompt byte for byte.

Sections carried verbatim are the ones §215 proved worked — the three worlds, the branches concern,
the unresolved-action concern, the challenge-is-a-request paragraph and the two decisionWhileUnresolved
must-nots. §215 H3 passed on that exact wording and it is not reopened.

---

## 5. SIBLING SCOPE

**The §214 deterministic rule is not weakened.** Its four §215 refusals are evidence the structural
containment layer worked, and the suite asserts the rule is intact. What changed is the instruction
side: the sibling paragraph was merged into the authority paragraph, saving lines, and now says to
name the sibling **marked as outside the scope of this review** rather than only permitting a
mention. Raising one as a new fact, or offering a question that settles it instead of this one,
remains refused.

---

## 6. LOCAL FIXTURES

Eight fixtures covering the eight required shapes. All required dispositions representable in the
**unchanged** §212 vocabulary.

| | Shape | Property | Question | Required | Ladder |
|---|---|---|---|---|---|
| F1 | wrong property, **good** question | wrong | settles | CHALLENGE | 1 |
| F2 | correct property, bad question | right | does not settle | ADD_OR_REPLACE | 3 |
| F3 | correct property, correct question | right | settles | VERIFIED_AS_IS | 4 |
| F4 | proxy that is required and practical | wrong | settles | CHALLENGE | 1 |
| F5 | act is the property | right | settles | VERIFIED_AS_IS | 4 |
| F6 | two-fact row, sibling in prose | right | settles | VERIFIED_AS_IS | 4 |
| F7 | ground plus a clarification route | — | — | STRUCTURALLY REFUSED | — |
| F8 | branchB absorbs the unresolved world | right | settles | flag branches | 2 |

**F1 is the instrument.** It pairs a wrong property with a question good enough to settle the
underlying condition. A verifier reasoning from the question sees nothing wrong — which is exactly
the §215 H1 and H2 route. Only the ordered ladder gets it right.

F2 and F3 share a property and differ only in the question. F1 and F3 differ only in the property.

### The demonstration

A **clarification-first strategy** — decide from the question alone, accept if it settles the
controlling property, otherwise replace it — was run over the set as a negative control. It is
unreachable from any architecture path and the suite asserts that.

It gets **3 of 7 wrong**: `F1`, `F4` and `F8`. It gets F2 and F3 right. The cases it fails are
exactly the property-identity and branch cases, which is the point: **only the ordered ladder
separates a bad property from a bad question.**

---

## 7. NON-GOALS HONOURED

No verdict, ground, mismatch kind or concern added. Schema unchanged and no §216 module builds or
patches one. No module imports first-pass semantics, `OwedFact` or the settlement path. No keyword
classifier in any architecture module. The verifier is not turned into a second first pass — *another
fact is another review*, and no replacement-property field exists.

---

## 8. PROCESS STOPPING RULE

Recorded as a typed constant. **This is the final authorized verifier instruction-remediation
cycle.** If a material property-identity failure survives the next confirmation, the answer is to
determine whether the verifier needs an explicit structured semantic decision step — not another
prompt remediation. That prevents another recursive prompt-and-probe loop.

---

## 9. REGRESSION

| Suite | Result |
|---|---|
| `test-201-owed-property-representation` | 59 / 59 |
| `test-201-governed-binding-stage` | 59 / 59 |
| `test-201-verifier-vnext-candidates` | 216 / 216 |
| `test-201-harness-hardening` | 67 / 67 |
| `test-202-governed-binding-stage` | 54 / 54 |
| `test-203-boundary-guards` | 52 / 52 |
| `test-205-remediation` | 92 / 92 |
| `test-207-preregistration` | 144 / 144 |
| `test-209-batch-recorder` | 116 / 116 |
| `test-210b1-structural-remediation` | 55 / 55 |
| `test-210i-epistemic-representation` | 58 / 58 |
| `test-210j-epistemic-schema-remediation` | 98 / 98 |
| `test-211-verifier-validation-design` | 74 / 74 |
| `test-212-verifier-architecture-remediation` | 99 / 99 |
| `test-214-verifier-semantic-remediation` | 68 / 68 |
| `test-215-preregistration` | 45 / 45 |
| `test-216-disposition-remediation` | **70 / 70** |
| `verify-212-projection-ancestry` | PASS |

**Total: 0 failures. Zero provider calls in any suite.** Scoped typecheck
`tsc --noEmit -p tsconfig.scripts-216.json` clean; report as `EXPERIMENT_SCOPE_TYPECHECK (§216)`.

`verify-203-source-integrity` remains a historical CLASS-1 gate exiting non-zero by design, per the
accepted PM-1 state.

## 10. EVIDENCE INTEGRITY

§215's seven raw records, frozen digest `a6077949…` and adjudicated tallies `HF-A (×1), HF-D (×4)`
are byte-unchanged. §213's eleven raw records and the frozen §211 digest `3d325fd3…` likewise. The
§214 instruction is preserved and still reachable, so the §215 execution stays attached to the
protocol that produced it.

---

## 11. RECOMMENDED FINAL MINIMAL CONFIRMATION

**A recommendation, not a preregistration.** The four observations are deliberately not authored
here; that is the next slice under its own authorization.

| | Mechanism | Residual | Required outcome |
|---|---|---|---|
| K1 | evidence proxy for a latent physical state | R-V5 | challenge, no clarification for that fact |
| K2 | wrong property beside a tempting better clarification | R-V4 | challenge at step 1, not a replacement |
| K3 | legitimate act-as-property | control | left intact |
| K4 | two independent facts | R-V3 | target alone, sibling in prose only |

**Four cases, four calls.** Each is backed by a local fixture that passes: K1↔F4, K2↔F1, K3↔F5,
K4↔F6.

**No fifth case is recommended, and the analysis is given rather than assumed.** §216 permits one
only if K1–K4 cannot non-degenerately test restraint. They can, twice: K3 must be left alone and
K4's target must be left alone, so a challenge-everything strategy scores 2 of 4 and the gates catch
it.

| | Value |
|---|---:|
| Projected cost | USD 0.1578 |
| Recommended ceiling | USD 0.22 |
| Retries | 0 |

Projected from §215's **measured** tokens plus the measured §216 block delta.

Seven zero-occurrence gates, no aggregate compensation. No §215 observation may be reused as a scored
case.

---

## 12. WHAT THIS SLICE DOES NOT ESTABLISH

- Nothing about hosted behaviour. No provider was called.
- **KR-1 remains OPEN and is not relabelled.**
- No §215 result is reclassified. H1's HF-A and the four HF-D occurrences stand as adjudicated.
- No production readiness. First-pass status remains
  `DEVELOPMENT_FROZEN_WITH_KNOWN_VERIFIER-CARRIED_RISK`; Expert HazLenz remains **NOT ACCEPTED FOR
  PRODUCTION**.

## FILES ADDED

```
backend/scripts/lib/expert-216-disposition-remediation.ts
backend/scripts/lib/expert-216-disposition-closure.ts
backend/scripts/lib/expert-216-fixtures.ts
backend/scripts/lib/expert-216-hosted-recommendation.ts
backend/scripts/test-216-disposition-remediation.ts
backend/scripts/emit-216-record.ts
backend/tsconfig.scripts-216.json
```

Nothing was modified.

## THE DECISION THIS PUTS TO THE PRODUCT OWNER

Authorize the final minimal confirmation: four new case shapes, four verifier calls, ceiling
USD 0.22, observations authored and frozen in that slice before the first call. If a material
property-identity failure survives it, the stopping rule applies.
