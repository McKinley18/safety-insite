# §283 — runtime evidence reconciliation, update-delivery closure, preview deployment record

Three bounded confidence issues, one provenance check, and the correction of a documentation claim
that was true of one deployment target and false of the other.

**Zero provider calls.** The review stack runs `EXPERT_EXECUTION_ENABLED=false` with
`ANTHROPIC_API_KEY` deleted from the child environment.
**Zero production mutations.** Vercel and the production URLs were read only.

| | |
|---|---|
| HEAD | `f1dfce8cf0d135660d36a20302577c6ded4c40be` |
| frozen validated PRODUCT baseline | `709ee151b932095020ea69d25daa04a337ccba16` — unchanged, not promoted |
| §274 successor identity | `8c163b312b291ef3b7ec361df371b86afdd92d15ae87ad71c2e06462942c4aee` — re-verified, 22 elements, 0 failures |
| review stack | `backend/scripts/review/review-stack.ts` |
| disposable database | `test_insite_review_1789385855738_2963`, run `dfc97665-12a1-430b-8fee-e3fb4fa734b3` |
| accounts | `review-283@example.test` (**Free**) and `review-283-pro@example.test` (**entitled control**, 4-hour test grant on the disposable database only) |
| frontend build | production `next build` + `next start`, `NEXT_PUBLIC_FRONTEND_VERSION=1.0.0`, `NEXT_PUBLIC_DISABLE_AUTH=false`, `NEXT_PUBLIC_DEV_FORCE_PRO=false` |
| provider calls | **0** |
| production writes / deploys / migrations | **0** |

---

## A. D-045 — the Expert panel's 402, resolved

### The exact failing request, and where the 402 comes from

```
GET /inspections/observations/:id/expert-analyses/current
Authorization: Bearer <JWT: planCode=free, effectivePlanCode=free, subscriptionTier=free>

HTTP/1.1 402 Payment Required
{"message":"A paid subscription is required for this feature.",
 "code":"PAID_SUBSCRIPTION_REQUIRED","entitlement":"fullSafeScope"}
```

Issued by `ExpertAnalysisPanel.refresh()` on mount, through
`lib/expert/expertApi.ts → readExpertAnalysis`.

Produced by **`EntitlementGuard`** — `backend/src/auth/entitlements/entitlement.guard.ts:53` —
because `ExpertAnalysisController.readCurrentExpertAnalysis` carries
`@RequireEntitlement('fullSafeScope')` and the Free plan sets
`fullSafeScope: false` (`backend/src/billing/plan-entitlements.ts:67`).
Not `SubscriptionGuard`; not a budget, spend guard, rate limit, feature flag or provider boundary.

### Is the 402 expected?

**Yes, and it is correct.** The account is Free; the route is Pro-gated; the guard refuses. Nothing
about the refusal is a defect, and it was not changed. `EXPERT_EXECUTION_ENABLED=false` is
irrelevant here — the guard runs before the controller.

### Should the request have been sent at all?

**Yes — asking once on mount is the right design and was kept.** `EntitlementService.hasFeature`
treats a live `UserSubscription` row as authoritative **over** the JWT's cached plan claim, in both
directions. A client that suppressed the call from its own JWT claim would tell a user who had just
upgraded that Expert is not in their plan, which is the exact drift the server-side comment (and the
Stripe Test Clock evidence behind it) exists to prevent. The server is the authority on entitlement;
the client's job is to ask once and render the answer.

### Was the response handled correctly? **No. That was the defect.**

`expertApi.expertJson` recognised **401** and **403** and nothing else. The guard answers **402**, so
the entitlement refusal fell through to the generic branch: the server's `code` was discarded,
`EXPERT_NOT_ENTITLED` was never raised, and `ExpertAnalysisPanel`'s plan notice — the only branch
that suppresses the run control — was **unreachable code**.

