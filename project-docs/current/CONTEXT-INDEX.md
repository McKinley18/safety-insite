# CONTEXT INDEX — WHAT TO READ, AND WHERE THINGS LIVE

Read the smallest set that answers the question in front of you. Loading the validation archive into
an ordinary development prompt is the single largest avoidable token cost in this repository.

Refreshed at **§263**, extended at **§265**. The §229 version of this file pointed at `backend/scripts/lib/` as the home
of the live contract; that has been wrong since §246 productionized it into `src/`.

---

## ALWAYS READ

- `project-docs/current/CURRENT-STATE.md`
- `project-docs/architecture/HAZLENZ-INVARIANTS.md`

Read `project-docs/current/TEST-TIERS.md` when you need to know which suite to run.

About 2,500 words. That is the whole default context. For a machine consumer the equivalent is
`verification/current/EXPERT-HAZLENZ-STATE.json`, and `npm run hazlenz:status` prints it.

---

## DIRECTORY MAP

| domain | where | note |
|---|---|---|
| **Expert engine (candidate-defining)** | `backend/src/hazlenz/expert-hazlenz/` | contract, projections, admission, owed facts, the production entry point. **Changing anything here moves the candidate identity.** |
| **Expert transport adapters** | `backend/src/hazlenz/expert-hazlenz-adapters/` | the vendor lives here and nowhere else |
| **Product integration** | `backend/src/hazlenz/expert-hazlenz-product/` | routes, execution service, authority, persistence, confirmation rule, response, the effective-decision service and its leaf module |
| **Expert frontend** | `frontend-next/lib/expert/` and `frontend-next/components/inspection/expert/` | §265. Presentation and decision capture. Derives no authority; a source check enforces that. |
| **Deterministic HazLenz** | `backend/src/hazlenz/` (the rest) | the customer-authoritative path |
| **Migrations** | `backend/src/database/migrations/` | §261 added `1800000019000-ExpertAnalysisAuthorityFoundation` |
| **Current verification and tooling** | `backend/scripts/hazlenz/` | the §263 command surface; everything here is read-only except the disposable-DB wrapper |
| **Release / update delivery** | `backend/src/common/release-contract.ts` + `release-identity.ts`, `frontend-next/lib/release/` | §279. The compatibility rule (mirrored, parity-checked), `GET /version`, the client's version check and write gate. Architecture: `project-docs/current/UPDATE-DELIVERY.md` |
| **Page-by-page product review** | `project-docs/current/PAGE-BY-PAGE-PRODUCT-REVIEW.md` | §279/§280/§281. Every active route, its status, and the batch order. **Route classification is measured from customer reachability, not filesystem presence** (§281 D-038). Evidence: `verification/current/page-review-279/` (batch 1), `page-review-280/` (batch 2), `page-review-281/` (batch 3) |
| **Route reachability** | `frontend-next/scripts/measure-281-route-reachability.mjs` | §281 D-038. An anchor crawl AND a source-reachability fixpoint must BOTH miss a route before it is called an orphan. A crawl alone reported the product's most-used page as dead |
| **HazLenz decision presentation** | `frontend-next/lib/inspection/hazlenzDecisionPresentation.ts` + `components/inspection/HazLenzDecisionSummary.tsx` | §281 D-040. The engine's `criticalUnknowns`, `multiHazardReview` and `confidenceLimitReason`, projected for a reader. **It copies; it never authors safety semantics.** The one thing it decides is structural: whether the analysis names an unresolved decision-controlling fact |
| **Offline data-state vocabulary** | `frontend-next/lib/data/dataState.ts` | §281 D-041. `CURRENT` · `LAST_SYNCED` · `PENDING_SYNC` · `OFFLINE_UNAVAILABLE` · `SYNC_CONFLICT`. Unknown data is never a verified zero, enforced structurally by `resolveDataValue`. Gate: `validate:281-offline-data-state`. **Not** the D-037 sync architecture and must not become one |
| **Page titles** | `frontend-next/lib/pageTitles.ts` | §280 D-031. The ONE table of page names. Each route's `layout.tsx` reads it; no title string is written anywhere else. Gate: `check:page-titles` |
| **Page shell** | the `§280 (D-036.1)` block at the end of `frontend-next/app/globals.css` | One content column (1120px) and one gutter, owned by `.sentinel-app-main`. `.insite-page-wide` is the deliberate wide variant |
| **The anchor reset** | the `@layer base { a { … } }` block in `frontend-next/app/globals.css` | §281 D-039. It **must stay layered.** Unlayered, it beats every Tailwind utility and silently defeats the colour on almost every anchor in the product — including the navigation's active-item indicator. Census: `measure:281-anchor-styles` |
| **System states** | `frontend-next/app/{not-found,error,global-error,loading}.tsx` + `components/system/SystemStatePanel.tsx` | §280 D-034. One presentation for all four |
| **Workspace draft recovery** | `frontend-next/lib/inspection/workspaceDraft.ts` | §280 D-035. LOCAL RECOVERABLE state, never committed state. Gate: `validate:280-workspace-draft-persistence` |
| **Offline current state** | `project-docs/current/OFFLINE-FIELD-OPERATION.md` | §280 D-037. Inventory only. Readings: `measure:280-offline-inventory` |
| **The review stack** | `backend/scripts/review/review-stack.ts`, `npm run review:stack` | §280. Registered disposable database, no auth bypass, no provider key in the child environment |
| **Current state, machine-readable** | `verification/current/` | state, capability register, beta register, mutating-script registry, evidence baseline |
| **Historical evidence** | `verification/expert-hazlenz-*/` | frozen. Never edited, never deleted. |
| **Superseded contract ancestry** | `backend/scripts/lib/` | kept because byte-for-byte identity reconstruction depends on the additive chain. **Not a current entry point.** |
| **Superseded state package** | `docs/hazlenz/validation/superseded-209/` | pre-§209, archived at §229 |

