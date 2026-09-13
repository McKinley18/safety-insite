/**
 * EXPERT HAZLENZ -- §139. The supported-defect remediation, frozen as deterministic contract tests.
 *
 * ==================== WHAT THIS SUITE IS FOR ====================
 *
 * The 2026-09-01 formal evaluation failed six hard gates. The §137 diagnostic and the §138
 * instrument-validity audit separated what those failures actually demonstrate:
 *
 *   M10  PROVEN model/contract defect -- overproduction under a possibility test.
 *   M09  MIXED -- overproduction plus an undefined `affectedDecision` vocabulary.
 *   M12  MIXED, instrument-dominant -- 6 of 11 events were label artefacts, 0 were established
 *        semantic contradictions, and no cross-collection arbitration stage existed at all.
 *   M05  MIXED -- the boundary failed CLOSED, but citation-shaped text was in the model's own input
 *        on all 195 calls.
 *   M07  PROVEN INSTRUMENT defect -- not repaired here, by authorization.
 *   M14  UNIDENTIFIABLE -- NOT REPAIRED, NOT TARGETED, AND NOT CLAIMED FIXED ANYWHERE.
 *
 * Every assertion below is tied to one of those findings. NO PROVIDER IS CALLED, no local model is
 * run, and no fixture is copied from the spent cohort -- the observations here are synthetic and
 * generic, because tuning against spent rows is exactly what the authorization forbids.
 *
 * A -- clarification decision-criticality is a COUNTERFACTUAL, not a possibility.
 * B -- all six `affectedDecision` members are DEFINED, in the type, the prompt and the schema.
 * C -- cross-collection arbitration refuses a question that contradicts the asker's own candidate.
 * D -- citation provenance: the forbidden token class is gone from the INPUT, and still fatal on
 *      OUTPUT.
 * E -- governed evidence: abstention is the contract when no supplied record covers the obligation.
 * F -- every typed collection is empty by default and an empty analysis is fully valid.
 * G -- run records are persisted DURABLY DURING EXECUTION, append-only, and completeness is checked.
 * H -- prompt identity is content hashes, not a label.
 */

import { appendFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  EXPERT_AFFECTED_DECISIONS, EXPERT_INPUT_CONTRACT_VERSION,
  type ExpertAnalysisInput,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import {
  EXPERT_PROMPT_VERSION, EXPERT_SYSTEM_PROMPT, bindWireAnalysis, buildExpertWireSchema,
  expertPromptIdentity, expertPromptIdentityMismatches, buildExpertUserPrompt,
  redactCitationTokens, stableStringify,
} from '../src/hazlenz/expert-hazlenz/expert-prompt';
import { normalizeExpertOutput } from '../src/hazlenz/expert-hazlenz/expert-normalization';
import {
  createRunRecordStore, readRunRecordStore, runRecordCompletenessProblems, RUN_RECORD_FILE,
} from './lib/expert-run-record-store';

let passed = 0; const failures: string[] = [];
function assert(ok: boolean, label: string, detail = ''): void {
  if (ok) { passed += 1; console.log(`ok    ${label}`); }
  else { failures.push(label); console.log(`FAIL  ${label}${detail ? `  -- ${detail}` : ''}`); }
}
function section(t: string): void { console.log(`\n--- ${t}`); }

const NOW = '2026-09-02T00:00:00.000Z';
const OBS = 'A portable grinder was in use at a bench while a second worker passed behind the '
  + 'operator carrying a length of pipe.';

function input(over: Partial<ExpertAnalysisInput> = {}): ExpertAnalysisInput {
  return {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
    analysisId: 'r-1',
    authoritativeSources: [{ sourceId: 'obs-1', sourceType: 'observation', text: OBS }],
    inspectionContext: { location: 'Bay 4', task: 'walkthrough' },
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: ['machine_guarding', 'electrical', 'struck_by'],
    deterministicFindings: [], governedStandards: [], answeredClarifications: [],
    ...over,
  };
}

const wire = (over: Record<string, unknown> = {}) => ({
  outcome: 'ANALYZED',
  expertHazardCandidates: [], decisionCriticalClarifications: [],
  crossHazardInsights: [], disagreements: [],
  expertExplanation: { summary: 's' }, uncertainty: { statements: [] },
  ...over,
});
const cand = (over: Record<string, unknown> = {}) => ({
  candidateKey: 'c1', hazardFamily: 'machine_guarding', assertedConditionState: 'ACTIVE',
  groundingStatus: 'NO_EXACT_QUOTE_AVAILABLE', evidence: [],
  evidenceBasis: 'b', reasoning: 'r', confidence: 'HIGH',
  relationshipToDeterministic: 'ADDITIONAL_TO_DETERMINISTIC', requiresUserConfirmation: false,
  ...over,
});
const clar = (over: Record<string, unknown> = {}) => ({
  clarificationId: 'q1', question: 'Is the point of operation guarded?',
  whyItMatters: 'if guarded, no action; if not, the machine is removed from service',
  affectedDecision: 'REQUIRED_CONTROL', criticality: 'BLOCKING',
  evidenceGap: 'the guard state is not stated',
  ...over,
});
const run = (over: Record<string, unknown>, inp = input()) =>
  normalizeExpertOutput(bindWireAnalysis(wire(over), inp).raw, inp, NOW);

console.log('§139 EXPERT REMEDIATION CONTRACT — deterministic, ZERO provider calls, $0.00\n');

// ===================================================================== A
section('A. decision-criticality is a counterfactual, not a possibility');
{
  const sys = EXPERT_SYSTEM_PROMPT;
  const schema = stableStringify(buildExpertWireSchema(input()));

  assert(!/could change whether a hazard exists/i.test(sys),
    'A.1 the v6 possibility test ("could change...") is GONE from the system prompt');
  assert(/THE COUNTERFACTUAL TEST/.test(sys) && /name TWO materially different answers/i.test(sys),
    'A.2 a counterfactual test replaced it, and it demands TWO named answers');
  assert(/DIFFERENT current outcomes/i.test(sys),
    'A.3 and the two answers must lead to different CURRENT outcomes');
  assert(/if you cannot name both, do not ask/i.test(sys)
      || /if you cannot write\s+both, the question is not decision-critical/i.test(schema),
    'A.4 failing the test is an instruction NOT to ask, not merely a caution');

  // The seven non-decision-critical shapes the authorization enumerated.
  for (const shape of ['merely useful to know', 'best-practice follow-up', 'documentation',
                       'historical context', 'severity refinement that does not change',
                       'routine due diligence', 'unrelated secondary hazard']) {
    assert(new RegExp(shape, 'i').test(sys), `A.5 excluded shape is named: "${shape}"`);
  }
  assert(/COVERAGE HABIT/i.test(sys),
    'A.6 the measured exposure/severity/control template is named and refused');
  assert(/EMPTY BY DEFAULT/i.test(schema) && /the burden is on asking, never on staying silent/i.test(sys),
    'A.7 the burden is on emission, not on omission');

  // The four v6 worked-example questions were reproduced in 35 of 165 emitted clarifications.
  assert(!/Is the pump isolated\?/i.test(sys) && !/What PPE is in use\?/i.test(sys),
    'A.8 the v6 worked-example questions are GONE — they were the most-copied unnecessary questions');
}

// ===================================================================== B
section('B. the affectedDecision vocabulary is defined');
{
  const sys = EXPERT_SYSTEM_PROMPT;
  const schema = stableStringify(buildExpertWireSchema(input()));
  const types = readFileSync(join(__dirname, '..', 'src', 'hazlenz', 'expert-hazlenz',
    'expert-contract.types.ts'), 'utf8');

  for (const member of EXPERT_AFFECTED_DECISIONS) {
    assert(new RegExp(`${member}\\s*(=|--)`).test(schema) || schema.includes(`${member} = `),
      `B.1 the SCHEMA defines ${member}`);
    assert(new RegExp(`${member}\\b[\\s\\S]{0,400}?(--|=)`).test(types),
      `B.2 the TYPE defines ${member}`);
    assert(sys.includes(member), `B.3 the PROMPT names ${member}`);
  }
  // The three collision pairs §138 measured, decided explicitly in all three places.
  assert(/is REQUIRED_CONTROL, not HAZARD_EXISTENCE/i.test(schema),
    'B.4 control-vs-existence is decided in the schema');
  assert(/is HAZARD_EXISTENCE, not HAZARD_SEVERITY/i.test(schema),
    'B.5 existence-vs-severity is decided in the schema');
  assert(/is APPLICABILITY/i.test(schema),
    'B.6 applicability-vs-control is decided in the schema');
  assert(/never usable when no record was supplied/i.test(schema),
    'B.7 REGULATORY_INTERPRETATION is bounded to supplied records');
  assert(/never alongside your own ACTIVE candidate/i.test(schema),
    'B.8 HAZARD_EXISTENCE is explicitly incompatible with the asker\'s own ACTIVE candidate');
}

// ===================================================================== C
section('C. cross-collection arbitration');
{
  // The contradiction §137 named: ACTIVE candidate + "does this hazard exist?" about that candidate.
  const contradiction = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1', assertedConditionState: 'ACTIVE' })],
    decisionCriticalClarifications: [
      clar({ clarificationId: 'q1', affectedDecision: 'HAZARD_EXISTENCE',
             relatesToCandidateKey: 'k1' })],
  });
  assert(contradiction.state === 'VALID',
    'C.1 the analysis SURVIVES — arbitration is item-scoped, never fatal');
  assert(contradiction.validated!.analysis.expertHazardCandidates.length === 1,
    'C.2 the ACTIVE candidate is KEPT — a hazard is never suppressed to tidy an output');
  assert(contradiction.validated!.analysis.decisionCriticalClarifications.length === 0,
    'C.3 the contradicting question is REFUSED — a superfluous question is dropped');
  assert(contradiction.issues.some(i => i.code === 'CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE'
      && i.collection === 'decisionCriticalClarifications' && i.index === 0),
    'C.4 and the refusal is RECORDED with collection and index — a boundary, not a filter');

  // §138: 6 of 11 formal events were label artefacts. Arbitration must not repeat that.
  const differentHazard = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1', assertedConditionState: 'ACTIVE' })],
    decisionCriticalClarifications: [
      clar({ clarificationId: 'q1', affectedDecision: 'HAZARD_EXISTENCE',
             relatesToCandidateKey: 'k2' })],
  });
  assert(differentHazard.validated!.analysis.decisionCriticalClarifications.length === 1,
    'C.5 an existence question about a DIFFERENT candidate SURVIVES — no over-suppression');

  const undeclared = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1', assertedConditionState: 'ACTIVE' })],
    decisionCriticalClarifications: [
      clar({ clarificationId: 'q1', affectedDecision: 'HAZARD_EXISTENCE' })],
  });
  assert(undeclared.validated!.analysis.decisionCriticalClarifications.length === 1,
    'C.6 with NO declared link the stage ABSTAINS — guessing is what produced the 6 artefacts');

  const provisional = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1',
      assertedConditionState: 'INSUFFICIENT_EVIDENCE' })],
    decisionCriticalClarifications: [
      clar({ clarificationId: 'q1', affectedDecision: 'HAZARD_EXISTENCE',
             relatesToCandidateKey: 'k1' })],
  });
  assert(provisional.validated!.analysis.decisionCriticalClarifications.length === 1,
    'C.7 against a NON-active candidate the same question is legitimate and survives');

  const otherDecision = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1', assertedConditionState: 'ACTIVE' })],
    decisionCriticalClarifications: [
      clar({ clarificationId: 'q1', affectedDecision: 'REQUIRED_CONTROL',
             relatesToCandidateKey: 'k1' })],
  });
  assert(otherDecision.validated!.analysis.decisionCriticalClarifications.length === 1,
    'C.8 asking which CONTROL an active hazard needs is not a contradiction and survives');
}

