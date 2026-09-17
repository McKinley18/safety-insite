#!/usr/bin/env node
/**
 * §312 / BR-5 — CUSTOMER EVIDENCE RECOVERY.
 *
 * =====================================================================================================
 * THE PROBLEM, STATED AS ST-4 LEFT IT.
 *
 * Cloudflare R2 has no object versioning. `insite-production` has no bucket lock — and cannot usefully
 * have one, because the product legitimately deletes objects during normal operation. Eleven nines of
 * durability protect the disk, not the operator: Cloudflare says so outright. So today a single
 * mistaken DELETE or a wrong-object overwrite destroys a piece of safety evidence permanently.
 *
 * This copies live evidence into operator-only recovery storage so that the mistake is survivable.
 *
 * =====================================================================================================
 * THE TWO THINGS IT MUST NOT BECOME.
 *
 * NOT A SECOND AUTHORITATIVE STORE. `insite-production` remains authoritative. Nothing here is served
 * to a customer, reachable from a route, or read by the application. The application credential cannot
 * even see this bucket, and that is a hard invariant rather than a convention.
 *
 * NOT AN INDEFINITE SHADOW COPY. A recovery system that quietly retains every byte a customer ever
 * uploaded, forever, is a privacy liability wearing a safety costume. Generations expire on a bounded
 * window, and an authorized erasure removes the recovery copy too.
 *
 * =====================================================================================================
 * WHY CONTENT-ADDRESSED, which is the one design decision everything else follows from.
 *
 * Recovery objects are stored at `evidence/objects/<sha256>` — the digest IS the key.
 *
 * That is what makes OVERWRITE recoverable. If a live key's content changes from digest A to digest B,
 * a naive mirror (`live key -> same backup key`) would have B destroy A, and the overwrite would be
 * exactly as unrecoverable as before. Content addressing cannot do that: A and B are different keys by
 * construction, so both generations survive independently for the recovery window. It also dedupes for
 * free, and it puts no customer-derived text in a key.
 *
 * The mutable facts — which live key, which database row, when captured, who owned it — live in a
 * per-generation MANIFEST, not in the object key.
 *
 * =====================================================================================================
 * THE ERASURE LEDGER, AND THE HARD GATE IT EXISTS TO PASS.
 *
 * §312 sets a gate that most designs fail: after the database is rolled back to a point BEFORE a
 * customer's authorized deletion, the system must still refuse to resurrect that customer's evidence.
 *
 * `security_audit_events` cannot satisfy this. It is a table in the database being rolled back, so
 * rolling back to T0 destroys the T1 erasure record and the object becomes restorable again. An
 * erasure ledger that lives only inside the restorable state is not an erasure ledger.
 *
 * So the ledger is written INTO THE RECOVERY BUCKET — `evidence/erasure/<storageObjectId>.json` —
 * where a database restore cannot reach it. It is append-only, it is authoritative, and once a
 * tombstone exists no recovery procedure will resurrect that object no matter what the database says.
 *
 * ERASURE IS NEVER INFERRED FROM ABSENCE. An object missing from the live bucket is a candidate for
 * RECOVERY, not for erasure. A tombstone is written only on a positive authoritative signal — the
 * database's own `storage_objects.deletedAt` set by the customer-initiated delete path, corroborated
 * by its `security_audit_events` row. Absence alone means someone may have made a mistake, which is
 * the entire reason this system exists.
 *
 * =====================================================================================================
 * INDEPENDENCE FROM THE DEFECT.
 *
 * This runs operator-side. It does not import the application, does not use the application's storage
 * service, and does not share its code path. If the thing that deletes the wrong object is a bug in
 * `retireReportArtifact`, a backup that ran through `retireReportArtifact` would inherit the bug.
 * This reads the database directly and talks to R2 directly.
 *
 * =====================================================================================================
 * CREDENTIALS — two, deliberately, never one.
 *
 *   EVIDENCE_SOURCE_S3_*   READ-ONLY on insite-production
 *   BACKUP_S3_*            read/write on insite-backups (the existing §311A operator credential)
 *
 * A single credential spanning both buckets would be a credential that can read every customer's
 * evidence AND destroy its only backup. Two credentials mean a compromise of the copier can read, but
 * not erase the thing that makes the erasure survivable.
 *
 * =====================================================================================================
 * USAGE
 *
 *   node reconcile-evidence-recovery.js                 classify and report; changes nothing
 *   node reconcile-evidence-recovery.js --apply         capture new generations, propagate erasures, expire
 *   node reconcile-evidence-recovery.js --restore <id>  restore one object's newest recoverable generation
 *   node reconcile-evidence-recovery.js --json <path>
 *
 * Exit codes: 0 consistent, 1 a state needing operator attention, 2 the scan could not complete.
 */

