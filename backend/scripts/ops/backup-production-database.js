#!/usr/bin/env node
/**
 * §311 / BR-5 — THE DURABLE PRODUCTION DATABASE BACKUP.
 *
 * ===============================================================================================
 * WHAT PROBLEM THIS SOLVES.
 *
 * Neon's Free plan gives this project a SIX HOUR instant-restore window and NO snapshots and NO
 * snapshot schedule (§295 read it from the console; §311 re-read it and it has not moved). Six
 * hours covers the mistake an operator notices inside the working session. It does not cover damage
 * discovered the next morning, and at external Beta the party who suffers that is a customer rather
 * than the owner. Everything beyond six hours has, until now, depended on somebody REMEMBERING to
 * run `pg_dump` at release time. That is BR-5.
 *
 * This is the thing that runs on a schedule instead of being remembered.
 *
 * ===============================================================================================
 * WHAT IT DELIBERATELY DOES NOT CLAIM.
 *
 * Creating a dump file is not a backup strategy, so this script refuses to treat a written file as
 * success. A run is successful only when the artifact has been UPLOADED to the durable destination,
 * READ BACK from it, and the read-back bytes hash to the same sha256 as what was dumped. Anything
 * short of that exits non-zero.
 *
 * It is also not, by itself, a recovery. `verify-backup-restore.js` is the half that proves an
 * artifact restores, and the disaster-recovery runbook is the half that says what to do with it.
 * A backup nobody has restored is a hypothesis.
 *
 * ===============================================================================================
 * THE CLIENT AND THE ENDPOINT, both of which have cost a section already.
 *
 * Production is PostgreSQL 17.11. A PostgreSQL 16 client REFUSES it outright, so this script
 * resolves `pg_dump` by asking candidates for their version rather than trusting whatever is first
 * on PATH, and refuses to run on a client older than the server.
 *
 * And it uses the DIRECT Neon endpoint, never the `-pooler` one: pg_dump opens a second connection
 * for its snapshot and PgBouncer-style pooling breaks that. `DATABASE_URL` in production is the
 * pooler host, so the rewrite is done here rather than left to whoever schedules this.
 *
 * ===============================================================================================
 * WHERE IT MAY WRITE, and why that is not the application's bucket.
 *
 * The destination is configured SEPARATELY from the application's object storage and the script
 * REFUSES to start if the two resolve to the same bucket. A database dump is every customer's data
 * at once; the application's R2 credential exists to serve one customer their own photo. Putting
 * the former where the latter's credential can read it would mean a single leaked application key
 * escalates from "five evidence objects" to "the entire database", which is a real weakening of an
 * isolation boundary that currently holds. §311 measured that boundary: the application credential
 * is object-scoped — it cannot list buckets and is denied every bucket-administration read — and
 * the product's only download route resolves objects through a `storage_objects` row by UUID, never
 * by a caller-supplied key. Both properties are worth keeping.
 *
 * ===============================================================================================
 * CONFIGURATION. All of it environment, none of it in this repository.
 *
 *   BACKUP_SOURCE_DATABASE_URL   required. The database to dump. Pooler host is rewritten.
 *   BACKUP_S3_ENDPOINT           required. Destination S3-compatible endpoint.
 *   BACKUP_S3_BUCKET             required. MUST NOT equal STORAGE_S3_BUCKET.
 *   BACKUP_S3_ACCESS_KEY_ID      required.
 *   BACKUP_S3_SECRET_ACCESS_KEY  required.
 *   BACKUP_S3_REGION             optional, default `auto`.
 *   BACKUP_S3_PREFIX             optional, default `postgres`.
 *   BACKUP_RETAIN_DAILY          optional, default 14.
 *   BACKUP_RETAIN_WEEKLY         optional, default 8.  (Sunday artifacts, kept beyond the daily window.)
 *   BACKUP_VERSION_URL           optional. A `/health/version` URL, to bind the artifact to the SHA
 *                                that was serving when it was taken.
 *   OPERATIONAL_ALERT_WEBHOOK_URL optional. The EXISTING MO-1 channel. A failure posts here.
 *   BACKUP_KEEP_LOCAL            optional. `true` keeps the local artifact. Default is to delete it,
 *                                because §311 forbids a backup strategy that lives on a laptop.
 *
 * Exit codes: 0 success, 1 failure. There is no partial success.
 */

