# Gemini Build Prompt: Integrate SafeScope Intelligence Foundation Into Live Reasoning

You are working in the active Sentinel Safety repository:

/Users/mckinley/Sentinel_Safety

The SafeScope intelligence foundation registries now exist, but the audit shows they are not fully consumed by the active reasoning pipeline.

Your job is to wire the new foundation into the real SafeScope output path so the audit improves because SafeScope itself improves, not because the evaluator is loosened.

## Absolute Rules

1. Do not commit.
2. Do not push.
3. Do not deploy.
4. Do not delete files.
5. Do not create another disconnected architecture layer.
6. Reuse the foundation files already created:
   - backend/src/safescope-v2/taxonomy/safescope-taxonomy.registry.ts
   - backend/src/safescope-v2/standards/standards-applicability.registry.ts
   - backend/src/safescope-v2/corrective-actions/corrective-action-template.registry.ts
7. Integrate these registries into the active SafeScope reasoning path.
8. The result must be deterministic, explainable, auditable, and production-build safe.
9. Run the audit and production readiness checks after implementation.

## Current Audit Result

Before this integration pass:

- Average weighted score: 29.50
- Pass: 0
- Review: 0
- Fail: 4

Known remaining failures:

1. Standards/citation registry is not being consumed by the live applicability/citation output.
2. Corrective action template registry is not being consumed by the live corrective action reasoning.
3. Confidence still needs governance tied to missing citation, weak actions, and weak mechanism.
4. Taxonomy aliases and canonical families need consistent normalization.
5. Roof-control was routed better, but output still does not score properly because downstream outputs are incomplete.

## Mission

Integrate the foundation into the live SafeScope reasoning system.

## Step 1: Inspect Current Changed Files

Review:

- backend/src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service.ts
- backend/src/safescope-v2/taxonomy/safescope-taxonomy.registry.ts
- backend/src/safescope-v2/standards/standards-applicability.registry.ts
- backend/src/safescope-v2/corrective-actions/corrective-action-template.registry.ts
- backend/src/safescope-v2/reasoning-orchestrator/corrective-actions/
- backend/src/safescope-v2/reasoning-orchestrator/applicability-analysis/
- backend/scripts/audit-safescope-findings.ts
- safescope-data/benchmarks/safescope-finding-audit.v1.json

Identify the exact live output fields used by the audit harness.

## Step 2: Citation Integration

Wire the standards applicability registry into the live SafeScope reasoning result.

For each benchmark case, SafeScope must expose a primary citation in a stable readable field the audit harness can consume.

Minimum expected citation behavior:

- Unguarded conveyor tail pulley, surface metal/nonmetal mining:
  - 30 CFR 56.14107

- 7-foot unprotected trench in OSHA construction:
  - 29 CFR 1926.652(a)(1)

- Loose/fractured roof strata in underground coal travelway:
  - 30 CFR 75.202(a)

- Missing junction box cover exposing energized terminals in OSHA general industry:
  - 29 CFR 1910.303(g)(2)(i)

Do not hard-code only these cases in the audit script. The reasoning service must produce these outputs through reusable applicability logic.

If the existing result type lacks a clean citation field, add one in a backward-compatible way, such as:

- applicabilityAnalysis.primaryCitation
- standardsReasoning.primaryCitation
- primaryCitation

Use whatever structure best fits the existing SafeScope result contract, but make it stable and documented.

## Step 3: Corrective Action Template Integration

Wire the corrective action template registry into the live corrective action reasoning output.

SafeScope must return hazard-specific actions, not generic-only actions.

Minimum action expectations:

### machine_guarding / rotating_equipment_nip_point

Actions should include concepts like:
- stop/restrict access
- install/repair guard
- prevent contact with moving parts or nip point
- verify guard before operation

### excavation_trenching / collapse

Actions should include:
- remove workers from excavation
- install protective system
- slope, shore, shield, or bench
- competent person inspection
- safe egress

