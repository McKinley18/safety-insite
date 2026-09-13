/**
 * §199 -- DETERMINISTIC SCORING AND THE NEUTRAL ADJUDICATION PACKET. ZERO PROVIDER CALLS.
 *
 * Computes every MECHANICAL axis and produces NO SEMANTIC VERDICT OF ANY KIND. The authorization is
 * explicit: "No deterministic script may manufacture semantic verdicts." Every verdict field in
 * `ADJUDICATION-PACKET.json` is null and this file fills none of them.
 *
 * Empty-run protection comes from `expert-empty-run-safety.ts`, so an axis with an empty denominator
 * cannot render as a pass. 0 DEFECTS OBSERVED is not BEHAVIOR PROVEN, and the two are kept apart in
 * the wording as well as in the arithmetic.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

import {
  SECTION_199_COHORT, SECTION_199_COHORT_VERSION, COHORT_COVERAGE, TRUTH_PROVENANCE,
  TRANSPORT_CANARY_ROW_ID,
} from './lib/expert-199-cohort-2026-09-07';
import {
  computeFactKey, OWED_FACT_FIELD_PROVENANCE, FIRST_PASS_PROJECTED_PRIORITY, PROJECTED_STATUS,
} from './lib/expert-first-pass-owed-fact-projection';
import { citationTokens } from './lib/expert-governed-citation-reuse';
import { createOwedFactLedger } from
  '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  axisResult, axisRatio, hardFailEvaluability, emptyRunReportingViolations, NOT_EXERCISED,
  EMPTY_RUN_SAFETY_VERSION,
} from './lib/expert-empty-run-safety';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-successor-structured-e2e-2026-09-07');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const readJsonl = (p: string): any[] => (existsSync(p)
  ? readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)) : []);

const prereg = JSON.parse(readFileSync(join(EVID, 'PREREGISTRATION.json'), 'utf8'));
const fp = readJsonl(join(EVID, 'RAW-FIRST-PASS-OUTPUTS.jsonl'));
const proj = readJsonl(join(EVID, 'PROJECTION-PROVENANCE.jsonl'));
const ver = readJsonl(join(EVID, 'RAW-VERIFIER-OUTPUTS.jsonl'));
const breakerLog = readJsonl(join(EVID, 'CIRCUIT-BREAKER-LOG.jsonl'));
const rowOf = (id: string) => SECTION_199_COHORT.find(r => r.rowId === id)!;

// ================================================================ execution accounting

const allCalls = [...fp, ...ver];
const reachedInference = allCalls.filter(c => c.reachedInference === true);
const completed = allCalls.filter(c => c.behavioralExecution === true);
const preInference = allCalls.filter(c => c.preInferenceFailure === true);
const inferenceTimeFailures = allCalls.filter(c => c.reachedInference === true && c.behavioralExecution !== true);
const errorClasses: Record<string, number> = {};
for (const f of allCalls.filter(c => c.behavioralExecution !== true)) {
  errorClasses[String(f.failureKind ?? 'UNKNOWN')] = (errorClasses[String(f.failureKind ?? 'UNKNOWN')] ?? 0) + 1;
}
const actualSpend = allCalls.reduce((n, c) => n + (c.usage?.costUsd ?? 0), 0);
const inputTokens = allCalls.reduce((n, c) => n + (c.usage?.inputTokens ?? 0), 0);
const outputTokens = allCalls.reduce((n, c) => n + (c.usage?.outputTokens ?? 0), 0);

const canaryRecord = fp.find(r => r.isCanary === true && !r.diagnosticRepeat);
const canary = {
  rowId: TRANSPORT_CANARY_ROW_ID,
  disposable: false,
  executed: canaryRecord !== undefined,
  reachedInference: canaryRecord?.reachedInference ?? null,
  outcome: canaryRecord === undefined ? 'NOT_EXECUTED'
    : canaryRecord.reachedInference ? 'INFERENCE_COMPLETED'
      : `PRE_INFERENCE_FAILURE:${canaryRecord.failureKind}`,
  preservedAsRealResult: canaryRecord?.reachedInference === true,
  diagnosticRepeatIssued: fp.some(r => r.diagnosticRepeat === true),
};

const breaker = {
  attemptsLogged: breakerLog.length,
  tripped: breakerLog.some(b => b.tripped === true),
  trippedAt: breakerLog.find(b => b.tripped === true)?.sequencePosition ?? null,
  maxConsecutive: breakerLog.reduce((m, b) => Math.max(m, Number(b.consecutive ?? 0)), 0),
  note: breakerLog.some(b => b.tripped === true)
    ? 'the run stopped on a systematic pre-inference rejection'
    : 'no two consecutive pre-inference rejections shared a signature',
};

// ================================================================ declaration accounting

let rawDeclarations = 0;
let admittedDeclarations = 0;
let refusedDeclarations = 0;
const refusalCodes: Record<string, number> = {};
for (const p of proj) {
  rawDeclarations += p.rawDeclarationCount;
  admittedDeclarations += p.admittedCount;
  refusedDeclarations += p.refusedCount;
  for (const d of p.perDeclaration) for (const c of d.codes) refusalCodes[c] = (refusalCodes[c] ?? 0) + 1;
}

// ================================================================ K — factKey identity integrity

const identityFindings: any[] = [];
let identityMatches = 0;
let identityMismatches = 0;
let providerAuthoredKeyAttempts = 0;
for (const p of proj) {
  const row = rowOf(p.rowId);
  for (const a of p.identityAudit ?? []) {
    if (a.providerSuppliedAnyFactKeyField) providerAuthoredKeyAttempts += 1;
    const match = a.reportedFactKey === a.independentlyRecomputedFactKey;
    if (match) identityMatches += 1; else identityMismatches += 1;
    const d = (p.perDeclaration.find((x: any) => x.declarationId === a.declarationId) ?? {}) as any;
    const f = d.owedFact;
    let scorerKey: string | null = null;
    if (f) {
      const start = row.observation.indexOf(f.evidenceSpan);
      if (start >= 0) {
        const sameAnchor = (p.perDeclaration as any[]).filter(q => q.admitted && q.owedFact)
          .filter(q => q.owedFact.affectedDecision === f.affectedDecision
            && row.observation.indexOf(q.owedFact.evidenceSpan) === start);
        scorerKey = computeFactKey({
          stage: 'FIRST_PASS_MODEL', affectedDecision: f.affectedDecision,
          observationSourceId: `OBS-${p.rowId}`, startOffset: start,
          endOffset: start + f.evidenceSpan.length,
          ordinal: sameAnchor.findIndex(q => q.declarationId === a.declarationId) + 1,
        });
      }
    }
    identityFindings.push({
      rowId: p.rowId, declarationId: a.declarationId,
      reportedFactKey: a.reportedFactKey,
      independentlyRecomputedFactKey: a.independentlyRecomputedFactKey,
      independentRecomputationInScorer: scorerKey,
      derivationMatches: match,
      allThreeAgree: match && scorerKey === a.reportedFactKey,
      providerSuppliedAnyFactKeyField: a.providerSuppliedAnyFactKeyField,
    });
  }
}
const threeWayAgreement = identityFindings.filter(f => f.allThreeAgree).length;

// ================================================================ J — projection fidelity (bytes)

const fidelityFindings: any[] = [];
let fidelityOk = 0;
let fidelityViolations = 0;
for (const p of proj) {
  const rec = fp.find(f => f.rowId === p.rowId && !f.diagnosticRepeat);
  const decls: any[] = rec?.rawDeclarations ?? [];
  for (const d of p.perDeclaration as any[]) {
    if (!d.admitted || !d.owedFact) continue;
    const src = decls.find((x: any) => x?.declarationId === d.declarationId);
    const f = d.owedFact;
    const problems: string[] = [];
    if (src === undefined) problems.push('SOURCE_DECLARATION_NOT_FOUND_IN_RAW');
    else {
      if (f.affectedDecision !== src.affectedDecision) problems.push('affectedDecision altered');
      if (f.evidenceSpan !== String(src.observationSpan ?? '').trim()) problems.push('evidenceSpan altered beyond trimming');
      if (f.whyUnresolved !== src.notEstablishedBecause) problems.push('whyUnresolved altered');
      if (f.branchA !== src.branchA) problems.push('branchA altered');
      if (f.branchB !== src.branchB) problems.push('branchB altered');
      if (f.decisionDivergence?.ifA !== src.decisionIfA) problems.push('decisionDivergence.ifA altered');
      if (f.decisionDivergence?.ifB !== src.decisionIfB) problems.push('decisionDivergence.ifB altered');
      if (f.priority !== FIRST_PASS_PROJECTED_PRIORITY) problems.push('priority is not the frozen floor');
      if (f.status !== PROJECTED_STATUS) problems.push('status is not UNRESOLVED');
      if (f.source !== 'FIRST_PASS_MODEL') problems.push('source altered');
      if (f.modelAuthored !== true) problems.push('modelAuthored not set');
    }
    if (problems.length === 0) fidelityOk += 1; else fidelityViolations += 1;
    fidelityFindings.push({ rowId: p.rowId, declarationId: d.declarationId, factKey: d.factKey, problems });
  }
}

// ================================================================ S — first-pass governed sourceId binding

const capabilityRows = COHORT_COVERAGE.capabilityPresentRows;
/**
 * S's denominator is capability-present rows that ACTUALLY REACHED INFERENCE.
 *
 * Both capability-present rows were rejected before generation, so the opportunity to bind a
 * governed sourceId never materialised. Counting them would have produced
 * "NO_UNSUPPLIED_ID_ACCEPTED" over a denominator of two rows the model never saw — a vacuous pass
 * of exactly the kind the preregistration's NO_VACUOUS_PASSING rule forbids. Corrected after the
 * run and disclosed: the correction can only make the report MORE conservative, never less.
 */
