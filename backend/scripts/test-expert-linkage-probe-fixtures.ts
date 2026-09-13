/**
 * EXPERT HAZLENZ -- §141. THE REPLACEMENT PROBE'S FIXTURE SET, validated at $0.00 before it runs.
 *
 * A probe manifest that has not been checked is a plan, not an instrument. §140 spent real money on
 * a set containing an answer key (DP-B4) that could not survive the contract it was written to
 * exercise, and only found out afterwards. Everything mechanically checkable is checked here, before
 * a single request is authorized.
 *
 * A -- structural validity and role minimums the authorization named.
 * B -- v1 is UNTOUCHED and the two superseded rows are disclosed with old truth, new truth and why.
 * C -- the linkage design: REQUIRED rows genuinely owe a status-determining question, the ambiguity
 *      control genuinely has more than one candidate a question could mean.
 * D -- no truth-key leak, and no spent-cohort contact.
 *
 * ZERO provider calls. ZERO local-model calls. $0.00. THE PROBE IS NOT EXECUTED BY THIS SUITE.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  LINKAGE_PROBE_FIXTURES, LINKAGE_PROBE_ROWS, LINKAGE_PROBE_FIXTURE_SET_VERSION,
  NEXT_PROBE_ADVANCEMENT_CRITERIA, linkageRowsWithRole, linkageFixtureByRowId,
} from '../src/hazlenz/expert-hazlenz/fixtures/hosted-linkage-probe-v2';
import {
  HOSTED_REMEDIATION_PROBE_FIXTURES,
} from '../src/hazlenz/expert-hazlenz/fixtures/hosted-remediation-probe-v1';
import {
  classifyRow, truthOnlyStrings, validateCohortRow,
} from '../src/hazlenz/expert-hazlenz/expert-cohort-contract';
import { buildExpertAnalysisInputFromAnalysis } from
  '../src/hazlenz/expert-hazlenz/expert-input-constructor';
import { buildExpertUserPrompt } from '../src/hazlenz/expert-hazlenz/expert-prompt';
import { CITATION_SHAPED_PATTERN } from
  '../src/hazlenz/expert-hazlenz/expert-contract.types';

let passed = 0; const failures: string[] = [];
function assert(ok: boolean, label: string, detail = ''): void {
  if (ok) { passed += 1; console.log(`ok    ${label}`); }
  else { failures.push(label); console.log(`FAIL  ${label}${detail ? `  -- ${detail}` : ''}`); }
}
function section(t: string): void { console.log(`\n--- ${t}`); }

console.log('§141 LINKAGE PROBE FIXTURES — deterministic, ZERO provider calls, NOT EXECUTED\n');

// ===================================================================== A
section('A. structure and the role minimums the authorization named');
{
  const rows = LINKAGE_PROBE_ROWS;
  assert(LINKAGE_PROBE_FIXTURE_SET_VERSION === 'hazlenz.expert.dev-probe.fixtures.v2',
    'A.1 the set is versioned and distinct from v1');
  assert(rows.length >= 12 && rows.length <= 16,
    `A.2 the set is ${rows.length} rows — within the authorized 12-16`, String(rows.length));
  const problems = rows.flatMap(validateCohortRow);
  assert(problems.length === 0, 'A.3 every row is structurally scoreable',
    problems.map(p => `${p.rowId}/${p.code}`).join(', '));
  assert(rows.every(r => r.source.rowId.startsWith('LP-')), 'A.4 all ids are LP-* development ids');
  assert(new Set(rows.map(r => r.source.rowId)).size === rows.length, 'A.5 ids are unique');

  const n = (r: Parameters<typeof linkageRowsWithRole>[0]) => linkageRowsWithRole(r).length;
  assert(n('NO_GAP_CONTROL') >= 4, `A.6 >=4 NO-GAP negative controls (${n('NO_GAP_CONTROL')})`);
  assert(n('TRUE_GAP_CONTROL') >= 4, `A.7 >=4 TRUE-GAP positive controls (${n('TRUE_GAP_CONTROL')})`);
  assert(n('GOVERNED_RELEVANT') >= 1 && n('GOVERNED_UNRELATED') >= 1
      && n('GOVERNED_ABSENT') >= 1 && n('GOVERNED_NARROWER') >= 1,
    'A.8 the governed quartet is retained: relevant, unrelated, none, narrower');
  assert(n('CITATION_ADVERSARIAL') >= 1, 'A.9 an adversarial citation-provenance case is retained');

  const trueGap = linkageRowsWithRole('TRUE_GAP_CONTROL');
  assert(trueGap.every(f => f.row.truth.decisionCriticalGaps.length === 1),
    'A.10 every TRUE-GAP control carries EXACTLY one gap, so retention is unambiguous');
  assert(new Set(trueGap.map(f => f.row.truth.decisionCriticalGaps[0].affectedDecision)).size
      === trueGap.length,
    'A.11 the TRUE-GAP controls still cover four DISTINCT affectedDecision values',
    trueGap.map(f => f.row.truth.decisionCriticalGaps[0].affectedDecision).join(' '));
  assert(linkageRowsWithRole('NO_GAP_CONTROL').every(f => f.row.truth.decisionCriticalGaps.length === 0),
    'A.12 every NO-GAP control owes no gap');

  assert(NEXT_PROBE_ADVANCEMENT_CRITERIA.length === 9,
    'A.13 the advancement criteria are frozen in the manifest BEFORE the probe runs, not chosen '
    + 'after seeing the result');
}

// ===================================================================== B
section('B. v1 is untouched, and every changed truth is disclosed');
{
  // The v1 module is the instrument that produced §140's executed evidence. If this suite can still
  // import it and its rows still validate, it has not been quietly edited to match the new set.
  assert(HOSTED_REMEDIATION_PROBE_FIXTURES.length === 16,
    'B.1 the v1 fixture set is still present and still 16 rows');
  const b4 = HOSTED_REMEDIATION_PROBE_FIXTURES.find(f => f.row.source.rowId === 'DP-B4')!;
  assert(b4.row.truth.decisionCriticalGaps[0].description
      .includes('how long the worker has been performing the dry breaking task'),
    'B.2 v1 DP-B4 still carries its ORIGINAL authored gap — the executed evidence is not rewritten');
  const b1 = HOSTED_REMEDIATION_PROBE_FIXTURES.find(f => f.row.source.rowId === 'DP-B1')!;
  assert(b1.row.truth.decisionCriticalGaps[0].affectedDecision === 'EXPOSURE',
    'B.3 v1 DP-B1 is likewise unchanged');

  const superseding = LINKAGE_PROBE_FIXTURES.filter(f => f.supersedes);
  assert(superseding.length === 2,
    'B.4 exactly two rows supersede a v1 row — DP-B4 and DP-B1');
  assert(superseding.every(f => f.supersedes!.oldTruth.length > 0
      && f.supersedes!.newTruth.length > 0 && f.supersedes!.whyOldWasInvalid.length > 0),
    'B.5 each records OLD truth, NEW truth and WHY — a silent fixture swap is how an instrument '
    + 'stops being evidence');
  const b4New = superseding.find(f => f.supersedes!.v1RowId === 'DP-B4')!;
  assert(/does NOT lead to different current outcomes|do NOT lead to different current outcomes/i
      .test(b4New.supersedes!.whyOldWasInvalid),
    'B.6 DP-B4 is superseded because the AUTHORED GAP failed the counterfactual contract');
  assert(/the model was NOT changed/i.test(b4New.supersedes!.whyOldWasInvalid),
    'B.7 and the disclosure states the model was not changed to satisfy it');
  const b1New = superseding.find(f => f.supersedes!.v1RowId === 'DP-B1')!;
  assert(/DP_B1_CAUSE = UNKNOWN/.test(b1New.supersedes!.whyOldWasInvalid),
    'B.8 DP-B1 is REPLACED with its cause recorded as UNKNOWN — not rationalised into a finding');
  assert(b1New.row.truth.decisionCriticalGaps[0].affectedDecision === 'EXPOSURE',
    'B.9 the replacement tests the SAME contract property (EXPOSURE)');
  assert(!b1New.row.source.observation.toLowerCase().includes('trench')
      && !b1New.row.source.observation.toLowerCase().includes('soil'),
    'B.10 on entirely different surface facts — the rule is tested, the row is not taught');
}

// ===================================================================== C
section('C. the linkage design actually creates the opportunities §140 lacked');
{
  const required = LINKAGE_PROBE_FIXTURES.filter(f => f.linkageExpectation === 'REQUIRED');
  assert(required.length >= 4,
    `C.1 >=4 rows where the repaired contract makes linkage REQUIRED (${required.length}) — §140 `
    + 'created ZERO, which is why linkage came back unexercised');
  assert(required.every(f => f.row.truth.decisionCriticalGaps.length >= 1),
    'C.2 every REQUIRED row genuinely owes a question — linkage cannot be observed without one');
  assert(required.every(f => f.row.truth.presentHazardFamilies.length >= 1),
    'C.3 and genuinely owes a candidate for that question to attach to');

  const nonContradictory = LINKAGE_PROBE_FIXTURES.find(f => f.row.source.rowId === 'LP-L3')!;
  assert(nonContradictory.linkageExpectation === 'REQUIRED'
      && nonContradictory.row.truth.decisionCriticalGaps[0].affectedDecision === 'HAZARD_EXISTENCE',
    'C.4 >=1 VALID LINKED NON-CONTRADICTORY case: a HAZARD_EXISTENCE question that is legitimate '
    + 'because existence is genuinely open');

  const ambiguous = linkageRowsWithRole('LINKAGE_AMBIGUOUS_MUST_NOT_LINK');
  assert(ambiguous.length >= 1 && ambiguous.every(f => f.linkageExpectation === 'FORBIDDEN'),
    'C.5 >=1 ambiguous same-row/same-family case where linkage MUST remain absent');
  assert(/two exposed drives|no unique referent|NO UNIQUE REFERENT/i
      .test(ambiguous[0].row.truth.authoringRationale),
    'C.6 and its rationale states WHY there is no unique referent');

  // A contradiction is a model error. The manifest must never claim to have commissioned one.
  assert(LINKAGE_PROBE_FIXTURES.every(f => f.contradictionIsAModelError === true),
    'C.7 every row records that a contradiction would be a MODEL ERROR — a fixture cannot instruct '
    + 'one, and arbitration is proven deterministically, not by hoping the model errs');

  // FORBIDDEN rows must be genuinely ambiguous or genuinely linkless, never merely unlabelled.
  const forbidden = LINKAGE_PROBE_FIXTURES.filter(f => f.linkageExpectation === 'FORBIDDEN');
  assert(forbidden.length >= 4, `C.8 >=4 FORBIDDEN rows give the violation counter a denominator `
    + `(${forbidden.length})`);
  const b2 = linkageFixtureByRowId('LP-B2')!;
  assert(b2.linkageExpectation === 'FORBIDDEN',
    'C.9 the §140 row whose link was correctly WITHHELD is now labelled FORBIDDEN, so the repaired '
    + 'measure scores it as correct rather than as a missed opportunity');
}

// ===================================================================== D
section('D. containment — no truth leak, no spent-cohort contact');
{
  const leaks: string[] = [];
  const citationInPrompt: string[] = [];
  for (const f of LINKAGE_PROBE_FIXTURES) {
    const det = {
      analysisId: f.row.source.rowId,
      observation: f.row.source.observation,
      inspectionContext: f.row.source.inspectionContext,
      jurisdiction: f.row.source.jurisdiction,
      allowedHazardFamilies: f.row.source.allowedHazardFamilies,
      hazards: [], applicabilityDecisions: [],
      governedStandards: f.row.source.governedStandards,
      answeredClarifications: f.row.source.answeredClarifications,
      supplementaryContext: f.row.source.supplementaryContext,
      findingMetadataByKey: {},
    };
    const prompt = buildExpertUserPrompt(buildExpertAnalysisInputFromAnalysis(det));
    for (const s of truthOnlyStrings(f.row)) {
      if (prompt.includes(s)) leaks.push(`${f.row.source.rowId}: ${s.slice(0, 50)}`);
    }
    if (CITATION_SHAPED_PATTERN.test(prompt)) citationInPrompt.push(f.row.source.rowId);
  }
  assert(leaks.length === 0, 'D.1 no truth-key-only string reaches any built prompt',
    leaks.join(' | '));
  assert(citationInPrompt.length === 0,
    'D.2 no built prompt carries citation-shaped text — redaction holds on the v2 records',
    citationInPrompt.join(', '));

  const recordsWithCitations = LINKAGE_PROBE_FIXTURES.flatMap(f => f.row.source.governedStandards)
    .filter(g => CITATION_SHAPED_PATTERN.test(`${g.title ?? ''} ${g.approvedText ?? ''}`));
  assert(recordsWithCitations.length > 0,
    `D.3 and redaction is EXERCISED — ${recordsWithCitations.length} supplied records carry a `
    + 'citation before rendering');

  // Provenance: the module must say in its own source that it touched no spent or reserved material.
  const src = readFileSync(join(__dirname, '..', 'src', 'hazlenz', 'expert-hazlenz',
    'fixtures', 'hosted-linkage-probe-v2.ts'), 'utf8');
  assert(/No reserved material was opened/i.test(src)
      && /No row of the spent 65-row formal cohort was read, copied, paraphrased, reconstructed or mimicked/i.test(src),
    'D.4 the module states its provenance explicitly');

  const classes = new Set(LINKAGE_PROBE_FIXTURES.flatMap(f => classifyRow(f.row)));
  assert(classes.has('CLARIFICATION_OWED') && classes.has('CLARIFICATION_NOT_OWED')
      && classes.has('GOVERNED_RECORD_SUPPLIED') && classes.has('NO_GOVERNED_RECORD'),
    'D.5 the set spans the case classes the diagnostics need as denominators');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) { console.log(failures.map(f => `  - ${f}`).join('\n')); process.exit(1); }
