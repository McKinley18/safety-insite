#!/usr/bin/env node
/**
 * §311 / BR-5 — RECONCILE THE DATABASE AGAINST THE OBJECT STORE.
 *
 * ===============================================================================================
 * WHY A DATABASE BACKUP IS NOT A BACKUP OF THE PRODUCT.
 *
 * An inspection report is a row in PostgreSQL *and* a PDF in R2. An evidence photo is a row and a
 * JPEG. Restore one without the other and the product does not fail loudly — it serves a report
 * list whose rows are all there and whose downloads 404, which is worse, because it looks fine.
 *
 * §311 measured the shape of that coupling and it is unusually clean, which is why this check is
 * short: `storage_objects` is the SINGLE ledger of every object the product has ever stored. It
 * carries the key, the byte length and the sha256 of each one, and `inspection_report_versions`
 * references it by foreign key with `ON DELETE RESTRICT`. So the correspondence that a recovery has
 * to preserve is exactly one-to-one and it is mechanically checkable, which is what this does.
 *
 * ===============================================================================================
 * THE TWO FAILURE DIRECTIONS, which need different responses and so are never merged here.
 *
 *   MISSING OBJECT — a live `storage_objects` row whose object is not in the bucket. This is a
 *   BROKEN EVIDENCE REFERENCE. The product will offer a customer a download that cannot be served.
 *   It is the serious direction, and after a restore it is the expected one: restoring the database
 *   to an earlier point does not un-delete an object that was removed after that point.
 *
 *   ORPHAN OBJECT — an object in the bucket with no live row. This is INERT, and §311 established
 *   why rather than assuming it: the product's only download route resolves an object through a
 *   `storage_objects` row by UUID primary key, and `objectKey` is `select: false` on the entity.
 *   No route accepts a caller-supplied key, so an unreferenced object is unreachable by every
 *   product path. It costs storage and it is a privacy consideration; it is not a correctness one.
 *   After a restore to an earlier point, every object uploaded since is an orphan, and that is the
 *   correct and expected outcome — it is not damage.
 *
 * NEITHER IS REPAIRED HERE. This reports; the runbook decides. Fabricating a missing evidence
 * object is the one response that is never available.
 *
 * ===============================================================================================
 * USAGE
 *
 *   node scripts/ops/verify-object-consistency.js [--deep] [--json <path>]
 *
 * Reads DATABASE_URL (or BACKUP_SOURCE_DATABASE_URL) and the STORAGE_S3_* configuration — the same
 * variables the application uses, so this checks what the application would actually see.
 *
 * `--deep` downloads every live object and re-hashes it against the sha256 the database recorded at
 * upload. That is the strongest statement available (it detects silent corruption, not merely
 * absence) and at Beta volume it costs seconds. Without it the check is presence and byte length.
 *
 * Exit codes: 0 consistent, 1 any missing object, 0 with a warning for orphans alone.
 */

'use strict';

const { execFile } = require('node:child_process');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

const PSQL_CANDIDATES = [
  process.env.BACKUP_PG_CLIENT_DIR ? path.join(process.env.BACKUP_PG_CLIENT_DIR, 'psql') : null,
  '/opt/homebrew/opt/libpq/bin/psql',
  '/usr/local/opt/libpq/bin/psql',
  '/usr/lib/postgresql/18/bin/psql',
  '/usr/lib/postgresql/17/bin/psql',
  'psql',
].filter(Boolean);

function resolvePsql() {
  const { execFileSync } = require('node:child_process');
  for (const candidate of PSQL_CANDIDATES) {
    try {
      execFileSync(candidate, ['--version'], { stdio: 'ignore' });
      return candidate;
    } catch {
      /* next */
    }
  }
  throw new Error('No psql client was found.');
}

/** Credentials through the environment, never through argv — see the note in verify-backup-restore.js. */
function connectionEnv(urlText) {
  const url = new URL(urlText);
  const params = new URLSearchParams(url.search);
  return {
    PGHOST: url.hostname,
    PGPORT: url.port || '5432',
    PGDATABASE: url.pathname.replace(/^\//, '').split('?')[0],
    PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password),
    PGSSLMODE: params.get('sslmode') || 'prefer',
    ...(params.get('channel_binding') ? { PGCHANNELBINDING: params.get('channel_binding') } : {}),
  };
}

/**
 * The live ledger: objects the product currently believes it can serve. `status = 'ready'` excludes
 * uploads that never completed, `deletedAt is null` excludes customer-deleted files, and the expiry
 * check excludes objects the product itself treats as gone. Those exclusions matter: counting a
 * tombstoned file as a missing object would report a healthy system as broken.
 */
const LIVE_OBJECTS_SQL = `
  select "objectKey", "sizeBytes"::text, sha256, category, "parentType"
  from storage_objects
  where status = 'ready' and "deletedAt" is null and ("expiresAt" is null or "expiresAt" > now())
  order by "objectKey"
`;

async function readLedger(psql, databaseUrl) {
  const { stdout } = await execFileAsync(psql, ['-At', '-F', '', '-v', 'ON_ERROR_STOP=1', '-c', LIVE_OBJECTS_SQL], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    env: { ...process.env, ...connectionEnv(databaseUrl) },
  });
  const rows = new Map();
  for (const line of stdout.split('\n').filter((l) => l.length)) {
    const [objectKey, sizeBytes, sha256, category, parentType] = line.split('');
    rows.set(objectKey, { objectKey, sizeBytes: Number(sizeBytes), sha256, category, parentType });
  }
  return rows;
}

