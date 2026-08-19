# Durable corpus run

`run-independent-corpus.mjs` writes an atomic `CORPUS_RUN_CHECKPOINT.json` after every case. A resumed run skips completed stable IDs, refreshes its disposable entitlement through normal login, and records retries and transport status separately from reasoning verdicts. The completed checkpoint is retained at `verification/hazlenz-production-completion-2026-08-03-continuation/CORPUS_RUN_CHECKPOINT.json`.

