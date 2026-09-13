/**
 * §203 -- CANONICAL EFFECTIVE GRAMMAR IDENTITY: PROOF MATRIX.
 *
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NO SEMANTIC SELF-GRADING.
 *
 * Sections:
 *   A  the §201 retirement -- each dangerous equivalence measured against the §201 module AS IT
 *      STANDS (proving the defect is real, not remembered), then proven split by §203.
 *   B  the Ruling-7 distinction matrix -- every required distinction gets at least one pair proven
 *      to produce DIFFERENT §203 identities, including the §202 gaps G1-G3 measured differentially
 *      against the §202 module.
 *   C  intentional equivalence -- pairs differing only in scenario/annotation content produce the
 *      SAME identity.
 *   D  the §199 cohort replay -- reconstruction validated against the recorded contract ids FIRST,
 *      then the partition, then the SG-02 suppression replay under the §203 key, the §200 key, and
 *      the two rejected enum-sensitive alternatives (the measured justification for R4).
 *   E  cache-key composition and the machine-readable proxy claims.
 *
 * NOTHING HERE WAS EXERCISED AGAINST A PROVIDER. Every §199 outcome used below is READ from
 * CIRCUIT-BREAKER-LOG.jsonl and CAPABILITY-TRANSPORT-DIAGNOSIS.json.
 */

import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import type { ExpertAnalysisInput } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { stableStringify } from '../src/hazlenz/expert-hazlenz/expert-prompt';
import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords,
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  buildExpertVNextWireSchema, governedBindingFor, governedBindingCapability,
} from './lib/expert-first-pass-instruction-vnext';
import { SECTION_199_COHORT, type Section199Row } from './lib/expert-199-cohort-2026-09-07';
import {
  effectiveGrammarIdentity as grammarId201,
} from './lib/expert-201-harness-hardening';
import {
  effectiveGrammarIdentity as grammarId202,
  EFFECTIVE_GRAMMAR_IDENTITY_VERSION as VERSION_202,
} from './lib/expert-202-effective-grammar-identity';
import {
  EFFECTIVE_GRAMMAR_IDENTITY_203_VERSION, RETIRES_PROSPECTIVELY,
  EFFECTIVE_GRAMMAR_IDENTITY_203_IS_A_PROXY, GRAMMAR_MEASUREMENT_CLAIMS_203,
  EFFECTIVE_GRAMMAR_IDENTITY_203_RULES, EFFECTIVE_GRAMMAR_IDENTITY_203_LIMITS,
  GRAMMAR_LITERAL_KEYWORDS_203,
  effectiveGrammarIdentity203, grammarProjection203, describeGrammarProjection203,
  partitionByGrammarIdentity203, canonicalJson203, grammarRejectionKey203,
} from './lib/expert-203-effective-grammar-identity';

const ROOT = join(__dirname, '..', '..');
const E199 = join(ROOT, 'verification', 'expert-hazlenz-successor-structured-e2e-2026-09-07');

