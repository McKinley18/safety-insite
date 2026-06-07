import { SafescopeV2Service } from '../src/safescope-v2/safescope-v2.service';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

class StubActionEngine {
  async generateActionsFromReport() {
    return [
      {
        title: 'Verify fire extinguisher readiness',
        description: 'Confirm the extinguisher is accessible, identified, inspected, and ready for use.',
        priority: 'High',
        assignedRole: 'Safety Manager',
        dueDate: new Date('2030-01-01T00:00:00.000Z').toISOString(),
        suggestedFixes: ['Document inspection tag and label readability.'],
        verificationEvidence: ['photo of readable tag/label'],
      },
    ];
  }
}

class StubContextExpansion {
  expand() {
    return {
      reasoning: ['Stub context expansion for validation.'],
      location: 'Inspection Area',
    };
  }
}

class StubEvidenceFusion {
  synthesize(values: string[]) {
    return {
      combinedNarrative: values.filter(Boolean).join(' '),
      inferredThemes: [],
      signalDensity: values.join(' ').length,
      reasoning: ['Stub evidence fusion for validation.'],
    };
  }
}

class StubApplicableStandards {
  async suggest() {
    return [];
  }
}

class StubFeedbackService {
  async getWorkspaceStandardAdjustments() {
    return [];
  }
}

class StubReasoningSnapshotService {
  async createSnapshot() {
    return { id: 'validation-snapshot-id' };
  }
}

class StubKnowledgeService {
  async retrieveForHazard() {
    return {
      confidence: 0,
      matches: [],
      reasoning: {
        evidenceGaps: [],
      },
    };
  }
}

class StubStandardsIntelligenceService {}

class StubSupervisorValidationService {
  async getWorkspaceValidationSignals() {
    return [];
  }
}

class StubOrchestrator {
    async evaluate() {
        const observationUnderstanding = {
            primaryEntityLabel: 'fire extinguisher',
            primaryCondition: 'not_legible'
        };
        const semanticUnderstanding = {
            engine: 'test',
            mode: 'test',
            primaryEntityKind: 'emergency_equipment',
            primaryEntityLabel: 'fire extinguisher',
            primaryCondition: 'not_legible',
            likelyDomainHints: ['fire_protection'],
            likelyMechanismHints: ['fire_extinguisher_access_failure'],
            negativeDomainHints: ['hazard_communication'],
            evidenceGaps: [],
            confidence: 0.8,
            reasonCodes: [],
            boundary: { doesNotDeclareViolation: true }
        };
        const semanticRouting = {
            engine: 'safescope_semantic_routing_guard_v1',
            routingDisposition: 'test',
            boundary: { 
                doesNotOverrideFinalClassification: true,
                doesNotOverrideStandards: true
            },
            negativeDomainHints: ['hazard_communication'],
            conflictsWithPrimaryDomain: false
        };
        return {
            observationUnderstanding,
            semanticUnderstanding,
            semanticRouting,
            fieldOutput: {
                observationUnderstanding,
                semanticRouting
            },
            confidenceIntelligence: {
                overallConfidence: 0.8
            }
        };
    }
}

class StubVisualService {
    evaluate() { return {}; }
}

class StubImageService {
    evaluate() { return {}; }
}

class StubOfflineService {
    evaluate() { return {}; }
}

async function main() {
  const service = new SafescopeV2Service(
    new StubActionEngine() as any,
    new StubContextExpansion() as any,
    new StubEvidenceFusion() as any,
    new StubApplicableStandards() as any,
    new StubFeedbackService() as any,
    new StubReasoningSnapshotService() as any,
    new StubKnowledgeService() as any,
    new StubStandardsIntelligenceService() as any,
    new StubSupervisorValidationService() as any,
    new StubOrchestrator() as any,
    new StubVisualService() as any,
    new StubImageService() as any,
    new StubOfflineService() as any,
  );

  const result = await service.classify(
    'Label on fire extinguisher is not legible.',
    ['osha_general'],
    [],
    'standard_5x5',
    'validation-workspace',
    [],
  );

  assert(Boolean(result.semanticUnderstanding), 'Expected top-level semanticUnderstanding.');
  assert(Boolean(result.observationUnderstanding), 'Expected top-level observationUnderstanding.');
  assert(Boolean(result.fieldOutput?.observationUnderstanding), 'Expected fieldOutput.observationUnderstanding.');
  assert(Boolean(result.semanticRouting), 'Expected top-level semanticRouting.');
  assert(Boolean(result.fieldOutput?.semanticRouting), 'Expected fieldOutput.semanticRouting.');

  assert(
    result.semanticUnderstanding.primaryEntityLabel === 'fire extinguisher',
    'Expected fire extinguisher entity label, got ' + result.semanticUnderstanding.primaryEntityLabel,
  );

  assert(
    result.semanticUnderstanding.primaryCondition === 'not_legible',
    'Expected not_legible condition, got ' + result.semanticUnderstanding.primaryCondition,
  );

  assert(
    result.semanticUnderstanding.negativeDomainHints.includes('hazard_communication'),
    'Expected hazard_communication negative domain hint for extinguisher label case.',
  );

  assert(
    result.semanticUnderstanding.likelyMechanismHints.includes('fire_extinguisher_access_failure'),
    'Expected fire_extinguisher_access_failure mechanism hint.',
  );

  assert(
    result.fieldOutput.observationUnderstanding.primaryEntityLabel === 'fire extinguisher',
    'Expected field output to expose fire extinguisher semantic understanding.',
  );

  assert(
    result.decisionSupportMetadata?.semanticUnderstanding?.primaryCondition === 'not_legible',
    'Expected decisionSupportMetadata to expose semantic understanding.',
  );

  assert(
    result.semanticUnderstanding.boundary?.doesNotDeclareViolation === true,
    'Semantic understanding must not declare violations.',
  );

  assert(
    result.semanticRouting.engine === 'safescope_semantic_routing_guard_v1',
    'Expected semantic routing guard engine.',
  );

  assert(
    result.semanticRouting.boundary?.doesNotOverrideFinalClassification === true,
    'Semantic routing guard must not override final classification.',
  );

  assert(
    result.semanticRouting.boundary?.doesNotOverrideStandards === true,
    'Semantic routing guard must not override standards.',
  );

  assert(
    result.semanticRouting.negativeDomainHints.includes('hazard_communication'),
    'Expected semantic routing guard to preserve HazCom negative domain hint.',
  );

  assert(
    result.semanticRouting.conflictsWithPrimaryDomain === false,
    'Fire extinguisher case should not conflict with final fire-protection domain.',
  );

  assert(
    result.fieldOutput.semanticRouting.routingDisposition === result.semanticRouting.routingDisposition,
    'Expected field output semantic routing disposition to match top-level routing disposition.',
  );

  assert(
    result.decisionSupportMetadata?.semanticRouting?.engine === 'safescope_semantic_routing_guard_v1',
    'Expected decisionSupportMetadata to expose semantic routing guard.',
  );

  console.log('✅ SafeScope main output observation understanding validation passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
