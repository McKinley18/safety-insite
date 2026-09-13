/**
 * §243 — DERIVE the authoritative end state from the persisted §243 raw legs.
 *
 * ZERO PROVIDER CALLS. Every stage runs through the REAL runtime modules. Nothing is repaired,
 * reconstructed or manufactured: where a stage cannot run because an upstream output failed, the
 * downstream questions are recorded NOT_EXERCISED under the frozen rules, never credited as a pass.
 *
 * Transcribed from derive-231-authoritative-state.ts onto the re-frozen §242A cases.
 */

import { createHash } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { project210jDeclarations } from './lib/expert-210j-declaration-projection';
import { preserveIdentifiedSafetyFacts } from './lib/expert-205-declaration-preservation';
import { checkPropertyReview218 } from './lib/expert-218-property-consistency';
import { checkScopeContainment } from './lib/expert-214-scope-containment';
import {
  frozenCases243, observationSourceIdFor243, analysisIdFor243, type FrozenCase243,
} from './lib/expert-243-assembly';

import type { OwedFact, ArbitrationRequest }
  from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
import { createOwedFactLedger, factOf }
  from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  consumeSettlementClaims, mintSettlementAuthority, settleByReviewedEvidence,
  attachPropertyAuthority, recordPropertyAuthorityDeclined,
} from '../src/hazlenz/expert-hazlenz/owed-facts/settlement-review';
import {
  buildPropertyReviewPacket, mintPropertyAuthority, propertyAuthorityRequirementFor,
  type PropertyReviewPacket, type PropertyConfirmationDecision,
} from '../src/hazlenz/expert-hazlenz/owed-facts/property-authority';

const EVID = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-243-final-fresh-acceptance-execution-2026-09-12');
const sha = (s: string): string => createHash('sha256').update(s).digest('hex');
const AT = '2026-09-12T00:00:00.000Z';

