# SafeScope Expert Reasoning Blueprint

## 1. Executive Summary
SafeScope should evolve from its current state as a hybrid, rules-based engine into a governed, authoritative safety intelligence engine. This blueprint defines a path to transform SafeScope into a reasoning engine that provides safety and health professionals with high-fidelity, auditable, and context-aware safety insights, moving from simple taxonomy matching to a structured "Expert Reasoning Checklist" model.

## 2. Current SafeScope Classification
SafeScope is currently a **hybrid AI-ready expert system**. It utilizes deterministic rule-based orchestration to process hazard observations but relies on structured registries to enable future integration with learning-based components. It is not a true AI, but rather a governed safety reasoning platform designed for auditability and compliance.

## 3. Expert Reasoning Checklist
For each finding, SafeScope must execute this sequence:
1.  **Hazard Identity:** Canonical classification via registry.
2.  **Harm Mechanism:** Energy source and failure mode detection.
3.  **Exposure Pathway:** Characterization of worker-hazard interaction.
4.  **Operational State:** Contextual state (e.g., normal ops, maintenance).
5.  **Jurisdiction/Context:** MSHA/OSHA mapping.
6.  **Applicable Standard:** Definitive primary citation selection.
7.  **Immediate Danger:** Deterministic shutdown/control trigger evaluation.
8.  **Missing Evidence:** Gap identification (e.g., photo missing).
9.  **Action Hierarchy:** Specific controls based on templates.
10. **Verification Evidence:** Required proof of abatement.
11. **Confidence Score:** Governance-based calibration.
12. **Human Review Trigger:** Thresholds for manual expert intervention.

## 4. Canonical Taxonomy Model
The taxonomy must be centralized and multi-layered:
`Domain` -> `Family` -> `Mechanism` -> `Citation` -> `Action Template`

## 5. Failure Mode Registry
A registry shall track canonical failure modes (e.g., `nip_point`, `collapse`, `fall_of_ground`, `shock`) to standardize engine-to-audit reporting.

## 6. Immediate Danger / Stop-Work Logic
Deterministic rules must trigger immediate action recommendations if specific conditions (e.g., unguarded nip point) are met, overriding generic findings.

## 7. Standards Applicability Logic
Primary citations must be selected based on the intersection of jurisdiction, industry, work area, and equipment type, ensuring authoritative regulatory mapping.

## 8. Corrective Action Quality Model
Actions must be domain-specific, incorporating control levels (administrative/engineering) and requiring verification evidence. Generic fallbacks are only allowed if taxonomy is `unknown`.

## 9. Evidence Sufficiency Model
The engine must detect evidence gaps (e.g., missing photo, unknown exposure status) and block high confidence classification if critical gaps exist.

## 10. Confidence Calibration Model
Confidence governance restricts "high confidence" to findings with:
- Identified family/mechanism
- Primary citation presence
- High-quality, hazard-specific corrective actions
- No critical evidence gaps

## 11. Human Review Triggers
High-risk conditions (e.g., stop-work, fatal potential) or low-confidence assessments require mandatory human review.

## 12. Learning and Growth Loop
Future improvements must follow a governed cycle: classification feedback -> citation correction -> benchmark growth -> audit validation.

## 13. AI Upgrade Path
Evolution path: Governed deterministic engine -> benchmarked reasoning -> human-in-the-loop -> AI-assisted drafting -> validated AI reasoning.

## 14. Accuracy Measurement Plan
Metrics: hazard classification accuracy, citation accuracy, corrective action relevance, false positive/negative rates, high-risk miss rate.

## 15. Benchmark Expansion Plan
Expand from 4 cases to 1,000+ over time, covering all regulatory domains and complex industrial scenarios.

## 16. Recommended Build Order
1.  Taxonomy/Mechanism Alignment
2.  Citation/Standards Integration
3.  Corrective Action Template Integration
4.  Confidence Governance
5.  Benchmark Expansion

## 17. Files/Folders To Review
- `backend/src/safescope-v2/reasoning-orchestrator/`
- `backend/src/safescope-v2/taxonomy/`
- `backend/src/safescope-v2/standards/`
- `backend/src/safescope-v2/corrective-actions/`

## 18. Implementation Notes
- Small, atomic changes.
- Verify audit and production readiness after each change.
- Do not commit without expert review.
