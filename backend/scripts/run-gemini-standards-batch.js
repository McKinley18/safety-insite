const fs = require('fs');

const INPUT = process.argv[2] || 'test-data/gemini/batch-001.json';
const BASE_URL = process.env.STANDARDS_API_URL || 'http://localhost:3000';

const allowedFamilies = new Set([
  'machine_guarding','lockout_tagout','fall_protection','ladder_safety',
  'excavation','scaffold','electrical','housekeeping','hazard_communication',
  'powered_industrial_truck','ppe','mobile_equipment','workplace_exam',
  'safe_access','roadway_berm','confined_space','respiratory','struck_by',
  'noise','training','other'
]);

function normalizeFamily(family) {
  if (!family) return 'other';
  const f = String(family).toLowerCase().trim();

  const map = {
    compressed_gas_cylinders: 'other',
    compressed_gas: 'other',
    walking_working_surfaces: 'housekeeping',
    slips_trips_falls: 'housekeeping',
    forklift: 'powered_industrial_truck',
    trenching: 'excavation',
    silica: 'respiratory',
    eye_face_protection: 'ppe',
    berm: 'roadway_berm',
    guarding: 'machine_guarding',
    loto: 'lockout_tagout'
  };

  return allowedFamilies.has(f) ? f : (map[f] || 'other');
}

function normalizeCase(raw, index) {
  const scope = raw.scopeExpected || raw.scope || 'no_match';
  const agency = raw.agencyExpected || raw.agency || (scope === 'mining' ? 'MSHA' : scope === 'no_match' ? 'NONE' : 'OSHA');

  return {
    id: raw.id || `case_${String(index + 1).padStart(5, '0')}`,
    scopeExpected: ['general_industry', 'construction', 'mining', 'no_match'].includes(scope) ? scope : 'no_match',
    agencyExpected: ['OSHA', 'MSHA', 'NONE'].includes(agency) ? agency : 'NONE',
    observation: String(raw.observation || '').trim(),
    primaryHazardFamily: normalizeFamily(raw.primaryHazardFamily || raw.hazardFamily),
    difficulty: ['easy', 'medium', 'hard', 'brutal'].includes(raw.difficulty) ? raw.difficulty : 'hard',
    expectedOutcome: raw.expectedOutcome || {
      citationConfidence: raw.scopeExpected === 'no_match' ? 'no_match' : 'family_only'
    },
    whyDifficult: raw.whyDifficult || raw.whyThisShouldMatch || ''
  };
}

function inferSiteType(testCase) {
  if (testCase.scopeExpected === 'general_industry') return 'general_industry';
  if (testCase.scopeExpected === 'construction') return 'construction';
  if (testCase.scopeExpected === 'mining') return 'mining';
  return 'mixed';
}

function likelyFamilyFromResult(result) {
  const top = result.primaryMatches?.[0] || result.matches?.[0];
  if (!top) return 'other';

  const citation = String(top.citation || '');

  if (citation.startsWith('1910.178')) return 'powered_industrial_truck';
  if (citation.startsWith('1910.147')) return 'lockout_tagout';
  if (citation.startsWith('1910.212')) return 'machine_guarding';
  if (citation.startsWith('1910.303')) return 'electrical';
  if (citation.startsWith('1910.1200')) return 'hazard_communication';
  if (citation.startsWith('1910.22')) return 'housekeeping';
  if (citation.startsWith('1910.37')) return 'housekeeping';
  if (citation.startsWith('1910.132')) return 'ppe';
  if (citation.startsWith('1910.95')) return 'noise';
  if (citation.startsWith('1926.501')) return 'fall_protection';
  if (citation.startsWith('1926.451')) return 'scaffold';
  if (citation.startsWith('1926.1053')) return 'ladder_safety';
  if (citation.startsWith('1926.652')) return 'excavation';
  if (citation.startsWith('1926.102')) return 'ppe';
  if (citation.startsWith('1926.405')) return 'electrical';
  if (citation.startsWith('1926.701')) return 'ppe';
  if (citation.startsWith('1926.453')) return 'mobile_equipment';
  if (citation.startsWith('56.14107')) return 'machine_guarding';
  if (citation.startsWith('56.9300')) return 'roadway_berm';
  if (citation.startsWith('56.18002')) return 'workplace_exam';
  if (citation.startsWith('56.12004')) return 'electrical';
  if (citation.startsWith('56.11001')) return 'safe_access';
  if (citation.startsWith('56.14132')) return 'mobile_equipment';
  if (citation.startsWith('56.5001')) return 'respiratory';
  if (citation.startsWith('56.20003')) return 'housekeeping';

  return 'other';
}

