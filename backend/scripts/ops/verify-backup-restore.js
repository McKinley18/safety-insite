#!/usr/bin/env node
/**
 * §311 / BR-5 — PROVE THAT A BACKUP ARTIFACT RESTORES.
 *
 * ===============================================================================================
 * WHY THIS IS A SEPARATE SCRIPT FROM THE ONE THAT TAKES THE BACKUP.
 *
 * `backup-production-database.js` proves the artifact was WRITTEN and can be READ BACK BYTE-FOR-BYTE.
 * That is not the same claim as "it restores", and conflating the two is how a project ends up with
 * fourteen verified-looking backups and no recovery. This script makes the second claim, and it
 * makes it the expensive way: it actually restores into a throwaway PostgreSQL and compares the
 * result against the source, table by table, by CONTENT.
 *
 * ===============================================================================================
 * WHY CONTENT CHECKSUM RATHER THAN ROW COUNT.
 *
 * Row counts agree across a restore that silently truncated a text column, dropped a default, or
 * reordered an enum. §289 established per-table content checksums as the bar for this repository
 * and this script keeps it.
 *
 * TWO THINGS WILL OTHERWISE LOOK LIKE CORRUPTION AND ARE NOT.
 *
 *  1. COLLATION. Neon runs `C.UTF-8`; a stock `postgres:17` image runs `en_US.utf8`. A checksum
 *     that orders rows by their text reports a difference on identical data. §289 lost time to this
 *     exactly once, on the `user` table. So the aggregation here orders by the per-row HASH with an
 *     explicit `COLLATE "C"`, which is stable regardless of either server's locale.
 *
 *  2. SESSION SETTINGS. `row::text` renders `timestamptz` in the session time zone and floats at the
 *     session's `extra_float_digits`. Both ends are pinned to UTC and to the same float precision
 *     before a single hash is taken, so the comparison measures the data rather than the session.
 *
 * ===============================================================================================
 * WHAT IT REFUSES TO DO.
 *
 * It will not restore into anything it cannot positively identify as disposable. The target must be
 * a local/private host AND the database name must carry a disposable marker, or `--i-know` must be
 * passed explicitly. The repository's standing rule is that a restore target is proven disposable
 * before the command runs, not after.
 *
 * ===============================================================================================
 * USAGE
 *
 *   node scripts/ops/verify-backup-restore.js \
 *     --artifact <local path | s3 key>  \
 *     --target   <postgres URL of a DISPOSABLE database> \
 *     [--source  <postgres URL to compare content against — omit to verify structure only>] \
 *     [--i-know]
 *
 * When `--artifact` is not a readable local file it is treated as a key in BACKUP_S3_BUCKET and
 * downloaded using the BACKUP_S3_* configuration.
 *
 * Exit codes: 0 every check passed, 1 any check failed.
 */

'use strict';

const { execFileSync, execFile } = require('node:child_process');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

const CLIENT_CANDIDATES = [
  process.env.BACKUP_PG_CLIENT_DIR,
  '/opt/homebrew/opt/libpq/bin',
  '/usr/local/opt/libpq/bin',
  '/usr/lib/postgresql/18/bin',
  '/usr/lib/postgresql/17/bin',
].filter(Boolean);

/**
 * Session settings that make `row::text` a property of the DATA rather than of the connection.
 *
 * Delivered through `PGOPTIONS` rather than as `-c "set ..."` statements, for two reasons. A `set`
 * issued with `-c` prints its own `SET` command tag onto stdout, which silently contaminates the
 * result parsing of every query after it — the first draft of this script counted three phantom
 * tables called `SET` and tried to checksum them. And PGOPTIONS applies to the connection before
 * the first statement runs, so there is no window in which a query could execute unpinned.
 */
const DETERMINISTIC_PGOPTIONS = '-c timezone=UTC -c extra_float_digits=3 -c datestyle=ISO,MDY';

/**
 * Connection parameters as ENVIRONMENT rather than as a URL in `argv`.
 *
 * A URL on the command line puts the production database password into `ps` output, into any shell
 * history, and — as this script's own first run demonstrated — into the text of any error message
 * that echoes the failing command. libpq reads these variables natively, so nothing is lost.
 */
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
    PGOPTIONS: DETERMINISTIC_PGOPTIONS,
  };
}

function tool(name) {
  for (const dir of CLIENT_CANDIDATES) {
    const candidate = path.join(dir, name);
    try {
      execFileSync(candidate, ['--version'], { stdio: 'ignore' });
      return candidate;
    } catch {
      /* next */
    }
  }
  try {
    execFileSync(name, ['--version'], { stdio: 'ignore' });
    return name;
  } catch {
    throw new Error(`No ${name} client was found. Production is PostgreSQL 17 and an older client refuses it.`);
  }
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    if (key === 'i-know') args.iKnow = true;
    else args[key] = argv[++i];
  }
  return args;
}

/**
 * The disposability gate. A restore writes over everything in the target, so "I meant to point at
 * the throwaway one" is not a sufficient control.
 */
