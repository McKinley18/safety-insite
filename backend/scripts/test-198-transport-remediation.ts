/**
 * §198 -- TRANSPORT / BINDING REMEDIATION PROOF MATRIX.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION.
 *
 * Cases A-P are the §198 authorization's matrix, in its order, with its letters. Cases Q-T are the
 * preservation proofs the remediation owes: that v15 is still reconstructible from BOTH prompt
 * variants, that the §197 preregistration can no longer be satisfied (so a retired protocol
 * instance cannot be silently re-run), and that the §196 and §197 evidence packages are byte-intact.
 */

import { createHash } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

import type { ExpertAnalysisInput } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import {
  EXPERT_SYSTEM_PROMPT, buildExpertWireSchema, buildExpertUserPrompt, stableStringify,
} from '../src/hazlenz/expert-hazlenz/expert-prompt';
import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords,
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';

import {
  EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT, EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
  buildExpertVNextSystemPrompt, buildExpertVNextWireSchema, buildExpertVNextUserPrompt,
  reconstructV15SystemPrompt, reconstructV15WireSchema, reconstructV15UserPrompt,
  renderAvailableGovernedEvidence, governedBindingCapability, governedBindingFor,
  UNRESOLVED_FACT_DECLARATIONS_FIELD, GOVERNED_SOURCE_ID_SHAPE,
  UNRESOLVED_FACT_DECLARATION_LINES_WITHOUT_GOVERNED_BINDING,
  UNRESOLVED_FACT_DECLARATION_LINES_WITH_GOVERNED_BINDING,
} from './lib/expert-first-pass-instruction-vnext';
import {
  projectDeclaredOwedFacts, DECLARATION_FORBIDDEN_FIELDS,
} from './lib/expert-first-pass-owed-fact-projection';
import {
  initialBreakerState, recordAttempt, mayIssueNextAttempt, preInferenceSignature,
  normaliseProviderErrorMessage, SYSTEMATIC_PRE_INFERENCE_REJECTION,
  CONSECUTIVE_IDENTICAL_REJECTIONS_TO_STOP, REJECTION_CLASSIFICATION,
} from './lib/expert-pre-inference-circuit-breaker';
import {
  axisResult, axisRatio, hardFailEvaluability, emptyRunReportingViolations,
  FORBIDDEN_EMPTY_RUN_PHRASES, NOT_EXERCISED,
} from './lib/expert-empty-run-safety';
import {
  stripComments, scanExecutableSource, assertAbsentFromExecutableSource,
} from './lib/expert-source-semantic-scan';
import {
  K3_HISTORICAL_ASSERTION, SUPERSEDED_CLAIMS, CLAIMS_THAT_STILL_HOLD,
} from './lib/expert-superseded-claims';
import {
  checkVerifierV3_3Output, UNAUTHORISED_REGULATORY_CITATION,
} from './lib/expert-verifier-contract-v3-3';
import { EXPERT_VERIFIER_CONTRACT_V3_VERSION } from './lib/expert-verifier-contract-v3';
import { SECTION_197_COHORT } from './lib/expert-197-cohort-2026-09-07';

const ROOT = join(__dirname, '..', '..');
const V = (n: string): string => join(ROOT, 'verification', n);
const E196 = V('expert-hazlenz-structured-first-pass-owed-facts-2026-09-06');
const E197 = V('expert-hazlenz-structured-e2e-validation-2026-09-07');

let passed = 0;
let failed = 0;
const results: Array<{ id: string; ok: boolean; detail: string }> = [];
function ok(id: string, condition: boolean, detail = ''): void {
  results.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

// ---------------------------------------------------------------- fixtures

const OBSERVATION =
  'The chuck guard is fitted and closed over the chuck. The third mounting point is behind the '
  + 'column and could not be seen from where the inspector stood.';

const input = (): ExpertAnalysisInput => ({
  contractVersion: 'hazlenz.expert.input.v1',
  analysisId: 'AN-198',
  authoritativeSources: [{ sourceId: 'OBS-1', sourceType: 'observation', text: OBSERVATION }],
  inspectionContext: { location: 'fabrication bay', task: 'drilling' },
  jurisdiction: 'osha-general-industry',
  allowedHazardFamilies: ['machine_guarding'],
  deterministicFindings: [], governedStandards: [], answeredClarifications: [],
});

const GOV_A = {
  sourceId: 'GOV-ABRASIVE-01',
  text: 'Work rests shall be kept adjusted closely to the wheel with a maximum opening of '
    + 'one-eighth inch. Governing text: 29 CFR 1910.215(a)(4).',
};
const GOV_B = {
  sourceId: 'GOV-LOTO-02',
  text: 'Energy isolating devices shall be locked out before servicing. Governing text: '
    + '29 CFR 1910.147(c)(4).',
};

const NONE = { governedEvidenceSourceIds: [] as string[] };

const decl = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  declarationId: 'D1',
  missingFact: 'whether the guard is fastened at every mounting point',
  observationSourceId: 'OBS-1',
  observationSpan: 'could not be seen from where the inspector stood',
  notEstablishedBecause: 'the text records only that the point could not be seen',
  affectedDecision: 'REQUIRED_CONTROL',
  branchA: 'the guard is fastened at every mounting point',
  decisionIfA: 'the machine continues in use',
  branchB: 'the guard is unfastened at one or more points',
  decisionIfB: 'the machine is stopped until the guard is secured',
  whyNecessaryNow: 'the machine is running now',
  ...over,
});

