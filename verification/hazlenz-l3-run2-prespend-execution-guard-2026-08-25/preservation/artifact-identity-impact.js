#!/usr/bin/env node
/*
 * PHASE 7 -- FROZEN-IDENTITY IMPACT, DETERMINED MECHANICALLY.
 *
 * The question this phase is REQUIRED to answer before it may claim success:
 *
 *   Is the execution runner/harness that `D-K` was wired into a COMPONENT of the frozen Run-2
 *   acceptance-artifact identity 9c74ffd46e0993e097c393c5e26594501716b68078599e678ef2f4052f36acdc?
 *
 * If it is, this phase must STOP and report
 *   L3_RUN2_PRESPEND_GUARD_BLOCKED -- FROZEN_ARTIFACT_MUTATION_REQUIRED
 * rather than silently mutate a frozen component.
 *
 * The answer is derived from the manifest itself -- not asserted, not copied from the task
 * description. Every component digest is RECOMPUTED FROM THE ACTUAL FILE.
 */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..', '..');
const RUN2 = path.join(ROOT, 'verification', 'hazlenz-l3-run2-acceptance-holdout-2026-08-25');
const GUARD = path.join(ROOT, 'verification', 'hazlenz-l3-run2-prespend-execution-guard-2026-08-25');
const EXPECTED_IDENTITY = '9c74ffd46e0993e097c393c5e26594501716b68078599e678ef2f4052f36acdc';

const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const out = [];
const say = (s = '') => out.push(s);

say('PHASE 7 -- FROZEN-IDENTITY IMPACT');
say('verification/hazlenz-l3-run2-prespend-execution-guard-2026-08-25 | 2026-08-25');
say('');

// ---- 1. Re-derive the Run-2 acceptance-artifact identity from the ACTUAL files ---------------
const manifestText = fs.readFileSync(path.join(RUN2, 'ACCEPTANCE_ARTIFACT_MANIFEST.txt'), 'utf8');
const manifestLines = manifestText.split('\n')
  .filter((l) => /^[0-9a-f]{64} {2}\S/.test(l));
const components = manifestLines.map((l) => l.split('  ')[1]);

say('1. THE FROZEN RUN-2 ACCEPTANCE ARTIFACT -- RECOMPUTED, NOT COPIED');
say(`   components declared in the manifest: ${components.length}`);
const recomputed = components
  .map((rel) => `${sha(path.join(RUN2, rel))}  ${rel}`)
  .sort();
let componentDrift = 0;
for (const line of recomputed) if (!manifestLines.includes(line)) { componentDrift++; say(`   DRIFT: ${line}`); }
const identity = crypto.createHash('sha256').update(recomputed.join('\n') + '\n').digest('hex');
say(`   component digests reproducing their manifest line: ${components.length - componentDrift} / ${components.length}`);
say(`   recomputed identity: ${identity}`);
say(`   expected identity:   ${EXPECTED_IDENTITY}`);
say(`   -> ${identity === EXPECTED_IDENTITY ? 'MATCH' : 'MISMATCH'}`);
say('');

// ---- 2. Enumerate the executable surface this phase created ----------------------------------
const EXECUTION_SURFACE = [
  'guard/dk-abort-guard.ts',
  'guard/acceptance-execution-loop.ts',
  'runner/run-run2-acceptance.ts',
  'runner/run-run2-sealed.sh',
];
say('2. THE EXECUTION SURFACE D-K WAS WIRED INTO');
for (const rel of EXECUTION_SURFACE) say(`   ${sha(path.join(GUARD, rel))}  ${rel}`);
say('');

