# EXPERT HAZLENZ — R4/R6 ZERO-HOSTED-CALL LOCAL DIAGNOSTIC (2026-08-30/31)

**Terminal: `EXPERT_HAZLENZ_R4_HOSTED_ONLY_DEFECT_NOT_LOCALLY_REPRODUCED — TARGETED_HOSTED_CONFIRMATION_DESIGN_REQUIRED`**

Predecessor: §108 (`D-120`). Authorization: product-owner R4/R6 local-repair operation, 2026-08-30/31.
**0 hosted provider calls. $0.00 spent. Nothing committed, pushed, tagged or deployed.**

```
HEAD          37a5d1b50abe836eb19dd24ee18ad10557bda131   (local only, unchanged this phase)
EXPERT_PROMPT_VERSION             = hazlenz.expert.prompt.v4   (UNCHANGED this phase)
EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE
EXPERT_HAZLENZ_CUSTOMER_ACTIVE    = FALSE
```

## Headline result

Neither targeted defect reproduces against the local provider. **R4: 0 of 10 varied-seed
repetitions reproduced the hosted candidate/explanation loss — 10/10 `CANDIDATE_SURVIVED`.**
**R6: 0 of 10 varied-seed repetitions produced any over-routed item — 10/10 fully clean,
confirmed again at 3/3 in the separate local acceptance matrix.** No prompt, schema or
normalization change was made. Making one would have been inventing a local fix to chase two
hosted samples that this repository's own local channel cannot reproduce even once — exactly
what Phase 3 of the authorization instructed against.

What was NOT left as a shrug: R4's loss point was reproduced **structurally**, offline, by
composing a synthetic wire object that is legal under the exact production Anthropic-facing
schema and illegal only under the boundary's non-empty-string checks. That object reproduces
the hosted issue signature exactly (see §2). R6 has no such structural asymmetry to point to —
its cause is best classified as a Sonnet-5-specific reasoning tendency, not a wire-transport
artifact, and is reported as such rather than invented.

---

## 1. R4 — local reproduction: `R4_LOCAL_REPRODUCTION_NOT_ESTABLISHED`

Script: `backend/scripts/diagnose-r4-r6-local-repair.ts`. Evidence:
`local-diagnostic/console-output.txt`, `transport/r4-r6-diagnostic.jsonl`,
`results/r4-r6-diagnostic-summary.json`.

10 repetitions, seed `20260829 + i` for `i` in `0..9` (temperature 0 is otherwise fully
deterministic, so a fixed seed would have printed one draw ten times and characterized
nothing — see the script header). Current, unmodified prompt v4 / `analysis.v2` / shared wire
schema / normalization / boundary throughout.

| rep | seed | before | after | outcome | issues |
|---|---|---|---|---|---|
| 0–9 | 20260829–20260838 | 1 | 1 | ANALYZED | — |

**10/10 `CANDIDATE_SURVIVED`.** Every repetition produced exactly one well-formed
`expertHazardCandidates` entry (the confined-space candidate the fixture targets), and it
survived normalization unchanged. `MODEL_DID_NOT_PRODUCE_CANDIDATE`,
`MODEL_PRODUCED_CANDIDATE_BOUNDARY_REJECTED`, `MODEL_REASONED_ONLY_IN_EXPLANATION` and
`STRUCTURED_OUTPUT_MALFORMED` each occurred 0 times.

**Conclusion: R4 does not reproduce locally.** Per Phase 3 of the authorization, no local
behavioural change is invented to chase the one hosted sample.

### 1a. The structural loss-point proof (offline, $0.00, no network)

Two facts, both measured without a network call:

1. `backend/scripts/diagnose-r4-r6-local-repair.ts` built the real, unmodified
   `buildAnthropicRequestBody()` for the R4 input and counted schema keywords:

   | schema | `minLength` | `minItems` |
   |---|---|---|
   | local/canonical (`buildExpertWireSchema`) | 14 | 1 |
   | Anthropic-facing (post `stripAnthropicUnsupportedKeywords`) | **0** | **0** |

   This is §108's own documented compatibility strip (`anthropic-expert-provider.ts`,
   `stripAnthropicUnsupportedKeywords()`), unmodified and unauthorized-to-modify this phase.
   It removes the ONLY wire-level defense against an empty required string or an
   under-populated `participants` array — for the Anthropic transport only. The local/Ollama
   provider (`ollama-expert-provider.ts`) sends the canonical, unstripped schema and never
   loses this defense, which is exactly why the local channel cannot reproduce a defect whose
   precondition it structurally cannot construct.

