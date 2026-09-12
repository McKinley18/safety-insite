/**
 * §210B-2 -- SEMANTIC REMEDIATION LOCAL SUITE. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * WHAT THIS SUITE CAN AND CANNOT ESTABLISH.
 *
 * It establishes INSTRUCTION AND CONTRACT CONSTRUCTION: that the new prompt is the old prompt plus
 * exactly one block, that the block is reversible byte for byte, that every sentence in it is
 * mapped to a rule, that the fixtures are well formed, that the token cost is measured, and that
 * §210B-1 structural behaviour is untouched.
 *
 * It establishes NOTHING about model behaviour. No fixture here can pass or fail on what a model
 * would do, because no model is called. A semantic PASS may only be claimed from the §210B-3 hosted
 * probe, and this file deliberately has no assertion that could be mistaken for one.
 */

import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT, EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
} from './lib/expert-first-pass-instruction-vnext';
import {
  DELIBERATELY_NOT_RESTATED, EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING, GOVERNED_SEPARATION_LINES,
  SEMANTIC_INVARIANT_LINES, SENTENCE_TO_RULE, build210b2SystemPrompt, instructionIdentities,
  reconstructVNextSystemPrompt,
} from './lib/expert-first-pass-instruction-210b2';
import {
  SEMANTIC_FIXTURES, fixtureWellFormednessProblems,
} from './lib/section-210b2-semantic-fixtures';

let passed = 0;
let failed = 0;
const ok = (id: string, cond: boolean, detail = ''): void => {
  if (cond) { passed += 1; console.log(`  PASS  ${id}${detail ? ` -- ${detail}` : ''}`); }
  else { failed += 1; console.log(`  FAIL  ${id}${detail ? ` -- ${detail}` : ''}`); }
};
const section = (t: string): void => console.log(`\n---------------- ${t}`);
const sha256 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

// ================================================================ construction

section('INSTRUCTION CONSTRUCTION -- successor is base plus exactly one block');

const ids = instructionIdentities();

ok('BUILD.base-is-vnext', (ids as any).oldVersion === 'hazlenz.expert.first-pass-instruction.vNext');
ok('BUILD.new-version-is-distinct',
  (ids as any).newVersion === 'hazlenz.expert.first-pass-instruction.210b2-S1-S6');
ok('BUILD.identity-changed',
  (ids as any).withoutGovernedBinding.oldIdentity !== (ids as any).withoutGovernedBinding.newIdentity);
ok('BUILD.reversible-byte-for-byte-plain',
  reconstructVNextSystemPrompt(EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT, false)
  === EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT,
  'removing the block reproduces vNext exactly');
ok('BUILD.reversible-byte-for-byte-governed',
  reconstructVNextSystemPrompt(EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING, true)
  === EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT_WITH_GOVERNED_BINDING);
ok('BUILD.block-appears-exactly-once',
  EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT.split(SEMANTIC_INVARIANT_LINES.join('\n')).length === 2);
ok('BUILD.governed-rule-only-in-governed-variant',
  EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING
    .includes(GOVERNED_SEPARATION_LINES.join('\n'))
  && !EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT.includes('A REQUIREMENT IS NOT AN OBSERVATION'),
  'S6 is about governed evidence and is absent where none is supplied');
ok('BUILD.selector-pairs-prompt-with-capability',
  build210b2SystemPrompt(0) === EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT
  && build210b2SystemPrompt(2) === EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING);

// ================================================================ rule mapping

section('EVERY SENTENCE SERVES A NAMED RULE');

