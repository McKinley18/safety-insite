/**
 * §261 — THE EXPERT PERSISTENCE, PRODUCER-AUTHORITY AND PRE-SPEND IDEMPOTENCY FOUNDATION.
 *
 * ZERO PROVIDER CALLS. The service under test has no provider dependency at all, which is asserted
 * rather than assumed. Database operations run ONLY against a disposable database this suite
 * creates, migrates and drops; it refuses to run anywhere else.
 *
 * Covers §261 local test requirements 1, 2, 3, 9, 10, 11, 12, 13 and 14.
 *
 *   DATABASE_URL=postgresql://user@127.0.0.1:5432/test_insite_261_x npx ts-node \
 *     scripts/test-261-expert-persistence-foundation.ts
 */
import 'dotenv/config';
import { randomUUID } from 'crypto';
import { DataSource, Repository } from 'typeorm';

import { Inspection } from '../src/inspection/inspection.entity';
import { InspectionAssignment } from '../src/inspection/entities/inspection-assignment.entity';
import { Observation } from '../src/inspection/entities/observation.entity';
import { HazLenzAnalysis } from '../src/inspection/entities/hazlenz-analysis.entity';
import { HumanReview } from '../src/inspection/entities/human-review.entity';
import { InspectionFinding } from '../src/inspection/entities/inspection-finding.entity';
import { OrganizationMembership } from '../src/organizations/entities/organization-membership.entity';
import { SecurityAuditEvent } from '../src/audit/entities/security-audit-event.entity';
import { CorrectiveAction } from '../src/corrective-actions/entities/corrective-action.entity';
import { InspectionService } from '../src/inspection/inspection.service';
import { ExpertEffectiveDecisionService }
  from '../src/hazlenz/expert-hazlenz-product/expert-effective-decision.service';
import { ExpertAnalysisExecution }
  from '../src/hazlenz/expert-hazlenz-product/expert-analysis-execution.entity';
import {
  ExpertAnalysisService, type AuthoritativeExpertResult,
} from '../src/hazlenz/expert-hazlenz-product/expert-analysis.service';
import { CONFIRMATION_RULE_VERSION }
  from '../src/hazlenz/expert-hazlenz-product/expert-confirmation-rule';
import { ANALYSIS_ANALYSIS_CREATED_AUDIT_ACTION }
  from '../src/hazlenz/expert-hazlenz-product/expert-analysis-audit';
import { dataSource as applicationDataSource } from '../src/database/data-source';

// ================================================================ the disposable-target guard

const PROTECTED_DATABASE_NAMES = [
  'safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'template0', 'template1',
];

function provenDisposableTarget(): { url: string; database: string } {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('§261 REFUSED: DATABASE_URL is unset. This suite mutates schema and rows and '
      + 'will not fall back to discrete DB_* variables, which in this repository resolve to the '
      + 'development database.');
  }
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  console.log(`resolved target host=${parsed.hostname} port=${parsed.port || 5432} `
    + `database=${database}`);
  if (PROTECTED_DATABASE_NAMES.includes(database)) {
    throw new Error(`§261 REFUSED: ${database} is a protected database.`);
  }
  if (!/^test_[a-z0-9_]+$/i.test(database)) {
    throw new Error(`§261 REFUSED: ${database} is not a disposable test_* database.`);
  }
  console.log('target proven disposable\n');
  return { url, database };
}

// ================================================================ harness

let pass = 0; let fail = 0; const failures: string[] = [];
const ok = (id: string, cond: boolean, d = ''): void => {
  if (cond) { pass++; console.log(`ok    ${id}${d ? '  [' + d + ']' : ''}`); }
  else { fail++; failures.push(id); console.log(`FAIL  ${id}${d ? '  [' + d + ']' : ''}`); }
};
const rejects = async (fn: () => Promise<unknown>): Promise<Error | null> => {
  try { await fn(); return null; } catch (error) { return error as Error; }
};

/**
 * The §259 structural identities, as an admitted analysis actually carries them. Used verbatim so
 * requirements 11 and 12 are asserted on real structures rather than on a convenient subset:
 * `declarationId` per declaration, `resumeCondition.resolvedByDeclarationIds` referencing them,
 * `controlId` per required control, and `dischargingControlRef` carrying the ID and not the prose.
 */
