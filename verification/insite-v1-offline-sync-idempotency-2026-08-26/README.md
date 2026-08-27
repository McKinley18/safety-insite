# InSite v1.0 — Offline Sync Idempotency Hardening (2026-08-26)

Evidence for blueprint §81. Baseline `HEAD` = `5894507b9a8e5276c9844eb9cc5f64b4da943ba8`.

## What changed, and why the previous mechanism was not good enough

§80 shipped offline field capture with client-side *claim-and-reconcile* duplicate prevention: a
`syncAttempt` marker written before a create, and, on retry, a search for the record that attempt
might already have made — matched on **title + site + timestamp**.

That is a similarity judgement, not identity. Two consequences, neither acceptable as the
production contract:

* Two legitimate inspections created minutes apart at the same site with the same title are
  indistinguishable to it. It handled that by **refusing to act whenever more than one candidate
  matched**, which means recovery deadlocks exactly when a crew works a site repeatedly.
* Even a single match is a guess. Nothing prevented it adopting a record the interrupted attempt
  did not create.

The replacement: the **client mints a stable opaque `clientRequestId`**, persists it with the local
record, and replays it unchanged on every attempt. The **database** — three partial unique indexes
added by migration `1800000015000` — is the authority that one identifier means one row.

## Scoping: per creating user, never per organisation

Authorised organisation sharing governs who may **read** an inspection. It does not govern **whose
write a request is**. Every index and every lookup is keyed on `createdByUserId`, so one member of
an organisation can never resolve or adopt a colleague's record by presenting their identifier.
That is deliberately stricter than the read model.

## Files here

| File | What it is |
|---|---|
| `server-idempotency-contract.txt` | The HTTP-level contract against a disposable stack. **23 assertions, 0 failures**, including ten concurrent replays of one identifier and eight of an observation identifier. |
| `offline-browser-matrix.json` | The end-to-end matrix in a real persistent Chromium profile. **81 assertions, 0 failures**, including lost-response interruption for inspection, observation and evidence, and a retry after a full application restart. |
| `offline-contract-check.txt` | The server-free verifier binding shipped source — **both packages** — to the contract. **98 assertions, 0 failures**. |
| `hazlenz-core-regression.txt` | Level-1 HazLenz. **28 of 30 suites pass**; the two failures are exactly the documented §13.1 pair and no third appears. |

## The three cases that decide whether this is real

**A lost response must not duplicate.** The browser suite lets the request reach the server and
then destroys the response, so the client learns nothing. Proven for the inspection create, the
observation create and the evidence upload independently: in each case the server row exists after
the interruption, and after the retry there is still **exactly one**.

**A different identifier must always create a distinct row.** Same title, same site, same second,
different identifier → two inspections. Identical observation text, different identifier → two
observations. Identical photo bytes, different identifier → two evidence objects. Content
similarity is never allowed to collapse two genuine records.

**One user's identifier must never resolve another's row.** `USER_B` replaying `USER_A`'s
identifier receives a **new** inspection of their own, never `USER_A`'s, and still cannot read,
append to, or upload evidence against `USER_A`'s inspection.

## Concurrency

A check-then-insert is not a lock: two concurrent replays both miss the check and both insert, and
the partial unique index rejects the loser. That rejection is the **correct** idempotent outcome,
so the loser re-reads and returns the winner. Ten concurrent replays of one inspection identifier
resolve to one row with no error surfaced; eight concurrent observation replays likewise.

## Backward compatibility

Every column is nullable and every index is `WHERE "clientRequestId" IS NOT NULL`. A create that
sends no identifier is unconstrained and behaves exactly as before — which is the whole online
path, and every row that predates the migration. Asserted directly: two identifier-less creates
produce two independent inspections, and an identifier-less evidence upload still works.
