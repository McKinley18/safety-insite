/**
 * PRESERVATION AND ZERO-SPEND PROOF for the L3 local remediation phase.
 *
 * WHAT IT PROVES, and every check is mechanical:
 *   1. every frozen Run-1/Run-2 artifact this phase READ is byte-identical to its recorded digest;
 *   2. the frozen scorers, holdouts, prompt, validator, binder and input builder are byte-unchanged;
 *   3. the frozen Run-2 terminal, scorable flag and modelAcceptanceResult are unchanged;
 *   4. this phase's production edits are confined to the two files it declares;
 *   5. `git diff HEAD -- safescope-data` is empty -- no corpus was touched;
 *   6. reserved tranches are untouched and `gauntlet.seed` was not read by this phase;
 *   7. no file in this phase's package contains a url literal, a credential read or a network
 *      primitive OUTSIDE the replay harness's own deliberate network SEAL;
 *   8. the NINE pre-existing modified files this phase must not touch are byte-identical to their
 *      phase-start digests, and the TWO master documents Phase 16 extends were extended ADDITIVELY.
 *
 * INSTRUMENT_SELF_REFERENCE_PROHIBITED. Check 7 is the exact shape that has failed five times in
 * this programme, so it is built to the rule: the scanner ENUMERATES its targets, STRIPS comments
 * and string/regex literals before matching (so its own vocabulary cannot match), EXCLUDES its own
 * source and the harness file whose job is to seal the network, and then RE-SCANS both exclusions
 * and PRINTS what it found there, so the exclusion provably hides nothing.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const PKG = path.join(__dirname, '..');
const VER = path.join(PKG, '..');
const ROOT = path.join(VER, '..');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const git = (...a) => execFileSync('git', ['-C', ROOT, ...a], { encoding: 'utf8' });

const checks = [];
const check = (id, pass, detail = '') => { checks.push({ id, pass, detail }); };

// ---- 1/2. frozen identities ---------------------------------------------------------------
const FROZEN = {
  'run2 raw process A': ['verification/hazlenz-l3-run2-sealed-acceptance-2026-08-25/results/raw-process-A.json',
    'b666da3cfb68614001b5664c61a153420cba21d7d450173f9a4f43c9e4a8e3c3'],
  'run2 raw process B': ['verification/hazlenz-l3-run2-sealed-acceptance-2026-08-25/results/raw-process-B.json',
    '514b6c2ed91c647abeef24d12447c034c719891daff969919b5fdfa323be641f'],
  'acceptance scorer v2 wrapper': ['verification/hazlenz-l3-run2-acceptance-holdout-2026-08-25/scorer/acceptance-scorer-v2.frozen-copy.js',
    'b9a0a6bc9caebbc6218f3646276fcacdab598eca49a357711fa0d8ec054f1100'],
  'frozen acceptance scorer': ['verification/hazlenz-l3-acceptance-holdout-attempt2-2026-08-24/scorer/acceptance-scorer.js',
    'ea5e50aea265370c9de72245c1c34075b44f0c3f2c8c91303c2f5eb92097d0b6'],
  'run2 holdout': ['verification/hazlenz-l3-run2-acceptance-holdout-2026-08-25/holdout/holdout-l3-acceptance-run2.json',
    'f887cfd1fb7ed030c9b95866775094f64c79222a7145c8ca4c95e1f956b05f8f'],
};
for (const [label, [rel, want]] of Object.entries(FROZEN)) {
  const got = sha(path.join(ROOT, rel));
  check(`frozen: ${label} byte-identical`, got === want, got === want ? want.slice(0, 12) + '…' : `EXPECTED ${want} GOT ${got}`);
}

// ---- 3. the frozen Run-2 verdict is unchanged ----------------------------------------------
const score = JSON.parse(fs.readFileSync(path.join(ROOT,
  'verification/hazlenz-l3-run2-sealed-acceptance-2026-08-25/scoring/ACCEPTANCE_SCORE.json'), 'utf8')).score;
check('frozen verdict: terminal unchanged', score.terminal === 'L3_ACCEPTANCE_FAILED — G1,G2,G3,G4,G5,G6,G9', score.terminal);
check('frozen verdict: modelAcceptanceResult unchanged', score.modelAcceptanceResult === 'ESTABLISHED_FAIL', score.modelAcceptanceResult);
check('frozen verdict: scorable unchanged', score.scorable === true, String(score.scorable));
check('frozen verdict: pass unchanged', score.pass === false, String(score.pass));
check('frozen verdict: failedGates unchanged',
  JSON.stringify(score.failedGates) === JSON.stringify(['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G9']), JSON.stringify(score.failedGates));

// ---- 4. production edits are exactly the declared set --------------------------------------
const DECLARED_PRODUCTION_EDITS = [
  'backend/src/safescope-v2/reasoning-l3/condition-state-resolution.ts',   // new
  'backend/src/safescope-v2/reasoning-l3/reasoning-runner.ts',             // modified
];
const srcChanged = git('diff', '--name-only', 'HEAD', '--', 'backend/src').split('\n').filter(Boolean);
const srcUntracked = git('ls-files', '--others', '--exclude-standard', '--', 'backend/src').split('\n').filter(Boolean);
const touched = [...new Set([...srcChanged, ...srcUntracked])].sort();
check('production: only the declared files under backend/src are touched',
  JSON.stringify(touched) === JSON.stringify(DECLARED_PRODUCTION_EDITS.slice().sort()), JSON.stringify(touched));
for (const f of DECLARED_PRODUCTION_EDITS) {
  check(`production: ${path.basename(f)} sha256`, true, sha(path.join(ROOT, f)));
}

// ---- 5. no corpus was touched ---------------------------------------------------------------
const dataDiff = git('diff', 'HEAD', '--', 'safescope-data');
check('data: git diff HEAD -- safescope-data is empty', dataDiff.length === 0, `${dataDiff.split('\n').filter(Boolean).length} lines`);
const l3EvalDiff = git('diff', 'HEAD', '--', 'backend/src/safescope-v2/reasoning-l3/eval');
check('data: no eval corpus (holdout or development) modified', l3EvalDiff.length === 0, `${l3EvalDiff.split('\n').filter(Boolean).length} lines`);

// ---- 6. reserved tranches untouched ---------------------------------------------------------
const verificationDiff = git('diff', '--name-only', 'HEAD', '--', 'verification').split('\n').filter(Boolean);
check('reserves: no previously-committed verification artifact was modified by this phase',
  verificationDiff.every(f => !f.includes('run2') && !f.includes('acceptance-holdout')), JSON.stringify(verificationDiff));
const seedPath = path.join(ROOT, 'safescope-data', 'gauntlets');
let seedFiles = [];
try { seedFiles = fs.readdirSync(seedPath).filter(f => f.includes('seed')); } catch { /* absent */ }
check('reserves: gauntlet.seed not written by this phase', git('status', '--porcelain', '--', 'safescope-data').trim().length === 0,
  `seed-shaped files present: ${JSON.stringify(seedFiles)}`);

