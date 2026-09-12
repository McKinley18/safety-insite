/**
 * §210B-3A -- CACHE PREFLIGHT. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * The frozen preregistration models a 65.9% stable cacheable prefix and projects USD 0.3519 for the
 * eight calls WITH prompt caching, against USD 0.5965 without -- the latter above the probe's own
 * USD 0.50 hard ceiling. Caching is therefore not an optimization here, it is the thing that brings
 * the probe inside its ceiling, and the product-owner authorization requires the cache behaviour to
 * be confirmed from ACTUAL PROVIDER TELEMETRY rather than inferred.
 *
 * Before spending anything, this file answers a question that costs nothing to answer: DOES A
 * STABLE CACHEABLE PREFIX ACTUALLY EXIST IN THE REQUESTS THIS PROBE WILL SEND? Anthropic's cache
 * prefix is ordered tools, then system, then messages. A per-case tool schema therefore sits AHEAD
 * of the stable system prompt in that prefix, and if the schema varies by case, a cache breakpoint
 * on the system block can never be read across cases however stable the system prompt is.
 *
 * This file builds the exact eight request bodies and measures it. It sends nothing.
 */

import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_HOSTED_INFERENCE_CONFIG,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING, instructionIdentities,
} from './lib/expert-first-pass-instruction-210b2';
import { PROBE_STIMULI } from './lib/section-210b3-probe-preregistration';
import { PROBE_CASES, type ProbeCase, toolBlockFor } from './lib/section-210b3-probe-cases';

const ROOT = join(__dirname, '..', '..');
const PREREG_DIR = join(
  ROOT, 'verification', 'expert-hazlenz-210b3-probe-preregistration-2026-09-08');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-210b3-hosted-execution-2026-09-09');
const AUTHORIZED_PREREGISTRATION_SHA =
  '7b2e292f5fc2ddd61368b4adc8f4416c11b1925ecd514a589169f0118fec20b5' as const;

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const bytes = (s: string): number => Buffer.byteLength(s, 'utf8');

// ================================================================ the frozen artifact

const preregPath = join(PREREG_DIR, 'PROBE-PREREGISTRATION-210B3A.json');
const preregRaw = readFileSync(preregPath);
const preregSha = createHash('sha256').update(preregRaw).digest('hex');
const prereg = JSON.parse(preregRaw.toString('utf8')) as any;

console.log('================ §210B-3A CACHE PREFLIGHT (zero provider calls)');
console.log(`  preregistration  : ${preregSha}`);
console.log(`  authorized       : ${AUTHORIZED_PREREGISTRATION_SHA}`);
if (preregSha !== AUTHORIZED_PREREGISTRATION_SHA) {
  console.error('\nABORT: the frozen preregistration on disk is not the artifact the product owner '
    + 'authorized. ZERO PROVIDER CALLS WERE MADE.');
  process.exit(1);
}

// ---- the in-repo stimuli must still BE the frozen stimuli, or the executor is running something
// ---- other than what was frozen. Compared as data, not trusted because the file names match.
const frozenStimuli = prereg.stimuli as any[];
const drift: string[] = [];
if (frozenStimuli.length !== PROBE_STIMULI.length) drift.push('stimulus count differs');
for (let i = 0; i < frozenStimuli.length; i += 1) {
  const f = frozenStimuli[i];
  const l = PROBE_STIMULI[i] as any;
  if (f === undefined || l === undefined) { drift.push(`index ${i} missing`); continue; }
  for (const k of ['caseId', 'observation', 'jurisdiction', 'expectedDeclarationCount']) {
    if (JSON.stringify(f[k]) !== JSON.stringify(l[k])) drift.push(`${f.caseId}: ${k} drifted`);
  }
  if (JSON.stringify(f.suppliedContext) !== JSON.stringify(l.suppliedContext)) {
    drift.push(`${f.caseId}: suppliedContext drifted`);
  }
  if (JSON.stringify(f.hazardFamilies) !== JSON.stringify(l.hazardFamilies)) {
    drift.push(`${f.caseId}: hazardFamilies drifted`);
  }
  if (JSON.stringify(f.governedEvidence) !== JSON.stringify(l.governedEvidence)) {
    drift.push(`${f.caseId}: governedEvidence drifted`);
  }
}
const ids = instructionIdentities() as any;
if (ids.withoutGovernedBinding.newIdentity !== prereg.instruction.newIdentity) {
  drift.push('the plain 210b2 instruction identity is not the frozen one');
}
if (ids.withGovernedBinding.newIdentity !== prereg.instruction.newIdentityGovernedVariant) {
  drift.push('the governed 210b2 instruction identity is not the frozen one');
}
if (drift.length > 0) {
  console.error('\nABORT: the repo no longer carries the frozen probe. ZERO PROVIDER CALLS.');
  for (const d of drift) console.error(`  ${d}`);
  process.exit(1);
}
console.log(`  stimuli          : ${PROBE_STIMULI.length}, byte-identical to the frozen artifact`);
console.log(`  instruction      : ${ids.withoutGovernedBinding.newIdentity} (plain)`);
console.log(`  instruction      : ${ids.withGovernedBinding.newIdentity} (governed)`);

