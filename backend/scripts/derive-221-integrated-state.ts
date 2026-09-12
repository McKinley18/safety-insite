/**
 * §221 -- DETERMINISTIC DERIVATION, FROZEN EXERCISES AND THE ADJUDICATION PACKET.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Runs AFTER execution and BEFORE human adjudication, exactly as the §221 authorization orders it.
 * Every provider output is read from the persisted raw evidence and is never edited, re-parsed or
 * repaired. The frozen settlement, property-authority and RR-7 exercises are performed through the
 * REAL application modules.
 *
 * THE ADJUDICATION PACKET IS EMITTED WITH EVERY SLOT EMPTY. This file pre-answers no semantic
 * judgment, suggests no verdict, infers no product-owner judgment from model output, and computes
 * no hard-gate outcome -- gate computation is the last step and happens after adjudication.
 */

import { createHash } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { checkDeclarationEntry212 } from './lib/expert-212-challenge-vocabulary';
import { checkScopeContainment } from './lib/expert-214-scope-containment';
import { checkPropertyReview218 } from './lib/expert-218-property-consistency';
import { project210jDeclarations } from './lib/expert-210j-declaration-projection';
import { preserveIdentifiedSafetyFacts } from './lib/expert-205-declaration-preservation';
import {
  INTEGRATED_CASES_221, RR7_MALFORMATION_221, SETTLEMENT_EXERCISES_REQUIRED_221,
  CORRECT_PROPERTY_EXERCISE_221, INTEGRATED_HARD_GATES_221, ADJUDICATION_BOUNDARY_221,
  AMBIGUITY_RULE_221, humanJudgmentTotal221,
} from './lib/expert-221-integrated-instrument';
import { observationSourceIdFor, analysisIdFor } from './lib/expert-221-assembly';

import type { OwedFact, ArbitrationRequest } from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types';
import {
  createOwedFactLedger, factOf,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  consumeSettlementClaims, mintSettlementAuthority, settleByReviewedEvidence,
  attachPropertyAuthority, recordPropertyAuthorityDeclined,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/settlement-review';
import {
  buildPropertyReviewPacket, mintPropertyAuthority, propertyAuthorityRequirementFor,
  type PropertyConfirmationDecision, type PropertyReviewPacket,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/property-authority';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification',
  'expert-hazlenz-221-integrated-pipeline-validation-2026-09-10');
const FROZEN_DIGEST = '82487b704e7601476481bbbe803d1b3299742478404e8df65f0149330302e1f6';

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const readJsonl = (f: string): Record<string, any>[] =>
  existsSync(join(EVID, f))
    ? readFileSync(join(EVID, f), 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l))
    : [];

const preregBytes = readFileSync(join(EVID, 'INTEGRATED-PREREGISTRATION-221.json'), 'utf8');
if (sha(preregBytes) !== FROZEN_DIGEST) {
  throw new Error('§221 DERIVATION ABORT: the frozen digest has changed');
}

const firstPass = readJsonl('RAW-FIRST-PASS-221.jsonl');
const verifier = readJsonl('RAW-VERIFIER-221.jsonl');
const elisions = readJsonl('CALL-ELISIONS-221.jsonl');

const byCaseFP = new Map(firstPass.map(r => [r.caseId as string, r]));
const verifierByCase = new Map<string, Record<string, any>[]>();
for (const v of verifier) {
  const list = verifierByCase.get(v.caseId as string) ?? [];
  list.push(v);
  verifierByCase.set(v.caseId as string, list);
}

// ================================================================ per-case derivation

type StageOutcome = 'REACHED' | 'DEFECTIVE' | 'NOT_EXERCISED';

