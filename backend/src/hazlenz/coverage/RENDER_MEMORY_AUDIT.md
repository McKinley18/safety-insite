# HazLenz Backend Memory Audit & Compression Strategy

This document reports findings from the memory usage audit of regulatory standards retrieval and describes the implemented query compression strategy.

## Audit Findings

We scanned the codebase for usages of the `standards_master` table, `Standard` repository, `SafeScopeKnowledgeChunk` repository, and related services during the `review/classify` lifecycle. We identified two major memory-leak and memory-pressure bottlenecks:

### 1. In-Memory Caching of Full-Table Standards & Chunks
* **Location**: `backend/src/applicable-standards/applicable-standards.service.ts`
* **Risk**: The service maintained `private cachedStandards: CachedStandard[]` and `private cachedChunks: CachedKnowledgeChunk[]` as in-memory cache arrays.
* **Before Behavior**:
  * On the first `suggest()` invocation, it executed a full-table `.find()` query fetching up to 5,000 active standards, mapping them to local objects, and caching them permanently in memory.
  * It also executed a query loading all 2,340 knowledge chunks, complete with large columns (`chunkText`, `chunkSummary`), caching them in memory.
  * This meant that 2,415 standards (including standard text, summaries, and keywords) and 2,340 chunks were held indefinitely in RAM, resulting in high baseline memory consumption that caused Render deployment containers to crash under memory pressure.

### 2. Full-Record Selection Without Projection
* **Location**: `backend/src/safescope-v2/standards-intelligence/standards-intelligence.service.ts`
* **Risk**: During classification matching, up to 100 matching standards were retrieved via `query.take(100).getMany()`.
* **Before Behavior**:
  * Since no query projection (select list) was specified, TypeORM loaded all columns—including the large `standard_text` column—for all 100 rows from the database.
  * Loading large text fields in bulk per request leads to CPU spikes during JSON serialization/deserialization and excessive heap allocations.

---

## Implemented Compression Strategy (After Behavior)

To guarantee memory-safety, we replaced bulk in-memory operations with route-scoped, citation-limited, and projection-limited database queries:

### 1. Route-Scoped Filtering & Database-Side Search
* In `ApplicableStandardsService.suggest()`, the script extracts search terms from the input description and queries PostgreSQL using `ILIKE` on the `title` and `keywords` columns.
* Only the relevant subset of standard rows is fetched from the database, capped at a maximum of **50 fallback candidates**.
* If route hints are provided (e.g. from active warm shards), the script fetches only those specific citations using canonicalized flexible `ILIKE` checks to ensure subsections are matched, capped at **25 focused candidates**.
* Knowledge chunks are queried dynamically based on the search terms and route hints, capped at **50 chunks**, rather than caching all 2,340 in memory.

### 2. Column Projection (Compact Selects Only)
* We explicitly avoid selecting the massive `standard_text`, `plain_language_summary`, `keywords`, and `hazard_codes` columns during standard classify/review lookups.
* We select only the compact columns required for scoring and mapping:
  * `id`, `agencyCode`, `citation`, `partNumber`, `title`, `scopeCode`, `sourceKey`, `authorityTier`, `allowedUse`, `severityWeight`, `isActive`, `requiredControls`.
* For `StandardsIntelligenceService`, we query only the fields needed to score (including keywords/hazard codes but excluding `standardText`).
* For `SafeScopeKnowledgeChunk`, we completely omit `chunkText` from the query selection list during normal review/classify, calculating scores using title/section-headings/summaries instead.

### 3. Focused Shard Citation Guarantee & Stricter Jurisdiction Gating
* **Shard Citation Guarantee**: Focused shard citations are matching-guaranteed using a canonicalization helper (`canonicalizeCitation`) that matches parent/subsection section numbers (e.g. `30 CFR 56.14107` correctly matches `30 CFR 56.14107(a)`), and are strongly boosted (score +200) and prioritized to the top of results.
* **Strict Jurisdiction Gating**: Active route-scoped jurisdictions (`msha`, `osha_general_industry`, `osha_construction`) are enforced on both database standard/chunk queries and final results filtering, excluding irrelevant cross-scope candidates.

### 4. Strict Slicing
* The final list of returned standards is sorted first by match priority (focused citations first, then route-scope compatible standards, then fallback standards within the same jurisdiction), and sliced to `limit` (max 10 by default) before returning to the caller.

---

## Memory Risk Summary

| Area / Operation | Before | After | Memory Savings |
|---|---|---|---|
| **Standards Cache** | 2,415 full rows (with text/summaries) in RAM | 0 cached rows (on-demand database queries) | **~100% baseline RAM reduction** |
| **Knowledge Chunks Cache** | 2,340 full chunks (with chunkText) in RAM | 0 cached chunks (on-demand database queries) | **~100% baseline RAM reduction** |
| **Normal Classify Lookups** | 2,415 rows processed in JS memory | Max 75 compact rows retrieved (25 focused + 50 fallback) | **97%+ transaction memory reduction** |
| **Large Text Column Payload** | `standard_text` and `plain_language_summary` selected | Compact columns selected; large text columns excluded | **90%+ network / serialization savings** |
