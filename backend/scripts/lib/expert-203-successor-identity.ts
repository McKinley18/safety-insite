/**
 * §203 EXPERT HAZLENZ -- SUCCESSOR DEVELOPMENT CONTRACT IDENTITY. DEVELOPMENT ONLY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT REACHABLE FROM PRODUCTION.
 *
 * ==================== WHY THIS MODULE EXISTS ====================
 *
 * §202 wrote five category-A authority-boundary guards as pure functions and correctly refused to
 * apply their call-site insertions, because every insertion lands on a source file whose sha256 is
 * frozen historical experimental identity (§187 `owedFactSourceHashes` and its companions). The
 * product owner ruled (§203 Ruling 1):
 *
 *     THE §187 HASHES REMAIN VALID AND IMMUTABLE. CREATE A SUCCESSOR DEVELOPMENT CONTRACT THAT MAY
 *     REPRODUCE THE PINNED IMPLEMENTATION AND ADD THE NEWLY AUTHORIZED RECEIVING-BOUNDARY GUARDS,
 *     UNDER A NEW EXPLICIT VERSION IDENTITY, WITH ITS OWN SOURCE MANIFEST, ITS OWN INTEGRITY GATE,
 *     AND ITS OWN TEST EVIDENCE.
 *
 * This module IS that new version identity, held as code rather than prose so a suite can assert
 * lineage instead of trusting a document. It decides nothing at runtime and is imported by the §203
 * manifest generator and integrity gate.
 *
 * ==================== WHAT "SUCCESSOR" MEANS HERE ====================
 *
 * Historical §187 behavior remains reproducible byte-for-byte: every ancestor file below is
 * UNMODIFIED and its hash is re-asserted by `verify-203-source-integrity.ts` as ANCESTOR evidence,
 * separately from successor-file drift. The successor modules are NEW files. No production or
 * historical caller is rewired by §203; migration is a future, separately authorized step.
 */

export const SUCCESSOR_CONTRACT_VERSION = 'hazlenz.expert.203-successor-boundary.v1' as const;

/** Lineage vocabulary. Closed, so the manifest generator can count rather than trust. */
export const SUCCESSOR_LINEAGES = ['NEW', 'WRAPS', 'COPIED_FROM'] as const;
export type SuccessorLineage = (typeof SUCCESSOR_LINEAGES)[number];

export interface AncestorPin {
  /** Repo-relative path, from the repository root. */
  readonly path: string;
  /** sha256 of the file bytes, recomputed 2026-09-07 and equal to the frozen pin. */
  readonly sha256: string;
  /** WHERE the freeze authority lives. */
  readonly pinnedBy: string;
  /** The frozen contract-version constant the ancestor declares, where it declares one. */
  readonly ancestorVersion: string | null;
}

/**
 * The frozen ancestry. Every hash below was recomputed from the actual file bytes on 2026-09-07 by
 * the §203 orchestration (not copied from a task description) and matched its frozen pin exactly.
 */
export const ANCESTOR_PINS: readonly AncestorPin[] = [
  {
    path: 'backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types.ts',
    sha256: '102d059bc477270d6e7286c4a6bf197093eaae443839b29205e5b90a9311e30a',
    pinnedBy: '§187 PREREGISTRATION.json owedFactSourceHashes (verification/'
      + 'expert-hazlenz-required-structured-verifier-validation-2026-09-05), re-asserted by the '
      + 'verify-188..199 source-integrity scripts',
    ancestorVersion: null,
  },
  {
    path: 'backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-ledger.ts',
    sha256: '4fe3319046281bdbc6e527aad04042fa3892e4b4117a5a9c2362141144ab3701',
    pinnedBy: '§187 PREREGISTRATION.json owedFactSourceHashes, re-asserted by verify-188..199',
    ancestorVersion: null,
  },
  {
    path: 'backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-binding.ts',
    sha256: 'e25f1fa807d4ffd4b976670e71766e371e959682eb341f5ed07cc24c6e1cd3e0',
    pinnedBy: '§187 PREREGISTRATION.json owedFactSourceHashes, re-asserted by verify-188..199',
    ancestorVersion: 'hazlenz.expert.owed-fact-binding.runtime.v1',
  },
  {
    path: 'backend/src/safescope-v2/expert-hazlenz/owed-facts/verifier-v3-development-boundary.ts',
    sha256: '5273d5af08693be8096746da03eaba8bd046fd8bfd42c18050bbe6216ae15245',
    pinnedBy: '§187 PREREGISTRATION.json owedFactSourceHashes, re-asserted by verify-188..199',
    ancestorVersion: null,
  },
  {
    path: 'backend/src/safescope-v2/expert-hazlenz/expert-prompt.ts',
    sha256: 'bfe564c25515cabf5149d9629aa9aa58ea2287dd8691dc338a2f9ec47fd0f694',
    pinnedBy: '§187 PREREGISTRATION.json firstPassIdentity.promptFileSha256',
    ancestorVersion: 'hazlenz.expert.prompt.v15',
  },
  {
    path: 'backend/scripts/lib/expert-verifier-contract-v3.ts',
    sha256: '475a957747c145682a7027c3f4f06041e45a1d93df9779be02e0424962d6a3dc',
    pinnedBy: '§192 verifierIdentity.admissionValidatorSha256, asserted by verify-193/194/195/196/199',
    ancestorVersion: 'hazlenz.expert.verifier.v3',
  },
  {
    path: 'backend/scripts/lib/expert-first-pass-owed-fact-projection.ts',
    sha256: 'aab67e0b2e9c7303569c480c0eee92a19d2d9ccd4ffda04dc841dba60256432c',
    pinnedBy: 'FROZEN_BY_RECORDED_EVIDENCE: not hash-pinned against a frozen expectation, but its '
      + 'sha256 is recorded inside §196/§197/§198 evidence, and verify-197:248 / verify-199:255 '
      + 'assert a byte-level property of it (no transition() call). Changing it would diverge the '
      + 'recorded historical evidence, so §203 treats it exactly as pinned',
    ancestorVersion: 'hazlenz.expert.first-pass-owed-fact-projection.v1',
  },
] as const;

