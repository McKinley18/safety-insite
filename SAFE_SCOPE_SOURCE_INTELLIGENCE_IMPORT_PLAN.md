# Source Intelligence Import Plan
1. Validate SAFE_SCOPE_STRICT_SOURCE_ELIGIBLE_INTELLIGENCE.json via audit script.
2. Ingest into source_documents table.
3. Link hazard lessons and controls to source_documents.
4. Finalize linking via source_gauntlet_links.
5. Rollback on failure.
