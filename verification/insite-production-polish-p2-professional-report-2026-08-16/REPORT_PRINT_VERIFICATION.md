# Production Polish P2 — Print Fitness

## Single design, no dark mode

The renderer defines exactly one color palette (see `REPORT_VISUAL_DESIGN.md`), applied unconditionally — there is no dark-mode branch, no `prefers-color-scheme` logic, nothing theme-dependent. This is structurally guaranteed (the renderer is server-side pdfkit with no access to any client theme state), not just a design choice that could drift.

## Background / contrast

All page backgrounds are white (pdfkit default, never overridden to a color). Body text is near-black (`#0F172A`) on white — high contrast. Muted/label text (`#475569` on white) meets comfortable print contrast; the faintest tier (`#94A3B8`, footer/record-reference only) is intentionally de-emphasized supporting text, not primary content.

## Grayscale legibility

Risk bands never rely on color alone: every risk badge pairs a distinct fill color with a bold, all-caps text label ("CRITICAL"/"HIGH"/"MODERATE"/"LOW") rendered in white on the colored fill — legible whether printed in color or grayscale, and the four risk colors were chosen to also separate reasonably by luminance when desaturated (Critical/High are darker reds/oranges, Low is a mid-value green), so relative severity remains distinguishable even in pure grayscale.

## Borders

Table borders and section rules use a light gray hairline (`#E2E8F0`, 0.75pt) — thin but printed at standard laser/inkjet resolution this remains visible; table header rows additionally get a light panel-gray fill (`#F8FAFC`) as a secondary visual cue independent of the border line.

## No print-specific PDF variant needed

Because the document was designed print-first from the start (single palette, no interactive/hover-dependent affordances, no screen-only elements), the same generated PDF serves screen viewing, printing, and PDF-save equally — consistent with the brief's explicit instruction not to generate separate light/dark PDFs.
