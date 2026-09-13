/**
 * §210G -- DECLARATION-WIDE SEMANTIC ALIGNMENT LOCAL SUITE. ZERO PROVIDER CALLS. ZERO DATABASE OPS.
 *
 * WHAT THIS SUITE CAN AND CANNOT ESTABLISH.
 *
 * It establishes INSTRUCTION CONSTRUCTION: that the new prompt is the §210E prompt plus exactly one
 * block, reversible byte for byte; that every closed mechanism survives unmodified; that the block
 * states each requirement the authorization names; that the narrowing protecting the §210F E4 shape
 * is actually stated; that NO deterministic refusal code was added; and that the static token cost
 * is measured rather than asserted.
 *
 * It establishes NOTHING about model behaviour. R4B has no deterministic half by design, so unlike
 * §210E's R7 there is nothing here executed against a checker that reads meaning. The fixtures are
 * frozen expectations and their SET is checked for internal consistency, which is a property of the
 * fixtures and not of any model. A semantic PASS may only be claimed from a hosted run.
 */

import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
  FINAL_GATE_LINES,
} from './lib/expert-first-pass-instruction-210e';
import {
  ALIGNMENT_GATE_LINES, CLOSED_MECHANISMS, DETERMINISTIC_HALF,
  EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
  OVERCORRECTION_GUARDS, S6_STATUS, SENTENCE_TO_RULE, build210gSystemPrompt,
  instructionIdentities210g, reconstruct210eSystemPrompt,
} from './lib/expert-first-pass-instruction-210g';
import { ALIGNMENT_FIXTURES, alignmentFixtureProblems } from './lib/section-210g-alignment-fixtures';
import { PROJECTION_REFUSAL_CODES } from './lib/expert-first-pass-owed-fact-projection';
import { CONTRACT_INCOMPLETENESS_CODES } from './lib/expert-205-declaration-preservation';

let passed = 0;
let failed = 0;
const ok = (id: string, cond: boolean, detail = ''): void => {
  if (cond) { passed += 1; console.log(`  PASS  ${id}${detail ? ` -- ${detail}` : ''}`); }
  else { failed += 1; console.log(`  FAIL  ${id}${detail ? ` -- ${detail}` : ''}`); }
};
const section = (t: string): void => console.log(`\n---------------- ${t}`);
const ROOT = join(__dirname, '..', '..');
const sha = (b: Buffer | string): string => createHash('sha256').update(b).digest('hex');

// ================================================================ construction

section('INSTRUCTION CONSTRUCTION -- successor is §210E plus exactly one block');

const ids = instructionIdentities210g() as any;

ok('BUILD.base-is-210e', ids.oldVersion === 'hazlenz.expert.first-pass-instruction.210e-R4-R7');
ok('BUILD.new-version-is-distinct',
  ids.newVersion === 'hazlenz.expert.first-pass-instruction.210g-R4B');
ok('BUILD.base-identity-is-the-210f-instruction-under-test',
  ids.withoutGovernedBinding.oldIdentity
  === '874d26d4d036ca419dd0ffaee2a43f89ecec26f6b6bfba93e7a423a10658d831',
  '§210G is built on exactly the prompt §210F tested');
ok('BUILD.base-governed-identity-is-the-210f-one',
  ids.withGovernedBinding.oldIdentity
  === 'e6794aaf894df3dbc186ce38d0c16b2fc69e6a0fa758c1a110ac1e640d7e7c2f');
ok('BUILD.identity-changed-plain',
  ids.withoutGovernedBinding.oldIdentity !== ids.withoutGovernedBinding.newIdentity);
ok('BUILD.identity-changed-governed',
  ids.withGovernedBinding.oldIdentity !== ids.withGovernedBinding.newIdentity);
ok('BUILD.reversible-byte-for-byte-plain',
  reconstruct210eSystemPrompt(EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT)
  === EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT);
ok('BUILD.reversible-byte-for-byte-governed',
  reconstruct210eSystemPrompt(EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT_WITH_GOVERNED_BINDING)
  === EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT_WITH_GOVERNED_BINDING);
ok('BUILD.block-appears-exactly-once-plain',
  EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT.split(ALIGNMENT_GATE_LINES.join('\n')).length === 2);