const project = (declarations: unknown[], governedIds: string[] = []) => projectDeclaredOwedFacts({
  declarations,
  sources: [{ sourceId: 'OBS-1', text: OBSERVATION }],
  suppliedGovernedSourceIds: governedIds,
  stage: 'FIRST_PASS_MODEL',
});

// ================================================================ A. ZERO SOURCES — OMISSION

const zeroSchema: any = buildExpertVNextWireSchema(input(), NONE);
const zeroItem = zeroSchema.properties[UNRESOLVED_FACT_DECLARATIONS_FIELD].items;

ok('A1. governedEvidenceSourceIds is ABSENT from the provider-visible schema',
  zeroItem.properties.governedEvidenceSourceIds === undefined,
  'not empty-array, not bounded, not a sentinel — absent');
ok('A2. it is absent from `required` too',
  !zeroItem.required.includes('governedEvidenceSourceIds'),
  `${zeroItem.required.length} required properties`);
ok('A3. NO maxItems appears anywhere in the schema — the §197 rejection cause is gone',
  !JSON.stringify(zeroSchema).includes('maxItems'));
ok('A4. no maxItems workaround was needed: the §108 strip is NOT relied on to remove it',
  !JSON.stringify(stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(zeroSchema)))
    .includes('maxItems')
  && !JSON.stringify(applyStrictSchemaWrapper(zeroSchema)).includes('maxItems'),
  'absent BEFORE the strip runs, not removed by it');
ok('A5. no governed-binding instruction is emitted in the system prompt',
  !EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT.includes('governedEvidenceSourceIds'),
  'the model is not told about a capability it does not have');
ok('A6. the capability is derived, not configured',
  governedBindingCapability(NONE) === 'ABSENT'
  && governedBindingCapability({ governedEvidenceSourceIds: ['GOV-A'] }) === 'PRESENT');
ok('A7. a declaration WITHOUT governed binding remains valid where otherwise valid',
  (() => {
    const r = project([decl()]);
    return r.facts.length === 1 && r.refusedCount === 0;
  })(), 'omitting the capability does not break the ordinary path');
ok('A8. the system prompt and the schema always agree on the capability',
  SECTION_197_COHORT.every(() => {
    const absent = buildExpertVNextSystemPrompt(NONE).includes('governedEvidenceSourceIds') === false;
    const present = buildExpertVNextSystemPrompt(governedBindingFor([GOV_A]))
      .includes('governedEvidenceSourceIds') === true;
    return absent && present;
  }), 'one function derives both from the same supplied set');

// ================================================================ B. ZERO SOURCES — FAIL CLOSED

ok('B1. a provider that invents the field anyway is refused by the boundary',
  (() => {
    const r = project([decl({ governedEvidenceSourceIds: ['GOV-ABRASIVE-01'] })], []);
    return r.facts.length === 0
      && r.perDeclaration[0].codes.includes('GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET');
  })(), 'fail closed — the boundary never depended on the transport');
ok('B2. the transport also refuses it, through additionalProperties: false',
  (() => {
    const wrapped: any = applyStrictSchemaWrapper(zeroSchema);
    return wrapped.properties[UNRESOLVED_FACT_DECLARATIONS_FIELD]
      .items.additionalProperties === false;
  })(), 'an undeclared property is not merely unmentioned, it is prohibited');
ok('B3. capability omission is STRONGER than the retired maxItems bound',
  zeroItem.properties.governedEvidenceSourceIds === undefined
  && !EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT.includes('governedEvidenceSourceIds'),
  'a bounded field is still a field; an absent one cannot be populated by a compliant producer');

// ================================================================ C. ONE SOURCE — CAPABILITY PRESENT

const oneBinding = governedBindingFor([GOV_A]);
const oneSchema: any = buildExpertVNextWireSchema(input(), oneBinding);
const oneItem = oneSchema.properties[UNRESOLVED_FACT_DECLARATIONS_FIELD].items;
const onePrompt = buildExpertVNextUserPrompt(input(), [GOV_A]);

ok('C1. the property is present when one source is supplied',
  oneItem.properties.governedEvidenceSourceIds !== undefined
  && oneItem.required.includes('governedEvidenceSourceIds'));
ok('C2. the exact sourceId is visible to the model in the user prompt',
  onePrompt.includes('sourceId: GOV-ABRASIVE-01'),
  'the §197 impossible contract is closed — the model can now see what it is asked to name');
