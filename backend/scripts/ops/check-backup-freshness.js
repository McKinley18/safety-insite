#!/usr/bin/env node
/**
 * §311 / BR-5 — DID THE BACKUP ACTUALLY RUN?
 *
 * ===============================================================================================
 * THE FAILURE THIS EXISTS TO PREVENT.
 *
 * A scheduled backup that stops running is silent. Nothing throws, no customer notices, no page
 * goes red — the artifacts simply stop appearing, and the next time anyone looks is the morning
 * they need one. "Last backup: three weeks ago" is the characteristic way this control fails, and
 * it fails that way precisely because the thing that was supposed to notice was part of the job
 * that died.
 *
 * SO THIS IS DELIBERATELY NOT PART OF THE BACKUP JOB. It runs on its own schedule and asks the
 * destination a question the backup job cannot answer on its behalf: is the newest artifact there
 * recent enough? A backup job that never starts produces no log, no exit code and no alert. It
 * cannot, however, stop this check from observing that nothing has arrived.
 *
 * ===============================================================================================
 * WHY THE ANSWER IS NOT ON `/health`.
 *
 * §311 forbids publishing backup internals through the health endpoint, and §307 (`SE-17`) already
 * established the reason with a live defect: `/health/ready` is unauthenticated, and it had been
 * publishing the alerting policy — thresholds, windows and ceilings — to anyone who asked. Backup
 * timing is the same class of fact. Knowing when the backups run, how large they are and when the
 * window between them is widest is operational reconnaissance, and none of it helps a customer.
 *
 * The signal goes to the OPERATOR instead, by the two routes the operator already has: a non-zero
 * exit status for whatever schedules this, and a push to `OPERATIONAL_ALERT_WEBHOOK_URL` — the
 * existing MO-1 channel, already configured in production and already proven to reach a phone.
 *
 * ===============================================================================================
 * CONFIGURATION
 *
 *   BACKUP_S3_*                   as for backup-production-database.js
 *   BACKUP_MAX_AGE_HOURS          optional, default 36. A daily schedule with headroom for one
 *                                 missed run and a slow one, so a single blip is not an alert but
 *                                 two consecutive failures are.
 *   OPERATIONAL_ALERT_WEBHOOK_URL optional. Where a STALE or MISSING verdict is pushed.
 *
 * Exit codes: 0 fresh, 1 stale or missing or unreadable.
 */

'use strict';

const ARTIFACT_SCHEMA = 'safety-insite.database-backup.v1';

function requiredEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) throw new Error(`${name} is not set.`);
  return value.trim();
}

async function readStatus() {
  const { S3Client, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
  const client = new S3Client({
    region: process.env.BACKUP_S3_REGION || 'auto',
    endpoint: requiredEnv('BACKUP_S3_ENDPOINT'),
    forcePathStyle: process.env.BACKUP_S3_FORCE_PATH_STYLE === 'true',
    credentials: {
      accessKeyId: requiredEnv('BACKUP_S3_ACCESS_KEY_ID'),
      secretAccessKey: requiredEnv('BACKUP_S3_SECRET_ACCESS_KEY'),
    },
  });
  const bucket = requiredEnv('BACKUP_S3_BUCKET');
  const prefix = (process.env.BACKUP_S3_PREFIX || 'postgres').replace(/\/+$/, '');

  let status;
  try {
    const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: `${prefix}/latest.json` }));
    status = JSON.parse(await response.Body.transformToString());
  } catch (error) {
    /**
     * "There is no backup" and "I could not find out" are DIFFERENT FACTS and §311A requires them to
     * stay different. Only a genuine key-not-found means the record is absent. A 403, a DNS failure,
     * an expired token, a wrong endpoint or a timeout all mean the monitor is BLIND — and a blind
     * monitor reporting MISSING would send someone hunting for a backup job that is working fine,
     * while a blind monitor reporting healthy would be worse still.
     *
     * Both exit non-zero. Neither is ever PASS.
     */
    const absent = error.name === 'NoSuchKey' || error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404;
    if (absent) {
      return { verdict: 'MISSING', detail: `No freshness record at ${prefix}/latest.json.`, bucket, prefix };
    }
    return {
      verdict: 'UNKNOWN',
      detail:
        `Could not read ${prefix}/latest.json — ${error.name}` +
        (error.$metadata?.httpStatusCode ? ` (HTTP ${error.$metadata.httpStatusCode})` : '') +
        '. This is NOT evidence that a backup is missing; it is evidence that the check cannot see the destination.',
      bucket,
      prefix,
    };
  }

  if (status.schema !== ARTIFACT_SCHEMA) {
    // Something is at the key, but this code cannot interpret it. Unreadable is not absent.
    return { verdict: 'UNKNOWN', detail: `Freshness record carries an unexpected schema: ${status.schema}`, bucket, prefix };
  }

  /**
   * The record says a backup succeeded. That is a claim made by the job that wrote it, so it is
   * checked rather than believed: the artifact it names must still EXIST and still be the SIZE it
   * recorded. A retention pass with a bad cutoff, or a destination that quietly dropped the object,
   * both produce a confident `latest.json` pointing at nothing.
   */
  let artifact = { present: false };
  try {
    const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: status.lastSuccessArtifactKey }));
    artifact = { present: true, bytes: head.ContentLength, matchesRecordedSize: head.ContentLength === status.lastSuccessBytes };
  } catch (error) {
    // Same distinction as above: a 404 proves the artifact is gone; anything else proves only that
    // this check could not look.
    const absent = error.name === 'NotFound' || error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404;
    artifact = { present: false, indeterminate: !absent, detail: error.name };
  }

  return { verdict: 'READ', status, artifact, bucket, prefix };
}

