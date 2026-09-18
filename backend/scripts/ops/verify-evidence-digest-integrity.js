#!/usr/bin/env node
/**
 * §314 / BR-8 — THE ACTIVE-OBJECT INVARIANT, AS AN EXECUTABLE GATE.
 *
 * =================================================================================================
 * THE INVARIANT.
 *
 *   For every ACTIVE storage_object, the authoritative metadata and the authoritative bytes agree:
 *
 *       storage_objects.sha256  ==  SHA-256(the bytes actually in the bucket)
 *
 * BR-8 was the demonstration that this could be false: a `clientRequestId` replay could write new
 * bytes to an existing key while the row went on describing the previous ones. §314 repaired the
 * write path so the product can no longer produce that state. This is the independent check that it
 * has not — and it is deliberately independent, because a repair that can only be confirmed by the
 * code that performed it is not confirmed at all.
 *
 * =================================================================================================
 * WHY THIS IS NOT verify-object-consistency.js, AND WHY BOTH EXIST.
 *
 * `verify-object-consistency.js` answers "does the bucket hold what the ledger references", and its
 * `--deep` mode re-hashes. It EXCLUDES tombstoned and erased rows from its ledger query, which is
 * right for its question and wrong for this one: a check that filters retired rows out reports the
 * same number whether erasure worked or not.
 *
 * This classifies EVERY row instead, so an erasure that did not hold is a distinct, named outcome
 * rather than an absence nobody counted:
 *
 *   MATCHED             ACTIVE, present, digest agrees. The only passing class for a live object.
 *   MISMATCHED          ACTIVE, present, digest DISAGREES. The BR-8 condition.
 *   MISSING             ACTIVE, bytes absent. A broken evidence reference.
 *   ERASURE_AUTHORIZED  retired, bytes absent. Correct, and counted so it is visible.
 *   RESURRECTED         retired, bytes PRESENT. An erasure that did not hold — a BR-7 failure.
 *   UNKNOWN             the class could not be established.
 *
 * =================================================================================================
 * TWO RULES THIS WILL NOT BEND.
 *
 * UNKNOWN IS NEVER A PASS. A row whose state could not be read is not evidence of health. Reporting
 * it as one is how a check certifies a system it never actually measured.
 *
 * LENGTH IS NEVER INTEGRITY. Every object is downloaded and re-hashed in full. BR-8's own case is
 * two payloads of EQUAL LENGTH and different content, so a size comparison reports it as healthy —
 * which is exactly why the §312 recovery reconciler, which compares listed sizes, does not see it.
 *
 * =================================================================================================
 * IT HAS NO WRITE PATH. SELECT and GetObject, and nothing else. It reports; the runbook decides.
 * Rewriting a digest to match whatever bytes are present would make the metadata agree with an
 * overwrite that should never have happened, and is the one response never available here.
 *
 * =================================================================================================
 * USAGE
 *
 *   node scripts/ops/verify-evidence-digest-integrity.js [--json <path>]
 *
 * Reads the same variables the rest of scripts/ops uses, so it checks what the application sees:
 *   EVIDENCE_DATABASE_URL | BACKUP_SOURCE_DATABASE_URL | DATABASE_URL
 *   EVIDENCE_SOURCE_S3_* , falling back to STORAGE_S3_*
 *
 * Exit codes: 0 the invariant holds, 1 it does not, 2 the scan could not complete.
 */

'use strict';

const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

/** A field separator no customer filename or digest can contain. */
const SEP = String.fromCharCode(1);

const PSQL_CANDIDATES = [
  process.env.BACKUP_PG_CLIENT_DIR ? path.join(process.env.BACKUP_PG_CLIENT_DIR, 'psql') : null,
  '/opt/homebrew/opt/libpq/bin/psql',
  '/usr/local/opt/libpq/bin/psql',
  '/usr/lib/postgresql/18/bin/psql',
  '/usr/lib/postgresql/17/bin/psql',
  'psql',
].filter(Boolean);

function resolvePsql() {
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

/** Credentials through the environment, never through argv — as in verify-backup-restore.js. */
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

/** EVERY row. The classification, not the query, decides what a retired object means. */
const ALL_ROWS_SQL = `
  select id, "objectKey", sha256, "sizeBytes"::text, status,
         ("deletedAt" is not null) as retired, category, "parentType"
  from storage_objects
  order by "objectKey"`;

function readRows(psql, databaseUrl) {
  const out = execFileSync(psql, ['-At', '-F', SEP, '-v', 'ON_ERROR_STOP=1', '-c', ALL_ROWS_SQL], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    env: { ...process.env, ...connectionEnv(databaseUrl) },
  });
  return out.split('\n').filter(Boolean).map((line) => {
    const [id, objectKey, sha256, sizeBytes, status, retired, category, parentType] = line.split(SEP);
    return { id, objectKey, sha256, sizeBytes, status, retired: retired === 't', category, parentType };
  });
}

function storageConfig() {
  const pick = (name) => process.env[`EVIDENCE_SOURCE_S3_${name}`] || process.env[`STORAGE_S3_${name}`];
  return {
    bucket: pick('BUCKET'),
    region: pick('REGION') || 'auto',
    endpoint: pick('ENDPOINT') || undefined,
    forcePathStyle: pick('FORCE_PATH_STYLE') === 'true',
    accessKeyId: pick('ACCESS_KEY_ID'),
    secretAccessKey: pick('SECRET_ACCESS_KEY'),
  };
}

