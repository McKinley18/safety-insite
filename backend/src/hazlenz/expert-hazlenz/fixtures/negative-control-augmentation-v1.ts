/**
 * FORMAL_EXPERT_NEGATIVE_CONTROL_AUGMENTATION_V1 -- sixteen newly authored formal source cases. §125.
 *
 * Authored under the construction policy frozen at
 * `9865e7d09f9b1fbb1d23ceea150e642315693216f35c5441ed36d05f51eabcbf` BEFORE a single case existed,
 * to close the frozen 48-opportunity negative-control requirement that stood at 43 (§124).
 *
 * ==================== THESE ARE COVERAGE CASES, NOT CHALLENGE CASES ====================
 *
 * Not one row is written to be difficult, to probe a weakness, or to produce any particular result.
 * No provider output informed any of them -- none exists. Several rows describe situations where
 * nothing much is wrong, which is deliberate: an evaluation whose every row contains a hazard cannot
 * measure whether a layer knows when to stay quiet.
 *
 * ==================== THE FORBIDDEN-FAMILY RULE ====================
 *
 * A family is FORBIDDEN only where the observation affirmatively rules it out. Absence is never a
 * reason. Every forbidden family here has a LURE in the text -- language that could plausibly pull a
 * reader toward it -- together with the fact that defeats it, and `forbiddenRationale` names that
 * fact. A family that is simply not mentioned is DEFENSIBLE, never forbidden.
 *
 * ==================== IMMUTABLE AFTER SEAL ====================
 *
 * Once sealed, no row's text, truth or classification may change in response to any later model
 * behaviour. A row that turns out to be badly authored is a finding about the corpus, to be recorded
 * and reported -- never repaired to improve a score.
 *
 * ==================== V2: CORRECTED BY INDEPENDENT SAFETY REVIEW, 2026-08-31 ====================
 *
 * The seal above bars changes driven by MODEL BEHAVIOUR. It does not bar -- it exists to enable --
 * correction by the independent safety review the seal was created to make possible. The product
 * owner reviewed all sixteen rows and returned three corrections, applied here verbatim:
 *
 *   AUG-08  fall_protection  FORBIDDEN -> DEFENSIBLE   (row keeps lockout_tagout forbidden)
 *   AUG-13  electrical       FORBIDDEN -> DEFENSIBLE   (row's only forbidden family; row now has none)
 *   AUG-14  fall_protection  FORBIDDEN -> DEFENSIBLE   (row's only forbidden family; row now has none)
 *
 * ROWS_WITH_FORBIDDEN_FAMILY_TRUTH: 14 -> 12. No row was rewritten, and no forbidden family was
 * substituted, restored or added anywhere, to recover the two lost opportunities.
 *
 * The `authoringRationale` on AUG-13 and AUG-14 still argues the defeat the reviewer overruled. That
 * text is DELIBERATELY LEFT AS AUTHORED: it records what the author believed at authoring time, and
 * `review/HUMAN-REVIEW-RECORD.md` is the authority that supersedes it. Editing authored reasoning
 * after the fact would erase the very disagreement the review exists to surface.
 *
 * No observation text, and no present / negated / life-critical / gap / interaction truth, changed.
 */

import {
  FORMAL_COHORT_ROW_CONTRACT_VERSION, type FormalCohortRow,
} from '../expert-cohort-contract';

const TAXONOMY = [
  'chemical_exposure', 'confined_space', 'electrical', 'fall_protection',
  'lockout_tagout', 'machine_guarding', 'mobile_equipment',
] as const;

export interface AugmentationRow {
  row: FormalCohortRow;
  /** One auditable reason per forbidden family, naming the DEFEATING FACT in the observation. */
  forbiddenRationale: Record<string, string>;
  /** Truth provenance, per field, under the frozen precedence rules. */
  provenance: Record<string, string>;
  /** Which governed regulatory family this row could legitimately be matched to, if any. */
  governedMatchFamily: string | null;
}

interface Spec {
  id: string;
  observation: string;
  location: string;
  task: string;
  present: string[];
  forbidden: Record<string, string>;
  negatedOrSafe?: string[];
  lifeCritical?: string[];
  gaps?: Array<{ gapId: string; description: string; affectedDecision: FormalCohortRow['truth']['decisionCriticalGaps'][number]['affectedDecision'] }>;
  interactions?: FormalCohortRow['truth']['recordedInteractions'];
  governedMatchFamily?: string | null;
  rationale: string;
}

