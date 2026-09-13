/**
 * §197 -- PRE-SPEND SOURCE INTEGRITY GATE. Read-only. Zero provider calls, zero database operations.
 *
 * Runs BEFORE the first provider call and must PASS. If it fails, provider calls = 0 and the run
 * stops; the failure is recorded and the correction is reviewed rather than silently executed under
 * the same preregistered state.
 *
 * What it proves, beyond the hash pins §193-§196 already carry:
 *
 *   - the vNext construction invariants still hold and v15 is byte-unchanged
 *   - the reversibility invariant still holds against the files on disk
 *   - THE FIRST-PASS SCHEMA IDENTITY BOUNDARY: no `factKey` property exists anywhere in the wire
 *     schema the model will actually be sent, so a provider cannot author identity
 *   - the projection's provenance table still covers a projected OwedFact exactly
 *   - the v3.3 boundary refuses an unsupplied citation and admits a supplied one, on live modules
 *   - the settlement-authority boundary is intact
 *   - the §196 and §195 evidence packages are untouched
 *   - the worktree state, recorded so the preregistration names the exact code that ran
 */
import { createHash } from 'crypto';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_SYSTEM_PROMPT, buildExpertWireSchema, stableStringify, EXPERT_PROMPT_VERSION,
} from '../src/hazlenz/expert-hazlenz/expert-prompt';
import {
  CITATION_SHAPED_PATTERN,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import type { ExpertAnalysisInput } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import {
  TRANSITION_AUTHORITIES, REQUIRED_AUTHORITY,
} from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
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
  UNRESOLVED_FACT_DECLARATIONS_FIELD,
} from './lib/expert-first-pass-instruction-vnext';
import {
  projectDeclaredOwedFacts, OWED_FACT_FIELD_PROVENANCE, FIRST_PASS_PROJECTED_PRIORITY,
  PROJECTED_STATUS, firstPassProjectionEffect, FIRST_PASS_OWED_FACT_PROJECTION_VERSION,
} from './lib/expert-first-pass-owed-fact-projection';
import {
  checkVerifierV3_3Output, EXPERT_VERIFIER_CONTRACT_V3_3_VERSION, UNAUTHORISED_REGULATORY_CITATION,
} from './lib/expert-verifier-contract-v3-3';
import { EXPERT_VERIFIER_CONTRACT_V3_VERSION } from './lib/expert-verifier-contract-v3';
import {
  SECTION_197_COHORT, SECTION_197_COHORT_VERSION, cohortDesignDefects, COHORT_COVERAGE,
} from './lib/expert-197-cohort-2026-09-07';
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
const E197 = V('expert-hazlenz-structured-e2e-validation-2026-09-07');

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => sha(readFileSync(p, 'utf8'));
const P187 = JSON.parse(readFileSync(join(E187, 'PREREGISTRATION.json'), 'utf8'));
const P192 = JSON.parse(readFileSync(join(E192, 'PREREGISTRATION.json'), 'utf8'));

const checks: Array<{ id: string; expected: string; actual: string; ok: boolean }> = [];
const check = (id: string, e: string, a: string): void => {
  checks.push({ id, expected: e, actual: a, ok: e === a });
};

// ---- prior protocol identities, unchanged.
check('v3 system prompt', P187.verifierIdentity.systemPromptSha256, sha(EXPERT_VERIFIER_V3_SYSTEM_PROMPT));
check('v3 response schema', P187.verifierIdentity.responseSchemaSha256, sha(JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA)));
check('v3.1 system prompt — §192 stays attached', P192.verifierIdentity.systemPromptSha256, sha(EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT));
check('v3.1 response schema — §192 stays attached', P192.verifierIdentity.responseSchemaSha256, sha(JSON.stringify(VERIFIER_V3_1_RESPONSE_SCHEMA)));
check('v3 admission validator', P192.verifierIdentity.admissionValidatorSha256, shaFile(join(LIB, 'expert-verifier-contract-v3.ts')));

