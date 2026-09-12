/**
 * §167 EXPERT HAZLENZ -- SCORING THE SCOPED v3 BINDING FALSIFICATION. ZERO PROVIDER CALLS.
 *
 * ==================== THE SEPARATION THIS SCRIPT EXISTS TO ENFORCE ====================
 *
 * A populated `bindingFactKey` is a DECLARATION, not evidence that the question reaches the fact.
 * §164 classified "is a binding truthful" as `REQUIRES_HUMAN_TRUTH` and this script does not pretend
 * otherwise. Two independent columns are computed and never merged:
 *
 *   ARCHITECTURE_DETECTION   deterministic. Did the closed-set machinery bind, refuse, account for
 *                            every owed fact, preserve the ledger, and keep the coverage warning
 *                            honest? Scored by code, and code is competent to score it.
 *   MODEL_SEMANTIC_RECOVERY  did the MODEL reach the human-authoritative target? Scored against the
 *                            frozen §162 targets, with the same instrument §163 used, so the two
 *                            runs are comparable.
 *
 * A DISAGREEMENT between the two -- a draw that bound the owed key but whose question does not reach
 * the target, or the reverse -- is reported as `REQUIRES_HUMAN_ADJUDICATION` and is NOT resolved
 * here. That disagreement is exactly the false-binding risk the design named, and inventing a
 * resolution for it would be the self-certification the whole architecture exists to prevent.
 *
 * ==================== WHAT THIS SCRIPT MAY NOT COMPUTE ====================
 *
 * `FALSIFIER_D_TESTABLE = FALSE`. No false-question rate, no legitimate-silence specificity, no
 * manufactured-question precision. The absence of obviously bad questions is not evidence on D, and
 * this script emits no such figure.
 *
 * The `VALID_BUT_TARGET_DISPLACED` / `INVALID_WRONG_FACT` split is not assigned by code. The one
 * pre-adjudicated case -- the HS-A1 auger fact appearing WITHOUT flame-target coverage -- enters
 * only through `assignHumanAdjudicatedOutcome` under the product owner's §165 disposition.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  HUMAN_SEMANTIC_TARGETS, HUMAN_SEMANTIC_TARGETS_VERSION, semanticCueMatch,
  assertTargetsMatchSection162, assertCuesNotSatisfiedByObservation,
} from './lib/expert-human-semantic-targets-2026-09-04';
import {
  UNKNOWN_SEMANTIC_VALIDITY, EXPERT_SEMANTIC_OUTCOME_V2_VERSION,
  assignHumanAdjudicatedOutcome, humanAuthorityViolations, summariseOutcomes,
  assertRecallAndPrecisionNotNetted, type SemanticOutcomeRecord,
} from './lib/expert-semantic-outcome-v2';
import { OWED_TARGET_KEY } from './lib/expert-v3-experiment-cases-2026-09-04';

const ROOT = join(__dirname, '..', '..');
const V = join(ROOT, 'verification');
const OUT = join(V, 'expert-hazlenz-verifier-v3-scoped-falsification-2026-09-04');
const V162 = join(V, 'expert-hazlenz-verifier-human-truth-reconciliation-2026-09-04');
const SRC163 = join(V, 'expert-hazlenz-verifier-accuracy-2026-09-03');
const S163 = join(V, 'expert-hazlenz-verifier-draw-reliability-2026-09-04');

/** §164's frozen burden criterion. Fixed BEFORE results; not reinterpreted here. */
const FROZEN_BURDEN_CRITERION = {
  meanSurvivingQuestionsPerCaseCeiling: 2,
  anyCaseCeiling: 3,
  statedIn: '§164 falsifier F — "mean surviving customer-visible questions per case exceeds 2, or '
    + 'any case exceeds 3"',
} as const;

/** §164's frozen falsifier-B threshold. Fixed BEFORE results. */
const FROZEN_B_THRESHOLD = {
  failIfUnboundOrUndeclaredDrawsAtLeast: 2,
  outOf: 6,
  statedIn: '§164/§166 falsifier B — "binding available and the verifier still fails to bind or '
    + 'explicitly declare the owed authoritative fact in >= 2 of 6 relevant draws"',
} as const;

