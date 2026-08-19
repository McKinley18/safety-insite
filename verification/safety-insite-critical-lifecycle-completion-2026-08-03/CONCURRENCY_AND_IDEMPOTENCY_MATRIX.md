# Browser concurrency and idempotency

Two independently authenticated Chromium contexts loaded the same canonical observation and analysis version. Requests were issued from page contexts after normal UI login (tokens were read from the application’s own authenticated storage; no token was injected).

| Operation | First result | Stale/duplicate result | Durable invariant | Result |
|---|---|---|---|---|
| Reanalysis, stale request version | HTTP 201, version 3→4 | HTTP 409 `A newer analysis request already exists.` | No stale current row; one current analysis | PASS |
| Reanalysis, same idempotency key | HTTP 201 | HTTP 201 replay, same analysis ID | One row for key; no skipped version | PASS |
| New logical reanalysis | HTTP 201 | New key and next request version | Versions monotonic; one current | PASS |
| Risk/action/task/finalization/report browser duplicates | Not fully exercised in split-hazard UI | No authenticated split-hazard fixture available | Not proven | NOT TESTED |

The canonical workspace now catches stale-analysis messages and renders an accessible alert preserving the entered clarification with a “Refresh current analysis” action. The 409 response was proven at the browser-context API boundary; a complete visual stale-conflict replay in the canonical page remains outstanding because the page does not yet expose the split-analysis history workflow.
