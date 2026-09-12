/**
 * §168 EXPERT HAZLENZ -- CANDIDATE SILENCE-CONTROL ROWS. DRAFT MATERIAL FOR HUMAN REVIEW.
 *
 * >>> THESE ARE NOT EVALUATION TRUTH AND MUST NOT BE USED AS ANY DENOMINATOR.
 * >>>
 * >>> They were drafted by a model. §162 established that five of seven rows of model-authored
 * >>> evaluation truth did not survive human review and three were invalid, and the authorization
 * >>> for this operation requires silence-control truth to be "not authored by the evaluated
 * >>> provider as final authority". `AUTHORITY_STATUS` below is `CANDIDATE_NOT_AUTHORITATIVE` and
 * >>> only a product-owner review can change it.
 *
 * ==================== WHAT A SILENCE CONTROL HAS TO BE ====================
 *
 * A row where the correct verifier behaviour is to ask NOTHING. That is a much harder object to
 * author than a REQUIRED row, and §162 measured why: a silence row asserts that *nothing* is
 * decision-critical, which is an unbounded claim about everything the observation does not say,
 * while a REQUIRED row asserts one named checkable fact.
 *
 * So each candidate carries, explicitly:
 *   - the decision-critical facts the observation SETTLES, and the span that settles each;
 *   - the plausible omitted facts a reasonable verifier might reach for;
 *   - for each of those, WHY answering it either way leads to the same thing being done today.
 *
 * That last list is the row's real content. Without it the row is an assertion; with it a reviewer
 * can disagree with a specific counterfactual rather than with a verdict.
 *
 * ==================== THE CUE PROBLEM, STATED BECAUSE IT IS NOT SOLVED HERE ====================
 *
 * A row that settles everything tends to be LONGER and denser than a row that leaves a gap. If the
 * assembled cohort's silence rows are systematically longer than its REQUIRED rows, length becomes
 * a lexical cue for "ask nothing" and the measurement is worthless. `observationLengthReport()`
 * exists so that is checked rather than hoped for, and §168's design records it as an assembly
 * requirement on the eventual cohort, not a property these drafts can have on their own.
 */

export const SILENCE_CONTROL_CANDIDATES_VERSION =
  'hazlenz.expert.silence-control-candidates.2026-09-04' as const;

export const AUTHORITY_STATUS = 'CANDIDATE_NOT_AUTHORITATIVE' as const;

export interface SettledFact {
  /** The decision-critical fact the observation establishes. */
  readonly fact: string;
  /** The verbatim span that establishes it. Checked against the observation. */
  readonly settledBySpan: string;
}

export interface OmittedFactCounterfactual {
  /** A fact a reasonable verifier might reach for, which the observation does not state. */
  readonly omittedFact: string;
  readonly branchA: string;
  readonly branchB: string;
  /** Why BOTH branches lead to the same thing being done at this workplace today. */
  readonly whySameActionEitherWay: string;
}

export interface SilenceControlCandidate {
  readonly candidateId: string;
  readonly hazardDomain: string;
  readonly jurisdiction: string;
  readonly observation: string;
  /** The question family this row is a control for. */
  readonly testedQuestionFamily: string;
  readonly settledFacts: readonly SettledFact[];
  readonly plausibleOmittedFacts: readonly OmittedFactCounterfactual[];
  /** Why no competing gap is hidden in the row. */
  readonly noHiddenCompetingGap: string;
  /** Why applicability is not ambiguous. */
  readonly applicabilityIsUnambiguous: string;
  readonly authorityStatus: typeof AUTHORITY_STATUS;
}