---

## WHEN MODIFYING THE EXPERT CONTRACT OR PROMPT

- `backend/src/hazlenz/expert-hazlenz/contract/expert-259-control-identity-contract.ts` — the
  current first-pass contract and wire schema
- `backend/src/hazlenz/expert-hazlenz/contract/expert-first-pass-instruction-vnext.ts` — the
  user prompt builder
- `backend/src/hazlenz/expert-hazlenz/expert-contract.types.ts` — input contract types

Do not read the ancestor instruction modules (`210b2`, `210c`, `210e`, `210g`, `247`, `253`) unless
you are changing the additive chain itself. §259 composes them.

**Any change here moves the candidate identity.** Run `npm run hazlenz:verify` before and after and
expect it to change deliberately, not by surprise.

## WHEN MODIFYING ADMISSION, PROJECTION OR RR-7

- `contract/expert-252-structural-admission.ts` — the whole-output conformance gate and disposition
- `contract/expert-239-posture-projection.ts` — posture projection
- `contract/expert-210j-declaration-projection.ts` — declaration projection and RR-7 preservation
- `contract/expert-235-wire-normalization.ts` — container normalization, never repair

## WHEN MODIFYING THE VERIFIER

- `contract/expert-218-property-review-contract.ts` — response schema
- `contract/expert-218-property-instruction.ts` — system prompt
- `contract/expert-212-verifier-payload.ts` — payload construction

## WHEN MODIFYING THE PRODUCT INTEGRATION

- `expert-hazlenz-product/expert-analysis.controller.ts` — the one route and its guard profile
- `expert-hazlenz-product/expert-analysis-execution.service.ts` — orchestration; the ONLY thing that
  can reach a provider
- `expert-hazlenz-product/expert-analysis.service.ts` — authority, persistence, audit. **Has no
  provider dependency, deliberately and checkably.**
- `expert-hazlenz-product/expert-analysis-context.ts` — what the server establishes for itself
- `expert-hazlenz-product/expert-confirmation-rule.ts` — the deterministic confirmation rule

Then: `npm run hazlenz:check`, and `npm run hazlenz:integration:test` before a commit.

## WHEN MODIFYING THE EXPERT FRONTEND

- `frontend-next/lib/expert/expertPresentation.ts` — the ONLY place a server response becomes
  something renderable. The authority fields are copied, never computed.
- `frontend-next/lib/expert/expertApi.ts` — the three calls; sends only accepted request fields
- `frontend-next/components/inspection/expert/ExpertAnalysisPanel.tsx` — the eight state views
- `frontend-next/components/inspection/expert/ExpertConfirmationCard.tsx` — confirm and change

Then, from `frontend-next/`: `npm run test:expert-presentation` and
`npm run check:expert-authority-boundary`. The second is what stops a second authority derivation
from appearing somewhere the first does not look.

## WHEN ADDING A DOWNSTREAM CONSUMER OF AN EXPERT CONCLUSION

Ask `ExpertEffectiveDecisionService`. Do not read `analysisState`, `confirmationRequired` or
`resultSnapshot` to work out whether a conclusion may be acted on — that is the second opinion
`deriveEffectiveDecision` exists to make unnecessary. `InspectionService.finalizeFinding` is the
worked example, added at §265.

## WHEN VERIFYING THE BASELINE

```
npm run hazlenz:verify
```

One command. Recomputes the candidate identity from live sources, checks the 29 protected modules,
runs the evidence-integrity guard, and confirms the current-state manifest still agrees with all of
it. Zero provider calls, zero database operations, and it writes nothing.

The §229-era pair `verify-229-protected-identities.ts` and `run-229-protected-ladder.ts` still exist
and are still correct for their own baseline. They are not the current entry point.

---

## BEFORE RUNNING ANY OTHER VERIFICATION SCRIPT

Check `verification/current/MUTATING-SCRIPTS.json`.

252 scripts write into accepted historical evidence packages. 101 more have write behaviour that a
static reader could not resolve, and are therefore sandbox-required by default. §258 ran two of them
and did not notice, because the bytes happened to match that time; §259 ran the same two and the
numbers moved.

Regenerate the registry with `npm run hazlenz:scripts:classify -- --write` after adding a script.

---

## READ HISTORICAL VALIDATION EVIDENCE ONLY WHEN

- investigating the provenance of a pinned identity or digest;
- reproducing a historical defect;
- auditing a frozen decision;
- changing an invariant that a specific piece of evidence established.

**Start at the archive index**, not at a directory listing:
`verification/expert-hazlenz-229-baseline-compartmentalization-2026-09-11/SECTION-229-HISTORICAL-ARCHIVE-INDEX.md`.

Never load a raw `*.jsonl` provider leg, a `RAW-*` file, or a frozen preregistration into a prompt.
Query it with a script and read the answer.

---

## DO NOT READ BY DEFAULT

- `docs/INSITE_ENGINEERING_BLUEPRINT.md` — about 308,000 words. Grep it; never load it.
- `docs/hazlenz/validation/superseded-209/*` — pre-§209, archived at §229.
- `docs/hazlenz/governance/SOURCE_OF_TRUTH_MAP.md` — §223. Superseded twice: by the §229 map, and
  by the directory map above. Its statement that Expert "has no NestJS consumer at all" has been
  false since §246.
- `docs/hazlenz/governance/REPOSITORY_COMPARTMENTALIZATION_PLAN.md` — §223 proposals; §229 measured
  them and refused most of the moves.
- Any `verification/**` directory, unless one of the four reasons above applies.
