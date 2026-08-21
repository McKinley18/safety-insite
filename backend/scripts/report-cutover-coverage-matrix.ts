/**
 * KG-3D (Phases 18, 19, 20) -- the cutover-readiness inventory.
 *
 * The 27-row corpus aggregate is the wrong number to judge a cutover on. What decides whether the
 * governed read path can be switched on is coverage of the citations HazLenz ACTUALLY EMITS: a
 * corpus could be 100% approved and still leave most findings unbacked, because citation selection
 * is in code and has no corpus dependency (KG-3A §12). Conversely a large unapproved tail costs
 * nothing at cutover if nothing ever cites it.
 *
 * So this builds the matrix per emitted citation and reports two coverage numbers separately.
 *
 * The eligibility criterion below is deliberately NOT a flat percentage of the corpus. A rule like
 * "80% approved" can be satisfied by approving the unused tail while the standards customers see
 * every day stay unbacked.
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dataSource } from '../src/database/data-source';
import { resolveGovernedCitation } from '../src/standards/releases/governed-corpus-lookup';
import { resolveStandardsBacking } from '../src/standards/display/standards-backing-contract';
import { releaseCitationKey } from '../src/standards/releases/citation-identity';

/** The distinct citations HazLenz emits, measured by KG-3C over the verification corpora. */
const EMITTED_MATRIX = join(__dirname, '..', '..', 'verification',
  'hazlenz-governed-knowledge-growth-2026-08-19', 'kg-3c', 'display-contract-matrix.json');

