/**
 * FORMAL_EXPERT_SEMANTIC_AUGMENTATION_V1 -- thirty-four newly authored formal source cases. §127.
 *
 * Authored under the construction policy frozen at
 * `2eff227febef2b36b5c8db65b1957564c101675299f03e0a9b3abd338ef94454` BEFORE a single case existed,
 * to close the two semantic shortages §126 measured:
 *
 *   CLARIFICATION_OWED         required 20, previously achievable 3   (short 17)
 *   CROSS_HAZARD_INTERACTION   required 10, previously achievable 5   (short 5)
 *
 * ==================== CANDIDATE TRUTH. NOT FORMAL TRUTH. ====================
 *
 * Every semantic determination here is a CANDIDATE awaiting independent product-owner safety
 * review. None of it may enter the formal cohort until reviewed and accepted. The authoring
 * agent's self-review is explicitly insufficient: the same process in §125 produced sixteen rows
 * it judged sound, and independent review then overturned three of fourteen forbidden labels.
 *
 * ==================== A GAP IS A MISSING FACT THAT MOVES A DECISION ====================
 *
 * Not "more detail would help". Every gap names the exact absent fact, why the observation does not
 * already contain it, which decision moves, and how two plausible answers change that decision. If
 * every plausible answer leads to the same action, it is not decision-critical and is not recorded.
 *
 * ==================== CO-OCCURRENCE IS NOT AN INTERACTION ====================
 *
 * Two hazards in one room are two hazards. An interaction is recorded only where treating them
 * independently would lose meaningful safety information. Twenty rows here carry two or more
 * present families and deliberately record NO interaction, because that is what they are.
 *
 * ==================== FORBIDDEN IS THE NARROW BUCKET ====================
 *
 * Absence is never evidence of absence; one control never eliminates every related hazard; a
 * resolved state extends only as far as the text establishes it. Where a competent professional
 * could legitimately raise a family, it is DEFENSIBLE. Rows authored for a gap or an interaction
 * get exactly the forbidden families their own text supports -- frequently none.
 */

import {
  FORMAL_COHORT_ROW_CONTRACT_VERSION, type FormalCohortRow,
} from '../expert-cohort-contract';

const TAXONOMY = [
  'chemical_exposure', 'confined_space', 'electrical', 'fall_protection',
  'lockout_tagout', 'machine_guarding', 'mobile_equipment',
] as const;

/** The reviewer-facing packet for one decision-critical gap. */
export interface GapPacket {
  gapId: string;
  /** The exact absent fact, phrased specifically enough to be asked as one question. */
  missingFact: string;
  /** Why the observation does not already contain it. */
  whyAbsent: string;
  affectedDecision: FormalCohortRow['truth']['decisionCriticalGaps'][number]['affectedDecision'];
  /** How two plausible answers would materially diverge. */
  alternativeOutcomes: string;
}

/** The reviewer-facing packet for one cross-hazard interaction. */
export interface InteractionPacket {
  interactionKind: FormalCohortRow['truth']['recordedInteractions'][number]['interactionKind'];
  participants: string[];
  /** What independently establishes each participant. */
  evidencePerParticipant: Record<string, string>;
  /** The causal or operational mechanism linking them. */
  relationship: string;
  /** What a reviewer would miss assessing them separately. */
  independentLoss: string;
}

export interface SemanticRow {
  row: FormalCohortRow;
  forbiddenRationale: Record<string, string>;
  gapPackets: GapPacket[];
  interactionPackets: InteractionPacket[];
  /** Judgements the author is least certain of, surfaced rather than hidden. */
  authorUncertainty: string | null;
  provenance: Record<string, string>;
}

interface Spec {
  id: string;
  location: string;
  task: string;
  observation: string;
  present: string[];
  forbidden?: Record<string, string>;
  negatedOrSafe?: string[];
  lifeCritical?: string[];
  gaps?: GapPacket[];
  interactions?: InteractionPacket[];
  uncertainty?: string;
  rationale: string;
}

function build(s: Spec): SemanticRow {
  const forbidden = Object.keys(s.forbidden ?? {});
  const defensible = TAXONOMY.filter(f => !s.present.includes(f) && !forbidden.includes(f));
  return {
    row: {
      contractVersion: FORMAL_COHORT_ROW_CONTRACT_VERSION,
      source: {
        rowId: s.id,
        observation: s.observation,
        inspectionContext: { location: s.location, task: s.task },
        jurisdiction: 'osha-general-industry',
        allowedHazardFamilies: [...TAXONOMY],
        governedStandards: [],   // supplied at assembly from the governed release snapshot
        answeredClarifications: [],
        supplementaryContext: [],
      },
      truth: {
        presentHazardFamilies: [...s.present],
        defensibleHazardFamilies: defensible,
        forbiddenHazardFamilies: forbidden,
        negatedOrSafeStateFamilies: [...(s.negatedOrSafe ?? [])],
        lifeCriticalHazardFamilies: [...(s.lifeCritical ?? [])],
        decisionCriticalGaps: (s.gaps ?? []).map(g => ({
          gapId: g.gapId, description: g.missingFact, affectedDecision: g.affectedDecision,
        })),
        recordedInteractions: (s.interactions ?? []).map(i => ({
          interactionKind: i.interactionKind, participants: [...i.participants],
        })),
        authoringRationale: s.rationale,
      },
    },
    forbiddenRationale: { ...(s.forbidden ?? {}) },
    gapPackets: s.gaps ?? [],
    interactionPackets: s.interactions ?? [],
    authorUncertainty: s.uncertainty ?? null,
    provenance: {
      presentHazardFamilies: 'LEVEL_2_AUTHORED_SOURCE_CASE_TRUTH -- CANDIDATE',
      forbiddenHazardFamilies: 'LEVEL_2_AUTHORED_SOURCE_CASE_TRUTH (lure + defeating fact) -- CANDIDATE',
      defensibleHazardFamilies: 'LEVEL_1_DERIVED_FROM_TAXONOMY_PARTITION',
      negatedOrSafeStateFamilies: 'LEVEL_2_AUTHORED_SOURCE_CASE_TRUTH -- CANDIDATE',
      lifeCriticalHazardFamilies: 'LEVEL_3_AUTHORED_SAFETY_DOMAIN_JUDGEMENT -- CANDIDATE',
      decisionCriticalGaps: 'LEVEL_3_AUTHORED_SAFETY_DOMAIN_JUDGEMENT -- CANDIDATE, REVIEW REQUIRED',
      recordedInteractions: 'LEVEL_3_AUTHORED_SAFETY_DOMAIN_JUDGEMENT (closed vocabulary) -- CANDIDATE, REVIEW REQUIRED',
      governedStandards: 'DEFERRED -- supplied at assembly from the governed release snapshot',
    },
  };
}