function assertDisposable(targetUrl, iKnow) {
  const url = new URL(targetUrl);
  const database = url.pathname.replace(/^\//, '').split('?')[0];
  const localHost = ['localhost', '127.0.0.1', '::1', 'host.docker.internal'].includes(url.hostname);
  const disposableName = /(^|[-_])(disposable|throwaway|restoretarget|scratch|verify|tmp|test)/i.test(database);
  if (iKnow) return { database, host: url.hostname, gate: 'OVERRIDDEN_BY_--i-know' };
  if (!localHost) {
    throw new Error(
      `Refusing to restore into ${url.hostname}: it is not a local host. A restore overwrites the target ` +
        'completely. Point at a disposable local database, or pass --i-know if you are certain.',
    );
  }
  if (!disposableName) {
    throw new Error(
      `Refusing to restore into database "${database}": the name does not identify it as disposable. ` +
        'Name it something containing "disposable", "restoretarget", "scratch" or "verify", or pass --i-know.',
    );
  }
  return { database, host: url.hostname, gate: 'LOCAL_HOST_AND_DISPOSABLE_NAME' };
}

async function psqlRows(psql, url, sql) {
  const { stdout } = await execFileAsync(psql, ['-At', '-F', '', '-v', 'ON_ERROR_STOP=1', '-c', sql], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    env: { ...process.env, ...connectionEnv(url) },
  });
  return stdout.split('\n').filter((line) => line.length).map((line) => line.split(''));
}

const BASE_TABLES_SQL =
  "select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by table_name";

/**
 * One content digest per table: the md5 of every row's md5, aggregated in an order that is a
 * property of the hashes rather than of either server's collation.
 */
function tableChecksumSql(table) {
  return (
    `select coalesce(md5(string_agg(h, '' order by h COLLATE "C")), 'EMPTY') || ':' || count(*)::text ` +
    `from (select md5(t::text) as h from public."${table}" t) s`
  );
}

async function checksumAllTables(psql, url, tables) {
  const digests = new Map();
  // One psql invocation per batch keeps the process count sane on a 78-table schema while staying
  // well inside argument limits.
  const BATCH = 20;
  for (let i = 0; i < tables.length; i += BATCH) {
    const batch = tables.slice(i, i + BATCH);
    const args = ['-At', '-v', 'ON_ERROR_STOP=1'];
    for (const table of batch) args.push('-c', tableChecksumSql(table));
    const { stdout } = await execFileAsync(psql, args, {
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
      env: { ...process.env, ...connectionEnv(url) },
    });
    const lines = stdout.split('\n').filter((line) => line.length);
    if (lines.length !== batch.length) throw new Error(`Checksum batch returned ${lines.length} results for ${batch.length} tables.`);
    batch.forEach((table, index) => digests.set(table, lines[index]));
  }
  return digests;
}

