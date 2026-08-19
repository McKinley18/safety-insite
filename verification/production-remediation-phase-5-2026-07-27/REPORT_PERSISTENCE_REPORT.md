# Report persistence report

Canonical tables are `inspection_reports` and `inspection_report_versions`.

Generation authorizes the inspection, requires `completed`, captures immutable observation/finding/analysis/review/corrective-action data, persists `generating`, creates a PDF, verifies `%PDF-`, stores it privately, persists checksum/size/object reference, and then marks `generated`.

Failures persist `failed` and a bounded failure reason. No filesystem path is returned.

Real integration evidence:

- one stable report identity
- two report versions
- two distinct storage objects
- two generation audit events
- authorized downloads returned legitimate PDF bytes
- cross-user retrieval returned 404