/** Representative hazard family per emitted citation, for triage rather than for logic. */
const HAZARD_FAMILY: Record<string, string> = {
  '29 CFR 1910.212(a)(1)': 'machine guarding', '29 CFR 1910.147': 'hazardous energy',
  '30 CFR 56.12016': 'hazardous energy (mining)', '29 CFR 1910.303': 'electrical',
  '29 CFR 1910.178(p)(1)': 'powered industrial trucks', '29 CFR 1910.28': 'fall protection',
  '29 CFR 1910.36': 'emergency egress', '29 CFR 1926.451(g)(1)': 'scaffolds',
  '29 CFR 1926.501': 'fall protection', '29 CFR 1926.652(a)(1)': 'excavation',
  '29 CFR 1926.1153': 'silica', '30 CFR 56.14107(a)': 'machine guarding (mining)',
  '30 CFR 56.14132(a)': 'mobile equipment (mining)', '29 CFR 1910.95': 'noise',
  '29 CFR 1910.1200': 'hazard communication', '29 CFR 1926.59': 'hazard communication',
  '29 CFR 1926.52': 'noise', '29 CFR 1926.416(a)(1)': 'electrical',
  '29 CFR 1926.300(b)(2)': 'machine guarding', '29 CFR 1926.34(a)': 'emergency egress',
  '30 CFR 62.120': 'noise (mining)', '30 CFR 62.130': 'noise (mining)',
  '30 CFR 47.41(a)': 'hazard communication (mining)',
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
  const emitted: string[] = JSON.parse(readFileSync(EMITTED_MATRIX, 'utf8'))
    .cases.map((c: any) => c.citation);

  const rows = [];
  for (const citation of emitted) {
    const g = await resolveGovernedCitation(dataSource, releaseId, citation);
    const backing = resolveStandardsBacking({
      citation, sourceKey: g.sourceKey, title: g.title,
      standardText: g.standardText, plainLanguageSummary: g.plainLanguageSummary,
      governed: {
        releaseId, effectiveReviewState: g.effectiveReviewState,
        placeholderSource: g.placeholderSource,
        hasContent: Boolean(g.standardText || g.plainLanguageSummary),
      },
    });
    const recordExists = g.backing !== 'NOT_IN_RELEASE';
    rows.push({
      citation,
      citationKey: releaseCitationKey(citation),
      jurisdiction: jurisdictionOf(citation),
      hazardFamily: HAZARD_FAMILY[citation] ?? 'unclassified',
      governedRecordExists: recordExists,
      exactCitationMatch: recordExists,
      approved: g.effectiveReviewState === 'reviewer_approved',
      placeholderProvenance: g.placeholderSource,
      authoritativeTextAvailable: Boolean(g.standardText || g.plainLanguageSummary),
      backingStatus: backing.backingStatus,
      standardDetailUsable: backing.backingStatus !== 'CITATION_ONLY',
      remediationRemaining: !recordExists
        ? 'SOURCE_AND_INGEST_REQUIRED — no governed record for a citation HazLenz emits'
        : g.placeholderSource
          ? 'PROVENANCE_REMEDIATION_REQUIRED — placeholder source key'
          : g.effectiveReviewState === 'reviewer_approved'
            ? 'NONE'
            : 'REVIEW_REQUIRED — record present with registered provenance, awaiting substantive review',
    });
  }

  const corpusTotal = Number((await dataSource.query(
    `SELECT COUNT(*)::int AS n FROM regulatory_release_records WHERE "releaseId" = $1`, [releaseId],
  ))[0].n);
  const corpusApproved = rows.length ? undefined : undefined; // computed below from the release
  const approvedInRelease = Number((await dataSource.query(
    `SELECT COUNT(DISTINCT r."citationKey")::int AS n
       FROM regulatory_release_records r
       JOIN regulatory_release_record_reviews v
         ON v."releaseId" = r."releaseId" AND v."citationKey" = r."citationKey"
        AND v."recordChecksum" = r."recordChecksum"
      WHERE r."releaseId" = $1 AND v.decision = 'approved'`, [releaseId],
  ))[0].n);

  const emittedBacked = rows.filter(r => r.backingStatus === 'APPROVED_GOVERNED_CONTENT').length;
  const emittedNoRecord = rows.filter(r => !r.governedRecordExists).length;

  console.log(`\nRelease: ${releaseId}\n`);
  console.log('citation'.padEnd(24) + 'jurisdiction'.padEnd(22) + 'hazard family'.padEnd(30) +
    'rec  appr  backing');
  for (const r of rows) {
    console.log(
      r.citation.padEnd(24) + r.jurisdiction.padEnd(22) + r.hazardFamily.padEnd(30) +
      String(r.governedRecordExists).padEnd(5) + String(r.approved).padEnd(6) + r.backingStatus);
  }

  const summary = {
    releaseId,
    overallCorpusCoverage: {
      records: corpusTotal,
      approved: approvedInRelease,
      percentApproved: Number(((approvedInRelease / corpusTotal) * 100).toFixed(1)),
    },
    hazlenzEmittedCoverage: {
      distinctEmittedCitations: rows.length,
      backedByApprovedGovernedContent: emittedBacked,
      percentBacked: Number(((emittedBacked / rows.length) * 100).toFixed(1)),
      noGovernedRecordAtAll: emittedNoRecord,
      awaitingReview: rows.filter(r => r.remediationRemaining.startsWith('REVIEW_REQUIRED')).length,
      placeholderProvenance: rows.filter(r => r.placeholderProvenance).length,
    },
    // See the module header: a corpus percentage is the wrong gate.
    cutoverEligibility: {
      criterion:
        'The governed read path becomes eligible when EVERY citation HazLenz emits resolves to a ' +
        'governed record with registered (non-placeholder) provenance, AND every emitted citation ' +
        'that drives Standard Detail is reviewer-approved for the release being activated, AND no ' +
        'emitted citation would drop to CITATION_ONLY under filtering. Coverage of the emitted set ' +
        'is the gate; the unused corpus tail is not, because it changes nothing a customer sees.',
      rationale:
        'Citation selection is in code and independent of the corpus, so filtering on backing can ' +
        'only ever REMOVE content from a citation that was already correctly selected. The cost of ' +
        'a premature cutover is therefore paid entirely on emitted citations, which is why they are ' +
        'the measure. A flat corpus percentage can be met by approving records nothing cites.',
      blockingToday: rows
        .filter(r => r.remediationRemaining !== 'NONE')
        .map(r => ({ citation: r.citation, hazardFamily: r.hazardFamily, blocker: r.remediationRemaining })),
    },
    rows,
  };

  console.log(`\nOVERALL corpus coverage        : ${approvedInRelease}/${corpusTotal} ` +
    `(${summary.overallCorpusCoverage.percentApproved}%) approved`);
  console.log(`HAZLENZ-EMITTED coverage       : ${emittedBacked}/${rows.length} ` +
    `(${summary.hazlenzEmittedCoverage.percentBacked}%) approved-backed   <-- the cutover gate`);
  console.log(`  emitted with NO governed record: ${emittedNoRecord}`);
  console.log(`  emitted awaiting review        : ${summary.hazlenzEmittedCoverage.awaitingReview}`);
  console.log(`  emitted on placeholder source  : ${summary.hazlenzEmittedCoverage.placeholderProvenance}`);
  console.log(`\nCUTOVER: ${summary.cutoverEligibility.blockingToday.length} emitted citations still block eligibility.`);

  const out = process.env.REPORT_OUT;
  if (out) {
    require('node:fs').writeFileSync(out, JSON.stringify(summary, null, 2));
    console.log(`Report written to ${out}`);
  }
  await dataSource.destroy();
}

main().catch(async error => {
  console.error(error);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exitCode = 1;
});
