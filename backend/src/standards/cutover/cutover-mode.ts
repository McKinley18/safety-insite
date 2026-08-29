/**
 * KG-4A -- the controlled-cutover MODE CONTRACT.
 *
 * WHAT THIS IS FOR. KG-3F proved the governed regulatory foundation is correct enough to design a
 * customer cutover. It did NOT authorise one. This module is the single place that decides whether
 * governed retrieval may influence a customer request, and it is built so that the answer is
 * "no" unless somebody has deliberately and explicitly said otherwise on the SERVER.
 *
 * THE FOUR RULES THAT SHAPE EVERY LINE BELOW.
 *
 *  1. NO MISSING VARIABLE MAY ENABLE CUTOVER. `resolveCutoverMode({})` is `LEGACY`. There is no
 *     "unset means inherit", no "unset means shadow", no default that is not the safest value.
 *
 *  2. NO TRUTHY-STRING PARSING. Modes are matched against an exact closed set after `trim()` and
 *     `toUpperCase()`. `Boolean(env.X)` is never used, so `"false"`, `"0"`, `"off"`, `"no"` and
 *     every other string that is truthy in JavaScript resolve to `LEGACY` (via
 *     `INVALID_MODE_VALUE`) rather than to a governed mode. This class of bug is the reason the
 *     parser returns a *reason code* rather than just a mode -- an invalid value must be
 *     observable, not silently absorbed.
 *
 *  3. TWO INDEPENDENT LOCKS. A governed mode is necessary but NOT sufficient. The request must
 *     also match a server-side enablement boundary (Phase 13). Both default to off, so a single
 *     mistake -- a stray env var, a copy-pasted config, a bad deploy -- cannot expose customers to
 *     governed retrieval on its own.
 *
 *  4. AND ONE BRAKE THAT OVERRIDES BOTH LOCKS (2026-08-29). Locks decide what governance is
 *     CONFIGURED to do. `GOVERNED_CUTOVER_KILL_SWITCH` decides whether it may happen AT ALL right
 *     now, and it is consulted HERE -- in the one function that answers "may this customer request
 *     enter governed mode?" -- rather than by each downstream consumer. See the repair note on
 *     `resolveCutoverEnablement()` for why that placement is the entire fix.
 *
 * WHY MODE LIVES IN THE ENVIRONMENT AND NOT IN THE DATABASE. Rollback (Phase 14) must not require a
 * database write, a migration, a release de-activation or a corpus redeploy. An environment
 * variable is the narrowest reversible server-side mechanism available here, and it affects future
 * requests only -- it cannot rewrite an analysis that already recorded truthful provenance.
 */

import { resolveKillSwitch, type KillSwitchState } from './cutover-kill-switch';

/**
 * What governed retrieval is allowed to do to a customer request.
 *
 * The ordering of the union is deliberate: it runs from "governed resolution cannot touch the
 * customer at all" to "only governed content may be presented as verified regulation".
 */
export type GovernedCutoverMode =
  /**
   * Today's shipped behaviour, exactly. The governed resolver is NOT executed -- not for
   * telemetry, not for comparison, not at all. `resolveStandardsBacking()` receives
   * `governed: null`, which is what it already receives in the working tree, so LEGACY is a
   * provable no-op rather than a re-implementation of the current path.
   */
  | 'LEGACY'
  /**
   * The customer receives LEGACY output, byte-for-byte. The governed resolver runs alongside it
   * and its result is recorded for comparison (Phase 12) and discarded from the response.
   *
   * A shadow run is NOT consumption: it must never set `knowledgeReleaseId`, never change
   * ranking, membership, count, text, citation or backing status. That is enforced structurally --
   * the shadow result never reaches `resolveStandardsBacking()` -- not by convention.
   */
  | 'SHADOW'
  /**
   * Approved governed content is preferred when it is available for the EXACT citation HazLenz
   * selected. When it is not, the fallback contract (`fallback-contract.ts`) decides what the
   * customer sees. Citations are never deleted merely because governance cannot back them, and a
   * neighbouring regulation is never substituted for one that is missing.
   */
  | 'GOVERNED_WITH_FALLBACK'
  /**
   * Only exact approved governed content may be represented as verified regulatory text. Legacy
   * corpus text is never presented. Useful for isolated verification and for a possible future
   * operating posture.
   *
   * DELIBERATELY NOT A CANDIDATE FOR THE CUSTOMER DEFAULT. KG-3F measured 23 of 160 declared
   * citations as emitted-and-approved; strict mode would strip HazLenz-authored text from the
   * other 137 for every customer at once. Strictness about *claims* is the goal; strictness about
   * *display* is a different and much more disruptive thing.
   */
  | 'GOVERNED_STRICT';

