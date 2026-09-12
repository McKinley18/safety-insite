/**
 * EXPERT HAZLENZ -- provider adapter for Anthropic's hosted Messages API.
 *
 * ==================== WHY THIS FILE IS NOT IN `expert-hazlenz/` ====================
 *
 * `test:expert-nocall-harness` section D reads every file in `src/safescope-v2/expert-hazlenz/`
 * and fails if any of them contains a network primitive, an endpoint, a credential or a vendor
 * name. This file contains all five, by necessity -- so it lives in the SIBLING adapter directory
 * and the core stays provably pure, exactly as the local adapter does. That guard was written in
 * §99, before either adapter existed, and it is what decided this architecture.
 *
 * The dependency direction is one-way and total. This file imports the contract; the contract
 * imports nothing from here, knows no vendor and has no adapter registry. Deleting this file leaves
 * the core compiling and every core suite green.
 *
 * ==================== WHY RAW `fetch` AND NOT `@anthropic-ai/sdk` ====================
 *
 * Stated plainly, because the official SDK is the normal default and this departs from it.
 *
 * `@anthropic-ai/sdk` is not installed. Installing it would add a package to `backend/package.json`
 * and `package-lock.json` -- the dependency tree of a service where `autoDeploy=yes` on `main`
 * makes a push a production deployment -- in order to support code that is PROBE-ONLY and imported
 * by nothing on the customer path. The sibling local adapter already establishes `fetch` as the
 * transport idiom in this directory, Node 20 provides it globally, and the surface actually needed
 * here is one POST plus a usage read. So the smaller change is the one that adds no dependency.
 *
 * If this adapter is ever promoted from probe-only to a customer path, that decision should carry
 * the SDK with it: retries, typed errors and streaming are worth a dependency for production
 * traffic, and are not worth one for eight bounded calls.
 *
 * ==================== WHAT THIS ADAPTER MAY AND MAY NOT DO ====================
 *
 * `analyze()` returns RAW `unknown`. It cannot return an `ExpertAnalysis`, because
 * `ExpertProviderSuccess.raw` is typed `unknown` precisely so an adapter cannot assert that
 * validation has happened. Everything this file produces must still cross
 * `normalizeExpertOutput()`.
 *
 * The contract is NOT reshaped for this vendor. `analysis.v2` and the current prompt version are used exactly as
 * the provider-neutral core defines them. The one provider-native transformation is
 * `applyStrictSchemaWrapper()`, which injects `additionalProperties: false` -- a requirement of
 * Anthropic's strict tool schema, not a change to what the contract means. It adds no field,
 * removes none, and edits no description or `required` list.
 *
 * ==================== CREDENTIAL HANDLING ====================
 *
 * The key is read from `process.env.ANTHROPIC_API_KEY` at call time and placed in the `x-api-key`
 * header. It is never returned, never written to telemetry, never interpolated into a `detail`
 * string, and never persisted. `describe()` truncates and every failure path routes through it.
 */

import { bindWireAnalysis, type QuoteBindingStat } from '../expert-hazlenz/expert-prompt';
import {
  buildExpertVNextUserPrompt, governedBindingFor,
} from '../expert-hazlenz/contract/expert-first-pass-instruction-vnext';
// §249: the SAME successor builders the production entry point invokes. Selecting a builder is
// binding, not semantics; none of the §247 contract is altered here.
import { build247SystemPrompt } from '../expert-hazlenz/contract/expert-247-posture-contract';
// §253: the schema successor the production entry point invokes. The prompt is unchanged.
import { buildExpert253WireSchema } from '../expert-hazlenz/contract/expert-253-posture-contract';
import {
  EXPERT_HOSTED_INFERENCE_CONFIG, buildEnvelopeRequestBody,
  type AnthropicExpertConfig,
} from './expert-request-envelope';
import type { ExpertAnalysisInput } from '../expert-hazlenz/expert-contract.types';
import type {
  ExpertProvider, ExpertProviderFailureKind, ExpertProviderResult,
} from '../expert-hazlenz/expert-provider';

