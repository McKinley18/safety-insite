# Update delivery and release compatibility — §279

**What this answers:** when Safety InSite is updated, do supported users reliably get the new
frontend, and can a user be left indefinitely on an incompatible stale one?

Before §279 the answer to the second question was **yes, indefinitely**. This document records what
was measured, what was built, and what is still open.

---

## Part A — how updates reached users before §279

| | |
|---|---|
| Frontend | Next.js 16 (App Router) on Vercel. No `vercel.json`; platform defaults. Git auto-deploy **disabled** (`createDeployments: disabled`, §269) |
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

## Gates

| Gate | Covers |
|---|---|
| `backend: npm run test:279-release-compatibility` | the rule; plan cases A–F; the served contract's exact public field set |
| `frontend-next: npm run test:279-release-version-check` | client scheduling; plan cases E, F, G, J |
| `frontend-next: npm run validate:279-update-delivery` | the browser; plan cases A, C, D, E, F, H, I, J, with a control run |
| `frontend-next: npm run check:release-contract-parity` | the two rule copies, and the one declared value that could not be derived |
| `frontend-next: npm run validate:280-workspace-draft-persistence` | §280 D-035. The draft survives a required refresh, submits once, does not duplicate, and is refused when it is stale or belongs elsewhere. With a control and a falsification |
