/**
 * Focused verification for the repaired disposable-entitlement helper.
 *
 * scripts/grant-test-entitlement.ts inserted the retired tier 'expert', which migration
 * 1800000005900-RetireExpertTier rejects via CHECK ("tier" IN ('pro')). Every invocation
 * therefore failed, leaving entitlement-dependent verification suites unable to run.
 *
 * This proves the helper now works AND that its safety guards are intact: it must still
 * refuse to run without NODE_ENV=test and must still refuse a non-allowlisted database.
 * It asserts nothing about production entitlement behaviour, which is unchanged.
 */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { dataSource } from '../src/database/data-source';

const checks: string[] = [];
function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(`FAILED: ${message}`);
  checks.push(message);
}

function runHelper(userId: string, env: NodeJS.ProcessEnv) {
  return execFileSync('npx', ['ts-node', 'scripts/grant-test-entitlement.ts', userId, '1'],
    { env, stdio: 'pipe' }).toString();
}

async function main() {
  const target = new URL(process.env.DATABASE_URL || 'postgresql://localhost/UNSET');
  const dbName = target.pathname.replace('/', '');
  console.log(`Resolved database target: host=${target.hostname} database=${dbName}`);
  if (dbName === 'safescope' || !/^test_/.test(dbName)) {
    throw new Error(`Refusing to run against a non-disposable database: ${dbName}`);
  }

  await dataSource.initialize();
  const userId = randomUUID();
  await dataSource.query(
    `INSERT INTO "user" (id, email, "passwordHash", name, type)
     VALUES ($1, $2, 'x', 'Entitlement Helper Check', 'individual')`,
    [userId, `entitlement-helper-${Date.now()}@example.test`],
  );

  // --- the repair itself ---------------------------------------------------------------
  const output = runHelper(userId, { ...process.env, NODE_ENV: 'test' });
  assert(JSON.parse(output).applied === true, 'Grant helper succeeds against a disposable database.');
  const [grant] = await dataSource.query(
    `SELECT tier, status, source FROM entitlement_grants WHERE "userId" = $1`, [userId],
  );
  assert(grant?.tier === 'pro', `Grant is written with the current supported paid tier (got '${grant?.tier}').`);
  assert(grant.status === 'active' && grant.source === 'test',
    'Grant is an active test-sourced grant, exactly as before the repair.');

  // --- guards must remain intact ---------------------------------------------------------
  let withoutTestEnv: unknown = null;
  try {
    runHelper(userId, { ...process.env, NODE_ENV: 'development' });
  } catch (error) { withoutTestEnv = error; }
  assert(withoutTestEnv, 'Helper still refuses to run without NODE_ENV=test.');

  let wrongDatabase: unknown = null;
  try {
    runHelper(userId, {
      ...process.env, NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://mckinley@127.0.0.1:5432/safescope',
    });
  } catch (error) { wrongDatabase = error; }
  assert(wrongDatabase, 'Helper still refuses a database outside its disposable allowlist.');

  await dataSource.destroy();
  console.log(`\nentitlement-grant-helper: ${checks.length}/${checks.length} checks passed`);
  for (const check of checks) console.log(`  ok  ${check}`);
}

main().catch(async error => {
  if (dataSource.isInitialized) await dataSource.destroy();
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
