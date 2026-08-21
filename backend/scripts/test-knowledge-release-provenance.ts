/**
 * KG-1 -- Knowledge release provenance test matrix.
 *
 * Proves the provenance contract end to end against a disposable verification database:
 *
 *  1. Resolver semantics -- the live retrieval scoping resolves to NULL; only a genuinely
 *     single-release scoping resolves to an id.
 *  2. Live production path -- a real analysis through the running API records NULL, its
 *     findings inherit NULL, and the report stays valid.
 *  3. Deterministic propagation -- with a fixture that reports a single release, the analysis
 *     records X and every derived finding records X across multi-hazard decomposition,
 *     re-analysis, reload and finalization.
 *  4. No retroactive rewrite -- once a newer release fixture exists, previously persisted
 *     findings keep their original release.
 *  5. Mixed provenance -- a report spanning two analyses reports both releases rather than
 *     collapsing them into one.
 *  6. Regeneration -- regenerating a report after the "latest" release changes reproduces the
 *     historical provenance, never the newer release.
 *  7. Legacy rows -- an analysis/finding with no knowledge version loads cleanly as NULL.
 *
 * Requires: API server and this script pointed at the SAME disposable database.
 *   API_BASE_URL (default http://127.0.0.1:4231), DATABASE_URL (disposable target).
 */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { dataSource } from '../src/database/data-source';
import { InspectionService } from '../src/inspection/inspection.service';
import { Inspection } from '../src/inspection/inspection.entity';
import { InspectionAssignment } from '../src/inspection/entities/inspection-assignment.entity';
import { Observation } from '../src/inspection/entities/observation.entity';
import { HazLenzAnalysis } from '../src/inspection/entities/hazlenz-analysis.entity';
import { HumanReview } from '../src/inspection/entities/human-review.entity';
import { InspectionFinding } from '../src/inspection/entities/inspection-finding.entity';
import { OrganizationMembership } from '../src/organizations/entities/organization-membership.entity';
import { SecurityAuditEvent } from '../src/audit/entities/security-audit-event.entity';
import { CorrectiveAction } from '../src/corrective-actions/entities/corrective-action.entity';
import { InspectionReportVersion } from '../src/reports/entities/inspection-report-version.entity';
import {
  describeLiveKnowledgeRetrievalScoping,
  resolveKnowledgeReleaseProvenance,
} from '../src/inspection/knowledge-release-provenance';

const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:4231';

type Json = Record<string, any>;

const checks: string[] = [];
function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(`FAILED: ${message}`);
  checks.push(message);
}

async function request(path: string, options: RequestInit = {}, expected?: number): Promise<{ status: number; body: Json }> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
  });
  const text = await response.text();
  let body: Json = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { text }; }
  if (expected !== undefined && response.status !== expected) {
    throw new Error(`${options.method || 'GET'} ${path}: expected ${expected}, got ${response.status}: ${text}`);
  }
  return { status: response.status, body };
}

function auth(token: string) { return { authorization: `Bearer ${token}` }; }

function snapshot(hazards: Array<Record<string, unknown>>) {
  return {
    advisory: true,
    multiHazardDecomposition: {
      version: 'v1', isMultiHazard: hazards.length > 1, hazardCount: hazards.length,
      hazards, decompositionConfidence: 0.9,
    },
    guidedFinding: { findingCandidates: [] },
  };
}

const MULTI_HAZARD = [
  { hazardId: 'kg1-a', domainId: 'machine_guarding', hazardFamily: 'machine_guarding', mechanism: 'access to moving parts', observationFragment: 'guard leaves access', confidence: 0.8 },
  { hazardId: 'kg1-b', domainId: 'hazardous_energy', hazardFamily: 'machine_guarding_loto', mechanism: 'unexpected startup', observationFragment: 'energy state unknown', confidence: 0.7 },
  { hazardId: 'kg1-c', domainId: 'electrical', hazardFamily: 'electrical', mechanism: 'damaged conductor', observationFragment: 'cord insulation cut', confidence: 0.6 },
];

