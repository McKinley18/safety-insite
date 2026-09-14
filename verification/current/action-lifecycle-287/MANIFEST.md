# §287 — Corrective action lifecycle closure before the Pre-Production Register

**Zero provider calls** — `EXPERT_EXECUTION_ENABLED=false`, `ANTHROPIC_API_KEY` deleted from the
child environment.
**Zero production contact of any kind.** No deployment, no production migration, no live read or
write. The one migration §287 adds was applied ONLY to the disposable review database.

| | |
|---|---|
| HEAD reviewed | `0f36d49729c914c0c50a7e9118f3663877d057ef` |
| frozen validated PRODUCT baseline | `709ee151b932095020ea69d25daa04a337ccba16` — unchanged, not promoted |
| §274 successor identity | `8c163b312b291ef3b7ec361df371b86afdd92d15ae87ad71c2e06462942c4aee` — re-verified, 22 elements, 0 failures |
| protected modules | 29/29 present, 0 accepted-evidence drift |
| disposable database | `test_insite_review_1789397266505_9528`, run `387d07b9-…` |
| entitled accounts | `review-287-pro@example.test`, `review-287-other@example.test` — billing tier `free`, active Pro grant |
| Free account | `review-287-free@example.test` |
| frontend | production `next build` + `next start`, `DEV_AUTH_BYPASS=false`, `NEXT_PUBLIC_DEV_FORCE_PRO=false` |

---

## A. D-050 — the lifecycle now has a customer surface

§286 measured that `GET /actions`, `PATCH /actions/:id/status` and `GET /actions/export` were
implemented, authorized and working; that `lib/cloudActions.ts` implemented the client for them;
and that **no route imported it**. An action could be raised and never closed.

**Surface chosen: `/safety-calendar`** — an existing ACTIVE Actions/Calendar surface, per direction,
rather than a new route. It is already the product's due-work surface, and the person who needs to
close an action is the person looking at what is due.

It reads `GET /actions` rather than the calendar projection, deliberately: the projection is DATED
and excludes an action with no due date, so a management surface built on it would hide exactly the
actions nobody is tracking.

**No second corrective-action system.** Every read and write goes through the existing
`lib/cloudActions.ts` to the existing routes. There is no local action store and no optimistic
cache; after every mutation the list is re-read, so the screen shows what the server last said.

| D-050 requirement | result |
|---|---|
| view open corrective actions | **PASS** — open/in-progress by default, closed behind a toggle |
| identify action status | **PASS** — stated as a word, never by colour alone |
| identify assigned user | **PASS** — `assignedToName`, or "Unassigned" |
| see due date | **PASS** |
| see overdue state | **PASS** — derived against the local day, never stored |
| update allowed fields | **PASS** — due date, priority, responsible person |
| close an action | **PASS** |
| see completed/closed state | **PASS** |
| understand an error without duplicate mutation | **PASS** — U6–U9, F1–F4 |
| refresh/restart → authoritative persisted state | **PASS** — E6, E7, U10 |

---

## B. D-051 — due-date editing

There was no route that edited a corrective action at all. `PATCH /actions/:id` adds one, covering
title, description, priority, due date and responsible person. **Status is deliberately excluded** —
it moves through `/status`, which carries the closure semantics; two ways to close would mean only
one of them records the closure correctly.

| requirement | result |
|---|---|
| persisted action reflects the change | **PASS** (E1) |
| calendar event moves accordingly | **PASS** (E3) — `2026-09-13 → 2026-09-21` |
| overdue calculation updates | **PASS** (E5) |
| refresh shows the persisted date | **PASS** (E6) |
| restart shows the persisted date | **PASS** (E7) — read straight from disk, bypassing the API |
| no duplicate calendar event | **PASS** (E4) — exactly one event, old day clear |

**Date-only semantics re-proven on the NEW code path.** §286 proved the create path; the edit path
is new and is where §275 could return. Eight boundaries, each asserted on the calendar *and* on
disk: ordinary, month end, month start, year end, year start, DST spring-forward, DST fall-back,
leap day. All held. `backend: test:calendar-date-boundary` also re-run and passing.

---

## C. D-052 — closure vs verification

### The semantics §287 inherited

Closing stamped `verifiedAt = now` and `verifiedByUserId = the caller`, and fed the outcome loop
`verificationStatus: 'VERIFIED_STRONG'`, `verificationMethod: 'SUPERVISOR_SIGNOFF'` —
unconditionally, for any caller who could reach the route, including the person who raised the
action.