let passed = 0;
let failed = 0;
function ok(id: string, condition: boolean, detail = ''): void {
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const id203 = effectiveGrammarIdentity203;

// ============================================================ A. the §201 retirement

ok('A1. §201 AS IT STANDS merges {type:"string"} with {type:"number"} — the defect is real',
  grammarId201({ type: 'string' }) === grammarId201({ type: 'number' }));
ok('A2. §203 splits {type:"string"} from {type:"number"}',
  id203({ type: 'string' }) !== id203({ type: 'number' }));
ok('A3. §201 merges additionalProperties:false with :true; §203 splits them',
  grammarId201({ type: 'object', additionalProperties: false })
    === grammarId201({ type: 'object', additionalProperties: true })
  && id203({ type: 'object', additionalProperties: false })
    !== id203({ type: 'object', additionalProperties: true }));
ok('A4. §201 merges pattern "^a$" with "^[0-9]{40}$"; §203 splits them',
  grammarId201({ type: 'string', pattern: '^a$' })
    === grammarId201({ type: 'string', pattern: '^[0-9]{40}$' })
  && id203({ type: 'string', pattern: '^a$' })
    !== id203({ type: 'string', pattern: '^[0-9]{40}$' }));
ok('A5. §203 carries its own version identity and names what it retires',
  EFFECTIVE_GRAMMAR_IDENTITY_203_VERSION === 'hazlenz.expert.203.effective-grammar-identity.v1'
  && (EFFECTIVE_GRAMMAR_IDENTITY_203_VERSION as string) !== (VERSION_202 as string)
  && RETIRES_PROSPECTIVELY.includes('201'));

// ============================================================ B. the distinction matrix

ok('B1. primitive types are pairwise distinct',
  new Set(['string', 'number', 'integer', 'boolean', 'object', 'array']
    .map(t => id203({ type: t }))).size === 6);

ok('B2. an object schema and an array schema differ beyond the type keyword',
  id203({ properties: { a: { type: 'string' } } }) !== id203({ items: { type: 'string' } }));

ok('B3. different required SETS split',
  id203({ type: 'object', required: ['a', 'b'] }) !== id203({ type: 'object', required: ['a', 'c'] }));

ok('B4. different property NAMES split',
  id203({ type: 'object', properties: { a: { type: 'string' } } })
    !== id203({ type: 'object', properties: { b: { type: 'string' } } }));

ok('B5. a nested difference at depth three splits',
  id203({ properties: { a: { properties: { b: { properties: { c: { type: 'string' } } } } } } })
    !== id203({ properties: { a: { properties: { b: { properties: { c: { type: 'number' } } } } } } }));

ok('B6. enum ARITY splits and enum member KINDS split',
  id203({ enum: ['A', 'B', 'C'] }) !== id203({ enum: ['A', 'B', 'C', 'D'] })
  && id203({ enum: ['A', 'B'] }) !== id203({ enum: [1, 2] }));

ok('B7. const VALUES split (const is grammar-literal, unlike enum members)',
  id203({ const: 'A' }) !== id203({ const: 'B' }));

ok('B8. additionalProperties false / true / subschema are pairwise distinct',
  new Set([
    id203({ type: 'object', additionalProperties: false }),
    id203({ type: 'object', additionalProperties: true }),
    id203({ type: 'object', additionalProperties: { type: 'string' } }),
  ]).size === 3);

ok('B9. single-schema items vs tuple items split, and tuple arity splits',
  id203({ type: 'array', items: { type: 'string' } })
    !== id203({ type: 'array', items: [{ type: 'string' }] })
  && id203({ type: 'array', items: [{ type: 'string' }, { type: 'number' }] })
    !== id203({ type: 'array', items: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }] }));

{
  // every grammar-literal keyword splits on a value change — totality over the declared set
  const base: Record<string, unknown> = { type: 'object' };
  const valueA: Record<string, unknown> = {
    type: 'string', format: 'date', pattern: '^a$', const: 'x', $ref: '#/a',
    minLength: 1, maxLength: 5, minimum: 0, maximum: 9,
    exclusiveMinimum: 0, exclusiveMaximum: 9, multipleOf: 2,
    minItems: 1, maxItems: 5, minProperties: 1, maxProperties: 5,
    minContains: 1, maxContains: 5,
    uniqueItems: true, nullable: true, strict: true,
    contentEncoding: 'base64', contentMediaType: 'text/plain',
  };
  const valueB: Record<string, unknown> = {
    type: 'number', format: 'time', pattern: '^b$', const: 'y', $ref: '#/b',
    minLength: 2, maxLength: 6, minimum: 1, maximum: 8,
    exclusiveMinimum: 1, exclusiveMaximum: 8, multipleOf: 3,
    minItems: 2, maxItems: 6, minProperties: 2, maxProperties: 6,
    minContains: 2, maxContains: 6,
    uniqueItems: false, nullable: false, strict: false,
    contentEncoding: 'base32', contentMediaType: 'text/html',
  };
  const merged: string[] = [];
  for (const kw of GRAMMAR_LITERAL_KEYWORDS_203) {
    const a = { ...base, [kw]: valueA[kw] };
    const b = { ...base, [kw]: valueB[kw] };
    if (id203(a) === id203(b)) merged.push(kw);
  }
  ok('B10. EVERY declared grammar-literal keyword splits on a value change',
    merged.length === 0, merged.length === 0 ? `${GRAMMAR_LITERAL_KEYWORDS_203.size} keywords` : `merged: ${merged.join(',')}`);
}

ok('B11. anyOf vs oneOf split; alternative COUNT splits; alternative CONTENT splits; ORDER splits (D2)',
  id203({ anyOf: [{ type: 'string' }, { type: 'number' }] })
    !== id203({ oneOf: [{ type: 'string' }, { type: 'number' }] })
  && id203({ anyOf: [{ type: 'string' }, { type: 'number' }] })
    !== id203({ anyOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }] })
  && id203({ anyOf: [{ type: 'string' }, { type: 'number' }] })
    !== id203({ anyOf: [{ type: 'string' }, { type: 'boolean' }] })
  && id203({ anyOf: [{ type: 'string' }, { type: 'number' }] })
    !== id203({ anyOf: [{ type: 'number' }, { type: 'string' }] }));

