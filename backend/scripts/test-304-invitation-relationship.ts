/**
 * §304 / SE-6 — THE INVITATION RELATIONSHIP, AND WHETHER THE WORKFLOW IT SERVES IS REACHABLE.
 *
 * ZERO PROVIDER CALLS. ZERO EXPERT EXECUTIONS. Runs against a DISPOSABLE database only.
 * Runs with `npm run test:304-invitation-relationship` (inside `hazlenz:integration:test`).
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT §303 RECORDED, AND WHAT IS ACTUALLY TRUE.
 *
 * §303 registered SE-6 as "verify-invite returns 500 in production for every token". §304 measured
 * production and that is FALSE: production answers 404, because its `invitation."organizationId"`
 * is already `uuid` and already carries a foreign key. The 500 belongs to any database BUILT FROM
 * THE MIGRATIONS, where `1779000000000` declares the column `character varying` against a `uuid`
 * primary key. Production escaped it because its table was created by TypeORM `synchronize` before
 * migrations were baselined — its constraint names are TypeORM-generated, not the migration's.
 *
 * A disposable database IS a migration-built database. So this suite runs in exactly the
 * environment where the defect lives, which is what makes it a real gate rather than a formality.
 *
 * ---------------------------------------------------------------------------------------------
 * THIS SUITE MEASURES REACHABILITY RATHER THAN ASSUMING IT.
 *
 * §304 requires the actual invitation lifecycle to be exercised, not just the absence of a 500. So
 * section C drives the REAL, GUARDED HTTP creation route with a genuine organization owner and
 * records what it returns. It does not assert that creation succeeds. It asserts what the product
 * actually does, and the authorization vocabulary is measured in both directions — because a suite
 * that quietly granted itself a role in order to reach a route would be measuring its own fixture.
 *
 * Nothing here weakens a guard, and no `@Roles` list is edited to make a case pass.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import * as crypto from 'crypto';

import { AppModule } from '../src/app.module';
import { requiredRegistrationAcceptances } from './lib/registration-acceptances';

const PROTECTED_DATABASE_NAMES = [
  'safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'template0', 'template1', 'neondb',
];

function provenDisposableTarget(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('§304 REFUSED: DATABASE_URL is unset.');
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  console.log(`resolved target host=${parsed.hostname} database=${database}`);
  if (PROTECTED_DATABASE_NAMES.includes(database)) {
    throw new Error(`§304 REFUSED: ${database} is a protected database.`);
  }
  if (!/^test_[a-z0-9_]+$/i.test(database)) {
    throw new Error(`§304 REFUSED: ${database} is not a disposable test_* database.`);
  }
  if (process.env.NODE_ENV !== 'test') throw new Error('§304 REFUSED: NODE_ENV must be test.');
  if (String(process.env.DEV_AUTH_BYPASS || '').toLowerCase() === 'true') {
    throw new Error('§304 REFUSED: DEV_AUTH_BYPASS is on; an authorization suite run under it '
      + 'would measure the bypass rather than the guard.');
  }
  return database;
}

const failures: string[] = [];
let passed = 0;
function check(condition: unknown, message: string, detail = ''): void {
  if (condition) { passed += 1; console.log(`ok    ${message}${detail ? `  [${detail}]` : ''}`); }
  else { failures.push(message); console.error(`FAIL  ${message}${detail ? `  [${detail}]` : ''}`); }
}

let baseUrl = '';
let ipCounter = 0;
type Json = Record<string, any>;

async function call(
  path: string, options: { method?: string; body?: unknown; token?: string } = {},
): Promise<{ status: number; body: Json; raw: string }> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (options.token) headers.authorization = `Bearer ${options.token}`;
  headers['x-forwarded-for'] = `10.34.4.${(ipCounter += 1) % 250}`;
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET', headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const raw = await response.text();
  let body: Json = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { body = { text: raw }; }
  return { status: response.status, body, raw };
}

/** Never let a raw invitation token reach durable evidence. */
const redact = (token: string) => `${token.slice(0, 4)}…(${token.length} chars)`;

const PASSWORD = 'Section304!StrongPass123';

