# Knowledge table report

Root cause: canonical SafeScope knowledge entities existed, but the clean migration chain did not create their tables; a standalone maintenance script masked the deployment defect.

Migration `1800000002000` now creates:

- safescope_knowledge_documents
- safescope_knowledge_chunks
- safescope_knowledge_retrieval_logs
- safescope_knowledge_sources
- safescope_knowledge_ingestion_runs
- required indexes and document/chunk foreign key

Clean database verification found all five tables after 25/25 migrations. Empty optional knowledge is valid and no reasoning rule was changed.