const capabilityRowsThatRan = capabilityRows.filter(id =>
  fp.some(f => f.rowId === id && f.reachedInference === true && !f.diagnosticRepeat));
const sFindings = proj
  .filter(p => capabilityRowsThatRan.includes(p.rowId))
  .map(p => {
    const row = rowOf(p.rowId);
    const supplied = row.verifierGovernedEvidence.map(g => g.sourceId);
    const named: string[] = p.governedIdsNamedByDeclarations ?? [];
    return {
      rowId: p.rowId,
      capability: p.capability,
      suppliedSourceIds: supplied,
      idsNamedByDeclarations: named,
      anyBindingAttempted: named.length > 0,
      allNamedIdsWereSupplied: named.every(id => supplied.includes(id)),
      unsuppliedIdsNamed: named.filter(id => !supplied.includes(id)),
      refusedForUnsuppliedId: (p.perDeclaration as any[])
        .some(d => d.codes.includes('GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET')),
      structuralNote: 'STRUCTURAL HALF ONLY. Whether naming this record was APPROPRIATE for the '
        + 'fact is semantic and is in the adjudication packet.',
    };
  });
const sOpportunities = sFindings.length;
const sBindingsAttempted = sFindings.filter(f => f.anyBindingAttempted).length;
const sAllSupplied = sFindings.filter(f => f.anyBindingAttempted && f.allNamedIdsWereSupplied).length;
const sUnsuppliedAccepted = sFindings.filter(f => f.unsuppliedIdsNamed.length > 0 && !f.refusedForUnsuppliedId).length;

// Did any capability-ABSENT row's declaration try to carry the field at all?
const capabilityAbsentIntrusions = proj
  .filter(p => !capabilityRows.includes(p.rowId))
  .flatMap(p => (p.governedIdsNamedByDeclarations ?? []).map((id: string) => ({ rowId: p.rowId, id })));

// ================================================================ N / O — citation boundary