interface CaseEndState {
  caseId: string;
  families: readonly number[];
  firstPass: {
    failureClass: string;
    outputTokens: number | null;
    stopReason: string | null;
    hazardCandidateCount: number | 'NOT_AN_ARRAY' | 'ABSENT';
    declarationsShape: 'ARRAY' | 'STRING' | 'ABSENT' | 'OTHER';
    declarationCount: number;
    clarificationCount: number | 'NOT_AN_ARRAY' | 'ABSENT';
    outcome: StageOutcome;
  };
  projection: {
    admittedFactKeys: string[];
    refused: { declarationId: string; reason: string }[];
    preservedIdentifiedFacts: number;
    outcome: StageOutcome;
  };
  verifierStage: {
    calls: number;
    outcome: StageOutcome;
    perCall: Array<{
      declarationId: string;
      verdict: string | null;
      propertySemanticRole: string | null;
      propertyValidity: string | null;
      decisionControllingProperty: string | null;
      propertyRoute: string;
      propertyCodes: string[];
      vocabularyCodes: string[];
      scopeCodes: string[];
      admitted: boolean;
      nominatedFactPresent: boolean;
    }>;
  };
  propertyAuthority: {
    outcome: StageOutcome;
    perFact: Array<{ factKey: string; requirement: string; state: string }>;
  };
  settlement: {
    frozenExercise: string;
    outcome: StageOutcome;
    detail: Record<string, unknown> | null;
  };
  finalAuthoritativeState: {
    hazardsIdentified: number | string;
    unresolvedFactsRemaining: string[];
    preservedFailClosedRecords: number;
    anythingSettled: boolean;
    anythingAuthorised: boolean;
    whatTheUserIsLeftWith: string;
  };
  containedProviderDefects: Array<{ defect: string; containment: string }>;
  observedStructuralDefects: string[];
}

const ANALYSIS_SUFFIX = 'S221';

function shapeOf(v: unknown): 'ARRAY' | 'STRING' | 'ABSENT' | 'OTHER' {
  if (Array.isArray(v)) return 'ARRAY';
  if (typeof v === 'string') return 'STRING';
  if (v === undefined || v === null) return 'ABSENT';
  return 'OTHER';
}

const endStates: CaseEndState[] = [];
const ledgersByCase = new Map<string, ReturnType<typeof createOwedFactLedger>>();
const factsByCase = new Map<string, OwedFact[]>();

