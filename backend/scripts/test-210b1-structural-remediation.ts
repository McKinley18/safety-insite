/**
 * §210B-1 -- STRUCTURAL REMEDIATION SUITE. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Replays the EXACT frozen §208 structural inputs through the §210B-1 isolation and sidecar, and
 * asserts the eight properties the authorization requires. Nothing is sent anywhere; every input is
 * read from persisted evidence and every output is compared in memory.
 *
 * Two of these tests are deliberately written to FAIL LOUDLY IF THEY OVERCLAIM. AC-18 and AC-22
 * assert only that transport is byte-exact, and assert explicitly that the missing "materials"
 * conjunct and the wrongly framed AC-22 property are STILL WRONG after B-1, because B-1 is
 * transport and a transport fix that appeared to repair generation would be the most dangerous
 * result this slice could produce.
 */

import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import {
  OWED_PROPERTY_REPRESENTATION, explicitOwedProperty, isolateCandidates, isolateClarifications,
  staticPrefixReport, structuralPreservationChecks,
} from './lib/section-210b-verifier-payload';
import { captureTelemetry, effectiveCost, summariseRun } from './lib/section-210b-token-telemetry';

let passed = 0;
let failed = 0;
const ok = (id: string, cond: boolean, detail = ''): void => {
  if (cond) { passed += 1; console.log(`  PASS  ${id}${detail ? ` -- ${detail}` : ''}`); }
  else { failed += 1; console.log(`  FAIL  ${id}${detail ? ` -- ${detail}` : ''}`); }
};
const section = (t: string): void => console.log(`\n---------------- ${t}`);

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-fresh-cohort-execution-208-2026-09-08');
const readJsonl = (p: string): any[] =>
  readFileSync(p, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));

const firstPass = readJsonl(join(EVID, 'RAW-FIRST-PASS-208.jsonl'));
const projection = readJsonl(join(EVID, 'PROJECTION-208-CORRECTED.jsonl'));
const fpBy = new Map(firstPass.map(r => [r.caseId, r]));

interface Isolated {
  caseId: string; declarationId: string; factKey: string;
  property: string | null;
  clarificationIds: string[]; removedClarificationIds: string[];
  candidateKeys: string[]; removedCandidateKeys: string[];
  projected: Record<string, unknown>;
  declaration: any;
}

/** Build the isolated payload for every admitted fact, from frozen inputs only. */
function isolateAll(): Isolated[] {
  const out: Isolated[] = [];
  for (const proj of projection) {
    const fp = fpBy.get(proj.caseId);
    const parsed = fp.parsed;
    const decls: any[] = parsed.unresolvedFactDeclarations ?? [];
    const clars: any[] = parsed.decisionCriticalClarifications ?? [];
    const cands: any[] = parsed.expertHazardCandidates ?? [];
    const rowDeclIds = decls.map(d => d.declarationId);
    for (const pd of proj.perDeclaration ?? []) {
      if (!pd.admitted) continue;
      const decl = decls.find(d => d.declarationId === pd.declarationId);
      if (decl === undefined) continue;
      const cd = isolateClarifications(clars, decl.declarationId, rowDeclIds);
      const kd = isolateCandidates(cands, clars, decl.declarationId);
      out.push({
        caseId: proj.caseId,
        declarationId: decl.declarationId,
        factKey: pd.factKey,
        property: explicitOwedProperty(decl),
        clarificationIds: cd.filter(x => x.retained).map(x => x.id),
        removedClarificationIds: cd.filter(x => !x.retained).map(x => x.id),
        candidateKeys: kd.filter(x => x.retained).map(x => x.id),
        removedCandidateKeys: kd.filter(x => !x.retained).map(x => x.id),
        projected: pd.owedFact,
        declaration: decl,
      });
    }
  }
  return out;
}

const isolated = isolateAll();
const forCase = (c: string): Isolated[] => isolated.filter(i => i.caseId === c);
const multiFactCases = projection.filter(p => p.admittedCount > 1).map(p => p.caseId);

// ================================================================ 1

section('1. MULTI-FACT ISOLATION -- sibling material absent unless explicitly required');

ok('MULTI.rows-identified', multiFactCases.length === 4,
  `multi-fact rows: ${multiFactCases.join(', ')}`);

