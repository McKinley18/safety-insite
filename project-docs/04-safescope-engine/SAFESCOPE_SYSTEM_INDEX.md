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

| Orchestrator Output Pipeline | Integrated advisory pipeline | backend/src/safescope-v2/orchestration/ | N/A | backend/scripts/validate-safescope-orchestrator-field-output-wiring.ts | Orchestrator field output wiring | Active | Governance-compliant pipeline wiring |

| Approved Knowledge Seed Registry | Approved knowledge seed data | safescope-data/approved-knowledge/registry/ | N/A | N/A | Approved knowledge registry | Active | Foundation |

| Knowledge Retrieval Matching | Retrieval from approved registry | backend/src/safescope-v2/approved-knowledge-retrieval-output-v1/ | N/A | backend/scripts/validate-safescope-approved-knowledge-population-and-retrieval-matching-v1.ts | Approved knowledge retrieval matching v1 | Active | Governance-compliant pipeline |

| Approved Knowledge Seed Registry | Approved knowledge seed data | safescope-data/approved-knowledge/registry/ | N/A | N/A | Approved knowledge registry | Active | Foundation |

| Scenario Expansion Pack | Domain-specific scenario logic | safescope-data/scenario-expansion/ | N/A | backend/scripts/validate-safescope-scenario-expansion-pack-v1.ts | Scenario expansion pack v1 | Active | Expanded domain reasoning |

| Scenario Expansion Pack | Domain-specific scenario logic | safescope-data/scenario-expansion/ | N/A | backend/scripts/validate-safescope-scenario-expansion-pack-v1.ts | Scenario expansion pack v1 | Active | Expanded domain reasoning |

| Field Evidence Weighting | Intent-aware evidence analysis | backend/src/safescope-v2/field-evidence-weighting/ | N/A | backend/scripts/validate-safescope-field-evidence-weighting-v1.ts | Field evidence weighting v1 | Active | Defensive reasoning layer |

| Multi-Hazard Decomposition | Complex observation analyzer | backend/src/safescope-v2/multi-hazard-decomposition/ | N/A | backend/scripts/validate-safescope-multi-hazard-decomposition-v1.ts | Multi-hazard observation decomposition v1 | Active | Phrase-splitting logic |

| Observation Narrative Synthesis | Professional advisory generator | backend/src/safescope-v2/observation-narrative-synthesis/ | N/A | backend/scripts/validate-safescope-observation-narrative-synthesis-v1.ts | Observation narrative synthesis v1 | Active | Synthesis logic |

| Causal Chain Reasoning | Interaction logic engine | backend/src/safescope-v2/cross-domain-causal-chain/ | N/A | backend/scripts/validate-safescope-cross-domain-causal-chain-v1.ts | Cross-domain causal chain v1 | Active | Compound risk reasoning |

| Strategy Ranking | Risk-informed control prioritization | backend/src/safescope-v2/corrective-action-strategy-ranking/ | N/A | backend/scripts/validate-safescope-corrective-action-strategy-ranking-v1.ts | Corrective action strategy ranking v1 | Active | Ranking logic |

| Risk Verification | Action quality and residual risk analysis | backend/src/safescope-v2/risk-verification-residual-risk/ | N/A | backend/scripts/validate-safescope-risk-verification-residual-risk-v1.ts | Risk verification v1 | Active | Effectiveness logic |

| Human Review Feedback Loop | Controlled expert learning loop | backend/src/safescope-v2/human-review-feedback-loop/ | N/A | backend/scripts/validate-safescope-human-review-feedback-loop-v1.ts | Human review feedback loop v1 | Active | Governed learning mechanism |

| Source Freshness Governance | Source currency and authority monitor | backend/src/safescope-v2/source-freshness-governance/ | N/A | backend/scripts/validate-safescope-source-freshness-governance-v1.ts | Source freshness v1 | Active | Currency reasoning layer |

| Jurisdiction Decision Tree | Regulatory applicability logic | backend/src/safescope-v2/jurisdiction-applicability-decision-tree/ | N/A | backend/scripts/validate-safescope-jurisdiction-applicability-decision-tree-v1.ts | Jurisdiction applicability v1 | Active | Regulatory routing layer |

| Reasoning Trace | Audit-ready explainability engine | backend/src/safescope-v2/audit-ready-reasoning-trace/ | N/A | backend/scripts/validate-safescope-audit-ready-reasoning-trace-v1.ts | Audit reasoning trace v1 | Active | Defensibility layer |

| Source Ingestion | Governed knowledge growth engine | backend/src/safescope-v2/source-ingestion-approved-update-workflow/ | N/A | backend/scripts/validate-safescope-source-ingestion-approved-update-workflow-v1.ts | Source ingestion v1 | Active | Knowledge pipeline layer |

| Candidate Console | Reviewer workflow and API | backend/src/safescope-v2/reviewer-candidate-console/ | N/A | backend/scripts/validate-safescope-reviewer-candidate-console-v1.ts | Reviewer candidate console v1 | Active | Workflow management layer |

| Reviewer API Wiring | Frontend-Backend integration | frontend-next/app/safescope-knowledge/review/page.tsx | backend/src/safescope-v2/reviewer-candidate-console/reviewer-candidate-console.controller.ts | backend/scripts/validate-safescope-reviewer-candidate-console-api-contract-v1.ts | API wiring v1 | Active | Connectivity layer |
