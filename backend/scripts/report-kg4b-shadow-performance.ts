/**
 * KG-4B (Phase 17) -- what SHADOW actually costs.
 *
 * MEASURES THE SEAM, NOT THE MODEL. A full `classify()` is dominated by seconds of AI inference,
 * which would bury a millisecond-scale change in noise. What SHADOW adds is bounded and specific:
 * one active-pointer read per analysis, one governed resolution per DISTINCT citation, the
 * comparison classification, and the telemetry serialisation. Each is measured directly, at the
 * finding counts the brief names (1, 5, 10), plus a multi-hazard shape.
 *
 * THE TELEMETRY IS MEASURED SEPARATELY, because it is the part KG-4B adds over KG-4A and the part a
 * production-shadow decision would need to price: classification, the privacy guard, and JSON
 * serialisation of every event.
 *
 * QUERY COUNTS BY FINDING COUNT are counted, not estimated -- the DataSource logger is intercepted,
 * so an N+1 would show as a rising count rather than as a hunch.
 *
 * DATABASE: owns `test_kg4b_perf_run`, a read-only clone; drops it at the end.
 *
 * Usage:
 *   SOURCE_DB=test_kg4b_shadow_20260820 [REPORT_OUT=<file>] \
 *   npx ts-node scripts/report-kg4b-shadow-performance.ts
 */
import { execFileSync } from 'child_process';
import { writeFileSync } from 'fs';
import { userInfo } from 'os';
import { DataSource } from 'typeorm';
import { GovernedCutoverContext } from '../src/standards/cutover/governed-cutover-context';
import { pinGovernedRelease, resolveGoverned } from '../src/standards/cutover/governed-resolution';
import {
  classifyShadowComparison, buildShadowComparisonRecord, assertShadowEventPrivacySafe,
} from '../src/standards/cutover/shadow-comparison';

const USER = process.env.PGUSER || userInfo().username;
const HOST = '127.0.0.1';
const SOURCE_DB = process.env.SOURCE_DB || 'test_kg4b_shadow_20260820';
const OWNED = 'test_kg4b_perf_run';
const REPORT_OUT = process.env.REPORT_OUT || '';
const RUNS = Number(process.env.PERF_RUNS || 40);
const WARMUP = 5;

const ms = (start: bigint) => Number(process.hrtime.bigint() - start) / 1e6;
function stats(samples: number[]) {
  const sorted = [...samples].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  return {
    runs: sorted.length,
    meanMs: Number((sum / sorted.length).toFixed(4)),
    p50Ms: Number(sorted[Math.floor(sorted.length * 0.5)].toFixed(4)),
    p95Ms: Number(sorted[Math.floor(sorted.length * 0.95)].toFixed(4)),
    worstMs: Number(sorted[sorted.length - 1].toFixed(4)),
  };
}