// ===================================================================== D
section('D. citation provenance — gone from the input, still fatal on output');
{
  const sys = EXPERT_SYSTEM_PROMPT;
  assert(!/\b\d{2}\s*CFR\s*\d+/i.test(sys),
    'D.1 the SYSTEM PROMPT no longer contains a citation-shaped string — it carried two on all 195 '
    + 'formal calls, inside the prohibition itself');
  assert(/NEVER write a regulatory citation anywhere/i.test(sys)
      && /reproducing one is the same violation as inventing one/i.test(sys),
    'D.2 the prohibition is stated WITHOUT demonstrating the forbidden form, and covers echo');

  // Requirement: a citation reaching the model only through a governed record must not be there.
  const withRecord = input({
    governedStandards: [{
      citation: '29 CFR 1926.102', title: 'Eye and face protection',
      approvedText: 'The employer must ensure eye protection is used (29 CFR 1926.102(a)(1)).',
      backingState: 'UNAPPROVED_RECORD',
    }] as ExpertAnalysisInput['governedStandards'],
  });
  const userPrompt = buildExpertUserPrompt(withRecord);
  assert(!/\b\d{2}\s*CFR\s*\d+/i.test(userPrompt),
    'D.3 a supplied governed record no longer puts a citation in the USER prompt either');
  assert(/record R1/.test(userPrompt),
    'D.4 the record is still referenceable, under an opaque handle');
  assert(/Eye and face protection/.test(userPrompt)
      && /employer must ensure eye protection is used/.test(userPrompt),
    'D.5 and its MEANING is preserved — this is redaction of a token class, not of content');
  assert(redactCitationTokens('see 30 CFR 56.12016 and 29 CFR 1910.147(c)') === 'see [citation withheld] and [citation withheld]',
    'D.6 redaction covers paragraph suffixes and both title numbers');

  // Output side: every provenance an emitted citation could claim must still fail closed.
  const adversarial: Array<[string, string]> = [
    ['prompt-example echo', 'as stated in 29 CFR 1910.147 the energy must be isolated'],
    ['unrelated-record echo', 'the supplied record 29 CFR 1926.102 requires eye protection'],
    ['plausible invented citation', 'this violates 29 CFR 1910.9999(z)'],
    ['citation absent from any request evidence', 'per 30 CFR 56.12016 grounding is required'],
  ];
  for (const [name, text] of adversarial) {
    const r = run({ expertExplanation: { summary: text } }, withRecord);
    assert(r.state === 'REJECTED'
        && r.issues.some(i => i.code === 'CITATION_SHAPED_TEXT_NOT_PERMITTED'),
      `D.7 ${name} FAILS CLOSED before merge`);
  }
  // Including one hidden in a quote, which is where an "I was only copying" defence would live.
  const inQuote = run({
    expertHazardCandidates: [cand({
      groundingStatus: 'EXACT_QUOTE_SUPPLIED',
      evidence: [{ sourceId: 'obs-1', quotedText: '29 CFR 1910.212' }],
    })],
  }, withRecord);
  assert(inQuote.state === 'REJECTED',
    'D.8 a citation smuggled through an evidence QUOTE is refused like any other');
  // And the protected behaviour is unchanged: clean prose with a supplied record still validates.
  const clean = run({ expertExplanation: { summary: 'the supplied record covers eye protection' } },
    withRecord);
  assert(clean.state === 'VALID',
    'D.9 citation-free prose about a supplied record is still perfectly valid — nothing over-blocks');
}

