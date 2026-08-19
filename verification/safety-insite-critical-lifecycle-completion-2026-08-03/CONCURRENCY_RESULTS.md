# Browser concurrency results

Two independent Chromium contexts authenticated normally. Against the same persisted observation:

- Context A stale request at requestVersion 2 received HTTP 409: `A newer analysis request already exists.`
- Duplicate requestVersion 4 with the same idempotency key returned HTTP 201 then HTTP 201 replay.
- Replay returned the same durable analysis ID and did not create a second row.
- Database versions were monotonic 1, 2, 3, 4 with exactly one current row.

The stale operation was exercised through browser-context fetch using tokens created by normal UI login. The canonical workspace now has a focused stale-state alert and refresh control; full visual stale recovery still requires a canonical workspace fixture.