async function push(payload) {
  const url = process.env.OPERATIONAL_ALERT_WEBHOOK_URL;
  if (!url) return { dispatched: false, reason: 'NOT_CONFIGURED' };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
    return { dispatched: response.ok, status: response.status };
  } catch (error) {
    return { dispatched: false, reason: String(error && error.message).slice(0, 200) };
  }
}

async function main() {
  const maxAgeHours = Number(process.env.BACKUP_MAX_AGE_HOURS || 36);
  const read = await readStatus();
  const now = new Date();

  let verdict;
  let detail;
  let ageHours = null;

  if (read.verdict === 'MISSING' || read.verdict === 'UNKNOWN') {
    verdict = read.verdict;
    detail = read.detail;
  } else {
    const lastSuccess = new Date(read.status.lastSuccessAt);
    ageHours = (now.getTime() - lastSuccess.getTime()) / 3600000;
    if (read.artifact.indeterminate) {
      verdict = 'UNKNOWN';
      detail = `Could not determine whether ${read.status.lastSuccessArtifactKey} is present (${read.artifact.detail}). The record itself was readable.`;
    } else if (!read.artifact.present) {
      verdict = 'ARTIFACT_ABSENT';
      detail = `The freshness record names ${read.status.lastSuccessArtifactKey}, which is not in the bucket (${read.artifact.detail}).`;
    } else if (!read.artifact.matchesRecordedSize) {
      verdict = 'ARTIFACT_ALTERED';
      detail = `${read.status.lastSuccessArtifactKey} is ${read.artifact.bytes} bytes; the record says ${read.status.lastSuccessBytes}.`;
    } else if (ageHours > maxAgeHours) {
      verdict = 'STALE';
      detail = `The last successful backup was ${ageHours.toFixed(1)}h ago, past the ${maxAgeHours}h threshold.`;
    } else {
      verdict = 'FRESH';
      detail = `Last successful backup ${ageHours.toFixed(1)}h ago.`;
    }
  }

  /**
   * The four-state operator vocabulary §311A asks for, alongside the precise verdict that produced
   * it. The mapping is deliberately explicit rather than implied, because the one rule that matters
   * is that UNKNOWN NEVER BECOMES HEALTHY: a check that cannot see the destination has not verified
   * anything, and the only safe report is that it does not know.
   */
  const HEALTH = {
    FRESH: 'HEALTHY',
    STALE: 'STALE',
    MISSING: 'FAILED',
    ARTIFACT_ABSENT: 'FAILED',
    ARTIFACT_ALTERED: 'FAILED',
    UNKNOWN: 'UNKNOWN',
  };
  const health = HEALTH[verdict] || 'UNKNOWN';

  const report = {
    checkedAt: now.toISOString(),
    health,
    verdict,
    detail,
    ageHours: ageHours === null ? null : Number(ageHours.toFixed(2)),
    thresholdHours: maxAgeHours,
    lastSuccessAt: read.status ? read.status.lastSuccessAt : null,
    lastSuccessArtifactKey: read.status ? read.status.lastSuccessArtifactKey : null,
    lastSuccessSha256: read.status ? read.status.lastSuccessSha256 : null,
    lastSuccessSchemaHead: read.status ? read.status.lastSuccessSchemaHead : null,
    retainedArtifactCount: read.status ? read.status.retainedArtifactCount : null,
    artifactPresent: read.artifact ? read.artifact.present : false,
  };

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

  // Only HEALTHY exits 0. STALE, FAILED and UNKNOWN all alert and all exit non-zero — an UNKNOWN
  // that exited 0 would be a monitor reporting success because it could not look.
  if (health !== 'HEALTHY') {
    const alert = await push({
      schema: ARTIFACT_SCHEMA,
      event: health === 'UNKNOWN' ? 'database.backup_check_indeterminate' : 'database.backup_stale',
      severity: 'error',
      occurredAt: now.toISOString(),
      summary: { health, verdict, detail, ageHours: report.ageHours, thresholdHours: maxAgeHours },
    });
    process.stderr.write(`alert dispatch: ${JSON.stringify(alert)}\n`);
    process.exit(1);
  }
  process.exit(0);
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`FRESHNESS CHECK ABORTED: ${error && error.message}\n`);
    process.exit(1);
  });
}