const H195 = readFileSync(join(E195, 'PROTOCOL-HASHES.txt'), 'utf8');
const pinned = (label: string): string =>
  (H195.split('\n').find(l => l.trim().startsWith(label)) ?? '').trim().split(/\s{2,}/).pop() ?? '';
check('v3.2 system prompt unchanged since §195', pinned('verifier system prompt'), sha(EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT));
check('v3.2 response schema unchanged since §195', pinned('verifier schema'), sha(JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA)));

// ---- v15 base, untouched.
check('first-pass expert-prompt.ts', P187.firstPassIdentity.promptFileSha256, shaFile(join(SRC, 'expert-prompt.ts')));
check('v15 system prompt', P187.firstPassIdentity.systemPromptSha256, sha(EXPERT_SYSTEM_PROMPT));
check('v15 prompt version', 'hazlenz.expert.prompt.v15', EXPERT_PROMPT_VERSION);

// ---- the §187-pinned OwedFact contract, unmutated. The authorization forbids touching it.
for (const [f, e] of Object.entries<string>(P187.owedFactSourceHashes)) {
  check(`owed-facts/${f}`, e, shaFile(join(SRC, 'owed-facts', f)));
}
check('canonical CITATION_SHAPED_PATTERN reused, not redefined', '\\b\\d{2}\\s*CFR\\s*\\d+', CITATION_SHAPED_PATTERN.source);

// ---- §196 identities, recomputed from its own recorded integrity file.
const H196 = readFileSync(join(E196, 'SOURCE-INTEGRITY.txt'), 'utf8');
const pinned196 = (label: string): string => {
  const line = H196.split('\n').find(l => l.trim().startsWith(label));
  return line ? (line.trim().split(/\s{2,}/)[1] ?? '') : '';
};
check('§196 vNext system prompt unchanged', pinned196('first-pass vNext'), sha(EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT));
check('§196 evidence: 14 files still present', '14',
  String(execSync(`ls -1 ${JSON.stringify(E196)} | wc -l`, { encoding: 'utf8' }).trim()));

// ---- vNext construction and reversibility, against the files on disk.
const RECON_INPUT: ExpertAnalysisInput = {
  contractVersion: 'hazlenz.expert.input.v1',
  analysisId: 'AN-197-INTEGRITY',
  authoritativeSources: [{ sourceId: 'OBS-1', sourceType: 'observation', text: 'x' }],
  inspectionContext: { location: null, task: null },
  jurisdiction: 'osha-general-industry',
  allowedHazardFamilies: ['machine_guarding'],
  deterministicFindings: [], governedStandards: [], answeredClarifications: [],
};
const RECON_GOV = { governedEvidenceSourceIds: [] as string[] };
check('vNext minus its block reproduces v15 prompt', sha(EXPERT_SYSTEM_PROMPT), sha(reconstructV15SystemPrompt()));
check('vNext minus its additions reproduces v15 schema',
  sha(stableStringify(buildExpertWireSchema(RECON_INPUT))),
  sha(stableStringify(reconstructV15WireSchema(RECON_INPUT, RECON_GOV))));
check('vNext instruction version', 'hazlenz.expert.first-pass-instruction.vNext',
  EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION);

