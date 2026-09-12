/**
 * §251 -- THE COMPLETE SCHEMA TRANSPORT PROBE LADDER, AS EXECUTED.
 *
 * Every probe here is a SCHEMA TRANSPORT PROBE and none is capability evidence. Each uses the same
 * synthetic prompt, carries no frozen §250 observation and no customer data, and allows 64 output
 * tokens. Rejected requests are billed nothing; accepted ones returned a placeholder tool call.
 *
 * The ladder is recorded as one runnable file so the §251 conclusion is reproducible rather than
 * narrated. Re-running it re-spends; it is guarded behind an explicit flag.
 */
import { governedBindingFor } from '../src/safescope-v2/expert-hazlenz/contract/expert-first-pass-instruction-vnext';
import { buildExpert239WireSchema } from '../src/safescope-v2/expert-hazlenz/contract/expert-239-posture-contract';
import { buildExpert247WireSchema } from '../src/safescope-v2/expert-hazlenz/contract/expert-247-posture-contract';
import { transmitted, inputFor, CASES_251 } from './analyze-251-wire-budget';
import { buildCompact251WireSchema, slotProfile } from './analyze-251-compaction-ceiling';
import { runSchemaProbe, summarize, probeCallCount, probeSpend } from './probe-251-strict-schema';

const stripDesc = (n: any): any => {
  if (Array.isArray(n)) return n.map(stripDesc);
  if (!n || typeof n !== 'object') return n;
  const o: any = {};
  for (const [k, v] of Object.entries(n)) { if (k === 'description') continue; o[k] = stripDesc(v); }
  return o;
};
const pick = (base: any, keys: string[]): any => {
  const props: any = {}; for (const k of keys) props[k] = base.properties[k];
  return { type: 'object', properties: props, required: keys, additionalProperties: false };
};
const drop = (base: any, remove: string[]): any =>
  pick(base, Object.keys(base.properties).filter(k => !remove.includes(k)));

const LEAF = {
  type: 'object', additionalProperties: false,
  required: ['alphaIdentifier', 'betaNarrative', 'gammaNarrative', 'deltaCategory',
    'epsilonCategory', 'zetaNarrative', 'etaFlag', 'thetaNarrative'],
  properties: {
    alphaIdentifier: { type: 'string' }, betaNarrative: { type: 'string' },
    gammaNarrative: { type: 'string' },
    deltaCategory: { type: 'string', enum: ['CATEGORY_ALPHA', 'CATEGORY_BETA', 'CATEGORY_GAMMA', 'CATEGORY_DELTA', 'CATEGORY_EPSILON', 'CATEGORY_ZETA'] },
    epsilonCategory: { type: 'string', enum: ['LEVEL_ROUTINE', 'LEVEL_IMPORTANT', 'LEVEL_BLOCKING'] },
    zetaNarrative: { type: 'string' }, etaFlag: { type: 'boolean' }, thetaNarrative: { type: 'string' },
  },
};
const repeated = (n: number, viaDefs: boolean): any => {
  const keys = Array.from({ length: n }, (_, i) => `repeatedBlock${i}`);
  const s: any = { type: 'object', additionalProperties: false, required: keys, properties: {} };
  if (viaDefs) s.$defs = { leaf: JSON.parse(JSON.stringify(LEAF)) };
  for (const k of keys) {
    s.properties[k] = { type: 'array', items: viaDefs ? { $ref: '#/$defs/leaf' } : JSON.parse(JSON.stringify(LEAF)) };
  }
  return s;
};
const flat = (n: number, kind: 'string' | 'enum6' | 'refString', withDesc = false): any => {
  const props: any = {}; const req: string[] = [];
  for (let i = 0; i < n; i++) {
    const k = `field${i}`; req.push(k);
    props[k] = kind === 'string' ? { type: 'string' }
      : kind === 'enum6' ? { type: 'string', enum: ['ALPHA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON', 'ZETA'] }
        : withDesc ? { $ref: '#/$defs/text', description: `narrative field number ${i}, written by the model` }
          : { $ref: '#/$defs/text' };
  }
  const s: any = { type: 'object', additionalProperties: false, required: req, properties: props };
  if (kind === 'refString') s.$defs = { text: { type: 'string' } };
  return s;
};
let seq = 0; const nameMap = new Map<string, string>();
let eseq = 0; const enumMap = new Map<string, string>();
const shortName = (k: string): string => {
  if (!nameMap.has(k)) nameMap.set(k, `p${(seq++).toString(36)}`);
  return nameMap.get(k) as string;
};
const shortEnum = (v: string): string => {
  if (!enumMap.has(v)) enumMap.set(v, `e${(eseq++).toString(36)}`);
  return enumMap.get(v) as string;
};
function codeLiterals(n: any): any {
  if (Array.isArray(n)) return n.map(codeLiterals);
  if (!n || typeof n !== 'object') return n;
  const o: any = {};
  for (const [k, v] of Object.entries<any>(n)) {
    if (k === 'properties') { const p: any = {}; for (const [pk, pv] of Object.entries(v)) p[shortName(pk)] = codeLiterals(pv); o[k] = p; }
    else if (k === 'required') o[k] = (v as string[]).map(shortName);
    else if (k === 'enum') o[k] = (v as any[]).map(m => (typeof m === 'string' ? shortEnum(m) : m));
    else o[k] = codeLiterals(v);
  }
  return o;
}

