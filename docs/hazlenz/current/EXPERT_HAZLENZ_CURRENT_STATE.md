# EXPERT HAZLENZ — CURRENT STATE

**Read this and `HAZLENZ_INVARIANTS.md`. That is the default context.** Together about 2,500 words.
Machine-readable equivalent: `verification/current/EXPERT-HAZLENZ-STATE.json`.

Refreshed at **§265** (2026-09-12). Supersedes the §229 text, which described a layer with no
production caller — that has not been true since §246.

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
POST /inspections/observations/:id/expert-analyses                          execute
POST /inspections/observations/:id/expert-analyses/:analysisId/settlement   confirm or override
GET  /inspections/observations/:id/expert-analyses/current                  read state   §265

all three: JwtGuard · EntitlementGuard('fullSafeScope') · RolesGuard · Throttle
```

The read carries the same profile as the two writes deliberately — a read of a safety analysis is
not a lesser act than producing one — and it writes nothing, so refreshing an interface cannot
spend. It exists because a browser holds nothing after a reload: without it the only ways to learn
an analysis's state are to re-execute it or to keep believing a cached copy.

The settlement route serves confirm and override as **one** action with two outcomes: one
eligibility rule, one concurrency guarantee, one audit path, one state-machine edge.

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
| a reviewer can confirm a pending classification, and the Expert result stays byte-identical | §264 case C |
| a reviewer can replace it, and the human value becomes authoritative while the proposal is preserved | §264 case D |
| two co-authorized reviewers racing one pending analysis produce exactly one settlement | §264 N13 |
| a retry creates no duplicate review or audit row | §264 C-13 |
| a settled state cannot be minted without a real review row | `ck_hazlenz_analysis_settlement` |
| the browser withholds an unsettled conclusion, and fails closed with no derivation at all | §265 case K |
| a finding cannot be finalized from an unsettled Expert analysis — 0 findings, 0 corrective actions | §265 case L |
| the same review finalizes once a person settles it | §265 case M |
| an override is consumed as the human value, never the Expert proposal | §265 case N |

## 5. What is deliberately not proven

- **Governed citation: not exercised at all.** Every execution transmits zero governed records, so
  Expert may cite nothing. Fail-closed on purpose — the only available source of approved regulatory
  text was the client-supplied snapshot, and accepting that would let a request inject text labelled
  as governed.
- **The frontend against a deployed instance:** §265 built the workflow and proved it against the
  local stack over real HTTP with a substituted transport. No deployed instance has served it.
- **Downstream activation beyond one consumer.** §265 activated **finding finalization** and
  nothing else. The other five consumers §260 section 11 names — completion readiness,
  corrective-action creation, report finalization and export, notifications, the executive summary
  — are **contained** rather than guarded: they reach an Expert conclusion only through a finalized
  finding today, and a future feature that reads an analysis directly would bypass that. A settled
  analysis still reconciles **zero** findings; the guard **refuses**, it does not create.
- **Reviewer revision of a settled analysis.** Not built. One settlement per analysis, carried as a
  deferred product decision rather than as a claim that the decision is permanently irreversible.
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

## 9. Analysis states and the human boundary

All eight states are reachable as of §264.

```
ANALYSIS_AWAITING_CONFIRMATION --confirm--> ANALYSIS_CONFIRMED
                               --change---> ANALYSIS_OVERRIDDEN