ok('BUILD.block-appears-exactly-once-governed',
  EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT_WITH_GOVERNED_BINDING
    .split(ALIGNMENT_GATE_LINES.join('\n')).length === 2);
ok('BUILD.no-existing-prose-deleted',
  EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT.split('\n')
    .every(l => EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT.includes(l)));
ok('BUILD.selector-pairs-prompt-with-capability',
  build210gSystemPrompt(0) === EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT
  && build210gSystemPrompt(3) === EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT_WITH_GOVERNED_BINDING);
ok('BUILD.gate-number-does-not-collide',
  EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT.indexOf('GATE 12') === -1
  && EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT.split('GATE 12.').length === 2);
ok('BUILD.exactly-one-new-gate',
  ALIGNMENT_GATE_LINES.filter(l => /^GATE \d+\./.test(l.trim())).length === 1,
  'the authorization asks for ONE declaration-wide gate');

// ================================================================ closed mechanisms

section('CLOSED MECHANISMS -- R5, R6, R7 and the §210C gates are not disturbed');

for (const [name, gate] of Object.entries(CLOSED_MECHANISMS)) {
  if (name === 'status' || name === 'rule') continue;
  ok(`CLOSED.${name}-still-present`,
    EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT.includes(`${gate}.`), gate);
}
ok('CLOSED.210e-block-survives-byte-for-byte',
  EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT.includes(FINAL_GATE_LINES.join('\n')),
  'GATE 8-11 unchanged');
ok('CLOSED.no-210e-line-reworded',
  FINAL_GATE_LINES.every(l => EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT.includes(l)));
ok('CLOSED.status-recorded',
  CLOSED_MECHANISMS.status === 'CLOSED_ON_SECTION_210F_TARGETED_EVIDENCE');
ok('CLOSED.new-block-does-not-mention-a-closed-gate-by-number',
  !ALIGNMENT_GATE_LINES.some(l => /GATE (2|3|9|10|11)\b/.test(l)),
  'GATE 12 cites only GATE 8, which it continues');

// ================================================================ no deterministic half

section('NO DETERMINISTIC HALF -- R4B is instruction-only, by design');

ok('DET.declared-instruction-only', DETERMINISTIC_HALF.hasDeterministicHalf === false);
ok('DET.no-refusal-codes-added', DETERMINISTIC_HALF.refusalCodesAdded.length === 0);
ok('DET.projection-code-set-unchanged',
  PROJECTION_REFUSAL_CODES.length === 18,
  `${PROJECTION_REFUSAL_CODES.length} codes, the §210E set`);
ok('DET.no-alignment-code-was-introduced',
  !PROJECTION_REFUSAL_CODES.some(c => /ALIGN|EVIDENCE_CONDITION|PROPERTY_DRIFT|STATE_WORLD/.test(c)),
  'nothing named for R4B exists in the projection');
ok('DET.r7-code-still-present-and-still-routed',
  PROJECTION_REFUSAL_CODES.includes('NON_SEMANTIC_PLACEHOLDER_VALUE')
  && CONTRACT_INCOMPLETENESS_CODES.includes('NON_SEMANTIC_PLACEHOLDER_VALUE'),
  'R7 is closed and untouched');
ok('DET.reason-names-the-authority-boundary',
  DETERMINISTIC_HALF.reason.includes('never invent')
  && DETERMINISTIC_HALF.reason.includes('semantic verdict'));
ok('DET.contrast-with-r7-is-recorded',
  DETERMINISTIC_HALF.contrastWithR7.includes('closed set')
  && DETERMINISTIC_HALF.contrastWithR7.includes('never as a substring'));

// ================================================================ what the block must say

section('BLOCK CONTENT -- every requirement the authorization names is stated');

const BLOCK = ALIGNMENT_GATE_LINES.join('\n');
/** Line wrapping is a layout detail. Prose assertions run against the unwrapped text. */
const FLAT = BLOCK.replace(/\s+/g, ' ');

ok('SAY.invariant-is-the-authored-property',
  /`missingFact` fixes what this entry is about/.test(FLAT));
ok('SAY.every-field-read-back-against-the-property',
  ['`branchA`', '`branchB`', '`decisionIfA`', '`decisionIfB`']
    .every(f => BLOCK.includes(f))
  && /every question you bound to this entry/.test(FLAT));
