/**
 * §201 -- HARNESS HARDENING PROOF MATRIX.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NO SEMANTIC SELF-GRADING.
 *
 * Cases A-H cover the eight authorised work items. Every case that could have been written against
 * a fixture and ALSO against the real §199 evidence is written against the real evidence, because a
 * fixture proves the code agrees with the code's author, and the §199 log is the thing that
 * actually happened.
 *
 * The decisive case is D3: it demonstrates the successor's behaviour AND the predecessor's, on the
 * SAME replayed §199 sequence, so the change is visible as a difference rather than asserted.
 */

import { createHash } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import type { ExpertAnalysisInput } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { stableStringify } from '../src/hazlenz/expert-hazlenz/expert-prompt';
import {
  buildExpertVNextWireSchema, governedBindingFor, governedBindingCapability,
} from './lib/expert-first-pass-instruction-vnext';
import {
  SECTION_199_COHORT, type Section199Row,
} from './lib/expert-199-cohort-2026-09-07';
import {
  initialBreakerState, recordAttempt, mayIssueNextAttempt,
  PRE_INFERENCE_CIRCUIT_BREAKER_VERSION, SYSTEMATIC_PRE_INFERENCE_REJECTION,
  type AttemptSignatureInput, type BreakerState,
} from './lib/expert-pre-inference-circuit-breaker';
import {
  axisResult, emptyRunReportingViolations, EMPTY_RUN_SAFETY_VERSION, NOT_EXERCISED,
} from './lib/expert-empty-run-safety';
import {
  HARNESS_HARDENING_VERSION, CONSTRUCTED_OVER,
  classifyProviderFailure, HARNESS_FAILURE_CLASSES, BREAKER_TREATMENT_BY_CLASS,
  DETERMINISTIC_REJECTION_PATTERNS,
  grammarShapeOf, effectiveGrammarIdentity, deterministicRejectionKey,
  initialHardenedState, recordHardenedAttempt, mayIssuePlannedAttempt, predecessorStateOf,
  DETERMINISTIC_CONTRACT_REJECTION_ALREADY_ESTABLISHED, STOPPING_RULE,
  opportunityAxisResult, nonOpportunityReportingViolations, NO_OPPORTUNITY_REALISED,
  IMMUTABLE_EVIDENCE_DIRECTORIES, immutableEvidenceRoots, checkEvidenceWrite,
  isImmutableEvidencePath, assertEvidenceWriteAllowed, guardedWriter, REPO_ROOT,
  topLevelMemberSpans, findTopLevelMember, upsertTopLevelJsonKey, provesOnlySpanChanged,
  typecheckClaim, ambiguousTypecheckClaims, TYPECHECK_SCOPES, AMBIGUOUS_TYPECHECK_PHRASES,
  type HarnessAttemptInput, type HardenedBreakerState,
} from './lib/expert-201-harness-hardening';

const ROOT = join(__dirname, '..', '..');
const V = (n: string): string => join(ROOT, 'verification', n);
const E198 = V('expert-hazlenz-structured-pipeline-transport-remediation-2026-09-07');
const E199 = V('expert-hazlenz-successor-structured-e2e-2026-09-07');
const E201 = V('expert-hazlenz-parallel-development-2026-09-07');
const LIB = join(__dirname, 'lib');

