/**
 * §204 EXPERT HAZLENZ -- BOUNDED GOVERNANCE DEEP-SCAN (RT203-1 / D05). DEVELOPMENT ONLY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT REACHABLE FROM PRODUCTION.
 *
 * ==================== THE DEFECT THIS CLOSES ====================
 *
 * §202's `nestedForbiddenGovernanceFields` returns `[]` past depth 8
 * (`expert-202-authority-boundary-guards.ts:252`) -- silent truncation. §203's successor boundary
 * imports that walk, so RT203-1 measured a citation at depth 10 producing ZERO successor refusals:
 * SCAN_LIMIT_REACHED was indistinguishable from NO_FORBIDDEN_CONTENT_FOUND. Agent F recorded the
 * same class in the frozen normalization module (AB203-1): a check that cannot inspect its target
 * must never report clean.
 *
 * ==================== THE PRODUCT-OWNER RULING ====================
 *
 * FAIL CLOSED. An explicit bounded policy with an explicit failure state:
 *
 *   SCAN_COMPLETE        the ENTIRE tree was examined; `findings` is exhaustive
 *   SCAN_LIMIT_EXCEEDED  the tree could NOT be fully examined; there is NO findings field on this
 *                        arm AT ALL, so the type system itself refuses the "limit reached, zero
 *                        findings, therefore clean" misreading. The §204 receiving boundaries
 *                        refuse admission on this state.
 *
 * No unbounded recursion: traversal is ITERATIVE with an explicit node stack, an explicit depth
 * bound, an explicit visited-node bound, and an ancestor-set cycle refusal. `JSON.parse` output
 * cannot be cyclic, so the cycle arm is unreachable for wire input -- it exists because this
 * function is also callable programmatically, and a bound that only holds for well-behaved callers
 * is the defect class this module exists to close.
 */

import {
  FORBIDDEN_EXPERT_FIELD_NAMES,
} from '../../src/hazlenz/expert-hazlenz/expert-contract.types';

export const BOUNDED_SCAN_VERSION = 'hazlenz.expert.204-bounded-scan.v1' as const;

/**
 * The explicit bounds. Depth 32 is 4x the legitimate contract depth observed anywhere in the
 * successor schemas (max nesting: declaration -> nomination -> scalar = 3); node cap 10,000 is two
 * orders of magnitude above any legitimate declaration set and small enough that a hostile payload
 * cannot use the scan itself for resource exhaustion. Changing either is a contract change.
 */
export const SCAN_MAX_DEPTH = 32 as const;
export const SCAN_MAX_NODES = 10_000 as const;

export interface GovernanceScanFinding {
  /** JSONPath-style location of the forbidden key. */
  readonly path: string;
  readonly key: string;
}

export type BoundedScanLimit = 'DEPTH_LIMIT' | 'NODE_LIMIT' | 'CYCLE_DETECTED';

/** The tri-state result. The exceeded arm carries NO findings field, deliberately. */
export type BoundedScanResult =
  | {
      readonly outcome: 'SCAN_COMPLETE';
      /** Exhaustive over the whole tree: depth > 0 keys in FORBIDDEN_EXPERT_FIELD_NAMES. */
      readonly findings: readonly GovernanceScanFinding[];
      readonly nodesVisited: number;
      readonly maxDepthSeen: number;
    }
  | {
      readonly outcome: 'SCAN_LIMIT_EXCEEDED';
      readonly limit: BoundedScanLimit;
      /** Where the scan had to stop -- for diagnostics, never for admission. */
      readonly atPath: string;
      readonly nodesVisited: number;
    };

interface Frame {
  readonly value: unknown;
  readonly path: string;
  readonly depth: number;
  /** Ancestor objects on this frame's path, for cycle refusal. */
  readonly ancestors: readonly object[];
}

/**
 * Iterative bounded walk. Reports depth > 0 forbidden keys exactly as §202's guard documents
 * (depth 0 is the declaration itself, screened by the top-level scans at both successor
 * boundaries); unlike §202's guard it NEVER silently truncates: any bound hit returns the explicit
 * SCAN_LIMIT_EXCEEDED state instead of a partial (or empty) findings list.
 */
export function boundedGovernanceScan(root: unknown): BoundedScanResult {
  const findings: GovernanceScanFinding[] = [];
  const stack: Frame[] = [{ value: root, path: '$', depth: 0, ancestors: [] }];
  let nodesVisited = 0;
  let maxDepthSeen = 0;

  while (stack.length > 0) {
    const frame = stack.pop() as Frame;
    const { value, path, depth, ancestors } = frame;
    if (value === null || typeof value !== 'object') continue;

    nodesVisited += 1;
    if (nodesVisited > SCAN_MAX_NODES) {
      return { outcome: 'SCAN_LIMIT_EXCEEDED', limit: 'NODE_LIMIT', atPath: path, nodesVisited };
    }
    if (depth > SCAN_MAX_DEPTH) {
      return { outcome: 'SCAN_LIMIT_EXCEEDED', limit: 'DEPTH_LIMIT', atPath: path, nodesVisited };
    }
    if (ancestors.includes(value as object)) {
      return { outcome: 'SCAN_LIMIT_EXCEEDED', limit: 'CYCLE_DETECTED', atPath: path, nodesVisited };
    }
    if (depth > maxDepthSeen) maxDepthSeen = depth;

    const childAncestors: readonly object[] = [...ancestors, value as object];
    if (Array.isArray(value)) {
      for (let i = value.length - 1; i >= 0; i -= 1) {
        stack.push({
          value: value[i], path: `${path}[${i}]`, depth: depth + 1, ancestors: childAncestors,
        });
      }
      continue;
    }
    for (const [k, v] of Object.entries(value as Record<string, unknown>).reverse()) {
      if (depth > 0 && FORBIDDEN_EXPERT_FIELD_NAMES.includes(k)) {
        findings.push({ path: `${path}.${k}`, key: k });
      }
      stack.push({ value: v, path: `${path}.${k}`, depth: depth + 1, ancestors: childAncestors });
    }
  }

  return { outcome: 'SCAN_COMPLETE', findings, nodesVisited, maxDepthSeen };
}

/** Asserted by the suite: this module decides nothing semantic and reaches nothing. */
export function boundedScanEffect(): {
  providerCalls: 0; databaseOperations: 0; containsAnySemanticMatcher: false;
  limitStateCarriesFindings: false; recursionUnbounded: false;
} {
  return {
    providerCalls: 0, databaseOperations: 0, containsAnySemanticMatcher: false,
    limitStateCarriesFindings: false, recursionUnbounded: false,
  };
}