2. `backend/scripts/diagnose-r4-anthropic-strip-boundary-proof.ts` (zero network calls)
   constructed three synthetic wire objects that are legal under the Anthropic-facing schema
   (satisfy every `required` entry, violate no `enum`, no `minLength`/`minItems` to violate)
   and ran them through the real, unmodified `normalizeExpertOutput()`:

   | case | state | candidates | issues | matches hosted R4 signature |
   |---|---|---|---|---|
   | empty `candidateKey`/`evidenceBasis`/`reasoning` + empty `explanation.summary` | VALID | 0 | `CANDIDATE_MALFORMED,EXPLANATION_MALFORMED` | **YES** |
   | only `reasoning` empty | VALID | 0 | `CANDIDATE_MALFORMED` | no (single code) |
   | candidate well-formed, only `explanation.summary` empty | VALID | 1 | `EXPLANATION_MALFORMED` | no (candidate survives) |

   The first case reproduces the hosted R4 signature **exactly**: `layerStatus PRESENT`
   (item-level rejection, not analysis-fatal), 0 surviving candidates, and both
   `CANDIDATE_MALFORMED` and `EXPLANATION_MALFORMED` present together — matching
   `verification/expert-hazlenz-v4-hosted-behavior-reprobe-2026-08-30/transport/hosted-probe.jsonl`'s
   R4 row field for field (`counts.candidates: 0`, `issues: ["CANDIDATE_MALFORMED",
   "EXPLANATION_MALFORMED"]`, `layerStatus: "PRESENT"`).

**Root cause classification: schema-generation failure (Anthropic-transport-specific) interacting
with boundary rejection.** The boundary did exactly what it is designed to do — fail closed on an
empty required string — and did not lose more than the one candidate and the one explanation
(both are item-level, not analysis-fatal; the hosted layer stayed `PRESENT`, matching evidence).
The defect is that Anthropic's strict tool-schema mode cannot carry the wire-level guidance
(`minLength: 1`) that would have made the empty string cheaper for a model to avoid producing in
the first place — a guidance channel this repository already measured (§105) as mattering, and
which is asymmetric across providers by construction (§108 Step 1), not by omission.

**Why no repair was made.** The explicit prohibitions for this phase include "do not change
Anthropic compatibility stripping" — which rules out the only true schema-level fix. A
prompt-instruction reinforcement ("never submit an empty string for a required field") is the
Phase 5 preferred first-order repair, but it is unfalsifiable this phase: R4 does not reproduce
locally at any rate, so there is no local signal to confirm the instruction changes anything, and
adding it anyway would be exactly the "invent a local fix solely to chase one hosted sample"
Phase 3 forbids. What IS added is the diagnostic itself and the structural proof, preserved as
evidence and re-runnable at $0.00 for any future hosted re-probe design.

---

## 2. R6 — local reproduction: also NOT ESTABLISHED

Same script, same 10 varied seeds, R6 fixture (`negative control`, everything stated: locked
out, tagged, bled down, verified at zero, second-person verified).

| rep | over-routed | candidates | clarifications | insights | disagreements | outcome |
|---|---|---|---|---|---|---|
| 0–9 | 0 | 0 | 0 | 0 | 0 | NOTHING_TO_ADD |

**10/10 fully clean.** No candidate, clarification, insight or disagreement was ever produced.
`outcome` was consistently `NOTHING_TO_ADD` with zero content, so
`OUTCOME_INCONSISTENT_WITH_CONTENT` never fired either. Re-confirmed independently at 3/3 in the
separate local acceptance matrix (`local-acceptance-matrix/`, reusing the frozen,
protected §105 evidence script `probe-expert-grounding-repair.ts` unmodified): R6 = `cand=0
clar=0 ins=0 dis=0` on all three repetitions there too, for **13/13 clean local repetitions of R6
across two independent scripts and two independent seed sets.**