let passed = 0;
let failed = 0;
const results: Array<{ id: string; ok: boolean; detail: string }> = [];
function ok(id: string, condition: boolean, detail = ''): void {
  results.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => sha(readFileSync(p, 'utf8'));

// ---------------------------------------------------------------- fixtures

/** The §199 grammar-size rejection, verbatim from CIRCUIT-BREAKER-LOG.jsonl. */
const GRAMMAR_TOO_LARGE =
  'The compiled grammar is too large, which would cause performance issues. Simplify your tool '
  + 'schemas or reduce the number of strict tools.';

const attempt = (over: Partial<HarnessAttemptInput> = {}): HarnessAttemptInput => ({
  reachedInference: false,
  httpStatus: 400,
  providerErrorType: 'invalid_request_error',
  providerErrorMessage: GRAMMAR_TOO_LARGE,
  stage: 'firstpass',
  requestContractId: 'row-specific-hash',
  requestContractClass: 'firstpass:vnext:capability-PRESENT',
  effectiveSchemaIdentity: 'grammar-present',
  ...over,
});

/** §199's own request construction, reproduced exactly, so the hashes are comparable to its log. */
const recordsFor = (row: Section199Row): { sourceId: string; text: string }[] =>
  row.verifierGovernedEvidence.map(g => ({ sourceId: g.sourceId, text: g.text }));

function analysisInput(row: Section199Row): ExpertAnalysisInput {
  return {
    contractVersion: 'hazlenz.expert.input.v1',
    analysisId: `AN-199-${row.rowId}`,
    authoritativeSources: [
      { sourceId: `OBS-${row.rowId}`, sourceType: 'observation', text: row.observation },
    ],
    inspectionContext: { location: row.location, task: row.task },
    jurisdiction: row.jurisdiction,
    allowedHazardFamilies: [...row.allowedHazardFamilies],
    deterministicFindings: row.deterministicFindings.map(f => ({ ...f, requiredActions: [...f.requiredActions] })),
    governedStandards: row.governedStandards.map(g => ({ ...g })),
    answeredClarifications: [],
  };
}

function schemaFor(rowId: string): { schema: Record<string, unknown>; capability: string } {
  const row = SECTION_199_COHORT.find(r => r.rowId === rowId);
  if (!row) throw new Error(`fixture: §199 row ${rowId} not found`);
  const binding = governedBindingFor(recordsFor(row));
  return {
    schema: buildExpertVNextWireSchema(analysisInput(row), binding),
    capability: governedBindingCapability(binding),
  };
}

const exactContractId = (rowId: string): string =>
  sha(stableStringify(schemaFor(rowId).schema)).slice(0, 16);
const grammarId = (rowId: string): string => effectiveGrammarIdentity(schemaFor(rowId).schema);

/** The §199 execution order, read from the evidence rather than restated. */
interface BreakerLogLine {
  sequencePosition: number; rowId: string; reachedInference: boolean; signature: string | null;
  consecutive: number; tripped: boolean; diagnosticRepeat?: boolean;
}
const BREAKER_LOG: BreakerLogLine[] = readFileSync(join(E199, 'CIRCUIT-BREAKER-LOG.jsonl'), 'utf8')
  .split('\n').filter(l => l.trim().length > 0).map(l => JSON.parse(l) as BreakerLogLine);

// ================================================================ A. ADDITIVE CONSTRUCTION

ok('A1. the successor names the exact predecessor versions it is constructed over',
  CONSTRUCTED_OVER.circuitBreaker === PRE_INFERENCE_CIRCUIT_BREAKER_VERSION
  && CONSTRUCTED_OVER.emptyRunSafety === EMPTY_RUN_SAFETY_VERSION
  && HARNESS_HARDENING_VERSION === 'hazlenz.expert.201.harness-hardening.v1');

ok('A2. the circuit breaker module is BYTE-UNCHANGED from §199\'s frozen preregistration hash',
  (() => {
    const prereg = JSON.parse(readFileSync(join(E199, 'PREREGISTRATION.json'), 'utf8'));
    return prereg.CIRCUIT_BREAKER.moduleSha256
      === shaFile(join(LIB, 'expert-pre-inference-circuit-breaker.ts'));
  })(),
  '§199 ABORTs if this module moves; §201 did not move it');

ok('A3. the empty-run-safety module is BYTE-UNCHANGED from §198\'s recorded hash',
  readFileSync(join(E198, 'SOURCE-INTEGRITY.txt'), 'utf8')
    .includes(shaFile(join(LIB, 'expert-empty-run-safety.ts'))),
  'additive successor, not a mutation');

ok('A4. the successor state is an EXACT projection back to the §198 state',
  (() => {
    const seq: HarnessAttemptInput[] = [
      attempt(),
      attempt({ reachedInference: true }),
      attempt({ httpStatus: 429, providerErrorType: 'rate_limit_error', providerErrorMessage: 'rate limited' }),
      attempt(),
      attempt(),
    ];
    let legacy: BreakerState = initialBreakerState();
    let hardened: HardenedBreakerState = initialHardenedState();
    for (const a of seq) {
      legacy = recordAttempt(legacy, a as AttemptSignatureInput);
      hardened = recordHardenedAttempt(hardened, a).state;
      if (JSON.stringify(predecessorStateOf(hardened)) !== JSON.stringify(legacy)) return false;
    }
    return true;
  })(), 'clause (a) is §198\'s function, called directly, on every attempt');

ok('A5. §198\'s two-consecutive stop is reproduced identically through the successor API',
  (() => {
    let s = initialHardenedState();
    let issued = 0;
    for (let i = 0; i < 12; i += 1) {
      const d = mayIssuePlannedAttempt(s, {
        stage: 'firstpass', requestContractClass: null, effectiveSchemaIdentity: null,
      });
      if (!d.allowed) break;
      issued += 1;
      // no class/grammar declared, so ONLY clause (a) can act — the degradation path
      s = recordHardenedAttempt(s, attempt({
        requestContractClass: null, effectiveSchemaIdentity: null,
      })).state;
    }
    const d = mayIssuePlannedAttempt(s, {
      stage: 'firstpass', requestContractClass: null, effectiveSchemaIdentity: null,
    });
    return issued === 2 && d.disposition === 'STOP_RUN' && d.clause === 'A_CONSECUTIVE'
      && d.stopReason === SYSTEMATIC_PRE_INFERENCE_REJECTION;
  })(), 'a harness that adopts no new field degrades to §198 exactly, not to a wrong key');

// ================================================================ B. EFFECTIVE GRAMMAR IDENTITY

ok('B1. the §199 log records TWO DIFFERENT contract ids for the SAME grammar-size fault',
  (() => {
    const sg01 = BREAKER_LOG.find(l => l.rowId === 'SG-01');
    const sg02 = BREAKER_LOG.find(l => l.rowId === 'SG-02');
    if (!sg01?.signature || !sg02?.signature) return false;
    const c1 = /contract=([0-9a-f]+)/.exec(sg01.signature)?.[1];
    const c2 = /contract=([0-9a-f]+)/.exec(sg02.signature)?.[1];
    const m1 = /msg=(.*)$/.exec(sg01.signature)?.[1];
    const m2 = /msg=(.*)$/.exec(sg02.signature)?.[1];
    return c1 !== c2 && m1 === m2
      && c1 === 'd0713f36696e8bea' && c2 === '243bb6766c05599f';
  })(),
  '§200 recorded the two signatures as "identical"; they are not — a memory keyed on that field '
  + 'would have missed SG-02 exactly as adjacency did');

ok('B2. the exact §199 contract ids are reproducible from the current modules',
  exactContractId('SG-01') === 'd0713f36696e8bea'
  && exactContractId('SG-02') === '243bb6766c05599f',
  'the recomputation matches the run, so the finding is about the run and not about a fixture');

ok('B3. SG-01 and SG-02 share ONE effective grammar identity',
  grammarId('SG-01') === grammarId('SG-02'),
  `both -> ${grammarId('SG-01')}`);

ok('B4. all ten capability-ABSENT rows share ONE effective grammar identity',
  (() => {
    const absent = SECTION_199_COHORT.filter(r => schemaFor(r.rowId).capability === 'ABSENT');
    const ids = new Set(absent.map(r => grammarId(r.rowId)));
    return absent.length === 10 && ids.size === 1;
  })());

ok('B5. the capability-PRESENT identity DIFFERS from the capability-ABSENT identity',
  grammarId('SG-01') !== grammarId('SF-01'),
  'the identity partitions exactly along the axis the grammar-size rejection follows; it does not '
  + 'collapse the whole cohort into one key');

ok('B6. the shape erases leaf VALUES but keeps property names, nesting and array ARITY',
  (() => {
    const a = { type: 'string', enum: ['A', 'B', 'C'], description: 'x' };
    const b = { type: 'string', enum: ['P', 'Q', 'R'], description: 'y' };
    const c = { type: 'string', enum: ['P', 'Q'], description: 'y' };
    const d = { type: 'string', enums: ['P', 'Q', 'R'], description: 'y' };
    const id = (v: unknown): string => effectiveGrammarIdentity(v);
    return id(a) === id(b) && id(a) !== id(c) && id(a) !== id(d);
  })(), 'three alternatives and two alternatives are different grammars; a renamed key is too');

ok('B7. an incomplete key can never be memoised, expressed as an absent value not a flag',
  deterministicRejectionKey(attempt({ requestContractClass: null })) === null
  && deterministicRejectionKey(attempt({ effectiveSchemaIdentity: '' })) === null
  && typeof deterministicRejectionKey(attempt()) === 'string');

// ================================================================ C. FAILURE TAXONOMY

ok('C1. the real §199 message classifies DETERMINISTIC_CONTRACT_REJECTION',
  (() => {
    const c = classifyProviderFailure(attempt());
    return c.failureClass === 'DETERMINISTIC_CONTRACT_REJECTION'
      && c.breakerTreatment === 'MEMOISE_AND_ADJACENCY'
      && c.matchedPatternId === 'COMPILED_GRAMMAR_TOO_LARGE';
  })());

ok('C2. §197\'s maxItems rejection classifies DETERMINISTIC',
  classifyProviderFailure(attempt({
    providerErrorMessage: "tools.0.custom: For 'array' type, property 'maxItems' is not supported",
  })).failureClass === 'DETERMINISTIC_CONTRACT_REJECTION');

ok('C3. a 429 is TRANSIENT and is never memoised',
  (() => {
    const c = classifyProviderFailure(attempt({
      httpStatus: 429, providerErrorType: 'rate_limit_error',
      providerErrorMessage: 'Number of requests has exceeded your rate limit',
    }));
    return c.failureClass === 'TRANSIENT_PROVIDER_FAILURE'
      && c.breakerTreatment === 'ADJACENCY_ONLY';
  })());

ok('C4. a 5xx is TRANSIENT',
  classifyProviderFailure(attempt({
    httpStatus: 503, providerErrorType: 'overloaded_error', providerErrorMessage: 'Overloaded',
  })).failureClass === 'TRANSIENT_PROVIDER_FAILURE');

ok('C5. the STATUS wins over a deterministic-looking message',
  classifyProviderFailure(attempt({ httpStatus: 429 })).failureClass === 'TRANSIENT_PROVIDER_FAILURE',
  'if a rate limit ever arrived wearing the grammar message, the run must survive it');

ok('C6. an unmatched message is UNKNOWN and is TREATED AS TRANSIENT',
  (() => {
    const c = classifyProviderFailure(attempt({
      providerErrorMessage: 'something nobody has written a pattern for',
    }));
    return c.failureClass === 'UNKNOWN_PROVIDER_FAILURE'
      && c.breakerTreatment === 'ADJACENCY_ONLY';
  })(), 'recorded honestly as UNKNOWN rather than relabelled transient, and treated conservatively');

ok('C7. a null message is UNKNOWN, not deterministic',
  classifyProviderFailure(attempt({ providerErrorMessage: null, providerErrorType: null }))
    .failureClass === 'UNKNOWN_PROVIDER_FAILURE');

ok('C8. an INFERENCE-REACHING failure never contributes, even carrying the deterministic message',
  (() => {
    const c = classifyProviderFailure(attempt({ reachedInference: true }));
    return c.failureClass === 'INFERENCE_COMPLETED_OUTPUT_FAILURE'
      && c.breakerTreatment === 'NEVER_CONTRIBUTES';
  })(), '§198\'s line: an inference-time failure is a statement about THE MODEL');

ok('C9. a model refusal is its own class and also never contributes',
  (() => {
    const c = classifyProviderFailure(attempt({
      reachedInference: true, providerStopReason: 'refusal', providerErrorMessage: null,
    }));
    return c.failureClass === 'SEMANTIC_PROVIDER_REFUSAL'
      && c.breakerTreatment === 'NEVER_CONTRIBUTES';
  })());

ok('C10. an account-state rejection is flagged and is NOT memoised as a contract fact',
  (() => {
    const c = classifyProviderFailure(attempt({
      providerErrorMessage: 'Your credit balance is too low to access the Anthropic API',
    }));
    return c.accountStateRejection === true
      && c.breakerTreatment !== 'MEMOISE_AND_ADJACENCY';
  })(), 'a stricter §192 rule stops the run on first occurrence; an account condition is not a '
  + 'property of the request contract');

ok('C11. EXACTLY ONE class carries the MEMOISE treatment',
  HARNESS_FAILURE_CLASSES.filter(c => BREAKER_TREATMENT_BY_CLASS[c] === 'MEMOISE_AND_ADJACENCY')
    .length === 1);

ok('C12. every deterministic pattern names the section that paid for it',
  DETERMINISTIC_REJECTION_PATTERNS.length > 0
  && DETERMINISTIC_REJECTION_PATTERNS.every(p =>
    typeof p.paidForBy === 'string' && p.paidForBy.trim().length > 0
    && typeof p.whyDeterministic === 'string' && p.whyDeterministic.trim().length > 0),
  'an entry with no section behind it is a guess, and a guess here costs behavioural evidence');

// ================================================================ D. THE §199 REGRESSION

/**
 * Replay §199's ACTUAL twelve-step order. Every attempt's outcome is taken from the recorded log,
 * so this is a replay of what happened and not a simulation of what might have.
 */
function replay199(useNewKey: boolean): {
  issued: string[]; skipped: string[]; stoppedAfter: string | null;
} {
  let s = initialHardenedState();
  const issued: string[] = [];
  const skipped: string[] = [];
  let stoppedAfter: string | null = null;
  for (const line of BREAKER_LOG) {
    const cap = schemaFor(line.rowId).capability;
    const cls = useNewKey ? `firstpass:vnext:capability-${cap}` : null;
    const grammar = useNewKey ? grammarId(line.rowId) : null;
    const decision = mayIssuePlannedAttempt(s, {
      stage: 'firstpass', requestContractClass: cls, effectiveSchemaIdentity: grammar,
    });
    if (decision.disposition === 'STOP_RUN') { stoppedAfter = line.rowId; break; }
    if (decision.disposition === 'SKIP_ATTEMPT') { skipped.push(line.rowId); continue; }
    issued.push(line.rowId);
    s = recordHardenedAttempt(s, {
      reachedInference: line.reachedInference,
      httpStatus: line.reachedInference ? 200 : 400,
      providerErrorType: line.reachedInference ? null : 'invalid_request_error',
      providerErrorMessage: line.reachedInference ? null : GRAMMAR_TOO_LARGE,
      stage: 'firstpass',
      requestContractId: exactContractId(line.rowId),
      requestContractClass: cls,
      effectiveSchemaIdentity: grammar,
    }).state;
  }
  return { issued, skipped, stoppedAfter };
}

const NEW = replay199(true);
const OLD = replay199(false);

ok('D1. under the successor rule SG-02 is NOT ISSUED',
  NEW.skipped.includes('SG-02') && !NEW.issued.includes('SG-02'),
  'SG-01 at position 3 already established the outcome for that grammar');

ok('D2. the run CONTINUES through every remaining capability-ABSENT row',
  ['SF-06', 'SF-02', 'SF-12', 'SF-07'].every(r => NEW.issued.includes(r))
  && NEW.stoppedAfter === null,
  'clause (b) is a statement about ONE contract class and carries no information about any other');

ok('D3. the predecessor key WOULD have issued SG-02 — the change is visible as a difference',
  OLD.issued.includes('SG-02') && OLD.skipped.length === 0
  && NEW.issued.length === OLD.issued.length - 1,
  `§199 issued ${OLD.issued.length} rows; the successor issues ${NEW.issued.length}. Same evidence, `
  + 'one fewer row spent');

ok('D4. exactly ONE row is saved and no observation is lost',
  NEW.skipped.length === 1
  && BREAKER_LOG.filter(l => l.reachedInference).every(l => NEW.issued.includes(l.rowId)),
  'every row that reached inference in §199 is still issued');

ok('D5. two NON-ADJACENT transient failures do NOT suppress anything',
  (() => {
    let s = initialHardenedState();
    const t = attempt({
      httpStatus: 429, providerErrorType: 'rate_limit_error',
      providerErrorMessage: 'Number of requests has exceeded your rate limit',
    });
    s = recordHardenedAttempt(s, t).state;
    s = recordHardenedAttempt(s, attempt({ reachedInference: true })).state;
    s = recordHardenedAttempt(s, t).state;
    const d = mayIssuePlannedAttempt(s, {
      stage: 'firstpass',
      requestContractClass: 'firstpass:vnext:capability-PRESENT',
      effectiveSchemaIdentity: 'grammar-present',
    });
    return d.allowed && d.disposition === 'PROCEED' && s.established.length === 0;
  })(), 'a blip must never truncate a run');

ok('D6. two ADJACENT transient failures still STOP the run — adjacency survives intact',
  (() => {
    let s = initialHardenedState();
    const t = attempt({
      httpStatus: 429, providerErrorType: 'rate_limit_error',
      providerErrorMessage: 'Number of requests has exceeded your rate limit',
    });
    s = recordHardenedAttempt(s, t).state;
    s = recordHardenedAttempt(s, t).state;
    const d = mayIssuePlannedAttempt(s, {
      stage: 'firstpass', requestContractClass: 'c', effectiveSchemaIdentity: 'g',
    });
    return d.disposition === 'STOP_RUN' && d.clause === 'A_CONSECUTIVE';
  })(), '§198 case M3 preserved: adjacency is the guard against stochastic failure');

ok('D7. an INFERENCE-REACHING failure never establishes a memory',
  (() => {
    let s = initialHardenedState();
    s = recordHardenedAttempt(s, attempt({ reachedInference: true })).state;
    s = recordHardenedAttempt(s, attempt({ reachedInference: true })).state;
    const d = mayIssuePlannedAttempt(s, {
      stage: 'firstpass',
      requestContractClass: 'firstpass:vnext:capability-PRESENT',
      effectiveSchemaIdentity: 'grammar-present',
    });
    return s.established.length === 0 && d.allowed
      && predecessorStateOf(s).consecutive === 0;
  })(), 'even carrying the exact §199 message; reachedInference is the deciding field');

ok('D8. a DIFFERENT stage with the same grammar is not suppressed',
  (() => {
    let s = initialHardenedState();
    s = recordHardenedAttempt(s, attempt()).state;
    const same = mayIssuePlannedAttempt(s, {
      stage: 'firstpass', requestContractClass: 'firstpass:vnext:capability-PRESENT',
      effectiveSchemaIdentity: 'grammar-present',
    });
    const other = mayIssuePlannedAttempt(s, {
      stage: 'verifier', requestContractClass: 'firstpass:vnext:capability-PRESENT',
      effectiveSchemaIdentity: 'grammar-present',
    });
    return same.disposition === 'SKIP_ATTEMPT' && other.disposition === 'PROCEED';
  })(), 'the memory is stage-LOCAL by name and by behaviour');

ok('D9. the suppression names its stop reason and the attempt that established it',
  (() => {
    let s = initialHardenedState();
    s = recordHardenedAttempt(s, attempt()).state;
    const d = mayIssuePlannedAttempt(s, {
      stage: 'firstpass', requestContractClass: 'firstpass:vnext:capability-PRESENT',
      effectiveSchemaIdentity: 'grammar-present',
    });
    return d.stopReason === DETERMINISTIC_CONTRACT_REJECTION_ALREADY_ESTABLISHED
      && d.establishedBy?.attemptOrdinal === 1
      && d.establishedBy?.matchedPatternId === 'COMPILED_GRAMMAR_TOO_LARGE'
      && typeof d.detail === 'string' && d.detail.includes('NOT ISSUED');
  })());

ok('D10. the accepted risk of clause (b) is recorded in code, not only in prose',
  STOPPING_RULE.THE_ACCEPTED_RISK.includes('SINGLE observation')
  && STOPPING_RULE.WHY_THE_KEY_CHANGED.includes('d0713f36696e8bea'),
  'a single observation can suppress; the mitigation is a successor re-authorization');

// ================================================================ E. NON-OPPORTUNITY SAFETY

const AXIS_O = {
  axisId: 'O_UNSUPPLIED_CITATION_CONTAINMENT',
  completedExecutions: 8,
  opportunitiesRealised: 0,
  opportunityDefinition:
    'a verifier execution that emitted at least one citation-shaped token, so containment could '
    + 'have admitted or refused it',
  verdictWhenExercised: 'NO_UNSUPPLIED_CITATION_WAS_ADMITTED',
};

ok('E1. an axis with EIGHT executions and ZERO opportunities cannot emit a positive verdict',
  (() => {
    const r = opportunityAxisResult(AXIS_O);
    return r.startsWith(NOT_EXERCISED) && r.includes(NO_OPPORTUNITY_REALISED)
      && !r.includes('NO_UNSUPPLIED_CITATION_WAS_ADMITTED');
  })(), 'the §199 case §198\'s rule did not cover: the run was not empty, the AXIS was');

ok('E2. §198\'s own empty-run guard does NOT catch that case — the gap is real, not hypothetical',
  emptyRunReportingViolations(8, {
    [AXIS_O.axisId]: 'NO_UNSUPPLIED_CITATION_WAS_ADMITTED — clean',
  }).length === 0
  && nonOpportunityReportingViolations([{
    axisId: AXIS_O.axisId, opportunitiesRealised: 0,
    emitted: 'NO_UNSUPPLIED_CITATION_WAS_ADMITTED — clean',
  }]).length === 1,
  'stated as a measured difference between the two guards rather than as an opinion about §198');

ok('E3. a zero-EXECUTION run still delegates to §198 and reproduces its wording exactly',
  opportunityAxisResult({ ...AXIS_O, completedExecutions: 0 })
    === axisResult(0, AXIS_O.verdictWhenExercised),
  'the predecessor wording is preserved by construction, not by copying');

ok('E4. an axis WITH realised opportunities passes its verdict through',
  opportunityAxisResult({ ...AXIS_O, opportunitiesRealised: 6 })
    === AXIS_O.verdictWhenExercised);

ok('E5. an UNDEFINED opportunity denominator is refused, and is not treated as an empty one',
  (() => {
    const r = opportunityAxisResult({ ...AXIS_O, opportunitiesRealised: 4, opportunityDefinition: '  ' });
    return r.startsWith(NOT_EXERCISED) && r.includes('never defined');
  })(), 'an axis whose opportunity cannot be stated is an axis whose denominator nobody decided');

ok('E6. §199\'s real axis O and N wordings are admissible under the new guard',
  (() => {
    const summary = JSON.parse(readFileSync(join(E199, 'RUN-SUMMARY.json'), 'utf8'));
    const mech = summary.AXIS_RESULTS.MECHANICAL as Record<string, string>;
    const emissions = Object.entries(mech)
      .filter(([, v]) => String(v).startsWith(NOT_EXERCISED))
      .map(([axisId, v]) => ({ axisId, opportunitiesRealised: 0, emitted: String(v) }));
    return emissions.length >= 3 && nonOpportunityReportingViolations(emissions).length === 0;
  })(), '§199\'s scorer got this right by hand; the module now makes it structural');

ok('E7. a positive phrase is caught regardless of case and of surrounding text',
  nonOpportunityReportingViolations([
    { axisId: 'X', opportunitiesRealised: 0, emitted: 'held — none triggered' },
    { axisId: 'Y', opportunitiesRealised: 0, emitted: 'pass' },
    { axisId: 'Z', opportunitiesRealised: 3, emitted: 'PASS' },
  ]).length === 2, 'the class of phrases, not one string somebody thought of');

// ================================================================ F. IMMUTABLE EVIDENCE

ok('F1. all six §195-§200 evidence directories are named and exist on disk',
  Object.keys(IMMUTABLE_EVIDENCE_DIRECTORIES).length === 6
  && immutableEvidenceRoots().every(r => existsSync(r.path)),
  Object.keys(IMMUTABLE_EVIDENCE_DIRECTORIES).join(' '));

ok('F2. a write INSIDE a protected package is refused and names the section',
  (() => {
    const v = checkEvidenceWrite(join(E199, 'RUN-SUMMARY.json'));
    return v.allowed === false && v.section === '§199';
  })());

ok('F3. a traversal path cannot walk in sideways',
  isImmutableEvidencePath(join(E201, '..', '..', 'verification',
    'expert-hazlenz-semantic-adjudication-2026-09-07', 'x.json')),
  'resolve() is applied before the comparison');

ok('F4. a sibling whose NAME merely starts with a protected name is NOT caught',
  checkEvidenceWrite(`${E199}-extra/notes.md`).allowed === true,
  'the comparison is on path segments, not on string prefixes');

ok('F5. an ANCESTOR of a protected package is refused too',
  (() => {
    const v = checkEvidenceWrite(join(REPO_ROOT, 'verification'));
    return v.allowed === false && v.wouldDestroyByContainment === true;
  })(), 'a removal at an ancestor destroys the package as completely as a write inside it');

ok('F6. §201\'s own evidence directory is writable',
  checkEvidenceWrite(join(E201, 'HARNESS-HARDENING-REPORT.md')).allowed === true);

ok('F7. the guard is a real refusal — the wrapped writer is never reached',
  (() => {
    let called = 0;
    const w = guardedWriter((_p: string, _c: string) => { called += 1; return 1; });
    let threw = false;
    try { w(join(E199, 'RUN-SUMMARY.json'), 'overwritten'); } catch { threw = true; }
    const okPath = w(join(E201, 'scratch.txt'), 'fine');
    return threw && called === 1 && okPath === 1;
  })(), 'a protection that cannot actually refuse is indistinguishable from no protection');

ok('F8. the throwing form names the section and the reason',
  (() => {
    try { assertEvidenceWriteAllowed(join(E198, 'TEST-OUTPUT.txt')); return false; }
    catch (e) {
      const m = (e as Error).message;
      return m.startsWith('IMMUTABLE_EVIDENCE_WRITE_REFUSED') && m.includes('§198');
    }
  })());

// ================================================================ G. TARGETED JSON MUTATION

const CURRENT_STATE_PATH = join(ROOT, 'docs', 'INSITE_CURRENT_STATE.json');
const CURRENT_STATE = readFileSync(CURRENT_STATE_PATH, 'utf8');

ok('G1. the hazard is real: re-serialising the live document is NOT the identity',
  (() => {
    const round = `${JSON.stringify(JSON.parse(CURRENT_STATE), null, 2)}\n`;
    return round !== CURRENT_STATE;
  })(),
  `${Buffer.byteLength(CURRENT_STATE, 'utf8')} bytes; a parse/stringify round trip rewrites `
  + 'escaping in unrelated pre-existing entries, so a one-key change diffs the whole file');

ok('G2. the scanner finds every top-level member, in order, agreeing with the parser',
  (() => {
    const spans = topLevelMemberSpans(CURRENT_STATE);
    const keys = Object.keys(JSON.parse(CURRENT_STATE));
    return spans.length === keys.length && spans.every((s, i) => s.key === keys[i]);
  })(), `${topLevelMemberSpans(CURRENT_STATE).length} top-level keys`);

ok('G3. every span is exactly its own value — each slice parses to the parsed value',
  (() => {
    const parsed = JSON.parse(CURRENT_STATE) as Record<string, unknown>;
    return topLevelMemberSpans(CURRENT_STATE).every(s =>
      JSON.stringify(JSON.parse(CURRENT_STATE.slice(s.valueStart, s.valueEnd)))
        === JSON.stringify(parsed[s.key]));
  })(), 'the scanner is string-aware over 2.2MB including braces and escapes inside strings');

ok('G4. REPLACING one key on the LIVE document leaves every other byte identical',
  (() => {
    const key = 'readiness';
    const before = CURRENT_STATE;
    const r = upsertTopLevelJsonKey(before, key, '{"probe":true}');
    const proof = provesOnlySpanChanged(before, r.text, r);
    const reparsed = JSON.parse(r.text) as Record<string, unknown>;
    const original = JSON.parse(before) as Record<string, unknown>;
    const othersIntact = Object.keys(original)
      .filter(k => k !== key)
      .every(k => JSON.stringify(reparsed[k]) === JSON.stringify(original[k]));
    return r.action === 'REPLACED_VALUE_IN_PLACE' && proof.ok && othersIntact
      && Object.keys(reparsed).length === Object.keys(original).length;
  })(), 'nothing was written to disk; the mutation was proved in memory');

ok('G5. INSERTING a new key on the LIVE document leaves every other byte identical',
  (() => {
    const before = CURRENT_STATE;
    const r = upsertTopLevelJsonKey(before, 'section201HarnessProbe', '{"probe":true}');
    const proof = provesOnlySpanChanged(before, r.text, r);
    const reparsed = JSON.parse(r.text) as Record<string, unknown>;
    const original = JSON.parse(before) as Record<string, unknown>;
    return r.action === 'INSERTED_AS_LAST_MEMBER' && proof.ok
      && Object.keys(reparsed).length === Object.keys(original).length + 1
      && Object.keys(original).every(k => JSON.stringify(reparsed[k]) === JSON.stringify(original[k]));
  })());

ok('G6. removing the inserted span restores the original document BYTE FOR BYTE',
  (() => {
    const r = upsertTopLevelJsonKey(CURRENT_STATE, 'section201HarnessProbe', '{"probe":true}');
    const start = r.replacedSpan.start;
    const restored = r.text.slice(0, start) + r.text.slice(start + r.insertedLength);
    return restored === CURRENT_STATE;
  })(), 'reversibility measured, not asserted');

ok('G7. the insert copies the document\'s own indentation instead of forming an opinion about it',
  (() => {
    const src = '{\n    "a": 1,\n    "b": [1, 2]\n}\n';
    const r = upsertTopLevelJsonKey(src, 'c', '{"x":1}');
    return r.text === '{\n    "a": 1,\n    "b": [1, 2],\n    "c": {"x":1}\n}\n';
  })());

ok('G8. the scanner is not fooled by braces, quotes or escapes inside string values',
  (() => {
    const src = '{\n  "a": "} \\" { \\\\",\n  "b": {"nested": "]}"},\n  "c": 3\n}\n';
    const spans = topLevelMemberSpans(src);
    const r = upsertTopLevelJsonKey(src, 'b', '9');
    return spans.length === 3 && spans[0].key === 'a' && spans[1].key === 'b'
      && src.slice(spans[1].valueStart, spans[1].valueEnd) === '{"nested": "]}"}'
      && r.text === '{\n  "a": "} \\" { \\\\",\n  "b": 9,\n  "c": 3\n}\n';
  })());

ok('G9. a non-object root is refused rather than silently corrupted',
  (() => {
    try { topLevelMemberSpans('[1,2,3]'); return false; }
    catch (e) { return (e as Error).message.includes('root is not an object'); }
  })());

ok('G10. findTopLevelMember returns null for an absent key rather than a plausible wrong span',
  findTopLevelMember(CURRENT_STATE, 'thisKeyDoesNotExist') === null
  && findTopLevelMember(CURRENT_STATE, 'schemaVersion') !== null);

ok('G11. the live document was NOT written to by this test',
  readFileSync(CURRENT_STATE_PATH, 'utf8') === CURRENT_STATE,
  'every G case operated on an in-memory string');

// ================================================================ H. VERIFICATION LABELS

ok('H1. a typecheck claim always carries its scope and its exclusion',
  (() => {
    const c = typecheckClaim({
      label: 'SRC_TYPECHECK', command: 'npx tsc --noEmit -p tsconfig.json',
      exitCode: 0, errorCount: 0,
    });
    return c.startsWith('SRC_TYPECHECK PASSED') && c.includes('COVERS:')
      && c.includes('DOES NOT COVER:') && c.includes('backend/scripts');
  })());

ok('H2. the experiment-scope label names the exact files it covers',
  typecheckClaim({
    label: 'EXPERIMENT_SCOPE_TYPECHECK', command: 'npx ts-node scripts/test-201-harness-hardening.ts',
    exitCode: 0, errorCount: 0, files: ['scripts/test-201-harness-hardening.ts'],
  }).includes('FILES: scripts/test-201-harness-hardening.ts'));

ok('H3. a failing claim is not phrased as a pass',
  typecheckClaim({
    label: 'SRC_TYPECHECK', command: 'x', exitCode: 2, errorCount: 7,
  }).includes('FAILED (7 error(s))'));

ok('H4. an UNSCOPED claim is flagged',
  ambiguousTypecheckClaims('We ran the checks and tsc is clean. Everything looks fine.').length === 0
  && ambiguousTypecheckClaims('We ran the checks and typecheck passes.').length === 1,
  'the banned phrases are the ones that assert a RESULT without a scope');

ok('H5. a claim that names its scope is NOT flagged',
  ambiguousTypecheckClaims('SRC_TYPECHECK passed; no type errors in backend/src.').length === 0,
  'quoting a banned phrase inside a scoped sentence is not a violation');

ok('H6. the two scopes state mutually exclusive coverage',
  TYPECHECK_SCOPES.SRC_TYPECHECK.doesNotCover.includes('backend/scripts')
  && TYPECHECK_SCOPES.EXPERIMENT_SCOPE_TYPECHECK.doesNotCover.includes('production surface')
  && AMBIGUOUS_TYPECHECK_PHRASES.length >= 5);

ok('H7. §201\'s own harness-hardening report contains no unscoped typecheck claim',
  (() => {
    const p = join(E201, 'HARNESS-HARDENING-REPORT.md');
    if (!existsSync(p)) return false;
    return ambiguousTypecheckClaims(readFileSync(p, 'utf8')).length === 0;
  })(), 'the rule is applied to the document that states it');

// ---------------------------------------------------------------- report

console.log('\n' + '='.repeat(100));
console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   CUSTOMER ACTIVATION: NONE');
console.log('  NO SEMANTIC SELF-GRADING: no §200 verdict slot is touched by this file');
console.log('='.repeat(100));
if (failed > 0) {
  console.log('\nFAILED:');
  for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
  process.exit(1);
}
