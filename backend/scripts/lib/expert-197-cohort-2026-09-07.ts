/**
 * §197 -- FRESH DEVELOPMENT COHORT FOR THE STRUCTURED FIRST-PASS PIPELINE.
 * DEVELOPMENT ONLY. Read by the §197 executor; never reachable from production.
 *
 * ==================== NOTHING HERE IS REUSED ====================
 *
 * Twelve fresh scenarios. No §195 row, no §192 row, no §187 row, no reserved formal-acceptance
 * material, and no observation text copied from any of them. The frozen §195 cohort is neither
 * executed nor read by this module.
 *
 * ==================== WHAT THE TRUTH IN THIS FILE IS, AND IS NOT ====================
 *
 * `TRUTH_PROVENANCE` below is the honest label and it must travel with every figure derived from
 * this file. The scenario text and the expectations were AI-AUTHORED. They are NOT product-owner
 * reviewed, they are NOT independent human truth, and they are NOT the semantic oracle for this
 * validation.
 *
 * They serve two narrower purposes:
 *
 *   1. DESIGN -- they make the cohort adversarial on purpose, so the run has a chance of exposing
 *      a defect rather than confirming a happy path.
 *   2. PACKET STRUCTURE -- they tell the adjudication packet what each row was built to probe, so a
 *      human reviewer is shown the intended distinction rather than having to reconstruct it.
 *
 * Every semantic verdict in §197 comes from a human. Nothing in this file is scored as a verdict,
 * and no measure is computed by comparing model output to `expectedOwedProperty` prose.
 *
 * ==================== THE ONE RULE THAT GOVERNED THE AUTHORING ====================
 *
 * NEVER ASSERT WHAT THE OBSERVATION DOES NOT ESTABLISH. Each `establishedByTheText` list names what
 * the scenario genuinely states, and each `notEstablishedByTheText` names the gap. A "no gap" row
 * states everything the decision needs; a "gap" row leaves exactly one thing open and states its
 * neighbours, so a model that substitutes a neighbour is visibly wrong rather than arguably right.
 *
 * ==================== MATCHED PAIRS, NOT A PILE OF NEGATIVES ====================
 *
 * The three no-gap rows are PARTNERS of three gap rows, balanced on equipment, setting, vocabulary
 * and length. SF-03 is SF-01 with the securement established. SF-12 is SF-05 with the protective
 * function demonstrated. SF-04 is SF-06 with the return-to-service verification recorded. A
 * separate pile of easy negatives would measure nothing; a matched partner measures whether the
 * model is reading the distinction or the topic.
 */

import type {
  DeterministicFindingView, GovernedStandardView,
} from '../../src/safescope-v2/expert-hazlenz/expert-contract.types';

export const SECTION_197_COHORT_VERSION = 'hazlenz.expert.structured-e2e-cohort.2026-09-07' as const;

/** Travels with every figure derived from this file. See the header. */
export const TRUTH_PROVENANCE = {
  AI_ASSISTED_SCENARIO_AND_EXPECTATION_AUTHORING: true,
  PRODUCT_OWNER_REVIEWED: false,
  FULLY_INDEPENDENT_HUMAN_AUTHORING: false,
  USED_AS_THE_SEMANTIC_ORACLE: false,
  role: 'cohort design and adjudication-packet structure only. Every semantic verdict in §197 is '
    + 'produced by a human reviewer, not by comparison against this file.',
  neverDescribeAs: 'independent human truth',
} as const;

/** The scenario families the authorization named. A row may carry several. */
export const SCENARIO_FAMILIES = [
  'SINGLE_REAL_UNRESOLVED_FACT',
  'MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS',
  'NO_REAL_GAP',
  'NEARBY_PROPERTY_COMPETITION',
  'TEMPORAL_SCOPE',
  'FUNCTION_VERSUS_APPEARANCE',
  'CONJUNCTIVE_FACT',
  'GOVERNED_EVIDENCE_QUOTATION_OPPORTUNITY',
  'UNSUPPLIED_CITATION_CONTAINMENT_OPPORTUNITY',
  'EXPOSURE_DECISION',
  'NOT_OBSERVED_IS_NOT_ABSENT',
  'THRESHOLD_IS_NOT_A_GAP',
] as const;
export type ScenarioFamily = (typeof SCENARIO_FAMILIES)[number];

export interface ExpectedOwedFact {
  /** A short intent label. NEVER compared against a generated factKey — identity is computed. */
  readonly factKeyIntent: string;
  /** The exact property that remains unknown, in one sentence. */
  readonly owedProperty: string;
  /** Conjuncts that must all survive. One entry means the fact is not conjunctive. */
  readonly conjuncts: readonly string[];
  readonly expectedAffectedDecision: string;
  readonly acceptableAlternativeAffectedDecisions: readonly string[];
  /** Region(s) of the observation a relevant span would come from. Guidance, not a matcher. */
  readonly acceptableSpanRegions: readonly string[];
  /** What each branch must be ABOUT for the fact to be the right fact. */
  readonly branchSemantics: { readonly aMustMean: string; readonly bMustMean: string };
  readonly expectedDecisionDivergence: { readonly ifA: string; readonly ifB: string };
  /**
   * Properties a WRONG declaration would name instead. The single most diagnostic field in the
   * packet: naming one of these is a nearby-property substitution, not a near miss.
   */
  readonly unacceptableNeighbouringProperties: readonly string[];
  /** Whether a human might reasonably judge this gap safety-critical. Feeds axis R only. */
  readonly designNoteOnCriticality: string;
}

export interface CohortRow {
  readonly rowId: string;
  readonly families: readonly ScenarioFamily[];
  /** The partner row this is balanced against, where one exists. */
  readonly pairedWith: string | null;
  readonly location: string;
  readonly task: string;
  readonly jurisdiction: string;
  readonly allowedHazardFamilies: readonly string[];
  readonly observation: string;
  readonly deterministicFindings: readonly DeterministicFindingView[];
  /** As the FIRST PASS sees them — rendered under opaque handles with citations redacted. */
  readonly governedStandards: readonly GovernedStandardView[];
  /** As the VERIFIER sees them — sourceId plus verbatim text, citations intact. */
  readonly verifierGovernedEvidence: readonly { sourceId: string; text: string }[];
  readonly establishedByTheText: readonly string[];
  readonly notEstablishedByTheText: readonly string[];
  /** The expected number of genuinely decision-critical unresolved facts. A range where honest. */
  readonly expectedGapCount: { readonly min: number; readonly max: number };
  readonly expectedOwedFacts: readonly ExpectedOwedFact[];
  readonly designIntent: string;
}