for (const c of multiFactCases) {
  const rows = forCase(c);
  const parsed = fpBy.get(c).parsed;
  const clars: any[] = parsed.decisionCriticalClarifications ?? [];
  for (const r of rows) {
    const siblings = rows.filter(x => x.declarationId !== r.declarationId);
    const leakedBound = r.clarificationIds.filter(id => {
      const cl = clars.find(q => String(q.clarificationId) === id);
      const b = String(cl?.answersUnresolvedFactDeclarationId ?? '');
      return b !== '' && b !== r.declarationId && siblings.some(s => s.declarationId === b);
    });
    ok(`MULTI.${c}.${r.declarationId}.no-explicitly-bound-sibling-clarification`,
      leakedBound.length === 0, leakedBound.length === 0 ? '' : `leaked ${leakedBound.join(',')}`);
    ok(`MULTI.${c}.${r.declarationId}.sibling-owedfact-absent`,
      siblings.every(s => !JSON.stringify(r.projected).includes(s.factKey)),
      'the payload carries this fact only');
  }
}

// ================================================================ 2 and 3

section('2 + 3. AC-01 and AC-20 -- two facts, two fully isolated payloads');

for (const c of ['AC-01', 'AC-20']) {
  const rows = forCase(c);
  ok(`${c}.two-payloads`, rows.length === 2, `${rows.length}`);
  const a = rows[0];
  const b = rows[1];
  ok(`${c}.each-carries-its-own-property`,
    a.property !== null && b.property !== null && a.property !== b.property);
  ok(`${c}.each-carries-its-own-clarification`,
    a.clarificationIds.length === 1 && b.clarificationIds.length === 1
    && a.clarificationIds[0] !== b.clarificationIds[0],
    `${a.clarificationIds.join(',')} | ${b.clarificationIds.join(',')}`);
  ok(`${c}.neither-carries-the-other-clarification`,
    !a.clarificationIds.some(x => b.clarificationIds.includes(x)));
  ok(`${c}.sibling-clarification-was-actually-removed`,
    a.removedClarificationIds.length === 1 && b.removedClarificationIds.length === 1,
    `removed ${a.removedClarificationIds.join(',')} / ${b.removedClarificationIds.join(',')}`);
  ok(`${c}.sibling-candidate-was-actually-removed`,
    a.removedCandidateKeys.length > 0 && b.removedCandidateKeys.length > 0,
    `removed ${a.removedCandidateKeys.join(',')} / ${b.removedCandidateKeys.join(',')}`);
  ok(`${c}.neither-carries-the-other-owedfact`,
    !JSON.stringify(a.projected).includes(b.factKey)
    && !JSON.stringify(b.projected).includes(a.factKey));
}

// ================================================================ 4

section('4. AC-10 -- the model-authored property reaches the verifier explicitly');

{
  const r = forCase('AC-10')[0];
  const decl = r.declaration;
  ok('AC-10.sidecar-present', r.property !== null);
  ok('AC-10.sidecar-is-byte-exact-missingFact', r.property === decl.missingFact);
  ok('AC-10.property-absent-from-the-pinned-projection',
    (r.projected as any).missingFact === undefined,
    'projectOwedFact still drops it; the sidecar adds, it does not mutate');
  ok('AC-10.verifier-no-longer-reconstructs-from-branches',
    typeof r.property === 'string' && r.property.length > 0
    && r.property !== (r.projected as any).branchA);
}

// ================================================================ 5 must not overclaim

section('5. AC-18 -- TRANSPORT preserved; GENERATION defect must remain visible');

{
  const r = forCase('AC-18')[0];
  const decl = r.declaration;
  ok('AC-18.property-transported-byte-exact', r.property === decl.missingFact,
    'exact generated text, not a repaired version');
  ok('AC-18.materials-conjunct-STILL-ABSENT', !/material/i.test(String(r.property ?? '')),
    'B-1 is transport. The first pass never generated the materials conjunct and B-1 does not and '
    + 'must not invent it; this stays an RC-C generation defect for 210B-2');
  ok('AC-18.no-field-was-synthesised',
    r.property === decl.missingFact && (r.projected as any).branchA === decl.branchA);
}

// ================================================================ 6 must not overclaim

section('6. AC-22 -- projected target preserves exactly what the first pass authored');

