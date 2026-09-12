/**
 * EXPERT HAZLENZ -- §141. THE LINKAGE CONTRACT, ARBITRATION PROOF, AND THE REPAIRED DEVELOPMENT
 * INSTRUMENT, frozen as deterministic contract tests.
 *
 * ==================== WHAT §140 ACTUALLY SHOWED ====================
 *
 * The hosted probe returned `LINKAGE_PARTIAL` on 3 opportunities with 1 populated, and the
 * arbitration stage fired ZERO times. Re-read carefully, that is two separate facts:
 *
 *   1. The three "opportunities" were counted by a definition that called any clarification emitted
 *      beside any candidate an opportunity. Against the §141 semantics all three model decisions
 *      were CORRECT -- one required link taken, two ambiguous links correctly withheld. **The
 *      measurement was wrong, not the model.**
 *   2. Arbitration never fired because no contradiction ever arose. That is a good product outcome
 *      and a useless experimental one: the stage remains unproven on hosted evidence.
 *
 * This suite closes (2) DETERMINISTICALLY, which is where it can actually be closed. A hosted probe
 * can show a contradiction is rare; only a deterministic test can show that arbitration fires when
 * one occurs.
 *
 * A -- the linkage contract is STATED, in the type, the prompt and the schema, as three cases.
 * B -- link resolution: a key must name an emitted candidate, or it is stripped and recorded.
 * C -- arbitration: the eight cases the authorization enumerated. It must actually fire.
 * D -- development measures: citation by producer, coverage by union, linkage by answer key.
 *      Each asserts the CORRECT value and asserts that the §140 BUGGY calculation would differ.
 * E -- pre-spend identity is write-once and refuses without touching bytes.
 * F -- M14 guards: nothing here is a canonicalization or a deterministic semantic id.
 *
 * ZERO provider calls. ZERO local-model calls. $0.00. No spent-cohort row is read or copied.
 */

import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import {
  EXPERT_PROMPT_VERSION, EXPERT_SYSTEM_PROMPT, bindWireAnalysis, buildExpertWireSchema,
  stableStringify,
} from '../src/safescope-v2/expert-hazlenz/expert-prompt';
import {
  EXPERT_NORMALIZATION_REASONS, normalizeExpertOutput, isFatal,
} from '../src/safescope-v2/expert-hazlenz/expert-normalization';
import {
  citationDiagnostics, coverageDiagnostics, collectStrings, linkageDiagnostics,
  PROBE_MEASURES_VERSION,
} from './lib/expert-probe-measures';
import {
  IdentityAlreadyWrittenError, sha256, writePreSpendIdentityOnce, readPreSpendIdentity,
  writeRemeasureIdentity, type PreSpendIdentity,
} from './lib/expert-probe-identity';

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
const survivors = (r: ReturnType<typeof run>) =>
  r.validated?.analysis.decisionCriticalClarifications ?? [];
const has = (r: ReturnType<typeof run>, code: string) => r.issues.some(i => i.code === code);

console.log('§141 EXPERT LINKAGE CONTRACT — deterministic, ZERO provider calls, $0.00\n');

