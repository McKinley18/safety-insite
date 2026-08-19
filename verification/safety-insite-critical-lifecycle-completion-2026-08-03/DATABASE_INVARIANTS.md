# Database invariants

Observation `9243432e-d24b-495c-9acf-5ec203b091bf` after concurrency proof:

| requestVersion | status | idempotency |
|---:|---|---|
| 1 | superseded | phase4-analysis… |
| 2 | superseded | concurrent-v2… |
| 3 | superseded | concurrent-v3… |
| 4 | current | browser-duplicate-fixed-key |

Exactly one current analysis exists; versions are monotonic; duplicate replay reused the same analysis ID. The canonical integration run separately proved 1 inspection, 1 observation, 3 analyses, 2 findings, 1 task, and 1 current analysis.
