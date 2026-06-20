import { SafescopeV2Service } from '../src/safescope-v2/safescope-v2.service';
import { ActionEngineService } from '../src/action-engine/action-engine.service';
import { ContextExpansionService } from '../src/safescope-v2/context/context-expansion.service';
import { EvidenceFusionService } from '../src/safescope-v2/evidence/evidence-fusion.service';
import { ApplicableStandardsService } from '../src/applicable-standards/applicable-standards.service';
import { SafeScopeFeedbackService } from '../src/safescope-v2/feedback/safescope-feedback.service';
import { ReasoningSnapshotService } from '../src/safescope-v2/snapshots/reasoning-snapshot.service';
import { SafeScopeKnowledgeService } from '../src/safescope-knowledge/safescope-knowledge.service';
import { StandardsIntelligenceService } from '../src/safescope-v2/standards-intelligence/standards-intelligence.service';

type Scenario = {
  name: string;
  text: string;
  expectedClassificationIncludes?: string;
};

const scenarios: Scenario[] = [
  {
    name: 'Machine guarding conveyor exposure',
    text: 'Conveyor tail pulley has an exposed moving pinch point and missing guard while miners work nearby.',
    expectedClassificationIncludes: 'Machine',
  },
  {
    name: 'Electrical energized panel exposure',
    text: 'Electrical panel is open with exposed energized conductors and no barricade around the work area.',
    expectedClassificationIncludes: 'Electrical',
  },
  {
    name: 'Fall protection elevated work',
    text: 'Employee is working from an elevated platform near an unprotected edge without fall protection.',
  },
  {
    name: 'Confined space atmospheric concern',
    text: 'Worker is preparing to enter a tank with limited ventilation and no atmospheric test documented.',
  },
  {
    name: 'Trenching protective system concern',
    text: 'Employees are working inside a trench with vertical walls and no visible protective system.',
  },
  {
    name: 'Mobile equipment pedestrian exposure',
    text: 'Loader traffic is operating near pedestrians without clear separation, spotter control, or traffic plan.',
  },
  {
    name: 'Hazcom unlabeled chemical container',
    text: 'Unlabeled chemical container found in maintenance area with no SDS immediately available.',
  },
  {
    name: 'Low-context review required case',
    text: 'Something looks unsafe near the work area.',
  },
];

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
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

  const applicableStandards = {
    suggest: async (text: string, classification: string) => [
      {
        citation:
          classification === 'Electrical'
            ? '30 CFR 56.12016'
            : classification === 'Machine Guarding'
              ? '30 CFR 56.14107(a)'
              : '30 CFR 56.18002',
        agencyCode: 'MSHA',
        scopeCode: 'MSHA_MNM_SURFACE',
        summary: `${classification} related standard candidate.`,
        heading: `${classification} standard candidate`,
        score: 88,
        confidence: 0.86,
        matchingReasons: [`${classification} classification selected.`],
      },
    ],
  } as unknown as ApplicableStandardsService;

  const feedbackService = {
    getWorkspaceStandardAdjustments: async () => [],
  } as unknown as SafeScopeFeedbackService;

  const reasoningSnapshotService = {
    createSnapshot: async () => ({ id: `snapshot-${Date.now()}` }),
  } as unknown as ReasoningSnapshotService;

  const safeScopeKnowledge = {
    retrieveForHazard: async ({ classification }: any) => ({
      confidence: 0.82,
      matches: [
        {
          chunkId: `chunk-${classification}`,
          documentId: `doc-${classification}`,
          title: `${classification} reference`,
          agency: 'MSHA',
          sourceType: 'regulation',
          authorityTier: 1,
          citation:
            classification === 'Electrical'
              ? '30 CFR 56.12016'
              : classification === 'Machine Guarding'
                ? '30 CFR 56.14107(a)'
                : '30 CFR 56.18002',
          sourceUrl: null,
          sectionHeading: `${classification} reference`,
          excerpt: `${classification} source text.`,
          tags: [String(classification).toLowerCase().replaceAll(' ', '_')],
          score: 90,
          reason: `Matched ${classification} context.`,
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

  return new SafescopeV2Service(
    actionEngine,
    new EvidenceFusionService(),
    applicableStandards,
    { evaluate: async () => ({}) } as any,
    { evaluate: async () => ({}) } as any,
    { evaluate: async () => ({}) } as any,
    { evaluate: () => ({ mode: 'offline_limited_advisory', advisorySummary: 'Offline' }) } as any,
    { can: () => ({ allowed: true }) } as any,
    { route: async () => ({ domainId: 'unknown', confidence: 0 }) } as any,
    { getShardSummary: () => ({ citations: [] }) } as any,
  );
}

async function main() {
  const service = createMockService();

  const results = [];

  for (const scenario of scenarios) {
    const result: any = await service.classify(
      scenario.text,
      ['msha_mnm_surface'],
      ['Photo evidence or field note attached.'],
      'standard_5x5',
      'test-workspace',
      [],
    );

    assert(result.aiReadiness, `${scenario.name}: missing aiReadiness`);
    assert(result.aiEvidenceContract, `${scenario.name}: missing aiEvidenceContract`);
    assert(result.decisionSupportMetadata?.aiEvidenceContract, `${scenario.name}: missing nested aiEvidenceContract`);
    assert(result.knowledgeBrain, `${scenario.name}: missing knowledgeBrain`);
    assert(result.sourceAwareAnalysis, `${scenario.name}: missing sourceAwareAnalysis`);
    assert(typeof result.requiresHumanReview === 'boolean', `${scenario.name}: requiresHumanReview must be boolean`);
    assert(Array.isArray(result.aiEvidenceContract.inputsUsed), `${scenario.name}: inputsUsed must be array`);
    assert(Array.isArray(result.aiEvidenceContract.reviewTriggers), `${scenario.name}: reviewTriggers must be array`);
    assert(
      typeof result.aiEvidenceContract.canFinalizeWithoutHumanReview === 'boolean',
      `${scenario.name}: canFinalizeWithoutHumanReview must be boolean`,
    );

    if (scenario.expectedClassificationIncludes) {
      assert(
        String(result.classification).includes(scenario.expectedClassificationIncludes),
        `${scenario.name}: expected classification to include ${scenario.expectedClassificationIncludes}, got ${result.classification}`,
      );
    }

    results.push({
      scenario: scenario.name,
      classification: result.classification,
      confidence: result.confidence,
      requiresHumanReview: result.requiresHumanReview,
      canFinalizeWithoutHumanReview: result.aiEvidenceContract.canFinalizeWithoutHumanReview,
      inputsUsed: result.aiEvidenceContract.inputsUsed,
      reviewTriggers: result.aiEvidenceContract.reviewTriggers.length,
    });
  }

  console.log('✅ SafeScope AI scenario gauntlet passed.');
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error('❌ SafeScope AI scenario gauntlet failed.');
  console.error(error);
  process.exit(1);
});
