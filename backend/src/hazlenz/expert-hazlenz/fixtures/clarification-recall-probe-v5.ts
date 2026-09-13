/**
 * EXPERT HAZLENZ -- §147 CLARIFICATION-RECALL REGRESSION SET. v5.
 *
 * ==================== WHAT THIS SET IS FOR, AND WHAT IT IS NOT ====================
 *
 * TEN rows across TEN safety domains, built to answer ONE question: does the v10 settlement rule
 * recover the clarification-retention defect established across §142 and §146 WITHOUT buying that
 * recovery with precision?
 *
 * It is deliberately narrow. It is not an expanded validation, not a cohort, not a candidate or
 * insight instrument, and it authors no disagreement truth at all -- §146 established that a
 * disagreement opportunity cannot be authored blind to deterministic output, and this set does not
 * repeat that mistake by authoring one.
 *
 * ==================== THE EIGHT PAIRED STRUCTURES ====================
 *
 * Half the set must stay SILENT. A remediation that fires everywhere is not a remediation, and the
 * FORBIDDEN half is the only thing standing between "recall repaired" and "the model now asks about
 * everything". The eight structures the authorization requires:
 *
 *   A  unknown + decision-changing                          -> REQUIRED   (CR-A1)
 *   B  unknown + decision-INVARIANT                          -> FORBIDDEN  (CR-B1)
 *   C  known + threshold clearly SATISFIED                   -> FORBIDDEN  (CR-C1)
 *   D  known + threshold clearly NOT satisfied               -> FORBIDDEN  (CR-D1)
 *   E  both regulatory branches articulable, the branch-
 *      SELECTING fact unknown                                -> REQUIRED   (CR-E1, CR-E2)
 *   F  the observation strongly SUGGESTS one answer without
 *      establishing it, and the alternative changes the
 *      decision                                              -> REQUIRED   (CR-F1, CR-F2)
 *   G  the missing fact changes severity or detail only      -> FORBIDDEN  (CR-G1)
 *   H  the evidence itself RESOLVES the apparent gap         -> FORBIDDEN  (CR-H1)
 *
 * Five REQUIRED, five FORBIDDEN. C and D are the anti-overcorrection pair and they matter more than
 * their count suggests: v10 tells the model that a threshold read across incomparable bases is not
 * established, and C and D are the cases where the threshold IS plainly settled. If v10 turns those
 * into questions, the repair has over-fired and the terminal is a precision regression.
 *
 * ==================== WHY THESE PARTICULAR SHAPES ====================
 *
 * E and F are the ESTABLISHED DEFECT, generalized off its facts rather than copied from them. The
 * root-cause reconstruction found the discriminating variable: every gap the model recovered was one
 * the observation ADVERTISED ("the observation does not establish whether...", a painted-over label,
 * a blank permit section), and every gap it missed was UNMARKED -- derivable only from what the text
 * never says. So:
 *
 *   - CR-E2 and CR-F1 and CR-F2 mark NOTHING. No sentence in them says a fact is unknown. The
 *     absence must be noticed, which is exactly what failed.
 *   - CR-F1 generalizes EV-A4's ADVERSE-BRANCH COLLAPSE onto unrelated facts: a padlocked breaker
 *     invites the opposite collapse, settling the fact benignly instead of adversely. Both are
 *     settlement; the direction is not the defect.
 *   - CR-F2 generalizes LP-B2's RESEMBLANCE-TO-A-PROGRAMME move without reusing a below-grade vault
 *     or a permit-space classification.
 *   - CR-E2 generalizes EV-A6's THRESHOLD-ACROSS-INCOMPARABLE-BASES move without reusing a fixed
 *     ladder or a height rule.
 *   - CR-B1 generalizes EV-A2's INVARIANCE-BY-SUBSUMPTION trap in the direction that must stay
 *     SILENT: a genuinely unknown fact whose answers really do lead to the same action.
 *
 * ==================== PROVENANCE AND CONFINEMENT ====================
 *
 * Authored 2026-09-03. No reserved material opened. No spent formal-cohort row read, copied,
 * paraphrased or mimicked. No §142 or §146 row reused: all ten domains (elevated platform near an
 * overhead line, traction-battery charging, excavation, mobile tower, asbestos survey, ammonia
 * refrigeration, distribution board, solvent transfer, chill-room handling, welding LEV) are new to
 * this programme, and every observation is newly written.
 *
 * The four supplied governed records are re-used views of records this repository already holds in
 * approved form; two of them (CR-C1, CR-D1) exist precisely so that a SETTLED threshold is on the
 * probe beside an UNSETTLED one.
 */