/** The single tool the model is forced to call. Its schema IS the provider-neutral wire schema. */
export const EXPERT_TOOL_NAME = 'emit_expert_analysis';

/**
 * ==================== §247 CLOSURE A: NO INDEPENDENT EXPERT SEMANTIC ROUTE ====================
 *
 * Before §247 this adapter assembled its own request from the BASE contract -- `EXPERT_SYSTEM_PROMPT`,
 * `buildExpertWireSchema`, `buildExpertUserPrompt` -- which made it a second, independently runnable
 * way to obtain Expert HazLenz conclusions, carrying none of the §210J/§233/§235/§237/§239 layers.
 * §246 reported that route as the one residual; §247 closes it.
 *
 * `buildAnthropicRequestBody` now DELEGATES: it asks the canonical contract for the bytes and the
 * canonical envelope for the transport configuration. It chooses no contract of its own and holds no
 * independent semantic behaviour. Closing the route is delegation, not reinterpretation -- no safety
 * semantics were changed, and the canonical §239 contract is a byte-reversible extension of the base
 * contract this adapter used to send.
 *
 * The configuration moved to the envelope, which Slice 3 makes the only source of material provider
 * configuration. Both names are re-exported here so every historical importer keeps resolving.
 */
export type { AnthropicExpertConfig } from './expert-request-envelope';
export { EXPERT_HOSTED_INFERENCE_CONFIG } from './expert-request-envelope';

/** Per-call telemetry. Carries no observation text, no model prose and no credential. */
export interface HostedExpertTelemetry {
  latencyMs: number;
  promptTokens: number | null;
  outputTokens: number | null;
  cacheReadTokens: number | null;
  cacheWriteTokens: number | null;
  /** From the provider's own response body, never echoed from the request. */
  respondedModel: string | null;
  binding: QuoteBindingStat | null;
  httpStatus: number | null;
  failureKind: ExpertProviderFailureKind | null;
  stopReason: string | null;
  /** Anthropic's own request id header. Useful to Anthropic support; carries nothing sensitive. */
  requestId: string | null;
  /** Computed from reported usage and the configured published rates. */
  computedCostUsd: number | null;
}

/**
 * Anthropic's strict tool schema requires `additionalProperties: false` on every object node. The
 * provider-neutral schema does not set it, because that is a provider-native requirement and
 * §100's architecture puts provider-native concerns in the adapter.
 *
 * This is a WRAPPER, not a contract change: it clones, adds exactly one key per object node, and
 * touches no property, description, enum or `required` list.
 */
export function applyStrictSchemaWrapper(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(applyStrictSchemaWrapper);
  if (!node || typeof node !== 'object') return node;
  const src = node as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(src)) out[k] = applyStrictSchemaWrapper(v);
  if (out.type === 'object' && out.properties && typeof out.properties === 'object') {
    out.additionalProperties = false;
  }
  return out;
}