const admittedAnalysisFixture = (opts: {
  posture: string; driverRole: string; refKind: string; ref: string;
}) => ({
  immediateSafetyPosture: {
    posture: opts.posture,
    requiredBy: [{
      refKind: opts.refKind,
      ref: opts.ref,
      driverRole: opts.driverRole,
      roleJustification: { dischargingControlRef: 'ctrl-lockout-1' },
    }],
    acceptedWithoutImmediateAction: [],
    requiredControls: [
      { controlId: 'ctrl-lockout-1', control: 'Apply lockout before any access.', timing: 'BEFORE_WORK_RESUMES' },
      { controlId: 'ctrl-watch-2', control: 'Post an attendant during continued work.', timing: 'DURING_CONTINUED_WORK' },
    ],
    resumeCondition: {
      resolvedByDeclarationIds: ['decl-energy-state-1', 'decl-atmosphere-2'],
      correctionsRequired: [],
    },
    whatHappensNow: 'Prose the deterministic layer must never read for a decision.',
  },
  unresolvedFactDeclarations: [
    { declarationId: 'decl-energy-state-1', property: 'stored energy state', branches: [] },
    { declarationId: 'decl-atmosphere-2', property: 'atmospheric test currency', branches: [] },
  ],
  hazardCandidates: [{ candidateKey: 'hc-1', mechanism: 'unexpected startup' }],
});

const resultFor = (
  admitted: Record<string, unknown>,
  over: Partial<AuthoritativeExpertResult> = {},
): AuthoritativeExpertResult => ({
  status: 'COMPLETE',
  admission: 'ADMIT',
  admittedAnalysis: admitted,
  resultSnapshot: admitted as Record<string, unknown>,
  engineVersion: 'hazlenz-expert-259',
  candidateIdentity: '0b12adf6e44e4586ec2be27c5274dafd8a36b2c1042dfe34d543b51d5be70bee',
  contractVersion: 'hazlenz.expert.first-pass.259',
  entryVersion: 'expert-production-entry',
  providerId: 'anthropic',
  respondedModel: 'test-fixture-no-call',
  verifier: { reached: true, factKey: 'decl-energy-state-1', notReachedBecause: null },
  ...over,
});