/**
 * Test-only seam. Substitutes a deterministic single-release scoping so the PROPAGATION
 * mechanics can be exercised without inventing an active release in production. Production
 * always uses InspectionService.resolveKnowledgeReleaseId()'s live measurement.
 */
class FixtureProvenanceInspectionService extends InspectionService {
  public fixtureReleaseId: string | null = null;
  // KG-4A made the base method asynchronous (its anti-spoofing gate must consult the server's own
  // active-release pointer). The override follows the new signature; the fixture's SEMANTICS are
  // unchanged -- it still substitutes a deterministic single-release scoping and still ignores the
  // snapshot entirely, so every assertion in this suite means exactly what it meant under KG-1.
  protected async resolveKnowledgeReleaseId(): Promise<string | null> {
    if (!this.fixtureReleaseId) return resolveKnowledgeReleaseProvenance().knowledgeReleaseId;
    return resolveKnowledgeReleaseProvenance({
      mode: 'single_release',
      releaseId: this.fixtureReleaseId,
      reason: 'KG-1 test fixture: retrieval constrained to a single release.',
    }).knowledgeReleaseId;
  }
}

function buildFixtureService() {
  return new FixtureProvenanceInspectionService(
    dataSource.getRepository(Inspection),
    dataSource.getRepository(InspectionAssignment),
    dataSource.getRepository(Observation),
    dataSource.getRepository(HazLenzAnalysis),
    dataSource.getRepository(HumanReview),
    dataSource.getRepository(InspectionFinding),
    dataSource.getRepository(OrganizationMembership),
    dataSource.getRepository(SecurityAuditEvent),
    dataSource.getRepository(CorrectiveAction),
    null as any, // SitesService -- only used by create(), which this fixture never calls.
    dataSource,
  );
}

