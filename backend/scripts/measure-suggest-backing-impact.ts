/**
 * KG-3D (Phase 23) -- what the corpus remediation changed for `suggest()`.
 *
 * `suggest()` is the path where a future cutover will actually remove results: it returns corpus
 * rows directly, rather than annotating a citation that code already selected. KG-3C gave it the
 * backing annotation but deliberately no filter, because filtering with 0 of 26 records approved
 * would have deleted every result for every customer.
 *
 * This script MEASURES what a filter would do now that real approvals exist. It changes nothing
 * and filters nothing -- it reports, per query, how many returned rows are approved-backed and
 * which would be lost if the cutover were switched on today. That number is the input to the
 * cutover-readiness decision, not a reason to make it.
 */
import 'dotenv/config';
import { dataSource } from '../src/database/data-source';
import { ApplicableStandardsService } from '../src/applicable-standards/applicable-standards.service';
import { Standard } from '../src/standards/entities/standard.entity';
import { resolveGovernedCitation } from '../src/standards/releases/governed-corpus-lookup';
import { resolveStandardsBacking } from '../src/standards/display/standards-backing-contract';

const QUERIES: Array<{ label: string; description: string; source?: string }> = [
  { label: 'egress (general industry)', description: 'Exit door in the shipping area is chained shut during the shift.', source: 'OSHA_GENERAL_INDUSTRY' },
  { label: 'exposed live parts (general industry)', description: 'Electrical panel cover missing, energized conductors exposed next to a walkway.', source: 'OSHA_GENERAL_INDUSTRY' },
  { label: 'machine guarding (general industry)', description: 'Rotating shaft on the mixer has no guard and the operator works beside it.', source: 'OSHA_GENERAL_INDUSTRY' },
  { label: 'fall protection (construction)', description: 'Employee working at 12 feet on an unprotected leading edge with no guardrail or fall arrest.', source: 'OSHA_CONSTRUCTION' },
  { label: 'egress (construction)', description: 'Only stairwell out of the occupied floor is blocked with stacked material.', source: 'OSHA_CONSTRUCTION' },
  { label: 'electrical (construction)', description: 'Worker running conduit next to an energized overhead power circuit with no guarding.', source: 'OSHA_CONSTRUCTION' },
  { label: 'chemical labels (mining)', description: 'Several chemical containers in the shop have missing or unreadable labels.', source: 'MSHA_MNM_SURFACE' },
  { label: 'noise (mining)', description: 'Miners working near the crusher all shift without hearing protection.', source: 'MSHA_MNM_SURFACE' },
  { label: 'guarding (mining)', description: 'Conveyor tail pulley guard removed and the walkway runs right beside it.', source: 'MSHA_MNM_SURFACE' },
];

async function main() {
  const target = new URL(process.env.DATABASE_URL || 'postgresql://localhost/UNSET');
  const dbName = target.pathname.replace('/', '');
  console.log(`Resolved database target: host=${target.hostname} database=${dbName}`);
  if (dbName === 'safescope' || !/^test_/.test(dbName)) {
    throw new Error(`Refusing to run against database '${dbName}'.`);
  }

  await dataSource.initialize();
  const service = new ApplicableStandardsService(dataSource.getRepository(Standard) as any);

  // Two different questions, and conflating them is how a cutover gets misjudged:
  //
  //   LIVE      what `suggest()` reports today. The live path passes no governed resolution, so
  //             every row is UNAPPROVED_CONTENT no matter how many real approvals exist. That is
  //             the disabled cutover, and it is the truthful answer for the current architecture.
  //   GOVERNED  what the row WOULD resolve to against the remediated release. This is the number
  //             that actually describes cutover readiness.
  const governedReleaseId = process.env.GOVERNED_RELEASE_ID;
  const report: any = { database: dbName, governedReleaseId: governedReleaseId ?? null, queries: [] };
  let totalRows = 0, totalLiveBacked = 0, totalGovernedBacked = 0;

  for (const query of QUERIES) {
    const matches: any[] = await service.suggest(query.description, undefined, query.source, 5);
    const rows = [];
    for (const match of matches) {
      const citation = match?.citation ?? null;
      let governedBacked: boolean | null = null;
      let governedStatus: string | null = null;
      if (governedReleaseId && citation) {
        const resolution = await resolveGovernedCitation(dataSource, governedReleaseId, citation);
        const backing = resolveStandardsBacking({
          citation,
          sourceKey: resolution.sourceKey,
          title: resolution.title,
          standardText: resolution.standardText,
          plainLanguageSummary: resolution.plainLanguageSummary,
          governed: {
            releaseId: governedReleaseId,
            effectiveReviewState: resolution.effectiveReviewState,
            placeholderSource: resolution.placeholderSource,
            hasContent: Boolean(resolution.standardText || resolution.plainLanguageSummary),
          },
        });
        governedBacked = backing.corpusBacked;
        governedStatus = backing.backingStatus;
      }
      rows.push({
        citation,
        liveBackingStatus: match?.backingStatus ?? null,
        liveCorpusBacked: Boolean(match?.corpusBacked),
        governedBackingStatus: governedStatus,
        governedCorpusBacked: governedBacked,
      });
    }

    const liveBacked = rows.filter(row => row.liveCorpusBacked).length;
    const governedBackedCount = rows.filter(row => row.governedCorpusBacked).length;
    totalRows += rows.length;
    totalLiveBacked += liveBacked;
    totalGovernedBacked += governedBackedCount;

    console.log(`\n${query.label}  (${rows.length} results | live-backed ${liveBacked} | governed-backed ${governedBackedCount})`);
    for (const row of rows) {
      console.log(`   ${row.governedCorpusBacked ? 'GOVERNED-BACKED' : '               '} ` +
        `${String(row.citation).padEnd(26)} live=${row.liveBackingStatus} governed=${row.governedBackingStatus}`);
    }
    report.queries.push({
      ...query, resultCount: rows.length,
      liveApprovedBacked: liveBacked, governedApprovedBacked: governedBackedCount, rows,
    });
  }

  report.totals = {
    resultsReturned: totalRows,
    liveApprovedBacked: totalLiveBacked,
    governedApprovedBacked: totalGovernedBacked,
    wouldBeLostIfCutoverFilteredOnGovernedBacking: totalRows - totalGovernedBacked,
    note: 'Measurement only. suggest() applies NO backing filter -- membership, ordering and count ' +
      'are unchanged by KG-3D. liveApprovedBacked is 0 by construction while the cutover is off.',
  };
  console.log(`\nTOTAL: ${totalRows} results | live-backed ${totalLiveBacked} ` +
    `(0 expected while the cutover is off) | governed-backed ${totalGovernedBacked} | ` +
    `${totalRows - totalGovernedBacked} would be removed if the cutover filtered on governed backing today.`);

  const out = process.env.REPORT_OUT;
  if (out) {
    require('node:fs').writeFileSync(out, JSON.stringify(report, null, 2));
    console.log(`Report written to ${out}`);
  }
  await dataSource.destroy();
}

main().catch(async error => {
  console.error(error);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exitCode = 1;
});
