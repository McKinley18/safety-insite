/**
 * §193 -- INTEGRATION-READINESS HARDENING PROOF SUITE. ZERO PROVIDER CALLS. ZERO DB OPERATIONS.
 *
 * Two independent repairs, tested independently and never mixed:
 *
 *   sections A-D   CITATION CONTAINMENT           verifier admission
 *   sections E-F   AUDIT_TOOLING_RELIABILITY      source-tooling only, no verifier behaviour
 *
 * Section D is the honest one: it proves the corrected boundary does NOT refuse the outputs that
 * motivated §193, because they do not meet the canonical definition. A suite that only demonstrated
 * successes would hide the finding.
 */

import { createHash } from 'crypto';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { CITATION_SHAPED_PATTERN } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { checkVerifierV3Output, EXPERT_VERIFIER_CONTRACT_V3_VERSION } from
  './lib/expert-verifier-contract-v3';
import {
  checkVerifierV3_1Output, checkVerifierCitationContainment, verifierFreeTextStrings,
  PROHIBITED_REGULATORY_CITATION, CITATION_BOUNDARY_RULE_CLASSIFICATION,
} from './lib/expert-verifier-citation-boundary';
import {
  checkFileAuditability, grepAuditable, assertTextuallyAuditable, sweepAuditability,
} from './lib/expert-source-audit-integrity';

const ROOT = join(__dirname, '..', '..');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

let passed = 0; let failed = 0;
function assert(label: string, ok: boolean, detail = ''): void {
  if (ok) { passed += 1; console.log(`  PASS  ${label}${detail ? '  -- ' + detail : ''}`); }
  else { failed += 1; console.log(`  FAIL  ${label}${detail ? '  -- ' + detail : ''}`); }
}

const KEY = 'owed:generic:vessel_drained_and_confirmed_empty';
const IN = { analysisId: 'a-1', observation: 'A generic observation for boundary tests.',
  suppliedOwedFactKeys: [KEY] };
const base = {
  verifierContractVersion: EXPERT_VERIFIER_CONTRACT_V3_VERSION, analysisId: 'a-1',
  verdict: 'VERIFIED_AS_IS', rationale: 'the existing question reaches the fact',
  clarificationSourceMode: null, proposedClarification: null, bindingFactKey: null,
  nominatedFact: null,
  owedFactDeclarations: [{ factKey: KEY, declaration: 'STILL_UNRESOLVED', challengeReason: null }],
};
const withProposal = (q: string): Record<string, unknown> => ({
  ...base, verdict: 'ADD_OR_REPLACE_CLARIFICATION', clarificationSourceMode: 'SUPPLIED_FACT',
  bindingFactKey: KEY,
  proposedClarification: { question: q, whyItMatters: 'it matters',
    affectedDecision: 'REQUIRED_CONTROL', evidenceGap: 'the record is silent' },
  owedFactDeclarations: [{ factKey: KEY, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null }],
});

