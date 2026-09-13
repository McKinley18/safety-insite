# EXPERT HAZLENZ — CURRENT STATE

**Read this and `HAZLENZ_INVARIANTS.md`. That is the default context.** Together about 2,500 words.
Machine-readable equivalent: `verification/current/EXPERT-HAZLENZ-STATE.json`.

Refreshed at **§263** (2026-09-12). Supersedes the §229 text, which described a layer with no
production caller — that has not been true since §246 and is actively misleading now.

Everything below is **current truth only**. It is not a history. Evidence pointers are at the end.

---

## 1. What Expert HazLenz is

A second, semantic analysis layer that runs **alongside** deterministic HazLenz on one observation.
It may propose hazards, required controls and an immediate safety posture the deterministic engine
did not reach, and it may declare that a decision-critical fact is unresolved.

It is **advisory**. Deterministic HazLenz remains the customer-authoritative analysis path.

## 2. Current candidate

| | |
|---|---|
| identity | `0b12adf6e44e4586ec2be27c5274dafd8a36b2c1042dfe34d543b51d5be70bee` |
| label | §259 successor |
| contract | `hazlenz.expert.first-pass.259` |
| protected modules | 29 |
| verify it | `npm run hazlenz:verify` |

The identity is a digest over 22 elements. `hazlenz:verify` recomputes all of them from live source
and writes nothing.

## 3. Product integration status

**Implemented and reachable, behind the strongest authorization profile in the product.**

```
POST /inspections/observations/:id/expert-analyses
  JwtGuard · EntitlementGuard('fullSafeScope') · RolesGuard · Throttle 10/60s
```

- The server runs the deterministic analysis itself and builds the Expert input from it.
- The client may send only `idempotencyKey`, `requestVersion`, and optional `taskContext` and
  `answeredClarifications`. **No server-owned field is declarable**, so the DTO plus the global
  `whitelist + forbidNonWhitelisted` pipe rejects any attempt with 400.
- An execution row is written in `ANALYSIS_RUNNING` **before** any provider contact.
- The result is persisted with `producer = server_authored`, protected by a database CHECK
  constraint requiring a real execution row.

Source: `backend/src/safescope-v2/expert-hazlenz-product/`.

## 4. What is proven

| property | evidence |
|---|---|
| the stored server-authored analysis is what the server obtained from the frozen path | §262 |
| a client cannot author the result, in 10 attempted field forgeries or in raw SQL | §262 |
| 3 concurrent duplicates → 1 execution, 1 spender, 1 provider entry, 1 analysis | §262 case I |
| a refusal is never rendered as an available analysis | §262 case E |
| a provider failure creates no analysis row at all | §262 |
| `declarationId`, `controlId`, `dischargingControlRef`, `resolvedByDeclarationIds` survive persistence and the response | §262 H3/H4 |
| a cross-workspace caller cannot learn whether the observation exists | §262 case H, §263 |
| the transmitted system prompt is bound to the frozen candidate before attribution | §262 |

## 5. What is deliberately not proven

- **Governed citation: not exercised at all.** Every execution transmits zero governed records, so
  Expert may cite nothing. Fail-closed on purpose — the only available source of approved regulatory
  text was the client-supplied snapshot, and accepting that would let a request inject text labelled
  as governed.
- **Human confirmation and override:** the actions do not exist. §262 cases C and D are RESERVED.
- **Live provider transport from a deployed instance:** never spent.
- **Report generation:** blocked, no object storage configured.

## 6. Accepted v1.0 limitations

1. **Driver-role classification.** The model decides whether an unresolved fact controls
   continuation or is routine follow-up, and §254 saw it err toward over-restriction. The product
   does not rely on that being right — see section 7.
2. **The deterministic basis is computed twice.** The route runs its own deterministic analysis for
   Expert's premises; the inspector is looking at a separately persisted one. That is what makes the
   premises server-owned, and the two may diverge.
3. **`ANALYSIS_UNRESOLVED` covers two shapes** — a contained declaration refusal with an admitted
   posture, and a whole-output refusal with preserved truth — because §252 gives
   `PRESERVE_UNRESOLVED` precedence deliberately. The execution record distinguishes them.