**User-visible consequence, measured at §281 on 64 of 64 HazLenz-step visits:** the guard's billing
sentence rendered inside a red `role="alert"` box, beside an **enabled** "Run Expert review" button
that could only ever produce the same refusal and a second audit row. A plan boundary presented as a
system error, attached to a call to action the account can never complete.

### The repair

`frontend-next/lib/expert/expertApi.ts` — the failure mapping now derives from the **body's `code`**
first and the status only as a fallback, extracted as the pure `classifyExpertFailure(status, body)`
so it can be tested without a network. A status is the client's guess about what the server meant;
the code is what the server said. The bare-403 mapping is preserved exactly, so nothing else moved.

**No server change. No HazLenz semantics touched. The refusal is unchanged.**

### Measured before and after, same build, same instrument

| | Free — §281 (before) | Free — §283 (after) | Entitled control — §283 |
|---|---|---|---|
| `GET .../current` | 402 | 402 | **200** |
| console errors per visit | 2 × 402 | 2 × 402 | **0** |
| red `role="alert"` | **yes** | no | no |
| "Run Expert review" buttons | **1 (enabled)** | **0** | 1 |
| panel | error box over a live control | "Expert review is not included in this plan. Your deterministic HazLenz analysis above is unaffected." | "Expert analysis has not been run for this observation" + Run + Show analysis record |

Screenshots: `screenshots/d045-free-after-repair-1280.png`,
`screenshots/d045-entitled-control-1280.png`,
`screenshots/batch2H-hazlenz-a-light-1280-after.png`.
Full batch: `results/batch-2H-after-d045.json` — 64 visits, 8 states × 2 themes × 4 widths.

**The 402 console entry remains, on all 64 visits, and that is correct.** It is Chromium's own
record of a 4xx response, not an application error, and the only way to remove it would be to stop
asking the server — which would be the wrong design (see above). What changed is everything the
inspector sees.

### Regression

`frontend-next: npm run test:expert-api-failure-mapping` — nine cases keyed on the **real** captured
refusal. **Falsified:** the pre-repair mapping, run against the same fixture, classifies the 402 as
`code: null`, so the regression fails before the repair and is not vacuous.

### Raised, not decided

- **S-15 is untouched.** Whether the Expert panel should be offered at all on a Free account remains
  the product-owner's decision. §283 made the current offering honest; it did not decide whether to
  make it.
- **Every refused read writes a `security_audit_event` row** with `action: entitlement_denied`
  (verified: 1 row per refused request on the disposable database). §281's 64 visits produced ~128.
  Auditing entitlement denials is deliberate server behaviour, and changing it is an audit-policy
  decision, not an engineering one. **Recorded for the product owner, not altered.**
- **State H (Expert refusal) is now `NOT_EXERCISED` on a Free account**, and the instrument says so:
  8 × `SETUP_NO_EXPERT_RUN_CONTROL` in `results/batch-2H-after-d045.json`. There is no longer a run
  control to press, which is the repair working. Reaching a genuine refusal state now requires an
  **entitled** account against a stack with Expert execution disabled.

---

## B. Prior console-error evidence, reconciled

### What the instrument could and could not see

`review-279-page-batch.mjs` attaches two listeners, unchanged between §279, §280 and §281:

| listener | what it captures | verdict |
|---|---|---|
| `context.on("console")`, `msg.type() === "error"` | browser console errors, **including** Chromium's own "Failed to load resource: the server responded with a status of NNN" | **works.** §281 captured 402s with it, and §283 reproduced that |
| `context.on("requestfailed")` | **transport** failures only — DNS, refused connection, abort, timeout | **structurally blind to HTTP error statuses.** A 402/403/500 is a *completed* request; Playwright fires `requestfinished`, never `requestfailed` |

Confirmed by the data: §281 and §283 both record 64 visits carrying 402s with **`netFailures: 0`**.

So "zero console errors" meant **zero browser console error messages**. It never meant "zero failed
network requests", and the field named `netFailures` could not have meant it either.

### Why §280 recorded zero and §281 recorded 64 — the disagreement is resolved

**It is not an instrument failure. The two runs used accounts in different entitlement states.**