'use strict';

const { execFileSync, execFile } = require('node:child_process');
const { createHash, randomUUID } = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

const ARTIFACT_SCHEMA = 'safety-insite.database-backup.v1';
const STATUS_KEY_BASENAME = 'latest.json';

/** The minimum client major. Production is 17; a 16 client refuses the server outright. */
const MINIMUM_PG_DUMP_MAJOR = 17;

const PG_DUMP_CANDIDATES = [
  process.env.BACKUP_PG_DUMP_PATH,
  '/opt/homebrew/opt/libpq/bin/pg_dump',
  '/usr/local/opt/libpq/bin/pg_dump',
  '/usr/lib/postgresql/18/bin/pg_dump',
  '/usr/lib/postgresql/17/bin/pg_dump',
  'pg_dump',
].filter(Boolean);

function fail(message, detail) {
  const error = new Error(message);
  if (detail !== undefined) error.detail = detail;
  throw error;
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) fail(`${name} is not set. See the header of this script.`);
  return value.trim();
}

/**
 * Resolve a pg_dump that is not older than the server. Asking each candidate its version is the
 * only reliable test: PATH order is an accident of whatever was installed last, and the failure
 * mode of getting this wrong is a refusal in the middle of a scheduled run at 03:00.
 */
function resolvePgDump() {
  const rejected = [];
  for (const candidate of PG_DUMP_CANDIDATES) {
    let reported;
    try {
      reported = execFileSync(candidate, ['--version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
      rejected.push({ candidate, reason: 'not executable' });
      continue;
    }
    const major = Number((reported.match(/(\d+)\./) || [])[1]);
    if (!Number.isFinite(major)) {
      rejected.push({ candidate, reason: `unparseable version ${reported}` });
      continue;
    }
    if (major < MINIMUM_PG_DUMP_MAJOR) {
      rejected.push({ candidate, reason: `${reported} is older than the server` });
      continue;
    }
    return { path: candidate, version: reported, major, rejected };
  }
  fail(
    `No pg_dump of version ${MINIMUM_PG_DUMP_MAJOR} or newer was found. Production is PostgreSQL 17 and an ` +
      'older client refuses it. Set BACKUP_PG_DUMP_PATH, or install one.',
    rejected,
  );
}

/**
 * pg_dump needs a second connection for its snapshot, which a transaction pooler does not carry
 * across. Production's DATABASE_URL is the pooler host, so this is a correction rather than a
 * preference.
 */
function directEndpoint(urlText) {
  const url = new URL(urlText);
  const rewritten = url.hostname.includes('-pooler.');
  if (rewritten) url.hostname = url.hostname.replace('-pooler.', '.');
  const params = new URLSearchParams(url.search);
  const database = url.pathname.replace(/^\//, '').split('?')[0];
  return {
    url: url.toString(),
    host: url.hostname,
    database,
    rewritten,
    /**
     * Connection parameters as ENVIRONMENT rather than as a URL in `argv`.
     *
     * A URL on the command line puts the production database password into `ps` output on whatever
     * machine runs the schedule, into shell history, and into the text of any error message that
     * echoes the failing command. libpq reads these natively, so nothing is given up.
     */
    env: {
      PGHOST: url.hostname,
      PGPORT: url.port || '5432',
      PGDATABASE: database,
      PGUSER: decodeURIComponent(url.username),
      PGPASSWORD: decodeURIComponent(url.password),
      PGSSLMODE: params.get('sslmode') || 'require',
      ...(params.get('channel_binding') ? { PGCHANNELBINDING: params.get('channel_binding') } : {}),
    },
  };
}

function sha256File(file) {
  const hash = createHash('sha256');
  hash.update(fs.readFileSync(file));
  return hash.digest('hex');
}

/** Everything the artifact needs in order to be identifiable later WITHOUT any secret in it. */
async function readSourceBinding(source) {
  const psql = resolvePsql();
  const query = [
    'select coalesce(max(timestamp)::text, \'NONE\') from migrations',
    'select count(*)::text from migrations',
    "select count(*)::text from information_schema.tables where table_schema='public' and table_type='BASE TABLE'",
    'select current_setting(\'server_version\')',
    'select pg_database_size(current_database())::text',
  ];
  const args = ['-At', '-v', 'ON_ERROR_STOP=1'];
  for (const q of query) args.push('-c', q);
  const { stdout } = await execFileAsync(psql, args, {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
    env: { ...process.env, ...source.env },
  });
  const [schemaHead, migrationCount, tableCount, serverVersion, databaseBytes] = stdout.trim().split('\n');
  return {
    schemaHead,
    migrationCount: Number(migrationCount),
    tableCount: Number(tableCount),
    serverVersion,
    databaseBytes: Number(databaseBytes),
  };
}

function resolvePsql() {
  for (const candidate of PG_DUMP_CANDIDATES.map((c) => c.replace(/pg_dump$/, 'psql'))) {
    try {
      execFileSync(candidate, ['--version'], { stdio: 'ignore' });
      return candidate;
    } catch {
      /* next */
    }
  }
  fail('No psql client was found alongside pg_dump.');
}

/**
 * The running application's identity, so a restored database can be paired with a build that
 * understands it. Best effort by design: a scheduled backup must not fail because the API was
 * briefly unreachable, so this records WHY it is absent rather than pretending it is present.
 * The pattern is the one `/health/version` already uses for its own source status.
 */
async function readApplicationBinding() {
  const url = process.env.BACKUP_VERSION_URL;
  if (!url) return { status: 'NOT_CONFIGURED', gitCommit: null, buildTimestamp: null };
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) return { status: `HTTP_${response.status}`, gitCommit: null, buildTimestamp: null };
    const body = await response.json();
    return {
      status: 'READ_FROM_PRODUCTION',
      gitCommit: body.gitCommit ?? null,
      buildTimestamp: body.buildTimestamp ?? null,
      nodeVersion: body.nodeVersion ?? null,
    };
  } catch (error) {
    return { status: 'UNREACHABLE', gitCommit: null, buildTimestamp: null, detail: String(error && error.message).slice(0, 200) };
  }
}

/**
 * The digest over the files that determine the built artifacts, recomputed by the command recorded
 * in the release manifest. Only meaningful when this runs inside a checkout; a scheduler that has
 * the repository gets it, one that does not records that it does not.
 */
function readApplicationSourceDigest() {
  const pattern =
    '^(backend/(src|scripts)/|backend/package(-lock)?\\.json|backend/tsconfig|' +
    'frontend-next/(app|components|lib|public|scripts)/|frontend-next/package(-lock)?\\.json|' +
    'frontend-next/(next\\.config|tsconfig|tailwind))';
  try {
    const listing = execFileSync('git', ['ls-tree', '-r', 'HEAD', "--format=%(path) %(objectname)"], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      cwd: path.resolve(__dirname, '..', '..', '..'),
      stdio: ['ignore', 'pipe', 'ignore'], // a missing .git is an expected state, not something to print
    });
    const regex = new RegExp(pattern);
    const lines = listing.split('\n').filter((line) => regex.test(line)).sort();
    if (lines.length) {
      return { status: 'COMPUTED', value: createHash('sha256').update(`${lines.join('\n')}\n`).digest('hex') };
    }
  } catch {
    /* fall through to the recorded binding below */
  }

  /**
   * THE INSTALLED-RUNNER CASE, and why it needs its own answer rather than a shrug.
   *
   * The scheduled job runs from ~/.safety-insite/runner/, which is deliberately NOT a git checkout —
   * macOS TCC denies a launchd agent access to the checkout under ~/Desktop. So `git ls-tree` fails
   * there, and the first durable backup was written with the digest unbound.
   *
   * A backup artifact that cannot name the application build it belongs to is materially weaker: at
   * restore time the whole point of the binding is to pair the data with code that understands it.
   * So the installer computes the digest FROM the checkout at install time and records it here, and
   * the status distinguishes the two provenances honestly — a digest recorded at install is a claim
   * about the runner's source, not a measurement taken at backup time.
   */
  try {
    const recorded = JSON.parse(fs.readFileSync(path.join(__dirname, 'SOURCE-BINDING.json'), 'utf8'));
    if (recorded.applicationSourceDigest) {
      return {
        status: 'RECORDED_AT_INSTALL',
        value: recorded.applicationSourceDigest,
        sourceCommit: recorded.sourceCommit || null,
        recordedAt: recorded.recordedAt || null,
      };
    }
  } catch {
    /* no recorded binding either */
  }

  return { status: 'NOT_A_CHECKOUT_AND_NO_RECORDED_BINDING', value: null };
}

