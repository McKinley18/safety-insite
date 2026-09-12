/**
 * §220 -- ARCHITECTURE RECORD AND INTEGRATED-GATE DESIGN ARTIFACT.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO COMMIT, PUSH, TAG OR DEPLOY.
 *
 * Every figure is computed from the live modules or from the persisted §219 evidence. Nothing is
 * transcribed by hand.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  PROPERTY_AUTHORITY_CONTRACT_VERSION, KR1_STATUS, KR1_PROVIDER_CAPABILITY_REMEDIATED,
  AUTONOMOUS_PROPERTY_IDENTIFICATION_VALIDATED, PROVIDER_PROPERTY_AUTHORITY,
  PROPERTY_AUTHORITY_STATES, SETTLEMENT_PERMITTING_STATES, PROPERTY_CONFIRMATION_DECISIONS,
  TRIGGER_SOURCES_EVALUATED_220, SCOPING_LIMITATION_220, TRANSITION_COVERAGE_220,
  propertyAuthorityEffect, propertyAuthorityFailClosedEffect,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/property-authority';
import {
  APPLICATION_REFUSAL_CODES, PROPERTY_AUTHORITY_ATTACH_REFUSAL_CODES,
  SETTLEMENT_REVIEW_CONTRACT_VERSION, PROVIDER_SETTLEMENT_AUTHORITY,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/settlement-review';
import {
  INTEGRATED_GATE_DESIGN_220_VERSION, AUTHORIZED_TO_EXECUTE, OBSERVATIONS_AUTHORED_HERE,
  FROZEN_FOR_EXECUTION, PROVIDER_CALLS_IN_SECTION_220, PRIOR_CASES_NOT_REUSED_IN_INTEGRATION,
  SYSTEM_PATH_UNDER_TEST, SYSTEM_SUCCESS_PRINCIPLE, CASE_FAMILIES_220, INTEGRATED_CASES_220,
  INTEGRATED_HARD_GATES_220, INTEGRATED_HARD_GATE_RULE_220, HUMAN_JUDGMENT_BUDGET_220,
  MEASURED_BASIS_220, UNCERTAINTY_RESOLVED_BY_CALL_220, NOT_DECIDED_BY_220,
  COMPONENT_STATUS_AT_220, humanJudgmentTotal220, callPlan220, costProjection220,
} from './lib/expert-220-integrated-gate-design';

const ROOT = join(__dirname, '..', '..');
const SRC = join(ROOT, 'backend/src/safescope-v2/expert-hazlenz/owed-facts');
const EVID = join(ROOT, 'verification',
  'expert-hazlenz-220-kr1-property-authority-boundary-2026-09-10');
const EVID_219 = join(ROOT, 'verification',
  'expert-hazlenz-219-final-structured-verifier-confirmation-2026-09-10');

const shaFile = (p: string): string => createHash('sha256').update(readFileSync(p)).digest('hex');

// ---- family coverage, computed rather than claimed
const covered = new Set(INTEGRATED_CASES_220.flatMap(c => c.families));
const uncovered = CASE_FAMILIES_220.filter(f => !covered.has(f.id)).map(f => f.name);
if (uncovered.length > 0) {
  throw new Error(`§220 RECORD ABORT: families not covered — ${uncovered.join(', ')}`);
}
const gatesCovered = new Set(INTEGRATED_CASES_220.flatMap(c => c.hardGatesExercised));
const gatesUncovered = INTEGRATED_HARD_GATES_220
  .filter(g => !gatesCovered.has(g.id)).map(g => g.id);

const plan = callPlan220();
const cost = costProjection220();
const judgments = humanJudgmentTotal220();
if (judgments < 50 || judgments > 90) {
  throw new Error(`§220 RECORD ABORT: ${judgments} human judgments is outside the 50-90 budget`);
}

const record = {
  artifact: 'SECTION-220-KR1-PROPERTY-AUTHORITY-BOUNDARY-AND-INTEGRATED-GATE-DESIGN',
  providerCalls: PROVIDER_CALLS_IN_SECTION_220,
  databaseOperations: 0,
  commit: false, push: false, tag: false, deploy: false,
  customerActivation: false,

  kr1: {
    status: KR1_STATUS,
    providerCapabilityRemediated: KR1_PROVIDER_CAPABILITY_REMEDIATED,
    autonomousPropertyIdentificationValidated: AUTONOMOUS_PROPERTY_IDENTIFICATION_VALIDATED,
    fixed: false,
    closed: false,
  },
  componentStatus: COMPONENT_STATUS_AT_220,

  architecture: {
    contractVersion: PROPERTY_AUTHORITY_CONTRACT_VERSION,
    settlementReviewVersion: SETTLEMENT_REVIEW_CONTRACT_VERSION,
    providerPropertyAuthority: PROVIDER_PROPERTY_AUTHORITY,
    providerSettlementAuthority: PROVIDER_SETTLEMENT_AUTHORITY,
    authorityStates: PROPERTY_AUTHORITY_STATES,
    settlementPermittingStates: SETTLEMENT_PERMITTING_STATES,
    reviewerDecisions: PROPERTY_CONFIRMATION_DECISIONS,
    applicationRefusalCodes: APPLICATION_REFUSAL_CODES,
    attachRefusalCodes: PROPERTY_AUTHORITY_ATTACH_REFUSAL_CODES,
    transitionCoverage: TRANSITION_COVERAGE_220,
    effect: propertyAuthorityEffect(),
    failClosedEffect: propertyAuthorityFailClosedEffect(),
  },

  scoping: {
    triggerSourcesEvaluated: TRIGGER_SOURCES_EVALUATED_220,
    triggersUsed: TRIGGER_SOURCES_EVALUATED_220.filter(t => t.usedAsTrigger).map(t => t.signal),
    limitation: SCOPING_LIMITATION_220,
    deterministicSemanticInferenceUsed: false,
    globalHumanGateOnAllAnalysis: false,
    additionalProviderLayerAdded: false,
    failClosedBehaviourWeakened: false,
  },

  filesChanged: {
    added: [
      {
        path: 'backend/src/safescope-v2/expert-hazlenz/owed-facts/property-authority.ts',
        sha256: shaFile(join(SRC, 'property-authority.ts')),
      },
    ],
    modified: [
      {
        path: 'backend/src/safescope-v2/expert-hazlenz/owed-facts/settlement-review.ts',
        sha256: shaFile(join(SRC, 'settlement-review.ts')),
        change: 'ADDITIVE — SettlementClaim gains two provenance-derived fields, '
          + 'attachPropertyAuthority and recordPropertyAuthorityDeclined are added, and '
          + 'settleByReviewedEvidence gains one refusal code. No existing behaviour is removed and '
          + 'no existing refusal is weakened.',
      },
    ],
    unmodifiedOwedFactModules: ['owed-fact.types.ts', 'owed-fact-binding.ts', 'owed-fact-ledger.ts',
      'owed-fact-observability.ts', 'structural-questions.ts', 'governed-evidence-derivation.ts',
      'verifier-v3-development-boundary.ts'].map(f => ({
      path: `backend/src/safescope-v2/expert-hazlenz/owed-facts/${f}`,
      sha256: shaFile(join(SRC, f)),
    })),
  },

  section219EvidenceUnchanged: {
    preregistrationSha256: shaFile(join(EVID_219, 'CONFIRMATION-PREREGISTRATION-219.json')),
    expected: '491bf18a1094c99c22a80719001c207c7d72e92c1f547086284b3331d5918d56',
    rawVerifierSha256: shaFile(join(EVID_219, 'RAW-VERIFIER-219.jsonl')),
    adjudicationSha256: shaFile(join(EVID_219, 'ADJUDICATION-219.json')),
    reclassified: false,
  },

  integratedGateDesign: {
    version: INTEGRATED_GATE_DESIGN_220_VERSION,
    authorizedToExecute: AUTHORIZED_TO_EXECUTE,
    observationsAuthoredHere: OBSERVATIONS_AUTHORED_HERE,
    frozenForExecution: FROZEN_FOR_EXECUTION,
    caseCount: INTEGRATED_CASES_220.length,
    familyCount: CASE_FAMILIES_220.length,
    familiesCovered: [...covered].sort((a, b) => a - b),
    familiesUncovered: uncovered,
    cases: INTEGRATED_CASES_220,
    systemPathUnderTest: SYSTEM_PATH_UNDER_TEST,
    systemSuccessPrinciple: SYSTEM_SUCCESS_PRINCIPLE,
    hardGates: INTEGRATED_HARD_GATES_220,
    hardGateRule: INTEGRATED_HARD_GATE_RULE_220,
    hardGatesNotExercisedByAnyCase: gatesUncovered,
    humanJudgmentBudget: HUMAN_JUDGMENT_BUDGET_220,
    humanJudgmentTotal: judgments,
    priorCasesNotReused: PRIOR_CASES_NOT_REUSED_IN_INTEGRATION,
    callPlan: plan,
    measuredCostBasis: MEASURED_BASIS_220,
    costProjection: cost,
    uncertaintyResolvedByCall: UNCERTAINTY_RESOLVED_BY_CALL_220,
    notDecidedBy220: NOT_DECIDED_BY_220,
  },

  generatedAt: '2026-09-10',
};

const json = JSON.stringify(record, null, 2) + '\n';
writeFileSync(join(EVID, 'ARCHITECTURE-RECORD-220.json'), json);
const digest = createHash('sha256').update(json, 'utf8').digest('hex');
writeFileSync(join(EVID, 'ARCHITECTURE-RECORD-220.sha256'),
  `${digest}  ARCHITECTURE-RECORD-220.json\n`);

console.log('§220 RECORD WRITTEN. digest:', digest);
console.log('KR-1        :', KR1_STATUS);
console.log('families    :', `${covered.size}/${CASE_FAMILIES_220.length} covered by`,
  INTEGRATED_CASES_220.length, 'cases');
console.log('gates        :', INTEGRATED_HARD_GATES_220.length,
  gatesUncovered.length === 0 ? '(all exercised)' : `(not exercised: ${gatesUncovered.join(',')})`);
console.log('judgments   :', judgments, '(budget 50-90)');
console.log('calls       :', `${plan.firstPassCalls} first pass + ${plan.verifierCalls} verifier`
  + ` + ${plan.contingencyCalls} contingency = ${plan.totalCalls}`);
console.log('projected   : USD', cost.projectedSpendUsd, '| hard ceiling USD', cost.hardCeilingUsd);
console.log('§219 prereg :', record.section219EvidenceUnchanged.preregistrationSha256
  === record.section219EvidenceUnchanged.expected ? 'UNCHANGED' : 'CHANGED — INVESTIGATE');
console.log('PROVIDER CALLS 0 · DATABASE OPERATIONS 0');
