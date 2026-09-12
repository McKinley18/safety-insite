import { createHash } from 'crypto';
import { writeFileSync } from 'fs';
import { join } from 'path';

import {
  CHALLENGE_GROUNDS_212, PROPERTY_MISMATCH_KINDS, REPRESENTATION_CONCERNS_212,
  VOCABULARY_JUSTIFICATION, REFUSED_MEMBERS, NO_REPLACEMENT_PROPERTY_FIELD,
  CHALLENGE_ADMISSION_CODES_212, CHALLENGE_IS_NEVER_A_SETTLEMENT, kr1IsRepresentable,
} from './lib/expert-212-challenge-vocabulary';
import {
  VERIFIER_PROTOCOL_212_VERSION, PROTOCOL_VERSION_CLAIMED, WHY_NO_VERSION_IS_CLAIMED,
  BLOCK_TO_RULE_212, OVERCORRECTION_GUARD_212, ADDED_DECLARATION_PROPERTIES,
  protocolIdentities212, REMIT_BLOCK_LINES,
} from './lib/expert-212-verifier-protocol';
import {
  REQUIRED_PAYLOAD_FIELDS_212, PAYLOAD_FIELD_PROVENANCE, NEVER_RECONSTRUCTED_FROM,
  ANCILLARY_CONTEXT_DEFAULT, REQUEST_REFUSAL_CODES_212, payloadEffect212,
} from './lib/expert-212-verifier-payload';
import {
  DECISION, DECISION_BASIS, SECTION_201_STATUS_PRESERVED, INHERITED_MEMBERS_UNCHANGED,
  C6A_PARTS_NOT_ADOPTED_HERE,
} from './lib/expert-212-c6a-successor-decision';
import {
  SUCCESSOR_ANCESTRY_PIN_212, successorAncestryHolds, evaluateNarrowedInvariants,
  PM1_DISPOSITIONS, pm1RepairEffect,
} from './lib/expert-212-pm1-assertion-repair';
import {
  ADAPTATION_LEDGER, adaptAllCases, adaptedProviderCallCount, adapterEffect,
} from './lib/expert-212-instrument-adapter';
import { providerCallCount } from './lib/expert-211-validation-instrument';

const DIR = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-212-verifier-architecture-remediation-2026-09-09');

const rec = {
  artifact: 'SECTION-212-VERIFIER-ARCHITECTURE-REMEDIATION-RECORD',
  providerCalls: 0,
  databaseOperations: 0,
  protocolVersionClaimed: PROTOCOL_VERSION_CLAIMED,
  whyNoVersionIsClaimed: WHY_NO_VERSION_IS_CLAIMED,
  rA_payload: {
    requiredFields: REQUIRED_PAYLOAD_FIELDS_212,
    provenance: PAYLOAD_FIELD_PROVENANCE,
    neverReconstructedFrom: NEVER_RECONSTRUCTED_FROM,
    ancillaryContextDefault: ANCILLARY_CONTEXT_DEFAULT,
    refusalCodes: REQUEST_REFUSAL_CODES_212,
    effect: payloadEffect212(),
  },
  rB_remit: {
    artifact: VERIFIER_PROTOCOL_212_VERSION,
    blockLines: REMIT_BLOCK_LINES.length,
    blockToRule: BLOCK_TO_RULE_212,
    overcorrectionGuard: OVERCORRECTION_GUARD_212,
    identities: protocolIdentities212(),
  },
  rC_vocabulary: {
    challengeGrounds: CHALLENGE_GROUNDS_212,
    propertyMismatchKinds: PROPERTY_MISMATCH_KINDS,
    representationConcerns: REPRESENTATION_CONCERNS_212,
    addedDeclarationProperties: ADDED_DECLARATION_PROPERTIES,
    justification: VOCABULARY_JUSTIFICATION,
    refusedMembers: REFUSED_MEMBERS,
    noReplacementPropertyField: NO_REPLACEMENT_PROPERTY_FIELD,
    admissionCodes: CHALLENGE_ADMISSION_CODES_212,
    challengeIsNeverASettlement: CHALLENGE_IS_NEVER_A_SETTLEMENT,
    kr1Representable: kr1IsRepresentable(),
  },
  c6aSuccessorDecision: {
    decision: DECISION, basis: DECISION_BASIS,
    section201Preserved: SECTION_201_STATUS_PRESERVED,
    inheritedUnchanged: INHERITED_MEMBERS_UNCHANGED,
    partsNotAdopted: C6A_PARTS_NOT_ADOPTED_HERE,
  },
  pm1: {
    dispositions: PM1_DISPOSITIONS,
    successorAncestryPin: SUCCESSOR_ANCESTRY_PIN_212,
    successorPinHolds: successorAncestryHolds(),
    narrowedInvariants: evaluateNarrowedInvariants(),
    effect: pm1RepairEffect(),
  },
  frozenInstrument: {
    adaptationLedger: ADAPTATION_LEDGER,
    adaptedCases: adaptAllCases().map(a => ({
      caseId: a.caseId, refused: a.refusedBecause, facts: a.facts.length,
      requests: a.requests.length, allBuilt: a.requests.every(r => r.built),
      frozenQuestions: a.frozenQuestionIds.length,
    })),
    adaptedProviderCallCount: adaptedProviderCallCount(),
    frozen211ProviderCallCount: providerCallCount(),
    countsAgree: adaptedProviderCallCount() === providerCallCount(),
    effect: adapterEffect(),
  },
  kr1Status: 'OPEN — architecture now able to express the finding; no behavioural mitigation claimed',
  generatedAt: '2026-09-09',
};

const json = JSON.stringify(rec, null, 2) + '\n';
writeFileSync(join(DIR, 'REMEDIATION-RECORD-212.json'), json);
writeFileSync(join(DIR, 'REMEDIATION-RECORD-212.sha256'),
  `${createHash('sha256').update(json, 'utf8').digest('hex')}  REMEDIATION-RECORD-212.json\n`);

const id = protocolIdentities212() as any;
console.log('prompt  +' + id.prompt.addedChars + ' chars  ' + id.prompt.baseSha256.slice(0, 12)
  + '… -> ' + id.prompt.successorSha256.slice(0, 12) + '…');
console.log('schema  +' + id.schema.addedBytes + ' bytes  +' + id.schema.addedNodes + ' nodes  +'
  + id.schema.addedEnums + ' enums  +' + id.schema.addedEnumMembers + ' enum members');
console.log('schema  ' + id.schema.baseBytes + ' -> ' + id.schema.successorBytes + ' bytes');
console.log('calls   adapted ' + adaptedProviderCallCount() + ' | frozen ' + providerCallCount());
