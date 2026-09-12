/**
 * §251 -- WIRE-SCHEMA BUDGET ANALYSIS. Repository-side, zero provider calls, zero database
 * operations. Measures the ACTUAL transmitted schema after the full production pipeline.
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import { buildExpert247WireSchema } from '../src/safescope-v2/expert-hazlenz/contract/expert-247-posture-contract';
import { buildExpert239WireSchema } from '../src/safescope-v2/expert-hazlenz/contract/expert-239-posture-contract';
import { governedBindingFor } from '../src/safescope-v2/expert-hazlenz/contract/expert-first-pass-instruction-vnext';
import { EXPERT_INPUT_CONTRACT_VERSION } from '../src/safescope-v2/expert-hazlenz/expert-contract.types';

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export const CASES_251: readonly { id: string; observation: string; families: string[] }[] = [
  { id: 'H1', families: ['WORK_AT_HEIGHT'],
    observation: 'A scaffold with one missing guardrail section on the north face; the gap is '
      + 'physically barriered off with Heras fencing and the crew are working on the south face.' },
  { id: 'H2', families: ['CONFINED_SPACE'],
    observation: 'A confined-space entry in progress with gas testing current, a top-man posted, '
      + 'and no rescue plan on site.' },
  { id: 'H3', families: ['WORK_AT_HEIGHT', 'STRUCTURAL'],
    observation: 'A mobile elevating work platform being operated on a slab whose loading capacity '
      + 'the site file does not record.' },
  { id: 'H4', families: ['FIRE'],
    observation: 'A hot-works permit that expires at 16:00 with work due to finish at 15:30, '
      + 'weather clear.' },
  { id: 'H5', families: ['EXCAVATION'],
    observation: 'An excavation with battered sides in stable ground, spoil set back, and no ladder '
      + 'within 25 metres of the working position.' },
  { id: 'H6', families: ['LIFTING'],
    observation: 'A lifting operation with a valid thorough-examination certificate, a competent '
      + 'slinger, and an exclusion zone that one delivery driver has walked through once.' },
];

export function inputFor(c: { id: string; observation: string; families: string[] }): any {
  return {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
    analysisId: `ANL-251-${c.id}`,
    authoritativeSources: [{ sourceId: `obs-${c.id}`, kind: 'OBSERVATION', text: c.observation }],
    inspectionContext: { location: null, task: null },
    jurisdiction: 'GB',
    allowedHazardFamilies: c.families,
    deterministicFindings: [], familyDispositions: [], governedStandards: [],
    answeredClarifications: [],
  };
}

/** The production pipeline, verbatim: canonical schema -> strict wrapper -> §108 strip. */
export function transmitted(canonical: unknown): unknown {
  return stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(canonical));
}

export interface UnionHit { path: string; kind: 'TYPE_ARRAY' | 'ANY_OF'; detail: string }

/**
 * Count provider-visible union-typed parameters. Anthropic's message names two shapes:
 * "parameters with type arrays or anyOf". Both are counted, at any depth.
 */
export function countUnions(node: unknown, path = '$'): UnionHit[] {
  const hits: UnionHit[] = [];
  const walk = (n: unknown, p: string): void => {
    if (Array.isArray(n)) { n.forEach((v, i) => walk(v, `${p}[${i}]`)); return; }
    if (!n || typeof n !== 'object') return;
    const o = n as Record<string, unknown>;
    if (Array.isArray(o.type)) {
      hits.push({ path: p, kind: 'TYPE_ARRAY', detail: JSON.stringify(o.type) });
    }
    if (Array.isArray(o.anyOf)) {
      hits.push({ path: p, kind: 'ANY_OF', detail: `${o.anyOf.length} branches` });
    }
    for (const [k, v] of Object.entries(o)) walk(v, `${p}.${k}`);
  };
  walk(node, path);
  return hits;
}

export interface GrammarMetrics {
  bytes: number;
  objectNodes: number;
  propertyNodes: number;
  enumMembers: number;
  enumNodes: number;
  constNodes: number;
  arrayNodes: number;
  maxDepth: number;
  descriptionBytes: number;
  descriptionCount: number;
  unionTypedParameters: number;
  typeArrayUnions: number;
  anyOfUnions: number;
  anyOfBranchTotal: number;
}

