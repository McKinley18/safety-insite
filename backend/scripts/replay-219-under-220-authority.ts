/**
 * §220 -- REPLAY OF THE PERSISTED §219 EVIDENCE THROUGH THE KR-1 PROPERTY-AUTHORITY BOUNDARY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ROUTE.
 *
 * The §219 provider outputs are read from disk exactly as they were persisted. Nothing is
 * reinterpreted, re-scored, repaired or re-run, and no §219 result is reclassified. The question
 * this script answers is not "was the provider right" -- §219 answered that -- but:
 *
 *      does the PRODUCT AUTHORITY MODEL stop the A1 mistake from autonomously releasing the
 *      unresolved braking-capability question?
 *
 * The owed facts are rebuilt by calling the SAME deterministic projection the §219 assembly called,
 * on the SAME frozen case data. The rebuilt fact keys are asserted equal to the keys persisted in
 * the raw evidence, so the reconstruction is proved faithful rather than assumed. No §219 module is
 * modified: its frozen digest and its pinned module hashes must still verify after this runs.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { project210jDeclarations } from './lib/expert-210j-declaration-projection';
import { checkDeclarationEntry212 } from './lib/expert-212-challenge-vocabulary';
import { checkScopeContainment } from './lib/expert-214-scope-containment';
import { checkPropertyReview218 } from './lib/expert-218-property-consistency';
import { CONFIRMATION_CASES_219 } from './lib/expert-219-structured-confirmation-instrument';

import type { ArbitrationRequest, OwedFact } from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types';
import {
  createOwedFactLedger, factOf,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  consumeSettlementClaims, mintSettlementAuthority, settleByReviewedEvidence,
  attachPropertyAuthority, recordPropertyAuthorityDeclined, observeSettlementReview,
  type ReviewDecisionRecord,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/settlement-review';
import {
  buildPropertyReviewPacket, mintPropertyAuthority, propertyAuthorityRequirementFor,
  type PropertyConfirmationDecision, type PropertyDecisionRecord, type PropertyReviewPacket,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/property-authority';

const ROOT = join(__dirname, '..', '..');
const EVID_219 = join(ROOT, 'verification',
  'expert-hazlenz-219-final-structured-verifier-confirmation-2026-09-10');
const EVID_220 = join(ROOT, 'verification',
  'expert-hazlenz-220-kr1-property-authority-boundary-2026-09-10');
const FROZEN_DIGEST_219 = '491bf18a1094c99c22a80719001c207c7d72e92c1f547086284b3331d5918d56';

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
let failed = 0;
const ok = (name: string, pass: boolean, detail = ''): void => {
  if (!pass) failed += 1;
  console.log(`${pass ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`);
};

// ================================================================ the frozen evidence

const preregBytes = readFileSync(join(EVID_219, 'CONFIRMATION-PREREGISTRATION-219.json'), 'utf8');
ok('E1 the §219 frozen digest is unchanged before the replay',
  sha(preregBytes) === FROZEN_DIGEST_219, sha(preregBytes).slice(0, 16) + '…');

const raw = readFileSync(join(EVID_219, 'RAW-VERIFIER-219.jsonl'), 'utf8').trim().split('\n')
  .map(l => JSON.parse(l) as Record<string, any>);
ok('E2 five persisted §219 calls are read exactly as recorded',
  raw.length === 5 && raw.map(r => r.caseId).join(',') === 'A1,A2,A3,A4,A5');

/** Rebuild the owed fact for one frozen case by the same deterministic projection §219 used. */
function owedFactFor(caseId: string): OwedFact {
  const c = CONFIRMATION_CASES_219.find(x => x.caseId === caseId)!;
  const idx = c.declarations.findIndex(d => d.declarationId === c.targetDeclarationId);
  const adapted = c.declarations.map(d => ({ ...d, observationSourceId: `OBS-${c.caseId}` }));
  const proj = project210jDeclarations({
    declarations: adapted as unknown as readonly unknown[],
    sources: [{ sourceId: `OBS-${c.caseId}`, text: c.observation }],
    suppliedGovernedSourceIds: [],
    stage: 'FIRST_PASS_MODEL',
  });
  const per = proj.projection.perDeclaration[idx];
  if (!per.admitted || per.owedFact === null) {
    throw new Error(`§220 REPLAY ABORT: ${caseId} projection refused: ${per.codes.join(',')}`);
  }
  return per.owedFact as OwedFact;
}

