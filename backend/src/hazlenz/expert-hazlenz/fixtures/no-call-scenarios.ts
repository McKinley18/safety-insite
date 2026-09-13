/**
 * EXPERT HAZLENZ -- the no-call scenario corpus.
 *
 * TEN SCENARIOS, ZERO PROVIDER CALLS. Every "provider response" here is a literal written into this
 * file. Nothing in this module or its imports opens a socket.
 *
 * WHY THESE TEN. They are the ten the authorization named, and each one exists to make a DIFFERENT
 * invariant falsifiable rather than to add coverage:
 *
 *   S01 single hazard              -- the ordinary case still works
 *   S02 multi-hazard               -- cross-hazard reasoning survives merge with two findings
 *   S03 negated / safe state       -- an Expert candidate on a safe state does not become a finding
 *   S04 zero candidates + question -- THE clarification-carrier case; a question with no hazard to
 *                                     ride on survives, because there is nothing to ride on
 *   S05 Expert-only candidate      -- additive candidate lands as advisory, not as authority
 *   S06 disagrees with Level-1     -- contradiction removes nothing
 *   S07 disagrees with governed    -- a governed challenge is evidence, never a re-approval
 *   S08 malformed output           -- rejected at the boundary; deterministic result intact
 *   S09 provider unavailable       -- fail open for the customer, fail closed for authority
 *   S10 life-critical + omission   -- the case where a silent Expert omission would be lethal
 *
 * Evidence spans are computed from the observation text with `indexOf`, so a fixture can never
 * carry an offset that does not resolve -- which would test the validator against a typo rather
 * than against a provider.
 */

import {
  EXPERT_ANALYSIS_CONTRACT_VERSION, EXPERT_INPUT_CONTRACT_VERSION,
  type ExpertAnalysisInput,
} from '../expert-contract.types';
import type {
  DeterministicAuthorityResult, GovernedAuthorityResult,
} from '../expert-authority-merge';
import type { ExpertProviderResult } from '../expert-provider';
import type { ReplayScript } from '../replay-expert-provider';

const FAMILIES = [
  'electrical', 'lockout_tagout', 'fall_protection', 'confined_space',
  'machine_guarding', 'chemical_exposure', 'mobile_equipment', 'wet_environment',
];

function span(text: string, needle: string, sourceId = 'obs-1') {
  const startOffset = text.indexOf(needle);
  if (startOffset < 0) throw new Error(`fixture error: '${needle}' not in observation`);
  return { sourceId, startOffset, endOffset: startOffset + needle.length, quotedText: needle };
}

function input(
  analysisId: string, observation: string,
  over: Partial<ExpertAnalysisInput> = {},
): ExpertAnalysisInput {
  return {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
    analysisId,
    authoritativeSources: [{ sourceId: 'obs-1', sourceType: 'observation', text: observation }],
    inspectionContext: { location: 'Plant 2 — pump room', task: 'routine walkthrough' },
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: FAMILIES,
    deterministicFindings: [],
    governedStandards: [],
    answeredClarifications: [],
    ...over,
  };
}

function analysis(analysisId: string, over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
    analysisId,
    outcome: 'ANALYZED',
    expertHazardCandidates: [],
    decisionCriticalClarifications: [],
    crossHazardInsights: [],
    disagreements: [],
    expertExplanation: null,
    uncertainty: { statements: [] },
    ...over,
  };
}

const success = (raw: unknown): ExpertProviderResult => ({ ok: true, raw, modelIdentity: null });

/** What a scenario is expected to produce, so the harness asserts rather than prints. */
export interface NoCallExpectation {
  /** The merged `expertLayer.status`. */
  layerStatus: 'PRESENT' | 'NOT_CONFIGURED' | 'PROVIDER_FAILED' | 'OUTPUT_REJECTED';
  /** Counts in the merged advisory block. */
  advisoryCandidates: number;
  advisoryClarifications: number;
  advisoryInsights: number;
  advisoryDisagreements: number;
  /** Normalization reason codes that MUST appear, in any order. */
  requiredIssueCodes: string[];
}

export interface NoCallScenario {
  id: string;
  title: string;
  observation: string;
  input: ExpertAnalysisInput;
  deterministic: DeterministicAuthorityResult;
  governed: GovernedAuthorityResult;
  script: ReplayScript;
  expect: NoCallExpectation;
}

const NO_GOVERNED: GovernedAuthorityResult = { knowledgeReleaseId: null, citations: [] };

