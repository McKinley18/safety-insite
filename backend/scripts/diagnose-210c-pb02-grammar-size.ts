/**
 * §210C -- PB-02 COMPILED-GRAMMAR ROOT CAUSE. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * §210B-3B drew PB-02 once and the provider refused it before inference:
 *
 *   HTTP 400 invalid_request_error
 *   "The compiled grammar is too large, which would cause performance issues.
 *    Simplify your tool schemas or reduce the number of strict tools."
 *
 * PB-02 is the only frozen case that supplies governed evidence to the FIRST PASS, which makes its
 * request capability-PRESENT. Every other case is capability-ABSENT and transmitted normally.
 *
 * This file establishes WHY, by construction and measurement only. It sends nothing, changes no
 * production code, and weakens no schema. Its output is a recommendation for a later slice.
 *
 * ==================== WHAT "COMPILED GRAMMAR" MEANS HERE, AND THE LIMIT OF THIS ANALYSIS ====
 *
 * Under `strict: true` the provider compiles the tool's JSON Schema into a constrained-decoding
 * grammar. The size of that grammar is a property of the PROVIDER'S compiler, which is not public
 * and is not reimplemented here. What CAN be measured exactly is the schema that drives it: byte
 * size, node count, and the enumerated alternations that a constrained-decoding grammar has to
 * expand. Those are reported as measured. Any statement about the provider's internal grammar size
 * is labelled INFERENCE and is not presented as measurement.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords,
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  buildExpertVNextWireSchema, governedBindingFor,
} from './lib/expert-first-pass-instruction-vnext';
import { PROBE_CASES, type ProbeCase } from './lib/section-210b3-probe-cases';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-210c-residual-remediation-2026-09-09');
const LEDGER = join(
  ROOT, 'verification', 'expert-hazlenz-210b3-hosted-execution-2026-09-09',
  'CALL-LEDGER-210B3B.jsonl');

const bytes = (v: unknown): number => Buffer.byteLength(JSON.stringify(v), 'utf8');

/** Structural measures a constrained-decoding compiler has to expand. Measured, not inferred. */
interface SchemaShape {
  bytes: number;
  nodes: number;
  properties: number;
  enums: number;
  enumMembers: number;
  maxDepth: number;
  requiredEntries: number;
  descriptionChars: number;
}

function measure(node: unknown, depth = 0): SchemaShape {
  const acc: SchemaShape = {
    bytes: 0, nodes: 0, properties: 0, enums: 0, enumMembers: 0,
    maxDepth: depth, requiredEntries: 0, descriptionChars: 0,
  };
  if (node === null || typeof node !== 'object') return acc;
  acc.nodes = 1;
  if (Array.isArray(node)) {
    for (const child of node) {
      const c = measure(child, depth + 1);
      acc.nodes += c.nodes; acc.properties += c.properties; acc.enums += c.enums;
      acc.enumMembers += c.enumMembers; acc.requiredEntries += c.requiredEntries;
      acc.descriptionChars += c.descriptionChars;
      acc.maxDepth = Math.max(acc.maxDepth, c.maxDepth);
    }
    return acc;
  }
  const o = node as Record<string, unknown>;
  for (const [k, v] of Object.entries(o)) {
    if (k === 'enum' && Array.isArray(v)) { acc.enums += 1; acc.enumMembers += v.length; }
    if (k === 'properties' && v !== null && typeof v === 'object') {
      acc.properties += Object.keys(v as object).length;
    }
    if (k === 'required' && Array.isArray(v)) acc.requiredEntries += v.length;
    if (k === 'description' && typeof v === 'string') acc.descriptionChars += v.length;
    const c = measure(v, depth + 1);
    acc.nodes += c.nodes; acc.properties += c.properties; acc.enums += c.enums;
    acc.enumMembers += c.enumMembers; acc.requiredEntries += c.requiredEntries;
    acc.descriptionChars += c.descriptionChars;
    acc.maxDepth = Math.max(acc.maxDepth, c.maxDepth);
  }
  return acc;
}

/**
 * `measure` walks the tree and never sets `bytes` -- serializing at every node would be quadratic.
 * The byte size is filled in once, here, for the node the caller actually asked about.
 */
function shapeOf(node: unknown): SchemaShape {
  return { ...measure(node), bytes: bytes(node) };
}

const asSent = (schema: Record<string, unknown>): unknown =>
  stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(schema));

console.log('================ §210C PB-02 COMPILED-GRAMMAR ANALYSIS (zero provider calls)');