// ================================================================ the eight request bodies

/* The eight requests are built by `lib/section-210b3-probe-cases.ts`, which the §210B-3B executor
 * also imports, so the preflight measures the requests that are actually transmitted. */

// ================================================================ what is actually stable

function commonPrefixBytes(a: string, b: string): number {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  let i = 0;
  while (i < ba.length && i < bb.length && ba[i] === bb[i]) i += 1;
  return i;
}

console.log('\n================ PER-CASE REQUEST COMPOSITION');
const rows = PROBE_CASES.map(c => {
  const tools = JSON.stringify([toolBlockFor(c)]);
  return {
    caseId: c.caseId,
    governed: c.governedRecords.length > 0,
    toolsBytes: bytes(tools),
    toolsSha: sha(tools),
    systemBytes: bytes(c.systemPrompt),
    systemSha: sha(c.systemPrompt),
    userBytes: bytes(c.userPrompt),
  };
});
for (const r of rows) {
  console.log(`  ${r.caseId}  governed=${String(r.governed).padEnd(5)} `
    + `tools=${String(r.toolsBytes).padStart(6)}B ${r.toolsSha.slice(0, 12)}  `
    + `system=${String(r.systemBytes).padStart(6)}B ${r.systemSha.slice(0, 12)}  `
    + `user=${String(r.userBytes).padStart(6)}B`);
}

const distinctTools = new Set(rows.map(r => r.toolsSha));
const distinctSystems = new Set(rows.map(r => r.systemSha));
console.log(`\n  distinct tool blocks   : ${distinctTools.size} of ${rows.length}`);
console.log(`  distinct system blocks : ${distinctSystems.size} of ${rows.length}`);

// ---- the two system prompts, and how much of them is genuinely shared
const plain = EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT;
const governed = EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING;
const sysShared = commonPrefixBytes(plain, governed);
console.log(`\n  plain system prompt    : ${bytes(plain)} B`);
console.log(`  governed system prompt : ${bytes(governed)} B`);
console.log(`  shared leading bytes   : ${sysShared} `
  + `(${((sysShared / bytes(plain)) * 100).toFixed(1)}% of the plain prompt)`);

// ---- and the tool schemas, pairwise against PB-01
const toolsPB01 = JSON.stringify([toolBlockFor(PROBE_CASES[0] as ProbeCase)]);
console.log('\n  tool-block common prefix against PB-01:');
for (const c of PROBE_CASES) {
  const t = JSON.stringify([toolBlockFor(c)]);
  const cp = commonPrefixBytes(toolsPB01, t);
  console.log(`    ${c.caseId}  ${String(cp).padStart(6)} B of ${String(bytes(t)).padStart(6)} B `
    + `${t === toolsPB01 ? '(IDENTICAL)' : '(differs)'}`);
}

// ================================================================ the finding

const toolsVaryByCase = distinctTools.size > 1;
const systemsVaryByCase = distinctSystems.size > 1;

console.log('\n================ CACHE FEASIBILITY FINDING');
console.log('  Anthropic cache prefix order: tools -> system -> messages.');
if (toolsVaryByCase) {
  console.log('  TOOLS VARY BY CASE. Any cache breakpoint at or after the system block therefore');
  console.log('  covers a prefix that is not shared between cases, and CANNOT be read across');
  console.log('  cases however stable the system prompt is. A system-block breakpoint alone would');
  console.log('  write a fresh cache entry on every call at the 1.25x write multiplier and read');
  console.log('  none of them -- STRICTLY MORE EXPENSIVE than not caching at all.');
} else {
  console.log('  Tool blocks are identical across cases; a system-block breakpoint is readable.');
}

