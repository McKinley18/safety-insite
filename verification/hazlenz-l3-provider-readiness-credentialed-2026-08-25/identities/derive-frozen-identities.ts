/**
 * L3 PROVIDER READINESS -- PHASE 4 re-derivation of the frozen execution-path identities.
 *
 * READ-ONLY. It imports the SHIPPED modules and re-computes the two INNER digests that a file
 * hash alone cannot prove: sha256(L3_SYSTEM_PROMPT) and the serialised run-schema digest.
 *
 * It builds the run schema exactly as the frozen harness does -- the FIRST scenario of the locked
 * 24-scenario DIAGNOSTIC cohort, parsed out of ablate-l32g-state-separation.ts, which is
 * already-open development / retired-holdout material. NO protected source is read, NO holdout row
 * is read, and NO inference is performed. There is no network primitive in this file.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import type { ReasoningInput, L3RegulatoryContextValue } from '../../../backend/src/safescope-v2/reasoning-l3/reasoning-contract.types';
import { buildReasoningInput } from '../../../backend/src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { L3_PROMPT_VERSION, L3_SYSTEM_PROMPT, buildProposalSchema } from '../../../backend/src/safescope-v2/reasoning-l3/reasoning-prompt';

const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const HARNESS = join(__dirname, '..', '..', '..', 'backend', 'scripts', 'ablate-l32g-state-separation.ts');

const EXPECTED = {
  promptVersion: 'hazlenz.l3.prompt.v6',
  systemPrompt:  'b8cc50fce71950db0188103c352fde0243938d9210e2a219341b9255d9bcbacf',
  runSchema:     'a522cf5aa2d556824100139adf4951e75b9135c42f6d0c771009cc97e99da385',
  harness:       '73f74131b4f8cbb31ad57ba972e1e0edbcaaa275d27558866d8bc2a4e71c6521',
};

/** The cohort's first scenario, parsed from the locked harness -- same regex the frozen harness uses. */
function firstScenario(): { id: string; regime: L3RegulatoryContextValue; text: string } {
  const src = readFileSync(HARNESS, 'utf8');
  const block = src.slice(src.indexOf('const S: Scen[] = ['), src.indexOf('\nconst FAM = ['));
  const re = /\{\s*id:\s*'([^']+)',\s*pole:\s*'([^']+)',\s*regime:\s*'([^']+)',\s*expectActive:\s*([^,]+),\s*expectClarification:\s*(true|false),\s*provenance:\s*'([^']+)',\s*\n\s*text:\s*'((?:[^'\\]|\\.)*)'\s*\}/g;
  const m = re.exec(block);
  if (!m) throw new Error('could not parse the locked cohort');
  return { id: m[1], regime: m[3] as L3RegulatoryContextValue, text: m[7].replace(/\\'/g, "'").replace(/\\\\/g, '\\') };
}

/** FAM, read from the locked harness rather than retyped. */
function fam(): string[] {
  const src = readFileSync(HARNESS, 'utf8');
  const block = src.slice(src.indexOf('\nconst FAM = ['));
  const arr = block.slice(block.indexOf('['), block.indexOf(']') + 1);
  return JSON.parse(arr.replace(/'/g, '"').replace(/,\s*\]/, ']'));
}

const s = firstScenario();
const FAM = fam();
const input: ReasoningInput = buildReasoningInput({
  analysisId: `l32j-${s.id}`, observationText: s.text,
  regulatoryContext: { value: s.regime, provenance: 'USER_CONFIRMED' },
  allowedHazardFamilies: FAM as any,
}).input;

const rows = [
  ['L3_PROMPT_VERSION',        L3_PROMPT_VERSION,                                EXPECTED.promptVersion],
  ['sha256(L3_SYSTEM_PROMPT)', sha(L3_SYSTEM_PROMPT),                            EXPECTED.systemPrompt],
  ['run schema sha256',        sha(JSON.stringify(buildProposalSchema(input))),  EXPECTED.runSchema],
  ['locked cohort harness',    sha(readFileSync(HARNESS)),                       EXPECTED.harness],
] as const;

let ok = 0, bad = 0;
console.log('L3 PROVIDER READINESS -- PHASE 4 INNER IDENTITY RE-DERIVATION');
console.log('cohort first scenario id  ' + s.id + '   (already-open diagnostic material)');
console.log('allowed hazard families   ' + FAM.length);
console.log('');
for (const [name, got, want] of rows) {
  const v = got === want ? 'MATCH' : 'MISMATCH';
  if (got === want) ok += 1; else bad += 1;
  console.log(`${v.padEnd(9)} ${name.padEnd(26)} ${got}`);
  if (got !== want) console.log(`${''.padEnd(9)} ${'expected'.padEnd(26)} ${want}`);
}
console.log('');
console.log(`OK = ${ok}  MISMATCH = ${bad}`);
console.log('NO INFERENCE. NO NETWORK. NO PROTECTED SOURCE READ. NO HOLDOUT ROW READ.');
if (bad > 0) process.exit(1);
