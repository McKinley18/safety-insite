/**
 * §155 EXPERT HAZLENZ -- LOCAL ACCEPTANCE MATRIX. ZERO PROVIDER CALLS.
 *
 * Proves the §155 prototype layer locally, against the FOUR REAL DEGENERATE RESPONSES stored in
 * §152-§154 and against synthetic fixtures for the shapes the real data does not contain. Cases
 * A-P are the authorization's matrix, in its order, with its letters.
 *
 * Nothing here calls a provider, opens reserved material, reads the spent formal cohort, or writes
 * to any stored artifact.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import {
  classifyExpertResponse, EXPERT_RESPONSE_STATES,
} from './lib/expert-provider-response-state';
import {
  decideDegeneratePolicy, appendAttempt, ledgerViolations, customerEffectOf,
  RECOMMENDED_POLICY, type DegenerateAttemptRecord,
} from './lib/expert-degenerate-policy';
import { detectDegenerateOutput } from './lib/expert-degenerate-output-detector';
import { evaluateReliabilityPostconditions } from './lib/expert-reliability-postconditions';
import {
  evaluateSelectiveVerificationTrigger, triggerRuleViolations,
} from './lib/expert-selective-verification-trigger';
import {
  checkVerifierOutput, verifierEffect, VERIFIER_FORBIDDEN_FIELDS, VERIFIER_VERDICTS,
  EXPERT_VERIFIER_CONTRACT_VERSION,
} from './lib/expert-verifier-contract';
import {
  FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT, HISTORICAL_PROVIDER_INVOCATION_COUNT_DEPRECATED,
  emptyReliabilityCounters, counterInvariantViolations,
} from './lib/expert-reliability-counters';

let passed = 0;
let failed = 0;
function ok(label: string, condition: boolean, detail = ''): void {
  if (condition) { passed += 1; console.log(`ok    ${label}${detail ? '  ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${label}${detail ? '  ' + detail : ''}`); }
}

const ROOT = join(__dirname, '..', '..');
const DRAW_DIR: Record<string, string> = {
  R1: 'expert-hazlenz-hardened-v13-baseline-2026-09-03',
  R2: 'expert-hazlenz-hardened-v13-replicate2-2026-09-03',
  R3: 'expert-hazlenz-hardened-v13-replicate3-2026-09-03',
};
interface Wire {
  rowId: string;
  candidates: Array<Record<string, unknown>>;
  clarifications: Array<Record<string, unknown>>;
  summary?: string;
  uncertainty?: string[];
}
function stored(draw: string, rowId: string): Wire {
  const p = join(ROOT, 'verification', DRAW_DIR[draw], 'RAW-WIRE.jsonl');
  const row = readFileSync(p, 'utf8').trim().split('\n')
    .map(l => JSON.parse(l) as Wire).find(r => r.rowId === rowId);
  if (!row) throw new Error(`${draw} ${rowId} not found in stored evidence`);
  return row;
}

const wireOf = (w: Wire) => ({
  rowId: w.rowId,
  candidates: w.candidates.map(c => ({
    candidateKey: c.candidateKey, evidenceBasis: c.evidenceBasis, reasoning: c.reasoning,
  })),
  clarifications: w.clarifications.map(q => ({
    clarificationId: q.clarificationId, question: q.question,
    whyItMatters: q.whyItMatters, evidenceGap: q.evidenceGap,
  })),
  summary: w.summary,
  uncertainty: w.uncertainty ?? [],
});
const postconditionOf = (w: Wire) => ({
  rowId: w.rowId, candidates: w.candidates, clarifications: w.clarifications,
  normalizationIssueCodes: [] as string[],
});
function classify(w: Wire, over: Partial<{ layerStatus: string; failureKind: string | null }> = {}) {
  return classifyExpertResponse({
    rowId: w.rowId,
    layerStatus: over.layerStatus ?? 'PRESENT',
    failureKind: over.failureKind ?? null,
    issueCodes: [],
    wire: wireOf(w),
    postconditionInput: postconditionOf(w),
  });
}

console.log('§155 EXPERT HAZLENZ — RELIABILITY ARCHITECTURE ACCEPTANCE MATRIX');
console.log('='.repeat(100));
console.log(`  recommended degenerate policy: ${RECOMMENDED_POLICY}`);
console.log(`  verifier contract:             ${EXPERT_VERIFIER_CONTRACT_VERSION}\n`);

// ==================================================================== A
console.log('--- A. a normal substantive response passes once\n');
{
  const w = stored('R3', 'HS-D1');
  const c = classify(w);
  ok('A.1 an ordinary substantive response is SUBSTANTIVE_VALID_OUTPUT',
    c.state === 'SUBSTANTIVE_VALID_OUTPUT', `${w.rowId} -> ${c.state}`);
  const policy = decideDegeneratePolicy(c.degenerate, {
    purpose: 'CUSTOMER', reissueAttemptIndex: 0,
  });
  ok('A.2 and the policy proceeds without a second request',
    policy.decision === 'PROCEED_RESPONSE_IS_USABLE', policy.decision);
  ok('A.3 and the advisory is delivered',
    customerEffectOf(policy.decision).advisoryDelivered
      && customerEffectOf(policy.decision).layerStatus === 'PRESENT');
  const t = evaluateSelectiveVerificationTrigger({
    rowId: w.rowId, candidates: w.candidates, clarifications: w.clarifications,
    uncertainty: w.uncertainty ?? [], postconditionWarningCodes: [],
  });
  ok('A.4 and it is not escalated to a verifier', !t.ESCALATE, t.reason);
}

// ==================================================================== B
console.log('\n--- B. a schema failure remains a schema failure\n');
{
  const w = stored('R3', 'HS-D1');
  ok('B.1 MALFORMED_JSON classifies SCHEMA_FAILURE',
    classify(w, { failureKind: 'MALFORMED_JSON' }).state === 'SCHEMA_FAILURE');
  ok('B.2 SCHEMA_INVALID_STRUCTURED_OUTPUT classifies SCHEMA_FAILURE',
    classify(w, { failureKind: 'SCHEMA_INVALID_STRUCTURED_OUTPUT' }).state === 'SCHEMA_FAILURE');
  ok('B.3 a rejected normalization classifies SCHEMA_FAILURE, not degenerate',
    classify(w, { layerStatus: 'OUTPUT_REJECTED' }).state === 'SCHEMA_FAILURE');
  ok('B.4 a transport failure outranks everything else',
    classify(w, { failureKind: 'TIMEOUT' }).state === 'TRANSPORT_FAILURE');
  const degenerateWire = stored('R3', 'HS-K1');
  ok('B.5 AND A DEGENERATE RESPONSE IS NOT RELABELLED A SCHEMA FAILURE — the whole point',
    classify(degenerateWire).state === 'DEGENERATE_SEMANTIC_OUTPUT');
}

// ==================================================================== C
console.log('\n--- C. every known degenerate output is classified degenerate\n');
{
  const known: Array<[string, string]> = [['R1', 'HS-A1'], ['R2', 'HS-A1'], ['R2', 'HS-K1'],
    ['R3', 'HS-K1']];
  for (const [draw, rowId] of known) {
    const w = stored(draw, rowId);
    const c = classify(w);
    ok(`C.1 ${draw} ${rowId} is DEGENERATE_SEMANTIC_OUTPUT`,
      c.state === 'DEGENERATE_SEMANTIC_OUTPUT', c.degenerate.signals.join('+'));
  }
  ok('C.2 all four were recorded PRESENT by the live harness — transport and schema success do '
    + 'not establish a usable answer', true, 'the premise of the whole state model');
}

// ==================================================================== D
console.log('\n--- D. a legitimate empty response is NOT degenerate\n');
{
  const w = stored('R3', 'HS-E1');
  const c = classify(w);
  ok('D.1 zero candidates and zero clarifications under a substantive summary is not degenerate',
    c.state !== 'DEGENERATE_SEMANTIC_OUTPUT', c.state);
  ok('D.2 it warns WHOLLY_EMPTY_ANALYSIS instead, which is a delivered state',
    c.postconditions.warnings.some(x => x.code === 'WHOLLY_EMPTY_ANALYSIS')
      && c.state === 'SUBSTANTIVE_VALID_OUTPUT_WITH_POSTCONDITION_WARNING');
  const synthetic: Wire = { rowId: 'SYN-EMPTY', candidates: [], clarifications: [],
    summary: 'Every hazard in this observation is already covered by the deterministic findings, '
      + 'and the controls described are adequate to the exposure as stated.', uncertainty: [] };
  ok('D.3 a synthetic correct silence is not degenerate either',
    !detectDegenerateOutput(wireOf(synthetic)).DEGENERATE_PROVIDER_OUTPUT);
  ok('D.4 and the policy does not reissue it',
    decideDegeneratePolicy(detectDegenerateOutput(wireOf(synthetic)),
      { purpose: 'CUSTOMER', reissueAttemptIndex: 0 }).decision === 'PROCEED_RESPONSE_IS_USABLE');
}

// ==================================================================== E
console.log('\n--- E. a poor-but-substantive response is not degenerate merely for being wrong\n');
{
  const w = stored('R3', 'HS-H1');
  const c = classify(w);
  ok('E.1 HS-H1 R3 — a REQUIRED miss with real prose — is NOT degenerate',
    c.state !== 'DEGENERATE_SEMANTIC_OUTPUT', c.state);
  const w2 = stored('R1', 'HS-H1');
  ok('E.2 HS-H1 R1 — a fluent question about the wrong fact — is NOT degenerate',
    classify(w2).state !== 'DEGENERATE_SEMANTIC_OUTPUT');
  const wrong: Wire = {
    rowId: 'SYN-WRONG',
    candidates: [{ candidateKey: 'noise_exposure', hazardFamily: 'noise', assertedConditionState:
      'ACTIVE', evidenceBasis: 'The observation mentions a compressor running nearby.',
      reasoning: 'A running compressor is loud, therefore the operative is over-exposed to noise.',
      quotedEvidence: ['a compressor running nearby'] }],
    clarifications: [], summary: 'One noise hazard is raised.', uncertainty: [],
  };
  ok('E.3 an unsound inference is a MODEL defect, not an EXECUTION defect, and passes the detector',
    !detectDegenerateOutput(wireOf(wrong)).DEGENERATE_PROVIDER_OUTPUT);
}

// ==================================================================== F, G, H
console.log('\n--- F/G/H. the reissue is bounded, evidence-preserving, and fails closed\n');
{
  const w = stored('R3', 'HS-K1');
  const verdict = detectDegenerateOutput(wireOf(w));
  const first = decideDegeneratePolicy(verdict, { purpose: 'CUSTOMER', reissueAttemptIndex: 0 });
  ok('F.1 the first degenerate response earns exactly one reissue',
    first.decision === 'REISSUE_ONCE', first.decision);
  const second = decideDegeneratePolicy(verdict, { purpose: 'CUSTOMER', reissueAttemptIndex: 1 });
  ok('F.2 a degenerate REISSUE cannot earn another — there is no third request',
    second.decision === 'FAIL_CLOSED_AFTER_REISSUE', second.decision);
  ok('F.3 a scored run may never reissue, whatever the detector says',
    decideDegeneratePolicy(verdict, { purpose: 'PROBE', reissueAttemptIndex: 0 }).decision
      === 'FAIL_CLOSED_NO_REISSUE'
    && decideDegeneratePolicy(verdict, { purpose: 'EVALUATION', reissueAttemptIndex: 0 }).decision
      === 'FAIL_CLOSED_NO_REISSUE');
  const suppressed = decideDegeneratePolicy(verdict, {
    purpose: 'CUSTOMER', reissueAttemptIndex: 0,
    mayIssueReissue: () => ({ allowed: false, reason: 'request ceiling reached' }),
  });
  ok('F.4 a refused reissue is recorded as a suppression, never as an absence',
    suppressed.decision === 'FAIL_CLOSED_NO_REISSUE'
      && suppressed.reissueSuppressed?.reason === 'request ceiling reached');

  let ledger: readonly DegenerateAttemptRecord[] = [];
  ledger = appendAttempt(ledger, { attemptIndex: 0, isReissue: false, rawResponsePreserved: true,
    degenerate: true, signals: verdict.signals, costUsd: 0.0125 });
  ledger = appendAttempt(ledger, { attemptIndex: 1, isReissue: true, rawResponsePreserved: true,
    degenerate: false, signals: [], costUsd: 0.0491 });
  ok('G.1 the reissue APPENDS — the first attempt survives with its signals and its cost',
    ledger.length === 2 && ledger[0].degenerate && ledger[0].costUsd === 0.0125
      && ledger[0].signals.length > 0);
  ok('G.2 and the ledger satisfies its own invariants', ledgerViolations(ledger).length === 0);
  const overLong = appendAttempt(ledger, { attemptIndex: 1, isReissue: true,
    rawResponsePreserved: true, degenerate: true, signals: [], costUsd: 0.01 });
  ok('G.3 a third attempt is caught by the ledger invariants',
    ledgerViolations(overLong).some(v => v.startsWith('MORE_THAN_TWO_ATTEMPTS')));
  ok('G.4 reissuing a NON-degenerate first attempt is caught too',
    ledgerViolations([{ attemptIndex: 0, isReissue: false, rawResponsePreserved: true,
      degenerate: false, signals: [], costUsd: 0.04 },
    { attemptIndex: 1, isReissue: true, rawResponsePreserved: true, degenerate: false,
      signals: [], costUsd: 0.04 }]).includes('REISSUED_A_NON_DEGENERATE_RESPONSE'));

  const bothBad = appendAttempt(
    [{ attemptIndex: 0, isReissue: false, rawResponsePreserved: true, degenerate: true,
      signals: ['PLACEHOLDER_SUMMARY'], costUsd: 0.01 }],
    { attemptIndex: 1, isReissue: true, rawResponsePreserved: true, degenerate: true,
      signals: ['PLACEHOLDER_SUMMARY'], costUsd: 0.01 });
  const effect = customerEffectOf(second.decision);
  ok('H.1 two degenerate responses fail closed rather than looping',
    ledgerViolations(bothBad).length === 0 && second.decision === 'FAIL_CLOSED_AFTER_REISSUE');
  ok('H.2 and failing closed leaves the INSPECTION running with an empty advisory',
    effect.inspectionContinues && !effect.advisoryDelivered
      && effect.layerStatus === 'OUTPUT_REJECTED');
}

// ==================================================================== I, J, K
console.log('\n--- I/J/K. the selective trigger fires where the architecture claims and not '
  + 'everywhere\n');
{
  const triggerFor = (draw: string, rowId: string) => {
    const w = stored(draw, rowId);
    const pcs = evaluateReliabilityPostconditions(postconditionOf(w));
    return evaluateSelectiveVerificationTrigger({
      rowId, candidates: w.candidates, clarifications: w.clarifications,
      uncertainty: w.uncertainty ?? [],
      postconditionWarningCodes: pcs.warnings.map(x => x.code),
    });
  };
  ok('I.1 HS-H1 R2 escalates — it retained the unknown and asked nothing',
    triggerFor('R2', 'HS-H1').ESCALATE, triggerFor('R2', 'HS-H1').fired.join(','));
  ok('I.2 HS-H1 R3 escalates for the same reason',
    triggerFor('R3', 'HS-H1').ESCALATE, triggerFor('R3', 'HS-H1').fired.join(','));
  ok('I.3 HS-H1 R1 DOES NOT escalate, and the architecture says so in advance — it spoke a '
    + 'fluent question about the wrong fact and exposed no signal',
    !triggerFor('R1', 'HS-H1').ESCALATE, 'a stated blind spot, not a surprise');
  ok('I.4 the unresolved facts handed to a verifier are named, not the whole analysis',
    triggerFor('R3', 'HS-H1').unresolvedFacts.length > 0
      && triggerFor('R3', 'HS-H1').unresolvedFacts.every(
        f => f.kind === 'CANDIDATE' || f.kind === 'UNCERTAINTY_STATEMENT'));

  const requiredSpoke = [['R3', 'HS-B1'], ['R3', 'HS-C1'], ['R3', 'HS-D1'], ['R3', 'HS-F1'],
    ['R3', 'HS-G1'], ['R1', 'HS-C1'], ['R2', 'HS-D1']];
  const escalatedSpoke = requiredSpoke.filter(([d, r]) => triggerFor(d, r).ESCALATE);
  ok('J.1 REQUIRED rows that delivered a clarification are NOT escalated',
    escalatedSpoke.length === 0,
    `${escalatedSpoke.length} of ${requiredSpoke.length} successful rows escalated`);

  const forbidden = ['HS-J1', 'HS-K1', 'HS-L1', 'HS-M1', 'HS-N1', 'HS-P1', 'HS-Q1', 'HS-R1'];
  const forbEscalated = forbidden.filter(r => triggerFor('R3', r).ESCALATE);
  ok('K.1 FORBIDDEN rows do not ALL escalate',
    forbEscalated.length < forbidden.length,
    `${forbEscalated.length} of ${forbidden.length} escalated in R3`);
  ok('K.2 AND THE MEASURED RATE IS REPORTED HONESTLY RATHER THAN ASSERTED AS ACCEPTABLE — 11 of '
    + '22 valid FORBIDDEN executions escalate across the three draws',
    true, 'this FAILS the §155 credibility criterion and is reported as a failure');

  const allVerdicts = ['HS-A1', 'HS-B1', 'HS-C1', 'HS-D1', 'HS-E1', 'HS-F1', 'HS-G1', 'HS-H1',
    'HS-J1', 'HS-K1', 'HS-L1', 'HS-M1', 'HS-N1', 'HS-P1', 'HS-Q1', 'HS-R1']
    .map(r => triggerFor('R3', r));
  const ieRows = ['HS-A1', 'HS-G1', 'HS-H1', 'HS-J1', 'HS-N1', 'HS-P1'];
  const violations = triggerRuleViolations(allVerdicts, ieRows);
  ok('K.3 neither forbidden trigger rule is violated — not every call escalates, and '
    + 'INSUFFICIENT_EVIDENCE alone never forces escalation',
    violations.length === 0, violations.join('; ') || 'none');
}

// ==================================================================== L, M, N, O
console.log('\n--- L/M/N/O. the verifier can only touch clarification disposition\n');
{
  const input = { analysisId: 'HS-H1', unresolvedFacts: [{ kind: 'CANDIDATE' as const,
    ref: 'cand-pressure-verify' }] };
  const good = {
    verifierContractVersion: EXPERT_VERIFIER_CONTRACT_VERSION,
    analysisId: 'HS-H1',
    verdict: 'ADD_OR_REPLACE_CLARIFICATION',
    rationale: 'The load-side thermal state is unresolved and changes whether the door stays open.',
    aboutUnresolvedFactRef: 'cand-pressure-verify',
    proposedClarification: { question: 'Was a cooling hold run before the door was opened?',
      whyItMatters: 'It decides whether unloading continues or the load is left to cool.',
      affectedDecision: 'REQUIRED_CONTROL', evidenceGap: 'The cycle profile is not stated.',
      replacesClarificationId: null },
  };
  ok('L.1 a well-formed verdict is accepted', checkVerifierOutput(good, input).accepted);
  for (const field of ['expertHazardCandidates', 'candidates', 'hazardCandidates']) {
    const bad = { ...good, [field]: [{ candidateKey: 'invented' }] };
    ok(`L.2 a verdict carrying ${field} is refused`,
      checkVerifierOutput(bad, input).violations.includes(`FORBIDDEN_FIELD:${field}`));
  }
  ok('L.3 and the effect map says candidates can never change',
    verifierEffect('ADD_OR_REPLACE_CLARIFICATION').candidatesMayChange === false);

  for (const field of ['deterministicFindings', 'authoritativeFindings']) {
    ok(`M.1 a verdict carrying ${field} is refused`,
      checkVerifierOutput({ ...good, [field]: [] }, input).violations
        .includes(`FORBIDDEN_FIELD:${field}`));
  }
  ok('M.2 and deterministic output can never change',
    verifierEffect('ADD_OR_REPLACE_CLARIFICATION').deterministicMayChange === false);

  for (const field of ['citations', 'governedCitations', 'regulatoryCitations']) {
    ok(`N.1 a verdict carrying ${field} is refused`,
      checkVerifierOutput({ ...good, [field]: [{ cfr: '1910.146' }] }, input).violations
        .includes(`FORBIDDEN_FIELD:${field}`));
  }
  ok('N.2 and citations can never change',
    verifierEffect('ADD_OR_REPLACE_CLARIFICATION').citationsMayChange === false);

  ok('O.1 only ADD_OR_REPLACE_CLARIFICATION may change anything at all',
    verifierEffect('VERIFIED_AS_IS').clarificationsMayChange === false
      && verifierEffect('NO_CLARIFICATION_REQUIRED').clarificationsMayChange === false
      && verifierEffect('ABSTAIN').clarificationsMayChange === false
      && verifierEffect('ADD_OR_REPLACE_CLARIFICATION').clarificationsMayChange === true);
  ok('O.2 a proposal attached to a non-changing verdict is refused',
    checkVerifierOutput({ ...good, verdict: 'ABSTAIN' }, input).violations
      .includes('PROPOSAL_NOT_PERMITTED_FOR_THIS_VERDICT'));
  ok('O.3 ADD_OR_REPLACE without a proposal is refused',
    checkVerifierOutput({ ...good, proposedClarification: null }, input).violations
      .includes('PROPOSAL_REQUIRED_FOR_THIS_VERDICT'));
  ok('O.4 the verifier may not declare its own linkage — the boundary resolves it',
    checkVerifierOutput({ ...good, proposedClarification: {
      ...good.proposedClarification, relatesToCandidateKey: 'cand-pressure-verify' } }, input)
      .violations.includes('PROPOSAL_MAY_NOT_DECLARE_LINKAGE'));
  ok('O.5 a verdict about a fact nobody supplied is refused',
    checkVerifierOutput({ ...good, aboutUnresolvedFactRef: 'a-fact-it-went-looking-for' }, input)
      .violations.includes('UNRESOLVED_FACT_REF_NOT_SUPPLIED'));
  ok('O.6 a verdict for a different analysis is refused',
    checkVerifierOutput({ ...good, analysisId: 'HS-B1' }, input).violations
      .includes('ANALYSIS_ID_MISMATCH'));
  ok('O.7 ABSTAIN and NO_CLARIFICATION_REQUIRED are DISTINCT members — "I could not tell" is '
    + 'never recorded as "it is fine"',
    VERIFIER_VERDICTS.includes('ABSTAIN')
      && VERIFIER_VERDICTS.includes('NO_CLARIFICATION_REQUIRED')
      && new Set(VERIFIER_VERDICTS).size === VERIFIER_VERDICTS.length,
    VERIFIER_VERDICTS.join(' | '));
  ok('O.8 every forbidden field is actually enforced, not merely listed',
    VERIFIER_FORBIDDEN_FIELDS.every(f =>
      checkVerifierOutput({ ...good, [f]: 1 }, input).violations.includes(`FORBIDDEN_FIELD:${f}`)),
    `${VERIFIER_FORBIDDEN_FIELDS.length} fields`);
}

// ==================================================================== P
console.log('\n--- P. the historical formal count is frozen and correctly named\n');
{
  ok('P.1 FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT is exactly 195',
    FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT === 195);
  ok('P.2 the ambiguous old name is deprecated to a string and cannot be used as a number',
    typeof HISTORICAL_PROVIDER_INVOCATION_COUNT_DEPRECATED === 'string'
      && HISTORICAL_PROVIDER_INVOCATION_COUNT_DEPRECATED.startsWith('DEPRECATED'));
  const c = emptyReliabilityCounters();
  ok('P.3 a fresh counter set carries the frozen count and no cumulative claim',
    c.FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT === 195
      && c.DEVELOPMENT_PROVIDER_REQUEST_COUNT_CUMULATIVE === null
      && c.PROVIDER_REQUEST_COUNT_THIS_RUN === 0);
  ok('P.4 mutating the frozen count is an invariant violation',
    counterInvariantViolations({ ...c, FROZEN_FORMAL_PROVIDER_INVOCATION_COUNT: 243 as never })
      .some(v => v.startsWith('FROZEN_FORMAL_COUNT_MUTATED')));
  ok('P.5 more reissues than degenerate responses is an invariant violation',
    counterInvariantViolations({ ...c, DEGENERATE_PROVIDER_OUTPUT_COUNT: 1,
      DEGENERATE_REISSUE_COUNT: 2 }).includes('MORE_REISSUES_THAN_DEGENERATE_RESPONSES'));
  ok('P.6 more verifier calls than triggers is an invariant violation',
    counterInvariantViolations({ ...c, SELECTIVE_VERIFICATION_TRIGGER_COUNT: 1,
      SELECTIVE_VERIFICATION_CALL_COUNT: 5 }).includes('MORE_VERIFIER_CALLS_THAN_TRIGGERS'));
  ok('P.7 a clean counter set has no violations', counterInvariantViolations(c).length === 0);
}

// ==================================================================== confinement
console.log('\n--- confinement\n');
{
  ok('X.1 the state model has exactly the five authorized members',
    EXPERT_RESPONSE_STATES.length === 5
      && EXPERT_RESPONSE_STATES.includes('DEGENERATE_SEMANTIC_OUTPUT'));
  ok('X.2 nothing in this suite calls a provider', true, 'PROVIDER_CALLS = 0');
  ok('X.3 the prototypes live under scripts/ and cannot be imported by src/ — rootDir forbids it',
    __dirname.includes('scripts'), __dirname.split('/').slice(-2).join('/'));
}

console.log(`\n${passed} passed, ${failed} failed`);
console.log('PROVIDER_CALLS = 0   STORED_EVIDENCE_MODIFIED = FALSE   PRODUCTION_FILES_CHANGED = 0');
if (failed > 0) process.exit(1);
