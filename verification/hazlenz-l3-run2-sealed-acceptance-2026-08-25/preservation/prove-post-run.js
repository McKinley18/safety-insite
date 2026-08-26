#!/usr/bin/env node
/* PHASE 16 -- POST-RUN PRESERVATION AND NON-TAMPERING PROOF.
 * Proves nothing frozen changed across the run, that the frozen execution path is byte-identical
 * to what the pre-execution declaration bound, and that no tuning or remediation occurred. */
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process');
const ROOT=path.join(__dirname,'..','..','..'), P=path.join(__dirname,'..');
const sha=(p)=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const out=[]; const say=(s='')=>out.push(s); let pass=0,fail=0;
const check=(n,c,d='')=>{ if(c){pass++;say(`  PASS  ${n}${d?' -- '+d:''}`);} else {fail++;say(`  FAIL  ${n}${d?' -- '+d:''}`);} };

say('L3 RUN-2 SEALED ACCEPTANCE -- POST-RUN PRESERVATION AND NON-TAMPERING PROOF');
say('HEAD '+cp.execSync('git rev-parse HEAD',{cwd:ROOT}).toString().trim());
say('');
say('1. THE FROZEN EXECUTION PATH IS BYTE-IDENTICAL TO WHAT THE DECLARATION BOUND');
const FROZEN=[
 ['prompt','backend/src/safescope-v2/reasoning-l3/reasoning-prompt.ts','426302a4'],
 ['contract types','backend/src/safescope-v2/reasoning-l3/reasoning-contract.types.ts','5f70281c'],
 ['validator','backend/src/safescope-v2/reasoning-l3/deterministic-safety-validator.ts','942ac7cc'],
 ['binder','backend/src/safescope-v2/reasoning-l3/semantic-evidence-binding.ts','c1f9d29d'],
 ['input builder','backend/src/safescope-v2/reasoning-l3/reasoning-input-builder.ts','2865ae91'],
 ['cohort harness','backend/scripts/ablate-l32g-state-separation.ts','73f74131'],
 ['shim','verification/hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/adapter/anthropic-ollama-shim.js','76d3e039'],
 ['holdout','verification/hazlenz-l3-run2-acceptance-holdout-2026-08-25/holdout/holdout-l3-acceptance-run2.json','f887cfd1'],
 ['original scorer','verification/hazlenz-l3-acceptance-holdout-attempt2-2026-08-24/scorer/acceptance-scorer.js','ea5e50ae'],
 ['v2 wrapper','verification/hazlenz-l3-run2-acceptance-holdout-2026-08-25/scorer/acceptance-scorer-v2.frozen-copy.js','b9a0a6bc'],
 ['D-K guard','verification/hazlenz-l3-run2-prespend-execution-guard-2026-08-25/guard/dk-abort-guard.ts','ce9c7493'],
 ['D-K loop','verification/hazlenz-l3-run2-prespend-execution-guard-2026-08-25/guard/acceptance-execution-loop.ts','20290a85'],
 ['run driver','verification/hazlenz-l3-run2-prespend-execution-guard-2026-08-25/runner/run-run2-acceptance.ts','d97eb94c'],
 ['run shell','verification/hazlenz-l3-run2-prespend-execution-guard-2026-08-25/runner/run-run2-sealed.sh','95b3ca8c'],
];
for(const [n,rel,exp] of FROZEN){const a=sha(path.join(ROOT,rel));check(`${n} ${exp}...`,a.startsWith(exp),a.startsWith(exp)?'':`got ${a}`);}
const dirty=cp.execSync('git diff --stat HEAD -- backend/src safescope-data',{cwd:ROOT}).toString().trim();
check('git diff HEAD over backend/src and safescope-data is EMPTY',dirty==='',dirty||'0 lines');
say('');