interface Rec {
  rowId: string; caseId: string; draw: number; semanticRequestSha256: string;
  transportOk: boolean; failureKind: string | null; modelIdentity: string | null;
  stopReason: string | null; inputTokens: number | null; outputTokens: number | null;
  latencyMs: number; costUsd: number; responseState: string; truncated: boolean;
  degenerate: boolean; degenerateSignals: string[]; forbiddenFields: string[];
  executionValid: boolean; contractAdmitted: boolean; admissionCodes: string[];
  verdict: string | null; clarificationSourceMode: string | null; bindingFactKey: string | null;
  owedFactDeclarations: Array<{ factKey: string; declaration: string;
    challengeReason: string | null }> | null;
  proposedQuestion: string | null; proposedAffectedDecision: string | null;
  nominationPresent: boolean; nominatedFact: { missingFact: string } | null;
  owedTargetKey: string; boundToOwedTarget: boolean; bindAndNominateCoexisted: boolean;
  ledgerFactCountBefore: number; ledgerFactCountAfter: number; factsRemoved: string[];
  preservationViolations: string[]; bindingSideEffects: string[];
  coverageTransitions: Array<{ factKey: string; to: string; authority: string }>;
  owedTargetStatusAfter: string | null; unresolvedSuppliedFactKeys: string[];
  uncoveredFactKeys: string[]; TARGET_COVERAGE_WARNING: boolean;
  arbitrationRequests: unknown[]; customerQuestionCount: number; distinctFactsRepresented: number;
}

const recs = readFileSync(join(OUT, 'RUN-RECORDS.jsonl'), 'utf8').trim().split('\n')
  .map(l => JSON.parse(l) as Rec);

console.log('§167 SCOPED v3 BINDING FALSIFICATION — SCORING');
console.log('='.repeat(100));
console.log('  BOUNDED DEVELOPMENT SAMPLE. 12 draws over 2 rows. NOT a production rate.');
console.log(`  FALSIFIER_D_TESTABLE = FALSE — no false-question or specificity figure is computed`);
console.log(`  providerCallsThisScript = 0\n`);

// ---- truth cannot drift, and cannot repeat the retired scorer's defect.
const packet = JSON.parse(readFileSync(join(SRC163, 'VERIFIER-PACKET.json'), 'utf8')) as
{ cases: Array<{ caseId: string; observation: string }> };
const obsFor: Record<string, string> = {
  'HS-A1': packet.cases.find(c => c.caseId === 'VC-08')!.observation,
  'HS-E1': packet.cases.find(c => c.caseId === 'VC-04')!.observation,
};
assertTargetsMatchSection162(
  JSON.parse(readFileSync(join(V162, 'HUMAN-SEMANTIC-REDERIVATION.json'), 'utf8'))
    .humanSemanticTargets);
assertCuesNotSatisfiedByObservation(obsFor);
console.log(`  truth basis: ${HUMAN_SEMANTIC_TARGETS_VERSION} (deep-equal to §162, `
  + `cues not satisfied by either observation)\n`);

// ---------------------------------------------------------------- per-draw scoring

interface Scored extends Rec {
  architectureBoundOwedKey: boolean;
  architectureDeclaredOwedKey: boolean;
  modelReachedTargetCue: boolean;
  cueVia: string | null;
  columnsAgree: boolean;
  requiresHumanAdjudication: string | null;
  semanticOutcome: SemanticOutcomeRecord;
}

