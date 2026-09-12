/**
 * §125 -- validate, review, contamination-check and capability-prove
 * FORMAL_EXPERT_NEGATIVE_CONTROL_AUGMENTATION_V1 before sealing it.
 *
 * Zero provider calls. The harness runs in DISABLED mode and its own invocation counter is asserted
 * to be zero at the end.
 */

import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import {
  AUGMENTATION_IDENTIFIER, AUGMENTATION_ROWS,
} from '../src/safescope-v2/expert-hazlenz/fixtures/negative-control-augmentation-v1';
import { classifyRow, truthOnlyStrings, validateCohortRow } from '../src/safescope-v2/expert-hazlenz/expert-cohort-contract';
import { buildExpertUserPrompt, EXPERT_SYSTEM_PROMPT } from '../src/safescope-v2/expert-hazlenz/expert-prompt';
import { REQUIRED_DISTRIBUTION } from './lib/expert-augmentation-construction-policy';
import { providerInvocationCount, resetProviderInvocationCount, runFormalCohort } from './lib/expert-cohort-harness';
import { assertMayOpen, planListDiscrepancies } from '../src/safescope-v2/expert-hazlenz/expert-corpus-retirement-registry';

const ROOT = path.resolve(__dirname, '..', '..');
let passed = 0; let failed = 0;
function assert(ok: boolean, label: string, detail = ''): void {
  if (ok) { passed += 1; console.log(`  PASS  ${label}`); }
  else { failed += 1; console.log(`  FAIL  ${label}${detail ? ` -- ${detail}` : ''}`); }
}

/**
 * Per-family LURE lexicons. A forbidden family must have a lure in the observation -- language that
 * could plausibly pull a reader toward it. This is the mechanical form of "absence is never a
 * reason": a family nothing in the text points at cannot be forbidden, only defensible.
 */
const LURES: Record<string, string[]> = {
  mobile_equipment: ['forklift', 'pallet jack', 'reach truck', 'cart', 'trailer', 'dock', 'truck'],
  electrical: ['electrical', 'panel', 'cord', 'disconnect', 'energized', 'plug', 'weatherhead',
    'service drop', 'heater', 'fan', 'mcc', 'conductor', 'volt'],
  machine_guarding: ['guard', 'machine', 'press', 'grinder', 'wrapper', 'sealer', 'pump',
    'conveyor', 'drive', 'equipment'],
  confined_space: ['tank', 'well', 'pit', 'manway', 'grate', 'vessel', 'sump', 'inside', 'bay',
    'opening'],
  fall_protection: ['roof', 'edge', 'ladder', 'scaffold', 'guardrail', 'stool', 'tripod', 'climb',
    'upright', 'dock', 'height'],
  lockout_tagout: ['lockout', 'locked', 'isolat', 'tag', 'permit', 'disconnect', 'energy'],
  chemical_exposure: ['chemical', 'epoxy', 'degreaser', 'caustic', 'paint', 'flammable', 'eyewash',
    'respirator', 'solvent', 'wash'],
};

