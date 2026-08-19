# CLOSURE — Real Photo/Evidence Workflow

Date: 2026-08-16. Branch `main`, HEAD `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`.

## Where photo evidence can be captured/uploaded

`POST /inspections/:inspectionId/evidence` (`backend/src/storage/files.controller.ts:15`) —
inspection-scoped file upload (`FileInterceptor`, in-memory, 10MB limit, single file),
validated as a real raster image via `validateRasterImage()` before storage. Retrieval via
`GET /files/:id`, deletion (tombstone) via `DELETE /files/:id`.

## Which inspection flow stores it

The upload is scoped to the **inspection**, not to a specific observation or finding —
`StorageService.store()` is called with `category: 'evidence', parentType: 'inspection',
parentId: inspection.id`. There is no finding-scoped or observation-scoped photo attachment
endpoint in the canonical workflow.

## Live exercise (real disposable image, real HTTP calls)

Used a real, freshly-generated 4×4 PNG (`/tmp/closure-test-evidence.png`, valid PNG signature/
IHDR/IDAT/IEND, not a stub) against the disposable-DB backend (bypass-OFF instance, real user
token, `test_hazlenz_closure_20260816`):

1. Created a site + inspection.
2. `POST /inspections/:id/evidence` with the PNG → **201**, returned a real storage record
   (`provider: local_test`, `objectKey`, `sha256`, `sizeBytes: 73`, `status: ready`).
3. `GET /files/:id` → **200**, downloaded bytes verified as a valid PNG (`file` confirms
   `PNG image data, 4 x 4, 8-bit/color RGB`) — round-trip integrity intact.
4. `GET /inspections/:id` immediately after → **200** — the inspection was not broken or left
   in an inconsistent state by the upload.

(One environment-setup fix was needed along the way: both disposable backend instances
initially lacked `STORAGE_LOCAL_ROOT`, causing a 500 on any storage-backed call including this
upload and report generation. This is a local test-harness configuration gap in this session's
setup, not a product defect — `LocalTestStorageProvider` correctly refuses to start without it.
Fixed by setting `STORAGE_LOCAL_ROOT=/tmp/closure-storage-<port>` and restarting; not a code
change.)

## Whether canonical finding/report persistence supports it

**No — confirmed by code, not by assumption.** `canonical-reports.service.ts` (the professional-
report generator) constructs its PDF snapshot from inspection/observation/finding/action/review
records only; it never queries `StorageService` for `category: 'evidence', parentType:
'inspection'` records, and `canonical-report-pdf-renderer.ts` has no code path that embeds an
image. Findings themselves (`inspection_findings` entity) have no photo/attachment field.

## Result: **PHOTO_REPORT_GAP_CONFIRMED**

Photo evidence can be uploaded and retrieved cleanly through a real, working endpoint, and doing
so does not disrupt the inspection. It does not yet reach the canonical professional PDF report —
this is a pre-existing, documented architecture gap (the report renderer's snapshot model simply
has no field or query for it), not a regression introduced by the current capability-remediation
changes (negation, multi-hazard, entitlement, dark mode). No production code was changed for this
finding, per the task's own instruction not to fabricate canonical photo support that doesn't
exist.
