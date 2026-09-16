/**
 * §268 — THE OPERATIONAL CONTROL SURFACE, PROVEN ON LITERALS. TIER 0/1.
 *
 * NO DATABASE. NO NETWORK. NO PROVIDER. Everything asserted here is a pure function, which is the
 * reason the control surface was written as pure functions: a kill switch whose behaviour can only
 * be established by standing up a server and a database is a kill switch nobody re-checks.
 *
 * The integration tier (`test-268-deployment-safety.ts`) proves these decisions are actually
 * REACHED on the real route, before the provider seam, against a real database. This tier proves
 * the decisions themselves are right. Neither is sufficient alone: a correct rule wired to nothing
 * and a wired rule that is wrong both pass exactly one of them.
 */
import {
  EXPERT_EXECUTION_DISABLED_MESSAGE, EXPERT_EXECUTION_ENABLED_VAR,
  evaluateExpertExecutionPermission, foldExpertUsage, readExpertOperationalConfig,
  type ExpertOperationalConfig,
} from '../src/hazlenz/expert-hazlenz-product/expert-operational-controls';
import {
  OPERATIONAL_EVENTS, buildOperationalEvent, redactMetadata,
} from '../src/observability/operational-events';
import {
  evaluateSchemaReadiness, expectedMigrationTimestamps, resolveMigrationsDirectory,
} from '../src/database/schema-readiness';

let pass = 0; let fail = 0; const failures: string[] = [];
const ok = (id: string, cond: boolean, d = ''): void => {
  if (cond) { pass++; console.log(`ok    ${id}${d ? '  [' + d + ']' : ''}`); }
  else { fail++; failures.push(id); console.log(`FAIL  ${id}${d ? '  [' + d + ']' : ''}`); }
};

const config = (over: Partial<ExpertOperationalConfig> = {}): ExpertOperationalConfig => ({
  executionEnabled: true,
  dailyAnalysisLimitPerWorkspace: 5,
  dailyCostLimitUsdPerWorkspace: 10,
  windowHours: 24,
  expectedProviderLegsPerAnalysis: 2,
  perLegTimeoutMs: 180_000,
  maxAttemptsPerLeg: 1,
  ...over,
});

