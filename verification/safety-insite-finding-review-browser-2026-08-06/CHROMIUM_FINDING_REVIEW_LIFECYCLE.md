# Chromium finding-scoped lifecycle

Real Chromium used the production Next build at `http://127.0.0.1:3301` and Nest backend at `http://127.0.0.1:4232`, with `DEV_AUTH_BYPASS=false`.

Canonical inspection: `1805f2d5-491b-4e8c-ab52-a07d1abaa68b`; observation `c176a20a-1659-4531-97c8-af921ab58e11`; analysis `8141877b-d45c-4aed-bc69-db9aa9d63b12`, request version 1.

- Normal login: HTTP 201, `/command-center`.
- Supported PNG upload: HTTP 201, evidence object `8af5680a…`.
- Analysis: HTTP 201; two persisted cards: electrical (`e6e0067d-e2f1-4e95-8328-0846e68eae92`) and fall protection (`cd87c150-60b6-402f-92ed-d7688d2a7ff3`).
- First finding only: review and finding-finalize requests returned HTTP 201; UI status said one current finding remained unreviewed.
- Finalization with sibling unreviewed: HTTP 400; UI exposed `Every current finding requires a completed human review before finalization.` in the live status region.
- Second finding: independently reviewed and finalized; repeated transition bug was fixed so the UI no longer attempts `in_review -> in_review`.
- Reload: both findings showed `finalized`, each with its own review ID.
- Downstream: two corrective-action HTTP 201 responses, two task HTTP 201 responses, finalization HTTP 201, report HTTP 201.
- Final inspection: `completed`, version 3. Reports page reload showed report version 1.

Screenshots are in `screenshots/`. A production hydration warning (`Minified React error #418`) was observed during navigation; it did not prevent the workflow but remains a separate frontend quality issue.