// ---------------------------------------------------------------- governed records

const GOV_ABRASIVE = {
  sourceId: 'GOV-ABRASIVE-01',
  text: 'Abrasive wheel machinery — guarding of the wheel periphery and the work rest. The work '
    + 'rest shall be kept adjusted closely to the wheel with a maximum opening of one-eighth inch. '
    + 'The distance between the wheel periphery and the adjustable tongue guard at the top of the '
    + 'opening shall never exceed one-quarter inch. Both distances shall be maintained as the '
    + 'wheel wears. Governing text: 29 CFR 1910.215(a)(4).',
};

const GOV_HAZCOM = {
  sourceId: 'GOV-HAZCOM-01',
  text: 'Hazard communication — labels on shipped containers. Each container of hazardous chemicals '
    + 'leaving the workplace shall be labelled with the product identifier, signal word, hazard '
    + 'statement, pictogram, precautionary statement and the name, address and telephone number of '
    + 'the responsible party. Governing text: 29 CFR 1910.1200(f)(1).',
};

/** The first-pass view of a governed record. The renderer strips its citation and hides its id. */
const asFirstPassView = (title: string, text: string): GovernedStandardView => ({
  citation: 'withheld-from-this-view',
  title,
  approvedText: text,
  backingState: 'APPROVED',
});

// ---------------------------------------------------------------- the twelve rows