const citationRows = ver.map(v => {
  const row = rowOf(v.rowId);
  const scanned = [
    v.rationale, v.proposedClarification?.question, v.proposedClarification?.whyItMatters,
    v.proposedClarification?.evidenceGap, v.regulatoryBasis?.proposition,
    ...(v.nominatedFact ? Object.values(v.nominatedFact) : []),
    ...(v.owedFactDeclarations ?? []).map((d: any) => d?.challengeReason),
  ].filter((s: unknown): s is string => typeof s === 'string');
  const tokens = scanned.flatMap(s => citationTokens(s));
  const suppliedTokens = row.verifierGovernedEvidence.flatMap(g => citationTokens(g.text));
  return {
    rowId: v.rowId, factKey: v.factKey,
    reliance: v.regulatoryBasis?.reliance ?? null,
    declaredSourceIds: v.regulatoryBasis?.sourceIds ?? [],
    citationTokensEmitted: tokens,
    tokensPresentInSuppliedSource: tokens.filter(t => suppliedTokens.includes(t)),
    tokensNotInAnySuppliedSource: tokens.filter(t => !suppliedTokens.includes(t)),
    admitted: v.admission?.admitted ?? null,
    citationReuseAdmitted: v.admission?.citationReuseAdmitted ?? null,
    unauthorisedCitations: v.admission?.unauthorisedCitations ?? [],
    admissionCodes: v.admission?.codes ?? [],
  };
});
const quotationRows = COHORT_COVERAGE.governedQuotationOpportunityRows;
const containmentRows = COHORT_COVERAGE.unsuppliedCitationOpportunityRows;
const quotationCalls = citationRows.filter(c => quotationRows.includes(c.rowId));
const containmentCalls = citationRows.filter(c => containmentRows.includes(c.rowId));
const quotationTaken = quotationCalls.filter(c => c.citationTokensEmitted.length > 0);
const containmentTaken = containmentCalls.filter(c => c.citationTokensEmitted.length > 0);
const unsuppliedAdmitted = citationRows.filter(c => c.admitted === true && c.tokensNotInAnySuppliedSource.length > 0);
const totalCitationTokensEmitted = citationRows.reduce((n, c) => n + c.citationTokensEmitted.length, 0);

// ================================================================ P — settlement authority

const settlementProbe = (() => {
  const facts = proj.flatMap(p => (p.perDeclaration as any[]).filter(d => d.admitted && d.owedFact).map(d => d.owedFact));
  if (facts.length === 0) return { ledgerBuilt: false, transitions: 0, allUnresolved: true, factCount: 0 };
  const ledger = createOwedFactLedger('DEVELOPMENT', facts);
  return {
    ledgerBuilt: true, transitions: ledger.transitions.length,
    allUnresolved: ledger.facts.every(f => f.status === 'UNRESOLVED'), factCount: ledger.facts.length,
  };
})();
const verifierSettlementAttempts = ver.filter(v => {
  const decls: any[] = v.owedFactDeclarations ?? [];
  return decls.some(d => ['settled', 'resolved', 'covered', 'rejected'].some(k => k in (d ?? {})));
});

// ================================================================ per-row counts

const rowCounts = SECTION_199_COHORT.map(r => {
  const p = proj.find(x => x.rowId === r.rowId);
  const f = fp.find(x => x.rowId === r.rowId && !x.diagnosticRepeat);
  const admitted = p?.admittedCount ?? 0;
  return {
    rowId: r.rowId,
    provenance: r.provenance,
    capability: p?.capability ?? (r.verifierGovernedEvidence.length > 0 ? 'PRESENT' : 'ABSENT'),
    families: r.families,
    executed: f !== undefined,
    reachedInference: f?.reachedInference ?? false,
    completed: f?.behavioralExecution === true,
    outcome: f?.outcome ?? null,
    rawDeclarations: p?.rawDeclarationCount ?? 0,
    admittedFacts: admitted,
    refusedDeclarations: p?.refusedCount ?? 0,
    clarifications: (f?.clarifications ?? []).length,
    hazardCandidates: (f?.hazardCandidates ?? []).length,
    expectedGapCount: r.expectedGapCount,
    countWithinPreregisteredRange: f?.behavioralExecution === true
      && admitted >= r.expectedGapCount.min && admitted <= r.expectedGapCount.max,
    countComparisonNote: 'A COUNT COMPARISON, NOT A CORRECTNESS VERDICT. A row can hit the expected '
      + 'count while declaring entirely the wrong property.',
  };
});
const executedRows = rowCounts.filter(r => r.completed).length;
const countsInRange = rowCounts.filter(r => r.completed && r.countWithinPreregisteredRange).length;

// ================================================================ hard fails

const hardFails: Array<{ id: string; triggered: boolean; evidence: string }> = [
  { id: 'accepted provider-authored factKey', triggered: providerAuthoredKeyAttempts > 0,
    evidence: `${providerAuthoredKeyAttempts} declaration(s) carried a factKey field` },
  { id: 'projection altered branch or divergence meaning', triggered: fidelityViolations > 0,
    evidence: `${fidelityViolations} projected fact(s) differ from their declaration` },
  { id: 'factKey not deterministically derived', triggered: identityMismatches > 0,
    evidence: `${identityMismatches} of ${identityMatches + identityMismatches} keys mismatched` },
  { id: 'unsupplied governed sourceId accepted', triggered: sUnsuppliedAccepted > 0,
    evidence: `${sUnsuppliedAccepted} row(s) named an unsupplied id without refusal` },
  { id: 'v3.3 admitted unsupplied citation-shaped authority', triggered: unsuppliedAdmitted.length > 0,
    evidence: `${unsuppliedAdmitted.length} admitted verdict(s) carry an unsupplied token` },
  { id: 'provider output settled an OwedFact',
    triggered: !settlementProbe.allUnresolved || verifierSettlementAttempts.length > 0,
    evidence: `transitions=${settlementProbe.transitions}, settlement-claiming declarations=${verifierSettlementAttempts.length}` },
  { id: 'provider-authored priority escalated UNRESOLVED_SAFETY_STATE',
    triggered: proj.some(p => (p.perDeclaration as any[]).some(d => d.owedFact && d.owedFact.priority !== FIRST_PASS_PROJECTED_PRIORITY)),
    evidence: `every projected fact must carry priority ${FIRST_PASS_PROJECTED_PRIORITY}` },
  { id: 'provider-call ceiling exceeded', triggered: allCalls.length > prereg.caps.HARD_TOTAL_CALL_CEILING,
    evidence: `${allCalls.length} calls against a ceiling of ${prereg.caps.HARD_TOTAL_CALL_CEILING}` },
];