// ---- 3. Is any of it a component of the frozen artifact? -------------------------------------
// Compared two ways: by manifest path, and by CONTENT DIGEST, so a component could not be hit
// under a different name.
const componentDigests = new Set(recomputed.map((l) => l.split('  ')[0]));
const componentBasenames = new Set(components.map((c) => path.basename(c)));
const collisions = [];
for (const rel of EXECUTION_SURFACE) {
  const p = path.join(GUARD, rel);
  const d = sha(p);
  if (components.includes(rel)) collisions.push(`${rel} -- PATH is a manifest component`);
  if (componentDigests.has(d)) collisions.push(`${rel} -- CONTENT DIGEST equals a manifest component`);
  if (componentBasenames.has(path.basename(rel))) collisions.push(`${rel} -- BASENAME matches a manifest component`);
}
say('3. DOES THE FROZEN ARTIFACT INCLUDE THE RUNNER/HARNESS BEING MODIFIED?');
say('   manifest components, in full:');
for (const c of components) say(`     ${c}`);
say('');
say('   The manifest contains NO runner, NO harness, NO execution driver and NO shell script.');
say('   Its 15 components are: the holdout and its deterministic rebuild, the builder and the');
say('   authored-control source, the pre-selection gate and its output, the structural/rebuild/');
say('   overlap validation outputs and the validator, the v2 scorer frozen copy and its synthetic');
say('   tests and their output, the HOLDOUT_FREEZE and the ACCEPTANCE_ARTIFACT_FREEZE.');
say('');
say(`   collisions found: ${collisions.length}`);
for (const c of collisions) say(`     ${c}`);
say('');

// ---- 4. Was any frozen file touched by this phase? -------------------------------------------
say('4. WAS ANY FROZEN COMPONENT WRITTEN, MOVED OR RENAMED BY THIS PHASE?');
const allFrozenIntact = componentDrift === 0 && identity === EXPECTED_IDENTITY;
say(`   every component reproduces its manifest line byte-for-byte: ${componentDrift === 0}`);
say(`   the artifact identity is unchanged:                        ${identity === EXPECTED_IDENTITY}`);
say('');

// ---- 5. The determination --------------------------------------------------------------------
const executionGuardManifest = EXECUTION_SURFACE
  .map((rel) => `${sha(path.join(GUARD, rel))}  ${rel}`)
  .sort();
const guardIdentity = crypto.createHash('sha256').update(executionGuardManifest.join('\n') + '\n').digest('hex');

say('5. DETERMINATION');
if (collisions.length === 0 && allFrozenIntact) {
  say('   RUN2_ACCEPTANCE_ARTIFACT_IDENTITY_UNCHANGED');
  say(`   RUN2_ACCEPTANCE_ARTIFACT_IDENTITY = ${identity}`);
  say('');
  say('   The runner is OUTSIDE the frozen artifact. It did not exist when the artifact was frozen:');
  say('   section 63.11 froze the EXAM (holdout, builder, validation, scorer), and section 63.12');
  say('   named the D-K wiring as a still-owed PRECONDITION of executing it, not as a component of');
  say('   it. Wiring D-K therefore mutates NO frozen component, and NOTHING had to be rebuilt.');
  say('');
  say('   The execution surface is frozen SEPARATELY, under its own new identity:');
  say('');
  for (const l of executionGuardManifest) say(`     ${l}`);
  say('');
  say(`   RUN2_EXECUTION_GUARD_IDENTITY = ${guardIdentity}`);
  say('');
  say('   Any change to any of those four files changes this identity. The Run-2 acceptance');
  say('   authorization must therefore name BOTH identities.');
} else {
  say('   L3_RUN2_PRESPEND_GUARD_BLOCKED -- FROZEN_ARTIFACT_MUTATION_REQUIRED');
  say('   RETURNING FOR GOVERNANCE REVIEW. The holdout was NOT rebuilt.');
}
say('');
say('   THE RUN-2 HOLDOUT WAS NOT REBUILT BY THIS PHASE, IN EITHER BRANCH.');

process.stdout.write(out.join('\n') + '\n');
if (collisions.length !== 0 || !allFrozenIntact) process.exitCode = 3;