for (const c of INTEGRATED_CASES_221) {
  const fp = byCaseFP.get(c.caseId);
  const parsed = (fp?.parsed ?? null) as Record<string, any> | null;
  const decls = parsed?.unresolvedFactDeclarations;
  const clars = parsed?.decisionCriticalClarifications;
  const hazards = parsed?.expertHazardCandidates;

  const structural: string[] = [];
  const contained: Array<{ defect: string; containment: string }> = [];

  if (fp?.failureClass !== 'NO_FAILURE') {
    structural.push(`FIRST_PASS_${fp?.failureClass}`);
  }
  if (shapeOf(decls) === 'STRING') {
    structural.push('DECLARATIONS_RETURNED_AS_A_STRING');
    contained.push({
      defect: 'the provider returned unresolvedFactDeclarations as a JSON string, not an array',
      containment: 'the executor failed closed and elided the verifier leg; the field was never '
        + 'parsed or repaired',
    });
  }
  if (shapeOf(hazards) === 'STRING') {
    structural.push('HAZARD_CANDIDATES_RETURNED_AS_A_STRING');
  }
  if (shapeOf(decls) === 'ABSENT' && parsed !== null) {
    structural.push('DECLARATIONS_FIELD_ABSENT_FROM_A_REQUIRED_SCHEMA_FIELD');
  }

  // ---- projection through the REAL §210J path, only where the shape permits it.
  const admittedFacts: OwedFact[] = [];
  const refused: { declarationId: string; reason: string }[] = [];
  let preserved = 0;
  if (Array.isArray(decls)) {
    const adapted: Record<string, unknown>[] = decls.map((d: Record<string, unknown>) =>
      ({ ...d, observationSourceId: observationSourceIdFor(c.caseId) }));
    const proj = project210jDeclarations({
      declarations: adapted as unknown as readonly unknown[],
      sources: [{ sourceId: observationSourceIdFor(c.caseId), text: c.observation }],
      suppliedGovernedSourceIds: c.governedEvidence.map(g => g.sourceId),
      stage: 'FIRST_PASS_MODEL',
    });
    proj.projection.perDeclaration.forEach((per, i) => {
      const id = String(adapted[i]?.declarationId ?? `(index ${i})`);
      if (per.admitted && per.owedFact !== null) admittedFacts.push(per.owedFact as OwedFact);
      else refused.push({ declarationId: id, reason: per.codes.join(',') || 'NOT_ADMITTED' });
    });
    preserved = (proj.projection as Record<string, any>).preserved?.length ?? 0;
  }
  factsByCase.set(c.caseId, admittedFacts);
  if (admittedFacts.length > 0) {
    ledgersByCase.set(c.caseId, createOwedFactLedger('PRODUCTION', admittedFacts));
  }

  // ---- verifier stage, replayed through the REAL deterministic layers.
  const vcalls = verifierByCase.get(c.caseId) ?? [];
  const perCall = vcalls.map(v => {
    const p = (v.parsed ?? null) as Record<string, any> | null;
    const entries = (p?.owedFactDeclarations ?? []) as Record<string, any>[];
    const target = entries.find(e => String(e?.factKey ?? '') === v.targetFactKey) ?? {};
    const prop = checkPropertyReview218({
      scope: { targetDeclarationId: v.declarationId, targetFactKey: v.targetFactKey },
      output: {
        propertyReview: p?.propertyReview,
        verdict: p?.verdict,
        owedFactDeclarations: entries,
      },
    });
    const vocab = entries.flatMap(e => checkDeclarationEntry212({
      factKey: String(e?.factKey ?? ''), declaration: String(e?.declaration ?? ''),
      challengeReason: e?.challengeReason ?? null, challengeGround: e?.challengeGround ?? null,
      propertyMismatchKind: e?.propertyMismatchKind ?? null,
      representationConcern: e?.representationConcern ?? 'NONE',
    }));
    const scope = checkScopeContainment({
      scope: {
        targetFactKey: v.targetFactKey, suppliedFactKeys: [v.targetFactKey],
        multiFactValidationRequested: false,
      },
      output: {
        nominatedFact: p?.nominatedFact ?? null,
        clarificationSourceMode: p?.clarificationSourceMode ?? null,
        owedFactDeclarations: entries,
      },
    });
    if (!scope.admitted) {
      contained.push({
        defect: `verifier emitted ${scope.codes.join(', ')}`,
        containment: '§214 scope containment refused it; the unresolved state was preserved',
      });
    }
    if (!prop.admitted) {
      contained.push({
        defect: `verifier property review inconsistent: ${prop.codes.join(', ')}`,
        containment: '§218 consistency refused the output whole; the fact stayed unresolved',
      });
    }
    return {
      declarationId: String(v.declarationId),
      verdict: (p?.verdict as string) ?? null,
      propertySemanticRole: (p?.propertyReview?.propertySemanticRole as string) ?? null,
      propertyValidity: (p?.propertyReview?.propertyValidity as string) ?? null,
      decisionControllingProperty:
        (p?.propertyReview?.decisionControllingProperty as string) ?? null,
      propertyRoute: prop.route,
      propertyCodes: [...prop.codes],
      vocabularyCodes: [...vocab],
      scopeCodes: [...scope.codes],
      admitted: prop.admitted && scope.admitted && vocab.length === 0,
      nominatedFactPresent: (p?.nominatedFact ?? null) !== null,
      targetDeclaration: target?.declaration ?? null,
    };
  });

  endStates.push({
    caseId: c.caseId,
    families: c.families,
    firstPass: {
      failureClass: String(fp?.failureClass ?? 'NOT_EXECUTED'),
      outputTokens: (fp?.outputTokens ?? null) as number | null,
      stopReason: (fp?.stopReason ?? null) as string | null,
      hazardCandidateCount: Array.isArray(hazards) ? hazards.length
        : shapeOf(hazards) === 'STRING' ? 'NOT_AN_ARRAY' : 'ABSENT',
      declarationsShape: shapeOf(decls),
      declarationCount: Array.isArray(decls) ? decls.length : 0,
      clarificationCount: Array.isArray(clars) ? clars.length
        : shapeOf(clars) === 'STRING' ? 'NOT_AN_ARRAY' : 'ABSENT',
      outcome: fp === undefined ? 'NOT_EXERCISED'
        : (fp.failureClass === 'NO_FAILURE' && shapeOf(decls) === 'ARRAY') ? 'REACHED' : 'DEFECTIVE',
    },
    projection: {
      admittedFactKeys: admittedFacts.map(f => f.factKey),
      refused,
      preservedIdentifiedFacts: preserved,
      outcome: Array.isArray(decls) ? 'REACHED' : 'NOT_EXERCISED',
    },
    verifierStage: {
      calls: vcalls.length,
      outcome: vcalls.length > 0 ? 'REACHED' : 'NOT_EXERCISED',
      perCall,
    },
    propertyAuthority: {
      outcome: admittedFacts.length > 0 ? 'REACHED' : 'NOT_EXERCISED',
      perFact: admittedFacts.map(f => ({
        factKey: f.factKey,
        requirement: propertyAuthorityRequirementFor(f),
        state: 'REQUIRED_NOT_OBTAINED',
      })),
    },
    settlement: { frozenExercise: c.settlementExercise, outcome: 'NOT_EXERCISED', detail: null },
    finalAuthoritativeState: {
      hazardsIdentified: Array.isArray(hazards) ? hazards.length : 'NOT_AN_ARRAY_OR_ABSENT',
      unresolvedFactsRemaining: admittedFacts.map(f => f.factKey),
      preservedFailClosedRecords: preserved,
      anythingSettled: false,
      anythingAuthorised: false,
      whatTheUserIsLeftWith: '',
    },
    containedProviderDefects: contained,
    observedStructuralDefects: structural,
  });
}

