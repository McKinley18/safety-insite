/**
 * L3-2i -- OFFLINE SUITE. No network, no database, no model.
 *
 * WHAT IT PINS
 *   A. the CANDIDATE-INDEPENDENT clarification carrier -- a zero-candidate INSUFFICIENT_EVIDENCE
 *      proposal can carry the decision-critical clarification it owes (blueprint §39.5.1, D-56);
 *   B. the DECISION-BOUNDARY gate -- the carrier is refused wherever a decision was actually made,
 *      which is §34.2's L3-INV-06 rule applied at the proposal level rather than re-invented;
 *   C. the carrier confers NO AUTHORITY -- it cannot create a hazard, a state, a standard, a
 *      corrective action or any governed/regulatory field;
 *   D. BACKWARD COMPATIBILITY -- every pre-L3-2i proposal validates exactly as before, and the
 *      candidate-borne clarification path is unmoved;
 *   E. CONTAINMENT -- the shipped system prompt is byte-unchanged, so the locked L3-2g/L3-2h
 *      comparison instrument's inputs are unchanged, and Level 3 stays off the customer path.
 *
 * ASSERTIONS ARE BOUND TO GUARANTEES, NOT TO LITERALS (§35.7, §36.9). Nothing here asserts a
 * particular sentence exists; it asserts the behaviour the contract exists to produce.
 *
 * Run: npx ts-node scripts/test-l32i-clarification-carrier.ts
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import {
  REASONING_PROPOSAL_CONTRACT_VERSION,
  L3_UNDECIDED_STATES,
  type ClarificationDecision, type HazardCandidate, type ReasoningInput, type ReasoningProposal,
} from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';
import { validateReasoningProposal } from '../src/safescope-v2/reasoning-l3/deterministic-safety-validator';
import { NON_BLOCKING_VALIDATION_REASONS } from '../src/safescope-v2/reasoning-l3/validation-result.types';
import { buildReasoningInput } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import {
  L3_CARRIER_DECLARATION_ANCHOR, L3_SYSTEM_PROMPT, bindProposal,
} from '../src/safescope-v2/reasoning-l3/reasoning-prompt';
import { L3_VALIDATOR_VERSION } from '../src/safescope-v2/reasoning-l3/validated-reasoning.types';

let passed = 0;
const failures: string[] = [];
function ok(cond: boolean, label: string): void {
  if (cond) passed += 1; else failures.push(label);
}

// =====================================================================================
// FIXTURES. B10's text, because it is one of the two scenarios the entry contract names.
// =====================================================================================

const OBSERVATION = 'The rail on the platform did not look right to me.';
const FAMILIES = ['walking_working_surfaces', 'falls', 'machine_guarding'];

function mkInput(): ReasoningInput {
  return buildReasoningInput({
    analysisId: 'l32i-fixture',
    observationText: OBSERVATION,
    regulatoryContext: { value: 'osha-general-industry', provenance: 'USER_CONFIRMED' },
    allowedHazardFamilies: FAMILIES,
  }).input;
}

const GOOD_CLARIFICATION: ClarificationDecision = {
  unresolvedFact: 'whether the platform rail is structurally deficient or merely visually unfamiliar',
  affectedDecision: 'hazard_identity',
  branches: ['the rail is damaged or loose', 'the rail is sound'],
  question: 'What specifically about the rail looked wrong -- is it loose, bent, or missing a section?',
};

function proposal(over: Partial<ReasoningProposal>): ReasoningProposal {
  return {
    contractVersion: REASONING_PROPOSAL_CONTRACT_VERSION,
    analysisId: 'l32i-fixture',
    outcome: 'INSUFFICIENT_EVIDENCE',
    observationInterpretation: 'the observation reports an impression about a platform rail',
    hazardCandidates: [],
    jurisdictionProposal: null,
    ...over,
  };
}

function activeCandidate(): HazardCandidate {
  // The source id is read from the built input rather than assumed -- the builder names it, and a
  // fixture that hard-codes its own assumption tests the fixture (blueprint D-48).
  const src = mkInput().authoritativeSources[0];
  const span = 'The rail on the platform';
  const start = src.text.indexOf(span);
  return {
    candidateKey: 'c1',
    hazardFamily: 'walking_working_surfaces',
    conditionState: 'ACTIVE',
    evidence: [{
      sourceId: src.sourceId, sourceType: 'observation',
      startOffset: start, endOffset: start + span.length,
      quotedText: span,
    }],
    conditionRationale: 'r', independentHazardRationale: 'r', uncertainties: [],
    clarification: null, correctiveActionIntent: null, riskFactors: null,
  };
}

// =====================================================================================
// A. THE DEFECT §39.5.1 RECORDED, CLOSED
// =====================================================================================
{
  const input = mkInput();

  // A1 -- THE HEADLINE. Zero candidates, INSUFFICIENT_EVIDENCE, clarification still carried.
  const r = validateReasoningProposal(
    proposal({ unresolvedDecisions: [GOOD_CLARIFICATION] }), input);
  ok(r.state === 'VALID', 'A1 zero-candidate INSUFFICIENT_EVIDENCE with a clarification is VALID');
  ok(r.validated !== null && r.validated.hazards.length === 0,
    'A2 it is validated with ZERO hazards -- no candidate was invented to carry the question');
  ok(r.validated !== null && r.validated.unresolvedDecisions.length === 1,
    'A3 the clarification SURVIVES validation and is readable off the validated result');
  ok(r.validated !== null
    && r.validated.unresolvedDecisions[0].question === GOOD_CLARIFICATION.question
    && r.validated.unresolvedDecisions[0].unresolvedFact === GOOD_CLARIFICATION.unresolvedFact,
    'A4 it survives VERBATIM -- the validator does not rewrite the question');

  // A5 -- the pre-L3-2i behaviour, i.e. the defect itself, still measurable.
  const lost = validateReasoningProposal(proposal({}), input);
  ok(lost.state === 'VALID' && lost.validated !== null && lost.validated.unresolvedDecisions.length === 0,
    'A5 the same proposal WITHOUT the carrier validates and owes nothing -- the defect, reproduced');

  // A6 -- the array is always present, so a consumer never distinguishes absent from none-owed.
  ok(Array.isArray(lost.validated?.unresolvedDecisions),
    'A6 unresolvedDecisions is ALWAYS an array on a validated result, empty when none owed');
}

// =====================================================================================
// B. THE DECISION-BOUNDARY GATE (§34.2 / L3-INV-06, lifted to the proposal)
// =====================================================================================
{
  const input = mkInput();

  for (const outcome of ['ANALYZED', 'NO_HAZARD_ESTABLISHED', 'ANALYSIS_UNAVAILABLE'] as const) {
    const p = proposal({
      outcome,
      hazardCandidates: outcome === 'ANALYZED' ? [activeCandidate()] : [],
      unresolvedDecisions: [GOOD_CLARIFICATION],
    });
    const r = validateReasoningProposal(p, input);
    ok(r.issues.some(i => i.code === 'UNRESOLVED_DECISION_NOT_DECISION_CRITICAL'),
      `B1.${outcome} a proposal-level question on a DECIDED outcome is refused as not decision-critical`);
    ok(r.validated === null || r.validated.unresolvedDecisions.length === 0,
      `B1b.${outcome} ...and the refused question does not reach the validated result`);
  }

  // B2 -- the refusal is about the OUTCOME, not about candidates existing. INSUFFICIENT_EVIDENCE
  // with candidates present is still an open decision and still accepts the carrier.
  const withCands = proposal({
    outcome: 'INSUFFICIENT_EVIDENCE',
    hazardCandidates: [{ ...activeCandidate(), conditionState: 'INSUFFICIENT_EVIDENCE' }],
    unresolvedDecisions: [GOOD_CLARIFICATION],
  });
  const rc = validateReasoningProposal(withCands, input);
  ok(rc.state === 'VALID' && rc.validated?.unresolvedDecisions.length === 1,
    'B2 the gate keys on the OUTCOME, not on candidate count -- candidates present is still valid');

  // B3 -- an empty array is not a claim, so it is never refused anywhere.
  const emptyOnDecided = validateReasoningProposal(
    proposal({ outcome: 'ANALYZED', hazardCandidates: [activeCandidate()], unresolvedDecisions: [] }), input);
  ok(emptyOnDecided.state === 'VALID',
    'B3 an EMPTY carrier asserts nothing and is accepted on a decided outcome');

  // ---- B4..B7. THE MEASURED GAP. `C-CS-05` returns outcome INSUFFICIENT_EVIDENCE with one
  // HYPOTHETICAL candidate: the outcome says undecided, every candidate says decided. An
  // outcome-only gate let an unnecessary question through on a MUST-NOT-ASK scenario.
  for (const decided of ['HYPOTHETICAL', 'ACTIVE', 'CONTROLLED', 'CORRECTED', 'NEGATED', 'REMOVED_FROM_SERVICE'] as const) {
    const p = proposal({
      outcome: 'INSUFFICIENT_EVIDENCE',
      hazardCandidates: [{ ...activeCandidate(), conditionState: decided }],
      unresolvedDecisions: [GOOD_CLARIFICATION],
    });
    const r = validateReasoningProposal(p, input);
    ok(r.issues.some(i => i.code === 'UNRESOLVED_DECISION_NOT_DECISION_CRITICAL'),
      `B4.${decided} INSUFFICIENT_EVIDENCE whose every candidate is DECIDED leaves nothing open -- refused`);
    ok(r.state === 'VALID' && r.validated !== null
      && r.validated.unresolvedDecisions.length === 0 && r.validated.hazards.length === 1,
      `B4b.${decided} ...and the question is DROPPED while the candidate SURVIVES intact (§34.2)`);
  }

  // B5 -- one undecided candidate is enough to keep a decision open.
  const mixed = proposal({
    outcome: 'INSUFFICIENT_EVIDENCE',
    hazardCandidates: [
      { ...activeCandidate(), candidateKey: 'c1', conditionState: 'HYPOTHETICAL' },
      { ...activeCandidate(), candidateKey: 'c2', conditionState: 'UNKNOWN', evidence: [] },
    ],
    unresolvedDecisions: [GOOD_CLARIFICATION],
  });
  ok(validateReasoningProposal(mixed, input).state === 'VALID',
    'B5 ONE undecided candidate keeps the boundary open -- the carrier is accepted');

  // B6 -- the zero-candidate case, which is what the carrier exists for, is never caught by B4.
  ok(validateReasoningProposal(proposal({ unresolvedDecisions: [GOOD_CLARIFICATION] }), input).state === 'VALID',
    'B6 zero candidates is still accepted -- nothing else could carry the question');

  // B7 -- the validator and the semantic binder read the SAME undecided vocabulary, so the
  // proposal-level and candidate-level rules cannot drift apart (§32.5's closed-list lesson).
  ok(L3_UNDECIDED_STATES.length === 2
    && L3_UNDECIDED_STATES.includes('INSUFFICIENT_EVIDENCE') && L3_UNDECIDED_STATES.includes('UNKNOWN'),
    'B7 "the decision was not made" has exactly ONE definition, shared by both layers');
  const binderSrc = readFileSync(
    join(__dirname, '..', 'src', 'safescope-v2', 'reasoning-l3', 'semantic-evidence-binding.ts'), 'utf8');
  ok(binderSrc.includes('L3_UNDECIDED_STATES'),
    'B8 the semantic binder consumes that one definition rather than a second copy');
}

// =====================================================================================
// C. MALFORMED / UNSUPPORTED QUESTIONS ARE REFUSED
// =====================================================================================
{
  const input = mkInput();
  const bad: Array<[string, any]> = [
    ['no unresolvedFact', { ...GOOD_CLARIFICATION, unresolvedFact: '' }],
    ['whitespace-only fact', { ...GOOD_CLARIFICATION, unresolvedFact: '   ' }],
    ['no question', { ...GOOD_CLARIFICATION, question: '' }],
    ['unknown affectedDecision', { ...GOOD_CLARIFICATION, affectedDecision: 'whatever' }],
    ['one branch', { ...GOOD_CLARIFICATION, branches: ['only one'] }],
    ['empty branch string', { ...GOOD_CLARIFICATION, branches: ['a', ''] }],
    ['branches not an array', { ...GOOD_CLARIFICATION, branches: 'a,b' }],
  ];
  for (const [label, entry] of bad) {
    const r = validateReasoningProposal(proposal({ unresolvedDecisions: [entry] }), input);
    ok(r.issues.some(i => i.code === 'UNRESOLVED_DECISION_MALFORMED')
      && (r.validated?.unresolvedDecisions.length ?? 0) === 0,
      `C1.${label} is refused as malformed and never reaches the validated result`);
  }
  const notArray = validateReasoningProposal(proposal({ unresolvedDecisions: 'ask something' as any }), input);
  ok(notArray.issues.some(i => i.code === 'UNRESOLVED_DECISION_MALFORMED')
    && (notArray.validated?.unresolvedDecisions.length ?? 0) === 0,
    'C2 free-form prose in place of the typed array is refused -- prose acquires no authority');

  // C3 -- ONE malformed entry does not discard the good ones beside it.
  const mixedBatch = validateReasoningProposal(proposal({
    unresolvedDecisions: [GOOD_CLARIFICATION, { ...GOOD_CLARIFICATION, branches: [] } as any],
  }), input);
  ok(mixedBatch.validated?.unresolvedDecisions.length === 1
    && mixedBatch.issues.some(i => i.code === 'UNRESOLVED_DECISION_MALFORMED'),
    'C3 a malformed entry is dropped individually; the well-formed question beside it survives');

  // C4 -- A REFUSED QUESTION IS NEVER FATAL. §34.2: it never touches the hazard.
  ok(notArray.state === 'VALID',
    'C4 a refused carrier does NOT invalidate the proposal -- a question is not the hazard (§34.2)');
  const both = validateReasoningProposal(proposal({
    outcome: 'ANALYZED', hazardCandidates: [activeCandidate()],
    unresolvedDecisions: [{ question: 'why?' } as any],
  }), input);
  ok(both.state === 'VALID' && both.validated?.hazards.length === 1
    && both.validated.unresolvedDecisions.length === 0,
    'C5 a bad question beside a good hazard loses the question and keeps the hazard');

  // C6 -- and the non-blocking set contains ONLY the two codes L3-2i introduced.
  ok(NON_BLOCKING_VALIDATION_REASONS.length === 2
    && NON_BLOCKING_VALIDATION_REASONS.every(c => c.startsWith('UNRESOLVED_DECISION_')),
    'C6 no PRE-EXISTING validation reason had its fatality changed by L3-2i');
}

// =====================================================================================
// D. THE CARRIER CONFERS NO AUTHORITY
// =====================================================================================
{
  const input = mkInput();

  // D1 -- it cannot smuggle governed or regulatory state past the structural sweep.
  for (const [label, poison] of [
    ['citation', { citation: '29 CFR 1910.23' }],
    ['standardText', { standardText: 'Guarding of floor openings...' }],
    ['knowledgeReleaseId', { knowledgeReleaseId: 'federal-core-2026-07-30.1' }],
    ['backingStatus', { backingStatus: 'APPROVED_GOVERNED_CONTENT' }],
  ] as Array<[string, Record<string, unknown>]>) {
    const r = validateReasoningProposal(
      proposal({ unresolvedDecisions: [{ ...GOOD_CLARIFICATION, ...poison } as any] }), input);
    ok(r.state === 'REJECTED_MODEL_OUTPUT' && r.issues.some(i =>
      ['GOVERNANCE_FIELD_NOT_PERMITTED', 'REGULATORY_TEXT_NOT_PERMITTED', 'INVENTED_REGULATORY_CANDIDATE']
        .includes(i.code)),
      `D1.${label} the structural sweep reaches INSIDE the carrier`);
  }

  // D2 -- the validated result carries no hazard, so nothing downstream can read an exposure from it.
  const r = validateReasoningProposal(proposal({ unresolvedDecisions: [GOOD_CLARIFICATION] }), input);
  ok(r.validated !== null && r.validated.outcome === 'INSUFFICIENT_EVIDENCE'
    && r.validated.hazards.length === 0,
    'D2 a carried clarification never manufactures a hazard or an ACTIVE state');

  // D3 -- the carrier's own type has no field that could assert anything.
  const keys = Object.keys(r.validated!.unresolvedDecisions[0]).sort();
  ok(JSON.stringify(keys) === JSON.stringify(['affectedDecision', 'branches', 'question', 'unresolvedFact']),
    'D3 the carrier is a QUESTION and nothing else -- four fields, none of them an assertion');
}

// =====================================================================================
// E. BACKWARD COMPATIBILITY AND THE PROVIDER BOUNDARY
// =====================================================================================
{
  const input = mkInput();

  // E1 -- the candidate-borne clarification path is unmoved.
  const cand: HazardCandidate = {
    ...activeCandidate(), conditionState: 'INSUFFICIENT_EVIDENCE', clarification: GOOD_CLARIFICATION,
  };
  const r = validateReasoningProposal(
    proposal({ outcome: 'ANALYZED', hazardCandidates: [cand] }), input);
  ok(r.state === 'VALID' && r.validated?.hazards[0].clarification?.question === GOOD_CLARIFICATION.question,
    'E1 the candidate-borne clarification still validates and still round-trips');

  // E1b -- THE REJECT-PATH ASYMMETRY, asserted rather than assumed. The candidate predicate is
  // deliberately the HISTORICAL one: failing it deletes a HAZARD, so it must not be tightened here
  // (§35.1). The proposal-level predicate can be strict because refusing it drops only a question.
  const loose: any = { ...GOOD_CLARIFICATION, unresolvedFact: '   ', branches: ['a', ''] };
  const candLoose = validateReasoningProposal(
    proposal({ outcome: 'ANALYZED', hazardCandidates: [{ ...activeCandidate(), conditionState: 'INSUFFICIENT_EVIDENCE', clarification: loose }] }), input);
  ok(candLoose.state === 'VALID' && candLoose.validated?.hazards.length === 1,
    'E1b a loosely-shaped CANDIDATE clarification does NOT delete its hazard -- historical predicate preserved');
  const propLoose = validateReasoningProposal(proposal({ unresolvedDecisions: [loose] }), input);
  ok(propLoose.issues.some(i => i.code === 'UNRESOLVED_DECISION_MALFORMED'),
    'E1c ...while the PROPOSAL-level carrier applies the strict test, because it risks only a question');

  // E2 -- the contract version is NOT bumped: the field is additive and optional.
  ok(REASONING_PROPOSAL_CONTRACT_VERSION === 'hazlenz.l3.proposal.v1',
    'E2 the proposal contract version is unbumped -- every frozen L3-2..L3-2h artifact stays readable');
  ok(L3_VALIDATOR_VERSION.endsWith('.v2'),
    'E3 the VALIDATOR version advances, because the validation surface did change');

  // E4 -- the provider boundary carries the field through UNREPAIRED.
  const bound = bindProposal({
    outcome: 'INSUFFICIENT_EVIDENCE', observationInterpretation: 'x', hazardCandidates: [],
    unresolvedDecisions: [GOOD_CLARIFICATION],
  }, input);
  ok(bound.proposal.unresolvedDecisions?.length === 1
    && bound.proposal.unresolvedDecisions[0].question === GOOD_CLARIFICATION.question,
    'E4 bindProposal carries the carrier across the normalized provider boundary, verbatim');

  const boundBad = bindProposal({
    outcome: 'INSUFFICIENT_EVIDENCE', observationInterpretation: 'x', hazardCandidates: [],
    unresolvedDecisions: [{ question: 'why?' }],
  }, input);
  ok(boundBad.proposal.unresolvedDecisions?.length === 1,
    'E5 binding performs NO repair -- a malformed entry reaches the validator to be refused there');
  const refusedByValidator = validateReasoningProposal(boundBad.proposal, input);
  ok(refusedByValidator.issues.some(i => i.code === 'UNRESOLVED_DECISION_MALFORMED')
    && (refusedByValidator.validated?.unresolvedDecisions.length ?? 0) === 0,
    'E6 ...and the VALIDATOR, not the binder, is what refuses it -- by dropping it, not by failing');

  // E7 -- a pre-L3-2i raw answer binds to a proposal with the key ABSENT, not present-and-empty.
  const legacy = bindProposal({
    outcome: 'INSUFFICIENT_EVIDENCE', observationInterpretation: 'x', hazardCandidates: [],
  }, input);
  ok(!('unresolvedDecisions' in legacy.proposal),
    'E7 a pre-L3-2i provider answer binds byte-identically -- the key is absent, not defaulted');
}

// =====================================================================================
// F. CONTAINMENT -- the locked instrument and the customer path
// =====================================================================================
{
  const src = join(__dirname, '..', 'src', 'safescope-v2', 'reasoning-l3');

  // F1 -- THE LOCKED HARNESS'S INPUT. L3-2h's comparison rests on this exact prompt.
  //
  // L3-2j declared the carrier here, measured it over the FULL diagnostic corpus, and REMOVED it
  // again on evidence (blueprint section 41): the locked instrument's own baseline variant moved on
  // 11 of 24 scenarios and lost two high-consequence cases. So this pin holds the v6 value not
  // because no phase has been allowed to change the prompt, but because the one that was allowed to
  // measured the change and put it back.
  const promptHash = createHash('sha256').update(L3_SYSTEM_PROMPT).digest('hex');
  ok(promptHash === 'b8cc50fce71950db0188103c352fde0243938d9210e2a219341b9255d9bcbacf',
    'F1 the shipped system prompt is BYTE-UNCHANGED (locked L3-2h instrument input)');

  // F2 -- the locked harness and its scorers, other than the corrected clarification denominator.
  const harness = readFileSync(join(__dirname, 'ablate-l32g-state-separation.ts'), 'utf8');
  ok(createHash('sha256').update(harness).digest('hex')
    === '73f74131b4f8cbb31ad57ba972e1e0edbcaaa275d27558866d8bc2a4e71c6521',
    'F2 the locked L3-2g/L3-2h ablation harness is byte-unchanged');

  // F3 -- Level 3 remains off the customer path.
  const { execSync } = require('child_process');
  const importers = execSync(
    `grep -rl "reasoning-l3" ${join(__dirname, '..', 'src')} || true`, { encoding: 'utf8' },
  ).split('\n').map((s: string) => s.trim()).filter(Boolean);
  ok(importers.every((p: string) => p.includes('reasoning-l3')),
    'F3 nothing outside reasoning-l3 imports it -- CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE');

  // F4 -- the carrier reaches no persistence, reporting or governed-content surface.
  const validator = readFileSync(join(src, 'deterministic-safety-validator.ts'), 'utf8');
  ok(!/@Injectable|@Entity|@InjectRepository/.test(validator),
    'F4 the validator carries no Nest or TypeORM decorator');
}

// =====================================================================================

console.log(`\nL3-2i candidate-independent clarification carrier: ${passed} assertions passed, ${failures.length} failed`);
for (const f of failures) console.log(`  FAILED  ${f}`);
process.exit(failures.length ? 1 : 0);
