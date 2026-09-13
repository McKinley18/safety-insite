/**
 * L3-2 -- the selected Level-3 reasoning provider: a locally hosted model served by Ollama.
 *
 * WHY THIS PROVIDER (full rationale and the candidates rejected: verification/
 * hazlenz-l3-2-semantic-reasoning-2026-08-22/PROVIDER_SELECTION.md). In short: it is the only
 * candidate for which this phase can produce MEASURED evidence, because no hosted-provider
 * credential is resolvable on this machine. It also satisfies the §10 privacy boundary absolutely
 * -- no observation text leaves the host -- and pins by content digest, which is a stronger
 * reproducibility guarantee than a vendor version label.
 *
 * WHAT IT IS NOT. It is not a recommendation for the customer-authoritative path. L3-2 is
 * comparison-only, and the production provider decision stays OPEN.
 *
 * AUTHORITY. This class returns a `ReasoningProposal` and nothing else. It performs no persistence,
 * selects no standard, renders no report and touches no governed state. Its output reaches nothing
 * until `deterministic-safety-validator.ts` accepts it.
 *
 * ZERO DEPENDENCY FOOTPRINT. Transport is the platform `fetch`. No SDK was added; `backend/
 * package.json` dependencies are byte-identical to HEAD.
 */
import type {
  HazLenzReasoningProvider, ReasoningProviderResult, ReasoningProviderFailureKind,
} from './hazlenz-reasoning-provider';
import type { ReasoningInput } from './reasoning-contract.types';
import {
  L3_PROMPT_VERSION, L3_SYSTEM_PROMPT, bindProposal, buildProposalSchema, buildUserPrompt,
  type QuoteBindingStat,
} from './reasoning-prompt';

export interface OllamaReasoningConfig {
  endpoint: string;
  /** `name@digest-prefix`, or a bare name when the digest could not be resolved. */
  model: string;
  temperature: number;
  seed: number;
  numCtx: number;
  timeoutMs: number;
}

/**
 * The controlled inference configuration. Temperature 0 and a fixed seed make an acceptance run
 * re-runnable; `num_ctx` is set explicitly because the server default silently truncates, and a
 * silently truncated observation would be a reasoning failure attributed to the model.
 */
export const L3_2_INFERENCE_CONFIG: OllamaReasoningConfig = {
  endpoint: process.env.L3_OLLAMA_ENDPOINT || 'http://127.0.0.1:11434',
  model: process.env.L3_OLLAMA_MODEL || 'qwen3-coder:30b',
  temperature: 0,
  seed: 20260822,
  numCtx: 8192,
  timeoutMs: Number(process.env.L3_OLLAMA_TIMEOUT_MS || 60_000),
};

/** Telemetry for §8. Deliberately carries no observation text and no provider prose. */
export interface L3ProviderTelemetry {
  latencyMs: number;
  promptTokens: number | null;
  outputTokens: number | null;
  binding: QuoteBindingStat | null;
  attempt: number;
  failureKind: ReasoningProviderFailureKind | null;
}

export class OllamaReasoningProvider implements HazLenzReasoningProvider {
  readonly providerId: string;
  /** Populated on every call. Read by the harness; never by the validator. */
  lastTelemetry: L3ProviderTelemetry | null = null;

  constructor(private readonly config: OllamaReasoningConfig = L3_2_INFERENCE_CONFIG) {
    this.providerId = `ollama:${config.model}`;
  }

  async analyzeObservation(input: ReasoningInput): Promise<ReasoningProviderResult> {
    const started = Date.now();
    const telemetry: L3ProviderTelemetry = {
      latencyMs: 0, promptTokens: null, outputTokens: null, binding: null, attempt: 1, failureKind: null,
    };
    const finish = (result: ReasoningProviderResult): ReasoningProviderResult => {
      telemetry.latencyMs = Date.now() - started;
      telemetry.failureKind = result.ok ? null : result.kind;
      this.lastTelemetry = telemetry;
      return result;
    };

    let body: any;
    try {
      body = {
        model: this.config.model,
        stream: false,
        format: buildProposalSchema(input),
        options: {
          temperature: this.config.temperature,
          seed: this.config.seed,
          num_ctx: this.config.numCtx,
        },
        messages: [
          { role: 'system', content: L3_SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(input) },
        ],
      };
    } catch (e) {
      // A malformed ReasoningInput is our configuration error, not a provider fault.
      return finish({ ok: false, kind: 'PERMANENT_CONFIGURATION_ERROR', detail: describe(e) });
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
    } catch (e: any) {
      clearTimeout(timer);
      // Raw transport exceptions never cross the reasoning boundary; they become taxonomy members.
      if (e?.name === 'AbortError') return finish({ ok: false, kind: 'TIMEOUT', detail: `no response within ${this.config.timeoutMs}ms` });
      return finish({ ok: false, kind: 'UNAVAILABLE', detail: describe(e) });
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      const kind: ReasoningProviderFailureKind =
        response.status === 404 ? 'PERMANENT_CONFIGURATION_ERROR'
        : response.status === 429 || response.status >= 500 ? 'TRANSIENT_ERROR'
        : 'PERMANENT_CONFIGURATION_ERROR';
      return finish({ ok: false, kind, detail: `HTTP ${response.status}` });
    }

    let envelope: any;
    try {
      envelope = await response.json();
    } catch (e) {
      return finish({ ok: false, kind: 'MALFORMED_STRUCTURED_OUTPUT', detail: 'response body was not JSON' });
    }

    telemetry.promptTokens = numberOrNull(envelope?.prompt_eval_count);
    telemetry.outputTokens = numberOrNull(envelope?.eval_count);

    // A refusal arrives as a normal completion, so it is detected on shape, not on status.
    const content = envelope?.message?.content;
    if (typeof content !== 'string' || content.trim() === '') {
      return finish({ ok: false, kind: 'MALFORMED_STRUCTURED_OUTPUT', detail: 'no content in provider message' });
    }
    if (envelope?.done_reason === 'length') {
      return finish({ ok: false, kind: 'MALFORMED_STRUCTURED_OUTPUT', detail: 'generation truncated at the output limit' });
    }

    let raw: any;
    try {
      raw = JSON.parse(content);
    } catch {
      return finish({ ok: false, kind: 'MALFORMED_STRUCTURED_OUTPUT', detail: 'structured output did not parse as JSON' });
    }
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return finish({ ok: false, kind: 'MALFORMED_STRUCTURED_OUTPUT', detail: 'structured output was not a JSON object' });
    }
    if (isRefusalShaped(raw)) {
      return finish({ ok: false, kind: 'PROVIDER_REFUSAL', detail: 'provider declined to analyze the observation' });
    }

    const bound = bindProposal(raw, input);
    telemetry.binding = bound.binding;
    return finish({ ok: true, proposal: bound.proposal });
  }
}

export const L3_2_PROMPT_VERSION = L3_PROMPT_VERSION;

function numberOrNull(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/** Operator-facing only. Never surfaced as an analysis result and never carries observation text. */
function describe(e: unknown): string {
  const message = e instanceof Error ? e.message : String(e);
  return message.slice(0, 200);
}

/**
 * A schema-constrained provider cannot emit prose, so a refusal shows up as a structurally valid
 * object with a refusal marker or with nothing in it at all where the schema demanded fields.
 */
function isRefusalShaped(raw: any): boolean {
  if (typeof raw.refusal === 'string' && raw.refusal.length > 0) return true;
  if (typeof raw.error === 'string' && /refus|cannot assist|unable to comply/i.test(raw.error)) return true;
  return false;
}