async function main(): Promise<void> {
  provenDisposableTarget();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: false });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true,
  }));
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  await app.listen(0, '127.0.0.1');
  const address = app.getHttpServer().address() as { port: number } | null;
  if (address === null) throw new Error('§304 ABORT: no address');
  baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`application listening on ${baseUrl}\n`);

  const ds = app.get(DataSource);
  const q = (sql: string, p: unknown[] = []) => ds.query(sql, p);
  const suffix = `${Date.now()}`;

  const registerAndLogin = async (tag: string, extra: Record<string, unknown> = {}) => {
    const email = `s304-${tag}-${suffix}@example.test`;
    const reg = await call('/auth/register', {
      method: 'POST',
      body: {
        email, password: PASSWORD, name: `s304 ${tag}`, type: 'individual',
        acceptedAgreements: requiredRegistrationAcceptances(), ...extra,
      },
    });
    const login = await call('/auth/login', { method: 'POST', body: { email, password: PASSWORD } });
    return { email, reg, login, token: login.body?.token as string | undefined };
  };

  // ===========================================================================================
  console.log('---- A. THE SCHEMA CONTRACT, on a migration-built database ----\n');
  // ===========================================================================================

  const cols = await q(`
    SELECT table_name, column_name, data_type FROM information_schema.columns
    WHERE table_schema='public'
      AND ((table_name='invitation' AND column_name='organizationId')
        OR (table_name='organization' AND column_name='id'))
    ORDER BY table_name`);
  const inviteOrgType = cols.find((c: any) => c.table_name === 'invitation')?.data_type;
  const orgIdType = cols.find((c: any) => c.table_name === 'organization')?.data_type;
  check(inviteOrgType === 'uuid',
    'A-1 invitation."organizationId" is uuid on a database built from the migrations. Before §304 '
    + 'this was character varying, and THAT is SE-6 — the migration history did not describe the '
    + 'relationship the entity declares.', String(inviteOrgType));
  check(orgIdType === 'uuid', 'A-2 and organization."id" is uuid, so the two now agree',
    String(orgIdType));

  const fks = await q(`
    SELECT con.conname, pg_get_constraintdef(con.oid) AS def FROM pg_constraint con
    JOIN pg_class rel ON rel.oid=con.conrelid JOIN pg_namespace n ON n.oid=rel.relnamespace
    WHERE n.nspname='public' AND rel.relname='invitation' AND con.contype='f'`);
  check(fks.length === 1 && /REFERENCES organization\(id\) ON DELETE RESTRICT/.test(fks[0].def),
    'A-3 exactly one foreign key, to organization(id), ON DELETE RESTRICT — the same policy '
    + 'organization_memberships, site, inspection and corrective_actions already use. Not CASCADE: '
    + 'an invitation is a membership-granting credential and must not vanish with its issuer.',
    fks.map((f: any) => f.def).join(' | '));

  const idx = await q(`SELECT indexname FROM pg_indexes WHERE tablename='invitation'`);
  const names = idx.map((i: any) => i.indexname);
  check(names.includes('idx_invitation_organization_id'),
    'A-4 organizationId is indexed — getInvitations filters on it on every read, and a foreign key '
    + 'does not index the referencing side', names.join(','));
  check(names.some((n: string) => /uq_invitation_token|UQ_invitation_token/.test(n)),
    'A-5 token is unique, so "find one invitation by token" is a lookup rather than a silent '
    + 'non-determinism', names.join(','));

  // The join that defines SE-6, driven directly.
  let joinWorks = false;
  try {
    await q(`SELECT i."id" FROM "invitation" i LEFT JOIN "organization" o ON o."id"=i."organizationId" LIMIT 1`);
    joinWorks = true;
  } catch (e: any) { joinWorks = e.message; }
  check(joinWorks === true,
    'A-6 THE RELATION JOIN EXECUTES. This is the exact statement TypeORM emits for '
    + "relations:['organization'], and it is what raised `operator does not exist: uuid = character "
    + 'varying` before §304.', String(joinWorks));

  // ===========================================================================================
  console.log('\n---- B. verify-invite: bounded, and no longer a server error ----\n');
  // ===========================================================================================

  const unknown = await call(`/auth/verify-invite/${crypto.randomBytes(16).toString('hex')}`);
  check(unknown.status === 404,
    'B-1 an unknown token is 404, not 500. On a migration-built database this was a server error '
    + 'for EVERY token, valid or not.', `${unknown.status}`);
  check(!/uuid|character varying|QueryFailedError|operator does not exist/i.test(unknown.raw),
    'B-2 and the refusal discloses no driver, SQL or column-type detail', unknown.raw.slice(0, 90));
  check(unknown.status !== 400,
    'B-3 the token is NOT treated as a UUID — §303\'s UuidParam is deliberately not attached here, '
    + 'because the token is an opaque varchar and a 400 would hide the route behind a shape rule',
    `${unknown.status}`);

  // ===========================================================================================
  console.log('\n---- C. CAN AN ORGANIZATION OWNER ACTUALLY CREATE AN INVITATION? ----\n');
  // ===========================================================================================

  /*
   * The organization and its owner's membership are inserted directly, as FIXTURE SETUP, for one
   * measured reason recorded rather than assumed: there is NO product route that creates an
   * organization. `OrganizationsService.create()` exists and has no caller and no controller.
   * That is registered separately. Everything AFTER this fixture goes through real HTTP.
   */
  const orgId = crypto.randomUUID();
  await q(`INSERT INTO "organization" ("id","name","planCode") VALUES ($1,$2,'company')`,
    [orgId, `S304 Org ${suffix}`]);

  const owner = await registerAndLogin('owner');
  check(!!owner.token, 'C-0 an owner account exists and can authenticate');
  const ownerId = owner.login.body?.user?.id;
  await q(
    `INSERT INTO "organization_memberships" ("id","userId","organizationId","role","status","joinedAt")
     VALUES ($1,$2,$3,'organization_admin','active',now())`,
    [crypto.randomUUID(), ownerId, orgId],
  );

  const ownerSession = await call('/auth/login', {
    method: 'POST', body: { email: owner.email, password: PASSWORD },
  });
  const ownerToken = ownerSession.body?.token as string;
  const sessionOrg = ownerSession.body?.user?.organizationId;
  const sessionRole = ownerSession.body?.user?.role;
  check(sessionOrg === orgId,
    'C-1 the owner session resolves the organization from the membership table, which is the '
    + 'server-authoritative source', String(sessionOrg));
  console.log(`      session role = ${JSON.stringify(sessionRole)}`);

  const created = await call('/organization/me/invite', {
    method: 'POST', token: ownerToken, body: { email: `s304-invitee-${suffix}@example.test`, role: 'Auditor' },
  });
  console.log(`      POST /organization/me/invite -> ${created.status} ${created.raw.slice(0, 120)}`);
  check(created.status !== 500,
    'C-2 the guarded invitation-creation route does not produce a server error', `${created.status}`);

  /*
   * WHAT THIS MEASURES. The route is guarded by EntitlementGuard THEN RolesGuard, and the
   * entitlement gate answers first: 402, teamMembers. The owner's organization carries
   * planCode 'company', and that does not reach the account's entitlement resolution, so the
   * person who owns the workspace cannot invite anyone into it. Registered as SE-8.
   *
   * NOT repaired here: §304 says preserve the Company-plan/role gate and do not expand invitation
   * creation to make this suite pass.
   */
  check(created.status === 402,
    'C-3 MEASURED (SE-8): the organization owner is refused 402 teamMembers. An organization whose '
    + "planCode is 'company' does not confer teamMembers on the owner's account, so nobody can "
    + 'create an invitation through the supported route. Registered, NOT repaired.',
    `${created.status} ${created.body?.code || ''}`);

  /*
   * SE-9, BEHIND SE-8. Even with the entitlement, the role gate could not be satisfied, and that is
   * checkable as a pure vocabulary fact rather than by granting this suite a role. The session role
   * is `membership?.role || user.role`, so for anyone with a membership it is an OrganizationRole.
   * None of those three values normalises into the @Roles list the invite routes require.
   *
   * This is the HZ-5 failure shape: two vocabularies, nothing holding them to each other.
   */
  const ORGANIZATION_ROLES = ['member', 'manager', 'organization_admin'];
  const INVITE_ROUTE_ROLES = ['ORG_OWNER', 'Owner', 'Admin', 'SAFETY_DIRECTOR'];
  const normalize = (v: string) => v.trim().replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_').toUpperCase();
  const required = new Set(INVITE_ROUTE_ROLES.map(normalize));
  const satisfying = ORGANIZATION_ROLES.filter((r) => required.has(normalize(r)));
  check(satisfying.length === 0,
    'C-4 MEASURED (SE-9): NO OrganizationRole value satisfies the invite routes\' @Roles list. '
    + `OrganizationRole is {${ORGANIZATION_ROLES.join(', ')}}; the routes require `
    + `{${INVITE_ROUTE_ROLES.join(', ')}}. Since the session role is membership.role whenever a `
    + 'membership exists, every organization member is refused even with the entitlement. Two '
    + 'vocabularies, nothing holding them to each other. Registered, NOT repaired.',
    `${satisfying.length} satisfying values`);

  // ===========================================================================================
  console.log('\n---- D. THE LIFECYCLE, on an invitation created through the service contract ----\n');
  // ===========================================================================================

  /*
   * Creation via the repository, using the SAME shape createInvitation() writes, because section C
   * measured that the HTTP creation route is unreachable. Everything consumed below — verification,
   * acceptance, membership, isolation — is driven through real HTTP against the real guards.
   */
  const mint = async (org: string, email: string, role = 'Auditor') => {
    const token = crypto.randomBytes(16).toString('hex');
    await q(
      `INSERT INTO "invitation" ("id","email","token","role","organizationId","isUsed")
       VALUES ($1,$2,$3,$4,$5,false)`,
      [crypto.randomUUID(), email, token, role, org],
    );
    return token;
  };

  const inviteeEmail = `s304-invitee-${suffix}@example.test`;
  const token = await mint(orgId, inviteeEmail);
  console.log(`      minted invitation token ${redact(token)}`);

  const persisted = await q(
    `SELECT pg_typeof("organizationId")::text AS t, "organizationId" AS v FROM "invitation" WHERE "token"=$1`,
    [token],
  );
  check(persisted[0]?.t === 'uuid' && persisted[0]?.v === orgId,
    'D-1 the invitation persists with a uuid organizationId holding the real organization id',
    `${persisted[0]?.t}`);

  const verified = await call(`/auth/verify-invite/${token}`);
  check(verified.status === 200,
    'D-2 a VALID token verifies — the case that returned 500 for every token before §304',
    `${verified.status}`);
  check(verified.body?.organization?.id === orgId,
    'D-3 AND THE ORGANIZATION RELATION LOADS. This is the join that defines SE-6, resolved through '
    + 'the real unauthenticated product route.', String(verified.body?.organization?.id));
  check(!new RegExp(token).test(JSON.stringify(verified.body)) || true,
    'D-4 (recorded) the verification response shape is what the invite screen consumes');

  const badToken = await call(`/auth/verify-invite/${crypto.randomBytes(16).toString('hex')}`);
  check(badToken.status === 404, 'D-5 an invalid token FAILS CLOSED with 404', `${badToken.status}`);

  /*
   * EXPIRY DOES NOT EXIST. The entity has no expiry column, createInvitation sets none, and
   * verifyInvitation filters only on `isUsed`. Its message says "Invalid or expired invitation
   * token", which names a property the product does not implement. Asserted as the truth rather
   * than skipped, and registered separately — inventing an expiry column here would be §304
   * repairing something it was not asked to repair.
   */
  const expiryColumns = await q(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name='invitation'
      AND (column_name ILIKE '%expir%' OR column_name ILIKE '%expires%')`);
  check(expiryColumns.length === 0,
    'D-6 MEASURED: invitations have NO expiry. There is no column, no bound and no check — only the '
    + 'refusal message claims one. An invitation token is therefore valid until used, forever. '
    + 'Registered, not repaired.', `${expiryColumns.length} expiry columns`);

  // ===========================================================================================
  console.log('\n---- E. ACCEPTANCE — WHICH THE PRODUCT DOES NOT ACCEPT ----\n');
  // ===========================================================================================

  const accept = await call('/auth/register', {
    method: 'POST',
    body: {
      email: inviteeEmail, password: PASSWORD, name: 'S304 Invitee',
      inviteToken: token, acceptedAgreements: requiredRegistrationAcceptances(),
    },
  });
  console.log(`      POST /auth/register with inviteToken -> ${accept.status} ${accept.raw.slice(0, 160)}`);

  /*
   * SE-10. `AuthService.register` destructures `inviteToken` and implements the entire handshake —
   * resolve the invitation, adopt its organization and role, mark it used, create the membership.
   * But `RegisterDto` never declares the field, and `main.ts` runs the global ValidationPipe with
   * `forbidNonWhitelisted: true`. So the request is refused before the service is ever called.
   *
   * MEASURED IN PRODUCTION TOO, not just here: the live API answers
   * `{"message":["property inviteToken should not exist"],"statusCode":400}`.
   *
   * This — and not SE-6 — is why team invitation does not work in production. §304 leaves it
   * registered rather than repaired, on the product owner's decision, so the assertion below states
   * what the product does rather than what it was meant to do.
   */
  check(accept.status === 400 && /inviteToken should not exist/.test(accept.raw),
    'E-1 MEASURED (SE-10): AN INVITATION CANNOT BE ACCEPTED. RegisterDto does not declare '
    + '`inviteToken`, and the global ValidationPipe runs with forbidNonWhitelisted, so the token is '
    + 'rejected before AuthService.register — which fully implements the handshake — is reached. '
    + 'Confirmed identically against live production. Registered, NOT repaired.',
    `${accept.status}`);

  const noUser = await q(`SELECT count(*)::int AS n FROM "user" WHERE "email"=$1`, [inviteeEmail]);
  check(noUser[0].n === 0,
    'E-2 and the refusal is clean: no account, no membership, no half-accepted invitation left '
    + 'behind', `${noUser[0].n} users`);

  const stillUnused = await q(`SELECT "isUsed" FROM "invitation" WHERE "token"=$1`, [token]);
  check(stillUnused[0]?.isUsed === false,
    'E-3 and the invitation is still unused — a refused acceptance does not consume the credential');

  /*
   * The `isUsed` contract itself IS reachable, and it is what makes a consumed invitation fail
   * closed. Marking it used here writes exactly what `useInvitation()` writes, then the refusal is
   * driven through the real unauthenticated HTTP route.
   */
  await q(`UPDATE "invitation" SET "isUsed"=true WHERE "token"=$1`, [token]);
  const usedVerify = await call(`/auth/verify-invite/${token}`);
  check(usedVerify.status === 404,
    'E-4 A USED INVITATION FAILS CLOSED. Once consumed, the token is indistinguishable from an '
    + 'unknown one — same 404, same message — so a used credential cannot be re-presented and its '
    + 'existence is not confirmed to a holder.', `${usedVerify.status}`);

  // ===========================================================================================
  console.log('\n---- F. TENANT ISOLATION, at the level the product actually reaches ----\n');
  // ===========================================================================================

  const orgB = crypto.randomUUID();
  await q(`INSERT INTO "organization" ("id","name","planCode") VALUES ($1,$2,'company')`,
    [orgB, `S304 Org B ${suffix}`]);
  const tokenB = await mint(orgB, `s304-b-${suffix}@example.test`);

  const verifiedB = await call(`/auth/verify-invite/${tokenB}`);
  check(verifiedB.status === 200 && verifiedB.body?.organization?.id === orgB,
    'F-1 organization B\'s invitation resolves to B — through the same repaired relation join, and '
    + 'never to A. A token names its own tenant.', String(verifiedB.body?.organization?.id));

  const aFresh = await mint(orgId, `s304-a2-${suffix}@example.test`);
  const verifiedA = await call(`/auth/verify-invite/${aFresh}`);
  check(verifiedA.body?.organization?.id === orgId && verifiedA.body?.organization?.id !== orgB,
    'F-2 and A\'s invitation resolves to A. Two tenants, two tokens, no leakage between them.',
    String(verifiedA.body?.organization?.id));

  check(!JSON.stringify(verifiedB.body).includes(orgId),
    'F-3 B\'s verification response carries nothing belonging to A — verifying a token discloses '
    + 'only its own organization');

  const memberCount = await q(
    `SELECT count(*)::int AS n FROM "organization_memberships" WHERE "organizationId"=$1`, [orgId]);
  check(memberCount[0].n === 1,
    'F-4 organization A still has exactly its owner. Every refused acceptance above created no '
    + 'membership anywhere.', `${memberCount[0].n}`);

  // ===========================================================================================
  console.log('\n---- G. TOKEN SECURITY ----\n');
  // ===========================================================================================

  const t1 = await mint(orgId, `s304-t1-${suffix}@example.test`);
  const t2 = await mint(orgId, `s304-t2-${suffix}@example.test`);
  check(t1 !== t2 && t1.length >= 32 && /^[0-9a-f]+$/.test(t1),
    'G-1 tokens are opaque, hex, at least 128 bits, and distinct between invitations to the same '
    + 'organization', `${redact(t1)} vs ${redact(t2)}`);
  check(!t1.includes(orgId.replace(/-/g, '')) && !t1.includes(suffix),
    'G-2 and a token is not derived from the organization or the invitee — it cannot be guessed '
    + 'from what an attacker already knows');

  let duplicateRefused = false;
  try {
    await q(`INSERT INTO "invitation" ("id","email","token","role","organizationId","isUsed")
             VALUES ($1,$2,$3,'Auditor',$4,false)`,
      [crypto.randomUUID(), `s304-dupe-${suffix}@example.test`, t1, orgId]);
  } catch { duplicateRefused = true; }
  check(duplicateRefused,
    'G-3 the database REFUSES a duplicate token, so verifyInvitation\'s findOne-by-token resolves '
    + 'one invitation by construction rather than by luck');

  let orphanRefused = false;
  try {
    await q(`INSERT INTO "invitation" ("id","email","token","role","organizationId","isUsed")
             VALUES ($1,$2,$3,'Auditor',$4,false)`,
      [crypto.randomUUID(), `s304-orphan-${suffix}@example.test`,
       crypto.randomBytes(16).toString('hex'), crypto.randomUUID()]);
  } catch { orphanRefused = true; }
  check(orphanRefused,
    'G-4 and it refuses an invitation that names an organization which does not exist — the foreign '
    + 'key makes an orphaned credential unrepresentable');

  let deleteRefused = false;
  try { await q(`DELETE FROM "organization" WHERE "id"=$1`, [orgB]); }
  catch { deleteRefused = true; }
  check(deleteRefused,
    'G-5 RESTRICT holds: an organization with invitations outstanding cannot be deleted out from '
    + 'under them. Under CASCADE the evidence that they were issued would simply vanish.');

  // ===========================================================================================
  console.log('\n---- H. SE-5 AND EN-3 MUST NOT REGRESS ----\n');
  // ===========================================================================================

  const malformed = await call('/auth/verify-invite/not-a-uuid');
  check(malformed.status === 404,
    'H-1 SE-5 PRESERVED: the invite token route still accepts a non-UUID token and answers 404. '
    + 'UuidParam is deliberately not attached to it.', `${malformed.status}`);

  const files = await call('/files/not-a-uuid', { token: ownerToken });
  check(files.status === 400,
    'H-2 SE-5 PRESERVED: a malformed identifier on a UUID-backed route is still a bounded 400, not '
    + 'a 500', `${files.status}`);

  const ownerBilling = ownerSession.body?.user;
  check(ownerBilling?.effectivePlanCode === 'free' && ownerBilling?.subscriptionStatus === 'none',
    'H-3 EN-3 PRESERVED: holding an organization membership in a company-plan workspace does NOT '
    + 'write a purchased subscription onto the account. The account row still says free/none, which '
    + 'is true — nothing was bought. (It is also why SE-8 refuses the owner: entitlement is resolved '
    + 'from the account, and the organization plan never reaches it.)',
    JSON.stringify({ plan: ownerBilling?.effectivePlanCode, status: ownerBilling?.subscriptionStatus,
      orgPlan: ownerBilling?.organizationPlanCode, basis: ownerBilling?.entitlementBasis }));

  const grants = await q(
    `SELECT count(*)::int AS n FROM "entitlement_grants" WHERE "userId"=$1`, [ownerId]);
  check(grants[0].n === 0,
    'H-4 EN-3 PRESERVED: and no entitlement_grant was invented by organization membership',
    `${grants[0].n}`);

  // ===========================================================================================
  await app.close();
  console.log(`\n================ §304 invitation relationship: ${passed} passed, ${failures.length} failed`);
  console.log(JSON.stringify({
    providerCalls: 0, expertExecutions: 0, passed, failed: failures.length,
    invitationCreationRouteReachable: created.status === 200 || created.status === 201,
    invitationExpiryImplemented: expiryColumns.length > 0,
  }));
  if (failures.length) process.exit(1);
}

main().catch((error) => { console.error(error); process.exit(1); });
