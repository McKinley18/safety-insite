# Finding review results

Fresh API regression passed: inspection `9a22b940-759d-4957-94c7-de99d7117a1f` created two finding IDs and two distinct review IDs. Replaying each idempotency key returned the original review. Reviews did not implicitly finalize findings; explicit finding finalization followed by transition completed successfully. Review writes are server-scoped to observation, inspection, finding, and authenticated user.

The browser workspace now submits a separate review and idempotency key per durable finding. Full Chromium proof of the new per-finding UI remains incomplete.
