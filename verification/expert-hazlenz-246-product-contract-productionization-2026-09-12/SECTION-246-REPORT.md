# §246 — Expert HazLenz Product Contract Productionization: Final Report

Zero provider calls. Zero database operations. No commit, no push, no tag, no deploy.

## Terminal

    EXPERT_HAZLENZ_CANONICAL_PRODUCT_ARCHITECTURE_ESTABLISHED —
    BOUNDED_REMEDIATION_REBASE_AUTHORIZATION_REQUIRED

Productionization completed without semantic redesign, with one residual named below that requires
separate authorization because it reaches a protected module.

## Required report fields

| Field | Value |
|---|---|
| Product Expert contract | §239/§243 semantic contract |
| Existing competing src Expert | RETAINED AS CANONICAL BASE LAYER — see residual |
| Semantic source of truth | `backend/src/safescope-v2/expert-hazlenz/contract/` |
| Production Expert entry point | `backend/src/safescope-v2/expert-hazlenz/expert-hazlenz-analysis.ts` |
| Acceptance entry point | `backend/scripts/lib/expert-243-assembly.ts`, resolving to the production tree through shims |
| Same semantic implementation | YES |
| 42-module closure mapped | 42 / 42, plus 4 further modules the production path reaches — 46 classified |
| Modules promoted to src | 39 (13,035 lines) |
| Validation-only modules retained under scripts | 7 (6,504 lines) |
| Semantic logic remaining exclusively under scripts | 0 |
| Production caller exists | YES |
| Production build | PASS — emits 1,110 files, with exactly 1 frozen known error |
| Strict-schema production/acceptance parity | YES |
| Canonical request envelope | `backend/src/safescope-v2/expert-hazlenz-adapters/expert-request-envelope.ts` |
| K6 schema strategy | `anyOf` + `const` (authorized; NOT implemented in §246) |
| K6 provider compatibility locally proven | YES |
| Candidate Identity v2 bound elements | 17 / 17 |
| Competing Expert semantic paths | 1 residual, with no production caller |
| Protected semantic regressions | 0 |
| Provider calls | 0 |
| Database operations | 0 |
| `property-authority.ts` modified | NO |
| `settlement-review.ts` modified | NO |
| §243 result changed | NO — D HOLD RELEASE preserved |
| Commit / push / tag / deploy | NONE |

## What changed, in one paragraph

The 39-module semantic contract that §233 through §243 developed and validated now lives in the
production build at `src/safescope-v2/expert-hazlenz/contract/`. It was relocated, not rewritten: 26
modules are byte-identical to their pre-move bytes and 13 differ only on import-path lines, proved
mechanically rather than asserted. The historical `scripts/lib/` paths hold one-line re-export shims,
so roughly three hundred existing harness consumers keep working while the dependency direction is
now `scripts/ → src/` and never the reverse. A production entry point, a canonical provider request
envelope and a vendor transport were added. Seven modules totalling 6,504 lines of acceptance
instrument — frozen truth, cohort, gates, preregistration, protocols, the §208 recovery harness and
the §243 assembly — stayed behind, and the product cannot reach them.

## The three findings that shaped the migration

**The base contract is not a rival.** §245 read `expert-prompt.ts` as a competing implementation
because it contains no `driverRole`, `immediateSafetyPosture`, `requiredBy` or
`unresolvedFactDeclarations`. The dependency map shows why: it is the **base layer the validated
chain extends**. `expert-first-pass-instruction-vnext.ts` imports its system prompt, wire schema and
user prompt and reconstructs each byte for byte, and every later layer does the same to its own base.
Deleting it would have deleted the foundation of the contract just designated as the product. It is
retained as the first link of the one chain.

**Two string constants nearly moved the acceptance instrument into the product.** The §243 assembly
imports only `VERIFIER_TOOL_NAME` and `VERIFIER_TOOL_DESCRIPTION` from
`expert-208b-verifier-recovery.ts`, a §208 recovery harness that imports the 3,836-line frozen truth
specification and the §207 preregistration. Promoting the harness to carry two strings would have
shipped the frozen cohort truth. The tool identity was restated byte-identically in the entry point
and the harness stayed under `scripts/`. That single decision is the difference between promoting
13,035 lines and 18,792.

**The closure to promote was not the closure §245 counted.** §245's 42 modules are what the assembly
imports. The production path also needs what the *executor* and the *derivation* call: the §233 and
§239 posture projections, §235 wire normalization and §218 property consistency. A map built from the
assembly alone would have promoted the request builders and left the validators behind.

## Verification actually executed

