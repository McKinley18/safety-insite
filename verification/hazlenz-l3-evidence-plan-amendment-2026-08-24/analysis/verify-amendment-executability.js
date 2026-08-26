#!/usr/bin/env node
/*
 * L3 INDEPENDENT EVIDENCE PLAN AMENDMENT -- FORMAL EXECUTABILITY REVIEW (PHASE 7)
 *
 * Proves that an independent implementer could construct the acceptance holdout using ONLY
 * (a) the protected source bytes, (b) the amended plan, (c) deterministic code -- with NO
 * semantic selection discretion.
 *
 * CONTRACT -- this tool:
 *   - prints NO observation text
 *   - prints NO selected source identifiers (it compares them internally and reports only booleans/counts)
 *   - materialises NO holdout, NO freeze record, NO builder output
 *   - authors NO negative control
 *   - invokes NO model and NO provider abstraction
 *   - transmits NOTHING externally
 *   - writes to NO file under safescope-data/
 */
const fs = require('fs');
const crypto = require('crypto');

const PLAN = 'verification/hazlenz-l3-2g-state-separation-2026-08-23/evidence-plan/INDEPENDENT_EVIDENCE_PLAN.md';
const SRC = {
  gauntlet: {
    path: 'safescope-data/gauntlets/safescope-gauntlet.source.v1.json',
    sha: 'a95e54809c41b3eb88ea35de133c5576e63c921944ca4724597852f922f0adb4',
    rows: 150, key: 'scenarioId', carrier: 'observation', m: 4, expectOffset: 0, expectSel: 38,
    expectSizes: [38, 38, 37, 37],
  },
  realism: {
    path: 'safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json',
    sha: '6f6897f11aa3b174b2863fad4edc895625e0a3d27e1318dbd2371dcd5231a9cb',
    rows: 117, key: 'id', carrier: 'hazardObservation', m: 4, expectOffset: 3, expectSel: 29,
    expectSizes: [30, 29, 29, 29],
  },
};

const rowsOf = (d) => Array.isArray(d) ? d
  : (d.scenarios || d.rows || d.items || d.data || d.entries || Object.values(d).find((v) => Array.isArray(v)) || []);

// ---- S-1 canonical normalization -------------------------------------------------
const NORM = (s) => String(s == null ? '' : s).normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();
// ---- S-2 canonical comparator (implementation A) ---------------------------------
const CMP_A = (a, b) => Buffer.compare(Buffer.from(String(a), 'utf8'), Buffer.from(String(b), 'utf8'));
// ---- S-2 canonical comparator (implementation B -- independent byte loop) --------
const CMP_B = (a, b) => {
  const x = Buffer.from(String(a), 'utf8'), y = Buffer.from(String(b), 'utf8');
  const n = Math.min(x.length, y.length);
  for (let i = 0; i < n; i++) { if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1; }
  return x.length === y.length ? 0 : (x.length < y.length ? -1 : 1);
};
// ---- S-3 canonical offset derivation ---------------------------------------------
const OFFSET = (digestHex, m) => parseInt(digestHex.slice(-8), 16) % m;

const results = [];
const check = (id, claim, pass, detail) => { results.push({ id, claim, pass, detail }); };

