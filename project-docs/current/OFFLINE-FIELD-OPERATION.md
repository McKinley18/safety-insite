# Offline field operation and synchronization — D-037

**Registered at §280. Inventory and design evidence only.**

Offline field use is an explicit Safety InSite product requirement: safety professionals conduct
inspections where Wi-Fi is unavailable, cellular service is unavailable, or connectivity is
intermittent.

**Safety InSite is not offline-capable today, and nothing in §280 made it so.** One surface —
Field Capture — works without a connection. Every other surface in the product refuses, and says
so. This document records what was measured, not what is intended.

Machine-readable readings: `verification/current/page-review-280/offline-inventory.json`.
Producer: `frontend-next/scripts/measure-280-offline-inventory.mjs`.

---

## How this was measured, and one reading that had to be thrown away

A production build (`next build` + `next start`) driven in Chromium as a real authenticated user.
Per route: the API calls made on a normal load, then the same route loaded again with the browser
context offline.

**The first run reported that every route failed to load offline, including Field Capture. That
reading was worthless and was discarded.** `ServiceWorkerRegistrar` deliberately does not register
in development — *"the dev server rebuilds assets on every edit; a cached shell there would serve
stale chunks"* — so the run had measured the absence of a service worker and was about to report it
as the absence of offline capability in the product. The instrument now asserts that a worker is
**in control** before it measures anything, and refuses to run otherwise.

D-037 says: do not infer support merely because browser state exists. So local storage and
IndexedDB presence is recorded as **presence of local state** and never as evidence of offline
support. Several routes below hold local state and are still unusable without a connection.

---

## Current state, per capability

`OFFLINE`: WORKS · PARTIAL · REQUIRES_NETWORK · UNKNOWN
`DATA_LOSS_RISK`: NONE_KNOWN · RECOVERABLE · VULNERABLE · UNKNOWN

| Capability | Route | Network calls on load | OFFLINE | DATA_LOSS_RISK | What was actually observed |
|---|---|---|---|---|---|
| Observation entry, photos, local drafts | `/field-capture` | `GET /version` only | **WORKS** | **NONE_KNOWN** | Renders complete offline (1,029 chars offline vs 1,025 connected). Drafts and photos in per-account IndexedDB (`insite-offline-v1`). Sync is an explicit button, never automatic |
| Inspection creation / resume | `/inspections` | `/version`, `/sites`, `/inspections`, `/billing/status` | **PARTIAL** | **NONE_KNOWN** | Shell and workflow choice render (1,803 offline vs 2,420 connected); the saved-inspection list and the site picker are server-backed and absent. A new inspection cannot be created |
| Dashboard / due work | `/command-center` | `/version`, `/calendar`, `/billing/status` | **PARTIAL** | **NONE_KNOWN** | Renders, but every count and the week strip are server-backed. **A dashboard that renders with empty counts is the one honesty risk in this table** — see below |
| Observation entry, HazLenz, findings, review, actions | `/inspection-workspace` | `/version`, `/inspections/:id`, `/billing/status` | **REQUIRES_NETWORK** | **RECOVERABLE** (§280 D-035) | Product-owned refusal: *"This page needs a connection."* Drafts typed while connected now survive a reload (D-035) but the page cannot be **opened** offline, so a refresh with no signal waits for the connection rather than losing the work |
| Inspection completion, report | `/inspection-complete` | `/version`, `/inspections/:id`, `/inspections/:id/report`, `/sites` | **REQUIRES_NETWORK** | NONE_KNOWN | Refuses. Completion is a server transition and report generation is server-side |
| Reports | `/reports` | `/version`, `/inspection-reports` | **REQUIRES_NETWORK** | NONE_KNOWN | Refuses. No report is cached for offline reading |
| Corrective actions, tasks, calendar | `/safety-calendar` | `/version`, `/calendar`, `/billing/status` | **REQUIRES_NETWORK** | **RECOVERABLE** | Refuses to render. The §276 outbox still holds writes made while connected and replays them on reconnect — but it cannot be reached from this page while offline |
| Settings, sites, risk matrix | `/settings` | `/version`, `/billing/status`, `/sites` | **REQUIRES_NETWORK** | NONE_KNOWN | Refuses |
| Account | `/profile` | `/version`, `/billing/status`, `/auth/me` | **REQUIRES_NETWORK** | NONE_KNOWN | Refuses |
| Clarification, review selections, findings | *(inside `/inspection-workspace`)* | — | **REQUIRES_NETWORK** | **RECOVERABLE** | Every one is an authenticated write. Drafts persist locally (D-035); nothing queues |
| Synchronization | Field Capture only | — | **PARTIAL** | UNKNOWN | Field-capture sync exists and is explicit. There is no general outbox for inspections, observations, findings or reviews |
| Authentication / session | all | `/auth/refresh` on 401 | **UNKNOWN** | UNKNOWN | Not exercised offline. An expired access token cannot be refreshed with no network; what the product then does is **not measured** and must not be assumed benign |

