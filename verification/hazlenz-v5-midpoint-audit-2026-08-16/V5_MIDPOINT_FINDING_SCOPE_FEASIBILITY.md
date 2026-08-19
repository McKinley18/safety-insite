# V5 Midpoint Audit — Phase 5: Finding-Scoped Evidence-Sufficiency Feasibility

## Finding-identity precedent (V5-C01)

`computeFindingRisk()` (`backend/src/inspection/inspection.service.ts:333-360`) derives `evidenceText`
strictly from `hazard.observationFragment + mechanism + supportingSignals` for one hazard, keyed by
`stableHazardKey()` (`:317-321`, using `domainId || hazardFamily || hazardId || mechanism`), called once
per hazard in `reconcileDecompositionFindings()`. This is a real, shipped, per-finding pattern —
**finding identity/keying is not a blocker**; C01 proves it is directly reusable for a future
finding-scoped sufficiency pass.

## Multi-hazard fragment quality — traced two representative cases

**Case 1**: `"unguarded rotating pulley... while a nearby open junction box had exposed live parts"`
decomposed to only **1** hazard (`machine_guarding`) — the electrical-exposure regex
(`multi-hazard-decomposition.service.ts:406-410`) requires panel/wire/conductor-family terms that
"junction box"/"live parts" don't match. Minor independent finding: decomposition coverage is
regex-brittle even for sentences that read as clearly two-hazard to a human.

**Case 2**: `"A mechanic reached into the baler to clear a jam while hydraulic pressure remains in the
ram, and a nearby employee walked past an open electrical panel with exposed energized bus bars."`
decomposed to **3** hazards:

- `haz-1` (electrical) and `haz-2` (hydraulic_pneumatic_energy) received genuinely **local**
  `observationFragment` values (true sub-clauses). Running `buildHazardScopedEvidenceFacts` +
  `evaluateEvidenceSufficiency` per hazard produced meaningfully different, more granular scores than the
  whole-text score: `haz-2` alone scored `insufficient (0.29)` — a genuinely vague finding **masked**
  inside the whole-text `weak (0.43)` score. This is concrete positive evidence that finding-scoped
  scoring would add real value where fragments are genuinely local.
- `haz-3` (lockout_tagout, from the `crossClauseLoto` fallback path,
  `multi-hazard-decomposition.service.ts:331-346`) had `observationFragment` **equal to the entire
  2-hazard original text** (`FRAGMENT_IS_WHOLE_TEXT: true`). Scoring this "finding" per-hazard would
  silently re-score the fused whole text under a per-finding label — false precision, not true
  finding-scoping.

## The whole-text-fallback pattern is systemic, not a one-off bug

This is a deliberate, recurring pattern for hazard families whose definitional evidence inherently spans
clauses: `contractor_coordination` (`coordinationText = observationText`, lines 1172-1198),
`corrective_action_verification_failure` (`lifecycleText = observationText`, lines 1204-1232), and the
hydraulic/LOTO cross-clause detectors (lines 280-364). `training_procedure_supervision` is closer to
correct but uses a different clause-split (`.split(/[.!]/)`, line 1152) than the primary fragment loop,
so alignment with other hazards in the same observation isn't guaranteed either.

## Citation and fact attribution beyond decomposition

- `buildHazardScopedEvidenceFacts()` (`shared-evidence-facts.ts:380-382`) is a real, correct, additive
  primitive — but **not wired into any live decision path today**. The live call site
  (`intelligence-orchestrator.service.ts:410-415`) passes `buildEvidenceFacts()` on the whole fused text,
  not the hazard-scoped variant.
- `primaryCitation` is computed **once, globally**, not per-hazard (a single `resolvedPrimaryCitation`
  IIFE around `safescope-v2.service.ts:3199`). The C03 gate's blocking rule requires both bottom-tier
  sufficiency *and* absence of citation — a finding-scoped gate would need finding-scoped citation
  attribution too, which **does not exist anywhere in the codebase today**, a second and independent
  prerequisite gap beyond fact attribution.

## Feasibility classification: **FOUNDATION_INCOMPLETE**

Not `READY`/`READY_WITH_LIMITATIONS`: a demonstrated, non-trivial subset of hazard-family detectors
produce whole-text-contaminated `observationFragment` values. A naive implementation using that field
directly would convert today's honestly-disclosed coarse-gate limitation (already documented in C03's own
`V5_C03_DECISION_MATRIX.md` "finding-scope limitation" section) into an **undisclosed false-precision
defect** for those specific hazard families — arguably worse than the status quo, since it would look
authoritative while re-scoring the same whole-text evidence under a misleadingly specific per-finding
label.

Not `HIGH_REGRESSION_RISK`/`NOT_JUSTIFIED`: this is a feasibility read, not an implementation attempt, and
Case 2's `haz-2` result (a genuinely vague finding masked by a well-evidenced sibling in the whole-text
score) is concrete evidence of real value once the prerequisites are closed. The value case is not in
question — only current readiness.

## What closing FOUNDATION_INCOMPLETE would require (not implemented, per audit constraints)

1. Either fixing or explicitly allowlisting which hazard-family detectors produce genuinely local
   fragments before trusting per-finding scoring on them — this likely requires touching
   `multi-hazard-decomposition.service.ts`, a protected-adjacent file that no phase to date (including
   C01) has been authorized to modify; C01 deliberately worked around this boundary rather than crossing
   it, and the same discipline should apply here.
2. A finding-scoped citation-attribution design, currently absent from C01/C02/C03 entirely.

## Remaining uncertainty

The heap-guarded degraded orchestrator path was not traced to confirm whether it sets
`evidenceSufficiency` to `undefined` (gate no-ops) or returns a low-quality-but-defined object under
memory pressure. This does not affect the FOUNDATION_INCOMPLETE classification but would need separate
verification before any implementation phase.
