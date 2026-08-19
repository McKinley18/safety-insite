# Chromium lifecycle results

All three scenarios used real authenticated Chromium and the canonical workspace. Each analysis returned HTTP 201 and the UI rendered three persisted finding cards with distinct IDs, hazard keys, and the same analysis ID. Each finding was selected and reviewed separately. The partial-review attempt returned `Every current finding requires a completed human review before finalization.` while the inspection remained `in_review`; after all findings were reviewed the UI created action/task records, transitioned to `completed`, and displayed an immutable report version 1.

The raw browser evidence is in `FULL_LIFECYCLE_PROBE.json`, `FINISH_ONE.json`, `PARTIAL_RESULT.json`, and the three scenario screenshots.
