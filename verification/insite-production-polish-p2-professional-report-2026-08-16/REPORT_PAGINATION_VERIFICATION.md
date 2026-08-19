# Production Polish P2 — Pagination Verification

## Defects found and fixed (all in `canonical-report-pdf-renderer.ts`, new this phase)

### 1. Every footer/cover-reference draw inserted a spurious blank page

**Symptom**: Report A (one finding) rendered as **13 pages** — 6 real content pages plus 6 fully blank pages plus the cover, i.e. one blank page inserted after almost every real page ("large empty regions caused by naive page breaks," exactly the failure mode this phase's brief calls out).

**Root cause**: pdfkit auto-inserts a new page whenever text is drawn at a y-coordinate below the page's content boundary (`page.height - margins.bottom`). The footer text was intentionally positioned in the bottom margin area (`page.height - 38`), which is *below* that boundary — so every single footer draw triggered an automatic extra page to "hold" text that, in reality, fit fine in the margin. The cover page's small "Record reference" line at the very bottom had the identical bug.

**Fix**: the standard pdfkit idiom — temporarily set `doc.page.margins.bottom = 0` immediately before drawing text in the margin area, then restore the original value immediately after.

**Isolated, minimal repro**: a standalone Node script confirmed plain pdfkit does not spontaneously add blank pages under normal use (2 explicit `addPage()` calls → exactly 2 pages); a checkpoint-instrumented build of this renderer then pinpointed the exact call sites. Page count for a minimal one-finding fixture went from 13 → 6 after the fix, matching the expected count exactly (cover + 5 forced section pages, no overflow needed for that trivial fixture).

### 2. Executive Summary text rendered clipped into a narrow right-hand column

**Symptom**: the "Summary" paragraph on the Executive Summary page was visibly truncated, wrapping into a ~24pt-wide column near the right margin instead of the full content width.

**Root cause**: the risk-distribution bar chart draws its per-band count label at an absolute x-position near the right edge (`barX + barMaxWidth + 8`). pdfkit's cursor (`doc.x`) is left at that position after an explicit-x `.text()` call; the next call (`subHeading`/`body`, both flowing/no-explicit-x) inherited that wrong `doc.x` instead of the left margin.

**Fix**: explicitly reset `doc.x` to the left margin after any block that uses absolute x-positioning, before returning control to flowing text. Applied at the end of the bar-chart loop and — as a general, permanent safeguard against the same class of bug — at the end of both the table-header and table-row drawing routines in `simpleTable()`, since every table in the document uses the same absolute-column-position technique.

### 3. Footer showed "Page 7 of 6" (off-by-one)

**Root cause**: the page numerator counted from 1 including an implicit adjustment for the skipped cover page, while the denominator (`range.count - 1`) excluded the cover page — inconsistent conventions between numerator and denominator.

**Fix**: aligned both to the same convention (content-page-relative, cover excluded from both). Verified live: Report A's final page correctly reads "Page 5 of 5"; Report B "Page 6 of 6"; Report C "Page 8 of 8".

## Live verification after fixes

| Report | Findings | Pages | Blank pages | Clipped text | Footer numbering |
|---|---|---|---|---|---|
| A (simple) | 1 | 6 | 0 | none | correct |
| B (multi-hazard, 4 findings) | 4 | 7 | 0 | none | correct |
| C (stress test, 7 findings, long text) | 7 | 9 | 0 | none | correct |

## Long-content behavior (Report C)

pdfkit's flowing text model (used for all paragraph content — observation text, conclusions, corrective-action descriptions) auto-continues across a page boundary mid-paragraph without any manual line-height bookkeeping, which is a structural improvement over the legacy jsPDF renderer's fixed-height-guess approach (see `REPORT_ARCHITECTURE.md`). Confirmed live: Report C's intentionally very long (6×-repeated) observation text and long corrective-action description both wrap and continue across a page break cleanly, with no clipping, no overlapping text, and no content escaping the page margins.

## Heading-orphan prevention

`ensureSpace()` is called before every heading (section, subsection, and per-finding label) with a reservation sized to the heading plus a minimum first line of body content, so a heading is never left alone at the bottom of a page. Confirmed live across all three reports — no orphaned headings observed on any page.
