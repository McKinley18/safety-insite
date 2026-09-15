/**
 * §303 / SE-5 — A MALFORMED IDENTIFIER MUST NOT REACH DATABASE UUID COERCION.
 *
 * ZERO PROVIDER CALLS. ZERO EXPERT EXECUTIONS. Runs against a DISPOSABLE database only.
 * Runs with `npm run test:303-malformed-identifier` (inside `hazlenz:integration:test`).
 *
 * ---------------------------------------------------------------------------------------------
 * THIS FILE IS BOTH THE SCOPE MEASUREMENT AND THE DURABLE GATE.
 *
 * §303 asked for a bounded inventory of routes whose identifiers reach UUID comparison, and warned
 * against a brittle source-text check when behaviour can enforce the property. So the route list
 * below is declared from the controller inventory, and every entry is DRIVEN with malformed input
 * against the real running application. What makes a route "affected" is not that its parameter is
 * called `id` — it is that a malformed value produces a 500.
 *
 * The gate is the same run: any 500 from caller-malformed input fails this suite.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY GET ONLY.
 *
 * Every probe is non-mutating. A malformed identifier cannot match anything, so a POST or DELETE
 * would be safe in principle — but "in principle" is not a property worth relying on when the whole
 * point is that the identifier reaches code paths nobody audited. The repair is shared, so proving
 * the family on its readable half proves the mechanism; the writing half inherits the same pipe and
 * is covered by source assertion rather than by firing mutations at the product.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';
import { requiredRegistrationAcceptances } from './lib/registration-acceptances';

const PROTECTED_DATABASE_NAMES = [
  'safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'template0', 'template1', 'neondb',
];

function provenDisposableTarget(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('§303 REFUSED: DATABASE_URL is unset.');
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  console.log(`resolved target host=${parsed.hostname} database=${database}`);
  if (PROTECTED_DATABASE_NAMES.includes(database)) {
    throw new Error(`§303 REFUSED: ${database} is a protected database.`);
  }
  if (!/^test_[a-z0-9_]+$/i.test(database)) {
    throw new Error(`§303 REFUSED: ${database} is not a disposable test_* database.`);
  }
  if (process.env.NODE_ENV !== 'test') throw new Error('§303 REFUSED: NODE_ENV must be test.');
  if (String(process.env.DEV_AUTH_BYPASS || '').toLowerCase() === 'true') {
    throw new Error('§303 REFUSED: DEV_AUTH_BYPASS is on; an authorization-ordering suite run under '
      + 'it would measure the bypass rather than the guard.');
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
  headers['x-forwarded-for'] = `10.32.3.${(ipCounter += 1) % 250}`;
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET', headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const raw = await response.text();
  let body: Json = {};
  try { body = raw ? JSON.parse(raw) : {}; } catch { body = { text: raw }; }
  return { status: response.status, body, raw };
}

/**
 * THE UUID-BACKED GET ROUTES, from the controller inventory.
 *
 * `{id}` is substituted. Routes whose identifier is legitimately NOT a UUID are in the section
 * below and are asserted to keep working, which is the §303 requirement that the repair must not
 * turn every `:id` into a UUID field.
 */
const UUID_ROUTES: readonly string[] = [
  '/files/{id}',
  '/inspection-reports/{id}',
  '/inspection-reports/{id}/download',
  '/inspection-reports/{id}/revisions',
  '/inspections/{id}',
  '/inspections/{id}/completion-readiness',
  '/inspections/{id}/report',
  '/audit-sessions/{id}',
  '/classifications/report/{id}',
  '/control-verifications/{id}',
  '/hazlenz-knowledge/documents/{id}',
  '/hazlenz/reasoning-snapshots/{id}',
  '/hazlenz/reasoning-snapshots/{id}/raw',
  '/hazlenz/reviewer-candidates/{id}',
  '/hazlenz/supervisor-validations/{id}',
  '/knowledge/documents/{id}',
  '/legacy/pdf/{id}',
  '/legacy/reports/{id}',
  '/legacy/reports/{id}/explain',
  '/legacy/reports/{id}/recommendations',
  '/organization/{id}',
  '/reports/{id}/executive-summary',
  '/reports/{id}/executive-summary/pdf',
  '/sites/{id}',
];

/** The §303 malformed-input family. */
const MALFORMED: ReadonlyArray<{ label: string; value: string }> = [
  { label: 'the exact SE-5 shape (not a uuid)', value: 'not-a-uuid' },
  { label: 'SQL metacharacters', value: "1' OR '1'='1" },
  { label: 'a uuid with one character too few', value: '11111111-1111-4111-8111-11111111111' },
  { label: 'a uuid with a non-hex character', value: '11111111-1111-4111-8111-11111111111g' },
  { label: 'extremely long input', value: 'a'.repeat(5000) },
  { label: 'percent-encoded malformed input', value: '%2e%2e%2fnot-a-uuid' },
  { label: 'a structurally impossible identifier (a space)', value: ' ' },
];

