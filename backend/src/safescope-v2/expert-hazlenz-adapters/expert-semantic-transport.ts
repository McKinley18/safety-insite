/**
 * EXPERT HAZLENZ -- the vendor transport for the production entry point. §246 Phase 4 / Phase 7.
 *
 * ==================== WHAT THIS IS ====================
 *
 * `ExpertSemanticTransport` is the neutral seam the production entry point calls. This file is the
 * one implementation of it that reaches a hosted provider. It owns the vendor and owns nothing else:
 * it does not build a prompt, does not build a schema, does not project, and makes no safety
 * decision. It receives bytes the semantic core produced and returns the tool input RAW.
 *
 * ==================== WHY THE STRICT FLAG CANNOT BE DROPPED HERE ====================
 *
 * The tool block is assembled by `buildEnvelopeRequestBody`, which writes `strict` from the canonical
 * envelope unconditionally. This file has no code path that builds a tool block itself, so the §243
 * omission -- a caller that assembled the strict-mode schema SHAPE and then never asked the provider
 * to enforce it -- is not expressible from here.
 *
 * The provider-native pipeline is applied in the same order the production request builder has always
 * used: canonical schema -> strict wrapper (`additionalProperties: false`) -> the §108
 * Anthropic-only compatibility strip (`minLength` / `minItems`). Only the transmitted request is
 * affected; the contract's own schema object is never mutated.
 *
 * ==================== RAW MEANS RAW ====================
 *
 * `toolInput` is typed `unknown`. This adapter cannot assert that validation has happened, and
 * everything it returns must still cross the §239 projection and the §210J declaration projection in
 * the core. A refusal is reported as a failure, never re-parsed out of prose.
 */

import type {
  ExpertLegRequest, ExpertLegResponse, ExpertSemanticTransport,
} from '../expert-hazlenz/expert-hazlenz-analysis';
import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords, classifyHttpFailure, errorTypeOf,
  EXPERT_HOSTED_INFERENCE_CONFIG,
} from './anthropic-expert-provider';
import {
  EXPERT_REQUEST_ENVELOPE, buildEnvelopeRequestBody, type ExpertRequestEnvelope,
} from './expert-request-envelope';

export class HostedExpertSemanticTransport implements ExpertSemanticTransport {
  /**
   * §268 — the usage the provider reported for the most recent leg.
   *
   * The numbers are already in hand: this class reads the provider's whole response envelope, and
   * `usage.input_tokens` / `usage.output_tokens` sit beside the content it already parses. They
   * were simply being discarded, which is why §266 found the cost columns on
   * `expert_analysis_executions` permanently null.
   *
   * It is kept HERE rather than added to `ExpertLegResponse` because that type lives in
   * `expert-hazlenz-analysis.ts`, which is element 5 of the §259 candidate identity — changing it
   * would change the candidate. See `ExpertLegUsageReporter` in the product seam for the full
   * reasoning. Nothing about the request, the response, or the semantic contract changes here;
   * this class only stops throwing a number away.
   */
  private lastLegUsage: { inputTokens: number | null; outputTokens: number | null } | null = null;

  constructor(
    private readonly envelope: ExpertRequestEnvelope = EXPERT_REQUEST_ENVELOPE,
    private readonly timeoutMs: number = EXPERT_HOSTED_INFERENCE_CONFIG.timeoutMs,
  ) {}

  /** Reading CLEARS it, so a leg that reported nothing cannot inherit the previous leg's numbers. */
  takeLastLegUsage(): { inputTokens: number | null; outputTokens: number | null } | null {
    const usage = this.lastLegUsage;
    this.lastLegUsage = null;
    return usage;
  }

  async send(request: ExpertLegRequest): Promise<ExpertLegResponse> {
    const fail = (kind: string, detail: string): ExpertLegResponse =>
      ({ ok: false, toolInput: null, failureKind: kind, detail });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.trim() === '') return fail('NOT_CONFIGURED', 'credential is not set');

    let body: Record<string, unknown>;
    try {
      body = buildEnvelopeRequestBody({
        leg: request.leg,
        systemPrompt: request.systemPrompt,
        userPrompt: request.userPrompt,
        toolName: request.toolName,
        toolDescription: request.toolDescription,
        inputSchema: stripAnthropicUnsupportedKeywords(
          applyStrictSchemaWrapper(request.wireSchema)),
      }, this.envelope);
    } catch (e) {
      return fail('NOT_CONFIGURED', describe(e));
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    let response: Response;
    try {
      response = await fetch(`${this.envelope.endpoint}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': this.envelope.apiVersion,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (e: unknown) {
      clearTimeout(timer);
      if ((e as { name?: string })?.name === 'AbortError') {
        return fail('TIMEOUT', `no response within ${this.timeoutMs}ms`);
      }
      return fail('NETWORK_ERROR', describe(e));
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      // The provider's error TYPE only. The body may echo the request, so it is never included.
      return fail(classifyHttpFailure(response.status, errText),
        `HTTP ${response.status} ${errorTypeOf(errText)}`);
    }

    let envelope: Record<string, unknown>;
    try {
      envelope = await response.json() as Record<string, unknown>;
    } catch {
      return fail('MALFORMED_JSON', 'response body was not JSON');
    }

    // §268. Recorded BEFORE any of the refusal branches below, because a refused, truncated or
    // structurally invalid answer STILL COST MONEY. Accounting that only captured successful legs
    // would under-report exactly the spend a beta most needs to see.
    const usage = (envelope?.usage ?? {}) as Record<string, unknown>;
    const tokenCount = (value: unknown): number | null =>
      typeof value === 'number' && Number.isFinite(value) ? value : null;
    this.lastLegUsage = {
      inputTokens: tokenCount(usage.input_tokens),
      outputTokens: tokenCount(usage.output_tokens),
    };

    const stopReason = typeof envelope?.stop_reason === 'string' ? envelope.stop_reason : null;
    if (stopReason === 'refusal') return fail('PROVIDER_REFUSAL', 'provider declined to analyze');
    if (stopReason === 'max_tokens') {
      return fail('TRUNCATED_RESPONSE', 'generation hit the output limit');
    }

    const content = Array.isArray(envelope?.content) ? envelope.content as unknown[] : [];
    const toolUse = content.find(b => {
      const block = (b ?? {}) as Record<string, unknown>;
      return block.type === 'tool_use' && block.name === request.toolName;
    }) as Record<string, unknown> | undefined;

    if (!toolUse) {
      // Forced tool choice was set, so this means the model answered some other way. Recorded as a
      // structured-output failure rather than salvaged out of prose.
      return fail('SCHEMA_INVALID_STRUCTURED_OUTPUT',
        `no ${request.toolName} tool_use block in response`);
    }
    return { ok: true, toolInput: toolUse.input, failureKind: null, detail: null };
  }
}

/** Operator-facing only. Never carries observation text or a credential. */
function describe(e: unknown): string {
  return (e instanceof Error ? e.message : String(e)).slice(0, 200);
}
