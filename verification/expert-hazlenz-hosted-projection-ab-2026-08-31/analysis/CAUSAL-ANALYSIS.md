# §118 — Causal analysis of the hosted deterministic→Expert projection A/B

**18 planned, 18 attempted, 18 completed clean, 0 transport failures, 0 retries.
Projected worst-case spend $1.833378; actual spend $0.571626 against a $3.00 ceiling.**

---

## The primary comparison

| | R6 baseline (Arm A) | R6 projected (Arm B) |
|---|---|---|
| `machine_guarding` candidate | **3 / 3** | **0 / 3** |
| reinstatement / future-transition clarification | **3 / 3** | **0 / 3** |
| outcome | `ANALYZED` ×3 | **`NOTHING_TO_ADD` ×3** |
| collections over-routed | 2 of 4, ×3 = **6** | **0** |
| clean | **0 / 3** | **3 / 3** |
| output tokens | 921 – 1,112 | **381 – 398** |
| latency | 10.1 – 13.0 s | **5.0 – 5.5 s** |

**`R6_BASELINE_CLEAN_RATE = 0/3`. `R6_PROJECTED_CLEAN_RATE = 3/3`.** The hard projected-arm target
is met.

### The contemporary control reproduced the defect — this is not inherited from history

The authorization required a contemporary baseline rather than relying on v4/v5/v6 history, and it
mattered: under the current code, current deterministic repair and current configuration, Arm A
reproduced the defect **3/3** in its familiar shape.

- rep 1 — `machine_guarding/ACTIVE`, MODERATE: *"With the guard removed, the point of operation or
  moving parts are currently exposed. Although lockout/tagout is controlled, the physical guarding
  hazard exists as a separate condi[tion]…"*
- rep 2 — `machine_guarding/INSUFFICIENT_EVIDENCE`, MODERATE: *"A removed machine guard is a
  distinct hazard family from lockout/tagout…"*
- rep 3 — `machine_guarding/ACTIVE`, LOW: *"…This is a distinct hazard family…"*

All three declared `ADDITIONAL_TO_DETERMINISTIC`. All three carried a reinstatement-timing
clarification. This is the `HAZARD_FAMILY_INDEPENDENCE_MISTAKEN_FOR_CURRENT_EXPOSURE_INDEPENDENCE`
pattern §113 named, still present.

### The projected arm did not merely go quiet — it reasoned correctly

Criterion 2 of the causal test ("projected R6 incorporates the deterministic state correctly") is
satisfied explicitly. Projected rep 1's summary:

> "The observation describes a fully executed lockout/tagout sequence… **Machine guarding is
> correctly excluded because no moving or accessible energy is established**, and no other hazard
> family … is supported by any fact in the text. There is no stated gap, failure, or residual
> exposure to raise as a candidate or clarification."

*"No moving or accessible energy is established"* is the deterministic layer's own controlling
predicate (`moving or accessible energy = CONTRADICTED`), read and reused. The model is not silent;
it is agreeing, with reasons, and saying why.

---

## Anti-rubber-stamp gates — all six preserved

| gate | baseline | projected | verdict |
|---|---|---|---|
| **V7** point-of-operation contact | `lockout_tagout/CORRECTED` + 2 clar (1 BLOCKING) | `lockout_tagout/CONTROLLED` + **3 clar** incl. BLOCKING *"Why was the guard removed and left off while a technician reaches into the point of operation…"* + 1 insight | **PRESERVED** — and the projected arm names the flipped fact more directly. Deterministic projected `machine_guarding=ACTIVE@0.96`, so Expert correctly does not duplicate it. |
| **R6-I** running unguarded | `machine_guarding/ACTIVE` + 3 clar | `machine_guarding/ACTIVE` + `lockout_tagout/ACTIVE`, both `CONTRADICTS_DETERMINISTIC`, + 3 clar (2 BLOCKING) | **PRESERVED**, strengthened. Overrode a projected `UNKNOWN@0.45` with a named concrete fact. |
| **V1-CTRL** constructed failed control | `machine_guarding/ACTIVE` + BLOCKING clar | `machine_guarding/ACTIVE` + **BLOCKING** *"Has the stored energy in the press now been bled down and verified at zero…"* | **PRESERVED — not rubber-stamped.** See the three-part record below. |
| **R6-H** re-energizing now | `machine_guarding/ACTIVE` + `lockout_tagout/ACTIVE` + 2 clar | `machine_guarding/ACTIVE` `CONTRADICTS_DETERMINISTIC` + BLOCKING clar + **a formal `disagreements` entry** on surface `CONDITION_STATE_INTERPRETATION` | **PRESERVED** |
| **V8** cross-family | `machine_guarding/ACTIVE` + `chemical_exposure/ACTIVE` + 3 clar | **2× `chemical_exposure/ACTIVE`** + 3 clar (1 BLOCKING) | **PRESERVED** — the designated cross-family danger survives and is *strengthened*. See the note below on the dropped guarding candidate. |
| **V5** UNKNOWN state | `machine_guarding/ACTIVE` + 3 clar | `machine_guarding/ACTIVE` `CONTRADICTS_DETERMINISTIC` + 2 BLOCKING clar | **PRESERVED** |

