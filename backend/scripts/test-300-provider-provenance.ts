/**
 * §300 / HZ-6 — EXECUTION-TIME PROVIDER AND MODEL PROVENANCE.
 *
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. ZERO WRITES TO ACCEPTED EVIDENCE.
 * Runs with `npm run test:300-provider-provenance`.
 *
 * ---------------------------------------------------------------------------------------------
 * THE DEFECT, AND THE ONE CORRECTION TO ITS REGISTERED DESCRIPTION.
 *
 * `HZ-6` is registered as: the Expert execution record cannot state which model produced a safety
 * analysis, or how long it took. That is exactly right, and §298 had to reconstruct the answer
 * from the frozen envelope, the absence of a production override, the credential's model list and
 * cost arithmetic — a sound chain, but CONFIGURATION-DERIVED rather than EXECUTION-DERIVED.
 *
 * The registered REMEDIATION assumed the value was already in hand at the seam ("the adapter DOES
 * capture the responding model ... so the value exists and is discarded at the product boundary").
 * That is true of `anthropic-expert-provider.ts` — which is a PROTECTED module and is NOT what
 * production runs. Production runs `HostedExpertSemanticTransport`, which parsed the response
 * envelope for `usage` and threw `model` away with the rest of it. So the value was not discarded
 * at the product boundary; IT WAS NEVER CAPTURED AT ALL. The repair therefore has to capture it
 * first, then carry it. §300 asked for that difference to be reported, and this is it.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE SIDE CHANNEL AND NOT A RESPONSE FIELD.
 *
 * `ExpertLegResponse` cannot gain a field: it lives in `expert-hazlenz-analysis.ts`, which is
 * ELEMENT 5 of the §259 candidate identity, and changing it changes the candidate. The obvious
 * alternative, `anthropic-expert-provider.ts`, is one of the 29 protected modules. §268 already
 * solved this shape for token usage by sending it BESIDE the response through
 * `ExpertLegUsageReporter`. HZ-6 reuses that channel rather than inventing a second one.
 *
 * ---------------------------------------------------------------------------------------------
 * HISTORICAL HONESTY IS ASSERTED, NOT ASSUMED.
 *
 * §300 forbids backfilling old executions from current configuration. NULL means NOT RECORDED, and
 * section 4 below asserts that the fold cannot invent a model from anything other than what a leg
 * actually reported.
 */
import {
  foldExpertProvenance, type ExpertLegUsage,
} from '../src/hazlenz/expert-hazlenz-product/expert-operational-controls';
import {
  isExpertLegUsageReporter,
} from '../src/hazlenz/expert-hazlenz-product/expert-semantic-transport.provider';

const failures: string[] = [];
let passed = 0;
function check(condition: unknown, message: string): void {
  if (condition) { passed += 1; console.log(`ok    ${message}`); }
  else { failures.push(message); console.error(`FAIL  ${message}`); }
}

const leg = (
  l: 'FIRST_PASS' | 'VERIFIER', model: string | null, latencyMs: number | null,
): ExpertLegUsage => ({
  leg: l, inputTokens: 100, outputTokens: 20, respondedModel: model, latencyMs,
});

// ================================================================ 1. the ordinary case

console.log('\n---- 1. a two-leg hosted execution records who answered and how long ----\n');

const ordinary = foldExpertProvenance([
  leg('FIRST_PASS', 'claude-sonnet-5', 4120),
  leg('VERIFIER', 'claude-sonnet-5', 1880),
]);
console.log(`      ${JSON.stringify(ordinary)}`);
check(ordinary.respondedModel === 'claude-sonnet-5',
  'respondedModel is the model the provider reported, not a configured default.');
check(ordinary.latencyMs === 6000,
  'latencyMs is the total provider wall-clock across legs (4120 + 1880).');
check(ordinary.modelsDiverged === false, 'Agreeing legs are not reported as diverged.');

// ================================================================ 2. nothing reported

console.log('\n---- 2. when nothing was reported, nothing is invented ----\n');

const substituted = foldExpertProvenance([
  { leg: 'FIRST_PASS', inputTokens: null, outputTokens: null },
  { leg: 'VERIFIER', inputTokens: null, outputTokens: null },
]);
console.log(`      ${JSON.stringify(substituted)}`);
check(substituted.respondedModel === null,
  'A substituted deterministic transport yields NULL, never a model borrowed from configuration. '
  + 'This is the whole point of HZ-6: "the config says sonnet" is an inference, not a record.');
check(substituted.latencyMs === null, 'And no latency is fabricated.');
check(substituted.modelsDiverged === false, 'Nothing reported is not a divergence.');

const noLegs = foldExpertProvenance([]);
check(noLegs.respondedModel === null && noLegs.latencyMs === null,
  'An execution that never reached a provider records nothing at all.');

// ================================================================ 3. divergence is recorded, not resolved

console.log('\n---- 3. legs that disagree are both recorded ----\n');

const diverged = foldExpertProvenance([
  leg('FIRST_PASS', 'claude-sonnet-5', 4000),
  leg('VERIFIER', 'claude-opus-5', 2000),
]);
console.log(`      ${JSON.stringify(diverged)}`);
check(diverged.modelsDiverged === true, 'Divergence is flagged.');
check(diverged.respondedModel?.includes('claude-sonnet-5') === true
  && diverged.respondedModel?.includes('claude-opus-5') === true,
  'BOTH models are recorded rather than one silently winning. A safety analysis reviewed by a '
  + 'different build than produced it is exactly the fact an audit would want, and exactly the one '
  + 'a single-value column would hide.');
check((diverged.respondedModel ?? '').length <= 120,
  'The recorded value fits the column, so a divergence cannot fail the write.');

