/**
 * §207 -- THE EXECUTION GATE. THE HARNESS REFUSES TO RUN THE FRESH COHORT UNLESS THE FROZEN
 * PREREGISTRATION IS PRESENT AND ITS IDENTITY MATCHES.
 *
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * ==================== WHY THE PIN LIVES HERE AND NOT IN THE RECORD ====================
 *
 * `EXPECTED_PREREGISTRATION_IDENTITY` below is a literal. It is deliberately in a DIFFERENT FILE
 * from the record it describes, because a record that carries only its own digest proves only that
 * it is internally consistent — and a record and its digest can be rewritten together in one edit.
 * Two artifacts that must agree cannot be brought into agreement by editing one.
 *
 * The gate therefore performs three independent checks:
 *
 *   1. the record hashes to the digest it carries              (catches an edited payload)
 *   2. that digest equals the digest of the CURRENT source     (catches a drifted specification)
 *   3. that digest equals the PIN in this file                 (catches both being edited together)
 *
 * ==================== WHY THE GATE STILL REFUSES TODAY ====================
 *
 * Two of its blockers are product-owner acts that §207 expressly does not perform: the review of
 * the frozen specification, and the authorization to execute. §207 authorizes ZERO fresh provider
 * calls, and this gate is where that is enforced rather than merely stated.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import {
  PREREGISTRATION_FILE, SECTION_207_DIR, TRUTH_SPECIFICATION_STATE,
  type TruthSpecificationState, type VerificationResult,
  preregistrationIdentity, verifyPreregistrationRecord,
} from './expert-207-preregistration';
import { GATES_ARE_PREREGISTERED } from './expert-207-gates';

export const EXECUTION_GATE_207_VERSION = 'hazlenz.expert.207.execution-gate.v1' as const;

/**
 * THE PIN. Computed by `freeze-207-preregistration.ts` from the frozen source and written here by
 * hand. If the §207 modules change in any way that alters the specification, this literal stops
 * matching and the harness refuses — which is the intended behaviour, not a defect to work around.
 */
export const EXPECTED_PREREGISTRATION_IDENTITY =
  '879a315009d4513206566e308b355ec9bd843cd35f951d29d2e644657d3580c4' as const;

export interface CohortExecutionAuthorization {
  /** A recorded product-owner act. No agent may set this and no default supplies it. */
  readonly productOwnerReviewRecorded: boolean;
  readonly cohortExecutionAuthorized: boolean;
  readonly authorizationReference: string | null;
}

export interface ExecutionGateResult {
  readonly permitted: boolean;
  readonly blockers: readonly string[];
  readonly verification: VerificationResult | null;
  readonly pin: string;
  readonly sourceIdentity: string;
}

export interface ExecutionGateInputs {
  readonly repoRoot: string;
  readonly truthSpecificationState?: TruthSpecificationState;
  readonly governedTransportSmokePassed: boolean;
  readonly authorization: CohortExecutionAuthorization;
  /** Test seam: supply a record directly instead of reading it from disk. */
  readonly recordOverride?: unknown;
  /** Test seam: supply a different pin, to prove the pin is actually load-bearing. */
  readonly pinOverride?: string;
}

export function preregistrationPath(repoRoot: string): string {
  return join(repoRoot, 'verification', SECTION_207_DIR, PREREGISTRATION_FILE);
}

/**
 * The refusal. It returns blockers rather than throwing so a harness can report every reason at
 * once; a harness that ignores `permitted` and runs anyway is outside what code can prevent, which
 * is why the §207 report states the property rather than only implementing it.
 */
export function cohortExecutionPermitted(inputs: ExecutionGateInputs): ExecutionGateResult {
  const blockers: string[] = [];
  const pin = inputs.pinOverride ?? EXPECTED_PREREGISTRATION_IDENTITY;
  const sourceIdentity = preregistrationIdentity();

  let raw: unknown = inputs.recordOverride;
  let verification: VerificationResult | null = null;

  if (raw === undefined) {
    const path = preregistrationPath(inputs.repoRoot);
    try {
      raw = JSON.parse(readFileSync(path, 'utf8')) as unknown;
    } catch {
      blockers.push(
        `the frozen preregistration record is missing or unreadable at ${path}. THE COHORT MAY NOT `
        + 'RUN WITHOUT IT: without the record there is nothing establishing that the expectations '
        + 'predate the output.');
      raw = undefined;
    }
  }

  if (raw !== undefined) {
    verification = verifyPreregistrationRecord(raw);
    if (verification.code !== 'VERIFIED') {
      blockers.push(
        `preregistration verification failed: ${verification.code} — ${verification.detail} `
        + `(recorded ${verification.recordedDigest ?? 'none'}, recomputed `
        + `${verification.recomputedDigest ?? 'none'}, source ${verification.sourceIdentity})`);
    } else if (verification.recomputedDigest !== pin) {
      blockers.push(
        `the preregistration identity ${verification.recomputedDigest} does not match the expected `
        + `identity ${pin} pinned in the execution gate. The record and the harness disagree about `
        + 'which specification is frozen.');
    }
  }

  const state = inputs.truthSpecificationState ?? TRUTH_SPECIFICATION_STATE;
  if (state !== 'FROZEN_BEFORE_PROVIDER_EXECUTION') {
    blockers.push(`truth specification is ${state}, not FROZEN_BEFORE_PROVIDER_EXECUTION`);
  }
  if (!GATES_ARE_PREREGISTERED) {
    blockers.push('the acceptance gates are proposed, not preregistered');
  }
  if (!inputs.governedTransportSmokePassed) {
    blockers.push(
      'the governed capability-present hosted transport smoke has not passed; block H would return '
      + 'NOT_EXERCISED again and gate G14 could not be met');
  }
  if (!inputs.authorization.productOwnerReviewRecorded) {
    blockers.push(
      'PRODUCT_OWNER_REVIEW_NOT_RECORDED — the frozen specification has not been read and accepted '
      + 'by the product owner. Freezing fixes the content; it does not decide whether the content '
      + 'is right, and executing against an unreviewed specification is the §199 mistake with a '
      + 'hash on top.');
  }
  if (!inputs.authorization.cohortExecutionAuthorized
    || inputs.authorization.authorizationReference === null) {
    blockers.push(
      'COHORT_EXECUTION_NOT_AUTHORIZED — §207 authorizes ZERO fresh provider calls. The next hosted '
      + 'execution requires a separate product-owner authorization, carrying a reference, after '
      + 'review of the frozen truth specification and preregistration.');
  }

  return { permitted: blockers.length === 0, blockers, verification, pin, sourceIdentity };
}

/** Asserted by the suite as literals. */
export function executionGateEffect(): {
  providerCalls: 0; databaseOperations: 0; cohortIsAuthorized: false; anythingIsExecuted: false;
} {
  return {
    providerCalls: 0, databaseOperations: 0, cohortIsAuthorized: false, anythingIsExecuted: false,
  };
}