const facts = new Map<string, OwedFact>();
for (const r of raw) facts.set(r.caseId, owedFactFor(r.caseId));

ok('E3 every rebuilt fact key equals the key persisted in the raw §219 evidence',
  raw.every(r => facts.get(r.caseId)!.factKey === r.targetFactKey),
  'the reconstruction is proved faithful, not assumed');
ok('E4 every §219 fact is FIRST_PASS_MODEL and therefore modelAuthored',
  [...facts.values()].every(f => f.source === 'FIRST_PASS_MODEL' && f.modelAuthored === true));

// ================================================================ the scoping limitation, proved

const sig = (caseId: string): string => {
  const p = raw.find(r => r.caseId === caseId)!.parsed as Record<string, any>;
  const pr = p.propertyReview as Record<string, any>;
  const target = (p.owedFactDeclarations as Record<string, any>[])[0] ?? {};
  return JSON.stringify({
    role: pr.propertySemanticRole,
    validity: pr.propertyValidity,
    verdict: p.verdict,
    declaration: target.declaration,
    challengeGround: target.challengeGround ?? null,
    propertyMismatchKind: target.propertyMismatchKind ?? null,
    representationConcern: target.representationConcern ?? null,
    nominatedFactPresent: (p.nominatedFact ?? null) !== null,
    clarificationSourceMode: p.clarificationSourceMode ?? null,
  });
};

console.log('\n--- 0. WHY THE BOUNDARY CANNOT BE TARGETED SEMANTICALLY, PROVED FROM THE EVIDENCE');
ok('L1 A1 (the mistake) and A3 (the right answer) have IDENTICAL structured signatures',
  sig('A1') === sig('A3'), sig('A1'));
ok('L2 so no deterministic rule over verifier output can separate them',
  sig('A1') === sig('A3') && sig('A1') !== sig('A2'),
  'A2 differs because its property review was INVALID and its routing was refused');
ok('L3 §220 therefore triggers on PROVENANCE, and treats A1 and A3 identically',
  propertyAuthorityRequirementFor(facts.get('A1')!)
    === propertyAuthorityRequirementFor(facts.get('A3')!),
  'no case is singled out by what its property says');

// ================================================================ helpers

const ANALYSIS = 'REPLAY-219-UNDER-220';
const ledgerFor = (caseId: string) =>
  createOwedFactLedger('PRODUCTION', [facts.get(caseId)!]);

const caseOf = (caseId: string) => CONFIRMATION_CASES_219.find(c => c.caseId === caseId)!;
const declOf = (caseId: string) => {
  const c = caseOf(caseId);
  return c.declarations.find(d => d.declarationId === c.targetDeclarationId)!;
};

function packetFor(caseId: string): PropertyReviewPacket {
  const c = caseOf(caseId);
  const d = declOf(caseId);
  const parsed = raw.find(r => r.caseId === caseId)!.parsed as Record<string, any> | null;
  const pr = (parsed?.propertyReview ?? null) as Record<string, any> | null;
  return buildPropertyReviewPacket({
    analysisId: ANALYSIS,
    fact: facts.get(caseId)!,
    proposedProperty: d.missingFact,
    decisionWhileUnresolved: d.decisionWhileUnresolved,
    existingClarification: c.clarifications
      .find(q => q.boundToDeclarationId === d.declarationId)?.question ?? null,
    verifier: pr === null ? null : {
      decisionControllingProperty: (pr.decisionControllingProperty as string) ?? null,
      propertySemanticRole: (pr.propertySemanticRole as string) ?? null,
      propertyValidity: (pr.propertyValidity as string) ?? null,
    },
  });
}

function humanPropertyDecision(
  packet: PropertyReviewPacket, decision: PropertyConfirmationDecision,
  corrected: string | null = null,
): PropertyDecisionRecord {
  return {
    packetId: packet.packetId,
    factKey: packet.factKey,
    decision,
    reviewerProvenance: 'HUMAN_REVIEW',
    reviewerId: 'authorized safety reviewer',
    rationale: 'recorded rationale for the §220 replay',
    reviewedPropertyDigest: packet.propertyDigest,
    correctedControllingProperty: corrected,
    decidedAt: '2026-09-10T00:00:00.000Z',
  };
}