async function main(): Promise<void> {
  console.log('\n---- K. the kill switch ----\n');

  const disabled = evaluateExpertExecutionPermission(
    config({ executionEnabled: false }), { analysesInWindow: 0, costUsdInWindow: 0 });
  ok('K-1 a disabled feature refuses execution', disabled.permitted === false);
  ok('K-2 the refusal names the kill switch, not a limit',
    disabled.permitted === false && disabled.reason === 'EXPERT_EXECUTION_DISABLED',
    disabled.permitted === false ? disabled.reason : '');
  ok('K-3 the message tells the user the deterministic workflow is unaffected',
    disabled.permitted === false && /deterministic HazLenz analysis is unaffected/i.test(disabled.message));
  ok('K-4 the message states nothing was charged',
    disabled.permitted === false && /nothing was charged/i.test(disabled.message));
  ok('K-5 the disabled message is the single shared constant',
    disabled.permitted === false && disabled.message === EXPERT_EXECUTION_DISABLED_MESSAGE);
  // THE ORDERING PROPERTY: a disabled feature refuses without consulting usage at all, so an
  // emergency disable still works when the usage accounting is the thing that is broken.
  const disabledOverLimit = evaluateExpertExecutionPermission(
    config({ executionEnabled: false }),
    { analysesInWindow: 99_999, costUsdInWindow: 99_999 });
  ok('K-6 a disabled feature refuses for the KILL SWITCH reason even when also over every limit',
    disabledOverLimit.permitted === false
      && disabledOverLimit.reason === 'EXPERT_EXECUTION_DISABLED');

  console.log('\n---- C. configuration is explicit and does not silently default ----\n');

  ok('C-1 an explicit "false" disables',
    readExpertOperationalConfig({ [EXPERT_EXECUTION_ENABLED_VAR]: 'false' } as NodeJS.ProcessEnv)
      .executionEnabled === false);
  ok('C-2 an explicit "true" enables',
    readExpertOperationalConfig({ [EXPERT_EXECUTION_ENABLED_VAR]: 'true' } as NodeJS.ProcessEnv)
      .executionEnabled === true);
  ok('C-3 an unrecognised value does not read as disabled by accident outside production '
    + '(production requires true/false at boot; see validate-production-environment)',
    readExpertOperationalConfig({ [EXPERT_EXECUTION_ENABLED_VAR]: 'yes' } as NodeJS.ProcessEnv)
      .executionEnabled === true);
  ok('C-4 limits are configurable',
    readExpertOperationalConfig({
      EXPERT_DAILY_ANALYSIS_LIMIT_PER_WORKSPACE: '3',
      EXPERT_DAILY_COST_LIMIT_USD_PER_WORKSPACE: '0.25',
    } as NodeJS.ProcessEnv).dailyAnalysisLimitPerWorkspace === 3);
  ok('C-5 a nonsense limit falls back to the default rather than to zero or infinity',
    readExpertOperationalConfig({
      EXPERT_DAILY_ANALYSIS_LIMIT_PER_WORKSPACE: 'lots' } as NodeJS.ProcessEnv)
      .dailyAnalysisLimitPerWorkspace === 50);
  ok('C-6 no automatic retry: one attempt per leg',
    readExpertOperationalConfig({} as NodeJS.ProcessEnv).maxAttemptsPerLeg === 1);
  ok('C-7 one analysis is expected to cost TWO provider legs, not one',
    readExpertOperationalConfig({} as NodeJS.ProcessEnv).expectedProviderLegsPerAnalysis === 2);
  ok('C-8 a per-leg timeout is bounded',
    readExpertOperationalConfig({} as NodeJS.ProcessEnv).perLegTimeoutMs === 180_000);

  console.log('\n---- S. the spend ceilings ----\n');

  const under = evaluateExpertExecutionPermission(config(),
    { analysesInWindow: 4, costUsdInWindow: 9.99 });
  ok('S-1 a request below both ceilings is permitted', under.permitted === true);
  const atCount = evaluateExpertExecutionPermission(config(),
    { analysesInWindow: 5, costUsdInWindow: 0 });
  ok('S-2 the Nth+1 analysis is refused, so a limit of 5 permits exactly 5',
    atCount.permitted === false && atCount.reason === 'WORKSPACE_ANALYSIS_CEILING_REACHED');
  const atCost = evaluateExpertExecutionPermission(config(),
    { analysesInWindow: 0, costUsdInWindow: 10 });
  ok('S-3 the cost ceiling refuses independently of the count',
    atCost.permitted === false && atCost.reason === 'WORKSPACE_COST_CEILING_REACHED');
  ok('S-4 a ceiling refusal states nothing was charged',
    atCost.permitted === false && /nothing was charged/i.test(atCost.message));
  ok('S-5 a ceiling refusal keeps the deterministic path available in what it tells the user',
    atCost.permitted === false && /[Dd]eterministic/.test(atCost.message));
  ok('S-6 the operator detail carries the numbers and the window',
    atCount.permitted === false && /analyses=5 limit=5 window=24h/.test(atCount.detail),
    atCount.permitted === false ? atCount.detail : '');
  // Deliberately tiny limits, as §268 directs for local acceptance.
  const tiny = config({ dailyAnalysisLimitPerWorkspace: 1, dailyCostLimitUsdPerWorkspace: 0.01 });
  ok('S-7 with a limit of 1, the first analysis is permitted',
    evaluateExpertExecutionPermission(tiny, { analysesInWindow: 0, costUsdInWindow: 0 })
      .permitted === true);
  ok('S-8 with a limit of 1, the second is refused',
    evaluateExpertExecutionPermission(tiny, { analysesInWindow: 1, costUsdInWindow: 0 })
      .permitted === false);

  console.log('\n---- U. provider-leg and token/cost accounting ----\n');

  const rates = { inputUsdPerMTok: 2, outputUsdPerMTok: 10 };
  const both = foldExpertUsage([
    { leg: 'FIRST_PASS', inputTokens: 10_000, outputTokens: 2_000 },
    { leg: 'VERIFIER', inputTokens: 5_000, outputTokens: 500 },
  ], rates);
  ok('U-1 BOTH legs are accounted, not just the authoring leg', both.legs === 2, `${both.legs}`);
  ok('U-2 the authoring leg tokens are kept separately',
    both.firstPassInputTokens === 10_000 && both.firstPassOutputTokens === 2_000);
  ok('U-3 the verifier leg tokens are kept separately',
    both.verifierInputTokens === 5_000 && both.verifierOutputTokens === 500);
  // (15000/1e6)*2 + (2500/1e6)*10 = 0.03 + 0.025 = 0.055
  ok('U-4 cost is computed across both legs at the configured rates',
    Math.abs((both.costUsd ?? 0) - 0.055) < 1e-9, String(both.costUsd));

  const oneLeg = foldExpertUsage(
    [{ leg: 'FIRST_PASS', inputTokens: 1_000, outputTokens: 100 }], rates);
  ok('U-5 an analysis that never reached the verifier accounts for one leg',
    oneLeg.legs === 1 && oneLeg.verifierInputTokens === null);

  const unreported = foldExpertUsage([
    { leg: 'FIRST_PASS', inputTokens: null, outputTokens: null },
    { leg: 'VERIFIER', inputTokens: null, outputTokens: null },
  ], rates);
  ok('U-6 legs that reported no usage still count as legs spent', unreported.legs === 2);
  ok('U-7 unreported usage yields a NULL cost, never a free-looking zero',
    unreported.costUsd === null, String(unreported.costUsd));
  ok('U-8 no leg at all yields no cost and no legs',
    foldExpertUsage([], rates).legs === 0 && foldExpertUsage([], rates).costUsd === null);

  console.log('\n---- L. logging carries no sensitive content ----\n');

  const line = buildOperationalEvent('expert.execution.admitted', {
    observationId: 'obs-1',
    executionId: 'exec-1',
    rawFirstPass: { posture: 'CONTINUE_WITH_CONTROLS' },
    observationText: 'The conveyor drive guard has been removed for servicing',
    apiKey: 'sk-ant-secret-value',
    authorization: 'Bearer abc.def.ghi',
    resultSnapshot: { posture: 'STOP_WORK' },
    rationale: 'the reviewer said something private',
    providerLegs: 2,
  });
  const serialized = JSON.stringify(line);
  ok('L-1 raw provider output is not present', !/CONTINUE_WITH_CONTROLS|STOP_WORK/.test(serialized));
  ok('L-2 observation text is not present', !/conveyor drive guard/.test(serialized));
  ok('L-3 a credential is not present', !/sk-ant-secret-value|Bearer abc/.test(serialized));
  ok('L-4 reviewer prose is not present', !/something private/.test(serialized));
  ok('L-5 the identifiers an operator needs ARE present',
    /obs-1/.test(serialized) && /exec-1/.test(serialized) && /"providerLegs":2/.test(serialized));
  ok('L-6 redaction is by key name, so an unforeseen sensitive key is still caught',
    redactMetadata({ sessionToken: 'x' }).sessionToken === '[redacted]');
  ok('L-7 an over-long value is truncated rather than emitted whole',
    String(redactMetadata({ detail: 'y'.repeat(5_000) }).detail).length < 300);
  ok('L-8 a nested object is reduced to a shape description, never serialised',
    String(redactMetadata({ shape: { a: 1, b: 2 } }).shape) === '[object:2]');
  ok('L-9 every event carries a stable schema and severity',
    line.schema === 'safety-insite.operational-event.v1' && line.severity === 'info');

  console.log('\n---- E. the operational event vocabulary covers the §268 minimum set ----\n');

  const required = [
    'expert.execution.started', 'expert.execution.admitted', 'expert.execution.refused',
    'expert.execution.unresolved', 'expert.execution.failed',
    'expert.provider.transport_failure', 'expert.provider.verifier_failure',
    'expert.control.spend_limit_refused', 'expert.control.execution_disabled',
    'expert.confirmation.required', 'expert.confirmation.settled',
    'storage.operation_failed', 'report.generation_failed',
    'schema.readiness_failed', 'migration.failed',
  ];
  for (const event of required) {
    ok(`E-${event}`, (OPERATIONAL_EVENTS as readonly string[]).includes(event));
  }

  console.log('\n---- R. schema readiness, evaluated against fixture databases ----\n');

  const directory = resolveMigrationsDirectory();
  const expected = expectedMigrationTimestamps(directory);
  ok('R-1 this artifact ships migrations and their timestamps are discoverable',
    expected.length > 0, `${expected.length} migrations`);
  ok('R-2 the three §268 backlog migrations are among them',
    ['1800000019000', '1800000020000', '1800000021000'].every(t => expected.includes(t)),
    expected.slice(-3).join(', '));

  const fakeDb = (applied: string[]) => ({
    query: async () => applied.map(timestamp => ({ timestamp })),
  });
  const unmigrated = {
    query: async () => { throw new Error('relation "migrations" does not exist'); },
  };

  const readyAll = await evaluateSchemaReadiness(fakeDb(expected), directory);
  ok('R-3 a fully migrated database is READY', readyAll.ready === true, readyAll.reason.slice(0, 60));
  ok('R-4 it reports the expected schema version',
    readyAll.expectedSchemaVersion === expected[expected.length - 1],
    String(readyAll.expectedSchemaVersion));

  /*
   * §304 (IT-3) — WITHHOLD THREE, EXPECT THOSE THREE.
   *
   * This pinned the literal '1800000021000' as one of the three it expected to be reported missing,
   * which was true only while 021000 happened to be among the last three migrations in the
   * artifact. §304 added 1800000024000 and the assertion failed on a correct readiness evaluator —
   * the same failure shape as IT-2, where §268 E-2 pinned a literal migration timestamp.
   *
   * The property this case actually means is "the set reported missing is exactly the set that was
   * withheld". Deriving it from `withheld` says that, is self-maintaining as migrations are added,
   * and is STRICTER than the original: it now requires all three to be named rather than one.
   */
  const withheld = expected.slice(-3);
  const behind = await evaluateSchemaReadiness(fakeDb(expected.slice(0, -3)), directory);
  ok('R-5 a database missing the three backlog migrations is NOT READY', behind.ready === false);
  ok('R-6 it names exactly which migrations are missing',
    behind.missing.length === withheld.length
      && withheld.every((t) => behind.missing.includes(t)),
    `missing=${behind.missing.join(',')} withheld=${withheld.join(',')}`);
  ok('R-7 the reason explains the consequence rather than only the fact',
    /SCHEMA_BEHIND_CODE/.test(behind.reason) && /before activating/i.test(behind.reason));

  const never = await evaluateSchemaReadiness(unmigrated, directory);
  ok('R-8 a database that has never been migrated is NOT READY',
    never.ready === false && /MIGRATIONS_TABLE_UNREADABLE/.test(never.reason));

  const ahead = await evaluateSchemaReadiness(fakeDb([...expected, '1900000000000']), directory);
  ok('R-9 a database AHEAD of this build is READY — that is a code rollback, not a fault',
    ahead.ready === true && ahead.ahead.includes('1900000000000'));

  const noMigrations = await evaluateSchemaReadiness(fakeDb(expected), '/nonexistent/migrations');
  ok('R-10 an artifact shipping NO migrations is NOT READY and is reported as a build fault',
    noMigrations.ready === false && /ARTIFACT_CARRIES_NO_MIGRATIONS/.test(noMigrations.reason));

  console.log(`\n================ §268 operational controls: ${pass} passed, ${fail} failed`);
  if (fail > 0) {
    for (const f of failures) console.log(`  ${f}`);
    process.exitCode = 1;
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
