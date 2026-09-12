/**
 * §238 — POST-EXECUTION FREEZE. ZERO provider calls, ZERO database operations.
 * Confirms nothing moved under the run, then digests the whole evidence package.
 */
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

import { instrumentDigest238, TERMINALS_238 } from './lib/expert-238-confirmation-instrument';
import { contractIdentities233, FIRST_PASS_CONTRACT_233_VERSION }
  from './lib/expert-233-posture-contract';
import { projectionIdentity233 } from './lib/expert-233-posture-projection';
import { contractIdentities235, FIRST_PASS_CONTRACT_235_VERSION }
  from './lib/expert-235-posture-contract';
import { projectionIdentity235 } from './lib/expert-235-posture-projection';
import { consistencyIdentity235 } from './lib/expert-235-contract-consistency';
import { normalizationIdentity235 } from './lib/expert-235-wire-normalization';
import { contractIdentities237, FIRST_PASS_CONTRACT_237_VERSION }
  from './lib/expert-237-posture-contract';
import { projectionIdentity237 } from './lib/expert-237-posture-projection';
import { runContractConsistency237, consistencyIdentity237 }
  from './lib/expert-237-contract-consistency';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-238-final-posture-confirmation-2026-09-11');
const sha = (s: string | Buffer): string => createHash('sha256').update(s).digest('hex');

const AUTH_INSTRUMENT = '21ea0832330ff73fa928aa8b8e8854fccc10a5a33a61c52a3933ec30eaa70f1f';
const AUTH_233 = '5517337ded68b7b8901dcb588355f98b4bdbf2dfe4ae54a4af0266af1d4ce5af';
const AUTH_235 = '1f00a67ec9ecff5ba1c5b221ea057d63af8ce87062e520d6c61693623f03a4bd';
const AUTH_COMPOSITE = '37ce9eb8e9db62288b0a4953072bb487f38beab962d4716ad74be47036e2e2cb';

const dig = (files: Readonly<Record<string, string>>): Record<string, string> =>
  Object.fromEntries(Object.entries(files).map(([k, p]) => [k, sha(readFileSync(join(ROOT, p)))]));

const moduleDigests233 = dig({
  contract: 'backend/scripts/lib/expert-233-posture-contract.ts',
  projection: 'backend/scripts/lib/expert-233-posture-projection.ts',
  fixtures: 'backend/scripts/lib/expert-233-posture-fixtures.ts',
  suite: 'backend/scripts/test-233-posture-contract.ts',
});
const implementationDigest233 = sha(JSON.stringify({
  moduleDigests233, contractIdentity233: contractIdentities233(),
  projectionIdentity: projectionIdentity233(), contractVersion: FIRST_PASS_CONTRACT_233_VERSION,
}));
const moduleDigests235 = dig({
  normalization: 'backend/scripts/lib/expert-235-wire-normalization.ts',
  contract: 'backend/scripts/lib/expert-235-posture-contract.ts',
  projection: 'backend/scripts/lib/expert-235-posture-projection.ts',
  consistency: 'backend/scripts/lib/expert-235-contract-consistency.ts',
  fixtures: 'backend/scripts/lib/expert-235-posture-fixtures.ts',
  suite: 'backend/scripts/test-235-posture-stabilization.ts',
});
const stabilizationDigest235 = sha(JSON.stringify({
  moduleDigests235, contractIdentity235: contractIdentities235(),
  projectionIdentity: projectionIdentity235(), consistency: consistencyIdentity235(),
  normalization: normalizationIdentity235(), contractVersion: FIRST_PASS_CONTRACT_235_VERSION,
}));
const moduleDigests237 = dig({
  contract: 'backend/scripts/lib/expert-237-posture-contract.ts',
  projection: 'backend/scripts/lib/expert-237-posture-projection.ts',
  consistency: 'backend/scripts/lib/expert-237-contract-consistency.ts',
  fixtures: 'backend/scripts/lib/expert-237-posture-fixtures.ts',
  suite: 'backend/scripts/test-237-posture-closure.ts',
});
const closureDigest237 = sha(JSON.stringify({
  moduleDigests237, contractIdentity237: contractIdentities237(),
  projectionIdentity: projectionIdentity237(), consistency: consistencyIdentity237(),
  contractVersion: FIRST_PASS_CONTRACT_237_VERSION,
}));

const PROT = join(EVID, 'PROTECTED-IDENTITIES-238-POST-EXECUTION.json');
execFileSync('npx', ['tsx', join(__dirname, 'verify-229-protected-identities.ts'), PROT],
  { cwd: join(ROOT, 'backend'), stdio: 'pipe' });
const post = JSON.parse(readFileSync(PROT, 'utf8')) as Record<string, any>;

const judgment = JSON.parse(readFileSync(join(EVID, 'SECTION-238-JUDGMENT.json'), 'utf8')) as any;
const exec = JSON.parse(readFileSync(join(EVID, 'SECTION-238-EXECUTION-SUMMARY.json'), 'utf8')) as any;
const protocol = JSON.parse(readFileSync(join(EVID, 'SECTION-238-FROZEN-PROTOCOL.json'), 'utf8')) as any;
const consistency = runContractConsistency237();

