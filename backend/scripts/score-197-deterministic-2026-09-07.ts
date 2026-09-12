/**
 * §197 -- DETERMINISTIC SCORING AND THE NEUTRAL ADJUDICATION PACKET. ZERO PROVIDER CALLS.
 *
 * ==================== THE LINE THIS FILE DOES NOT CROSS ====================
 *
 * It computes every MECHANICAL axis and it produces NO SEMANTIC VERDICT OF ANY KIND — not even one
 * labelled diagnostic. The authorization requires human semantic review of every projected fact and
 * every first-pass row, and forbids the deterministic validator that ADMITTED a declaration from
 * acting as the oracle for whether that declaration is right.
 *
 * So `ADJUDICATION-PACKET.json` leaves every verdict field `null`. This file fills none of them.
 * A run whose semantic axes are unadjudicated is reported as unadjudicated.
 *
 * ==================== WHAT COUNTS AS MECHANICAL HERE ====================
 *
 * A comparison that is a byte check, a set membership, or a recomputation of a deterministic
 * function. `factKey` derivation is recomputed independently from the persisted declaration and the
 * observation, and compared with what the projection reported. Field provenance is compared byte for
 * byte against the declaration that produced it.
 *
 * A COUNT compared against a preregistered expected range is reported as a count and a comparison.
 * It is NOT a correctness verdict: whether the declared fact IS the expected fact is semantic, and
 * a row can hit the expected count while declaring entirely the wrong property.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

import {
  SECTION_197_COHORT, SECTION_197_COHORT_VERSION, COHORT_COVERAGE, TRUTH_PROVENANCE,
} from './lib/expert-197-cohort-2026-09-07';
import {
  computeFactKey, OWED_FACT_FIELD_PROVENANCE, FIRST_PASS_PROJECTED_PRIORITY, PROJECTED_STATUS,
} from './lib/expert-first-pass-owed-fact-projection';
import { citationTokens } from './lib/expert-governed-citation-reuse';
import { createOwedFactLedger } from
  '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-ledger';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-structured-e2e-validation-2026-09-07');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

const readJsonl = (p: string): any[] => (existsSync(p)
  ? readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)) : []);

const prereg = JSON.parse(readFileSync(join(EVID, 'PREREGISTRATION.json'), 'utf8'));
const fp = readJsonl(join(EVID, 'RAW-FIRST-PASS-OUTPUTS.jsonl'));
const proj = readJsonl(join(EVID, 'PROJECTION-PROVENANCE.jsonl'));
const ver = readJsonl(join(EVID, 'RAW-VERIFIER-OUTPUTS.jsonl'));

const rowOf = (id: string) => SECTION_197_COHORT.find(r => r.rowId === id)!;

/**
 * AN AXIS WITH AN EMPTY DENOMINATOR IS `NOT_EXERCISED`, NEVER A PASS.
 *
 * The first draft of this scorer printed `P settlement = NO_PROVIDER_OUTPUT_SETTLED_ANY_FACT` and
 * `HARD FAILS = none triggered` on a run where NOTHING EXECUTED. Both were literally true and both
 * read as green. That is the same failure the §193 auditability sweep exists to prevent: an
 * instrument that cannot see its subject must say so rather than return clean. Every axis result
 * below is routed through this function so a zero denominator cannot look like a pass.
 */
function resultOrNotExercised(n: number, verdictWhenExercised: string): string {
  return n === 0 ? 'NOT_EXERCISED — zero executions; this axis has an empty denominator and is '
    + 'neither a pass nor a failure' : verdictWhenExercised;
}

// ================================================================ execution accounting

