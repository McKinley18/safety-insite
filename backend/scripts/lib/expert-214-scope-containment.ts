/**
 * §246 RELOCATION SHIM. The authoritative implementation now lives in the production tree at
 * `src/safescope-v2/expert-hazlenz/contract/expert-214-scope-containment.ts` and is re-exported here unchanged.
 *
 * This file holds NO semantics. It exists so that the harnesses, evidence tooling and acceptance
 * orchestration under `scripts/` continue to resolve their historical import paths while the
 * dependency direction is scripts/ -> src/, never src/ -> scripts/.
 *
 * Do not add logic here. Import from the production path in new code.
 */
export * from '../../src/safescope-v2/expert-hazlenz/contract/expert-214-scope-containment';