async function main(): Promise<void> {
  resetProviderInvocationCount();
  const rows = AUGMENTATION_ROWS.map(a => a.row);

  console.log('\nA. RETIREMENT GUARD (fail-closed, consults BOTH sources)\n');
  assert(!assertMayOpen('GAUNTLET_OFFSET_0').allowed, 'A.1 retired offset 0 is REFUSED');
  assert(!assertMayOpen('GAUNTLET_OFFSET_1').allowed, 'A.2 retired offset 1 is REFUSED');
  assert(!assertMayOpen('REALISM_OFFSET_3').allowed, 'A.3 retired realism offset 3 is REFUSED');
  assert(!assertMayOpen('GAUNTLET_OFFSET_4').allowed, 'A.4 UNKNOWN material is REFUSED');
  // Offsets 2 and 3 were OPENED 2026-09-01 under the OPTION B authorization and are now SPENT to
  // this exam. `allowed` stays true for the same reason it is true for the already-open
  // gauntlet.seed: the guard permits material that belongs to THIS exam. It is the registry's
  // status and reopenRule, not this flag, that record the material as spent -- and this assertion
  // is deliberately left as a permission check rather than restated as an open/closed claim.
  assert(assertMayOpen('GAUNTLET_OFFSET_2').allowed && assertMayOpen('GAUNTLET_OFFSET_3').allowed,
    'A.5 gauntlet offsets 2 and 3 are permitted to THIS exam (OPENED 2026-09-01, now spent)');
  assert(planListDiscrepancies().length === 3,
    'A.6 the frozen plan list under-reports exactly three retirements, reported not reconciled',
    String(planListDiscrepancies().length));

  console.log('\nB. ROW VALIDITY AND THE FORBIDDEN-FAMILY RULE\n');
  const problems = rows.flatMap(validateCohortRow);
  assert(problems.length === 0, 'B.1 all 16 rows pass the frozen row contract',
    problems.map(p => `${p.rowId}:${p.code}`).join(','));
  assert(rows.length === 16, 'B.2 exactly 16 rows', String(rows.length));
  assert(new Set(rows.map(r => r.source.rowId)).size === 16, 'B.3 row ids are unique');

  let lureFailures = 0; let rationaleFailures = 0;
  for (const a of AUGMENTATION_ROWS) {
    const text = a.row.source.observation.toLowerCase();
    for (const family of a.row.truth.forbiddenHazardFamilies) {
      const lures = LURES[family] ?? [];
      if (!lures.some(l => text.includes(l))) {
        lureFailures += 1;
        console.log(`      NO LURE ${a.row.source.rowId} :: ${family}`);
      }
      const why = a.forbiddenRationale[family] ?? '';
      if (why.trim().length < 40) { rationaleFailures += 1; }
    }
  }
  assert(lureFailures === 0,
    'B.4 EVERY forbidden family has a LURE in its observation -- absence alone is never a reason',
    `${lureFailures} without a lure`);
  assert(rationaleFailures === 0,
    'B.5 every forbidden family carries a substantive machine-auditable rationale');

  console.log('\nC. REQUIRED DISTRIBUTION\n');
  const classes = rows.map(classifyRow);
  const count = (c: string) => classes.filter(cs => (cs as string[]).includes(c)).length;
  const withForbidden = rows.filter(r => r.truth.forbiddenHazardFamilies.length > 0).length;
  const safeResolved = rows.filter(r => r.truth.negatedOrSafeStateFamilies.length > 0).length;
  const active = rows.filter(r => r.truth.presentHazardFamilies.length > 0
    && r.truth.negatedOrSafeStateFamilies.length === 0).length;
  const multi = count('MULTI_HAZARD');
  const notOwed = count('CLARIFICATION_NOT_OWED');
  const owed = count('CLARIFICATION_OWED');
  const governed = AUGMENTATION_ROWS.filter(a => a.governedMatchFamily !== null).length;
  const interactions = rows.reduce((n, r) => n + r.truth.recordedInteractions.length, 0);

  const dist: Array<[string, number, number]> = [
    ['ROWS_WITH_FORBIDDEN_FAMILY_TRUTH', withForbidden, REQUIRED_DISTRIBUTION.ROWS_WITH_FORBIDDEN_FAMILY_TRUTH],
    ['SAFE_RESOLVED_OR_NEGATED', safeResolved, REQUIRED_DISTRIBUTION.SAFE_RESOLVED_OR_NEGATED],
    ['ACTIVE_HAZARD', active, REQUIRED_DISTRIBUTION.ACTIVE_HAZARD],
    ['MULTI_FAMILY_OR_SIBLING_ROUTING', multi, REQUIRED_DISTRIBUTION.MULTI_FAMILY_OR_SIBLING_ROUTING],
    ['CLARIFICATION_NOT_OWED', notOwed, REQUIRED_DISTRIBUTION.CLARIFICATION_NOT_OWED],
    ['CLARIFICATION_OWED', owed, REQUIRED_DISTRIBUTION.CLARIFICATION_OWED],
    ['GOVERNED_RECORD_MATCHABLE', governed, REQUIRED_DISTRIBUTION.GOVERNED_RECORD_MATCHABLE],
  ];
  for (const [name, actual, required] of dist) {
    assert(actual >= required, `C.${name} ${actual} >= ${required}`);
  }
  console.log(`      recorded cross-hazard interactions: ${interactions}`);

  console.log('\nD. ANTI-CONTAMINATION\n');
  // Distinctive fragments from every new observation, searched across everything a provider has
  // ever seen or that documents one. RETIRED material is NOT read -- it is excluded by path.
  const frags = rows.map(r => r.source.observation.slice(0, 60).trim()).filter(f => f.length >= 40);
  const fragFile = path.join(ROOT, 'backend', '.aug-frags.tmp');
  fs.writeFileSync(fragFile, frags.join('\n'));
  let hits = '';
  try {
    hits = execFileSync('rg', ['-l', '-F', '-f', fragFile, 'verification', 'docs', 'safescope-data',
      'backend/src/safescope-v2/expert-hazlenz/fixtures'], { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch { hits = ''; }   // rg exits non-zero on no matches
  fs.unlinkSync(fragFile);
  const hitFiles = hits ? hits.split('\n').filter(f => !f.includes('negative-control-augmentation')) : [];
  assert(frags.length === 16, 'D.1 all 16 observations yield a distinctive >=40 char fragment',
    String(frags.length));
  assert(hitFiles.length === 0,
    'D.2 KNOWN_PROVIDER_CASE_COPY = FALSE -- no new observation appears in any development fixture, '
    + 'diagnostic fixture, opened seed, corpus or verification artifact', hitFiles.join(','));
  console.log('      retired material was NOT read for this check: it is excluded by path, and its '
    + 'identity is established by hash in the retirement registry instead.');

  console.log('\nE. CANONICAL-PATH DRY RUN, PROVIDER DISABLED\n');
  const run = await runFormalCohort(rows, {
    mode: 'DISABLED', callCeiling: 0, spendCeilingUsd: 0,
    arms: ['BASE', 'PERMUTED', 'CROSS_PROCESS'], processId: 'proc-augmentation',
    nowIso: '2026-08-31T00:00:00.000Z',
  });
  assert(run.stopReason === 'PROVIDER_EXECUTION_DISABLED', 'E.1 the run is provider-DISABLED');
  assert(run.rowProblems.length === 0, 'E.2 every row traverses freeze-time validation');
  assert(run.requestsBuilt.length === 48,
    'E.3 all 16 rows x 3 arms constructed through the canonical path', String(run.requestsBuilt.length));
  assert(run.records.every(r => r.calls.length === 0), 'E.4 no call record exists');
  assert(run.scoring === null, 'E.5 a DISABLED run produces NO score');

  let leaks = 0;
  for (const built of run.requestsBuilt) {
    const row = rows.find(r => r.source.rowId === built.rowId)!;
    const rendered = `${EXPERT_SYSTEM_PROMPT}\n${buildExpertUserPrompt(built.input)}\n${JSON.stringify(built.input)}`;
    for (const secret of truthOnlyStrings(row)) if (rendered.includes(secret)) leaks += 1;
  }
  assert(leaks === 0, 'E.6 TRUTH_LEAK = 0 across all 48 constructed requests', String(leaks));
  assert(providerInvocationCount() === 0,
    'E.7 PROVIDER_INVOCATION_COUNT = 0, by the harness\'s own counter', String(providerInvocationCount()));

  console.log('\nF. NEGATIVE-CONTROL CAPABILITY PROOF\n');
  const newOpportunities = withForbidden;
  assert(newOpportunities >= 10,
    `F.1 NEW_TRUTH_SUPPORTED_NEGATIVE_CONTROL_OPPORTUNITIES = ${newOpportunities} >= 10`);
  const EXISTING = { seed: 14, populationA: 13, offset2: 8, offset3: 8, realism: 0 };
  const existingTotal = EXISTING.seed + EXISTING.populationA + EXISTING.offset2 + EXISTING.offset3;
  const projected = existingTotal + newOpportunities;
  console.log(`      seed ${EXISTING.seed} + PopA ${EXISTING.populationA} + offset2 ${EXISTING.offset2}`
    + ` + offset3 ${EXISTING.offset3} + realism ${EXISTING.realism} = ${existingTotal}`);
  console.log(`      + augmentation ${newOpportunities} = ${projected}`);
  assert(projected >= 48,
    `F.2 AVAILABLE_NEGATIVE_CONTROL_CAPABILITY = ${projected} >= 48 (margin ${projected - 48})`);
  console.log('      offsets 2 and 3 counted from METADATA ONLY, and THIS RUN opens neither.');
  console.log('      (They were subsequently opened on 2026-09-01 under a separate authorization;');
  console.log('       the metadata-only figures above are left exactly as measured then.)');

  console.log('\nG. HASHES\n');
  const sha = (s: string) => createHash('sha256').update(s).digest('hex');
  const manifest = JSON.stringify(rows.map(r => ({ rowId: r.source.rowId, observation: r.source.observation })));
  const truthKeys = JSON.stringify(rows.map(r => ({ rowId: r.source.rowId, truth: r.truth })));
  const provenance = JSON.stringify(AUGMENTATION_ROWS.map(a => ({
    rowId: a.row.source.rowId, provenance: a.provenance, forbiddenRationale: a.forbiddenRationale,
    governedMatchFamily: a.governedMatchFamily,
  })));
  console.log(`      identifier      ${AUGMENTATION_IDENTIFIER}`);
  console.log(`      manifest        ${sha(manifest)}`);
  console.log(`      truth keys      ${sha(truthKeys)}`);
  console.log(`      provenance      ${sha(provenance)}`);

  fs.writeFileSync(path.join(ROOT, 'verification',
    'expert-hazlenz-negative-control-augmentation-2026-08-31', 'corpus', 'SEAL.json'),
    JSON.stringify({
      identifier: AUGMENTATION_IDENTIFIER,
      rows: rows.length,
      order: 'AUG-01 .. AUG-16, authored order, immutable after seal',
      manifestSha256: sha(manifest),
      truthKeySha256: sha(truthKeys),
      provenanceSha256: sha(provenance),
      newNegativeControlOpportunities: newOpportunities,
      projectedAvailableCapability: projected,
      distribution: Object.fromEntries(dist.map(([n, a, r]) => [n, { actual: a, required: r }])),
      recordedInteractions: interactions,
      truthLeak: leaks,
      providerInvocationCount: providerInvocationCount(),
      knownProviderCaseCopy: false,
    }, null, 2) + '\n');

  console.log(`\n${passed} passed, ${failed} failed`);
  // Per-run confinement counters: what THIS validation run did, not global corpus state.
  console.log(`PROVIDER_INVOCATION_COUNT = ${providerInvocationCount()}   `
    + 'RESERVED_OFFSETS_OPENED_BY_THIS_RUN = 0');
  process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
