# Level-3 evaluation architecture and acceptance gates

## Corpus design — three separate sets

| Set | Contents | Visible during implementation? |
|---|---|---|
| **REGRESSION** | the committed 66-case matrix (`c298f148…`, frozen `ef405d60…`, oracle correction recorded) + the DX1–DX5 mine-routing and OF1–OF7 perturbation diagnostics + `test:hazlenz-core`'s 30 suites | **Yes** — it encodes known historical failures and must not regress |
| **DEVELOPMENT** | new cases written during implementation to explore behaviour | **Yes** |
| **SEALED HOLDOUT** | **~40 genuinely novel scenarios, authored by a party not tuning the implementation, and not opened until a slice's acceptance run** | **No** |

Sealed-holdout construction rules: novel wording, sentence structure and hazard/context combinations;
no paraphrase of a regression case; must include negative controls, safe/negated/corrected states,
multi-hazard observations, all three regimes and at least one genuinely ambiguous regime; opened once
per slice acceptance and then **retired** (a holdout inspected during tuning is no longer a holdout).

> **Do not tune against the acceptance cases.** The 24%-clean baseline was produced by a matrix frozen
> before execution; that discipline is what makes the number meaningful, and it is preserved here.

## Hard safety gates — any failure stops the slice

| Gate | Why it exists |
|---|---|
| **Zero fabricated citations** | §28 measured 0 fabricated citations today; Level 3 must not introduce the one failure mode a language model makes easiest. `L3-INV-01` |
| **Zero fabricated evidence** | RC-08 printed a negation-inverted fragment on a customer report. `L3-INV-02`, `L3-INV-11` |
| **Zero default-ACTIVE from semantic uncertainty** | RC-01 — 17 fabricated ACTIVE states, 6 of 12 negative controls. `L3-INV-04` |
| **No customer finding unsupported by observation evidence** | RC-07 — "the belt was running" became a rated finding with an open corrective action |
| **No unresolved systematic high-consequence false-negative pattern** | 7 missed today, including an open floor pit and an unshored trench |
| **No unreviewed content represented as governed** | KG's whole purpose; `L3-INV-03`, `L3-INV-09` |
| **No materially unsafe corrective action** | RC-05 — ladder tie-off instructions for an extension cord |
| **No silent Level-1 fallback** | `L3-INV-10`; the anti-pattern is already in the tree |

## Quality thresholds

Set against the **measured 2026-08-22 baseline**, not against what a future engine might achieve.

| Dimension | Baseline | Level-3 threshold | Rationale |
|---|---|---|---|
| Hazard detection (expected hazards found) | 25 of 32 | **≥ 30 of 32**, zero high-consequence misses | high-consequence misses are a hard gate; the rest is quality |
| Negative-control false positives | 6 of 12 ACTIVE, 7 of 12 cited | **≤ 1 of 12 ACTIVE, ≤ 1 of 12 cited** | a safety tool that flags a document review is not usable |
| Condition state correct | 17 fabricated ACTIVE | **0 fabricated ACTIVE**, ≥90% state accuracy | hard gate plus a quality floor |
| Decomposition | phantom + over/under | **0 phantom findings; ±1 hazard vs expectation on ≥90%** | exactness is not required; manufacturing findings is disqualifying |
| Jurisdiction | 26% cross-regime under `unknown` | **0 cross-regime citation sets when a regime is established**; ambiguity preserved | the HYBRID contract |
| Regulatory applicability | 2 forbidden citations | **0 citations outside the retrieved candidate set; 0 forbidden** | `L3-INV-01` |
| Unnecessary clarification | 29 of 66 | **≤ 5 of 66**, 0 decision-critical missed | `L3-INV-06`; autonomy is the Level-3 claim |
| Corrective-action grounding | 16 of 66 name an absent hazard | **0** | hard gate |
| **Generalization** | historical 14% vs novel 20% | **sealed holdout within 10 points of development** | the anti-overfitting control |

**Why these numbers.** Each is either (a) a hard safety gate at zero, or (b) a floor set above the
measured baseline by a margin large enough that noise cannot produce a pass. None was chosen to make a
future engine pass; the two that are deliberately *not* 100% — hazard detection and decomposition —
are the two where multiple professional judgements are legitimately defensible.

## Observational metrics (tracked, not gated)

latency (median, p95) · cost per analysis · retry rate · token usage · provider error rate ·
schema-adherence rate · validator rejection rate by reason code.

These inform the budget in `IMPLEMENTATION_PLAN.md`; they do not block a slice on their own, except
where they breach the stated retry ceiling.