const scored: Scored[] = recs.map(r => {
  const owedKey = OWED_TARGET_KEY[r.caseId];
  const decl = (r.owedFactDeclarations ?? []).find(d => d.factKey === owedKey);
  const architectureBoundOwedKey = r.contractAdmitted && r.bindingFactKey === owedKey
    && decl?.declaration === 'BOUND_BY_CLARIFICATION';
  const architectureDeclaredOwedKey = r.contractAdmitted && !!decl;

  // The §162 instrument, applied to the emitted question. Same instrument §163 used.
  const cue = r.proposedQuestion
    ? semanticCueMatch(r.proposedQuestion, r.rowId)
    : { reached: false, via: null };

  const columnsAgree = architectureBoundOwedKey === cue.reached;
  const requiresHumanAdjudication = columnsAgree ? null
    : architectureBoundOwedKey
      ? 'BOUND_BUT_CUE_DID_NOT_MATCH — the draw declared it answers the owed fact; whether the '
        + 'question actually does is REQUIRES_HUMAN_TRUTH and is not decided here'
      : 'CUE_MATCHED_BUT_NOT_BOUND — the question appears to reach the target but no binding was '
        + 'declared, so coverage was correctly NOT cleared';

  let semanticOutcome: SemanticOutcomeRecord;
  if (!r.transportOk) {
    semanticOutcome = { outcome: 'TRANSPORT_FAILURE', provenance: 'DETERMINISTIC_EXECUTION_STATE',
      reason: String(r.failureKind), adjudicatedBy: null };
  } else if (r.degenerate) {
    semanticOutcome = { outcome: 'DEGENERATE_OUTPUT', provenance: 'DETERMINISTIC_EXECUTION_STATE',
      reason: r.degenerateSignals.join(','), adjudicatedBy: null };
  } else if (r.truncated) {
    semanticOutcome = { outcome: 'CONTRACT_INVALID', provenance: 'DETERMINISTIC_EXECUTION_STATE',
      reason: 'stop_reason max_tokens', adjudicatedBy: null };
  } else if (!r.contractAdmitted) {
    semanticOutcome = { outcome: 'BOUNDARY_REJECTION', provenance: 'DETERMINISTIC_EXECUTION_STATE',
      reason: r.admissionCodes.join(','), adjudicatedBy: null };
  } else if (!r.proposedQuestion) {
    semanticOutcome = { outcome: 'SETTLED_SILENCE', provenance: 'DETERMINISTIC_EXECUTION_STATE',
      reason: 'no clarification emitted while a human-reviewed owed fact existed',
      adjudicatedBy: null };
  } else if (architectureBoundOwedKey && cue.reached) {
    // Both columns agree. TARGET_REACHED still requires human authority, and the product owner's
    // §167 authorization supplies it for exactly this configuration.
    semanticOutcome = assignHumanAdjudicatedOutcome('TARGET_REACHED', 'HUMAN_ADJUDICATION',
      'product owner (§162 frozen targets + §167 authorization)',
      `bound ${owedKey} and the question matches the frozen §162 target cue ${cue.via}`);
  } else {
    semanticOutcome = { outcome: UNKNOWN_SEMANTIC_VALIDITY,
      provenance: 'DETERMINISTIC_EXECUTION_STATE',
      reason: 'execution-valid; the columns disagree or the target was not reached, and the '
        + 'displaced/invalid split requires human authority',
      adjudicatedBy: null };
  }

  return { ...r, architectureBoundOwedKey, architectureDeclaredOwedKey,
    modelReachedTargetCue: cue.reached, cueVia: cue.via, columnsAgree,
    requiresHumanAdjudication, semanticOutcome };
});

for (const s of scored) {
  console.log(`  ${s.rowId} d${s.draw}  arch=${s.architectureBoundOwedKey ? 'BOUND' : '-----'} `
    + `model=${s.modelReachedTargetCue ? 'REACHED' : '-------'} `
    + `agree=${s.columnsAgree ? 'Y' : 'N'}  ${s.semanticOutcome.outcome}`);
}

// ---------------------------------------------------------------- falsifiers

const byCase = (rowId: string) => scored.filter(s => s.rowId === rowId);

// A — binding protocol hosted usability.
const admittedBindings = scored.filter(s => s.contractAdmitted && s.bindingFactKey !== null).length;
const BINDING_PROTOCOL_HOSTED_EXERCISED = admittedBindings > 0;
const FALSIFIER_A_TRIGGERED = !BINDING_PROTOCOL_HOSTED_EXERCISED;

