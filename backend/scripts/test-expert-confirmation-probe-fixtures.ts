/**
 * EXPERT HAZLENZ -- §143. The confirmation-probe fixture set, validated at $0.00 before it runs.
 *
 * ==================== THE RULE THIS SUITE ENFORCES ====================
 *
 * **NO BLANKET LINKAGE LABELS.** Every row must carry a `linkageRationale`; every `FORBIDDEN` row
 * must state a POSITIVE reason a link would be wrong; and a row that makes no linkage claim must say
 * `NOT_A_LINKAGE_TEST` rather than being swept into `FORBIDDEN`.
 *
 * That rule exists because of a measured cost, not a preference. The §142 manifest labelled ten of
 * sixteen rows `FORBIDDEN` by default. Nine emitted no clarification at all; the tenth was
 * semantically REQUIRED. **Not one row produced a valid FORBIDDEN opportunity**, yet the measure
 * still reported a violation and failed an advancement criterion.
 *
 * ZERO provider calls. ZERO local-model calls. $0.00. THE PROBE IS NOT EXECUTED BY THIS SUITE.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  CONFIRMATION_PROBE_FIXTURES, CONFIRMATION_PROBE_ROWS, CONFIRMATION_PROBE_BUDGET,
  CONFIRMATION_PROBE_CRITERIA, CONFIRMATION_PROBE_FIXTURE_SET_VERSION,
  confirmationFixtureByRowId,
} from '../src/hazlenz/expert-hazlenz/fixtures/linkage-confirmation-probe-v3';
import {
  LINKAGE_PROBE_FIXTURES,
} from '../src/hazlenz/expert-hazlenz/fixtures/hosted-linkage-probe-v2';
import {
  classifyRow, truthOnlyStrings, validateCohortRow,
} from '../src/hazlenz/expert-hazlenz/expert-cohort-contract';
import { buildExpertAnalysisInputFromAnalysis } from
  '../src/hazlenz/expert-hazlenz/expert-input-constructor';
import { buildExpertUserPrompt } from '../src/hazlenz/expert-hazlenz/expert-prompt';
import { CITATION_SHAPED_PATTERN } from
  '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { WORST_CASE_REQUEST_USD } from './lib/expert-execution-budget';

let passed = 0; const failures: string[] = [];
function assert(ok: boolean, label: string, detail = ''): void {
  if (ok) { passed += 1; console.log(`ok    ${label}`); }
  else { failures.push(label); console.log(`FAIL  ${label}${detail ? `  -- ${detail}` : ''}`); }
}
function section(t: string): void { console.log(`\n--- ${t}`); }

console.log('§143 CONFIRMATION PROBE FIXTURES — deterministic, NOT EXECUTED, $0.00\n');

// ===================================================================== A
section('A. structure and the composition the authorization named');
{
  const rows = CONFIRMATION_PROBE_ROWS;
  assert(CONFIRMATION_PROBE_FIXTURE_SET_VERSION === 'hazlenz.expert.dev-probe.fixtures.v3',
    'A.1 the set is versioned and distinct from v1 and v2');
  assert(rows.length >= 8 && rows.length <= 10,
    `A.2 ${rows.length} rows — within the authorized 8-10`, String(rows.length));
  const problems = rows.flatMap(validateCohortRow);
  assert(problems.length === 0, 'A.3 every row is structurally scoreable',
    problems.map(p => `${p.rowId}/${p.code}`).join(', '));
  assert(rows.every(r => r.source.rowId.startsWith('CL-')), 'A.4 all ids are CL-* v3 ids');
  assert(new Set(rows.map(r => r.source.rowId)).size === rows.length, 'A.5 ids are unique');

  const t = (v: string) => CONFIRMATION_PROBE_FIXTURES.filter(f => f.linkageTruth === v);
  assert(t('REQUIRED').length >= 3,
    `A.6 >=3 REQUIRED candidate-specific linkage opportunities (${t('REQUIRED').length})`);
  assert(t('FORBIDDEN').length >= 3,
    `A.7 >=3 POSITIVE FORBIDDEN opportunities (${t('FORBIDDEN').length})`);
  assert(t('NOT_A_LINKAGE_TEST').length >= 1,
    `A.8 >=1 row with NO linkage opportunity (${t('NOT_A_LINKAGE_TEST').length})`);
  const trueGap = CONFIRMATION_PROBE_FIXTURES.filter(f => f.roles.includes('TRUE_GAP_CONTROL'));
  assert(trueGap.length >= 2,
    `A.9 >=2 general positive clarification controls (${trueGap.length})`);
  assert(trueGap.every(f => f.row.truth.decisionCriticalGaps.length === 1),
    'A.10 each TRUE-GAP control carries exactly one gap');

  assert(CONFIRMATION_PROBE_BUDGET.targetLogicalCalls >= 8
      && CONFIRMATION_PROBE_BUDGET.targetLogicalCalls <= 10
      && CONFIRMATION_PROBE_BUDGET.hardProviderRequestCeiling <= 12
      && CONFIRMATION_PROBE_BUDGET.hardSpendCeilingUsd <= 2.00,
    'A.11 the budget is within the authorized envelope: 8-10 calls, ceiling <=12, spend <=$2.00');
  assert(CONFIRMATION_PROBE_BUDGET.hardProviderRequestCeiling * WORST_CASE_REQUEST_USD
      <= CONFIRMATION_PROBE_BUDGET.hardSpendCeilingUsd + 1e-9,
    'A.12 and the request ceiling priced at the frozen worst case is within the spend ceiling',
    `${CONFIRMATION_PROBE_BUDGET.hardProviderRequestCeiling} x $${WORST_CASE_REQUEST_USD} = `
    + `$${(CONFIRMATION_PROBE_BUDGET.hardProviderRequestCeiling * WORST_CASE_REQUEST_USD).toFixed(4)}`);
  assert(CONFIRMATION_PROBE_CRITERIA.length === 7,
    'A.13 the advancement criteria are frozen in the manifest BEFORE the probe runs');
  assert(CONFIRMATION_PROBE_CRITERIA.some(c => /INTENTIONALLY DEFERRED/.test(c.target)),
    'A.14 and the manifest records that broad clarification-retention validation is DEFERRED, so '
    + 'this narrow probe cannot be read as closing it');
  assert(CONFIRMATION_PROBE_BUDGET.arms.length === 1 && CONFIRMATION_PROBE_BUDGET.arms[0] === 'BASE',
    'A.15 ONE ARM — M14 is not attempted by the design either');
}

// ===================================================================== B
section('B. NO BLANKET LABELS — the §142 defect, made impossible');
{
  assert(CONFIRMATION_PROBE_FIXTURES.every(f => f.linkageRationale.trim().length >= 60),
    'B.1 EVERY row carries a substantive linkageRationale — a label with no reason is a build '
    + 'failure, which is what nine of §142\'s ten FORBIDDEN rows were');

  const forbidden = CONFIRMATION_PROBE_FIXTURES.filter(f => f.linkageTruth === 'FORBIDDEN');
  assert(forbidden.every(f => /POSITIVE REASON/i.test(f.linkageRationale)),
    'B.2 every FORBIDDEN row states a POSITIVE REASON a link would be wrong',
    forbidden.map(f => f.row.source.rowId).join(' '));
  const reasons = forbidden.map(f => f.linkageRationale.toLowerCase());
  assert(reasons.some(r => /ambiguous referent/.test(r)),
    'B.3 one FORBIDDEN reason is an ambiguous same-family referent');
  assert(reasons.some(r => /different hazard/.test(r)),
    'B.4 one is a different hazard');
  assert(reasons.some(r => /generic ppe/.test(r)),
    'B.5 one is a genuinely generic PPE follow-up');

  const notATest = CONFIRMATION_PROBE_FIXTURES.filter(f => f.linkageTruth === 'NOT_A_LINKAGE_TEST');
  assert(notATest.every(f => /NO LINKAGE CLAIM/i.test(f.linkageRationale)),
    'B.6 a row that makes no linkage claim says so explicitly rather than defaulting to FORBIDDEN');

  // FORBIDDEN rows must actually be able to PRODUCE an opportunity, or the denominator is empty
  // again. Each must owe a clarification, except the genuinely-generic one whose question is
  // row-level by construction.
  const canProduceOpportunity = forbidden.filter(f =>
    f.row.truth.decisionCriticalGaps.length > 0 || /generic/i.test(f.linkageRationale));
  assert(canProduceOpportunity.length === forbidden.length,
    'B.7 every FORBIDDEN row can actually PRODUCE an opportunity — §142\'s FORBIDDEN denominator '
    + 'was empty because nine of its ten rows owed no question at all');

  // The v2 set is untouched: it is the instrument that produced §142's spent evidence.
  assert(LINKAGE_PROBE_FIXTURES.length === 16,
    'B.8 the v2 fixture set is still present and still 16 rows');
  const g3 = LINKAGE_PROBE_FIXTURES.find(f => f.row.source.rowId === 'LP-G3')!;
  assert(g3.linkageExpectation === 'FORBIDDEN',
    'B.9 v2 LP-G3 STILL carries its original FORBIDDEN label — the spent probe result is NOT '
    + 'retroactively rewritten, and the historical terminal stands');
  const b2 = LINKAGE_PROBE_FIXTURES.find(f => f.row.source.rowId === 'LP-B2')!;
  assert(b2.row.truth.decisionCriticalGaps.length === 1
      && b2.row.truth.decisionCriticalGaps[0].affectedDecision === 'APPLICABILITY',
    'B.10 v2 LP-B2 truth is UNCHANGED — it remains a genuine retention miss, not repaired here');
}

// ===================================================================== C
section('C. the precedence pair, and no tuning to LP-G3');
{
  const r3 = confirmationFixtureByRowId('CL-R3')!;
  const f3 = confirmationFixtureByRowId('CL-F3')!;
  assert(r3.linkageTruth === 'REQUIRED' && f3.linkageTruth === 'FORBIDDEN',
    'C.1 THE PRECEDENCE PAIR: a control/PPE-shaped question that IS candidate-specific is REQUIRED, '
    + 'and a genuinely generic PPE question is FORBIDDEN');
  assert(/PPE-shaped in FORM/i.test(r3.linkageRationale)
      && /TEST 1 runs first/i.test(r3.linkageRationale),
    'C.2 and CL-R3\'s rationale names the collision it resolves');
  assert(/proves the\s+CL-R3 permission did not simply delete the prohibition/i.test(f3.linkageRationale),
    'C.3 CL-F3 is explicitly the control proving the repair did not delete the prohibition');

  // NOT tuned to LP-G3. Different facts entirely.
  const g3Obs = LINKAGE_PROBE_FIXTURES.find(f => f.row.source.rowId === 'LP-G3')!
    .row.source.observation.toLowerCase();
  const r3Obs = r3.row.source.observation.toLowerCase();
  for (const needle of ['drum', 'decant', 'hazard communication', 'safety data sheet', 'label']) {
    assert(!r3Obs.includes(needle),
      `C.4 CL-R3 does not reuse LP-G3's surface facts ("${needle}") — the RULE is tested, not the row`);
  }
  assert(g3Obs.includes('drum') && !r3Obs.includes('drum'),
    'C.5 confirmed by construction: LP-G3 is about drums, CL-R3 is not');

  // REQUIRED rows must give the model a genuine chance to pick the WRONG referent.
  const required = CONFIRMATION_PROBE_FIXTURES.filter(f => f.linkageTruth === 'REQUIRED');
  assert(required.every(f => f.row.source.allowedHazardFamilies.length >= 3),
    'C.6 every REQUIRED row offers several families, so a unique referent is a choice rather than '
    + 'the only option available');
  assert(required.every(f => f.row.truth.decisionCriticalGaps.length === 1),
    'C.7 and each owes exactly one gap, so a linkage result is unambiguous');
}

// ===================================================================== D
section('D. containment');
{
  const leaks: string[] = []; const citationInPrompt: string[] = [];
  for (const f of CONFIRMATION_PROBE_FIXTURES) {
    const state = {
      analysisId: f.row.source.rowId, observation: f.row.source.observation,
      inspectionContext: f.row.source.inspectionContext, jurisdiction: f.row.source.jurisdiction,
      allowedHazardFamilies: f.row.source.allowedHazardFamilies,
      hazards: [], applicabilityDecisions: [],
      governedStandards: f.row.source.governedStandards,
      answeredClarifications: f.row.source.answeredClarifications,
      supplementaryContext: f.row.source.supplementaryContext, findingMetadataByKey: {},
    };
    const prompt = buildExpertUserPrompt(buildExpertAnalysisInputFromAnalysis(state));
    for (const s of truthOnlyStrings(f.row)) {
      if (prompt.includes(s)) leaks.push(`${f.row.source.rowId}: ${s.slice(0, 40)}`);
    }
    if (CITATION_SHAPED_PATTERN.test(prompt)) citationInPrompt.push(f.row.source.rowId);
  }
  assert(leaks.length === 0, 'D.1 no truth-key-only string reaches any built prompt', leaks.join(' | '));
  assert(citationInPrompt.length === 0,
    'D.2 no built prompt carries citation-shaped text — redaction holds', citationInPrompt.join(', '));

  const src = readFileSync(join(__dirname, '..', 'src', 'hazlenz', 'expert-hazlenz',
    'fixtures', 'linkage-confirmation-probe-v3.ts'), 'utf8');
  // The needle spans a wrapped comment line, so intervening `\n * ` is tolerated.
  const flowed = src.replace(/\n\s*\*\s?/g, ' ');
  assert(/No reserved material opened/i.test(flowed)
      && /No spent formal-cohort row read, copied, paraphrased or mimicked/i.test(flowed),
    'D.3 the module states its provenance explicitly');
  assert(/LP-G3 is not reused verbatim and is not tuned to/i.test(src),
    'D.4 and states that LP-G3 is not tuned to');
  assert(CONFIRMATION_PROBE_FIXTURES.every(f => f.contradictionIsAModelError === true),
    'D.5 no fixture commissions a contradiction');

  const classes = new Set(CONFIRMATION_PROBE_FIXTURES.flatMap(f => classifyRow(f.row)));
  assert(classes.has('CLARIFICATION_OWED') && classes.has('CLARIFICATION_NOT_OWED'),
    'D.6 the set spans the case classes the diagnostics need as denominators');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) { console.log(failures.map(f => `  - ${f}`).join('\n')); process.exit(1); }