export function grammarMetrics(node: unknown): GrammarMetrics {
  let objectNodes = 0, propertyNodes = 0, enumMembers = 0, enumNodes = 0, constNodes = 0;
  let arrayNodes = 0, maxDepth = 0, descriptionBytes = 0, descriptionCount = 0;
  let anyOfBranchTotal = 0;
  const walk = (n: unknown, d: number): void => {
    if (d > maxDepth) maxDepth = d;
    if (Array.isArray(n)) { n.forEach(v => walk(v, d + 1)); return; }
    if (!n || typeof n !== 'object') return;
    const o = n as Record<string, unknown>;
    if (o.type === 'object') objectNodes += 1;
    if (o.type === 'array') arrayNodes += 1;
    if (o.properties && typeof o.properties === 'object') {
      propertyNodes += Object.keys(o.properties as object).length;
    }
    if (Array.isArray(o.enum)) { enumNodes += 1; enumMembers += o.enum.length; }
    if (o.const !== undefined) constNodes += 1;
    if (Array.isArray(o.anyOf)) anyOfBranchTotal += o.anyOf.length;
    if (typeof o.description === 'string') {
      descriptionCount += 1; descriptionBytes += Buffer.byteLength(o.description, 'utf8');
    }
    for (const v of Object.values(o)) walk(v, d + 1);
  };
  walk(node, 0);
  const unions = countUnions(node);
  return {
    bytes: Buffer.byteLength(JSON.stringify(node), 'utf8'),
    objectNodes, propertyNodes, enumMembers, enumNodes, constNodes, arrayNodes, maxDepth,
    descriptionBytes, descriptionCount,
    unionTypedParameters: unions.length,
    typeArrayUnions: unions.filter(u => u.kind === 'TYPE_ARRAY').length,
    anyOfUnions: unions.filter(u => u.kind === 'ANY_OF').length,
    anyOfBranchTotal,
  };
}

function main(): void {
  const OUT = join(__dirname, '..', '..', 'verification', 'expert-hazlenz-251-strict-wire-schema-budget-2026-09-12');
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

  const perCase: any[] = [];
  for (const c of CASES_251) {
    const input = inputFor(c);
    const governed = governedBindingFor([]);
    const c247 = buildExpert247WireSchema(input, governed);
    const c239 = buildExpert239WireSchema(input, governed);
    const t247 = transmitted(c247);
    const t239 = transmitted(c239);
    perCase.push({
      caseId: c.id,
      transmittedSchemaSha247: sha(JSON.stringify(t247)),
      transmittedSchemaSha239: sha(JSON.stringify(t239)),
      metrics247: grammarMetrics(t247),
      metrics239: grammarMetrics(t239),
      unionPaths247: countUnions(t247).map(u => `${u.kind} ${u.path} ${u.detail}`),
      unionPaths239: countUnions(t239).map(u => `${u.kind} ${u.path} ${u.detail}`),
    });
  }
  writeFileSync(join(OUT, 'SECTION-251-BASELINE-MEASUREMENT.json'),
    JSON.stringify({ section: '251', generated: '2026-09-12', providerCalls: 0, databaseOperations: 0, perCase }, null, 2));
  for (const p of perCase) {
    console.log(`${p.caseId}  247 unions=${p.metrics247.unionTypedParameters} `
      + `(typeArray=${p.metrics247.typeArrayUnions} anyOf=${p.metrics247.anyOfUnions}) `
      + `bytes=${p.metrics247.bytes} descBytes=${p.metrics247.descriptionBytes} `
      + `enumMembers=${p.metrics247.enumMembers} props=${p.metrics247.propertyNodes} `
      + `| 239 unions=${p.metrics239.unionTypedParameters} bytes=${p.metrics239.bytes}`);
  }
  console.log('\n--- H1 §247 union paths ---');
  perCase[0].unionPaths247.forEach((u: string) => console.log('  ' + u));
  console.log('\n--- H1 §239 union paths ---');
  perCase[0].unionPaths239.forEach((u: string) => console.log('  ' + u));
}
if (require.main === module) main();
