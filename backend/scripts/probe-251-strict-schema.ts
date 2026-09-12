/**
 * §251 -- SYNTHETIC STRICT SCHEMA TRANSPORT PROBE.
 *
 * THESE CALLS ARE NOT CAPABILITY EVIDENCE. Every probe uses a synthetic minimal prompt, carries no
 * frozen §250 observation and no customer data, and allows minimal generation. They establish only
 * whether the provider will COMPILE and ACCEPT a given strict tool schema.
 *
 * Recorded separately as SCHEMA TRANSPORT PROBE, never as driver-role evidence.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

{
  const envPath = join(__dirname, '..', '.env');
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
    }
  }
}

import {
  buildEnvelopeRequestBody, EXPERT_REQUEST_ENVELOPE, type ExpertRequestEnvelope,
} from '../src/safescope-v2/expert-hazlenz-adapters/expert-request-envelope';

export const OUT_251 = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-251-strict-wire-schema-budget-2026-09-12');
if (!existsSync(OUT_251)) mkdirSync(OUT_251, { recursive: true });

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

/** Minimal generation allowance. A probe never needs a real analysis back. */
const PROBE_ENVELOPE: ExpertRequestEnvelope = {
  ...EXPERT_REQUEST_ENVELOPE, firstPassMaxTokens: 64, verifierMaxTokens: 64,
};

/** The one synthetic stimulus. It carries no observation and asks for no safety judgement. */
export const SYNTHETIC_PROBE_PROMPT =
  'This is a schema transport probe. Emit the tool call with placeholder values. Do not analyse '
  + 'anything.';

export interface ProbeResult {
  probeId: string;
  purpose: string;
  model: string;
  strict: boolean;
  schemaSha: string;
  schemaBytes: number;
  httpStatus: number | null;
  accepted: boolean;
  providerErrorType: string | null;
  providerErrorMessage: string | null;
  reachedInference: boolean;
  stopReason: string | null;
  toolUseReturned: boolean;
  inputTokens: number | null;
  outputTokens: number | null;
  costUsd: number;
  latencyMs: number;
}

let probeCalls = 0;
let probeSpendUsd = 0;
export const probeLedger: ProbeResult[] = [];

export function probeCallCount(): number { return probeCalls; }
export function probeSpend(): number { return probeSpendUsd; }

export async function runSchemaProbe(args: {
  probeId: string; purpose: string; inputSchema: unknown;
  systemPrompt?: string; strict?: boolean; toolName?: string; model?: string;
}): Promise<ProbeResult> {
  const started = Date.now();
  const strict = args.strict !== false;
  const toolName = args.toolName ?? 'emit_expert_analysis';
  const body = buildEnvelopeRequestBody({
    leg: 'FIRST_PASS',
    systemPrompt: args.systemPrompt ?? 'You are a schema transport probe target.',
    userPrompt: SYNTHETIC_PROBE_PROMPT,
    toolName,
    toolDescription: 'Emit the Expert HazLenz advisory analysis. This is the ONLY way to answer.',
    inputSchema: args.inputSchema,
  }, { ...PROBE_ENVELOPE, strictSchema: strict,
       model: args.model ?? PROBE_ENVELOPE.model });

  probeCalls += 1;
  const res: ProbeResult = {
    probeId: args.probeId, purpose: args.purpose,
    model: args.model ?? PROBE_ENVELOPE.model, strict,
    schemaSha: sha(JSON.stringify(args.inputSchema)),
    schemaBytes: Buffer.byteLength(JSON.stringify(args.inputSchema), 'utf8'),
    httpStatus: null, accepted: false, providerErrorType: null, providerErrorMessage: null,
    reachedInference: false, stopReason: null, toolUseReturned: false,
    inputTokens: null, outputTokens: null, costUsd: 0, latencyMs: 0,
  };

  let response: Response;
  try {
    response = await fetch(`${EXPERT_REQUEST_ENVELOPE.endpoint}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY as string,
        'anthropic-version': EXPERT_REQUEST_ENVELOPE.apiVersion,
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    res.providerErrorType = 'TRANSPORT';
    res.providerErrorMessage = (e as Error).message.slice(0, 300);
    res.latencyMs = Date.now() - started;
    probeLedger.push(res);
    appendFileSync(join(OUT_251, 'PROBE-LEDGER-251.jsonl'), `${JSON.stringify(res)}\n`);
    return res;
  }

  res.httpStatus = response.status;
  if (!response.ok) {
    const t = await response.text().catch(() => '');
    try {
      const p = JSON.parse(t) as { error?: { type?: string; message?: string } };
      res.providerErrorType = p?.error?.type ?? null;
      res.providerErrorMessage = (p?.error?.message ?? '').slice(0, 600);
    } catch { res.providerErrorMessage = t.slice(0, 600); }
  } else {
    const env = await response.json() as Record<string, any>;
    const usage = (env.usage ?? {}) as Record<string, number>;
    res.accepted = true;
    res.reachedInference = true;
    res.stopReason = typeof env.stop_reason === 'string' ? env.stop_reason : null;
    res.inputTokens = usage.input_tokens ?? null;
    res.outputTokens = usage.output_tokens ?? null;
    res.costUsd = ((usage.input_tokens ?? 0) / 1e6) * 2 + ((usage.output_tokens ?? 0) / 1e6) * 10;
    probeSpendUsd += res.costUsd;
    res.toolUseReturned = (Array.isArray(env.content) ? env.content : [])
      .some((b: any) => b?.type === 'tool_use' && b?.name === toolName);
  }
  res.latencyMs = Date.now() - started;
  probeLedger.push(res);
  appendFileSync(join(OUT_251, 'PROBE-LEDGER-251.jsonl'), `${JSON.stringify(res)}\n`);
  return res;
}

export function summarize(r: ProbeResult): string {
  return `${r.probeId.padEnd(28)} model=${r.model} strict=${r.strict} http=${r.httpStatus} `
    + `accepted=${r.accepted} bytes=${r.schemaBytes}`
    + (r.providerErrorMessage ? `\n    ${r.providerErrorMessage}` : '');
}
