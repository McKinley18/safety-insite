/**
 * KG-4C -- the customer-output invariance hash.
 *
 * WHAT PROBLEM THIS SOLVES. KG-4B proved SHADOW is customer-invisible by comparing whole payloads
 * inside an isolated verification run. That oracle cannot run in production: it issues each request
 * twice, and it holds raw customer payloads in memory to diff them. Production needs the same
 * guarantee with neither property -- a check that runs once, keeps nothing, and still detects a
 * single changed character anywhere in the response.
 *
 * THE ANSWER IS A HASH, AND THE HASH IS THE ONLY THING THAT LEAVES THIS MODULE. Raw payloads are
 * never logged, never stored, never attached to an event. What an operator gets is: the two hashes
 * agreed, or they did not, and if they did not, WHICH PATHS differed -- never which values.
 *
 * WHY THE VOLATILE SET IS DERIVED, NOT WRITTEN DOWN. A hand-maintained ignore-list is a promise
 * that the implementation will not grow a new timestamp, and that promise is always eventually
 * broken -- at which point the check either fires constantly (and gets disabled) or is quietly
 * widened until it proves nothing. KG-4B derived the volatile set EMPIRICALLY, by running the same
 * legacy request twice and excluding only what already differed between two runs of identical code.
 * That methodology is preserved here: `deriveVolatilePaths()` is the only supported way to build an
 * exclusion set, and it takes two LEGACY observations, never a developer's opinion.
 */

import { createHash } from 'crypto';

/** A flattened `path -> scalar` view of a payload. Order-independent by construction. */
export type FlattenedPayload = Map<string, string>;

/**
 * Flattens any JSON-ish value to `path -> scalar-as-string`.
 *
 * ARRAYS ARE INDEXED, NOT SET-IFIED. Element 0 and element 1 are distinct paths, so a REORDERING of
 * the citation list changes the flattened view and therefore the hash. That is intended: KG-4B
 * asserts citation set AND order are identical, and an invariance check that ignored order would
 * silently permit governed ranking to reach a shadow customer.
 *
 * NULL AND ABSENT ARE DISTINCT. A key present with value null yields a path; an absent key yields
 * no path at all. This is the distinction that caught the KG-4B payload leak, where SHADOW added
 * `knowledgeReleaseId: null` to a response that previously had no such key.
 */
export function flattenPayload(value: unknown, prefix = ''): FlattenedPayload {
  const out: FlattenedPayload = new Map();

  const walk = (node: unknown, path: string): void => {
    if (node === null) { out.set(path, 'null:'); return; }
    if (node === undefined) { out.set(path, 'undefined:'); return; }
    if (Array.isArray(node)) {
      // Record the length explicitly so an empty array and an absent key, or a truncated list,
      // cannot collide.
      out.set(path + '#length', String(node.length));
      node.forEach((entry, index) => walk(entry, path + '#' + String(index)));
      return;
    }
    if (typeof node === 'object') {
      const entries = Object.entries(node as Record<string, unknown>);
      // Key COUNT is recorded, so an added key changes the hash even if its value is null and even
      // if a downstream reader would ignore it. Adding a key IS altering customer output.
      out.set(path + '#keys', String(entries.length));
      for (const [key, entry] of entries) walk(entry, path ? path + '.' + key : key);
      return;
    }
    out.set(path, typeof node + ':' + String(node));
  };

  walk(value, prefix);
  return out;
}

/**
 * Derives the volatile path set EMPIRICALLY from two observations of the same legacy request.
 *
 * Anything that differs between two runs of IDENTICAL code under IDENTICAL configuration is
 * volatile by demonstration -- ids, timestamps, durations. Everything else is stable and must not
 * move when SHADOW is switched on.
 *
 * A path present in one observation and absent in the other is also volatile: an optional field
 * that sometimes appears cannot be used as evidence either way.
 */
export function deriveVolatilePaths(legacyRunA: unknown, legacyRunB: unknown): Set<string> {
  const a = flattenPayload(legacyRunA);
  const b = flattenPayload(legacyRunB);
  const volatilePaths = new Set<string>();
  for (const [path, value] of a) {
    if (!b.has(path) || b.get(path) !== value) volatilePaths.add(path);
  }
  for (const path of b.keys()) {
    if (!a.has(path)) volatilePaths.add(path);
  }
  return volatilePaths;
}

