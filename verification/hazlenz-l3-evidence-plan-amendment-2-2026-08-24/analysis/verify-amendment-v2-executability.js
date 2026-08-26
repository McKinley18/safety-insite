#!/usr/bin/env node
/*
 * AMENDMENT 2 -- PHASE 4 INDEPENDENT EXECUTABILITY REVIEW (FULL RE-RUN)
 *
 * Evaluated against the COMBINED governing plan: base plan + Amendment 1 + Amendment 2.
 *
 * The Amendment-1 review's 50/50 verdict is NOT inherited. EVERY criterion is re-evaluated here from
 * scratch, and the review is EXTENDED with the D-F derived-cardinality criteria that the previous
 * review lacked -- the omission that let the G4 contradiction through.
 *
 * The review must establish BOTH:
 *   (1) every construction decision is predetermined BEFORE source selection; and
 *   (2) every declared derived cardinality agrees with the deterministic membership producing it.
 *
 * CONTRACT: prints NO observation text, NO source identifiers; selects no row for output;
 * materialises nothing; invokes no model or provider; transmits nothing. It never asks whether a
 * future holdout would "look right" -- only whether another operator could execute the plan
 * deterministically and mechanically.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PLAN = 'verification/hazlenz-l3-2g-state-separation-2026-08-23/evidence-plan/INDEPENDENT_EVIDENCE_PLAN.md';
const CTRL = '../../hazlenz-l3-acceptance-holdout-frozen-2026-08-24/builder/authored-controls.js';
const { buildAuthoredControls, FROZEN_ALLOCATION } = require(path.join(__dirname, CTRL));

const rowsOf = (d) => Array.isArray(d) ? d
  : (d.scenarios || d.rows || d.items || d.data || d.entries || Object.values(d).find((v) => Array.isArray(v)) || []);
const NORM = (s) => String(s == null ? '' : s).normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();
const CMP_A = (a, b) => Buffer.compare(Buffer.from(String(a), 'utf8'), Buffer.from(String(b), 'utf8'));
const CMP_B = (a, b) => {                                   // independent byte-loop implementation
  const x = Buffer.from(String(a), 'utf8'), y = Buffer.from(String(b), 'utf8');
  const n = Math.min(x.length, y.length);
  for (let i = 0; i < n; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  return x.length === y.length ? 0 : (x.length < y.length ? -1 : 1);
};
const OFFSET = (hex, m) => parseInt(hex.slice(-8), 16) % m;
const load = (p) => { const b = fs.readFileSync(p); return { buf: b, sha: crypto.createHash('sha256').update(b).digest('hex'), rows: rowsOf(JSON.parse(b.toString('utf8'))) }; };

const SRC = {
  gauntlet: { path: 'safescope-data/gauntlets/safescope-gauntlet.source.v1.json',
              sha: 'a95e54809c41b3eb88ea35de133c5576e63c921944ca4724597852f922f0adb4',
              rows: 150, key: 'scenarioId', carrier: 'observation', m: 4, off: 0, sel: 38, sizes: [38,38,37,37] },
  realism:  { path: 'safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json',
              sha: '6f6897f11aa3b174b2863fad4edc895625e0a3d27e1318dbd2371dcd5231a9cb',
              rows: 117, key: 'id', carrier: 'hazardObservation', m: 4, off: 3, sel: 29, sizes: [30,29,29,29] },
};

const R = [];
const chk = (sec, id, claim, pass, detail) => R.push({ sec, id, claim, pass, detail: detail || '' });

// ============ SECTION A -- DETERMINISM, RE-PROVED FROM SCRATCH ============
for (const [label, s] of Object.entries(SRC)) {
  const src = load(s.path);
  chk('A', `${label}.sha`,  'source sha256 matches the frozen value', src.sha === s.sha, src.sha.slice(0, 16) + '...');
  chk('A', `${label}.rows`, `physical row count === ${s.rows}`, src.rows.length === s.rows, String(src.rows.length));

  const keys = src.rows.map((r) => r[s.key]);
  chk('A', `${label}.keyPresent`, `sort key '${s.key}' present on every row`,
      keys.filter((k) => k !== undefined && k !== null).length === src.rows.length, `${keys.filter((k)=>k!=null).length}/${src.rows.length}`);
  chk('A', `${label}.keyDistinct`, 'sort keys pairwise distinct => CMP is a STRICT TOTAL order',
      new Set(keys.map(String)).size === src.rows.length, `${new Set(keys.map(String)).size}/${src.rows.length}`);
  chk('A', `${label}.carrier`, `verbatim carrier '${s.carrier}' non-empty on every row`,
      src.rows.filter((r) => typeof r[s.carrier] === 'string' && NORM(r[s.carrier]).length > 0).length === src.rows.length,
      `${src.rows.filter((r)=>typeof r[s.carrier]==='string'&&NORM(r[s.carrier]).length>0).length}/${src.rows.length}`);

  const off = OFFSET(src.sha, s.m);
  chk('A', `${label}.offset`, `offset derives mechanically to ${s.off}`, off === s.off,
      `last8=${src.sha.slice(-8)} uint32=${parseInt(src.sha.slice(-8),16)} %${s.m}=${off}`);

  const sortedA = [...keys].map(String).sort(CMP_A);
  const selA = new Set(sortedA.filter((_, i) => i % s.m === off));
  const sortedB = [...keys].map(String);
  for (let i = 1; i < sortedB.length; i++) { const v = sortedB[i]; let j = i - 1;
    while (j >= 0 && CMP_B(sortedB[j], v) > 0) { sortedB[j+1] = sortedB[j]; j--; } sortedB[j+1] = v; }
  const selB = new Set(sortedB.filter((_, i) => i % s.m === off));
  const same = selA.size === selB.size && [...selA].every((v) => selB.has(v));
  chk('A', `${label}.twoImpl`, 'TWO INDEPENDENT IMPLEMENTATIONS select the identical row set', same,
      `|A|=${selA.size} |B|=${selB.size} identical=${same}`);
  chk('A', `${label}.selCount`, `reserved partition size === ${s.sel}`, selA.size === s.sel, String(selA.size));
  const sizes = [...Array(s.m).keys()].map((o) => sortedA.filter((_, i) => i % s.m === o).length);
  chk('A', `${label}.partition`, `partition sizes === [${s.sizes}] summing to ${s.rows}`,
      JSON.stringify(sizes) === JSON.stringify(s.sizes) && sizes.reduce((a,b)=>a+b,0) === s.rows, JSON.stringify(sizes));
  const seen = new Set(); let ov = 0;
  for (let o = 0; o < s.m; o++) for (const k of sortedA.filter((_, i) => i % s.m === o)) { if (seen.has(k)) ov++; seen.add(k); }
  chk('A', `${label}.disjoint`, 'the four reservations are disjoint and exhaustive', ov === 0 && seen.size === s.rows,
      `overlap=${ov} covered=${seen.size}/${s.rows}`);
}
{
  const G = load(SRC.gauntlet.path), Rp = load(SRC.realism.path);
  const S = load('safescope-data/gauntlets/safescope-gauntlet.seed.json');
  chk('A', 'seed.sha', 'reserve tranche sha256 matches', S.sha === '49aa40fdcc507d549f22b59c9791823c3f1196034543df1746c8eb5d857b73fe', S.sha.slice(0,16)+'...');
  const TG = new Set(G.rows.map((r)=>NORM(r.observation)).filter(Boolean));
  const TS = new Set(S.rows.map((r)=>NORM(r.observation)).filter(Boolean));
  const TR = new Set(Rp.rows.map((r)=>NORM(r.hazardObservation)).filter(Boolean));
  const inter = (x,y) => [...x].filter((v)=>y.has(v)).length;
  chk('A', 'inventory.physical', 'physical rows === 367', G.rows.length+S.rows.length+Rp.rows.length === 367, String(G.rows.length+S.rows.length+Rp.rows.length));
  chk('A', 'inventory.distinct', 'distinct NORM texts === 366', TG.size+TS.size+TR.size === 366, `${TG.size}+${TS.size}+${TR.size}`);
  chk('A', 'inventory.disjoint', 'all three sources mutually disjoint under NORM', inter(TG,TS)+inter(TG,TR)+inter(TS,TR) === 0,
      `${inter(TG,TS)}/${inter(TG,TR)}/${inter(TS,TR)}`);
  chk('A', 'ambiguity.truth', 'ambiguity truth measures 87 true / 2 false / 28 absent',
      Rp.rows.filter((r)=>r.shouldHaveMissingEvidence===true).length===87 &&
      Rp.rows.filter((r)=>r.shouldHaveMissingEvidence===false).length===2 &&
      Rp.rows.filter((r)=>!('shouldHaveMissingEvidence' in r)).length===28, '87/2/28');
}

// ============ SECTION B -- D-F DERIVED-CARDINALITY CONSISTENCY (NEW) ============
{
  const c = buildAuthoredControls();
  const alloc = {}; for (const f of Object.keys(FROZEN_ALLOCATION)) alloc[f] = c.filter((x)=>x.family===f).length;
  const G = load(SRC.gauntlet.path), Rp = load(SRC.realism.path);
  const sel = (s, src) => { const k = OFFSET(src.sha, s.m);
    return src.rows.map((r)=>String(r[s.key])).sort(CMP_A).filter((_, i)=>i % s.m === k).length; };
  const gSel = sel(SRC.gauntlet, G), rSel = sel(SRC.realism, Rp);

  for (const f of Object.keys(FROZEN_ALLOCATION))
    chk('B', `alloc.${f}`, `family ${f} allocation === ${FROZEN_ALLOCATION[f]} (derived from frozen template)`,
        alloc[f] === FROZEN_ALLOCATION[f], `${alloc[f]}`);
  chk('B', 'alloc.total', 'authored total === 25 (derived, not hard-coded)', c.length === 25, String(c.length));
  chk('B', 'composition.total', 'holdout total === 92 (38 + 29 + 25, all derived)', gSel + rSel + c.length === 92, `${gSel}+${rSel}+${c.length}`);
  chk('B', 'composition.independent', 'INDEPENDENT rows === 67 (derived)', gSel + rSel === 67, String(gSel + rSel));
  chk('B', 'composition.share', 'INDEPENDENT share === 72.8% (derived)',
      (((gSel+rSel)/(gSel+rSel+c.length))*100).toFixed(1) === '72.8', (((gSel+rSel)/(gSel+rSel+c.length))*100).toFixed(1)+'%');

  const g3s = c.filter((x)=>x.expect.clarificationExpected===true).length;
  const g3f = c.filter((x)=>x.expect.inG3Denominator).length;
  const g3e = alloc.F3 + alloc.F6;
  chk('B', 'G3.tripleAgree', 'G3 authored: semantic === flag === enumerated === 6',
      g3s===6 && g3f===6 && g3e===6, `semantic=${g3s} flag=${g3f} enumerated=${g3e}`);

  const g7s = c.filter((x)=>x.pole==='CLARIFICATION_MUST_NOT_ASK').length;
  const g7f = c.filter((x)=>x.expect.inG7Pole).length;
  const g7e = alloc.F1 + alloc.F2 + alloc.F7;
  chk('B', 'G7.tripleAgree', 'G7 pole: semantic === flag === enumerated === 11',
      g7s===11 && g7f===11 && g7e===11, `semantic=${g7s} flag=${g7f} enumerated=${g7e}`);

  const g4s = c.filter((x)=>x.expect.conditionState!=='ACTIVE').length;
  const g4f = c.filter((x)=>x.expect.inG4Denominator).length;
  const g4e = alloc.F1+alloc.F2+alloc.F3+alloc.F4+alloc.F5+alloc.F6 + c.filter((x)=>x.familyVariant==='F8b').length;
  chk('B', 'G4.tripleAgree', 'G4 denominator: semantic === flag === enumerated === 21 (AMENDMENT 2)',
      g4s===21 && g4f===21 && g4e===21, `semantic=${g4s} flag=${g4f} enumerated=${g4e}`);
  const act = c.filter((x)=>x.expect.conditionState==='ACTIVE').length;
  chk('B', 'G4.closure', 'G4 members + ACTIVE-truth members exhaust the 25 exactly (21 + 4)',
      g4s + act === c.length && act === 4, `${g4s} + ${act} = ${g4s+act}`);
  chk('B', 'G4.notEighteen', 'the superseded value 18 is NOT reproducible from any frozen membership',
      g4s !== 18 && g4f !== 18 && g4e !== 18, 'all three derivations = 21');
}

// ============ SECTION C -- CLAUSE PRESENCE IN THE COMBINED PLAN ============
const planRaw = fs.readFileSync(PLAN, 'utf8');
// Clause presence is a CONTENT test, not a typography test: markdown emphasis, code ticks,
// line wrapping AND typographic punctuation (curly quotes, en/em dashes) must not affect it.
const FLAT = (s) => s
  .replace(/[\u2018\u2019\u201B]/g, "'")      // curly single quotes -> ASCII apostrophe
  .replace(/[\u201C\u201D]/g, '"')             // curly double quotes -> ASCII
  .replace(/[\u2010-\u2015]/g, '-')            // hyphen/en/em dashes -> ASCII hyphen
  .replace(/[*`~]/g, '')
  .replace(/\s+/g, ' ').trim();
const flat = FLAT(planRaw);
const cl = (id, claim, needle) => chk('C', id, claim, flat.includes(FLAT(needle)), FLAT(needle).slice(0, 44) + '...');

cl('A1.present',   'Amendment 1 is present and NOT erased',        'AMENDMENT 1 — D-A … D-D (2026-08-24) BINDING');
cl('A2.present',   'Amendment 2 is present and append-only',        'AMENDMENT 2 — D-E G4 DENOMINATOR RECONCILIATION');
cl('A1.intact',    'Amendment 1 original G4 line preserved verbatim','G4 (false ACTIVE) denominator: exactly 18');
cl('D-A.modulus',  'D-A modulus explicit',                          '| 6 | modulus | m = 4 |');
cl('D-A.reserve',  'D-A reservation schedule explicit',             '0 → 1 → 2 → 3, cyclic from k');
cl('D-B.mapping',  'D-B canonical identifier explicit',             'Canonical scenario identifier: id.');
cl('D-B.carrier',  'D-B verbatim carrier explicit',                 'Canonical verbatim observation carrier: hazardObservation');
cl('D-B.pop',      'D-B strides the full 117-row population',       'THE ENTIRE 117-ROW PHYSICAL SOURCE.');
cl('D-B.noflag',   'D-B forbids ambiguity-gated selection',         'is FORBIDDEN as a selection criterion');
cl('D-C.truth',    'D-C names the only ambiguity truth source',     'The only ambiguity truth source is the declared shouldHaveMissingEvidence');
cl('D-C.numbers',  'D-C records 87 / 2 / 28',                       '| === true | 87 |');
cl('G3.denA',      'G3 DEN_A is an executable predicate',           'DEN_A = { r ∈ holdout : r.clarificationExpected === true }');
cl('G3.denB',      'G3 DEN_B is an executable predicate',           'DEN_B = { r ∈ DEN_A : provider emitted at least one candidate on r }');
cl('G3.absent',    'G3 absent-field treatment explicit',            'absent → false');
cl('G3.zero',      'G3 zero-candidate treatment explicit',          'is a MISS, counted in the denominator');
cl('G3.threshold', 'G3 threshold unchanged at 100% on both',        'recall_A === 1.0 AND recall_B === 1.0');
cl('D-D.total',    'D-D total is exact',                            'The total is exactly 25.');
cl('D-D.alloc',    'D-D per-family allocation exact',               '4 + 4 + 3 + 3 + 3 + 3 + 3 + 2 = 25');
cl('D-D.g7gov',    'G7 membership is a family property',            'G7 MEMBERSHIP IS A PROPERTY OF THE FAMILY SPECIFICATION');
cl('D-D.prov',     'provenance marking predeclared',                '| provenanceClass | INDEPENDENT_GAUNTLET · INDEPENDENT_REALISM · AUTHORED_CONTROL |');
cl('D-D.overlap',  'duplicate/overlap normalization predeclared',   'Comparison key: NORM(carrier)');
cl('D-D.indep',    'authoring independence predeclared',            'MUST NOT be read, previewed, or semantically inspected before or during authoring');
cl('S-1',          'NORM defined exactly',                          "NORM(s) = String(s).normalize('NFC').toLowerCase()");
cl('S-2',          'CMP defined exactly',                           'CMP(a, b) = Buffer.compare(');
cl('S-3',          'OFFSET defined exactly',                        'OFFSET(digest, m) = parseInt(digest.slice(-8), 16) % m');
cl('S-5',          'source-drift guard predeclared',                'If either differs, the builder MUST THROW.');
cl('inv.counts',   'physical-vs-distinct distinction recorded',     'The 366 of record is the DISTINCT-TEXT count');
// --- Amendment 2 specific ---
cl('D-E.value',    'D-E declares the G4 denominator as 21',         '| G4 DENOMINATOR | | 21 |');
cl('D-E.arith',    'D-E shows the arithmetic',                      '4 + 4 + 3 + 3 + 3 + 3 + 1 = 21');
cl('D-E.scope',    'D-E changes only the cardinality',              'G4 DECLARED CARDINALITY: 18 → 21. NOTHING ELSE.');
cl('D-E.f6',       'D-E preserves F6 in G4',                        'change F6’s membership');
cl('D-E.preserve', 'D-E preserves the false-ACTIVE semantics',      'An ACTIVE result on F3 or F6 is a G4 false-ACTIVE failure');
cl('D-E.nature',   'D-E records the defect as arithmetic, not substantive', '18 was an arithmetic contradiction, not a competing substantive G4 membership rule');
cl('D-E.closure',  'D-E records the closure check',                 '21 + 4 = 25');
cl('D-F.invariant','D-F derived-cardinality invariant present',      'FOR EVERY FROZEN ACCEPTANCE SET WHOSE MEMBERSHIP IS SPECIFIED BY AN ENUMERATION');
cl('D-F.general',  'D-F is general, not G4-specific',                'This invariant is general. It is not limited to G4.');
cl('D-F.never',    'D-F forbids inheriting a declared number',       'A declared number must NEVER be accepted merely because it appeared in a previous amendment.');
cl('D-F.cross',    'D-F requires semantic/flag cross-check',         'A disagreement between the two is itself a contradiction');
cl('D-F.stop',     'D-F stops rather than opportunistically repairing','Do not repair a second contradiction');
cl('A1.freezeDead','Attempt-1 freeze may never be reused',           'MUST NEVER be reused as the freeze identity for Attempt 2');
cl('A2.newFreeze', 'Attempt 2 requires a NEW freeze record',         'Attempt 2 requires a NEW construction authorization and a NEW freeze record');
cl('A2.unspent',   'holdout remains unspent',                        'HOLDOUT_SPENT remains false.');

// ============ REPORT ============
const secName = { A: 'A. DETERMINISM (re-proved from scratch)', B: 'B. D-F DERIVED-CARDINALITY CONSISTENCY (new)', C: 'C. CLAUSE PRESENCE (base + A1 + A2)' };
let fail = 0, cur = null;
for (const r of R) {
  if (r.sec !== cur) { cur = r.sec; console.log(`\n== SECTION ${secName[cur]} ==\n`); }
  if (!r.pass) fail++;
  console.log('  ' + r.id.padEnd(24) + (r.pass ? ' YES  ' : ' *NO* ') + '  ' + r.claim);
  if (r.detail) console.log('  ' + ' '.repeat(24) + '        ' + r.detail);
}
console.log('');
console.log('== PHASE 4 -- INDEPENDENT EXECUTABILITY REVIEW, FULL RE-RUN ==');
console.log(`  governing plan: base + Amendment 1 + Amendment 2`);
console.log(`  criteria: ${R.length}   YES: ${R.length - fail}   NO: ${fail}`);
console.log(`  RESULT: ${R.length - fail}/${R.length} independently executable`);
console.log('');
console.log('  (1) every construction decision predetermined BEFORE source selection : ' + (fail === 0 ? 'YES' : 'NO'));
console.log('  (2) every declared derived cardinality agrees with its membership     : ' + (fail === 0 ? 'YES' : 'NO'));
console.log('');
console.log('  The Amendment-1 verdict of 50/50 was NOT inherited. Every criterion above was');
console.log('  re-evaluated, and Section B did not exist in that review -- it is the gap that let');
console.log('  the G4 contradiction through.');
console.log('');
console.log('NO ROW SELECTED FOR OUTPUT. NO SOURCE IDENTIFIER PRINTED. NO OBSERVATION TEXT PRINTED.');
console.log('NO HOLDOUT, NO FREEZE RECORD, NO BUILDER OUTPUT, NO SCORER. NO INFERENCE. NO EGRESS.');
process.exit(fail === 0 ? 0 : 1);
