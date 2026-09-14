# §281 — HazLenz presentation experience, and the active inspection architecture

Evidence for D-038 (retire the closed cycle), D-039 (the anchor cascade), D-040 (the HazLenz
information the product was withholding) and D-041 (the false offline zero).

**Zero provider calls.** The review stack runs with `EXPERT_EXECUTION_ENABLED=false` and
`ANTHROPIC_API_KEY` deleted from the child environment, so a provider call is not merely "not
made" — it is not possible. Every HazLenz state under review comes from a saved synthetic snapshot
or from the product refusing.

---

## How this was measured

A **production build** (`next build` + `next start`, `NEXT_PUBLIC_FRONTEND_VERSION=1.0.0`), driven
in Chromium through Playwright as a **real signed-in user with no development bypass**:
`DEV_AUTH_BYPASS=false`, the session comes from the login form. The database is a **registered
disposable one** created and dropped by run id under the §277 ownership rules; the original
development database is never migrated, seeded or written to.

The production build matters and is not a formality: `sw.js` does not register on a development
server, so any offline case measured there is measuring a browser with no application shell rather
than the product without a network. Both offline instruments REFUSE to run unless a service worker
is controlling the page.

| | |
|---|---|
| review stack | `backend/scripts/review/review-stack.ts` (`npm run review:stack`) |
| disposable database | `test_insite_review_1789351558699_7814`, run `41d6f490-68b5-4f22-9540-4a6da8cbf076` |
| account | `review-281@example.test`, registered through `POST /auth/register` — a **Free** account |
| provider calls | **0** |
| production contact | **none** |

---

## Files

| file | what it is |
|---|---|
| `D-038-CAPABILITY-AND-DEPENDENCY-PROOF.md` | The dependency proof, the capability comparison, and what 101 files removing the cycle actually took with it |
| `d038-deletion-set.txt` | Every file removed, as the strict "solely supporting" fixpoint computed it |
| `route-reachability.json` | The route inventory AFTER removal, classified by customer reachability |
| `route-reachability-before.json` | The same measurement BEFORE removal — 3 `LEGACY_ORPHAN` |
| `route-reachability-falsification.json` | The deliberate falsification: one inbound link reclassifies the whole cycle. Proves the zero-orphan result is not vacuous |
| `anchors-before-d039.json` | Computed colour, decoration, backdrop and contrast of every visible anchor on every active route, both themes, 390 and 1280 — **after** D-038, **before** D-039, so the diff isolates the cascade repair |
| `anchors-after-d039.json` | The same census after layering the anchor reset |
| `anchor-regression.json` | Every anchor whose appearance changed, with before/after colour, decoration and contrast |
| `batch-2H-measurements.json` | The eight HazLenz states × 2 themes × 4 widths, with the D-040 presentation readings |
| `screenshots/batch-2H/` | 64 full-page screenshots — eight states, both themes, four widths |
| `offline-data-state.json` | The D-041 acceptance: 12 cases, including three deliberate falsifications |
| `offline/offline-inventory.json` | The D-037 offline inventory, re-measured after D-041 |
| `update-delivery/` | The §279 update-delivery gate re-run. **D1 FAILS — see below** |

---

## Instrument defects found and corrected during this run

Three, all found by the instruments failing against a product that was behaving correctly. Each is
recorded because each was one step away from being written up as a product verdict.

**I-6. The route crawl reported the product's most important page as an orphan.** A breadth-first
anchor crawl, used alone, reported eight `LEGACY_ORPHAN` routes including `/inspection-workspace`,
`/profile`, `/upgrade`, `/unlock` and `/reset-password`. All five are reachable — by `router.push`,
from inside a closed menu, from an entitlement-limited state, from the auth guard, and from an
emailed link respectively. A crawl's SILENCE is not evidence of absence. Corrected by requiring
both an anchor crawl and a source-reachability fixpoint to miss a route before it is called an
orphan, and the corrected instrument was then deliberately falsified before being trusted.

**I-7. The false-zero detector flagged an honest answer.** The D-041 acceptance initially treated
any `0` beside a "Last synced" caption as a false zero, and case 2b duly failed against correct
behaviour. A `LAST_SYNCED` zero is a zero **the server actually returned**, shown with the time it
returned it — precisely the shape the decision asks for ("4 overdue / Last synced 2:14 PM"), and as
true of `0` as of `4`. The defect is a zero standing in for an answer nobody has, which is the
`OFFLINE_UNAVAILABLE` case and nothing else. The detector's self-test was also rewritten to call
the *same* predicate the measurement uses, rather than an inline copy that could pass while the
real one was broken.

**I-8. A gate asserted that authenticated pages render, and never signed in.**
`check:action-workflow` visits `/command-center`, `/inspections`, `/safety-calendar` and three
others and asserts each renders its workflow state — with no login step anywhere in the script.
Against `DEV_AUTH_BYPASS=false` the guard redirects every one of them to `/login` and the gate
fails for a reason unrelated to what it tests. **It fails identically at HEAD**, on the three
routes §281 did not touch, which is how it was identified as pre-existing rather than a regression.
It now signs in through the form, checks that it actually landed on the route it is asserting
about, and when no credentials are supplied reports the authenticated rows `NOT_EXERCISED` and
**fails** rather than passing on whatever happened to be measurable.

---

## One gate that FAILS, and was not made to pass

`validate:279-update-delivery` — **case D1, "an unsupported client is shown the update-required
state"**, times out waiting for the panel.

This was isolated rather than assumed, with two independent controls:

1. **HEAD's version of the script**, with only the retired URL swapped for an active one, fails at
   the same case.
2. It fails on `/settings`, `/command-center` and `/safety-calendar` alike — pages §281 did not
   change — so it is not a consequence of the D-041 dashboard work or the D-038 removal.

The preceding cases **C1–C5 and J pass**, so the version check itself works: a current client is
told about a newer release, the notice reads as an offer, and dismissal sticks. What does not fire
is the **background re-check on a tab left open** — §279's Part A mechanism, which is what turns an
unsupported client into one that stops writing. That is safety-relevant and it is recorded as an
open failure. **It was not repaired and the gate was not weakened to make it pass.**

An earlier hypothesis — that `/safety-calendar`'s own polling perturbed the mocked clock — was
written down, tested, and found to be **wrong**; it is recorded here so it is not repeated.

---

## What was not measured

- **Programmatic navigation is not crawled.** Pass 3 establishes it from source; the crawl does not
  follow buttons. Stated rather than silently treated as coverage.
- **The `/dashboard/*` aggregate routes** are gated behind the paid `analytics` entitlement and were
  not exercised: the account is Free, which is the case the home screen has to be right for.
- **Steps 3–5 of the workspace** (Risk & fix, Review, Finish) were not traversed. This batch is the
  HazLenz step.
- **Intermittent connectivity** — timeouts, partial success, connection loss mid-operation — is
  **D-042** and is registered, not tested. Only total loss and full reconnect were measured.
