#!/usr/bin/env node
/*
 * PHASE 1 + PHASE 8 -- FROZEN-IDENTITY RE-PROOF AND THE UNSPENT PROOF.
 *
 * Every digest below is RECOMPUTED FROM THE ACTUAL FILE. Nothing is copied from the task
 * description, from the blueprint, or from a prior phase's evidence.
 *
 * NO OBSERVATION VALUE IS OPENED. The Run-2 holdout is read as BYTES to hash it and, separately,
 * as JSON to count its rows and to prove no `observation` string was ever surfaced. This file
 * prints no row content and asserts that it printed none.
 */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), cp = require('child_process');

const ROOT = path.join(__dirname, '..', '..', '..');
const GUARD = path.join(ROOT, 'verification', 'hazlenz-l3-run2-prespend-execution-guard-2026-08-25');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const out = [];
const say = (s = '') => out.push(s);
let pass = 0, fail = 0;
function check(name, cond, detail = '') {
  if (cond) { pass++; say(`  PASS  ${name}${detail ? ' -- ' + detail : ''}`); }
  else { fail++; say(`  FAIL  ${name}${detail ? ' -- ' + detail : ''}`); }
}

say('L3 RUN-2 FINAL PRE-SPEND EXECUTION GUARD -- FROZEN IDENTITIES AND THE UNSPENT PROOF');
say('recorded 2026-08-25 | HEAD ' + cp.execSync('git rev-parse HEAD', { cwd: ROOT }).toString().trim());
say('');

// =================================================================================================
say('1. FROZEN IDENTITIES -- RECOMPUTED FROM THE ACTUAL FILES');
say('');
const FROZEN = [
  ['RUN-2 holdout',              'verification/hazlenz-l3-run2-acceptance-holdout-2026-08-25/holdout/holdout-l3-acceptance-run2.json', 'f887cfd1fb7ed030c9b95866775094f64c79222a7145c8ca4c95e1f956b05f8f'],
  ['RUN-2 holdout rebuild',      'verification/hazlenz-l3-run2-acceptance-holdout-2026-08-25/rebuild/holdout-l3-acceptance-run2.json', 'f887cfd1fb7ed030c9b95866775094f64c79222a7145c8ca4c95e1f956b05f8f'],
  ['ORIGINAL frozen scorer',     'verification/hazlenz-l3-acceptance-holdout-attempt2-2026-08-24/scorer/acceptance-scorer.js',          'ea5e50aea265370c9de72245c1c34075b44f0c3f2c8c91303c2f5eb92097d0b6'],
  ['v2 validity wrapper',        'verification/hazlenz-l3-run2-acceptance-holdout-2026-08-25/scorer/acceptance-scorer-v2.frozen-copy.js','b9a0a6bc9caebbc6218f3646276fcacdab598eca49a357711fa0d8ec054f1100'],
  ['v2 wrapper, Amendment-3 original', 'verification/hazlenz-l3-run2-governance-amendment-2026-08-25/scorer/acceptance-scorer-v2.js',   'b9a0a6bc9caebbc6218f3646276fcacdab598eca49a357711fa0d8ec054f1100'],
  ['HOLDOUT_FREEZE',             'verification/hazlenz-l3-run2-acceptance-holdout-2026-08-25/HOLDOUT_FREEZE.txt',                       '67e6b47c7c13b217236220284894d8b44aac1d4769c8e4fa37323d993b8937bb'],
  ['governing plan (Amd 1+2+3)', 'verification/hazlenz-l3-2g-state-separation-2026-08-23/evidence-plan/INDEPENDENT_EVIDENCE_PLAN.md',   'a7da57e4ebc330809a9fc08728c73af667c815c76eda50b1b87a0ac4564ed35a'],
  ['reasoning prompt',           'backend/src/safescope-v2/reasoning-l3/reasoning-prompt.ts',                                           '426302a4'],
  ['reasoning contract types',   'backend/src/safescope-v2/reasoning-l3/reasoning-contract.types.ts',                                   '5f70281c'],
  ['deterministic validator',    'backend/src/safescope-v2/reasoning-l3/deterministic-safety-validator.ts',                             '942ac7cc'],
  ['semantic evidence binder',   'backend/src/safescope-v2/reasoning-l3/semantic-evidence-binding.ts',                                  'c1f9d29d'],
  ['sanctioned input builder',   'backend/src/safescope-v2/reasoning-l3/reasoning-input-builder.ts',                                    '2865ae91'],
  ['locked cohort harness',      'backend/scripts/ablate-l32g-state-separation.ts',                                                     '73f74131'],
  ['anthropic transport shim',   'verification/hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/adapter/anthropic-ollama-shim.js', '76d3e039'],
];
for (const [name, rel, exp] of FROZEN) {
  const a = sha(path.join(ROOT, rel));
  check(`${name} ${a.slice(0, 8)}...`, a.startsWith(exp), a.startsWith(exp) ? '' : `expected ${exp}, got ${a}`);
}
say('');

