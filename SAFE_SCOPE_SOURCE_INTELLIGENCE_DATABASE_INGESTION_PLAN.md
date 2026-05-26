# SafeScope Source Intelligence Database Ingestion Plan

## 1. Executive Summary
The verified source candidate pool contains high-fidelity evidence (MSHA/OSHA/NIOSH/CSB). Currently stored in JSON, this data must be migrated into a backend database for the SafeScope AI to perform real-time retrieval of official safety evidence during inspections, enhancing reasoning with real-world incident grounding.

## 2. Current State
- `SAFE_SCOPE_VERIFIED_SOURCE_CANDIDATES.json` houses reviewed, high-fidelity official records.
- Records have passed structural and quality audits but are currently offline.
- No unreviewed harvested candidates are permitted for ingestion.

## 3. Ingestion Goal
The goal is to provide SafeScope with searchable, evidence-backed intelligence. The database must store official records and provide retrieval interfaces for the SafeScope Orchestrator to look up relevant lessons, controls, and citation hints based on hazard categories, equipment, and keywords.

## 4. Database Tables
- **`source_documents`**: Core metadata, source provenance, and verification state.
- **`source_hazard_lessons`**: Incident-specific lessons learned, equipment involved, and hazard categorizations.
- **`source_controls`**: Specific control measures (e.g., "Use approved safety platform") mapped to lessons or documents.
- **`source_citation_hints`**: Regulatory standard citations linked to official authority.
- **`source_gauntlet_links`**: Integrity links between source intelligence and gauntlet evaluation scenarios.

## 5. Status Rules
- Only records with `verificationStatus === "verified"` are ingestible.
- All non-verified statuses (harvested, pending_review, etc.) remain in the JSON storage.
- Verified records are immutable to production analysis and require formal governance for modification.

## 6. Authority Rules
- **OSHA/MSHA**: Act as primary regulatory citation authority.
- **NIOSH/CSB**: Act as official investigative evidence and secondary control/lesson authority.
- **Source Intelligence**: Must never override the Standards Matching Engine regarding regulatory law.

## 7. Import Workflow
1. **Validation**: Validate candidate against JSON schema.
2. **Normalization**: Extract and map fields to target entity structures.
3. **Deduplication**: Enforce URL/sourceId uniqueness at the database level.
4. **Ingestion**: Transactional creation of `source_documents` and associated hazard lessons/citations.
5. **Audit**: Generate import log summarizing ingested record count and audit ID.

## 8. Validation Requirements
- `httpStatus` must be 200.
- `verificationEvidence` must exist and meet length/content quality standards.
- URL must be incident/record-specific, not category/landing pages.

## 9. SafeScope Retrieval Design
The Orchestrator retrieves matches using:
- **Primary Search**: Hazard Category + Equipment Context.
- **Secondary Search**: Root cause themes/keywords.
- **Resolution**: Ranked by evidence quality and relevance to the inspection observation.

## 10. Orchestrator Integration
The Orchestrator queries the `SourceIntelligenceService` in parallel with standards and classification engines, then fuses retrieved evidence into the final explanation for the user.

## 11. Example Retrieval Flow
- **Observation**: "Worker standing on pallet raised by forklift."
- **Classification Engine**: Falls / Powered Mobile Equipment.
- **Source Library**: Retrieves NIOSH FACE report on pallet fall.
- **Orchestrator Output**: Combines fall protection requirements with evidence-backed recommendation to use dedicated platforms.

## 12. Data Flow: Feedback Loop
Verified intelligence feedback (e.g., successful action closure) incrementally refines future hazard-control mapping precision.

## 13. Separation of Concerns
Each engine persists its own state. The Orchestrator does not modify source library data. Governance engines gate changes.

## 14. Recommended Backend Module Structure
- `backend/src/safescope-source-intelligence/` (Service/Module)
- `entities/` (source-document, source-hazard-lesson, etc.)
- `dto/` (SourceSearchDto, SourceMatchDto)

## 15. Suggested Data Objects
- `SourceDocumentEntity`, `SourceHazardLessonEntity`, `SourceCitationHintEntity`.

## 16. Future API Endpoints
- `GET /source-intelligence/documents/:id`
- `POST /source-intelligence/search`
- `POST /source-intelligence/import/verified-candidates`
- `GET /source-intelligence/audit`

## 17. Immediate Next Development Steps
1. Commit this architecture document.
2. Build source intelligence database ingestion plan.
3. Scaffold Source Intelligence Library backend service.
4. Connect SafeScope Orchestrator to retrieval service.
5. Build Admin Review UI.
6. Expand verified source pool toward 250.

## 18. Non-Negotiable Governance Rules
- No unreviewed records in production DB.
- No fabricated evidence or generic URLs.
- No overriding regulatory authority.
- No commits/pushes without complete audit validation.

---
**Source Intelligence Library in one sentence:** The Source Intelligence Library is a governed, evidence-backed knowledge base that enables SafeScope to ground recommendations in official incident report findings and proven safety controls.
