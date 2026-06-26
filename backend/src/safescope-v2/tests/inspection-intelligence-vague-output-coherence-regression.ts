import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Standard } from '../../standards/entities/standard.entity';
import { ApplicableStandardsService } from '../../applicable-standards/applicable-standards.service';
import { ActionEngineService } from '../../action-engine/action-engine.service';
import { HazardFixService } from '../../intelligence/hazard-fix.service';
import { FixFeedbackService } from '../../intelligence/fix-feedback.service';
import { EvidenceFusionService } from '../evidence/evidence-fusion.service';
import { SafeScopeIntelligenceOrchestrator } from '../orchestration/intelligence-orchestrator.service';
import { VisualEvidenceReasoningService } from '../visual-evidence-reasoning/visual-evidence-reasoning.service';
import { RealImageAnalysisService } from '../real-image-analysis/real-image-analysis.service';
import { OfflineReasoningMobileResilienceService } from '../offline-reasoning-mobile-resilience/offline-reasoning-mobile-resilience.service';
import { WorkspaceGovernanceAccessService } from '../workspace-governance-access/workspace-governance-access.service';
import { HazLenzKnowledgeRouterService } from '../knowledge-router/hazlenz-knowledge-router.service';
import { HazLenzKnowledgeShardService } from '../knowledge-shards/hazlenz-knowledge-shard.service';
import { HazLenzKnowledgeIndexService } from '../knowledge-index/hazlenz-knowledge-index.service';
import { SafescopeV2Service } from '../safescope-v2.service';

const databaseUrl = process.env.DATABASE_URL;

const ds = new DataSource({
  type: 'postgres',
  url: databaseUrl || undefined,
  host: databaseUrl ? undefined : process.env.DB_HOST || 'localhost',
  port: databaseUrl ? undefined : Number(process.env.DB_PORT || 5432),
  username: databaseUrl ? undefined : process.env.DB_USERNAME || process.env.DB_USER || 'user',
  password: databaseUrl ? undefined : process.env.DB_PASSWORD || process.env.DB_PASS || 'password',
  database: databaseUrl ? undefined : process.env.DB_DATABASE || process.env.DB_NAME || 'safescope',
  entities: [Standard],
  synchronize: false,
});

