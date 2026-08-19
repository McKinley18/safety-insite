# Production Polish P2 — Baseline

## Repository state

- Branch: `main`
- HEAD: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` (unchanged throughout this phase — no commit made)
- Working tree: same substantial pre-existing uncommitted work as documented in prior phases, untouched except for this phase's own edits.

## Prior audit consulted (not re-run)

- `verification/insite-production-polish-efficiency-audit-2026-08-16/REPORT_VISUAL_AUDIT.md` — could not obtain a final exportable PDF at all; reported PDF/report export as a P0 in its own right.
- `verification/insite-production-polish-efficiency-audit-2026-08-16/REPORT_CONTENT_INTEGRITY.md` — found a corrective-action content-mismatch defect and a finding-identity swap defect at the pre-export/persisted-finding level.
- `verification/insite-production-polish-efficiency-audit-2026-08-16/PRODUCTION_POLISH_BACKLOG.md` — ranked P0-1 (PDF export dead end), P0-2 (finding-identity swap), P0-3 (corrective-action content mismatch).
- `verification/insite-p0-remediation-2026-08-16/` — confirms all three P0s above were already root-caused and fixed in a prior phase (P0-01/02/03), verified via a real 3-page PDF export from the **legacy** `/inspection-review` → `localExporter.ts` (jsPDF) path.

## Architecture discovery this phase (see `REPORT_ARCHITECTURE.md`)

The application has **three** independent report/PDF code paths. The P0 remediation phase's "real, well-formed 3-page PDF" evidence was produced by the legacy jsPDF path (`frontend-next/lib/localExporter.ts`), reachable only from `/inspection-review`. The canonical, currently-promoted flow (`/inspections` → `/inspection-workspace` → `/reports`, the path Production Polish P1 pointed the dashboard's primary CTA at) uses a **completely separate, backend-generated (pdfkit) PDF**, `backend/src/reports/canonical-reports.service.ts`'s `pdfFromSnapshot()`. Before this phase, that function was an extremely minimal, unstyled dump: no cover page, no typography hierarchy, no standards, no photos, no owner/due-date/status for corrective actions, and it displayed raw internal UUIDs (`Inspection ID: ${inspection.id}`, `[finding ${action.findingId || 'unlinked'}]`) directly to the reader — i.e., exactly the "developer export / raw database dump" this phase's brief says the report must not look like. This — not the already-reasonably-designed legacy jsPDF path — is the report a real user gets today via the promoted flow, and is this phase's primary target.

## Baseline commands run before any edit

```
$ git rev-parse HEAD
24e37703ff37d96b0e42cde4b85ccdef89b2bf2a
$ npm run build   (backend)   → PASS
$ npm run build   (frontend)  → PASS
$ git diff --check             → PASS
```

## Before-state evidence

The pre-fix canonical PDF's source (`pdfFromSnapshot`, pre-edit) is preserved in this phase's implementation report (`REPORT_P2_IMPLEMENTATION_REPORT.md`) as a verbatim diff; a live "before" PDF was not separately generated and archived because the function's minimal output was already fully characterized by direct source reading, and regenerating it would require temporarily reverting the fix — a needless extra risk to the working tree for a well-understood baseline. The **legacy** jsPDF path (`localExporter.ts`) was left running its pre-existing, already-reasonable design; this phase made narrow, targeted improvements to it (see `REPORT_P2_IMPLEMENTATION_REPORT.md`) rather than a full rewrite, since it was not the primary defect.

## Protected-surface identification

This phase's production edits are confined to `backend/src/reports/canonical-reports.service.ts` (pre-existing untracked file, edited), `backend/src/reports/canonical-report-pdf-renderer.ts` (new file), and `backend/src/reports/reports.module.ts` (tracked, edited to register `Site`/`User` repositories) — confirmed via `git status`/`git diff --stat`. None of these belong to the V4 authoritative matrix, V5-C01–C05, P1-02, prior P0/P1/AUTH-P1 remediation fixes, or Production Polish P1's inspection/standards changes.