import {
  FORMAL_COHORT_ROW_CONTRACT_VERSION, type FormalCohortRow,
} from '../expert-cohort-contract';
import type { GovernedStandardView } from '../expert-contract.types';

export const CLARIFICATION_RECALL_FIXTURE_SET_VERSION =
  'hazlenz.expert.clarification-recall.fixtures.v5' as const;

// ---------------------------------------------------------------- truth vocabulary

/** The eight paired semantic structures the authorization enumerates. */
export const CLARIFICATION_STRUCTURES = [
  'A_UNKNOWN_DECISION_CHANGING',
  'B_UNKNOWN_DECISION_INVARIANT',
  'C_KNOWN_THRESHOLD_SATISFIED',
  'D_KNOWN_THRESHOLD_NOT_SATISFIED',
  'E_BOTH_BRANCHES_ARTICULABLE_SELECTOR_UNKNOWN',
  'F_SUGGESTED_BUT_NOT_ESTABLISHED',
  'G_SEVERITY_OR_DETAIL_ONLY',
  'H_EVIDENCE_RESOLVES_THE_APPARENT_GAP',
] as const;
export type ClarificationStructure = (typeof CLARIFICATION_STRUCTURES)[number];

/**
 * Which settlement move the row is built to tempt, where it tempts one.
 *
 * These are the three moves the root-cause reconstruction actually caught in hosted output. They are
 * recorded so a miss can be attributed to a MECHANISM rather than merely counted.
 */
export const SETTLEMENT_TEMPTATIONS = [
  'WORST_CASE_ASSUMPTION',
  'BENIGN_ASSUMPTION',
  'RESEMBLANCE_TO_A_PROGRAMME',
  'THRESHOLD_ACROSS_INCOMPARABLE_BASES',
  'SUBSUMPTION_BY_AN_ACTION_ALREADY_OWED',
  'NONE',
] as const;
export type SettlementTemptation = (typeof SETTLEMENT_TEMPTATIONS)[number];

/**
 * A REQUIRED answer key. BOTH branches and BOTH current outcomes are mandatory, and the gate refuses
 * a row missing either -- §140's DP-B4 was an authored "gap" whose two answers led to the same
 * action, and the model was right to refuse it.
 */
export interface RequiredClarificationTruth {
  missingFact: string;
  answerA: string; outcomeA: string;
  answerB: string; outcomeB: string;
  affectedDecision: string;
  /** Why the observation, the findings and any supplied record do NOT settle it. */
  whyNotEstablished: string;
  /** TRUE when no sentence in the observation announces the absence. The defect shape. */
  absenceIsUnmarked: boolean;
}

export interface ForbiddenClarificationTruth {
  /** The question a coverage habit would produce here. */
  temptingQuestion: string;
  /** Why asking it changes nothing that is done today. Never a blanket label. */
  whyNotDecisionCritical: string;
}

export interface ClarificationRecallFixture {
  row: FormalCohortRow;
  domain: string;
  structure: ClarificationStructure;
  temptation: SettlementTemptation;
  expectation:
    | { kind: 'REQUIRED'; truth: RequiredClarificationTruth }
    | { kind: 'FORBIDDEN'; truth: ForbiddenClarificationTruth };
}

// ---------------------------------------------------------------- governed records