/**
 * §108 -- ANTHROPIC-ONLY COMPATIBILITY STRIP. Named for what it is, deliberately, so no future
 * maintainer mistakes its output for the canonical contract: `stripAnthropicUnsupportedKeywords`
 * produces a REQUEST-TRANSPORT ARTIFACT for this one provider, never a second copy of the schema
 * anything else may read.
 *
 * §105 added `minLength`/`minItems` to the shared wire schema (`buildExpertWireSchema` in
 * `expert-prompt.ts`) to close a real defect -- the wire schema was weaker than
 * `expert-normalization.ts`'s boundary, so an empty string or an under-populated `participants`
 * array could pass strict transport validation and only fail later, confusingly, as
 * `CANDIDATE_MALFORMED`. §107's isolated diagnostic then measured, on one live call, that
 * Anthropic's `strict: true` tool-schema mode rejects a request carrying those two keywords with an
 * HTTP 400 before generation begins -- §106's 7/7 pre-generation rejection, explained.
 *
 * The fix belongs HERE, not in the shared schema, because of what each keyword protects and where.
 * `minLength`/`minItems` in the wire schema exist to give the MODEL cheaper pressure toward a
 * well-formed answer -- generation guidance. What actually PROTECTS the product is
 * `expert-normalization.ts`'s own `isNonEmptyString` and participant-count checks, which run
 * regardless of what any adapter ever sent on the wire and are UNTOUCHED by this function. Removing
 * the keywords from what Anthropic sees removes a hint a model never gets to read anyway once
 * transport rejects the whole request; it removes nothing the boundary depends on.
 *
 * `stripKeys` clones before it mutates -- `JSON.parse(JSON.stringify(node))`, then a recursive
 * delete on the clone -- so the schema object passed in is provably unchanged. It deletes ONLY the
 * two named keys, by exact name, at any depth; it does not touch `minimum`, `maximum`, `pattern`,
 * `maxLength` or `maxItems` (none exist in this schema today, and none would be touched if they
 * did), property names, types, `required` lists, enums, `additionalProperties`, or `strict`.
 */
export function stripAnthropicUnsupportedKeywords(node: unknown): unknown {
  const UNSUPPORTED_ANTHROPIC_STRICT_SCHEMA_KEYWORDS = new Set(['minLength', 'minItems']);
  function strip(n: unknown): unknown {
    if (Array.isArray(n)) return n.map(strip);
    if (n && typeof n === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(n as Record<string, unknown>)) {
        if (UNSUPPORTED_ANTHROPIC_STRICT_SCHEMA_KEYWORDS.has(k)) continue;
        out[k] = strip(v);
      }
      return out;
    }
    return n;
  }
  // Clone first: JSON.parse(JSON.stringify(...)) guarantees `node` itself is never touched, even by
  // `strip`'s own recursion, before the recursive delete ever runs.
  return strip(JSON.parse(JSON.stringify(node)));
}

/**
 * Built without a credential and without a network call, so it is testable offline.
 *
 * §247: the bytes come from the CANONICAL contract and the tool block from the CANONICAL envelope.
 * §249: that canonical contract is now the §247 SUCCESSOR, the same one the production entry point
 * invokes, so the legacy adapter and the product assemble the same request.
 * This function no longer decides which contract to send, and the strict flag is written by the
 * envelope rather than here, so the §243 omission is not expressible from this path either.
 */
export function buildAnthropicRequestBody(
  input: ExpertAnalysisInput, config: AnthropicExpertConfig = EXPERT_HOSTED_INFERENCE_CONFIG,
): Record<string, unknown> {
  // No governed records travel on this path; the canonical builders take the empty binding, which is
  // the same shape the acceptance assembly uses when `governedStandards` is empty.
  const governedRecords: readonly { sourceId: string; text: string }[] = [];
  const body = buildEnvelopeRequestBody({
    leg: 'FIRST_PASS',
    systemPrompt: build247SystemPrompt(governedRecords.length),
    userPrompt: buildExpertVNextUserPrompt(input, governedRecords),
    toolName: EXPERT_TOOL_NAME,
    toolDescription: 'Emit the Expert HazLenz advisory analysis. This is the ONLY way to answer.',
    // Pipeline, in order: the CANONICAL schema -> the strict-mode wrapper
    // (`additionalProperties: false`) -> the §108 Anthropic-only compatibility strip
    // (`minLength` / `minItems`). Only the transmitted request is affected.
    inputSchema: stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(
      buildExpert253WireSchema(input, governedBindingFor(governedRecords)))),
  });
  // The per-call timeout stays a property of this transport, not of the envelope; `config` is kept
  // in the signature because historical callers pass one, and its transport fields are read by
  // `analyze()` rather than by the request builder.
  void config;
  return body;
}

