# SafeScope Taxonomy Improvement Plan

## 1. Executive Summary
SafeScope currently relies on a hybrid, rule-based approach. The taxonomy is the foundation for all expert reasoning. Current limitations in taxonomy consistency, canonical naming, and standards linkage prevent the engine from delivering authoritative safety insights. This plan details the architectural shift required to establish a governed, deterministic safety intelligence backbone.

## 2. Current Taxonomy Inventory
- **Current Domains:** `machine_guarding`, `excavation_trenching`, `ground_control`, `electrical`.
- **Aliases:** Fragmented across `ReasoningOrchestratorService` and `SAFESCOPE_TAXONOMY_REGISTRY`.
- **Mechanisms:** Currently represented by descriptive labels rather than canonical IDs.
- **Standards Linkage:** Partially implemented in `standards-applicability.registry.ts`.
- **Gaps:** Inconsistency in naming conventions between engine output and benchmark expectations; mechanism labels are not normalized to IDs.

## 3. Current Taxonomy Weaknesses
- **Alias Proliferation:** Conflicting taxonomy names between internal engine domains and regulatory benchmarks.
- **Mechanism Ambiguity:** Engine outputs descriptive strings rather than stable, machine-readable mechanism IDs.
- **Registry Fragmentation:** Knowledge and logic are still partially duplicated between service methods and registries.

## 4. Recommended Canonical Taxonomy Architecture
A hierarchical structure is essential:
`Domain` → `Hazard Family` → `Hazard Type` → `Mechanism ID` → `Exposure Pathway` → `Jurisdiction Scope` → `Standards` → `Actions`.
This allows the engine to route reasoning through a structured decision path, ensuring compliance and auditability.

## 5. Recommended Initial Canonical Domains
- `machine_guarding`, `electrical`, `fall_protection`, `walking_working_surfaces`, `excavation_trenching`, `confined_space`, `hazardous_energy_loto`, `mobile_equipment`, `ground_control`, `roof_control` (specialized), etc.
- Each domain should map to specific mechanisms, jurisdiction-based standards, and corrective action themes.

## 6. MSHA-Specific Taxonomy Needs
Mapping must distinguish between surface/underground and coal/metal/nonmetal to accurately select citations (e.g., 30 CFR 56 vs 57 vs 75 vs 77).

## 7. OSHA General Industry Taxonomy Needs
Requirements: 1910 electrical (guarding/live parts), machine guarding, PITs, LOTO.

## 8. OSHA Construction Taxonomy Needs
Requirements: 1926 excavation (protective systems), fall protection, scaffolds.

## 9. Mechanism Registry Improvement Plan
Normalization of all findings into canonical IDs:
- `rotating_equipment_nip_point`
- `collapse`
- `fall_of_ground`
- `shock`

## 10. Standards Linkage Model
Domain + Jurisdiction + Context → Primary Citation. This mapping must be enforced by `StandardsApplicabilityRegistry`.

## 11. Corrective Action Linkage Model
Actions should be domain-specific. Fallback generic actions are prohibited for known expert domains.

## 12. Evidence Sufficiency Model
Each finding requires specific supporting evidence (e.g., photo + equipment type + exposure indicator).

## 13. Confidence Governance
High confidence requires taxonomy match + mechanism ID + primary citation + hazard-specific corrective action + zero critical evidence gaps.

## 14. Human Review Triggers
High-risk potential, stop-work necessity, or low confidence force human review.

## 15. Proposed TypeScript Registry Structure
```ts
export interface TaxonomyRegistryEntry {
  canonicalId: string;
  hazardFamilyId: string;
  mechanismIds: string[];
  aliases: string[];
  standardsMapping: Record<Jurisdiction, CitationInfo>;
  correctiveActionTemplateId: string;
  requiredEvidenceFields: string[];
}
```

## 16. Migration Plan
1. Centralize taxonomy nomenclature.
2. Canonicalize all mechanism IDs.
3. Migrate citation logic to `StandardsApplicabilityRegistry`.
4. Enforce confidence governance rules.

## 17. Benchmark Expansion Plan
Expand from 4 to 100+ cases, categorized by jurisdiction, industry, and hazard severity.

## 18. Immediate Next Implementation Steps
1. Canonicalize taxonomy names in the `TAXONOMY_REGISTRY` to match benchmark expectations.
2. Update mechanism detection to output `mechanismId`.
3. Link `StandardsApplicabilityRegistry` to the orchestrator citation selection.
4. Update confidence rules to gate high confidence.
5. Expand benchmark test cases.

## 19. Files Reviewed
- `backend/src/safescope-v2/taxonomy/safescope-taxonomy.registry.ts`
- `backend/src/safescope-v2/mechanism-intelligence/safescope-mechanism.registry.ts`
- `backend/src/safescope-v2/standards/standards-applicability.registry.ts`
- `backend/src/safescope-v2/corrective-actions/corrective-action-template.registry.ts`

## 20. Do Not Touch / Preserve
- Core orchestrator reasoning logic.
- Existing benchmark structure.
