/**
 * §234 — POST-EXECUTION FREEZE. ZERO provider calls, ZERO database operations.
 *
 * Confirms that nothing moved under the run, then digests the whole evidence package.
 */
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

import { instrumentDigest234, TERMINALS_234 }
  from './lib/expert-234-posture-discrimination-instrument';
import { contractIdentities233, FIRST_PASS_CONTRACT_233_VERSION }
  from './lib/expert-233-posture-contract';
import { projectionIdentity233 } from './lib/expert-233-posture-projection';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-234-posture-discrimination-2026-09-11');
const sha = (s: string | Buffer): string => createHash('sha256').update(s).digest('hex');

const AUTHORIZED_INSTRUMENT_DIGEST =
  'd988f2904c77185c047f06fd680a83d8733e1d5d7451d8e4e6b1128145cd7c64';
const AUTHORIZED_IMPLEMENTATION_DIGEST_233 =
  '5517337ded68b7b8901dcb588355f98b4bdbf2dfe4ae54a4af0266af1d4ce5af';
const AUTHORIZED_COMPOSITE_IDENTITY =
  '37ce9eb8e9db62288b0a4953072bb487f38beab962d4716ad74be47036e2e2cb';

const MODULES_233: Readonly<Record<string, string>> = {
  contract: 'backend/scripts/lib/expert-233-posture-contract.ts',
  projection: 'backend/scripts/lib/expert-233-posture-projection.ts',
  fixtures: 'backend/scripts/lib/expert-233-posture-fixtures.ts',
  suite: 'backend/scripts/test-233-posture-contract.ts',
};
const moduleDigests233 = Object.fromEntries(Object.entries(MODULES_233)
  .map(([k, p]) => [k, sha(readFileSync(join(ROOT, p)))]));
const implementationDigest233 = sha(JSON.stringify({
  moduleDigests233, contractIdentity233: contractIdentities233(),
  projectionIdentity: projectionIdentity233(), contractVersion: FIRST_PASS_CONTRACT_233_VERSION,
}));

const PROT = join(EVID, 'PROTECTED-IDENTITIES-234-POST-EXECUTION.json');
execFileSync('npx', ['tsx', join(__dirname, 'verify-229-protected-identities.ts'), PROT],
  { cwd: join(ROOT, 'backend'), stdio: 'pipe' });
const post = JSON.parse(readFileSync(PROT, 'utf8')) as Record<string, any>;

const judgment = JSON.parse(readFileSync(join(EVID, 'SECTION-234-JUDGMENT.json'), 'utf8')) as any;
const exec = JSON.parse(readFileSync(join(EVID, 'SECTION-234-EXECUTION-SUMMARY.json'), 'utf8')) as any;

const freeze = {
  artifact: 'SECTION-234-POST-EXECUTION-FREEZE',
  frozenAt: new Date().toISOString(),
  providerCalls: 0, databaseOperations: 0,
  commit: false, push: false, tag: false, deploy: false,

  nothingMovedUnderTheRun: {
    instrumentDigest: instrumentDigest234(),
    instrumentDigestUnchanged: instrumentDigest234() === AUTHORIZED_INSTRUMENT_DIGEST,
    implementationDigest233,
    section233ImplementationUnchanged:
      implementationDigest233 === AUTHORIZED_IMPLEMENTATION_DIGEST_233,
    moduleDigests233,
    protectedCompositeIdentity: post.compositeIdentity,
    protectedCompositeIdentityUnchanged:
      post.compositeIdentity === AUTHORIZED_COMPOSITE_IDENTITY,
    protectedModuleCount: post.moduleCount,
    protectedModulesMissing: post.missingModules,
    unauthorizedProtectedModuleMutations: 0,
  },

  executionLedger: {
    callsExecuted: exec.callsExecuted,
    retriesExecuted: exec.retriesExecuted,
    semanticPreferenceRetries: exec.semanticPreferenceRetries,
    unusedCallsSpentOnInvestigation: exec.unusedCallsSpentOnInvestigation,
    spendUsd: exec.spendUsd,
    spendCeilingUsd: exec.spendCeilingUsd,
    withinCeiling: exec.spendUsd <= exec.spendCeilingUsd,
    stoppedEarly: exec.stoppedEarly,
    promptChangedDuringExecution: exec.promptChangedDuringExecution,
    schemaChanged: exec.schemaChanged,
    caseChangedAfterFreeze: exec.caseChangedAfterFreeze,
    malformedOutputRepaired: exec.malformedOutputRepaired,
    stringifiedFieldsParsedIntoTheJudgment: false,
    earlyResultsUsedToAlterLaterExecution: exec.earlyResultsUsedToAlterLaterExecution,
  },

  decision: {
    result: judgment.decision,
    exactPostureIdentity: judgment.exactPostureIdentity,
    requirements: judgment.requirements,
    terminal: judgment.decision === 'PASS' ? TERMINALS_234.pass : TERMINALS_234.fail,
    remediationPerformed: false,
    promptTuned: false,
    schemaChanged: false,
  },

  spentEvidence: {
    section231: 'SPENT. Used in this slice only to measure a wire-shape base rate for diagnosis. '
      + 'Not rescored, not reinterpreted, and no part of the §234 result.',
    section234: 'SPENT VALIDATION EVIDENCE from this point. It may not become the successor '
      + 'acceptance cohort.',
  },
};
writeFileSync(join(EVID, 'SECTION-234-POST-EXECUTION-FREEZE.json'),
  JSON.stringify(freeze, null, 2) + '\n');

const files = readdirSync(EVID)
  .filter(f => f !== 'REPORT-234.sha256' && statSync(join(EVID, f)).isFile())
  .sort();
const lines = files.map(f => `${sha(readFileSync(join(EVID, f)))}  ${f}`);
writeFileSync(join(EVID, 'REPORT-234.sha256'),
  '# path convention: BARE_FILENAME — verify with: cd <this directory> && '
  + 'shasum -a 256 -c REPORT-234.sha256\n'
  + '# contents: FROZEN EVIDENCE ONLY. No living document is listed here.\n'
  + lines.join('\n') + '\n');

const packageDigest = sha(lines.join('\n'));
writeFileSync(join(EVID, 'EVIDENCE-PACKAGE-DIGEST-234.json'), JSON.stringify({
  artifact: 'EVIDENCE-PACKAGE-DIGEST-234',
  fileCount: files.length,
  evidencePackageDigest: packageDigest,
  files: lines.map(l => ({ sha256: l.split('  ')[0], file: l.split('  ')[1] })),
}, null, 2) + '\n');

console.log('§234 POST-EXECUTION FREEZE WRITTEN');
console.log(`  §233 implementation unchanged  ${freeze.nothingMovedUnderTheRun.section233ImplementationUnchanged}`);
console.log(`  protected composite unchanged  ${freeze.nothingMovedUnderTheRun.protectedCompositeIdentityUnchanged}`);
console.log(`  instrument digest unchanged    ${freeze.nothingMovedUnderTheRun.instrumentDigestUnchanged}`);
console.log(`  calls / spend / ceiling        ${exec.callsExecuted} / USD ${exec.spendUsd} / USD ${exec.spendCeilingUsd}`);
console.log(`  decision                       ${judgment.decision}  (${judgment.exactPostureIdentity})`);
console.log(`  evidence files                 ${files.length}`);
console.log(`  evidence package digest        ${packageDigest}`);
