# Authorization and stale-write results

- Two reads of the same observation were taken.
- First update with the current version: HTTP 200.
- Stale second update: HTTP 409, `Observation was modified by another request.`
- Foreign observation update: HTTP 404.
- Foreign reanalysis snapshot request: HTTP 404.

No cross-owner existence disclosure or mutation occurred.
