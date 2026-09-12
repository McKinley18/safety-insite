/**
 * §204 EXPERT HAZLENZ -- SUCCESSOR CLOSURE CONTRACT IDENTITY. DEVELOPMENT ONLY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT REACHABLE FROM PRODUCTION.
 *
 * ==================== WHY THIS MODULE EXISTS ====================
 *
 * §203's red team recorded three value-shape closure findings on the successor boundary
 * (RT203-1, RT203-2, RT203-3). The product owner ruled (§204 D05/D06/D07):
 *
 *   RT203-1  the deep scan must FAIL CLOSED at its limit -- SCAN_LIMIT_EXCEEDED is never
 *            equivalent to NO_FORBIDDEN_CONTENT_FOUND;
 *   RT203-2  free text stays NON-AUTHORITATIVE, enforced by structural bounds only -- no
 *            citation detector, no regex over regulatory meaning, governed mode stays REDACTED;
 *   RT203-3  affectedDecision is an authority-bearing closed-set value and must be
 *            independently validated at the receiving boundary -- reject, never repair.
 *
 * Because these change successor boundary BEHAVIOR, §204 does not mutate
 * `hazlenz.expert.203-successor-boundary.v1`. This module is the ADDITIVE successor revision's
 * identity, held as code. Lineage: §203 successor -> §204 closure successor. Every §203 module is
 * an UNMODIFIED ancestor here, pinned below exactly as §203 pinned its own frozen ancestry.
 */

import { ANCESTOR_PINS as SECTION_203_ANCESTOR_PINS, type AncestorPin }
  from './expert-203-successor-identity';

export const CLOSURE_CONTRACT_VERSION = 'hazlenz.expert.204-successor-closure.v1' as const;

/** The §203 contract this revision succeeds, held as data so a suite can assert lineage. */
export const CLOSURE_ANCESTOR_CONTRACT_VERSION = 'hazlenz.expert.203-successor-boundary.v1' as const;

/**
 * The §203 successor modules become §204 ancestors: byte-frozen for this contract, recomputed from
 * actual file bytes at authoring time. The deeper §187/§192 ancestry is inherited verbatim from the
 * §203 identity module (imported, never restated, so the two contracts cannot disagree about it).
 */
export const SECTION_204_DIRECT_ANCESTOR_PINS: readonly AncestorPin[] = [
  {
    path: 'backend/scripts/lib/expert-203-successor-identity.ts',
    sha256: '8b44025566a52050189fb1ef950c28a0d834d51e60b5b8a2d80c439e13e9f225',
    pinnedBy: '§203 SUCCESSOR-SOURCE-MANIFEST.json, re-asserted by verify-203-source-integrity',
    ancestorVersion: 'hazlenz.expert.203-successor-boundary.v1',
  },
  {
    path: 'backend/scripts/lib/expert-203-successor-projection.ts',
    sha256: 'aae50ab06db4a4766ee1607bd338bdf99dcb17d6790998969b440cc30e14e92d',
    pinnedBy: '§203 SUCCESSOR-SOURCE-MANIFEST.json, re-asserted by verify-203-source-integrity',
    ancestorVersion: null,
  },
  {
    path: 'backend/scripts/lib/expert-203-successor-binding.ts',
    sha256: '144b32cf643e945c3a48bcc25e423c38639d2eb11bf9fcdc463319848de6bd29',
    pinnedBy: '§203 SUCCESSOR-SOURCE-MANIFEST.json, re-asserted by verify-203-source-integrity',
    ancestorVersion: 'hazlenz.expert.203-successor-binding.v1',
  },
  {
    path: 'backend/scripts/lib/expert-203-fact-identity-collision.ts',
    sha256: 'b50fc3a0bbbdd78e11a2bc8397fc5744afabd1ce3aed7f96c8ab9c6ff5ad683d',
    pinnedBy: '§203 SUCCESSOR-SOURCE-MANIFEST.json, re-asserted by verify-203-source-integrity',
    ancestorVersion: null,
  },
  {
    path: 'backend/scripts/lib/expert-203-effective-grammar-identity.ts',
    sha256: 'a641fb1488ea5be7957f441b9b56c16c8a84fecc2269652e8fa3a5703335baef',
    pinnedBy: '§203 SUCCESSOR-SOURCE-MANIFEST.json, re-asserted by verify-203-source-integrity',
    ancestorVersion: null,
  },
] as const;

/** The full frozen ancestry §204 asserts: §203 modules + the inherited §187/§192 pins. */
export const CLOSURE_ANCESTOR_PINS: readonly AncestorPin[] = [
  ...SECTION_204_DIRECT_ANCESTOR_PINS,
  ...SECTION_203_ANCESTOR_PINS,
] as const;

export interface ClosureModulePlan {
  readonly path: string;
  readonly lineage: 'NEW' | 'COMPOSES';
  /** The §203 boundary this module composes onto; null for NEW support modules. */
  readonly composesOnto: string | null;
  readonly purpose: string;
}

export const CLOSURE_MODULE_PLAN: readonly ClosureModulePlan[] = [
  {
    path: 'backend/scripts/lib/expert-204-closure-identity.ts',
    lineage: 'NEW', composesOnto: null,
    purpose: 'this contract identity',
  },
  {
    path: 'backend/scripts/lib/expert-204-bounded-scan.ts',
    lineage: 'NEW', composesOnto: null,
    purpose: 'RT203-1: explicit bounded governance deep-scan with a fail-closed '
      + 'SCAN_LIMIT_EXCEEDED state that structurally cannot be read as a clean result',
  },
  {
    path: 'backend/scripts/lib/expert-204-closure-binding.ts',
    lineage: 'COMPOSES',
    composesOnto: 'backend/scripts/lib/expert-203-successor-binding.ts',
    purpose: 'RT203-1/2/3 closure checks at the §204 receiving boundary, delegating to the '
      + 'UNMODIFIED §203 admission and apply functions',
  },
  {
    path: 'backend/scripts/lib/expert-204-closure-projection.ts',
    lineage: 'COMPOSES',
    composesOnto: 'backend/scripts/lib/expert-203-successor-projection.ts',
    purpose: 'RT203-1 at the projection receiving boundary: bounded scan with fail-closed limit '
      + 'handling ahead of the UNMODIFIED §203 projection wrapper',
  },
] as const;

/** Asserted by the suite: this module decides nothing and reaches nothing. */
export function closureIdentityEffect(): {
  providerCalls: 0; databaseOperations: 0; mutatesAnySection203Module: false;
  modifiesAnyExistingFile: false; rewiresAnyHistoricalCaller: false;
  suppliesAnySemanticVerdict: false;
} {
  return {
    providerCalls: 0, databaseOperations: 0, mutatesAnySection203Module: false,
    modifiesAnyExistingFile: false, rewiresAnyHistoricalCaller: false,
    suppliesAnySemanticVerdict: false,
  };
}
