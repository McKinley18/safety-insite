# SAFE_SCOPE_SOURCE_INTELLIGENCE_DATABASE_PLAN.md

## Backend Database Design

### 1. Schema Design
- **`source_documents`**: Primary table for official investigation/enforcement metadata.
- **`source_hazard_lessons`**: Stores structured hazard identification and root-cause analysis (one document to many lessons).
- **`source_controls`**: Control measures mapped to lessons or documents.
- **`source_citation_hints`**: Regulatory standard mappings linked to documents/lessons.
- **`source_gauntlet_links`**: Many-to-many link between source documentation and gauntlet scenarios.

### 2. Implementation Strategy
- **ORM**: Use TypeORM entities (`SourceDocument`, `SourceHazardLesson`, etc.) for persistence.
- **Validation**: Strict schema enforcement during JSON ingestion.
- **Querying**: Support faceted searches by `HazardFamily`, `Agency`, and `FatalityOrSeverity`.
- **Hallucination Mitigation**: Enforce `extractionConfidence` scores and link scenarios only to validated `source_documents`.

### 3. Traceability
- Ensure every `SourceHazardLesson` carries the official `sourceId` for provenance.
- NIOSH/CSB data is logically segregated by `citationAuthority` to prevent regulatory hallucination.
