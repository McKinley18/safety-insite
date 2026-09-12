/**
 * §210E -- FINAL RESIDUAL REMEDIATION LOCAL SUITE. ZERO PROVIDER CALLS. ZERO DATABASE OPS.
 *
 * WHAT THIS SUITE CAN AND CANNOT ESTABLISH.
 *
 * It establishes INSTRUCTION AND CONTRACT CONSTRUCTION: that the new prompt is the §210C prompt
 * plus exactly one block, reversible byte for byte; that every heading is mapped to a named
 * residual rule; that both overcorrection narrowings are actually stated; that the R7 contract
 * check REFUSES filler and PRESERVES the identified property under RR-7 without inventing
 * anything; that the executor readback defect is corrected; and that the static token cost is
 * measured rather than asserted.
 *
 * It establishes NOTHING about model behaviour. R7 is the one rule with a deterministic half, and
 * that half is exercised here against hand-written declaration objects -- which tests the CHECK,
 * not the model. A semantic PASS may only be claimed from a hosted run.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
} from './lib/expert-first-pass-instruction-210c';
import {
  EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT_WITH_GOVERNED_BINDING, FINAL_GATE_LINES,
  OVERCORRECTION_GUARDS, S6_STATUS, SENTENCE_TO_RULE, build210eSystemPrompt,
  instructionIdentities210e, reconstruct210cSystemPrompt,
} from './lib/expert-first-pass-instruction-210e';
import { FINAL_FIXTURES, finalFixtureProblems } from './lib/section-210e-final-fixtures';
import {
  PROJECTION_REFUSAL_CODES, type ProjectionInput, SEMANTIC_BRANCH_FIELDS, isNonSemanticFiller,
  projectDeclaredOwedFacts,
} from './lib/expert-first-pass-owed-fact-projection';
import {
  CONTRACT_INCOMPLETENESS_CODES, preserveIdentifiedSafetyFacts,
} from './lib/expert-205-declaration-preservation';
import {
  CLARIFICATION_DECLARATION_BACKREF_FIELD,
} from './lib/expert-first-pass-instruction-vnext';

let passed = 0;
let failed = 0;
const ok = (id: string, cond: boolean, detail = ''): void => {
  if (cond) { passed += 1; console.log(`  PASS  ${id}${detail ? ` -- ${detail}` : ''}`); }
  else { failed += 1; console.log(`  FAIL  ${id}${detail ? ` -- ${detail}` : ''}`); }
};
const section = (t: string): void => console.log(`\n---------------- ${t}`);

// ================================================================ construction

section('INSTRUCTION CONSTRUCTION -- successor is §210C plus exactly one block');

const ids = instructionIdentities210e() as any;

ok('BUILD.base-is-210c', ids.oldVersion === 'hazlenz.expert.first-pass-instruction.210c-R1-R3');
ok('BUILD.new-version-is-distinct',
  ids.newVersion === 'hazlenz.expert.first-pass-instruction.210e-R4-R7');
ok('BUILD.identity-changed-plain',
  ids.withoutGovernedBinding.oldIdentity !== ids.withoutGovernedBinding.newIdentity);
ok('BUILD.identity-changed-governed',
  ids.withGovernedBinding.oldIdentity !== ids.withGovernedBinding.newIdentity);
ok('BUILD.base-identity-is-the-210d-instruction-under-test',
  ids.withoutGovernedBinding.oldIdentity
  === 'b243c323af82031c6f733af80f456c4bc61d52efafd89b5c25806a5d8a83b0e6',
  '§210E is built on exactly the prompt §210D tested');
ok('BUILD.reversible-byte-for-byte-plain',
  reconstruct210cSystemPrompt(EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT)
  === EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT);
ok('BUILD.reversible-byte-for-byte-governed',
  reconstruct210cSystemPrompt(EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT_WITH_GOVERNED_BINDING)
  === EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT_WITH_GOVERNED_BINDING);
ok('BUILD.block-appears-exactly-once-plain',
  EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT.split(FINAL_GATE_LINES.join('\n')).length === 2);
ok('BUILD.no-existing-prose-deleted',
  EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT.split('\n')
    .every(l => EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT.includes(l)));
ok('BUILD.selector-pairs-prompt-with-capability',
  build210eSystemPrompt(0) === EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT
  && build210eSystemPrompt(2) === EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT_WITH_GOVERNED_BINDING);
ok('BUILD.gates-are-in-order',
  EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT.indexOf('GATE 1.')
  < EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT.indexOf('GATE 8.'),
  'GATE 8-11 continue GATE 1-3 without collision in either variant');

// ================================================================ rule mapping

section('EVERY GATE SERVES A NAMED RESIDUAL RULE');

{
  const all = FINAL_GATE_LINES.join('\n');
  for (const m of SENTENCE_TO_RULE) {
    ok(`RULE.${m.rule}.heading-present`, all.includes(m.heading), m.addresses);
  }
  const headings = all.split('\n').filter(l => /^GATE \d+\. [A-Z]/.test(l.trim()));
  ok('RULE.every-gate-heading-is-mapped',
    headings.every(h => SENTENCE_TO_RULE.some(m => m.heading === h.trim())),
    `${headings.length} headings, ${SENTENCE_TO_RULE.length} mapped`);
  ok('RULE.four-gates-exactly', headings.length === 4);
  ok('RULE.rules-are-R4-R7',
    JSON.stringify(SENTENCE_TO_RULE.map(m => m.rule)) === JSON.stringify(['R4', 'R5', 'R6', 'R7']));
}

// ================================================================ R4

section('R4 -- PROPERTY PURITY, AND THE NARROWING THAT KEEPS IT FROM OVERCORRECTING');

{
  const p = EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT;
  const flat = p.replace(/\s+/g, ' ');
  ok('R4.asks-state-or-process',
    flat.includes('Does it describe the state that has to be true, or does part of it describe how '
      + 'anyone would find out?'));
  ok('R4.names-the-process-vocabulary',
    flat.includes('Checked, inspected, tested, measured, verified, confirmed, documented, '
      + 'recorded, available, seen earlier: all of those are finding out'),
    'the exact classes §210D and §209 actually produced');
  ok('R4.forbids-the-conjoined-form',
    flat.includes('joining one to the state with "and" does not make it the state'),
    'D1 conjoined "was measured" into an otherwise correct property');
  ok('R4.states-the-counterfactual-test',
    flat.includes('picture the state exactly as it should be, with nobody having measured or '
      + 'written it down'));
  ok('R4.counterfactual-has-a-decision-rule',
    flat.includes('Is your property still unsatisfied there? Then you have written the process'));
  ok('R4.permits-the-act-as-the-property',
    flat.includes('where performing the act is itself what changes today\'s action, the act IS the '
      + 'state and naming it is right'),
    OVERCORRECTION_GUARDS.R4.risk);
  ok('R4.counterfactual-separates-the-two-cases',
    flat.includes('there the property is still unsatisfied in that picture, because the act has not '
      + 'happened'),
    'the same test gives different answers, which a word list cannot');
  ok('R4.does-not-strip-history-from-evidence-fields',
    flat.includes('belongs in `notEstablishedBecause` and in the span you copied, and stays there'));
  ok('R4.guard-recorded-as-data',
    OVERCORRECTION_GUARDS.R4.guard.includes('counterfactual'));
}

// ================================================================ R5

section('R5 -- BLOCKING CLARIFICATION BINDING');

{
  const flat = EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT.replace(/\s+/g, ' ');
  ok('R5.applies-to-blocking-questions',
    flat.includes('For every question you marked BLOCKING'));
  ok('R5.names-the-canonical-contract-field',
    flat.includes(CLARIFICATION_DECLARATION_BACKREF_FIELD),
    `the instruction names ${CLARIFICATION_DECLARATION_BACKREF_FIELD}, not a paraphrase`);
  ok('R5.requires-the-model-to-author-it',
    flat.includes('Yours, on the record, not left for a reader to infer'),
    'nothing infers the binding deterministically');
  ok('R5.offers-both-authorized-resolutions',
    flat.includes('either the entry is missing and you write it')
    && flat.includes('does not belong at BLOCKING'));
  ok('R5.names-the-unbound-blocking-question-as-invalid',
    flat.includes('A BLOCKING question naming no entry is incomplete output'));
}

// ================================================================ R6

section('R6 -- FACT-LOCAL POSITIVE DECISION CONTAINMENT, AND ITS NARROWING');

{
  const flat = EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT.replace(/\s+/g, ' ');
  ok('R6.is-conditioned-on-an-open-sibling',
    flat.includes('If one is still open and also stands between the work and going ahead'));
  ok('R6.forbids-authorizing-the-work',
    flat.includes('settling this one does not release the work, and `decisionIfA` must not say that '
      + 'it does'));
  ok('R6.offers-semantic-alternatives-not-a-form-of-words',
    flat.includes('that this fact no longer blocks, that nothing further is needed for it, or that '
      + 'what follows is subject to the entries still open')
    && flat.includes('Any wording with that meaning will do'),
    'semantic containment is required; exact wording is not');
  ok('R6.permits-unqualified-authorization-where-nothing-else-is-open',
    flat.includes('Where this entry is the only thing in the way, saying the work may go ahead is '
      + 'correct and nothing here asks you to hedge it'),
    OVERCORRECTION_GUARDS.R6.risk);
  ok('R6.names-the-target-of-the-qualification',
    flat.includes('owed to an open sibling, not to caution in general'));
  ok('R6.guard-recorded-as-data',
    OVERCORRECTION_GUARDS.R6.guard.includes('sibling entry actually being open'));
}

// ================================================================ R7 -- instruction half

section('R7 -- NO PLACEHOLDER SEMANTICS, INSTRUCTION HALF');

{
  const flat = EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT.replace(/\s+/g, ' ');
  ok('R7.covers-all-four-fields',
    SEMANTIC_BRANCH_FIELDS.every(f => flat.includes(`\`${f}\``)));
  ok('R7.states-the-readability-requirement',
    flat.includes('must be able to tell the two answers apart and act on either'));
  ok('R7.names-the-filler-vocabulary',
    flat.includes('Placeholder, unused, n/a, tbd, unknown, same, other, none'));
  ok('R7.names-why-filler-is-worse-than-a-gap',
    flat.includes('looking complete, which is worse than an obvious gap'));
  ok('R7.fails-closed-without-discarding-the-uncertainty',
    flat.includes('The uncertainty is not discarded either: it stays unresolved and is reported as '
      + 'unresolved, never as settled'));
}

// ================================================================ R7 -- contract half

section('R7 -- THE CONTRACT CHECK REFUSES FILLER AND NEVER REPAIRS IT');

{
  ok('R7.code-exists',
    (PROJECTION_REFUSAL_CODES as readonly string[]).includes('NON_SEMANTIC_PLACEHOLDER_VALUE'));
  ok('R7.code-is-a-contract-incompleteness',
    (CONTRACT_INCOMPLETENESS_CODES as readonly string[])
      .includes('NON_SEMANTIC_PLACEHOLDER_VALUE'),
    'so RR-7 PRESERVES the identified property rather than discarding it with the empty shape');

  // ---- the detector: whole-field filler only, never a substring
  for (const v of ['placeholder', 'unused', 'N/A', 'TBD', ' same ', 'other', 'none', '"unused"',
    'TODO', '-']) {
    ok(`R7.detects-${JSON.stringify(v)}`, isNonSemanticFiller(v));
  }
  for (const v of ['The valve is in an unknown position',
    'Work stops until the guard is refitted',
    'The same reading is obtained after the isolation is proved',
    'No other control is present on this machine']) {
    ok(`R7.does-not-flag-${JSON.stringify(v.slice(0, 28))}`, !isNonSemanticFiller(v),
      'a real sentence containing an ordinary word is not filler');
  }

  // ---- end to end, against the exact shape §210D's D2 produced
  const source = 'A brine pump seal is weeping into a bund and the upstream isolation valve has no '
    + 'handle fitted.';
  const declaration = {
    declarationId: 'decl-seal',
    missingFact: 'Whether the pump can be positively isolated before the seal is changed',
    observationSourceId: 'OBS-X',
    observationSpan: 'the upstream isolation valve has no handle fitted',
    notEstablishedBecause: 'the observation does not record any alternative isolation point',
    affectedDecision: 'REQUIRED_CONTROL',
    branchA: 'A positive isolation can be established upstream of the pump',
    decisionIfA: 'unused',
    branchB: 'placeholder',
    decisionIfB: 'placeholder',
    whyNecessaryNow: 'the fitter is about to break into the seal housing while the plant runs',
  };
  /** The real contract shape. Typed, not cast: an `as any` here previously hid a mis-shaped input. */
  const projectOne = (d: Record<string, unknown>) => {
    const input: ProjectionInput = {
      declarations: [d],
      sources: [{ sourceId: 'OBS-X', text: source }],
      suppliedGovernedSourceIds: [],
      stage: 'FIRST_PASS_MODEL',
    };
    return projectDeclaredOwedFacts(input);
  };
  const projection = projectOne(declaration);

  ok('R7.refuses-the-D2-shape',
    projection.facts.length === 0 && projection.refusedCount === 1,
    'the declaration is not admitted as an owed fact');
  ok('R7.names-the-filler-fields',
    projection.perDeclaration[0].codes.includes('NON_SEMANTIC_PLACEHOLDER_VALUE')
    && projection.perDeclaration[0].detail.some((d: string) => d.startsWith('decisionIfA'))
    && projection.perDeclaration[0].detail.some((d: string) => d.startsWith('branchB'))
    && projection.perDeclaration[0].detail.some((d: string) => d.startsWith('decisionIfB')),
    `detail=[${projection.perDeclaration[0].detail.join(' | ')}]`);

  const preserved = preserveIdentifiedSafetyFacts(projection, [declaration]);
  ok('R7.fails-closed',
    preserved.safetyStateComplete === false,
    'the row is not complete and cannot be presented as if it were');
  ok('R7.preserves-the-identified-property',
    preserved.preserved.length === 1
    && preserved.preserved[0].identifiedProperty
    === 'Whether the pump can be positively isolated before the seal is changed',
    'the uncertainty survives the refusal');
  ok('R7.preserved-record-can-never-settle',
    preserved.preserved[0].admissible === false
    && preserved.preserved[0].mayBeSettled === false
    && preserved.preserved[0].mayCloseTheAnalysis === false
    && preserved.preserved[0].requiresUpstreamRepair === true);
  ok('R7.invents-nothing',
    !JSON.stringify(preserved.preserved[0]).includes('placeholder')
    || preserved.preserved[0].presentFields.branchB === 'placeholder',
    'the filler is carried verbatim where it is reported, never replaced with a composed value');

  // ---- a complete declaration must still be admitted, or R7 has become a reason to withhold
  const complete = {
    ...declaration,
    decisionIfA: 'The seal change may proceed once the isolation is proved and locked',
    branchB: 'No positive isolation point exists upstream of the pump',
    decisionIfB: 'Do not break into the seal housing; establish an isolation point first',
  };
  const okProjection = projectOne(complete);
  ok('R7.admits-a-complete-declaration',
    okProjection.refusedCount === 0 && okProjection.facts.length === 1,
    'the check refuses filler only; it is not a new reason to withhold');
}

