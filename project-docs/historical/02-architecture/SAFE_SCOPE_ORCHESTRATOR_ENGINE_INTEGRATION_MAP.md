# SafeScope Orchestrator Engine Integration Map

## 1. Executive Summary
This document defines the roadmap for connecting the SafeScope Orchestrator to existing compartmentalized safety engines. The Orchestrator will serve as the AI brain, coordinating specialized logic without violating existing ownership domains or regulatory authority boundaries.

## 2. Current Confirmed Architecture
- **Source Intelligence**: Ingestion preview tool and read-only retrieval contract are established.
- **Orchestrator**: Stub orchestration contract exists as a standalone service.
- **Governance**: Automated audit checks verify the integrity of candidate datasets and ingestion logic.
- **Production Status**: The Orchestrator is currently isolated and not connected to the live `AppModule`.

## 3. Existing Backend Areas to Inspect
- `backend/src/safescope/` (Contract/Stub)
- `backend/src/safescope-v2/` (Classifier/Standards)
- `backend/src/safescope-source-intelligence/` (Evidence Retrieval)
- `backend/src/risk/`, `backend/src/corrective-actions/`, `backend/src/reports/` (Task engines)

## 4. Engine Ownership Table
| Engine | Backend Location | Owns | Returns | Must Not Override |
| :--- | :--- | :--- | :--- | :--- |
| Hazard Classification | `safescope-v2/classifier` | Hazard Taxonomy | Classification object | Standards Authority |
| Standards Matching | `safescope-v2/standards` | Regulatory Logic | Citation candidates | Hazard Classification |
| Source Intelligence | `safescope-source-intelligence` | Evidence/Controls | Source intelligence matches | Regulatory Law |
| Risk Scoring | `risk/` | Scoring Algorithms | Risk assessment metrics | Classification Engine |
| Corrective Action | `corrective-actions/` | Action Workflow | Action recommendations | Standards Authority |

## 5. Orchestrator Call Order
1. Request Normalization. 2. Hazard Classification. 3. Standards Matching. 4. Source Intelligence Retrieval. 5. Risk Scoring. 6. Corrective Action. 7. Report Summary Synthesis. 8. Governance/Audit Gate. 9. Logging.

## 6. Data Contract Between Engines
All engines must produce structured, deterministic output adhering to the unified internal analysis object: `normalizedObservation`, `classification`, `standardsMatches`, `sourceMatches`, `riskAssessment`, `correctiveActions`, `reviewFlags`, `auditTrace`.

## 7. Safe Integration Strategy
- **Phase 1**: Service audit/inventory.
- **Phase 2**: Adapter pattern interfaces.
- **Phase 3**: Integration testing with stubs.
- **Phase 4**: Orchestration wiring behind a `SAFE_SCOPE_ORCHESTRATOR_ENABLED` feature flag.

## 8. Feature Flag / Safety Gate
The Orchestrator is locked behind `SAFE_SCOPE_ORCHESTRATOR_ENABLED=false` until full suite verification is finalized.

## 9. Non-Negotiable Safety Boundaries
- Source intelligence must provide supporting evidence, not regulatory authority.
- Every retrieval must filter by `verificationStatus: 'verified'`.
- Production analysis endpoints must require full `auditTrace` persistence.

## 10. Immediate Next Technical Step
Conduct a detailed audit of existing service classes in `backend/src` to map existing method signatures before developing the orchestrator adapter layer.

---
**Integration rule in one sentence:** The SafeScope Orchestrator is a read-only coordination layer that integrates engine outputs without modifying the underlying authoritative logic of individual safety modules.
