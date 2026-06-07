import { SafescopeV2Service } from '../src/safescope-v2/safescope-v2.service';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

class StubActionEngine {
  async generateActionsFromReport() {
    return [
      {
        title: 'Verify condition and correct the hazard',
        description: 'Confirm the observed condition, apply appropriate controls, and document verification.',
        priority: 'High',
        assignedRole: 'Safety Manager',
        dueDate: new Date('2030-01-01T00:00:00.000Z').toISOString(),
        suggestedFixes: ['Document correction with photo or inspection evidence.'],
        verificationEvidence: ['photo evidence', 'supervisor verification'],
      },
    ];
  }
}

class StubContextExpansion {
  expand() {
    return {
      reasoning: ['Stub context expansion for observation trace validation.'],
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
      reasoning: ['Stub evidence fusion for observation trace validation.'],
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
    return { id: 'observation-trace-snapshot-id' };
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

const cases = [
  {
    id: 'fire-extinguisher-label',
    text: 'Label on fire extinguisher is not legible.',
    scopes: ['osha_general'],
  },
  {
    id: 'chemical-container-label',
    text: 'Secondary chemical container has no label and SDS information is not available.',
    scopes: ['osha_general'],
  },
  {
    id: 'machine-guarding-conveyor',
    text: 'Unguarded conveyor tail pulley with employee access during cleanup.',
    scopes: ['msha_mnm_surface'],
  },
  {
    id: 'mobile-equipment-pedestrian',
    text: 'Forklift operating near pedestrians in a warehouse aisle with blind spot exposure and no traffic separation.',
    scopes: ['osha_general'],
  },
  {
    id: 'fall-exposure-open-edge',
    text: 'Open edge on elevated platform with employees working nearby and no guardrail visible.',
    scopes: ['osha_construction'],
  },
  {
    id: 'ppe-eye-face',
    text: 'Employee grinding metal without safety glasses or face shield.',
    scopes: ['osha_general'],
  },
  {
    id: 'material-handling-stack',
    text: 'Palletized material is stacked unevenly and leaning into an employee aisle.',
    scopes: ['osha_general'],
  },
  {
    id: 'confined-space-atmosphere',
    text: 'Confined space entry started without atmospheric testing or entry controls.',
    scopes: ['osha_general'],
  },
  {
    id: 'blocked-egress',
    text: 'Emergency exit route is blocked by stored material.',
    scopes: ['osha_general'],
  },
];

async function main() {
  const traces: any[] = [];

  for (const testCase of cases) {
    const result = await service.classify(
      testCase.text,
      testCase.scopes,
      [],
      'standard_5x5',
      'observation-trace-workspace',
      [],
    );

    assert(Boolean(result.semanticUnderstanding), testCase.id + ': missing semanticUnderstanding.');
    assert(Boolean(result.semanticRouting), testCase.id + ': missing semanticRouting.');
    assert(Boolean(result.fieldOutput?.observationUnderstanding), testCase.id + ': missing fieldOutput observation understanding.');
    assert(Boolean(result.fieldOutput?.semanticRouting), testCase.id + ': missing fieldOutput semantic routing.');

    assert(
      result.semanticUnderstanding.boundary?.doesNotDeclareViolation === true,
      testCase.id + ': semantic understanding must not declare violations.',
    );

    assert(
      result.semanticRouting.boundary?.doesNotOverrideFinalClassification === true,
      testCase.id + ': semantic routing must not override final classification.',
    );

    assert(
      result.semanticRouting.boundary?.doesNotOverrideStandards === true,
      testCase.id + ': semantic routing must not override standards.',
    );

    traces.push({
      id: testCase.id,
      classification: result.classification,
      entity: result.semanticUnderstanding.primaryEntityLabel,
      entityKind: result.semanticUnderstanding.primaryEntityKind,
      condition: result.semanticUnderstanding.primaryCondition,
      likelyDomains: result.semanticUnderstanding.likelyDomainHints,
      likelyMechanisms: result.semanticUnderstanding.likelyMechanismHints,
      negativeDomains: result.semanticUnderstanding.negativeDomainHints,
      routingPrimaryDomain: result.semanticRouting.primaryDomain,
      routingDisposition: result.semanticRouting.routingDisposition,
      conflictsWithPrimaryDomain: result.semanticRouting.conflictsWithPrimaryDomain,
      requiresHumanReview: result.requiresHumanReview,
    });
  }

  console.log('✅ SafeScope observation trace snapshot validation passed.');
  console.log('Trace cases: ' + traces.length);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
