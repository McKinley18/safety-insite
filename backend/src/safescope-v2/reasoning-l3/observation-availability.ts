/**
 * L3-2e -- OBSERVATION AVAILABILITY. What the inspector could and could not see.
 *
 * WHY THIS IS A SEPARATE AXIS. L3-2d recorded `D-NG-04` and `D-CR-04` as an OSCILLATION between the
 * ACTIVE and INSUFFICIENT_EVIDENCE rungs. A clause-position ablation contradicted that: removing the
 * negation from `D-NG-04` changed nothing, and MOVING the clause changed everything. The real
 * mechanism is that the whole observation was being classified from its FIRST clause. Once that is
 * seen, the two failures stop being opposite pressures and become one defect viewed from two sides.
 *
 * What survives as a genuine distinction is this: "I could not see whether they were tied off" is a
 * fact about the INSPECTION, not about the equipment, and it is not the same thing as "this text does
 * not say enough to classify the condition". A hazard established by other evidence stays established
 * however much else went unobserved; a hazard whose DECIDING fact went unobserved does not.
 *
 * WHAT THIS MODULE MAY AND MAY NOT DO. It records. It does not decide.
 *
 * The entry contract is explicit -- observation availability "may inform uncertainty, it must not
 * automatically determine hazard condition state" -- and the programme has earned that caution: every
 * deterministic check added to this pipeline deleted a correct hazard before it earned its place
 * (L3-2 selectivity, L3-2b family relevance, L3-2c the impression gate's entry list, L3-2d the very
 * checks L3-2e is repairing). A rule that forced INSUFFICIENT_EVIDENCE wherever an inspector admitted
 * to not seeing something would be the same mistake a sixth time, and cell B of the L3-2e root-cause
 * matrix shows the model already handles that case correctly on its own -- 3 of 3 before any repair.
 *
 * So the deciding is left in the prompt, where the semantics live, and this module supplies the
 * ADVISORY signal and the evidence the observation-availability report is built from.
 */

export type ObservationAvailability =
  /** The observation records something the inspector explicitly could not see, reach or determine. */
  | 'EXPLICITLY_NOT_OBSERVED'
  /** Access or opportunity was absent -- "we did not get to that aisle", "the area was locked". */
  | 'OBSERVATION_UNAVAILABLE'
  /** Nothing is said either way. The overwhelmingly common case. */
  | 'UNSPECIFIED';

/** Verbs of perception or determination. Absent on purpose: `saw`, `found`, `noted` -- those observe. */
const PERCEPTION = [
  'see', 'saw', 'observe', 'observed', 'tell', 'determine', 'determined', 'establish', 'established',
  'verify', 'verified', 'confirm', 'confirmed', 'check', 'checked', 'read', 'inspect', 'inspected',
  'reach', 'access', 'get to', 'work out', 'make out', 'identify', 'identified', 'find out',
];

/** Ways English says the attempt failed. */
const INABILITY = [
  'could not', "couldn't", 'can not', "can't", 'cannot', 'was not able to', "wasn't able to",
  'were not able to', 'unable to', 'had no way of', 'no way to', 'did not get to', "didn't get to",
  'was too far away to', 'too far away to', 'not possible to', 'no opportunity to', 'never got to',
  'without being able to',
  // `failed to` is deliberately ABSENT. Equipment fails as readily as inspectors do -- "the pothole
  // protection failed to deploy during the function check" is a fact about the lift, not about what
  // was observed, and it matched here during development. The same discipline the rejection
  // vocabularies now follow: an ambiguous phrase does not earn a place.
];

/** Phrases that report unavailability without naming a perception verb. */
const UNAVAILABLE = [
  'no access to', 'access was denied', 'the area was locked', 'was locked out of', 'could not gain access',
  'not accessible', 'inaccessible', 'out of view', 'no view of', 'obscured from view', 'hidden from view',
];

export interface ObservationGap {
  kind: Exclude<ObservationAvailability, 'UNSPECIFIED'>;
  /** The inability phrase that matched. */
  marker: string;
  /** What went unobserved -- the text following the phrase, trimmed to its clause. */
  unobservedFact: string;
  start: number;
  end: number;
}

const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The remainder of the clause beginning at `from`. */
function clauseFrom(text: string, from: number): string {
  const rest = text.slice(from);
  const stop = rest.search(/[.;:!?]/);
  return (stop < 0 ? rest : rest.slice(0, stop)).trim();
}

/**
 * Every explicit observation gap in `text`.
 *
 * An inability phrase alone is not enough: "could not" must be attached to a PERCEPTION verb, or the
 * module would flag "the guard could not be refitted", which is a fact about the guard rather than
 * about the inspection.
 */
export function detectObservationGaps(text: string): ObservationGap[] {
  const gaps: ObservationGap[] = [];
  const lower = text.toLowerCase();

  for (const phrase of INABILITY) {
    const pattern = new RegExp(escape(phrase), 'g');
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(lower)) !== null) {
      const after = lower.slice(m.index + m[0].length, m.index + m[0].length + 60);
      const verb = PERCEPTION.find(v => new RegExp(`\\b${escape(v)}\\b`).test(after));
      if (!verb) continue;
      const factStart = m.index + m[0].length;
      gaps.push({
        kind: 'EXPLICITLY_NOT_OBSERVED', marker: phrase,
        unobservedFact: clauseFrom(text, factStart),
        start: m.index, end: factStart,
      });
    }
  }
  for (const phrase of UNAVAILABLE) {
    const at = lower.indexOf(phrase);
    if (at < 0) continue;
    gaps.push({
      kind: 'OBSERVATION_UNAVAILABLE', marker: phrase,
      unobservedFact: clauseFrom(text, at + phrase.length),
      start: at, end: at + phrase.length,
    });
  }
  // Patterns overlap by design -- "too far away to" sits inside "was too far away to" -- so keep only
  // the LONGEST match at each site. Without this one observation reports two gaps and every count
  // built on it is inflated.
  const ordered = gaps.sort((a, b) => (a.start - b.start) || (b.end - a.end));
  const kept: ObservationGap[] = [];
  for (const g of ordered) {
    if (kept.some(k => g.start >= k.start && g.start < k.end)) continue;
    kept.push(g);
  }
  return kept;
}

export function observationAvailabilityOf(text: string): ObservationAvailability {
  const gaps = detectObservationGaps(text);
  if (gaps.some(g => g.kind === 'EXPLICITLY_NOT_OBSERVED')) return 'EXPLICITLY_NOT_OBSERVED';
  if (gaps.length) return 'OBSERVATION_UNAVAILABLE';
  return 'UNSPECIFIED';
}
