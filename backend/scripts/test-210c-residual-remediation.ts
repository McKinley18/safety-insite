/**
 * §210C -- RESIDUAL SEMANTIC REMEDIATION LOCAL SUITE. ZERO PROVIDER CALLS. ZERO DATABASE OPS.
 *
 * WHAT THIS SUITE CAN AND CANNOT ESTABLISH.
 *
 * It establishes INSTRUCTION AND CONTRACT CONSTRUCTION: that the new prompt is the §210B-2 prompt
 * plus exactly one block, that the block is reversible byte for byte, that every heading in it is
 * mapped to a named residual rule, that R1's forbidden correction direction is actually stated,
 * that the fixtures are well formed and free of PB-case vocabulary, and that the static token cost
 * is measured rather than asserted.
 *
 * It establishes NOTHING about model behaviour. No fixture here can pass or fail on what a model
 * would do, because no model is called. A semantic PASS may only be claimed from a hosted run, and
 * this file deliberately has no assertion that could be mistaken for one.
 */

import { createHash } from 'crypto';

import {
  EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
} from './lib/expert-first-pass-instruction-210b2';
import {
  DECLARATION_GATE_LINES, EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
  FORBIDDEN_CORRECTION_DIRECTION, S6_STATUS, SENTENCE_TO_RULE, build210cSystemPrompt,
  instructionIdentities210c, reconstruct210b2SystemPrompt,
} from './lib/expert-first-pass-instruction-210c';
import {
  RESIDUAL_FIXTURES, residualFixtureProblems,
} from './lib/section-210c-residual-fixtures';

let passed = 0;
let failed = 0;
const ok = (id: string, cond: boolean, detail = ''): void => {
  if (cond) { passed += 1; console.log(`  PASS  ${id}${detail ? ` -- ${detail}` : ''}`); }
  else { failed += 1; console.log(`  FAIL  ${id}${detail ? ` -- ${detail}` : ''}`); }
};
const section = (t: string): void => console.log(`\n---------------- ${t}`);
const sha256 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

// ================================================================ construction

section('INSTRUCTION CONSTRUCTION -- successor is §210B-2 plus exactly one block');

const ids = instructionIdentities210c() as any;

ok('BUILD.base-is-210b2',
  ids.oldVersion === 'hazlenz.expert.first-pass-instruction.210b2-S1-S6');
ok('BUILD.new-version-is-distinct',
  ids.newVersion === 'hazlenz.expert.first-pass-instruction.210c-R1-R3');
ok('BUILD.identity-changed-plain',
  ids.withoutGovernedBinding.oldIdentity !== ids.withoutGovernedBinding.newIdentity);
ok('BUILD.identity-changed-governed',
  ids.withGovernedBinding.oldIdentity !== ids.withGovernedBinding.newIdentity);
ok('BUILD.reversible-byte-for-byte-plain',
  reconstruct210b2SystemPrompt(EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT)
  === EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT,
  'removing the block reproduces §210B-2 exactly');
ok('BUILD.reversible-byte-for-byte-governed',
  reconstruct210b2SystemPrompt(EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT_WITH_GOVERNED_BINDING)
  === EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING);
ok('BUILD.block-appears-exactly-once-plain',
  EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT.split(DECLARATION_GATE_LINES.join('\n')).length === 2);
ok('BUILD.block-appears-exactly-once-governed',
  EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT_WITH_GOVERNED_BINDING
    .split(DECLARATION_GATE_LINES.join('\n')).length === 2);
ok('BUILD.no-existing-prose-deleted-plain',
  EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT.split('\n')
    .every(l => EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT.includes(l)),
  'every line of §210B-2 survives in the successor');
ok('BUILD.no-existing-prose-deleted-governed',
  EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING.split('\n')
    .every(l => EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT_WITH_GOVERNED_BINDING.includes(l)));
ok('BUILD.selector-pairs-prompt-with-capability',
  build210cSystemPrompt(0) === EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT
  && build210cSystemPrompt(2) === EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT_WITH_GOVERNED_BINDING);
ok('BUILD.gate-block-follows-the-210b2-block',
  EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT.indexOf('THE DECLARATION GATE')
  > EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT.indexOf('BEFORE YOU EMIT: FOUR CHECKS'),
  'admission checks come after the checks that shape what is written');
ok('BUILD.governed-rule-still-last-in-governed-variant',
  EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT_WITH_GOVERNED_BINDING
    .indexOf('5. A REQUIREMENT IS NOT AN OBSERVATION.')
  < EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT_WITH_GOVERNED_BINDING.indexOf('THE DECLARATION GATE'),
  'S6 keeps its place; the gate block is appended after it, so no number collides');

