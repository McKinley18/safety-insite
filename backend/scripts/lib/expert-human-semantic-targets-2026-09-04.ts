/**
 * FROZEN HUMAN-REVIEWED SEMANTIC TARGETS. §162, product owner, 2026-09-04.
 *
 * Copied verbatim from the §162 re-derivation and extracted here so that later operations import the
 * SAME bytes rather than retyping them. Any consumer must assert this module still deep-equals the
 * targets recorded in
 * `verification/expert-hazlenz-verifier-human-truth-reconciliation-2026-09-04/HUMAN-SEMANTIC-REDERIVATION.json`
 * before scoring anything with it -- see `assertTargetsMatchSection162()`.
 *
 * ==================== WHAT THESE ARE AND ARE NOT ====================
 *
 * They are the product owner's own statement of what fact a clarification must reach on the two rows
 * human review left authoritative. They are NOT a scorer, and `matchAny` is NOT the retired keyword
 * scorer under a new name:
 *
 *   - every cue set requires BOTH a safeguard reference AND a function/status reference, so stated
 *     PHYSICAL PRESENCE alone can never satisfy one -- the exact inference the owner prohibited;
 *   - `assertCuesNotSatisfiedByObservation()` refuses to let any consumer score if a cue set is
 *     satisfied by the observation text itself, which is the §160 FINDING 1 failure that retired the
 *     keyword scorer;
 *   - a cue only IDENTIFIES candidate text. The classification is traceable to the target and the
 *     verbatim question is recorded beside every match so a human can check it.
 *
 * Truth may not be broadened here. Adding an equivalent is a product-owner act, not an engineering
 * one.
 */

export const HUMAN_SEMANTIC_TARGETS_VERSION =
  'hazlenz.expert.human-semantic-targets.2026-09-04' as const;

export interface HumanSemanticTarget {
  readonly target: string;
  readonly acceptableEquivalents: readonly string[];
  /** Cue sets. Each requires a safeguard reference AND a function/status reference. */
  readonly matchAny: readonly (readonly string[])[];
  readonly mustNotRequire: string;
  readonly mustNotEncode?: string;
  readonly affectedDecision: string;
}

export const HUMAN_SEMANTIC_TARGETS: Readonly<Record<string, HumanSemanticTarget>> = {
  'HS-A1': {
    target: 'the functional status/effectiveness of the burner flame-failure safeguard',
    acceptableEquivalents: [
      'whether the flame-failure safeguard is functional',
      'whether loss-of-flame shutdown has been function-tested',
      'whether the burner automatically shuts fuel off on flame loss',
      'whether the safeguard is bypassed, defeated, failed, or otherwise nonfunctional',
    ],
    matchAny: [
      ['flame', 'function'], ['flame', 'verified as functional'], ['flame', 'tested'],
      ['flame', 'operational'], ['flame-safeguard', 'status'],
      ['shut', 'flame loss'], ['bypass', 'flame'], ['defeat', 'flame'],
    ],
    mustNotRequire: 'the literal phrase "flame-failure device"',
    affectedDecision: 'REQUIRED_CONTROL',
  },
  'HS-E1': {
    target: 'whether the rotor-guard interlock protective function was verified after reassembly / '
      + 'before return to service',
    acceptableEquivalents: [
      'whether the interlock was function-tested after reassembly',
      'whether opening the guard stops or prevents rotor operation',
      'whether safeguarding function was verified before return to service',
    ],
    matchAny: [
      ['interlock', 'function'], ['interlock', 'tested'], ['interlock', 'verif'],
      ['guard', 'stops'], ['guard', 'prevent'], ['rotor', 'stop'],
      ['safeguarding function', 'verif'],
    ],
    mustNotRequire: 'the literal phrase "function-tested after the rotor tooth change"',
    mustNotEncode: 'that OSHA requires a specific post-maintenance test after every rotor tooth '
      + 'change — HS-E1 was supplied NO governed evidence, so no such requirement is independently '
      + 'established',
    affectedDecision: 'REQUIRED_CONTROL',
  },
};

/** A cue only identifies candidate text; the classification traces to the target above. */
export function semanticCueMatch(question: string, rowId: string):
{ reached: boolean; via: string | null } {
  const q = question.toLowerCase();
  for (const set of HUMAN_SEMANTIC_TARGETS[rowId].matchAny) {
    if (set.every(k => q.includes(k))) return { reached: true, via: JSON.stringify(set) };
  }
  return { reached: false, via: null };
}

/** Refuses to let a consumer score if the cue sets are satisfied by the observation itself. */
export function assertCuesNotSatisfiedByObservation(
  observationsByRow: Readonly<Record<string, string>>,
): void {
  const bad: string[] = [];
  for (const rowId of Object.keys(HUMAN_SEMANTIC_TARGETS)) {
    const obs = observationsByRow[rowId];
    if (!obs) continue;
    const m = semanticCueMatch(obs, rowId);
    if (m.reached) bad.push(`${rowId} via ${m.via}`);
  }
  if (bad.length > 0) {
    throw new Error('OBSERVATION_SELF_SATISFACTION_GUARD_TRIPPED — a cue set is satisfied by the '
      + `observation itself on: ${bad.join('; ')}. That is the §160 FINDING 1 defect that retired `
      + 'the keyword scorer. Refusing to score.');
  }
}

/** Proves this module has not drifted from the §162 record before anything is scored with it. */
export function assertTargetsMatchSection162(section162Targets: unknown): void {
  const mine = JSON.stringify(HUMAN_SEMANTIC_TARGETS);
  const theirs = JSON.stringify(section162Targets);
  if (mine !== theirs) {
    throw new Error('HUMAN_SEMANTIC_TARGET_DRIFT — this module no longer matches the targets '
      + 'recorded in §162. Truth may not be broadened or narrowed by an engineering edit.');
  }
}
