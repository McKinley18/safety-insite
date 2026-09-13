/**
 * §231 — DERIVE the authoritative end state from the persisted §231 raw legs.
 *
 * ZERO PROVIDER CALLS. Every stage runs through the REAL runtime modules. Nothing is repaired,
 * reconstructed or manufactured: where a stage cannot run because an upstream output failed, the
 * downstream questions are recorded NOT_EXERCISED under the frozen rules.
 *
 * The exercise-to-fact binding for a multi-property case is a RECORDED PRODUCT-OWNER
 * DETERMINATION, supplied in TARGET-BINDING-231.json and reproduced in the output so the
 * determination is inspectable rather than buried.
 */

import { createHash } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { project210jDeclarations } from './lib/expert-210j-declaration-projection';
import { preserveIdentifiedSafetyFacts } from './lib/expert-205-declaration-preservation';
import { checkPropertyReview218 } from './lib/expert-218-property-consistency';
import { checkScopeContainment } from './lib/expert-214-scope-containment';
import {
  ACCEPTANCE_CASES_230, type AcceptanceCase230,
} from './lib/expert-230-final-acceptance-instrument';
import { observationSourceIdFor230, analysisIdFor230 } from './lib/expert-231-assembly';

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
  'expert-hazlenz-231-final-fresh-acceptance-2026-09-11');
const sha = (s: string): string => createHash('sha256').update(s).digest('hex');
const AT = '2026-09-11T00:00:00.000Z';

