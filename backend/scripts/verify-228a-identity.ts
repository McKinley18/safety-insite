/** §228B PRE-SPEND IDENTITY. Recomputes the frozen §228A package digest. Zero provider calls. */
import { createHash } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  runTruthPreflight228A, coverageMap228A, callPlan228A, humanActionsPreregistered228A,
  INTEGRATED_CASES_228A, REQUIRED_PATHS_228A, HARD_REQUIREMENTS_228A, RESIDUAL_OBSERVATIONS_228A,
  instrumentDigest228A,
} from './lib/expert-228a-integrated-instrument';

const EXPECTED = '4c91ae539f18efdad0f37e30967e8b188b659864fac8ab0cda08c8e2dea0c3cc';
const DIR = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-228a-integrated-revalidation-instrument-2026-09-11');
const FILES = ['SECTION-228A-INSTRUMENT.json', 'SECTION-228A-TRUTH-PREFLIGHT.json',
  'SECTION-228A-COVERAGE-MAP.json', 'SECTION-228A-CALL-PLAN.json',
  'SECTION-228A-FROZEN-PROTOCOL.json'];

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');
const checks: { id: string; expected: string; actual: string; ok: boolean }[] = [];
const chk = (id: string, expected: unknown, actual: unknown): void => {
  checks.push({ id, expected: String(expected), actual: String(actual),
    ok: String(expected) === String(actual) });
};

for (const f of FILES) chk(`present:${f}`, true, existsSync(join(DIR, f)));

// Recompute the package digest exactly as build-228a-frozen-protocol.ts did.
const docs = FILES.map(f => [f, JSON.parse(readFileSync(join(DIR, f), 'utf8'))] as const);
const packageDigest = sha(docs.map(([n, d]) => `${n}\n${JSON.stringify(d)}`).join('\n'));
chk('packageDigest', EXPECTED, packageDigest);

const frozen = docs.find(([n]) => n === 'SECTION-228A-FROZEN-PROTOCOL.json')![1] as any;
const instrumentDoc = docs.find(([n]) => n === 'SECTION-228A-INSTRUMENT.json')![1] as any;
const preflightDoc = docs.find(([n]) => n === 'SECTION-228A-TRUTH-PREFLIGHT.json')![1] as any;
const coverageDoc = docs.find(([n]) => n === 'SECTION-228A-COVERAGE-MAP.json')![1] as any;
const planDoc = docs.find(([n]) => n === 'SECTION-228A-CALL-PLAN.json')![1] as any;

// The frozen documents against the live module: the artifacts and the code must still agree.
const live = {
  preflight: runTruthPreflight228A(), coverage: coverageMap228A(), plan: callPlan228A(),
  humans: humanActionsPreregistered228A(),
};
chk('instrumentDigest', frozen.instrumentDigest, instrumentDigest228A());
chk('cases:frozen', 8, instrumentDoc.caseCount);
chk('cases:live', 8, INTEGRATED_CASES_228A.length);
chk('judgmentSlots:frozen', 68, instrumentDoc.judgmentSlotCount);
chk('judgmentSlots:live', 68,
  INTEGRATED_CASES_228A.reduce((n, x) => n + x.judgments.length, 0));
chk('preflight:frozen', '17/17', `${preflightDoc.passed}/${preflightDoc.total}`);
chk('preflight:live', '17/17', `${live.preflight.passed}/${live.preflight.total}`);
chk('preflight:result', 'PASS', live.preflight.allPassed ? 'PASS' : 'FAIL');
chk('coverage:frozen', '12/12', `${coverageDoc.pathsCovered}/${coverageDoc.pathsTotal}`);
chk('coverage:live', '12/12',
  `${Object.values(live.coverage.pathCoverage).filter((p: any) => p.covered).length}/${REQUIRED_PATHS_228A.length}`);
chk('residuals:frozen', '5/5',
  `${coverageDoc.residualsInstrumented}/${coverageDoc.residualsTotal}`);
chk('residuals:live', '5/5',
  `${Object.values(live.coverage.residualCoverage).filter((r: any) => r.cases.length > 0 && r.judgmentSlots > 0).length}/${RESIDUAL_OBSERVATIONS_228A.length}`);
chk('hardRequirements', 14, HARD_REQUIREMENTS_228A.length);
chk('hardRequirements:frozen', 14, frozen.hardRequirements.length);
chk('underAuthored', 0, frozen.coverage.underAuthoredRequirements.length);
chk('primaryCalls:frozen', 14, planDoc.exactPrimaryCallCount);
chk('primaryCalls:live', 14, live.plan.primaryCalls);
chk('maxCalls:frozen', 16, planDoc.maximumAuthorizedCalls);
chk('maxCalls:live', 16, live.plan.maximumAuthorizedCalls);
chk('projectedSpend', 0.9399, live.plan.projectedSpendUsd);
chk('hardCeiling', 1.23, live.plan.recommendedHardCeilingUsd);
chk('humanActions:preregistered', true, frozen.humanActions.preregistered);
chk('humanActions:total', frozen.humanActions.total, live.humans.total);
chk('humanActions:chosenAfterOutput', false, frozen.humanActions.chosenAfterSeeingOutput);
chk('promptIdentityPinned', true, frozen.identity.promptIdentityPinned);
chk('schemaIdentityPinned', true, frozen.identity.schemaIdentityPinned);
chk('perCaseIdentities', 8, frozen.identity.perCase.length);
chk('executionAuthorizedInPackage', false, frozen.executionAuthorized);
chk('databaseOperations', 0, frozen.boundary.databaseOperations);

const failed = checks.filter(c => !c.ok);
for (const c of checks) {
  console.log(`${c.ok ? 'ok  ' : 'FAIL'} ${c.id.padEnd(34)} expected=${c.expected} actual=${c.actual}`);
}
console.log(`\nPRE-SPEND IDENTITY: ${failed.length === 0 ? 'PASS' : 'FAIL'} — `
  + `${checks.length - failed.length}/${checks.length}`);
console.log(`package digest: ${packageDigest}`);
if (failed.length > 0) process.exit(1);
