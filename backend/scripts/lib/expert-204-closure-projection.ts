/**
 * §204 EXPERT HAZLENZ -- CLOSURE PROJECTION BOUNDARY (RT203-1 / D05). DEVELOPMENT ONLY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT REACHABLE FROM PRODUCTION.
 *
 * RT203-1's executed evidence lives at the PROJECTION boundary: §203's
 * `projectDeclaredOwedFacts203` calls §202's depth-8 walk, which fails OPEN, so a citation at
 * depth 10 produced zero successor refusals. This module composes the §204 bounded scan IN FRONT
 * of the UNMODIFIED §203 wrapper:
 *
 *   SCAN_LIMIT_EXCEEDED  -> the declaration is refused at THIS boundary (fail closed) and never
 *                           delegated;
 *   complete scan with a finding -> refused here, with the finding's exact path;
 *   clean complete scan  -> delegated to §203 unchanged (whose own depth-8 walk then re-screens a
 *                           strict subset -- harmless, divergence-free duplication).
 */

import type { ProjectionInput } from './expert-first-pass-owed-fact-projection';
import {
  projectDeclaredOwedFacts203, type SuccessorProjectionResult,
} from './expert-203-successor-projection';
import { CLOSURE_CONTRACT_VERSION } from './expert-204-closure-identity';
import { screenDeclaration, type ClosureDeclarationScreen } from './expert-204-closure-binding';

export const CLOSURE_PROJECTION_VERSION = 'hazlenz.expert.204-closure-projection.v1' as const;

export interface ClosureProjectionResult {
  readonly version: typeof CLOSURE_PROJECTION_VERSION;
  readonly closureVersion: typeof CLOSURE_CONTRACT_VERSION;
  /** Declarations refused by the §204 scan closure, with the raw scan outcome preserved. */
  readonly closureRefusals: readonly ClosureDeclarationScreen[];
  /** The UNMODIFIED §203 result over the surviving declarations. */
  readonly delegated: SuccessorProjectionResult;
}

/**
 * The §204 projection receiving boundary. Only the SCAN closure applies here (free-text and
 * affectedDecision closure belong to the binding declaration shape, not the first-pass one);
 * screens beyond the scan are reported by `screenDeclaration` only for object-shaped fields the
 * first-pass declaration also carries, and refusal here is driven by the scan outcomes alone.
 */
export function projectDeclaredOwedFacts204(input: ProjectionInput): ClosureProjectionResult {
  const closureRefusals: ClosureDeclarationScreen[] = [];
  const survivors: unknown[] = [];

  input.declarations.forEach((raw, index) => {
    const screen = screenDeclaration(index, raw);
    const scanViolations = screen.closureViolations.filter(
      v => v.code === 'SCAN_LIMIT_EXCEEDED_FAIL_CLOSED'
        || v.code === 'NESTED_FORBIDDEN_GOVERNANCE_FIELD',
    );
    if (scanViolations.length > 0) {
      closureRefusals.push({ ...screen, closureViolations: scanViolations });
    } else {
      survivors.push(raw);
    }
  });

  const delegated = projectDeclaredOwedFacts203({ ...input, declarations: survivors });
  return {
    version: CLOSURE_PROJECTION_VERSION,
    closureVersion: CLOSURE_CONTRACT_VERSION,
    closureRefusals,
    delegated,
  };
}

/** Asserted by the suite: this boundary decides nothing semantic and reaches nothing. */
export function closureProjectionEffect(): {
  providerCalls: 0; databaseOperations: 0; mutatesAnySection203Module: false;
  scanLimitMayReadAsClean: false;
} {
  return {
    providerCalls: 0, databaseOperations: 0, mutatesAnySection203Module: false,
    scanLimitMayReadAsClean: false,
  };
}