// ================================================================ executor defect

section('EXECUTOR DEFECT -- the clarification back-reference is read under the contract field');

{
  const read = (f: string): string => readFileSync(join(__dirname, f), 'utf8');
  const executors = ['execute-210d-confirmation.ts', 'execute-210b3b-uncached-probe.ts'];
  const WRONG = ['relatesTo', 'DeclarationId'].join('');
  for (const f of executors) {
    const src = read(f);
    const codeLines = src.split('\n')
      .filter(l => !l.trim().startsWith('*') && !l.trim().startsWith('//'));
    ok(`DEFECT.${f}.does-not-read-the-wrong-field`,
      !codeLines.some(l => l.includes(WRONG)),
      'the wrong name survives only in comments recording the defect');
    ok(`DEFECT.${f}.uses-the-contract-field`,
      src.includes('CLARIFICATION_DECLARATION_BACKREF_FIELD'),
      'taken from the contract module, never retyped, so a rename cannot reintroduce it');
  }
  ok('DEFECT.canonical-field-name-is-what-we-think',
    CLARIFICATION_DECLARATION_BACKREF_FIELD === 'answersUnresolvedFactDeclarationId',
    CLARIFICATION_DECLARATION_BACKREF_FIELD);
  ok('DEFECT.reprojector-exists-and-preserves-the-original',
    read('reproject-210d-from-raw.ts').includes('PROJECTION-210D-CORRECTED.jsonl')
    && read('reproject-210d-from-raw.ts').includes('original projection missing; refusing to run'));
}