async function main(): Promise<void> {
  const target = provenDisposableTarget();

  const ds = new DataSource({
    ...(applicationDataSource.options as any),
    url: target.url,
    host: undefined, port: undefined, username: undefined, password: undefined, database: undefined,
    synchronize: false, logging: false,
  });
  await ds.initialize();

  // ---------------------------------------------------------------- seed, two separate workspaces
  const q = (sql: string, p: unknown[] = []) => ds.query(sql, p);
  const suffix = Date.now();
  const [orgA] = await q(`INSERT INTO "organization" ("name") VALUES ($1) RETURNING id`,
    [`s261-org-a-${suffix}`]);
  const [orgB] = await q(`INSERT INTO "organization" ("name") VALUES ($1) RETURNING id`,
    [`s261-org-b-${suffix}`]);
  const mkUser = async (tag: string) => (await q(
    `INSERT INTO "user" ("name","email","passwordHash","type") VALUES ($1,$2,$3,'individual')
     RETURNING id`,
    [`s261-${tag}`, `s261-${tag}-${suffix}@example.test`, 'not-a-real-hash'],
  ))[0];
  const userA = await mkUser('user-a');
  const userB = await mkUser('user-b');
  const [siteA] = await q(
    `INSERT INTO "site" ("name","organizationId") VALUES ($1,$2) RETURNING id`,
    [`s261-site-a-${suffix}`, orgA.id]);
  const [siteB] = await q(
    `INSERT INTO "site" ("name","organizationId") VALUES ($1,$2) RETURNING id`,
    [`s261-site-b-${suffix}`, orgB.id]);
  const mkInspection = async (siteId: string, orgId: string, creator: string) => (await q(
    `INSERT INTO "inspection" ("createdByUserId","title","siteId","organizationId","status")
     VALUES ($1,$2,$3,$4,'active') RETURNING id`,
    [creator, `s261-inspection-${suffix}`, siteId, orgId],
  ))[0];
  const inspectionA = await mkInspection(siteA.id, orgA.id, userA.id);
  const inspectionB = await mkInspection(siteB.id, orgB.id, userB.id);
  const mkObservation = async (inspectionId: string, creator: string) => (await q(
    `INSERT INTO "observations" ("inspectionId","rawText","createdByUserId")
     VALUES ($1,$2,$3) RETURNING id`,
    [inspectionId, 'Valve state unverified while line work is scheduled.', creator],
  ))[0];
  const observationA = await mkObservation(inspectionA.id, userA.id);
  const observationB = await mkObservation(inspectionB.id, userB.id);

  const principalA = { userId: userA.id, organizationId: orgA.id, organizationRole: 'manager' };
  const principalB = { userId: userB.id, organizationId: orgB.id, organizationRole: 'manager' };

  // ---------------------------------------------------------------- wire the real services
  const repo = <T extends object>(e: any): Repository<T> => ds.getRepository(e) as unknown as Repository<T>;
  const inspections = new InspectionService(
    repo(Inspection), repo(InspectionAssignment), repo(Observation), repo(HazLenzAnalysis),
    repo(HumanReview), repo(InspectionFinding), repo(OrganizationMembership),
    repo(SecurityAuditEvent), repo(CorrectiveAction),
    // SitesService is used only by inspection creation, which this suite does not exercise. It is
    // passed as null rather than stubbed so that any accidental dependency on it fails loudly here
    // instead of silently passing against a fake.
    null as any,
    ds,
    // §265 added the downstream Expert authority gate to this constructor. §261 exercises no
    // finding finalization, so the real service is wired from the same DataSource rather than
    // stubbed — a stub here would be a second implementation of the one derivation, which is the
    // thing §265 exists to prevent.
    new ExpertEffectiveDecisionService(repo(HazLenzAnalysis), repo(HumanReview)),
  );
  // §264 added the HumanReview repository to this constructor so the settlement action can write
  // the human decision into the EXISTING review table rather than a competing subsystem. The
  // parameter is threaded through here mechanically; §261 exercises no settlement, and every
  // assertion in this suite is unchanged.
  const expert = new ExpertAnalysisService(
    ds, repo(ExpertAnalysisExecution), repo(HazLenzAnalysis), repo(HumanReview), inspections,
  );

  console.log('\n---- P0. the service that owns Expert authority makes no provider call ----\n');
  const serviceSource = require('fs').readFileSync(
    require('path').join(__dirname, '..',
      'src/hazlenz/expert-hazlenz-product/expert-analysis.service.ts'), 'utf8');
  // Asserted against the IMPORT GRAPH rather than against any mention of the symbol: the service's
  // own documentation names the entry point in order to state that it is deliberately absent, and
  // a substring check would read that sentence as the thing it denies.
  const importedModules = [...serviceSource.matchAll(/from\s+'([^']+)'/g)].map(m => m[1]);
  ok('P0-A the service does not import the Expert entry point',
    !importedModules.some(m => m.includes('expert-hazlenz-analysis')),
    importedModules.length + ' imports, none of them the entry point');
  ok('P0-B the service imports no provider adapter',
    !importedModules.some(m => m.includes('expert-hazlenz-adapters')));
  ok('P0-D the service uses no dynamic import or require to reach a provider',
    !/\brequire\s*\(|\bimport\s*\(/.test(serviceSource));
  ok('P0-C the service issues no outbound HTTP',
    !/\bfetch\(|axios|http\.request/.test(serviceSource));

  console.log('\n---- P1 (req. 1). a client-supplied analysis persists as client_supplied ----\n');

  const legacy = await inspections.addAnalysis(principalA, observationA.id, {
    engineVersion: 'hazlenz-production',
    idempotencyKey: `s261-legacy-${suffix}`,
    requestVersion: 1,
    resultSnapshot: { multiHazardDecomposition: { hazards: [], isMultiHazard: false, hazardCount: 0 } },
  } as any);
  ok('P1-A the legacy snapshot path persists producer = client_supplied',
    legacy.producer === 'client_supplied', legacy.producer);
  ok('P1-B it carries no execution linkage, because no server-owned execution ran',
    legacy.expertExecutionId === null);
  ok('P1-C it is ANALYSIS_AVAILABLE with confirmationRequired false',
    legacy.analysisState === 'ANALYSIS_AVAILABLE' && legacy.confirmationRequired === false);

  console.log('\n---- P2 (req. 2). a client CANNOT forge server_authored ----\n');

  const forged = await inspections.addAnalysis(principalA, observationA.id, {
    engineVersion: 'hazlenz-production',
    idempotencyKey: `s261-forge-${suffix}`,
    requestVersion: 2,
    resultSnapshot: { multiHazardDecomposition: { hazards: [], isMultiHazard: false, hazardCount: 0 } },
    // Every server-owned field, supplied by the "client". The DTO declares none of them, the global
    // ValidationPipe runs with forbidNonWhitelisted, and the service assigns from literals -- so
    // even reaching the service with them present must change nothing.
    producer: 'server_authored',
    analysisState: 'ANALYSIS_AWAITING_CONFIRMATION',
    confirmationRequired: true,
    expertExecutionId: randomUUID(),
    candidateIdentity: 'forged-candidate',
  } as any);
  ok('P2-A a body asserting producer = server_authored still persists as client_supplied',
    forged.producer === 'client_supplied', forged.producer);
  ok('P2-B a body asserting an execution id still persists no execution linkage',
    forged.expertExecutionId === null);
  ok('P2-C a body asserting confirmationRequired = true still persists false',
    forged.confirmationRequired === false);
  ok('P2-D a body asserting an authoritative state still persists ANALYSIS_AVAILABLE',
    forged.analysisState === 'ANALYSIS_AVAILABLE', forged.analysisState);

  const dbForgery = await rejects(() => q(
    `INSERT INTO "hazlenz_analyses"
       ("observationId","engineVersion","idempotencyKey","requestVersion","resultSnapshot",
        "requestedByUserId","producer","expertExecutionId")
     VALUES ($1,'forged',$2,99,'{}'::jsonb,$3,'server_authored',NULL)`,
    [observationA.id, `s261-sql-forge-${suffix}`, userA.id]));
  ok('P2-E even raw SQL cannot mint server_authored without a real execution row',
    dbForgery !== null && /ck_hazlenz_analysis_producer_execution/.test(String(dbForgery)),
    'the trust boundary is enforced in the database, not only in TypeScript');

  const badProducer = await rejects(() => q(
    `INSERT INTO "hazlenz_analyses"
       ("observationId","engineVersion","idempotencyKey","requestVersion","resultSnapshot",
        "requestedByUserId","producer")
     VALUES ($1,'x',$2,98,'{}'::jsonb,$3,'trusted_partner')`,
    [observationA.id, `s261-vocab-${suffix}`, userA.id]));
  ok('P2-F the producer vocabulary is closed; free text is rejected',
    badProducer !== null && /ck_hazlenz_analysis_producer/.test(String(badProducer)));

  console.log('\n---- P3 (req. 10). pre-spend execution identity contains duplicates ----\n');

  const key = `s261-exec-${suffix}`;
  const first = await expert.claimExecution(principalA, observationA.id,
    { idempotencyKey: key, requestVersion: 3 });
  ok('P3-A the first claim is CLAIMED and is the only one permitted to spend',
    first.outcome === 'CLAIMED' && first.mayCallProvider === true);
  ok('P3-B the execution exists in ANALYSIS_RUNNING before any provider call',
    first.execution.executionState === 'ANALYSIS_RUNNING' && first.execution.attempts === 0,
    'attempts 0 proves the provider was never reached');
  ok('P3-C it is server_authored and names the workspace the server authorized',
    first.execution.producer === 'server_authored'
    && first.execution.organizationId === orgA.id
    && first.execution.inspectionId === inspectionA.id);

  const duplicate = await expert.claimExecution(principalA, observationA.id,
    { idempotencyKey: key, requestVersion: 3 });
  ok('P3-D a duplicate under the same identity discovers ALREADY_RUNNING and MUST NOT spend',
    duplicate.outcome === 'ALREADY_RUNNING' && duplicate.mayCallProvider === false);
  ok('P3-E the duplicate resolves to the SAME execution, it does not create a second',
    duplicate.execution.id === first.execution.id);

  const concurrent = await Promise.all([
    expert.claimExecution(principalA, observationA.id,
      { idempotencyKey: `${key}-race`, requestVersion: 4 }),
    expert.claimExecution(principalA, observationA.id,
      { idempotencyKey: `${key}-race`, requestVersion: 4 }),
    expert.claimExecution(principalA, observationA.id,
      { idempotencyKey: `${key}-race`, requestVersion: 4 }),
  ]);
  ok('P3-F three concurrent claims produce exactly one spender',
    concurrent.filter(c => c.mayCallProvider).length === 1,
    concurrent.map(c => c.outcome).join('/'));
  const [raceRows] = await q(
    `SELECT count(*)::int AS n FROM "expert_analysis_executions"
     WHERE "observationId" = $1 AND "idempotencyKey" = $2`, [observationA.id, `${key}-race`]);
  ok('P3-G exactly one execution row exists for the contended identity',
    raceRows.n === 1, `rows=${raceRows.n}`);

  console.log('\n---- P4 (req. 3). the Expert path assigns server_authored internally ----\n');

  const admitted = admittedAnalysisFixture({
    posture: 'HOLD_PENDING_VERIFICATION',
    driverRole: 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION',
    refKind: 'UNRESOLVED_DECLARATION', ref: 'decl-energy-state-1',
  });
  const persisted = await expert.persistAuthoritativeAnalysis(
    principalA, observationA.id, first.execution.id, resultFor(admitted));

  ok('P4-A the Expert path persists producer = server_authored',
    persisted.analysis.producer === 'server_authored', persisted.analysis.producer);
  ok('P4-B the analysis names the execution that authored it',
    persisted.analysis.expertExecutionId === first.execution.id);
  ok('P4-C the execution names the analysis it produced',
    persisted.execution.analysisId === persisted.analysis.id);
  ok('P4-D candidate provenance is persisted, not engineVersion alone',
    persisted.execution.candidateIdentity
      === '0b12adf6e44e4586ec2be27c5274dafd8a36b2c1042dfe34d543b51d5be70bee'
    && persisted.execution.contractVersion === 'hazlenz.expert.first-pass.259');
  ok('P4-E a controlling unresolved claim yields ANALYSIS_AWAITING_CONFIRMATION',
    persisted.analysis.analysisState === 'ANALYSIS_AWAITING_CONFIRMATION'
    && persisted.analysis.confirmationRequired === true);
  ok('P4-F the execution records WHICH confirmation rule produced the flag',
    persisted.execution.confirmationRuleVersion === CONFIRMATION_RULE_VERSION);
  // -------------------------------------------------------------------------------------------
  // P4-G WAS REVERSED BY §267, AND THE REVERSAL IS THE POINT.
  //
  // §261 asserted here that the prior CURRENT analysis was superseded by the Expert run. `forged`
  // is a CLIENT_SUPPLIED row — P2-A above asserts exactly that — so the old assertion required an
  // Expert analysis to supersede the customer-authoritative deterministic one. §261 wrote it in
  // good faith: at the time `hazlenz_analyses` had one currentness slot per observation and
  // "the prior current analysis" had only one possible meaning.
  //
  // §266 then measured what that rule does in the product. A successful Expert run marked the
  // deterministic analysis superseded, the workspace restored the newest non-superseded row, and
  // the deterministic UI was handed an Expert snapshot it read through the wrong schema — an
  // ADVISORY layer displacing the customer-authoritative record at the data level. §267 decided it:
  // cross-producer supersession is PROHIBITED.
  //
  // So this expectation is stale rather than wrong-at-the-time, and it is REVERSED rather than
  // relaxed. The three assertions below are strictly stronger than the one they replace: the old
  // one checked a single row's status, these pin the whole currentness model — within-family
  // supersession still happens, cross-family supersession does not, and both families end with
  // exactly one current row.
  const forgedAfter = (await repo<HazLenzAnalysis>(HazLenzAnalysis)
    .findOne({ where: { id: forged.id } }))!;
  const legacyAfter = (await repo<HazLenzAnalysis>(HazLenzAnalysis)
    .findOne({ where: { id: legacy.id } }))!;
  ok('P4-G §267: the Expert run did NOT supersede the current DETERMINISTIC analysis',
    forgedAfter.status === 'current' && forgedAfter.producer === 'client_supplied',
    `${forgedAfter.producer}/${forgedAfter.status}`);
  ok('P4-G2 within-family supersession still holds: the older deterministic row is superseded',
    legacyAfter.status === 'superseded', legacyAfter.status);
  ok('P4-G3 the Expert analysis is current within its OWN family, so each producer has exactly one',
    persisted.analysis.status === 'current' && persisted.analysis.producer === 'server_authored',
    `${persisted.analysis.producer}/${persisted.analysis.status}`);

  console.log('\n---- P5 (req. 9). the confirmation flag is STORED, never recomputed on read ----\n');

  await q(`UPDATE "hazlenz_analyses" SET "resultSnapshot" = $1 WHERE "id" = $2`, [
    // The stored analysis is rewritten to a shape the CURRENT rule would score as NOT requiring
    // confirmation. A read that recomputed would now answer false.
    JSON.stringify(admittedAnalysisFixture({
      posture: 'CONTINUE', driverRole: 'ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION',
      refKind: 'HAZARD_CANDIDATE', ref: 'hc-1',
    })),
    persisted.analysis.id,
  ]);
  const reread = await repo<HazLenzAnalysis>(HazLenzAnalysis)
    .findOne({ where: { id: persisted.analysis.id } });
  ok('P5-A the stored flag survives a snapshot whose content would now score differently',
    reread!.confirmationRequired === true,
    'a later rule or content change must not alter what an earlier reviewer was asked');
  ok('P5-B the stored state survives with it',
    reread!.analysisState === 'ANALYSIS_AWAITING_CONFIRMATION');
  const liveRule = expert.determineConfirmation(reread!.resultSnapshot);
  ok('P5-C the live rule genuinely disagrees with the stored flag, so P5-A is not vacuous',
    liveRule.confirmationRequired === false && reread!.confirmationRequired === true);

  console.log('\n---- P6 (req. 11 and 12). H3/H4 structural identity survives persistence ----\n');

  const claim2 = await expert.claimExecution(principalA, observationA.id,
    { idempotencyKey: `s261-struct-${suffix}`, requestVersion: 5 });
  const structural = admittedAnalysisFixture({
    posture: 'CONTINUE_WITH_CONTROLS', driverRole: 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP',
    refKind: 'UNRESOLVED_DECLARATION', ref: 'decl-atmosphere-2',
  });
  const structuralRow = (await expert.persistAuthoritativeAnalysis(
    principalA, observationA.id, claim2.execution.id, resultFor(structural))).analysis;

  const [raw] = await q(`SELECT "resultSnapshot" FROM "hazlenz_analyses" WHERE "id" = $1`,
    [structuralRow.id]);
  const snap = raw.resultSnapshot as any;

  ok('P6-A unresolved declaration IDs survive persistence',
    snap.unresolvedFactDeclarations.map((d: any) => d.declarationId)
      .join(',') === 'decl-energy-state-1,decl-atmosphere-2');
  ok('P6-B resumeCondition.resolvedByDeclarationIds survives as declaration REFERENCES',
    JSON.stringify(snap.immediateSafetyPosture.resumeCondition.resolvedByDeclarationIds)
      === JSON.stringify(['decl-energy-state-1', 'decl-atmosphere-2']));
  ok('P6-C the resume condition still resolves against the persisted declaration IDs',
    snap.immediateSafetyPosture.resumeCondition.resolvedByDeclarationIds.every((id: string) =>
      snap.unresolvedFactDeclarations.some((d: any) => d.declarationId === id)),
    'the binding is by identity, not by paraphrase');
  ok('P6-D controlId survives on every required control',
    snap.immediateSafetyPosture.requiredControls.map((c: any) => c.controlId)
      .join(',') === 'ctrl-lockout-1,ctrl-watch-2');
  ok('P6-E dischargingControlRef survives AS THE ID, not resolved to prose',
    snap.immediateSafetyPosture.requiredBy[0].roleJustification.dischargingControlRef
      === 'ctrl-lockout-1');
  ok('P6-F the discharging reference resolves against a persisted controlId',
    snap.immediateSafetyPosture.requiredControls.some((c: any) =>
      c.controlId === snap.immediateSafetyPosture.requiredBy[0].roleJustification.dischargingControlRef));
  ok('P6-G the refKind:ref pair on the driver survives for the confirmation subject',
    snap.immediateSafetyPosture.requiredBy[0].refKind === 'UNRESOLVED_DECLARATION'
    && snap.immediateSafetyPosture.requiredBy[0].ref === 'decl-atmosphere-2');
  // `jsonb` normalizes OBJECT KEY ORDER (it sorts keys by length then bytewise) and that is a
  // property of the storage type, not content loss: no key is dropped and no value is altered.
  // The comparison is therefore canonicalized over object keys while ARRAY order -- which jsonb
  // does preserve, and on which declaration and control sequencing depends -- is still required to
  // match exactly. This remains strictly stronger than the field-by-field checks above: it fails on
  // any dropped field, any changed value, any added field, and any structural identity replaced by
  // prose, anywhere in the tree.
  const canonical = (v: any): any => {
    if (Array.isArray(v)) return v.map(canonical);
    if (v && typeof v === 'object') {
      return Object.keys(v).sort().reduce((a: any, k) => { a[k] = canonical(v[k]); return a; }, {});
    }
    return v;
  };
  ok('P6-H nothing was flattened: the persisted snapshot round-trips with no loss at all',
    JSON.stringify(canonical(snap)) === JSON.stringify(canonical(structural)),
    'there is no mapper between the admitted structure and the column');
  ok('P6-J array ORDER survives, so declaration and control sequencing is not reshuffled',
    JSON.stringify(snap.unresolvedFactDeclarations.map((d: any) => d.declarationId))
      === JSON.stringify(structural.unresolvedFactDeclarations.map((d: any) => d.declarationId))
    && JSON.stringify(snap.immediateSafetyPosture.requiredControls.map((c: any) => c.controlId))
      === JSON.stringify(structural.immediateSafetyPosture.requiredControls.map((c: any) => c.controlId)));
  ok('P6-I branch (b) on a permitting posture produced AWAITING_CONFIRMATION through the service',
    structuralRow.analysisState === 'ANALYSIS_AWAITING_CONFIRMATION'
    && structuralRow.confirmationRequired === true);

  console.log('\n---- P7 (req. 13). the analysis-creation audit event ----\n');

  const audits = repo<SecurityAuditEvent>(SecurityAuditEvent);
  const serverEvent = await audits.findOne({
    where: { action: ANALYSIS_ANALYSIS_CREATED_AUDIT_ACTION, resourceId: structuralRow.id },
  });
  ok('P7-A a server-authored analysis emits an analysis_created event', serverEvent !== null);
  const meta = (serverEvent?.metadata ?? {}) as Record<string, unknown>;
  ok('P7-B it records who initiated it', serverEvent?.actorUserId === userA.id);
  ok('P7-C it records the workspace, inspection and observation',
    serverEvent?.organizationId === orgA.id && meta.inspectionId === inspectionA.id
    && meta.observationId === observationA.id);
  ok('P7-D it records the execution and analysis identities',
    meta.executionId === claim2.execution.id && meta.analysisId === structuralRow.id);
  ok('P7-E it records candidate/version provenance',
    meta.candidateIdentity === '0b12adf6e44e4586ec2be27c5274dafd8a36b2c1042dfe34d543b51d5be70bee'
    && meta.contractVersion === 'hazlenz.expert.first-pass.259'
    && meta.confirmationRuleVersion === CONFIRMATION_RULE_VERSION);
  ok('P7-F it records the resulting state and confirmation status',
    meta.analysisState === 'ANALYSIS_AWAITING_CONFIRMATION' && meta.confirmationRequired === true
    && meta.confirmationTriggerCount === 1 && meta.confirmationFailedClosed === false);
  ok('P7-G it records the producer that distinguishes the two paths',
    meta.producer === 'server_authored');

  const auditJson = JSON.stringify(meta);
  ok('P7-H NO raw provider payload or model prose is written into generic audit metadata',
    !auditJson.includes('whatHappensNow') && !auditJson.includes('Prose the deterministic')
    && !auditJson.includes('Apply lockout') && !/rawFirstPass|rawVerifier/.test(auditJson),
    'raw output stays on the execution record, under the analysis access controls');
  const [rawOnExecution] = await q(
    `SELECT ("rawFirstPass" IS NULL) AS absent FROM "expert_analysis_executions" WHERE "id" = $1`,
    [claim2.execution.id]);
  ok('P7-I the execution record is where raw output would live',
    rawOnExecution.absent === true, 'null here because this slice makes no provider call');

  const legacyEvent = await audits.findOne({
    where: { action: ANALYSIS_ANALYSIS_CREATED_AUDIT_ACTION, resourceId: legacy.id },
  });
  ok('P7-J the legacy client-supplied path also emits the event, closing the gap for both',
    legacyEvent !== null);
  const legacyMeta = (legacyEvent?.metadata ?? {}) as Record<string, unknown>;
  ok('P7-K the legacy event records the engineVersion AS A CLIENT CLAIM, not as provenance',
    legacyMeta.clientAssertedEngineVersion === 'hazlenz-production'
    && legacyMeta.candidateIdentity === null && legacyMeta.executionId === null);
  ok('P7-L one action name covers both producers, distinguished by the producer field',
    legacyMeta.producer === 'client_supplied' && meta.producer === 'server_authored');

  console.log('\n---- P8 (req. 14). cross-workspace linkage cannot be created ----\n');

  const crossClaim = await rejects(() => expert.claimExecution(principalB, observationA.id,
    { idempotencyKey: `s261-cross-${suffix}`, requestVersion: 1 }));
  ok('P8-A a user from another workspace cannot claim an execution on this observation',
    crossClaim !== null && /not found/i.test(crossClaim.message),
    'NotFound, so no existence is leaked');

  const crossLoad = await rejects(() => expert.loadExecutionForObservation(
    principalB, observationA.id, first.execution.id));
  ok('P8-B a cross-workspace read of a known execution id is refused',
    crossLoad !== null && /not found/i.test(crossLoad.message));

  const crossPersist = await rejects(() => expert.persistAuthoritativeAnalysis(
    principalB, observationA.id, claim2.execution.id, resultFor(admitted)));
  ok('P8-C a cross-workspace persistence attempt is refused',
    crossPersist !== null && /not found/i.test(crossPersist.message));

  // The execution id is never trusted as a bare key: it is re-derived against the authorized
  // observation. Owner B authorizes their OWN observation and then presents A's execution id.
  const ownClaim = await expert.claimExecution(principalB, observationB.id,
    { idempotencyKey: `s261-own-${suffix}`, requestVersion: 1 });
  ok('P8-D workspace B can legitimately claim on its own observation',
    ownClaim.outcome === 'CLAIMED');
  const smuggled = await rejects(() => expert.persistAuthoritativeAnalysis(
    principalB, observationB.id, first.execution.id, resultFor(admitted)));
  ok('P8-E presenting another workspace\'s execution id under an authorized observation is refused',
    smuggled !== null && /not found/i.test(smuggled.message),
    'findOne({ id, observationId }), never findOne({ id })');
  const [leaked] = await q(
    `SELECT count(*)::int AS n FROM "expert_analysis_executions"
     WHERE "id" = $1 AND "observationId" = $2`, [first.execution.id, observationB.id]);
  ok('P8-F no cross-workspace execution linkage was created', leaked.n === 0);

  console.log('\n---- P9. refusal and failure are persisted OUTCOMES, never generic success ----\n');

  const refusedClaim = await expert.claimExecution(principalA, observationA.id,
    { idempotencyKey: `s261-refused-${suffix}`, requestVersion: 6 });
  const refused = await expert.persistAuthoritativeAnalysis(
    principalA, observationA.id, refusedClaim.execution.id,
    resultFor({} as any, {
      status: 'FIRST_PASS_REFUSED', admission: 'REFUSE', admittedAnalysis: null,
      resultSnapshot: { refused: true }, postureRefusalCodes: ['POSTURE_ABSENT'],
    }));
  ok('P9-A a refused output persists as ANALYSIS_REFUSED, never as available',
    refused.analysis.analysisState === 'ANALYSIS_REFUSED');
  ok('P9-B a refused analysis is still server_authored: the server owns the refusal',
    refused.analysis.producer === 'server_authored');
  ok('P9-C the structured refusal codes are persisted on the execution',
    JSON.stringify(refused.execution.postureRefusalCodes) === JSON.stringify(['POSTURE_ABSENT']));
  ok('P9-D a refused execution is TERMINAL for re-spend',
    (await expert.claimExecution(principalA, observationA.id,
      { idempotencyKey: `s261-refused-${suffix}`, requestVersion: 6 })).outcome
      === 'ALREADY_FAILED_TERMINAL');

  const failClaim = await expert.claimExecution(principalA, observationA.id,
    { idempotencyKey: `s261-failed-${suffix}`, requestVersion: 7 });
  const failed = await expert.markExecutionFailed(principalA, observationA.id,
    failClaim.execution.id, { kind: 'TRANSPORT_TIMEOUT', detail: 'no response', attempts: 1 });
  ok('P9-E a transport failure settles the execution as ANALYSIS_FAILED',
    failed.executionState === 'ANALYSIS_FAILED' && failed.failureKind === 'TRANSPORT_TIMEOUT');
  ok('P9-F a transport failure creates NO analysis row, so nothing can render as a result',
    failed.analysisId === null);
  ok('P9-G a transport failure is RETRYABLE, unlike a refusal',
    (await expert.claimExecution(principalA, observationA.id,
      { idempotencyKey: `s261-failed-${suffix}`, requestVersion: 7 })).outcome
      === 'ALREADY_FAILED_RETRYABLE');

  const doubleSettle = await rejects(() => expert.persistAuthoritativeAnalysis(
    principalA, observationA.id, refusedClaim.execution.id, resultFor(admitted)));
  ok('P9-H an already-settled execution cannot be settled twice',
    doubleSettle !== null && /already been settled/i.test(doubleSettle.message));

  console.log('\n---- P10. every server-authored row satisfies the trust boundary ----\n');
  const [invariant] = await q(`
    SELECT
      count(*) FILTER (WHERE "producer" = 'server_authored' AND "expertExecutionId" IS NULL)::int AS orphaned,
      count(*) FILTER (WHERE "producer" = 'client_supplied' AND "expertExecutionId" IS NOT NULL)::int AS mislabelled,
      count(*) FILTER (WHERE "producer" = 'server_authored')::int AS authored,
      count(*) FILTER (WHERE "producer" = 'client_supplied')::int AS supplied
    FROM "hazlenz_analyses"`);
  ok('P10-A no server-authored analysis lacks an execution', invariant.orphaned === 0);
  ok('P10-B no client-supplied analysis names an execution', invariant.mislabelled === 0);
  ok('P10-C both producers are actually present, so P10-A/B are not vacuous',
    invariant.authored > 0 && invariant.supplied > 0,
    `server_authored=${invariant.authored} client_supplied=${invariant.supplied}`);

  await ds.destroy();
  console.log(`\n================ §261 persistence foundation: ${pass} passed, ${fail} failed`);
  console.log(JSON.stringify({
    providerCalls: 0, database: target.database, disposable: true,
    passed: pass, failed: fail,
  }));
  if (fail > 0) { console.log(`failures: ${failures.join(', ')}`); process.exit(1); }
}

main().catch(error => { console.error(error); process.exit(1); });