// ================================================================ frozen exercises

const stateOf = (id: string) => endStates.find(e => e.caseId === id)!;

function packetFor(caseId: string, fact: OwedFact): PropertyReviewPacket {
  const c = INTEGRATED_CASES_221.find(x => x.caseId === caseId)!;
  const v = (verifierByCase.get(caseId) ?? [])[0];
  const pr = (v?.parsed?.propertyReview ?? null) as Record<string, any> | null;
  const fp = byCaseFP.get(caseId);
  const decls = (fp?.parsed?.unresolvedFactDeclarations ?? []) as Record<string, any>[];
  const clars = (fp?.parsed?.decisionCriticalClarifications ?? []) as Record<string, any>[];
  const decl = Array.isArray(decls) ? decls[0] : undefined;
  const bound = Array.isArray(clars) ? clars[0] : undefined;
  return buildPropertyReviewPacket({
    analysisId: analysisIdFor(caseId),
    fact,
    proposedProperty: String(decl?.missingFact ?? fact.whyUnresolved ?? fact.factKey),
    decisionWhileUnresolved: (decl?.decisionWhileUnresolved as string) ?? null,
    existingClarification: (bound?.question as string) ?? null,
    verifier: pr === null ? null : {
      decisionControllingProperty: (pr.decisionControllingProperty as string) ?? null,
      propertySemanticRole: (pr.propertySemanticRole as string) ?? null,
      propertyValidity: (pr.propertyValidity as string) ?? null,
    },
  });
}