// ------------------------------------------------------------------ S01

const OBS1 = 'A portable ladder was set at the wrong angle against the mezzanine with the top rail '
  + 'extending only six inches above the landing.';

const S01: NoCallScenario = {
  id: 'S01', title: 'single obvious hazard',
  observation: OBS1,
  input: input('a-s01', OBS1, {
    deterministicFindings: [{
      findingKey: 'f1', hazardFamily: 'fall_protection', conditionState: 'ACTIVE',
      isLifeCritical: false, isActionable: true,
      requiredActions: ['extend the ladder three feet above the landing'],
    }],
  }),
  deterministic: {
    analysisId: 'a-s01', jurisdiction: 'osha-general-industry',
    findings: [{
      findingKey: 'f1', hazardFamily: 'fall_protection', conditionState: 'ACTIVE',
      isLifeCritical: false, isActionable: true,
      requiredActions: ['extend the ladder three feet above the landing'],
    }],
  },
  governed: NO_GOVERNED,
  script: {
    results: [success(analysis('a-s01', {
      expertExplanation: {
        summary: 'The set-up angle and the short top extension are the same access problem seen twice.',
        whatMatters: ['a worker transitioning at the landing has nothing to hold'],
        whatIsMissing: [], howConditionsInteract: [],
      },
    }))],
  },
  expect: {
    layerStatus: 'PRESENT', advisoryCandidates: 0, advisoryClarifications: 0,
    advisoryInsights: 0, advisoryDisagreements: 0, requiredIssueCodes: [],
  },
};

// ------------------------------------------------------------------ S02

const OBS2 = 'An extension cord ran through standing water to a pump in the pit while a worker '
  + 'reached into the pump housing to clear a blockage.';

const S02: NoCallScenario = {
  id: 'S02', title: 'genuine multi-hazard observation with a cross-hazard interaction',
  observation: OBS2,
  input: input('a-s02', OBS2, {
    deterministicFindings: [
      { findingKey: 'f1', hazardFamily: 'electrical', conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true, requiredActions: ['de-energize and remove the cord from the water'] },
      { findingKey: 'f2', hazardFamily: 'lockout_tagout', conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true, requiredActions: ['isolate and lock out the pump before clearing'] },
    ],
  }),
  deterministic: {
    analysisId: 'a-s02', jurisdiction: 'osha-general-industry',
    findings: [
      { findingKey: 'f1', hazardFamily: 'electrical', conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true, requiredActions: ['de-energize and remove the cord from the water'] },
      { findingKey: 'f2', hazardFamily: 'lockout_tagout', conditionState: 'ACTIVE',
        isLifeCritical: true, isActionable: true, requiredActions: ['isolate and lock out the pump before clearing'] },
    ],
  },
  governed: NO_GOVERNED,
  script: {
    results: [success(analysis('a-s02', {
      crossHazardInsights: [{
        insightId: 'x1', interactionKind: 'ELECTRICAL_WET_ENVIRONMENT',
        participants: ['electrical', 'lockout_tagout'],
        reasoning: 'Standing water lowers the contact resistance that the isolation step assumes, '
          + 'so the two conditions are worse together than either is alone.',
        confidence: 'HIGH',
      }],
      expertExplanation: {
        summary: 'Two energy sources and a conductive floor around one worker.',
        whatMatters: ['the worker is the path to ground'],
        whatIsMissing: [],
        howConditionsInteract: ['water turns an electrical fault into an immediate contact hazard'],
      },
    }))],
  },
  expect: {
    layerStatus: 'PRESENT', advisoryCandidates: 0, advisoryClarifications: 0,
    advisoryInsights: 1, advisoryDisagreements: 0, requiredIssueCodes: [],
  },
};

// ------------------------------------------------------------------ S03

const OBS3 = 'The press was locked out with the supervisor tag applied and stored energy bled down '
  + 'and verified at zero before the guard was removed.';

