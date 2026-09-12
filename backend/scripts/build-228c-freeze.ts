/** §228C — freeze and hash the KR-1 coverage-completion instrument. ZERO provider calls. */
import { createHash } from 'crypto';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  INSTRUMENT_228C_VERSION, BASE_INSTRUMENT_228C, SCOPE_228C, C7_PRESERVATION_228C,
  KR1_QUESTIONS_228C, NO_ADDITIONAL_GATES_228C, KR1_CASE_228C, CALL_PLAN_228C,
  COST_EVIDENCE_228C, runTruthPreflight228C, instrumentDigest228C,
} from './lib/expert-228c-kr1-instrument';
import {
  assembleFirstPass228C, ASSEMBLY_228C_VERSION,
} from './lib/expert-228c-assembly';
import {
  PROPERTY_REVIEW_CONTRACT_218_VERSION, VERIFIER_218_RESPONSE_SCHEMA,
} from './lib/expert-218-property-review-contract';
import { EXPERT_VERIFIER_218_SYSTEM_PROMPT } from './lib/expert-218-property-instruction';

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');
const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-228c-kr1-coverage-completion-2026-09-11');
mkdirSync(OUT, { recursive: true });

const preflight = runTruthPreflight228C();
const fp = assembleFirstPass228C();

const frozen = {
  artifact: 'SECTION-228C-FROZEN-PROTOCOL',
  version: INSTRUMENT_228C_VERSION,
  base: BASE_INSTRUMENT_228C,
  frozenBeforeAnyProviderCall: true,
  frozenAt: new Date().toISOString(),
  scope: SCOPE_228C,
  relationshipToSection228B: {
    section228BPreservedExactly: true,
    section228BResultUnchanged: {
      providerCalls: 13, spendUsd: 0.9338,
      slots: { PASS: 59, FAIL: 0, AMBIGUOUS: 1, NOT_EXERCISED: 8 },
      hardRequirements: { PASS: 12, FAIL: 0, COVERAGE_INSUFFICIENT: 2 },
      overall: 'INCONCLUSIVE',
    },
    section228BMayNotBeRewrittenAsPass: true,
    completesOnly: ['HR4', 'HR7'],
    causeOfTheGap: 'C1 truncated at max_tokens before unresolvedFactDeclarations arrived, so the '
      + 'KR-1 authority path never reached OwedFact, property authority, the settlement attempt, the '
      + 'missing-authority refusal or the authoritative unresolved state. A coverage deficiency '
      + 'caused by a contained provider execution defect — evidence neither that KR-1 passed nor '
      + 'that it failed.',
  },
  c7Preservation: C7_PRESERVATION_228C,
  questions: KR1_QUESTIONS_228C,
  noAdditionalGates: NO_ADDITIONAL_GATES_228C,
  case: KR1_CASE_228C,
  caseCount: 1,
  requiredTrace: [
    'RAW OBSERVATION', 'FIRST-PASS DECLARATION', 'DETERMINISTIC PROJECTION', 'OWED FACT',
    'VERIFIER', 'DETERMINISTIC CONTAINMENT', 'PROPERTY AUTHORITY REQUIRED',
    'PROPERTY AUTHORITY NOT GRANTED', 'EVIDENCE ACTION AS PREREGISTERED', 'SETTLEMENT ATTEMPT',
    'SETTLEMENT REFUSED', 'FACT REMAINS UNRESOLVED', 'ZERO UNAUTHORIZED LEDGER TRANSITIONS',
  ],
  authorityRules: {
    providerMayMintPropertyAuthority: false,
    evidenceAuthorityMaySubstituteForPropertyAuthority: false,
  },
  preflight: {
    result: preflight.allPassed ? 'PASS' : 'FAIL',
    passed: preflight.passed, total: preflight.total, checks: preflight.checks,
  },
  callPlan: CALL_PLAN_228C,
  costEvidence: COST_EVIDENCE_228C,
  identity: {
    promptIdentityPinned: true,
    schemaIdentityPinned: true,
    assemblyVersion: ASSEMBLY_228C_VERSION,
    firstPassContractVersion: fp.contractVersion,
    verifierContractVersion: PROPERTY_REVIEW_CONTRACT_218_VERSION,
    analysisId: fp.analysisId,
    observationSourceId: fp.observationSourceId,
    systemPromptDigest: fp.identities.systemPrompt,
    userPromptDigest: fp.identities.userPrompt,
    wireSchemaDigest: fp.identities.wireSchema,
    verifierSystemPromptDigest: sha(EXPERT_VERIFIER_218_SYSTEM_PROMPT),
    verifierSchemaDigest: sha(JSON.stringify(VERIFIER_218_RESPONSE_SCHEMA)),
  },
  boundary: {
    databaseOperations: 0, semanticPreferenceRetries: 0, contingencyCalls: 0,
    retryOnTruncation: false, rerunOfSection228: false, rerunOfCasesC2toC8: false,
    remediation: false, promptChanges: false, verifierChanges: false, schemaChanges: false,
    authorityLogicChanges: false, architectureChanges: false,
    section228AEvidenceModified: false, section228BEvidenceModified: false,
    commit: false, push: false, tag: false, deploy: false,
  },
  instrumentDigest: instrumentDigest228C(),
};

writeFileSync(join(OUT, 'SECTION-228C-FROZEN-PROTOCOL.json'), JSON.stringify(frozen, null, 2) + '\n');
const packageDigest = sha(JSON.stringify(frozen));
writeFileSync(join(OUT, 'SECTION-228C-FROZEN-PROTOCOL.sha256'),
  `${packageDigest}  SECTION-228C-FROZEN-PROTOCOL\n`);

console.log(`preflight         ${frozen.preflight.result} ${preflight.passed}/${preflight.total}`);
console.log(`cases             1`);
console.log(`primary calls     ${CALL_PLAN_228C.maximumPrimaryCalls} maximum`);
console.log(`projected spend   USD ${CALL_PLAN_228C.projectedSpendUsd}`);
console.log(`worst case        USD ${CALL_PLAN_228C.worstCaseSpendUsd}`);
console.log(`hard ceiling      USD ${CALL_PLAN_228C.hardCeilingUsd}`);
console.log(`instrument digest ${frozen.instrumentDigest}`);
console.log(`package digest    ${packageDigest}`);
if (!preflight.allPassed) { console.log('\nPREFLIGHT FAILED — NOT FROZEN FOR EXECUTION'); process.exit(1); }
if (CALL_PLAN_228C.worstCaseSpendUsd > CALL_PLAN_228C.hardCeilingUsd) {
  console.log('\nWORST CASE EXCEEDS CEILING — STOP BEFORE SPEND'); process.exit(1);
}
console.log('\nFROZEN. Execution may proceed.');
