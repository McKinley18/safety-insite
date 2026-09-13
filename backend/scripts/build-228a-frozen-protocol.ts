/**
 * §228A — BUILD AND FREEZE the targeted integrated revalidation instrument.
 *
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. It reads the instrument, runs the truth preflight,
 * derives the coverage map and the call plan, pins prompt and schema identity, and writes the frozen
 * package with a digest. It does not execute anything and it cannot: nothing here opens a socket.
 *
 * Freeze happens ONLY if the preflight passes at 100%, every required path is covered by real
 * executable steps, and the call plan is exact. Otherwise the terminal is INCOMPLETE and the package
 * is still written, so the product owner can see exactly what is short.
 */

import { createHash } from 'crypto';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  INTEGRATED_INSTRUMENT_228A_VERSION, BASE_INSTRUMENT_228A, AUTHORIZATION_228A,
  AUTHORING_PROVENANCE_228A, HARD_REQUIREMENTS_228A, HARD_REQUIREMENT_RULE_228A,
  APPLICABILITY_RULE_228A, RESIDUAL_OBSERVATIONS_228A, RESIDUAL_CONTAINMENT_QUESTION_228A,
  RESIDUAL_CLASSIFICATION_228A, ASSERTED_CONDITION_STATE_POSTURE_228A,
  CONDITIONAL_CORRECT_RULE_228A, CONTINGENCY_POLICY_228A, COST_EVIDENCE_228A,
  INTEGRATED_CASES_228A, REQUIRED_PATHS_228A, PIPELINE_STAGES_228A,
  runTruthPreflight228A, coverageMap228A, callPlan228A, humanActionsPreregistered228A,
  instrumentDigest228A, TERMINALS_228A,
} from './lib/expert-228a-integrated-instrument';

import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import {
  buildExpertVNextUserPrompt, governedBindingFor,
  type VNextGovernedEvidenceRecord,
} from './lib/expert-first-pass-instruction-vnext';
import { buildExpert210jWireSchema } from './lib/expert-210j-first-pass-contract';
import {
  FIRST_PASS_CONTRACT_226_VERSION, build226SystemPrompt,
} from './lib/expert-226-property-selection-capability';
import {
  PROPERTY_REVIEW_CONTRACT_218_VERSION, VERIFIER_218_RESPONSE_SCHEMA,
} from './lib/expert-218-property-review-contract';
import { EXPERT_VERIFIER_218_SYSTEM_PROMPT } from './lib/expert-218-property-instruction';

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');
const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-228a-integrated-revalidation-instrument-2026-09-11');

// ---------------------------------------------------------------- identity pinning

/**
 * The exact bytes an execution slice would transmit, pinned now so a later executor can refuse to
 * send anything that does not match.
 *
 * Built through the SAME assembly path §227 used — the §226 system prompt, the vNext user prompt and
 * the §210J wire schema over a real `ExpertAnalysisInput`. A case supplying governed records gets
 * the governed-binding prompt and a schema whose sourceId enum is the supplied set; a case supplying
 * none gets the base prompt. That branch is the runtime's, not ours.
 */
export function analysisIdFor228A(caseId: string): string {
  return `ANL-228A-${caseId}`;
}
export function observationSourceIdFor228A(caseId: string): string {
  return `OBS-228A-${caseId}`;
}

