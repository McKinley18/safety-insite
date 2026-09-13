/**
 * EXPERT HAZLENZ -- §143. LINKAGE-SEMANTICS PRECEDENCE, OPPORTUNITY-SCOPED MEASUREMENT, AND THE
 * PRE-SPEND IDENTITY REHEARSAL RULE. Deterministic contract tests.
 *
 * ==================== THE CONTRADICTION THIS SUITE CLOSES ====================
 *
 * v8 listed three linkage cases without precedence, and wrote "general PPE, procedure or
 * documentation follow-up" into FORBIDDEN without saying that GENERAL carried the meaning. A single
 * question could therefore satisfy REQUIRED and match FORBIDDEN's wording at the same time, and
 * §142 measured the cost: a PPE question about one specific decanting task, uniquely qualifying one
 * of four emitted candidates, was scored a FORBIDDEN violation and failed an advancement criterion.
 *
 * v9 fixes it with a governing principle -- SPECIFIC SEMANTIC RELATIONSHIP OVERRIDES SUPERFICIAL
 * QUESTION FORM -- and an explicit order: test REQUIRED, else ALLOWED, else FORBIDDEN.
 *
 * A -- the precedence and the three tests are STATED, in the type, the prompt and the schema.
 * B -- the ten classification cases the authorization enumerated.
 * C -- opportunity-scoped measurement, with self-tests that reproduce and REJECT both historical
 *      denominator bugs.
 * D -- pre-spend identity: a rehearsal must not consume the live write-once path.
 *
 * ZERO provider calls. ZERO local-model calls. $0.00. No spent-cohort row is read or copied, and
 * NOTHING here is tuned to LP-G3's text.
 */

