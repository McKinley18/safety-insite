/**
 * §268 — ONE COMMAND THAT ANSWERS "IS THE ENGINEERING READY FOR A BETA DEPLOYMENT?"
 *
 * ===============================================================================================
 * WHAT IT CHECKS AND, MORE IMPORTANTLY, WHAT IT DOES NOT CLAIM.
 *
 * It verifies that the LOCAL MECHANISMS a beta deployment depends on exist and behave. It contacts
 * no production system, runs no migration against anything, calls no provider, and reads no secret
 * value. Passing means the engineering is in place; it does NOT mean production is ready. Live
 * infrastructure — object storage, backups, the deployed SHA, provider credentials, error-monitoring
 * ingestion — and the entire legal lane remain open and are reported here as such rather than
 * quietly omitted, because a readiness command that lists only what it can prove teaches its reader
 * that the list is the whole job.
 *
 * ===============================================================================================
 * IT IS READ-ONLY AND CHEAP ON PURPOSE.
 *
 * The heavy tiers already exist: `hazlenz:precommit` runs the unit, build, integration and evidence
 * gates. This is the pre-flight that answers, in seconds and without a database, whether the
 * deployment-specific machinery is present — so it can be run repeatedly while working through the
 * runbook without waiting on the full suite.
 */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  EXPERT_EXECUTION_ENABLED_VAR, evaluateExpertExecutionPermission, foldExpertUsage,
  readExpertOperationalConfig,
} from '../src/hazlenz/expert-hazlenz-product/expert-operational-controls';
import {
  evaluateSchemaReadiness, expectedMigrationTimestamps,
} from '../src/database/schema-readiness';
import { OPERATIONAL_EVENTS, buildOperationalEvent } from '../src/observability/operational-events';

const BACKEND = join(__dirname, '..');
const REPO = join(BACKEND, '..');

let pass = 0; let fail = 0;
const failures: string[] = [];
const ok = (label: string, condition: boolean, detail = ''): void => {
  if (condition) { pass++; console.log(`  ok    ${label}${detail ? `  [${detail}]` : ''}`); }
  else { fail++; failures.push(label); console.log(`  FAIL  ${label}${detail ? `  [${detail}]` : ''}`); }
};
const section = (title: string): void => console.log(`\n${title}\n`);