## 7. The human-confirmation rule

Deterministic, computed once at persistence time, stored, never recomputed on read. It runs **only**
on an admitted analysis.

> Confirmation is REQUIRED when the admitted posture's `requiredBy` contains **either**
> (a) a `driverRole` of `UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION`, **or**
> (b) a `driverRole` of `UNRESOLVED_RESPONSE_OR_FOLLOW_UP` while the posture permits continued work.

Branch (a) catches over-restriction, the direction §254 observed. Branch (b) catches
under-restriction, which was never observed and is the dangerous direction. **Neither may be
dropped.** An unreadable posture fails closed.

## 8. Current trust boundary

| path | what the server knows |
|---|---|
| deterministic | the client calls `/safescope-v2/classify`, holds the result, posts it back. The server does **not** establish that what it stores equals what it returned. Every historical row is `client_supplied`. |
| Expert | the server ran it. `server_authored` is assigned from a literal in one service and cannot be conferred by metadata. |

## 9. Analysis states

Reachable today: `ANALYSIS_RUNNING`, `ANALYSIS_FAILED`, `ANALYSIS_REFUSED`, `ANALYSIS_UNRESOLVED`,
`ANALYSIS_AVAILABLE`, `ANALYSIS_AWAITING_CONFIRMATION`.

Unreachable until the confirmation action exists: `ANALYSIS_CONFIRMED`, `ANALYSIS_OVERRIDDEN`.

**No finding is reconciled from any Expert analysis**, confirmed or not. The API says so explicitly
(`findingsReconciled: false`).

## 10. Known environmental and live gaps

| gap | status |
|---|---|
| object storage / report generation | ENVIRONMENTALLY BLOCKED — no `STORAGE_*` set |
| live provider transport | UNVERIFIED LIVE |
| running production SHA | UNVERIFIED LIVE |
| live billing | UNVERIFIED LIVE |

`hazlenz:verify` reports these as their own outcomes. They are never converted into a pass or a
failure.

## 11. Current beta blockers

Three. See `verification/current/BETA-BLOCKERS.json` — **the only current register**. Historical
`RELEASE_BLOCKERS.md` files under `verification/` record blockers that were live at the time and are
not current status.

1. no human-confirmation action
2. no Expert frontend
3. report generation blocked (environmental, can be worked in parallel)

## 12. Next implementation step

**The human-confirmation action and the override action.** Blocked until product-owner
authorization. `ANALYSIS_AWAITING_CONFIRMATION` is reachable and nothing can move an analysis out of
it.

## 13. Safe commands

```
npm run hazlenz:status              what state are we in            (reads, computes nothing)
npm run hazlenz:verify              is that state true              (read-only, 0 provider calls)
npm run hazlenz:check               after a small change            (verify + unit + build)
npm run hazlenz:integration:test    route/auth/idempotency          (creates and drops its own DB)
npm run hazlenz:precommit           before an authorized commit     (everything except live)
npm run hazlenz:evidence            did accepted evidence change
```

**Before running any other `verification`-adjacent script**, check
`verification/current/MUTATING-SCRIPTS.json`. 252 scripts write into accepted historical evidence
packages and 101 more have write behaviour a static reader could not resolve. §258 ran two of them
without noticing.

## 14. Evidence pointers

Do not load these for ordinary development.

| what | where |
|---|---|
| candidate identity §259 | `verification/expert-hazlenz-259-carrier-coherence-2026-09-12/` |
| product integration architecture §260 | `verification/expert-hazlenz-260-.../` |
| persistence and authority foundation §261 | `verification/expert-hazlenz-261-.../` |
| authoritative route §262 | `verification/expert-hazlenz-262-.../` |
| recall optimization §263 | `verification/expert-hazlenz-263-.../` |
| historical archive index (142 directories) | `verification/expert-hazlenz-229-.../SECTION-229-HISTORICAL-ARCHIVE-INDEX.md` |
| what to read for a given task | `docs/hazlenz/current/CONTEXT_INDEX.md` |
| rules that must not be violated | `docs/hazlenz/current/HAZLENZ_INVARIANTS.md` |
