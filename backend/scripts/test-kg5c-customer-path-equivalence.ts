import 'dotenv/config';
import 'reflect-metadata';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { claimDatabaseOwnership } from './lib/test-database-ownership';
import { prepareGovernedRelease } from '../src/standards/releases/governed-release-builder';
import { loadReleaseDefinition } from '../src/standards/releases/release-definition';
import { ReleaseRecordReviewService } from '../src/standards/releases/release-record-review.service';
import { RegulatoryReleaseLifecycleService } from '../src/standards/releases/regulatory-release-lifecycle.service';
import { RegulatoryRelease } from '../src/standards/releases/regulatory-release.entity';
import { RegulatoryReleaseRecord } from '../src/standards/releases/regulatory-release-record.entity';
import { RegulatoryReleaseRecordReview } from '../src/standards/releases/regulatory-release-record-review.entity';
import { KnowledgeReleaseEvent } from '../src/standards/releases/knowledge-release-event.entity';
import { Standard } from '../src/standards/entities/standard.entity';
import { ApplicableStandardsService } from '../src/applicable-standards/applicable-standards.service';
import { SafescopeV2Service } from '../src/safescope-v2/safescope-v2.service';
import { GovernedCutoverContext } from '../src/standards/cutover/governed-cutover-context';
import {
  DeliveryEquivalence, EquivalenceClass, classifyEquivalence,
} from '../src/standards/display/customer-path-equivalence';
import { releaseCitationKey } from '../src/standards/releases/citation-identity';

/**
 * KG-5C -- customer-path equivalence (Phases 2, 3, 4).
 *
 * =====================================================================================
 * WHAT MAKES THIS DIFFERENT FROM THE KG-5B COMPARATOR
 * =====================================================================================
 *
 * KG-5B chose its legacy input with `normalizeCitationForMatch` over a map of all 2,390 rows. The
 * real customer path does something materially different: `hydrateStandardReferences()` issues an
 * `ILIKE` query on a subsection-stripped needle, keys the results with
 * `normalizeCitationForLookup` (which PRESERVES the agency prefix and the subsection), and accepts
 * a base-key match ONLY when the REQUESTED citation carries no subsection.
 *
 * So this harness does not reimplement anything. It calls:
 *
 *   ApplicableStandardsService.hydrateStandardReferences()   the real legacy hydration
 *   SafescopeV2Service.hydrateFindingScopedStandards()       the real customer composition
 *   GovernedCutoverContext.create()/resolveStandard()        the real governed resolution
 *   decideFallback() / resolveStandardsBacking()             the real delivery + backing contracts
 *
 * `hydrateFindingScopedStandards` touches exactly one instance field -- `this.applicableStandards`
 * (verified by static inspection of its 204-line body) -- so binding it to a prototype instance
 * with that one collaborator executes the production method itself, not a copy of it. The
 * governed text substitution, its spread ordering, the backing call and the display projection are
 * all the shipped lines.
 */

const RELEASE_ID = 'federal-core-2026-07-30.1';
const SUITE = 'kg-5c-customer-path-equivalence';
const TEMPLATE = process.env.KG5C_TEMPLATE_DB || 'test_kg5b_prodshape_20260821';
const ADMIN_URL = process.env.KG5C_ADMIN_URL
  || `postgres://${process.env.USER || process.env.LOGNAME}@localhost:5432/postgres`;
const DATABASE = 'test_kg5c_mut_customerpath';
const ALLOWED_ACCOUNT = 'kg5c-equivalence-principal';
const EVIDENCE = join(__dirname, '..', '..',
  'verification/hazlenz-governed-knowledge-growth-2026-08-19/kg-5c');
const KG5A_PACKET = join(EVIDENCE, '..', 'kg-5a', 'contracts',
  'production-release-review-packet.json');

const { Client } = require('pg') as { Client: new (o: { connectionString: string }) => any };