**The cause was a missing model, not a careless write.** `corrective_actions` has carried the
VERIFICATION pair since the initial migration and had **nowhere to record who closed an action and
when**. Closure had one pair of columns available to it and they were the wrong pair.

### The semantics after §287

`closedAt` / `closedByUserId` added — the completion axis, which had no representation. Closing
writes those and **does not touch the verification pair**.

The lifecycle state is **DERIVED, not stored**, from two axes the authoritative model already has:

| statusCode | verifiedAt | lifecycle state |
|---|---|---|
| open / in_progress | — | `open` / `in_progress` |
| closed | not set | **`completed`** |
| closed | set | `verified` |
| cancelled | — | `cancelled` |

No third column, so nothing can be in a state its `statusCode` contradicts. `completed` is the
direction's VERIFICATION_PENDING under the name the product already uses; it is deliberately not
called "awaiting verification", because that asserts a verification is expected and whether
verification is required at all is the open product-policy question §287 registers rather than
settles.

| proof | result |
|---|---|
| closing yields `completed`, not `verified` | **PASS** (C2) |
| `verifiedAt` / `verifiedByUserId` untouched | **PASS** (C3) |
| **no fabricated `VERIFIED_STRONG`** anywhere in the record | **PASS** (C7) |
| **no fabricated `SUPERVISOR_SIGNOFF`** anywhere in the record | **PASS** (C8) |
| falsification ran over a real closed record (982 chars), not an empty object | **PASS** (C7-GUARD) |
| persisted state on disk carries no verification | **PASS** (C6) |
| neither string appears anywhere on the customer surface | **PASS** (U5b) |
| completion IS recorded — who and when | **PASS** (C5) |
| reopening clears the completion stamp, keeps the notes | **PASS** (C14, C15) |

`VERIFIED` is reachable in the model and **no customer path sets it**, so the product never claims
a verification it did not perform.

### Closure evidence

Optional, and it infers nothing in either direction.

- Supplied notes are preserved verbatim (C9) and **do not** promote the action to verified (C10).
- A close with no notes is accepted (C11), and **nothing is substituted** for what the user did not
  write (C12) — the client previously sent `"Closed from Safety InSite corrective action tracker."`
  on every close, into the field that records what was actually done about the hazard.
- Absence produces neither a weaker nor a stronger state than presence (C13).
- The close form says, **before the press**, that closing does not record an independent
  verification or a supervisor sign-off.

---

## D. D-053 — create idempotency *(repaired, narrowly)*

`clientRequestId` added to `POST /actions` with a **partial unique index** on
`(tenantId, ownerUserId, clientRequestId) WHERE clientRequestId IS NOT NULL` — the same shape
`POST /inspections` and `POST .../observations` have always had. No architecture expansion.

| failure mode | measured |
|---|---|
| no key supplied (baseline) | two submits → **two actions** — the repair is opt-in, and that is stated |
| double-submit | **one action**; one row in the database (I1, I1b) |
| concurrent submits | both succeed, **one action**; the index caught the race the read cannot (I2, I2b) |
| retry after a lost response | **one action** (I3) |

**Repeated-tap protection is not the mechanism.** The panel disables its controls and additionally
refuses a second invocation inside the handler — a disabled button is a rendering that can be
raced. Neither survives a lost response. The guarantee is the index. Browser-side: three fast taps
on Confirm close issued **exactly one** mutation (U4).

---

## E. D-054 — committed mutation regression *(retained and strengthened)*

**Forced, not observed.** The audit table is renamed out from under the running server on the
disposable database, a real close is performed, and the customer's answer is measured.

| assertion | result |
|---|---|
| the customer receives SUCCESS though the audit write could not persist | **PASS** (A1) |
| the state really did commit — the customer was told the truth | **PASS** (A2) |
| the STATUS audit row genuinely did not persist | **PASS** (A3-GUARD) |
| the missing audit row is EMITTED, not swallowed | **PASS** (A5) |
| the event names the actor, the transition and that state committed | **PASS** (A6) |
| audit rows persist again once the table is restored | **PASS** (A7) |

Three auxiliary writes follow a committed action transition: the outcome loop (closed at §286), the
audit row and the assignee notification (both closed at §287). None can fail the request; each
emits an operational event. `action.audit_write_failed` is severity **error** — the customer's
operation succeeded, so it is not a failure of the request, it is a failure of the record, which on
a compliance product is the more serious of the two.

