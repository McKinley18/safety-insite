/**
 * L3-1 -- reasoning contract, provider abstraction and deterministic validator.
 *
 * PURE. No database, no network, no provider, no inference. Every assertion is a property of the
 * contract itself.
 *
 * Usage: npx ts-node scripts/test-l31-reasoning-contract.ts
 */
import {
  L3_CONDITION_STATES, REASONING_INPUT_CONTRACT_VERSION, REASONING_PROPOSAL_CONTRACT_VERSION,
  type HazardCandidate, type ReasoningInput, type ReasoningProposal,
} from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';
import { validateReasoningProposal } from '../src/safescope-v2/reasoning-l3/deterministic-safety-validator';
import { L3_VALIDATOR_VERSION } from '../src/safescope-v2/reasoning-l3/validated-reasoning.types';
import { UnavailableReasoningProvider } from '../src/safescope-v2/reasoning-l3/unavailable-reasoning-provider';
import { isRetryableProviderFailure } from '../src/safescope-v2/reasoning-l3/hazlenz-reasoning-provider';
import { carriesHazardConclusion, isInfrastructureFailure, type L3ReasoningOutcome } from '../src/safescope-v2/reasoning-l3/reasoning-outcome';

let passed = 0, failed = 0;
const assert = (c: unknown, m: string) => { if (c) { passed++; console.log(`ok    ${m}`); } else { failed++; console.log(`FAIL  ${m}`); } };
const section = (t: string) => console.log(`\n--- ${t}`);

// RC-08's real sentence, so the negation rule is tested against the case that produced it.
const OBS = 'Employees were working within two feet of an unprotected leading edge approximately eighteen feet above grade with no guardrail, safety net or personal fall arrest system in use.';
const SRC = 'obs-1';
const span = (needle: string) => {
  const startOffset = OBS.indexOf(needle);
  if (startOffset < 0) throw new Error(`fixture error: '${needle}' not in observation`);
  return { sourceId: SRC, sourceType: 'observation' as const, startOffset, endOffset: startOffset + needle.length, quotedText: needle };
};

const input = (over: Partial<ReasoningInput> = {}): ReasoningInput => ({
  contractVersion: REASONING_INPUT_CONTRACT_VERSION,
  analysisId: 'a-1',
  authoritativeSources: [{ sourceId: SRC, sourceType: 'observation', text: OBS }],
  regulatoryContext: { value: 'osha-construction', provenance: 'USER_CONFIRMED' },
  allowedHazardFamilies: ['fall_protection', 'machine_guarding'],
  eligibleRegulatoryCandidates: [{ candidateId: 'cand-1', citation: '29 CFR 1926.501' }],
  ...over,
});

const candidate = (over: Partial<HazardCandidate> = {}): HazardCandidate => ({
  candidateKey: 'h1',
  hazardFamily: 'fall_protection',
  conditionState: 'ACTIVE',
  evidence: [span('no guardrail, safety net or personal fall arrest system in use')],
  conditionRationale: 'the observation states the systems are not in use',
  independentHazardRationale: 'single fall exposure',
  uncertainties: [],
  clarification: null,
  correctiveActionIntent: null,
  riskFactors: null,
  ...over,
});

const proposal = (over: Partial<ReasoningProposal> = {}): ReasoningProposal => ({
  contractVersion: REASONING_PROPOSAL_CONTRACT_VERSION,
  analysisId: 'a-1',
  outcome: 'ANALYZED',
  observationInterpretation: 'unprotected leading edge at height',
  hazardCandidates: [candidate()],
  jurisdictionProposal: null,
  ...over,
});
const codes = (r: ReturnType<typeof validateReasoningProposal>) => r.issues.map(i => i.code);

// ============================================================ 1 happy paths
section('1  valid proposals');
{
  const r = validateReasoningProposal(proposal(), input());
  assert(r.state === 'VALID' && r.validated !== null, '1.1 well-formed proposal validates');
  assert(r.validated?.hazards.length === 1, '1.2 validated result carries the hazard');
  // REBOUND BY L3-2i, not deleted (§35.7, §36.9). This assertion pinned the LITERAL
  // 'hazlenz.l3.validator.v1'. Its guarantee is that a validated result is STAMPED with the identity
  // of the validator that produced it -- and L3-2i legitimately advanced that identity to v2 when it
  // added the proposal-level clarification carrier to the validation surface. Pinned to the module's
  // own exported constant, the assertion now fails if the stamp goes missing or disagrees, and stops
  // failing merely because the validator was allowed to change.
  assert(r.validated?.validator.validatorVersion === L3_VALIDATOR_VERSION,
    '1.3 validator metadata is stamped with the validator\'s own version');
  assert(/^hazlenz\.l3\.validator\.v\d+$/.test(L3_VALIDATOR_VERSION),
    '1.3b ...and that version is a versioned identity, not free text');
}
{
  const r = validateReasoningProposal(proposal({ outcome: 'NO_HAZARD_ESTABLISHED', hazardCandidates: [] }), input());
  assert(r.state === 'VALID', '1.4 NO_HAZARD_ESTABLISHED with no candidates validates');
}
{
  const c = candidate({ conditionState: 'INSUFFICIENT_EVIDENCE', evidence: [] });
  const r = validateReasoningProposal(proposal({ outcome: 'INSUFFICIENT_EVIDENCE', hazardCandidates: [c] }), input());
  assert(r.state === 'VALID', '1.5 INSUFFICIENT_EVIDENCE may carry no evidence');
}