'use strict';

const { execFile, execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

const SCHEMA = 'safety-insite.evidence-recovery.v1';

/** Bounded windows. Both are privacy decisions as much as engineering ones — see the register. */
const GENERATION_WINDOW_DAYS = Number(process.env.EVIDENCE_GENERATION_WINDOW_DAYS || 30);
const ERASURE_GRACE_HOURS = Number(process.env.EVIDENCE_ERASURE_GRACE_HOURS || 24);

const PREFIX = (process.env.EVIDENCE_RECOVERY_PREFIX || 'evidence').replace(/\/+$/, '');
const K = {
  object: (sha) => `${PREFIX}/objects/${sha}`,
  generationDir: (id) => `${PREFIX}/generations/${id}/`,
  generation: (id, capturedAt, sha) => `${PREFIX}/generations/${id}/${capturedAt.replace(/[:.]/g, '')}-${sha.slice(0, 12)}.json`,
  erasure: (id) => `${PREFIX}/erasure/${id}.json`,
  status: `${PREFIX}/latest.json`,
};

const PSQL_CANDIDATES = [
  process.env.BACKUP_PG_CLIENT_DIR ? path.join(process.env.BACKUP_PG_CLIENT_DIR, 'psql') : null,
  '/opt/homebrew/opt/libpq/bin/psql', '/usr/local/opt/libpq/bin/psql',
  '/usr/lib/postgresql/18/bin/psql', '/usr/lib/postgresql/17/bin/psql', 'psql',
].filter(Boolean);

function resolvePsql() {
  for (const c of PSQL_CANDIDATES) {
    try { execFileSync(c, ['--version'], { stdio: 'ignore' }); return c; } catch { /* next */ }
  }
  throw new Error('No psql client was found.');
}

/** Credentials through the environment, never argv — see the note in verify-backup-restore.js. */
function connectionEnv(urlText) {
  const u = new URL(urlText);
  const p = new URLSearchParams(u.search);
  return {
    PGHOST: u.hostname, PGPORT: u.port || '5432',
    PGDATABASE: u.pathname.replace(/^\//, '').split('?')[0],
    PGUSER: decodeURIComponent(u.username), PGPASSWORD: decodeURIComponent(u.password),
    PGSSLMODE: p.get('sslmode') || 'prefer',
    ...(p.get('channel_binding') ? { PGCHANNELBINDING: p.get('channel_binding') } : {}),
  };
}

function s3(prefix) {
  const { S3Client } = require('@aws-sdk/client-s3');
  const need = (n) => {
    const v = process.env[`${prefix}${n}`];
    if (!v) throw new Error(`${prefix}${n} is not set.`);
    return v;
  };
  return {
    client: new S3Client({
      region: process.env[`${prefix}REGION`] || 'auto',
      endpoint: need('ENDPOINT'),
      forcePathStyle: process.env[`${prefix}FORCE_PATH_STYLE`] === 'true',
      credentials: { accessKeyId: need('ACCESS_KEY_ID'), secretAccessKey: need('SECRET_ACCESS_KEY') },
    }),
    bucket: need('BUCKET'),
  };
}

async function listAll(client, bucket, prefix) {
  const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
  const out = new Map();
  let token;
  do {
    const page = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token, MaxKeys: 1000 }));
    for (const o of page.Contents || []) out.set(o.Key, { key: o.Key, size: o.Size, lastModified: o.LastModified });
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return out;
}

