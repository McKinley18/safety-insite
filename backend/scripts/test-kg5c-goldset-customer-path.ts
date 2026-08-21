import 'dotenv/config';
import 'reflect-metadata';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
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
import { applyFindingScopedStandards } from '../src/safescope-v2/evidence/evidence-foundation';
import { releaseCitationKey } from '../src/standards/releases/citation-identity';

/**
 * KG-5C -- gold-set customer-path proof (Phase 5).
 *
 * Every citation HazLenz ACTUALLY EMITS is driven end to end:
 *
 *   applyFindingScopedStandards()            the real in-code selection engine
 *     -> hydrateFindingScopedStandards()     the real customer hydration + composition
 *       -> GovernedCutoverContext            the real governed resolution
 *         -> resolveStandardsBacking()       the real backing contract
 *           -> getStandardBackingPresentation semantics, asserted here
 *
 * The gold set is read from its TRACKED location and hash-verified before use, exactly as the
 * KG-3A shadow harness does. It is NEVER modified: if a citation cannot be proven, that is a
 * blocker to report, not a dataset to adjust.
 */

const TRACKED_GOLD_SET = join(__dirname, '..', '..',
  'verification/insite-core-closure-standards-validation-2026-08-18/standards-gold-set/gold-set-script-v3.ts');
const EXPECTED_GOLD_SET_SHA256 =
  '93184abc677cf7a50d5f9ac11c4317148618acd74a26fe20fb37e690df647cd3';

const RELEASE_ID = 'federal-core-2026-07-30.1';
const SUITE = 'kg-5c-goldset-customer-path';
const TEMPLATE = process.env.KG5C_TEMPLATE_DB || 'test_kg5b_prodshape_20260821';
const ADMIN_URL = process.env.KG5C_ADMIN_URL
  || `postgres://${process.env.USER || process.env.LOGNAME}@localhost:5432/postgres`;
const DATABASE = 'test_kg5c_mut_goldset';
const ALLOWED_ACCOUNT = 'kg5c-goldset-principal';
const EVIDENCE = join(__dirname, '..', '..',
  'verification/hazlenz-governed-knowledge-growth-2026-08-19/kg-5c');

const { Client } = require('pg') as { Client: new (o: { connectionString: string }) => any };

let passed = 0; let failed = 0; const failures: string[] = [];
const blockers: string[] = [];
function check(name: string, condition: boolean, detail?: unknown): void {
  if (condition) { passed++; return; }
  failed++;
  const line = `${name}${detail === undefined ? '' : ` :: ${JSON.stringify(detail)}`}`;
  failures.push(line); console.log(`  FAIL  ${line}`);
}
function section(t: string): void { console.log(`\n${t}`); console.log('-'.repeat(t.length)); }
async function admin(sql: string): Promise<void> {
  const c = new Client({ connectionString: ADMIN_URL });
  await c.connect(); try { await c.query(sql); } finally { await c.end(); }
}

interface GoldCase {
  id: string; area: string;
  regime: 'osha_general_industry' | 'osha_construction' | 'msha';
  observation: string; expectedCitations: string[]; mustNotReturn: string[];
}

function loadTrackedGoldSet(): { cases: GoldCase[]; sha256: string } {
  const source = readFileSync(TRACKED_GOLD_SET, 'utf8');
  const sha256 = createHash('sha256').update(source).digest('hex');
  if (sha256 !== EXPECTED_GOLD_SET_SHA256) {
    throw new Error(`Tracked gold set hash mismatch. Expected ${EXPECTED_GOLD_SET_SHA256}, got ${sha256}.`);
  }
  const start = source.indexOf('const GOLD_SET: GoldCase[] = [');
  const open = source.indexOf('[', start);
  const end = source.indexOf('\n];', open);
  // eslint-disable-next-line no-new-func
  const cases = new Function(`return ${source.slice(open, end + 2)};`)() as GoldCase[];
  return { cases, sha256 };
}

function scopeToText(regime: GoldCase['regime']): string[] {
  if (regime === 'msha') return ['msha'];
  if (regime === 'osha_construction') return ['osha_construction'];
  return ['osha_general'];
}

