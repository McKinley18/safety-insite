/**
 * §198 -- SOURCE INTEGRITY GATE. Read-only over source. Zero provider calls, zero DB operations.
 *
 * ==================== WHY THIS GATE DOES NOT RE-RUN THE §196 AND §197 GATES ====================
 *
 * `verify-196-source-integrity` and `verify-197-source-integrity` both WRITE `SOURCE-INTEGRITY.txt`
 * into their own evidence directories. Re-running either after §198 would do one of two things,
 * both wrong:
 *
 *   - overwrite a frozen historical record with a §198-era recomputation, or
 *   - fail on a pin that §198 deliberately moved -- the §197 gate pins the OLD vNext prompt hash,
 *     and §198 changed the vNext prompt on purpose.
 *
 * So this gate SUBSUMES every still-valid check those two made, adds the §198 ones, and separately
 * asserts that both evidence packages are BYTE-UNCHANGED against a hash manifest computed from the
 * files themselves. Preservation is proven by hashing the evidence, not by re-deriving it.
 */
import { createHash } from 'crypto';
import { execSync } from 'child_process';
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_SYSTEM_PROMPT, buildExpertWireSchema, buildExpertUserPrompt, stableStringify,
  EXPERT_PROMPT_VERSION,
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
  EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT, EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
  EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION, buildExpertVNextWireSchema,
  reconstructV15SystemPrompt, reconstructV15WireSchema, reconstructV15UserPrompt,
  buildExpertVNextUserPrompt, governedBindingFor, UNRESOLVED_FACT_DECLARATIONS_FIELD,
} from './lib/expert-first-pass-instruction-vnext';
import {
  FIRST_PASS_OWED_FACT_PROJECTION_VERSION, FIRST_PASS_PROJECTED_PRIORITY, PROJECTED_STATUS,
  OWED_FACT_FIELD_PROVENANCE, projectDeclaredOwedFacts, firstPassProjectionEffect,
} from './lib/expert-first-pass-owed-fact-projection';
import { EXPERT_VERIFIER_CONTRACT_V3_3_VERSION } from './lib/expert-verifier-contract-v3-3';
import {
  PRE_INFERENCE_CIRCUIT_BREAKER_VERSION, CONSECUTIVE_IDENTICAL_REJECTIONS_TO_STOP,
} from './lib/expert-pre-inference-circuit-breaker';
import { EMPTY_RUN_SAFETY_VERSION } from './lib/expert-empty-run-safety';
import { SOURCE_SEMANTIC_SCAN_VERSION } from './lib/expert-source-semantic-scan';
import { K3_HISTORICAL_ASSERTION } from './lib/expert-superseded-claims';
import { SECTION_197_COHORT } from './lib/expert-197-cohort-2026-09-07';
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
const E198 = V('expert-hazlenz-structured-pipeline-transport-remediation-2026-09-07');

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => sha(readFileSync(p, 'utf8'));
const P187 = JSON.parse(readFileSync(join(E187, 'PREREGISTRATION.json'), 'utf8'));
const P192 = JSON.parse(readFileSync(join(E192, 'PREREGISTRATION.json'), 'utf8'));

const checks: Array<{ id: string; expected: string; actual: string; ok: boolean }> = [];
const check = (id: string, e: string, a: string): void => {
  checks.push({ id, expected: e, actual: a, ok: e === a });
};

// ================================================================ subsumed §196/§197 checks

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

check('first-pass expert-prompt.ts UNTOUCHED', P187.firstPassIdentity.promptFileSha256, shaFile(join(SRC, 'expert-prompt.ts')));
check('v15 system prompt UNTOUCHED', P187.firstPassIdentity.systemPromptSha256, sha(EXPERT_SYSTEM_PROMPT));
check('v15 prompt version', 'hazlenz.expert.prompt.v15', EXPERT_PROMPT_VERSION);
for (const [f, e] of Object.entries<string>(P187.owedFactSourceHashes)) {
  check(`owed-facts/${f} UNMUTATED`, e, shaFile(join(SRC, 'owed-facts', f)));
}
check('canonical CITATION_SHAPED_PATTERN reused, not redefined', '\\b\\d{2}\\s*CFR\\s*\\d+', CITATION_SHAPED_PATTERN.source);
check('the three transition authorities are exactly the frozen set',
  'ADMITTED_BINDING,ADMISSIBLE_EVIDENCE,RECORDED_ARBITRATION', TRANSITION_AUTHORITIES.join(','));
check('no transition authority names a model, a provider or an explanation', '0',
  String((TRANSITION_AUTHORITIES as readonly string[])
    .filter(a => /MODEL|PROVIDER|EXPLANATION|RATIONALE/i.test(a)).length));