ok('SAY.names-the-establishment-vocabulary',
  ['checked', 'inspected', 'tested', 'measured', 'recorded', 'verified']
    .every(w => BLOCK.includes(w)));
ok('SAY.names-procedure-completion-and-instrument-result',
  /did the procedure finish/.test(FLAT) && /did the instrument give a reading/.test(FLAT));
ok('SAY.shape-2-is-named',
  /whether the cleaning ran instead of whether anything harmful is still there/.test(FLAT)
  && /whether the thing was examined instead of whether it will carry the load/.test(FLAT),
  'the establishment process substituted for the state');
ok('SAY.state-world-test-is-stated',
  /picture the world where the state is TRUE and nobody has/.test(BLOCK)
  && /Do they put that world on the TRUE side\?/.test(FLAT));
ok('SAY.repair-direction-is-toward-the-property',
  /Bring every field back to the property/.test(FLAT)
  && /do not cut detail out of/.test(FLAT),
  'the §210C destructive-repair risk is closed off explicitly');
ok('SAY.branch-requirement',
  /branchA and branchB divide the PROPERTY/.test(FLAT)
  && /known from unknown, confirmed from unconfirmed/.test(FLAT)
  && /tested from untested/.test(FLAT)
  && /written down from not written down/.test(FLAT));
ok('SAY.absence-of-evidence-means-unresolved-not-adverse',
  /leaves the entry unresolved/.test(FLAT)
  && /never a finding that the bad state is true/.test(FLAT));
ok('SAY.decision-requirement',
  /follows from branchA BEING TRUE/.test(FLAT)
  && /not from somebody having produced a result/.test(FLAT));
ok('SAY.clarification-requirement',
  /may still ask for evidence, and usually should/.test(FLAT)
  && /does not turn the property into whether the reading was taken/.test(FLAT)
  && /the answer has to settle the property/.test(FLAT));
ok('SAY.property-selection-check',
  /if you could simply see the workplace exactly as it is/.test(FLAT)
  && /would settle this entry/.test(FLAT));
ok('SAY.adds-no-new-reason-to-declare',
  /adds no new reason to declare anything/.test(FLAT),
  'GATE 12 must not become a source of extra declarations');
ok('SAY.stated-over-contract-field-names',
  ['`missingFact`', '`branchA`', '`branchB`', '`decisionIfA`', '`decisionIfB`']
    .every(f => BLOCK.includes(f)),
  'case-independent, because the rules name the contract rather than a scenario');

// ================================================================ the narrowing

section('NARROWING -- the §210F E4 shape is protected');

ok('NARROW.process-as-property-preserved',
  /the act IS your property/.test(FLAT)
  && /in `missingFact` and in the branches both/.test(FLAT));
ok('NARROW.gate-8-carve-out-not-withdrawn',
  /GATE 8 said that case is not rare\. This gate does not take it back/.test(FLAT));
ok('NARROW.property-selection-distinguishes-act-from-evidence',
  /still turning on whether the required act was carried out/.test(FLAT));
ok('NARROW.guard-recorded-as-data', OVERCORRECTION_GUARDS.R4B.risk.length > 0
  && OVERCORRECTION_GUARDS.R4B.guard.length > 0);
ok('NARROW.guard-names-what-it-protects',
  OVERCORRECTION_GUARDS.R4B.protects === 'SECTION_210F_E4_Q3_AND_E4_Q4');
ok('NARROW.no-absolute-word-ban',
  !/never (use|write|name) the word/i.test(BLOCK)
  && !/must not (use|contain) (the )?word/i.test(BLOCK),
  'the counterfactual is the rule; the vocabulary list is guidance');

// ================================================================ mapping and hygiene

section('MAPPING AND HYGIENE');

ok('MAP.every-heading-is-mapped-to-a-rule',
  ALIGNMENT_GATE_LINES.filter(l => /^GATE \d+\./.test(l.trim()))
    .every(h => SENTENCE_TO_RULE.some(m => m.heading === h.trim())));
ok('MAP.rule-is-r4b', SENTENCE_TO_RULE.every(m => m.rule === 'R4B'));
ok('MAP.addresses-cites-the-observed-failures',
  SENTENCE_TO_RULE[0].addresses.includes('E1')
  && SENTENCE_TO_RULE[0].addresses.includes('E2')
  && SENTENCE_TO_RULE[0].addresses.includes('E3'));
