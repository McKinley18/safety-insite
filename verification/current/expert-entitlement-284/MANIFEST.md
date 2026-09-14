# §284 — Expert entitlement UX (S-15), entitlement audit policy, and two bounded capability reviews

**Zero provider calls.** `EXPERT_EXECUTION_ENABLED=false`, `ANTHROPIC_API_KEY` deleted from the
child environment. **Zero production writes, deployments or migrations.**

| | |
|---|---|
| §283 commit | `6c21dd5dcb87a071d35de3585f41ffb18a6ef936` |
| frozen validated PRODUCT baseline | `709ee151b932095020ea69d25daa04a337ccba16` — unchanged, not promoted |
| §274 successor identity | `8c163b312b291ef3b7ec361df371b86afdd92d15ae87ad71c2e06462942c4aee` — re-verified, 0 failures |
| review stack | `backend/scripts/review/review-stack.ts` |
| disposable database | `test_insite_review_1789388035052_8444`, run `08bdb7ff-b778-47cf-b9a9-cfed1c07e4a9` |
| Free account | `review-284@example.test` |
| entitled control | `review-284-pro@example.test` — **billing tier `free`, active Pro entitlement grant**, on the disposable database only |
| frontend build | production `next build` + `next start`, `NEXT_PUBLIC_FRONTEND_VERSION=1.0.0`, `DEV_AUTH_BYPASS=false`, `NEXT_PUBLIC_DEV_FORCE_PRO=false` |

---

## A. S-15 — the Free-tier Expert presentation

### What was implemented

**The presentation.** A non-entitled account now sees a plain plan surface where the enabled
control used to be:

> **HAZLENZ EXPERT REVIEW**
> **Available with Pro**
> Expert review is a second opinion on an observation you have already recorded: it reasons over the
> whole observation and returns its own hazards, controls and operational posture for a person to
> confirm or change.
> **Your HazLenz analysis above is unaffected and is the analysis this inspection uses.**
> `[ See Pro ]` → `/upgrade`

No enabled Expert action. No `role="alert"`. No error-red styling. The capability is **named**
rather than hidden, and the destination is the existing `/upgrade` route — the same one the
workspace's own "HazLenz AI analysis is available on the Pro plan" card uses. No new route, and no
new pricing copy that could drift from `components/pricing/planData.ts`.

The `See Pro` control is orange, and it is **registered** in `check:check-orange-semantics`'s
approved list in the same class as the three existing upgrade CTAs — "a capability this account
cannot reach. UNRESOLVED." The gate caught it as unregistered on the first run and was not
weakened to accept it.

**The request suppression.** `lib/expert/expertEntitlement.ts` holds one narrow fact: *the server
has already refused this client, just now.* It is armed **only** by an `EXPERT_NOT_ENTITLED` raised
from a real server response, and it is bounded three ways — cleared by `clearAuthSession()`
alongside the plan-code and billing caches, cleared immediately by any Expert call that SUCCEEDS,
and expiring on its own after five minutes so an out-of-band upgrade that raises no client event is
corrected by the next mount rather than pinned for the life of the tab.

### What it deliberately does NOT do

- **It is never armed by a plan claim.** Not by the JWT, not by `getVerifiedPlanCode()`.
  `EntitlementService` treats a live `UserSubscription` row and an active `EntitlementGrant` as
  authoritative over the token's cached claim, so a client suppressing from its own idea of the plan
  would refuse to ask on behalf of an account the server would have said yes to. That account shape
  is not hypothetical — it is the entitled control used here.
- **UNKNOWN is never denied.** A timeout, an unreachable server, a 500, or a 402 whose body did not
  name itself resolves to an ERROR — a failure to learn the state — and arms nothing.
- **The server is untouched.** The guard, the status, the body and the evidence it refuses on are
  all unchanged.

### Measured — the Free walk and the entitled falsification

`npm run validate:284-expert-entitlement-ux` — **13 passed, 0 failed.**

Both legs walk three HazLenz observations using **only the product's own controls** after a single
sign-in, so the session is one document and the client state is real. (`documentLoads: ["/login"]`.)

| | Free | Entitled control |
|---|---|---|
| Expert requests across 3 observations | **1** | **3** |
| requests on observations 2 and 3 | **0, 0** | 1, 1 |
| plan surface shown | 3 / 3 | **0 / 3** |
| enabled "Run Expert review" controls | **0 / 3** | 3 / 3 |
| `role="alert"` on the Expert surface | 0 | 0 |
| error-red styling on the Expert surface | 0 | 0 |