check('every terminal status requires a named authority', '3', String(Object.keys(REQUIRED_AUTHORITY).length));

const human = JSON.parse(readFileSync(join(E189, 'RAW-HUMAN-ANSWERS.json'), 'utf8'));
check('§189 human gate still UNMEASURED', '65 / 112', human.completeness.HUMAN_ADJUDICATION_COMPLETENESS);
const R195 = JSON.parse(readFileSync(join(E195, 'RUN-SUMMARY.json'), 'utf8'));
check('§195 EXECUTED still false', 'false', String(R195.EXECUTED));
for (const a of R195.artifactsNotProducedBecauseNoExecution as string[]) {
  check(`§195 execution artifact still absent: ${a}`, 'absent', existsSync(join(E195, a)) ? 'PRESENT' : 'absent');
}

// ================================================================ §198 — Option B

const RECON_INPUT: ExpertAnalysisInput = {
  contractVersion: 'hazlenz.expert.input.v1', analysisId: 'AN-198-INTEGRITY',
  authoritativeSources: [{ sourceId: 'OBS-1', sourceType: 'observation', text: 'x' }],
  inspectionContext: { location: null, task: null }, jurisdiction: 'osha-general-industry',
  allowedHazardFamilies: ['machine_guarding'],
  deterministicFindings: [], governedStandards: [], answeredClarifications: [],
};
const NONE = { governedEvidenceSourceIds: [] as string[] };
const GOV = [{ sourceId: 'GOV-1', text: 'Governing text: 29 CFR 1910.215(a)(4).' }];
const ONE = governedBindingFor(GOV);

const zeroSchema: any = buildExpertVNextWireSchema(RECON_INPUT, NONE);
const zeroItem = zeroSchema.properties[UNRESOLVED_FACT_DECLARATIONS_FIELD].items;
check('OPTION B — governedEvidenceSourceIds ABSENT from the zero-source schema', 'absent',
  zeroItem.properties.governedEvidenceSourceIds === undefined ? 'absent' : 'PRESENT');
check('OPTION B — absent from `required` too', 'absent',
  zeroItem.required.includes('governedEvidenceSourceIds') ? 'PRESENT' : 'absent');
check('OPTION B — no maxItems anywhere in the zero-source schema', '0',
  String((JSON.stringify(zeroSchema).match(/maxItems/g) ?? []).length));
check('OPTION B — no governed-binding instruction in the zero-source prompt', 'absent',
  EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT.includes('governedEvidenceSourceIds') ? 'PRESENT' : 'absent');
check('OPTION B — capability PRESENT when a source is supplied', 'present',
  (buildExpertVNextWireSchema(RECON_INPUT, ONE) as any)
    .properties[UNRESOLVED_FACT_DECLARATIONS_FIELD].items.properties.governedEvidenceSourceIds
    !== undefined ? 'present' : 'ABSENT');
check('OPTION B — the exact sourceId is provider-visible when the capability is present', 'visible',
  buildExpertVNextUserPrompt(RECON_INPUT, GOV).includes('sourceId: GOV-1') ? 'visible' : 'HIDDEN');
check('OPTION B — no unsupplied id is rendered', '0',
  String((buildExpertVNextUserPrompt(RECON_INPUT, GOV).match(/GOV-(?!1\b)[A-Z0-9-]+/g) ?? []).length));

// The §197 rejection cause, checked on every one of the twelve real request schemas.
let maxItemsRemaining = 0;
for (const row of SECTION_197_COHORT) {
  const i: ExpertAnalysisInput = {
    contractVersion: 'hazlenz.expert.input.v1', analysisId: `AN-197-${row.rowId}`,
    authoritativeSources: [{ sourceId: `OBS-${row.rowId}`, sourceType: 'observation', text: row.observation }],
    inspectionContext: { location: row.location, task: row.task }, jurisdiction: row.jurisdiction,
    allowedHazardFamilies: [...row.allowedHazardFamilies],
    deterministicFindings: row.deterministicFindings.map(f => ({ ...f, requiredActions: [...f.requiredActions] })),
    governedStandards: row.governedStandards.map(g => ({ ...g })), answeredClarifications: [],
  };
  const binding = governedBindingFor(row.verifierGovernedEvidence.map(g => ({ sourceId: g.sourceId, text: g.text })));
  if (JSON.stringify(buildExpertVNextWireSchema(i, binding)).includes('maxItems')) maxItemsRemaining += 1;
}
check('all twelve §197 request schemas are free of maxItems', '0', String(maxItemsRemaining));

