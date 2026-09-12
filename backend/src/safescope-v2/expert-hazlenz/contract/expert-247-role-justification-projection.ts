/**
 * §247 -- DETERMINISTIC PROJECTION OF THE ROLE JUSTIFICATION. ZERO PROVIDER CALLS.
 *
 * ==================== THE LINE THIS MODULE MAY NOT CROSS ====================
 *
 * The provider supplies semantic judgement. This module derives deterministic consequences from the
 * REPRESENTATION and nothing else. It may check:
 *
 *   - that a required field is present and non-empty;
 *   - that a closed-vocabulary value is a member of its vocabulary;
 *   - that the epistemic character the model chose is admissible for the role the model chose;
 *   - that a per-driver control reference resolves to one of the model's OWN requiredControls;
 *   - that a combination the contract calls impossible was not written.
 *
 * It may NOT decide that a condition "is actually established", that a fact "is actually
 * decision-critical", or that a justification is persuasive. It never reads meaning out of prose and
 * never scans for keywords. Every judgement it acts on is one the model itself stated in a structured
 * field.
 *
 * ==================== WHY THE M8 CHECK IS STRUCTURAL AND NOT SEMANTIC ====================
 *
 * `DISCHARGING_CONTROL_NOT_IN_REQUIRED_CONTROLS` compares a string the model wrote in one field
 * against the strings the model wrote in another field of the same analysis. It does not judge
 * whether the control is adequate. On M8 the model emitted three controls drivers and three controls
 * with nothing tying any of them together; this check makes that shape unwritable, and says nothing
 * about whether any particular control is the right one.
 */

import {
  POSTURE_DRIVER_ROLES_239, type PostureDriverRole239,
} from './expert-239-posture-contract';
import {
  EPISTEMIC_CHARACTERS_247, ROLE_EPISTEMIC_CHARACTERS_247, CONTROLLING_ROLES_247,
  CESSATION_ROLE_247, CONTROLS_ROLE_247, ROLE_JUSTIFICATION_FIELD,
  type EpistemicCharacter247,
} from './expert-247-posture-contract';

export const ROLE_JUSTIFICATION_CODES_247 = [
  'ROLE_JUSTIFICATION_MISSING',
  'ROLE_JUSTIFICATION_MALFORMED',
  'EPISTEMIC_CHARACTER_NOT_A_MEMBER',
  'EPISTEMIC_CHARACTER_INCOMPATIBLE_WITH_ROLE',
  'MANUFACTURED_FACT_IN_CONTROLLING_ROLE',
  'JUSTIFICATION_REQUIRED_FIELD_EMPTY',
  'CESSATION_DRIVER_WITHOUT_ALONGSIDE_CONTROL_ASSESSMENT',
  'CONTROLS_DRIVER_WITHOUT_DISCHARGING_CONTROL',
  'DISCHARGING_CONTROL_NOT_IN_REQUIRED_CONTROLS',
] as const;
export type RoleJustificationCode247 = (typeof ROLE_JUSTIFICATION_CODES_247)[number];

export interface RoleJustificationEntryResult247 {
  readonly index: number;
  readonly ref: string | null;
  readonly driverRole: string | null;
  readonly epistemicCharacter: string | null;
  readonly admitted: boolean;
  readonly codes: readonly RoleJustificationCode247[];
}

export interface RoleJustificationResult247 {
  readonly admitted: boolean;
  readonly codes: readonly RoleJustificationCode247[];
  readonly perEntry: readonly RoleJustificationEntryResult247[];
  /** Entries the model itself labelled manufactured. Counted, never repaired. */
  readonly manufacturedCount: number;
}

const nonEmpty = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';

/**
 * Check every basis entry's justification against the representation rules.
 *
 * `requiredControls` is read ONLY to resolve a per-driver reference to one of the model's own
 * control strings. Nothing about the controls is interpreted.
 */