```

A reviewer settles the **named classification entries** the rule fired on, keyed by `refKind:ref`,
answering in a two-member closed vocabulary: `CONTROLS_WHETHER_WORK_CONTINUES` or
`DOES_NOT_CONTROL_WHETHER_WORK_CONTINUES`. They do not re-author the analysis, and hazard
identification, citations, control text, declarations, raw output and provenance are **not
addressable** by the action.

The human decision lives in `human_reviews` under two new decision values. The Expert result is
**never rewritten** by settlement: `resultSnapshot` still holds exactly what the server obtained, so
the proposal and the decision remain separately attributable.

**No finding is reconciled from any Expert analysis**, settled or not. The API says so explicitly
(`findingsReconciled: false`). §265 did not change that. What it added is the opposite act: a
finding that cites a server-authored Expert analysis cannot be **finalized** unless that analysis
carries a settled conclusion.

## 9b. The effective decision — ask this, do not reconstruct it

`ExpertAnalysisService.effectiveDecisionFor(analysis)` is the one derivation of whether an analysis
carries a settled operational conclusion. It is total over the state vocabulary with no default
branch, and it distinguishes five different reasons for *no* conclusion — awaiting a human, refused,
refused with truth preserved, unavailable, still running — so a consumer can never flatten them into
"no hazards".

Downstream features must consume it rather than reading `analysisState` themselves.

§265 moved the derivation and its one settlement lookup into `ExpertEffectiveDecisionService`, in a
leaf module that imports two repositories and nothing else. The reason is structural: the first real
consumer is `InspectionService.finalizeFinding`, and the Expert product module already imports
`InspectionModule` — leaving the derivation there would have forced the consumer to re-derive
authority locally to escape the cycle, which is the exact failure the function exists to prevent.
There is still one implementation; it is now reachable from both sides.

## 10. Known environmental and live gaps

| gap | status |
|---|---|
| object storage / report generation | ENVIRONMENTALLY BLOCKED — no `STORAGE_*` set |
| live provider transport | UNVERIFIED LIVE |
| running production SHA | UNVERIFIED LIVE |
| live billing | UNVERIFIED LIVE |

`hazlenz:verify` reports these as their own outcomes. They are never converted into a pass or a
failure.

## 10b. The frontend, as of §265

`frontend-next/components/inspection/expert/`, reached from the HazLenz step of the inspection
workspace. It is **additive**: the deterministic analysis is unchanged and is still rendered in full
beneath it.

**The browser derives no authority.** `lib/expert/expertPresentation.ts` copies
`effectiveDecision.settledForUse`, `confirmationRequired` and the server's confirmation subject
rather than computing any of them. The single line that matters is a copy, not an expression:

```ts
const mayPresentAsSettled = decision?.settledForUse === true;
```

`frontend-next/scripts/check-expert-frontend-authority-boundary.mjs` fails if that line becomes an
expression, if a state name is used to produce an authority flag anywhere in the feature, if the
driver-role vocabulary appears, if a server-owned field is added to a request body, or if an
Expert result is routed through the legacy `saveAnalysisSnapshot` path. It was checked against a
deliberately reintroduced violation and failed, so it is a live guard rather than a decoration.

All eight states render distinctly. `ANALYSIS_FAILED` is reachable only from the execution
response — a provider failure writes no analysis row — so the execution response is adapted into
the read shape and passed through the same total state map rather than through a second presenter.

## 11. Current beta blockers

**One.** See `verification/current/BETA-BLOCKERS.json` — **the only current register**. Historical
`RELEASE_BLOCKERS.md` files under `verification/` record blockers that were live at the time and are
not current status.

1. report generation blocked (environmental, can be worked in parallel)

§265 closed `NO_EXPERT_FRONTEND`.

## 12. Next implementation step

**Beta readiness closure review.** Carried forward, none of it blocking the local workflow: the
remaining five §260 section 11 downstream guards; the governed-evidence loader; reviewer revision of
a settled analysis; and everything under section 10 that needs a live environment.

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
| human confirmation boundary §264 | `verification/expert-hazlenz-264-.../` |
| frontend workflow and first downstream consumer §265 | `verification/expert-hazlenz-265-.../` |
| historical archive index (142 directories) | `verification/expert-hazlenz-229-.../SECTION-229-HISTORICAL-ARCHIVE-INDEX.md` |
| what to read for a given task | `docs/hazlenz/current/CONTEXT_INDEX.md` |
| rules that must not be violated | `docs/hazlenz/current/HAZLENZ_INVARIANTS.md` |