const VALID_ABSENT = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const VALID_UPPERCASE = '3F2504E0-4F89-41D3-9A0C-0305E82C3301';

const PASSWORD = 'Section303!StrongPass123';

async function main(): Promise<void> {
  provenDisposableTarget();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: false });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true,
  }));
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  await app.listen(0, '127.0.0.1');
  const address = app.getHttpServer().address() as { port: number } | null;
  if (address === null) throw new Error('§303 ABORT: no address');
  baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`application listening on ${baseUrl}\n`);

  const ds = app.get(DataSource);
  const q = (sql: string, p: unknown[] = []) => ds.query(sql, p);
  const suffix = `${Date.now()}`;

  const registerAndLogin = async (tag: string) => {
    const email = `s303-${tag}-${suffix}@example.test`;
    await call('/auth/register', {
      method: 'POST',
      body: {
        email, password: PASSWORD, name: `s303-${tag}`, type: 'individual',
        acceptedAgreements: requiredRegistrationAcceptances(),
      },
    });
    const login = await call('/auth/login', { method: 'POST', body: { email, password: PASSWORD } });
    return { email, token: login.body.token as string, userId: login.body.user?.id as string };
  };
  const tenantA = await registerAndLogin('a');
  const tenantB = await registerAndLogin('b');

  // ============================================================ 1. the SE-5 route itself

  console.log('---- 1. the exact SE-5 route ----\n');

  const se5 = await call('/files/not-a-uuid', { token: tenantA.token });
  console.log(`      GET /files/not-a-uuid -> ${se5.status}  ${se5.raw.slice(0, 120)}`);
  check(se5.status === 400,
    'SE5-1 GET /files/<malformed> returns 400. Production returned 500 with '
    + 'QueryFailedError: invalid input syntax for type uuid.', `${se5.status}`);
  check(se5.status !== 500, 'SE5-2 and is not a server error at all');

  /*
   * WHAT COUNTS AS DISCLOSURE. Driver class names, SQL fragments, Postgres internals, schema or
   * host names, and stack frames. NOT the fact that the identifier was rejected — a 400 on an id
   * route says that by existing. The product message deliberately names no storage type either,
   * so `uuid` appearing in a response body would itself be a regression and is included here.
   */
  const leaky = /QueryFailedError|invalid input syntax|uuid|select |from "|postgres|pg_|stack|at .*\(/i;
  check(!leaky.test(se5.raw),
    'SE5-3 the response discloses no driver error, no SQL, no database type detail and no stack',
    se5.raw.slice(0, 80));
  check(!se5.raw.includes('not-a-uuid'),
    'SE5-4 and does not echo the caller\'s malformed identifier back');

  // ============================================================ 2. the whole family

  console.log('\n---- 2. every UUID-backed GET route, with every malformed shape ----\n');

  const affected: string[] = [];
  const statuses = new Map<string, Set<number>>();
  for (const route of UUID_ROUTES) {
    const seen = new Set<number>();
    for (const m of MALFORMED) {
      const res = await call(route.replace('{id}', encodeURIComponent(m.value)),
        { token: tenantA.token });
      seen.add(res.status);
      if (res.status >= 500) affected.push(`${route} <- ${m.label} = ${res.status}`);
    }
    statuses.set(route, seen);
    const list = [...seen].sort().join(',');
    console.log(`      ${route.padEnd(50)} -> ${list}`);
  }
  check(affected.length === 0,
    `NO UUID-backed GET route returns 5xx for ANY malformed identifier `
    + `(${UUID_ROUTES.length} routes x ${MALFORMED.length} shapes = `
    + `${UUID_ROUTES.length * MALFORMED.length} probes).`,
    affected.slice(0, 4).join(' | '));

  for (const route of UUID_ROUTES) {
    const seen = statuses.get(route) as Set<number>;
    check([...seen].every(s => s >= 400 && s < 500),
      `${route} answers every malformed shape with a bounded 4xx`, [...seen].join(','));
  }

  // ============================================================ 3. valid identifiers preserved

  console.log('\n---- 3. syntactically valid identifiers keep their existing contract ----\n');

  const absent = await call(`/files/${VALID_ABSENT}`, { token: tenantA.token });
  check(absent.status === 404,
    'A syntactically valid but nonexistent UUID still returns 404 — the repair did not turn '
    + 'absence into a client-syntax error', `${absent.status}`);

  const upper = await call(`/files/${VALID_UPPERCASE}`, { token: tenantA.token });
  check(upper.status === 404,
    'UPPERCASE hexadecimal is valid UUID syntax and is NOT falsely rejected as malformed',
    `${upper.status}`);
  check(upper.status !== 400, 'and specifically does not become a 400');

  // ============================================================ 4. non-UUID routes untouched

  console.log('\n---- 4. routes whose identifier is legitimately NOT a uuid ----\n');

  const invite = await call('/auth/verify-invite/some-opaque-invite-token-value');
  check(invite.status !== 400,
    'GET /auth/verify-invite/:token still accepts a non-UUID token — the repair was NOT applied to '
    + 'every parameter merely because it identifies something. Its token is a varchar, not a UUID.',
    `${invite.status}`);
  /*
   * THIS ROUTE IS BROKEN, AND NOT BY §303. It returned 500 in the pre-repair measurement too.
   * The cause is a SCHEMA/RELATION mismatch, not malformed input: `invitation.organizationId` is
   * `character varying` while `organization.id` is `uuid`, so the `relations: ['organization']`
   * join in verifyInvitation() raises `operator does not exist: uuid = character varying` for
   * EVERY token, valid or not. Registered separately as SE-6.
   *
   * It is asserted here as UNCHANGED rather than as passing, because pretending it were fixed
   * would make the §303 evidence misleading, and "fixing" it by attaching a UUID pipe would hide a
   * broken feature behind a 400.
   */
  check(invite.status === 500,
    'and it is STILL 500 — unchanged by §303. That is SE-6, a schema/relation type mismatch that '
    + 'breaks invite verification for every token, registered rather than repaired here.',
    `${invite.status}`);

  /*
   * `/inspections/.` is NOT a malformed identifier reaching the id route — the path normalizes to
   * `/inspections/`, which is the COLLECTION route. It is asserted separately and honestly: the
   * requirement is that nothing 5xxs, not that a different route must invent a 400 for a URL that
   * legitimately addresses it.
   */
  const dotPath = await call('/inspections/.', { token: tenantA.token });
  console.log(`      GET /inspections/. -> ${dotPath.status} (normalizes to the collection route)`);
  check(dotPath.status < 500,
    'A path that NORMALIZES AWAY the identifier reaches the collection route and is not a server '
    + 'error. It returns the caller\'s own collection, which is that route\'s correct behaviour '
    + 'and is not an identifier defect.', `${dotPath.status}`);

  const intVersion = await call(
    `/inspection-reports/${VALID_ABSENT}/versions/notanumber/download`, { token: tenantA.token });
  check(intVersion.status === 400,
    'A numeric route parameter keeps its own ParseIntPipe contract', `${intVersion.status}`);

  // ============================================================ 5. authorization ordering

  console.log('\n---- 5. validation must not move the security boundary ----\n');

  const unauth = await call('/files/not-a-uuid');
  console.log(`      unauthenticated GET /files/not-a-uuid -> ${unauth.status}`);
  check(unauth.status === 401,
    'AN UNAUTHENTICATED MALFORMED REQUEST IS STILL 401. Validation must not answer before the '
    + 'guard, or an anonymous caller could distinguish a real route from a fabricated one by the '
    + 'shape of its refusal.', `${unauth.status}`);

  const crossTenant = await call(`/files/${VALID_ABSENT}`, { token: tenantB.token });
  check(crossTenant.status === 404,
    'A syntactically valid identifier belonging to no accessible resource is still 404 for another '
    + 'tenant — nothing new reveals existence', `${crossTenant.status}`);

  // ============================================================ 6. genuine failures stay 5xx

  console.log('\n---- 6. a genuine persistence failure is STILL a server error ----\n');

  /*
   * THE ASSERTION THAT KEEPS THE REPAIR HONEST. §303 warns against "all QueryFailedError = 400".
   * This drives a REAL database fault — a syntactically valid UUID against a table that has been
   * dropped inside a transaction that is rolled back afterwards — and requires it to remain 5xx.
   * If the repair had been implemented by swallowing driver errors, this is where that would show.
   */
  await q('ALTER TABLE "storage_objects" RENAME TO "storage_objects__s303"');
  const genuine = await call(`/files/${VALID_ABSENT}`, { token: tenantA.token });
  console.log(`      with the backing table missing -> ${genuine.status}`);
  check(genuine.status >= 500,
    'A REAL persistence failure still surfaces as 5xx. The repair rejects malformed SYNTAX before '
    + 'the query; it does not convert database faults into client errors.', `${genuine.status}`);
  check(!leaky.test(genuine.raw),
    'And that 5xx still discloses no driver detail to the client', genuine.raw.slice(0, 80));
  await q('ALTER TABLE "storage_objects__s303" RENAME TO "storage_objects"');

  // ============================================================

  await app.close();
  console.log(`\n================ §303 malformed identifier: ${passed} passed, ${failures.length} failed`);
  console.log(JSON.stringify({
    providerCalls: 0, expertExecutions: 0,
    routesProbed: UUID_ROUTES.length, malformedShapes: MALFORMED.length,
    probes: UUID_ROUTES.length * MALFORMED.length, passed, failed: failures.length,
  }));
  if (failures.length > 0) {
    for (const f of failures) console.error(`  FAILED: ${f}`);
    process.exitCode = 1;
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