// ================================================================ §198 — reversibility, both variants

check('vNext(absent) minus its block reproduces v15 prompt', sha(EXPERT_SYSTEM_PROMPT), sha(reconstructV15SystemPrompt(NONE)));
check('vNext(present) minus its block reproduces v15 prompt', sha(EXPERT_SYSTEM_PROMPT), sha(reconstructV15SystemPrompt(ONE)));
check('vNext(absent) minus its additions reproduces v15 schema',
  sha(stableStringify(buildExpertWireSchema(RECON_INPUT))),
  sha(stableStringify(reconstructV15WireSchema(RECON_INPUT, NONE))));
check('vNext(present) minus its additions reproduces v15 schema',
  sha(stableStringify(buildExpertWireSchema(RECON_INPUT))),
  sha(stableStringify(reconstructV15WireSchema(RECON_INPUT, ONE))));
check('vNext user prompt minus its block reproduces the v15 user prompt',
  sha(buildExpertUserPrompt(RECON_INPUT)), sha(reconstructV15UserPrompt(RECON_INPUT, GOV)));
check('vNext instruction version', 'hazlenz.expert.first-pass-instruction.vNext',
  EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION);

// ================================================================ §198 — identity boundary intact

let factKeyFound = 0;
for (const g of [NONE, ONE]) {
  if (/"factKey"\s*:/.test(JSON.stringify(buildExpertVNextWireSchema(RECON_INPUT, g)))) factKeyFound += 1;
}
check('no factKey property in either capability variant', '0', String(factKeyFound));

const probe = projectDeclaredOwedFacts({
  declarations: [{
    declarationId: 'D1', missingFact: 'whether the guard is fastened',
    observationSourceId: 'OBS-P', observationSpan: 'could not be seen',
    notEstablishedBecause: 'the text records only that it could not be seen',
    affectedDecision: 'REQUIRED_CONTROL', branchA: 'fastened', decisionIfA: 'continue',
    branchB: 'unfastened', decisionIfB: 'stop the machine', whyNecessaryNow: 'running now',
  }],
  sources: [{ sourceId: 'OBS-P', text: 'The point could not be seen.' }],
  suppliedGovernedSourceIds: [], stage: 'FIRST_PASS_MODEL',
});
check('a declaration with NO governed field projects on a capability-absent treatment', '1',
  String(probe.facts.length));
check('provenance table still covers a projected OwedFact exactly',
  JSON.stringify(Object.keys(probe.facts[0] ?? {}).sort()),
  JSON.stringify(OWED_FACT_FIELD_PROVENANCE.map(p => p.owedFactField).sort()));
check('projected priority is still the non-escalating floor', 'OTHER', String(FIRST_PASS_PROJECTED_PRIORITY));
check('projected status is still UNRESOLVED', 'UNRESOLVED', String(PROJECTED_STATUS));
check('projection effect still false on every axis', 'false,false,false,false,false',
  Object.values(firstPassProjectionEffect()).map(String).join(','));
check('an unsupplied governed id is still refused', 'true',
  String(projectDeclaredOwedFacts({
    declarations: [{
      declarationId: 'D1', missingFact: 'x', observationSourceId: 'OBS-P',
      observationSpan: 'could not be seen', notEstablishedBecause: 'y',
      affectedDecision: 'REQUIRED_CONTROL', branchA: 'a', decisionIfA: 'p', branchB: 'b',
      decisionIfB: 'q', whyNecessaryNow: 'now', governedEvidenceSourceIds: ['GOV-NOPE'],
    }],
    sources: [{ sourceId: 'OBS-P', text: 'The point could not be seen.' }],
    suppliedGovernedSourceIds: [], stage: 'FIRST_PASS_MODEL',
  }).perDeclaration[0].codes.includes('GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET')));

// ================================================================ §198 — new instrument versions

check('circuit breaker version', 'hazlenz.expert.pre-inference-circuit-breaker.v1',
  PRE_INFERENCE_CIRCUIT_BREAKER_VERSION);
check('circuit breaker threshold', '2', String(CONSECUTIVE_IDENTICAL_REJECTIONS_TO_STOP));
check('empty-run safety version', 'hazlenz.expert.empty-run-safety.v1', EMPTY_RUN_SAFETY_VERSION);
check('source semantic scan version', 'hazlenz.expert.source-semantic-scan.v1', SOURCE_SEMANTIC_SCAN_VERSION);
check('K3 recorded as superseded, historical evidence preserved', 'SUPERSEDED_BY_SECTION_198|true',
  `${K3_HISTORICAL_ASSERTION.status}|${String(K3_HISTORICAL_ASSERTION.historicalEvidencePreserved)}`);
