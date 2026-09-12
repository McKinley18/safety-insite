# §188 — REQUIRED structured verifier: bounded remediation review

**2026-09-06 · no-provider-call review of the completed §187A / §187B validation**

```
PROVIDER_CALLS        = 0
DATABASE_OPERATIONS   = 0
PRODUCT_RUNTIME_CHANGES = 0
PROMPT_CHANGES        = 0
SCHEMA_CHANGES        = 0
VERIFIER_CONTRACT_CHANGES = 0
COMMIT / PUSH / TAG / DEPLOY = NOT PERFORMED
SOURCE_INTEGRITY_GATE = PASS 12/12
```

---

## Terminal

```
EXPERT_HAZLENZ_REQUIRED_STRUCTURED_VERIFIER_ADJUDICATION_INCONCLUSIVE —
EVIDENCE_REVIEW_REQUIRED
```

**Why this terminal and not one of the other two.** Both alternatives are conditioned on the human
semantic adjudication having been performed: one requires that it "passes every frozen semantic
gate", the other that it "demonstrates a … semantic defect". Neither antecedent is satisfied,
because the adjudication has not been performed and this model may not perform it.

The frozen §187A preregistration — written before the first provider call, byte-unchanged, and which
the §188 authorization directs be followed exactly and not improvised upon — assigns every strict
semantic axis to human judgement and states in terms: **"This model does not decide them."** The
§187B review packet repeats it: "This model did not supply a verdict on any of the ten axes **and
must not.**" The adjudication therefore cannot be completed reproducibly *from the frozen
instrument alone*: the instrument demands an input it forbids this model to supply.

What is required next is a human review of the evidence package assembled here — hence
`EVIDENCE_REVIEW_REQUIRED`. Everything §188 authorized that does not depend on those verdicts is
complete.

**The historical §187B terminal is NOT modified.** It stands as issued:
`EXPERT_HAZLENZ_REQUIRED_STRUCTURED_VERIFIER_BEHAVIOR_FAILED — REMEDIATION_REVIEW_REQUIRED`. The
mechanical contract gate failed, that failure is determinable without adjudication, and nothing in
this review disturbs it.

---

## Verifier-v3 is not validated

Stated plainly, because a long list of green checks below could imply otherwise. The REQUIRED
structured verifier path is **not** validated. One hard gate failed mechanically; the gate that
carries the actual behavioural claim is `UNMEASURED`. No customer activation, no production change,
no acceptance.

---

## 1. What was already established, and is preserved unchanged

| | |
|---|---|
| §187A first-pass stimuli | 5 / 5 completed and frozen, all normalized VALID |
| §187A verifier attempts | 15 attempted, 15 HTTP 400 credit rejections, **0 behavioural executions** |
| §187B behavioural executions | **15 / 15** |
| provider errors among the behavioural cohort | **0** |
| pre-resume integrity | **12 / 12 PASS** |
| §187B actual provider spend | $0.27927 |
| cumulative actual §187A + §187B | **$0.54182** |
| `FIRST_PASS_STIMULUS_CONFOUND` | **MINOR** — classified before verifier spend, **not reclassified** |
| §179 | `HISTORICAL_FIRST_PASS_SILENCE_EVIDENCE` only; never a contemporaneous control, never combined into one score |

The fifteen §187A credit rejections remain **attempt history** and count as zero behavioural
replicates. Only the §187B fifteen are the behavioural cohort.

## 2. The harness admission defect, and its correction

The §187B harness passed the provider tool payload straight to `checkVerifierV3Output` without the
HazLenz-owned envelope fields `verifierContractVersion` and `analysisId`.
`VERIFIER_V3_RESPONSE_SCHEMA` deliberately never asks the model for them, so they can never be
present in a tool payload; the §167 reference executor injects them before admission
(`execute-verifier-v3-scoped-falsification-2026-09-04.ts:405-409`).

Admission is a pure deterministic function over the persisted raw output, so the correct result was
recovered with **zero** additional provider calls.

```
original (erroneous) computation      0 admitted / 15 refused
corrected computation                13 admitted /  2 refused
```

**Both are preserved.** `RESUME-RUN-SUMMARY.json` and `RESUMED-VERIFIER-EXECUTIONS.jsonl` were not
overwritten; `ADMISSION-RECOMPUTE.json` is additive. This is a
`VERIFICATION_INFRASTRUCTURE_DEFECT` and never a model result.

## 3. Mechanical hard gates

| gate | observed | verdict |
|---|---|---|
| provider errors = 0 | 0 | **PASS** |
| contract-invalid = 0 | **2** | **FAIL** |
| wrong factKey bindings = 0 | 0 | **PASS** |
| unauthorized settlement transitions = 0 | 0 | **PASS** |
| `PROVIDER_SETTLEMENT_AUTHORITY = NEVER` | NEVER | **PASS** |
| adjacent-fact substitution = 0 | — | `PENDING_HUMAN_ADJUDICATION` |

