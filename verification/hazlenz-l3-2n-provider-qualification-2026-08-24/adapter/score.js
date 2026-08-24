const fs=require('fs');
function score(f){
  const j=JSON.parse(fs.readFileSync(f,'utf8')); const rows=j.rows||j.records;
  const t={model:(j.provider&&j.provider.model)||'?',rows:rows.length,mE:0,mH:0,vE:0,vH:0,na:0,fa:0,rj:0,rids:[],codes:{},cE:0,cC:0,cS:0,raised:0,unnec:[],errs:0};
  for(const r of rows){
    if(r.error){t.errs++;}
    if(r.validationState&&r.validationState!=='VALID'){t.rj++;t.rids.push(r.scenarioId);
      for(const i of (r.validationIssues||[])){const c=i.code||i;t.codes[c]=(t.codes[c]||0)+1;}}
    if(r.expectActive===true){t.mE++;if(r.modelAssertsActive)t.mH++;t.vE++;if(r.validatedAssertsActive)t.vH++;}
    else {t.na++;if(r.validatedAssertsActive)t.fa++;}
    const any=r.clarificationCarriedAnywhere; if(any)t.raised++;
    if(r.expectClarification===true){t.cE++;if(r.candidateBorneClarification)t.cC++;if(any)t.cS++;}
    else if(r.expectClarification===false&&any)t.unnec.push(r.scenarioId);
  }
  return t;
}
const B='/Users/mckinley/Desktop/Safety_InSite/verification/';
const sets=[
 ['gemini-3.7-flash  A',process.argv[2]+'/F37-SHIPPED_A.json'],
 ['gemini-3.7-flash  B',process.argv[2]+'/F37-SHIPPED_B.json'],
 ['gemini-3.6-flash  A',process.argv[2]+'/F36-SHIPPED_A.json'],
 ['gemini-3.6-flash  B',process.argv[2]+'/F36-SHIPPED_B.json'],
 ['gemini-3.1-pro-preview *',B+'hazlenz-l3-2j-cross-provider-closure-2026-08-24/results/shipped-gemini-V_PRE_ACTIVATION.json'],
 ['qwen3-coder:30b *',B+'hazlenz-l3-2j-carrier-activation-2026-08-24/results/shipped-qwen-V_PRE_ACTIVATION.json'],
];
console.log('* = recorded baseline, not re-run by this phase\n');
console.log('model'.padEnd(26)+'MODEL  VALID  falseACT  clar(c/s)  prec  reject  codes');
for(const [k,f] of sets){
  let t; try{t=score(f);}catch(e){console.log(k+': MISSING');continue;}
  console.log(k.padEnd(26)+
    (t.mH+'/'+t.mE).padEnd(7)+(t.vH+'/'+t.vE).padEnd(7)+
    (t.fa+'/'+t.na).padEnd(10)+(t.cC+'/'+t.cE+' '+t.cS+'/'+t.cE).padEnd(11)+
    (t.raised?(t.cS+'/'+t.raised):'n/a').padEnd(6)+String(t.rj).padEnd(8)+
    Object.keys(t.codes).join(','));
}
console.log('');
for(const [k,f] of sets.slice(0,4)){ const t=score(f); console.log(k+' rejections: '+t.rids.join(',')); }