{
  const all = [...SEMANTIC_INVARIANT_LINES, ...GOVERNED_SEPARATION_LINES].join('\n');
  for (const m of SENTENCE_TO_RULE) {
    ok(`RULE.${m.rule}.heading-present`, all.includes(m.heading), m.addresses);
  }
  const headings = all.split('\n').filter(l => /^\d\. [A-Z]/.test(l.trim()));
  ok('RULE.every-numbered-heading-is-mapped',
    headings.every(h => SENTENCE_TO_RULE.some(m => m.heading === h.trim())),
    `${headings.length} headings, ${SENTENCE_TO_RULE.length} mapped`);
  ok('RULE.S5-absence-is-recorded-as-a-decision',
    DELIBERATELY_NOT_RESTATED.rule === 'S5' && DELIBERATELY_NOT_RESTATED.reason.length > 80,
    'v15 already carries the counterfactual test; restating it would spend tokens to repeat itself');
}

// ================================================================ the two refined sentences

section('THE TWO EXISTING SENTENCES THAT AUTHORIZED THE DEFECTS ARE REFINED, NOT DUPLICATED');

{
  const base = EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT;
  const next = EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT;
  // the sentence is wrapped across two prompt lines, so it is matched on flattened whitespace
  const flat = next.replace(/\s+/g, ' ');
  ok('REFINE.original-question-without-declaration-sentence-still-present',
    flat.includes('A question with no declaration is still a legitimate question'),
    'the original text is kept readable in place');
  ok('REFINE.S2-names-and-narrows-it',
    next.includes('that remains true for a question about something')
    && next.includes('not a licence for a decision-critical gap'),
    'AC-03 used this permission; S2 confines it to the case it was written for');
  ok('REFINE.original-one-fact-per-entry-sentence-still-present',
    next.includes('ONE FACT PER ENTRY'));
  ok('REFINE.S3-distinguishes-independent-unknowns-from-conjuncts',
    next.includes('Two unknowns that stand alone are two entries -- that rule is unchanged'),
    'AC-18 and AC-22 dropped a conjunct under a rule written for independent unknowns');
  ok('REFINE.no-existing-prose-was-deleted', base.split('\n').every(l => next.includes(l)),
    'every line of the base prompt survives in the successor');
}

// ================================================================ token cost

section('STATIC TOKEN COST -- measured, not asserted');

{
  const w = (ids as any).withoutGovernedBinding;
  const g = (ids as any).withGovernedBinding;
  ok('TOKENS.delta-is-measured-and-reported',
    typeof w.addedChars === 'number' && typeof w.estimatedAddedTokens === 'number');
  ok('TOKENS.plain-variant-delta', w.addedChars === 3482 && w.estimatedAddedTokens === 1220,
    `+${w.addedChars} chars, ~+${w.estimatedAddedTokens} tokens `
    + `(~${(w.estimatedAddedTokens / 24440 * 100).toFixed(1)}% of the 24,440 median)`);
  ok('TOKENS.governed-variant-delta', g.addedChars === 3968 && g.estimatedAddedTokens === 1390,
    `+${g.addedChars} chars, ~+${g.estimatedAddedTokens} tokens`);
  ok('TOKENS.estimate-is-labelled-as-an-estimate',
    String((ids as any).tokenEstimateBasis).includes('not a tokenizer result'));
  ok('TOKENS.no-prose-was-removed-to-offset-the-addition',
    (ids as any).netProseRemoved === 0, 'the increase is reported gross, not netted down');
}

// ================================================================ fixtures

section('LOCAL FIXTURES -- well-formedness only, NOT model behaviour');

