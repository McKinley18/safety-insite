import { SafescopeV2Service } from '../src/safescope-v2/safescope-v2.service';
import { ActionEngineService } from '../src/action-engine/action-engine.service';
import { ContextExpansionService } from '../src/safescope-v2/context/context-expansion.service';
import { EvidenceFusionService } from '../src/safescope-v2/evidence/evidence-fusion.service';
import { ApplicableStandardsService } from '../src/applicable-standards/applicable-standards.service';
import { SafeScopeFeedbackService } from '../src/safescope-v2/feedback/safescope-feedback.service';
import { ReasoningSnapshotService } from '../src/safescope-v2/snapshots/reasoning-snapshot.service';
import { SafeScopeKnowledgeService } from '../src/safescope-knowledge/safescope-knowledge.service';
import { StandardsIntelligenceService } from '../src/safescope-v2/standards-intelligence/standards-intelligence.service';
import { SafeScopeIntelligenceOrchestrator } from '../src/safescope-v2/orchestration/intelligence-orchestrator.service';
import { WorkspaceGovernanceAccessService } from '../src/safescope-v2/workspace-governance-access/workspace-governance-access.service';

type Scenario = {
  name: string;
  text: string;
  scopes: string[];
  expectedTerms: string[];
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`SafeScope field output scenario validation failed: ${message}`);
  }
}

function normalize(value: unknown): string {
  return String(value || '').toLowerCase();
}

function asArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function assertNonEmptyString(value: unknown, label: string) {
  assert(typeof value === 'string' && value.trim().length > 0, `${label} must be a non-empty string.`);
}

function assertStringArray(value: unknown, label: string) {
  assert(Array.isArray(value), `${label} must be an array.`);
  for (const item of value as unknown[]) {
    assertNonEmptyString(item, `${label} item`);
  }
}

function validateFieldOutputShape(result: any, scenarioName: string) {
  const fieldOutput = result?.fieldOutput;

  assert(fieldOutput, `${scenarioName}: fieldOutput is missing`);
  assert(fieldOutput.version === 'field_output_v1', `${scenarioName}: fieldOutput.version must be field_output_v1`);

  assertNonEmptyString(fieldOutput.primaryMessage, `${scenarioName}: fieldOutput.primaryMessage`);
  assertNonEmptyString(fieldOutput.summary, `${scenarioName}: fieldOutput.summary`);
  assertNonEmptyString(fieldOutput.priority, `${scenarioName}: fieldOutput.priority`);
  assertNonEmptyString(fieldOutput.recommendedDisposition, `${scenarioName}: fieldOutput.recommendedDisposition`);

  assertStringArray(fieldOutput.immediateControls, `${scenarioName}: fieldOutput.immediateControls`);
  assertStringArray(fieldOutput.verificationEvidence, `${scenarioName}: fieldOutput.verificationEvidence`);
  assertStringArray(fieldOutput.evidenceGaps, `${scenarioName}: fieldOutput.evidenceGaps`);
  assertStringArray(fieldOutput.supervisorQuestions, `${scenarioName}: fieldOutput.supervisorQuestions`);
  assertStringArray(fieldOutput.warnings, `${scenarioName}: fieldOutput.warnings`);

  assert(Array.isArray(fieldOutput.correctiveActions), `${scenarioName}: fieldOutput.correctiveActions must be an array`);
  assert(fieldOutput.correctiveActions.length > 0, `${scenarioName}: fieldOutput.correctiveActions must not be empty`);

  for (const action of fieldOutput.correctiveActions) {
    assertNonEmptyString(action.title, `${scenarioName}: corrective action title`);
    assertNonEmptyString(action.description, `${scenarioName}: corrective action description`);
    assertNonEmptyString(action.priority, `${scenarioName}: corrective action priority`);
    assertStringArray(action.suggestedFixes, `${scenarioName}: corrective action suggestedFixes`);
    assertNonEmptyString(action.verification, `${scenarioName}: corrective action verification`);
    assertNonEmptyString(action.source, `${scenarioName}: corrective action source`);
  }

  assert(fieldOutput.boundary?.requiresQualifiedReview === true, `${scenarioName}: requiresQualifiedReview must be true`);
  assert(fieldOutput.boundary?.canDeclareViolation === false, `${scenarioName}: canDeclareViolation must be false`);
  assert(fieldOutput.boundary?.canBypassHumanReview === false, `${scenarioName}: canBypassHumanReview must be false`);
}

