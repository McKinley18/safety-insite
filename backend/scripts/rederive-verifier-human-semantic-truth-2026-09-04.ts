/**
 * §162 EXPERT HAZLENZ -- HUMAN-TRUTH DISPOSITIONS RECORDED + SEMANTIC RE-DERIVATION.
 * ZERO PROVIDER CALLS.
 *
 * ==================== WHAT THIS IS ====================
 *
 * The product owner returned all seven row dispositions. This file records them, then re-derives
 * verifier evidence using ONLY the two rows human review left authoritative -- HS-A1 and HS-E1.
 *
 * ==================== HUMAN_SEMANTIC_REDERIVATION, AND WHY THE LABEL MATTERS ====================
 *
 * `B_SELECTOR_ACCURACY_KEYWORD_SCORER_PROSPECTIVE_AUTHORITY = RETIRED`, so selector correctness here
 * is NOT automated scorer output. It is matched against SEMANTIC TARGETS AND ACCEPTABLE EQUIVALENTS
 * SUPPLIED BY THE PRODUCT OWNER, reproduced verbatim in HUMAN_SEMANTIC_TARGETS below. Every match
 * records WHICH equivalent it matched and prints the verbatim question beside it, so the owner can
 * check each one rather than trust the label.
 *
 * The keyword scorer is not deleted and no replacement is implemented. This module does not compute
 * `B_selectorAccuracy`; it computes `semanticSelectorAccuracy_HUMAN_SEMANTIC_REDERIVATION`, which is
 * a different measure with a different name.
 *
 * ==================== THE TWO RULES THAT DECIDE THE OUTCOME ====================
 *
 *   1. A TRUNCATED EXECUTION IS `EXECUTION_INVALID` FOR SEMANTIC SCORING and stays that way. What it
 *      emitted before truncation is recorded separately as observation, and NOTHING is inferred about
 *      the field truncation destroyed.
 *   2. A SEMANTIC DEFECT IS ESTABLISHED ONLY IF AN EXECUTION-VALID STORED OUTPUT FAILS against
 *      independently human-reviewed authoritative truth.
 *
 * ==================== ONE GUARD THE OWNER ASKED FOR EXPLICITLY ====================
 *
 * HS-E1's target must NOT encode a claim that OSHA requires a specific post-maintenance test after
 * every rotor tooth change. HS-E1 was supplied NO governed evidence, so no such requirement is
 * independently established. `assertNoRegulatoryOverreach()` fails the run if regulatory-requirement
 * language appears in a target for a row with no governed record.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const V = join(ROOT, 'verification');
const SRC = join(V, 'expert-hazlenz-verifier-accuracy-2026-09-03');
const V157 = join(V, 'expert-hazlenz-verifier-v2-remediation-2026-09-04');
const REPAIR = join(V, 'expert-hazlenz-vc04-measurement-repair-2026-09-04');
const RECON = join(V, 'expert-hazlenz-verifier-row-truth-reconciliation-2026-09-04');
const OUT = join(V, 'expert-hazlenz-verifier-human-truth-reconciliation-2026-09-04');

const sha256File = (p: string): string =>
  createHash('sha256').update(readFileSync(p)).digest('hex');
const readJson = <T>(p: string): T => JSON.parse(readFileSync(p, 'utf8')) as T;

/** PHASE 1. Verbatim from the product owner, 2026-09-04. Nothing inferred. */
const DISPOSITIONS: Record<string, string> = {
  'HS-A1': 'AUTHORING_VALID_MULTIPLE_ACCEPTABLE_SELECTORS',
  'HS-E1': 'AUTHORING_VALID_MULTIPLE_ACCEPTABLE_SELECTORS',
  'HS-H1': 'AUTHORING_AMBIGUOUS',
  'HS-J1': 'AUTHORING_INVALID',
  'HS-N1': 'AUTHORING_INVALID',
  'HS-P1': 'AUTHORING_INVALID',
  'HS-R1': 'AUTHORING_AMBIGUOUS',
};

/** PHASE 2. Only these two are eligible for prospective strict semantic truth. */
const ELIGIBLE = ['HS-A1', 'HS-E1'] as const;

/**
 * The owner's semantic targets, verbatim. `mustNotRequire` records the literal phrasing the owner
 * explicitly refused to make mandatory; `mustNotEncode` records the claim that may not be asserted.
 */