// ---- THE IDENTITY BOUNDARY, checked on the schema the model will actually be sent.
//
// Not on a description of it: every one of the twelve real request schemas is serialised and
// searched for a `factKey` property. A provider cannot author identity it has no field for, and
// this is the check that keeps that true through a protocol change.
let factKeyPropertyFound = 0;
let declarationsCollectionMissing = 0;
for (const row of SECTION_197_COHORT) {
  const input: ExpertAnalysisInput = {
    contractVersion: 'hazlenz.expert.input.v1',
    analysisId: `AN-197-${row.rowId}`,
    authoritativeSources: [{ sourceId: `OBS-${row.rowId}`, sourceType: 'observation', text: row.observation }],
    inspectionContext: { location: row.location, task: row.task },
    jurisdiction: row.jurisdiction,
    allowedHazardFamilies: [...row.allowedHazardFamilies],
    deterministicFindings: row.deterministicFindings.map(f => ({ ...f, requiredActions: [...f.requiredActions] })),
    governedStandards: row.governedStandards.map(g => ({ ...g })),
    answeredClarifications: [],
  };
  const schema: any = buildExpertVNextWireSchema(input, RECON_GOV);
  const declItem = schema.properties?.[UNRESOLVED_FACT_DECLARATIONS_FIELD]?.items?.properties;
  if (declItem === undefined) declarationsCollectionMissing += 1;
  else if ('factKey' in declItem) factKeyPropertyFound += 1;
  // A `factKey` property anywhere in the whole schema, not only in the declaration item.
  if (/"factKey"\s*:/.test(JSON.stringify(schema))) factKeyPropertyFound += 1;
}
check('no factKey property in any of the 12 request schemas', '0', String(factKeyPropertyFound));
check('the declaration collection is present in all 12 request schemas', '0', String(declarationsCollectionMissing));

// ---- projection provenance coverage, on a live projection.
const PROBE_OBS = 'The third mounting point is behind the column and could not be seen.';
const probe = projectDeclaredOwedFacts({
  declarations: [{
    declarationId: 'D1',
    missingFact: 'whether the guard is fastened at every mounting point',
    observationSourceId: 'OBS-P',
    observationSpan: 'could not be seen',
    notEstablishedBecause: 'the text records only that the point could not be seen',
    affectedDecision: 'REQUIRED_CONTROL',
    branchA: 'the guard is fastened at every point',
    decisionIfA: 'the machine continues in use',
    branchB: 'the guard is unfastened at one point',
    decisionIfB: 'the machine is stopped until the guard is secured',
    whyNecessaryNow: 'the machine is running now',
    governedEvidenceSourceIds: [],
  }],
  sources: [{ sourceId: 'OBS-P', text: PROBE_OBS }],
  suppliedGovernedSourceIds: [],
  stage: 'FIRST_PASS_MODEL',
});
check('projection admits a well-formed declaration', '1', String(probe.facts.length));
check('provenance table covers a projected OwedFact exactly',
  JSON.stringify(Object.keys(probe.facts[0] ?? {}).sort()),
  JSON.stringify(OWED_FACT_FIELD_PROVENANCE.map(p => p.owedFactField).sort()));
check('projected priority is the non-escalating floor', 'OTHER', String(FIRST_PASS_PROJECTED_PRIORITY));
check('projected status is UNRESOLVED', 'UNRESOLVED', String(PROJECTED_STATUS));
check('projection version', 'hazlenz.expert.first-pass-owed-fact-projection.v1', FIRST_PASS_OWED_FACT_PROJECTION_VERSION);
check('projection effect false on every axis', 'false,false,false,false,false',
  Object.values(firstPassProjectionEffect()).map(String).join(','));
