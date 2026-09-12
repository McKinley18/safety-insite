/**
 * §222 -- FROZEN INTEGRATED HARD-GATE COMPUTATION. RUNS ONLY AFTER 62/62 ADJUDICATION.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * The status mapping below is applied from the FROZEN §221 rules and the §222-named gate statuses.
 * It is fixed before the judgments are read, and no denominator, applicability, threshold,
 * zero-tolerance rule or truth definition is changed after seeing them.
 *
 *   any FAIL among the judgments feeding a gate        -> FAIL      (HARD_GATE_RULE_221, zero tolerance)
 *   else any AMBIGUOUS                                 -> COVERAGE_INSUFFICIENT
 *                                                         (AMBIGUITY_RULE_221: the gate cannot pass
 *                                                          from that judgment, and it has not failed)
 *   else no feeding judgment was exercised at all      -> NOT_EXERCISED
 *   else realised case coverage < frozen planned cases -> COVERAGE_INSUFFICIENT
 *   else                                               -> PASS
 *
 * A case counts as having REALISED a gate when at least one of its judgments feeding that gate
 * carries PASS or FAIL. NOT_EXERCISED contributes no positive evidence and never realises coverage.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  INTEGRATED_HARD_GATES_221, HARD_GATE_RULE_221, AMBIGUITY_RULE_221, gateCoverage221,
  type IntegratedHardGateId221,
} from './lib/expert-221-integrated-instrument';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification',
  'expert-hazlenz-221-integrated-pipeline-validation-2026-09-10');
const sha = (b: Buffer): string => createHash('sha256').update(b).digest('hex');

if (sha(readFileSync(join(EVID, 'ADJUDICATION-PACKET-221.json')))
  !== '893156ac55d121c9d77640c927116b14a2683feeb1fb49a15f7901b323138633') {
  throw new Error('§222 ABORT: adjudication packet identity changed');
}
if (sha(readFileSync(join(EVID, 'INTEGRATED-PREREGISTRATION-221.json')))
  !== '82487b704e7601476481bbbe803d1b3299742478404e8df65f0149330302e1f6') {
  throw new Error('§222 ABORT: frozen §221 digest changed');
}

interface Entry {
  seq: number; slotId: string; caseId: string; axis: string; question: string;
  feedsGate: string | null; verdict: string; attribution: string; note: string | null;
  amends: number | null;
}
const rows: Entry[] = readFileSync(join(EVID, 'ADJUDICATION-LEDGER-222.jsonl'), 'utf8')
  .split('\n').filter(Boolean).map(l => JSON.parse(l));

if (rows.length !== 62) throw new Error(`§222 ABORT: ${rows.length} judgments, expected 62`);
if (!rows.every(r => r.attribution === 'PRODUCT_OWNER')) {
  throw new Error('§222 ABORT: a judgment is not PRODUCT_OWNER attributed');
}
if (!rows.every(r => r.amends === null)) {
  throw new Error('§222 ABORT: amendments present; the amendment path must be reviewed explicitly');
}

const planned = gateCoverage221();

type GateStatus = 'PASS' | 'FAIL' | 'NOT_EXERCISED' | 'COVERAGE_INSUFFICIENT';

const results = INTEGRATED_HARD_GATES_221.map(g => {
  const feed = rows.filter(r => r.feedsGate === g.id);
  const tally = {
    PASS: feed.filter(r => r.verdict === 'PASS').length,
    FAIL: feed.filter(r => r.verdict === 'FAIL').length,
    AMBIGUOUS: feed.filter(r => r.verdict === 'AMBIGUOUS').length,
    NOT_EXERCISED: feed.filter(r => r.verdict === 'NOT_EXERCISED').length,
  };
  const plannedCases = [...(planned[g.id] ?? [])];
  const realisedCases = [...new Set(
    feed.filter(r => r.verdict === 'PASS' || r.verdict === 'FAIL').map(r => r.caseId))];
  const unrealised = plannedCases.filter(c => !realisedCases.includes(c));

  let status: GateStatus;
  if (tally.FAIL > 0) status = 'FAIL';
  else if (tally.AMBIGUOUS > 0) status = 'COVERAGE_INSUFFICIENT';
  else if (realisedCases.length === 0) status = 'NOT_EXERCISED';
  else if (unrealised.length > 0) status = 'COVERAGE_INSUFFICIENT';
  else status = 'PASS';

  return {
    gate: g.id as IntegratedHardGateId221,
    name: g.name,
    statement: g.statement,
    status,
    tally,
    judgmentsFeeding: feed.length,
    plannedCases,
    realisedCases: realisedCases.sort(),
    unrealisedCases: unrealised,
    failingSlots: feed.filter(r => r.verdict === 'FAIL').map(r => r.slotId),
  };
});

const failed = results.filter(r => r.status === 'FAIL');
const insufficient = results.filter(r => r.status === 'COVERAGE_INSUFFICIENT');
const notExercised = results.filter(r => r.status === 'NOT_EXERCISED');
const passed = results.filter(r => r.status === 'PASS');

const out = {
  artifact: 'SECTION-222-INTEGRATED-HARD-GATE-COMPUTATION',
  computedAfterFullAdjudication: true,
  judgmentsTotal: rows.length,
  judgmentTally: {
    PASS: rows.filter(r => r.verdict === 'PASS').length,
    FAIL: rows.filter(r => r.verdict === 'FAIL').length,
    AMBIGUOUS: rows.filter(r => r.verdict === 'AMBIGUOUS').length,
    NOT_EXERCISED: rows.filter(r => r.verdict === 'NOT_EXERCISED').length,
  },
  hardGateRule: HARD_GATE_RULE_221,
  ambiguityRule: AMBIGUITY_RULE_221,
  statusMappingAppliedUnchanged: [
    'any FAIL -> FAIL',
    'else any AMBIGUOUS -> COVERAGE_INSUFFICIENT',
    'else nothing exercised -> NOT_EXERCISED',
    'else realised case coverage < frozen planned cases -> COVERAGE_INSUFFICIENT',
    'else -> PASS',
  ],
  gates: results,
  summary: {
    PASS: passed.map(r => r.gate),
    FAIL: failed.map(r => r.gate),
    COVERAGE_INSUFFICIENT: insufficient.map(r => r.gate),
    NOT_EXERCISED: notExercised.map(r => r.gate),
  },
  allApplicableGatesPassed: failed.length === 0 && insufficient.length === 0
    && notExercised.length === 0,
  headlineAccuracyPercentageReported: false,
  providerCallsDuringAdjudicationAndComputation: 0,
  databaseOperations: 0,
  computedAt: new Date().toISOString(),
};

writeFileSync(join(EVID, 'GATE-COMPUTATION-222.json'), JSON.stringify(out, null, 2) + '\n');

console.log('§222 FROZEN INTEGRATED HARD GATES\n');
console.log('GATE  STATUS                  P/F/A/NE   PLANNED -> REALISED CASES');
for (const r of results) {
  console.log(`${r.gate.padEnd(5)} ${r.status.padEnd(23)} `
    + `${r.tally.PASS}/${r.tally.FAIL}/${r.tally.AMBIGUOUS}/${r.tally.NOT_EXERCISED}`.padEnd(10)
    + ` ${r.plannedCases.join(',')} -> ${r.realisedCases.join(',') || '(none)'}`
    + `${r.failingSlots.length ? '   FAIL: ' + r.failingSlots.join(' ') : ''}`);
}
console.log(`\nPASS ${passed.length} · FAIL ${failed.length} `
  + `· COVERAGE_INSUFFICIENT ${insufficient.length} · NOT_EXERCISED ${notExercised.length}`);
console.log('judgments:', JSON.stringify(out.judgmentTally));
console.log('no headline accuracy percentage is produced');
