/**
 * §228B — DERIVE the authoritative end state from the persisted §228 raw legs.
 *
 * ZERO PROVIDER CALLS. Every stage runs through the REAL runtime modules. Nothing is repaired,
 * reconstructed or manufactured: where a stage cannot run because an upstream output failed, the
 * downstream questions are recorded NOT_EXERCISED under the frozen rules.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { project210jDeclarations } from './lib/expert-210j-declaration-projection';
import { preserveIdentifiedSafetyFacts } from './lib/expert-205-declaration-preservation';
import { checkPropertyReview218 } from './lib/expert-218-property-consistency';
import { checkScopeContainment } from './lib/expert-214-scope-containment';
import {
  INTEGRATED_CASES_228A, type IntegratedCase228A,
} from './lib/expert-228a-integrated-instrument';
import { observationSourceIdFor228A, analysisIdFor228A } from './lib/expert-228b-assembly';

import type { OwedFact, ArbitrationRequest }
  from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types';
import { createOwedFactLedger, factOf }
  from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  consumeSettlementClaims, mintSettlementAuthority, settleByReviewedEvidence,
  attachPropertyAuthority, recordPropertyAuthorityDeclined,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/settlement-review';
import {
  buildPropertyReviewPacket, mintPropertyAuthority, propertyAuthorityRequirementFor,
  type PropertyReviewPacket, type PropertyConfirmationDecision,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/property-authority';

const EVID = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-228-targeted-integrated-revalidation-2026-09-11');
const sha = (s: string): string => createHash('sha256').update(s).digest('hex');
const AT = '2026-09-11T00:00:00.000Z';

const readJsonl = (f: string): Record<string, any>[] =>
  readFileSync(join(EVID, f), 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));

const fpByCase = new Map<string, Record<string, any>>();
for (const r of readJsonl('RAW-228-FIRST-PASS.jsonl')) fpByCase.set(r.caseId, r);
const vfByCase = new Map<string, Record<string, any>>();
for (const r of readJsonl('RAW-228-VERIFIER.jsonl')) vfByCase.set(r.caseId, r);

const shapeOf = (v: unknown): string =>
  Array.isArray(v) ? 'ARRAY' : typeof v === 'string' ? 'STRING'
    : v === undefined || v === null ? 'ABSENT' : 'OTHER';

/**
 * THE FROZEN CONDITIONAL-CORRECTION RULE, applied.
 *
 * Semantic identity is the product owner's adjudication. It is recorded here with the declared and
 * frozen propositions side by side so the determination is inspectable rather than buried, and the
 * rule itself is exactly as frozen: correct where they differ, confirm where they do not.
 */
const CONDITIONAL_DETERMINATION: Record<string, {
  declaredIsTheFrozenProperty: boolean; adjudication: string;
}> = {
  C3: {
    declaredIsTheFrozenProperty: false,
    adjudication: 'The frozen controlling property is whether the hood is still achieving adequate '
      + 'capture of the wood dust at source in its moved position. The first pass declared whether '
      + 'sanding is currently being carried out under the present LEV configuration WITHOUT '
      + 'additional interim controls. That is a question about what controls are in place right now, '
      + 'not about the physical state of capture, and its branches divide management responses '
      + 'rather than dividing the property. It is not the frozen proposition and it is not even one '
      + 'of the four annotated proxies. The rule fires: CORRECT_PROPERTY.',
  },
  C8: {
    declaredIsTheFrozenProperty: true,
    adjudication: 'The frozen controlling property is whether operating the walkway-side emergency '
      + 'pull-cord will actually stop the belt. The first pass declared whether the emergency '
      + 'pull-cord along this walkway currently stops the belt when operated. Same proposition. A '
      + 'reviewer cannot honestly correct a property they agree with, so the rule produces '
      + 'CONFIRM_PROPERTY and the CORRECT_PROPERTY axis is NOT_EXERCISED on this case.',
  },
};

