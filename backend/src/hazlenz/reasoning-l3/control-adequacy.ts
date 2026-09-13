/**
 * L3-2f -- CONTROL ADEQUACY. Is the described control a CONTROL, or only a WARNING?
 *
 * WHY THIS IS ITS OWN AXIS. L3-2f's ablations proved that `E-FLD-147` and `E-OA-07` -- carried as two
 * separate high-consequence misses since L3-2e -- are ONE mechanism seen from two ends:
 *
 *   E-FLD-147  "An active floor opening is marked with standard warning tape next to an unprotected
 *              edge."  -> the model proposed CONTROLLED. Its own words: "the warning tape suggests
 *              some control is in place". Reproduced on a sign, and on a toolbox talk, which made the
 *              hazard vanish entirely. It OVER-reads an administrative measure as a control.
 *
 *   E-OA-07    "...the roof bolter was operating under a section of unsupported roof that had already
 *              taken weight."  -> no candidate at all, because "the second part ... does not indicate
 *              that the unsupported roof section was actively unstable". It UNDER-reads a control
 *              absence written with a negative prefix, and demands proof of imminent harm on top.
 *
 * Both are the same question -- does a control that actually prevents contact exist? -- and both are
 * PROVIDER-stage. Section 35.5's account of `E-OA-07` as `msha` ground-control wording is superseded:
 * the identical text under `osha-construction` fails identically, and the same clause position with
 * ordinary vocabulary succeeds.
 *
 * THE ARCHITECTURE ALREADY SUPPORTS THE DISTINCTION, which is why this is a contract repair and not
 * an expansion. `L3_CONTROL_HIERARCHY_LEVELS` has carried `elimination · substitution · engineering ·
 * administrative · ppe` since L3-1, and the `CONTROLLED` rung has always said "an EFFECTIVE control".
 * What was missing was the test for "effective". That test now lives in the prompt, where the
 * semantics belong.
 *
 * WHAT THIS MODULE MAY AND MAY NOT DO. It RECORDS. It does not decide -- the same restraint
 * `observation-availability.ts` was given at L3-2e, for the same hard-won reason: every deterministic
 * check this programme has added deleted a correct hazard before it earned its place, and L3-2e
 * introduced two such regressions while repairing two others. A seventh fatal check is not the trade
 * to make, and `L3-INV-12` says deterministic signals are advisory and may not re-acquire authority.
 *
 * It exists so the CONTROL_MENTION / CONTROL_EFFECTIVE distinction the entry contract asks for is
 * MEASURABLE in the evidence rather than only asserted in prose.
 *
 * THE DISTINCTION IS CONTEXTUAL, NOT LEXICAL, and the module is honest about the limit. It reports
 * what KIND of control language the evidence carries. Whether that control is adequate FOR THIS
 * HAZARD is a semantic judgement -- a permit IS the control for an authorisation hazard and a
 * procedure IS the control for a sequencing hazard -- and this module never makes it.
 */

import { findWholeWordMatch } from './word-classes';
import { governingNegation } from './negation-scope';

export type ControlAdequacy =
  /** Language describing a control that physically prevents contact with the hazard. */
  | 'CONTROL_EFFECTIVE'
  /** Language describing only a warning, marking, notice, briefing or written measure. */
  | 'CONTROL_MENTION'
  /** Both appear. The effective one is what matters, and callers are told so explicitly. */
  | 'CONTROL_EFFECTIVE_WITH_WARNING'
  /** The evidence describes a control that is ABSENT -- including one written as a single word. */
  | 'CONTROL_ABSENT'
  /** No control language either way. The common case. */
  | 'UNSPECIFIED';

/**
 * Controls that physically prevent contact, or that remove the energy. Deliberately the same
 * vocabulary family `CONTROL_IN_PLACE_TOKENS` already uses in the binder, so the two cannot drift.
 */
const EFFECTIVE_CONTROL_TERMS = [
  'guardrail', 'guard rail', 'handrail', 'toeboard', 'toe board', 'midrail', 'guard', 'guarded',
  'cover', 'covered', 'plate', 'decked', 'boarded', 'enclosure', 'enclosed', 'interlock',
  'interlocked', 'barricade', 'barricaded', 'hard barrier', 'physical barrier',
  'locked out', 'lockout', 'tagged out', 'isolated', 'isolation', 'de-energized', 'deenergized',
  'blanked', 'blinded', 'bled down', 'zero energy', 'proved dead', 'ventilated', 'extraction',
  'harness', 'lanyard', 'fall arrest', 'anchor point', 'clipped on', 'tied off', 'safety net',
  'fitted', 'installed', 'secured', 'anchored', 'bolted', 'latched',
];

/**
 * Warnings, markings and administrative measures. These TELL somebody about the hazard; they do not
 * remove it. The absence of `permit` and `procedure` from any decision here is deliberate -- see the
 * contextual caveat in the header; they appear only in the recorded detail.
 */