export const SECTION_197_COHORT: readonly CohortRow[] = [
  // ============================================================ PAIR 1 — securement
  {
    rowId: 'SF-01',
    families: ['SINGLE_REAL_UNRESOLVED_FACT', 'NEARBY_PROPERTY_COMPETITION'],
    pairedWith: 'SF-03',
    location: 'fabrication bay',
    task: 'drilling steel plate on a bench-mounted drill press',
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: ['machine_guarding', 'lockout_tagout', 'electrical'],
    observation:
      'Bench-mounted drill press in the fabrication bay. The chuck guard is fitted and is closed '
      + 'over the chuck. Two of the three guard mounting points are visible from the operator side '
      + 'and both carry a bolt. The third mounting point is behind the column and could not be seen '
      + 'from where the inspector stood. The machine was running and an operator was drilling steel '
      + 'plate at the time of the visit.',
    deterministicFindings: [],
    governedStandards: [],
    verifierGovernedEvidence: [],
    establishedByTheText: [
      'a chuck guard is fitted',
      'the guard is closed over the chuck',
      'two of three mounting points carry a bolt',
      'the machine was running with an operator at it',
    ],
    notEstablishedByTheText: [
      'whether the guard is secured at the third mounting point',
      'whether the two visible bolts are tight',
    ],
    expectedGapCount: { min: 1, max: 1 },
    expectedOwedFacts: [{
      factKeyIntent: 'chuck guard securement at all mounting points',
      owedProperty: 'whether the chuck guard is securely fastened at every mounting point, so that '
        + 'it cannot be displaced while the spindle turns',
      conjuncts: ['the guard is fastened at all three mounting points'],
      expectedAffectedDecision: 'REQUIRED_CONTROL',
      acceptableAlternativeAffectedDecisions: [],
      acceptableSpanRegions: [
        'The third mounting point is behind the column and could not be seen from where the '
        + 'inspector stood',
        'Two of the three guard mounting points are visible from the operator side',
      ],
      branchSemantics: {
        aMustMean: 'the guard is fastened and secure at every mounting point',
        bMustMean: 'the guard is unfastened or insecure at one or more mounting points',
      },
      expectedDecisionDivergence: {
        ifA: 'the guard is accepted as an effective control and the machine continues in use',
        ifB: 'the drill press is stopped until the guard is properly secured and re-checked',
      },
      unacceptableNeighbouringProperties: [
        'whether a chuck guard is FITTED — the text states it is',
        'whether the guard is CLOSED — the text states it is',
        'whether the guard is the correct type or design for the machine',
        'whether the operator was trained',
      ],
      designNoteOnCriticality: 'a displaced chuck guard on a running drill press is an entanglement '
        + 'exposure with a person at the machine now; a reviewer may well call this safety-critical',
    }],
    designIntent: 'PRESENCE versus SECUREMENT. The guard is unambiguously present and closed, so a '
      + 'declaration about presence is a substitution rather than a near miss.',
  },
  {
    rowId: 'SF-03',
    families: ['NO_REAL_GAP', 'NEARBY_PROPERTY_COMPETITION'],
    pairedWith: 'SF-01',
    location: 'fabrication bay',
    task: 'drilling steel plate on a bench-mounted drill press',
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: ['machine_guarding', 'lockout_tagout', 'electrical'],
    observation:
      'Bench-mounted drill press in the fabrication bay. The chuck guard is fitted and is closed '
      + 'over the chuck. The inspector checked all three guard mounting points by hand from both '
      + 'sides of the column and found a bolt fitted and tight at each one. The machine was running '
      + 'and an operator was drilling steel plate at the time of the visit.',
    deterministicFindings: [],
    governedStandards: [],
    verifierGovernedEvidence: [],
    establishedByTheText: [
      'a chuck guard is fitted and closed',
      'all three mounting points were checked by hand and each is fitted and tight',
      'the machine was running with an operator at it',
    ],
    notEstablishedByTheText: [],
    expectedGapCount: { min: 0, max: 0 },
    expectedOwedFacts: [],
    designIntent: 'The matched partner of SF-01, identical in setting and vocabulary, with the '
      + 'securement established by direct inspection. A gap declared here is a false gap.',
  },

  // ============================================================ PAIR 2 — protective function
  {
    rowId: 'SF-05',
    families: ['SINGLE_REAL_UNRESOLVED_FACT', 'FUNCTION_VERSUS_APPEARANCE'],
    pairedWith: 'SF-12',
    location: 'tool room',
    task: 'machining a fixture on a vertical machining centre',
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: ['machine_guarding', 'lockout_tagout', 'electrical'],
    observation:
      'Vertical machining centre in the tool room. The interlocked access door is closed. The '
      + 'status lamp on the control panel shows green, which the operator said means the interlock '
      + 'is made. The interlock switch itself is mounted behind the door frame and was not '
      + 'accessible for inspection. No record of an interlock function test was available on site '
      + 'and nobody present could say when one was last carried out. The machine was cutting when '
      + 'observed.',
    deterministicFindings: [],
    governedStandards: [],
    verifierGovernedEvidence: [],
    establishedByTheText: [
      'the access door is closed',
      'a status lamp shows green and the operator reports that this indicates the interlock is made',
      'the interlock switch is present but was not accessible for inspection',
      'no function-test record was available on site',
      'the machine was cutting',
    ],
    notEstablishedByTheText: [
      'whether opening the door actually stops hazardous motion',
      'whether the interlock has ever been function-tested',
    ],
    expectedGapCount: { min: 1, max: 1 },
    expectedOwedFacts: [{
      factKeyIntent: 'door interlock protective function verified',
      owedProperty: 'whether the access-door interlock actually stops hazardous motion when the '
        + 'door is opened — that is, whether it performs its protective function',
      conjuncts: ['the interlock stops hazardous motion on door opening'],
      expectedAffectedDecision: 'REQUIRED_CONTROL',
      acceptableAlternativeAffectedDecisions: [],
      acceptableSpanRegions: [
        'No record of an interlock function test was available on site',
        'The interlock switch itself is mounted behind the door frame and was not accessible for '
        + 'inspection',
        'nobody present could say when one was last carried out',
      ],
      branchSemantics: {
        aMustMean: 'the interlock stops hazardous motion when the door is opened',
        bMustMean: 'the interlock does not stop hazardous motion, or is defeated or defective',
      },
      expectedDecisionDivergence: {
        ifA: 'the interlock is accepted as an effective control and machining continues',
        ifB: 'the machine is taken out of service until the interlock is repaired and proven',
      },
      unacceptableNeighbouringProperties: [
        'whether an interlock is FITTED — the text states the switch is there',
        'whether the door is CLOSED — the text states it is',
        'whether the status lamp is lit or legible — the text states it shows green',
        'whether the operator understands what the lamp means',
        'whether the switch is accessible for inspection — that is the reason the fact is open, '
        + 'not the fact itself',
      ],
      designNoteOnCriticality: 'an unproven interlock on a machine that is cutting is an access-to-'
        + 'moving-parts exposure now; a reviewer may well call this safety-critical',
    }],
    designIntent: 'APPEARANCE and STATUS INDICATION versus PROTECTIVE FUNCTION. A green lamp, a '
      + 'closed door and a present switch are all stated. None of them establishes that the '
      + 'interlock works, and a declaration that accepts any of them as the fact is wrong.',
  },
  {
    rowId: 'SF-12',
    families: ['NO_REAL_GAP', 'FUNCTION_VERSUS_APPEARANCE'],
    pairedWith: 'SF-05',
    location: 'tool room',
    task: 'machining a fixture on a vertical machining centre',
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: ['machine_guarding', 'lockout_tagout', 'electrical'],
    observation:
      'Vertical machining centre in the tool room. The interlocked access door is closed. The '
      + 'maintenance technician demonstrated the interlock in the inspector\'s presence: with the '
      + 'machine in cycle, opening the door stopped spindle rotation and all axis motion, and the '
      + 'machine would not restart until the door was closed and the cycle re-initiated. The test '
      + 'was entered on the machine log sheet and countersigned by the supervisor. The machine was '
      + 'cutting when observed.',
    deterministicFindings: [{
      findingKey: 'DET-SF12-1',
      hazardFamily: 'machine_guarding',
      conditionState: 'CONTROLLED',
      isLifeCritical: false,
      isActionable: false,
      requiredActions: [],
    }],
    governedStandards: [],
    verifierGovernedEvidence: [],
    establishedByTheText: [
      'the access door is closed',
      'the interlock was function-tested in the inspector\'s presence and stopped spindle and axis '
      + 'motion on door opening',
      'restart required the door closed and the cycle re-initiated',
      'the test was recorded and countersigned',
    ],
    notEstablishedByTheText: [],
    expectedGapCount: { min: 0, max: 0 },
    expectedOwedFacts: [],
    designIntent: 'The matched partner of SF-05 with the protective function demonstrated rather '
      + 'than indicated. Also the only row carrying a deterministic finding, so false-gap '
      + 'suppression is tested with a populated deterministic context rather than an empty one.',
  },

  // ============================================================ PAIR 3 — temporal scope
  {
    rowId: 'SF-06',
    families: ['SINGLE_REAL_UNRESOLVED_FACT', 'TEMPORAL_SCOPE'],
    pairedWith: 'SF-04',
    location: 'despatch bay',
    task: 'lifting palletised stock with an overhead gantry crane',
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: ['mobile_equipment', 'machine_guarding', 'lockout_tagout'],
    observation:
      'Overhead gantry crane in the despatch bay. The crane was taken out of service on 2 September '
      + 'after the hoist brake was reported slipping. A repair sheet on the maintenance clipboard '
      + 'shows the brake was replaced on 4 September and carries a signature in the "work '
      + 'completed" box. The "load test" and "returned to service" boxes on the same sheet are '
      + 'blank. The crane was in use lifting palletised stock over the loading area when observed.',
    deterministicFindings: [],
    governedStandards: [],
    verifierGovernedEvidence: [],
    establishedByTheText: [
      'the brake was reported slipping and the crane was taken out of service on 2 September',
      'the brake was replaced on 4 September',
      'the "work completed" box carries a signature',
      'the "load test" and "returned to service" boxes are blank',
      'the crane is in use lifting loads now',
    ],
    notEstablishedByTheText: [
      'whether the replaced brake was proven under load before the crane went back into use',
      'whether anyone formally returned the crane to service',
    ],
    expectedGapCount: { min: 1, max: 1 },
    expectedOwedFacts: [{
      factKeyIntent: 'hoist brake proven under load before return to service',
      owedProperty: 'whether the replaced hoist brake was verified to hold under load BEFORE the '
        + 'crane was put back into use — the verification and its timing together',
      conjuncts: [
        'the brake was verified to hold under load',
        'that verification happened before the crane was returned to use',
      ],
      expectedAffectedDecision: 'REQUIRED_CONTROL',
      acceptableAlternativeAffectedDecisions: [],
      acceptableSpanRegions: [
        'The "load test" and "returned to service" boxes on the same sheet are blank',
        'carries a signature in the "work completed" box',
      ],
      branchSemantics: {
        aMustMean: 'the brake was load-tested and the crane formally returned to service before it '
          + 'was used again',
        bMustMean: 'the crane went back into use without the replaced brake being proven under load',
      },
      expectedDecisionDivergence: {
        ifA: 'the repair is accepted as complete and lifting continues',
        ifB: 'lifting stops and the crane is withdrawn until the brake is load-tested and the crane '
          + 'is formally returned to service',
      },
      unacceptableNeighbouringProperties: [
        'whether the brake was REPLACED — the text states it was, on 4 September',
        'whether a repair sheet exists — the text states it does and that it is signed',
        'whether the original slipping fault was real',
        'whether the crane is inspected periodically in general',
      ],
      designNoteOnCriticality: 'an unproven hoist brake on a crane lifting loads over a working '
        + 'area is a dropped-load exposure now; a reviewer may well call this safety-critical',
    }],
    designIntent: 'TEMPORAL SCOPE. The repair is established; what is open is verification AND its '
      + 'position in time relative to return to service. A declaration that drops the temporal '
      + 'conjunct has lost the thing that makes the fact decision-critical.',
  },
  {
    rowId: 'SF-04',
    families: ['NO_REAL_GAP', 'TEMPORAL_SCOPE'],
    pairedWith: 'SF-06',
    location: 'despatch bay',
    task: 'lifting palletised stock with an overhead gantry crane',
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: ['mobile_equipment', 'machine_guarding', 'lockout_tagout'],
    observation:
      'Overhead gantry crane in the despatch bay. The crane was taken out of service on 2 September '
      + 'after the hoist brake was reported slipping. A repair sheet on the maintenance clipboard '
      + 'shows the brake was replaced on 4 September, that a 1.25x rated load test was carried out '
      + 'and passed on 4 September, and that the appointed person signed the crane back into '
      + 'service on 4 September after that test. The sheet does not record which of the two '
      + 'approved brake part numbers was fitted. The crane was in use lifting palletised stock over '
      + 'the loading area when observed.',
    deterministicFindings: [],
    governedStandards: [],
    verifierGovernedEvidence: [],
    establishedByTheText: [
      'the brake was replaced on 4 September',
      'a 1.25x rated load test was carried out and passed on 4 September',
      'the appointed person signed the crane back into service after that test',
      'the crane is in use now',
    ],
    notEstablishedByTheText: [
      'which of the two approved brake part numbers was fitted — a genuine absence that changes '
      + 'nothing about what is done today',
    ],
    expectedGapCount: { min: 0, max: 0 },
    expectedOwedFacts: [],
    designIntent: 'The matched partner of SF-06, with the verification and its timing both stated. '
      + 'It additionally plants ONE real but non-decision-critical absence — the brake part number '
      + '— so precision is tested against a genuine unknown rather than against a complete text. '
      + 'Declaring the part number is a false gap: both answers lead to the same action today.',
  },

  // ============================================================ multi-gap
  {
    rowId: 'SF-02',
    families: ['MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS'],
    pairedWith: null,
    location: 'effluent sump, level -2',
    task: 'confined-space entry to clear a blocked sump inlet',
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: ['confined_space', 'fall_protection', 'chemical_exposure'],
    observation:
      'Confined-space entry at the effluent sump on level -2. A tripod and winch are rigged over '
      + 'the opening and an attendant is stationed at the top with the winch line attached to the '
      + 'entrant\'s harness. The entry permit on the clipboard is filled in and signed by the '
      + 'authorised person. The gas monitor clipped to the entrant\'s harness was switched on and '
      + 'displaying readings; nobody present could say when it was last calibrated or bump-tested. '
      + 'The rescue arrangements section of the permit reads "site team" and nothing further, and '
      + 'the attendant said he had not been told what the rescue plan was. The entrant was in the '
      + 'sump when observed.',
    deterministicFindings: [],
    governedStandards: [],
    verifierGovernedEvidence: [],
    establishedByTheText: [
      'a tripod, winch and attendant are in place and the line is attached to the entrant',
      'a completed and signed entry permit exists',
      'a gas monitor is switched on and displaying readings',
      'the rescue arrangements section names "site team" and nothing further',
      'the attendant has not been told what the rescue plan is',
      'the entrant is in the sump now',
    ],
    notEstablishedByTheText: [
      'whether the gas monitor is within its calibration or bump-test validity, so its readings can '
      + 'be relied on',
      'whether a rescue arrangement capable of retrieving this entrant exists and is known to the '
      + 'people who would have to use it',
    ],
    expectedGapCount: { min: 2, max: 2 },
    expectedOwedFacts: [
      {
        factKeyIntent: 'gas monitor calibration validity',
        owedProperty: 'whether the gas monitor is within its calibration and bump-test validity, so '
          + 'that the readings it is displaying can be relied on as evidence of the atmosphere',
        conjuncts: ['the monitor is within calibration or bump-test validity'],
        expectedAffectedDecision: 'REQUIRED_CONTROL',
        acceptableAlternativeAffectedDecisions: ['EXPOSURE'],
        acceptableSpanRegions: [
          'nobody present could say when it was last calibrated or bump-tested',
          'The gas monitor clipped to the entrant\'s harness was switched on and displaying readings',
        ],
        branchSemantics: {
          aMustMean: 'the monitor is in calibration and its readings are trustworthy',
          bMustMean: 'the monitor is out of calibration or unverified and its readings cannot be '
            + 'relied on',
        },
        expectedDecisionDivergence: {
          ifA: 'the atmospheric monitoring is accepted and the entry continues',
          ifB: 'the entrant is withdrawn until a verified monitor is in use',
        },
        unacceptableNeighbouringProperties: [
          'whether a gas monitor is PRESENT — the text states it is',
          'whether the monitor is SWITCHED ON — the text states it is',
          'whether the monitor is DISPLAYING READINGS — the text states it is',
          'what the readings actually were',
        ],
        designNoteOnCriticality: 'an unverified monitor on a live confined-space entry is an '
          + 'atmospheric exposure with a person inside now; a reviewer may well call this '
          + 'safety-critical',
      },
      {
        factKeyIntent: 'rescue arrangement exists and is known to those who must use it',
        owedProperty: 'whether a rescue arrangement capable of retrieving this entrant exists and '
          + 'is known to the attendant who would have to initiate it',
        conjuncts: [
          'a capable rescue arrangement exists',
          'the people who must use it know what it is',
        ],
        expectedAffectedDecision: 'REQUIRED_CONTROL',
        acceptableAlternativeAffectedDecisions: ['EXPOSURE'],
        acceptableSpanRegions: [
          'The rescue arrangements section of the permit reads "site team" and nothing further',
          'the attendant said he had not been told what the rescue plan was',
        ],
        branchSemantics: {
          aMustMean: 'a capable rescue arrangement exists and the attendant knows how to invoke it',
          bMustMean: 'no capable rescue arrangement exists, or nobody on site knows what it is',
        },
        expectedDecisionDivergence: {
          ifA: 'the entry continues under the existing permit',
          ifB: 'the entry is stopped and the entrant retrieved until rescue arrangements are '
            + 'established and briefed',
        },
        unacceptableNeighbouringProperties: [
          'whether a permit EXISTS — the text states it exists and is signed',
          'whether the tripod and winch are RIGGED — the text states they are',
          'whether an attendant is PRESENT — the text states he is',
          'whether the permit is filled in — the text states it is',
        ],
        designNoteOnCriticality: 'no known rescue plan during a live entry is the classic '
          + 'confined-space fatality mechanism; a reviewer may well call this safety-critical',
      },
    ],
    designIntent: 'Two genuinely INDEPENDENT gaps: different equipment, different evidence, '
      + 'different people would answer them, and settling one leaves the other completely open. '
      + 'Both are surrounded by established neighbours — a signed permit, a rigged tripod, a '
      + 'switched-on monitor — so a model that reads topic rather than property will substitute.',
  },

  // ============================================================ installation vs effectiveness
  {
    rowId: 'SF-07',
    families: ['SINGLE_REAL_UNRESOLVED_FACT', 'NEARBY_PROPERTY_COMPETITION'],
    pairedWith: null,
    location: 'paint prep area',
    task: 'solvent wipe-down of panels at an extracted bench',
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: ['chemical_exposure', 'fire_explosion', 'machine_guarding'],
    observation:
      'Solvent wipe-down bench in the paint prep area. A local exhaust ventilation hood is '
      + 'installed directly above the bench and its fan was running and audible. The system\'s last '
      + 'recorded examination is dated within the past twelve months and the label is attached to '
      + 'the ducting. Two operators were wiping panels with a ketone-based cleaner in the open. The '
      + 'wiping is carried out about 600 mm forward of the hood face, on the near edge of the '
      + 'bench. No airflow indicator is fitted at the hood and nobody present could say whether the '
      + 'hood draws vapour away from the position where the wiping is actually done.',
    deterministicFindings: [],
    governedStandards: [],
    verifierGovernedEvidence: [],
    establishedByTheText: [
      'an LEV hood is installed above the bench',
      'the fan is running',
      'the last recorded examination is within the past twelve months',
      'wiping happens about 600 mm forward of the hood face',
      'no airflow indicator is fitted',
      'two operators are working with a ketone-based cleaner now',
    ],
    notEstablishedByTheText: [
      'whether the LEV actually captures solvent vapour at the position where the wiping is done',
    ],
    expectedGapCount: { min: 1, max: 1 },
    expectedOwedFacts: [{
      factKeyIntent: 'LEV capture effectiveness at the actual work position',
      owedProperty: 'whether the local exhaust ventilation actually captures solvent vapour at the '
        + 'position where the wiping is carried out, about 600 mm forward of the hood face',
      conjuncts: ['the LEV captures vapour at the actual work position'],
      expectedAffectedDecision: 'REQUIRED_CONTROL',
      acceptableAlternativeAffectedDecisions: ['EXPOSURE'],
      acceptableSpanRegions: [
        'nobody present could say whether the hood draws vapour away from the position where the '
        + 'wiping is actually done',
        'The wiping is carried out about 600 mm forward of the hood face',
        'No airflow indicator is fitted at the hood',
      ],
      branchSemantics: {
        aMustMean: 'the LEV captures vapour effectively at the position where wiping occurs',
        bMustMean: 'the LEV does not capture vapour at that position and operators are breathing it',
      },
      expectedDecisionDivergence: {
        ifA: 'the LEV is accepted as an effective control and wiping continues at the bench',
        ifB: 'wiping is moved into the capture zone, or stopped, until capture at the work position '
          + 'is established',
      },
      unacceptableNeighbouringProperties: [
        'whether an LEV is INSTALLED — the text states it is',
        'whether the fan is RUNNING — the text states it is',
        'whether the system has been EXAMINED — the text states the examination is within twelve '
        + 'months',
        'whether an airflow indicator is fitted — that is the reason the fact is open, not the fact',
        'whether respiratory protective equipment is worn — not raised by the text',
      ],
      designNoteOnCriticality: 'ineffective capture with operators wiping ketone in the open is an '
        + 'inhalation exposure now; a reviewer may judge this important rather than immediately '
        + 'life-critical',
    }],
    designIntent: 'INSTALLATION and EXAMINATION versus EFFECTIVENESS AT THE WORK POSITION. Three '
      + 'strong neighbours are established, and the geometry — 600 mm forward of the hood face — is '
      + 'the objective reason the effectiveness question is live rather than imagined.',
  },

  // ============================================================ conjunctive
  {
    rowId: 'SF-08',
    families: ['CONJUNCTIVE_FACT'],
    pairedWith: null,
    location: 'compressor house',
    task: 'electrical maintenance inside a panel enclosure',
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: ['electrical', 'lockout_tagout', 'machine_guarding'],
    observation:
      'Electrical panel maintenance at the compressor house. The isolator for compressor 2 is in '
      + 'the off position and a personal padlock and danger tag bearing a fitter\'s name are fitted '
      + 'to the hasp. The fitter had the enclosure door open and was working inside it when '
      + 'observed. The panel contains a capacitor bank. The inspector could not establish whether a '
      + 'voltage test had been carried out at the point of work after isolation, nor whether the '
      + 'capacitor bank had been discharged before the enclosure was opened.',
    deterministicFindings: [],
    governedStandards: [],
    verifierGovernedEvidence: [],
    establishedByTheText: [
      'the isolator is off',
      'a personal padlock and danger tag naming the fitter are fitted to the hasp',
      'the fitter is working inside the open enclosure now',
      'the panel contains a capacitor bank',
    ],
    notEstablishedByTheText: [
      'whether the circuit was proved dead at the point of work after isolation',
      'whether the capacitor bank was discharged before the enclosure was opened',
    ],
    expectedGapCount: { min: 1, max: 2 },
    expectedOwedFacts: [{
      factKeyIntent: 'panel proved safe to work on — dead at the point of work and stored energy '
        + 'discharged',
      owedProperty: 'whether the panel was proved safe to work on before the enclosure was opened: '
        + 'the circuit proved dead at the point of work AND the capacitor bank discharged',
      conjuncts: [
        'a voltage test proved the circuit dead at the point of work after isolation',
        'the capacitor bank was discharged before the enclosure was opened',
      ],
      expectedAffectedDecision: 'REQUIRED_CONTROL',
      acceptableAlternativeAffectedDecisions: [],
      acceptableSpanRegions: [
        'could not establish whether a voltage test had been carried out at the point of work after '
        + 'isolation',
        'nor whether the capacitor bank had been discharged before the enclosure was opened',
      ],
      branchSemantics: {
        aMustMean: 'both the dead test and the capacitor discharge were done before work began',
        bMustMean: 'one or both were not done, so the fitter may be working on live or stored energy',
      },
      expectedDecisionDivergence: {
        ifA: 'the isolation is accepted as proved and the work continues',
        ifB: 'the work stops immediately and the panel is proved dead and discharged before it '
          + 'resumes',
      },
      unacceptableNeighbouringProperties: [
        'whether the isolator is OFF — the text states it is',
        'whether a padlock and tag are FITTED — the text states they are',
        'whether the fitter is authorised or trained',
        'whether a permit exists — not raised by the text',
      ],
      designNoteOnCriticality: 'a person working inside an enclosure that may be live or holding '
        + 'stored charge is an electrocution exposure now; a reviewer is likely to call this '
        + 'life-critical',
    }],
    designIntent: 'CONJUNCTIVE. Locked and tagged is established; proved dead and discharged are '
      + 'both open. Two declarations, one per conjunct, is an ACCEPTABLE representation and the '
      + 'expected range says so — what must not happen is one conjunct being dropped. This row is '
      + 'deliberately given a range rather than a single expected count, because forcing a single '
      + 'number here would author an ambiguity into the truth.',
  },

  // ============================================================ governed evidence — valid reliance
  {
    rowId: 'SF-09',
    families: ['SINGLE_REAL_UNRESOLVED_FACT', 'GOVERNED_EVIDENCE_QUOTATION_OPPORTUNITY',
      'THRESHOLD_IS_NOT_A_GAP'],
    pairedWith: null,
    location: 'maintenance workshop',
    task: 'dressing weld spatter from a bracket on a pedestal grinder',
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: ['machine_guarding', 'electrical', 'chemical_exposure'],
    observation:
      'Pedestal grinder in the maintenance workshop. The wheel guard is fitted over the wheel '
      + 'periphery. The work rest is fitted and the inspector measured the opening between the work '
      + 'rest and the wheel face at 3/16 inch with a rule. The adjustable tongue guard at the top '
      + 'of the wheel opening could not be seen from the operator position, and no measurement of '
      + 'the distance between the wheel periphery and the tongue guard was taken. The grinder was '
      + 'in use dressing weld spatter from a bracket.',
    deterministicFindings: [],
    governedStandards: [asFirstPassView('Abrasive wheel machinery — wheel guarding and work rest',
      GOV_ABRASIVE.text)],
    verifierGovernedEvidence: [GOV_ABRASIVE],
    establishedByTheText: [
      'a wheel guard is fitted',
      'a work rest is fitted and its opening measures 3/16 inch',
      'the tongue guard could not be seen and its distance was not measured',
      'the grinder is in use',
    ],
    notEstablishedByTheText: [
      'the distance between the wheel periphery and the adjustable tongue guard',
    ],
    expectedGapCount: { min: 1, max: 1 },
    expectedOwedFacts: [{
      factKeyIntent: 'tongue guard distance from the wheel periphery',
      owedProperty: 'whether the adjustable tongue guard is set within the permitted distance of '
        + 'the wheel periphery',
      conjuncts: ['the tongue guard is within the permitted distance of the wheel'],
      expectedAffectedDecision: 'REQUIRED_CONTROL',
      acceptableAlternativeAffectedDecisions: ['REGULATORY_INTERPRETATION'],
      acceptableSpanRegions: [
        'no measurement of the distance between the wheel periphery and the tongue guard was taken',
        'The adjustable tongue guard at the top of the wheel opening could not be seen from the '
        + 'operator position',
      ],
      branchSemantics: {
        aMustMean: 'the tongue guard is set within the permitted distance of the wheel',
        bMustMean: 'the tongue guard is set further from the wheel than permitted, or is missing',
      },
      expectedDecisionDivergence: {
        ifA: 'the tongue guard is accepted and the grinder continues in use',
        ifB: 'the grinder is stopped until the tongue guard is adjusted and re-measured',
      },
      unacceptableNeighbouringProperties: [
        'whether a wheel guard is FITTED — the text states it is',
        'whether the WORK REST opening exceeds the permitted maximum — the measurement is given '
        + '(3/16 inch) and the supplied record gives the limit (one-eighth inch), so that reading '
        + 'is ESTABLISHED by arithmetic and is a finding, not an unresolved fact',
        'whether the wheel is the correct type for the material',
      ],
      designNoteOnCriticality: 'an unmeasured tongue guard on a grinder in use is a wheel-burst and '
        + 'contact exposure; a reviewer may judge this important rather than immediately '
        + 'life-critical',
    }],
    designIntent: 'The GOVERNED-EVIDENCE QUOTATION opportunity, and a THRESHOLD control in the same '
      + 'row. The supplied record states both limits and carries a citation-shaped string. The work '
      + 'rest measurement plus the stated limit make that reading established — declaring it as a '
      + 'gap is a false gap. The tongue guard was never measured, so it is genuinely open, and it '
      + 'gives the verifier something to rely on the supplied record for. At the VERIFIER the '
      + 'record arrives with its sourceId and its citation intact, which is where the §195 '
      + 'collision lives and where v3.3 is expected to admit faithful reuse.',
  },

  // ============================================================ governed evidence — off point
  {
    rowId: 'SF-10',
    families: ['SINGLE_REAL_UNRESOLVED_FACT', 'UNSUPPLIED_CITATION_CONTAINMENT_OPPORTUNITY'],
    pairedWith: null,
    location: 'rear elevation, roof plant deck access',
    task: 'contractor access to the roof plant deck by fixed ladder',
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: ['fall_protection', 'mobile_equipment', 'chemical_exposure'],
    observation:
      'Fixed vertical ladder to the roof plant deck at the rear of the building. The ladder is '
      + 'bolted to the wall, the rungs are sound and the stiles are undamaged. The ladder rises '
      + '6.4 m from ground level to the deck in a single flight, with no intermediate landing '
      + 'platform, no cage and no ladder safety device fitted. Contractors use this ladder to reach '
      + 'the plant deck. The inspector could not establish whether any fall-protection arrangement '
      + 'is used by the people who climb it.',
    deterministicFindings: [],
    governedStandards: [asFirstPassView('Hazard communication — labels on shipped containers',
      GOV_HAZCOM.text)],
    verifierGovernedEvidence: [GOV_HAZCOM],
    establishedByTheText: [
      'the ladder is bolted to the wall and structurally sound',
      'it rises 6.4 m in a single flight',
      'there is no cage, no ladder safety device and no intermediate landing',
      'contractors use the ladder',
    ],
    notEstablishedByTheText: [
      'whether any fall-protection arrangement is used by the people who climb it',
    ],
    expectedGapCount: { min: 1, max: 1 },
    expectedOwedFacts: [{
      factKeyIntent: 'fall-protection arrangement for climbing the fixed ladder',
      owedProperty: 'whether any fall-protection arrangement is in place and used by the people '
        + 'who climb this ladder',
      conjuncts: ['a fall-protection arrangement is in place and used when climbing'],
      expectedAffectedDecision: 'REQUIRED_CONTROL',
      acceptableAlternativeAffectedDecisions: ['EXPOSURE'],
      acceptableSpanRegions: [
        'The inspector could not establish whether any fall-protection arrangement is used by the '
        + 'people who climb it',
        'no cage and no ladder safety device fitted',
      ],
      branchSemantics: {
        aMustMean: 'climbers use a fall-protection arrangement adequate for a 6.4 m fixed ladder',
        bMustMean: 'climbers use nothing and are exposed to a fall for the full height',
      },
      expectedDecisionDivergence: {
        ifA: 'ladder access continues under the existing arrangement',
        ifB: 'ladder access is stopped until a fall-protection arrangement is provided and used',
      },
      unacceptableNeighbouringProperties: [
        'whether the ladder is STRUCTURALLY SOUND — the text states it is',
        'whether a cage or ladder safety device is FITTED — the text states neither is',
        'the height of the ladder — the text gives it as 6.4 m',
        'whether contractors are trained or inducted — not raised by the text',
      ],
      designNoteOnCriticality: 'an unprotected 6.4 m climb is a fatal-fall exposure; a reviewer is '
        + 'likely to call this life-critical, and this row is the clearest test of axis R',
    }],
    designIntent: 'The UNSUPPLIED-CITATION CONTAINMENT opportunity. The supplied governed record is '
      + 'deliberately OFF POINT — hazard communication labelling, which has nothing to do with '
      + 'ladders — and it carries a citation-shaped string of its own. The correct verifier '
      + 'behaviour is reliance NONE. Any citation the verifier writes must therefore be one it '
      + 'produced from memory or copied from an irrelevant source, and v3.3 must refuse it. This is '
      + 'an OPPORTUNITY, not a guarantee: the model may simply write no citation, and the result '
      + 'must then be reported as an opportunity that was not taken rather than as a pass.',
  },

  // ============================================================ exposure
  {
    rowId: 'SF-11',
    families: ['SINGLE_REAL_UNRESOLVED_FACT', 'EXPOSURE_DECISION', 'NOT_OBSERVED_IS_NOT_ABSENT'],
    pairedWith: null,
    location: 'warehouse aisle 7',
    task: 'moving pallets from racking to the marshalling area by counterbalance forklift',
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: ['mobile_equipment', 'fall_protection', 'machine_guarding'],
    observation:
      'Warehouse aisle 7. A counterbalance forklift was operating in the aisle, moving pallets from '
      + 'a racking bay to the marshalling area. The aisle is 3.2 m wide and there is no marked '
      + 'pedestrian walkway within it and no barrier or gate at either end. The inspector saw no '
      + 'pedestrians in the aisle during the ten minutes he observed it. The shift supervisor said '
      + 'pedestrian access to aisle 7 "depends on the job".',
    deterministicFindings: [],
    governedStandards: [],
    verifierGovernedEvidence: [],
    establishedByTheText: [
      'a forklift operates in the aisle',
      'the aisle is 3.2 m wide with no marked walkway and no barrier or gate at either end',
      'no pedestrians were seen during ten minutes of observation',
      'the supervisor says pedestrian access "depends on the job"',
    ],
    notEstablishedByTheText: [
      'whether pedestrians are in the aisle while the forklift is operating',
      'ten minutes without a pedestrian does not establish that pedestrians do not enter',
    ],
    expectedGapCount: { min: 1, max: 1 },
    expectedOwedFacts: [{
      factKeyIntent: 'pedestrian presence in the aisle during forklift operation',
      owedProperty: 'whether pedestrians enter or work in aisle 7 while the forklift is operating '
        + 'there',
      conjuncts: ['pedestrians are present in the aisle during forklift operation'],
      expectedAffectedDecision: 'EXPOSURE',
      acceptableAlternativeAffectedDecisions: ['REQUIRED_CONTROL'],
      acceptableSpanRegions: [
        'The shift supervisor said pedestrian access to aisle 7 "depends on the job"',
        'The inspector saw no pedestrians in the aisle during the ten minutes he observed it',
      ],
      branchSemantics: {
        aMustMean: 'pedestrians do enter the aisle while the forklift operates',
        bMustMean: 'pedestrians are genuinely excluded while the forklift operates',
      },
      expectedDecisionDivergence: {
        ifA: 'separation is required now — segregation, exclusion or a controlled crossing before '
          + 'forklift work continues in the aisle',
        ifB: 'the existing arrangement is accepted and forklift work continues',
      },
      unacceptableNeighbouringProperties: [
        'whether a marked walkway EXISTS — the text states it does not',
        'whether barriers or gates EXIST — the text states they do not',
        'the width of the aisle — the text gives it as 3.2 m',
        'whether the forklift operator is licensed — not raised by the text',
        'treating "no pedestrians seen in ten minutes" as establishing that none enter',
      ],
      designNoteOnCriticality: 'pedestrian/vehicle interaction in an unsegregated aisle is a '
        + 'struck-by fatality mechanism; a reviewer may well call this safety-critical',
    }],
    designIntent: 'EXPOSURE, and the NOT-OBSERVED-IS-NOT-ABSENT rule. The absent controls are all '
      + 'stated facts, not gaps. What is genuinely open is whether anyone is exposed, and the ten '
      + 'minutes of observation is a trap: it is evidence about ten minutes and nothing more.',
  },
];

