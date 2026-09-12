/**
 * §226 -- PREFLIGHT AND FREEZE THE LOCAL INSTRUMENT. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Runs the machine-checkable preflight FIRST. If the preflight fails, nothing is written and the
 * DEVELOPMENT instrument is repaired before it is frozen. If it passes, the instrument is written
 * out and digested, and from that point HAZLENZ_INVARIANTS 21 applies: it is not revised, whatever
 * a later result shows.
 */
import { createHash } from 'crypto';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

import {
  CASES_226, INSTRUMENT_226_VERSION, MEASURES_226, CONTRACT_RULES_226,
  AGGREGATE_SCORE_PERMITTED, OWED_MATCH_FLOOR, DUPLICATE_COLLISION, preflight226,
} from './lib/expert-226-capability-instrument';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification',
  'expert-hazlenz-226-first-pass-semantic-remediation-2026-09-11');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

const pre = preflight226();

console.log('---- §226 LOCAL INSTRUMENT PREFLIGHT ----');
for (const k of pre.checks) {
  console.log(`${k.passed ? 'ok  ' : 'FAIL'}  ${k.id}. ${k.what}`);
  if (!k.passed) console.log(`        ${k.detail}`);
}
console.log(`PREFLIGHT: ${pre.checks.filter(k => k.passed).length}/${pre.checks.length} passed`);

if (!pre.passed) {
  console.error('\nPREFLIGHT FAILED. The instrument is NOT frozen and NOT written. Repair the '
    + 'development instrument and run this again. A frozen instrument is never revised, so the '
    + 'repair must happen here.');
  process.exit(1);
}

const frozen = {
  artifact: 'SECTION-226-LOCAL-INSTRUMENT',
  instrumentVersion: INSTRUMENT_226_VERSION,
  frozenBeforeAnyEvaluation: true,
  providerCalls: 0,
  databaseOperations: 0,
  aggregateScorePermitted: AGGREGATE_SCORE_PERMITTED,
  measures: MEASURES_226,
  contracts: CONTRACT_RULES_226,
  thresholds: {
    owedMatchFloor: OWED_MATCH_FLOOR,
    duplicateCollision: DUPLICATE_COLLISION,
    note: 'Both are preregistered and reported with every classification so a reader checks the '
      + 'classification rather than trusting it.',
  },
  preflight: {
    passed: pre.passed,
    checks: pre.checks,
    authoringDisciplineCorrected:
      'Each case enumerates established facts, genuinely unresolved properties with the reason '
      + 'each is open, non-facts, prohibited adjacent and proxy properties, the expected '
      + 'declaration count, the expected exact controlling properties, and whether required act or '
      + 'required artifact semantics apply. Every measure is preregistered for every case under '
      + 'BOTH contracts, which is the §224 instrument-authoring defect closed.',
  },
  acceptance: {
    note: 'Hard requirements. Pass/fail at the stated occurrence. None may be offset by another '
      + 'or by an aggregate (HAZLENZ_INVARIANTS 22).',
    decisionCriticalDeclarationRecall: '100%',
    exactControllingPropertyIdentity: '100%',
    independentPropertyPreservation: '100%',
    restraintFalseDeclarations: 0,
    requiredActOverCorrection: 0,
    requiredArtifactOverCorrection: 0,
    candidateStateBypassCases: 0,
    deterministicSemanticInvention: 0,
  },
  cases: CASES_226,
};

mkdirSync(OUT, { recursive: true });
const path = join(OUT, 'SECTION-226-LOCAL-INSTRUMENT.json');
if (existsSync(path)) {
  console.error(`\nABORT: ${path} already exists. A frozen instrument is not overwritten.`);
  process.exit(1);
}
const body = `${JSON.stringify(frozen, null, 2)}\n`;
writeFileSync(path, body);
const digest = sha(body);
writeFileSync(join(OUT, 'SECTION-226-LOCAL-INSTRUMENT.sha256'),
  `${digest}  SECTION-226-LOCAL-INSTRUMENT.json\n`);

console.log(`\nFROZEN. ${CASES_226.length} cases, ${MEASURES_226.length} measures.`);
console.log(`digest ${digest}`);
console.log('PROVIDER CALLS 0 · DATABASE OPERATIONS 0');
