# SafeScope Remaining AI Classification Gap Analysis

This document identifies the remaining features and capabilities needed to transition SafeScope from a collection of safety reasoning modules to a fully mature, defensible safety AI system suitable for high-stakes regulatory environments.

## Current State (v1 Baseline)

SafeScope already implements the following core AI safety governance layers:
- **Hazard Taxonomy Routing:** Weighted signal matching for 40+ domains.
- **Approved Knowledge Retrieval:** Deterministic matching against source-backed registries.
- **Field Evidence Weighting:** Contradiction detection and confidence scoring.
- **Multi-Hazard Decomposition:** Phrase splitting for complex observations.
- **Cross-Domain Causal Chains:** Compound risk interaction reasoning.
- **Corrective Action Ranking:** Deterministic prioritization of controls.
- **Risk Verification:** Residual risk reassessment and action quality analysis.
- **Human-in-the-Loop Learning:** Governed feedback loops for expert corrections.
- **Source Freshness Governance:** Regulation currency monitor.
- **Jurisdiction Decision Tree:** Defensive regulatory routing.
- **Explainability:** Audit-ready reasoning traces.

## Remaining Backend Reasoning Gaps

| Feature | Description | Priority |
| :--- | :--- | :--- |
| **Semantic Synonym Expansion** | Deterministic synonym mapping implemented; neural/vector expansion remains. | High |
| **Photo/Image Reasoning** | Integrating visual evidence analysis to verify physical states (guards, PPE, LOTO). | High |
| **Structured Inspection Memory** | Reasoning about the same hazard over multiple observations (repeat offenders). | Medium |
| **Exposure Dose Intelligence** | Calculating cumulative risk exposure based on time, frequency, and severity. | Medium |
| **Adversarial Test Packs** | Systematic "Red Teaming" of the reasoning engine to detect overconfidence or logic gaps. | Medium |

## Remaining Knowledge & Data Gaps

| Feature | Description | Priority |
| :--- | :--- | :--- |
| **Full OSHA/MSHA Mapping** | Scaling the approved registry to cover all sub-parts of 1910, 1926, and 30 CFR. | Critical |
| **State-Specific Jurisdictions** | Incorporating California (Cal/OSHA), Washington, and other state-plan rules. | Medium |
| **International Standards** | ISO 45001 and EU-OSHA alignment for global deployment. | Low |
| **Automated Regulation Watch** | Web-crawling official sources to trigger freshness updates automatically. | High |

## Remaining Governance Gaps

| Feature | Description | Priority |
| :--- | :--- | :--- |
| **Role-Based Approval Gates** | Enforcing specific reviewer roles for specific hazard domains (e.g., Electrician for LOTO). | High |
| **Site-Specific Policy Isolation** | Preventing internal site rules from polluting the global regulatory reasoning engine. | Medium |
| **Audit Log Hardening** | Immutable logging of every retrieval and promotion decision for legal defense. | Critical |

## Remaining Frontend & Product Gaps

| Feature | Description | Priority |
| :--- | :--- | :--- |
| **Reviewer Candidate Console** | Backend/API and Frontend UI fully integrated. | High |
| **Trace Visualization** | Graphical display of causal chains and reasoning traces for field users. | Medium |
| **Offline Reasoning** | Lightweight local reasoning for mobile use in low-connectivity mine/site areas. | Medium |
| **Report/PDF Audit Appendix** | Generating structured PDF reports including the audit trace for external inspectors. | High |

## Recommended Build Order (Post-Sprint)

1.  **Approved Knowledge Scale-up:** Expand the seed registry to 100+ critical citations.
2.  **Reviewer Candidate Console:** Implement the UI for human-in-the-loop promotion.
3.  **Semantic Signal Expansion:** Integrate vector-based matching for higher precision.
4.  **Audit Log Hardening:** Finalize the immutable trace storage.
5.  **Photo Evidence Prototype:** Scaffold visual verification.