/**
 * The canonical, privacy-safe hash of one customer-visible payload.
 *
 * Paths are sorted, so key insertion order cannot change the digest -- the same lesson KG-3F's
 * `canonicalDigest()` learned when jsonb reordered an approval payload.
 *
 * The digest covers path names AND values. A payload whose values are identical but whose SHAPE
 * differs hashes differently, which is what makes an added key detectable.
 */
export function customerOutputHash(
  payload: unknown,
  volatilePaths: ReadonlySet<string> = new Set<string>(),
): string {
  const flat = flattenPayload(payload);
  const parts: string[] = [];
  for (const path of [...flat.keys()].sort()) {
    if (volatilePaths.has(path)) continue;
    parts.push(path + '=' + String(flat.get(path)));
  }
  return createHash('sha256').update(parts.join('\n')).digest('hex');
}

export type InvarianceVerdict =
  /** The two payloads are identical once proven-volatile fields are excluded. */
  | 'INVARIANT'
  /** They differ. A hard SHADOW violation. */
  | 'MUTATED'
  /** The comparison could not be performed. NOT a pass -- see the note below. */
  | 'INDETERMINATE';

export interface InvarianceResult {
  verdict: InvarianceVerdict;
  legacyHash: string | null;
  shadowHash: string | null;
  /** How many non-volatile paths differ. A COUNT; values never leave this module. */
  differingPathCount: number;
  /**
   * The differing PATH NAMES, capped. Path names are structural and carry no customer content, so
   * they are safe to record and are the single most useful thing an operator can have. Values are
   * never included.
   */
  differingPaths: string[];
  volatilePathCount: number;
}

/** How many path names one diagnostic event may carry. Bounded so an event cannot become a dump. */
const MAX_REPORTED_PATHS = 12;

/**
 * Compares a legacy payload against a shadow payload.
 *
 * INDETERMINATE IS NOT A PASS. If either side is missing, the result is `INDETERMINATE`, and the
 * circuit breaker treats that as a failure to verify rather than as a verified success. A check
 * that silently passes when it could not run is worse than no check, because it manufactures
 * confidence -- exactly the failure mode KG-4B's throttled corpus run demonstrated, where 32
 * identical HTTP 429 responses satisfied an equality oracle perfectly.
 */
export function compareCustomerOutput(input: {
  legacyPayload: unknown;
  shadowPayload: unknown;
  volatilePaths?: ReadonlySet<string>;
}): InvarianceResult {
  const volatilePaths = input.volatilePaths ?? new Set<string>();

  if (input.legacyPayload === undefined || input.shadowPayload === undefined) {
    return {
      verdict: 'INDETERMINATE', legacyHash: null, shadowHash: null,
      differingPathCount: 0, differingPaths: [], volatilePathCount: volatilePaths.size,
    };
  }

  const legacyHash = customerOutputHash(input.legacyPayload, volatilePaths);
  const shadowHash = customerOutputHash(input.shadowPayload, volatilePaths);

  if (legacyHash === shadowHash) {
    return {
      verdict: 'INVARIANT', legacyHash, shadowHash,
      differingPathCount: 0, differingPaths: [], volatilePathCount: volatilePaths.size,
    };
  }

  const legacyFlat = flattenPayload(input.legacyPayload);
  const shadowFlat = flattenPayload(input.shadowPayload);
  const differing: string[] = [];
  const allPaths = new Set<string>([...legacyFlat.keys(), ...shadowFlat.keys()]);
  for (const path of allPaths) {
    if (volatilePaths.has(path)) continue;
    if (legacyFlat.get(path) !== shadowFlat.get(path)) differing.push(path);
  }
  differing.sort();

  return {
    verdict: 'MUTATED', legacyHash, shadowHash,
    differingPathCount: differing.length,
    differingPaths: differing.slice(0, MAX_REPORTED_PATHS),
    volatilePathCount: volatilePaths.size,
  };
}
