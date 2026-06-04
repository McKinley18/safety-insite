# SAFE_SCOPE_SOURCE_INTELLIGENCE_DB_PLAN.md

## Recommended Database Architecture

### Table Names
- `source_intel`: Stores raw, processed intelligence extracted from official reports.
- `gauntlet_scenarios`: Links gauntlet evaluation data to source IDs.
- `hazard_families`: Taxonomic classification mapping.
- `regulatory_standards`: References for standards/citations.

### Proposed TypeORM Entities
- `SourceIntel`: Entity for sourceId, agency, details, family mappings, and confidence score.
- `GauntletScenario`: Entity for scenario definitions linked to `SourceIntel` via `sourceId`.

### Fields and Indexing
- `SourceIntel`: 
  - PK: `sourceId` (index)
  - Fields: `agency`, `hazardFamilies` (array/json), `fatalityOrSeverity`, `extractionConfidence`.
  - Indexes: `hazardFamilies` (GIN), `agency` (B-tree).

### Connection Model
- Linking: `GauntletScenario` holds a FK to `SourceIntel` (sourceId).
- Reasoning connectivity: `SafeScopeReasoning` tables (not implemented yet) will query `SourceIntel` to calibrate severity and corrective action relevance.

### Production Reasoning Safety
- **Hallucination Mitigation:** Source facts must be clearly flagged as `extractionConfidence`. Only 'high' confidence records should be used for automated reasoning calibration.

### Ingestion & Validation
- **Ingestion:** Periodic batch ingestion from JSON manifests.
- **Validation:** Type-safety check for all new scenarios/intel vs the `hazard-taxonomy.ts` defined families.

### Administrative Review
- Dedicated UI dashboard to approve/reject new `source_intel` entries.
- Peer review required before promoting 'low' confidence records to production status.