ok('B12. nullable: presence of "null" in a type array splits; type-array order MERGES (D1 set); '
  + 'the two nullable representations split (D3)',
  id203({ type: 'string' }) !== id203({ type: ['string', 'null'] })
  && id203({ type: ['string', 'null'] }) === id203({ type: ['null', 'string'] })
  && id203({ type: ['string', 'null'] }) !== id203({ type: 'string', nullable: true }));

ok('B13. propertyNames subschemas split',
  id203({ type: 'object', propertyNames: { pattern: '^a' } })
    !== id203({ type: 'object', propertyNames: { pattern: '^b' } }));

ok('B14. dependentRequired NAME content splits under §203 (G1) — and §202 AS IT STANDS merges it',
  id203({ type: 'object', dependentRequired: { a: ['x'] } })
    !== id203({ type: 'object', dependentRequired: { a: ['y'] } })
  && grammarId202({ type: 'object', dependentRequired: { a: ['x'] } })
    === grammarId202({ type: 'object', dependentRequired: { a: ['y'] } }));

ok('B14b. dependentRequired name-array ORDER merges (a set), and map KEYS split',
  id203({ type: 'object', dependentRequired: { a: ['x', 'y'] } })
    === id203({ type: 'object', dependentRequired: { a: ['y', 'x'] } })
  && id203({ type: 'object', dependentRequired: { a: ['x'] } })
    !== id203({ type: 'object', dependentRequired: { b: ['x'] } }));

ok('B15. unevaluatedProperties false vs true splits under §203 (G2) — and §202 AS IT STANDS merges it',
  id203({ type: 'object', unevaluatedProperties: false })
    !== id203({ type: 'object', unevaluatedProperties: true })
  && grammarId202({ type: 'object', unevaluatedProperties: false })
    === grammarId202({ type: 'object', unevaluatedProperties: true }));

ok('B16. a property literally NAMED "description" is a property, not an annotation — its subschema splits',
  id203({ type: 'object', properties: { description: { type: 'string' } } })
    !== id203({ type: 'object', properties: { description: { type: 'number' } } }));

ok('B17. patternProperties KEYS are grammar (they are patterns) and split',
  id203({ type: 'object', patternProperties: { '^a': { type: 'string' } } })
    !== id203({ type: 'object', patternProperties: { '^b': { type: 'string' } } }));

// ============================================================ C. intentional equivalence

ok('C1. description CONTENT does not split',
  id203({ type: 'string', description: 'long long long prose' })
    === id203({ type: 'string', description: 'short' }));

ok('C2. description PRESENCE does not split (the §201 correction, retained)',
  id203({ type: 'string', description: 'anything' }) === id203({ type: 'string' }));

ok('C3. title / examples / default / $comment do not split',
  id203({ type: 'string', title: 'a', examples: ['x'], default: 'y', $comment: 'z' })
    === id203({ type: 'string', title: 'b', examples: ['p', 'q'], default: 'r', $comment: 's' })
  && id203({ type: 'string', title: 'a' }) === id203({ type: 'string' }));

ok('C4. enum member VALUES do not split — scenario ids are data, not grammar',
  id203({ enum: ['OBS-SF-01'] }) === id203({ enum: ['OBS-SG-01'] })
  && id203({ enum: ['machine_guarding', 'lockout_tagout', 'electrical'] })
    === id203({ enum: ['confined_space', 'fall_protection', 'chemical_exposure'] }));

ok('C5. required ORDER and object KEY order do not split',
  id203({ type: 'object', required: ['a', 'b'] }) === id203({ type: 'object', required: ['b', 'a'] })
  && id203(JSON.parse('{"type":"object","properties":{"a":{"type":"string"},"b":{"type":"number"}}}'))
    === id203(JSON.parse('{"properties":{"b":{"type":"number"},"a":{"type":"string"}},"type":"object"}')));

// ============================================================ D. the §199 cohort replay

