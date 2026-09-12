/**
 * EXPERT HAZLENZ -- DEVELOPMENT-ONLY fixtures for proving the cohort instrument's MECHANICS. §121.
 *
 * ==================== WHAT THESE MAY AND MAY NOT BE USED FOR ====================
 *
 * `EVALUATION_CORPUS_POLICY.development` is explicit: development material has unlimited re-use and
 * is "never a source of a gate result". These rows exist to prove that a scorer counts what it says
 * it counts. THEY MAY NOT PRODUCE A FORMAL EXPERT GATE RESULT, and nothing here is a measurement of
 * any model. Every "analysis" below is a hand-built object; no provider produced any of it.
 *
 * ==================== WHY THE ANALYSES ARE SYNTHETIC ====================
 *
 * A scorer trap has to be exact -- one candidate over a threshold, one clarification on a row that
 * owed none -- and a real model cannot be asked to produce an exact number of anything. Synthetic
 * outputs are the only way to assert that a numerator is 3 rather than 2. Using recorded model
 * output here would also risk exactly what §120 warned about: shaping the instrument around observed
 * behaviour.
 *
 * ==================== THE ROWS ====================
 *
 * Six rows, authored to cover the case classes the seventeen measures need as denominators. Each
 * partitions its `allowedHazardFamilies` exactly, so `validateCohortRow` passes and M02 is
 * mechanical. Two rows are deliberately INVALID and live in `INVALID_ROWS`, so the freeze-time check
 * can be shown to reject rather than merely be trusted.
 */

import {
  FORMAL_COHORT_ROW_CONTRACT_VERSION,
  type FormalCohortRow,
} from '../expert-cohort-contract';
import {
  EXPERT_ANALYSIS_CONTRACT_VERSION,
  type ExpertAnalysis, type ExpertHazardCandidate,
  type DecisionCriticalClarification, type CrossHazardInsight, type ExpertDisagreement,
} from '../expert-contract.types';
import type { CallArm, CallRecord, CohortRunRecord } from '../expert-measure-scorers';
import {
  mergeExpertIntelligence, verifyMergeInvariants,
  type DeterministicAuthorityResult, type GovernedAuthorityResult,
} from '../expert-authority-merge';

const row = (
  rowId: string,
  observation: string,
  allowed: string[],
  truth: FormalCohortRow['truth'],
  over: Partial<FormalCohortRow['source']> = {},
): FormalCohortRow => ({
  contractVersion: FORMAL_COHORT_ROW_CONTRACT_VERSION,
  source: {
    rowId,
    observation,
    inspectionContext: { location: 'Plant 2, bay 4', task: 'routine walkthrough' },
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: allowed,
    governedStandards: [],
    answeredClarifications: [],
    supplementaryContext: [],
    ...over,
  },
  truth,
});

const APPROVED_GUARDING = {
  citation: '29 CFR 1910.212(a)(1)',
  title: 'General requirements for all machines',
  approvedText:
    'One or more methods of machine guarding shall be provided to protect the operator and other '
    + 'employees in the machine area from hazards such as those created by point of operation, '
    + 'ingoing nip points, rotating parts, flying chips and sparks.',
  backingState: 'APPROVED',
};

const UNAPPROVED_ELECTRICAL = {
  citation: '29 CFR 1910.333(a)(1)',
  title: 'Selection and use of work practices',
  approvedText: null,
  backingState: 'DRAFT',
};

// ---------------------------------------------------------------- the six valid rows

