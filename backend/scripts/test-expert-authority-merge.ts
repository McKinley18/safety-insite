/**
 * EXPERT HAZLENZ -- the authority merge invariants.
 *
 * PURE. No database, no network, no provider, no inference.
 *
 * THE QUESTION THIS SUITE ANSWERS: can any Expert output, of any shape, in any failure mode, cause
 * a protected deterministic finding, a required action, a governed citation, an approval state or a
 * knowledge release id to change or disappear?
 *
 * It is answered ADVERSARIALLY. Section C does not send well-formed Expert output -- it sends
 * output that is actively trying to remove a life-critical finding, re-approve a rejected record
 * and rebind a release id, and asserts that the merged result is byte-identical to the merge with
 * no Expert layer at all.
 *
 * Run: npx ts-node scripts/test-expert-authority-merge.ts
 */
import {
  EMPTY_EXPERT_ADVISORY, EXPERT_LAYER_STATUSES, MERGE_INVARIANTS,
  mergeExpertIntelligence, verifyMergeInvariants,
  type DeterministicAuthorityResult, type ExpertLayerInput, type GovernedAuthorityResult,
} from '../src/safescope-v2/expert-hazlenz/expert-authority-merge';
import {
  EXPERT_ANALYSIS_CONTRACT_VERSION, EXPERT_INPUT_CONTRACT_VERSION, EXPERT_VALIDATOR_VERSION,
  type ExpertAnalysis, type ValidatedExpertAnalysis,
} from '../src/safescope-v2/expert-hazlenz/expert-contract.types';

let passed = 0, failed = 0;
const assert = (c: unknown, m: string) => { if (c) { passed++; console.log(`ok    ${m}`); } else { failed++; console.log(`FAIL  ${m}`); } };
const section = (t: string) => console.log(`\n--- ${t}`);

// ---------------------------------------------------------------- fixtures

/** A life-critical confined-space entry with four required actions -- the worst case to lose. */
const DETERMINISTIC: DeterministicAuthorityResult = {
  analysisId: 'a-1',
  jurisdiction: 'osha-general-industry',
  findings: [
    {
      findingKey: 'f1', hazardFamily: 'confined_space', conditionState: 'ACTIVE',
      isLifeCritical: true, isActionable: true,
      requiredActions: ['stop entry', 'test the atmosphere', 'post an attendant', 'rig retrieval'],
    },
    {
      findingKey: 'f2', hazardFamily: 'electrical', conditionState: 'ACTIVE',
      isLifeCritical: false, isActionable: true, requiredActions: ['close the cabinet'],
    },
  ],
};

const GOVERNED: GovernedAuthorityResult = {
  knowledgeReleaseId: 'federal-core-2026-08-28.1',
  citations: [
    { findingKey: 'f1', citation: 'REC-APPROVED', backingState: 'APPROVED_EXACT',
      governedProvenanceEligible: true, isApproved: true },
    { findingKey: 'f2', citation: 'REC-REJECTED', backingState: 'UNAPPROVED_RECORD',
      governedProvenanceEligible: false, isApproved: false },
  ],
};

const validated = (over: Partial<ExpertAnalysis> = {}): ValidatedExpertAnalysis => ({
  analysis: {
    contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
    analysisId: 'a-1',
    outcome: 'ANALYZED',
    expertHazardCandidates: [],
    decisionCriticalClarifications: [],
    crossHazardInsights: [],
    disagreements: [],
    expertExplanation: null,
    uncertainty: { statements: [] },
    ...over,
  },
  validator: {
    inputContractVersion: EXPERT_INPUT_CONTRACT_VERSION,
    analysisContractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
    validatorVersion: EXPERT_VALIDATOR_VERSION,
    validatedAt: '2026-08-29T00:00:00.000Z',
  },
});

const present = (over: Partial<ExpertAnalysis> = {}): ExpertLayerInput =>
  ({ status: 'PRESENT', validated: validated(over), detail: null });

const ABSENT: ExpertLayerInput = { status: 'NOT_CONFIGURED', validated: null, detail: 'no provider' };