export class AnthropicExpertProvider implements ExpertProvider {
  readonly providerId: string;
  readonly qualifiedModelIdentity: string | null;
  /** Populated on every call. Read by the probe harness; never by the boundary. */
  lastTelemetry: HostedExpertTelemetry | null = null;
  /**
   * EVERY request this adapter has made, appended never overwritten. §135 (R3).
   *
   * `lastTelemetry` is retained because probes read it, but it is the wrong instrument for a run
   * that retries: it holds only the final attempt, so a retried logical call silently dropped the
   * first -- billed -- request from both spend accounting and M16. This array is the fix, and it is
   * append-only so no attempt can be edited out after the fact.
   */
  readonly attemptTelemetry: HostedExpertTelemetry[] = [];

  constructor(private readonly config: AnthropicExpertConfig = EXPERT_HOSTED_INFERENCE_CONFIG) {
    this.providerId = `anthropic:${config.model}`;
    this.qualifiedModelIdentity = config.model;
  }

  /** The configured model, so a formal binding can be asserted without reading the environment. */
  get configuredModel(): string { return this.config.model; }

  async analyze(input: ExpertAnalysisInput): Promise<ExpertProviderResult> {
    const started = Date.now();
    const telemetry: HostedExpertTelemetry = {
      latencyMs: 0, promptTokens: null, outputTokens: null, cacheReadTokens: null,
      cacheWriteTokens: null, respondedModel: null, binding: null, httpStatus: null,
      failureKind: null, stopReason: null, requestId: null, computedCostUsd: null,
    };
    const finish = (result: ExpertProviderResult): ExpertProviderResult => {
      telemetry.latencyMs = Date.now() - started;
      telemetry.failureKind = result.ok ? null : result.kind;
      if (telemetry.promptTokens !== null && telemetry.outputTokens !== null) {
        telemetry.computedCostUsd =
          (telemetry.promptTokens / 1e6) * this.config.inputUsdPerMTok
          + (telemetry.outputTokens / 1e6) * this.config.outputUsdPerMTok;
      }
      this.lastTelemetry = telemetry;
      this.attemptTelemetry.push(telemetry);
      // Usage rides back on the RESULT -- success or failure alike -- so the runner records what
      // this individual request cost without reaching into adapter state. A truncated or malformed
      // response billed for the tokens it produced, and dropping that would understate the run.
      return {
        ...result,
        usage: {
          inputTokens: telemetry.promptTokens,
          outputTokens: telemetry.outputTokens,
          costUsd: telemetry.computedCostUsd,
          latencyMs: telemetry.latencyMs,
          httpStatus: telemetry.httpStatus,
          modelIdentity: telemetry.respondedModel,
        },
      };
    };

    // Read at call time, never stored on the instance, never echoed anywhere.
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return finish({ ok: false, kind: 'NOT_CONFIGURED', detail: 'ANTHROPIC_API_KEY is not set' });
    }