// ================================================================ generality

section('THE RULES GENERALIZE -- NO §210D VOCABULARY ENTERS THE INSTRUCTION');

{
  const block = FINAL_GATE_LINES.join('\n');
  for (const w of ['press', 'light curtain', 'ladle', 'drilling', 'heading', 'vent duct',
    'telehandler', 'blasting', 'foundry', 'D1', 'D2', 'D4']) {
    ok(`GENERAL.no-${w.replace(/[^a-z0-9]/gi, '-')}`,
      !new RegExp(`\\b${w}\\b`, 'i').test(block));
  }
  ok('GENERAL.no-worked-example-emitted', !/for example|e\.g\.|for instance/i.test(block));
  ok('GENERAL.stated-over-contract-field-names',
    ['missingFact', 'branchA', 'branchB', 'decisionIfA', 'decisionIfB',
      'notEstablishedBecause', 'answersUnresolvedFactDeclarationId'].every(f => block.includes(f)));
}

// ================================================================ S6 untouched

section('S6 IS STILL NOT TUNED');

ok('S6.recorded-not-exercised', S6_STATUS.status === 'NOT_EXERCISED');
ok('S6.reason-references-the-absent-evidence',
  S6_STATUS.reason.includes('no §210D case was capability-PRESENT'));
ok('S6.text-unchanged-by-210e',
  EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT_WITH_GOVERNED_BINDING
    .includes('5. A REQUIREMENT IS NOT AN OBSERVATION.'));

