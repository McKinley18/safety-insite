# SafeScope Orchestrator Contract Plan

## 1. Executive Summary
The SafeScope Orchestrator is the AI interface/brain that coordinates specialized engines.

## 2. Core Rule
- Orchestrator coordinates engines.
- Engines remain compartmentalized.
- Orchestrator does not let one engine overwrite another’s authority.
- Source intelligence supports evidence and controls but does not override regulatory standards.
- Human review remains required for high-risk or governance-sensitive updates.

## 3. Orchestrator Inputs
- observationText
- imageEvidenceIds
- inspectionId
- reportId
- siteId
- companyId
- regulatoryContext
- industryContext
- equipmentContext
- userRole
- priorFindingIds
- correctiveActionContext
- sourceIntelligenceEnabled boolean
- standardsMatchingEnabled boolean
- reviewMode boolean

## 4. Orchestrator Outputs
- analysisId
- classification result
- standards matches
- source intelligence matches
- risk assessment
- corrective action recommendations
- executive summary text
- reviewRequired boolean
- confidence
- governance flags
- audit trace

## 5. Engine Call Order
1. Normalize request/context
2. Hazard Classification Engine
3. Standards Matching Engine
4. Source Intelligence Retrieval
5. Risk Scoring Engine
6. Corrective Action Engine
7. Report/Executive Summary Engine
8. Review & Governance Engine
9. Audit Logging

## 6. Engine Authority Boundaries
| Decision | Authoritative Engine | Supporting Engines |
| :--- | :--- | :--- |
| Hazard category | Hazard Classification | Orchestrator |
| Citation matching | Standards Matching | Source Intelligence |
| Source evidence | Source Intelligence | Orchestrator |
| Corrective action | Corrective Action Engine | Source Intelligence |
| Risk priority | Risk Scoring | Trend & Analytics |
| Final explanation | Orchestrator | All Engines |
| Human override | Review & Governance | Orchestrator |

## 7. Conflict Resolution Rules
- Standards Matching wins for regulatory citations.
- Human review wins for automated classification.
- High risk flags override low confidence.
- Source Intelligence provides evidence, not authority.

## 8. Data Contracts
Interfaces: SafeScopeAnalysisRequest, SafeScopeAnalysisResult, EngineDiagnostic, GovernanceFlags, AuditTrace.

## 9. Source Intelligence Integration
Orchestrator queries SourceRetrievalService; evidence is shown separate from standards citations.

## 10. Standards Integration
Standards engine maintains regulatory citation authority.

## 11. Risk Integration
Risk engine uses severity, history, and action status to return escalation/shutdown flags.

## 12. Corrective Action Integration
Corrective actions are generated from classification, standards, lessons, and risk priority.

## 13. Governance and Audit
Every engine decision is logged to an audit trace.

## 14. Future Backend Files
backend/src/safescope/
- safescope.module.ts
- safescope-orchestrator.service.ts
- dto/safescope-analysis-request.dto.ts
- dto/safescope-analysis-result.dto.ts
- interfaces/engine-diagnostic.interface.ts
- interfaces/governance-flags.interface.ts

## 15. Immediate Next Steps
1. Commit this contract plan.
2. Create non-invasive orchestrator DTOs/interfaces.
3. Create stub Orchestrator service.
4. Build test fixture.
5. Connect source retrieval.

## 16. Non-Negotiable Rules
- No production analysis wiring yet.
- No source intelligence overrides.
- No automatic verified source changes.
- All high-confidence decisions must be explainable.

SafeScope Orchestrator in one sentence: The SafeScope Orchestrator is the central brain that synchronizes specialized safety engines to deliver auditable, evidence-grounded industrial risk intelligence.
