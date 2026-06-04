# SafeScope Modular Knowledge Architecture Plan

## 1. Executive Summary
The SafeScope reasoning system must evolve from a monolithic orchestrator into a modular, governance-driven intelligence engine. This modularity is critical to ensure clear source authority (MSHA/OSHA vs guidance), maintainable taxonomy and standards registries, and a scalable architecture that can accommodate future AI-assisted learning without compromising safety or auditability.

## 2. Current Architecture Inventory
- `ReasoningOrchestratorService`: Central logic hub; currently overloaded with routing/logic.
- `Registry Services`: Centralizing taxonomy, mechanisms, standards, and actions.
- `ApplicabilityAnalysisService`: Maps standards to context.
- `CorrectiveActionReasoningService`: Generates action recommendations.
- `EquipmentKnowledge`: Detects failure modes and archetypes.
- `Taxonomy/Standard Seeds`: Fragmented knowledge data.

## 3. Current Modularity Risks
- **Orchestrator Bloat:** Reasoning logic is tightly coupled with domain-specific routing rules.
- **Data/Logic Mixing:** Registry data (e.g., standard applicability) is sometimes mixed with service-level logic.
- **Redundant Alias Logic:** Alias mapping is duplicated across services and audit harnesses.

## 4. Recommended Modular Architecture
- **Taxonomy/Mechanism Modules:** Pure registries + normalization services.
- **Standards/Authority Module:** Registry of citations, jurisdiction mappings, and rationale.
- **Corrective Action Module:** Domain-to-Action template mapping.
- **Confidence/Governance Module:** Calibration rules based on data completeness.
- **Orchestrator Module:** Pure orchestration layer (no hardcoded routing).
- **Learning/Feedback Module:** Captures human validations for supervised improvement.

## 5. Source Authority Model
Tiered approach:
1. **Binding Regulation:** MSHA/OSHA.
2. **Authoritative Guidance:** PPM, OSHA interpretations.
3. **Industry Best Practice:** NIOSH, Consensus standards.
4. **Internal Learning:** Validated feedback, supervised corrections.

## 6. Source Recall Rules
Reasoning must rely on tiered source authority: Binding Standards take precedence. Guidance can supplement but never supersede regulation.

## 7. Expert Reasoning Data Flow
Observation → Normalization → Context/Jurisdiction Routing → Domain/Mechanism Identification → Applicability/Standards Selection → Risk/Immediate Danger Check → Corrective Action → Verification Evidence → Confidence Calibration → Human Review Trigger → Final Reasoning Result.

## 8. Recommended Directory Structure
`backend/src/safescope-v2/`
- `core/` (Types, Interfaces)
- `registry/` (Taxonomy, Standards, Actions)
- `intelligence/` (Mechanism, Equipment, Risk)
- `reasoning/` (Orchestrator, Applicability, CorrectiveActions)
- `governance/` (Confidence, Human Review Triggers)
- `learning/` (Feedback, Validations)

## 9. Registry Design Rules
- Canonical IDs only.
- Aliases maintained in separate map files.
- Jurisdiction-aware mappings.
- Evidence requirement metadata.

## 10. Learning and Growth Architecture
1. Engine proposes classification.
2. Human expert validates.
3. If validated, log to `learning-memory`.
4. Run regression tests.
5. Promote to registry.

## 11. Accuracy and Confidence Measurement
- Score hazard family/mechanism/citation alignment (0-100%).
- Track false positive/negative rates per domain.
- Calibrate confidence against known evidence gaps.

## 12. Implementation Phases
1. Stabilize registry integration.
2. Move domain/routing rules into registries.
3. Implement Source Authority ranking.
4. Build human feedback validation loop.
5. Expand benchmark coverage.

## 13. Immediate Next Safe Changes
1. Extract routing logic from `ReasoningOrchestrator` into a `DomainRoutingService`.
2. Consolidate aliasing logic in `taxonomy.registry.ts`.
3. Normalize all mechanism detection into `MechanismRegistry`.
4. Introduce `ConfidenceGovernanceService` for rule-based calibration.
5. Create registry schema tests for data validation.

## 14. Do Not Do Yet
- AI/LLM integration (unstable).
- Destructive cleanup of old services.
- Replacing all generic logic with templates immediately.

## 15. Files Reviewed
- Entire `backend/src/safescope-v2/` hierarchy.
- `safescope-data/benchmarks/`.
- All `project-docs/08-audits/` documents.

## 16. Final Recommendation
Decouple knowledge registries from orchestrator logic immediately. Standardize on the Canonical ID architecture across all modules to ensure consistency and auditability.