export const SILENCE_CONTROL_CANDIDATES: readonly SilenceControlCandidate[] = [
  {
    candidateId: 'SC-1',
    hazardDomain: 'electrical / hazardous energy control',
    jurisdiction: 'osha-general-industry',
    observation:
      'An electrician is replacing a contactor inside a motor control cabinet on the packaging '
      + 'line. The line disconnect is open and padlocked with the electrician\'s own lock and tag, '
      + 'and they are the only person working on the circuit. Before opening the cabinet they '
      + 'tested their meter on a known live source, tested the line terminals and read zero volts, '
      + 'then retested the meter on the known live source. The cabinet door is open and the '
      + 'electrician is wearing safety glasses and insulated gloves. The packaging line is stopped '
      + 'and a supervisor is standing at the disconnect.',
    testedQuestionFamily: 'whether hazardous energy is controlled for the work in progress',
    settledFacts: [
      { fact: 'the circuit is isolated and the isolation is under the worker\'s own exclusive lock',
        settledBySpan: 'The line disconnect is open and padlocked with the electrician\'s own lock '
          + 'and tag, and they are the only person working on the circuit.' },
      { fact: 'absence of voltage was verified by a live-dead-live test at the point of work',
        settledBySpan: 'they tested their meter on a known live source, tested the line terminals '
          + 'and read zero volts, then retested the meter on the known live source' },
      { fact: 'the equipment is at rest, so no stored motion energy is acting',
        settledBySpan: 'The packaging line is stopped' },
      { fact: 'the disconnect is attended, so inadvertent re-energisation is guarded',
        settledBySpan: 'a supervisor is standing at the disconnect' },
    ],
    plausibleOmittedFacts: [
      {
        omittedFact: 'whether the electrician holds a formal lockout/tagout training certificate',
        branchA: 'they hold a current certificate',
        branchB: 'their certificate has lapsed',
        whySameActionEitherWay: 'the observation states the isolation was performed and verified by '
          + 'live-dead-live test with an exclusive personal lock. A lapsed certificate is a records '
          + 'and qualification finding for the employer, not a change to what is done at this '
          + 'cabinet right now. The energy is already controlled and verified at the point of '
          + 'work, so the SAME thing is done either way and the work stops for neither answer.',
      },
      {
        omittedFact: 'the voltage class of the circuit',
        branchA: 'low voltage',
        branchB: 'higher voltage within the cabinet\'s rating',
        whySameActionEitherWay: 'the circuit is verified de-energised at the point of work, so the '
          + 'class governs the arc-rated PPE that would be required for ENERGISED work, which is '
          + 'not what is occurring. The method and the protection in use are UNCHANGED either way, '
          + 'so the same thing is done today under both branches.',
      },
      {
        omittedFact: 'whether a written energy-control procedure exists for this machine',
        branchA: 'a written procedure exists',
        branchB: 'no written procedure exists',
        whySameActionEitherWay: 'a missing written procedure is a programme finding. The steps it '
          + 'would prescribe — isolate, lock, verify absence of voltage — are stated as already '
          + 'performed, so the work in progress is unchanged either way.',
      },
    ],
    noHiddenCompetingGap:
      'the only other physical hazard the text raises is the open cabinet door, and the '
      + 'observation settles the exposure it creates by stating the circuit is verified dead and '
      + 'the line stopped. No second unresolved decision-critical fact is present.',
    applicabilityIsUnambiguous:
      'servicing an electrical circuit inside a cabinet on stopped equipment is squarely within '
      + 'hazardous-energy control; there is no boundary question about whether the activity is '
      + 'covered.',
    authorityStatus: AUTHORITY_STATUS,
  },
  {
    candidateId: 'SC-2',
    hazardDomain: 'respiratory / solvent vapour',
    jurisdiction: 'osha-general-industry',
    observation:
      'A technician is wiping down two printed-circuit assemblies with isopropyl alcohol at a '
      + 'downdraft bench in the electronics repair room. The bench extraction is running and its '
      + 'airflow indicator is in the green band, which the technician checked and initialled at the '
      + 'start of the shift. They are using about 50 millilitres from a closed squeeze bottle and '
      + 'the job takes four minutes. They are wearing nitrile gloves and safety glasses, and the '
      + 'safety data sheet for the alcohol is in the binder on the bench. The room has no other '
      + 'solvent in use and the door to the corridor is closed.',
    testedQuestionFamily: 'whether inhalation exposure is controlled for the task in progress',
    settledFacts: [
      { fact: 'engineering control is present and verified working at the point of use',
        settledBySpan: 'The bench extraction is running and its airflow indicator is in the green '
          + 'band, which the technician checked and initialled at the start of the shift.' },
      { fact: 'the quantity and duration of the task are stated',
        settledBySpan: 'They are using about 50 millilitres from a closed squeeze bottle and the '
          + 'job takes four minutes.' },
      { fact: 'no other solvent source contributes to the atmosphere',
        settledBySpan: 'The room has no other solvent in use' },
      { fact: 'skin and eye protection appropriate to the solvent are in use',
        settledBySpan: 'They are wearing nitrile gloves and safety glasses' },
    ],
    plausibleOmittedFacts: [
      {
        omittedFact: 'whether personal air monitoring has ever been performed in this room',
        branchA: 'monitoring was performed',
        branchB: 'no monitoring has been performed',
        whySameActionEitherWay: 'the observation states a small stated quantity, a short stated '
          + 'duration, a working local exhaust ventilation control at the point of generation and '
          + 'no other solvent source. Monitoring data would inform the written exposure assessment; '
          + 'it does not change the control in use at this bench during these four minutes.',
      },
      {
        omittedFact: 'whether the technician has been fit-tested for a respirator',
        branchA: 'fit-tested',
        branchB: 'not fit-tested',
        whySameActionEitherWay: 'no respirator is in use and none is indicated: the stated control '
          + 'is engineering extraction verified in the green band. Because the control relied on is '
          + 'not a respirator, the SAME control is used and the SAME work proceeds either way.',
      },
      {
        omittedFact: 'the room\'s general air-change rate',
        branchA: 'a high general air-change rate',
        branchB: 'a low general air-change rate',
        whySameActionEitherWay: 'the control being relied on is local extraction at the point of '
          + 'generation, stated as running and verified. General room ventilation is a secondary '
          + 'factor: the method and the protection in use are the SAME under a high or a low rate, '
          + 'so nothing done today changes on the answer.',
      },
    ],
    noHiddenCompetingGap:
      'the alcohol is also flammable, and the observation settles that exposure by stating a small '
      + 'quantity from a closed container at an extracted bench with no other solvent present. No '
      + 'ignition source is stated or implied, so no second decision-critical fact is left open.',
    applicabilityIsUnambiguous:
      'solvent wiping at a ventilated bench is an ordinary covered task; nothing about the activity '
      + 'raises a boundary question of whether a standard applies.',
    authorityStatus: AUTHORITY_STATUS,
  },
  {
    candidateId: 'SC-3',
    hazardDomain: 'fall protection / work at height',
    jurisdiction: 'osha-construction',
    observation:
      'Two joiners are fixing cladding rails from a mobile tower scaffold on the north elevation, '
      + 'working at a platform height of four metres. The platform is fully boarded and has guard '
      + 'rails on all four sides at 1.1 metres with a mid-rail and a toe board. The tower\'s wheels '
      + 'are locked and its outriggers are deployed on the concrete apron. A scaffold tag dated '
      + 'this morning and signed by the erector hangs at the access ladder. Both joiners are '
      + 'working within the platform footprint and are passing rails up by hand from a colleague at '
      + 'ground level. The apron below is cordoned off with barriers.',
    testedQuestionFamily: 'whether fall and falling-object exposure is controlled for the work in '
      + 'progress',
    settledFacts: [
      { fact: 'collective fall protection is present on every open side',
        settledBySpan: 'has guard rails on all four sides at 1.1 metres with a mid-rail and a toe '
          + 'board' },
      { fact: 'the platform is complete, so there is no gap to fall through',
        settledBySpan: 'The platform is fully boarded' },
      { fact: 'the tower is stable and cannot move',
        settledBySpan: 'The tower\'s wheels are locked and its outriggers are deployed on the '
          + 'concrete apron.' },
      { fact: 'the scaffold has been inspected and the inspection is current',
        settledBySpan: 'A scaffold tag dated this morning and signed by the erector hangs at the '
          + 'access ladder.' },
      { fact: 'the falling-object exposure below is controlled',
        settledBySpan: 'The apron below is cordoned off with barriers.' },
    ],
    plausibleOmittedFacts: [
      {
        omittedFact: 'whether either joiner is wearing a harness',
        branchA: 'a harness is worn',
        branchB: 'no harness is worn',
        whySameActionEitherWay: 'the stated control is collective — a fully boarded platform with '
          + 'compliant guard rails on all four sides, worked within the footprint. Personal fall '
          + 'arrest is not the control being relied on and there is no stated anchor for it; the '
          + 'work method is unchanged either way.',
      },
      {
        omittedFact: 'the rated load of the tower and the weight of the cladding rails',
        branchA: 'the load is well within rating',
        branchB: 'the load approaches the rating',
        whySameActionEitherWay: 'the rails are stated to be passed up by hand one at a time from '
          + 'ground level rather than stacked on the platform, so no accumulation is described. '
          + 'This is a magnitude fact with no '
          + 'stated threshold turning on it, and the SAME method — one rail at a time, passed by '
          + 'hand — is used either way.',
      },
      {
        omittedFact: 'whether the joiners hold a tower-scaffold user competence card',
        branchA: 'both hold current cards',
        branchB: 'one card has lapsed',
        whySameActionEitherWay: 'the erection is stated complete, tagged and signed by the erector, '
          + 'and the joiners are users rather than erectors. A lapsed user card is a records '
          + 'finding; it does not change the guarding in place or the method being used now.',
      },
    ],
    noHiddenCompetingGap:
      'the second exposure the text raises is falling objects, and the observation settles it with '
      + 'the toe board and the cordon. No third decision-critical fact is left open.',
    applicabilityIsUnambiguous:
      'work from a mobile tower at four metres is unambiguously work at height; there is no '
      + 'boundary question about coverage.',
    authorityStatus: AUTHORITY_STATUS,
  },
  {
    candidateId: 'SC-4',
    hazardDomain: 'noise exposure',
    jurisdiction: 'osha-general-industry',
    observation:
      'A machine operator is tending two CNC routers in the joinery shop. A noise survey completed '
      + 'last month and posted on the shop notice board records 84 dBA at this workstation over a '
      + 'full shift with both routers cutting, measured by an occupational hygienist. The operator '
      + 'is at the workstation for the whole shift and no other noise source is present in the '
      + 'shop. The routers are the same models and settings as when the survey was taken, and the '
      + 'operator is wearing earmuffs from the dispenser at the shop entrance. A sign at the '
      + 'entrance states hearing protection is available on request.',
    testedQuestionFamily: 'whether noise exposure requires a change of control for the shift in '
      + 'progress',
    settledFacts: [
      { fact: 'the full-shift exposure level is measured, recent, and attributable to a qualified '
          + 'assessor',
        settledBySpan: 'A noise survey completed last month and posted on the shop notice board '
          + 'records 84 dBA at this workstation over a full shift with both routers cutting, '
          + 'measured by an occupational hygienist.' },
      { fact: 'the conditions the survey measured still hold',
        settledBySpan: 'The routers are the same models and settings as when the survey was taken' },
      { fact: 'exposure duration is the full shift, so no partial-shift arithmetic is needed',
        settledBySpan: 'The operator is at the workstation for the whole shift' },
      { fact: 'no additional noise source contributes',
        settledBySpan: 'no other noise source is present in the shop' },
    ],
    plausibleOmittedFacts: [
      {
        omittedFact: 'the noise reduction rating of the earmuffs',
        branchA: 'a high rating',
        branchB: 'a low rating',
        whySameActionEitherWay: 'the measured full-shift exposure is 84 dBA, below the 85 dBA '
          + 'action level at which a hearing conservation programme is triggered. The muffs are '
          + 'stated as worn and are additional to what the measured level requires, so their rating '
          + 'does not change what must be done today.',
      },
      {
        omittedFact: 'whether the operator has had an audiogram',
        branchA: 'an audiogram is on file',
        branchB: 'no audiogram has been taken',
        whySameActionEitherWay: 'audiometric testing is an element of the hearing conservation '
          + 'programme required above the action level. The measured exposure is below it, so the '
          + 'SAME controls apply at this workstation on this shift either way, and nothing done '
          + 'today changes on the answer.',
      },
      {
        omittedFact: 'peak impulse noise from workpiece handling',
        branchA: 'peaks occur',
        branchB: 'no peaks occur',
        whySameActionEitherWay: 'the survey is stated to have been taken over a full shift with '
          + 'both routers cutting under the same models and settings, so handling noise during '
          + 'normal operation is inside what was measured. Nothing done today turns on the answer.',
      },
    ],
    noHiddenCompetingGap:
      'the routers are a machine-guarding subject in general, but the observation describes tending '
      + 'rather than any interaction with the cutting area and states no guard condition, so no '
      + 'second decision-critical fact about guarding is raised by the text.',
    applicabilityIsUnambiguous:
      'a measured full-shift dBA level at a fixed workstation is exactly the quantity the noise '
      + 'standard turns on; there is no question about which rule applies or how the level is read.',
    authorityStatus: AUTHORITY_STATUS,
  },
  {
    candidateId: 'SC-5',
    hazardDomain: 'powered industrial truck / pedestrian separation',
    jurisdiction: 'osha-general-industry',
    observation:
      'A counterbalance forklift is moving banded pallets of tinned goods from the goods-in dock to '
      + 'racking in aisle four of the warehouse. The aisle is closed to pedestrians by hinged '
      + 'barriers at both ends, which are shut, and a warehouse operative is standing outside the '
      + 'barrier at the aisle entrance directing the movement by radio. The forklift\'s pre-use '
      + 'check sheet for today is completed and hangs in the cab, the load is at travel height with '
      + 'the mast tilted back, and the operator is seat-belted. The floor is dry and clear, and '
      + 'lighting in the aisle is on.',
    testedQuestionFamily: 'whether pedestrian and load-stability exposure is controlled for the '
      + 'movement in progress',
    settledFacts: [
      { fact: 'pedestrians are physically separated from the travel path',
        settledBySpan: 'The aisle is closed to pedestrians by hinged barriers at both ends, which '
          + 'are shut' },
      { fact: 'the only person near the movement is outside the separation',
        settledBySpan: 'a warehouse operative is standing outside the barrier at the aisle entrance '
          + 'directing the movement by radio' },
      { fact: 'the truck has been checked for the shift',
        settledBySpan: 'The forklift\'s pre-use check sheet for today is completed and hangs in the '
          + 'cab' },
      { fact: 'the load is carried in the stable travel configuration',
        settledBySpan: 'the load is at travel height with the mast tilted back' },
      { fact: 'floor and lighting conditions are stated and adequate for the movement',
        settledBySpan: 'The floor is dry and clear, and lighting in the aisle is on.' },
    ],
    plausibleOmittedFacts: [
      {
        omittedFact: 'whether the forklift operator holds a current authorisation to operate',
        branchA: 'currently authorised',
        branchB: 'authorisation has lapsed',
        whySameActionEitherWay: 'a lapsed authorisation is a records and permissions finding for '
          + 'the employer. The controls governing the movement observed — segregation, travel '
          + 'configuration, pre-use check, seat belt — are all stated present, so the movement in '
          + 'progress proceeds the SAME way either way and nothing done today changes.',
      },
      {
        omittedFact: 'the weight of the pallets against the truck\'s rated capacity',
        branchA: 'well within capacity',
        branchB: 'near capacity',
        whySameActionEitherWay: 'this is a magnitude fact. The observation states banded pallets of '
          + 'tinned goods carried at travel height with the mast tilted back and no instability '
          + 'described, No stated threshold turns on the precise weight, and the SAME travel '
          + 'configuration is used either way, so today\'s action is unchanged.',
      },
      {
        omittedFact: 'whether the racking has been inspected within its inspection interval',
        branchA: 'inspection is current',
        branchB: 'inspection is overdue',
        whySameActionEitherWay: 'racking inspection status governs the racking system as an asset. '
          + 'The observation describes travel to the racking and states no damage, deflection or '
          + 'impact; the answer would change a maintenance decision, while the pedestrian '
          + 'separation and load handling assessed now are the SAME either way.',
      },
    ],
    noHiddenCompetingGap:
      'load stability is the second exposure the text raises and the observation settles it with the '
      + 'travel-height, mast-tilt and banding statements. No third decision-critical fact is open.',
    applicabilityIsUnambiguous:
      'a powered industrial truck moving loads in an aisle is plainly covered; no boundary question '
      + 'about applicability arises.',
    authorityStatus: AUTHORITY_STATUS,
  },
];

