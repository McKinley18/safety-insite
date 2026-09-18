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

/**
 * §315 / BR-9. THE GOVERNED INTEGRITY STATES. Deliberately small, and every one of them except the
 * first is a FAILURE — there is no state that means "mostly fine".
 *
 * INTEGRITY_HOLDS       every active object's bytes hash to the digest the database recorded.
 * DIGEST_MISMATCH       an object's live bytes disagree with its recorded digest.
 * ACTIVE_OBJECT_MISSING an active object's bytes are absent without an authorized erasure.
 * RESURRECTED           a retired object's bytes are present again.
 * HASH_FAILURE          an object could not be read or hashed. Never skipped.
 * INCOMPLETE_SCAN       enumeration did not return the whole population.
 * SOURCE_UNAVAILABLE    the bucket could not be reached at all.
 * INTEGRITY_UNKNOWN     the scan could not establish a state. Never a pass.
 */
const INTEGRITY_STATES = [
  'INTEGRITY_HOLDS', 'DIGEST_MISMATCH', 'ACTIVE_OBJECT_MISSING', 'RESURRECTED',
  'HASH_FAILURE', 'INCOMPLETE_SCAN', 'SOURCE_UNAVAILABLE', 'INTEGRITY_UNKNOWN',
];

/**
 * §315. The population is counted SEPARATELY from the rows that are listed, and the two must agree.
 * A truncated, partial or malformed enumeration is otherwise indistinguishable from a small healthy
 * population — "every object I managed to list matched" is exactly the sentence this prevents.
 */
const ROW_COUNT_SQL = 'select count(*)::text from storage_objects';

/** At most this many findings are printed and carried in the report, so a mass failure cannot
 *  produce an unbounded log line or an unbounded JSON document. The COUNTS remain exact. */
const MAX_REPORTED_FINDINGS = 50;

/** EVERY row. The classification, not the query, decides what a retired object means. */
const ALL_ROWS_SQL = `
  select id, "objectKey", sha256, "sizeBytes"::text, status,
         ("deletedAt" is not null) as retired, category, "parentType"
  from storage_objects
  order by "objectKey"`;

/** The population, counted independently of the listing it is used to check. */
function readRowCount(psql, databaseUrl) {
  const out = execFileSync(psql, ['-At', '-v', 'ON_ERROR_STOP=1', '-c', ROW_COUNT_SQL], {
    encoding: 'utf8',
    env: { ...process.env, ...connectionEnv(databaseUrl) },
  });
  const n = Number(String(out).trim());
  if (!Number.isInteger(n) || n < 0) throw new Error('The population count query did not return an integer.');
  return n;
}

/**
 * Every row, parsed strictly. A line that does not carry the expected field count, or whose id or
 * objectKey is empty, is a MALFORMED line rather than a row to guess at — it is surfaced so the
 * caller can fail the scan closed instead of quietly scanning fewer objects than exist.
 */
