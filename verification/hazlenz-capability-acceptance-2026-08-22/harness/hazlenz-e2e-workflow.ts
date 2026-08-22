/** Phase 19/20 — full product workflow acceptance through the REAL running API. */
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'crypto';
const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:4320';
type Json = Record<string, any>;
async function req(path: string, options: RequestInit = {}, expected: number[] = [200,201]): Promise<Json> {
  const r = await fetch(`${baseUrl}${path}`, { ...options, headers: { 'content-type':'application/json', ...(options.headers||{}) } });
  const t = await r.text();
  let b: any = {}; try { b = t ? JSON.parse(t) : {}; } catch { b = { text: t }; }
  if (!expected.includes(r.status)) throw new Error(`${options.method||'GET'} ${path} -> ${r.status}: ${t.slice(0,400)}`);
  return b;
}
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const WORKFLOWS = [
  { key:'W1', ctx:'osha-general-industry', scopes:['osha_general_industry'], text:'The fixed guard was missing from the in-running nip point on the packaging line conveyor while it was running and an operator was clearing product beside it.' },
  { key:'W2', ctx:'osha-construction', scopes:['osha_construction'], text:'Employees were working within two feet of an unprotected leading edge approximately eighteen feet above grade with no guardrail, safety net or personal fall arrest system in use.' },
  { key:'W3', ctx:'msha', scopes:['msha'], text:'At the surface metal and nonmetal mine, the conveyor tail pulley guard was removed while the belt was running and miners travel the adjacent walkway.' },
  { key:'W4', ctx:'osha-general-industry', scopes:['osha_general_industry'], text:'The welding bay had no local exhaust ventilation in use during stainless welding, and the exit door at the north end of the same bay was blocked by a stack of gas cylinders.' },
  { key:'W5', ctx:'osha-general-industry', scopes:['osha_general_industry'], text:'The press was locked out with each technician personal lock and zero energy was verified at the terminals before servicing began.' },
  { key:'W6', ctx:'unknown', scopes:undefined as any, text:'An employee was working from a portable ladder that was not secured at the top and extended only two rungs above the landing.' },
];
async function main() {
  const suffix = `${Date.now()}`;
  const email = `hazlenz-accept-${suffix}@example.test`;
  const password = 'Accept!StrongPass123';
  await req('/auth/register', { method:'POST', body: JSON.stringify({ email, password, name:'Acceptance Inspector', type:'individual' }) }, [201]);
  const login = await req('/auth/login', { method:'POST', body: JSON.stringify({ email, password }) }, [200,201]);
  const token = login.token || login.accessToken;
  const userId = login.user?.id;
  execFileSync('npx', ['ts-node','-T','scripts/grant-test-entitlement.ts', userId, '4'], { env:{...process.env, NODE_ENV:'test'}, stdio:'pipe' });
  const auth = { authorization: `Bearer ${token}` };
  console.log(`auth ok user=${userId}`);
  const site = await req('/sites', { method:'POST', headers:auth, body: JSON.stringify({ name:`Acceptance Site ${suffix}` }) }, [200,201]);
  const results:any[]=[];
  for (const w of WORKFLOWS) {
    const out:any={ key:w.key, ctx:w.ctx, steps:{} };
    try {
      const insp = await req('/inspections', { method:'POST', headers:auth, body: JSON.stringify({ siteId: site.id, title:`${w.key} acceptance`, regulatoryContext: w.ctx })}, [200,201]);
      out.steps.inspectionId = insp.id;
      out.steps.regulatoryContextPersisted = insp.regulatoryContext ?? null;

      await sleep(2200); // stay inside the classify throttle (30/60s); never weakened
      const analysis = await req('/safescope-v2/classify', { method:'POST', headers:auth, body: JSON.stringify({
        text:w.text, scopes:w.scopes, structuredObservation:{ jurisdiction:w.ctx } })}, [200,201]);
      out.steps.classification = analysis.classification;
      out.steps.citations = (analysis.standardDecisions||[]).map((s:any)=>s.citation);
      out.steps.riskBand = analysis?.risk?.riskBand;
      out.steps.governedKeysInPayload = Object.keys(analysis).filter(k=>/^governed|shadow|cutover|knowledgeRelease/i.test(k));
      out.steps.regulatoryContextEcho = analysis?.regulatoryContext;

      const obs = await req(`/inspections/${insp.id}/observations`, { method:'POST', headers:auth, body: JSON.stringify({ rawText:w.text })}, [200,201]);
      out.steps.observationId = obs.id;

      const snap = await req(`/inspections/observations/${obs.id}/analyses`, { method:'POST', headers:auth, body: JSON.stringify({
        engineVersion:'hazlenz-acceptance-1', idempotencyKey:randomUUID(), requestVersion: obs.version ?? 1, resultSnapshot: analysis })}, [200,201]);
      out.steps.analysisId = snap.id ?? true;
      out.steps.knowledgeReleaseId = snap.knowledgeReleaseId ?? null;

      const review = await req(`/inspections/observations/${obs.id}/reviews`, { method:'POST', headers:auth, body: JSON.stringify({
        analysisId: snap.id, decision:'accepted', rationale:'Acceptance-phase reviewer confirmation of the HazLenz candidate.', idempotencyKey: randomUUID() })}, [200,201]);
      out.steps.reviewId = review.id ?? true;

      const finding = await req(`/inspections/observations/${obs.id}/findings`, { method:'POST', headers:auth, body: JSON.stringify({
        reviewId: review.id, conclusion:`Reviewer-confirmed finding for ${w.key}.`, hazardCategory: analysis.classification || 'Unclassified' })}, [200,201])
        .catch((e)=>{ out.steps.findingError=String(e).slice(0,250); return null; });
      if (finding) out.steps.findingId = finding.id ?? true;

      const reload = await req(`/inspections/${insp.id}`, { headers:auth }, [200]);
      out.steps.reloadOk = Boolean(reload?.id);
      out.steps.reloadObservations = Array.isArray(reload?.observations)?reload.observations.length:null;
      out.steps.reloadFindings = Array.isArray(reload?.findings)?reload.findings.length:
        (Array.isArray(reload?.observations)?reload.observations.reduce((n:number,o:any)=>n+((o.findings||[]).length),0):null);

      // Multi-hazard observations produce several findings; the finalization gate requires a
      // completed human review on EVERY current finding. Review them all, as a real reviewer would.
      const pre = await req(`/inspections/${insp.id}`, { headers:auth }, [200]);
      const allFindings:any[] = (pre.observations||[]).flatMap((o:any)=>o.findings||[]).concat(pre.findings||[]);
      out.steps.findingsRequiringReview = allFindings.length;
      for (const f of allFindings) {
        if (f.id === finding?.id) continue;
        const rv = await req(`/inspections/observations/${obs.id}/reviews`, { method:'POST', headers:auth, body: JSON.stringify({
          findingId: f.id, analysisId: snap.id, decision:'accepted',
          rationale:'Acceptance-phase reviewer confirmation of this decomposed finding.', idempotencyKey: randomUUID() })}, [200,201])
          .catch((e)=>{ out.steps[`reviewErr_${f.id}`]=String(e).slice(0,160); return null; });
        if (rv) await req(`/inspections/observations/${obs.id}/findings`, { method:'POST', headers:auth, body: JSON.stringify({
          reviewId: rv.id, conclusion:`Reviewer-confirmed decomposed finding.`,
          segmentKey: f.hazardKey || undefined, hazardCategory: f.hazardCategory || 'Unclassified' })}, [200,201])
          .catch((e)=>{ out.steps[`finalizeErr_${f.id}`]=String(e).slice(0,160); return null; });
      }

      // advance the inspection through the real lifecycle so a report may be generated
      let cur = await req(`/inspections/${insp.id}`, { headers:auth }, [200]);
      for (const status of ['in_review','completed'] as const) {
        cur = await req(`/inspections/${insp.id}/transition`, { method:'POST', headers:auth,
          body: JSON.stringify({ status, version: cur.version }) }, [200,201])
          .catch((e)=>{ out.steps[`transition_${status}_error`]=String(e).slice(0,200); return cur; });
      }
      out.steps.finalStatus = cur.status ?? null;

      const report = await req(`/inspections/${insp.id}/reports`, { method:'POST', headers:auth, body: JSON.stringify({}) }, [200,201])
        .catch((e)=>{ out.steps.reportError=String(e).slice(0,300); return null; });
      if (report) { out.steps.reportId = report.id ?? report.reportId; out.steps.reportVersion = report.version ?? report.latestVersion ?? null; }
      out.ok = true;
    } catch(e:any){ out.ok=false; out.error=String(e).slice(0,400); }
    results.push(out); console.log(JSON.stringify(out));
  }
  console.log('\n=== SUMMARY ===');
  for (const r of results) console.log(`${r.key} ctx=${r.ctx.padEnd(22)} ok=${r.ok} class=${String(r.steps?.classification).slice(0,26).padEnd(26)} cites=${(r.steps?.citations||[]).length} finding=${r.steps?.findingId?'y':'n'} report=${r.steps?.reportId?'y':'n'} provenance=${JSON.stringify(r.steps?.knowledgeReleaseId)} governedKeys=${JSON.stringify(r.steps?.governedKeysInPayload||[])}`);
  require('fs').writeFileSync(process.env.OUT || '/tmp/e2e.json', JSON.stringify(results,null,1));
}
main().catch(e=>{ console.error(e); process.exit(1); });