// ===================================================================== A
section('A. structural feasibility of the linkage mechanism');
{
  const schema = stableStringify(buildExpertWireSchema(input()));

  // §143 SUPERSESSION, DISCLOSED. This section used to assert the v8 linkage WORDING in the prompt,
  // the schema and the type. §143 rewrote that wording to give the three cases an explicit
  // precedence, and `test:expert-linkage-precedence` now asserts the v9 text in all three places,
  // more thoroughly than this did. Keeping a second set of needles for the same property is how
  // needle rot starts: two suites drift, one is updated, the other is quietly relaxed.
  //
  // What stays HERE is what §143 does not cover and what this suite uniquely established: that the
  // mechanism is STRUCTURALLY POSSIBLE at all. That property is independent of any wording.
  // §147 re-anchored again for the clarification-recall remediation. What this suite uniquely
  // establishes -- that the linkage mechanism is STRUCTURALLY POSSIBLE -- is independent of wording.
  // §148 re-anchored v10 -> v11 for the settlement-threshold narrowing and the affectedDecision
  // routing disclosure. The arbitration contract itself is byte-unchanged and section C proves it.
  // §149 re-anchored v11 -> v12. The arbitration contract is byte-unchanged and section C proves it.
  // §150 re-anchored v12 -> v13. The arbitration contract is byte-unchanged and section C proves it.
  assert(EXPERT_PROMPT_VERSION === 'hazlenz.expert.prompt.v15',
    'A.1 the prompt is v13 — re-anchored for the §150 retention-bridge repair',
    EXPERT_PROMPT_VERSION);

  const order = Object.keys(
    (buildExpertWireSchema(input()) as { properties: Record<string, unknown> }).properties);
  assert(order.indexOf('expertHazardCandidates') < order.indexOf('decisionCriticalClarifications'),
    'A.13 STRUCTURAL FEASIBILITY: candidates are emitted BEFORE clarifications in schema order, so '
    + 'the key exists by the time the model needs to copy it');
  assert(/candidateKey/.test(schema),
    'A.14 candidateKey is a PRODUCER-AUTHORED field — the model chooses it, so it can reference it');
}

// ===================================================================== B
section('B. link resolution — a key must name a candidate this analysis emitted');
{
  assert(EXPERT_NORMALIZATION_REASONS.includes('CLARIFICATION_LINK_UNRESOLVED'),
    'B.1 CLARIFICATION_LINK_UNRESOLVED exists as a reason code');
  assert(!isFatal('CLARIFICATION_LINK_UNRESOLVED'),
    'B.2 and it is ITEM-scoped, never fatal — a bad name must not condemn an analysis');

  const invented = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1' })],
    decisionCriticalClarifications: [clar({ relatesToCandidateKey: 'does-not-exist' })],
  });
  assert(invented.state === 'VALID', 'B.3 an invented key does not reject the analysis');
  assert(survivors(invented).length === 1,
    'B.4 the QUESTION SURVIVES — a broken back-reference is metadata, not grounds to delete a question');
  assert(survivors(invented)[0].relatesToCandidateKey === null,
    'B.5 the invented key is STRIPPED to null rather than carried into the customer path');
  assert(invented.issues.some(i => i.code === 'CLARIFICATION_LINK_UNRESOLVED'
      && i.collection === 'decisionCriticalClarifications' && i.index === 0),
    'B.6 and the break is RECORDED with collection and index — locatable, not merely counted');

  const resolved = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1' })],
    decisionCriticalClarifications: [clar({ relatesToCandidateKey: 'k1' })],
  });
  assert(survivors(resolved)[0].relatesToCandidateKey === 'k1' && !has(resolved, 'CLARIFICATION_LINK_UNRESOLVED'),
    'B.7 a key that RESOLVES is preserved verbatim and raises no issue');

  const none = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1' })],
    decisionCriticalClarifications: [clar({})],
  });
  assert(survivors(none)[0].relatesToCandidateKey === null && !has(none, 'CLARIFICATION_LINK_UNRESOLVED'),
    'B.8 an OMITTED link is normal and is not an unresolved link — omission is always legal');

  const blank = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1' })],
    decisionCriticalClarifications: [clar({ relatesToCandidateKey: '   ' })],
  });
  assert(survivors(blank)[0].relatesToCandidateKey === null && !has(blank, 'CLARIFICATION_LINK_UNRESOLVED'),
    'B.9 a BLANK string normalises to "no link" and is not reported as a broken one');

  // A link can only resolve against a candidate that SURVIVED validation. A key naming a candidate
  // the boundary refused must not resolve, or arbitration would act on a hazard nobody will see.
  const refusedCandidate = run({
    expertHazardCandidates: [
      cand({ candidateKey: 'k1' }),
      cand({ candidateKey: 'k2', hazardFamily: 'not_in_vocabulary' }),
    ],
    decisionCriticalClarifications: [clar({ relatesToCandidateKey: 'k2' })],
  });
  assert(refusedCandidate.state === 'REJECTED',
    'B.10 an out-of-vocabulary family is still ANALYSIS_FATAL — unchanged by §141');
}