function readRows(psql, databaseUrl) {
  const out = execFileSync(psql, ['-At', '-F', SEP, '-v', 'ON_ERROR_STOP=1', '-c', ALL_ROWS_SQL], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    env: { ...process.env, ...connectionEnv(databaseUrl) },
  });
  const lines = out.split('\n').filter((l) => l.length > 0);
  const rows = [];
  let malformed = 0;
  for (const line of lines) {
    const parts = line.split(SEP);
    if (parts.length !== 8 || !parts[0] || !parts[1]) { malformed += 1; continue; }
    const [id, objectKey, sha256, sizeBytes, status, retired, category, parentType] = parts;
    rows.push({ id, objectKey, sha256, sizeBytes, status, retired: retired === 't', category, parentType });
  }
  return { rows, malformed, linesSeen: lines.length };
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

  const startedAt = Date.now();
  const psql = resolvePsql();

  /**
   * §315. SOURCE VISIBILITY IS ESTABLISHED FIRST, and separately.
   *
   * If the bucket cannot be reached at all, every object read would fail and the scan would report a
   * pile of per-object failures — technically correct and operationally useless. Probing once, up
   * front, turns "I cannot see anything" into its own named state, which is the difference between
   * "your evidence is broken" and "I could not look".
   *
   * A 404 on a key that does not exist is a SUCCESSFUL probe: it proves the credential reached the
   * bucket and was answered. Only an auth/network/bucket error means the source is unavailable.
   */
  const { HeadObjectCommand } = require('@aws-sdk/client-s3');
  let sourceProbe = 'OK';
  try {
    await client.send(new HeadObjectCommand({ Bucket: storage.bucket, Key: `__integrity_probe__/${process.pid}` }));
  } catch (error) {
    const status = error && error.$metadata && error.$metadata.httpStatusCode;
    const notFound = error && (error.name === 'NotFound' || error.name === 'NoSuchKey' || status === 404);
    if (!notFound) sourceProbe = `${error && error.name ? error.name : 'UnknownError'}`;
  }

  process.stdout.write(`database   ${new URL(databaseUrl).hostname}\n`);
  process.stdout.write(`bucket     ${storage.bucket}\n`);
  process.stdout.write('mode       READ-ONLY, FULL RE-HASH (length is not integrity)\n\n');

  const counts = { MATCHED: 0, MISMATCHED: 0, MISSING: 0, ERASURE_AUTHORIZED: 0, RESURRECTED: 0, UNKNOWN: 0 };
  const findings = [];
  const metrics = { objectsHashed: 0, bytesRead: 0, runtimeMs: 0, populationExpected: null, rowsListed: null, malformedRows: 0 };

  const emit = (report, integrityState, exitCode) => {
    metrics.runtimeMs = Date.now() - startedAt;
    const full = {
      schema: 'safety-insite.evidence-digest-integrity.v1',
      checkedAt: new Date().toISOString(),
      mode: 'READ_ONLY_FULL_REHASH',
      database: new URL(databaseUrl).hostname,
      bucket: storage.bucket,
      integrityState,
      scanComplete: integrityState !== 'INCOMPLETE_SCAN' && integrityState !== 'SOURCE_UNAVAILABLE',
      metrics,
      ...report,
    };
    if (jsonPath) fs.writeFileSync(jsonPath, `${JSON.stringify(full, null, 2)}\n`);
    process.stdout.write(`\n  INTEGRITY STATE  ${integrityState}\n`);
    if (integrityState !== 'INTEGRITY_HOLDS') {
      process.stdout.write(
        'Do NOT rewrite a digest to match the bytes that are present. That makes the metadata agree '
        + 'with an overwrite rather than repairing one. See the evidence-integrity step of the '
        + 'disaster-recovery runbook.\n',
      );
    }
    process.exit(exitCode);
  };

  if (sourceProbe !== 'OK') {
    process.stdout.write(`  SOURCE PROBE FAILED: ${sourceProbe}\n`);
    process.stdout.write('  An inability to READ is never a report of zero mismatches.\n');
    return emit({ counts, findings: [], totalRows: null, outcome: 'INVARIANT_NOT_ESTABLISHED', failureDetail: sourceProbe }, 'SOURCE_UNAVAILABLE', 2);
  }

  // §315. The population is counted before it is listed, so a short listing is detectable.
  const populationExpected = readRowCount(psql, databaseUrl);
  const { rows, malformed, linesSeen } = readRows(psql, databaseUrl);
  metrics.populationExpected = populationExpected;
  metrics.rowsListed = rows.length;
  metrics.malformedRows = malformed;

  if (malformed > 0 || rows.length !== populationExpected) {
    process.stdout.write(`  INCOMPLETE ENUMERATION: expected ${populationExpected} rows, parsed ${rows.length}`
      + ` (${linesSeen} lines seen, ${malformed} malformed)\n`);
    process.stdout.write('  "every object I managed to list matched" is not a pass.\n');
    return emit({ counts, findings: [], totalRows: rows.length, outcome: 'INVARIANT_NOT_ESTABLISHED' }, 'INCOMPLETE_SCAN', 2);
  }

  /**
   * §315. SEQUENTIAL AND STREAMING, deliberately.
   *
   * One object at a time, and each one hashed as it arrives rather than buffered — so memory is
   * bounded by the chunk size, not by the object size or the population size, and the number of
   * concurrent reads against the bucket is exactly one however large the evidence population grows.
   * This is the governed-concurrency requirement met by not introducing concurrency at all; a beta
   * population does not need a scheduler, and building one now would be infrastructure nobody asked
   * for.
   */
  let hashFailures = 0;
  for (const row of rows) {
    const live = await liveDigest(client, GetObjectCommand, storage.bucket, row.objectKey);
    if (live === undefined) hashFailures += 1;
    if (live && typeof live.bytes === 'number') { metrics.objectsHashed += 1; metrics.bytesRead += live.bytes; }
    const state = classify(row, live);
    counts[state] += 1;
    if (state !== 'MATCHED' && state !== 'ERASURE_AUTHORIZED' && findings.length < MAX_REPORTED_FINDINGS) {
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
  if (counts.MISMATCHED + counts.MISSING + counts.UNKNOWN + counts.RESURRECTED > findings.length) {
    process.stdout.write(`\n  (findings list truncated at ${MAX_REPORTED_FINDINGS}; the counts above are exact)\n`);
  }

  /**
   * §315. ONE STATE, CHOSEN BY SEVERITY, and every non-holding state exits non-zero. The order
   * matters: a scan that could not read an object must not be reported as a clean scan that happened
   * to find a mismatch, so HASH_FAILURE outranks the classified failures.
   */
  const integrityState =
    hashFailures > 0 ? 'HASH_FAILURE'
      : counts.UNKNOWN > 0 ? 'INTEGRITY_UNKNOWN'
        : counts.MISMATCHED > 0 ? 'DIGEST_MISMATCH'
          : counts.RESURRECTED > 0 ? 'RESURRECTED'
            : counts.MISSING > 0 ? 'ACTIVE_OBJECT_MISSING'
              : 'INTEGRITY_HOLDS';

  const failing = counts.MISMATCHED + counts.MISSING + counts.UNKNOWN + counts.RESURRECTED + hashFailures;
  return emit(
    { counts, findings, totalRows: rows.length, hashFailures, outcome: failing === 0 ? 'INVARIANT_HOLDS' : 'INVARIANT_VIOLATED' },
    integrityState,
    failing === 0 ? 0 : 1,
  );
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`\nEVIDENCE DIGEST INTEGRITY CHECK ABORTED: ${error && error.message}\n`);
    process.stderr.write('An inability to complete the scan is never a pass.\n');
    /**
     * §315. AN ABORT STILL WRITES A REPORT when one was asked for. A composed caller that finds no
     * file cannot tell "the check never ran" from "the file was lost", and the safest reading of a
     * missing file is the one this avoids having to rely on: the state is written down explicitly.
     */
    const argv = process.argv.slice(2);
    const jsonPath = argv.includes('--json') ? argv[argv.indexOf('--json') + 1] : null;
    if (jsonPath) {
      try {
        fs.writeFileSync(jsonPath, `${JSON.stringify({
          schema: 'safety-insite.evidence-digest-integrity.v1',
          checkedAt: new Date().toISOString(),
          mode: 'READ_ONLY_FULL_REHASH',
          integrityState: 'INTEGRITY_UNKNOWN',
          scanComplete: false,
          outcome: 'INVARIANT_NOT_ESTABLISHED',
          failureDetail: String(error && error.message).slice(0, 300),
          counts: null,
          findings: [],
        }, null, 2)}\n`);
      } catch { /* the exit code still carries the failure */ }
    }
    process.exit(2);
  });
}

module.exports = { ALL_ROWS_SQL, ROW_COUNT_SQL, classify, INTEGRITY_STATES };
