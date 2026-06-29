import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SafescopeV2Service } from '../src/safescope-v2/safescope-v2.service';

type Scenario = {
  name: string;
  text: string;
  scopes: string[];
  evidenceTexts: string[];
  expectedAnyClassification: string[];
  expectedAnyStandard: string[];
  expectedRiskBands: string[];
  mustMention: string[];
};

const scenarios: Scenario[] = [
  {
    name: 'MSHA conveyor tail pulley guarding exposure',
    text: 'At an aggregate mine, the tail pulley on a conveyor is missing guarding and miners walk near the pinch point during cleanup.',
    scopes: ['msha'],
    evidenceTexts: [
      'Conveyor tail pulley exposed',
      'Cleanup occurs near moving belt',
      'Aggregate mine plant',
    ],
    expectedAnyClassification: ['machine', 'guard', 'conveyor', 'pinch'],
    expectedAnyStandard: ['56.14107', '14107'],
    expectedRiskBands: ['High', 'Critical', 'Serious'],
    mustMention: ['guard', 'pinch'],
  },
  {
    name: 'OSHA GI damaged electrical cord',
    text: 'In a maintenance shop, an extension cord has damaged insulation and exposed conductors near a wet floor area.',
    scopes: ['osha_general_industry'],
    evidenceTexts: [
      'Cord insulation damaged',
      'Conductors visible',
      'Wet floor nearby',
    ],
    expectedAnyClassification: ['electrical', 'shock', 'cord'],
    expectedAnyStandard: ['1910'],
    expectedRiskBands: ['High', 'Critical', 'Serious', 'Medium'],
    mustMention: ['electrical', 'shock'],
  },
  {
    name: 'OSHA construction fall exposure',
    text: 'A worker is on an unprotected roof edge approximately 12 feet above the lower level with no guardrail or personal fall arrest system visible.',
    scopes: ['osha_construction'],
    evidenceTexts: [
      'Unprotected roof edge',
      'Approximately 12 feet high',
      'No guardrail visible',
      'No fall arrest visible',
    ],
    expectedAnyClassification: ['fall', 'height', 'roof'],
    expectedAnyStandard: ['1926'],
    expectedRiskBands: ['High', 'Critical', 'Serious'],
    mustMention: ['fall'],
  },
  {
    name: 'HazCom unlabeled used oil container',
    text: 'An open container of used oil is stored in a work area without a label or secondary containment.',
    scopes: ['osha_general_industry'],
    evidenceTexts: [
      'Open used oil container',
      'No label visible',
      'No secondary containment',
    ],
    expectedAnyClassification: ['chemical', 'hazcom', 'container', 'spill', 'environment'],
    expectedAnyStandard: ['1910', '1200'],
    expectedRiskBands: ['Medium', 'High', 'Serious'],
    mustMention: ['label', 'spill'],
  },
  {
    name: 'Mobile equipment pedestrian interaction',
    text: 'A loader is operating in the yard while pedestrians walk through the same travel path with no barricades, spotter, or marked separation.',
    scopes: ['msha', 'osha_general_industry'],
    evidenceTexts: [
      'Loader operating near pedestrians',
      'No barricades',
      'No marked pedestrian route',
    ],
    expectedAnyClassification: ['mobile', 'equipment', 'traffic', 'pedestrian', 'struck'],
    expectedAnyStandard: ['56', '1910'],
    expectedRiskBands: ['High', 'Critical', 'Serious'],
    mustMention: ['pedestrian', 'struck'],
  },
];

function stringify(value: any): string {
  return JSON.stringify(value || {}, null, 2).toLowerCase();
}

function getRiskText(result: any): string {
  return stringify({
    risk: result?.risk,
    riskBand: result?.riskBand,
    riskLevel: result?.riskLevel,
    severity: result?.severity,
    intelligence: result?.intelligence?.risk,
    riskAssessment: result?.riskAssessment,
  });
}

function getStandardText(result: any): string {
  return stringify({
    standard: result?.standard,
    standards: result?.standards,
    standardsReasoning: result?.standardsReasoning,
    applicableStandards: result?.applicableStandards,
    supportingStandards: result?.supportingStandards,
    primaryStandards: result?.primaryStandards,
    intelligence: result?.intelligence?.standardsReasoning,
  });
}

function assertContainsAny(label: string, haystack: string, needles: string[]) {
  const matched = needles.some((needle) => haystack.includes(needle.toLowerCase()));
  if (!matched) {
    throw new Error(`${label} missing expected signal. Expected one of: ${needles.join(', ')}`);
  }
}

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const service = app.get(SafescopeV2Service);

  const failures: string[] = [];
  const started = Date.now();

  for (const scenario of scenarios) {
    const caseStart = Date.now();

    try {
      const result = await service.classify(
        scenario.text,
        scenario.scopes,
        scenario.evidenceTexts,
        undefined,
        'production-readiness-workspace',
        undefined,
        undefined,
        {
          userId: 'production-readiness-user',
          workspaceId: 'production-readiness-workspace',
          role: 'safety_manager',
          planTier: 'expert',
          jurisdictionScopes: scenario.scopes,
          reviewerQualifications: ['production_readiness_validation'],
        } as any,
        false,
      );

      const allText = stringify(result);
      const riskText = getRiskText(result);
      const standardText = getStandardText(result);

      assertContainsAny(`${scenario.name}: classification`, allText, scenario.expectedAnyClassification);
      assertContainsAny(`${scenario.name}: standard`, standardText, scenario.expectedAnyStandard);
      assertContainsAny(`${scenario.name}: risk`, riskText, scenario.expectedRiskBands);
      for (const term of scenario.mustMention) {
        if (!allText.includes(term.toLowerCase())) {
          throw new Error(`${scenario.name}: missing required reasoning term "${term}"`);
        }
      }

      console.log(`✅ ${scenario.name} (${Date.now() - caseStart}ms)`);
    } catch (error: any) {
      const message = error?.message || String(error);
      failures.push(`${scenario.name}: ${message}`);
      console.log(`❌ ${scenario.name}: ${message}`);
    }
  }

  await app.close();

  const elapsed = Date.now() - started;
  console.log(`\nHazLenz production readiness completed in ${elapsed}ms.`);

  if (failures.length) {
    console.error('\nFailures:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('All HazLenz production readiness scenarios passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
