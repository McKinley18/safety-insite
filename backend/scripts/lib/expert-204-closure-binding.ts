/**
 * §204 EXPERT HAZLENZ -- CLOSURE RECEIVING BOUNDARY (RT203-1/2/3, D05/D06/D07). DEVELOPMENT ONLY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT REACHABLE FROM PRODUCTION.
 *
 * ==================== WHAT THIS BOUNDARY ADDS, AND NOTHING ELSE ====================
 *
 * Composes onto the UNMODIFIED §203 successor binding boundary. Three closures, each a
 * product-owner ruling, each with its exercised call site here:
 *
 *   RT203-1 / D05  every declaration is deep-scanned by the §204 BOUNDED scan before anything is
 *                  admitted; SCAN_LIMIT_EXCEEDED FAILS CLOSED (refusal), and structurally cannot
 *                  be read as a clean scan (the result arm carries no findings field);
 *
 *   RT203-2 / D06  free-text fields are structurally bounded: string type, non-empty where
 *                  required, byte-size cap, control-byte policy. NO citation detector, NO regex
 *                  over regulatory meaning, NO governed authority from free text: this module
 *                  emits no governed-provenance field of any kind, and the only governed-binding
 *                  authority anywhere in the architecture remains the SEPARATE §202 governed
 *                  stage's structured supplied-sourceId path, whose default exposure stays
 *                  REDACTED (asserted by the suite, not by this comment);
 *
 *   RT203-3 / D07  declaration-level `affectedDecision` is independently validated against the
 *                  imported closed set AT THIS BOUNDARY. Invalid or missing -> reject with an
 *                  explicit code. Valid -> preserved byte-exactly. No coercion, no default
 *                  substitution, no repair to a nearby member, no semantic reinterpretation.
 *
 * A declaration refused here never becomes §204-admitted, even when the delegated §203 check
 * admits it; the §203 result is carried intact for differential evidence.
 */

import type { OwedFactLedger } from '../../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  OWED_FACT_AFFECTED_DECISIONS,
} from '../../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
import {
  applyAdmittedDeclarations203, checkBindingDeclarations203,
  type SuccessorApplyResult, type SuccessorBindingCheckResult,
  type SuccessorClarificationDeclaration,
} from './expert-203-successor-binding';
import { boundedGovernanceScan, type BoundedScanResult } from './expert-204-bounded-scan';
import { CLOSURE_CONTRACT_VERSION } from './expert-204-closure-identity';

export const CLOSURE_BINDING_VERSION = 'hazlenz.expert.204-closure-binding.v1' as const;

// ================================================================ RT203-2: the free-text policy

/**
 * D06 structural bounds, held as data. Free text is NON-AUTHORITATIVE by architecture; these
 * bounds are about transport hygiene, not meaning.
 */
export const FREE_TEXT_MAX_BYTES = 4096 as const;
/** Byte values below 0x20 that ARE permitted inside free text. Everything else below 0x20, and
 * 0x7F (DEL), is refused. Raw NUL is therefore always refused. */
export const FREE_TEXT_PERMITTED_CONTROL_BYTES = [0x09, 0x0a, 0x0d] as const;

/** The declaration/nomination fields the D06 policy governs, by role. */
export const FREE_TEXT_FIELDS_DECLARATION = ['question'] as const;
export const FREE_TEXT_FIELDS_NOMINATION = [
  'evidenceSpan', 'whyUnresolved', 'branchA', 'branchB', 'decisionIfA', 'decisionIfB',
] as const;

export const CLOSURE_CODES = [
  'SCAN_LIMIT_EXCEEDED_FAIL_CLOSED',      // RT203-1: the bound was hit; clean is NOT inferable
  'NESTED_FORBIDDEN_GOVERNANCE_FIELD',    // RT203-1: complete scan found a buried governance key
  'FREE_TEXT_NOT_A_STRING',               // RT203-2: e.g. {citation:..., approved:true} as question
  'FREE_TEXT_EMPTY',                      // RT203-2
  'FREE_TEXT_OVER_MAX_BYTES',             // RT203-2
  'FREE_TEXT_FORBIDDEN_CONTROL_BYTE',     // RT203-2
  'AFFECTED_DECISION_NOT_A_MEMBER',       // RT203-3
] as const;
export type ClosureCode = (typeof CLOSURE_CODES)[number];

export interface ClosureViolation {
  readonly code: ClosureCode;
  readonly detail: string;
}