/**
 * Phrases that would tell a verifier the answer instead of stating a fact. A control row must be
 * settled by FACTS a reader can check, never by a conclusion asserted in the text.
 */
export const FORBIDDEN_CONCLUSION_CUES: readonly string[] = [
  'compliant', 'in compliance', 'adequate', 'adequately', 'no further action', 'nothing further',
  'all required', 'all necessary', 'fully protected', 'safe to proceed', 'no hazard', 'no risk',
  'everything is', 'all controls', 'properly controlled', 'no clarification', 'nothing to ask',
  'no questions', 'satisfactory', 'as required by', 'meets the standard',
];

export interface CandidateLintResult {
  readonly candidateId: string;
  readonly problems: readonly string[];
  readonly observationChars: number;
  readonly settledFactCount: number;
  readonly counterfactualCount: number;
}

/**
 * Mechanical checks only. A clean lint does NOT make a row valid — validity is the human review's
 * to decide. The lint catches the failures that are decidable without judgement.
 */
export function lintCandidate(c: SilenceControlCandidate): CandidateLintResult {
  const problems: string[] = [];
  const obsLower = c.observation.toLowerCase();

  for (const cue of FORBIDDEN_CONCLUSION_CUES) {
    if (obsLower.includes(cue)) problems.push(`CONCLUSION_CUE_IN_OBSERVATION: "${cue}"`);
  }
  for (const s of c.settledFacts) {
    if (!c.observation.includes(s.settledBySpan)) {
      problems.push(`SETTLING_SPAN_NOT_VERBATIM: ${JSON.stringify(s.settledBySpan.slice(0, 50))}`);
    }
  }
  if (c.settledFacts.length < 3) problems.push('TOO_FEW_SETTLED_FACTS');
  if (c.plausibleOmittedFacts.length < 3) problems.push('TOO_FEW_COUNTERFACTUALS');
  for (const o of c.plausibleOmittedFacts) {
    if (o.branchA.trim() === o.branchB.trim()) {
      problems.push(`COUNTERFACTUAL_BRANCHES_IDENTICAL: ${o.omittedFact.slice(0, 40)}`);
    }
    if (o.whySameActionEitherWay.trim().length < 80) {
      problems.push(`COUNTERFACTUAL_REASONING_TOO_THIN: ${o.omittedFact.slice(0, 40)}`);
    }
    // A counterfactual that merely says the fact is unimportant is not a counterfactual.
    if (!/same|unchanged|does not change|no change|either way/i.test(o.whySameActionEitherWay)) {
      problems.push(`COUNTERFACTUAL_DOES_NOT_STATE_ACTION_EQUIVALENCE: `
        + o.omittedFact.slice(0, 40));
    }
  }
  if (c.noHiddenCompetingGap.trim().length < 60) problems.push('HIDDEN_GAP_ARGUMENT_TOO_THIN');
  if (c.applicabilityIsUnambiguous.trim().length < 60) problems.push('APPLICABILITY_ARGUMENT_TOO_THIN');
  if (c.authorityStatus !== AUTHORITY_STATUS) problems.push('AUTHORITY_STATUS_TAMPERED');

  return {
    candidateId: c.candidateId,
    problems,
    observationChars: c.observation.length,
    settledFactCount: c.settledFacts.length,
    counterfactualCount: c.plausibleOmittedFacts.length,
  };
}

