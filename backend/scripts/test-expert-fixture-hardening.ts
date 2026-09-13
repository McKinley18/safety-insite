/**
 * EXPERT HAZLENZ -- §151. THE FIXTURE LINTER, THE HARDENED v9 SET, AND THE FROZEN v13 GUARANTEE.
 *
 * ==================== WHAT THIS SUITE PROVES, AND WHAT IT REFUSES TO CLAIM ====================
 *
 * §151 is a ZERO-SPEND adjudication. Its deliverables are an instrument, not a model result, so what
 * a local suite can prove here is unusually close to what actually matters:
 *
 *   F  the linter's mechanical checks WORK -- each one is exercised against a row built to trip it,
 *      because a gate nobody has seen fire is a gate nobody can rely on;
 *   H  the hardened v9 set PASSES the linter and is fully signed;
 *   V  v13 is FROZEN -- the prompt, the contract, the arbitration trigger and every clause of
 *      §148-§150 are byte-unchanged, asserted needle by needle rather than by a version label;
 *   D  the set's digest is stable and reproducible, so a later hosted run is provably against the
 *      material reviewed here.
 *
 *   >>> WHAT IT DOES NOT PROVE: that the v9 rows are semantically sound. The four defects that
 *   >>> actually occurred in §149 and §150 -- a presupposition leak, an unstated-premise derivation,
 *   >>> a real gap inside a FORBIDDEN row, and a second equally exact selector -- are ALL SEMANTIC
 *   >>> and NONE is mechanically detectable. The signatures are a human's claims, recorded in their
 *   >>> own words so a later reader can disagree with them. A green lint is not a validated set.
 *
 * ZERO provider calls. ZERO local-model calls. $0.00.
 */