Proven at §283 by running both on one build and one instrument:

- Free account → `402` → red alert, and **2 console errors per visit**.
- Entitled account → `200` → **0 console errors**, and the panel renders
  `"Expert analysis has not been run for this observation" … Run Expert review … Show analysis record`.

That entitled rendering is **exactly** what §280's own screenshot
(`page-review-280/screenshots/batch-2-hazlenz/hazlenz-a-finding-light-1280.png`) shows — including
the "Show analysis record" disclosure, which only renders when `read` is non-null, i.e. only after a
**successful** read. §280's account therefore held `fullSafeScope` at the moment of measurement and
no 402 was ever produced for the listener to miss.

The precise mechanism by which the §280 account came to hold the entitlement is **not established**
and is not asserted here. Neither seed script grants one; the repository has an operator route
(`POST /admin/entitlement-grants`) and a disposable-database script
(`backend/scripts/grant-test-entitlement.ts`) that can, and the §280 run's grant state was not
recorded in its evidence. **That gap is the real instrument defect, and it is recorded as I-9.**

### Classification of the affected historical claims

Historical evidence is **not** rewritten. These are classifications applied on top of it.

| claim | class | why |
|---|---|---|
| §279 batch 1 "zero console errors" (20 visits) | **VALID, with a stated limit** | the console listener worked. It says nothing about HTTP failures, and never did |
| §280 batch 2 "zero console errors" (40 visits) | **VALID, with a stated limit** | same |
| §280 batch 2H "zero console errors" (40 visits) | **LIMITED** | true as measured, but measured on an **entitled** account, so it is not evidence about the Free-account HazLenz step — which is the tier the product ships to most users |
| §279/§280 `netFailures: 0` on every visit | **LIMITED — structurally incapable** | `requestfailed` cannot observe an HTTP error status. A zero here is not evidence that no request failed |
| §281 "the disagreement is not explained" (D-045) | **SUPERSEDED** | explained above, by measurement |
| §280 S-14/S-15 observations of the Expert surface | **VALID** | unaffected |
| any claim that the review batches proved the absence of HTTP failures | **INVALID** | no instrument in §279–§281 could establish it |

Nothing is classified INVALID that was actually written down; the last row is recorded so the
inference cannot be drawn later from the surviving numbers.

### Instrument defects found at §283

- **I-9. A page-review run does not record the entitlement state of the account it measured.**
  This is what made the §280/§281 disagreement unexplainable for two sections: the runs differed in
  the one variable neither recorded. A review of a tiered product must state its tier.
- **I-10. `netFailures` names something it cannot measure.** It reads as "failed network requests"
  and is structurally incapable of seeing an HTTP failure. Its zero has been quoted as though it
  covered both.
- **I-11. The update-delivery gate cancelled its own request** — see section C.

I-9, I-10 and I-11 are **recorded here and not repaired**, except I-11, whose repair was required to
answer the D1 question §283 was directed to answer.

---

## C. Update delivery — D1 root cause, and the full case set

### Root cause: the gate cancelled the request it was waiting for

§281 and §282 recorded D1 as a **failing product gate**: a tab left open never reaches the
update-required state, "no root cause identified". §283 instrumented the client's own check and
found the opposite.

`checkReleaseVersion()` gives its `GET /version` an 8-second budget —
`setTimeout(() => controller.abort(), 8000)`. Playwright's fake clock **owns `setTimeout`**. The
gate advanced fake time with a single `page.clock.runFor(31 * 60 * 1000)`, which:

1. fires the 30-minute background interval — **the schedule works**;
2. the check issues its request;
3. the *same call* then advances fake time straight through that 8-second budget, while the real
   response is still in flight, because real network I/O does not move with fake time;
4. the abort fires; the probe recorded `net::ERR_ABORTED` on `/version`;
5. the client resolves **UNKNOWN** — which is the specified fail-open behaviour;
6. UNKNOWN correctly blocks nothing and shows nothing;
7. D1 asserts the panel and finds none.