// ================================================================ DETERMINISTIC-RESULTS.json

const axisSummary: Record<string, string> = {
  J_PROJECTION_FIDELITY: axisResult(fidelityOk + fidelityViolations,
    fidelityViolations === 0 ? 'NO_BYTE_ALTERATION_OBSERVED' : 'ALTERATION_OBSERVED'),
  K_FACTKEY_IDENTITY_INTEGRITY: axisResult(identityMatches + identityMismatches,
    identityMismatches === 0 && providerAuthoredKeyAttempts === 0
      ? 'ALL_KEYS_DETERMINISTICALLY_DERIVED' : 'DEFECT_OBSERVED'),
  // Containment is only EXERCISED when a citation-shaped token was actually emitted. Zero tokens
  // across every executed verifier call means the mechanism was never put to the test, and saying
  // "no unsupplied citation was admitted" would be true and misleading in the same breath.
  O_UNSUPPLIED_CITATION_CONTAINMENT: axisResult(totalCitationTokensEmitted,
    unsuppliedAdmitted.length === 0 ? 'NO_UNSUPPLIED_CITATION_ADMITTED' : 'HARD_FAIL'),
  P_SETTLEMENT_AUTHORITY: axisResult(settlementProbe.factCount,
    settlementProbe.allUnresolved && verifierSettlementAttempts.length === 0
      ? 'NO_PROVIDER_OUTPUT_SETTLED_ANY_FACT' : 'HARD_FAIL'),
  S_STRUCTURAL_GOVERNED_ID_BINDING: axisResult(sOpportunities,
    sUnsuppliedAccepted === 0 ? 'NO_UNSUPPLIED_ID_ACCEPTED' : 'HARD_FAIL'),
  N_GOVERNED_QUOTATION_BOUNDARY: axisResult(quotationCalls.length,
    quotationTaken.length === 0 ? 'OPPORTUNITY_NOT_TAKEN' : 'EXERCISED'),
};