// ---- projections. Logical input is taken from the frozen token plan, not invented here.
const LOGICAL_INPUT = 24_500; // frozen expectedLogicalInputTokenRange.min, conservative for savings
const OUTPUT_PER_CALL = prereg.tokenPlan.assumedOutputTokensPerCall as number;
const IN_RATE = prereg.tokenPlan.pricingBasis.inputUsdPerMTok as number;
const OUT_RATE = prereg.tokenPlan.pricingBasis.outputUsdPerMTok as number;
const W = prereg.tokenPlan.cacheMultipliers.write as number;
const R = prereg.tokenPlan.cacheMultipliers.read as number;
const CALLS = 8;

const outputUsd = (CALLS * OUTPUT_PER_CALL / 1e6) * OUT_RATE;
const uncachedUsd = (CALLS * LOGICAL_INPUT / 1e6) * IN_RATE + outputUsd;

// per-call cacheable share, using the frozen prefix percentage against logical input
const prefixShare = (prereg.tokenPlan.expectedCacheablePrefixPercent as number) / 100;
const prefixTok = Math.round(LOGICAL_INPUT * prefixShare);
const tailTok = LOGICAL_INPUT - prefixTok;

// SCENARIO A -- caching works across cases (one write, seven reads)
const scenarioA = ((prefixTok * W + prefixTok * R * (CALLS - 1) + tailTok * CALLS) / 1e6) * IN_RATE
  + outputUsd;
// SCENARIO B -- every call writes its own entry and reads nothing (what a varying tools block gives)
const scenarioB = ((prefixTok * W * CALLS + tailTok * CALLS) / 1e6) * IN_RATE + outputUsd;

console.log('\n================ SPEND PROJECTIONS (frozen token plan, USD)');
console.log(`  output, all 8 calls                       : ${outputUsd.toFixed(4)}`);
console.log(`  A  no caching                             : ${uncachedUsd.toFixed(4)}`);
console.log(`  B  caching READ across cases (1 write)    : ${scenarioA.toFixed(4)}`);
console.log(`  C  caching WRITE-ONLY (8 writes, 0 reads) : ${scenarioB.toFixed(4)}`);
console.log(`  hard ceiling                              : ${(prereg.tokenPlan.hardCeilingUsd as number).toFixed(4)}`);
console.log(`  frozen projection with caching            : ${(prereg.cacheDecision.projectionWithCaching.costUsd as number).toFixed(4)}`);

const record = {
  artifact: 'SECTION_210B3A_CACHE_PREFLIGHT',
  providerCalls: 0,
  databaseOperations: 0,
  preregistrationSha256: preregSha,
  authorizedPreregistrationSha256: AUTHORIZED_PREREGISTRATION_SHA,
  instructionIdentities: {
    plain: ids.withoutGovernedBinding.newIdentity,
    governed: ids.withGovernedBinding.newIdentity,
  },
  model: EXPERT_HOSTED_INFERENCE_CONFIG.model,
  perCase: rows,
  distinctToolBlocks: distinctTools.size,
  distinctSystemBlocks: distinctSystems.size,
  toolsVaryByCase,
  systemsVaryByCase,
  sharedSystemPrefixBytes: sysShared,
  cachePrefixOrder: 'tools -> system -> messages',
  projectionsUsd: {
    outputAllCalls: Number(outputUsd.toFixed(6)),
    noCaching: Number(uncachedUsd.toFixed(6)),
    cachingReadAcrossCases: Number(scenarioA.toFixed(6)),
    cachingWriteOnly: Number(scenarioB.toFixed(6)),
    hardCeiling: prereg.tokenPlan.hardCeilingUsd,
  },
  basis: 'logical input taken as the frozen expectedLogicalInputTokenRange.min (24,500); output as '
    + 'the frozen assumedOutputTokensPerCall. Projection only. No provider telemetry exists yet.',
  timestamp: new Date().toISOString(),
};
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'CACHE-PREFLIGHT-210B3A.json'), `${JSON.stringify(record, null, 2)}\n`);
console.log(`\n  written: ${join(OUT, 'CACHE-PREFLIGHT-210B3A.json')}`);
console.log('  ZERO PROVIDER CALLS WERE MADE.');
