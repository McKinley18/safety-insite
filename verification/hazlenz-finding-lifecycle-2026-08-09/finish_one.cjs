const { chromium, request } = require('/Users/mckinley/Desktop/Safety_InSite/frontend-next/node_modules/playwright');
const fs=require('fs'); const backend='http://127.0.0.1:4237', frontend='http://localhost:3008';
const inspectionId=process.argv[2]; const email='lifecycle.owner@example.test', password='Lifecycle!123';
const chrome='/Users/mckinley/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
(async()=>{
 const api=await request.newContext(); const auth=await (await api.post(backend+'/auth/login',{data:{email,password}})).json();
 const h={Authorization:'Bearer '+auth.token,'Content-Type':'application/json'};
 const browser=await chromium.launch({headless:true,executablePath:chrome}); const c=await browser.newContext({viewport:{width:1440,height:1000}}); const p=await c.newPage(); const events=[];
 p.on('response',r=>{if(/inspections|actions|tasks|reports/.test(r.url()))events.push({url:r.url(),status:r.status()})});
 await p.goto(frontend+'/login',{waitUntil:'domcontentloaded'});
 await p.evaluate(({token,user,inspectionId})=>{localStorage.setItem('sentinel_auth_token',token);localStorage.setItem('sentinel_auth_user',JSON.stringify(user));localStorage.setItem('sentinel_selected_inspection_context',JSON.stringify({persistedInspectionId:inspectionId,persistenceState:'saved',inspectionType:'guided_inspection',inspectionTitle:'Lifecycle',workflowDepth:'guided'}));},{token:auth.token,user:auth.user,inspectionId});
 await p.goto(frontend+'/inspection-workspace',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(800); let history=[];
 for(let i=0;i<7;i++){
   const body=await p.locator('body').innerText(); history.push({i,body:body.slice(-1200),buttons:await p.getByRole('button').allTextContents()});
   if(/Corrective action/.test(body)){await p.getByRole('button',{name:/Complete inspection and generate report/i}).click();await p.waitForTimeout(1500);history.push({completeBody:(await p.locator('body').innerText()).slice(-1800),buttons:await p.getByRole('button').allTextContents()});break;}
   const req=p.locator('article').filter({hasText:'Review: required'}).getByRole('button',{name:'Review this finding'});
   if(await req.count()===0) break;
   await req.first().click(); await p.waitForTimeout(150);
   if(await p.getByRole('button',{name:/Continue to risk review/i}).count()){await p.getByRole('button',{name:/Continue to risk review/i}).click();await p.waitForTimeout(150);await p.getByRole('button',{name:/Confirm risk and finalize finding/i}).click();await p.waitForTimeout(900);}
 }
 const final=await (await api.get(backend+'/inspections/'+inspectionId,{headers:h})).json(); fs.writeFileSync(__dirname+'/FINISH_ONE.json',JSON.stringify({inspectionId,history,final,events},null,2));
 console.log(JSON.stringify({status:final.status,findings:final.findings?.map(f=>({id:f.id,key:f.hazardKey,status:f.status,review:f.finalReviewId})),history:history.map(x=>({i:x.i,buttons:x.buttons,completeBody:x.completeBody}))},null,2)); await browser.close(); await api.dispose();
})();
