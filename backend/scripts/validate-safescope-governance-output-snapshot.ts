import * as fs from 'fs';
import * as path from 'path';
import { SafeScopeIntelligenceOrchestrator } from '../src/safescope-v2/orchestration/intelligence-orchestrator.service';

const orchestrator = new SafeScopeIntelligenceOrchestrator();
const SNAPSHOT_PATH = path.resolve(__dirname, '../../safescope-data/snapshots/safescope-governance-output-snapshot.v1.json');
const SHOULD_UPDATE_SNAPSHOT =
  process.argv.includes('--update-snapshot') ||
  process.env.UPDATE_SNAPSHOT === '1';

function guardrails(value: any) {
  return {
    advisoryOnly: value?.advisoryGuardrails?.advisoryOnly === true,
    doesNotDeclareViolation: value?.advisoryGuardrails?.doesNotDeclareViolation === true,
    doesNotCreateCitation: value?.advisoryGuardrails?.doesNotCreateCitation === true,
    requiresQualifiedReview: value?.advisoryGuardrails?.requiresQualifiedReview === true,
  };
}

function stableList(values: any): string[] {
  if (!Array.isArray(values)) return [];
  return Array.from(new Set(values.map((item) => String(item)))).sort();
}

function buildStableSnapshot(result: any) {
  return {
    snapshotVersion: 'governance_output_snapshot_v1',
    observationUnderstanding: {
      equipmentGroup: result?.observationUnderstanding?.equipment?.group ?? 'unknown',
      equipmentComponent: result?.observationUnderstanding?.equipment?.component ?? 'unknown',
      workerExposed: result?.observationUnderstanding?.exposure?.workerExposed ?? 'unknown',
      proximity: result?.observationUnderstanding?.exposure?.proximity ?? 'unknown',
      topMechanism: result?.observationUnderstanding?.mechanisms?.[0]?.mechanism ?? 'unknown',
    },
    causalRiskReasoning: {
      mechanismOfInjury: result?.causalRiskReasoning?.mechanismOfInjury ?? 'unknown',
      riskBand: result?.causalRiskReasoning?.riskBand ?? result?.calibrationMeta?.riskBand ?? 'unknown',
      failedOrMissingControl: String(result?.causalRiskReasoning?.failedOrMissingControl ?? 'unknown'),
    },
    evidenceSufficiency: {
      sufficiencyLevel: result?.evidenceSufficiency?.sufficiencyLevel ?? 'unknown',
      missingCriticalFacts: stableList(result?.evidenceSufficiency?.missingCriticalFacts),
    },
    confidenceGovernance: {
      maximumSupportedConfidence: result?.confidenceGovernance?.maximumSupportedConfidence ?? 'unknown',
      confidenceLimits: stableList(result?.confidenceGovernance?.confidenceLimits),
    },
    outputPolicy: {
      allowedLanguageStrength: result?.outputPolicy?.allowedLanguageStrength ?? 'unknown',
      canReferenceCitationCandidate: result?.outputPolicy?.allowedOutputModes?.canReferenceCitationCandidate === true,
      canReferenceStandardFamily: result?.outputPolicy?.allowedOutputModes?.canReferenceStandardFamily !== false,
    },
    dca: {
      actionStrength: result?.dca?.actionStrength ?? 'unknown',
      immediateActionsCount: result?.dca?.immediateActions?.length ?? 0,
      interimControlsCount: result?.dca?.interimControls?.length ?? 0,
      permanentCorrectiveActionsCount: result?.dca?.permanentCorrectiveActions?.length ?? 0,
      verificationActionsCount: result?.dca?.verificationActions?.length ?? 0,
      guardrails: guardrails(result?.dca),
    },
    hrlg: {
      reviewRequired: result?.hrlg?.reviewRequired === true,
      reviewPriority: result?.hrlg?.reviewPriority ?? 'unknown',
      eligibilityLevel: result?.hrlg?.learningEligibility?.eligibilityLevel ?? 'unknown',
      eligibleForLearningCandidate: result?.hrlg?.learningEligibility?.eligibleForLearningCandidate === true,
      guardrails: guardrails(result?.hrlg),
    },
    sbag: {
      applicabilitySupportLevel: result?.sbag?.applicabilitySupportLevel ?? 'unknown',
      jurisdictionClear: result?.sbag?.jurisdictionSupport?.jurisdictionClear === true,
      canDiscussStandardFamily: result?.sbag?.standardFamilySupport?.canDiscussStandardFamily === true,
      canDiscussCitationCandidate: result?.sbag?.citationCandidateSupport?.canDiscussCitationCandidate === true,
      citationCandidateMode: result?.sbag?.citationCandidateSupport?.citationCandidateMode ?? 'unknown',
      guardrails: guardrails(result?.sbag),
    },
    askig: {
      intakeDecision: result?.askig?.intakeDecision ?? 'unknown',
      authorityTier: result?.askig?.sourceAuthority?.authorityTier ?? 'unknown',
      sourceDateStatus: result?.askig?.sourceAuthority?.sourceDateStatus ?? 'unknown',
      possibleDuplicate: result?.askig?.duplicateGovernance?.possibleDuplicate === true,
      guardrails: guardrails(result?.askig),
    },
    akpwg: {
      promotionDecision: result?.akpwg?.promotionDecision ?? 'unknown',
      guardrails: guardrails(result?.akpwg),
    },
    akrwg: {
      writeDecision: result?.akrwg?.writeDecision ?? 'unknown',
      canWriteApprovedKnowledge: result?.akrwg?.writePermission?.canWriteApprovedKnowledge === true,
      canCreateDraftCandidate: result?.akrwg?.writePermission?.canCreateDraftCandidate === true,
      guardrails: guardrails(result?.akrwg),
    },
    calibrationMeta: {
      hazardFamily: result?.calibrationMeta?.hazardFamily ?? 'unknown',
      scenarioFamily: result?.calibrationMeta?.scenarioFamily ?? 'unknown',
      mechanism: result?.calibrationMeta?.mechanism ?? 'unknown',
      riskBand: result?.calibrationMeta?.riskBand ?? 'unknown',
      standardFamily: result?.calibrationMeta?.standardFamily ?? 'unknown',
    },
  };
}

