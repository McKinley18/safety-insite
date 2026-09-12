# Phases 6–9 — Prototype, contrasts, local A/B diagnostic, state-aware instrumentation

**108 local calls (2 runs × 9 cases × 2 arms × 3 reps), 0 hosted calls, $0.00.**
Local Ollama `qwen3-coder:30b`, temperature 0, fixed seeds, `num_ctx` 8192.

---

# Phase 6 — The R6 projection prototype

Exactly one variable differs between arms:

```
baseline    EXPERT_SYSTEM_PROMPT + buildExpertUserPrompt(input)
projected   EXPERT_SYSTEM_PROMPT + buildExpertUserPrompt(input) + <disposition block>
```

System prompt, wire schema, quote binder, normalizer, seed, temperature and fixture input are
byte-identical and come from the unmodified production modules. The block is **appended**; no
production prompt text is edited.

## Provenance — derived, not forged

The authorization required using the real deterministic layer rather than hand-writing an R6
answer. The projection is built by calling the genuine `applyEvidenceFoundation` on each fixture's
observation and mapping its `ApplicabilityDecision[]`. Every row carries
`provenance: 'DERIVED_FROM_PRODUCTION_ENGINE'` — except the single `V1-CTRL` row, deliberately
marked `CONSTRUCTED_FOR_DIAGNOSTIC` because Phase 7's control H needs a `CONTROLLED` assessment the
engine does not emit here.

## What R6 actually receives

```
DETERMINISTIC FAMILY ASSESSMENTS ALREADY PERFORMED
  These families were EVALUATED by the deterministic engine. This is different from a
  family it never considered — do not treat an assessment below as a gap you must fill.
  - machine_guarding: NOT_APPLICABLE, not actionable, confidence 0.96
      why: The deterministic layer evaluated this family and excluded it: the observation
           affirmatively contradicts "moving or accessible energy", so the conditions this
           family protects against are not established as present.
      controlling fact: general-industry jurisdiction = SUPPORTED
      controlling fact: machine guard condition       = SUPPORTED
      controlling fact: moving or accessible energy   = CONTRADICTED
      controlling fact: current condition             = SUPPORTED

  HOW TO USE THESE. You are a reviewer of these assessments, NOT a rubber stamp.
  … [override licence and its three requirements]
```

Citation-free, structured, and the override licence is stated in the same breath as the assessment.

---

# Phase 7/8 — Contrasts and the A/B result

## The anti-rubber-stamp controls turned out to be REAL, not constructed

This phase set out to *construct* a "deterministic false negative". That was unnecessary: the
production engine already emits `machine_guarding = NOT_APPLICABLE @ 0.96` on `V2` (accumulator
charged), `V4` (second source live), `V7` (technician's hands in the point of operation) and `R6-I`
(press running unguarded). See `evidence/DETERMINISTIC-EXCLUSION-SHORT-CIRCUIT.md`. These are
therefore the strongest possible gates: if Expert defers on them, the projection is unsafe.

## Final result (run 2, with the predicate-justification guard)

| case | control | baseline | projected | verdict |
|---|---|---|---|---|
| **R6** | A — exact | cand 0, clar 0 | cand 0, clar 0 | **NO INFORMATION** — R6 has never reproduced locally (§109/§114.6) |
| **R6-H** | current transition | cand 3, clar 6 | cand 3, clar 6 | **PASS** — REQUIRED clarification gate met both arms |
| **R6-I** | F — det. false negative | **cand 0**, clar 3 | **cand 3**, clar 3 | **PASS + IMPROVEMENT** — overrode a `NOT_APPLICABLE@0.96` |
| **V7** | E — separate current exposure | cand 3, clar 4, override 0 | cand 3, clar 6, **override 2** | **PASS** — override formally expressed |
| **V4** | C — incomplete isolation | cand 6 | **cand 6** (was 3 pre-guard) | **PASS after guard** — parity restored |
| **V2** | D — stored energy remains | cand 0, clar 3 | cand 1, clar 3 | **PASS** — recall via REQUIRED clarification 3/3 both arms |
| **V5** | B/G — stopped / UNKNOWN | cand 3, clar 5 | cand 5, clar 5 | **PASS** — UNKNOWN did not silence Expert |
| **V8** | E2 — different family | cand 3, clar 6 | cand 3, clar 6 | **PASS** — addition of an unassessed family unaffected |
| **V1-CTRL** | H — CONTROLLED, control failed | cand 3 | cand 2 normalized, **3/3 at wire** | **PASS** — see attribution below |

**`silentAgreementReps = 0/3` on every case except `R6`, in both arms, in both runs.** The
projection never silenced Expert anywhere danger was present.

## The headline metric — what the projection actually changed

`relationshipToDeterministic` across every raw-wire candidate (run 2):

| | baseline | projected |
|---|---|---|
| `CONTRADICTS_DETERMINISTIC` | **3 / 27 (11%)** | **23 / 29 (79%)** |
| `ADDITIONAL_TO_DETERMINISTIC` | 13 | 6 |
| `REFINES_DETERMINISTIC` | 10 | 0 |
| `AGREES_WITH_DETERMINISTIC` | 1 | 0 |
| **total candidates** | **27** | **29** |

**Candidate volume did not fall — it rose slightly. What changed is the channel.** The projection
re-routed disagreement out of "additional/refines" and into the contract's explicit, auditable
override channel. That is precisely the architectural principle this phase was given: Expert as a
reviewer that agrees, adds, or **explicitly disagrees with evidence**.

`R6-I`'s override quotes the observation directly:

> "The observation directly states that *'the press is now running production parts with the guard
> still off and the point of operation exposed.'* This creates an active exposure to mechanical
> hazards at the point of operation…"

— a correct, grounded override of a `NOT_APPLICABLE @ 0.96` determination.

## The one genuine suppression, found and fixed

**Run 1 measured `V4`'s `machine_guarding` candidate disappearing 3/3 under projection** (6 → 3
candidates; `electrical` survived). It was the only real suppression in the matrix, and it was
caused by projecting an *internally contradictory* determination: `V4`'s decision reads
`NOT_APPLICABLE @ 0.96` while all four of its own required predicates read `SUPPORTED`.