/**
 * The real in-code selection engine, driven exactly as the tracked gold-set script drives it.
 *
 * BOTH tiers are returned, and BOTH are customer-visible. `direct` is the confirmed match; a
 * `candidate` is still emitted to the customer as an applicable standard, so proving only the
 * `direct` tier would leave a citation the customer actually sees unproven.
 *
 * This distinction is not academic: `30 CFR 56.14132` is emitted as `candidate` and never as
 * `direct`, because KG-3F Phases 5-7 deliberately withhold it from certainty when rear visibility
 * is unstated (MSHA-TRAFFIC-01, CAVEAT-2, decision KEEP). KG-3F's "23 emitted" counts every
 * emitted citation; filtering to `direct` gives 22. Both numbers are true about different things,
 * and the scope KG-5C must prove is all 23.
 */
function emitCitations(c: GoldCase): { confirmed: string[]; all: string[] } {
  const result: any = {
    multiHazardDecomposition: {
      hazards: [{
        hazardId: 'gold-1', domainId: 'unknown', hazardFamily: 'unknown',
        observationFragment: c.observation, mechanism: '', supportingSignals: [],
      }],
    },
  };
  applyFindingScopedStandards(result, { text: c.observation, scopes: scopeToText(c.regime) } as any);
  const candidates = result.multiHazardDecomposition.hazards[0].standardCandidates || [];
  return {
    confirmed: candidates.filter((s: any) => s?.applicability === 'direct').map((s: any) => String(s.citation)),
    all: candidates.map((s: any) => String(s.citation)),
  };
}

