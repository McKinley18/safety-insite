# P0-01 — PDF Export Root Cause

## Files involved

- `frontend-next/app/inspection-review/page.tsx` — the Step 5 Final Review page
- `frontend-next/components/inspection/ReviewExportPanel.tsx` — the checkbox + Export button
- `frontend-next/lib/inspection/reportExportService.ts` — `runInspectionExport()`, the export orchestration function
- `frontend-next/lib/inspection/reportReviewHelpers.ts` — `getSafeScopeReviewSummary()`, `getSafeScopeValidationStatus()`, `isSafeScopeValidationComplete()`
- `frontend-next/lib/localExporter.ts` — the actual PDF generator (client-side `jsPDF`)
- `backend/src/pdf/pdf.controller.ts` — the legacy networked PDF route (irrelevant to this bug, see below)

## What the export path actually does (traced before editing)

The legacy `/inspection-review` "Export Final PDF" button is, by design, a **100% client-side export**. `runInspectionExport()` builds a `findings` array from in-memory report state and calls `localExporter.generatePDF(...)`, which uses `jsPDF`/`jspdf-autotable` to build and save a PDF file entirely in the browser (`doc.save(...)`). It never calls the backend. The one legacy backend PDF route that exists, `GET /legacy/pdf/:id`, is intentionally retired — its handler unconditionally throws `GoneException('Legacy PDF generation is retired. Retrieve an immutable canonical report version.')` — and nothing in `frontend-next` calls it (confirmed via repo-wide grep).

**Zero network requests on export click is therefore normal, expected behavior for this path, not evidence of a broken/blocked export.** The audit's inference ("zero network requests → export is dead-ended") was reasonable but incomplete; it did not check whether a file was actually produced.

## The real defect: a misleading, unsatisfiable warning

Two independent gates exist on the Export button:

1. `disabled={!humanReviewConfirmed}` on the button itself (`ReviewExportPanel.tsx`) — a real, correctly-wired gate tied to the "I confirm this report has been reviewed by a qualified person" checkbox.
2. Inside `runInspectionExport()` (`reportExportService.ts`, pre-fix lines 19–35):

```ts
const currentFindings = report.findings || [];
const safeScopeReviewSummary = getSafeScopeReviewSummary(currentFindings);

if (!humanReviewConfirmed) {
  setExportWarning("Confirm qualified-person review before exporting this report.");
  return;
}

if (safeScopeReviewSummary.unvalidated > 0) {
  setExportWarning(
    `${safeScopeReviewSummary.unvalidated} HazLenz AI finding(s) still need snapshot validation. Export will continue only after you confirm qualified-person review.`,
  );
} else {
  setExportWarning("");
}
// ...execution continues unconditionally into building `findings` and calling
// localExporter.generatePDF(...) regardless of `unvalidated`
```

`safeScopeReviewSummary.unvalidated` counts findings whose `safeScopeResult.validationStatus` is not one of `validated_accepted` / `validated_modified` / `validated_rejected` (`reportReviewHelpers.ts`, `isSafeScopeValidationComplete`). A repo-wide search found **no code path anywhere in `frontend-next` that ever sets `validationStatus` to one of those three values** — `FindingsReviewList.tsx` only displays the field as a read-only badge; there is no Accept/Reject/Validate control on this page or anywhere else in the flow. `unvalidated` is therefore permanently non-zero for any AI-generated finding, for every user, forever — the warning branch fires unconditionally and the "Export will continue only after you confirm qualified-person review" text is simply false: the checkbox has already been confirmed by the time this branch runs (the earlier `!humanReviewConfirmed` branch already returned if it hadn't), and the code that follows has no `return` — export proceeds regardless.

**Live confirmation:** clicking Export with the checkbox checked, pre-fix, produced this exact warning text with zero network requests — and a real PDF file (`~/Downloads/INSITE-REPORT-Field Inspection-1786897473430.pdf`) was written to disk at the same timestamp, containing the correct inspection data. The export silently succeeded while telling the user it hadn't.

## First unreachable/incorrect decision point

`reportExportService.ts`'s `unvalidated > 0` branch (pre-fix line 29): it reads a field (`safeScopeResult.validationStatus`) that no UI control on this page — or anywhere in the app — can ever set to a "validated" value, and displays export-blocking language despite having no actual blocking effect on the code that follows it.

## Contract classification (Phase 3)

- Export is **AVAILABLE** once `humanReviewConfirmed` is true — this is already correctly implemented and unaffected by this fix.
- The `unvalidated`-driven warning is a **stale/obsolete dependency**: it duplicates the already-functioning `humanReviewConfirmed` gate, checks a field with zero producers, and (per the code as written) does not actually gate anything. It is not a legitimate data-integrity gate — no code path treats it as one.