function runExercise(caseId: string, decision: PropertyConfirmationDecision | 'NONE',
  approveEvidence: boolean, reason: string): Record<string, unknown> | null {
  const facts = factsByCase.get(caseId) ?? [];
  if (facts.length === 0) return null;
  const fact = facts[0];
  const ledger = createOwedFactLedger('PRODUCTION', facts);
  const req: ArbitrationRequest = {
    factKey: fact.factKey, requestedBy: 'VERIFIER', reason, settles: false,
    factStatusUnchanged: true,
  };
  const consumed = consumeSettlementClaims([req], ledger, `${analysisIdFor(caseId)}-${ANALYSIS_SUFFIX}`);
  let claim = consumed.claims[0];
  const bornState = claim.propertyAuthorityState;

  let packet: PropertyReviewPacket | null = null;
  let mintOutcome: string | null = null;
  if (decision !== 'NONE') {
    packet = packetFor(caseId, fact);
    const mint = mintPropertyAuthority(packet, {
      packetId: packet.packetId,
      factKey: packet.factKey,
      decision,
      reviewerProvenance: 'HUMAN_REVIEW',
      reviewerId: 'authorized safety reviewer',
      rationale: 'recorded rationale for the §221 frozen exercise',
      reviewedPropertyDigest: packet.propertyDigest,
      correctedControllingProperty: decision === 'CORRECT_PROPERTY'
        ? 'the underlying physical condition the supplied property stands proxy for'
        : null,
      decidedAt: '2026-09-10T00:00:00.000Z',
    });
    mintOutcome = mint.authority === null ? 'NO_AUTHORITY_MINTED' : mint.authority.outcome;
    if (mint.authority !== null) claim = attachPropertyAuthority(claim, mint.authority).claim;
    else claim = recordPropertyAuthorityDeclined(claim);
  }

  const evidence = approveEvidence
    ? mintSettlementAuthority(claim, {
      claimId: claim.claimId, factKey: claim.factKey, decision: 'APPROVE_SETTLEMENT',
      reviewerProvenance: 'HUMAN_REVIEW', reviewerId: 'authorized safety reviewer',
      rationale: 'the answer supplied is sufficient to settle the fact as stated',
      reviewedEvidenceDigest: claim.evidenceDigest,
      decidedAt: '2026-09-10T00:00:00.000Z',
    })
    : { authority: null, refusedBecause: ['EVIDENCE_NOT_APPROVED_IN_THIS_EXERCISE'] };
  const application = evidence.authority === null
    ? null
    : settleByReviewedEvidence(ledger, claim, evidence.authority);
  const after = application?.ledger ?? ledger;

  return {
    factKey: fact.factKey,
    propertyAuthorityAtClaim: bornState,
    propertyReviewDecision: decision,
    propertyAuthorityOutcome: mintOutcome,
    propertyAuthorityStateAfter: claim.propertyAuthorityState,
    evidenceAuthorityMinted: evidence.authority !== null,
    settlementApplied: application?.applied ?? false,
    settlementRefusedBecause: application?.refusedBecause ?? [],
    factStatusAfter: factOf(after, fact.factKey)!.status,
    ledgerTransitions: after.transitions.length,
    packetFieldsPresent: packet === null ? null : {
      observationSpan: packet.observationSpan.length > 0,
      proposedProperty: packet.proposedProperty.length > 0,
      hazlenzExplanation: packet.hazlenzExplanation.length > 0,
      branchesAndDecisions: packet.branchA.length > 0 && packet.decisionIfB.length > 0,
      decisionWhileUnresolved: packet.decisionWhileUnresolved !== null,
      existingClarification: packet.existingClarification !== null,
      verifierDecisionControllingProperty: packet.verifierDecisionControllingProperty !== null,
      controls: packet.availableDecisions.length === 3,
    },
    packetSnapshot: packet === null ? null : {
      observationSpan: packet.observationSpan,
      proposedProperty: packet.proposedProperty,
      hazlenzExplanation: packet.hazlenzExplanation,
      decisionWhileUnresolved: packet.decisionWhileUnresolved,
      existingClarification: packet.existingClarification,
      verifierDecisionControllingProperty: packet.verifierDecisionControllingProperty,
      reviewerQuestion: packet.reviewerQuestion,
      confirmationIsNotSettlement: packet.confirmationIsNotSettlement,
    },
  };
}