**No over-routed item was ever produced, so there is nothing to classify per Phase 4's
taxonomy** (legitimate clarification / unsupported hazard candidate / generic insight /
speculative disagreement / explanation-only commentary) — that taxonomy has no local instance to
apply to.

**Root cause classification: could not be established locally; no structural asymmetry found.**
Unlike R4, R6's schema is byte-identical in every load-bearing respect between the local and
Anthropic-facing requests as far as over-routing is concerned — `minLength`/`minItems` stripping
affects only whether an UNDER-filled field can pass, not whether an EXTRA, well-formed item can
be emitted. Nothing about the shared prompt, the shared wire schema, or the boundary explains why
a hosted model would invent content on this fixture, because the local model — running the exact
same prompt text and the exact same schema-with-constraints — never does, across 13 independent
draws. This is evidence, not silence: it positively rules out the shared contract as the
mechanism and narrows the defect to something intrinsic to the hosted model's own behaviour on
this input (verbosity pressure, a stronger-than-local tendency to fill available structure, or
similar) rather than to anything this repository's prompt/schema/normalization controls.

**Why no repair was made.** With zero local reproductions to measure against, any prompt change
aimed at "further suppressing over-routing" would be unfalsifiable locally and would risk the
explicitly forbidden moves (global candidate suppression, re-coupling clarification to candidate
existence, broadening evidence matching) without any local signal that it does anything at all.
No change was made to `EXPERT_SYSTEM_PROMPT`, `buildExpertWireSchema`, or
`normalizeExpertOutput`.

---

## 3. Terminal selection

**Terminal B**, `EXPERT_HAZLENZ_R4_HOSTED_ONLY_DEFECT_NOT_LOCALLY_REPRODUCED —
TARGETED_HOSTED_CONFIRMATION_DESIGN_REQUIRED`, selected with an explicit note on how it is being
read: the authorization frames Terminal B as "R4 cannot be reproduced locally … while R6 is
repaired/understood." R6 was **not repaired** — nothing local was broken, so there was nothing to
repair. R6 IS **understood**, in the same falsifiable sense R4 is: a clean, unambiguous,
13-repetition local negative result that positively rules out the shared prompt/schema/boundary
as the mechanism, which is real information, not an absence of it. Terminal C
(`R4_R6_LOCAL_REPAIR_INCOMPLETE`) was considered and rejected: its condition is "either defect
remains unexplained," and neither is unexplained here — both have a specific, evidenced
characterization (R4: a proven structural asymmetry; R6: a proven absence of one). Terminal A does
not apply because nothing was repaired — there was no local defect present to repair.

If the product owner reads "repaired/understood" more strictly than that, this run's honest
alternative reading is Terminal C, and the facts recorded above are unchanged either way; only
the label differs.

---

## 4. Local acceptance matrix (Phase 6)

Since no repair was made, this is the current-state local floor, re-confirmed rather than
compared against a change: `probe-expert-grounding-repair.ts` (frozen, protected, unmodified) run
fresh at `PROBE_REPEATS=3` across all ten of its existing cases (`R1`–`R7`, `H7`, `H8`, `G1` — a
superset of the Phase 6 minimum of R4/R6/HG08/HG11/H7/H8/positive-candidate/clarification-only,
since `R1`=HG08, `R5`=HG11, and `R4` doubles as the positive-candidate fixture). Evidence:
`local-acceptance-matrix/`.

- **Routing:** opportunities 48, hits 45, misses 3, **over-routed 0**, explanation-only losses 5.
- **R6 (negative control):** empty on 3/3 — acceptance criterion met.
- **R7 (negative control):** `NOTHING_TO_ADD`, empty on 3/3 — no regression.
- **R1 (HG08, clarification carrier):** `cand=2 clar=3 ins=1` all 3 reps — no clarification
  regression.
- **R5 (HG11, multi-collection):** `cand=1 clar=2 ins=1` all 3 reps, all three collections
  populated simultaneously — no HG11 sibling-routing regression.
