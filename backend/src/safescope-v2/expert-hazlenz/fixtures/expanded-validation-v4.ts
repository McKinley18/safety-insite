/**
 * EXPERT HAZLENZ -- §146 EXPANDED POST-REMEDIATION DEVELOPMENT VALIDATION FIXTURES. v4.
 *
 * ==================== WHAT THIS SET IS FOR ====================
 *
 * Twenty-four fresh development rows spanning multiple safety domains, built to answer NINE product
 * questions at once -- clarification recall and precision, candidate recall, candidate precision and
 * decomposition, cross-hazard insight precision, disagreement quality, governed-evidence behaviour,
 * citation containment, and additive union quality. **Linkage is a REGRESSION AXIS ONLY** and gets
 * three rows, not a campaign.
 *
 * ==================== WHAT THE PROGRAMME HAS LEARNED, ENCODED HERE ====================
 *
 * Four instrument defects preceded this set, and each leaves a rule in it:
 *
 *   §140  a scope error in a measurement is indistinguishable from a defect in the thing measured.
 *   §141  measure against the ANSWER KEY, never against collection co-occurrence.
 *   §142  never label by blanket default; every judgement needs a stated per-row reason.
 *   §145  a fixture may not author truth that depends on the model's own decomposition. Ambiguity
 *         and fragmentation are properties of the emitted candidate set, so this file records
 *         `DECOMPOSITION_UNRESOLVABLE` wherever it cannot honestly adjudicate, and the linkage
 *         rows carry a SCENARIO INTENT rather than a presumed FORBIDDEN truth.
 *
 * Two consequences are load-bearing:
 *
 *   - **Every TRUE-GAP row states BOTH answers and BOTH current outcomes.** §140's DP-B4 was an
 *     authored "gap" whose two answers led to the same action, and the model correctly refused it.
 *     A gap that cannot survive its own counterfactual is a fixture defect, and the pre-spend gate
 *     rejects any TRUE-GAP row missing either branch.
 *   - **`ADDITIVE_CANDIDATE_OPPORTUNITIES` are COMPUTED, not authored.** Which truth-present family
 *     the deterministic layer misses is measured by running the real engine at $0.00 in the
 *     pre-spend gate, so the denominator is a measurement rather than a guess.
 *
 * ==================== PROVENANCE ====================
 *
 * Authored 2026-09-03 for this validation. No reserved material opened. No spent formal-cohort row
 * read, copied, paraphrased or mimicked. LP-B2's surface facts (a below-grade vault, permit-space
 * classification) are NOT reused; EV-A3 tests the same APPLICABILITY property on unrelated facts.
 */

import {
  FORMAL_COHORT_ROW_CONTRACT_VERSION, type FormalCohortRow,
} from '../expert-cohort-contract';
import type { GovernedStandardView } from '../expert-contract.types';

export const EXPANDED_VALIDATION_FIXTURE_SET_VERSION =
  'hazlenz.expert.dev-validation.fixtures.v4' as const;

// ---------------------------------------------------------------- truth vocabularies

/** Why a NO-GAP row is tempting. Each is a shape the v7+ counterfactual rule must refuse. */
export type TemptingShape =
  | 'USEFUL_DOCUMENTATION_DETAIL'
  | 'SEVERITY_REFINEMENT_ONLY'
  | 'GENERIC_PPE_FOLLOWUP'
  | 'ROUTINE_DUE_DILIGENCE'
  | 'HISTORICAL_INFORMATION'
  | 'ALREADY_ESTABLISHED_FACT';

export type CandidateExpectation =
  | 'REQUIRED_ADDITIVE'
  | 'ALLOWED_PLAUSIBLE'
  | 'NO_ADDITIVE_CANDIDATE_EXPECTED';

export type InsightExpectation = 'INTERACTION_PLAUSIBLE' | 'NO_INSIGHT_WARRANTED';

export type GovernedRole = 'RELEVANT' | 'UNRELATED' | 'NONE' | 'NARROWER';

export type LinkageScenarioIntent =
  | 'REQUIRED_LINKAGE_CHALLENGE'
  | 'AMBIGUOUS_CANDIDATE_CHALLENGE'
  | 'GENERIC_FOLLOWUP_CHALLENGE'
  | 'NO_LINKAGE_CLAIM';

/** A TRUE-GAP answer key. BOTH branches are mandatory; the gate refuses a row missing either. */
export interface CounterfactualGap {
  missingFact: string;
  answerA: string; outcomeA: string;
  answerB: string; outcomeB: string;
  affectedDecision: string;
  whyCurrentEvidenceIsInsufficient: string;
}

export interface ValidationFixture {
  row: FormalCohortRow;
  /** Safety domain label, used only to prove the set is not over-sampled on one family. */
  domain: string;
  clarification:
    | { kind: 'TRUE_GAP'; gap: CounterfactualGap }
    | { kind: 'NO_GAP'; temptingShape: TemptingShape; whyNotDecisionCritical: string };
  candidate: {
    expectation: CandidateExpectation;
    /** Families a reviewer would expect Expert to ADD if the engine misses them. */
    expectedAdditiveFamilies: string[];
    /**
     * Decomposition truth, or the honest refusal. §145: a fixture may not author how many
     * candidates one physical defect should become.
     */
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' | string;
  };
  insight: { expectation: InsightExpectation; mechanism?: string };
  disagreement: { opportunity: boolean; basis?: string };
  /** A row may exercise more than one governed role: EV-D4 supplies a narrower AND an unrelated record. */
  governed?: GovernedRole[];
  citationAdversarial?: boolean;
  linkage: { intent: LinkageScenarioIntent; presumedFamilies?: string[]; note: string };
}

// ---------------------------------------------------------------- governed records

const R_MACHINE_GUARDING: GovernedStandardView = {
  citation: '29 CFR 1910.212(a)(1)',
  title: 'General requirements for all machines',
  approvedText:
    'One or more methods of machine guarding shall be provided to protect the operator and other '
    + 'employees in the machine area from hazards such as those created by point of operation, '
    + 'ingoing nip points, rotating parts, flying chips and sparks. See 29 CFR 1910.212(a)(1).',
  backingState: 'APPROVED',
};
const R_FIXED_LADDER_CAGE: GovernedStandardView = {
  citation: '29 CFR 1910.28(b)(9)(i)',
  title: 'Fixed ladders — fall protection above 24 feet',
  approvedText:
    'Each employee on a fixed ladder above 24 feet shall be protected by a personal fall arrest '
    + 'system, ladder safety system, cage or well, as provided at 29 CFR 1910.28(b)(9)(i).',
  backingState: 'APPROVED',
};
const R_RESPIRATOR_PROGRAM: GovernedStandardView = {
  citation: '29 CFR 1910.134(c)(1)',
  title: 'Respiratory protection program',
  approvedText:
    'In any workplace where respirators are necessary, the employer shall establish a written '
    + 'respiratory protection program with worksite-specific procedures, per 29 CFR 1910.134(c)(1).',
  backingState: 'APPROVED',
};
const R_WELDING_VENTILATION: GovernedStandardView = {
  citation: '29 CFR 1910.252(c)(2)',
  title: 'Welding, cutting and brazing — ventilation for general welding',
  approvedText:
    'Mechanical ventilation shall be provided when welding or cutting is done on metals not covered '
    + 'by the specific exceptions, at the rates given in 29 CFR 1910.252(c)(2).',
  backingState: 'APPROVED',
};
const R_DRAFT_ELECTRICAL: GovernedStandardView = {
  citation: '29 CFR 1910.333(a)(1)',
  title: 'Selection and use of work practices — 29 CFR 1910.333(a)(1)',
  approvedText:
    'Safety-related work practices shall be employed to prevent electric shock. Held at DRAFT '
    + 'backing state; reproduces 29 CFR 1910.333(a)(1) for review only.',
  backingState: 'DRAFT',
};
const R_PORTABLE_LADDER_ONLY: GovernedStandardView = {
  citation: '29 CFR 1910.23(c)(1)',
  title: 'Portable ladders — side rail extension above the landing surface',
  approvedText:
    'The side rails of a portable ladder used to gain access to an upper landing surface shall '
    + 'extend at least 3 feet above it. 29 CFR 1910.23(c)(1) addresses portable ladders only and '
    + 'states no requirement for fixed ladders.',
  backingState: 'APPROVED',
};