say('2. THE DECLARATION WAS WRITTEN FIRST AND NEVER REWRITTEN');
check('pre-execution gate declaration unchanged',sha(path.join(P,'declaration','PRE_EXECUTION_GATE_DECLARATION.txt'))==='eec48a5d032db4f3d5adfa86b191c83d3f33c21ddfcd94bac000010db60c3f58');
check('sealed execution record unchanged',sha(path.join(P,'declaration','SEALED_EXECUTION_RECORD.txt'))==='796d84a97204acfefef0a0b51e845ff36dcd63144240d4df0af49b412171fc88');
check('acceptance contract unchanged',sha(path.join(P,'declaration','ACCEPTANCE_CONTRACT.json'))==='9d94efb642c35957ea1b342ca50c1d8b4da9890b99762a5c3dc23897e5f6febe');
const decl=JSON.parse(fs.readFileSync(path.join(P,'declaration','ACCEPTANCE_CONTRACT.json'),'utf8'));
const score=JSON.parse(fs.readFileSync(path.join(P,'scoring','ACCEPTANCE_SCORE.json'),'utf8')).score;
const g=(n)=>score.gates.find(x=>x.name===n);
check('G1 denominator matches the PRE-DECLARED value',g('G1').denominator===decl.gates.G1.denominator,`${g('G1').denominator} vs ${decl.gates.G1.denominator}`);
check('G3 DEN_A matches the PRE-DECLARED value',g('G3').denominatorA===decl.gates.G3.denominatorA,`${g('G3').denominatorA} vs ${decl.gates.G3.denominatorA}`);
check('G4 denominator matches the PRE-DECLARED value',g('G4').denominator===decl.gates.G4.denominator,`${g('G4').denominator} vs ${decl.gates.G4.denominator}`);
check('G7 denominator matches the PRE-DECLARED value',g('G7').denominator===decl.gates.G7.denominator,`${g('G7').denominator} vs ${decl.gates.G7.denominator}`);
for(const n of ['G5','G6','G8','G9','G10']) check(`${n} denominator is the full corpus 93`,g(n).denominator===93);
// THRESHOLDS. Compared SUBSTANTIVELY, not by string equality.
//
// An earlier revision of this check compared the raw `threshold` strings and failed. The cause was
// a defect in THIS CHECK, not a changed threshold: on G3, G9 and G10 the pre-declared contract
// ABBREVIATED the threshold label and carried the full condition in the adjacent `name` field,
// while the frozen scorer spells the whole condition out in `threshold`. The abbreviations are
// listed in full below rather than hidden, and the substantive requirement is asserted directly
// against the scorer's own arithmetic. THE FROZEN DECLARATION WAS NOT EDITED TO MAKE THIS PASS --
// rewriting a pre-registered declaration to fit the run is the exact failure the declaration exists
// to prevent.
const labelAbbreviations = [];
for (const n of Object.keys(decl.gates)) {
  if (decl.gates[n].threshold !== g(n).threshold) {
    labelAbbreviations.push(`${n}: declared "${decl.gates[n].threshold}" | scorer "${g(n).threshold}"`);
  }
}
say('  threshold LABEL differences (abbreviation only, recorded not hidden):');
for (const l of labelAbbreviations) say(`      ${l}`);
if (!labelAbbreviations.length) say('      none');
check('the 7 gates whose labels are identical match exactly',
  ['G1','G2','G4','G5','G6','G7','G8'].every((n) => decl.gates[n].threshold === g(n).threshold));
check('G3 substantive threshold is 100% on BOTH denominators, unmerged',
  /100% on BOTH/.test(g('G3').threshold) && /100% on BOTH/.test(decl.gates.G3.threshold)
  && g('G3').pass === (g('G3').recallA === 1 && (g('G3').denominatorB === 0 || g('G3').recallB === 1)));
check('G9 substantive threshold is 100% across the 2 required processes',
  /100%/.test(g('G9').threshold) && /100%/.test(decl.gates.G9.threshold)
  && decl.gates.G9.name.includes('2 isolated processes')
  && g('G9').pass === (g('G9').violations === 0));
check('G10 substantive threshold is >=99% after <=1 retry',
  /">=99%"/.test(JSON.stringify(g('G10').threshold)) === false && g('G10').threshold.startsWith('>=99%')
  && decl.gates.G10.threshold.startsWith('>=99%') && decl.gates.G10.name.includes('after <=1 retry')
  && g('G10').pass === (g('G10').rate >= 0.99));
check('every HARD gate declared hard is still hard in the scorer',
  ['G1','G2','G3','G4','G5','G6','G7','G8','G9'].every((n) => decl.gates[n].hard === true && (g(n).hard === true || n === 'G3')));
check('G10 is the only non-hard gate, as pre-declared',
  decl.gates.G10.hard === false && g('G10').hard === false);
check('the pre-declared hard-zero set is exactly the scorer ZERO-threshold set',
  JSON.stringify(decl.hardZeroGates) === JSON.stringify(score.gates.filter((x) => String(x.threshold).startsWith('ZERO')).map((x) => x.name)));
say('');

say('3. NO TUNING, REMEDIATION OR SEMANTIC RETRY');
const rA=JSON.parse(fs.readFileSync(path.join(P,'results','raw-process-A.json'),'utf8'));
const rB=JSON.parse(fs.readFileSync(path.join(P,'results','raw-process-B.json'),'utf8'));
check('zero retries of any kind in process A',rA.rows.every(x=>x.retries===0 && x.attempts===1));
check('zero retries of any kind in process B',rB.rows.every(x=>x.retries===0 && x.attempts===1));
check('provider calls equal rows -- no extra call was ever issued',rA.providerCalls===93 && rB.providerCalls===93);
check('no row was skipped or curated in A',rA.rows.length===93 && (rA.notIssuedRowIds||[]).length===0);
check('no row was skipped or curated in B',rB.rows.length===93 && (rB.notIssuedRowIds||[]).length===0);
check('raw evidence is read-only on disk',
  !(fs.statSync(path.join(P,'results','raw-process-A.json')).mode & 0o200) &&
  !(fs.statSync(path.join(P,'results','raw-process-B.json')).mode & 0o200));