async function getBuffer(client, bucket, key) {
  const { GetObjectCommand } = require('@aws-sdk/client-s3');
  const r = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const chunks = [];
  for await (const c of r.Body) chunks.push(c);
  return Buffer.concat(chunks);
}

const getJson = async (client, bucket, key) => JSON.parse((await getBuffer(client, bucket, key)).toString('utf8'));

async function putJson(client, bucket, key, value) {
  const { PutObjectCommand } = require('@aws-sdk/client-s3');
  await client.send(new PutObjectCommand({
    Bucket: bucket, Key: key,
    Body: Buffer.from(`${JSON.stringify(value, null, 2)}\n`, 'utf8'),
    ContentType: 'application/json',
  }));
}

/**
 * The live ledger, read straight from the database.
 *
 * `deletedAt`/`deletedByUserId` are the product's own record of a deliberate deletion, and the audit
 * action distinguishes WHY: `file_deleted` is a customer deleting their own file — privacy-
 * authoritative — while `report_artifact_retired` is the product superseding its own PDF, which is
 * operational housekeeping and must NOT be treated as erasure.
 */
const LEDGER_SQL = `
  select s.id, s."objectKey", s."sizeBytes"::text, s.sha256, s.category, s."parentType",
         s.status, to_char(s."deletedAt" at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"') as deleted_at,
         coalesce(s."organizationId"::text,'') as org, coalesce(s."ownerUserId"::text,'') as owner,
         coalesce((select a.action from security_audit_events a
                    where a."resourceType"='storage_object' and a."resourceId"=s.id
                      and a.action in ('file_deleted','report_artifact_retired')
                    order by a."createdAt" desc limit 1), '') as delete_action
  from storage_objects s
  order by s."objectKey"
`;

async function readLedger(psql, url) {
  const { stdout } = await execFileAsync(psql, ['-At', '-F', '', '-v', 'ON_ERROR_STOP=1', '-c', LEDGER_SQL], {
    encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, env: { ...process.env, ...connectionEnv(url) },
  });
  const rows = [];
  for (const line of stdout.split('\n').filter(Boolean)) {
    const [id, objectKey, sizeBytes, sha256, category, parentType, status, deletedAt, org, owner, deleteAction] = line.split('');
    rows.push({
      id, objectKey, sizeBytes: Number(sizeBytes), sha256, category, parentType, status,
      deletedAt: deletedAt || null, organizationId: org || null, ownerUserId: owner || null,
      deleteAction: deleteAction || null,
      live: status === 'ready' && !deletedAt,
      /**
       * PRIVACY-AUTHORITATIVE only when the customer deleted their own file. A retired report is the
       * product replacing its own artifact and carries no erasure intent whatsoever; treating it as
       * erasure would delete recovery copies during ordinary report regeneration.
       */
      erasureAuthorized: Boolean(deletedAt) && deleteAction === 'file_deleted',
    });
  }
  return rows;
}

// ---------------------------------------------------------------------------------------------------
// STATE MODEL. `UNKNOWN` is a real state with a real cause, and it never counts as a pass.
// ---------------------------------------------------------------------------------------------------
const STATES = [
  'LIVE_MATCHED',                    // live object present, bytes captured, digests agree
  'LIVE_UNBACKED',                   // live object present, no recovery generation yet
  'DIGEST_MISMATCH',                 // live bytes disagree with what the database recorded
  'MISSING_LIVE_RECOVERABLE',        // database says live, object gone, recovery copy exists
  'MISSING_LIVE_UNRECOVERABLE',      // database says live, object gone, NO recovery copy — already lost
  'MISSING_LIVE_ERASURE_AUTHORIZED', // gone because the customer erased it; must never be resurrected
  'RECOVERY_ONLY_EXPECTED',          // recovery generation whose live object is legitimately gone
  'RECOVERY_ONLY_SUSPECT',           // recovery bytes with no database row and no explanation
  'UNKNOWN',                         // could not determine — never a pass
];

