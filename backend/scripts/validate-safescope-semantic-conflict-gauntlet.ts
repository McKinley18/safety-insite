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
      reasoning: ['Stub context expansion for semantic conflict validation.'],
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
      reasoning: ['Stub evidence fusion for semantic conflict validation.'],
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
    return { id: 'semantic-conflict-gauntlet-snapshot-id' };
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

const service = new SafescopeV2Service(
  new StubActionEngine() as any,
  new StubEvidenceFusion() as any,
  new StubApplicableStandards() as any,
  { evaluate: async () => ({}) } as any,
  { evaluate: async () => ({}) } as any,
  { evaluate: async () => ({}) } as any,
  { evaluate: () => ({ mode: 'offline_limited_advisory', advisorySummary: 'Offline' }) } as any,
  { can: () => ({ allowed: true }) } as any,
  { route: async () => ({ domainId: 'unknown', confidence: 0 }) } as any,
  { getShardSummary: () => ({ citations: [] }) } as any,
);

type CaseExpectation = {
  id: string;
  text: string;
  scopes: string[];
  expectedEntityLabel: string;
  expectedCondition?: string;
  expectedLikelyDomainHint: string;
  expectedNegativeDomainHint?: string;
  expectedMechanismHint?: string;
  shouldConflictWithPrimaryDomain: boolean;
};

const cases: CaseExpectation[] = [
  {
    id: 'fire-extinguisher-label-not-legible-not-hazcom',
    text: 'Label on fire extinguisher is not legible.',
    scopes: ['osha_general'],
    expectedEntityLabel: 'fire extinguisher',
    expectedCondition: 'not_legible',
    expectedLikelyDomainHint: 'fire_protection',
    expectedNegativeDomainHint: 'hazard_communication',
    expectedMechanismHint: 'fire_extinguisher_access_failure',
    shouldConflictWithPrimaryDomain: false,
  },
  {
    id: 'chemical-container-missing-label-is-hazcom',
    text: 'Secondary chemical container has no label and SDS information is not available.',
    scopes: ['osha_general'],
    expectedEntityLabel: 'chemical container',
    expectedCondition: 'unlabeled',
    expectedLikelyDomainHint: 'hazard_communication',
    expectedNegativeDomainHint: 'fire_protection',
    expectedMechanismHint: 'chemical_exposure',
    shouldConflictWithPrimaryDomain: false,
  },
  {
    id: 'blocked-fire-extinguisher-is-fire-protection',
    text: 'Portable fire extinguisher is blocked by stored material and employees cannot access it.',
    scopes: ['osha_general'],
    expectedEntityLabel: 'portable fire extinguisher',
    expectedCondition: 'blocked',
    expectedLikelyDomainHint: 'fire_protection',
    expectedNegativeDomainHint: 'hazard_communication',
    expectedMechanismHint: 'fire_extinguisher_access_failure',
    shouldConflictWithPrimaryDomain: false,
  },
  {
    id: 'blocked-eyewash-is-emergency-equipment',
    text: 'Emergency eyewash station is blocked by boxes near the chemical use area.',
    scopes: ['osha_general'],
    expectedEntityLabel: 'eyewash station',
    expectedCondition: 'blocked',
    expectedLikelyDomainHint: 'emergency_response',
    expectedMechanismHint: 'emergency_equipment_unavailable',
    shouldConflictWithPrimaryDomain: false,
  },
  {
    id: 'unguarded-conveyor-is-machine-guarding',
    text: 'Unguarded conveyor tail pulley with employee access during cleanup.',
    scopes: ['msha_mnm_surface'],
    expectedEntityLabel: 'conveyor',
    expectedCondition: 'unguarded',
    expectedLikelyDomainHint: 'machine_guarding',
    expectedMechanismHint: 'rotating_equipment',
    shouldConflictWithPrimaryDomain: false,
  },
  {
    id: 'forklift-pedestrian-blind-spot-is-mobile-equipment',
    text: 'Forklift operating near pedestrians in a warehouse aisle with blind spot exposure and no traffic separation.',
    scopes: ['osha_general'],
    expectedEntityLabel: 'powered industrial truck',
    expectedLikelyDomainHint: 'mobile_equipment',
    expectedMechanismHint: 'pedestrian_strike',
    shouldConflictWithPrimaryDomain: false,
  },
  {
    id: 'ppe-not-worn-is-ppe',
    text: 'Employee grinding metal without safety glasses or face shield.',
    scopes: ['osha_general'],
    expectedEntityLabel: 'eye and face protection',
    expectedCondition: 'not_worn',
    expectedLikelyDomainHint: 'ppe',
    expectedMechanismHint: 'eye_face_ppe_gap',
    shouldConflictWithPrimaryDomain: false,
  },
  {
    id: 'unstable-stack-is-material-handling',
    text: 'Palletized material is stacked unevenly and leaning into employee aisle.',
    scopes: ['osha_general'],
    expectedEntityLabel: 'unstable stored material',
    expectedCondition: 'unstable',
    expectedLikelyDomainHint: 'material_handling',
    expectedMechanismHint: 'unstable_stack_collapse',
    shouldConflictWithPrimaryDomain: false,
  },
  {
    id: 'hot-work-is-hot-work-not-general-fire-extinguisher',
    text: 'Hot work cutting near combustibles without fire watch verified.',
    scopes: ['osha_general'],
    expectedEntityLabel: 'hot work',
    expectedLikelyDomainHint: 'welding_cutting_hot_work',
    expectedMechanismHint: 'fire_watch_gap',
    shouldConflictWithPrimaryDomain: false,
  },
  {
    id: 'confined-space-is-confined-space',
    text: 'Confined space entry started without atmospheric testing documented.',
    scopes: ['osha_general'],
    expectedEntityLabel: 'confined space',
    expectedLikelyDomainHint: 'confined_space',
    expectedMechanismHint: 'asphyxiation',
    shouldConflictWithPrimaryDomain: false,
  },
  {
    id: 'blocked-egress-is-emergency-preparedness',
    text: 'Emergency exit route is blocked by stored materials.',
    scopes: ['osha_general'],
    expectedEntityLabel: 'emergency egress route',
    expectedCondition: 'blocked',
    expectedLikelyDomainHint: 'emergency_preparedness',
    expectedMechanismHint: 'egress_blockage',
    shouldConflictWithPrimaryDomain: false,
  },
];

