# Production Polish P2 — Report Content Contract (implemented)

Implemented in `backend/src/reports/canonical-report-pdf-renderer.ts`, in this order:

1. **Cover page** — InSite wordmark, "Inspection Report" title, site/facility name, inspection date, inspector name, findings-documented count, report-generated date. Record ID present only as a small, muted "Record reference [8-char short form]" line at the bottom — never a prominent raw UUID.
2. **Executive Summary** — total findings, Critical/High count, open corrective actions, inspection status; a risk-distribution bar chart (Critical/High/Moderate/Low counts, tallied from each finding's already-computed `riskBand` — no recalculation); a one-paragraph, evidence-bound summary sentence (three tiers depending on whether Critical/High, Moderate-only, or Low-only findings dominate — no invented KPIs, no "site is safe/compliant" claims).
3. **Inspection Information** — site/facility, inspection title, inspection date, inspector, status.
4. **Findings Summary** — a table: #, Hazard, Risk, Status, Action status (Open / Closed / "No action logged").
5. **Detailed Findings** — one block per finding, consistent structure (see `REPORT_VISUAL_DESIGN.md`).
6. **Corrective Action Summary** — consolidated table (Finding #, Action, Owner, Due, Status) across every action in the inspection; the whole section is omitted when there are zero corrective actions inspection-wide.
7. **Footer disclaimer** — "HazLenz AI output is advisory and requires qualified human review..." — present once, at the end, de-emphasized (muted color, small size), not repeated as noise throughout the document.

## Deviations from the brief's suggested structure, and why

- No separate "Report Notes / Methodology" section — the brief itself says "only if genuinely useful," and there is no persisted scope/methodology field in the canonical data model to draw from; adding placeholder text would violate the "never fabricate" principle applied everywhere else in this redesign.
- No photo section — the canonical inspection data model (`InspectionFinding`, `Observation`) has no photo/attachment entity at all (confirmed by entity-level trace in `REPORT_ARCHITECTURE.md`); the report cannot render evidence it was never given. This is an honest architectural gap, not a rendering defect — see `REPORT_PHOTO_VERIFICATION.md`.