for (const ex of SETTLEMENT_EXERCISES_REQUIRED_221) {
  const st = stateOf(ex.caseId);
  const facts = factsByCase.get(ex.caseId) ?? [];
  if (facts.length === 0) {
    st.settlement = {
      frozenExercise: ex.exercise, outcome: 'NOT_EXERCISED',
      detail: {
        reason: 'the pipeline produced no admitted owed fact for this case, so the frozen '
          + 'settlement exercise had nothing to act on. NOT_EXERCISED is recorded; it is never '
          + 'scored as a pass.',
      },
    };
    continue;
  }
  const detail = ex.exercise === 'SATISFACTORY_SETTLEMENT'
    ? runExercise(ex.caseId, 'CONFIRM_PROPERTY', true,
      'the supervisor confirms the standby was posted with the tripod rigged')
    : ex.exercise === 'ADVERSE_SETTLEMENT'
      ? runExercise(ex.caseId, 'CONFIRM_PROPERTY', true, 'the answer establishes the adverse branch')
      : ex.exercise === 'REFUSED_FOR_MISSING_PROPERTY_AUTHORITY'
        ? runExercise(ex.caseId, 'NONE', true, 'the annual test is recorded as done, so settled')
        : runExercise(ex.caseId, 'KEEP_UNRESOLVED', true,
          'the project manager believes the notification went in');
  st.settlement = { frozenExercise: ex.exercise, outcome: 'REACHED', detail };
}

// ---- CORRECT_PROPERTY, on IG3 per the freeze
const correctPropertyExercise = (factsByCase.get(CORRECT_PROPERTY_EXERCISE_221.caseId) ?? [])
  .length > 0
  ? runExercise(CORRECT_PROPERTY_EXERCISE_221.caseId, 'CORRECT_PROPERTY', true,
    'the reviewer corrects the property and a settlement is then attempted')
  : {
    outcome: 'NOT_EXERCISED',
    reason: `${CORRECT_PROPERTY_EXERCISE_221.caseId} produced no admitted owed fact, so the `
      + 'correction exercise had nothing to act on',
  };

// ================================================================ RR-7 exercise, IG10

const rr7Case = INTEGRATED_CASES_221.find(c => c.caseId === RR7_MALFORMATION_221.appliedTo)!;
const rr7Fp = byCaseFP.get(rr7Case.caseId);
const rr7Decls = rr7Fp?.parsed?.unresolvedFactDeclarations;
let rr7: Record<string, unknown>;
if (!Array.isArray(rr7Decls) || rr7Decls.length === 0) {
  rr7 = {
    outcome: 'NOT_EXERCISED',
    reason: 'the provider produced no usable declaration for the RR-7 case',
  };
} else {
  const original = rr7Decls[0] as Record<string, unknown>;
  // The provider's own declaration, COPIED, with ONE required field replaced by the frozen filler.
  // The raw record on disk is untouched; this is a separate labelled object.
  const malformed = {
    ...original,
    [RR7_MALFORMATION_221.field]: RR7_MALFORMATION_221.fillerValue,
    observationSourceId: observationSourceIdFor(rr7Case.caseId),
  };
  const proj = project210jDeclarations({
    declarations: [malformed] as unknown as readonly unknown[],
    sources: [{ sourceId: observationSourceIdFor(rr7Case.caseId), text: rr7Case.observation }],
    suppliedGovernedSourceIds: [],
    stage: 'FIRST_PASS_MODEL',
  });
  const per = proj.projection.perDeclaration[0];
  const preservation = preserveIdentifiedSafetyFacts(
    proj.projection as never, [malformed] as readonly unknown[]);
  rr7 = {
    outcome: 'REACHED',
    appliedBy: RR7_MALFORMATION_221.appliedBy,
    providerOutputEdited: false,
    fieldMalformed: RR7_MALFORMATION_221.field,
    originalPropertyIdentified: String(original.missingFact ?? ''),
    admitted: per.admitted,
    refusalCodes: per.codes,
    owedFactCreated: per.owedFact !== null,
    preservationResult: preservation,
    deterministicCodeInventedAnyField: false,
    theIdentifiedPropertySurvivesTheRefusal:
      String(original.missingFact ?? '').length > 0 && !per.admitted,
  };
}

// ================================================================ end-state narratives