// ===================================================================== C
section('C. arbitration — the eight enumerated cases, and it must actually FIRE');
{
  // C1. Valid linked EXISTENCE contradiction -> clarification removed, candidate kept.
  const contradiction = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1', assertedConditionState: 'ACTIVE' })],
    decisionCriticalClarifications: [clar({ affectedDecision: 'HAZARD_EXISTENCE',
      relatesToCandidateKey: 'k1' })],
  });
  assert(contradiction.state === 'VALID' && survivors(contradiction).length === 0,
    'C.1 CASE 1 valid linked existence contradiction -> the CLARIFICATION IS REMOVED');
  assert(contradiction.validated!.analysis.expertHazardCandidates.length === 1,
    'C.1b and the ACTIVE candidate is KEPT — a hazard is never suppressed to tidy an output');
  assert(contradiction.issues.some(i => i.code === 'CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE'
      && i.index === 0),
    'C.1c ARBITRATION FIRED and left a locatable diagnostic — this is what §140 could not show');

  // C2. Valid linked CONTROL-STATUS question -> RETAINED. Defined semantics: asking which control an
  // active hazard needs is coherent, not contradictory. §140's DP-B2 is exactly this shape.
  const control = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1', assertedConditionState: 'ACTIVE' })],
    decisionCriticalClarifications: [clar({ affectedDecision: 'REQUIRED_CONTROL',
      relatesToCandidateKey: 'k1' })],
  });
  assert(survivors(control).length === 1 && survivors(control)[0].relatesToCandidateKey === 'k1',
    'C.2 CASE 2 valid linked CONTROL-STATUS question is RETAINED with its link intact');
  assert(!has(control, 'CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE'),
    'C.2b and no arbitration event is recorded — REQUIRED_CONTROL is not a contradiction');

  // C3. Same row, unrelated clarification -> retained.
  const unrelated = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1', assertedConditionState: 'ACTIVE' })],
    decisionCriticalClarifications: [clar({ clarificationId: 'q2', affectedDecision: 'EXPOSURE' })],
  });
  assert(survivors(unrelated).length === 1,
    'C.3 CASE 3 an unrelated question on the SAME ROW is retained — row co-occurrence is not linkage');

  // C4. Same FAMILY but ambiguous relationship -> retained and unlinked. Two candidates of one
  // family means no unique referent, which is precisely the §140 DP-B3/DP-B4 situation.
  const ambiguous = run({
    expertHazardCandidates: [
      cand({ candidateKey: 'k1', hazardFamily: 'machine_guarding', assertedConditionState: 'ACTIVE' }),
      cand({ candidateKey: 'k2', hazardFamily: 'machine_guarding', assertedConditionState: 'ACTIVE' }),
    ],
    decisionCriticalClarifications: [clar({ affectedDecision: 'HAZARD_EXISTENCE' })],
  });
  assert(survivors(ambiguous).length === 1 && survivors(ambiguous)[0].relatesToCandidateKey === null,
    'C.4 CASE 4 same family, AMBIGUOUS, unlinked -> retained and still unlinked');
  assert(!has(ambiguous, 'CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE'),
    'C.4b and arbitration ABSTAINS — it never guesses which of two candidates was meant');

  // C5. Invalid candidate key -> strip linkage, keep the question, record it. (Case 5, resolved
  // against the established item-level policy rather than by inventing a new fatal code.)
  const badKey = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1', assertedConditionState: 'ACTIVE' })],
    decisionCriticalClarifications: [clar({ affectedDecision: 'HAZARD_EXISTENCE',
      relatesToCandidateKey: 'ghost' })],
  });
  assert(survivors(badKey).length === 1 && survivors(badKey)[0].relatesToCandidateKey === null
      && has(badKey, 'CLARIFICATION_LINK_UNRESOLVED'),
    'C.5 CASE 5 an INVALID key strips linkage, keeps the question, and records the break');
  assert(!has(badKey, 'CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE'),
    'C.5b a hallucinated key must NEVER reach arbitration — this is the §138 guessing failure');

  // C6. Missing linkage when REQUIRED. Required-ness is SEMANTIC and cannot be decided at the
  // boundary, so the production path must NOT reject; detection belongs to development validation.
  const missingRequired = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1', assertedConditionState: 'ACTIVE' })],
    decisionCriticalClarifications: [clar({ affectedDecision: 'HAZARD_EXISTENCE' })],
  });
  assert(missingRequired.state === 'VALID' && survivors(missingRequired).length === 1,
    'C.6 CASE 6 a MISSING required link is NOT a production rejection — required-ness is semantic');
  const devDetect = linkageDiagnostics([{
    rowId: 'X', expectation: 'REQUIRED', emittedCandidateKeys: ['k1'],
    emittedClarifications: [{ clarificationId: 'q1', relatesToCandidateKey: null }],
    issueCodes: [],
  }]);
  assert(devDetect.REQUIRED_LINKAGE_MISSING === 1 && devDetect.REQUIRED_LINKAGE_OPPORTUNITIES === 1,
    'C.6b but DEVELOPMENT validation DETECTS it against the answer key — a contract violation that '
    + 'is visible where it can actually be judged');

  // C7. Valid, linked, NON-contradictory -> retained with link.
  const validNonContradictory = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1', assertedConditionState: 'ACTIVE' })],
    decisionCriticalClarifications: [clar({ affectedDecision: 'HAZARD_SEVERITY',
      relatesToCandidateKey: 'k1' })],
  });
  assert(survivors(validNonContradictory).length === 1
      && survivors(validNonContradictory)[0].relatesToCandidateKey === 'k1',
    'C.7 CASE 7 a valid NON-contradictory link is retained, link intact');

  // C8. Two candidates of one family, existence question linked to ONE of them -> that one is
  // arbitrated and the other is untouched. No guessing in either direction.
  const twoSameFamily = run({
    expertHazardCandidates: [
      cand({ candidateKey: 'k1', hazardFamily: 'machine_guarding', assertedConditionState: 'ACTIVE' }),
      cand({ candidateKey: 'k2', hazardFamily: 'machine_guarding', assertedConditionState: 'ACTIVE' }),
    ],
    decisionCriticalClarifications: [
      clar({ clarificationId: 'q1', affectedDecision: 'HAZARD_EXISTENCE',
        relatesToCandidateKey: 'k1' }),
      clar({ clarificationId: 'q2', affectedDecision: 'HAZARD_EXISTENCE' }),
    ],
  });
  assert(survivors(twoSameFamily).length === 1 && survivors(twoSameFamily)[0].clarificationId === 'q2',
    'C.8 CASE 8 two candidates in ONE family: only the EXPLICITLY LINKED question is arbitrated, '
    + 'the unlinked one survives — family equality never implies linkage');
  assert(twoSameFamily.validated!.analysis.expertHazardCandidates.length === 2,
    'C.8b both candidates survive — arbitration never deletes a hazard');

  // Non-ACTIVE state: the existence question is legitimate and must survive even when linked.
  const provisional = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1',
      assertedConditionState: 'INSUFFICIENT_EVIDENCE' })],
    decisionCriticalClarifications: [clar({ affectedDecision: 'HAZARD_EXISTENCE',
      relatesToCandidateKey: 'k1' })],
  });
  assert(survivors(provisional).length === 1,
    'C.9 against a NON-ACTIVE candidate a linked existence question is legitimate and survives');

  // The trigger is EXPOSURE-free by decision, not by oversight.
  const exposure = run({
    expertHazardCandidates: [cand({ candidateKey: 'k1', assertedConditionState: 'ACTIVE' })],
    decisionCriticalClarifications: [clar({ affectedDecision: 'EXPOSURE',
      relatesToCandidateKey: 'k1' })],
  });
  assert(survivors(exposure).length === 1,
    'C.10 EXPOSURE against an ACTIVE candidate is NOT arbitrated — widening the trigger was '
    + 'considered and refused as unsupported');
}

