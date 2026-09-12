# DETERMINISTIC → EXPERT STATE PROJECTION + STATE-AWARE SCORING DESIGN — 2026-08-31

**Terminal: `EXPERT_HAZLENZ_DETERMINISTIC_PROJECTION_DESIGN_ACCEPTED — BOUNDED_HOSTED_PROJECTION_TEST_AUTHORIZATION_REQUIRED`**

Zero hosted provider calls. 108 local calls (Ollama `qwen3-coder:30b`, localhost only). **$0.00.**
No production or customer behaviour changed; every production file byte-unchanged with SHA-256
recorded. Nothing committed, pushed, tagged or deployed.

```
HEAD        37a5d1b50abe836eb19dd24ee18ad10557bda131   (local only, unchanged)
origin/main de655d2f6e4c0ff7b0de17f9ccfbd3668138a936   (unmoved)
ahead 1 / behind 0 · stashes 4 (unchanged) · tags 24 (unchanged)

EXPERT_PROMPT_VERSION                   = hazlenz.expert.prompt.v6   (UNCHANGED, byte-identical)
EXPERT_HAZLENZ_PROVIDER_VALIDATED       = FALSE
EXPERT_HAZLENZ_CUSTOMER_ACTIVE          = FALSE
17_MEASURE_EVALUATION_COHORT_AUTHORIZED = FALSE
LOCAL_R2_EVIDENCE_CLIFF_DEBT_OPEN       = TRUE (preserved, untouched)
```

---

## 1. The hypothesis is confirmed — and it is larger than "a field is missing"

`DETERMINISTIC_DECISION_NOT_PROJECTED_TO_EXPERT` holds. **There is no projection at all.** Nothing
in `src/` constructs an `ExpertAnalysisInput`; every `deterministicFindings` array in the repository
is hand-written in a fixture (`PHASE2`). The deterministic layer computes
`applicabilityDecisions` on the customer path today and discards all of it at a boundary that does
not yet exist.

For R6 specifically the engine knows — measured this phase from the real
`applyEvidenceFoundation` — that `machine_guarding` is `NOT_APPLICABLE` at **0.96** because
`moving or accessible energy = CONTRADICTED`. Expert is shown `lockout_tagout / CONTROLLED` and
nothing else, then told by instruction 1 to raise hazards *"NOT already in the deterministic
findings above."*

`buildExpertUserPrompt` renders only two shapes — a positive finding, or *"(none — the
deterministic engine established no finding)"*. **A family evaluated and excluded renders
identically to a family never considered.**

## 2. The second finding is more serious than the first

**A pre-existing production defect: `DETERMINISTIC_MACHINE_GUARDING_EXCLUSION_SHORT_CIRCUIT`.**
Reported, **not repaired** — `evidence-foundation.ts` is customer-authoritative and a fix needs its
own authorization and re-baselining.

`notApplicable = guardPresent || energySafe` is passed to `decision()`, which short-circuits
`status` *before* consulting predicate statuses. Once `isolated_and_verified` is extracted anywhere
in the text, machine guarding is excluded at 0.96 regardless of everything else:

| fixture | observation states | decision | correct? |
|---|---|---|---|
| `R6` | verified zero-energy isolation | `NOT_APPLICABLE` 0.96 | yes |
| `V2` | accumulator **left charged** | `NOT_APPLICABLE` 0.96 | **NO** |
| `V4` | second circuit **on live shop air** | `NOT_APPLICABLE` 0.96 | **NO** |
| `V7` | **technician's hands in the point of operation** | `NOT_APPLICABLE` 0.96 | **NO** |
| `R6-I` | **press running with the guard off** | `NOT_APPLICABLE` 0.96 | **NO** |

`V4` is internally contradictory: status `NOT_APPLICABLE` with **all four** required predicates
`SUPPORTED`.

This turned Phase 7's anti-rubber-stamp controls from constructed into **real**, which is far
stronger evidence — and it forced a design guard (§5 below).

## 3. Design selected

**A new sibling array on `ExpertAnalysisInput`: `deterministicFamilyDispositions[]`.** Six
alternatives were compared (`PHASE2`); `DeterministicFindingView` was **rejected despite the
convenient name** because a `NOT_APPLICABLE` determination is not a finding,
`ExpertConditionState` has no member meaning "evaluated and excluded" (and adding one breaks a
frozen vocabulary the foundation suite asserts byte-identical to the Level-3 one), and it cannot
carry a predicate-level rationale.