check('v3.3 admission contract unchanged', 'hazlenz.expert.verifier.v3.3', EXPERT_VERIFIER_CONTRACT_V3_3_VERSION);
check('projection version unchanged', 'hazlenz.expert.first-pass-owed-fact-projection.v1',
  FIRST_PASS_OWED_FACT_PROJECTION_VERSION);

// ================================================================ §196 / §197 EVIDENCE PRESERVATION

/** Hash every file in a package. Preservation is proven by hashing, never by re-deriving. */
function packageDigest(dir: string): { files: number; digest: string } {
  const names = readdirSync(dir).sort();
  const h = createHash('sha256');
  for (const n of names) h.update(`${n}:${shaFile(join(dir, n))}\n`);
  return { files: names.length, digest: h.digest('hex') };
}
const d196 = packageDigest(E196);
const d197 = packageDigest(E197);
check('§196 evidence file count', '14', String(d196.files));
check('§197 evidence file count', '14', String(d197.files));
check('§196 historical 91/91 output preserved', 'true',
  String(readFileSync(join(E196, 'TEST-OUTPUT.txt'), 'utf8').includes('91/91 PASS')));
check('§196 original K3 line preserved verbatim in its historical output', 'true',
  String(readFileSync(join(E196, 'TEST-OUTPUT.txt'), 'utf8')
    .includes('transport refuses it, and the boundary refuses it again')));
const R197 = JSON.parse(readFileSync(join(E197, 'RUN-SUMMARY.json'), 'utf8'));
check('§197 terminal unchanged',
  'EXPERT_HAZLENZ_STRUCTURED_PIPELINE_VALIDATION_INCONCLUSIVE — EXECUTION_REVIEW_REQUIRED',
  R197.TERMINAL);
check('§197 calls attempted / completed / spend', '12|0|0',
  `${R197.PROVIDER_CALLS_ATTEMPTED}|${R197.PROVIDER_CALLS_COMPLETED}|${R197.ACTUAL_PROVIDER_SPEND_USD}`);
check('§197 every axis still NOT_EXERCISED', 'true',
  String(Object.entries(R197.AXIS_RESULTS).filter(([k]) => k !== 'note')
    .every(([, v]) => String(v).startsWith('NOT_EXERCISED'))));
check('§197 hard-fail report still unevaluable', 'false|null',
  `${R197.HARD_FAIL_CONDITIONS.EVALUABLE}|${String(R197.HARD_FAIL_CONDITIONS.anyTriggered)}`);
check('§197 recorded instrument defects still in its history', 'true',
  String(typeof R197.FOURTH_FINDING_SCORER_DEFECT?.what === 'string'
    && typeof R197.PRE_SPEND_GATES?.gateInstrumentDefectFoundAndFixedPreSpend === 'string'));

// The §197 preregistration must NO LONGER be satisfiable: that is what retires the protocol
// instance and stops a stale freeze from being silently re-run.
const P197 = JSON.parse(readFileSync(join(E197, 'PREREGISTRATION.json'), 'utf8'));
check('§197 preregistration can no longer be satisfied — vNext prompt hash moved', 'moved',
  P197.firstPassIdentity.systemPromptSha256 === sha(EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT)
    ? 'STILL MATCHES' : 'moved');

// ================================================================ auditability

const swScripts = sweepAuditability(join(ROOT, 'backend', 'scripts'));
check('backend/scripts audit sweep clean', 'clean', swScripts.clean ? 'clean' : swScripts.unauditable.map(u => u.path).join(','));
const swExpert = sweepAuditability(SRC);
check('expert-hazlenz src audit sweep clean', 'clean', swExpert.clean ? 'clean' : swExpert.unauditable.map(u => u.path).join(','));

// ================================================================ scoped typecheck
//
// `tsc -p tsconfig.json` does NOT cover `scripts/` — §198 discovered this when a renamed export
// left a broken import that the project typecheck happily ignored. The whole directory does not
// typecheck (2000+ pre-existing errors in unrelated legacy scripts), so this gate checks exactly
// the §196-§198 file set instead of pretending the directory is clean.
let scopedErrors = 'clean';
try {
  execSync('npx tsc --noEmit -p tsconfig.scripts-198.json',
    { cwd: join(ROOT, 'backend'), encoding: 'utf8', stdio: 'pipe' });
} catch (e) {
  const out = `${String((e as any).stdout ?? '')}${String((e as any).stderr ?? '')}`;
  scopedErrors = out.split('\n').filter(l => l.includes('error TS')).slice(0, 3).join(' | ') || 'errors';
}
check('§196–§198 file set typechecks (tsconfig.scripts-198.json)', 'clean', scopedErrors);

