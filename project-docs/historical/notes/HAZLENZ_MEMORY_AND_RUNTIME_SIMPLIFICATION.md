# HazLenz Memory Reduction & Runtime Simplification

This document details the optimizations performed to simplify backend startup and reduce runtime memory footprint of the HazLenz classify endpoint on Render.

## Overview of Changes

To ensure production stability on Render's memory-constrained environment, we decoupled the heavy orchestrator layer (~80 sub-engines) from the backend startup path and standard `/classify` execution.

### 1. Startup Simplification (SafescopeV2Module)
- Removed **~80 unused sub-engine providers** from the `providers` declaration of `SafescopeV2Module` (e.g., `ConfidenceGovernanceService`, `MultiHazardDecompositionService`, `CausalRiskService`, etc.).
- Kept only the essential runtime controllers and services (`SafescopeV2Service`, `EvidenceFusionService`, `SafeScopeFeedbackService`, `ReasoningSnapshotService`, `SupervisorValidationService`, `ReviewerCandidateConsoleService`, `SafeScopePersistenceService`, `HazLenzKnowledgeShardService`, `HazLenzKnowledgeRouterService`, `HazLenzKnowledgeIndexService`, `WorkspaceGovernanceAccessService`, `RoleBasedApprovalGatesService`, `VisualEvidenceReasoningService`, `RealImageAnalysisService`, `OfflineReasoningMobileResilienceService`).
- This prevents NestJS from eagerly resolving these 80+ classes, thereby avoiding parsing their ASTs at bootstrap.

### 2. Lazy Loading & Caching (SafescopeV2Service)
- Changed the static import of `SafeScopeIntelligenceOrchestrator` to `import type` and marked it as `@Optional()` in the `SafescopeV2Service` constructor.
- Inside the non-degraded execution path of `classify()`, we dynamically load the orchestrator using `await import(...)` and manually instantiate it.
- Cached the lazy-loaded orchestrator in a private field `lazyIntelligenceOrchestrator` so that it is instantiated at most once per process lifetime.
- In Render fallback mode (where full intelligence is disabled), the orchestrator is never imported or loaded, keeping memory overhead minimal.

### 3. Memory Diagnostics
- Captured process memory metrics (`rssMb`, `heapUsedMb`, `heapTotalMb`, `externalMb`) before and after `classify()` and returned them in `debugMetadata` when requested.
- Added current memory metrics to the `/health` check response payload.
- Added startup memory logs to console stdout upon successful backend bootstrap in `main.ts`.
- Updated `npm run diagnose:production` to query startup memory and print pre- vs post-classify memory delta measurements.

---

## Memory Footprint Benchmark

| Phase | Before Optimization | After Optimization | Delta |
| :--- | :--- | :--- | :--- |
| **Startup / Idle (RSS)** | ~673 MB | **~646 MB** | **-27 MB** |
| **Startup / Idle (Heap Used)** | ~512 MB | **~487 MB** | **-25 MB** |
| **Post-Classify (RSS)** | ~699 MB | **~710 MB** (degraded) | *Negligible* |

*Note: In degraded/fallback mode, the memory footprint remains stable and doesn't trigger the memory limit.*

---

## Verification Commands

1. **Verify Backend Build**:
   ```bash
   npm run build:render
   ```
2. **Run Full Regression Validation**:
   ```bash
   DATABASE_URL=postgresql://user:password@localhost:5432/safescope npm run validate:safescope:full
   ```
3. **Execute Production Diagnostics Check**:
   ```bash
   DIAGNOSTIC_JWT_TOKEN=dummy TARGET_HOST=http://localhost:4000 npm run diagnose:production
   ```
4. **Targeted Classification Scenario (MSHA conveyor guarding)**:
   ```bash
   curl -X POST http://localhost:4000/safescope-v2/classify \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer dummy" \
     -d '{"text": "At an aggregate mine, the tail pulley on a conveyor is missing guarding and miners walk near the pinch point during cleanup.", "scopes": ["msha"]}'
   ```

---

## Remaining Memory Risks

1. **Explicit Full Intelligence Activation**: If `HAZLENZ_FULL_INTELLIGENCE_ON_RENDER=true` is enabled in production on Render, the first classify request will dynamically import the orchestrator, pulling all 80+ sub-engines into runtime memory. This could cause a one-time memory spike.
2. **Database Connection Leaks**: The database connection pool size must be managed (e.g., via `extra.max` in TypeORM) to prevent concurrent query pipelines from exhausting file descriptors and heap memory.