/**
 * THE CUE RISK THAT THESE ROWS CANNOT FIX ON THEIR OWN.
 *
 * A row that settles everything is longer than a row that leaves a gap. If the assembled cohort's
 * silence rows are systematically longer than its REQUIRED rows, LENGTH becomes the cue and the
 * measurement is worthless. This reports the numbers so the eventual assembly can be checked
 * against the REQUIRED rows it will sit beside.
 */
export function observationLengthReport(
  requiredRowLengths: Readonly<Record<string, number>>,
): {
  candidateMin: number; candidateMax: number; candidateMean: number;
  requiredRowLengths: Readonly<Record<string, number>>;
  separationRisk: 'SEPARABLE_BY_LENGTH' | 'OVERLAPPING';
  note: string;
} {
  const lens = SILENCE_CONTROL_CANDIDATES.map(c => c.observation.length);
  const reqLens = Object.values(requiredRowLengths);
  const candidateMin = Math.min(...lens);
  const candidateMax = Math.max(...lens);
  const overlapping = reqLens.some(r => r >= candidateMin && r <= candidateMax);
  return {
    candidateMin,
    candidateMax,
    candidateMean: Math.round(lens.reduce((a, b) => a + b, 0) / lens.length),
    requiredRowLengths,
    separationRisk: overlapping ? 'OVERLAPPING' : 'SEPARABLE_BY_LENGTH',
    note: overlapping
      ? 'at least one REQUIRED row falls inside the candidate length band, so length alone does '
        + 'not separate the classes. This is necessary, not sufficient — the assembled cohort must '
        + 'be re-checked once its REQUIRED rows are fixed.'
      : 'NO REQUIRED row falls inside the candidate length band. Length would be a usable cue for '
        + '"ask nothing" and the set MUST NOT be used until the imbalance is corrected, either by '
        + 'shortening the controls or by adding longer REQUIRED rows.',
  };
}