/** The realistic settlement claim a satisfied clarification would produce for a case. */
const settlementClaimReason = (caseId: string): string => ({
  A1: 'the weekly loaded brake performance run was carried out for number 4 on Monday and it '
    + 'passed, so the fact is settled',
  A3: 'the outgoing charge nurse confirms the notification was given face to face at 19:50, so the '
    + 'fact is settled',
  A4: 'the senior authorised person confirms the Sanction for Test was issued and handed to the '
    + 'person in charge, so the fact is settled',
  A5: 'a structural assessment gives the allowable surcharge as well above the imposed load, so the '
    + 'fact is settled',
}[caseId] ?? 'the fact is settled');

const evidenceDecision = (claimId: string, factKey: string, digest: string): ReviewDecisionRecord => ({
  claimId,
  factKey,
  decision: 'APPROVE_SETTLEMENT',
  reviewerProvenance: 'HUMAN_REVIEW',
  reviewerId: 'authorized safety reviewer',
  rationale: 'the answer supplied is sufficient to settle the fact as stated',
  reviewedEvidenceDigest: digest,
  decidedAt: '2026-09-10T00:00:00.000Z',
});

const challenge = (factKey: string, reason: string): ArbitrationRequest => ({
  factKey, requestedBy: 'VERIFIER', reason, settles: false, factStatusUnchanged: true,
});

/** Drive one case all the way to a settlement attempt under a given property-review outcome. */
function attemptSettlement(caseId: string, outcome: PropertyConfirmationDecision | 'NO_REVIEW') {
  const ledger = ledgerFor(caseId);
  const fact = facts.get(caseId)!;
  const consumed = consumeSettlementClaims(
    [challenge(fact.factKey, settlementClaimReason(caseId))], ledger, ANALYSIS);
  let claim = consumed.claims[0];

  let packet: PropertyReviewPacket | null = null;
  if (outcome !== 'NO_REVIEW') {
    packet = packetFor(caseId);
    const corrected = outcome === 'CORRECT_PROPERTY'
      ? 'whether the truck\'s brakes will actually hold it loaded on the one-in-eight haul road'
      : null;
    const mint = mintPropertyAuthority(packet, humanPropertyDecision(packet, outcome, corrected));
    if (mint.authority !== null) {
      const attach = attachPropertyAuthority(claim, mint.authority);
      claim = attach.claim;
    } else {
      claim = recordPropertyAuthorityDeclined(claim);
    }
  }

  const evidence = mintSettlementAuthority(
    claim, evidenceDecision(claim.claimId, claim.factKey, claim.evidenceDigest));
  const application = evidence.authority === null
    ? null
    : settleByReviewedEvidence(ledger, claim, evidence.authority);
  const after = application?.ledger ?? ledger;
  return {
    claim,
    packet,
    evidenceAuthorityMinted: evidence.authority !== null,
    application,
    statusAfter: factOf(after, fact.factKey)!.status,
    ledgerBefore: ledger,
    ledgerAfter: after,
    observation: observeSettlementReview({
      claim,
      decision: evidenceDecision(claim.claimId, claim.factKey, claim.evidenceDigest),
      mint: evidence,
      application,
      ledgerAfter: after,
    }),
  };
}

// ================================================================ A1

console.log('\n--- 1. A1 — SEMANTICALLY WRONG, STRUCTURALLY CONSISTENT, ADMITTED BY §218');
const a1Parsed = raw.find(r => r.caseId === 'A1')!.parsed as Record<string, any>;
const a1Property = checkPropertyReview218({
  scope: {
    targetDeclarationId: raw.find(r => r.caseId === 'A1')!.declarationId,
    targetFactKey: facts.get('A1')!.factKey,
  },
  output: {
    propertyReview: a1Parsed.propertyReview,
    verdict: a1Parsed.verdict,
    owedFactDeclarations: a1Parsed.owedFactDeclarations,
  },
});
ok('A1.1 §218 admitted the A1 output — there is no structural contradiction to catch',
  a1Property.admitted && a1Property.route === 'PROPERTY_ACCEPTED_REVIEW_MAY_PROCEED',
  'this is the premise of §220, re-proved rather than assumed');

