/**
 * KG-3F (Phases 11-12) -- the rule-to-corpus governance diagnostic.
 *
 * KG-3E found ~30 citations DECLARED by expert applicability rules but emitted by no gold-set
 * observation and backed by no governed record. That count was a by-product of the KG-3E work queue;
 * this recomputes it from scratch across EVERY declaring surface, not just the expert-rule file, and
 * classifies each citation rather than merely counting it.
 *
 * Maps: expert rule -> hazard family -> citation -> governed record -> source identity -> effective
 * approval state, and flags the governance gaps the brief enumerates.
 *
 * This is a DIAGNOSTIC. It is deliberately not wired into any customer path.
 *
 * Usage: DATABASE_URL=... npx ts-node scripts/report-kg3f-rule-to-corpus.ts <releaseId>
 */
import 'dotenv/config';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { dataSource } from '../src/database/data-source';
import { applyFindingScopedStandards } from '../src/safescope-v2/evidence/evidence-foundation';
import { resolveGovernedCitation } from '../src/standards/releases/governed-corpus-lookup';
import { releaseCitationKey } from '../src/standards/releases/citation-identity';
import { parseCitation } from '../src/applicable-standards/citation-structure';

const SRC = join(__dirname, '..', 'src');
const TRACKED_GOLD_SET = join(__dirname, '..', '..',
  'verification/insite-core-closure-standards-validation-2026-08-18/standards-gold-set/gold-set-script-v3.ts');
const EXPECTED_GOLD_SET_SHA256 =
  '93184abc677cf7a50d5f9ac11c4317148618acd74a26fe20fb37e690df647cd3';

/** Every file that DECLARES a citation HazLenz could emit. KG-3E looked only at the first. */
const DECLARING_SURFACES = [
  'safescope-v2/inspection-intelligence/standard-applicability.rules.ts',
  'safescope-v2/inspection-intelligence/inspection-intelligence-expansion.rules.ts',
  'safescope-v2/inspection-intelligence/msha-inspection-intelligence.service.ts',
  'safescope-v2/evidence/evidence-foundation.ts',
  'safescope-v2/safescope-v2.service.ts',
];

interface GoldCase {
  id: string; area: string;
  regime: 'osha_general_industry' | 'osha_construction' | 'msha';
  observation: string; expectedCitations: string[]; mustNotReturn: string[];
}

function loadGoldSet(): GoldCase[] {
  const source = readFileSync(TRACKED_GOLD_SET, 'utf8');
  const sha = createHash('sha256').update(source).digest('hex');
  if (sha !== EXPECTED_GOLD_SET_SHA256) throw new Error(`Gold set hash mismatch: ${sha}`);
  const start = source.indexOf('const GOLD_SET: GoldCase[] = [');
  const open = source.indexOf('[', start), end = source.indexOf('\n];', open);
  // eslint-disable-next-line no-new-func
  return new Function(`return ${source.slice(open, end + 2)};`)() as GoldCase[];
}

const scopeToText = (r: GoldCase['regime']) =>
  r === 'msha' ? ['msha'] : r === 'osha_construction' ? ['osha_construction'] : ['osha_general'];

function emitted(c: GoldCase): string[] {
  const result: any = {
    multiHazardDecomposition: {
      hazards: [{
        hazardId: 'kg3f', domainId: 'unknown', hazardFamily: 'unknown',
        observationFragment: c.observation, mechanism: '', supportingSignals: [],
      }],
    },
  };
  applyFindingScopedStandards(result, { text: c.observation, scopes: scopeToText(c.regime) } as any);
  return (result.multiHazardDecomposition.hazards[0].standardCandidates || [])
    .map((s: any) => String(s.citation)).filter(Boolean);
}

/**
 * Citations declared anywhere in the selection surfaces, with the family, file and EXPERT RULE
 * that declare them.
 *
 * KG-3F Phase 11-12 closure: the surface file alone is not enough to act on a gap. "1926.502 is
 * declared in standard-applicability.rules.ts" does not tell a remediator which rule to inspect,
 * and several surfaces declare dozens of citations. `nearestRuleId` walks backwards from the match
 * to the enclosing `id: '...'` so each declaration names the rule that owns it.
 */