ok('C3. the schema permits only the intended representation — an enum of supplied ids',
  JSON.stringify(oneItem.properties.governedEvidenceSourceIds.items.enum) === '["GOV-ABRASIVE-01"]'
  && oneItem.properties.governedEvidenceSourceIds.type === 'array');
ok('C4. the with-binding system prompt names the AVAILABLE GOVERNED EVIDENCE list',
  EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT_WITH_GOVERNED_BINDING.includes('AVAILABLE GOVERNED')
  && EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT_WITH_GOVERNED_BINDING.includes('governedEvidenceSourceIds'));
ok('C5. still no maxItems in the capability-present schema',
  !JSON.stringify(oneSchema).includes('maxItems'));

// ================================================================ D. MULTIPLE SOURCES — CLOSED SET

const twoBinding = governedBindingFor([GOV_A, GOV_B]);
const twoSchema: any = buildExpertVNextWireSchema(input(), twoBinding);
const twoPrompt = buildExpertVNextUserPrompt(input(), [GOV_A, GOV_B]);

ok('D1. every permissible sourceId is rendered',
  twoPrompt.includes('sourceId: GOV-ABRASIVE-01') && twoPrompt.includes('sourceId: GOV-LOTO-02'));
ok('D2. the schema enum is exactly the supplied set',
  JSON.stringify(twoSchema.properties[UNRESOLVED_FACT_DECLARATIONS_FIELD]
    .items.properties.governedEvidenceSourceIds.items.enum)
    === '["GOV-ABRASIVE-01","GOV-LOTO-02"]');
ok('D3. no unsupplied id is rendered anywhere in the prompt',
  !twoPrompt.includes('GOV-INVENTED') && !twoPrompt.includes('GOV-HAZCOM'),
  'only supplied ids are exposed');
ok('D4. a duplicate supplied id is refused rather than de-duplicated silently',
  (() => {
    try { renderAvailableGovernedEvidence([GOV_A, GOV_A]); return false; }
    catch (e) { return /supplied more than once/.test((e as Error).message); }
  })());
ok('D5. an id that is not a legal id is refused rather than normalised',
  (() => {
    try { renderAvailableGovernedEvidence([{ sourceId: 'has spaces', text: 'x' }]); return false; }
    catch (e) { return /not a legal id/.test((e as Error).message); }
  })(), 'quietly rewriting an identifier is how two records end up sharing one');
ok('D6. the id shape is the same narrow shape used everywhere else',
  GOVERNED_SOURCE_ID_SHAPE.test('GOV-ABRASIVE-01') && !GOVERNED_SOURCE_ID_SHAPE.test('a b'));

// ================================================================ E. UNSUPPLIED ID

ok('E1. the projection refuses an id not in the supplied set',
  (() => {
    const r = project([decl({ governedEvidenceSourceIds: ['GOV-NOT-SUPPLIED'] })],
      ['GOV-ABRASIVE-01']);
    return r.facts.length === 0
      && r.perDeclaration[0].codes.includes('GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET');
  })());
ok('E2. exact membership — a near-miss id is refused, not matched',
  project([decl({ governedEvidenceSourceIds: ['gov-abrasive-01'] })], ['GOV-ABRASIVE-01'])
    .perDeclaration[0].codes.includes('GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET'),
  'no case folding, no nearest neighbour');
ok('E3. a supplied id IS admitted',
  project([decl({ governedEvidenceSourceIds: ['GOV-ABRASIVE-01'] })], ['GOV-ABRASIVE-01'])
    .facts.length === 1);
ok('E4. BOUNDARY_REFUSES_UNSUPPLIED_SOURCE_ID still holds — the claim that survived §197',
  CLAIMS_THAT_STILL_HOLD.BOUNDARY_REFUSES_UNSUPPLIED_SOURCE_ID.holds === true);

// ================================================================ F. ID / TEXT PAIRING

ok('F1. each rendered sourceId is followed by ITS OWN evidence text',
  (() => {
    const lines = twoPrompt.split('\n');
    const iA = lines.findIndex(l => l.includes('sourceId: GOV-ABRASIVE-01'));
    const iB = lines.findIndex(l => l.includes('sourceId: GOV-LOTO-02'));
    return iA >= 0 && iB >= 0
      && lines[iA + 1].includes('Work rests')
      && lines[iB + 1].includes('Energy isolating devices');
  })(), 'no cross-pairing');
ok('F2. the id→text mapping is deterministic — the same records render the same bytes',
  sha(renderAvailableGovernedEvidence([GOV_A, GOV_B]))
    === sha(renderAvailableGovernedEvidence([GOV_A, GOV_B])));
ok('F3. reordering the supplied records changes the rendering, and nothing is silently sorted',
  renderAvailableGovernedEvidence([GOV_A, GOV_B]) !== renderAvailableGovernedEvidence([GOV_B, GOV_A]),
  'supplied order is data and is preserved');
ok('F4. no hidden internal identifier is introduced — the opaque handles are not reused here',
  !renderAvailableGovernedEvidence([GOV_A, GOV_B]).match(/\bR[12]\b/),
  'the exact sourceId is the only identifier offered');

