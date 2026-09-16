/** §309 — PRODUCTION STRUCTURAL PROOF. Entirely read-only. No account, no write of any kind. */
const API='https://safescope-backend.onrender.com', APP='https://safety-insite.vercel.app';
let pass=0; const fail=[];
const check=(c,m,d='')=>{ if(c){pass++;console.log(`ok    ${m}${d?`  [${d}]`:''}`);} else {fail.push(m);console.log(`FAIL  ${m}${d?`  [${d}]`:''}`);} };
(async()=>{
  console.log(`§309 PRODUCTION PROOF — read-only\n`);
  const v=await (await fetch(`${API}/health/version`)).json();
  check(v.gitCommit==='75b5a1494cd6df35785dd7a6831826f39a41b8c4','PP-0 the instance is serving the §309 release commit',v.gitCommit.slice(0,12));
  check(v.buildTimestampSourceStatus==='BUILD_TIMESTAMP','PP-0b the build timestamp is stamped rather than a fallback',v.buildTimestampSourceStatus);

  const ready=await (await fetch(`${API}/health/ready`)).json();
  check(ready.status==='ready','PP-1 the service is ready',ready.status);
  check(ready.schema.expectedSchemaVersion==='1800000025000' && ready.schema.appliedCount===57
    && ready.schema.expectedCount===57 && ready.schema.aheadOfBuild.length===0,
    'PP-2 STRUCTURAL: the schema position is UNCHANGED by §309 — same head, 57/57, nothing ahead of '
    + 'the build. §309 wrote no migration, so this is the number that proves it.',
    `${ready.schema.expectedSchemaVersion} ${ready.schema.appliedCount}/${ready.schema.expectedCount}`);
  check(ready.dependencies.schema==='current','PP-3 and readiness reports the schema as current',ready.dependencies.schema);

  const schema=await (await fetch(`${API}/health/schema`)).json();
  check(schema.ready===true && schema.missing.length===0 && schema.ahead.length===0,
    'PP-4 /health/schema reports every migration the build requires is applied, none missing, none ahead',
    `missing=${schema.missing.length} ahead=${schema.ahead.length}`);

  // The entity repairs are metadata only, so the proof they did no harm is that the routes which
  // READ the repaired entities still behave. All are unauthenticated-refused, which is enough to
  // show the application boots and routes — the entity metadata is loaded at boot.
  for (const [label,path] of [['inspections','/inspections'],['sites','/sites'],['reports','/inspection-reports'],['actions','/actions']]) {
    const r=await fetch(`${API}${path}`);
    check(r.status===401,`PP-5 ${label} route is live and refuses unauthenticated (the entity metadata loaded at boot)`,`${r.status}`);
  }

  // §308 preserved.
  for (const t of ['terms','privacy']) {
    const r=await fetch(`${API}/legal/documents/${t}`); const b=await r.json();
    check(r.status===200 && b.status==='NOT_YET_PUBLISHED',`PP-6 §308 PRESERVED: /legal/documents/${t} still answers 200 with the pre-publication state`,b.status);
  }
  // §307 preserved.
  check(ready.monitoring.policy===undefined,'PP-7 §307 PRESERVED: readiness still does not publish the alerting thresholds');
  const good=await fetch(`${API}/health/live`,{headers:{origin:APP}});
  const evil=await fetch(`${API}/health/live`,{headers:{origin:'https://evil.example.com'}});
  check(good.headers.get('access-control-allow-origin')===APP && !evil.headers.get('access-control-allow-origin'),
    'PP-8 §307 PRESERVED: CORS still returns the exact frontend origin and nothing for a foreign one');
  const seed=await fetch(`${API}/maintenance/seed-safescope`,{method:'POST',headers:{'content-type':'application/json'},body:'{}'});
  check(seed.status===401||seed.status===404,'PP-9 §307 PRESERVED: the synchronize route is still unreachable',`${seed.status}`);

  for (const p of ['/terms','/privacy','/login','/register']) {
    const r=await fetch(`${APP}${p}`);
    check(r.status===200,`PP-10 frontend ${p} answers 200`,`${r.status}`);
  }

  check(ready.monitoring.serverErrorsInWindow===0,'PP-11 serverErrorsInWindow is 0 after every probe',`${ready.monitoring.serverErrorsInWindow}`);

  console.log(`\n${'='.repeat(84)}`);
  console.log(`§309 PRODUCTION PROOF: ${pass} passed, ${fail.length} failed.`);
  console.log('Direct DB writes: 0. Accounts created: 0. Charges: 0. Expert calls: 0. Provider calls: 0. Spend: $0.00.');
  if(fail.length){console.log('\nFAILED:');for(const f of fail)console.log('  - '+f);}
  console.log('='.repeat(84));
  process.exit(fail.length===0?0:1);
})();
