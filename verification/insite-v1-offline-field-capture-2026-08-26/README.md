# InSite v1.0 — Durable Offline Field Capture (2026-08-26)

Evidence for blueprint §80. **Nothing was committed, pushed or deployed. `LIVE_PAYMENT_PROOF`
stays `FALSE`.** Baseline `HEAD` = `5894507b9a8e5276c9844eb9cc5f64b4da943ba8`; production still
`1da529a0e9f78abd5cbbbc156a99016207695ef0`.

## What is in here

| File | What it is |
|---|---|
| `offline-browser-matrix.json` | The A–L behaviour matrix, measured in a real Chromium profile against a disposable stack. **65 assertions, 0 failures.** |
| `offline-contract-check.txt` | The server-free contract verifier that binds shipped source to the offline invariants. **68 assertions, 0 failures.** |
| `mobile-audit-390.json` | Phone-width sweep including `/field-capture`. `HORIZONTAL_PAGE_OVERFLOW = 0`. |
| `REPRODUCTION_COMMANDS.md` | How to bring the stack up and re-run everything. |

## Two tiers, on purpose

`verify:offline-field-capture` proves the **behaviour** on one build against one stack: the service
worker really caches the shell, IndexedDB really survives an application restart, one account
really cannot see another's on-device drafts, and a retried sync really does not duplicate.

`check:offline-field-capture` proves the **invariants that produced that behaviour** are still in
the source, with no server, database or browser. It exists because a behaviour measurement cannot
stop the next edit from removing the property it measured. It is the one that belongs in every
regression run.

## The two defects this phase found and fixed

**A non-idempotent create was being auto-retried.** `apiFetch` retries once when a request *throws*
(timeout or lost connection). `POST /inspections` and `POST /inspections/:id/observations` carry no
client-supplied idempotency key, so a server that commits the row and then loses the response gets
a second row from the automatic retry. Measured directly: one interrupted sync produced **two**
server inspections from one user action, before any client code could observe the failure. Fixed by
marking those creates (and site creation, and evidence upload) `NON_IDEMPOTENT` — `retries: 0`.
This was a latent defect on the ONLINE path too, not something offline capture introduced.

**A cached Next.js route is not an offline fallback.** Serving an `/offline` App Router page as the
service worker's navigation fallback looked correct and was not: the cached document hydrates, the
App Router then reconciles against the *current* URL, and the offline message was replaced in the
browser by that URL's client render (or by Next's 404). Replaced with `public/offline.html`, a
plain static document with no hydration and no external asset references.

## One harness correction worth recording

`context.setOffline(true)` alone was not enough to prove "reopens with no network". It severs
page-originated requests reliably, but after a persistent context is closed and reopened the
**service-worker target does not pick the emulation up**, so the worker's own `fetch()` still
reached the server. With `setOffline()` alone, a reopened session's navigation to an unknown path
returned the live Next.js 404 *from the server* — an assertion that would have passed without the
network ever being down. The suite now aborts at the route layer as well, which does cover
service-worker requests, and it asserts the offline fallback as its own check that the emulation is
in force.