/** hex digest when the bytes are there, null when provably absent, undefined when indeterminate. */
async function liveDigest(client, GetObjectCommand, bucket, key) {
  try {
    const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const hash = createHash('sha256');
    let bytes = 0;
    for await (const chunk of response.Body) { hash.update(chunk); bytes += chunk.length; }
    return { sha256: hash.digest('hex'), bytes };
  } catch (error) {
    const status = error && error.$metadata && error.$metadata.httpStatusCode;
    if (error && (error.name === 'NoSuchKey' || error.name === 'NotFound' || status === 404)) return null;
    return undefined;
  }
}

function classify(row, live) {
  const retired = row.retired || row.status === 'deleted' || row.status === 'erasure_pending';
  const active = row.status === 'ready' && !retired;
  if (live === undefined || !row.sha256) return 'UNKNOWN';
  if (retired) return live === null ? 'ERASURE_AUTHORIZED' : 'RESURRECTED';
  // 'uploading' and 'failed' are in flight rather than ACTIVE, so absent bytes are expected. Bytes
  // that DISAGREE with the digest the row already published never are.
  if (!active) return live === null ? 'ERASURE_AUTHORIZED' : (live.sha256 === row.sha256 ? 'MATCHED' : 'MISMATCHED');
  if (live === null) return 'MISSING';
  return live.sha256 === row.sha256 ? 'MATCHED' : 'MISMATCHED';
}

async function main() {
  const argv = process.argv.slice(2);
  const jsonPath = argv.includes('--json') ? argv[argv.indexOf('--json') + 1] : null;

  const databaseUrl = process.env.EVIDENCE_DATABASE_URL
    || process.env.BACKUP_SOURCE_DATABASE_URL
    || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Set EVIDENCE_DATABASE_URL (or BACKUP_SOURCE_DATABASE_URL, or DATABASE_URL).');

  const storage = storageConfig();
  if (!storage.bucket) throw new Error('Set EVIDENCE_SOURCE_S3_BUCKET (or STORAGE_S3_BUCKET) and its credentials.');

  const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
  const client = new S3Client({
    region: storage.region,
    endpoint: storage.endpoint,
    forcePathStyle: storage.forcePathStyle,
    credentials: { accessKeyId: storage.accessKeyId, secretAccessKey: storage.secretAccessKey },
  });

  const psql = resolvePsql();
  const rows = readRows(psql, databaseUrl);

  process.stdout.write(`database   ${new URL(databaseUrl).hostname}\n`);
  process.stdout.write(`bucket     ${storage.bucket}\n`);
  process.stdout.write('mode       READ-ONLY, FULL RE-HASH (length is not integrity)\n\n');

  const counts = { MATCHED: 0, MISMATCHED: 0, MISSING: 0, ERASURE_AUTHORIZED: 0, RESURRECTED: 0, UNKNOWN: 0 };
  const findings = [];

  for (const row of rows) {
    const live = await liveDigest(client, GetObjectCommand, storage.bucket, row.objectKey);
    const state = classify(row, live);
    counts[state] += 1;
    if (state !== 'MATCHED' && state !== 'ERASURE_AUTHORIZED') {
      findings.push({
        id: row.id,
        state,
        status: row.status,
        retired: row.retired,
        category: row.category,
        parentType: row.parentType,
        recordedSha256: row.sha256,
        recordedBytes: row.sizeBytes,
        liveSha256: live && live.sha256 ? live.sha256 : null,
        liveBytes: live && live.bytes !== undefined ? live.bytes : null,
      });
    }
  }

  for (const [state, count] of Object.entries(counts)) {
    process.stdout.write(`  ${state.padEnd(20)}${count}\n`);
  }
  process.stdout.write(`  ${'TOTAL ROWS'.padEnd(20)}${rows.length}\n`);
  for (const finding of findings) {
    process.stdout.write(`\n  ${finding.state}  ${finding.id}  ${finding.category}/${finding.parentType}  status=${finding.status}\n`);
  }

  // UNKNOWN is counted as a failure, deliberately. See the header.
  const failing = counts.MISMATCHED + counts.MISSING + counts.UNKNOWN + counts.RESURRECTED;
  const outcome = failing === 0 ? 'INVARIANT_HOLDS' : 'INVARIANT_VIOLATED';

  if (jsonPath) {
    fs.writeFileSync(jsonPath, `${JSON.stringify({
      schema: 'safety-insite.evidence-digest-integrity.v1',
      checkedAt: new Date().toISOString(),
      mode: 'READ_ONLY_FULL_REHASH',
      database: new URL(databaseUrl).hostname,
      bucket: storage.bucket,
      totalRows: rows.length,
      counts,
      findings,
      outcome,
    }, null, 2)}\n`);
  }

  process.stdout.write(`\n  OUTCOME  ${outcome}\n`);
  if (failing > 0) {
    process.stdout.write(
      'Do NOT rewrite a digest to match the bytes that are present. That makes the metadata agree '
      + 'with an overwrite rather than repairing one. See the evidence-integrity step of the '
      + 'disaster-recovery runbook.\n',
    );
  }
  process.exit(failing === 0 ? 0 : 1);
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`\nEVIDENCE DIGEST INTEGRITY CHECK ABORTED: ${error && error.message}\n`);
    process.stderr.write('An incomplete scan is UNKNOWN, and UNKNOWN is never a pass.\n');
    process.exit(2);
  });
}

module.exports = { ALL_ROWS_SQL, classify };
