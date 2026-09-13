# SafeScope Expert Decision Pipeline Specification

## 1. Executive Summary
SafeScope is evolving into a governed safety intelligence engine. To ensure safety, auditability, and accuracy, the engine must move from ad-hoc reasoning to a deterministic, expert-validated decision pipeline. This specification codifies that pipeline.

## 2. Core Decision Principle
SafeScope must reason through the safety lifecycle, not merely perform keyword matching. Every assessment requires: hazard identity, harm mechanism, exposure, context, jurisdiction, applicable citation, immediate danger assessment, evidence sufficiency, control hierarchy, and calibrated confidence.

## 3. Master Decision Sequence
1. **Observation Intake:** Raw text finding.
2. **Text Normalization:** Lowercasing, sanitizing.
3. **Context Extraction:** Industry, equipment, task identification.
4. **Jurisdiction Determination:** MSHA/OSHA mapping.
5. **Work Environment Classification:** Mine type/industry classification.
6. **Equipment/Task Identification:** Archetype/specific equipment.
7. **Hazard Domain Routing:** Taxonomy mapping.
8. **Hazard Family Selection:** Hierarchy lookup.
9. **Mechanism Identification:** Failure mode detection.
10. **Energy Source Identification:** Source of harm.
11. **Exposure Pathway Analysis:** Worker-hazard interaction.
12. **Operational State Analysis:** Contextual state (ops/maint).
13. **Immediate Danger Evaluation:** Stop-work logic.
14. **Applicable Standards Selection:** Primary citation mapping.
15. **Evidence Sufficiency Review:** Gap detection.
16. **Corrective Action Selection:** Template hierarchy match.
17. **Verification Evidence Selection:** Proof of abatement.
18. **Confidence Calibration:** Governance rule enforcement.
19. **Human Review Trigger:** Mandatory check logic.
20. **Audit Snapshot Creation:** Traceability logging.
21. **Learning Candidate Creation:** Feedback for validation.

## 4. SafeScope Decision Object (TypeScript Shape)
```ts
interface SafeScopeExpertResult {
  observation: string;
  context: { jurisdiction: string; siteType: string; task: string; equipment: string; };
  taxonomy: { domain: string; family: string; mechanismId: string; };
  standards: { primaryCitation: string; rationale: string; };
  risk: { immediateControl: boolean; shutdownRequired: boolean; };
  correctiveActions: { immediate: string[]; permanent: string[]; verification: string[]; };
  confidence: { level: 'high' | 'moderate' | 'low'; reasons: string[]; };
  evidence: { gaps: string[]; sufficiencyScore: number; };
  reviewTriggers: string[];
  auditTrace: any;
}
```

## 5. Jurisdiction Decision Model
Based on keywords, site type, and industry context (e.g., "highwall" -> MSHA, "scaffold" -> OSHA Construction).

## 6. Hazard Identification Model
Hierarchy: Domain -> Family -> Type -> Mechanism ID.
Example: `machine_guarding` -> `conveyor_guarding` -> `rotating_equipment_nip_point`.

## 7. Energy and Mechanism Model
Sources: Mechanical, Electrical, Gravity, Stored Energy, Chemical, Thermal, Pressure, Mobile Equipment Kinetic, Atmospheric, Ergonomic.

## 8. Standards Selection Model
Primary citation = (Jurisdiction + Domain + Mechanism + Task + Equipment). Fallback to general duty rules only when specific citations are unavailable.

## 9. Corrective Action Decision Model
Hierarchy of controls: Immediate Control -> Permanent Correction -> Verification Evidence. Hazard-specific language required.

## 10. Evidence Sufficiency Model
Checklist per domain: (e.g., Machine Guarding requires: Photo, equipment type, moving part identification).

## 11. Confidence Governance Model
High confidence requires: Canonical domain, citation, specific actions, zero critical evidence gaps.

## 12. Human Review Trigger Model
Triggers: Imminent danger, fatal potential, low confidence, missing critical evidence, conflicting citations, user dispute.

## 13. Learning and Growth Loop
Proposal -> Human Validation -> Correction Capture -> Benchmark Update -> Audit Run -> Registry Promotion.

## 14. Source Authority Use
Hierarchy: 1. Binding Regulation (CFRs), 2. PPM/Interpretations, 3. Best Practice, 4. Validated Internal Learning.

## 15. Benchmark and Accuracy Requirements
Success: Pass 4-case benchmark (score 85+), then expand incrementally. Metrics: family/mechanism/citation accuracy, high-risk miss rate, calibration success.

## 16. How This Pipeline Maps To Modules
- Orchestrator: Sequence logic.
- Registry: Taxonomy/Standards/Actions.
- Intelligence: Mechanism/Equipment.
- Governance: Confidence/Review Triggers.
- Learning: Feedback loop.

## 17. Immediate Implementation Priorities
1. Stabilize registry integration.
2. Canonicalize taxonomies.
3. Fix mechanism normalization.
4. Calibrate confidence logic.
5. Expand benchmark coverage.

## 18. Do Not Do Yet
- LLM/ML implementation.
- Over-fitting to the audit harness.
- Generic fallback actions for known domains.

## 19. Files Reviewed
- Entire `backend/src/safescope-v2/` hierarchy.
- `safescope-data/benchmarks/`.
- All `project-docs/08-audits/` documents.

## 20. Final Recommendation
Strictly adhere to this decision pipeline. Decouple registry-based knowledge from service logic to maintain a governed, deterministic foundation.
