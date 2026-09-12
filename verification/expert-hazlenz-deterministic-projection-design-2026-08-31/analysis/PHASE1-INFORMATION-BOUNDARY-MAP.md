# Phase 1 — The deterministic → Expert information boundary, traced

## The actual flow

```
observation text  (ClassifyDto.text)
      |
      v
buildEvidenceFacts()                     shared-evidence-facts.ts      ── EvidenceFact[]
      |
      v
evaluate()  (module-private, NOT exported)   evidence-foundation.ts
      |
      v
applyEvidenceFoundation(result, request)  ── result.applicabilityDecisions: ApplicabilityDecision[]
      |                                      result.evidenceSnapshot     (facts, criticalUnknowns…)
      |                                      result.regulatoryContext    (jurisdiction + provenance)
      |
      X   ←──────── THE BOUNDARY. Nothing crosses. There is no code that reads
      |             applicabilityDecisions and produces an ExpertAnalysisInput.
      v
ExpertAnalysisInput.deterministicFindings: DeterministicFindingView[]
      |                                    ← hand-written in FIXTURES ONLY
      v
buildExpertUserPrompt(input)              expert-prompt.ts:479-488
      |
      v
provider.analyze()  →  bindWireAnalysis  →  normalizeExpertOutput  →  ExpertLayerInput
```

**The gap is not narrow and it is not a projection that drops a field. There is no projection at
all.** `runExpertAnalysis` consumes an `ExpertAnalysisInput` it is handed; nothing in `src/`
constructs one.

## Field-by-field inventory

`ApplicabilityDecision` (evidence-foundation.ts:11-28) is what the deterministic layer knows at the
moment Expert would be invoked.

| field | source | semantics | projected to Expert? | discarded? | recoverable? | customer-authoritative? | governed? |
|---|---|---|---|---|---|---|---|
| `family` | rule table | which hazard family was evaluated | **NO** | yes | yes (recomputable) | yes | no |
| `status` | `decision()` | `SUPPORTED` / `CONTRADICTED` / `UNKNOWN` / `NOT_APPLICABLE` / `NOT_SUPPORTED` | **NO** | yes | yes | yes | no |
| `confidence` | `decision()` | 0.96 / 0.8 / 0.45 / 0.05 by status | **NO** | yes | yes | yes | no |
| `requiredPredicates[]` | rule table | **the structured rationale** — name + status + factIds | **NO** | yes | yes | yes | no |
| `missingPredicates[]` | derived | which predicates are UNKNOWN | **NO** | yes | yes | yes | no |
| `contradictoryEvidence[]` | derived | which predicates are CONTRADICTED | **NO** | yes | yes | yes | no |
| `explanation` | `decision()` | prose form of the status | **NO** | yes | yes | yes | no |
| `citation` | rule table | e.g. `29 CFR 1910.212(a)(1)` | **NO — and MUST NOT BE** (see below) | yes | yes | yes | **yes** |
| `source` | constant | offline bundle id + version | **NO** | yes | yes | yes | yes |
| `jurisdictionProvenance` | extractor | `USER_CONFIRMED` / `HAZLENZ_INFERRED` / `UNKNOWN` | **NO** (`jurisdiction` string only) | partly | yes | yes | no |
| `evidenceSnapshot.facts` | extractor | the state facts, with `status` (observed/confirmed/contradicted) | **NO** | yes | yes | yes | no |
| `evidenceSnapshot.criticalUnknowns` | derived | union of missing predicates | **NO** | yes | yes | yes | no |

What Expert *does* receive (`ExpertAnalysisInput`): `authoritativeSources`, `inspectionContext`,
`jurisdiction` (bare string), `allowedHazardFamilies`, `deterministicFindings`
(`findingKey`/`hazardFamily`/`conditionState`/`isLifeCritical`/`isActionable`/`requiredActions`),
`governedStandards`, `answeredClarifications`.

**Every applicability determination is discarded. Every predicate-level rationale is discarded.
Every confidence is discarded. The distinction between "not evaluated" and "evaluated and excluded"
is discarded.**

## What the prompt can and cannot say

`expert-prompt.ts:479-488` renders exactly two shapes:

```
DETERMINISTIC FINDINGS ALREADY ESTABLISHED (authoritative — you cannot change these)
  (none — the deterministic engine established no finding)          ← the empty case
  - f1: lockout_tagout, state CONTROLLED                            ← the positive case
```

There is no third shape. A family that was **evaluated and excluded** is rendered identically to a
family that was **never considered**: as absence.

## Exactly what R6 loses

Measured this phase by running the real `applyEvidenceFoundation` on the exact R6 sentence:

```
extracted facts:      energyIsolationState = isolated_and_verified
                      guardState           = absent_or_ineffective

decision:             family     = OSHA General Industry machine guarding
                      citation   = 29 CFR 1910.212(a)(1)
                      status     = NOT_APPLICABLE
                      confidence = 0.96
                      predicates:  general-industry jurisdiction  = SUPPORTED
                                   machine guard condition        = SUPPORTED
                                   moving or accessible energy    = CONTRADICTED   ← controlling
                                   current condition              = SUPPORTED
```

What Expert is shown instead:

```
  - f1: lockout_tagout, state CONTROLLED
```

So Expert is not shown: that `machine_guarding` was evaluated; that it was excluded; that the
exclusion rests on `moving or accessible energy = CONTRADICTED`; or that the engine holds this at
0.96. Meanwhile prompt instruction 1 tells it to raise any hazard *"NOT already in the deterministic
findings above… Include it even if you are unsure."* `machine_guarding` is, as far as Expert can
see, simply absent.

## The citation constraint — a design conclusion, not an omission

`FORBIDDEN_EXPERT_FIELD_NAMES` includes `citation`, `citations`, `cfr`, `regulation`; and
`CITATION_SHAPED_PATTERN = /\b\d{2}\s*CFR\s*\d+/i` refuses a citation smuggled into **prose**, not
just into a field. The prompt's hard prohibitions repeat it: *"NEVER write a regulatory citation.
Not in a field, not in prose, not as an example."*

`ApplicabilityDecision.citation` is exactly such a string. **Projecting it would hand the model a
citation and invite it to echo one back — and the normalizer would then reject the entire
analysis.** The projection therefore carries the Expert taxonomy family (`machine_guarding`) and
never the citation, the bundle, or the source. This is why the projection needs a family-label →
Expert-family mapping rather than passing the decision through.

## Incidental observation, recorded not pursued

The extractor also emits `egressState = locked_or_blocked` on the R6 sentence — evidently from the
words *"locked out"*. It produces no decision here because `egressRoute` is absent, so it is inert
on this observation. Recorded for completeness; out of scope for this phase and not investigated.