// ===================================================================== E
section('E. governed evidence — abstention is the contract');
{
  const sys = EXPERT_SYSTEM_PROMPT;
  assert(/NEVER present a regulatory obligation as governed fact unless a SUPPLIED governed record/i.test(sys),
    'E.1 an obligation requires a SUPPLIED record');
  assert(/about a different subject/i.test(sys) && /ABSTAIN/i.test(sys),
    'E.2 an UNRELATED supplied record is an abstention case, not a matching exercise');
  assert(/none was supplied at all/i.test(sys),
    'E.3 and so is having no record at all');
  assert(/do not\s+stretch a supplied record to cover something narrower or wider/i.test(sys),
    'E.4 extending beyond the record is refused in both directions');
  assert(/Do not reach for regulatory knowledge of your own/i.test(sys),
    'E.5 background regulatory memory may not substitute for the supplied corpus');
  assert(/Abstaining is a\s+correct answer and is never penalised/i.test(sys),
    'E.6 abstention is stated as CORRECT, so silence is not a failure mode to avoid');
  const noRecords = buildExpertUserPrompt(input());
  assert(/you may therefore make NO regulatory assertion at all/i.test(noRecords),
    'E.7 the zero-record case is still stated in the request itself');
}

// ===================================================================== F
section('F. empty by default');
{
  const schema = stableStringify(buildExpertWireSchema(input()));
  for (const c of ['decisionCriticalClarifications', 'crossHazardInsights', 'disagreements']) {
    const desc = String((buildExpertWireSchema(input()) as any).properties[c].description);
    assert(/EMPTY BY DEFAULT/i.test(desc), `F.1 ${c} is declared EMPTY BY DEFAULT`);
  }
  assert(/an empty list is a complete, correct answer/i.test(buildExpertUserPrompt(input())),
    'F.2 and the per-request prompt says an empty list is a COMPLETE answer');
  const allEmpty = normalizeExpertOutput(
    bindWireAnalysis(wire({ outcome: 'NOTHING_TO_ADD' }), input()).raw, input(), NOW);
  assert(allEmpty.state === 'VALID',
    'F.3 an analysis with every collection empty is VALID — abstention is expressible');
  assert(!/one exposure question/i.test(schema) && !/what PPE\?/i.test(schema),
    'F.4 no coverage-checklist example survives in the schema');
}

