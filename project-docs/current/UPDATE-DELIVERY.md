# Update delivery and release compatibility — §279

**What this answers:** when Safety InSite is updated, do supported users reliably get the new
frontend, and can a user be left indefinitely on an incompatible stale one?

Before §279 the answer to the second question was **yes, indefinitely**. This document records what
was measured, what was built, and what is still open.

---

## Part A — how updates reached users before §279

| | |
|---|---|
| Frontend | Next.js 16 (App Router) on Vercel. No `vercel.json`; platform defaults. `gitProviderOptions.createDeployments: disabled` (§269). **This does not stop branch previews** — see [Vercel Git deployment, as measured](#vercel-git-deployment-as-measured-283) |
| Backend | NestJS on Render, **native Node runtime, not Docker** — `env: node`, `rootDir: backend`, build `npm install --include=dev && npm run build:render`, start `npm run start:render`. `autoDeploy: no`, `autoDeployTrigger: off` (§269) |
| How a user got new code | A full document load. Nothing else. |
| Frontend build identity | **None existed.** No version, no commit, no build stamp reachable from the running client |
| Backend build identity | `/health/version` — `gitCommit`, `buildTimestamp`, and a status field naming which source supplied each (§268/§270) |
| Git SHA exposure | Backend only, and only to an operator. Never to the product |
| Next.js asset caching | Content-hashed `/_next/static/**`, immutable. A new build changes the URL, so a stale asset cannot be served for a new build |
| Cache headers (measured on a local production build, §279) | document `s-maxage=31536000` + `x-nextjs-stale-time: 300`; asset `public, max-age=31536000, immutable`; `/sw.js` `public, max-age=0` |
| Service worker | `public/sw.js` — navigation **network-first**, assets **cache-first**. Registered with `updateViaCache: "none"` |
| API compatibility handling | **None.** No version was transmitted, requested or compared |
| Feature flags | `EXPERT_EXECUTION_ENABLED` only; not an update mechanism |
| Rollback | Redeploy a previous SHA. Safe for code because a schema *ahead* of a build reads READY by design (§268) |
| Schema compatibility | `/health/ready` fails closed when a migration this build requires is unapplied |

### CAN AN ALREADY-OPEN SESSION KEEP RUNNING OLD CODE AFTER A RELEASE?

**Yes — indefinitely, and this was the whole gap.**

A Safety InSite tab is a client-side application. After its first document load it navigates
client-side and never re-requests the HTML. Nothing in it asked the server what version it was
talking to. A tab opened on a truck dashboard on Monday was still executing Monday's bundle on
Friday, and still writing inspections, findings, reviews and corrective actions with it.

Three secondary contributors, each measured:

1. **Vercel Skew Protection was not enabled** — no `deploymentId` in `next.config.ts`. An old tab's
   client-side navigation requests chunks from whatever deployment is current. When those chunk
   URLs no longer exist the request 404s, and recovery is the framework's default behaviour rather
   than anything the product decided.
2. **The service worker's cache generation was the literal `v1`.** Its `activate` handler already
   deleted every `insite-shell-*` cache that was not the current generation — correct code that had
   never run once, because the generation never changed. Every release's chunks accumulated in one
   cache for the life of the installation.
3. **`npm_package_version` sat in the backend's commit-source chain.** npm sets it for every script
   it runs, including `start:render`, so any instance where the platform supplied no commit reported
   `gitCommit: "1.0.0"` — a package version presented as a commit, and it masked the `BUILD_FALLBACK`
   status that exists to say "this is not a stamp". `release:verify-sha` already refused the source,
   so no release gate was affected; the reported value was simply wrong.

The service worker was **not** a stale-code risk for an online user: navigation is network-first and
assets are content-hashed. Its defect was unbounded growth, not staleness.

---

## Part B — what §279 built

### Release identity

Derived wherever it can be, declared only where it cannot, and the declaration is checked.

| Field | Source |
|---|---|
| `releaseVersion`, `backendVersion` | the backend package manifest |
| `gitSha`, `buildTimestamp` | the §268/§270 pipeline chain, with the source named in the response |
| `schemaCompatibilityVersion` | the newest migration file shipped in the artifact — self-maintaining |
| `frontendVersion` | **declared** in `backend/src/common/release-identity.ts`; the backend builds with `rootDir: backend` and cannot see the frontend project |
| `minimumSupportedFrontendVersion` | **declared** — this is a release decision, not a build fact |

The frontend's own identity is generated at build time in `next.config.ts` from
`VERCEL_GIT_COMMIT_SHA` → `GIT_COMMIT` → `GIT_SHA` → `COMMIT_SHA` → `git rev-parse HEAD` →
`unknown`, and inlined. **No second file to forget to update.**

`npm run check:release-contract-parity` fails the build when the declared `SHIPPED_FRONTEND_VERSION`
does not equal `frontend-next/package.json`, when the floor is above it, or when either is
unparseable — an unparseable version resolves to UNKNOWN, which never blocks, so a typo there would
silently disable the entire contract.

### `GET /version`

Unauthenticated and `no-store`. Unauthenticated because a client must be able to discover it is
obsolete *before* it signs in — an obsolete client may not be able to sign in at all. Everything in
it is a public fact about a build, and a gate asserts the response carries exactly those nine fields
and nothing that looks like a credential.

`/health/version` is unchanged. It is the operator surface `release:verify-sha` reads during a
deployment; `/version` is the product surface a client polls.

### The compatibility rule

One pure function, mirrored to the browser, held together by the parity gate.

| State | Meaning | Writes | Remedy |
|---|---|---|---|
| `CURRENT` | exactly the shipped frontend | allowed | none |
| `SUPPORTED` | at or above the floor, ahead of the server within a major | allowed | none |
| `UPDATE_AVAILABLE` | older than the server, still supported | allowed | refresh, offered |
| `UPDATE_REQUIRED` | below the floor | **refused** | refresh, and it works |
| `INCOMPATIBLE` | a major *ahead* of the server (a backend rollback under a newer frontend) | **refused** | refresh cannot fix it — support |
| `UNKNOWN` | no usable evidence | allowed | none |

**The one safety property: a client is declared unusable only on positive evidence from the
server.** Unreachable server, malformed contract, unparseable version on either side — all resolve
to `UNKNOWN`, which blocks nothing. Fail-open is correct here precisely *because* the opposite
failure — refusing to let an inspector record a hazard because a request timed out — is the more
dangerous one.

`UPDATE_REQUIRED` is tested before "a major ahead", because the two differ in what the user should
be told to do. A state whose remedy does not work is worse than no state at all.

### When the client asks

Boot, restored session, a backgrounded tab becoming visible after 15 minutes, and a 30-minute
interval **only while the tab is visible**. A hidden tab spends nothing. Concurrent triggers join
one in-flight request, so four triggers produce one request and one notice.

### What the user sees

`UPDATE_AVAILABLE` is a dismissible corner notice with *Refresh now* and *Later*; a newer release
re-opens a notice dismissed for the previous one. `UPDATE_REQUIRED` is a persistent panel that
blocks writes and asks for a refresh.

**Nothing reloads by itself, ever.** The panel leaves the page behind it readable and selectable so
whatever was typed can be copied out first — see the open risk below.

### Where writes are refused

`apiFetch` is the single chokepoint for every frontend call to the API, which is why the gate lives
there rather than at thirty call sites. It refuses non-GET requests only, and never refuses
`/auth/refresh`, `/auth/login`, `/auth/logout`, `/auth/register` or the version check itself — a
gate that stopped someone signing out would trap them.

### Cache headers, measured

Taken from a local `next build` + `next start`, so these are the headers the **application** emits;
Vercel's CDN layer sits above them and purges on deployment.

| Resource | `Cache-Control` |
|---|---|
| Page document (`/login`) | `s-maxage=31536000` (plus `x-nextjs-stale-time: 300`) |
| `/_next/static/**` chunk | `public, max-age=31536000, immutable` |
| `/sw.js` | `public, max-age=0` |

Two things follow. The asset header is correct and needs nothing: the URL is content-hashed, so a
year of immutability is a year of immutability for *that build's* bytes. The document header,
however, carries **no browser `max-age` at all** — only a shared-cache directive. On Vercel that is
fine, because deployment purges the edge. It is worth knowing that a shared cache which is *not*
Vercel — a corporate proxy between an inspector and the product — is being told it may hold the
document for a year. The version contract makes that survivable rather than silent: a client served
a year-old document now discovers it on its first `/version` call instead of running it forever.

### Cache handling

A released frontend becomes loadable with no user action: no cache clearing, no site-data deletion,
no private window, nothing to reinstall.

- `/_next/static/**` is content-hashed and immutable; a new build is new URLs.
- The service-worker registration is now `/sw.js?v=<build>`, so a release is a new script URL, a new
  worker, and the existing `activate` purge of previous generations finally has something true to
  compare against.
- `/version` is `no-store` — the one request guaranteed not to be answered from a stale cache.

---

## Frontend / backend compatibility

Backend **N** supports every frontend from `minimumSupportedFrontendVersion` up to its own
`frontendVersion`, inclusive, plus anything ahead of it within the same major.

Both currently `1.0.0`, so the window is a single release — which is correct for a product with one
release, and is deliberately expressed as two separate constants so it can widen without a code
change to the rule.

- **Support ends** when the floor is raised. That is a deliberate act, not a consequence of
  shipping; it should move only when a change genuinely cannot be served for an older client.
- **Independent rollback:** the backend may roll back alone — a frontend one release ahead within a
  major is `SUPPORTED`. A **major** rollback under a newer frontend is `INCOMPATIBLE` and is
  reported honestly rather than papered over.
- **Atomic deployment is not required,** and must not become required: Render and Vercel cannot
  deploy atomically with respect to each other, so a client one release behind is the normal state
  during every switchover.

## Database release compatibility

Unchanged from §268 and integrated rather than duplicated: expand → migrate → activate → contract
later. `/health/ready` fails closed on a missing migration, so new code cannot become active against
an old schema. A schema *ahead* of a build reads READY, which is what makes a code rollback possible
without a schema rollback.

`schemaCompatibilityVersion` on `/version` makes the artifact's schema expectation visible to an
operator and to the support surface in Settings.

**No production migration was run in §279.**

## Rollback

- **Last-known-good backend:** the SHA in `verification/current/LOCAL-PRODUCT-BASELINE.json`,
  confirmed by reading `/health/version` back from the service — never inferred from the deploy that
  was requested. Restore by redeploying that SHA; the schema may stay forward.
- **Last-known-good frontend:** the Vercel deployment whose `NEXT_PUBLIC_GIT_SHA` — now visible in
  Settings → Version → Support details — matches the intended release. Before §279 there was no way
  to identify a running frontend build at all.
- **Not reversible by redeploying:** step 3 of the release handoff (production migrations). That is
  why its rollback is a *verified restore*, not a dump.

**No production rollback was executed.**

## Future clients

The contract is transport- and client-agnostic: a client states a version, the server states what it
supports, the rule is a pure function of the two. An iOS, Android or desktop client asks the same
endpoint and gets the same five states without a server change. **No native update infrastructure
was built**, and none is implied.

---

## The forced-refresh risk — CLOSED at §280 (D-035)

| State | Survives a reload? |
|---|---|
| Field-capture drafts, offline photos | **Yes** — IndexedDB |
| Pending calendar writes (outbox), offline request queue | **Yes** — local storage, replayed on reconnect |
| Saved inspections, observations, findings, reviews, actions | **Yes** — server-persisted |
| Cover-page/report draft | **Yes** — local storage |
| In-progress observation text, work area, work activity, clarification answers, reviewer risk selections, corrective-action drafts in `/inspection-workspace` | **Yes, since §280** — `lib/inspection/workspaceDraft.ts` |

§279 recorded this as the product's one open update-delivery risk: the inspection workspace kept
every in-progress value in React component state, so the surface that matters most was the one
place a reload destroyed work. That is why the `UPDATE_REQUIRED` panel never reloaded by itself.

**§280 closed it.** Draft state is autosaved to local storage under a key namespaced by a SHA-256
of the signed-in account and the inspection id, restored after the server's own load, and dropped
on submission, on completion and on sign-out. It is **local recoverable state, never committed
state**: nothing is sent to the server, and restoring a draft fills in fields without re-running
analysis, creating an observation or saving a finding. Auto-submitting unfinished work to make it
durable was ruled out explicitly.

Eleven browser cases, including a **control** (the same sequence with the draft deleted, which must
lose the work) and a **falsification** (a well-formed draft filed under the right key but naming a
different inspection, which must be refused and deleted):
`frontend-next: npm run validate:280-workspace-draft-persistence`.

### What is still true

**Nothing reloads by itself, and §280 did not change that.** The workspace surviving a refresh is
what makes an automatic refresh *thinkable*; it does not make it correct. Two reasons stand:

- The photo a user has chosen but not uploaded cannot be part of a draft — a `File` handle does not
  survive a reload, and re-encoding evidence into local storage would put a second copy of it
  somewhere the product does not say evidence lives. A restored draft says the photo must be chosen
  again.
- `/inspection-workspace` **requires a network to open** (D-037). A forced refresh with no signal
  lands the inspector on "This page needs a connection" with their draft intact but unreachable
  until the connection returns. That is far better than losing it, and it is not the same as safe.

Introducing an automatic refresh remains a product decision, and is not one §280 made.

## The background re-check — D1 was the INSTRUMENT, not the product (§283)

§281 and §282 recorded case D1 as a **failing release gate**: a tab left open never reached the
update-required state, with no root cause identified, and D2/H1–H3/E0–E2 unexercised behind it.
**§283 instrumented the client's own check and found the product was working.**

`checkReleaseVersion()` gives its `GET /version` an 8-second budget with
`setTimeout(() => controller.abort(), 8000)`. Playwright's fake clock owns `setTimeout`. The gate
advanced fake time with one `page.clock.runFor(31 minutes)`, which fires the 30-minute interval —
**the schedule works, and the probe watched the extra request leave the page** — and then, in the
same call, advances straight through that 8-second budget while the real response is still in
flight, because real network I/O does not move with fake time. The abort fires
(`net::ERR_ABORTED`), the client resolves **UNKNOWN** exactly as specified, UNKNOWN correctly
blocks nothing and shows nothing, and the gate finds no panel.

Measured both ways on the same build: one-call advance → request aborted, **0** update-required
panels. Advance to just past the interval boundary and let real time deliver → **1** panel.

The gate now advances in two parts (`PAST_BACKGROUND_INTERVAL_MS`). **Nothing in the product was
weakened to reach the pass** — the 8-second budget, the 30-minute floor, the 15-minute staleness
rule, the visibility gate and the fail-open UNKNOWN are all unchanged, and no polling was added.

**F1 was corrected in the opposite direction and for the same reason.** It asserts that an
*unreachable* version endpoint shows no update-required state; under the single advance every check
was aborted whether or not the endpoint was reachable, so **F1 had been passing vacuously**.

**Result: 26 passed, 0 failed** — A, C1–C5, D1, D2, E0–E3, F0–F3, H1–H3, I1–I6, J. Evidence:
`verification/current/runtime-evidence-283/`.

**Two limits, stated rather than claimed.** The auth-lifecycle and read exemptions from the write
gate are established by `blocksMutation` and its 31-case unit suite, not by a browser case. And
"a refresh yields the NEW frontend identity" cannot be demonstrated locally, because there is one
build here; I1–I6 prove only that the running client reports its own identity truthfully.

## Gates

| Gate | Covers |
|---|---|
| `backend: npm run test:279-release-compatibility` | the rule; plan cases A–F; the served contract's exact public field set |
| `frontend-next: npm run test:279-release-version-check` | client scheduling; plan cases E, F, G, J |
| `frontend-next: npm run validate:279-update-delivery` | the browser; plan cases A, C, D, E, F, H, I, J, with a control run |
| `frontend-next: npm run check:release-contract-parity` | the two rule copies, and the one declared value that could not be derived |
| `frontend-next: npm run validate:280-workspace-draft-persistence` | §280 D-035. The draft survives a required refresh, submits once, does not duplicate, and is refused when it is stale or belongs elsewhere. With a control and a falsification |

---

## Vercel Git deployment, as measured (§283)

Earlier sections recorded "Vercel Git auto-deploy is **disabled**" as a single fact. **It is not
one fact, it is two, and only one half has ever been observed.** §283 read the project
configuration and the deployment ledger through the Vercel API, read-only, and changed nothing.

### What the configuration says

| Setting | Value | What it is |
|---|---|---|
| `link.type` / `link.repo` | `github` / `McKinley18/safety-insite` | the Git integration is CONNECTED |
| `link.productionBranch` | `main` | which branch a Git deployment targets `production` |
| `gitProviderOptions.createDeployments` | `disabled` | the project-level Git-deployment control §269 set |
| `link.deployHooks` | `[]` | no deploy hook exists, so no URL can trigger a build |
| `ssoProtection.deploymentType` | `all_except_custom_domains` | every deployment URL is behind Vercel SSO; the project's own domains are not |
| `gitComments` | `onPullRequest: true`, `onCommit: false` | |
| `skewProtectionMaxAge` | `43200` (12h) | |

### What actually happened

| | |
|---|---|
| Production deployment | `dpl_GBe9…`, `main` @ `de655d2f`, **2026-08-29**, `source: git`, `target: production` |
| Most recent deployment | `dpl_3gJEF…`, `beta/expert-hazlenz-validated-candidate-2026-09-12` @ `f1dfce8c`, **2026-09-14**, `source: git`, `target: null` (PREVIEW) |
| Production after the §282 branch push | **unchanged** — still `de655d2f`, still 2026-08-29 |
| Preview URL access, unauthenticated | `302` to `vercel.com/sso-api`, `x-robots-tag: noindex`, `x-frame-options: DENY` |
| Production URL (`safety-insite.vercel.app`) | `200`, not SSO-gated — which is correct for a live product |

So a branch push **did** create a Vercel deployment, from the Git integration
(`source: "git"`, `gitSource.prId: null` — a branch push, not a pull request), while
`createDeployments` read `disabled`.

### The precise distinction, and the limit of the evidence

**PRODUCTION Git deployment.** Production has not advanced from a branch push. It has also not been
tested: `main` has not been pushed since §269 set `createDeployments: disabled`, so *no observation
exists either way*. The claim "a push cannot deploy production" is **configured, not demonstrated**.
Treat it as a control that has not been exercised, and keep the migrate-then-deploy ordering and
the explicit-deploy step in the runbook regardless of what the setting reads.

**PREVIEW Git deployment.** Branch pushes **do** create Vercel preview deployments today. Measured,
not inferred. Every preview URL is SSO-protected and `noindex`, and no preview aliases a project
domain.

**Wording rule.** Do not write "Git auto-deploy is disabled". Write which target is meant:

> Production does not advance from a branch push and `main` has not been pushed since the control
> was set, so the production half is configured but unobserved. Branch pushes create SSO-protected
> Vercel previews.

### Preview deployments: risk, cost, recommendation — **KEEP_PREVIEWS**

| Question | Answer |
|---|---|
| Security | Low. SSO-gated at the edge before any application code runs, `noindex`, no project domain aliased. The preview build carries the project's Preview environment variables — so the standing rule is that **no production secret may be scoped to Preview**, which should be audited before beta, not assumed |
| Cost | Low but not nil: build minutes and retained deployments per push. `deploymentExpiration` keeps 10 and expires previews at 180 days |
| Release control | **No effect on production.** A preview cannot alias a project domain and cannot become production without an explicit promote |
| Usefulness | High, and specifically for this project: a controlled-beta candidate that must be reviewed before release now has a running, protected instance of the exact candidate SHA, reachable without a local build |

**Recommendation: KEEP_PREVIEWS.** They cost little, are protected, cannot move production, and are
the only way to review a candidate as a running application without deploying it. Disabling them
would remove the review surface and would not improve the production control, which is a different
setting. §283 **changed nothing**; this is a recommendation, not an action.

### What is NOT established

Why `createDeployments: disabled` did not prevent the preview. The setting's exact scope is a
Vercel platform behaviour, and §283 did not test it by pushing anything. Do not write down a
mechanism for it that has not been observed.