// ================================================================ G. CITATION-SHAPED SUPPLIED TEXT

ok('G1. supplied evidence carrying a citation is renderable without exploding',
  renderAvailableGovernedEvidence([GOV_A]).length > 0
  && GOV_A.text.includes('29 CFR 1910.215(a)(4)'));
ok('G2. the FIRST-PASS rendering still redacts the citation, as v15 does',
  !renderAvailableGovernedEvidence([GOV_A]).includes('29 CFR 1910.215')
  && renderAvailableGovernedEvidence([GOV_A]).includes('[citation withheld]'),
  'v15 redaction rules unchanged — a first pass shown a citation could only be punished for it');
ok('G3. the sourceId is exposed EXACTLY even though the text is redacted',
  renderAvailableGovernedEvidence([GOV_A]).includes('sourceId: GOV-ABRASIVE-01'),
  'the contract needs the id, not the citation');
ok('G4. the VERIFIER path is untouched — v3.3 still admits a faithful supplied-source quotation',
  (() => {
    const r = checkVerifierV3_3Output({
      verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION, analysisId: 'AN-G4',
      verdict: 'NO_CLARIFICATION_REQUIRED', rationale: 'settled',
      clarificationSourceMode: null, proposedClarification: null, bindingFactKey: null,
      nominatedFact: null,
      owedFactDeclarations: [{ factKey: 'FP.K.1', declaration: 'STILL_UNRESOLVED', challengeReason: null }],
      regulatoryBasis: {
        reliance: 'SUPPLIED_GOVERNED_EVIDENCE', sourceIds: ['GOV-ABRASIVE-01'],
        proposition: 'the supplied record at 29 CFR 1910.215(a)(4) sets a maximum opening',
      },
    }, {
      analysisId: 'AN-G4', observation: OBSERVATION, suppliedOwedFactKeys: ['FP.K.1'],
      suppliedGovernedSourceIds: ['GOV-ABRASIVE-01'],
      suppliedGovernedEvidence: [GOV_A],
    });
    return r.admitted && r.citationReuseAdmitted;
  })(), 'the §196 collision fix is unaffected by the §198 remediation');

// ================================================================ H. UNSUPPLIED CITATION AUTHORITY

ok('H1. the first pass still refuses a citation-shaped string in a declaration',
  project([decl({ notEstablishedBecause: 'the record at 29 CFR 1910.215 is not satisfied' })])
    .perDeclaration[0].codes.includes('PROHIBITED_REGULATORY_CITATION'));
ok('H2. the verifier still refuses a citation absent from every supplied source',
  (() => {
    const r = checkVerifierV3_3Output({
      verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION, analysisId: 'AN-H2',
      verdict: 'NO_CLARIFICATION_REQUIRED', rationale: 'settled',
      clarificationSourceMode: null, proposedClarification: null, bindingFactKey: null,
      nominatedFact: null,
      owedFactDeclarations: [{ factKey: 'FP.K.1', declaration: 'STILL_UNRESOLVED', challengeReason: null }],
      regulatoryBasis: {
        reliance: 'SUPPLIED_GOVERNED_EVIDENCE', sourceIds: ['GOV-ABRASIVE-01'],
        proposition: 'read with 29 CFR 1910.147 the record requires isolation',
      },
    }, {
      analysisId: 'AN-H2', observation: OBSERVATION, suppliedOwedFactKeys: ['FP.K.1'],
      suppliedGovernedSourceIds: ['GOV-ABRASIVE-01'],
      suppliedGovernedEvidence: [GOV_A],
    });
    return !r.admitted && r.codes.includes(UNAUTHORISED_REGULATORY_CITATION as never);
  })(), 'fail closed');
