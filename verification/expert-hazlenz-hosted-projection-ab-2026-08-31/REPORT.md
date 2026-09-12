# BOUNDED HOSTED DETERMINISTIC→EXPERT PROJECTION A/B — 2026-08-31

**Terminal: `EXPERT_HAZLENZ_DETERMINISTIC_PROJECTION_HOSTED_CONFIRMED — FORMAL_EVALUATION_COHORT_AUTHORIZATION_DECISION_REQUIRED`** (Terminal A)

**18 planned · 18 attempted · 18 completed clean · 0 transport failures · 0 retries.**
Projected worst-case **$1.833378** · actual **$0.571626** · ceiling **$3.00**.
Nothing repaired. Nothing committed, pushed, tagged or deployed.

```
HEAD 37a5d1b5 (unchanged) · origin/main de655d2f (unmoved) · ahead 1/behind 0
stashes 4 (unchanged) · tags 24 (unchanged)

provider = anthropic   model = claude-sonnet-5   prompt = v6   contract = analysis.v2
thinking = disabled    max_output_tokens = 8000  P2_DETERMINISM_CONTROL = ABSENT

EXPERT_HAZLENZ_PROVIDER_VALIDATED       = FALSE
EXPERT_HAZLENZ_CUSTOMER_ACTIVE          = FALSE
17_MEASURE_EVALUATION_COHORT_AUTHORIZED = FALSE
LOCAL_R2_EVIDENCE_CLIFF_DEBT_OPEN       = TRUE
```

**Pre-run and post-run SHA-256 of prompt, contract, normalization, scorer, the §117 deterministic
repair, the §116 projection and every fixture are byte-identical.** The measurement was frozen and
stayed frozen.

---

## The result

| | R6 baseline (Arm A) | R6 projected (Arm B) |
|---|---|---|
| `machine_guarding` candidate | **3 / 3** | **0 / 3** |
| reinstatement clarification | **3 / 3** | **0 / 3** |
| outcome | `ANALYZED` ×3 | **`NOTHING_TO_ADD` ×3** |
| collections over-routed | **6** | **0** |
| **clean** | **0 / 3** | **3 / 3** |

The hard projected-arm target is met. The **contemporary** control reproduced the defect 3/3 under
current code and configuration — it was live, not inherited from v4/v5/v6 history.

The projected arm did not merely go quiet. Its summary reads:

> *"Machine guarding is correctly excluded because **no moving or accessible energy is
> established**, and no other hazard family is supported by any fact in the text."*