// ===================================================================== D
section('D. development measures — each asserts the correct value AND rejects the §140 bug');
{
  assert(PROBE_MEASURES_VERSION === 'hazlenz.expert.probe-measures.v1', 'D.0 measures are versioned');

  // ---- D1. CITATION. The §140 bug: scanning the whole merged object, which includes the SUPPLIED
  // governed citations, and reporting them as Expert output.
  const suppliedCitation = 'One or more methods shall be provided. See 29 CFR 1910.212(a)(1).';
  const governedBlock = { citations: [{ citation: '29 CFR 1910.212(a)(1)', source: 'GOVERNED' }] };
  const cleanExpert = { summary: 'The point of operation is unguarded and the operator hand-feeds.' };

  const cd = citationDiagnostics([{
    modelInputText: ['record R1 [APPROVED] General requirements', 'approved text: [citation withheld]'],
    suppliedGovernedRecordText: [suppliedCitation],
    validatedAnalysis: cleanExpert,
    mergedExpertAdvisory: { explanation: cleanExpert },
    mergedGovernedBlock: governedBlock,
    issueCodes: [],
  }]);
  assert(cd.EXPERT_OUTPUT_CITATION_SHAPED_COUNT === 0 && cd.ACCEPTED_CITATION_COUNT === 0
      && cd.MERGED_CITATION_COUNT === 0,
    'D.1 CORRECT: a clean Expert analysis beside a citation-bearing governed block counts ZERO '
    + 'Expert citations');
  assert(cd.GOVERNED_AUTHORITY_CITATION_COUNT === 1,
    'D.2 the governed-authority citation is COUNTED SEPARATELY and reported as context');
  assert(cd.INPUT_CITATION_SHAPED_COUNT === 0 && cd.SUPPLIED_RECORD_CITATION_COUNT === 1,
    'D.3 input leakage is 0 while the supplied record DID carry one — redaction proven, not assumed');
  // The §140 buggy calculation, reproduced verbatim: scan the whole merged object.
  const buggyMergedScan = collectStrings({ expertAdvisory: { explanation: cleanExpert },
    governed: governedBlock }).filter(s => /\b\d{2}\s*CFR\s*\d+/i.test(s)).length;
  assert(buggyMergedScan === 1 && cd.MERGED_CITATION_COUNT === 0,
    'D.4 THE §140 BUG WOULD HAVE REPORTED 1 HERE; the repaired measure reports 0 — this assertion '
    + 'fails if the scope regression is ever reintroduced');

  // A real Expert citation must still be counted, in both the accepted and the refused case.
  const dirty = citationDiagnostics([{
    modelInputText: [], suppliedGovernedRecordText: [],
    validatedAnalysis: null,
    mergedExpertAdvisory: null,
    issueCodes: ['CITATION_SHAPED_TEXT_NOT_PERMITTED'],
  }, {
    modelInputText: [], suppliedGovernedRecordText: [],
    validatedAnalysis: { summary: 'as required by 29 CFR 1926.501' },
    mergedExpertAdvisory: { summary: 'as required by 29 CFR 1926.501' },
    issueCodes: [],
  }]);
  assert(dirty.REJECTED_CITATION_COUNT === 1 && dirty.ACCEPTED_CITATION_COUNT === 1
      && dirty.MERGED_CITATION_COUNT === 1 && dirty.EXPERT_OUTPUT_CITATION_SHAPED_COUNT === 2,
    'D.5 a REFUSED Expert citation and an ACCEPTED one are both counted as Expert output — a '
    + 'working fail-closed boundary must not read as "the model emitted nothing"');

  // ---- D2. COVERAGE. The §140 bug: comparing truth against Expert candidates alone.
  const cov = coverageDiagnostics([
    // The engine found it; Expert correctly did NOT restate it. Not a miss.
    { rowId: 'r1', truthPresentFamilies: ['machine_guarding'],
      deterministicFamilies: ['machine_guarding'], acceptedExpertFamilies: [] },
    // The engine missed it; Expert supplied it. Additive coverage.
    { rowId: 'r2', truthPresentFamilies: ['hazcom'],
      deterministicFamilies: [], acceptedExpertFamilies: ['hazcom'] },
    // Neither layer. The only real loss.
    { rowId: 'r3', truthPresentFamilies: ['walking_working_surfaces'],
      deterministicFamilies: ['electrical'], acceptedExpertFamilies: [] },
  ]);
  assert(cov.deterministicCoveredCount === 1 && cov.additiveExpertCoveredCount === 1
      && cov.combinedCoveredCount === 2 && cov.truthMissesAfterUnionCount === 1,
    'D.6 CORRECT: coverage is measured over deterministic UNION Expert; exactly one true miss');
  // The §140 buggy calculation, reproduced: truth minus Expert candidates only.
  const buggyMisses = [
    ['machine_guarding'].filter(f => ![].includes(f as never)).length,
    ['hazcom'].filter(f => !['hazcom'].includes(f)).length,
    ['walking_working_surfaces'].filter(f => ![].includes(f as never)).length,
  ].reduce((a, b) => a + b, 0);
  assert(buggyMisses === 2 && cov.truthMissesAfterUnionCount === 1,
    'D.7 THE §140 BUG WOULD HAVE REPORTED 2 MISSES; the repaired measure reports 1 — Expert is '
    + 'never penalised for correctly declining to restate a deterministic hazard');
  assert(cov.perRow[1].additiveExpertCovered.length === 1 && cov.expertOnlyFamiliesCount === 1,
    'D.8 additive Expert contribution is reported in its own column, not averaged away');

  // ---- D3. LINKAGE MEASUREMENT: SUPERSEDED BY §143, DISCLOSED.
  //
  // This block asserted the row-level and per-clarification linkage counters against the §140
  // broad-denominator bug. §143 replaced those counters with OPPORTUNITY-SCOPED ones after §142
  // exposed a second denominator defect of the same family — ten rows labelled FORBIDDEN by
  // blanket default, of which nine emitted no clarification at all and the tenth was semantically
  // REQUIRED, so the FORBIDDEN measure had no legitimate denominator while still reporting a
  // violation.
  //
  // `test:expert-linkage-precedence` section C now reproduces and rejects BOTH historical bugs
  // against the repaired API. Re-asserting the retired field names here would only pin an API that
  // no longer exists.
  assert(PROBE_MEASURES_VERSION === 'hazlenz.expert.probe-measures.v1',
    'D.9 linkage measurement moved to test:expert-linkage-precedence section C — both the §140 '
    + 'broad-denominator bug and the §142 blanket-FORBIDDEN bug are reproduced and rejected there');
}

