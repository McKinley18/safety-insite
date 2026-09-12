/**
 * §156 EXPERT HAZLENZ -- VERIFIER TRUTH MANIFEST. WRITE-ONCE, FROZEN BEFORE ANY PROVIDER REQUEST.
 *
 * ==================== WHERE THIS TRUTH COMES FROM ====================
 *
 * NOT from a fresh opinion about each case. Every one of the fifteen executions is a row of the
 * HARDENED v9 DEVELOPMENT SET, whose authored truth was written in §151, reviewed, frozen, and is
 * covered by the digest `434c127c...a7fe194`. That truth already states, per observation:
 *
 *   REQUIRED rows  -- the exact missing fact, the two branches, the outcome under each, the affected
 *                     decision, why the observation does not establish it, and the acceptable
 *                     selectors that would reach it.
 *   FORBIDDEN rows -- that NO decision-critical clarification is owed for that observation, with the
 *                     tempting question named and the reason it changes nothing.
 *
 * The verifier's correct verdict is DERIVED from that authored truth plus what the first pass
 * actually did. In all fifteen cases the first pass emitted NO clarification, so:
 *
 *   authored REQUIRED  + first pass silent  ->  ADD_OR_REPLACE_CLARIFICATION
 *   authored FORBIDDEN + first pass silent  ->  NO_CLARIFICATION_REQUIRED
 *
 * ==================== THE LIMITATION THAT MUST TRAVEL WITH EVERY FIGURE ====================
 *
 * >>> THE MANIFEST IS AUTHORED BY THE SAME MODEL FAMILY THAT WILL BE GRADED. Errors could be
 * >>> correlated: a case I misjudge is a case the verifier may misjudge the same way, and the
 * >>> experiment would then score the agreement as accuracy. Deriving from the frozen v9 authored
 * >>> truth rather than from fresh opinion is what limits this, and it does not eliminate it. Every
 * >>> accuracy figure in §156 carries this caveat.
 *
 * ==================== WHY FOUR CASES ARE EXCLUDED FROM THE PRIMARY DENOMINATOR ====================
 *
 * A FORBIDDEN row's authored truth names ONE tempting question and explains why it changes nothing.
 * On most of these cases the model retained exactly that question, and the authored reasoning
 * applies directly. On four, it retained a DIFFERENT unknown -- specifically, the ABSENCE OF A NAMED
 * CONTROL that the authored rationale never considered:
 *
 *   three cases  "no ignition-source or bonding/grounding controls are described in the spray booth"
 *   one case     "no pressure-limiting or shutoff device is described on the tyre inflation airline"
 *
 * A row-level FORBIDDEN verdict does imply nothing in the observation is decision-critical, so a
 * defensible reading says these are settled too. But asserting that would require me to judge that a
 * verified extract renders ignition-source control non-decision-critical, and that a restraint cage
 * renders an inflation pressure-limiting device non-decision-critical -- substantive safety
 * judgements the authored truth does not make and the observation text does not establish. The
 * standards governing spray areas and rim-wheel servicing both name those controls specifically.
 *
 * §156 provides for exactly this: a case that cannot be adjudicated CONFIDENTLY before spend is
 * excluded from the primary denominator and reported separately. All four are still executed and
 * still reported -- excluded from the score, not from the evidence.
 */

import { createHash } from 'crypto';
import { writeFileSync, existsSync, readFileSync, chmodSync } from 'fs';
import { join } from 'path';

const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-verifier-accuracy-2026-09-03');

export type TruthVerdict =
  | 'VERIFIED_AS_IS' | 'ADD_OR_REPLACE_CLARIFICATION' | 'NO_CLARIFICATION_REQUIRED'
  | 'ABSTAIN_ACCEPTABLE';

interface TruthEntry {
  caseId: string;
  inPrimaryDenominator: boolean;
  correctVerdict: TruthVerdict;
  /** Verdicts that are behaviourally equivalent to the correct one for THIS case. */
  semanticallyEquivalentVerdicts: TruthVerdict[];
  missingFact: string | null;
  affectedDecision: string | null;
  acceptableSelectors: string[] | null;
  /** Keywords any acceptable selector must reach. A SCORING AID; the verbatim text is the evidence. */
  selectorKeywordSets: string[][] | null;
  whyDecisionCritical: string | null;
  whyNotDecisionCritical: string | null;
  exclusionReason: string | null;
}

const REQ = (
  caseId: string, missingFact: string, acceptableSelectors: string[],
  selectorKeywordSets: string[][], whyDecisionCritical: string,
): TruthEntry => ({
  caseId, inPrimaryDenominator: true,
  correctVerdict: 'ADD_OR_REPLACE_CLARIFICATION',
  // Nothing else repairs a missed decision-critical question, so nothing else is equivalent.
  semanticallyEquivalentVerdicts: [],
  missingFact, affectedDecision: 'REQUIRED_CONTROL', acceptableSelectors, selectorKeywordSets,
  whyDecisionCritical, whyNotDecisionCritical: null, exclusionReason: null,
});

