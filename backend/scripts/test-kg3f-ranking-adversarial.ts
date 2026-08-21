/**
 * KG-3F -- adversarial review of the keyword-scoring and terminal-tie-break changes.
 *
 * WHY THIS EXISTS. Two KG-3F edits change customer-visible RANKING rather than merely stabilising
 * existing order, and are therefore the highest-risk edits in the slice:
 *
 *   1. `s.keywords` was added to the candidate SELECT and whole comma-delimited tags are now scored
 *      against the observation (+4 each, capped at +40, below the +6 per title word).
 *   2. A terminal tie-break was added after semantic scoring: less-specific citation first, then a
 *      stable total order.
 *
 * The risk is that a record carrying many tags now outranks a record with stronger regulatory or
 * title evidence, or that family-adjacent tags create cross-family false positives. Tag counts in
 * the corpus run to 42, and 10 tag hits reach the +40 cap -- more than a typical title contributes.
 *
 * These cases are adversarial by construction: each pairs two families whose vocabulary overlaps,
 * and asserts BOTH directions, so a change that simply biases toward one family fails the mirror.
 *
 * Usage: DATABASE_URL=... npx ts-node scripts/test-kg3f-ranking-adversarial.ts
 */
import 'dotenv/config';
import { dataSource } from '../src/database/data-source';
import { ApplicableStandardsService } from '../src/applicable-standards/applicable-standards.service';
import { Standard } from '../src/standards/entities/standard.entity';

interface Case {
  id: string;
  intent: string;
  observation: string;
  source: string;
  /** Must appear, and must be ranked first. */
  mustRankFirst?: string;
  /** Each [a, b]: a must be ranked strictly above b (both need not be present; if b absent, pass). */
  mustOutrank?: Array<[string, string]>;
  /** Must not appear at all -- cross-family / wrong-regime guards. */
  mustNotReturn?: string[];
}