function createMockService() {
  const actionEngine = {
    generateActionsFromReport: async (input: any) => {
      const text = normalize(
        [
          input?.description,
          input?.category,
          input?.safeScope?.classification,
          input?.safeScope?.mechanism,
        ].join(' '),
      );

      let title = 'Correct identified hazard';
      let fixes = ['Restrict exposure.', 'Correct condition.', 'Verify closure.'];

      if (text.includes('chemical') || text.includes('hazcom')) {
        title = 'Correct chemical hazard communication and storage controls';
        fixes = ['Label containers.', 'Verify SDS access.', 'Segregate incompatible chemicals where needed.'];
      } else if (text.includes('dust') || text.includes('silica')) {
        title = 'Control dust exposure and verify controls';
        fixes = ['Use wet methods or dust collection.', 'Evaluate respiratory protection.', 'Verify exposure controls.'];
      } else if (text.includes('mobile') || text.includes('pedestrian')) {
        title = 'Separate pedestrians from mobile equipment';
        fixes = ['Stop equipment movement until controls are established.', 'Create pedestrian separation.', 'Verify alarms, visibility, or spotter controls.'];
      } else if (text.includes('lockout') || text.includes('loto') || text.includes('energy')) {
        title = 'Apply lockout and verify zero energy';
        fixes = ['Stop servicing work.', 'Apply lockout/tagout.', 'Verify zero energy before work resumes.'];
      } else if (text.includes('fall') || text.includes('guardrail') || text.includes('stairway')) {
        title = 'Install fall protection or access controls';
        fixes = ['Restrict access.', 'Install required fall protection or handrail.', 'Inspect before use.'];
      } else if (text.includes('confined')) {
        title = 'Stop entry and implement confined space controls';
        fixes = ['Stop entry.', 'Test atmosphere.', 'Verify permit, attendant, and rescue controls.'];
      } else if (text.includes('electrical') || text.includes('energized')) {
        title = 'Control electrical exposure';
        fixes = ['Restrict access.', 'De-energize where required.', 'Verify qualified repair or guarding.'];
      } else if (text.includes('guard') || text.includes('conveyor')) {
        title = 'Guard exposed moving machine parts';
        fixes = ['Stop access to exposed moving parts.', 'Install or repair guarding.', 'Verify guard before operation.'];
      }

      return [
        {
          title,
          description: `${title}. Document correction and verification before closure.`,
          priority: 'HIGH',
          assignedRole: 'Safety Manager',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          suggestedFixes: fixes,
          verification: 'Photo evidence and supervisor verification required before closure.',
        },
      ];
    },
  } as unknown as ActionEngineService;

  const applicableStandards = {
    suggest: async (input: any) => {
      const text = normalize([input?.text, input?.description, input?.classification].join(' '));

      if (text.includes('chemical') || text.includes('hazcom') || text.includes('unlabeled')) {
        return [
          {
            citation: text.includes('unlabeled') ? '29 CFR 1910.1200(f)(1)' : '29 CFR 1910.1200',
            agencyCode: 'OSHA',
            scopeCode: 'OSHA_GENERAL_INDUSTRY',
            summary: 'Hazard communication requirements for labels, SDS, and chemical hazard information.',
            heading: 'Hazard communication',
            score: 90,
            confidence: 0.9,
            matchingReasons: ['Chemical hazard communication context detected.'],
          },
        ];
      }

      if (text.includes('silica') || text.includes('dust')) {
        return [
          {
            citation: '30 CFR 56.5001',
            agencyCode: 'MSHA',
            scopeCode: 'MSHA_MNM_SURFACE',
            summary: 'Exposure to airborne contaminants shall not exceed limits.',
            heading: 'Exposure limits for airborne contaminants',
            score: 90,
            confidence: 0.9,
            matchingReasons: ['Dust exposure context detected.'],
          },
        ];
      }

      if (text.includes('mobile') || text.includes('forklift') || text.includes('pedestrian')) {
        return [
          {
            citation: '29 CFR 1910.178(l)',
            agencyCode: 'OSHA',
            scopeCode: 'OSHA_GENERAL_INDUSTRY',
            summary: 'Powered industrial truck operator training and safe operation controls.',
            heading: 'Powered industrial trucks',
            score: 90,
            confidence: 0.9,
            matchingReasons: ['Mobile equipment and pedestrian interface detected.'],
          },
        ];
      }

      if (text.includes('confined')) {
        return [
          {
            citation: '29 CFR 1910.146(c)(1)',
            agencyCode: 'OSHA',
            scopeCode: 'OSHA_GENERAL_INDUSTRY',
            summary: 'Evaluate the workplace to determine permit-required confined spaces.',
            heading: 'Permit-required confined spaces',
            score: 90,
            confidence: 0.9,
            matchingReasons: ['Confined space entry context detected.'],
          },
        ];
      }

      if (text.includes('electrical') || text.includes('energized')) {
        return [
          {
            citation: '29 CFR 1910.303(g)(2)(i)',
            agencyCode: 'OSHA',
            scopeCode: 'OSHA_GENERAL_INDUSTRY',
            summary: 'Guard live electrical parts against accidental contact.',
            heading: 'Guarding live parts',
            score: 90,
            confidence: 0.9,
            matchingReasons: ['Electrical exposure context detected.'],
          },
        ];
      }

      if (text.includes('fall') || text.includes('stairway') || text.includes('handrail')) {
        return [
          {
            citation: text.includes('stairway') ? '29 CFR 1926.1052(c)(1)' : '29 CFR 1926.501(b)(1)',
            agencyCode: 'OSHA',
            scopeCode: 'OSHA_CONSTRUCTION',
            summary: 'Fall protection or stair rail/handrail controls are required where applicable.',
            heading: 'Fall protection',
            score: 90,
            confidence: 0.9,
            matchingReasons: ['Fall exposure or stairway access context detected.'],
          },
        ];
      }

      return [
        {
          citation: '30 CFR 56.14107(a)',
          agencyCode: 'MSHA',
          scopeCode: 'MSHA_MNM_SURFACE',
          summary: 'Moving machine parts must be guarded.',
          heading: 'Moving machine parts',
          score: 90,
          confidence: 0.9,
          matchingReasons: ['Machine guarding context detected.'],
        },
      ];
    },
  } as unknown as ApplicableStandardsService;

  const feedbackService = {
    getWorkspaceStandardAdjustments: async () => [],
  } as unknown as SafeScopeFeedbackService;

  const reasoningSnapshotService = {
    createSnapshot: async () => ({ id: 'test-field-output-snapshot-id' }),
  } as unknown as ReasoningSnapshotService;

  const safeScopeKnowledge = {
    retrieveForHazard: async (input: any) => ({
      confidence: 0.85,
      matches: [
        {
          chunkId: 'field-output-chunk-1',
          documentId: 'field-output-doc-1',
          title: 'Representative SafeScope reference',
          agency: input?.jurisdiction || 'OSHA',
          sourceType: 'regulation',
          authorityTier: 1,
          citation: input?.citation || '30 CFR 56.14107(a)',
          sourceUrl: null,
          sectionHeading: 'Representative safety reference',
          excerpt: 'Representative source text for scenario validation.',
          tags: [String(input?.hazardDomain || 'safescope').toLowerCase()],
          score: 90,
          reason: 'Matched representative scenario context.',
        },
      ],
      reasoning: {
        evidenceGaps: ['Confirm task, exposure, control status, and verification evidence.'],
        caution: 'Qualified review remains required for final compliance decisions.',
      },
    }),
  } as unknown as SafeScopeKnowledgeService;

  const supervisorValidationService = {
    getWorkspaceValidationSignals: async () => [],
  };

  const mockIntelligenceOrchestrator = {
    evaluate: async (input: any) => {
      const correctiveActions = (input.generatedActions || []).map((action: any) => ({
        title: action.title || 'Correct identified hazard',
        description: action.description || 'Correct identified hazard description',
        priority: action.priority || 'high',
        suggestedFixes: action.suggestedFixes || ['Verify safety controls'],
        verification: action.verification || 'Supervisor verification of correction',
        source: action.source || 'SafeScope Brain',
      }));

      if (correctiveActions.length === 0) {
        correctiveActions.push({
          title: 'Correct identified hazard',
          description: 'Correct identified hazard description',
          priority: 'high',
          suggestedFixes: ['Verify safety controls'],
          verification: 'Supervisor verification of correction',
          source: 'SafeScope Brain',
        });
      }

      return {
        fieldOutput: {
          version: 'field_output_v1',
          primaryMessage: 'Exposure detected requiring corrective action.',
          summary: 'A field observation matches standard hazard domains and requires dynamic mitigation control.',
          priority: 'high',
          recommendedDisposition: 'Qualified Review',
          immediateControls: ['Isolate source', 'Restrict access'],
          verificationEvidence: ['Supervisor verification of correction'],
          evidenceGaps: ['Confirm task status'],
          supervisorQuestions: ['What is the verification evidence?'],
          warnings: ['SafeScope is advisory only'],
          correctiveActions,
          boundary: {
            requiresQualifiedReview: true,
            canDeclareViolation: false,
            canBypassHumanReview: false,
          },
        },
        semanticUnderstanding: {
          confidence: 0.9,
          classification: input.promotedPrimary?.classification || 'machine_guarding',
        },
        semanticRouting: {
          likelyJurisdiction: 'msha',
        },
      };
    },
  } as unknown as SafeScopeIntelligenceOrchestrator;

  return new SafescopeV2Service(
    actionEngine,
    new ContextExpansionService(),
    new EvidenceFusionService(),
    applicableStandards,
    feedbackService,
    reasoningSnapshotService,
    safeScopeKnowledge,
    {} as StandardsIntelligenceService,
    supervisorValidationService as any,
    mockIntelligenceOrchestrator,
    {} as any,
    {} as any,
    {} as any,
    new WorkspaceGovernanceAccessService(),
  );
}