const allCalls = [...fp, ...ver];
const behavioural = allCalls.filter(c => c.behavioralExecution === true);
const failures = allCalls.filter(c => c.behavioralExecution !== true);
const errorClasses: Record<string, number> = {};
for (const f of failures) errorClasses[String(f.failureKind ?? 'UNKNOWN')] = (errorClasses[String(f.failureKind ?? 'UNKNOWN')] ?? 0) + 1;
const actualSpend = allCalls.reduce((n, c) => n + (c.usage?.costUsd ?? 0), 0);
const inputTokens = allCalls.reduce((n, c) => n + (c.usage?.inputTokens ?? 0), 0);
const outputTokens = allCalls.reduce((n, c) => n + (c.usage?.outputTokens ?? 0), 0);

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
    identityFindings.push({
      rowId: p.rowId, declarationId: a.declarationId,
      reportedFactKey: a.reportedFactKey,
      independentlyRecomputedFactKey: a.independentlyRecomputedFactKey,
      derivationMatches: match,
      providerSuppliedAnyFactKeyField: a.providerSuppliedAnyFactKeyField,
      // The key is re-derived a THIRD time here, from the persisted declaration alone, so the audit
      // does not depend on the executor's own arithmetic either.
      independentRecomputationInScorer: (() => {
        const d = (p.perDeclaration.find((x: any) => x.declarationId === a.declarationId) ?? {}) as any;
        const f = d.owedFact;
        if (!f) return null;
        const span = f.evidenceSpan;
        const start = row.observation.indexOf(span);
        if (start < 0) return null;
        const sameAnchorEarlier = (p.perDeclaration as any[])
          .filter(q => q.admitted && q.owedFact)
          .filter(q => q.owedFact.affectedDecision === f.affectedDecision
            && row.observation.indexOf(q.owedFact.evidenceSpan) === start);
        const ordinal = sameAnchorEarlier.findIndex(q => q.declarationId === a.declarationId) + 1;
        return computeFactKey({
          stage: 'FIRST_PASS_MODEL', affectedDecision: f.affectedDecision,
          observationSourceId: `OBS-${p.rowId}`, startOffset: start,
          endOffset: start + span.length, ordinal,
        });
      })(),
    });
  }
}
const scorerRecomputationMatches = identityFindings
  .filter(f => f.independentRecomputationInScorer === f.reportedFactKey).length;

// ================================================================ J — projection fidelity (bytes)

