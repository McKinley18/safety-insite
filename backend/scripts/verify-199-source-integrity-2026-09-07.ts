/**
 * §199 -- PRE-SPEND SOURCE INTEGRITY GATE. Read-only over source. Zero provider calls, zero DB ops.
 *
 * Runs immediately before the transport canary and must PASS. If it fails: provider calls = 0, STOP.
 *
 * Covers the §198-prescribed list in full, plus the §199-specific additions: the cohort's Option-3
 * structure, the ten reused rows' byte-identity against their §197 originals, and the canary's
 * eligibility. Preservation of §196, §197 and §198 evidence is proven by HASHING those packages,
 * never by re-deriving them — their own gates write into their own directories and are not re-run.
 */
import { createHash } from 'crypto';
import { execSync } from 'child_process';
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_SYSTEM_PROMPT, buildExpertWireSchema, buildExpertUserPrompt, stableStringify,
  EXPERT_PROMPT_VERSION,
} from '../src/hazlenz/expert-hazlenz/expert-prompt';
import { CITATION_SHAPED_PATTERN } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
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
  buildExpertVNextWireSchema, buildExpertVNextUserPrompt, buildExpertVNextSystemPrompt,
  reconstructV15SystemPrompt, reconstructV15WireSchema, reconstructV15UserPrompt,
  renderAvailableGovernedEvidence, governedBindingFor, governedBindingCapability,
  EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION, UNRESOLVED_FACT_DECLARATIONS_FIELD,
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
  normaliseProviderErrorMessage, preInferenceSignature, initialBreakerState, recordAttempt,
  mayIssueNextAttempt, PRE_INFERENCE_CIRCUIT_BREAKER_VERSION,
} from './lib/expert-pre-inference-circuit-breaker';
import { axisResult, hardFailEvaluability, EMPTY_RUN_SAFETY_VERSION } from './lib/expert-empty-run-safety';
import { stripComments } from './lib/expert-source-semantic-scan';
import { K3_HISTORICAL_ASSERTION } from './lib/expert-superseded-claims';
import { SECTION_197_COHORT } from './lib/expert-197-cohort-2026-09-07';
import {
  SECTION_199_COHORT, SECTION_199_COHORT_VERSION, COHORT_COVERAGE, cohortDesignDefects,
  TRANSPORT_CANARY_ROW_ID, REPLACED_SECTION_197_ROWS,
} from './lib/expert-199-cohort-2026-09-07';
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
const E199 = V('expert-hazlenz-successor-structured-e2e-2026-09-07');

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => sha(readFileSync(p, 'utf8'));
const P187 = JSON.parse(readFileSync(join(E187, 'PREREGISTRATION.json'), 'utf8'));
const P192 = JSON.parse(readFileSync(join(E192, 'PREREGISTRATION.json'), 'utf8'));

const checks: Array<{ id: string; expected: string; actual: string; ok: boolean }> = [];
const check = (id: string, e: string, a: string): void => {
  checks.push({ id, expected: e, actual: a, ok: e === a });
};

// ================================================================ prior protocol identities

check('v3 system prompt', P187.verifierIdentity.systemPromptSha256, sha(EXPERT_VERIFIER_V3_SYSTEM_PROMPT));
check('v3 response schema', P187.verifierIdentity.responseSchemaSha256, sha(JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA)));
check('v3.1 system prompt', P192.verifierIdentity.systemPromptSha256, sha(EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT));
check('v3.1 response schema', P192.verifierIdentity.responseSchemaSha256, sha(JSON.stringify(VERIFIER_V3_1_RESPONSE_SCHEMA)));
check('v3 admission validator', P192.verifierIdentity.admissionValidatorSha256, shaFile(join(LIB, 'expert-verifier-contract-v3.ts')));
const H195 = readFileSync(join(E195, 'PROTOCOL-HASHES.txt'), 'utf8');
const pinned195 = (label: string): string =>
  (H195.split('\n').find(l => l.trim().startsWith(label)) ?? '').trim().split(/\s{2,}/).pop() ?? '';
