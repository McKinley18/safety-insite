/**
 * §171 EXPERT HAZLENZ -- GOVERNED acceptableEvidence POPULATION PROOF.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOTHING IS WRITTEN.
 *
 * Every governed record used here is read from the LIVE registry under
 * `safescope-data/approved-knowledge/`. No fixture record is authored, and no §167/§169 evaluation
 * material is used as an input to any criterion.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

import type {
  ApprovedKnowledgeRecord,
} from '../src/safescope-v2/expert-hazlenz/../approved-knowledge-registry/approved-knowledge-record.types';
import {
  deriveAcceptableEvidence, REQUIREMENT_TEMPLATE, PLACEHOLDER_CITATION_MARKERS,
  GOVERNED_EVIDENCE_DERIVATION_VERSION, DERIVATION_LIMITS,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/governed-evidence-derivation';
import {
  type OwedFact, PRODUCTION_PERMITTED_EVIDENCE_PROVENANCES,
  PRODUCTION_FORBIDDEN_EVIDENCE_PROVENANCES, PROVIDER_FORBIDDEN_OWED_FACT_FIELDS,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types';
import {
  owedFact, createOwedFactLedger, factOf, factsRemoved, preservationViolations, unresolvedFacts,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  type ClarificationDeclaration,
  checkBindingDeclarations, applyAdmittedDeclarations, evaluateTargetCoverage,
  CLARIFICATION_EVIDENCE_SUFFICIENCY,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-binding';
import {
  projectOwedFactsForVerifier, EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED,
  runOwedFactCoverageStage, verifierV3BoundaryState,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/verifier-v3-development-boundary';
import { projectStructuralQuestions } from
  '../src/safescope-v2/expert-hazlenz/owed-facts/structural-questions';
import { mergeExpertIntelligence } from
  '../src/safescope-v2/expert-hazlenz/expert-authority-merge';

const ROOT = join(__dirname, '..', '..');
const REGISTRY_DIR = join(ROOT, 'safescope-data', 'approved-knowledge', 'registry');

let passed = 0;
let failed = 0;
const results: Array<{ id: string; ok: boolean; detail: string }> = [];
function ok(id: string, condition: boolean, detail = ''): void {
  results.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}
function threw(fn: () => unknown): string | null {
  try { fn(); return null; } catch (e) { return (e as Error).message; }
}

// ---------------------------------------------------------------- the live governed registry

function loadRegistry(): ApprovedKnowledgeRecord[] {
  const out: ApprovedKnowledgeRecord[] = [];
  for (const f of readdirSync(REGISTRY_DIR).filter(n => n.endsWith('.json'))) {
    const parsed = JSON.parse(readFileSync(join(REGISTRY_DIR, f), 'utf8')) as unknown;
    const records = Array.isArray(parsed)
      ? parsed
      : ((parsed as { records?: unknown[] }).records ?? [parsed]);
    for (const r of records as ApprovedKnowledgeRecord[]) out.push(r);
  }
  return out;
}
const registry = loadRegistry();
const byId = (id: string): ApprovedKnowledgeRecord => registry.find(r => r.recordId === id)!;

/** The selected family. Chosen on the evidence in §2 of the report, not on convenience. */
const SELECTED_RECORD_ID = 'app-loto-01';
const ENERGY_ISOLATION_FACT_KEY = 'owed:energy:isolation_state_before_work';

