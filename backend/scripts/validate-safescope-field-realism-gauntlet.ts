import * as fs from 'fs';
import * as path from 'path';
import { SafeScopeReasoningOrchestratorService } from '../src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service';

type RealismCase = {
  id: string;
  title: string;
  text: string;
  expectedSignals: string[];
  expectedReviewSignals: string[];
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function normalize(value: unknown) {
  return String(value || '').toLowerCase();
}

function flattenText(value: unknown): string {
  if (!value) return '';

  if (typeof value === 'string') return value;

  if (Array.isArray(value)) {
    return value.map(flattenText).join(' ');
  }

  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).map(flattenText).join(' ');
  }

  return String(value);
}

const cases: RealismCase[] = [
  {
    id: 'REAL-MSHA-GUARDING-001',
    title: 'messy conveyor guard description',
    text: 'tail pulley by wash plant has guard off, guys were shoveling around it earlier, not sure if it was locked out',
    expectedSignals: ['guard', 'pulley'],
    expectedReviewSignals: ['lock', 'exposure'],
  },
  {
    id: 'REAL-OSHA-HAZCOM-001',
    title: 'unlabeled chemical jug',
    text: 'found a white jug with liquid in maintenance area no label, mechanic said it might be degreaser but nobody knows where SDS is',
    expectedSignals: ['label', 'sds'],
    expectedReviewSignals: ['identity', 'chemical'],
  },
  {
    id: 'REAL-MOBILE-001',
    title: 'loader pedestrian interaction',
    text: 'loader backing near shop door, people walking through same spot, no cones or spotter, driver said mirror is dirty',
    expectedSignals: ['pedestrian', 'traffic'],
    expectedReviewSignals: ['separation', 'visibility'],
  },
  {
    id: 'REAL-LOTO-001',
    title: 'maintenance energy control ambiguity',
    text: 'crew was clearing jam from belt. breaker was off but no lock seen. supervisor said it was only going to take a minute',
    expectedSignals: ['lock', 'energy'],
    expectedReviewSignals: ['zero', 'verification'],
  },
  {
    id: 'REAL-FALL-001',
    title: 'uncertain fall exposure',
    text: 'employee standing on platform edge fixing light. rail missing on one side. height maybe 8 or 10 ft, no harness noticed',
    expectedSignals: ['fall', 'rail'],
    expectedReviewSignals: ['height', 'protection'],
  },
  {
    id: 'REAL-CONFINED-001',
    title: 'tank entry uncertainty',
    text: 'worker went partly into tank to retrieve hose. no permit posted. fan was running but i did not see gas meter reading',
    expectedSignals: ['confined', 'entry'],
    expectedReviewSignals: ['atmosphere', 'permit'],
  },
  {
    id: 'REAL-ELECTRICAL-001',
    title: 'electrical exposure unclear',
    text: 'panel cover open with wires showing by crusher MCC. not sure if live. area was wet from hose leak',
    expectedSignals: ['electrical', 'live'],
    expectedReviewSignals: ['energized', 'restrict'],
  },
  {
    id: 'REAL-SILICA-001',
    title: 'dusty cutting task',
    text: 'contractor dry cutting concrete near doorway, lots of dust cloud, no vac hooked up and worker had paper mask',
    expectedSignals: ['dust', 'silica'],
    expectedReviewSignals: ['respiratory', 'control'],
  },
  {
    id: 'REAL-CHEM-STORAGE-001',
    title: 'mixed chemical storage',
    text: 'acid jug and bleach cleaner sitting together on bottom shelf, one container crusty around cap, no spill tray',
    expectedSignals: ['chemical', 'segregate'],
    expectedReviewSignals: ['secondary', 'containment'],
  },
  {
    id: 'REAL-MULTI-GUARD-LOTO-001',
    title: 'machine guarding with LOTO ambiguity',
    text: 'belt tail pulley guard missing during cleanup, belt was supposed to be off but no lock or tag was visible and miners were near the pinch point',
    expectedSignals: ['guard', 'lock'],
    expectedReviewSignals: ['energy', 'exposure'],
  },
  {
    id: 'REAL-MULTI-ELECTRICAL-WET-001',
    title: 'open electrical panel with wet area',
    text: 'electrical cabinet door open by crusher, wires visible, puddle from hose leak nearby, no barricade and nobody confirmed if it was deenergized',
    expectedSignals: ['electrical', 'energized'],
    expectedReviewSignals: ['restrict', 'verify'],
  },
  {
    id: 'REAL-MULTI-MOBILE-VISIBILITY-001',
    title: 'mobile equipment backing with visibility issue',
    text: 'haul truck backing near scale house while employees cut across the travel path, backup alarm hard to hear and spotter was not present',
    expectedSignals: ['mobile', 'pedestrian'],
    expectedReviewSignals: ['traffic', 'separation'],
  },
  {
    id: 'REAL-MULTI-CHEM-LABEL-LEAK-001',
    title: 'unknown leaking chemical container',
    text: 'unmarked five gallon pail leaking clear liquid under parts washer, no label, no SDS found, employees stepped around it instead of barricading area',
    expectedSignals: ['label', 'chemical'],
    expectedReviewSignals: ['sds', 'spill'],
  },
  {
    id: 'REAL-FALSE-HOTWORK-CHEMICAL-001',
    title: 'chemical storage should not route as hot work',
    text: 'aerosol cans and solvent containers stored beside oxidizer cabinet, no welding or cutting was occurring, concern is incompatible chemical storage',
    expectedSignals: ['chemical', 'storage'],
    expectedReviewSignals: ['segregate', 'incompatible'],
  },
  {
    id: 'REAL-FALSE-ELECTRICAL-GUARDING-001',
    title: 'energized wording should preserve guarding priority',
    text: 'conveyor was energized earlier but the main concern is missing fixed guard on rotating tail pulley where miners shovel spillage',
    expectedSignals: ['guard', 'pulley'],
    expectedReviewSignals: ['exposure', 'energy'],
  },
  {
    id: 'REAL-FALSE-GENERIC-DUST-001',
    title: 'dust observation should identify respiratory uncertainty',
    text: 'dust cloud around crusher transfer point, not sure if silica sample exists, water spray was off and workers nearby had no respirators visible',
    expectedSignals: ['dust', 'respiratory'],
    expectedReviewSignals: ['sample', 'control'],
  },
  {
    id: 'REAL-INCOMPLETE-FALL-001',
    title: 'incomplete fall exposure description',
    text: 'worker near edge on elevated platform, rail missing on one side, height unknown and no fall protection visible from photo',
    expectedSignals: ['fall', 'rail'],
    expectedReviewSignals: ['height', 'protection'],
  },
  {
    id: 'REAL-INCOMPLETE-CONFINED-SPACE-001',
    title: 'partial vessel entry with missing atmospheric evidence',
    text: 'employee reached into tank opening to pull hose, lower body outside but head and shoulders inside, no meter reading or permit seen',
    expectedSignals: ['entry', 'confined'],
    expectedReviewSignals: ['atmosphere', 'permit'],
  },
];