const R_EXCAVATION_PROTECTIVE_SYSTEM: GovernedStandardView = {
  citation: '29 CFR 1926.652(a)(1)',
  title: 'Excavations — protection from cave-ins',
  approvedText:
    'Each employee in an excavation shall be protected from cave-ins by an adequate protective '
    + 'system, except where excavations are made entirely in stable rock or are less than 5 feet '
    + '(1.52 metres) in depth and examination by a competent person provides no indication of a '
    + 'potential cave-in. See 29 CFR 1926.652(a)(1).',
  backingState: 'APPROVED',
};

const R_GUARDRAIL_HEIGHT: GovernedStandardView = {
  citation: '29 CFR 1926.451(g)(4)',
  title: 'Scaffolds — guardrail systems',
  approvedText:
    'Guardrail systems installed to meet this requirement shall have a top edge height between 38 '
    + 'and 45 inches above the platform surface, with midrails installed approximately midway '
    + 'between the top edge and the platform surface, per 29 CFR 1926.451(g)(4).',
  backingState: 'APPROVED',
};

const R_ASBESTOS_PRESUMPTION: GovernedStandardView = {
  citation: '29 CFR 1926.1101(k)(1)',
  title: 'Asbestos — presumed asbestos-containing material',
  approvedText:
    'Thermal system insulation and surfacing material in buildings constructed no later than 1980 '
    + 'shall be presumed to contain asbestos unless rebutted by a survey or by analysis performed by '
    + 'an accredited person, as provided at 29 CFR 1926.1101(k)(1).',
  backingState: 'APPROVED',
};

const R_PSM_THRESHOLD_QUANTITY: GovernedStandardView = {
  citation: '29 CFR 1910.119(a)(1)',
  title: 'Process safety management — threshold quantity',
  approvedText:
    'This section applies to a process which involves a listed highly hazardous chemical at or above '
    + 'the threshold quantity specified for it. The threshold quantity listed for anhydrous ammonia '
    + 'is 10,000 pounds. A process means any activity involving a highly hazardous chemical, and any '
    + 'group of vessels which are interconnected is treated as a single process. See 29 CFR '
    + '1910.119(a)(1).',
  backingState: 'APPROVED',
};

// ---------------------------------------------------------------- helpers

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

const req = (
  missingFact: string, answerA: string, outcomeA: string, answerB: string, outcomeB: string,
  affectedDecision: string, whyNotEstablished: string, absenceIsUnmarked: boolean,
): RequiredClarificationTruth =>
  ({ missingFact, answerA, outcomeA, answerB, outcomeB, affectedDecision, whyNotEstablished,
    absenceIsUnmarked });

// ================================================================ the ten rows