const WARNING_ONLY_TERMS = [
  'warning tape', 'hazard tape', 'barrier tape', 'tape', 'bunting', 'cone', 'cones', 'sign',
  'signage', 'placard', 'label', 'labelled', 'labeled', 'marked', 'marking', 'painted line',
  'notice', 'poster', 'barrier marker', 'demarcation', 'toolbox talk', 'briefing', 'briefed',
  'told', 'instructed', 'reminded', 'warned', 'awareness', 'pointed out',
];

/**
 * A required control stated ABSENT, including the morphological form that `E-OA-07` turned on. The
 * `un-` words are listed as whole tokens rather than matched by prefix, because a prefix rule would
 * match `under`, `unit`, `union` and `universal` -- the containment mistake `DISC-06` was.
 */
const ABSENT_CONTROL_TERMS = [
  'unguarded', 'unsupported', 'unprotected', 'uncovered', 'unlabelled', 'unlabeled', 'untied',
  'unsecured', 'unrestrained', 'unbarricaded', 'unattended', 'unshored', 'unblocked', 'unfenced',
  'missing', 'absent', 'removed', 'defeated', 'bypassed', 'disabled', 'strapped down', 'wedged open',
];

/** Whether every occurrence of `term` in `text` sits inside a negation's scope. */
function isNegated(text: string, term: string): boolean {
  const lower = text.toLowerCase();
  const t = term.toLowerCase();
  let at = lower.indexOf(t);
  let sawOne = false;
  while (at >= 0) {
    sawOne = true;
    if (governingNegation(text, at, at + t.length) === null) return false;
    at = lower.indexOf(t, at + 1);
  }
  return sawOne;
}

export interface ControlAdequacyRecord {
  adequacy: ControlAdequacy;
  /** The exact term that produced the classification, for the evidence trail. */
  matchedTerm: string | null;
  /** Present when both an effective control and a warning appear. */
  warningTerm: string | null;
  detail: string;
}

/**
 * What KIND of control language does this text carry? Recorded only.
 *
 * ORDER MATTERS AND IS DELIBERATE. An effective control outranks a warning, because
 * "boarded over with a secured deck and taped around the edge" is CONTROLLED and calling it a
 * warning would delete a correct non-hazard. An absence outranks both, because "no guardrail was
 * fitted" contains `fitted` and must not read as an effective control.
 */
export function controlAdequacyOf(text: string): ControlAdequacyRecord {
  const absent = findWholeWordMatch(text, ABSENT_CONTROL_TERMS);
  const effectiveRaw = findWholeWordMatch(text, EFFECTIVE_CONTROL_TERMS);
  const warning = findWholeWordMatch(text, WARNING_ONLY_TERMS);

  // A CONTROL UNDER A GOVERNING NEGATION IS AN ABSENT CONTROL, not a present one. "No guardrail was
  // fitted" names two effective-control terms and describes neither. Omitting this would repeat
  // `DISC-04` exactly -- a vocabulary consulted with no regard for the negation governing it -- and
  // negation scope stays owned by `negation-scope.ts` alone (L3-INV-11) rather than re-derived here.
  const negatedEffective = effectiveRaw !== null && isNegated(text, effectiveRaw);
  const effective = negatedEffective ? null : effectiveRaw;

  if (negatedEffective && !absent) {
    return {
      adequacy: 'CONTROL_ABSENT', matchedTerm: effectiveRaw, warningTerm: warning,
      detail: `'${effectiveRaw}' names a control that prevents contact, but a negation governs it -- the control is absent, not in place`,
    };
  }
  if (absent) {
    return {
      adequacy: 'CONTROL_ABSENT', matchedTerm: absent, warningTerm: warning,
      detail: `'${absent}' states a required control is absent or defeated; an absence written as one word is still an absence`,
    };
  }
  if (effective && warning) {
    return {
      adequacy: 'CONTROL_EFFECTIVE_WITH_WARNING', matchedTerm: effective, warningTerm: warning,
      detail: `'${effective}' describes a control that prevents contact, alongside the warning '${warning}'; the effective control is what decides`,
    };
  }
  if (effective) {
    return {
      adequacy: 'CONTROL_EFFECTIVE', matchedTerm: effective, warningTerm: null,
      detail: `'${effective}' describes a control that prevents contact with the hazard`,
    };
  }
  if (warning) {
    return {
      adequacy: 'CONTROL_MENTION', matchedTerm: warning, warningTerm: warning,
      detail: `'${warning}' warns about the hazard but does not prevent contact with it; a warning is not a control`,
    };
  }
  return { adequacy: 'UNSPECIFIED', matchedTerm: null, warningTerm: null, detail: 'no control language either way' };
}