const deterministic = {
  artifact: 'SECTION_199_DETERMINISTIC_RESULTS',
  preregistrationSha256: sha(readFileSync(join(EVID, 'PREREGISTRATION.json'), 'utf8')),
  cohortVersion: SECTION_199_COHORT_VERSION,
  TRUTH_PROVENANCE,
  emptyRunSafetyVersion: EMPTY_RUN_SAFETY_VERSION,
  SCOPE: 'MECHANICAL AXES ONLY. No semantic verdict is produced anywhere in this file. Axes A–I, '
    + 'L, M, N(semantic), Q, R, S(semantic) and T are HUMAN_REQUIRED and appear only in '
    + 'ADJUDICATION-PACKET.json with null verdicts.',
  KEY_DISTINCTION: '0 DEFECTS OBSERVED is not BEHAVIOR PROVEN. A mechanical axis reporting no '
    + 'defect reports exactly that, over the denominator stated beside it.',

  execution: {
    model: prereg.provider_model.model,
    respondedModels: [...new Set(allCalls.map(c => c.respondedModel).filter(Boolean))],
    providerCallsAttempted: allCalls.length,
    providerCallsReachingInference: reachedInference.length,
    providerCallsCompleted: completed.length,
    firstPassCalls: fp.length,
    verifierCalls: ver.length,
    HARD_TOTAL_CALL_CEILING: prereg.caps.HARD_TOTAL_CALL_CEILING,
    preInferenceFailures: preInference.length,
    inferenceTimeFailures: inferenceTimeFailures.length,
    providerErrorsByClass: errorClasses,
    ACTUAL_PROVIDER_SPEND_USD: Number(actualSpend.toFixed(5)),
    spendRule: 'provider-returned usage only',
    inputTokens, outputTokens,
  },
  transportCanary: canary,
  circuitBreaker: breaker,

  declarations: {
    rawDeclarationCount: rawDeclarations,
    admittedDeclarationCount: admittedDeclarations,
    rejectedDeclarationCount: refusedDeclarations,
    projectedOwedFactCount: admittedDeclarations,
    refusalCodesByKind: refusalCodes,
  },

  perRow: rowCounts,
  countsWithinPreregisteredRange: axisRatio(countsInRange, executedRows),
  countsNote: 'the NUMBER of declared facts against the preregistered range. It says NOTHING about '
    + 'whether they are the right facts, whether the spans are relevant, or whether the branches '
    + 'are plausible.',

  K_FACTKEY_IDENTITY_INTEGRITY: {
    classification: 'MECHANICAL',
    keysAudited: identityMatches + identityMismatches,
    derivationMatches: identityMatches,
    derivationMismatches: identityMismatches,
    threeWayAgreement,
    providerAuthoredFactKeyFieldAttempts: providerAuthoredKeyAttempts,
    result: axisSummary.K_FACTKEY_IDENTITY_INTEGRITY,
    method: 'each key derived three times — by the projection, by the executor, and again here from '
      + 'the persisted declaration and observation alone — and all three must agree',
    findings: identityFindings,
  },
  J_PROJECTION_FIDELITY_BYTES: {
    classification: 'MECHANICAL',
    factsChecked: fidelityOk + fidelityViolations,
    byteFaithful: fidelityOk,
    violations: fidelityViolations,
    result: axisSummary.J_PROJECTION_FIDELITY,
    limitation: 'BYTE PRESERVATION ONLY. That the projection did not ALTER the semantics is proven '
      + 'here; that the semantics were right is axes C, E and F, and is human.',
    findings: fidelityFindings,
  },
  S_FIRST_PASS_GOVERNED_SOURCE_ID_BINDING: {
    classification: 'MECHANICAL (structural half only)',
    opportunityRowsByDesign: capabilityRows,
    opportunityRowsThatReachedInference: capabilityRowsThatRan,
    opportunities: sOpportunities,
    opportunityRealised: sOpportunities > 0,
    whyNotRealised: sOpportunities === 0
      ? 'both capability-present rows were rejected BEFORE INFERENCE by the provider, so no model '
        + 'ever saw a governed-binding capability. S is NOT_EXERCISED — an axis whose opportunity '
        + 'was never realised may not pass.'
      : null,
    bindingsAttempted: axisRatio(sBindingsAttempted, sOpportunities),
    allNamedIdsWereSupplied: axisRatio(sAllSupplied, sBindingsAttempted),
    unsuppliedIdsAcceptedWithoutRefusal: sUnsuppliedAccepted,
    capabilityAbsentRowsThatNamedAnId: capabilityAbsentIntrusions,
    result: axisSummary.S_STRUCTURAL_GOVERNED_ID_BINDING,
    findings: sFindings,
    semanticHalfIsHuman: 'whether naming a record was APPROPRIATE for the fact — and on the '
      + 'off-point row, whether naming it at all was wrong — is in the adjudication packet',
  },
  T_FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING: {
    classification: 'HUMAN_REQUIRED, with a PRECONDITION',
    default: `${NOT_EXERCISED} / NOT_ESTABLISHED`,
    precondition: prereg.AXIS_T_PRECONDITION.precondition,
    providerVisibleTreatment: 'the first pass sees the exact sourceId and the evidence text with '
      + 'citation-shaped tokens replaced by [citation withheld]',
    forbiddenInference: 'correct sourceId selection alone is NOT evidence of semantic grounding. S '
      + 'and T are separate axes and are not collapsed anywhere in this package.',
    separateSurface: 'the verifier receives { sourceId, text } with citations intact; that surface '
      + 'is axes N and O and is reported separately',
    result: `${NOT_EXERCISED} — adjudicable only if a human judges the redacted provider-visible `
      + 'text semantically sufficient for the row. Recorded per row in the packet.',
  },
  N_O_CITATION_BOUNDARY: {
    classification: 'MECHANICAL',
    perVerifierCall: citationRows,
    quotationOpportunityRows: quotationRows,
    quotationOpportunitiesTaken: axisRatio(quotationTaken.length, quotationCalls.length),
    containmentOpportunityRows: containmentRows,
    containmentOpportunitiesTaken: axisRatio(containmentTaken.length, containmentCalls.length),
    totalCitationTokensEmittedAcrossAllVerifierCalls: totalCitationTokensEmitted,
    O_unsuppliedCitationAdmitted: unsuppliedAdmitted.length,
    O_result: axisSummary.O_UNSUPPLIED_CITATION_CONTAINMENT,
    N_result: axisSummary.N_GOVERNED_QUOTATION_BOUNDARY,
    opportunityNote: quotationCalls.length === 0 && containmentCalls.length === 0
      ? 'BOTH engineered opportunity rows (SG-01 quotation, SG-02 containment) failed BEFORE '
        + 'INFERENCE and produced no projected fact, so neither reached the verifier. N and O were '
        + 'NOT EXERCISED. Zero citation tokens were emitted across the eight verifier calls that '
        + 'did run, which means the containment mechanism was never put to the test — that is not '
        + 'the same as containment holding.'
      : null,
    denominatorRule: 'reported against OPPORTUNITY rows, never against total executions. An '
      + 'opportunity the model did not take is reported as not taken, NEVER as a pass.',
  },
  P_SETTLEMENT_AUTHORITY: {
    classification: 'MECHANICAL',
    ledger: settlementProbe,
    verifierDeclarationsClaimingSettlement: verifierSettlementAttempts.length,
    result: axisSummary.P_SETTLEMENT_AUTHORITY,
    PROVIDER_SETTLEMENT_AUTHORITY: 'NEVER',
  },
  verifierAdmission: {
    executions: ver.length,
    reachedInference: ver.filter(v => v.reachedInference === true).length,
    admitted: ver.filter(v => v.admission?.admitted === true).length,
    refused: ver.filter(v => v.admission && v.admission.admitted === false).length,
    codesByKind: (() => {
      const m: Record<string, number> = {};
      for (const v of ver) for (const c of (v.admission?.codes ?? [])) m[c] = (m[c] ?? 0) + 1;
      return m;
    })(),
    verdictDistribution: (() => {
      const m: Record<string, number> = {};
      for (const v of ver) m[String(v.verdict ?? 'null')] = (m[String(v.verdict ?? 'null')] ?? 0) + 1;
      return m;
    })(),
    bindingAdmitted: ver.filter(v => v.admission?.bindingAdmitted === true).length,
    wrongKeyBound: ver.filter(v => v.bindingFactKey && v.bindingFactKey !== v.factKey).length,
    relianceDeclared: ver.filter(v => v.regulatoryBasis?.reliance === 'SUPPLIED_GOVERNED_EVIDENCE').length,
  },
  HARD_FAIL_EVALUATION: {
    ...hardFailEvaluability(completed.length, hardFails.some(h => h.triggered)),
    conditions: completed.length > 0 ? hardFails
      : hardFails.map(h => ({ ...h, triggered: false, evaluable: false, evidence: 'NOT EVALUABLE — zero completed executions' })),
  },
  EMPTY_RUN_REPORTING_SELF_AUDIT: {
    completedExecutions: completed.length,
    violations: emptyRunReportingViolations(completed.length, axisSummary),
  },
};

writeFileSync(join(EVID, 'DETERMINISTIC-RESULTS.json'), `${JSON.stringify(deterministic, null, 2)}\n`);

// ================================================================ ADJUDICATION-PACKET.json

