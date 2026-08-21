/**
 * KG-4A (Phase 19) -- the latency governed resolution actually adds.
 *
 * MEASURES THE SEAM, NOT THE MODEL. A full `classify()` is dominated by AI inference, which varies
 * by seconds and would bury a millisecond-scale change in noise. What KG-4A adds is bounded and
 * specific: one active-pointer read per analysis, plus one governed resolution per DISTINCT
 * citation, plus the provenance write. Those are measured directly, at realistic multi-finding
 * sizes, so the number means something.
 *
 * THE N+1 QUESTION the brief asks about is answered structurally as well as numerically: the
 * context memoises per citation and pins the release ONCE, so a 10-finding analysis citing 4
 * distinct regulations performs 1 pointer read and 4 resolutions -- not 10 pointer reads and 10
 * resolutions. Both shapes are measured below so the difference is visible rather than asserted.
 *
 * DATABASE: read-only clone, owned and dropped by this script.
 *
 * Usage: SOURCE_DB=test_kg4a_e2e_20260820 npx ts-node scripts/report-kg4a-performance.ts
 */
import { execFileSync } from 'child_process';
import { writeFileSync } from 'fs';
import { userInfo } from 'os';
import { DataSource } from 'typeorm';
import { GovernedCutoverContext } from '../src/standards/cutover/governed-cutover-context';
import { pinGovernedRelease, resolveGoverned } from '../src/standards/cutover/governed-resolution';

const USER = process.env.PGUSER || userInfo().username;
const HOST = '127.0.0.1';
const SOURCE_DB = process.env.SOURCE_DB || 'test_kg4a_e2e_20260820';
const OWNED = 'test_kg4a_perf_run';

const ms = (start: bigint) => Number(process.hrtime.bigint() - start) / 1e6;
function stats(samples: number[]) {
  const sorted = [...samples].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  return {
    runs: sorted.length,
    meanMs: Number((sum / sorted.length).toFixed(3)),
    p50Ms: Number(sorted[Math.floor(sorted.length * 0.5)].toFixed(3)),
    p95Ms: Number(sorted[Math.floor(sorted.length * 0.95)].toFixed(3)),
    maxMs: Number(sorted[sorted.length - 1].toFixed(3)),
  };
}

