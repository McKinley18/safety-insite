/**
 * KG-4E -- report-time provenance and the mixed-governed-state case, asserted against real rows.
 *
 * The PDF comparison shows the two reports read the same. This suite asks the question underneath
 * it: does the persisted record the report is derived FROM ever acquire governed provenance under
 * SHADOW -- including in the case KG-4A singled out as the hard one, where the internal shadow
 * comparison for ONE analysis saw several DIFFERENT governed states across its findings?
 *
 * The mixed case matters because the analysis-level rule is "governed if ANY finding consumed".
 * If a shadow comparison's observation of approved content were mistaken for consumption, an
 * analysis containing one approved-exact citation would flip the whole report to governed
 * provenance -- and it would do so most easily in exactly this mixed shape.
 *
 * READ-ONLY. No writes, no ownership claim.
 *
 * Env: DATABASE_URL, TELEMETRY (jsonl of kg4c.shadow-comparison.v2 events from the same run)
 */

import { readFileSync, existsSync } from 'node:fs';

const { Client } = require('pg') as { Client: new (o: { connectionString: string }) => any };

const DB = process.env.DATABASE_URL || '';
const TELEMETRY = process.env.TELEMETRY || '';

const checks: string[] = [];
const failures: string[] = [];
const check = (condition: unknown, message: string) =>
  condition ? checks.push(message) : failures.push(message);