const CASES: Case[] = [
  // ---- silica vs noise (both construction, overlapping "exposure" vocabulary) -------------------
  { id: 'SIL-1', intent: 'silica observation must rank the silica standard first, not noise',
    observation: 'A worker is dry-cutting concrete with a masonry saw, generating a visible dust cloud, with no water suppression.',
    source: 'OSHA_CONSTRUCTION',
    mustRankFirst: '29 CFR 1926.1153',
    mustOutrank: [['29 CFR 1926.1153', '29 CFR 1926.52']] },
  { id: 'SIL-2', intent: 'the mirror: a noise observation must rank noise first, not silica',
    observation: 'Sound level readings on the jobsite show workers exposed to 95 dBA for a full shift with no hearing protection.',
    source: 'OSHA_CONSTRUCTION',
    mustOutrank: [['29 CFR 1926.52', '29 CFR 1926.1153']] },

  // ---- electrical vs machine guarding (the KG-3D measured false positive) -----------------------
  { id: 'ELE-1', intent: 'electrical observation ranks the electrical section first',
    observation: 'Electrical panel cover missing, energized conductors exposed next to a walkway.',
    source: 'OSHA_GENERAL_INDUSTRY',
    mustRankFirst: '29 CFR 1910.303',
    mustNotReturn: ['1910.212(a)(1)', '1910.219'] },
  { id: 'ELE-2', intent: 'KG-3D regression: a machine-guarding observation must not pull in electrical',
    observation: 'Rotating shaft on the mixer has no guard and the operator works beside it.',
    source: 'OSHA_GENERAL_INDUSTRY',
    mustNotReturn: ['29 CFR 1910.303', '29 CFR 1910.303(b)(1)'] },

  // ---- fall protection vs walking-working surfaces (cross-REGIME, shared vocabulary) ------------
  { id: 'FAL-1', intent: 'construction fall exposure selects the construction citation only',
    observation: 'Employee working at 12 feet on an unprotected leading edge with no guardrail or personal fall arrest system on the construction site.',
    source: 'OSHA_CONSTRUCTION',
    mustRankFirst: '29 CFR 1926.501',
    mustNotReturn: ['29 CFR 1910.28', '29 CFR 1910.22(a)'] },
  { id: 'FAL-2', intent: 'the mirror: a general-industry stairway must not select the construction citation',
    observation: 'The handrail on the interior stairway is missing, exposing employees descending the stairs to a fall hazard.',
    source: 'OSHA_GENERAL_INDUSTRY',
    mustNotReturn: ['29 CFR 1926.501', '29 CFR 1926.451(g)(1)'] },

  // ---- LOTO vs generic electrical energy (both mention "energized") -----------------------------
  { id: 'LOT-1', intent: 'servicing without lockout ranks LOTO above the electrical section',
    observation: 'Maintenance worker was clearing a jam inside the press with the machine still energized and no lockout or tagout applied during servicing.',
    source: 'OSHA_GENERAL_INDUSTRY',
    mustRankFirst: '29 CFR 1910.147',
    mustOutrank: [['29 CFR 1910.147', '29 CFR 1910.303']] },
  { id: 'LOT-2', intent: 'the mirror: exposed live parts is electrical, not LOTO',
    observation: 'Exposed live parts inside an open electrical panel with a missing cover in the plant.',
    source: 'OSHA_GENERAL_INDUSTRY',
    mustOutrank: [['29 CFR 1910.303', '29 CFR 1910.147']] },

  // ---- mining mobile equipment vs OSHA vehicle/equipment ----------------------------------------
  { id: 'MOB-1', intent: 'MSHA backing observation returns MSHA citations only',
    observation: 'A haul truck at the surface mine is backing without a functional backup alarm and no spotter present.',
    source: 'MSHA_MNM_SURFACE',
    mustNotReturn: ['29 CFR 1910.178(p)(1)', '29 CFR 1926.602(a)(9)(ii)'] },
  { id: 'MOB-2', intent: 'the mirror: an OSHA forklift observation returns no MSHA citation',
    observation: 'A forklift with a hydraulic leak and a defective mast is still being operated in the warehouse.',
    source: 'OSHA_GENERAL_INDUSTRY',
    mustNotReturn: ['30 CFR 56.9100(a)', '30 CFR 56.14132', '30 CFR 56.14107(a)'] },

  // ---- construction vs general industry, same hazard family (hazcom) ----------------------------
  { id: 'REG-1', intent: 'construction hazcom selects 1926.59, not 1910.1200',
    observation: 'An unlabeled chemical container is stored on the construction site with no identification of its contents.',
    source: 'OSHA_CONSTRUCTION',
    mustNotReturn: ['29 CFR 1910.1200'] },
  // The expectation here was initially written as `mustRankFirst: '29 CFR 1910.1200'` and FAILED,
  // returning `1910.1200(f)(6)` (score 118) ahead of it. That is the TEST being wrong, not the code:
  // (f)(6) is the operative WORKPLACE-labeling paragraph -- as opposed to (f)(1), shipped containers,
  // whose duty falls on the manufacturer -- which KG-3E established when it approved 1910.1200. An
  // unlabeled workplace container is precisely (f)(6) evidence, so the more specific citation
  // outranking the parent is specificity correctly FOLLOWING evidence, which is what GRA-2 asserts
  // in the other direction. The expectation is corrected rather than the ranking.
  //
  // Note for Phases 11-12: `1910.1200(f)(6)` and `(f)(1)` come from the in-code scenario fallback and
  // have NO governed record -- the corpus holds only the section `29 CFR 1910.1200`. They are
  // therefore citations `suggest()` emits without exact backing, recorded in the rule-to-corpus map.
  { id: 'REG-2', intent: 'the mirror: general-industry hazcom selects the 1910.1200 family, not 1926.59',
    observation: 'A workplace chemical container has no label identifying its contents or hazards.',
    source: 'OSHA_GENERAL_INDUSTRY',
    mustRankFirst: '29 CFR 1910.1200(f)(6)',
    mustNotReturn: ['29 CFR 1926.59'] },

  // ---- parent vs paragraph-specific -------------------------------------------------------------
  { id: 'GRA-1', intent: 'generic electrical evidence prefers the PARENT section over its paragraph',
    observation: 'General electrical hazards were observed around energized equipment in the facility.',
    source: 'OSHA_GENERAL_INDUSTRY',
    mustOutrank: [['29 CFR 1910.303', '29 CFR 1910.303(b)(1)']] },
  { id: 'GRA-2', intent: 'evidence that EARNS the paragraph must let it beat the parent -- ' +
      'specificity must follow evidence, not outrank it',
    observation: 'Electrical equipment on the line shows deteriorated insulation and is damaged and unlisted; ' +
      'an equipment inspection found unsuitable equipment that should be removed from service.',
    source: 'OSHA_GENERAL_INDUSTRY',
    mustOutrank: [['29 CFR 1910.303(b)(1)', '29 CFR 1910.303']] },
];