ok('HYG.no-210f-scenario-vocabulary-in-the-prompt',
  !/precast|maturity probe|companion cube|balance tank|spray ball|caustic|underrun|drum|robot welding|wire feed/i
    .test(BLOCK),
  'the rule is stated over the contract, not over the cases that revealed it');
ok('HYG.no-case-labels-in-the-prompt', !/\bE[1-4]\b|\bD[1-5]\b|\bPB-0\d\b|§210/.test(BLOCK));
ok('HYG.s6-untouched', S6_STATUS.status === 'NOT_EXERCISED');

// ================================================================ fixtures

section('FIXTURES -- eight distinctions, two of them counter-controls');

{
  const problems = alignmentFixtureProblems();
  ok('FX.set-is-well-formed', problems.length === 0, problems.join('; ') || 'no problems');
  ok('FX.eight-fixtures', ALIGNMENT_FIXTURES.length === 8, `${ALIGNMENT_FIXTURES.length} fixtures`);
  ok('FX.all-target-r4b', ALIGNMENT_FIXTURES.every(f => f.targets === 'R4B'),
    'R5, R6 and R7 are closed and no fixture reopens them');
  ok('FX.counter-controls-present',
    ALIGNMENT_FIXTURES.filter(f => f.intent === 'PREVENT_OVERCORRECTION').length === 2,
    'the act-shaped property, and the question that asks for a measurement');
  ok('FX.defect-shapes-present',
    ALIGNMENT_FIXTURES.filter(f => f.alignmentVerdict === 'DRIFTED_TO_EVIDENCE').length === 2,
    'branches proxy, and decisions evidence-conditioned');
  ok('FX.every-fixture-names-the-gate',
    ALIGNMENT_FIXTURES.every(f => EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT.includes(f.decidedByGate)));
  ok('FX.state-world-placement-never-contradicts-the-verdict',
    ALIGNMENT_FIXTURES.every(f =>
      (f.stateTrueButUnestablishedWorldFallsOn === 'ADVERSE_SIDE')
      === (f.alignmentVerdict === 'DRIFTED_TO_EVIDENCE' && !f.fixtureId.includes('DECISION-EVIDENCE'))),
    'the branch-side defect is exactly the adverse-side placement; the decision-side defect is not');
  ok('FX.act-fixture-keeps-the-act-in-both-property-and-branches',
    ALIGNMENT_FIXTURES.filter(f => f.processIsTheProperty).every(f =>
      /told|passed on/i.test(f.shape.missingFact)
      && /passed on|not passed on/i.test(`${f.shape.branchA} ${f.shape.branchB}`)));
  ok('FX.branches-proxy-fixture-really-carries-the-disjunct',
    ALIGNMENT_FIXTURES.some(f => f.fixtureId.includes('BRANCHES-PROXY')
      && /no temperature readings have been taken, or/.test(f.shape.branchB)),
    'the §210F E1 shape, reproduced in a different setting');
  ok('FX.decision-fixture-has-correct-branches-and-wrong-decisions',
    ALIGNMENT_FIXTURES.some(f => f.fixtureId.includes('DECISION-EVIDENCE-CONDITIONED')
      && f.stateTrueButUnestablishedWorldFallsOn === 'TRUE_SIDE'
      && f.alignmentVerdict === 'DRIFTED_TO_EVIDENCE'),
    'isolates the decision field, which no other fixture does');
  ok('FX.clarification-counter-control-asks-for-a-measurement',
    ALIGNMENT_FIXTURES.some(f => f.fixtureId.includes('CLARIFICATION-EVIDENCE-BASED')
      && /test/i.test(f.shape.boundQuestion) && f.alignmentVerdict === 'ALIGNED'));
  ok('FX.no-fixture-labels-its-own-answer',
    ALIGNMENT_FIXTURES.every(f =>
      !/aligned|drifted|proxy|evidence-conditioned/i.test(f.scenario)));
}

// ================================================================ §210F evidence preserved

section('§210F EVIDENCE PRESERVED -- nothing frozen or persisted was touched');