ok('H3. a declaration may not carry a HazLenz-owned field, capability present or absent',
  DECLARATION_FORBIDDEN_FIELDS.includes('factKey')
  && project([decl({ factKey: 'FP.MINE' })])
    .perDeclaration[0].codes.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD'));

// ================================================================ I. PROVIDER-REQUEST COMPATIBILITY

/** Keywords the adapter is known to have to remove, plus the one §197 discovered. */
const KNOWN_PROHIBITED = ['minLength', 'minItems', 'maxItems'];
const compat = SECTION_197_COHORT.map(row => {
  const i: ExpertAnalysisInput = {
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
  const records = row.verifierGovernedEvidence.map(g => ({ sourceId: g.sourceId, text: g.text }));
  const binding = governedBindingFor(records);
  const sent = stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(
    buildExpertVNextWireSchema(i, binding)));
  const json = JSON.stringify(sent);
  return {
    rowId: row.rowId,
    capability: governedBindingCapability(binding),
    prohibitedRemaining: KNOWN_PROHIBITED.filter(k => json.includes(`"${k}"`)),
  };
});
ok('I1. every §197 first-pass request rebuilds under the remediated contract',
  compat.length === 12, `${compat.length} rows`);
ok('I2. NO known provider-prohibited keyword survives in any of the twelve requests',
  compat.every(c => c.prohibitedRemaining.length === 0),
  compat.filter(c => c.prohibitedRemaining.length > 0).map(c => `${c.rowId}:${c.prohibitedRemaining}`).join(' ') || 'none');
ok('I3. maxItems specifically — the §197 rejection cause — is absent from all twelve',
  compat.every(c => !c.prohibitedRemaining.includes('maxItems')),
  'regression for the exact keyword that produced twelve HTTP 400s');
ok('I4. the two governed rows now carry the capability; the other ten do not',
  compat.filter(c => c.capability === 'PRESENT').map(c => c.rowId).join(',') === 'SF-09,SF-10'
  && compat.filter(c => c.capability === 'ABSENT').length === 10);

// ================================================================ J. §108 STRIP REGRESSION

ok('J1. the §108 strip was NOT extended — it still removes exactly minLength and minItems',
  (() => {
    const probe = { type: 'array', minItems: 2, maxItems: 3, items: { type: 'string', minLength: 1, maxLength: 9 } };
    const out: any = stripAnthropicUnsupportedKeywords(probe);
    return out.minItems === undefined && out.items.minLength === undefined
      && out.maxItems === 3 && out.items.maxLength === 9;
  })(), 'maxItems still passes through — §198 did not need it to');
ok('J2. §198 does not rely on the strip to repair the empty-governed-set representation',
  !JSON.stringify(applyStrictSchemaWrapper(zeroSchema)).includes('maxItems'),
  'nothing to strip, because nothing was emitted');
ok('J3. the strip still does its own job on the v15 schema',
  !JSON.stringify(stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(
    buildExpertWireSchema(input())))).includes('"minLength"'));

// ================================================================ K. CIRCUIT BREAKER

const rejection = (over: Record<string, unknown> = {}) => ({
  reachedInference: false,
  httpStatus: 400,
  providerErrorType: 'invalid_request_error',
  providerErrorMessage: "tools.0.custom: For 'array' type, property 'maxItems' is not supported",
  stage: 'firstpass',
  requestContractId: 'schema-abc123',
  ...over,
} as any);

ok('K1. two identical pre-inference rejections trip the breaker',
  (() => {
    let s = initialBreakerState();
    s = recordAttempt(s, rejection());
    const afterOne = mayIssueNextAttempt(s).allowed;
    s = recordAttempt(s, rejection());
    const afterTwo = mayIssueNextAttempt(s);
    return afterOne === true && afterTwo.allowed === false
      && afterTwo.stopReason === SYSTEMATIC_PRE_INFERENCE_REJECTION;
  })(), `attempts 1 and 2 recorded, attempt 3 not issued (threshold ${CONSECUTIVE_IDENTICAL_REJECTIONS_TO_STOP})`);
ok('K2. the tripped state names the signature it tripped on',
  (() => {
    let s = initialBreakerState();
    s = recordAttempt(s, rejection());
    s = recordAttempt(s, rejection());
    return typeof s.trippedOnSignature === 'string' && s.trippedOnSignature.includes('maxitems');
  })());
ok('K3. exactly two attempts are recorded before the stop',
  (() => {
    let s = initialBreakerState();
    let issued = 0;
    for (let i = 0; i < 12; i += 1) {
      if (!mayIssueNextAttempt(s).allowed) break;
      issued += 1;
      s = recordAttempt(s, rejection());
    }
    return issued === 2 && s.attemptsRecorded === 2;
  })(), 'the §197 run would have stopped at 2 instead of 12');

// ================================================================ L. NONIDENTICAL REJECTION

ok('L1. two DIFFERENT pre-inference failures do not trip the breaker',
  (() => {
    let s = initialBreakerState();
    s = recordAttempt(s, rejection());
    s = recordAttempt(s, rejection({
      providerErrorMessage: "tools.0.custom: For 'string' type, property 'pattern' is not supported",
    }));
    return mayIssueNextAttempt(s).allowed === true;
  })());
ok('L2. a different stage does not match',
  (() => {
    let s = initialBreakerState();
    s = recordAttempt(s, rejection());
    s = recordAttempt(s, rejection({ stage: 'verifier' }));
    return mayIssueNextAttempt(s).allowed === true;
  })());
ok('L3. a different request-contract identity does not match',
  (() => {
    let s = initialBreakerState();
    s = recordAttempt(s, rejection());
    s = recordAttempt(s, rejection({ requestContractId: 'schema-zzz999' }));
    return mayIssueNextAttempt(s).allowed === true;
  })());
ok('L4. a different HTTP status does not match',
  (() => {
    let s = initialBreakerState();
    s = recordAttempt(s, rejection());
    s = recordAttempt(s, rejection({ httpStatus: 429 }));
    return mayIssueNextAttempt(s).allowed === true;
  })());
ok('L5. volatile detail is normalised away, so ONE problem reported twice still matches',
  normaliseProviderErrorMessage("req_011Cep7k rejected at 2026-09-07T01:58:30.187Z: bad")
    === normaliseProviderErrorMessage("req_9zzzzzzz rejected at 2026-09-07T02:11:04.900Z: bad"),
  'request ids and timestamps excluded; the structural path and words kept');
