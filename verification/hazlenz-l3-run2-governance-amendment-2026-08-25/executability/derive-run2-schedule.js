/**
 * PHASE 6 + PHASE 9 -- DECLARED vs DERIVED.
 *
 * Re-derives the Run-2 offset schedule, partition sizes, source counts, expected total and every
 * gate cardinality FROM THE FROZEN RULES, and compares each against the value declared in the
 * authorization. NOTHING IS HARD-CODED FROM THE AUTHORIZATION -- the authorization's numbers are
 * loaded only as the DECLARED side of the comparison.
 *
 * It reads SORT KEYS and COUNTS only. It reads NO observation text, selects NO row, and opens no
 * Run-2 content. This is the check whose omission produced Attempt 1's G4 contradiction.
 */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..', '..', '..');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

// ---- S-2 canonical comparator, transcribed from Amendment 1 --------------------------------
const CMP = (a, b) => Buffer.compare(Buffer.from(String(a), 'utf8'), Buffer.from(String(b), 'utf8'));
// ---- S-3 canonical offset derivation, transcribed from Amendment 1 --------------------------
const OFFSET = (digest, m) => parseInt(digest.slice(-8), 16) % m;

const SRC = {
  gauntlet: { path: 'safescope-data/gauntlets/safescope-gauntlet.source.v1.json',
              sha: 'a95e54809c41b3eb88ea35de133c5576e63c921944ca4724597852f922f0adb4',
              rows: 150, key: 'scenarioId', m: 4 },
  realism:  { path: 'safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json',
              sha: '6f6897f11aa3b174b2863fad4edc895625e0a3d27e1318dbd2371dcd5231a9cb',
              rows: 117, key: 'id', m: 4 },
};

const out = []; const p = (s = '') => out.push(s);
let ok = 0, bad = 0;
const chk = (label, derived, declared) => {
  const good = String(derived) === String(declared);
  good ? ok++ : bad++;
  p(`  ${(good ? 'MATCH' : 'MISMATCH').padEnd(9)} ${label.padEnd(48)} derived ${String(derived).padEnd(10)} declared ${declared}`);
  return good;
};

p('L3 RUN-2 GOVERNANCE AMENDMENT -- PHASE 6 / PHASE 9');
p('DECLARED vs DERIVED. Sort keys and counts only. NO observation read. NO row selected.');
p('');

for (const [name, s] of Object.entries(SRC)) {
  const abs = path.join(ROOT, s.path);
  const digest = sha(abs);
  p(`================ ${name} ================`);
  chk(`${name} sha256 (S-5 drift guard)`, digest, s.sha);
  const doc = JSON.parse(fs.readFileSync(abs, 'utf8'));
  const arr = Array.isArray(doc) ? doc : (doc.rows || doc.scenarios || doc.items || doc.data);
  if (!Array.isArray(arr)) throw new Error(`cannot locate the row array in ${s.path}`);
  chk(`${name} physical rows (S-5)`, arr.length, s.rows);

  // S-2 totality requirement: sort keys pairwise distinct, else CMP is not a strict total order.
  const keys = arr.map(r => r[s.key]);
  chk(`${name} sort key '${s.key}' present on every row`, keys.every(k => typeof k === 'string' && k.length > 0), true);
  chk(`${name} sort keys pairwise distinct (S-2)`, new Set(keys).size, arr.length);

  const sorted = keys.slice().sort(CMP);
  const sizes = [0, 1, 2, 3].map(k => sorted.filter((_, i) => i % s.m === k).length);
  p(`  DERIVED   partition sizes by i % ${s.m}                    ${JSON.stringify(sizes)}  (sum ${sizes.reduce((a, b) => a + b, 0)})`);

  const k0 = OFFSET(digest, s.m);
  s.k0 = k0; s.sizes = sizes;
  p(`  DERIVED   S-3 offset from digest tail ${digest.slice(-8)}          ${k0}`);
}
p('');

p('================ RESERVATION SCHEDULE (D-A.11 / D-B.11), CYCLIC FROM THE DERIVED OFFSET ================');
p('  Rule as frozen: "run n uses offset (k0 + n - 1) mod m", cyclic from the derived k0.');
p('');
const RUN = 2;
const g = SRC.gauntlet, r = SRC.realism;
const gRun1 = (g.k0 + 1 - 1) % g.m, rRun1 = (r.k0 + 1 - 1) % r.m;
const gRun2 = (g.k0 + RUN - 1) % g.m, rRun2 = (r.k0 + RUN - 1) % r.m;

chk('gauntlet run-1 offset (spent, retired)', gRun1, 0);
chk('realism  run-1 offset (spent, retired)', rRun1, 3);
p('');
chk('gauntlet RUN-2 offset', gRun2, 1);
chk('gauntlet RUN-2 selected rows', g.sizes[gRun2], 38);
chk('realism  RUN-2 offset', rRun2, 0);
chk('realism  RUN-2 selected rows', r.sizes[rRun2], 30);
p('');
p('  DERIVED   gauntlet cyclic order   ' + [0, 1, 2, 3].map(n => (g.k0 + n) % g.m).join(' -> '));
p('  DERIVED   realism  cyclic order   ' + [0, 1, 2, 3].map(n => (r.k0 + n) % r.m).join(' -> '));
p('  DERIVED   gauntlet offsets still reserved after run 2:  ' + [3, 4].map(n => (g.k0 + n - 1) % g.m).join(', '));
p('  DERIVED   realism  offsets still reserved after run 2:  ' + [3, 4].map(n => (r.k0 + n - 1) % r.m).join(', '));
p('');

