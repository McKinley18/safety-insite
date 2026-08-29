/**
 * KG-4C -- production SHADOW authorization, staging, kill switch and cohort eligibility.
 *
 * WHAT THIS IS FOR. KG-4A built two locks (server mode, principal allowlist) and proved they
 * default off. KG-4B proved SHADOW is customer-invisible in an isolated environment. Neither
 * authorizes production. This module is the gate a future production shadow must pass, and it is
 * built so that the answer is "not authorized" unless several independent, differently-named,
 * exactly-valued server-side controls all agree.
 *
 * THE ASYMMETRY THAT SHAPES EVERY FUNCTION BELOW.
 *
 *   AUTHORIZING controls must be EXACT.   A lock opens only on one precise sentinel. Near-misses,
 *                                         truthy strings, wrong case and whitespace all fail closed.
 *   DISABLING controls must be PERMISSIVE. A kill switch engages on ANY non-empty value. An
 *                                         operator disabling shadow under pressure must not have to
 *                                         remember an exact spelling, and a typo must not leave
 *                                         shadow running.
 *
 * Treating those two the same way is how safety mechanisms fail: either the lock opens by accident,
 * or the brake does not.
 *
 * NO CLIENT INPUT REACHES ANY DECISION HERE. Every input is either the server environment or the
 * authenticated, JWT-derived principal that KG-4A already established. There is no body, query,
 * header or param path into this module -- asserted by test, not by convention.
 *
 * THIS MODULE IMPORTS ONLY `cutover-mode` AND `cutover-kill-switch`. Like both of those it is
 * deliberately close to dependency-free, so it cannot become a second route into governed data.
 */

import { createHash } from 'crypto';
import {
  resolveCutoverMode, resolveCutoverEnablement,
  CUTOVER_ALLOWLIST_ENV, CUTOVER_ORG_ALLOWLIST_ENV, CUTOVER_PRODUCTION_ACK_ENV,
  type CutoverModeResolution, type CutoverPrincipal, type GovernedCutoverMode,
} from './cutover-mode';
import {
  CUTOVER_KILL_SWITCH_ENV,
  engageRuntimeKillSwitch, resetRuntimeKillSwitch, resolveKillSwitch,
  type KillSwitchSource, type KillSwitchState,
} from './cutover-kill-switch';

type Env = Record<string, string | undefined>;

// ------------------------------------------------------------------ Section 1: the locks

export const PRODUCTION_SHADOW_ACK_ENV = 'GOVERNED_CUTOVER_PRODUCTION_SHADOW_ACK';
export const SHADOW_STAGE_ENV = 'GOVERNED_CUTOVER_SHADOW_STAGE';
/**
 * Retained under its KG-4C name because every existing suite and runbook refers to it. It is now
 * an alias for the canonical `CUTOVER_KILL_SWITCH_ENV`: the variable stops ALL governed cutover,
 * not shadow alone, so the canonical name no longer says `SHADOW`.
 */
export const SHADOW_KILL_SWITCH_ENV = CUTOVER_KILL_SWITCH_ENV;
export const SHADOW_COHORT_BPS_ENV = 'GOVERNED_CUTOVER_SHADOW_COHORT_BPS';
export const SHADOW_COHORT_SALT_ENV = 'GOVERNED_CUTOVER_SHADOW_COHORT_SALT';

/**
 * The exact and only value that opens the production-shadow lock.
 *
 * DELIBERATELY DIFFERENT FROM KG-4A's `I_ACKNOWLEDGE_GOVERNED_CUTOVER`. That sentinel authorizes
 * *any* governed mode in production, including `GOVERNED_WITH_FALLBACK`, which changes what
 * customers see. This one authorizes SHADOW and nothing else. Two consequences the tests assert:
 *
 *   - the KG-4A sentinel alone does NOT authorize production shadow;
 *   - this sentinel alone does NOT authorize governed DELIVERY. Acknowledging a
 *     customer-invisible comparison must never be reusable as consent to change customer output.
 */
