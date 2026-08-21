/**
 * KG-3C -- the standards backing display contract.
 *
 * Proves the properties the contract exists to guarantee:
 *
 *   Phase 3/15  a `starter-unverified:` source key can NEVER yield corpusBacked = true
 *   Phase 4     sourceStatus is derived from the canonical status, not from a dead field
 *   Phase 5     CITATION_ONLY produces a truthful customer notice and no fabricated text
 *   Phase 16    unapproved -> approved -> revoked transitions move the status, and the immutable
 *               content record is unchanged throughout
 *   Phase 17    an explicit historical release resolves its OWN version's backing, with no
 *               newer-release leakage, across activation and rollback
 *
 * The pure-contract section needs no database. The transition and history sections drive the real
 * KG-3B reviewer mechanism against a disposable database.
 *
 * PHASE 20 (inherited from KG-3B): approvals created here are TEST FIXTURES. They prove the
 * contract, not that any real regulatory record has been substantively reviewed.
 */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { dataSource } from '../src/database/data-source';
import { RegulatoryReleaseLifecycleService } from '../src/standards/releases/regulatory-release-lifecycle.service';
import { ReleaseRecordReviewService } from '../src/standards/releases/release-record-review.service';
import { resolveGovernedCitation } from '../src/standards/releases/governed-corpus-lookup';
import {
  customerBackingNotice,
  mapBackingToSourceStatus,
  resolveStandardsBacking,
} from '../src/standards/display/standards-backing-contract';
import { claimDatabaseOwnership, DatabaseOwnershipRefused } from './lib/test-database-ownership';

const checks: string[] = [];
function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(`FAILED: ${message}`);
  checks.push(message);
  console.log(`ok  ${message}`);
}

const REVIEWER = 'kg3c-fixture-reviewer';
const CITATION = '1910.212(a)(1)';
const REVISION_MARKER = '[kg3c-revised]';

function finalize(releaseId: string, version: string) {
  const out = execFileSync('npx',
    ['ts-node', 'src/standards/seed/finalize-regulatory-release.ts'],
    {
      env: { ...process.env, REGULATORY_RELEASE_ID: releaseId, REGULATORY_RELEASE_VERSION: version },
      stdio: 'pipe',
    }).toString();
  return JSON.parse(out.trim().split('\n').filter(Boolean).pop() || '{}');
}

/** Bridges a governed corpus resolution into the pure display contract, as callers must. */
function backingFor(resolution: Awaited<ReturnType<typeof resolveGovernedCitation>>) {
  return resolveStandardsBacking({
    citation: resolution.citation,
    sourceKey: resolution.sourceKey,
    title: resolution.title,
    standardText: resolution.standardText,
    plainLanguageSummary: resolution.plainLanguageSummary,
    governed: {
      releaseId: resolution.releaseId,
      effectiveReviewState: resolution.effectiveReviewState,
      placeholderSource: resolution.placeholderSource,
      hasContent: Boolean(resolution.standardText || resolution.plainLanguageSummary),
    },
  });
}