async function main() {
  execFileSync('dropdb', ['-h', HOST, '-U', USER, '--if-exists', OWNED]);
  execFileSync('createdb', ['-h', HOST, '-U', USER, OWNED]);
  execFileSync('bash', ['-c', `pg_dump -h ${HOST} -U ${USER} ${SOURCE_DB} | psql -q -h ${HOST} -U ${USER} ${OWNED}`]);
  const ds = new DataSource({ type: 'postgres', url: `postgresql://${USER}@${HOST}:5432/${OWNED}`, synchronize: false, logging: false });
  await ds.initialize();

  const active = (await ds.query(`SELECT "releaseId" FROM regulatory_releases WHERE status='active' LIMIT 1`))[0]?.releaseId;
  if (!active) { console.error(`SOURCE_DB '${SOURCE_DB}' has no active release; cannot measure governed resolution.`); process.exit(2); }

  // A realistic multi-finding analysis: 10 findings drawn from 4 distinct citations, which is the
  // shape a decomposed observation actually produces.
  const corpus: string[] = (await ds.query(
    `SELECT citation FROM regulatory_release_records WHERE "releaseId"=$1 ORDER BY citation LIMIT 4`, [active]))
    .map((r: any) => r.citation);
  const findings = Array.from({ length: 10 }, (_, i) => corpus[i % corpus.length]);
  const RUNS = 40;
  const WARMUP = 5;

  const measure = async (label: string, run: () => Promise<unknown>) => {
    for (let i = 0; i < WARMUP; i++) await run();
    const samples: number[] = [];
    for (let i = 0; i < RUNS; i++) { const t = process.hrtime.bigint(); await run(); samples.push(ms(t)); }
    const s = stats(samples);
    console.log(`${label.padEnd(52)} mean=${String(s.meanMs).padStart(8)}ms  p50=${String(s.p50Ms).padStart(8)}ms  p95=${String(s.p95Ms).padStart(8)}ms`);
    return { label, ...s };
  };

  console.log(`\nactive release: ${active}`);
  console.log(`analysis shape: ${findings.length} findings over ${corpus.length} distinct citations\n`);

  const results: any[] = [];

  // LEGACY: the context is never created, so the whole subsystem costs one function call.
  results.push(await measure('LEGACY  — per analysis (context never created)', async () => {
    await GovernedCutoverContext.create({ dataSource: ds, principal: { userId: 'u' }, env: {} });
  }));

  const governedEnv = { GOVERNED_CUTOVER_MODE: 'GOVERNED_WITH_FALLBACK', GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: 'u' };
  const shadowEnv = { GOVERNED_CUTOVER_MODE: 'SHADOW', GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: 'u' };

  results.push(await measure('GOVERNED — release pin only (once per analysis)', async () => {
    await pinGovernedRelease(ds, 'GOVERNED_WITH_FALLBACK');
  }));

  results.push(await measure('GOVERNED — full analysis, memoised (as shipped)', async () => {
    const ctx = await GovernedCutoverContext.create({ dataSource: ds, principal: { userId: 'u' }, env: governedEnv });
    for (const citation of findings) await ctx!.resolveStandard({ citation, applicabilityStatus: 'SUPPORTED', findingKey: citation });
  }));

  results.push(await measure('SHADOW   — full analysis (customer gets legacy)', async () => {
    const ctx = await GovernedCutoverContext.create({ dataSource: ds, principal: { userId: 'u' }, env: shadowEnv });
    for (const citation of findings) await ctx!.resolveStandard({ citation, applicabilityStatus: 'SUPPORTED', findingKey: citation, legacyText: 'x' });
  }));

  // The N+1 shape KG-4A deliberately avoids: pointer read + resolution per finding, no memo.
  results.push(await measure('N+1 SHAPE (rejected) — pin + resolve per finding', async () => {
    for (const citation of findings) {
      const pin = await pinGovernedRelease(ds, 'GOVERNED_WITH_FALLBACK');
      await resolveGoverned(ds, pin, citation);
    }
  }));

  const legacy = results[0], governed = results[2], shadow = results[3], naive = results[4];
  const overhead = Number((governed.meanMs - legacy.meanMs).toFixed(3));
  const shadowOverhead = Number((shadow.meanMs - legacy.meanMs).toFixed(3));
  const avoided = Number((naive.meanMs - governed.meanMs).toFixed(3));

  console.log(`\n  governed overhead per analysis : ${overhead} ms  (${(overhead / findings.length).toFixed(3)} ms per finding)`);
  console.log(`  shadow   overhead per analysis : ${shadowOverhead} ms`);
  console.log(`  avoided by pinning + memoising : ${avoided} ms  (${naive.meanMs > 0 ? ((avoided / naive.meanMs) * 100).toFixed(1) : '0'}% of the naive shape)`);

  // A distinct-citation count proves the memo, independently of timing.
  const ctx = await GovernedCutoverContext.create({ dataSource: ds, principal: { userId: 'u' }, env: governedEnv });
  for (const citation of findings) await ctx!.resolveStandard({ citation, applicabilityStatus: 'SUPPORTED', findingKey: citation });
  console.log(`\n  ${findings.length} findings resolved -> ${ctx!.resolvedCitationCount()} distinct governed lookups (memo working: ${ctx!.resolvedCitationCount() === corpus.length})`);

  const report = {
    generatedBy: 'report-kg4a-performance.ts',
    sourceDatabase: SOURCE_DB, activeRelease: active,
    analysisShape: { findings: findings.length, distinctCitations: corpus.length },
    runs: RUNS, warmup: WARMUP,
    measurements: results,
    governedOverheadMsPerAnalysis: overhead,
    governedOverheadMsPerFinding: Number((overhead / findings.length).toFixed(3)),
    shadowOverheadMsPerAnalysis: shadowOverhead,
    msAvoidedByPinningAndMemoisation: avoided,
    distinctLookupsFor10Findings: ctx!.resolvedCitationCount(),
    n1Avoided: ctx!.resolvedCitationCount() === corpus.length,
  };
  const out = process.env.REPORT_OUT;
  if (out) { writeFileSync(out, JSON.stringify(report, null, 2)); console.log(`\nreport written: ${out}`); }

  await ds.destroy();
  execFileSync('dropdb', ['-h', HOST, '-U', USER, '--if-exists', OWNED]);
}
main().catch(e => { console.error(e); process.exit(1); });
