# §303 — SE-5 malformed identifier containment

## What SE-5 was

An authenticated `GET /files/<malformed>` carried the path parameter straight into a TypeORM
lookup. Postgres was asked to compare a non-UUID string against a `uuid` column, rejected it with
`invalid input syntax for type uuid`, and the unhandled driver error surfaced as HTTP 500. §297A
found it with a single authorised production probe; §297B reproduced it five more times to exercise
the monitoring threshold and deliberately left it unrepaired while it was serving as the instrument.

## The first act of §303 was to measure the family, not to patch the reported route

§303 forbids special-casing `GET /files/:id`. So the suite enumerates **24 GET routes** that carry an
identifier path parameter and drives **7 malformed shapes** at each — 168 probes — against a live
authenticated application on a disposable database.

The malformed shapes are chosen to be different kinds of wrong, not seven spellings of one kind:
`not-a-uuid`; `1' OR '1'='1` (SQL metacharacters); a UUID one character short; a UUID with a non-hex
character; a 5000-character string; a percent-encoded traversal `%2e%2e%2fnot-a-uuid`; and a single
space.

**Result: 8 routes across 4 controllers returned 500.** Not one. The §297A remediation note predicted
this ("the same pattern is likely") and it was right.

| controller | routes affected |
|---|---|
| `storage/files.controller.ts` | `GET /files/:id` — the originally reported route |
| `reports/canonical-reports.controller.ts` | `/inspection-reports/:id`, `/:id/download`, `/:id/revisions` |
| `inspection/inspection.controller.ts` | `/inspections/:id`, `/:id/completion-readiness`, `/:id/report` |
| `sites/sites.controller.ts` | `/sites/:id` |

## The repair is an input boundary, not an error handler

`backend/src/common/uuid-route-param.ts` is the single shared primitive — one stateless
`ParseUUIDPipe` instance wrapping the framework's own UUID syntax rule, with a product-owned message
that names no SQL, no driver, no schema, and does not echo the caller's input. It is attached to the
**25 route parameters that are genuinely compared against a `uuid` column**.

Malformed syntax is refused **before any query is issued**. §303 names the alternative and forbids it,
for a reason worth restating: catching `QueryFailedError` and returning 400 would convert a dropped
table, an exhausted pool or a broken migration into a client error, and the product would stop
reporting its own outages.

## What the repair deliberately does not do — each one asserted

- **It is not applied to every `:id`.** A parameter is not a UUID because of its name.
  `/auth/verify-invite/:token` carries an opaque varchar token and the `:version` route keeps its
  `ParseIntPipe` contract. Both asserted.
- **It does not move the security boundary.** A pipe runs *after* guards, so an unauthenticated
  malformed request is still **401**, never 400 — an anonymous caller cannot use the shape of the
  refusal to distinguish a real route from a fabricated one. A well-formed cross-tenant id is still
  **404**. Both asserted.
- **It does not swallow genuine database failures.** The suite renames `storage_objects` out from
  under a live query and requires **500**. This is the assertion that stops the repair from
  degenerating into "all `QueryFailedError` = 400".
- **It invents no new client-facing failure.** Uppercase hexadecimal is valid UUID syntax and is
  accepted.
- **404 contracts are preserved.** A syntactically valid identifier naming nothing accessible still
  returns 404. The repair changes *when a query runs*, never what an existing answer means.

## The gate was watched to fail

`npm run test:303-malformed-identifier`, wired into `hazlenz:integration:inner` and therefore into
`hazlenz:precommit`.

| | assertions passed | failed |
|---|---|---|
| `01-PRE-REPAIR-MEASUREMENT.txt` | 26 | **13** |
| `02-POST-REPAIR-SUITE.txt` | **40** | 0 |

A gate nobody has watched fail is not evidence. This one was.

## SE-6 — found here, registered here, deliberately not repaired here

The assertion that the invite route was *not* swept up by the UUID repair exposed a different defect:
`GET /auth/verify-invite/:token` returns **500 for every token**, valid or not.

It is **pre-existing** — the same 500 appears in `01-PRE-REPAIR-MEASUREMENT.txt`, captured before a
line of §303 code was written.

Root cause was **proven, not inferred**, by a read-only probe on a disposable database:
`invitation."organizationId"` is `character varying` while `organization."id"` is `uuid`, so the join
TypeORM emits for `relations: ['organization']` fails with
`operator does not exist: uuid = character varying`. The same lookup *without* the relation join
succeeded. The token column is not the problem; the `ManyToOne` join is.

This is materially different from SE-5. SE-5 was an input-boundary defect — well-formed input worked.
SE-6 is a persistence-schema defect — **no input works at all**, and attaching a UUID pipe to `:token`
would be actively harmful, converting an unconditional 500 into an unconditional 400 and hiding a
wholly non-functional feature behind a client error. The fix is a migration, and no migration was
authorized in §303.

Per §303, it is registered rather than repaired. The suite asserts the route is **still 500** and
cites SE-6, so SE-5 closure cannot be misread as this route working.
