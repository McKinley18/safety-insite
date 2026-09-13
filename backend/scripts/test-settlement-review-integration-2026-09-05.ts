/**
 * §182 — SETTLEMENT CLAIM CONSUMER AND HUMAN-REVIEW AUTHORITY PRODUCER. ZERO PROVIDER CALLS.
 *
 * Twenty-two required proofs, driven through the REAL modules. The one that matters most is P2/P3:
 * a provider claim, however fluent, cannot mint an authority and cannot settle a fact. Everything
 * else is lifecycle and binding around that invariant.
 *
 * No provider call, no database operation, no governed record read for mutation, no customer route.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

import type { ArbitrationRequest, OwedFact, AcceptableEvidence } from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
import { createOwedFactLedger, factOf, transition } from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  checkBindingDeclarations, applyAdmittedDeclarations, CLARIFICATION_EVIDENCE_SUFFICIENCY,
} from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-binding';
import { EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED } from '../src/hazlenz/expert-hazlenz/owed-facts/verifier-v3-development-boundary';
import {
  consumeSettlementClaims, mintSettlementAuthority, settleByReviewedEvidence,
  observeSettlementReview, claimIdFor,
  SETTLEMENT_REVIEW_CONTRACT_VERSION, PROVIDER_SETTLEMENT_AUTHORITY,
  GOVERNED_FUNCTIONAL_TEST_METHOD_PRESENT, EVIDENCE_QUESTION_METHOD_ALIGNMENT_GAPS_PRESENT,
  REVIEW_DECISIONS, PERMITTED_REVIEW_PROVENANCES, REFUSED_REVIEW_PROVENANCES,
  NEVER_PROJECTED_TO_PROVIDER,
  type ReviewDecisionRecord, type SettlementClaim, type SettlementAuthority,
} from '../src/hazlenz/expert-hazlenz/owed-facts/settlement-review';

const ROOT = join(__dirname, '..', '..');
const sha = (s: string) => createHash('sha256').update(s).digest('hex');
let failed = 0;
const ok = (name: string, pass: boolean, detail = ''): void => {
  if (!pass) failed += 1;
  console.log(`${pass ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`);
};
const threw = (fn: () => unknown): string | null => {
  try { fn(); return null; } catch (e) { return String((e as Error)?.message ?? e); }
};

// ---------------------------------------------------------------- fixtures
const MG_EVIDENCE: AcceptableEvidence = {
  requirement: 'Evidence establishing guarding_status by a verification method the governed record '
    + 'for 1910.212 recognises.',
  examples: ['physical_inspection'],
  insufficientExamples: ['training_only'],
  provenance: 'GOVERNED_EVIDENCE',
};

const fact = (key: string, evidence: AcceptableEvidence | null = null): OwedFact => ({
  factKey: key,
  affectedDecision: 'REQUIRED_CONTROL',
  source: 'DEVELOPMENT_HUMAN_TRUTH',
  evidenceSpan: 'the fastenings were last torque-checked at the annual service',
  whyUnresolved: 'whether the fixed guard is presently secured is not stated',
  branchA: 'the fastenings are presently secure',
  branchB: 'the fastenings have loosened',
  decisionDivergence: { ifA: 'no action today', ifB: 'stop and re-secure the guard' },
  priority: 'REQUIRED_CONTROL',
  status: 'UNRESOLVED',
  acceptableEvidence: evidence,
  modelAuthored: false,
});

const SECUREMENT = 'owed:guarding:current_securement_of_fixed_guard';
const PRESENCE = 'owed:guarding:guard_presence';
const ANALYSIS = 'HR-04';
const REASON = 'the observation states the guard is in position and the fastenings were '
  + 'torque-checked at the annual service, so the guarding state is settled';

const dev = (facts: OwedFact[]) => createOwedFactLedger('DEVELOPMENT', facts);
const challenge = (factKey: string, reason: string): ArbitrationRequest => ({
  factKey, requestedBy: 'VERIFIER', reason, settles: false, factStatusUnchanged: true,
});
const humanDecision = (
  claim: SettlementClaim, decision: ReviewDecisionRecord['decision'],
  over: Partial<ReviewDecisionRecord> = {},
): ReviewDecisionRecord => ({
  claimId: claim.claimId,
  factKey: claim.factKey,
  decision,
  reviewerProvenance: 'HUMAN_REVIEW',
  reviewerId: 'product owner',
  rationale: 'recorded rationale for the §182 proof',
  reviewedEvidenceDigest: claim.evidenceDigest,
  decidedAt: '2026-09-05T00:00:00.000Z',
  ...over,
});

console.log('§182 SETTLEMENT REVIEW INTEGRATION — provider calls: 0   database operations: 0\n');

// ================================================================ 1. feature-off invariants
console.log('--- 1. FEATURE-OFF AND CURRENT-PATH INVARIANTS');
ok('P1 the inactive boundary is unchanged and is still a literal false',
  EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED === false, '');
ok('P1b the current path is unchanged — a bound declaration still produces COVERED only',
  (() => {
    const l = dev([fact(SECUREMENT, MG_EVIDENCE)]);
    const c = checkBindingDeclarations([{
      declarationId: 'd', bindingMode: 'BOUND_TO_OWED_FACT', coversFactKey: SECUREMENT,
      nomination: null, question: 'Are the fastenings presently secure?',
      affectedDecision: 'REQUIRED_CONTROL',
    }], l, 'the fastenings were last torque-checked at the annual service');
    const after = applyAdmittedDeclarations(l, c);
    return factOf(after, SECUREMENT)!.status === 'COVERED'
      && after.transitions.every(t => t.authority === 'ADMITTED_BINDING');
  })(), 'COVERED via ADMITTED_BINDING, exactly as before §182');
ok('P1c the §181 knowledge findings travel with the mechanism',
  GOVERNED_FUNCTIONAL_TEST_METHOD_PRESENT === false
  && EVIDENCE_QUESTION_METHOD_ALIGNMENT_GAPS_PRESENT === true, '');

// ================================================================ 2. the authority boundary
console.log('\n--- 2. THE AUTHORITY BOUNDARY: PROVIDER_SETTLEMENT_AUTHORITY = NEVER');
const ledger0 = dev([fact(SECUREMENT, MG_EVIDENCE)]);
const consumed = consumeSettlementClaims([challenge(SECUREMENT, REASON)], ledger0, ANALYSIS);
const claim = consumed.claims[0];

ok('P2 a provider claim alone mints no authority — every non-human provenance is refused',
  REFUSED_REVIEW_PROVENANCES.every(p => {
    const d = humanDecision(claim, 'APPROVE_SETTLEMENT', { reviewerProvenance: p });
    const m = mintSettlementAuthority(claim, d);
    return m.authority === null && m.refusedBecause.includes('REVIEW_PROVENANCE_NOT_HUMAN');
  }), REFUSED_REVIEW_PROVENANCES.join(', '));
ok('P3 consuming a claim changes no status — the fact is still UNRESOLVED',
  consumed.ledgerUnchanged === true
  && factOf(ledger0, SECUREMENT)!.status === 'UNRESOLVED'
  && claim.reviewState === 'AWAITING_HUMAN_REVIEW', '');
ok('P2b PROVIDER_SETTLEMENT_AUTHORITY is recorded as NEVER',
  PROVIDER_SETTLEMENT_AUTHORITY === 'NEVER', '');

// ================================================================ 3. decisions
console.log('\n--- 3. REVIEW DECISIONS');
const approve = mintSettlementAuthority(claim, humanDecision(claim, 'APPROVE_SETTLEMENT'));
ok('P4 APPROVE_SETTLEMENT by a human mints a narrowly scoped authority',
  approve.authority !== null
  && approve.authority.authority === 'ADMISSIBLE_EVIDENCE'
  && approve.authority.factKey === SECUREMENT
  && approve.authority.claimId === claim.claimId
  && approve.authority.scope === 'SINGLE_FACT_SINGLE_CLAIM_SINGLE_USE'
  && approve.authority.impliesFutureSufficiency === false, '');
ok('P5 REJECT_SETTLEMENT mints nothing',
  mintSettlementAuthority(claim, humanDecision(claim, 'REJECT_SETTLEMENT')).authority === null,
  'DECISION_DOES_NOT_APPROVE_SETTLEMENT');
ok('P6 LEAVE_UNRESOLVED mints nothing',
  mintSettlementAuthority(claim, humanDecision(claim, 'LEAVE_UNRESOLVED')).authority === null, '');
ok('P6b the decision vocabulary is small, closed, and has exactly one approving member',
  REVIEW_DECISIONS.length === 3 && PERMITTED_REVIEW_PROVENANCES.length === 1, REVIEW_DECISIONS.join('|'));
ok('P6c a missing rationale or reviewer identity fails closed',
  mintSettlementAuthority(claim, humanDecision(claim, 'APPROVE_SETTLEMENT', { rationale: '  ' }))
    .refusedBecause.includes('RATIONALE_MISSING')
  && mintSettlementAuthority(claim, humanDecision(claim, 'APPROVE_SETTLEMENT', { reviewerId: '' }))
    .refusedBecause.includes('REVIEWER_IDENTITY_MISSING'), '');

// ================================================================ 4. binding and scope
console.log('\n--- 4. AUTHORITY BINDING AND SCOPE');
ok('P7 authority is factKey-bound — a decision naming another fact is refused',
  mintSettlementAuthority(claim, humanDecision(claim, 'APPROVE_SETTLEMENT', { factKey: PRESENCE }))
    .refusedBecause.includes('FACT_KEY_MISMATCH'), '');
ok('P8 authority is claim-bound — a decision naming another claim is refused',
  mintSettlementAuthority(claim, humanDecision(claim, 'APPROVE_SETTLEMENT', { claimId: 'other' }))
    .refusedBecause.includes('CLAIM_ID_MISMATCH'), '');
ok('P8b a decision over edited evidence is refused (digest mismatch)',
  mintSettlementAuthority(claim, humanDecision(claim, 'APPROVE_SETTLEMENT',
    { reviewedEvidenceDigest: sha('a different reason') }))
    .refusedBecause.includes('REVIEWED_EVIDENCE_DIGEST_MISMATCH'), '');

const siblingLedger = dev([fact(SECUREMENT, MG_EVIDENCE), fact(PRESENCE)]);
const siblingClaim: SettlementClaim = {
  ...claim, factKey: PRESENCE, claimId: claimIdFor(ANALYSIS, PRESENCE, REASON),
};
ok('P9 a sibling fact cannot consume an authority minted for another fact',
  (() => {
    const r = settleByReviewedEvidence(siblingLedger, siblingClaim, approve.authority!);
    return r.applied === false
      && r.refusedBecause.includes('AUTHORITY_NOT_FOR_THIS_CLAIM')
      && r.refusedBecause.includes('AUTHORITY_NOT_FOR_THIS_FACT')
      && factOf(r.ledger, PRESENCE)!.status === 'UNRESOLVED'
      && factOf(r.ledger, SECUREMENT)!.status === 'UNRESOLVED';
  })(), 'both facts untouched');

// ================================================================ 5. lifecycle and replay
console.log('\n--- 5. LIFECYCLE, STALENESS AND REPLAY');
const applied1 = settleByReviewedEvidence(ledger0, claim, approve.authority!);
ok('P14 the approval branch reaches the EXISTING SETTLED_BY_EVIDENCE state',
  applied1.applied === true
  && factOf(applied1.ledger, SECUREMENT)!.status === 'SETTLED_BY_EVIDENCE'
  && applied1.ledger.transitions[0].authority === 'ADMISSIBLE_EVIDENCE', '');
ok('P10 a duplicate application fails closed and does not widen the authority',
  (() => {
    const again = settleByReviewedEvidence(
      applied1.ledger, claim, approve.authority!, applied1.appliedClaimIds);
    return again.applied === false
      && again.refusedBecause.includes('CLAIM_ALREADY_APPLIED')
      && again.refusedBecause.includes('FACT_NOT_UNRESOLVED');
  })(), 'CLAIM_ALREADY_APPLIED + FACT_NOT_UNRESOLVED');
ok('P11 a wrong claim/fact binding at application time fails closed',
  settleByReviewedEvidence(ledger0, { ...claim, claimId: 'tampered' }, approve.authority!)
    .refusedBecause.includes('AUTHORITY_NOT_FOR_THIS_CLAIM'), '');
ok('P11b an authority replayed against edited claim evidence fails closed',
  settleByReviewedEvidence(ledger0, { ...claim, evidenceDigest: sha('edited') }, approve.authority!)
    .refusedBecause.includes('AUTHORITY_EVIDENCE_DIGEST_MISMATCH'), '');
ok('P11c an already-resolved fact cannot be settled again',
  settleByReviewedEvidence(applied1.ledger, claim, approve.authority!)
    .refusedBecause.includes('FACT_NOT_UNRESOLVED'), '');
ok('P11d a claim against a fact absent from the ledger fails closed',
  settleByReviewedEvidence(dev([fact(PRESENCE)]), claim, approve.authority!)
    .refusedBecause.includes('FACT_NOT_IN_LEDGER'), '');
ok('P11e the consumer refuses a claim on a fact that is not UNRESOLVED',
  consumeSettlementClaims([challenge(SECUREMENT, REASON)], applied1.ledger, ANALYSIS)
    .refused[0].codes.includes('FACT_NOT_UNRESOLVED'), '');
ok('P11f the consumer refuses a claim whose type says it settles something',
  consumeSettlementClaims(
    [{ ...challenge(SECUREMENT, REASON), settles: true } as unknown as ArbitrationRequest],
    ledger0, ANALYSIS).refused[0].codes.includes('CLAIM_DOES_NOT_SETTLE_BY_ITS_OWN_TYPE'), '');

// ================================================================ 6. HR-04 branches
console.log('\n--- 6. HR-04 REPLAY: BOTH BRANCHES');
const hr04Ledger = dev([fact(SECUREMENT, MG_EVIDENCE), fact(PRESENCE)]);
const hr04Consumed = consumeSettlementClaims([challenge(SECUREMENT, REASON)], hr04Ledger, ANALYSIS);
const hr04Claim = hr04Consumed.claims[0];
ok('P12 before review the securement fact is UNRESOLVED and the claim is reviewable',
  factOf(hr04Ledger, SECUREMENT)!.status === 'UNRESOLVED'
  && hr04Claim.reviewState === 'AWAITING_HUMAN_REVIEW'
  && hr04Claim.acceptableEvidence?.requirement === MG_EVIDENCE.requirement, '');

const rejectMint = mintSettlementAuthority(hr04Claim, humanDecision(hr04Claim, 'REJECT_SETTLEMENT'));
ok('P13 BRANCH A — human rejects: no authority, fact stays UNRESOLVED',
  rejectMint.authority === null
  && factOf(hr04Ledger, SECUREMENT)!.status === 'UNRESOLVED', '');

const approveMint = mintSettlementAuthority(hr04Claim, humanDecision(hr04Claim, 'APPROVE_SETTLEMENT'));
const branchB = settleByReviewedEvidence(hr04Ledger, hr04Claim, approveMint.authority!);
ok('P14b BRANCH B — human approves: SETTLED_BY_EVIDENCE, and the PRESENCE sibling is untouched',
  branchB.applied === true
  && factOf(branchB.ledger, SECUREMENT)!.status === 'SETTLED_BY_EVIDENCE'
  && factOf(branchB.ledger, PRESENCE)!.status === 'UNRESOLVED',
  'architecture proof only — the frozen HR-04 truth remains REQUIRED');

// ================================================================ 7. displaced facts
console.log('\n--- 7. DISPLACED-FACT PROOFS (HR-05 / HR-07 SHAPES)');
const A = 'owed:energy:auger_isolation_state';
const B = 'owed:energy:drying_fan_interconnection';
const dfLedger = dev([fact(A), fact(B)]);
const dfClaimA = consumeSettlementClaims([challenge(A, 'the attempted start did not turn the auger')],
  dfLedger, 'HR-05').claims[0];
const dfAuthA = mintSettlementAuthority(dfClaimA, humanDecision(dfClaimA, 'APPROVE_SETTLEMENT')).authority!;
const dfSettled = settleByReviewedEvidence(dfLedger, dfClaimA, dfAuthA);

ok('D1 a settled fact A is not reopened by a claim about adjacent fact B',
  (() => {
    const cB = consumeSettlementClaims([challenge(B, 'the fans may be interconnected')],
      dfSettled.ledger, 'HR-05');
    return factOf(dfSettled.ledger, A)!.status === 'SETTLED_BY_EVIDENCE'
      && cB.claims.length === 1 && cB.ledgerUnchanged === true;
  })(), '');
ok('D2 B cannot inherit A\'s claim or authority',
  (() => {
    const cB = consumeSettlementClaims([challenge(B, 'the fans may be interconnected')],
      dfSettled.ledger, 'HR-05').claims[0];
    const r = settleByReviewedEvidence(dfSettled.ledger, cB, dfAuthA);
    return r.applied === false && r.refusedBecause.includes('AUTHORITY_NOT_FOR_THIS_FACT');
  })(), '');
ok('D3 B must be separately reviewed to be settled',
  (() => {
    const cB = consumeSettlementClaims([challenge(B, 'the fans may be interconnected')],
      dfSettled.ledger, 'HR-05').claims[0];
    const authB = mintSettlementAuthority(cB, humanDecision(cB, 'APPROVE_SETTLEMENT')).authority!;
    const r = settleByReviewedEvidence(dfSettled.ledger, cB, authB, dfSettled.appliedClaimIds);
    return r.applied === true && factOf(r.ledger, B)!.status === 'SETTLED_BY_EVIDENCE'
      && factOf(r.ledger, A)!.status === 'SETTLED_BY_EVIDENCE';
  })(), 'each fact needs its own review');
ok('D4 an authority minted for A cannot settle B  ·  D5 an authority for B cannot alter A',
  (() => {
    const cB = consumeSettlementClaims([challenge(B, 'the fans may be interconnected')],
      dfLedger, 'HR-05').claims[0];
    const authB = mintSettlementAuthority(cB, humanDecision(cB, 'APPROVE_SETTLEMENT')).authority!;
    const wrong = settleByReviewedEvidence(dfLedger, dfClaimA, authB);
    return wrong.applied === false
      && wrong.refusedBecause.includes('AUTHORITY_NOT_FOR_THIS_CLAIM')
      && factOf(dfLedger, A)!.status === 'UNRESOLVED';
  })(), '');
ok('D6 a challenge against an ineligible fact is structurally refused, not quarantined silently',
  consumeSettlementClaims([challenge('owed:not:in:ledger', 'reason')], dfLedger, 'HR-05')
    .refused[0].codes.includes('FACT_NOT_IN_LEDGER'), '');

// ================================================================ 8. acceptableEvidence
console.log('\n--- 8. acceptableEvidence INTERACTION');
const nullLedger = dev([fact(SECUREMENT, null)]);
const nullClaim = consumeSettlementClaims([challenge(SECUREMENT, REASON)], nullLedger, ANALYSIS).claims[0];
ok('P16 acceptableEvidence = null remains supported, and its absence is VISIBLE',
  nullClaim.acceptableEvidence === null && nullClaim.acceptableEvidenceAbsent === true, '');
ok('P16b review remains possible with a null criterion',
  mintSettlementAuthority(nullClaim, humanDecision(nullClaim, 'APPROVE_SETTLEMENT')).authority !== null,
  'the human decides; the absence of a criterion does not block them');
ok('P17 a coarse criterion does not auto-settle anything',
  (() => {
    const l = dev([fact(SECUREMENT, MG_EVIDENCE)]);
    const c = consumeSettlementClaims([challenge(SECUREMENT, REASON)], l, ANALYSIS);
    return factOf(l, SECUREMENT)!.status === 'UNRESOLVED' && c.claims[0].acceptableEvidence !== null;
  })(), 'consuming a claim beside a criterion settles nothing');
ok('P17b the criterion is preserved verbatim and carries a caveat rather than being strengthened',
  claim.acceptableEvidence!.examples[0] === 'physical_inspection'
  && claim.acceptableEvidence!.insufficientExamples[0] === 'training_only'
  && /no functional-test verification method/.test(claim.settlementGuidanceCaveat), '');

// ================================================================ 9. semantic boundary
console.log('\n--- 9. SEMANTIC BOUNDARY AND FEEDBACK BAN');
const moduleSrc = readFileSync(
  join(ROOT, 'backend/src/hazlenz/expert-hazlenz/owed-facts/settlement-review.ts'), 'utf8');
const moduleCode = moduleSrc.replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').filter(l => !l.trim().startsWith('//')).join('\n');
ok('P18 no semantic matcher, scorer or threshold was introduced',
  !/similarity|embedding|cosine|levenshtein|score|threshold|percent|confidence/i.test(moduleCode), '');
ok('P18b nothing compares the provider reason to the criterion',
  !/providerReason[\s\S]{0,80}requirement|requirement[\s\S]{0,80}providerReason/.test(moduleCode), '');
ok('P18c CLARIFICATION_EVIDENCE_SUFFICIENCY is untouched',
  CLARIFICATION_EVIDENCE_SUFFICIENCY === 'SEMANTIC_JUDGMENT_REQUIRED', '');
ok('P19 no review decision or adjudication label is projected to a provider',
  NEVER_PROJECTED_TO_PROVIDER.includes('reviewDecision')
  && NEVER_PROJECTED_TO_PROVIDER.includes('rationale')
  && !/projectOwedFact[\s\S]{0,200}reviewDecision/.test(moduleCode), NEVER_PROJECTED_TO_PROVIDER.join(','));

const obs = observeSettlementReview({
  claim: hr04Claim, decision: humanDecision(hr04Claim, 'APPROVE_SETTLEMENT'),
  mint: approveMint, application: branchB, ledgerAfter: branchB.ledger,
});
ok('P19b the observation reconstructs the whole decision',
  obs.factKey === SECUREMENT && obs.claimId === hr04Claim.claimId
  && obs.factStatusBeforeReview === 'UNRESOLVED'
  && obs.factStatusAfterReview === 'SETTLED_BY_EVIDENCE'
  && obs.reviewerProvenance === 'HUMAN_REVIEW' && obs.reviewDecision === 'APPROVE_SETTLEMENT'
  && obs.authorityMinted === true && obs.transitionAttempted === true
  && obs.PROVIDER_SETTLEMENT_AUTHORITY === 'NEVER', '');

// ================================================================ 10. boundaries
console.log('\n--- 10. INACTIVE AND GOVERNED BOUNDARIES');
const serviceSrc = readFileSync(join(ROOT, 'backend/src/hazlenz/safescope-v2.service.ts'), 'utf8');
ok('P1d no customer route reaches the consumer or the producer',
  !serviceSrc.includes('settlement-review') && !serviceSrc.includes('settleByReviewedEvidence')
  && !serviceSrc.includes('mintSettlementAuthority'), '');
ok('P1e nothing in the module reads configuration or an environment flag',
  !/process\.env|getConfig|ConfigService/.test(moduleCode), '');
ok('P1f the module performs no database or network operation',
  !/repository|dataSource|query\(|fetch\(|axios|http/i.test(moduleCode), '');
ok('P20 no governed record was modified',
  (() => {
    const reg = join(ROOT, 'safescope-data/approved-knowledge/registry');
    return sha(readFileSync(join(reg, 'approved-knowledge-seed-records.v1.json'), 'utf8'))
        === 'fb23bcfa4c2ebb59bb9cc9c552e0c32a4d80d69c20557394fe299d0e1d1598f9'
      && sha(readFileSync(join(reg, 'rec-msha-30-56-12.json'), 'utf8'))
        === '604982c5e945118e8752daea4bbdd6970d75d1b4fa25eb75c79e4fb669f2dbc1'
      && sha(readFileSync(join(reg, 'regulatory-expansion-v1.json'), 'utf8'))
        === 'd0e9fc54365b5e8150bd86db9328a15c24a331ad2ad054f9e5b50dd4190d28d4';
  })(), 'three registry files byte-identical to their §181 values');
ok('P20b expert-prompt.ts was not modified',
  sha(readFileSync(join(ROOT, 'backend/src/hazlenz/expert-hazlenz/expert-prompt.ts'), 'utf8'))
    === 'bfe564c25515cabf5149d9629aa9aa58ea2287dd8691dc338a2f9ec47fd0f694', '');
ok('P20c no existing owed-facts module was modified',
  sha(readFileSync(join(ROOT, 'backend/src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types.ts'), 'utf8'))
    === 'f77c7febb55a056271174c4efd4375506145344bd0748e5d56f93c698074c1d1'
  && sha(readFileSync(join(ROOT, 'backend/src/hazlenz/expert-hazlenz/owed-facts/owed-fact-binding.ts'), 'utf8'))
    === 'e25f1fa807d4ffd4b976670e71766e371e959682eb341f5ed07cc24c6e1cd3e0',
  '§182 is one NEW file; nothing existing changed');

// ================================================================ 11. residual, reported not hidden
console.log('\n--- 11. RESIDUAL, REPORTED RATHER THAN HIDDEN');
ok('R1 transition() remains directly callable in-process with ADMISSIBLE_EVIDENCE',
  (() => {
    const direct = transition(dev([fact(SECUREMENT)]), {
      factKey: SECUREMENT, to: 'SETTLED_BY_EVIDENCE', authority: 'ADMISSIBLE_EVIDENCE',
      justification: 'demonstrating the residual',
    });
    return factOf(direct, SECUREMENT)!.status === 'SETTLED_BY_EVIDENCE';
  })(),
  'PRE-EXISTING and unchanged by §182 — see SECTION-182-RESULT.json residual R1');
ok('R1b but no PROVIDER input can reach that call — the provider path mints ADMITTED_BINDING only',
  !readFileSync(join(ROOT,
    'backend/src/hazlenz/expert-hazlenz/owed-facts/owed-fact-binding.ts'), 'utf8')
    .includes("'ADMISSIBLE_EVIDENCE'"), '');

console.log(`\n${failed === 0 ? 'ALL §182 PROOFS PASSED' : `${failed} FAILED`} — provider calls: 0   database operations: 0`);
if (failed > 0) process.exit(1);
