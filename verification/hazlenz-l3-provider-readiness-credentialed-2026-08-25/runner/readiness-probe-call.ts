/**
 * L3 PROVIDER READINESS -- CREDENTIAL-PROVISIONED FINAL RETRY (attempt 4)
 * PHASE 5/6/7 RUNNER. DISPOSABLE INSTRUMENT. NOT CUSTOMER-AUTHORITATIVE.
 *
 * It issues EXACTLY ONE real Anthropic request, through the FROZEN execution path:
 *
 *   frozen probe observationText
 *     -> buildReasoningInput        (reasoning-input-builder.ts @ 2865ae91, UNMODIFIED)
 *     -> buildProposalSchema        (reasoning-prompt.ts       @ 426302a4, UNMODIFIED)
 *     -> L3_SYSTEM_PROMPT + buildUserPrompt                    (UNMODIFIED)
 *     -> the frozen Ollama request envelope the sealed harnesses emit, byte-for-byte in shape
 *     -> anthropic-ollama-shim.js   (@ 76d3e039, UNMODIFIED)  -> api.anthropic.com
 *     -> response / schema boundary
 *     -> bindProposal               (reasoning-prompt.ts, UNMODIFIED)
 *     -> validateReasoningProposal  (deterministic-safety-validator.ts @ 942ac7cc, UNMODIFIED)
 *
 * NOT DONE HERE, DELIBERATELY: no acceptance scorer, no G1-G10, no hazard-accuracy judgement, no
 * semantic quality assessment, no tuning, no remediation, no retry with an alternate prompt,
 * schema, model or provider.
 *
 * THE ONLY OBSERVATION IT CAN SEND is the pre-frozen NON_HOLDOUT_PROVIDER_READINESS_PROBE, whose
 * observationText sha256 is asserted against the frozen value BEFORE the request is built. It
 * reads no holdout row, no protected source row and no reserved row.
 *
 * SINGLE-CALL ENFORCEMENT is mechanical: `callsIssued` is incremented before the request and any
 * second entry into the call path throws.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { createHash } from 'crypto';
import type { ReasoningInput, L3RegulatoryContextValue } from '../../../backend/src/safescope-v2/reasoning-l3/reasoning-contract.types';
import { buildReasoningInput } from '../../../backend/src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { L3_PROMPT_VERSION, L3_SYSTEM_PROMPT, bindProposal, buildProposalSchema, buildUserPrompt }
  from '../../../backend/src/safescope-v2/reasoning-l3/reasoning-prompt';
import { L3_2_INFERENCE_CONFIG } from '../../../backend/src/safescope-v2/reasoning-l3/ollama-reasoning-provider';
import { validateReasoningProposal } from '../../../backend/src/safescope-v2/reasoning-l3/deterministic-safety-validator';

const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const CFG = L3_2_INFERENCE_CONFIG;
const ROOT = join(__dirname, '..', '..', '..');
const PROBE = join(ROOT, 'verification', 'hazlenz-l3-provider-readiness-retry-2026-08-24', 'probe', 'probe-observation.json');
const HARNESS = join(ROOT, 'backend', 'scripts', 'ablate-l32g-state-separation.ts');

const FROZEN_OBS_SHA = '52520318956ac8d0bf0d33b1430816edd91da8b64ed0477e374a378d2491f5be';
const FROZEN_SCHEMA_SHA = 'a522cf5aa2d556824100139adf4951e75b9135c42f6d0c771009cc97e99da385';
const FROZEN_PROMPT_SHA = 'b8cc50fce71950db0188103c352fde0243938d9210e2a219341b9255d9bcbacf';
const AUTHORIZED_MODEL = 'claude-sonnet-5';

/** The 24 allowed hazard families, READ from the locked harness rather than retyped. */
function fam(): string[] {
  const src = readFileSync(HARNESS, 'utf8');
  const block = src.slice(src.indexOf('\nconst FAM = ['));
  return JSON.parse(block.slice(block.indexOf('['), block.indexOf(']') + 1).replace(/'/g, '"').replace(/,\s*\]/, ']'));
}

let callsIssued = 0;

async function main() {
  // ---- the probe, verified before it can be used -------------------------------------------
  const probe = JSON.parse(readFileSync(PROBE, 'utf8'));
  const obsSha = sha(probe.observationText);
  if (probe.classification !== 'NON_HOLDOUT_PROVIDER_READINESS_PROBE') throw new Error('probe classification is not NON_HOLDOUT');
  if (obsSha !== FROZEN_OBS_SHA) throw new Error(`probe observationText sha mismatch: ${obsSha}`);

  // ---- the frozen execution path, assembled but not yet sent --------------------------------
  if (sha(L3_SYSTEM_PROMPT) !== FROZEN_PROMPT_SHA) throw new Error('L3_SYSTEM_PROMPT digest mismatch');
  const FAM = fam();
  const input: ReasoningInput = buildReasoningInput({
    analysisId: 'l3-provider-readiness-probe',
    observationText: probe.observationText,
    regulatoryContext: { value: 'osha-general-industry' as L3RegulatoryContextValue, provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: FAM as any,
  }).input;
  const schema = buildProposalSchema(input);
  const schemaSha = sha(JSON.stringify(schema));
  if (schemaSha !== FROZEN_SCHEMA_SHA) throw new Error(`run schema digest mismatch: ${schemaSha}`);
  if (CFG.model !== AUTHORIZED_MODEL) throw new Error(`requested model is not the authorized model: ${CFG.model}`);

  const body = {
    model: CFG.model, stream: false, format: schema,
    options: { temperature: CFG.temperature, seed: CFG.seed, num_ctx: CFG.numCtx },
    messages: [
      { role: 'system', content: L3_SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(input) },
    ],
  };

  // ---- PHASE 5: exactly one real provider call ----------------------------------------------
  callsIssued += 1;
  if (callsIssued > 1) throw new Error('SECOND CALL REFUSED -- this phase authorizes exactly one');

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), CFG.timeoutMs);
  const t0 = Date.now();
  let httpStatus: number | null = null, envelope: any = null, transportError: string | null = null;
  try {
    const res = await fetch(`${CFG.endpoint}/api/chat`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body), signal: ac.signal,
    });
    httpStatus = res.status;
    const text = await res.text();
    try { envelope = JSON.parse(text); } catch { envelope = { __unparsed: true }; }
  } catch (e: any) {
    transportError = e?.name === 'AbortError' ? 'TIMEOUT' : String(e?.message || e);
  } finally { clearTimeout(t); }
  const latencyMs = Date.now() - t0;

  // ---- PHASE 7: structural traversal ONLY ---------------------------------------------------
  let parsed: any = null, parseError: string | null = null;
  const content: string = envelope?.message?.content ?? '';
  if (httpStatus === 200) {
    try { parsed = JSON.parse(content); } catch { parseError = 'MALFORMED_STRUCTURED_OUTPUT'; }
  }
  let bound: any = null, binderError: string | null = null;
  if (parsed) { try { bound = bindProposal(parsed, input); } catch (e: any) { binderError = String(e?.message || e); } }
  let validation: any = null, validatorError: string | null = null;
  if (bound) { try { validation = validateReasoningProposal(bound.proposal, input); } catch (e: any) { validatorError = String(e?.message || e); } }

  const cands: any[] = Array.isArray(parsed?.hazardCandidates) ? parsed.hazardCandidates : [];

  const out = {
    phase: 'L3 PROVIDER READINESS -- CREDENTIAL-PROVISIONED FINAL RETRY (attempt 4)',
    role: 'PROVIDER_READINESS_ONLY -- NOT ACCEPTANCE EVIDENCE, NOT A QUALITY MEASUREMENT',
    generatedAt: new Date().toISOString(),
    pid: process.pid,
    probe: {
      probeId: probe.probeId,
      classification: probe.classification,
      observationTextSha256: obsSha,
      observationTextSha256Verdict: obsSha === FROZEN_OBS_SHA ? 'MATCH' : 'MISMATCH',
      altered: false,
      acceptanceSemantics: 'NONE',
      scored: false,
    },
    frozenExecutionPath: {
      promptVersion: L3_PROMPT_VERSION,
      systemPromptSha256: sha(L3_SYSTEM_PROMPT),
      runSchemaSha256: schemaSha,
      runSchemaVerdict: schemaSha === FROZEN_SCHEMA_SHA ? 'MATCH' : 'MISMATCH',
      inputBuilder: 'buildReasoningInput (shipped, unmodified)',
      userPromptBuilder: 'buildUserPrompt (shipped, unmodified)',
      endpoint: CFG.endpoint,
      temperature: CFG.temperature, seed: CFG.seed, numCtx: CFG.numCtx, timeoutMs: CFG.timeoutMs,
    },
    providerCall: {
      providerCallCount: callsIssued,
      requestedModel: CFG.model,
      httpStatus,
      transportError,
      latencyMs,
      envelopeModelField: envelope?.model ?? null,
      envelopeDone: envelope?.done ?? null,
      envelopeDoneReason: envelope?.done_reason ?? null,
      promptTokens: envelope?.prompt_eval_count ?? null,
      outputTokens: envelope?.eval_count ?? null,
      contentChars: typeof content === 'string' ? content.length : null,
    },
    executionPathCompatibility: {
      responseParsedAsJson: parsed !== null,
      parseError,
      topLevelKeys: parsed ? Object.keys(parsed) : null,
      candidateCount: cands.length,
      candidateKeySets: cands.map(c => (c && typeof c === 'object' ? Object.keys(c) : null)),
      conditionStates: cands.map(c => c?.conditionState ?? null),
      outcomePresent: parsed ? Object.prototype.hasOwnProperty.call(parsed, 'outcome') : null,
      binderReached: bound !== null,
      binderError,
      binderQuoteBinding: bound?.binding ?? null,
      validatorReached: validation !== null,
      validatorError,
      validationState: validation?.state ?? null,
      validationIssueCodes: (validation?.issues ?? []).map((i: any) => i.code),
      validatedHazardCount: validation?.validated?.hazards?.length ?? null,
    },
    NOT_PERFORMED: {
      acceptanceScorerExecutions: 0,
      g1ToG10Evaluations: 0,
      hazardAccuracyJudgement: 'NOT PERFORMED',
      semanticQualityJudgement: 'NOT PERFORMED',
      tuning: 'NO', remediation: 'NO',
      holdoutRowsRead: 0, holdoutRowsTransmitted: 0, reservedRowsTransmitted: 0,
      modelProseRecorded: 'NO -- no rationale, question or narrative text is stored in this artifact',
    },
  };

  const dest = process.env.OUT || 'readiness-call.json';
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, JSON.stringify(out, null, 2));
  console.log(`provider calls issued: ${callsIssued}  http: ${httpStatus}  wrote ${dest}  pid ${process.pid}`);
}

main().catch(e => { console.error(e); process.exit(1); });