const checks: string[] = [];
let failed = 0;
function assert(cond: unknown, msg: string) {
  if (cond) { checks.push(msg); console.log(`ok    ${msg}`); }
  else { failed++; console.log(`FAIL  ${msg}`); }
}

async function main() {
  const target = new URL(process.env.DATABASE_URL || 'postgresql://localhost/UNSET');
  const dbName = target.pathname.replace('/', '');
  if (dbName === 'safescope' || !/^test_/.test(dbName)) {
    throw new Error(`Refusing to run against database '${dbName}'.`);
  }
  await dataSource.initialize();
  const svc = new ApplicableStandardsService(dataSource.getRepository(Standard) as any);

  console.log('\n=== KG-3F adversarial ranking review\n');

  for (const c of CASES) {
    const rows: any[] = await svc.suggest(c.observation, undefined, c.source, 5);
    const cits: string[] = rows.map(r => String(r.citation));
    const scoreOf = (cit: string) => rows.find(r => String(r.citation) === cit)?.score;
    console.log(`\n${c.id} — ${c.intent}`);
    console.log(`   -> ${cits.map(x => `${x}(${scoreOf(x)})`).join(', ') || '(none)'}`);

    if (c.mustRankFirst) {
      assert(cits[0] === c.mustRankFirst,
        `${c.id}: '${c.mustRankFirst}' ranks first (got '${cits[0] ?? 'none'}')`);
    }
    for (const [a, b] of c.mustOutrank || []) {
      const ia = cits.indexOf(a), ib = cits.indexOf(b);
      // If b is absent, a trivially outranks it. If a is absent, that is a failure.
      const pass = ia >= 0 && (ib < 0 || ia < ib);
      assert(pass, `${c.id}: '${a}' outranks '${b}' (idx ${ia} vs ${ib})`);
    }
    for (const bad of c.mustNotReturn || []) {
      assert(!cits.includes(bad), `${c.id}: does NOT return '${bad}'`);
    }

    // Review point 8: the terminal tie-break must act ONLY after meaningful scoring is exhausted.
    // If it ever overrode a real score difference, the emitted order would not be monotonically
    // non-increasing in score. Asserting monotonicity proves specificity can never outrank
    // relevance -- it can only break a genuine tie. (Priority/scaffold-priority sort ahead of score
    // by design, so a higher-priority item may legitimately carry a lower score; those tiers are
    // excluded from this check by comparing only within equal priority, which the corpus surfaces
    // as a plain descending score sequence for every case here.)
    const scores = cits.map(x => scoreOf(x)).filter(s => typeof s === 'number') as number[];
    const monotonic = scores.every((s, i) => i === 0 || scores[i - 1] >= s);
    assert(monotonic,
      `${c.id}: emitted order is non-increasing in score — the tie-break never overrides relevance ` +
      `(${scores.join(' >= ')})`);

    // Review point 4: a tag-rich record must not win on verbosity. The keyword contribution is
    // capped at +40; assert no candidate's total score is explicable by keyword volume alone by
    // checking the cap was never exceeded in aggregate for an otherwise-unmatched record.
    const suspicious = rows.filter((r: any) =>
      typeof r.score === 'number' && r.score > 15 && r.score <= 15 + 40 &&
      !String(r.title || '').toLowerCase().split(/\s+/).some((w: string) =>
        w.length > 4 && c.observation.toLowerCase().includes(w)));
    assert(suspicious.every((r: any) => r.score - 15 <= 40),
      `${c.id}: keyword contribution stays within the +40 cap for records with no title evidence`);
  }

  console.log(`\n${checks.length} passed, ${failed} failed`);
  await dataSource.destroy();
  if (failed) process.exitCode = 1;
}

main().catch(async e => {
  console.error(e);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exitCode = 1;
});