**The asymmetry is the evidence.** A Free account asks once and stops; an entitled account asks
every time. E3 is the falsification: if suppression ever leaked into the entitled path this gate
fails, and a client that had begun deciding entitlement for itself would be caught here rather than
in production by an upgraded customer who still could not use what they had paid for.

Screenshots: `screenshots/s15-free-light-1280.png`, `s15-free-dark-1280.png`,
`s15-entitled-control-light-1280.png`.

### The decision cases, unit-executed

`npm run test:expert-entitlement-presentation` — **31 checks.** Every case §284 named: Free,
entitled, recently upgraded (all three healing paths), recently downgraded, stale JWT in **both**
directions, server unavailable (500 / bodyless 502 / 503) and malformed entitlement response (402
with no code, empty body, unrecognised code). None of the unknown cases arms the memo or renders a
denial.

### An honest limit on the batch number

`results/batch-2H-284.json` still records **2 × 402 console entries on all 64 visits**, and that is
correct rather than a contradiction. `review-279-page-batch` reaches each target with `page.goto` —
a full document load — which destroys the client's session state between every visit, so it
measures the **unsuppressed** case by construction. It also navigates twice per target (a click
that already navigates, then an explicit `goto`), which is where the second entry comes from.
**One workspace document load makes exactly one Expert request**, measured directly. Neither number
describes a user; the in-session walk above does.

The 8 × `SETUP_NO_EXPERT_RUN_CONTROL` in that file are the repair working: there is no longer a
control to press on a Free account, so batch state H is **NOT_EXERCISED** on this tier by design.

---

## B. Entitlement audit policy

### Root cause

`EntitlementGuard` wrote one `security_audit_events` row per refusal, with `action:
'entitlement_denied'`, regardless of what the caller was trying to do. Measured:
**28 refused requests → 28 rows, 1:1.** The table therefore said the same thing about two very
different facts — "a Free account's browser rendered a paid panel and was told no", and "somebody
tried to EXECUTE a paid analysis they are not entitled to" — with the second buried under the first.

### The policy — one separation, by request method

| | action | class | rows |
|---|---|---|---|
| **mutating** denial (POST/PUT/PATCH/DELETE, and any unrecognised verb) | `entitlement_denied` | SECURITY | **one per attempt, never coalesced** |
| **safe** denial (GET/HEAD/OPTIONS) | `entitlement_read_refused` | OPERATIONAL | one per `(actor, org, entitlement, resourceType)` per 15 minutes, with every later refusal counted into that row |

**Coalescing is not sampling and discards nothing.** A burst produces one row carrying
`repeats`, `windowOpenedAt` and `lastAt` — strictly more legible than the same burst as N identical
rows, and it keeps requirement 5 rather than trading it away. The window map is bounded
(`MAX_TRACKED_READ_WINDOWS`, expired entries evicted); on overflow the oldest window is dropped,
which costs one extra row and never loses an event. An INSERT that never anchored re-inserts rather
than counting into a row that does not exist, so an audit failure cannot silence a key.

### Measured — `results/entitlement-audit-volume.json`

| | before | after |
|---|---|---|
| rows for 25 refused reads + 3 refused mutations | **28** | **4** |
| `entitlement_denied` (mutations) | 28 | **3 — one per attempt, unchanged** |
| `entitlement_read_refused` (reads) | — | **1, carrying `repeats: 24`** |
| enforcement | 402 on all 28 | **402 on all 28 — identical** |

All 25 reads are accounted for: one row plus `repeats: 24`.

### One adjacent repair, stated rather than slipped in

The audit save was `await`ed **before** the throw, so an unreachable audit table turned a correct
402 into a **500** — an infrastructure fault in the OBSERVABILITY path presenting to the customer as
a fault in the ENFORCEMENT path. It is now best-effort and cannot change the answer. The refusal is
unchanged in status, body and evidence; it is simply unconditional.

### What was NOT built, and must not be read as preserved

Two denial classes §284's requirements name are **not written by this path, and were not auditable
before this section either**:

- **Cross-tenant access** resolves through `InspectionService.authorizeObservation`, which answers
  `NotFoundException` and writes **nothing**.
- **Role/privilege violations** resolve through `RolesGuard`, which returns `false` and writes
  **nothing**.

Neither is changed here, and neither is made auditable here. Recorded so "security denials remain
auditable" is not read as a claim about those two. Building them is not a §284 task — §284 said not
to build a security analytics system — and they are the honest finding of this investigation.

