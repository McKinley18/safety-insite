# Performance (disposable DB, fixed backend, 20-request classify / 30-request lookup samples)

## `POST /safescope-v2/classify`

Measured against the machine-guarding case (`osha-gi-operating-unguarded-shaft`), 20 sequential requests:

- p50: 151ms
- p95: 222ms
- min/max: 147ms / 222ms
- Response size: ~69.7KB (HTTP 201)

`standardDecisions` entries in the response carry citation/title/status metadata but **`standardText` is empty** (`len: 0`) for every entry — confirming the fix does not attach full regulatory text to classify responses. The response has no `regulatorySection`/`regulatoryParagraph`/full-corpus keys anywhere in its 102 top-level fields.

## `GET /regulatory/section?citation=`

Measured across 3 representative citations (exact paragraph, whole section, MSHA), 30 sequential requests round-robin:

- p50: 6ms
- p95: 8ms
- min/max: 6ms / 10ms

## Conclusion

Standards text remains strictly on-demand (separate low-latency endpoint, ~6-8ms), and the classify path itself is fast (~150-220ms) with no material size/latency regression attributable to the citation-resolution fix — the fix changes which existing fields get populated (`standardDecisions`), not how much data moves per request. No full regulatory corpus is attached to classify responses.
