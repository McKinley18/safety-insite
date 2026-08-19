# API Payload Audit

## Measured facts
- A single `/safescope-v2/classify` call for the shortest corpus item ("Missing guard on rotating shaft." — 5 words) returned a **76,588-byte** response.
- Across the 10 successfully-measured corpus items, response sizes ranged from **55,316 to 86,246 bytes**, averaging **~59KB**, with no strong correlation between input text length and response size (the shortest input, 5 words, produced a larger response than several longer inputs) — this points to a largely **fixed per-request overhead** (static/boilerplate structure in every response) rather than payload size scaling primarily with content.
- Separately, saving a *single finding's* full review package to the backend ("Save to Cloud" in the legacy flow) exceeded Express's default **100KB** JSON body limit and failed outright with `PayloadTooLargeError` — meaning the persisted-package shape for even one finding is larger than the already-large 55-86KB classify response.

## Source-level explanation (ties directly to `SERVICE_EXECUTION_AUDIT.md`)
The classify response is built from the ~50-engine orchestrator's combined output. At least 4 identified services' outputs are computed, awaited, and (per the trace) **never read by any downstream consumer or the display layer** — `ObservationContextService`'s detected-entity fields, the full `EvidenceQuestionGenerationService` payload, the `HazardInformationAbsorptionService`/`FieldOutputComposerV1Service`/`LearningCandidateQueueService` trio, and most of the knowledge-retrieval payload (only a boolean flag from it is actually used). If these are being serialized into the HTTP response regardless of whether the frontend reads them, they are the most direct explanation available for a 55-86KB response to a 5-to-40-word input.

## Classification of candidate reductions

| Candidate | Classification | Rationale |
|---|---|---|
| Strip `HazardInformationAbsorptionService`/`FieldOutputComposerV1Service`/`LearningCandidateQueueService` output from the HTTP response (keep server-side use if any exists elsewhere) | **NEEDS_CONSUMER_TRACE** | Confirmed unread by `safescope-v2.service.ts` and the frontend in this pass, but a fuller check (e.g. background jobs, analytics pipelines) was out of scope |
| Strip `ObservationContextService`'s unread detected-entity fields (`detectedEquipment`/`detectedTasks`/`detectedUnsafeConditions`) from the response | **SAFE** — confirmed zero downstream readers in both backend and frontend trace | Only `rawObservation`/`normalizedText` from this service are read anywhere |
| Reduce the full knowledge-retrieval payload to just the boolean flag actually consumed | **NEEDS_CONSUMER_TRACE** | Same caveat as above — frontend doesn't use the rich payload in the paths exercised, but not exhaustively checked |
| Raise the Express JSON body limit as a workaround for the "Save to Cloud" failure | **NOT_WORTH_IT as a standalone fix** — it would resolve the immediate error but does not address why a single finding's package exceeds 100KB in the first place; treat as a symptom, not the fix |
| Any reduction touching output the frontend's "View AI Reasoning Trace" expandable section reads | **HIGH_REGRESSION_RISK** — that section is a deliberately-exposed advanced/expandable feature (see `FINDING_PRESENTATION_AUDIT.md`) and likely depends on some of this same intelligence output; do not blindly strip without confirming what backs that UI |

## Internal-only diagnostic fields exposed to the frontend
Raw `Finding ID`, `Analysis` UUIDs, and a `checksum` field are all present in frontend-consumed payloads and rendered directly to the user (see `COPY_TERMINOLOGY_AUDIT.md`) — these aren't a size problem, but they are exactly the kind of "internal-only diagnostic field exposed to frontend" the brief asks to flag, and were confirmed live rather than inferred.

## Bottom line
Payload bloat is real, measured, large relative to input size, and has a specific, plausible source (unconsumed service outputs identified in `SERVICE_EXECUTION_AUDIT.md`) — this is one of the clearer, more actionable efficiency findings in the whole audit, and it also has a direct production-reliability consequence (the "Save to Cloud" 500).