interface ExerciseResult {
  exerciseId: string; ran: boolean; notExercisedBecause: string | null;
  targetFactKey: string | null; targetDeclaredProperty: string | null;
  propertyAuthorityRequirement: string | null;
  propertyAuthorityAtClaim: string | null;
  humanPropertyActionFrozen: string; humanPropertyActionApplied: string | null;
  conditionalRuleFired: boolean | null;
  propertyAuthorityOutcome: string | null; propertyAuthorityAfter: string | null;
  correctedControllingProperty: string | null;
  authorityLiterals: Record<string, unknown> | null;
  humanEvidenceActionFrozen: string; evidenceAuthorityMinted: boolean;
  evidenceRefusedBecause: readonly string[];
  settlementAttempted: boolean; settlementApplied: boolean;
  settlementRefusedBecause: readonly string[];
  factStatusAfter: string | null; ledgerTransitions: number;
  transitions: readonly Record<string, unknown>[];
  siblingsStillUnresolved: readonly { factKey: string; status: string }[];
  packetFields: Record<string, unknown> | null;
  matchesFrozenExpectation: boolean | null; mismatches: readonly string[];
}

const endStates: Record<string, any>[] = [];

function runExercise(
  c: IntegratedCase228A, e: IntegratedCase228A['exercises'][number],
  facts: OwedFact[], declaredByFactKey: Map<string, string>,
  verifierCtx: Record<string, any> | null,
): ExerciseResult {
  const base: ExerciseResult = {
    exerciseId: e.exerciseId, ran: false, notExercisedBecause: null,
    targetFactKey: null, targetDeclaredProperty: null,
    propertyAuthorityRequirement: null, propertyAuthorityAtClaim: null,
    humanPropertyActionFrozen: e.humanPropertyAction, humanPropertyActionApplied: null,
    conditionalRuleFired: null,
    propertyAuthorityOutcome: null, propertyAuthorityAfter: null,
    correctedControllingProperty: null, authorityLiterals: null,
    humanEvidenceActionFrozen: e.humanEvidenceAction, evidenceAuthorityMinted: false,
    evidenceRefusedBecause: [], settlementAttempted: false, settlementApplied: false,
    settlementRefusedBecause: [], factStatusAfter: null, ledgerTransitions: 0, transitions: [],
    siblingsStillUnresolved: [], packetFields: null,
    matchesFrozenExpectation: null, mismatches: [],
  };
  if (e.targetPropertyId === 'NONE') {
    return { ...base, notExercisedBecause: 'the case owns nothing by design; there is no target' };
  }
  if (facts.length === 0) {
    return { ...base, notExercisedBecause:
      'NO ADMITTED FACT — the upstream first pass produced nothing for this stage to act on' };
  }

  // The frozen exercise targets a frozen property. Map it to the admitted fact carrying that
  // proposition. Order of emission is the provider's; the frozen target is ours.
  const frozenProp = c.expectedOwedProperties.find(p => p.id === e.targetPropertyId)!;
  const idx = c.expectedOwedProperties.findIndex(p => p.id === e.targetPropertyId);
  const target = facts.length === 1 ? facts[0]
    : (TARGET_FACT_KEY_BY_EXERCISE[e.exerciseId] !== undefined
      ? facts.find(f => f.factKey === TARGET_FACT_KEY_BY_EXERCISE[e.exerciseId]) ?? facts[idx] ?? facts[0]
      : facts[idx] ?? facts[0]);
  const siblings = facts.filter(f => f.factKey !== target.factKey);

  const ledger = createOwedFactLedger('PRODUCTION', facts);
  const req: ArbitrationRequest = {
    factKey: target.factKey, requestedBy: 'VERIFIER', settles: false, factStatusUnchanged: true,
    reason: 'the §228B frozen exercise raises this fact for human settlement review',
  };
  const consumed = consumeSettlementClaims([req], ledger, `${analysisIdFor228A(c.caseId)}-228B`);
  if (consumed.claims.length === 0) {
    return { ...base, notExercisedBecause:
      `claim refused: ${JSON.stringify(consumed.refused)}` };
  }
  let claim = consumed.claims[0];
  const bornState = claim.propertyAuthorityState;

  // ---- the preregistered human property action
  let applied: PropertyConfirmationDecision | 'NONE' = 'NONE';
  let conditionalFired: boolean | null = null;
  if (e.humanPropertyAction === 'CONDITIONAL_CORRECT') {
    const det = CONDITIONAL_DETERMINATION[c.caseId];
    conditionalFired = !det.declaredIsTheFrozenProperty;
    applied = conditionalFired ? 'CORRECT_PROPERTY' : 'CONFIRM_PROPERTY';
  } else if (e.humanPropertyAction !== 'NONE') {
    applied = e.humanPropertyAction as PropertyConfirmationDecision;
  }

  let packet: PropertyReviewPacket | null = null;
  let outcome: string | null = null;
  let literals: Record<string, unknown> | null = null;
  let corrected: string | null = null;

  if (applied !== 'NONE') {
    const declared = declaredByFactKey.get(target.factKey) ?? target.whyUnresolved ?? target.factKey;
    packet = buildPropertyReviewPacket({
      analysisId: analysisIdFor228A(c.caseId),
      fact: target,
      proposedProperty: declared,
      decisionWhileUnresolved: null,
      existingClarification: null,
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
      rationale: 'recorded rationale for the §228B frozen exercise',
      reviewedPropertyDigest: packet.propertyDigest,
      correctedControllingProperty: corrected,
      decidedAt: AT,
    });
    outcome = mint.authority === null
      ? `NO_AUTHORITY_MINTED:${mint.refusedBecause.join(',')}` : mint.authority.outcome;
    if (mint.authority !== null) {
      literals = {
        impliesFactSettled: mint.authority.impliesFactSettled,
        impliesSatisfactorySettlement: mint.authority.impliesSatisfactorySettlement,
        impliesAdverseSettlement: mint.authority.impliesAdverseSettlement,
        impliesWorkRelease: mint.authority.impliesWorkRelease,
        scope: mint.authority.scope,
        controllingProperty: mint.authority.controllingProperty,
      };
      claim = attachPropertyAuthority(claim, mint.authority).claim;
    } else {
      claim = recordPropertyAuthorityDeclined(claim);
    }
  }

  // ---- the preregistered evidence action, recorded separately and always
  let evidenceAuthority: ReturnType<typeof mintSettlementAuthority> | null = null;
  if (e.humanEvidenceAction !== 'NONE') {
    evidenceAuthority = mintSettlementAuthority(claim, {
      claimId: claim.claimId, factKey: claim.factKey,
      decision: e.humanEvidenceAction as 'APPROVE_SETTLEMENT' | 'REJECT_SETTLEMENT'
        | 'LEAVE_UNRESOLVED',
      reviewerProvenance: 'HUMAN_REVIEW', reviewerId: 'authorized safety reviewer',
      rationale: 'recorded evidence rationale for the §228B frozen exercise',
      reviewedEvidenceDigest: claim.evidenceDigest, decidedAt: AT,
    });
  }

  const application = evidenceAuthority?.authority
    ? settleByReviewedEvidence(ledger, claim, evidenceAuthority.authority) : null;
  const after = application?.ledger ?? ledger;
  const finalFact = factOf(after, target.factKey)!;

  const result: ExerciseResult = {
    ...base, ran: true,
    targetFactKey: target.factKey,
    targetDeclaredProperty: declaredByFactKey.get(target.factKey) ?? null,
    propertyAuthorityRequirement: propertyAuthorityRequirementFor(target),
    propertyAuthorityAtClaim: bornState,
    humanPropertyActionApplied: applied,
    conditionalRuleFired: conditionalFired,
    propertyAuthorityOutcome: outcome,
    propertyAuthorityAfter: claim.propertyAuthorityState,
    correctedControllingProperty: corrected,
    authorityLiterals: literals,
    evidenceAuthorityMinted: evidenceAuthority?.authority != null,
    evidenceRefusedBecause: evidenceAuthority?.refusedBecause ?? [],
    settlementAttempted: application !== null,
    settlementApplied: application?.applied ?? false,
    settlementRefusedBecause: application?.refusedBecause ?? [],
    factStatusAfter: finalFact.status,
    ledgerTransitions: after.transitions.length,
    transitions: after.transitions.map(t => ({ ...t })),
    siblingsStillUnresolved: siblings.map(s => ({
      factKey: s.factKey, status: factOf(after, s.factKey)!.status,
    })),
    packetFields: packet === null ? null : {
      packetId: packet.packetId,
      observationSpanPresent: packet.observationSpan.length > 0,
      proposedPropertyPresent: packet.proposedProperty.length > 0,
      branchesPresent: packet.branchA.length > 0 && packet.branchB.length > 0,
      decisionsPresent: packet.decisionIfA.length > 0 && packet.decisionIfB.length > 0,
      proposedProperty: packet.proposedProperty,
    },
    matchesFrozenExpectation: null, mismatches: [],
  };

  // ---- compare against the frozen expectation, field by field
  const m: string[] = [];
  if (result.propertyAuthorityAtClaim !== e.expectedPropertyAuthorityAtClaim) {
    m.push(`propertyAuthorityAtClaim ${result.propertyAuthorityAtClaim} != frozen `
      + `${e.expectedPropertyAuthorityAtClaim}`);
  }
  const expAfter = e.humanPropertyAction === 'CONDITIONAL_CORRECT'
    ? (conditionalFired ? 'CORRECTED' : 'CONFIRMED') : e.expectedPropertyAuthorityAfter;
  if (result.propertyAuthorityAfter !== expAfter) {
    m.push(`propertyAuthorityAfter ${result.propertyAuthorityAfter} != frozen ${expAfter}`);
  }
  if (result.evidenceAuthorityMinted !== e.expectedEvidenceAuthorityMinted) {
    m.push(`evidenceAuthorityMinted ${result.evidenceAuthorityMinted} != frozen `
      + `${e.expectedEvidenceAuthorityMinted}`);
  }
  if (result.settlementApplied !== e.expectedSettlementApplied) {
    m.push(`settlementApplied ${result.settlementApplied} != frozen ${e.expectedSettlementApplied}`);
  }
  if (result.factStatusAfter !== e.expectedFactStatusAfter) {
    m.push(`factStatusAfter ${result.factStatusAfter} != frozen ${e.expectedFactStatusAfter}`);
  }
  if (result.ledgerTransitions !== e.expectedLedgerTransitions) {
    m.push(`ledgerTransitions ${result.ledgerTransitions} != frozen `
      + `${e.expectedLedgerTransitions}`);
  }
  for (const code of e.expectedSettlementRefusalCodes) {
    if (!result.settlementRefusedBecause.includes(code)
      && !(code === 'FACT_NOT_IN_LEDGER' && !result.ran)) {
      m.push(`expected refusal code ${code} absent`);
    }
  }
  for (const s of e.siblingsThatMustRemainUnresolved) {
    void s;
    if (result.siblingsStillUnresolved.some(x => x.status !== 'UNRESOLVED')) {
      m.push('a sibling left UNRESOLVED');
    }
  }
  return { ...result, mismatches: m, matchesFrozenExpectation: m.length === 0 };
}

