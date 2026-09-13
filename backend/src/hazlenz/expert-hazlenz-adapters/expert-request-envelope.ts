/**
 * EXPERT HAZLENZ -- THE CANONICAL PROVIDER REQUEST ENVELOPE. §246 Phase 7.
 *
 * ==================== WHY THIS FILE EXISTS ====================
 *
 * §243 transmitted its acceptance cohort WITHOUT the tool-level strict flag that the production
 * request builder sets, while inheriting the strict-mode schema SHAPE from the same adapter. The
 * schema was dressed for enforcement and sent unenforced. Five of fifteen structural failures sit on
 * that single omission, and nothing in the assembled request recorded that enforcement had not been
 * asked for.
 *
 * The defect was possible because `strict` is a top-level field on the tool definition, beside
 * `name`, `description` and `input_schema`. It is not part of the schema, so a caller that builds
 * the schema correctly and drops the flag produces a request that looks right at the point of
 * assembly and differs only in what the provider will accept back.
 *
 * This module removes the opportunity. Callers do not assemble tool blocks; they pass an envelope
 * and the leg-specific bytes, and the builder writes the flag. **A caller cannot omit a bound option
 * without deleting a field from a frozen literal**, which the §246 envelope suite catches.
 *
 * ==================== WHY IT LIVES IN THE ADAPTER DIRECTORY ====================
 *
 * It names a provider and a model. `test:expert-nocall-harness` section D reads every file under
 * `src/hazlenz/expert-hazlenz/` and fails on a vendor name, a network primitive, an endpoint or
 * a credential in module code. The semantic core stays provably vendor-neutral, and every
 * vendor-bound value lives here, exactly as the sibling provider adapter does it.
 *
 * ==================== WHAT IT IS NOT ====================
 *
 * It carries NO semantics. It does not build a prompt, a schema, or a projection, and it makes no
 * safety decision. It binds transport configuration and nothing else. The strict flag is a
 * STRUCTURAL CONFORMANCE control: it makes the provider enforce a schema the contract already
 * defined. It repairs no semantic-coherence failure and must never be reported as doing so.
 */

/**
 * ==================== §247: THE ENVELOPE OWNS THE CONFIGURATION ====================
 *
 * `AnthropicExpertConfig` and `EXPERT_HOSTED_INFERENCE_CONFIG` moved here from
 * `anthropic-expert-provider.ts`, unchanged in content. Slice 3 requires the envelope to be the ONLY
 * source of material provider configuration, and the adapter now consumes the envelope rather than
 * the reverse. The adapter re-exports both names so every historical importer keeps resolving.
 *
 * NOTE THE ABSENCES, BOTH OF WHICH ARE THE POINT. There is no `temperature` and no `seed`. On this
 * model `temperature`, `top_p` and `top_k` are removed and return 400, and there is no seed parameter
 * at all. The local adapter forwards both and recorded cheap repeatability as a result -- that
 * property does not transfer to this transport, and nothing here may imply it does.
 */
export interface AnthropicExpertConfig {
  endpoint: string;
  model: string;
  apiVersion: string;
  maxTokens: number;
  timeoutMs: number;
  /** Forced tool_choice plus thinking is the combination most likely to be rejected. */
  thinking: 'disabled' | 'adaptive';
  /** Published rates at authorization time. Used only to COMPUTE cost from reported usage. */
  inputUsdPerMTok: number;
  outputUsdPerMTok: number;
}

export const EXPERT_HOSTED_INFERENCE_CONFIG: AnthropicExpertConfig = {
  endpoint: process.env.EXPERT_ANTHROPIC_ENDPOINT || 'https://api.anthropic.com',
  model: process.env.EXPERT_ANTHROPIC_MODEL || 'claude-sonnet-5',
  apiVersion: '2023-06-01',
  maxTokens: Number(process.env.EXPERT_ANTHROPIC_MAX_TOKENS || 8000),
  timeoutMs: Number(process.env.EXPERT_ANTHROPIC_TIMEOUT_MS || 180_000),
  thinking: (process.env.EXPERT_ANTHROPIC_THINKING as 'disabled' | 'adaptive') || 'disabled',
  inputUsdPerMTok: 2,
  outputUsdPerMTok: 10,
};

export const EXPERT_REQUEST_ENVELOPE_VERSION = 'hazlenz.expert.request-envelope.v1' as const;

/** Which leg of the two-call Expert protocol a request belongs to. */
export type ExpertRequestLeg = 'FIRST_PASS' | 'VERIFIER';

/**
 * Every provider option capable of materially changing what comes back.
 *
 * If an option can change the output and is not here, the envelope is incomplete and the §246
 * identity is a weaker claim than it appears. Adding one is a deliberate act with a version bump.
 */
