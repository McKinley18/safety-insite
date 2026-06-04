import { SafescopeV2Service } from '../src/safescope-v2/safescope-v2.service';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const service = Object.create(SafescopeV2Service.prototype) as any;

const standards = [
  {
    citation: '30 CFR 75.1722',
    score: 167,
    matchingReasons: ['scenario: unguarded conveyor pulley / exposed nip point'],
  },
  {
    citation: '30 CFR 77.400',
    score: 167,
    matchingReasons: ['scenario: unguarded conveyor pulley / exposed nip point'],
  },
  {
    citation: '30 CFR 56.14107',
    score: 159,
    matchingReasons: ['scenario: unguarded conveyor pulley / exposed nip point'],
  },
  {
    citation: '30 CFR 57.14107',
    score: 159,
    matchingReasons: ['scenario: unguarded conveyor pulley / exposed nip point'],
  },
];

function topCitation(scopes: string[]) {
  return service
    .applyStandardsScopeFit(standards, scopes)
    .sort((a: any, b: any) => Number(b.score || 0) - Number(a.score || 0))[0]
    .citation;
}

function topStandard(scopes: string[]) {
  return service
    .applyStandardsScopeFit(standards, scopes)
    .sort((a: any, b: any) => Number(b.score || 0) - Number(a.score || 0))[0];
}

assert(
  topCitation(['msha_mnm_surface']) === '30 CFR 56.14107',
  'Surface MNM should rank 30 CFR 56.14107 highest.',
);

assert(
  topCitation(['msha_mnm_underground']) === '30 CFR 57.14107',
  'Underground MNM should rank 30 CFR 57.14107 highest.',
);

assert(
  topCitation(['msha_coal_underground']) === '30 CFR 75.1722',
  'Underground coal should rank 30 CFR 75.1722 highest.',
);

assert(
  topCitation(['msha_coal_surface']) === '30 CFR 77.400',
  'Surface coal should rank 30 CFR 77.400 highest.',
);

const surfaceTop = topStandard(['msha_mnm_surface']);

assert(
  surfaceTop.scopeFit === 'preferred',
  'Preferred Part 56 standard should be marked preferred.',
);

assert(
  surfaceTop.matchingReasons.some((reason: string) =>
    reason.includes('preferred MSHA Part 56'),
  ),
  'Preferred Part 56 reason should be included.',
);

const surfaceRanked = service.applyStandardsScopeFit(standards, [
  'msha_mnm_surface',
]);

assert(
  surfaceRanked.some(
    (standard: any) =>
      standard.citation === '30 CFR 75.1722' &&
      standard.scopeFit === 'mismatch' &&
      standard.scopeFitAdjustment < 0,
  ),
  'Part 75 should be demoted as mismatch for surface MNM.',
);

console.log('✅ SafeScope standards scope-fit ranking validation passed.');
console.log(`Surface MNM top citation: ${topCitation(['msha_mnm_surface'])}`);
console.log(`Underground MNM top citation: ${topCitation(['msha_mnm_underground'])}`);
console.log(`Coal underground top citation: ${topCitation(['msha_coal_underground'])}`);
console.log(`Coal surface top citation: ${topCitation(['msha_coal_surface'])}`);
