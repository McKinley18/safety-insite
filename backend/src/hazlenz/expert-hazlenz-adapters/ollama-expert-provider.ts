/**
 * EXPERT HAZLENZ -- provider adapter for a locally hosted model served by Ollama.
 *
 * ==================== WHY THIS FILE IS NOT IN `expert-hazlenz/` ====================
 *
 * `test:expert-nocall-harness` section D reads every file in the core module and fails if any of
 * them contains a network primitive, an endpoint, a credential or a vendor name. This file contains
 * four of those five, by necessity — so it lives in a SIBLING directory and the core stays provably
 * pure. That guard was written before this adapter existed and it is the reason the adapter is here
 * rather than there: the architecture asked for a boundary, and the boundary is enforced by a test
 * rather than by a convention.
 *
 * The dependency direction is one-way and total. This file imports the contract; the contract
 * imports nothing from here, knows no vendor and has no adapter registry. Deleting this file leaves
 * the core compiling and every core suite green.
 *
 * ==================== WHY THIS PROVIDER, FOR A TRANSPORT PROBE ====================
 *
 * It is the only provider callable on this machine. There is no `ANTHROPIC_API_KEY`, no Gemini key,
 * and `OPENAI_API_KEY` is an eleven-character stub. This is the same position `D-92` recorded for
 * the L3 programme, and the same resolution: measure what can be measured locally rather than
 * report an unmeasured hosted provider as ready.
 *
 * It also has two properties a hosted provider does not, both of which matter here. No observation
 * text leaves the host, so the §10 privacy boundary holds absolutely. And the cost is exactly
 * `$0.00`, so a transport probe needs no spend authorization at all.
 *
 * **IT IS NOT A PRODUCTION PROVIDER RECOMMENDATION.** A local 30B model is not the customer-facing
 * Expert layer, and nothing measured through this adapter transfers to a hosted one.
 *
 * ==================== AUTHORITY ====================
 *
 * `analyze()` returns RAW `unknown`. It cannot return an `ExpertAnalysis`, because
 * `ExpertProviderSuccess.raw` is typed `unknown` precisely so an adapter cannot assert that
 * validation has happened. Everything this file produces must still cross
 * `normalizeExpertOutput()`.
 */

import {
  EXPERT_SYSTEM_PROMPT, bindWireAnalysis, buildExpertUserPrompt, buildExpertWireSchema,
  type QuoteBindingStat,
} from '../expert-hazlenz/expert-prompt';
import type { ExpertAnalysisInput } from '../expert-hazlenz/expert-contract.types';
import type {
  ExpertProvider, ExpertProviderFailureKind, ExpertProviderResult,
} from '../expert-hazlenz/expert-provider';

export interface OllamaExpertConfig {
  endpoint: string;
  model: string;
  temperature: number;
  seed: number;
  numCtx: number;
  timeoutMs: number;
}

/**
 * Temperature 0 and a fixed seed, so a probe is re-runnable. `num_ctx` is set explicitly because
 * the server default silently truncates, and a silently truncated observation would be a reasoning
 * failure misattributed to the model.
 *
 * Recording this matters for a reason the L3 programme paid to learn: on a hosted provider neither
 * `temperature` nor `seed` was forwardable, which is what made a 100 % reproducibility gate
 * unreachable. Here both ARE forwardable, and the probe reports that as a property of THIS
 * transport rather than as a general fact.
 */
export const EXPERT_PROBE_INFERENCE_CONFIG: OllamaExpertConfig = {
  endpoint: process.env.EXPERT_OLLAMA_ENDPOINT || 'http://127.0.0.1:11434',
  model: process.env.EXPERT_OLLAMA_MODEL || 'qwen3-coder:30b',
  temperature: 0,
  seed: 20260829,
  numCtx: 8192,
  timeoutMs: Number(process.env.EXPERT_OLLAMA_TIMEOUT_MS || 180_000),
};

/** Per-call telemetry. Carries no observation text and no model prose. */
export interface ExpertProviderTelemetry {
  latencyMs: number;
  promptTokens: number | null;
  outputTokens: number | null;
  /** From the provider's own response body, never echoed from the request. */
  respondedModel: string | null;
  binding: QuoteBindingStat | null;
  httpStatus: number | null;
  failureKind: ExpertProviderFailureKind | null;
  doneReason: string | null;
}

export class OllamaExpertProvider implements ExpertProvider {
  readonly providerId: string;
  readonly qualifiedModelIdentity: string | null;
  /** Populated on every call. Read by the probe harness; never by the boundary. */
  lastTelemetry: ExpertProviderTelemetry | null = null;

  constructor(private readonly config: OllamaExpertConfig = EXPERT_PROBE_INFERENCE_CONFIG) {
    this.providerId = `local-ollama:${config.model}`;
    this.qualifiedModelIdentity = config.model;
  }