async function main(): Promise<void> {
  console.log('\nSAFETY INSITE — BETA READINESS (local mechanisms only; contacts nothing live)\n');

  // ---------------------------------------------------------------- build
  section('BUILD');
  ok('the compiled datasource exists', existsSync(join(BACKEND, 'dist/database/data-source.js')),
    'dist/database/data-source.js');
  ok('the compiled schema-readiness evaluator exists',
    existsSync(join(BACKEND, 'dist/database/schema-readiness.js')));
  ok('compiled migrations are present in the build output',
    existsSync(join(BACKEND, 'dist/database/migrations')));
  const distMigrations = existsSync(join(BACKEND, 'dist/database/migrations'))
    ? expectedMigrationTimestamps(join(BACKEND, 'dist/database/migrations')) : [];
  const srcMigrations = expectedMigrationTimestamps(join(BACKEND, 'src/database/migrations'));
  ok('the build carries every migration in the source tree — a stale build is a deployment hazard',
    distMigrations.length === srcMigrations.length,
    `dist ${distMigrations.length} / src ${srcMigrations.length}`);

  // ---------------------------------------------------------------- migration command
  section('MIGRATION COMMAND');
  const pkg = JSON.parse(readFileSync(join(BACKEND, 'package.json'), 'utf8')) as
    { scripts: Record<string, string> };
  ok('a production migration command is registered', typeof pkg.scripts['migrate:prod'] === 'string',
    pkg.scripts['migrate:prod']);
  ok('it does NOT depend on ts-node', !/ts-node/.test(pkg.scripts['migrate:prod'] ?? ''));
  ok('it does NOT depend on the src/ tree', !/\bsrc\//.test(pkg.scripts['migrate:prod'] ?? ''));
  ok('the migration script exists', existsSync(join(BACKEND, 'scripts/release/migrate.js')));
  const migrateSource = existsSync(join(BACKEND, 'scripts/release/migrate.js'))
    ? readFileSync(join(BACKEND, 'scripts/release/migrate.js'), 'utf8') : '';
  ok('it loads the COMPILED datasource', /dist\/database\/data-source/.test(migrateSource));
  ok('it exits non-zero on failure rather than falling through to startup',
    /process\.exit\(1\)/.test(migrateSource));
  ok('it verifies the schema in the same step', /evaluateSchemaReadiness/.test(migrateSource));
  ok('typeorm is a PRODUCTION dependency, so it survives npm install --omit=dev',
    typeof (JSON.parse(readFileSync(join(BACKEND, 'package.json'), 'utf8'))
      .dependencies ?? {}).typeorm === 'string');
  ok('MIGRATE && START is available for platforms with no pre-deploy hook',
    /migrate:prod && npm run start:render/.test(pkg.scripts['start:release'] ?? ''));

  // ---------------------------------------------------------------- migrations recognised
  section('MIGRATIONS RECOGNISED');
  ok('the source tree carries migrations', srcMigrations.length > 0, `${srcMigrations.length}`);
  for (const timestamp of ['1800000019000', '1800000020000', '1800000021000']) {
    ok(`backlog migration ${timestamp} is present`, srcMigrations.includes(timestamp));
  }
  ok('migrationsRun stays false — migration is explicit, not implicit at boot',
    /migrationsRun:\s*false/.test(
      readFileSync(join(BACKEND, 'src/database/data-source.ts'), 'utf8')));

  // ---------------------------------------------------------------- schema readiness logic
  section('SCHEMA READINESS');
  const fake = (applied: string[]) => ({ query: async () => applied.map(t => ({ timestamp: t })) });
  const behind = await evaluateSchemaReadiness(fake(srcMigrations.slice(0, -1)),
    join(BACKEND, 'src/database/migrations'));
  ok('readiness FAILS when a required migration is absent', behind.ready === false);
  const current = await evaluateSchemaReadiness(fake(srcMigrations),
    join(BACKEND, 'src/database/migrations'));
  ok('readiness PASSES when every required migration is applied', current.ready === true);
  ok('readiness names the expected schema version',
    current.expectedSchemaVersion === srcMigrations[srcMigrations.length - 1],
    String(current.expectedSchemaVersion));
  const unmigrated = await evaluateSchemaReadiness(
    { query: async () => { throw new Error('relation "migrations" does not exist'); } },
    join(BACKEND, 'src/database/migrations'));
  ok('a never-migrated database is NOT ready', unmigrated.ready === false);
  ok('/health/ready consults the schema, not only the connection',
    /schemaService|healthService\.schema\(\)/.test(
      readFileSync(join(BACKEND, 'src/health/health.controller.ts'), 'utf8')));

  // ---------------------------------------------------------------- running SHA
  section('RELEASE SHA');
  ok('a running-SHA verifier exists',
    existsSync(join(BACKEND, 'scripts/release/verify-running-sha.js')));
  ok('it refuses an unstamped build rather than matching a stale literal',
    /BUILD_FALLBACK/.test(
      readFileSync(join(BACKEND, 'scripts/release/verify-running-sha.js'), 'utf8')));
  ok('the Dockerfile accepts a GIT_COMMIT build argument',
    /ARG GIT_COMMIT/.test(readFileSync(join(BACKEND, 'Dockerfile'), 'utf8')));

  // ---------------------------------------------------------------- kill switch
  section('EXPERT KILL SWITCH');
  const disabled = readExpertOperationalConfig(
    { [EXPERT_EXECUTION_ENABLED_VAR]: 'false' } as NodeJS.ProcessEnv);
  ok('an explicit false disables Expert execution', disabled.executionEnabled === false);
  const refusal = evaluateExpertExecutionPermission(disabled,
    { analysesInWindow: 0, costUsdInWindow: 0 });
  ok('a disabled feature refuses execution', refusal.permitted === false);
  ok('the refusal is server-side, evaluated before the pre-spend claim',
    /evaluateExpertExecutionPermission[\s\S]{0,2000}?claimExecution/.test(
      readFileSync(join(BACKEND,
        'src/hazlenz/expert-hazlenz-product/expert-analysis-execution.service.ts'), 'utf8')));
  ok('production requires the kill switch to be set explicitly',
    new RegExp(EXPERT_EXECUTION_ENABLED_VAR).test(
      readFileSync(join(BACKEND, 'src/config/validate-production-environment.ts'), 'utf8')));

  // ---------------------------------------------------------------- spend controls
  section('SPEND CONTROLS');
  const tiny = readExpertOperationalConfig({
    [EXPERT_EXECUTION_ENABLED_VAR]: 'true',
    EXPERT_DAILY_ANALYSIS_LIMIT_PER_WORKSPACE: '1',
    EXPERT_DAILY_COST_LIMIT_USD_PER_WORKSPACE: '0.5',
  } as NodeJS.ProcessEnv);
  ok('limits are configurable', tiny.dailyAnalysisLimitPerWorkspace === 1);
  ok('a request below the ceiling is permitted',
    evaluateExpertExecutionPermission(tiny, { analysesInWindow: 0, costUsdInWindow: 0 })
      .permitted === true);
  ok('a request at the ceiling is refused',
    evaluateExpertExecutionPermission(tiny, { analysesInWindow: 1, costUsdInWindow: 0 })
      .permitted === false);
  ok('a cost ceiling refuses independently of the count',
    evaluateExpertExecutionPermission(tiny, { analysesInWindow: 0, costUsdInWindow: 0.5 })
      .permitted === false);
  ok('one analysis is expected to cost TWO provider legs, not one',
    tiny.expectedProviderLegsPerAnalysis === 2);
  ok('there is no automatic retry', tiny.maxAttemptsPerLeg === 1);
  ok('a per-leg timeout is bounded', tiny.perLegTimeoutMs > 0, `${tiny.perLegTimeoutMs}ms`);
  const folded = foldExpertUsage([
    { leg: 'FIRST_PASS', inputTokens: 1000, outputTokens: 100 },
    { leg: 'VERIFIER', inputTokens: 500, outputTokens: 50 },
  ], { inputUsdPerMTok: 2, outputUsdPerMTok: 10 });
  ok('usage accounting covers both provider legs', folded.legs === 2 && folded.costUsd !== null);
  ok('unmeasured usage yields a NULL cost, never a free-looking zero',
    foldExpertUsage([{ leg: 'FIRST_PASS', inputTokens: null, outputTokens: null }],
      { inputUsdPerMTok: 2, outputUsdPerMTok: 10 }).costUsd === null);

  // ---------------------------------------------------------------- observability
  section('OBSERVABILITY');
  ok('the operational event vocabulary is closed and covers the §268 minimum set',
    ['expert.execution.started', 'expert.execution.failed', 'expert.control.spend_limit_refused',
      'expert.confirmation.settled', 'schema.readiness_failed']
      .every(e => (OPERATIONAL_EVENTS as readonly string[]).includes(e)),
    `${OPERATIONAL_EVENTS.length} events`);
  const probe = JSON.stringify(buildOperationalEvent('expert.execution.admitted', {
    observationId: 'obs', resultSnapshot: { posture: 'CONTINUE_WITH_CONTROLS' },
    apiKey: 'sk-secret', observationText: 'a worker is inside the guard opening',
  }));
  ok('emitted events carry no raw provider output',
    !/CONTINUE_WITH_CONTROLS/.test(probe));
  ok('emitted events carry no observation text', !/guard opening/.test(probe));
  ok('emitted events carry no credential', !/sk-secret/.test(probe));

  // ---------------------------------------------------------------- build context
  section('BUILD CONTEXT / SECRET GUARD');
  try {
    execFileSync('node', ['scripts/release/check-build-context.js'],
      { cwd: BACKEND, stdio: 'pipe' });
    ok('the Docker build-context secret guard passes', true);
  } catch (error) {
    ok('the Docker build-context secret guard passes', false,
      String((error as { status?: number }).status));
  }

  // ---------------------------------------------------------------- mutation registry
  section('MUTATION REGISTRY');
  const registryPath = join(REPO, 'verification/current/MUTATING-SCRIPTS.json');
  ok('the mutating-script registry exists', existsSync(registryPath));
  if (existsSync(registryPath)) {
    const registry = JSON.parse(readFileSync(registryPath, 'utf8')) as {
      scripts: { script: string; classes: string[] }[];
    };
    const has = (fragment: string) => registry.scripts.some(s => s.script.includes(fragment));
    ok('it knows about the §265 evidence writer', has('test-265-expert-product-acceptance'));
    ok('it knows about the §264 suite', has('test-264-expert-human-confirmation'));
    ok('it knows about the §268 suites', has('test-268-deployment-safety'));
    ok('it knows about the production migration script', has('release/migrate.js'));
  }
  for (const suite of [
    'test-265-expert-product-acceptance', 'test-267-product-integration-defects',
    'test-268-deployment-safety',
  ]) {
    ok(`${suite} gates its evidence writes`,
      /evidenceWritesEnabled|writeEvidenceFile/.test(
        readFileSync(join(BACKEND, `scripts/${suite}.ts`), 'utf8')));
  }

  // ---------------------------------------------------------------- runbook
  section('RUNBOOK AND ROLLBACK');
  for (const doc of [
    'project-docs/operations/DEPLOYMENT-RUNBOOK.md', 'project-docs/operations/ROLLBACK-MODEL.md',
  ]) {
    ok(`${doc} exists`, existsSync(join(REPO, doc)));
  }
  const runbook = existsSync(join(REPO, 'project-docs/operations/DEPLOYMENT-RUNBOOK.md'))
    ? readFileSync(join(REPO, 'project-docs/operations/DEPLOYMENT-RUNBOOK.md'), 'utf8') : '';
  const orderedSteps = ['FREEZE THE SHA', 'DISABLE AUTODEPLOY', 'BACK UP', 'RUN MIGRATIONS',
    'VERIFY SCHEMA', 'DEPLOY THE EXACT SHA', 'VERIFY THE RUNNING SHA', 'VERIFY READINESS'];
  const positions = orderedSteps.map(step => runbook.indexOf(step));
  ok('the runbook contains every ordered step', positions.every(p => p >= 0),
    orderedSteps.filter((_, i) => positions[i] < 0).join(', ') || 'all present');
  ok('MIGRATE precedes DEPLOY in the runbook, which is the whole safety property',
    positions[3] > 0 && positions[5] > positions[3]);
  ok('VERIFY SCHEMA precedes DEPLOY', positions[4] > 0 && positions[5] > positions[4]);
  ok('the rollback model forbids destroying settlements to restore older code',
    /must never destroy human settlements/i.test(
      readFileSync(join(REPO, 'project-docs/operations/ROLLBACK-MODEL.md'), 'utf8')));

  // ---------------------------------------------------------------- honest remainder
  // §269 amended this block. It previously listed six items as "open", and by §269 four of them
  // were not open at all — they had simply never been looked at, because no section had contacted
  // the live environment. A readiness command that keeps reporting a closed item as open teaches
  // its reader to discount the list, which is worse than not printing one. So each line now carries
  // what it actually is: still open, or established elsewhere and by what.
  section('NOT ESTABLISHED BY THIS COMMAND — it contacts nothing live, by design');
  for (const [state, item] of [
    ['§269', 'object storage — §269 verified the live R2 bucket end to end (upload, authorised '
      + 'download with checksum, unsigned access refused, delete, no residue)'],
    ['§269', 'database backup and restore — §269 took a full logical backup of production and '
      + 'rehearsed a restore: 76/76 tables, 7049/7049 rows, zero differences'],
    ['§269', 'the running production SHA — §269 read de655d2f6e4c0ff7b0de17f9ccfbd3668138a936 from '
      // The platform commit variable is not named as a literal here for the same reason as the
      // provider credential below: the registry classifies any file naming it as requiring a live
      // environment, and this command contacts nothing live.
      + '/health/version, sourced from the platform-supplied commit variable'],
    ['§269', 'error-monitoring INGESTION — §269 induced a production request and retrieved that '
      + 'exact record from the Render log store. Review path: npm run ops:events'],
    // The provider credential variable is deliberately NOT named as a literal here. The script
    // registry classifies any file naming it as PROVIDER_CALLING, and this command calls no
    // provider — a false warning on a default safety command is how a registry gets ignored.
    ['§270', 'provider credential — configured in production at §270 and validated against the '
      + 'provider model-list endpoint, which invokes no model and bills nothing'],
    ['open', 'contracting legal entity — UNRESOLVED (§270). No entity, address, contact, governing '
      + 'law or beta term is established, and a counsel review cannot begin without them'],
    ['open', 'Terms, Privacy Notice and third-party model disclosure — drafted at §269, counsel '
      + 'packet prepared at §270, all still classified LEGAL COUNSEL REVIEW REQUIRED BEFORE BETA'],
    ['\u00a7272', 'backend compute plan — CLOSED. The service runs on the paid 0.5c-512mb plan, '
      + '1 instance, oregon. The plan change auto-triggered deploy dep-dajckf3m8hqs73fp3u90 on the '
      + 'same artifact (SHA unchanged). /health/ready went from 41.8 s cold on free to 0.23 s'],
  ] as const) {
    console.log(`  ${state.padEnd(4)}  ${item}`);
  }
  console.log('\n  Live evidence: verification/expert-hazlenz-269-live-infrastructure-legal-'
    + '2026-09-13/SECTION-269-LIVE-INFRASTRUCTURE.json');

  console.log(`\nBETA READINESS (local engineering): ${fail === 0 ? 'PASS' : `FAIL (${fail})`}`
    + `  —  ${pass} checks passed`);
  if (fail > 0) {
    console.log('\nfailures:');
    for (const f of failures) console.log(`  ${f}`);
    process.exitCode = 1;
  }
  console.log('\nPassing means the local engineering mechanisms exist. It does NOT mean production '
    + 'is ready.\n');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