{
  const r = forCase('AC-22')[0];
  const decl = r.declaration;
  ok('AC-22.property-transported-byte-exact', r.property === decl.missingFact);
  ok('AC-22.existence-framing-STILL-PRESENT', /exists?\b/i.test(String(r.property ?? '')),
    'the property still asks whether a method EXISTS. B-1 transports it faithfully and does not '
    + 'repair it; RC-A remains open for 210B-2');
  ok('AC-22.no-semantic-normalisation-applied', r.property === decl.missingFact);
}

// ================================================================ isolation honesty

section('ISOLATION COVERAGE -- reported, not smoothed over');

{
  const g6: [string, string][] = [['AC-01', 'decl_lanyard'], ['AC-01', 'decl_duct'],
    ['AC-02', 'decl_wheel_speed'], ['AC-02', 'decl_guard_clearance'], ['AC-03', 'DECL-FAN-STATE'],
    ['AC-20', 'd1'], ['AC-20', 'd2'], ['AC-22', 'UF-1']];
  let full = 0;
  let partial = 0;
  let none = 0;
  for (const [c, d] of g6) {
    const r = isolated.find(x => x.caseId === c && x.declarationId === d);
    if (r === undefined) continue;
    const anyClar = r.removedClarificationIds.length > 0;
    const anyCand = r.removedCandidateKeys.length > 0;
    if (anyClar && anyCand) full += 1;
    else if (anyClar || anyCand) partial += 1;
    else none += 1;
    console.log(`    ${c}/${d}: clarifications removed ${r.removedClarificationIds.length}, `
      + `candidates removed ${r.removedCandidateKeys.length}`);
  }
  ok('COVERAGE.matches-the-declared-measurement', full === 4 && partial === 2 && none === 2,
    `full ${full}, partial ${partial}, none ${none}; the 2 uncovered are unbound-clarification `
    + 'rows and stay open for 210B-2 S2');
}

// ================================================================ structural checks

section('STRUCTURAL PRESERVATION CHECKS -- non-semantic only');

{
  let allHeld = true;
  for (const r of isolated) {
    const parsed = fpBy.get(r.caseId).parsed;
    const clars: any[] = parsed.decisionCriticalClarifications ?? [];
    const bound = clars
      .filter(q => String(q.answersUnresolvedFactDeclarationId ?? '') === r.declarationId)
      .map(q => String(q.clarificationId));
    const findings = structuralPreservationChecks({
      declaration: r.declaration,
      projected: r.projected,
      sidecarProperty: r.property,
      retainedClarificationIds: r.clarificationIds,
      boundClarificationIds: bound,
    });
    const bad = findings.filter(f => !f.held);
    if (bad.length > 0) {
      allHeld = false;
      console.log(`    ${r.caseId}/${r.declarationId}: ${bad.map(x => x.check).join(', ')}`);
    }
  }
  ok('STRUCTURAL.all-checks-hold-across-every-admitted-fact', allHeld);
  ok('STRUCTURAL.representation-is-a-sidecar-not-a-mutation',
    OWED_PROPERTY_REPRESENTATION.choice === 'O4_EQUIVALENT_SIDECAR');
}

// ================================================================ 7

section('7. STATIC PREFIX');

{
  const current = staticPrefixReport([
    { name: 'stable_instruction_prose', stable: true, bytes: 46000 },
    { name: 'case_varying_schema_enums', stable: false, bytes: 18670 },
    { name: 'case_observation_and_state', stable: false, bytes: 5300 },
  ]);
  const proposed = staticPrefixReport([
    { name: 'stable_instruction_prose', stable: true, bytes: 46000 },
    { name: 'stable_schema_skeleton', stable: true, bytes: 12000 },
    { name: 'case_varying_schema_enums', stable: false, bytes: 6670 },
    { name: 'case_observation_and_state', stable: false, bytes: 5300 },
  ]);
  ok('PREFIX.current-ordering-is-prefix-clean', current.orderedForCaching,
    `stable prefix ${current.stablePrefixBytes} bytes `
    + `(${(current.cacheablePrefixFraction * 100).toFixed(1)}%), first dynamic segment `
    + `${String(current.firstDynamicSegment)}`);
  ok('PREFIX.splitting-the-schema-raises-the-cacheable-fraction',
    proposed.cacheablePrefixFraction > current.cacheablePrefixFraction,
    `${(current.cacheablePrefixFraction * 100).toFixed(1)}% -> `
    + `${(proposed.cacheablePrefixFraction * 100).toFixed(1)}%`);
  ok('PREFIX.reporter-recommends-stable-first',
    proposed.recommendedOrder[0] === 'stable_instruction_prose');
}

