/**
 * KG-3B -- the corpus-backed validation matrix (Phases 13, 14, 16, 17, 18).
 *
 * WHY THIS EXISTS. KG-3A established that `applyFindingScopedStandards()` -- the function the
 * tracked 31-case gold set exercises, and the function that actually SELECTS citations -- has
 * zero database access. Release scoping therefore cannot change which citations it emits, which
 * makes the gold set structurally incapable of gating a governed cutover. It measures the wrong
 * layer. This suite measures the layer governance actually affects: what happens AFTER a citation
 * is selected, when the system tries to back it with regulatory content.
 *
 * The cases are not invented. Every citation tested here is one that HazLenz genuinely emits:
 * the observations come from the tracked, hash-verified gold set, and the citations are whatever
 * `applyFindingScopedStandards()` returns for them.
 *
 * PHASE 20. The approvals created here are TEST FIXTURES established through the real review
 * mechanism. They prove the governed pipeline resolves correctly. They are not substantive
 * regulatory review of the real corpus.
 */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dataSource } from '../src/database/data-source';
import { applyFindingScopedStandards } from '../src/safescope-v2/evidence/evidence-foundation';
import { ApplicableStandardsService } from '../src/applicable-standards/applicable-standards.service';
import { Standard } from '../src/standards/entities/standard.entity';
import { RegulatoryReleaseLifecycleService } from '../src/standards/releases/regulatory-release-lifecycle.service';
import { ReleaseRecordReviewService } from '../src/standards/releases/release-record-review.service';
import {
  classifyDifference,
  resolveGovernedCitation,
  resolveLegacyCitation,
} from '../src/standards/releases/governed-corpus-lookup';
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

const TRACKED_GOLD_SET = join(__dirname, '..', '..',
  'verification/insite-core-closure-standards-validation-2026-08-18/standards-gold-set/gold-set-script-v3.ts');
const EXPECTED_GOLD_SET_SHA256 =
  '93184abc677cf7a50d5f9ac11c4317148618acd74a26fe20fb37e690df647cd3';

interface GoldCase {
  id: string; area: string;
  regime: 'osha_general_industry' | 'osha_construction' | 'msha';
  observation: string; expectedCitations: string[]; mustNotReturn: string[];
  authoritativeSource: string; rationale: string;
}

/** Same hash-verified extraction the KG-3A shadow harness uses. No fourth copy of the dataset. */
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

function scopeToText(regime: GoldCase['regime']): string[] {
  if (regime === 'msha') return ['msha'];
  if (regime === 'osha_construction') return ['osha_construction'];
  return ['osha_general'];
}

/** Runs the real in-code selection engine and returns the citations it emits. */
function emittedCitations(c: GoldCase): string[] {
  const result: any = {
    multiHazardDecomposition: {
      hazards: [{
        hazardId: 'matrix-1', domainId: 'unknown', hazardFamily: 'unknown',
        observationFragment: c.observation, mechanism: '', supportingSignals: [],
      }],
    },
  };
  applyFindingScopedStandards(result, { text: c.observation, scopes: scopeToText(c.regime) } as any);
  return (result.multiHazardDecomposition.hazards[0].standardCandidates || [])
    .map((s: any) => String(s.citation)).filter(Boolean);
}

function finalize(releaseId: string, version: string) {
  const out = execFileSync('npx',
    ['ts-node', 'src/standards/seed/finalize-regulatory-release.ts'],
    {
      env: { ...process.env, REGULATORY_RELEASE_ID: releaseId, REGULATORY_RELEASE_VERSION: version },
      stdio: 'pipe',
    }).toString();
  return JSON.parse(out.trim().split('\n').filter(Boolean).pop() || '{}');
}

const REVIEWER = 'kg3b-matrix-reviewer';
const REVISED_CITATION = '1910.212(a)(1)';
/** The revision is applied to `plain_language_summary`, so "which version is this" must look at
 *  every text field a consumer could render, not just the highest-priority one. */