export const GOVERNED_CUTOVER_MODES: readonly GovernedCutoverMode[] =
  Object.freeze(['LEGACY', 'SHADOW', 'GOVERNED_WITH_FALLBACK', 'GOVERNED_STRICT'] as const);

/** The one safe value. Referenced by name everywhere rather than repeated as a literal. */
export const DEFAULT_CUTOVER_MODE: GovernedCutoverMode = 'LEGACY';

/** Why the resolved mode is what it is. Categorical; safe to log; never contains customer data. */
export type CutoverModeReason =
  | 'DEFAULT_NO_CONFIGURATION'
  | 'EXPLICIT_MODE'
  | 'INVALID_MODE_VALUE'
  | 'PRODUCTION_GUARD_FORCED_LEGACY';

export interface CutoverModeResolution {
  /** The mode the server will operate in. Never governed unless explicitly and validly set. */
  mode: GovernedCutoverMode;
  reason: CutoverModeReason;
  /**
   * The raw value as configured, retained ONLY when it failed to parse, so an operator can see
   * what was rejected. Truncated; never interpolated into customer-visible output.
   */
  rejectedValue?: string;
  /**
   * True when configuration asked for a governed/shadow mode in production without the explicit
   * production acknowledgement. Startup validation turns this into a hard failure.
   */
  productionGuardTriggered: boolean;
}

export const CUTOVER_MODE_ENV = 'GOVERNED_CUTOVER_MODE';
export const CUTOVER_ALLOWLIST_ENV = 'GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST';
export const CUTOVER_ORG_ALLOWLIST_ENV = 'GOVERNED_CUTOVER_ORG_ALLOWLIST';
export const CUTOVER_PRODUCTION_ACK_ENV = 'GOVERNED_CUTOVER_PRODUCTION_ACK';

type Env = Record<string, string | undefined>;

/**
 * Resolves the server's cutover mode from the environment.
 *
 * Pure and total: every input -- missing, empty, whitespace, wrong case, a truthy non-mode string,
 * an object with no keys -- produces a defined `CutoverModeResolution`, and every input that is not
 * an exact member of `GOVERNED_CUTOVER_MODES` produces `LEGACY`.
 *
 * The production guard is separate from parsing on purpose. Parsing must stay pure so it can be
 * exhaustively tested; refusing to *start* is a startup concern and lives in
 * `assertCutoverConfigurationSafeForProduction()`, which follows the convention already
 * established by `config/validate-production-environment.ts`.
 */