function s3Client() {
  // Required lazily so `--help` and the configuration refusals above do not depend on the SDK.
  const { S3Client } = require('@aws-sdk/client-s3');
  return new S3Client({
    region: process.env.BACKUP_S3_REGION || 'auto',
    endpoint: requiredEnv('BACKUP_S3_ENDPOINT'),
    forcePathStyle: process.env.BACKUP_S3_FORCE_PATH_STYLE === 'true',
    credentials: {
      accessKeyId: requiredEnv('BACKUP_S3_ACCESS_KEY_ID'),
      secretAccessKey: requiredEnv('BACKUP_S3_SECRET_ACCESS_KEY'),
    },
  });
}

async function streamToBuffer(body) {
  const chunks = [];
  for await (const chunk of body) chunks.push(chunk);
  return Buffer.concat(chunks);
}

/**
 * Retention. Daily artifacts for BACKUP_RETAIN_DAILY days; Sunday artifacts additionally kept for
 * BACKUP_RETAIN_WEEKLY weeks. Deliberately modest: this is a Beta with a 32 MB database and real
 * customer personal information in it, so data minimisation and the account-deletion consequence
 * (see the runbook) argue against an enterprise-scale tail.
 *
 * Returns what it deleted rather than deleting silently, because an unexplained disappearance of
 * backups is indistinguishable from a bug.
 */