const S03: NoCallScenario = {
  id: 'S03', title: 'negated / safe-state observation, Expert proposes a candidate anyway',
  observation: OBS3,
  input: input('a-s03', OBS3),
  deterministic: { analysisId: 'a-s03', jurisdiction: 'osha-general-industry', findings: [] },
  governed: NO_GOVERNED,
  script: {
    results: [success(analysis('a-s03', {
      outcome: 'ANALYZED',
      expertHazardCandidates: [{
        candidateKey: 'e1', hazardFamily: 'machine_guarding',
        assertedConditionState: 'CONTROLLED',
        groundingStatus: 'EXACT_QUOTE_SUPPLIED',
        evidence: [span(OBS3, 'the guard was removed')],
        evidenceBasis: 'the guard is off the machine',
        reasoning: 'Guard removal is described; the isolation makes it controlled rather than active.',
        confidence: 'LOW',
        relationshipToDeterministic: 'ADDITIONAL_TO_DETERMINISTIC',
        requiresUserConfirmation: true,
      }],
    }))],
  },
  // The candidate is ACCEPTED as advisory and the deterministic no-finding is UNCHANGED. The
  // evaluation plan scores this as a candidate false positive; the merge layer's job is only to
  // ensure it never became a finding.
  expect: {
    layerStatus: 'PRESENT', advisoryCandidates: 1, advisoryClarifications: 0,
    advisoryInsights: 0, advisoryDisagreements: 0, requiredIssueCodes: [],
  },
};

// ------------------------------------------------------------------ S04 -- the carrier case

const OBS4 = 'Two employees were working in the vault near the transformer bay.';

const S04: NoCallScenario = {
  id: 'S04', title: 'ZERO hazard candidates and a decision-critical clarification',
  observation: OBS4,
  input: input('a-s04', OBS4),
  deterministic: { analysisId: 'a-s04', jurisdiction: 'osha-general-industry', findings: [] },
  governed: NO_GOVERNED,
  script: {
    results: [success(analysis('a-s04', {
      outcome: 'INSUFFICIENT_EVIDENCE',
      expertHazardCandidates: [],          // <-- deliberately empty
      decisionCriticalClarifications: [{
        clarificationId: 'c1',
        question: 'Was the transformer bay de-energized and verified before entry?',
        whyItMatters: 'Entry to an energized vault and entry to an isolated one are different findings.',
        affectedDecision: 'HAZARD_EXISTENCE',
        criticality: 'BLOCKING',
        evidenceGap: 'the observation does not state the energization state of the bay',
      }],
      uncertainty: { statements: ['no energization state was recorded'] },
    }))],
  },
  expect: {
    layerStatus: 'PRESENT', advisoryCandidates: 0, advisoryClarifications: 1,
    advisoryInsights: 0, advisoryDisagreements: 0, requiredIssueCodes: [],
  },
};

// ------------------------------------------------------------------ S05

const OBS5 = 'Forklift traffic crossed the packing aisle where order pickers walk, and the aisle '
  + 'mirror at the blind corner was cracked and taped over.';

const S05: NoCallScenario = {
  id: 'S05', title: 'Expert-only plausible candidate the deterministic set missed',
  observation: OBS5,
  input: input('a-s05', OBS5, {
    deterministicFindings: [{
      findingKey: 'f1', hazardFamily: 'mobile_equipment', conditionState: 'ACTIVE',
      isLifeCritical: false, isActionable: true, requiredActions: ['restore the blind-corner mirror'],
    }],
  }),
  deterministic: {
    analysisId: 'a-s05', jurisdiction: 'osha-general-industry',
    findings: [{
      findingKey: 'f1', hazardFamily: 'mobile_equipment', conditionState: 'ACTIVE',
      isLifeCritical: false, isActionable: true, requiredActions: ['restore the blind-corner mirror'],
    }],
  },
  governed: NO_GOVERNED,
  script: {
    results: [success(analysis('a-s05', {
      expertHazardCandidates: [{
        candidateKey: 'e1', hazardFamily: 'machine_guarding',
        assertedConditionState: 'INSUFFICIENT_EVIDENCE',
        groundingStatus: 'EXACT_QUOTE_SUPPLIED',
        evidence: [span(OBS5, 'order pickers walk')],
        evidenceBasis: 'pedestrians share the travel path',
        reasoning: 'Separation of pedestrians from powered traffic is a distinct control from '
          + 'visibility, and no barrier or marked walkway is described.',
        confidence: 'MODERATE',
        relationshipToDeterministic: 'ADDITIONAL_TO_DETERMINISTIC',
        requiresUserConfirmation: true,
      }],
      crossHazardInsights: [{
        insightId: 'x1', interactionKind: 'MOBILE_EQUIPMENT_PEDESTRIAN',
        participants: ['mobile_equipment', 'machine_guarding'],
        reasoning: 'A degraded mirror matters more where pedestrians are not separated at all.',
        confidence: 'MODERATE',
      }],
    }))],
  },
  expect: {
    layerStatus: 'PRESENT', advisoryCandidates: 1, advisoryClarifications: 0,
    advisoryInsights: 1, advisoryDisagreements: 0, requiredIssueCodes: [],
  },
};