async function downloadArtifact(key) {
  const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
  const client = new S3Client({
    region: process.env.BACKUP_S3_REGION || 'auto',
    endpoint: process.env.BACKUP_S3_ENDPOINT,
    forcePathStyle: process.env.BACKUP_S3_FORCE_PATH_STYLE === 'true',
    credentials: { accessKeyId: process.env.BACKUP_S3_ACCESS_KEY_ID, secretAccessKey: process.env.BACKUP_S3_SECRET_ACCESS_KEY },
  });
  const response = await client.send(new GetObjectCommand({ Bucket: process.env.BACKUP_S3_BUCKET, Key: key }));
  const chunks = [];
  for await (const chunk of response.Body) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'insite-restore-')), path.basename(key));
  fs.writeFileSync(file, buffer);
  return file;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.artifact || !args.target) {
    process.stderr.write('Usage: verify-backup-restore.js --artifact <path|key> --target <disposable postgres url> [--source <url>] [--i-know]\n');
    process.exit(2);
  }

  const results = [];
  const record = (name, passed, detail) => {
    results.push({ name, passed, detail });
    process.stdout.write(`${passed ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}\n`);
  };

  const psql = tool('psql');
  const pgRestore = tool('pg_restore');
  const target = assertDisposable(args.target, args.iKnow);
  process.stdout.write(`target           ${target.host}/${target.database}  (gate: ${target.gate})\n`);

  const artifactPath = fs.existsSync(args.artifact) ? args.artifact : await downloadArtifact(args.artifact);
  const artifactBytes = fs.statSync(artifactPath).size;
  const artifactSha = createHash('sha256').update(fs.readFileSync(artifactPath)).digest('hex');
  process.stdout.write(`artifact         ${artifactPath}\n                 ${artifactBytes} bytes, sha256 ${artifactSha}\n`);

  // ---- RESTORE -------------------------------------------------------------------------------
  const restoreStartedAt = Date.now();
  let restoreStderr = '';
  try {
    const { stderr } = await execFileAsync(
      pgRestore,
      // `--dbname` names the database, not a URL: the credentials arrive through connectionEnv.
      ['--dbname', target.database, '--no-owner', '--no-privileges', '--clean', '--if-exists', '--exit-on-error', artifactPath],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: { ...process.env, ...connectionEnv(args.target) } },
    );
    restoreStderr = stderr || '';
  } catch (error) {
    restoreStderr = String((error && error.stderr) || error.message);
    record('restore completes without error', false, restoreStderr.split('\n').slice(0, 3).join(' | ').slice(0, 300));
  }
  const restoreMs = Date.now() - restoreStartedAt;
  if (!results.length) {
    const errorLines = restoreStderr.split('\n').filter((line) => /^pg_restore: error/.test(line));
    record('restore completes without error', errorLines.length === 0, `${(restoreMs / 1000).toFixed(1)}s, ${errorLines.length} errors`);
  }

  // ---- VERIFY --------------------------------------------------------------------------------
  const verifyStartedAt = Date.now();
  const targetTables = (await psqlRows(psql, args.target, BASE_TABLES_SQL)).map(([name]) => name);
  record('restored schema has base tables', targetTables.length > 0, `${targetTables.length} tables`);

  const [[targetHead]] = await psqlRows(psql, args.target, "select coalesce(max(timestamp)::text,'NONE') || ':' || count(*)::text from migrations");
  record('migration history is present and intact', targetHead !== 'NONE:0', `head ${targetHead.split(':')[0]}, ${targetHead.split(':')[1]} rows`);

  let sourceTables = null;
  let comparison = null;
  if (args.source) {
    sourceTables = (await psqlRows(psql, args.source, BASE_TABLES_SQL)).map(([name]) => name);
    const onlyInSource = sourceTables.filter((t) => !targetTables.includes(t));
    const onlyInTarget = targetTables.filter((t) => !sourceTables.includes(t));
    record(
      'table set is identical to the source',
      onlyInSource.length === 0 && onlyInTarget.length === 0,
      `source ${sourceTables.length}, restored ${targetTables.length}` +
        (onlyInSource.length ? `, missing ${onlyInSource.join(',')}` : '') +
        (onlyInTarget.length ? `, extra ${onlyInTarget.join(',')}` : ''),
    );

    const [[sourceHead]] = await psqlRows(psql, args.source, "select coalesce(max(timestamp)::text,'NONE') || ':' || count(*)::text from migrations");
    record('migration head matches the source', sourceHead === targetHead, `source ${sourceHead}, restored ${targetHead}`);

    const shared = sourceTables.filter((t) => targetTables.includes(t));
    const sourceDigests = await checksumAllTables(psql, args.source, shared);
    const targetDigests = await checksumAllTables(psql, args.target, shared);
    const differing = shared.filter((t) => sourceDigests.get(t) !== targetDigests.get(t));
    const totalRows = shared.reduce((sum, t) => sum + Number((sourceDigests.get(t) || ':0').split(':')[1] || 0), 0);
    record(
      'every table is content-identical to the source',
      differing.length === 0,
      `${shared.length} tables, ${totalRows} rows, ${differing.length} differing` + (differing.length ? `: ${differing.slice(0, 8).join(',')}` : ''),
    );

    // One digest over all of them, so the whole comparison reduces to a single quotable value.
    const aggregate = (digests) =>
      createHash('md5').update(shared.map((t) => `${t}=${digests.get(t)}`).join('\n')).digest('hex');
    comparison = { sourceAggregate: aggregate(sourceDigests), targetAggregate: aggregate(targetDigests), tables: shared.length, rows: totalRows, differing };
    record(
      'aggregate content digest matches',
      comparison.sourceAggregate === comparison.targetAggregate,
      comparison.sourceAggregate === comparison.targetAggregate
        ? comparison.sourceAggregate
        : `source ${comparison.sourceAggregate}, restored ${comparison.targetAggregate}`,
    );
  }
  const verifyMs = Date.now() - verifyStartedAt;

  const failed = results.filter((r) => !r.passed);
  const summary = {
    schema: 'safety-insite.backup-restore-verification.v1',
    verifiedAt: new Date().toISOString(),
    artifact: { path: artifactPath, bytes: artifactBytes, sha256: artifactSha },
    target: { host: target.host, database: target.database, gate: target.gate },
    durationsMs: { restore: restoreMs, verify: verifyMs },
    tableCount: targetTables.length,
    migrationHead: targetHead,
    comparison,
    checks: results,
    outcome: failed.length === 0 ? 'PASS' : 'FAIL',
  };

  process.stdout.write(`\nrestore ${(restoreMs / 1000).toFixed(1)}s, verification ${(verifyMs / 1000).toFixed(1)}s\n`);
  process.stdout.write(`${failed.length === 0 ? 'ALL CHECKS PASSED' : `${failed.length} CHECK(S) FAILED`}\n`);
  if (args.json) fs.writeFileSync(args.json, `${JSON.stringify(summary, null, 2)}\n`);
  process.exit(failed.length === 0 ? 0 : 1);
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`\nVERIFICATION ABORTED: ${error && error.message}\n`);
    process.exit(1);
  });
}

module.exports = { assertDisposable, tableChecksumSql };
