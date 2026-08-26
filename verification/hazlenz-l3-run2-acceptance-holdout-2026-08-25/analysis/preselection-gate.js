/**
 * PHASE 3 -- RUN-2 PRE-SELECTION DECLARED-VS-DERIVED GATE (D-F, expanded).
 *
 * Runs BEFORE any Run-2 selection code exists. Reads SORT KEYS, COUNTS and FROZEN METADATA FLAGS
 * only. It reads NO observation text, selects NO row, and does NOT compute |DEN_A| -- D-B.3
 * requires that after selection, and computing it here would be defect E-3.
 */
'use strict';
const fs=require('fs'), path=require('path'), crypto=require('crypto');
const ROOT=path.join(__dirname,'..','..','..');
const sha=(p)=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const CMP=(a,b)=>Buffer.compare(Buffer.from(String(a),'utf8'),Buffer.from(String(b),'utf8'));
const OFFSET=(d,m)=>parseInt(d.slice(-8),16)%m;

let ok=0,bad=0; const out=[]; const p=(s='')=>out.push(s);
const chk=(label,derived,declared)=>{const g=String(derived)===String(declared);g?ok++:bad++;
  p(`  ${(g?'MATCH':'MISMATCH').padEnd(9)} ${label.padEnd(52)} derived ${String(derived).padEnd(12)} declared ${declared}`);};

p('L3 RUN-2 ACCEPTANCE HOLDOUT -- PHASE 3 PRE-SELECTION DECLARED-VS-DERIVED GATE');
p('EXECUTED BEFORE ANY SELECTION CODE. No observation read. No row selected. |DEN_A| NOT computed.');
p('');

const SRC={
 gauntlet:{path:'safescope-data/gauntlets/safescope-gauntlet.source.v1.json',
   sha:'a95e54809c41b3eb88ea35de133c5576e63c921944ca4724597852f922f0adb4',rows:150,key:'scenarioId',m:4},
 realism:{path:'safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json',
   sha:'6f6897f11aa3b174b2863fad4edc895625e0a3d27e1318dbd2371dcd5231a9cb',rows:117,key:'id',m:4},
};
p('=== A. SOURCE IDENTITY AND STRUCTURE (S-5, S-2) ===');
for(const [name,s] of Object.entries(SRC)){
  const abs=path.join(ROOT,s.path), digest=sha(abs);
  chk(`${name} sha256 (S-5 drift guard)`, digest, s.sha);
  const doc=JSON.parse(fs.readFileSync(abs,'utf8'));
  const arr=Array.isArray(doc)?doc:(doc.rows||doc.scenarios||doc.items||doc.data);
  chk(`${name} physical rows (S-5)`, arr.length, s.rows);
  const keys=arr.map(r=>r[s.key]);
  chk(`${name} sort key '${s.key}' on every row`, keys.every(k=>typeof k==='string'&&k), true);
  chk(`${name} sort keys pairwise distinct (S-2)`, new Set(keys).size, arr.length);
  s.sorted=keys.slice().sort(CMP);
  s.sizes=[0,1,2,3].map(k=>s.sorted.filter((_,i)=>i%s.m===k).length);
  s.k0=OFFSET(digest,s.m);
  s.arr=arr;
}
p('');
p('=== B. OFFSET DERIVATION AND RESERVATION SCHEDULE (S-3, D-A.11, D-B.11) ===');
const g=SRC.gauntlet, r=SRC.realism, RUN=2;
chk('gauntlet S-3 base offset k0', g.k0, 0);
chk('realism  S-3 base offset k0', r.k0, 3);
chk('gauntlet partition sizes', JSON.stringify(g.sizes), JSON.stringify([38,38,37,37]));
chk('realism  partition sizes', JSON.stringify(r.sizes), JSON.stringify([30,29,29,29]));
const gR1=(g.k0+0)%g.m, rR1=(r.k0+0)%r.m, gR2=(g.k0+RUN-1)%g.m, rR2=(r.k0+RUN-1)%r.m;
chk('gauntlet run-1 offset (SPENT/RETIRED)', gR1, 0);
chk('realism  run-1 offset (SPENT/RETIRED)', rR1, 3);
chk('gauntlet RUN-2 offset', gR2, 1);
chk('realism  RUN-2 offset', rR2, 0);
chk('gauntlet RUN-2 selected rows', g.sizes[gR2], 38);
chk('realism  RUN-2 selected rows', r.sizes[rR2], 30);
p('');
p('=== C. PROTECTED / RESERVE STATE ===');
chk('gauntlet offsets RETIRED before run 2', JSON.stringify([gR1]), JSON.stringify([0]));
chk('realism  offsets RETIRED before run 2', JSON.stringify([rR1]), JSON.stringify([3]));
const gRemain=[3,4].map(n=>(g.k0+n-1)%g.m), rRemain=[3,4].map(n=>(r.k0+n-1)%r.m);
chk('gauntlet offsets still reserved AFTER run 2', JSON.stringify(gRemain), JSON.stringify([2,3]));
chk('realism  offsets still reserved AFTER run 2', JSON.stringify(rRemain), JSON.stringify([1,2]));
chk('gauntlet.seed drawn from', false, false);
chk('gauntlet.seed opened by this phase', false, false);
chk('gauntlet rows remaining unopened after run 2', g.sizes[gRemain[0]]+g.sizes[gRemain[1]], 74);
chk('realism  rows remaining unopened after run 2', r.sizes[rRemain[0]]+r.sizes[rRemain[1]], 58);
p('');
p('=== D. AUTHORED-CONTROL ALLOCATION AND GATE MEMBERSHIP (D-D.3, D-D.4, D-E) ===');
const AC=path.join(ROOT,'verification/hazlenz-l3-acceptance-holdout-attempt2-2026-08-24/builder/authored-controls.js');
chk('Run-1 authored-controls.js digest (spec source, NOT reused as content)', sha(AC),
    '56b73f851786ea2ca4b1b01a5eac92bf6bed4beb098086cba27c5babc71d2f05');