async function main() {
  execFileSync('dropdb', ['-h', HOST, '-U', USER, '--if-exists', OWNED]);
  execFileSync('createdb', ['-h', HOST, '-U', USER, OWNED]);
  execFileSync('bash', ['-c', `pg_dump -h ${HOST} -U ${USER} ${SOURCE_DB} | psql -q -h ${HOST} -U ${USER} ${OWNED}`]);

  // Query counting: intercept the DataSource logger rather than estimating.
  let queryCount = 0;
  const ds = new DataSource({
    type: 'postgres', url: `postgresql://${USER}@${HOST}:5432/${OWNED}`,
    synchronize: false, logging: ['query'],
    logger: { logQuery: () => { queryCount++; }, logQueryError: () => {}, logQuerySlow: () => {},
      logSchemaBuild: () => {}, logMigration: () => {}, log: () => {} } as any,
  });
  await ds.initialize();

  const active = (await ds.query(`SELECT "releaseId" FROM regulatory_releases WHERE status='active' LIMIT 1`))[0]?.releaseId;
  if (!active) { console.error(`SOURCE_DB '${SOURCE_DB}' has no active release.`); process.exit(2); }

  const corpus: string[] = (await ds.query(
    `SELECT citation FROM regulatory_release_records WHERE "releaseId"=$1 ORDER BY citation LIMIT 6`, [active]))
    .map((r: any) => r.citation);

  const SHADOW_ENV = { GOVERNED_CUTOVER_MODE: 'SHADOW', GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: 'u' };
  const GOVERNED_ENV = { GOVERNED_CUTOVER_MODE: 'GOVERNED_WITH_FALLBACK', GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: 'u' };
  const principal = { userId: 'u' };

  const measure = async (label: string, run: () => Promise<unknown>) => {
    for (let i = 0; i < WARMUP; i++) await run();
    const samples: number[] = [];
    for (let i = 0; i < RUNS; i++) { const t = process.hrtime.bigint(); await run(); samples.push(ms(t)); }
    const s = stats(samples);
    console.log(`${label.padEnd(48)} mean=${String(s.meanMs).padStart(9)}  p50=${String(s.p50Ms).padStart(9)}  p95=${String(s.p95Ms).padStart(9)}  worst=${String(s.worstMs).padStart(9)}`);
    return { label, ...s };
  };

  /** One analysis of `findingCount` findings, each citing one regulation from the corpus. */
  const analysisOf = (findingCount: number) =>
    Array.from({ length: findingCount }, (_, i) => corpus[i % corpus.length]);

  console.log(`\nactive release: ${active}`);
  console.log(`runs: ${RUNS} (after ${WARMUP} warmups)\n`);

  const results: any[] = [];
  const queryCounts: Record<string, number> = {};

  for (const findingCount of [1, 5, 10]) {
    const citations = analysisOf(findingCount);
    const distinct = new Set(citations).size;

    results.push(await measure(`LEGACY   ${findingCount} findings (context never created)`, async () => {
      await GovernedCutoverContext.create({ dataSource: ds, principal, env: {} });
    }));

    results.push(await measure(`SHADOW   ${findingCount} findings (${distinct} distinct citations)`, async () => {
      const ctx = await GovernedCutoverContext.create({ dataSource: ds, principal, analysisTraceId: `perf-${findingCount}`, env: SHADOW_ENV });
      for (const citation of citations) {
        await ctx!.resolveStandard({
          citation, applicabilityStatus: 'SUPPORTED', findingKey: citation,
          legacyText: 'legacy body', legacyBackingState: 'UNAPPROVED_CONTENT',
          hazardFamily: 'perf', jurisdiction: 'osha_general_industry',
        });
      }
    }));

    results.push(await measure(`GOVERNED ${findingCount} findings (KG-4A comparison)`, async () => {
      const ctx = await GovernedCutoverContext.create({ dataSource: ds, principal, analysisTraceId: `perf-g-${findingCount}`, env: GOVERNED_ENV });
      for (const citation of citations) {
        await ctx!.resolveStandard({ citation, applicabilityStatus: 'SUPPORTED', findingKey: citation });
      }
    }));

    // Query count for the SHADOW shape, counted not estimated.
    queryCount = 0;
    const countCtx = await GovernedCutoverContext.create({ dataSource: ds, principal, analysisTraceId: `q-${findingCount}`, env: SHADOW_ENV });
    for (const citation of citations) {
      await countCtx!.resolveStandard({ citation, applicabilityStatus: 'SUPPORTED', findingKey: citation, legacyText: 'x' });
    }
    queryCounts[`shadow_${findingCount}_findings`] = queryCount;
    console.log(`         -> ${queryCount} database queries for ${findingCount} findings / ${distinct} distinct citations\n`);
  }

  // Multi-hazard shape: 10 findings over 6 distinct citations.
  const multi = Array.from({ length: 10 }, (_, i) => corpus[i % corpus.length]);
  results.push(await measure(`SHADOW   multi-hazard 10 findings / ${new Set(multi).size} distinct`, async () => {
    const ctx = await GovernedCutoverContext.create({ dataSource: ds, principal, analysisTraceId: 'perf-multi', env: SHADOW_ENV });
    for (const citation of multi) {
      await ctx!.resolveStandard({ citation, applicabilityStatus: 'SUPPORTED', findingKey: citation, legacyText: 'x' });
    }
  }));

  // ---------------------------------------------------------------- component costs
  console.log('\ncomponent costs (isolated):');
  const pin = await pinGovernedRelease(ds, 'SHADOW');
  results.push(await measure('  governed resolver — one citation', async () => {
    await resolveGoverned(ds, pin, corpus[0]);
  }));

  const sampleResolution = await resolveGoverned(ds, pin, corpus[0]);
  const comparisonInput = {
    governed: sampleResolution, legacyCitation: corpus[0], legacyText: 'legacy body',
    legacyBackingState: 'UNAPPROVED_CONTENT', applicability: 'SUPPORTED' as const,
  };
  results.push(await measure('  classification — one comparison', async () => {
    classifyShadowComparison(comparisonInput);
  }));
  results.push(await measure('  telemetry — build + guard + serialise', async () => {
    const record = buildShadowComparisonRecord({
      ...comparisonInput, correlationId: 'perf', findingKey: 'f', mode: 'SHADOW',
      fallbackState: 'LEGACY_TEXT_UNVERIFIED', customerOutputUnchanged: true,
    });
    assertShadowEventPrivacySafe(record as unknown as Record<string, unknown>);
    JSON.stringify(record);
  }));

  const byLabel = (needle: string) => results.find(r => r.label.includes(needle));
  const legacy10 = byLabel('LEGACY   10 findings')!;
  const shadow10 = byLabel('SHADOW   10 findings')!;
  const governed10 = byLabel('GOVERNED 10 findings')!;
  const telemetry = byLabel('telemetry')!;

  const summary = {
    shadowOverheadMsPerAnalysis10: Number((shadow10.meanMs - legacy10.meanMs).toFixed(4)),
    shadowOverheadMsPerFinding10: Number(((shadow10.meanMs - legacy10.meanMs) / 10).toFixed(4)),
    governedOverheadMsPerAnalysis10: Number((governed10.meanMs - legacy10.meanMs).toFixed(4)),
    shadowMinusGovernedMs10: Number((shadow10.meanMs - governed10.meanMs).toFixed(4)),
    telemetryMsPerEvent: telemetry.meanMs,
    telemetryMsPer10Events: Number((telemetry.meanMs * 10).toFixed(4)),
  };

  console.log('\nsummary:');
  console.log(`  SHADOW overhead, 10 findings      ${summary.shadowOverheadMsPerAnalysis10} ms/analysis (${summary.shadowOverheadMsPerFinding10} ms/finding)`);
  console.log(`  GOVERNED overhead, 10 findings    ${summary.governedOverheadMsPerAnalysis10} ms/analysis`);
  console.log(`  SHADOW cost above GOVERNED        ${summary.shadowMinusGovernedMs10} ms (the comparison + telemetry)`);
  console.log(`  telemetry per event               ${summary.telemetryMsPerEvent} ms`);
  console.log('\nquery counts (counted, not estimated):');
  for (const [key, count] of Object.entries(queryCounts)) console.log(`  ${key.padEnd(32)} ${count}`);

  const report = {
    generatedBy: 'report-kg4b-shadow-performance.ts',
    sourceDatabase: SOURCE_DB, activeRelease: active, runs: RUNS, warmup: WARMUP,
    measurements: results, summary, queryCounts,
    n1Absent: queryCounts['shadow_10_findings'] <= queryCounts['shadow_5_findings'] + 2,
  };
  if (REPORT_OUT) { writeFileSync(REPORT_OUT, JSON.stringify(report, null, 2)); console.log(`\nreport written: ${REPORT_OUT}`); }

  await ds.destroy();
  execFileSync('dropdb', ['-h', HOST, '-U', USER, '--if-exists', OWNED]);
}

main().catch(e => { console.error(e); process.exit(1); });