console.log('== A. STRUCTURAL DETERMINISM PROOFS ==\n');
for (const [label, s] of Object.entries(SRC)) {
  const buf = fs.readFileSync(s.path);
  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  const rows = rowsOf(JSON.parse(buf.toString('utf8')));

  check(`${label}.sha`, 'source sha256 matches the amendment', sha === s.sha, sha.slice(0, 16) + '...');
  check(`${label}.rows`, `physical row count === ${s.rows}`, rows.length === s.rows, String(rows.length));

  const keys = rows.map((r) => r[s.key]);
  const keyPresent = keys.filter((k) => k !== undefined && k !== null).length;
  const distinct = new Set(keys.map(String)).size;
  check(`${label}.keyPresent`, `sort key '${s.key}' present on every row`, keyPresent === rows.length, `${keyPresent}/${rows.length}`);
  check(`${label}.keyDistinct`, 'sort keys pairwise distinct (CMP is a STRICT TOTAL order)', distinct === rows.length, `${distinct}/${rows.length}`);

  const carrierPresent = rows.filter((r) => typeof r[s.carrier] === 'string' && NORM(r[s.carrier]).length > 0).length;
  check(`${label}.carrier`, `verbatim carrier '${s.carrier}' non-empty on every row`, carrierPresent === rows.length, `${carrierPresent}/${rows.length}`);

  // offset derivation
  const off = OFFSET(sha, s.m);
  check(`${label}.offset`, `OFFSET(digest,${s.m}) derives mechanically to ${s.expectOffset}`, off === s.expectOffset,
    `last8=${sha.slice(-8)} uint32=${parseInt(sha.slice(-8), 16)} %${s.m}=${off}`);

  // two INDEPENDENT implementations of the whole selection rule
  const idxA = [...keys].map(String).sort(CMP_A);
  const selA = new Set(idxA.filter((_, i) => i % s.m === off));

  const idxB = [...keys].map(String);
  for (let i = 1; i < idxB.length; i++) {           // insertion sort with CMP_B
    const v = idxB[i]; let j = i - 1;
    while (j >= 0 && CMP_B(idxB[j], v) > 0) { idxB[j + 1] = idxB[j]; j--; }
    idxB[j + 1] = v;
  }
  const selB = new Set(idxB.filter((_, i) => i % s.m === off));

  const same = selA.size === selB.size && [...selA].every((v) => selB.has(v));
  check(`${label}.twoImpl`, 'TWO INDEPENDENT IMPLEMENTATIONS select the identical row set', same,
    `|A|=${selA.size} |B|=${selB.size} identical=${same}`);
  check(`${label}.selCount`, `reserved partition size === ${s.expectSel}`, selA.size === s.expectSel, String(selA.size));

  const sizes = [...Array(s.m).keys()].map((o) => idxA.filter((_, i) => i % s.m === o).length);
  check(`${label}.partition`, `partition sizes === ${JSON.stringify(s.expectSizes)} and sum to ${s.rows}`,
    JSON.stringify(sizes) === JSON.stringify(s.expectSizes) && sizes.reduce((a, b) => a + b, 0) === s.rows,
    JSON.stringify(sizes));

  // partitions are disjoint and exhaustive
  const seen = new Set(); let overlap = 0;
  for (let o = 0; o < s.m; o++) for (const k of idxA.filter((_, i) => i % s.m === o)) { if (seen.has(k)) overlap++; seen.add(k); }
  check(`${label}.disjoint`, 'the four reservations are disjoint and exhaustive', overlap === 0 && seen.size === s.rows,
    `overlap=${overlap} covered=${seen.size}/${s.rows}`);
}

// ---- ambiguity truth source -------------------------------------------------------
{
  const rows = rowsOf(JSON.parse(fs.readFileSync(SRC.realism.path, 'utf8')));
  const t = rows.filter((r) => r.shouldHaveMissingEvidence === true).length;
  const f = rows.filter((r) => r.shouldHaveMissingEvidence === false).length;
  const a = rows.filter((r) => !('shouldHaveMissingEvidence' in r)).length;
  check('D-C.measure', 'ambiguity truth measures exactly 87 true / 2 false / 28 absent', t === 87 && f === 2 && a === 28,
    `true=${t} false=${f} absent=${a} present=${t + f}/${rows.length}`);
}

// ---- evidence inventory: physical rows vs distinct texts --------------------------
{
  const L = (p) => rowsOf(JSON.parse(fs.readFileSync(p, 'utf8')));
  const g = L(SRC.gauntlet.path), r = L(SRC.realism.path);
  const seed = L('safescope-data/gauntlets/safescope-gauntlet.seed.json');
  const A = new Set(g.map((x) => NORM(x.observation)).filter(Boolean));
  const B = new Set(seed.map((x) => NORM(x.observation)).filter(Boolean));
  const C = new Set(r.map((x) => NORM(x.hazardObservation)).filter(Boolean));
  const inter = (x, y) => [...x].filter((v) => y.has(v)).length;
  const phys = g.length + seed.length + r.length, dist = A.size + B.size + C.size;
  check('inventory.physical', 'physical rows === 367 (150 + 100 + 117)', phys === 367, String(phys));
  check('inventory.distinct', 'distinct NORM texts === 366 (150 + 99 + 117)', dist === 366, `${A.size}+${B.size}+${C.size}=${dist}`);
  check('inventory.disjoint', 'all three sources mutually disjoint under NORM', inter(A, B) + inter(A, C) + inter(B, C) === 0,
    `${inter(A, B)}/${inter(A, C)}/${inter(B, C)}`);
}