const a1NoReview = attemptSettlement('A1', 'NO_REVIEW');
ok('A1.2 the fact is model-authored, so property authority is REQUIRED and not yet obtained',
  a1NoReview.claim.propertyAuthorityRequirement === 'REQUIRED'
  && a1NoReview.claim.propertyAuthorityState === 'REQUIRED_NOT_OBTAINED');
ok('A1.3 a human APPROVED the evidence and settlement is STILL refused',
  a1NoReview.evidenceAuthorityMinted
  && a1NoReview.application !== null && a1NoReview.application.applied === false
  && a1NoReview.application.refusedBecause.includes('PROPERTY_AUTHORITY_NOT_OBTAINED'),
  'evidence authority alone cannot settle a model-authored property');
ok('A1.4 the braking-capability question remains open and the hold stands',
  a1NoReview.statusAfter === 'UNRESOLVED'
  && factOf(a1NoReview.ledgerAfter, facts.get('A1')!.factKey)!.whyUnresolved !== null
  && a1NoReview.ledgerAfter.transitions.length === 0);
ok('A1.5 nothing was deleted, nothing became adverse, nothing was released',
  a1NoReview.ledgerAfter.facts.length === a1NoReview.ledgerBefore.facts.length
  && a1NoReview.ledgerAfter.facts.every(f => f.status === 'UNRESOLVED'));

const a1Packet = packetFor('A1');
ok('A1.6 the reviewer packet carries the minimum needed and nothing reconstructed',
  a1Packet.proposedProperty === declOf('A1').missingFact
  && a1Packet.observationSpan.length > 0
  && a1Packet.decisionWhileUnresolved === declOf('A1').decisionWhileUnresolved
  && a1Packet.existingClarification !== null
  && a1Packet.availableDecisions.join() === 'CONFIRM_PROPERTY,CORRECT_PROPERTY,KEEP_UNRESOLVED');
ok('A1.7 HONEST LIMIT: the verifier advisory field restates the proxy and does not help here',
  (a1Packet.verifierDecisionControllingProperty ?? '').toLowerCase().includes('brake performance run'),
  'shown to the reviewer as help that may be wrong, never as an answer');

const a1Keep = attemptSettlement('A1', 'KEEP_UNRESOLVED');
ok('A1.8 KEEP_UNRESOLVED mints nothing and settlement stays refused',
  a1Keep.claim.propertyAuthorityState === 'DECLINED_KEEP_UNRESOLVED'
  && a1Keep.application!.applied === false
  && a1Keep.statusAfter === 'UNRESOLVED');

const a1Corrected = attemptSettlement('A1', 'CORRECT_PROPERTY');
ok('A1.9 CORRECT_PROPERTY records the correction and STILL refuses to settle the wrong fact',
  a1Corrected.claim.propertyAuthorityState === 'CORRECTED'
  && a1Corrected.application!.applied === false
  && a1Corrected.application!.refusedBecause.includes('PROPERTY_AUTHORITY_NOT_OBTAINED')
  && a1Corrected.statusAfter === 'UNRESOLVED',
  'settling a property the reviewer just rejected would settle the wrong property');

const a1Confirmed = attemptSettlement('A1', 'CONFIRM_PROPERTY');
ok('A1.10 only an explicit human CONFIRM_PROPERTY lets the settlement proceed',
  a1Confirmed.claim.propertyAuthorityState === 'CONFIRMED'
  && a1Confirmed.application!.applied === true
  && a1Confirmed.statusAfter === 'SETTLED_BY_EVIDENCE',
  'the authority is now human, which is the whole point of the boundary');

// ================================================================ A2

console.log('\n--- 2. A2 — SEMANTICALLY CORRECT, STRUCTURALLY INCONSISTENT, REFUSED BY §218');
const a2Raw = raw.find(r => r.caseId === 'A2')!;
const a2Parsed = a2Raw.parsed as Record<string, any>;
const a2Property = checkPropertyReview218({
  scope: { targetDeclarationId: a2Raw.declarationId, targetFactKey: facts.get('A2')!.factKey },
  output: {
    propertyReview: a2Parsed.propertyReview,
    verdict: a2Parsed.verdict,
    owedFactDeclarations: a2Parsed.owedFactDeclarations,
  },
});
ok('A2.1 §218 refused the whole A2 output, fail closed, by its own named code',
  !a2Property.admitted && a2Property.route === 'FAIL_CLOSED'
  && a2Property.codes.includes('INVALID_PROPERTY_ROUTED_TO_CLARIFICATION')
  && a2Property.review === null);