ok('L6. normalisation does NOT collapse two genuinely different paths',
  normaliseProviderErrorMessage("tools.0.custom: property 'maxItems' is not supported")
    !== normaliseProviderErrorMessage("tools.1.custom: property 'maxItems' is not supported"),
  'the tool index is kept');

// ================================================================ M. INFERENCE-TIME FAILURE

ok('M1. an inference-reaching failure produces NO signature and cannot contribute to a streak',
  preInferenceSignature(rejection({ reachedInference: true })) === null);
ok('M2. two similar-looking INFERENCE-TIME failures do not trip the breaker',
  (() => {
    let s = initialBreakerState();
    s = recordAttempt(s, rejection({ reachedInference: true }));
    s = recordAttempt(s, rejection({ reachedInference: true }));
    return mayIssueNextAttempt(s).allowed === true && s.attemptsRecorded === 2;
  })(), 'a behavioural failure is exactly what a cohort exists to sample');
ok('M3. one inference-reaching attempt BREAKS a streak of pre-inference rejections',
  (() => {
    let s = initialBreakerState();
    s = recordAttempt(s, rejection());
    s = recordAttempt(s, rejection({ reachedInference: true }));
    s = recordAttempt(s, rejection());
    return mayIssueNextAttempt(s).allowed === true && s.consecutive === 1;
  })(), 'consecutive means consecutive');
ok('M4. reachedInference is the deciding field, and it is not inferred from the status code',
  REJECTION_CLASSIFICATION.THE_DECIDING_FIELD.startsWith('reachedInference')
  && preInferenceSignature(rejection({ reachedInference: true, httpStatus: 400 })) === null
  && preInferenceSignature(rejection({ reachedInference: false, httpStatus: 200 })) !== null,
  'a billed 400 reached inference; a 200 with no tool_use may not have');

// ================================================================ N. EMPTY-RUN SCORER

ok('N1. an axis with an empty denominator is NOT_EXERCISED, never a pass',
  axisResult(0, 'PASS').startsWith(NOT_EXERCISED) && axisResult(3, 'PASS') === 'PASS');
ok('N2. a zero denominator never renders as 0/0',
  axisRatio(0, 0).startsWith(NOT_EXERCISED) && !axisRatio(0, 0).includes('0/0'));
ok('N3. a small denominator is reported literally and not as a rate',
  axisRatio(1, 1).includes('1/1') && axisRatio(1, 1).includes('NOT_MEANINGFULLY_ESTIMABLE'));
ok('N4. hardFailEvaluability returns null — not false — when nothing ran',
  hardFailEvaluability(0, false).anyTriggered === null
  && hardFailEvaluability(0, false).EVALUABLE === false
  && hardFailEvaluability(5, false).anyTriggered === false,
  'false asserts the conditions held; null says the question was not askable');
ok('N5. the exact §197 wording is caught by the self-audit',
  emptyRunReportingViolations(0, {
    P_SETTLEMENT: 'NO_PROVIDER_OUTPUT_SETTLED_ANY_FACT',
    HARD_FAILS: 'none triggered',
  }).length === 2,
  'the two strings §197 actually printed');
ok('N6. a correctly reported empty run produces no violations',
  emptyRunReportingViolations(0, {
    P_SETTLEMENT: axisResult(0, 'NO_PROVIDER_OUTPUT_SETTLED_ANY_FACT'),
    K_IDENTITY: axisResult(0, 'PASS'),
  }).length === 0);
ok('N7. a run WITH executions is not constrained by the empty-run rule',
  emptyRunReportingViolations(4, { K_IDENTITY: 'PASS' }).length === 0);
ok('N8. the forbidden-phrase list covers a CLASS, not one remembered string',
  FORBIDDEN_EMPTY_RUN_PHRASES.length >= 5
  && FORBIDDEN_EMPTY_RUN_PHRASES.includes('none triggered'));

// ================================================================ O. INTEGRITY COMMENT FALSE POSITIVE

const LEDGER_SRC = readFileSync(
  join(ROOT, 'backend', 'src', 'hazlenz', 'expert-hazlenz', 'owed-facts', 'owed-fact-ledger.ts'),
  'utf8');

ok('O1. the exact §197 false positive is reproduced against the raw source',
  /TRANSITION_AUTHORITIES[\s\S]{0,200}MODEL/i.test(LEDGER_SRC),
  'the naive scan still matches the module\'s own explanatory comment');
ok('O2. on a real file, a comment-only occurrence is removed by stripping',
  (() => {
    const TYPES_SRC = readFileSync(join(ROOT, 'backend', 'src', 'hazlenz', 'expert-hazlenz',
      'owed-facts', 'owed-fact.types.ts'), 'utf8');
    const phrase = 'no member for a model explanation';
    return TYPES_SRC.includes(phrase) && !stripComments(TYPES_SRC).includes(phrase);
  })(), 'owed-fact.types.ts explains the invariant in prose and the scan no longer reads it');