// ============================================================ 2 evidence binding, L3-INV-02/11
section('2  evidence binding (L3-INV-02, L3-INV-11)');
{
  const r = validateReasoningProposal(proposal({ hazardCandidates: [candidate({ evidence: [] })] }), input());
  assert(codes(r).includes('EVIDENCE_MISSING'), '2.1 ACTIVE with no evidence is rejected');
}
{
  const bad = { ...span('guardrail'), startOffset: 9000, endOffset: 9010 };
  const r = validateReasoningProposal(proposal({ hazardCandidates: [candidate({ evidence: [bad] })] }), input());
  assert(codes(r).includes('EVIDENCE_OUT_OF_BOUNDS'), '2.2 out-of-range span is rejected');
}
{
  const bad = { ...span('guardrail'), quotedText: 'a guardrail was provided' };
  const r = validateReasoningProposal(proposal({ hazardCandidates: [candidate({ evidence: [bad] })] }), input());
  assert(codes(r).includes('EVIDENCE_TEXT_MISMATCH'), '2.3 invented quotedText is rejected');
}
{
  const bad = { ...span('guardrail'), sourceId: 'nope' };
  const r = validateReasoningProposal(proposal({ hazardCandidates: [candidate({ evidence: [bad] })] }), input());
  assert(codes(r).includes('EVIDENCE_SOURCE_UNKNOWN'), '2.4 unknown sourceId is rejected');
}
{
  // THE RC-08 CASE: the span drops the governing "no".
  const r = validateReasoningProposal(proposal({ hazardCandidates: [candidate({ evidence: [span('guardrail, safety net or personal fall arrest system in use')] })] }), input());
  assert(codes(r).includes('EVIDENCE_NEGATION_SCOPE_TRUNCATED'), '2.5 RC-08: span excluding the governing "no" is rejected');
}

// ============================================================ 3 taxonomy + condition state
section('3  taxonomy and condition state (L3-INV-04)');
{
  const r = validateReasoningProposal(proposal({ hazardCandidates: [candidate({ hazardFamily: 'invented_family' })] }), input());
  assert(codes(r).includes('UNSUPPORTED_HAZARD_FAMILY'), '3.1 family outside the taxonomy is rejected');
}
{
  const r = validateReasoningProposal(proposal({ hazardCandidates: [candidate({ conditionState: 'PROBABLY_ACTIVE' as any })] }), input());
  assert(codes(r).includes('INVALID_CONDITION_STATE'), '3.2 unknown condition state is rejected');
}
{
  const c = candidate({ conditionState: 'UNKNOWN', evidence: [] });
  const r = validateReasoningProposal(proposal({ hazardCandidates: [c] }), input());
  assert(r.state === 'VALID' && r.validated?.hazards[0].conditionState === 'UNKNOWN',
    '3.3 UNKNOWN survives validation as UNKNOWN and is never promoted');
}
assert(!L3_CONDITION_STATES.some(s => (s as string) === 'DEFAULT'), '3.4 the state set has no default member');
{
  const c: any = candidate(); delete c.conditionState;
  const r = validateReasoningProposal(proposal({ hazardCandidates: [c] }), input());
  assert(codes(r).includes('INVALID_CONDITION_STATE') && r.validated === null,
    '3.5 a missing condition state never becomes ACTIVE');
}

