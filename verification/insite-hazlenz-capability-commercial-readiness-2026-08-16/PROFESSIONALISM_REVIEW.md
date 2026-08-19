# Frontend Professionalism Review — frontend-next/app

Scope: grep + manual read across `frontend-next/app/` for debug leakage, raw IDs/enums shown to
users, TODO/placeholder text, inconsistent button labels, and empty-state handling. This is not
an exhaustive line-by-line audit of every page — it covers the areas named in scope
(HazLenz/inspection/reports flows) plus a general sweep of `app/` for the listed patterns.

## Findings

### 1. Raw UUID displayed as page heading — `frontend-next/app/reports/page.tsx:112,114`
**Severity: P2**
```
<h2 ...>Inspection {report.inspectionId}</h2>
<p ...>Report {report.id} · created {new Date(report.createdAt).toLocaleString()}</p>
```
`report.id` and `report.inspectionId` are TypeORM `uuid` primary keys (confirmed via
`@PrimaryGeneratedColumn('uuid')` on the Inspection/report-related entities, e.g.
`backend/src/inspection/inspection.entity.ts:25`). A user visiting the Reports page sees headings
like "Inspection 8f14e45f-ceb9-4c6b-8bda-4d8b7d7f2b1a" / "Report 3c2a9e10-...". This is the
primary heading text for every report card, not a secondary/debug detail.
**Suggested fix:** Show a human-facing identifier instead (site name + date, or a short
sequential/display number), and move the raw UUID into a truncated "Advanced details" or
tooltip if it must be shown at all (see item 2 for a pattern already used elsewhere in the app).

### 2. Raw UUID displayed in "Advanced details" — `frontend-next/app/inspection-workspace/page.tsx:924`
**Severity: P3**
```
<p className="mt-1 text-xs text-slate-500">Finding ID: {finding.id}</p>
```
Lower severity than item 1 because it's behind a collapsed `<details>`/"Advanced details"
disclosure (line 922-923), so it's not front-and-center, but it's still an untruncated UUID.
**Suggested fix:** Truncate to the pattern already used elsewhere in this same file (see
`evidenceObjectId.slice(0, 8)` at line 940) for visual consistency.

### 3. `console.log` / `console.error` left in production page component — `frontend-next/app/inspection/page.tsx:361,412`
**Severity: P3**
```
361:    console.log("[HazLenz AI] handleRunSafeScope entered");
...
412:      console.error("[HazLenz AI] Review failed", error);
```
Any user who opens devtools during a HazLenz review will see internal debug logging, including
(at line 412) the raw caught error object logged to console on failure. This is the only file
under `frontend-next/app/` with console statements (confirmed via repo-wide grep).
**Suggested fix:** Remove the `console.log` entirely; replace `console.error` with a proper
logging/telemetry call gated behind a debug flag, or remove if not needed for production
diagnostics.

### 4. Raw caught error message surfaced verbatim to end user — `frontend-next/app/inspection/page.tsx:414-421`
**Severity: P3**
```javascript
const errorMessage =
  error instanceof Error && error.message
    ? error.message
    : typeof error?.message === "string"
      ? error.message
      : "Unknown HazLenz AI error.";

setSafeScopeStatus(`HazLenz AI review failed: ${errorMessage}`);
```
If the underlying failure is a technical exception (network error text, JSON parse error, stack
fragment, etc.), the user sees that raw message verbatim in the status line, e.g. "HazLenz AI
review failed: Unexpected token < in JSON at position 0." There's a reasonable "Unknown HazLenz AI
error" fallback for non-Error throwables, but no sanitization/mapping layer for the common case
where `error.message` is a raw technical string.
**Suggested fix:** Map known error classes (network timeout, 401/403, 5xx, parse error) to
user-facing copy; keep the raw message only in the `console.error` (once that's gated per item 3)
or in a telemetry payload, not in the on-screen status text.

## Patterns checked with no notable findings

- **Raw enum names shown unformatted** (e.g. `machine_guarding_loto`, `PLANNED_FUTURE`): no
  instances found. The classifier's user-facing `classification` field values are human-readable
  Title Case strings (e.g. `'Electrical'`, `'Machine'`, `'Controlled Condition'`) sourced from
  `backend/src/safescope-v2/taxonomy.seed.ts`, not raw snake_case IDs. One near-miss:
  `frontend-next/app/inspection-workspace/page.tsx:964` renders `{item.status}` unformatted next
  to a humanized `item.source` (`.replaceAll("_", " ")`), but `item.status` values observed in
  this flow are already lowercase words (e.g. "confirmed"/"unconfirmed"), not shouting-case enum
  literals — treat as informational only, not a defect.
- **TODO/FIXME/XXX comments in user-facing components:** none found under `frontend-next/app/`.
- **"Lorem ipsum" / "TODO: copy" placeholder text:** none found.
- **Empty-state components:** `frontend-next/app/reports/page.tsx:91-104` uses a shared
  `<EmptyState icon title description>` component (`frontend-next/components/ui/EmptyState.tsx`)
  with real copy ("No generated reports" / "Complete an inspection and generate a report to create
  the first durable version.") for both the loading-failed and zero-reports cases — this is a
  good pattern, not a defect. Other checked pages (`inspection-workspace`, `inspection-review`)
  use inline conditional copy for empty/not-yet-computed states (e.g. "No standard established for
  this finding yet", "No finding-specific risk has been computed yet.") rather than blank space or
  raw error objects.
- **Inconsistent button label capitalization on the same page:** checked
  `inspection-quick/page.tsx` ("Annotate", "Remove", "Run Quick Review", "Build Quick Report") and
  `inspection-workspace/page.tsx` ("Save observation revision", "Cancel", "Back to HazLenz
  review") — each page is internally consistent (Title Case on the quick-capture page, sentence
  case on the workspace page). No same-page inconsistency found in the files reviewed.

## Summary table

| # | File:line | Issue | Severity | Fix |
|---|---|---|---|---|
| 1 | frontend-next/app/reports/page.tsx:112,114 | Full UUID shown as report/inspection card heading | P2 | Replace with human-facing label; truncate/hide raw UUID |
| 2 | frontend-next/app/inspection-workspace/page.tsx:924 | Full UUID shown in Advanced details | P3 | Truncate like `evidenceObjectId.slice(0,8)` pattern used at line 940 |
| 3 | frontend-next/app/inspection/page.tsx:361,412 | console.log/console.error left in page component | P3 | Remove log; gate error log behind debug flag or route to telemetry |
| 4 | frontend-next/app/inspection/page.tsx:414-421 | Raw caught error.message shown verbatim in UI status text | P3 | Map known error types to user-facing copy before display |