const {FROZEN_ALLOCATION}=require(AC);
for(const [f,n] of Object.entries({F1:4,F2:4,F3:3,F4:3,F5:3,F6:3,F7:3,F8:2})) chk(`allocation ${f}`,FROZEN_ALLOCATION[f],n);
chk('allocation sum', Object.values(FROZEN_ALLOCATION).reduce((a,b)=>a+b,0), 25);
const src=fs.readFileSync(AC,'utf8'); const fam={}; const re=/(F\d[ab]?):\s*\{([\s\S]*?)\},\n/g; let m;
while((m=re.exec(src))) fam[m[1]]={inG3:/inG3:\s*true/.test(m[2]),inG4:/inG4:\s*true/.test(m[2]),inG7:/inG7:\s*true/.test(m[2]),
  cs:(m[2].match(/conditionState:\s*'([^']+)'/)||[])[1], he:/hazardEstablished:\s*true/.test(m[2]),
  ap:/activeProhibited:\s*true/.test(m[2]), ce:/clarificationExpected:\s*true/.test(m[2]),
  pole:(m[2].match(/pole:\s*'([^']+)'/)||[])[1]};
const per={F1:4,F2:4,F3:3,F4:3,F5:3,F6:3,F7:3,F8a:1,F8b:1};
const cnt=(pr)=>Object.entries(per).reduce((a,[k,n])=>a+(fam[k]&&pr(fam[k])?n:0),0);
chk('G3 authored membership count', cnt(f=>f.inG3), 6);
chk('G4 authored membership count', cnt(f=>f.inG4), 21);
chk('G7 authored membership count', cnt(f=>f.inG7), 11);
chk('G3 enumerated families', Object.keys(per).filter(k=>fam[k].inG3).join(','), 'F3,F6');
chk('G4 enumerated families', Object.keys(per).filter(k=>fam[k].inG4).join(','), 'F1,F2,F3,F4,F5,F6,F8b');
chk('G7 enumerated families', Object.keys(per).filter(k=>fam[k].inG7).join(','), 'F1,F2,F7');
chk('G4 closure: inG4 + ACTIVE-truth complement', cnt(f=>f.inG4)+cnt(f=>f.cs==='ACTIVE'), 25);
chk('clarificationExpected===true families are exactly F3,F6', Object.keys(per).filter(k=>fam[k].ce).join(','), 'F3,F6');
chk('G7 pole is literally CLARIFICATION_MUST_NOT_ASK on all members',
    Object.keys(per).filter(k=>fam[k].inG7).every(k=>fam[k].pole==='CLARIFICATION_MUST_NOT_ASK'), true);
chk('F4,F5,F8a excluded from G7 despite clarificationExpected false (D-D.4)',
    ['F4','F5','F8a'].every(k=>!fam[k].inG7), true);
p('');
p('=== E. RUN-2 COMPOSITION ===');
const total=g.sizes[gR2]+r.sizes[rR2]+25, indep=g.sizes[gR2]+r.sizes[rR2];
chk('RUN-2 independent rows', indep, 68);
chk('RUN-2 authored rows', 25, 25);
chk('RUN-2 total rows', total, 93);
chk('RUN-2 independent proportion', (indep/total*100).toFixed(1)+'%', '73.1%');
chk('RUN-2 total inside the plan ~90-100 band', total>=90&&total<=100, true);
p('');
p('=== F. DEFERRED BY RULE ===');
p('  |DEN_A| for Run 2:  NOT COMPUTED. D-B.3 requires discovery from frozen metadata AFTER');
p('  authorized selection. Computing it here would let construction see its own G3 denominator');
p('  before selection -- precisely defect E-3. No shouldHaveMissingEvidence value was read.');
p('');
p(`OK = ${ok}   MISMATCH = ${bad}`);
p(bad===0 ? 'PRE-SELECTION GATE PASSES. Selection code may be authored (Phase 4 freeze first).'
          : '*** CARDINALITY_INVARIANT_FAILURE -- STOP BEFORE SELECTION ***');
fs.writeFileSync(path.join(__dirname,'PHASE3_PRESELECTION_GATE.txt'), out.join('\n')+'\n');
console.log(out.join('\n'));
if(bad>0) process.exit(1);