for (const st of endStates) {
  const c = INTEGRATED_CASES_221.find(x => x.caseId === st.caseId)!;
  const expectedFacts = c.expectedOwedFacts.length;
  const got = st.projection.admittedFactKeys.length;
  const settled = st.settlement.detail?.settlementApplied === true;
  st.finalAuthoritativeState.anythingSettled = settled;
  st.finalAuthoritativeState.whatTheUserIsLeftWith =
    st.firstPass.outcome === 'DEFECTIVE'
      ? `a structurally defective first-pass result (${st.observedStructuralDefects.join('; ')}). `
        + `${got} owed fact(s) reached the ledger against ${expectedFacts} expected by the frozen `
        + 'truth. Nothing was settled and nothing was authorised.'
      : got === 0 && expectedFacts === 0
        ? 'hazard analysis with no decision-critical unresolved facts, which is what the frozen '
          + 'truth expects for this case. Nothing was settled and nothing was authorised.'
        : got === 0 && expectedFacts > 0
          ? `hazard analysis with NO decision-critical unresolved fact recorded, against `
            + `${expectedFacts} expected by the frozen truth. Nothing was settled and nothing was `
            + 'authorised.'
          : `${got} decision-critical unresolved fact(s) in the ledger`
            + `${settled ? ', one of which was settled by recorded human authority' : ''}. `
            + `${settled ? '' : 'Nothing was settled and nothing was authorised.'}`;
}

// ================================================================ artifacts

writeFileSync(join(EVID, 'END-STATE-221.json'), JSON.stringify({
  artifact: 'SECTION-221-PER-CASE-END-STATE',
  frozenDigest: FROZEN_DIGEST,
  providerCalls: firstPass.length + verifier.length,
  databaseOperations: 0,
  cases: endStates,
  frozenExercises: {
    settlement: SETTLEMENT_EXERCISES_REQUIRED_221.map(e => ({
      ...e, outcome: stateOf(e.caseId).settlement.outcome,
    })),
    correctProperty: correctPropertyExercise,
    rr7,
  },
  elisions,
}, null, 2) + '\n');

// ---- the adjudication packet. EVERY SLOT EMPTY.
const slots = INTEGRATED_CASES_221.flatMap(c => c.humanJudgments.map(j => ({
  slotId: j.id,
  caseId: c.caseId,
  axis: j.axis,
  mandatory: j.mandatory,
  feedsGate: j.feedsGate,
  question: j.question,
  whatToRead: j.whatToRead,
  permittedVerdicts: AMBIGUITY_RULE_221.permittedVerdicts,
  verdict: null,
  attribution: null,
  note: null,
})));

writeFileSync(join(EVID, 'ADJUDICATION-PACKET-221.json'), JSON.stringify({
  artifact: 'SECTION-221-PRODUCT-OWNER-ADJUDICATION-PACKET',
  frozenDigest: FROZEN_DIGEST,
  boundary: ADJUDICATION_BOUNDARY_221,
  ambiguityRule: AMBIGUITY_RULE_221,
  hardGates: INTEGRATED_HARD_GATES_221,
  slotsTotal: slots.length,
  slotsPrefilled: slots.filter(s => s.verdict !== null).length,
  gateOutcomesComputed: false,
  whyNotComputed: 'hard-gate computation is the last step and happens only after product-owner '
    + 'adjudication. Nothing in this packet states or implies which verdict would make a gate pass.',
  slots,
}, null, 2) + '\n');

// ================================================================ console summary (facts only)

console.log('§221 DERIVATION — provider calls 0, database operations 0\n');
console.log('CASE   FIRST PASS            DECLS  PROJECTED  VERIFIER  SETTLEMENT');
for (const st of endStates) {
  console.log(`${st.caseId.padEnd(6)} ${st.firstPass.failureClass.padEnd(20)} `
    + `${String(st.firstPass.declarationsShape).padEnd(6)} `
    + `${String(st.projection.admittedFactKeys.length).padEnd(10)} `
    + `${String(st.verifierStage.calls).padEnd(9)} ${st.settlement.outcome}`);
}
console.log(`\nadjudication slots emitted: ${slots.length} `
  + `(expected ${humanJudgmentTotal221()}), prefilled: `
  + `${slots.filter(s => s.verdict !== null).length}`);
console.log('hard-gate outcomes: NOT COMPUTED — adjudication comes first');