export function resolveCutoverMode(env: Env = process.env): CutoverModeResolution {
  const raw = env[CUTOVER_MODE_ENV];

  if (raw === undefined || raw === null || String(raw).trim() === '') {
    return { mode: DEFAULT_CUTOVER_MODE, reason: 'DEFAULT_NO_CONFIGURATION', productionGuardTriggered: false };
  }

  const normalized = String(raw).trim().toUpperCase();
  const matched = GOVERNED_CUTOVER_MODES.find((mode) => mode === normalized);

  if (!matched) {
    // Fail safe AND stay observable. Returning LEGACY means a typo can never expose customers;
    // returning the reason means it can never pass unnoticed either.
    return {
      mode: DEFAULT_CUTOVER_MODE,
      reason: 'INVALID_MODE_VALUE',
      rejectedValue: String(raw).slice(0, 64),
      productionGuardTriggered: false,
    };
  }

  if (matched === 'LEGACY') {
    return { mode: 'LEGACY', reason: 'EXPLICIT_MODE', productionGuardTriggered: false };
  }

  // A non-legacy mode in production requires a second, differently-named acknowledgement. One
  // variable set by accident cannot reach customers; two cannot be set by accident.
  const isProduction = String(env.NODE_ENV || '').trim() === 'production';
  const acknowledged = String(env[CUTOVER_PRODUCTION_ACK_ENV] || '').trim() === 'I_ACKNOWLEDGE_GOVERNED_CUTOVER';
  if (isProduction && !acknowledged) {
    return {
      mode: DEFAULT_CUTOVER_MODE,
      reason: 'PRODUCTION_GUARD_FORCED_LEGACY',
      rejectedValue: matched,
      productionGuardTriggered: true,
    };
  }

  return { mode: matched, reason: 'EXPLICIT_MODE', productionGuardTriggered: false };
}

/** True for the two modes in which governed content may influence what the customer sees. */
export function modeInfluencesCustomerOutput(mode: GovernedCutoverMode): boolean {
  return mode === 'GOVERNED_WITH_FALLBACK' || mode === 'GOVERNED_STRICT';
}

/** True for every mode in which the governed resolver is executed at all. */
export function modeExecutesGovernedResolution(mode: GovernedCutoverMode): boolean {
  return mode !== 'LEGACY';
}

// ------------------------------------------------------------------ enablement boundary (Phase 13)

/** Why a specific request is or is not enabled for governed retrieval. Categorical; loggable. */
export type CutoverEnablementReason =
  | 'MODE_IS_LEGACY'
  | 'NO_ALLOWLIST_CONFIGURED'
  | 'ACCOUNT_ALLOWLISTED'
  | 'ORGANIZATION_ALLOWLISTED'
  | 'NOT_ALLOWLISTED'
  | 'NO_PRINCIPAL'
  /**
   * The emergency stop is engaged. Deliberately its OWN reason rather than a reuse of
   * `MODE_IS_LEGACY` or `NO_ALLOWLIST_CONFIGURED`: those two describe a configuration that was
   * never governed, and reporting either here would tell an operator to go and fix a mode or an
   * allowlist that is in fact still exactly as they left it. The distinction matters most during
   * an incident, which is the only time this value is ever produced.
   */
  | 'KILL_SWITCH_ENGAGED';

export interface CutoverEnablement {
  /** The mode this REQUEST runs in, after the enablement boundary is applied. */
  effectiveMode: GovernedCutoverMode;
  /** The server-wide configured mode, before the boundary. Kept for observability. */
  configuredMode: GovernedCutoverMode;
  enabled: boolean;
  reason: CutoverEnablementReason;
  /**
   * The emergency stop as an explicit, separately observable fact.
   *
   * `killSwitch.engaged === true` ALWAYS implies `enabled === false` and
   * `effectiveMode === 'LEGACY'`. It is surfaced rather than merely applied so telemetry and the
   * production-shadow gate can say *the brake is on* without re-reading the environment and
   * arriving at a second, possibly different, interpretation of it.
   */
  killSwitch: KillSwitchState;
  /**
   * What enablement WOULD be with the emergency stop released -- i.e. the standing configuration.
   *
   * NEVER authoritative for a request. It exists so that "the brake stopped this" and "this was
   * reconfigured" stay distinguishable: `production-shadow-authorization.ts` reports its
   * `PRINCIPAL_ELIGIBILITY` lock from this field, which keeps the KG-4C property that the kill
   * switch *overrides* the locks rather than *closing* them.
   */
  standing: { enabled: boolean; reason: CutoverEnablementReason };
}

