/**
 * §196 -- SOURCE INTEGRITY GATE. Read-only. Zero provider calls, zero database operations.
 *
 * §196 created a prospective first-pass protocol, a deterministic projection and a v3.3 admission,
 * and touched no existing runtime file. This gate proves that: every hash §187 and §192 pinned is
 * unchanged, v3/v3.1/v3.2 are byte-identical, the §195 package is untouched, and the two
 * reconstruction claims -- vNext minus its block reproduces v15 -- hold against the files on disk.
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  EXPERT_SYSTEM_PROMPT, buildExpertWireSchema, stableStringify, EXPERT_PROMPT_VERSION,
} from '../src/hazlenz/expert-hazlenz/expert-prompt';
import {
  CITATION_SHAPED_PATTERN,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import type { ExpertAnalysisInput } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import {
  EXPERT_VERIFIER_V3_SYSTEM_PROMPT, VERIFIER_V3_RESPONSE_SCHEMA,
} from './lib/expert-verifier-instruction-v3';
import {
  EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT, VERIFIER_V3_1_RESPONSE_SCHEMA,
} from './lib/expert-verifier-instruction-v3-1';
import {
  EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT, VERIFIER_V3_2_RESPONSE_SCHEMA,
} from './lib/expert-verifier-instruction-v3-2';
import {
  EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT, EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION,
  buildExpertVNextWireSchema, reconstructV15SystemPrompt, reconstructV15WireSchema,
} from './lib/expert-first-pass-instruction-vnext';
import {
  FIRST_PASS_OWED_FACT_PROJECTION_VERSION,
} from './lib/expert-first-pass-owed-fact-projection';
import { EXPERT_VERIFIER_CONTRACT_V3_3_VERSION } from './lib/expert-verifier-contract-v3-3';
import { GOVERNED_CITATION_REUSE_VERSION } from './lib/expert-governed-citation-reuse';
import { sweepAuditability } from './lib/expert-source-audit-integrity';

const ROOT = join(__dirname, '..', '..');
const SRC = join(ROOT, 'backend', 'src', 'hazlenz', 'expert-hazlenz');
const LIB = join(__dirname, 'lib');
const V = (n: string): string => join(ROOT, 'verification', n);
const E187 = V('expert-hazlenz-required-structured-verifier-validation-2026-09-05');
const E189 = V('expert-hazlenz-required-structured-verifier-human-adjudication-2026-09-06');
const E192 = V('expert-hazlenz-verifier-v3-1-prospective-validation-2026-09-06');
const E195 = V('expert-hazlenz-v3-2-end-to-end-validation-2026-09-06');
const E196 = V('expert-hazlenz-structured-first-pass-owed-facts-2026-09-06');

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => sha(readFileSync(p, 'utf8'));
const P187 = JSON.parse(readFileSync(join(E187, 'PREREGISTRATION.json'), 'utf8'));
const P192 = JSON.parse(readFileSync(join(E192, 'PREREGISTRATION.json'), 'utf8'));

const checks: Array<{ id: string; expected: string; actual: string; ok: boolean }> = [];
const check = (id: string, e: string, a: string): void => {
  checks.push({ id, expected: e, actual: a, ok: e === a });
};

// ---- the three verifier protocols, unchanged.
check('v3 system prompt', P187.verifierIdentity.systemPromptSha256, sha(EXPERT_VERIFIER_V3_SYSTEM_PROMPT));
check('v3 response schema', P187.verifierIdentity.responseSchemaSha256, sha(JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA)));
check('v3.1 system prompt — §192 stays attached', P192.verifierIdentity.systemPromptSha256, sha(EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT));
check('v3.1 response schema — §192 stays attached', P192.verifierIdentity.responseSchemaSha256, sha(JSON.stringify(VERIFIER_V3_1_RESPONSE_SCHEMA)));
check('v3 admission validator', P192.verifierIdentity.admissionValidatorSha256, shaFile(join(LIB, 'expert-verifier-contract-v3.ts')));

// ---- the §195 frozen protocol identity, recomputed from the files rather than copied.
const H195 = readFileSync(join(E195, 'PROTOCOL-HASHES.txt'), 'utf8');
const pinned = (label: string): string =>
  (H195.split('\n').find(l => l.trim().startsWith(label)) ?? '').trim().split(/\s{2,}/).pop() ?? '';
check('§195 v3.2 system prompt unchanged', pinned('verifier system prompt'), sha(EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT));
check('§195 v3.2 response schema unchanged', pinned('verifier schema'), sha(JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA)));
check('§195 first-pass system prompt unchanged', pinned('first-pass system prompt'), sha(EXPERT_SYSTEM_PROMPT));

// ---- the first pass, untouched.
check('first-pass expert-prompt.ts', P187.firstPassIdentity.promptFileSha256, shaFile(join(SRC, 'expert-prompt.ts')));
check('first-pass system prompt', P187.firstPassIdentity.systemPromptSha256, sha(EXPERT_SYSTEM_PROMPT));
check('first-pass prompt version', 'hazlenz.expert.prompt.v15', EXPERT_PROMPT_VERSION);

// ---- the owed-fact runtime contract, untouched. §196 projects INTO it and never edits it.
for (const [f, e] of Object.entries<string>(P187.owedFactSourceHashes)) {
  check(`owed-facts/${f}`, e, shaFile(join(SRC, 'owed-facts', f)));
}
check('canonical CITATION_SHAPED_PATTERN reused, not redefined', '\\b\\d{2}\\s*CFR\\s*\\d+', CITATION_SHAPED_PATTERN.source);

// ---- the human gate is still unmeasured; §196 measured nothing.
const human = JSON.parse(readFileSync(join(E189, 'RAW-HUMAN-ANSWERS.json'), 'utf8'));
check('§189 human gate still UNMEASURED', '65 / 112', human.completeness.HUMAN_ADJUDICATION_COMPLETENESS);

// ---- §195 remains an execution-inconclusive pre-spend run.
const R195 = JSON.parse(readFileSync(join(E195, 'RUN-SUMMARY.json'), 'utf8'));
check('§195 EXECUTED still false', 'false', String(R195.EXECUTED));
check('§195 provider calls still 0', '0', String(R195.PROVIDER_CALLS));
check('§195 spend still 0', '0', String(R195.ACTUAL_PROVIDER_SPEND_USD));
for (const a of R195.artifactsNotProducedBecauseNoExecution as string[]) {
  check(`§195 execution artifact still absent: ${a}`, 'absent', existsSync(join(E195, a)) ? 'PRESENT' : 'absent');
}

// ---- the two §196 reconstruction claims, against the files on disk.
const RECON_INPUT: ExpertAnalysisInput = {
  contractVersion: 'hazlenz.expert.input.v1',
  analysisId: 'AN-196-INTEGRITY',
  authoritativeSources: [{ sourceId: 'OBS-1', sourceType: 'observation', text: 'x' }],
  inspectionContext: { location: null, task: null },
  jurisdiction: 'US-OSHA',
  allowedHazardFamilies: ['machine_guarding'],
  deterministicFindings: [],
  governedStandards: [],
  answeredClarifications: [],
};
const RECON_GOVERNED = { governedEvidenceSourceIds: ['GOV-1'] };
check('vNext minus its block reproduces v15 prompt', sha(EXPERT_SYSTEM_PROMPT), sha(reconstructV15SystemPrompt()));
check('vNext minus its additions reproduces v15 schema',
  sha(stableStringify(buildExpertWireSchema(RECON_INPUT))),
  sha(stableStringify(reconstructV15WireSchema(RECON_INPUT, RECON_GOVERNED))));

const sw = sweepAuditability(join(ROOT, 'backend', 'scripts'));
check('backend/scripts audit sweep clean', 'clean', sw.clean ? 'clean' : sw.unauditable.map(u => u.path).join(','));

const failed = checks.filter(c => !c.ok);
const L: string[] = [];
L.push('§196 SOURCE INTEGRITY GATE — STRUCTURED FIRST-PASS OWED-FACT ARCHITECTURE');
L.push(`recomputed ${new Date().toISOString()} from the files on disk`);
L.push('');
L.push(`RESULT: ${failed.length === 0 ? 'PASS' : 'FAIL'}   ${checks.length - failed.length}/${checks.length}`);
L.push('');
for (const c of checks) {
  L.push(`${c.ok ? 'OK  ' : 'FAIL'}  ${c.id}`);
  L.push(`        expected  ${c.expected}`);
  if (!c.ok) L.push(`        actual    ${c.actual}`);
}
L.push('');
L.push('PROTOCOL IDENTITIES — never merged');
L.push('');
L.push(`  first-pass v15    ${sha(EXPERT_SYSTEM_PROMPT)}   UNCHANGED, all first-pass evidence attached`);
L.push(`  first-pass vNext  ${sha(EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT)}   NEW, zero hosted evidence`);
L.push(`                    schema ${sha(stableStringify(buildExpertVNextWireSchema(RECON_INPUT, RECON_GOVERNED)))}`);
L.push(`                    version ${EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION}`);
L.push(`  verifier v3       ${sha(EXPERT_VERIFIER_V3_SYSTEM_PROMPT)}   §187B`);
L.push(`  verifier v3.1     ${sha(EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT)}   §192 PASS, immutable`);
L.push(`  verifier v3.2     ${sha(EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT)}   §194, hosted-unvalidated`);
L.push('');
L.push('  v3.3 IS AN ADMISSION CHANGE ONLY. There is no v3.3 instruction and no v3.3 prompt hash:');
L.push('  the v3.2 prompt and schema above are byte-unchanged and remain the protocol a verifier');
L.push('  would be run under. The instruction stays STRICTER than the boundary, deliberately.');
L.push('');
L.push('FILES ADDED BY §196');
L.push('  NEW  backend/scripts/lib/expert-first-pass-instruction-vnext.ts');
L.push(`       sha256 ${shaFile(join(LIB, 'expert-first-pass-instruction-vnext.ts'))}`);
L.push('  NEW  backend/scripts/lib/expert-first-pass-owed-fact-projection.ts');
L.push(`       sha256 ${shaFile(join(LIB, 'expert-first-pass-owed-fact-projection.ts'))}`);
L.push(`       version ${FIRST_PASS_OWED_FACT_PROJECTION_VERSION}`);
L.push('  NEW  backend/scripts/lib/expert-governed-citation-reuse.ts');
L.push(`       sha256 ${shaFile(join(LIB, 'expert-governed-citation-reuse.ts'))}`);
L.push(`       version ${GOVERNED_CITATION_REUSE_VERSION}`);
L.push('  NEW  backend/scripts/lib/expert-verifier-contract-v3-3.ts');
L.push(`       sha256 ${shaFile(join(LIB, 'expert-verifier-contract-v3-3.ts'))}`);
L.push(`       version ${EXPERT_VERIFIER_CONTRACT_V3_3_VERSION}`);
L.push('  NEW  backend/scripts/test-196-structured-first-pass-owed-facts.ts');
L.push(`       sha256 ${shaFile(join(__dirname, 'test-196-structured-first-pass-owed-facts.ts'))}`);
L.push('  NEW  backend/scripts/verify-196-source-integrity-2026-09-06.ts  this gate');
L.push('  No existing runtime file was modified by §196.');
L.push('');
L.push('§196 EXECUTED A PROVIDER CALL = FALSE. §195 REMAINS INCONCLUSIVE BEFORE SPEND.');
L.push('PROVIDER_CALLS = 0   DATABASE_OPERATIONS = 0   PRODUCTION_ACTIVATION = NONE');
L.push('§189 HUMAN GATE = UNMEASURED (65/112)   v3.2 HOSTED VALIDATED = FALSE');
L.push('vNext HOSTED VALIDATED = FALSE   v3.3 HOSTED VALIDATED = FALSE');
L.push('');

if (existsSync(E196)) writeFileSync(join(E196, 'SOURCE-INTEGRITY.txt'), `${L.join('\n')}\n`);
console.log(L.join('\n'));
if (failed.length > 0) process.exit(1);
