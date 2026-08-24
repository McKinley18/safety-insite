/**
 * L3-2o CROSS-PROVIDER TRANSPORT SHIM -- Ollama /api/chat protocol -> Anthropic Messages API.
 *
 * WHY A SHIM AND NOT A HARNESS EDIT. Identical reasoning to the L3-2h shim (0ba265bb...), which this
 * file mirrors structurally. `ablate-l32g-state-separation.ts` is digest-locked and section 38.7
 * confines adapter work to TRANSPORT. This process speaks the Ollama wire protocol the harness
 * already emits, so `activate-l32j-shipped-corpus.ts` and `diagnose-l32k-shipped-residual.ts` run
 * BYTE-UNMODIFIED against a third provider: scenario texts, expected labels, variants, prompts, the
 * JSON schema, resolver orderings and scorers are never touched. Only L3_OLLAMA_ENDPOINT and
 * L3_OLLAMA_MODEL change, and both are pre-existing environment hooks the harness already reads.
 *
 * THIS FILE IS AN EXPERIMENTAL INSTRUMENT. It lives outside backend/src, is not customer-
 * authoritative, is not behind `HazLenzReasoningProvider`, and creates no production hosted path.
 *
 * ===================== FIDELITY DEVIATIONS -- MEASURED, NOT ASSUMED =====================
 * Each was established by submitting the construct to the live API and recording the response
 * (provider/SCHEMA_KEYWORD_PROBE.json), not by reading prose. Only UNSUPPORTED TRANSPORT-LEVEL
 * keywords are removed, and every one is independently enforced by
 * `deterministic-safety-validator.ts` -- which is why nothing is weakened by removing it.
 *
 *   D1  `minItems: 2` on clarification.branches  -> STRIPPED.
 *       400: "For 'array' type, 'minItems' values other than 0 or 1 are not supported".
 *       Independently enforced: validator line 268 -> INVALID_CLARIFICATION_DEPENDENCY.
 *   D2  `maxItems: 0` on regulatoryCandidateRefs -> STRIPPED.
 *       400: "For 'array' type, property 'maxItems' is not supported".
 *       Independently enforced: validator line 247 -> UNSUPPORTED_REGULATORY_CANDIDATE_REFERENCE
 *       and line 61 -> INVENTED_REGULATORY_CANDIDATE (L3-INV-01 is structural).
 *   D3  EMPTY `enum: []` on regulatoryCandidateRefs.items -> STRIPPED.
 *       400: "Invalid schema: Enum must be a non-empty array". Same enforcement as D2.
 *   D4  `options.temperature` (0) -> NOT FORWARDED. `temperature` is deprecated on Claude 4.7+ and
 *       returns 400 when set to a non-default value. NO determinism control is available.
 *   D5  `options.seed` (20260822) -> NO ANTHROPIC EQUIVALENT. Dropped.
 *   D6  `options.num_ctx` (8192) -> NO EQUIVALENT; the context window is 1,000,000 and fixed.
 *       Silent truncation in the direction the local config guarded against is impossible.
 *
 * NOT deviations, verified against the live API rather than assumed:
 *   `minLength: 1`                  ACCEPTED at the wire level (3 sites) -- kept. This is BETTER
 *                                   fidelity than PROVIDER_SELECTION.md predicted on 2026-08-22.
 *   `additionalProperties: false`   REQUIRED by Anthropic and already present at all 7 sites -- kept.
 *   `type: ["object","null"]`       ACCEPTED natively (3 sites) -- kept, no anyOf rewrite needed.
 *   schema key order                preserved: the schema is forwarded as JSON, so document order
 *                                   survives transport. Anthropic needs no `propertyOrdering`.
 *
 * INFERENCE CONFIG. Provider DEFAULTS are used and nothing is tuned: `thinking` and
 * `output_config.effort` are both omitted, which on claude-sonnet-5 means adaptive thinking at the
 * documented default effort `high`. No prompt, schema or sampling parameter is tuned to help the
 * provider pass.
 *
 * CREDENTIAL HANDLING. Read from the environment at startup, held in memory, sent only as the
 * `x-api-key` header to api.anthropic.com. Never logged, echoed, hashed or written to any artifact.
 * The transport log carries status codes, latencies and token counts only -- no credential, no
 * prompt text, no scenario text, no model prose.
 */
'use strict';
const http = require('http');
const { appendFileSync } = require('fs');

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) { console.error('FATAL: ANTHROPIC_API_KEY not set'); process.exit(1); }

const MODEL = process.env.ANTHROPIC_MODEL_ID || 'claude-sonnet-5';
const PORT = Number(process.env.SHIM_PORT || 11438);
const MAX_OUTPUT_TOKENS = Number(process.env.MAX_OUTPUT_TOKENS || 16384);
const TRANSPORT_LOG = process.env.TRANSPORT_LOG || '/dev/null';
const ENDPOINT = 'https://api.anthropic.com/v1/messages';

/** Deviation counters, reported at shutdown so the strips are COUNTED, not just described. */
const DEV = { minItemsStripped: 0, maxItemsStripped: 0, emptyEnumStripped: 0 };