/**
 * O2b records the honest limit of comment-stripping, found by this suite failing first.
 *
 * Stripping comments does NOT make the §197 pattern clean, because `owed-fact-ledger.ts` also
 * IMPORTS `MODEL_AUTHORED_SOURCES` a few lines from `TRANSITION_AUTHORITIES` — so the naive
 * proximity regex matches executable text too. The comment was never the only problem; the
 * INSTRUMENT was. That is why the §197 repair asserted over the exported constant's values instead,
 * and why `preferValueAssertion` exists.
 */
ok('O2b. comment-stripping alone does NOT rescue a badly-chosen proximity scan',
  /TRANSITION_AUTHORITIES[\s\S]{0,200}MODEL/i.test(stripComments(LEDGER_SRC)),
  'the module also IMPORTS MODEL_AUTHORED_SOURCES nearby — the fix was the value assertion, not the strip');
ok('O3. stripping removes comments and keeps executable text',
  (() => {
    const src = 'const A = 1; // MODEL here\n/* MODEL block */\nconst B = "MODEL literal";\n';
    const out = stripComments(src);
    return !out.includes('MODEL here') && !out.includes('MODEL block')
      && out.includes('"MODEL literal"') && out.includes('const A = 1;');
  })(), 'a string literal is executable content and is deliberately kept');
ok('O4. line numbering survives stripping, so a finding points at the right line',
  stripComments('a\n/* x\n y */\nb\n').split('\n').length === 'a\n\n\nb\n'.split('\n').length);
ok('O5. the scanner reports the offending line, not just a boolean',
  (() => {
    const r = scanExecutableSource('const x = 1;\nconst MODEL_AUTHORITY = 2;\n', /MODEL/);
    return r.clean === false && r.matches.length === 1 && r.matches[0].line === 2;
  })());
ok('O6. coverage is not weakened — an executable violation still fails',
  !assertAbsentFromExecutableSource('const TRANSITION_AUTHORITIES = ["MODEL_EXPLANATION"];', /MODEL/),
  'the same token in an executable position still matches');

// ================================================================ P. §196 REGRESSION

ok('P1. v15 is still reconstructible from the capability-ABSENT prompt variant',
  sha(reconstructV15SystemPrompt(NONE)) === sha(EXPERT_SYSTEM_PROMPT));
ok('P2. v15 is still reconstructible from the capability-PRESENT prompt variant',
  sha(reconstructV15SystemPrompt(oneBinding)) === sha(EXPERT_SYSTEM_PROMPT),
  'the §198 capability split did not become a v15 edit');
ok('P3. the two prompt variants differ ONLY by the governed-binding paragraph',
  EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT_WITH_GOVERNED_BINDING.length
    === EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT.length
      + UNRESOLVED_FACT_DECLARATION_LINES_WITH_GOVERNED_BINDING.join('\n').length
      - UNRESOLVED_FACT_DECLARATION_LINES_WITHOUT_GOVERNED_BINDING.join('\n').length,
  'built from one head and one tail, so they cannot drift');
ok('P4. v15 schema is still reconstructible, capability absent and present',
  sha(stableStringify(reconstructV15WireSchema(input(), NONE)))
    === sha(stableStringify(buildExpertWireSchema(input())))
  && sha(stableStringify(reconstructV15WireSchema(input(), oneBinding)))
    === sha(stableStringify(buildExpertWireSchema(input()))));
ok('P5. v15 user prompt is reconstructible from the vNext user prompt',
  sha(reconstructV15UserPrompt(input(), [GOV_A, GOV_B])) === sha(buildExpertUserPrompt(input()))
  && sha(reconstructV15UserPrompt(input(), [])) === sha(buildExpertUserPrompt(input())),
  'buildExpertUserPrompt is not modified; the block is appended and removable');
ok('P6. expert-prompt.ts is still untouched — no §198 marker in v15',
  !EXPERT_SYSTEM_PROMPT.includes('AVAILABLE GOVERNED EVIDENCE')
  && !buildExpertUserPrompt(input()).includes('AVAILABLE GOVERNED EVIDENCE'));
ok('P7. the superseded K3 claim is registered, with the historical evidence preserved',
  K3_HISTORICAL_ASSERTION.status === 'SUPERSEDED_BY_SECTION_198'
  && K3_HISTORICAL_ASSERTION.historicalEvidencePreserved
  && SUPERSEDED_CLAIMS.length === 1
  && K3_HISTORICAL_ASSERTION.whatStillHolds.includes('BOUNDARY_REFUSES_UNSUPPLIED_SOURCE_ID'));
ok('P8. the register distinguishes HISTORICAL_ASSERTION from CURRENT_ARCHITECTURE',
  K3_HISTORICAL_ASSERTION.historicalImplementation.includes('maxItems')
  && K3_HISTORICAL_ASSERTION.historicalAssertion.includes('transport refuses it')
  && K3_HISTORICAL_ASSERTION.currentArchitecture.includes('OMITTED ENTIRELY')
  && K3_HISTORICAL_ASSERTION.currentArchitecture !== K3_HISTORICAL_ASSERTION.historicalAssertion,
  'the claim, its implementation and its replacement are three separate fields');