{
  let malformed = 0;
  for (const f of SEMANTIC_FIXTURES) {
    const problems = fixtureWellFormednessProblems(f);
    if (problems.length > 0) { malformed += 1; console.log(`    ${f.fixtureId}: ${problems.join('; ')}`); }
  }
  ok('FIXTURE.all-well-formed', malformed === 0, `${SEMANTIC_FIXTURES.length} fixtures`);

  const required = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
  const covered = new Set(SEMANTIC_FIXTURES.map(f => f.targets));
  ok('FIXTURE.every-rule-has-a-fixture', required.every(r => covered.has(r as any)),
    [...covered].sort().join(','));
  ok('FIXTURE.present-state-family-has-all-three-proxy-shapes',
    SEMANTIC_FIXTURES.filter(f => f.targets === 'S1').length === 3,
    'availability, method existence, check history');
  ok('FIXTURE.emission-fixture-has-a-paired-negative-control',
    SEMANTIC_FIXTURES.some(f => f.fixtureId === 'FX-S2-MUST-EMIT')
    && SEMANTIC_FIXTURES.some(f => f.fixtureId === 'FX-S2-CONTROL-MUST-NOT-EMIT'),
    'S2 must not become a licence to declare every INSUFFICIENT_EVIDENCE candidate');
  ok('FIXTURE.restraint-fixtures-expect-zero-declarations',
    SEMANTIC_FIXTURES.filter(f => f.expectedDeclarationCount === 0).length === 2);
  ok('FIXTURE.no-fixture-claims-a-model-result',
    SEMANTIC_FIXTURES.every(f => !/passed|correct output|model produced/i.test(
      `${f.scenario}${f.evaluationQuestion}`)),
    'these are frozen expectations, not results');
  ok('FIXTURE.none-reuses-a-section-209-case-verbatim',
    SEMANTIC_FIXTURES.every(f => !/AC-\d\d/.test(f.scenario)),
    'B-3 stimuli must be new, not replays of the adjudicated cohort');
}

// ================================================================ B-1 preserved

section('§210B-1 STRUCTURAL BEHAVIOUR UNCHANGED');

{
  const ROOT = join(__dirname, '..', '..');
  const prereg = JSON.parse(readFileSync(join(ROOT, 'verification',
    'expert-hazlenz-required-structured-verifier-validation-2026-09-05',
    'PREREGISTRATION.json'), 'utf8'));
  const base = join(ROOT, 'backend', 'src', 'safescope-v2', 'expert-hazlenz', 'owed-facts');
  let allPinned = true;
  for (const [file, expected] of Object.entries<string>(prereg.owedFactSourceHashes)) {
    if (createHash('sha256').update(readFileSync(join(base, file))).digest('hex') !== expected) {
      allPinned = false; console.log(`    DRIFT ${file}`);
    }
  }
  ok('B1.pinned-owed-fact-sources-unchanged', allPinned);
  ok('B1.pinned-v15-prompt-file-unchanged',
    createHash('sha256').update(readFileSync(join(ROOT, 'backend', 'src', 'safescope-v2',
      'expert-hazlenz', 'expert-prompt.ts'))).digest('hex')
    === 'bfe564c25515cabf5149d9629aa9aa58ea2287dd8691dc338a2f9ec47fd0f694',
    'the semantic block is an overlay; the pinned v15 file was never edited');
  ok('B1.vnext-instruction-file-unchanged',
    createHash('sha256').update(readFileSync(join(__dirname, 'lib',
      'expert-first-pass-instruction-vnext.ts'))).digest('hex')
    === 'a81c63c8314f16290e0e5ead451b9f2c7e127d6eaa6c66e754ae605bec0e756e',
    'vNext-R2 remains byte-identical and auditable');
  ok('B1.no-provider-path-in-the-b2-modules',
    !/anthropic|fetch\s*\(|https?:/i.test(
      readFileSync(join(__dirname, 'lib', 'expert-first-pass-instruction-210b2.ts'), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, ''))
    && !/anthropic|fetch\s*\(|https?:/i.test(
      readFileSync(join(__dirname, 'lib', 'section-210b2-semantic-fixtures.ts'), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')));
}

section('WHAT THIS SUITE DOES NOT ESTABLISH');
console.log('  No model was called. No fixture here can pass or fail on model behaviour, and no');
console.log('  semantic PASS may be claimed from this file. That requires the §210B-3 probe.');

console.log(`\n================ 210B-2 LOCAL SUITE: ${passed} passed, ${failed} failed`);
console.log('  provider calls: 0   database operations: 0');
process.exit(failed === 0 ? 0 : 1);