// ------------------------------------------------------------------ S06

const OBS6 = 'The guard interlock on the shear was bypassed with a magnet during setup.';

const S06: NoCallScenario = {
  id: 'S06', title: 'Expert disagrees with the deterministic condition state',
  observation: OBS6,
  input: input('a-s06', OBS6, {
    deterministicFindings: [{
      findingKey: 'f1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE',
      isLifeCritical: true, isActionable: true, requiredActions: ['remove the bypass and restore the interlock'],
    }],
  }),
  deterministic: {
    analysisId: 'a-s06', jurisdiction: 'osha-general-industry',
    findings: [{
      findingKey: 'f1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE',
      isLifeCritical: true, isActionable: true, requiredActions: ['remove the bypass and restore the interlock'],
    }],
  },
  governed: NO_GOVERNED,
  script: {
    results: [success(analysis('a-s06', {
      disagreements: [{
        disagreementId: 'd1', target: 'DETERMINISTIC_RESULT',
        surface: 'CONDITION_STATE_INTERPRETATION', targetRef: 'f1',
        disagreementType: 'MAY_BE_OVERINCLUSIVE',
        reasoning: 'The bypass is described as a setup-mode action; whether exposure persisted '
          + 'after setup is not stated.',
        confidence: 'LOW', recommendsReview: true,
      }],
    }))],
  },
  expect: {
    layerStatus: 'PRESENT', advisoryCandidates: 0, advisoryClarifications: 0,
    advisoryInsights: 0, advisoryDisagreements: 1, requiredIssueCodes: [],
  },
};

// ------------------------------------------------------------------ S07

const OBS7 = 'A haul truck was operated with a cracked rear-view mirror on the ramp.';

const S07: NoCallScenario = {
  id: 'S07', title: 'Expert disagrees with a governed interpretation; approval is untouched',
  observation: OBS7,
  input: input('a-s07', OBS7, {
    governedStandards: [{
      citation: 'GOVERNED-RECORD-1', title: 'rear visibility', approvedText: null,
      backingState: 'UNAPPROVED_RECORD',
    }],
    deterministicFindings: [{
      findingKey: 'f1', hazardFamily: 'mobile_equipment', conditionState: 'ACTIVE',
      isLifeCritical: false, isActionable: true, requiredActions: ['repair the mirror'],
    }],
  }),
  deterministic: {
    analysisId: 'a-s07', jurisdiction: 'osha-general-industry',
    findings: [{
      findingKey: 'f1', hazardFamily: 'mobile_equipment', conditionState: 'ACTIVE',
      isLifeCritical: false, isActionable: true, requiredActions: ['repair the mirror'],
    }],
  },
  governed: {
    knowledgeReleaseId: 'federal-core-2026-08-28.1',
    citations: [{
      findingKey: 'f1', citation: 'GOVERNED-RECORD-1', backingState: 'UNAPPROVED_RECORD',
      governedProvenanceEligible: false, isApproved: false,
    }],
  },
  script: {
    results: [success(analysis('a-s07', {
      disagreements: [{
        disagreementId: 'd1', target: 'GOVERNED_STANDARD',
        surface: 'GOVERNED_REGULATORY_CITATION', targetRef: 'GOVERNED-RECORD-1',
        disagreementType: 'MAY_REQUIRE_CLOSER_REVIEW',
        reasoning: 'The supplied record addresses rear visibility generally; whether it reaches a '
          + 'cracked mirror specifically is worth a reviewer look.',
        confidence: 'MODERATE', recommendsReview: true,
      }],
    }))],
  },
  expect: {
    layerStatus: 'PRESENT', advisoryCandidates: 0, advisoryClarifications: 0,
    advisoryInsights: 0, advisoryDisagreements: 1, requiredIssueCodes: [],
  },
};

// ------------------------------------------------------------------ S08

const OBS8 = 'A drum of solvent was left open beside the parts washer.';