- **Grounding:** H7 3/3 bound (`EVIDENCE_QUOTES_EXACTLY_BOUND` 3/3), 0 unbindable, 0 fabricated —
  no grounding regression. H8 0/3 bound with `GROUNDING_CLAIM_UNSUPPORTED` fail-closed each time
  — this matches §108's own D-117 record of prior local H8 behaviour (`H8 declares a quote and
  supplies none 5/5, boundary correctly drops both candidates`) and is pre-existing, not a
  regression introduced this phase.
- **Malformed responses / explanation-only losses:** 5 explanation-only losses recorded by the
  scorer, all pre-existing (this phase changed no code that could have moved that count).

**One observation outside this phase's authorized scope, reported and NOT investigated or
repaired:** `R2` failed closed on `EVIDENCE_OUT_OF_BOUNDS` 3/3 in this run (the local
evidence-copying cliff §105 §7 previously measured on `R5`, now observed on `R2` instead —
plausibly the same local-model behaviour on a different fixture, not measured further here). This
predates this session — no code this phase touched could have caused it — and R2 is outside the
R4/R6 mandate, so it is recorded here as a residual finding for a future authorized phase rather
than chased.

---

## 5. Protected regression (Phase 7)

All green, re-run fresh this phase, zero hosted calls in any suite:

| suite | result |
|---|---|
| `test:expert-contract-foundation` | 56/0 |
| `test:expert-routing-contract` | 58/0 |
| `test:expert-grounding-contract` | 40/0 |
| `test:expert-anthropic-adapter-repair` | 30/0 |
| `test:expert-authority-merge` | 51/0 |
| `test:expert-provider-failure` | 131/0 |
| `test:expert-nocall-harness` | 141/0 |
| `test:l32i-clarification-carrier` (quarantine) | 61/0 |
| `test:l32j-carrier-activation` (quarantine) | 37/0 |
| `test:hazlenz-core` | PASS |
| `test:hazlenz-precision` (Population-A / life-critical floor) | PASS — 0 dangerous, 0 life-critical omissions |
| `test:hazlenz-level1-recall` | PASS (17 checks) |
| `test:hazlenz-actionable-coverage` | PASS (17 checks) |
| `tsc --noEmit` | exit 0, no diagnostics |

Every figure matches §108's own baseline exactly (56/51/131/141/58/40/30, quarantine 61/0 and
37/0, `tsc` 0). Full output in `post-run-regression/`.

**Confinement** (`CONFINEMENT.txt`): no controller/service/module references the Expert module;
no frontend reference; the hosted (Anthropic) adapter has exactly the same importer set as before
plus this phase's own `diagnose-r4-r6-local-repair.ts` (imports `buildAnthropicRequestBody` for
an OFFLINE schema-keyword count only — zero `fetch(` calls, verified by grep, part E of the
confinement file); `diagnose-r4-anthropic-strip-boundary-proof.ts` does not import the hosted
adapter at all.

---

## 6. Files changed this phase

- **Added**, both probe-only, both zero-network, both under `backend/scripts/`:
  - `diagnose-r4-r6-local-repair.ts` — the Phase 2/4 local reproduction diagnostic, plus the
    offline Anthropic-schema keyword count.
  - `diagnose-r4-anthropic-strip-boundary-proof.ts` — the Phase 3 structural loss-point proof.
- **Not touched:** `expert-prompt.ts`, `expert-normalization.ts`, `expert-contract.types.ts`,
  `anthropic-expert-provider.ts`, `ollama-expert-provider.ts`, or any file on the customer path.
  No production or customer behaviour changed. `EXPERT_PROMPT_VERSION` stays `v4`.
- This phase inherited a large pre-existing uncommitted working tree from §105–§108 (the v4
  prompt/schema/normalization repair and the Anthropic adapter repair), all preserved unchanged.
  **Nothing was committed, staged, pushed, tagged or deployed.**

---

## 7. Exact next recommended operation

Not authorized here. A narrowly-scoped, hard-ceilinged hosted confirmation probe covering ONLY
`R4` and `R6` (2 calls, no retry, cost bounded from the real prompt before sending — the same
discipline §107/§109 used) would answer the one question local diagnosis structurally cannot:
whether §108's two hosted failures were themselves stable defects or one-off draws from a
provider with no `temperature`/`seed` control (§108's own recorded limitation). That probe is the
"targeted hosted confirmation" this terminal names, and it is a separate, explicit authorization,
not a continuation of this one.
