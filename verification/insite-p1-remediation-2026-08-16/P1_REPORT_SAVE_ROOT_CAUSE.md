# P1-04 — Report Cloud-Save Payload Failure — Root Cause

## Reproduction (Phase 10)

Constructed the exact single-finding scenario: one finding with one evidence photo (base64 data URL, 150,000 characters — representative of a real phone photo after base64 inflation), serialized exactly as `frontend-next/lib/cloudReports.ts`'s pre-fix `saveInspectionReportToCloud()` built the request body (`frontendReportJson` + `report` + top-level `findings`, all three containing the same nested photo data). Measured actual body size: **450,773 bytes** — 4.5x Express's default 100KB JSON limit — for a *single* finding.

Sent to the real backend (disposable DB, live server): `HTTP/1.1 413 Payload Too Large`, body `{"statusCode":413,"message":"request entity too large"}`.

## Payload composition (Phase 10)

The oversized body contained:
- The full report object serialized **three times** in the same request (`frontendReportJson: report`, `report`, and — redundantly, since it's already nested inside both copies — `findings: report.findings` again as a top-level field).
- The finding's photo `url` field: a **base64-encoded data URL embedded directly in the JSON body**, even though a dedicated multipart upload endpoint (`POST /reports/:id/attachments/upload`, `uploadCloudPhoto()`) already exists and is called for photo sync immediately after report creation/update.

## Classification (Phase 11)

- **DUPLICATE_SERIALIZATION** — confirmed: `frontendReportJson`, `report`, and `findings` in the same POST/PATCH body were the same data three times.
- **BINARY_IN_JSON** — confirmed and dominant: a single realistic photo alone (before any duplication) is large enough to exceed the 100KB limit on its own; duplication compounds it.
- Not primarily **SERVER_LIMIT_TOO_LOW** — the audit's own conclusion was reused and confirmed by this trace: raising the limit would paper over an architecturally wrong payload shape (binary data belongs in the multipart upload path this app already has, not inlined in JSON) rather than fix it.
- **ERROR_HANDLING_DEFECT**, secondary — the client's `saveInspectionReportToCloud()` (and four sibling functions in the same file: `uploadCloudPhoto`, `patchCloudReportPackage`, `fetchCloudReports`, `archiveCloudReport`) called `JSON.parse(responseText)` unconditionally, before checking `response.ok`. In this environment the 413 response happened to be valid JSON (`{"statusCode":413,"message":"request entity too large"}`), so the specific "unparseable text throws a raw SyntaxError" failure mode did not reproduce here — but the *message itself* (`"request entity too large"`) was surfaced to the user verbatim, an internal/technical string that answers none of "what happened / was work preserved / what can I do next." A body-size rejection returning non-JSON (e.g. from a reverse proxy or CDN in front of the real deployment, which this local repro does not include) would still have hit the unguarded `JSON.parse` and thrown a raw parse error — the defensive fix closes that path regardless of which exact shape the error body takes in any given environment.

## Separate, related finding (not a payload-size issue, flagged but out of this phase's fix per user direction)

Both cloud-save call sites (`cloudReports.ts`'s `saveInspectionReportToCloud`, `auth.ts`'s `saveWorkspaceReport`) `POST` to `${API_BASE_URL}/reports`. No controller in this backend answers a plain `POST /reports` today — confirmed live (`404 {"message":"Cannot POST /reports","error":"Not Found","statusCode":404}` once the payload is small enough to reach routing). `ReportsController` is mounted at `@Controller('legacy/reports')` and its own `create()` handler unconditionally throws `GoneException('Legacy report creation is retired. Generate an immutable report from a completed inspection.')` — a deliberate, pre-existing (uncommitted) architectural decision by prior work in this repo, retiring direct blob-upload report creation in favor of a canonical, server-side `POST inspections/:id/reports` generation flow that the `/inspection` wizard has not yet been wired to use. Per explicit user direction for this phase, this endpoint-liveness gap is **not** reversed or worked around here — see `P1_REPORT_SAVE_CONTRACT.md`.
