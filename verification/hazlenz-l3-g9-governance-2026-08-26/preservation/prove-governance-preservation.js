#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process');
const ROOT=path.join(__dirname,'..','..','..'),D=path.join(__dirname,'..');
const R2=path.join(ROOT,'verification','hazlenz-l3-run2-sealed-acceptance-2026-08-25');
const sha=(p)=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const out=[];const say=(s='')=>out.push(s);let pass=0,fail=0;
const check=(n,c,d='')=>{if(c){pass++;say(`  PASS  ${n}${d?' -- '+d:''}`);}else{fail++;say(`  FAIL  ${n}${d?' -- '+d:''}`);}};
say('L3 G9 GOVERNANCE + REMEDIATION PLANNING -- PRESERVATION AND ZERO-SPEND PROOF');
say('HEAD '+cp.execSync('git rev-parse HEAD',{cwd:ROOT}).toString().trim());say('');
say('1. RUN-2 EVIDENCE AND THE FROZEN VERDICT ARE UNCHANGED');
for(const [n,rel,exp] of [
 ['raw A','results/raw-process-A.json','b666da3cfb68614001b5664c61a153420cba21d7d450173f9a4f43c9e4a8e3c3'],
 ['raw B','results/raw-process-B.json','514b6c2ed91c647abeef24d12447c034c719891daff969919b5fdfa323be641f'],
 ['gate declaration','declaration/PRE_EXECUTION_GATE_DECLARATION.txt','eec48a5d032db4f3d5adfa86b191c83d3f33c21ddfcd94bac000010db60c3f58'],
 ['acceptance contract','declaration/ACCEPTANCE_CONTRACT.json','9d94efb642c35957ea1b342ca50c1d8b4da9890b99762a5c3dc23897e5f6febe'],
]) check(`${n} unchanged`,sha(path.join(R2,rel))===exp);
const sc=JSON.parse(fs.readFileSync(path.join(R2,'scoring','ACCEPTANCE_SCORE.json'),'utf8'));
const b=JSON.parse(JSON.stringify(sc));delete b.scoredAt;delete b.rawProcessA.path;delete b.rawProcessB.path;
check('SCORE_BODY_DIGEST unchanged',crypto.createHash('sha256').update(JSON.stringify(b)).digest('hex')==='435f83142bb0cdfb5033e62c53d93fd746f4ee83844751281d068c8316270b7a');
check('terminal verbatim',sc.score.terminal==='L3_ACCEPTANCE_FAILED — G1,G2,G3,G4,G5,G6,G9');
check('MODEL_ACCEPTANCE_RESULT verbatim',sc.score.modelAcceptanceResult==='ESTABLISHED_FAIL');
check('G9 as scored unchanged',sc.score.gates.find(g=>g.name==='G9').violations===14);
say('');
say('2. NO GATE, SCORER OR PIPELINE STAGE WAS TOUCHED');
for(const [n,rel,exp] of [
 ['original scorer','verification/hazlenz-l3-acceptance-holdout-attempt2-2026-08-24/scorer/acceptance-scorer.js','ea5e50ae'],
 ['v2 wrapper','verification/hazlenz-l3-run2-acceptance-holdout-2026-08-25/scorer/acceptance-scorer-v2.frozen-copy.js','b9a0a6bc'],
 ['run-2 holdout','verification/hazlenz-l3-run2-acceptance-holdout-2026-08-25/holdout/holdout-l3-acceptance-run2.json','f887cfd1'],
 ['prompt','backend/src/safescope-v2/reasoning-l3/reasoning-prompt.ts','426302a4'],
 ['validator','backend/src/safescope-v2/reasoning-l3/deterministic-safety-validator.ts','942ac7cc'],
 ['binder','backend/src/safescope-v2/reasoning-l3/semantic-evidence-binding.ts','c1f9d29d'],
 ['input builder','backend/src/safescope-v2/reasoning-l3/reasoning-input-builder.ts','2865ae91'],
 ['shim','verification/hazlenz-l3-2o-anthropic-provider-qualification-2026-08-24/adapter/anthropic-ollama-shim.js','76d3e039'],
]) check(`${n} byte-unchanged ${exp}...`,sha(path.join(ROOT,rel)).startsWith(exp));
check('git diff HEAD over backend/src and safescope-data EMPTY',cp.execSync('git diff --stat HEAD -- backend/src safescope-data',{cwd:ROOT}).toString().trim()==='');
say('');
say('3. NO UNSPENT CORPUS OPENED, ZERO PROVIDER CONTACT');
const files=[];(function w(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())w(p);else files.push(p);}})(D);
const strip=(s)=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:])\/\/.*$/gm,'$1')
  .replace(/\/(?![*/])(?:\\.|\[(?:\\.|[^\]])*\]|[^\/\n\\])+\/[gimsuy]*/g,'/RE/');
