/**
 * §218 -- EMIT THE ARCHITECTURE RECORD FROM THE LIVE MODULES.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. Writes ONLY into the §218 verification directory.
 *
 * Every number in the record is COMPUTED here by calling the same functions the proof suite calls,
 * so the record cannot drift from the code it describes. Nothing is transcribed by hand.
 */

import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

import { VERIFIER_VERDICTS } from './lib/expert-verifier-contract';
import { OWED_FACT_DECLARATIONS_V3 } from './lib/expert-verifier-instruction-v3';
import {
  CHALLENGE_GROUNDS_212, PROPERTY_MISMATCH_KINDS, REPRESENTATION_CONCERNS_212,
} from './lib/expert-212-challenge-vocabulary';
import { VERIFIER_212_RESPONSE_SCHEMA } from './lib/expert-212-verifier-protocol';
import { EXPERT_VERIFIER_216_SYSTEM_PROMPT } from './lib/expert-216-disposition-remediation';
import {
  PROPERTY_REVIEW_CONTRACT_218_VERSION, BASE_ARTIFACT_218, PROTOCOL_VERSION_CLAIMED_218,
  WHY_NO_VERSION_IS_CLAIMED_218, PROPERTY_SEMANTIC_ROLES_218, PROPERTY_VALIDITIES_218,
  PROPERTY_REVIEW_FIELDS_218, VERIFIER_218_RESPONSE_SCHEMA, reconstruct212Schema,
  schemaAccounting218, DECISION_CONTROLLING_PROPERTY_IS_ADVISORY,
} from './lib/expert-218-property-review-contract';
import {
  EXPERT_VERIFIER_218_SYSTEM_PROMPT, reconstruct216SystemPrompt, instructionAccounting218,
  TEXT_IS_NOT_THE_REMEDY, OVERCORRECTION_GUARDS_218,
} from './lib/expert-218-property-instruction';
import {
  ORDERED_DECISION_STEPS_218, PROPERTY_REVIEW_CODES_218, CONSISTENCY_DECISION_INPUTS_218,
  CONSISTENCY_RULE_CLASSIFICATION_218, consistencyEffect218, failClosedEffect218,
  REFUSED_RULES_218, SUPERSEDED_REFUSALS_216,
} from './lib/expert-218-property-consistency';
import {
  FIXTURES_218, runCompliantFixtures218, runRefusalFixtures218, refusalsFireTheirNamedCode218,
  vocabularyOnlyScore, clarificationFirstScore, challengeEverythingScore,
} from './lib/expert-218-fixtures';
import {
  SECTION_217_EVIDENCE, HISTORICAL_EVIDENCE_DISPOSITION, FIELD_PROVENANCE_218,
  REFUSED_ADAPTATIONS_218, legacyEffect218,
} from './lib/expert-218-legacy-compatibility';
import {
  hostedReadinessGate218, readinessIsClean218, fixturesAreClean218, RECOMMENDED_CASES_218,
  recommendedCallCount218, costProjection218, FUTURE_HARD_GATES_218, NO_AGGREGATE_COMPENSATION_218,
  STOPPING_RULE_218, RECOMMENDATION_LIMITS_218, STATUS_218, AUTHORIZED_TO_EXECUTE_218,
  ALREADY_SETTLED_218, localFixtureBacking218,
} from './lib/expert-218-hosted-readiness';

const OUT_DIR = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-218-structured-property-verifier-2026-09-09');

const sha = (s: string | Buffer): string => createHash('sha256').update(s).digest('hex');

const compliant = runCompliantFixtures218();
const refusals = runRefusalFixtures218();

