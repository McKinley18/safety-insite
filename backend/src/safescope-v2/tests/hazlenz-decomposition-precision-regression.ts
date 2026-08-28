// Protected gate for secondary-hazard decomposition precision.
//
// Adjudicates the current engine against the FROZEN baseline recorded before
// the 2026-08-27 precision remediation
// (verification/insite-v1-hazlenz-precision-2026-08-27/measurements/baseline.json).
//
// The recall veto is primary and absolute:
//   * dangerous-omission rate may never exceed the baseline;
//   * life-critical omission count may never exceed the baseline;
//   * Population A required-hazard omissions may never exceed the baseline
//     (precision must not be bought by suppressing the real hazard);
//   * Population B required-hazard recall may never fall below the baseline.
//
// Precision is then required to be no worse than the accepted post-remediation
// state. Thresholds here are recorded measurements, not tuned targets, and must
// not be relaxed to obtain a pass.

import * as fs from 'fs';
import * as path from 'path';
import { score, printReport } from './hazlenz-decomposition-precision-scorer';

const BASELINE_PATH = path.resolve(
  __dirname,
  '../../../../verification/insite-v1-hazlenz-precision-2026-08-27/measurements/baseline.json',
);

// Accepted post-remediation precision, measured 2026-08-27.
const ACCEPTED_FORBIDDEN_FAMILY_COUNT = 0;
const ACCEPTED_ROWS_WITH_FORBIDDEN = 0;

function main(): void {
  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8'));
  const current = score('current');
  printReport(current);

  const failures: string[] = [];

  // --- recall veto (primary) ---
  if (current.populationB.dangerousOmissionRate > baseline.populationB.dangerousOmissionRate) {
    failures.push(
      `RECALL VETO: Population B dangerous-omission rate rose from ` +
        `${baseline.populationB.dangerousOmissionRate} to ${current.populationB.dangerousOmissionRate}`,
    );
  }
  if (
    current.populationB.lifeCriticalOmissionCount > baseline.populationB.lifeCriticalOmissionCount
  ) {
    failures.push(
      `RECALL VETO: life-critical omissions rose from ` +
        `${baseline.populationB.lifeCriticalOmissionCount} to ${current.populationB.lifeCriticalOmissionCount}`,
    );
  }
  if (
    current.populationB.requiredSecondaryHazardRecall <
    baseline.populationB.requiredSecondaryHazardRecall
  ) {
    failures.push(
      `RECALL VETO: Population B required-hazard recall fell from ` +
        `${baseline.populationB.requiredSecondaryHazardRecall} to ${current.populationB.requiredSecondaryHazardRecall}`,
    );
  }
  if (current.populationA.requiredOmissionCount > baseline.populationA.requiredOmissionCount) {
    failures.push(
      `RECALL VETO: Population A required-hazard omissions rose from ` +
        `${baseline.populationA.requiredOmissionCount} to ${current.populationA.requiredOmissionCount}`,
    );
  }

  // --- precision must not regress below the accepted state ---
  if (current.populationA.forbiddenFamilyCount > ACCEPTED_FORBIDDEN_FAMILY_COUNT) {
    failures.push(
      `PRECISION REGRESSION: forbidden-family count is ${current.populationA.forbiddenFamilyCount}, ` +
        `accepted is ${ACCEPTED_FORBIDDEN_FAMILY_COUNT}`,
    );
  }
  if (current.populationA.rowsWithForbidden > ACCEPTED_ROWS_WITH_FORBIDDEN) {
    failures.push(
      `PRECISION REGRESSION: ${current.populationA.rowsWithForbidden} rows carry a forbidden family, ` +
        `accepted is ${ACCEPTED_ROWS_WITH_FORBIDDEN}`,
    );
  }

  if (failures.length) {
    for (const failure of failures) console.error(`FAIL ${failure}`);
    process.exit(1);
  }
  console.log('PASS HazLenz decomposition precision/recall gate');
}

main();