The two genuine contract failures are `HR-08` #2 and `HR-01` #3, both
`BOUND_BY_CLARIFICATION` + `bindingFactKey` under `VERIFIED_AS_IS` with no `proposedClarification`.
Both were refused **whole**; no owed fact was settled or removed. **Both named the correct supplied
key**, so two facts are recorded separately and are not collapsed:

```
VERIFIER_RESPONSE_CONTRACT_VALID = FALSE
TARGET_SELECTION_WRONG           = FALSE
```

Root cause: **`CONTRACT-FAILURE-ROOT-CAUSE.md`**. In short — the schema is a flat object with no
`if`/`then`/`oneOf`/`dependentRequired` of any kind (verified mechanically), so every illegal
combination is schema-valid; and three of its field descriptions actively license the refused
output, including one, on `clarificationSourceMode`, that **contradicts itself** the moment
`bindingFactKey` is non-null under a non-`ADD` verdict. The contract also has **no declaration token
meaning "the first pass's question already reaches this fact"**, which is precisely the conclusion
step 3 of the instruction drives the model toward. Thirteen executions recorded it as
`STILL_UNRESOLVED`; two reached for `BOUND_BY_CLARIFICATION`. Smallest recommended remediation: **repair
the three schema field descriptions, and nothing else**. Do not normalize the state away, do not add
partial admission, do not add a fourth declaration member as part of the same change.

## 4. The strict semantic gate

```
RESULT                = UNMEASURED
lifecycleStage        = FORMAL_ADJUDICATION_PENDING
isThisAFailure        = false
isThisAPass           = false
pending verdict slots = 112
```

`UNMEASURED` is **neither a model failure nor a pass**. Recording it as either would attribute a
procedural state to the model.

Denominator treatment, applied literally and not improvised: the preregistration's
`REJECTED_IS_NOT_SILENCE` rule governs the **numerator** — a refused observation is "never scored as
behaviour" — and nowhere excludes it from the denominator, which the gate writes literally as
`/15`. So the two refused executions **stay in the denominator** and cannot be credited:

```
maximum attainable numerator     13 / 15
threshold                        >= 12 / 15      headroom 1
HR-01, HR-08 per-row ceilings    2 / 3 each, against a >= 2/3 floor   →  zero slack
```

One HR-04 sub-gate **is** mechanical and is computed here:
`provider output alone leaves the fact unresolved = 3 / 3 — PASS`. The other two HR-04 sub-gates are
semantic and pending.

## 5. Zero clarifications — and the denominator that figure hides

`proposedClarification = 0 / 15` is mechanically correct and is a misleading behavioural rate.

The verifier reviews a clarification set; a proposal requires asserting that a decision-changing
fact is **not asked about**. On HR-01, HR-06, HR-08 and HR-09 the first pass **had already asked a
question targeting the owed fact**. On HR-04 it **asked nothing**.

```
PROPOSED_CLARIFICATIONS_EMITTED                              = 0 / 15
EXECUTIONS_WHERE_A_PROPOSAL_WAS_UNCONDITIONALLY_AVAILABLE    = 3 / 15   (HR-04 only)
PROPOSALS_ON_THOSE                                           = 0 / 3
EXECUTIONS_WHERE_ZERO_IS_CORRECT_IFF_THE_EXISTING_QUESTION_SUFFICES = 12 / 15  (PENDING)
```

Two hypotheses are eliminated deterministically: `acceptableEvidence` was **never transmitted** —
`V3SuppliedOwedFact` carries no such field — so it cannot have been read loosely; and the prompt's
"the answer is usually no" prior is scoped to **nomination**, not to the clarification decision. The
instruction is also **not** loose on sufficiency: step 3 demands that an answer "would settle the
fact that changes the decision".

What the evidence does show is that the prompt supplies **three named heuristics** — two exclusionary
(magnitude; a detail with its control already in place) and one inclusionary (a control that cannot
be seen is not a control that was checked) — and the rationales track them exactly. The twelve
deferrals invoke the inclusionary one by name; all three HR-04 declinations invoke the two
exclusionary ones, and replicate 3 explicitly **declines** the inclusionary one on the ground that
"the guard is directly observed present and in position". The outcome is row-specific; the mechanism
is general. Full analysis: **`ZERO-CLARIFICATION-ROOT-CAUSE.md`**. No prompt wording is proposed,
because the diagnosis cannot be completed without the adjudication.

## 6. HR-04

All three replicates returned `NO_CLARIFICATION_REQUIRED` — which, per step 5, affirmatively asserts
that the fact *is* genuinely unresolved *and* that answering it changes nothing today. One emitted a
challenge.

The record is **mechanically preserving and rhetorically resolving**, and those point at different
categories: no binding, no settlement, the ledger unmoved, replicate #2 stating the boundary in its
own words — against four of five cited evidence items being about properties other than fastening
securement, and a challenge whose warrant runs *(guard in position) + (no tools on it) ⟹ (guard is
performing its function)* when the owed property is the **current securement of the fastenings**.

