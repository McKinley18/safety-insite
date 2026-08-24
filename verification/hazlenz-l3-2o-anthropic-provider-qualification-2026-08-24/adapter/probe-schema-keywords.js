/** L3-2o -- measure which JSON-Schema keywords the Anthropic structured-output surface ACCEPTS.
 *  Payload is the string "x" only. No scenario, corpus, customer or production content. */
'use strict';
const KEY = process.env.ANTHROPIC_API_KEY;
const H = { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' };
const obj = (props, extra = {}) => ({ type: 'object', properties: props, required: Object.keys(props), additionalProperties: false, ...extra });

const CASES = {
  'baseline object+enum+required+additionalProperties:false': obj({ a: { type: 'string', enum: ['x'] } }),
  'minLength:1':            obj({ a: { type: 'string', minLength: 1 } }),
  'minItems:2':             obj({ a: { type: 'array', items: { type: 'string' }, minItems: 2 } }),
  'minItems:1':             obj({ a: { type: 'array', items: { type: 'string' }, minItems: 1 } }),
  'maxItems:0':             obj({ a: { type: 'array', items: { type: 'string' }, maxItems: 0 } }),
  'empty enum':             obj({ a: { type: 'array', items: { type: 'string', enum: [] } } }),
  'type union ["object","null"]': obj({ a: { type: ['object', 'null'], properties: { b: { type: 'string' } }, required: ['b'], additionalProperties: false } }),
  'anyOf [object,null]':    obj({ a: { anyOf: [obj({ b: { type: 'string' } }), { type: 'null' }] } }),
  'type:"null" alone':      obj({ a: { type: 'null' } }),
  'nested array of objects': obj({ a: { type: 'array', items: obj({ b: { type: 'string' } }) } }),
};

(async () => {
  const out = {};
  for (const [name, schema] of Object.entries(CASES)) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: H,
      body: JSON.stringify({ model: 'claude-sonnet-5', max_tokens: 64,
        output_config: { format: { type: 'json_schema', schema } },
        messages: [{ role: 'user', content: 'x' }] }),
    });
    const j = await r.json().catch(() => ({}));
    out[name] = r.status === 200 ? 'ACCEPTED'
      : `REJECTED ${r.status}: ${(j.error && j.error.message || '').slice(0, 210)}`;
    console.log(`${r.status === 200 ? 'OK  ' : 'FAIL'}  ${name.padEnd(48)} ${out[name] === 'ACCEPTED' ? '' : out[name]}`);
  }
  require('fs').writeFileSync(process.argv[2], JSON.stringify(out, null, 2));
})();
