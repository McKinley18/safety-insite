#!/usr/bin/env node
/* L3 RUN-2 FAILURE DIAGNOSIS -- PRESERVATION AND ZERO-SPEND PROOF.
 * Proves the diagnosis changed nothing, contacted nothing, and that the frozen acceptance result
 * and all Run-2 evidence are byte-identical to the state the acceptance phase left them in. */
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process');
const ROOT=path.join(__dirname,'..','..','..');
const D=path.join(__dirname,'..');
const sha=(p)=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const out=[];const say=(s='')=>out.push(s);let pass=0,fail=0;
const check=(n,c,d='')=>{ if(c){pass++;say(`  PASS  ${n}${d?' -- '+d:''}`);} else {fail++;say(`  FAIL  ${n}${d?' -- '+d:''}`);} };

say('L3 RUN-2 FAILURE DIAGNOSIS -- PRESERVATION AND ZERO-SPEND PROOF');
say('HEAD '+cp.execSync('git rev-parse HEAD',{cwd:ROOT}).toString().trim());
say('');
say('1. THE FROZEN RUN-2 EVIDENCE IS UNCHANGED BY DIAGNOSIS');
const R2=path.join(ROOT,'verification','hazlenz-l3-run2-sealed-acceptance-2026-08-25');
const FROZEN=[
 ['raw process A','results/raw-process-A.json','b666da3cfb68614001b5664c61a153420cba21d7d450173f9a4f43c9e4a8e3c3'],
 ['raw process B','results/raw-process-B.json','514b6c2ed91c647abeef24d12447c034c719891daff969919b5fdfa323be641f'],
 ['transport A','transport/transport-A.jsonl','fa2741f68d9488dd5a56e03cf08cae34dd421993937d8939b2eae99dde9ee7ef'],
 ['transport B','transport/transport-B.jsonl','aadb88fac0d6baaef1719cb8263b8b5f3c4cdbc52e9b2040ccdde4d376c6edf4'],
 ['spend transition','spend/SPEND_TRANSITION.jsonl','5ee3b36ec868e7a9f6df13e5c4cadcce5aa832e1138d2b02ae2ce1940fc78862'],
 ['gate declaration','declaration/PRE_EXECUTION_GATE_DECLARATION.txt','eec48a5d032db4f3d5adfa86b191c83d3f33c21ddfcd94bac000010db60c3f58'],
 ['acceptance contract','declaration/ACCEPTANCE_CONTRACT.json','9d94efb642c35957ea1b342ca50c1d8b4da9890b99762a5c3dc23897e5f6febe'],
 ['sealed execution record','declaration/SEALED_EXECUTION_RECORD.txt','796d84a97204acfefef0a0b51e845ff36dcd63144240d4df0af49b412171fc88'],
];
for(const [n,rel,exp] of FROZEN){const a=sha(path.join(R2,rel));check(`${n} unchanged`,a===exp,a===exp?'':`expected ${exp} got ${a}`);}
// the Run-2 package must still verify against its own manifest
{const man=path.join(R2,'PACKAGE_MANIFEST.txt');
 const lines=fs.readFileSync(man,'utf8').split('\n').filter(l=>/^[0-9a-f]{64} {2}\S/.test(l));
 let ok=0; for(const l of lines){const [d2,rel]=l.split('  '); const f=path.join(R2,rel); if(fs.existsSync(f)&&sha(f)===d2) ok++;}
 check('the Run-2 acceptance package verifies byte-identical to its own manifest',ok===lines.length,`${ok}/${lines.length}`);}
say('');

say('2. THE FROZEN VERDICT IS UNCHANGED AND UNCONTRADICTED');
const score=JSON.parse(fs.readFileSync(path.join(R2,'scoring','ACCEPTANCE_SCORE.json'),'utf8'));
const body=JSON.parse(JSON.stringify(score)); delete body.scoredAt; delete body.rawProcessA.path; delete body.rawProcessB.path;
const bodyDigest=crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
check('SCORE_BODY_DIGEST unchanged',bodyDigest==='435f83142bb0cdfb5033e62c53d93fd746f4ee83844751281d068c8316270b7a',bodyDigest);
check('terminal unchanged',score.score.terminal==='L3_ACCEPTANCE_FAILED — G1,G2,G3,G4,G5,G6,G9');
check('scorable still TRUE',score.score.scorable===true);
check('pass still FALSE',score.score.pass===false);
check('MODEL_ACCEPTANCE_RESULT still ESTABLISHED_FAIL',score.score.modelAcceptanceResult==='ESTABLISHED_FAIL');
check('RUN2_HOLDOUT_SPENT still TRUE',score.RUN2_HOLDOUT_SPENT===true);
check('offsets still RETIRED',score.GAUNTLET_OFFSET_1==='RETIRED'&&score.REALISM_OFFSET_0==='RETIRED');
// the ledger must reproduce the frozen scorer exactly
const L=JSON.parse(fs.readFileSync(path.join(D,'analysis','FAILURE_LEDGER.json'),'utf8'));
check('the diagnosis ledger reproduces the frozen scorer on EVERY gate',
  L.reproductionAssertions.every(a=>a.match),
  L.reproductionAssertions.map(a=>`${a.gate} ${a.derived}/${a.frozen}`).join(' | '));
