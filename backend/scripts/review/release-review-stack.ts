/**
 * §279 — RELEASE A REVIEW STACK DATABASE LEFT BEHIND BY `REVIEW_DB_ONLY=1`.
 *
 * Ownership is proven from the §277 ledger before anything is dropped: a name alone is never
 * enough, which is the whole point of the registry. Refuses a name it cannot attribute.
 *
 * Usage: ts-node scripts/review/release-review-stack.ts <runId> <databaseName>
 */
import 'dotenv/config';
import { execFileSync } from 'child_process';
import { ownershipOf, release } from '../disposable/registry';

const [runId, name] = process.argv.slice(2);
if (!runId || !name) {
  throw new Error('usage: release-review-stack <runId> <databaseName>');
}

const inherited = process.env.DATABASE_URL;
if (!inherited) throw new Error('REFUSED: DATABASE_URL is unset.');
const base = new URL(inherited);
const host = base.hostname;
const port = base.port || '5432';

const owned = ownershipOf(name, host, port);
if (!owned) {
  throw new Error(`REFUSED: ${name} on ${host}:${port} is not attributable to any recorded run. `
    + 'Being unable to prove ownership is a reason to stop, never a reason to guess.');
}
if (owned.runId !== runId) {
  throw new Error(`REFUSED: ${name} is owned by run ${owned.runId}, not ${runId}.`);
}

const admin = new URL(base.toString());
admin.pathname = '/postgres';
execFileSync('psql', [admin.toString(), '-v', 'ON_ERROR_STOP=1', '-q', '-c',
  `DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`], { stdio: 'pipe' });
release(runId, name);
console.log(`dropped ${name} (run ${runId})`);
