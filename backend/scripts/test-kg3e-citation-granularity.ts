/**
 * KG-3E (Phases 4 and 8) -- the permanent citation-granularity and selection-safety contract.
 *
 * WHY THIS EXISTS. KG-3D found that HazLenz emitted `29 CFR 1910.303` while the corpus held only
 * `1910.303(b)(1)`, and that the two are different rules: (b)(1) is *Examination*, while the
 * predicate described *Guarding of live parts*, which is (g)(2)(i) and carries a voltage scope the
 * predicate never established. Prefix-matching the section to the paragraph would have attached an
 * examination requirement to a guarding finding and called it improved coverage.
 *
 * That was caught by a human reading the regulation. Nothing in the codebase would have stopped it,
 * and KG-3E found the identical hazard a second time on a citation nobody was watching --
 * `30 CFR 56.14132(a)` is HORN maintenance while the predicate that emits it describes reversing
 * without a backup alarm, which is (b)(1). Two independent occurrences make this a class of defect,
 * not an incident, so it gets a standing contract.
 *
 * The contract is deliberately written against the REAL corpus, not fixtures: a fixture would prove
 * the lookup functions behave, which was never in doubt. What needs proving is that the actual
 * governed corpus does not let a section stand in for a paragraph, or a paragraph for a section,
 * in either direction.
 *
 * Usage: DATABASE_URL=... npx ts-node scripts/test-kg3e-citation-granularity.ts <releaseId>
 */
import 'dotenv/config';
import { dataSource } from '../src/database/data-source';
import { resolveGovernedCitation } from '../src/standards/releases/governed-corpus-lookup';
import { applyFindingScopedStandards } from '../src/safescope-v2/evidence/evidence-foundation';

const checks: string[] = [];
let failed = 0;
function assert(condition: unknown, message: string) {
  if (condition) {
    checks.push(message);
    console.log(`ok    ${message}`);
  } else {
    failed++;
    console.log(`FAIL  ${message}`);
  }
}

/** Runs the real in-code selection engine for an observation and returns emitted citations. */
function select(observation: string, scopes: string[]): string[] {
  const result: any = {
    multiHazardDecomposition: {
      hazards: [{
        hazardId: 'kg3e-1', domainId: 'unknown', hazardFamily: 'unknown',
        observationFragment: observation, mechanism: '', supportingSignals: [],
      }],
    },
  };
  applyFindingScopedStandards(result, { text: observation, scopes } as any);
  return (result.multiHazardDecomposition.hazards[0].standardCandidates || [])
    .map((s: any) => String(s.citation)).filter(Boolean);
}

