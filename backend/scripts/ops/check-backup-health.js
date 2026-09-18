#!/usr/bin/env node
/**
 * §312A / BR-5 — AGGREGATE BACKUP HEALTH.
 *
 * =====================================================================================================
 * THE QUESTION THIS ANSWERS, AND WHY IT NEEDED ITS OWN COMMAND.
 *
 * "Is the backup working?" has two halves, and after §312 they can disagree. The database half can be
 * perfectly healthy while customer evidence is not protected at all — that was literally the state
 * between §311A and §312A, and the scheduled run exited 0 the whole time because the database backup
 * had succeeded.
 *
 * A green light that means "half of your recovery posture is fine" is worse than no light. So the
 * aggregate is defined explicitly:
 *
 *   database HEALTHY + evidence PROTECTED + integrity INTEGRITY_HOLDS -> HEALTHY   (exit 0)
 *   database HEALTHY + evidence NOT_ACTIVATED                         -> DEGRADED  (exit 1)
 *   database HEALTHY + evidence ATTENTION_REQUIRED                    -> DEGRADED  (exit 1)
 *   integrity anything but INTEGRITY_HOLDS                            -> DEGRADED  (exit 1)
 *   any half FAILED                                                   -> FAILED    (exit 1)
 *   any half UNKNOWN (and none FAILED)                                -> UNKNOWN   (exit 2)
 *
 * =====================================================================================================
 * §315 / BR-9 — THE THIRD HALF, AND WHY TWO WERE NOT ENOUGH.
 *
 * BR-9 was the finding that neither of the first two halves independently hashes live bytes. The
 * database half asks whether a dump exists and is fresh. The evidence half asks whether the bucket and
 * the ledger agree about WHICH objects exist, comparing listed SIZES and recovery-generation digests —
 * so two payloads of equal length and different content look identical to it. Both could be green
 * while a live evidence object silently held the wrong bytes.
 *
 * The integrity half closes that by COMPOSING the already-proven §314 gate rather than reimplementing
 * hashing here: verify-evidence-digest-integrity.js reads and SHA-256 hashes every live authoritative
 * object and has no shallow mode. It is run as a child process for the same reason the other two are —
 * it keeps its own exit semantics and cannot silently change this one's verdict by throwing.
 *
 * INTEGRITY FAILURE CANNOT BE OFFSET. There is no branch in which a healthy backup or an available
 * recovery copy converts an integrity failure into success. Recovery being available is a reason the
 * damage is survivable; it is not a reason the damage did not happen.
 *
 * NOT_ACTIVATED IS NOT HEALTHY. An evidence half that was never configured is not a passing state; it
 * is an unprotected one, and it is reported as DEGRADED rather than skipped.
 *
 * UNKNOWN NEVER BECOMES PASS. A half that could not be determined is not a half that is fine. FAILED
 * outranks UNKNOWN, because a known failure is more actionable than an indeterminate one.
 *
 * =====================================================================================================
 * USAGE
 *
 *   node scripts/ops/check-backup-health.js [--json <path>]
 *
 * It runs the two existing checks as CHILD PROCESSES rather than importing them, so each keeps its own
 * exit semantics and neither can silently change this one's verdict by throwing.
 */

'use strict';

const { execFile } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

const SCHEMA = 'safety-insite.backup-health.v1';