Projected fields: `hazardFamily`, `disposition` (`ACTIVE`/`CONTROLLED`/`NOT_APPLICABLE`/`UNKNOWN`),
`isActionable`, `confidence`, `controllingFacts[]` (the engine's own predicate names + statuses),
`rationale` (derived, one sentence), `evidenceQuotes[]`, `provenance`.

**Citation-free by necessity, not oversight.** `CITATION_SHAPED_PATTERN` refuses `\d{2} CFR \d+`
in Expert output *including prose*. Projecting `ApplicabilityDecision.citation` would invite the
model to echo it and get the **entire analysis rejected** by the normalizer.

## 4. The contract is sufficient — no new collection proposed

`expertDisagreements` **alone is insufficient**: `ExpertDisagreement` has no `evidence` field and no
`groundingStatus`, so it is structurally ungrounded and cannot supply the "exact observation
evidence" an override requires.

But the pair suffices, and both halves already exist: the **grounded** half rides on
`ExpertHazardCandidate` (`evidence`, `groundingStatus`, and the already-legal
`relationshipToDeterministic: CONTRADICTS_DETERMINISTIC`), the **authority-challenge** half on
`ExpertDisagreement` with surface `NEGATION_AND_SAFE_STATE` or `CONDITION_STATE_INTERPRETATION`
(both already `CHALLENGE`-permitted). The bar *"do not add another collection without proof it is
required"* is not met, so **nothing is added**.

## 5. Local A/B result — safety proven, efficacy not provable locally

108 calls, 2 runs × 9 cases × 2 arms × 3 reps. Exactly one variable differs between arms.

**`silentAgreementReps = 0/3` on every case except R6, both arms, both runs.** The projection never
silenced Expert anywhere danger was present.

**The headline metric** — `relationshipToDeterministic` across every raw-wire candidate:

| | baseline | projected |
|---|---|---|
| `CONTRADICTS_DETERMINISTIC` | **3 / 27 (11%)** | **23 / 29 (79%)** |
| `REFINES_DETERMINISTIC` | 10 | 0 |
| `ADDITIONAL_TO_DETERMINISTIC` | 13 | 6 |
| **total candidates** | **27** | **29** |

**Candidate volume did not fall.** The projection re-routed disagreement into the contract's
explicit, auditable override channel — exactly the reviewer relationship the authorization
specified.

Anti-rubber-stamp gates, all passing:

- **`R6-I`** (engine says `NOT_APPLICABLE` 0.96, press running unguarded): baseline **cand 0** →
  projected **cand 3**, overriding with a direct quote of the observation.
- **`V7`** (engine says `NOT_APPLICABLE` 0.96, technician's hands in the machine): override held
  3/3, formally expressed 2/3, `unsupportedSameFamilyActive` 3 → 1.
- **`V1-CTRL`** (constructed `CONTROLLED` on an observation stating energy was *not* bled):
  **3/3** `CONTRADICTS_DETERMINISTIC` at the wire, naming the defeating fact.
- **`V8`** (family the engine never assessed): unchanged — additions unaffected.
- **`V5`** (`UNKNOWN` 0.45): cand 3 → 5; `UNKNOWN` did not silence Expert.

**The one genuine suppression was found and fixed.** Run 1 measured `V4`'s `machine_guarding`
candidate disappearing 3/3 under projection — caused by projecting `V4`'s internally contradictory
exclusion. The response was a projection-side guard (`isExclusionPredicateJustified`: an exclusion
is projectable only when at least one required predicate is actually `CONTRADICTED`). Run 2 confirms
it changed **only `V4`** (6 = 6, parity restored) and left all eight other cases identical. **The
engine was not modified.**

**Grounding improved**: projected arm 3 `GROUNDING_CLAIM_UNSUPPORTED` rows vs baseline 6; 26/26
quotes bound vs 21/21; 0 unbindable both; 27/27 `VALID` both. The remaining apparent losses
(`R6-I` baseline, `V1-CTRL` projected) are that pre-existing local-only artifact, not projection
effects.

### The bounding limitation

**`R6` is clean in both arms locally, so this diagnostic carries no information about the primary
defect.** R6 has never reproduced locally (§109/§110/§113) and §114.6 measured the local model and
Sonnet 5 as structurally divergent on exactly this pattern. What is proven here is **safety, not
efficacy**. Whether the projection removes the hosted R6 over-routing is unproven and unprovable
locally.

## 6. State-aware instrumentation — recording-only

`expert-routing-metrics.ts` is byte-unchanged; `verdictFor` unchanged; **no pass/fail gate changed
and no historical score rewritten.** The recorder distinguishes the nine frozen hosted R6
candidates as `UNKNOWN`×3 / `ACTIVE`×3 / `ACTIVE`×3 — nine responses the frozen cardinality scorer
records identically.

Two limitations disclosed rather than tuned away: `overridePathwaySupplied` under-counts because its
lexical marker set is incomplete (it misses `R6-I`'s *"is now running"*); and the model
**over-applies** `CONTRADICTS_DETERMINISTIC` under projection (`V8` labels an addition a
contradiction), so 79% overstates true disagreement. The second is conservative in direction and is
a named calibration item for the hosted phase.

## 7. `R6-H` / `R6-I` established

`backend/src/safescope-v2/expert-hazlenz/fixtures/restoration-transition-fixtures.ts` — a new file;
`routing-fixtures.ts` is byte-unchanged and `R6` is untouched. The corpus now separates three states
the word "reinstatement" collapses:

| | state | expectation |
|---|---|---|
| `R6` | FUTURE PREREQUISITE | nothing |
| `R6-H` | CURRENT TRANSITION | clarification REQUIRED, candidate OPTIONAL |
| `R6-I` | CURRENT ACTIVE EXPOSURE | candidate REQUIRED (hard recall gate) |

Both passed locally in both arms.

## 8. Protected regression + confinement

All 14 suites, every exit code 0, identical to the §108–§115 baseline, zero deltas: Expert
**56/58/40/30/51/131/141**; quarantine **61/0** and **37/0**; HazLenz floors exit 0 with **0
dangerous, 0 life-critical omissions**; `tsc --noEmit` 0.

Confinement: Expert-core diff remains the pre-existing 4-file §105–§113 diff, not added to.
`expert-prompt.ts`, `expert-normalization.ts`, `expert-contract.types.ts`,
`expert-routing-metrics.ts`, `expert-runner.ts`, `expert-authority-merge.ts`, all three prior
fixture files, `evidence-foundation.ts` and `shared-evidence-facts.ts` are byte-unchanged with
SHA-256 recorded. Zero controller/service/module references; zero frontend references; **zero
references to the prototype from `src/`**. The prototype and harness live under `scripts/`; the new
fixture file is imported only by the diagnostic harness. Pre-existing unrelated work —
`frontend-next/tsconfig.json` modification and the `ecfr-1910-146.xml` deletion — preserved
untouched, as are the 4 stashes and 24 tags.

## 9. Exact next operation (not authorized here)

**A bounded hosted projection test.** It is justified because the local instrument has now proven
the property it *can* prove (safety) and is structurally incapable of proving the one that matters
(efficacy on Sonnet 5).

Proposed matrix, all through the real unmodified `AnthropicExpertProvider`, both arms:
`R6`×3 (primary — the defect the local instrument cannot see), `V7` and `R6-I` (anti-rubber-stamp
hard gates against a wrong `NOT_APPLICABLE@0.96`), `R6-H` (current-transition), `V8`
(different-family addition), `V5` (`UNKNOWN`). Falsification condition, per the authorization: if
Sonnet 5 receives the `NOT_APPLICABLE` determination with its rationale and still asserts `ACTIVE`
`machine_guarding` without identifying a concrete omitted pathway, the hypothesis is weakened or
refuted.

Two prerequisites that are **not** blockers but must be recorded in the authorization:

1. The `DETERMINISTIC_MACHINE_GUARDING_EXCLUSION_SHORT_CIRCUIT` defect needs its own adjudication
   phase. The projection guard contains it for the prototype; it does not fix the engine, and the
   engine is customer-authoritative.
2. The `CONTRADICTS_DETERMINISTIC` over-application needs block-wording calibration, measurable in
   the same hosted run.

## Evidence index

| file | contents |
|---|---|
| `analysis/PHASE1-INFORMATION-BOUNDARY-MAP.md` | full data-flow trace; field-by-field inventory; exactly what R6 loses; the citation constraint |
| `analysis/PHASE2-DETERMINISTIC-FINDING-VIEW.md` | verified fixture-only status; six extension points compared |
| `analysis/PHASE3-4-5-PROJECTION-AND-DISAGREEMENT-DESIGN.md` | the minimum projection; per-disposition disagreement semantics; contract-sufficiency proof |
| `analysis/PHASE6-9-PROTOTYPE-AND-LOCAL-DIAGNOSTIC.md` | prototype, contrasts, full A/B result, instrumentation, limitations |
| `evidence/DETERMINISTIC-EXCLUSION-SHORT-CIRCUIT.md` | the production defect, measured, with recommended follow-up |
| `transport/ab-run1.jsonl` | run 1 — pre-guard, 54 calls, full raw wire |
| `transport/ab-run2-guarded.jsonl` | run 2 — with guard, 54 calls, full raw wire |
| `results/*-summary.json` | per-case, per-arm state-aware aggregates |
| `protected-state/`, `CONFINEMENT.txt` | executed suite output and confinement proof |