/** C4 emitted the conduit declaration first; the frozen C4-E1 targets the asbestos property. */
const TARGET_FACT_KEY_BY_EXERCISE: Record<string, string> = {};

// ================================================================ per case

for (const c of INTEGRATED_CASES_228A) {
  const fp = fpByCase.get(c.caseId) ?? null;
  const parsed = (fp?.parsed ?? null) as Record<string, any> | null;
  const decls = parsed?.unresolvedFactDeclarations;
  const srcId = observationSourceIdFor228A(c.caseId);

  const structural: string[] = [];
  const contained: { defect: string; containment: string }[] = [];
  if (fp?.failureClass !== 'NO_FAILURE') structural.push(`FIRST_PASS_${fp?.failureClass}`);
  if (shapeOf(decls) === 'STRING') structural.push('DECLARATIONS_RETURNED_AS_A_STRING');
  if (shapeOf(decls) === 'ABSENT' && parsed !== null) {
    structural.push('DECLARATIONS_FIELD_ABSENT_FROM_A_REQUIRED_SCHEMA_FIELD');
    contained.push({
      defect: 'the provider truncated at max_tokens and the required unresolvedFactDeclarations '
        + 'field never arrived',
      containment: 'the field was never parsed or reconstructed; no fact was admitted; the verifier '
        + 'leg was elided; the failure is named in the end state as a structural provider defect',
    });
  }

  // ---- projection through the REAL §210J path, only where the shape permits it
  const admitted: OwedFact[] = [];
  const refused: { declarationId: string; reason: string }[] = [];
  const declaredByFactKey = new Map<string, string>();
  let preservedRecords: Record<string, any>[] = [];
  let projectionCodes: { declarationId: string; codes: readonly string[] }[] = [];

  if (Array.isArray(decls)) {
    // RR-7: the harness malformation, applied to a COPY of the persisted raw. The provider output
    // itself is never edited and the raw leg on disk is the unmodified original.
    const working = JSON.parse(JSON.stringify(decls)) as Record<string, any>[];
    if (c.harnessMalformation !== null && working.length > 0) {
      working[0][c.harnessMalformation.field] = c.harnessMalformation.fillerValue;
    }
    const adapted = working.map(d => ({ ...d, observationSourceId: srcId }));
    const proj = project210jDeclarations({
      declarations: adapted as unknown as readonly unknown[],
      sources: [{ sourceId: srcId, text: c.observation }],
      suppliedGovernedSourceIds: c.governedEvidence.map(g => g.sourceId),
      stage: 'FIRST_PASS_MODEL',
    });
    proj.projection.perDeclaration.forEach((per, i) => {
      const id = String(adapted[i]?.declarationId ?? `(index ${i})`);
      projectionCodes.push({ declarationId: id, codes: per.codes });
      if (per.admitted && per.owedFact !== null) {
        admitted.push(per.owedFact as OwedFact);
        declaredByFactKey.set((per.owedFact as OwedFact).factKey,
          String(adapted[i].missingFact ?? ''));
      } else refused.push({ declarationId: id, reason: per.codes.join(',') || 'NOT_ADMITTED' });
    });
    const pres = preserveIdentifiedSafetyFacts(proj.projection as any, adapted as any);
    preservedRecords = ((pres as any).records ?? (pres as any).preserved ?? []) as Record<string, any>[];
  }

  // C4: bind the frozen asbestos target to the admitted fact carrying that proposition.
  if (c.caseId === 'C4') {
    const acm = admitted.find(f => /asbestos/i.test(declaredByFactKey.get(f.factKey) ?? ''));
    if (acm) TARGET_FACT_KEY_BY_EXERCISE['C4-E1'] = acm.factKey;
  }

  // ---- verifier stage through the REAL consistency and containment layers
  const vf = vfByCase.get(c.caseId) ?? null;
  const pr = (vf?.parsed?.propertyReview ?? null) as Record<string, any> | null;
  let verifierConsistency: unknown = null;
  let scopeContainment: unknown = null;
  if (pr !== null && vf !== null) {
    const vOut = (vf.parsed ?? {}) as Record<string, any>;
    // The §218 payload supplies exactly one fact. suppliedFactKeys is therefore the single target,
    // which is what makes a nomination of any sibling a containment failure rather than a nicety.
    verifierConsistency = checkPropertyReview218({
      scope: { targetDeclarationId: String(vf.declarationId), targetFactKey: String(vf.factKey) },
      output: {
        propertyReview: vOut.propertyReview,
        verdict: vOut.verdict,
        owedFactDeclarations: vOut.owedFactDeclarations,
      },
    });
    scopeContainment = checkScopeContainment({
      scope: {
        targetFactKey: String(vf.factKey),
        suppliedFactKeys: [String(vf.factKey)],
        multiFactValidationRequested: false,
      },
      output: {
        nominatedFact: vOut.nominatedFact ?? null,
        clarificationSourceMode: vOut.clarificationSourceMode,
        owedFactDeclarations: vOut.owedFactDeclarations,
      },
    });
  }

  // ---- the preregistered exercises
  const exercises = c.exercises.map(e => runExercise(c, e, admitted, declaredByFactKey, pr));

  endStates.push({
    caseId: c.caseId,
    firstPass: {
      failureClass: fp?.failureClass ?? 'NO_CALL',
      stopReason: fp?.stopReason ?? null,
      outputTokens: fp?.outputTokens ?? null,
      declarationsShape: shapeOf(decls),
      declarationCount: Array.isArray(decls) ? decls.length : null,
      candidates: (parsed?.expertHazardCandidates ?? []).map((x: any) => ({
        candidateKey: x.candidateKey, assertedConditionState: x.assertedConditionState,
        hazardFamily: x.hazardFamily, reasoning: x.reasoning,
      })),
      clarificationIds: (parsed?.decisionCriticalClarifications ?? [])
        .map((q: any) => ({ id: q.clarificationId, answers: q.answersUnresolvedFactDeclarationId })),
      uncertainty: parsed?.uncertainty ?? null,
      outcome: parsed?.outcome ?? null,
      declarations: Array.isArray(decls) ? decls : null,
      outputRepaired: false,
    },
    structuralDefects: structural,
    containedDefects: contained,
    projection: { admittedCount: admitted.length, refused, projectionCodes,
      admittedFactKeys: admitted.map(f => f.factKey),
      admittedProperties: admitted.map(f => declaredByFactKey.get(f.factKey) ?? null) },
    rr7: c.harnessMalformation === null ? null : {
      applied: Array.isArray(decls) && decls.length > 0,
      appliedBy: 'THE_FROZEN_HARNESS_NOT_THE_PROVIDER',
      field: c.harnessMalformation.field, fillerValue: c.harnessMalformation.fillerValue,
      rawPersistedBeforeMalformation: true, providerOutputEdited: false,
      preservedRecords,
      preservedCount: preservedRecords.length,
      expectedPreservedProperty: c.harnessMalformation.expectedPreservedProperty,
    },
    verifier: vf === null ? { exercised: false,
      reason: c.verifierCalls === 0 ? 'FROZEN_ELISION' : 'NO_ADMITTED_DECLARATION' } : {
      exercised: true, failureClass: vf.failureClass, targetFactKey: vf.factKey,
      declarationId: vf.declarationId,
      propertyReview: pr, consistency: verifierConsistency, scopeContainment,
    },
    exercises,
    ledgerAtEnd: {
      facts: admitted.map(f => ({ factKey: f.factKey, status: f.status,
        modelAuthored: f.modelAuthored, affectedDecision: f.affectedDecision })),
      transitionsAcrossAllExercises: exercises.reduce((n, e) => n + e.ledgerTransitions, 0),
    },
  });
}

