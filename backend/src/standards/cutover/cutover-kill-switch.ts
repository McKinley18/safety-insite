/**
 * THE GOVERNED-CUTOVER EMERGENCY STOP.
 *
 * WHY THIS MODULE EXISTS AS ITS OWN FILE -- 2026-08-29.
 *
 * The kill switch was born in KG-4C as a SHADOW control and lived in
 * `production-shadow-authorization.ts` beside the production-shadow locks. That placement was
 * accurate for what it then did and wrong for what it is: pre-cutover verification of the bounded
 * customer cutover measured, under a fully valid `GOVERNED_WITH_FALLBACK` production configuration
 * with the switch ENGAGED, that an allowlisted principal still resolved to
 * `GOVERNED_WITH_FALLBACK / ACCOUNT_ALLOWLISTED`, that a NEW inspection was still bound to the
 * active release, and that `inspection.knowledgeReleaseId` was still WRITTEN -- write-once, so it
 * survived the incident. The switch stopped DELIVERY and did not stop AUTHORITY.
 *
 * The root cause was structural, not a missing `if`. `production-shadow-authorization.ts` imports
 * `cutover-mode.ts`, so `cutover-mode.ts` -- where the authoritative "may this request enter
 * governed mode?" answer is produced -- could not consult the kill switch without a circular
 * import. The switch was therefore only ever reachable from modules DOWNSTREAM of the authority
 * decision. Extracting it here, below both, makes the authoritative resolver able to consult it,
 * which is the whole repair.
 *
 * THE ASYMMETRY, PRESERVED VERBATIM FROM KG-4C. Authorizing controls are EXACT: a lock opens only
 * on one precise sentinel. Disabling controls are PERMISSIVE: this brake engages on ANY non-empty,
 * non-whitespace value -- `'engaged'`, `'true'`, `'1'`, `'off'`, `'false'`, `'0'`, `'STOP'`. An
 * operator stopping governance under pressure must not have to remember an exact spelling, and a
 * typo must never leave governance running. That behaviour is unchanged by this move; only the
 * file it lives in and the set of modules that may consult it have changed.
 *
 * THIS MODULE IMPORTS NOTHING. It is the bottom of the cutover dependency graph on purpose, so
 * every layer above it can reach the brake and no layer can be the reason the brake is unreachable.
 */

type Env = Record<string, string | undefined>;

export const CUTOVER_KILL_SWITCH_ENV = 'GOVERNED_CUTOVER_KILL_SWITCH';

/**
 * The in-process latch. Set by the circuit breaker (or by an operator-triggered path in a future
 * slice) and checked on every enablement decision, so it takes effect on the NEXT eligible request
 * with no restart, no redeploy and no database write.
 *
 * Module-level mutable state is used HERE and nowhere else in the cutover subsystem, and the
 * exception is deliberate: a kill switch that is scoped per request cannot stop anything. Its only
 * possible transitions are off -> on (any code path) and on -> off (explicit operator reset), so it
 * can never make governance *more* active than configuration already permits.
 *
 * ONE INSTANCE, ENFORCED BY MODULE IDENTITY. `production-shadow-authorization.ts` re-exports the
 * functions below rather than declaring its own latch, so every consumer -- old import path or new
 * -- observes the same latch. Two latches would mean an operator could reset one and leave the
 * other engaged.
 */
let runtimeKillSwitch: { engaged: boolean; reason: string | null; engagedAt: string | null } = {
  engaged: false, reason: null, engagedAt: null,
};

export type KillSwitchSource = 'NONE' | 'ENVIRONMENT' | 'RUNTIME_LATCH';

export interface KillSwitchState {
  engaged: boolean;
  source: KillSwitchSource;
  /** Categorical reason. Never customer data. */
  reason: string | null;
  engagedAt: string | null;
}

/**
 * Engages the runtime kill switch. Idempotent: a second call does not overwrite the first reason,
 * because the FIRST cause is the one an operator needs during an incident.
 */
export function engageRuntimeKillSwitch(reason: string): KillSwitchState {
  if (!runtimeKillSwitch.engaged) {
    runtimeKillSwitch = {
      engaged: true,
      reason: String(reason || 'UNSPECIFIED').slice(0, 120),
      engagedAt: new Date().toISOString(),
    };
  }
  return { ...runtimeKillSwitch, source: 'RUNTIME_LATCH' };
}

/** Explicit operator reset. Separate from engaging so a reset is never accidental. */
export function resetRuntimeKillSwitch(): void {
  runtimeKillSwitch = { engaged: false, reason: null, engagedAt: null };
}

/**
 * Resolves the kill switch from BOTH sources.
 *
 * PERMISSIVE ON PURPOSE. Any non-empty, non-whitespace value of the environment variable engages
 * it. `'engaged'`, `'true'`, `'1'`, `'yes'`, `'STOP'`, `'please stop'` -- all engage. This is the
 * exact opposite of the acknowledgement rule in `production-shadow-authorization.ts`, and the
 * asymmetry is the point: locks must not open by accident, brakes must not fail to bite.
 */
export function resolveKillSwitch(env: Env = process.env): KillSwitchState {
  const raw = env[CUTOVER_KILL_SWITCH_ENV];
  if (raw !== undefined && raw !== null && String(raw).trim() !== '') {
    return {
      engaged: true, source: 'ENVIRONMENT',
      reason: 'ENV_KILL_SWITCH_SET', engagedAt: null,
    };
  }
  if (runtimeKillSwitch.engaged) {
    return { ...runtimeKillSwitch, source: 'RUNTIME_LATCH' };
  }
  return { engaged: false, source: 'NONE', reason: null, engagedAt: null };
}
