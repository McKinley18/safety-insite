# SafeScope System Index

| System Name | Purpose | Primary Source Paths | Data Paths | Validator Script | Runner Label | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Governance Output Snapshot | Verify snapshot stability | `backend/scripts/validate-safescope-governance-output-snapshot.ts` | N/A | `validate-safescope-governance-output-snapshot.ts` | Governance output snapshot | Active | Critical |
| Confidence Governance | Governance engine | `backend/src/safescope-v2/confidence-governance/` | N/A | `validate-safescope-confidence-governance.ts` | Confidence governance | Active | Critical |
| Evidence Sufficiency | Governance engine | `backend/src/safescope-v2/evidence-sufficiency/` | N/A | `validate-safescope-evidence-sufficiency.ts` | Evidence sufficiency | Active | Critical |
| Causal-Risk Reasoning | Governance engine | `backend/src/safescope-v2/causal-risk-reasoning/` | N/A | `validate-safescope-causal-risk-reasoning.ts` | Causal-risk reasoning | Active | Critical |
| Output Policy Governor | Governance engine | `backend/src/safescope-v2/output-policy/` | N/A | `validate-safescope-output-policy.ts` | Output policy | Active | Critical |
| Defensible Corrective Action | Governance engine | `backend/src/safescope-v2/corrective-action-control-map/` | N/A | `validate-safescope-defensible-corrective-action.ts` | Defensible corrective action | Active | Critical |
| Human Review Learning Governance | Governance engine | `backend/src/safescope-v2/human-review-learning-governance/` | N/A | `validate-safescope-human-review-learning-governance.ts` | Human review learning governance | Active | Critical |
| Source-Backed Applicability | Governance engine | `backend/src/safescope-v2/source-backed-applicability/` | N/A | `validate-safescope-source-backed-applicability-governance.ts` | Source-backed applicability governance | Active | Critical |
| Approved Knowledge Registry IO | Registry IO | `backend/src/safescope-v2/approved-knowledge-registry-io/` | `safescope-data/approved-knowledge/` | `validate-safescope-approved-knowledge-registry-io.ts` | Approved knowledge registry IO | Active | Critical |
| Approved Knowledge Review API | API | `backend/src/safescope-v2/approved-knowledge-review-api/` | `safescope-data/approved-knowledge/review-decisions/` | `validate-safescope-approved-knowledge-review-api-v1.ts` | Approved knowledge review API v1 | Active | Critical |
| Hazard Taxonomy Coverage | Routing | `backend/src/safescope-v2/hazard-taxonomy-coverage/` | `safescope-data/hazard-taxonomy/` | `validate-safescope-hazard-taxonomy-coverage.ts` | Hazard taxonomy coverage | Active | Critical |
| Hazard Information Absorption | Absorption | `backend/src/safescope-v2/hazard-information-absorption/` | `safescope-data/hazard-information-absorption/` | `validate-safescope-hazard-information-absorption.ts` | Hazard information absorption | Active | Critical |

| Field Output Composer v1 | Advisory output composition | backend/src/safescope-v2/field-output-composer-v1/ | N/A | backend/scripts/validate-safescope-field-output-composer-v1.ts | Field output composer v1 | Active | Advisory boundary preservation |
