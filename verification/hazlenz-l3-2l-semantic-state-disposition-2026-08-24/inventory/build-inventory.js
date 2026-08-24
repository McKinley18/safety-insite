const fs = require('fs'), path = require('path');
const ROOT = '/Users/mckinley/Desktop/Safety_InSite';
const CODE = 'SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE';

function walk(dir, out=[]) {
  for (const e of fs.readdirSync(dir, {withFileTypes:true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.json')) out.push(p);
  }
  return out;
}

const files = walk(path.join(ROOT,'verification'));
const rows = [];
const fileStats = [];

for (const f of files) {
  let j; try { j = JSON.parse(fs.readFileSync(f,'utf8')); } catch { continue; }
  const recs = j && Array.isArray(j.records) ? j.records : null;
  if (!recs) continue;
  let nWithBinder = 0, nRejAny = 0, nRejCode = 0;
  for (const r of recs) {
    if (!('semanticRejected' in r)) continue;
    nWithBinder++;
    const rej = r.semanticRejected || [];
    if (rej.length) nRejAny++;
    for (const rj of rej) {
      const codes = rj.codes || [];
      if (!codes.includes(CODE)) continue;
      nRejCode++;
      const pre = (r.preSemanticHazards||[]).find(h => h.candidateKey === rj.candidateKey) || {};
      const issue = (r.semanticIssues||[]).find(i => i.code===CODE && i.candidateKey===rj.candidateKey) || {};
      const keptCount = (r.preSemanticHazards||[]).length - (r.semanticRejected||[]).length;
      rows.push({
        artifact: path.relative(ROOT, f),
        setId: j.setId || null,
        provider: (j.provider && (j.provider.model||j.provider.name)) || JSON.stringify(j.provider||null),
        scenario: r.id,
        cohort: r.cohort,
        regime: r.regime,
        text: r.text,
        candidateKey: rj.candidateKey,
        hazardFamily: pre.hazardFamily || null,
        proposedState: pre.conditionState || null,
        evidence: pre.evidence || [],
        codes,
        soleCode: codes.length === 1,
        binderDetail: issue.detail || null,
        expectHazard: r.expect && r.expect.hazardEstablished,
        expectState: r.expect && r.expect.conditionState,
        expectFamily: r.expect && r.expect.familyPattern,
        expectHC: r.expect && r.expect.highConsequence,
        expectClar: r.expect && r.expect.clarificationExpected,
        preSemanticCount: (r.preSemanticHazards||[]).length,
        rejectedCount: (r.semanticRejected||[]).length,
        keptAfterBinder: keptCount,
        emptiedAllCandidates: keptCount <= 0,
        controlAdequacy: (r.semanticControlAdequacy||[]).filter(c=>c.candidateKey===rj.candidateKey),
      });
    }
  }
  if (nWithBinder) fileStats.push({artifact: path.relative(ROOT,f), records: nWithBinder, recordsWithAnyRejection: nRejAny, rejectionsWithThisCode: nRejCode});
}

fs.writeFileSync('/private/tmp/claude-501/-Users-mckinley-Desktop-Safety-InSite/05493fd8-4eef-4e0e-90b5-b8a8d08a9084/scratchpad/inv.json', JSON.stringify({rows, fileStats}, null, 1));
console.log('artifacts with binder output:', fileStats.length);
console.log('total records scanned with binder output:', fileStats.reduce((a,b)=>a+b.records,0));
console.log('total ' + CODE + ' rejections found:', rows.length);
console.log('distinct scenarios:', new Set(rows.map(r=>r.scenario)).size);