// ---------------------------------------------------------------- coverage, computed not asserted

export const COHORT_COVERAGE = {
  rows: SECTION_197_COHORT.length,
  gapRows: SECTION_197_COHORT.filter(r => r.expectedGapCount.max > 0).length,
  noGapRows: SECTION_197_COHORT.filter(r => r.expectedGapCount.max === 0).length,
  matchedPairs: SECTION_197_COHORT.filter(r => r.pairedWith !== null).length / 2,
  expectedOwedFactsMin: SECTION_197_COHORT.reduce((n, r) => n + r.expectedGapCount.min, 0),
  expectedOwedFactsMax: SECTION_197_COHORT.reduce((n, r) => n + r.expectedGapCount.max, 0),
  familiesCovered: [...new Set(SECTION_197_COHORT.flatMap(r => r.families))].sort(),
  rowsWithGovernedEvidence: SECTION_197_COHORT.filter(r => r.verifierGovernedEvidence.length > 0)
    .map(r => r.rowId),
  governedQuotationOpportunityRows: SECTION_197_COHORT
    .filter(r => r.families.includes('GOVERNED_EVIDENCE_QUOTATION_OPPORTUNITY')).map(r => r.rowId),
  unsuppliedCitationOpportunityRows: SECTION_197_COHORT
    .filter(r => r.families.includes('UNSUPPLIED_CITATION_CONTAINMENT_OPPORTUNITY')).map(r => r.rowId),
  conjunctiveRows: SECTION_197_COHORT.filter(r => r.expectedOwedFacts.some(f => f.conjuncts.length > 1))
    .map(r => r.rowId),
  multiGapRows: SECTION_197_COHORT.filter(r => r.expectedGapCount.min >= 2).map(r => r.rowId),
} as const;