function build(s: Spec): AugmentationRow {
  const forbidden = Object.keys(s.forbidden);
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
        governedStandards: [],   // supplied at cohort assembly from the governed release snapshot
        answeredClarifications: [],
        supplementaryContext: [],
      },
      truth: {
        presentHazardFamilies: [...s.present],
        defensibleHazardFamilies: defensible,
        forbiddenHazardFamilies: forbidden,
        negatedOrSafeStateFamilies: [...(s.negatedOrSafe ?? [])],
        lifeCriticalHazardFamilies: [...(s.lifeCritical ?? [])],
        decisionCriticalGaps: [...(s.gaps ?? [])],
        recordedInteractions: [...(s.interactions ?? [])],
        authoringRationale: s.rationale,
      },
    },
    forbiddenRationale: { ...s.forbidden },
    provenance: {
      presentHazardFamilies: 'LEVEL_2_AUTHORED_SOURCE_CASE_TRUTH',
      forbiddenHazardFamilies: 'LEVEL_2_AUTHORED_SOURCE_CASE_TRUTH (each with a defeating fact)',
      defensibleHazardFamilies: 'LEVEL_1_DERIVED_FROM_TAXONOMY_PARTITION',
      negatedOrSafeStateFamilies: 'LEVEL_2_AUTHORED_SOURCE_CASE_TRUTH',
      lifeCriticalHazardFamilies: 'LEVEL_3_AUTHORED_SAFETY_DOMAIN_JUDGEMENT',
      decisionCriticalGaps: 'LEVEL_3_AUTHORED_SAFETY_DOMAIN_JUDGEMENT',
      recordedInteractions: 'LEVEL_3_AUTHORED_SAFETY_DOMAIN_JUDGEMENT (closed vocabulary)',
      governedStandards: 'DEFERRED -- supplied at assembly from the governed release snapshot',
    },
    governedMatchFamily: s.governedMatchFamily ?? null,
  };
}