// ================================================================ rule mapping

section('EVERY GATE SERVES A NAMED RESIDUAL RULE');

{
  const all = DECLARATION_GATE_LINES.join('\n');
  for (const m of SENTENCE_TO_RULE) {
    ok(`RULE.${m.rule}.heading-present`, all.includes(m.heading), m.addresses);
  }
  const headings = all.split('\n').filter(l => /^GATE \d\. [A-Z]/.test(l.trim()));
  ok('RULE.every-gate-heading-is-mapped',
    headings.every(h => SENTENCE_TO_RULE.some(m => m.heading === h.trim())),
    `${headings.length} headings, ${SENTENCE_TO_RULE.length} mapped`);
  ok('RULE.three-gates-exactly', headings.length === 3);
  ok('RULE.rules-are-R1-R2-R3',
    JSON.stringify(SENTENCE_TO_RULE.map(m => m.rule)) === JSON.stringify(['R1', 'R2', 'R3']));
}

// ================================================================ the three residual rules

section('R1 -- PROPERTY / REASONING CONSISTENCY, AND ITS DIRECTION OF CORRECTION');

{
  const p = EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT;
  ok('R1.compares-property-against-branches-and-question',
    p.includes('Read your own `missingFact` against your own `branchA`, `branchB`, `decisionIfA`'),
    'the check names the exact contract fields, so it generalizes to any case');
  ok('R1.asks-the-exact-proposition-question',
    p.includes('name the exact proposition those two branches decide between'));
  ok('R1.asks-the-every-part-question',
    p.includes('carry every part that the branches and the question rely on'));
  ok('R1.asks-the-state-not-evidence-question',
    p.includes('state the safety state itself, rather than the evidence for it')
    && p.includes('an inspection, a')
    && p.includes('test, a check, a record, a history, an availability, an existence or a requirement'),
    'names the proxy classes that PB-08 and §209 actually produced');
  ok('R1.names-the-property-as-the-wrong-half',
    p.includes('THE PROPERTY IS THE HALF THAT IS WRONG'));
  ok('R1.direction-of-correction-is-upward',
    p.includes('Move that meaning up into `missingFact`'));
  ok('R1.forbids-the-destructive-repair',
    p.includes('Never cut detail out of the branches or the question to make')
    && p.includes('them agree with a property that says less'),
    FORBIDDEN_CORRECTION_DIRECTION.forbidden);
  ok('R1.forbidden-direction-recorded-as-data',
    FORBIDDEN_CORRECTION_DIRECTION.rule === 'R1'
    && FORBIDDEN_CORRECTION_DIRECTION.required.includes('move the missing semantics up'));
}

section('R2 -- RECOGNITION TO DECLARATION RECONCILIATION');

{
  const p = EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT;
  ok('R2.walks-the-question-list',
    p.includes('Go through the questions you have written, one at a time'));
  ok('R2.requires-an-explicit-binding',
    p.includes('name the entry in')
    && p.includes('`unresolvedFactDeclarations` that it would settle')
    && p.includes('Do this explicitly'),
    'the model authors the binding; nothing infers it deterministically');
  ok('R2.offers-both-authorized-resolutions',
    p.includes('Either write the entry, or conclude that the')
    && p.includes('question does not change today\'s action'),
    'emit the declaration, or demote the question -- the two the authorization allows');
  ok('R2.names-the-orphan-as-the-defect',
    p.includes('question that governs today\'s action while pointing at nothing'));
  ok('R2.does-not-weaken-S2',
    EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT.includes('2. NOTHING DECISION-CRITICAL LEAVES WITHOUT A HOME.'),
    'S2 is still present and unedited; R2 is an additional reconciliation pass');
}

section('R3 -- COUNTERFACTUAL RESTRAINT AT THE DECLARATION BOUNDARY');

{
  const p = EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT;
  ok('R3.is-per-entry',
    p.includes('For each entry, read `decisionIfA` against `decisionIfB`'));
  ok('R3.asks-what-happens-now',
    p.includes('what would have to happen NOW'));
  ok('R3.has-a-defined-consequence',
    p.includes('materially the same either way, DELETE THE') && p.includes('ENTRY'));
  ok('R3.permits-a-fact-to-be-unowed-without-being-unimportant',
    p.includes('unknown, safety-related, required by law, worth recording'));
  // The sentence wraps across prompt lines, so it is matched on flattened whitespace -- the same
  // way the §210B-2 suite matches its own wrapped sentences.
  const flat = p.replace(/\s+/g, ' ');
  ok('R3.future-only-divergence-is-not-a-difference-today',
    flat.includes('A difference that appears only in a later decision')
    && flat.includes('is not a difference today'));
  ok('R3.carves-out-the-case-where-the-future-decision-is-the-question',
    p.includes('It counts only if that later decision is the one you were asked about'),
    'a return-to-service analysis still owes the fact');
  ok('R3.does-not-remove-the-broader-counterfactual-rule',
    p.includes('THE COUNTERFACTUAL TEST') || p.includes('counterfactual test'),
    'the existing rule survives; R3 enforces it at the admission boundary');
}