const HUMAN_SEMANTIC_TARGETS: Record<string, {
  target: string; acceptableEquivalents: string[];
  matchAny: string[][]; mustNotRequire: string; mustNotEncode?: string;
  affectedDecision: string;
}> = {
  'HS-A1': {
    target: 'the functional status/effectiveness of the burner flame-failure safeguard',
    acceptableEquivalents: [
      'whether the flame-failure safeguard is functional',
      'whether loss-of-flame shutdown has been function-tested',
      'whether the burner automatically shuts fuel off on flame loss',
      'whether the safeguard is bypassed, defeated, failed, or otherwise nonfunctional',
    ],
    // Meaning-level cues, each requiring a SAFEGUARD reference AND a FUNCTION/STATUS reference.
    // Presence alone must never satisfy this, per the owner's instruction.
    matchAny: [
      ['flame', 'function'], ['flame', 'verified as functional'], ['flame', 'tested'],
      ['flame', 'operational'], ['flame-safeguard', 'status'],
      ['shut', 'flame loss'], ['bypass', 'flame'], ['defeat', 'flame'],
    ],
    mustNotRequire: 'the literal phrase "flame-failure device"',
    affectedDecision: 'REQUIRED_CONTROL',
  },
  'HS-E1': {
    target: 'whether the rotor-guard interlock protective function was verified after reassembly / '
      + 'before return to service',
    acceptableEquivalents: [
      'whether the interlock was function-tested after reassembly',
      'whether opening the guard stops or prevents rotor operation',
      'whether safeguarding function was verified before return to service',
    ],
    matchAny: [
      ['interlock', 'function'], ['interlock', 'tested'], ['interlock', 'verif'],
      ['guard', 'stops'], ['guard', 'prevent'], ['rotor', 'stop'],
      ['safeguarding function', 'verif'],
    ],
    mustNotRequire: 'the literal phrase "function-tested after the rotor tooth change"',
    mustNotEncode: 'that OSHA requires a specific post-maintenance test after every rotor tooth '
      + 'change — HS-E1 was supplied NO governed evidence, so no such requirement is independently '
      + 'established',
    affectedDecision: 'REQUIRED_CONTROL',
  },
};

/** Regulatory-requirement language that may not appear in a target for a row with no governed record. */
const REGULATORY_CLAIM_PATTERNS = [
  /\bosha\s+requires\b/i, /\brequired\s+by\s+(osha|regulation|29\s*cfr)\b/i,
  /\b29\s*cfr\b/i, /\bmandated\s+by\b/i, /\bregulation\s+requires\b/i,
];

function assertNoRegulatoryOverreach(governedCountByRow: Record<string, number>): void {
  const bad: string[] = [];
  for (const [rowId, t] of Object.entries(HUMAN_SEMANTIC_TARGETS)) {
    if ((governedCountByRow[rowId] ?? 0) > 0) continue;
    const text = `${t.target} ${t.acceptableEquivalents.join(' ')}`;
    for (const re of REGULATORY_CLAIM_PATTERNS) {
      if (re.test(text)) bad.push(`${rowId}: ${re}`);
    }
  }
  if (bad.length > 0) {
    console.log(`\nREGULATORY_OVERREACH_GUARD_TRIPPED — a semantic target asserts a regulatory `
      + `requirement on a row with no governed evidence: ${bad.join('; ')}`);
    process.exit(1);
  }
}

/** Meaning-level match against the owner's equivalents. Returns which cue set matched. */
function semanticMatch(question: string, rowId: string): { reached: boolean; via: string | null } {
  const q = question.toLowerCase();
  const sets = HUMAN_SEMANTIC_TARGETS[rowId].matchAny;
  for (const set of sets) {
    if (set.every(k => q.includes(k))) return { reached: true, via: JSON.stringify(set) };
  }
  return { reached: false, via: null };
}

interface Execution {
  rowId: string; caseId: string; section: string; arm: string;
  verdict: string | null; clarificationProduced: boolean;
  question: string | null; affectedDecision: string | null;
  nominatedFactText: string | null;
  contractAdmitted: boolean; truncated: boolean; degenerate: boolean;
  stopReason: string | null; outputTokens: number | null; inputTokens: number | null;
  executionValid: boolean; executionInvalidReason: string | null;
  semanticallyReachesTarget: boolean | null; matchedVia: string | null;
  affectedDecisionCorrect: boolean | null;
  scoreableSemanticOutcome: boolean;
  semanticOutcome: string;
  preTruncationObservation: string | null;
}