// ================================================================ 4. historical honesty

console.log('\n---- 4. the fold cannot invent a model ----\n');

const beforeEnv = process.env.EXPERT_MODEL_OVERRIDE;
process.env.EXPERT_MODEL_OVERRIDE = 'claude-something-configured';
const withConfigPresent = foldExpertProvenance([
  { leg: 'FIRST_PASS', inputTokens: 10, outputTokens: 2 },
]);
if (beforeEnv === undefined) delete process.env.EXPERT_MODEL_OVERRIDE;
else process.env.EXPERT_MODEL_OVERRIDE = beforeEnv;

check(withConfigPresent.respondedModel === null,
  'With a model name sitting in the environment, a leg that reported none still folds to NULL. '
  + 'The fold reads ONLY what legs reported — there is no path by which configuration reaches it.');

check(foldExpertProvenance([leg('FIRST_PASS', '   ', 10)]).respondedModel === null,
  'A blank string from a provider is NOT RECORDED rather than stored as an empty model name.');

check(foldExpertProvenance([leg('FIRST_PASS', 'claude-sonnet-5', null)]).latencyMs === null,
  'A reported model with no measured latency records the model and leaves latency NULL — the two '
  + 'facts are independent and neither is implied by the other.');

const partial = foldExpertProvenance([
  leg('FIRST_PASS', 'claude-sonnet-5', 4000),
  { leg: 'VERIFIER', inputTokens: 5, outputTokens: 1 },
]);
check(partial.respondedModel === 'claude-sonnet-5' && partial.latencyMs === 4000,
  'A leg that reported nothing neither erases the leg that did nor is counted as a divergence.');
check(partial.modelsDiverged === false, 'One silent leg is not a disagreement.');

// ================================================================ 5. the seam still accepts old transports

console.log('\n---- 5. every existing transport still satisfies the seam ----\n');

const usageOnly = { takeLastLegUsage: () => ({ inputTokens: 1, outputTokens: 2 }) };
check(isExpertLegUsageReporter(usageOnly),
  'A transport that reports ONLY usage is still a valid reporter, so no existing deterministic '
  + 'test transport needed editing to keep working.');
const nothing = { send: async () => ({ ok: true }) };
check(!isExpertLegUsageReporter(nothing),
  'A transport that reports nothing is correctly not a reporter and yields NULL provenance.');

// ================================================================ 6. the capture itself

/**
 * THE ASSERTION THAT MATTERS MOST, because everything above tests the FOLD and the fold can only
 * report what the transport gives it. HZ-6's actual cause was that the transport never captured
 * `model` at all.
 *
 * `global.fetch` is replaced with a stub that returns a provider-shaped envelope. NO NETWORK CALL
 * IS MADE, no credential is used beyond a placeholder, and nothing is billed. What is exercised is
 * the REAL `HostedExpertSemanticTransport.send()` on the real response-parsing path.
 */
async function provesTheCapture(): Promise<void> {
  console.log('\n---- 6. the transport actually captures the model off the response ----\n');

  const { HostedExpertSemanticTransport } =
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../src/hazlenz/expert-hazlenz-adapters/expert-semantic-transport');

  const realFetch = global.fetch;
  const realKey = process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_API_KEY = 'placeholder-not-a-credential';

  (global as { fetch: unknown }).fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      // The field HZ-6 was throwing away. A real Anthropic response carries it, and it is the
      // provider's own statement of what answered rather than what was asked for.
      model: 'claude-sonnet-5-20260101',
      usage: { input_tokens: 1234, output_tokens: 56 },
      stop_reason: 'tool_use',
      content: [{ type: 'tool_use', name: 'probe_tool', input: { ok: true } }],
    }),
    text: async () => '',
  });

  try {
    const transport = new HostedExpertSemanticTransport();
    const response = await transport.send({
      leg: 'FIRST_PASS', systemPrompt: 'system', userPrompt: 'user',
      toolName: 'probe_tool', toolDescription: 'probe',
      wireSchema: { type: 'object', properties: {}, required: [] },
    });
    check(response.ok === true, 'The stubbed leg succeeded, so the parsing path really ran.');

    const reported = transport.takeLastLegUsage();
    console.log(`      ${JSON.stringify(reported)}`);
    check(reported?.respondedModel === 'claude-sonnet-5-20260101',
      'THE TRANSPORT CAPTURES THE PROVIDER-REPORTED MODEL. Before §300 this field was parsed and '
      + 'discarded with the rest of the envelope, which is why §298 had to reconstruct it.');
    check(typeof reported?.latencyMs === 'number' && (reported.latencyMs as number) >= 0,
      'And it measures the leg latency.');
    check(reported?.inputTokens === 1234 && reported?.outputTokens === 56,
      'Token usage is unchanged — §268 accounting is not disturbed by the addition.');
    check(transport.takeLastLegUsage() === null,
      'READING CLEARS IT, so a later leg cannot inherit this one\'s model or latency.');

    const folded = foldExpertProvenance([{
      leg: 'FIRST_PASS', inputTokens: 1234, outputTokens: 56,
      respondedModel: 'claude-sonnet-5-20260101', latencyMs: 12,
    }]);
    check(folded.respondedModel === 'claude-sonnet-5-20260101',
      'And what the transport captured is what the execution record would store.');
  } finally {
    (global as { fetch: unknown }).fetch = realFetch;
    if (realKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = realKey;
  }
}

void provesTheCapture().then(() => {

// ================================================================

console.log(`\n${passed} checks passed, ${failures.length} failed`);
if (failures.length > 0) {
  for (const f of failures) console.error(`  FAILED: ${f}`);
  process.exitCode = 1;
}
});
