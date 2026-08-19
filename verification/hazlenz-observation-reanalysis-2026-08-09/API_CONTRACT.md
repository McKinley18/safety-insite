# Observation update contract

`PATCH /inspections/observations/:id`

Request: `{ "rawText": string, "version": integer }`.

The service resolves the observation and parent inspection from the route, enforces existing ownership/organization access, rejects stale versions with HTTP 409, increments the observation version, and emits `observation_updated`. Foreign resources return HTTP 404. Prior analyses/findings/reviews/reports remain untouched.
