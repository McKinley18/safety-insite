import { SafescopeV2Service } from '../src/safescope-v2/safescope-v2.service';
import { ActionEngineService } from '../src/action-engine/action-engine.service';
import { ContextExpansionService } from '../src/safescope-v2/context/context-expansion.service';
import { EvidenceFusionService } from '../src/safescope-v2/evidence/evidence-fusion.service';
import { ApplicableStandardsService } from '../src/applicable-standards/applicable-standards.service';
import { SafeScopeFeedbackService } from '../src/safescope-v2/feedback/safescope-feedback.service';
import { ReasoningSnapshotService } from '../src/safescope-v2/snapshots/reasoning-snapshot.service';
import { SafeScopeKnowledgeService } from '../src/safescope-knowledge/safescope-knowledge.service';
import { StandardsIntelligenceService } from '../src/safescope-v2/standards-intelligence/standards-intelligence.service';

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(`SafeScope AI contract validation failed: ${message}`);
  }
}

function createMockService() {
  const actionEngine = {
    generateActionsFromReport: async () => [
      {
        title: 'Correct identified hazard',
        description: 'Control the hazard and verify correction.',
        priority: 'HIGH',
        assignedRole: 'Safety Manager',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        suggestedFixes: ['Restrict exposure.', 'Correct condition.', 'Verify closure.'],
      },
    ],
  } as unknown as ActionEngineService;

  const contextExpansion = new ContextExpansionService();
  const evidenceFusion = new EvidenceFusionService();

  const applicableStandards = {
    suggest: async () => [
      {
        citation: '30 CFR 56.14107(a)',
        agencyCode: 'MSHA',
        scopeCode: 'MSHA_MNM_SURFACE',
        summary: 'Moving machine parts must be guarded.',
        heading: 'Moving machine parts',
        score: 90,
        confidence: 0.9,
        matchingReasons: ['Conveyor and moving parts detected.'],
      },
    ],
  } as unknown as ApplicableStandardsService;

  const feedbackService = {
    getWorkspaceStandardAdjustments: async () => [],
  } as unknown as SafeScopeFeedbackService;

  const reasoningSnapshotService = {
    createSnapshot: async () => ({ id: 'test-reasoning-snapshot-id' }),
  } as unknown as ReasoningSnapshotService;

  const safeScopeKnowledge = {
    retrieveForHazard: async () => ({
      confidence: 0.85,
      matches: [
        {
          chunkId: 'chunk-1',
          documentId: 'doc-1',
          title: 'Machine guarding reference',
          agency: 'MSHA',
          sourceType: 'regulation',
          authorityTier: 1,
          citation: '30 CFR 56.14107(a)',
          sourceUrl: null,
          sectionHeading: 'Moving machine parts',
          excerpt: 'Moving machine parts must be guarded.',
          tags: ['machine_guarding'],
          score: 95,
          reason: 'Matched conveyor guarding hazard.',
        },
      ],
      reasoning: {
        evidenceGaps: [],
        caution: 'Qualified review remains required for final compliance decisions.',
      },
    }),
  } as unknown as SafeScopeKnowledgeService;

  const supervisorValidationService = {
    getWorkspaceValidationSignals: async () => [],
  };

  const standardsIntelligenceService = {} as StandardsIntelligenceService;

  return new SafescopeV2Service(
    actionEngine,
    contextExpansion,
    evidenceFusion,
    applicableStandards,
    feedbackService,
    reasoningSnapshotService,
    safeScopeKnowledge,
    standardsIntelligenceService,
    supervisorValidationService as any,
  );
}