const SILENT = (caseId: string, whyNotDecisionCritical: string): TruthEntry => ({
  caseId, inPrimaryDenominator: true,
  correctVerdict: 'NO_CLARIFICATION_REQUIRED',
  // The first pass asked nothing and that was right, so "verified as is" states the same outcome.
  semanticallyEquivalentVerdicts: ['VERIFIED_AS_IS'],
  missingFact: null, affectedDecision: null, acceptableSelectors: null, selectorKeywordSets: null,
  whyDecisionCritical: null, whyNotDecisionCritical, exclusionReason: null,
});

const EXCLUDED = (caseId: string, exclusionReason: string): TruthEntry => ({
  caseId, inPrimaryDenominator: false,
  correctVerdict: 'ABSTAIN_ACCEPTABLE',
  semanticallyEquivalentVerdicts: ['NO_CLARIFICATION_REQUIRED', 'VERIFIED_AS_IS',
    'ADD_OR_REPLACE_CLARIFICATION'],
  missingFact: null, affectedDecision: null, acceptableSelectors: null, selectorKeywordSets: null,
  whyDecisionCritical: null, whyNotDecisionCritical: null, exclusionReason,
});

const ENTRIES: TruthEntry[] = [
  // ---------------- decision-critical clarification owed, first pass silent ----------------
  REQ('VC-08',
    'whether the burner has a functioning flame-failure device',
    ['whether a flame-failure device is fitted to the burner and is functioning',
      'whether the burner has been proved to shut off on loss of flame'],
    [['flame', 'fail'], ['shut', 'flame'], ['flame-failure']],
    'If no device is fitted or it has been bypassed, the dryer must be shut down now: unburnt fuel '
    + 'discharging into a dust-laden plenum is an explosion sequence with no interruption. If it is '
    + 'fitted and proved, drying continues. The observation establishes only that the device is '
    + 'behind a shroud and cannot be SEEN, and an obstructed sightline is not an inspection.'),
  REQ('VC-04',
    'whether the guard interlock was function-tested after the overnight rotor tooth change',
    ['whether the guard interlock was function-tested after the rotor work',
      'whether the rotor was proved to stop when the guard is opened'],
    [['interlock', 'test'], ['interlock', 'prov'], ['rotor', 'stop'], ['function', 'test']],
    'If no function test was made after the guard was refitted, the debarker must come out of '
    + 'service until the interlock is proved, because nothing else stands between an opened guard '
    + 'and a turning rotor. A closed guard and a present switch look identical whether the '
    + 'interlock was tested or not.'),
  REQ('VC-02',
    'whether the load was given a cooling hold appropriate to its contents before the door opened',
    ['whether the load was given a cooling hold before the door was opened',
      'whether this was a liquid cycle requiring a cooling hold',
      'whether the load temperature was checked before the door was opened'],
    [['cooling', 'hold'], ['liquid', 'cycle'], ['load', 'temperature'], ['cool', 'before']],
    'If no cooling hold ran, the door must be closed again and the load left to cool, because '
    + 'superheated liquid in sealed containers can boil violently when moved. A chamber gauge at '
    + 'zero is a statement about the CHAMBER, not about liquid inside sealed bottles.'),
  REQ('VC-13',
    'whether the load was given a cooling hold appropriate to its contents before the door opened',
    ['whether the load was given a cooling hold before the door was opened',
      'whether this was a liquid cycle requiring a cooling hold',
      'whether the load temperature was checked before the door was opened'],
    [['cooling', 'hold'], ['liquid', 'cycle'], ['load', 'temperature'], ['cool', 'before']],
    'Same observation as VC-02, a different draw. The alarm not sounding is what a correct cycle '
    + 'and a dead alarm both produce; neither reaches the cooling hold.'),

  // ---------------- retained unknown that can safely remain unasked ----------------
  SILENT('VC-09',
    'The retained unknown is how many tyres are changed per shift. The control is a physical '
    + 'restraint cage in correct use, with the operator outside and to one side and the bay clear. '
    + 'Frequency scales exposure but selects no different action: the cage is the control at any '
    + 'rate, and no plausible figure makes the current arrangement inadequate.'),
  SILENT('VC-12',
    'The retained unknown is the fryer make and oil capacity. The oil is stated cold, the drain is '
    + 'used as designed into a positioned bin in a coned area, with gauntlets and apron worn. '
    + 'Capacity scales volume but selects no different action, and the thermal condition that would '
    + 'make bin capacity decision-critical is stated absent.'),
  SILENT('VC-07',
    'The retained unknown is whether oil has spilled onto the floor. The control for exactly that '
    + 'contingency — a coned area around the drain point — is stated present and observed, so the '
    + 'answer selects no different action at this task.'),
  SILENT('VC-01',
    'The retained unknowns are whether the drained oil retains residual heat and whether the coning '
    + 'reflects a realised spill. The first is settled by the observation itself, which states the '
    + 'fryer is switched off and cold; the second is answered by a control already in place '
    + 'whichever way it falls.'),
  SILENT('VC-05',
    'The retained unknown is cutting duration and quantity. Every control duration would bear on is '
    + 'already observed in use: water suppression running with visible water at the blade, a fitted '
    + 'FFP3, hearing protection, open air, fifteen metres to the nearest person. A longer or shorter '
    + 'task selects no different action at this cut.'),
  SILENT('VC-10', 'Same observation as VC-05, a different draw. Duration alone is magnitude; every '
    + 'control it would govern is stated present and in use.'),
  SILENT('VC-15', 'Same observation as VC-05, a different draw. The retained unknown is cumulative '
    + 'exposure duration, which refines severity and changes nothing about what is done now.'),

  // ---------------- not confidently adjudicable before spend ----------------
  EXCLUDED('VC-03',
    'The model retained the ABSENCE OF A NAMED CONTROL — ignition-source and vapour-concentration '
    + 'controls in a spray booth — which the authored FORBIDDEN rationale never considered (it '
    + 'addresses breathing air and extract testing). Concluding the answer changes nothing would '
    + 'require judging that a verified extract renders ignition-source control non-decision-'
    + 'critical, which the observation text does not establish and the standard governing spray '
    + 'areas names specifically.'),
  EXCLUDED('VC-14', 'Same observation and same retained control-absence as VC-03, a different draw.'),
  EXCLUDED('VC-11', 'Same observation and same retained control-absence as VC-03, a different draw. '
    + 'This draw also retains the coating type (solvent- vs water-based), which bears on the same '
    + 'unadjudicated question.'),
  EXCLUDED('VC-06',
    'The model retained whether the inflation airline carries a pressure-limiting or shutoff '
    + 'device. The authored FORBIDDEN rationale addresses task FREQUENCY, not this equipment. The '
    + 'standard governing rim-wheel servicing names in-line inflation equipment specifically, so '
    + 'asserting that its absence changes no current action would exceed both the authored truth '
    + 'and the observation text.'),
];