/** §199's own request construction, reproduced exactly as §202 reproduced it. */
function analysisInput(row: Section199Row): ExpertAnalysisInput {
  return {
    contractVersion: 'hazlenz.expert.input.v1',
    analysisId: `AN-199-${row.rowId}`,
    authoritativeSources: [
      { sourceId: `OBS-${row.rowId}`, sourceType: 'observation', text: row.observation },
    ],
    inspectionContext: { location: row.location, task: row.task },
    jurisdiction: row.jurisdiction,
    allowedHazardFamilies: [...row.allowedHazardFamilies],
    deterministicFindings: row.deterministicFindings.map(f => ({ ...f, requiredActions: [...f.requiredActions] })),
    governedStandards: row.governedStandards.map(g => ({ ...g })),
    answeredClarifications: [],
  };
}

interface Reconstructed {
  readonly rowId: string;
  readonly capability: 'ABSENT' | 'PRESENT';
  readonly wireSchema: Record<string, unknown>;
  readonly sentSchema: unknown;
  readonly contractId199: string;
  readonly id203Wire: string;
  readonly id203Sent: string;
  readonly id202Sent: string;
}

function reconstruct(row: Section199Row): Reconstructed {
  const binding = governedBindingFor(
    row.verifierGovernedEvidence.map(g => ({ sourceId: g.sourceId, text: g.text })));
  const wireSchema = buildExpertVNextWireSchema(analysisInput(row), binding);
  const sentSchema = stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(wireSchema));
  return {
    rowId: row.rowId,
    capability: governedBindingCapability(binding),
    wireSchema,
    sentSchema,
    contractId199: sha(stableStringify(wireSchema)).slice(0, 16),
    id203Wire: id203(wireSchema),
    id203Sent: id203(sentSchema),
    id202Sent: grammarId202(sentSchema),
  };
}

const RECON: Reconstructed[] = SECTION_199_COHORT.map(reconstruct);
const byRowId = new Map(RECON.map(r => [r.rowId, r] as const));

// The gate the directive requires: if reconstruction drifts, EVERYTHING below is about a fixture,
// so fail loudly and treat the remaining D-cases as void.
const reconstructionFaithful =
  byRowId.get('SG-01')?.contractId199 === 'd0713f36696e8bea'
  && byRowId.get('SG-02')?.contractId199 === '243bb6766c05599f';
ok('D1. reconstruction reproduces §199\'s OWN recorded contract ids (SG-01 d0713f36696e8bea, '
  + 'SG-02 243bb6766c05599f)', reconstructionFaithful,
  'verbatim from CIRCUIT-BREAKER-LOG.jsonl — the findings below are about the run, not a fixture');
if (!reconstructionFaithful) {
  console.log('FATAL: §199 reconstruction drifted; D/E cohort results would be about a fixture.');
}

const absent = RECON.filter(r => r.capability === 'ABSENT');
const present = RECON.filter(r => r.capability === 'PRESENT');

{
  const pWire = partitionByGrammarIdentity203(RECON.map(r => ({ memberId: r.rowId, identity: r.id203Wire })));
  const pSent = partitionByGrammarIdentity203(RECON.map(r => ({ memberId: r.rowId, identity: r.id203Sent })));
  const isTenTwo = (p: ReturnType<typeof partitionByGrammarIdentity203>): boolean =>
    p.classCount === 2
    && p.classes.some(c => c.memberIds.length === 10 && c.memberIds.every(m => byRowId.get(m)?.capability === 'ABSENT'))
    && p.classes.some(c => c.memberIds.length === 2 && c.memberIds.every(m => byRowId.get(m)?.capability === 'PRESENT'));
  ok('D2. §203 partitions the WIRE schemas 10 capability-ABSENT / 2 capability-PRESENT',
    reconstructionFaithful && isTenTwo(pWire), `classCount=${pWire.classCount}`);
  ok('D3. §203 partitions the SENT schemas 10 / 2 as well',
    reconstructionFaithful && isTenTwo(pSent), `classCount=${pSent.classCount}`);
}

ok('D4. §203 and §202 induce the SAME partition of this cohort (identities differ; classes agree)',
  reconstructionFaithful
  && new Set(absent.map(r => r.id202Sent)).size === 1
  && new Set(absent.map(r => r.id203Sent)).size === 1
  && new Set(present.map(r => r.id203Sent)).size === 1
  && absent.every(r => r.id203Sent !== present[0]?.id203Sent));