check('v3.2 system prompt unchanged', pinned195('verifier system prompt'), sha(EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT));
check('v3.2 response schema unchanged', pinned195('verifier schema'), sha(JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA)));

// ================================================================ v15 base identity

check('first-pass expert-prompt.ts UNTOUCHED', P187.firstPassIdentity.promptFileSha256, shaFile(join(SRC, 'expert-prompt.ts')));
check('v15 system prompt UNTOUCHED', P187.firstPassIdentity.systemPromptSha256, sha(EXPERT_SYSTEM_PROMPT));
check('v15 prompt version', 'hazlenz.expert.prompt.v15', EXPERT_PROMPT_VERSION);
for (const [f, e] of Object.entries<string>(P187.owedFactSourceHashes)) {
  check(`owed-facts/${f} UNMUTATED`, e, shaFile(join(SRC, 'owed-facts', f)));
}
check('canonical CITATION_SHAPED_PATTERN reused, not redefined', '\\b\\d{2}\\s*CFR\\s*\\d+', CITATION_SHAPED_PATTERN.source);

// ================================================================ vNext construction / reversibility

const RECON: ExpertAnalysisInput = {
  contractVersion: 'hazlenz.expert.input.v1', analysisId: 'AN-199-INTEGRITY',
  authoritativeSources: [{ sourceId: 'OBS-1', sourceType: 'observation', text: 'x' }],
  inspectionContext: { location: null, task: null }, jurisdiction: 'osha-general-industry',
  allowedHazardFamilies: ['machine_guarding'],
  deterministicFindings: [], governedStandards: [], answeredClarifications: [],
};
const NONE = { governedEvidenceSourceIds: [] as string[] };
const GOVR = [{ sourceId: 'GOV-1', text: 'Governing text: 29 CFR 1910.215(a)(4).' }];
const ONE = governedBindingFor(GOVR);

check('vNext(absent) reconstructs to v15 prompt', sha(EXPERT_SYSTEM_PROMPT), sha(reconstructV15SystemPrompt(NONE)));
check('vNext(present) reconstructs to v15 prompt', sha(EXPERT_SYSTEM_PROMPT), sha(reconstructV15SystemPrompt(ONE)));
check('vNext(absent) reconstructs to v15 schema',
  sha(stableStringify(buildExpertWireSchema(RECON))), sha(stableStringify(reconstructV15WireSchema(RECON, NONE))));
check('vNext(present) reconstructs to v15 schema',
  sha(stableStringify(buildExpertWireSchema(RECON))), sha(stableStringify(reconstructV15WireSchema(RECON, ONE))));
check('vNext user prompt reconstructs to the v15 user prompt',
  sha(buildExpertUserPrompt(RECON)), sha(reconstructV15UserPrompt(RECON, GOVR)));
check('vNext instruction version', 'hazlenz.expert.first-pass-instruction.vNext', EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION);

// ================================================================ §198 capability contract

const zeroItem: any = (buildExpertVNextWireSchema(RECON, NONE) as any)
  .properties[UNRESOLVED_FACT_DECLARATIONS_FIELD].items;
check('empty set — capability OMITTED from properties', 'absent',
  zeroItem.properties.governedEvidenceSourceIds === undefined ? 'absent' : 'PRESENT');
check('empty set — omitted from required', 'absent',
  zeroItem.required.includes('governedEvidenceSourceIds') ? 'PRESENT' : 'absent');
check('empty set — no maxItems anywhere', '0',
  String((JSON.stringify(buildExpertVNextWireSchema(RECON, NONE)).match(/maxItems/g) ?? []).length));
check('empty set — no capability instruction in the prompt', 'absent',
  buildExpertVNextSystemPrompt(NONE).includes('governedEvidenceSourceIds') ? 'PRESENT' : 'absent');