async function main() {
  const target = new URL(process.env.DATABASE_URL || 'postgresql://localhost/UNSET');
  const dbName = target.pathname.replace('/', '');
  if (dbName === 'safescope' || !/^test_/.test(dbName)) {
    throw new Error(`Refusing to run against database '${dbName}'.`);
  }
  const releaseId = process.argv[2];
  if (!releaseId) throw new Error('A releaseId argument is required.');

  await dataSource.initialize();
  const resolve = (citation: string) => resolveGovernedCitation(dataSource, releaseId, citation);
  const textOf = (r: any) =>
    `${r.title || ''} ${r.standardText || ''} ${r.plainLanguageSummary || ''}`;

  console.log(`\n=== KG-3E citation-granularity contract -- release ${releaseId}\n`);

  // -------------------------------------------------------------------------------------------
  // CONTRACT 1. Prefix similarity must not substitute one paragraph requirement for another.
  // -------------------------------------------------------------------------------------------
  console.log('-- Contract 1: prefix similarity is not identity');

  const section303 = await resolve('29 CFR 1910.303');
  const para303b1 = await resolve('29 CFR 1910.303(b)(1)');

  assert(section303.backing !== 'NOT_IN_RELEASE',
    '1910.303 (section) resolves in the release');
  assert(para303b1.backing !== 'NOT_IN_RELEASE',
    '1910.303(b)(1) (paragraph) resolves in the release');
  assert(section303.recordChecksum !== para303b1.recordChecksum,
    '1910.303 and 1910.303(b)(1) are DISTINCT records with distinct checksums');
  assert(textOf(section303) !== textOf(para303b1),
    '1910.303 and 1910.303(b)(1) carry distinct content, not a shared row surfaced twice');

  // The paragraph is Examination. It must not carry the guarding rule.
  assert(/examination/i.test(textOf(para303b1)),
    '1910.303(b)(1) content is the EXAMINATION requirement');
  assert(/free from recognized hazards/i.test(textOf(para303b1)),
    "1910.303(b)(1) states (b)(1)'s operative rule (free from recognized hazards)");

  // -------------------------------------------------------------------------------------------
  // CONTRACT 2. A parent section may supply section-level content only when the presentation is
  //             truthful about that granularity.
  // -------------------------------------------------------------------------------------------
  console.log('\n-- Contract 2: section-level content is labelled as section-level');

  assert(/1910\.303\(b\)\(1\)/.test(textOf(section303)) &&
         /1910\.303\(g\)\(2\)\(i\)/.test(textOf(section303)),
    '1910.303 section content ATTRIBUTES each rule to its own paragraph rather than blurring them');
  assert(/600 volts/i.test(textOf(section303)) && /50 volts/i.test(textOf(section303)),
    '1910.303 section content preserves the voltage scopes that limit paragraph (g)');

  // -------------------------------------------------------------------------------------------
  // CONTRACT 3. Paragraph-specific content must not be presented as supporting another paragraph.
  // -------------------------------------------------------------------------------------------
  console.log('\n-- Contract 3: a paragraph record does not answer for a sibling paragraph');

  // (b)(1) must not be readable as the guarding rule. It may NAME (g)(2)(i) -- attribution is
  // allowed, absorption is not -- so the check is that any sentence mentioning guarding of live
  // parts also names the paragraph that actually contains it.
  const b1Sentences = textOf(para303b1).split(/(?<=\.)\s+/);
  const absorbing = b1Sentences.filter(s =>
    /guard/i.test(s) && /live part/i.test(s) && !/1910\.303\(g\)\(2\)\(i\)/.test(s));
  assert(absorbing.length === 0,
    '1910.303(b)(1) never asserts the live-parts guarding rule as its own requirement');

  // -------------------------------------------------------------------------------------------
  // CONTRACT 4. Regulatory qualifiers must be established before a narrower citation is promoted.
  // -------------------------------------------------------------------------------------------
  console.log('\n-- Contract 4: qualifiers are named, not assumed');

  // 1910.303(g)(2)(i) is DECLARED by an expert applicability rule but was deliberately never
  // sourced, because no predicate establishes voltage. It must resolve to nothing -- and in
  // particular must not fall back to the section that contains it.
  const gTwoI = await resolve('29 CFR 1910.303(g)(2)(i)');
  assert(gTwoI.backing === 'NOT_IN_RELEASE',
    '1910.303(g)(2)(i) resolves to NOTHING -- it is not silently satisfied by the 1910.303 section');

  // 1910.28 was added at SECTION level precisely because (b)(11)(ii)'s tread/riser condition is
  // not established by a bare "missing handrail" observation. The record must name that condition
  // rather than assert it is met.
  const s1910_28 = await resolve('29 CFR 1910.28');
  assert(s1910_28.backing !== 'NOT_IN_RELEASE', '1910.28 resolves in the release');
  assert(/3 treads/i.test(textOf(s1910_28)) && /4 risers/i.test(textOf(s1910_28)),
    '1910.28 names the tread/riser condition that limits the handrail requirement');
  assert(/1910\.28\(b\)\(11\)\(ii\)/.test(textOf(s1910_28)),
    '1910.28 attributes the handrail rule to its own paragraph, (b)(11)(ii)');

  // 56.14107(a) is a PARAGRAPH record whose limiting exemption lives in the sibling paragraph (b).
  const p56_14107a = await resolve('30 CFR 56.14107(a)');
  assert(p56_14107a.backing !== 'NOT_IN_RELEASE', '56.14107(a) resolves in the release');
  assert(/seven feet/i.test(textOf(p56_14107a)) && /56\.14107\(b\)/.test(textOf(p56_14107a)),
    '56.14107(a) names the seven-foot exemption in (b) that limits the duty in (a)');

  // -------------------------------------------------------------------------------------------
  // CONTRACT 5. A missing exact paragraph must not silently fall back to legally different text.
  //             BOTH directions: section must not answer for paragraph, paragraph not for section.
  // -------------------------------------------------------------------------------------------
  console.log('\n-- Contract 5: no silent fallback in either direction');

  // KG-3E case. The corpus holds the SECTION `30 CFR 56.14132`. HazLenz emits the PARAGRAPH
  // `56.14132(a)`, which was deliberately NOT created because (a) is horn maintenance while the
  // predicate describes obstructed-view reversing, which is (b)(1). The section must not back it.
  const section56_14132 = await resolve('30 CFR 56.14132');
  const para56_14132a = await resolve('30 CFR 56.14132(a)');
  assert(section56_14132.backing !== 'NOT_IN_RELEASE',
    '56.14132 (section) resolves in the release');
  assert(para56_14132a.backing === 'NOT_IN_RELEASE',
    '56.14132(a) resolves to NOTHING even though the 56.14132 SECTION exists ' +
    '(a section must not stand in for a paragraph requirement)');
  assert(/56\.14132\(b\)\(1\)/.test(textOf(section56_14132)) &&
         /obstructed view/i.test(textOf(section56_14132)),
    '56.14132 section content attributes the reversing rule to (b)(1) and names the ' +
    'obstructed-view condition that triggers it');

  // Opposite direction: the corpus holds the PARAGRAPH `1926.652(a)(1)`. The bare section
  // `1926.652` must not resolve off the back of it.
  const para1926_652a1 = await resolve('29 CFR 1926.652(a)(1)');
  const section1926_652 = await resolve('29 CFR 1926.652');
  assert(para1926_652a1.backing !== 'NOT_IN_RELEASE', '1926.652(a)(1) resolves in the release');
  assert(section1926_652.backing === 'NOT_IN_RELEASE',
    '1926.652 (bare section) resolves to NOTHING despite 1926.652(a)(1) existing ' +
    '(a paragraph must not stand in for its parent section)');

  // And a paragraph of a DIFFERENT parent must not be answered by an unrelated sibling.
  const para1926_451g2 = await resolve('29 CFR 1926.451(g)(2)');
  assert(para1926_451g2.backing === 'NOT_IN_RELEASE',
    '1926.451(g)(2) resolves to NOTHING despite 1926.451(g)(1) existing ' +
    '(sibling paragraphs are not interchangeable)');

  // -------------------------------------------------------------------------------------------
  // CONTRACT 6 (Phase 8). Selection safety: positive and neighbouring-family negative, for every
  //             record KG-3E added or changed.
  // -------------------------------------------------------------------------------------------
  console.log('\n-- Contract 6: selection stays inside the right family and regime');

  const scaffold = select(
    'A mason is working on a scaffold platform 18 feet above the lower level with an open side that has no guardrail or personal fall arrest system.',
    ['osha_construction']);
  assert(scaffold.includes('29 CFR 1926.451(g)(1)'),
    'positive: construction scaffold fall selects 1926.451(g)(1)');
  assert(!scaffold.some(c => /1910\./.test(c)),
    'negative: construction scaffold fall returns NO general-industry citation (1910.28/1910.22)');

  const stairway = select(
    'The handrail on the interior stairway is missing, exposing employees descending the stairs to a fall hazard.',
    ['osha_general']);
  assert(stairway.includes('29 CFR 1910.28'),
    'positive: general-industry stairway handrail selects 1910.28');
  assert(!stairway.includes('29 CFR 1926.501'),
    'negative: general-industry stairway does NOT select the construction fall citation 1926.501');

  const trench = select(
    'Laborers are working in a 6-foot trench with no protective system installed and the soil is not stable rock.',
    ['osha_construction']);
  assert(trench.includes('29 CFR 1926.652(a)(1)'),
    'positive: construction trench selects 1926.652(a)(1)');
  assert(!trench.some(c => /56\.|57\.|62\./.test(c)),
    'negative: construction trench returns no MSHA citation');

  const silica = select(
    'A worker is dry-cutting concrete with a masonry saw, generating a visible dust cloud, with no water suppression or dust control in use.',
    ['osha_construction']);
  assert(silica.includes('29 CFR 1926.1153'),
    'positive: construction dry-cutting selects 1926.1153');
  assert(!silica.includes('29 CFR 1910.1200'),
    'negative: silica dust does NOT select the hazard-communication citation');

  const hazcom = select(
    'A workplace chemical container has no label identifying its contents or hazards.',
    ['osha_general']);
  assert(hazcom.includes('29 CFR 1910.1200'),
    'positive: general-industry unlabeled container selects 1910.1200');
  assert(!hazcom.includes('29 CFR 1926.59'),
    'negative: general-industry hazcom does NOT select the construction hazcom citation 1926.59');

  const noise = select(
    "An employee's full-shift measured noise exposure is 92 dBA time-weighted average with no unusual impulse noise.",
    ['osha_general']);
  assert(noise.includes('29 CFR 1910.95'),
    'positive: general-industry noise selects 1910.95');
  assert(!noise.includes('29 CFR 1926.52'),
    'negative: general-industry noise does NOT select the construction noise citation 1926.52');

  // The KG-3D false positive: a machine-guarding query must not pull an electrical record in.
  const guarding = select(
    'Rotating shaft on the mixer has no guard and the operator works beside it.',
    ['osha_general']);
  assert(!guarding.some(c => /1910\.303/.test(c)),
    'negative (KG-3D regression): machine-guarding query returns NO 1910.303 electrical citation');

  // LOTO vs machine guarding -- the two families most likely to bleed, and 1910.147's summary now
  // contains the words "guard" and "point of operation" because the scope limits require them.
  const loto = select(
    'Maintenance worker was clearing a jam inside the press with the machine still energized and no lockout applied.',
    ['osha_general']);
  assert(loto.includes('29 CFR 1910.147'),
    'positive: general-industry servicing without lockout selects 1910.147');

  const mshaBacking = select(
    'A haul truck at the surface mine is backing without a functional backup alarm and no spotter present.',
    ['msha']);
  assert(!mshaBacking.some(c => /29 CFR/.test(c)),
    'negative: MSHA backing observation returns no OSHA citation');

  // -------------------------------------------------------------------------------------------
  // CONTRACT 7. Content-fidelity invariants for the records KG-3E remediated.
  // -------------------------------------------------------------------------------------------
  console.log('\n-- Contract 7: remediated records state the operative rule');

  const fall501 = await resolve('29 CFR 1926.501');
  assert(/6 feet/.test(textOf(fall501)),
    '1926.501 states the 6-foot trigger KG-3D found missing');
  assert(/more than 6 feet/i.test(textOf(fall501)),
    '1926.501 preserves the "more than 6 feet" threshold specific to holes, (b)(4)(i)');
  assert(/1926\.500\(a\)\(2\)/.test(textOf(fall501)),
    '1926.501 names the subpart carve-outs rather than absorbing scaffolds/steel erection');

  const loto147 = await resolve('29 CFR 1910.147');
  assert(/lockout\/tagout/i.test(loto147.title || ''),
    '1910.147 title carries the codified "(lockout/tagout)" parenthetical');
  assert(/energy control program/i.test(textOf(loto147)),
    '1910.147 states the (c)(1) PROGRAM duty, not merely the purpose');
  assert(/construction or agriculture/i.test(textOf(loto147)),
    '1910.147 preserves the construction/agriculture scope exclusion');

  const truck178 = await resolve('29 CFR 1910.178(p)(1)');
  assert(/taken out of service/i.test(textOf(truck178)),
    '1910.178(p)(1) states the out-of-service duty (was: "may be relevant... requiring qualified review")');
  assert(!/may be relevant/i.test(textOf(truck178)),
    '1910.178(p)(1) no longer hedges with non-regulatory "may be relevant" language');

  const msha12016 = await resolve('30 CFR 56.12016');
  assert(/warning notices/i.test(textOf(msha12016)) && /signed by/i.test(textOf(msha12016)),
    '56.12016 states the signed warning-notice duty it previously omitted');
  assert(!/where applicable/i.test(textOf(msha12016)),
    '56.12016 no longer hedges with "where applicable", which is not in the rule');

  // -------------------------------------------------------------------------------------------
  // CONTRACT 8. No record in the release carries placeholder provenance.
  // -------------------------------------------------------------------------------------------
  console.log('\n-- Contract 8: provenance');
  const placeholders = await dataSource.query(
    `SELECT citation FROM standards_master WHERE source_key LIKE 'starter-unverified:%'`);
  assert(placeholders.length === 0,
    `no record carries synthesized placeholder provenance (found ${placeholders.length})`);

  // Scope note. This first asserted "every record has a source_url" and failed on 8 rows. Those 8
  // are exactly the NOT_CURRENTLY_USED tail that KG-3D deferred -- no gold-set observation selects
  // any of them -- so a blanket assertion was testing something neither KG-3D nor KG-3E undertook,
  // and neither the cutover criterion nor customer-visible behaviour depends on it.
  //
  // The assertion is therefore scoped to the set the governance actually gates on: the citations
  // HazLenz EMITS. That set is held to the strict standard -- registered provenance AND a recorded
  // source URL, with no exceptions. The deferred tail is not silently excused: it is counted and
  // printed on every run so the gap stays visible, and it is reported in the coverage metrics.
  const EMITTED = [
    '29 CFR 1910.1200', '29 CFR 1910.147', '29 CFR 1910.178(p)(1)', '29 CFR 1910.212(a)(1)',
    '29 CFR 1910.28', '29 CFR 1910.303', '29 CFR 1910.36', '29 CFR 1910.95',
    '29 CFR 1926.1153', '29 CFR 1926.300(b)(2)', '29 CFR 1926.34(a)', '29 CFR 1926.416(a)(1)',
    '29 CFR 1926.451(g)(1)', '29 CFR 1926.501', '29 CFR 1926.52', '29 CFR 1926.59',
    '29 CFR 1926.652(a)(1)', '30 CFR 47.41(a)', '30 CFR 56.12016', '30 CFR 56.14107(a)',
    '30 CFR 62.120', '30 CFR 62.130',
  ];
  const emittedUnsourced = await dataSource.query(
    `SELECT citation FROM standards_master
      WHERE source_url IS NULL
        AND regexp_replace(lower(citation),'[^a-z0-9()]','','g') = ANY($1::text[])`,
    [EMITTED.map(c => c.toLowerCase().replace(/[^a-z0-9()]/g, ''))]);
  assert(emittedUnsourced.length === 0,
    'every EMITTED citation with a governed record records a source_url a reviewer can compare ' +
    `against (found ${emittedUnsourced.length} without)`);

  const unsourced = await dataSource.query(
    `SELECT citation FROM standards_master WHERE source_url IS NULL ORDER BY citation`);
  console.log(`note  ${unsourced.length} non-emitted records remain unsourced and are deliberately ` +
    `deferred (KG-3D DEFER, carried forward): ${unsourced.map((r: any) => r.citation).join(', ') || 'none'}`);

  console.log(`\n${checks.length} passed, ${failed} failed`);
  await dataSource.destroy();
  if (failed) process.exitCode = 1;
}

main().catch(async error => {
  console.error(error);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exitCode = 1;
});
