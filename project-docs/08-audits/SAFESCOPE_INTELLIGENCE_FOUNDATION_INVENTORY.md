# SafeScope Intelligence Foundation Inventory

## Files Reviewed
- `backend/src/safescope-v2/reasoning-orchestrator/`
- `backend/src/safescope-v2/standards/`
- `backend/src/safescope-v2/equipment-knowledge/`
- `backend/src/safescope-v2/mechanism-intelligence/`
- `backend/src/safescope-v2/hazard-domain-intelligence/`
- `backend/src/safescope-v2/action-quality/`
- `backend/scripts/audit-safescope-findings.ts`
- `safescope-data/benchmarks/safescope-finding-audit.v1.json`

## Existing Useful Components
- `ReasoningOrchestratorService`: Central logic hub, already performing multi-step reasoning.
- `ApplicabilityAnalysisService`: Maps standards to context; contains citation logic.
- `CorrectiveActionReasoningService`: Generates action recommendations.
- `EquipmentTaskMechanismDetectorService`: Detects specific failure modes.
- `Taxonomy/Standard Seeds`: Seeds exist (e.g., `standards/seed/standards.seed.ts`), but they are currently fragmented and not used as a unified registry.

## Gaps Found
- **No Unified Taxonomy Registry:** Hazard domains, aliases, and mechanisms are scattered across multiple files (`hazard-taxonomy.ts`, `reasoning-orchestrator.service.ts`).
- **Citation Fragmentation:** Citations are hard-coded in seeds or loosely coupled in `ApplicabilityAnalysis`. No central "Standards Applicability" source of truth exists.
- **Action Template Fragmentation:** Corrective actions are generated in service logic rather than based on a template registry.
- **Confidence Governance:** Confidence is calculated based on simple heuristics in the orchestrator, not on the quality/completeness of the underlying reasoning chain.

## Implementation Plan: New Foundation Files
- **Taxonomy:** `backend/src/safescope-v2/taxonomy/safescope-taxonomy.registry.ts`
- **Standards:** `backend/src/safescope-v2/standards/standards-applicability.registry.ts`
- **Actions:** `backend/src/safescope-v2/corrective-actions/corrective-action-template.registry.ts`

These files will centralize existing logic and extend it to meet the requirements for authoritative safety reasoning.