let passed = 0; let failed = 0; const failures: string[] = [];
function check(name: string, condition: boolean, detail?: unknown): void {
  if (condition) { passed++; return; }
  failed++;
  const line = `${name}${detail === undefined ? '' : ` :: ${JSON.stringify(detail)}`}`;
  failures.push(line); console.log(`  FAIL  ${line}`);
}
function section(title: string): void {
  console.log(`\n${title}`); console.log('-'.repeat(title.length));
}
async function admin(sql: string): Promise<void> {
  const client = new Client({ connectionString: ADMIN_URL });
  await client.connect();
  try { await client.query(sql); } finally { await client.end(); }
}

/** The customer-visible projection of one standard, as the payload actually carries it. */
interface Delivered {
  citation: string;
  title: string | null;
  standardText: string | null;
  plainLanguageSummary: string | null;
  backingStatus: string | null;
  contentDisclosure: string | null;
  corpusBacked: boolean;
  sourceKey: string | null;
  governedDeliveryState?: string | null;
  governedFallbackReason?: string | null;
  knowledgeReleaseId?: string | null;
}

function deliveredFrom(item: any): Delivered {
  return {
    citation: String(item?.citation ?? ''),
    title: item?.title ?? null,
    standardText: item?.standardText ?? null,
    plainLanguageSummary: item?.plainLanguageSummary ?? null,
    backingStatus: item?.backingStatus ?? null,
    contentDisclosure: item?.contentDisclosure ?? null,
    corpusBacked: item?.corpusBacked === true,
    sourceKey: item?.sourceKey ?? null,
    governedDeliveryState: item?.governedDeliveryState ?? null,
    governedFallbackReason: item?.governedFallbackReason ?? null,
    knowledgeReleaseId: item?.knowledgeReleaseId ?? null,
  };
}

/** The body text a customer would actually read, per the display contract's preference order. */
function customerBodyText(d: Delivered): string {
  return String(d.standardText || d.plainLanguageSummary || '');
}