const oneItem: any = (buildExpertVNextWireSchema(RECON, ONE) as any)
  .properties[UNRESOLVED_FACT_DECLARATIONS_FIELD].items;
check('nonempty set — capability PRESENT', 'present',
  oneItem.properties.governedEvidenceSourceIds !== undefined ? 'present' : 'ABSENT');
check('nonempty set — enum is exactly the supplied ids', '["GOV-1"]',
  JSON.stringify(oneItem.properties.governedEvidenceSourceIds.items.enum));
check('nonempty set — capability instruction IS in the prompt', 'present',
  buildExpertVNextSystemPrompt(ONE).includes('governedEvidenceSourceIds') ? 'present' : 'ABSENT');
check('prompt and schema derive capability from the SAME supplied set', 'agree',
  (governedBindingCapability(NONE) === 'ABSENT'
    && !buildExpertVNextSystemPrompt(NONE).includes('governedEvidenceSourceIds')
    && governedBindingCapability(ONE) === 'PRESENT'
    && buildExpertVNextSystemPrompt(ONE).includes('governedEvidenceSourceIds')) ? 'agree' : 'DISAGREE');
check('exact sourceId is provider-visible', 'visible',
  buildExpertVNextUserPrompt(RECON, GOVR).includes('sourceId: GOV-1') ? 'visible' : 'HIDDEN');
check('malformed supplied id ABORTS', 'aborts', (() => {
  try { renderAvailableGovernedEvidence([{ sourceId: 'has spaces', text: 'x' }]); return 'ACCEPTED'; }
  catch { return 'aborts'; }
})());
check('duplicate supplied id ABORTS', 'aborts', (() => {
  try { renderAvailableGovernedEvidence([GOVR[0], GOVR[0]]); return 'ACCEPTED'; }
  catch { return 'aborts'; }
})());

// ================================================================ projection / identity boundary

let factKeyFound = 0;
for (const g of [NONE, ONE]) {
  if (/"factKey"\s*:/.test(JSON.stringify(buildExpertVNextWireSchema(RECON, g)))) factKeyFound += 1;
}
check('no factKey property in either capability variant', '0', String(factKeyFound));

const PROBE_OBS = 'The point could not be seen from where the inspector stood.';
const baseDecl = {
  declarationId: 'D1', missingFact: 'whether the guard is fastened',
  observationSourceId: 'OBS-P', observationSpan: 'could not be seen',
  notEstablishedBecause: 'the text records only that it could not be seen',
  affectedDecision: 'REQUIRED_CONTROL', branchA: 'fastened', decisionIfA: 'continue',
  branchB: 'unfastened', decisionIfB: 'stop the machine', whyNecessaryNow: 'running now',
};
const probe = projectDeclaredOwedFacts({
  declarations: [baseDecl], sources: [{ sourceId: 'OBS-P', text: PROBE_OBS }],
  suppliedGovernedSourceIds: [], stage: 'FIRST_PASS_MODEL',
});
check('capability-absent declaration projects', '1', String(probe.facts.length));
check('provenance table covers a projected OwedFact exactly',
  JSON.stringify(Object.keys(probe.facts[0] ?? {}).sort()),
  JSON.stringify(OWED_FACT_FIELD_PROVENANCE.map(p => p.owedFactField).sort()));
check('projected priority is the non-escalating floor', 'OTHER', String(FIRST_PASS_PROJECTED_PRIORITY));
check('projected status is UNRESOLVED', 'UNRESOLVED', String(PROJECTED_STATUS));
check('projection version', 'hazlenz.expert.first-pass-owed-fact-projection.v1', FIRST_PASS_OWED_FACT_PROJECTION_VERSION);
check('projection effect false on every axis', 'false,false,false,false,false',
  Object.values(firstPassProjectionEffect()).map(String).join(','));