/**
 * §311A hardened this in three ways, each of which is a way a retention pass destroys the thing it
 * exists to protect.
 *
 *  1. THE NEWEST VALID ARTIFACTS ARE NEVER EXPIRED, whatever the arithmetic says. The original
 *     version had a genuine hole: if nothing ran for longer than the daily window — a laptop shut
 *     for three weeks, exactly the scenario the machine-local scheduler makes possible — then on
 *     the next run EVERY existing artifact is older than the cutoff and the pass would delete the
 *     lot, leaving the destination empty at the precise moment its contents mattered most.
 *     `ALWAYS_KEEP_NEWEST` is an absolute floor that the age rules cannot override.
 *
 *  2. AMBIGUITY KEEPS, NEVER DELETES. A name this script cannot positively identify as its own
 *     artifact, or a timestamp it cannot parse, is retained and reported. Deletion requires a
 *     positive identification, not the absence of a reason to keep.
 *
 *  3. THE CALLER MUST PROVE THE LISTING WAS COMPLETE. `listingComplete` is required, and a false
 *     value returns every key as kept. A truncated or partially-failed listing looks exactly like
 *     "there are no recent backups", and acting on it would delete the real ones.
 */
const ALWAYS_KEEP_NEWEST = 3;

function classifyForRetention(keys, now, retainDailyDays, retainWeeklyWeeks, listingComplete = true) {
  const dailyCutoff = new Date(now.getTime() - retainDailyDays * 86400000);
  const weeklyCutoff = new Date(now.getTime() - retainWeeklyWeeks * 7 * 86400000);
  const kept = [];
  const expired = [];

  if (!listingComplete) {
    // Fail closed. A partial listing is indistinguishable from an empty destination.
    return { kept: keys.map((key) => ({ key, reason: 'LISTING_INCOMPLETE_DELETION_SUPPRESSED' })), expired: [], suppressed: true };
  }

  const parsed = [];
  for (const key of keys) {
    const stamp = (key.match(/(\d{4}-\d{2}-\d{2}T\d{6}Z)/) || [])[1];
    if (!stamp) {
      kept.push({ key, reason: 'UNRECOGNISED_NAME' });
      continue;
    }
    const iso = `${stamp.slice(0, 11)}${stamp.slice(11, 13)}:${stamp.slice(13, 15)}:${stamp.slice(15, 17)}Z`;
    const taken = new Date(iso);
    if (Number.isNaN(taken.getTime())) {
      kept.push({ key, reason: 'UNPARSEABLE_TIMESTAMP' });
      continue;
    }
    parsed.push({ key, taken });
  }

  // The floor, applied before any age rule can reach these.
  const newest = new Set(
    [...parsed].sort((a, b) => b.taken - a.taken).slice(0, ALWAYS_KEEP_NEWEST).map((entry) => entry.key),
  );

  for (const { key, taken } of parsed) {
    if (newest.has(key)) kept.push({ key, reason: 'ALWAYS_KEEP_NEWEST', takenAt: taken.toISOString() });
    else if (taken >= dailyCutoff) kept.push({ key, reason: 'WITHIN_DAILY_WINDOW', takenAt: taken.toISOString() });
    else if (taken.getUTCDay() === 0 && taken >= weeklyCutoff) kept.push({ key, reason: 'WEEKLY_RETAINED', takenAt: taken.toISOString() });
    else expired.push({ key, takenAt: taken.toISOString() });
  }
  return { kept, expired, suppressed: false };
}