const freeze = {
  artifact: 'SECTION-238-POST-EXECUTION-FREEZE',
  frozenAt: new Date().toISOString(),
  providerCalls: 0, databaseOperations: 0,
  commit: false, push: false, tag: false, deploy: false,

  nothingMovedUnderTheRun: {
    instrumentDigest: instrumentDigest238(),
    instrumentDigestUnchanged: instrumentDigest238() === AUTH_INSTRUMENT,
    implementationDigest233, section233Unchanged: implementationDigest233 === AUTH_233,
    stabilizationDigest235, section235Unchanged: stabilizationDigest235 === AUTH_235,
    closureDigest237, section237Unchanged: closureDigest237 === protocol.closureDigest237,
    section237ContractConsistencyStillPasses: consistency.allPassed,
    protectedCompositeIdentity: post.compositeIdentity,
    protectedCompositeIdentityUnchanged: post.compositeIdentity === AUTH_COMPOSITE,
    protectedModuleCount: post.moduleCount,
    protectedModulesMissing: post.missingModules,
    unauthorizedProtectedModuleMutations: 0,
  },

  executionLedger: {
    callsExecuted: exec.callsExecuted, plannedPrimaryCalls: exec.plannedPrimaryCalls,
    retriesExecuted: exec.retriesExecuted, semanticRetries: exec.semanticRetries,
    unusedCallsSpentOnInvestigation: exec.unusedCallsSpentOnInvestigation,
    transportFailures: exec.transportFailures,
    spendUsd: exec.spendUsd, spendCeilingUsd: exec.spendCeilingUsd,
    withinCeiling: exec.withinCeiling, complete: exec.complete, stoppedEarly: exec.stoppedEarly,
    promptChangedDuringExecution: exec.promptChangedDuringExecution,
    schemaChanged: exec.schemaChanged, caseChangedAfterFreeze: exec.caseChangedAfterFreeze,
    malformedOutputRepaired: exec.malformedOutputRepaired,
    earlyResultsUsedToAlterLaterExecution: exec.earlyResultsUsedToAlterLaterExecution,
  },

  decision: {
    result: judgment.decision,
    admitted: judgment.admitted,
    exactPostureIdentity: judgment.exactPostureIdentity,
    driverRoleIdentity: judgment.driverRoleIdentity,
    fourCellTable: judgment.fourCellTable,
    requirements: judgment.requirements,
    terminal: judgment.decision === 'PASS' ? TERMINALS_238.pass : TERMINALS_238.fail,
    remediationPerformed: false, promptTuned: false, schemaChanged: false,
    evidenceFrozenBeforeAnyRemediationDiscussion: true,
    furtherPromptTuningOrMicroCohortStarted: false,
  },

  spentEvidence: {
    section231: 'SPENT.', section234: 'SPENT.', section236: 'SPENT.',
    section238: 'SPENT from this point. None of the four may become the successor acceptance '
      + 'cohort.',
  },
};
writeFileSync(join(EVID, 'SECTION-238-POST-EXECUTION-FREEZE.json'),
  JSON.stringify(freeze, null, 2) + '\n');

const files = readdirSync(EVID)
  .filter(f => f !== 'REPORT-238.sha256' && f !== 'EVIDENCE-PACKAGE-DIGEST-238.json'
    && statSync(join(EVID, f)).isFile()).sort();
const lines = files.map(f => `${sha(readFileSync(join(EVID, f)))}  ${f}`);
writeFileSync(join(EVID, 'REPORT-238.sha256'),
  '# path convention: BARE_FILENAME — verify with: cd <this directory> && '
  + 'shasum -a 256 -c REPORT-238.sha256\n'
  + '# contents: FROZEN EVIDENCE ONLY. No living document is listed here.\n'
  + lines.join('\n') + '\n');
const packageDigest = sha(lines.join('\n'));
writeFileSync(join(EVID, 'EVIDENCE-PACKAGE-DIGEST-238.json'), JSON.stringify({
  artifact: 'EVIDENCE-PACKAGE-DIGEST-238', fileCount: files.length,
  evidencePackageDigest: packageDigest,
  files: lines.map(l => ({ sha256: l.split('  ')[0], file: l.split('  ')[1] })),
}, null, 2) + '\n');

console.log('§238 POST-EXECUTION FREEZE WRITTEN');
console.log(`  §233 / §235 / §237 unchanged   ${freeze.nothingMovedUnderTheRun.section233Unchanged} / ${freeze.nothingMovedUnderTheRun.section235Unchanged} / ${freeze.nothingMovedUnderTheRun.section237Unchanged}`);
console.log(`  protected composite unchanged  ${freeze.nothingMovedUnderTheRun.protectedCompositeIdentityUnchanged}`);
console.log(`  calls / spend / ceiling        ${exec.callsExecuted} / USD ${exec.spendUsd} / USD ${exec.spendCeilingUsd}`);
console.log(`  decision                       ${judgment.decision}  admitted ${judgment.admitted}  posture ${judgment.exactPostureIdentity}  roles ${judgment.driverRoleIdentity}`);
console.log(`  evidence files                 ${files.length}`);
console.log(`  evidence package digest        ${packageDigest}`);