const AXES = [
  { id: 'A', name: 'FIRST_PASS_GAP_RECALL', unit: 'row',
    question: 'Were ALL genuinely decision-critical unresolved facts declared for this row?',
    whatWouldJustifyCorrect: 'every gap the text genuinely leaves open, and that changes what is done today, was declared',
    whatWouldJustifyIncorrect: 'a gap that changes what is done today was not declared at all',
    whatMustNotInfluence: 'whether the count matches the preregistered range' },
  { id: 'B', name: 'FIRST_PASS_GAP_PRECISION', unit: 'row',
    question: 'Were unnecessary or already-resolved facts avoided?',
    whatWouldJustifyCorrect: 'no declared fact is already established by the text and none is decision-neutral',
    whatWouldJustifyIncorrect: 'a declared fact is answered by the text, or would change nothing today',
    whatMustNotInfluence: 'whether asking anyway would be harmless or good practice' },
  { id: 'C', name: 'OWED_PROPERTY_SEMANTIC_CORRECTNESS', unit: 'fact',
    question: 'Does this declaration identify the EXACT property that remains unknown?',
    whatWouldJustifyCorrect: 'the property named is the one the text leaves open',
    whatWouldJustifyIncorrect: 'the property named is a NEIGHBOUR the text already establishes',
    whatMustNotInfluence: 'that OwedFact has no dedicated field for the property; score from missingFact and the full declaration' },
  { id: 'D', name: 'EVIDENCE_SPAN_SEMANTIC_RELEVANCE', unit: 'fact',
    question: 'Is the verbatim span actually relevant to WHY this fact is unresolved?',
    whatWouldJustifyCorrect: 'the span is the text that shows the fact is open, or that makes it matter',
    whatWouldJustifyIncorrect: 'the span is verbatim but points at something else',
    whatMustNotInfluence: 'span length; deterministic substring validity is already proven and is not the question' },
  { id: 'E', name: 'BRANCH_PLAUSIBILITY', unit: 'fact',
    question: 'Are branchA and branchB genuinely possible resolutions of THIS exact fact?',
    whatWouldJustifyCorrect: 'both branches are real possible states of the world',
    whatWouldJustifyIncorrect: 'a branch is a rhetorical opposite, an invented state the text excludes, or an answer to a different question',
    whatMustNotInfluence: 'which branch is more likely' },
  { id: 'F', name: 'DECISION_DIVERGENCE_VALIDITY', unit: 'fact',
    question: 'Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions?',
    whatWouldJustifyCorrect: 'the two actions differ in what someone would do now',
    whatWouldJustifyIncorrect: 'the wording differs but the action is the same, or one action does not follow from its branch',
    whatMustNotInfluence: 'that the boundary already refused identical strings — it compares bytes, not decisions' },
  { id: 'G', name: 'AFFECTED_DECISION_CORRECTNESS', unit: 'fact',
    question: 'Is the fact bound to the correct affectedDecision?',
    whatWouldJustifyCorrect: 'the label names the decision the missing fact actually blocks',
    whatWouldJustifyIncorrect: 'the label names a topic rather than the blocked decision',
    whatMustNotInfluence: 'whether it matches the preregistered one — acceptable alternatives are listed' },
  { id: 'H', name: 'MULTI_GAP_PRESERVATION', unit: 'row',
    question: 'Do independent gaps survive INDEPENDENTLY?',
    whatWouldJustifyCorrect: 'each declared fact stands alone and would need its own evidence',
    whatWouldJustifyIncorrect: 'two declarations restate one gap, or one silently merges two',
    whatMustNotInfluence: 'the structural distinctness of the computed keys — already reported mechanically' },
  { id: 'I', name: 'FALSE_GAP_SUPPRESSION', unit: 'row',
    question: 'On a row whose text is sufficient, was an unnecessary owed fact avoided?',
    whatWouldJustifyCorrect: 'no fact was declared, or any declared fact is genuinely open',
    whatWouldJustifyIncorrect: 'a fact was declared that the text answers',
    whatMustNotInfluence: 'that declaring something would have been more thorough' },
  { id: 'L', name: 'VERIFIER_TARGET_BINDING', unit: 'fact',
    question: 'Does the verifier verdict address the EXACT projected owed fact?',
    whatWouldJustifyCorrect: 'the verdict is about this fact and no other',
    whatWouldJustifyIncorrect: 'it addresses a neighbouring property, a different hazard, or the row in general',
    whatMustNotInfluence: 'that the bindingFactKey matched — key equality is mechanical' },
  { id: 'M', name: 'CLARIFICATION_RESOLUTION_SUFFICIENCY', unit: 'fact',
    question: 'Would the requested clarification actually obtain evidence CAPABLE OF SETTLING the fact?',
    whatWouldJustifyCorrect: 'an answer would establish or refute the property',
    whatWouldJustifyIncorrect: 'it names the right fact but would be satisfied by evidence that leaves the property open',
    whatMustNotInfluence: 'how well-phrased the question is. TOPIC REACH IS NOT RESOLUTION SUFFICIENCY' },
  { id: 'N', name: 'GOVERNED_EVIDENCE_QUOTATION_BOUNDARY', unit: 'fact',
    question: 'Was reliance on the supplied governed record legitimate, and was any quotation faithful to it?',
    whatWouldJustifyCorrect: 'reliance declared only where the record genuinely bears on the fact, and the proposition says what the record says',
    whatWouldJustifyIncorrect: 'reliance declared on an off-point record, or the proposition overstates the record',
    whatMustNotInfluence: 'that the admission boundary admitted it — structural reuse is not semantic validation' },
  { id: 'Q', name: 'OWED_PROPERTY_LOSS_IMPACT', unit: 'fact',
    question: 'Does the ABSENCE of a dedicated owed-property field cause downstream ambiguity for this fact?',
    whatWouldJustifyCorrect: 'nothing was lost — the property is unambiguous from whyUnresolved and the branches',
    whatWouldJustifyIncorrect: 'the projected form is ambiguous, loses target specificity, or lets a nearby property be conflated',
    whatMustNotInfluence: 'MEASUREMENT ONLY. Does not authorise adding a field or mutating the contract.' },
  { id: 'R', name: 'PRIORITY_FLOOR_IMPACT', unit: 'fact',
    question: 'Would this fact be MATERIALLY UNDER-ESCALATED by entering at the non-escalating OTHER floor?',
    whatWouldJustifyCorrect: 'OTHER is appropriate — the gap does not warrant a fail-closed state',
    whatWouldJustifyIncorrect: 'the gap is safety-critical and the floor materially under-escalates it',
    whatMustNotInfluence: 'MEASUREMENT ONLY. Does not authorise changing the gate.' },
  { id: 'S', name: 'FIRST_PASS_GOVERNED_SOURCE_ID_BINDING (semantic half)', unit: 'fact',
    question: 'Was naming — or NOT naming — a governed sourceId APPROPRIATE for this fact?',
    whatWouldJustifyCorrect: 'a record that genuinely bears on the fact was named, or an off-point record was correctly left unnamed',
    whatWouldJustifyIncorrect: 'an off-point record was named, or a record that plainly bears on the fact was ignored',
    whatMustNotInfluence: 'the structural check that every named id was supplied — that is already reported and is a different question' },
  { id: 'T', name: 'FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING', unit: 'fact',
    question: 'FIRST answer the precondition: did the PROVIDER-VISIBLE first-pass treatment contain '
      + 'semantic governed evidence sufficient to judge grounding at all? If not, T is NOT_EXERCISED '
      + 'and you stop there.',
    whatWouldJustifyCorrect: 'the redacted text shown to the first pass carried enough meaning to ground the binding, AND the binding is so grounded',
    whatWouldJustifyIncorrect: 'the treatment was sufficient and the binding is nonetheless ungrounded',
    whatMustNotInfluence: 'CORRECT sourceId SELECTION ALONE IS NOT ENOUGH FOR T. S and T must not be collapsed.' },
];