function pinIdentities(): {
  firstPassContractVersion: string; verifierContractVersion: string;
  verifierSystemPromptDigest: string; verifierSchemaDigest: string;
  perCase: readonly { caseId: string; analysisId: string; observationSourceId: string;
    governedSourceIds: readonly string[];
    systemPromptDigest: string; userPromptDigest: string; wireSchemaDigest: string }[];
} {
  const perCase = INTEGRATED_CASES_228A.map(x => {
    const observationSourceId = observationSourceIdFor228A(x.caseId);
    const analysisId = analysisIdFor228A(x.caseId);
    const governedRecords: readonly VNextGovernedEvidenceRecord[] =
      x.governedEvidence.map(g => ({ sourceId: g.sourceId, text: g.approvedText }));

    const input: ExpertAnalysisInput = {
      contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
      analysisId,
      authoritativeSources: [{
        sourceId: observationSourceId,
        sourceType: 'observation',
        text: x.observation,
      }],
      inspectionContext: { location: x.suppliedContext.location, task: x.suppliedContext.task },
      jurisdiction: x.jurisdiction,
      allowedHazardFamilies: [...x.hazardFamilies],
      deterministicFindings: [],
      governedStandards: [],
      answeredClarifications: [],
    };

    const binding = governedBindingFor(governedRecords);
    return {
      caseId: x.caseId,
      analysisId,
      observationSourceId,
      governedSourceIds: governedRecords.map(r => r.sourceId),
      systemPromptDigest: sha(build226SystemPrompt(governedRecords.length)),
      userPromptDigest: sha(buildExpertVNextUserPrompt(input, governedRecords)),
      wireSchemaDigest: sha(JSON.stringify(buildExpert210jWireSchema(input, binding))),
    };
  });
  return {
    firstPassContractVersion: FIRST_PASS_CONTRACT_226_VERSION,
    verifierContractVersion: PROPERTY_REVIEW_CONTRACT_218_VERSION,
    verifierSystemPromptDigest: sha(EXPERT_VERIFIER_218_SYSTEM_PROMPT),
    verifierSchemaDigest: sha(JSON.stringify(VERIFIER_218_RESPONSE_SCHEMA)),
    perCase,
  };
}

// ---------------------------------------------------------------- build