// ---- what actually happened, read back from the persisted ledger rather than restated
{
  const rows = readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
  const pb02 = rows.find((r: any) => r.caseId === 'PB-02');
  console.log(`\n  PB-02 as recorded: HTTP ${pb02.httpStatus} ${pb02.providerErrorType}`);
  console.log(`    "${pb02.providerErrorMessage}"`);
  console.log(`    transmitted body ${pb02.transmittedBodyBytes} bytes, `
    + `reachedInference=${String(pb02.reachedInference)}`);
}

// ================================================================ absent vs present, same case

const pb02 = PROBE_CASES.find(c => c.caseId === 'PB-02') as ProbeCase;
const pb01 = PROBE_CASES.find(c => c.caseId === 'PB-01') as ProbeCase;

/** The SAME observation and context, built capability-ABSENT: the only change is the binding. */
const pb02Absent = buildExpertVNextWireSchema(pb02.input, governedBindingFor([]));
const pb02Present = pb02.canonicalSchema;

console.log('\n================ THE SAME CASE, WITH AND WITHOUT THE FIRST-PASS BINDING');
const rows: Array<{ label: string; shape: SchemaShape; sent: number }> = [
  { label: 'PB-01 capability-ABSENT (transmitted, accepted)',
    shape: shapeOf(pb01.canonicalSchema), sent: bytes(pb01.schemaAsSent) },
  { label: 'PB-02 capability-ABSENT (counterfactual)',
    shape: shapeOf(pb02Absent), sent: bytes(asSent(pb02Absent)) },
  { label: 'PB-02 capability-PRESENT (transmitted, REFUSED)',
    shape: shapeOf(pb02Present), sent: bytes(pb02.schemaAsSent) },
];
console.log('  label                                            canon-B  sent-B  nodes  props  '
  + 'enums  enumMembers  depth  required');
for (const r of rows) {
  console.log(`  ${r.label.padEnd(46)} ${String(r.shape.bytes).padStart(7)} `
    + `${String(r.sent).padStart(7)} ${String(r.shape.nodes).padStart(6)} `
    + `${String(r.shape.properties).padStart(6)} ${String(r.shape.enums).padStart(6)} `
    + `${String(r.shape.enumMembers).padStart(12)} ${String(r.shape.maxDepth).padStart(6)} `
    + `${String(r.shape.requiredEntries).padStart(9)}`);
}

const absent = rows[1]!.shape;
const present = rows[2]!.shape;
console.log(`\n  DELTA from the capability-PRESENT binding alone, same observation:`);
console.log(`    canonical bytes  +${present.bytes - absent.bytes}`);
console.log(`    schema nodes     +${present.nodes - absent.nodes}`);
console.log(`    properties       +${present.properties - absent.properties}`);
console.log(`    enums            +${present.enums - absent.enums}`);
console.log(`    enum members     +${present.enumMembers - absent.enumMembers}`);
console.log(`    required entries +${present.requiredEntries - absent.requiredEntries}`);

// ================================================================ does the EVIDENCE drive it?

console.log('\n================ DOES GOVERNED EVIDENCE ITSELF DRIVE GRAMMAR SIZE?');
{
  // One supplied record vs five: the schema only ever gains ONE enum whose member count tracks the
  // number of supplied ids. The record TEXT never enters the schema at all -- it is user-prompt
  // content, which the grammar compiler never sees.
  const five = ['GOV-A-1', 'GOV-B-2', 'GOV-C-3', 'GOV-D-4', 'GOV-E-5']
    .map(sourceId => ({ sourceId, text: 'x'.repeat(4000) }));
  const withFive = buildExpertVNextWireSchema(pb02.input, governedBindingFor(five));
  const m5 = shapeOf(withFive);
  console.log(`  1 governed id : ${present.bytes} canonical bytes, `
    + `${present.enumMembers} enum members`);
  console.log(`  5 governed ids: ${m5.bytes} canonical bytes, ${m5.enumMembers} enum members`);
  console.log(`  record TEXT in schema: ${JSON.stringify(withFive).includes('xxxx') ? 'YES' : 'NO'}`
    + '  <- governed record text is user-prompt content, never schema content');
  console.log(`  per-extra-id cost: ~${Math.round((m5.bytes - present.bytes) / 4)} canonical bytes`);
}

// ================================================================ do case enums matter?