export const AUGMENTATION_SPECS: readonly Spec[] = [
  {
    id: 'AUG-01',
    location: 'Maintenance shop, Plant 1', task: 'routine walkthrough',
    observation:
      'Bench grinder in the maintenance shop was running with the tongue guard missing and the work '
      + 'rest sitting about half an inch off the wheel while a fitter dressed a bracket freehand. A '
      + 'forklift was parked and keyed off against the far wall, and the shop electrical panel was '
      + 'closed with its cover latched.',
    present: ['machine_guarding'],
    forbidden: {
      mobile_equipment: 'The forklift is parked and keyed off. No travel, lift or pedestrian '
        + 'interaction is described, so its presence is location detail rather than exposure.',
      electrical: 'The panel is closed with its cover latched. No exposed conductor, damaged cord or '
        + 'contact is described.',
    },
    lifeCritical: ['machine_guarding'],
    governedMatchFamily: 'machine_guarding',
    rationale:
      'An ordinary abrasive-wheel finding. The missing tongue guard and the oversized work-rest gap '
      + 'are both stated, and the operator is engaged with the wheel, so a reviewer has what a '
      + 'decision needs. The forklift and the panel are the kind of incidental detail real notes '
      + 'carry, and each is defeated in the same clause that introduces it.',
  },
  {
    id: 'AUG-02',
    location: 'Bagging line, Plant 2', task: 'observed maintenance activity',
    observation:
      'Conveyor drive at the bagging line was locked out for belt replacement. Two personal locks '
      + 'were on the disconnect, the crew zero-energy test was recorded on the permit, and the drive '
      + 'guard was off and lying beside the frame as expected for that work.',
    present: ['lockout_tagout'],
    forbidden: {
      machine_guarding: 'The guard is off as a planned part of an isolated maintenance task, with the '
        + 'drive locked out and zero energy verified. That is the correct condition for the work, not '
        + 'an operating exposure.',
      electrical: 'The disconnect is open with two personal locks and a recorded zero-energy test.',
    },
    negatedOrSafe: ['lockout_tagout', 'machine_guarding'],
    governedMatchFamily: 'lockout_tagout',
    rationale:
      'A correctly executed isolation. This row exists because a layer that flags the removed guard '
      + 'here has not understood the task -- the guard being off is what the permit is for. Nothing '
      + 'decision-critical is missing: the energy state is verified and recorded.',
  },
  {
    id: 'AUG-03',
    location: 'Pump house roof', task: 'roof repair observation',
    observation:
      'Roofer on the flat roof of the pump house was working about four feet from an unprotected '
      + 'edge with no guardrail, warning line or anchored lanyard. Roof height to grade is roughly '
      + 'eighteen feet. A weatherhead and service drop run up the far corner of the building, well '
      + 'outside the work area.',
    present: ['fall_protection'],
    forbidden: {
      electrical: 'The service drop is at the far corner of the building, outside the work area, '
        + 'with no approach, contact or conductive equipment described near it.',
    },
    lifeCritical: ['fall_protection'],
    governedMatchFamily: 'fall_protection',
    rationale:
      'A plain unprotected-edge exposure at a height where a fall is life-threatening. The distance '
      + 'from the edge, the absence of every listed protection and the height are all stated, so no '
      + 'clarification is owed. The service drop is a real feature of such a building and is defeated '
      + 'by its stated distance from the work.',
  },
  {
    id: 'AUG-04',
    location: 'Tank farm, degreaser tank 4', task: 'interior cleaning',
    observation:
      'Two workers were pressure-washing the inside of a 6,000-gallon degreaser tank through the top '
      + 'manway. The wash solution is a caustic degreaser, the crew had no supplied air or '
      + 'ventilation set up, and no attendant was posted at the opening. A tag on the adjacent '
      + 'transfer pump showed it had been isolated the previous shift.',
    present: ['chemical_exposure', 'confined_space'],
    // NO FORBIDDEN FAMILY. The adjacent isolated pump tempts a lockout_tagout call, but isolating
    // or blanking lines into a vessel before entry is a LEGITIMATE concern a competent reviewer
    // would raise. Marking it forbidden would score correct reasoning as a false positive, so it is
    // DEFENSIBLE instead. This row contributes to the cohort without contributing a negative control.
    forbidden: {},
    lifeCritical: ['confined_space', 'chemical_exposure'],
    gaps: [{
      gapId: 'AUG-04-G1',
      description: 'whether the tank atmosphere was tested before entry, and with what result',
      affectedDecision: 'REQUIRED_CONTROL',
    }],
    interactions: [{
      interactionKind: 'CONFINED_SPACE_ATMOSPHERIC',
      participants: ['confined_space', 'chemical_exposure'],
    }],
    governedMatchFamily: 'confined_space',
    rationale:
      'Caustic aerosol generated inside an enclosed vessel is a genuine interaction rather than two '
      + 'adjacent facts, which is why an interaction is recorded. One decision-critical fact really '
      + 'is missing -- whether the atmosphere was tested -- and it decides which controls the entry '
      + 'requires, so this row legitimately owes a clarification.',
  },
  {
    id: 'AUG-05',
    location: 'Finished-goods rack area', task: 'aisle observation',
    observation:
      'A stand-up reach truck was running the aisle in the finished-goods rack area with the horn '
      + 'inoperative and a load raised to roughly the third beam level while travelling. The rack '
      + 'uprights are ladder-braced but nobody was climbing them, and the shrink wrapper at the aisle '
      + 'end was powered down and tagged out of service.',
    present: ['mobile_equipment'],
    forbidden: {
      fall_protection: 'The ladder-braced uprights are structural rack members. Nobody was climbing '
        + 'and no elevated work or unprotected edge is described.',
      machine_guarding: 'The shrink wrapper is powered down and tagged out of service.',
    },
    negatedOrSafe: ['machine_guarding'],
    governedMatchFamily: 'mobile_equipment',
    rationale:
      'Travelling with an elevated load and no working horn is a stated, decision-complete finding. '
      + 'The ladder-braced uprights are the natural lure here -- they look climbable in a note -- and '
      + 'the row defeats them explicitly.',
  },
  {
    id: 'AUG-06',
    location: 'Die shop', task: 'walkthrough',
    observation:
      'A temporary 120V cord set feeding a work light in the die shop had the ground pin broken off '
      + 'and the outer jacket split near the plug. It was plugged in and energized at the time. The '
      + 'press it sat beside was down for the day with its main disconnect open and locked.',
    present: ['electrical'],
    forbidden: {
      lockout_tagout: 'The press disconnect is open and locked. The damaged cord set is a separate '
        + 'temporary circuit and is not part of any isolation boundary described here.',
      machine_guarding: 'The press is down for the day with its disconnect open and locked, so no '
        + 'point-of-operation exposure is described.',
    },
    negatedOrSafe: ['lockout_tagout', 'machine_guarding'],
    governedMatchFamily: 'electrical',
    rationale:
      'A damaged energized cord set beside a correctly isolated press. The press is the lure: a '
      + 'reader scanning for hazards in a die shop reaches for the press, and the row defeats it '
      + 'twice over. The cord defect itself is fully stated.',
  },
  {
    id: 'AUG-07',
    location: 'Finished-goods staging', task: 'shift-change walkthrough',
    observation:
      'Walked the finished-goods staging area at shift change. Aisles were clear and marked, the '
      + 'pallet jack was parked in its charging bay on charge, the eyewash station in the corner was '
      + 'flushed and tagged current for the month, and no work was in progress at the time.',
    present: [],
    forbidden: {
      mobile_equipment: 'The pallet jack is parked in its charging bay on charge, with no travel, '
        + 'lift or pedestrian interaction described.',
      chemical_exposure: 'The eyewash is a fixture, flushed and tagged current. No chemical handling, '
        + 'storage or release is described in the area.',
    },
    rationale:
      'A clean area at a quiet moment. Rows like this are why the evaluation can measure restraint at '
      + 'all: everything a decision needs is stated, nothing is wrong, and a candidate raised here is '
      + 'a false positive rather than diligence.',
  },
  {
    id: 'AUG-08',
    location: 'North lift station', task: 'permit-required entry',
    observation:
      'Entry into the north lift-station wet well was in progress under a permit. Continuous four-gas '
      + 'monitoring was running at the opening with readings logged every fifteen minutes, a tripod '
      + 'and retrieval winch were rigged, and an attendant was at the hole with the entrant in sight. '
      + 'The influent pump was locked out at the MCC.',
    present: ['confined_space'],
    forbidden: {
      lockout_tagout: 'The influent pump is locked out at the MCC. That is the control the entry '
        + 'requires, correctly in place, rather than a deficiency.',
      // PRODUCT-OWNER REVIEW, 2026-08-31: `fall_protection` was FORBIDDEN here and is CORRECTED to
      // DEFENSIBLE. A tripod and retrieval winch at an open wet-well hole is a fall/retrieval
      // subject a competent reviewer may legitimately raise; forbidding it would score correct
      // reasoning as a false positive. The row keeps `lockout_tagout` forbidden, so it REMAINS a
      // negative control. Not rewritten to recover anything.
    },
    negatedOrSafe: ['confined_space', 'lockout_tagout', 'fall_protection'],
    governedMatchFamily: 'confined_space',
    rationale:
      'A permit entry done properly, and the hardest kind of row for an eager layer: every element '
      + 'that would be a finding if missing is present. Monitoring, retrieval, attendant and '
      + 'isolation are all stated, so nothing is owed.',
  },
  {
    id: 'AUG-09',
    location: 'Transfer pump skid', task: 'follow-up on a reported defect',
    observation:
      'Operator reported the coupling guard on the transfer pump had been missing for part of last '
      + 'week. The work order shows it was refabricated and refitted on Thursday. This morning it was '
      + 'in place, bolted, and the pump was running normally. The area sump grate was open beside the '
      + 'pump, but it is a ten-inch drain opening rather than an entry point and it was barricaded.',
    present: ['machine_guarding'],
    forbidden: {
      confined_space: 'The sump grate is a ten-inch drain opening, not a space a person can enter, '
        + 'and it was barricaded.',
    },
    negatedOrSafe: ['machine_guarding'],
    governedMatchFamily: 'machine_guarding',
    rationale:
      'A defect that was real last week and is verifiably corrected now, confirmed by direct '
      + 'observation rather than by the work order alone. The open grate is the lure and is defeated '
      + 'by its stated size and the barricade.',
  },
  {
    id: 'AUG-10',
    location: 'Equipment bay 3', task: 'coating application',
    observation:
      'Painter was spraying a two-part epoxy inside the equipment bay with the roll-up door about a '
      + 'quarter open, working off a rolling scaffold with one guardrail section removed to reach the '
      + 'wall. He had a half-face respirator on. I could not tell from the label photo whether the '
      + 'product contains isocyanates, and no ventilation fan was set up.',
    present: ['chemical_exposure', 'fall_protection'],
    forbidden: {
      confined_space: 'The equipment bay is a normal work bay with a roll-up door standing partly '
        + 'open. It is not a permit space and no entry permit or restricted egress is described.',
    },
    gaps: [{
      gapId: 'AUG-10-G1',
      description: 'whether the two-part epoxy contains isocyanates, which decides whether a '
        + 'half-face cartridge respirator is adequate or supplied air is required',
      affectedDecision: 'REQUIRED_CONTROL',
    }],
    governedMatchFamily: 'chemical_exposure',
    rationale:
      'Two independent exposures in one scene, and one genuinely missing fact that a reviewer could '
      + 'not resolve on site. The isocyanate question is decision-critical because it changes the '
      + 'required respiratory protection outright, not merely its rating.',
  },
  {
    id: 'AUG-11',
    location: 'Press shop, 200-ton press', task: 'die change',
    observation:
      'Millwright was changing a die on the 200-ton press. The main disconnect was open and a lock '
      + 'was on it, but I could not tell whether the hydraulic accumulator had been bled -- no gauge '
      + 'was visible from where I stood and the crew had left for break. A die cart was staged at the '
      + 'press, chocked and unhitched.',
    present: ['lockout_tagout'],
    forbidden: {
      mobile_equipment: 'The die cart is chocked and unhitched with no travel or lift described.',
    },
    lifeCritical: ['lockout_tagout'],
    gaps: [{
      gapId: 'AUG-11-G1',
      description: 'whether the hydraulic accumulator was bled to zero stored energy after the '
        + 'disconnect was opened',
      affectedDecision: 'REQUIRED_CONTROL',
    }],
    governedMatchFamily: 'lockout_tagout',
    rationale:
      'Electrical isolation is stated and stored hydraulic energy is not, which is the classic '
      + 'incomplete isolation. The gap is real rather than manufactured: the observer says plainly '
      + 'why the fact could not be established.',
  },
  {
    id: 'AUG-12',
    location: 'Basement sump pit', task: 'dewatering',
    observation:
      'Crew was running a submersible pump to dewater a flooded sump pit in the basement, roughly '
      + 'eight feet deep and entered by a fixed ladder. Two workers went in without any atmospheric '
      + 'testing beforehand. The pump cord and a plugged-in extension were lying in the standing '
      + 'water on the pit floor, and the extension connection was not a sealed fitting.',
    present: ['electrical', 'confined_space'],
    forbidden: {
      machine_guarding: 'The only equipment in the pit is a submersible pump, which has no exposed '
        + 'drive, nip point or point of operation described.',
    },
    lifeCritical: ['confined_space', 'electrical'],
    interactions: [{
      interactionKind: 'ELECTRICAL_WET_ENVIRONMENT',
      participants: ['electrical', 'confined_space'],
    }],
    governedMatchFamily: 'electrical',
    rationale:
      'An unsealed energized connection lying in standing water inside an enclosed space is a real '
      + 'interaction: the water and the enclosure each make the electrical exposure worse than it '
      + 'would be alone. Both the missing atmospheric test and the unsealed connection are stated, so '
      + 'nothing is owed.',
  },
  {
    id: 'AUG-13',
    location: 'Paint mixing room', task: 'walkthrough',
    observation:
      'Checked the paint mixing room. Both flammable cabinets were closed and grounded, the bonding '
      + 'strap was connected to the drum in use, no spraying was in progress, and the exhaust fan was '
      + 'running with the differential gauge in range. A portable heater was stored in the corner, '
      + 'unplugged, with its cord wrapped.',
    present: ['chemical_exposure'],
    // PRODUCT-OWNER REVIEW, 2026-08-31: `electrical` was FORBIDDEN here and is CORRECTED to
    // DEFENSIBLE. Electrical ignition sources in a flammable-vapour room are a legitimate subject
    // even when the heater is stowed. It was this row's ONLY forbidden family, so the row now
    // carries NO forbidden truth and LEAVES the negative-control population. Deliberately NOT
    // replaced with another forbidden family: the corpus absorbs the cost of the review.
    forbidden: {},
    negatedOrSafe: ['chemical_exposure'],
    governedMatchFamily: 'chemical_exposure',
    rationale:
      'Flammable handling with its controls demonstrably in place, including the bonding detail that '
      + 'is usually the first thing missing. The stored heater is a plausible lure in a room like '
      + 'this and is defeated by being unplugged and stowed.',
  },
  {
    id: 'AUG-14',
    location: 'Shipping dock, door 6', task: 'trailer unloading',
    observation:
      'At the dock, a counterbalance forklift was backing pallets off a trailer while two order '
      + 'pickers walked the same lane. There is no marked pedestrian route through that stretch and '
      + 'the spotter position was vacant. The trailer wheels were chocked and the dock lock was '
      + 'engaged.',
    present: ['mobile_equipment'],
    // PRODUCT-OWNER REVIEW, 2026-08-31: `fall_protection` was FORBIDDEN here and is CORRECTED to
    // DEFENSIBLE. A dock face during trailer unloading is a legitimate fall subject regardless of
    // chocks and dock lock. It was this row's ONLY forbidden family, so the row now carries NO
    // forbidden truth and LEAVES the negative-control population. Deliberately NOT replaced.
    forbidden: {},
    lifeCritical: ['mobile_equipment'],
    governedMatchFamily: 'mobile_equipment',
    rationale:
      'Pedestrians in a reversing lane with no marked route and no spotter is an ordinary and serious '
      + 'dock finding. The chocks and dock lock are stated because a real note would state them, and '
      + 'they defeat the dock-edge reading.',
  },
  {
    id: 'AUG-15',
    location: 'Packaging line 2', task: 'jam clearance',
    observation:
      'During a jam clearance on the carton sealer, the operator reached past the opened interlock '
      + 'gate to pull a crushed carton while the machine was still under air. The lockout point is a '
      + 'valve on the frame and it was open. Nobody had isolated the air supply.',
    present: ['machine_guarding', 'lockout_tagout'],
    // NO FORBIDDEN FAMILY. The word "lockout" tempts an electrical call, but a carton sealer is
    // electrically powered and unisolated electrical energy is a genuine second source a competent
    // reviewer could raise. Forbidding it would score a correct observation as a false positive.
    forbidden: {},
    lifeCritical: ['machine_guarding'],
    interactions: [{
      interactionKind: 'LOTO_STORED_ENERGY',
      participants: ['machine_guarding', 'lockout_tagout'],
    }],
    governedMatchFamily: 'machine_guarding',
    rationale:
      'Reaching past a defeated interlock into a machine still under air is the interaction itself: '
      + 'the guarding exposure exists because the energy was never isolated. The word "lockout" is '
      + 'the lure toward electrical, and the row defeats it by naming the energy as air.',
  },
  {
    id: 'AUG-16',
    location: 'Records annex', task: 'general inspection',
    observation:
      'Toured the records annex. It is an office-grade space with sealed floors, no process equipment '
      + 'and no chemical storage. The only items noted were a step stool in the aisle, folded and '
      + 'stowed against the shelving, and a wall-mounted extinguisher tagged current.',
    present: [],
    forbidden: {
      fall_protection: 'The step stool is folded and stowed against the shelving. No climbing, '
        + 'elevated work or unprotected edge is described.',
      machine_guarding: 'The observation states the space contains no process equipment.',
      chemical_exposure: 'The observation states the space contains no chemical storage.',
    },
    rationale:
      'A genuinely unremarkable space, recorded because inspections cover them and an evaluation '
      + 'needs them. The two exclusions are explicit statements by the observer rather than mere '
      + 'silence, which is what makes them usable as forbidden truth under the frozen rule.',
  },
];

export const AUGMENTATION_ROWS: readonly AugmentationRow[] = AUGMENTATION_SPECS.map(build);

/**
 * V2 -- the corpus AS CORRECTED by the independent product-owner safety review of 2026-08-31.
 *
 * The identifier is bumped because the truth changed: this is a different corpus from the one
 * sealed as V1, and reporting corrected truth under V1's name would make V1's sealed hashes
 * (manifest `b2e96cc5...`, truth keys `51afb054...`) describe content they were never taken over.
 * V1 remains the pre-review state of record.
 */
export const AUGMENTATION_IDENTIFIER = 'FORMAL_EXPERT_NEGATIVE_CONTROL_AUGMENTATION_V2' as const;