function storageClient() {
  const { S3Client } = require('@aws-sdk/client-s3');
  return new S3Client({
    region: process.env.STORAGE_S3_REGION || 'auto',
    endpoint: process.env.STORAGE_S3_ENDPOINT,
    forcePathStyle: process.env.STORAGE_S3_FORCE_PATH_STYLE === 'true',
    credentials: {
      accessKeyId: process.env.STORAGE_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.STORAGE_S3_SECRET_ACCESS_KEY,
    },
  });
}

async function listBucket(client, bucket) {
  const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
  const objects = new Map();
  let token;
  do {
    const page = await client.send(new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: token, MaxKeys: 1000 }));
    for (const object of page.Contents || []) objects.set(object.Key, { key: object.Key, size: object.Size, lastModified: object.LastModified });
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return objects;
}

async function hashObject(client, bucket, key) {
  const { GetObjectCommand } = require('@aws-sdk/client-s3');
  const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const hash = createHash('sha256');
  for await (const chunk of response.Body) hash.update(chunk);
  return hash.digest('hex');
}

async function main() {
  const argv = process.argv.slice(2);
  const deep = argv.includes('--deep');
  const jsonPath = argv.includes('--json') ? argv[argv.indexOf('--json') + 1] : null;

  const databaseUrl = process.env.DATABASE_URL || process.env.BACKUP_SOURCE_DATABASE_URL;
  if (!databaseUrl) throw new Error('Set DATABASE_URL (or BACKUP_SOURCE_DATABASE_URL) to the database to reconcile.');
  const bucket = process.env.STORAGE_S3_BUCKET;
  if (!bucket) throw new Error('Set STORAGE_S3_BUCKET and the rest of the STORAGE_S3_* configuration.');

  const psql = resolvePsql();
  const ledger = await readLedger(psql, databaseUrl);
  const client = storageClient();
  const stored = await listBucket(client, bucket);

  process.stdout.write(`database         ${new URL(databaseUrl).hostname}\n`);
  process.stdout.write(`bucket           ${bucket}\n`);
  process.stdout.write(`ledger           ${ledger.size} live objects\n`);
  process.stdout.write(`bucket contents  ${stored.size} objects\n\n`);

  const missing = [];
  const sizeMismatch = [];
  const corrupt = [];
  const verified = [];

  for (const [key, row] of ledger) {
    const object = stored.get(key);
    if (!object) {
      missing.push({ key, category: row.category, parentType: row.parentType, expectedBytes: row.sizeBytes });
      continue;
    }
    if (object.size !== row.sizeBytes) {
      sizeMismatch.push({ key, expectedBytes: row.sizeBytes, actualBytes: object.size });
      continue;
    }
    if (deep) {
      const actual = await hashObject(client, bucket, key);
      if (actual !== row.sha256) corrupt.push({ key, expectedSha256: row.sha256, actualSha256: actual });
      else verified.push(key);
    } else {
      verified.push(key);
    }
  }

  const orphans = [...stored.keys()].filter((key) => !ledger.has(key)).map((key) => ({ key, bytes: stored.get(key).size, lastModified: stored.get(key).lastModified }));

  const line = (label, value) => process.stdout.write(`${label.padEnd(26)}${value}\n`);
  line(deep ? 'verified (deep, sha256)' : 'verified (presence+size)', String(verified.length));
  line('MISSING objects', String(missing.length));
  line('size mismatches', String(sizeMismatch.length));
  if (deep) line('checksum mismatches', String(corrupt.length));
  line('orphan objects', String(orphans.length));

  for (const entry of missing) process.stdout.write(`\n  MISSING   ${entry.key}  (${entry.category}/${entry.parentType}, ${entry.expectedBytes} bytes expected)\n`);
  for (const entry of sizeMismatch) process.stdout.write(`\n  SIZE      ${entry.key}  expected ${entry.expectedBytes}, found ${entry.actualBytes}\n`);
  for (const entry of corrupt) process.stdout.write(`\n  CHECKSUM  ${entry.key}  expected ${entry.expectedSha256}\n`);
  for (const entry of orphans) process.stdout.write(`\n  orphan    ${entry.key}  (${entry.bytes} bytes, ${entry.lastModified && entry.lastModified.toISOString()})\n`);

  const broken = missing.length + sizeMismatch.length + corrupt.length;
  const summary = {
    schema: 'safety-insite.object-consistency.v1',
    checkedAt: new Date().toISOString(),
    mode: deep ? 'DEEP_SHA256' : 'PRESENCE_AND_SIZE',
    database: new URL(databaseUrl).hostname,
    bucket,
    ledgerLiveObjects: ledger.size,
    bucketObjects: stored.size,
    verified: verified.length,
    missing,
    sizeMismatch,
    checksumMismatch: corrupt,
    orphans,
    outcome: broken === 0 ? (orphans.length === 0 ? 'CONSISTENT' : 'CONSISTENT_WITH_ORPHANS') : 'BROKEN_EVIDENCE_REFERENCES',
  };
  if (jsonPath) fs.writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`);

  process.stdout.write(`\n${summary.outcome}\n`);
  if (broken > 0) {
    process.stdout.write(
      'A missing or altered object is a BROKEN EVIDENCE REFERENCE. Do not fabricate a replacement. ' +
        'See the object-consistency step of the disaster-recovery runbook.\n',
    );
  }
  process.exit(broken === 0 ? 0 : 1);
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`\nCONSISTENCY CHECK ABORTED: ${error && error.message}\n`);
    process.exit(2);
  });
}

module.exports = { LIVE_OBJECTS_SQL };
