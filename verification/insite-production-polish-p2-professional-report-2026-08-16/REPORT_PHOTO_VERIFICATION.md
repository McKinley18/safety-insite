# Production Polish P2 — Photo Verification

## Honest architectural gap

The canonical inspection data model (`Observation`, `InspectionFinding` — see entity trace in `REPORT_ARCHITECTURE.md`) has **no photo/attachment entity at all**. Confirmed by direct entity-file read (`backend/src/inspection/entities/observation.entity.ts`, `inspection-finding.entity.ts`) and by grep across `backend/src/inspection` and `backend/src/storage` for any photo-linking entity — none exists for the canonical flow. Photo capture/evidence exists only in the **legacy** flow's client-side data model (`finding.photos`, consumed by `localExporter.ts`).

## What this means for the report

The redesigned canonical renderer (`canonical-report-pdf-renderer.ts`) has no photo-rendering code, and correctly never attempts to draw a photo section for any of Reports A/B/C — confirmed by visual inspection of all three PDFs (no empty photo placeholders, no broken-image boxes, no "0 photos" clutter). This is the correct, honest behavior per this phase's own "prefer omitting meaningless empty sections" instruction (Phase 23) — not a defect, but it does mean the full photo test matrix (no/one/multiple/portrait/landscape/large-source-image) could not be exercised against the canonical path, since it has nothing to test.

## Legacy path (has photo data) — narrow, targeted fix applied

`frontend-next/lib/localExporter.ts`'s pre-existing photo rendering used a fixed 80×60mm box and `doc.addImage(base64, 'JPEG', x, y, 80, 60)` unconditionally — stretching every photo to that exact box regardless of its real aspect ratio (a portrait photo would be squashed wide; a landscape photo would be squashed tall). This phase added aspect-ratio-preserving placement: the photo's natural dimensions are read before placement, scaled to fit within the same 80×60mm bounding box without distortion, and centered within it. See `REPORT_P2_IMPLEMENTATION_REPORT.md` for the exact diff. This was verified by unit-level reasoning against the fix (compute-and-clamp scale factor, standard `min(boxW/imgW, boxH/imgH)` fit logic) rather than a live multi-photo PDF export, since doing so would require driving the **legacy** flow's full capture UI, which was judged lower priority than the canonical path given this phase's time budget — reported honestly as a partial rather than claimed as fully live-verified.

## Recommendation

Photo evidence capture for the canonical inspection flow is a genuine, pre-existing product gap (not something this phase's report-redesign scope introduced or was asked to close) and should be scoped as its own future phase if photo evidence is intended to reach the canonical report.