const scenarios: Scenario[] = [
  {
    name: 'machine guarding',
    text: 'Conveyor tail pulley has an exposed moving pinch point and missing guard while miners work nearby.',
    scopes: ['msha_mnm_surface'],
    expectedTerms: ['guard', 'verify'],
  },
  {
    name: 'HazCom unlabeled container',
    text: 'Unlabeled secondary chemical container found in general industry work area with no identity or hazard label.',
    scopes: ['osha_general'],
    expectedTerms: ['label', 'sds'],
  },
  {
    name: 'chemical storage',
    text: 'Incompatible chemicals are stored together in a chemical cabinet without segregation or secondary containment.',
    scopes: ['osha_general'],
    expectedTerms: ['segregate', 'secondary'],
  },
  {
    name: 'silica dust',
    text: 'Crusher operator exposed to visible silica-containing dust with water spray not operating and no sampling available.',
    scopes: ['msha_mnm_surface'],
    expectedTerms: ['dust', 'verify'],
  },
  {
    name: 'mobile equipment pedestrian',
    text: 'Forklift operating near pedestrians with no separation, no spotter, and limited visibility at the aisle intersection.',
    scopes: ['osha_general'],
    expectedTerms: ['pedestrian', 'separation'],
  },
  {
    name: 'LOTO',
    text: 'Maintenance employee clearing jammed equipment without lockout tagout or zero energy verification.',
    scopes: ['osha_general'],
    expectedTerms: ['lockout', 'zero'],
  },
  {
    name: 'fall protection',
    text: 'Employee working near an unprotected elevated edge without guardrails or fall arrest system.',
    scopes: ['osha_construction'],
    expectedTerms: ['fall', 'guardrail'],
  },
  {
    name: 'confined space',
    text: 'Employee entering confined space with no atmospheric testing, attendant, permit, or rescue plan documented.',
    scopes: ['osha_general'],
    expectedTerms: ['entry', 'atmosphere'],
  },
  {
    name: 'electrical',
    text: 'Exposed energized electrical conductors are accessible to employees due to an open damaged panel.',
    scopes: ['osha_general'],
    expectedTerms: ['electrical', 'restrict'],
  },
];

