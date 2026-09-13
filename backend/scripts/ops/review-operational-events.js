#!/usr/bin/env node
/**
 * §269 — THE OPERATOR REVIEW COMMAND FOR THE CONTROLLED BETA.
 *
 * ===============================================================================================
 * WHAT PROBLEM THIS SOLVES, AND WHAT IT DELIBERATELY DOES NOT CLAIM.
 *
 * §268 built the EMISSION layer: one structured JSON line per operationally meaningful event on the
 * `safety-insite.operational-event.v1` schema. §268 was explicit that emission is not monitoring,
 * and §269 is explicit that "logs existing somewhere" does not count unless they are practically
 * reviewable. The collector itself turned out not to be the gap — Render ingests this service's
 * stdout, retains it, and indexes it by level, type, path and status code, which §269 verified live
 * by inducing a production request and retrieving it by exact path seconds later.
 *
 * The gap §269 actually found was that reviewing it required an operator to know the Render CLI's
 * flags and to eyeball ANSI-coloured Nest output. That is the difference between "reviewable in
 * principle" and "reviewed in practice during a beta". This command closes that difference and
 * nothing more.
 *
 * IT IS NOT AN ALERTING SYSTEM. It is pull, not push. The push half for high-consequence failure is
 * Render's own service-failure notification (`notifyOnFail` on the service record). This is the
 * thing an operator RUNS — daily, and after any report of trouble — and the monitoring runbook
 * names it as exactly that.
 *
 * ===============================================================================================
 * WHY IT SHELLS OUT TO THE RENDER CLI.
 *
 * So that no Render credential is ever read, stored or referenced by anything in this repository.
 * The CLI holds the operator's own authenticated session; this script inherits it and never sees a
 * token. A script that took an API key as configuration would be a new secret to manage, and the
 * §269 constraint is that no bearer token reaches a repository file.
 *
 * Read-only: it issues log QUERIES. It cannot deploy, restart, migrate or change configuration.
 */
'use strict';

const { execFileSync } = require('node:child_process');

const SERVICE = process.env.SAFETY_INSITE_RENDER_SERVICE_ID || 'srv-d7kl74jeo5us73deaor0';
const SCHEMA = 'safety-insite.operational-event.v1';
const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');

const args = process.argv.slice(2);
const argOf = (name, fallback) => {
  const hit = args.find(a => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};
const SINCE = argOf('since', '24h');
const LIMIT = Number(argOf('limit', '500'));

function renderLogs(extra) {
  const argv = ['logs', '-r', SERVICE, '--limit', String(LIMIT), '--start', SINCE,
    '-o', 'json', '--confirm', ...extra];
  try {
    return execFileSync('render', argv, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  } catch (error) {
    const stderr = String(error.stderr || error.message);
    if (/token is expired|not logged in|Unauthorized/i.test(stderr)) {
      console.error('\nRender CLI is not authenticated. Run `render login`, then re-run this.\n');
      process.exit(2);
    }
    console.error(`\nRender log query failed:\n${stderr}\n`);
    process.exit(1);
  }
}

/** The CLI emits concatenated JSON objects rather than one array, so they are split structurally. */
function parseRecords(raw) {
  const out = [];
  let depth = 0; let start = -1; let inString = false; let escaped = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') { inString = true; continue; }
    if (c === '{') { if (depth === 0) start = i; depth++; continue; }
    if (c === '}') {
      depth--;
      if (depth === 0 && start >= 0) {
        try { out.push(JSON.parse(raw.slice(start, i + 1))); } catch { /* partial record */ }
        start = -1;
      }
    }
  }
  return out;
}

const labelsOf = record => Object.fromEntries((record.labels || []).map(l => [l.name, l.value]));
const strip = text => String(text || '').replace(ANSI, '');

function main() {
  console.log('\nSAFETY INSITE — OPERATIONAL EVENT REVIEW');
  console.log(`  service ${SERVICE}   window ${SINCE}   limit ${LIMIT}\n`);

  const records = parseRecords(renderLogs([])).filter(r => r.message);

  // ---------------------------------------------------------------- §268 structured events
  const events = [];
  for (const record of records) {
    const message = strip(record.message);
    if (!message.includes(SCHEMA)) continue;
    const brace = message.indexOf('{');
    if (brace < 0) continue;
    try {
      const parsed = JSON.parse(message.slice(brace));
      events.push({ at: record.timestamp, ...parsed });
    } catch { /* not a complete event line */ }
  }

  console.log('§268 STRUCTURED OPERATIONAL EVENTS\n');
  if (!events.length) {
    console.log('  none in this window.');
    console.log('  NOTE: the running production build emits these only once the §268 candidate is');
    console.log('        deployed. Absence here before that release is EXPECTED, not a healthy signal.\n');
  } else {
    const byEvent = new Map();
    for (const e of events) {
      const key = `${e.severity || '?'}  ${e.event || '?'}`;
      byEvent.set(key, (byEvent.get(key) || 0) + 1);
    }
    for (const [key, count] of [...byEvent].sort()) console.log(`  ${String(count).padStart(5)}  ${key}`);
    const loud = events.filter(e => e.severity === 'error');
    if (loud.length) {
      console.log('\n  MOST RECENT ERROR-SEVERITY EVENTS\n');
      for (const e of loud.slice(0, 10)) {
        console.log(`    ${e.at}  ${e.event}  ${JSON.stringify(e.metadata || {}).slice(0, 160)}`);
      }
    }
    console.log('');
  }

  // ---------------------------------------------------------------- platform-level failure signal
  const requests = records.filter(r => labelsOf(r).type === 'request');
  const byStatus = new Map();
  for (const r of requests) {
    const status = labelsOf(r).statusCode || '?';
    byStatus.set(status, (byStatus.get(status) || 0) + 1);
  }
  console.log('HTTP RESPONSE MIX (platform request log)\n');
  if (!byStatus.size) console.log('  no requests in this window.');
  for (const [status, count] of [...byStatus].sort()) {
    const flag = /^5/.test(status) ? '  <-- server-side failure' : '';
    console.log(`  ${String(count).padStart(5)}  ${status}${flag}`);
  }

  const appErrors = records.filter(r => labelsOf(r).type === 'app' && labelsOf(r).level === 'error');
  console.log(`\nAPPLICATION ERROR LINES: ${appErrors.length}\n`);
  for (const r of appErrors.slice(0, 15)) {
    console.log(`  ${r.timestamp}  ${strip(r.message).slice(0, 160)}`);
  }

  console.log(`\n  reviewed ${records.length} log record(s).`);
  console.log('  escalation path: docs/operations/MONITORING_AND_ALERTING.md\n');
}

main();