async function main() {
  const target = new URL(process.env.DATABASE_URL || 'postgresql://localhost/UNSET');
  console.log(`Resolved database target: host=${target.hostname} database=${target.pathname.replace('/', '')}`);
  if (!/verify|test|disposable|kg1/i.test(target.pathname)) {
    throw new Error(`Refusing to run against a non-disposable database: ${target.pathname}`);
  }

  // ---------------------------------------------------------------- 1. resolver semantics
  const live = describeLiveKnowledgeRetrievalScoping();
  assert(live.mode === 'unscoped_corpus', 'Live retrieval scoping is measured as unscoped_corpus.');
  assert(resolveKnowledgeReleaseProvenance().knowledgeReleaseId === null,
    'Live scoping resolves knowledgeReleaseId to NULL (no release fabricated).');
  assert(resolveKnowledgeReleaseProvenance({ mode: 'single_release', releaseId: 'rel-1', reason: 'x' })
    .knowledgeReleaseId === 'rel-1', 'A genuine single-release scoping resolves to that release id.');
  assert(resolveKnowledgeReleaseProvenance({ mode: 'single_release', releaseId: '  ', reason: 'x' })
    .knowledgeReleaseId === null, 'A single-release scoping with no usable id resolves to NULL.');

  await dataSource.initialize();
  const suffix = `kg1-provenance-${Date.now()}`;
  const password = 'Provenance!Strong123';
  await request('/auth/register', {
    method: 'POST', body: JSON.stringify({ email: `${suffix}@example.test`, password, name: suffix, type: 'individual' }),
  }, 201);
  const login = await request('/auth/login', {
    method: 'POST', body: JSON.stringify({ email: `${suffix}@example.test`, password }),
  }, 201);
  const headers = auth(login.body.token);
  const userId = login.body.user?.id || login.body.userId;
  assert(!!userId, 'Registered verification user resolved.');
  const user = { userId, organizationId: null, organizationRole: null, platformRole: null };

  // Report generation is a paid (cloudReports) entitlement, and this suite must reach report
  // generation to verify report provenance. Uses the shared grant helper, whose own
  // NODE_ENV=test + disposable-database allowlist guards therefore still apply. (DEV_FORCE_PRO
  // does not help here: it only tiers up the dev-bypass identity, not an authenticated user.)
  execFileSync('npx', ['ts-node', 'scripts/grant-test-entitlement.ts', userId, '2'], {
    env: { ...process.env, NODE_ENV: 'test' }, stdio: 'pipe',
  });

  // ------------------------------------------------- 2. live production path records NULL
  const liveSite = await request('/sites', { method: 'POST', headers, body: JSON.stringify({ name: `${suffix}-live` }) }, 201);
  const liveInspection = await request('/inspections', {
    method: 'POST', headers, body: JSON.stringify({ siteId: liveSite.body.id, title: `${suffix}-live` }),
  }, 201);
  const liveObservation = await request(`/inspections/${liveInspection.body.id}/observations`, {
    method: 'POST', headers, body: JSON.stringify({ rawText: 'Guard missing and energy state unknown.', evidenceSource: 'direct_observation' }),
  }, 201);
  const liveAnalysis = await request(`/inspections/observations/${liveObservation.body.id}/analyses`, {
    method: 'POST', headers,
    body: JSON.stringify({ engineVersion: 'hazlenz-production', idempotencyKey: `${suffix}-live-v1`, requestVersion: 1, resultSnapshot: snapshot(MULTI_HAZARD.slice(0, 2)) }),
  }, 201);
  assert(liveAnalysis.body.knowledgeReleaseId === null,
    'Live production analysis records knowledgeReleaseId = NULL.');
  const liveReloaded = await request(`/inspections/${liveInspection.body.id}`, { headers }, 200);
  const liveFindings = liveReloaded.body.findings.filter((f: Json) => f.status !== 'superseded');
  assert(liveFindings.length === 2, `Live path materialized 2 findings (got ${liveFindings.length}).`);
  assert(liveFindings.every((f: Json) => f.knowledgeReleaseId === null),
    'Live-path findings inherit NULL provenance.');
  assert(liveReloaded.body.observations[0].analyses.every((a: Json) => a.knowledgeReleaseId === null),
    'Reloaded live analysis still serialises knowledgeReleaseId = NULL.');

  // ------------------------------- 3. deterministic propagation across a fixture release X
  const service = buildFixtureService();
  const RELEASE_A = 'kg1-fixture-release.A';
  const RELEASE_B = 'kg1-fixture-release.B';
  const RELEASE_C = 'kg1-fixture-release.C';

  const site = await request('/sites', { method: 'POST', headers, body: JSON.stringify({ name: suffix }) }, 201);
  const inspection = await request('/inspections', {
    method: 'POST', headers, body: JSON.stringify({ siteId: site.body.id, title: suffix }),
  }, 201);
  const observationA = await request(`/inspections/${inspection.body.id}/observations`, {
    method: 'POST', headers, body: JSON.stringify({ rawText: 'Guard missing, energy state unknown, conductor damaged.', evidenceSource: 'direct_observation' }),
  }, 201);
  const observationB = await request(`/inspections/${inspection.body.id}/observations`, {
    method: 'POST', headers, body: JSON.stringify({ rawText: 'Second area: unlabeled container beside a blocked walkway.', evidenceSource: 'direct_observation' }),
  }, 201);

  service.fixtureReleaseId = RELEASE_A;
  const analysisA = await service.addAnalysis(user, observationA.body.id, {
    engineVersion: 'hazlenz-production', idempotencyKey: `${suffix}-a-v1`, requestVersion: 1,
    resultSnapshot: snapshot(MULTI_HAZARD),
  } as any);
  assert(analysisA.knowledgeReleaseId === RELEASE_A, 'Fixture analysis records the single release it used.');

  const findingsRepo = dataSource.getRepository(InspectionFinding);
  const afterA = await findingsRepo.find({ where: { observationId: observationA.body.id } });
  assert(afterA.length === 3, `Multi-hazard decomposition produced 3 findings (got ${afterA.length}).`);
  assert(afterA.every(f => f.knowledgeReleaseId === RELEASE_A),
    'All 3 multi-hazard findings inherit the analysis release (no independent resolution).');

  // Re-analysis of the SAME observation under the same release keeps the release.
  const analysisA2 = await service.addAnalysis(user, observationA.body.id, {
    engineVersion: 'hazlenz-production', idempotencyKey: `${suffix}-a-v2`, requestVersion: 2,
    resultSnapshot: snapshot(MULTI_HAZARD),
  } as any);
  assert(analysisA2.knowledgeReleaseId === RELEASE_A, 'Re-analysis records the same release.');
  const afterA2 = await findingsRepo.find({ where: { observationId: observationA.body.id } });
  assert(afterA2.every(f => f.knowledgeReleaseId === RELEASE_A),
    'Re-analysis preserves finding provenance on the updated (existing) finding branch.');

  // ---------------------------------------- 4. a newer release does not rewrite older rows
  service.fixtureReleaseId = RELEASE_B;
  const analysisB = await service.addAnalysis(user, observationB.body.id, {
    engineVersion: 'hazlenz-production', idempotencyKey: `${suffix}-b-v1`, requestVersion: 1,
    resultSnapshot: snapshot([MULTI_HAZARD[0]]),
  } as any);
  assert(analysisB.knowledgeReleaseId === RELEASE_B, 'Later analysis records the later release.');
  const unchanged = await findingsRepo.find({ where: { observationId: observationA.body.id } });
  assert(unchanged.every(f => f.knowledgeReleaseId === RELEASE_A),
    'Existing findings keep release A after a newer release B is used elsewhere.');

  // ---------------------------------------------------- finalization preserves provenance
  const currentA = (await findingsRepo.find({ where: { observationId: observationA.body.id } }))
    .filter(f => f.status !== 'superseded');
  const currentB = (await findingsRepo.find({ where: { observationId: observationB.body.id } }))
    .filter(f => f.status !== 'superseded');
  for (const [observationId, findings, analysisId] of [
    [observationA.body.id, currentA, analysisA2.id],
    [observationB.body.id, currentB, analysisB.id],
  ] as Array<[string, InspectionFinding[], string]>) {
    for (const finding of findings) {
      const review = await service.addReview(user, observationId, {
        findingId: finding.id, idempotencyKey: `${suffix}-rev-${finding.id}`, analysisId,
        decision: 'accepted', rationale: 'Verified during KG-1 provenance verification.',
      } as any);
      await service.finalizeFinding(user, observationId, {
        reviewId: review.id, segmentKey: finding.hazardKey, conclusion: finding.conclusion,
      } as any);
    }
  }
  const finalizedA = await findingsRepo.find({ where: { observationId: observationA.body.id } });
  assert(finalizedA.filter(f => f.status === 'finalized').every(f => f.knowledgeReleaseId === RELEASE_A),
    'Finalized findings preserve their analysis provenance.');

  // ------------------------------------- 5/6. report preserves and does not recompute it
  const reloaded = await request(`/inspections/${inspection.body.id}`, { headers }, 200);
  await request(`/inspections/${inspection.body.id}/transition`, {
    method: 'POST', headers, body: JSON.stringify({ status: 'in_review', version: reloaded.body.version }),
  }, 201);
  const beforeComplete = await request(`/inspections/${inspection.body.id}`, { headers }, 200);
  await request(`/inspections/${inspection.body.id}/transition`, {
    method: 'POST', headers, body: JSON.stringify({ status: 'completed', version: beforeComplete.body.version }),
  }, 201);

  const report = await request(`/inspections/${inspection.body.id}/reports`, { method: 'POST', headers }, 201);
  assert(report.body.checksum && report.body.status === 'generated', 'Report generated from provenance-bearing findings.');
  const versionRepo = dataSource.getRepository(InspectionReportVersion);
  const v1 = await versionRepo.findOne({ where: { id: report.body.versionId } });
  const v1Snapshot = v1?.sourceSnapshot as Json;
  const v1Provenance = v1Snapshot.knowledgeProvenance;
  assert(Array.isArray(v1Provenance?.knowledgeReleaseIds), 'Report snapshot carries a knowledgeProvenance block.');
  assert(JSON.stringify(v1Provenance.knowledgeReleaseIds) === JSON.stringify([RELEASE_A, RELEASE_B]),
    `Mixed-provenance report lists both releases without collapsing them (got ${JSON.stringify(v1Provenance.knowledgeReleaseIds)}).`);
  const snapshotFindings = (v1Snapshot.observations || []).flatMap((o: Json) => o.findings || []);
  assert(snapshotFindings.length > 0 && snapshotFindings.every((f: Json) => !!f.knowledgeReleaseId),
    'Every finding in the report snapshot carries its own release provenance.');

  // The "currently available/latest" release moves on; the historical report must not follow.
  service.fixtureReleaseId = RELEASE_C;
  const v1Reread = await versionRepo.findOne({ where: { id: report.body.versionId } });
  const rereadIds = (v1Reread?.sourceSnapshot as Json).knowledgeProvenance.knowledgeReleaseIds;
  assert(!rereadIds.includes(RELEASE_C) && JSON.stringify(rereadIds) === JSON.stringify([RELEASE_A, RELEASE_B]),
    'Re-reading the stored report reproduces historical provenance, not the newer release.');
  const regenerated = await request(`/inspections/${inspection.body.id}/reports`, { method: 'POST', headers }, 201);
  const regeneratedVersion = await versionRepo.findOne({ where: { id: regenerated.body.versionId } });
  const regeneratedIds = (regeneratedVersion?.sourceSnapshot as Json).knowledgeProvenance.knowledgeReleaseIds;
  assert(!regeneratedIds.includes(RELEASE_C) && JSON.stringify(regeneratedIds) === JSON.stringify([RELEASE_A, RELEASE_B]),
    'Regenerating the report after the latest release changed does NOT adopt the newer release.');

  // ------------------------------------------------------------------- 7. legacy behaviour
  // Emulates rows written before this migration existed: provenance simply absent.
  const analysisRepo = dataSource.getRepository(HazLenzAnalysis);
  await analysisRepo.update({ observationId: observationB.body.id }, { knowledgeReleaseId: null as any });
  await findingsRepo.update({ observationId: observationB.body.id }, { knowledgeReleaseId: null as any });
  const legacyReload = await request(`/inspections/${inspection.body.id}`, { headers }, 200);
  const legacyFindings = legacyReload.body.findings.filter((f: Json) => f.observationId === observationB.body.id);
  assert(legacyFindings.length > 0 && legacyFindings.every((f: Json) => f.knowledgeReleaseId === null),
    'Legacy (unversioned) findings load successfully with knowledgeReleaseId = NULL.');
  const legacyAnalyses = legacyReload.body.observations
    .find((o: Json) => o.id === observationB.body.id).analyses;
  assert(legacyAnalyses.every((a: Json) => a.knowledgeReleaseId === null),
    'Legacy (unversioned) analyses load successfully with knowledgeReleaseId = NULL.');
  const legacyReport = await request(`/inspections/${inspection.body.id}/reports`, { method: 'POST', headers }, 201);
  const legacyVersion = await versionRepo.findOne({ where: { id: legacyReport.body.versionId } });
  const legacyProvenance = (legacyVersion?.sourceSnapshot as Json).knowledgeProvenance;
  assert(legacyProvenance.findingsWithoutKnowledgeRelease > 0,
    'Report remains valid with partially unversioned findings and reports them as unversioned.');
  assert(!legacyProvenance.knowledgeReleaseIds.includes(RELEASE_B),
    'Cleared provenance is reported as unknown rather than back-filled from another release.');

  await dataSource.destroy();
  console.log(`\nknowledge-release-provenance: ${checks.length}/${checks.length} checks passed`);
  for (const check of checks) console.log(`  ok  ${check}`);
}

main().catch(async error => {
  if (dataSource.isInitialized) await dataSource.destroy();
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