The outcome loop is **still failing on every close** in this environment because `outcomes` has no
migration, which makes this a live demonstration rather than a hypothetical.

---

## F. Authority and workspace isolation — reverified across the NEW route

| assertion | result |
|---|---|
| another account cannot SEE the action | **PASS** (W1) |
| another account cannot EDIT it (new route) | **PASS** (W2) — 404, not 403 |
| another account cannot CLOSE it | **PASS** (W3) |
| neither refused write changed anything | **PASS** (W4) |
| unauthenticated caller refused by the guard, not the network | **PASS** (W5) — 401 |
| a FREE account still cannot CREATE | **PASS** (W6) — 402 `PAID_SUBSCRIPTION_REQUIRED` |
| a FREE account may still read and manage what it has | **PASS** (W7) |

The mutation authorization rule was **factored, not copied**, out of `updateStatus` into
`accessibleForMutation`, so the two mutators cannot drift. It is unchanged and deliberately not
broadened: no Company-plan functionality was expanded.

The new edit route carries **no entitlement guard**, consistently with the rest of the controller —
only CREATE is gated. Gating closure would strand open compliance work behind a paywall after a
downgrade.

---

## G. UX / field review — 8 visits, 2 themes × 4 widths, plus 18 behavioural probes

**ZERO objective findings.** Two `BELOW_NATIVE_TOUCH_GUIDELINE_44` observations, **at 390 only**.

The panel requests `min-h-11` (44px) on every control. On a phone it resolves to **40px**, because
`globals.css` carries a deliberate shared rule —
`.sentinel-mobile-page button, a, label { min-height: 40px }` — whose descendant selector outranks
a utility class. 40px clears the product's own 36px floor (§73.3) and sits under the 44px iOS HIG /
WCAG 2.5.5 (AAA) guideline: exactly the App-Format item §286 registered. At 768/1280/1440 the
controls reach 44px.

**It was not overridden.** The single lever is that shared rule; changing it moves every button on
every mobile surface, and §287's direction forbids broad redesign. Overriding it for this panel
alone would make these the only 44px buttons on a phone — an inconsistency introduced without
design authority. **Registered for the App-Format gate.**

| probe | result |
|---|---|
| due-date control is a real date input, usable on a phone | **PASS** (U1) |
| saving issues exactly ONE mutation | **PASS** (U2) |
| repeated taps on Confirm close → ONE mutation | **PASS** (U4) |
| a closed action reads COMPLETED and never claims verification | **PASS** (U5, U5b) |
| a failed save shows the error rather than failing silently | **PASS** (U6) |
| the form stays open with what the user typed still in it | **PASS** (U7) |
| the failed save was ONE request — nothing silently retried | **PASS** (U8) |
| retry succeeds without retyping and clears the error | **PASS** (U9) |
| a full reload shows the SERVER's state | **PASS** (U10) |

Accessibility: keyboard traversal reached every focusable control in the panel with a visible focus
change on each; all controls named; all fields labelled; no contrast failure; status stated in words
rather than by colour alone; no raw uuid and no developer vocabulary on the surface.

---

## H. Offline / D-042 — measured, nothing built

WARM case throughout (the surface was already open when the connection went), which is the case an
inspector is actually in.

| operation | OFFLINE | DATA_LOSS_RISK |
|---|---|---|
| create | REQUIRES_NETWORK | **VULNERABLE** |
| edit due date | REQUIRES_NETWORK | RECOVERABLE_IN_SESSION |
| close | REQUIRES_NETWORK | RECOVERABLE_IN_SESSION |
| retry | PARTIAL | NONE_KNOWN |
| reconnect | PARTIAL | NONE_KNOWN |

Measured, not inferred: an offline edit and an offline close both **fail honestly, keep what the
user typed in an open form, and never claim to have queued anything** (F1–F3); one deliberate retry
after reconnect completes the close without retyping (F4); and the server ends with **exactly one**
closure for it, still claiming no verification (F5, F6).

`RECOVERABLE_IN_SESSION` rather than `RECOVERABLE`: the work survives the error but not leaving the
page. There is no outbox, and building one is D-042.

**What D-042 must still solve.** CREATE is now safely replayable (`clientRequestId` + the index) and
is the one operation an outbox could queue today — that precondition did not exist before §287.
EDIT and CLOSE carry no idempotency key; they are idempotent in *effect* because they set a target
state rather than appending, so a replay converges, but a queued edit can still overwrite a newer
change made elsewhere, and that conflict rule is a D-042 decision.

