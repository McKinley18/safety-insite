# §210D — MINIMAL RESIDUAL-REMEDIATION HOSTED CONFIRMATION, PREREGISTERED

**`EXPERT_HAZLENZ_210D_MINIMAL_CONFIRMATION_PREREGISTERED — PRODUCT_OWNER_HOSTED_EXECUTION_AUTHORIZATION_REQUIRED`**

Provider calls: **0**. Database operations: **0**. Not executed. No customer or production
activation. No commit, push, tag or deploy.

| | |
|---|---|
| Artifact | `CONFIRMATION-PREREGISTRATION-210D.json` |
| SHA256 | `55510f9cc4e9424d543332e1c2f5db5a86d26757adba28d21730cc882420f30f` |
| Cases | 5, all capability-ABSENT |
| Evaluation questions | 21 |
| Expected declarations across the probe | 5 |
| Projected spend | USD 0.3916 |
| Recommended hard ceiling | **USD 0.55** |

Regenerate with `npx ts-node -T scripts/build-210d-confirmation-preregistration.ts` from `backend/`.

Once presented for review this file is not edited. A truth defect found later is recorded as a
`PREREGISTRATION_DEFECT` beside the frozen text, never silently repaired.

---

## Instruction under test

| | |
|---|---|
| Version | `hazlenz.expert.first-pass-instruction.210c-R1-R3` |
| Plain identity | `b243c323af82031c6f733af80f456c4bc61d52efafd89b5c25806a5d8a83b0e6` |
| Governed identity | `f386a198b960991104cf9631b7877921038eccc127c59bc122d4a923a1ec8048` |
| Plain byte length | 49,164 B (49,130 chars) |
| Governed byte length | 50,501 B (50,467 chars) |
| Estimated plain tokens | ~17,212 |
| Estimated governed tokens | ~17,681 |

Both identities were computed locally from the built prompts, not copied from the abbreviated
values in the authorization; the full digests confirm those abbreviations.

**The governed variant is frozen for the record but is not transmitted.** Every §210D case is
capability-ABSENT, so only `b243c323…` reaches the provider.

Token figures are estimates from the §208 ratio of 69,968 body bytes to 24,512 input tokens. They
are derived from real cohort data and are **not tokenizer results**.

## The five cases

| Case | Primary target | Setting | Expected declarations |
|---|---|---|---:|
| **D1** | Gate 1 / R1 | Pressroom — light curtain separation distance after a clutch and brake change | 1 |
| **D2** | Gate 2 / R2 | Grey-iron foundry — relined ladle preheat before tapping | 1 |
| **D3** | Gate 3 / R3 vs Gate 2 | Plant hire yard — unknown overhead line voltage behind an over-specified barrier | **0** |
| **D4** | Protected: independent facts | Underground development heading — unscaled ground and a short ventilation duct | 2 |
| **D5** | Protected: present state + restraint | Blast enclosure — which compressor actually feeds the air-fed helmet | 1 |

**D1** carries one property with two necessary elements — the press's actual stopping performance
since the brake change, and the separation distance the curtain is mounted at — with a two-year-old
measurement card sitting beside it as check-history bait. Both failure modes are frozen separately:
an incomplete property, and the destructive repair that reaches agreement by cutting the branches
down instead.

**D2** places a fact the model is very likely to *ask* about (is the relined ladle dry) beside a
louder condition the text already settles (the pour route is wet). Declaring the loud one instead of
the asked one is the observable R2 failure. The frozen truth requires the dryness question to be
**bound** to a dryness declaration, and states explicitly that the fact may not survive only as a
clarification, a hazard candidate, narrative, or branch language belonging to another declaration.

**D3** is the direct Gate-2/Gate-3 opposition test. The line voltage is genuinely unknown and
genuinely safety-related, so a clarification about it is expected and acceptable. But the barrier
already stands further back than the exclusion distance required for the highest voltage in use
anywhere in the country, and the telehandler cannot reach the conductors from outside it — so today's
action is identical under every answer. A crane lift planned next month is available as tempting
future divergence. Expected: **zero declarations**.

**D4** protects the PB-04 behaviour without replaying it. Loose ground and face ventilation need
different evidence, are independently settleable, and change different actions today. Neither is a
conjunct of the other.

**D5** is the counterweight to D3, and the reason the pair exists. It carries one genuinely owed
present-state property — which compressor the helmet is actually fed from while blasting now — and
one attractive decision-neutral unknown, the night-shift operative's training. A model that passed
D3 by becoming reluctant to declare anything fails D5.

None replays PB-01 … PB-08, and none is a noun-substituted rewrite of one. The builder refuses any
observation carrying PB vocabulary or evaluation labels, and those detectors were negative-tested
against synthetic bad input before the freeze.

## Axes

Nine axes, relabelled for this confirmation. `PASS` / `FAIL` only. `NOT_APPLICABLE` only where
frozen here, before execution. No partial credit, no aggregate compensation.