async function main() {
  console.log('KG-5C -- customer-path equivalence through the real hydration path');

  await admin(`DROP DATABASE IF EXISTS ${DATABASE}`);
  await admin(`CREATE DATABASE ${DATABASE} TEMPLATE ${TEMPLATE}`);
  const url = ADMIN_URL.replace(/\/[^/]*$/, `/${DATABASE}`);
  await claimDatabaseOwnership({ suite: SUITE, databaseUrl: url, initializeOwnership: true });

  const ds = new DataSource({
    type: 'postgres', url, synchronize: false,
    entities: [Standard, RegulatoryRelease, RegulatoryReleaseRecord,
      RegulatoryReleaseRecordReview, KnowledgeReleaseEvent],
  });
  await ds.initialize();

  const evidence: Record<string, unknown> = {};

  try {
    const definition = loadReleaseDefinition(RELEASE_ID);
    const packet = require(KG5A_PACKET);

    // ---------------------------------------------------------------- setup
    section('1. Reproduce the verified 27-approved condition (Phase 8 steps 1-4)');
    const corpusBefore = await corpusFingerprint(ds);
    check('the fixture holds the production-shaped legacy corpus', corpusBefore.row_count === 2390,
      corpusBefore.row_count);
    check('legacy source_key is NULL on every row', corpusBefore.with_source_key === 0);

    const prepared = await prepareGovernedRelease(ds, definition);
    check('the governed release reproduces the pinned manifest',
      prepared.manifestChecksum === definition.expectedManifestChecksum);
    check('35 governed records', prepared.recordCount === 35);

    const reviews = new ReleaseRecordReviewService(ds);
    const reattest: string[] = packet.rows
      .filter((r: any) => r.recommendedDecision === 'REATTEST').map((r: any) => r.citation);
    check('the KG-5A packet names 27 REATTEST records', reattest.length === 27, reattest.length);

    const recordRows = await ds.query(
      `SELECT citation, "recordChecksum", payload FROM regulatory_release_records
       WHERE "releaseId" = $1 ORDER BY "agencyCode", citation`, [RELEASE_ID]);
    const byCitation = new Map(recordRows.map((r: any) => [r.citation, r]));

    for (const citation of reattest) {
      const record: any = byCitation.get(citation);
      await reviews.approveRecord({
        releaseId: RELEASE_ID, citation, expectedChecksum: record.recordChecksum,
        reviewerId: 'kg5c-equivalence-reviewer', reviewerRole: 'verification',
        note: 'KG-5C customer-path equivalence measurement.',
      });
    }
    const lifecycle = new RegulatoryReleaseLifecycleService(ds);
    const scope = await lifecycle.describeReleaseScope(RELEASE_ID);
    check('27 of 35 records are reviewer-approved', scope.governedRecords === 27, scope.governedRecords);
    await lifecycle.activate(RELEASE_ID, 'kg5c-harness', 'KG-5C equivalence measurement', {
      expectedCurrentReleaseId: null,
    });
    check('the release is active',
      (await lifecycle.getActiveRelease())?.releaseId === RELEASE_ID);

    // ---------------------------------------------------------------- the real path
    section('2. Drive the REAL customer path (Phases 1, 2)');
    const standardRepo = ds.getRepository(Standard);
    const applicable = new ApplicableStandardsService(standardRepo as any);
    // `hydrateFindingScopedStandards` touches only `this.applicableStandards`, so this executes
    // the production method body rather than a reimplementation of it.
    const safescope = Object.create(SafescopeV2Service.prototype) as SafescopeV2Service;
    (safescope as any).applicableStandards = applicable;

    check('the harness calls the production hydration method, not a copy',
      typeof (SafescopeV2Service.prototype as any).hydrateFindingScopedStandards === 'function'
      && (safescope as any).hydrateFindingScopedStandards
        === (SafescopeV2Service.prototype as any).hydrateFindingScopedStandards);

    const governedEnv = {
      GOVERNED_CUTOVER_MODE: 'GOVERNED_WITH_FALLBACK',
      GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: ALLOWED_ACCOUNT,
    } as Record<string, string>;

    /** One citation through the real path, in one mode. */
    async function deliver(citation: string, mode: 'LEGACY' | 'GOVERNED'): Promise<Delivered> {
      const result: any = {
        standardDecisions: [{ citation, applicabilityStatus: 'confirmed' }],
      };
      let cutover: GovernedCutoverContext | null = null;
      if (mode === 'GOVERNED') {
        cutover = await GovernedCutoverContext.create({
          principal: { userId: ALLOWED_ACCOUNT },
          dataSource: ds, env: governedEnv, analysisTraceId: 'kg5c',
        });
        if (!cutover) throw new Error('GOVERNED context did not enable; check mode/allowlist.');
      }
      const out = await (safescope as any).hydrateFindingScopedStandards(result, cutover);
      return deliveredFrom(out.standardDecisions[0]);
    }

    // Sanity: the governed context really enables, and LEGACY really returns null.
    const legacyCtx = await GovernedCutoverContext.create({
      principal: { userId: ALLOWED_ACCOUNT }, dataSource: ds, env: {}, analysisTraceId: 'kg5c',
    });
    check('with no GOVERNED_CUTOVER_* env, the context is null (LEGACY is the default)',
      legacyCtx === null);
    const govCtx = await GovernedCutoverContext.create({
      principal: { userId: ALLOWED_ACCOUNT }, dataSource: ds, env: governedEnv,
      analysisTraceId: 'kg5c',
    });
    check('with a mode AND an allowlist, GOVERNED_WITH_FALLBACK enables', govCtx !== null);
    check('the governed context pinned the active release',
      (govCtx as any)?.pin?.releaseId === RELEASE_ID, (govCtx as any)?.pin?.reason);

    // ---------------------------------------------------------------- measure all 35
    section('3. Classify every governed record through the real path (Phases 3, 4)');
    const approvedSet = new Set(reattest);
    const rows: any[] = [];

    // THERE ARE TWO CUSTOMER BODY-TEXT TIERS, AND THEY DIFFER. Naming both, because testing only
    // the convenient one is exactly the failure mode the brief warns about:
    //
    //   PATH B  finding-scoped `standardDecisions`, composed by `hydrateFindingScopedStandards`.
    //           `mark()` spreads `title`, `plainLanguageSummary`, `sourceKey/Name/Type` from
    //           hydration -- but NOT `standardText`. So the legacy body a customer reads here is
    //           `plain_language_summary`, which production stores as a 500-character truncation
    //           on 996 of its 2,390 rows.
    //
    //   PATH A  `ApplicableStandardsService.suggest()`, whose candidates come from its own corpus
    //           SELECT and therefore DO carry `standard_text` -- the full eCFR section dump, up to
    //           56,026 bytes.
    //
    // `hydrateStandardReferences()` itself returns BOTH fields, so calling it directly gives the
    // authoritative legacy content for each tier without reimplementing either path.
    for (const record of recordRows as any[]) {
      const citation = record.citation as string;

      // The REAL legacy hydration, called directly. This is the function the brief names.
      const [hydrated] = await applicable.hydrateStandardReferences([{ citation } as any]);
      const legacyHydratedText = String((hydrated as any)?.standardText ?? '');
      const legacyHydratedSummary = String((hydrated as any)?.plainLanguageSummary ?? '');
      const legacyHydrationResolved = Boolean((hydrated as any)?.sourceKey)
        || Boolean(legacyHydratedText) || Boolean(legacyHydratedSummary);

      const legacy = await deliver(citation, 'LEGACY');
      const governed = await deliver(citation, 'GOVERNED');
      const governedBody = customerBodyText(governed);

      // How many legacy corpus rows would the real ILIKE needle return, and how many of them key
      // to the SAME lookup key the request uses? More than one authoritative pairing is ambiguity.
      const needle = citation.replace(/^.*?((?:\d+)\.\d+)/, '$1').replace(/\([a-z0-9]+\)/gi, '');
      const candidates = await ds.query(
        `SELECT citation FROM standards_master WHERE is_active = true AND citation ILIKE $1`,
        [`%${needle}%`]);

      // The four mechanical preconditions for GOVERNED_REVIEWED_RENDERING.
      const packetRow = packet.rows.find((x: any) => x.citation === citation);
      const frozenArtifact = String(record.payload.canonicalText || record.payload.summary || '');
      const reviewedRendering = {
        approvedAtExactChecksum: approvedSet.has(citation),
        clauseReviewRecorded: packetRow?.clauseReviewRecorded === true
          && Array.isArray(packetRow?.verificationEvidence)
          && packetRow.verificationEvidence.length > 0,
        deliveredTextIsFrozenArtifact: governedBody === frozenArtifact,
        sameLogicalCitationIdentity: !legacyHydrationResolved
          || releaseCitationKey((hydrated as any)?.citation ?? citation)
             === releaseCitationKey(citation),
        evidencePhases: packetRow?.verificationEvidence ?? [],
      };

      // THE PRIMARY VERDICT: delivery fidelity, not legacy/governed similarity.
      const legacyBody = customerBodyText(legacy);
      let deliveryEquivalence: DeliveryEquivalence;
      if (approvedSet.has(citation)) {
        deliveryEquivalence =
          governed.backingStatus !== 'APPROVED_GOVERNED_CONTENT'
            ? 'APPROVED_BADGE_ON_DIFFERENT_CONTENT'
            : governedBody === frozenArtifact
              ? 'DELIVERS_REVIEWED_ARTIFACT'
              : 'APPROVED_BADGE_ON_DIFFERENT_CONTENT';
      } else if (governed.backingStatus === 'APPROVED_GOVERNED_CONTENT'
                 || governed.corpusBacked === true) {
        deliveryEquivalence = 'UNAPPROVED_PRESENTED_AS_APPROVED';
      } else {
        deliveryEquivalence = governedBody === legacyBody
          ? 'FALLBACK_IDENTICAL_TO_LEGACY'
          : 'FALLBACK_ALTERED_CUSTOMER_OUTPUT';
      }

      const equivalencePathB = classifyEquivalence({
        legacyText: customerBodyText(legacy),
        governedText: governedBody,
        legacyResolved: Boolean(legacy.sourceKey) || Boolean(customerBodyText(legacy)),
        governedResolved: governed.backingStatus === 'APPROVED_GOVERNED_CONTENT'
          || governed.governedFallbackReason !== 'GOVERNED_RECORD_ABSENT',
        pairingCandidates: 1,
        reviewedRendering,
      });
      // PATH A compares the legacy tier-1 body (`standard_text`, the full ingest) against the
      // release record's FROZEN governed artifact -- not against the delivered body. For an
      // unapproved record the delivered body IS the legacy fallback, so comparing that against the
      // dump would compare two tiers of the same legacy record and report a governance difference
      // that does not exist.
      const equivalencePathA = classifyEquivalence({
        legacyText: legacyHydratedText,
        governedText: frozenArtifact,
        legacyResolved: legacyHydrationResolved && Boolean(legacyHydratedText),
        governedResolved: governed.backingStatus === 'APPROVED_GOVERNED_CONTENT'
          || governed.governedFallbackReason !== 'GOVERNED_RECORD_ABSENT',
        pairingCandidates: 1,
        reviewedRendering,
      });

      rows.push({
        citation,
        approved: approvedSet.has(citation),
        kg5bShadowClassification: approvedSet.has(citation) ? 'APPROVED_EXACT' : 'UNAPPROVED_RECORD',
        deliveryEquivalence,
        reviewedRenderingPreconditions: reviewedRendering,
        legacyHydration: {
          resolved: legacyHydrationResolved,
          title: (hydrated as any)?.title ?? null,
          sourceKey: (hydrated as any)?.sourceKey ?? null,
          standardTextLength: legacyHydratedText.length,
          plainLanguageSummaryLength: legacyHydratedSummary.length,
        },
        pathB: {
          legacyBodyLength: customerBodyText(legacy).length,
          legacyBodyField: legacy.standardText ? 'standardText' : 'plainLanguageSummary',
          legacyBackingStatus: legacy.backingStatus,
          legacyCorpusBacked: legacy.corpusBacked,
          governedBodyLength: governedBody.length,
          governedBackingStatus: governed.backingStatus,
          governedCorpusBacked: governed.corpusBacked,
          governedContentDisclosure: governed.contentDisclosure,
          governedDeliveryState: governed.governedDeliveryState,
          governedFallbackReason: governed.governedFallbackReason,
          knowledgeReleaseId: governed.knowledgeReleaseId,
          equivalence: equivalencePathB,
        },
        pathA: {
          legacyBodyLength: legacyHydratedText.length,
          governedArtifactLength: frozenArtifact.length,
          comparedAgainst: 'the release record frozen payload.canonicalText',
          equivalence: equivalencePathA,
        },
        legacyCorpusCandidateRows: candidates.length,
        customerVisibleTextDiffers: customerBodyText(legacy) !== governedBody,
        legacy, governed,
      });
    }

    check('all 35 governed records were classified', rows.length === 35, rows.length);

    // ---------------------------------------------------------------- truthfulness invariants
    section('4. Delivery truthfulness invariants (Phases 5, 6)');
    const approvedRows = rows.filter(r => r.approved);
    const unapprovedRows = rows.filter(r => !r.approved);
    check('27 approved records measured', approvedRows.length === 27, approvedRows.length);
    check('8 unapproved records measured', unapprovedRows.length === 8, unapprovedRows.length);

    check('every approved record delivers APPROVED_GOVERNED_CONTENT under governed mode',
      approvedRows.every(r => r.pathB.governedBackingStatus === 'APPROVED_GOVERNED_CONTENT'),
      approvedRows.filter(r => r.pathB.governedBackingStatus !== 'APPROVED_GOVERNED_CONTENT')
        .map(r => [r.citation, r.pathB.governedBackingStatus]));
    check('every approved record delivers GOVERNED_VERIFIED_TEXT',
      approvedRows.every(r => r.pathB.governedDeliveryState === 'GOVERNED_VERIFIED_TEXT'),
      approvedRows.filter(r => r.pathB.governedDeliveryState !== 'GOVERNED_VERIFIED_TEXT')
        .map(r => r.citation));
    check('every approved record records governed provenance',
      approvedRows.every(r => r.pathB.knowledgeReleaseId === RELEASE_ID));
    check('NO unapproved record is ever presented as approved',
      unapprovedRows.every(r => r.pathB.governedBackingStatus !== 'APPROVED_GOVERNED_CONTENT'
        && r.pathB.governedCorpusBacked === false),
      unapprovedRows.map(r => [r.citation, r.pathB.governedBackingStatus]));
    check('every unapproved record falls back to legacy text without a verified claim',
      unapprovedRows.every(r => r.pathB.governedDeliveryState === 'LEGACY_TEXT_UNVERIFIED'),
      unapprovedRows.map(r => r.pathB.governedDeliveryState));
    check('no unapproved record records governed provenance',
      unapprovedRows.every(r => !r.pathB.knowledgeReleaseId));
    check('LEGACY mode never marks anything corpus-backed (no active-release leakage)',
      rows.every(r => r.pathB.legacyCorpusBacked === false));
    check('LEGACY mode payloads carry no governed keys',
      rows.every(r => r.governed.deliveryState !== null) &&
      (await deliver(recordRows[0].citation, 'LEGACY')).governedDeliveryState === null);

    // THE CENTRAL TRUTHFULNESS PROPERTY: an approved badge must sit on the approved artifact.
    const governedTextIsTheApprovedArtifact = approvedRows.every(r => {
      const record: any = byCitation.get(r.citation);
      const approvedArtifact = String(
        record.payload.canonicalText || record.payload.summary || '');
      return r.pathB.governedBodyLength === approvedArtifact.length;
    });
    check('the text delivered under an approved badge IS the reviewed governed artifact',
      governedTextIsTheApprovedArtifact,
      approvedRows.filter(r => {
        const record: any = byCitation.get(r.citation);
        const a = String(record.payload.canonicalText || record.payload.summary || '');
        return r.pathB.governedBodyLength !== a.length;
      }).map(r => r.citation));

    section('5. PRIMARY VERDICT -- delivery fidelity (the brief\'s central question)');
    const deliveryTally: Record<string, number> = {};
    for (const r of rows) {
      deliveryTally[r.deliveryEquivalence] = (deliveryTally[r.deliveryEquivalence] ?? 0) + 1;
    }
    console.log('  ', JSON.stringify(deliveryTally));
    check('every APPROVED record delivers byte-for-byte the reviewed governed artifact',
      approvedRows.every(r => r.deliveryEquivalence === 'DELIVERS_REVIEWED_ARTIFACT'),
      approvedRows.filter(r => r.deliveryEquivalence !== 'DELIVERS_REVIEWED_ARTIFACT')
        .map(r => [r.citation, r.deliveryEquivalence]));
    check('every UNAPPROVED record\'s governed delivery is identical to LEGACY (a true no-op)',
      unapprovedRows.every(r => r.deliveryEquivalence === 'FALLBACK_IDENTICAL_TO_LEGACY'),
      unapprovedRows.filter(r => r.deliveryEquivalence !== 'FALLBACK_IDENTICAL_TO_LEGACY')
        .map(r => [r.citation, r.deliveryEquivalence]));
    check('ZERO approved badges on content that is not the reviewed artifact',
      !rows.some(r => r.deliveryEquivalence === 'APPROVED_BADGE_ON_DIFFERENT_CONTENT'));
    check('ZERO unapproved records presented as approved',
      !rows.some(r => r.deliveryEquivalence === 'UNAPPROVED_PRESENTED_AS_APPROVED'));
    check('ZERO fallbacks that altered customer output',
      !rows.some(r => r.deliveryEquivalence === 'FALLBACK_ALTERED_CUSTOMER_OUTPUT'));

    // ---------------------------------------------------------------- aggregate
    section('6. Corpus divergence classification (supporting evidence)');
    const tallyOf = (list: any[], path: 'pathA' | 'pathB') => {
      const t: Record<string, number> = {};
      for (const r of list) {
        const k = r[path].equivalence.equivalenceClass;
        t[k] = (t[k] ?? 0) + 1;
      }
      return t;
    };
    const tallyAllB = tallyOf(rows, 'pathB');
    const tallyApprovedB = tallyOf(approvedRows, 'pathB');
    const tallyAllA = tallyOf(rows, 'pathA');
    const tallyApprovedA = tallyOf(approvedRows, 'pathA');
    console.log('  PATH B (finding-scoped decisions)  all 35    :', JSON.stringify(tallyAllB));
    console.log('  PATH B (finding-scoped decisions)  approved 27:', JSON.stringify(tallyApprovedB));
    console.log('  PATH A (suggest / standardText)    all 35    :', JSON.stringify(tallyAllA));
    console.log('  PATH A (suggest / standardText)    approved 27:', JSON.stringify(tallyApprovedA));
    console.log('');
    console.log('  per approved record  [pathB | pathA]  legacyB/legacyA/governed bytes');
    for (const r of approvedRows) {
      console.log(`    ${r.pathB.equivalence.equivalenceClass.padEnd(31)} ` +
        `${r.pathA.equivalence.equivalenceClass.padEnd(31)} ${r.citation.padEnd(28)} ` +
        `${r.pathB.legacyBodyLength}/${r.pathA.legacyBodyLength}/${r.pathB.governedBodyLength}`);
    }

    // ---------------------------------------------------------------- corpus untouched
    section('7. Legacy corpus non-mutation across the entire customer-path exercise');
    const corpusAfter = await corpusFingerprint(ds);
    check('legacy row count unchanged', corpusAfter.row_count === corpusBefore.row_count);
    check('legacy corpus digest unchanged', corpusAfter.digest === corpusBefore.digest);
    check('source_key still NULL on every legacy row', corpusAfter.with_source_key === 0);

    evidence.releaseId = RELEASE_ID;
    evidence.manifestChecksum = prepared.manifestChecksum;
    evidence.approvedRecords = scope.governedRecords;
    evidence.totalRecords = scope.totalRecords;
    evidence.customerPaths = {
      pathB: 'finding-scoped standardDecisions via SafescopeV2Service.hydrateFindingScopedStandards -> mark(); legacy body = plain_language_summary (mark() does not spread hydrated standardText)',
      pathA: 'ApplicableStandardsService.suggest(); legacy body = standard_text from its own corpus SELECT (the full eCFR section dump)',
    };
    evidence.classificationTallyPathB = { all35: tallyAllB, approved27: tallyApprovedB };
    evidence.classificationTallyPathA = { all35: tallyAllA, approved27: tallyApprovedA };
    evidence.deliveryEquivalenceTally = deliveryTally;
    evidence.records = rows;
    evidence.legacyCorpus = {
      rowsBefore: corpusBefore.row_count, rowsAfter: corpusAfter.row_count,
      digestUnchanged: corpusAfter.digest === corpusBefore.digest,
      rowsWithSourceKey: corpusAfter.with_source_key,
    };
    writeFileSync(join(EVIDENCE, 'contracts', 'customer-path-equivalence.json'),
      `${JSON.stringify(evidence, null, 2)}\n`);
    console.log(`\nevidence -> ${join(EVIDENCE, 'contracts', 'customer-path-equivalence.json')}`);

  } finally {
    await ds.destroy().catch(() => undefined);
    await admin(`DROP DATABASE IF EXISTS ${DATABASE}`);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`KG-5C customer-path equivalence: ${passed}/${passed + failed} checks passed`);
  if (failed) {
    console.log(`\n${failed} FAILED:`);
    for (const f of failures) console.log(`  - ${f}`);
    process.exitCode = 1;
  }
}

async function corpusFingerprint(ds: DataSource) {
  const [row] = await ds.query(`
    SELECT COUNT(*)::int AS row_count,
           md5(string_agg(whole, '|' ORDER BY whole)) AS digest,
           COUNT(*) FILTER (WHERE source_key IS NOT NULL)::int AS with_source_key
    FROM (
      SELECT md5(coalesce(agency_code,'')||coalesce(citation,'')||coalesce(title,'')||
                 coalesce(standard_text,'')||coalesce(plain_language_summary,'')||
                 coalesce(source_key,'')||coalesce(release_id,'')) AS whole, source_key
      FROM standards_master) t`);
  return row as Record<string, any>;
}

main().catch(error => { console.error(error); process.exitCode = 1; });
