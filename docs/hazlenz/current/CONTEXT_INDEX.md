# CONTEXT INDEX — WHAT TO READ, AND WHERE THINGS LIVE

Read the smallest set that answers the question in front of you. Loading the validation archive into
an ordinary development prompt is the single largest avoidable token cost in this repository.

Refreshed at **§263**. The §229 version of this file pointed at `backend/scripts/lib/` as the home
of the live contract; that has been wrong since §246 productionized it into `src/`.

---

## ALWAYS READ

- `docs/hazlenz/current/EXPERT_HAZLENZ_CURRENT_STATE.md`
- `docs/hazlenz/current/HAZLENZ_INVARIANTS.md`

Read `docs/hazlenz/current/TEST_TIERS.md` when you need to know which suite to run.

About 2,500 words. That is the whole default context. For a machine consumer the equivalent is
`verification/current/EXPERT-HAZLENZ-STATE.json`, and `npm run hazlenz:status` prints it.

---

## DIRECTORY MAP

| domain | where | note |
|---|---|---|
| **Expert engine (candidate-defining)** | `backend/src/safescope-v2/expert-hazlenz/` | contract, projections, admission, owed facts, the production entry point. **Changing anything here moves the candidate identity.** |
| **Expert transport adapters** | `backend/src/safescope-v2/expert-hazlenz-adapters/` | the vendor lives here and nowhere else |
| **Product integration** | `backend/src/safescope-v2/expert-hazlenz-product/` | route, execution service, authority, persistence, confirmation rule, response |
| **Deterministic HazLenz** | `backend/src/safescope-v2/` (the rest) | the customer-authoritative path |
| **Migrations** | `backend/src/database/migrations/` | §261 added `1800000019000-ExpertAnalysisAuthorityFoundation` |
| **Current verification and tooling** | `backend/scripts/hazlenz/` | the §263 command surface; everything here is read-only except the disposable-DB wrapper |
| **Current state, machine-readable** | `verification/current/` | state, capability register, beta register, mutating-script registry, evidence baseline |
| **Historical evidence** | `verification/expert-hazlenz-*/` | frozen. Never edited, never deleted. |
| **Superseded contract ancestry** | `backend/scripts/lib/` | kept because byte-for-byte identity reconstruction depends on the additive chain. **Not a current entry point.** |
| **Superseded state package** | `docs/hazlenz/validation/superseded-209/` | pre-§209, archived at §229 |

---

## WHEN MODIFYING THE EXPERT CONTRACT OR PROMPT

- `backend/src/safescope-v2/expert-hazlenz/contract/expert-259-control-identity-contract.ts` — the
  current first-pass contract and wire schema
- `backend/src/safescope-v2/expert-hazlenz/contract/expert-first-pass-instruction-vnext.ts` — the
  user prompt builder
- `backend/src/safescope-v2/expert-hazlenz/expert-contract.types.ts` — input contract types

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