| Axis | Name | Exercised on | Probed by |
|---|---|---|---|
| A | REQUIRED_FACT_RECALL | D1, D2, D4, D5 | D1.Q6, D2.Q1, D4.Q1, D5.Q1 |
| B | FALSE_GAP_RESTRAINT | all five | D1.Q5, D2.Q3, D3.Q2, D5.Q3 |
| C | EXACT_PROPERTY | D1, D2, D4, D5 | D1.Q1, D2.Q4, D5.Q2 |
| D | CONJUNCT_QUALIFIER_COMPLETENESS | D1, D2, D4, D5 | D1.Q2 |
| E | PROPERTY_REASONING_CONSISTENCY | D1, D2, D4, D5 | D1.Q3, D1.Q4 |
| F | CLARIFICATION_DECLARATION_BINDING | all five | D2.Q2, D4.Q4 |
| G | CURRENT_ACTION_COUNTERFACTUAL_RESTRAINT | all five | D3.Q1, D3.Q3, D5.Q4 |
| H | INDEPENDENT_FACT_PRESERVATION | D4 | D4.Q2 |
| I | FACT_LOCAL_DECISION_CONTAINMENT | D4 | D4.Q3 |

## The two questions that carry this slice

**Gate-interaction pair — D3.Q1 and D5.Q4. Both must pass.**

> D3.Q1 — Did Gate 3 correctly prevent a decision-neutral clarification from becoming an owed
> declaration, despite Gate 2's pressure to give decision-critical questions a declaration home?
>
> D5.Q4 — Did the system suppress the decision-neutral unknown while still emitting the separate
> genuinely decision-critical present-state property?

D3 alone can be passed by a model that declares nothing. D5 alone can be passed by a model that
declares everything. **Only the pair distinguishes correct behaviour from either degenerate
strategy**, and that is the primary evidence that §210C did not solve false-gap behaviour by
globally suppressing declarations.

**Destructive-repair question — D1.Q4.**

> Did `missingFact` become semantically complete while the already-correct branch and clarification
> semantics remained intact?

FAIL if apparent consistency was achieved by deleting a required conjunct or qualifier from
`branchA`, `branchB`, the clarification, or the decision divergence. This is the specific risk §210C
introduced by telling the model to make the property and its reasoning agree.

## Pass rule

Every exercised question must PASS.

- One substantive failure → **`EXPERT_HAZLENZ_RESIDUAL_SEMANTIC_REMEDIATION_REQUIRES_REVIEW`**
- Clean → **`EXPERT_HAZLENZ_RESIDUAL_FIRST_PASS_DEVELOPMENT_CONFIRMED — TARGETED_VERIFIER_VALIDATION_REQUIRED`**

This remains DEVELOPMENT evidence. It is not Expert HazLenz acceptance, not production validation,
not an accuracy percentage, and not proof of G6 verifier remediation.

## Call plan and cost

Five FIRST_PASS calls maximum, exactly one draw per case. No verifier calls, no governed-stage
calls, no semantic retries, no rescue calls, no replacement cases, no post-output truth edits, no
database operations. A structural rejection is recorded and not re-drawn.

**Caching: `CACHING_DISABLED`**, per TBR-20. The provider cache prefix is ordered tools → system →
messages and this architecture sends a per-case tool schema, so the stable system prompt can never
be read across cases. Caching may be enabled only if new local evidence proves a readable ordered
prefix before execution.

| Quantity | Value |
|---|---|
| §210B-3B measured median input | 24,034 tokens |
| §210C measured static delta | +2,858 chars, ~+1,001 tokens |
| Projected input per call | 25,035 tokens |
| Projected output per call | 2,824 tokens (§210B-3B median) |
| **Projected spend** | **USD 0.3916** |
| Worst case, all five at the 4,000-token allowance | USD 0.4604 |
| **Recommended hard ceiling** | **USD 0.55** |

The ceiling sits above the worst case so all five frozen cases can complete without it forcing a
stop. No case was cut, no output limit reduced and no context removed to lower the figure.

## S6 and the governed limit

S6 remains **NOT_EXERCISED**. §210D does not attempt to validate it. The capability-PRESENT
first-pass grammar is refused by the provider, which is a separate structural transport issue. The
architectural recommendation stands: **retain the separate governed stage**, and do not weaken
first-pass grammar validation to make governed evidence fit.

## Integrity at freeze

| | |
|---|---|
| §210B-3A preregistration | `7b2e292f5fc2ddd61368b4adc8f4416c11b1925ecd514a589169f0118fec20b5` |
| §210B-3B call ledger | `4eacfd832cc23b4444d5f9061504fb17c01fa21e897871ff65eabd0a94809943` |
| Pinned v15 prompt | `bfe564c25515cabf5149d9629aa9aa58ea2287dd8691dc338a2f9ec47fd0f694` |

| Suite | Result |
|---|---|
| §207 preregistration | 144 passed, 0 failed |
| §209 batch recorder | 116 passed, 0 failed |
| §210B-1 structural | 55 passed, 0 failed |
| §210B-2 semantic | 36 passed, 0 failed |
| §210C residual | 92 passed, 0 failed |
| **Total** | **443 passed, 0 failed** |

No historical evidence was modified.

## STOP

The preregistration is frozen and hashed. §210D was **not executed**. Execution requires a separate
product-owner authorization.