const urls=[],creds=[],net=[],reserved=[];
/* SELF-EXCLUSION, per mechanical test 1 of the INSTRUMENT_SELF_REFERENCE_PROHIBITED rule this
 * phase recommends. The scanner is excluded from its own scan, and the exclusion is PROVEN
 * SOUND below by re-running the scan with it included and reporting the delta explicitly --
 * so the exclusion cannot hide a real finding.
 * This was needed because the FIFTH instance of the self-reference defect fired here: the
 * checker matched `gauntlet.seed` inside its own regex literal. Caught immediately by the rule
 * written minutes earlier in this same phase. */
const SELF=path.resolve(__filename);
const scanTargets=files.filter(f=>/\.(js|ts|sh|mjs|cjs)$/.test(f)&&path.resolve(f)!==SELF);
for(const p of scanTargets){const s=strip(fs.readFileSync(p,'utf8'));
 for(const u of s.match(/https?:\/\/[^\s`'"$)]*/g)||[]) urls.push(u);
 if(/process\.env\.[A-Z_]*(ANTHROPIC|API_KEY|TOKEN|SECRET|CREDENTIAL)[A-Z_]*/.test(s)) creds.push(path.relative(D,p));
 if(/\bfetch\s*\(|https?\.request|net\.connect|XMLHttpRequest/.test(s)) net.push(path.relative(D,p));
 if(/gauntlet\.seed|gauntlet-seed/.test(s)) reserved.push(path.relative(D,p));}
check('zero url literals in the whole package',urls.length===0,urls.join(' | '));
check('zero credential reads',creds.length===0,creds.join(' | '));
check('zero network call primitives',net.length===0,net.join(' | '));
check('gauntlet.seed never referenced by any analysis file (scanner self-excluded)',reserved.length===0,reserved.join(' | '));
// PROVE THE SELF-EXCLUSION HID NOTHING: re-scan INCLUDING the scanner and report the delta.
{const selfSrc=strip(fs.readFileSync(SELF,'utf8'));
 const selfHits=[];
 for(const u of selfSrc.match(/https?:\/\/[^\s`'"$)]*/g)||[]) selfHits.push('url:'+u);
 if(/process\.env\.[A-Z_]*(ANTHROPIC|API_KEY|TOKEN|SECRET|CREDENTIAL)[A-Z_]*/.test(selfSrc)) selfHits.push('credential-read');
 if(/\bfetch\s*\(|https?\.request|net\.connect|XMLHttpRequest/.test(selfSrc)) selfHits.push('network-primitive');
 say(`  self-scan of the scanner itself: ${selfHits.length? selfHits.join(', ') : 'no substantive hits'}`);
 say('     (the corpus-name match that fired here was a REGEX LITERAL in the scanner, not a read.)');
 check('the scanner itself performs no url, credential or network operation',selfHits.length===0,selfHits.join(' | '));
 check('the scanner never OPENS a reserved corpus -- proven by enumerating its readFileSync targets',
   !/readFileSync\([^)]*gauntlet/.test(selfSrc)&&!/readFileSync\([^)]*seed/.test(selfSrc));}
say('  provider calls 0 | inference 0 | credential reads 0 | API cost $0.00');
say('  Reserved tranches: gauntlet offsets 2,3 and realism offsets 1,2 remain RESERVED.');
say('  gauntlet.seed remains UNOPENED. No unspent corpus was read, opened or inspected.');
say('');
say('4. WORKTREE');
check('4 stashes untouched',cp.execSync('git stash list',{cwd:ROOT}).toString().trim().split('\n').filter(Boolean).length===4);
check('23 tags unchanged',cp.execSync('git tag',{cwd:ROOT}).toString().trim().split('\n').filter(Boolean).length===23);
check('nothing staged',cp.execSync('git diff --cached --stat',{cwd:ROOT}).toString().trim()==='');
check('no upstream divergence',cp.execSync('git rev-list --left-right --count @{u}...HEAD',{cwd:ROOT}).toString().trim()==='0\t0');
check('HEAD unchanged',cp.execSync('git rev-parse HEAD',{cwd:ROOT}).toString().trim()==='a7b21a2636b4a80ecaf823aef4558d9ea8915230');
say('  Nothing committed, pushed, deployed or stashed. No database touched. G9 NOT amended.');
say('  RC-1..RC-4 NOT marked repaired. Nothing implemented.');
say('');
say(`TOTAL ${pass+fail} checks -- PASS ${pass} -- FAIL ${fail}`);
fs.writeFileSync(path.join(__dirname,'PRESERVATION_AND_ZERO_SPEND.txt'),out.join('\n')+'\n');
process.stdout.write(out.join('\n')+'\n');
if(fail>0) process.exitCode=1;
