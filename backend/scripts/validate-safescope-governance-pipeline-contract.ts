import { SafeScopeIntelligenceOrchestrator, SafeScopeIntelligenceOrchestratorInput } from '../src/safescope-v2/orchestration/intelligence-orchestrator.service';

const orchestrator = new SafeScopeIntelligenceOrchestrator();

async function validate() {
  const testCases: { name: string; input: SafeScopeIntelligenceOrchestratorInput }[] = [
    {
      name: 'Clear conveyor servicing / lockout',
      input: {
        fusedText: 'Maintenance employee clearing jam on energized conveyor. Equipment was not locked out and zero energy was not verified.',
        promotedPrimary: { classification: 'Machine Guarding', confidence: 0.9, risk: { riskScore: 15 } },
        classifierResult: { ambiguityWarnings: [] },
        evidenceTexts: [],
        expandedContext: {},
        primaryStandardsResult: { suggestedStandards: ['1910.147'] },
        generatedActions: [],
        additionalHazards: [],
      },
    },
    {
      name: 'Vague observation',
      input: {
        fusedText: 'Something looks dangerous here.',
        promotedPrimary: { classification: 'General', confidence: 0.3, risk: {} },
        classifierResult: { ambiguityWarnings: ['High ambiguity'] },
        evidenceTexts: [],
        expandedContext: {},
        primaryStandardsResult: { suggestedStandards: [] },
        generatedActions: [],
        additionalHazards: [],
      },
    },
    {
      name: 'Unclear jurisdiction floor hole',
      input: {
        fusedText: 'Worker near unprotected floor hole.',
        promotedPrimary: { classification: 'Fall Protection', confidence: 0.7, risk: { riskScore: 10 } },
        classifierResult: { ambiguityWarnings: [] },
        evidenceTexts: [],
        expandedContext: { agencyMode: 'unknown' },
        primaryStandardsResult: { suggestedStandards: [] },
        generatedActions: [],
        additionalHazards: [],
      },
    },
  ];

  for (const tc of testCases) {
    console.log(`Running test: ${tc.name}`);
    const result = await orchestrator.evaluate(tc.input);

    // Validate top-level fields
    const requiredFields = [
      'causalRiskReasoning', 'evidenceSufficiency', 'confidenceGovernance', 'outputPolicy', 
      'dca', 'hrlg', 'sbag', 'askig', 'akpwg', 'akrwg', 'observationUnderstanding', 'calibrationMeta'
    ];
    
    for (const field of requiredFields) {
      if (!(result as any)[field]) {
        console.error(`Missing required field: ${field}`);
        process.exit(1);
      }
    }

    // Validate advisory guardrails
    const governanceObjects = [
      'causalRiskReasoning', 'evidenceSufficiency', 'confidenceGovernance', 'outputPolicy', 
      'dca', 'hrlg', 'sbag', 'askig', 'akpwg', 'akrwg'
    ];
    
    for (const obj of governanceObjects) {
      const guardrails = (result as any)[obj].advisoryGuardrails;
      if (!guardrails.advisoryOnly || !guardrails.doesNotDeclareViolation || !guardrails.doesNotCreateCitation || !guardrails.requiresQualifiedReview) {
        console.error(`Advisory guardrails violated in: ${obj}`);
        process.exit(1);
      }
    }

    // Policy relationship checks
    if (result.outputPolicy.allowedLanguageStrength === 'questions_only' && result.dca.actionStrength !== 'questions_only') {
        console.error('Policy relationship violation: outputPolicy questions_only should block dca strong actions');
        process.exit(1);
    }
  }

  console.log('Governance Pipeline Contract Validation passed!');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