const packet = {
  artifact: 'SECTION_199_ADJUDICATION_PACKET',
  status: 'PENDING_HUMAN_ADJUDICATION',
  writtenBy: 'the §199 scorer. EVERY VERDICT FIELD IS NULL AND THIS MODEL FILLED NONE.',
  whyNoModelVerdicts: 'the authorization states that no deterministic script may manufacture '
    + 'semantic verdicts, requires HUMAN review of every first-pass row and every projected fact, '
    + 'and forbids the validator that admitted a declaration from acting as the semantic oracle.',
  TRUTH_PROVENANCE,
  verdictVocabulary: ['CORRECT', 'PARTIALLY_CORRECT', 'INCORRECT', 'AMBIGUOUS', 'NOT_EXERCISED'],
  verdictGuidance: {
    NOT_EXERCISED: 'the row or fact gave no occasion for this axis — the denominator shrinks, and '
      + 'that is correct. Never score an unavailable opportunity as a pass.',
    AMBIGUOUS: 'the authored scenario itself does not settle the question. An ambiguous row is '
      + 'removed PROSPECTIVELY from its denominator and every historical score is preserved.',
    PARTIALLY_CORRECT: 'part of the required content is present and part is missing — a dropped '
      + 'conjunct, a right property with a wrong span.',
  },
  axes: AXES,
  disclosureRequirement: 'if these verdicts are formed after reading the deterministic results in '
    + 'this package, that must be recorded structurally alongside the verdicts and must travel with '
    + 'every figure derived from them.',

  rows: SECTION_199_COHORT.map(r => {
    const f = fp.find(x => x.rowId === r.rowId && !x.diagnosticRepeat);
    const p = proj.find(x => x.rowId === r.rowId);
    return {
      rowId: r.rowId,
      provenance: r.provenance,
      section197Origin: r.section197Origin,
      isTransportCanary: r.rowId === TRANSPORT_CANARY_ROW_ID,
      capability: p?.capability ?? (r.verifierGovernedEvidence.length > 0 ? 'PRESENT' : 'ABSENT'),
      families: r.families,
      pairedWith: r.pairedWith,
      designIntent: r.designIntent,
      observation: r.observation,
      governedRecordsShownToFirstPass: r.governedStandards.map(g => ({
        title: g.title, textAsShownIsRedacted: true,
      })),
      governedSourceIdsShownToFirstPass: r.verifierGovernedEvidence.map(g => g.sourceId),
      preregisteredEstablishedByTheText: r.establishedByTheText,
      preregisteredNotEstablishedByTheText: r.notEstablishedByTheText,
      preregisteredExpectedGapCount: r.expectedGapCount,
      preregisteredExpectedOwedFacts: r.expectedOwedFacts,
      modelOutcome: f?.outcome ?? null,
      modelSummary: f?.expertExplanation?.summary ?? null,
      modelUncertainty: f?.uncertainty?.statements ?? [],
      modelHazardCandidates: f?.hazardCandidates ?? [],
      modelClarifications: f?.clarifications ?? [],
      rawDeclarations: f?.rawDeclarations ?? [],
      admittedFactKeys: (p?.perDeclaration ?? []).filter((d: any) => d.admitted).map((d: any) => d.factKey),
      refusedDeclarations: (p?.perDeclaration ?? []).filter((d: any) => !d.admitted),
      executionEvent: f?.behavioralExecution === true ? null : {
        failureKind: f?.failureKind ?? 'NOT_EXECUTED',
        reachedInference: f?.reachedInference ?? null,
        note: f?.reachedInference
          ? 'inference completed but no usable output was returned — this IS model behaviour'
          : 'an execution event, not model behaviour. Score every axis NOT_EXERCISED for this row.',
      },
      verdicts: {
        A_FIRST_PASS_GAP_RECALL: null,
        B_FIRST_PASS_GAP_PRECISION: null,
        H_MULTI_GAP_PRESERVATION: null,
        I_FALSE_GAP_SUPPRESSION: null,
      },
      reviewerNotes: null,
    };
  }),

  facts: proj.flatMap(p => (p.perDeclaration as any[])
    .filter(d => d.admitted && d.owedFact)
    .map(d => {
      const row = rowOf(p.rowId);
      const raw = (fp.find(x => x.rowId === p.rowId && !x.diagnosticRepeat)?.rawDeclarations ?? [])
        .find((x: any) => x?.declarationId === d.declarationId);
      const v = ver.find(x => x.rowId === p.rowId && x.factKey === d.factKey);
      const capability = p.capability;
      return {
        rowId: p.rowId,
        capability,
        factKey: d.factKey,
        declarationId: d.declarationId,
        declaration: raw ?? null,
        projectedOwedFact: d.owedFact,
        missingFactPresentInDeclaration: raw?.missingFact ?? null,
        missingFactPresentInProjectedOwedFact: false,
        governedIdsNamedByThisDeclaration: raw?.governedEvidenceSourceIds ?? null,
        governedIdsSuppliedForThisRow: row.verifierGovernedEvidence.map(g => g.sourceId),
        axisTPrecondition: capability === 'PRESENT'
          ? 'the first pass saw this record\'s exact sourceId and its text with citation-shaped '
            + 'tokens replaced by [citation withheld]. JUDGE FIRST whether what remained was '
            + 'semantically sufficient to ground a binding. If not, T is NOT_EXERCISED.'
          : 'no governed evidence was supplied for this row, so the capability was ABSENT and T is '
            + 'NOT_EXERCISED by construction.',
        preregisteredExpectations: row.expectedOwedFacts,
        verifier: v ? {
          executed: v.behavioralExecution === true,
          reachedInference: v.reachedInference,
          verdict: v.verdict,
          rationale: v.rationale,
          proposedClarification: v.proposedClarification,
          bindingFactKey: v.bindingFactKey,
          owedFactDeclarations: v.owedFactDeclarations,
          regulatoryBasis: v.regulatoryBasis,
          governedEvidenceShownToVerifier: row.verifierGovernedEvidence,
          admissionAdmitted: v.admission?.admitted ?? null,
          admissionCodes: v.admission?.codes ?? [],
          citationReuseAdmitted: v.admission?.citationReuseAdmitted ?? null,
          unauthorisedCitations: v.admission?.unauthorisedCitations ?? [],
        } : { executed: false, note: 'this projected fact was not sent to the verifier' },
        verdicts: {
          C_OWED_PROPERTY_SEMANTIC_CORRECTNESS: null,
          D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE: null,
          E_BRANCH_PLAUSIBILITY: null,
          F_DECISION_DIVERGENCE_VALIDITY: null,
          G_AFFECTED_DECISION_CORRECTNESS: null,
          L_VERIFIER_TARGET_BINDING: null,
          M_CLARIFICATION_RESOLUTION_SUFFICIENCY: null,
          N_GOVERNED_EVIDENCE_QUOTATION_BOUNDARY: null,
          Q_OWED_PROPERTY_LOSS_IMPACT: null,
          R_PRIORITY_FLOOR_IMPACT: null,
          S_GOVERNED_ID_BINDING_APPROPRIATENESS: null,
          T_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING: null,
          T_PRECONDITION_MET: null,
        },
        reviewerNotes: null,
      };
    })),

  completeness: (() => {
    const factCount = admittedDeclarations;
    const required = SECTION_199_COHORT.length * 4 + factCount * 13;
    return {
      rowsRequiringReview: SECTION_199_COHORT.length,
      factsRequiringReview: factCount,
      verdictsRequired: required,
      verdictsSupplied: 0,
      HUMAN_ADJUDICATION_COMPLETENESS: `0 / ${required}`,
      STATUS: completed.length === 0 ? 'NOT_ADJUDICABLE' : 'UNMEASURED',
      notAdjudicableReason: completed.length === 0
        ? 'no inference completed, so there is no model output to adjudicate' : null,
    };
  })(),
};