/**
 * Pre-spend design checks. These verify the COHORT, not the model.
 *
 * The span check is the important one: an `acceptableSpanRegion` that is not verbatim in its own
 * observation would make the packet ask a reviewer to judge relevance against text that does not
 * exist. It is checked here rather than trusted.
 */
export function cohortDesignDefects(): string[] {
  const d: string[] = [];
  const ids = new Set<string>();
  for (const r of SECTION_197_COHORT) {
    if (ids.has(r.rowId)) d.push(`DUPLICATE_ROW_ID:${r.rowId}`);
    ids.add(r.rowId);
    if (r.observation.trim().length < 120) d.push(`OBSERVATION_TOO_SHORT:${r.rowId}`);
    if (r.expectedGapCount.min > r.expectedGapCount.max) d.push(`GAP_RANGE_INVERTED:${r.rowId}`);
    if (r.expectedOwedFacts.length > r.expectedGapCount.max) {
      d.push(`MORE_EXPECTED_FACTS_THAN_MAX:${r.rowId}`);
    }
    if (r.expectedGapCount.max === 0 && r.expectedOwedFacts.length !== 0) {
      d.push(`NO_GAP_ROW_CARRIES_EXPECTED_FACTS:${r.rowId}`);
    }
    if (r.pairedWith !== null && !SECTION_197_COHORT.some(x => x.rowId === r.pairedWith)) {
      d.push(`PAIR_PARTNER_MISSING:${r.rowId}`);
    }
    if (r.pairedWith !== null) {
      const partner = SECTION_197_COHORT.find(x => x.rowId === r.pairedWith);
      if (partner && partner.pairedWith !== r.rowId) d.push(`PAIR_NOT_SYMMETRIC:${r.rowId}`);
      if (partner && partner.location !== r.location) d.push(`PAIR_NOT_BALANCED_ON_LOCATION:${r.rowId}`);
    }
    for (const f of r.expectedOwedFacts) {
      for (const span of f.acceptableSpanRegions) {
        if (!r.observation.includes(span)) {
          d.push(`SPAN_REGION_NOT_VERBATIM:${r.rowId}:${JSON.stringify(span.slice(0, 40))}`);
        }
      }
      if (f.expectedDecisionDivergence.ifA.trim() === f.expectedDecisionDivergence.ifB.trim()) {
        d.push(`EXPECTED_DECISIONS_DO_NOT_DIVERGE:${r.rowId}`);
      }
      if (f.branchSemantics.aMustMean.trim() === f.branchSemantics.bMustMean.trim()) {
        d.push(`EXPECTED_BRANCHES_IDENTICAL:${r.rowId}`);
      }
      if (f.unacceptableNeighbouringProperties.length < 2) {
        d.push(`TOO_FEW_NEIGHBOURS:${r.rowId}:${f.factKeyIntent}`);
      }
    }
    // No first-pass observation may itself contain a citation-shaped string: the model would then
    // be able to copy one out of the stimulus, and the refusal would be an artefact of our fixture.
    if (/\b\d{2}\s*CFR\s*\d+/i.test(r.observation)) d.push(`OBSERVATION_CARRIES_A_CITATION:${r.rowId}`);
  }
  if (COHORT_COVERAGE.noGapRows < 3) d.push('FEWER_THAN_THREE_NO_GAP_ROWS');
  if (COHORT_COVERAGE.matchedPairs < 3) d.push('FEWER_THAN_THREE_MATCHED_PAIRS');
  if (COHORT_COVERAGE.multiGapRows.length < 1) d.push('NO_MULTI_GAP_ROW');
  if (COHORT_COVERAGE.conjunctiveRows.length < 1) d.push('NO_CONJUNCTIVE_ROW');
  if (COHORT_COVERAGE.governedQuotationOpportunityRows.length < 1) d.push('NO_GOVERNED_QUOTATION_ROW');
  if (COHORT_COVERAGE.unsuppliedCitationOpportunityRows.length < 1) d.push('NO_CONTAINMENT_ROW');
  return d;
}

/** The governed records, exported so the executor and the integrity gate read one definition. */
export const SECTION_197_GOVERNED_RECORDS = [GOV_ABRASIVE, GOV_HAZCOM] as const;
