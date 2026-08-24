/**
 * L3-2h CROSS-PROVIDER TRANSPORT SHIM — Ollama /api/chat protocol -> Google Gemini generateContent.
 *
 * WHY A SHIM AND NOT A HARNESS EDIT. `ablate-l32g-state-separation.ts` is digest-locked at
 * 73f74131b4f8cbb31ad57ba972e1e0edbcaaa275d27558866d8bc2a4e71c6521 and §38.7 confines adapter work
 * to TRANSPORT. This process speaks the Ollama wire protocol the harness already emits, so the
 * harness runs BYTE-UNMODIFIED against a second provider: scenario texts, expected labels, variants,
 * prompts, JSON schema, resolver orderings and scorers are never touched. Only L3_OLLAMA_ENDPOINT
 * and L3_OLLAMA_MODEL change, and both are pre-existing environment hooks the harness already reads.
 *
 * WHAT IS NOT TRANSLATABLE, recorded rather than hidden:
 *   - `num_ctx` (8192) has no Gemini equivalent; Gemini's context is fixed and far larger. A silent
 *     truncation is therefore impossible in the direction the local config was guarding against.
 *   - `format` (JSON Schema, Ollama dialect) -> `responseSchema` (OpenAPI 3.0 subset). The
 *     conversion is mechanical and lossless for every construct this schema uses EXCEPT
 *     `additionalProperties: false`, which Gemini does not accept and which is dropped. Field order
 *     is preserved explicitly via `propertyOrdering`.
 *
 * CREDENTIAL HANDLING. Read from the environment at startup, held in memory, sent only as the
 * `x-goog-api-key` header to generativelanguage.googleapis.com. Never logged, echoed, hashed or
 * written to any artifact. The transport log below carries status codes, latencies and token counts
 * only — no credential, no prompt text, no scenario text, no model prose.
 */
'use strict';
const http = require('http');
const { appendFileSync } = require('fs');

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { console.error('FATAL: GEMINI_API_KEY not set'); process.exit(1); }

const MODEL = process.env.GEMINI_MODEL_ID || 'gemini-3.1-pro-preview';
const PORT = Number(process.env.SHIM_PORT || 11435);
const THINKING_LEVEL = process.env.THINKING_LEVEL || 'low';
const MAX_OUTPUT_TOKENS = Number(process.env.MAX_OUTPUT_TOKENS || 16384);
const TRANSPORT_LOG = process.env.TRANSPORT_LOG || '/dev/null';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/** JSON Schema (Ollama dialect) -> Gemini responseSchema (OpenAPI 3.0 subset). */
function convertSchema(node) {
  if (!node || typeof node !== 'object') return node;
  const out = {};
  let t = node.type;
  if (Array.isArray(t)) {
    if (t.includes('null')) out.nullable = true;
    t = t.find((x) => x !== 'null');
  }
  if (typeof t === 'string') out.type = t.toUpperCase();
  // An empty enum is inexpressible in Gemini; the accompanying maxItems:0 already forbids members.
  if (Array.isArray(node.enum) && node.enum.length > 0) out.enum = node.enum.slice();
  if (node.properties && typeof node.properties === 'object') {
    out.properties = {};
    const keys = Object.keys(node.properties);
    for (const k of keys) out.properties[k] = convertSchema(node.properties[k]);
    out.propertyOrdering = keys; // preserve the harness's field order explicitly
  }
  if (Array.isArray(node.required)) out.required = node.required.slice();
  if (node.items) out.items = convertSchema(node.items);
  if (node.maxItems !== undefined) out.maxItems = node.maxItems;
  if (node.minItems !== undefined) out.minItems = node.minItems;
  // `additionalProperties` is deliberately dropped: unsupported by Gemini responseSchema.
  return out;
}

function logTransport(rec) {
  if (TRANSPORT_LOG === '/dev/null') return;
  try { appendFileSync(TRANSPORT_LOG, JSON.stringify(rec) + '\n'); } catch { /* non-fatal */ }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callGemini(body) {
  const system = (body.messages || []).find((m) => m.role === 'system');
  const user = (body.messages || []).find((m) => m.role === 'user');
  const opts = body.options || {};

  const req = {
    contents: [{ role: 'user', parts: [{ text: user ? user.content : '' }] }],
    generationConfig: {
      temperature: opts.temperature !== undefined ? opts.temperature : 0,
      responseMimeType: 'application/json',
      responseSchema: convertSchema(body.format),
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      thinkingConfig: { thinkingLevel: THINKING_LEVEL },
    },
  };
  if (system) req.systemInstruction = { parts: [{ text: system.content }] };
  // Ollama's `seed` maps directly; Gemini honours it as a best-effort determinism hint.
  if (opts.seed !== undefined) req.generationConfig.seed = opts.seed;

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
        headers: { 'content-type': 'application/json', 'x-goog-api-key': API_KEY },
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

/** Gemini response -> the Ollama envelope shape the harness reads. */
function toOllamaEnvelope(g, model) {
  const cand = g && g.candidates && g.candidates[0];
  const parts = (cand && cand.content && cand.content.parts) || [];
  // Thought parts are marked `thought: true` and are NOT the structured answer.
  const text = parts.filter((p) => p && p.thought !== true && typeof p.text === 'string')
                    .map((p) => p.text).join('');
  const usage = (g && g.usageMetadata) || {};
  const env = {
    model,
    message: { role: 'assistant', content: text },
    done: true,
    prompt_eval_count: typeof usage.promptTokenCount === 'number' ? usage.promptTokenCount : null,
    eval_count: typeof usage.candidatesTokenCount === 'number' ? usage.candidatesTokenCount : null,
  };
  if (cand && cand.finishReason === 'MAX_TOKENS') env.done_reason = 'length';
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
    const r = await callGemini(body);
    if (r.httpStatus !== 200) {
      logTransport({ ts: new Date().toISOString(), status: r.httpStatus, attempt: r.attempt,
        errorStatus: r.payload && r.payload.error && r.payload.error.status });
      res.writeHead(r.httpStatus, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: 'upstream', status: r.httpStatus }));
    }
    const env = toOllamaEnvelope(r.payload, body.model || MODEL);
    const cand = r.payload.candidates && r.payload.candidates[0];
    logTransport({
      ts: new Date().toISOString(), status: 200, latencyMs: Date.now() - started, attempt: r.attempt,
      finishReason: cand && cand.finishReason,
      promptTokens: env.prompt_eval_count, outputTokens: env.eval_count,
      thoughtTokens: (r.payload.usageMetadata || {}).thoughtsTokenCount ?? null,
      contentChars: env.message.content.length,
    });
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(env));
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`shim up 127.0.0.1:${PORT} -> ${MODEL} (thinkingLevel=${THINKING_LEVEL})`);
});
