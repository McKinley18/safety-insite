/**
 * KG-3E (Phase 1) -- the authoritative remediation work queue.
 *
 * WHY THIS EXISTS RATHER THAN REUSING KG-3D'S MATRIX. `report-cutover-coverage-matrix.ts` reads its
 * emitted-citation list from a STATIC KG-3C artifact (`kg-3c/display-contract-matrix.json`). That
 * was correct for KG-3D, which was measuring the same corpus KG-3C had just measured. It is not
 * safe for KG-3E, whose whole job is to change the corpus: a frozen list cannot show a citation
 * that selection emits but the snapshot never captured, and KG-3E is explicitly told not to rely on
 * memory or hard-coded assumptions.
 *
 * So this measures emission LIVE, by running the real in-code selection engine
 * (`applyFindingScopedStandards`, the same entry point KG-3A identified as the function that
 * actually selects citations) over the tracked, hash-verified 31-case gold set, and counting what
 * comes back. Usage counts here are "how many gold-set observations select this citation" -- a
 * measured usage signal, not a production telemetry count, and it is labelled as such.
 *
 * It then joins each emitted citation to current corpus state and classifies it. Per the KG-3E
 * brief, high usage raises review PRIORITY and is never evidence that content is correct.
 */
import 'dotenv/config';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { dataSource } from '../src/database/data-source';
import { applyFindingScopedStandards } from '../src/safescope-v2/evidence/evidence-foundation';
import { resolveGovernedCitation } from '../src/standards/releases/governed-corpus-lookup';
import { resolveStandardsBacking } from '../src/standards/display/standards-backing-contract';
import { releaseCitationKey } from '../src/standards/releases/citation-identity';

const TRACKED_GOLD_SET = join(__dirname, '..', '..',
  'verification/insite-core-closure-standards-validation-2026-08-18/standards-gold-set/gold-set-script-v3.ts');
const EXPECTED_GOLD_SET_SHA256 =
  '93184abc677cf7a50d5f9ac11c4317148618acd74a26fe20fb37e690df647cd3';

const EXPERT_RULES = join(__dirname, '..',
  'src/safescope-v2/inspection-intelligence/standard-applicability.rules.ts');

interface GoldCase {
  id: string; area: string;
  regime: 'osha_general_industry' | 'osha_construction' | 'msha';
  observation: string; expectedCitations: string[]; mustNotReturn: string[];
  authoritativeSource: string; rationale: string;
}

function loadTrackedGoldSet(): { cases: GoldCase[]; sha256: string } {
  const source = readFileSync(TRACKED_GOLD_SET, 'utf8');
  const sha256 = createHash('sha256').update(source).digest('hex');
  if (sha256 !== EXPECTED_GOLD_SET_SHA256) {
    throw new Error(`Tracked gold set hash mismatch: expected ${EXPECTED_GOLD_SET_SHA256}, got ${sha256}.`);
  }
  const start = source.indexOf('const GOLD_SET: GoldCase[] = [');
  const open = source.indexOf('[', start);
  const end = source.indexOf('\n];', open);
  if (start < 0 || end < 0) throw new Error('Could not locate the GOLD_SET literal.');
  // eslint-disable-next-line no-new-func
  return { cases: new Function(`return ${source.slice(open, end + 2)};`)() as GoldCase[], sha256 };
}

const scopeToText = (regime: GoldCase['regime']): string[] =>
  regime === 'msha' ? ['msha']
    : regime === 'osha_construction' ? ['osha_construction']
      : ['osha_general'];

/** Runs the real in-code selection engine and returns the citations it emits. */
function emittedCitations(c: GoldCase): string[] {
  const result: any = {
    multiHazardDecomposition: {
      hazards: [{
        hazardId: 'kg3e-queue-1', domainId: 'unknown', hazardFamily: 'unknown',
        observationFragment: c.observation, mechanism: '', supportingSignals: [],
      }],
    },
  };
  applyFindingScopedStandards(result, { text: c.observation, scopes: scopeToText(c.regime) } as any);
  return (result.multiHazardDecomposition.hazards[0].standardCandidates || [])
    .map((s: any) => String(s.citation)).filter(Boolean);
}

