# Free / Pro / Offline Regression

## Free path

Not touched by any change this phase. `/inspections` → "Quick Inspection" remains a distinct card/route (`/inspection-quick`), unaffected by the dashboard CTA change (which now points to the `/inspections` hub, where Quick is still presented as an equal, explicit choice alongside Full — not removed or demoted relative to Free).

## Pro path

`/inspection-workspace` (canonical Full Inspection) — all of this phase's edits live here. Verified end-to-end with a real Pro-entitled test account: capture → HazLenz review → evidence-gap clarification → risk → finalize → corrective action, all functioned correctly after every edit (see `POLISH_P1_REGRESSION.md` for the V4/V5 regression detail).

## Offline / graceful degradation

The new on-demand standards-text lookup (`getRegulatorySection()` in `canonicalWorkflowApi.ts`) wraps its fetch in try/catch and returns `null` on **any** failure — network absence, server error, unauthenticated, or simply a citation not yet in the corpus. `StandardCitationHeading` treats `null` identically to "not ingested yet": it shows the pre-existing, already-shipped honest "not currently available" message. There is no code path where a failed standards-text fetch blocks, errors, or degrades the rest of the inspection flow — confirmed by reading the call site (the lookup only fires on the citation's own "Standard detail" click, is `await`ed inside that one handler, and touches no other component state).

No new server dependency was added to the classify/analysis request path itself — the regulatory-text lookup is a separate, optional, on-demand call, satisfying the phase's performance-non-regression requirement (see `POLISH_P1_REGRESSION.md`).