export interface CutoverPrincipal {
  userId?: string | null;
  organizationId?: string | null;
}

function parseAllowlist(value: string | undefined): Set<string> {
  return new Set(
    String(value || '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean),
  );
}

/**
 * Decides whether ONE request may run in the configured non-legacy mode.
 *
 * DEFAULTS OFF TWICE. A governed mode with no allowlist enables nobody
 * (`NO_ALLOWLIST_CONFIGURED`), so setting the mode alone is inert. This is what makes the eventual
 * first cutover narrow: an operator names the accounts, and only those accounts move.
 *
 * SERVER-SIDE ONLY. The principal comes from the authenticated JWT-derived user, never from a
 * request body, query parameter or header. There is deliberately no request-scoped override of any
 * kind -- a customer cannot turn governed retrieval on for themselves, and cannot turn it on for
 * anybody else. Enablement is per-principal, so one account being allowlisted says nothing about
 * any other account, which is the tenancy property Phase 18 verifies.
 *
 * AND IT IS THE EMERGENCY STOP'S ONE HOME (2026-08-29). This is the canonical answer to "may this
 * customer request enter governed mode right now?", so `GOVERNED_CUTOVER_KILL_SWITCH` is applied
 * here and nowhere downstream. Every consumer that decides durable state -- the controller's
 * release binding, `GovernedCutoverContext.create()`, the shadow orchestrator, and the persistence
 * provenance gate in `inspection.service.ts` -- reads this result, so the brake reaches all four by
 * construction rather than by four remembered checks.
 */
export function resolveCutoverEnablement(
  principal: CutoverPrincipal | null | undefined,
  env: Env = process.env,
  configured: CutoverModeResolution = resolveCutoverMode(env),
): CutoverEnablement {
  const configuredMode = configured.mode;
  const killSwitch = resolveKillSwitch(env);

  // The STANDING answer: what the configuration says, with the brake ignored. Computed first and
  // in one place so the brake never has to be woven through the allowlist logic, and so an
  // operator can always see the configuration they still have.
  const standing = standingEnablement(principal, env, configuredMode);

  // THE EMERGENCY STOP, APPLIED WHERE AUTHORITY IS DECIDED -- the 2026-08-29 repair.
  //
  // WHAT WAS WRONG. The switch was consulted only inside `orchestrateShadowRequest()`, which runs
  // AFTER the controller has already resolved the release binding and is not consulted at all by
  // `inspection.service.ts`'s provenance gate. Measured with the switch engaged under a valid
  // GOVERNED_WITH_FALLBACK production configuration, an allowlisted principal still resolved to
  // `GOVERNED_WITH_FALLBACK / ACCOUNT_ALLOWLISTED`, a NEW inspection was still bound to the active
  // release, and `inspection.knowledgeReleaseId` was still written -- write-once, so the incident
  // left durable governed provenance behind it. A brake that stops delivery but not authority is
  // not an emergency stop.
  //
  // WHY IT IS HERE AND NOT AT THE CALL SITES. There must be exactly ONE answer to "may this
  // customer request enter governed mode right now?", and this function is it: the controller's
  // release binding, `GovernedCutoverContext.create()`, the orchestrator and the persistence
  // provenance gate all read it. Adding a kill-switch check to each consumer instead would create
  // four independent interpretations of one variable, and the defect being repaired is precisely
  // what happens when one consumer is missed.
  //
  // WHY IT IS EVALUATED AFTER `MODE_IS_LEGACY`. On a legacy server there is no governance to stop,
  // and `MODE_IS_LEGACY` is the more informative answer -- reporting `KILL_SWITCH_ENGAGED` there
  // would imply a brake is holding back something that was never configured to run. Everywhere
  // else the brake dominates, including `NOT_ALLOWLISTED` and `NO_PRINCIPAL`, because during an
  // incident the operator needs to know the brake is the thing they will have to release.
  //
  // WHAT IT DELIBERATELY DOES NOT DO. It does not rewrite history. This function decides only
  // whether a request may become governed FROM NOW ON; an inspection that acquired its
  // `knowledgeReleaseId` before the stop keeps it, because nothing here reads or clears that column
  // and `resolveInspectionReleaseBinding()` returns before touching the database.
  const decided = (
    effectiveMode: GovernedCutoverMode, enabled: boolean, reason: CutoverEnablementReason,
  ): CutoverEnablement => ({ effectiveMode, configuredMode, enabled, reason, killSwitch, standing });

  if (configuredMode === 'LEGACY') return decided('LEGACY', false, 'MODE_IS_LEGACY');
  if (killSwitch.engaged) return decided('LEGACY', false, 'KILL_SWITCH_ENGAGED');

  return decided(
    standing.enabled ? configuredMode : 'LEGACY', standing.enabled, standing.reason,
  );
}

/**
 * The KG-4A enablement boundary exactly as it was, with the emergency stop factored out.
 *
 * Kept as its own function so the brake and the boundary cannot be confused for one another: this
 * answers "is this principal named in the configuration?", and nothing else.
 */
function standingEnablement(
  principal: CutoverPrincipal | null | undefined,
  env: Env,
  configuredMode: GovernedCutoverMode,
): { enabled: boolean; reason: CutoverEnablementReason } {
  if (configuredMode === 'LEGACY') return { enabled: false, reason: 'MODE_IS_LEGACY' };

  const accounts = parseAllowlist(env[CUTOVER_ALLOWLIST_ENV]);
  const organizations = parseAllowlist(env[CUTOVER_ORG_ALLOWLIST_ENV]);
  if (accounts.size === 0 && organizations.size === 0) {
    return { enabled: false, reason: 'NO_ALLOWLIST_CONFIGURED' };
  }

  const userId = String(principal?.userId || '').trim();
  const organizationId = String(principal?.organizationId || '').trim();
  if (!userId && !organizationId) return { enabled: false, reason: 'NO_PRINCIPAL' };

  if (userId && accounts.has(userId)) return { enabled: true, reason: 'ACCOUNT_ALLOWLISTED' };
  if (organizationId && organizations.has(organizationId)) {
    return { enabled: true, reason: 'ORGANIZATION_ALLOWLISTED' };
  }
  return { enabled: false, reason: 'NOT_ALLOWLISTED' };
}

/**
 * Startup validation, in the style of `config/validate-production-environment.ts`.
 *
 * Called from that module so there is one production-safety entry point rather than two that can
 * drift. Refuses to start rather than run production in a mode nobody acknowledged -- the
 * "fail startup according to established configuration conventions" branch of the KG-4A contract.
 */
export function assertCutoverConfigurationSafeForProduction(env: Env = process.env): void {
  // THE EMERGENCY STOP IS DELIBERATELY NOT CONSULTED HERE, and that is a decision rather than an
  // omission. The kill switch stops governance from RUNNING; it is not consent to BOOT with a
  // configuration nobody acknowledged or a mode value nobody recognises. If engaging the brake
  // suppressed these refusals, an operator could quiet a malformed production configuration by
  // pulling the brake, and the misconfiguration would then go live the moment the brake was
  // released -- which is exactly the moment nobody is looking for it.
  if (String(env.NODE_ENV || '').trim() !== 'production') return;
  const resolution = resolveCutoverMode(env);
  if (resolution.productionGuardTriggered) {
    throw new Error(
      `${CUTOVER_MODE_ENV} is set to '${resolution.rejectedValue}' in production without ` +
      `${CUTOVER_PRODUCTION_ACK_ENV}. Governed customer cutover must be explicitly acknowledged.`,
    );
  }
  if (resolution.reason === 'INVALID_MODE_VALUE') {
    throw new Error(
      `${CUTOVER_MODE_ENV} has an unrecognised value. Valid values: ${GOVERNED_CUTOVER_MODES.join(', ')}.`,
    );
  }
}
