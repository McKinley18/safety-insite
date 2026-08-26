#!/usr/bin/env node
/* SCORE DETERMINISM PROOF -- and the disclosure of why this file exists.
 *
 * WHY: the acceptance score was computed, then the package was manifested, then the scorer was
 * re-run as a final re-verification. That re-run rewrote ACCEPTANCE_SCORE.json with a fresh
 * `scoredAt` timestamp and broke the manifest. THE VERDICT DID NOT CHANGE -- only the clock did.
 * That was a procedural error on my part (manifest before final re-verification), and it is
 * recorded here rather than quietly patched.
 *
 * WHAT THIS PROVES: the scorer is a PURE FUNCTION of (holdout, resultsA, resultsB). Re-running it
 * reproduces every field byte-identically EXCEPT `scoredAt`. The score BODY digest -- the whole
 * envelope with the timestamp removed -- is therefore stable and is the durable identity of this
 * result. If the verdict had moved, this would fail loudly.
 */
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process');
const P=path.join(__dirname,'..');
const SCORE=path.join(__dirname,'ACCEPTANCE_SCORE.json');
const sha=(b)=>crypto.createHash('sha256').update(b).digest('hex');
/* Two fields of the envelope are ENVIRONMENT-DEPENDENT and carry NO verdict information:
 *   scoredAt              -- the wall clock at scoring time
 *   rawProcess{A,B}.path  -- the invocation path string, absolute or repo-relative depending only
 *                            on the working directory the scorer was called from
 * Both are excluded from the body digest and REPLACED by a stronger assertion: the CONTENT digests
 * rawProcess{A,B}.sha256 must be identical across every run. An earlier revision of this proof
 * excluded only scoredAt and reported "THE VERDICT MOVED" when the path string changed -- that was
 * a defect in the proof, not in the result, and it is corrected here rather than silenced. */
const bodyDigest=(o)=>{const c=JSON.parse(JSON.stringify(o)); delete c.scoredAt;
  delete c.rawProcessA.path; delete c.rawProcessB.path; return sha(JSON.stringify(c));};

const before=JSON.parse(fs.readFileSync(SCORE,'utf8'));
const runs=[before];
for(let i=0;i<2;i++){
  cp.execSync(`node ${JSON.stringify(path.join(__dirname,'score-run2-acceptance.js'))} `
    +`${JSON.stringify(path.join(P,'results','raw-process-A.json'))} `
    +`${JSON.stringify(path.join(P,'results','raw-process-B.json'))}`,{stdio:'ignore'});
  runs.push(JSON.parse(fs.readFileSync(SCORE,'utf8')));
}
const out=[];
const say=(s='')=>out.push(s);
say('L3 RUN-2 ACCEPTANCE SCORE -- DETERMINISM PROOF AND TIMESTAMP DISCLOSURE');
say('');
say('DISCLOSURE. The package was manifested and the scorer was then re-run as a final');
say('re-verification, rewriting ACCEPTANCE_SCORE.json with a new `scoredAt` and breaking the');
say('manifest. THE VERDICT DID NOT CHANGE -- only the clock did. Recorded, not patched over.');
say('');
say('scoredAt observed across three independent scoring runs:');
for(const r of runs) say(`  ${r.scoredAt}`);
say('');
const bodies=runs.map(bodyDigest);
say('paths recorded across the three runs (environment-dependent, no verdict information):');
for(const r of runs) say(`  ${r.rawProcessA.path}`);
say('');
say('CONTENT digests of the raw evidence, which is what actually matters:');
for(const r of runs) say(`  A ${r.rawProcessA.sha256}   B ${r.rawProcessB.sha256}`);
say('');
say('SCORE BODY DIGEST (whole envelope; `scoredAt` and the two path strings removed):');
for(const b of bodies) say(`  ${b}`);
const stable=bodies.every(b=>b===bodies[0]);
say('');
say(`  all three identical: ${stable}`);
say('');
const t=runs.map(r=>r.score.terminal), s=runs.map(r=>r.score.scorable), p=runs.map(r=>r.score.pass), m=runs.map(r=>r.score.modelAcceptanceResult);
say(`  terminal stable                ${new Set(t).size===1}   ${t[0]}`);
say(`  scorable stable                ${new Set(s).size===1}   ${s[0]}`);
say(`  pass stable                    ${new Set(p).size===1}   ${p[0]}`);
say(`  modelAcceptanceResult stable   ${new Set(m).size===1}   ${m[0]}`);
const gj=runs.map(r=>JSON.stringify(r.score.gates));
say(`  all ten gate objects stable    ${new Set(gj).size===1}`);
const rawStable=runs.every(r=>r.rawProcessA.sha256===runs[0].rawProcessA.sha256 && r.rawProcessB.sha256===runs[0].rawProcessB.sha256);
say(`  raw-result hashes stable       ${rawStable}`);
say('');
say(`SCORE_BODY_DIGEST = ${bodies[0]}`);
say('This, not the file hash, is the durable identity of the Run-2 acceptance result.');
say('The file hash varies only by the `scoredAt` clock and carries no verdict information.');
say('');
const ok = stable && new Set(t).size===1 && new Set(s).size===1 && new Set(p).size===1 && new Set(gj).size===1 && rawStable;
say(ok ? 'DETERMINISM PROVEN. THE VERDICT IS INVARIANT ACROSS RE-SCORING.'
       : 'FAILED -- THE VERDICT MOVED ACROSS RE-SCORING. THIS MUST BE INVESTIGATED.');
fs.writeFileSync(path.join(__dirname,'SCORE_DETERMINISM.txt'),out.join('\n')+'\n');
process.stdout.write(out.join('\n')+'\n');
if(!ok) process.exitCode=1;
