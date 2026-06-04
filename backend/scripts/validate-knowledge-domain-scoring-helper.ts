import { scoreKnowledgeDomainAlignment } from '../src/safescope-knowledge/scoring/knowledge-domain-scoring.helper';

type Case = {
  name: string;
  input: Parameters<typeof scoreKnowledgeDomainAlignment>[0];
  minScore?: number;
  maxScore?: number;
};

const baseInput = {
  normalizedQuery: '',
  haystack: '',
  heading: '',
  title: '',
  citation: '',
  normalizedCitation: '',
  sourceType: 'regulation',
  agencyMode: undefined,
};

const cases: Case[] = [
  {
    name: 'OSHA general prefers 1910 over 1926',
    input: {
      ...baseInput,
      normalizedQuery: 'electrical panel missing cover exposed energized conductors',
      haystack: 'electrical energized conductors panel wiring',
      heading: '§ 1910.331 Scope.',
      title: '29 CFR 1910 Subpart S - Electrical',
      citation: '29 cfr 1910.331',
      normalizedCitation: '29 cfr 1910.331',
      agencyMode: 'osha_general',
    },
    minScore: 150,
  },
  {
    name: 'OSHA general penalizes construction electrical citation',
    input: {
      ...baseInput,
      normalizedQuery: 'electrical panel missing cover exposed energized conductors',
      haystack: 'electrical energized conductors panel wiring',
      heading: '§ 1926.405 Wiring methods, components, and equipment for general use.',
      title: '29 CFR 1926 Subpart K - Electrical',
      citation: '29 cfr 1926.405',
      normalizedCitation: '29 cfr 1926.405',
      agencyMode: 'osha_general',
    },
    maxScore: 180,
  },
  {
    name: 'LOTO strongly matches 1910.147',
    input: {
      ...baseInput,
      normalizedQuery: 'maintenance clearing jam equipment not locked out stored energy present',
      haystack: 'control of hazardous energy lockout tagout stored energy servicing maintenance',
      heading: '§ 1910.147 The control of hazardous energy (lockout/tagout).',
      title: '29 CFR 1910 Subpart J - General Environmental Controls',
      citation: '29 cfr 1910.147',
      normalizedCitation: '29 cfr 1910.147',
      agencyMode: 'osha_general',
    },
    minScore: 400,
  },
  {
    name: 'MSHA machine guarding strongly matches 56.14107',
    input: {
      ...baseInput,
      normalizedQuery: 'conveyor tail pulley missing guard exposing rotating parts pinch point',
      haystack: 'moving machine parts conveyor pulley rotating shaft guarding pinch point',
      heading: '§ 56.14107 Moving machine parts.',
      title: '30 CFR Part 56 Subpart M - Guarding',
      citation: '30 cfr 56.14107',
      normalizedCitation: '30 cfr 56.14107',
      agencyMode: 'msha',
    },
    minScore: 180,
  },
];

const results = cases.map((testCase) => {
  const score = scoreKnowledgeDomainAlignment(testCase.input);
  const passesMin = testCase.minScore === undefined || score >= testCase.minScore;
  const passesMax = testCase.maxScore === undefined || score <= testCase.maxScore;

  return {
    name: testCase.name,
    score,
    minScore: testCase.minScore ?? null,
    maxScore: testCase.maxScore ?? null,
    passed: passesMin && passesMax,
  };
});

const failed = results.filter((result) => !result.passed);

console.log(
  JSON.stringify(
    {
      valid: failed.length === 0,
      caseCount: results.length,
      passedCount: results.length - failed.length,
      failedCount: failed.length,
      results,
    },
    null,
    2,
  ),
);

if (failed.length) {
  process.exit(1);
}
