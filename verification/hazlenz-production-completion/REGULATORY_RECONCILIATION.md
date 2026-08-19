# Regulatory reconciliation

The importer now records source-document SHA-256, normalized-record SHA-256, retrieval time, parser version, and release candidate ID. OSHA and MSHA source responses are fetched once per source and cached during a run. Ingestion errors exit nonzero.

Results:

- 129 official-source documents
- 2,265 unique normalized chunks
- deterministic record checksums
- no automatic approval
- no duplicate promotion into `standards_master`
- Subpart C was rejected as a reserved/invalid source target rather than silently counted

Remaining reconciliation requires comparison to authoritative title indexes, Part 1904 ingestion, paragraph-level hierarchy verification, and reviewer approval.