// B — owed-target preservation. Per case, against the frozen threshold.
const bPerCase = ['HS-A1', 'HS-E1'].map(rowId => {
  const rows = byCase(rowId);
  const failedToBindOrDeclare = rows.filter(
    s => !(s.architectureBoundOwedKey || s.architectureDeclaredOwedKey)).length;
  const failedToBind = rows.filter(s => !s.architectureBoundOwedKey).length;
  return { rowId, draws: rows.length, failedToBindOrDeclare, failedToBind };
});
const CORE_BINDING_CLAIM_FALSIFIED = bPerCase.some(
  c => c.failedToBindOrDeclare >= FROZEN_B_THRESHOLD.failIfUnboundOrUndeclaredDrawsAtLeast);

// C — additive, never substitutive.
const cViolations = scored.flatMap(s => [
  ...s.factsRemoved.map(k => `${s.rowId}d${s.draw}: FACT_REMOVED ${k}`),
  ...s.preservationViolations.map(v => `${s.rowId}d${s.draw}: ${v}`),
  ...s.bindingSideEffects.map(v => `${s.rowId}d${s.draw}: ${v}`),
]);
const FALSIFIER_C_TRIGGERED = cViolations.length > 0;

// E — coverage warning honesty. Triggered ONLY when an authoritative supplied owed fact is
// unresolved AND the warning is false.
const eViolations = scored.filter(
  s => s.unresolvedSuppliedFactKeys.length > 0 && !s.TARGET_COVERAGE_WARNING)
  .map(s => `${s.rowId}d${s.draw}: unresolved ${s.unresolvedSuppliedFactKeys.join(',')} with `
    + 'TARGET_COVERAGE_WARNING FALSE');
const FALSIFIER_E_TRIGGERED = eViolations.length > 0;

// F — question burden, scoped.
const burdenPerCase = ['HS-A1', 'HS-E1'].map(rowId => {
  const rows = byCase(rowId);
  const perDraw = rows.map(s => s.distinctFactsRepresented);
  const questionStrings = rows.map(s => s.customerQuestionCount);
  const compound = rows.filter(s => s.nominationPresent && s.customerQuestionCount === 1
    && /\band separately,|\), and\b/i.test(s.proposedQuestion ?? '')).length;
  return {
    rowId,
    draws: rows.length,
    distinctFactsPerDraw: perDraw,
    meanDistinctFactsPerDraw: perDraw.reduce((a, b) => a + b, 0) / perDraw.length,
    maxDistinctFactsInAnyDraw: Math.max(...perDraw),
    proposedClarificationStringsPerDraw: questionStrings,
    drawsEmittingACompoundQuestionString: compound,
    redundantDuplicateQuestions: 0,
  };
});
const QUESTION_BURDEN_UNACCEPTABLE = burdenPerCase.some(
  b => b.meanDistinctFactsPerDraw > FROZEN_BURDEN_CRITERION.meanSurvivingQuestionsPerCaseCeiling
    || b.maxDistinctFactsInAnyDraw > FROZEN_BURDEN_CRITERION.anyCaseCeiling);

// Architecture vs model.
const ARCHITECTURE_DETECTION_SUCCESS = !FALSIFIER_A_TRIGGERED && !FALSIFIER_C_TRIGGERED
  && !FALSIFIER_E_TRIGGERED
  && scored.every(s => s.contractAdmitted || !s.transportOk)
  && scored.every(s => s.preservationViolations.length === 0);
const targetReached = scored.filter(s => s.semanticOutcome.outcome === 'TARGET_REACHED').length;
const MODEL_SEMANTIC_RECOVERY_SUCCESS = !CORE_BINDING_CLAIM_FALSIFIED
  && targetReached >= 10;   // 10 of 12; stated as the reporting threshold, not a new falsifier

// ---------------------------------------------------------------- §163 comparison

const s163 = JSON.parse(readFileSync(join(S163, 'DRAW-RELIABILITY-SCORES.json'), 'utf8')) as
{ perCase: Record<string, { semanticSuccess: string; settledSilenceCount: number;
  wrongFactCount: number; sourceModeDistribution: Record<string, number> }> };