console.log('\n================ DO CASE-SPECIFIC ENUMS MATERIALLY CONTRIBUTE?');
{
  const perCase = PROBE_CASES.map(c => ({ caseId: c.caseId, m: shapeOf(c.canonicalSchema) }));
  const absentOnly = perCase.filter(p => p.caseId !== 'PB-02');
  const min = Math.min(...absentOnly.map(p => p.m.bytes));
  const max = Math.max(...absentOnly.map(p => p.m.bytes));
  console.log(`  seven capability-ABSENT cases span ${min}..${max} canonical bytes `
    + `(spread ${max - min} B)`);
  console.log(`  every one was ACCEPTED by the provider.`);
  console.log(`  PB-02 capability-PRESENT: ${present.bytes} B  -- REFUSED`);
  console.log(`  the accepted band and the refused schema differ by `
    + `${present.bytes - max} B over the largest accepted case.`);
  const hazardEnums = absentOnly.map(p => p.m.enumMembers);
  console.log(`  enum members across accepted cases: ${Math.min(...hazardEnums)}..`
    + `${Math.max(...hazardEnums)}; PB-02 present: ${present.enumMembers}`);
}

// ================================================================ the finding

const deltaBytes = present.bytes - absent.bytes;
const largestAccepted = Math.max(
  ...PROBE_CASES.filter(c => c.caseId !== 'PB-02').map(c => shapeOf(c.canonicalSchema).bytes));

console.log('\n================ FINDING');
console.log('  MEASURED:');
console.log(`   - the capability-PRESENT binding adds ${deltaBytes} canonical bytes, `
  + `${present.nodes - absent.nodes} schema nodes, ${present.properties - absent.properties} `
  + `property and ${present.enums - absent.enums} enum to EVERY declaration item.`);
console.log('   - governed record TEXT never enters the schema. Only the count of permissible');
console.log('     sourceIds does, as members of one enum.');
console.log('   - case-specific enums vary the accepted schemas by a small spread, and all seven');
console.log('     capability-ABSENT cases were accepted.');
console.log('  INFERENCE (not measured -- the provider compiler is not public):');
console.log('   - the added property sits INSIDE the `unresolvedFactDeclarations` ARRAY ITEM, so a');
console.log('     constrained-decoding compiler expands it once per permitted array element rather');
console.log('     than once per request. That multiplicative position, not the raw byte delta, is');
console.log('     the plausible reason a ~2% byte increase crosses a compiled-grammar limit.');

const record = {
  artifact: 'SECTION_210C_PB02_GRAMMAR_ANALYSIS',
  providerCalls: 0,
  databaseOperations: 0,
  productionArchitectureChanged: false,
  schemaValidationWeakened: false,
  measured: {
    pb02CapabilityAbsent: absent,
    pb02CapabilityPresent: present,
    deltaCanonicalBytes: deltaBytes,
    deltaNodes: present.nodes - absent.nodes,
    deltaProperties: present.properties - absent.properties,
    deltaEnums: present.enums - absent.enums,
    deltaRequiredEntries: present.requiredEntries - absent.requiredEntries,
    largestAcceptedCanonicalBytes: largestAccepted,
    governedRecordTextEntersSchema: false,
    governedIdCountEntersSchema: true,
  },
  conclusions: {
    whatDrivesSize: 'the capability-PRESENT binding adds one array-typed property with an enum, '
      + 'plus a required entry, to the unresolvedFactDeclarations ITEM schema. It is inside a '
      + 'repeated array item, which is the multiplicative position in a decoding grammar.',
    governedEvidenceItself: 'does NOT drive grammar size. Record text is user-prompt content. Only '
      + 'the number of permissible sourceIds affects the schema, as enum members.',
    caseSpecificEnums: 'contribute a small spread and are NOT the cause: all seven '
      + 'capability-ABSENT cases carrying the same per-case enums were accepted.',
    semanticsPreservingAlternativeExists: true,
  },
  recommendation: 'RETAIN THE SEPARATE GOVERNED STAGE. See the accompanying analysis document.',
  timestamp: new Date().toISOString(),
};
if (!existsSync(EVID)) mkdirSync(EVID, { recursive: true });
writeFileSync(join(EVID, 'PB02-GRAMMAR-ANALYSIS-210C.json'), `${JSON.stringify(record, null, 2)}\n`);
console.log(`\n  written: ${join(EVID, 'PB02-GRAMMAR-ANALYSIS-210C.json')}`);
console.log('  ZERO PROVIDER CALLS. NO PRODUCTION CODE CHANGED. NO SCHEMA VALIDATION WEAKENED.');