// ---------------------------------------------------------------- the recorded §199 evidence
interface BreakerLogLine {
  sequencePosition: number; rowId: string; isCanary: boolean; reachedInference: boolean;
  signature: string | null; consecutive: number; tripped: boolean;
}
const BREAKER_LOG: BreakerLogLine[] =
  readFileSync(join(E199, 'CIRCUIT-BREAKER-LOG.jsonl'), 'utf8')
    .split('\n').filter(l => l.trim().length > 0)
    .map(l => JSON.parse(l) as BreakerLogLine)
    .sort((a, b) => a.sequencePosition - b.sequencePosition);

/**
 * Replay the recorded §199 twelve-step order under a candidate cache key. A row whose key was
 * already recorded rejected is SUPPRESSED; otherwise it is ISSUED, and if the LOG says its request
 * was deterministically rejected before inference, its key is recorded. Outcomes are READ from the
 * log, never invented.
 */
function replay(keyOf: (r: Reconstructed) => string): {
  issued: string[]; suppressed: string[];
} {
  const rejected = new Set<string>();
  const issued: string[] = [];
  const suppressed: string[] = [];
  for (const line of BREAKER_LOG) {
    const r = byRowId.get(line.rowId);
    if (r === undefined) continue;
    const k = keyOf(r);
    if (rejected.has(k)) { suppressed.push(r.rowId); continue; }
    issued.push(r.rowId);
    if (!line.reachedInference && line.signature !== null) rejected.add(k);
  }
  return { issued, suppressed };
}

const collectEnums = (node: unknown, out: unknown[][]): void => {
  if (Array.isArray(node)) { node.forEach(v => collectEnums(v, out)); return; }
  if (node !== null && typeof node === 'object') {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (k === 'enum' && Array.isArray(v)) out.push(v);
      else collectEnums(v, out);
    }
  }
};
const enumValueKey = (r: Reconstructed): string => {
  const enums: unknown[][] = []; collectEnums(r.sentSchema, enums);
  return sha(r.id203Sent + canonicalJson203(enums)).slice(0, 16);
};
const enumLengthKey = (r: Reconstructed): string => {
  const enums: unknown[][] = []; collectEnums(r.sentSchema, enums);
  return sha(r.id203Sent + JSON.stringify(enums.map(e => e.map(m => String(m).length)))).slice(0, 16);
};

{
  const under203 = replay(r => r.id203Sent);
  ok('D5. under the §203 key the replay issues ELEVEN and suppresses exactly SG-02',
    reconstructionFaithful
    && under203.issued.length === 11 && under203.suppressed.length === 1
    && under203.suppressed[0] === 'SG-02');

  const under200 = replay(r => r.contractId199);
  ok('D6. under §200\'s requestContractId key the replay issues all TWELVE and suppresses NOTHING '
    + '— the §200 defect, reproduced',
    reconstructionFaithful && under200.issued.length === 12 && under200.suppressed.length === 0);

  const underValues = replay(enumValueKey);
  ok('D7. an enum-VALUE-sensitive key fragments the cohort into 12 classes and does NOT suppress '
    + 'SG-02 — measured, which is why R4 erases member values',
    reconstructionFaithful
    && new Set(RECON.map(enumValueKey)).size === 12
    && underValues.suppressed.length === 0);

  const underLengths = replay(enumLengthKey);
  ok('D8. an enum-LENGTH-sensitive key splits the 10 accepted ABSENT rows into SIX classes, '
    + 'separates SG-01 from SG-02, and does NOT suppress SG-02 — measured, closing the "just add '
    + 'length" repair of §202\'s L1',
    reconstructionFaithful
    && new Set(absent.map(enumLengthKey)).size === 6
    && enumLengthKey(present[0] as Reconstructed) !== enumLengthKey(present[1] as Reconstructed)
    && underLengths.suppressed.length === 0);

  ok('D9. the provider\'s recorded behaviour did NOT follow enum content: the 10 accepted ABSENT '
    + 'rows carry 10 distinct enum-value keys and 6 distinct length keys, yet one behaviour class',
    reconstructionFaithful
    && new Set(absent.map(enumValueKey)).size === 10
    && new Set(absent.map(enumLengthKey)).size === 6
    && new Set(absent.map(r => r.id203Sent)).size === 1);
}

// ============================================================ E. cache key + proxy claims