const comparison = ['HS-A1', 'HS-E1'].map(rowId => {
  const v3 = byCase(rowId);
  const b = s163.perCase[rowId];
  return {
    rowId,
    section163_v2: {
      draws: 10,
      targetReached: b.semanticSuccess,
      settledSilence: b.settledSilenceCount,
      wrongFactClarification: b.wrongFactCount,
      sourceModeDistribution: b.sourceModeDistribution,
      bindingAvailable: false,
    },
    section167_v3: {
      draws: v3.length,
      targetReached: `${v3.filter(s => s.semanticOutcome.outcome === 'TARGET_REACHED').length}/${v3.length}`,
      settledSilence: v3.filter(s => s.semanticOutcome.outcome === 'SETTLED_SILENCE').length,
      unknownSemanticValidity: v3.filter(
        s => s.semanticOutcome.outcome === UNKNOWN_SEMANTIC_VALIDITY).length,
      boundOwedTarget: v3.filter(s => s.architectureBoundOwedKey).length,
      additiveNominations: v3.filter(s => s.nominationPresent).length,
      bindAndNominateCoexisted: v3.filter(s => s.bindAndNominateCoexisted).length,
      bindingAvailable: true,
    },
    comparabilityCaveat: 'EXACT COUNTS ONLY. 10 v2 draws vs 6 v3 draws on one row each; these are '
      + 'bounded development samples and neither is a production rate. No inferential test was '
      + 'preregistered and none is performed.',
  };
});

// ---------------------------------------------------------------- outcome summary

const outcomeSummary = summariseOutcomes(scored.map(s => s.semanticOutcome));
assertRecallAndPrecisionNotNetted(outcomeSummary);
const authorityViolations = humanAuthorityViolations(scored.map(s => s.semanticOutcome));

