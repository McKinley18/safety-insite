# Production Polish P2 — Report Export UX

## Canonical flow (`/inspection-workspace` → report generation)

- **In progress**: `complete()` sets a visible, accessible status message (`role="status" aria-live="polite"`) to *"Saving corrective action, calendar task, and report…"* before any async work starts, and the primary button is disabled for the duration. The user is not left guessing.
- **Success**: a distinct green "Report generated" panel appears (previously "Durably saved" with a raw `checksum {hash}…` fragment shown to the user — fixed this phase, see below), with a clear "View report history" button routing to `/reports`.
- **Where the PDF is**: `/reports` lists every persisted report with a "Download PDF" button per version; downloading shows an explicit "Downloading…" button state (`app/reports/page.tsx`).
- **Failure**: `catch` sets `status` to the thrown error's message (or a generic fallback), shown in the same visible status region — not a silent failure, not a raw stack trace (errors thrown by `generatePersistedReport`/`transitionPersistedInspection` are already-formatted API error messages, not raw exceptions).

## Fix applied this phase

`app/inspection-workspace/page.tsx`'s completion panel exposed an internal `report.checksum` value in end-user copy: *"Report version {v} · checksum {hash.slice(0,12)}…"* — a direct violation of the brief's "do not expose internal snapshot terminology." Changed to plain language: *"Version {v} of this inspection's report has been saved and is available in your report history."* The checksum itself remains fully available (unaffected) via the backend API for anyone who needs it for integrity verification — only the default end-user-facing copy changed.

## P0-01 export fix preserved

`frontend-next/lib/inspection/reportExportService.ts` (the P0-01 fix from the prior remediation phase, legacy `/inspection-review` flow) was not touched this phase — confirmed via `git diff --stat`, file absent from this session's changed-file list.

## Not exercised this phase

A live click-through of the full `/inspection-workspace` completion UX (as opposed to reading the source and reasoning about the state machine) was not additionally performed, since the same underlying `generatePersistedReport`/backend `/reports` endpoint was already driven live, repeatedly, and successfully via the API-level report-generation script used to produce Reports A/B/C — the UX layer here is a thin, directly-readable wrapper around that same call with no additional business logic to hide a defect in.