export const PRODUCTION_SHADOW_ACK_SENTINEL = 'I_ACKNOWLEDGE_PRODUCTION_SHADOW';

/** Every lock that must be open, named so a refusal can say exactly which one was shut. */
export type ProductionShadowLock =
  /** The server is configured for SHADOW. */
  | 'SERVER_MODE'
  /** This principal is eligible (allowlist, or a deterministic cohort at stage 3+). */
  | 'PRINCIPAL_ELIGIBILITY'
  /** KG-4A's general governed-cutover production acknowledgement. */
  | 'GOVERNED_CUTOVER_PRODUCTION_ACK'
  /** KG-4C's shadow-specific production acknowledgement. */
  | 'PRODUCTION_SHADOW_ACK';

export const PRODUCTION_SHADOW_LOCKS: readonly ProductionShadowLock[] = Object.freeze([
  'SERVER_MODE', 'PRINCIPAL_ELIGIBILITY', 'GOVERNED_CUTOVER_PRODUCTION_ACK', 'PRODUCTION_SHADOW_ACK',
] as const);

/**
 * Why an acknowledgement value was accepted or rejected. Categorical and safe to log; the rejected
 * value itself is never echoed, because an operator pasting a secret into the wrong variable must
 * not have it copied into logs.
 */
export type AckVerdict =
  | 'ACK_MISSING'
  | 'ACK_EMPTY'
  | 'ACK_WHITESPACE_ONLY'
  | 'ACK_WRONG_VALUE'
  | 'ACK_WRONG_CASE'
  | 'ACK_NEAR_MATCH'
  | 'ACK_EXACT';

export interface AckEvaluation {
  verdict: AckVerdict;
  accepted: boolean;
  /** Length only. Enough to debug a truncated paste; carries nothing about the value. */
  observedLength: number;
}

/**
 * Evaluates one acknowledgement value against one exact sentinel.
 *
 * `trim()` is applied because a trailing newline from a secrets manager or a here-doc is an
 * artifact of transport, not an operator decision, and refusing it would produce a failure mode
 * that looks like a bug. NOTHING else is normalised: case is significant, and a value that differs
 * only in case is reported as `ACK_WRONG_CASE` rather than accepted, so a near-miss is visible
 * rather than silently rejected as "wrong value".
 *
 * `Boolean(...)` is never used. `'true'`, `'1'`, `'yes'`, `'on'` and every other truthy string
 * resolve to a rejection, exactly as `resolveCutoverMode()` does for modes.
 */
export function evaluateAcknowledgement(raw: unknown, sentinel: string): AckEvaluation {
  if (raw === undefined || raw === null) {
    return { verdict: 'ACK_MISSING', accepted: false, observedLength: 0 };
  }
  const asString = String(raw);
  if (asString === '') {
    return { verdict: 'ACK_EMPTY', accepted: false, observedLength: 0 };
  }
  const trimmed = asString.trim();
  if (trimmed === '') {
    return { verdict: 'ACK_WHITESPACE_ONLY', accepted: false, observedLength: asString.length };
  }
  if (trimmed === sentinel) {
    return { verdict: 'ACK_EXACT', accepted: true, observedLength: trimmed.length };
  }
  if (trimmed.toUpperCase() === sentinel.toUpperCase()) {
    return { verdict: 'ACK_WRONG_CASE', accepted: false, observedLength: trimmed.length };
  }
  // A near match is a value that contains, or is contained by, the sentinel -- the shape a
  // half-pasted or suffixed value takes. Reported separately so an operator can tell
  // "I got the variable right and the value wrong" from "I set something unrelated".
  const near = trimmed.includes(sentinel) || sentinel.includes(trimmed);
  return {
    verdict: near ? 'ACK_NEAR_MATCH' : 'ACK_WRONG_VALUE',
    accepted: false,
    observedLength: trimmed.length,
  };
}