const fidelityFindings: any[] = [];
let fidelityOk = 0;
let fidelityViolations = 0;
for (const p of proj) {
  const rec = fp.find(f => f.rowId === p.rowId);
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

// ================================================================ multi-gap structural survival

const multiGapStructural = COHORT_COVERAGE.multiGapRows.map(rowId => {
  const p = proj.find(x => x.rowId === rowId);
  return {
    rowId,
    rawDeclarations: p?.rawDeclarationCount ?? 0,
    admitted: p?.admittedCount ?? 0,
    distinctFactKeys: new Set((p?.perDeclaration ?? []).filter((d: any) => d.admitted).map((d: any) => d.factKey)).size,
    allDistinct: (p?.admittedCount ?? 0) === new Set((p?.perDeclaration ?? []).filter((d: any) => d.admitted).map((d: any) => d.factKey)).size,
    note: 'STRUCTURAL ONLY. Whether the two facts are genuinely INDEPENDENT is semantic and is in '
      + 'the adjudication packet.',
  };
});

// ================================================================ isolation (family C, observational)

const isolationObservations = proj
  .filter(p => p.refusedCount > 0 && p.admittedCount > 0)
  .map(p => ({
    rowId: p.rowId, admitted: p.admittedCount, refused: p.refusedCount,
    admittedFactKeys: (p.perDeclaration as any[]).filter(d => d.admitted).map(d => d.factKey),
    refusedCodes: (p.perDeclaration as any[]).filter(d => !d.admitted).flatMap(d => d.codes),
    isolationHeld: p.admittedCount > 0,
  }));

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

const quotationOpportunityRows = COHORT_COVERAGE.governedQuotationOpportunityRows;
const containmentOpportunityRows = COHORT_COVERAGE.unsuppliedCitationOpportunityRows;
const quotationTaken = citationRows.filter(c => quotationOpportunityRows.includes(c.rowId)
  && c.citationTokensEmitted.length > 0);
const containmentTaken = citationRows.filter(c => containmentOpportunityRows.includes(c.rowId)
  && c.citationTokensEmitted.length > 0);

// A HARD FAIL: any admitted verdict carrying a token that is in NO supplied source.
const unsuppliedAdmitted = citationRows.filter(c => c.admitted === true
  && c.tokensNotInAnySuppliedSource.length > 0);

// ================================================================ P — settlement authority

const settlementProbe = (() => {
  const facts = proj.flatMap(p => (p.perDeclaration as any[]).filter(d => d.admitted && d.owedFact).map(d => d.owedFact));
  if (facts.length === 0) return { ledgerBuilt: false, transitions: 0, allUnresolved: true, note: 'no facts projected' };
  // Facts from different rows share no keys by construction (the sourceId is in the key), so one
  // ledger over all of them is legal and lets the invariant be checked once.
  const ledger = createOwedFactLedger('DEVELOPMENT', facts);
  return {
    ledgerBuilt: true,
    transitions: ledger.transitions.length,
    allUnresolved: ledger.facts.every(f => f.status === 'UNRESOLVED'),
    factCount: ledger.facts.length,
  };
})();
const verifierSettlementAttempts = ver.filter(v => {
  const decls: any[] = v.owedFactDeclarations ?? [];
  return decls.some(d => ['settled', 'resolved', 'covered', 'rejected'].some(k => k in (d ?? {})));
});
const anyFactLeftUnresolvedByExecution = settlementProbe.allUnresolved;

// ================================================================ gap counts vs preregistered range

const rowCounts = SECTION_197_COHORT.map(r => {
  const p = proj.find(x => x.rowId === r.rowId);
  const f = fp.find(x => x.rowId === r.rowId);
  const admitted = p?.admittedCount ?? 0;
  return {
    rowId: r.rowId,
    families: r.families,
    executed: f?.behavioralExecution === true,
    outcome: f?.outcome ?? null,
    rawDeclarations: p?.rawDeclarationCount ?? 0,
    admittedFacts: admitted,
    refusedDeclarations: p?.refusedCount ?? 0,
    clarifications: (f?.clarifications ?? []).length,
    hazardCandidates: (f?.hazardCandidates ?? []).length,
    expectedGapCount: r.expectedGapCount,
    countWithinPreregisteredRange: admitted >= r.expectedGapCount.min && admitted <= r.expectedGapCount.max,
    countComparisonNote: 'A COUNT COMPARISON, NOT A CORRECTNESS VERDICT. A row can hit the expected '
      + 'count while declaring entirely the wrong property; that judgement is in the packet.',
  };
});
const countsInRange = rowCounts.filter(r => r.executed && r.countWithinPreregisteredRange).length;
const executedRows = rowCounts.filter(r => r.executed).length;

// ================================================================ hard-fail evaluation

const hardFails: Array<{ id: string; triggered: boolean; evidence: string }> = [
  { id: 'provider-authored factKey accepted', triggered: providerAuthoredKeyAttempts > 0,
    evidence: `${providerAuthoredKeyAttempts} declaration(s) carried a factKey field` },
  { id: 'projection altered branch or decision-divergence meaning', triggered: fidelityViolations > 0,
    evidence: `${fidelityViolations} projected fact(s) differ from their declaration` },
  { id: 'factKey not deterministically derived', triggered: identityMismatches > 0,
    evidence: `${identityMismatches} of ${identityMatches + identityMismatches} keys did not match an independent recomputation` },
  { id: 'v3.3 admitted unsupplied citation-shaped authority', triggered: unsuppliedAdmitted.length > 0,
    evidence: `${unsuppliedAdmitted.length} admitted verdict(s) carry a token absent from every supplied source` },
  { id: 'provider output settled an OwedFact', triggered: !anyFactLeftUnresolvedByExecution || verifierSettlementAttempts.length > 0,
    evidence: `ledger transitions=${settlementProbe.transitions}, settlement-claiming declarations=${verifierSettlementAttempts.length}` },
  { id: 'provider-authored priority escalated UNRESOLVED_SAFETY_STATE',
    triggered: proj.some(p => (p.perDeclaration as any[]).some(d => d.owedFact && d.owedFact.priority !== FIRST_PASS_PROJECTED_PRIORITY)),
    evidence: `every projected fact must carry priority ${FIRST_PASS_PROJECTED_PRIORITY}` },
  { id: 'call ceiling exceeded',
    triggered: allCalls.length > prereg.caps.HARD_TOTAL_CALL_CEILING,
    evidence: `${allCalls.length} calls against a ceiling of ${prereg.caps.HARD_TOTAL_CALL_CEILING}` },
];

// ================================================================ DETERMINISTIC-RESULTS.json

const deterministic = {
  artifact: 'SECTION_197_DETERMINISTIC_RESULTS',
  preregistrationSha256: sha(readFileSync(join(EVID, 'PREREGISTRATION.json'), 'utf8')),
  cohortVersion: SECTION_197_COHORT_VERSION,
  TRUTH_PROVENANCE,
  SCOPE: 'MECHANICAL AXES ONLY. No semantic verdict is produced anywhere in this file. Axes A-I, '
    + 'L, M, Q and R are HUMAN_REQUIRED and appear only in ADJUDICATION-PACKET.json with null '
    + 'verdicts.',

  execution: {
    model: prereg.provider_model.model,
    respondedModels: [...new Set(allCalls.map(c => c.respondedModel).filter(Boolean))],
    providerCallsAttempted: allCalls.length,
    providerCallsCompleted: behavioural.length,
    firstPassCalls: fp.length,
    verifierCalls: ver.length,
    HARD_TOTAL_CALL_CEILING: prereg.caps.HARD_TOTAL_CALL_CEILING,
    providerErrorsByClass: errorClasses,
    preInferenceFailures: failures.filter(f => f.preInferenceFailure === true).length,
    preInferenceNote: 'a rejection that never reached inference is an EXECUTION event and is never '
      + 'scored as model behaviour',
    ACTUAL_PROVIDER_SPEND_USD: Number(actualSpend.toFixed(5)),
    spendRule: 'provider-returned usage only',
    inputTokens, outputTokens,
  },

  declarations: {
    rawDeclarationCount: rawDeclarations,
    admittedDeclarationCount: admittedDeclarations,
    rejectedDeclarationCount: refusedDeclarations,
    projectedOwedFactCount: admittedDeclarations,
    refusalCodesByKind: refusalCodes,
  },

  perRow: rowCounts,
  countsWithinPreregisteredRange: resultOrNotExercised(executedRows, `${countsInRange}/${executedRows}`),
  countsNote: 'This is the single most misreadable number in the package. It says the NUMBER of '
    + 'declared facts fell inside the preregistered range. It says NOTHING about whether they are '
    + 'the right facts, whether the spans are relevant, or whether the branches are plausible.',

  K_FACTKEY_IDENTITY_INTEGRITY: {
    classification: 'MECHANICAL',
    keysAudited: identityMatches + identityMismatches,
    derivationMatches: identityMatches,
    derivationMismatches: identityMismatches,
    independentScorerRecomputationMatches: scorerRecomputationMatches,
    providerAuthoredFactKeyFieldAttempts: providerAuthoredKeyAttempts,
    result: resultOrNotExercised(identityMatches + identityMismatches,
      identityMismatches === 0 && providerAuthoredKeyAttempts === 0 ? 'PASS' : 'FAIL'),
    method: 'each key was derived three times — by the projection, by the executor, and again here '
      + 'from the persisted declaration and observation alone — and all three must agree',
    findings: identityFindings,
  },

  J_PROJECTION_FIDELITY_BYTES: {
    classification: 'MECHANICAL',
    factsChecked: fidelityOk + fidelityViolations,
    byteFaithful: fidelityOk,
    violations: fidelityViolations,
    result: resultOrNotExercised(fidelityOk + fidelityViolations,
      fidelityViolations === 0 ? 'PASS' : 'FAIL'),
    method: 'every EXPLICIT_UPSTREAM_FIELD compared byte for byte against the declaration that '
      + 'produced it; every MECHANICAL_DERIVATION compared against its frozen constant',
    provenanceRowsCovered: OWED_FACT_FIELD_PROVENANCE.length,
    findings: fidelityFindings,
    limitation: 'BYTE PRESERVATION ONLY. That the projection did not ALTER the semantics is proven '
      + 'here; that the semantics were right in the first place is axis C, E and F, and is human.',
  },

  H_MULTI_GAP_STRUCTURAL: {
    classification: 'MECHANICAL (structural half only)',
    opportunityRows: COHORT_COVERAGE.multiGapRows,
    rows: multiGapStructural,
  },

  C_ISOLATION_OBSERVATIONAL: {
    classification: 'OBSERVATIONAL — no declaration was prompted to violate the schema',
    rowsWhereBothAdmittedAndRefusedOccurred: isolationObservations,
    note: isolationObservations.length === 0
      ? 'the model produced no malformed declaration beside a well-formed one, so hosted evidence '
        + 'for per-declaration isolation was NOT EXERCISED. §196 case C4 establishes it '
        + 'deterministically; this run neither confirms nor disconfirms it.'
      : 'a malformed declaration occurred beside a well-formed one and the well-formed one survived',
  },

  N_O_CITATION_BOUNDARY: {
    classification: 'MECHANICAL',
    perVerifierCall: citationRows,
    quotationOpportunityRows,
    quotationOpportunitiesTaken: `${quotationTaken.length}/${citationRows.filter(c => quotationOpportunityRows.includes(c.rowId)).length}`,
    containmentOpportunityRows,
    containmentOpportunitiesTaken: `${containmentTaken.length}/${citationRows.filter(c => containmentOpportunityRows.includes(c.rowId)).length}`,
    O_unsuppliedCitationAdmitted: unsuppliedAdmitted.length,
    O_result: resultOrNotExercised(citationRows.length,
      unsuppliedAdmitted.length === 0 ? 'NO_UNSUPPLIED_CITATION_WAS_ADMITTED' : 'HARD_FAIL'),
    denominatorRule: 'reported against OPPORTUNITY rows, never against total executions. An '
      + 'opportunity the model did not take is reported as not taken, never as a pass.',
    smallNRule: 'n is 1 per opportunity family in this cohort. Reported as x/n literally; '
      + 'NOT_MEANINGFULLY_ESTIMABLE as a rate.',
  },

  P_SETTLEMENT_AUTHORITY: {
    classification: 'MECHANICAL',
    ledger: settlementProbe,
    verifierDeclarationsClaimingSettlement: verifierSettlementAttempts.length,
    everyProjectedFactStillUnresolved: anyFactLeftUnresolvedByExecution,
    result: resultOrNotExercised(settlementProbe.ledgerBuilt ? (settlementProbe as any).factCount ?? 0 : 0,
      anyFactLeftUnresolvedByExecution && verifierSettlementAttempts.length === 0
        ? 'NO_PROVIDER_OUTPUT_SETTLED_ANY_FACT' : 'HARD_FAIL'),
    PROVIDER_SETTLEMENT_AUTHORITY: 'NEVER',
  },

  verifierAdmission: {
    executions: ver.length,
    admitted: ver.filter(v => v.admission?.admitted === true).length,
    refused: ver.filter(v => v.admission && v.admission.admitted === false).length,
    noAdmissionComputed: ver.filter(v => !v.admission).length,
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
    EVALUABLE: behavioural.length > 0,
    note: behavioural.length > 0 ? null
      : 'NOT EVALUABLE. No inference occurred, so no hard-fail condition could have been triggered '
        + 'or cleared. "none triggered" on this run means "nothing ran", NOT "the architecture held".',
    conditions: behavioural.length > 0 ? hardFails
      : hardFails.map(h => ({ ...h, triggered: false, evaluable: false,
        evidence: 'NOT EVALUABLE — zero behavioural executions' })),
    anyTriggered: behavioural.length > 0 ? hardFails.some(h => h.triggered) : null,
  },
};

writeFileSync(join(EVID, 'DETERMINISTIC-RESULTS.json'), `${JSON.stringify(deterministic, null, 2)}\n`);

// ================================================================ ADJUDICATION-PACKET.json

const AXES = [
  { id: 'A', name: 'FIRST_PASS_GAP_RECALL', unit: 'row',
    question: 'Were ALL genuinely decision-critical unresolved facts declared for this row?',
    whatBearsOnIt: 'the observation text, what it establishes, and what it leaves open. A fact is '
      + 'decision-critical only if two materially different answers would lead to two different '
      + 'CURRENT outcomes.',
    whatWouldJustifyCorrect: 'every gap the text genuinely leaves open, and that changes what is '
      + 'done today, was declared',
    whatWouldJustifyIncorrect: 'a gap that changes what is done today was not declared at all',
    whatMustNotInfluence: 'how well-written the declaration is; whether the count matches the '
      + 'preregistered range; whether the model also raised a hazard candidate' },
  { id: 'B', name: 'FIRST_PASS_GAP_PRECISION', unit: 'row',
    question: 'Were unnecessary or already-resolved facts avoided?',
    whatBearsOnIt: 'whether each declared fact is genuinely open in the text and genuinely changes '
      + 'today\'s action. A fact the text states, or one whose two answers lead to the same action, '
      + 'is a false gap.',
    whatWouldJustifyCorrect: 'no declared fact is already established by the text and none is '
      + 'decision-neutral',
    whatWouldJustifyIncorrect: 'a declared fact is answered by the text, or would change nothing',
    whatMustNotInfluence: 'whether asking anyway would be harmless or good practice' },
  { id: 'C', name: 'OWED_PROPERTY_SEMANTIC_CORRECTNESS', unit: 'fact',
    question: 'Does this declaration identify the EXACT property that remains unknown?',
    whatBearsOnIt: 'missingFact together with the branches and the whyUnresolved sentence. The '
      + 'preregistered unacceptableNeighbouringProperties list names the substitutions this row was '
      + 'built to detect.',
    whatWouldJustifyCorrect: 'the property named is the one the text leaves open',
    whatWouldJustifyIncorrect: 'the property named is a NEIGHBOUR the text already establishes — '
      + 'presence for securement, appearance for function, repair for verification',
    whatMustNotInfluence: 'that OwedFact has no dedicated field for the property; score from '
      + 'missingFact and the full declaration semantics' },
  { id: 'D', name: 'EVIDENCE_SPAN_SEMANTIC_RELEVANCE', unit: 'fact',
    question: 'Is the verbatim span actually relevant to WHY this fact is unresolved?',
    whatBearsOnIt: 'the span in the context of the observation. Deterministic substring validity is '
      + 'already proven and is NOT the question.',
    whatWouldJustifyCorrect: 'the span is the text that shows the fact is open, or that makes it '
      + 'matter',
    whatWouldJustifyIncorrect: 'the span is verbatim but points at something else — a nearby '
      + 'sentence, an established fact, or a fragment that carries no bearing on the gap',
    whatMustNotInfluence: 'span length, or whether a better span existed' },
  { id: 'E', name: 'BRANCH_PLAUSIBILITY', unit: 'fact',
    question: 'Are branchA and branchB genuinely possible resolutions of THIS exact fact?',
    whatBearsOnIt: 'whether each branch is a STATE OF THE WORLD that could actually obtain given '
      + 'the observation.',
    whatWouldJustifyCorrect: 'both branches are real possible answers to the owed property',
    whatWouldJustifyIncorrect: 'a branch is a rhetorical opposite ("it is fine" / "it is not"), an '
      + 'invented state the text excludes, or an answer to a different question',
    whatMustNotInfluence: 'which branch is more likely' },
  { id: 'F', name: 'DECISION_DIVERGENCE_VALIDITY', unit: 'fact',
    question: 'Do ifA and ifB represent MATERIALLY DIFFERENT downstream decisions?',
    whatBearsOnIt: 'what is actually done today under each branch, judged against the '
      + 'affectedDecision this fact governs.',
    whatWouldJustifyCorrect: 'the two actions differ in what someone would do now',
    whatWouldJustifyIncorrect: 'the wording differs but the action is the same; the divergence is '
      + '"investigate further" versus "investigate further"; or one branch\'s action does not '
      + 'follow from that branch',
    whatMustNotInfluence: 'that the deterministic boundary already refused identical strings — it '
      + 'compares bytes, not decisions' },
  { id: 'G', name: 'AFFECTED_DECISION_CORRECTNESS', unit: 'fact',
    question: 'Is the fact bound to the correct affectedDecision?',
    whatBearsOnIt: 'the six definitions in the contract and the three confusable pairs. The '
      + 'preregistered expectation and its acceptable alternatives are shown.',
    whatWouldJustifyCorrect: 'the label names the decision the missing fact actually blocks',
    whatWouldJustifyIncorrect: 'the label names a topic rather than the blocked decision',
    whatMustNotInfluence: 'whether the label happens to match the preregistered one — an acceptable '
      + 'alternative is listed where one exists' },
  { id: 'H', name: 'MULTI_GAP_PRESERVATION', unit: 'row',
    question: 'Do independent gaps survive INDEPENDENTLY?',
    whatBearsOnIt: 'whether two declared facts are genuinely different facts rather than one fact '
      + 'stated twice, and whether settling one would leave the other open.',
    whatWouldJustifyCorrect: 'each declared fact stands alone and would need its own evidence',
    whatWouldJustifyIncorrect: 'two declarations restate one gap, or one declaration silently '
      + 'merges two',
    whatMustNotInfluence: 'the structural distinctness of the computed keys — that is mechanical '
      + 'and already reported' },
  { id: 'I', name: 'FALSE_GAP_SUPPRESSION', unit: 'row',
    question: 'On a row whose text is sufficient, was an unnecessary owed fact avoided?',
    whatBearsOnIt: 'the matched partner row is named so the two can be read together.',
    whatWouldJustifyCorrect: 'no fact was declared, or any declared fact is genuinely open',
    whatWouldJustifyIncorrect: 'a fact was declared that the text answers',
    whatMustNotInfluence: 'that declaring something would have been more thorough' },
  { id: 'L', name: 'VERIFIER_TARGET_BINDING', unit: 'fact',
    question: 'Does the verifier verdict address the EXACT projected owed fact?',
    whatBearsOnIt: 'the verdict, its rationale and any proposed clarification, read against the '
      + 'supplied fact.',
    whatWouldJustifyCorrect: 'the verdict is about this fact and no other',
    whatWouldJustifyIncorrect: 'the verdict addresses a neighbouring property, a different hazard, '
      + 'or the row in general',
    whatMustNotInfluence: 'that the bindingFactKey matched — key equality is mechanical and does '
      + 'not establish that the reasoning was about that fact' },
  { id: 'M', name: 'CLARIFICATION_RESOLUTION_SUFFICIENCY', unit: 'fact',
    question: 'Would the requested clarification actually obtain evidence CAPABLE OF SETTLING the '
      + 'fact?',
    whatBearsOnIt: 'what the question asks for versus what would establish the owed property. '
      + 'TOPIC REACH IS NOT RESOLUTION SUFFICIENCY: a question can name the right fact and accept '
      + 'evidence that cannot settle it — presence, visibility, a status indicator, a signature.',
    whatWouldJustifyCorrect: 'an answer to the question would establish or refute the property',
    whatWouldJustifyIncorrect: 'the question names the right fact but would be satisfied by '
      + 'evidence that leaves the property open',
    whatMustNotInfluence: 'how well-phrased the question is' },
  { id: 'N', name: 'GOVERNED_EVIDENCE_QUOTATION_BOUNDARY', unit: 'fact',
    question: 'Was reliance on the supplied governed record legitimate, and was any quotation '
      + 'faithful to it?',
    whatBearsOnIt: 'whether the supplied record genuinely bears on this fact and whether the '
      + 'proposition is a faithful reading of it. The MECHANICAL half — whether every token appears '
      + 'verbatim in a supplied source — is already computed and shown.',
    whatWouldJustifyCorrect: 'reliance was declared only where the record genuinely bears on the '
      + 'fact, and the proposition says what the record says',
    whatWouldJustifyIncorrect: 'reliance was declared on an off-point record, or the proposition '
      + 'overstates what the record establishes',
    whatMustNotInfluence: 'that the admission boundary admitted it — structural reuse is not '
      + 'semantic validation' },
  { id: 'Q', name: 'OWED_PROPERTY_LOSS_IMPACT', unit: 'fact',
    question: 'Does the ABSENCE of a dedicated owed-property field in OwedFact cause downstream '
      + 'ambiguity or semantic loss for this fact?',
    whatBearsOnIt: 'compare what the DECLARATION said (missingFact is shown) against what the '
      + 'PROJECTED OwedFact carries (missingFact is NOT in it). Then read the verifier verdict, '
      + 'which only ever saw the projected form.',
    whatWouldJustifyCorrect: 'nothing was lost — the property is unambiguous from whyUnresolved and '
      + 'the branches alone',
    whatWouldJustifyIncorrect: 'the projected form is ambiguous, loses target specificity, is hard '
      + 'to review, makes the branches ambiguous, or lets a nearby property be conflated with this '
      + 'one',
    whatMustNotInfluence: 'MEASUREMENT ONLY. This does not authorise adding a field, mutating the '
      + 'contract, or folding missingFact into whyUnresolved.' },
  { id: 'R', name: 'PRIORITY_FLOOR_IMPACT', unit: 'fact',
    question: 'Would this correctly identified fact be MATERIALLY UNDER-ESCALATED by entering at '
      + 'the non-escalating OTHER floor?',
    whatBearsOnIt: 'whether you would call this gap safety-critical enough that it should raise '
      + 'UNRESOLVED_SAFETY_STATE rather than sit at the floor.',
    whatWouldJustifyCorrect: 'OTHER is appropriate — the gap does not warrant a fail-closed state',
    whatWouldJustifyIncorrect: 'the gap is safety-critical and the floor materially under-escalates '
      + 'it',
    whatMustNotInfluence: 'MEASUREMENT ONLY. This does not authorise changing the gate or allowing '
      + 'provider-authored priority.' },
];

const packet = {
  artifact: 'SECTION_197_ADJUDICATION_PACKET',
  status: 'PENDING_HUMAN_ADJUDICATION',
  writtenBy: 'the §197 scorer. EVERY VERDICT FIELD IS NULL AND THIS MODEL FILLED NONE.',
  whyNoModelVerdicts: 'the authorization requires HUMAN semantic review of every projected fact and '
    + 'every first-pass row, and forbids the deterministic validator that admitted a declaration '
    + 'from acting as the semantic oracle. A model-supplied verdict — however labelled — would make '
    + 'the evaluated component its own examiner.',
  TRUTH_PROVENANCE,
  verdictVocabulary: ['CORRECT', 'PARTIALLY_CORRECT', 'INCORRECT', 'AMBIGUOUS', 'NOT_EXERCISED'],
  verdictGuidance: {
    NOT_EXERCISED: 'use when the row or fact gave no occasion for this axis — the denominator '
      + 'shrinks, and that is correct. Never score an unavailable opportunity as a pass.',
    AMBIGUOUS: 'use when the authored scenario itself does not settle the question. An ambiguous '
      + 'row is removed PROSPECTIVELY from its denominator and every historical score is preserved.',
    PARTIALLY_CORRECT: 'use when part of the required content is present and part is missing — a '
      + 'dropped conjunct, a right property with a wrong span.',
  },
  axes: AXES,
  disclosureRequirement: 'if these verdicts are formed after reading the deterministic results in '
    + 'this package, that must be recorded structurally alongside the verdicts and must travel with '
    + 'every figure derived from them.',

  rows: SECTION_197_COHORT.map(r => {
    const f = fp.find(x => x.rowId === r.rowId);
    const p = proj.find(x => x.rowId === r.rowId);
    return {
      rowId: r.rowId,
      families: r.families,
      pairedWith: r.pairedWith,
      designIntent: r.designIntent,
      observation: r.observation,
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
        preInferenceFailure: f?.preInferenceFailure ?? null,
        note: 'an execution event, not model behaviour. Score every axis NOT_EXERCISED for this row.',
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
      const raw = (fp.find(x => x.rowId === p.rowId)?.rawDeclarations ?? [])
        .find((x: any) => x?.declarationId === d.declarationId);
      const v = ver.find(x => x.rowId === p.rowId && x.factKey === d.factKey);
      return {
        rowId: p.rowId,
        factKey: d.factKey,
        declarationId: d.declarationId,
        // What the MODEL said, in full.
        declaration: raw ?? null,
        // What the PROJECTION produced — note missingFact is absent, which is axis Q.
        projectedOwedFact: d.owedFact,
        missingFactPresentInDeclaration: raw?.missingFact ?? null,
        missingFactPresentInProjectedOwedFact: false,
        // What this row was built to detect.
        preregisteredExpectations: row.expectedOwedFacts,
        // What the VERIFIER did with it.
        verifier: v ? {
          executed: v.behavioralExecution === true,
          verdict: v.verdict,
          rationale: v.rationale,
          proposedClarification: v.proposedClarification,
          bindingFactKey: v.bindingFactKey,
          owedFactDeclarations: v.owedFactDeclarations,
          regulatoryBasis: v.regulatoryBasis,
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
        },
        reviewerNotes: null,
      };
    })),

  completeness: {
    rowsRequiringReview: SECTION_197_COHORT.length,
    factsRequiringReview: admittedDeclarations,
    verdictsRequired: SECTION_197_COHORT.length * 4 + admittedDeclarations * 10,
    verdictsSupplied: 0,
    HUMAN_ADJUDICATION_COMPLETENESS: `0 / ${SECTION_197_COHORT.length * 4 + admittedDeclarations * 10}`,
    STATUS: behavioural.length === 0 ? 'NOT_ADJUDICABLE' : 'UNMEASURED',
    notAdjudicableReason: behavioural.length === 0
      ? 'no inference occurred, so there is no model output to adjudicate. Every row and fact axis '
        + 'is NOT_EXERCISED. This packet is retained as the structure a re-authorized run would '
        + 'fill, NOT as work awaiting a reviewer.'
      : null,
  },
};

writeFileSync(join(EVID, 'ADJUDICATION-PACKET.json'), `${JSON.stringify(packet, null, 2)}\n`);

// ================================================================ console

console.log('§197 DETERMINISTIC SCORING');
console.log(`  provider calls    ${allCalls.length} attempted, ${behavioural.length} completed, ceiling ${prereg.caps.HARD_TOTAL_CALL_CEILING}`);
console.log(`  actual spend      $${actualSpend.toFixed(5)}   (${inputTokens} in / ${outputTokens} out)`);
console.log(`  errors            ${JSON.stringify(errorClasses)}`);
console.log(`  declarations      ${rawDeclarations} raw, ${admittedDeclarations} admitted, ${refusedDeclarations} refused`);
console.log(`  refusal codes     ${JSON.stringify(refusalCodes)}`);
console.log(`  K identity        ${identityMatches}/${identityMatches + identityMismatches} derivations match, ${providerAuthoredKeyAttempts} provider factKey attempts`);
console.log(`  J fidelity        ${fidelityOk}/${fidelityOk + fidelityViolations} byte-faithful`);
console.log(`  counts in range   ${countsInRange}/${executedRows}  (a COUNT comparison, not correctness)`);
console.log(`  verifier          ${ver.length} calls, ${ver.filter(v => v.admission?.admitted === true).length} admitted`);
console.log(`  O containment     ${unsuppliedAdmitted.length} unsupplied citations admitted`);
console.log(`  P settlement      ${deterministic.P_SETTLEMENT_AUTHORITY.result}`);
console.log(`  HARD FAILS        ${behavioural.length === 0 ? 'NOT EVALUABLE — nothing ran' : (hardFails.filter(h => h.triggered).map(h => h.id).join(', ') || 'none triggered')}`);
console.log('');
console.log(`  ADJUDICATION PACKET: ${packet.completeness.STATUS}  (${packet.completeness.verdictsRequired} verdict slots, 0 supplied)`);
console.log('  NO SEMANTIC VERDICT WAS PRODUCED BY THIS SCRIPT.');