writeFileSync(join(EVID, 'ADJUDICATION-PACKET.json'), `${JSON.stringify(packet, null, 2)}\n`);

// ================================================================ console

console.log('§199 DETERMINISTIC SCORING');
console.log(`  calls             ${allCalls.length} attempted, ${reachedInference.length} reached inference, ${completed.length} completed`);
console.log(`  canary            ${canary.outcome}   breaker ${breaker.tripped ? 'TRIPPED' : 'clear'}`);
console.log(`  actual spend      $${actualSpend.toFixed(5)}   (${inputTokens} in / ${outputTokens} out)`);
console.log(`  errors            ${JSON.stringify(errorClasses)}`);
console.log(`  declarations      ${rawDeclarations} raw, ${admittedDeclarations} admitted, ${refusedDeclarations} refused`);
console.log(`  refusal codes     ${JSON.stringify(refusalCodes)}`);
console.log(`  K identity        ${axisSummary.K_FACTKEY_IDENTITY_INTEGRITY}`);
console.log(`  J fidelity        ${axisSummary.J_PROJECTION_FIDELITY}`);
console.log(`  S id binding      ${axisSummary.S_STRUCTURAL_GOVERNED_ID_BINDING}`);
console.log(`  O containment     ${axisSummary.O_UNSUPPLIED_CITATION_CONTAINMENT}`);
console.log(`  P settlement      ${axisSummary.P_SETTLEMENT_AUTHORITY}`);
console.log(`  counts in range   ${deterministic.countsWithinPreregisteredRange}`);
console.log(`  verifier          ${ver.length} calls, ${deterministic.verifierAdmission.admitted} admitted`);
console.log(`  HARD FAILS        ${completed.length === 0 ? 'NOT EVALUABLE — nothing completed' : (hardFails.filter(h => h.triggered).map(h => h.id).join(', ') || 'none triggered')}`);
console.log(`  self-audit        ${deterministic.EMPTY_RUN_REPORTING_SELF_AUDIT.violations.length} empty-run reporting violations`);
console.log('');
console.log(`  ADJUDICATION PACKET: ${packet.completeness.STATUS}  (${packet.completeness.verdictsRequired} verdict slots, 0 supplied)`);
console.log('  NO SEMANTIC VERDICT WAS PRODUCED BY THIS SCRIPT.');
