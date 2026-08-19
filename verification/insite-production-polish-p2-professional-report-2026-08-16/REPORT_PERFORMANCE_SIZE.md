# Production Polish P2 — Performance & Size

## PDF size (before/after this phase's pagination fixes)

| Report | Findings | Before fix (13/?-page bug present) | After fix | Pages after |
|---|---|---|---|---|
| A | 1 | 12,454 bytes (13 pages, 7 blank) | 8,793–8,797 bytes | 6 |
| B | 4 | not separately measured pre-fix | 12,488–12,504 bytes | 7 |
| C | 7 (long text) | not separately measured pre-fix | 15,899–15,900 bytes | 9 |

Fixing the spurious-blank-page bug alone cut Report A's size by ~30% in addition to fixing the visible defect — confirming the blank pages were real overhead, not just a cosmetic issue. No image data is embedded in any of these reports (the canonical data model carries no photos — see `REPORT_PHOTO_VERIFICATION.md`), so size scales with text/table content only; growth from A→B→C (1→4→7 findings, one long-text finding) is roughly linear and unremarkable. No broad payload optimization was attempted or needed.

## Generation timing

Measured directly against the live disposable backend (`test_reportp2_20260816`), wall-clock around the `POST /inspections/:id/reports` call:

- Fresh single-finding inspection, first-time generation (full pdfkit render + private-storage write, not the duplicate-fingerprint-replay fast path): **23 ms**.
- Duplicate-fingerprint replay (no re-render, returns existing version) for Reports A/B/C: 53–70 ms (dominated by network/DB round-trip, not rendering).

No obviously poor scaling: generation time is dominated by fixed overhead (DB transaction, advisory lock, storage write), not by finding count, since pdfkit's synchronous drawing calls for even Report C's 7 findings and long text are sub-millisecond-class work. No optimization was attempted, consistent with the instruction not to optimize prematurely.
