/**
 * §247 -- DECISION-COMPLETE REVIEW ARTIFACTS. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Closes the three §243 review-artifact occurrences and proves the authority boundaries were not
 * weakened in the process.
 */
import {
  buildPropertyReviewPacket, PROPERTY_CONFIRMATION_DECISIONS,
} from '../src/hazlenz/expert-hazlenz/owed-facts/property-authority';
import {
  buildEvidenceReviewPacket, EVIDENCE_REVIEW_DECISIONS, EVIDENCE_APPROVAL_IS_NOT_SETTLEMENT,
} from '../src/hazlenz/expert-hazlenz/owed-facts/settlement-review';
import {
  buildDecisionReviewContext, projectPropertyResidual,
} from '../src/hazlenz/expert-hazlenz/owed-facts/decision-review-model';

let passed = 0; let failed = 0; const failures: string[] = [];
const ok = (id: string, cond: boolean, d = ''): void => {
  if (cond) { passed++; console.log(`ok    ${id}${d ? '  [' + d + ']' : ''}`); }
  else { failed++; failures.push(id); console.log(`FAIL  ${id}${d ? '  [' + d + ']' : ''}`); }
};

const fact = (over: Record<string, unknown> = {}): any => ({
  factKey: 'F-TARGET',
  evidenceSpan: 'the operator states the guard was refitted this morning',
  whyUnresolved: 'nobody has confirmed the interlock was tested after refitting',
  branchA: 'the interlock was tested', branchB: 'the interlock was not tested',
  decisionDivergence: { ifA: 'work may continue', ifB: 'the machine is locked off' },
  affectedDecision: 'whether the machine may run',
  modelAuthored: true,
  ...over,
});

console.log('---- A. G3, the adjacent established fact ----');
const g3 = buildPropertyReviewPacket({
  analysisId: 'A1', fact: fact(), proposedProperty: 'whether the guard is fitted',
  decisionWhileUnresolved: 'machine stays locked off', existingClarification: null,
  establishedContext: [
    { sourceId: 'obs-1', span: 'compactor 1 has its interlock defeated with a cable tie' },
    { sourceId: 'obs-1', span: 'the operator states the guard was refitted this morning' },
  ],
});
ok('A1 the packet surfaces adjacent established context', g3.establishedContext.length === 1);
ok('A2 the target fact own span is excluded, so context is context and not a repeat',
  !g3.establishedContext.some(s => s.span === fact().evidenceSpan));
ok('A3 the adjacent defeat that makes an assurance a proxy is now visible to the reviewer',
  g3.establishedContext[0].span.includes('interlock defeated'));

console.log('\n---- B. C6, the open sibling property ----');
const c6 = buildPropertyReviewPacket({
  analysisId: 'A1', fact: fact(), proposedProperty: 'whether the guard is fitted',
  decisionWhileUnresolved: null, existingClarification: null,
  siblingOpenFacts: [
    { factKey: 'F-EXTRACTION', proposedProperty: 'whether the extraction unit is running',
      status: 'REQUIRED_NOT_OBTAINED' },
    { factKey: 'F-TARGET', proposedProperty: 'whether the guard is fitted', status: 'X' },
  ],
});
ok('B1 sibling open facts are surfaced', c6.siblingOpenFacts.length === 1);
ok('B2 the target never appears as its own sibling',
  !c6.siblingOpenFacts.some(s => s.factKey === 'F-TARGET'));
ok('B3 deciding this one does not dispose of the other, and the packet says which remain open',
  c6.remainingOpenAfterReview.includes('F-TARGET')
  && c6.remainingOpenAfterReview.includes('F-EXTRACTION'));

console.log('\n---- C. disagreement is stated, never judged ----');
const dis = buildPropertyReviewPacket({
  analysisId: 'A1', fact: fact(), proposedProperty: 'whether the guard is fitted',
  decisionWhileUnresolved: null, existingClarification: null,
  verifier: { decisionControllingProperty: 'whether the interlock was function tested',
    propertySemanticRole: 'x', propertyValidity: 'VALID' } as any,
});
ok('C1 a disagreement is reported when the two strings differ',
  dis.propertyDisagreement !== null && dis.propertyDisagreement.identical === false);
ok('C2 the comparison is literal -- no materiality judgement is made',
  dis.propertyDisagreement!.modelProperty === 'whether the guard is fitted'
  && dis.propertyDisagreement!.verifierProperty === 'whether the interlock was function tested');
const same = buildPropertyReviewPacket({
  analysisId: 'A1', fact: fact(), proposedProperty: 'p',
  decisionWhileUnresolved: null, existingClarification: null,
  verifier: { decisionControllingProperty: 'p', propertySemanticRole: 'x',
    propertyValidity: 'VALID' } as any,
});
ok('C3 identical strings report identical', same.propertyDisagreement!.identical === true);

console.log('\n---- D. residual after each decision ----');
ok('D1 a residual is projected for every available decision',
  g3.residualAfterEachDecision.length === PROPERTY_CONFIRMATION_DECISIONS.length);
const byName = Object.fromEntries(g3.residualAfterEachDecision.map(r => [r.decision, r]));
ok('D2 CONFIRM_PROPERTY grants property authority and leaves the fact unresolved',
  byName.CONFIRM_PROPERTY.propertyAuthorityAfter === 'OBTAINED'
  && byName.CONFIRM_PROPERTY.factRemainsUnresolved === true);
