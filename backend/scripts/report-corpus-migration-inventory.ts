/**
 * KG-3B Phase 19 -- the real corpus migration inventory.
 *
 * Enumerates every record in a finalized release and states, per record, exactly what stands
 * between it and legitimate reviewer approval. READ-ONLY: this script approves nothing and
 * writes nothing. It exists so that "the production corpus is not ready" is a measured claim
 * with a per-record remedy, rather than an assertion.
 *
 * The distinction the inventory is built to preserve (and which the pre-KG-3A derivation
 * destroyed):
 *
 *     source acquisition policy   -- `approved_for_auto_ingestion`, `requires_approval`,
 *                                    `authority_tier`. May this source be fetched, and does
 *                                    fetching need sign-off?
 *     record review state         -- has a person examined THIS record's content and attested
 *                                    to it for governed regulatory use?
 *
 * Neither implies the other. The inventory prints both and never derives one from the other.
 *
 * Usage:  REGULATORY_RELEASE_ID=<id> npm run report:corpus-migration-inventory [-- --json]
 */
import 'dotenv/config';
import { dataSource } from '../src/database/data-source';
import { applyFindingScopedStandards } from '../src/safescope-v2/evidence/evidence-foundation';
import { ReleaseRecordReviewService } from '../src/standards/releases/release-record-review.service';
import { isPlaceholderSourceKey } from '../src/standards/releases/review-state';
import { resolveStandardsBacking } from '../src/standards/display/standards-backing-contract';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const RELEASE_ID = process.env.REGULATORY_RELEASE_ID || 'federal-core-2026-07-30.1';

const TRACKED_GOLD_SET = join(__dirname, '..', '..',
  'verification/insite-core-closure-standards-validation-2026-08-18/standards-gold-set/gold-set-script-v3.ts');
const EXPECTED_GOLD_SET_SHA256 =
  '93184abc677cf7a50d5f9ac11c4317148618acd74a26fe20fb37e690df647cd3';

type Disposition =
  | 'READY_FOR_REVIEW'
  | 'SOURCE_PROVENANCE_REQUIRED'
  | 'CONTENT_VERIFICATION_REQUIRED'
  | 'PLACEHOLDER_SOURCE'
  | 'NOT_CURRENTLY_USED'
  | 'ALREADY_APPROVED'
  | 'OTHER';

/**
 * The set of citations HazLenz actually emits, computed by running the real in-code selection
 * engine over the tracked gold set's observations. Used only to mark which records are in
 * demonstrated use -- never to decide whether a record may be approved.
 */
function emittedCitationSet(): Set<string> {
  const source = readFileSync(TRACKED_GOLD_SET, 'utf8');
  const sha256 = createHash('sha256').update(source).digest('hex');
  if (sha256 !== EXPECTED_GOLD_SET_SHA256) {
    throw new Error(`Tracked gold set hash mismatch: expected ${EXPECTED_GOLD_SET_SHA256}, got ${sha256}.`);
  }
  const start = source.indexOf('const GOLD_SET: GoldCase[] = [');
  const open = source.indexOf('[', start);
  const end = source.indexOf('\n];', open);
  // eslint-disable-next-line no-new-func
  const cases = new Function(`return ${source.slice(open, end + 2)};`)() as any[];

  const emitted = new Set<string>();
  for (const c of cases) {
    const scopes = c.regime === 'msha' ? ['msha']
      : c.regime === 'osha_construction' ? ['osha_construction'] : ['osha_general'];
    const result: any = {
      multiHazardDecomposition: {
        hazards: [{
          hazardId: 'inv-1', domainId: 'unknown', hazardFamily: 'unknown',
          observationFragment: c.observation, mechanism: '', supportingSignals: [],
        }],
      },
    };
    applyFindingScopedStandards(result, { text: c.observation, scopes } as any);
    for (const s of result.multiHazardDecomposition.hazards[0].standardCandidates || []) {
      if (s?.citation) emitted.add(canonical(String(s.citation)));
    }
  }
  return emitted;
}

/** The gold set's own agency-prefix-insensitive comparison, so "is this citation used" matches
 *  the way the tracked suite matches citations. */
function canonical(value: string): string {
  return String(value ?? '').toLowerCase()
    .replace(/^(msha|osha|29|30|cfr|part|subpart|\s|-|§|\.)+/g, '')
    .replace(/[^a-z0-9]/g, '');
}