const doc = {
  artifact: 'SECTION-228-RAW-RESULTS',
  derivedFrom: { firstPass: 'RAW-228-FIRST-PASS.jsonl', verifier: 'RAW-228-VERIFIER.jsonl' },
  frozenDigest: '4c91ae539f18efdad0f37e30967e8b188b659864fac8ab0cda08c8e2dea0c3cc',
  providerCallsInDerivation: 0,
  databaseOperations: 0,
  outputRepaired: false,
  semanticsReconstructedFromProse: false,
  owedFactsManufactured: false,
  conditionalCorrectionDeterminations: CONDITIONAL_DETERMINATION,
  cases: endStates,
};
writeFileSync(join(EVID, 'SECTION-228-RAW-RESULTS.json'), JSON.stringify(doc, null, 2) + '\n');

console.log('case  fp                 decls admitted  verifier            authAfter        '
  + 'settled  trans  matchesFrozen');
for (const s of endStates) {
  const e = s.exercises[0] ?? {};
  console.log(`${s.caseId.padEnd(5)} ${String(s.firstPass.failureClass).padEnd(18)} `
    + `${String(s.firstPass.declarationCount ?? '-').padStart(5)} `
    + `${String(s.projection.admittedCount).padStart(8)}  `
    + `${String(s.verifier.exercised ? s.verifier.propertyReview?.propertySemanticRole : s.verifier.reason).padEnd(19)} `
    + `${String(e.propertyAuthorityAfter ?? '-').padEnd(16)} `
    + `${String(e.settlementApplied ?? '-').padEnd(8)} `
    + `${String(e.ledgerTransitions ?? '-').padStart(5)}  ${e.matchesFrozenExpectation}`);
}
console.log(`\nwritten: SECTION-228-RAW-RESULTS.json (${endStates.length} cases)`);
