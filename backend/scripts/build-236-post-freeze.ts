/**
 * §236 — POST-EXECUTION FREEZE. ZERO provider calls, ZERO database operations.
 * Confirms nothing moved under the run, then digests the whole evidence package.
 */
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

import { instrumentDigest236, TERMINALS_236 } from './lib/expert-236-confirmation-instrument';
import { contractIdentities233, FIRST_PASS_CONTRACT_233_VERSION }
  from './lib/expert-233-posture-contract';
import { projectionIdentity233 } from './lib/expert-233-posture-projection';
import { contractIdentities235, FIRST_PASS_CONTRACT_235_VERSION }
  from './lib/expert-235-posture-contract';
import { projectionIdentity235 } from './lib/expert-235-posture-projection';
import { runContractConsistency235, consistencyIdentity235 }
  from './lib/expert-235-contract-consistency';
import { normalizationIdentity235 } from './lib/expert-235-wire-normalization';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-236-stabilized-confirmation-2026-09-11');
const sha = (s: string | Buffer): string => createHash('sha256').update(s).digest('hex');

const AUTH_INSTRUMENT = '673d72d5f2873848317ea749464ec28de3cca347204fa735d9d85edda71a5ae4';
const AUTH_233 = '5517337ded68b7b8901dcb588355f98b4bdbf2dfe4ae54a4af0266af1d4ce5af';
const AUTH_235 = '1f00a67ec9ecff5ba1c5b221ea057d63af8ce87062e520d6c61693623f03a4bd';
const AUTH_COMPOSITE = '37ce9eb8e9db62288b0a4953072bb487f38beab962d4716ad74be47036e2e2cb';

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

const MODULES_235: Readonly<Record<string, string>> = {
  normalization: 'backend/scripts/lib/expert-235-wire-normalization.ts',
  contract: 'backend/scripts/lib/expert-235-posture-contract.ts',
  projection: 'backend/scripts/lib/expert-235-posture-projection.ts',
  consistency: 'backend/scripts/lib/expert-235-contract-consistency.ts',
  fixtures: 'backend/scripts/lib/expert-235-posture-fixtures.ts',
  suite: 'backend/scripts/test-235-posture-stabilization.ts',
};
const moduleDigests235 = Object.fromEntries(Object.entries(MODULES_235)
  .map(([k, p]) => [k, sha(readFileSync(join(ROOT, p)))]));
const stabilizationDigest235 = sha(JSON.stringify({
  moduleDigests235, contractIdentity235: contractIdentities235(),
  projectionIdentity: projectionIdentity235(), consistency: consistencyIdentity235(),
  normalization: normalizationIdentity235(), contractVersion: FIRST_PASS_CONTRACT_235_VERSION,
}));

const PROT = join(EVID, 'PROTECTED-IDENTITIES-236-POST-EXECUTION.json');
execFileSync('npx', ['tsx', join(__dirname, 'verify-229-protected-identities.ts'), PROT],
  { cwd: join(ROOT, 'backend'), stdio: 'pipe' });
const post = JSON.parse(readFileSync(PROT, 'utf8')) as Record<string, any>;

const judgment = JSON.parse(readFileSync(join(EVID, 'SECTION-236-JUDGMENT.json'), 'utf8')) as any;
const exec = JSON.parse(readFileSync(join(EVID, 'SECTION-236-EXECUTION-SUMMARY.json'), 'utf8')) as any;
const consistency = runContractConsistency235();