**Routing across the whole matrix: 0 misses in BOTH arms.** Nothing was suppressed anywhere.

### V1-CTRL — the three required observations

1. **Identifies the control failure?** **YES.** A `BLOCKING` clarification directly challenges the
   projected `CONTROLLED`: *"Has the stored energy in the press now been bled down and verified at
   zero, and if not, is any work or access to the machine occurring while it remains unverified?"*
   The constructed disposition asserted the control was complete; the observation says it is not,
   and Expert said so.
2. **Grounded evidence?** **YES.** Quote *"the guard was removed"*, bound exactly.
3. **Candidate + disagreement mechanism?** **PARTIAL.** The candidate is present and the challenge
   is present, but it rides in the `BLOCKING` clarification rather than a formal `disagreements`
   entry, and the candidate declares `ADDITIONAL_TO_DETERMINISTIC` (defensible — it is
   `machine_guarding`, a family the projection did not carry). **R6-H proves the formal channel
   does work when the model reaches for it**, filing a `disagreements` entry on
   `CONDITION_STATE_INTERPRETATION`/`MAY_BE_INCOMPLETE`. Disclosed as a calibration observation, not
   a gate failure: the projection provided CONTEXT and Expert retained AUTHORITY.

### The one place a baseline candidate disappeared — V8's `machine_guarding`

Arm A raised `machine_guarding/ACTIVE` on V8; Arm B did not, because the projection carried
`machine_guarding=NOT_APPLICABLE@0.96`. Recorded plainly rather than buried.

It is judged **correct suppression, not a recall loss**, for three reasons: V8's observation states a
verified zero-energy isolation and a technician grinding *on the ram surface* — not a person stated
in the point of operation, which is the §115/§117 test; V8's designated danger is
`chemical_exposure`, which survived and was **strengthened** from one candidate to two plus a
BLOCKING clarification; and the fixture's own hard gate is the chemical/spark fact, which is met.
It is nevertheless the single case where projection removed content the baseline produced, and the
product owner should see it as such.

---

## Derived vs declared contradiction classification

§117 established the model's own `relationshipToDeterministic` label is poorly calibrated, so the
derived classification is the primary diagnostic here.

| projected arm | count |
|---|---|
| declared `CONTRADICTS_DETERMINISTIC` | 4 |
| derived `TRUE_DETERMINISTIC_CONTRADICTION` | 3 |
| derived `UNSUPPORTED_CONTRADICTION` (automated) | **1** |
| derived `UNSUPPORTED_CONTRADICTION` (**adjudicated**) | **0** |
| derived `CROSS_FAMILY_ADDITION` | 4 |

**The automated classifier's single `UNSUPPORTED_CONTRADICTION` is a false positive of my own
lexical marker set, and I checked rather than reported it.** It flagged R6-H projected, whose
candidate reads:

> "The deterministic engine left moving/accessible energy as UNKNOWN. **The observation now supplies
> the concrete current fact that resolves it**: the operator is removing the lockout at this moment
> to restart the press for production, and the guard has not been reinstalled… **which is a current
> machine guarding hazard, not a hypothetical one.**"

with the verbatim bound quote *"the operator is now removing the lock and tag to restart the press
for production, and the guard has not been reinstalled"*. That is a stated current fact; the
`CURRENT_PATHWAY` regex simply lacked "removing the lock and tag to restart". Both numbers are
reported; the adjudicated figure is **0**.

