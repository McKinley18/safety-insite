# Persistent session

Backend session `68847` remained available on port 4245 after PostgreSQL readiness was established. `/health` returned 200 before the focused response, the 40-case head/tail batches, and the opaque holdout. HTTP 429 events were handled by bounded serial retry/backoff; no production throttling was changed.