// ===================================================================== G
section('G. evidence persistence — durable during execution, append-only');
{
  const dir = mkdtempSync(join(tmpdir(), 'expert-rrs-'));
  try {
    const mk = (rowId: string, arms: string[]) => ({
      row: { source: { rowId, governedStandards: [] }, truth: {} },
      deterministicFamiliesEmitted: [], lifeCriticalFindingKeys: [],
      calls: arms.map(arm => ({
        rowId, arm, callId: `${rowId}-${arm}`, layerStatus: 'PRESENT',
        analysis: { outcome: 'ANALYZED', expertHazardCandidates: [] },
        attempts: [{ attemptIndex: 0, isRetry: false, ok: true }],
      })),
    }) as any;

    const store = createRunRecordStore(dir);
    store.append(mk('R-1', ['BASE', 'PERMUTED']));
    // Read the file back WITHOUT closing the store: this is the crash simulation. If durability
    // depended on close(), the formal defect would simply have moved rather than been repaired.
    const midRun = readRunRecordStore(dir);
    assert(midRun.records.length === 1 && midRun.problems.length === 0,
      'G.1 a record is readable from disk BEFORE the run ends — a crash at call N+1 keeps 1..N');
    store.append(mk('R-2', ['BASE', 'PERMUTED']));
    assert(store.count() === 2, 'G.2 the store counts what it appended');
    store.close();

    const after = readRunRecordStore(dir);
    assert(after.records.length === 2 && after.problems.length === 0,
      'G.3 both records survive process end');
    assert(after.records[0].row.source.rowId === 'R-1'
        && after.records[1].row.source.rowId === 'R-2',
      'G.4 append order is preserved — the file is a ledger, not a set');
    assert(/^[0-9a-f]{64}$/.test(after.sha256), 'G.5 the store hashes for integrity comparison');

    // Append-only means no second run may be layered onto a first.
    let refused = false;
    try { createRunRecordStore(dir); } catch { refused = true; }
    assert(refused, 'G.6 reopening a non-empty store is REFUSED — no silent mixture of two runs');

    // Completeness preflight: the exact defect shape the formal run produced.
    const expected = { rowOrder: ['R-1', 'R-2'], arms: ['BASE', 'PERMUTED'] };
    assert(runRecordCompletenessProblems(after.records, expected).length === 0,
      'G.7 a complete store passes the preflight');
    assert(runRecordCompletenessProblems([after.records[0]], expected)
      .some(p => p.includes('R-2')),
      'G.8 a missing row is DETECTED');
    assert(runRecordCompletenessProblems(after.records,
      { rowOrder: ['R-1', 'R-2'], arms: ['BASE', 'PERMUTED', 'CROSS_PROCESS'] })
      .some(p => p.includes('CROSS_PROCESS')),
      'G.9 a missing ARM is DETECTED');
    const hollow = JSON.parse(JSON.stringify(after.records[0]));
    hollow.calls[0].analysis = null;
    assert(runRecordCompletenessProblems([hollow, after.records[1]], expected)
      .some(p => p.includes('PRESENT but no validated analysis')),
      'G.10 a PRESENT layer with no persisted analysis is DETECTED — this is the 2026-09-01 shape');
    const noTelemetry = JSON.parse(JSON.stringify(after.records[1]));
    delete noTelemetry.calls[0].attempts;
    assert(runRecordCompletenessProblems([after.records[0], noTelemetry], expected)
      .some(p => p.includes('attempt telemetry')),
      'G.11 missing attempt telemetry is DETECTED');

    // A malformed line is reported, never repaired or skipped.
    appendFileSync(join(dir, RUN_RECORD_FILE), '{not json\n');
    assert(readRunRecordStore(dir).problems.length === 1,
      'G.12 a corrupt line is REPORTED, not silently dropped');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ===================================================================== H
section('H. prompt identity is content, not a label');
{
  const id = expertPromptIdentity(input());
  // §141 re-anchored to v8. What H asserts is that identity CARRIES the label and the two content
  // hashes and that a mismatch is detected -- none of which depends on which label is current.
  // §147 re-anchored to v10 and §148 to v11, same reasoning: H tests the identity MECHANISM, not
  // the label — that a probe can name the exact prompt it ran under.
  // §149 re-anchored to v12, same reasoning again: H tests the identity MECHANISM, not the label.
  // §150 re-anchored to v13, same reasoning: H tests the identity MECHANISM, not the label.
  assert(id.promptVersion === EXPERT_PROMPT_VERSION && id.promptVersion === 'hazlenz.expert.prompt.v15',
    'H.1 identity carries the human-readable version');
  assert(/^[0-9a-f]{64}$/.test(id.systemPromptSha256) && /^[0-9a-f]{64}$/.test(id.wireSchemaSha256),
    'H.2 and the SHA-256 of the system prompt AND of the wire schema');
  assert(expertPromptIdentityMismatches(id, id).length === 0, 'H.3 identity equals itself');
  assert(expertPromptIdentityMismatches({ promptVersion: id.promptVersion }, id).length === 0,
    'H.4 a partial recorded identity compares only the fields it carries');
  // The §138 failure mode, exactly: same label, different instructions.
  const sameLabelDifferentPrompt = { ...id, systemPromptSha256: 'a'.repeat(64) };
  const m = expertPromptIdentityMismatches(sameLabelDifferentPrompt, id);
  assert(m.length === 1 && m[0].startsWith('systemPromptSha256'),
    'H.5 SAME LABEL + DIFFERENT SYSTEM PROMPT is detected — the exact drift that invalidated a control');
  assert(expertPromptIdentityMismatches({ ...id, wireSchemaSha256: 'b'.repeat(64) }, id).length === 1,
    'H.6 and a moved wire schema is detected too');
  // Schema hashing must be order-insensitive over object keys, or it reports false drift.
  assert(stableStringify({ b: 1, a: 2 }) === stableStringify({ a: 2, b: 1 }),
    'H.7 the schema hash is stable under key reordering');
  assert(stableStringify([1, 2]) !== stableStringify([2, 1]),
    'H.8 but NOT under array reordering — array order is data');
}

// ===================================================================== M14
section('M14 — explicitly NOT repaired');
{
  const files = ['expert-prompt.ts', 'expert-normalization.ts', 'expert-contract.types.ts']
    .map(f => readFileSync(join(__dirname, '..', 'src', 'hazlenz', 'expert-hazlenz', f), 'utf8'))
    .join('\n');
  assert(!/canonicali[sz]e|canonicalInput|deterministicSemanticId/i.test(files),
    'M14.1 no canonicalization or deterministic-id change was made — §138 found NOTHING supports it');
  assert(!/order[- ]sensitivit/i.test(EXPERT_SYSTEM_PROMPT),
    'M14.2 the prompt makes no permutation-specific claim');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
for (const f of failures) console.log(`  FAILED: ${f}`);
process.exit(failures.length === 0 ? 0 : 1);
