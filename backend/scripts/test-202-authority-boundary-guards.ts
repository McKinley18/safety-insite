/**
 * §202 EXPERT HAZLENZ -- AUTHORITY-BOUNDARY GUARD SUITE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOTHING IS WRITTEN OUTSIDE THIS PROCESS.
 *
 * ==================== WHAT THIS SUITE PROVES, AND IN WHICH ORDER ====================
 *
 * For every finding marked `demonstratedByExecution` in `AUTHORITY_BOUNDARY_FINDINGS`, three things
 * in sequence, against the REAL production functions and never against a stub:
 *
 *   .a  TODAY   the unsafe state is ACCEPTED by the boundary that claims to refuse it
 *   .b  GUARD   the guard in expert-202-authority-boundary-guards.ts refuses exactly that state
 *   .c  SAFE    a currently valid flow passes the guard unchanged -- no false rejection
 *
 * The .a cases are written to FAIL LOUDLY IF THE DEFECT IS EVER FIXED. That is deliberate: a
 * red-team reader must be able to tell the difference between "the gap is closed" and "the suite
 * stopped looking". Each .a case names the finding it demonstrates, so a future repair points at
 * the exact assertion to retire.
 *
 * Nothing here adjudicates a §199 semantic question, supplies a product-owner verdict, or decides
 * OwedFact or escalation policy.
 */

import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

// ---- the module under test
import {
  AUTHORITY_BOUNDARY_GUARDS_VERSION, AUTHORITY_BOUNDARY_VIOLATION_CODES,
  AUTHORITY_BOUNDARY_FINDINGS, CALL_SITE_INSERTIONS, FINDING_CATEGORIES,
  FROZEN_NOMINATION_CEILING, PROVIDER_AUTHORED_NOMINATION_PRIORITY,
  authorityBoundaryGuardEffect,
  declaringStageViolations, suppliedCriteriaViolations, owedFactCriterionViolations,
  nominationHazLenzOwnedFieldScan, nestedForbiddenGovernanceFields, nominationCeilingViolations,
  nominationOutcomeViolations, mergeOwedFactCoverageViolations,
  structuralQuestionPriorityViolations,
} from './lib/expert-202-authority-boundary-guards';

// ---- the real production surfaces
import {
  projectDeclaredOwedFacts, DECLARING_STAGES, FIRST_PASS_PROJECTED_PRIORITY,
} from './lib/expert-first-pass-owed-fact-projection';
import {
  type OwedFactLedger,
  owedFact, createOwedFactLedger, transition, factOf, preservationViolations,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  checkBindingDeclarations, applyAdmittedDeclarations, bindingSideEffects,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-binding';
import {
  projectStructuralQuestions, selectQuestionsForBudget,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/structural-questions';
import {
  mergeExpertIntelligence, verifyMergeInvariants,
} from '../src/safescope-v2/expert-hazlenz/expert-authority-merge';
import {
  consumeSettlementClaims,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/settlement-review';
import {
  EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/verifier-v3-development-boundary';
import {
  ACCEPTABLE_EVIDENCE_PROVENANCES, PROVIDER_FORBIDDEN_OWED_FACT_FIELDS,
} from '../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types';

// ================================================================ harness

let passed = 0;
let failed = 0;
function ok(id: string, condition: boolean, detail = ''): void {
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}
const codesOf = (v: readonly { code: string }[]): string[] => v.map(x => x.code);

// ================================================================ shared fixtures

const OBS = 'The guard on the auger was removed and the flame sensor status was not stated.';
const SOURCES = [{ sourceId: 'obs-1', text: OBS }];

const declaration = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  declarationId: 'd1',
  missingFact: 'whether the flame sensor actually shuts the burner',
  observationSourceId: 'obs-1',
  observationSpan: 'the flame sensor status was not stated',
  notEstablishedBecause: 'the observation does not say the sensor was tested',
  affectedDecision: 'REQUIRED_CONTROL',
  branchA: 'the sensor shuts the burner',
  branchB: 'the sensor does not shut the burner',
  decisionIfA: 'no additional control is required',
  decisionIfB: 'an interlock is required before the burner runs again',
  whyNecessaryNow: 'the burner is in service today',
  governedEvidenceSourceIds: [],
  ...over,
});

const deterministicFact = (key = 'owed:securement'): ReturnType<typeof owedFact> => owedFact({
  factKey: key,
  affectedDecision: 'REQUIRED_CONTROL',
  source: 'DETERMINISTIC',
  evidenceSpan: 'The guard on the auger was removed',
  whyUnresolved: 'the observation does not establish that the auger was secured',
  branchA: 'the auger was secured',
  branchB: 'the auger was not secured',
  decisionDivergence: { ifA: 'no additional control', ifB: 'secure before entry' },
  priority: 'LIFE_CRITICAL',
});

const nomination = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  factKey: 'nominated:1',
  affectedDecision: 'REQUIRED_CONTROL',
  evidenceSpan: 'the flame sensor status was not stated',
  whyUnresolved: 'the observation does not establish the sensor shuts the burner',
  branchA: 'the sensor shuts the burner',
  branchB: 'the sensor does not shut the burner',
  decisionIfA: 'no additional control',
  decisionIfB: 'add an interlock',
  priority: 'OTHER',
  ...over,
});

