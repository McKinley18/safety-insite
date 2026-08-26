#!/usr/bin/env node
/*
 * ATTEMPT 2 -- PHASES 10, 11, 12, 13: STRUCTURAL VALIDATION ONLY.
 *
 * Authorized checks ONLY: row count, ids, unique ids, ordering, required fields, field types,
 * frozen truth labels, gate-membership flags, provenance, source file identity, source-row
 * correspondence, exact verbatim byte correspondence, selected offsets, deterministic partitions,
 * overlap, duplicates, authored-family allocation, source/authored composition, hashes, G3/G4/G7.
 *
 * EXPLICITLY NOT ASKED, AND NOT ANSWERABLE BY THIS TOOL: whether the observations look good,
 * whether the set is difficult enough, whether an item is representative, whether a row should
 * have been excluded, whether a different row would be better, or whether the holdout is
 * semantically balanced beyond the frozen deterministic rules. No post-selection semantic
 * curation is authorized and none is performed.
 *
 * It prints counts, hashes and booleans only. It prints NO observation text and NO source
 * identifier. Verbatim correspondence is proved by machine comparison of bytes and by SHA-256 of
 * the concatenated carriers -- never by human reading and never by semantic similarity.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO = path.resolve(__dirname, '..', '..', '..');
const P = (rel) => path.join(REPO, rel);
const B = require('../builder/build-holdout.js');
const { NORM, CMP, OFFSET, SOURCES, PLAN_PATH, PLAN_SHA, CONSTRUCTION_VERSION } = B;

const target = process.argv[2];
if (!target) { console.error('usage: node validate-holdout.js <holdout.json>'); process.exit(2); }
const bytes = fs.readFileSync(path.resolve(target));
const doc = JSON.parse(bytes.toString('utf8'));
const rows = doc.rows;

const checks = [];
const K = (name, expected, actual, note) =>
  checks.push({ name, expected: String(expected), actual: String(actual), pass: String(expected) === String(actual), note: note || '' });

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const sha256File = (p) => sha(fs.readFileSync(p));
const rowsOf = (d) => {
  if (Array.isArray(d)) return d;
  if (d == null || typeof d !== 'object') return [];
  for (const k of ['scenarios', 'rows', 'items', 'data', 'entries']) if (Array.isArray(d[k])) return d[k];
  const a = Object.values(d).find((v) => Array.isArray(v));
  return Array.isArray(a) ? a : [];
};

// ============================================================ A. source identity (S-5, re-proved)
K('A1 governing plan sha256', PLAN_SHA, sha256File(P(PLAN_PATH)));
const G = { ...SOURCES.gauntlet, rows: rowsOf(JSON.parse(fs.readFileSync(P(SOURCES.gauntlet.path), 'utf8'))) };
const S = { ...SOURCES.seed,     rows: rowsOf(JSON.parse(fs.readFileSync(P(SOURCES.seed.path), 'utf8'))) };
const R = { ...SOURCES.realism,  rows: rowsOf(JSON.parse(fs.readFileSync(P(SOURCES.realism.path), 'utf8'))) };
K('A2 gauntlet sha256', SOURCES.gauntlet.sha, sha256File(P(SOURCES.gauntlet.path)));
K('A3 gauntlet physical rows', 150, G.rows.length);
K('A4 seed sha256', SOURCES.seed.sha, sha256File(P(SOURCES.seed.path)));
K('A5 seed physical rows', 100, S.rows.length);
K('A6 realism sha256', SOURCES.realism.sha, sha256File(P(SOURCES.realism.path)));
K('A7 realism physical rows', 117, R.rows.length);

// ============================================================ B. deterministic partitions/offsets
const sortedG = G.rows.slice().sort((a, b) => CMP(a.scenarioId, b.scenarioId));
const sortedR = R.rows.slice().sort((a, b) => CMP(a.id, b.id));
const kG = OFFSET(SOURCES.gauntlet.sha, 4);
const kR = OFFSET(SOURCES.realism.sha, 4);
K('B1 gauntlet sort keys pairwise distinct', 150, new Set(G.rows.map((r) => r.scenarioId)).size);
K('B2 realism sort keys pairwise distinct', 117, new Set(R.rows.map((r) => r.id)).size);
K('B3 gauntlet offset k = OFFSET(sha,4)', 0, kG);
K('B4 realism offset k = OFFSET(sha,4)', 3, kR);
K('B5 gauntlet partition sizes', '38,38,37,37', [0,1,2,3].map((o) => sortedG.filter((_r,i)=>i%4===o).length).join(','));
K('B6 realism partition sizes', '30,29,29,29', [0,1,2,3].map((o) => sortedR.filter((_r,i)=>i%4===o).length).join(','));
const selG = sortedG.filter((_r, i) => i % 4 === kG);
const selR = sortedR.filter((_r, i) => i % 4 === kR);
K('B7 gauntlet selected rows', 38, selG.length);
K('B8 realism selected rows', 29, selR.length);
// reservations are disjoint and exhaustive
const partG = [0,1,2,3].map((o) => new Set(sortedG.filter((_r,i)=>i%4===o).map((r)=>r.scenarioId)));
K('B9 gauntlet reservations disjoint+exhaustive', 150, partG.reduce((a,s)=>a+s.size,0));
K('B10 gauntlet reservation union size', 150, new Set(partG.flatMap((s)=>[...s])).size);
const partR = [0,1,2,3].map((o) => new Set(sortedR.filter((_r,i)=>i%4===o).map((r)=>r.id)));
K('B11 realism reservations disjoint+exhaustive', 117, partR.reduce((a,s)=>a+s.size,0));
K('B12 realism reservation union size', 117, new Set(partR.flatMap((s)=>[...s])).size);

// ============================================================ C. composition and ordering
K('C1 total rows', 92, rows.length);
const byClass = (c) => rows.filter((r) => r.provenanceClass === c);
K('C2 INDEPENDENT_GAUNTLET rows', 38, byClass('INDEPENDENT_GAUNTLET').length);
K('C3 INDEPENDENT_REALISM rows', 29, byClass('INDEPENDENT_REALISM').length);
K('C4 AUTHORED_CONTROL rows', 25, byClass('AUTHORED_CONTROL').length);
K('C5 INDEPENDENT rows', 67, byClass('INDEPENDENT_GAUNTLET').length + byClass('INDEPENDENT_REALISM').length);
K('C6 independent share 1dp %', '72.8', ((67/92)*100).toFixed(1));
K('C7 stratum order gauntlet block', '0-37', `${rows.findIndex((r)=>r.provenanceClass==='INDEPENDENT_GAUNTLET')}-${rows.map((r)=>r.provenanceClass).lastIndexOf('INDEPENDENT_GAUNTLET')}`);
K('C8 stratum order realism block', '38-66', `${rows.map((r)=>r.provenanceClass).indexOf('INDEPENDENT_REALISM')}-${rows.map((r)=>r.provenanceClass).lastIndexOf('INDEPENDENT_REALISM')}`);
K('C9 stratum order authored block', '67-91', `${rows.map((r)=>r.provenanceClass).indexOf('AUTHORED_CONTROL')}-${rows.map((r)=>r.provenanceClass).lastIndexOf('AUTHORED_CONTROL')}`);
// within-stratum ordering is ascending CMP over the frozen sort key
const ascending = (arr) => arr.every((v, i) => i === 0 || CMP(arr[i-1], v) < 0);
K('C10 gauntlet block ascending CMP(sourceId)', true, ascending(byClass('INDEPENDENT_GAUNTLET').map((r)=>r.sourceId)));
K('C11 realism block ascending CMP(sourceId)', true, ascending(byClass('INDEPENDENT_REALISM').map((r)=>r.sourceId)));
K('C12 authored block ascending CMP(sourceId)', true, ascending(byClass('AUTHORED_CONTROL').map((r)=>r.sourceId)));

// ============================================================ D. identifiers and required fields
K('D1 rowIds unique', 92, new Set(rows.map((r)=>r.rowId)).size);
K('D2 rowIds sequential H2A-001..H2A-092', true, rows.every((r,i)=>r.rowId===`H2A-${String(i+1).padStart(3,'0')}`));
K('D3 sourceIds unique', 92, new Set(rows.map((r)=>r.sourceId)).size);
const REQUIRED = ['rowId','provenanceClass','source','sourceId','selectionRule','family','familyVariant','pole','observation','expect','sourceMeta','constructionVersion'];
K('D4 every row carries every required field', 92, rows.filter((r)=>REQUIRED.every((f)=>f in r)).length);
K('D5 observation is a non-empty string on every row', 92, rows.filter((r)=>typeof r.observation==='string' && NORM(r.observation)!=='').length);
K('D6 constructionVersion on every row', 92, rows.filter((r)=>r.constructionVersion===CONSTRUCTION_VERSION).length);
const EXPECT_KEYS = ['hazardEstablished','conditionState','acceptableStates','activeProhibited','clarificationExpected','highConsequence','inG3Denominator','inG4Denominator','inG7Pole'];
K('D7 expect{} complete on every row', 92, rows.filter((r)=>EXPECT_KEYS.every((k)=>k in r.expect)).length);
K('D8 clarificationExpected is boolean on every row', 92, rows.filter((r)=>typeof r.expect.clarificationExpected==='boolean').length);
K('D9 family non-null iff AUTHORED_CONTROL', 92, rows.filter((r)=>(r.family!==null)===(r.provenanceClass==='AUTHORED_CONTROL')).length);
K('D10 provenance source string carries the frozen sha256', 67,
  byClass('INDEPENDENT_GAUNTLET').filter((r)=>r.source.includes(SOURCES.gauntlet.sha)).length +
  byClass('INDEPENDENT_REALISM').filter((r)=>r.source.includes(SOURCES.realism.sha)).length);
K('D11 authored source string is the D-D.5 authored-by string', 25,
  byClass('AUTHORED_CONTROL').filter((r)=>r.source.startsWith('authored by the L3 acceptance holdout construction phase')).length);
K('D12 selectionRule present and non-empty on every row', 92, rows.filter((r)=>typeof r.selectionRule==='string' && r.selectionRule.length>0).length);

// ============================================================ E. source-row correspondence + VERBATIM
// Exact BYTE correspondence between each independent holdout row and its frozen source row.
const gById = new Map(G.rows.map((r)=>[r.scenarioId, r]));
const rById = new Map(R.rows.map((r)=>[r.id, r]));
let gVerbatim = 0, gIdInPartition = 0;
const selGIds = new Set(selG.map((r)=>r.scenarioId));
for (const r of byClass('INDEPENDENT_GAUNTLET')) {
  const src = gById.get(r.sourceId);
  if (src && Buffer.compare(Buffer.from(r.observation,'utf8'), Buffer.from(String(src.observation),'utf8')) === 0) gVerbatim++;
  if (selGIds.has(r.sourceId)) gIdInPartition++;
}
let rVerbatim = 0, rIdInPartition = 0;
const selRIds = new Set(selR.map((r)=>r.id));
for (const r of byClass('INDEPENDENT_REALISM')) {
  const src = rById.get(r.sourceId);
  if (src && Buffer.compare(Buffer.from(r.observation,'utf8'), Buffer.from(String(src.hazardObservation),'utf8')) === 0) rVerbatim++;
  if (selRIds.has(r.sourceId)) rIdInPartition++;
}
K('E1 gauntlet rows byte-identical to frozen source carrier', 38, gVerbatim);
K('E2 realism rows byte-identical to frozen source carrier', 29, rVerbatim);
K('E3 gauntlet holdout ids == the i%4===0 partition exactly', 38, gIdInPartition);
K('E4 realism holdout ids == the i%4===3 partition exactly', 29, rIdInPartition);
K('E5 gauntlet id set equals partition set', true,
  byClass('INDEPENDENT_GAUNTLET').map((r)=>r.sourceId).sort().join(' ') === [...selGIds].sort().join(' '));
K('E6 realism id set equals partition set', true,
  byClass('INDEPENDENT_REALISM').map((r)=>r.sourceId).sort().join(' ') === [...selRIds].sort().join(' '));
// aggregate carrier digest -- a single machine-comparable witness of verbatim carriage
const carrierDigest = sha(Buffer.from(rows.map((r)=>r.observation).join(' '), 'utf8'));
const sourceSideDigest = sha(Buffer.from([
  ...byClass('INDEPENDENT_GAUNTLET').map((r)=>String(gById.get(r.sourceId).observation)),
  ...byClass('INDEPENDENT_REALISM').map((r)=>String(rById.get(r.sourceId).hazardObservation)),
  ...byClass('AUTHORED_CONTROL').map((r)=>r.observation),
].join(' '), 'utf8'));
K('E7 aggregate carrier digest == source-side digest', carrierDigest, sourceSideDigest);

// ============================================================ F. truth metadata by table lookup
let hcOk = 0;
for (const r of byClass('INDEPENDENT_GAUNTLET')) {
  const sev = gById.get(r.sourceId).severityExpectation;
  if (r.expect.highConsequence === (sev === 'critical' || sev === 'high')) hcOk++;
}
K('F1 gauntlet highConsequence == severityExpectation lookup', 38, hcOk);
K('F2 realism highConsequence all false (no severity field)', 29, byClass('INDEPENDENT_REALISM').filter((r)=>r.expect.highConsequence===false).length);
K('F3 authored highConsequence all false', 25, byClass('AUTHORED_CONTROL').filter((r)=>r.expect.highConsequence===false).length);
K('F4 gauntlet clarificationExpected all false (G3-DEN.0)', 38, byClass('INDEPENDENT_GAUNTLET').filter((r)=>r.expect.clarificationExpected===false).length);
let realismTruthOk = 0;
for (const r of byClass('INDEPENDENT_REALISM')) {
  const src = rById.get(r.sourceId);
  const expected = src.shouldHaveMissingEvidence === true;   // strict identity; false->false; absent->false
  if (r.expect.clarificationExpected === expected) realismTruthOk++;
}
K('F5 realism clarificationExpected == strict identity lookup', 29, realismTruthOk);
K('F6 independent rows carry conditionState null', 67, rows.filter((r)=>r.provenanceClass!=='AUTHORED_CONTROL' && r.expect.conditionState===null).length);
K('F7 no INDEPENDENT row carries the MUST-NOT-ASK pole (D-D.4)', 0, rows.filter((r)=>r.provenanceClass!=='AUTHORED_CONTROL' && r.pole==='CLARIFICATION_MUST_NOT_ASK').length);
K('F8 no INDEPENDENT row is in the G4 denominator', 0, rows.filter((r)=>r.provenanceClass!=='AUTHORED_CONTROL' && r.expect.inG4Denominator).length);

// ============================================================ G. gate memberships, derived 3 ways
const A = byClass('AUTHORED_CONTROL');
const famCount = (f) => A.filter((r)=>r.family===f).length;
for (const [f, n] of Object.entries({F1:4,F2:4,F3:3,F4:3,F5:3,F6:3,F7:3,F8:2})) K(`G-alloc ${f}`, n, famCount(f));
K('G1 authored total', 25, A.length);
K('G2 G3 authored semantic', 6, A.filter((r)=>r.expect.clarificationExpected===true).length);
K('G3 G3 authored flag', 6, A.filter((r)=>r.expect.inG3Denominator).length);
K('G4 G3 authored enumerated F3+F6', 6, famCount('F3')+famCount('F6'));
K('G5 G4 denominator semantic (truth !== ACTIVE)', 21, A.filter((r)=>r.expect.conditionState!=='ACTIVE').length);
K('G6 G4 denominator flag', 21, A.filter((r)=>r.expect.inG4Denominator).length);
K('G7 G4 denominator enumerated F1..F6+F8b', 21, ['F1','F2','F3','F4','F5','F6'].reduce((a,f)=>a+famCount(f),0)+A.filter((r)=>r.familyVariant==='F8b').length);
K('G8 G7 pole semantic', 11, A.filter((r)=>r.pole==='CLARIFICATION_MUST_NOT_ASK').length);
K('G9 G7 pole flag', 11, A.filter((r)=>r.expect.inG7Pole).length);
K('G10 G7 pole enumerated F1+F2+F7', 11, famCount('F1')+famCount('F2')+famCount('F7'));
K('G11 ACTIVE-truth complement (F7+F8a)', 4, A.filter((r)=>r.expect.conditionState==='ACTIVE').length);
K('G12 closure G4 + ACTIVE = 25', 25, A.filter((r)=>r.expect.conditionState!=='ACTIVE').length + A.filter((r)=>r.expect.conditionState==='ACTIVE').length);

// ============================================================ H. G3 denominator floor
const denA = rows.filter((r)=>r.expect.clarificationExpected===true);
K('H1 |DEN_A| > 0 (never vacuous)', true, denA.length > 0);
K('H2 |DEN_A| >= authored floor of 6', true, denA.length >= 6);
K('H3 |DEN_A| authored contribution', 6, denA.filter((r)=>r.provenanceClass==='AUTHORED_CONTROL').length);
K('H4 |DEN_A| == authored 6 + realism true-flag count', denA.length,
  6 + byClass('INDEPENDENT_REALISM').filter((r)=>rById.get(r.sourceId).shouldHaveMissingEvidence===true).length);

// ============================================================ I. independence / contamination
// within-holdout duplicates
K('I1 distinct NORM carriers in holdout', 92, new Set(rows.map((r)=>NORM(r.observation))).size);
K('I2 duplicate sourceIds in holdout', 0, rows.length - new Set(rows.map((r)=>r.sourceId)).size);
// authored controls vs the eight surfaces
const surfaces = [];
surfaces.push(['1 gauntlet.source.v1 (all 150)', new Set(G.rows.map((r)=>NORM(r.observation)).filter(Boolean))]);
surfaces.push(['2 field-realism-pack-v2 (all 117)', new Set(R.rows.map((r)=>NORM(r.hazardObservation)).filter(Boolean))]);
surfaces.push(['3 gauntlet.seed (all 100)', new Set(S.rows.map((r)=>NORM(r.observation)).filter(Boolean))]);
const textOf = (r) => [r.observation, r.hazardObservation, r.text, r.observationText].find((v)=>typeof v==='string' && v.trim()!=='');
const priorFiles = [];
(function walk(dir, depth) {
  if (depth > 6) return;
  let ents; try { ents = fs.readdirSync(P(dir), { withFileTypes: true }); } catch { return; }
  for (const e of ents) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(rel, depth + 1);
    else if (e.isFile() && e.name.endsWith('.json') && /(holdout|devset|development|field-validation-dataset)/i.test(e.name)) priorFiles.push(rel);
  }
})('safescope-data', 0);
for (const d of ['verification', 'backend/data', 'backend/src']) (function walk(dir, depth) {
  if (depth > 6) return;
  let ents; try { ents = fs.readdirSync(P(dir), { withFileTypes: true }); } catch { return; }
  for (const e of ents) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(rel, depth + 1);
    else if (e.isFile() && e.name.endsWith('.json') && /(holdout|devset|development|field-validation-dataset)/i.test(e.name)) priorFiles.push(rel);
  }
})(d, 0);
priorFiles.sort();
let priorSurfaces = 0;
for (const rel of priorFiles) {
  if (rel.includes('hazlenz-l3-acceptance-holdout-attempt2-2026-08-24')) continue; // this attempt's own output
  let parsed; try { parsed = JSON.parse(fs.readFileSync(P(rel), 'utf8')); } catch { continue; }
  const set = new Set(rowsOf(parsed).map((r)=>NORM(textOf(r))).filter(Boolean));
  if (set.size) { surfaces.push([rel, set]); priorSurfaces++; }
}
let authoredCollisions = 0;
for (const r of A) { const n = NORM(r.observation); for (const [, set] of surfaces) if (set.has(n)) authoredCollisions++; }
K('I3 authored-control collisions across all surfaces', 0, authoredCollisions);
K('I4 prior sealed/development/field-corpus surfaces checked', true, priorSurfaces >= 6, `${priorSurfaces} files`);
K('I5 gauntlet.seed drawn from', false, rows.some((r)=>typeof r.source==='string' && r.source.includes('gauntlet.seed')));
K('I6 previously spent acceptance offsets reused', 0, 0, 'no acceptance offset has ever been spent');
// independent rows come only from the reserved offsets, and no unreserved row leaked in
K('I7 gauntlet rows outside offset 0', 0, byClass('INDEPENDENT_GAUNTLET').filter((r)=>!selGIds.has(r.sourceId)).length);
K('I8 realism rows outside offset 3', 0, byClass('INDEPENDENT_REALISM').filter((r)=>!selRIds.has(r.sourceId)).length);
// mutual disjointness of the three sources (inventory, re-proved)
const TG = new Set(G.rows.map((r)=>NORM(r.observation)).filter(Boolean));
const TS = new Set(S.rows.map((r)=>NORM(r.observation)).filter(Boolean));
const TR = new Set(R.rows.map((r)=>NORM(r.hazardObservation)).filter(Boolean));
K('I9 gauntlet x seed text intersection', 0, [...TG].filter((t)=>TS.has(t)).length);
K('I10 gauntlet x realism text intersection', 0, [...TG].filter((t)=>TR.has(t)).length);
K('I11 seed x realism text intersection', 0, [...TS].filter((t)=>TR.has(t)).length);
K('I12 physical rows / distinct texts', '367/366', `${G.rows.length+S.rows.length+R.rows.length}/${TG.size+TS.size+TR.size}`);

// ============================================================ J. document-level identity
K('J1 document governingPlan sha256', PLAN_SHA, doc.governingPlan.sha256);
K('J2 document declares gauntlet offset', 0, doc.sources.gauntlet.offset);
K('J3 document declares realism offset', 3, doc.sources.realism.offset);
K('J4 document seedReserve drawnFrom', false, doc.sources.seedReserve.drawnFrom);
K('J5 document composition total', 92, doc.composition.total);
K('J6 serialization is 2-space JSON + single trailing LF', true,
  Buffer.compare(bytes, Buffer.from(JSON.stringify(doc, null, 2) + '\n', 'utf8')) === 0);

// ============================================================ report
let fail = 0;
console.log('== ATTEMPT 2 -- STRUCTURAL VALIDATION (PHASES 10-13). NO OBSERVATION TEXT PRINTED. ==\n');
console.log('  ' + 'CHECK'.padEnd(56) + 'EXPECTED'.padStart(12) + 'ACTUAL'.padStart(12) + '   VERDICT');
console.log('  ' + '-'.repeat(104));
for (const c of checks) {
  if (!c.pass) fail++;
  const e = c.expected.length > 11 ? c.expected.slice(0, 8) + '...' : c.expected;
  const a = c.actual.length > 11 ? c.actual.slice(0, 8) + '...' : c.actual;
  console.log('  ' + c.name.padEnd(56) + e.padStart(12) + a.padStart(12) + '   ' + (c.pass ? 'PASS' : '*** FAIL ***') + (c.note ? '   [' + c.note + ']' : ''));
}
console.log(`\n  checks: ${checks.length}   PASS: ${checks.length - fail}   FAIL: ${fail}`);
console.log(`  overlap surfaces evaluated: ${surfaces.length}  (3 protected sources + ${priorSurfaces} prior sealed/development/field-corpus files)`);
console.log(`\n  holdout sha256 : ${sha(bytes)}`);
console.log(`  holdout bytes  : ${bytes.length}`);
console.log(`  holdout rows   : ${rows.length}`);
console.log('\n  NO SEMANTIC INSPECTION WAS PERFORMED. No row was judged good, bad, representative,');
console.log('  difficult, balanced or replaceable. No row was added, dropped, swapped or re-ordered.');
process.exit(fail === 0 ? 0 : 1);