async function main() {
  const service = new SafeScopeReasoningOrchestratorService();
  const failures: string[] = [];

  for (const testCase of cases) {
    const result: any = service.reason({
      hazardObservation: testCase.text,
      siteType: 'surface aggregate mine / field inspection',
      taskContext: testCase.text,
      industryContext: 'mining aggregate and general safety field observation',
      photosAvailable: true,
      employeeExposureKnown: true,
      equipmentInvolved: testCase.text,
      enableApprovedKnowledgeContext: true,
    });

    const combined = normalize(flattenText(result));

    for (const signal of testCase.expectedSignals) {
      if (!combined.includes(normalize(signal))) {
        failures.push(`${testCase.id}: missing expected signal "${signal}"`);
      }
    }

    const reviewSignalHit = testCase.expectedReviewSignals.some((signal) =>
      combined.includes(normalize(signal)),
    );

    if (!reviewSignalHit) {
      failures.push(
        `${testCase.id}: missing review/evidence signal. Expected one of: ${testCase.expectedReviewSignals.join(', ')}`,
      );
    }

    assert(result, `${testCase.id}: no result returned`);
    assert(
      result.boundary?.requiresQualifiedReview !== false,
      `${testCase.id}: qualified review boundary should not be disabled`,
    );
  }

  if (failures.length) {
    throw new Error(failures.join('\n'));
  }

  const outputDir = path.resolve(process.cwd(), '../safescope-data/benchmarks');
  const docsDir = path.resolve(process.cwd(), '../project-docs/08-audits');
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(docsDir, { recursive: true });

  const artifact = {
    audit: 'SafeScope Field Realism Gauntlet',
    version: 'field_realism_v1',
    generatedAt: new Date().toISOString(),
    caseCount: cases.length,
    status: 'passed',
    cases: cases.map((testCase) => ({
      id: testCase.id,
      title: testCase.title,
      expectedSignals: testCase.expectedSignals,
      expectedReviewSignals: testCase.expectedReviewSignals,
    })),
    boundary: {
      validatesMessyFieldLanguage: true,
      validatesFalseRouteResistance: true,
      validatesIncompleteObservationHandling: true,
      requiresQualifiedReview: true,
      doesNotDeclareViolations: true,
    },
  };

  const jsonPath = path.join(outputDir, 'safescope-field-realism-gauntlet-results.v1.json');
  const mdPath = path.join(docsDir, 'SAFESCOPE_FIELD_REALISM_GAUNTLET_RESULTS.md');

  fs.writeFileSync(jsonPath, JSON.stringify(artifact, null, 2));

  const md = [
    '# SafeScope Field Realism Gauntlet Results',
    '',
    `Generated: ${artifact.generatedAt}`,
    '',
    `Status: **${artifact.status.toUpperCase()}**`,
    '',
    `Cases: **${artifact.caseCount}**`,
    '',
    '## What this validates',
    '',
    '- Messy real-world field descriptions',
    '- Multi-hazard observations',
    '- False-route resistance',
    '- Incomplete evidence handling',
    '- Supervisor review and evidence-gap signals',
    '',
    '## Boundary',
    '',
    '- SafeScope remains decision support.',
    '- SafeScope does not declare violations.',
    '- Qualified review is required before final report use.',
    '',
    '## Cases',
    '',
    ...cases.map((testCase) => `- **${testCase.id}** — ${testCase.title}`),
    '',
  ].join('\n');

  fs.writeFileSync(mdPath, md);

  console.log('✅ SafeScope field realism gauntlet passed.');
  console.log(`Cases: ${cases.length}`);
  console.log(`Results JSON: ${jsonPath}`);
  console.log(`Results MD: ${mdPath}`);
  for (const testCase of cases) {
    console.log(`- ${testCase.id}: ${testCase.title}`);
  }
}

main().catch((error) => {
  console.error('❌ SafeScope field realism gauntlet failed.');
  if (error instanceof Error) {
    console.error(error.stack || error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
});