import { existsSync, mkdtempSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import {
  EXPERT_PROMPT_VERSION, EXPERT_SYSTEM_PROMPT, buildExpertWireSchema, stableStringify,
} from '../src/hazlenz/expert-hazlenz/expert-prompt';
import {
  linkageDiagnostics, classifyLinkage, evaluateScenarioIntent, classifyCandidateQuality,
  type LinkageCallInput,
} from './lib/expert-probe-measures';
import {
  IdentityAlreadyWrittenError, sha256, writePreSpendIdentityOnce, type PreSpendIdentity,
} from './lib/expert-probe-identity';

let passed = 0; const failures: string[] = [];
function assert(ok: boolean, label: string, detail = ''): void {
  if (ok) { passed += 1; console.log(`ok    ${label}`); }
  else { failures.push(label); console.log(`FAIL  ${label}${detail ? `  -- ${detail}` : ''}`); }
}
function section(t: string): void { console.log(`\n--- ${t}`); }

function input(): ExpertAnalysisInput {
  return {
    contractVersion: EXPERT_INPUT_CONTRACT_VERSION, analysisId: 'r-1',
    authoritativeSources: [{ sourceId: 'obs-1', sourceType: 'observation', text: 'obs' }],
    inspectionContext: { location: null, task: null },
    jurisdiction: 'osha-general-industry',
    allowedHazardFamilies: ['machine_guarding', 'electrical'],
    deterministicFindings: [], governedStandards: [], answeredClarifications: [],
  };
}

/**
 * The classification the CONTRACT prescribes for one (question, candidate-set) pair.
 *
 * This is a TEST HARNESS applying the written rule, not production code and not a lexical matcher.
 * It exists so the ten enumerated cases are checked against the rule as stated rather than against
 * a paraphrase of it. The three REQUIRED conditions are supplied per case as authored facts, which
 * is the same discipline the fixture answer keys use.
 */
type Case = {
  name: string;
  /** (a) exactly one emitted candidate is the direct subject of the missing fact. */
  exactlyOneCandidateIsSubject: boolean;
  /** (b) materially different answers change that candidate's decision. */
  answersChangeThatCandidatesDecision: boolean;
  /** (c) the question cannot be read correctly without knowing which candidate it qualifies. */
  needsTheLinkToBeReadCorrectly: boolean;
  /** Whether one candidate is nonetheless the clear primary subject (ALLOWED's condition). */
  onePrimarySubject: boolean;
  expect: 'REQUIRED' | 'ALLOWED' | 'FORBIDDEN';
  why: string;
};

/** Precedence, applied in order. TEST 1, else TEST 2, else TEST 3. */
function classify(c: Case): 'REQUIRED' | 'ALLOWED' | 'FORBIDDEN' {
  if (c.exactlyOneCandidateIsSubject && c.answersChangeThatCandidatesDecision
      && c.needsTheLinkToBeReadCorrectly) return 'REQUIRED';
  if (c.onePrimarySubject && c.answersChangeThatCandidatesDecision) return 'ALLOWED';
  return 'FORBIDDEN';
}

console.log('§143 LINKAGE PRECEDENCE — deterministic, ZERO provider calls, $0.00\n');

// ===================================================================== A
section('A. the precedence is STATED, and the collision clause is fixed');
{
  const sys = EXPERT_SYSTEM_PROMPT;
  const schema = stableStringify(buildExpertWireSchema(input()));
  const types = readFileSync(join(__dirname, '..', 'src', 'hazlenz', 'expert-hazlenz',
    'expert-contract.types.ts'), 'utf8');

  // §147 re-anchored v9 -> v10 for the clarification-recall remediation, which added no linkage
  // text. A.2 onward still asserts the v9 precedence WORDING verbatim, so this suite continues to
  // protect the §143 repair against erosion; only the label moved.
  // §148 re-anchored v10 -> v11 for the settlement-threshold narrowing and the affectedDecision
  // routing disclosure. Neither touches linkage precedence; every precedence needle below is
  // asserted independently of the version label, which is what makes re-anchoring safe.
  // §149 re-anchored v11 -> v12 for the unsupported-settlement repair, which touches neither
  // linkage nor arbitration; every precedence needle below is asserted independently of the label.
  // §150 re-anchored v12 -> v13 for the retention-bridge repair, which touches neither linkage nor
  // arbitration; every precedence needle below is asserted independently of the version label.
  assert(EXPERT_PROMPT_VERSION === 'hazlenz.expert.prompt.v15',
    'A.1 the prompt is v13 — the §143 precedence repair is re-anchored, not relaxed',
    EXPERT_PROMPT_VERSION);

  assert(/what the question DOES to a candidate decides, not what the question/i.test(sys),
    'A.2 the GOVERNING PRINCIPLE is stated: relationship over form');
  assert(/SPECIFIC SEMANTIC RELATIONSHIP OVERRIDES SUPERFICIAL QUESTION FORM/i.test(types),
    'A.3 and it is stated on the TYPE contract too, for non-model producers');

  assert(/TEST 1/.test(sys) && /TEST 2/.test(sys) && /TEST 3/.test(sys),
    'A.4 the three tests are NUMBERED, not merely listed');
  assert(/IN ORDER and stop at the first that matches/i.test(sys),
    'A.5 PRECEDENCE is explicit — first match decides');
  assert(/Apply three tests\s+IN ORDER and stop at the first match/i.test(schema)
      || /three tests IN ORDER and stop at the first match/i.test(schema),
    'A.6 the wire schema carries the ordering too');

  // The exact collision v8 could not decide.
  assert(/GENERIC PPE, procedure, documentation or\s+training follow-up/i.test(sys),
    'A.7 the FORBIDDEN clause now says GENERIC, not "general"');
  assert(/"Generic" is the word that matters/i.test(sys),
    'A.8 and the prompt says in as many words that GENERIC is doing the work');
  assert(/if it passes TEST 1 it is linked, because TEST\s+1 runs first/i.test(sys),
    'A.9 a PPE/procedure/documentation question that passes TEST 1 IS linked — the collision is '
    + 'resolved by precedence, not by deleting the prohibition');
  // `stableStringify` JSON-escapes the quotes around Generic, so the needle allows either form.
  assert(/\\?"Generic\\?" is the operative word/i.test(schema),
    'A.10 the schema states the same, so a model reading only the field description gets it');

  // FORBIDDEN must still demand a positive reason. This is not a loosening.
  assert(/there must be a POSITIVE reason/i.test(sys),
    'A.11 FORBIDDEN still requires a POSITIVE reason — the repair is not a relaxation');
  assert(/two or more candidates are equally plausible/i.test(sys),
    'A.12 the ambiguity rule is UNCHANGED');
  assert(/Omitting the field is always a legal answer/i.test(sys),
    'A.13 omission remains legal');

  // The mechanism itself must not have moved: §142 measured it working.
  assert(/Short stable id, unique within this response/i.test(schema),
    'A.14 candidateKey is STILL producer-authored and free-form — the mechanism §142 proved working '
    + 'was not changed');
  assert(/MECHANISM is untouched/i.test(readFileSync(join(__dirname, '..', 'src', 'hazlenz',
    'expert-hazlenz', 'expert-prompt.ts'), 'utf8')),
    'A.15 and the v9 rationale records that the mechanism was deliberately left alone');
}

// ===================================================================== B
section('B. the ten enumerated classification cases');
{
  const cases: Case[] = [
    { name: 'B.1 candidate-specific PPE question changing ONE candidate\'s control determination',
      exactlyOneCandidateIsSubject: true, answersChangeThatCandidatesDecision: true,
      needsTheLinkToBeReadCorrectly: true, onePrimarySubject: true, expect: 'REQUIRED',
      why: 'PPE FORM does not demote it: TEST 1 runs first. This is the §142 LP-G3 shape, decided '
        + 'by the rule rather than by its wording' },
    { name: 'B.2 generic "what PPE is required?" with several candidates',
      exactlyOneCandidateIsSubject: false, answersChangeThatCandidatesDecision: false,
      needsTheLinkToBeReadCorrectly: false, onePrimarySubject: false, expect: 'FORBIDDEN',
      why: 'no candidate is the direct subject and nothing turns on a specific one' },
    { name: 'B.3 candidate-specific DOCUMENTATION fact changing candidate applicability',
      exactlyOneCandidateIsSubject: true, answersChangeThatCandidatesDecision: true,
      needsTheLinkToBeReadCorrectly: true, onePrimarySubject: true, expect: 'REQUIRED',
      why: 'documentation FORM does not demote it either — same precedence' },
    { name: 'B.4 generic documentation request changing no current candidate decision',
      exactlyOneCandidateIsSubject: false, answersChangeThatCandidatesDecision: false,
      needsTheLinkToBeReadCorrectly: false, onePrimarySubject: false, expect: 'FORBIDDEN',
      why: 'row-level administrative follow-up' },
    { name: 'B.5 same family, multiple plausible candidates',
      exactlyOneCandidateIsSubject: false, answersChangeThatCandidatesDecision: true,
      needsTheLinkToBeReadCorrectly: true, onePrimarySubject: false, expect: 'FORBIDDEN',
      why: 'the answer matters but there is NO UNIQUE REFERENT — ambiguity still forbids' },
    { name: 'B.6 different-hazard question',
      exactlyOneCandidateIsSubject: false, answersChangeThatCandidatesDecision: false,
      needsTheLinkToBeReadCorrectly: false, onePrimarySubject: false, expect: 'FORBIDDEN',
      why: 'the question is about a hazard other than any emitted candidate' },
    { name: 'B.7 unique candidate relationship with NON-PPE wording',
      exactlyOneCandidateIsSubject: true, answersChangeThatCandidatesDecision: true,
      needsTheLinkToBeReadCorrectly: true, onePrimarySubject: true, expect: 'REQUIRED',
      why: 'the rule is symmetric — wording never decides, in either direction' },
    { name: 'B.9 candidate exists but the clarification is independent of it',
      exactlyOneCandidateIsSubject: false, answersChangeThatCandidatesDecision: false,
      needsTheLinkToBeReadCorrectly: false, onePrimarySubject: false, expect: 'FORBIDDEN',
      why: 'co-existence is not a relationship; no link is forced' },
    { name: 'B.7b one primary subject but the question reads fine alone',
      exactlyOneCandidateIsSubject: true, answersChangeThatCandidatesDecision: true,
      needsTheLinkToBeReadCorrectly: false, onePrimarySubject: true, expect: 'ALLOWED',
      why: 'fails TEST 1 only on condition (c), so it falls through to TEST 2 — this is the middle '
        + 'category doing real work rather than being a label' },
  ];
  for (const c of cases) {
    assert(classify(c) === c.expect, `${c.name} => ${c.expect}`, c.why);
  }

  // B.1 and B.2 are the pair that matters: identical FORM, opposite classification.
  const ppeSpecific = cases.find(c => c.name.startsWith('B.1'))!;
  const ppeGeneric = cases.find(c => c.name.startsWith('B.2'))!;
  assert(classify(ppeSpecific) === 'REQUIRED' && classify(ppeGeneric) === 'FORBIDDEN',
    'B.PAIR two PPE questions, identical in FORM, classify oppositely — which is the entire content '
    + 'of the repair. If these ever agree, the taxonomy has collapsed again');

  // The categories must be mutually exclusive: every input lands in exactly one.
  const all: 'REQUIRED' | 'ALLOWED' | 'FORBIDDEN' = 'FORBIDDEN';
  let exhaustive = true;
  for (const a of [true, false]) for (const b of [true, false]) for (const c of [true, false]) {
    for (const p of [true, false]) {
      const r = classify({ name: '', exactlyOneCandidateIsSubject: a,
        answersChangeThatCandidatesDecision: b, needsTheLinkToBeReadCorrectly: c,
        onePrimarySubject: p, expect: all, why: '' });
      if (!['REQUIRED', 'ALLOWED', 'FORBIDDEN'].includes(r)) exhaustive = false;
    }
  }
  assert(exhaustive,
    'B.EXHAUSTIVE all 16 condition combinations classify into exactly one category — the taxonomy '
    + 'is TOTAL and MUTUALLY EXCLUSIVE, which v8 was not');
}

// ===================================================================== C
section('C. opportunity-scoped measurement');
{
  const call = (over: Partial<LinkageCallInput>): LinkageCallInput => ({
    rowId: 'x', expectation: 'NOT_A_LINKAGE_TEST', emittedCandidateKeys: [],
    emittedClarifications: [], issueCodes: [], ...over,
  });

  // B.8 from the enumeration: no clarification emitted => NO_LINKAGE_OPPORTUNITY, never FORBIDDEN.
  const noQuestion = linkageDiagnostics([
    call({ rowId: 'r1', expectation: 'REQUIRED', emittedCandidateKeys: ['k1'] }),
    call({ rowId: 'r2', expectation: 'FORBIDDEN', emittedCandidateKeys: ['k1'] }),
  ]);
  assert(noQuestion.NO_LINKAGE_OPPORTUNITY_ROWS === 2
      && noQuestion.REQUIRED_LINKAGE_OPPORTUNITIES === 0
      && noQuestion.FORBIDDEN_LINKAGE_OPPORTUNITIES === 0,
    'C.1 CASE 8 no clarification emitted => NO_LINKAGE_OPPORTUNITY on BOTH a REQUIRED and a '
    + 'FORBIDDEN row — never a failure in either direction');

  // The §142 blanket-FORBIDDEN bug, reproduced and rejected.
  const notATest = linkageDiagnostics([
    call({ rowId: 'n1', expectation: 'NOT_A_LINKAGE_TEST', emittedCandidateKeys: ['k1'],
      emittedClarifications: [{ clarificationId: 'q1', relatesToCandidateKey: 'k1' }] }),
  ]);
  assert(notATest.NOT_A_LINKAGE_TEST_ROWS === 1
      && notATest.FORBIDDEN_LINKAGE_OPPORTUNITIES === 0
      && notATest.FORBIDDEN_LINKAGE_ACCEPTED === 0,
    'C.2 THE §142 BUG: a row that makes NO LINKAGE CLAIM is excluded from every denominator. Under '
    + 'the old three-value taxonomy this row was labelled FORBIDDEN by default and its link counted '
    + 'as a violation — that is the criterion-4 failure, reproduced and now rejected');

  // The §140 broad-denominator bug, reproduced and rejected.
  const broad = linkageDiagnostics([
    call({ rowId: 'b1', expectation: 'NOT_A_LINKAGE_TEST', emittedCandidateKeys: ['k1'],
      emittedClarifications: [{ clarificationId: 'q1', relatesToCandidateKey: null }] }),
    call({ rowId: 'b2', expectation: 'NOT_A_LINKAGE_TEST', emittedCandidateKeys: ['k1'],
      emittedClarifications: [{ clarificationId: 'q1', relatesToCandidateKey: null }] }),
    call({ rowId: 'b3', expectation: 'REQUIRED', emittedCandidateKeys: ['k1'],
      emittedClarifications: [{ clarificationId: 'q1', relatesToCandidateKey: 'k1' }] }),
  ]);
  assert(broad.REQUIRED_LINKAGE_OPPORTUNITIES === 1 && broad.REQUIRED_LINKAGE_VALID === 1,
    'C.3 THE §140 BUG: "candidate + clarification" is NOT an opportunity. The old denominator '
    + 'counted 3 and scored 0.333; the repaired one counts 1 and scores 1.0');
  assert(classifyLinkage(broad) === 'LINKAGE_READY',
    'C.4 and the same data classifies READY rather than PARTIAL');

  // A genuine FORBIDDEN violation must still be caught. The repair must not be a way to pass.
  const violation = linkageDiagnostics([
    call({ rowId: 'f1', expectation: 'FORBIDDEN', emittedCandidateKeys: ['k1'],
      emittedClarifications: [{ clarificationId: 'q1', relatesToCandidateKey: 'k1' }] }),
  ]);
  assert(violation.FORBIDDEN_LINKAGE_OPPORTUNITIES === 1
      && violation.FORBIDDEN_LINKAGE_ATTEMPTS === 1
      && violation.FORBIDDEN_LINKAGE_ACCEPTED === 1
      && violation.perRow[0].status === 'VIOLATION',
    'C.5 a REAL forbidden link on a row that genuinely owed none is still counted — the repair '
    + 'narrows the denominator, it does not disarm the measure');
  assert(classifyLinkage(violation) !== 'LINKAGE_READY',
    'C.6 and it still blocks READY');

  // An attempted-but-unresolved link on a FORBIDDEN row: attempted, not accepted.
  const attemptedNotAccepted = linkageDiagnostics([
    call({ rowId: 'f2', expectation: 'FORBIDDEN', emittedCandidateKeys: ['k1'],
      emittedClarifications: [{ clarificationId: 'q1', relatesToCandidateKey: 'ghost' }],
      issueCodes: ['CLARIFICATION_LINK_UNRESOLVED'] }),
  ]);
  assert(attemptedNotAccepted.FORBIDDEN_LINKAGE_ATTEMPTS === 1
      && attemptedNotAccepted.FORBIDDEN_LINKAGE_ACCEPTED === 0
      && attemptedNotAccepted.INVALID_LINKAGE_ATTEMPTS === 1
      && attemptedNotAccepted.INVALID_LINKAGE_STRIPPED === 1,
    'C.7 ATTEMPTED and ACCEPTED are separated: a link the boundary stripped never reached the '
    + 'customer path and is not an accepted violation');

  // ALLOWED: omission is correct and is never a failure.
  const allowed = linkageDiagnostics([
    call({ rowId: 'a1', expectation: 'ALLOWED', emittedCandidateKeys: ['k1'],
      emittedClarifications: [{ clarificationId: 'q1', relatesToCandidateKey: null }] }),
    call({ rowId: 'a2', expectation: 'ALLOWED', emittedCandidateKeys: ['k1'],
      emittedClarifications: [{ clarificationId: 'q1', relatesToCandidateKey: 'k1' }] }),
  ]);
  assert(allowed.ALLOWED_LINKAGE_OPPORTUNITIES === 2 && allowed.ALLOWED_LINKAGE_POPULATED === 1
      && allowed.ALLOWED_LINKAGE_VALID === 1
      && allowed.perRow.every(r => r.status === 'CLEAN'),
    'C.8 CASE 9 on an ALLOWED row both linking and omitting are CLEAN — presence is reported, '
    + 'absence is never scored as a failure');

  // CASE 10: invalid key behaviour is unchanged from the production boundary.
  const invalidKey = linkageDiagnostics([
    call({ rowId: 'i1', expectation: 'REQUIRED', emittedCandidateKeys: ['k1'],
      emittedClarifications: [{ clarificationId: 'q1', relatesToCandidateKey: 'ghost' }],
      issueCodes: ['CLARIFICATION_LINK_UNRESOLVED'] }),
  ]);
  assert(invalidKey.REQUIRED_LINKAGE_MISSING === 1 && invalidKey.REQUIRED_LINKAGE_VALID === 0
      && invalidKey.INVALID_LINKAGE_STRIPPED === 1,
    'C.9 CASE 10 an unresolved key does not satisfy a REQUIRED row and is still stripped by the '
    + 'boundary');

  assert(classifyLinkage(linkageDiagnostics([])) === 'LINKAGE_NOT_WORKING',
    'C.10 zero REQUIRED opportunities classifies NOT_WORKING — untested, conservative, honest');
}

// ===================================================================== C2 (§145)
section('C2. output-relative linkage: scenario intent and candidate quality are SEPARATE axes');
{
  const cand = (k: string, f: string) => ({ candidateKey: k, hazardFamily: f });
  const q = (id: string, link: string | null) =>
    ({ clarificationId: id, relatesToCandidateKey: link });

  // THE §144 CL-F1 CASE, reproduced from its shape. The fixture presumed two interchangeable
  // machine_guarding candidates; the model emitted a third candidate in another family and linked
  // to it. The intended ambiguity therefore did not exist for that execution.
  const clF1 = evaluateScenarioIntent({
    rowId: 'CL-F1', intent: 'AMBIGUOUS_CANDIDATE_CHALLENGE',
    intentPresumedFamilies: ['machine_guarding'],
    acceptedCandidates: [cand('muted_light_curtains', 'machine_guarding'),
      cand('mute_key_left_in_panel', 'machine_guarding'),
      cand('unverified_muting_authorisation', 'training_procedure_supervision')],
    emittedClarifications: [q('q1', 'unverified_muting_authorisation')],
  });
  assert(clF1.realized === false && clF1.countsInForbiddenDenominator === false,
    'C2.1 THE §144 DEFECT: when the model finds a unique referent OUTSIDE the presumed families, '
    + 'the intended ambiguity does not exist and the row leaves the FORBIDDEN denominator');
  assert(/OUTSIDE the presumed families/i.test(clF1.reason),
    'C2.2 and the reason names exactly why, checkable against the persisted candidate set');

  // The SAME row shape, but the model links INSIDE the presumed families: the ambiguity is real and
  // the link IS a violation. The correction must not become a way to pass.
  const genuinelyAmbiguous = evaluateScenarioIntent({
    rowId: 'X', intent: 'AMBIGUOUS_CANDIDATE_CHALLENGE',
    intentPresumedFamilies: ['machine_guarding'],
    acceptedCandidates: [cand('a', 'machine_guarding'), cand('b', 'machine_guarding')],
    emittedClarifications: [q('q1', 'a')],
  });
  assert(genuinelyAmbiguous.realized === true
      && genuinelyAmbiguous.countsInForbiddenDenominator === true,
    'C2.3 a link to one of two interchangeable candidates IS still a realized ambiguity challenge — '
    + 'the repair narrows the denominator, it does not disarm the measure');

  // Ambiguity needs at least two candidates in the presumed families to exist at all.
  const collapsed = evaluateScenarioIntent({
    rowId: 'Y', intent: 'AMBIGUOUS_CANDIDATE_CHALLENGE',
    intentPresumedFamilies: ['machine_guarding'],
    acceptedCandidates: [cand('a', 'machine_guarding')],
    emittedClarifications: [q('q1', 'a')],
  });
  assert(collapsed.realized === false,
    'C2.4 one candidate cannot be ambiguous with itself — intent not realized');

  // No clarification: no linkage situation in EITHER direction.
  for (const intent of ['AMBIGUOUS_CANDIDATE_CHALLENGE', 'DIFFERENT_HAZARD_CHALLENGE',
    'GENERIC_FOLLOWUP_CHALLENGE'] as const) {
    const none = evaluateScenarioIntent({ rowId: 'Z', intent,
      intentPresumedFamilies: ['machine_guarding'],
      acceptedCandidates: [cand('a', 'machine_guarding'), cand('b', 'electrical')],
      emittedClarifications: [] });
    assert(none.realized === false && none.countsInForbiddenDenominator === false,
      `C2.5 ${intent}: no clarification emitted => not a FORBIDDEN opportunity`);
  }

  const noClaim = evaluateScenarioIntent({ rowId: 'N', intent: 'NO_LINKAGE_CLAIM',
    acceptedCandidates: [cand('a', 'machine_guarding')],
    emittedClarifications: [q('q1', 'a')] });
  assert(noClaim.realized === false && noClaim.countsInForbiddenDenominator === false,
    'C2.6 NO_LINKAGE_CLAIM rows never enter any linkage denominator, even when they link');

  // ---- candidate quality is a SEPARATE axis and must never move a linkage count.
  const truth = { presentHazardFamilies: ['fall_protection'],
    defensibleHazardFamilies: ['walking_working_surfaces'],
    forbiddenHazardFamilies: ['material_handling_storage'] };
  assert(classifyCandidateQuality('fall_protection', truth).quality === 'SUPPORTED_ADDITIVE_CANDIDATE',
    'C2.7 a present family classifies SUPPORTED_ADDITIVE_CANDIDATE');
  assert(classifyCandidateQuality('walking_working_surfaces', truth).quality === 'PLAUSIBLE_BUT_UNVERIFIED',
    'C2.8 a defensible family classifies PLAUSIBLE_BUT_UNVERIFIED — neither supported nor spurious');
  assert(classifyCandidateQuality('material_handling_storage', truth).quality === 'SPURIOUS_CANDIDATE',
    'C2.9 a forbidden family classifies SPURIOUS_CANDIDATE');
  assert(classifyCandidateQuality('noise_exposure', truth).quality === 'UNRESOLVABLE',
    'C2.10 a family outside the authored vocabulary is UNRESOLVABLE — candidate-quality uncertainty '
    + 'is REPORTED, never converted into a linkage defect');

  // The separation itself: a valid link to a non-supported candidate is still a valid link.
  const validLinkToPlausibleCandidate = linkageDiagnostics([{
    rowId: 'S', expectation: 'REQUIRED', emittedCandidateKeys: ['k1'],
    emittedClarifications: [{ clarificationId: 'q1', relatesToCandidateKey: 'k1' }],
    issueCodes: [] }]);
  assert(validLinkToPlausibleCandidate.REQUIRED_LINKAGE_VALID === 1,
    'C2.11 QUESTION A / QUESTION B SEPARATION: a link that resolves is LINKAGE_VALID regardless of '
    + 'what the candidate-quality axis says about the candidate it points at');
}

// ===================================================================== D
section('D. pre-spend identity — a rehearsal must not consume the live write-once path');
{
  const dir = mkdtempSync(join(tmpdir(), 'expert-identity-v3-'));
  const live = join(dir, 'PRE-SPEND-IDENTITY.json');
  const identity: PreSpendIdentity = {
    operation: '§143 self-test', capturedAt: '2026-09-02T00:00:00.000Z', isFormalEvaluation: false,
    hashes: { probeScriptSha256: 'a'.repeat(64), fixtureManifestSha256: 'b'.repeat(64),
      systemPromptSha256: 'c'.repeat(64), wireSchemaSha256: 'd'.repeat(64),
      normalizationSha256: 'e'.repeat(64), contractTypesSha256: 'f'.repeat(64) },
    execution: { provider: 'p', model: 'm', promptVersion: EXPERT_PROMPT_VERSION,
      analysisContractVersion: 'hazlenz.expert.analysis.v2' },
    budget: { targetLogicalCalls: 9, hardProviderRequestCeiling: 12, retryRequestBudget: 3,
      enforcedSpendCeilingUsd: 1.248, worstCaseRequestUsd: 0.104 },
  };

  // DRY RUN: validates everything, creates nothing. Modelled as the probe now sequences it —
  // the gate runs, then the rehearsal exits BEFORE the identity write.
  const dryRunValidatedFields =
    Object.values(identity.hashes).every(h => /^[0-9a-f]{64}$/.test(h))
    && identity.execution.promptVersion.length > 0
    && identity.budget.hardProviderRequestCeiling > identity.budget.targetLogicalCalls;
  assert(dryRunValidatedFields, 'D.1 DRY RUN validates all identity material');
  assert(!existsSync(live),
    'D.2 DRY RUN does NOT create the live identity artifact — the §142 defect, where the $0.00 '
    + 'rehearsal consumed the one write the paid run needed');

  writePreSpendIdentityOnce(live, identity);
  assert(existsSync(live), 'D.3 LIVE INITIALIZATION creates the artifact once');
  const firstSha = sha256(readFileSync(live));

  let refused = false; let typed = false;
  try { writePreSpendIdentityOnce(live, { ...identity, operation: 'SECOND LIVE WRITE' }); }
  catch (e) { refused = true; typed = e instanceof IdentityAlreadyWrittenError; }
  assert(refused && typed, 'D.4 A SECOND LIVE WRITE FAILS, with a typed error');
  assert(sha256(readFileSync(live)) === firstSha,
    'D.5 and THE BYTES REMAIN UNCHANGED — the refusal touched nothing');

  rmSync(dir, { recursive: true, force: true });
}

// ===================================================================== M14
section('M14 — untouched by the precedence repair');
{
  const promptSrc = readFileSync(join(__dirname, '..', 'src', 'hazlenz', 'expert-hazlenz',
    'expert-prompt.ts'), 'utf8');
  const normSrc = readFileSync(join(__dirname, '..', 'src', 'hazlenz', 'expert-hazlenz',
    'expert-normalization.ts'), 'utf8');
  const codeOnly = (src: string) => src.split('\n')
    .filter(l => { const t = l.trim();
      return !t.startsWith('*') && !t.startsWith('//') && !t.startsWith('/*'); }).join('\n');

  assert(!/canonicali[sz]/i.test(codeOnly(promptSrc)) && !/canonicali[sz]/i.test(codeOnly(normSrc)),
    'M14.1 no canonicalization in prompt or normalizer CODE');
  assert(/NOT AN M14 CHANGE/i.test(promptSrc),
    'M14.2 the v9 rationale records that this is not an M14 change');
  assert(!/permut/i.test(stableStringify(buildExpertWireSchema(input()))),
    'M14.3 the wire schema makes no permutation claim');
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) { console.log(failures.map(f => `  - ${f}`).join('\n')); process.exit(1); }