async function main() {
  const target = new URL(process.env.DATABASE_URL || 'postgresql://localhost/UNSET');
  const dbName = target.pathname.replace('/', '');
  console.log(`Resolved database target: host=${target.hostname} database=${dbName}`);
  console.log('This report is READ-ONLY. It approves nothing.\n');

  const emitted = emittedCitationSet();
  await dataSource.initialize();
  const review = new ReleaseRecordReviewService(dataSource);

  const effective = await review.resolveEffectiveReviewStates(RELEASE_ID);
  const rows: any[] = await dataSource.query(
    `SELECT r.citation, r."citationKey", r."recordChecksum", r."reviewState" AS frozen,
            r."reviewStateReason", r.payload,
            s.source_key, s.source_name, s.source_type, s.authority_tier, s.allowed_use,
            s.requires_approval, s.approved_for_auto_ingestion, s.deprecation_status,
            s.source_url, s.source_document_checksum, s.reviewer_approved AS legacy_boolean
       FROM regulatory_release_records r
       LEFT JOIN standards_master s ON s.id = r."standardId"
      WHERE r."releaseId" = $1
      ORDER BY r."agencyCode", r.citation`,
    [RELEASE_ID],
  );
  if (!rows.length) throw new Error(`Release ${RELEASE_ID} holds no snapshot records.`);

  // The registry that would supply authoritative provenance for a placeholder record.
  const [registry] = await dataSource.query(
    `SELECT COUNT(*)::int AS n FROM safescope_knowledge_sources WHERE status = 'active'`,
  ).catch(() => [{ n: -1 }]);

  const inventory = rows.map(row => {
    const payload = row.payload || {};
    const effectiveState = effective.get(row.citationKey) ?? row.frozen;
    const placeholder = isPlaceholderSourceKey(row.source_key);
    const hasText = Boolean(String(payload.canonicalText || '').trim());
    const hasSummary = Boolean(String(payload.summary || '').trim());
    const used = emitted.has(canonical(row.citation));

    let disposition: Disposition;
    let evidenceRequired: string;

    if (effectiveState === 'reviewer_approved') {
      disposition = 'ALREADY_APPROVED';
      evidenceRequired = 'None. A reviewer decision is on record for this exact version.';
    } else if (placeholder) {
      disposition = 'PLACEHOLDER_SOURCE';
      evidenceRequired =
        `Source key '${row.source_key}' was SYNTHESIZED by the finalizer because the row arrived ` +
        'with no source metadata. Required before review is meaningful: register the authoritative ' +
        'source (eCFR for this citation) in the source registry, re-ingest or re-attach provenance ' +
        'to the row, then finalize a new release. Note that this row currently carries ' +
        `requires_approval=${row.requires_approval} and approved_for_auto_ingestion=${row.approved_for_auto_ingestion} ` +
        '-- the most permissive acquisition flags in the corpus sit on its weakest provenance, ' +
        'which is exactly the conflation KG-3A removed.';
    } else if (String(row.deprecation_status || 'active') !== 'active') {
      disposition = 'OTHER';
      evidenceRequired = `Record is '${row.deprecation_status}'. Deprecated records are not approvable.`;
    } else if (!hasText && !hasSummary) {
      disposition = 'CONTENT_VERIFICATION_REQUIRED';
      evidenceRequired =
        'The release carries neither regulatory text nor a plain-language summary for this ' +
        'citation, so there is nothing substantive for a reviewer to attest to. Ingest the ' +
        'regulatory text from the registered source first.';
    } else if (!row.source_url && !row.source_document_checksum) {
      disposition = used ? 'READY_FOR_REVIEW' : 'NOT_CURRENTLY_USED';
      evidenceRequired =
        'Source is registered and content is present, but the row records neither a source URL ' +
        'nor a source-document checksum, so the reviewer must obtain the authoritative text ' +
        `independently from '${row.source_name || row.source_key}' and compare it. ` +
        (used ? '' : 'Not currently emitted by HazLenz, so this is lower priority.');
    } else {
      disposition = used ? 'READY_FOR_REVIEW' : 'NOT_CURRENTLY_USED';
      evidenceRequired = 'Reviewer compares the release text against the recorded source document.';
    }

    return {
      citation: row.citation,
      jurisdiction: [payload.agency, payload.scope].filter(Boolean).join('/') || null,
      sourceKey: row.source_key,
      sourceName: row.source_name,
      authorityTier: row.authority_tier,
      approvedForAutoIngestion: row.approved_for_auto_ingestion,
      requiresApproval: row.requires_approval,
      mechanicalValidation: row.frozen === 'unreviewed' ? 'failed' : 'passed',
      frozenReviewState: row.frozen,
      effectiveReviewState: effectiveState,
      // What the CURRENT live rule does today: corpusBacked = Boolean(sourceKey).
      corpusBackedUseToday: Boolean(row.source_key),
      hazlenzEmitsCitation: used,
      hasRegulatoryText: hasText,
      hasSummary,
      recordChecksum: row.recordChecksum,
      evidenceRequired,
      disposition,
    };
  });

  // KG-3C Phase 19 -- the same records re-evaluated through the display contract, so the
  // remediation baseline is expressed in the states a customer would actually be shown rather
  // than in internal review vocabulary. Read-only; nothing is approved to improve the numbers.
  const displayContract = inventory.map(row => {
    const backing = resolveStandardsBacking({
      citation: row.citation,
      sourceKey: row.sourceKey,
      title: row.citation,
      standardText: row.hasRegulatoryText ? 'present' : null,
      plainLanguageSummary: row.hasSummary ? 'present' : null,
      governed: {
        releaseId: RELEASE_ID,
        effectiveReviewState: row.effectiveReviewState,
        placeholderSource: isPlaceholderSourceKey(row.sourceKey),
        hasContent: row.hasRegulatoryText || row.hasSummary,
      },
    });
    return {
      citation: row.citation,
      hazlenzEmitsCitation: row.hazlenzEmitsCitation,
      backingStatus: backing.backingStatus,
      corpusBacked: backing.corpusBacked,
      // What the CURRENT pre-KG-3C rule claimed: corpusBacked = Boolean(sourceKey).
      corpusBackedUnderOldRule: Boolean(row.sourceKey),
    };
  });
  const tally = (rows: typeof displayContract) => rows.reduce((acc: Record<string, number>, row) => {
    acc[row.backingStatus] = (acc[row.backingStatus] || 0) + 1; return acc;
  }, {});
  const displayContractSummary = {
    allRecords: tally(displayContract),
    hazlenzEmittedOnly: tally(displayContract.filter(row => row.hazlenzEmitsCitation)),
    falselyBackedUnderOldRule: displayContract.filter(
      row => row.corpusBackedUnderOldRule && !row.corpusBacked).length,
    placeholderRecordsFalselyBackedUnderOldRule: displayContract.filter(
      row => row.corpusBackedUnderOldRule && !row.corpusBacked &&
        isPlaceholderSourceKey(inventory.find(i => i.citation === row.citation)?.sourceKey)).length,
  };

  const byDisposition = inventory.reduce((acc: Record<string, number>, row) => {
    acc[row.disposition] = (acc[row.disposition] || 0) + 1; return acc;
  }, {});
  const approvedCount = inventory.filter(r => r.effectiveReviewState === 'reviewer_approved').length;
  const usedCount = inventory.filter(r => r.hazlenzEmitsCitation).length;

  const summary = {
    releaseId: RELEASE_ID,
    totalRecords: inventory.length,
    reviewerApproved: approvedCount,
    hazlenzEmittedRecords: usedCount,
    byDisposition,
    knowledgeSourceRegistryActiveRows: registry?.n,
    // KG-3C: the same corpus expressed in customer-facing backing states.
    displayContract: displayContractSummary,
    approvalStateChecksum: (await review.computeApprovalStateChecksum(RELEASE_ID)).approvalStateChecksum,
    // Stated on the artifact itself so a reader of the JSON cannot mistake acquisition policy
    // for review.
    note: 'approvedForAutoIngestion / requiresApproval describe SOURCE ACQUISITION POLICY. They ' +
      'are NOT review state and were never evidence of review. reviewer approval is only ever ' +
      'produced by an explicit decision in regulatory_release_record_reviews.',
  };

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ summary, inventory, displayContract }, null, 2));
  } else {
    console.log(JSON.stringify(summary, null, 2));
    console.log('\n| Citation | Jurisdiction | Source key | Tier | AutoIngest | ReqApproval | Mech | Review | Backed today | HazLenz uses | Disposition |');
    console.log('|---|---|---|---|---|---|---|---|---|---|---|');
    for (const row of inventory) {
      console.log(`| ${row.citation} | ${row.jurisdiction} | ${row.sourceKey} | ${row.authorityTier} | ` +
        `${row.approvedForAutoIngestion} | ${row.requiresApproval} | ${row.mechanicalValidation} | ` +
        `${row.effectiveReviewState} | ${row.corpusBackedUseToday} | ${row.hazlenzEmitsCitation} | ${row.disposition} |`);
    }
    console.log('\nEvidence required per record:');
    for (const row of inventory) {
      console.log(`\n- ${row.citation} [${row.disposition}]\n  ${row.evidenceRequired}`);
    }
  }

  await dataSource.destroy();
}

main().catch(async error => {
  console.error(error);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exitCode = 1;
});