function main(): void {
  const path = join(OUT, 'TRUTH-MANIFEST.json');
  if (existsSync(path)) {
    console.log('truth manifest already exists and is WRITE-ONCE — refusing to rewrite');
    console.log(`  sha256 ${createHash('sha256').update(readFileSync(path)).digest('hex')}`);
    return;
  }
  if (ENTRIES.length !== 15) throw new Error(`expected 15 entries, have ${ENTRIES.length}`);
  const ids = new Set(ENTRIES.map(e => e.caseId));
  if (ids.size !== 15) throw new Error('duplicate case ids');

  const primary = ENTRIES.filter(e => e.inPrimaryDenominator);
  const manifest = {
    manifestVersion: 'hazlenz.expert.verifier-truth.v1',
    frozenBeforeAnyProviderRequest: true,
    derivedFrom: 'the frozen hardened v9 authored truth (digest '
      + '434c127c44a8d6d8592c1b6e6c1cd01599428143f44737b19335a3123a7fe194), reviewed in §151, plus '
      + 'what the stored first pass actually did',
    LIMITATION: 'AUTHORED BY THE SAME MODEL FAMILY THAT WILL BE GRADED. Errors may be correlated. '
      + 'Deriving from frozen authored truth limits this and does not eliminate it. Every accuracy '
      + 'figure in §156 carries this caveat.',
    primaryDenominator: primary.length,
    primaryDecisionCriticalCases: primary.filter(
      e => e.correctVerdict === 'ADD_OR_REPLACE_CLARIFICATION').length,
    primaryLegitimateSilenceCases: primary.filter(
      e => e.correctVerdict === 'NO_CLARIFICATION_REQUIRED').length,
    excludedFromPrimaryDenominator: ENTRIES.length - primary.length,
    abstainConvention: 'ABSTAIN is never the correct verdict on a primary case. It is reported '
      + 'separately, counted as a failure to recover on the decision-critical side, and NOT counted '
      + 'as a manufactured question on the legitimate-silence side.',
    entries: ENTRIES,
  };
  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  writeFileSync(path, json);
  chmodSync(path, 0o444);
  console.log(`TRUTH-MANIFEST.json written, ${ENTRIES.length} entries, 0444 write-once`);
  console.log(`  sha256 ${createHash('sha256').update(json).digest('hex')}`);
  console.log(`  primary denominator ${primary.length} `
    + `(${manifest.primaryDecisionCriticalCases} decision-critical, `
    + `${manifest.primaryLegitimateSilenceCases} legitimate-silence)`);
  console.log(`  excluded, reported separately: ${manifest.excludedFromPrimaryDenominator}`);
  console.log('PROVIDER_CALLS = 0');
}

main();