export const SEMANTIC_SPECS: readonly Spec[] = [
  // ============================================================ GAP + INTERACTION (SEM-01..10)
  {
    id: 'SEM-01',
    location: 'Municipal wastewater plant, primary digester', task: 'annual internal inspection',
    observation:
      'Two contractors were preparing to enter the primary digester through the side access hatch '
      + 'for an annual grit inspection. The digester had been drawn down and washed the previous '
      + 'day. A four-gas meter was clipped to the entrant harness, and the hole watch had the permit '
      + 'on a clipboard. I could see the meter was powered on but not the readings from where I '
      + 'stood, and the sludge line to the digester was valved but I saw no blind flange installed.',
    present: ['confined_space', 'chemical_exposure'],
    lifeCritical: ['confined_space', 'chemical_exposure'],
    gaps: [{
      gapId: 'SEM-01-G1',
      missingFact:
        'the actual pre-entry atmospheric readings, specifically whether hydrogen sulphide and '
        + 'methane were below action levels and oxygen was within range',
      whyAbsent:
        'The observer states plainly that the meter was powered on but its display was not legible '
        + 'from the standing position, so the readings were never established.',
      affectedDecision: 'REQUIRED_CONTROL',
      alternativeOutcomes:
        'If the atmosphere tested clean the entry proceeds as a permit entry with continuous '
        + 'monitoring. If H2S is present above action level, the entry requires supplied air and a '
        + 'non-entry retrieval posture, and a straight harness-and-meter entry becomes prohibited. '
        + 'Those are different entries, not different paperwork.',
    }],
    interactions: [{
      interactionKind: 'CONFINED_SPACE_ATMOSPHERIC',
      participants: ['confined_space', 'chemical_exposure'],
      evidencePerParticipant: {
        confined_space:
          'A digester entered through a side hatch is a permit space: restricted egress, not '
          + 'designed for continuous occupancy, and an entry permit is in use.',
        chemical_exposure:
          'Digester residue generates hydrogen sulphide and methane; the vessel was drawn down and '
          + 'washed, which liberates gas from settled solids rather than removing the source.',
      },
      relationship:
        'The enclosure is what makes the gas dangerous. The same H2S concentration in open air '
        + 'disperses; inside a sealed vessel it accumulates and displaces oxygen, and the single '
        + 'access hatch is also the only escape route.',
      independentLoss:
        'Assessed separately a reviewer writes "permit entry, monitor the space" and "H2S present, '
        + 'wear protection". Together they say the atmosphere must be proven before a person is '
        + 'committed to a space they cannot quickly leave -- which is the actual control.',
    }],
    uncertainty:
      'The missing blind flange is arguably a second, independent gap about line isolation. I '
      + 'recorded one gap rather than two because the atmospheric question is the one that decides '
      + 'the entry method; a reviewer may reasonably say the isolation question deserves its own.',
    rationale:
      'A permit entry where the paperwork is present and the decisive fact is not. The gap is real '
      + 'rather than manufactured -- the observer says why the readings could not be established -- '
      + 'and the interaction is the mechanism that makes those readings matter.',
  },
  {
    id: 'SEM-02',
    location: 'Sawmill, edger line', task: 'blade change',
    observation:
      'A millwright was changing edger saw blades. The machine disconnect was open with his lock on '
      + 'it, and the access door was swung back with the blade arbor exposed at chest height. He '
      + 'mentioned the line had a gravity return that sometimes drifts. I did not see whether the '
      + 'arbor had been pinned or blocked, and there was no second person at the panel.',
    present: ['lockout_tagout', 'machine_guarding'],
    lifeCritical: ['machine_guarding', 'lockout_tagout'],
    gaps: [{
      gapId: 'SEM-02-G1',
      missingFact:
        'whether the saw arbor was mechanically pinned or blocked against the gravity return the '
        + 'millwright described, after electrical isolation',
      whyAbsent:
        'The observer could not see a pin or block from the doorway, and the millwright named the '
        + 'drift as a known behaviour rather than something he stated he had restrained.',
      affectedDecision: 'REQUIRED_CONTROL',
      alternativeOutcomes:
        'If the arbor is pinned, electrical isolation plus mechanical restraint is a complete '
        + 'energy-control state and the work is correct. If it is not, a gravity-driven arbor can '
        + 'rotate onto a hand that is inside the guard opening while the disconnect is still locked '
        + '-- the lockout is real and the hazard survives it.',
    }],
    interactions: [{
      interactionKind: 'LOTO_STORED_ENERGY',
      participants: ['lockout_tagout', 'machine_guarding'],
      evidencePerParticipant: {
        lockout_tagout:
          'The disconnect is open under a personal lock, and the millwright names a gravity return '
          + 'that is a stored-energy source outside that isolation.',
        machine_guarding:
          'The access door is open with the blade arbor exposed at chest height while a person '
          + 'works at it.',
      },
      relationship:
        'The guard is legitimately open because the machine is isolated -- but the isolation covers '
        + 'electrical energy only, and the exposure created by opening the guard is to a hazard '
        + 'driven by gravity, which the disconnect does not touch.',
      independentLoss:
        'Independently this reads as a correct lockout and a guard that is open for planned work, '
        + 'which is exactly right and exactly wrong. The point is that the guard opening is safe '
        + 'only if the energy control covers the energy that actually moves this part.',
    }],
    rationale:
      'The classic incomplete isolation, authored so the incompleteness is stated by the worker '
      + 'rather than inferred by the reader. Nothing about the electrical isolation is deficient.',
  },
  {
    id: 'SEM-03',
    location: 'Cold storage, glycol pump vault', task: 'leak investigation',
    observation:
      'Maintenance was down in the glycol pump vault below the cold-store floor chasing a leak. The '
      + 'vault is about seven feet deep, entered by a fixed ladder, and had roughly two inches of '
      + 'standing glycol-water mix on the floor. A portable sump pump was running on an extension '
      + 'cord that ran down the ladder and lay in the liquid. I could not tell whether the circuit '
      + 'it was plugged into upstairs was GFCI protected.',
    present: ['electrical', 'confined_space'],
    lifeCritical: ['electrical', 'confined_space'],
    gaps: [{
      gapId: 'SEM-03-G1',
      missingFact:
        'whether the receptacle feeding the portable sump pump is GFCI protected',
      whyAbsent:
        'The receptacle is on the floor above and the observer was in the vault; the protection '
        + 'status is not determinable from the cord or the pump.',
      affectedDecision: 'REQUIRED_CONTROL',
      alternativeOutcomes:
        'With GFCI protection a cord fault in the standing liquid trips in milliseconds and the '
        + 'finding is about cord management. Without it, the same fault energises the liquid a '
        + 'person is standing in, inside a space they exit by ladder -- which is a stop-work '
        + 'condition, not a housekeeping note.',
    }],
    interactions: [{
      interactionKind: 'ELECTRICAL_WET_ENVIRONMENT',
      participants: ['electrical', 'confined_space'],
      evidencePerParticipant: {
        electrical:
          'An energised extension cord lies in two inches of conductive glycol-water mix.',
        confined_space:
          'A seven-foot below-grade vault entered by a fixed ladder: restricted egress and a space '
          + 'not designed for continuous occupancy.',
      },
      relationship:
        'The liquid makes the person part of the fault path, and the vault removes the ability to '
        + 'get away from it. A shock at grade is a shock; a shock on a ladder in a flooded pit is a '
        + 'fall and a person left in the space.',
      independentLoss:
        'Separately: "keep cords out of water" and "this is a confined space". Together they '
        + 'establish that the electrical control has to be chosen for a place nobody can leave '
        + 'quickly, which is why GFCI protection is the decisive question rather than a preference.',
    }],
    rationale:
      'Both hazards are stated in the text and neither is inferred. The gap is a fact that exists '
      + 'somewhere in the building but not in the observation, which is what makes it askable.',
  },
  {
    id: 'SEM-04',
    location: 'Distribution centre, mezzanine steel', task: 'sprinkler pipe modification',
    observation:
      'A pipefitter was working from a scissor lift at about eighteen feet altering sprinkler branch '
      + 'line under the mezzanine. His harness was on and the lanyard was clipped to the lift rail. '
      + 'The lift was positioned with one wheel on the edge of a floor plate that covers a utility '
      + 'trench. I could not establish the plate rating and there was no spotter at the base.',
    present: ['fall_protection', 'mobile_equipment'],
    lifeCritical: ['fall_protection'],
    gaps: [{
      gapId: 'SEM-04-G1',
      missingFact:
        'the load rating of the trench cover plate relative to the scissor lift wheel load',
      whyAbsent:
        'The plate is an existing floor feature with no visible marking, and the observer had no way '
        + 'to establish its rating on the spot.',
      affectedDecision: 'HAZARD_EXISTENCE',
      alternativeOutcomes:
        'If the plate is rated for the wheel load this is a routine elevated-work finding about '
        + 'spotting. If it is not, the lift can drop a wheel mid-task, and a tip-over at eighteen '
        + 'feet with an occupant clipped to the rail is a fatality mechanism rather than a fall '
        + 'arrest event.',
    }],
    interactions: [{
      interactionKind: 'FALL_EXPOSURE_ANCHORAGE',
      participants: ['fall_protection', 'mobile_equipment'],
      evidencePerParticipant: {
        fall_protection:
          'Work at approximately eighteen feet with a harness and lanyard in use.',
        mobile_equipment:
          'A scissor lift is the work platform and is positioned with a wheel on a floor plate of '
          + 'unknown rating.',
      },
      relationship:
        'Scissor-lift and platform stability directly governs the elevated-worker fall and tip-over '
        + 'exposure. The lanyard is clipped to the lift rail, and the observation does not establish '
        + 'that the rail is an acceptable anchorage -- that determination can depend on the lift '
        + 'design and manufacturer requirements -- so a stability problem in the lift is an '
        + 'elevated-work exposure problem rather than a separate equipment problem.',
      independentLoss:
        'Assessed apart, the fall-protection arrangement is recorded only as harness on and lanyard '
        + 'clipped, and the lift placement reads as a minor siting issue. Together they establish '
        + 'that the platform carrying both the worker and the lanyard attachment is standing on a '
        + 'plate of unknown rating, so platform stability governs the elevated-work exposure.',
    }],
    rationale:
      'An interaction where the stability of the platform governs the exposure the observed control '
      + 'is meant to address. The gap changes whether a hazard exists at all, which is why it is '
      + 'HAZARD_EXISTENCE rather than a control question.',
  },
  {
    id: 'SEM-05',
    location: 'Metal finishing, plating line tank 7', task: 'tank relining',
    observation:
      'A two-person crew was inside a drained chrome plating tank applying a solvent-based liner. '
      + 'The tank is about five feet deep with a fixed ladder over the lip. Both wore half-face '
      + 'respirators with organic vapour cartridges. A flexible duct was laid over the rim but the '
      + 'blower it connects to was not running while I watched, and the liner product data sheet was '
      + 'not on site.',
    present: ['chemical_exposure', 'confined_space'],
    lifeCritical: ['chemical_exposure', 'confined_space'],
    gaps: [{
      gapId: 'SEM-05-G1',
      missingFact:
        'the solvent constituents of the liner product, specifically whether it contains a '
        + 'substance with poor warning properties or an IDLH low enough to prohibit air-purifying '
        + 'respirators',
      whyAbsent:
        'The product data sheet was not on site and the observer had no other source for the '
        + 'formulation.',
      affectedDecision: 'REQUIRED_CONTROL',
      alternativeOutcomes:
        'For a common high-flashpoint solvent, organic vapour cartridges plus working ventilation '
        + 'are adequate and the finding is that the blower was off. For a methylene-chloride-type '
        + 'constituent, cartridge respirators are prohibited outright and the crew requires supplied '
        + 'air -- the current PPE would be providing false assurance rather than protection.',
    }],
    interactions: [{
      interactionKind: 'CHEMICAL_PPE_VENTILATION',
      participants: ['chemical_exposure', 'confined_space'],
      evidencePerParticipant: {
        chemical_exposure:
          'Solvent-based liner applied by hand, with respirators in use, indicating a recognised '
          + 'inhalation exposure.',
        confined_space:
          'A five-foot drained tank entered over a lip by fixed ladder, with a single access route.',
      },
      relationship:
        'Solvent vapour is heavier than air and settles into the tank, so the enclosure concentrates '
        + 'exactly the exposure the PPE is chosen against, and the idle blower removes the control '
        + 'that would otherwise keep the concentration inside the cartridge range.',
      independentLoss:
        'Separately this is "wear the right respirator" and "this is a confined space". Together it '
        + 'is that respirator selection cannot be made without knowing the concentration the '
        + 'enclosure will produce, and the ventilation is what holds that concentration down.',
    }],
    uncertainty:
      'I classified the tank as a confined space on depth, single access and restricted egress. A '
      + 'reviewer might argue a five-foot open-topped tank is not a permit space at this site.',
    rationale:
      'The missing fact is a document, not an observation, which is a realistic and common gap. The '
      + 'interaction is between the exposure and the enclosure that shapes it.',
  },
  {
    id: 'SEM-06',
    location: 'Rail transfer dock, grain terminal', task: 'railcar unloading',
    observation:
      'A front-end loader was working the pit apron while two operators walked between the railcar '
      + 'and the pit grating to clear spillage. The loader was reversing along the same line they '
      + 'used. The pit grating had one panel lifted and set aside, leaving an opening onto the '
      + 'conveyor below. Nobody was wearing high-visibility clothing and I could not tell whether '
      + 'the loader had a functioning reverse alarm.',
    present: ['mobile_equipment', 'fall_protection'],
    lifeCritical: ['mobile_equipment', 'fall_protection'],
    rationale:
      'The observation establishes both a mobile-equipment hazard and a fall/opening hazard, but it '
      + 'does not establish that the opening is actually in the pedestrians\' evasive path or that '
      + 'avoiding the loader directs them toward it, so the two are recorded as co-occurrence rather '
      + 'than an interaction. Whether the reverse alarm functions does not change the principal '
      + 'safety decision either: pedestrians and a reversing loader already share the same travel '
      + 'line with no segregation described, so no clarification is owed.',
  },
  {
    id: 'SEM-07',
    location: 'Bottling plant, filler carousel', task: 'clearing a jam',
    observation:
      'An operator had opened the filler carousel guard door to clear a fallen bottle. The E-stop '
      + 'on the panel was pressed in and the carousel was still. The line uses a nitrogen dosing '
      + 'head above the fill point that is fed from a separate header. Nobody had locked the '
      + 'disconnect, and I could not tell whether the nitrogen header had been bled.',
    present: ['machine_guarding', 'lockout_tagout'],
    lifeCritical: ['machine_guarding'],
    gaps: [{
      gapId: 'SEM-07-G1',
      missingFact:
        'whether the nitrogen dosing header was isolated and bled before the guard door was opened',
      whyAbsent:
        'The header runs above the fill point from a separate supply and its state is not visible '
        + 'from the guard door where the observer stood.',
      affectedDecision: 'REQUIRED_CONTROL',
      alternativeOutcomes:
        'If the header is bled, the remaining issue is that an E-stop is being used as an energy '
        + 'isolation device. If it is still charged, a person reaching into the fill point is also '
        + 'reaching into a pressurised inert-gas discharge, which adds an asphyxiation and injection '
        + 'mechanism the guard interlock was never intended to control.',
    }],
    interactions: [{
      interactionKind: 'LOTO_STORED_ENERGY',
      participants: ['machine_guarding', 'lockout_tagout'],
      evidencePerParticipant: {
        machine_guarding:
          'The carousel guard door is open with a hand entering the fill point.',
        lockout_tagout:
          'An E-stop is being relied on in place of a locked disconnect, and a separate pressurised '
          + 'nitrogen header serves the same point of operation.',
      },
      relationship:
        'The guard opening creates access to a point served by two energies, and the control in use '
        + '-- an E-stop -- addresses neither of them as an isolation. An E-stop is a control-circuit '
        + 'function, not an energy-isolating device.',
      independentLoss:
        'Separately: "do not reach past a guard" and "use lockout, not E-stop". Together: the reason '
        + 'the E-stop is inadequate here is specifically that it leaves a second energy source live '
        + 'at the exact point the guard was opened to reach.',
    }],
    rationale:
      'Uses a genuine and common substitution error -- E-stop as isolation -- and pairs it with a '
      + 'second energy the substitution cannot reach.',
  },
  {
    id: 'SEM-08',
    location: 'Brewery, fermentation cellar', task: 'tank cleaning changeover',
    observation:
      'A cellar operator was leaning through the manway of a fermenter to swap a spray ball. The '
      + 'tank had been emptied that morning after primary fermentation. There was no gas meter in '
      + 'use and no attendant, though a second operator was working elsewhere in the cellar. The '
      + 'CIP caustic line was connected at the tank and I could not see whether it was valved shut.',
    present: ['confined_space'],
    lifeCritical: ['confined_space'],
    gaps: [{
      gapId: 'SEM-08-G1',
      missingFact:
        'the oxygen concentration inside the fermenter after primary fermentation and before the '
        + 'operator put his head through the manway',
      whyAbsent:
        'No gas meter was in use anywhere at the tank, so no reading exists to report.',
      affectedDecision: 'HAZARD_EXISTENCE',
      alternativeOutcomes:
        'If the tank was purged and ventilated, leaning in to change a spray ball is routine work. '
        + 'If residual CO2 has displaced oxygen -- which is the normal state of a freshly emptied '
        + 'fermenter -- then breaking the plane of the manway is an oxygen-deficient exposure that '
        + 'incapacitates before it is noticed.',
    }],
    uncertainty:
      'Whether leaning through a manway constitutes entry is a real judgement question. I treated '
      + 'breaking the plane as entry; a reviewer may hold that only full-body entry counts, which '
      + 'would change the control set though probably not the gap.',
    rationale:
      'A hazard that is invisible, odourless and routine, where the missing fact decides whether a '
      + 'hazard exists at all rather than which control applies. No interaction is recorded: the '
      + 'atmospheric hazard is deliberately unresolved by this row\'s own clarification truth, so '
      + 'chemical exposure cannot simultaneously remain defensible and participate in a present '
      + 'interaction.',
  },
  {
    id: 'SEM-09',
    location: 'Furniture works, finishing booth', task: 'spray booth maintenance',
    observation:
      'A maintenance tech was replacing filter media in the down-draught finishing booth. Solvent '
      + 'residue was heavy on the plenum and the booth still smelled strongly of thinner. He was '
      + 'using a corded shop light with a standard plastic cage hung from the plenum frame. The '
      + 'booth exhaust fan was off and locked out for the filter change.',
    present: ['chemical_exposure', 'electrical'],
    lifeCritical: ['chemical_exposure'],
    negatedOrSafe: ['machine_guarding'],
    gaps: [{
      gapId: 'SEM-09-G1',
      missingFact:
        'whether the corded shop light in use is a rated explosion-proof or intrinsically safe '
        + 'fitting for a Class I location',
      whyAbsent:
        'The observer describes the fitting only by its plastic cage; the rating marking is not '
        + 'visible in that description and was not established.',
      affectedDecision: 'HAZARD_EXISTENCE',
      alternativeOutcomes:
        'A rated fitting makes this a routine filter change in a solvent atmosphere. An ordinary '
        + 'shop light is a competent ignition source introduced into a space with a strong solvent '
        + 'vapour concentration and no running exhaust -- which is a flash-fire mechanism, not a '
        + 'housekeeping issue.',
    }],
    // NO INTERACTION RECORDED, and the reason is a CONTRACT FINDING rather than a safety judgement.
    // Flammable vapour plus a competent ignition source in a box whose ventilation has been
    // deliberately locked out IS a genuine interaction, and I believe it is one. The closed
    // EXPERT_INTERACTION_KINDS vocabulary has no flammable-atmosphere/ignition kind, so the only
    // available label is `OTHER` -- and `OTHER` is ALSO a legal Expert output value that the prompt
    // legitimately names, so recording it as truth trips the frozen truth-leak detector, which
    // reads the token in the rendered request and cannot tell the two uses apart.
    //
    // Weakening the leak detector to permit it is not available. Mislabelling the relationship as
    // CHEMICAL_PPE_VENTILATION -- a protection kind, not an ignition kind -- would be a false
    // determination bought for a count. So the interaction is LEFT UNRECORDED and reported: the
    // vocabulary cannot express this hazard, which is a finding about the frozen contract.
    uncertainty:
      'This row SHOULD carry an interaction and does not. Flammable vapour plus an energised '
      + 'unrated fitting, with the exhaust locked out, is a real relationship -- but the closed '
      + 'vocabulary has no kind for it and its only catch-all, OTHER, is unusable as truth because '
      + 'it is simultaneously a legal model output. Recorded as a contract limitation.',
    rationale:
      'A row where a correct control for one hazard worsens another. The interaction is deliberately '
      + 'NOT recorded because the closed vocabulary cannot name it -- see the note above. The gap '
      + 'and the family partition stand on their own.',
  },
  {
    id: 'SEM-10',
    location: 'Car park structure, level 2 drainage', task: 'storm drain clearing',
    observation:
      'A crew was clearing a blocked storm sump on level 2 of the car park. One worker was down in '
      + 'the sump chamber, roughly six feet, standing in water to mid-calf. A submersible pump and a '
      + 'work light were both fed from a cord reel at the deck edge. Vehicles were circulating on '
      + 'the deck. I did not see a rescue line and I could not tell whether the cord reel had '
      + 'integral GFCI.',
    present: ['electrical', 'confined_space'],
    lifeCritical: ['electrical', 'confined_space'],
    gaps: [{
      gapId: 'SEM-10-G1',
      missingFact:
        'whether the cord reel feeding the pump and work light provides GFCI protection to the '
        + 'worker standing in water',
      whyAbsent:
        'The reel is at the deck edge above the chamber and its protection status is not '
        + 'determinable from the cords running into the sump.',
      affectedDecision: 'REQUIRED_CONTROL',
      alternativeOutcomes:
        'Protected, a fault clears instantly and the finding concerns rescue provision. '
        + 'Unprotected, an insulation failure in either appliance energises standing water around a '
        + 'person in a chamber with no rescue line, and the work must stop rather than continue with '
        + 'added precautions.',
    }],
    interactions: [{
      interactionKind: 'ELECTRICAL_WET_ENVIRONMENT',
      participants: ['electrical', 'confined_space'],
      evidencePerParticipant: {
        electrical:
          'Two energised appliances are fed into a chamber where a person stands in water.',
        confined_space:
          'A six-foot sump chamber with a single top opening and, as observed, no rescue line.',
      },
      relationship:
        'Standing water couples the worker to any fault, and the chamber prevents both self-rescue '
        + 'and quick assisted rescue. Each condition makes the other\'s consequence worse.',
      independentLoss:
        'Apart, these are two ordinary findings with ordinary fixes. Together they describe a person '
        + 'who cannot get out of a place where the floor may become energised, which is what makes '
        + 'the GFCI question decisive rather than advisable.',
    }],
    rationale:
      'A second wet-electrical confined space deliberately set in a different industry and geometry '
      + 'from SEM-03, so the pair tests the relationship rather than a memorised scene.',
  },

  // ============================================================ INTERACTION ONLY (SEM-11..14)
  {
    id: 'SEM-11',
    location: 'Paper mill, winder', task: 'roll change observation',
    observation:
      'At the winder, an operator was clearing a wrap from the rider roll. The drive was locked out '
      + 'at the panel with two locks and the crew had verified zero speed. The nip guard was swung '
      + 'clear, and the roll had been chocked with the wedge the procedure specifies before anyone '
      + 'reached in. The pneumatic loading cylinder was bled and its gauge read zero at the frame.',
    present: ['lockout_tagout', 'machine_guarding'],
    negatedOrSafe: ['lockout_tagout', 'machine_guarding'],
    lifeCritical: ['machine_guarding'],
    interactions: [{
      interactionKind: 'LOTO_STORED_ENERGY',
      participants: ['lockout_tagout', 'machine_guarding'],
      evidencePerParticipant: {
        lockout_tagout:
          'Two locks at the panel, verified zero speed, pneumatic cylinder bled with a zero gauge '
          + 'reading at the frame.',
        machine_guarding:
          'The nip guard is swung clear and a person reaches into the nip region.',
      },
      relationship:
        'The same relationship as an incomplete isolation, executed correctly: the guard is open '
        + 'precisely because every energy that could drive the nip -- electrical, rotational inertia '
        + 'and stored pneumatic -- has been isolated and verified first.',
      independentLoss:
        'Recorded because the interaction is what makes this correct. A reviewer who checks only '
        + 'that a lock exists misses that the wedge and the bled cylinder are what make the open '
        + 'guard acceptable.',
    }],
    rationale:
      'An interaction row where nothing is wrong. Interactions must not be a synonym for danger, and '
      + 'an evaluation whose every recorded interaction is a deficiency teaches the wrong pattern. '
      + 'Nothing is owed: every energy state is stated and verified.',
  },
  {
    id: 'SEM-12',
    location: 'Ethanol plant, beer well', task: 'permit entry oversight',
    observation:
      'Entry into the beer well was under way for a level probe replacement. Continuous monitoring '
      + 'was running with the meter at the opening and readings called out every ten minutes and '
      + 'logged. The feed line was blinded with the blind visible from the platform, the space had '
      + 'been purged with forced air for two hours before entry, and an attendant with retrieval '
      + 'gear was at the hatch with the entrant in sight.',
    present: ['confined_space', 'chemical_exposure'],
    negatedOrSafe: ['confined_space', 'chemical_exposure'],
    lifeCritical: ['confined_space'],
    interactions: [{
      interactionKind: 'CONFINED_SPACE_ATMOSPHERIC',
      participants: ['confined_space', 'chemical_exposure'],
      evidencePerParticipant: {
        confined_space:
          'A permit entry into a process vessel through a hatch, with an attendant and retrieval '
          + 'gear posted.',
        chemical_exposure:
          'A beer well holds fermenting mash, which generates CO2 and ethanol vapour; the space '
          + 'required a two-hour forced-air purge.',
      },
      relationship:
        'The atmospheric hazard exists because of the enclosure, and here every element of the '
        + 'control set addresses that relationship: purge to remove the accumulation, blind to stop '
        + 'it returning, continuous monitoring to prove it stays gone.',
      independentLoss:
        'A reviewer treating these separately would count the controls but not see that the blind '
        + 'is what stops the purge being undone -- the sequencing, not the checklist, is the point.',
    }],
    rationale:
      'A correctly controlled atmospheric interaction. This is the hardest row for an eager layer: '
      + 'every element that would be a finding if missing is present, so a finding raised here is a '
      + 'false positive. Nothing is owed -- readings, purge, blind and attendant are all stated.',
  },
  {
    id: 'SEM-13',
    location: 'Arena, roof truss walkway', task: 'rigging point inspection',
    observation:
      'A rigger was inspecting truss attachment points from a personnel lift at roughly thirty feet '
      + 'over fixed seating. He was harnessed with the lanyard clipped to the manufacturer anchor '
      + 'inside the basket, the outriggers were deployed on levelling pads, and the lift was '
      + 'positioned on the poured concourse slab clear of any covers or trenching. A ground '
      + 'attendant was posted at the base with the controls keyed.',
    present: ['fall_protection', 'mobile_equipment'],
    negatedOrSafe: ['fall_protection', 'mobile_equipment'],
    lifeCritical: ['fall_protection'],
    interactions: [{
      interactionKind: 'FALL_EXPOSURE_ANCHORAGE',
      participants: ['fall_protection', 'mobile_equipment'],
      evidencePerParticipant: {
        fall_protection:
          'Work at approximately thirty feet with harness and lanyard clipped to the basket anchor.',
        mobile_equipment:
          'A personnel lift is the platform, with outriggers deployed and a ground attendant posted.',
      },
      relationship:
        'The personnel lift is both the elevated work platform and the structure carrying the '
        + 'manufacturer-designated anchorage, so platform stability affects the worker\'s overall '
        + 'elevated-work exposure. The manufacturer-designated anchor is the anchorage; the '
        + 'outriggers on levelling pads, the sound slab and the attendant at the base control the '
        + 'platform and tip-over exposure rather than the anchor\'s certification itself.',
      independentLoss:
        'Recorded because it is the same interaction as SEM-04 with the stability question answered. '
        + 'Reading the harness and anchor alone would describe only part of the arrangement, because '
        + 'the platform condition governs the elevated-work exposure independently of the anchor.',
    }],
    rationale:
      'The deliberate counterpart to SEM-04. If the only anchorage interaction in the corpus is a '
      + 'defective one, the interaction becomes a proxy for "something is wrong". Nothing is owed.',
  },
  {
    id: 'SEM-14',
    location: 'Pharmaceutical plant, granulator suite', task: 'solvent charge observation',
    observation:
      'An operator was charging isopropanol into a high-shear granulator through the charge port in '
      + 'a closed suite. The suite was under active local exhaust with the face velocity gauge in '
      + 'the green band, he wore a supplied-air hood fed from the plant breathing-air panel, the '
      + 'transfer was bonded and grounded at both the drum and the vessel, and the granulator drive '
      + 'was interlocked off with the charge port open.',
    present: ['chemical_exposure'],
    negatedOrSafe: ['chemical_exposure', 'machine_guarding'],
    lifeCritical: ['chemical_exposure'],
    uncertainty:
      'Calling a closed granulator suite a confined_space is the weakest classification in this '
      + 'corpus. It is an enclosed, ventilation-dependent work area rather than a permit space, and '
      + 'a reviewer may well move this to DEFENSIBLE, which would remove the interaction with it.',
    rationale:
      'A correctly controlled chemical exposure under supplied air and active local exhaust. No '
      + 'interaction is recorded and no confined space is established: a closed suite with active '
      + 'ventilation is an enclosed work area, and enclosure or ventilation dependence alone does '
      + 'not satisfy the confined-space classification, so the chemical and enclosure facts are not '
      + 'paired.',
  },

  // ============================================================ GAP ONLY (SEM-15..30)
  {
    id: 'SEM-15',
    location: 'Foundry, shakeout line', task: 'general walkthrough',
    observation:
      'At the shakeout, the vibrating conveyor drive coupling guard was in place and bolted. A '
      + 'forklift was moving flask stacks in the adjacent bay behind a painted barrier line. The '
      + 'shakeout hood exhaust was running. A worker was using a compressed-air wand to blow silica '
      + 'dust off the deck plates and I could not tell what the wand outlet pressure was set to.',
    present: ['chemical_exposure', 'mobile_equipment'],
    lifeCritical: ['chemical_exposure'],
    negatedOrSafe: ['machine_guarding'],
    gaps: [{
      gapId: 'SEM-15-G1',
      missingFact:
        'the regulated outlet pressure of the compressed-air wand being used to blow down silica '
        + 'dust',
      whyAbsent:
        'The wand regulator setting is not visible in the observation and was not stated.',
      affectedDecision: 'APPLICABILITY',
      alternativeOutcomes:
        'A wand regulated to a low outlet pressure may satisfy the general compressed-air pressure '
        + 'requirement, so the applicable question becomes whether an additional compressed-air '
        + 'requirement is violated. Above that threshold the compressed-air cleaning limitation '
        + 'applies directly. Either answer leaves the silica-specific controls independently in '
        + 'force -- they can restrict compressed-air cleaning unless the applicable dust-capture and '
        + 'feasibility conditions are met -- so the answer does not by itself decide whether the '
        + 'overall silica-cleaning method is acceptable.',
    }],
    rationale:
      'A gap that changes which rule applies rather than which control is chosen, so the affected '
      + 'decision is APPLICABILITY. The forklift and the guard are ordinary scene detail; the guard '
      + 'being fitted and bolted is recorded as an observed controlled condition rather than as '
      + 'affirmative exclusion of the machine-guarding family.',
  },
  {
    id: 'SEM-16',
    location: 'Bakery, dough divider', task: 'sanitation shift observation',
    observation:
      'Sanitation was washing down the dough divider at the end of shift. The machine was stopped '
      + 'and the main disconnect was open with a departmental lock. A worker was spraying the hopper '
      + 'interior with a hose from outside the frame. The sanitiser concentrate was being drawn '
      + 'through a wall-mounted proportioner and I could not tell whether the proportioner had been '
      + 'verified at its dilution setting.',
    present: ['chemical_exposure', 'lockout_tagout'],
    negatedOrSafe: ['lockout_tagout', 'machine_guarding'],
    gaps: [{
      gapId: 'SEM-16-G1',
      missingFact:
        'whether the proportioner is actually delivering the sanitiser at its intended labelled use '
        + 'dilution',
      whyAbsent:
        'Proportioner performance is not observable from the discharge; it requires a titration or '
        + 'test strip that was not described.',
      affectedDecision: 'HAZARD_SEVERITY',
      alternativeOutcomes:
        'At the intended labelled dilution this is routine sanitation with ordinary splash '
        + 'precautions. A materially higher-than-intended concentration can change the exposure '
        + 'severity and the required PPE and contact response; the exact consequence depends on the '
        + 'sanitiser chemistry, which this observation does not establish.',
    }],
    rationale:
      'A severity gap rather than an existence gap: the chemical exposure is real either way, and '
      + 'the missing fact moves how serious it is and what protection follows.',
  },
  {
    id: 'SEM-17',
    location: 'HVAC penthouse, tower 3', task: 'chiller maintenance',
    observation:
      'A technician was working on a chiller compressor in the penthouse. The unit disconnect was '
      + 'open and tagged, but not locked -- the tag was signed and dated today. He had the terminal '
      + 'box open and was taking readings. The penthouse roof hatch was propped open behind him at '
      + 'the top of a fixed ladder. I did not establish whether the disconnect is capable of '
      + 'accepting a lock.',
    present: ['electrical', 'lockout_tagout'],
    lifeCritical: ['electrical'],
    gaps: [{
      gapId: 'SEM-17-G1',
      missingFact:
        'whether this disconnect is capable of accepting a lockout device, which determines whether '
        + 'tagout alone is permissible here',
      whyAbsent:
        'Lock capability is a property of the switch hardware that the observer did not inspect and '
        + 'that a signed tag does not reveal.',
      affectedDecision: 'APPLICABILITY',
      alternativeOutcomes:
        'If the disconnect cannot accept a lock, tagout plus additional safety measures is the '
        + 'applicable path and the finding is whether those measures exist. If it can accept a lock, '
        + 'tagout alone is not permitted and the finding is a straightforward isolation violation.',
    }],
    uncertainty:
      'I did not mark fall_protection present. The propped hatch at the head of a fixed ladder is a '
      + 'plausible opening exposure and a reviewer may consider it present rather than defensible.',
    rationale:
      'A gap about equipment capability that decides which regulatory path applies. The open hatch '
      + 'is deliberately left DEFENSIBLE rather than forbidden -- nothing in the text rules it out.',
  },
  {
    id: 'SEM-18',
    location: 'Quarry, primary crusher gallery', task: 'blockage clearing',
    observation:
      'Two workers were poking a blockage in the primary crusher jaw from the gallery above using a '
      + 'long bar. The crusher was stopped and the feeder was off. The gallery grating was sound and '
      + 'the handrail was continuous. I could not tell from above whether the crusher drive had been '
      + 'isolated or merely stopped at the local control station.',
    present: ['machine_guarding', 'lockout_tagout'],
    lifeCritical: ['machine_guarding'],
    gaps: [{
      gapId: 'SEM-18-G1',
      missingFact:
        'whether the crusher drive was isolated at its disconnect or only stopped at the local '
        + 'control station',
      whyAbsent:
        'The disconnect is not visible from the gallery where the observer stood, and a stopped '
        + 'machine looks identical to an isolated one from above.',
      affectedDecision: 'REQUIRED_CONTROL',
      alternativeOutcomes:
        'Isolated, this is a controlled blockage-clearing task and the question becomes bar '
        + 'technique and stored material. Merely stopped, a remote or automatic restart while a bar '
        + 'is in the jaw is a crushing fatality mechanism, and the required control becomes full '
        + 'isolation before any tool enters the chamber.',
    }],
    negatedOrSafe: ['fall_protection'],
    interactions: [{
      interactionKind: 'LOTO_STORED_ENERGY',
      participants: ['machine_guarding', 'lockout_tagout'],
      evidencePerParticipant: {
        machine_guarding:
          'Two workers are poking a blockage in the primary crusher jaw with a long bar, placing a '
          + 'tool into the crusher hazard zone.',
        lockout_tagout:
          'The crusher is stopped and the feeder off, but whether the drive was isolated at its '
          + 'disconnect or only stopped at the local control station was not established.',
      },
      relationship:
        'The workers are placing a tool into the crusher hazard zone. Whether that access is '
        + 'acceptably controlled depends directly on whether the drive is positively isolated rather '
        + 'than merely stopped, so the machine access creates the exposure whose acceptability is '
        + 'governed by the energy-isolation state.',
      independentLoss:
        'These are not independent co-occurring findings. If isolated, the task can proceed subject '
        + 'to the remaining stored and material hazards and the procedure. If merely stopped, '
        + 'unexpected startup while the bar is in the jaw creates a crushing and struck-by mechanism.',
    }],
    rationale:
      'A stopped-versus-isolated ambiguity that a reviewer genuinely cannot resolve from the '
      + 'observation point, which is what makes it a real gap rather than an omission. The same '
      + 'ambiguity governs the recorded interaction: machine access creates the exposure and the '
      + 'energy-isolation state decides whether it is acceptable.',
  },
  {
    id: 'SEM-19',
    location: 'Textile mill, dye house', task: 'colour kitchen walkthrough',
    observation:
      'In the colour kitchen a technician was weighing powdered dye into a mixing vessel under a '
      + 'canopy hood. He wore a fitted half-face respirator with P100 cartridges and nitrile gloves. '
      + 'The hood was drawing and the capture appeared adequate at the weighing position. The dye in '
      + 'use was a benzidine-family product according to the drum label, and I could not tell '
      + 'whether the facility had a written exposure control plan for it.',
    present: ['chemical_exposure'],
    lifeCritical: ['chemical_exposure'],
    gaps: [{
      gapId: 'SEM-19-G1',
      missingFact:
        'the exact identity and applicable concentration of the benzidine-family dye, sufficient to '
        + 'determine whether it is one of the substances or mixtures actually covered by 29 CFR '
        + '1910.1003, and, if covered, whether the weighing operation is being conducted within the '
        + 'required regulated-area and control regime applicable to that operation',
      whyAbsent:
        'The drum label states only that the product is benzidine-family, which is not enough to '
        + 'establish the substance identity or the applicable concentration, and the regime '
        + 'governing the operation cannot be established by watching the weighing.',
      affectedDecision: 'REGULATORY_INTERPRETATION',
      alternativeOutcomes:
        'If the material is within the scope of 29 CFR 1910.1003, the standard requires a regulated '
        + 'area and operation-specific controls, which for transfer or charging operations can '
        + 'include restricted access, continuous local exhaust, protective clothing, respiratory '
        + 'protection and hygiene or decontamination measures, and the observed operation must '
        + 'itself satisfy them. If the material is outside the standard\'s scope, those specific '
        + 'obligations do not attach merely because the product is described generically as '
        + 'benzidine-family.',
    }],
    rationale:
      'The gap is whether the standard covers this specific material at all, and if so whether the '
      + 'operation is being conducted within the regime it requires -- a REGULATORY_INTERPRETATION '
      + 'question rather than a control question. No family is forbidden: nothing in the text '
      + 'affirmatively rules anything out.',
  },
  {
    id: 'SEM-20',
    location: 'Data centre, generator yard', task: 'load bank test',
    observation:
      'A vendor was running a load bank test on the standby generator. Cables ran from the load bank '
      + 'to the generator breaker cubicle across the yard on rubber ramps. The cubicle door was '
      + 'closed and latched during the run. The vendor was standing at the load bank taking '
      + 'readings. I could not tell whether the site had established an arc flash boundary for the '
      + 'cubicle or what the incident energy at that point is.',
    present: ['electrical'],
    lifeCritical: ['electrical'],
    rationale:
      'The observation establishes a load-bank test underway, energized generator equipment, the '
      + 'breaker cubicle closed and latched, and the vendor standing at the load bank. It does not '
      + 'establish that the vendor must approach, open, operate or rack the cubicle during the '
      + 'observed task, so the incident-energy and arc-flash-boundary question does not materially '
      + 'change the safety decision for the task as actually described and no clarification is owed.',
  },
  {
    id: 'SEM-21',
    location: 'Auto body shop, prep bay', task: 'panel preparation',
    observation:
      'A technician was sanding filler on a quarter panel with an orbital sander connected to a '
      + 'vacuum shroud. He wore a dust mask of the moulded disposable type. The shop compressor was '
      + 'running in the corner behind a screen. The panel had been repaired previously and I could '
      + 'not tell whether the underlying coating being sanded contained lead or chromate.',
    present: ['chemical_exposure'],
    gaps: [{
      gapId: 'SEM-21-G1',
      missingFact:
        'whether the previously applied coating being sanded contains lead or hexavalent chromium',
      whyAbsent:
        'The prior repair history is unknown and the coating composition cannot be determined by '
        + 'eye; no testing was described.',
      affectedDecision: 'HAZARD_SEVERITY',
      alternativeOutcomes:
        'For a modern lead-free coating, shrouded sanding with a disposable mask is proportionate. '
        + 'If the substrate carries lead or chromate, the same task becomes a regulated metal '
        + 'exposure requiring fit-tested respiratory protection, hygiene facilities and exposure '
        + 'monitoring, and the observed mask is not adequate.',
    }],
    rationale:
      'A common and genuinely unresolvable-on-sight question in repair work. No family is forbidden: '
      + 'the compressor behind a screen is incidental but nothing states it is inaccessible, so '
      + 'machine_guarding stays defensible rather than being ruled out.',
  },
  {
    id: 'SEM-22',
    location: 'Grain elevator, headhouse', task: 'belt tracking adjustment',
    observation:
      'A millwright was adjusting tracking on the headhouse belt while it ran at reduced speed, '
      + 'reaching to the take-up screw with the drum guard hinged open. Grain dust was visible in '
      + 'the air in the headhouse. He was not wearing gloves and stood on the fixed platform. I '
      + 'could not tell whether the reduced-speed jog mode disables the automatic restart.',
    present: ['machine_guarding', 'chemical_exposure'],
    lifeCritical: ['machine_guarding'],
    uncertainty:
      'I recorded no interaction between the dust and the machine hazard. Grain dust is an explosion '
      + 'hazard and a hot bearing or nip can be the ignition source, so a reviewer could argue a '
      + 'genuine interaction exists here. I judged the text does not establish an ignition mechanism, '
      + 'so recording one would be inference rather than observation.',
    rationale:
      'Two present families that are deliberately NOT recorded as interacting, with the reason '
      + 'stated. Co-occurrence is the default and an interaction must be earned by the text. No '
      + 'clarification is owed either: the belt is running with the drum guard open and the '
      + 'millwright reaching to the take-up, so hazardous moving-machine exposure is already '
      + 'occurring and the restart behaviour does not change that required decision.',
  },
  {
    id: 'SEM-23',
    location: 'Marina, travel lift bay', task: 'hull pressure washing',
    observation:
      'A yard hand was pressure washing a hull suspended in the travel lift slings. He worked from '
      + 'the ground with a wand on an extension pole, spraying upward. Antifouling paint was coming '
      + 'off in flakes and washing into the yard drain. The lift operator was in the cab with the '
      + 'hoist stationary. I could not tell whether the yard drain discharges to a treatment '
      + 'interceptor or directly to the basin.',
    present: ['chemical_exposure', 'mobile_equipment'],
    rationale:
      'The missing drain-routing fact affects environmental discharge and compliance rather than '
      + 'the worker safety and health decision represented by this row\'s hazard families, and the '
      + 'worker\'s exposure to antifouling residue exists regardless of whether the drain reaches an '
      + 'interceptor or the basin, so no clarification is owed. The suspended hull and the '
      + 'stationary hoist are present as equipment context; nothing in the text rules any family '
      + 'out, so nothing is forbidden.',
  },
  {
    id: 'SEM-24',
    location: 'Boiler house, No. 2 boiler', task: 'annual outage preparation',
    observation:
      'The crew was preparing No. 2 boiler for internal inspection. The fuel gas valve was closed '
      + 'and chained, and the boiler had been cooling for two days. The manway cover was still '
      + 'bolted. A blank list was posted at the boiler front. I could not establish whether the '
      + 'steam header stop valve had been double-blocked and bled, or only closed.',
    present: ['lockout_tagout', 'confined_space'],
    lifeCritical: ['confined_space', 'lockout_tagout'],
    gaps: [{
      gapId: 'SEM-24-G1',
      missingFact:
        'whether the steam header connection was double-blocked and bled rather than only valved '
        + 'closed, before the manway is opened for entry',
      whyAbsent:
        'The header arrangement is not visible from the boiler front and the posted blank list '
        + 'records the plan rather than proving what has been executed.',
      affectedDecision: 'REQUIRED_CONTROL',
      alternativeOutcomes:
        'Double-blocked and bled, entry into the drum proceeds on a proven isolation. Valved only, a '
        + 'passing or mis-set valve can admit live steam into a vessel containing a person, which is '
        + 'the mechanism that requires positive isolation rather than valve position.',
    }],
    interactions: [{
      interactionKind: 'LOTO_STORED_ENERGY',
      participants: ['lockout_tagout', 'confined_space'],
      evidencePerParticipant: {
        lockout_tagout:
          'The fuel gas valve is closed and chained and a blank list is posted, but whether the '
          + 'steam header stop valve was double-blocked and bled or only closed is unestablished.',
        confined_space:
          'The crew is preparing No. 2 boiler for internal inspection, with the manway cover still '
          + 'bolted and entry into the drum yet to occur.',
      },
      relationship:
        'The steam-header isolation state directly governs whether entry into the boiler can occur '
        + 'safely. These hazards are not merely co-located: failure of the isolation can admit '
        + 'hazardous steam and process energy into the occupied confined space, so the isolation is '
        + 'part of the confined-space entry safety state.',
      independentLoss:
        'Assessed separately this is an isolation question and an entry-preparation question. '
        + 'Together they establish that the acceptability of the entry depends on proven positive '
        + 'isolation rather than valve position, which is what decides whether the manway may be '
        + 'opened for entry at all.',
    }],
    rationale:
      'A pre-entry isolation gap where the paperwork exists and its execution is unverified. Entry '
      + 'has not yet occurred, which is exactly when the question is worth asking, and the same '
      + 'isolation state is what governs whether the entry itself can proceed safely.',
  },
  {
    id: 'SEM-25',
    location: 'Recycling MRF, sort line', task: 'sort platform observation',
    observation:
      'Sorters were working both sides of the container line pulling film and rigid plastics. The '
      + 'line was running at normal speed. Guards were in place along the drive side and the '
      + 'emergency pull cord ran the length of the platform. Sorters wore cut-resistant gloves. A '
      + 'skid steer was loading the infeed hopper on the tipping floor below and behind them. I '
      + 'could not tell whether the sort platform had been assessed for noise requiring hearing '
      + 'protection, which nobody was wearing.',
    present: ['machine_guarding', 'mobile_equipment'],
    negatedOrSafe: ['machine_guarding'],
    gaps: [{
      gapId: 'SEM-25-G1',
      missingFact:
        'the employee\'s representative noise exposure during normal sort-platform work, preferably '
        + 'as an 8-hour time-weighted average or dose rather than a generic instantaneous noise '
        + 'level',
      whyAbsent:
        'Noise level requires measurement; the observation can establish that nobody wore protection '
        + 'but not whether protection is required.',
      affectedDecision: 'APPLICABILITY',
      alternativeOutcomes:
        'Below the action level, no hearing-conservation obligation attaches and the absence of '
        + 'plugs is not a finding. At or above an 8-hour time-weighted average of 85 dBA the '
        + 'hearing-conservation-programme requirements are triggered, which include monitoring, '
        + 'audiometric provisions, training and the availability of hearing protectors; mandatory '
        + 'use of protectors depends on the specific conditions in 1910.95 rather than following '
        + 'automatically from reaching that level.',
    }],
    rationale:
      'A gap where the missing fact decides whether there is any finding at all. The guarding is '
      + 'described as adequate and recorded as such; the skid steer is separated by level and is '
      + 'left defensible rather than forbidden, since the text does not rule out interaction with '
      + 'the sorters.',
  },
  {
    id: 'SEM-26',
    location: 'Print works, web press', task: 'blanket wash',
    observation:
      'A press operator was washing blankets on the running web press using a cloth and solvent from '
      + 'a squeeze bottle, reaching between the units at the wash-up position the press provides. '
      + 'The press was in wash mode at crawl speed. Ventilation in the press hall is general only. '
      + 'The solvent bottle was unlabelled and I could not establish what it contained.',
    present: ['chemical_exposure', 'machine_guarding'],
    lifeCritical: ['machine_guarding'],
    gaps: [{
      gapId: 'SEM-26-G1',
      missingFact:
        'the identity and flash point of the solvent in the unlabelled squeeze bottle',
      whyAbsent:
        'The container carries no label and no other identification was available at the press.',
      affectedDecision: 'REQUIRED_CONTROL',
      alternativeOutcomes:
        'The solvent identity does not decide whether the chemical family exists -- an unidentified '
        + 'solvent is already being used by hand -- it decides what hazards it presents and what '
        + 'controls are required. A higher-flash automatic wash solvent and a low-flash solvent such '
        + 'as a naphtha blend call for materially different ventilation, ignition-control and '
        + 'handling requirements at a running press with static generation, and the observation '
        + 'establishes neither.',
    }],
    uncertainty:
      'I did not record an interaction between the solvent and the press. If the solvent proves '
      + 'low-flash, a web press is a strong static generator and the relationship would become '
      + 'material -- but that depends on the answer to the gap, and recording an interaction '
      + 'contingent on an unknown seemed like asserting the answer.',
    rationale:
      'A row where the interaction question is genuinely open and is deliberately left unrecorded '
      + 'rather than assumed. The reaching-between-units exposure is real independently of the '
      + 'solvent identity.',
  },
  {
    id: 'SEM-27',
    location: 'Cement works, clinker cooler', task: 'inspection door observation',
    observation:
      'A process technician opened an inspection door on the clinker cooler to look at grate '
      + 'condition. Radiant heat from the opening was strong enough to feel several feet back. He '
      + 'wore standard cotton coveralls and a face shield. The cooler was running. The walkway was '
      + 'sound with a handrail. I could not establish whether the coveralls were flame-resistant.',
    present: [],
    gaps: [{
      gapId: 'SEM-27-G1',
      missingFact:
        'Whether the coveralls worn by the technician provide the flame-resistant and/or thermal '
        + 'protection required by the task-specific hazard assessment for opening the '
        + 'clinker-cooler inspection door while the cooler is operating.',
      whyAbsent:
        'The observation identifies the garments only as standard cotton coveralls and expressly '
        + 'states that their flame-resistant status could not be established. Whether those '
        + 'garments have the required protective rating or otherwise satisfy the task-specific '
        + 'thermal-protection requirement cannot be determined from the observed appearance alone.',
      affectedDecision: 'REQUIRED_CONTROL',
      alternativeOutcomes:
        'The observation already establishes significant radiant-heat exposure while an inspection '
        + 'door on operating hot-process equipment is open. The unresolved garment-protection fact '
        + 'does not determine whether that thermal hazard exists. It determines whether the '
        + 'clothing being worn satisfies the garment portion of the protective controls required '
        + 'for that task. If the coveralls provide the flame-resistant and/or thermal protection '
        + 'required by the task-specific hazard assessment, no additional garment control is '
        + 'established as necessary from this missing fact alone. If they do not provide the '
        + 'required protection, the garment portion of the control set is inadequate and '
        + 'appropriately protective clothing is required before performing the task under those '
        + 'conditions. This clarification does NOT establish that an FR-rated garment alone makes '
        + 'the overall PPE set or door-opening procedure adequate. Other controls for radiant '
        + 'heat, hot-material ejection, positioning, exposure duration, face/body protection, or '
        + 'the door-opening procedure may still be required independently.',
    }],
    negatedOrSafe: ['fall_protection'],
    rationale:
      'A thermal/hot-process exposure is established by the observation, including significant '
      + 'radiant heat at an open inspection door on operating clinker equipment. The frozen '
      + 'accepted hazard-family taxonomy has no family that represents this hazard without '
      + 'distortion. Machine guarding, chemical exposure, and fall protection therefore remain '
      + 'non-PRESENT rather than being used as proxies. The decision-critical clarification is '
      + 'independently retained because the unresolved garment thermal-protection requirement can '
      + 'change REQUIRED_CONTROL without requiring a PRESENT hazard-family candidate.',
  },
  {
    id: 'SEM-28',
    location: 'Hospital plant room, medical gas manifold', task: 'cylinder changeover',
    observation:
      'A porter was changing oxygen cylinders on the manifold in the plant room. Cylinders were '
      + 'chained in the racks and the manifold isolation was closed during the swap. He used no '
      + 'lubricant and the fittings were clean. The room has mechanical ventilation and I could not '
      + 'tell whether it was interlocked to run continuously or cycles with a thermostat.',
    present: ['chemical_exposure'],
    negatedOrSafe: ['chemical_exposure'],
    rationale:
      'Oxygen-cylinder changeover establishes the chemical and atmospheric hazard domain, and the '
      + 'observed controls -- cylinders secured, manifold isolation closed, no lubricant, clean '
      + 'fittings, mechanical ventilation operating -- describe the activity as controlled. No '
      + 'release or oxygen-enriched atmosphere is established. Whether the fan cycles or runs '
      + 'continuously may affect protection against a future release, but it does not determine '
      + 'whether a current oxygen-enrichment hazard exists, so no clarification is owed.',
  },
  {
    id: 'SEM-29',
    location: 'Steel service centre, slitting line', task: 'coil loading',
    observation:
      'An operator was loading a coil onto the slitter mandrel using the overhead crane and a C-hook. '
      + 'He guided the coil by hand at the end of the travel. The mandrel was stationary and the line '
      + 'was stopped. Banding on the coil had been cut and one strap end was standing proud. I could '
      + 'not tell whether the crane had been inspected within its required period, as no tag was '
      + 'visible from the floor.',
    present: ['mobile_equipment'],
    lifeCritical: ['mobile_equipment'],
    gaps: [{
      gapId: 'SEM-29-G1',
      missingFact:
        'whether the overhead crane and its C-hook are within their required periodic inspection '
        + 'interval',
      whyAbsent:
        'No inspection tag was visible from the floor position and the records are held elsewhere.',
      affectedDecision: 'REQUIRED_CONTROL',
      alternativeOutcomes:
        'Inspection status does not materially change the physical severity of the credible '
        + 'consequence -- failure while handling a multi-tonne suspended coil can already produce '
        + 'catastrophic injury. If the required inspection or verification is current, assessment '
        + 'can proceed from the observed handling conditions. If it is overdue or cannot be '
        + 'established, continued use of the lifting assembly may require suspension, verification, '
        + 'inspection or other corrective control before the lift proceeds.',
    }],
    rationale:
      'A records-based gap that changes whether the lifting equipment may appropriately remain in '
      + 'service, rather than the physical severity of a failure. Only mobile equipment remains a '
      + 'present family after the partition correction, so no cross-hazard interaction is '
      + 'established. The proud strap end is real scene detail and is not itself the gap.',
  },
  {
    id: 'SEM-30',
    location: 'Cold store, ammonia engine room', task: 'routine plant check',
    observation:
      'The refrigeration engineer was doing a routine check in the ammonia engine room. Compressor '
      + 'guards were fitted, the oil level sight glasses were clear, and the room ammonia detector '
      + 'panel showed no alarm. Two self-contained breathing sets hung by the door. I could not '
      + 'establish when the detector heads were last calibrated, and the panel showed only status '
      + 'rather than a calibration date.',
    present: ['chemical_exposure'],
    lifeCritical: ['chemical_exposure'],
    negatedOrSafe: ['machine_guarding', 'chemical_exposure'],
    forbidden: {
      machine_guarding:
        'Compressor guards are affirmatively described as fitted. The observation therefore '
        + 'establishes the relevant machine-guarding condition as controlled and provides no '
        + 'contrary guarding condition.',
    },
    gaps: [{
      gapId: 'SEM-30-G1',
      missingFact:
        'whether the ammonia detector heads are currently within their applicable calibration or '
        + 'functional-verification interval and are considered reliable for service',
      whyAbsent:
        'The panel displays alarm status only; calibration records are held separately and were not '
        + 'available at the panel.',
      affectedDecision: 'EXPOSURE',
      alternativeOutcomes:
        'A date alone is not sufficient unless it can be evaluated against the applicable '
        + 'calibration or verification interval. If the detection system is current and serviceable, '
        + 'the no-alarm indication is meaningful evidence supporting the recorded controlled '
        + 'atmospheric state. If the detector heads are overdue, have failed verification or are '
        + 'otherwise unreliable, the no-alarm indication cannot carry the same evidentiary weight '
        + 'and the atmospheric exposure assessment must account for the loss of that monitoring '
        + 'control.',
    }],
    rationale:
      'The gap attacks the credibility of an instrument reading rather than a physical condition. A '
      + 'green panel that nobody can vouch for is one of the more consequential silent gaps in plant '
      + 'safety, and it is a fact that exists in a file rather than in the room.',
  },

  {
    id: 'SEM-35',
    location: 'Fuel terminal, top-loading rack bay 2', task: 'tanker loading',
    observation:
      'A driver was on top of a tanker at the loading rack connecting the vapour recovery arm. The '
      + 'fold-down gangway was lowered onto the trailer walkway and its cage was around him. The '
      + 'tractor was still coupled with the engine idling. I saw no wheel chocks placed and could '
      + 'not tell whether the rack has a brake interlock that holds the vehicle while the gangway '
      + 'is down.',
    present: ['fall_protection', 'mobile_equipment'],
    lifeCritical: ['fall_protection'],
    gaps: [{
      gapId: 'SEM-35-G1',
      missingFact:
        'whether the loading rack has a vehicle brake interlock or drive-away prevention that is '
        + 'engaged while the gangway is lowered onto the trailer',
      whyAbsent:
        'An interlock is a rack control system feature; with no chocks visible and the engine '
        + 'idling, nothing observable establishes whether movement is prevented.',
      affectedDecision: 'REQUIRED_CONTROL',
      alternativeOutcomes:
        'With an engaged interlock, the gangway is a stable platform and the finding is the absence '
        + 'of chocks as a redundant measure. Without one, a coupled tractor with a running engine '
        + 'can pull away while a person stands on the trailer inside a cage attached to the rack -- '
        + 'which is a drive-away fatality mechanism and requires the loading sequence itself to '
        + 'change, not an extra chock.',
    }],
    rationale:
      'Authored to restore the interaction that SEM-09 cannot record. The relationship the '
      + 'observation establishes is a fall-protection system whose effectiveness depends on the '
      + 'vehicle remaining in position: the gangway and cage span from a fixed rack onto a trailer '
      + 'that can move under power, and no anchorage is described. The frozen interaction vocabulary '
      + 'has no member naming vehicle movement, platform-position dependency or drive-away effects '
      + 'on fall protection, so no interaction is recorded rather than forcing a kind that would '
      + 'distort the mechanism. Recorded as a vocabulary gap, not repaired.',
  },

  // ============================================================ NEITHER -- CONTROLS (SEM-31..34)
  {
    id: 'SEM-31',
    location: 'Warehouse, battery charging room', task: 'end-of-shift walkthrough',
    observation:
      'The battery charging room was checked at end of shift. Chargers were running with their leads '
      + 'seated, the room extract fan was running and its airflow indicator was in range, the '
      + 'eyewash and drench shower were tagged as tested this month, and spill neutraliser was '
      + 'stocked in the cabinet. No trucks were on charge out of their bays and no work was in '
      + 'progress in the room.',
    present: ['chemical_exposure'],
    negatedOrSafe: ['chemical_exposure', 'electrical'],
    forbidden: {
      electrical:
        'Chargers are affirmatively described as running normally with their leads seated.',
      mobile_equipment:
        'No trucks were on charge out of their bays, and the observation expressly states that no '
        + 'work was in progress in the room.',
    },
    rationale:
      'A CLARIFICATION_NOT_OWED control. Hydrogen evolution during charging is a real hazard and it '
      + 'is stated as controlled -- ventilation running and proven in range, emergency equipment '
      + 'tested. Everything a decision needs is present, so a question raised here is a false '
      + 'positive rather than diligence.',
  },
  {
    id: 'SEM-32',
    location: 'Machine shop, CNC cell 4', task: 'production observation',
    observation:
      'CNC cell 4 was running a production batch with the enclosure door closed and the interlock '
      + 'proven -- the operator demonstrated that opening the door halts the spindle. Coolant '
      + 'concentration had been checked and logged that morning at the specified ratio. Chip '
      + 'conveyor guarding was in place. The operator loaded and unloaded only at the door with the '
      + 'spindle stopped.',
    present: ['machine_guarding'],
    negatedOrSafe: ['machine_guarding', 'chemical_exposure'],
    forbidden: {
      chemical_exposure:
        'Coolant concentration was affirmatively described as checked and logged that morning at '
        + 'the specified ratio.',
      lockout_tagout:
        'Loading and unloading are affirmatively described as occurring only at the door with the '
        + 'spindle stopped under a proven interlock.',
    },
    rationale:
      'A second CLARIFICATION_NOT_OWED control, and an interaction-negative control: the interlock '
      + 'was demonstrated rather than assumed, which is the fact that makes the guarding claim '
      + 'verifiable rather than a presumption.',
  },
  {
    id: 'SEM-33',
    location: 'Laboratory block, fume hood bay', task: 'quarterly inspection',
    observation:
      'Quarterly inspection of the fume hood bay. All four hoods carried current face velocity '
      + 'certification stickers, sashes were at the marked working height, and nothing was stored '
      + 'inside the hood interiors obstructing the baffles. Chemical storage was segregated by '
      + 'compatibility in vented cabinets below. No work was in progress at the time of inspection.',
    present: [],
    negatedOrSafe: ['chemical_exposure'],
    forbidden: {
      chemical_exposure:
        'Hoods are affirmatively described as currently certified, with sashes at the marked working '
        + 'height and baffles unobstructed. Chemical storage is affirmatively described as '
        + 'segregated by compatibility in vented cabinets, and the observation expressly states that '
        + 'no work was in progress.',
    },
    rationale:
      'A clean area at a quiet moment with nothing present. Rows like this are how the evaluation '
      + 'measures restraint at all: everything a decision needs is stated and nothing is wrong.',
  },
  {
    id: 'SEM-34',
    location: 'Site offices, drawing store', task: 'general inspection',
    observation:
      'Toured the drawing store attached to the site offices. It is a carpeted room with flat files, '
      + 'a plan chest and shelving, no process equipment and no chemical storage of any kind. The '
      + 'shelving was bracket-fixed to the wall and fully loaded within its marked levels. A kick '
      + 'stool sat under the plan chest, stowed.',
    present: [],
    forbidden: {
      fall_protection:
        'The kick stool is affirmatively described as stowed under the plan chest.',
      machine_guarding:
        'The observation states the room contains no process equipment.',
      chemical_exposure:
        'The observation states the room contains no chemical storage of any kind.',
    },
    rationale:
      'A genuinely unremarkable space, recorded because inspections cover them. The exclusions are '
      + 'explicit statements by the observer rather than silence, which is what makes them usable as '
      + 'forbidden truth under the frozen rule.',
  },
];

export const SEMANTIC_ROWS: readonly SemanticRow[] = SEMANTIC_SPECS.map(build);

export const SEMANTIC_AUGMENTATION_IDENTIFIER =
  'FORMAL_EXPERT_SEMANTIC_AUGMENTATION_V1_CANDIDATE' as const;