async function main() {
  const service = createMockService();
  const summaries: string[] = [];

  for (const scenario of scenarios) {
    const result: any = await service.classify(
      scenario.text,
      scenario.scopes,
      ['Photo evidence or field note attached.'],
      'standard_5x5',
      'test-workspace',
      [],
    );

    validateFieldOutputShape(result, scenario.name);

    const combinedOutput = normalize(
      [
        result.fieldOutput.primaryMessage,
        result.fieldOutput.summary,
        ...asArray(result.fieldOutput.immediateControls),
        ...asArray(result.fieldOutput.verificationEvidence),
        ...asArray(result.fieldOutput.evidenceGaps),
        ...asArray(result.fieldOutput.supervisorQuestions),
        ...asArray(result.fieldOutput.warnings),
        ...asArray(result.fieldOutput.correctiveActions).flatMap((action: any) => [
          action.title,
          action.description,
          action.verification,
          ...asArray(action.suggestedFixes),
        ]),
      ].join(' '),
    );

    const matchedTerms = scenario.expectedTerms.filter((term) =>
      combinedOutput.includes(term.toLowerCase()),
    );

    assert(
      matchedTerms.length > 0,
      `${scenario.name}: fieldOutput did not include any expected terms: ${scenario.expectedTerms.join(', ')}`,
    );

    summaries.push(
      `${scenario.name}: ${result.fieldOutput.priority} | ${result.fieldOutput.correctiveActions.length} action(s) | ${matchedTerms.join(', ')}`,
    );
  }

  console.log('✅ SafeScope field output scenario validation passed.');
  console.log(`Scenarios: ${scenarios.length}`);
  for (const summary of summaries) {
    console.log(`- ${summary}`);
  }
}

main().catch((error) => {
  console.error('❌ SafeScope field output scenario validation failed.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