// ------------------------------------------------------------------ Section 2: the stage model

/**
 * The staged rollout. There is NO automatic promotion between stages: the stage is read from the
 * environment, every stage has its own constraints, and moving from one to the next is a separate
 * deliberate configuration change by a human.
 *
 * The stage does not *grant* anything on its own -- all four locks still apply at every stage. What
 * it does is BOUND how wide eligibility may be, so a stage-1 configuration cannot accidentally
 * behave like a stage-4 one because somebody pasted a long allowlist.
 */
export type ProductionShadowStage =
  /** Code deployed, shadow disabled globally. The default and the only safe unset value. */
  | 'STAGE_0_DISABLED'
  /** Exactly one explicitly named internal/test account. */
  | 'STAGE_1_SINGLE_ACCOUNT'
  /** A small explicit allowlist. */
  | 'STAGE_2_SMALL_ALLOWLIST'
  /** A small deterministic server-side cohort, in addition to the allowlist. */
  | 'STAGE_3_DETERMINISTIC_COHORT'
  /** Broader shadow. Still allowlist/cohort-bounded; still fully reversible. */
  | 'STAGE_4_BROAD';

export const PRODUCTION_SHADOW_STAGES: readonly ProductionShadowStage[] = Object.freeze([
  'STAGE_0_DISABLED', 'STAGE_1_SINGLE_ACCOUNT', 'STAGE_2_SMALL_ALLOWLIST',
  'STAGE_3_DETERMINISTIC_COHORT', 'STAGE_4_BROAD',
] as const);

export const DEFAULT_SHADOW_STAGE: ProductionShadowStage = 'STAGE_0_DISABLED';

/**
 * How many explicitly named principals each stage permits, and whether the deterministic cohort is
 * available at all.
 *
 * STAGE_2's ceiling of 10 is a deliberate operational bound, not a statistical one: an operator
 * must be able to name, in one breath, every account affected by a first production cutover. The
 * moment that list is too long to read aloud, the mechanism has stopped being "narrow and
 * reversible" and the decision to widen deserves its own authorization -- which is what stage 3 is.
 */
export interface StageConstraints {
  maxNamedPrincipals: number;
  cohortSamplingAllowed: boolean;
  /** Upper bound on the deterministic cohort, in basis points (1 bps = 0.01%). */
  maxCohortBps: number;
}

export function stageConstraints(stage: ProductionShadowStage): StageConstraints {
  switch (stage) {
    case 'STAGE_1_SINGLE_ACCOUNT':
      return { maxNamedPrincipals: 1, cohortSamplingAllowed: false, maxCohortBps: 0 };
    case 'STAGE_2_SMALL_ALLOWLIST':
      return { maxNamedPrincipals: 10, cohortSamplingAllowed: false, maxCohortBps: 0 };
    case 'STAGE_3_DETERMINISTIC_COHORT':
      // 100 bps = 1%. Deliberately small: stage 3 exists to learn whether the cohort mechanism
      // behaves, not to gather volume. Volume is stage 4's job.
      return { maxNamedPrincipals: 50, cohortSamplingAllowed: true, maxCohortBps: 100 };
    case 'STAGE_4_BROAD':
      return { maxNamedPrincipals: 1000, cohortSamplingAllowed: true, maxCohortBps: 2500 };
    case 'STAGE_0_DISABLED':
    default:
      return { maxNamedPrincipals: 0, cohortSamplingAllowed: false, maxCohortBps: 0 };
  }
}

export interface StageResolution {
  stage: ProductionShadowStage;
  reason: 'DEFAULT_NO_CONFIGURATION' | 'EXPLICIT_STAGE' | 'INVALID_STAGE_VALUE';
  constraints: StageConstraints;
}