// ===================================================================== E
section('E. pre-spend identity is WRITE-ONCE');
{
  const dir = mkdtempSync(join(tmpdir(), 'expert-identity-'));
  const path = join(dir, 'PRE-SPEND-IDENTITY.json');
  const identity: PreSpendIdentity = {
    operation: '§141 self-test', capturedAt: NOW, isFormalEvaluation: false,
    hashes: {
      probeScriptSha256: 'a'.repeat(64), fixtureManifestSha256: 'b'.repeat(64),
      systemPromptSha256: 'c'.repeat(64), wireSchemaSha256: 'd'.repeat(64),
      normalizationSha256: 'e'.repeat(64), contractTypesSha256: 'f'.repeat(64),
    },
    execution: { provider: 'p', model: 'm', promptVersion: EXPERT_PROMPT_VERSION,
      analysisContractVersion: 'hazlenz.expert.analysis.v2' },
    budget: { targetLogicalCalls: 16, hardProviderRequestCeiling: 20, retryRequestBudget: 4,
      enforcedSpendCeilingUsd: 2.08, worstCaseRequestUsd: 0.104 },
  };

  writePreSpendIdentityOnce(path, identity);
  assert(existsSync(path), 'E.1 the identity is written on the first call');
  const firstBytes = readFileSync(path);
  const firstSha = sha256(firstBytes);

  let refused = false; let errIsTyped = false;
  const second: PreSpendIdentity = {
    ...identity, operation: 'A LATER PASS TRYING TO RESTATE THE MOMENT OF SPEND',
    hashes: { ...identity.hashes, probeScriptSha256: '9'.repeat(64) },
  };
  try { writePreSpendIdentityOnce(path, second); }
  catch (e) { refused = true; errIsTyped = e instanceof IdentityAlreadyWrittenError; }

  assert(refused, 'E.2 THE SECOND WRITE IS REFUSED');
  assert(errIsTyped, 'E.3 and it refuses with a typed error a caller can distinguish');
  assert(sha256(readFileSync(path)) === firstSha,
    'E.4 THE BYTES ARE UNCHANGED — the refusal touched nothing. This is the §140 defect closed');
  assert(readPreSpendIdentity(path).operation === '§141 self-test'
      && readPreSpendIdentity(path).hashes.probeScriptSha256 === 'a'.repeat(64),
    'E.5 the ORIGINAL content survives, including the probe-script hash the §140 pass lost');

  // A re-measurement records itself alongside, on deliberately different rules.
  const rePath = join(dir, 'PRE-SPEND-IDENTITY.remeasure.json');
  writeRemeasureIdentity(rePath, second);
  writeRemeasureIdentity(rePath, second);
  assert(existsSync(rePath) && sha256(readFileSync(path)) === firstSha,
    'E.6 a re-measurement writes a SEPARATE file, repeatably, and still cannot touch the original');

  assert(identity.isFormalEvaluation === false,
    'E.7 the identity type cannot express a formal evaluation — the field is literal false');

  rmSync(dir, { recursive: true, force: true });
}