// ================================================================ generality

section('THE RULES GENERALIZE -- NO CASE-SPECIFIC VOCABULARY ENTERS THE INSTRUCTION');

{
  const block = DECLARATION_GATE_LINES.join('\n');
  const forbidden = [
    'kerb', 'cut-off saw', 'bowser', 'local exhaust', 'LEV', 'capture arm', 'chain sling',
    'block valve', 'bleed', 'bund', 'dispenser', 'fuel bay', 'crane', 'certificate', 'welder',
    'scissor lift', 'racking', 'conveyor', 'take-up', 'PB-0',
  ];
  for (const w of forbidden) {
    ok(`GENERAL.no-${w.replace(/[^a-z0-9]/gi, '-')}`,
      !new RegExp(w.replace(/[^a-zA-Z0-9 -]/g, ''), 'i').test(block));
  }
  ok('GENERAL.no-worked-example-emitted',
    !/for example|e\.g\.|for instance/i.test(block),
    'the block states rules, not cases');
  ok('GENERAL.rules-are-stated-over-contract-field-names',
    ['missingFact', 'branchA', 'branchB', 'decisionIfA', 'decisionIfB',
      'unresolvedFactDeclarations'].every(f => block.includes(f)),
    'field names are what make the rules case-independent');
}

// ================================================================ S6 untouched

section('S6 IS NOT TUNED ON A CALL THAT NEVER REACHED INFERENCE');

ok('S6.recorded-not-exercised', S6_STATUS.status === 'NOT_EXERCISED');
ok('S6.reason-is-structural',
  S6_STATUS.reason.includes('COMPILED_GRAMMAR_TOO_LARGE')
  && S6_STATUS.reason.includes('no model ever saw the governed request'));
ok('S6.text-unchanged-by-210c',
  EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT_WITH_GOVERNED_BINDING
    .includes('5. A REQUIREMENT IS NOT AN OBSERVATION.')
  && sha256(EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING)
  === (instructionIdentities210c() as any).withGovernedBinding.oldIdentity,
  'the governed base is bit-identical to what §210B-2 produced');

// ================================================================ fixtures

section('RESIDUAL FIXTURES ARE WELL FORMED AND DO NOT REPLAY A SPENT PB CASE');

{
  const problems = residualFixtureProblems();
  ok('FX.set-is-well-formed', problems.length === 0, problems.join('; ') || 'no problems');
  // The authorization names seven distinctions "at minimum". R1 carries three fixtures because it
  // names two separate distinctions -- a dropped conjunct and a dropped sequence qualifier are
  // different failures -- plus the check-proxy case.
  ok('FX.at-least-seven-fixtures', RESIDUAL_FIXTURES.length >= 7,
    `${RESIDUAL_FIXTURES.length} fixtures`);
  const REQUIRED_DISTINCTIONS: readonly [string, string][] = [
    ['property vs downstream semantics', 'FX-R1-A-CONJUNCT-DROPPED-FROM-PROPERTY'],
    ['property vs dropped sequence', 'FX-R1-B-SEQUENCE-DROPPED-FROM-PROPERTY'],
    ['property vs check proxy', 'FX-R1-C-CHECK-PROXY-IN-PROPERTY'],
    ['orphan decision-critical clarification', 'FX-R2-A-ORPHANED-DECISION-CRITICAL-QUESTION'],
    ['decision-neutral declaration', 'FX-R3-A-SAME-ACTION-EITHER-WAY'],
    ['future-only divergence', 'FX-R3-B-FUTURE-ONLY-DIVERGENCE'],
    ['protected multi-gap control', 'FX-PROTECTED-TWO-INDEPENDENT-CURRENT-GAPS'],
    ['protected fact-local decision control', 'FX-PROTECTED-FACT-LOCAL-SETTLEMENT'],
  ];
  for (const [name, id] of REQUIRED_DISTINCTIONS) {
    ok(`FX.distinction-covered.${name.replace(/[^a-z0-9]+/gi, '-')}`,
      RESIDUAL_FIXTURES.some(f => f.fixtureId === id), id);
  }
  for (const r of ['R1', 'R2', 'R3', 'PROTECTED'] as const) {
    const n = RESIDUAL_FIXTURES.filter(f => f.targets === r).length;
    ok(`FX.covers-${r}`, n > 0, `${n} fixture(s)`);
  }
  ok('FX.two-protect-a-gain',
    RESIDUAL_FIXTURES.filter(f => f.intent === 'PROTECT_GAIN').length === 2,
    'the G and H behaviours that passed in §210B-3B are protected, not just the defects fixed');
  ok('FX.zero-declaration-fixtures-are-R3-only',
    RESIDUAL_FIXTURES.filter(f => f.expectedDeclarationCount === 0)
      .every(f => f.targets === 'R3'));
  ok('FX.every-fixture-names-the-gate-that-decides-it',
    RESIDUAL_FIXTURES.every(f => ['GATE 1', 'GATE 2', 'GATE 3', 'EXISTING'].includes(f.decidedByGate)));
  ok('FX.each-named-gate-is-actually-in-the-instruction',
    RESIDUAL_FIXTURES.filter(f => f.decidedByGate !== 'EXISTING')
      .every(f => EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT.includes(f.decidedByGate)),
    'a fixture cannot point at a gate the prompt does not carry');
  // The protected fixtures must be decided by rules that already existed, or §210C would be
  // claiming credit for behaviour §210B-2 already produced.
  ok('FX.protected-fixtures-rest-on-existing-rules',
    RESIDUAL_FIXTURES.filter(f => f.intent === 'PROTECT_GAIN')
      .every(f => f.decidedByGate === 'EXISTING'));
}