### roof_control / fall_of_ground

Actions should include:
- restrict access
- scale loose rock where safe
- install supplemental support
- follow roof control plan
- qualified examination

### electrical / shock

Actions should include:
- de-energize where required
- install junction box cover
- guard exposed energized parts
- verify insulation/enclosure integrity
- restrict access until corrected

Maintain the existing generic actions only as supplemental fallback actions, not as the primary output when a hazard-specific template exists.

## Step 4: Mechanism Normalization

SafeScope must output a normalized mechanism when the taxonomy/context supports it.

Minimum expected mechanisms:

- conveyor/pulley/nip point/unguarded → rotating_equipment_nip_point
- trench/excavation/no shoring/sloping/shielding → collapse
- coal underground/loose roof/fractured roof/loose rock/roof strata → fall_of_ground
- exposed energized terminals/missing electrical cover → shock

If SafeScope also returns a human-readable mechanism label, keep it, but add a canonical mechanism field that the audit can score.

## Step 5: Canonical Hazard Family Normalization

Use canonical family names consistently.

At minimum:

- trenching_and_excavation should normalize to excavation_trenching, or the audit should recognize the canonical output through the alias registry.
- roof_control and ground_control must be carefully handled:
  - If the registry uses ground_control as the broader family, roof_control must be a recognized subtype or alias.
  - The benchmark expectation should be satisfied if the output clearly identifies roof_control/ground_control with fall_of_ground and the correct 30 CFR 75.202(a) citation.

Do not allow underground coal roof conditions to be classified as walking_working_surfaces.

## Step 6: Confidence Governance

Modify confidence calculation so that high confidence is not allowed unless:

- hazard family is clear
- mechanism is clear
- authority/scope is clear
- primary citation is present
- corrective action template is hazard-specific
- no critical evidence gaps block the decision

Apply confidence caps:

- If primary citation is missing: max confidence = moderate
- If mechanism is missing: max confidence = moderate
- If corrective actions are generic fallback only: max confidence = moderate
- If taxonomy comes from weak fallback: max confidence = moderate
- If family is uncertain or contradicted by context: max confidence = low

The audit should stop reporting “confidence inappropriately high” for cases where supporting output is incomplete.

## Step 7: Audit Harness Alignment

Update backend/scripts/audit-safescope-findings.ts only as needed to consume real SafeScope fields.

Do not weaken the scoring.

The harness must still score:

- hazard family
- mechanism
- citation
- corrective action specificity
- confidence calibration
- immediate control / shutdown where available
- total weighted score

Make sure the JSON output includes readable actual fields:

- actual.hazardFamily
- actual.hazardMechanism
- actual.primaryCitation
- actual.confidence
- actual.correctiveActions
- actual.requiresShutdownOrImmediateControl if available

## Step 8: Run Commands

Run:

npm --prefix backend run audit:safescope-findings

Then run:

./scripts/verify-production-readiness.sh

If either fails, fix the issue and rerun.

## Step 9: Update Report

Update or create:

project-docs/08-audits/SAFESCOPE_FOUNDATION_INTEGRATION_REPORT.md

Include:

- Files changed
- Integration approach
- Citation output changes
- Corrective action output changes
- Mechanism/canonical family changes
- Confidence governance changes
- Audit before/after
- Remaining weaknesses
- Commands run
- Production readiness result

## Success Criteria

This pass is successful if:

1. Audit runs successfully.
2. Production readiness passes.
3. Average weighted score improves materially from 29.50.
4. At least two benchmark cases move out of fail status.
5. Primary citations are present for benchmark cases.
6. Corrective actions become hazard-specific.
7. Confidence is no longer high when citation/mechanism/action quality is missing.
8. No commits, pushes, deployments, or destructive cleanup are performed.

## Final Response Required

Report:

- Files changed
- Audit score before and after
- Pass/review/fail before and after
- Remaining failures
- Exact commands run
- Whether production readiness passed
- Whether changes are ready for review/commit
