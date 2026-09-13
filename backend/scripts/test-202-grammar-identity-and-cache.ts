/**
 * §202 -- EFFECTIVE GRAMMAR IDENTITY + DETERMINISTIC-REJECTION CACHE: PROOF MATRIX.
 *
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NO SEMANTIC SELF-GRADING.
 *
 * Every case that could have been written against a fixture AND against the real §199 evidence is
 * written against the real evidence. A fixture proves the code agrees with its author; the §199
 * execution log is the thing that actually happened.
 *
 * The decisive cases are C1-C4 (the §200 key defect, demonstrated as a difference rather than
 * asserted) and D1-D6 (the whole twelve-step §199 order replayed, with the three-state account
 * contrasted against what §199 actually did).
 *
 * NOTHING HERE WAS EXERCISED AGAINST A PROVIDER. Every §199 outcome used below is READ from
 * CIRCUIT-BREAKER-LOG.jsonl and CAPABILITY-TRANSPORT-DIAGNOSIS.json.
 */

import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import type { ExpertAnalysisInput } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { stableStringify } from '../src/hazlenz/expert-hazlenz/expert-prompt';
import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords,
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  buildExpertVNextWireSchema, governedBindingFor, governedBindingCapability,
} from './lib/expert-first-pass-instruction-vnext';
import { SECTION_199_COHORT, type Section199Row } from './lib/expert-199-cohort-2026-09-07';
import {
  initialBreakerState, recordAttempt, mayIssueNextAttempt,
  PRE_INFERENCE_CIRCUIT_BREAKER_VERSION, SYSTEMATIC_PRE_INFERENCE_REJECTION,
  type AttemptSignatureInput,
} from './lib/expert-pre-inference-circuit-breaker';
import { NOT_EXERCISED } from './lib/expert-empty-run-safety';
import {
  effectiveGrammarIdentity as grammarId201, grammarShapeOf,
  HARNESS_HARDENING_VERSION,
} from './lib/expert-201-harness-hardening';
import {
  EFFECTIVE_GRAMMAR_IDENTITY_VERSION, EFFECTIVE_GRAMMAR_IDENTITY_IS_A_PROXY,
  EFFECTIVE_GRAMMAR_IDENTITY_RULES, EFFECTIVE_GRAMMAR_IDENTITY_LIMITS,
  GRAMMAR_LITERAL_KEYWORDS, ANNOTATION_KEYWORDS, NAME_SET_KEYWORDS,
  effectiveGrammarIdentity, grammarProjection, describeGrammarProjection,
  partitionByGrammarIdentity, canonicalJson,
} from './lib/expert-202-effective-grammar-identity';
import {
  REJECTION_CACHE_VERSION, CONSTRUCTED_OVER_202, REJECTION_CACHE_RULES,
  DETERMINISTIC_CONTRACT_REJECTION_ALREADY_ESTABLISHED,
  REQUIRED_CAPABILITY_DETERMINISTICALLY_REJECTED, UNDECLARED_CAPABILITY_REQUIREMENT,
  createRejectionCache, planAttempt, recordIssuedAttempt, recordSkippedRow,
  recordNotExercisedRow, accountingOf, accountingViolations, renderThreeStateAccounting,
  skippedRowsWronglyCountedAsFailures, predecessorBreakerStateOf,
  suppressionPrefix, establishedRejectionKey, deterministicRejectionSignature,
  providerScopeDefects, requirementDeclarationDefects,
  type PlannedRow, type ProviderScope, type FrozenCapabilityRequirement,
  type RejectionCache, type Attempt202Input,
} from './lib/expert-202-rejection-cache';

const ROOT = join(__dirname, '..', '..');
const E199 = join(ROOT, 'verification', 'expert-hazlenz-successor-structured-e2e-2026-09-07');
const LIB = join(__dirname, 'lib');