/** Same closed-set, fail-safe parsing discipline as `resolveCutoverMode()`. */
export function resolveShadowStage(env: Env = process.env): StageResolution {
  const raw = env[SHADOW_STAGE_ENV];
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    return {
      stage: DEFAULT_SHADOW_STAGE, reason: 'DEFAULT_NO_CONFIGURATION',
      constraints: stageConstraints(DEFAULT_SHADOW_STAGE),
    };
  }
  const normalized = String(raw).trim().toUpperCase();
  const matched = PRODUCTION_SHADOW_STAGES.find((stage) => stage === normalized);
  if (!matched) {
    return {
      stage: DEFAULT_SHADOW_STAGE, reason: 'INVALID_STAGE_VALUE',
      constraints: stageConstraints(DEFAULT_SHADOW_STAGE),
    };
  }
  return { stage: matched, reason: 'EXPLICIT_STAGE', constraints: stageConstraints(matched) };
}

// ------------------------------------------------------------------ Section 3: the kill switch

/**
 * MOVED, NOT CHANGED -- 2026-08-29.
 *
 * The emergency stop now lives in `cutover-kill-switch.ts`, one layer BELOW `cutover-mode.ts`, so
 * that the authoritative enablement resolver can consult it. It could not while it lived here:
 * this module imports `cutover-mode.ts`, so a consultation in the other direction would have been
 * a cycle -- which is precisely why the switch used to stop governed DELIVERY without stopping
 * governed AUTHORITY (release binding and `knowledgeReleaseId` assignment).
 *
 * Re-exported under the original names, including `SHADOW_KILL_SWITCH_ENV`, so every existing
 * import site and verification suite keeps working against the SAME runtime latch. There is one
 * latch, not two: these are re-exports of the extracted module's bindings, not a second copy.
 */
export { engageRuntimeKillSwitch, resetRuntimeKillSwitch, resolveKillSwitch };
export type { KillSwitchSource, KillSwitchState };

// ------------------------------------------------------------------ Section 4: cohort sampling

export type CohortDecision =
  | 'COHORT_DISABLED'
  | 'COHORT_NOT_PERMITTED_AT_STAGE'
  | 'COHORT_NO_STABLE_KEY'
  | 'COHORT_EXCLUDED'
  | 'COHORT_INCLUDED';

export interface CohortEvaluation {
  decision: CohortDecision;
  included: boolean;
  /** The effective sampling rate actually applied, after the stage ceiling. */
  effectiveBps: number;
  /** The deterministic bucket this key falls in, 0..9999. Null when no key was available. */
  bucket: number | null;
}

/**
 * Deterministic server-side cohort selection.
 *
 * THE KEY IS AN OPAQUE SERVER-SIDE IDENTIFIER, NEVER A PERSONAL ONE. Account id or organization id
 * only. Hashing an email address or a name would make cohort membership a function of personal
 * data and would put that data -- via the hash -- into an operational decision path and,
 * eventually, into telemetry. Opaque ids carry no such content.
 *
 * DETERMINISTIC AND STABLE. The same key and the same salt always produce the same bucket, so a
 * cohort is reproducible offline from configuration alone, and a principal does not flap in and out
 * of shadow between requests. Changing the salt deliberately reshuffles the cohort; that is the
 * supported way to select a *different* sample, and it is a configuration change, not a behaviour.
 *
 * NO CLIENT CONTROL. The key comes from the authenticated principal. Nothing a caller can send
 * influences the bucket.
 */