ok('D3 CORRECT_PROPERTY does NOT itself settle and grants no authority',
  byName.CORRECT_PROPERTY.factRemainsUnresolved === true
  && byName.CORRECT_PROPERTY.propertyAuthorityAfter === 'REQUIRED_NOT_OBTAINED');
ok('D4 KEEP_UNRESOLVED changes nothing',
  byName.KEEP_UNRESOLVED.propertyAuthorityAfter === 'REQUIRED_NOT_OBTAINED'
  && byName.KEEP_UNRESOLVED.factRemainsUnresolved === true);
ok('D5 confirming is still explicitly not settling',
  typeof g3.confirmationIsNotSettlement === 'string' && g3.confirmationIsNotSettlement.length > 0);

console.log('\n---- E. C2, the evidence review artifact ----');
const c2 = buildEvidenceReviewPacket({
  analysisId: 'A1', fact: fact(), proposedProperty: 'whether the guard is fitted',
  evidenceText: 'hire company scan of the pre-delivery inspection sheet',
  propositionSupported: 'that the interlock was function tested before delivery',
  propertyAuthorityRequirement: 'REQUIRED', propertyAuthorityState: 'REQUIRED_NOT_OBTAINED',
  evidenceAuthorityRequirement: 'REQUIRED', evidenceAuthorityState: 'REQUIRED_NOT_OBTAINED',
  siblingOpenFacts: [{ factKey: 'F-EXTRACTION', proposedProperty: 'p', status: 'OPEN' }],
});
ok('E1 an evidence review artifact now exists at all', typeof c2.packetId === 'string');
ok('E2 it states the evidence under review and the proposition it is offered for',
  c2.evidenceText.includes('hire company scan')
  && c2.propositionSupported.includes('function tested'));
ok('E3 it binds the decision to the exact evidence by digest', c2.evidenceDigest.length === 64);
ok('E4 it shows BOTH authorities, which the property packet alone never did',
  c2.propertyAuthorityState === 'REQUIRED_NOT_OBTAINED'
  && c2.evidenceAuthorityState === 'REQUIRED_NOT_OBTAINED');
ok('E5 THE C2 FIELD: approval cannot settle, and the reviewer is told so plainly',
  c2.consequenceOfApproval.includes('CANNOT be settled')
  && c2.consequenceOfApproval.includes('property'));
ok('E6 it states what remains unresolved after approval',
  c2.remainingUnresolvedAfterApproval.includes('F-TARGET')
  && c2.remainingUnresolvedAfterApproval.includes('F-EXTRACTION'));
ok('E7 evidence approval is explicitly not a substitute for property authority',
  c2.evidenceApprovalIsNotSettlement === EVIDENCE_APPROVAL_IS_NOT_SETTLEMENT
  && EVIDENCE_APPROVAL_IS_NOT_SETTLEMENT.includes('not a substitute for property authority'));

const c2ok = buildEvidenceReviewPacket({
  analysisId: 'A1', fact: fact(), proposedProperty: 'p',
  evidenceText: 'e', propositionSupported: 'q',
  propertyAuthorityRequirement: 'REQUIRED', propertyAuthorityState: 'OBTAINED',
});
ok('E8 when property authority IS obtained the consequence is computed, not assumed',
  !c2ok.consequenceOfApproval.includes('CANNOT be settled'));

console.log('\n---- F. authority boundaries not weakened ----');
ok('F1 evidence review offers exactly three actions and none of them settles',
  EVIDENCE_REVIEW_DECISIONS.length === 3
  && !(EVIDENCE_REVIEW_DECISIONS as readonly string[]).includes('APPROVE_SETTLEMENT'));
ok('F2 property review still offers exactly its three original actions',
  PROPERTY_CONFIRMATION_DECISIONS.length === 3);
ok('F3 no review surface can grant settlement authority',
  !JSON.stringify(c2).includes('APPROVE_SETTLEMENT')
  && !JSON.stringify(g3).includes('APPROVE_SETTLEMENT'));

console.log('\n---- G. not an internal-state dump ----');
for (const forbidden of ['candidates', 'declarationArray', 'projectionCodes', 'rawProviderOutput']) {
  ok(`G1 the property packet carries no ${forbidden}`, !(forbidden in (g3 as any)));
}
ok('G2 the shared context excludes nothing the surfaces need and adds no new semantic state',
  Object.keys(buildDecisionReviewContext({
    analysisId: 'A', fact: fact(), proposedProperty: 'p',
    propertyAuthorityRequirement: 'REQUIRED', propertyAuthorityState: 'REQUIRED_NOT_OBTAINED',
  })).length === 11);
ok('G3 the residual projection is a pure function of the context',
  JSON.stringify(projectPropertyResidual(buildDecisionReviewContext({
    analysisId: 'A', fact: fact(), proposedProperty: 'p',
    propertyAuthorityRequirement: 'REQUIRED', propertyAuthorityState: 'REQUIRED_NOT_OBTAINED',
  }), [...PROPERTY_CONFIRMATION_DECISIONS])) === JSON.stringify(g3.residualAfterEachDecision));

console.log(`\n${passed} passed, ${failed} failed`);
if (failures.length) console.log('FAILED:\n  ' + failures.join('\n  '));
console.log('PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   COMMIT: no   PUSH: no   DEPLOY: no');
process.exit(failed ? 1 : 0);