async function run(script, args = []) {
  const file = path.join(__dirname, script);
  try {
    const { stdout } = await execFileAsync(process.execPath, [file, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    return { code: 0, stdout };
  } catch (error) {
    return { code: typeof error.code === 'number' ? error.code : 1, stdout: error.stdout || '', stderr: error.stderr || '' };
  }
}

async function databaseHalf(tmp) {
  const out = await run('check-backup-freshness.js');
  let report = null;
  try { report = JSON.parse(out.stdout); } catch { /* the check prints JSON; if it did not, treat as UNKNOWN */ }
  if (!report) return { half: 'database', state: 'UNKNOWN', detail: 'The freshness check produced no parseable report.' };
  return { half: 'database', state: report.health, verdict: report.verdict, detail: report.detail, ageHours: report.ageHours };
}

async function evidenceHalf(tmp) {
  // NOT_ACTIVATED is determined BEFORE running anything: an unconfigured source is a posture, not an error.
  if (!process.env.EVIDENCE_SOURCE_S3_ACCESS_KEY_ID) {
    return { half: 'evidence', state: 'NOT_ACTIVATED', detail: 'EVIDENCE_SOURCE_S3_* is not configured, so customer evidence is not being protected.' };
  }
  const jsonPath = path.join(tmp, `evidence-health-${process.pid}.json`);
  const out = await run('reconcile-evidence-recovery.js', ['--json', jsonPath]);
  let report = null;
  try { report = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); } catch { /* fall through */ }
  fs.rmSync(jsonPath, { force: true });
  if (!report) return { half: 'evidence', state: 'UNKNOWN', detail: 'The evidence reconciliation produced no parseable report.' };
  const state =
    report.outcome === 'PROTECTED' ? 'PROTECTED'
      : report.outcome === 'UNKNOWN' ? 'UNKNOWN'
        : 'ATTENTION_REQUIRED';
  return { half: 'evidence', state, counts: report.counts, detail: report.outcome };
}

/**
 * §315 / BR-9. The live-byte integrity half.
 *
 * `--integrity-report <path>` lets the SCHEDULED runner hand over a report the gate already produced
 * earlier in the same run, so the population is hashed ONCE per run rather than twice. The report is
 * not trusted blindly: it must parse, carry the expected schema, and be NEWER than the timestamp the
 * caller vouches for with `--integrity-not-before`. A missing, stale, malformed or foreign report is
 * INTEGRITY_UNKNOWN, never a pass — the one reading that makes handing over a file safe.
 *
 * With no report handed over (a direct operator invocation), the gate is simply run here.
 */
async function integrityHalf(tmp, reportPath, notBefore) {
  if (!process.env.EVIDENCE_SOURCE_S3_ACCESS_KEY_ID) {
    return { half: 'integrity', state: 'NOT_ACTIVATED', detail: 'EVIDENCE_SOURCE_S3_* is not configured, so live bytes are not being verified.' };
  }

  const readReport = (file) => {
    const report = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (report.schema !== 'safety-insite.evidence-digest-integrity.v1') throw new Error('foreign schema');
    return report;
  };

  let report = null;
  if (reportPath) {
    try {
      const candidate = readReport(reportPath);
      const checkedAt = Date.parse(candidate.checkedAt);
      if (!Number.isFinite(checkedAt)) throw new Error('unparseable checkedAt');
      if (notBefore && checkedAt < notBefore) throw new Error('report predates this run');
      report = candidate;
    } catch (error) {
      return {
        half: 'integrity',
        state: 'INTEGRITY_UNKNOWN',
        detail: `The handed-over integrity report could not be used (${String(error && error.message).slice(0, 80)}).`,
      };
    }
  } else {
    const jsonPath = path.join(tmp, `evidence-integrity-${process.pid}.json`);
    await run('verify-evidence-digest-integrity.js', ['--json', jsonPath]);
    try { report = readReport(jsonPath); } catch { /* fall through to UNKNOWN */ }
    fs.rmSync(jsonPath, { force: true });
    if (!report) return { half: 'integrity', state: 'INTEGRITY_UNKNOWN', detail: 'The integrity gate produced no parseable report.' };
  }

  // The gate names its own state. Anything unrecognised is UNKNOWN rather than assumed benign.
  const state = typeof report.integrityState === 'string' && report.integrityState.length
    ? report.integrityState
    : 'INTEGRITY_UNKNOWN';
  // A report that says it did not finish cannot hold, whatever else it says.
  const effective = report.scanComplete === false && state === 'INTEGRITY_HOLDS' ? 'INTEGRITY_UNKNOWN' : state;
  return { half: 'integrity', state: effective, counts: report.counts, metrics: report.metrics, detail: report.outcome };
}

function aggregate(dbState, evState, integrityState) {
  if (dbState === 'FAILED' || evState === 'FAILED' || integrityState === 'FAILED') return 'FAILED';
  // §315. An indeterminate integrity result is UNKNOWN, exactly like an indeterminate half elsewhere.
  if (dbState === 'UNKNOWN' || evState === 'UNKNOWN'
      || integrityState === 'UNKNOWN' || integrityState === 'INTEGRITY_UNKNOWN'
      || integrityState === 'SOURCE_UNAVAILABLE' || integrityState === 'INCOMPLETE_SCAN') return 'UNKNOWN';
  // §315. HEALTHY requires all THREE. There is deliberately no clause by which a healthy backup or an
  // available recovery generation can offset live bytes that do not match their recorded digest.
  if (dbState === 'HEALTHY' && evState === 'PROTECTED' && integrityState === 'INTEGRITY_HOLDS') return 'HEALTHY';
  return 'DEGRADED';
}

async function main() {
  const argv = process.argv.slice(2);
  const jsonPath = argv.includes('--json') ? argv[argv.indexOf('--json') + 1] : null;
  const tmp = process.env.TMPDIR || '/tmp';

  const reportPath = argv.includes('--integrity-report') ? argv[argv.indexOf('--integrity-report') + 1] : null;
  const notBeforeRaw = argv.includes('--integrity-not-before') ? argv[argv.indexOf('--integrity-not-before') + 1] : null;
  const notBefore = notBeforeRaw ? Date.parse(notBeforeRaw) : null;

  const [db, ev, integrity] = await Promise.all([
    databaseHalf(tmp),
    evidenceHalf(tmp),
    integrityHalf(tmp, reportPath, Number.isFinite(notBefore) ? notBefore : null),
  ]);
  const overall = aggregate(db.state, ev.state, integrity.state);

  const pad = (l, v) => process.stdout.write(`${l.padEnd(22)}${v}\n`);
  pad('database half', `${db.state}${db.verdict && db.verdict !== db.state ? ` (${db.verdict})` : ''}`);
  if (db.detail) process.stdout.write(`                      ${db.detail}\n`);
  pad('evidence half', ev.state);
  if (ev.counts) {
    const interesting = Object.entries(ev.counts).filter(([, n]) => n > 0).map(([k, n]) => `${k}=${n}`);
    if (interesting.length) process.stdout.write(`                      ${interesting.join(' ')}\n`);
  } else if (ev.detail) process.stdout.write(`                      ${ev.detail}\n`);
  pad('integrity half', integrity.state);
  if (integrity.counts) {
    const interesting = Object.entries(integrity.counts).filter(([, n]) => n > 0).map(([k, n]) => `${k}=${n}`);
    if (interesting.length) process.stdout.write(`                      ${interesting.join(' ')}\n`);
  }
  if (integrity.metrics) {
    const m = integrity.metrics;
    process.stdout.write(`                      hashed ${m.objectsHashed} objects, ${m.bytesRead} bytes, ${m.runtimeMs} ms\n`);
  } else if (integrity.detail) process.stdout.write(`                      ${integrity.detail}\n`);
  process.stdout.write('\n');
  pad('AGGREGATE', overall);

  const report = { schema: SCHEMA, checkedAt: new Date().toISOString(), overall, database: db, evidence: ev, integrity };
  if (jsonPath) fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);

  if (overall !== 'HEALTHY' && process.env.OPERATIONAL_ALERT_WEBHOOK_URL) {
    // Counts and states only — never an object key, a source key or a customer identifier.
    try {
      const response = await fetch(process.env.OPERATIONAL_ALERT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          schema: SCHEMA,
          event: overall === 'UNKNOWN' ? 'backup.health_indeterminate' : 'backup.health_degraded',
          failureCategory: integrity.state && integrity.state !== 'INTEGRITY_HOLDS' && integrity.state !== 'NOT_ACTIVATED'
            ? `EVIDENCE_${integrity.state}` : (db.state !== 'HEALTHY' ? `DATABASE_${db.state}` : `RECOVERY_${ev.state}`),
          severity: 'error',
          occurredAt: new Date().toISOString(),
          /**
           * §315. STATES AND COUNTS ONLY. An operator needs to know WHICH failure class fired and how
           * many objects are in it; nothing here carries an object key, a digest, a download name, a
           * signed URL or a customer identifier, and the integrity counts are class totals rather than
           * a list of affected objects.
           */
          summary: {
            overall,
            database: db.state,
            evidence: ev.state,
            evidenceCounts: ev.counts,
            integrity: integrity.state,
            integrityCounts: integrity.counts,
          },
        }),
        signal: AbortSignal.timeout(15000),
      });
      process.stderr.write(`alert dispatch: ${JSON.stringify({ dispatched: response.ok, status: response.status })}\n`);
    } catch (error) {
      process.stderr.write(`alert dispatch: ${JSON.stringify({ dispatched: false, reason: String(error && error.message).slice(0, 120) })}\n`);
    }
  }

  process.exit(overall === 'HEALTHY' ? 0 : overall === 'UNKNOWN' ? 2 : 1);
}

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`AGGREGATE HEALTH CHECK ABORTED: ${error && error.message}\n`);
    process.exit(2);
  });
}

module.exports = { aggregate, SCHEMA };