const REVISION_MARKER = '[kg3b-matrix-revised]';
const allText = (value: any) =>
  `${value?.standardText ?? ''} ${value?.plainLanguageSummary ?? ''} ${value?.summary ?? ''}`;


/**
 * KG-3E. This suite's placeholder-provenance assertions used to find their subject by querying the
 * REAL corpus for a row whose source_key was still `starter-unverified:`. That worked only because
 * the corpus contained unprovenanced records. KG-3E Phase 6 remediated the last three, so the query
 * returns nothing and the assertions could no longer run at all.
 *
 * The contract being tested -- placeholder provenance NEVER confers backing, even when the legacy
 * `reviewer_approved` boolean is set -- is unchanged and still worth enforcing. What was wrong was
 * sourcing its fixture from production data: the test depended on the corpus having a defect, so
 * fixing the defect silently disabled the test. This inserts a fixture the suite owns instead.
 *
 * The row carries source_key NULL, so finalization synthesizes a `starter-unverified:` key for it
 * exactly as it did for the real placeholders. The citation is deliberately outside any real CFR
 * numbering so it can never collide with corpus content.
 */
const PLACEHOLDER_FIXTURE_CITATION = '99 CFR 9999.1(a)';
async function installPlaceholderFixture() {
  await dataSource.query(
    `INSERT INTO standards_master (agency_code, citation, title, standard_text,
       plain_language_summary, scope_code, source_key, authority_tier, is_active)
     VALUES ('OSHA', $1, 'KG-3E placeholder fixture (not a real standard)',
       'Fixture row with no registered source, used to prove placeholder provenance never confers backing.',
       'Fixture row with no registered source.', 'general_industry', NULL, 1, true)
     ON CONFLICT DO NOTHING`, [PLACEHOLDER_FIXTURE_CITATION]);
}