Response: a **projection-side guard**, `isExclusionPredicateJustified` — an exclusion is projectable
only when at least one required predicate is actually `CONTRADICTED`. Run 2 confirms it changed
**only `V4`** (6 = 6, parity restored) and left all eight other cases byte-identical. The engine was
not modified.

## Correct attribution of the apparent losses

`GROUNDING_CLAIM_UNSUPPORTED` — the pre-existing local artifact §113 documented and §110/§112/§114
measured as local-only (0/14 hosted) — accounts for every remaining apparent drop:

| | baseline | projected |
|---|---|---|
| rows with `GROUNDING_CLAIM_UNSUPPORTED` | **6** | **3** |
| quotes emitted / bound | 21 / 21 | **26 / 26** |
| unbindable | 0 | 0 |
| normalized `VALID` | 27 / 27 | 27 / 27 |

- `R6-I` baseline "cand 0 ×3" is **not a reasoning miss** — candidates were produced and dropped at
  the grounding boundary.
- `V1-CTRL` projected "cand 2" is **not a projection suppression** — all **3/3** reps produced
  `lockout_tagout / ACTIVE / CONTRADICTS_DETERMINISTIC` at the wire, with the defeating fact named
  (*"stored energy has not yet been bled down or verified at zero, despite the press being locked
  out"*). One was refused by the untouched boundary rule for an unsupported grounding claim.

**The projected arm has strictly better grounding than the baseline** — half the failures, more
bound quotes, zero unbindable.

---

# Phase 9 — State-aware instrumentation

`backend/scripts/lib/expert-state-aware-scoring.ts`, **recording-only**.

`expert-routing-metrics.ts` is byte-unchanged (SHA-256 in `CONFINEMENT.txt`). `verdictFor` is
unchanged. `ROUTING_EXPECTATIONS` is unchanged. **No pass/fail gate changed and no historical score
was recomputed or rewritten.**

Records per candidate: `assertedConditionState`, `confidence`, `relationshipToDeterministic`,
`requiresUserConfirmation`, `groundingStatus`, `evidenceQuoteCount`,
`sameFamilyAsDeterministicAssessment`, `standsAgainstDisposition`, `overridePathwaySupplied`, and
the matched current-exposure / hypothetical lexical markers. Per response: clarification
criticalities and affected decisions, disagreement surfaces and types,
`unsupportedSameFamilyActive`, `supportedOverrides`, `agreedSilently`.

**It resolves the §115 defect it was built for.** Given the nine frozen hosted R6 candidates it
distinguishes `UNKNOWN`×3 (v4) from `ACTIVE`×3 (v5/v6) — nine responses that the frozen cardinality
scorer records identically as one candidate, `INCORRECT_POPULATED`.

## Two disclosed instrumentation limitations

1. **`overridePathwaySupplied` under-counts.** It requires a lexical `CURRENT_EXPOSURE_MARKERS`
   match, and the marker set is incomplete — `R6-I`'s *"the press **is now running** production
   parts"* is a genuine current-exposure statement that the `\bis\s+running\b` pattern misses. The
   counter is directionally useful; `relationshipToDeterministic` is the more reliable signal and is
   what the headline table uses. Recorded, not tuned — tuning a regex until it produces the desired
   number is the failure mode this programme has been most careful about.
2. **The model over-applies `CONTRADICTS_DETERMINISTIC` under projection.** `V8`'s
   `chemical_exposure` candidate declares `CONTRADICTS_DETERMINISTIC` while its own text says *"The
   deterministic finding already identifies chemical exposure as active"* — that is an *addition*,
   not a contradiction. 79% is therefore an over-estimate of true disagreement. This is a
   calibration issue for the block's wording, it is conservative in direction (over-declaring
   disagreement surfaces more for review, not less), and it is a named item for the hosted phase.

---

# The limitation that bounds everything above

**`R6` is clean in both arms locally, so this diagnostic carries NO information about the primary
defect.** `R6` has never reproduced against the local provider (§109, §110, §113), and §114.6
measured the local 30B model and Claude Sonnet 5 as structurally divergent on exactly this reasoning
pattern.

What the local run therefore proves is **safety, not efficacy**: that supplying deterministic state
does not suppress recall, does not silence Expert, does not degrade grounding, and does not turn
Expert into a rubber stamp — including on four fixtures where the deterministic layer is
demonstrably wrong. Whether it removes the hosted `R6` over-routing is **unproven and unprovable
locally**, and is exactly what a bounded hosted test would exist to answer.