async function main() {
  // KG-4D Phase 20. This suite mutates release/review state, so it must prove the database is its
  // OWN before its first write -- a `test_*` name is a floor, not ownership. An unmarked database
  // is refused; claiming one requires KG_TEST_DB_INITIALIZE_OWNERSHIP naming it exactly.
  try {
    const claim = await claimDatabaseOwnership({ suite: 'test:standards-backing-contract' });
    console.log(`[db-ownership] suite=${claim.suite} database=${claim.database} claim=${claim.freshlyClaimed ? 'NEW' : 'RECLAIMED'}`);
  } catch (error) {
    if (error instanceof DatabaseOwnershipRefused) {
      console.error(`\n  ${error.message}\n  No mutation was attempted.\n`);
      process.exit(1);
    }
    throw error;
  }
  // =========================================================== PURE CONTRACT (no database)
  console.log('--- pure contract ---');

  // ---- PHASE 3 / 15: the placeholder hard gate ----
  const placeholderLive = resolveStandardsBacking({
    citation: '1910.36',
    sourceKey: 'starter-unverified:osha:1910.36',
    title: 'Design and construction requirements for exit routes',
    plainLanguageSummary: 'Exit routes must be permanent and adequately sized.',
  });
  assert(placeholderLive.corpusBacked === false,
    'HARD GATE: a starter-unverified source key does NOT yield corpusBacked = true.');
  assert(placeholderLive.backingStatus === 'UNAPPROVED_CONTENT',
    'A placeholder-source record with content is UNAPPROVED_CONTENT, never approved.');
  assert(placeholderLive.contentDisclosure === 'HAZLENZ_AUTHORED',
    'Its text is disclosed as HazLenz-authored, not as governed regulation.');

  // Even a caller that hands in a governed resolution claiming approval cannot launder it.
  const placeholderForced = resolveStandardsBacking({
    citation: '1910.36',
    sourceKey: 'starter-unverified:osha:1910.36',
    plainLanguageSummary: 'text',
    governed: {
      releaseId: 'forced', effectiveReviewState: 'reviewer_approved',
      placeholderSource: true, hasContent: true,
    },
  });
  assert(placeholderForced.corpusBacked === false &&
    placeholderForced.backingStatus === 'UNAPPROVED_CONTENT',
    'A placeholder cannot be laundered into approved backing even by a governed caller claiming approval.');

  const placeholderForcedByKey = resolveStandardsBacking({
    citation: '1910.36',
    sourceKey: 'starter-unverified:osha:1910.36',
    plainLanguageSummary: 'text',
    governed: {
      releaseId: 'forced', effectiveReviewState: 'reviewer_approved',
      // placeholderSource NOT flagged by the caller -- the key itself must still be caught.
      placeholderSource: false, hasContent: true,
    },
  });
  assert(placeholderForcedByKey.corpusBacked === false,
    'The placeholder is caught from the source key itself, not only from a caller-supplied flag.');

  // ---- the old rule, for contrast ----
  assert(Boolean('starter-unverified:osha:1910.36') === true,
    'ROOT CAUSE: the previous rule `corpusBacked = Boolean(sourceKey)` was satisfied by exactly ' +
    'this placeholder — a field literally named "unverified" conferred corpus backing.');

  // ---- CITATION_ONLY ----
  const citationOnly = resolveStandardsBacking({ citation: '29 CFR 1926.501' });
  assert(citationOnly.backingStatus === 'CITATION_ONLY' && citationOnly.corpusBacked === false,
    'A citation with no corpus record at all is CITATION_ONLY.');
  assert(citationOnly.contentDisclosure === 'NONE', 'It discloses no content.');
  assert(customerBackingNotice('CITATION_ONLY') ===
    'Verified standard text is not currently available for this citation.',
    'CITATION_ONLY produces a truthful, product-voice customer notice.');
  const notice = customerBackingNotice('CITATION_ONLY')!;
  assert(!/reviewer_approved|releaseId|checksum|starter-unverified|corpus|governed/i.test(notice),
    'The notice contains no internal governance vocabulary.');
  assert(customerBackingNotice('UNAPPROVED_CONTENT') === null &&
    customerBackingNotice('APPROVED_GOVERNED_CONTENT') === null,
    'No notice is attached to states that would today warn on every standard in the product.');

  // ---- UNAPPROVED_CONTENT: registered source, no governed approval ----
  const unapprovedLive = resolveStandardsBacking({
    citation: CITATION, sourceKey: 'osha-ecfr-1910',
    title: 'Machine guarding', plainLanguageSummary: 'Guards shall be provided.',
  });
  assert(unapprovedLive.backingStatus === 'UNAPPROVED_CONTENT' && !unapprovedLive.corpusBacked,
    'A registered-source record with NO governed resolution is UNAPPROVED_CONTENT — this is the ' +
    'truthful live-path answer today, with 0 of 26 real records approved.');

  // ---- APPROVED_GOVERNED_CONTENT ----
  const approved = resolveStandardsBacking({
    citation: CITATION, sourceKey: 'osha-ecfr-1910', title: 'Machine guarding',
    plainLanguageSummary: 'Guards shall be provided.',
    governed: {
      releaseId: 'rel.A', effectiveReviewState: 'reviewer_approved',
      placeholderSource: false, hasContent: true,
    },
  });
  assert(approved.backingStatus === 'APPROVED_GOVERNED_CONTENT' && approved.corpusBacked === true,
    'Approved + registered provenance + content is the ONLY route to corpusBacked = true.');
  assert(approved.contentDisclosure === 'GOVERNED_APPROVED', 'Its content is disclosed as governed-approved.');

  // Approved but empty: the customer-visible consequence is identical to having no content.
  const approvedNoText = resolveStandardsBacking({
    citation: CITATION, sourceKey: 'osha-ecfr-1910',
    governed: {
      releaseId: 'rel.A', effectiveReviewState: 'reviewer_approved',
      placeholderSource: false, hasContent: false,
    },
  });
  assert(approvedNoText.backingStatus === 'CITATION_ONLY' && !approvedNoText.corpusBacked,
    'An approved record carrying no regulatory text resolves to CITATION_ONLY, not to backed.');

  // ---- PHASE 4: sourceStatus derivation ----
  assert(mapBackingToSourceStatus('APPROVED_GOVERNED_CONTENT', false) === 'approved-versioned-regulation',
    'sourceStatus approved branch is now REACHABLE (it was dead: it read a field hydration never selects).');
  assert(mapBackingToSourceStatus('UNAPPROVED_CONTENT', true) === 'provisional-versioned-regulation',
    'Unapproved content with a regulation-authority decision maps to provisional-versioned-regulation.');
  assert(mapBackingToSourceStatus('CITATION_ONLY', false) === 'source-review-required',
    'Everything else maps to source-review-required.');
  assert(mapBackingToSourceStatus('UNAPPROVED_CONTENT', false) === 'source-review-required',
    'The three wire values are unchanged, so no client contract breaks.');

  // =========================================================== DATABASE-BACKED
  const target = new URL(process.env.DATABASE_URL || 'postgresql://localhost/UNSET');
  const dbName = target.pathname.replace('/', '');
  console.log(`\nResolved database target: host=${target.hostname} database=${dbName}`);
  if (dbName === 'safescope' || !/^test_/.test(dbName)) {
    throw new Error(`Refusing to run against a non-disposable database: ${dbName}`);
  }

  await dataSource.initialize();
  const lifecycle = new RegulatoryReleaseLifecycleService(dataSource);
  const review = new ReleaseRecordReviewService(dataSource);

  await dataSource.query(`DELETE FROM regulatory_release_record_reviews`);
  await dataSource.query(`DELETE FROM knowledge_release_events`);
  await dataSource.query(`DELETE FROM regulatory_release_records`);
  await dataSource.query(`DELETE FROM regulatory_releases`);
  await dataSource.query(
    `UPDATE standards_master SET plain_language_summary = replace(plain_language_summary, ' ${REVISION_MARKER}', '')`,
  );

  console.log('\n--- PHASE 16: approval / revocation transition ---');
  const RELEASE_A = 'kg3c-release.A';
  finalize(RELEASE_A, 'a.1');

  const before = await resolveGovernedCitation(dataSource, RELEASE_A, CITATION);
  const backingBefore = backingFor(before);
  assert(backingBefore.backingStatus === 'UNAPPROVED_CONTENT' && !backingBefore.corpusBacked,
    'BEFORE approval the exact record is UNAPPROVED_CONTENT.');
  const contentChecksum = before.recordChecksum!;

  await review.approveRecord({
    releaseId: RELEASE_A, citation: CITATION, reviewerId: REVIEWER,
    reviewerRole: 'regulatory-analyst', expectedChecksum: contentChecksum,
    note: 'KG-3C fixture review.',
  });

  const afterApproval = await resolveGovernedCitation(dataSource, RELEASE_A, CITATION);
  const backingApproved = backingFor(afterApproval);
  assert(backingApproved.backingStatus === 'APPROVED_GOVERNED_CONTENT' && backingApproved.corpusBacked,
    'AFTER a legitimate checksum-bound approval the SAME record is APPROVED_GOVERNED_CONTENT.');
  assert(afterApproval.recordChecksum === contentChecksum,
    'The immutable content record is UNCHANGED by approval — only its governance state moved.');
  assert(afterApproval.title === before.title &&
    afterApproval.standardText === before.standardText &&
    afterApproval.plainLanguageSummary === before.plainLanguageSummary,
    'Title and text are byte-identical before and after approval.');

  await review.revokeApproval({
    releaseId: RELEASE_A, citation: CITATION, reviewerId: 'kg3c-governance-lead',
    expectedChecksum: contentChecksum, note: 'KG-3C fixture revocation.',
  });
  const afterRevoke = await resolveGovernedCitation(dataSource, RELEASE_A, CITATION);
  const backingRevoked = backingFor(afterRevoke);
  assert(backingRevoked.backingStatus === 'UNAPPROVED_CONTENT' && !backingRevoked.corpusBacked,
    'AFTER revocation the status returns to non-authoritative presentation.');
  assert(afterRevoke.recordChecksum === contentChecksum,
    'The content record remained immutable across approve AND revoke.');

  // Re-approve so the history section has an approved release A.
  await review.approveRecord({
    releaseId: RELEASE_A, citation: CITATION, reviewerId: REVIEWER,
    expectedChecksum: contentChecksum, note: 'KG-3C fixture re-approval.',
  });

  console.log('\n--- PHASE 17: release A / B display history ---');
  await dataSource.query(
    `UPDATE standards_master SET plain_language_summary = plain_language_summary || ' ${REVISION_MARKER}'
      WHERE citation = $1`, [CITATION],
  );
  const RELEASE_B = 'kg3c-release.B';
  finalize(RELEASE_B, 'b.1');

  const allText = (r: any) => `${r?.standardText ?? ''} ${r?.plainLanguageSummary ?? ''}`;

  const aAfterB = await resolveGovernedCitation(dataSource, RELEASE_A, CITATION);
  assert(!allText(aAfterB).includes(REVISION_MARKER),
    'Release A still resolves VERSION A text after release B exists — no newer-release leakage.');
  assert(backingFor(aAfterB).corpusBacked,
    'Release A\'s backing is still APPROVED_GOVERNED_CONTENT after B was finalized.');

  const bResolved = await resolveGovernedCitation(dataSource, RELEASE_B, CITATION);
  assert(allText(bResolved).includes(REVISION_MARKER), 'Release B resolves VERSION B text.');
  assert(backingFor(bResolved).backingStatus === 'UNAPPROVED_CONTENT',
    'Release B\'s revised version is NOT backed — approval did not follow the citation across versions.');

  // Activate A, then B, then roll back, checking the resolver at each point.
  await lifecycle.activate(RELEASE_A, 'kg3c', 'activate A');
  const activeA = await lifecycle.getActiveRelease();
  const viaA = await resolveGovernedCitation(dataSource, activeA!.releaseId, CITATION);
  assert(backingFor(viaA).corpusBacked && !allText(viaA).includes(REVISION_MARKER),
    'While A is active, the citation resolves to A\'s approved version A text.');

  await review.approveRecord({
    releaseId: RELEASE_B, citation: CITATION, reviewerId: REVIEWER,
    expectedChecksum: bResolved.recordChecksum!, note: 'KG-3C fixture review of revised version.',
  });
  await lifecycle.activate(RELEASE_B, 'kg3c', 'promote B');
  const activeB = await lifecycle.getActiveRelease();
  const viaB = await resolveGovernedCitation(dataSource, activeB!.releaseId, CITATION);
  assert(backingFor(viaB).corpusBacked && allText(viaB).includes(REVISION_MARKER),
    'While B is active, the citation resolves to B\'s approved version B text.');

  const explicitA = await resolveGovernedCitation(dataSource, RELEASE_A, CITATION);
  assert(!allText(explicitA).includes(REVISION_MARKER) && backingFor(explicitA).corpusBacked,
    'EXPLICIT historical resolution of release A still returns A text while B is active.');

  await lifecycle.rollbackTo(RELEASE_A, 'kg3c', 'rollback');
  const activeAfter = await lifecycle.getActiveRelease();
  assert(activeAfter?.releaseId === RELEASE_A, 'Rollback returned the pointer to release A.');
  const viaRolledBack = await resolveGovernedCitation(dataSource, activeAfter!.releaseId, CITATION);
  assert(backingFor(viaRolledBack).corpusBacked && !allText(viaRolledBack).includes(REVISION_MARKER),
    'After rollback the resolver returns A\'s original approved content — content, not just a pointer.');
  const bPreserved = await resolveGovernedCitation(dataSource, RELEASE_B, CITATION);
  assert(backingFor(bPreserved).corpusBacked && allText(bPreserved).includes(REVISION_MARKER),
    'Release B is preserved historically and still resolves its own approved version.');

  console.log(`\nPASSED ${checks.length}/${checks.length} checks.`);
  console.log('NOTE (Phase 20): approvals above are TEST FIXTURES created through the real KG-3B ' +
    'review mechanism. They prove the contract, not that any real record was substantively reviewed.');
  await dataSource.destroy();
}

main().catch(async error => {
  console.error(error);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exitCode = 1;
});