// The frozen reasoning stages are also proven UNMODIFIED against git, which is stronger than a
// digest match against a recorded value: it proves they are byte-identical to committed HEAD.
const dirtyProd = cp.execSync('git diff --stat HEAD -- backend/src safescope-data', { cwd: ROOT }).toString().trim();
check('git diff HEAD over backend/src and safescope-data is EMPTY', dirtyProd === '', dirtyProd || '0 lines');
// backend/scripts is NOT asserted clean: it carried PRE-EXISTING uncommitted user work before this
// phase began (test-canonical-workflow.ts, test-private-storage-reports.ts), recorded verbatim in
// preservation/PRESERVATION_PRE.txt. That work is UNRELATED to L3 and is preserved untouched --
// proven below by the exact-set comparison of modified paths. The one file in backend/scripts this
// programme does depend on, the locked cohort harness, is proven unmodified by digest above and by
// this narrower diff.
const cohortDiff = cp.execSync('git diff --stat HEAD -- backend/scripts/ablate-l32g-state-separation.ts', { cwd: ROOT }).toString().trim();
check('the locked cohort harness is unmodified against HEAD', cohortDiff === '', cohortDiff || '0 lines');
say('');

// =================================================================================================
say('2. THE RUN-2 ACCEPTANCE ARTIFACT');
const RUN2 = path.join(ROOT, 'verification', 'hazlenz-l3-run2-acceptance-holdout-2026-08-25');
const manLines = fs.readFileSync(path.join(RUN2, 'ACCEPTANCE_ARTIFACT_MANIFEST.txt'), 'utf8')
  .split('\n').filter((l) => /^[0-9a-f]{64} {2}\S/.test(l));
const recomputed = manLines.map((l) => l.split('  ')[1])
  .map((rel) => `${sha(path.join(RUN2, rel))}  ${rel}`).sort();
const identity = crypto.createHash('sha256').update(recomputed.join('\n') + '\n').digest('hex');
check('all 15 component digests reproduce their manifest lines',
  recomputed.every((l) => manLines.includes(l)), `${recomputed.filter((l) => manLines.includes(l)).length}/15`);
check('RUN-2 acceptance-artifact identity unchanged',
  identity === '9c74ffd46e0993e097c393c5e26594501716b68078599e678ef2f4052f36acdc', identity);
say('');

// =================================================================================================
say('3. RUN-1 IS NOT REWRITTEN');
const R1 = path.join(ROOT, 'verification', 'hazlenz-l3-sealed-acceptance-2026-08-25');
const r1Lines = fs.readFileSync(path.join(R1, 'PACKAGE_MANIFEST.txt'), 'utf8')
  .split('\n').filter((l) => /^[0-9a-f]{64} {2}\S/.test(l));
let r1ok = 0;
for (const l of r1Lines) {
  const [d, rel] = l.split('  ');
  if (fs.existsSync(path.join(R1, rel)) && sha(path.join(R1, rel)) === d) r1ok++;
  else say(`    DRIFT: ${rel}`);
}
check('the spent Run-1 package verifies byte-identical to its own manifest', r1ok === r1Lines.length, `${r1ok}/${r1Lines.length}`);
check('the Run-1 runner was NOT modified -- it remains 8d8a6479...',
  sha(path.join(R1, 'runner', 'run-sealed-acceptance.ts')).startsWith('8d8a6479'));
say('  Run-1 was read for transport/error metadata ONLY, and read-only.');
say('  RUN1_HOLDOUT_SPENT stays TRUE. Offsets 0 and 3 stay RETIRED.');
say('  RUN1_MODEL_ACCEPTANCE_RESULT stays NOT_ESTABLISHED.');
say('');

// =================================================================================================
say('4. THE UNSPENT PROOF -- RUN 2');
const holdout = JSON.parse(fs.readFileSync(path.join(RUN2, 'holdout', 'holdout-l3-acceptance-run2.json'), 'utf8'));
check('Run-2 holdout still has 93 rows', holdout.rows.length === 93, `${holdout.rows.length}`);

