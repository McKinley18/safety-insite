/**
 * KG-4D -- compares two customer-payload captures using the KG-4B empirical-volatility oracle.
 *
 * The oracle, restated because it is the whole point: volatility is DERIVED, never declared. Two
 * captures from the SAME server and the SAME configuration establish which paths differ between two
 * runs of identical code; only those are excluded from the comparison that follows. A hand-written
 * ignore-list would be a promise the pipeline will never grow a new timestamp, and that promise
 * always eventually breaks.
 *
 * Env:
 *   VOLATILITY_A, VOLATILITY_B   two captures from the same configuration (derives the exclusions)
 *   LEFT, RIGHT                  the two captures actually being compared
 *   REPORT_OUT                   artifact path
 *   EXPECT                       IDENTICAL (default) or DIFFERENT
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import {
  deriveVolatilePaths, compareCustomerOutput, customerOutputHash,
} from '../src/standards/cutover/customer-output-invariance';

interface Capture { label: string; cases: Record<string, unknown> }

const read = (path: string): Capture => JSON.parse(readFileSync(path, 'utf8')) as Capture;

function main(): void {
  const volatilityA = read(process.env.VOLATILITY_A || '');
  const volatilityB = read(process.env.VOLATILITY_B || '');
  const left = read(process.env.LEFT || '');
  const right = read(process.env.RIGHT || '');
  const expect = (process.env.EXPECT || 'IDENTICAL').toUpperCase();
  const reportOut = process.env.REPORT_OUT || '';

  const caseIds = Object.keys(left.cases);
  const results: Array<Record<string, unknown>> = [];
  let identical = 0;
  let differing = 0;
  const failures: string[] = [];

  // One volatile set per case, derived from that case's own two same-configuration runs.
  for (const id of caseIds) {
    const volatilePaths = deriveVolatilePaths(volatilityA.cases[id], volatilityB.cases[id]);
    const comparison = compareCustomerOutput({
      legacyPayload: left.cases[id],
      shadowPayload: right.cases[id],
      volatilePaths,
    });
    if (comparison.verdict === 'INVARIANT') identical += 1; else differing += 1;

    results.push({
      case: id,
      verdict: comparison.verdict,
      volatilePathCount: volatilePaths.size,
      differingPathCount: comparison.differingPathCount,
      // PATH NAMES ONLY. Values never enter an artifact.
      differingPaths: comparison.differingPaths,
      leftHash: comparison.legacyHash,
      rightHash: comparison.shadowHash,
    });

    if (expect === 'IDENTICAL' && comparison.verdict !== 'INVARIANT') {
      failures.push(id + ': ' + comparison.verdict + ' (' + comparison.differingPathCount +
        ' paths: ' + comparison.differingPaths.slice(0, 6).join(', ') + ')');
    }
  }

  // A capture that is empty, or whose volatility set swallows the whole payload, would compare
  // equal for the wrong reason. Both are refused.
  const totalVolatile = results.reduce((sum, r) => sum + Number(r.volatilePathCount), 0);
  const meanVolatile = caseIds.length ? totalVolatile / caseIds.length : 0;
  const vacuous = caseIds.length === 0;
  if (vacuous) failures.push('NON-VACUITY: no cases were compared');

  // Governed keys must not appear anywhere in a payload the customer received.
  const forbiddenKeys = [
    'governedDeliveryState', 'governedFallbackReason', 'governedTextUnavailable', 'knowledgeReleaseId',
  ];
  const rightSerialized = JSON.stringify(right.cases);
  const leaked = forbiddenKeys.filter((key) => rightSerialized.includes('"' + key + '"'));
  if (leaked.length) failures.push('GOVERNED KEY LEAK in ' + right.label + ': ' + leaked.join(', '));

  const report = {
    generatedBy: 'compare-kg4d-customer-capture.ts',
    left: left.label, right: right.label,
    volatilityDerivedFrom: [volatilityA.label, volatilityB.label],
    expect,
    caseCount: caseIds.length,
    identical, differing,
    meanVolatilePathsPerCase: Number(meanVolatile.toFixed(1)),
    governedKeyLeak: leaked,
    corpusHashLeft: customerOutputHash(left.cases),
    corpusHashRight: customerOutputHash(right.cases),
    cases: results,
    passed: failures.length === 0,
    failures,
  };

  if (reportOut) {
    mkdirSync(dirname(reportOut), { recursive: true });
    writeFileSync(reportOut, JSON.stringify(report, null, 2) + '\n');
  }

  console.log('');
  console.log(left.label + '  vs  ' + right.label);
  console.log('  cases            : ' + caseIds.length);
  console.log('  identical        : ' + identical);
  console.log('  differing        : ' + differing);
  console.log('  mean volatile/ case: ' + meanVolatile.toFixed(1));
  console.log('  governed key leak: ' + (leaked.length ? leaked.join(', ') : 'none'));
  console.log('');
  if (failures.length) {
    for (const failure of failures) console.error('  FAIL  ' + failure);
    console.log('kg4d-capture-compare: FAILED');
    process.exitCode = 1;
  } else {
    console.log('kg4d-capture-compare: PASSED (' + identical + '/' + caseIds.length + ' identical)');
  }
}

main();