check('a provider-sent factKey is refused, not stripped', 'true',
  String(projectDeclaredOwedFacts({
    declarations: [{ declarationId: 'D1', factKey: 'FP.MINE.1' }],
    sources: [{ sourceId: 'OBS-P', text: PROBE_OBS }],
    suppliedGovernedSourceIds: [], stage: 'FIRST_PASS_MODEL',
  }).perDeclaration[0].codes.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD')));

// ---- the v3.3 boundary, on live modules.
const GOV_TEXT = 'Work rests shall be kept adjusted closely to the wheel. Governing text: '
  + '29 CFR 1910.215(a)(4).';
const v33Input = {
  analysisId: 'AN-INT', observation: PROBE_OBS, suppliedOwedFactKeys: ['FP.K.1'],
  suppliedGovernedSourceIds: ['GOV-1'],
  suppliedGovernedEvidence: [{ sourceId: 'GOV-1', text: GOV_TEXT }],
};
const verdict = (rb: unknown): Record<string, unknown> => ({
  verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION, analysisId: 'AN-INT',
  verdict: 'NO_CLARIFICATION_REQUIRED', rationale: 'the observation settles it',
  clarificationSourceMode: null, proposedClarification: null, bindingFactKey: null,
  nominatedFact: null,
  owedFactDeclarations: [{ factKey: 'FP.K.1', declaration: 'STILL_UNRESOLVED', challengeReason: null }],
  regulatoryBasis: rb,
});
check('v3.3 admits a citation copied from a supplied source', 'true',
  String(checkVerifierV3_3Output(verdict({
    reliance: 'SUPPLIED_GOVERNED_EVIDENCE', sourceIds: ['GOV-1'],
    proposition: 'the supplied record at 29 CFR 1910.215(a)(4) sets a maximum opening',
  }), v33Input).admitted));
check('v3.3 refuses a citation absent from every supplied source', 'true',
  String(checkVerifierV3_3Output(verdict({
    reliance: 'SUPPLIED_GOVERNED_EVIDENCE', sourceIds: ['GOV-1'],
    proposition: 'read with 29 CFR 1910.147 the record requires isolation',
  }), v33Input).codes.includes(UNAUTHORISED_REGULATORY_CITATION as never)));
check('v3.3 refuses a citation under reliance NONE', 'true',
  String(checkVerifierV3_3Output({
    ...verdict({ reliance: 'NONE', sourceIds: [], proposition: null }),
    rationale: 'the observation does not settle this; 29 CFR 1910.215 applies',
  }, v33Input).codes.includes(UNAUTHORISED_REGULATORY_CITATION as never)));
check('v3.3 admission contract version', 'hazlenz.expert.verifier.v3.3', EXPERT_VERIFIER_CONTRACT_V3_3_VERSION);

// ---- settlement authority: nothing on the model path can move a fact out of UNRESOLVED.
//
// Asserted against the VALUES of the exported constant, not by grepping the file. The first draft
// of this gate grepped for /MODEL/ near TRANSITION_AUTHORITIES and failed on the module's own
// comment explaining that there is deliberately no member for a model explanation — the §170
// lesson that a source scan must read code and not prose, arriving one gate later.
check('the three transition authorities are exactly the frozen set',
  'ADMITTED_BINDING,ADMISSIBLE_EVIDENCE,RECORDED_ARBITRATION', TRANSITION_AUTHORITIES.join(','));
check('no transition authority names a model, a provider or an explanation', '0',
  String((TRANSITION_AUTHORITIES as readonly string[])
    .filter(a => /MODEL|PROVIDER|EXPLANATION|RATIONALE/i.test(a)).length));
check('every terminal status requires a named authority', '3',
  String(Object.keys(REQUIRED_AUTHORITY).length));
check('projection never calls transition()', 'true',
  String(!/\btransition\s*\(/.test(readFileSync(join(LIB, 'expert-first-pass-owed-fact-projection.ts'), 'utf8'))));

// ---- cohort.
check('cohort design defects', '0', String(cohortDesignDefects().length));
check('cohort rows', '12', String(COHORT_COVERAGE.rows));
check('cohort version', 'hazlenz.expert.structured-e2e-cohort.2026-09-07', SECTION_197_COHORT_VERSION);
check('no cohort observation carries a citation-shaped string', '0',
  String(SECTION_197_COHORT.filter(r => CITATION_SHAPED_PATTERN.test(r.observation)).length));

// ---- prior packages untouched.
const human = JSON.parse(readFileSync(join(E189, 'RAW-HUMAN-ANSWERS.json'), 'utf8'));
check('§189 human gate still UNMEASURED', '65 / 112', human.completeness.HUMAN_ADJUDICATION_COMPLETENESS);
const R195 = JSON.parse(readFileSync(join(E195, 'RUN-SUMMARY.json'), 'utf8'));
check('§195 EXECUTED still false', 'false', String(R195.EXECUTED));
check('§195 provider calls still 0', '0', String(R195.PROVIDER_CALLS));
for (const a of R195.artifactsNotProducedBecauseNoExecution as string[]) {
  check(`§195 execution artifact still absent: ${a}`, 'absent', existsSync(join(E195, a)) ? 'PRESENT' : 'absent');
}
const R196 = JSON.parse(readFileSync(join(E196, 'RUN-SUMMARY.json'), 'utf8'));
check('§196 provider calls still 0', '0', String(R196.PROVIDER_CALLS));
check('§196 terminal unchanged',
  'EXPERT_HAZLENZ_STRUCTURED_OWED_FACT_PIPELINE_INTEGRATED — FRESH_END_TO_END_PROTOCOL_VALIDATION_AUTHORIZATION_REQUIRED',
  R196.TERMINAL);
check('§196 NUL-byte incident still recorded in its history', 'true',
  String(String(R196.INTEGRITY_GATE_FINDING_ABOUT_SECTION_196_ITSELF ?? '').includes('33/34')));

// ---- auditability: no NUL bytes anywhere in the material this run reads or writes.
const swScripts = sweepAuditability(join(ROOT, 'backend', 'scripts'));
check('backend/scripts audit sweep clean', 'clean', swScripts.clean ? 'clean' : swScripts.unauditable.map(u => u.path).join(','));
const swExpert = sweepAuditability(SRC);
check('expert-hazlenz src audit sweep clean', 'clean', swExpert.clean ? 'clean' : swExpert.unauditable.map(u => u.path).join(','));

// ---- worktree state, recorded so the preregistration names the code that ran.
const gitHead = execSync('git -C ' + JSON.stringify(ROOT) + ' rev-parse HEAD', { encoding: 'utf8' }).trim();
const gitBranch = execSync('git -C ' + JSON.stringify(ROOT) + ' rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
const dirtyCount = execSync('git -C ' + JSON.stringify(ROOT) + ' status --porcelain | wc -l', { encoding: 'utf8' }).trim();

const failed = checks.filter(c => !c.ok);
const L: string[] = [];
L.push('§197 PRE-SPEND SOURCE INTEGRITY GATE — STRUCTURED PIPELINE HOSTED VALIDATION');
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
L.push('WORKTREE AT THE MOMENT OF THE GATE');
L.push(`  branch            ${gitBranch}`);
L.push(`  HEAD              ${gitHead}`);
L.push(`  dirty paths       ${dirtyCount}  (pre-existing uncommitted work from earlier slices, preserved)`);
L.push('');
L.push('PROTOCOL IDENTITIES FOR THIS RUN');
L.push(`  first-pass vNext  ${sha(EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT)}`);
L.push(`  v15 base          ${sha(EXPERT_SYSTEM_PROMPT)}   UNCHANGED`);
L.push(`  verifier v3.2     ${sha(EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT)}   executed prompt`);
L.push(`  admission         ${EXPERT_VERIFIER_CONTRACT_V3_3_VERSION}   (admission-only change; no v3.3 prompt exists)`);
L.push(`  projection        ${shaFile(join(LIB, 'expert-first-pass-owed-fact-projection.ts'))}`);
L.push(`  cohort module     ${shaFile(join(LIB, 'expert-197-cohort-2026-09-07.ts'))}`);
L.push(`  executor          ${shaFile(join(__dirname, 'execute-197-structured-e2e-2026-09-07.ts'))}`);
L.push('');
L.push(failed.length === 0
  ? 'GATE PASSED — hosted execution is permitted under the frozen §197 preregistration.'
  : 'GATE FAILED — PROVIDER CALLS = 0. Do not repair and silently execute under the same '
    + 'preregistered state; record the failure and obtain review.');
L.push('');

if (existsSync(E197)) writeFileSync(join(E197, 'SOURCE-INTEGRITY.txt'), `${L.join('\n')}\n`);
else { mkdirSync(E197, { recursive: true }); writeFileSync(join(E197, 'SOURCE-INTEGRITY.txt'), `${L.join('\n')}\n`); }
console.log(L.join('\n'));
if (failed.length > 0) process.exit(1);