export interface ExpertRequestEnvelope {
  readonly envelopeVersion: typeof EXPERT_REQUEST_ENVELOPE_VERSION;
  readonly providerId: string;
  readonly model: string;
  readonly endpoint: string;
  readonly apiVersion: string;
  /**
   * The §243 omission. Bound here so neither caller can drop it, and so that flipping it is a
   * visible, identity-changing act rather than a caller's oversight.
   *
   * §252: this is now FALSE by product-owner decision. §251 proved the complete Expert semantic
   * contract cannot be compiled into this provider's strict single-call grammar without deleting
   * capability, so strict enforcement was closed and the structural obligation moved to
   * `admitExpertOutput252`. The flag remains bound here, and Candidate Identity encodes its value,
   * so a switch in EITHER direction changes the candidate.
   */
  readonly strictSchema: boolean;
  readonly firstPassMaxTokens: number;
  readonly verifierMaxTokens: number;
  readonly thinking: 'disabled' | 'adaptive';
  /** Forced tool choice, so a prose answer cannot be scored as a schema failure. */
  readonly forceToolChoice: boolean;
}

/**
 * THE ONE ENVELOPE. Production and acceptance both consume this value.
 *
 * The token limits are stated per leg because §243 used different limits per leg and a single
 * `maxTokens` would have silently changed the verifier request when the envelope was adopted.
 * Truncation is a measured failure mode, so the two numbers are bound rather than merged.
 */
export const EXPERT_REQUEST_ENVELOPE: ExpertRequestEnvelope = {
  envelopeVersion: EXPERT_REQUEST_ENVELOPE_VERSION,
  providerId: `anthropic:${EXPERT_HOSTED_INFERENCE_CONFIG.model}`,
  model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
  endpoint: EXPERT_HOSTED_INFERENCE_CONFIG.endpoint,
  apiVersion: EXPERT_HOSTED_INFERENCE_CONFIG.apiVersion,
  // §252. FALSE by product-owner decision; see `strictSchema` on the interface above. This is not a
  // restoration of §243: every post-§243 safeguard is retained and the structural conformance the
  // provider used to enforce is now enforced deterministically by §252 structural admission.
  strictSchema: false,
  firstPassMaxTokens: EXPERT_HOSTED_INFERENCE_CONFIG.maxTokens,
  verifierMaxTokens: EXPERT_HOSTED_INFERENCE_CONFIG.maxTokens,
  thinking: EXPERT_HOSTED_INFERENCE_CONFIG.thinking,
  forceToolChoice: true,
};

/** The leg-specific bytes the semantic core produced. The envelope never authors these. */
export interface ExpertLegBytes {
  readonly leg: ExpertRequestLeg;
  readonly systemPrompt: string;
  readonly userPrompt: string;
  readonly toolName: string;
  readonly toolDescription: string;
  /** Already through the provider-native strict wrapper and compatibility strip. */
  readonly inputSchema: unknown;
}

/**
 * Assemble the request body. THE ONLY PLACE EITHER CALLER BUILDS A TOOL BLOCK.
 *
 * `strict` is written from the envelope unconditionally. There is no parameter that suppresses it
 * and no code path that reaches the tool block without passing through here.
 */
export function buildEnvelopeRequestBody(
  bytes: ExpertLegBytes, envelope: ExpertRequestEnvelope = EXPERT_REQUEST_ENVELOPE,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: envelope.model,
    max_tokens: bytes.leg === 'FIRST_PASS'
      ? envelope.firstPassMaxTokens : envelope.verifierMaxTokens,
    system: bytes.systemPrompt,
    messages: [{ role: 'user', content: bytes.userPrompt }],
    tools: [{
      name: bytes.toolName,
      description: bytes.toolDescription,
      strict: envelope.strictSchema,
      input_schema: bytes.inputSchema,
    }],
    thinking: { type: envelope.thinking },
  };
  if (envelope.forceToolChoice) {
    body.tool_choice = { type: 'tool', name: bytes.toolName };
  }
  return body;
}

/** The bound options, as data, so a freeze can hash the configuration rather than trust a comment. */
export function envelopeBoundOptions(
  envelope: ExpertRequestEnvelope = EXPERT_REQUEST_ENVELOPE,
): Readonly<Record<string, string | number | boolean>> {
  return {
    envelopeVersion: envelope.envelopeVersion,
    providerId: envelope.providerId,
    model: envelope.model,
    endpoint: envelope.endpoint,
    apiVersion: envelope.apiVersion,
    strictSchema: envelope.strictSchema,
    firstPassMaxTokens: envelope.firstPassMaxTokens,
    verifierMaxTokens: envelope.verifierMaxTokens,
    thinking: envelope.thinking,
    forceToolChoice: envelope.forceToolChoice,
  };
}

/** Every key `envelopeBoundOptions` must carry. The suite asserts the two agree in both directions. */
export const EXPERT_REQUEST_ENVELOPE_BOUND_KEYS: readonly string[] = [
  'envelopeVersion', 'providerId', 'model', 'endpoint', 'apiVersion', 'strictSchema',
  'firstPassMaxTokens', 'verifierMaxTokens', 'thinking', 'forceToolChoice',
];
