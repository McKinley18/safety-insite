# Human verdicts recorded, instrument unblinded — and what the numbers do not mean

**§174, 2026-09-05. 0 provider calls, $0.00, 0 database operations, 0 source-code changes.**

---

## 1. Terminal

```
EXPERT_HAZLENZ_BALANCED_CLARIFICATION_TRUTH_RECORDED —
BOUNDED_HOSTED_SEMANTIC_VALIDATION_AUTHORIZATION_REQUIRED
```

Frozen artifacts verified intact, ten verdicts recorded, 5/5 pairs fully concordant, and the
preregistered scan found no perfect surface classifier. **But read §6 before treating the
concordance as validation of anything** — it is not, and the reason is structural.

---

## 2. Integrity, checked before anything was recorded

Both packet hashes and all ten row hashes re-derived and matched. Each row was re-extracted
**independently from the markdown and the JSON** and the two agreed byte-for-byte; a divergence
would have refused the freeze. The preregistered scanner hashed to
`ca3c6c8dc1df8fbb48185ce613e0781e31e5be43c47e893f06f4c5e9fc469f04`, unchanged since it was written
before any verdict existed. `FROZEN_ARTIFACT_INTEGRITY = INTACT`.

---

## 3. Verdicts as supplied

| row | verdict | confidence | | row | verdict | confidence |
|---|---|---|---|---|---|---|
| HR-01 | **TRUE** | HIGH | | HR-06 | **TRUE** | HIGH |
| HR-02 | **FALSE** | HIGH | | HR-07 | **FALSE** | HIGH |
| HR-03 | **FALSE** | HIGH | | HR-08 | **TRUE** | HIGH |
| HR-04 | **TRUE** | HIGH | | HR-09 | **TRUE** | HIGH |
| HR-05 | **FALSE** | HIGH | | HR-10 | **FALSE** | HIGH |

`HUMAN_AUTHORITATIVE_REQUIRED_ROWS = 5`, `HUMAN_AUTHORITATIVE_SILENCE_ROWS = 5`. Both classes
represented. Not changed, not inferred, not reordered.

The five narrative fields per row — unresolved facts, sufficiency concern, temporal concern,
counterfactual, rationale — **were not supplied and are recorded as `null`.** Filling them would be
me reconstructing human reasoning I was never given.

Verdict record frozen and hashed at `4412990912bef4e91c23286823bc685520c1d124259abb59acb9431e30dac2ff`
**before** `PAIR-MAP.json` was opened. The hash was re-verified at the moment of unblinding.

---

## 4. Unblinding

| pair | family | intended SILENCE → human | intended REQUIRED → human | outcome |
|---|---|---|---|---|
| `PAIR-1` | machine_guarding | HR-02 → SILENCE | HR-06 → REQUIRED | **FULLY_CONCORDANT** |
| `PAIR-2` | machine_guarding | HR-10 → SILENCE | HR-04 → REQUIRED | **FULLY_CONCORDANT** |
| `PAIR-3` | fire_explosion | HR-07 → SILENCE | HR-01 → REQUIRED | **FULLY_CONCORDANT** |
| `PAIR-4` | hazardous_energy | HR-05 → SILENCE | HR-08 → REQUIRED | **FULLY_CONCORDANT** |
| `PAIR-5` | hazardous_energy | HR-03 → SILENCE | HR-09 → REQUIRED | **FULLY_CONCORDANT** |

**5/5 fully concordant. 0 nonconcordant. 0 inversions. 10/10 row-level agreement with authoring
intent.** No row was found genuinely ambiguous; all ten came back HIGH confidence.

---

## 5. Preregistered shortcut scan

303 candidate rules swept — every numeric surface feature over every threshold in both directions,
every one of 197 vocabulary tokens as a presence rule, every metadata field as an equality rule.

| | result |
|---|---|
| majority-class baseline | 0.5 |
| best simple classifier | **0.9** — `contains "it"` |
| best numeric feature | 0.8 — `wordCount >= 59.5` |
| best metadata rule | 0.5 |
| perfect separator found | **none** |
| `MATERIALLY_SEPARABLE` | **False** |