export const CLARIFICATION_RECALL_FIXTURES: readonly ClarificationRecallFixture[] = [

// ---- CR-A1 — structure A. The baseline REQUIRED case v9 already handles. Non-regression control.
{
  row: row('CR-A1',
    'A scissor lift is in use to change yard luminaires. The platform is raised to about six metres '
    + 'and sits directly beneath the 11kV overhead distribution line that crosses the yard. Nobody '
    + 'on site could say whether the line has been made dead for this work.',
    ['electrical', 'fall_protection', 'mobile_equipment', 'noise_exposure'],
    { presentHazardFamilies: ['electrical'],
      defensibleHazardFamilies: ['fall_protection', 'mobile_equipment'],
      forbiddenHazardFamilies: ['noise_exposure'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: ['electrical'],
      decisionCriticalGaps: [{ gapId: 'CR-A1-G1',
        description: 'whether the overhead line has been made dead for this work',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'A raised platform directly beneath a live-capacity overhead line is a stated present '
        + 'electrical hazard. The absence is ANNOUNCED by the text, which is the shape v9 already '
        + 'recovers; this row exists so a recall regression on the easy case would be visible.' }),
  domain: 'elevated platform near overhead line',
  structure: 'A_UNKNOWN_DECISION_CHANGING',
  temptation: 'NONE',
  expectation: { kind: 'REQUIRED', truth: req(
    'whether the 11kV overhead line has been isolated and proved dead for this work',
    'the line is isolated, proved dead and earthed under a documented permit',
    'the work continues and the finding is limited to platform and access discipline',
    'the line remains live',
    'the platform must be lowered and the work stopped now until isolation or a safe clearance '
    + 'distance is established',
    'REQUIRED_CONTROL',
    'the text states only that nobody could say; no finding, record or answered clarification '
    + 'establishes the isolation state either way',
    false) },
},

// ---- CR-B1 — structure B. Unknown, genuinely decision-INVARIANT. Must stay silent.
{
  row: row('CR-B1',
    'A traction battery is on charge in the maintenance bay. The mechanical extract above the '
    + 'charging position is running and was confirmed at the grille, a no-smoking and no-naked-flame '
    + 'sign is posted at the bay entrance, and the charger is on a dedicated circuit. The '
    + 'observation does not record the battery\'s amp-hour capacity.',
    ['fire_explosion', 'electrical', 'ventilation_air_quality', 'excavation_trenching'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['fire_explosion', 'electrical', 'ventilation_air_quality'],
      forbiddenHazardFamilies: ['excavation_trenching'],
      // The overlay, not a fourth bucket: extract was confirmed at the grille, so the family is
      // recorded as a SAFE STATE and stays in the partition as defensible.
      negatedOrSafeStateFamilies: ['ventilation_air_quality'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'The amp-hour capacity is genuinely unknown and genuinely unmentioned. It is also '
        + 'decision-invariant HERE: extract is running and confirmed, ignition sources are '
        + 'controlled and the circuit is dedicated, so a larger or smaller charge leads to the same '
        + 'thing done today. This is the EV-A2 trap pointed the other way -- the answers really do '
        + 'converge -- and it must stay SILENT.' }),
  domain: 'traction battery charging',
  structure: 'B_UNKNOWN_DECISION_INVARIANT',
  temptation: 'NONE',
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion: 'what is the amp-hour capacity of the battery on charge?',
    whyNotDecisionCritical:
      'hydrogen evolution scales with the charge, but the three controls the answer would bear on '
      + '-- extract, ignition-source control and circuit dedication -- are all described as present '
      + 'and confirmed. No plausible capacity changes what is done in this bay today.' } },
},

// ---- CR-C1 — structure C. Threshold plainly SATISFIED on comparable bases. Anti-overcorrection.
{
  row: row('CR-C1',
    'A drainage connection trench is open on the yard apron. A tape laid from the trench bottom to '
    + 'the adjacent ground surface read 0.9 metres. The sides are battered back at roughly forty-five '
    + 'degrees in undisturbed clay, spoil is set back about two metres from the edge, and a ladder '
    + 'stands in the trench. One operative is laying duct at the bottom. A single approved governed '
    + 'record covering excavation protective systems was supplied with this inspection.',
    ['excavation_trenching', 'walking_working_surfaces', 'material_handling_storage', 'hot_work'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['excavation_trenching', 'walking_working_surfaces',
        'material_handling_storage'],
      forbiddenHazardFamilies: ['hot_work'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'The supplied record states its exception at less than five feet (1.52 m); the tape reading '
        + 'is 0.9 m and BOTH are measured bottom-to-surface. Nothing is unresolved about which side '
        + 'of the value these facts fall on. v10 tells the model an incomparable-basis threshold is '
        + 'not settled; this row is the case where it plainly IS, and silence is correct.' },
    { governedStandards: [R_EXCAVATION_PROTECTIVE_SYSTEM] }),
  domain: 'excavation',
  structure: 'C_KNOWN_THRESHOLD_SATISFIED',
  temptation: 'THRESHOLD_ACROSS_INCOMPARABLE_BASES',
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion:
      'how should the supplied record\'s five-foot condition be applied to a 0.9 metre trench?',
    whyNotDecisionCritical:
      'the record states its own measurement basis and the observation states the same one, and 0.9 '
      + 'metres is not close to 1.52 metres. There is no live interpretive branch: the exception '
      + 'plainly reaches these facts and no answer would change today\'s action.' } },
},

// ---- CR-D1 — structure D. Threshold plainly NOT satisfied; the control is plainly in place.
{
  row: row('CR-D1',
    'A mobile tower is in use for ductwork on the warehouse mezzanine. The deck stands 6.2 metres '
    + 'above the slab. Guard rails are fitted on all four sides, measured at 1,050 millimetres to '
    + 'the top edge above the platform surface with a midrail at 520 millimetres and toe boards '
    + 'fitted. Two operatives are on the deck and the outriggers are deployed and pinned. A single '
    + 'approved governed record covering scaffold guardrail systems was supplied with this '
    + 'inspection.',
    ['fall_protection', 'walking_working_surfaces', 'material_handling_storage', 'welding_fumes'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['fall_protection', 'walking_working_surfaces',
        'material_handling_storage'],
      forbiddenHazardFamilies: ['welding_fumes'],
      negatedOrSafeStateFamilies: ['fall_protection'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'The record plainly governs (6.2 m is far above any exemption) AND the control it requires '
        + 'is described as measured and in place -- 1,050 mm sits inside the record\'s 38-to-45 inch '
        + 'band, and the midrail is approximately midway. Both limbs are settled, so no branch '
        + 'remains. The mirror image of CR-C1.' },
    { governedStandards: [R_GUARDRAIL_HEIGHT] }),
  domain: 'mobile tower scaffold',
  structure: 'D_KNOWN_THRESHOLD_NOT_SATISFIED',
  temptation: 'THRESHOLD_ACROSS_INCOMPARABLE_BASES',
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion:
      'does the guardrail height measured at 1,050 millimetres meet the supplied record\'s band?',
    whyNotDecisionCritical:
      'the observation states the measurement and its datum and the record states its band; 1,050 '
      + 'millimetres is 41.3 inches, inside 38 to 45, and the midrail is approximately midway. The '
      + 'comparison is arithmetic on two stated, comparable figures, not an open interpretation.' } },
},

// ---- CR-E1 — structure E. Both branches articulable; the selector is unknown AND announced.
{
  row: row('CR-E1',
    'Suspended ceiling tiles are being taken down in a 1974 office block during a refit. The tiles '
    + 'are being lifted whole, dropped into open builders\' bags and carried out through the '
    + 'corridor. Two operatives are working without respiratory protection. The building\'s '
    + 'refurbishment and demolition survey could not be produced at the visit. A single approved '
    + 'governed record covering presumed asbestos-containing material was supplied with this '
    + 'inspection.',
    ['chemical_inhalation_contact', 'respiratory_protection', 'hazcom', 'suspended_loads'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['chemical_inhalation_contact', 'respiratory_protection', 'hazcom'],
      forbiddenHazardFamilies: ['suspended_loads'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [{ gapId: 'CR-E1-G1',
        description: 'whether the tiles have been surveyed or analysed and found not to contain '
          + 'asbestos, which the supplied record makes the rebuttal condition',
        affectedDecision: 'APPLICABILITY' }],
      recordedInteractions: [],
      authoringRationale:
        'The supplied record states a PRESUMPTION and names the only thing that rebuts it. Whether '
        + 'that rebuttal exists is precisely what is unresolved, and it decides whether an ordinary '
        + 'strip-out or a controlled removal is what should be happening right now. The absence is '
        + 'announced ("could not be produced"), so this row tests the branch reasoning rather than '
        + 'the noticing.' },
    { governedStandards: [R_ASBESTOS_PRESUMPTION] }),
  domain: 'asbestos survey',
  structure: 'E_BOTH_BRANCHES_ARTICULABLE_SELECTOR_UNKNOWN',
  temptation: 'RESEMBLANCE_TO_A_PROGRAMME',
  expectation: { kind: 'REQUIRED', truth: req(
    'whether a survey or accredited analysis has established that these tiles do not contain '
    + 'asbestos',
    'a survey or analysis records the tiles as non-asbestos and rebuts the presumption',
    'the work is an ordinary strip-out and the finding is limited to dust and manual handling',
    'no survey or analysis exists, so the presumption stands',
    'the work as described is an uncontrolled disturbance of presumed asbestos and must stop now, '
    + 'with the area secured and controlled removal arranged',
    'APPLICABILITY',
    'the record states the presumption and its rebuttal condition, and the observation states only '
    + 'that the survey could not be produced -- which is not evidence either way about whether one '
    + 'exists or what it says',
    false) },
},

// ---- CR-E2 — structure E, UNMARKED, and the EV-A6 threshold shape generalized off its facts.
{
  row: row('CR-E2',
    'The cold store plant room is running on anhydrous ammonia. The nameplate on the low-temperature '
    + 'package records a charge of 4,400 kilograms. A common liquid header runs from this package '
    + 'through the wall to the adjoining high-temperature package that serves the second store. One '
    + 'technician is working at the compressor deck. A single approved governed record covering '
    + 'process safety management threshold quantities was supplied with this inspection.',
    ['chemical_release', 'chemical_inhalation_contact', 'emergency_equipment', 'noise_exposure'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['chemical_release', 'chemical_inhalation_contact',
        'emergency_equipment'],
      forbiddenHazardFamilies: ['noise_exposure'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [{ gapId: 'CR-E2-G1',
        description: 'whether the two packages are interconnected in the sense the supplied record '
          + 'uses, so that their charges aggregate against the threshold quantity',
        affectedDecision: 'REGULATORY_INTERPRETATION' }],
      recordedInteractions: [],
      authoringRationale:
        'The EV-A6 shape on unrelated facts. 4,400 kg is 9,700 pounds, just BELOW the record\'s '
        + '10,000-pound threshold -- and the record also says interconnected vessels are one '
        + 'process. The observation states a common header, which is a physical connection and NOT '
        + 'the record\'s legal one; the adjoining charge is never stated. Nothing in the text '
        + 'announces that anything is unknown. The model must notice that it cannot settle which '
        + 'side of the threshold this process falls on.' },
    { governedStandards: [R_PSM_THRESHOLD_QUANTITY] }),
  domain: 'ammonia refrigeration',
  structure: 'E_BOTH_BRANCHES_ARTICULABLE_SELECTOR_UNKNOWN',
  temptation: 'THRESHOLD_ACROSS_INCOMPARABLE_BASES',
  expectation: { kind: 'REQUIRED', truth: req(
    'whether the two ammonia packages count as one interconnected process under the supplied '
    + 'record, and what the adjoining package holds',
    'the packages are separable and this one stands alone at 9,700 pounds',
    'the process sits below the stated threshold and the finding rests on general refrigeration '
    + 'safety rather than the record\'s programme',
    'the common header makes them one process and the combined charge is at or above 10,000 pounds',
    'the record\'s process safety management programme governs this plant room now, which changes '
    + 'what is required of the work at the compressor deck today',
    'REGULATORY_INTERPRETATION',
    'the nameplate charge and the existence of a header are stated; whether that header is the '
    + 'interconnection the record means, and what the adjoining package holds, are not',
    true) },
},

// ---- CR-F1 — structure F, UNMARKED. EV-A4's collapse, pointed benignly instead of adversely.
{
  row: row('CR-F1',
    'An electrician has the cover off a 400 volt distribution board in the pump house and is '
    + 'torquing terminations with an insulated driver. The upstream breaker handle is padlocked in '
    + 'the down position. A voltage tester and a pair of insulated gloves lie on the bench beside '
    + 'the board.',
    ['electrical', 'lockout_tagout', 'personal_protective_equipment', 'combustible_dust'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['electrical', 'lockout_tagout',
        'personal_protective_equipment'],
      forbiddenHazardFamilies: ['combustible_dust'], negatedOrSafeStateFamilies: [],
      // NOT life-critical-marked, and the reason IS the row: life-critical presumes the hazard is
      // PRESENT, and whether this board is live is exactly what the observation does not settle.
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [{ gapId: 'CR-F1-G1',
        description: 'whether the board has been proved dead at the terminations being worked on, '
          + 'and whether the padlocked breaker is its only source of supply',
        affectedDecision: 'REQUIRED_CONTROL' }],
      recordedInteractions: [],
      authoringRationale:
        'The padlock invites the model to SETTLE the fact benignly -- "it is locked off, therefore '
        + 'it is dead" -- exactly as EV-A4 settled an unknown adversely. A distribution board can '
        + 'carry a second incomer or a backfed circuit, and a tester lying on a bench is not a test '
        + 'performed. The observation establishes the padlock and nothing about the proving.' }),
  domain: 'electrical distribution board',
  structure: 'F_SUGGESTED_BUT_NOT_ESTABLISHED',
  temptation: 'BENIGN_ASSUMPTION',
  expectation: { kind: 'REQUIRED', truth: req(
    'whether the terminations have been proved dead and whether the padlocked breaker is the board\'s '
    + 'only source of supply',
    'the board was proved dead at the terminations and the padlocked breaker is its only source',
    'the work is properly isolated and the finding is limited to the gloves and tester not being '
    + 'worn or in hand',
    'the board was not proved, or a second incomer or backfeed remains live',
    'this is live working at 400 volts with the cover off and must stop now',
    'REQUIRED_CONTROL',
    'a padlocked upstream handle is stated; proving dead at the point of work and the absence of a '
    + 'second source are neither stated nor implied by it',
    true) },
},

// ---- CR-F2 — structure F, UNMARKED. LP-B2's resemblance move, off its facts.
{
  row: row('CR-F2',
    'Solvent is being transferred from a road tanker into the day tank on the loading pad. A '
    + 'portable electric pump with an ordinary industrial plug and trailing lead is doing the '
    + 'transfer, plugged into a socket on the pad wall. The tanker placard shows a flammable liquid '
    + 'and one operative is standing at the coupling throughout.',
    ['fire_explosion', 'chemical_release', 'electrical', 'excavation_trenching'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['fire_explosion', 'chemical_release', 'electrical'],
      forbiddenHazardFamilies: ['excavation_trenching'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [{ gapId: 'CR-F2-G1',
        description: 'whether this loading pad has been classified as a hazardous area, and to what '
          + 'zone, which decides whether ordinary electrical equipment may be used on it',
        affectedDecision: 'APPLICABILITY' }],
      recordedInteractions: [],
      authoringRationale:
        'LP-B2 reasoned from a physical profile to a CLASSIFICATION and then asserted it. The same '
        + 'move is available here: flammable transfer at a pad LOOKS like a classified area, so '
        + 'ordinary electrical gear looks like an ignition source. Resemblance is not the '
        + 'classification. Whether this pad is zoned, and to what, is what decides the answer, and '
        + 'nothing in the text says it is unknown.' }),
  domain: 'solvent transfer',
  structure: 'F_SUGGESTED_BUT_NOT_ESTABLISHED',
  temptation: 'RESEMBLANCE_TO_A_PROGRAMME',
  expectation: { kind: 'REQUIRED', truth: req(
    'whether the loading pad is classified as a hazardous area, and to which zone',
    'the pad is classified non-hazardous on the basis of the transfer method and open ventilation',
    'the ordinary pump is permitted here and the finding turns on bonding, earthing and spill '
    + 'control at the coupling',
    'the pad is classified as a zoned hazardous area',
    'a non-protected pump and trailing lead are an ignition source inside a flammable atmosphere and '
    + 'the transfer must stop now',
    'APPLICABILITY',
    'the placard, the pump and the socket are stated; the pad\'s area classification is never '
    + 'mentioned, and resembling a zoned area is not being one',
    true) },
},

// ---- CR-G1 — structure G. The missing fact changes magnitude only.
{
  row: row('CR-G1',
    'Operatives are hand-balling 15 kilogram cases off a pallet at floor level and up onto a '
    + 'conveyor at chest height in the chill room. The lift is from the floor with a twist to the '
    + 'left at the top. The observation does not record how many cases are moved in a shift.',
    ['material_handling_storage', 'walking_working_surfaces', 'training_procedure_supervision',
      'suspended_loads'],
    { presentHazardFamilies: ['material_handling_storage'],
      defensibleHazardFamilies: ['training_procedure_supervision', 'walking_working_surfaces'],
      forbiddenHazardFamilies: ['suspended_loads'], negatedOrSafeStateFamilies: [],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'Throughput is genuinely unknown and would genuinely change the magnitude of the exposure. '
        + 'It changes nothing that is done today: the defect is the lift GEOMETRY -- floor to chest '
        + 'with a twist -- and the correction is the same at any rate. Severity refinement without '
        + 'a decision, which the seven forbidden shapes already name.' }),
  domain: 'manual handling in a chill room',
  structure: 'G_SEVERITY_OR_DETAIL_ONLY',
  temptation: 'NONE',
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion: 'how many cases are handled per shift on this line?',
    whyNotDecisionCritical:
      'the answer scales the exposure but selects no different action: raising the pallet and '
      + 'lowering or squaring the transfer point is what is owed whether the rate is high or low, '
      + 'and no plausible figure would make the current geometry acceptable.' } },
},

// ---- CR-H1 — structure H. The observation itself closes the apparent gap.
{
  row: row('CR-H1',
    'The welding bay is fitted with on-torch fume extraction. The unit\'s airflow indicator sat in '
    + 'the green band throughout, extraction at the nozzle was checked in my presence with a smoke '
    + 'tube and drew it fully, and the flow was recorded at 62 litres per second against the unit\'s '
    + '50 litre per second design figure. Welding continues with the torch shroud in place.',
    ['welding_fumes', 'ventilation_air_quality', 'respiratory_protection', 'excavation_trenching'],
    { presentHazardFamilies: [],
      defensibleHazardFamilies: ['welding_fumes', 'ventilation_air_quality',
        'respiratory_protection'],
      forbiddenHazardFamilies: ['excavation_trenching'],
      negatedOrSafeStateFamilies: ['ventilation_air_quality'],
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'The question a coverage habit reaches for -- is the extraction actually working? -- is the '
        + 'one the observation answers three separate ways: indicator, witnessed smoke-tube draw, '
        + 'and a measured figure above the design flow. Asking it back is disregarding evidence '
        + 'already given, which the prompt names explicitly.' }),
  domain: 'welding local exhaust ventilation',
  structure: 'H_EVIDENCE_RESOLVES_THE_APPARENT_GAP',
  temptation: 'NONE',
  expectation: { kind: 'FORBIDDEN', truth: {
    temptingQuestion: 'is the on-torch extraction actually capturing fume at the arc?',
    whyNotDecisionCritical:
      'capture was verified in three independent ways in the inspector\'s presence and the measured '
      + 'flow exceeds the design figure. The fact is established, so there is nothing to ask.' } },
},

];

export const CLARIFICATION_RECALL_ROWS: readonly FormalCohortRow[] =
  CLARIFICATION_RECALL_FIXTURES.map(f => f.row);

export function clarificationFixtureByRowId(
  rowId: string,
): ClarificationRecallFixture | undefined {
  return CLARIFICATION_RECALL_FIXTURES.find(f => f.row.source.rowId === rowId);
}

/**
 * Frozen budget, transcribed from the §147 authorization BEFORE the probe runs.
 *
 * Ten logical calls against a twelve-request ceiling leaves exactly two requests of headroom, which
 * is the retry allowance and nothing else: a retry is permitted ONLY where a transport failure
 * objectively prevented obtaining the planned response, and it stays inside the cap.
 */
export const CLARIFICATION_RECALL_BUDGET = {
  targetLogicalCalls: 10,
  hardLogicalCallCeiling: 10,
  hardProviderRequestCeiling: 12,
  hardSpendCeilingUsd: 2.00,
  arms: ['BASE'] as const,
  maxRetriesPerLogicalCall: 1,
} as const;

/**
 * Frozen §147 hosted decision gates. NOT formal thresholds, and NOT a population claim: on a set
 * this small, 100% is a remediation gate and nothing more.
 */
export const CLARIFICATION_RECALL_GATES = {
  /** STRICT: the authored missing fact must be recovered. A different question is not recall. */
  strictRequiredRecall: 1.0,
  /** Clearly unnecessary questions on the matched FORBIDDEN controls. */
  maxForbiddenViolations: 0,
  maxInvalidClarificationObjects: 0,
  maxCitationContainmentViolations: 0,
  maxProtectedAuthorityContradictions: 0,
} as const;