const S08: NoCallScenario = {
  id: 'S08', title: 'malformed Expert output is rejected at the boundary',
  observation: OBS8,
  input: input('a-s08', OBS8, {
    deterministicFindings: [{
      findingKey: 'f1', hazardFamily: 'chemical_exposure', conditionState: 'ACTIVE',
      isLifeCritical: false, isActionable: true, requiredActions: ['close and label the drum'],
    }],
  }),
  deterministic: {
    analysisId: 'a-s08', jurisdiction: 'osha-general-industry',
    findings: [{
      findingKey: 'f1', hazardFamily: 'chemical_exposure', conditionState: 'ACTIVE',
      isLifeCritical: false, isActionable: true, requiredActions: ['close and label the drum'],
    }],
  },
  governed: NO_GOVERNED,
  script: {
    results: [success(analysis('a-s08', {
      expertHazardCandidates: [{
        candidateKey: 'e1', hazardFamily: 'chemical_exposure',
        assertedConditionState: 'ACTIVE',
        // The declaration is truthful about INTENT -- the producer claims it is quoting. What it
        // supplies does not resolve, so EVIDENCE_OUT_OF_BOUNDS still condemns the analysis exactly
        // as before. The §105 grounding rule sits BESIDE this check, it does not replace it.
        groundingStatus: 'EXACT_QUOTE_SUPPLIED',
        // A span that does not resolve: the classic fabricated-evidence shape.
        evidence: [{ sourceId: 'obs-1', startOffset: 5, endOffset: 40, quotedText: 'text that is not there' }],
        evidenceBasis: 'x', reasoning: 'y', confidence: 'HIGH',
        relationshipToDeterministic: 'AGREES_WITH_DETERMINISTIC', requiresUserConfirmation: false,
      }],
    }))],
  },
  expect: {
    layerStatus: 'OUTPUT_REJECTED', advisoryCandidates: 0, advisoryClarifications: 0,
    advisoryInsights: 0, advisoryDisagreements: 0,
    requiredIssueCodes: ['EVIDENCE_TEXT_MISMATCH'],
  },
};

// ------------------------------------------------------------------ S09

const OBS9 = 'Housekeeping debris blocked the exit route from the mixing room.';

const S09: NoCallScenario = {
  id: 'S09', title: 'provider unavailable; the inspection is unaffected',
  observation: OBS9,
  input: input('a-s09', OBS9),
  deterministic: {
    analysisId: 'a-s09', jurisdiction: 'osha-general-industry',
    findings: [{
      findingKey: 'f1', hazardFamily: 'machine_guarding', conditionState: 'ACTIVE',
      isLifeCritical: false, isActionable: true, requiredActions: ['clear the egress route'],
    }],
  },
  governed: NO_GOVERNED,
  script: { results: [{ ok: false, kind: 'NOT_CONFIGURED', detail: 'no provider configured' }] },
  expect: {
    layerStatus: 'NOT_CONFIGURED', advisoryCandidates: 0, advisoryClarifications: 0,
    advisoryInsights: 0, advisoryDisagreements: 0, requiredIssueCodes: [],
  },
};

// ------------------------------------------------------------------ S10

const OBS10 = 'A worker entered the digester through the side manway with no attendant, no '
  + 'atmospheric test and no retrieval line.';

const S10: NoCallScenario = {
  id: 'S10', title: 'life-critical deterministic hazard plus total Expert omission',
  observation: OBS10,
  input: input('a-s10', OBS10, {
    deterministicFindings: [{
      findingKey: 'f1', hazardFamily: 'confined_space', conditionState: 'ACTIVE',
      isLifeCritical: true, isActionable: true,
      requiredActions: ['stop entry', 'test the atmosphere', 'post an attendant', 'rig retrieval'],
    }],
  }),
  deterministic: {
    analysisId: 'a-s10', jurisdiction: 'osha-general-industry',
    findings: [{
      findingKey: 'f1', hazardFamily: 'confined_space', conditionState: 'ACTIVE',
      isLifeCritical: true, isActionable: true,
      requiredActions: ['stop entry', 'test the atmosphere', 'post an attendant', 'rig retrieval'],
    }],
  },
  governed: NO_GOVERNED,
  // The Expert layer says NOTHING about the most dangerous observation in the corpus. The merged
  // result must be indistinguishable, on the authoritative side, from S09 where it never ran.
  script: { results: [success(analysis('a-s10', { outcome: 'NOTHING_TO_ADD' }))] },
  expect: {
    layerStatus: 'PRESENT', advisoryCandidates: 0, advisoryClarifications: 0,
    advisoryInsights: 0, advisoryDisagreements: 0, requiredIssueCodes: [],
  },
};

export const NO_CALL_SCENARIOS: readonly NoCallScenario[] = [
  S01, S02, S03, S04, S05, S06, S07, S08, S09, S10,
];