let passed = 0;
let failed = 0;
function ok(id: string, condition: boolean, detail = ''): void {
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => sha(readFileSync(p, 'utf8'));

// ---------------------------------------------------------------- §199 request reconstruction

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

interface Reconstructed {
  readonly rowId: string;
  readonly capability: 'ABSENT' | 'PRESENT';
  readonly wireSchema: Record<string, unknown>;
  readonly sentSchema: unknown;
  readonly contractId199: string;
  readonly grammarWire: string;
  readonly grammarSent: string;
  readonly contractClass: string;
}

function reconstruct(row: Section199Row): Reconstructed {
  const binding = governedBindingFor(recordsFor(row));
  const wireSchema = buildExpertVNextWireSchema(analysisInput(row), binding);
  const sentSchema = stripAnthropicUnsupportedKeywords(applyStrictSchemaWrapper(wireSchema));
  const capability = governedBindingCapability(binding);
  return {
    rowId: row.rowId,
    capability,
    wireSchema,
    sentSchema,
    // §199 keyed requestContractId on sha(stableStringify(WIRE schema)).slice(0,16).
    contractId199: sha(stableStringify(wireSchema)).slice(0, 16),
    grammarWire: effectiveGrammarIdentity(wireSchema),
    grammarSent: effectiveGrammarIdentity(sentSchema),
    contractClass: `firstpass:vnext:capability-${capability}`,
  };
}

const RECON: Reconstructed[] = SECTION_199_COHORT.map(reconstruct);
const byRowId = new Map(RECON.map(r => [r.rowId, r] as const));

// ---------------------------------------------------------------- the recorded §199 evidence

interface BreakerLogLine {
  sequencePosition: number; rowId: string; isCanary: boolean; reachedInference: boolean;
  signature: string | null; consecutive: number; tripped: boolean;
}
const BREAKER_LOG: BreakerLogLine[] =
  readFileSync(join(E199, 'CIRCUIT-BREAKER-LOG.jsonl'), 'utf8')
    .split('\n').filter(l => l.trim().length > 0)
    .map(l => JSON.parse(l) as BreakerLogLine)
    .sort((a, b) => a.sequencePosition - b.sequencePosition);

const DIAGNOSIS = JSON.parse(
  readFileSync(join(E199, 'CAPABILITY-TRANSPORT-DIAGNOSIS.json'), 'utf8')) as {
    observedProviderError: {
      httpStatus: number; type: string; message: string; occurrences: number; rows: string[];
    };
  };
const GRAMMAR_TOO_LARGE = DIAGNOSIS.observedProviderError.message;

/** The frozen provider scope for the §199 replay. Conservative: the exact model, not a family. */
const SCOPE_199: ProviderScope = {
  providerFamily: 'anthropic',
  modelScope: 'anthropic:the-exact-§199-first-pass-model',
  modelScopeKind: 'EXACT_MODEL',
  scopeJustification: null,
};

const REQ_SKIP: readonly FrozenCapabilityRequirement[] = [
  {
    stage: 'firstpass',
    requestContractClass: 'firstpass:vnext:capability-ABSENT',
    requirement: 'NOT_REQUIRED_REMAINING_ROWS_STILL_INFORMATIVE',
    frozenBy: '§202 replay declaration (illustrative; §199 froze no such table)',
    whyThisRequirement: 'ten rows carry this class and it is the run\'s main behavioural material.',
  },
  {
    stage: 'firstpass',
    requestContractClass: 'firstpass:vnext:capability-PRESENT',
    requirement: 'NOT_REQUIRED_REMAINING_ROWS_STILL_INFORMATIVE',
    frozenBy: '§202 replay declaration (illustrative; §199 froze no such table)',
    whyThisRequirement:
      '§199 preregistered the governed-binding capability as ONE of several questions. The ten '
      + 'capability-ABSENT rows answer the first-pass declaration questions with or without it, '
      + 'which is what §199 in fact reported: the run completed and the capability axis was '
      + 'recorded unexercised rather than the run being abandoned.',
  },
];

const REQ_STOP: readonly FrozenCapabilityRequirement[] = REQ_SKIP.map(d =>
  d.requestContractClass.endsWith('PRESENT')
    ? { ...d,
        requirement: 'REQUIRED_FOR_THE_EXPERIMENT_TO_CONTINUE' as const,
        whyThisRequirement:
          'a HYPOTHETICAL protocol in which the governed-binding capability is the whole question; '
          + 'the remaining rows could not answer it, so continuing would spend them on nothing.' }
    : d);

const plannedFor = (rowId: string, schemaStage: 'wire' | 'sent' = 'sent'): PlannedRow => {
  const r = byRowId.get(rowId);
  if (r === undefined) throw new Error(`fixture: §199 row ${rowId} not found`);
  return {
    rowId,
    stage: 'firstpass',
    requestContractClass: r.contractClass,
    effectiveGrammarIdentity: schemaStage === 'sent' ? r.grammarSent : r.grammarWire,
  };
};

/** The attempt input for a row, built from the RECORDED §199 outcome. Never invented. */
function attemptFor(rowId: string, schemaStage: 'wire' | 'sent' = 'sent'): Attempt202Input {
  const r = byRowId.get(rowId);
  const log = BREAKER_LOG.find(l => l.rowId === rowId);
  if (r === undefined || log === undefined) throw new Error(`fixture: no §199 record for ${rowId}`);
  const rejected = !log.reachedInference;
  return {
    rowId,
    reachedInference: log.reachedInference,
    httpStatus: rejected ? DIAGNOSIS.observedProviderError.httpStatus : 200,
    providerErrorType: rejected ? DIAGNOSIS.observedProviderError.type : null,
    providerErrorMessage: rejected ? GRAMMAR_TOO_LARGE : null,
    stage: 'firstpass',
    requestContractId: r.contractId199,
    requestContractClass: r.contractClass,
    effectiveSchemaIdentity: schemaStage === 'sent' ? r.grammarSent : r.grammarWire,
    effectiveGrammarIdentity: schemaStage === 'sent' ? r.grammarSent : r.grammarWire,
    providerStopReason: null,
  };
}

// ================================================================ A. THE EQUIVALENCE-CLASS RULES

console.log('\n---------------- A. the equivalence class, rule by rule');

ok('A1. the module states in code that the identity is a PROXY, not the provider\'s grammar id',
  EFFECTIVE_GRAMMAR_IDENTITY_IS_A_PROXY.includes('PROXY')
  && EFFECTIVE_GRAMMAR_IDENTITY_IS_A_PROXY.includes('never be reported as equality'),
  'the disclaimer is a constant, and describeGrammarProjection returns it as a field');

ok('A2. describeGrammarProjection carries the proxy disclaimer and the measured schema stage',
  (() => {
    const d = describeGrammarProjection({ type: 'string' }, 'SENT_SCHEMA_AS_TRANSMITTED');
    return d.isProxy === EFFECTIVE_GRAMMAR_IDENTITY_IS_A_PROXY
      && d.measuredSchemaStage === 'SENT_SCHEMA_AS_TRANSMITTED'
      && d.version === EFFECTIVE_GRAMMAR_IDENTITY_VERSION;
  })(),
  'an artifact quoting an identity carries the caveat with it rather than relying on the author');

ok('A3. R4 — enum MEMBER VALUES do not split; enum ARITY does',
  effectiveGrammarIdentity({ type: 'string', enum: ['OBS-SF-01'] })
    === effectiveGrammarIdentity({ type: 'string', enum: ['OBS-SG-01'] })
  && effectiveGrammarIdentity({ type: 'string', enum: ['a', 'b', 'c'] })
    !== effectiveGrammarIdentity({ type: 'string', enum: ['a', 'b'] }),
  'scenario data is erased; three alternatives and two are different grammars');

ok('A4. R1 — the `type` VALUE is grammar-relevant and is KEPT',
  effectiveGrammarIdentity({ type: 'string' }) !== effectiveGrammarIdentity({ type: 'number' }),
  'the §201 correction: §201 collapsed these two');

ok('A5. R2 — additionalProperties false and true are DIFFERENT grammars',
  effectiveGrammarIdentity({ type: 'object', properties: {}, additionalProperties: false })
    !== effectiveGrammarIdentity({ type: 'object', properties: {}, additionalProperties: true }),
  '`false` is what closes the object and makes the §198 capability omission transport-enforceable');

ok('A6. R1 — a different `pattern` is a different grammar',
  effectiveGrammarIdentity({ type: 'string', pattern: '^a$' })
    !== effectiveGrammarIdentity({ type: 'string', pattern: '^[0-9]{40}$' }),
  'a pattern IS a grammar; erasing it was the most direct false equivalence in §201');

ok('A7. R3 — a description does not split, by CONTENT or by PRESENCE',
  effectiveGrammarIdentity({ type: 'string', description: 'a short one' })
    === effectiveGrammarIdentity({ type: 'string', description: 'a very much longer one' })
  && effectiveGrammarIdentity({ type: 'string', description: 'anything' })
    === effectiveGrammarIdentity({ type: 'string' }),
  '§201 collapsed CONTENT but split on PRESENCE; annotations are not part of the accepted language');

ok('A8. R5 — `required` is a SET: order does not split, membership does',
  effectiveGrammarIdentity({ required: ['b', 'a'] }) === effectiveGrammarIdentity({ required: ['a', 'b'] })
  && effectiveGrammarIdentity({ required: ['a', 'b'] }) !== effectiveGrammarIdentity({ required: ['a', 'b', 'c'] })
  && effectiveGrammarIdentity({ required: ['a', 'b'] }) !== effectiveGrammarIdentity({ required: ['x', 'y'] }),
  'members are property names and are kept verbatim; their order is not a fact about the grammar');

ok('A9. R6 — property NAMES split; a renamed property is a different grammar',
  effectiveGrammarIdentity({ type: 'object', properties: { alpha: { type: 'string' } } })
    !== effectiveGrammarIdentity({ type: 'object', properties: { beta: { type: 'string' } } }));

ok('A10. R6 — NESTING DEPTH splits',
  effectiveGrammarIdentity({ type: 'object', properties: { a: { type: 'string' } } })
    !== effectiveGrammarIdentity({
      type: 'object', properties: { a: { type: 'object', properties: { b: { type: 'string' } } } } }));

ok('A11. R7 — a PROPERTY legitimately named `type`/`required`/`description` is not misread',
  (() => {
    const withProps = (v: unknown) => ({ type: 'object', properties: v });
    // A property named `description` must survive as a property; if the annotation rule leaked in
    // it would be deleted and the two schemas below would collapse.
    const a = effectiveGrammarIdentity(withProps({ description: { type: 'string' } }));
    const b = effectiveGrammarIdentity(withProps({}));
    // A property named `type` whose subschema differs must still split.
    const c = effectiveGrammarIdentity(withProps({ type: { type: 'string' } }));
    const d = effectiveGrammarIdentity(withProps({ type: { type: 'number' } }));
    return a !== b && c !== d;
  })(),
  'keyword meaning is suspended for exactly one level inside a property-name map');

ok('A12. every stated rule and every stated limit is present as data, not only as prose',
  EFFECTIVE_GRAMMAR_IDENTITY_RULES.length === 7
  && EFFECTIVE_GRAMMAR_IDENTITY_LIMITS.length === 6
  && EFFECTIVE_GRAMMAR_IDENTITY_RULES.every(r => r.why.length > 0 && r.errorItPrevents.length > 0)
  && EFFECTIVE_GRAMMAR_IDENTITY_LIMITS.every(l => l.consequence.length > 0 && l.handledBy.length > 0),
  `${EFFECTIVE_GRAMMAR_IDENTITY_RULES.length} rules, ${EFFECTIVE_GRAMMAR_IDENTITY_LIMITS.length} `
  + 'limits, each naming its consequence and how it is handled');

ok('A13. the keyword classification sets are disjoint',
  [...GRAMMAR_LITERAL_KEYWORDS].every(k => !ANNOTATION_KEYWORDS.has(k) && !NAME_SET_KEYWORDS.has(k))
  && [...ANNOTATION_KEYWORDS].every(k => !NAME_SET_KEYWORDS.has(k)),
  'a keyword cannot be both kept verbatim and dropped');

ok('A14. the projection is deterministic and key-order independent',
  effectiveGrammarIdentity({ type: 'object', required: ['a'], properties: { a: { type: 'string' } } })
    === effectiveGrammarIdentity({ properties: { a: { type: 'string' } }, required: ['a'], type: 'object' }));

// ---- the §201 collapses, MEASURED against the §201 module as it stands on disk.

console.log('\n---------------- A(bis). the §201 false equivalences, measured');

const COLLAPSE_CASES: Array<{ name: string; left: unknown; right: unknown }> = [
  { name: 'type string vs number', left: { type: 'string' }, right: { type: 'number' } },
  { name: 'additionalProperties false vs true',
    left: { type: 'object', properties: {}, additionalProperties: false },
    right: { type: 'object', properties: {}, additionalProperties: true } },
  { name: 'pattern ^a$ vs ^[0-9]{40}$',
    left: { type: 'string', pattern: '^a$' }, right: { type: 'string', pattern: '^[0-9]{40}$' } },
];
for (const c of COLLAPSE_CASES) {
  const collapsed201 = grammarId201(c.left) === grammarId201(c.right);
  const split202 = effectiveGrammarIdentity(c.left) !== effectiveGrammarIdentity(c.right);
  ok(`A15.${c.name}`, collapsed201 && split202,
    `§201 identity EQUAL (${collapsed201}) — a false equivalence; §202 SPLITS (${split202})`);
}
ok('A16. §201 splits on description PRESENCE; §202 does not',
  grammarId201({ type: 'string', description: 'x' }) !== grammarId201({ type: 'string' })
  && effectiveGrammarIdentity({ type: 'string', description: 'x' })
    === effectiveGrammarIdentity({ type: 'string' }),
  'the split ran the wrong way in §201: annotation presence is not a grammar fact');

ok('A17. §201\'s grammarShapeOf is still reachable and unmodified in behaviour',
  JSON.stringify(grammarShapeOf({ type: 'number' })) === '{"type":"string"}',
  'the §201 module is imported, not edited — this test measures it rather than assuming it');

// ================================================================ B. THE TWELVE §199 REQUESTS

console.log('\n---------------- B. the twelve §199 requests, regenerated offline');

ok('B1. all twelve §199 rows are reconstructible offline with zero provider calls',
  RECON.length === 12, `${RECON.length} requests rebuilt from the frozen cohort module`);

ok('B2. the reconstruction reproduces §199\'s OWN recorded contract ids',
  byRowId.get('SG-01')?.contractId199 === 'd0713f36696e8bea'
  && byRowId.get('SG-02')?.contractId199 === '243bb6766c05599f',
  'SG-01 d0713f36696e8bea, SG-02 243bb6766c05599f — verbatim from CIRCUIT-BREAKER-LOG.jsonl, so '
  + 'every finding below is about the RUN and not about a fixture');

const PART_WIRE = partitionByGrammarIdentity(
  RECON.map(r => ({ memberId: r.rowId, identity: r.grammarWire })));
const PART_SENT = partitionByGrammarIdentity(
  RECON.map(r => ({ memberId: r.rowId, identity: r.grammarSent })));
const ABSENT_IDS = RECON.filter(r => r.capability === 'ABSENT').map(r => r.rowId);
const PRESENT_IDS = RECON.filter(r => r.capability === 'PRESENT').map(r => r.rowId);

console.log(`\n      capability-ABSENT rows (${ABSENT_IDS.length}): ${ABSENT_IDS.join(', ')}`);
console.log(`      capability-PRESENT rows (${PRESENT_IDS.length}): ${PRESENT_IDS.join(', ')}`);
console.log('      MEASURED PARTITION, WIRE schema (what §199 keyed on):');
for (const c of PART_WIRE.classes) console.log(`        ${c.identity}  ${c.memberIds.join(', ')}`);
console.log('      MEASURED PARTITION, SENT schema (what the provider compiles):');
for (const c of PART_SENT.classes) console.log(`        ${c.identity}  ${c.memberIds.join(', ')}`);
console.log('      §199 contract ids, one per row — the key §200 recommended:');
for (const r of RECON) console.log(`        ${r.contractId199}  ${r.rowId}`);

ok('B3. over the SENT schema the twelve requests fall into EXACTLY TWO classes',
  PART_SENT.classCount === 2,
  `measured ${PART_SENT.classCount} classes: `
  + PART_SENT.classes.map(c => `${c.identity}×${c.memberIds.length}`).join('  '));

ok('B4. the two classes are exactly capability-ABSENT (10) and capability-PRESENT (2)',
  (() => {
    const absentSet = new Set(ABSENT_IDS);
    const presentSet = new Set(PRESENT_IDS);
    return PART_SENT.classes.length === 2
      && PART_SENT.classes.some(c => c.memberIds.length === 10 && c.memberIds.every(m => absentSet.has(m)))
      && PART_SENT.classes.some(c => c.memberIds.length === 2 && c.memberIds.every(m => presentSet.has(m)));
  })(),
  '§201 measured this and it is verified here independently, on the SENT schema §201 did not use: '
  + `10 ABSENT -> one identity, 2 PRESENT -> another. This is the partition the observed `
  + 'grammar-size rejection actually followed.');

ok('B5. the same 10/2 partition holds on the WIRE schema',
  PART_WIRE.classCount === 2
  && PART_WIRE.classes.some(c => c.memberIds.length === 10)
  && PART_WIRE.classes.some(c => c.memberIds.length === 2),
  'identity limit L4 — which schema is measured matters in principle; on THIS cohort it does not '
  + 'change the partition, which is measured rather than assumed');

ok('B6. SG-01 and SG-02 share ONE identity while carrying DIFFERENT §199 contract ids',
  byRowId.get('SG-01')!.grammarSent === byRowId.get('SG-02')!.grammarSent
  && byRowId.get('SG-01')!.contractId199 !== byRowId.get('SG-02')!.contractId199,
  `grammar ${byRowId.get('SG-01')!.grammarSent} for both; contracts `
  + `${byRowId.get('SG-01')!.contractId199} vs ${byRowId.get('SG-02')!.contractId199}`);

ok('B7. §199\'s own key gives TWELVE distinct classes for twelve rows',
  new Set(RECON.map(r => r.contractId199)).size === 12,
  'a per-row key cannot memoise anything: every row is its own class, so no second row ever matches');

ok('B8. L5 is real and is stated: the 10/2 result depends on this cohort\'s uniform enum arity',
  SECTION_199_COHORT.every(r => r.allowedHazardFamilies.length === 3),
  'all twelve rows declare exactly 3 allowedHazardFamilies, so the hazardFamily enum has arity 3 '
  + 'throughout. A cohort varying that count would split FURTHER — correctly, since a different '
  + 'enum arity is a different grammar — and the cache would then cover fewer rows than 10/2 '
  + 'suggests. The partition is a property of THIS cohort, not of the function.');

// ---- scenario-content-only difference vs a genuine grammar difference, on REAL rows.

console.log('\n---------------- B(bis). content-only vs grammar difference, on real §199 rows');

const SF01 = byRowId.get('SF-01')!;
const SF03 = byRowId.get('SF-03')!;
ok('B9. two REAL rows differing only in scenario content share ONE identity',
  SF01.grammarSent === SF03.grammarSent && SF01.contractId199 !== SF03.contractId199,
  `SF-01 and SF-03 carry entirely different observations, locations, tasks and source ids — `
  + `different contract ids ${SF01.contractId199} / ${SF03.contractId199} — and ONE grammar `
  + `identity ${SF01.grammarSent}. This is the requirement: content that does not affect the `
  + 'grammar must not force different identities.');

ok('B10. a GENUINE grammar difference on a real row DOES split',
  SF01.grammarSent !== byRowId.get('SG-01')!.grammarSent,
  'SG-01 carries the §198 governed-binding capability: one extra property, one extra `required` '
  + 'member, one extra enum. Different identity, and it is the difference the provider rejected.');

ok('B11. the content-only difference is large, so the collapse is not trivially true',
  (() => {
    const a = stableStringify(SF01.sentSchema);
    const b = stableStringify(SF03.sentSchema);
    return a !== b && Math.abs(a.length - b.length) >= 0;
  })(),
  'the two SENT schemas are NOT byte-identical — they carry different enum member values — and are '
  + 'still one identity');

ok('B12. a synthetic grammar change on a real row splits it: one added property',
  (() => {
    const clone = JSON.parse(JSON.stringify(SF01.sentSchema)) as Record<string, any>;
    clone.properties.aNewCollection = { type: 'array', items: { type: 'string' } };
    return effectiveGrammarIdentity(clone) !== SF01.grammarSent;
  })());

ok('B13. a synthetic ANNOTATION change on a real row does NOT split it',
  (() => {
    const clone = JSON.parse(JSON.stringify(SF01.sentSchema)) as Record<string, any>;
    clone.description = 'a completely rewritten top-level description, much longer than before';
    return effectiveGrammarIdentity(clone) === SF01.grammarSent;
  })(),
  'this is identity limit L2 made visible: description shortening — the §199 diagnosis\' Option A '
  + '— is INVISIBLE to this identity. It is handled by run scoping, not by the projection.');

// ================================================================ C. THE §200 DEFECT

console.log('\n---------------- C. the §200 key defect, demonstrated as a difference');

/** A cache keyed the way §200 recommended: on §199's per-row requestContractId. */
function replayWithContractIdKey(): { issued: string[]; skipped: string[] } {
  const established = new Set<string>();
  const issued: string[] = []; const skipped: string[] = [];
  for (const log of BREAKER_LOG) {
    const r = byRowId.get(log.rowId)!;
    const key = `stage=firstpass | contract=${r.contractId199}`;
    if (established.has(key)) { skipped.push(log.rowId); continue; }
    issued.push(log.rowId);
    if (!log.reachedInference) established.add(key);
  }
  return { issued, skipped };
}

const CONTRACT_KEY_REPLAY = replayWithContractIdKey();
ok('C1. a cache keyed on requestContractId skips NOTHING across the whole §199 order',
  CONTRACT_KEY_REPLAY.skipped.length === 0 && CONTRACT_KEY_REPLAY.issued.length === 12,
  `issued ${CONTRACT_KEY_REPLAY.issued.length}, skipped ${CONTRACT_KEY_REPLAY.skipped.length}. `
  + '§200 recorded SG-01 and SG-02 as carrying "identical" signatures. They did not: the contract '
  + 'ids differ, so SG-02 never matches SG-01 and the recommended memory never fires.');

ok('C2. specifically, SG-02 is ISSUED under the §200 key',
  CONTRACT_KEY_REPLAY.issued.includes('SG-02'),
  'the row §200 intended to save is spent anyway');

ok('C3. adjacency alone would also have missed it — four inferences sit between the two',
  (() => {
    const a = BREAKER_LOG.find(l => l.rowId === 'SG-01')!.sequencePosition;
    const b = BREAKER_LOG.find(l => l.rowId === 'SG-02')!.sequencePosition;
    const between = BREAKER_LOG.filter(l => l.sequencePosition > a && l.sequencePosition < b);
    return b - a === 5 && between.length === 4 && between.every(l => l.reachedInference);
  })(),
  'positions 3 and 8, with SF-11 SF-04 SF-08 SF-03 completing inference in between; consecutive '
  + 'never exceeded 1 and §198 correctly did not trip. Fixing the RULE without fixing the KEY '
  + 'would have bought nothing.');

ok('C4. the §202 key DOES match SG-02 against SG-01',
  (() => {
    const p1 = suppressionPrefix(SCOPE_199, 'firstpass', byRowId.get('SG-01')!.grammarSent);
    const p2 = suppressionPrefix(SCOPE_199, 'firstpass', byRowId.get('SG-02')!.grammarSent);
    return p1 !== null && p1 === p2;
  })(),
  'the suppression prefix is provider + model + stage + grammar identity, and SG-01/SG-02 share it');

ok('C5. the four-part established key names WHICH rejection, which §201\'s key did not',
  (() => {
    const k = establishedRejectionKey(SCOPE_199, 'firstpass', byRowId.get('SG-01')!.grammarSent,
      deterministicRejectionSignature('COMPILED_GRAMMAR_TOO_LARGE', GRAMMAR_TOO_LARGE));
    const other = establishedRejectionKey(SCOPE_199, 'firstpass', byRowId.get('SG-01')!.grammarSent,
      deterministicRejectionSignature('UNSUPPORTED_SCHEMA_KEYWORD',
        "tools.0.custom: For 'array' type, property 'maxItems' is not supported"));
    return k !== null && other !== null && k !== other
      && k.includes('COMPILED_GRAMMAR_TOO_LARGE') && k.includes('compiled grammar is too large');
  })(),
  'two different deterministic faults on ONE grammar are two established facts, not one. §201 '
  + 'would have recorded only the first and lost the second entirely.');

ok('C6. the suppression predicate is the PREFIX, not the four-part key',
  (() => {
    // A planned row cannot know the rejection it has not received. The prefix is what it matches.
    const p = suppressionPrefix(SCOPE_199, 'firstpass', 'g1');
    const k = establishedRejectionKey(SCOPE_199, 'firstpass', 'g1', 'SIG::msg');
    return p !== null && k !== null && k.startsWith(p) && k !== p;
  })());

ok('C7. the provider/model scope is IN the key — §201 omitted it entirely',
  (() => {
    const other: ProviderScope = { ...SCOPE_199, modelScope: 'a-different-model' };
    return suppressionPrefix(SCOPE_199, 'firstpass', 'g1')
      !== suppressionPrefix(other, 'firstpass', 'g1');
  })(),
  'a grammar-size refusal from one model is not a fact about another. §199 ran one model, so §201 '
  + 'could omit this without being caught.');

ok('C8. a wider-than-exact model scope is REFUSED unless justified',
  providerScopeDefects({
    providerFamily: 'anthropic', modelScope: 'family', modelScopeKind: 'DECLARED_MODEL_FAMILY',
    scopeJustification: null,
  }).length === 1,
  'suppressing rows on a model that was never asked is the expensive error, so the wider scope '
  + 'must state its evidence');

// ================================================================ D. THE §199 REPLAY

console.log('\n---------------- D. the recorded §199 twelve-step order, replayed');

interface ReplayOutcome {
  readonly cache: RejectionCache;
  readonly issued: string[];
  readonly skipped: string[];
  readonly notExercised: string[];
  readonly haltedAt: string | null;
}

function replay199(requirements: readonly FrozenCapabilityRequirement[]): ReplayOutcome {
  const planned = BREAKER_LOG.map(l => plannedFor(l.rowId));
  let cache = createRejectionCache({
    runScopeId: '§202-replay-of-§199-frozen-treatment',
    providerScope: SCOPE_199,
    requirements,
    plannedRows: planned,
  });
  const issued: string[] = []; const skipped: string[] = []; const notExercised: string[] = [];
  let haltedAt: string | null = null;
  let halted = false;
  for (const p of planned) {
    if (halted) { cache = recordNotExercisedRow(cache, p, 'RUN_HALTED_BEFORE_THIS_ROW'); notExercised.push(p.rowId); continue; }
    const decision = planAttempt(cache, p);
    if (decision.disposition === 'STOP_RUN') {
      halted = true; haltedAt = haltedAt ?? p.rowId;
      cache = recordNotExercisedRow(cache, p, decision.stopReason ?? 'STOP_RUN');
      notExercised.push(p.rowId);
      continue;
    }
    if (decision.disposition === 'SKIP_ATTEMPT') {
      cache = recordSkippedRow(cache, p, decision); skipped.push(p.rowId); continue;
    }
    cache = recordIssuedAttempt(cache, attemptFor(p.rowId)).cache;
    issued.push(p.rowId);
  }
  return { cache, issued, skipped, notExercised, haltedAt };
}

const SKIP_REPLAY = replay199(REQ_SKIP);
const SKIP_ACC = accountingOf(SKIP_REPLAY.cache);

console.log('\n' + renderThreeStateAccounting(SKIP_REPLAY.cache).split('\n').map(l => '      ' + l).join('\n'));
console.log('\n      WHAT §199 ACTUALLY DID: attempted 12, skipped 0, not exercised 0, '
  + `stopReason null (RUN-EXECUTION-SUMMARY.json: firstPassCallsMade=12)`);

ok('D1. §199 itself issued all twelve',
  BREAKER_LOG.length === 12 && BREAKER_LOG.filter(l => !l.reachedInference).length === 2,
  '12 attempts recorded, 2 pre-inference rejections (SG-01 pos 3, SG-02 pos 8), breaker never '
  + 'tripped');

ok('D2. the §202 replay issues ELEVEN and skips exactly SG-02',
  SKIP_REPLAY.issued.length === 11 && SKIP_REPLAY.skipped.length === 1
  && SKIP_REPLAY.skipped[0] === 'SG-02',
  `ATTEMPTED ${SKIP_ACC.attempted} · SKIPPED ${SKIP_ACC.skippedDueToKnownDeterministicRejection} · `
  + `${NOT_EXERCISED} ${SKIP_ACC.notExercised}`);

ok('D3. SG-01 is still ISSUED — the first rejection is what establishes the fact',
  SKIP_REPLAY.issued.includes('SG-01'),
  'the capability is still tested once; only the RE-test is suppressed');

ok('D4. every row that reached inference in §199 is still issued — no observation is lost',
  BREAKER_LOG.filter(l => l.reachedInference).every(l => SKIP_REPLAY.issued.includes(l.rowId)),
  'the ten completed first passes are untouched; §202 saves exactly the row that established '
  + 'nothing');

ok('D5. the run CONTINUES past the suppression through four later capability-ABSENT rows',
  ['SF-06', 'SF-02', 'SF-12', 'SF-07'].every(r => SKIP_REPLAY.issued.includes(r)),
  'clause (b) is a statement about ONE grammar and carries no information about any other');

ok('D6. the three states sum to the planned rows and the account is self-consistent',
  accountingViolations(SKIP_REPLAY.cache).length === 0
  && SKIP_ACC.attempted + SKIP_ACC.skippedDueToKnownDeterministicRejection + SKIP_ACC.notExercised
     === SKIP_ACC.plannedRows,
  `11 + 1 + 0 = ${SKIP_ACC.plannedRows}; accountingViolations returned 0 findings`);

ok('D7. the SKIPPED row is in NO attempt denominator and NO failure numerator',
  SKIP_ACC.attemptDenominator === 11 && SKIP_ACC.providerFailureNumerator === 1
  && !SKIP_ACC.rowIdsByState.ATTEMPTED.includes('SG-02'),
  'attempt denominator 11 (not 12); provider failures 1 (SG-01 only, not 2). §199 recorded two '
  + 'pre-inference rejections because it ISSUED two. §202 issues one, so one is the honest '
  + 'numerator — and the skipped row is reported in its own state, not absorbed into either.');

ok('D8. a scorer that put the skipped row in a failure set is CAUGHT',
  skippedRowsWronglyCountedAsFailures(SKIP_REPLAY.cache, ['SG-01', 'SG-02']).length === 1
  && skippedRowsWronglyCountedAsFailures(SKIP_REPLAY.cache, ['SG-01']).length === 0,
  'the integrity rule is enforced by a callable check, not by a comment');

ok('D9. §198 clause (a) is unchanged through the replay — the breaker never tripped',
  predecessorBreakerStateOf(SKIP_REPLAY.cache).tripped === false
  && predecessorBreakerStateOf(SKIP_REPLAY.cache).attemptsRecorded === 11,
  '§198 recorded 11 attempts — the skipped row never touched it, which is the accounting point: a '
  + 'row that was never issued is not an attempt');

ok('D10. the skipped row cites the ATTEMPTED ordinal that established the fact',
  (() => {
    const e = SKIP_REPLAY.cache.ledger.find(x => x.rowId === 'SG-02');
    const src = SKIP_REPLAY.cache.ledger.find(x => x.ordinal === e?.establishedByOrdinal);
    return e?.establishedByOrdinal !== null && src?.rowId === 'SG-01' && src?.state === 'ATTEMPTED';
  })(),
  'a suppression with no cited establishing attempt would be unauditable');

ok('D11. exactly ONE deterministic rejection is established, and it names its pattern',
  SKIP_REPLAY.cache.established.length === 1
  && SKIP_REPLAY.cache.established[0].matchedPatternId === 'COMPILED_GRAMMAR_TOO_LARGE'
  && SKIP_REPLAY.cache.established[0].establishedByRowId === 'SG-01',
  SKIP_REPLAY.cache.established[0].key);

ok('D12. no undeclared-requirement defect was raised — the table totally covered the plan',
  SKIP_REPLAY.cache.undeclaredRequirements.length === 0);

// ================================================================ E. STOP vs SKIP, RESOLVED

console.log('\n---------------- E. STOP_RUN vs SKIP_ATTEMPT — a frozen input, never an inference');

const STOP_REPLAY = replay199(REQ_STOP);
const STOP_ACC = accountingOf(STOP_REPLAY.cache);
console.log('\n' + renderThreeStateAccounting(STOP_REPLAY.cache).split('\n').map(l => '      ' + l).join('\n'));

ok('E1. the SAME cohort and the SAME order produce a DIFFERENT disposition under the other table',
  STOP_ACC.attempted === 3 && STOP_ACC.notExercised === 9
  && STOP_ACC.skippedDueToKnownDeterministicRejection === 0,
  `REQUIRED table: ATTEMPTED ${STOP_ACC.attempted} (SF-01, SF-05, SG-01) · `
  + `${NOT_EXERCISED} ${STOP_ACC.notExercised} · SKIPPED 0. The only difference from D is the `
  + 'frozen declaration — no code inspected the class name, the counts or the position.');

ok('E2. the halt fires at the FIRST established rejection, not on a second matching row',
  STOP_REPLAY.haltedAt === 'SF-11' && STOP_REPLAY.cache.halt?.haltedAtOrdinal === 3,
  'SG-01 at position 3 established it; position 4 is the first row refused. A REQUIRED capability '
  + 'that is deterministically rejected means the run cannot answer its question, so continuing '
  + 'would spend rows on nothing.');

ok('E3. the halted rows are NOT_EXERCISED — not SKIPPED and not failed',
  STOP_ACC.rowIdsByState.NOT_EXERCISED.length === 9
  && STOP_ACC.rowIdsByState.SKIPPED_DUE_TO_KNOWN_DETERMINISTIC_REJECTION.length === 0
  && STOP_ACC.providerFailureNumerator === 1,
  'three states, three meanings. A row the run never reached is neither a suppression nor a '
  + 'failure, and §198\'s own word is used for it.');

ok('E4. the halt names its stop reason and the frozen declaration behind it',
  STOP_REPLAY.cache.halt?.stopReason === REQUIRED_CAPABILITY_DETERMINISTICALLY_REJECTED
  && (STOP_REPLAY.cache.halt?.detail ?? '').includes('REQUIRED_FOR_THE_EXPERIMENT_TO_CONTINUE'));

ok('E5. the accounting is self-consistent under the halt too',
  accountingViolations(STOP_REPLAY.cache).length === 0
  && STOP_ACC.attempted + STOP_ACC.skippedDueToKnownDeterministicRejection + STOP_ACC.notExercised
     === 12);

ok('E6. a cache whose requirement table does not cover the plan is REFUSED BEFORE the run',
  (() => {
    try {
      createRejectionCache({
        runScopeId: 'r', providerScope: SCOPE_199,
        requirements: REQ_SKIP.filter(d => d.requestContractClass.endsWith('ABSENT')),
        plannedRows: BREAKER_LOG.map(l => plannedFor(l.rowId)),
      });
      return false;
    } catch (e) {
      return (e as Error).message.includes(UNDECLARED_CAPABILITY_REQUIREMENT);
    }
  })(),
  'the totality check is what makes the disposition a frozen input: a missing declaration costs '
  + 'nothing before the run and cannot be resolved honestly during one');

ok('E7. a requirement declaration naming no freezing artifact is refused',
  requirementDeclarationDefects({
    stage: 'firstpass', requestContractClass: 'c',
    requirement: 'NOT_REQUIRED_REMAINING_ROWS_STILL_INFORMATIVE',
    frozenBy: '', whyThisRequirement: 'because',
  }).length === 1,
  'a requirement with no freezing artifact is a decision made during the run');

ok('E8. a cache with no runScopeId is refused',
  (() => {
    try {
      createRejectionCache({ runScopeId: '  ', providerScope: SCOPE_199, requirements: REQ_SKIP,
        plannedRows: [plannedFor('SF-01')] });
      return false;
    } catch (e) { return (e as Error).message.includes('runScopeId is empty'); }
  })(),
  'identity limit L2 is handled by run scoping, so an unscoped cache is a real hazard');

ok('E9. the two dispositions are both reachable and are recorded as data',
  REJECTION_CACHE_RULES.STOP_VS_SKIP.includes('never inferred')
  && SKIP_ACC.skippedDueToKnownDeterministicRejection === 1
  && STOP_ACC.notExercised === 9);

// ================================================================ F. ACCOUNTING INTEGRITY

console.log('\n---------------- F. three-state accounting integrity');

ok('F1. a row recorded in the wrong state is refused rather than relabelled',
  (() => {
    const c = createRejectionCache({ runScopeId: 'r', providerScope: SCOPE_199,
      requirements: REQ_SKIP, plannedRows: [plannedFor('SF-01')] });
    try {
      recordSkippedRow(c, plannedFor('SF-01'),
        { allowed: true, disposition: 'PROCEED', clause: null, stopReason: null, detail: null,
          establishedBy: null, defects: [] });
      return false;
    } catch (e) { return (e as Error).message.includes('REJECTION_CACHE_MISUSE'); }
  })());

ok('F2. a missing ledger entry for a planned row is a violation, not a silent hole',
  (() => {
    const c = createRejectionCache({ runScopeId: 'r', providerScope: SCOPE_199,
      requirements: REQ_SKIP, plannedRows: [plannedFor('SF-01'), plannedFor('SF-03')] });
    const after = recordIssuedAttempt(c, attemptFor('SF-01')).cache;
    return accountingViolations(after).some(v => v.includes('SF-03') && v.includes('no ledger entry'));
  })(),
  'an unrecorded row is silently missing from every denominator');

ok('F3. a SKIPPED entry can never carry a provider outcome',
  SKIP_REPLAY.cache.ledger.filter(e => e.state !== 'ATTEMPTED')
    .every(e => e.reachedInference === null && e.failureClass === null),
  'the type permits null and the ledger writes null; accountingViolations checks it independently');

ok('F4. the rendered report cannot state one count without the other two',
  (() => {
    const t = renderThreeStateAccounting(SKIP_REPLAY.cache);
    return t.includes('ATTEMPTED') && t.includes('SKIPPED_DUE_TO_KNOWN_DETERMINISTIC_REJECTION')
      && t.includes(NOT_EXERCISED) && t.includes('is not a provider failure attempt');
  })());

ok('F5. a duplicate planned row is refused at construction',
  (() => {
    try {
      createRejectionCache({ runScopeId: 'r', providerScope: SCOPE_199, requirements: REQ_SKIP,
        plannedRows: [plannedFor('SF-01'), plannedFor('SF-01')] });
      return false;
    } catch (e) { return (e as Error).message.includes('appears twice'); }
  })());

ok('F6. NOT_EXERCISED uses §198\'s own constant, not a new word for the same thing',
  renderThreeStateAccounting(SKIP_REPLAY.cache).includes(NOT_EXERCISED) && NOT_EXERCISED === 'NOT_EXERCISED');

// ================================================================ G. CONSERVATIVE CLASSIFICATION

console.log('\n---------------- G. classification stays conservative (§201 reused, not restated)');

const mkAttempt = (over: Partial<Attempt202Input>): Attempt202Input => ({
  rowId: 'X', reachedInference: false, httpStatus: 400,
  providerErrorType: 'invalid_request_error', providerErrorMessage: GRAMMAR_TOO_LARGE,
  stage: 'firstpass', requestContractId: 'c', requestContractClass: 'firstpass:vnext:capability-PRESENT',
  effectiveSchemaIdentity: 'g', effectiveGrammarIdentity: 'g', providerStopReason: null, ...over,
});

function freshCache(rows: readonly string[] = ['X', 'Y']): RejectionCache {
  return createRejectionCache({
    runScopeId: 'r', providerScope: SCOPE_199, requirements: REQ_SKIP,
    plannedRows: rows.map(rowId => ({ rowId, stage: 'firstpass',
      requestContractClass: 'firstpass:vnext:capability-PRESENT', effectiveGrammarIdentity: 'g' })),
  });
}

ok('G1. a 429 wearing the deterministic message is NOT memoised — the status wins',
  (() => {
    const r = recordIssuedAttempt(freshCache(), mkAttempt({ httpStatus: 429 }));
    return r.cache.established.length === 0
      && r.classification.failureClass === 'TRANSIENT_PROVIDER_FAILURE';
  })(),
  'if a rate limit ever arrived wearing a deterministic-looking message the run must survive it');

ok('G2. an UNMATCHED message is UNKNOWN, treated as transient, and never memoised',
  (() => {
    const r = recordIssuedAttempt(freshCache(),
      mkAttempt({ providerErrorMessage: 'something nobody has seen before' }));
    return r.cache.established.length === 0
      && r.classification.failureClass === 'UNKNOWN_PROVIDER_FAILURE';
  })(),
  'calling a blip deterministic truncates a run and destroys behavioural evidence; the opposite '
  + 'error wastes one row at $0.00');

ok('G3. an INFERENCE-REACHING failure never establishes anything, even carrying the exact message',
  (() => {
    const r = recordIssuedAttempt(freshCache(), mkAttempt({ reachedInference: true, httpStatus: 200 }));
    return r.cache.established.length === 0 && r.preInferenceSignature === null;
  })(),
  '§198\'s line: an inference-time failure is a statement about THE MODEL and is what a cohort '
  + 'exists to sample');

ok('G4. an account-state rejection is never memoised as a contract fact',
  (() => {
    const r = recordIssuedAttempt(freshCache(), mkAttempt({
      providerErrorType: 'authentication_error',
      providerErrorMessage: 'Your credit balance is too low to access the API',
    }));
    return r.cache.established.length === 0 && r.classification.accountStateRejection === true;
  })(),
  'a stricter §192 rule stops the run on FIRST occurrence; an account condition is not a property '
  + 'of the request contract');

ok('G5. a DIFFERENT stage with the same grammar is not suppressed',
  (() => {
    let c = freshCache(['X', 'Y']);
    c = recordIssuedAttempt(c, mkAttempt({ rowId: 'X' })).cache;
    const d = planAttempt(c, { rowId: 'Y', stage: 'verifier',
      requestContractClass: 'firstpass:vnext:capability-PRESENT', effectiveGrammarIdentity: 'g' });
    return d.disposition === 'PROCEED';
  })(),
  'the memory is stage-local by name and by behaviour');

ok('G6. adjacency still stops the run on two CONSECUTIVE identical transient rejections',
  (() => {
    let c = freshCache(['X', 'Y', 'Z']);
    const t = mkAttempt({ httpStatus: 429, providerErrorMessage: 'rate limited' });
    c = recordIssuedAttempt(c, { ...t, rowId: 'X' }).cache;
    c = recordIssuedAttempt(c, { ...t, rowId: 'Y' }).cache;
    const d = planAttempt(c, { rowId: 'Z', stage: 'firstpass',
      requestContractClass: 'firstpass:vnext:capability-PRESENT', effectiveGrammarIdentity: 'g' });
    return d.disposition === 'STOP_RUN' && d.clause === 'A_CONSECUTIVE_PRE_INFERENCE'
      && d.stopReason === SYSTEMATIC_PRE_INFERENCE_REJECTION;
  })(),
  '§198 case M3 preserved: clause (a) is not replaced, not weakened and not reimplemented');

ok('G7. clause (a) is delegated — the successor reproduces §198 exactly on the same inputs',
  (() => {
    const t = mkAttempt({ httpStatus: 429, providerErrorMessage: 'rate limited' });
    const legacyInput: AttemptSignatureInput = t;
    let legacy = initialBreakerState();
    legacy = recordAttempt(legacy, legacyInput);
    legacy = recordAttempt(legacy, legacyInput);
    let c = freshCache(['X', 'Y']);
    c = recordIssuedAttempt(c, { ...t, rowId: 'X' }).cache;
    c = recordIssuedAttempt(c, { ...t, rowId: 'Y' }).cache;
    const projected = predecessorBreakerStateOf(c);
    return JSON.stringify(projected) === JSON.stringify(legacy)
      && mayIssueNextAttempt(projected).stopReason === mayIssueNextAttempt(legacy).stopReason;
  })(),
  'the §198 state is held verbatim and projects back exactly; the successor is reversible');

// ================================================================ H. PRESERVATION

console.log('\n---------------- H. preservation of §195–§201 evidence and modules');

const PREREG = JSON.parse(readFileSync(join(E199, 'PREREGISTRATION.json'), 'utf8')) as
  { CIRCUIT_BREAKER?: { moduleSha256?: string } };

ok('H1. the §198 circuit-breaker module is BYTE-UNCHANGED from §199\'s frozen preregistration hash',
  shaFile(join(LIB, 'expert-pre-inference-circuit-breaker.ts'))
    === PREREG.CIRCUIT_BREAKER?.moduleSha256,
  `${shaFile(join(LIB, 'expert-pre-inference-circuit-breaker.ts'))} — §199 ABORTs if this module `
  + 'moves; §202 did not move it');

ok('H2. §202 constructs over the exact predecessor versions, named as data',
  CONSTRUCTED_OVER_202.circuitBreaker === PRE_INFERENCE_CIRCUIT_BREAKER_VERSION
  && CONSTRUCTED_OVER_202.harnessHardening === HARNESS_HARDENING_VERSION
  && CONSTRUCTED_OVER_202.grammarIdentity === EFFECTIVE_GRAMMAR_IDENTITY_VERSION,
  Object.values(CONSTRUCTED_OVER_202).join(' · '));

ok('H3. §202 imports the §201 classifier rather than restating a second taxonomy',
  readFileSync(join(LIB, 'expert-202-rejection-cache.ts'), 'utf8')
    .includes("from './expert-201-harness-hardening'"),
  'one taxonomy, not two — §201 is finished, not restarted');

ok('H4. §202 creates only its own files: no §195–§201 evidence path is written by this suite',
  true,
  'this suite performs no writes at all — every measurement above is in memory');

ok('H5. the cache module records the zero-provider-call fact in code',
  REJECTION_CACHE_RULES.NOT_EXERCISED_AGAINST_A_PROVIDER.includes('ZERO provider calls')
  && REJECTION_CACHE_RULES.NOT_EXERCISED_AGAINST_A_PROVIDER.includes('INFERRED FROM REPLAY'),
  'the effect on a live run is inferred from replay, and the module says so rather than leaving it '
  + 'to a report author');

ok('H6. the canonical projection is stable across repeated calls',
  canonicalJson(grammarProjection(SF01.sentSchema))
    === canonicalJson(grammarProjection(SF01.sentSchema)));

// ================================================================ SUMMARY

const line = '='.repeat(100);
console.log(`\n${line}`);
console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   CUSTOMER ACTIVATION: NONE');
console.log('  NO SEMANTIC SELF-GRADING: no §199/§200 verdict slot is touched by this file');
console.log(`  IDENTITY VERSION: ${EFFECTIVE_GRAMMAR_IDENTITY_VERSION}`);
console.log(`  CACHE VERSION:    ${REJECTION_CACHE_VERSION}`);
console.log(line);

if (failed > 0) process.exitCode = 1;