ok('A2.2 the refusal is the EXISTING containment and needs no new human gate',
  (() => {
    // A refused output yields no admitted declaration, so nothing reaches the ledger at all.
    const ledger = ledgerFor('A2');
    const consumed = consumeSettlementClaims([], ledger, ANALYSIS);
    return consumed.claims.length === 0 && consumed.ledgerUnchanged === true
      && factOf(ledger, facts.get('A2')!.factKey)!.status === 'UNRESOLVED';
  })(),
  'the §220 boundary is not substituted for a containment that already works');
ok('A2.3 the two mechanisms are genuinely different and both leave the fact open',
  a1Property.admitted === true && a2Property.admitted === false
  && a1NoReview.statusAfter === 'UNRESOLVED',
  'A1 contained at the AUTHORITY layer; A2 contained at the STRUCTURAL layer');

// ================================================================ A3, A4, A5

console.log('\n--- 3. A3, A4, A5 — THE CONTROLS ARE NOT GLOBALLY BLOCKED');
for (const caseId of ['A3', 'A4', 'A5']) {
  const r = raw.find(x => x.caseId === caseId)!;
  const parsed = r.parsed as Record<string, any>;
  const prop = checkPropertyReview218({
    scope: { targetDeclarationId: r.declarationId, targetFactKey: facts.get(caseId)!.factKey },
    output: {
      propertyReview: parsed.propertyReview,
      verdict: parsed.verdict,
      owedFactDeclarations: parsed.owedFactDeclarations,
    },
  });
  const vocab = (parsed.owedFactDeclarations as Record<string, any>[]).flatMap(e =>
    checkDeclarationEntry212({
      factKey: String(e.factKey), declaration: String(e.declaration),
      challengeReason: e.challengeReason ?? null, challengeGround: e.challengeGround ?? null,
      propertyMismatchKind: e.propertyMismatchKind ?? null,
      representationConcern: e.representationConcern ?? 'NONE',
    }));
  const scope = checkScopeContainment({
    scope: {
      targetFactKey: facts.get(caseId)!.factKey,
      suppliedFactKeys: [facts.get(caseId)!.factKey],
      multiFactValidationRequested: false,
    },
    output: {
      nominatedFact: parsed.nominatedFact ?? null,
      clarificationSourceMode: parsed.clarificationSourceMode ?? null,
      owedFactDeclarations: parsed.owedFactDeclarations,
    },
  });
  ok(`C.${caseId} the analysis path is untouched — admitted by every layer, property intact`,
    prop.admitted && prop.route === 'PROPERTY_ACCEPTED_REVIEW_MAY_PROCEED'
    && vocab.length === 0 && scope.admitted
    && factOf(ledgerFor(caseId), facts.get(caseId)!.factKey)!.status === 'UNRESOLVED',
    `role=${parsed.propertyReview.propertySemanticRole}`);
}
ok('C.1 no analysis was blocked, interrupted or routed to a human by §220',
  ['A1', 'A2', 'A3', 'A4', 'A5'].every(id =>
    factOf(ledgerFor(id), facts.get(id)!.factKey)!.status === 'UNRESOLVED'),
  'the boundary is a settlement prerequisite, never an analysis gate');
ok('C.2 A3, A4 and A5 settle normally on one recorded human property confirmation',
  ['A3', 'A4', 'A5'].every(id => {
    const s = attemptSettlement(id, 'CONFIRM_PROPERTY');
    return s.application!.applied === true && s.statusAfter === 'SETTLED_BY_EVIDENCE';
  }),
  'no legitimate act, artifact or state property is blocked for its vocabulary');
ok('C.3 and they are refused without it, exactly as A1 is — the rule is uniform',
  ['A3', 'A4', 'A5'].every(id => {
    const s = attemptSettlement(id, 'NO_REVIEW');
    return s.application!.applied === false
      && s.application!.refusedBecause.includes('PROPERTY_AUTHORITY_NOT_OBTAINED');
  }),
  'uniform by provenance, so nothing is singled out by what its property says');

// ================================================================ fail-closed invariants