export function checkRoleJustification247(
  requiredBy: readonly unknown[], requiredControls: readonly unknown[],
): RoleJustificationResult247 {
  const controlTexts = new Set(
    requiredControls
      .map(c => (c ?? {}) as Record<string, unknown>)
      .map(c => (typeof c.control === 'string' ? c.control.trim() : ''))
      .filter(t => t !== ''));

  const perEntry: RoleJustificationEntryResult247[] = [];
  const all = new Set<RoleJustificationCode247>();
  let manufacturedCount = 0;

  requiredBy.forEach((raw, index) => {
    const codes: RoleJustificationCode247[] = [];
    const fail = (c: RoleJustificationCode247): void => { codes.push(c); all.add(c); };

    const entry = (raw ?? {}) as Record<string, unknown>;
    const ref = typeof entry.ref === 'string' ? entry.ref : null;
    const driverRole = typeof entry.driverRole === 'string' ? entry.driverRole : null;
    const j = entry[ROLE_JUSTIFICATION_FIELD];

    if (j === undefined || j === null) {
      fail('ROLE_JUSTIFICATION_MISSING');
      perEntry.push({ index, ref, driverRole, epistemicCharacter: null, admitted: false, codes });
      return;
    }
    if (typeof j !== 'object' || Array.isArray(j)) {
      fail('ROLE_JUSTIFICATION_MALFORMED');
      perEntry.push({ index, ref, driverRole, epistemicCharacter: null, admitted: false, codes });
      return;
    }
    const jr = j as Record<string, unknown>;
    const character = typeof jr.epistemicCharacter === 'string' ? jr.epistemicCharacter : null;

    // ---- closed vocabulary membership. Not a judgement about the fact.
    if (character === null
      || !(EPISTEMIC_CHARACTERS_247 as readonly string[]).includes(character)) {
      fail('EPISTEMIC_CHARACTER_NOT_A_MEMBER');
    } else if (driverRole !== null
      && (POSTURE_DRIVER_ROLES_239 as readonly string[]).includes(driverRole)) {
      const role = driverRole as PostureDriverRole239;
      const admissible = ROLE_EPISTEMIC_CHARACTERS_247[role];
      if (!admissible.includes(character as EpistemicCharacter247)) {
        fail('EPISTEMIC_CHARACTER_INCOMPATIBLE_WITH_ROLE');
        // The A2 mechanism, named separately so it is never counted as a generic mismatch.
        if (character === 'MANUFACTURED_OR_SPECULATIVE' && CONTROLLING_ROLES_247.includes(role)) {
          fail('MANUFACTURED_FACT_IN_CONTROLLING_ROLE');
        }
      }
      if (character === 'MANUFACTURED_OR_SPECULATIVE') manufacturedCount += 1;
    }

    // ---- required narrative fields must be PRESENT. Their content is never evaluated.
    for (const f of ['factualBasis', 'whyDecisionMaterial', 'whyControllingNotFollowUp']) {
      if (!nonEmpty(jr[f])) { fail('JUSTIFICATION_REQUIRED_FIELD_EMPTY'); break; }
    }

    // ---- the C5 mechanism: a cessation driver must have confronted the alongside control.
    if (driverRole === CESSATION_ROLE_247) {
      if (!nonEmpty(jr.alongsideControlConsidered) || !nonEmpty(jr.whyAlongsideControlInsufficient)) {
        fail('CESSATION_DRIVER_WITHOUT_ALONGSIDE_CONTROL_ASSESSMENT');
      }
    }

    // ---- the M8 mechanism: a controls driver must tie to one of the model's own controls.
    if (driverRole === CONTROLS_ROLE_247) {
      if (!nonEmpty(jr.dischargingControlRef)) {
        fail('CONTROLS_DRIVER_WITHOUT_DISCHARGING_CONTROL');
      } else if (!controlTexts.has((jr.dischargingControlRef as string).trim())) {
        fail('DISCHARGING_CONTROL_NOT_IN_REQUIRED_CONTROLS');
      }
    }

    perEntry.push({
      index, ref, driverRole, epistemicCharacter: character,
      admitted: codes.length === 0, codes,
    });
  });

  return {
    admitted: all.size === 0,
    codes: [...all],
    perEntry,
    manufacturedCount,
  };
}

/** What this projection does and does not do, as data, so a report cannot overstate it. */
export function roleJustificationEffect247(): {
  readonly enforcesRepresentationalConsistency: boolean;
  readonly decidesWhetherTheWorkplaceFactIsTrue: boolean;
  readonly readsMeaningOutOfProse: boolean;
  readonly repairsAnEntry: boolean;
  readonly coercesARole: boolean;
} {
  return {
    enforcesRepresentationalConsistency: true,
    decidesWhetherTheWorkplaceFactIsTrue: false,
    readsMeaningOutOfProse: false,
    repairsAnEntry: false,
    coercesARole: false,
  };
}