/**
 * The citations the expert applicability rules DECLARE. This is a second, independent emission
 * surface from the gold-set measurement: a rule can be declared but not fire for any gold-set
 * observation. Recorded so the queue can distinguish "HazLenz never emits this" from "the gold set
 * happens not to exercise it" -- a distinction the static KG-3C list could not make.
 */
function declaredRuleCitations(): Map<string, string> {
  const src = readFileSync(EXPERT_RULES, 'utf8');
  const out = new Map<string, string>();
  const re = /hazardFamily:\s*'([^']+)'[\s\S]{0,400}?standardCitation:\s*'([^']+)'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) out.set(m[2], m[1]);
  return out;
}

/**
 * Content adjudications carried forward from KG-3D §6, each pinned to the exact record checksum the
 * adjudication was made against. A CONTENT_DIFF_REQUIRED verdict only still applies if the content
 * has not changed since -- so the checksum is re-checked at runtime rather than trusted. If a
 * checksum no longer matches, the verdict is treated as stale and the record re-enters normal
 * review, which is the same change-detection discipline the approval mechanism uses.
 */
const PRIOR_CONTENT_ADJUDICATION: Record<string, { checksum: string; verdict: string; reason: string }> = {
  '29 CFR 1926.501': {
    checksum: '0a2b948e7b0a',
    verdict: 'CONTENT_DIFF_REQUIRED',
    reason: 'KG-3D: "fall protection… at applicable elevations or conditions" states no requirement — ' +
      'it omits the 6-foot trigger that is the operative fact.',
  },
  '29 CFR 1910.147': {
    checksum: 'e9a59a7eb938',
    verdict: 'CONTENT_DIFF_REQUIRED',
    reason: 'KG-3D: states the purpose, not the energy-control-program requirement; title omits "(lockout/tagout)".',
  },
  '30 CFR 56.14107(a)': {
    checksum: '8d4f5413952e',
    verdict: 'CONTENT_DIFF_REQUIRED',
    reason: 'KG-3D: omits (b), the seven-foot exemption that materially limits the rule.',
  },
};

const jurisdictionOf = (citation: string) =>
  /30 CFR/.test(citation) ? 'MSHA/mining'
    : /1926/.test(citation) ? 'OSHA/construction'
      : 'OSHA/general industry';