console.log('§171 GOVERNED acceptableEvidence POPULATION — PROOF');
console.log('='.repeat(100));
console.log(`  registry: ${registry.length} records from safescope-data/approved-knowledge/registry`);
console.log(`  derivation: ${GOVERNED_EVIDENCE_DERIVATION_VERSION}`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0\n');

// ================================================================== A. the source is real

console.log('--- A  THE GOVERNED SOURCE IS REAL, APPROVED AND PRE-EXISTING\n');

const loto = byId(SELECTED_RECORD_ID);
ok('A.1 the selected record exists in the live governed registry and is approved',
  !!loto && loto.status === 'approved'
    && loto.authority.citation === '1910.147'
    && loto.authority.agency === 'OSHA'
    && loto.authority.authorityTier === 'primary_regulation',
  `${loto.recordId} v${loto.version} — OSHA ${loto.authority.citation}, `
  + `${loto.authority.authorityTier}, approved ${loto.governance.approvedAt} by `
  + `${loto.governance.reviewerRole}`);

ok('A.2 the record carries a state-establishing verification method and a named weak action',
  loto.correctiveActionLinks.verificationMethods.includes('zero_energy_verification')
    && loto.correctiveActionLinks.commonWeakActionsToAvoid.includes('warning_only')
    && loto.mapping.requiredFacts.includes('energy_isolation_status'),
  `verificationMethods=${JSON.stringify(loto.correctiveActionLinks.verificationMethods)} · `
  + `weak=${JSON.stringify(loto.correctiveActionLinks.commonWeakActionsToAvoid)} · `
  + `requiredFacts=${JSON.stringify(loto.mapping.requiredFacts)}`);

ok('A.3 the record predates and is independent of the verifier — it names no verifier concept',
  !JSON.stringify(loto).includes('acceptableEvidence')
    && !JSON.stringify(loto).includes('factKey')
    && !JSON.stringify(loto).includes('binding')
    && !/HS-[A-Z]\d|VC-\d\d/.test(JSON.stringify(loto)),
  'no verifier vocabulary and no evaluation identifier appears anywhere in the record');

// ================================================================== B. derivation

console.log('\n--- B  DERIVATION IS DETERMINISTIC AND COPIES THE GOVERNED VOCABULARY\n');

const derived = deriveAcceptableEvidence(loto);
const ae = derived.acceptableEvidence!;
ok('B.1 a criterion is derived, with GOVERNED_EVIDENCE provenance',
  ae !== null && ae.provenance === 'GOVERNED_EVIDENCE' && derived.refusedBecause === null,
  `provenance=${ae.provenance}`);

ok('B.2 examples and insufficientExamples are COPIED from the record, not paraphrased',
  JSON.stringify(ae.examples) === JSON.stringify(loto.correctiveActionLinks.verificationMethods)
    && JSON.stringify(ae.insufficientExamples)
      === JSON.stringify(loto.correctiveActionLinks.commonWeakActionsToAvoid),
  'byte-equal to the governed arrays');

ok('B.3 the requirement is the fixed hazard-agnostic template with governed values substituted',
  ae.requirement === REQUIREMENT_TEMPLATE
    .replace('{REQUIRED_FACTS}', loto.mapping.requiredFacts.join(', '))
    .replace('{CITATION}', loto.authority.citation)
    && !/lockout|energy source|guard|flame|interlock|auger/i.test(REQUIREMENT_TEMPLATE),
  `"${ae.requirement}"`);

ok('B.4 the derivation is byte-stable across repeated calls',
  JSON.stringify(deriveAcceptableEvidence(loto)) === JSON.stringify(derived)
    && JSON.stringify(deriveAcceptableEvidence(loto).acceptableEvidence)
      === JSON.stringify(ae),
  'identical bytes on re-derivation');

ok('B.5 no evaluation or human-disposition material is an input to the derivation',
  !readFileSync(join(__dirname, '..', 'src', 'safescope-v2', 'expert-hazlenz', 'owed-facts',
    'governed-evidence-derivation.ts'), 'utf8')
    .match(/HS-[A-Z]\d|VC-\d\d|disposition|BINDING_|adjudicat/i),
  'the derivation module names no evaluation row, disposition or adjudication');

// ================================================================== C. fail-closed refusals

console.log('\n--- C  FAIL-CLOSED REFUSALS, INCLUDING TWO FOUND IN THE LIVE REGISTRY\n');

const placeholderRecords = registry.filter(
  r => PLACEHOLDER_CITATION_MARKERS.some(m => r.authority.citation.toLowerCase().includes(m)));
ok('C.1 records carrying a placeholder citation are refused — and two exist in the live registry',
  placeholderRecords.length === 2
    && placeholderRecords.every(r => deriveAcceptableEvidence(r).acceptableEvidence === null)
    && placeholderRecords.every(
      r => deriveAcceptableEvidence(r).refusedBecause === 'CITATION_IS_A_PLACEHOLDER'),
  `${placeholderRecords.map(r => r.recordId).join(', ')} refused as CITATION_IS_A_PLACEHOLDER`);

ok('C.2 an unapproved record, a methodless record and a missing record all refuse to null',
  deriveAcceptableEvidence({ ...loto, status: 'draft_candidate' }).refusedBecause
      === 'RECORD_NOT_APPROVED'
    && deriveAcceptableEvidence({ ...loto,
      correctiveActionLinks: { ...loto.correctiveActionLinks, verificationMethods: [] },
    }).refusedBecause === 'NO_VERIFICATION_METHOD_IN_RECORD'
    && deriveAcceptableEvidence({ ...loto,
      mapping: { ...loto.mapping, requiredFacts: [] } }).refusedBecause
      === 'NO_REQUIRED_FACT_IN_RECORD'
    && deriveAcceptableEvidence(null).refusedBecause === 'NO_GOVERNED_RECORD_LINKED',
  'four named refusals, all yielding null rather than a weaker criterion');

ok('C.3 the derivation never searches for a record — it cannot infer one from a hazard family',
  !readFileSync(join(__dirname, '..', 'src', 'safescope-v2', 'expert-hazlenz', 'owed-facts',
    'governed-evidence-derivation.ts'), 'utf8')
    .match(/\.find\(|\.filter\(\s*r\s*=>|hazardFamilies|readdir|readFile/),
  'no lookup, no registry read, no hazard-family matching in the derivation module');

// ================================================================== D. mixed ledger

console.log('\n--- D  MIXED POPULATED / NULL LEDGER\n');

const OBS = 'A maintenance fitter is changing a drive belt on the packaging line. The line '
  + 'disconnect is open. Grain dust has settled on the horizontal surfaces of the walkway.';

const governedFact: OwedFact = owedFact({
  factKey: ENERGY_ISOLATION_FACT_KEY,
  affectedDecision: 'REQUIRED_CONTROL',
  source: 'DETERMINISTIC',
  evidenceSpan: 'The line disconnect is open.',
  whyUnresolved: 'the span states the disconnect is open and states nothing about whether the '
    + 'isolation was verified at the point of work',
  branchA: 'isolation was verified before work began',
  branchB: 'isolation was not verified before work began',
  decisionDivergence: { ifA: 'work continues', ifB: 'work stops until isolation is verified' },
  priority: 'REQUIRED_CONTROL',
  acceptableEvidence: ae,
});
const ungovernedFact: OwedFact = owedFact({
  factKey: 'owed:housekeeping:dust_accumulation_extent',
  affectedDecision: 'EXPOSURE',
  source: 'DETERMINISTIC',
  evidenceSpan: 'Grain dust has settled on the horizontal surfaces of the walkway.',
  whyUnresolved: 'the span states dust is present and states nothing about accumulation depth',
  branchA: 'accumulation is below the housekeeping threshold',
  branchB: 'accumulation is above the housekeeping threshold',
  decisionDivergence: { ifA: 'cleaning continues on schedule', ifB: 'cleaning happens before work' },
  priority: 'OTHER',
  acceptableEvidence: deriveAcceptableEvidence(null).acceptableEvidence,
});

const mixed = createOwedFactLedger('PRODUCTION', [governedFact, ungovernedFact]);
ok('D.1 a PRODUCTION ledger accepts the governed criterion and the null side by side',
  factOf(mixed, ENERGY_ISOLATION_FACT_KEY)!.acceptableEvidence!.provenance === 'GOVERNED_EVIDENCE'
    && factOf(mixed, 'owed:housekeeping:dust_accumulation_extent')!.acceptableEvidence === null,
  'one populated, one null, in the same production ledger');

ok('D.2 the criterion stays attached to its own factKey and does not bleed',
  mixed.facts.filter(f => f.acceptableEvidence !== null).length === 1
    && mixed.facts.filter(f => f.acceptableEvidence !== null)[0].factKey
      === ENERGY_ISOLATION_FACT_KEY,
  'exactly one fact carries a criterion');

const mixedProjected = projectOwedFactsForVerifier(mixed);
ok('D.3 projection preserves the pairing and the null',
  mixedProjected.find(p => p.factKey === ENERGY_ISOLATION_FACT_KEY)!.acceptableEvidence!
    .examples.includes('zero_energy_verification')
    && mixedProjected.find(p => p.factKey === 'owed:housekeeping:dust_accumulation_extent')!
      .acceptableEvidence === null,
  'populated projects populated, null projects null');

// ================================================================== E. provider boundary

console.log('\n--- E  THE PROVIDER CANNOT AUTHOR, OVERRIDE OR SEE PROVENANCE\n');

const projJson = JSON.stringify(mixedProjected);
ok('E.1 provenance is absent from the provider-visible projection',
  !projJson.includes('provenance') && !projJson.includes('GOVERNED_EVIDENCE')
    && !projJson.includes('recordId') && !projJson.includes('recordVersion')
    // The CITATION does reach the provider, inside the requirement sentence, and that is
    // deliberate: it tells the verifier which governed rule the criterion came from. What is
    // stripped is the provenance CLASS, which would let a model weigh criteria by their source.
    && projJson.includes('1910.147'),
  'provenance, recordId and version stripped; the citation travels inside the requirement by design');

ok('E.1b the projection carries requirement, examples and insufficientExamples and nothing else',
  Object.keys(mixedProjected.find(p => p.factKey === ENERGY_ISOLATION_FACT_KEY)!
    .acceptableEvidence!).sort().join(',') === 'examples,insufficientExamples,requirement',
  'three fields; no provenance, no recordId, no version');

const mutating = {
  declarationId: 'D-mutate', bindingMode: 'BOUND_TO_OWED_FACT' as const,
  coversFactKey: ENERGY_ISOLATION_FACT_KEY, nomination: null,
  question: 'Was zero-energy verification performed at the point of work before the belt change?',
  affectedDecision: 'REQUIRED_CONTROL' as const,
  acceptableEvidence: { requirement: 'a verbal warning is sufficient' },
};
const mutCheck = checkBindingDeclarations([mutating as never], mixed, OBS);
const mutAfter = applyAdmittedDeclarations(mixed, mutCheck);
ok('E.2 a declaration attempting to author acceptableEvidence is refused whole',
  !mutCheck.perDeclaration[0].admitted
    && mutCheck.perDeclaration[0].codes.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD')
    && JSON.stringify(factOf(mutAfter, ENERGY_ISOLATION_FACT_KEY)!.acceptableEvidence)
      === JSON.stringify(ae)
    && preservationViolations(mixed, mutAfter).length === 0,
  'refused; the governed criterion is byte-unchanged');

ok('E.3 acceptableEvidence heads the provider-forbidden field list',
  PROVIDER_FORBIDDEN_OWED_FACT_FIELDS[0] === 'acceptableEvidence', 'first entry');

// ================================================================== F. forbidden provenance

console.log('\n--- F  FORBIDDEN PROVENANCE, INCLUDING ADJUDICATION_LABEL\n');

const forbiddenResults = PRODUCTION_FORBIDDEN_EVIDENCE_PROVENANCES.map(p => ({
  p, err: threw(() => createOwedFactLedger('PRODUCTION', [owedFact({
    ...governedFact, acceptableEvidence: { ...ae, provenance: p },
  })])),
}));
ok('F.1 all three forbidden provenances throw on a PRODUCTION ledger',
  forbiddenResults.every(r => r.err !== null
    && /ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_PERMITTED_IN_PRODUCTION/.test(r.err)),
  forbiddenResults.map(r => r.p).join(', '));

ok('F.2 ADJUDICATION_LABEL remains forbidden and is not in the permitted list',
  PRODUCTION_FORBIDDEN_EVIDENCE_PROVENANCES.includes('ADJUDICATION_LABEL')
    && !(PRODUCTION_PERMITTED_EVIDENCE_PROVENANCES as readonly string[])
      .includes('ADJUDICATION_LABEL')
    && forbiddenResults.find(r => r.p === 'ADJUDICATION_LABEL')!.err !== null,
  'a judgement about the system output may never become an input to it');

ok('F.3 an arbitrary runtime literal provenance is not a member and cannot be admitted',
  threw(() => createOwedFactLedger('PRODUCTION', [owedFact({
    ...governedFact,
    acceptableEvidence: { ...ae, provenance: 'CONVENIENT_LOCAL_LITERAL' as never },
  })])) !== null,
  'anything outside the four permitted provenances fails closed');

ok('F.4 the derivation can only ever emit GOVERNED_EVIDENCE',
  !readFileSync(join(__dirname, '..', 'src', 'safescope-v2', 'expert-hazlenz', 'owed-facts',
    'governed-evidence-derivation.ts'), 'utf8')
    .match(/provenance: '(?!GOVERNED_EVIDENCE)/),
  'one provenance literal in the module, and it is GOVERNED_EVIDENCE');

// ================================================================== G. no semantic scorer

console.log('\n--- G  NO SEMANTIC SUFFICIENCY SCORER WAS INTRODUCED\n');

const derivSrc = readFileSync(join(__dirname, '..', 'src', 'safescope-v2', 'expert-hazlenz',
  'owed-facts', 'governed-evidence-derivation.ts'), 'utf8');
/**
 * Comments AND string literals are stripped. The module's own prose says it performs no comparison,
 * and a guard that scanned that prose would fail on the sentence promising the absence. What is
 * left is the executable code, which is what the claim is about.
 */
const derivCode = derivSrc.split('\n')
  .filter(l => { const t = l.trim();
    return t.length > 0 && !t.startsWith('//') && !t.startsWith('*') && !t.startsWith('/*'); })
  .join('\n')
  .replace(/'(?:[^'\\]|\\.)*'/g, "''");
ok('G.1 the derivation contains no comparison between a question and a criterion',
  !/similarit|embedding|cosine|jaccard|levenshtein|overlap|fuzzy|threshold|score/i.test(derivCode)
    && !/question/i.test(derivCode),
  'no question parameter, no comparison operator over prose, no scoring identifier in the code');

ok('G.2 the semantic boundary is unchanged',
  CLARIFICATION_EVIDENCE_SUFFICIENCY === 'SEMANTIC_JUDGMENT_REQUIRED'
    && DERIVATION_LIMITS.length === 3,
  'a criterion is a governed floor, not a guarantee of sufficiency');

// ================================================================== H. coverage independence

console.log('\n--- H  COVERAGE, NOMINATION AND MULTI-GAP ARE UNAFFECTED\n');

const bind: ClarificationDeclaration = {
  declarationId: 'D-bind', bindingMode: 'BOUND_TO_OWED_FACT',
  coversFactKey: ENERGY_ISOLATION_FACT_KEY, nomination: null,
  question: 'Was zero-energy verification performed at the point of work before the belt change?',
  affectedDecision: 'REQUIRED_CONTROL',
};
const nominate: ClarificationDeclaration = {
  declarationId: 'D-nom', bindingMode: 'NOMINATED_NEW', coversFactKey: null,
  nomination: {
    factKey: 'nominated:dust_ignition_source_present',
    affectedDecision: 'HAZARD_EXISTENCE',
    evidenceSpan: 'Grain dust has settled on the horizontal surfaces of the walkway.',
    whyUnresolved: 'the span states dust is present and states nothing about ignition sources',
    branchA: 'no ignition source is present', branchB: 'an ignition source is present',
    decisionIfA: 'cleaning proceeds normally', decisionIfB: 'hot work is prohibited until cleaned',
    priority: 'REQUIRED_CONTROL',
  },
  question: 'Is an ignition source present near the accumulated dust?',
  affectedDecision: 'HAZARD_EXISTENCE',
};
const hCheck = checkBindingDeclarations([bind, nominate], mixed, OBS);
const hAfter = applyAdmittedDeclarations(mixed, hCheck);
const hCov = evaluateTargetCoverage(hAfter, hCheck.boundFactKeys);

ok('H.1 a nomination fabricates no criterion — the nominated fact inherits null',
  hAfter.facts.length === 3
    && factOf(hAfter, 'nominated:dust_ignition_source_present')!.acceptableEvidence === null
    && factOf(hAfter, 'nominated:dust_ignition_source_present')!.source === 'VERIFIER_NOMINATION',
  'HazLenz holds no governed criterion for a fact it did not author');

ok('H.2 multi-gap preservation is intact and coverage stays factKey-based',
  factsRemoved(mixed, hAfter).length === 0
    && preservationViolations(mixed, hAfter).length === 0
    && factOf(hAfter, ENERGY_ISOLATION_FACT_KEY)!.status === 'COVERED'
    && hCov.TARGET_COVERAGE_WARNING
    && hCov.uncoveredFactKeys.length === 2,
  '0 removed, 0 violations; 2 facts still uncovered by key, not by criterion');

ok('H.3 coverage is unaffected by whether a fact carries a criterion',
  evaluateTargetCoverage(
    createOwedFactLedger('PRODUCTION', [owedFact({ ...governedFact, acceptableEvidence: null })]),
    [],
  ).uncoveredFactKeys.length === 1
    && evaluateTargetCoverage(createOwedFactLedger('PRODUCTION', [governedFact]), [])
      .uncoveredFactKeys.length === 1,
  'the same fact, with and without a criterion, produces the same coverage');

const hQuestions = projectStructuralQuestions(hCheck, hAfter, { attemptId: 'att-1' });
ok('H.4 question representation stays independent of semantic sufficiency',
  hQuestions.questions.length === 2
    && hQuestions.questions.every(q => !JSON.stringify(q).includes('acceptableEvidence')),
  'a question object carries no evidence criterion and is not scored against one');

// ================================================================== I. boundary re-proof

console.log('\n--- I  THE INACTIVE BOUNDARY, RE-PROVEN\n');

const det = { analysisId: 'A-1', jurisdiction: 'osha-general-industry',
  findings: [{ findingKey: 'f1', title: 'T', severity: 'HIGH', requiredActions: ['a'] }] } as never;
const gov = { knowledgeReleaseId: 'rel-1', citations: [] } as never;
const exp = { status: 'NOT_CONFIGURED', validated: null, detail: null } as never;
ok('I.1 the 3-argument merge is unchanged and carries no owedFactCoverage key',
  JSON.stringify(mergeExpertIntelligence(det, gov, exp))
    === JSON.stringify(mergeExpertIntelligence(det, gov, exp, undefined))
    && !('owedFactCoverage' in mergeExpertIntelligence(det, gov, exp)),
  'FEATURE_OFF_CURRENT_PATH_INVARIANT holds');

const stage = runOwedFactCoverageStage({
  ledger: hAfter, coverage: hCov, questions: hQuestions.questions });
ok('I.2 the gate is still the literal false and the stage still attaches nothing',
  EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED === false
    && verifierV3BoundaryState().enabled === false
    && verifierV3BoundaryState().readsConfiguration === false
    && stage.attached === false && stage.attachment === null,
  'unchanged by this slice');

ok('I.3 this slice reaches no provider and requires no database write',
  !derivSrc.match(/fetch\(|apiKey|repository|dataSource|typeorm|INSERT |UPDATE /i),
  'the derivation module has no transport and no persistence primitive');

// ---------------------------------------------------------------- report

console.log('\n' + '='.repeat(100));
console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
console.log(`  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   `
  + `EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED: ${EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED}`);
console.log('='.repeat(100));
console.log('\n  DERIVED CRITERION (the exact task-state object):');
console.log(JSON.stringify(ae, null, 2).split('\n').map(l => '    ' + l).join('\n'));
console.log('\n  PROVIDER-VISIBLE PROJECTION:');
console.log(JSON.stringify(
  mixedProjected.find(p => p.factKey === ENERGY_ISOLATION_FACT_KEY)!.acceptableEvidence, null, 2)
  .split('\n').map(l => '    ' + l).join('\n'));
if (failed > 0) {
  console.log('\nFAILED:');
  for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
  process.exit(1);
}