/** JSON Schema (Ollama dialect) -> the Anthropic structured-output subset. See D1-D3 above. */
function convertSchema(node) {
  if (!node || typeof node !== 'object') return node;
  if (Array.isArray(node)) return node.map(convertSchema);
  const out = {};
  for (const [k, v] of Object.entries(node)) {
    if (k === 'minItems') {
      if (v === 0 || v === 1) out.minItems = v; else DEV.minItemsStripped += 1;   // D1
      continue;
    }
    if (k === 'maxItems') { DEV.maxItemsStripped += 1; continue; }                 // D2
    if (k === 'enum') {
      if (Array.isArray(v) && v.length === 0) { DEV.emptyEnumStripped += 1; continue; } // D3
      out.enum = v.slice();
      continue;
    }
    if (k === 'properties' && v && typeof v === 'object') {
      out.properties = {};
      for (const pk of Object.keys(v)) out.properties[pk] = convertSchema(v[pk]);  // order preserved
      continue;
    }
    if (k === 'items') { out.items = convertSchema(v); continue; }
    if (Array.isArray(v)) { out[k] = v.slice(); continue; }
    if (v && typeof v === 'object') { out[k] = convertSchema(v); continue; }
    out[k] = v;
  }
  return out;
}

function logTransport(rec) {
  if (TRANSPORT_LOG === '/dev/null') return;
  try { appendFileSync(TRANSPORT_LOG, JSON.stringify(rec) + '\n'); } catch { /* non-fatal */ }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callAnthropic(body) {
  const system = (body.messages || []).find((m) => m.role === 'system');
  const user = (body.messages || []).find((m) => m.role === 'user');

  const req = {
    model: MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    messages: [{ role: 'user', content: user ? user.content : '' }],
  };
  if (system) req.system = system.content;
  if (body.format) req.output_config = { format: { type: 'json_schema', schema: convertSchema(body.format) } };
  // D4/D5/D6: options.temperature, options.seed and options.num_ctx are deliberately NOT forwarded.

  // Bounded retry on transient transport faults ONLY. A 4xx other than 429 is returned as-is so the
  // harness records it rather than having it masked by a retry loop.
  const MAX_ATTEMPTS = 4;
  let attempt = 0, lastStatus = 0, lastText = '';
  while (attempt < MAX_ATTEMPTS) {
    attempt += 1;
    const started = Date.now();
    let res, text;
    try {
      res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify(req),
      });
      text = await res.text();
    } catch (e) {
      lastStatus = 0; lastText = String((e && e.message) || e);
      if (attempt < MAX_ATTEMPTS) { await sleep(1000 * attempt); continue; }
      return { httpStatus: 502, payload: { error: 'transport', detail: lastText }, attempt };
    }
    lastStatus = res.status; lastText = text;
    const latencyMs = Date.now() - started;
    if (res.status === 429 || res.status >= 500) {
      logTransport({ ts: new Date().toISOString(), status: res.status, latencyMs, attempt, retrying: attempt < MAX_ATTEMPTS });
      if (attempt < MAX_ATTEMPTS) { await sleep(2000 * attempt); continue; }
    }
    return { httpStatus: res.status, payload: safeParse(text), attempt, latencyMs };
  }
  return { httpStatus: lastStatus || 502, payload: safeParse(lastText), attempt };
}

function safeParse(t) { try { return JSON.parse(t); } catch { return { __unparsed: true }; } }

/** Anthropic response -> the Ollama envelope shape the harness reads. */
function toOllamaEnvelope(a, model) {
  const blocks = (a && a.content) || [];
  // `thinking` blocks are NOT the structured answer; only `text` blocks carry it.
  const text = blocks.filter((b) => b && b.type === 'text' && typeof b.text === 'string')
                     .map((b) => b.text).join('');
  const usage = (a && a.usage) || {};
  const env = {
    model,
    message: { role: 'assistant', content: text },
    done: true,
    prompt_eval_count: typeof usage.input_tokens === 'number' ? usage.input_tokens : null,
    eval_count: typeof usage.output_tokens === 'number' ? usage.output_tokens : null,
  };
  if (a && a.stop_reason === 'max_tokens') env.done_reason = 'length';
  return env;
}

const server = http.createServer((req, res) => {
  if (req.method !== 'POST' || !req.url.startsWith('/api/chat')) {
    res.writeHead(404, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ error: 'not found' }));
  }
  let raw = '';
  req.on('data', (c) => { raw += c; });
  req.on('end', async () => {
    let body;
    try { body = JSON.parse(raw); }
    catch {
      res.writeHead(400, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: 'bad request' }));
    }
    const started = Date.now();
    const r = await callAnthropic(body);
    if (r.httpStatus !== 200) {
      logTransport({ ts: new Date().toISOString(), status: r.httpStatus, attempt: r.attempt,
        errorType: r.payload && r.payload.error && r.payload.error.type });
      res.writeHead(r.httpStatus, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: 'upstream', status: r.httpStatus }));
    }
    const env = toOllamaEnvelope(r.payload, body.model || MODEL);
    logTransport({
      ts: new Date().toISOString(), status: 200, latencyMs: Date.now() - started, attempt: r.attempt,
      stopReason: r.payload.stop_reason,
      respondedModel: r.payload.model,
      promptTokens: env.prompt_eval_count, outputTokens: env.eval_count,
      contentChars: env.message.content.length,
    });
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(env));
  });
});

process.on('SIGTERM', () => { console.log('deviations ' + JSON.stringify(DEV)); process.exit(0); });
process.on('SIGINT', () => { console.log('deviations ' + JSON.stringify(DEV)); process.exit(0); });

server.listen(PORT, '127.0.0.1', () => {
  console.log(`shim up 127.0.0.1:${PORT} -> ${MODEL} (provider defaults: adaptive thinking, effort high)`);
});