async function main(): Promise<void> {
  if (process.env.SECTION_251_ALLOW_PROBE_SPEND !== 'yes') {
    console.log('This ladder makes provider calls. Set SECTION_251_ALLOW_PROBE_SPEND=yes to run it.');
    console.log('The executed results are recorded in PROBE-LEDGER-251.jsonl and '
      + 'SECTION-251-FULL-SCHEMA-STRICT-PROBE.json.');
    return;
  }
  const inp = inputFor(CASES_251[0]); const g = governedBindingFor([]);
  const t239 = transmitted(buildExpert239WireSchema(inp, g));
  const t247 = transmitted(buildExpert247WireSchema(inp, g));
  const t251 = transmitted(buildCompact251WireSchema(inp, g));
  const b: any = stripDesc(t239);

  const ladder: { id: string; schema: unknown; purpose: string; model?: string }[] = [
    { id: 'P1-239-FULL-CONTROL', schema: t239, purpose: 'same-session control reproducing the §250 C2 rejection' },
    { id: 'P2-239-NO-DESCRIPTIONS', schema: b, purpose: 'do descriptions drive compiled grammar size' },
    { id: 'Q1-unresolvedFactDeclarations', schema: pick(b, ['unresolvedFactDeclarations']), purpose: 'one 12-property object alone' },
    { id: 'Q2-crossHazardInsights', schema: pick(b, ['crossHazardInsights']), purpose: 'one 5-property object alone' },
    { id: 'Q3-expertHazardCandidates', schema: pick(b, ['expertHazardCandidates']), purpose: 'one 10-property object alone' },
    { id: 'Q4-immediateSafetyPosture', schema: pick(b, ['immediateSafetyPosture']), purpose: 'the nested posture object alone' },
    { id: 'S1-TWO-WIDE-OBJECTS', schema: pick(b, ['unresolvedFactDeclarations', 'expertHazardCandidates']), purpose: 'two wide objects, few bytes' },
    { id: 'S2-MANY-NARROW-OBJECTS', schema: pick(b, ['crossHazardInsights', 'disagreements', 'decisionCriticalClarifications', 'immediateSafetyPosture', 'expertExplanation', 'uncertainty', 'outcome']), purpose: 'seven properties, more bytes, narrower objects' },
    { id: 'T1-REPEATED-INLINE', schema: repeated(14, false), purpose: '14 inline copies of one 8-property shape' },
    { id: 'T2-REPEATED-VIA-DEFS', schema: repeated(14, true), purpose: 'the same shape defined once in $defs and referenced 14 times' },
    { id: 'T3-239-SHORT-LITERALS', schema: codeLiterals(JSON.parse(JSON.stringify(b))), purpose: 'does literal LENGTH drive compiled grammar size' },
    { id: 'U-FLAT-64-STRING', schema: flat(64, 'string'), purpose: '64 unconstrained string properties' },
    { id: 'U-FLAT-32-ENUM6', schema: flat(32, 'enum6'), purpose: '32 six-member-enum properties' },
    { id: 'U-FLAT-64-ENUM6', schema: flat(64, 'enum6'), purpose: '64 six-member-enum properties' },
    { id: 'U-FLAT-128-ENUM6', schema: flat(128, 'enum6'), purpose: '128 six-member-enum properties' },
    { id: 'V1-64-STRING-VIA-REF', schema: flat(64, 'refString'), purpose: 'does a shared $defs string collapse per-instance string cost' },
    { id: 'V2-64-STRING-REF-WITH-DESC', schema: flat(64, 'refString', true), purpose: 'the same with sibling descriptions' },
    { id: 'W1-239-minus-declarations', schema: drop(b, ['unresolvedFactDeclarations']), purpose: 'budget bracket on the real base' },
    { id: 'W2-239-minus-candidates', schema: drop(b, ['expertHazardCandidates']), purpose: 'budget bracket on the real base' },
    { id: 'X-239-FULL-claude-opus-5', schema: t239, model: 'claude-opus-5', purpose: 'is the grammar budget model-specific' },
    { id: 'X-239-FULL-claude-haiku-4-5', schema: t239, model: 'claude-haiku-4-5', purpose: 'is the grammar budget model-specific' },
    { id: 'X-247-FULL-claude-opus-5', schema: t247, model: 'claude-opus-5', purpose: 'is the union limit model-specific' },
    { id: 'Y1-251-COMPACT-FULL', schema: t251, purpose: 'the complete compacted transmitted schema' },
  ];
  for (const l of ladder) {
    const p = slotProfile(stripDesc(l.schema));
    console.log(summarize(await runSchemaProbe({
      probeId: l.id, strict: true, inputSchema: l.schema, model: l.model,
      purpose: `${l.purpose} (slots=${p.slots} freeStrings=${p.freeStrings} enumMembers=${p.enumMembers})`,
    })));
  }
  console.log(`\nprobe calls ${probeCallCount()}  spend USD ${probeSpend().toFixed(6)}`);
}
void main();