// ---- B. AMENDMENT CLAUSE PRESENCE -------------------------------------------------
const plan = fs.readFileSync(PLAN, 'utf8');
// Clause presence is a CONTENT test, not a typography test: markdown emphasis, code ticks and line
// wrapping must not affect it. Both haystack and needle are flattened the same way.
const FLAT = (s) => s.replace(/[*`~]/g, '').replace(/\s+/g, ' ').trim();
const planFlat = FLAT(plan);
const clause = (id, claim, needle) => check(id, claim, planFlat.includes(FLAT(needle)), FLAT(needle).slice(0, 46) + '...');

clause('D-A.modulus',    'D-A modulus is explicit',                       '| 6 | modulus | **`m = 4`** |');
clause('D-A.reserve',    'D-A future reservations explicit',              '**`0` → `1` → `2` → `3`**, cyclic from `k`');
clause('D-B.mapping',    'D-B field mapping explicit',                    '**Canonical scenario identifier: `id`.**');
clause('D-B.carrier',    'D-B verbatim carrier explicit',                 '**Canonical verbatim observation carrier: `hazardObservation`**');
clause('D-B.population', 'D-B stride population is the full 117',         '**THE ENTIRE 117-ROW PHYSICAL SOURCE.**');
clause('D-B.noflag',     'D-B forbids ambiguity-gated selection',         'is **FORBIDDEN** as a selection criterion');
clause('D-C.truth',      'D-C ambiguity truth source explicit',           'The only ambiguity truth source is the declared `shouldHaveMissingEvidence`');
clause('D-C.correction', 'D-C 87/2/28 correction recorded',               '| `=== true` | **87** |');
clause('G3.denA',        'G3 denominator A is an executable predicate',   'DEN_A  = { r ∈ holdout : r.clarificationExpected === true }');
clause('G3.denB',        'G3 denominator B is an executable predicate',   'DEN_B  = { r ∈ DEN_A : provider emitted at least one candidate on r }');
clause('G3.absent',      'G3 absent-field treatment explicit',            '**absent → `false`**');
clause('G3.zeroCand',    'G3 zero-candidate treatment explicit',          'is a MISS**, counted in the denominator');
clause('G3.threshold',   'G3 threshold unchanged at 100% on both',        '`recall_A === 1.0` AND `recall_B === 1.0`');
clause('D-D.total',      'D-D total is exact, not approximate',           '**The total is exactly `25`.');
clause('D-D.alloc',      'D-D per-family allocation is exact',            '`4 + 4 + 3 + 3 + 3 + 3 + 3 + 2 = 25`');
clause('D-D.g7',         'D-D G7 membership predeclared by family',       '`G7` MEMBERSHIP IS A PROPERTY OF THE FAMILY SPECIFICATION');
clause('D-D.g7count',    'D-D G7 pole cardinality predeclared',           '**`G7` (`CLARIFICATION_MUST_NOT_ASK`) pole: exactly `11`**');
clause('D-D.g3count',    'D-D authored G3 floor predeclared',             '**`G3` (`CLARIFICATION_REQUIRED`) from authored rows: exactly `6`**');
clause('D-D.prov',       'D-D provenance marking predeclared',            '| `provenanceClass` | `INDEPENDENT_GAUNTLET` · `INDEPENDENT_REALISM` · `AUTHORED_CONTROL` |');
clause('D-D.overlap',    'D-D duplicate/overlap normalization predeclared', 'Comparison key: **`NORM(carrier)`**');
clause('D-D.indep',      'D-D authoring independence predeclared',        'MUST NOT be read, previewed, or semantically inspected before or during authoring');
clause('S-1.norm',       'NORM defined exactly',                          "NORM(s) = String(s).normalize('NFC').toLowerCase()");
clause('S-2.cmp',        'CMP defined exactly',                           'CMP(a, b) = Buffer.compare(');
clause('S-3.offset',     'OFFSET defined exactly',                        'OFFSET(digest, m) = parseInt(digest.slice(-8), 16) % m');
clause('S-5.drift',      'source-drift guard predeclared',                'If either differs, the builder MUST THROW.');
clause('inv.distinct',   'physical-vs-distinct distinction recorded',     'The `366` of record is the DISTINCT-TEXT count');

// ---- report -----------------------------------------------------------------------
console.log('  id                      result  claim');
console.log('  ' + '-'.repeat(96));
let fail = 0;
for (const r of results) {
  if (!r.pass) fail++;
  console.log('  ' + r.id.padEnd(22) + '  ' + (r.pass ? ' YES  ' : ' *NO* ') + '  ' + r.claim);
  if (r.detail) console.log('  ' + ' '.repeat(22) + '          ' + r.detail);
}
console.log('');
console.log('== FORMAL EXECUTABILITY VERDICT ==');
console.log(`  checks: ${results.length}   YES: ${results.length - fail}   NO: ${fail}`);
console.log('');
console.log('  Q: Can two independent implementations derive the same selected source identities and');
console.log('     required authored-control truth structure WITHOUT exercising semantic selection discretion?');
console.log(`  A: ${fail === 0 ? 'YES' : 'NO'}`);
console.log('');
console.log('NO ROW WAS SELECTED FOR OUTPUT. NO SOURCE IDENTIFIER WAS PRINTED. NO OBSERVATION TEXT WAS PRINTED.');
console.log('NO HOLDOUT, NO FREEZE RECORD, NO BUILDER, NO SCORER, NO CONTROL WAS CREATED. NO INFERENCE WAS RUN.');
process.exit(fail === 0 ? 0 : 1);