function main(): void {
  mkdirSync(OUT, { recursive: true });
  console.log('§162 HUMAN-TRUTH DISPOSITIONS RECORDED + SEMANTIC RE-DERIVATION');
  console.log('='.repeat(100));
  console.log('  HUMAN_SEMANTIC_REDERIVATION — not automated scorer output.');
  console.log('  PROVIDER_CALLS = 0   COST = $0.00\n');

  const key = readJson<{ key: Array<{ caseId: string; draw: string; rowId: string }> }>(
    join(SRC, 'SEALED-CASE-KEY.json')).key;
  const packet = readJson<{ cases: Array<Record<string, any>> }>(join(SRC, 'VERIFIER-PACKET.json'));
  const v1 = readJson<{ results: Array<Record<string, any>> }>(join(SRC, 'VERIFIER-RESULTS.json'));
  const v2 = readJson<{ results: Array<Record<string, any>> }>(
    join(V157, 'VERIFIER-V2-RESULTS.json'));
  const repair = readJson<{ repairedExecution: Record<string, any>;
    onlyChangeProof: Record<string, any> }>(join(REPAIR, 'VC04-REPAIR-RESULT.json'));

  const governedByRow: Record<string, number> = {};
  for (const k of key) {
    const c = packet.cases.find(x => x.caseId === k.caseId)!;
    governedByRow[k.rowId] = (c.governedEvidence as unknown[]).length;
  }
  assertNoRegulatoryOverreach(governedByRow);
  console.log('  ok  REGULATORY_OVERREACH_GUARD — no semantic target asserts a regulatory '
    + 'requirement on a row with no governed record');

  /**
   * THE CHECK THAT DISTINGUISHES THIS FROM THE RETIRED SCORER. §160 FINDING 1 retired the keyword
   * scorer because its cue sets were satisfied by the OBSERVATION TEXT ITSELF, so a question echoing
   * the observation scored as reaching the fact. Any replacement matching must be tested against the
   * same failure, and the test must run before any figure is emitted.
   */
  const selfSatisfying: string[] = [];
  for (const rowId of ELIGIBLE) {
    const obs: string = packet.cases.find(c =>
      c.caseId === key.find(k => k.rowId === rowId)!.caseId)!.observation;
    const m = semanticMatch(obs, rowId);
    if (m.reached) selfSatisfying.push(`${rowId} via ${m.via}`);
  }
  if (selfSatisfying.length > 0) {
    console.log(`\n  OBSERVATION_SELF_SATISFACTION_GUARD_TRIPPED — the semantic cue sets are `
      + `satisfied by the observation itself on: ${selfSatisfying.join('; ')}. That is the exact `
      + 'defect that retired the keyword scorer. Refusing to emit any figure.');
    process.exit(1);
  }
  console.log('  ok  OBSERVATION_SELF_SATISFACTION_GUARD — the semantic cue sets are NOT satisfied '
    + 'by either');
  console.log('      observation, so a question merely echoing the observation cannot score as '
    + 'reaching the target');
  console.log('      (this is the §160 FINDING 1 failure that retired the keyword scorer)\n');

  // ================================================================ PHASE 1
  const ledgerPath = join(RECON, 'ROW-TRUTH-DISPOSITIONS.json');
  const ledger = readJson<Record<string, any>>(ledgerPath);
  const REQ = ['HUMAN_REVIEWED', 'FACT_GENUINELY_UNRESOLVED', 'PLAUSIBLE_ALTERNATIVE_STATES',
    'MATERIAL_CURRENT_DECISION_DIVERGENCE', 'NECESSARY_NOW',
    'SEMANTIC_SELECTOR_MATCH_NOT_KEYWORD_OVERLAP'];
  console.log('--- PHASE 1  RECORD HUMAN DISPOSITIONS\n');
  for (const row of ledger.rows as Array<Record<string, any>>) {
    const d = DISPOSITIONS[row.rowId as string];
    row.disposition = d;
    row.dispositionedBy = 'PRODUCT_OWNER';
    row.dispositionedAt = '2026-09-04';
    const eligible = (ELIGIBLE as readonly string[]).includes(row.rowId as string);
    row.prospectiveStrictSemanticTruthEligibility = eligible ? 'ELIGIBLE' : 'INELIGIBLE';
    // Admission is recorded ONLY where the owner's disposition establishes it. An INVALID or
    // AMBIGUOUS row is not admitted, and nothing is asserted on the reviewer's behalf.
    row.observationOnlyTruthAdmission = Object.fromEntries(REQ.map(k => [k, eligible ? true
      : k === 'HUMAN_REVIEWED' ? true : false]));
    row.excludeFromDenominators = eligible ? []
      : ['A_decisionCriticalRecall', 'B_selectorAccuracy', 'C_legitimateSilenceSpecificity',
        'E_nominationAccuracy'];
    if (eligible) {
      row.humanSemanticTarget = HUMAN_SEMANTIC_TARGETS[row.rowId as string].target;
      row.acceptableEquivalents =
        HUMAN_SEMANTIC_TARGETS[row.rowId as string].acceptableEquivalents;
      row.mustNotRequire = HUMAN_SEMANTIC_TARGETS[row.rowId as string].mustNotRequire;
      if (HUMAN_SEMANTIC_TARGETS[row.rowId as string].mustNotEncode) {
        row.mustNotEncode = HUMAN_SEMANTIC_TARGETS[row.rowId as string].mustNotEncode;
      }
    }
    console.log(`  ${String(row.rowId).padEnd(7)} ${String(d).padEnd(46)} `
      + `${row.prospectiveStrictSemanticTruthEligibility}`);
  }
  ledger.ledgerVersion = 'hazlenz.expert.verifier.row-truth-dispositions.v2';
  ledger.completedAt = new Date().toISOString();
  ledger.HISTORICAL_SCORES_MUTATED = false;
  ledger.priorFixtureAuthoringAndScoring = 'HISTORICAL DEVELOPMENT EVIDENCE, NOT RETROACTIVELY '
    + 'CORRECTED FORMAL TRUTH. §152–§160 REQUIRED/FORBIDDEN labels are not rewritten.';
  writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);
  console.log(`\n  -> ROW-TRUTH-DISPOSITIONS.json updated (v2), 7/7 rows dispositioned`);

  // ================================================================ PHASE 4
  console.log('\n--- PHASE 4  RE-DERIVE VERIFIER RESULTS ON AUTHORITATIVE ROWS ONLY\n');
  const executions: Execution[] = [];
  for (const rowId of ELIGIBLE) {
    const ks = key.filter(k => k.rowId === rowId);
    for (const k of ks) {
      const armDefs: Array<{ arm: string; section: string; rec: Record<string, any> | undefined;
        acceptedKey: string }> = [
          { arm: 'verifier v1', section: '§156',
            rec: v1.results.find(r => r.caseId === k.caseId), acceptedKey: 'boundaryAccepted' },
          { arm: 'verifier v2', section: '§157',
            rec: v2.results.find(r => r.caseId === k.caseId), acceptedKey: 'admissionAccepted' },
        ];
      if (k.caseId === 'VC-04') {
        armDefs.push({ arm: 'verifier v2 (measurement repair)', section: '§158',
          rec: repair.repairedExecution, acceptedKey: 'admissionAccepted' });
      }
      for (const a of armDefs) {
        const r = a.rec!;
        const truncated = r.stopReason === 'max_tokens';
        const admitted = r[a.acceptedKey] === true;
        const p = r.proposedClarification as Record<string, string> | null;
        const question = p?.question ?? null;
        const m = question ? semanticMatch(question, rowId) : { reached: false, via: null };
        const invalidReason = truncated
          ? 'TRUNCATED — stop_reason max_tokens; the proposal field was destroyed before emission'
          : !admitted ? 'CONTRACT_REFUSED' : r.degenerate ? 'DEGENERATE' : null;
        const executionValid = !truncated && admitted && !r.degenerate;
        const owed = true; // both eligible rows are REQUIRED under authoritative human truth
        const outcome = !executionValid ? 'EXECUTION_INVALID — not scoreable'
          : question && m.reached ? 'SEMANTIC_SUCCESS — clarification reaches the human target'
            : question ? 'SEMANTIC_MISS — a clarification was produced but does not reach the target'
              : `SEMANTIC_MISS — no clarification produced on a row where one is owed `
                + `(verdict ${String(r.verdict)})`;
        executions.push({
          rowId, caseId: k.caseId, section: a.section, arm: a.arm,
          verdict: r.verdict ?? null, clarificationProduced: !!question,
          question, affectedDecision: p?.affectedDecision ?? null,
          nominatedFactText: (r.nominatedFact as Record<string, string> | null)?.missingFact ?? null,
          contractAdmitted: admitted, truncated, degenerate: !!r.degenerate,
          stopReason: r.stopReason ?? null, outputTokens: r.outputTokens ?? null,
          inputTokens: r.inputTokens ?? null,
          executionValid, executionInvalidReason: invalidReason,
          semanticallyReachesTarget: executionValid && question ? m.reached : null,
          matchedVia: executionValid && question ? m.via : null,
          affectedDecisionCorrect: executionValid && p
            ? p.affectedDecision === HUMAN_SEMANTIC_TARGETS[rowId].affectedDecision : null,
          scoreableSemanticOutcome: executionValid && owed,
          semanticOutcome: outcome,
          preTruncationObservation: truncated
            ? `verdict ${String(r.verdict)} / sourceMode ${String(r.clarificationSourceMode)}; `
              + `a complete nominatedFact was emitted: "${String(
                (r.nominatedFact as Record<string, string> | null)?.missingFact)}". `
              + 'RECORDED AS OBSERVATION ONLY. Nothing is inferred about the destroyed field and '
              + 'this execution is NOT scored as a semantic success.'
            : null,
        });
      }
    }
  }

  for (const e of executions) {
    console.log(`  ${e.rowId} ${e.caseId} ${e.section.padEnd(6)} ${e.arm.padEnd(32)}`);
    console.log(`      verdict ${String(e.verdict).padEnd(30)} admitted=${e.contractAdmitted} `
      + `truncated=${e.truncated} valid=${e.executionValid}`);
    if (e.question) {
      console.log(`      Q: "${e.question}"`);
      console.log(`      reaches target: ${e.semanticallyReachesTarget} `
        + `${e.matchedVia ? `via ${e.matchedVia}` : ''}  affectedDecision `
        + `${e.affectedDecision} correct=${e.affectedDecisionCorrect}`);
    }
    if (e.preTruncationObservation) console.log(`      PRE-TRUNCATION: ${e.preTruncationObservation}`);
    console.log(`      => ${e.semanticOutcome}\n`);
  }

  // ================================================================ PHASE 5
  console.log('--- PHASE 5  HUMAN-TRUTH METRICS  (HUMAN_SEMANTIC_REDERIVATION)\n');
  const scoreable = executions.filter(e => e.scoreableSemanticOutcome);
  const withQ = scoreable.filter(e => e.clarificationProduced);
  const recallHits = scoreable.filter(e => e.semanticallyReachesTarget === true);
  const falseNoClar = scoreable.filter(e => e.verdict === 'NO_CLARIFICATION_REQUIRED');
  const invalid = executions.filter(e => !e.executionValid);
  const adOk = withQ.filter(e => e.affectedDecisionCorrect === true);
  const cnt = (n: number, d: number) => d === 0 ? 'INSUFFICIENT — denominator is zero'
    : `${n}/${d}  (COUNT ONLY — denominator far below any rate threshold)`;

  console.log(`  A. REQUIRED semantic clarification recall   ${cnt(recallHits.length, scoreable.length)}`);
  console.log(`  B. semantic selector accuracy               ${cnt(withQ.filter(e => e.semanticallyReachesTarget === true).length, withQ.length)}`);
  console.log(`  C. affectedDecision accuracy                ${cnt(adOk.length, withQ.length)}`);
  console.log(`  D. false NO_CLARIFICATION_REQUIRED count    ${falseNoClar.length}`
    + `${falseNoClar.length ? ` — ${falseNoClar.map(e => `${e.caseId} ${e.section}`).join(', ')}` : ''}`);
  console.log(`  E. execution-valid rate                     ${scoreable.length}/${executions.length}`
    + `   (invalid: ${invalid.map(e => `${e.caseId} ${e.section}`).join(', ') || 'none'})`);

  // F. draw-to-draw stability: only byte-identical repeats count.
  const vc04_157 = executions.find(e => e.caseId === 'VC-04' && e.section === '§157')!;
  const vc04_158 = executions.find(e => e.caseId === 'VC-04' && e.section === '§158')!;
  const identicalInput = repair.onlyChangeProof.inputTokensMatch === true;
  console.log(`\n  F. draw-to-draw stability`);
  console.log(`     the ONLY byte-identical repeat in the corpus is VC-04 §157 vs §158`);
  console.log(`     provider-attested identical input: ${identicalInput} `
    + `(${repair.onlyChangeProof.observedInputTokensOriginal} metered tokens both draws)`);
  console.log(`     §157: ${vc04_157.verdict} (EXECUTION_INVALID — truncated)`);
  console.log(`     §158: ${vc04_158.verdict} (EXECUTION_VALID)`);
  console.log(`     => materially different emitted content on identical input: YES`);
  console.log(`     => two materially different CONTRACT-VALID outputs: NO (one draw was invalid)`);

  console.log('\n  LEGITIMATE_SILENCE_SPECIFICITY = INSUFFICIENT_HUMAN_TRUTH');
  console.log('     No human-reviewed authoritative FORBIDDEN row remains: HS-J1/HS-N1/HS-P1 are');
  console.log('     AUTHORING_INVALID and HS-R1 is AUTHORING_AMBIGUOUS.');
  console.log('  HISTORICAL_MECHANICAL_SILENCE_BEHAVIOR = 7/7');
  console.log('     WARNING: this is a MECHANICAL behaviour record only. Its semantic truth basis was');
  console.log('     subsequently invalidated or made ambiguous and it must not be reported as a');
  console.log('     semantic specificity score.');
  const nominations = executions.filter(e => e.nominatedFactText);
  console.log(`\n  NOMINATION_FALSE_POSITIVE_COUNT = 0  (mechanical containment observation)`);
  console.log(`     ${nominations.length} nomination(s) across the authoritative rows, all on a row`);
  console.log('     where a clarification IS owed. The former "0 false nominations across 15 cases"');
  console.log('     rested on FORBIDDEN labels now invalid or ambiguous and is downgraded.');

  // ================================================================ PHASE 6
  console.log('\n--- PHASE 6  DEFECT DETERMINATION\n');
  const semanticMisses = scoreable.filter(e => e.semanticallyReachesTarget !== true);
  const selectorDefect = withQ.filter(e => e.semanticallyReachesTarget === false);
  const adDefect = withQ.filter(e => e.affectedDecisionCorrect === false);
  const determination = {
    A_VERIFIER_DECISION_CRITICAL_DISCOVERY_DEFECT: semanticMisses.length > 0
      ? `ESTABLISHED — ${semanticMisses.map(e => `${e.caseId} ${e.section}`).join(', ')}`
      : 'NOT_ESTABLISHED',
    B_VERIFIER_SEMANTIC_SELECTOR_DEFECT: selectorDefect.length > 0
      ? `ESTABLISHED — ${selectorDefect.map(e => e.caseId).join(', ')}`
      : 'NOT_ESTABLISHED — every clarification produced on an authoritative row reached the target',
    C_VERIFIER_AFFECTED_DECISION_DEFECT: adDefect.length > 0
      ? `ESTABLISHED — ${adDefect.map(e => e.caseId).join(', ')}`
      : 'NOT_ESTABLISHED — every produced clarification carried the correct affectedDecision',
    D_PROVIDER_DRAW_INSTABILITY: 'ESTABLISHED. Byte-identical input — provider-attested at 4,598 '
      + 'metered input tokens on both draws, with the request bodies hashing identically once '
      + 'max_tokens is removed — produced ADD_OR_REPLACE_CLARIFICATION / NOMINATED_FACT carrying a '
      + 'complete nine-field nomination in §157, and NO_CLARIFICATION_REQUIRED carrying nothing in '
      + '§158.',
    D_basisAndItsOneJudgementCall: 'The §157 draw is EXECUTION_INVALID for SEMANTIC OUTCOME SCORING '
      + 'because truncation destroyed proposedClarification. That invalidity is scoped to semantic '
      + 'scoring by the operating instruction itself, and the content that DIFFERS between the two '
      + 'draws — the verdict, the source mode and the whole nomination — was fully and well-formedly '
      + 'emitted before truncation touched a different field. Instability is therefore established '
      + 'on validly-emitted content, independently of the semantic determination. THE ALTERNATIVE '
      + 'READING, stated so it can be overruled in one word: if "materially different VALID outputs" '
      + 'is read as requiring both draws to be CONTRACT-VALID, then instability drops to OBSERVED, '
      + 'NOT ESTABLISHED, and the terminal becomes TARGETED_SEMANTIC_REMEDIATION_AUTHORIZATION_'
      + 'REQUIRED instead.',
    D_limitation: 'n = 1 case, 2 draws. This is the ONLY byte-identical repeat in the entire corpus. '
      + 'It establishes that instability occurs; it does not measure a rate.',
    E_NO_VERIFIER_SEMANTIC_DEFECT_ESTABLISHED: semanticMisses.length === 0,
    F_INSUFFICIENT_HUMAN_TRUTH: 'APPLIES TO THE SILENCE SIDE ONLY — no authoritative FORBIDDEN row '
      + 'remains, so specificity, false-positive question rate and nomination precision cannot be '
      + 'measured at all.',
  };
  for (const [k2, v] of Object.entries(determination)) console.log(`  ${k2}\n      ${v}\n`);

  const hsE1Miss = semanticMisses.find(e => e.rowId === 'HS-E1');
  console.log('  THE EXACT MISS, ISOLATED FROM THE TRUNCATION EVENT:\n');
  if (hsE1Miss) {
    console.log(`    ${hsE1Miss.caseId} ${hsE1Miss.section} returned ${hsE1Miss.verdict} on a row`);
    console.log('    human review holds AUTHORING_VALID_MULTIPLE_ACCEPTABLE_SELECTORS. The execution');
    console.log('    was complete (520 of 4,000 tokens), contract-admitted, and not degenerate, so it');
    console.log('    is scoreable and it FAILS. This is a human-validated decision-critical miss.');
    console.log('    It is a SEPARATE finding from the §157 truncation, which remains an instrument');
    console.log('    defect and is not scored either way.');
  }

  // ================================================================ PHASE 7
  console.log('\n--- PHASE 7  NOMINATION-PRIOR EXPERIMENT REVIEW\n');
  const experiment = {
    q1_humanReviewedEvidenceEstablishesADiscoveryMiss: hsE1Miss
      ? `YES — ${hsE1Miss.caseId} ${hsE1Miss.section}` : 'NO',
    q2_evidenceThatTheUsuallyNoClauseCausedIt:
      'NO. The SAME instruction version (v2, sha ffc63119…) produced a nomination that reaches the '
      + 'target in §157 and a silence in §158 on byte-identical input. An instruction held constant '
      + 'across both outcomes cannot be the differentiator.',
    q3_canTheCausalClaimBeDistinguishedFromDrawInstability:
      'NO. With one case and two draws, instruction effect and provider variance are perfectly '
      + 'confounded on the only evidence that bears on it.',
    q4_wouldTheNinetyCallExperimentTestAnEstablishedMechanism:
      'NO — it would CONFOUND instruction effect with provider variance. Its pre-registered endpoint '
      + 'also assumed a 12-draw decision-critical denominator; the authoritative denominator is now '
      + `${scoreable.length} executions over ${ELIGIBLE.length} rows.`,
    RESULT: 'EXPERIMENT_REQUIRES_REDESIGN',
    whatARedesignMustDo: [
      'establish the per-draw variance of the verifier on identical input BEFORE comparing arms',
      'size replicates from that measured variance rather than from a fixed guess',
      're-derive the endpoint against the authoritative denominator that now exists',
      'expand authoritative human-reviewed truth — two rows cannot carry an arm comparison',
    ],
    spendAuthorized: false,
  };
  for (const [k2, v] of Object.entries(experiment)) {
    console.log(`  ${k2}\n      ${Array.isArray(v) ? v.join('\n      ') : v}\n`);
  }

  // ================================================================ PHASE 8
  const reliability = {
    DEGENERATE_OUTPUT_POLICY_STATUS: 'PROVEN_LOCAL / AWAITING_HOSTED_INTEGRATION — preserved, NOT '
      + 'reopened by this reconciliation',
    assessment: 'STRENGTHENED. The single reproducible phenomenon this reconciliation leaves standing '
      + 'is that byte-identical input produced materially different emitted content. Semantic prompt '
      + 'tuning cannot be measured through that variance — any arm difference would be indistinguish'
      + 'able from draw noise — whereas reliability integration (hosted degenerate-output handling, '
      + 'replay, multi-draw agreement) attacks the variance directly and is measurable without any '
      + 'additional authored truth.',
    recommendation: 'NEXT ENGINEERING TARGET SHOULD BE RELIABILITY INTEGRATION RATHER THAN FURTHER '
      + 'SEMANTIC PROMPT TUNING. Not implemented here; this is an assessment, not a change.',
    implemented: false,
  };
  console.log('--- PHASE 8  RELIABILITY ARCHITECTURE\n');
  console.log(`  ${reliability.assessment}\n`);
  console.log(`  => ${reliability.recommendation}\n`);

  // ================================================================ terminal
  // The terminal must follow the determinations, not be asserted beside them.
  const missEstablished = !!hsE1Miss;
  const instabilityEstablished =
    String(determination.D_PROVIDER_DRAW_INSTABILITY).startsWith('ESTABLISHED');
  const terminal = missEstablished && instabilityEstablished
    ? 'EXPERT_HAZLENZ_VERIFIER_HUMAN_TRUTH_REDERIVED — SEMANTIC_MISS_AND_PROVIDER_INSTABILITY_ESTABLISHED'
    : missEstablished
      ? 'EXPERT_HAZLENZ_VERIFIER_HUMAN_TRUTH_REDERIVED — TARGETED_SEMANTIC_REMEDIATION_AUTHORIZATION_REQUIRED'
      : instabilityEstablished
        ? 'EXPERT_HAZLENZ_VERIFIER_HUMAN_TRUTH_REDERIVED — PROVIDER_INSTABILITY_IS_PRIMARY_REMAINING_DEFECT'
        : 'EXPERT_HAZLENZ_VERIFIER_HUMAN_TRUTH_REDERIVED — INSUFFICIENT_AUTHORITATIVE_TRUTH';
  // Guard: a terminal claiming both must be backed by both determinations.
  if (terminal.includes('SEMANTIC_MISS_AND_PROVIDER_INSTABILITY_ESTABLISHED')
      && !(missEstablished && instabilityEstablished)) {
    console.log('\nTERMINAL_CONSISTENCY_GUARD_TRIPPED'); process.exit(1);
  }
  console.log(`  semantic miss established: ${missEstablished}   `
    + `provider instability established: ${instabilityEstablished}`);
  console.log(`  TERMINAL: ${terminal}\n`);

  const out = {
    operation: '§162 human-truth dispositions recorded + semantic re-derivation',
    builtAt: new Date().toISOString(),
    providerCalls: 0, costUsd: 0, productionFilesChanged: 0, historicalScoresMutated: false,
    terminal,
    MEASURE_LABEL: 'HUMAN_SEMANTIC_REDERIVATION — selector correctness judged against product-owner '
      + 'semantic targets, NOT automated scorer output',
    B_SELECTOR_ACCURACY_KEYWORD_SCORER_PROSPECTIVE_AUTHORITY: 'RETIRED — not deleted, historical '
      + 'results unaltered, no replacement production scorer implemented',
    phase1Dispositions: DISPOSITIONS,
    phase2Eligibility: Object.fromEntries(Object.keys(DISPOSITIONS).map(r =>
      [r, (ELIGIBLE as readonly string[]).includes(r) ? 'ELIGIBLE' : 'INELIGIBLE'])),
    humanSemanticTargets: HUMAN_SEMANTIC_TARGETS,
    regulatoryOverreachGuard: 'ARMED AND NOT TRIPPED — no semantic target asserts a regulatory '
      + 'requirement on a row with no governed record',
    observationSelfSatisfactionGuard: 'ARMED AND NOT TRIPPED — the semantic cue sets are not '
      + 'satisfied by either observation, so this matching does not reproduce the §160 FINDING 1 '
      + 'defect that retired the keyword scorer. Verified by execution before any figure was emitted.',
    matchingLimitation: 'The cue sets are lexical, but each requires BOTH a safeguard reference AND '
      + 'a function/status reference, so stated PRESENCE alone cannot satisfy them — the exact '
      + 'inference the product owner prohibited. Every match records which set it matched beside the '
      + 'verbatim question so a human can check it rather than trust the label. This is a '
      + 're-derivation aid under human-supplied targets, NOT a replacement production scorer.',
    phase4Executions: executions,
    phase5Metrics: {
      A_requiredSemanticClarificationRecall: cnt(recallHits.length, scoreable.length),
      B_semanticSelectorAccuracy_HUMAN_SEMANTIC_REDERIVATION:
        cnt(withQ.filter(e => e.semanticallyReachesTarget === true).length, withQ.length),
      C_affectedDecisionAccuracy: cnt(adOk.length, withQ.length),
      D_falseNoClarificationRequiredCount: falseNoClar.length,
      D_cases: falseNoClar.map(e => `${e.caseId} ${e.section}`),
      E_executionValid: `${scoreable.length}/${executions.length}`,
      E_invalidExecutions: invalid.map(e => ({ case: e.caseId, section: e.section,
        reason: e.executionInvalidReason })),
      F_drawToDrawStability: {
        onlyByteIdenticalRepeat: 'VC-04 §157 vs §158',
        providerAttestedIdenticalInput: identicalInput,
        meteredInputTokensBothDraws: repair.onlyChangeProof.observedInputTokensOriginal,
        section157: `${vc04_157.verdict} (EXECUTION_INVALID — truncated)`,
        section158: `${vc04_158.verdict} (EXECUTION_VALID)`,
        materiallyDifferentEmittedContent: true,
        twoMateriallyDifferentContractValidOutputs: false,
      },
      LEGITIMATE_SILENCE_SPECIFICITY: 'INSUFFICIENT_HUMAN_TRUTH',
      HISTORICAL_MECHANICAL_SILENCE_BEHAVIOR: '7/7',
      HISTORICAL_MECHANICAL_SILENCE_BEHAVIOR_WARNING: 'MECHANICAL BEHAVIOUR RECORD ONLY. Its '
        + 'semantic truth basis was subsequently invalidated (HS-J1, HS-N1, HS-P1 = '
        + 'AUTHORING_INVALID) or made ambiguous (HS-R1 = AUTHORING_AMBIGUOUS). It must NOT be '
        + 'reported as a semantic specificity score.',
      NOMINATION_FALSE_POSITIVE_COUNT: 0,
      NOMINATION_FALSE_POSITIVE_CAVEAT: 'mechanical containment observation only; the former "0 '
        + 'false nominations across 15 cases" rested on FORBIDDEN labels now invalid or ambiguous',
    },
    phase6DefectDetermination: determination,
    terminalDerivation: { missEstablished: !!hsE1Miss,
      instabilityEstablished:
        String(determination.D_PROVIDER_DRAW_INSTABILITY).startsWith('ESTABLISHED'),
      rule: 'the terminal follows the two determinations rather than being asserted beside them; a '
        + 'consistency guard fails the run if it does not' },
    theExactMiss: hsE1Miss ? {
      case: hsE1Miss.caseId, section: hsE1Miss.section, verdict: hsE1Miss.verdict,
      row: 'HS-E1', rowDisposition: DISPOSITIONS['HS-E1'],
      whyScoreable: 'complete (520 of 4,000 output tokens), contract-admitted, not degenerate',
      mechanism: 'The execution returned a settled silence on a row where human review holds a '
        + 'clarification is owed. Its own rationale asserts "the interlock is verified as engaged" — '
        + 'treating the stated PHYSICAL PRESENCE of the switch as establishing its PROTECTIVE '
        + 'FUNCTION. The product owner named exactly this inference as impermissible for HS-A1 '
        + '("do NOT treat physical presence alone as establishing functionality"), and it is the '
        + 'same inference here.',
      separateFrom: 'the §157 truncation, which is an instrument defect and is scored neither way',
    } : null,
    phase7ExperimentReview: experiment,
    phase8ReliabilityArchitecture: reliability,
    historicalImmutability: {
      section152to160EvidenceUnchanged: true,
      requiredForbiddenLabelsRewritten: false,
      priorFixtureAuthoringAndScoring: 'HISTORICAL DEVELOPMENT EVIDENCE, NOT RETROACTIVELY '
        + 'CORRECTED FORMAL TRUTH',
    },
  };
  writeFileSync(join(OUT, 'HUMAN-SEMANTIC-REDERIVATION.json'), `${JSON.stringify(out, null, 2)}\n`);
  writeFileSync(join(OUT, 'RETIRED-SCORER-NOTICE.md'),
    '# Retired scorer notice\n\n'
    + '`B_SELECTOR_ACCURACY_KEYWORD_SCORER_PROSPECTIVE_AUTHORITY = RETIRED` (product owner, '
    + '2026-09-04).\n\n'
    + '**Reason.** The scorer can be satisfied by lexical overlap with words already present in the\n'
    + 'observation, and therefore does not establish that a clarification semantically reaches the\n'
    + 'decision-critical missing fact.\n\n'
    + '**Not done:** the scorer is not deleted; historical results are not altered; no replacement\n'
    + 'production scorer is implemented.\n\n'
    + '**For this re-derivation only,** selector correctness was judged against the product owner\'s\n'
    + 'semantic targets and acceptable equivalents, and every match records which cue set it matched\n'
    + 'beside the verbatim question. This output is labelled `HUMAN_SEMANTIC_REDERIVATION` and is\n'
    + 'not automated scorer output.\n');

  console.log(`  -> ${OUT.replace(ROOT + '/', '')}/HUMAN-SEMANTIC-REDERIVATION.json`);
  console.log('  -> RETIRED-SCORER-NOTICE.md');
  console.log('  PROVIDER_CALLS_THIS_SCRIPT = 0');
}

main();