    let body: unknown;
    try {
      body = buildAnthropicRequestBody(input, this.config);
    } catch (e) {
      // A malformed input is OUR configuration error, not a provider fault. Classifying it as a
      // provider failure would corrupt the callability measurement the probe exists to take.
      return finish({ ok: false, kind: 'NOT_CONFIGURED', detail: describe(e) });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);
    let response: Response;
    try {
      response = await fetch(`${this.config.endpoint}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': this.config.apiVersion,
        },
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
    telemetry.requestId = response.headers.get('request-id');

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return finish({
        ok: false,
        kind: classifyHttpFailure(response.status, errText),
        // The provider's error TYPE only. The body may echo the request, so it is never included.
        detail: `HTTP ${response.status} ${errorTypeOf(errText)}`,
        httpStatus: response.status,
      });
    }

    let envelope: Record<string, unknown>;
    try {
      envelope = await response.json() as Record<string, unknown>;
    } catch {
      return finish({ ok: false, kind: 'MALFORMED_JSON', detail: 'response body was not JSON' });
    }

    const usage = (envelope?.usage ?? {}) as Record<string, unknown>;
    telemetry.promptTokens = numberOrNull(usage.input_tokens);
    telemetry.outputTokens = numberOrNull(usage.output_tokens);
    telemetry.cacheReadTokens = numberOrNull(usage.cache_read_input_tokens);
    telemetry.cacheWriteTokens = numberOrNull(usage.cache_creation_input_tokens);
    // Identity comes from the provider's own body. Echoing the request string back would make the
    // identity gate unfalsifiable.
    telemetry.respondedModel = typeof envelope?.model === 'string' ? envelope.model : null;
    telemetry.stopReason = typeof envelope?.stop_reason === 'string' ? envelope.stop_reason : null;

    // A refusal is a decision, not a transport accident -- it is not retried.
    if (telemetry.stopReason === 'refusal') {
      return finish({ ok: false, kind: 'PROVIDER_REFUSAL', detail: 'provider declined to analyze' });
    }
    if (telemetry.stopReason === 'max_tokens') {
      return finish({ ok: false, kind: 'TRUNCATED_RESPONSE', detail: 'generation hit the output limit' });
    }

    const content = Array.isArray(envelope?.content) ? envelope.content as unknown[] : [];
    const toolUse = content.find(b => {
      const block = (b ?? {}) as Record<string, unknown>;
      return block.type === 'tool_use' && block.name === EXPERT_TOOL_NAME;
    }) as Record<string, unknown> | undefined;

    if (!toolUse) {
      // Forced tool_choice was set, so this means the model answered some other way. That is a
      // structured-output failure, and it is recorded as one rather than being re-parsed out of
      // prose -- salvaging prose here would hide exactly what the probe is measuring.
      return finish({
        ok: false, kind: 'SCHEMA_INVALID_STRUCTURED_OUTPUT',
        detail: `no ${EXPERT_TOOL_NAME} tool_use block in response`,
      });
    }

    const wire = toolUse.input;
    if (!wire || typeof wire !== 'object' || Array.isArray(wire)) {
      return finish({
        ok: false, kind: 'SCHEMA_INVALID_STRUCTURED_OUTPUT',
        detail: 'tool_use input was not an object',
      });
    }
    if (isRefusalShaped(wire as Record<string, unknown>)) {
      return finish({ ok: false, kind: 'PROVIDER_REFUSAL', detail: 'provider declined to analyze' });
    }

    // Offsets are resolved here, from quotes. An unbindable quote is KEPT and made to fail at the
    // boundary -- see `bindWireAnalysis`. The adapter never decides that a quote was fabricated.
    const bound = bindWireAnalysis(wire, input);
    telemetry.binding = bound.binding;

    return finish({ ok: true, raw: bound.raw, modelIdentity: telemetry.respondedModel });
  }
}

/**
 * The taxonomy is the point of this mapping.
 *
 * 401/403 mean the credential is rejected and 404 means the model name is wrong -- all three are
 * configuration facts, so they map to `PROVIDER_NOT_CALLABLE`, which `isRetryableExpertFailure`
 * excludes from retry. Retrying an auth failure spends latency to reach the same answer, and the
 * probe brief says to stop rather than burn retries.
 *
 * Credit exhaustion arrives as a 400 `invalid_request_error` naming the credit balance, so it is
 * detected from the error TYPE and a narrow phrase match rather than being lumped into 4xx.
 */
export function classifyHttpFailure(status: number, bodyText: string): ExpertProviderFailureKind {
  if (status === 401 || status === 403 || status === 404) return 'PROVIDER_NOT_CALLABLE';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500) return 'HTTP_SERVER_ERROR';
  if (status === 400 && /credit balance|insufficient (credit|funds)|billing/i.test(bodyText)) {
    return 'CREDITS_EXHAUSTED';
  }
  return 'HTTP_CLIENT_ERROR';
}

/** The provider's error `type` only. The message may echo request content, so it is not returned. */
export function errorTypeOf(bodyText: string): string {
  try {
    const parsed = JSON.parse(bodyText) as { error?: { type?: unknown } };
    const t = parsed?.error?.type;
    return typeof t === 'string' ? t : 'unknown_error';
  } catch {
    return 'unparseable_error_body';
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