async function run() {
  console.log("Initializing database connection for Vague Output Coherence suite...");
  await ds.initialize();

  const standardRepo = ds.getRepository(Standard);
  const applicableStandards = new ApplicableStandardsService(standardRepo);

  const mockFixFeedbackRepo = {
    create: (x: any) => x,
    save: async (x: any) => x,
    find: async () => [],
  } as any;
  const fixFeedbackService = new FixFeedbackService(mockFixFeedbackRepo);
  const hazardFixService = new HazardFixService();
  const actionEngine = new ActionEngineService(hazardFixService, fixFeedbackService);

  const evidenceFusion = new EvidenceFusionService();
  const intelligenceOrchestrator = new SafeScopeIntelligenceOrchestrator();
  const visualService = new VisualEvidenceReasoningService();
  const imageAnalysisService = new RealImageAnalysisService();
  const offlineService = new OfflineReasoningMobileResilienceService();
  const access = new WorkspaceGovernanceAccessService();

  const knowledgeIndex = new HazLenzKnowledgeIndexService();
  const knowledgeRouter = new HazLenzKnowledgeRouterService(knowledgeIndex);
  const knowledgeShardService = new HazLenzKnowledgeShardService();

  const service = new SafescopeV2Service(
    actionEngine,
    evidenceFusion,
    applicableStandards,
    intelligenceOrchestrator,
    visualService,
    imageAnalysisService,
    offlineService,
    access,
    knowledgeRouter,
    knowledgeShardService
  );

  let passed = 0;
  let failed = 0;

  console.log("\n🏃 Starting vague-input downstream coherence regression tests...\n");

  const vagueScenarios = [
    {
      id: 1,
      input: 'panel looks bad',
      domain: 'electrical',
      shouldNotMention: ['filler', 'knockout', 'dead-front', 'open slot', 'plug'],
    },
    {
      id: 2,
      input: 'electrical issue',
      domain: 'electrical',
      shouldNotMention: ['loto', 'lockout', 'tagout', 'lock out'],
    },
    {
      id: 3,
      input: 'cord problem',
      domain: 'electrical',
      shouldNotMention: ['29 cfr', '30 cfr', '1910.305', '1910.334'],
    },
    {
      id: 4,
      input: 'breaker problem',
      domain: 'electrical',
      shouldNotMention: ['filler', 'knockout', 'dead-front', 'cover'],
    },
    {
      id: 5,
      input: 'machine unsafe',
      domain: 'machine_guarding_loto',
      shouldNotMention: ['1910.212', '1910.147', '30 cfr'],
    },
    {
      id: 6,
      input: 'conveyor problem',
      domain: 'machine_guarding_loto',
      shouldNotMention: ['30 cfr 56.14107', '1910.212'],
    },
    {
      id: 7,
      input: 'forklift area unsafe',
      domain: 'mobile_equipment',
      shouldNotMention: ['1910.178', '1926.602', '30 cfr 56.9100'],
    },
    {
      id: 8,
      input: 'chemical issue',
      domain: 'hazard_communication',
      shouldNotMention: ['1910.1200', 'workplace label'],
    },
    {
      id: 9,
      input: 'leak near drain',
      domain: 'hazard_communication',
      shouldNotMention: ['used oil', 'drum'],
    },
    {
      id: 10,
      input: 'fall hazard',
      domain: 'fall_protection',
      shouldNotMention: ['1910.28', '1926.501', 'guardrail'],
    },
    {
      id: 11,
      input: 'mine safety issue',
      domain: 'ground_control',
      shouldNotMention: ['part 56', 'part 57', 'part 75', 'part 77'],
    },
    {
      id: 12,
      input: 'crusher area dusty',
      domain: 'industrial_hygiene',
      shouldNotMention: ['silica', 'noise', 'decibel'],
    },
    {
      id: 13,
      input: 'training concern',
      domain: 'training_procedure_gap',
      shouldNotMention: ['30 cfr part 46', '30 cfr part 48', '1910.1200'],
    },
    {
      id: 14,
      input: 'blocked access',
      domain: 'walking_working_surfaces',
      shouldNotMention: ['1910.37', '1910.22'],
    },
    {
      id: 15,
      input: 'open container',
      domain: 'hazard_communication',
      shouldNotMention: ['compressed gas', 'cylinder'],
    }
  ];

  const clearScenarios = [
    {
      id: 16,
      input: 'Open breaker slot and missing panel cover expose energized parts in a warehouse.',
      domain: 'electrical',
      expectedCitation: '1910.303(g)(2)(i)',
    },
    {
      id: 17,
      input: 'Damaged extension cord with exposed conductor is used in a wet area.',
      domain: 'electrical',
      expectedCitation: '1910.305(g)',
    },
    {
      id: 18,
      input: 'Unlabeled chemical container in maintenance shop.',
      domain: 'hazard_communication',
      expectedCitation: '1910.1200',
    },
    {
      id: 19,
      input: 'Forklift operating next to pedestrians without separation.',
      domain: 'mobile_equipment',
      expectedCitation: '1910.178',
    },
    {
      id: 20,
      input: 'Missing guard on conveyor tail pulley at aggregate mine during cleanup.',
      domain: 'machine_guarding_loto',
      expectedCitation: '56.14107',
    }
  ];

  const falsePositiveScenarios = [
    { id: 21, input: 'fall meeting' },
    { id: 22, input: 'locked out of account' },
    { id: 23, input: 'guard at front gate' },
    { id: 24, input: 'data mining issue' },
    { id: 25, input: 'coal-colored paint' }
  ];

  const forbiddenFinalLanguage = /\b(violation confirmed|citation issued|noncompliant|definite violation|must cite|final citation)\b/i;
  const questionText = (value: any) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return String(value.question || value.text || value.prompt || JSON.stringify(value));
    return String(value);
  };

  const assertHazComVagueBehavior = (response: any, input: string) => {
    const questions = (response.evidenceGapQuestions || []).map(questionText);
    const questionsJoined = questions.join(' | ').toLowerCase();
    const suggestedCitations = [
      ...(response.suggestedStandards || []),
      ...(response.supportingStandards || []),
      ...(response.inspectionIntelligence?.candidateStandards || []),
      ...(response.standardsTraceability?.suggestedCitations || []),
    ]
      .map((standard: any) => String(standard?.citation || standard?.standard || standard?.label || ''))
      .filter(Boolean);

    const guardrails = response.inspectionIntelligence?.guardrails || response.standardsTraceability?.advisoryGuardrails;
    const candidate = response.inspectionIntelligence?.hazardCandidates?.[0];
    const confidenceIntelligence = response.confidenceIntelligence || response.inspectionIntelligence?.confidenceIntelligence;

    if (input === 'leak near drain' || input === 'open container') {
      console.log('[diag]', input, JSON.stringify({
        rootConfidence: response.confidence,
        rootConfidenceBand: response.confidenceBand,
        requiresHumanReview: response.requiresHumanReview,
        primaryCandidate: candidate,
        candidateConfidence: candidate?.confidence,
        candidateConfidenceBand: candidate?.confidenceBand,
        confidenceIntelligence,
        reviewStateLabel: response.reviewStateLabel,
        guardrails,
        suggestedStandards: (response.suggestedStandards || []).slice(0, 3).map((standard: any) => ({
          citation: standard?.citation,
          status: standard?.candidateStatus,
          confidence: standard?.confidence,
          confidenceBand: standard?.confidenceBand,
        })),
        primaryStandards: (response.primaryStandards || []).slice(0, 3).map((standard: any) => ({
          citation: standard?.citation,
          status: standard?.candidateStatus,
          confidence: standard?.confidence,
          confidenceBand: standard?.confidenceBand,
        })),
        followUpQuestions: questions,
      }, null, 2));
    }

    if (response.requiresHumanReview !== true) {
      throw new Error(`Expected requiresHumanReview to remain true for "${input}"`);
    }
    const rootConfidence = typeof response.confidence === 'number'
      ? response.confidence
      : typeof confidenceIntelligence?.overallConfidence === 'number'
        ? confidenceIntelligence.overallConfidence
        : NaN;
    const rootConfidenceBand = String(response.confidenceBand || confidenceIntelligence?.confidenceBand || '');
    if (!Number.isFinite(rootConfidence) || rootConfidence > 0.5 || rootConfidenceBand !== 'low') {
      throw new Error(`Expected low confidence for "${input}", got confidence=${response.confidence} band=${response.confidenceBand} overall=${confidenceIntelligence?.overallConfidence} overallBand=${confidenceIntelligence?.confidenceBand}`);
    }
    if (guardrails?.advisoryOnly !== true || guardrails?.doesNotDeclareViolation !== true) {
      throw new Error(`Expected advisory guardrails to remain true for "${input}"`);
    }
    if (response.reviewStateLabel && !/review/i.test(response.reviewStateLabel)) {
      throw new Error(`Expected reviewStateLabel to remain review-oriented for "${input}", got "${response.reviewStateLabel}"`);
    }

    const expectedQuestionSignals = [
      /substance|contents|what (is|may be) (inside|leaking|stored)|identity/i,
      /label|labeled|missing label|unlabeled/i,
      /source|leak source|where is it coming from|release path|drain/i,
      /worker exposure|exposure|contact|inhalation|spill path|release pathway/i,
    ];
    if (!expectedQuestionSignals.some((pattern) => pattern.test(questionsJoined))) {
      throw new Error(`Expected targeted follow-up questions for "${input}" to ask about substance, labeling, source, drain/release pathway, or exposure. Got: ${questions.join(' | ')}`);
    }

    if (forbiddenFinalLanguage.test(JSON.stringify({
      classification: response.classification,
      explanation: response.explanation,
      standardsStatement: response.standardsStatement,
      questions: response.evidenceGapQuestions,
      reviewStateLabel: response.reviewStateLabel,
    }))) {
      throw new Error(`Expected no definitive violation language for "${input}"`);
    }

    const directCitationFound = suggestedCitations.some((citation) => /1910\.1200|hazard communication/i.test(citation));
    if (directCitationFound && !/container|leak|drain/.test(input)) {
      throw new Error(`Unexpected direct citation promotion for vague input "${input}"`);
    }
  };

  // Run Vague scenarios
  for (const tc of vagueScenarios) {
    console.log(`Running vague test ${tc.id}: "${tc.input}"`);
    try {
      const response = await service.classify(tc.input);

      // Entire serialized response check (excluding inferredPossibilities) for "panel looks bad"
      if (tc.input === 'panel looks bad') {
        const cleanResponseForSerialization = JSON.parse(JSON.stringify(response));
        const walkAndRemoveInferredPossibilities = (val: any) => {
          if (val && typeof val === 'object') {
            if (Array.isArray(val)) {
              val.forEach(walkAndRemoveInferredPossibilities);
            } else {
              delete val.inferredPossibilities;
              for (const key of Object.keys(val)) {
                walkAndRemoveInferredPossibilities(val[key]);
              }
            }
          }
        };
        walkAndRemoveInferredPossibilities(cleanResponseForSerialization);
        const serialized = JSON.stringify(cleanResponseForSerialization).toLowerCase();

        const forbiddenStrings = [
          "immediately stop all work",
          "lock out",
          "tag out",
          "approved covers",
          "blanks",
          "enclosure components",
          "dead-front",
          "filler",
          "knockout",
          "open slot",
          "replace damaged wiring",
          "permanent engineered solutions specific to hazard"
        ];

        for (const forbidden of forbiddenStrings) {
          if (serialized.includes(forbidden)) {
            throw new Error(`Expected serialized response (excluding inferredPossibilities) to not contain "${forbidden}", but it did!`);
          }
        }
      }

      // A1: Vague input flag should be true
      if (response.isVague !== true) {
        throw new Error(`Expected isVague to be true, got ${response.isVague}`);
      }

      // A2: suggestedStandards and supportingStandards must be empty
      if (response.suggestedStandards.length > 0 || response.supportingStandards.length > 0) {
        throw new Error(`Expected suggestedStandards and supportingStandards to be empty, got suggested: ${response.suggestedStandards.length}, supporting: ${response.supportingStandards.length}`);
      }

      // A3: Top-level evidenceGapQuestions must be non-empty
      if (!response.evidenceGapQuestions || response.evidenceGapQuestions.length === 0) {
        throw new Error(`Expected top-level evidenceGapQuestions to be non-empty`);
      }

      // A4: Primary hazard candidate matches the domain
      const primaryCandidate = response.inspectionIntelligence?.hazardCandidates?.[0];
      if (!primaryCandidate || primaryCandidate.domain !== tc.domain) {
        throw new Error(`Expected primary hazard candidate domain to be "${tc.domain}", got "${primaryCandidate?.domain}"`);
      }

      if (tc.input === 'leak near drain' || tc.input === 'open container') {
        assertHazComVagueBehavior(response, tc.input);
      }

      // A5: inspectionIntelligence correctiveActions must be populated with cautious interim reviews
      const correctiveActions = response.inspectionIntelligence?.correctiveActions;
      if (!correctiveActions || correctiveActions.immediate.length === 0) {
        throw new Error(`Expected inspectionIntelligence.correctiveActions to have immediate actions`);
      }

      // A6: permanentEngineering must be empty or generic
      const hasSpecificRepairLanguage = correctiveActions.permanentEngineering.some((act: string) => {
        const lower = act.toLowerCase();
        return tc.shouldNotMention.some(term => lower.includes(term));
      });
      if (hasSpecificRepairLanguage) {
        throw new Error(`Expected permanentEngineering to be generic, but got specific actions: ${correctiveActions.permanentEngineering.join('; ')}`);
      }

      // A7: Generated and Base action validation
      const actionsToCheck = [
        { name: 'generatedActions[0]', action: response.generatedActions?.[0] },
        { name: 'baseGeneratedActions[0]', action: response.baseGeneratedActions?.[0] },
      ];

      const allForbidden = [
        'exposed electrical equipment',
        'approved covers',
        'blanks',
        'enclosure components',
        'filler',
        'knockout',
        'dead-front',
        'open slot',
        'lock out',
        'tag out',
        'immediately stop all work',
        'permanent engineered solutions specific to hazard'
      ];

      for (const { name, action } of actionsToCheck) {
        if (!action) {
          throw new Error(`Expected ${name} to be defined`);
        }

        // 1. no referenceStandards
        if (action.referenceStandards && action.referenceStandards.length > 0) {
          throw new Error(`Expected ${name}.referenceStandards to be empty, got ${JSON.stringify(action.referenceStandards)}`);
        }

        // 2. no forbidden terms in title, description, or suggestedFixes
        const titleLower = (action.title || '').toLowerCase();
        const descLower = (action.description || '').toLowerCase();
        const fixes = action.suggestedFixes || [];

        for (const term of allForbidden) {
          if (titleLower.includes(term)) {
            throw new Error(`Expected ${name} title to not contain "${term}", but got "${action.title}"`);
          }
          if (descLower.includes(term)) {
            throw new Error(`Expected ${name} description to not contain "${term}", but got "${action.description}"`);
          }
          for (const fix of fixes) {
            if (fix.toLowerCase().includes(term)) {
              throw new Error(`Expected ${name} suggestedFixes to not contain "${term}", but got "${fix}"`);
            }
          }
        }

        // 3. suggestedFixes are vague-safe only
        const allowedVagueSubstrings = [
          'personnel', 'touching', 'operating', 'affected area', 'evaluated',
          'restrict access', 'damage', 'hazard exposure', 'suspected',
          'qualified safety professional', 'competent person', 'inspect', 'condition',
          'mark/flag', 'photos/details', 'maintain access', 'qualified review',
          'repair or replace', 'qualified electrical person'
        ];

        for (const fix of fixes) {
          const fixLower = fix.toLowerCase();
          const isAllowed = allowedVagueSubstrings.some(sub => fixLower.includes(sub));
          if (!isAllowed) {
            throw new Error(`Expected ${name} suggestedFix to be vague-safe only, but got: "${fix}"`);
          }
        }

        // 4. originalSuggestion does not leak shardCorrectiveActionPatterns with specific repair language
        const orig = action.originalSuggestion || {};
        if (orig.shardCorrectiveActionPatterns && orig.shardCorrectiveActionPatterns.length > 0) {
          const hasSpecificShardPattern = orig.shardCorrectiveActionPatterns.some((pattern: string) => {
            const patternLower = pattern.toLowerCase();
            return allForbidden.some(term => patternLower.includes(term));
          });
          if (hasSpecificShardPattern) {
            throw new Error(`Expected ${name}.originalSuggestion.shardCorrectiveActionPatterns to not leak specific repair language, got: ${JSON.stringify(orig.shardCorrectiveActionPatterns)}`);
          }
        }

        // Also check dca / correctiveActionReasoning / riskReasoning are empty or clean
        if (orig.dca && JSON.stringify(orig.dca).toLowerCase().includes('lockout')) {
          throw new Error(`Expected ${name}.originalSuggestion.dca to not leak specific LOTO controls`);
        }
        if (orig.correctiveActionReasoning && JSON.stringify(orig.correctiveActionReasoning).toLowerCase().includes('lockout')) {
          throw new Error(`Expected ${name}.originalSuggestion.correctiveActionReasoning to not leak specific LOTO controls`);
        }
      }

      // A9: Urgency should be cautious and not critical stop-work unless evidence supports it
      const generatedAction = response.generatedActions?.[0];
      if (generatedAction?.priority === 'CRITICAL' && !tc.input.includes('energized') && !tc.input.includes('exposed')) {
        throw new Error(`Expected priority to not be CRITICAL for vague input without direct danger, got ${generatedAction.priority}`);
      }

      // A10: Advisory guardrails are true
      const guardrails = response.inspectionIntelligence?.guardrails || response.standardsTraceability?.advisoryGuardrails;
      if (guardrails?.advisoryOnly !== true || guardrails?.doesNotDeclareViolation !== true) {
        throw new Error(`Expected advisoryOnly and doesNotDeclareViolation to be true in guardrails`);
      }

      // A11: No final violation language
      const humanText = JSON.stringify({
        actions: response.generatedActions,
        questions: response.evidenceGapQuestions,
        correctiveActions: response.inspectionIntelligence?.correctiveActions,
      });
      if (forbiddenFinalLanguage.test(humanText)) {
        throw new Error(`Expected no final violation/citation language to appear, but match found`);
      }

      console.log(`  [PASS] Test ${tc.id}`);
      passed++;
    } catch (e: any) {
      console.error(`  [FAIL] Test ${tc.id}: ${e.message}`);
      failed++;
    }
  }

  // Run Clear scenarios
  for (const tc of clearScenarios) {
    console.log(`Running clear preservation test ${tc.id}: "${tc.input}"`);
    try {
      const response = await service.classify(tc.input);

      // B1: should NOT be vague
      if (response.isVague === true) {
        throw new Error(`Expected isVague to be false`);
      }

      // B2: suggestedStandards or supportingStandards must contain target citation
      const standards = [
        ...response.suggestedStandards,
        ...response.supportingStandards,
      ];
      const hasCitation = standards.some(s => s.citation?.toLowerCase().includes(tc.expectedCitation.toLowerCase()));
      if (!hasCitation) {
        throw new Error(`Expected specific standard citation "${tc.expectedCitation}" to be suggested/supporting`);
      }

      // B3: specific corrective actions/fixes allowed
      const generatedAction = response.generatedActions?.[0];
      if (!generatedAction?.suggestedFixes || generatedAction.suggestedFixes.length === 0) {
        throw new Error(`Expected suggestedFixes to be populated for clear input`);
      }

      console.log(`  [PASS] Test ${tc.id}`);
      passed++;
    } catch (e: any) {
      console.error(`  [FAIL] Test ${tc.id}: ${e.message}`);
      failed++;
    }
  }

  // Run False Positive scenarios
  for (const tc of falsePositiveScenarios) {
    console.log(`Running false-positive test ${tc.id}: "${tc.input}"`);
    try {
      const response = await service.classify(tc.input);

      // C1: should NOT be vague
      if (response.isVague === true) {
        throw new Error(`Expected isVague to be false`);
      }

      // C2: should be no_hazard_signal or controlled
      const status = response.inspectionIntelligence?.conditionAssessment?.status;
      if (status !== 'no_hazard_signal' && status !== 'controlled') {
        throw new Error(`Expected status to be no_hazard_signal or controlled, got "${status}"`);
      }

      console.log(`  [PASS] Test ${tc.id}`);
      passed++;
    } catch (e: any) {
      console.error(`  [FAIL] Test ${tc.id}: ${e.message}`);
      failed++;
    }
  }

  console.log("\n==================================================");
  console.log(`Vague Output Coherence Regression Result: ${passed}/${passed + failed} passed`);
  console.log("==================================================\n");

  await ds.destroy();

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