async function main() {
  const target = new URL(process.env.DATABASE_URL || 'postgresql://localhost/UNSET');
  const dbName = target.pathname.replace('/', '');
  if (dbName === 'safescope' || !/^test_/.test(dbName)) {
    throw new Error(`Refusing to run against database '${dbName}'.`);
  }
  const releaseId = process.argv[2];
  if (!releaseId) throw new Error('A releaseId argument is required.');

  await dataSource.initialize();

  // ---- 1. measure emission live over the tracked gold set --------------------------------------
  const { cases, sha256 } = loadTrackedGoldSet();
  const usage = new Map<string, { count: number; caseIds: string[]; regimes: Set<string>; areas: Set<string> }>();
  for (const c of cases) {
    for (const citation of new Set(emittedCitations(c))) {
      const e = usage.get(citation) ?? { count: 0, caseIds: [], regimes: new Set(), areas: new Set() };
      e.count += 1; e.caseIds.push(c.id); e.regimes.add(c.regime); e.areas.add(c.area);
      usage.set(citation, e);
    }
  }

  const declared = declaredRuleCitations();

  // ---- 2. join to current corpus state ---------------------------------------------------------
  const all = new Set<string>([...usage.keys(), ...declared.keys()]);
  const rows: any[] = [];

  for (const citation of all) {
    const key = releaseCitationKey(citation);
    const governed = await resolveGovernedCitation(dataSource, releaseId, citation);
    const backing = resolveStandardsBacking({ governed } as any);
    const u = usage.get(citation);

    const master = await dataSource.query(
      `SELECT citation, title, source_key, source_url, retrieval_date
         FROM standards_master WHERE regexp_replace(lower(citation),'[^a-z0-9()]','','g')
              = regexp_replace(lower($1),'[^a-z0-9()]','','g') LIMIT 1`, [citation]);
    const m = master[0];

    const record = await dataSource.query(
      `SELECT "recordChecksum","reviewState","reviewStateReason"
         FROM regulatory_release_records WHERE "releaseId"=$1 AND "citationKey"=$2 LIMIT 1`,
      [releaseId, key]);
    const rec = record[0];

    const effective = rec ? (await dataSource.query(
      `SELECT decision FROM regulatory_release_record_reviews
        WHERE "releaseId"=$1 AND "citationKey"=$2 AND "recordChecksum"=$3
        ORDER BY "decidedAt" DESC LIMIT 1`, [releaseId, key, rec.recordChecksum]))[0]?.decision ?? null
      : null;

    const placeholder = typeof m?.source_key === 'string' && m.source_key.startsWith('starter-unverified:');
    const emitted = Boolean(u);

    // ---- 3. classify -----------------------------------------------------------------------------
    // Re-validate any carried-forward content verdict against the CURRENT checksum before using it.
    const prior = PRIOR_CONTENT_ADJUDICATION[citation];
    const priorStillApplies = Boolean(
      prior && rec && String(rec.recordChecksum).startsWith(prior.checksum));
    const priorAdjudication = !prior ? null : {
      verdict: prior.verdict,
      reason: prior.reason,
      adjudicatedAgainstChecksum: prior.checksum,
      stillApplies: priorStillApplies,
      note: priorStillApplies
        ? 'Record content is unchanged since the KG-3D adjudication, so the verdict still stands.'
        : 'Record content has changed since the KG-3D adjudication; the verdict is stale and the ' +
          'record re-enters normal review.',
    };

    let classification: string;
    let reason: string;
    if (priorStillApplies) {
      // Content correctness dominates: a record whose stored text misstates the law cannot be
      // approved no matter how complete its provenance is. Any missing source metadata is recorded
      // as an ADDITIONAL blocker rather than replacing this one.
      classification = 'CONTENT_DIFF_REQUIRED';
      reason = prior!.reason +
        (m?.source_url ? '' : ' Additionally blocked: no recorded source_url to review against.');
    } else if (!emitted && !rec) {
      classification = 'DECLARED_BUT_NOT_EMITTED_NO_RECORD';
      reason = 'An expert applicability rule declares this citation, but no gold-set observation ' +
        'selects it and no governed record exists. Not a cutover blocker today; a coverage risk if the rule fires.';
    } else if (!emitted) {
      classification = 'NOT_CURRENTLY_USED';
      reason = 'Governed record exists; no gold-set observation selects this citation.';
    } else if (!rec) {
      classification = 'MISSING_GOVERNED_RECORD';
      reason = 'HazLenz emits this citation and the release holds no governed record for it. Direct cutover blocker.';
    } else if (placeholder) {
      classification = 'PLACEHOLDER_SOURCE';
      reason = `Provenance is synthesized (${m.source_key}); placeholder provenance can never confer backing.`;
    } else if (effective === 'approved') {
      classification = 'APPROVED_GOVERNED_CONTENT';
      reason = 'Reviewer-approved, checksum-bound, effective against the current record.';
    } else if (!m?.source_url) {
      classification = 'SOURCE_METADATA_REQUIRED';
      reason = 'Registered source key but no recorded source_url/retrieval_date, so no reviewer can ' +
        'compare the stored text against anything. Blocks substantive review.';
    } else if (/CFR-20\d\d-title/.test(String(m.source_url))) {
      classification = 'SOURCE_URL_REFRESH_REQUIRED';
      reason = `source_url points at a dated annual CFR edition (${String(m.source_url).match(/CFR-(20\d\d)/)?.[1]}), ` +
        'not a current-as-of authority. Content may still be correct; classified separately from content correctness.';
    } else {
      classification = 'READY_FOR_EXACT_REVIEW';
      reason = 'Registered provenance and a recorded source URL; awaiting substantive clause-level review.';
    }

    rows.push({
      citation,
      citationKey: key,
      jurisdiction: jurisdictionOf(citation),
      hazardFamily: declared.get(citation) ?? 'not-declared-by-expert-rule',
      emittedByGoldSet: emitted,
      measuredUsageCount: u?.count ?? 0,
      usageCategory: !u ? 'none' : u.count >= 3 ? 'high' : u.count === 2 ? 'medium' : 'low',
      goldSetCaseIds: u?.caseIds ?? [],
      goldSetAreas: u ? [...u.areas] : [],
      declaredByExpertRule: declared.has(citation),
      governedRecordExists: Boolean(rec),
      masterCitationStored: m?.citation ?? null,
      title: m?.title ?? null,
      reviewState: rec?.reviewState ?? null,
      effectiveApproval: effective,
      recordChecksum: rec?.recordChecksum ?? null,
      sourceKey: m?.source_key ?? null,
      sourceUrl: m?.source_url ?? null,
      retrievalDate: m?.retrieval_date ?? null,
      placeholderProvenance: placeholder,
      backingStatus: backing.backingStatus,
      priorAdjudication,
      classification,
      reason,
    });
  }

  // ---- 4. review order: emitted first, then usage desc, then blocker severity -------------------
  const severity: Record<string, number> = {
    CONTENT_DIFF_REQUIRED: -1,
    MISSING_GOVERNED_RECORD: 0, PLACEHOLDER_SOURCE: 1, SOURCE_METADATA_REQUIRED: 2,
    SOURCE_URL_REFRESH_REQUIRED: 3, READY_FOR_EXACT_REVIEW: 4, APPROVED_GOVERNED_CONTENT: 5,
    NOT_CURRENTLY_USED: 6, DECLARED_BUT_NOT_EMITTED_NO_RECORD: 7,
  };
  rows.sort((a, b) =>
    Number(b.emittedByGoldSet) - Number(a.emittedByGoldSet) ||
    b.measuredUsageCount - a.measuredUsageCount ||
    severity[a.classification] - severity[b.classification] ||
    a.citation.localeCompare(b.citation));
  rows.forEach((r, i) => { r.proposedReviewOrder = i + 1; });

  const emittedRows = rows.filter(r => r.emittedByGoldSet);
  const byClass: Record<string, number> = {};
  for (const r of rows) byClass[r.classification] = (byClass[r.classification] ?? 0) + 1;

  const out = {
    releaseId,
    generatedFrom: {
      emissionMeasurement: 'live — applyFindingScopedStandards() over the tracked gold set',
      goldSetPath: 'verification/insite-core-closure-standards-validation-2026-08-18/standards-gold-set/gold-set-script-v3.ts',
      goldSetSha256: sha256,
      goldSetCases: cases.length,
      declaredRuleSurface: 'backend/src/safescope-v2/inspection-intelligence/standard-applicability.rules.ts',
      usageCountMeaning: 'number of gold-set observations whose selection returns this citation; a ' +
        'measured usage signal for PRIORITISATION ONLY. High usage is never evidence of correctness.',
    },
    totals: {
      distinctCitationsConsidered: rows.length,
      emittedByGoldSet: emittedRows.length,
      declaredByExpertRuleOnly: rows.filter(r => !r.emittedByGoldSet && r.declaredByExpertRule).length,
      emittedApproved: emittedRows.filter(r => r.classification === 'APPROVED_GOVERNED_CONTENT').length,
      emittedMissingRecord: emittedRows.filter(r => r.classification === 'MISSING_GOVERNED_RECORD').length,
      emittedContentDiffRequired: emittedRows.filter(r => r.classification === 'CONTENT_DIFF_REQUIRED').length,
    },
    byClassification: byClass,
    rows,
  };

  const dest = process.env.REPORT_OUT;
  if (dest) writeFileSync(dest, JSON.stringify(out, null, 2));

  const pad = (s: any, n: number) => String(s).padEnd(n);
  console.log(`\nKG-3E WORK QUEUE — release ${releaseId}`);
  console.log(`gold set ${cases.length} cases, sha256 ${sha256.slice(0, 16)}…\n`);
  console.log(pad('#', 4) + pad('CITATION', 28) + pad('USE', 5) + pad('FAMILY', 26) + 'CLASSIFICATION');
  for (const r of rows) {
    console.log(pad(r.proposedReviewOrder, 4) + pad(r.citation, 28) +
      pad(r.measuredUsageCount || '-', 5) + pad(r.hazardFamily, 26) + r.classification);
  }
  console.log('\nBY CLASSIFICATION:');
  for (const [k, v] of Object.entries(byClass).sort((a, b) => b[1] - a[1])) console.log(`  ${pad(k, 38)} ${v}`);
  console.log(`\nEmitted by gold set: ${emittedRows.length} | approved ${out.totals.emittedApproved} | missing record ${out.totals.emittedMissingRecord}`);
  if (dest) console.log(`\nWrote ${dest}`);

  await dataSource.destroy();
}

main().catch(err => { console.error(err); process.exit(1); });