const readJsonl = (f: string): Record<string, any>[] => {
  const p = join(EVID, f);
  return existsSync(p)
    ? readFileSync(p, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
};

const fpByCase = new Map<string, Record<string, any>>();
for (const r of readJsonl('RAW-243-FIRST-PASS.jsonl')) fpByCase.set(r.caseId, r);
const vfByCase = new Map<string, Record<string, any>>();
for (const r of readJsonl('RAW-243-VERIFIER.jsonl')) vfByCase.set(r.caseId, r);
const projByCase = new Map<string, Record<string, any>>();
for (const r of readJsonl('PROJECTION-243-FIRST-PASS.jsonl')) projByCase.set(r.caseId, r);

const shapeOf = (v: unknown): string =>
  Array.isArray(v) ? 'ARRAY' : typeof v === 'string' ? 'STRING'
    : v === undefined || v === null ? 'ABSENT' : 'OTHER';

type Exercise = FrozenCase243 extends { exercises: infer E } ? E : any;

const carried: Record<string, { ledger: any; claim: any }> = {};

function runExercise(
  c: any, e: any, facts: OwedFact[], declaredByFactKey: Map<string, string>,
  verifierCtx: Record<string, any> | null, stageIndex: number,
  clarificationFor: Map<string, string>,
): Record<string, any> {
  const frozenProp = c.owedProperties.find((p: any) => p.id === e.targetPropertyId);
  const base: Record<string, any> = {
    exerciseId: e.exerciseId, shape: e.shape, ran: false, notExercisedBecause: null,
    targetFactKey: null, targetDeclaredProperty: null,
    frozenControllingProperty: frozenProp?.controllingProperty ?? '(none)',
    propertyAuthorityRequirement: null, propertyAuthorityAtClaim: null,
    humanPropertyActionFrozen: e.humanPropertyAction, humanPropertyActionApplied: null,
    propertyAuthorityOutcome: null, propertyAuthorityAfter: null,
    correctedControllingProperty: null, authorityLiterals: null,
    humanEvidenceActionFrozen: e.humanEvidenceAction, evidenceAuthorityMinted: false,
    evidenceRefusedBecause: [], settlementAttempted: false, settlementApplied: false,
    settlementRefusedBecause: [], factStatusAfter: null, ledgerTransitions: 0, transitions: [],
    siblingsStillUnresolved: [], packetFields: null,
    matchesFrozenExpectation: null, mismatches: [],
  };
  if (frozenProp === undefined) {
    return { ...base, notExercisedBecause: 'the frozen exercise names no owed property' };
  }
  if (facts.length === 0) {
    const expectsNothingInLedger = e.humanPropertyAction === 'NONE'
      && e.humanEvidenceAction === 'NONE' && e.expectedLedgerTransitions === 0
      && e.expectedSettlementApplied === false && e.expectedEvidenceAuthorityMinted === false
      && e.expectedFactStatusAfter === 'UNRESOLVED'
      && (e.expectedRefusalCodes ?? []).includes('FACT_NOT_IN_LEDGER');
    if (!expectsNothingInLedger) {
      return { ...base, notExercisedBecause:
        'NO ADMITTED FACT — the upstream first pass produced nothing for this stage to act on' };
    }
    return { ...base, factStatusAfter: 'UNRESOLVED', ledgerTransitions: 0,
      settlementRefusedBecause: ['FACT_NOT_IN_LEDGER'],
      matchesFrozenExpectation: true, mismatches: [] };
  }

  const idxFrozen = c.owedProperties.findIndex((p: any) => p.id === e.targetPropertyId);
  const target = facts.length === 1 ? facts[0] : (facts[idxFrozen] ?? facts[0]);
  const siblings = facts.filter(f => f.factKey !== target.factKey);

  // A later stage of a multi-stage case runs on the ledger and claim the previous stage left behind,
  // which is what the frozen two-stage expectation describes.
  const prior = stageIndex > 0 ? carried[c.caseId] : undefined;
  const ledger = prior?.ledger ?? createOwedFactLedger('PRODUCTION', facts);
  const req: ArbitrationRequest = {
    factKey: target.factKey, requestedBy: 'VERIFIER', settles: false, factStatusUnchanged: true,
    reason: 'the frozen §242A exercise raises this fact for human settlement review',
  };
  const consumed = consumeSettlementClaims([req], ledger, `${analysisIdFor243(c.caseId)}-243`);
  if (consumed.claims.length === 0) {
    return { ...base, notExercisedBecause: `claim refused: ${JSON.stringify(consumed.refused)}` };
  }
  let claim = prior?.claim ?? consumed.claims[0];
  const bornState = claim.propertyAuthorityState;
  const ranOnCarriedState = prior !== undefined;

  const applied: PropertyConfirmationDecision | 'NONE' =
    e.humanPropertyAction === 'NONE' ? 'NONE' : e.humanPropertyAction as PropertyConfirmationDecision;

  let packet: PropertyReviewPacket | null = null;
  let outcome: string | null = null;
  let literals: Record<string, unknown> | null = null;
  let corrected: string | null = null;

  if (applied !== 'NONE') {
    const declared = declaredByFactKey.get(target.factKey) ?? target.whyUnresolved ?? target.factKey;
    // The first pass emitted clarifications. The product packet has a slot for the one bound to
    // this fact, so the harness supplies it rather than passing null and then scoring the product
    // for an omission the harness caused.
    packet = buildPropertyReviewPacket({
      analysisId: analysisIdFor243(c.caseId), fact: target, proposedProperty: declared,
      decisionWhileUnresolved: null,
      existingClarification: clarificationFor.get(target.factKey) ?? null,
      verifier: verifierCtx === null ? null : {
        decisionControllingProperty: verifierCtx.decisionControllingProperty ?? null,
        propertySemanticRole: verifierCtx.propertySemanticRole ?? null,
        propertyValidity: verifierCtx.propertyValidity ?? null,
      },
    });
    corrected = applied === 'CORRECT_PROPERTY' ? frozenProp.controllingProperty : null;
    const mint = mintPropertyAuthority(packet, {
      packetId: packet.packetId, factKey: packet.factKey, decision: applied,
      reviewerProvenance: 'HUMAN_REVIEW', reviewerId: 'authorized safety reviewer',
      rationale: 'recorded rationale for the frozen §242A exercise',
      reviewedPropertyDigest: packet.propertyDigest,
      correctedControllingProperty: corrected, decidedAt: AT,
    });
    outcome = mint.authority === null
      ? `NO_AUTHORITY_MINTED:${mint.refusedBecause.join(',')}` : mint.authority.outcome;
    if (mint.authority !== null) {
      literals = {
        impliesFactSettled: mint.authority.impliesFactSettled,
        impliesSatisfactorySettlement: mint.authority.impliesSatisfactorySettlement,
        impliesAdverseSettlement: mint.authority.impliesAdverseSettlement,
        impliesWorkRelease: mint.authority.impliesWorkRelease,
        scope: mint.authority.scope, controllingProperty: mint.authority.controllingProperty,
      };
      claim = attachPropertyAuthority(claim, mint.authority).claim;
    } else {
      claim = recordPropertyAuthorityDeclined(claim);
    }
  }

  let evidenceAuthority: ReturnType<typeof mintSettlementAuthority> | null = null;
  if (e.humanEvidenceAction !== 'NONE') {
    evidenceAuthority = mintSettlementAuthority(claim, {
      claimId: claim.claimId, factKey: claim.factKey,
      decision: e.humanEvidenceAction as 'APPROVE_SETTLEMENT' | 'REJECT_SETTLEMENT' | 'LEAVE_UNRESOLVED',
      reviewerProvenance: 'HUMAN_REVIEW', reviewerId: 'authorized safety reviewer',
      rationale: 'recorded evidence rationale for the frozen §242A exercise',
      reviewedEvidenceDigest: claim.evidenceDigest, decidedAt: AT,
    });
  }

  const application = evidenceAuthority?.authority
    ? settleByReviewedEvidence(ledger, claim, evidenceAuthority.authority) : null;
  const after = application?.ledger ?? ledger;
  const finalFact = factOf(after, target.factKey)!;

  carried[c.caseId] = { ledger: after, claim };
  const result: Record<string, any> = {
    ...base, ran: true, ranOnCarriedState, targetFactKey: target.factKey,
    targetDeclaredProperty: declaredByFactKey.get(target.factKey) ?? null,
    propertyAuthorityRequirement: propertyAuthorityRequirementFor(target),
    propertyAuthorityAtClaim: bornState, humanPropertyActionApplied: applied,
    propertyAuthorityOutcome: outcome, propertyAuthorityAfter: claim.propertyAuthorityState,
    correctedControllingProperty: corrected, authorityLiterals: literals,
    evidenceAuthorityMinted: evidenceAuthority?.authority != null,
    evidenceRefusedBecause: evidenceAuthority?.refusedBecause ?? [],
    settlementAttempted: application !== null, settlementApplied: application?.applied ?? false,
    settlementRefusedBecause: application?.refusedBecause ?? [],
    factStatusAfter: finalFact.status, ledgerTransitions: after.transitions.length,
    transitions: after.transitions.map((t: any) => ({ ...t })),
    siblingsStillUnresolved: siblings.map(s => ({
      factKey: s.factKey, status: factOf(after, s.factKey)!.status,
    })),
    packetFields: packet === null ? null : {
      packetId: packet.packetId,
      observationSpanPresent: packet.observationSpan.length > 0,
      observationSpan: packet.observationSpan,
      proposedPropertyPresent: packet.proposedProperty.length > 0,
      proposedProperty: packet.proposedProperty,
      branchesPresent: packet.branchA.length > 0 && packet.branchB.length > 0,
      branchA: packet.branchA, branchB: packet.branchB,
      decisionsPresent: packet.decisionIfA.length > 0 && packet.decisionIfB.length > 0,
      decisionIfA: packet.decisionIfA, decisionIfB: packet.decisionIfB,
      existingClarification: packet.existingClarification,
      hazlenzExplanation: packet.hazlenzExplanation,
      decisionWhileUnresolved: packet.decisionWhileUnresolved,
      verifierDecisionControllingProperty: packet.verifierDecisionControllingProperty,
      verifierPropertySemanticRole: packet.verifierPropertySemanticRole,
      verifierPropertyValidity: packet.verifierPropertyValidity,
      reviewerQuestion: packet.reviewerQuestion,
      requirement: packet.requirement, state: packet.state,
      confirmationIsNotSettlement: packet.confirmationIsNotSettlement,
      packetFieldNames: Object.keys(packet),
    },
  };

  const m: string[] = [];
  const cmp = (got: any, want: any, label: string): void => {
    if (got !== want) m.push(`${label} ${String(got)} != frozen ${String(want)}`);
  };
  cmp(result.propertyAuthorityAtClaim, e.expectedPropertyAuthorityAtClaim, 'propertyAuthorityAtClaim');
  cmp(result.propertyAuthorityAfter, e.expectedPropertyAuthorityAfter, 'propertyAuthorityAfter');
  cmp(result.evidenceAuthorityMinted, e.expectedEvidenceAuthorityMinted, 'evidenceAuthorityMinted');
  cmp(result.settlementApplied, e.expectedSettlementApplied, 'settlementApplied');
  cmp(result.factStatusAfter, e.expectedFactStatusAfter, 'factStatusAfter');
  cmp(result.ledgerTransitions, e.expectedLedgerTransitions, 'ledgerTransitions');
  // A refusal code can only be OBSERVED where a settlement was actually attempted. Where the frozen
  // exercise names no evidence action, no settlement is attempted, so the code is NOT_EXERCISED
  // rather than absent. Recording it as a mismatch would convert an unexercised axis into a failure,
  // which invariants 23 and 25 forbid. Both facts are recorded.
  const refusalCodesNotExercised: string[] = [];
  for (const code of (e.expectedRefusalCodes ?? [])) {
    const present = result.settlementRefusedBecause.includes(code)
      || result.evidenceRefusedBecause.includes(code)
      || String(result.propertyAuthorityOutcome ?? '').includes(code);
    if (present) continue;
    if (!result.settlementAttempted) { refusalCodesNotExercised.push(code); continue; }
    m.push(`expected refusal code ${code} absent`);
  }
  result.refusalCodesNotExercised = refusalCodesNotExercised;
  result.refusalCodeAxisNotExercisedBecause = refusalCodesNotExercised.length === 0 ? null
    : 'the frozen exercise names no human evidence action, so no settlement was attempted and the '
      + 'refusal could not be observed. The claim state that would produce it is recorded in '
      + 'propertyAuthorityAtClaim.';
  if ((e.siblingsThatMustRemainUnresolved ?? []).length > 0
    && result.siblingsStillUnresolved.some((x: any) => x.status !== 'UNRESOLVED')) {
    m.push('a sibling did not remain UNRESOLVED');
  }
  return { ...result, mismatches: m, matchesFrozenExpectation: m.length === 0 };
}

// ================================================================ per case

const endStates: Record<string, any>[] = [];
const endStatesExtra: Record<string, any> = {};

for (const c of frozenCases243() as any[]) {
  const fp = fpByCase.get(c.caseId) ?? null;
  const parsed = (fp?.parsed ?? null) as Record<string, any> | null;
  const decls = parsed?.unresolvedFactDeclarations;
  const srcId = observationSourceIdFor243(c.caseId);
  const proj = projByCase.get(c.caseId) ?? null;

  const structural: string[] = [];
  const contained: { defect: string; containment: string }[] = [];
  if (fp === null) structural.push('NO_FIRST_PASS_CALL_RECORDED');
  else if (fp.failureClass !== 'NO_FAILURE') structural.push(`FIRST_PASS_${fp.failureClass}`);
  if (shapeOf(decls) === 'STRING') structural.push('DECLARATIONS_RETURNED_AS_A_STRING');
  if (shapeOf(decls) === 'ABSENT' && parsed !== null) {
    structural.push('DECLARATIONS_FIELD_ABSENT_FROM_A_REQUIRED_SCHEMA_FIELD');
    contained.push({ defect: 'a required schema field never arrived in the tool_use input',
      containment: 'the field was never parsed or reconstructed; no fact was admitted' });
  }
  if (proj !== null && proj.admitted === false) {
    structural.push(`POSTURE_PROJECTION_REFUSED:${(proj.codes ?? []).join(',')}`);
    contained.push({ defect: `the §239 projection refused the posture: ${(proj.codes ?? []).join(',')}`,
      containment: 'the posture was not admitted, may not close the analysis and requires upstream '
        + 'repair. The preserved record names the codes. Nothing downstream consumed it.' });
  }

  const admitted: OwedFact[] = [];
  const refused: { declarationId: string; reason: string }[] = [];
  const declaredByFactKey = new Map<string, string>();
  const projectionCodes: { declarationId: string; codes: readonly string[] }[] = [];
  let preservedRecords: Record<string, any>[] = [];
  let projForDecls: any = null;

  if (Array.isArray(decls)) {
    const adapted = decls.map((d: any) => ({ ...d, observationSourceId: srcId }));
    const p = project210jDeclarations({
      declarations: adapted as unknown as readonly unknown[],
      sources: [{ sourceId: srcId, text: c.observation }],
      suppliedGovernedSourceIds: c.governedRecords.map((g: any) => g.sourceId),
      stage: 'FIRST_PASS_MODEL',
    });
    projForDecls = p.projection;
    p.projection.perDeclaration.forEach((per: any, idx: number) => {
      const id = String(decls[idx]?.declarationId ?? `(index ${idx})`);
      projectionCodes.push({ declarationId: id, codes: per.codes });
      if (per.admitted && per.owedFact !== null) {
        admitted.push(per.owedFact);
        declaredByFactKey.set(per.owedFact.factKey, String(decls[idx]?.missingFact ?? ''));
      } else {
        refused.push({ declarationId: id, reason: per.codes.join(',') || 'NOT_ADMITTED' });
      }
    });
    const pres = preserveIdentifiedSafetyFacts(p.projection as any,
      adapted as unknown as readonly unknown[]);
    preservedRecords = ((pres as any)?.preserved ?? []) as Record<string, any>[];
    (endStatesExtra as any)[c.caseId] = {
      preservationDispositions: (pres as any)?.dispositions ?? [],
    };
  }

  // verifier leg
  const vf = vfByCase.get(c.caseId) ?? null;
  const pr = (vf?.parsed?.propertyReview ?? null) as Record<string, any> | null;
  let verifierConsistency: Record<string, any> | null = null;
  let scopeContainment: Record<string, any> | null = null;
  if (pr !== null) {
    const vOut = (vf!.parsed ?? {}) as Record<string, any>;
    try {
      verifierConsistency = checkPropertyReview218({
        scope: { targetDeclarationId: String(vf!.declarationId), targetFactKey: String(vf!.factKey) },
        output: { propertyReview: vOut.propertyReview, verdict: vOut.verdict,
          owedFactDeclarations: vOut.owedFactDeclarations },
      } as any) as any;
    } catch (e) { verifierConsistency = { threw: String(e) }; }
    try {
      scopeContainment = checkScopeContainment({
        scope: { targetFactKey: String(vf!.factKey), suppliedFactKeys: [String(vf!.factKey)],
          multiFactValidationRequested: false },
        output: { nominatedFact: vOut.nominatedFact ?? null,
          clarificationSourceMode: vOut.clarificationSourceMode,
          owedFactDeclarations: vOut.owedFactDeclarations },
      } as any) as any;
    } catch (e) { scopeContainment = { threw: String(e) }; }
  }

  // map admitted factKey -> the clarification question bound to its declaration, where one exists
  const clarificationFor = new Map<string, string>();
  if (Array.isArray(decls)) {
    const qs = (parsed?.decisionCriticalClarifications ?? []) as Record<string, any>[];
    decls.forEach((d: any, idx: number) => {
      const per = projForDecls?.perDeclaration?.[idx];
      const fk = per?.owedFact?.factKey;
      if (fk === undefined || fk === null) return;
      const bound = qs.find(q =>
        String(q.answersUnresolvedFactDeclarationId ?? '') === String(d.declarationId ?? ''));
      const q = bound ?? (qs.length === 1 ? qs[0] : undefined);
      if (q !== undefined) clarificationFor.set(String(fk), String(q.question ?? ''));
    });
  }
  const exercises = (c.exercises ?? []).map((e: any, i: number) =>
    runExercise(c, e, admitted, declaredByFactKey, pr, i, clarificationFor));

  endStates.push({
    caseId: c.caseId, domain: c.domain,
    frozenExpectedPosture: c.expectedPosture,
    frozenExpectedDeclarationCount: c.expectedDeclarationCount,
    frozenExpectedFinalAuthoritativeState: c.expectedFinalAuthoritativeState,
    firstPassFailureClass: fp?.failureClass ?? 'NO_CALL',
    firstPassStopReason: fp?.stopReason ?? null,
    outputTokens: fp?.outputTokens ?? null,
    projectionAdmitted: proj?.admitted ?? null,
    projectionCodesPosture: proj?.codes ?? [],
    emittedPosture: proj?.posture?.posture ?? parsed?.immediateSafetyPosture?.posture ?? null,
    recommendationState: proj?.recommendationState ?? null,
    derivedControllingDrivers: proj?.derivedControllingDrivers ?? [],
    derivedCessationDrivers: proj?.derivedCessationDrivers ?? [],
    declarationShape: shapeOf(decls),
    declarationsEmitted: Array.isArray(decls) ? decls.length : 0,
    declarationsAdmitted: admitted.length,
    declarationsRefused: refused,
    declarationProjectionCodes: projectionCodes,
    admittedFactKeys: admitted.map(f => f.factKey),
    declaredProperties: Array.from(declaredByFactKey.entries())
      .map(([k, v]) => ({ factKey: k, declaredMissingFact: v })),
    preservedRecordCount: preservedRecords.length,
    preservedRecords,
    preservationDispositions: (endStatesExtra[c.caseId]?.preservationDispositions) ?? [],
    structuralDefects: structural,
    containedComponentErrors: contained,
    verifierRan: vf !== null,
    verifierPropertyReview: pr,
    verifierConsistency, scopeContainment,
    exercises,
    reviewPacketMustSurface: c.reviewPacketMustSurface ?? [],
  });
}

const doc = {
  artifact: 'SECTION-243-AUTHORITATIVE-STATE',
  providerCalls: 0, databaseOperations: 0,
  derivedAt: new Date().toISOString(),
  frozenInstrumentDigest: 'cb36885a07fa5b14bbf257dbe69663f1829dbc9f6f4aef13a1460d05e2ec151c',
  everyStageRanThroughTheRealModules: true,
  nothingRepairedOrReconstructed: true,
  cases: endStates,
};
writeFileSync(join(EVID, 'SECTION-243-AUTHORITATIVE-STATE.json'), JSON.stringify(doc, null, 2) + '\n');
console.log(`derived ${endStates.length} case end states`);
for (const e of endStates) {
  console.log(`  ${e.caseId.padEnd(3)} posture ${String(e.emittedPosture ?? '-').padEnd(26)} `
    + `frozen ${String(e.frozenExpectedPosture).padEnd(26)} adm=${e.projectionAdmitted ? 'Y' : 'N'} `
    + `decl ${e.declarationsAdmitted}/${e.declarationsEmitted} (frozen ${e.frozenExpectedDeclarationCount}) `
    + `ex ${e.exercises.filter((x: any) => x.matchesFrozenExpectation === true).length}/${e.exercises.length}`);
}
