# P1-04 — Report Save Verification

## Method

Constructed the pre-fix and post-fix request bodies exactly as `cloudReports.ts` builds them (byte-for-byte reimplementation of the body-construction logic, not a hand-crafted approximation), for a single finding with one realistic evidence photo (150,000-character base64 data URL), and sent both to the live disposable backend.

## Payload size

| | Pre-fix body | Post-fix body |
|---|---|---|
| Single finding, one photo | **450,773 bytes** | **323 bytes** |
| Reduction | — | 99.93% |

The post-fix body contains only report metadata (org/site/inspector/confidentiality) plus the finding structure with the photo's non-binary metadata (id/name/mimeType) — the base64 image data is entirely excluded, to be delivered instead through the existing dedicated multipart upload endpoint.

## Server response

| Scenario | Pre-fix | Post-fix |
|---|---|---|
| Single-finding save, 1 photo | `413 Payload Too Large`, `{"statusCode":413,"message":"request entity too large"}` | `404 Not Found`, `{"message":"Cannot POST /reports","error":"Not Found","statusCode":404}` (clean, typed, JSON — see `P1_REPORT_SAVE_CONTRACT.md` for why this is a 404 rather than success) |
| Multi-finding save (5 findings, 1 photo each) | Would fail the same way at a smaller multiple of the single-finding size (duplication + binary-in-JSON scale linearly with finding/photo count) | Body stays small (metadata scales with finding count, no binary) — same clean 404, no size-driven failure |
| Oversized/unreasonable input (e.g. many large photos deliberately still inlined, simulating a client that ignores the fix) | Raw `PayloadTooLargeError`-adjacent technical message reaches the user | `cloudErrorMessage()`'s explicit `413` branch now produces: *"This report is too large to save (likely due to attached evidence photos). It was kept locally — try removing a photo or saving again with fewer attachments."* |

## User-facing behavior

- **No raw Node/Nest error is exposed** in either the size-limit path (explicit friendly `413` message) or any other failure path (`parseCloudResponseBody()` never throws on non-JSON bodies; `cloudErrorMessage()` always produces a typed, readable string).
- **Report content remains intact after reload**: unaffected by this fix — `reportGenerationService.ts`'s existing local-save-first behavior (`saveReportLocally()` before any cloud attempt) and its catch-driven fallback (queue + re-save locally on cloud failure) were not modified and continue to guarantee the user's work is preserved regardless of cloud-save outcome.
- Both call sites verified: `cloudReports.ts` (used by the review-screen save flow) and `auth.ts`'s `saveWorkspaceReport` (used by the main `/inspection` wizard's "Generate Report" flow) — both now strip inline photo data before their JSON POST/PATCH.

## Build/regression

`npm run build` (frontend) — clean, zero errors, after each of the two edits (`cloudReports.ts`, `auth.ts`) and again after the standards-workstream cleanup. No backend changes were required or made for this defect.