Measured directly: in the frozen mode the probe saw the extra `/version` request leave the page, one
response delivered, `net::ERR_ABORTED`, **0 update-required panels**. Advancing to just past the
interval boundary instead: the same extra request, **two** responses delivered, **1 update-required
panel**.

**D1 was an instrument defect. The background re-check works, on the build the frozen run failed
against.**

### The repair — instrument only

`frontend-next/scripts/validate-279-update-delivery.mjs`: the fake clock is advanced to just past the
30-minute boundary (`PAST_BACKGROUND_INTERVAL_MS`), and **real** time then delivers the response.

**Nothing in the product was weakened.** The 8-second request budget, the 30-minute background floor,
the 15-minute staleness rule, the visibility gate and the fail-open UNKNOWN are all unchanged. No
polling was added.

**F1 was corrected the same way, in the opposite direction.** F1 asserts that an *unreachable*
version endpoint shows no update-required state — and under the single advance every check was
aborted whether or not the endpoint was reachable, so **F1 was passing vacuously**. It now exercises
a real transport failure.

### Results — `results/update-delivery-results.json`

**26 passed, 0 failed.** Every case §283 named was executed:

| | |
|---|---|
| **D1** an unsupported client is shown the update-required state | **PASS** |
| **D2** it says what happened and what to do | **PASS** |
| **H1** nothing reloaded on its own | **PASS** |
| **H2** the unsaved work is still on the screen | **PASS** |
| **H3** the notice warns that unsaved work will be lost | **PASS** |
| **E0** the blocked state survives a navigation within the stale client | **PASS** |
| **E1** the write control is present to be attempted | **PASS** |
| **E2** a write from an unsupported client never reaches the server | **PASS** |
| **E3** CONTROL: the identical click from a CURRENT client does reach the server | **PASS** — E2 is not vacuous |
| A, C1–C5, J | **PASS** — offer not demand, dismissible, no duplicate banner |
| F0–F3 | **PASS** — an unreachable server is not misrepresented as "update required", and the client keeps writing |
| I1–I6 | **PASS** — the version surface names a product version, not a commit |

Against §283's stated requirements:

1. a tab on an old but supported version continues safely — **C1–C5** ✓
2. detection without manual navigation — **D1** ✓
3. detection does not destroy active work — **H1, H2** ✓
4. D-035 recoverable draft state intact — **11/11**, `results/draft-persistence-acceptance.json` ✓
5. mutations blocked only on positive incompatibility evidence — **E2 with the E3 control** ✓
6. reads / sign-out / session recovery remain available — **partly measured.** F3 proves writes
   continue under UNKNOWN; the auth-lifecycle and read exemptions are established by
   `blocksMutation` and its unit suite (31/31), **not** by a dedicated browser case. Recorded as a
   limit rather than claimed.
7. UNKNOWN non-blocking — **F1–F3** ✓
8. server outage not misrepresented — **F1, now non-vacuously** ✓
9. no duplicate banners — **J** ✓
10. refresh yields the new frontend identity — **partly measured.** I1–I6 prove the running client
    reports its own identity; there is one build here, so "the refresh produced the *new* one"
    cannot be demonstrated locally. Recorded as a limit.

---

## D. Vercel preview deployments

Recorded in `project-docs/current/UPDATE-DELIVERY.md`, "Vercel Git deployment, as measured (§283)",
with the raw reads in `results/vercel-project-config.json` and `results/vercel-deployments.json`.

In short: `gitProviderOptions.createDeployments: disabled`, and the §282 branch push nevertheless
created a **Git-sourced preview** (`dpl_3gJEF…`, `source: "git"`, `target: null`,
`gitSource.prId: null`) while production stayed on `de655d2f` from 2026-08-29. Preview URLs 302 to
Vercel SSO, `noindex`, `DENY` framing. **The production half of the control has never been
exercised** — `main` has not been pushed since it was set.

**Recommendation: KEEP_PREVIEWS.** Nothing was changed.

---

## E. The historical baseline digest `3c2c5974…`