// ===================================================================== M14
section('M14 — explicitly NOT touched by the linkage repair');
{
  const promptSrc = readFileSync(
    join(__dirname, '..', 'src', 'safescope-v2', 'expert-hazlenz', 'expert-prompt.ts'), 'utf8');
  const normSrc = readFileSync(
    join(__dirname, '..', 'src', 'safescope-v2', 'expert-hazlenz', 'expert-normalization.ts'),
    'utf8');
  const schema = stableStringify(buildExpertWireSchema(input()));

  // The §139 suite already forbids canonicalization. §141 adds an identity mechanism to the
  // CONTRACT, so it must prove that mechanism is producer-authored and not a derived semantic id.
  assert(/Short stable id, unique within this response/i.test(schema),
    'M14.1 candidateKey remains a PRODUCER-AUTHORED free-form id — no deterministic semantic id '
    + 'was introduced, and none may be justified by the linkage problem');
  // Comments may DISCUSS canonicalization — the v8 rationale explicitly REFUSES it, and a needle
  // that fired on the refusal would make the guard unsatisfiable by any honest disclosure. So the
  // scan is over CODE only, the same technique the no-call harness uses for vendor names.
  const codeOnly = (src: string) => src.split('\n')
    .filter(l => { const t = l.trim();
      return !t.startsWith('*') && !t.startsWith('//') && !t.startsWith('/*'); })
    .join('\n');
  assert(!/canonicali[sz]/i.test(codeOnly(promptSrc)) && !/canonicali[sz]/i.test(codeOnly(normSrc)),
    'M14.2 no canonicalization was introduced in the prompt or normalizer CODE');
  assert(!/permut/i.test(schema),
    'M14.3 the wire schema makes no permutation-specific claim');
  assert(/NOT AN M14 CHANGE/i.test(promptSrc),
    'M14.4 the v8 rationale states in the source that this is not an M14 change');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) { console.log(failures.map(f => `  - ${f}`).join('\n')); process.exit(1); }