function routeMatches(expectedScope, result, expectedFamily, expectedOutcome) {
  const top = result.primaryMatches?.[0] || result.matches?.[0];
  const explicitNoMatch = expectedOutcome?.citationConfidence === 'no_match';

  if (expectedScope === 'no_match' || explicitNoMatch) return !top;
  if (!top && expectedFamily === 'other') return true;
  if (!top && expectedScope !== 'no_match') return false;
  if (!top) return false;

  return top.scopeCode === expectedScope;
}

function noMatchPass(testCase, result) {
  const top = result.primaryMatches?.[0] || result.matches?.[0];
  return testCase.scopeExpected === 'no_match' && !top;
}

async function run() {
  if (!fs.existsSync(INPUT)) {
    console.error(`Input file not found: ${INPUT}`);
    process.exit(1);
  }

  const rawText = fs.readFileSync(INPUT, 'utf8');
  const parsed = JSON.parse(rawText);
  const cases = parsed.map(normalizeCase).filter(c => c.observation.length > 0);

  const failures = [];
  let familyPass = 0;
  let routePass = 0;
  let noMatchCount = 0;
  let noMatchPassCount = 0;
  let matchedCount = 0;

  for (const testCase of cases) {
    const payload = {
      observation: testCase.observation,
      siteType: inferSiteType(testCase),
      includeLowConfidence: false,
      limit: 5
    };

    const response = await fetch(`${BASE_URL}/standards/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    const top = result.primaryMatches?.[0] || result.matches?.[0];

    if (top) matchedCount++;

    const testCaseHasNoMatchIntent = testCase.expectedOutcome?.citationConfidence === 'no_match';
    const routeOk = routeMatches(testCase.scopeExpected, result, testCase.primaryHazardFamily, testCase.expectedOutcome);
    if (routeOk) routePass++;

    let familyOk = false;

    if (testCase.scopeExpected === 'no_match' || testCase.expectedOutcome?.citationConfidence === 'no_match') {
      noMatchCount++;
      familyOk = noMatchPass(testCase, result);
      if (familyOk) noMatchPassCount++;
    } else {
      const actualFamily = likelyFamilyFromResult(result);
      const acceptableAlternates = {
        ladder_safety: ['fall_protection'],
        fall_protection: ['ladder_safety', 'scaffold'],
        excavation: ['ladder_safety'],
        ppe: ['fall_protection'],
      };

      familyOk =
        actualFamily === testCase.primaryHazardFamily ||
        testCase.primaryHazardFamily === 'other' ||
        (acceptableAlternates[testCase.primaryHazardFamily] || []).includes(actualFamily);

      if (familyOk) familyPass++;
    }

    const explicitNoMatchOk =
      testCase.expectedOutcome?.citationConfidence === 'no_match' &&
      !top;

    if (!explicitNoMatchOk && (!routeOk || !familyOk)) {
      failures.push({
        id: testCase.id,
        observation: testCase.observation,
        expectedScope: testCase.scopeExpected,
        expectedFamily: testCase.primaryHazardFamily,
        actualCitation: top?.citation || 'NO_MATCH',
        actualScope: top?.scopeCode || 'NO_MATCH',
        actualTitle: top?.title || 'NO_MATCH',
        actualConfidence: top?.confidence || 0,
        routeOk,
        familyOk,
        whyDifficult: testCase.whyDifficult,
        cautions: top?.cautions || []
      });
    }
  }

  const total = cases.length;
  const scoredFamilyTotal = total - noMatchCount;
  const report = {
    input: INPUT,
    totalCases: total,
    matchedCount,
    routeAccuracy: `${routePass}/${total} = ${Math.round((routePass / total) * 100)}%`,
    familyAccuracy: scoredFamilyTotal
      ? `${familyPass}/${scoredFamilyTotal} = ${Math.round((familyPass / scoredFamilyTotal) * 100)}%`
      : 'N/A',
    noMatchAccuracy: noMatchCount
      ? `${noMatchPassCount}/${noMatchCount} = ${Math.round((noMatchPassCount / noMatchCount) * 100)}%`
      : 'N/A',
    failureCount: failures.length,
    failures
  };

  fs.writeFileSync('results/gemini-batch-report.json', JSON.stringify(report, null, 2));
  fs.writeFileSync('results/gemini-batch-failures.json', JSON.stringify(failures, null, 2));

  console.log(JSON.stringify({
    totalCases: report.totalCases,
    routeAccuracy: report.routeAccuracy,
    familyAccuracy: report.familyAccuracy,
    noMatchAccuracy: report.noMatchAccuracy,
    failureCount: report.failureCount,
    report: 'results/gemini-batch-report.json',
    failures: 'results/gemini-batch-failures.json'
  }, null, 2));
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