export interface SuccessorModulePlan {
  /** Repo-relative path of the successor module. */
  readonly path: string;
  readonly lineage: SuccessorLineage;
  /** Ancestor path for WRAPS / COPIED_FROM; null for NEW. */
  readonly ancestorPath: string | null;
  /** The §203 agent that owns the file under the §203 FILE-OWNERSHIP-MAP. */
  readonly owner: 'AGENT_A' | 'AGENT_B' | 'AGENT_B_THEN_C' | 'AGENT_C' | 'AGENT_D' | 'AGENT_E';
  readonly purpose: string;
}

/**
 * The planned successor surface. `generate-203-source-manifest.ts` records what actually exists at
 * freeze time; a planned module that was never created is reported by the generator rather than
 * silently omitted, and an unplanned expert-203 module is manifested and flagged UNPLANNED.
 */
export const SUCCESSOR_MODULE_PLAN: readonly SuccessorModulePlan[] = [
  {
    path: 'backend/scripts/lib/expert-203-successor-identity.ts',
    lineage: 'NEW', ancestorPath: null, owner: 'AGENT_A',
    purpose: 'this contract identity',
  },
  {
    path: 'backend/scripts/lib/expert-203-successor-projection.ts',
    lineage: 'WRAPS',
    ancestorPath: 'backend/scripts/lib/expert-first-pass-owed-fact-projection.ts',
    owner: 'AGENT_B',
    purpose: 'receiving-boundary enforcement of ABF-1, ABF-2 and ABF-7 around the UNMODIFIED frozen '
      + 'projection function',
  },
  {
    path: 'backend/scripts/lib/expert-203-successor-binding.ts',
    lineage: 'COPIED_FROM',
    ancestorPath: 'backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-binding.ts',
    owner: 'AGENT_B_THEN_C',
    purpose: 'successor checkBindingDeclarations / applyAdmittedDeclarations carrying ABF-3, ABF-8, '
      + 'the Ruling-5 non-authoritative urgency nomination, and the Ruling-3 FACT_IDENTITY_COLLISION '
      + 'fail-closed state; imports the frozen ledger module unchanged',
  },
  {
    path: 'backend/scripts/lib/expert-203-fact-identity-collision.ts',
    lineage: 'NEW', ancestorPath: null, owner: 'AGENT_C',
    purpose: 'deterministic fact-identity collision detection and its diagnostic vocabulary',
  },
  {
    path: 'backend/scripts/lib/expert-203-effective-grammar-identity.ts',
    lineage: 'NEW', ancestorPath: null, owner: 'AGENT_E',
    purpose: 'canonical EFFECTIVE_GRAMMAR_IDENTITY replacing the retired §201 prototype '
      + 'prospectively (Ruling 7)',
  },
] as const;

/** Asserted by suites: this module decides nothing and reaches nothing. */
export function successorIdentityEffect(): {
  providerCalls: 0; databaseOperations: 0; mutatesAnyLedger: false;
  modifiesAnyExistingFile: false; rewiresAnyHistoricalCaller: false;
} {
  return {
    providerCalls: 0, databaseOperations: 0, mutatesAnyLedger: false,
    modifiesAnyExistingFile: false, rewiresAnyHistoricalCaller: false,
  };
}