const readJsonl = (f: string): Record<string, any>[] => {
  const p = join(EVID, f);
  return existsSync(p)
    ? readFileSync(p, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
};

/** PRIMARY then CONTINGENCY: the last record for a case is the one the frozen plan scores. */
const fpByCase = new Map<string, Record<string, any>>();
for (const r of readJsonl('RAW-231-FIRST-PASS.jsonl')) fpByCase.set(r.caseId, r);
const vfByCase = new Map<string, Record<string, any>>();
for (const r of readJsonl('RAW-231-VERIFIER.jsonl')) vfByCase.set(r.caseId, r);

const BINDING_PATH = join(EVID, 'TARGET-BINDING-231.json');
const BINDING: Record<string, { declarationIndex: number; rationale: string }> =
  existsSync(BINDING_PATH) ? JSON.parse(readFileSync(BINDING_PATH, 'utf8')) : {};

const shapeOf = (v: unknown): string =>
  Array.isArray(v) ? 'ARRAY' : typeof v === 'string' ? 'STRING'
    : v === undefined || v === null ? 'ABSENT' : 'OTHER';

interface ExerciseResult {
  exerciseId: string; ran: boolean; notExercisedBecause: string | null;
  targetFactKey: string | null; targetDeclaredProperty: string | null;
  frozenControllingProperty: string;
  bindingRationale: string | null;
  propertyAuthorityRequirement: string | null;
  propertyAuthorityAtClaim: string | null;
  humanPropertyActionFrozen: string; humanPropertyActionApplied: string | null;
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

/**
 * Run ONE frozen exercise against a ledger built from the admitted facts.
 *
 * `carryLedger` lets a two-stage case (C5) run stage two on the ledger stage one left behind, which
 * is what the frozen expectation for C5-E2 describes.
 */
function runExercise(
  c: AcceptanceCase230, e: AcceptanceCase230['exercises'][number],
  facts: OwedFact[], declaredByFactKey: Map<string, string>,
  verifierCtx: Record<string, any> | null,
): ExerciseResult {
  const frozenProp = c.owedProperties.find(p => p.id === e.targetPropertyId);
  const base: ExerciseResult = {
    exerciseId: e.exerciseId, ran: false, notExercisedBecause: null,
    targetFactKey: null, targetDeclaredProperty: null,
    frozenControllingProperty: frozenProp?.controllingProperty ?? '(none)',
    bindingRationale: null,
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
    // The frozen RR-7 expectation is that NOTHING enters the ledger: no property or evidence action,
    // zero transitions, the fact still UNRESOLVED and FACT_NOT_IN_LEDGER as the refusal. Where the
    // frozen expectation is exactly that, the absence IS the expectation and is compared as such.
    // Where it is not — an upstream failure denied a real settlement path its opportunity — the
    // exercise stays NOT_EXERCISED and is never credited as a pass. Invariants 23 and 25.
    const expectsNothingInLedger = e.humanPropertyAction === 'NONE'
      && e.humanEvidenceAction === 'NONE'
      && e.expectedLedgerTransitions === 0
      && e.expectedSettlementApplied === false
      && e.expectedEvidenceAuthorityMinted === false
      && e.expectedFactStatusAfter === 'UNRESOLVED'
      && e.expectedRefusalCodes.includes('FACT_NOT_IN_LEDGER');
    if (!expectsNothingInLedger) {
      return { ...base, notExercisedBecause:
        'NO ADMITTED FACT — the upstream first pass produced nothing for this stage to act on' };
    }
    return { ...base,
      notExercisedBecause: null,
      factStatusAfter: 'UNRESOLVED',
      ledgerTransitions: 0,
      settlementRefusedBecause: ['FACT_NOT_IN_LEDGER'],
      bindingRationale: 'the frozen exercise expects no fact in the ledger. Nothing was admitted, '
        + 'which is the frozen expectation itself and not an unexercised axis.',
      matchesFrozenExpectation: true, mismatches: [] };
  }

  const bind = BINDING[e.exerciseId];
  const idxFrozen = c.owedProperties.findIndex(p => p.id === e.targetPropertyId);
  const target = facts.length === 1 ? facts[0]
    : (bind !== undefined ? (facts[bind.declarationIndex] ?? facts[0])
      : (facts[idxFrozen] ?? facts[0]));
  const siblings = facts.filter(f => f.factKey !== target.factKey);

  const ledger = createOwedFactLedger('PRODUCTION', facts);
  const req: ArbitrationRequest = {
    factKey: target.factKey, requestedBy: 'VERIFIER', settles: false, factStatusUnchanged: true,
    reason: 'the §230 frozen exercise raises this fact for human settlement review',
  };
  const consumed = consumeSettlementClaims([req], ledger, `${analysisIdFor230(c.caseId)}-231`);
  if (consumed.claims.length === 0) {
    return { ...base, notExercisedBecause: `claim refused: ${JSON.stringify(consumed.refused)}` };
  }
  let claim = consumed.claims[0];
  const bornState = claim.propertyAuthorityState;

  let applied: PropertyConfirmationDecision | 'NONE' =
    e.humanPropertyAction === 'NONE' ? 'NONE' : e.humanPropertyAction as PropertyConfirmationDecision;

  let packet: PropertyReviewPacket | null = null;
  let outcome: string | null = null;
  let literals: Record<string, unknown> | null = null;
  let corrected: string | null = null;

  if (applied !== 'NONE') {
    const declared = declaredByFactKey.get(target.factKey) ?? target.whyUnresolved ?? target.factKey;
    packet = buildPropertyReviewPacket({
      analysisId: analysisIdFor230(c.caseId),
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
      rationale: 'recorded rationale for the §230 frozen exercise',
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

  let evidenceAuthority: ReturnType<typeof mintSettlementAuthority> | null = null;
  if (e.humanEvidenceAction !== 'NONE') {
    evidenceAuthority = mintSettlementAuthority(claim, {
      claimId: claim.claimId, factKey: claim.factKey,
      decision: e.humanEvidenceAction as 'APPROVE_SETTLEMENT' | 'REJECT_SETTLEMENT'
        | 'LEAVE_UNRESOLVED',
      reviewerProvenance: 'HUMAN_REVIEW', reviewerId: 'authorized safety reviewer',
      rationale: 'recorded evidence rationale for the §230 frozen exercise',
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
    bindingRationale: bind?.rationale ?? null,
    propertyAuthorityRequirement: propertyAuthorityRequirementFor(target),
    propertyAuthorityAtClaim: bornState,
    humanPropertyActionApplied: applied,
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

  const m: string[] = [];
  if (result.propertyAuthorityAtClaim !== e.expectedPropertyAuthorityAtClaim) {
    m.push(`propertyAuthorityAtClaim ${result.propertyAuthorityAtClaim} != frozen `
      + `${e.expectedPropertyAuthorityAtClaim}`);
  }
  if (result.propertyAuthorityAfter !== e.expectedPropertyAuthorityAfter) {
    m.push(`propertyAuthorityAfter ${result.propertyAuthorityAfter} != frozen `
      + `${e.expectedPropertyAuthorityAfter}`);
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
  for (const code of e.expectedRefusalCodes) {
    const present = result.settlementRefusedBecause.includes(code)
      || result.evidenceRefusedBecause.includes(code);
    if (!present) m.push(`expected refusal code ${code} absent`);
  }
  if (e.siblingsThatMustRemainUnresolved.length > 0
    && result.siblingsStillUnresolved.some(x => x.status !== 'UNRESOLVED')) {
    m.push('a sibling did not remain UNRESOLVED');
  }
  return { ...result, mismatches: m, matchesFrozenExpectation: m.length === 0 };
}

// ================================================================ per case

const endStates: Record<string, any>[] = [];

for (const c of ACCEPTANCE_CASES_230) {
  const fp = fpByCase.get(c.caseId) ?? null;
  const parsed = (fp?.parsed ?? null) as Record<string, any> | null;
  const decls = parsed?.unresolvedFactDeclarations;
  const srcId = observationSourceIdFor230(c.caseId);

  const structural: string[] = [];
  const contained: { defect: string; containment: string }[] = [];
  if (fp === null) structural.push('NO_FIRST_PASS_CALL_RECORDED');
  else if (fp.failureClass !== 'NO_FAILURE') structural.push(`FIRST_PASS_${fp.failureClass}`);
  if (shapeOf(decls) === 'STRING') structural.push('DECLARATIONS_RETURNED_AS_A_STRING');
  if (shapeOf(decls) === 'ABSENT' && parsed !== null) {
    structural.push('DECLARATIONS_FIELD_ABSENT_FROM_A_REQUIRED_SCHEMA_FIELD');
    contained.push({
      defect: 'a required schema field never arrived in the tool_use input',
      containment: 'the field was never parsed or reconstructed; no fact was admitted; the verifier '
        + 'leg was elided; the failure is named in the end state as a structural provider defect',
    });
  }

  const admitted: OwedFact[] = [];
  const refused: { declarationId: string; reason: string }[] = [];
  const declaredByFactKey = new Map<string, string>();
  let preservedRecords: Record<string, any>[] = [];
  const projectionCodes: { declarationId: string; codes: readonly string[] }[] = [];

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
      suppliedGovernedSourceIds: c.governedRecords.map(g => g.sourceId),
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
    preservedRecords =
      ((pres as any).records ?? (pres as any).preserved ?? []) as Record<string, any>[];
  }

  const vf = vfByCase.get(c.caseId) ?? null;
  const pr = (vf?.parsed?.propertyReview ?? null) as Record<string, any> | null;
  let verifierConsistency: unknown = null;
  let scopeContainment: unknown = null;
  if (pr !== null && vf !== null) {
    const vOut = (vf.parsed ?? {}) as Record<string, any>;
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

  const exercises = c.exercises.map(e => runExercise(c, e, admitted, declaredByFactKey, pr));

  endStates.push({
    caseId: c.caseId,
    domain: c.domain,
    frozenImmediatePosture: c.immediatePosture,
    frozenExpectedDeclarationCount: c.expectedDeclarationCount,
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
      clarifications: (parsed?.decisionCriticalClarifications ?? []),
      uncertainty: parsed?.uncertainty ?? null,
      outcome: parsed?.outcome ?? null,
      declarations: Array.isArray(decls) ? decls : null,
      fullParsed: parsed,
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
      admittedAfterMalformation: admitted.length,
    },
    verifier: vf === null ? { exercised: false,
      reason: c.verifierCalls === 0 ? 'FROZEN_ELISION' : 'NO_ADMITTED_DECLARATION' } : {
      exercised: true, failureClass: vf.failureClass, targetFactKey: vf.factKey,
      declarationId: vf.declarationId,
      propertyReview: pr, verdict: vf.parsed?.verdict ?? null,
      consistency: verifierConsistency, scopeContainment,
      frozenExpectedRouting: c.expectedVerifierRouting,
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
  artifact: 'SECTION-231-AUTHORITATIVE-STATE',
  derivedFrom: { firstPass: 'RAW-231-FIRST-PASS.jsonl', verifier: 'RAW-231-VERIFIER.jsonl' },
  candidateBaseline: '48db2a0f800b3632f1434130508895b625fa8e9a53a12ef691c5013058666200',
  frozenInstrumentDigest: 'bbde6ca0a1d1253ea8dc78d46bef8a26b3ef75ac2d59f72ed051e9e8fbe06844',
  providerCallsInDerivation: 0,
  databaseOperations: 0,
  outputRepaired: false,
  semanticsReconstructedFromProse: false,
  owedFactsManufactured: false,
  targetBindingDeterminations: BINDING,
  cases: endStates,
};
writeFileSync(join(EVID, 'SECTION-231-AUTHORITATIVE-STATE.json'),
  JSON.stringify(doc, null, 2) + '\n');

const det = endStates.flatMap(c => (c.exercises as ExerciseResult[]).map(e => ({
  caseId: c.caseId, exerciseId: e.exerciseId, ran: e.ran,
  matches: e.matchesFrozenExpectation, mismatches: e.mismatches,
})));
console.log(`cases ${endStates.length} · exercises ${det.length}`);
for (const d of det) {
  console.log(`  ${d.exerciseId.padEnd(8)} ran=${String(d.ran).padEnd(5)} `
    + `match=${d.matches === null ? 'n/a' : d.matches} ${d.mismatches.join(' | ')}`);
}
console.log(`written: ${join(EVID, 'SECTION-231-AUTHORITATIVE-STATE.json')}`);
console.log(`digest: ${sha(JSON.stringify(doc))}`);