export function evaluateCohort(input: {
  principal: CutoverPrincipal | null | undefined;
  stage: ProductionShadowStage;
  env?: Env;
}): CohortEvaluation {
  const env = input.env ?? process.env;
  const constraints = stageConstraints(input.stage);

  const configuredBps = Number.parseInt(String(env[SHADOW_COHORT_BPS_ENV] ?? '').trim(), 10);
  const requestedBps = Number.isFinite(configuredBps) && configuredBps > 0 ? configuredBps : 0;
  if (requestedBps <= 0) {
    return { decision: 'COHORT_DISABLED', included: false, effectiveBps: 0, bucket: null };
  }
  if (!constraints.cohortSamplingAllowed) {
    // A cohort configured at a stage that does not permit one is INERT, not an error. The stage
    // ceiling wins, so a leftover variable from a later stage cannot widen an earlier one.
    return { decision: 'COHORT_NOT_PERMITTED_AT_STAGE', included: false, effectiveBps: 0, bucket: null };
  }

  const effectiveBps = Math.min(requestedBps, constraints.maxCohortBps);
  const key = String(input.principal?.userId || input.principal?.organizationId || '').trim();
  if (!key) {
    return { decision: 'COHORT_NO_STABLE_KEY', included: false, effectiveBps, bucket: null };
  }

  const salt = String(env[SHADOW_COHORT_SALT_ENV] ?? '').trim();
  const hash = createHash('sha256').update(`${salt}:${key}`).digest('hex').slice(0, 8);
  const bucket = Number.parseInt(hash, 16) % 10000;

  return bucket < effectiveBps
    ? { decision: 'COHORT_INCLUDED', included: true, effectiveBps, bucket }
    : { decision: 'COHORT_EXCLUDED', included: false, effectiveBps, bucket };
}

// ------------------------------------------------------------------ Section 5: the gate

export type ProductionShadowRefusal =
  | 'NOT_PRODUCTION'
  | 'KILL_SWITCH_ENGAGED'
  | 'MODE_NOT_SHADOW'
  | 'STAGE_DISABLED'
  | 'STAGE_PRINCIPAL_LIMIT_EXCEEDED'
  | 'PRINCIPAL_NOT_ELIGIBLE'
  | 'GOVERNED_CUTOVER_PRODUCTION_ACK_MISSING'
  | 'PRODUCTION_SHADOW_ACK_MISSING';

export interface ProductionShadowAuthorization {
  authorized: boolean;
  /** Every lock and whether it is open. Present even on refusal, so a diagnosis is one read. */
  locks: Record<ProductionShadowLock, boolean>;
  /** The FIRST closed lock, or a disabling override. Null when authorized. */
  refusal: ProductionShadowRefusal | null;
  stage: ProductionShadowStage;
  killSwitch: KillSwitchState;
  cohort: CohortEvaluation | null;
  mode: GovernedCutoverMode;
  /** True only when NODE_ENV is exactly 'production'. */
  isProduction: boolean;
  acks: {
    governedCutover: AckEvaluation;
    productionShadow: AckEvaluation;
  };
}

function countNamedPrincipals(env: Env): number {
  const parse = (value: string | undefined) =>
    String(value || '').split(',').map((v) => v.trim()).filter(Boolean);
  return parse(env[CUTOVER_ALLOWLIST_ENV]).length + parse(env[CUTOVER_ORG_ALLOWLIST_ENV]).length;
}

/**
 * THE production-shadow gate. All locks must be open; any disabling override wins.
 *
 * ORDER MATTERS FOR THE REFUSAL, NOT FOR THE ANSWER. Every lock is evaluated so the caller gets the
 * full picture, but the reported `refusal` is the first thing that would have to change -- which is
 * what an operator actually needs.
 *
 * OUTSIDE PRODUCTION this returns `authorized: false` with `NOT_PRODUCTION`, and that is not a
 * failure: KG-4A/KG-4B enablement continues to govern non-production servers exactly as before.
 * This gate adds requirements in production; it removes none anywhere.
 */