```
3c2c59747dbeda061eff493e4f0cc2eefb20d201fd30ba64180c83986a05fa81
```

| search | result |
|---|---|
| working tree, all files, excluding `.git` and `node_modules` | **0 occurrences** |
| `git log --all -S` (full and 8-char prefix) | **0 commits** |
| every git blob — 17,102 objects via `git cat-file --batch-all-objects` | **0 occurrences** |
| all four stashes | **0 occurrences** |
| any field named `baselineDigest` / `baseline_digest` | present, but the only recorded value is `48db2a0f…` (§229 Expert candidate baseline) — a different artifact |

Reproduction attempted from the frozen baseline `709ee151`: `sha256` of
`LOCAL-PRODUCT-BASELINE.json` (absent at that commit), `local-product-baseline-277/DIGEST.txt`,
that package's `MANIFEST.md`, `CURRENT-STATE.md`, `EXPERT-HAZLENZ-STATE.json`,
`SECTION-274-SUCCESSOR-IDENTITY.json`, `FROZEN_SCORE_CURRENT.json`, `PROTECTED-IDENTITIES.json`, the
commit SHA text, and the tree object. **None matches.**

**Outcome: D — INCORRECT / MISATTRIBUTED**, as far as repository evidence can establish. The digest
is not recorded anywhere in this repository and no derivation from the frozen baseline reproduces
it. Whether it was recorded in an out-of-repository record cannot be established from repository
evidence and is not asserted either way.

**Disposition: it must not be used as a current integrity assertion.** No replacement digest has
been invented. The integrity assertions that *are* reproducible and that should be used instead are
the ones in `verification/current/LOCAL-PRODUCT-BASELINE.json` (§277), which name commit
`709ee151` and carry per-document digests that recompute correctly, and the §274 successor identity
`8c163b31…`, which `npm run verify:274-successor-identity` recomputes from live sources.

Nothing was mutated: the frozen baseline is untouched and no historical record was edited.

---

## Gates executed at §283

| gate | result |
|---|---|
| `frontend-next: npx tsc --noEmit` | **PASS** |
| `frontend-next: npm run build` (production) | **PASS** |
| `frontend-next: npm run test:expert-api-failure-mapping` | **PASS** — new, falsified against the pre-repair mapping |
| `frontend-next: npm run test:expert-presentation` | **PASS** |
| `frontend-next: npm run check:expert-authority-boundary` | **PASS** |
| `frontend-next: npm run validate:279-update-delivery` | **PASS — 26/26** (was FAIL at D1, with D2/H1–H3/E0–E2 unexercised) |
| `frontend-next: npm run test:279-release-version-check` | **PASS — 31/31** |
| `frontend-next: npm run check:release-contract-parity` | **PASS** |
| `frontend-next: npm run validate:280-workspace-draft-persistence` | **PASS — 11/11** (D-035) |
| `frontend-next: npm run validate:281-offline-data-state` | **PASS — 12/12** (D-041) |
| `frontend-next: review-279-page-batch BATCH=2H` | 64 visits; 64 × `CONSOLE_ERROR` (the expected 402), 8 × `SETUP_NO_EXPERT_RUN_CONTROL` (state H NOT_EXERCISED by design), 0 other objective observations |
| `backend: npm run verify:274-successor-identity` | **PASS** — 22 elements, 2 moved by the authorised rename, 0 failures, 0 files written |
| `backend: npm run hazlenz:verify` | **PASS** — 29/29 protected modules, 0 accepted-evidence drift; worktree byte-identical before and after |
| `backend: npm run brand:audit` | **PASS** — 0 customer-visible retired brand |
| backend typecheck / build | **not run — no backend file was changed** |
| route inventory | **not run — no route was added, removed or moved** |

---

## Left open, untouched, by direction

**D-042** intermittent connectivity · **D-043** the `ReportCard`/`localVault`/photo-annotation
orphan cluster · **D-044** the fourth dashboard tile. Not decided, not remediated, not investigated.