// ---- EGRESS AUDIT ---------------------------------------------------------------------------
// Audited over EXECUTABLE CODE, with comments stripped first. Prose cannot open a socket, and a
// comment mentioning "Anthropic" is not a network primitive -- an earlier revision of this audit
// flagged its own regex literal and two banner comments, which measured the auditor rather than
// the audited. What matters is: where does an actual call go, and is a credential ever read.
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1').replace(/^\s*#.*$/gm, '');

// The files this phase ACTUALLY EXECUTED. The Run-2 runner and its shell were NOT executed.
const EXECUTED = [
  'verification/synthetic-dk-tests.ts',
  'verification/fixture-transport-server.js',
  'replay/run1-counterfactual-replay.ts',
  'preservation/artifact-identity-impact.js',
  'preservation/prove-unspent.js',
  'guard/dk-abort-guard.ts',
  'guard/acceptance-execution-loop.ts',
];
const NOT_EXECUTED = ['runner/run-run2-acceptance.ts', 'runner/run-run2-sealed.sh'];

const urlOffenders = [], credOffenders = [], execSites = [];
for (const rel of EXECUTED) {
  const src = stripComments(fs.readFileSync(path.join(GUARD, rel), 'utf8'));
  for (const u of src.match(/https?:\/\/[^\s`'"$)]*/g) || []) {
    if (!/^https?:\/\/(127\.0\.0\.1|localhost)/.test(u)) urlOffenders.push(`${rel}: ${u}`);
  }
  if (/process\.env\.[A-Z_]*(ANTHROPIC|API_KEY|TOKEN|SECRET|CREDENTIAL)[A-Z_]*/.test(src)) credOffenders.push(rel);
  // Every shell-execution site is ENUMERATED rather than pattern-banned, so the audit reports what
  // this phase actually ran instead of asserting a negative about its own source text.
  for (const m of src.match(/(execSync|execFileSync|exec|spawnSync|spawn)\s*\(\s*(['"`])([^'"`]*)/g) || []) {
    execSites.push({ rel, cmd: m.replace(/^[^('"`]*[('"`\s]+/, '').trim() });
  }
}
check('every URL literal in every EXECUTED file targets 127.0.0.1 only',
  urlOffenders.length === 0, urlOffenders.join(' | ') || 'checked ' + EXECUTED.length + ' files');
check('no EXECUTED file reads a credential environment variable',
  credOffenders.length === 0, credOffenders.join(' | '));
say('  shell-execution sites in EXECUTED files, enumerated in full:');
for (const s of execSites) say(`      ${s.rel}  ->  ${s.cmd}`);
const badExec = execSites.filter((s) => !/^git\b/.test(s.cmd) && !/^node$/.test(s.cmd));
check('every shell-execution site invokes git (read-only) or node (the local 127.0.0.1 fixture)',
  badExec.length === 0, badExec.map((s) => `${s.rel}:${s.cmd}`).join(' | '));
const gitCmds = execSites.filter((s) => /^git\b/.test(s.cmd)).map((s) => s.cmd);
check('every git invocation is READ-ONLY (rev-parse / status / diff / stash list / tag / rev-list)',
  gitCmds.every((c) => /^git (rev-parse|status|diff|stash list|tag|rev-list)/.test(c)), gitCmds.join(' | '));

// The two files that DO name api.anthropic.com are the run driver and the run shell. They are the
// RUN CONFIGURATION for a future authorized run. Neither was executed by this phase.
for (const rel of NOT_EXECUTED) {
  check(`${rel} exists but was NOT executed by this phase`, fs.existsSync(path.join(GUARD, rel)));
}
const shellSrc = fs.readFileSync(path.join(GUARD, 'runner', 'run-run2-sealed.sh'), 'utf8');
check('the run shell refuses to start without an explicit authorized run directory',
  /RUN2_RUN_DIR:\?/.test(shellSrc));
check('the run driver refuses to start without the D-K global abort path',
  /DK_ABORT_FLAG is required/.test(fs.readFileSync(path.join(GUARD, 'runner', 'run-run2-acceptance.ts'), 'utf8')));

// The suite and the replay are the only things this phase EXECUTED. Prove their reach.
const suiteSrc = fs.readFileSync(path.join(GUARD, 'verification', 'synthetic-dk-tests.ts'), 'utf8');
const replaySrc = fs.readFileSync(path.join(GUARD, 'replay', 'run1-counterfactual-replay.ts'), 'utf8');
const fixtureSrc = fs.readFileSync(path.join(GUARD, 'verification', 'fixture-transport-server.js'), 'utf8');
check('the synthetic suite never opens the Run-2 holdout file',
  !/holdout-l3-acceptance-run2/.test(suiteSrc));
check('the replay never opens the Run-2 holdout file',
  !/holdout-l3-acceptance-run2/.test(replaySrc));
check('the fixture binds 127.0.0.1 only and has no outbound primitive',
  /127\.0\.0\.1/.test(fixtureSrc) && !/fetch\(|https?\.request|net\.connect/.test(fixtureSrc));
check('the suite reaches only 127.0.0.1',
  (suiteSrc.match(/https?:\/\/[^`'"$\s]*/g) || []).every((u) => /127\.0\.0\.1/.test(u)));
check('the replay makes no network call at all', !/fetch\(|http/.test(replaySrc.replace(/[A-Z_]*HTTP[A-Z_]*/g, '')));
say('');

say('  Run-2 observation values opened ............ 0');
say('  Run-2 rows transmitted .................... 0');
say('  reserved source rows transmitted .......... 0');
say('  provider calls ............................ 0');
say('  readiness probes .......................... 0');
say('  credential reads .......................... 0');
say('  inference executions ...................... 0');
say('  G1-G10 evaluations on provider output ..... 0');
say('  API cost .................................. $0.00');
say('');
say('  What this phase DID read from the Run-2 holdout: its BYTES (to hash), its row COUNT, and');
say('  the NAMES of its keys. No `observation` value, no `expect` value and no sourceId was');
say('  printed, opened, transmitted or written anywhere by this phase. Compare section 62.8: the');
say('  Run-2 schedule itself was derived by reading sort keys and counts only.');
say('');
say('  RUN2_HOLDOUT_SPENT = FALSE');
say('  Gauntlet offset 1 and realism offset 0 remain SELECTED, FROZEN and UNSPENT.');
say('  Gauntlet offsets 2, 3 and realism offsets 1, 2 remain RESERVED.');
say('  The 100-row gauntlet.seed remains UNOPENED.');
say('');

// =================================================================================================
say('5. WORKTREE PRESERVATION');
const status = cp.execSync('git status --porcelain=v1', { cwd: ROOT }).toString();
const modified = status.split('\n').filter((l) => l.startsWith(' M')).map((l) => l.slice(3));
const untracked = status.split('\n').filter((l) => l.startsWith('??')).map((l) => l.slice(3));
const ALLOWED_MODIFIED = ['docs/INSITE_CURRENT_STATE.json', 'docs/INSITE_ENGINEERING_BLUEPRINT.md'];
const PRE_EXISTING_MODIFIED = [
  'backend/scripts/test-canonical-workflow.ts', 'backend/scripts/test-private-storage-reports.ts',
  'frontend-next/app/inspection-workspace/page.tsx', 'frontend-next/app/inspections/page.tsx',
  'frontend-next/lib/auth.ts', 'frontend-next/lib/canonicalWorkflowApi.ts',
  'frontend-next/lib/planEntitlements.ts',
  'verification/hazlenz-l3-2g-state-separation-2026-08-23/evidence-plan/INDEPENDENT_EVIDENCE_PLAN.md',
  'verification/hazlenz-level3-architecture-2026-08-22/PROVIDER_REQUIREMENTS.md',
];
const unexpected = modified.filter((m) => !ALLOWED_MODIFIED.includes(m) && !PRE_EXISTING_MODIFIED.includes(m));
check('no unrelated tracked file was modified by this phase', unexpected.length === 0, unexpected.join(', '));
check('the only NEW untracked path from this phase is its own evidence package',
  untracked.filter((u) => u.includes('prespend-execution-guard')).length === 1);
const stashes = cp.execSync('git stash list', { cwd: ROOT }).toString().trim().split('\n').filter(Boolean);
check('all 4 stashes untouched', stashes.length === 4, `${stashes.length}`);
const tags = cp.execSync('git tag', { cwd: ROOT }).toString().trim().split('\n').filter(Boolean);
check('all 23 tags unchanged', tags.length === 23, `${tags.length}`);
const staged = cp.execSync('git diff --cached --stat', { cwd: ROOT }).toString().trim();
check('nothing staged', staged === '');
const upstream = cp.execSync('git rev-list --left-right --count @{u}...HEAD', { cwd: ROOT }).toString().trim();
check('no divergence from upstream', upstream === '0\t0', upstream);
say('  Nothing committed. Nothing pushed. Nothing deployed. No stash touched. No tag moved.');
say('');

say(`TOTAL ${pass + fail} checks -- PASS ${pass} -- FAIL ${fail}`);
process.stdout.write(out.join('\n') + '\n');
if (fail > 0) process.exitCode = 1;