  async analyze(input: ExpertAnalysisInput): Promise<ExpertProviderResult> {
    const started = Date.now();
    const telemetry: ExpertProviderTelemetry = {
      latencyMs: 0, promptTokens: null, outputTokens: null, respondedModel: null,
      binding: null, httpStatus: null, failureKind: null, doneReason: null,
    };
    const finish = (result: ExpertProviderResult): ExpertProviderResult => {
      telemetry.latencyMs = Date.now() - started;
      telemetry.failureKind = result.ok ? null : result.kind;
      this.lastTelemetry = telemetry;
      return result;
    };

    let body: unknown;
    try {
      body = {
        model: this.config.model,
        stream: false,
        format: buildExpertWireSchema(input),
        options: {
          temperature: this.config.temperature,
          seed: this.config.seed,
          num_ctx: this.config.numCtx,
        },
        messages: [
          { role: 'system', content: EXPERT_SYSTEM_PROMPT },
          { role: 'user', content: buildExpertUserPrompt(input) },
        ],
      };
    } catch (e) {
      // A malformed input is OUR configuration error, not a provider fault. Classifying it as a
      // provider failure would corrupt the callability measurement the probe exists to take.
      return finish({ ok: false, kind: 'NOT_CONFIGURED', detail: describe(e) });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);
    let response: Response;
    try {
      response = await fetch(`${this.config.endpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (e: unknown) {
      clearTimeout(timer);
      const name = (e as { name?: string })?.name;
      if (name === 'AbortError') {
        return finish({ ok: false, kind: 'TIMEOUT', detail: `no response within ${this.config.timeoutMs}ms` });
      }
      return finish({ ok: false, kind: 'NETWORK_ERROR', detail: describe(e) });
    } finally {
      clearTimeout(timer);
    }

    telemetry.httpStatus = response.status;
    if (!response.ok) {
      // The taxonomy is the point of this mapping: 404 means the model name is wrong (a
      // configuration fact), 429 is a rate limit, 5xx is retryable, everything else is a 4xx.
      const kind: ExpertProviderFailureKind =
        response.status === 404 ? 'PROVIDER_NOT_CALLABLE'
        : response.status === 429 ? 'RATE_LIMITED'
        : response.status >= 500 ? 'HTTP_SERVER_ERROR'
        : 'HTTP_CLIENT_ERROR';
      return finish({ ok: false, kind, detail: `HTTP ${response.status}`, httpStatus: response.status });
    }

    let envelope: Record<string, unknown>;
    try {
      envelope = await response.json() as Record<string, unknown>;
    } catch {
      return finish({ ok: false, kind: 'MALFORMED_JSON', detail: 'response body was not JSON' });
    }

    telemetry.promptTokens = numberOrNull(envelope?.prompt_eval_count);
    telemetry.outputTokens = numberOrNull(envelope?.eval_count);
    // Identity comes from the provider's own body. Echoing the request string back would make the
    // identity gate unfalsifiable.
    telemetry.respondedModel = typeof envelope?.model === 'string' ? envelope.model : null;
    telemetry.doneReason = typeof envelope?.done_reason === 'string' ? envelope.done_reason : null;

    const content = (envelope?.message as { content?: unknown } | undefined)?.content;
    if (typeof content !== 'string' || content.trim() === '') {
      return finish({ ok: false, kind: 'EMPTY_RESPONSE', detail: 'no content in provider message' });
    }
    if (telemetry.doneReason === 'length') {
      return finish({ ok: false, kind: 'TRUNCATED_RESPONSE', detail: 'generation hit the output limit' });
    }

    let wire: unknown;
    try {
      wire = JSON.parse(content);
    } catch {
      return finish({ ok: false, kind: 'MALFORMED_JSON', detail: 'structured output did not parse as JSON' });
    }
    if (!wire || typeof wire !== 'object' || Array.isArray(wire)) {
      return finish({ ok: false, kind: 'SCHEMA_INVALID_STRUCTURED_OUTPUT', detail: 'structured output was not an object' });
    }
    if (isRefusalShaped(wire as Record<string, unknown>)) {
      return finish({ ok: false, kind: 'PROVIDER_REFUSAL', detail: 'provider declined to analyze' });
    }

    // Offsets are resolved here, from quotes. An unbindable quote is KEPT and made to fail at the
    // boundary — see `bindWireAnalysis`. The adapter never decides that a quote was fabricated.
    const bound = bindWireAnalysis(wire, input);
    telemetry.binding = bound.binding;

    return finish({ ok: true, raw: bound.raw, modelIdentity: telemetry.respondedModel });
  }
}

function numberOrNull(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/** Operator-facing only. Never surfaced as an analysis result, never carries observation text. */
function describe(e: unknown): string {
  return (e instanceof Error ? e.message : String(e)).slice(0, 200);
}

/**
 * A schema-constrained provider cannot emit prose, so a refusal appears as a structurally valid
 * object carrying a refusal marker rather than as a text response.
 */
function isRefusalShaped(raw: Record<string, unknown>): boolean {
  if (typeof raw.refusal === 'string' && raw.refusal.length > 0) return true;
  if (typeof raw.error === 'string' && /refus|cannot assist|unable to comply/i.test(raw.error)) return true;
  return false;
}