async function main() {
  const service = createMockService();

  const result: any = await service.classify(
    'Conveyor tail pulley has an exposed moving pinch point and missing guard while miners work nearby.',
    ['msha_mnm_surface'],
    ['Photo evidence shows exposed pulley and missing guard.'],
    'standard_5x5',
    'test-workspace',
    [],
  );

  assert(result, 'result is missing');
  assert(result.aiReadiness, 'aiReadiness is missing');
  assert(result.aiEvidenceContract, 'aiEvidenceContract is missing');
  assert(result.decisionSupportMetadata, 'decisionSupportMetadata is missing');
  assert(
    result.decisionSupportMetadata.aiEvidenceContract,
    'decisionSupportMetadata.aiEvidenceContract is missing',
  );
  assert(
    result.decisionSupportMetadata.aiEvidenceContract === result.aiEvidenceContract,
    'decisionSupportMetadata.aiEvidenceContract should reference the returned aiEvidenceContract',
  );
  assert(typeof result.requiresHumanReview === 'boolean', 'requiresHumanReview must be boolean');
  assert(result.knowledgeBrain, 'knowledgeBrain is missing');
  assert(result.sourceAwareAnalysis, 'sourceAwareAnalysis is missing');
  assert(result.reasoningSnapshotId, 'reasoningSnapshotId is missing');
  assert(Array.isArray(result.aiEvidenceContract.inputsUsed), 'inputsUsed must be an array');
  assert(
    Array.isArray(result.aiEvidenceContract.standardsSourcesUsed),
    'standardsSourcesUsed must be an array',
  );
  assert(
    Array.isArray(result.aiEvidenceContract.missingInputs),
    'missingInputs must be an array',
  );
  assert(
    Array.isArray(result.aiEvidenceContract.unsupportedClaims),
    'unsupportedClaims must be an array',
  );
  assert(
    Array.isArray(result.aiEvidenceContract.reviewTriggers),
    'reviewTriggers must be an array',
  );
  assert(
    typeof result.aiEvidenceContract.canFinalizeWithoutHumanReview === 'boolean',
    'canFinalizeWithoutHumanReview must be boolean',
  );

  assert(result.aiCapabilityProfile, 'aiCapabilityProfile must be present');
  assert(
    typeof result.aiCapabilityProfile.classification === 'string',
    'aiCapabilityProfile.classification must be present',
  );
  assert(
    Array.isArray(result.aiCapabilityProfile.capabilities),
    'aiCapabilityProfile.capabilities must be an array',
  );
  assert(
    Array.isArray(result.aiCapabilityProfile.missingForValidatedAi),
    'aiCapabilityProfile.missingForValidatedAi must be an array',
  );


  assert(
    result.nativeReasoning,
    'nativeReasoning must be present',
  );

  assert(
    result.nativeReasoning.enabled === true,
    'nativeReasoning must be enabled by default',
  );

  assert(
    result.nativeReasoning.mode === 'offline_capable',
    'nativeReasoning default mode must be offline_capable',
  );

  assert(
    result.nativeReasoning.engine === 'safescope_native',
    'nativeReasoning default engine must be safescope_native',
  );

  assert(
    result.learningGovernance,
    'learningGovernance must be present',
  );

  assert(
    Array.isArray(result.learningGovernance.allowedInfluence),
    'learningGovernance.allowedInfluence must be an array',
  );

  assert(
    result.learningGovernance.allowedInfluence.includes('adjust_confidence'),
    'learningGovernance must allow confidence adjustment only through governance',
  );

  assert(
    Array.isArray(result.learningGovernance.prohibitedInfluence),
    'learningGovernance.prohibitedInfluence must be an array',
  );

  assert(
    result.learningGovernance.prohibitedInfluence.includes('invent_citations'),
    'learningGovernance must prohibit invented citations',
  );

  assert(
    result.learningGovernance.prohibitedInfluence.includes('auto_finalize_compliance_decisions'),
    'learningGovernance must prohibit auto-final compliance decisions',
  );

  assert(
    typeof result.learningGovernance.finalGovernanceRule === 'string',
    'learningGovernance.finalGovernanceRule must be present',
  );


  assert(
    result.learningMemory,
    'learningMemory must be present',
  );

  assert(
    result.learningMemory.engine === 'safescope_learning_memory',
    'learningMemory.engine must be safescope_learning_memory',
  );

  assert(
    result.learningMemory.canSelfModifyRules === false,
    'learningMemory cannot self-modify rules',
  );

  assert(
    result.learningMemory.canOverrideStandards === false,
    'learningMemory cannot override standards',
  );

  assert(
    result.learningMemory.canReduceHumanReview === false,
    'learningMemory cannot reduce human review',
  );

  assert(
    typeof result.learningMemory.memoryBoundary === 'string',
    'learningMemory.memoryBoundary must be present',
  );

  
  assert(
    result.nativeReasoning?.mechanismIntelligence,
    'nativeReasoning.mechanismIntelligence must be present',
  );

  assert(
    result.nativeReasoning.mechanismIntelligence.engine === 'safescope_mechanism_intelligence',
    'mechanismIntelligence.engine must be safescope_mechanism_intelligence',
  );

  assert(
    Array.isArray(result.nativeReasoning.mechanismIntelligence.primaryEnergySources),
    'mechanismIntelligence.primaryEnergySources must be an array',
  );

  assert(
    Array.isArray(result.nativeReasoning.mechanismIntelligence.injuryMechanisms),
    'mechanismIntelligence.injuryMechanisms must be an array',
  );

  assert(
    Array.isArray(result.nativeReasoning.mechanismIntelligence.credibleAccidentPathways),
    'mechanismIntelligence.credibleAccidentPathways must be an array',
  );

  assert(
    result.nativeReasoning.mechanismIntelligence.canInventCitations === false,
    'mechanismIntelligence cannot invent citations',
  );

  assert(
    result.nativeReasoning.mechanismIntelligence.canOverrideStandards === false,
    'mechanismIntelligence cannot override standards',
  );

  assert(
    result.nativeReasoning.mechanismIntelligence.canReduceHumanReview === false,
    'mechanismIntelligence cannot reduce human review',
  );

  assert(
    typeof result.nativeReasoning.mechanismIntelligence.sourceBoundary === 'string',
    'mechanismIntelligence.sourceBoundary must be present',
  );

console.log('✅ SafeScope AI contract validation passed.');
  console.log(
    JSON.stringify(
      {
        classification: result.classification,
        confidence: result.confidence,
        requiresHumanReview: result.requiresHumanReview,
        aiReadiness: result.aiReadiness,
        aiEvidenceContract: result.aiEvidenceContract,
        aiCapabilityProfile: result.aiCapabilityProfile,
        nativeReasoning: result.nativeReasoning,
        learningGovernance: result.learningGovernance,
        learningMemory: result.learningMemory,
        reasoningSnapshotId: result.reasoningSnapshotId,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