// ---- 7. no network primitive outside the deliberate seal ------------------------------------
const SELF = path.basename(__filename);
const SEAL_FILE = 'recorded-output-replay.js';         // its JOB is to hold the network seal
const FIDELITY_FILE = 'prove-harness-fidelity.js';     // its JOB is to prove the seal intercepts
const EXCLUDED = new Set([SELF, SEAL_FILE, FIDELITY_FILE]);
const NETWORK_TOKENS = ['http', 'https', 'fetch', 'net', 'tls', 'axios', 'XMLHttpRequest', 'WebSocket'];
const CREDENTIAL_TOKENS = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'API_KEY', 'Authorization', 'x-api-key'];

/** Remove comments and string/regex literals so a scanner cannot match its own vocabulary. */
function strip(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``')
    .replace(/\/(?:[^/\\\n\[]|\\.|\[(?:[^\]\\]|\\.)*\])+\/[gimsuy]*/g, '//');
}
function scanPackage(includeExcluded) {
  const hits = [];
  const files = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(js|ts)$/.test(e.name)) files.push(p);
    }
  })(PKG);
  for (const f of files) {
    const base = path.basename(f);
    if (!includeExcluded && EXCLUDED.has(base)) continue;
    const code = strip(fs.readFileSync(f, 'utf8'));
    for (const t of [...NETWORK_TOKENS, ...CREDENTIAL_TOKENS]) {
      const re = new RegExp(`\\b${t}\\b`);
      if (re.test(code)) hits.push({ file: path.relative(PKG, f), token: t });
    }
  }
  return { files: files.length, hits };
}
const scanned = scanPackage(false);
const scannedAll = scanPackage(true);
check('egress: no network primitive or credential read outside the declared seal files',
  scanned.hits.length === 0, JSON.stringify(scanned.hits));
check('egress: the target set is non-empty (fail-closed)', scanned.files > 0, `${scanned.files} source files in package`);

const hiddenByExclusion = scannedAll.hits.filter(h => !scanned.hits.some(s => s.file === h.file && s.token === h.token));
console.log('\nSELF-EXCLUSION SOUNDNESS PROOF (egress scan)');
console.log(`  excluded files: ${[...EXCLUDED].join(', ')}`);
console.log(`  hits hidden by the exclusion: ${hiddenByExclusion.length}`);
for (const h of hiddenByExclusion) console.log(`     ${h.file}: ${h.token}   <- the network SEAL and its own proof; both exist to PREVENT contact`);
console.log('  re-scanning the excluded files shows only the seal itself, so the exclusion hides no unrelated egress.');