Under no signal at all, sweeping 303 rules over 10 rows would be expected to throw up **1.2 perfect
separators by luck**. Finding zero is therefore mildly better than chance, not merely "not proven
leaky". The four previously known shortcuts — length, verification vocabulary, hazard domain,
negation count — are all absent.

### But one sub-threshold leak has a real mechanism

`contains "it"` scores **9/10**: the pronoun appears in four of five REQUIRED rows and **none** of
the SILENCE rows. Below the preregistered threshold, and 0.9 on ten rows is statistically
unremarkable — **except that the mechanism is interpretable, which chance would not produce**:

```
HR-01  ...filed the certificate; it lists a nozzle change ... but does not record whether...
HR-06  ...signed the return-to-service log; it recorded the tooth change but carries no...
```

The REQUIRED construction *"a document exists; **it** records X **but not** Y"* needs an anaphoric
pronoun. The SILENCE rows, which assert the verification directly, do not. **This is the fourth
surface feature to track the row class** after length, vocabulary and negation count — and it was
found only because the scan swept function words rather than a list of known defects.

Not grounds to remediate ten rows. **It is grounds to watch on any expansion**, and to vary the
REQUIRED construction away from document-anaphora when new pairs are written.

---

## 6. What the 10/10 does not establish

This is the part that matters more than the concordance figure.

**The verdicts were AI-assisted.** The product owner reviewed a GPT-5.6 Sol assessment of the same
ten frozen rows before finalising, and agreed with all ten. Disclosed by the owner, recorded in the
evidence, and it must travel with every figure derived from it:

```
AI_REVIEW_VISIBLE_BEFORE_HUMAN_FINALIZATION = TRUE
HUMAN_AI_AGREEMENT                         = 10 / 10
FULLY_INDEPENDENT_HUMAN_ADJUDICATION       = FALSE
AI_ASSISTED_HUMAN_VERDICT_GENERATION       = TRUE
```

So the 5/5 concordance is agreement between **the model that authored the rows**, **a second model
that assessed them**, and **a human who had seen the second model's answer**. It is not independent
confirmation that the authored truth is correct. Two systems sharing a blind spot would produce
exactly this number.

**And there is a provenance confound the scan cannot see.** The corpus was authored by Claude; the
labels are AI-assisted; Expert HazLenz is Claude-based. High measured precision or recall against
this set may partly reflect shared authorship rather than safety correctness. That is not a surface
feature, so no sweep over text or metadata can detect it — which is precisely why it has to be
stated rather than measured away.

This truth set is therefore `PRODUCT_OWNER_REVIEWED_DEVELOPMENT_TRUTH`. It does not establish
HazLenz performance, clarification precision, clarification recall, customer readiness, production
acceptance, or AI-free human truth. **HazLenz has not been run against these rows and has not passed
anything.**

---

## 7. Structural suitability

**Suitable for bounded DEVELOPMENT hosted validation.** Ten rows, both classes at 5/5, wording
frozen and hashed, no pruning required so §173's balancing survives intact, no perfect surface
classifier, and the four known shortcuts absent.

**Not suitable for any customer-facing or acceptance claim**, on provenance grounds in §6 — a
limitation of the truth's origin, not of its balance, and one that no amount of further balancing
would fix.

---

## 8. Recommended next authorization

Bounded hosted validation of Expert HazLenz against these ten frozen rows, reported explicitly as
development-tier evidence carrying the AI-assistance disclosure.

Two things to fix into that authorization now, before any number exists:

1. **Preregister the scoring rule and the cost cap before the run**, as §167 did.
2. **Decide in advance what result would falsify the instrument** rather than the model. A 10/10
   HazLenz score against a corpus its own model family authored is the outcome that should
   *increase* suspicion of the instrument, not confidence in the product.

Separately, and not blocking: if a customer-facing precision claim is ever wanted, it needs truth
authored and adjudicated without AI involvement on either side. That is a different and more
expensive instrument, and this one cannot be upgraded into it.