p('================ AUTHORED CONTROLS -- CARDINALITY, RE-DERIVED FROM THE FROZEN FAMILY TABLE ================');
const AC = path.join(ROOT, 'verification/hazlenz-l3-acceptance-holdout-attempt2-2026-08-24/builder/authored-controls.js');
chk('authored-controls.js digest (frozen)', sha(AC), '56b73f851786ea2ca4b1b01a5eac92bf6bed4beb098086cba27c5babc71d2f05');
const { FROZEN_ALLOCATION } = require(AC);
p('  DERIVED   frozen allocation        ' + JSON.stringify(FROZEN_ALLOCATION));
const alloc = FROZEN_ALLOCATION;
const sum = Object.values(alloc).reduce((a, b) => a + b, 0);
chk('allocation sum', sum, 25);
for (const [f, n] of Object.entries({ F1: 4, F2: 4, F3: 3, F4: 3, F5: 3, F6: 3, F7: 3, F8: 2 })) {
  chk(`allocation ${f}`, alloc[f], n);
}
p('');
// Gate memberships re-derived from the frozen FAMILY truth table, three ways where possible.
const src = fs.readFileSync(AC, 'utf8');
const fam = {};
const re = /(F\d[ab]?):\s*\{([\s\S]*?)\},\n/g;
let m2;
while ((m2 = re.exec(src))) {
  const body = m2[2];
  fam[m2[1]] = {
    inG3: /inG3:\s*true/.test(body), inG4: /inG4:\s*true/.test(body), inG7: /inG7:\s*true/.test(body),
    conditionState: (body.match(/conditionState:\s*'([^']+)'/) || [])[1],
    hazardEstablished: /hazardEstablished:\s*true/.test(body),
  };
}
const per = { F1: 4, F2: 4, F3: 3, F4: 3, F5: 3, F6: 3, F7: 3, F8a: 1, F8b: 1 };
const count = (pred) => Object.entries(per).reduce((a, [k, n]) => a + (fam[k] && pred(fam[k]) ? n : 0), 0);
p('  DERIVED   variants parsed          ' + Object.keys(fam).join(', '));
chk('G3 authored members (inG3)', count(f => f.inG3), 6);
chk('G4 denominator (inG4)', count(f => f.inG4), 21);
chk('G7 pole (inG7)', count(f => f.inG7), 11);
chk('G4 closure: inG4 + ACTIVE-truth complement', count(f => f.inG4) + count(f => f.conditionState === 'ACTIVE'), 25);
chk('G4 enumerated membership F1,F2,F3,F4,F5,F6,F8b', Object.entries(per).filter(([k]) => fam[k] && fam[k].inG4).map(([k]) => k).join(','), 'F1,F2,F3,F4,F5,F6,F8b');
chk('G7 enumerated membership F1,F2,F7', Object.entries(per).filter(([k]) => fam[k] && fam[k].inG7).map(([k]) => k).join(','), 'F1,F2,F7');
chk('G3 enumerated membership F3,F6', Object.entries(per).filter(([k]) => fam[k] && fam[k].inG3).map(([k]) => k).join(','), 'F3,F6');
p('');

p('================ RUN-2 EXPECTED COMPOSITION ================');
const total = g.sizes[gRun2] + r.sizes[rRun2] + 25;
chk('RUN-2 total rows', total, 93);
p(`  DERIVED   composition             INDEPENDENT_GAUNTLET ${g.sizes[gRun2]} + INDEPENDENT_REALISM ${r.sizes[rRun2]} + AUTHORED_CONTROL 25 = ${total}`);
const indep = g.sizes[gRun2] + r.sizes[rRun2];
p(`  DERIVED   independent share       ${indep}/${total} = ${(indep / total * 100).toFixed(1)}%`);
chk('RUN-2 total inside the plan band ~90-100', total >= 90 && total <= 100, true);
p('');
p('  |DEN_A| FOR RUN 2: NOT COMPUTED, AND DELIBERATELY SO.');
p('  D-B.3 requires the ambiguity population be discovered from frozen metadata AFTER selection.');
p('  Computing it now would let the amendment see its own G3 denominator before selection, which');
p('  is precisely defect E-3. This script did not read shouldHaveMissingEvidence on any row.');
p('  RUN2_DEN_A = UNKNOWN_UNTIL_AFTER_AUTHORIZED_SELECTION');
p('');
p(`OK = ${ok}   MISMATCH = ${bad}`);
if (bad > 0) p('*** DECLARED/DERIVED CONTRADICTION -- STOP AND REPORT ***');
fs.writeFileSync(path.join(__dirname, 'DECLARED_VS_DERIVED.txt'), out.join('\n') + '\n');
console.log(out.join('\n'));
if (bad > 0) process.exit(1);