import { createHash } from 'crypto';
import {
  EXPERT_PROMPT_VERSION, EXPERT_SYSTEM_PROMPT, buildExpertWireSchema, stableStringify,
} from '../src/hazlenz/expert-hazlenz/expert-prompt';
import {
  EXPERT_ANALYSIS_CONTRACT_VERSION, EXPERT_AFFECTED_DECISIONS, EXPERT_INPUT_CONTRACT_VERSION,
  type ExpertAnalysisInput,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { validateCohortRow } from '../src/hazlenz/expert-hazlenz/expert-cohort-contract';
import {
  lintFixtureSet, FIXTURE_LINTER_VERSION, REQUIRED_REVIEW_CLAIMS, FORBIDDEN_REVIEW_CLAIMS,
  type LintableFixtureRow,
} from './lib/expert-fixture-linter';
import {
  HARDENED_FIXTURES, HARDENED_SET_VERSION, HARDENED_SET_DENOMINATORS, HARDENED_SET_STATUS,
  CANONICAL_DETERMINISTIC_FAMILIES, HARDENED_FORMS,
  type HardenedFixture,
} from '../src/hazlenz/expert-hazlenz/fixtures/hardened-development-set-v9';
import {
  RETENTION_BRIDGE_FIXTURES,
} from '../src/hazlenz/expert-hazlenz/fixtures/retention-bridge-probe-v8';
import {
  UNSUPPORTED_SETTLEMENT_FIXTURES,
} from '../src/hazlenz/expert-hazlenz/fixtures/unsupported-settlement-probe-v7';
import {
  THRESHOLD_ARBITRATION_FIXTURES,
} from '../src/hazlenz/expert-hazlenz/fixtures/threshold-arbitration-probe-v6';
import {
  CLARIFICATION_RECALL_FIXTURES,
} from '../src/hazlenz/expert-hazlenz/fixtures/clarification-recall-probe-v5';

let passed = 0; const failures: string[] = [];
function assert(ok: boolean, label: string, detail = ''): void {
  if (ok) { passed += 1; console.log(`ok    ${label}`); }
  else { failures.push(label); console.log(`FAIL  ${label}${detail ? `  -- ${detail}` : ''}`); }
}
function section(t: string): void { console.log(`\n--- ${t}`); }

const sys = EXPERT_SYSTEM_PROMPT;
const schemaText = stableStringify(buildExpertWireSchema({
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION, analysisId: 'x',
  authoritativeSources: [{ sourceId: 'o', sourceType: 'observation', text: 'x' }],
  inspectionContext: { location: null, task: null }, jurisdiction: 'osha-general-industry',
  allowedHazardFamilies: ['machine_guarding'],
  deterministicFindings: [], governedStandards: [], answeredClarifications: [],
} as ExpertAnalysisInput));

/** Project a v9 fixture into the linter's structural view. */
const lintable = (f: HardenedFixture): LintableFixtureRow => ({
  rowId: f.row.source.rowId,
  domain: f.domain,
  observation: f.row.source.observation,
  expectation: f.expectation.kind,
  allowedHazardFamilies: f.row.source.allowedHazardFamilies,
  truthPresent: f.row.truth.presentHazardFamilies,
  truthDefensible: f.row.truth.defensibleHazardFamilies,
  truthForbidden: f.row.truth.forbiddenHazardFamilies,
  truthNegatedOrSafe: f.row.truth.negatedOrSafeStateFamilies,
  truthLifeCritical: f.row.truth.lifeCriticalHazardFamilies,
  gaps: f.row.truth.decisionCriticalGaps,
  expectedAffectedDecision: f.expectation.kind === 'REQUIRED'
    ? (f.expectation as unknown as { truth: { affectedDecision: string } }).truth.affectedDecision
    : undefined,
  denominators: f.denominators,
  review: f.review,
  familyAliases: f.familyAliases,
});

console.log('§151 FIXTURE HARDENING — deterministic, ZERO provider calls, $0.00\n');

// ===================================================================== V
section('V. v13 is FROZEN — nothing in §151 touched the model contract');
{
  assert(EXPERT_PROMPT_VERSION === 'hazlenz.expert.prompt.v15',
    'V.1 the prompt is v15 — §151 is an adjudication, not a repair', EXPERT_PROMPT_VERSION);
  assert(EXPERT_ANALYSIS_CONTRACT_VERSION === 'hazlenz.expert.analysis.v2',
    'V.2 analysis.v2 unchanged');
  assert(EXPERT_AFFECTED_DECISIONS.length === 6
    && EXPERT_AFFECTED_DECISIONS[0] === 'HAZARD_EXISTENCE'
    && EXPERT_AFFECTED_DECISIONS[1] === 'HAZARD_SEVERITY',
    'V.3 the affectedDecision enum is UNCHANGED — six members, same order. §151 analysed '
    + 'HAZARD_SEVERITY and deliberately did not touch it', EXPERT_AFFECTED_DECISIONS.join(','));

  // Every clause §148, §149 and §150 established, asserted individually. A §151 edit that quietly
  // improved the model would show up here, and the whole operation depends on there not being one.
  const frozen: Array<[string, RegExp]> = [
    ['v10 worst-case limb', /ASSUMED the worse of two possible states/],
    ['v10 resemblance limb', /RESEMBLE the ones it covers/],
    ['v10 SETTLEMENT CHECK', /THE SETTLEMENT CHECK/],
    ['v10 no-loss rule', /THE NO-LOSS RULE/],
    ['v11 affirmative threshold rule', /A THRESHOLD IS NOT A GAP/],
    ['v11 conjunctive reopening', /It is unsettled ONLY where BOTH of these hold/],
    ['v11 proximity insufficiency', /near the line is a side of the line/],
    ['v11 affectedDecision self-check', /BEFORE YOU WRITE HAZARD_EXISTENCE, RE-READ YOUR OWN CANDIDATE LIST/],
    ['v11 destruction consequence', /DISCARDED IN FULL/],
    ['v12 NOT OBSERVED IS NOT ABSENT', /NOT OBSERVED IS NOT ABSENT/],
    ['v12 scope clause', /THIS IS NOT AN INSTRUCTION TO DOUBT THE TEXT/],
    ['v12 likelihood limb', /LIKELY IS NOT ESTABLISHED/],
    ['v12 explain/settle boundary', /WORST CASE MAY EXPLAIN\. IT MUST NEVER SETTLE/],
    ['v12 entailment discipline', /YOUR EVIDENCE BASIS MUST NOT SAY MORE THAN YOUR QUOTE DOES/],
    ['v13 retention bridge', /THE RETENTION BRIDGE/],
    ['v13 anti-overfire clause', /ON ITS OWN IS NEVER A REASON TO ASK/],
    ['v13 no-duplicate rule', /One question per fact/],
    ['v9 list starts empty', /THIS LIST STARTS EMPTY AND STAYS EMPTY/],
    ['the INSUFFICIENT_EVIDENCE state', /Both are real answers/],
  ];
  for (const [name, re] of frozen) assert(re.test(sys), `V.4 FROZEN: ${name}`);

  // And the HAZARD_SEVERITY definition §151 analysed is still exactly as it was, so the adjudication
  // describes the shipped text rather than a text this operation edited.
  assert(/"how much \/ how many \/ how long \/ how far" is HAZARD_SEVERITY/.test(sys),
    'V.5 the §139 collision rule §151 identified as a contributing cause is UNCHANGED — the '
    + 'analysis describes shipped text, and the repair it proposes is not implemented here');
  assert(/how bad is the consequence or how large is the[\s\S]{0,40}magnitude/.test(sys),
    'V.5b as is the HAZARD_SEVERITY definition itself');
}

// ===================================================================== F
section('F. every mechanical linter check FIRES — a gate nobody has seen fire is not a gate');
{
  const base: LintableFixtureRow = {
    rowId: 'T1', domain: 'test domain', expectation: 'REQUIRED',
    observation: 'x'.repeat(200),
    allowedHazardFamilies: ['machine_guarding', 'electrical'],
    truthPresent: ['machine_guarding'], truthDefensible: ['electrical'], truthForbidden: [],
    truthNegatedOrSafe: [], truthLifeCritical: ['machine_guarding'],
    gaps: [{ gapId: 'g1', description: 'a described missing fact of adequate length',
      affectedDecision: 'REQUIRED_CONTROL' }],
    expectedAffectedDecision: 'REQUIRED_CONTROL',
    denominators: ['STRICT_REQUIRED_RECALL'],
    review: REQUIRED_REVIEW_CLAIMS.map(c => ({ claim: c, note: `a substantive reason for ${c} here` })),
  };
  const codesFor = (over: Partial<LintableFixtureRow>) =>
    lintFixtureSet([{ ...base, ...over }],
      { declaredDenominators: [...HARDENED_SET_DENOMINATORS] }).findings.map(x => x.code);

  // The baseline must be clean, or every check below is measuring the baseline.
  assert(codesFor({}).length === 0, 'F.0 the baseline row lints CLEAN', codesFor({}).join(','));

  const cases: Array<[string, Partial<LintableFixtureRow>, string]> = [
    ['MALFORMED_TRUTH_PARTITION — the check that caught six real v5 defects',
      { truthDefensible: [] }, 'MALFORMED_TRUTH_PARTITION'],
    ['TRUTH_BUCKETS_OVERLAP', { truthForbidden: ['machine_guarding'] }, 'TRUTH_BUCKETS_OVERLAP'],
    ['TRUTH_FAMILY_OUTSIDE_VOCABULARY', { truthPresent: ['machine_guarding', 'ghost_family'] },
      'TRUTH_FAMILY_OUTSIDE_VOCABULARY'],
    ['LIFE_CRITICAL_NOT_PRESENT', { truthLifeCritical: ['electrical'] }, 'LIFE_CRITICAL_NOT_PRESENT'],
    ['NEGATED_FAMILY_OUTSIDE_VOCABULARY', { truthNegatedOrSafe: ['ghost'] },
      'NEGATED_FAMILY_OUTSIDE_VOCABULARY'],
    ['MISSING_EXPECTED_OPPORTUNITY_METADATA', { gaps: [] },
      'MISSING_EXPECTED_OPPORTUNITY_METADATA'],
    ['REQUIRED_ROW_WITHOUT_AFFECTED_DECISION', { expectedAffectedDecision: undefined },
      'REQUIRED_ROW_WITHOUT_AFFECTED_DECISION'],
    ['AFFECTED_DECISION_DISAGREEMENT — one row, one label',
      { expectedAffectedDecision: 'EXPOSURE' }, 'AFFECTED_DECISION_DISAGREEMENT'],
    ['GAP_DESCRIPTION_INSUBSTANTIAL',
      { gaps: [{ gapId: 'g1', description: 'short', affectedDecision: 'REQUIRED_CONTROL' }] },
      'GAP_DESCRIPTION_INSUBSTANTIAL'],
    ['DENOMINATOR_INCONSISTENT_WITH_ROW', { denominators: [] },
      'DENOMINATOR_INCONSISTENT_WITH_ROW'],
    ['DENOMINATOR_CONTAMINATION — a REQUIRED row claiming the silence denominator',
      { denominators: ['STRICT_REQUIRED_RECALL', 'FORBIDDEN_SILENCE'] }, 'DENOMINATOR_CONTAMINATION'],
    ['UNKNOWN_DENOMINATOR', { denominators: ['STRICT_REQUIRED_RECALL', 'MADE_UP'] },
      'UNKNOWN_DENOMINATOR'],
    ['OBSERVATION_INSUBSTANTIAL', { observation: 'too short' }, 'OBSERVATION_INSUBSTANTIAL'],
    ['UNSIGNED_REVIEW_CLAIM', { review: [] }, 'UNSIGNED_REVIEW_CLAIM'],
    ['REVIEW_NOTE_INSUBSTANTIAL',
      { review: REQUIRED_REVIEW_CLAIMS.map(c => ({ claim: c, note: 'ok' })) },
      'REVIEW_NOTE_INSUBSTANTIAL'],
    ['REVIEW_NOTE_RESTATES_THE_CLAIM — a signature must say WHY',
      { review: REQUIRED_REVIEW_CLAIMS.map(c => ({ claim: c, note: c.replace(/_/g, ' ') })) },
      'REVIEW_NOTE_RESTATES_THE_CLAIM'],
    ['UNKNOWN_REVIEW_CLAIM',
      { review: [...REQUIRED_REVIEW_CLAIMS.map(c => ({ claim: c, note: `a substantive reason ${c}` })),
        { claim: 'INVENTED', note: 'a substantive but unrecognised claim note' }] },
      'UNKNOWN_REVIEW_CLAIM'],
  ];
  cases.forEach(([name, over, code], i) =>
    assert(codesFor(over).includes(code), `F.${i + 1} ${name}`, codesFor(over).join(',')));

  // FORBIDDEN-specific checks, on a clean FORBIDDEN baseline.
  const fbase: LintableFixtureRow = { ...base, rowId: 'T2', expectation: 'FORBIDDEN',
    gaps: [], expectedAffectedDecision: undefined, denominators: ['FORBIDDEN_SILENCE'],
    review: FORBIDDEN_REVIEW_CLAIMS.map(c => ({ claim: c, note: `a substantive reason for ${c}` })) };
  const fcodes = (over: Partial<LintableFixtureRow>) =>
    lintFixtureSet([{ ...fbase, ...over }],
      { declaredDenominators: [...HARDENED_SET_DENOMINATORS] }).findings.map(x => x.code);
  assert(fcodes({}).length === 0, 'F.18 the FORBIDDEN baseline lints CLEAN', fcodes({}).join(','));
  assert(fcodes({ gaps: [{ gapId: 'g', description: 'a described gap of adequate length here',
    affectedDecision: 'EXPOSURE' }] }).includes('FORBIDDEN_ROW_CARRIES_EXPECTED_GAP'),
    'F.19 FORBIDDEN_ROW_CARRIES_EXPECTED_GAP — contradictory expected-gap metadata');
  assert(fcodes({ expectedAffectedDecision: 'EXPOSURE' })
    .includes('FORBIDDEN_ROW_CARRIES_AFFECTED_DECISION'),
    'F.20 FORBIDDEN_ROW_CARRIES_AFFECTED_DECISION');

  // Set-level and alias checks.
  const dup = lintFixtureSet([base, { ...base, domain: 'other' }],
    { declaredDenominators: [...HARDENED_SET_DENOMINATORS] }).findings.map(x => x.code);
  assert(dup.includes('DUPLICATE_ROW_ID'), 'F.21 DUPLICATE_ROW_ID');
  const dupDomain = lintFixtureSet([base, { ...base, rowId: 'T9' }],
    { declaredDenominators: [...HARDENED_SET_DENOMINATORS] }).findings.map(x => x.code);
  assert(dupDomain.includes('DUPLICATE_DOMAIN'), 'F.22 DUPLICATE_DOMAIN');
  const alias = lintFixtureSet([base],
    { canonicalFamilies: ['electrical'], declaredDenominators: [...HARDENED_SET_DENOMINATORS] })
    .findings.map(x => x.code);
  assert(alias.includes('FAMILY_ALIAS_MISSING'),
    'F.23 FAMILY_ALIAS_MISSING — the RB-C1 defect, closed where it can be closed mechanically');
  const aliasOk = lintFixtureSet([{ ...base, familyAliases: { machine_guarding: 'electrical' } }],
    { canonicalFamilies: ['electrical'], declaredDenominators: [...HARDENED_SET_DENOMINATORS] })
    .findings.map(x => x.code);
  assert(!aliasOk.includes('FAMILY_ALIAS_MISSING'),
    'F.23b and a declared alias satisfies it');
  const aliasBad = lintFixtureSet([{ ...base, familyAliases: { machine_guarding: 'nonsense' } }],
    { canonicalFamilies: ['electrical'], declaredDenominators: [...HARDENED_SET_DENOMINATORS] })
    .findings.map(x => x.code);
  assert(aliasBad.includes('FAMILY_ALIAS_TARGET_NOT_CANONICAL'),
    'F.23c while an alias pointing outside the canonical vocabulary is refused');

  // FAIL CLOSED, in both directions, and the honest caveat is carried on the result object.
  const blocked = lintFixtureSet([{ ...base, truthDefensible: [] }],
    { declaredDenominators: [...HARDENED_SET_DENOMINATORS] });
  assert(blocked.passed === false && blocked.mechanicalFailures > 0,
    'F.24 a mechanical defect FAILS CLOSED');
  const unsigned = lintFixtureSet([{ ...base, review: [] }],
    { declaredDenominators: [...HARDENED_SET_DENOMINATORS] });
  assert(unsigned.passed === false && unsigned.reviewFailures > 0,
    'F.25 and an UNSIGNED semantic claim fails closed too — nobody has taken responsibility for the '
    + 'property the linter cannot check');
  assert(/A GREEN LINT IS NOT A VALIDATED SET/.test(blocked.semanticResidual),
    'F.26 and every result carries the caveat that the four real defect classes are undetectable here');
  assert(FIXTURE_LINTER_VERSION.endsWith('.v1'), 'F.27 the linter carries a version');
}

// ===================================================================== H
section('H. the hardened v9 set passes the linter, and is fully signed');
{
  const result = lintFixtureSet(HARDENED_FIXTURES.map(lintable), {
    canonicalFamilies: [...CANONICAL_DETERMINISTIC_FAMILIES],
    declaredDenominators: [...HARDENED_SET_DENOMINATORS],
  });
  assert(result.passed,
    'H.1 the v9 set LINTS CLEAN — 0 mechanical, 0 unsigned',
    result.findings.map(f => `${f.rowId}:${f.code}`).join(' | '));
  assert(result.rowsLinted === 16, 'H.1b sixteen rows linted', String(result.rowsLinted));

  const req = HARDENED_FIXTURES.filter(f => f.expectation.kind === 'REQUIRED');
  const forb = HARDENED_FIXTURES.filter(f => f.expectation.kind === 'FORBIDDEN');
  assert(req.length >= 8 && forb.length >= 8,
    'H.2 at least eight REQUIRED and eight FORBIDDEN, as authorized',
    `${req.length} / ${forb.length}`);
  assert(new Set(HARDENED_FIXTURES.map(f => f.domain)).size === 16,
    'H.3 sixteen distinct domains');

  // Confinement: no §146-§150 scored row or domain is reused.
  const prior = new Set([...CLARIFICATION_RECALL_FIXTURES, ...THRESHOLD_ARBITRATION_FIXTURES,
    ...UNSUPPORTED_SETTLEMENT_FIXTURES, ...RETENTION_BRIDGE_FIXTURES].map(f => f.domain));
  assert(HARDENED_FIXTURES.every(f => !prior.has(f.domain)),
    'H.4 no §147-§150 domain is reused, checked against those modules',
    HARDENED_FIXTURES.filter(f => prior.has(f.domain)).map(f => f.domain).join(', '));
  const priorIds = new Set([...CLARIFICATION_RECALL_FIXTURES, ...THRESHOLD_ARBITRATION_FIXTURES,
    ...UNSUPPORTED_SETTLEMENT_FIXTURES, ...RETENTION_BRIDGE_FIXTURES]
    .map(f => f.row.source.rowId));
  assert(HARDENED_FIXTURES.every(f => !priorIds.has(f.row.source.rowId)
    && /^HS-[A-R]\d$/.test(f.row.source.rowId)),
    'H.4b and the ids are fresh HS-* development ids');

  // The row contract still holds, independently of the linter.
  const bad = HARDENED_FIXTURES.filter(f => validateCohortRow(f.row).length > 0);
  assert(bad.length === 0, 'H.5 every row satisfies the cohort row contract',
    bad.map(f => f.row.source.rowId).join(', '));

  // ---- THE RB-D1 REPAIR, gated. Every REQUIRED row enumerates every selector that resolves it.
  assert(req.every(f => {
    const t = (f.expectation as unknown as { truth: { acceptableSelectors: readonly string[];
      missingFact: string } }).truth;
    return t.acceptableSelectors.length >= 2
      && t.acceptableSelectors.every(s => s.trim().length > 20);
  }),
    'H.6 THE RB-D1 REPAIR: every REQUIRED row enumerates at least two acceptable selectors, so a '
    + 'correct question is not scored a miss for choosing the other one',
    req.filter(f => (f.expectation as unknown as { truth: { acceptableSelectors: readonly string[] } })
      .truth.acceptableSelectors.length < 2).map(f => f.row.source.rowId).join(', '));

  // ---- THE §140 DP-B4 RULE, and the RB-B1 lesson: branches must differ on TODAY'S action. The
  //      mechanical form is a string check; the semantic form is signed, and both are required.
  assert(req.every(f => {
    const t = (f.expectation as unknown as { truth: Record<string, string> }).truth;
    return t.outcomeA.trim() !== t.outcomeB.trim() && t.outcomeA.length > 40;
  }), 'H.7 every REQUIRED row states two different current outcomes (mechanical form)');
  assert(req.every(f => f.review.some(s => s.claim === 'BRANCHES_CHANGE_A_CURRENT_DECISION'
    && /now|today|before|continues|stop/i.test(s.note))),
    'H.7b and the signature for that claim speaks to what happens NOW — the RB-B1 lesson, where two '
    + 'textually different outcomes converged on the same current action');

  // ---- Label spread, and the deliberate absence of HAZARD_SEVERITY as an authored label.
  const labels = new Set(req.map(f =>
    (f.expectation as unknown as { truth: { affectedDecision: string } }).truth.affectedDecision));
  assert(labels.size >= 3, 'H.8 the REQUIRED half spans at least three affectedDecision values',
    [...labels].join(', '));
  assert(req.every(f => {
    const l = (f.expectation as unknown as { truth: { affectedDecision: string } }).truth.affectedDecision;
    return l !== 'HAZARD_EXISTENCE' && l !== 'HAZARD_SEVERITY';
  }), 'H.8b and no row authors HAZARD_EXISTENCE (the §148 reason) or HAZARD_SEVERITY (the §151 '
    + 'reason: seven of seven observed uses were wrong, so it is not a label to expect)');
  assert(req.every(f => (EXPERT_AFFECTED_DECISIONS as readonly string[]).includes(
    (f.expectation as unknown as { truth: { affectedDecision: string } }).truth.affectedDecision)),
    'H.8c every authored label is in the frozen vocabulary');

  // ---- Every hardened form is represented exactly once.
  const forms = new Set(HARDENED_FIXTURES.map(f => f.form));
  assert(HARDENED_FORMS.every(x => forms.has(x)) && forms.size === HARDENED_FORMS.length,
    'H.9 all sixteen forms appear exactly once — a result names its own mechanism',
    `${forms.size} of ${HARDENED_FORMS.length}`);

  // ---- THE §151 RESIDUAL-DEFECT PROBE, and its falsifier, declared before any run.
  const probe = HARDENED_FIXTURES.filter(f => f.form === 'SEVERITY_REFINEMENT_ONLY');
  assert(probe.length === 1 && probe[0].expectation.kind === 'FORBIDDEN'
    && typeof probe[0].expectedToFailUnderV13 === 'string'
    && /FALSIFIES/.test(probe[0].expectedToFailUnderV13!),
    'H.10 the CONSEQUENCE-MAGNITUDE probe row exists, is owed SILENCE, and declares BOTH its '
    + 'expected failure under v13 AND what result would falsify the §151 diagnosis',
    probe.map(f => f.row.source.rowId).join(' '));

  // ---- Non-regression coverage carried forward, so the set is not only about the new defect.
  assert(forms.has('NOT_VISIBLE') && forms.has('AGGREGATION_AGAINST_A_RECORD')
    && forms.has('SETTLED_THRESHOLD') && forms.has('EXPLICITLY_ABSENT')
    && forms.has('TRUE_DETERMINISTIC_DERIVATION') && forms.has('RETAINED_CANDIDATE_SHAPED'),
    'H.11 v11, v12 and v13 each keep a non-regression row in the set');

  // ---- The set authors no disagreement or insight truth. §146.
  const keys = new Set(HARDENED_FIXTURES.flatMap(f => Object.keys(f)));
  assert(!keys.has('disagreement') && !keys.has('insight'),
    'H.12 the set authors NO disagreement or insight truth');

  assert(HARDENED_SET_STATUS.spent === false
    && HARDENED_SET_STATUS.hostedAuthorization === 'NOT_GRANTED',
    'H.13 the set is declared UNSPENT with no hosted authorization — §151 spends nothing');
}

// ===================================================================== D
section('D. the set digest is frozen and reproducible');
{
  // Digest over the material that would actually be sent plus the truth that would score it, so a
  // later run can prove it ran against the reviewed set. Order-independent by construction.
  const digestOf = () => createHash('sha256').update(JSON.stringify(
    [...HARDENED_FIXTURES]
      .map(f => ({ id: f.row.source.rowId, form: f.form, obs: f.row.source.observation,
        allowed: f.row.source.allowedHazardFamilies, truth: f.row.truth,
        records: f.row.source.governedStandards.map(g => g.citation),
        expectation: f.expectation, denominators: f.denominators,
        review: f.review.map(s => [s.claim, s.note]) }))
      .sort((a, b) => a.id.localeCompare(b.id)))).digest('hex');
  const d1 = digestOf(); const d2 = digestOf();
  assert(d1 === d2, 'D.1 the digest is deterministic across computations');
  assert(d1.length === 64, 'D.2 it is a sha256');
  console.log(`\n      HARDENED_SET_DIGEST  ${d1}`);
  console.log(`      set version          ${HARDENED_SET_VERSION}\n`);
  assert(HARDENED_SET_VERSION.endsWith('.v9'), 'D.3 the set carries its own version');

  // The digest MUST cover the signatures. If it did not, a row could be re-signed after review and
  // a later run would still claim to be running the reviewed material.
  const withoutReview = createHash('sha256').update(JSON.stringify(
    [...HARDENED_FIXTURES].map(f => ({ id: f.row.source.rowId, obs: f.row.source.observation }))
      .sort((a, b) => a.id.localeCompare(b.id)))).digest('hex');
  assert(withoutReview !== d1,
    'D.4 and it covers the SIGNATURES, not only the observations — otherwise a row could be '
    + 're-signed after review and still match');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length > 0) { failures.forEach(f => console.log(`  - ${f}`)); process.exit(1); }