// ================================================================ telemetry

section('TELEMETRY');

{
  const withCache = captureTelemetry({
    stage: 'VERIFIER', caseId: 'FX', usage: { input_tokens: 500, output_tokens: 700,
      cache_creation_input_tokens: 8759, cache_read_input_tokens: 0 },
    systemPromptIdentity: 'sys', userPromptIdentity: 'usr', now: 'T',
  });
  const withoutCache = captureTelemetry({
    stage: 'VERIFIER', caseId: 'FX', usage: { input_tokens: 9106, output_tokens: 700 },
    systemPromptIdentity: 'sys', userPromptIdentity: 'usr', now: 'T',
  });
  ok('TELEMETRY.captures-cache-categories-when-present',
    withCache.cacheWriteTokens === 8759 && withCache.cacheReadTokens === 0
    && withCache.cacheTelemetryAvailable === true);
  ok('TELEMETRY.absent-cache-fields-are-NOT_AVAILABLE-not-zero',
    withoutCache.cacheWriteTokens === 'NOT_AVAILABLE'
    && withoutCache.cacheReadTokens === 'NOT_AVAILABLE'
    && withoutCache.cacheTelemetryAvailable === false,
    'zero cache reads and no cache telemetry are different facts');
  ok('TELEMETRY.cost-model-reproduces-the-frozen-ledger',
    effectiveCost({ uncachedInputTokens: 9071, cacheWriteTokens: 'NOT_AVAILABLE',
      cacheReadTokens: 'NOT_AVAILABLE', outputTokens: 717 }) === 0.025312,
    'matches RAW-VERIFIER-208B AC-01 costUsd exactly');
  ok('TELEMETRY.run-summary-marks-unavailable-categories',
    JSON.stringify(summariseRun([withoutCache])).includes('NOT_AVAILABLE'));
}

// ================================================================ 8

section('8. REGRESSION -- pinned frozen contracts untouched');

{
  const prereg = JSON.parse(readFileSync(join(ROOT, 'verification',
    'expert-hazlenz-required-structured-verifier-validation-2026-09-05',
    'PREREGISTRATION.json'), 'utf8'));
  const base = join(ROOT, 'backend', 'src', 'hazlenz', 'expert-hazlenz', 'owed-facts');
  let allPinned = true;
  for (const [file, expected] of Object.entries<string>(prereg.owedFactSourceHashes)) {
    const actual = createHash('sha256').update(readFileSync(join(base, file))).digest('hex');
    if (actual !== expected) { allPinned = false; console.log(`    DRIFT ${file}`); }
  }
  ok('REGRESSION.four-pinned-owed-fact-sources-unchanged', allPinned,
    'verifier-v3-development-boundary.ts included; the sidecar added no field to it');

  const frozen: [string, string][] = [
    ['RAW-FIRST-PASS-208.jsonl',
      '711dfa354a31bf0b22607ac6af3c0094ff665ab8e2a0e544ea5d64a827191614'],
    ['PROJECTION-208-CORRECTED.jsonl',
      '78fb731b8fe2fe6687ee8dc7e20f0e786f56637868bf4b128d90e096af23df9e'],
  ];
  for (const [f, h] of frozen) {
    ok(`REGRESSION.${f}-unchanged`,
      createHash('sha256').update(readFileSync(join(EVID, f))).digest('hex') === h);
  }
  const strip = (p: string): string =>
    readFileSync(join(__dirname, 'lib', p), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  ok('REGRESSION.no-provider-path-in-this-slice',
    !/anthropic|fetch\s*\(|https?:/i.test(strip('section-210b-verifier-payload.ts'))
    && !/anthropic|fetch\s*\(|https?:/i.test(strip('section-210b-token-telemetry.ts')));
}

console.log(`\n================ 210B-1 STRUCTURAL SUITE: ${passed} passed, ${failed} failed`);
console.log('  provider calls: 0   database operations: 0');
process.exit(failed === 0 ? 0 : 1);