function classify({ row, liveObject, generations, erased }) {
  if (erased) return 'MISSING_LIVE_ERASURE_AUTHORIZED';
  if (row && row.live) {
    if (!liveObject) return generations.length ? 'MISSING_LIVE_RECOVERABLE' : 'MISSING_LIVE_UNRECOVERABLE';
    if (liveObject.size !== row.sizeBytes) return 'DIGEST_MISMATCH';
    if (!generations.length) return 'LIVE_UNBACKED';
    return generations.some((g) => g.sha256 === row.sha256) ? 'LIVE_MATCHED' : 'DIGEST_MISMATCH';
  }
  if (row && !row.live) return generations.length ? 'RECOVERY_ONLY_EXPECTED' : 'MISSING_LIVE_ERASURE_AUTHORIZED';
  return 'RECOVERY_ONLY_SUSPECT';
}

async function main() {
  const argv = process.argv.slice(2);
  const apply = argv.includes('--apply');
  const jsonPath = argv.includes('--json') ? argv[argv.indexOf('--json') + 1] : null;
  const restoreId = argv.includes('--restore') ? argv[argv.indexOf('--restore') + 1] : null;

  const databaseUrl = process.env.EVIDENCE_DATABASE_URL || process.env.BACKUP_SOURCE_DATABASE_URL;
  if (!databaseUrl) throw new Error('Set EVIDENCE_DATABASE_URL (or BACKUP_SOURCE_DATABASE_URL).');

  const source = s3('EVIDENCE_SOURCE_S3_');
  const dest = s3('BACKUP_S3_');
  if (source.bucket === dest.bucket) {
    throw new Error('The evidence source bucket and the recovery bucket are the same. Recovery storage must be separate.');
  }

  const psql = resolvePsql();
  const startedAt = new Date();

  // ---- read all three authorities -----------------------------------------------------------------
  let ledger;
  let liveObjects;
  let recoveryObjects;
  try {
    ledger = await readLedger(psql, databaseUrl);
    liveObjects = await listAll(source.client, source.bucket, '');
    recoveryObjects = await listAll(dest.client, dest.bucket, `${PREFIX}/`);
  } catch (error) {
    process.stderr.write(`SCAN INCOMPLETE: ${error && error.message}\n`);
    process.stderr.write('Reporting UNKNOWN. An incomplete scan is never a pass, and nothing was changed.\n');
    if (jsonPath) fs.writeFileSync(jsonPath, `${JSON.stringify({ schema: SCHEMA, outcome: 'UNKNOWN', scanComplete: false, detail: String(error && error.message).slice(0, 300) }, null, 2)}\n`);
    process.exit(2);
  }

  // ---- the erasure ledger, which outranks the database --------------------------------------------
  const erasureKeys = [...recoveryObjects.keys()].filter((k) => k.startsWith(`${PREFIX}/erasure/`));
  const erased = new Map();
  for (const k of erasureKeys) {
    const id = path.basename(k, '.json');
    erased.set(id, await getJson(dest.client, dest.bucket, k));
  }

  // ---- captured generations, grouped by the database row they came from ---------------------------
  const generations = new Map();
  for (const k of [...recoveryObjects.keys()].filter((x) => x.startsWith(`${PREFIX}/generations/`) && x.endsWith('.json'))) {
    const id = k.split('/')[2];
    const manifest = await getJson(dest.client, dest.bucket, k);
    if (!generations.has(id)) generations.set(id, []);
    generations.get(id).push({ ...manifest, manifestKey: k });
  }
  for (const list of generations.values()) list.sort((a, b) => String(b.capturedAt).localeCompare(String(a.capturedAt)));

  // ---- restore, which is a decision rather than a reflex -------------------------------------------
  if (restoreId) {
    if (erased.has(restoreId)) {
      process.stdout.write(
        `REFUSED. ${restoreId} carries an authorized-erasure tombstone written ${erased.get(restoreId).erasedAt}.\n` +
        'A customer exercised a deletion right over this object. It is not restorable, and that remains\n' +
        'true after any database restore — the tombstone lives in recovery storage, not in the database.\n',
      );
      process.exit(1);
    }
    const list = generations.get(restoreId) || [];
    if (!list.length) { process.stdout.write(`No recovery generation exists for ${restoreId}.\n`); process.exit(1); }
    const newest = list[0];
    const bytes = await getBuffer(dest.client, dest.bucket, K.object(newest.sha256));
    const actual = createHash('sha256').update(bytes).digest('hex');
    if (actual !== newest.sha256) { process.stdout.write(`INTEGRITY FAILURE: recovery bytes hash ${actual}, manifest says ${newest.sha256}.\n`); process.exit(1); }
    const out = path.resolve(process.env.EVIDENCE_RESTORE_DIR || '.', `${restoreId}-${newest.sha256.slice(0, 12)}.bin`);
    fs.writeFileSync(out, bytes);
    process.stdout.write(
      `RESTORED to ${out}\n  sourceKey ${newest.sourceObjectKey}\n  sha256    ${actual}\n  bytes     ${bytes.length}\n` +
      `  capturedAt ${newest.capturedAt}\n\nThis writes a LOCAL FILE. Putting it back into ${source.bucket} is a separate,\n` +
      'deliberate act with the application credential — this tool holds only read access to the source.\n',
    );
    process.exit(0);
  }

  // ---- classify -----------------------------------------------------------------------------------
  const byKey = new Map(ledger.map((r) => [r.objectKey, r]));
  const findings = [];
  const counts = Object.fromEntries(STATES.map((s) => [s, 0]));

  for (const row of ledger) {
    const gens = generations.get(row.id) || [];
    const state = classify({ row, liveObject: liveObjects.get(row.objectKey), generations: gens, erased: erased.has(row.id) });
    counts[state] += 1;
    findings.push({ id: row.id, category: row.category, state, generations: gens.length, sourceObjectKey: row.objectKey });
  }
  // Recovery bytes with no database row at all.
  const knownDigests = new Set();
  for (const list of generations.values()) for (const g of list) knownDigests.add(g.sha256);
  for (const k of [...recoveryObjects.keys()].filter((x) => x.startsWith(`${PREFIX}/objects/`))) {
    const sha = path.basename(k);
    if (!knownDigests.has(sha)) { counts.RECOVERY_ONLY_SUSPECT += 1; findings.push({ id: null, state: 'RECOVERY_ONLY_SUSPECT', recoveryKey: k }); }
  }

  const line = (l, v) => process.stdout.write(`${l.padEnd(34)}${v}\n`);
  process.stdout.write(`source bucket     ${source.bucket}  (read-only)\nrecovery bucket   ${dest.bucket}/${PREFIX}/\n`);
  line('database rows', String(ledger.length));
  line('live objects', String(liveObjects.size));
  line('recovery objects', String(recoveryObjects.size));
  line('erasure tombstones', String(erased.size));
  process.stdout.write('\n');
  for (const s of STATES) if (counts[s]) line(s, String(counts[s]));

  // ---- apply --------------------------------------------------------------------------------------
  const actions = { captured: [], erasuresWritten: [], generationsExpired: [], bytesExpired: [] };
  if (apply) {
    const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

    // 1. capture anything live and not yet captured at its current digest
    for (const row of ledger) {
      if (!row.live || erased.has(row.id)) continue;
      const gens = generations.get(row.id) || [];
      if (gens.some((g) => g.sha256 === row.sha256)) continue;
      const liveObject = liveObjects.get(row.objectKey);
      if (!liveObject) continue;
      const bytes = await getBuffer(source.client, source.bucket, row.objectKey);
      const actual = createHash('sha256').update(bytes).digest('hex');
      const capturedAt = new Date().toISOString();
      // The bytes are stored under their OWN digest, whatever the database expected. A mismatch is
      // recorded in the manifest rather than silently reconciled: copying B into A's slot would make
      // the recovery copy agree with a defect.
      await dest.client.send(new PutObjectCommand({ Bucket: dest.bucket, Key: K.object(actual), Body: bytes, ContentType: 'application/octet-stream' }));
      const manifest = {
        schema: SCHEMA, capturedAt,
        storageObjectId: row.id, sourceBucket: source.bucket, sourceObjectKey: row.objectKey,
        sha256: actual, declaredSha256: row.sha256, digestAgrees: actual === row.sha256,
        sizeBytes: bytes.length, category: row.category, parentType: row.parentType,
        ownerScope: row.organizationId ? { kind: 'organization', id: row.organizationId } : { kind: 'user', id: row.ownerUserId },
        recoveryObjectKey: K.object(actual),
      };
      await putJson(dest.client, dest.bucket, K.generation(row.id, capturedAt, actual), manifest);
      actions.captured.push({ id: row.id, sha256: actual, digestAgrees: manifest.digestAgrees });
      if (!generations.has(row.id)) generations.set(row.id, []);
      generations.get(row.id).unshift(manifest);
    }

    // 2. propagate AUTHORIZED erasure — and only authorized erasure
    for (const row of ledger) {
      if (!row.erasureAuthorized || erased.has(row.id)) continue;
      const tombstone = {
        schema: SCHEMA, kind: 'authorized-erasure-tombstone',
        storageObjectId: row.id, erasedAt: row.deletedAt, observedAt: new Date().toISOString(),
        basis: `storage_objects.deletedAt set and security_audit_events.action='${row.deleteAction}'`,
        eligibleForByteDeletionAfter: new Date(Date.parse(row.deletedAt) + ERASURE_GRACE_HOURS * 3600000).toISOString(),
        note: 'Authoritative. Lives in recovery storage, NOT in the database, so it survives a database restore to a point before the erasure. No recovery procedure may resurrect this object.',
      };
      await putJson(dest.client, dest.bucket, K.erasure(row.id), tombstone);
      erased.set(row.id, tombstone);
      actions.erasuresWritten.push(row.id);
    }

    // 3. expire: erased objects past their grace period, and generations past the recovery window
    const now = Date.now();
    const retainedDigests = new Set();
    for (const [id, list] of generations) {
      for (const g of list) {
        const tomb = erased.get(id);
        const erasureDue = tomb && Date.parse(tomb.eligibleForByteDeletionAfter) <= now;
        const row = ledger.find((r) => r.id === id);
        const currentLiveGeneration = row && row.live && row.sha256 === g.sha256;
        const windowExpired = Date.parse(g.capturedAt) + GENERATION_WINDOW_DAYS * 86400000 <= now;
        // The generation that matches the CURRENT live object is the protection itself and is kept
        // while the object is live, whatever its capture age.
        const expire = erasureDue || (!currentLiveGeneration && windowExpired);
        if (expire) {
          await dest.client.send(new DeleteObjectCommand({ Bucket: dest.bucket, Key: g.manifestKey })).catch(() => undefined);
          actions.generationsExpired.push({ id, sha256: g.sha256, reason: erasureDue ? 'AUTHORIZED_ERASURE' : 'WINDOW_EXPIRED' });
        } else {
          retainedDigests.add(g.sha256);
        }
      }
    }
    // Content bytes go only when no retained generation still references that digest.
    for (const k of [...recoveryObjects.keys()].filter((x) => x.startsWith(`${PREFIX}/objects/`))) {
      const sha = path.basename(k);
      if (!retainedDigests.has(sha)) {
        await dest.client.send(new DeleteObjectCommand({ Bucket: dest.bucket, Key: k })).catch(() => undefined);
        actions.bytesExpired.push(sha);
      }
    }

    process.stdout.write('\n');
    line('captured', String(actions.captured.length));
    line('erasure tombstones written', String(actions.erasuresWritten.length));
    line('generations expired', String(actions.generationsExpired.length));
    line('recovery bytes expired', String(actions.bytesExpired.length));
  }

  // ---- freshness record ---------------------------------------------------------------------------
  const attention =
    counts.LIVE_UNBACKED + counts.DIGEST_MISMATCH + counts.MISSING_LIVE_RECOVERABLE +
    counts.MISSING_LIVE_UNRECOVERABLE + counts.RECOVERY_ONLY_SUSPECT + counts.UNKNOWN;
  const outcome = counts.UNKNOWN ? 'UNKNOWN' : attention === 0 ? 'PROTECTED' : 'ATTENTION_REQUIRED';

  if (apply) {
    await putJson(dest.client, dest.bucket, K.status, {
      schema: SCHEMA, lastReconciledAt: startedAt.toISOString(), outcome, counts,
      generationWindowDays: GENERATION_WINDOW_DAYS, erasureGraceHours: ERASURE_GRACE_HOURS,
      protectedObjects: counts.LIVE_MATCHED, erasureTombstones: erased.size,
    });
  }

  const summary = {
    schema: SCHEMA, checkedAt: startedAt.toISOString(), mode: apply ? 'APPLY' : 'REPORT',
    scanComplete: true, sourceBucket: source.bucket, recoveryBucket: dest.bucket, prefix: PREFIX,
    generationWindowDays: GENERATION_WINDOW_DAYS, erasureGraceHours: ERASURE_GRACE_HOURS,
    counts, findings, actions: apply ? actions : undefined, outcome,
  };
  if (jsonPath) fs.writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`);

  /**
   * MO-1. The payload carries COUNTS BY STATE and nothing else — no object key, no source key, no
   * download name, no customer or workspace identifier. A monitoring channel is not a place to leak
   * the names of a customer's evidence files, and the operator only needs to know that something
   * needs looking at and which class it is.
   */
  if (outcome !== 'PROTECTED' && process.env.OPERATIONAL_ALERT_WEBHOOK_URL) {
    try {
      const response = await fetch(process.env.OPERATIONAL_ALERT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          schema: SCHEMA,
          event: outcome === 'UNKNOWN' ? 'evidence.recovery_check_indeterminate' : 'evidence.recovery_attention_required',
          severity: 'error',
          occurredAt: new Date().toISOString(),
          summary: { outcome, counts },
        }),
        signal: AbortSignal.timeout(15000),
      });
      process.stderr.write(`alert dispatch: ${JSON.stringify({ dispatched: response.ok, status: response.status })}\n`);
    } catch (error) {
      process.stderr.write(`alert dispatch: ${JSON.stringify({ dispatched: false, reason: String(error && error.message).slice(0, 120) })}\n`);
    }
  }

  process.stdout.write(`\n${outcome}\n`);
  if (counts.MISSING_LIVE_UNRECOVERABLE) {
    process.stdout.write('MISSING_LIVE_UNRECOVERABLE means evidence is already gone with no recovery copy. Do not fabricate a replacement.\n');
  }
  process.exit(outcome === 'PROTECTED' ? 0 : outcome === 'UNKNOWN' ? 2 : 1);
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`\nEVIDENCE RECONCILIATION ABORTED: ${error && error.message}\n`);
    process.exit(2);
  });
}

module.exports = { STATES, classify, K, SCHEMA };