// ============================================================ 4 regulatory, L3-INV-01/09
section('4  regulatory boundary (L3-INV-01, L3-INV-09)');
{
  const r = validateReasoningProposal(proposal({ hazardCandidates: [candidate({ regulatoryCandidateRefs: ['cand-1'] })] }), input());
  assert(r.state === 'VALID', '4.1 a supplied candidate id is accepted');
}
{
  const r = validateReasoningProposal(proposal({ hazardCandidates: [candidate({ regulatoryCandidateRefs: ['cand-999'] })] }), input());
  assert(codes(r).includes('UNSUPPORTED_REGULATORY_CANDIDATE_REFERENCE'), '4.2 unsupplied candidate id is rejected');
}
{
  const c: any = candidate(); c.citation = '29 CFR 1926.501(b)(1)';
  const r = validateReasoningProposal(proposal({ hazardCandidates: [c] }), input());
  assert(codes(r).includes('INVENTED_REGULATORY_CANDIDATE'), '4.3 a free-form citation string cannot enter');
}
{
  const c: any = candidate(); c.standardText = 'Each employee on a walking/working surface...';
  const r = validateReasoningProposal(proposal({ hazardCandidates: [c] }), input());
  assert(codes(r).includes('REGULATORY_TEXT_NOT_PERMITTED'), '4.4 regulatory text cannot enter the proposal');
}
{
  const r = validateReasoningProposal(proposal({ hazardCandidates: [candidate({ regulatoryCandidateRefs: ['cand-1'] })] }),
    input({ eligibleRegulatoryCandidates: [] }));
  assert(codes(r).includes('UNSUPPORTED_REGULATORY_CANDIDATE_REFERENCE'), '4.5 with no eligible set, no reference is permitted');
}

// ============================================================ 5 governance, L3-INV-03
section('5  governance boundary (L3-INV-03)');
for (const field of ['knowledgeReleaseId', 'reviewState', 'approvalDigest', 'backingStatus', 'verifiedText']) {
  const c: any = candidate(); c[field] = 'x';
  const r = validateReasoningProposal(proposal({ hazardCandidates: [c] }), input());
  assert(codes(r).includes('GOVERNANCE_FIELD_NOT_PERMITTED'), `5.x '${field}' is structurally refused`);
}
{
  const r = validateReasoningProposal(proposal({ jurisdictionProposal: { value: 'msha', provenance: 'USER_CONFIRMED' as any, basis: [] } }), input());
  assert(codes(r).includes('JURISDICTION_PROVENANCE_NOT_PERMITTED'), '5.6 a proposal cannot claim USER_CONFIRMED jurisdiction');
}

// ============================================================ 6 clarification + grounding
section('6  clarification and grounding (L3-INV-06)');
{
  const c = candidate({ clarification: { unresolvedFact: 'height', affectedDecision: 'condition_state', branches: ['above 6 ft', 'below 6 ft'], question: 'What was the height?' } });
  assert(validateReasoningProposal(proposal({ hazardCandidates: [c] }), input()).state === 'VALID', '6.1 a well-formed clarification validates');
}
{
  const c = candidate({ clarification: { unresolvedFact: '', affectedDecision: 'risk', branches: [], question: 'Can you tell me more?' } as any });
  assert(codes(validateReasoningProposal(proposal({ hazardCandidates: [c] }), input())).includes('INVALID_CLARIFICATION_DEPENDENCY'),
    '6.2 a vague question with no decision dependency is rejected');
}
{
  const c = candidate({ correctiveActionIntent: { objective: 'install guardrail', hierarchyLevel: 'engineering', groundedInEvidence: [] } });
  assert(codes(validateReasoningProposal(proposal({ hazardCandidates: [c] }), input())).includes('UNGROUNDED_CORRECTIVE_ACTION'),
    '6.3 an ungrounded corrective action is rejected');
}
{
  const foreign = { sourceId: SRC, sourceType: 'observation' as const, startOffset: 0, endOffset: 9, quotedText: OBS.slice(0, 9) };
  const c = candidate({ correctiveActionIntent: { objective: 'x', hierarchyLevel: 'ppe', groundedInEvidence: [foreign] } });
  assert(codes(validateReasoningProposal(proposal({ hazardCandidates: [c] }), input())).includes('UNGROUNDED_CORRECTIVE_ACTION'),
    '6.4 RC-05: an action grounded in evidence outside its own candidate is rejected');
}

// ============================================================ 7 outcome coherence + duplicates
section('7  outcome coherence (L3-INV-05) and duplicates');
{
  const r = validateReasoningProposal(proposal({ outcome: 'ANALYSIS_UNAVAILABLE' }), input());
  assert(codes(r).includes('UNAVAILABLE_CANNOT_CARRY_CANDIDATES'), '7.1 ANALYSIS_UNAVAILABLE cannot carry hazards');
}
{
  const r = validateReasoningProposal(proposal({ outcome: 'NO_HAZARD_ESTABLISHED' }), input());
  assert(codes(r).includes('OUTCOME_CANDIDATE_MISMATCH'), '7.2 NO_HAZARD_ESTABLISHED cannot carry an ACTIVE hazard');
}
{
  const r = validateReasoningProposal(proposal({ outcome: 'ANALYZED', hazardCandidates: [] }), input());
  assert(codes(r).includes('OUTCOME_CANDIDATE_MISMATCH'), '7.3 ANALYZED must carry at least one candidate');
}
{
  const r = validateReasoningProposal(proposal({ hazardCandidates: [candidate({ candidateKey: 'h1' }), candidate({ candidateKey: 'h2' })] }), input());
  assert(codes(r).includes('DUPLICATE_CANDIDATE'), '7.4 RC-07: identical family+state+evidence is a duplicate');
}

