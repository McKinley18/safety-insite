# Legacy report reconciliation

`quarantine-legacy-reports.ts` is dry-run by default and requires `--apply`. It deterministically hashes each source row and classifies ownership ambiguity, unsafe path references, or missing artifacts.

A disposable ambiguous legacy row with `/uploads/report.pdf` was classified `ownership_ambiguous`. Apply was run twice:

- legacy source rows after: 1
- quarantine rows after: 1
- source deleted: no
- idempotent: yes

Quarantined rows do not gain a canonical download route. Administrative remediation remains manual.
