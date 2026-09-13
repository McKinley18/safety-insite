/**
 * §246 RELOCATION SHIM. The authoritative implementation now lives in the production tree at
 * `src/hazlenz/expert-hazlenz/contract/expert-first-pass-owed-fact-projection.ts` and is re-exported here unchanged.
 *
 * This file holds NO semantics. It exists so that the harnesses, evidence tooling and acceptance
 * orchestration under `scripts/` continue to resolve their historical import paths while the
 * dependency direction is scripts/ -> src/, never src/ -> scripts/.
 *
 * Do not add logic here. Import from the production path in new code.
 */
export * from '../../src/hazlenz/expert-hazlenz/contract/expert-first-pass-owed-fact-projection';
