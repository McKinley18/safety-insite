/**
 * L3-2o PHASE 2 -- ANTHROPIC CREDENTIAL + AVAILABILITY GATE.
 * Presence and LENGTH CLASS only. The credential is never printed, echoed, hashed or persisted.
 * Payload is the string "Reply ok" only -- zero scenario, corpus, customer or production content.
 */
'use strict';
const KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-5';               // PRE-AUTHORIZED. Never substituted.
const BASE = 'https://api.anthropic.com';
const H = { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' };

(async () => {
  const rec = { model: MODEL, checkedAt: new Date().toISOString() };
  rec.credentialPresent = typeof KEY === 'string' && KEY.length > 0;
  rec.credentialLengthClass = !rec.credentialPresent ? 'ABSENT'
    : KEY.length >= 32 ? 'PLAUSIBLE_>=32' : `IMPLAUSIBLE_<32`;
  if (!rec.credentialPresent || rec.credentialLengthClass !== 'PLAUSIBLE_>=32') {
    console.log(JSON.stringify(rec, null, 2)); process.exit(2);
  }

  // (a) model identity -- metadata only, zero content
  const m = await fetch(`${BASE}/v1/models/${MODEL}`, { headers: H });
  rec.modelsApi = { status: m.status };
  if (m.status === 200) {
    const j = await m.json();
    rec.modelsApi.identity = {
      id: j.id, display_name: j.display_name, created_at: j.created_at,
      max_input_tokens: j.max_input_tokens ?? null, max_tokens: j.max_tokens ?? null,
      capabilities: j.capabilities ?? null, type: j.type ?? null,
    };
  } else { rec.modelsApi.body = (await m.text()).slice(0, 400); }

  // (b) CALLABILITY -- the gate. Trivial payload, structured-output OFF.
  const c = await fetch(`${BASE}/v1/messages`, {
    method: 'POST', headers: H,
    body: JSON.stringify({ model: MODEL, max_tokens: 16, messages: [{ role: 'user', content: 'Reply ok' }] }),
  });
  rec.callability = { status: c.status };
  const cj = await c.json().catch(() => ({}));
  if (c.status === 200) {
    rec.callability.respondedModel = cj.model;
    rec.callability.stopReason = cj.stop_reason;
    rec.callability.usage = cj.usage ? { input: cj.usage.input_tokens, output: cj.usage.output_tokens } : null;
  } else { rec.callability.error = cj.error ? { type: cj.error.type, message: cj.error.message } : null; }

  // (c) STRUCTURED OUTPUT callability -- P-01 must be probed, not assumed.
  const so = await fetch(`${BASE}/v1/messages`, {
    method: 'POST', headers: H,
    body: JSON.stringify({
      model: MODEL, max_tokens: 64,
      output_config: { format: { type: 'json_schema', schema: {
        type: 'object', properties: { ok: { type: 'boolean' } }, required: ['ok'], additionalProperties: false } } },
      messages: [{ role: 'user', content: 'Reply ok' }],
    }),
  });
  rec.structuredOutput = { status: so.status };
  const sj = await so.json().catch(() => ({}));
  if (so.status === 200) {
    const t = (sj.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    rec.structuredOutput.parsed = (() => { try { return JSON.parse(t); } catch { return '__unparsed'; } })();
    rec.structuredOutput.stopReason = sj.stop_reason;
  } else { rec.structuredOutput.error = sj.error ? { type: sj.error.type, message: sj.error.message } : null; }

  console.log(JSON.stringify(rec, null, 2));
})();