function main(): void {
  mkdirSync(OUT, { recursive: true });

  const preflight = runTruthPreflight228A();
  const coverage = coverageMap228A();
  const plan = callPlan228A();
  const humans = humanActionsPreregistered228A();
  const identities = pinIdentities();

  const pathsCovered = Object.values(coverage.pathCoverage).filter(p => p.covered).length;
  const residualsInstrumented = Object.values(coverage.residualCoverage)
    .filter(r => r.cases.length > 0 && r.judgmentSlots > 0).length;
  const underAuthored = Object.entries(coverage.requirementCoverage)
    .filter(([, r]) => r.underAuthored).map(([id]) => id);

  const complete = preflight.allPassed
    && pathsCovered === REQUIRED_PATHS_228A.length
    && residualsInstrumented === RESIDUAL_OBSERVATIONS_228A.length
    && underAuthored.length === 0
    && plan.primaryCalls > 0
    && plan.projectedSpendUsd > 0
    && plan.recommendedHardCeilingUsd >= plan.worstCaseSpendUsd;

  // ---- 1. INSTRUMENT
  const instrument = {
    artifact: 'SECTION-228A-INSTRUMENT',
    version: INTEGRATED_INSTRUMENT_228A_VERSION,
    base: BASE_INSTRUMENT_228A,
    additiveSuccessor: {
      statement: 'every §221 case field survives here under the same meaning; the successor adds '
        + 'preregistered human actions, expected authority states, expected transition counts, '
        + 'residual observation slots and a judgment slot for every requirement a case claims',
      rewritesBase: false,
      baseRemainsImmutable: true,
    },
    authorization: AUTHORIZATION_228A,
    authoringProvenance: AUTHORING_PROVENANCE_228A,
    assertedConditionState: ASSERTED_CONDITION_STATE_POSTURE_228A,
    conditionalCorrectRule: CONDITIONAL_CORRECT_RULE_228A,
    pipelineStages: PIPELINE_STAGES_228A,
    cases: INTEGRATED_CASES_228A,
    caseCount: INTEGRATED_CASES_228A.length,
    judgmentSlotCount: INTEGRATED_CASES_228A.reduce((n, x) => n + x.judgments.length, 0),
  };

  // ---- 2. TRUTH PREFLIGHT
  const preflightDoc = {
    artifact: 'SECTION-228A-TRUTH-PREFLIGHT',
    version: INTEGRATED_INSTRUMENT_228A_VERSION,
    machineChecked: true,
    ranBeforeFreeze: true,
    providerCalls: 0,
    result: preflight.allPassed ? 'PASS' : 'FAIL',
    passed: preflight.passed,
    total: preflight.total,
    checks: preflight.checks,
    repairsMadeBeforeFreeze: [
      'the first preflight run failed P15 and P16. P15 found five requirement claims with no '
        + 'mandatory judgment slot feeding them — C3/HR1, C4/HR2, C7/HR1, C7/HR9, C8/HR1 — which is '
        + 'exactly the §221 authoring gap that produced six COVERAGE_INSUFFICIENT results. P16 found '
        + 'residual observation RO-D instrumented on seven cases and recorded by no judgment slot. '
        + 'Both were repaired in the development instrument before the freeze and before any spend, '
        + 'which is the only point at which repair is permitted.',
    ],
  };

  // ---- 3. COVERAGE MAP
  const coverageDoc = {
    artifact: 'SECTION-228A-COVERAGE-MAP',
    version: INTEGRATED_INSTRUMENT_228A_VERSION,
    dimensions: 'CASE x PIPELINE STAGE x HARD REQUIREMENT x HUMAN ACTION x EXPECTED FINAL STATE',
    rule: 'no required path is marked covered unless it names real case ids, real exercise ids and '
      + 'the concrete runtime steps that decide it. No prose-only coverage claim is admitted.',
    correctsSection221Deficiency: {
      whatWentWrong: '§221 listed a gate in a case exercised-set without authoring a judgment slot '
        + 'feeding it. Five of the six COVERAGE_INSUFFICIENT results came from that alone, and '
        + 'frozen denominators made it unrepairable afterwards.',
      howItIsCorrected: 'preflight check P15 fails the freeze if any requirement a case claims is '
        + 'not fed by a mandatory judgment slot on that same case, and separately if any requirement '
        + 'has zero cases.',
      underAuthoredRequirementsRemaining: underAuthored,
    },
    rows: coverage.rows,
    requirementCoverage: coverage.requirementCoverage,
    residualCoverage: coverage.residualCoverage,
    pathCoverage: coverage.pathCoverage,
    stageCoverage: coverage.stageCoverage,
    requiredPaths: REQUIRED_PATHS_228A,
    pathsCovered,
    pathsTotal: REQUIRED_PATHS_228A.length,
    residualsInstrumented,
    residualsTotal: RESIDUAL_OBSERVATIONS_228A.length,
  };

  // ---- 4. CALL PLAN
  const callPlanDoc = {
    artifact: 'SECTION-228A-CALL-PLAN',
    version: INTEGRATED_INSTRUMENT_228A_VERSION,
    derivedFromFinishedCases: true,
    perCase: plan.perCase.map(p => {
      const x = INTEGRATED_CASES_228A.find(y => y.caseId === p.caseId)!;
      return {
        caseId: p.caseId,
        firstPassCalls: p.firstPass,
        verifierCalls: p.verifier,
        otherProviderCalls: 0,
        totalCalls: p.total,
        maximumCalls: p.total,
        verifierLegElided: p.verifier === 0,
        elisionReason: x.verifierCallElidedBecause,
      };
    }),
    firstPassCalls: plan.firstPassCalls,
    verifierCalls: plan.verifierCalls,
    otherProviderCalls: 0,
    exactPrimaryCallCount: plan.primaryCalls,
    contingencyCalls: plan.contingencyCalls,
    maximumAuthorizedCalls: plan.maximumAuthorizedCalls,
    costEvidence: COST_EVIDENCE_228A,
    projectedSpendUsd: plan.projectedSpendUsd,
    worstCaseSpendUsd: plan.worstCaseSpendUsd,
    recommendedHardCeilingUsd: plan.recommendedHardCeilingUsd,
    ceilingRationale: 'the ceiling is the worst case — every primary call priced at the highest unit '
      + 'cost ever observed for its leg, plus both contingency calls priced at the dearer leg — '
      + 'rounded up to the cent. The headroom above worst case is smaller than the cost of one '
      + 'further first-pass call, so the ceiling gives execution variance without room for an extra '
      + 'semantic draw.',
    contingencyPolicy: CONTINGENCY_POLICY_228A,
    databaseOperations: 0,
  };

  // ---- 5. FROZEN PROTOCOL
  const frozen = {
    artifact: 'SECTION-228A-FROZEN-PROTOCOL',
    version: INTEGRATED_INSTRUMENT_228A_VERSION,
    frozenBeforeAnyProviderCall: true,
    frozenAt: new Date().toISOString(),
    executionAuthorized: false,
    terminal: complete ? TERMINALS_228A.complete : TERMINALS_228A.incomplete,

    preflight: { result: preflightDoc.result, passed: preflight.passed, total: preflight.total },
    coverage: { pathsCovered, pathsTotal: REQUIRED_PATHS_228A.length,
      residualsInstrumented, residualsTotal: RESIDUAL_OBSERVATIONS_228A.length,
      underAuthoredRequirements: underAuthored },

    hardRequirements: HARD_REQUIREMENTS_228A,
    hardRequirementRule: HARD_REQUIREMENT_RULE_228A,
    applicability: APPLICABILITY_RULE_228A,
    residualObservations: RESIDUAL_OBSERVATIONS_228A,
    residualContainmentQuestion: RESIDUAL_CONTAINMENT_QUESTION_228A,
    residualClassification: RESIDUAL_CLASSIFICATION_228A,

    humanActions: {
      preregistered: true,
      chosenAfterSeeingOutput: false,
      total: humans.total,
      propertyActions: humans.propertyActions,
      evidenceActions: humans.evidenceActions,
      conditionalRule: CONDITIONAL_CORRECT_RULE_228A,
    },

    identity: {
      promptIdentityPinned: true,
      schemaIdentityPinned: true,
      ...identities,
    },

    callPlan: {
      exactPrimaryCallCount: plan.primaryCalls,
      contingencyCalls: plan.contingencyCalls,
      maximumAuthorizedCalls: plan.maximumAuthorizedCalls,
      projectedSpendUsd: plan.projectedSpendUsd,
      recommendedHardCeilingUsd: plan.recommendedHardCeilingUsd,
    },

    boundary: {
      databaseOperations: 0,
      semanticPreferenceRetries: 0,
      alternateProvider: false,
      alternateModel: false,
      promptChanges: false,
      schemaChanges: false,
      architectureChanges: false,
      runtimeRemediation: false,
      truthChangesAfterFreeze: false,
      caseReplacements: false,
      historicalEvidenceChanges: false,
      providerOutputRepair: false,
      manualOwedFactCreation: false,
      humanActionChangesAfterSeeingOutput: false,
      historicalReplaySubstitution: false,
      commit: false, push: false, tag: false, deploy: false,
    },

    instrumentDigest: instrumentDigest228A(),
  };

  const files: readonly [string, unknown][] = [
    ['SECTION-228A-INSTRUMENT.json', instrument],
    ['SECTION-228A-TRUTH-PREFLIGHT.json', preflightDoc],
    ['SECTION-228A-COVERAGE-MAP.json', coverageDoc],
    ['SECTION-228A-CALL-PLAN.json', callPlanDoc],
    ['SECTION-228A-FROZEN-PROTOCOL.json', frozen],
  ];
  for (const [name, doc] of files) {
    writeFileSync(join(OUT, name), JSON.stringify(doc, null, 2) + '\n');
  }

  const packageDigest = sha(files.map(([name, doc]) => `${name}\n${JSON.stringify(doc)}`).join('\n'));
  writeFileSync(join(OUT, 'SECTION-228A-FROZEN-PROTOCOL.sha256'),
    `${packageDigest}  SECTION-228A-FROZEN-PACKAGE\n`);

  console.log(`preflight            ${preflightDoc.result} ${preflight.passed}/${preflight.total}`);
  console.log(`paths covered        ${pathsCovered}/${REQUIRED_PATHS_228A.length}`);
  console.log(`residuals            ${residualsInstrumented}/${RESIDUAL_OBSERVATIONS_228A.length}`);
  console.log(`under-authored reqs  ${underAuthored.length === 0 ? 'none' : underAuthored.join(', ')}`);
  console.log(`cases                ${INTEGRATED_CASES_228A.length}`);
  console.log(`judgment slots       ${instrument.judgmentSlotCount}`);
  console.log(`primary calls        ${plan.primaryCalls}`);
  console.log(`max authorized       ${plan.maximumAuthorizedCalls}`);
  console.log(`projected spend      USD ${plan.projectedSpendUsd.toFixed(4)}`);
  console.log(`hard ceiling         USD ${plan.recommendedHardCeilingUsd.toFixed(2)}`);
  console.log(`instrument digest    ${frozen.instrumentDigest}`);
  console.log(`package digest       ${packageDigest}`);
  console.log(`terminal             ${frozen.terminal}`);
}

main();