async function main() {
  console.log('KG-5C -- gold-set customer-path proof');

  const { cases, sha256 } = loadTrackedGoldSet();
  console.log(`gold set: ${cases.length} cases, sha256 ${sha256.slice(0, 12)}…`);

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

  const evidence: Record<string, unknown> = { goldSetSha256: sha256, goldSetCases: cases.length };

  try {
    section('1. Gold set integrity');
    check('the tracked gold set hash is unchanged', sha256 === EXPECTED_GOLD_SET_SHA256);

    section('2. Emission: what HazLenz actually emits');
    const emittedByCase = cases.map(c => ({ id: c.id, regime: c.regime, ...emitCitations(c) }));
    const emitted = Array.from(new Set(emittedByCase.flatMap(e => e.all))).sort();
    const directOnly = Array.from(new Set(emittedByCase.flatMap(e => e.confirmed))).sort();
    const candidateOnly = emitted.filter(c => !directOnly.includes(c));
    console.log(`  distinct EMITTED citations: ${emitted.length} ` +
      `(${directOnly.length} direct, ${candidateOnly.length} candidate-only)`);
    if (candidateOnly.length) console.log(`  candidate-only: ${candidateOnly.join(', ')}`);
    check('the emitted citation set is the KG-3F-recorded 23', emitted.length === 23, emitted.length);
    check('22 of them are direct matches', directOnly.length === 22, directOnly.length);
    check('the one candidate-only citation is 30 CFR 56.14132 (MSHA-TRAFFIC-01, CAVEAT-2)',
      candidateOnly.length === 1 && candidateOnly[0] === '30 CFR 56.14132', candidateOnly);
    evidence.emittedCitations = emitted;
    evidence.emittedDirect = directOnly;
    evidence.emittedCandidateOnly = candidateOnly;

    section('3. Reproduce the approved governed release');
    const definition = loadReleaseDefinition(RELEASE_ID);
    const packet = require(join(EVIDENCE, '..', 'kg-5a', 'contracts',
      'production-release-review-packet.json'));
    await prepareGovernedRelease(ds, definition);
    const reviews = new ReleaseRecordReviewService(ds);
    const reattest: string[] = packet.rows
      .filter((r: any) => r.recommendedDecision === 'REATTEST').map((r: any) => r.citation);
    const records = await ds.query(
      `SELECT citation, "recordChecksum", payload FROM regulatory_release_records
       WHERE "releaseId" = $1`, [RELEASE_ID]);
    const byCitation = new Map(records.map((r: any) => [r.citation, r]));
    const byKey = new Map(records.map((r: any) => [releaseCitationKey(r.citation), r]));
    for (const citation of reattest) {
      await reviews.approveRecord({
        releaseId: RELEASE_ID, citation,
        expectedChecksum: (byCitation.get(citation) as any).recordChecksum,
        reviewerId: 'kg5c-goldset-reviewer', reviewerRole: 'verification',
        note: 'KG-5C gold-set customer-path proof.',
      });
    }
    const lifecycle = new RegulatoryReleaseLifecycleService(ds);
    await lifecycle.activate(RELEASE_ID, 'kg5c-goldset', 'KG-5C gold-set proof',
      { expectedCurrentReleaseId: null });
    const scope = await lifecycle.describeReleaseScope(RELEASE_ID);
    check('27 of 35 approved', scope.governedRecords === 27, scope.governedRecords);

    section('4. Drive every emitted citation through the real customer path');
    const applicable = new ApplicableStandardsService(ds.getRepository(Standard) as any);
    const safescope = Object.create(SafescopeV2Service.prototype) as SafescopeV2Service;
    (safescope as any).applicableStandards = applicable;
    const governedEnv = {
      GOVERNED_CUTOVER_MODE: 'GOVERNED_WITH_FALLBACK',
      GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: ALLOWED_ACCOUNT,
    } as Record<string, string>;

    async function deliver(citation: string, mode: 'LEGACY' | 'GOVERNED') {
      const result: any = { standardDecisions: [{ citation, applicabilityStatus: 'confirmed' }] };
      const cutover = mode === 'GOVERNED'
        ? await GovernedCutoverContext.create({
            principal: { userId: ALLOWED_ACCOUNT }, dataSource: ds, env: governedEnv,
            analysisTraceId: 'kg5c-goldset',
          })
        : null;
      if (mode === 'GOVERNED' && !cutover) throw new Error('governed context did not enable');
      const out = await (safescope as any).hydrateFindingScopedStandards(result, cutover);
      return out.standardDecisions[0];
    }

    const approvedSet = new Set(reattest);
    const rows: any[] = [];
    for (const citation of emitted) {
      const legacy = await deliver(citation, 'LEGACY');
      const governed = await deliver(citation, 'GOVERNED');
      const key = releaseCitationKey(citation);
      const record: any = byKey.get(key);
      const frozen = record ? String(record.payload.canonicalText || record.payload.summary || '') : null;
      const governedBody = String(governed.standardText || governed.plainLanguageSummary || '');
      const approved = record ? approvedSet.has(record.citation) : false;

      rows.push({
        emittedCitation: citation,
        emissionTier: directOnly.includes(citation) ? 'direct' : 'candidate',
        citationKey: key,
        governedRecordCitation: record?.citation ?? null,
        inRelease: Boolean(record),
        approved,
        legacyBackingStatus: legacy.backingStatus,
        governedBackingStatus: governed.backingStatus,
        governedDeliveryState: governed.governedDeliveryState ?? null,
        governedFallbackReason: governed.governedFallbackReason ?? null,
        knowledgeReleaseId: governed.knowledgeReleaseId ?? null,
        deliveredBodyLength: governedBody.length,
        frozenArtifactLength: frozen === null ? null : frozen.length,
        deliveredIsFrozenArtifact: frozen !== null && governedBody === frozen,
        resolvedCitationEqualsRequested: String(governed.citation) === citation,
      });
    }

    section('5. Required properties (Phase 5)');
    check('every emitted citation is covered by the release', rows.every(r => r.inRelease),
      rows.filter(r => !r.inRelease).map(r => r.emittedCitation));
    check('every emitted citation is APPROVED', rows.every(r => r.approved),
      rows.filter(r => !r.approved).map(r => r.emittedCitation));
    check('NO silent citation substitution: the delivered citation equals the requested one',
      rows.every(r => r.resolvedCitationEqualsRequested),
      rows.filter(r => !r.resolvedCitationEqualsRequested)
        .map(r => [r.emittedCitation, r.governedRecordCitation]));
    check('NO wrong-section resolution: the release record shares the exact citation identity',
      rows.every(r => releaseCitationKey(r.governedRecordCitation ?? '') === r.citationKey),
      rows.filter(r => releaseCitationKey(r.governedRecordCitation ?? '') !== r.citationKey)
        .map(r => [r.emittedCitation, r.governedRecordCitation]));
    check('NO unapproved content represented as approved',
      rows.every(r => r.governedBackingStatus !== 'APPROVED_GOVERNED_CONTENT' || r.approved));
    check('NO approved badge on content different from the approved artifact',
      rows.every(r => r.governedBackingStatus !== 'APPROVED_GOVERNED_CONTENT'
        || r.deliveredIsFrozenArtifact),
      rows.filter(r => r.governedBackingStatus === 'APPROVED_GOVERNED_CONTENT'
        && !r.deliveredIsFrozenArtifact).map(r => r.emittedCitation));
    check('every emitted citation delivers GOVERNED_VERIFIED_TEXT',
      rows.every(r => r.governedDeliveryState === 'GOVERNED_VERIFIED_TEXT'),
      rows.filter(r => r.governedDeliveryState !== 'GOVERNED_VERIFIED_TEXT')
        .map(r => [r.emittedCitation, r.governedDeliveryState]));
    check('NO citation-only content leak: no emitted citation falls to CITATION_ONLY',
      rows.every(r => r.governedBackingStatus !== 'CITATION_ONLY'),
      rows.filter(r => r.governedBackingStatus === 'CITATION_ONLY').map(r => r.emittedCitation));
    check('NO fallback hides a governed-resolution failure',
      rows.every(r => r.governedFallbackReason === 'GOVERNED_APPROVED_EXACT'),
      Array.from(new Set(rows.map(r => r.governedFallbackReason))));
    check('every emitted citation records governed provenance',
      rows.every(r => r.knowledgeReleaseId === RELEASE_ID));
    check('NO prefix ambiguity: distinct emitted citations map to distinct release records',
      new Set(rows.map(r => r.governedRecordCitation)).size === rows.length);

    for (const r of rows) {
      if (!r.inRelease || !r.approved || !r.deliveredIsFrozenArtifact
          || r.governedDeliveryState !== 'GOVERNED_VERIFIED_TEXT') {
        blockers.push(`${r.emittedCitation}: ${JSON.stringify({
          inRelease: r.inRelease, approved: r.approved,
          deliveredIsFrozenArtifact: r.deliveredIsFrozenArtifact,
          deliveryState: r.governedDeliveryState })}`);
      }
    }

    console.log('');
    for (const r of rows) {
      console.log(`  ${r.deliveredIsFrozenArtifact ? 'PROVEN  ' : 'BLOCKER '}` +
        `${r.emittedCitation.padEnd(28)} ${String(r.governedBackingStatus).padEnd(26)} ` +
        `${r.deliveredBodyLength}b`);
    }

    evidence.rows = rows;
    evidence.provenCount = rows.filter(r => r.deliveredIsFrozenArtifact).length;
    evidence.blockers = blockers;
    writeFileSync(join(EVIDENCE, 'contracts', 'goldset-customer-path.json'),
      `${JSON.stringify(evidence, null, 2)}\n`);
    console.log(`\nevidence -> ${join(EVIDENCE, 'contracts', 'goldset-customer-path.json')}`);

    section('6. Gold set unchanged');
    const after = createHash('sha256')
      .update(readFileSync(TRACKED_GOLD_SET, 'utf8')).digest('hex');
    check('the tracked gold set was not modified by this suite', after === EXPECTED_GOLD_SET_SHA256);

  } finally {
    await ds.destroy().catch(() => undefined);
    await admin(`DROP DATABASE IF EXISTS ${DATABASE}`);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`KG-5C gold-set customer path: ${passed}/${passed + failed} checks passed`);
  if (blockers.length) {
    console.log(`\n${blockers.length} BLOCKERS:`);
    for (const b of blockers) console.log(`  - ${b}`);
  }
  if (failed) {
    console.log(`\n${failed} FAILED:`);
    for (const f of failures) console.log(`  - ${f}`);
    process.exitCode = 1;
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