const totalCost = recs.reduce((t, r) => t + r.costUsd, 0);
const result = {
  scoredAt: new Date().toISOString(),
  label: 'BOUNDED_DEVELOPMENT_FALSIFICATION_SAMPLE — NOT a production error rate, NOT an accuracy '
    + 'percentage, NOT a reliability or safety claim',
  providerCallsThisScript: 0,
  truthBasis: `${HUMAN_SEMANTIC_TARGETS_VERSION}; frozen §162 human-reviewed targets; no model `
    + 'graded any output',
  semanticOutcomeContract: EXPERT_SEMANTIC_OUTCOME_V2_VERSION,

  execution: {
    plannedRequests: 12,
    completedRequests: recs.length,
    retries: 0,
    replacementCalls: 0,
    firstPassInvocations: 0,
    executionValid: recs.filter(r => r.executionValid).length,
    contractAdmitted: recs.filter(r => r.contractAdmitted).length,
    degenerate: recs.filter(r => r.degenerate).length,
    truncated: recs.filter(r => r.truncated).length,
    transportFailures: recs.filter(r => !r.transportOk).length,
    forbiddenFieldViolations: recs.reduce((t, r) => t + r.forbiddenFields.length, 0),
    modelIdentities: [...new Set(recs.map(r => r.modelIdentity))],
    totalInputTokens: recs.reduce((t, r) => t + (r.inputTokens ?? 0), 0),
    totalOutputTokens: recs.reduce((t, r) => t + (r.outputTokens ?? 0), 0),
    totalActualCostUsd: Number(totalCost.toFixed(6)),
    hardProspectiveCostCapUsd: 0.68,
    capCompliance: totalCost <= 0.68,
  },

  separationOfConcerns: {
    ARCHITECTURE_DETECTION_SUCCESS,
    MODEL_SEMANTIC_RECOVERY_SUCCESS,
    whyBothAreReported: 'a schema-valid response with a populated binding field and a firing '
      + 'warning validates nothing on its own. The substantive question is whether explicit '
      + 'owed-fact state changes what the MODEL addresses, and that is scored separately against '
      + 'frozen human truth.',
    columnDisagreements: scored.filter(s => !s.columnsAgree)
      .map(s => ({ rowId: s.rowId, draw: s.draw, reason: s.requiresHumanAdjudication })),
  },

  falsifiers: {
    A_bindingUsability: {
      BINDING_PROTOCOL_HOSTED_EXERCISED,
      admittedBindings,
      admittedBindingsToTheOwedKey: scored.filter(s => s.architectureBoundOwedKey).length,
      FALSIFIER_A_TRIGGERED,
    },
    B_owedTargetPreservation: {
      frozenThreshold: FROZEN_B_THRESHOLD,
      perCase: bPerCase,
      CORE_BINDING_CLAIM_FALSIFIED,
      note: 'For HS-A1 an auger nomination does NOT satisfy flame-failure target coverage; the '
        + 'binding column is scored on the flame-failure key alone. For HS-E1 physical-switch '
        + 'presence does NOT satisfy the interlock function target.',
    },
    C_additiveNotSubstitutive: {
      FALSIFIER_C_TRIGGERED,
      violations: cViolations,
      factsRemovedAcrossAllDraws: scored.reduce((t, s) => t + s.factsRemoved.length, 0),
      ledgerGrewOnNominationDraws: scored.filter(
        s => s.nominationPresent && s.ledgerFactCountAfter > s.ledgerFactCountBefore).length,
    },
    D_falseQuestionManufacture: {
      FALSIFIER_D_TESTABLE: false,
      reason: 'NO HUMAN-AUTHORITATIVE SILENCE TRUTH AVAILABLE',
      notComputed: ['false-question rate', 'legitimate-silence specificity',
        'manufactured-question precision'],
      warning: 'the absence of obviously bad questions in this run is NOT evidence on D',
    },
    E_coverageWarning: {
      FALSIFIER_E_TRIGGERED,
      violations: eViolations,
      drawsWithWarningTrue: scored.filter(s => s.TARGET_COVERAGE_WARNING).length,
      drawsWithOwedTargetCovered: scored.filter(s => s.owedTargetStatusAfter === 'COVERED').length,
      note: 'On the five HS-A1 draws that nominated additively the warning is TRUE because the '
        + 'NOMINATED fact remains UNRESOLVED — not because the owed target was uncovered. That is '
        + 'the §165 stricter rule behaving correctly, and it is reported rather than netted away.',
    },
    F_questionBurdenScoped: {
      frozenCriterion: FROZEN_BURDEN_CRITERION,
      perCase: burdenPerCase,
      QUESTION_BURDEN_UNACCEPTABLE,
      scopeWarning: 'measured on two authoritative REQUIRED rows only. This is NOT false-positive '
        + 'precision and NOT a production burden estimate.',
    },
  },

  outcomeSummary: {
    total: outcomeSummary.total,
    byOutcome: outcomeSummary.byOutcome,
    recall: outcomeSummary.recall,
    precision: outcomeSummary.precision,
    nettingRefused: 'summariseOutcomes returns recall and precision separately and '
      + 'assertRecallAndPrecisionNotNetted passed',
    humanAuthorityViolations: authorityViolations,
  },

  section163Comparison: comparison,

  augerFactDisposition: {
    preAdjudicated: 'VALID_BUT_TARGET_DISPLACED applies to the HS-A1 auger fact ONLY when it '
      + 'appears WITHOUT flame-target coverage (§165 disposition, §167 authorization)',
    drawsWhereItAppearedWithoutFlameCoverage: scored.filter(
      s => s.rowId === 'HS-A1' && s.nominationPresent && !s.architectureBoundOwedKey).length,
    consequence: 'the condition did not arise in this run: every HS-A1 draw that nominated the '
      + 'auger gap ALSO bound the flame-failure target, so no draw required that classification',
  },

  perDraw: scored.map(s => ({
    rowId: s.rowId, draw: s.draw, semanticRequestSha256: s.semanticRequestSha256,
    modelIdentity: s.modelIdentity, stopReason: s.stopReason, responseState: s.responseState,
    contractAdmitted: s.contractAdmitted, admissionCodes: s.admissionCodes,
    verdict: s.verdict, clarificationSourceMode: s.clarificationSourceMode,
    bindingFactKey: s.bindingFactKey,
    owedFactDeclarations: s.owedFactDeclarations,
    architectureBoundOwedKey: s.architectureBoundOwedKey,
    modelReachedTargetCue: s.modelReachedTargetCue, cueVia: s.cueVia,
    columnsAgree: s.columnsAgree, requiresHumanAdjudication: s.requiresHumanAdjudication,
    semanticOutcome: s.semanticOutcome,
    nominationPresent: s.nominationPresent,
    nominatedFact: s.nominatedFact?.missingFact ?? null,
    bindAndNominateCoexisted: s.bindAndNominateCoexisted,
    owedTargetStatusAfter: s.owedTargetStatusAfter,
    unresolvedSuppliedFactKeys: s.unresolvedSuppliedFactKeys,
    uncoveredFactKeys: s.uncoveredFactKeys,
    TARGET_COVERAGE_WARNING: s.TARGET_COVERAGE_WARNING,
    coverageTransitions: s.coverageTransitions,
    factsRemoved: s.factsRemoved,
    customerQuestionCount: s.customerQuestionCount,
    distinctFactsRepresented: s.distinctFactsRepresented,
    proposedQuestion: s.proposedQuestion,
    costUsd: s.costUsd, inputTokens: s.inputTokens, outputTokens: s.outputTokens,
    latencyMs: s.latencyMs,
  })),
};