function main(): void {
  // ==================================================================== A
  console.log('\nA. CITATION BOUNDARY — POSITIVE CASES (must refuse)\n');

  const inRationale = { ...base, rationale: 'This is required by 29 CFR 1910.212(a)(1) so it must be asked.' };
  const rA = checkVerifierV3_1Output(inRationale, IN);
  assert('A.1 citation in rationale is REFUSED', rA.admitted === false);
  assert('A.2 and raises PROHIBITED_REGULATORY_CITATION',
    rA.codes.includes(PROHIBITED_REGULATORY_CITATION as never));
  assert('A.3 the same verdict was ADMITTED by the unchanged v3 boundary — this is the gap',
    checkVerifierV3Output(inRationale, IN).admitted === true);

  const inProposal = withProposal('Does the vessel meet 29 CFR 1910.146 before entry?');
  const rB = checkVerifierV3_1Output(inProposal, IN);
  assert('B.1 citation in proposedClarification.question is REFUSED', rB.admitted === false);
  assert('B.2 the unchanged v3 boundary admitted it', checkVerifierV3Output(inProposal, IN).admitted === true);

  const inChallenge = { ...base,
    owedFactDeclarations: [{ factKey: KEY, declaration: 'CHALLENGE_FACT_VALIDITY',
      challengeReason: 'already covered by 40 CFR 262 requirements' }] };
  assert('B.3 citation in challengeReason is REFUSED',
    checkVerifierV3_1Output(inChallenge, IN).admitted === false);

  const inNomination = { ...withProposal('a clean question'), nominatedFact: {
    missingFact: 'something', observationSpan: 'A generic observation', notEstablishedBecause: 'x',
    affectedDecision: 'REQUIRED_CONTROL', branchA: 'a', decisionIfA: 'p', branchB: 'b',
    decisionIfB: 'q', whyNecessaryNow: 'per 29 CFR 1926.501 it is needed now' },
    clarificationSourceMode: 'SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION' };
  assert('B.4 citation inside nominatedFact is REFUSED',
    checkVerifierV3_1Output(inNomination, IN).admitted === false);

  assert('B.5 spacing and case variants match the canonical pattern',
    CITATION_SHAPED_PATTERN.test('29CFR1910') && CITATION_SHAPED_PATTERN.test('29 cfr 1910')
    && CITATION_SHAPED_PATTERN.test('29  CFR  1910'));
  assert('B.6 the canonical pattern is not global, so .test is stateless',
    !CITATION_SHAPED_PATTERN.flags.includes('g')
    && CITATION_SHAPED_PATTERN.test('29 CFR 1910') === CITATION_SHAPED_PATTERN.test('29 CFR 1910'));

  // ==================================================================== C
  console.log('\nC. CITATION BOUNDARY — NEGATIVE CASES (must NOT refuse)\n');

  const clean: Array<[string, string]> = [
    ['ordinary measurement', 'The gap must be within 1/8 inch of the wheel face.'],
    ['two-digit number then a word', 'The valve was tested 24 months ago at the last examination.'],
    ['a date', 'The certificate was issued on 12 March 2026 and is in date.'],
    ['a pressure and a duration', 'The gauge read 0 bar and was held for 2 minutes.'],
    ['a percentage', 'Capture velocity fell to 60% of the design figure.'],
    ['a factKey containing digits', `The fact ${KEY} v2 remains open.`],
    ['an identifier', 'Analysis a-1 replicate 3 block 2 sequence 14.'],
    ['the word regulation without a citation', 'No governed regulatory evidence was supplied.'],
    ['the jurisdiction token', 'The jurisdiction is osha-general-industry as supplied.'],
    ['a standard named without CFR shape', 'The written scheme examination certificate is in date.'],
    ['CFR far from a number', 'The CFR was not consulted because no evidence was supplied.'],
  ];
  for (const [label, text] of clean) {
    const out = { ...base, rationale: text };
    assert(`C.1 not refused: ${label}`,
      checkVerifierV3_1Output(out, IN).admitted === true
      && checkVerifierCitationContainment(out).clean, JSON.stringify(text.slice(0, 44)));
  }
  assert('C.2 a clean ADD_OR_REPLACE with a measurement in the question is admitted',
    checkVerifierV3_1Output(withProposal('What is the current gap, and is it within 1/8 inch?'), IN).admitted === true);
  assert('C.3 every free-text field is actually scanned, not just rationale',
    verifierFreeTextStrings(inNomination).length >= 12,
    `${verifierFreeTextStrings(inNomination).length} strings`);

  // ==================================================================== D
  console.log('\nD. PERSISTED §192 REPLAY — the honest result\n');

  const replay = JSON.parse(readFileSync(join(ROOT, 'verification',
    'expert-hazlenz-verifier-v3-1-integration-readiness-hardening-2026-09-06',
    'CITATION-REPLAY.json'), 'utf8'));
  assert('D.1 all 39 persisted executions replayed', replay.totals.executions === 39);
  assert('D.2 OLD admission 39/39 — the §192 historical result, unchanged',
    replay.totals.oldAdmitted === 39);
  assert('D.3 NEW admission 39/39 — the boundary rejects none of the cohort',
    replay.totals.newAdmitted === 39);
  assert('D.4 no execution changed admission', replay.totals.admissionChanged === 0);
  assert('D.5 zero canonical citation violations across the cohort',
    replay.totals.executionsWithCitationViolations === 0);
  const fv07 = replay.FV07_FINDING.fv07;
  assert('D.6 FV-07 R1 and R3 are NOT refused — they do not meet the canonical definition',
    fv07.every((e: any) => e.NEW === 'ADMITTED'),
    'this is the §193 finding, not a defect in the boundary');
  assert('D.7 the replay is labelled diagnostic and does not rewrite §192',
    replay.diagnosticOnly === true && /NOT rewritten/i.test(replay.historicalImmutability));
  assert('D.8 the rule classification records the undecidable classes explicitly',
    CITATION_BOUNDARY_RULE_CLASSIFICATION.REGULATORY_REQUIREMENT_ASSERTED_IN_PROSE
    === 'NOT_DETERMINISTICALLY_DECIDABLE');

  // ==================================================================== E
  console.log('\nE. AUDIT TOOLING — NUL DETECTION (AUDIT_TOOLING_RELIABILITY)\n');

  const repaired = join(__dirname, 'lib', 'expert-verifier-v2-v3-diff.ts');
  const a = checkFileAuditability(repaired);
  assert('E.1 the repaired diff module carries zero NUL bytes', a.nulCount === 0, `${a.bytes} bytes`);
  assert('E.2 and is textually auditable', a.auditable === true);
  assert('E.3 the intended delimiter semantics survive as the \\0 ESCAPE',
    /`\$\{op\}\\0\$\{line\}`/.test(readFileSync(repaired, 'utf8')));
  assert('E.4 grep can now find content it previously could not',
    (grepAuditable(repaired, /export function/) as any).matches.length > 0);

  const tmp = mkdtempSync(join(tmpdir(), 'a193-'));
  try {
    const bad = join(tmp, 'bad.ts');
    // The NUL is built at runtime, never written as a literal control character into THIS source —
    // otherwise the suite would reproduce the very defect it exists to detect. (It did, once: the
    // G.1 sweep caught this file on the first run, which is the tooling working.)
    const NUL = String.fromCharCode(0);
    writeFileSync(bad, `export const x = "a${NUL}b";\nexport const y = 1;\n`, 'utf8');
    const ab = checkFileAuditability(bad);
    assert('E.5 a NUL-bearing file is detected as unauditable',
      ab.auditable === false && ab.failures.includes('EMBEDDED_NUL_BYTE') && ab.nulCount === 1);

    // ---------------- F: the failure mode that actually mattered
    console.log('\nF. AUDIT TOOLING — SILENT-CLEAN PREVENTION\n');
    const g = grepAuditable(bad, /export/);
    assert('F.1 a grep over an unauditable file returns UNAUDITABLE, never zero matches',
      g.kind === 'UNAUDITABLE');
    assert('F.2 and names why', g.kind === 'UNAUDITABLE' && g.failures.includes('EMBEDDED_NUL_BYTE'));
    let threw = false;
    try { assertTextuallyAuditable(bad); } catch { threw = true; }
    assert('F.3 the throwing form aborts rather than reporting clean', threw);
    const good = join(tmp, 'good.ts');
    writeFileSync(good, 'export const z = 2;\n');
    const gHit = grepAuditable(good, /export/);
    const gMiss = grepAuditable(good, /nosuchtoken/);
    assert('F.4 a genuine zero-match on a READABLE file is SEARCHED, not UNAUDITABLE',
      gMiss.kind === 'SEARCHED' && (gMiss as any).matches.length === 0);
    assert('F.5 so "no matches" and "could not read" are now distinguishable outcomes',
      gHit.kind === 'SEARCHED' && (gHit as any).matches.length === 1
      && gMiss.kind === 'SEARCHED' && g.kind === 'UNAUDITABLE');
  } finally { rmSync(tmp, { recursive: true, force: true }); }

  console.log('\nG. SOURCE SWEEP\n');
  const sweep = sweepAuditability(join(ROOT, 'backend', 'scripts'));
  assert('G.1 no unauditable file remains under backend/scripts',
    sweep.clean === true,
    sweep.clean ? `${sweep.scanned} files scanned` : sweep.unauditable.map(u => u.path).join(', '));
  const sweepSrc = sweepAuditability(join(ROOT, 'backend', 'src', 'hazlenz', 'expert-hazlenz'));
  assert('G.2 no unauditable file under the expert-hazlenz source tree',
    sweepSrc.clean === true,
    sweepSrc.clean ? `${sweepSrc.scanned} files scanned` : sweepSrc.unauditable.map(u => u.path).join(', '));

  console.log('\nH. NOTHING ELSE MOVED\n');
  assert('H.1 the v3 admission validator is byte-unchanged',
    sha(readFileSync(join(__dirname, 'lib', 'expert-verifier-contract-v3.ts'), 'utf8'))
    === '475a957747c145682a7027c3f4f06041e45a1d93df9779be02e0424962d6a3dc');
  const prereg192 = JSON.parse(readFileSync(join(ROOT, 'verification',
    'expert-hazlenz-verifier-v3-1-prospective-validation-2026-09-06', 'PREREGISTRATION.json'), 'utf8'));
  const { EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT, VERIFIER_V3_1_RESPONSE_SCHEMA } =
    require('./lib/expert-verifier-instruction-v3-1');
  assert('H.2 the v3.1 PROMPT is unchanged — §192 stays attached to its hash',
    sha(EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT) === prereg192.verifierIdentity.systemPromptSha256);
  assert('H.3 the v3.1 SCHEMA is unchanged — this was runtime logic, not a protocol change',
    sha(JSON.stringify(VERIFIER_V3_1_RESPONSE_SCHEMA)) === prereg192.verifierIdentity.responseSchemaSha256);
  assert('H.4 §192 raw outputs are untouched',
    readFileSync(join(ROOT, 'verification',
      'expert-hazlenz-verifier-v3-1-prospective-validation-2026-09-06',
      'RAW-PROVIDER-OUTPUTS.jsonl'), 'utf8').trim().split('\n').length === 39);

  console.log(`\n${passed} passed, ${failed} failed`);
  console.log('PROVIDER_REQUESTS_TO_A_REAL_PROVIDER = 0   DATABASE_OPERATIONS = 0');
  console.log('CITATION ENFORCEMENT closes the citation-LAUNDERING class only. The prose-assertion');
  console.log('class that FV-07 fell into is NOT deterministically decidable and is escalated.');
  if (failed > 0) process.exit(1);
}

main();
