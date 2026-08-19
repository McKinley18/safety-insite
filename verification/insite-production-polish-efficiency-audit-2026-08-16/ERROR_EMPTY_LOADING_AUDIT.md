# Error / Empty / Loading State Audit

All items below were triggered live against the real running application, not inferred.

## Genuine defects found

### 1. Hydration mismatch on every homepage load (P2/POLISH_MEDIUM)
Next.js "Recoverable Error" overlay fires on `/` every load: the "Return to Dashboard"/hero CTA `<Link>`'s `className` differs between server and client render, because whether the visitor is treated as logged-in is decided client-side only (localStorage token) while the server always renders the logged-out variant. Invisible to the eye (React silently repairs the tree) but a real, reproducible defect that would show up in error monitoring in production.

### 2. Raw 500 with a config-dependent root cause (P0, only in a specific dev config — see caveat)
With the repository's own default `backend/.env` (`DEV_AUTH_BYPASS=true`), every authenticated request is silently treated as a hardcoded dev user `{ userId: 1, ... }` — a JS **integer**, not a UUID — regardless of whether a real, valid JWT was sent. Any endpoint that queries the database using `user.userId` against a UUID column (confirmed for both `BillingService.getBillingStatus` and `EntitlementGuard.hasFeature`) throws `QueryFailedError: invalid input syntax for type uuid: "1"`, surfaced to the end user as a bare `HazLenz AI review failed: {"statusCode":500,"message":"Internal server error"}`. **This means the checked-in default local-dev configuration cannot successfully run a HazLenz review at all** — every attempt 500s. Disabling `DEV_AUTH_BYPASS` (which then requires a real login, which works fine) resolves it. This is documented as a real defect in the *default dev environment*, not necessarily in whatever configuration production actually runs with — but the fact that the repo's own `.env` ships in a state that breaks the product's core feature is worth flagging regardless.

### 3. `PayloadTooLargeError` on "Save to Cloud," surfaced as raw text (P1)
Saving a report package (one finding, one standard, one action) to the backend failed with Express's default 100KB JSON body limit, and the frontend displayed the literal string `request entity too large` with no explanation or next step. See `API_PAYLOAD_AUDIT.md` for the payload-size root cause.

### 4. Silent, unexplained dead end at PDF export (P0)
On the legacy `/inspection-review` screen, "Export Final PDF" is gated behind: *"1 HazLenz AI finding(s) still need snapshot validation. Export will continue only after you confirm qualified-person review."* The qualified-person-review checkbox was checked. No control anywhere on the page performs "snapshot validation." Clicking "Export Final PDF" repeatedly produces **no network request at all** (confirmed via network-request inspection) — a pure client-side dead end with no error message, loading state, or explanation.

### 5. Silent no-op on "Attempt finalization now" (P2)
In the canonical workspace, clicking "Attempt finalization now" when the underlying standard is still "more evidence required / Low confidence" produces **no visible feedback whatsoever** — no toast, no inline message, no button state change, no error, no navigation. The user cannot tell whether the click registered.

## Good patterns confirmed live
- **Free-tier / no-entitlement HazLenz failure**: clean, well-worded fallback — "HazLenz AI intelligence is unavailable. Continue documenting the finding and review before relying on automated guidance," with a working "Use Offline Review" action that produces an honestly-labeled degraded result ("Limited review... DO NOT TREAT THIS AS A FULL REVIEW").
- **Empty states**: `/reports` ("No generated reports — Complete an inspection and generate a report...") and the Finalize-Findings step ("Save at least one finding before generating the final report") are both clear about what happened and what to do next.
- **Rate limiting**: confirmed real (`429 ThrottlerException`, 100 req/60s), a legitimate production-hygiene control rather than a bug (it interrupted this audit's own performance-corpus testing, which is exactly the intended behavior against unexpected bursts).

## Assessment
The product does the "good empty state" pattern well. Its weakest error-state moments are exactly where the stakes are highest: the core AI-review call and the final PDF-export action, both of which have at least one path to a raw, unhelpful, or silent failure.