async function postFailureAlert(summary) {
  const url = process.env.OPERATIONAL_ALERT_WEBHOOK_URL;
  if (!url) return { dispatched: false, reason: 'NOT_CONFIGURED' };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      // Shaped like the MO-1 payload so one receiver can read both without a second parser.
      body: JSON.stringify({
        schema: ARTIFACT_SCHEMA,
        event: 'database.backup_failed',
        severity: 'error',
        occurredAt: new Date().toISOString(),
        summary,
      }),
      signal: AbortSignal.timeout(15000),
    });
    return { dispatched: response.ok, status: response.status };
  } catch (error) {
    return { dispatched: false, reason: String(error && error.message).slice(0, 200) };
  }
}

async function main() {
  const startedAt = Date.now();
  const now = new Date();
  const stamp = now.toISOString().replace(/[:-]/g, (c) => (c === '-' ? '-' : '')).replace(/\.\d{3}Z$/, 'Z');
  // stamp is YYYY-MM-DDTHHMMSSZ — sortable, filename-safe, and parseable back by the retention pass.

  const sourceBucket = process.env.STORAGE_S3_BUCKET;
  const destinationBucket = requiredEnv('BACKUP_S3_BUCKET');
  if (sourceBucket && sourceBucket === destinationBucket) {
    fail(
      'BACKUP_S3_BUCKET is the same bucket the application serves customer evidence from. A database ' +
        'dump is every customer at once; it must not be readable by the credential that exists to serve ' +
        'one customer their own photo. Use a separate bucket with its own scoped token.',
    );
  }

  const source = directEndpoint(requiredEnv('BACKUP_SOURCE_DATABASE_URL'));
  const dump = resolvePgDump();

  process.stdout.write(`source host      ${source.host}${source.rewritten ? '  (rewritten from the pooler endpoint)' : ''}\n`);
  process.stdout.write(`source database  ${source.database}\n`);
  process.stdout.write(`pg_dump          ${dump.path} — ${dump.version}\n`);

  const binding = await readSourceBinding(source);
  process.stdout.write(
    `server           PostgreSQL ${binding.serverVersion}, ${binding.tableCount} tables, schema head ` +
      `${binding.schemaHead} (${binding.migrationCount} migrations), ${binding.databaseBytes} bytes\n`,
  );

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'insite-backup-'));
  const artifactName = `${source.database}-${stamp}.dump`;
  const artifactPath = path.join(workDir, artifactName);

  // ---- DUMP ----------------------------------------------------------------------------------
  const dumpStartedAt = Date.now();
  const dumpEnv = { ...process.env, ...source.env };
  await execFileAsync(
    dump.path,
    [
      '--format=custom',
      '--compress=9',
      '--no-owner',
      '--no-privileges',
      // A single consistent snapshot. pg_dump takes one by default; naming it here is documentation.
      '--serializable-deferrable',
      `--file=${artifactPath}`,
    ],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: dumpEnv },
  ).catch((error) => {
    // --serializable-deferrable is not available on every managed server. Retry once without it
    // rather than failing a scheduled backup over a consistency flag that pg_dump already honours
    // by taking a repeatable-read snapshot.
    process.stdout.write('note             --serializable-deferrable refused; retrying with the default snapshot\n');
    return execFileAsync(
      dump.path,
      ['--format=custom', '--compress=9', '--no-owner', '--no-privileges', `--file=${artifactPath}`],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: dumpEnv },
    ).catch((retryError) => {
      fail(`pg_dump failed: ${String(retryError && retryError.message).slice(0, 400)}`, { firstError: String(error && error.message).slice(0, 400) });
    });
  });
  const dumpMs = Date.now() - dumpStartedAt;

  const sizeBytes = fs.statSync(artifactPath).size;
  const checksum = sha256File(artifactPath);
  if (sizeBytes === 0) fail('pg_dump produced a zero-byte artifact.');
  process.stdout.write(`dump             ${sizeBytes} bytes in ${(dumpMs / 1000).toFixed(1)}s, sha256 ${checksum}\n`);

  // ---- METADATA ------------------------------------------------------------------------------
  const application = await readApplicationBinding();
  const sourceDigest = readApplicationSourceDigest();
  const prefix = (process.env.BACKUP_S3_PREFIX || 'postgres').replace(/\/+$/, '');
  const artifactKey = `${prefix}/${artifactName}`;
  const metadataKey = `${artifactKey}.metadata.json`;

  const metadata = {
    schema: ARTIFACT_SCHEMA,
    takenAt: now.toISOString(),
    artifact: { key: artifactKey, bytes: sizeBytes, sha256: checksum, format: 'pg_dump custom (-Fc), compress 9' },
    database: {
      host: source.host,
      name: source.database,
      engine: `PostgreSQL ${binding.serverVersion}`,
      sizeBytes: binding.databaseBytes,
      tableCount: binding.tableCount,
    },
    schemaPosition: { head: binding.schemaHead, migrationCount: binding.migrationCount },
    application: {
      gitCommit: application.gitCommit,
      buildTimestamp: application.buildTimestamp,
      sourceStatus: application.status,
      applicationSourceDigest: sourceDigest.value,
      applicationSourceDigestStatus: sourceDigest.status,
      ...(sourceDigest.sourceCommit ? { applicationSourceCommitAtInstall: sourceDigest.sourceCommit } : {}),
    },
    tooling: { pgDump: dump.version, node: process.version },
    durations: { dumpMs },
    // Deliberately absent: connection strings, credentials, tokens, customer identifiers.
  };

  // ---- UPLOAD, THEN READ BACK AND RE-HASH ----------------------------------------------------
  const { PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');
  const client = s3Client();
  const uploadStartedAt = Date.now();

  await client.send(
    new PutObjectCommand({
      Bucket: destinationBucket,
      Key: artifactKey,
      Body: fs.readFileSync(artifactPath),
      ContentType: 'application/octet-stream',
      ChecksumSHA256: Buffer.from(checksum, 'hex').toString('base64'),
      Metadata: { sha256: checksum, 'schema-head': String(binding.schemaHead), 'taken-at': now.toISOString() },
    }),
  );
  await client.send(
    new PutObjectCommand({
      Bucket: destinationBucket,
      Key: metadataKey,
      Body: Buffer.from(`${JSON.stringify(metadata, null, 2)}\n`, 'utf8'),
      ContentType: 'application/json',
    }),
  );
  const uploadMs = Date.now() - uploadStartedAt;

  // A write that was accepted is not a write that is readable. Read it back and re-hash it: this is
  // the difference between "the upload returned 200" and "the backup exists".
  const verifyStartedAt = Date.now();
  const readBack = await streamToBuffer((await client.send(new GetObjectCommand({ Bucket: destinationBucket, Key: artifactKey }))).Body);
  const readBackChecksum = createHash('sha256').update(readBack).digest('hex');
  const verifyMs = Date.now() - verifyStartedAt;
  if (readBackChecksum !== checksum) {
    fail(`The artifact read back from the destination does not match what was dumped. dumped ${checksum}, read back ${readBackChecksum}.`);
  }
  if (readBack.length !== sizeBytes) fail(`Read-back size ${readBack.length} does not match ${sizeBytes}.`);
  process.stdout.write(`upload           ${(uploadMs / 1000).toFixed(1)}s; read-back verified in ${(verifyMs / 1000).toFixed(1)}s, sha256 matches\n`);

  // ---- RETENTION -----------------------------------------------------------------------------
  const retainDaily = Number(process.env.BACKUP_RETAIN_DAILY || 14);
  const retainWeekly = Number(process.env.BACKUP_RETAIN_WEEKLY || 8);
  const listed = [];
  let token;
  // `listingComplete` is proven rather than assumed: it stays false until the pagination loop has
  // run to its natural end. Any throw leaves it false and the retention pass suppresses deletion.
  let listingComplete = false;
  try {
    do {
      const page = await client.send(new ListObjectsV2Command({ Bucket: destinationBucket, Prefix: `${prefix}/`, ContinuationToken: token, MaxKeys: 1000 }));
      for (const object of page.Contents || []) if (object.Key.endsWith('.dump')) listed.push(object.Key);
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);
    listingComplete = true;
  } catch (error) {
    process.stdout.write(`retention        LISTING FAILED (${String(error && error.name)}) — deletion suppressed, nothing removed\n`);
  }

  const retention = classifyForRetention(listed, now, retainDaily, retainWeekly, listingComplete);
  for (const { key } of retention.expired) {
    await client.send(new DeleteObjectCommand({ Bucket: destinationBucket, Key: key }));
    await client.send(new DeleteObjectCommand({ Bucket: destinationBucket, Key: `${key}.metadata.json` })).catch(() => undefined);
  }
  process.stdout.write(
    retention.suppressed
      ? `retention        SUPPRESSED — ${retention.kept.length} artifacts kept, 0 removed\n`
      : `retention        ${retention.kept.length} kept, ${retention.expired.length} expired and removed (daily ${retainDaily}d, weekly ${retainWeekly}w, newest ${ALWAYS_KEEP_NEWEST} always kept)\n`,
  );

  // ---- THE FRESHNESS RECORD ------------------------------------------------------------------
  // The one object a monitor reads. It is what makes "the last backup was three weeks ago"
  // answerable without listing a bucket or knowing this script's naming convention.
  const status = {
    schema: ARTIFACT_SCHEMA,
    lastSuccessAt: now.toISOString(),
    lastSuccessArtifactKey: artifactKey,
    lastSuccessSha256: checksum,
    lastSuccessBytes: sizeBytes,
    lastSuccessSchemaHead: binding.schemaHead,
    retainedArtifactCount: retention.kept.length,
    durationsMs: { dump: dumpMs, upload: uploadMs, readBackVerify: verifyMs, total: Date.now() - startedAt },
  };
  await client.send(
    new PutObjectCommand({
      Bucket: destinationBucket,
      Key: `${prefix}/${STATUS_KEY_BASENAME}`,
      Body: Buffer.from(`${JSON.stringify(status, null, 2)}\n`, 'utf8'),
      ContentType: 'application/json',
    }),
  );

  // ---- LOCAL HYGIENE -------------------------------------------------------------------------
  if (process.env.BACKUP_KEEP_LOCAL === 'true') {
    process.stdout.write(`local artifact   KEPT at ${artifactPath} — delete it when you are done with it\n`);
  } else {
    fs.rmSync(workDir, { recursive: true, force: true });
    process.stdout.write('local artifact   removed\n');
  }

  process.stdout.write(`\nOK  ${artifactKey}  ${sizeBytes} bytes  sha256 ${checksum}  total ${((Date.now() - startedAt) / 1000).toFixed(1)}s\n`);
  return { metadata, status, retention };
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(async (error) => {
      const summary = { message: String(error && error.message).slice(0, 500), detail: error && error.detail };
      process.stderr.write(`\nBACKUP FAILED: ${summary.message}\n`);
      if (summary.detail) process.stderr.write(`${JSON.stringify(summary.detail, null, 2)}\n`);
      const alert = await postFailureAlert(summary);
      process.stderr.write(`alert dispatch: ${JSON.stringify(alert)}\n`);
      process.exit(1);
    });
}

module.exports = { classifyForRetention, directEndpoint, resolvePgDump, ARTIFACT_SCHEMA, STATUS_KEY_BASENAME, ALWAYS_KEEP_NEWEST };