---

## I. A §286 gate now encodes a superseded contract — NOT edited

`validate-286-actions-calendar.mts` returns **6 failures out of 79**, and every one is an assertion
§287 was authorized to invert:

| check | asserted | §287 |
|---|---|---|
| A1 | action LIST is NOT reachable | D-050 made it reachable |
| A2 | action STATUS CHANGE is NOT reachable | D-050 made it reachable |
| A3 | `lib/cloudActions.ts` is imported by NOTHING | D-050 imports it |
| B7 | there is NO general update route | D-051 added one |
| B9 | closure stamps `verifiedAt` / `verifiedByUserId` | D-052 rejects that fabrication |
| B12 | reopening retains the verification stamp | D-052 never sets one |

The other **73 checks pass**, including every calendar-authority, date-boundary, isolation and
offline-classification assertion — so this is a superseded contract, not a regression.

**The §286 gate was NOT edited and was not re-run and reported as a pass.** It is frozen evidence of
what the contract was, and rewriting it would destroy that record and convert an authorized product
change into a silently passing test. The successor is `validate:287-action-lifecycle`.

`validate-286-reports-and-severity.mts` re-run: **63/63 pass, 0 failures** — no regression there.

---

## J. Gates executed

| gate | result |
|---|---|
| `validate:287-action-lifecycle` (new) | **PASS — 64 checks, 0 failures, 10 observations** |
| `review:287-action-lifecycle-ux` (new) | **8 visits, 0 objective; 18 probes, 0 failed** |
| `validate:286-reports-and-severity` | **PASS — 63/63** |
| `validate:286-actions-calendar` | 73/79 — 6 **superseded by authorized change** (section I) |
| `measure:281-route-reachability` | **20 routes, 0 orphans** — routing unchanged |
| `validate:279-update-delivery` · `validate:280-workspace-draft-persistence` · `validate:281-offline-data-state` | **PASS** |
| `test:calendar-reconciliation` | **PASS** |
| `check:page-titles` · `check:orange-semantics` · `check:expert-authority-boundary` | **PASS** |
| `check:effective-severity-parity` · `check:risk-band-parity` | **PASS** |
| `test:expert-presentation` · `test:expert-api-failure-mapping` · `test:expert-entitlement-presentation` | **PASS** |
| `frontend-next: npx tsc --noEmit` · `npm run build` | **PASS** |
| `backend: npm run build` | **PASS** |
| `backend: test:calendar-date-boundary` | **PASS** |
| `backend: test:284-entitlement-denial-audit` | **PASS** |
| `backend: verify:274-successor-identity` | **PASS** — 22 elements, 0 failures |
| `backend: hazlenz:verify` | **PASS** — 29/29 protected modules, 0 accepted-evidence drift |
| `backend: brand:audit` | **PASS** |

---

## K. Instrument defects found and repaired

- **I-22. The D-054 guard counted every audit row for the action**, found the `ACTION_CREATED` row
  written before the table was renamed, and failed — which would have read as "the audit write
  succeeded after all". It now names the `ACTION_STATUS_UPDATED` row whose absence is the point,
  and separately reports the pre-existing row so the reader can see why one is there.
- **I-23. The UX instrument signed in once per browser context** — nine times — and `POST
  /auth/login` is throttled to five attempts a minute. The run died on the second context with a
  navigation timeout that looked like a product failure and was the product's brute-force
  protection working correctly. It now signs in once and reuses the storage state.
- **I-24. The offline probe matched server rows on a CONSTANT marker string**, so a second run
  against the same database counted rows from the first and reported a duplicate close that never
  happened. The marker is now unique per run.

---

## L. Not remediated, by direction

- **Cross-tenant recurrence migration — NOT ACTIVATED.** Verified: `to_regclass('public.outcomes')`
  is NULL and **zero** migrations reference `outcomes`. §287 changed only the VALUES passed to the
  loop (from fabricated `VERIFIED_STRONG`/`SUPERVISOR_SIGNOFF` to the truthful `UNVERIFIED`); it did
  not create the table. Registered for Pre-Production Security / Data-Isolation review.
- **D-055 / D-056** — definitions, consequences and recommended classifications are in the section
  report; neither was remediated. Verified still present: 9 unowned `hazlenz_finding_scoped` rows in
  the review database.