That is the deterministic layer's own controlling predicate (`moving or accessible energy =
CONTRADICTED`) read and reused — causal criterion 2, satisfied explicitly.

## Anti-rubber-stamp — all six gates preserved, **zero routing misses in both arms**

| | baseline | projected | verdict |
|---|---|---|---|
| `V7` | `lockout_tagout/CORRECTED` + 2 clar | `lockout_tagout/CONTROLLED` + 3 clar incl. BLOCKING naming the technician reaching in | PRESERVED |
| `R6-I` | `machine_guarding/ACTIVE` + 3 clar | **2 candidates, both `CONTRADICTS_DETERMINISTIC`**, quoting the observation | PRESERVED, strengthened |
| `V1-CTRL` | `machine_guarding/ACTIVE` + BLOCKING clar | `machine_guarding/ACTIVE` + BLOCKING clar challenging the constructed `CONTROLLED` | **PRESERVED — not rubber-stamped** |
| `R6-H` | 2 candidates + 2 clar | `CONTRADICTS_DETERMINISTIC` + BLOCKING clar + **formal `disagreements` entry** | PRESERVED |
| `V8` | `machine_guarding` + `chemical_exposure` | **2× `chemical_exposure`** + BLOCKING clar | PRESERVED, strengthened |
| `V5` | `machine_guarding/ACTIVE` + 3 clar | `CONTRADICTS_DETERMINISTIC` + 2 BLOCKING clar | PRESERVED |

Routing: baseline **18 / 12 hits / 0 misses / 6 over-routed**; projected **18 / 18 / 0 / 0**.
**Over-routing eliminated at zero recall cost.**

### V1-CTRL — the three required observations
1. **Identifies the control failure?** YES — BLOCKING clarification: *"Has the stored energy in the
   press now been bled down and verified at zero…"* against a projected `CONTROLLED`.
2. **Grounded evidence?** YES — quote bound exactly.
3. **Candidate + disagreement mechanism?** **PARTIAL** — candidate + BLOCKING clarification rather
   than a formal `disagreements` entry. `R6-H` proves the formal channel works when the model
   reaches for it. Disclosed as calibration, not a gate failure.

### Two things recorded plainly rather than buried
- **`V8`'s `machine_guarding` candidate disappeared in Arm B** — the only case where projection
  removed baseline content. Judged correct suppression (verified isolation; technician grinding on
  the *ram surface*, nobody stated in the point of operation) and V8's designated danger survived
  and strengthened. The product owner should still see it.
- **The derived classifier flagged 1 `UNSUPPORTED_CONTRADICTION`; manual adjudication overturns
  it.** It fired on `R6-H`, whose candidate quotes the observation verbatim and says *"which is a
  current machine guarding hazard, not a hypothetical one."* My regex lacked that phrasing.
  **Automated 1, adjudicated 0 — both reported.**

## Grounding — perfect in both arms

19 opportunities · 19 quotes · **19/19 exactly bound** · 0 unbindable · 0 fabricated ·
0 `EVIDENCE_OUT_OF_BOUNDS` · 0 item-level · 0 analysis-level rejections · 0 malformed ·
0 outcome/content inconsistencies · 0 explanation-only losses.

## Causal conclusion

All five evidentiary requirements met; no counter-condition holds. **The hypothesis
`DETERMINISTIC_DECISION_NOT_PROJECTED_TO_EXPERT` is SUPPORTED.** The R6 over-routing that survived
three prompt generations and two dedicated repair phases was substantially an **input-completeness
defect, not a model-compliance defect** — exactly what §116 predicted and could not prove locally.

## Post-run protected state ($0.00, nothing repaired)

Expert **56/58/40/30/51/131/141** · quarantine **61/0** and **37/0** · floors **0 dangerous /
0 life-critical omissions** · **Population-A precision 100.0%** · §117 corpus **16/16, 0 dangerous
false negatives, 0 precision failures** · `evidence-foundation`, `hazlenz-guarding-applicability`,
grounding and Anthropic-adapter suites all 0 · `tsc` 0.

**`PRE_EXISTING_BASELINE_FAILURE_UNCHANGED`** — identical counts at true HEAD baseline and now;
**not passing**, not attributable to §117/§118, not investigated:
`hazlenz-field-gauntlet` (92) · `hazlenz-authentic-gauntlet` (92) ·
`hazlenz-authentic-reasoning` (21) · `hazlenz-clarification-gauntlet` ·
`hazlenz-independent-standards-audit` · `safescope` · `safescope-standards` ·
`standards-corpus-integrity` (1).

## Confinement

**Zero production files changed by this phase.** Zero controller/service/module, frontend or
migration involvement. Pre-existing unrelated work preserved untouched.

## Residual limitations

- **n = 3 per arm**, `P2_DETERMINISM_CONTROL = ABSENT`. Strong but small.
- **The deterministic extraction layer remains pattern-based.** §117 does not prove universal
  wording coverage; no vocabulary was expanded here.
- **Transport deviation, disclosed**: the HTTP call is probe-issued because
  `AnthropicExpertProvider.analyze()` offers no seam for Arm B's appended block. The body comes
  from the real `buildAnthropicRequestBody` (canonical schema → strict wrapper → Anthropic strip),
  endpoint/headers/version verbatim, real identity check, binder and normalizer — and **the same
  transport served both arms**, so it cannot confound the comparison.
- **The projection has no production implementation.** `ExpertAnalysisInput` still carries no
  `deterministicFamilyDispositions` field; §116's design remains a `scripts/` prototype.

## Next operation

**A product-owner decision on whether to authorize the formal 17-measure evaluation cohort.** This
terminal neither executes nor authorizes it. The three items above belong in that decision.
