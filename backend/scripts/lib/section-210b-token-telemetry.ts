/**
 * §210B-1 -- PER-CALL TOKEN TELEMETRY (TBR-15 / TBR-19). ZERO PROVIDER CALLS FROM THIS FILE.
 *
 * §210A could not report a cached-token baseline because the §208/§208B ledgers record only
 * `input_tokens` and `output_tokens`: the executor read exactly those two fields and discarded the
 * rest of the provider's usage block. Anthropic returns `cache_creation_input_tokens` and
 * `cache_read_input_tokens` alongside them, so the information was available and was thrown away.
 *
 * This module captures every category the transport actually returns and, where a category is
 * absent, records the string NOT_AVAILABLE rather than 0 -- because zero cache reads and no cache
 * telemetry are different facts and a cost model built on the first when the second is true would
 * be wrong in the flattering direction.
 *
 * NO PROMPT CONTENT IS RECORDED. Token accounting needs counts and identities, not text; logging
 * whole prompts for cost accounting would put observation and governed content into a telemetry
 * file for no measurement benefit.
 */

export const SECTION_210B_TELEMETRY_VERSION = 'hazlenz.expert.210b.token-telemetry.v1' as const;

/** Solved from CALL-LEDGER-208 in §210A; reproduces every recorded costUsd with zero residual. */
export const RATE_USD_PER_MTOK = { input: 2.0, output: 10.0 } as const;
/** Anthropic multipliers relative to base input. */
export const CACHE_MULTIPLIER = { write: 1.25, read: 0.1 } as const;

export type TokenValue = number | 'NOT_AVAILABLE';

export interface ProviderUsageBlock {
  input_tokens?: unknown;
  output_tokens?: unknown;
  cache_creation_input_tokens?: unknown;
  cache_read_input_tokens?: unknown;
  [k: string]: unknown;
}

export interface CallTelemetry {
  stage: 'FIRST_PASS' | 'VERIFIER' | 'GOVERNED';
  caseId: string;
  factKey: string | null;
  uncachedInputTokens: TokenValue;
  cacheWriteTokens: TokenValue;
  cacheReadTokens: TokenValue;
  outputTokens: TokenValue;
  effectiveCostUsd: number | 'NOT_COMPUTABLE';
  cacheTelemetryAvailable: boolean;
  systemPromptIdentity: string;
  userPromptIdentity: string;
  recordedAt: string;
}

const num = (v: unknown): TokenValue =>
  typeof v === 'number' && Number.isFinite(v) ? v : 'NOT_AVAILABLE';

/**
 * Effective cost including cache multipliers. Returns NOT_COMPUTABLE rather than guessing when a
 * required category is missing -- an unmeasured cache saving may not be reported as a measured one.
 */
export function effectiveCost(t: {
  uncachedInputTokens: TokenValue; cacheWriteTokens: TokenValue;
  cacheReadTokens: TokenValue; outputTokens: TokenValue;
}): number | 'NOT_COMPUTABLE' {
  if (typeof t.uncachedInputTokens !== 'number' || typeof t.outputTokens !== 'number') {
    return 'NOT_COMPUTABLE';
  }
  const w = typeof t.cacheWriteTokens === 'number' ? t.cacheWriteTokens : 0;
  const r = typeof t.cacheReadTokens === 'number' ? t.cacheReadTokens : 0;
  const inputUnits = t.uncachedInputTokens + w * CACHE_MULTIPLIER.write + r * CACHE_MULTIPLIER.read;
  return Number((inputUnits / 1e6 * RATE_USD_PER_MTOK.input
    + t.outputTokens / 1e6 * RATE_USD_PER_MTOK.output).toFixed(6));
}

export function captureTelemetry(args: {
  stage: CallTelemetry['stage'];
  caseId: string;
  factKey?: string | null;
  usage: ProviderUsageBlock | undefined;
  systemPromptIdentity: string;
  userPromptIdentity: string;
  now?: string;
}): CallTelemetry {
  const u = args.usage ?? {};
  const uncached = num(u.input_tokens);
  const write = num(u.cache_creation_input_tokens);
  const read = num(u.cache_read_input_tokens);
  const output = num(u.output_tokens);
  const partial = { uncachedInputTokens: uncached, cacheWriteTokens: write,
    cacheReadTokens: read, outputTokens: output };
  return {
    stage: args.stage,
    caseId: args.caseId,
    factKey: args.factKey ?? null,
    ...partial,
    effectiveCostUsd: effectiveCost(partial),
    cacheTelemetryAvailable: typeof write === 'number' || typeof read === 'number',
    systemPromptIdentity: args.systemPromptIdentity,
    userPromptIdentity: args.userPromptIdentity,
    recordedAt: args.now ?? new Date().toISOString(),
  };
}

/** Aggregate for a run. Any missing category makes the affected total NOT_COMPUTABLE. */
export function summariseRun(calls: readonly CallTelemetry[]): Record<string, unknown> {
  const byStage: Record<string, unknown> = {};
  for (const stage of ['FIRST_PASS', 'VERIFIER', 'GOVERNED'] as const) {
    const rows = calls.filter(c => c.stage === stage);
    if (rows.length === 0) continue;
    const sum = (pick: (c: CallTelemetry) => TokenValue): TokenValue =>
      rows.every(r => typeof pick(r) === 'number')
        ? rows.reduce((n, r) => n + (pick(r) as number), 0) : 'NOT_AVAILABLE';
    const costs = rows.map(r => r.effectiveCostUsd);
    byStage[stage] = {
      calls: rows.length,
      uncachedInputTokens: sum(r => r.uncachedInputTokens),
      cacheWriteTokens: sum(r => r.cacheWriteTokens),
      cacheReadTokens: sum(r => r.cacheReadTokens),
      outputTokens: sum(r => r.outputTokens),
      effectiveCostUsd: costs.every(c => typeof c === 'number')
        ? Number((costs as number[]).reduce((a, b) => a + b, 0).toFixed(6)) : 'NOT_COMPUTABLE',
      cacheTelemetryAvailable: rows.some(r => r.cacheTelemetryAvailable),
    };
  }
  return {
    version: SECTION_210B_TELEMETRY_VERSION,
    byStage,
    note: 'a category recorded NOT_AVAILABLE means the transport returned no such field. It does '
      + 'NOT mean zero, and no realized cache saving may be claimed from it.',
  };
}