### The dashboard is the honesty risk in this table

`/command-center` and `/inspections` are the two routes that **render** offline rather than
refusing. They render their shell with server-backed content missing. For `/inspections` that is
visibly incomplete. For the dashboard it is not: the counts are `0`, and `0 OVERDUE` on a screen
that cannot reach the server is indistinguishable from `0 OVERDUE` on a screen that can.

**A safety product must not show a clean board it has not checked.** This is registered here rather
than repaired, because whether the dashboard should refuse, or show its counts as unknown, is a
product decision. It is the single most important item in this inventory.

---

## What exists to build on

| Mechanism | Where | What it covers |
|---|---|---|
| Offline application shell | `public/sw.js`, registered at `/sw.js?v=<build>` | Navigation network-first, assets cache-first. Proven on a first visit by `verify:offline-shell-cold-start` |
| Per-account namespace | `lib/offline/offlineIdentity.ts` | SHA-256 of the account's server id. Every offline record is keyed by it, so a second account on one device cannot form the key |
| Field-capture store | `lib/offline/fieldCaptureStore.ts`, IndexedDB `insite-offline-v1` | Drafts, observations, photo blobs |
| Explicit sync | `lib/offline/fieldCaptureSync.ts` | A button, not a background process. The product says so |
| Calendar outbox | `safety_insite_calendar_outbox` | Writes made while connected, replayed on reconnect |
| Offline request queue | `sentinel_offline_queue_v1` | Present; not a general write queue for the inspection spine |
| Workspace drafts | §280 D-035, `lib/inspection/workspaceDraft.ts` | Local recoverable draft state. **Explicitly not offline support** |
| Client idempotency | `clientRequestId` on inspection and observation creates | The duplicate-suppression a future sync will need, already in place and already exercised |

## What does not exist

- No general outbox for inspections, observations, analyses, reviews, findings or corrective actions.
- No conflict model. Nothing decides what happens when a record changed on the server while a
  device held an older copy.
- No offline analysis. HazLenz runs server-side, and Field Capture says so in as many words.
- No offline report generation or report reading.
- No offline session handling. **Unmeasured**, and the most likely source of an unpleasant surprise.
- No duplicate-suppression across a full disconnect/restart/reconnect cycle. The per-request
  `clientRequestId` covers a retried request, not a replayed queue.

## Risks the inventory raises

| Risk | Basis |
|---|---|
| **A dashboard that reads clean offline** | Measured. `/command-center` renders with zero counts and no indication they are unverified |
| **Session expiry offline is unknown** | Not measured. An inspector two hours into a walkthrough with an expired token has no path to refresh it |
| **Photo/blob growth is unbounded** | IndexedDB holds photos until an explicit sync. No quota policy was found |
| **Two devices, one inspection** | No conflict model exists, so the outcome is whatever the last write does |
| **Sync is a button** | Correct today and honestly stated. It becomes a data-loss risk the moment anything implies automatic sync |

---

## Future acceptance target

Not built, not attempted, and recorded so the eventual instrument is not designed after seeing a
result:

```
connected inspection start → total network loss → continued field work → observations →
evidence/photos → application termination → application restart → continued work → reconnect →
synchronization → conflict handling → no duplicate actions/events → provenance retained →
authoritative server state correct
```

**Safety InSite is not fully offline-capable. Nothing in §280 claims otherwise.**