check('provider-sent factKey REFUSED', 'true', String(projectDeclaredOwedFacts({
  declarations: [{ ...baseDecl, factKey: 'FP.MINE' }],
  sources: [{ sourceId: 'OBS-P', text: PROBE_OBS }],
  suppliedGovernedSourceIds: [], stage: 'FIRST_PASS_MODEL',
}).perDeclaration[0].codes.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD')));
check('unsupplied governed id REFUSED', 'true', String(projectDeclaredOwedFacts({
  declarations: [{ ...baseDecl, governedEvidenceSourceIds: ['GOV-NOPE'] }],
  sources: [{ sourceId: 'OBS-P', text: PROBE_OBS }],
  suppliedGovernedSourceIds: ['GOV-1'], stage: 'FIRST_PASS_MODEL',
}).perDeclaration[0].codes.includes('GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET')));
check('supplied governed id ADMITTED', '1', String(projectDeclaredOwedFacts({
  declarations: [{ ...baseDecl, governedEvidenceSourceIds: ['GOV-1'] }],
  sources: [{ sourceId: 'OBS-P', text: PROBE_OBS }],
  suppliedGovernedSourceIds: ['GOV-1'], stage: 'FIRST_PASS_MODEL',
}).facts.length));

// ================================================================ verifier v3.3 boundary

const v33Input = {
  analysisId: 'AN-INT', observation: PROBE_OBS, suppliedOwedFactKeys: ['FP.K.1'],
  suppliedGovernedSourceIds: ['GOV-1'],
  suppliedGovernedEvidence: [{ sourceId: 'GOV-1', text: 'Governing text: 29 CFR 1910.215(a)(4).' }],
};
const verdict = (rb: unknown, over: Record<string, unknown> = {}): Record<string, unknown> => ({
  verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION, analysisId: 'AN-INT',
  verdict: 'NO_CLARIFICATION_REQUIRED', rationale: 'the observation settles it',
  clarificationSourceMode: null, proposedClarification: null, bindingFactKey: null,
  nominatedFact: null,
  owedFactDeclarations: [{ factKey: 'FP.K.1', declaration: 'STILL_UNRESOLVED', challengeReason: null }],
  regulatoryBasis: rb, ...over,
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
  String(checkVerifierV3_3Output(verdict({ reliance: 'NONE', sourceIds: [], proposition: null },
    { rationale: 'the observation does not settle this; 29 CFR 1910.215 applies' }),
  v33Input).codes.includes(UNAUTHORISED_REGULATORY_CITATION as never)));
check('v3.3 refuses an unsupplied sourceId', 'true',
  String(checkVerifierV3_3Output(verdict({
    reliance: 'SUPPLIED_GOVERNED_EVIDENCE', sourceIds: ['GOV-NOPE'], proposition: 'x',
  }), v33Input).codes.includes('SOURCE_ID_NOT_IN_SUPPLIED_SET' as never)));
check('v3.3 admission contract version', 'hazlenz.expert.verifier.v3.3', EXPERT_VERIFIER_CONTRACT_V3_3_VERSION);

// ================================================================ settlement authority

check('the three transition authorities are exactly the frozen set',
  'ADMITTED_BINDING,ADMISSIBLE_EVIDENCE,RECORDED_ARBITRATION', TRANSITION_AUTHORITIES.join(','));
check('no transition authority names a model, provider or explanation', '0',
  String((TRANSITION_AUTHORITIES as readonly string[]).filter(a => /MODEL|PROVIDER|EXPLANATION|RATIONALE/i.test(a)).length));
check('every terminal status requires a named authority', '3', String(Object.keys(REQUIRED_AUTHORITY).length));
check('the projection never calls transition()', 'true',
  String(!/\btransition\s*\(/.test(stripComments(readFileSync(join(LIB, 'expert-first-pass-owed-fact-projection.ts'), 'utf8')))));

// ================================================================ circuit breaker normalization

check('breaker version', 'hazlenz.expert.pre-inference-circuit-breaker.v1', PRE_INFERENCE_CIRCUIT_BREAKER_VERSION);
check('normalization PRESERVES maxItems identity', 'distinct',
  normaliseProviderErrorMessage("For 'array' type, property 'maxItems' is not supported")
    !== normaliseProviderErrorMessage("For 'array' type, property 'minItems' is not supported")
    ? 'distinct' : 'COLLAPSED');
check('normalization removes volatile detail', 'same',
  normaliseProviderErrorMessage('req_aaa failed at 2026-09-07T01:00:00Z: bad')
    === normaliseProviderErrorMessage('req_bbb failed at 2026-09-07T02:00:00Z: bad') ? 'same' : 'DIFFERENT');
check('an inference-reaching attempt yields NO signature', 'null',
  String(preInferenceSignature({
    reachedInference: true, httpStatus: 400, providerErrorType: 'x', providerErrorMessage: 'y',
    stage: 'firstpass', requestContractId: 'c',
  })));
check('two identical pre-inference rejections TRIP the breaker', 'tripped', (() => {
  const rej = { reachedInference: false, httpStatus: 400, providerErrorType: 'invalid_request_error',
    providerErrorMessage: "property 'maxItems' is not supported", stage: 'firstpass', requestContractId: 'c' };
  let s = initialBreakerState();
  s = recordAttempt(s, rej); s = recordAttempt(s, rej);
  return mayIssueNextAttempt(s).allowed ? 'NOT TRIPPED' : 'tripped';
})());
check('two inference-reaching failures do NOT trip it', 'clear', (() => {
  const f = { reachedInference: true, httpStatus: 200, providerErrorType: null,
    providerErrorMessage: null, stage: 'firstpass', requestContractId: 'c' };
  let s = initialBreakerState();
  s = recordAttempt(s, f); s = recordAttempt(s, f);
  return mayIssueNextAttempt(s).allowed ? 'clear' : 'TRIPPED';
})());

// ================================================================ empty-run scorer behaviour

check('empty-run safety version', 'hazlenz.expert.empty-run-safety.v1', EMPTY_RUN_SAFETY_VERSION);
check('an empty denominator is NOT_EXERCISED, never a pass', 'NOT_EXERCISED',
  axisResult(0, 'PASS').split(' ')[0]);
check('hardFailEvaluability returns null on an empty run', 'null',
  String(hardFailEvaluability(0, false).anyTriggered));

// ================================================================ §199 cohort

check('cohort design defects', '0', String(cohortDesignDefects().length));
check('cohort version', 'hazlenz.expert.structured-e2e-cohort.2026-09-07.v2', SECTION_199_COHORT_VERSION);
check('twelve rows', '12', String(COHORT_COVERAGE.rows));
check('OPTION 3 — ten reused rows', '10', String(COHORT_COVERAGE.reusedRows.length));
check('OPTION 3 — two replacement rows', 'SG-01,SG-02', COHORT_COVERAGE.replacedRows.join(','));
check('OPTION 3 — SF-09 and SF-10 are gone', '0',
  String(SECTION_199_COHORT.filter(r => (REPLACED_SECTION_197_ROWS as readonly string[]).includes(r.rowId)).length));
let reusedDrift = 0;
for (const r of SECTION_199_COHORT.filter(x => x.provenance === 'REUSED_BEHAVIORALLY_UNSPENT')) {
  const o = SECTION_197_COHORT.find(x => x.rowId === r.section197Origin);
  if (!o || o.observation !== r.observation
    || JSON.stringify(o.expectedOwedFacts) !== JSON.stringify(r.expectedOwedFacts)) reusedDrift += 1;
}
check('every reused row is byte-identical to its §197 original', '0', String(reusedDrift));
check('two capability-present rows', 'SG-01,SG-02', COHORT_COVERAGE.capabilityPresentRows.join(','));
check('a governed-quotation opportunity exists', '1', String(COHORT_COVERAGE.governedQuotationOpportunityRows.length));
check('an unsupplied-citation containment opportunity exists', '1', String(COHORT_COVERAGE.unsuppliedCitationOpportunityRows.length));
check('no cohort observation carries a citation-shaped string', '0',
  String(SECTION_199_COHORT.filter(r => CITATION_SHAPED_PATTERN.test(r.observation)).length));
const canary = SECTION_199_COHORT.find(r => r.rowId === TRANSPORT_CANARY_ROW_ID);
check('the canary is in the cohort', 'true', String(canary !== undefined));
check('the canary is a NON-GOVERNED row', '0', String(canary?.verifierGovernedEvidence.length ?? -1));
check('the canary is a REUSED row', 'REUSED_BEHAVIORALLY_UNSPENT', String(canary?.provenance));

// ================================================================ evidence preservation

function packageDigest(dir: string): { files: number; digest: string } {
  const names = readdirSync(dir).sort();
  const h = createHash('sha256');
  for (const n of names) h.update(`${n}:${shaFile(join(dir, n))}\n`);
  return { files: names.length, digest: h.digest('hex') };
}
const d196 = packageDigest(E196);
const d197 = packageDigest(E197);
const d198 = packageDigest(E198);
check('§196 evidence file count', '14', String(d196.files));
check('§197 evidence file count', '14', String(d197.files));
check('§196 historical 91/91 output preserved', 'true',
  String(readFileSync(join(E196, 'TEST-OUTPUT.txt'), 'utf8').includes('91/91 PASS')));
check('§196 original K3 line preserved verbatim', 'true',
  String(readFileSync(join(E196, 'TEST-OUTPUT.txt'), 'utf8')
    .includes('transport refuses it, and the boundary refuses it again')));
const R197 = JSON.parse(readFileSync(join(E197, 'RUN-SUMMARY.json'), 'utf8'));
check('§197 terminal unchanged',
  'EXPERT_HAZLENZ_STRUCTURED_PIPELINE_VALIDATION_INCONCLUSIVE — EXECUTION_REVIEW_REQUIRED', R197.TERMINAL);
check('§197 12 attempted / 0 completed / $0.00 / 0 tokens', '12|0|0|0',
  `${R197.PROVIDER_CALLS_ATTEMPTED}|${R197.PROVIDER_CALLS_COMPLETED}|${R197.ACTUAL_PROVIDER_SPEND_USD}|${R197.OUTPUT_TOKENS}`);
check('§197 every axis still NOT_EXERCISED', 'true',
  String(Object.entries(R197.AXIS_RESULTS).filter(([k]) => k !== 'note')
    .every(([, v]) => String(v).startsWith('NOT_EXERCISED'))));
check('§197 hard-fail report still unevaluable', 'false|null',
  `${R197.HARD_FAIL_CONDITIONS.EVALUABLE}|${String(R197.HARD_FAIL_CONDITIONS.anyTriggered)}`);
const R198 = JSON.parse(readFileSync(join(E198, 'RUN-SUMMARY.json'), 'utf8'));
check('§198 terminal unchanged',
  'EXPERT_HAZLENZ_STRUCTURED_PIPELINE_TRANSPORT_REMEDIATED — SUCCESSOR_HOSTED_PROTOCOL_AUTHORIZATION_REQUIRED',
  R198.TERMINAL);
check('§198 provider calls still 0', '0', String(R198.PROVIDER_CALLS));
check('§198 records the §197 file rewrite and restoration', 'true',
  String(String(R198.SECTION_197_PRESERVATION?.oneIncidentDuringSection198 ?? '').includes('byte-identical')));
check('§196 K3 supersession still registered', 'SUPERSEDED_BY_SECTION_198', K3_HISTORICAL_ASSERTION.status);
const R195 = JSON.parse(readFileSync(join(E195, 'RUN-SUMMARY.json'), 'utf8'));
check('§195 EXECUTED still false', 'false', String(R195.EXECUTED));
const human = JSON.parse(readFileSync(join(E189, 'RAW-HUMAN-ANSWERS.json'), 'utf8'));
check('§189 human gate still UNMEASURED', '65 / 112', human.completeness.HUMAN_ADJUDICATION_COMPLETENESS);

// ================================================================ auditability + typecheck

const swScripts = sweepAuditability(join(ROOT, 'backend', 'scripts'));
check('backend/scripts audit sweep clean (no NUL regression)', 'clean',
  swScripts.clean ? 'clean' : swScripts.unauditable.map(u => u.path).join(','));
const swExpert = sweepAuditability(SRC);
check('expert-hazlenz src audit sweep clean', 'clean',
  swExpert.clean ? 'clean' : swExpert.unauditable.map(u => u.path).join(','));

let scopedErrors = 'clean';
try {
  execSync('npx tsc --noEmit -p tsconfig.scripts-199.json',
    { cwd: join(ROOT, 'backend'), encoding: 'utf8', stdio: 'pipe' });
} catch (e) {
  const out = `${String((e as any).stdout ?? '')}${String((e as any).stderr ?? '')}`;
  scopedErrors = out.split('\n').filter(l => l.includes('error TS')).slice(0, 3).join(' | ') || 'errors';
}
check('§196–§199 file set typechecks', 'clean', scopedErrors);

// ================================================================ report

const gitHead = execSync(`git -C ${JSON.stringify(ROOT)} rev-parse HEAD`, { encoding: 'utf8' }).trim();
const gitBranch = execSync(`git -C ${JSON.stringify(ROOT)} rev-parse --abbrev-ref HEAD`, { encoding: 'utf8' }).trim();

const failed = checks.filter(c => !c.ok);
const L: string[] = [];
L.push('§199 PRE-SPEND SOURCE INTEGRITY GATE — SUCCESSOR HOSTED VALIDATION');
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
L.push('PROTOCOL IDENTITIES FOR THIS RUN');
L.push(`  v15 base                     ${sha(EXPERT_SYSTEM_PROMPT)}   UNCHANGED`);
L.push(`  vNext, capability ABSENT     ${sha(buildExpertVNextSystemPrompt(NONE))}`);
L.push(`  vNext, capability PRESENT    ${sha(buildExpertVNextSystemPrompt(ONE))}`);
L.push(`  verifier v3.2 (executed)     ${sha(EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT)}   UNCHANGED`);
L.push(`  admission contract           ${EXPERT_VERIFIER_CONTRACT_V3_3_VERSION}`);
L.push(`  cohort                       ${SECTION_199_COHORT_VERSION}`);
L.push(`  transport canary             ${TRANSPORT_CANARY_ROW_ID} (reused, capability-absent)`);
L.push('');
L.push('EVIDENCE PACKAGE DIGESTS — preservation proven by hashing, not by re-deriving');
L.push(`  §196  ${d196.files} files  ${d196.digest}`);
L.push(`  §197  ${d197.files} files  ${d197.digest}`);
L.push(`  §198  ${d198.files} files  ${d198.digest}`);
L.push('');
L.push('  The §196, §197 and §198 gates were NOT re-run: each writes into its own evidence');
L.push('  directory, and the §197 gate pins a vNext hash §198 deliberately moved. Their still-valid');
L.push('  checks are subsumed above.');
L.push('');
L.push('WORKTREE');
L.push(`  branch ${gitBranch}   HEAD ${gitHead}`);
L.push('');
L.push(failed.length === 0
  ? 'GATE PASSED — the transport canary may be issued under the frozen §199 preregistration.'
  : 'GATE FAILED — PROVIDER CALLS = 0. STOP.');
L.push('');

if (!existsSync(E199)) mkdirSync(E199, { recursive: true });
writeFileSync(join(E199, 'SOURCE-INTEGRITY.txt'), `${L.join('\n')}\n`);
console.log(L.join('\n'));
if (failed.length > 0) process.exit(1);
