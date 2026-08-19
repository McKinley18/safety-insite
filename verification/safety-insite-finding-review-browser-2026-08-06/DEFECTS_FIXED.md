# Defects fixed

## Observation-level review was applied to all findings

Symptom: the workspace displayed persisted findings but `acceptReview` looped over every finding, so one user action implicitly reviewed siblings.

Fix: `frontend-next/app/inspection-workspace/page.tsx` now tracks `selectedFindingId`, renders finding-specific review controls, submits one review/finalization per selected finding, refreshes server state, and leaves remaining findings visibly unreviewed.

Verification: Chromium reviewed electrical only, then finalization returned HTTP 400 while fall remained unreviewed.

## Repeated review attempted an invalid status transition

Symptom: reviewing a second finding called `in_review -> in_review`; backend correctly returned HTTP 400.

Fix: the workspace transitions to `in_review` only when the inspection is still `draft`.

Verification: second finding review completed with HTTP 201 after the fix.

## Reloaded action step was disabled

Symptom: after all findings were reviewed, reload left `permanentCorrection` empty and disabled report completion.

Fix: restore risk and corrective-action proposal state from the persisted current analysis snapshot during workspace hydration.

Verification: reloaded workspace enabled completion; two actions, two tasks, finalization, and report generation succeeded.
