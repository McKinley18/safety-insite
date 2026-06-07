# SafeScope System Index

| Component | Description | Logic Path | Controller/API | Primary Validator | Version | Status | Reasoning Layer |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hazard Taxonomy** | Weighted domain routing | backend/src/safescope-v2/hazard-taxonomy-coverage/ | N/A | backend/scripts/validate-safescope-hazard-taxonomy-coverage.ts | v1 | Active | Entry layer |
| **Evidence Weighting** | Contradiction & signals | backend/src/safescope-v2/field-evidence-weighting/ | N/A | backend/scripts/validate-safescope-field-evidence-weighting-v1.ts | v1 | Active | Logic layer |
| **Multi-Hazard** | Observation decomposition | backend/src/safescope-v2/multi-hazard-decomposition/ | N/A | backend/scripts/validate-safescope-multi-hazard-decomposition-v1.ts | v1 | Active | Logic layer |
| **Causal Chains** | Cross-domain interactions | backend/src/safescope-v2/cross-domain-causal-chain/ | N/A | backend/scripts/validate-safescope-cross-domain-causal-chain-v1.ts | v1 | Active | Insight layer |
| **Strategy Ranking** | Control prioritization | backend/src/safescope-v2/corrective-action-strategy-ranking/ | N/A | backend/scripts/validate-safescope-corrective-action-strategy-ranking-v1.ts | v1 | Active | Action layer |
| **Risk Verification** | Residual risk analysis | backend/src/safescope-v2/risk-verification-residual-risk/ | N/A | backend/scripts/validate-safescope-risk-verification-residual-risk-v1.ts | v1 | Active | Verification layer |
| **Human Review** | Feedback loop & learning | backend/src/safescope-v2/human-review-feedback-loop/ | N/A | backend/scripts/validate-safescope-human-review-feedback-loop-v1.ts | v1 | Active | Learning layer |
| **Source Freshness** | Currency monitor | backend/src/safescope-v2/source-freshness-governance/ | N/A | backend/scripts/validate-safescope-source-freshness-governance-v1.ts | v1 | Active | Governance layer |
| **Jurisdiction** | Regulatory routing | backend/src/safescope-v2/jurisdiction-applicability-decision-tree/ | N/A | backend/scripts/validate-safescope-jurisdiction-applicability-decision-tree-v1.ts | v1 | Active | Governance layer |
| **Reasoning Trace** | Audit explainability | backend/src/safescope-v2/audit-ready-reasoning-trace/ | N/A | backend/scripts/validate-safescope-audit-ready-reasoning-trace-v1.ts | v1 | Active | Defensibility |
| **Source Ingestion** | Knowledge growth | backend/src/safescope-v2/source-ingestion-approved-update-workflow/ | N/A | backend/scripts/validate-safescope-source-ingestion-approved-update-workflow-v1.ts | v1 | Active | Growth layer |
| **Candidate Console** | Workflow management | backend/src/safescope-v2/reviewer-candidate-console/ | N/A | backend/scripts/validate-safescope-reviewer-candidate-console-v1.ts | v1 | Active | Admin layer |
| **Semantic Expansion** | Synonym mapper | backend/src/safescope-v2/semantic-synonym-expansion/ | N/A | backend/scripts/validate-safescope-semantic-synonym-expansion-v1.ts | v1 | Active | Signal layer |
| **Visual Evidence** | Photo metadata analysis | backend/src/safescope-v2/visual-evidence-reasoning/ | N/A | backend/scripts/validate-safescope-visual-evidence-reasoning-v1.ts | v1 | Active | Signal layer |
| **Visual API Wiring** | API/UI integration | backend/src/safescope-v2/visual-evidence-reasoning/ | backend/src/safescope-v2/safescope-v2.controller.ts | backend/scripts/validate-safescope-visual-evidence-api-ui-wiring-v1.ts | v1 | Active | Connectivity |