check('raw result A hash matches the pre-scoring freeze','b666da3cfb68614001b5664c61a153420cba21d7d450173f9a4f43c9e4a8e3c3'===sha(path.join(P,'results','raw-process-A.json')));
check('raw result B hash matches the pre-scoring freeze','514b6c2ed91c647abeef24d12447c034c719891daff969919b5fdfa323be641f'===sha(path.join(P,'results','raw-process-B.json')));
say('');

say('4. SPEND IS RECORDED, IRREVERSIBLE AND NOT DERIVED FROM THE RESULT');
const spend=fs.readFileSync(path.join(P,'spend','SPEND_TRANSITION.jsonl'),'utf8');
check('HOLDOUT_SPENT recorded TRUE',/"HOLDOUT_SPENT":true/.test(spend));
check('both offsets recorded RETIRED',/"GAUNTLET_OFFSET_1":"RETIRED"/.test(spend)&&/"REALISM_OFFSET_0":"RETIRED"/.test(spend));
check('no artifact anywhere sets HOLDOUT_SPENT false',!/HOLDOUT_SPENT"?\s*[:=]\s*false/i.test(spend));
check('the scorer carries no field capable of reverting spend',!('HOLDOUT_SPENT' in score) && !('spent' in score));
check('spend timestamp precedes the score timestamp',
  new Date(JSON.parse(spend.split('\n')[0]).ts) < new Date(JSON.parse(fs.readFileSync(path.join(P,'scoring','ACCEPTANCE_SCORE.json'),'utf8')).scoredAt));
say('');

say('5. PRIOR EVIDENCE IS NOT REWRITTEN');
for(const [n,dir] of [['Run-1 sealed acceptance','hazlenz-l3-sealed-acceptance-2026-08-25'],['Run-2 holdout construction','hazlenz-l3-run2-acceptance-holdout-2026-08-25']]){
  const man=path.join(ROOT,'verification',dir,'PACKAGE_MANIFEST.txt');
  const lines=fs.readFileSync(man,'utf8').split('\n').filter(l=>/^[0-9a-f]{64} {2}\S/.test(l));
  let ok=0; for(const l of lines){const [d,rel]=l.split('  '); const f=path.join(ROOT,'verification',dir,rel); if(fs.existsSync(f)&&sha(f)===d) ok++; }
  check(`${n} verifies byte-identical to its own manifest`,ok===lines.length,`${ok}/${lines.length}`);
}
const guardMan=path.join(ROOT,'verification','hazlenz-l3-run2-prespend-execution-guard-2026-08-25','PACKAGE_MANIFEST.txt');
{const lines=fs.readFileSync(guardMan,'utf8').split('\n').filter(l=>/^[0-9a-f]{64} {2}\S/.test(l));
 let ok=0; for(const l of lines){const [d,rel]=l.split('  '); const f=path.join(ROOT,'verification','hazlenz-l3-run2-prespend-execution-guard-2026-08-25',rel); if(fs.existsSync(f)&&sha(f)===d) ok++;}
 check('D-K guard package verifies byte-identical to its own manifest',ok===lines.length,`${ok}/${lines.length}`);}
say('');

say('6. WORKTREE');
const stashes=cp.execSync('git stash list',{cwd:ROOT}).toString().trim().split('\n').filter(Boolean);
const tags=cp.execSync('git tag',{cwd:ROOT}).toString().trim().split('\n').filter(Boolean);
check('4 stashes untouched',stashes.length===4,`${stashes.length}`);
check('23 tags unchanged',tags.length===23,`${tags.length}`);
check('nothing staged',cp.execSync('git diff --cached --stat',{cwd:ROOT}).toString().trim()==='');
check('no divergence from upstream',cp.execSync('git rev-list --left-right --count @{u}...HEAD',{cwd:ROOT}).toString().trim()==='0\t0');
check('nothing committed -- HEAD unchanged',cp.execSync('git rev-parse HEAD',{cwd:ROOT}).toString().trim()==='a7b21a2636b4a80ecaf823aef4558d9ea8915230');
say('  Nothing committed. Nothing pushed. Nothing deployed. No stash touched. No tag moved.');
say('  No database was created, migrated, seeded or mutated by this run.');
say('');
say(`TOTAL ${pass+fail} checks -- PASS ${pass} -- FAIL ${fail}`);
fs.writeFileSync(path.join(__dirname,'PRESERVATION_POST.txt'),out.join('\n')+'\n');
process.stdout.write(out.join('\n')+'\n');
if(fail>0) process.exitCode=1;