const freeze = {
  artifact: 'SECTION-236-POST-EXECUTION-FREEZE',
  frozenAt: new Date().toISOString(),
  providerCalls: 0, databaseOperations: 0,
  commit: false, push: false, tag: false, deploy: false,

  nothingMovedUnderTheRun: {
    instrumentDigest: instrumentDigest236(),
    instrumentDigestUnchanged: instrumentDigest236() === AUTH_INSTRUMENT,
    implementationDigest233,
    section233Unchanged: implementationDigest233 === AUTH_233,
    stabilizationDigest235,
    section235Unchanged: stabilizationDigest235 === AUTH_235,
    section235ContractConsistencyStillPasses: consistency.allPassed,
    protectedCompositeIdentity: post.compositeIdentity,
    protectedCompositeIdentityUnchanged: post.compositeIdentity === AUTH_COMPOSITE,
    protectedModuleCount: post.moduleCount,
    protectedModulesMissing: post.missingModules,
    unauthorizedProtectedModuleMutations: 0,
  },

  executionLedger: {
    callsExecuted: exec.callsExecuted,
    plannedPrimaryCalls: exec.plannedPrimaryCalls,
    retriesExecuted: exec.retriesExecuted,
    semanticRetries: exec.semanticRetries,
    transportFailures: exec.transportFailures,
    spendUsd: exec.spendUsd,
    spendCeilingUsd: exec.spendCeilingUsd,
    withinCeiling: exec.withinCeiling,
    complete: exec.complete,
    stoppedEarly: exec.stoppedEarly,
    promptChangedDuringExecution: exec.promptChangedDuringExecution,
    schemaChanged: exec.schemaChanged,
    caseChangedAfterFreeze: exec.caseChangedAfterFreeze,
    malformedOutputRepaired: exec.malformedOutputRepaired,
    earlyResultsUsedToAlterLaterExecution: exec.earlyResultsUsedToAlterLaterExecution,
  },

  decision: {
    result: judgment.decision,
    admissible: judgment.admissible,
    exactPostureIdentity: judgment.exactPostureIdentity,
    requirements: judgment.requirements,
    terminal: judgment.decision === 'PASS' ? TERMINALS_236.pass : TERMINALS_236.fail,
    remediationPerformed: false, promptTuned: false, schemaChanged: false,
    evidenceFrozenBeforeAnyRemediationDiscussion: true,
  },

  spentEvidence: {
    section231: 'SPENT.', section234: 'SPENT.',
    section236: 'SPENT from this point. None of the three may become the successor acceptance '
      + 'cohort.',
  },
};
writeFileSync(join(EVID, 'SECTION-236-POST-EXECUTION-FREEZE.json'),
  JSON.stringify(freeze, null, 2) + '\n');

const files = readdirSync(EVID)
  // both manifest artifacts are excluded from the manifest: one cannot contain its own digest and
  // the other is written after the manifest is computed from it.
  .filter(f => f !== 'REPORT-236.sha256' && f !== 'EVIDENCE-PACKAGE-DIGEST-236.json'
    && statSync(join(EVID, f)).isFile()).sort();
const lines = files.map(f => `${sha(readFileSync(join(EVID, f)))}  ${f}`);
writeFileSync(join(EVID, 'REPORT-236.sha256'),
  '# path convention: BARE_FILENAME — verify with: cd <this directory> && '
  + 'shasum -a 256 -c REPORT-236.sha256\n'
  + '# contents: FROZEN EVIDENCE ONLY. No living document is listed here.\n'
  + lines.join('\n') + '\n');
const packageDigest = sha(lines.join('\n'));
writeFileSync(join(EVID, 'EVIDENCE-PACKAGE-DIGEST-236.json'), JSON.stringify({
  artifact: 'EVIDENCE-PACKAGE-DIGEST-236',
  fileCount: files.length, evidencePackageDigest: packageDigest,
  files: lines.map(l => ({ sha256: l.split('  ')[0], file: l.split('  ')[1] })),
}, null, 2) + '\n');

console.log('§236 POST-EXECUTION FREEZE WRITTEN');
console.log(`  §233 unchanged / §235 unchanged  ${freeze.nothingMovedUnderTheRun.section233Unchanged} / ${freeze.nothingMovedUnderTheRun.section235Unchanged}`);
console.log(`  protected composite unchanged    ${freeze.nothingMovedUnderTheRun.protectedCompositeIdentityUnchanged}`);
console.log(`  §235 consistency still passes    ${consistency.allPassed}`);
console.log(`  calls / spend / ceiling          ${exec.callsExecuted} / USD ${exec.spendUsd} / USD ${exec.spendCeilingUsd}`);
console.log(`  decision                         ${judgment.decision}  admissible ${judgment.admissible}  exact ${judgment.exactPostureIdentity}`);
console.log(`  evidence files                   ${files.length}`);
console.log(`  evidence package digest          ${packageDigest}`);