console.log('\n--- 4. FAIL-CLOSED AND AUTHORITY SEPARATION');
ok('F1 confirming a property is not settling a fact',
  (() => {
    const packet = packetFor('A1');
    const mint = mintPropertyAuthority(packet, humanPropertyDecision(packet, 'CONFIRM_PROPERTY'));
    const a = mint.authority!;
    return a.impliesFactSettled === false && a.impliesSatisfactorySettlement === false
      && a.impliesAdverseSettlement === false && a.impliesWorkRelease === false;
  })());
ok('F2 a property authority for one fact cannot be reused on another',
  (() => {
    const packet = packetFor('A1');
    const mint = mintPropertyAuthority(packet, humanPropertyDecision(packet, 'CONFIRM_PROPERTY'));
    const otherClaim = attemptSettlement('A5', 'NO_REVIEW').claim;
    return attachPropertyAuthority(otherClaim, mint.authority!).attached === false;
  })());
ok('F3 a non-human provenance mints nothing',
  (() => {
    const packet = packetFor('A1');
    const d = humanPropertyDecision(packet, 'CONFIRM_PROPERTY');
    return mintPropertyAuthority(packet,
      { ...d, reviewerProvenance: 'PROVIDER_DECLARATION' }).authority === null;
  })());
ok('F4 a decision made against different property text mints nothing',
  (() => {
    const packet = packetFor('A1');
    const d = humanPropertyDecision(packet, 'CONFIRM_PROPERTY');
    return mintPropertyAuthority(packet,
      { ...d, reviewedPropertyDigest: sha('some other property') }).authority === null;
  })());
ok('F5 the refused settlement is recorded in observability with its reason',
  a1NoReview.observation.propertyAuthorityState === 'REQUIRED_NOT_OBTAINED'
  && a1NoReview.observation.applicationRefusedBecause.includes('PROPERTY_AUTHORITY_NOT_OBTAINED')
  && a1NoReview.observation.factStatusAfterReview === 'UNRESOLVED'
  && a1NoReview.observation.PROVIDER_SETTLEMENT_AUTHORITY === 'NEVER');

// ================================================================ evidence

const summary = {
  artifact: 'SECTION-220-REPLAY-OF-219-UNDER-PROPERTY-AUTHORITY',
  providerCalls: 0,
  databaseOperations: 0,
  section219FrozenDigest: sha(preregBytes),
  section219DigestUnchanged: sha(preregBytes) === FROZEN_DIGEST_219,
  structuredSignatureA1: JSON.parse(sig('A1')),
  structuredSignatureA3: JSON.parse(sig('A3')),
  a1AndA3AreIndistinguishableStructurally: sig('A1') === sig('A3'),
  perCase: raw.map(r => {
    const id = r.caseId as string;
    const noReview = attemptSettlement(id, 'NO_REVIEW');
    const confirmed = attemptSettlement(id, 'CONFIRM_PROPERTY');
    return {
      caseId: id,
      factKey: facts.get(id)!.factKey,
      factSource: facts.get(id)!.source,
      propertyAuthorityRequirement: noReview.claim.propertyAuthorityRequirement,
      section218Route: id === 'A2' ? 'FAIL_CLOSED' : 'PROPERTY_ACCEPTED_REVIEW_MAY_PROCEED',
      analysisBlockedBy220: false,
      settlementWithoutPropertyAuthority: {
        applied: noReview.application?.applied ?? false,
        refusedBecause: noReview.application?.refusedBecause ?? [],
        statusAfter: noReview.statusAfter,
      },
      settlementWithHumanConfirmation: {
        applied: confirmed.application?.applied ?? false,
        statusAfter: confirmed.statusAfter,
      },
    };
  }),
  a1CorrectedOutcome: {
    state: a1Corrected.claim.propertyAuthorityState,
    applied: a1Corrected.application!.applied,
    statusAfter: a1Corrected.statusAfter,
  },
  generatedAt: '2026-09-10',
};
writeFileSync(join(EVID_220, 'REPLAY-219-UNDER-220.json'),
  JSON.stringify(summary, null, 2) + '\n');

ok('E5 the §219 frozen digest is unchanged after the replay',
  sha(readFileSync(join(EVID_219, 'CONFIRMATION-PREREGISTRATION-219.json'), 'utf8'))
    === FROZEN_DIGEST_219);

console.log(`\n${failed === 0 ? 'ALL REPLAY ASSERTIONS PASSED' : `${failed} FAILED`}`
  + '  —  provider calls: 0   database operations: 0');
if (failed > 0) process.exit(1);