export interface ClosureDeclarationScreen {
  /** Index in the supplied array: a refusal is addressable even when declarationId is hostile. */
  readonly index: number;
  readonly declarationId: string | null;
  readonly closureViolations: readonly ClosureViolation[];
  /** The raw scan outcome, preserved so SCAN_LIMIT_EXCEEDED is visible as itself. */
  readonly scan: BoundedScanResult;
}

export interface ClosureBindingCheckResult {
  readonly version: typeof CLOSURE_BINDING_VERSION;
  readonly closureVersion: typeof CLOSURE_CONTRACT_VERSION;
  readonly perDeclaration: readonly ClosureDeclarationScreen[];
  /** The UNMODIFIED §203 result over the same input, for differential evidence. */
  readonly delegated: SuccessorBindingCheckResult;
  /** Admitted by BOTH layers. The only list §204 apply will consume. */
  readonly admitted: readonly SuccessorClarificationDeclaration[];
  /** Refused by either layer. */
  readonly refused: readonly SuccessorClarificationDeclaration[];
}

const V = (code: ClosureCode, detail: string): ClosureViolation => ({ code, detail });

/** D06: the structural free-text screen. Deterministic, content-blind beyond bytes. */
export function freeTextViolations(
  fieldPath: string, value: unknown, required: boolean,
): ClosureViolation[] {
  if (value === undefined || value === null) {
    return required ? [V('FREE_TEXT_EMPTY', `${fieldPath} is required and absent`)] : [];
  }
  if (typeof value !== 'string') {
    return [V('FREE_TEXT_NOT_A_STRING',
      `${fieldPath} must be a plain string; free text is non-authoritative and an object here `
      + 'is a shape violation regardless of its content')];
  }
  const out: ClosureViolation[] = [];
  if (required && value.trim().length === 0) {
    out.push(V('FREE_TEXT_EMPTY', `${fieldPath} is required and blank`));
  }
  const bytes = Buffer.byteLength(value, 'utf8');
  if (bytes > FREE_TEXT_MAX_BYTES) {
    out.push(V('FREE_TEXT_OVER_MAX_BYTES',
      `${fieldPath} is ${bytes} UTF-8 bytes; the bound is ${FREE_TEXT_MAX_BYTES}`));
  }
  for (let i = 0; i < value.length; i += 1) {
    const c = value.charCodeAt(i);
    if ((c < 0x20 && !(FREE_TEXT_PERMITTED_CONTROL_BYTES as readonly number[]).includes(c))
        || c === 0x7f) {
      out.push(V('FREE_TEXT_FORBIDDEN_CONTROL_BYTE',
        `${fieldPath} carries forbidden control byte 0x${c.toString(16).padStart(2, '0')} `
        + `at index ${i}`));
      break; // one refusal per field is enough; the field is refused whole
    }
  }
  return out;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** The per-declaration §204 closure screen. Pure; used by both §204 boundaries. */
export function screenDeclaration(index: number, raw: unknown): ClosureDeclarationScreen {
  const closureViolations: ClosureViolation[] = [];

  // ---- RT203-1 / D05: the bounded scan, fail closed.
  const scan = boundedGovernanceScan(raw);
  if (scan.outcome === 'SCAN_LIMIT_EXCEEDED') {
    closureViolations.push(V('SCAN_LIMIT_EXCEEDED_FAIL_CLOSED',
      `${scan.limit} at ${scan.atPath} after ${scan.nodesVisited} nodes: the declaration could `
      + 'not be fully examined, and an unexamined declaration is refused rather than presumed '
      + 'clean (SCAN_LIMIT_REACHED is never NO_FORBIDDEN_CONTENT_FOUND)'));
  } else {
    for (const f of scan.findings) {
      closureViolations.push(V('NESTED_FORBIDDEN_GOVERNANCE_FIELD',
        `${f.path} -- governance field '${f.key}' nested below the top level`));
    }
  }

  let declarationId: string | null = null;
  if (isPlainObject(raw)) {
    declarationId = typeof raw.declarationId === 'string' ? raw.declarationId : null;

    // ---- RT203-2 / D06: free-text structural bounds.
    for (const f of FREE_TEXT_FIELDS_DECLARATION) {
      closureViolations.push(...freeTextViolations(`declaration.${f}`, raw[f], true));
    }
    const nomination = raw.nomination;
    if (isPlainObject(nomination)) {
      for (const f of FREE_TEXT_FIELDS_NOMINATION) {
        closureViolations.push(...freeTextViolations(`nomination.${f}`, nomination[f], true));
      }
    }

    // ---- RT203-3 / D07: declaration-level affectedDecision, independently, at this boundary.
    // Membership against the IMPORTED closed set; reject or preserve byte-exactly -- no repair.
    if (!(OWED_FACT_AFFECTED_DECISIONS as readonly string[]).includes(
      raw.affectedDecision as string,
    )) {
      closureViolations.push(V('AFFECTED_DECISION_NOT_A_MEMBER',
        `declaration.affectedDecision ${JSON.stringify(raw.affectedDecision)} is not a member of `
        + 'the closed set; it is rejected, not repaired, defaulted or reinterpreted'));
    }
  }

  return { index, declarationId, closureViolations, scan };
}

/**
 * The §204 receiving boundary. Screens every declaration, then delegates the SAME input to the
 * UNMODIFIED §203 boundary. §204-admitted = §203-admitted minus closure-refused.
 */
export function checkBindingDeclarations204(
  declarations: readonly SuccessorClarificationDeclaration[],
  ledger: OwedFactLedger,
  observation: string,
): ClosureBindingCheckResult {
  const perDeclaration = declarations.map((d, i) => screenDeclaration(i, d));
  const delegated = checkBindingDeclarations203(declarations, ledger, observation);

  const refusedIndexes = new Set(
    perDeclaration.filter(s => s.closureViolations.length > 0).map(s => s.index),
  );
  const delegatedAdmitted = new Set(delegated.admitted);
  const admitted: SuccessorClarificationDeclaration[] = [];
  const refused: SuccessorClarificationDeclaration[] = [];
  declarations.forEach((d, i) => {
    if (!refusedIndexes.has(i) && delegatedAdmitted.has(d)) admitted.push(d);
    else refused.push(d);
  });

  return {
    version: CLOSURE_BINDING_VERSION,
    closureVersion: CLOSURE_CONTRACT_VERSION,
    perDeclaration,
    delegated,
    admitted,
    refused,
  };
}

/**
 * The §204 apply. Consumes ONLY the §204 result type and ONLY its own admitted list, then
 * delegates to the UNMODIFIED §203 apply over a §203-shaped result narrowed to that list. A
 * closure-refused declaration cannot reach the ledger through this function, and a caller holding
 * only the raw §203 result cannot call it at all (wrong type at compile time; at runtime the
 * closure screen is re-asserted below rather than trusted).
 */
export function applyAdmittedDeclarations204(
  ledger: OwedFactLedger, check: ClosureBindingCheckResult,
): SuccessorApplyResult {
  // Fail-closed re-assertion (RT1-E): nothing in the admitted list may carry a closure violation.
  for (const d of check.admitted) {
    const screen = check.perDeclaration.find(
      s => s.declarationId !== null && s.declarationId === d.declarationId,
    );
    if (!screen || screen.closureViolations.length > 0) {
      throw new Error('CLOSURE_REFUSED_DECLARATION_IN_APPLY -- a §204 apply was handed a '
        + `declaration (${d.declarationId}) outside its own clean screen; failing closed`);
    }
  }
  const narrowed: SuccessorBindingCheckResult = {
    ...check.delegated,
    admitted: check.admitted,
    refused: check.refused,
    boundFactKeys: check.admitted
      .filter(d => d.bindingMode === 'BOUND_TO_OWED_FACT' && d.coversFactKey)
      .map(d => String(d.coversFactKey)),
    nominationCount: check.admitted.filter(d => d.bindingMode === 'NOMINATED_NEW').length,
  };
  return applyAdmittedDeclarations203(ledger, narrowed);
}

/**
 * Asserted by the suite: free text acquires no authority here. This module exports no
 * governed-provenance field, writes none onto any result, and contains no citation matcher.
 */
export function closureBindingEffect(): {
  providerCalls: 0; databaseOperations: 0; mutatesAnySection203Module: false;
  emitsGovernedProvenance: false; containsCitationDetector: false;
  freeTextMayAcquireAuthority: false; affectedDecisionMayBeRepaired: false;
  scanLimitMayReadAsClean: false;
} {
  return {
    providerCalls: 0, databaseOperations: 0, mutatesAnySection203Module: false,
    emitsGovernedProvenance: false, containsCitationDetector: false,
    freeTextMayAcquireAuthority: false, affectedDecisionMayBeRepaired: false,
    scanLimitMayReadAsClean: false,
  };
}