async function main(): Promise<void> {
  if (!DB) throw new Error('DATABASE_URL is required');
  const client = new Client({ connectionString: DB });
  await client.connect();
  let q: (sql: string, params?: unknown[]) => Promise<any[]>;
  q = async (sql, params = []) => (await client.query(sql, params)).rows;

  try {
    // ------------------------------------------------------------ the environment is not vacuous
    const active = await q(`SELECT "releaseId" FROM regulatory_releases WHERE status = 'active'`);
    check(active.length === 1,
      'exactly one governed release is ACTIVE (' + (active[0]?.releaseId ?? 'none') + ') -- NULL provenance below is a decision, not an absence');
    const approvals = await q(
      `SELECT COUNT(*)::int AS n FROM regulatory_release_record_reviews WHERE decision = 'approved'`);
    check(Number(approvals[0]?.n) > 0,
      'approved governed content exists (' + approvals[0]?.n + ' approvals)');

    // ------------------------------------------------------------ provenance on every real row
    const analyses = await q(
      `SELECT COUNT(*)::int AS total, COUNT("knowledgeReleaseId")::int AS stamped FROM hazlenz_analyses`);
    check(Number(analyses[0]?.stamped) === 0,
      'HARD: 0 of ' + analyses[0]?.total + ' persisted analyses carry a governed release id');

    const findings = await q(
      `SELECT COUNT(*)::int AS total, COUNT("knowledgeReleaseId")::int AS stamped FROM inspection_findings`);
    check(Number(findings[0]?.stamped) === 0,
      'HARD: 0 of ' + findings[0]?.total + ' persisted findings carry a governed release id');

    // ------------------------------------------------------------ and in the FROZEN report snapshot
    const versions = await q(
      `SELECT id, "sourceSnapshot" FROM inspection_report_versions WHERE status = 'generated'`);
    check(versions.length > 0, 'generated report versions exist (' + versions.length + ')');

    let snapshotsCarryingTheColumn = 0;
    let provenanceBlocks = 0;
    let nonNullInSnapshot = 0;
    let releaseIdsNamed = 0;
    for (const version of versions) {
      const snapshot = version.sourceSnapshot || {};
      if (JSON.stringify(snapshot).includes('"knowledgeReleaseId"')) snapshotsCarryingTheColumn += 1;
      const provenance = snapshot.knowledgeProvenance;
      if (provenance) provenanceBlocks += 1;
      if (Array.isArray(provenance?.knowledgeReleaseIds) && provenance.knowledgeReleaseIds.length) {
        releaseIdsNamed += 1;
      }
      for (const observation of snapshot.observations || []) {
        for (const finding of observation.findings || []) {
          if (finding.knowledgeReleaseId) nonNullInSnapshot += 1;
        }
        for (const analysis of observation.analyses || []) {
          if (analysis.knowledgeReleaseId) nonNullInSnapshot += 1;
        }
      }
    }
    check(snapshotsCarryingTheColumn === versions.length,
      'every frozen report snapshot CARRIES the provenance column (' + snapshotsCarryingTheColumn +
      '/' + versions.length + ') -- the field is present and NULL, not missing');
    check(provenanceBlocks === versions.length,
      'every frozen report snapshot carries a knowledgeProvenance block (' + provenanceBlocks + '/' + versions.length + ')');
    check(nonNullInSnapshot === 0,
      'HARD: no finding or analysis inside any frozen report snapshot names a governed release (' + nonNullInSnapshot + ')');
    check(releaseIdsNamed === 0,
      'HARD: no report\'s knowledgeProvenance names a knowledge release (' + releaseIdsNamed + ' of ' + versions.length + ')');

    // ------------------------------------------------------------ THE MIXED CASE
    if (TELEMETRY && existsSync(TELEMETRY)) {
      const events = readFileSync(TELEMETRY, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
      const byCorrelation = new Map<string, any[]>();
      for (const event of events) {
        if (!byCorrelation.has(event.correlationId)) byCorrelation.set(event.correlationId, []);
        byCorrelation.get(event.correlationId)!.push(event);
      }
      const mixed = [...byCorrelation.entries()].filter(([, group]) =>
        new Set(group.map((e) => e.governedBackingState)).size > 1);
      check(mixed.length > 0,
        'at least one analysis produced MIXED internal governed states (' + mixed.length +
        ' of ' + byCorrelation.size + ' analyses)');
      for (const [correlationId, group] of mixed) {
        const states = [...new Set(group.map((e) => e.governedBackingState))].sort();
        const approvedPresent = states.includes('APPROVED_EXACT');
        check(group.every((e) => e.shadowProvenanceNull === true),
          'mixed analysis ' + correlationId.slice(0, 8) + ' [' + states.join('+') +
          '] recorded NULL customer provenance on every comparison');
        check(group.every((e) => e.customerOutputUnchanged === true &&
          e.outputInvarianceVerdict === 'INVARIANT'),
          'mixed analysis ' + correlationId.slice(0, 8) + ' left customer output invariant');
        check(group.every((e) => e.governedResolvedCitation === e.requestedCitation),
          'mixed analysis ' + correlationId.slice(0, 8) + ' substituted no citation');
        if (approvedPresent) {
          check(group.every((e) => e.fallbackState === 'LEGACY_TEXT_UNVERIFIED'),
            'mixed analysis ' + correlationId.slice(0, 8) +
            ' saw APPROVED_EXACT internally and STILL delivered legacy text for every citation');
        }
      }
      const anyApproved = events.filter((e) => e.governedBackingState === 'APPROVED_EXACT');
      check(anyApproved.length > 0,
        'the shadow saw APPROVED_EXACT governed content ' + anyApproved.length +
        ' times -- so "no governed text in the report" is a refusal, not an empty corpus');
      check(anyApproved.every((e) => e.fallbackState === 'LEGACY_TEXT_UNVERIFIED'),
        'HARD: not one APPROVED_EXACT comparison produced GOVERNED_VERIFIED_TEXT delivery in SHADOW');
    } else {
      failures.push('TELEMETRY file not found: ' + TELEMETRY);
    }
  } finally { await client.end(); }
}

main()
  .then(() => {
    console.log('');
    console.log('kg4e-report-provenance: ' + checks.length + ' passed, ' + failures.length + ' failed');
    for (const entry of checks) console.log('  ok  ' + entry);
    for (const entry of failures) console.error('  FAIL  ' + entry);
    if (failures.length) process.exitCode = 1;
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.stack || error.message : error);
    process.exitCode = 1;
  });
