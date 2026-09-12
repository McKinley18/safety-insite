import { buildAnthropicRequestBody } from
  '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import { ROUTING_FIXTURES } from '../src/safescope-v2/expert-hazlenz/fixtures/routing-fixtures';

const body = buildAnthropicRequestBody(ROUTING_FIXTURES[0].input);
const tool = (body.tools as any[])[0];
function findKeys(node: any, keys: Set<string>, path = ''): string[] {
  const hits: string[] = [];
  if (Array.isArray(node)) { node.forEach((v, i) => hits.push(...findKeys(v, keys, `${path}[${i}]`))); return hits; }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (keys.has(k)) hits.push(`${path}.${k} = ${JSON.stringify(v)}`);
      hits.push(...findKeys(v, keys, `${path}.${k}`));
    }
  }
  return hits;
}
console.log('model:', body.model, 'thinking:', JSON.stringify(body.thinking));
console.log('tool_choice:', JSON.stringify(body.tool_choice));
console.log('strict:', tool.strict);
console.log('\n=== constraint keywords present in input_schema ===');
for (const h of findKeys(tool.input_schema, new Set(['minLength','maxLength','minItems','maxItems','pattern','minimum','maximum']))) {
  console.log(' ', h);
}
console.log('\n=== top-level schema keys ===', Object.keys(tool.input_schema));
console.log('=== schema size (chars) ===', JSON.stringify(tool.input_schema).length);