`npm run test:284-entitlement-denial-audit` — 41 checks, including that **ten refused mutations
produce ten rows**, which is the requirement a future "simplification" would silently undo while
every volume measurement still looked better.

---

## C. D-043 — bounded capability review, no migration and no deletion

Full review: [`project-docs/current/D-043-ORPHAN-CLUSTER-CAPABILITY-REVIEW.md`](../../../project-docs/current/D-043-ORPHAN-CLUSTER-CAPABILITY-REVIEW.md).

**The cluster is larger than D-043 described**: 8 files, 1,599 lines. `AnnotationEditor` (800
lines) has no real consumer at all — its only inbound edge is a type-only back-import from a module
it itself imports, a cycle inside the cluster. The annotation subtree is independently unreachable,
not merely held up by `ReportCard`.

**The decisive fact**: the server has **no annotation concept whatsoever** — no column, no DTO, no
route. Annotations were never persisted through the API. Migrating the components alone would ship
annotations that exist on one device and appear in no report.

**Recommendation: B. MIGRATE_PHOTO_ANNOTATION_ONLY**, with a condition — retire `localVault` /
`offlineQueue` / `ReportCard` outright (duplicate offline authority, a device-global key with no
account namespace, and a field that reads as a security claim the product cannot make), and retain
photo annotation as a **scheduled feature with server support**, sequenced after D-042. If the
product owner will not schedule it, the honest answer is **A. RETIRE_ALL**.

---

## D. D-044 — the current four tiles, and the minimal correction

Full note: [`project-docs/current/D-044-DASHBOARD-TILES.md`](../../../project-docs/current/D-044-DASHBOARD-TILES.md).

Current set: **Inspections · Reports · Open Actions · Overdue**. Open Actions is present; the
fourth metric differs — `Reports` where the preferred set asks for `Findings`. Per direction,
**nothing was changed**. Proposal: rename `Overdue` → `Overdue Actions` (label only, free), and
schedule `Reports` → `Findings` **with** the unprivileged server aggregate it needs — a
frontend-only swap would restore exactly the structurally-zero tile §281 removed.

---

## Gates executed at §284

| gate | result |
|---|---|
| `frontend-next: npx tsc --noEmit` | **PASS** |
| `frontend-next: npm run build` (production) | **PASS** |
| `frontend-next: npm run validate:284-expert-entitlement-ux` | **PASS — 13/13**, with the entitled falsification |
| `frontend-next: npm run test:expert-entitlement-presentation` | **PASS — 31 checks** (new) |
| `frontend-next: npm run test:expert-api-failure-mapping` | **PASS** |
| `frontend-next: npm run test:expert-presentation` | **PASS** |
| `frontend-next: npm run check:expert-authority-boundary` | **PASS** |
| `frontend-next: npm run check:orange-semantics` | **PASS** — failed first as UNREGISTERED and was registered, not waived |
| `frontend-next: npm run check:page-titles` | **PASS** |
| `frontend-next: npm run check:release-contract-parity` | **PASS** |
| `frontend-next: npm run validate:279-update-delivery` | **PASS — 26/26** |
| `frontend-next: npm run test:279-release-version-check` | **PASS — 31/31** |
| `frontend-next: npm run validate:280-workspace-draft-persistence` | **PASS — 11/11** (D-035) |
| `frontend-next: npm run validate:281-offline-data-state` | **PASS — 12/12** (D-041) |
| `frontend-next: review-279-page-batch BATCH=2H` | 64 visits; see the limit stated in section A |
| `backend: npm run build` | **PASS** |
| `backend: npm run test:284-entitlement-denial-audit` | **PASS — 41 checks** (new) |
| `backend: npm run verify:274-successor-identity` | **PASS** — 22 elements, 0 failures, 0 files written |
| `backend: npm run hazlenz:verify` | **PASS** — 29/29 protected modules, 0 accepted-evidence drift; worktree byte-identical before and after |
| `backend: npm run brand:audit` | **PASS** — 0 customer-visible retired brand |

---

## Left open by direction

**D-042** — carried to the formal Pre-Production Release Register; the offline/synchronization
architecture was explicitly not implemented here.
**D-043** — recommendation returned, nothing migrated or deleted.
**D-044** — current set and proposal returned, nothing changed.
**Render auto-deploy** — not re-verified; the local credential returns 401. Recorded as requiring
fresh verification at the Pre-Production Infrastructure gate, and **no longer presented as current**.
**Preview environment secret scope** — the standing rule is recorded; it has **not** been audited.