{
  let refusals = 0;
  for (const scope of [
    { provider: '', model: 'm', rejectionSignature: 's' },
    { provider: 'anthropic', model: '  ', rejectionSignature: 's' },
    { provider: 'anthropic', model: 'm', rejectionSignature: '' },
  ]) {
    try { grammarRejectionKey203({ type: 'string' }, scope, 'SENT_SCHEMA_AS_TRANSMITTED'); }
    catch (e) { if (String(e).includes('GRAMMAR_REJECTION_KEY_SCOPE_DEFECT')) refusals += 1; }
  }
  ok('E1. a blank provider, model or rejectionSignature is refused loudly (3/3)', refusals === 3);
}

{
  const base = { provider: 'anthropic', model: 'model-x', rejectionSignature: 'GRAMMAR_TOO_LARGE' };
  const k = (schema: unknown, scope = base, stage: 'SENT_SCHEMA_AS_TRANSMITTED' | 'WIRE_SCHEMA_BEFORE_TRANSPORT_ADAPTATION' = 'SENT_SCHEMA_AS_TRANSMITTED') =>
    grammarRejectionKey203(schema, scope, stage).key;
  const s = { type: 'string' };
  ok('E2. the key splits on model, provider, rejection signature and measured stage',
    k(s) !== k(s, { ...base, model: 'model-y' })
    && k(s) !== k(s, { ...base, provider: 'other' })
    && k(s) !== k(s, { ...base, rejectionSignature: 'OTHER_CLASS' })
    && k(s) !== k(s, base, 'WIRE_SCHEMA_BEFORE_TRANSPORT_ADAPTATION'));
  ok('E3. the key binds the grammar identity: a different grammar is a different key',
    k({ type: 'string' }) !== k({ type: 'number' }));
}

{
  // Input received from Agent F via the orchestrator (AB203-5): the §202 cache key's delimiter
  // join lets two DISTINCT component tuples collide into one suppression key — the false-MERGE
  // direction. The §203 key is structurally encoded, so a pair whose naive delimiter-joined
  // encodings are BYTE-IDENTICAL must still yield different keys.
  const scopeA = { provider: 'anthropic', model: 'm|x', rejectionSignature: 's' };
  const scopeB = { provider: 'anthropic', model: 'm', rejectionSignature: 'x|s' };
  const naive = (sc: typeof scopeA): string => [sc.provider, sc.model, sc.rejectionSignature].join('|');
  const schema = { type: 'string' };
  ok('E8. delimiter injection cannot merge two suppression keys (AB203-5 regression): the naive '
    + 'joined encodings are byte-identical, the §203 keys differ',
    naive(scopeA) === naive(scopeB)
    && grammarRejectionKey203(schema, scopeA, 'SENT_SCHEMA_AS_TRANSMITTED').key
      !== grammarRejectionKey203(schema, scopeB, 'SENT_SCHEMA_AS_TRANSMITTED').key);
}

ok('E4. the proxy claims are machine-readable and every claim is FALSE',
  Object.values(GRAMMAR_MEASUREMENT_CLAIMS_203).length === 5
  && Object.values(GRAMMAR_MEASUREMENT_CLAIMS_203).every(v => v === false));

{
  const d = describeGrammarProjection203({ type: 'string' }, 'SENT_SCHEMA_AS_TRANSMITTED');
  ok('E5. describeGrammarProjection203 carries the disclaimer AND the claims as fields',
    d.isProxy === EFFECTIVE_GRAMMAR_IDENTITY_203_IS_A_PROXY
    && d.claims === GRAMMAR_MEASUREMENT_CLAIMS_203
    && d.version === EFFECTIVE_GRAMMAR_IDENTITY_203_VERSION
    && /^[0-9a-f]{16}$/.test(d.identity));
}

ok('E6. the limits list has not silently shrunk: L1-L8 all present',
  EFFECTIVE_GRAMMAR_IDENTITY_203_LIMITS.length === 8
  && ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8']
    .every(p => EFFECTIVE_GRAMMAR_IDENTITY_203_LIMITS.some(l => l.id.startsWith(p + '_'))));

ok('E7. the rules list carries R1-R9',
  EFFECTIVE_GRAMMAR_IDENTITY_203_RULES.length === 9
  && ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9']
    .every(p => EFFECTIVE_GRAMMAR_IDENTITY_203_RULES.some(r => r.id.startsWith(p + '_'))));

// ============================================================ result

console.log('');
console.log(`§203 grammar identity: ${passed} passed, ${failed} failed`);
console.log('PROVIDER CALLS = 0. Every §199 outcome above was read from the recorded log.');
console.log(EFFECTIVE_GRAMMAR_IDENTITY_203_IS_A_PROXY);
if (failed > 0) process.exit(1);