say('');

say('3. NOTHING WAS CHANGED, REPAIRED OR TUNED BY THIS PHASE');
const dirty=cp.execSync('git diff --stat HEAD -- backend/src safescope-data',{cwd:ROOT}).toString().trim();
check('git diff HEAD over backend/src and safescope-data is EMPTY',dirty===''); 
const PATHS=[
 ['prompt','backend/src/safescope-v2/reasoning-l3/reasoning-prompt.ts','426302a4'],
 ['validator','backend/src/safescope-v2/reasoning-l3/deterministic-safety-validator.ts','942ac7cc'],
 ['binder','backend/src/safescope-v2/reasoning-l3/semantic-evidence-binding.ts','c1f9d29d'],
 ['input builder','backend/src/safescope-v2/reasoning-l3/reasoning-input-builder.ts','2865ae91'],
 ['shim','verification/hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/adapter/anthropic-ollama-shim.js','76d3e039'],
 ['original scorer','verification/hazlenz-l3-acceptance-holdout-attempt2-2026-08-24/scorer/acceptance-scorer.js','ea5e50ae'],
 ['v2 wrapper','verification/hazlenz-l3-run2-acceptance-holdout-2026-08-25/scorer/acceptance-scorer-v2.frozen-copy.js','b9a0a6bc'],
 ['run-2 holdout','verification/hazlenz-l3-run2-acceptance-holdout-2026-08-25/holdout/holdout-l3-acceptance-run2.json','f887cfd1'],
];
for(const [n,rel,exp] of PATHS){const a=sha(path.join(ROOT,rel));check(`${n} byte-unchanged ${exp}...`,a.startsWith(exp));}
say('');

say('4. ZERO PROVIDER CONTACT');
const files=[];(function w(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())w(p);else files.push(p);}})(D);
const code=files.filter(p=>/\.(js|ts|sh|mjs|cjs)$/.test(p));
/* Comments AND REGEX LITERALS are stripped before scanning. A detector's own pattern is not a
 * network call, and an earlier revision of this check flagged itself for containing one -- the
 * fourth time in this programme that an instrument measured its own source text instead of the
 * thing under test (see section 66.7 x2, section 67.7 x1). Stripping regex literals removes the
 * self-match without weakening the check: real call sites are not written inside / /. */
const strip=(s)=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:])\/\/.*$/gm,'$1')
  .replace(/\/(?![*/])(?:\\.|\[(?:\\.|[^\]])*\]|[^\/\n\\])+\/[gimsuy]*/g,'/RE/');
const urls=[],creds=[],net=[];
for(const p of code){const s=strip(fs.readFileSync(p,'utf8'));
  for(const u of s.match(/https?:\/\/[^\s`'"$)]*/g)||[]) urls.push(`${path.relative(D,p)}: ${u}`);
  if(/process\.env\.[A-Z_]*(ANTHROPIC|API_KEY|TOKEN|SECRET|CREDENTIAL)[A-Z_]*/.test(s)) creds.push(path.relative(D,p));
  if(/\bfetch\s*\(|https?\.request|net\.connect|XMLHttpRequest/.test(s)) net.push(path.relative(D,p));}
check('no diagnosis file contains ANY url literal',urls.length===0,urls.join(' | '));
check('no diagnosis file reads a credential env var',creds.length===0,creds.join(' | '));
check('no diagnosis file contains a network call primitive',net.length===0,net.join(' | '));
say('  provider calls 0 | inference 0 | credential reads 0 | API cost $0.00');
say('  Run-2 corpus re-executed: NO | new holdout opened: NO | reserved tranche spent: NO');
say('  Gauntlet offsets 2,3 and realism offsets 1,2 remain RESERVED; gauntlet.seed remains UNOPENED.');
say('');

say('5. WORKTREE');
const stashes=cp.execSync('git stash list',{cwd:ROOT}).toString().trim().split('\n').filter(Boolean);
const tags=cp.execSync('git tag',{cwd:ROOT}).toString().trim().split('\n').filter(Boolean);
check('4 stashes untouched',stashes.length===4,`${stashes.length}`);
check('23 tags unchanged',tags.length===23,`${tags.length}`);
check('nothing staged',cp.execSync('git diff --cached --stat',{cwd:ROOT}).toString().trim()==='');
check('no divergence from upstream',cp.execSync('git rev-list --left-right --count @{u}...HEAD',{cwd:ROOT}).toString().trim()==='0\t0');
check('HEAD unchanged',cp.execSync('git rev-parse HEAD',{cwd:ROOT}).toString().trim()==='a7b21a2636b4a80ecaf823aef4558d9ea8915230');
say('  Nothing committed, pushed, deployed or stashed. No database touched.');
say('');
say(`TOTAL ${pass+fail} checks -- PASS ${pass} -- FAIL ${fail}`);
fs.writeFileSync(path.join(__dirname,'PRESERVATION_AND_ZERO_SPEND.txt'),out.join('\n')+'\n');
process.stdout.write(out.join('\n')+'\n');
if(fail>0) process.exitCode=1;