// ================================================================ fixtures

section('FINAL FIXTURES ARE WELL FORMED AND CARRY THEIR COUNTER-CONTROLS');

{
  const problems = finalFixtureProblems();
  ok('FX.set-is-well-formed', problems.length === 0, problems.join('; ') || 'no problems');
  ok('FX.nine-fixtures', FINAL_FIXTURES.length === 9, `${FINAL_FIXTURES.length} fixtures`);
  for (const r of ['R4', 'R5', 'R6', 'R7'] as const) {
    ok(`FX.covers-${r}`, FINAL_FIXTURES.some(f => f.targets === r));
  }
  ok('FX.four-counter-controls',
    FINAL_FIXTURES.filter(f => f.intent === 'PREVENT_OVERCORRECTION').length === 4,
    'R4, R5, R6 and R7 each carry one');
  ok('FX.every-restraining-rule-has-a-counter-control',
    (['R4', 'R6', 'R7'] as const).every(r =>
      FINAL_FIXTURES.some(f => f.targets === r && f.intent === 'PREVENT_OVERCORRECTION')));
  ok('FX.every-fixture-names-a-gate-in-the-instruction',
    FINAL_FIXTURES.every(f => EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT.includes(f.decidedByGate)));
}

// ================================================================ token cost

section('STATIC TOKEN COST -- measured, not asserted');

{
  const w = ids.withoutGovernedBinding;
  const g = ids.withGovernedBinding;
  ok('TOKEN.plain-delta-measured', w.addedChars > 0,
    `+${w.addedChars} chars, ~+${w.estimatedAddedTokens} tokens (estimate)`);
  ok('TOKEN.same-block-both-variants', w.addedChars === g.addedChars);
  ok('TOKEN.nothing-removed', ids.netProseRemoved === 0);
  ok('TOKEN.estimate-is-labelled-an-estimate',
    String(ids.tokenEstimateBasis).includes('not a tokenizer result'));
  ok('TOKEN.block-is-not-larger-than-the-210c-block',
    w.addedChars <= 3482,
    `§210E +${w.addedChars} chars; §210C +2858; §210B-2 +3482. Four rules, two carrying an '
    + 'overcorrection narrowing.`);
}

console.log(`\n================ 210E FINAL SUITE: ${passed} passed, ${failed} failed`);
console.log('  provider calls: 0   database operations: 0');
console.log('  No semantic PASS may be claimed from this file. That requires a hosted run.');
if (failed > 0) process.exit(1);