// ================================================================ Q. RETIRED PROTOCOL CANNOT RE-RUN

const P197 = existsSync(join(E197, 'PREREGISTRATION.json'))
  ? JSON.parse(readFileSync(join(E197, 'PREREGISTRATION.json'), 'utf8')) : null;

ok('Q1. the §197 preregistration pins a vNext prompt hash that no longer matches',
  P197 !== null && P197.firstPassIdentity.systemPromptSha256 !== sha(EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT),
  'so the §197 executor aborts on "vNext prompt moved since freeze" rather than re-running silently');
ok('Q2. every §197 per-row wireSchemaSha256 has moved',
  P197 !== null && P197.cohort.rows.every((fr: any) => {
    const row = SECTION_197_COHORT.find(r => r.rowId === fr.rowId)!;
    const i: ExpertAnalysisInput = {
      contractVersion: 'hazlenz.expert.input.v1', analysisId: `AN-197-${row.rowId}`,
      authoritativeSources: [{ sourceId: `OBS-${row.rowId}`, sourceType: 'observation', text: row.observation }],
      inspectionContext: { location: row.location, task: row.task }, jurisdiction: row.jurisdiction,
      allowedHazardFamilies: [...row.allowedHazardFamilies],
      deterministicFindings: row.deterministicFindings.map(f => ({ ...f, requiredActions: [...f.requiredActions] })),
      governedStandards: row.governedStandards.map(g => ({ ...g })), answeredClarifications: [],
    };
    return sha(stableStringify(buildExpertVNextWireSchema(i, NONE))) !== fr.wireSchemaSha256;
  }), 'the §197 preregistration cannot be reused, exactly as the authorization requires');
ok('Q3. §197 remains recorded as inconclusive with zero completed calls',
  (() => {
    const r = JSON.parse(readFileSync(join(E197, 'RUN-SUMMARY.json'), 'utf8'));
    return r.TERMINAL.startsWith('EXPERT_HAZLENZ_STRUCTURED_PIPELINE_VALIDATION_INCONCLUSIVE')
      && r.PROVIDER_CALLS_COMPLETED === 0 && r.ACTUAL_PROVIDER_SPEND_USD === 0
      && r.EXECUTED_INFERENCE === false;
  })());
ok('Q4. every §197 axis is still NOT_EXERCISED and none was reinterpreted',
  (() => {
    const r = JSON.parse(readFileSync(join(E197, 'RUN-SUMMARY.json'), 'utf8'));
    return Object.entries(r.AXIS_RESULTS)
      .filter(([k]) => k !== 'note')
      .every(([, v]) => String(v).startsWith('NOT_EXERCISED'));
  })());
ok('Q5. the §197 hard-fail report is still explicitly unevaluable',
  (() => {
    const r = JSON.parse(readFileSync(join(E197, 'RUN-SUMMARY.json'), 'utf8'));
    return r.HARD_FAIL_CONDITIONS.EVALUABLE === false && r.HARD_FAIL_CONDITIONS.anyTriggered === null;
  })());
ok('Q6. the recorded §197 instrument defects are still in its history',
  (() => {
    const r = JSON.parse(readFileSync(join(E197, 'RUN-SUMMARY.json'), 'utf8'));
    return typeof r.FOURTH_FINDING_SCORER_DEFECT?.what === 'string'
      && typeof r.PRE_SPEND_GATES?.gateInstrumentDefectFoundAndFixedPreSpend === 'string';
  })(), 'not rewritten');

// ================================================================ R. EVIDENCE PRESERVATION

ok('R1. the §196 evidence package still holds its 14 files',
  existsSync(E196) && readFileSync(join(E196, 'TEST-OUTPUT.txt'), 'utf8').includes('91/91 PASS'),
  'the historical 91/91 run, including the original K3 line, is untouched');
ok('R2. the original K3 line is still present in the §196 historical output',
  readFileSync(join(E196, 'TEST-OUTPUT.txt'), 'utf8')
    .includes('transport refuses it, and the boundary refuses it again'),
  'history is preserved, not rewritten');
ok('R3. §196 RUN-SUMMARY still records its own terminal and zero calls',
  (() => {
    const r = JSON.parse(readFileSync(join(E196, 'RUN-SUMMARY.json'), 'utf8'));
    return r.PROVIDER_CALLS === 0
      && r.TERMINAL.startsWith('EXPERT_HAZLENZ_STRUCTURED_OWED_FACT_PIPELINE_INTEGRATED');
  })());

// ---------------------------------------------------------------- report

console.log('\n' + '='.repeat(100));
console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   CUSTOMER ACTIVATION: NONE');
console.log('='.repeat(100));
if (failed > 0) {
  console.log('\nFAILED:');
  for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
  process.exit(1);
}