/** The authoritative + governed halves only. Two merges are equivalent when these match. */
const protectedShape = (m: ReturnType<typeof mergeExpertIntelligence>) =>
  JSON.stringify({ a: m.authoritative, g: m.governed, j: m.jurisdiction });

(function main() {
  // =====================================================================================
  section('A. the baseline merge');
  // =====================================================================================

  const baseline = mergeExpertIntelligence(DETERMINISTIC, GOVERNED, ABSENT);
  assert(verifyMergeInvariants(baseline, DETERMINISTIC, GOVERNED).length === 0,
    'A.1 the no-Expert merge satisfies every invariant');
  assert(baseline.authoritative.length === 2
      && baseline.authoritative.every(f => f.source === 'DETERMINISTIC_AUTHORITY'),
    'A.2 deterministic findings carry DETERMINISTIC_AUTHORITY');
  assert(baseline.governed.source === 'GOVERNED_REGULATORY_AUTHORITY'
      && baseline.governed.citations.every(c => c.source === 'GOVERNED_REGULATORY_AUTHORITY'),
    'A.3 governed citations carry GOVERNED_REGULATORY_AUTHORITY');
  assert(baseline.expertAdvisory.source === 'EXPERT_ADVISORY',
    'A.4 the advisory block carries EXPERT_ADVISORY');
  assert(!('findings' in (baseline as unknown as Record<string, unknown>)),
    'A.5 there is NO combined findings array to flatten the three sources into');
  assert(baseline.expertLayer.status === 'NOT_CONFIGURED' && baseline.expertLayer.detail === 'no provider',
    'A.6 the Expert layer status is observable even when Expert did not run');
  assert(MERGE_INVARIANTS.length === 11, 'A.7 eleven merge invariants are declared');

  // =====================================================================================
  section('B. Expert adds -- the four additive capabilities');
  // =====================================================================================

  const additive = mergeExpertIntelligence(DETERMINISTIC, GOVERNED, present({
    expertHazardCandidates: [{
      candidateKey: 'e1', hazardFamily: 'atmospheric', assertedConditionState: 'UNKNOWN',
      evidence: [], evidenceBasis: 'b', reasoning: 'r', confidence: 'LOW',
      relationshipToDeterministic: 'ADDITIONAL_TO_DETERMINISTIC', requiresUserConfirmation: true,
    }],
    decisionCriticalClarifications: [{
      clarificationId: 'c1', question: 'q', whyItMatters: 'w',
      affectedDecision: 'EXPOSURE', criticality: 'IMPORTANT', evidenceGap: 'g',
    }],
    crossHazardInsights: [{
      insightId: 'x1', interactionKind: 'CONFINED_SPACE_ATMOSPHERIC',
      participants: ['confined_space', 'electrical'], reasoning: 'r', confidence: 'HIGH',
    }],
    disagreements: [{
      disagreementId: 'd1', target: 'DETERMINISTIC_RESULT', surface: 'HAZARD_RECOGNITION',
      targetRef: 'f2', disagreementType: 'MAY_BE_INCOMPLETE', reasoning: 'r',
      confidence: 'MODERATE', recommendsReview: false,
    }],
  }));

  assert(additive.expertAdvisory.hazardCandidates.length === 1, 'B.1 Expert may add an advisory candidate');
  assert(additive.expertAdvisory.clarifications.length === 1, 'B.2 Expert may add a clarification');
  assert(additive.expertAdvisory.crossHazardInsights.length === 1, 'B.3 Expert may add cross-hazard reasoning');
  assert(additive.expertAdvisory.disagreements.length === 1, 'B.4 Expert may add a disagreement');
  assert(verifyMergeInvariants(additive, DETERMINISTIC, GOVERNED).length === 0,
    'B.5 adding four things violates no invariant');
  assert(protectedShape(additive) === protectedShape(baseline),
    'B.6 the protected halves are IDENTICAL to the no-Expert merge');

  // =====================================================================================
  section('C. Expert cannot remove -- five failure shapes, adversarially');
  // =====================================================================================

  // Each of the five is a different thing to the evaluation plan and exactly one thing here.
  const shapes: Array<[string, ExpertLayerInput]> = [
    ['failure',       { status: 'PROVIDER_FAILED', validated: null, detail: 'HTTP_SERVER_ERROR: 503' }],
    ['timeout',       { status: 'PROVIDER_FAILED', validated: null, detail: 'TIMEOUT: 30s' }],
    ['malformed',     { status: 'OUTPUT_REJECTED', validated: null, detail: 'EVIDENCE_TEXT_MISMATCH' }],
    ['omission',      present({ outcome: 'NOTHING_TO_ADD' })],
    ['contradiction', present({
      disagreements: [{
        disagreementId: 'd1', target: 'DETERMINISTIC_RESULT',
        surface: 'DANGEROUS_AND_LIFE_CRITICAL_RETENTION', targetRef: 'f1',
        disagreementType: 'MAY_BE_OVERINCLUSIVE',
        reasoning: 'the confined-space finding should not be here at all',
        confidence: 'HIGH', recommendsReview: true,
      }],
    })],
  ];

  for (const [label, layer] of shapes) {
    const m = mergeExpertIntelligence(DETERMINISTIC, GOVERNED, layer);
    const violations = verifyMergeInvariants(m, DETERMINISTIC, GOVERNED);
    assert(violations.length === 0, `C.1 ${label}: no invariant violated`);
    assert(protectedShape(m) === protectedShape(baseline),
      `C.2 ${label}: the protected halves are byte-identical to the no-Expert merge`);
    const lifeCritical = m.authoritative.find(f => f.findingKey === 'f1');
    assert(!!lifeCritical && lifeCritical.isLifeCritical && lifeCritical.requiredActions.length === 4,
      `C.3 ${label}: the life-critical finding keeps all four required actions`);
    assert(m.governed.knowledgeReleaseId === 'federal-core-2026-08-28.1',
      `C.4 ${label}: the knowledge release id is unchanged`);
    assert(EXPERT_LAYER_STATUSES.includes(m.expertLayer.status),
      `C.5 ${label}: the layer status is a declared member and therefore observable`);
  }

  // The single strongest statement the suite makes: a HIGH-confidence Expert claim that the most
  // dangerous finding does not belong changes precisely nothing about it.
  const contradicting = mergeExpertIntelligence(DETERMINISTIC, GOVERNED, shapes[4][1]);
  assert(contradicting.expertAdvisory.disagreements.length === 1
      && contradicting.authoritative[0].findingKey === 'f1'
      && contradicting.authoritative[0].isLifeCritical,
    'C.6 a HIGH-confidence contradiction is RECORDED as advisory and the finding stands');

  // =====================================================================================
  section('D. governed provenance is untouchable');
  // =====================================================================================

  const noExpertGoverned = mergeExpertIntelligence(DETERMINISTIC, GOVERNED, ABSENT).governed;
  const withExpertGoverned = mergeExpertIntelligence(DETERMINISTIC, GOVERNED, present({
    disagreements: [{
      disagreementId: 'd1', target: 'GOVERNED_STANDARD', surface: 'GOVERNED_REGULATORY_CITATION',
      targetRef: 'REC-REJECTED', disagreementType: 'MAY_REQUIRE_CLOSER_REVIEW',
      reasoning: 'this record looks correct to me and should be relied on',
      confidence: 'HIGH', recommendsReview: true,
    }],
  })).governed;

  assert(JSON.stringify(noExpertGoverned) === JSON.stringify(withExpertGoverned),
    'D.1 an Expert opinion about a rejected record leaves the governed block identical');
  const rejected = withExpertGoverned.citations.find(c => c.citation === 'REC-REJECTED');
  assert(rejected?.isApproved === false && rejected?.governedProvenanceEligible === false,
    'D.2 an unapproved record is still unapproved and still provenance-ineligible');
  assert(withExpertGoverned.knowledgeReleaseId === GOVERNED.knowledgeReleaseId,
    'D.3 the release id is copied from the governed input, never from Expert');

  // A NULL release id -- the historical-null contract -- must also survive untouched.
  const nullRelease: GovernedAuthorityResult = { knowledgeReleaseId: null, citations: [] };
  const legacy = mergeExpertIntelligence(DETERMINISTIC, nullRelease, present());
  assert(legacy.governed.knowledgeReleaseId === null
      && verifyMergeInvariants(legacy, DETERMINISTIC, nullRelease).length === 0,
    'D.4 a NULL release id stays NULL -- Expert cannot back-fill history');

  // =====================================================================================
  section('E. the verifier itself detects a broken merge');
  // =====================================================================================

  // A verifier that always returns [] would make every assertion above vacuous. These four prove it
  // actually looks, by handing it merged objects that were tampered with after the merge.
  const tampered = mergeExpertIntelligence(DETERMINISTIC, GOVERNED, ABSENT);
  tampered.authoritative = tampered.authoritative.filter(f => f.findingKey !== 'f1');
  assert(verifyMergeInvariants(tampered, DETERMINISTIC, GOVERNED)
      .some(v => v.invariant === 'EXPERT_CANNOT_REMOVE_DETERMINISTIC_FINDING'),
    'E.1 a removed deterministic finding is detected');

  const actionStripped = mergeExpertIntelligence(DETERMINISTIC, GOVERNED, ABSENT);
  actionStripped.authoritative[0].requiredActions = ['stop entry'];
  assert(verifyMergeInvariants(actionStripped, DETERMINISTIC, GOVERNED)
      .some(v => v.invariant === 'EXPERT_CANNOT_REMOVE_REQUIRED_ACTION'),
    'E.2 a removed required action is detected');

  const rebound = mergeExpertIntelligence(DETERMINISTIC, GOVERNED, ABSENT);
  rebound.governed.knowledgeReleaseId = 'some-other-release';
  assert(verifyMergeInvariants(rebound, DETERMINISTIC, GOVERNED)
      .some(v => v.invariant === 'EXPERT_CANNOT_REBIND_KNOWLEDGE_RELEASE_ID'),
    'E.3 a rebound knowledge release id is detected');

  const promoted = mergeExpertIntelligence(DETERMINISTIC, GOVERNED, ABSENT);
  promoted.governed.citations[1].isApproved = true;
  assert(verifyMergeInvariants(promoted, DETERMINISTIC, GOVERNED)
      .some(v => v.invariant === 'EXPERT_CANNOT_APPROVE_AN_UNAPPROVED_RECORD'),
    'E.4 an unapproved record promoted to approved is detected');

  const downgraded = mergeExpertIntelligence(DETERMINISTIC, GOVERNED, ABSENT);
  downgraded.authoritative[0].isLifeCritical = false;
  assert(verifyMergeInvariants(downgraded, DETERMINISTIC, GOVERNED)
      .some(v => v.invariant === 'EXPERT_CANNOT_ALTER_DETERMINISTIC_FINDING'),
    'E.5 a life-critical flag flipped to false is detected');

  // =====================================================================================
  section('F. the merge does not mutate its inputs');
  // =====================================================================================

  const beforeD = JSON.stringify(DETERMINISTIC);
  const beforeG = JSON.stringify(GOVERNED);
  const m2 = mergeExpertIntelligence(DETERMINISTIC, GOVERNED, present());
  m2.authoritative[0].requiredActions.push('an action Expert invented');
  m2.governed.citations[0].citation = 'REC-CHANGED';
  assert(JSON.stringify(DETERMINISTIC) === beforeD,
    'F.1 mutating the merged result does not reach the deterministic input');
  assert(JSON.stringify(GOVERNED) === beforeG,
    'F.2 mutating the merged result does not reach the governed input');
  assert(EMPTY_EXPERT_ADVISORY.hazardCandidates.length === 0
      && EMPTY_EXPERT_ADVISORY.clarifications.length === 0,
    'F.3 the shared empty advisory constant is still empty after a run');

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
