# Standards Provisioning Architecture (traced from repository evidence)

## Two data stores feed citation resolution; a third exists but is not wired in

`POST /safescope-v2/classify` (hit by the 19-case audit via `hazlenz-independent-standards-audit.ts:432`) produces `standardDecisions`/`citationLevelCandidates`/`primaryCitation` from **two merged pipelines** inside `SafescopeV2Service`:

**Pipeline A — DB-backed, `ApplicableStandardsService.suggest()`** (`backend/src/applicable-standards/applicable-standards.service.ts:983`)
- Queries `standards_master` via `Repository<Standard>` (`applicable-standards.service.ts:1280-1334`), gated by `agency_code`/`scope_code`/`is_active=true`.
- Queries `safescope_knowledge_chunk`/`safescope_knowledge_document` via `Repository<SafeScopeKnowledgeChunk>` (`applicable-standards.service.ts:1072-1141`), gated by `document.sourceType='regulation'` and `citation ~ '^(29|30) CFR '`.
- `hydrateStandardReferences()` (`applicable-standards.service.ts:855`) later re-queries `standards_master` by citation `ILIKE` purely to attach `standardText`/`plainLanguageSummary`/title — if no row matches, it silently passes the citation through unenriched rather than dropping it.

**Pipeline B — pure in-memory regex, no DB access at all**
- `standard-applicability.rules.ts` (`EXPERT_APPLICABILITY_RULES`, ~1815 lines of hardcoded rule objects) + `InspectionCitationRankingService` + `InspectionCitationRecoveryService` — all three files have zero `InjectRepository`/`DataSource` usage. Citations here come purely from regex/keyword matching against the observation text.
- Both pipelines' outputs are merged (`safescope-v2.service.ts:1132`) before `buildStandardDecisions()` builds the final `response.standardDecisions`/`primaryCitation`.

**Not in the runtime path**: `regulatory_section`/`regulatory_paragraph`/`regulatory_part`/`regulatory_agency` are registered in `TypeOrmModule.forFeature([...])` (`applicable-standards.module.ts`) but never constructor-injected into any classify-path service. They are queried only by the separate `RegulatoryService`/`RegulatoryController` (`GET /regulatory/section?citation=`, `GET /regulatory/sections`), which is a standalone exact-text lookup surface, not part of citation decision-making. This is exactly the surface Phase 6 (paragraph/subsection UI resolution) needs to wire up.

**Implication**: because Pipeline B is DB-independent, an empty `standards_master`/empty knowledge corpus does not by itself guarantee zero citations for every case — cases whose hazard family matches an `EXPERT_APPLICABILITY_RULES` rule should still surface a citation via Pipeline B alone. A case that returns zero citations even with data provisioned is a candidate `REAL_RESOLUTION_DEFECT`, not automatically `DATA_PROVISIONING_ONLY`.

## Intended provisioning path (existing architecture, not reinvented)

```
standards_master:
  static curated seed (src/safescope-v2/standards-intelligence/standards-intelligence.seed.ts, 14 citations)
    -> npm run seed:safescope-standards
       (safescope-standards.seed.ts && sync-standards-intelligence-to-master.ts --apply && finalize-regulatory-release.ts)
    -> standards_master rows (curated text, small coverage: only 5 of the 17 citations
       required by the 19-case audit are present: 1910.212, 1910.147, 1926.501, 56.12016, 56.14107)

safescope_knowledge_document / safescope_knowledge_chunk:
  live eCFR bulk XML (govinfo.gov) via source-list manifests
    (backend/src/safescope-knowledge/ingestion/source-lists/osha-ecfr-1910.json,
     osha-ecfr-1926.json, msha-30-cfr-core.json -- these are URL manifests, not text)
    -> OshaEcfConnector / Msha30CfrConnector (discover() fetches + parses real XML)
    -> run-osha-ecfr-ingestion.ts / run-msha-30-cfr-ingestion.ts
       (npm run ingest:safescope:osha-1910 / ingest:safescope:osha-1926 / ingest:safescope:msha-30-cfr)
    -> safescope_knowledge_document (1 row per subpart) + safescope_knowledge_chunk
       (1 row per section, citation = "29 CFR 1910.212" etc, real eCFR text) -- broad
       coverage of every section in a part, not just curated citations.

regulatory_section / regulatory_paragraph (exact-text display surface, Phase 6/7/8):
  live eCFR bulk XML (same govinfo.gov source) via RegulatorySyncService.syncRegulatoryPart()
    -> regulatory_section rows (real text, 1 row per section)
    -> regulatory_paragraph: NOT populated by the current sync method (paragraphsUpserted
       is hardcoded to 0 in regulatory-sync.service.ts:59-80 -- the traverse() function
       never touches paragraphRepo). This is a genuine code gap, not a data gap; addressed
       in Phase 6.
```

No single existing script seeds all three surfaces together. This phase runs the existing scripts in sequence rather than inventing a new ingestion path, and documents the `regulatory_paragraph` gap as a defect to fix narrowly in Phase 6.

## 19-case audit requirement matrix

OSHA citations required: 1910.22, 1910.23, 1910.28, 1910.146, 1910.147, 1910.212, 1910.219, 1910.305, 1910.1200; 1926.501, 1926.1053, 1926.651, 1926.652.
MSHA citations required: 30 CFR 56.9100, 56.9300, 56.11001, 56.11012, 56.12016, 56.14107, 56.14132, 56.18002.

Full case-by-case table recorded in `STANDARDS_19_CASE_BASELINE.md` / `STANDARDS_19_CASE_PROVISIONED.md`.