async function main() {
  let failures = 0;

  for (const testCase of cases) {
    const result = await service.classify(
      testCase.text,
      testCase.scopes,
      [],
      'standard_5x5',
      'semantic-conflict-gauntlet-workspace',
      [],
    );

    const semantic = result.semanticUnderstanding;
    const routing = result.semanticRouting;

    try {
      assert(Boolean(semantic), `${testCase.id}: missing semanticUnderstanding.`);
      assert(Boolean(routing), `${testCase.id}: missing semanticRouting.`);
      assert(Boolean(result.fieldOutput?.semanticRouting), `${testCase.id}: missing fieldOutput.semanticRouting.`);
      assert(Boolean(result.decisionSupportMetadata?.semanticRouting), `${testCase.id}: missing decisionSupportMetadata.semanticRouting.`);

      assert(
        semantic.primaryEntityLabel === testCase.expectedEntityLabel,
        `${testCase.id}: expected entity ${testCase.expectedEntityLabel}, got ${semantic.primaryEntityLabel}.`,
      );

      if (testCase.expectedCondition) {
        assert(
          semantic.primaryCondition === testCase.expectedCondition,
          `${testCase.id}: expected condition ${testCase.expectedCondition}, got ${semantic.primaryCondition}.`,
        );
      }

      assert(
        semantic.likelyDomainHints.includes(testCase.expectedLikelyDomainHint),
        `${testCase.id}: expected likely domain hint ${testCase.expectedLikelyDomainHint}, got ${semantic.likelyDomainHints.join(', ')}.`,
      );

      if (testCase.expectedNegativeDomainHint) {
        assert(
          semantic.negativeDomainHints.includes(testCase.expectedNegativeDomainHint),
          `${testCase.id}: expected negative domain hint ${testCase.expectedNegativeDomainHint}, got ${semantic.negativeDomainHints.join(', ')}.`,
        );
      }

      if (testCase.expectedMechanismHint) {
        assert(
          semantic.likelyMechanismHints.includes(testCase.expectedMechanismHint),
          `${testCase.id}: expected mechanism hint ${testCase.expectedMechanismHint}, got ${semantic.likelyMechanismHints.join(', ')}.`,
        );
      }

      assert(
        routing.conflictsWithPrimaryDomain === testCase.shouldConflictWithPrimaryDomain,
        `${testCase.id}: expected semantic conflict ${testCase.shouldConflictWithPrimaryDomain}, got ${routing.conflictsWithPrimaryDomain}. Primary=${routing.primaryDomain}, likely=${routing.likelyDomainHints?.join(', ')}, negative=${routing.negativeDomainHints?.join(', ')}.`,
      );

      assert(
        routing.boundary?.doesNotOverrideFinalClassification === true,
        `${testCase.id}: semantic routing must not override final classification.`,
      );

      assert(
        routing.boundary?.doesNotOverrideStandards === true,
        `${testCase.id}: semantic routing must not override standards.`,
      );

      console.log(`✅ ${testCase.id}`);
    } catch (error: any) {
      failures += 1;
      console.error(`❌ ${testCase.id}: ${error.message}`);
    }
  }

  if (failures > 0) {
    throw new Error(`${failures} semantic conflict gauntlet case(s) failed.`);
  }

  console.log('✅ SafeScope semantic conflict gauntlet validation passed.');
  console.log(`Scenario cases: ${cases.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