const nominateDecl = (over: Record<string, unknown> = {}): any => ({
  declarationId: 'n1',
  bindingMode: 'NOMINATED_NEW',
  coversFactKey: null,
  nomination: nomination(),
  question: 'was the flame sensor function-tested?',
  affectedDecision: 'REQUIRED_CONTROL',
  ...over,
});

const dev = (facts: ReturnType<typeof owedFact>[]): OwedFactLedger =>
  createOwedFactLedger('DEVELOPMENT', facts);

console.log(`\n§202 AUTHORITY-BOUNDARY GUARDS — ${AUTHORITY_BOUNDARY_GUARDS_VERSION}\n`);

// ================================================================ 0. module hygiene

const GUARD_FILE = join(__dirname, 'lib', 'expert-202-authority-boundary-guards.ts');
const GUARD_SRC = readFileSync(GUARD_FILE, 'utf8');

ok('0.1 the guard module contains no provider transport primitive',
  !/\bfetch\s*\(|https?:\/\/api\.|x-api-key|ANTHROPIC_API_KEY|new\s+XMLHttpRequest/.test(
    GUARD_SRC.split('\n').filter(l => !l.trim().startsWith('*')).join('\n')));
ok('0.2 the guard module contains no database primitive',
  !/\b(createConnection|DataSource|getRepository|query\s*\(|pg\.|typeorm)\b/.test(GUARD_SRC));
ok('0.3 the guard module writes nothing',
  !/writeFileSync|appendFileSync|mkdirSync|openSync|rmSync|unlinkSync/.test(GUARD_SRC));
ok('0.4 authorityBoundaryGuardEffect states the four zeroes',
  JSON.stringify(authorityBoundaryGuardEffect())
    === JSON.stringify({
      providerCalls: 0, databaseOperations: 0, mutatesAnyLedger: false,
      supplies202SemanticVerdict: false, modifiesAnyExistingFile: false,
      containsAnySemanticMatcher: false,
    }));
ok('0.5 every finding names a registered guard or explicitly names none',
  AUTHORITY_BOUNDARY_FINDINGS.every(f => f.guard === null || GUARD_SRC.includes(
    `export function ${f.guard.split(' ')[0]}`)),
  AUTHORITY_BOUNDARY_FINDINGS.filter(f => f.guard !== null).map(f => f.guard!.split(' ')[0]).join(', '));
ok('0.6 every finding carries a category from the closed set',
  AUTHORITY_BOUNDARY_FINDINGS.every(f => (FINDING_CATEGORIES as readonly string[]).includes(f.category)));
ok('0.7 finding ids are unique',
  new Set(AUTHORITY_BOUNDARY_FINDINGS.map(f => f.id)).size === AUTHORITY_BOUNDARY_FINDINGS.length,
  `${AUTHORITY_BOUNDARY_FINDINGS.length} findings`);
ok('0.8 every CALL_SITE_INSERTION names a real finding',
  CALL_SITE_INSERTIONS.every(i => AUTHORITY_BOUNDARY_FINDINGS.some(f => f.id === i.findingId)));
ok('0.9 the violation vocabulary is closed and every code is emitted by some guard',
  AUTHORITY_BOUNDARY_VIOLATION_CODES.every(c => GUARD_SRC.includes(`'${c}'`)),
  `${AUTHORITY_BOUNDARY_VIOLATION_CODES.length} codes`);

// ================================================================ ABF-1  declaring stage

// .a  TODAY: a non-member stage is refused, but by the WRONG mechanism and under the WRONG code.
const stageProjection = projectDeclaredOwedFacts({
  declarations: [declaration()], sources: SOURCES, suppliedGovernedSourceIds: [],
  stage: 'DEVELOPMENT_HUMAN_TRUTH' as never,
});
ok('ABF-1.a TODAY a non-member stage is refused only as COMPUTED_FACT_KEY_MALFORMED, never as a '
  + 'stage-membership fault',
  stageProjection.facts.length === 0
  && stageProjection.perDeclaration[0].codes.includes('COMPUTED_FACT_KEY_MALFORMED')
  && !JSON.stringify(stageProjection.perDeclaration[0].codes).includes('STAGE'),
  JSON.stringify(stageProjection.perDeclaration[0].codes));
ok('ABF-1.a2 the refusal is a key-shape accident: the composed key begins with the empty prefix',
  stageProjection.perDeclaration[0].detail.some(d => d.startsWith('".REQUIRED_CONTROL')),
  JSON.stringify(stageProjection.perDeclaration[0].detail));
// .b  GUARD
ok('ABF-1.b the guard refuses DEVELOPMENT_HUMAN_TRUTH as a stage',
  codesOf(declaringStageViolations('DEVELOPMENT_HUMAN_TRUTH')).join() === 'DECLARING_STAGE_NOT_A_MEMBER');
ok('ABF-1.b2 the guard refuses an unrecognised stage, a number, null and undefined',
  [ 'BOGUS', 7, null, undefined ].every(s => declaringStageViolations(s).length === 1));
// .c  SAFE
ok('ABF-1.c every real DECLARING_STAGES member passes the guard',
  DECLARING_STAGES.every(s => declaringStageViolations(s).length === 0),
  DECLARING_STAGES.join(', '));
const liveStageProjection = projectDeclaredOwedFacts({
  declarations: [declaration()], sources: SOURCES, suppliedGovernedSourceIds: [],
  stage: 'FIRST_PASS_MODEL',
});
ok('ABF-1.c2 the live §197/§199 call shape still projects one fact and the guard is silent',
  liveStageProjection.facts.length === 1
  && liveStageProjection.facts[0].source === 'FIRST_PASS_MODEL'
  && liveStageProjection.facts[0].priority === FIRST_PASS_PROJECTED_PRIORITY
  && declaringStageViolations('FIRST_PASS_MODEL').length === 0,
  liveStageProjection.facts[0]?.factKey);

// ================================================================ ABF-2  criterion provenance

const forbiddenProvenance = { requirement: 'a forged criterion', provenance: 'MODEL_SELF_AUTHORED' };
const nonMemberProvenance = { requirement: 'a forged criterion', provenance: 'NOT_A_MEMBER_AT_ALL' };
const withCriterion = (c: unknown) => projectDeclaredOwedFacts({
  declarations: [declaration({ governedEvidenceSourceIds: ['g1'] })],
  sources: SOURCES, suppliedGovernedSourceIds: ['g1'], stage: 'FIRST_PASS_MODEL',
  acceptableEvidenceBySourceId: { g1: c as never },
});
const p2a = withCriterion(forbiddenProvenance);
const p2b = withCriterion(nonMemberProvenance);
// .a  TODAY
ok('ABF-2.a TODAY a MODEL_SELF_AUTHORED criterion is copied verbatim onto the OwedFact',
  p2a.facts.length === 1
  && JSON.stringify(p2a.facts[0].acceptableEvidence) === JSON.stringify(forbiddenProvenance),
  JSON.stringify(p2a.facts[0]?.acceptableEvidence));
ok('ABF-2.a2 TODAY a provenance that is not a member of the closed set is copied too',
  p2b.facts.length === 1 && p2b.facts[0].acceptableEvidence?.provenance === 'NOT_A_MEMBER_AT_ALL' as never);
ok('ABF-2.a3 TODAY a DEVELOPMENT ledger admits both without a defect',
  dev([...p2a.facts]).facts.length === 1 && dev([...p2b.facts]).facts.length === 1);
ok('ABF-2.a4 the PRODUCTION ledger DOES fail closed on both — the gap is DEVELOPMENT-side only',
  [p2a, p2b].every(p => {
    try { createOwedFactLedger('PRODUCTION', p.facts); return false; }
    catch (e) { return /ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_PERMITTED_IN_PRODUCTION/.test((e as Error).message); }
  }));
// .b  GUARD
ok('ABF-2.b the guard refuses a non-member provenance',
  codesOf(suppliedCriteriaViolations({ g1: nonMemberProvenance as never }))
    .join() === 'ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_A_MEMBER');
ok('ABF-2.b2 the guard refuses a blank requirement under its own code',
  codesOf(suppliedCriteriaViolations({
    g1: { requirement: '   ', provenance: 'GOVERNED_EVIDENCE' } as never,
  })).join() === 'ACCEPTABLE_EVIDENCE_REQUIREMENT_BLANK');
ok('ABF-2.b3 the guard reads the closed set rather than a restated list',
  ACCEPTABLE_EVIDENCE_PROVENANCES.every(p => suppliedCriteriaViolations({
    g1: { requirement: 'r', provenance: p } as never,
  }).length === 0),
  `${ACCEPTABLE_EVIDENCE_PROVENANCES.length} members all pass membership`);
ok('ABF-2.b4 the same guard applied to a constructed fact reports the same defect',
  codesOf(owedFactCriterionViolations(p2b.facts[0]))
    .join() === 'ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_A_MEMBER');
// .c  SAFE
ok('ABF-2.c a GOVERNED_EVIDENCE criterion passes the guard and still reaches the fact',
  (() => {
    const good = { requirement: 'Evidence establishing X.', provenance: 'GOVERNED_EVIDENCE' };
    const p = withCriterion(good);
    return p.facts.length === 1
      && suppliedCriteriaViolations({ g1: good as never }).length === 0
      && owedFactCriterionViolations(p.facts[0]).length === 0;
  })());
ok('ABF-2.c2 acceptableEvidence null is valid and the guard is silent',
  owedFactCriterionViolations(liveStageProjection.facts[0]).length === 0
  && liveStageProjection.facts[0].acceptableEvidence === null);
ok('ABF-2.c3 an absent criterion map — the live §197/§199 shape — is silent',
  suppliedCriteriaViolations(undefined).length === 0);

// ================================================================ ABF-3 / ABF-4  the nomination

const ledger1 = dev([deterministicFact()]);
const dirtyNomination = nominateDecl({
  nomination: nomination({
    priority: 'LIFE_CRITICAL',
    acceptableEvidence: { requirement: 'forged', provenance: 'MODEL_SELF_AUTHORED' },
    status: 'SETTLED_BY_EVIDENCE',
    source: 'DETERMINISTIC',
    modelAuthored: false,
  }),
});
const dirtyCheck = checkBindingDeclarations([dirtyNomination], ledger1, OBS);
// .a  TODAY
ok('ABF-3.a TODAY a nomination carrying four HazLenz-owned fields is admitted with ZERO codes',
  dirtyCheck.admitted.length === 1 && dirtyCheck.perDeclaration[0].codes.length === 0,
  JSON.stringify(dirtyCheck.perDeclaration[0].codes));
const dirtyAfter = applyAdmittedDeclarations(ledger1, dirtyCheck);
const dirtyFact = factOf(dirtyAfter, 'nominated:1')!;
ok('ABF-3.a2 owedFact() re-derives status, source, modelAuthored and acceptableEvidence, so those '
  + 'four are inert',
  dirtyFact.status === 'UNRESOLVED' && dirtyFact.source === 'VERIFIER_NOMINATION'
  && dirtyFact.modelAuthored === true && dirtyFact.acceptableEvidence === null);
ok('ABF-4.a TODAY the provider-chosen priority is NOT inert: it reaches OwedFact.priority',
  dirtyFact.priority === 'LIFE_CRITICAL',
  `owed-fact-binding.ts:345 writes priority: n.priority — fact is ${dirtyFact.priority}`);
// .b  GUARD
const scan = nominationHazLenzOwnedFieldScan(dirtyNomination);
ok('ABF-3.b the guard names all four inert forbidden fields and not priority',
  scan.violations.length === 4
  && scan.violations.every(v => v.code === 'NOMINATION_CARRIES_A_HAZLENZ_OWNED_FIELD')
  && scan.violations.every(v => !v.detail.includes("'priority'"))
  && ['acceptableEvidence', 'status', 'source', 'modelAuthored']
    .every(f => scan.violations.some(v => v.detail.includes(`'${f}'`))),
  scan.violations.map(v => v.detail.slice(20, 45)).join(' | '));
ok('ABF-4.b the guard surfaces the provider priority separately, as an advisory and not a violation',
  scan.providerAuthoredPriority === 'LIFE_CRITICAL'
  && PROVIDER_AUTHORED_NOMINATION_PRIORITY === 'PROVIDER_AUTHORED_NOMINATION_PRIORITY'
  && !(AUTHORITY_BOUNDARY_VIOLATION_CODES as readonly string[])
    .includes(PROVIDER_AUTHORED_NOMINATION_PRIORITY));
ok('ABF-3.b2 the guard reads PROVIDER_FORBIDDEN_OWED_FACT_FIELDS rather than restating it',
  PROVIDER_FORBIDDEN_OWED_FACT_FIELDS.filter(f => f !== 'priority').every(f =>
    nominationHazLenzOwnedFieldScan(nominateDecl({ nomination: nomination({ [f]: 'x' }) }))
      .violations.length === 1),
  `${PROVIDER_FORBIDDEN_OWED_FACT_FIELDS.length - 1} non-priority members each caught`);
// .c  SAFE
const cleanCheck = checkBindingDeclarations([nominateDecl()], ledger1, OBS);
ok('ABF-3.c a well-formed nomination is admitted and the guard reports no violation',
  cleanCheck.admitted.length === 1
  && nominationHazLenzOwnedFieldScan(nominateDecl()).violations.length === 0);
ok('ABF-3.c2 a BOUND declaration carrying no nomination is silent',
  nominationHazLenzOwnedFieldScan({
    declarationId: 'b1', bindingMode: 'BOUND_TO_OWED_FACT', coversFactKey: 'owed:securement',
    nomination: null, question: 'q', affectedDecision: 'REQUIRED_CONTROL',
  } as never).violations.length === 0);
ok('ABF-3.c3 the existing top-level scan still fires on a declaration-level forbidden field, so the '
  + 'guard closes a gap rather than replacing a check',
  checkBindingDeclarations([{
    declarationId: 'b1', bindingMode: 'BOUND_TO_OWED_FACT', coversFactKey: 'owed:securement',
    nomination: null, question: 'q', affectedDecision: 'REQUIRED_CONTROL',
    acceptableEvidence: { requirement: 'forged', provenance: 'MODEL_SELF_AUTHORED' },
  } as never], ledger1, OBS).perDeclaration[0].codes.join() === 'PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD');

// ================================================================ ABF-5  the silent nomination

let terminal = dev([deterministicFact()]);
terminal = transition(terminal, {
  factKey: 'owed:securement', to: 'COVERED', authority: 'ADMITTED_BINDING',
  justification: 'an earlier declaration bound it',
});
const renameAttack = nominateDecl({
  nomination: nomination({ factKey: 'owed:securement' }),
});
const renameCheck = checkBindingDeclarations([renameAttack], terminal, OBS);
const renameAfter = applyAdmittedDeclarations(terminal, renameCheck);
// .a  TODAY
ok('ABF-5.a TODAY a nomination colliding with a COVERED key is ADMITTED — the collision refusal '
  + 'fires only on UNRESOLVED',
  renameCheck.admitted.length === 1 && renameCheck.perDeclaration[0].codes.length === 0
  && renameCheck.nominationCount === 1);
ok('ABF-5.a2 TODAY the nominated fact is silently discarded: addOwedFact returns the ledger '
  + 'unchanged and the pre-existing COVERED fact stands in for it',
  renameAfter.facts.length === terminal.facts.length
  && factOf(renameAfter, 'owed:securement')!.status === 'COVERED'
  && factOf(renameAfter, 'owed:securement')!.evidenceSpan === deterministicFact().evidenceSpan);
ok('ABF-5.a3 TODAY neither existing audit notices: preservationViolations and bindingSideEffects '
  + 'are both empty',
  preservationViolations(terminal, renameAfter).length === 0
  && bindingSideEffects(terminal, renameAfter, renameCheck).length === 0);
// .b  GUARD
ok('ABF-5.b the post-condition guard names the discarded nomination',
  codesOf(nominationOutcomeViolations(terminal, renameAfter, renameCheck))
    .join() === 'ADMITTED_NOMINATION_PRODUCED_NO_FACT');
// .c  SAFE
const goodBefore = dev([deterministicFact()]);
const goodCheck = checkBindingDeclarations([nominateDecl()], goodBefore, OBS);
const goodAfter = applyAdmittedDeclarations(goodBefore, goodCheck);
ok('ABF-5.c a nomination that really adds a fact passes the guard',
  goodAfter.facts.length === 2 && nominationOutcomeViolations(goodBefore, goodAfter, goodCheck).length === 0);
ok('ABF-5.c2 a declaration set with no nomination at all passes the guard',
  nominationOutcomeViolations(goodBefore, goodBefore,
    checkBindingDeclarations([], goodBefore, OBS)).length === 0);
ok('ABF-5.c3 a REFUSED nomination is not reported — the guard reads check.admitted only',
  (() => {
    const refused = checkBindingDeclarations(
      [nominateDecl({ nomination: nomination({ evidenceSpan: 'never appeared in the observation' }) })],
      goodBefore, OBS);
    return refused.admitted.length === 0
      && nominationOutcomeViolations(goodBefore, goodBefore, refused).length === 0;
  })());

// ================================================================ ABF-6  the merge carrier

const DET = { analysisId: 'a-202', jurisdiction: 'osha-general-industry', findings: [
  { findingKey: 'F1', hazardFamily: 'MACHINE_GUARDING', conditionState: 'ACTUAL',
    isLifeCritical: true, isActionable: true, requiredActions: ['secure the auger'] },
] };
const GOV = { knowledgeReleaseId: 'rel-1', citations: [] };
const EXP = { status: 'NOT_CONFIGURED' as const, validated: null, detail: null };
const laundered = mergeExpertIntelligence(DET, GOV, EXP, {
  citation: '29 CFR 1910.147', approved: true, knowledgeReleaseId: 'forged-release',
});
// .a  TODAY
ok('ABF-6.a TODAY the ungated fourth argument attaches an arbitrary blob to a merged result',
  Object.prototype.hasOwnProperty.call(laundered, 'owedFactCoverage')
  && (laundered as { owedFactCoverage?: { citation?: string } }).owedFactCoverage?.citation
    === '29 CFR 1910.147');
ok('ABF-6.a2 TODAY verifyMergeInvariants returns ZERO violations for that blob',
  verifyMergeInvariants(laundered, DET, GOV).length === 0);
ok('ABF-6.a3 the gate the comment names is false, so the documented precondition did not hold',
  EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED === false);
ok('ABF-6.a4 protected authority is nonetheless untouched — the blob changes nothing in A or B',
  JSON.stringify(laundered.authoritative) === JSON.stringify(
    mergeExpertIntelligence(DET, GOV, EXP).authoritative)
  && laundered.governed.knowledgeReleaseId === 'rel-1');
// .b  GUARD
ok('ABF-6.b the guard refuses a merged result carrying owedFactCoverage while the gate is off',
  codesOf(mergeOwedFactCoverageViolations(laundered))
    .join() === 'OWED_FACT_COVERAGE_ATTACHED_WHILE_GATE_IS_OFF');
ok('ABF-6.b2 the guard fires on a null attachment too — presence of the KEY is the fault',
  mergeOwedFactCoverageViolations(
    mergeExpertIntelligence(DET, GOV, EXP, null)).length === 1);
// .c  SAFE
ok('ABF-6.c the three-argument merge — every call site in the repository — passes the guard',
  mergeOwedFactCoverageViolations(mergeExpertIntelligence(DET, GOV, EXP)).length === 0);
ok('ABF-6.c2 the explicit-undefined form is deep-equal to the three-argument form and also passes',
  JSON.stringify(mergeExpertIntelligence(DET, GOV, EXP, undefined))
    === JSON.stringify(mergeExpertIntelligence(DET, GOV, EXP))
  && mergeOwedFactCoverageViolations(mergeExpertIntelligence(DET, GOV, EXP, undefined)).length === 0);

// ================================================================ ABF-7  nested governance fields

const nested = declaration({ extra: { citation: '29 CFR 1910.147', approved: true } });
const nestedProjection = projectDeclaredOwedFacts({
  declarations: [nested], sources: SOURCES, suppliedGovernedSourceIds: [], stage: 'FIRST_PASS_MODEL',
});
// .a  TODAY
ok('ABF-7.a TODAY a declaration nesting citation and approved is admitted with ZERO codes',
  nestedProjection.facts.length === 1 && nestedProjection.perDeclaration[0].codes.length === 0,
  JSON.stringify(nestedProjection.perDeclaration[0].codes));
// .b  GUARD
ok('ABF-7.b the guard finds both nested governance field names',
  (() => {
    const v = nestedForbiddenGovernanceFields(nested);
    return v.length === 2 && v.every(x => x.code === 'NESTED_FORBIDDEN_GOVERNANCE_FIELD')
      && v.some(x => x.detail.includes('$.extra.citation'))
      && v.some(x => x.detail.includes('$.extra.approved'));
  })());
ok('ABF-7.b2 the guard walks arrays as well as objects',
  nestedForbiddenGovernanceFields({ a: [{ b: { cfr: 'x' } }] }).length === 1);
// .c  SAFE
ok('ABF-7.c a well-formed declaration — the live §197/§199 shape — produces no finding',
  nestedForbiddenGovernanceFields(declaration()).length === 0);
ok('ABF-7.c2 a top-level forbidden field is NOT double-reported: depth 0 is left to the existing '
  + 'scan, which already refuses it',
  nestedForbiddenGovernanceFields(declaration({ citation: 'x' })).length === 0
  && projectDeclaredOwedFacts({
    declarations: [declaration({ citation: 'x' })], sources: SOURCES,
    suppliedGovernedSourceIds: [], stage: 'FIRST_PASS_MODEL',
  }).perDeclaration[0].codes.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD'));

// ================================================================ ABF-8  the nomination ceiling

const fiveNominations = [1, 2, 3, 4, 5].map(i => nominateDecl({
  declarationId: `n${i}`, nomination: nomination({ factKey: `nominated:${i}` }),
}));
// .a  TODAY
ok('ABF-8.a TODAY the ceiling holds at the default and is widened by a caller argument',
  checkBindingDeclarations(fiveNominations, dev([deterministicFact()]), OBS).admitted.length === 1
  && checkBindingDeclarations(fiveNominations, dev([deterministicFact()]), OBS, 5).admitted.length === 5);
ok('ABF-8.a2 there is no named ceiling constant in the runtime binding module',
  !readFileSync(join(__dirname, '..', 'src', 'safescope-v2', 'expert-hazlenz', 'owed-facts',
    'owed-fact-binding.ts'), 'utf8').includes('NOMINATION_CEILING'));
// .b  GUARD
ok('ABF-8.b the guard refuses a widened ceiling',
  codesOf(nominationCeilingViolations(5)).join() === 'NOMINATION_CEILING_WIDENED_BY_CALLER');
// .c  SAFE
ok('ABF-8.c the frozen ceiling passes',
  FROZEN_NOMINATION_CEILING === 1 && nominationCeilingViolations(1).length === 0);

// ================================================================ ABF-9  question priority

const escalating = nominateDecl({
  nomination: nomination({ priority: 'LIFE_CRITICAL' }),
});
const escalatingCheck = checkBindingDeclarations([escalating], goodBefore, OBS);
const questions = projectStructuralQuestions(escalatingCheck, goodBefore, {
  nominationWording: { 'nominated:1': 'was the flame sensor function-tested?' },
});
// .a  TODAY
ok('ABF-9.a TODAY a provider-chosen LIFE_CRITICAL reaches StructuralQuestion.priority when the '
  + 'nominated fact is not yet in the ledger',
  questions.questions.length === 1 && questions.questions[0].priority === 'LIFE_CRITICAL',
  'structural-questions.ts:138 — fact?.priority ?? d.nomination?.priority ?? OTHER');
const deterministicQuestion = {
  clarificationKey: 'det:owed:securement',
  bindingFactKey: 'owed:securement',
  question: 'was the auger secured before entry?',
  affectedDecision: 'REQUIRED_CONTROL' as const,
  sourceAttempt: null,
  priority: 'LIFE_CRITICAL' as const,
  presentationStatus: 'SELECTED' as const,
};
const budget = selectQuestionsForBudget(goodBefore,
  [...questions.questions, deterministicQuestion], 1);
ok('ABF-9.a2 TODAY under a budget of 1 the provider-escalated question is SELECTED and the '
  + 'deterministic LIFE_CRITICAL question is SUPPRESSED_BY_BUDGET',
  budget.selected.length === 1 && budget.selected[0].bindingFactKey === 'nominated:1'
  && budget.suppressed.some(q => q.bindingFactKey === 'owed:securement'
    && q.presentationStatus === 'SUPPRESSED_BY_BUDGET'));
ok('ABF-9.a3 UNRESOLVED_SAFETY_STATE is NOT fabricated by this: it is computed from ledger facts',
  budget.UNRESOLVED_SAFETY_STATE === true
  && budget.unresolvedLifeCriticalFactKeys.join() === 'owed:securement');
// .b  GUARD
ok('ABF-9.b the guard names the question whose priority is not ledger-derived',
  codesOf(structuralQuestionPriorityViolations(questions.questions, goodBefore))
    .join() === 'QUESTION_PRIORITY_NOT_LEDGER_DERIVED');
ok('ABF-9.b2 the guard also names a question whose priority disagrees with its ledger fact',
  structuralQuestionPriorityViolations(
    [{ ...deterministicQuestion, priority: 'OTHER' }], goodBefore).length === 1);
// .c  SAFE
ok('ABF-9.c a question whose priority equals its ledger fact passes',
  structuralQuestionPriorityViolations([deterministicQuestion], goodBefore).length === 0);
ok('ABF-9.c2 after the nomination is applied, the ledger-derived priority passes',
  (() => {
    const applied = applyAdmittedDeclarations(goodBefore, escalatingCheck);
    const q2 = projectStructuralQuestions(escalatingCheck, applied, {
      nominationWording: { 'nominated:1': 'was the flame sensor function-tested?' },
    });
    return structuralQuestionPriorityViolations(q2.questions, applied).length === 0;
  })());
ok('ABF-9.c3 a NO_WORDING_AVAILABLE question at OTHER, off the ledger, is silent',
  structuralQuestionPriorityViolations(
    [{ ...deterministicQuestion, bindingFactKey: 'absent:key', priority: 'OTHER',
      question: null, presentationStatus: 'NO_WORDING_AVAILABLE' }], goodBefore).length === 0);

// ================================================================ ABF-10  citation blind spots

// Reported, never repaired. This case exists so the blind spot is a measured fact rather than a
// remembered one, and so a future broadening is visible as a change to THIS assertion.
const CITATION_FORMS: Array<[string, boolean]> = [
  ['29 CFR 1910.147', true],
  ['29 C.F.R. 1910.147', false],
  ['1910.147', false],
  ['§ 1910.147', false],
  ['1926.501(b)(1)', false],
];
ok('ABF-10.a MEASURED: only the literal "NN CFR NNNN" form is refused; four real citation forms are '
  + 'admitted. NOT repaired — broadening the pattern is semantic inference',
  CITATION_FORMS.every(([form, shouldRefuse]) => {
    const p = projectDeclaredOwedFacts({
      declarations: [declaration({ notEstablishedBecause: `the record for ${form} was not produced` })],
      sources: SOURCES, suppliedGovernedSourceIds: [], stage: 'FIRST_PASS_MODEL',
    });
    const refused = p.perDeclaration[0].codes.includes('PROHIBITED_REGULATORY_CITATION');
    return refused === shouldRefuse;
  }),
  CITATION_FORMS.map(([f, r]) => `${f}${r ? '=refused' : '=admitted'}`).join('  '));
// The guard module must contain NO pattern matching at all. Citation strings appear inside the
// FINDINGS table as prose describing the defect; the check below is about executable behaviour, so
// it looks for the operations a matcher needs rather than for the words a description uses.
ok('ABF-10.b the guard module performs no pattern matching of any kind — no regexp literal is '
  + 'executed, and there is no test/exec/match/search/RegExp anywhere in it',
  !/\.test\(|\.exec\(|\.match\(|\.matchAll\(|\.search\(|new RegExp|\.replace\(\s*\//.test(GUARD_SRC));
ok('ABF-10.b2 every membership decision in the guard module reads an IMPORTED closed set',
  (() => {
    const importBlock = GUARD_SRC.slice(0, GUARD_SRC.indexOf('export const AUTHORITY_BOUNDARY_GUARDS_VERSION'));
    return ['DECLARING_STAGES', 'ACCEPTABLE_EVIDENCE_PROVENANCES',
      'PROVIDER_FORBIDDEN_OWED_FACT_FIELDS', 'FORBIDDEN_EXPERT_FIELD_NAMES', 'OWED_FACT_PRIORITIES']
      .every(c => importBlock.includes(c)
        // and the module never redeclares it
        && !GUARD_SRC.includes(`export const ${c}`) && !GUARD_SRC.includes(`const ${c} =`));
  })(),
  'imported, not restated');

// ================================================================ HIGH-2  runtime reachability

// The §201 register records the settlement boundary as unreachable because the only wired producer
// is TYPE-incompatible with the consumer. Verified here at RUNTIME, which is a different fact.
const settlementLedger = dev([deterministicFact()]);
const v3ShapedRequest = {
  factKey: 'owed:securement', requestedBy: 'VERIFIER_V3', reason: 'the observation settles it',
  settles: false, factStatusUnchanged: true,
};
const consumed = consumeSettlementClaims([v3ShapedRequest as never], settlementLedger, 'a-202');
ok('HIGH-2.a the incompatibility is COMPILE-TIME ONLY: at runtime consumeSettlementClaims accepts a '
  + "requestedBy: 'VERIFIER_V3' request and produces a claim",
  consumed.claims.length === 1 && consumed.refused.length === 0
  && consumed.claims[0].claimOrigin === 'CHALLENGE_FACT_VALIDITY');
ok('HIGH-2.b the structural sanity check that DOES exist still fires on a forged settles: true',
  consumeSettlementClaims(
    [{ ...v3ShapedRequest, settles: true } as never], settlementLedger, 'a-202')
    .refused[0].codes.join() === 'CLAIM_DOES_NOT_SETTLE_BY_ITS_OWN_TYPE');
ok('HIGH-2.c consuming claims never moves a fact — ledgerUnchanged is the literal true',
  consumed.ledgerUnchanged === true
  && factOf(settlementLedger, 'owed:securement')!.status === 'UNRESOLVED');

// ================================================================ HIGH-1  the two implementations

const RUNTIME_TYPES = readFileSync(join(__dirname, '..', 'src', 'safescope-v2', 'expert-hazlenz',
  'owed-facts', 'owed-fact.types.ts'), 'utf8');
const PROTOTYPE = readFileSync(join(__dirname, 'lib', 'expert-owed-facts.ts'), 'utf8');
const PROTOTYPE_BINDING = readFileSync(join(__dirname, 'lib', 'expert-owed-fact-binding.ts'), 'utf8');
ok('HIGH-1.a the two contract versions differ',
  RUNTIME_TYPES.includes("'hazlenz.expert.owed-facts.runtime.v1'")
  && PROTOTYPE.includes("'hazlenz.expert.owed-facts.v1'")
  && !PROTOTYPE.includes('runtime.v1'));
ok('HIGH-1.b the prototype has no AcceptableEvidence, no nullable whyUnresolved and no '
  + 'whyUnresolvedAtTransition',
  !PROTOTYPE.includes('AcceptableEvidence')
  && PROTOTYPE.includes('readonly whyUnresolved: string;')
  && !PROTOTYPE.includes('whyUnresolvedAtTransition')
  && RUNTIME_TYPES.includes('whyUnresolvedAtTransition'));
ok('HIGH-1.c the prototype binding has NO forbidden-field scan; the runtime one does',
  !PROTOTYPE_BINDING.includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD')
  && readFileSync(join(__dirname, '..', 'src', 'safescope-v2', 'expert-hazlenz', 'owed-facts',
    'owed-fact-binding.ts'), 'utf8').includes('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD'));
// HIGH-1.e is the consequence, measured rather than inferred: the SAME declaration that the runtime
// refuses at ABF-3.c3 is admitted with zero codes on the prototype path.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PROTO = require('./lib/expert-owed-facts');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PROTO_BIND = require('./lib/expert-owed-fact-binding');
ok('HIGH-1.e MEASURED: a declaration carrying acceptableEvidence and status is REFUSED by the '
  + 'runtime binding boundary and ADMITTED with zero codes by the prototype',
  (() => {
    const pf = PROTO.owedFact({
      factKey: 'owed:securement', affectedDecision: 'REQUIRED_CONTROL', source: 'DETERMINISTIC',
      evidenceSpan: 'The guard on the auger was removed', whyUnresolved: 'not established',
      branchA: 'a', branchB: 'b', decisionDivergence: { ifA: 'x', ifB: 'y' },
      priority: 'LIFE_CRITICAL',
    });
    const pl = PROTO.createOwedFactLedger('DEVELOPMENT', [pf]);
    const dirty = {
      declarationId: 'b1', bindingMode: 'BOUND_TO_OWED_FACT', coversFactKey: 'owed:securement',
      nomination: null, question: 'q', affectedDecision: 'REQUIRED_CONTROL',
      acceptableEvidence: { requirement: 'forged', provenance: 'MODEL_SELF_AUTHORED' },
      status: 'SETTLED_BY_EVIDENCE',
    };
    const protoCheck = PROTO_BIND.checkBindingDeclarations([dirty], pl, OBS);
    const runtimeCheck = checkBindingDeclarations([dirty as never], dev([deterministicFact()]), OBS);
    return protoCheck.perDeclaration[0].codes.length === 0 && protoCheck.admitted.length === 1
      && runtimeCheck.admitted.length === 0
      && runtimeCheck.perDeclaration[0].codes.length > 0
      && runtimeCheck.perDeclaration[0].codes
        .every(c => c === 'PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD');
  })(),
  'the two halves of one chain disagree about whether that declaration is legal');
ok('HIGH-1.d COVERAGE_DECISION_FORBIDDEN_INPUTS survives only on the prototype',
  PROTOTYPE_BINDING.includes('COVERAGE_DECISION_FORBIDDEN_INPUTS')
  && !readFileSync(join(__dirname, '..', 'src', 'safescope-v2', 'expert-hazlenz', 'owed-facts',
    'owed-fact-binding.ts'), 'utf8').includes('COVERAGE_DECISION_FORBIDDEN_INPUTS'));

// ================================================================ the §187 pin, recomputed

const PIN = JSON.parse(readFileSync(join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-required-structured-verifier-validation-2026-09-05', 'PREREGISTRATION.json'),
'utf8')).owedFactSourceHashes as Record<string, string>;
const OWED = join(__dirname, '..', 'src', 'safescope-v2', 'expert-hazlenz', 'owed-facts');
const shaFile = (p: string): string =>
  createHash('sha256').update(readFileSync(p, 'utf8'), 'utf8').digest('hex');
for (const [file, expected] of Object.entries(PIN)) {
  ok(`PIN.${file} is unchanged by §202`, shaFile(join(OWED, file)) === expected,
    shaFile(join(OWED, file)).slice(0, 16));
}
ok('PIN.count four owed-facts files are pinned, and every category-A fix whose narrowest boundary '
  + 'is one of them is therefore withheld pending a re-pin authorization',
  Object.keys(PIN).length === 4,
  Object.keys(PIN).join(', '));

// ================================================================ summary

const byCategory = FINDING_CATEGORIES.map(c =>
  `${c.split('_')[0]}=${AUTHORITY_BOUNDARY_FINDINGS.filter(f => f.category === c).length}`);
console.log(`\nfindings by category: ${byCategory.join('  ')}`);
console.log(`call-site insertions recorded (NONE applied): ${CALL_SITE_INSERTIONS.length}`);
console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