const record = {
  artifact: 'SECTION-218-STRUCTURED-PROPERTY-SEMANTIC-VERIFIER-ARCHITECTURE-RECORD',
  version: PROPERTY_REVIEW_CONTRACT_218_VERSION,
  builtFrom: BASE_ARTIFACT_218,
  protocolVersionClaimed: PROTOCOL_VERSION_CLAIMED_218,
  whyNoVersionIsClaimed: WHY_NO_VERSION_IS_CLAIMED_218,

  providerCalls: 0,
  databaseOperations: 0,
  commit: false,
  push: false,
  tag: false,
  deploy: false,
  customerActivation: false,

  schemaChanged: true,
  schemaChangeIsAdditive: JSON.stringify(reconstruct212Schema())
    === JSON.stringify(VERIFIER_212_RESPONSE_SCHEMA),
  instructionChangeIsAdditive:
    reconstruct216SystemPrompt(EXPERT_VERIFIER_218_SYSTEM_PROMPT)
      === EXPERT_VERIFIER_216_SYSTEM_PROMPT,

  theRemedy: TEXT_IS_NOT_THE_REMEDY,

  structuredPropertyReview: {
    fields: [...PROPERTY_REVIEW_FIELDS_218],
    propertySemanticRole: [...PROPERTY_SEMANTIC_ROLES_218],
    propertyValidity: [...PROPERTY_VALIDITIES_218],
    decisionControllingPropertyLimits: DECISION_CONTROLLING_PROPERTY_IS_ADVISORY,
    orderedDecisionSteps: ORDERED_DECISION_STEPS_218,
  },

  vocabularyUnchanged: {
    verdicts: [...VERIFIER_VERDICTS],
    verdictsAdded: [],
    owedFactDeclarations: [...OWED_FACT_DECLARATIONS_V3],
    challengeGrounds: [...CHALLENGE_GROUNDS_212],
    propertyMismatchKinds: [...PROPERTY_MISMATCH_KINDS],
    representationConcerns: [...REPRESENTATION_CONCERNS_212],
    membersAdded: [],
  },

  deterministicBoundary: {
    codes: [...PROPERTY_REVIEW_CODES_218],
    decisionInputs: [...CONSISTENCY_DECISION_INPUTS_218],
    ruleClassification: CONSISTENCY_RULE_CLASSIFICATION_218,
    effect: consistencyEffect218(),
    failClosedEffect: failClosedEffect218(),
    refusedRules: REFUSED_RULES_218,
    supersededRefusals: SUPERSEDED_REFUSALS_216,
  },

  overcorrectionGuards: OVERCORRECTION_GUARDS_218,

  sizeAccounting: {
    schema: schemaAccounting218(),
    instruction: instructionAccounting218(),
  },

  fixtures: {
    count: FIXTURES_218.length,
    compliantAdmitted: compliant.filter(r => r.propertyAdmitted).length,
    compliantTotal: compliant.length,
    refusalsFired: refusals.filter(r => !r.propertyAdmitted || !r.scopeAdmitted).length,
    refusalsTotal: refusals.length,
    everyRefusalFiredItsNamedCode: refusalsFireTheirNamedCode218(),
    rows: FIXTURES_218.map(f => ({
      id: f.id,
      requiredRole: f.requiredRole,
      requiredValidity: f.requiredValidity,
      requiredOutcome: f.requiredOutcome,
      requiredRefusalCode: f.requiredRefusalCode,
      mustNotAssert: f.mustNotAssert,
    })),
  },

  negativeControls: {
    reachableFromArchitecture: false,
    scores: [vocabularyOnlyScore(), clarificationFirstScore(), challengeEverythingScore()],
  },

  legacyCompatibility: {
    fieldProvenance: FIELD_PROVENANCE_218,
    refusedAdaptations: REFUSED_ADAPTATIONS_218,
    effect: legacyEffect218(),
    historicalEvidenceDisposition: HISTORICAL_EVIDENCE_DISPOSITION,
    section217Evidence: SECTION_217_EVIDENCE,
  },

  hostedReadiness: {
    items: hostedReadinessGate218(),
    clean: readinessIsClean218(),
    fixturesClean: fixturesAreClean218(),
  },

  hostedRecommendation: {
    status: STATUS_218,
    authorizedToExecute: AUTHORIZED_TO_EXECUTE_218,
    calls: recommendedCallCount218(),
    cases: RECOMMENDED_CASES_218,
    localFixtureBacking: localFixtureBacking218(),
    costProjection: costProjection218(),
    alreadySettled: ALREADY_SETTLED_218,
    hardGates: FUTURE_HARD_GATES_218,
    noAggregateCompensation: NO_AGGREGATE_COMPENSATION_218,
    limits: RECOMMENDATION_LIMITS_218,
  },

  stoppingRule: STOPPING_RULE_218,

  kr1Status: 'OPEN — the structured representation is local only. No hosted behaviour is measured '
    + 'and no §217 result is reclassified.',

  identities: {
    promptSection216: sha(EXPERT_VERIFIER_216_SYSTEM_PROMPT),
    promptSection218: sha(EXPERT_VERIFIER_218_SYSTEM_PROMPT),
    schemaSection212: sha(JSON.stringify(VERIFIER_212_RESPONSE_SCHEMA)),
    schemaSection218: sha(JSON.stringify(VERIFIER_218_RESPONSE_SCHEMA)),
  },

  generatedAt: new Date().toISOString(),
};

mkdirSync(OUT_DIR, { recursive: true });
const recordPath = join(OUT_DIR, 'ARCHITECTURE-RECORD-218.json');
writeFileSync(recordPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
writeFileSync(join(OUT_DIR, 'ARCHITECTURE-RECORD-218.sha256'),
  `${sha(readFileSync(recordPath))}  ARCHITECTURE-RECORD-218.json\n`, 'utf8');

console.log(`wrote ${recordPath}`);
console.log(`  schema additive: ${record.schemaChangeIsAdditive}`);
console.log(`  instruction additive: ${record.instructionChangeIsAdditive}`);
console.log(`  readiness clean: ${record.hostedReadiness.clean}`);
console.log(`  fixtures ${record.fixtures.compliantAdmitted}/${record.fixtures.compliantTotal} `
  + `admitted, ${record.fixtures.refusalsFired}/${record.fixtures.refusalsTotal} refused`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0');