{
  const V210F = join(ROOT, 'verification',
    'expert-hazlenz-210f-final-confirmation-preregistration-2026-09-09');
  const V210FH = join(ROOT, 'verification', 'expert-hazlenz-210f-hosted-confirmation-2026-09-09');
  ok('PRES.210f-preregistration-unchanged',
    sha(readFileSync(join(V210F, 'FINAL-CONFIRMATION-PREREGISTRATION-210F.json')))
    === '2c186aa15734728c81e88e54ec313cba48377083ecc5e775ed01bf1281d0c24a');
  ok('PRES.210f-raw-evidence-present-and-complete',
    readFileSync(join(V210FH, 'RAW-FIRST-PASS-210F.jsonl'), 'utf8')
      .split('\n').filter(Boolean).length === 4,
    'four raw first-pass records');
  ok('PRES.210f-ledger-records-four-calls',
    readFileSync(join(V210FH, 'CALL-LEDGER-210F.jsonl'), 'utf8')
      .split('\n').filter(Boolean).length === 4);
  ok('PRES.210f-adjudication-present',
    readFileSync(join(V210FH, 'ADJUDICATION-210F.md'), 'utf8')
      .includes('EXPERT_HAZLENZ_FINAL_FIRST_PASS_REMEDIATION_REQUIRES_REVIEW'));
  ok('PRES.210d-preregistration-still-frozen',
    sha(readFileSync(join(ROOT, 'verification',
      'expert-hazlenz-210d-confirmation-preregistration-2026-09-09',
      'CONFIRMATION-PREREGISTRATION-210D.json')))
    === '55510f9cc4e9424d543332e1c2f5db5a86d26757adba28d21730cc882420f30f');
  ok('PRES.pinned-v15-prompt-unchanged',
    sha(readFileSync(join(ROOT, 'backend', 'src', 'hazlenz', 'expert-hazlenz',
      'expert-prompt.ts')))
    === 'bfe564c25515cabf5149d9629aa9aa58ea2287dd8691dc338a2f9ec47fd0f694');
}

// ================================================================ no provider or database path
// @@ BOUNDS-SELF-SCAN-STOPS-HERE @@

section('SLICE BOUNDS');

{
  /**
   * The self-scan reads only the part of this file ABOVE the marker below, because the patterns it
   * looks for necessarily appear inside the checks themselves. Scanning the whole file would
   * assert against its own assertion text and say nothing.
   *
   * The marker is assembled from two halves so that this line is NOT itself the split point. The
   * only literal occurrence in the file is the comment that opens this section, which is where the
   * scan is meant to stop.
   */
  const MARKER = `@@ BOUNDS-SELF-SCAN` + `-STOPS-HERE @@`;
  const whole = readFileSync(__filename, 'utf8');
  const parts = whole.split(MARKER);
  const self = parts[0] as string;
  const instr = readFileSync(
    join(__dirname, 'lib', 'expert-first-pass-instruction-210g.ts'), 'utf8');
  const fx = readFileSync(join(__dirname, 'lib', 'section-210g-alignment-fixtures.ts'), 'utf8');
  ok('BOUND.marker-splits-the-file-exactly-once',
    parts.length === 2, `${parts.length - 1} marker occurrence(s), expected 1`);
  ok('BOUND.scanned-region-is-the-body-above-this-section',
    self.length > 1000 && self.includes('FIXTURES --') && !self.includes('BOUND.'),
    `${self.length} bytes scanned, ending before the bounds checks`);
  for (const [name, src] of [['suite', self], ['instruction', instr], ['fixtures', fx]] as const) {
    ok(`BOUND.${name}-has-no-provider-path`,
      !src.includes('api.anthropic.com') && !src.includes('ANTHROPIC_API_KEY')
      && !src.includes('fetch('));
    ok(`BOUND.${name}-has-no-database-path`,
      !/DataSource|createConnection|DATABASE_URL|\.query\(/.test(src));
  }
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
  ok('TOKEN.block-is-the-smallest-amendment-yet-of-the-successors',
    w.addedChars < 3279,
    `§210G +${w.addedChars} chars; §210E +3279; §210B-2 +3482. One rule, one narrowing.`);
}

console.log(`\n================ 210G ALIGNMENT SUITE: ${passed} passed, ${failed} failed`);
console.log('  provider calls: 0   database operations: 0');
console.log('  No semantic PASS may be claimed from this file. That requires a hosted run.');
if (failed > 0) process.exit(1);