function assertRequiredSections(snapshot: any) {
  const required = [
    'observationUnderstanding',
    'causalRiskReasoning',
    'evidenceSufficiency',
    'confidenceGovernance',
    'outputPolicy',
    'dca',
    'hrlg',
    'sbag',
    'askig',
    'akpwg',
    'akrwg',
    'calibrationMeta',
  ];

  const missing = required.filter((key) => !snapshot[key]);
  if (missing.length) {
    throw new Error(`Missing governance snapshot sections: ${missing.join(', ')}`);
  }

  const guardrailSections = ['dca', 'hrlg', 'sbag', 'askig', 'akpwg', 'akrwg'];
  for (const section of guardrailSections) {
    const rails = snapshot[section]?.guardrails;
    if (
      rails?.advisoryOnly !== true ||
      rails?.doesNotDeclareViolation !== true ||
      rails?.doesNotCreateCitation !== true ||
      rails?.requiresQualifiedReview !== true
    ) {
      throw new Error(`Advisory guardrails missing or weakened in ${section}.`);
    }
  }
}

async function validate() {
  const observation =
    'MSHA mechanic is servicing a conveyor drive with the guard removed while the equipment is not locked out. Stored and rotating energy could start unexpectedly and employees are exposed.';

  const result = await orchestrator.evaluate({
    fusedText: observation,
    promotedPrimary: {
      classification: 'Machine Guarding',
      confidence: 0.9,
      risk: { riskScore: 15 },
    },
    classifierResult: { ambiguityWarnings: [] },
    evidenceTexts: [],
    expandedContext: {},
    primaryStandardsResult: { suggestedStandards: ['1910.147'] },
    generatedActions: [],
    additionalHazards: [],
  });

  const stableSnapshot = buildStableSnapshot(result);
  assertRequiredSections(stableSnapshot);

  fs.mkdirSync(path.dirname(SNAPSHOT_PATH), { recursive: true });

  if (!fs.existsSync(SNAPSHOT_PATH) || SHOULD_UPDATE_SNAPSHOT) {
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(stableSnapshot, null, 2) + '\n');
    console.log(
      SHOULD_UPDATE_SNAPSHOT
        ? '✅ Governance output snapshot intentionally updated.'
        : '✅ Governance output snapshot created.'
    );
    return;
  }

  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf-8'));
  const currentJson = JSON.stringify(stableSnapshot, null, 2);
  const snapshotJson = JSON.stringify(snapshot, null, 2);

  if (currentJson !== snapshotJson) {
    console.error('❌ Governance output snapshot mismatch detected.');
    console.error('Stable governance summary changed from the committed fixture.');
    console.error('If intentional, run: npx ts-node scripts/validate-safescope-governance-output-snapshot.ts --update-snapshot');
    process.exit(1);
  }

  console.log('✅ Governance output snapshot matched.');
}

validate().catch((error) => {
  console.error(error);
  process.exit(1);
});
