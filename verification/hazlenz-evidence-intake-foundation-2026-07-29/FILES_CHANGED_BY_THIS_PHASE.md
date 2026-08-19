# Files changed by this phase

## Production

- `backend/src/safescope-v2/evidence/evidence-foundation.ts` — canonical fact provenance, contradiction, predicate, clarification, safe-state, confidence, and offline-bundle foundation.
- `backend/src/safescope-v2/dto/classify.dto.ts` — accepts a backward-compatible structured evidence snapshot.
- `backend/src/safescope-v2/safescope-v2.controller.ts` — applies the evidence foundation in the production classification path before display sanitization.
- `backend/package.json` — adds the focused evidence-foundation test command.
- `frontend-next/lib/canonicalWorkflowApi.ts` — structured analysis request/response types and private evidence upload.
- `frontend-next/app/inspection-workspace/page.tsx` — quick intake, targeted clarification, understood-facts review, corrections, and re-analysis.

## Tests and verification

- `backend/scripts/test-evidence-foundation.ts`
- `frontend-next/scripts/check-evidence-foundation-release.mjs`
- all files in this verification directory.

No protected HazLenz file changed during this phase. Other dirty files listed by Git predate this phase and were preserved.