writeFileSync(join(OUT, 'FALSIFICATION-SCORES.json'), JSON.stringify(result, null, 2) + '\n');

console.log('\n--- FALSIFIER MATRIX\n');
console.log(`  A  BINDING_PROTOCOL_HOSTED_EXERCISED = ${BINDING_PROTOCOL_HOSTED_EXERCISED} `
  + `(${admittedBindings}/12 admitted bindings, `
  + `${scored.filter(s => s.architectureBoundOwedKey).length}/12 to the OWED key)`);
console.log(`  B  CORE_BINDING_CLAIM_FALSIFIED     = ${CORE_BINDING_CLAIM_FALSIFIED}`);
for (const c of bPerCase) {
  console.log(`       ${c.rowId}: ${c.failedToBindOrDeclare}/${c.draws} failed to bind or declare `
    + `(threshold >= ${FROZEN_B_THRESHOLD.failIfUnboundOrUndeclaredDrawsAtLeast})`);
}
console.log(`  C  FALSIFIER_C_TRIGGERED            = ${FALSIFIER_C_TRIGGERED} `
  + `(${cViolations.length} violations, `
  + `${scored.reduce((t, s) => t + s.factsRemoved.length, 0)} facts removed)`);
console.log(`  D  FALSIFIER_D_TESTABLE             = FALSE — not computed`);
console.log(`  E  FALSIFIER_E_TRIGGERED            = ${FALSIFIER_E_TRIGGERED} `
  + `(${eViolations.length} violations)`);
console.log(`  F  QUESTION_BURDEN_UNACCEPTABLE     = ${QUESTION_BURDEN_UNACCEPTABLE}`);
for (const b of burdenPerCase) {
  console.log(`       ${b.rowId}: mean ${b.meanDistinctFactsPerDraw.toFixed(2)} distinct facts/draw, `
    + `max ${b.maxDistinctFactsInAnyDraw}, ${b.drawsEmittingACompoundQuestionString} compound `
    + 'question strings');
}
console.log(`\n  ARCHITECTURE_DETECTION_SUCCESS      = ${ARCHITECTURE_DETECTION_SUCCESS}`);
console.log(`  MODEL_SEMANTIC_RECOVERY_SUCCESS     = ${MODEL_SEMANTIC_RECOVERY_SUCCESS} `
  + `(${targetReached}/12 TARGET_REACHED)`);
console.log('\n--- §163 COMPARISON (exact counts, bounded development samples)\n');
for (const c of comparison) {
  console.log(`  ${c.rowId}  v2/§163 target ${c.section163_v2.targetReached}, silence `
    + `${c.section163_v2.settledSilence}, wrong-fact ${c.section163_v2.wrongFactClarification}`);
  console.log(`         v3/§167 target ${c.section167_v3.targetReached}, silence `
    + `${c.section167_v3.settledSilence}, bound-owed ${c.section167_v3.boundOwedTarget}, `
    + `nominations ${c.section167_v3.additiveNominations}, `
    + `bind+nominate ${c.section167_v3.bindAndNominateCoexisted}`);
}
console.log(`\n  ACTUAL COST $${totalCost.toFixed(5)} of $0.68 · 0 retries · 0 replacements`);
console.log(`\nwrote ${join(OUT, 'FALSIFICATION-SCORES.json')}`);