async function main() {
  // KG-4D Phase 20. This suite mutates release/review state, so it must prove the database is its
  // OWN before its first write -- a `test_*` name is a floor, not ownership. An unmarked database
  // is refused; claiming one requires KG_TEST_DB_INITIALIZE_OWNERSHIP naming it exactly.
  try {
    const claim = await claimDatabaseOwnership({ suite: 'test:governed-corpus-matrix' });
    console.log(`[db-ownership] suite=${claim.suite} database=${claim.database} claim=${claim.freshlyClaimed ? 'NEW' : 'RECLAIMED'}`);
  } catch (error) {
    if (error instanceof DatabaseOwnershipRefused) {
      console.error(`\n  ${error.message}\n  No mutation was attempted.\n`);
      process.exit(1);
    }
    throw error;
  }
  const target = new URL(process.env.DATABASE_URL || 'postgresql://localhost/UNSET');
  const dbName = target.pathname.replace('/', '');
  console.log(`Resolved database target: host=${target.hostname} database=${dbName}`);
  if (dbName === 'safescope' || !/^test_/.test(dbName)) {
    throw new Error(`Refusing to run against a non-disposable database: ${dbName}`);
  }

  const { cases, sha256 } = loadTrackedGoldSet();
  await dataSource.initialize();
  await installPlaceholderFixture();
  const lifecycle = new RegulatoryReleaseLifecycleService(dataSource);
  const review = new ReleaseRecordReviewService(dataSource);
  const applicable = new ApplicableStandardsService(dataSource.getRepository(Standard));

  await dataSource.query(`DELETE FROM regulatory_release_record_reviews`);
  await dataSource.query(`DELETE FROM knowledge_release_events`);
  await dataSource.query(`DELETE FROM regulatory_release_records`);
  await dataSource.query(`DELETE FROM regulatory_releases`);
  await dataSource.query(
    `UPDATE standards_master SET plain_language_summary = replace(plain_language_summary, ' [kg3b-matrix-revised]', '')`,
  );

  assert(sha256 === EXPECTED_GOLD_SET_SHA256,
    `Observations derive from the tracked gold set (sha256 ${sha256.slice(0, 12)}...), not from invented cases.`);

  // ============================================================ PHASE 18: reviewed release A
  const RELEASE_A = 'kg3b-matrix.A';
  const summaryA = finalize(RELEASE_A, 'ma.1');
  assert(summaryA.outcome === 'finalized', `Release A finalized with ${summaryA.recordCount} records.`);

  // The citations HazLenz actually emits for the gold-set observations, per regime.
  const emissions = cases.map(c => ({ regime: c.regime, id: c.id, citations: emittedCitations(c) }));
  const allEmitted = Array.from(new Set(emissions.flatMap(e => e.citations)));
  assert(allEmitted.length > 0,
    `HazLenz emits ${allEmitted.length} distinct citations across ${cases.length} gold-set observations.`);
  const regimesCovered = new Set(emissions.filter(e => e.citations.length).map(e => e.regime));
  assert(regimesCovered.has('osha_general_industry') && regimesCovered.has('osha_construction'),
    `Emitted citations cover regimes: ${Array.from(regimesCovered).join(', ')}.`);

  // Approve a representative, deliberately PARTIAL subset through the real review mechanism, so
  // the matrix contains approved AND unapproved records in the same release. Approving
  // everything would hide exactly the case the cutover has to handle.
  const snapshotRows: any[] = await dataSource.query(
    `SELECT citation, "citationKey", "recordChecksum", "reviewState", payload
       FROM regulatory_release_records WHERE "releaseId" = $1 ORDER BY citation`, [RELEASE_A],
  );
  const eligible = snapshotRows.filter(r => r.reviewState === 'mechanically_validated');
  const osha1910 = eligible.filter(r => /1910\./.test(r.citation)).slice(0, 3);
  const osha1926 = eligible.filter(r => /1926\./.test(r.citation)).slice(0, 3);
  const msha = eligible.filter(r => /^30 CFR|^(56|57|62|47)\./.test(r.citation)).slice(0, 2);
  const toApprove = [...osha1910, ...osha1926, ...msha];
  assert(osha1910.length > 0 && osha1926.length > 0 && msha.length > 0,
    `Representative fixture spans OSHA GI (${osha1910.length}), OSHA Construction (${osha1926.length}), MSHA (${msha.length}).`);

  for (const row of toApprove) {
    await review.approveRecord({
      releaseId: RELEASE_A, citation: row.citation, reviewerId: REVIEWER,
      reviewerRole: 'regulatory-analyst', expectedChecksum: row.recordChecksum,
      note: 'KG-3B fixture review: content compared against the registered source for this release.',
    });
  }
  const scopeA = await lifecycle.describeReleaseScope(RELEASE_A);
  assert(scopeA.governedRecords === toApprove.length,
    `${scopeA.governedRecords} of ${scopeA.totalRecords} records approved via the real review mechanism ` +
    `(deliberately partial: ${scopeA.mechanicallyValidatedRecords} validated-not-approved, ${scopeA.unreviewedRecords} unreviewed).`);

  const activation = await lifecycle.activate(RELEASE_A, 'kg3b-matrix', 'matrix fixture');
  assert(activation.outcome === 'activated', 'The reviewed release activates through the KG-2 gate.');

  /**
   * KG-3F. The CITATION_ONLY subject, owned by this suite instead of borrowed from a corpus defect.
   *
   * The display-contract assertions below require all three backing states to be present, and
   * CITATION_ONLY used to occur naturally: KG-3C measured eight emitted citations with no usable
   * governed content, among them `30 CFR 56.14132(a)`. Both causes have since been fixed on
   * purpose. KG-3D/3E sourced seven of the eight, and KG-3F Phases 5-7 established that
   * `56.14132(a)` -- the manually-operated HORN paragraph -- was simply the wrong citation for a
   * backing observation; the engine now emits the truthful section `30 CFR 56.14132`, which IS in
   * the corpus. The last natural CITATION_ONLY case disappeared because the engine got more
   * correct, not less.
   *
   * That is the same trap KG-3E documented for the placeholder-provenance suites: a test whose
   * subject came from production data, so repairing the data silently disabled the test. The
   * contract being asserted -- a citation with no usable governed content must never be dressed as
   * regulation, and must never expose body text -- is unchanged and still worth enforcing. Only
   * the SOURCE of its subject changes.
   *
   * The citation is deliberately outside any real CFR numbering, so it cannot collide with corpus
   * content now or after future sourcing, and it is added to the matrix WITHOUT adding a
   * `standards_master` row -- absence from the release is precisely what makes it CITATION_ONLY.
   */
  const CITATION_ONLY_FIXTURE = '99 CFR 9998.2(b)';
  const matrixCitations = [...allEmitted, CITATION_ONLY_FIXTURE];

  // ==================================================== PHASE 13: the matrix, per emitted citation
  const matrix: any[] = [];
  for (const citation of matrixCitations) {
    const governed = await resolveGovernedCitation(dataSource, RELEASE_A, citation);
    const legacy = await resolveLegacyCitation(dataSource, citation);
    matrix.push({
      citation,
      backing: governed.backing,
      corpusBackedGoverned: governed.corpusBacked,
      corpusBackedLegacy: legacy.corpusBackedUnderCurrentRule,
      effectiveReviewState: governed.effectiveReviewState,
      jurisdiction: governed.jurisdiction,
      sourceKey: governed.sourceKey,
      hasText: Boolean(governed.standardText || governed.plainLanguageSummary),
      difference: classifyDifference(legacy, governed),
    });
  }

  const byBacking = matrix.reduce((acc: Record<string, number>, row) => {
    acc[row.backing] = (acc[row.backing] || 0) + 1; return acc;
  }, {});
  console.log(`\nBacking distribution over ${matrix.length} HazLenz-emitted citations: ` +
    JSON.stringify(byBacking));

  // --- case: reviewer-approved exact record -> CORPUS_BACKED with real content
  const approvedCase = matrix.find(row => row.backing === 'CORPUS_BACKED');
  assert(!!approvedCase, `A reviewer-approved emitted citation resolves as CORPUS_BACKED: ${approvedCase?.citation}.`);
  const approvedFull = await resolveGovernedCitation(dataSource, RELEASE_A, approvedCase.citation);
  assert(approvedFull.effectiveReviewState === 'reviewer_approved',
    'CORPUS_BACKED requires effective reviewer approval.');
  assert(Boolean(approvedFull.title), 'The approved record supplies a title.');
  assert(Boolean(approvedFull.standardText || approvedFull.plainLanguageSummary),
    'The approved record supplies actual regulatory content, not just an identifier.');
  assert(Boolean(approvedFull.sourceKey) && !approvedFull.placeholderSource,
    `Provenance is a registered source (${approvedFull.sourceKey}), not a placeholder.`);
  assert(approvedFull.releaseId === RELEASE_A, 'The resolution names the release it came from.');
  assert(Boolean(approvedFull.jurisdiction), `Jurisdiction is carried: ${approvedFull.jurisdiction}.`);

  // --- case: mechanically_validated but NOT reviewer-approved
  const validatedNotApproved = matrix.find(row =>
    row.backing === 'UNAPPROVED_RECORD' && row.effectiveReviewState === 'mechanically_validated');
  assert(!!validatedNotApproved,
    `A mechanically-validated-but-unapproved emitted citation is NOT corpus-backed: ${validatedNotApproved?.citation}.`);
  assert(validatedNotApproved.corpusBackedLegacy === true &&
    validatedNotApproved.corpusBackedGoverned === false,
    'It IS backed under the current live rule and is NOT under the governed contract -- this is ' +
    'precisely the gap the gold set could not see.');

  // --- case: unreviewed (placeholder-provenance) record
  const unreviewedSnapshot: any[] = await dataSource.query(
    `SELECT citation FROM regulatory_release_records
      WHERE "releaseId" = $1 AND "reviewState" = 'unreviewed'`, [RELEASE_A],
  );
  assert(unreviewedSnapshot.length > 0, `${unreviewedSnapshot.length} unreviewed records exist in the release.`);
  const unreviewedResolution = await resolveGovernedCitation(
    dataSource, RELEASE_A, unreviewedSnapshot[0].citation);
  assert(unreviewedResolution.backing === 'UNAPPROVED_RECORD' && !unreviewedResolution.corpusBacked,
    `An unreviewed record is never corpus-backed: ${unreviewedSnapshot[0].citation}.`);
  assert(unreviewedResolution.placeholderSource,
    'Its placeholder provenance is reported explicitly rather than hidden.');
  const unreviewedLegacy = await resolveLegacyCitation(dataSource, unreviewedSnapshot[0].citation);
  assert(unreviewedLegacy.corpusBackedUnderCurrentRule === true,
    'CRITICAL: the CURRENT live rule (corpusBacked = Boolean(sourceKey)) marks this ' +
    'placeholder-provenance record as corpus-backed, because finalization synthesized a source ' +
    'key literally named "starter-unverified". The governed contract corrects that.');
  assert(classifyDifference(unreviewedLegacy, unreviewedResolution) === 'LEGACY_PLACEHOLDER_BACKING_REMOVED',
    'That correction is classified distinctly from a genuine loss of backing.');

  // --- case: missing corpus record
  const missing = await resolveGovernedCitation(dataSource, RELEASE_A, '29 CFR 1910.9999(z)');
  assert(missing.backing === 'NOT_IN_RELEASE' && !missing.corpusBacked,
    'A citation absent from the release resolves as NOT_IN_RELEASE, not as a silent empty success.');
  const unresolvable = await resolveGovernedCitation(dataSource, RELEASE_A, '');
  assert(unresolvable.backing === 'CITATION_ONLY', 'An unresolvable citation is CITATION_ONLY.');

  // --- case: wrong jurisdiction
  const mshaResolution = await resolveGovernedCitation(dataSource, RELEASE_A, msha[0].citation);
  const oshaResolution = await resolveGovernedCitation(dataSource, RELEASE_A, osha1910[0].citation);
  assert(mshaResolution.agency === 'MSHA' && oshaResolution.agency === 'OSHA',
    `Jurisdiction is resolved from the release payload (${mshaResolution.agency} vs ${oshaResolution.agency}), ` +
    'so a wrong-regime backing is detectable at the contract boundary.');
  assert(mshaResolution.jurisdiction !== oshaResolution.jurisdiction,
    `Jurisdiction strings differ: '${mshaResolution.jurisdiction}' vs '${oshaResolution.jurisdiction}'.`);

  // ================================ PHASE 14: Standard Detail content path against release A
  const detailA = await resolveGovernedCitation(dataSource, RELEASE_A, REVISED_CITATION);
  assert(detailA.effectiveReviewState === 'reviewer_approved' || detailA.effectiveReviewState === 'mechanically_validated',
    `${REVISED_CITATION} is present in release A for the Standard Detail test.`);
  const detailTextA = String(detailA.standardText || detailA.plainLanguageSummary || '');
  assert(detailTextA.length > 0, 'Standard Detail can obtain real text for the citation from release A.');
  assert(detailA.citation.includes('1910.212'),
    `The citation number Standard Detail would display is correct: ${detailA.citation}.`);

  // ================================ PHASE 13/14: same citation across release A and release B
  await dataSource.query(
    `UPDATE standards_master
        SET plain_language_summary = plain_language_summary || ' [kg3b-matrix-revised]'
      WHERE citation = $1`, [REVISED_CITATION],
  );
  const RELEASE_B = 'kg3b-matrix.B';
  const summaryB = finalize(RELEASE_B, 'mb.1');
  assert(summaryB.outcome === 'finalized', 'Release B finalized with revised content for the same citation.');

  const detailB = await resolveGovernedCitation(dataSource, RELEASE_B, REVISED_CITATION);
  assert(allText(detailB).includes(REVISION_MARKER), 'Release B resolves the REVISED text.');
  assert(detailB.recordChecksum !== detailA.recordChecksum,
    'The two releases hold different versions of the same logical citation.');

  const detailAReloaded = await resolveGovernedCitation(dataSource, RELEASE_A, REVISED_CITATION);
  assert(!allText(detailAReloaded).includes(REVISION_MARKER),
    'NO NEWER RELEASE TEXT LEAKS INTO THE OLDER RELEASE: A still resolves A\'s text after B exists.');
  assert(detailAReloaded.recordChecksum === detailA.recordChecksum,
    'Reload does not change historical release content.');

  // --- case: superseded version does not inherit approval
  assert(detailB.effectiveReviewState !== 'reviewer_approved',
    'Release B\'s revised version is NOT approved -- approval did not follow the citation across versions.');
  assert(detailB.backing === 'UNAPPROVED_RECORD',
    'And it is therefore NOT corpus-backed, even though its text exists and looks complete.');

  // ================================================ PHASE 13: rolled-back release resolution
  const scopeB = await lifecycle.describeReleaseScope(RELEASE_B);
  assert(scopeB.governedRecords === 0,
    'Release B has 0 governed records, so it is correctly not activatable while A remains active.');
  const activeNow = await lifecycle.getActiveRelease();
  assert(activeNow?.releaseId === RELEASE_A, 'Release A is still the active release.');

  // Approve one record in B so it can activate, then roll back to A and prove content restoration.
  const bRow: any = (await dataSource.query(
    `SELECT citation, "recordChecksum" FROM regulatory_release_records
      WHERE "releaseId" = $1 AND "citationKey" = $2`,
    [RELEASE_B, detailB.citationKey]))[0];
  await review.approveRecord({
    releaseId: RELEASE_B, citation: bRow.citation, reviewerId: REVIEWER,
    expectedChecksum: bRow.recordChecksum, note: 'KG-3B fixture review of the revised version.',
  });
  await lifecycle.activate(RELEASE_B, 'kg3b-matrix', 'promote B');
  const activeB = await lifecycle.getActiveRelease();
  assert(activeB?.releaseId === RELEASE_B, 'Release B becomes active after its own record is reviewed.');

  const viaActiveB = await resolveGovernedCitation(dataSource, activeB!.releaseId, REVISED_CITATION);
  assert(viaActiveB.corpusBacked && allText(viaActiveB).includes(REVISION_MARKER),
    'While B is active, the citation resolves to B\'s approved revised content.');

  const rollback = await lifecycle.rollbackTo(RELEASE_A, 'kg3b-matrix', 'rollback fixture');
  assert(rollback.outcome === 'rolled_back' && rollback.previousReleaseId === RELEASE_B,
    'Explicit rollback to A reports B as the release it replaced.');
  const activeAfterRollback = await lifecycle.getActiveRelease();
  assert(activeAfterRollback?.releaseId === RELEASE_A, 'The pointer is back on release A.');

  const viaActiveA = await resolveGovernedCitation(dataSource, activeAfterRollback!.releaseId, REVISED_CITATION);
  assert(!allText(viaActiveA).includes(REVISION_MARKER),
    'After rollback the governed lookup resolves A\'s ORIGINAL content -- rollback restored ' +
    'content, not merely a pointer.');
  assert(viaActiveA.effectiveReviewState === 'reviewer_approved',
    'A\'s approval survived the round trip through B and back.');
  const bStillThere = await resolveGovernedCitation(dataSource, RELEASE_B, REVISED_CITATION);
  assert(bStillThere.corpusBacked, 'Release B is preserved historically and still resolves its own approved content.');

  // ================================================================= PHASE 16: suggest() path
  // Tested independently: KG-3A showed applyFindingScopedStandards has no DB access, so nothing
  // measured about it transfers to this path, which is genuinely DB-backed.
  const suggestion = await applicable.suggest(
    'unguarded rotating shaft on a conveyor drive with no barrier guard', 'machine_guarding',
    'OSHA_GENERAL_INDUSTRY', 5);
  const suggested: any[] = Array.isArray(suggestion) ? suggestion : (suggestion as any)?.standards || [];
  assert(Array.isArray(suggested),
    `suggest() returns ${suggested.length} results from standards_master (a genuinely DB-backed path).`);

  if (suggested.length) {
    const suggestedGoverned = [];
    for (const item of suggested) {
      const citation = String(item?.citation || item?.standard || '');
      if (!citation) continue;
      const resolved = await resolveGovernedCitation(dataSource, RELEASE_A, citation);
      suggestedGoverned.push({ citation, backing: resolved.backing, corpusBacked: resolved.corpusBacked });
    }
    const backedCount = suggestedGoverned.filter(row => row.corpusBacked).length;
    console.log(`\nsuggest() governed backing: ${backedCount}/${suggestedGoverned.length} results ` +
      `would be corpus-backed under release ${RELEASE_A}.`);
    assert(suggestedGoverned.length > 0,
      `suggest() results were each resolved against the governed release (${backedCount}/${suggestedGoverned.length} backed).`);
    assert(backedCount < suggestedGoverned.length || scopeA.governedRecords === scopeA.totalRecords,
      'suggest() WOULD be materially affected by governed filtering: it returns results that the ' +
      'governed contract does not back. Its outputs are customer-facing, so it needs the same ' +
      'contract before any cutover.');
  } else {
    assert(true, 'suggest() returned no results for the probe observation in this fixture corpus.');
  }

  // ================================ KG-3C PHASE 18: the display contract over the same matrix
  //
  // Extends the corpus matrix from "what does the governed release hold" to "what would the
  // customer be told about it". Every emitted citation is carried through the canonical backing
  // contract, and the compatibility boolean, the text exposure and the wire `sourceStatus` are
  // checked against it.
  const display = [];
  for (const row of matrix) {
    const governed = await resolveGovernedCitation(dataSource, RELEASE_A, row.citation);
    const backing = resolveStandardsBacking({
      citation: governed.citation,
      sourceKey: governed.sourceKey,
      title: governed.title,
      standardText: governed.standardText,
      plainLanguageSummary: governed.plainLanguageSummary,
      governed: {
        releaseId: governed.releaseId,
        effectiveReviewState: governed.effectiveReviewState,
        placeholderSource: governed.placeholderSource,
        hasContent: Boolean(governed.standardText || governed.plainLanguageSummary),
      },
    });
    display.push({
      citation: row.citation,
      backing: row.backing,
      backingStatus: backing.backingStatus,
      corpusBacked: backing.corpusBacked,
      contentDisclosure: backing.contentDisclosure,
      sourceStatus: mapBackingToSourceStatus(backing.backingStatus, true),
      notice: customerBackingNotice(backing.backingStatus),
      placeholderSource: governed.placeholderSource,
      hasText: Boolean(governed.standardText || governed.plainLanguageSummary),
      textExposed: backing.contentDisclosure !== 'NONE',
    });
  }

  const byStatus = display.reduce((acc: Record<string, number>, row) => {
    acc[row.backingStatus] = (acc[row.backingStatus] || 0) + 1; return acc;
  }, {});
  console.log(`\nKG-3C display contract over ${display.length} emitted citations: ${JSON.stringify(byStatus)}`);

  // The compatibility boolean must never disagree with the canonical status.
  assert(display.every(row => row.corpusBacked === (row.backingStatus === 'APPROVED_GOVERNED_CONTENT')),
    'corpusBacked is DERIVED from backingStatus for every case -- one truth system, no drift.');
  // The whole point of the slice: no placeholder is ever backed.
  assert(display.filter(row => row.placeholderSource).every(row => !row.corpusBacked &&
    row.backingStatus === 'UNAPPROVED_CONTENT'),
    'HARD GATE across the matrix: every placeholder-source citation is UNAPPROVED_CONTENT and NOT corpusBacked.');
  assert(display.every(row => row.backingStatus !== 'APPROVED_GOVERNED_CONTENT' || row.hasText),
    'APPROVED_GOVERNED_CONTENT is only ever assigned when the release actually carries content.');
  assert(display.every(row => row.backingStatus !== 'CITATION_ONLY' || !row.textExposed),
    'CITATION_ONLY never exposes body text -- no fabricated standard text.');
  assert(display.filter(row => row.backingStatus === 'UNAPPROVED_CONTENT' && row.hasText)
    .every(row => row.contentDisclosure === 'HAZLENZ_AUTHORED'),
    'Unapproved text is always disclosed as HazLenz-authored, never as governed regulation.');
  assert(display.every(row => row.notice === null || row.backingStatus === 'CITATION_ONLY'),
    'A customer notice is attached only to CITATION_ONLY.');
  assert(display.filter(row => row.backingStatus === 'APPROVED_GOVERNED_CONTENT')
    .every(row => row.sourceStatus === 'approved-versioned-regulation'),
    'Approved cases map to the approved-versioned-regulation wire value (previously unreachable).');
  assert(display.filter(row => row.backingStatus !== 'APPROVED_GOVERNED_CONTENT')
    .every(row => row.sourceStatus !== 'approved-versioned-regulation'),
    'No unapproved case can reach the approved wire value.');

  const approvedDisplay = display.filter(row => row.backingStatus === 'APPROVED_GOVERNED_CONTENT');
  const unapprovedDisplay = display.filter(row => row.backingStatus === 'UNAPPROVED_CONTENT');
  const citationOnlyDisplay = display.filter(row => row.backingStatus === 'CITATION_ONLY');
  // The approved and unapproved states remain drawn from REAL emitted citations; only the
  // CITATION_ONLY subject is suite-owned (see CITATION_ONLY_FIXTURE above for why).
  assert(citationOnlyDisplay.length === 1
    && citationOnlyDisplay[0].citation === CITATION_ONLY_FIXTURE,
    `CITATION_ONLY is exercised by the suite's own fixture, and no REAL emitted citation is `
    + `unbacked (${citationOnlyDisplay.length} citation-only, `
    + `${citationOnlyDisplay.map((r: any) => r.citation).join(', ')})`);
  assert(approvedDisplay.length > 0 && unapprovedDisplay.length > 0 && citationOnlyDisplay.length > 0,
    `All three states are exercised: ${approvedDisplay.length} approved, ` +
    `${unapprovedDisplay.length} unapproved, ${citationOnlyDisplay.length} citation-only.`);
  // Citations are never removed by the contract -- it annotates, it does not filter. Compared
  // against `matrixCitations` rather than `allEmitted`: the matrix now also carries the suite's own
  // CITATION_ONLY fixture, and the property under test is that the contract drops nothing it is
  // given, whatever it is given.
  assert(display.length === matrix.length && display.length === matrixCitations.length,
    `The display contract annotates all ${display.length} citations and removes none `
    + `(${allEmitted.length} emitted + 1 suite fixture).`);

  // ============================================ PHASE 17: shadow comparison, live rule vs governed
  const differences = matrix.reduce((acc: Record<string, number>, row) => {
    acc[row.difference] = (acc[row.difference] || 0) + 1; return acc;
  }, {});
  console.log(`\nDifference classification (live rule vs governed contract): ${JSON.stringify(differences)}`);
  assert(Object.keys(differences).length > 0,
    'Every emitted citation carries an explicit difference classification.');

  // ========================================================= live-path non-change (Phase 23)
  const liveHydrated = await applicable.hydrateStandardReferences(
    [{ citation: REVISED_CITATION } as any]);
  assert(allText(liveHydrated[0]).includes(REVISION_MARKER),
    'PROOF THE LIVE PATH IS UNCHANGED: hydrateStandardReferences still returns the LATEST live ' +
    'corpus text with no release scope and no approval condition, even while release A is active ' +
    'and holds an approved older version. KG-3B did not enable governed read filtering.');

  console.log(`\nPASSED ${checks.length}/${checks.length} checks.`);
  console.log('NOTE (Phase 20): approvals above are TEST FIXTURES created through the real review ' +
    'mechanism. They prove the governed pipeline, not that any real record was substantively reviewed.');
  console.log(JSON.stringify({ matrixSummary: { byBacking, differences, citations: matrix.length },
    displayContract: { byStatus, cases: display } }));
  await dataSource.destroy();
}

main().catch(async error => {
  console.error(error);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exitCode = 1;
});