export function resolveProductionShadowAuthorization(input: {
  principal: CutoverPrincipal | null | undefined;
  env?: Env;
  configured?: CutoverModeResolution;
}): ProductionShadowAuthorization {
  const env = input.env ?? process.env;
  const configured = input.configured ?? resolveCutoverMode(env);
  const enablement = resolveCutoverEnablement(input.principal, env, configured);
  const stageResolution = resolveShadowStage(env);
  const killSwitch = resolveKillSwitch(env);
  const isProduction = String(env.NODE_ENV || '').trim() === 'production';

  const governedAck = evaluateAcknowledgement(env[CUTOVER_PRODUCTION_ACK_ENV], 'I_ACKNOWLEDGE_GOVERNED_CUTOVER');
  const productionShadowAck = evaluateAcknowledgement(env[PRODUCTION_SHADOW_ACK_ENV], PRODUCTION_SHADOW_ACK_SENTINEL);

  const cohort = isProduction
    ? evaluateCohort({ principal: input.principal, stage: stageResolution.stage, env })
    : null;

  const namedPrincipals = countNamedPrincipals(env);
  const withinStageLimit = namedPrincipals <= stageResolution.constraints.maxNamedPrincipals;

  // `standing`, not `enabled`, and deliberately so -- 2026-08-29.
  //
  // Since the emergency stop became part of the canonical enablement answer, `enablement.enabled`
  // is false whenever the brake is on. Reading it here would report `PRINCIPAL_ELIGIBILITY` as a
  // CLOSED lock during an incident, which would tell an operator their allowlist had changed when
  // it had not. `standing` is the configuration with the brake released, so the KG-4C property
  // holds unchanged: the kill switch OVERRIDES the locks (it is refused first, below) rather than
  // closing them.
  const principalEligible =
    stageResolution.stage !== 'STAGE_0_DISABLED' &&
    withinStageLimit &&
    (enablement.standing.enabled || Boolean(cohort?.included));

  const locks: Record<ProductionShadowLock, boolean> = {
    SERVER_MODE: configured.mode === 'SHADOW',
    PRINCIPAL_ELIGIBILITY: principalEligible,
    GOVERNED_CUTOVER_PRODUCTION_ACK: governedAck.accepted,
    PRODUCTION_SHADOW_ACK: productionShadowAck.accepted,
  };

  const base = {
    locks, stage: stageResolution.stage, killSwitch, cohort,
    mode: configured.mode, isProduction,
    acks: { governedCutover: governedAck, productionShadow: productionShadowAck },
  };

  const refuse = (refusal: ProductionShadowRefusal): ProductionShadowAuthorization =>
    ({ ...base, authorized: false, refusal });

  // Disabling overrides are evaluated FIRST and unconditionally. A kill switch that only applies
  // when everything else is already correct is not a kill switch.
  if (killSwitch.engaged) return refuse('KILL_SWITCH_ENGAGED');
  if (!isProduction) return refuse('NOT_PRODUCTION');

  if (!locks.SERVER_MODE) return refuse('MODE_NOT_SHADOW');
  if (stageResolution.stage === 'STAGE_0_DISABLED') return refuse('STAGE_DISABLED');
  if (!withinStageLimit) return refuse('STAGE_PRINCIPAL_LIMIT_EXCEEDED');
  if (!locks.PRINCIPAL_ELIGIBILITY) return refuse('PRINCIPAL_NOT_ELIGIBLE');
  if (!locks.GOVERNED_CUTOVER_PRODUCTION_ACK) return refuse('GOVERNED_CUTOVER_PRODUCTION_ACK_MISSING');
  if (!locks.PRODUCTION_SHADOW_ACK) return refuse('PRODUCTION_SHADOW_ACK_MISSING');

  return { ...base, authorized: true, refusal: null };
}

/**
 * The property that keeps the shadow acknowledgement from becoming consent to change customer
 * output: it authorizes SHADOW and refuses every mode that can influence a customer.
 *
 * Exported as a predicate rather than left implicit so the contract suite can assert it directly
 * over every mode, including any mode added later.
 */
export function productionShadowAckAuthorizes(mode: GovernedCutoverMode): boolean {
  return mode === 'SHADOW';
}
