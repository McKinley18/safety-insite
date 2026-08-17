import { randomUUID } from 'crypto';
const { Client } = require('pg') as {
  Client: new (options: { connectionString: string }) => any;
};

function requireDisposableDatabase(databaseUrl: string) {
  const parsed = new URL(databaseUrl);
  const databaseName = parsed.pathname.replace(/^\//, '');
  const localHost = ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
  if (
    process.env.NODE_ENV !== 'test' ||
    !localHost ||
    !/^(phase[0-9]+|test)[a-z0-9_-]*$/i.test(databaseName)
  ) {
    throw new Error(
      'Test grants require NODE_ENV=test and an allowlisted disposable database on localhost.',
    );
  }
  return { databaseName };
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL || '';
  const userId = process.argv[2];
  const hours = Number(process.argv[3] || 4);
  if (!databaseUrl || !userId) {
    throw new Error('Usage: grant-test-entitlement <user-uuid> [hours]');
  }
  if (!Number.isFinite(hours) || hours <= 0 || hours > 24) {
    throw new Error('Test entitlement lifetime must be between 0 and 24 hours.');
  }
  const { databaseName } = requireDisposableDatabase(databaseUrl);
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query('BEGIN');
    const user = await client.query(
      'SELECT id FROM "user" WHERE id = $1 AND "deletedAt" IS NULL',
      [userId],
    );
    if (user.rowCount !== 1) throw new Error('Test user not found.');
    const grantId = randomUUID();
    await client.query(
      `INSERT INTO entitlement_grants
       (id, "userId", source, tier, status, "startsAt", "endsAt", reason)
       VALUES ($1, $2, 'test', 'expert', 'active', now(), now() + ($3 * interval '1 hour'),
               'Disposable authenticated release test')`,
      [grantId, userId, hours],
    );
    await client.query('COMMIT');
    console.log(JSON.stringify({
      applied: true,
      grantId,
      userId,
      databaseName,
      expiresInHours: hours,
    }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
