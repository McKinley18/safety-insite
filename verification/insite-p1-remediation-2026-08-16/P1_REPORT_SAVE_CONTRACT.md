# P1-04 — Report Save Contract and Scope Decision

## What must actually be stored

- **Report metadata** (org/site/inspector/confidentiality) — small, JSON-appropriate, sent inline. Unchanged.
- **Report snapshot/content** (findings, standards, corrective actions, HazLenz analysis references) — JSON-appropriate, sent inline, but must not be duplicated within the same request.
- **Photos (binary evidence)** — belongs exclusively in the existing dedicated multipart upload path (`POST /reports/:id/attachments/upload`), which this app already has and already calls immediately after report create/update (`uploadReportPhotosAndAttachMetadata` → `uploadCloudPhoto`). Binary data has no reason to also travel inline as base64 inside the JSON report body.
- **PDF binary** — generated/downloaded separately (`GET inspection-reports/:reportId/versions/:version/download`); never part of the save request body.
- **HazLenz analysis objects** — already computed server-side during classification; the report-save body only needs to reference/summarize them, not re-embed full raw analysis payloads (this phase did not find full raw HazLenz analysis objects being duplicated into the save body beyond what the finding data already legitimately needs).

## Decision on endpoint liveness (explicit user direction)

Presented with the tradeoff between (a) fixing only the payload shape and error handling, leaving save non-functional against the deliberately-retired legacy endpoint, (b) un-retiring that endpoint with a guessed-at minimal persistence implementation, or (c) migrating the wizard onto the canonical `inspections/:id/reports` generation flow — the user selected **(a)**: fix the payload and error handling; do not reverse the prior session's deliberate retirement of `POST /reports`, and do not undertake the canonical-migration wiring (which would require the `/inspection` wizard to persist through the canonical inspection/observation/finding lifecycle incrementally — a distinct, much larger body of work, explicitly out of scope per the task brief's "do not turn this phase into a full storage-system redesign").

Consequence: after this phase's fix, a cloud-save attempt from either call site no longer risks a raw/oversized-payload failure and no longer duplicates data in the request body, but will still receive a clean `404 Not Found` (no live handler for `POST /reports`) rather than succeeding. This is the same non-functional state as before this phase for the *success* case, deliberately preserved per user direction — what changed is that the failure is now guaranteed clean, small, and never duplicative, and the user sees an actionable message rather than a raw or purely technical one.

## Minimum fix implemented (Phase 13)

`frontend-next/lib/cloudReports.ts`:
- Added `stripInlinePhotoData()` — removes base64 `data:` URLs (and any non-serializable `File` objects) from `finding.photos[]` before a report is JSON-serialized for save/update; already-uploaded cloud photo references (`cloudImageUri`/`cloudAttachmentId`) pass through untouched. Exported and reused by `frontend-next/lib/auth.ts`'s `saveWorkspaceReport()` (the main `/inspection` wizard's save path), since it has the identical inline-photo-bloat problem.
- Removed body duplication in the create (`POST /reports`) and update (`PATCH /reports/:id`) request bodies — `report`/`findings` were previously sent as 2-3 redundant copies of the same data; now sent once as `frontendReportJson`.
- Added `parseCloudResponseBody()` — replaces five unconditional `JSON.parse(responseText)` call sites (`uploadCloudPhoto`, `patchCloudReportPackage`, `saveInspectionReportToCloud`, `fetchCloudReports`, `archiveCloudReport`) with a version that never throws on a non-JSON response body; a parse failure now falls back to `null` instead of raising a raw `SyntaxError` containing the server's literal (possibly non-JSON) error text.
- Added `cloudErrorMessage()` with an explicit `413` case producing a user-actionable message ("This report is too large to save (likely due to attached evidence photos)... try removing a photo or saving again with fewer attachments.") instead of surfacing the backend's raw technical message (`"request entity too large"`) verbatim — satisfies Phase 17's requirement that user-facing errors say what happened and what the user can do next, as defense-in-depth for any future oversized-report case (e.g. many photos) even after this fix.

Deliberately not done: raising the Express body-size limit (would mask the real duplication/binary-in-JSON problem, per the prior audit's own explicit judgment); reversing the legacy endpoint's retirement; touching backend code for this defect (the defect and its complete fix are entirely client-side payload shape and error handling).