/** V1 -- the full-opportunity row: present hazards, an interaction, a gap, an approved record. */
export const V1_FULL_OPPORTUNITY = row(
  'V1',
  'Operator was reaching into the point of operation of an unguarded press while the machine was '
  + 'running, and there was standing water across the floor around the energized control panel.',
  ['machine_guarding', 'electrical', 'fall_protection', 'confined_space'],
  {
    presentHazardFamilies: ['machine_guarding', 'electrical'],
    defensibleHazardFamilies: ['fall_protection'],
    forbiddenHazardFamilies: ['confined_space'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: ['machine_guarding'],
    decisionCriticalGaps: [
      {
        gapId: 'V1-G1',
        description: 'whether the press was de-energized and locked out before the reach-in',
        affectedDecision: 'REQUIRED_CONTROL',
      },
      {
        gapId: 'V1-G2',
        description: 'whether the standing water contacts the energized enclosure',
        affectedDecision: 'EXPOSURE',
      },
    ],
    recordedInteractions: [
      { interactionKind: 'ELECTRICAL_WET_ENVIRONMENT', participants: ['electrical', 'machine_guarding'] },
    ],
    authoringRationale:
      'Two independently sufficient hazards with a genuine wet/electrical interaction. Standing '
      + 'water plus an energized panel is a real interaction rather than two adjacent facts. '
      + 'fall_protection is defensible because standing water is a slip surface but no fall '
      + 'exposure is stated; confined_space is forbidden because nothing in the row describes one.',
  },
  { governedStandards: [APPROVED_GUARDING] },
);

/** V2 -- owes NO clarification. M10's denominator, and the negative control for asking. */
export const V2_NO_CLARIFICATION_OWED = row(
  'V2',
  'Fixed ladder to the mezzanine has a cage in place, all rungs intact, and the climb was observed '
  + 'from the floor with no worker on the ladder at the time.',
  ['fall_protection', 'machine_guarding'],
  {
    presentHazardFamilies: ['fall_protection'],
    defensibleHazardFamilies: [],
    forbiddenHazardFamilies: ['machine_guarding'],
    negatedOrSafeStateFamilies: ['fall_protection'],
    lifeCriticalHazardFamilies: [],
    decisionCriticalGaps: [],
    recordedInteractions: [],
    authoringRationale:
      'Everything a decision needs is stated: the cage is present, the rungs are intact, nobody was '
      + 'on it. A question here changes no decision, so the row owes none and any question is '
      + 'unnecessary by construction.',
  },
);

/** V3 -- the over-routing negative control: most of the vocabulary is forbidden. */
export const V3_NEGATIVE_CONTROL = row(
  'V3',
  'Housekeeping in the parts washer area was good; the washer was tagged out of service and empty, '
  + 'and no work was in progress.',
  ['chemical_exposure', 'lockout_tagout', 'confined_space', 'machine_guarding'],
  {
    presentHazardFamilies: [],
    defensibleHazardFamilies: ['lockout_tagout'],
    forbiddenHazardFamilies: ['chemical_exposure', 'confined_space', 'machine_guarding'],
    negatedOrSafeStateFamilies: ['chemical_exposure', 'lockout_tagout'],
    lifeCriticalHazardFamilies: [],
    decisionCriticalGaps: [],
    recordedInteractions: [],
    authoringRationale:
      'A clean, out-of-service, empty washer with no work in progress. Every family the vocabulary '
      + 'offers is either absent or affirmatively negated; lockout_tagout is defensible only '
      + 'because a tag is mentioned. A candidate here is a false positive.',
  },
);

/** V4 -- no governed record supplied. M06's excluded class. */
export const V4_NO_GOVERNED_RECORD = row(
  'V4',
  'Trench approximately six feet deep with vertical walls, no shoring or sloping visible, spoil pile '
  + 'at the edge, and a worker in the trench setting pipe.',
  ['confined_space', 'fall_protection', 'electrical'],
  {
    presentHazardFamilies: ['confined_space'],
    defensibleHazardFamilies: ['fall_protection'],
    forbiddenHazardFamilies: ['electrical'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: ['confined_space'],
    decisionCriticalGaps: [
      {
        gapId: 'V4-G1',
        description: 'the soil classification, which decides the required protective system',
        affectedDecision: 'REQUIRED_CONTROL',
      },
    ],
    recordedInteractions: [],
    authoringRationale:
      'A real excavation exposure with a life-critical consequence and one genuinely missing fact. '
      + 'No governed record is supplied, so this row must be excluded from M06 and must still '
      + 'contribute to M07 if the model makes a regulatory statement anyway.',
  },
);

/** V5 -- the recall opportunity: a present family the deterministic engine will not surface. */
export const V5_RECALL_OPPORTUNITY = row(
  'V5',
  'Portable grinder in use on the bench with the guard removed; the operator was not wearing eye '
  + 'protection and the extension cord ran through a doorway that was closed on it.',
  ['machine_guarding', 'electrical', 'chemical_exposure'],
  {
    presentHazardFamilies: ['machine_guarding', 'electrical'],
    defensibleHazardFamilies: [],
    forbiddenHazardFamilies: ['chemical_exposure'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: [],
    decisionCriticalGaps: [
      {
        gapId: 'V5-G1',
        description: 'whether the cord insulation is damaged where the door closed on it',
        affectedDecision: 'HAZARD_EXISTENCE',
      },
    ],
    recordedInteractions: [],
    authoringRationale:
      'The removed guard is unmissable; the pinched cord is the kind of secondary electrical '
      + 'exposure a pattern-based layer can miss. That gap is exactly where additive recall would '
      + 'show, which is what M01 exists to measure.',
  },
);

/** V6 -- a disagreement opportunity: the supplied record is not approved. */
export const V6_DISAGREEMENT_OPPORTUNITY = row(
  'V6',
  'Panel schedule shows a 480V feeder terminated in a junction box with the cover missing in a '
  + 'walkway used by maintenance staff.',
  ['electrical', 'fall_protection'],
  {
    presentHazardFamilies: ['electrical'],
    defensibleHazardFamilies: [],
    forbiddenHazardFamilies: ['fall_protection'],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: ['electrical'],
    decisionCriticalGaps: [
      {
        gapId: 'V6-G1',
        description: 'whether the feeder is energized at the time of the observation',
        affectedDecision: 'HAZARD_EXISTENCE',
      },
    ],
    recordedInteractions: [],
    authoringRationale:
      'A live exposure with an unapproved record supplied. Expert may reason about the record and '
      + 'may disagree with it; it may not treat a DRAFT record as approved, which is what the '
      + 'provenance invariants exist to catch.',
  },
  { governedStandards: [UNAPPROVED_ELECTRICAL] },
);

export const VALIDATION_ROWS: readonly FormalCohortRow[] = [
  V1_FULL_OPPORTUNITY, V2_NO_CLARIFICATION_OWED, V3_NEGATIVE_CONTROL,
  V4_NO_GOVERNED_RECORD, V5_RECALL_OPPORTUNITY, V6_DISAGREEMENT_OPPORTUNITY,
];

// ---------------------------------------------------------------- deliberately invalid rows

/** X1 -- a family in the vocabulary that no truth bucket claims. The totality rule must reject it. */
export const X1_INCOMPLETE_PARTITION = row(
  'X1', 'A press with no guard.',
  ['machine_guarding', 'electrical'],
  {
    presentHazardFamilies: ['machine_guarding'],
    defensibleHazardFamilies: [],
    forbiddenHazardFamilies: [],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: [],
    decisionCriticalGaps: [],
    recordedInteractions: [],
    authoringRationale: 'Deliberately incomplete: electrical is in no bucket.',
  },
);

/** X2 -- the same family in two buckets. Disjointness must reject it. */
export const X2_OVERLAPPING_BUCKETS = row(
  'X2', 'A press with no guard.',
  ['machine_guarding'],
  {
    presentHazardFamilies: ['machine_guarding'],
    defensibleHazardFamilies: ['machine_guarding'],
    forbiddenHazardFamilies: [],
    negatedOrSafeStateFamilies: [],
    lifeCriticalHazardFamilies: [],
    decisionCriticalGaps: [],
    recordedInteractions: [],
    authoringRationale: 'Deliberately overlapping.',
  },
);

export const INVALID_ROWS: readonly FormalCohortRow[] = [X1_INCOMPLETE_PARTITION, X2_OVERLAPPING_BUCKETS];

// ---------------------------------------------------------------- synthetic output builders

export function candidate(over: Partial<ExpertHazardCandidate> = {}): ExpertHazardCandidate {
  return {
    candidateKey: 'c1',
    hazardFamily: 'machine_guarding',
    assertedConditionState: 'ACTIVE',
    evidence: [],
    evidenceBasis: 'the observation describes an unguarded point of operation',
    reasoning: 'contact with the point of operation while the machine runs can amputate',
    confidence: 'HIGH',
    relationshipToDeterministic: 'AGREES_WITH_DETERMINISTIC',
    requiresUserConfirmation: false,
    ...over,
  };
}

export function clarification(over: Partial<DecisionCriticalClarification> = {}): DecisionCriticalClarification {
  return {
    clarificationId: 'q1',
    question: 'Was the press de-energized and locked out before the reach-in?',
    whyItMatters: 'it decides which control is required',
    affectedDecision: 'REQUIRED_CONTROL',
    criticality: 'BLOCKING',
    evidenceGap: 'the energy state at the moment of the reach-in is not stated',
    // §139: declared linkage is OPTIONAL, so the default fixture declares none.
    relatesToCandidateKey: null,
    ...over,
  };
}

export function insight(over: Partial<CrossHazardInsight> = {}): CrossHazardInsight {
  return {
    insightId: 'x1',
    interactionKind: 'ELECTRICAL_WET_ENVIRONMENT',
    participants: ['electrical', 'machine_guarding'],
    reasoning: 'standing water lowers contact resistance around the energized enclosure',
    confidence: 'MODERATE',
    ...over,
  };
}

export function disagreement(over: Partial<ExpertDisagreement> = {}): ExpertDisagreement {
  return {
    disagreementId: 'd1',
    target: 'DETERMINISTIC_RESULT',
    surface: 'DANGEROUS_AND_LIFE_CRITICAL_RETENTION',
    targetRef: null,
    disagreementType: 'MAY_BE_INCOMPLETE',
    reasoning: 'the deterministic set does not mention the pinched cord',
    confidence: 'MODERATE',
    recommendsReview: true,
    ...over,
  };
}

export function analysis(analysisId: string, over: Partial<ExpertAnalysis> = {}): ExpertAnalysis {
  return {
    contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
    analysisId,
    outcome: 'ANALYZED',
    expertHazardCandidates: [],
    decisionCriticalClarifications: [],
    crossHazardInsights: [],
    disagreements: [],
    expertExplanation: { summary: 'Two conditions were reviewed and one warrants a closer look.' },
    uncertainty: { statements: [] },
    ...over,
  };
}

// ---------------------------------------------------------------- synthetic run records

export interface CallSpec {
  arm?: CallArm;
  processId?: string;
  layerStatus?: string;
  failureKind?: string | null;
  analysis?: ExpertAnalysis | null;
  issues?: CallRecord['issues'];
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  /** Life-critical finding keys carried on the MERGE input. Never visible to a model. */
  lifeCriticalKeys?: string[];
  /** Deterministic findings supplied to the merge, so retention is a real check. */
  findingKeys?: string[];
  /** Force a merge that drops a finding, to prove M03/M04 catch it. */
  dropFindingsFromMerge?: boolean;
  /** Force a merged advisory carrying a citation-shaped string, to prove M05 catches survival. */
  smuggleCitationIntoMerge?: string;
}

/**
 * Build one call record, running the REAL merge and the REAL invariant verifier so M03, M04 and M08
 * are exercised against production code rather than against a stand-in.
 */
export function buildCall(rowSpec: FormalCohortRow, callId: string, spec: CallSpec = {}): CallRecord {
  const arm: CallArm = spec.arm ?? 'BASE';
  const layerStatus = spec.layerStatus ?? (spec.analysis ? 'PRESENT' : 'PRESENT');
  const findingKeys = spec.findingKeys ?? rowSpec.truth.presentHazardFamilies.map(f => `f-${f}`);
  const lifeCriticalKeys = spec.lifeCriticalKeys
    ?? rowSpec.truth.lifeCriticalHazardFamilies.map(f => `f-${f}`);

  const deterministic: DeterministicAuthorityResult = {
    analysisId: rowSpec.source.rowId,
    jurisdiction: rowSpec.source.jurisdiction,
    findings: findingKeys.map(key => ({
      findingKey: key,
      hazardFamily: key.replace(/^f-/, ''),
      conditionState: 'ACTIVE',
      isLifeCritical: lifeCriticalKeys.includes(key),
      isActionable: true,
      requiredActions: ['isolate the energy source'],
    })),
  };
  const governed: GovernedAuthorityResult = {
    knowledgeReleaseId: 'kr-validation-1',
    citations: rowSpec.source.governedStandards.map(g => ({
      findingKey: findingKeys[0] ?? 'f-none',
      citation: g.citation,
      backingState: g.backingState,
      governedProvenanceEligible: g.backingState === 'APPROVED',
      isApproved: g.backingState === 'APPROVED',
    })),
  };

  const analysisValue = spec.analysis ?? null;
  const merged = mergeExpertIntelligence(deterministic, governed, {
    status: layerStatus as never,
    validated: layerStatus === 'PRESENT' && analysisValue
      ? {
          analysis: analysisValue,
          validator: {
            inputContractVersion: 'hazlenz.expert.input.v1',
            analysisContractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
            validatorVersion: 'hazlenz.expert.validator.v1',
            validatedAt: '2026-08-31T00:00:00.000Z',
          },
        }
      : null,
    detail: layerStatus === 'PRESENT' ? null : (spec.failureKind ?? layerStatus),
  });

  // Trap injection happens AFTER the real merge, so the merge itself is never modified and the
  // invariant verifier is asked the same question production would ask it.
  if (spec.dropFindingsFromMerge) merged.authoritative = [];
  if (spec.smuggleCitationIntoMerge) {
    merged.expertAdvisory.uncertainty.statements.push(spec.smuggleCitationIntoMerge);
  }

  return {
    rowId: rowSpec.source.rowId,
    callId,
    arm,
    processId: spec.processId ?? 'proc-A',
    layerStatus,
    failureKind: spec.failureKind ?? null,
    issues: spec.issues ?? [],
    analysis: layerStatus === 'PRESENT' ? analysisValue : null,
    merged,
    mergeViolations: verifyMergeInvariants(merged, deterministic, governed),
    latencyMs: spec.latencyMs ?? 12000,
    inputTokens: spec.inputTokens ?? 9481,
    outputTokens: spec.outputTokens ?? 1279,
    costUsd: spec.costUsd ?? 0.031757,
    modelIdentity: 'validation-stand-in',
  };
}

export function buildRecord(
  rowSpec: FormalCohortRow,
  calls: CallSpec[],
  deterministicFamiliesEmitted: string[] = rowSpec.truth.presentHazardFamilies,
): CohortRunRecord {
  return {
    row: rowSpec,
    deterministicFamiliesEmitted: [...deterministicFamiliesEmitted],
    lifeCriticalFindingKeys: rowSpec.truth.lifeCriticalHazardFamilies.map(f => `f-${f}`),
    calls: calls.map((spec, i) => buildCall(rowSpec, `${rowSpec.source.rowId}-c${i + 1}`, spec)),
  };
}