**Baseline's derived column is definitionally all `CROSS_FAMILY_ADDITION`** (Arm A carries no
projected dispositions, so no candidate can be same-family). It is not comparable across arms and is
recorded only for completeness. The comparable cross-arm measures are the routing table and the
manual R6 reading.

---

## Grounding / boundary accounting

| | baseline | projected | combined |
|---|---|---|---|
| evidence opportunities | 11 | 8 | 19 |
| quotes emitted | 11 | 8 | 19 |
| **exactly bound** | **11** | **8** | **19** |
| unbindable | 0 | 0 | **0** |
| fabricated | 0 | 0 | **0** |
| `EVIDENCE_OUT_OF_BOUNDS` | 0 | 0 | **0** |
| item-level rejections | 0 | 0 | **0** |
| analysis-level rejections | 0 | 0 | **0** |
| malformed responses | 0 | 0 | **0** |
| outcome/content inconsistencies | 0 | 0 | **0** |
| explanation-only losses | 0 | 0 | **0** |

Perfect in both arms. **No difference to repair, and none was repaired.**

## Routing

| | opportunities | hits | misses | over-routed |
|---|---|---|---|---|
| baseline | 18 | 12 | **0** | **6** |
| projected | 18 | **18** | **0** | **0** |

All 6 baseline over-routes are the three R6 reps × two forbidden collections. Zero misses in both
arms is the load-bearing safety number: **the projection eliminated over-routing without costing a
single recall opportunity.**

## Tokens, cost, latency

| | baseline | projected |
|---|---|---|
| input tokens | 82,477 | 88,186 |
| output tokens | 11,733 | 11,297 |
| cost | $0.282284 | $0.289342 |
| latency p50 / max | 14,809 / 18,884 ms | 16,736 / 21,759 ms |

**Total actual spend $0.571626** against a $1.833378 projection and a $3.00 ceiling.

---

## Causal conclusion

All five evidentiary requirements the authorization set for supporting
`DETERMINISTIC_DECISION_NOT_PROJECTED_TO_EXPERT` are met:

1. **Contemporary baseline R6 reproduces the defect materially more often than projected R6** —
   3/3 versus 0/3.
2. **Projected R6 incorporates the deterministic state correctly** — it restates the controlling
   predicate by name and explains the exclusion.
3. **Projected R6 no longer invents an unsupported current pathway** — zero candidates, zero
   clarifications, `NOTHING_TO_ADD` ×3.
4. **Anti-rubber-stamp hazards remain detectable** — all six controls preserved, 0 routing misses.
5. **Valid deterministic disagreement still survives** — R6-I and R6-H overrode projected
   dispositions with quoted concrete facts, R6-H through the formal disagreement channel, and
   V1-CTRL refused a deliberately wrong `CONTROLLED`.

The counter-conditions do not hold: the arms are not equally wrong, not equally clean, and no
dangerous control regressed.

**The hypothesis is supported.** The R6 over-routing that survived three prompt generations and two
dedicated repair phases was substantially an **input-completeness** defect, not a model-compliance
defect — exactly as §116 predicted and could not prove locally.

## Residual limitations, stated plainly

- **n = 3 on the primary, no determinism control.** `P2_DETERMINISM_CONTROL = ABSENT` on this
  provider; 3/3 versus 0/3 is a strong but small sample.
- **The deterministic extraction layer remains pattern-based.** §117's repair is validated against
  the frozen 16-case corpus and the protected battery; it does **not** prove universal wording
  coverage. An observation phrased outside the tested forms may still under-extract, and the
  projection would then carry a weaker or absent disposition.
- **The transport deviation is disclosed**: the HTTP call is issued by the probe rather than
  `AnthropicExpertProvider.analyze()`, because `analyze()` offers no seam for Arm B's appended
  block. The request body comes from the real `buildAnthropicRequestBody` (canonical schema →
  strict wrapper → Anthropic strip), endpoint/headers/version are copied verbatim, the
  model-identity check and the real binder and normalizer are used, and **the same transport serves
  both arms**, so it cannot confound the comparison.
- **V1-CTRL expressed its override through a BLOCKING clarification rather than the formal
  `disagreements` channel.** Not a gate failure, but a calibration observation.
- **The derived-classification regex under-detects**, as §116 disclosed and this run demonstrated
  again on R6-H. Manual adjudication remains necessary.