// ============================================================ 8 schema + version
section('8  schema and versioning (L3-INV-07)');
assert(validateReasoningProposal(null as any, input()).state === 'REJECTED_MODEL_OUTPUT', '8.1 a non-object proposal is rejected');
assert(codes(validateReasoningProposal(proposal({ contractVersion: 'v0' as any }), input())).includes('CONTRACT_VERSION_MISMATCH'), '8.2 wrong proposal contract version');
assert(codes(validateReasoningProposal(proposal({ analysisId: 'other' }), input())).includes('ANALYSIS_ID_MISMATCH'), '8.3 analysisId must match the input');

// ============================================================ 9 advisory signals, L3-INV-12
section('9  advisory signals cannot ground a finding (L3-INV-12)');
{
  const withSignal = input({ advisorySignals: [{ signalId: 's1', kind: 'lexical_family_hint', value: 'fall_protection' }] });
  const r = validateReasoningProposal(proposal({ hazardCandidates: [candidate({ evidence: [] })] }), withSignal);
  assert(r.state !== 'VALID' && codes(r).includes('EVIDENCE_MISSING'),
    '9.1 an advisory lexical hint does not substitute for evidence');
  assert(r.validated === null, '9.2 no validated finding arises from an advisory signal alone');
}

// ============================================================ 10 provider + safe failure
section('10  provider abstraction and safe failure (L3-INV-05, L3-INV-08, L3-INV-10)');
(async () => {
  const p = new UnavailableReasoningProvider();
  const r = await p.analyzeObservation(input());
  assert(r.ok === false && r.kind === 'UNAVAILABLE', '10.1 the only provider reports UNAVAILABLE');
  assert(!('proposal' in r), '10.2 the stub provider synthesizes no hazard');
  assert(isRetryableProviderFailure('TIMEOUT') && !isRetryableProviderFailure('PERMANENT_CONFIGURATION_ERROR'),
    '10.3 retryability is a property of the failure kind');

  const failures: L3ReasoningOutcome[] = [
    { kind: 'PROVIDER_UNAVAILABLE', failure: 'UNAVAILABLE', detail: '' },
    { kind: 'PROVIDER_TIMEOUT', detail: '' },
    { kind: 'MALFORMED_OUTPUT', detail: '' },
    { kind: 'REJECTED_OUTPUT', issues: [] },
  ];
  assert(failures.every(f => !carriesHazardConclusion(f)), '10.4 no infrastructure failure carries a hazard conclusion');
  assert(failures.every(f => isInfrastructureFailure(f)), '10.5 every failure is reportable as "analysis did not complete"');

  const rejected = validateReasoningProposal(proposal({ hazardCandidates: [candidate({ evidence: [] })] }), input());
  assert(rejected.validated === null, '10.6 a rejected proposal can never become a validated result');

  // ======================================================== 11 property / adversarial
  section('11  property-style boundaries');
  let allRejected = true;
  for (let i = 0; i < 60; i++) {
    const s = Math.floor(Math.random() * 4000) - 500;
    const e = s + Math.floor(Math.random() * 200) + 1;
    if (s >= 0 && e <= OBS.length) continue;
    const bad = { sourceId: SRC, sourceType: 'observation' as const, startOffset: s, endOffset: e, quotedText: 'x' };
    const r2 = validateReasoningProposal(proposal({ hazardCandidates: [candidate({ evidence: [bad] })] }), input());
    if (r2.state === 'VALID') allRejected = false;
  }
  assert(allRejected, '11.1 randomized out-of-range offsets always reject');

  let famRejected = true;
  for (const f of ['', ' ', 'Fall_Protection', 'fall protection', 'FALL_PROTECTION', 'electrical']) {
    const r3 = validateReasoningProposal(proposal({ hazardCandidates: [candidate({ hazardFamily: f })] }), input());
    if (r3.state === 'VALID') famRejected = false;
  }
  assert(famRejected, '11.2 near-miss family strings never validate');

  let citRejected = true;
  for (const c of ['1926.501', '29 CFR 1926.501', 'cand-1 ', 'CAND-1', '1910.147']) {
    const r4 = validateReasoningProposal(proposal({ hazardCandidates: [candidate({ regulatoryCandidateRefs: [c] })] }), input());
    if (r4.state === 'VALID') citRejected = false;
  }
  assert(citRejected, '11.3 citation-like strings never become a validated candidate reference');

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