**`HR-04-ADJACENT-FACT-REVIEW.md`** maps every cited evidence item to the property the observation's
own words establish, and stops there. The A/B/C/D classification is the reviewer's; the mechanical
record alone is consistent with both B and C, which is why the frozen instrument routes it to a
human.

## 7. Challenge reviewability

```
CHALLENGE_REVIEWABILITY_OBSERVED   = PENDING_HUMAN_ADJUDICATION / 1
PREREGISTERED_THRESHOLD_EVALUATION = NOT_MEANINGFULLY_ESTIMABLE
```

`NOT_EXERCISED` does not apply — a challenge occurred. The preregistered gate is **not** changed
retroactively and will be computed literally once the verdict is supplied. But on n = 1 the literal
arithmetic can only return 0% or 100%, and neither is a population proportion. Do not write "100%
reviewable" anywhere; write `x / 1`. See **`CHALLENGE-REVIEWABILITY.md`**.

## 8. Cost accounting

```
§187A reported as TOTAL_ACTUAL_COST_USD    $1.22255      ← conservative reservations, not money
§187A money actually spent                 $0.26255
difference                                 $0.96000  =  15 × $0.064
cumulative actual §187A + §187B            $0.54182
```

Cause: one counter used for both the budget guard and the spend report
(`probe-required-structured-verifier-2026-09-05.ts:448, :520`). The reservation was right; naming it
`TOTAL_ACTUAL_COST_USD` was not.

Repaired prospectively via a two-counter `ProviderSpendLedger`; the guard is unchanged in strength.
`RUN-SUMMARY.json` is **left unedited** as run evidence — the §187A run is not rewritten as though
the defect never occurred. Deterministic regression: **26 assertions, 26 passed**, zero provider
requests, reconstructing both $0.26255 and $1.22255 from the persisted evidence rather than from
restated constants. See **`COST-ACCOUNTING-CORRECTION.md`**.

## 9. Source integrity

`SOURCE-INTEGRITY.txt` — **PASS 12 / 12**, recomputed from the files on disk, hashes calculated from
the actual files rather than copied from any report.

Unchanged at their §187A-frozen values: `expert-prompt.ts` and the built `EXPERT_SYSTEM_PROMPT`; all
four owed-fact runtime sources; `EXPERT_VERIFIER_V3_SYSTEM_PROMPT`; `VERIFIER_V3_RESPONSE_SCHEMA`;
the verifier instruction version; both §184 truth artifacts; the preregistration itself.

Changed under §188, all harness / test / documentation, none product runtime and none a verifier
prompt, schema or contract:

```
NEW       backend/scripts/lib/expert-provider-spend-accounting.ts
NEW       backend/scripts/test-expert-provider-spend-accounting.ts
NEW       backend/scripts/build-188-adjudication-ballot-2026-09-06.ts
NEW       backend/scripts/score-188-strict-semantic-gate-2026-09-06.ts
NEW       backend/scripts/verify-188-source-integrity-2026-09-06.ts
REPAIRED  backend/scripts/probe-required-structured-verifier-2026-09-05.ts   (cost accounting only)
```

## 10. Residuals preserved

- `BOUND_FACT_NOT_UNRESOLVED` unchanged; no settled fact exposed; no `ALREADY_SETTLED` added
- no new declaration mode, status, property ontology or `requiredProperty`
- `EXPECTED_HISTORICAL_PIN_DIVERGENCE_AFTER_AUTHORIZED_LATER_CHANGE` preserved
- direct terminal-construction residual **OPEN**; projection-firewall declarative gap **OPEN**
- §179 preserved as historical first-pass silence evidence; SILENCE rows not rerun
- `FIRST_PASS_STIMULUS_CONFOUND = MINOR`, not reclassified

---

## Claim boundary

**Established.** Fifteen behavioural verifier executions exist and are adjudicable. The corrected
admission is 13/2. A mechanical contract gate failed for a reason now diagnosed to a specific,
self-contradicting schema description and a missing declaration token. The §187A cost figure is
corrected, regression-covered, and the erroneous original preserved. Product runtime, prompts,
schemas and verifier contracts are byte-unchanged.

**Must not be claimed.** Verifier-v3 validated · semantic gate passed or failed · HR-04 solved or
unsolved · adjacent-fact substitution absent · clarification policy sound or defective · challenge
representation adequate · SILENCE improvement · full ten-row validation · absence of infrastructure
fragility · customer readiness · production readiness · formal acceptance.

## What is required next

1. **Human semantic adjudication** of `HUMAN-ADJUDICATION.json` — 112 slots. No provider call.
2. Run `score-188-strict-semantic-gate-2026-09-06.ts`. It refuses while any slot is null and reads
   every threshold from the frozen preregistration at scoring time.
3. Only then does the evidence exist to choose between the contract-remediation and
   semantic-remediation paths — and a bounded remediation authorization is required either way.

No rerun is authorized. No verifier behaviour was modified.