// ================================================================ token cost

section('STATIC TOKEN COST -- measured, not asserted');

{
  const w = ids.withoutGovernedBinding;
  const g = ids.withGovernedBinding;
  ok('TOKEN.plain-delta-measured', w.addedChars > 0 && w.estimatedAddedTokens > 0,
    `+${w.addedChars} chars, ~+${w.estimatedAddedTokens} tokens (estimate)`);
  ok('TOKEN.governed-delta-measured', g.addedChars > 0 && g.estimatedAddedTokens > 0,
    `+${g.addedChars} chars, ~+${g.estimatedAddedTokens} tokens (estimate)`);
  ok('TOKEN.same-block-both-variants', w.addedChars === g.addedChars,
    'the gate block is identical in both variants, so the delta is too');
  ok('TOKEN.nothing-removed', ids.netProseRemoved === 0);
  ok('TOKEN.estimate-is-labelled-an-estimate',
    String(ids.tokenEstimateBasis).includes('not a tokenizer result'));
  // TBR-11 forbids spending static tokens to repeat the prompt to itself. The gate block is an
  // admission pass over fields the prompt already defines, so it must stay small next to §210B-2.
  ok('TOKEN.block-is-smaller-than-the-210b2-block',
    w.addedChars < 3482,
    `§210C +${w.addedChars} chars vs §210B-2 +3482 chars`);
}

// ================================================================ no model, no verdict

section('THIS SUITE CANNOT PRODUCE A SEMANTIC VERDICT');

{
  // Scanned on the §210C SOURCE FILES, not on this suite's own text: the assertions below contain
  // the needles as string literals, so a self-scan would match itself and prove nothing.
  const readLib = (f: string): string =>
    require('fs').readFileSync(require('path').join(__dirname, 'lib', f), 'utf8') as string;
  const libs = [
    readLib('expert-first-pass-instruction-210c.ts'),
    readLib('section-210c-residual-fixtures.ts'),
  ];
  const needle = (parts: string[]): string => parts.join('');
  ok('BOUNDARY.no-provider-call-path',
    libs.every(l => !l.includes(needle(['api.', 'anthropic', '.com']))
      && !l.includes(needle(['fetch', '(']))),
    'neither §210C lib carries a provider transport path');
  ok('BOUNDARY.no-database-path',
    libs.every(l => !new RegExp(`\\bpool\\.|\\bquery\\(|${needle(['DATABASE', '_URL'])}`).test(l)),
    'neither §210C lib carries a database path');
  ok('BOUNDARY.no-fixture-asserts-model-behaviour',
    RESIDUAL_FIXTURES.every(f => typeof f.requiredOutcome === 'string'),
    'fixtures record expectations only; nothing here compares them to an output');
}

console.log(`\n================ 210C RESIDUAL SUITE: ${passed} passed, ${failed} failed`);
console.log('  provider calls: 0   database operations: 0');
console.log('  No semantic PASS may be claimed from this file. That requires a hosted run.');
if (failed > 0) process.exit(1);
