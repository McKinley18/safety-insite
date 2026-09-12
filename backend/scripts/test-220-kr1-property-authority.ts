/**
 * §220 -- KR-1 HUMAN PROPERTY-AUTHORITY BOUNDARY. UNIT AND BOUNDARY SUITE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ROUTE.
 *
 * The replay suite proves the boundary works on the persisted §219 evidence. This suite proves the
 * boundary is what it claims to be: no semantic inference anywhere, no analysis gated, no existing
 * fail-closed behaviour weakened, and no path by which a provider or a forged object reaches the
 * authority.
 */

import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import type { OwedFact, ArbitrationRequest } from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types';
import {
  createOwedFactLedger, factOf, owedFact,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  checkBindingDeclarations, applyAdmittedDeclarations,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-binding';
import {
  consumeSettlementClaims, mintSettlementAuthority, settleByReviewedEvidence,
  attachPropertyAuthority, recordPropertyAuthorityDeclined,
  PROPERTY_AUTHORITY_ATTACH_REFUSAL_CODES, APPLICATION_REFUSAL_CODES,
  type ReviewDecisionRecord,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/settlement-review';
import {
  PROPERTY_AUTHORITY_CONTRACT_VERSION, KR1_STATUS, KR1_PROVIDER_CAPABILITY_REMEDIATED,
  AUTONOMOUS_PROPERTY_IDENTIFICATION_VALIDATED, PROVIDER_PROPERTY_AUTHORITY,
  PROPERTY_AUTHORITY_STATES, SETTLEMENT_PERMITTING_STATES, PROPERTY_CONFIRMATION_DECISIONS,
  PERMITTED_PROPERTY_REVIEW_PROVENANCES, REFUSED_PROPERTY_REVIEW_PROVENANCES,
  TRIGGER_SOURCES_EVALUATED_220, SCOPING_LIMITATION_220, TRANSITION_COVERAGE_220,
  propertyAuthorityRequirementFor, initialPropertyAuthorityState,
  mayBeSettledUnderPropertyAuthority, buildPropertyReviewPacket, mintPropertyAuthority,
  propertyAuthorityFailClosedEffect, propertyAuthorityEffect, REVIEWER_QUESTION,
  CONFIRMATION_IS_NOT_SETTLEMENT,
  type PropertyDecisionRecord, type PropertyReviewPacket,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/property-authority';

const ROOT = join(__dirname, '..', '..');
const sha = (s: string): string => createHash('sha256').update(s).digest('hex');
let passed = 0; let failed = 0;
const ok = (name: string, pass: boolean, detail = ''): void => {
  if (pass) { passed += 1; console.log(`ok    ${name}${detail ? `  [${detail}]` : ''}`); }
  else { failed += 1; console.log(`FAIL  ${name}${detail ? `  [${detail}]` : ''}`); }
};

const MODULE = join(ROOT,
  'backend/src/safescope-v2/expert-hazlenz/owed-facts/property-authority.ts');
const moduleSrc = readFileSync(MODULE, 'utf8');
/** Source with comments stripped, so a word appearing in prose is never read as behaviour. */
const moduleCode = moduleSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const ANALYSIS = 'S220';
const KEY = 'FP.REQUIRED_CONTROL.OBS-X.1-20.1';
const modelFact = (key = KEY): OwedFact => owedFact({
  factKey: key,
  affectedDecision: 'REQUIRED_CONTROL',
  source: 'FIRST_PASS_MODEL',
  evidenceSpan: 'the sheet carries nothing against number 4',
  whyUnresolved: 'nothing supplied says whether the run was made',
  branchA: 'the run was carried out and passed',
  branchB: 'the run was not carried out',
  decisionDivergence: { ifA: 'load out as normal', ifB: 'run it on the ramp first' },
  priority: 'REQUIRED_CONTROL',
});
const governedFact = (key = 'GOV.1'): OwedFact => owedFact({
  ...modelFact(key), source: 'GOVERNED_EVIDENCE',
} as Parameters<typeof owedFact>[0]);
const deterministicFact = (key = 'DET.1'): OwedFact => owedFact({
  ...modelFact(key), source: 'DETERMINISTIC',
} as Parameters<typeof owedFact>[0]);

const packetFor = (f: OwedFact): PropertyReviewPacket => buildPropertyReviewPacket({
  analysisId: ANALYSIS,
  fact: f,
  proposedProperty: 'whether the weekly loaded brake run was carried out this week',
  decisionWhileUnresolved: 'number 4 does not take the loaded haul road',
  existingClarification: 'Was the weekly run carried out, and what did it record?',
  verifier: {
    decisionControllingProperty: 'whether the weekly loaded brake run was carried out',
    propertySemanticRole: 'REQUIRED_ACT_ITSELF',
    propertyValidity: 'VALID',
  },
});
const decisionFor = (
  p: PropertyReviewPacket, decision: PropertyDecisionRecord['decision'],
  over: Partial<PropertyDecisionRecord> = {},
): PropertyDecisionRecord => ({
  packetId: p.packetId,
  factKey: p.factKey,
  decision,
  reviewerProvenance: 'HUMAN_REVIEW',
  reviewerId: 'authorized safety reviewer',
  rationale: 'recorded rationale',
  reviewedPropertyDigest: p.propertyDigest,
  correctedControllingProperty: decision === 'CORRECT_PROPERTY' ? 'the real controlling state' : null,
  decidedAt: '2026-09-10T00:00:00.000Z',
  ...over,
});
const challenge = (factKey: string): ArbitrationRequest => ({
  factKey, requestedBy: 'VERIFIER', reason: 'the observation already settles this', settles: false,
  factStatusUnchanged: true,
});
const evidenceDecision = (claimId: string, factKey: string, d: string): ReviewDecisionRecord => ({
  claimId, factKey, decision: 'APPROVE_SETTLEMENT', reviewerProvenance: 'HUMAN_REVIEW',
  reviewerId: 'authorized safety reviewer', rationale: 'sufficient', reviewedEvidenceDigest: d,
  decidedAt: '2026-09-10T00:00:00.000Z',
});

console.log('§220 KR-1 PROPERTY-AUTHORITY BOUNDARY — provider calls: 0   database operations: 0\n');

// ================================================================ 1. no semantic inference
console.log('--- 1. THE LINE THIS MODULE MAY NOT CROSS');
ok('S1 the module contains no keyword classifier for the KR-1 vocabulary',
  !/['"`](test|certificate|inspection|measurement|record|permit|check|survey|calibration)['"`]/i
    .test(moduleCode),
  'no string literal naming the vocabulary the authorization forbids branching on');
ok('S2 no code path branches on the content of any property text',
  !/\.includes\(|\.match\(|\.test\(|indexOf\(|startsWith\(|endsWith\(|toLowerCase\(/
    .test(moduleCode.replace(/SETTLEMENT_PERMITTING_STATES\.includes\([^)]*\)/g, '')),
  'the one includes() left is a closed-set membership test over states, not text');
ok('S3 the requirement rule reads modelAuthored and nothing else',
  propertyAuthorityRequirementFor(modelFact()) === 'REQUIRED'
  && propertyAuthorityRequirementFor(governedFact()) === 'NOT_REQUIRED'
  && propertyAuthorityRequirementFor(deterministicFact()) === 'NOT_REQUIRED');
ok('S4 two facts with identical text and different provenance get different requirements',
  (() => {
    const a = modelFact('SAME.1');
    const b = owedFact({ ...a, factKey: 'SAME.2', source: 'GOVERNED_EVIDENCE' } as
      Parameters<typeof owedFact>[0]);
    return a.evidenceSpan === b.evidenceSpan && a.whyUnresolved === b.whyUnresolved
      && propertyAuthorityRequirementFor(a) !== propertyAuthorityRequirementFor(b);
  })(),
  'provenance decides, text never does');
ok('S5 two facts with different text and the same provenance get the same requirement',
  (() => {
    const a = modelFact('DIFF.1');
    const b = owedFact({
      ...a, factKey: 'DIFF.2',
      evidenceSpan: 'the nurse in charge says she heard nothing',
      whyUnresolved: 'nothing states the notification was given',
    } as Parameters<typeof owedFact>[0]);
    return propertyAuthorityRequirementFor(a) === propertyAuthorityRequirementFor(b);
  })(),
  'the §219 A1 / A3 pair, in miniature');
ok('S6 the module declares what it does not do, as literals',
  (() => {
    const e = propertyAuthorityEffect();
    return e.providerCalls === 0 && e.databaseOperations === 0
      && e.readsThePropertyTextForMeaning === false && e.usesAKeywordList === false
      && e.infersSemanticRole === false && e.classifiesEvidenceVersusState === false
      && e.gatesAnalysis === false && e.gatesClarificationBinding === false
      && e.blocksAPropertyForItsVocabulary === false
      && e.weakensAnyExistingFailClosedBehaviour === false;
  })());
ok('S7 the scoping evaluation is recorded, including the two signals actually used',
  TRIGGER_SOURCES_EVALUATED_220.length === 7
  && TRIGGER_SOURCES_EVALUATED_220.filter(t => t.usedAsTrigger).length === 2
  && TRIGGER_SOURCES_EVALUATED_220.some(t =>
    t.signal.includes('modelAuthored') && t.usedAsTrigger)
  && TRIGGER_SOURCES_EVALUATED_220.some(t =>
    t.signal === 'the property text itself' && !t.usedAsTrigger));
ok('S8 the limitation is stated rather than engineered around',
  SCOPING_LIMITATION_220.canDeterministicallyIdentifyKr1RiskyFacts === false
  && SCOPING_LIMITATION_220.whatThisDoesNotDo.includes('does not make the reviewer right'));

// ================================================================ 2. analysis is untouched
console.log('\n--- 2. NOTHING IN THE ANALYSIS PATH IS GATED');
ok('S9 a clarification binding still produces COVERED with no property authority anywhere',
  (() => {
    const l = createOwedFactLedger('PRODUCTION', [modelFact()]);
    const c = checkBindingDeclarations([{
      declarationId: 'd', bindingMode: 'BOUND_TO_OWED_FACT', coversFactKey: KEY,
      nomination: null, question: 'Was the weekly run carried out?',
      affectedDecision: 'REQUIRED_CONTROL',
    }], l, 'the sheet carries nothing against number 4');
    const after = applyAdmittedDeclarations(l, c);
    return factOf(after, KEY)!.status === 'COVERED'
      && after.transitions.every(t => t.authority === 'ADMITTED_BINDING');
  })(),
  'unchanged from before §220');
ok('S10 the binding module is not aware of §220 at all',
  !readFileSync(join(ROOT,
    'backend/src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-binding.ts'), 'utf8')
    .includes('property-authority'));
ok('S11 the transition coverage records exactly which transitions §220 gates',
  TRANSITION_COVERAGE_220.length === 3
  && TRANSITION_COVERAGE_220.filter(t => t.gatedBy220).length === 1
  && TRANSITION_COVERAGE_220.find(t => t.to === 'SETTLED_BY_EVIDENCE')!.gatedBy220 === true
  && TRANSITION_COVERAGE_220.find(t => t.to === 'COVERED')!.gatedBy220 === false);
ok('S12 REJECTED_BY_ARBITRATION still has no runtime producer, recorded rather than assumed',
  TRANSITION_COVERAGE_220.find(t => t.to === 'REJECTED_BY_ARBITRATION')!.reason
    .includes('NO RUNTIME PRODUCER EXISTS'));

// ================================================================ 3. the prerequisite
console.log('\n--- 3. PROPERTY AUTHORITY BEFORE FACT SETTLEMENT AUTHORITY');
const ledger = createOwedFactLedger('PRODUCTION', [modelFact()]);
const consumed = consumeSettlementClaims([challenge(KEY)], ledger, ANALYSIS);
const claim = consumed.claims[0];
ok('S13 a model-authored claim is born REQUIRED_NOT_OBTAINED',
  claim.propertyAuthorityRequirement === 'REQUIRED'
  && claim.propertyAuthorityState === 'REQUIRED_NOT_OBTAINED',
  'fail-closed by construction, not by a caller remembering to check');
ok('S14 a governed-evidence claim is born NOT_REQUIRED and settles without a new confirmation',
  (() => {
    const l = createOwedFactLedger('PRODUCTION', [governedFact()]);
    const c = consumeSettlementClaims([challenge('GOV.1')], l, ANALYSIS).claims[0];
    const auth = mintSettlementAuthority(c,
      evidenceDecision(c.claimId, c.factKey, c.evidenceDigest));
    const r = settleByReviewedEvidence(l, c, auth.authority!);
    return c.propertyAuthorityState === 'NOT_REQUIRED' && r.applied === true;
  })(),
  'the boundary is targeted: authoritative supplied context needs nothing new');
const evidenceAuth = mintSettlementAuthority(claim,
  evidenceDecision(claim.claimId, claim.factKey, claim.evidenceDigest));
ok('S15 evidence authority still mints normally — §220 weakens nothing upstream',
  evidenceAuth.authority !== null);
const refusedApp = settleByReviewedEvidence(ledger, claim, evidenceAuth.authority!);
ok('S16 and the settlement is refused for want of property authority',
  refusedApp.applied === false
  && refusedApp.refusedBecause.includes('PROPERTY_AUTHORITY_NOT_OBTAINED')
  && factOf(refusedApp.ledger, KEY)!.status === 'UNRESOLVED'
  && refusedApp.ledger.transitions.length === 0);
ok('S17 the new refusal code is part of the closed application-refusal set',
  (APPLICATION_REFUSAL_CODES as readonly string[]).includes('PROPERTY_AUTHORITY_NOT_OBTAINED')
  && APPLICATION_REFUSAL_CODES.length === 8);

// ================================================================ 4. the human decision
console.log('\n--- 4. THE HUMAN DECISION, AND WHAT IT DOES NOT MEAN');
const packet = packetFor(modelFact());
ok('S18 the packet asks one fixed question and offers exactly three actions',
  packet.reviewerQuestion === REVIEWER_QUESTION
  && packet.availableDecisions.join() === PROPERTY_CONFIRMATION_DECISIONS.join()
  && PROPERTY_CONFIRMATION_DECISIONS.length === 3);
ok('S19 the packet states on its face that confirming is not settling',
  packet.confirmationIsNotSettlement === CONFIRMATION_IS_NOT_SETTLEMENT
  && packet.confirmationIsNotSettlement.includes('does not settle the fact'));
ok('S20 the packet copies state verbatim and reconstructs nothing',
  packet.observationSpan === modelFact().evidenceSpan
  && packet.hazlenzExplanation === modelFact().whyUnresolved
  && packet.branchA === modelFact().branchA
  && packet.decisionIfB === modelFact().decisionDivergence.ifB);
ok('S21 the verifier advisory fields are carried as advisory and are not promoted',
  packet.verifierDecisionControllingProperty !== null
  && !('owedFact' in (packet as unknown as Record<string, unknown>))
  && !moduleCode.includes('addOwedFact') && !moduleCode.includes('nominateAdditiveFact'),
  '§218 said this field never becomes a fact, and §220 does not change that');
for (const d of PROPERTY_CONFIRMATION_DECISIONS) {
  const mint = mintPropertyAuthority(packet, decisionFor(packet, d));
  const mintsAuthority = d !== 'KEEP_UNRESOLVED';
  ok(`S22.${d} mints ${mintsAuthority ? 'an authority' : 'nothing'}`,
    (mint.authority !== null) === mintsAuthority);
}
ok('S23 only NOT_REQUIRED and CONFIRMED permit settlement',
  SETTLEMENT_PERMITTING_STATES.join() === 'NOT_REQUIRED,CONFIRMED'
  && PROPERTY_AUTHORITY_STATES.filter(s => !mayBeSettledUnderPropertyAuthority(s)).join()
    === 'REQUIRED_NOT_OBTAINED,CORRECTED,DECLINED_KEEP_UNRESOLVED');
ok('S24 a CORRECTED property is recorded and still refuses to settle the original fact',
  (() => {
    const mint = mintPropertyAuthority(packet, decisionFor(packet, 'CORRECT_PROPERTY'));
    const attached = attachPropertyAuthority(claim, mint.authority!);
    const app = settleByReviewedEvidence(ledger, attached.claim, evidenceAuth.authority!);
    return mint.authority!.outcome === 'CORRECTED'
      && mint.authority!.controllingProperty === 'the real controlling state'
      && attached.attached === true
      && app.applied === false
      && app.refusedBecause.includes('PROPERTY_AUTHORITY_NOT_OBTAINED');
  })(),
  'the human correction is honoured by the authoritative state, not ignored');
ok('S25 a CONFIRMED property lets the settlement through and only then',
  (() => {
    const mint = mintPropertyAuthority(packet, decisionFor(packet, 'CONFIRM_PROPERTY'));
    const attached = attachPropertyAuthority(claim, mint.authority!);
    const app = settleByReviewedEvidence(ledger, attached.claim, evidenceAuth.authority!);
    return app.applied === true && factOf(app.ledger, KEY)!.status === 'SETTLED_BY_EVIDENCE';
  })());
ok('S26 KEEP_UNRESOLVED is recorded explicitly and is not merely an absence',
  recordPropertyAuthorityDeclined(claim).propertyAuthorityState === 'DECLINED_KEEP_UNRESOLVED');

// ================================================================ 5. forgery and provenance
console.log('\n--- 5. THE AUTHORITY CANNOT BE FORGED OR BORROWED');
ok('S27 every non-human provenance is refused',
  REFUSED_PROPERTY_REVIEW_PROVENANCES.every(p =>
    mintPropertyAuthority(packet,
      decisionFor(packet, 'CONFIRM_PROPERTY', { reviewerProvenance: p })).authority === null)
  && PERMITTED_PROPERTY_REVIEW_PROVENANCES.join() === 'HUMAN_REVIEW');
ok('S28 a mismatched packet, fact or property digest mints nothing',
  mintPropertyAuthority(packet,
    decisionFor(packet, 'CONFIRM_PROPERTY', { packetId: 'other' })).authority === null
  && mintPropertyAuthority(packet,
    decisionFor(packet, 'CONFIRM_PROPERTY', { factKey: 'other' })).authority === null
  && mintPropertyAuthority(packet,
    decisionFor(packet, 'CONFIRM_PROPERTY', { reviewedPropertyDigest: sha('x') }))
    .authority === null);
ok('S29 a missing rationale or reviewer identity mints nothing',
  mintPropertyAuthority(packet,
    decisionFor(packet, 'CONFIRM_PROPERTY', { rationale: '  ' })).authority === null
  && mintPropertyAuthority(packet,
    decisionFor(packet, 'CONFIRM_PROPERTY', { reviewerId: '' })).authority === null);
ok('S30 a correction with no corrected property, and a confirmation carrying one, both refuse',
  mintPropertyAuthority(packet,
    decisionFor(packet, 'CORRECT_PROPERTY', { correctedControllingProperty: null }))
    .authority === null
  && mintPropertyAuthority(packet,
    decisionFor(packet, 'CONFIRM_PROPERTY', { correctedControllingProperty: 'x' }))
    .authority === null);
ok('S31 the authority brand is a module-private symbol, so it cannot be object-literalled',
  moduleSrc.includes('const PROPERTY_AUTHORITY_BRAND: unique symbol')
  && !moduleSrc.includes('export const PROPERTY_AUTHORITY_BRAND'));
ok('S32 an authority for one fact cannot be attached to another claim',
  (() => {
    const other = createOwedFactLedger('PRODUCTION', [modelFact('OTHER.1')]);
    const otherClaim = consumeSettlementClaims([challenge('OTHER.1')], other, ANALYSIS).claims[0];
    const mint = mintPropertyAuthority(packet, decisionFor(packet, 'CONFIRM_PROPERTY'));
    const r = attachPropertyAuthority(otherClaim, mint.authority!);
    return r.attached === false
      && r.refusedBecause.includes('PROPERTY_AUTHORITY_NOT_FOR_THIS_FACT')
      && r.claim.propertyAuthorityState === 'REQUIRED_NOT_OBTAINED';
  })(),
  'a refused attach returns the claim unchanged, so fail-closed survives');
ok('S33 attaching to a claim that never required authority is refused rather than silently allowed',
  (() => {
    const l = createOwedFactLedger('PRODUCTION', [governedFact('GOV.2')]);
    const c = consumeSettlementClaims([challenge('GOV.2')], l, ANALYSIS).claims[0];
    const p = packetFor(governedFact('GOV.2'));
    const mint = mintPropertyAuthority(p, decisionFor(p, 'CONFIRM_PROPERTY'));
    return attachPropertyAuthority(c, mint.authority!).refusedBecause
      .includes('PROPERTY_AUTHORITY_NOT_REQUIRED_FOR_THIS_CLAIM');
  })());
ok('S34 the attach refusal set is closed and small',
  PROPERTY_AUTHORITY_ATTACH_REFUSAL_CODES.length === 2);

// ================================================================ 6. fail-closed and status
console.log('\n--- 6. FAIL-CLOSED POSTURE AND RECORDED STATUS');
ok('S35 the fail-closed effect is typed as literals',
  (() => {
    const e = propertyAuthorityFailClosedEffect();
    return e.unresolvedTruthRemainsOpen === true
      && e.decisionWhileUnresolvedRemainsAuthoritative === true
      && e.workReleaseImplied === false && e.automaticSatisfactorySettlement === false
      && e.automaticAdverseSettlement === false && e.canonicalFactDeleted === false
      && e.clarificationChanged === false && e.providerClassificationRepaired === false;
  })());
ok('S36 a property confirmation implies no settlement of any kind',
  (() => {
    const mint = mintPropertyAuthority(packet, decisionFor(packet, 'CONFIRM_PROPERTY'));
    const a = mint.authority!;
    return a.impliesFactSettled === false && a.impliesSatisfactorySettlement === false
      && a.impliesAdverseSettlement === false && a.impliesWorkRelease === false
      && a.scope === 'SINGLE_FACT_SINGLE_PACKET_SINGLE_USE';
  })());
ok('S37 KR-1 status is recorded honestly and the forbidden claims are literal false',
  KR1_STATUS === 'OPEN — HUMAN-GATED V1.0 LIMITATION'
  && KR1_PROVIDER_CAPABILITY_REMEDIATED === false
  && AUTONOMOUS_PROPERTY_IDENTIFICATION_VALIDATED === false
  && PROVIDER_PROPERTY_AUTHORITY === 'NEVER');
ok('S38 the module version is recorded',
  PROPERTY_AUTHORITY_CONTRACT_VERSION === 'hazlenz.expert.kr1-property-authority.v1');

// ================================================================ 7. boundaries
console.log('\n--- 7. INACTIVE AND GOVERNED BOUNDARIES');
const serviceSrc = readFileSync(
  join(ROOT, 'backend/src/safescope-v2/safescope-v2.service.ts'), 'utf8');
ok('S39 no customer route reaches the property-authority producer',
  !serviceSrc.includes('property-authority') && !serviceSrc.includes('mintPropertyAuthority'));
ok('S40 the module reads no configuration, environment flag, database or network',
  !/process\.env|getConfig|ConfigService/.test(moduleCode)
  && !/repository|dataSource|query\(|fetch\(|axios|http/i.test(moduleCode));
ok('S41 §220 modified exactly one existing owed-facts module, and it is settlement-review',
  (() => {
    const dir = join(ROOT, 'backend/src/safescope-v2/expert-hazlenz/owed-facts');
    const touched = ['owed-fact.types.ts', 'owed-fact-binding.ts', 'owed-fact-ledger.ts',
      'owed-fact-observability.ts', 'structural-questions.ts', 'governed-evidence-derivation.ts',
      'verifier-v3-development-boundary.ts']
      .filter(f => readFileSync(join(dir, f), 'utf8').includes('property-authority'));
    return touched.length === 0
      && readFileSync(join(dir, 'settlement-review.ts'), 'utf8').includes('property-authority');
  })(),
  'the prerequisite lives at the settlement seam and nowhere else');

console.log(`\n  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   COMMIT: no   PUSH: no   DEPLOY: no');
console.log(`  KR-1 = ${KR1_STATUS}`);
if (failed > 0) process.exit(1);