function declaredCitations(): Map<string, {
  families: Set<string>; surfaces: Set<string>; rules: Set<string>;
}> {
  const out = new Map<string, { families: Set<string>; surfaces: Set<string>; rules: Set<string> }>();
  const add = (cit: string, family: string, surface: string, rule: string) => {
    const key = cit.trim();
    if (!/\d+\.\d/.test(key)) return;
    const e = out.get(key)
      ?? { families: new Set<string>(), surfaces: new Set<string>(), rules: new Set<string>() };
    if (family) e.families.add(family);
    e.surfaces.add(surface);
    if (rule) e.rules.add(`${surface}#${rule}`);
    out.set(key, e);
  };
  /** The `id: '...'` that most recently precedes `at` — the rule the declaration sits inside. */
  const nearestRuleId = (src: string, at: number): string => {
    const before = src.slice(0, at);
    const ids = [...before.matchAll(/\bid:\s*'([^']+)'/g)];
    return ids.length ? ids[ids.length - 1][1] : '';
  };
  for (const rel of DECLARING_SURFACES) {
    let src: string;
    try { src = readFileSync(join(SRC, rel), 'utf8'); } catch { continue; }
    const short = rel.split('/').pop() as string;
    // `standardCitation: '...'` preceded by a hazardFamily, and bare `citation: '...'` forms.
    const re = /hazardFamily:\s*'([^']+)'[\s\S]{0,400}?standardCitation:\s*'([^']+)'/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) add(m[2], m[1], short, nearestRuleId(src, m.index));
    const re2 = /\bcitation:\s*'((?:29|30)\s+CFR\s+[^']+|\d+\.\d[^']*)'/g;
    while ((m = re2.exec(src))) add(m[1], '', short, nearestRuleId(src, m.index));
    const re3 = /decision\(e,\s*'([^']+)'/g;
    while ((m = re3.exec(src))) add(m[1], '', short, nearestRuleId(src, m.index));
  }
  return out;
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

  const cases = loadGoldSet();
  const emittedSet = new Set<string>();
  for (const c of cases) for (const cit of emitted(c)) emittedSet.add(cit);

  const declared = declaredCitations();
  const all = new Set<string>([...declared.keys(), ...emittedSet]);

  const rows: any[] = [];
  for (const citation of all) {
    const key = releaseCitationKey(citation);
    const governed = await resolveGovernedCitation(dataSource, releaseId, citation);
    const inRelease = governed.backing !== 'NOT_IN_RELEASE';

    // Normalisation must strip the AGENCY PREFIX as well as punctuation. `standards_master` stores
    // some citations bare ("1910.212(a)(1)") and others prefixed ("29 CFR 1910.212(a)(1)"); matching
    // on punctuation alone left "29cfr1910212(a)(1)" unequal to "1910212(a)(1)", so the lookup
    // missed and every such record was falsely flagged `governedRecordWithoutSource`.
    const master = (await dataSource.query(
      `SELECT citation, source_key, source_url, retrieval_date FROM standards_master
        WHERE regexp_replace(regexp_replace(lower(citation), '^(29|30)\\s*cfr\\s*', ''), '[^a-z0-9()]','','g')
            = regexp_replace(regexp_replace(lower($1),      '^(29|30)\\s*cfr\\s*', ''), '[^a-z0-9()]','','g')
        LIMIT 1`, [citation]))[0];

    const rec = (await dataSource.query(
      `SELECT "recordChecksum" FROM regulatory_release_records
        WHERE "releaseId"=$1 AND "citationKey"=$2 LIMIT 1`, [releaseId, key]))[0];

    const effective = rec ? (await dataSource.query(
      `SELECT decision FROM regulatory_release_record_reviews
        WHERE "releaseId"=$1 AND "citationKey"=$2 AND "recordChecksum"=$3
        ORDER BY "decidedAt" DESC LIMIT 1`, [releaseId, key, rec.recordChecksum]))[0]?.decision ?? null
      : null;

    const d = declared.get(citation);
    const isEmitted = emittedSet.has(citation);
    const parsed = parseCitation(citation);

    // Is another citation in the corpus the same section (parent/child ambiguity)?
    const relatives = [...all].filter(o => o !== citation && (() => {
      const po = parseCitation(o);
      return !!parsed && !!po && po.part === parsed.part && po.section === parsed.section;
    })());

    let classification: string;
    let reason: string;
    if (isEmitted && effective === 'approved') {
      classification = 'ALREADY_GOVERNED';
      reason = 'Emitted and reviewer-approved for this release.';
    } else if (isEmitted && inRelease) {
      classification = 'NEEDS_SOURCE';
      reason = 'Emitted with a governed record present but not effectively approved.';
    } else if (isEmitted && !inRelease) {
      classification = 'WRONG_CITATION';
      reason = 'HazLenz emits this citation but the release holds no exact governed record. Either ' +
        'the corpus must gain it or the predicate must stop emitting it.';
    } else if (!d) {
      classification = 'UNREACHABLE_RULE';
      reason = 'Not declared by any selection surface and not emitted.';
    } else if (inRelease && effective === 'approved') {
      classification = 'ALREADY_GOVERNED';
      reason = 'Declared but not exercised by the gold set; a governed approved record already exists.';
    } else if (inRelease) {
      classification = 'VALID_RULE_NOT_EXERCISED';
      reason = 'Declared with a governed record present, but no gold-set observation selects it.';
    } else {
      classification = 'NOT_SAFE_TO_GOVERN_YET';
      reason = 'Declared by a rule, no governed record, and no measured emission — sourcing it would ' +
        'be speculative until a predicate demonstrably selects it.';
    }

    // REACHABILITY is a property of the rule, not of the corpus, and it is the axis that decides
    // whether a gap is worth sourcing at all. Three states, measured rather than assumed:
    //   EMITTED          -- a gold-set observation demonstrably selects it;
    //   DECLARED_UNPROVEN-- a rule declares it but no measured observation reaches it. NOT proof of
    //                       dead code: the gold set is a sample, so this is "unproven", not "dead";
    //   UNREACHABLE      -- present in the corpus/emitted universe with no declaring rule at all.
    const reachability = isEmitted ? 'EMITTED'
      : d ? 'DECLARED_UNPROVEN'
      : 'UNREACHABLE';

    // SOURCE STATE, separated from approval state. A record can be governed and approved while its
    // live row still carries no verifiable source URL (KG-3D deferred exactly these), and the two
    // failures need different remediation.
    const sourceState = !master ? 'NO_LIVE_RECORD'
      : !master.source_key ? 'NO_SOURCE_KEY'
      : String(master.source_key).startsWith('starter-unverified:') ? 'PLACEHOLDER_SOURCE'
      : !master.source_url ? 'SOURCED_NO_URL'
      : 'SOURCED';

    // Parent/child is directional, and the direction is what tells a remediator which record to
    // fix: emitting a child when only the parent is governed is a different defect from emitting a
    // parent when the corpus holds the operative paragraph.
    const parentChild = relatives.map(o => ({
      citation: o,
      relation: o.length === citation.length ? 'SIBLING'
        : citation.startsWith(o.replace(/\s+/g, ' ')) || o.length < citation.length ? 'PARENT_OF_THIS'
        : 'CHILD_OF_THIS',
    }));

    rows.push({
      citation,
      declaredBy: d ? [...d.surfaces] : [],
      expertRules: d ? [...d.rules] : [],
      hazardFamilies: d ? [...d.families] : [],
      duplicateDeclarationSurfaces: d && d.surfaces.size > 1 ? [...d.surfaces] : [],
      reachability,
      emittedByGoldSet: isEmitted,
      governedRecordExists: inRelease,
      backingStatus: governed.backing === 'NOT_IN_RELEASE' ? 'CITATION_ONLY' : governed.backing,
      sourceState,
      sourceKey: master?.source_key ?? null,
      sourceUrl: master?.source_url ?? null,
      effectiveApproval: effective,
      sameSectionRelatives: relatives,
      parentChildRelationships: parentChild,
      classification,
      reason,
      flags: {
        ruleCitationWithNoGovernedRecord: !!d && !inRelease,
        governedRecordWithoutSource: inRelease && !master?.source_url,
        emittedWithoutExactBacking: isEmitted && !inRelease,
        approvedButUnused: effective === 'approved' && !isEmitted && !d,
        parentChildAmbiguity: relatives.length > 0,
        declaredOnMultipleSurfaces: !!d && d.surfaces.size > 1,
      },
    });
  }

  rows.sort((a, b) =>
    Number(b.emittedByGoldSet) - Number(a.emittedByGoldSet) || a.citation.localeCompare(b.citation));

  const byClass: Record<string, number> = {};
  for (const r of rows) byClass[r.classification] = (byClass[r.classification] ?? 0) + 1;
  const flagTotals: Record<string, number> = {};
  for (const r of rows) for (const [k, v] of Object.entries(r.flags)) if (v) flagTotals[k] = (flagTotals[k] ?? 0) + 1;

  const out = {
    releaseId,
    generatedFrom: {
      declaringSurfaces: DECLARING_SURFACES,
      goldSetCases: cases.length,
      note: 'Declared citations are gathered from EVERY selection surface, not only the expert-rule ' +
        'file KG-3E sampled. Emission is measured live via applyFindingScopedStandards().',
    },
    totals: {
      distinctCitations: rows.length,
      emitted: rows.filter(r => r.emittedByGoldSet).length,
      declaredNotEmitted: rows.filter(r => !r.emittedByGoldSet && r.declaredBy.length).length,
      emittedAndApproved: rows.filter(r => r.emittedByGoldSet && r.effectiveApproval === 'approved').length,
    },
    /**
     * KG-3F Phase 11-12: the categories quantified SEPARATELY, because they have different owners
     * and different remedies. Collapsing them into one "gap" number is what made the 137
     * declared-but-unemitted citations look like a sourcing backlog when most of them are not
     * safe to govern at all yet.
     */
    quantified: {
      emittedAndGoverned: rows.filter(r => r.emittedByGoldSet && r.governedRecordExists).length,
      emittedButMissingRecord: rows.filter(r => r.emittedByGoldSet && !r.governedRecordExists).length,
      declaredButUnemitted: rows.filter(r => r.reachability === 'DECLARED_UNPROVEN').length,
      unsafeToGovernYet: rows.filter(r => r.classification === 'NOT_SAFE_TO_GOVERN_YET').length,
      duplicateDeclarations: rows.filter(r => r.duplicateDeclarationSurfaces.length > 0).length,
      parentChildAmbiguities: rows.filter(r => r.parentChildRelationships.length > 0).length,
      unreachableNoDeclaringRule: rows.filter(r => r.reachability === 'UNREACHABLE').length,
      bySourceState: rows.reduce((acc: Record<string, number>, r) => {
        acc[r.sourceState] = (acc[r.sourceState] ?? 0) + 1; return acc;
      }, {}),
    },
    byClassification: byClass,
    flagTotals,
    rows,
  };

  const dest = process.env.REPORT_OUT;
  if (dest) writeFileSync(dest, JSON.stringify(out, null, 2));

  const pad = (s: any, n: number) => String(s).padEnd(n);
  console.log(`\nKG-3F RULE-TO-CORPUS MAP — release ${releaseId}\n`);
  console.log(pad('CITATION', 28) + pad('EMIT', 6) + pad('REC', 5) + pad('APPR', 6) + 'CLASSIFICATION');
  for (const r of rows) {
    console.log(pad(r.citation, 28) + pad(r.emittedByGoldSet ? 'yes' : '-', 6) +
      pad(r.governedRecordExists ? 'yes' : '-', 5) +
      pad(r.effectiveApproval === 'approved' ? 'YES' : '-', 6) + r.classification);
  }
  console.log('\nBY CLASSIFICATION:');
  for (const [k, v] of Object.entries(byClass).sort((a, b) => b[1] - a[1])) console.log(`  ${pad(k, 34)} ${v}`);
  console.log('\nGOVERNANCE FLAGS:');
  for (const [k, v] of Object.entries(flagTotals).sort((a, b) => b[1] - a[1])) console.log(`  ${pad(k, 34)} ${v}`);
  console.log('\nQUANTIFIED SEPARATELY:');
  for (const [k, v] of Object.entries(out.quantified)) {
    if (typeof v === 'number') console.log(`  ${pad(k, 34)} ${v}`);
  }
  console.log('  bySourceState:');
  for (const [k, v] of Object.entries(out.quantified.bySourceState)) console.log(`    ${pad(k, 32)} ${v}`);
  console.log(`\ndistinct ${rows.length} | emitted ${out.totals.emitted} | ` +
    `emitted+approved ${out.totals.emittedAndApproved} | declared-not-emitted ${out.totals.declaredNotEmitted}`);
  if (dest) console.log(`\nWrote ${dest}`);

  await dataSource.destroy();
}

main().catch(async e => {
  console.error(e);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exit(1);
});