const row = (
  rowId: string, observation: string, allowed: string[],
  truth: FormalCohortRow['truth'], over: Partial<FormalCohortRow['source']> = {},
): FormalCohortRow => ({
  contractVersion: FORMAL_COHORT_ROW_CONTRACT_VERSION,
  source: {
    rowId, observation,
    inspectionContext: { location: null, task: null },
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: allowed,
    governedStandards: [], answeredClarifications: [], supplementaryContext: [],
    ...over,
  },
  truth,
});

const g = (
  missingFact: string, answerA: string, outcomeA: string, answerB: string, outcomeB: string,
  affectedDecision: string, why: string,
): CounterfactualGap =>
  ({ missingFact, answerA, outcomeA, answerB, outcomeB, affectedDecision,
    whyCurrentEvidenceIsInsufficient: why });

const NO_INSIGHT = { expectation: 'NO_INSIGHT_WARRANTED' as const };
const NO_DISAGREEMENT = { opportunity: false };
const NO_LINK = { intent: 'NO_LINKAGE_CLAIM' as const,
  note: 'this row makes no linkage claim and is excluded from every linkage denominator' };

// ================================================================ A. TRUE-GAP POSITIVES (8)

export const EXPANDED_VALIDATION_FIXTURES: readonly ValidationFixture[] = [

// ---- EV-A1 — HAZARD_EXISTENCE
{
  row: row('EV-A1',
    'A drum on the mixing platform is venting a visible vapour from a partly open bung, and two '
    + 'operators work at the platform continuously. The drum carries a workplace label that has been '
    + 'painted over and is unreadable; nobody on shift could say what it holds and no transfer record '
    + 'was available.',
    ['chemical_inhalation_contact', 'hazcom', 'fire_explosion', 'fall_protection'],
    { presentHazardFamilies: ['hazcom'],
      defensibleHazardFamilies: ['chemical_inhalation_contact', 'fire_explosion'],
      forbiddenHazardFamilies: ['fall_protection'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [{ gapId: 'EV-A1-G1',
        description: 'what the venting drum actually contains', affectedDecision: 'HAZARD_EXISTENCE' }],
      recordedInteractions: [],
      authoringRationale:
        'The labelling failure is stated and present. Whether an inhalation or fire hazard EXISTS '
        + 'turns entirely on the unknown contents, so those families are defensible rather than '
        + 'present — the authored key must not assert what the text does not establish.' }),
  domain: 'chemical',
  clarification: { kind: 'TRUE_GAP', gap: g(
    'the identity of the substance venting from the drum',
    'an inert aqueous cleaner', 'the venting is a housekeeping issue; relabel the drum and continue',
    'a volatile flammable or toxic solvent',
    'evacuate the platform, isolate ignition sources and ventilate before any further work',
    'HAZARD_EXISTENCE',
    'nothing in the observation identifies the contents, and the label is destroyed') },
  candidate: { expectation: 'REQUIRED_ADDITIVE', expectedAdditiveFamilies: ['hazcom'],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: NO_INSIGHT, disagreement: NO_DISAGREEMENT,
  linkage: { intent: 'REQUIRED_LINKAGE_CHALLENGE',
    note: 'an existence question about an unknown substance should attach to whichever exposure '
      + 'candidate the model raises, if it raises one' },
},

// ---- EV-A2 — HAZARD_SEVERITY
{
  row: row('EV-A2',
    'A worker was cutting fibre-cement board with a dry circular saw inside a partly enclosed '
    + 'ground-floor unit. The saw has a dust port but no extraction was connected. He wore a '
    + 'fit-tested half-face P100. The site hygienist recorded a personal sample on this exact task '
    + 'three weeks ago and the result is filed at the head office, unavailable on site.',
    ['silica_respirable_dust', 'respiratory_protection', 'noise_exposure', 'excavation_trenching'],
    { presentHazardFamilies: ['silica_respirable_dust'],
      defensibleHazardFamilies: ['respiratory_protection', 'noise_exposure'],
      forbiddenHazardFamilies: ['excavation_trenching'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [{ gapId: 'EV-A2-G1',
        description: 'the recorded personal exposure result for this task',
        affectedDecision: 'HAZARD_SEVERITY' }],
      recordedInteractions: [],
      authoringRationale:
        'Dry cutting of silica-bearing board with the extraction disconnected is a stated present '
        + 'exposure. The measurement EXISTS and is merely unavailable, which makes the gap concrete '
        + 'rather than open-ended.' }),
  domain: 'respirable dust',
  clarification: { kind: 'TRUE_GAP', gap: g(
    'the filed personal sampling result for this task',
    'the recorded result is below the action level',
    'the fitted P100 remains adequate; connect extraction as an improvement and file the result',
    'the recorded result is at or above the permissible limit',
    'stop the dry cutting now, fit extraction or wet-cut, and start an exposure-control review',
    'HAZARD_SEVERITY',
    'the magnitude is recorded but not present at the workplace, so the current control decision '
      + 'cannot be made from the observation alone') },
  candidate: { expectation: 'ALLOWED_PLAUSIBLE', expectedAdditiveFamilies: [],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: NO_INSIGHT, disagreement: NO_DISAGREEMENT, linkage: NO_LINK,
},

// ---- EV-A3 — APPLICABILITY (same property as LP-B2, deliberately different facts)
{
  row: row('EV-A3',
    'A contractor is spraying a two-part polyurethane coating inside a partly erected steel frame '
    + 'that has temporary sheeting on three sides and an open fourth elevation. Two of the '
    + 'contractor crew are inside the sheeted volume with air-fed hoods; a site electrician without '
    + 'respiratory protection is working on a distribution board eight metres away inside the same '
    + 'sheeted volume.',
    ['chemical_inhalation_contact', 'respiratory_protection', 'electrical', 'suspended_loads'],
    { presentHazardFamilies: ['chemical_inhalation_contact'],
      defensibleHazardFamilies: ['respiratory_protection', 'electrical'],
      forbiddenHazardFamilies: ['suspended_loads'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [{ gapId: 'EV-A3-G1',
        description: 'whether the sheeted volume is designated a controlled spraying area under the '
          + 'site permit, which decides whether the electrician may be in it at all',
        affectedDecision: 'APPLICABILITY' }],
      recordedInteractions: [],
      authoringRationale:
        'An unprotected worker inside the same enclosed volume as two-part polyurethane spraying is '
        + 'a stated present exposure. What is open is SCOPE — whether the exclusion regime applies '
        + 'to that volume. Tests the same contract property as the §142 LP-B2 miss on entirely '
        + 'different facts; no vault, no confined space, no permit-space language.' }),
  domain: 'coatings / cross-trade',
  clarification: { kind: 'TRUE_GAP', gap: g(
    'whether the sheeted volume is a designated controlled spraying area under the site permit',
    'it is designated, with an exclusion zone in force',
    'the electrician is inside an exclusion zone in breach; remove him now and enforce the boundary',
    'it is not designated and no exclusion regime applies',
    'the finding is that a controlled area was never established; establish one before spraying '
      + 'continues',
    'APPLICABILITY',
    'the observation describes the physical arrangement but never states which control regime '
      + 'governs the volume') },
  candidate: { expectation: 'REQUIRED_ADDITIVE',
    expectedAdditiveFamilies: ['chemical_inhalation_contact'],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: { expectation: 'INTERACTION_PLAUSIBLE',
    mechanism: 'an unprotected worker sharing an enclosed volume with isocyanate spraying — the '
      + 'enclosure is what converts one trade\'s control into another trade\'s exposure' },
  disagreement: NO_DISAGREEMENT,
  linkage: { intent: 'REQUIRED_LINKAGE_CHALLENGE',
    note: 'the scope question bears on the chemical exposure candidate specifically' },
},

// ---- EV-A4 — REQUIRED_CONTROL
{
  row: row('EV-A4',
    'A maintenance fitter had the guard off the number 2 conveyor drive and was seating a new belt '
    + 'by hand. The local isolator was in the OFF position with no lock or tag on it, and the '
    + 'conveyor is fed by an automatic upstream sequence that restarts on a level signal.',
    ['lockout_tagout', 'machine_guarding', 'electrical', 'noise_exposure'],
    { presentHazardFamilies: ['machine_guarding', 'lockout_tagout'],
      defensibleHazardFamilies: ['electrical'], forbiddenHazardFamilies: ['noise_exposure'],
      negatedOrSafeStateFamilies: [], lifeCriticalHazardFamilies: ['lockout_tagout'],
      decisionCriticalGaps: [{ gapId: 'EV-A4-G1',
        description: 'whether the automatic upstream sequence has been inhibited as well as the '
          + 'local isolator turned off',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'Hands inside an unguarded drive with an un-locked isolator and an automatic restart source '
        + 'is a stated present hazard. What is open is which CONTROL was applied, which v7+ decides '
        + 'is REQUIRED_CONTROL rather than HAZARD_EXISTENCE.' }),
  domain: 'machinery / energy control',
  clarification: { kind: 'TRUE_GAP', gap: g(
    'whether the automatic upstream start sequence is inhibited and locked, not merely the local '
      + 'isolator switched off',
    'the sequence is inhibited and the isolation locked',
    'the residual finding is the missing lock/tag discipline; correct the procedure',
    'only the local isolator is off and the sequence can still call a start',
    'stop the work immediately — an unexpected start can occur with hands in the drive',
    'REQUIRED_CONTROL',
    'an OFF isolator with no lock says nothing about whether an automatic start source is inhibited') },
  candidate: { expectation: 'REQUIRED_ADDITIVE', expectedAdditiveFamilies: ['lockout_tagout'],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: { expectation: 'INTERACTION_PLAUSIBLE',
    mechanism: 'the removed guard and the un-inhibited automatic restart share a mechanism — either '
      + 'alone is survivable, together they place hands in a drive that can start itself' },
  disagreement: NO_DISAGREEMENT,
  linkage: { intent: 'REQUIRED_LINKAGE_CHALLENGE',
    note: 'the control question determines whether the LOTO candidate stays ACTIVE; a guarding '
      + 'candidate is available as a competing referent' },
},

// ---- EV-A5 — EXPOSURE
{
  row: row('EV-A5',
    'A section of raised grating has been lifted out of the pipe-rack walkway to run new cable and '
    + 'the opening is roughly one metre square, eleven metres above grade. A single length of barrier '
    + 'tape is strung across one approach and nothing on the other three. The observation does not '
    + 'establish whether the walkway remains in use while the grating is out.',
    ['fall_protection', 'walking_working_surfaces', 'material_handling_storage', 'electrical'],
    { presentHazardFamilies: ['fall_protection'],
      defensibleHazardFamilies: ['walking_working_surfaces', 'electrical'],
      forbiddenHazardFamilies: ['material_handling_storage'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['fall_protection'],
      decisionCriticalGaps: [{ gapId: 'EV-A5-G1',
        description: 'whether the pipe-rack walkway remains in use while the grating panel is out',
        affectedDecision: 'EXPOSURE' }],
      recordedInteractions: [],
      authoringRationale:
        'An unprotected eleven-metre opening with tape on one of four approaches is a stated present '
        + 'fall hazard. Who is exposed is genuinely open and the two answers give different actions '
        + 'today.' }),
  domain: 'work at height',
  clarification: { kind: 'TRUE_GAP', gap: g(
    'whether anyone still transits the pipe-rack walkway while the panel is out',
    'the walkway is closed and locked off at both ends for the duration',
    'the finding is the inadequate barrier standard; complete the cable work as planned',
    'the walkway is still in use as a through route',
    'stop transit now and install hard barriers or a temporary cover before any further passage',
    'EXPOSURE',
    'the text describes the opening and the tape but never says whether the route is live') },
  candidate: { expectation: 'ALLOWED_PLAUSIBLE', expectedAdditiveFamilies: [],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: NO_INSIGHT, disagreement: NO_DISAGREEMENT, linkage: NO_LINK,
},

// ---- EV-A6 — REGULATORY_INTERPRETATION (needs a SUPPLIED record with a condition)
{
  row: row('EV-A6',
    'A fixed steel ladder on the clarifier runs from grade to the top walkway. The tape measure read '
    + 'twenty-three feet six inches from the lowest rung to the landing, and there is no cage, well '
    + 'or ladder safety system. Two operators climb it each shift. A single approved governed record '
    + 'covering fixed ladders was supplied with this inspection.',
    ['fall_protection', 'walking_working_surfaces', 'machine_guarding'],
    { presentHazardFamilies: ['fall_protection'],
      defensibleHazardFamilies: ['walking_working_surfaces'],
      forbiddenHazardFamilies: ['machine_guarding'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['fall_protection'],
      decisionCriticalGaps: [{ gapId: 'EV-A6-G1',
        description: 'how the supplied record\'s stated height condition applies when the measured '
          + 'height falls just below it',
        affectedDecision: 'REGULATORY_INTERPRETATION' }],
      recordedInteractions: [],
      authoringRationale:
        'The one row where REGULATORY_INTERPRETATION is natural rather than forced: a record IS '
        + 'supplied, it carries an explicit numeric condition, and the measured value sits just '
        + 'under it. v9 bounds this label to SUPPLIED records, which this row satisfies.' }),
  domain: 'fixed access / governed interpretation',
  clarification: { kind: 'TRUE_GAP', gap: g(
    'how the supplied record\'s height condition is applied to a ladder measured just below it — '
      + 'and from which datum the height is taken',
    'the height is measured as recorded and falls below the record\'s stated condition',
    'the record does not impose its requirement here; the finding is a recommendation, not a citation',
    'the datum used places the climb above the record\'s stated condition',
    'the record\'s requirement applies and a ladder safety system is owed now',
    'REGULATORY_INTERPRETATION',
    'the record states a condition and the observation states a measurement; how the condition '
      + 'applies at the boundary is not settled by either') },
  candidate: { expectation: 'NO_ADDITIVE_CANDIDATE_EXPECTED', expectedAdditiveFamilies: [],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: NO_INSIGHT, disagreement: NO_DISAGREEMENT, governed: ['RELEVANT'], linkage: NO_LINK,
}, // governedStandards attached below

// ---- EV-A7 — EXPOSURE, mobile plant
{
  row: row('EV-A7',
    'A 20-tonne excavator is slewing to load a lorry across the site haul road. The banksman left to '
    + 'take a delivery and has not returned; the operator continues to slew. The haul road carries '
    + 'both plant and site pedestrians and there is no physical segregation along that stretch.',
    ['mobile_equipment', 'traffic_control', 'suspended_loads', 'noise_exposure'],
    { presentHazardFamilies: ['mobile_equipment', 'traffic_control'],
      defensibleHazardFamilies: ['suspended_loads'], forbiddenHazardFamilies: ['noise_exposure'],
      negatedOrSafeStateFamilies: [], lifeCriticalHazardFamilies: ['mobile_equipment'],
      decisionCriticalGaps: [{ gapId: 'EV-A7-G1',
        description: 'whether pedestrians are currently routed along the haul road stretch inside '
          + 'the slew radius',
        affectedDecision: 'EXPOSURE' }],
      recordedInteractions: [],
      authoringRationale:
        'Slewing without a banksman across a shared haul road is stated and present. Whether anyone '
        + 'is in the slew path right now is the open fact, and the answers diverge.' }),
  domain: 'mobile plant / traffic',
  clarification: { kind: 'TRUE_GAP', gap: g(
    'whether pedestrians are currently using the haul road stretch within the slew radius',
    'the stretch is closed to pedestrians for the lift',
    'the finding is the absent banksman; reinstate before the next lift',
    'pedestrians are still routed along it',
    'stop slewing now and hold the load until segregation or a banksman is restored',
    'EXPOSURE',
    'the observation states the road is shared but not whether it is in pedestrian use at this '
      + 'moment') },
  candidate: { expectation: 'REQUIRED_ADDITIVE', expectedAdditiveFamilies: ['traffic_control'],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: { expectation: 'INTERACTION_PLAUSIBLE',
    mechanism: 'the missing banksman and the unsegregated shared road compound: either alone leaves '
      + 'a control, together there is neither a physical nor a human barrier' },
  disagreement: NO_DISAGREEMENT, linkage: NO_LINK,
},

// ---- EV-A8 — REQUIRED_CONTROL, hot work
{
  row: row('EV-A8',
    'A welder is cutting a redundant bracket from a steel column inside the finished-goods store. '
    + 'Sparks are falling onto stacked cardboard outer cases two metres below. A powder extinguisher '
    + 'stands beside the work. The permit copy at the job is signed but the fire-watch and '
    + 'post-work-inspection sections are blank.',
    ['hot_work', 'fire_explosion', 'material_handling_storage', 'welding_fumes'],
    { presentHazardFamilies: ['hot_work', 'fire_explosion'],
      defensibleHazardFamilies: ['welding_fumes', 'material_handling_storage'],
      forbiddenHazardFamilies: [], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['fire_explosion'],
      decisionCriticalGaps: [{ gapId: 'EV-A8-G1',
        description: 'whether a fire watch is actually posted, the blank permit section '
          + 'notwithstanding',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'Sparks onto combustible stock is stated and present. A blank permit section is not the same '
        + 'fact as an absent watch, so the control question is genuinely open.' }),
  domain: 'hot work',
  clarification: { kind: 'TRUE_GAP', gap: g(
    'whether a fire watch is posted at the work despite the blank permit section',
    'a competent fire watch is present and briefed',
    'the finding is the permit-completion failure; correct the paperwork discipline',
    'no fire watch is posted',
    'stop the cutting now — sparks are falling on combustibles with no one watching them',
    'REQUIRED_CONTROL',
    'the permit is blank in that section, which records nothing either way about the actual watch') },
  candidate: { expectation: 'REQUIRED_ADDITIVE', expectedAdditiveFamilies: ['fire_explosion'],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: { expectation: 'INTERACTION_PLAUSIBLE',
    mechanism: 'ignition source directly above combustible storage — the vertical proximity is the '
      + 'mechanism, not mere co-location' },
  disagreement: NO_DISAGREEMENT, linkage: NO_LINK,
},

// ================================================================ B. NO-GAP NEGATIVES (6)

// ---- EV-B1 — USEFUL_DOCUMENTATION_DETAIL
{
  row: row('EV-B1',
    'The pedestrian gate interlock on the palletiser cell was tested in my presence: opening the gate '
    + 'stopped the robot within one second and the cell would not restart until the gate was closed '
    + 'and the reset pressed. The interlock label shows a test date of last month. No one was inside '
    + 'the cell at any point.',
    ['machine_guarding', 'lockout_tagout', 'electrical'],
    { presentHazardFamilies: [], defensibleHazardFamilies: ['machine_guarding'],
      forbiddenHazardFamilies: ['lockout_tagout', 'electrical'],
      negatedOrSafeStateFamilies: ['machine_guarding'], lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [], recordedInteractions: [],
      authoringRationale:
        'A verified-safe interlock, demonstrated under observation. Whether the test certificate is '
        + 'filed centrally is useful documentation and changes nothing about today.' }),
  domain: 'machinery / verified safe',
  clarification: { kind: 'NO_GAP', temptingShape: 'USEFUL_DOCUMENTATION_DETAIL',
    whyNotDecisionCritical:
      'asking where the interlock test certificate is filed is good records practice and cannot '
      + 'change any current action — the interlock was demonstrated working' },
  candidate: { expectation: 'NO_ADDITIVE_CANDIDATE_EXPECTED', expectedAdditiveFamilies: [],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: NO_INSIGHT, disagreement: NO_DISAGREEMENT, linkage: NO_LINK,
},

// ---- EV-B2 — SEVERITY_REFINEMENT_ONLY
{
  row: row('EV-B2',
    'The guard is missing from the outboard end of the screw conveyor and the flight is exposed for '
    + 'about 300 millimetres at waist height. The conveyor runs continuously during production and '
    + 'two operators pass within arm\'s reach of the opening on every cycle. There is no barrier, '
    + 'rope or warning marking of any kind.',
    ['machine_guarding', 'material_handling_storage', 'electrical'],
    { presentHazardFamilies: ['machine_guarding'],
      defensibleHazardFamilies: ['material_handling_storage'],
      forbiddenHazardFamilies: ['electrical'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['machine_guarding'],
      decisionCriticalGaps: [], recordedInteractions: [],
      authoringRationale:
        'Exposure, access, continuity and the absence of every alternative control are all stated. '
        + 'The action is the same at any flight speed.' }),
  domain: 'machinery',
  clarification: { kind: 'NO_GAP', temptingShape: 'SEVERITY_REFINEMENT_ONLY',
    whyNotDecisionCritical:
      'asking the flight speed or torque refines how bad an entanglement would be and changes '
      + 'nothing: an exposed screw flight at waist height with operators in reach is guarded or the '
      + 'machine stops, at any speed' },
  candidate: { expectation: 'NO_ADDITIVE_CANDIDATE_EXPECTED', expectedAdditiveFamilies: [],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: NO_INSIGHT, disagreement: NO_DISAGREEMENT,
  linkage: { intent: 'GENERIC_FOLLOWUP_CHALLENGE',
    note: 'if a generic question is emitted here it should carry no link — but this is an intent, '
      + 'not authored FORBIDDEN truth, and realization is judged against the emitted candidate set' },
},

// ---- EV-B3 — GENERIC_PPE_FOLLOWUP
{
  row: row('EV-B3',
    'Walkthrough of the fabrication bay. A fitter was grinding a weld at the bench behind a screen '
    + 'wearing a face shield and gauntlets, a labourer was banding pallets in the aisle, and the '
    + 'overhead crane was parked and isolated with its pendant stowed. The bay PPE board is mounted '
    + 'at the entrance and is current.',
    ['machine_guarding', 'personal_protective_equipment', 'suspended_loads',
      'material_handling_storage'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['machine_guarding', 'personal_protective_equipment',
        'material_handling_storage'],
      forbiddenHazardFamilies: ['suspended_loads'],
      negatedOrSafeStateFamilies: ['suspended_loads'], lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [], recordedInteractions: [],
      authoringRationale:
        'Three ordinary tasks, each with its stated control, and the crane affirmatively isolated. '
        + 'Nothing is owed.' }),
  domain: 'fabrication / routine',
  clarification: { kind: 'NO_GAP', temptingShape: 'GENERIC_PPE_FOLLOWUP',
    whyNotDecisionCritical:
      '"what PPE is required in this bay" is row-level, could be asked of almost any workshop, and '
      + 'changes no specific current decision — the deliberate generic counterpart to the '
      + 'candidate-specific PPE questions elsewhere in this set' },
  candidate: { expectation: 'NO_ADDITIVE_CANDIDATE_EXPECTED', expectedAdditiveFamilies: [],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: NO_INSIGHT, disagreement: NO_DISAGREEMENT,
  linkage: { intent: 'GENERIC_FOLLOWUP_CHALLENGE',
    note: 'the generic-PPE no-link control; realization requires >=2 accepted candidates' },
},

// ---- EV-B4 — ROUTINE_DUE_DILIGENCE
{
  row: row('EV-B4',
    'The emergency stop pull-cord along the picking conveyor was pulled at three points during the '
    + 'walkthrough and stopped the belt each time within two seconds, with the fault indicated at the '
    + 'panel. The cord tension was correct and the run was unobstructed for its full length.',
    ['machine_guarding', 'emergency_equipment', 'walking_working_surfaces'],
    { presentHazardFamilies: [], defensibleHazardFamilies: ['emergency_equipment'],
      forbiddenHazardFamilies: ['machine_guarding', 'walking_working_surfaces'],
      negatedOrSafeStateFamilies: ['emergency_equipment'], lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [], recordedInteractions: [],
      authoringRationale: 'Tested three times under observation and working. Nothing is open.' }),
  domain: 'emergency systems / verified safe',
  clarification: { kind: 'NO_GAP', temptingShape: 'ROUTINE_DUE_DILIGENCE',
    whyNotDecisionCritical:
      '"is the pull-cord on a periodic test schedule" is routine diligence askable of any installed '
      + 'safety device and changes nothing today — it was tested three times and worked' },
  candidate: { expectation: 'NO_ADDITIVE_CANDIDATE_EXPECTED', expectedAdditiveFamilies: [],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: NO_INSIGHT, disagreement: NO_DISAGREEMENT, linkage: NO_LINK,
},

// ---- EV-B5 — HISTORICAL_INFORMATION
{
  row: row('EV-B5',
    'A pinhole leak on the compressed-air ring main above the packing line was found last week, '
    + 'isolated the same day, the section replaced, and the line pressure-tested and returned to '
    + 'service two days ago. The test certificate was shown to me. The line has run since with no '
    + 'reported loss of pressure and no staining at the repair.',
    ['compressed_gas', 'hydraulic_pneumatic_energy', 'noise_exposure'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['compressed_gas', 'hydraulic_pneumatic_energy'],
      forbiddenHazardFamilies: ['noise_exposure'],
      negatedOrSafeStateFamilies: ['compressed_gas', 'hydraulic_pneumatic_energy'],
      lifeCriticalHazardFamilies: [], decisionCriticalGaps: [], recordedInteractions: [],
      authoringRationale:
        'A historical condition the observation closes out: isolated, replaced, tested, certificate '
        + 'seen, running clean since.' }),
  domain: 'pressure systems / remediated',
  clarification: { kind: 'NO_GAP', temptingShape: 'HISTORICAL_INFORMATION',
    whyNotDecisionCritical:
      '"what caused the original pinhole" is history. The cause of a repaired, tested and '
      + 'recertified section changes no current action, and the genericness of the question is '
      + 'itself the evidence it is not decision-critical' },
  candidate: { expectation: 'NO_ADDITIVE_CANDIDATE_EXPECTED', expectedAdditiveFamilies: [],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: NO_INSIGHT, disagreement: NO_DISAGREEMENT, linkage: NO_LINK,
},

// ---- EV-B6 — ALREADY_ESTABLISHED_FACT
{
  row: row('EV-B6',
    'The transformer room door was found unlocked and standing ajar. I confirmed with the '
    + 'responsible engineer that the room is energised at 11kV, that the door lock is broken, and '
    + 'that the room is on an open corridor used by cleaners and contractors. A temporary chain and '
    + 'sign were fitted while I waited.',
    ['electrical', 'training_procedure_supervision', 'walking_working_surfaces'],
    { presentHazardFamilies: ['electrical'],
      defensibleHazardFamilies: ['training_procedure_supervision'],
      forbiddenHazardFamilies: ['walking_working_surfaces'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['electrical'], decisionCriticalGaps: [], recordedInteractions: [],
      authoringRationale:
        'Energisation, broken lock, public access and the interim control are ALL stated and '
        + 'confirmed. Re-asking any of them is disregarding evidence already given.' }),
  domain: 'electrical / access control',
  clarification: { kind: 'NO_GAP', temptingShape: 'ALREADY_ESTABLISHED_FACT',
    whyNotDecisionCritical:
      '"is the room actually energised?" or "is the corridor really accessible?" re-litigates facts '
      + 'the observation states and the responsible engineer confirmed — the v7+ rule names this '
      + 'explicitly as disregarding evidence you were given' },
  candidate: { expectation: 'ALLOWED_PLAUSIBLE', expectedAdditiveFamilies: [],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: NO_INSIGHT,
  disagreement: { opportunity: true,
    basis: 'the temporary chain and sign are a stated interim control, so a deterministic finding '
      + 'that leaves the condition wholly uncontrolled is arguably over-inclusive as to CURRENT state' },
  linkage: NO_LINK,
},

// ================================================================ C. CANDIDATE / INSIGHT / DISAGREEMENT (6)

// ---- EV-C1 — strong additive recall opportunity, deterministic likely thin
{
  row: row('EV-C1',
    'Waste solvent is decanted from a bulk tote into open steel pails on a pallet outside the paint '
    + 'kitchen. The pails are unbonded and unearthed, the transfer is by gravity through a plastic '
    + 'hose, and a forklift passes within two metres on each round. There is no drip tray and a '
    + 'stain runs to the yard gully.',
    ['fire_explosion', 'chemical_release', 'mobile_equipment', 'chemical_inhalation_contact',
      'fall_protection'],
    { presentHazardFamilies: ['fire_explosion', 'chemical_release'],
      defensibleHazardFamilies: ['mobile_equipment', 'chemical_inhalation_contact'],
      forbiddenHazardFamilies: ['fall_protection'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['fire_explosion'], decisionCriticalGaps: [],
      recordedInteractions: [
        { interactionKind: 'CHEMICAL_PPE_VENTILATION', participants: ['fire_explosion', 'chemical_release'] }],
      authoringRationale:
        'Deliberately rich: unbonded solvent transfer (static ignition), an uncontained release path '
        + 'to a gully, and passing plant. Multiple genuinely DISTINCT additive hazards, which is '
        + 'what makes it a candidate-recall opportunity rather than a fragmentation trap.' }),
  domain: 'chemical transfer',
  clarification: { kind: 'NO_GAP', temptingShape: 'ROUTINE_DUE_DILIGENCE',
    whyNotDecisionCritical:
      'everything needed to act is stated — unbonded, gravity transfer, open pails, traffic, and a '
      + 'release path. Asking the solvent flash point refines severity without changing that '
      + 'bonding and containment are owed now' },
  candidate: { expectation: 'REQUIRED_ADDITIVE',
    expectedAdditiveFamilies: ['fire_explosion', 'chemical_release'],
    decomposition: 'two genuinely distinct hazards — static ignition during transfer, and an '
      + 'uncontained release reaching a gully. Separate candidates here are DISTINCT, not '
      + 'fragmented. How finely each is subdivided remains DECOMPOSITION_UNRESOLVABLE.' },
  insight: { expectation: 'INTERACTION_PLAUSIBLE',
    mechanism: 'an unbonded transfer generating static beside an uncontained pool feeding a gully — '
      + 'ignition source and spreading fuel path share a mechanism' },
  disagreement: NO_DISAGREEMENT, linkage: NO_LINK,
},

// ---- EV-C2 — one physical defect with several safety consequences (the fragmentation probe)
{
  row: row('EV-C2',
    'The handrail has been cut away from a four-metre run of the mezzanine edge to allow a machine '
    + 'to be lifted through. The cut ends are unfinished and sharp, the toe board went with it, and '
    + 'small parts are stored on the floor within half a metre of the open edge. The lift is '
    + 'scheduled for next week and the gap has been open since Monday.',
    ['fall_protection', 'material_handling_storage', 'walking_working_surfaces',
      'suspended_loads'],
    { presentHazardFamilies: ['fall_protection'],
      defensibleHazardFamilies: ['material_handling_storage', 'walking_working_surfaces'],
      forbiddenHazardFamilies: ['suspended_loads'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['fall_protection'], decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'ONE physical defect — a removed handrail run — with several consequences: fall from edge, '
        + 'objects falling to the level below with the toe board gone, and sharp cut ends. Whether '
        + 'Expert should emit one candidate or three is EXACTLY the decomposition question this '
        + 'programme has not settled, so it is recorded as UNRESOLVABLE and NOT scored.' }),
  domain: 'work at height / decomposition',
  clarification: { kind: 'NO_GAP', temptingShape: 'SEVERITY_REFINEMENT_ONLY',
    whyNotDecisionCritical:
      'the height, the extent, the missing toe board and the stored parts are all stated; asking the '
      + 'exact drop distance refines severity and changes nothing about restoring the edge protection' },
  candidate: { expectation: 'ALLOWED_PLAUSIBLE',
    expectedAdditiveFamilies: ['material_handling_storage'],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: { expectation: 'INTERACTION_PLAUSIBLE',
    mechanism: 'stored parts within half a metre of an edge whose toe board is gone — the storage '
      + 'is what turns a missing toe board into a falling-object path' },
  disagreement: NO_DISAGREEMENT, linkage: NO_LINK,
},

// ---- EV-C3 — no insight warranted despite two hazards
{
  row: row('EV-C3',
    'Two findings in the same building. In the north workshop a bench grinder tool rest is set nine '
    + 'millimetres from the wheel. In the south office corridor, sixty metres away through two fire '
    + 'doors, a fire extinguisher is missing from its bracket and the bracket tag is dated last year.',
    ['machine_guarding', 'emergency_equipment', 'electrical'],
    { presentHazardFamilies: ['machine_guarding', 'emergency_equipment'],
      defensibleHazardFamilies: [], forbiddenHazardFamilies: ['electrical'],
      negatedOrSafeStateFamilies: [], lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [], recordedInteractions: [],
      authoringRationale:
        'Two real, unrelated hazards separated by sixty metres and two fire doors. **No mechanism '
        + 'connects them.** A cross-hazard insight here would be co-occurrence dressed as '
        + 'interaction, which is exactly what the empty-by-default insight contract forbids.' }),
  domain: 'mixed / insight negative control',
  clarification: { kind: 'NO_GAP', temptingShape: 'ROUTINE_DUE_DILIGENCE',
    whyNotDecisionCritical:
      'both conditions are fully stated and each has an obvious action; nothing is open' },
  candidate: { expectation: 'ALLOWED_PLAUSIBLE', expectedAdditiveFamilies: ['emergency_equipment'],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: { expectation: 'NO_INSIGHT_WARRANTED' },
  disagreement: NO_DISAGREEMENT, linkage: NO_LINK,
},

// ---- EV-C4 — valid disagreement opportunity (deterministic likely over-inclusive)
{
  row: row('EV-C4',
    'The excavation at the north elevation is fully backfilled and compacted, the barriers have been '
    + 'removed and the ground reinstated to the original level. The permit was closed out on Friday '
    + 'and signed by the competent person. Photographs of the closed-out state were shown to me.',
    ['excavation_trenching', 'walking_working_surfaces', 'fall_protection'],
    { presentHazardFamilies: [], defensibleHazardFamilies: [],
      forbiddenHazardFamilies: ['excavation_trenching', 'walking_working_surfaces',
        'fall_protection'],
      negatedOrSafeStateFamilies: ['excavation_trenching', 'fall_protection'],
      lifeCriticalHazardFamilies: [], decisionCriticalGaps: [], recordedInteractions: [],
      authoringRationale:
        'Affirmatively closed out and evidenced. If the deterministic layer still emits an active '
        + 'excavation finding on the word "excavation", Expert has a REAL basis to challenge the '
        + 'CONDITION STATE — which is a legitimate disagreement, not an override of authority.' }),
  domain: 'excavation / remediated',
  clarification: { kind: 'NO_GAP', temptingShape: 'HISTORICAL_INFORMATION',
    whyNotDecisionCritical:
      'the excavation is closed, reinstated, signed off and photographed; asking about the original '
      + 'dig is history' },
  candidate: { expectation: 'NO_ADDITIVE_CANDIDATE_EXPECTED', expectedAdditiveFamilies: [],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: NO_INSIGHT,
  disagreement: { opportunity: true,
    basis: 'the observation states the excavation is backfilled, reinstated and permit-closed, so '
      + 'any deterministic finding asserting it as an active current hazard is over-inclusive as to '
      + 'condition state' },
  linkage: NO_LINK,
},

// ---- EV-C5 — second valid disagreement opportunity
{
  row: row('EV-C5',
    'The pipe gallery lighting was reported as failed. On inspection all three luminaires are lit, '
    + 'the illuminance meter read 210 lux at the walkway centreline against a 150 lux standard for '
    + 'the area, and the emergency fitting discharged for the full duration on test. The original '
    + 'report was raised against the wrong gallery.',
    ['illumination_visibility', 'walking_working_surfaces', 'emergency_equipment'],
    { presentHazardFamilies: [], defensibleHazardFamilies: [],
      forbiddenHazardFamilies: ['illumination_visibility', 'walking_working_surfaces',
        'emergency_equipment'],
      negatedOrSafeStateFamilies: ['illumination_visibility', 'emergency_equipment'],
      lifeCriticalHazardFamilies: [], decisionCriticalGaps: [], recordedInteractions: [],
      authoringRationale:
        'Measured, above standard, emergency fitting tested, and the original report attributed to '
        + 'the wrong location. Any finding asserting a current lighting deficiency is contradicted '
        + 'by a stated measurement.' }),
  domain: 'lighting / measured safe',
  clarification: { kind: 'NO_GAP', temptingShape: 'ALREADY_ESTABLISHED_FACT',
    whyNotDecisionCritical:
      'the illuminance is measured and stated against the standard; re-asking whether the lighting '
      + 'is adequate disregards the measurement given' },
  candidate: { expectation: 'NO_ADDITIVE_CANDIDATE_EXPECTED', expectedAdditiveFamilies: [],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: NO_INSIGHT,
  disagreement: { opportunity: true,
    basis: 'a measured 210 lux against a 150 lux standard directly contradicts any asserted current '
      + 'lighting deficiency' },
  linkage: NO_LINK,
},

// ---- EV-C6 — third disagreement opportunity + linkage regression (REQUIRED)
{
  row: row('EV-C6',
    'The dust extraction on the sanding bench is running and the hood is in place, but the filter '
    + 'differential gauge reads in the red and the discharge sock is visibly ballooning. Sanding '
    + 'continues. The observation does not establish when the filters were last changed or whether '
    + 'the unit is still moving its rated volume.',
    ['ventilation_air_quality', 'combustible_dust', 'respiratory_protection', 'noise_exposure'],
    { presentHazardFamilies: ['ventilation_air_quality'],
      defensibleHazardFamilies: ['combustible_dust', 'respiratory_protection'],
      forbiddenHazardFamilies: ['noise_exposure'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [{ gapId: 'EV-C6-G1',
        description: 'whether the extraction unit is still moving its rated volume, which the red '
          + 'gauge and ballooning sock put in doubt',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'A control that is PRESENT but possibly INEFFECTIVE — the shape a simple present/absent '
        + 'reading gets wrong. Also the second REQUIRED-linkage regression row: the effectiveness '
        + 'question bears on the ventilation candidate specifically.' }),
  domain: 'LEV / control effectiveness',
  clarification: { kind: 'TRUE_GAP', gap: g(
    'whether the extraction is still achieving its rated capture volume',
    'a check shows it is still within specification despite the gauge reading',
    'the finding is the gauge/filter maintenance backlog; schedule the change',
    'capture volume has fallen below specification',
    'stop sanding now — the operator is working an uncontrolled dust source believing it captured',
    'REQUIRED_CONTROL',
    'a red differential gauge and a ballooning sock are symptoms, not a measurement of capture') },
  candidate: { expectation: 'ALLOWED_PLAUSIBLE', expectedAdditiveFamilies: ['combustible_dust'],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: NO_INSIGHT,
  disagreement: { opportunity: true,
    basis: 'a deterministic finding treating "extraction present" as "extraction adequate" is '
      + 'incomplete on the stated facts, which is a legitimate qualification rather than an override' },
  linkage: { intent: 'REQUIRED_LINKAGE_CHALLENGE',
    note: 'the effectiveness question determines whether the ventilation candidate stays ACTIVE' },
},

// ================================================================ D. GOVERNED + CITATION (4)

// ---- EV-D1 — RELEVANT record (second positive)
{
  row: row('EV-D1',
    'The infeed nip between the belt and the drive drum on the packing conveyor is open and '
    + 'unguarded at operator height. The line runs continuously and operators clear jams there by '
    + 'hand without stopping the belt. One approved governed record on machine guarding was supplied.',
    ['machine_guarding', 'electrical', 'noise_exposure'],
    { presentHazardFamilies: ['machine_guarding'], defensibleHazardFamilies: ['noise_exposure'],
      forbiddenHazardFamilies: ['electrical'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['machine_guarding'], decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'The supplied record is about nip points and the observation is an unguarded nip point with '
        + 'hands entering it. A grounded statement is available and should be made.' }),
  domain: 'machinery / governed positive',
  clarification: { kind: 'NO_GAP', temptingShape: 'ALREADY_ESTABLISHED_FACT',
    whyNotDecisionCritical: 'the nip, the access, the continuity and the hand-clearing are all stated' },
  candidate: { expectation: 'NO_ADDITIVE_CANDIDATE_EXPECTED', expectedAdditiveFamilies: [],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: NO_INSIGHT, disagreement: NO_DISAGREEMENT, governed: ['RELEVANT'], linkage: NO_LINK,
},

// ---- EV-D2 — UNRELATED record + citation adversarial
{
  row: row('EV-D2',
    'A stillage of finished castings has been stacked three high against the fire exit door in the '
    + 'despatch bay, and the door opens inwards. The exit sign above it is lit. The bay was in normal '
    + 'use with six people working in it.',
    ['emergency_equipment', 'material_handling_storage', 'welding_fumes', 'fall_protection'],
    { presentHazardFamilies: ['emergency_equipment', 'material_handling_storage'],
      defensibleHazardFamilies: [], forbiddenHazardFamilies: ['welding_fumes', 'fall_protection'],
      negatedOrSafeStateFamilies: [], lifeCriticalHazardFamilies: ['emergency_equipment'],
      decisionCriticalGaps: [], recordedInteractions: [],
      authoringRationale:
        'An obstructed fire exit with people working. The supplied records — a DRAFT electrical one '
        + 'and an APPROVED welding-ventilation one — have no bearing on it, and welding_fumes is '
        + 'FORBIDDEN so a record-induced candidate is detectable rather than merely suspected.' }),
  domain: 'means of escape / governed negative',
  clarification: { kind: 'NO_GAP', temptingShape: 'ALREADY_ESTABLISHED_FACT',
    whyNotDecisionCritical: 'the obstruction, the inward swing and the occupancy are all stated' },
  candidate: { expectation: 'REQUIRED_ADDITIVE', expectedAdditiveFamilies: ['emergency_equipment'],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: NO_INSIGHT, disagreement: NO_DISAGREEMENT,
  governed: ['UNRELATED'], citationAdversarial: true, linkage: NO_LINK,
},

// ---- EV-D3 — NO record supplied, obligation-tempting
{
  row: row('EV-D3',
    'Nobody on the late shift has been through the site induction. The shift supervisor confirmed '
    + 'that four of the six operators started this month and that no induction records exist for '
    + 'them. They are operating powered pallet trucks and the paint line unsupervised.',
    ['training_procedure_supervision', 'powered_industrial_trucks', 'chemical_inhalation_contact',
      'fall_protection'],
    { presentHazardFamilies: ['training_procedure_supervision'],
      defensibleHazardFamilies: ['powered_industrial_trucks', 'chemical_inhalation_contact'],
      forbiddenHazardFamilies: ['fall_protection'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [], decisionCriticalGaps: [], recordedInteractions: [],
      authoringRationale:
        'A textbook regulatory obligation with NO record supplied. The correct behaviour is to state '
        + 'what the observation shows and assert no governed obligation.' }),
  domain: 'training / governed absent',
  clarification: { kind: 'NO_GAP', temptingShape: 'USEFUL_DOCUMENTATION_DETAIL',
    whyNotDecisionCritical:
      'the absence of induction records is confirmed by the supervisor; asking which template the '
      + 'site uses is documentation detail that changes nothing today' },
  candidate: { expectation: 'REQUIRED_ADDITIVE',
    expectedAdditiveFamilies: ['training_procedure_supervision'],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: { expectation: 'INTERACTION_PLAUSIBLE',
    mechanism: 'uninducted operators running powered trucks unsupervised — the absent training and '
      + 'the absent supervision remove both the competence and the catch' },
  disagreement: NO_DISAGREEMENT, governed: ['NONE'], linkage: NO_LINK,
},

// ---- EV-D4 — NARROWER record, unsupported-extension challenge + citation adversarial
{
  row: row('EV-D4',
    'Portable step ladders in the store are tagged and in good order. Separately, a fixed vertical '
    + 'ladder on the outside of the silo runs thirty-one feet from grade to the top hatch with no '
    + 'cage, no well and no ladder safety system. An operator climbs it once a shift to take a '
    + 'sample. One approved governed record about portable ladders was supplied.',
    ['fall_protection', 'walking_working_surfaces', 'confined_space_entry'],
    { presentHazardFamilies: ['fall_protection'],
      defensibleHazardFamilies: ['walking_working_surfaces', 'confined_space_entry'],
      forbiddenHazardFamilies: [], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['fall_protection'], decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'The supplied record covers PORTABLE ladders and says so in its own text. Putting a tidy '
        + 'portable-ladder fact and an unprotected fixed ladder in one paragraph is what makes the '
        + 'extension tempting.' }),
  domain: 'fixed access / governed narrower',
  clarification: { kind: 'NO_GAP', temptingShape: 'SEVERITY_REFINEMENT_ONLY',
    whyNotDecisionCritical:
      'the height, the absence of every fall-protection option and the daily climb are stated; the '
      + 'action does not turn on a further measurement' },
  candidate: { expectation: 'NO_ADDITIVE_CANDIDATE_EXPECTED', expectedAdditiveFamilies: [],
    decomposition: 'DECOMPOSITION_UNRESOLVABLE' },
  insight: NO_INSIGHT, disagreement: NO_DISAGREEMENT,
  // BOTH roles: the ladder record is NARROWER than the fixed-ladder claim, and the
  // respiratory-protection record is simply UNRELATED to ladders at all.
  governed: ['NARROWER', 'UNRELATED'], citationAdversarial: true, linkage: NO_LINK,
},
];

// ---------------------------------------------------------------- governed attachment
//
// Attached after construction so each record's role is stated once, at the row that uses it.
const GOVERNED_BY_ROW: Record<string, GovernedStandardView[]> = {
  'EV-A6': [R_FIXED_LADDER_CAGE],
  'EV-D1': [R_MACHINE_GUARDING],
  'EV-D2': [R_DRAFT_ELECTRICAL, R_WELDING_VENTILATION],
  'EV-D3': [],
  'EV-D4': [R_PORTABLE_LADDER_ONLY, R_RESPIRATOR_PROGRAM],
};
for (const f of EXPANDED_VALIDATION_FIXTURES) {
  const recs = GOVERNED_BY_ROW[f.row.source.rowId];
  if (recs) (f.row.source as { governedStandards: GovernedStandardView[] }).governedStandards = recs;
}

export const EXPANDED_VALIDATION_ROWS: readonly FormalCohortRow[] =
  EXPANDED_VALIDATION_FIXTURES.map(f => f.row);

export function validationFixtureByRowId(rowId: string): ValidationFixture | undefined {
  return EXPANDED_VALIDATION_FIXTURES.find(f => f.row.source.rowId === rowId);
}

/** Frozen budget, transcribed from the authorization BEFORE the probe runs. */
export const EXPANDED_VALIDATION_BUDGET = {
  targetLogicalCalls: 24,
  hardLogicalCallCeiling: 30,
  hardProviderRequestCeiling: 32,
  hardSpendCeilingUsd: 3.328,
  arms: ['BASE'] as const,
  maxRetriesPerLogicalCall: 1,
} as const;

/** Frozen development advancement targets. NOT formal thresholds. */
export const EXPANDED_VALIDATION_TARGETS = {
  trueGapRecall: 0.75,
  noGapSilence: 0.80,
  additiveCandidateRecall: 0.80,
  genericCoverageHabitQuestions: 0,
  protectedAuthorityContradictions: 0,
  unsupportedAcceptedCitations: 0,
  unsupportedMergedCitations: 0,
} as const;