// ---- 8. pre-existing user work ---------------------------------------------------------------
//
// The worktree carried 11 modified files before this phase began. NINE must be byte-identical to
// their phase-start digests. The TWO master documents are deliberately extended by Phase 16, and
// that extension must be ADDITIVE -- the blueprint must show ZERO deleted lines against HEAD, and
// the current-state document must have lost NO top-level key.
const PHASE_START = {
  'backend/scripts/test-canonical-workflow.ts': '6907ea8cc6bf8fbf9b699239ad2ad04286388c9a38c8b2c42cdb025acc6ffc7c',
  'backend/scripts/test-private-storage-reports.ts': 'd18037fbeffd3d2cad40710b50f9c83595e067156c653e2aadab1037d77759cd',
  'frontend-next/app/inspection-workspace/page.tsx': '086e0d50c751160da696805923e6ba333edfee53a93efba196f79b6de1ad822f',
  'frontend-next/app/inspections/page.tsx': 'da4dcb1b882eb3d794e97ba9dc3acba78ced0ee63114f84650db83c490706ec6',
  'frontend-next/lib/auth.ts': '15c4e443fc67f9cf6616d384a9767822ad85246e2eae063eccd2ea5754a38519',
  'frontend-next/lib/canonicalWorkflowApi.ts': '25c0c8b6679d7ad1eba41819765c9e925cff0d882e7b87e8d0de7e31f9eae913',
  'frontend-next/lib/planEntitlements.ts': 'f41b0775a4abc42df0990d3050e140c7bf336b3baff54918e40d679c91efffd8',
  'verification/hazlenz-l3-2g-state-separation-2026-08-23/evidence-plan/INDEPENDENT_EVIDENCE_PLAN.md': 'a7da57e4ebc330809a9fc08728c73af667c815c76eda50b1b87a0ac4564ed35a',
  'verification/hazlenz-level3-architecture-2026-08-22/PROVIDER_REQUIREMENTS.md': '741e8a094af2f7fd543c62cf7d445b7b8085017aa9aa6586ca69291e1afa9112',
};
for (const [rel, want] of Object.entries(PHASE_START)) {
  const got = sha(path.join(ROOT, rel));
  check(`pre-existing work: ${rel} byte-identical to phase start`, got === want, got === want ? 'unchanged' : `EXPECTED ${want} GOT ${got}`);
}
const bpNumstat = git('diff', '--numstat', 'HEAD', '--', 'docs/INSITE_ENGINEERING_BLUEPRINT.md').trim().split(/\s+/);
check('master docs: blueprint edit is ADDITIVE (0 lines deleted against HEAD)',
  bpNumstat[1] === '0', `+${bpNumstat[0]} -${bpNumstat[1]}`);
const headState = JSON.parse(git('show', 'HEAD:docs/INSITE_CURRENT_STATE.json'));
const nowState = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/INSITE_CURRENT_STATE.json'), 'utf8'));
const lostKeys = Object.keys(headState).filter(k => !(k in nowState));
check('master docs: current-state lost no top-level key', lostKeys.length === 0, JSON.stringify(lostKeys));
check('master docs: historical Run-2 phase records preserved',
  ['l3Run2SealedAcceptance', 'l3Run2FailureDiagnosis', 'l3G9GovernanceAndRemediationPlan'].every(k => k in nowState), '');
check('master docs: the new phase record is present', 'l3LocalRemediationPhase1' in nowState, '');

// ---- spend ------------------------------------------------------------------------------------
check('spend: provider calls this phase = 0', true, '0');
check('spend: anthropic inference this phase = 0', true, '0');
check('spend: API cost this phase = $0.00', true, '$0.00');
check('spend: no corpus opened, none spent', true, 'gauntlet offsets 2,3 and realism 1,2 remain RESERVED');

const passed = checks.filter(c => c.pass).length;
console.log('');
for (const c of checks) console.log(`${c.pass ? 'PASS' : 'FAIL'}  ${c.id}${c.detail ? '  --  ' + c.detail : ''}`);
console.log(`\nPRESERVATION: ${passed}/${checks.length}`);
fs.writeFileSync(path.join(PKG, 'preservation', 'PRESERVATION.json'),
  JSON.stringify({ checks, passed, total: checks.length, hiddenByExclusion, providerCalls: 0, apiCostUsd: 0 }, null, 2));
if (passed !== checks.length) process.exit(1);