// ================================================================ report

const gitHead = execSync(`git -C ${JSON.stringify(ROOT)} rev-parse HEAD`, { encoding: 'utf8' }).trim();
const gitBranch = execSync(`git -C ${JSON.stringify(ROOT)} rev-parse --abbrev-ref HEAD`, { encoding: 'utf8' }).trim();

const failed = checks.filter(c => !c.ok);
const L: string[] = [];
L.push('§198 SOURCE INTEGRITY GATE — TRANSPORT / BINDING REMEDIATION');
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
L.push('PROTOCOL IDENTITIES AFTER REMEDIATION');
L.push('');
L.push(`  v15 base                       ${sha(EXPERT_SYSTEM_PROMPT)}   UNCHANGED`);
L.push(`  vNext, capability ABSENT       ${sha(EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT)}   NEW`);
L.push(`  vNext, capability PRESENT      ${sha(EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT_WITH_GOVERNED_BINDING)}   NEW`);
L.push(`  §197 pinned vNext (retired)    ${P197.firstPassIdentity.systemPromptSha256}`);
L.push(`  verifier v3.2 (executed)       ${sha(EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT)}   UNCHANGED`);
L.push(`  admission contract             ${EXPERT_VERIFIER_CONTRACT_V3_3_VERSION}   UNCHANGED`);
L.push('');
L.push('  The first-pass wire schema is PER-REQUEST and now ALSO per-capability, so no single');
L.push('  schema hash identifies the protocol. A successor preregistration must freeze per-row.');
L.push('');
L.push('EVIDENCE PACKAGE DIGESTS — preservation proven by hashing, not by re-deriving');
L.push(`  §196  ${d196.files} files  ${d196.digest}`);
L.push(`  §197  ${d197.files} files  ${d197.digest}`);
L.push('');
L.push('  verify-196-source-integrity and verify-197-source-integrity were NOT re-run. Both WRITE');
L.push('  into their own evidence directories, and the §197 gate additionally pins the vNext prompt');
L.push('  hash that §198 deliberately moved. Their still-valid checks are subsumed above.');
L.push('');
L.push('FILES ADDED BY §198');
for (const f of ['expert-pre-inference-circuit-breaker.ts', 'expert-empty-run-safety.ts',
  'expert-source-semantic-scan.ts', 'expert-superseded-claims.ts']) {
  L.push(`  NEW  backend/scripts/lib/${f}`);
  L.push(`       sha256 ${shaFile(join(LIB, f))}`);
}
L.push('  NEW  backend/scripts/test-198-transport-remediation.ts');
L.push(`       sha256 ${shaFile(join(__dirname, 'test-198-transport-remediation.ts'))}`);
L.push('  NEW  backend/scripts/verify-198-source-integrity-2026-09-07.ts  this gate');
L.push('');
L.push('FILES MODIFIED BY §198');
L.push('  MOD  backend/scripts/lib/expert-first-pass-instruction-vnext.ts   Option B + user prompt');
L.push(`       sha256 ${shaFile(join(LIB, 'expert-first-pass-instruction-vnext.ts'))}`);
L.push('  MOD  backend/scripts/lib/expert-first-pass-owed-fact-projection.ts   capability-absent parse');
L.push(`       sha256 ${shaFile(join(LIB, 'expert-first-pass-owed-fact-projection.ts'))}`);
L.push('  MOD  backend/scripts/test-196-structured-first-pass-owed-facts.ts   K3 corrected additively');
L.push(`       sha256 ${shaFile(join(__dirname, 'test-196-structured-first-pass-owed-facts.ts'))}`);
L.push('  No file under backend/src/ was modified. expert-prompt.ts is byte-unchanged at v15.');
L.push('');
L.push('WORKTREE');
L.push(`  branch ${gitBranch}   HEAD ${gitHead}`);
L.push('');
L.push('PROVIDER CALLS = 0   DATABASE OPERATIONS = 0   PRODUCTION ACTIVATION = NONE');
L.push('vNext HOSTED VALIDATED = FALSE   v3.3 HOSTED VALIDATED = FALSE');
L.push('');

if (!existsSync(E198)) mkdirSync(E198, { recursive: true });
writeFileSync(join(E198, 'SOURCE-INTEGRITY.txt'), `${L.join('\n')}\n`);
console.log(L.join('\n'));
if (failed.length > 0) process.exit(1);
