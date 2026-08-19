import fs from 'node:fs';
const base=process.env.API_BASE_URL||'http://127.0.0.1:4245', token=process.env.AUDIT_TOKEN;
const corpus=JSON.parse(fs.readFileSync(new URL('../hazlenz-response-quality-2026-08-09/OPAQUE_HOLDOUT.json',import.meta.url)));
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const rows=[];
for(const s of corpus){let status=0,out={}; for(let i=1;i<=4;i++){const r=await fetch(base+'/safescope-v2/classify',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${token}`},body:JSON.stringify({text:s.text,scopes:['all'],structuredObservation:{narrative:s.text,jurisdiction:'unknown'}})});status=r.status;const raw=await r.text();try{out=JSON.parse(raw)}catch{out={raw}};if(status!==429)break;await sleep(i*2500)} rows.push({id:s.id,status,expectedState:s.expectedState,output:out});await sleep(1300)}
fs.writeFileSync(new URL('./OPAQUE_HOLDOUT_RAW.json',import.meta.url),JSON.stringify(rows,null,2));console.log(JSON.stringify({attempted:rows.length,http201:rows.filter(r=>r.status===201).length,transportFailures:rows.filter(r=>r.status!==201).length},null,2));