| Suite | Result |
|---|---|
| `test-246-productionization` (new) | 31 passed, 0 failed |
| `test-expert-nocall-harness` | 141 passed, 0 failed — now scans 84 files including the promoted contract |
| `test-239-contract-binding-closure` | 336 passed, 0 failed |
| `test-237-posture-closure` | 204 passed, 0 failed |
| `test-235-posture-stabilization` | 209 passed, 0 failed |
| `test-220-kr1-property-authority` | 43 / 43 pass, 0 fail |
| `test-224-declaration-capability` | 33 passed, 0 failed |
| `test-226-property-selection-capability` | 31 passed, 0 failed |
| `test-218-structured-property-verifier` | 106 passed, **7 failed** — all path-scanning, see below |
| production build `npx tsc` | emits 1,110 files; 1 error, the frozen one |

The §237 and §239 suites are run transpile-only. The frozen `TS2552` at
`expert-237-posture-contract.ts(193,47)` is a reference to `POSTURE_REF_KINDS_237`, a constant that
never existed. It is disclosed by §239, recorded in `TYPESCRIPT_PROVENANCE_240` as one of two known
pre-existing errors, erased at emit, and has no runtime effect — which the suite results confirm. It
was not repaired: the authorization permits the build to pass subject only to explicitly frozen known
technical debt, and repairing a frozen module is a product-owner decision.

The production build emitted **1,110** files against the 1,071 that `TYPESCRIPT_PROVENANCE_240`
records for the pre-migration tree. The delta is exactly 39.

## The seven §218 failures, classified

None is a semantic regression. Six are module digest pins computed by historical path, which now
resolve to shims. The seventh, C15, has three conjuncts; the two semantic ones are unaffected and the
third is a regex over concatenated source text at those same historical paths. The rule C15 protects —
the §210E whole-field filler rule, `isNonSemanticFiller` — is present and unchanged in the promoted
module, which §246 check G2 asserts directly against the production tree. Repointing the pins is
mechanical and was deliberately left to the rebase so this section changed no suite it did not have to.

## The residual, stated plainly

The base contract can still be **run on its own**: `expert-runner.ts` calls a provider,
`expert-normalization.ts` validates against the base schema, and `mergeExpertIntelligence` places the
result beside protected authority — producing Expert conclusions with none of the §210J/§233/§235/
§237/§239 layers. That path has no production caller and never had one, and §246 created none for it.
The single production-callable path is `runExpertHazLenzAnalysis` on the full §239 chain.

Reducing this to zero means deleting the base-only run path or binding it behind an explicit
development-only boundary. Both touch `anthropic-expert-provider.ts`, which sits inside the frozen
29-module protected composite and which §246 did not name. A protected module is a stop-and-ask
boundary, so it is reported rather than done. The recommended disposition is the development-boundary
pattern the repository already uses at `owed-facts/verifier-v3-development-boundary.ts`.

## Disclosed consequences of the new lineage

The 29-module protected composite recomputes to `d5d66f2e46741af29b9a000ab9b18837d65fdfcbb5a67dadeac58c2670b45536`
against the frozen `37ce9eb8…`, because 8 of its members now resolve through shims. This is the new
development successor lineage the authorization creates. **No protected digest was rewritten**, no
claim of identity continuity is made, and the pre-move SHA-256 of all 39 modules was captured before
the move so the historical lineage stays independently verifiable. Running
`verify-229-protected-identities.ts` regenerated the untracked derived file
`PROTECTED-IDENTITIES.json` at the repository root.

`tsconfig.scripts-239.json` and `tsconfig.scripts-240.json` scope by glob over `scripts/lib` and now
match shims rather than the implementation. They were left unedited for the same reason as the §218
pins.

## Working-tree changes

Added, all untracked:

    backend/src/safescope-v2/expert-hazlenz/contract/                     39 modules, relocated
    backend/src/safescope-v2/expert-hazlenz/expert-hazlenz-analysis.ts    production entry point
    backend/src/safescope-v2/expert-hazlenz-adapters/expert-request-envelope.ts
    backend/src/safescope-v2/expert-hazlenz-adapters/expert-semantic-transport.ts
    backend/scripts/test-246-productionization.ts                         migration proof suite
    verification/expert-hazlenz-246-product-contract-productionization-2026-09-12/

Rewritten in place: 39 files under `backend/scripts/lib/`, each reduced from its implementation to a
one-line re-export shim. Regenerated: `PROTECTED-IDENTITIES.json`.

No tracked file was modified. The pre-existing uncommitted modifications under `backend/src/` and
`backend/scripts/` that were present before §246 are untouched.

## What remains

The bounded remediation plan from §245 must now be rebased on this architecture: driver-role
justification, the K6 `anyOf` + `const` change, the decision-complete review artifact, the
`property-authority.ts` and `settlement-review.ts` modifications, and the hosted confirmation. The
§245 authorization to modify those two protected modules remains **unconsumed** and was not used here.

Two items belong with that rebase rather than with this section: repointing the §218 digest pins and
the scoped tsconfig globs at the production tree, and building a replay transport so an acceptance
harness drives `runExpertHazLenzAnalysis` directly rather than resolving to the same modules through
shims.

This is an architecture result. It is not release acceptance. No successor candidate has been frozen,
no acceptance has been run against the productionized path, and §243 stands at D HOLD RELEASE.

STOP.
