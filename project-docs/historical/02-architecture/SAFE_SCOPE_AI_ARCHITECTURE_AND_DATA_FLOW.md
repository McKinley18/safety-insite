# SafeScope AI Architecture and Data Flow

## 1. Executive Summary
SafeScope serves as the intelligent brain within Sentinel Safety. It acts as the primary AI orchestrator, receiving heterogeneous inputs—such as inspection observations, photos, report details, and operational context—and coordinating specialized, compartmentalized engines to generate defensible, evidence-backed safety intelligence for industrial risk management.

## 2. Core Principle
SafeScope rejects monolithic design in favor of a coordinated, compartmentalized architecture. Each engine is a specialized component with defined authority. Communication occurs through strictly controlled interfaces and normalized data objects. This modularity ensures that no engine overwrites another's authority, maintaining the integrity of both regulatory standards and evidence-backed safety intelligence. Human oversight is mandatory for any promotion of source intelligence or updates to verified datasets.

## 3. Primary SafeScope AI Interface (Orchestrator)
The Orchestrator receives raw input, decomposes the request into task-specific signals, routes those signals to the appropriate engines, resolves conflicts through precedence rules, and produces a final, auditable explanation. It maintains the system's "source of truth" and ensures that every recommendation is traceable to official regulations or validated incident evidence.

## 4. Engine Map
- **Hazard Classification Engine**: Classifies inputs into hazard families/subtypes and detects severity indicators.
- **Standards Matching Engine**: Matches observations to regulatory citations and maintains authoritative regulatory mapping.
- **Source Intelligence Engine**: Collects, validates, and tags official incident reports from verified MSHA/OSHA/NIOSH/CSB sources.
- **Corrective Action Engine**: Generates practical, evidence-linked safety improvements with priority/owner/status tracking.
- **Risk Scoring Engine**: Calculates severity, likelihood, exposure, and urgency for escalation/shutdown recommendations.
- **Trend & Analytics Engine**: Aggregates historic hazard concentrations and weak control patterns.
- **Report & Executive Summary Engine**: Synthesizes structured data into polished, inspection-ready documentation.
- **Review & Governance Engine**: Manages human-in-the-loop audit gates for model decisions and dataset promotion.
- **Notification & Workflow Engine**: Orchestrates user alerts for overdue actions and critical risks.

## 5. Authority Boundaries
| Decision | Authoritative Engine | Supporting Engines | Notes |
| :--- | :--- | :--- | :--- |
| Hazard Category | Hazard Classification | Orchestrator | Base classification only. |
| Citation Matching | Standards Matching | Source Intelligence | Standards override intelligence. |
| Source Evidence | Source Intelligence | Orchestrator | Evidence supports reasoning. |
| Corrective Action Wording | Corrective Action Engine | Source Intelligence | Evidence-backed actions. |
| Risk Priority | Risk Scoring | Trend & Analytics | Site-specific history modifiers. |
| Trend Intelligence | Trend & Analytics | Orchestrator | Aggregated site insights. |
| Verified Source Promotion | Review & Governance | Source Intelligence | Human review required. |
| Final User Explanation | Orchestrator | All | Final resolution & audit. |

## 6. Data Flow: Inspection Observation
Input → Orchestrator → Hazard Classification → Standards Matching → Source Intelligence Retrieval → Risk Scoring → Corrective Action → Report Generation → Human Review/Audit → Analytics Storage.

## 7. Data Flow: Source Intelligence
Official Seed URLs → Source Harvester → Harvested Candidates (Pending Review) → Human Review Decisions → Promotion Preview → Verified Source Pool → Database Ingestion → Source Intelligence Library.

## 8. Data Flow: Feedback Loop
Engines update one another via review-gated feedback loops. Human-verified action closures improve risk scoring accuracy, and expert-validated source intelligence updates citation matching confidence over time. No automated feedback can override regulatory standards.

## 9. Separation of Concerns
Engines maintain strict data independence. The Orchestrator mediates results, ensuring audit logs capture all decision paths. Verified source data is immutable to the production engine, requiring a formal governance promotion process.

## 10. Recommended Backend Module Structure
- `backend/src/safescope/` (Orchestrator/Module)
- `backend/src/safescope-v2/classifier/` (Hazard Classification)
- `backend/src/safescope-v2/standards/` (Standards Matching)
- `backend/src/safescope-source-intelligence/` (Source Intelligence Library)
- `backend/src/corrective-actions/` (Corrective Action Engine)
- `backend/src/risk/` (Risk Scoring)
- `backend/src/reviews/` (Review & Governance)
- `backend/src/audit/` (Audit Logs)
- `backend/src/dashboards/` (Trend & Analytics)
- `backend/src/reports/` (Report & Summary Engine)

## 11. Suggested Data Objects
- `SafeScopeAnalysisRequest`: Input container (observations, photos, context).
- `SafeScopeAnalysisResult`: Final intelligence object.
- `HazardClassificationResult`: Engine output for hazard family/confidence.
- `StandardsMatchResult`: Engine output for regulatory citation mapping.
- `SourceIntelligenceMatch`: Retrieved incident evidence.
- `RiskAssessmentResult`: Scoring and escalation metadata.
- `CorrectiveActionRecommendation`: Action, priority, and link to sources.
- `ReviewDecision`: Audit trail for human-in-the-loop gates.

## 12. Source Intelligence Library Design
- **Table Structure**: `source_documents`, `source_hazard_lessons`, `source_controls`, `source_citation_hints`, `source_gauntlet_links`.
- **Lifecycle**: `harvested` -> `pending_review` -> `previewed` -> `verified` -> `rejected` -> `archived`.
- **UI Center**: Dedicated library dashboard for admin management of the intelligence pool.

## 13. Product/UI Implications
- AI explanation panels displaying defensible reasoning.
- Clear separation between regulatory citations and evidence-backed lessons.
- Confidence indicators for every AI decision.
- Admin dashboard for source library management and review queues.

## 14. Immediate Next Development Steps
1. Commit this architecture document.
2. Build source intelligence database ingestion plan.
3. Scaffold Source Intelligence Library backend service.
4. Integrate Orchestrator logic.
5. Develop Admin Review UI.
6. Expand verified source pool toward 250 through harvester batches.

## 15. Non-Negotiable Governance Rules
- No automatic promotion of unreviewed sources to production pools.
- No fabricated URLs, generic search pages, or synthetic facts.
- Source intelligence must never override primary regulatory authority.
- Engine changes are forbidden without 100% test pass on gauntlets.

---
**SafeScope in one sentence:** SafeScope is the intelligence-driven orchestrator of Sentinel Safety, providing regulatory-compliant, evidence-based safety assessments through a governed, multi-engine AI architecture.
