/**
 * §163 VERIFIER-v2 PER-DRAW RELIABILITY — SCORER. ZERO PROVIDER CALLS.
 *
 * Reads the immutable draw records and computes the stability metrics. Kept separate from the probe
 * for the reason §156 gave: a scorer inside the probe can be adjusted and the probe re-run until the
 * number moves, and nothing in the artifacts would show it.
 *
 * ==================== TWO THINGS THIS FILE IS CAREFUL ABOUT ====================
 *
 * 1. THE INTENT CLUSTERING IS DESCRIPTIVE, NOT A SECOND TRUTH. To count "unique clarification
 *    intents" something must group questions by what they are about. The `INTENT_CLUSTERS` map below
 *    does that and is used ONLY for counting and reporting. It never decides semantic success --
 *    that decision comes from the frozen §162 human targets and nothing else. Adding a cluster label
 *    for a fact the verifier raised is not the same as making that fact acceptable truth.
 *
 * 2. MAJORITY VOTING IS EVALUATED HONESTLY, INCLUDING WHEN IT LOSES. A three-draw majority converges
 *    on the MODAL outcome. Where the modal outcome is the wrong one, majority voting entrenches the
 *    error rather than correcting it, and the policy comparison says so.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { HUMAN_SEMANTIC_TARGETS } from './lib/expert-human-semantic-targets-2026-09-04';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-verifier-draw-reliability-2026-09-04');

/** DESCRIPTIVE ONLY. Groups questions by subject for the intent count. Never decides success. */
const INTENT_CLUSTERS: Array<{ label: string; cues: string[] }> = [
  { label: 'flame-failure safeguard functional status', cues: ['flame'] },
  { label: 'discharge auger lockout / de-energisation', cues: ['auger'] },
  { label: 'guard interlock protective function verified', cues: ['interlock'] },
  { label: 'rotor tooth change workmanship verified / signed off', cues: ['tooth change'] },
];

interface Rec {
  rowId: string; caseId: string; draw: number; semanticRequestSha256: string;
  transportOk: boolean; stopReason: string | null; inputTokens: number; outputTokens: number;
  latencyMs: number; costUsd: number; responseState: string;
  contractAdmitted: boolean; verdict: string | null; sourceMode: string | null;
  nominationEmitted: boolean; clarificationEmitted: boolean;
  affectedDecision: string | null; question: string | null; nominatedFact: string | null;
  semanticTargetReached: boolean | null; semanticCueMatched: string | null;
  semanticMissType: string | null; forbiddenFieldCount: number; degenerate: boolean;
  executionValid: boolean; modelIdentity: string | null;
}

const dist = (xs: Array<string | null>): Record<string, number> => {
  const d: Record<string, number> = {};
  for (const x of xs) d[x ?? '(none)'] = (d[x ?? '(none)'] ?? 0) + 1;
  return d;
};
const outcomeOf = (r: Rec): string =>
  !r.executionValid ? `EXECUTION_INVALID:${r.responseState}`
    : r.semanticTargetReached === true ? 'SEMANTIC_SUCCESS'
      : (r.semanticMissType ?? 'UNCLASSIFIED');
const intentOf = (r: Rec): string => {
  if (!r.question) return '(no clarification)';
  const q = r.question.toLowerCase();
  const hit = INTENT_CLUSTERS.find(c => c.cues.every(k => q.includes(k)));
  return hit ? hit.label : '(unclustered)';
};
/** Share of draw pairs that agree on semantic outcome. */
const pairwiseAgreement = (rs: Rec[]): { agree: number; pairs: number; share: string } => {
  let agree = 0; let pairs = 0;
  for (let i = 0; i < rs.length; i += 1) {
    for (let j = i + 1; j < rs.length; j += 1) {
      pairs += 1;
      if (outcomeOf(rs[i]) === outcomeOf(rs[j])) agree += 1;
    }
  }
  return { agree, pairs, share: pairs ? `${((agree / pairs) * 100).toFixed(1)}%` : 'n/a' };
};

function main(): void {
  const recs = readFileSync(join(OUT, 'DRAW-RUN-RECORDS.jsonl'), 'utf8').trim().split('\n')
    .map(l => JSON.parse(l) as Rec);
  console.log('§163 VERIFIER-v2 PER-DRAW RELIABILITY — SCORED');
  console.log('='.repeat(100));
  console.log('  BOUNDED_DEVELOPMENT_RELIABILITY_SAMPLE — NOT a production error-rate estimate.');
  console.log(`  PROVIDER_CALLS_THIS_SCRIPT = 0   draws ${recs.length}\n`);

  const byCase: Record<string, unknown> = {};
  const cleanVarianceEvidence: string[] = [];

  for (const rowId of Object.keys(HUMAN_SEMANTIC_TARGETS)) {
    const rs = recs.filter(r => r.rowId === rowId);
    if (rs.length === 0) continue;
    const valid = rs.filter(r => r.executionValid);
    const success = valid.filter(r => r.semanticTargetReached === true);
    const silence = valid.filter(r => r.semanticMissType === 'SETTLED_SILENCE');
    const wrongFact = valid.filter(r => r.semanticMissType === 'WRONG_FACT_CLARIFICATION');
    const wrongAD = valid.filter(r => r.semanticMissType === 'WRONG_AFFECTED_DECISION');
    const contractInvalid = rs.filter(r => !r.contractAdmitted || r.stopReason === 'max_tokens');
    const degenerate = rs.filter(r => r.degenerate);
    const outcomes = rs.map(outcomeOf);
    const oDist = dist(outcomes);
    const modal = Object.entries(oDist).sort((a, b) => b[1] - a[1])[0];
    const intents = dist(rs.map(intentOf));
    const pw = pairwiseAgreement(rs);
    const uniqueQuestionStrings = new Set(rs.filter(r => r.question)
      .map(r => r.question!.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()));

    console.log(`--- ${rowId} (${rs[0].caseId})   ${rs.length} draws, `
      + `semantic request sha256 ${rs[0].semanticRequestSha256.slice(0, 24)}…\n`);
    console.log(`  execution-valid                 ${valid.length}/${rs.length}`);
    console.log(`  semantic success                ${success.length}/${valid.length}`
      + `   (reaches the frozen §162 human target)`);
    console.log(`  settled silence                 ${silence.length}`);
    console.log(`  wrong-fact clarification        ${wrongFact.length}`);
    console.log(`  wrong affectedDecision          ${wrongAD.length}`);
    console.log(`  contract-invalid                ${contractInvalid.length}`);
    console.log(`  degenerate                      ${degenerate.length}`);
    console.log(`  forbidden fields                ${rs.reduce((t, r) => t + r.forbiddenFieldCount, 0)}`);
    console.log(`  verdict distribution            ${JSON.stringify(dist(rs.map(r => r.verdict)))}`);
    console.log(`  source-mode distribution        ${JSON.stringify(dist(rs.map(r => r.sourceMode)))}`);
    console.log(`  affectedDecision distribution   ${JSON.stringify(dist(rs.map(r => r.affectedDecision)))}`);
    console.log(`  unique clarification intents    ${Object.keys(intents).filter(k => k !== '(no clarification)').length}`
      + `   ${JSON.stringify(intents)}`);
    console.log(`  unique question strings         ${uniqueQuestionStrings.size}`
      + '   (wording varies draw to draw even within one intent)');
    console.log(`  modal semantic outcome          ${modal[0]}  ${modal[1]}/${rs.length}`
      + `  (${((modal[1] / rs.length) * 100).toFixed(0)}%)`);
    console.log(`  pairwise semantic agreement     ${pw.agree}/${pw.pairs}  ${pw.share}\n`);

    // Clean variance: two or more execution-valid, nondegenerate draws, identical bytes,
    // materially different semantic outcomes.
    const validOutcomes = new Set(valid.map(outcomeOf));
    if (valid.length >= 2 && validOutcomes.size >= 2) {
      cleanVarianceEvidence.push(`${rowId}: ${valid.length} execution-valid draws of one frozen `
        + `request produced ${validOutcomes.size} materially different semantic outcomes — `
        + `${[...validOutcomes].join(' | ')}`);
    }

    byCase[rowId] = {
      caseId: rs[0].caseId, draws: rs.length, semanticRequestSha256: rs[0].semanticRequestSha256,
      executionValid: valid.length,
      semanticSuccess: `${success.length}/${valid.length}`,
      settledSilenceCount: silence.length, wrongFactCount: wrongFact.length,
      wrongAffectedDecisionCount: wrongAD.length,
      contractInvalidCount: contractInvalid.length, degenerateCount: degenerate.length,
      forbiddenFieldCount: rs.reduce((t, r) => t + r.forbiddenFieldCount, 0),
      verdictDistribution: dist(rs.map(r => r.verdict)),
      sourceModeDistribution: dist(rs.map(r => r.sourceMode)),
      affectedDecisionDistribution: dist(rs.map(r => r.affectedDecision)),
      uniqueClarificationIntents: intents,
      uniqueQuestionStrings: uniqueQuestionStrings.size,
      modalSemanticOutcome: modal[0], modalShare: `${modal[1]}/${rs.length}`,
      pairwiseSemanticAgreement: `${pw.agree}/${pw.pairs} (${pw.share})`,
      outcomeDistribution: oDist,
      medianLatencyMs: rs.map(r => r.latencyMs).sort((a, b) => a - b)[Math.floor(rs.length / 2)],
      meanCostUsd: Number((rs.reduce((t, r) => t + r.costUsd, 0) / rs.length).toFixed(6)),
      meanOutputTokens: Math.round(rs.reduce((t, r) => t + r.outputTokens, 0) / rs.length),
    };
  }

  // ---- across both cases
  const valid = recs.filter(r => r.executionValid);
  const success = valid.filter(r => r.semanticTargetReached === true);
  const pwAll = [...Object.keys(HUMAN_SEMANTIC_TARGETS)]
    .map(r => pairwiseAgreement(recs.filter(x => x.rowId === r)))
    .reduce((a, b) => ({ agree: a.agree + b.agree, pairs: a.pairs + b.pairs, share: '' }),
      { agree: 0, pairs: 0, share: '' });
  console.log('--- ACROSS BOTH CASES\n');
  console.log(`  total draws                     ${recs.length}`);
  console.log(`  execution-valid                 ${valid.length}/${recs.length}`);
  console.log(`  semantic successes              ${success.length}/${valid.length}`);
  console.log(`  human-validated semantic misses ${valid.length - success.length}/${valid.length}`);
  console.log(`  execution failures              ${recs.length - valid.length}`);
  console.log(`  within-case pairwise agreement  ${pwAll.agree}/${pwAll.pairs}  `
    + `${((pwAll.agree / pwAll.pairs) * 100).toFixed(1)}%`);
  const a1 = byCase['HS-A1'] as Record<string, unknown>;
  const e1 = byCase['HS-E1'] as Record<string, unknown>;
  console.log(`  between-case difference         HS-A1 success ${a1.semanticSuccess} vs `
    + `HS-E1 success ${e1.semanticSuccess}; HS-A1 never fell silent, HS-E1 fell silent `
    + `${e1.settledSilenceCount}/10\n`);

  const CLEAN_DRAW_VARIANCE_ESTABLISHED = cleanVarianceEvidence.length > 0;
  console.log(`  CLEAN_DRAW_VARIANCE_ESTABLISHED = ${CLEAN_DRAW_VARIANCE_ESTABLISHED}`);
  for (const ev of cleanVarianceEvidence) console.log(`    - ${ev}`);

  const RELIABILITY_INTEGRATION_JUSTIFIED = CLEAN_DRAW_VARIANCE_ESTABLISHED
    || (valid.length - success.length) > 0;
  console.log(`\n  RELIABILITY_INTEGRATION_JUSTIFIED = ${RELIABILITY_INTEGRATION_JUSTIFIED}`);

  // ---- policy comparison, from the measured distribution
  const meanCost = recs.reduce((t, r) => t + r.costUsd, 0) / recs.length;
  const medLat = recs.map(r => r.latencyMs).sort((a, b) => a - b)[Math.floor(recs.length / 2)];
  const pA1 = 3 / 10; const pE1 = 1 / 10; const silenceE1 = 8 / 10;
  const pct = (x: number) => `${(x * 100).toFixed(0)}%`;
  const policies = [
    { id: 'A. SINGLE_DRAW', calls: '1.00',
      cost: `$${meanCost.toFixed(4)}`, latency: `${medLat} ms`,
      addresses: 'nothing — this is the current behaviour and the measured baseline',
      reachesTarget: `HS-A1 ${pct(pA1)}, HS-E1 ${pct(pE1)}`,
      residue: 'all observed failure modes remain',
      reconciliation: 'none', failClosed: 'first-pass result stands unchanged' },
    { id: 'B. TWO_DRAW_CONFIRMATION', calls: '2.00 when the selective trigger fires',
      cost: `$${(meanCost * 2).toFixed(4)}`, latency: `${medLat} ms if parallel, ${medLat * 2} ms if serial`,
      addresses: 'settled-silence variance — raises the chance that SOMETHING is asked',
      reachesTarget: `at least one draw reaching target: HS-A1 ${pct(1 - (1 - pA1) ** 2)}, `
        + `HS-E1 ${pct(1 - (1 - pE1) ** 2)}`,
      residue: 'target displacement is untouched: two draws that both ask about the wrong fact agree '
        + 'with each other and look like consensus',
      reconciliation: 'DETERMINISTIC RULE REQUIRED: clarification vs silence must resolve toward '
        + 'ASKING, because asking costs a person time and not asking costs the control. Two '
        + 'different clarifications cannot be reconciled deterministically and must both surface or '
        + 'the case must escalate.',
      failClosed: 'on disagreement, surface the clarification; never silently drop one' },
    { id: 'C. CONDITIONAL_SECOND_DRAW', calls: `${(1 + silenceE1).toFixed(2)} on a case like HS-E1, 1.00 on a case like HS-A1`,
      cost: `$${(meanCost * (1 + silenceE1)).toFixed(4)} worst observed`,
      latency: `${medLat} ms typical, ${medLat * 2} ms when the second draw fires`,
      addresses: 'the modal-silence failure specifically, at roughly half the cost of B',
      reachesTarget: `HS-E1 ${pct(pE1 + silenceE1 * pE1)} — the second draw is drawn from the same `
        + 'distribution, so it inherits the same low reach',
      residue: 'target displacement untouched; a wrong-fact clarification on the first draw stops '
        + 'the escalation entirely because it is not a silence',
      reconciliation: 'trivial — only silence triggers the second draw',
      failClosed: 'if the second draw is also silent, the first-pass result stands' },
    { id: 'D. THREE_DRAW_MAJORITY', calls: '3.00',
      cost: `$${(meanCost * 3).toFixed(4)}`, latency: `${medLat} ms parallel, ${medLat * 3} ms serial`,
      addresses: 'NOTHING THAT MATTERS HERE, AND IT ACTIVELY HARMS. Majority voting converges on '
        + 'the MODAL outcome. The modal outcome is WRONG on both measured cases — settled silence '
        + '8/10 on HS-E1 and wrong-fact clarification 7/10 on HS-A1 — so a majority of three would '
        + 'entrench the error and present it with more confidence than a single draw.',
      reachesTarget: 'HS-A1 ~0% by majority (the wrong fact wins), HS-E1 ~0% by majority (silence wins)',
      residue: 'everything, plus a false impression of consensus',
      reconciliation: 'majority — which is exactly the defect',
      failClosed: 'n/a — not recommended for development comparison beyond this refutation' },
    { id: 'E. BOUNDED_SPECIALIST_ESCALATION', calls: 'n/a',
      cost: 'n/a', latency: 'n/a',
      addresses: 'in principle, target displacement — the failure repetition cannot fix',
      reachesTarget: 'unknown and unmeasurable today',
      residue: 'NOT SUPPORTABLE NOW. It requires a second qualified model or provider, and no second '
        + 'provider has been qualified. Introducing an unqualified one to adjudicate a safety '
        + 'clarification would place an unvalidated component on the decision path, which the '
        + 'architecture prohibits.',
      reconciliation: 'n/a', failClosed: 'n/a' },
  ];
  console.log('\n--- CANDIDATE RELIABILITY POLICIES, AGAINST THE MEASURED FAILURE DISTRIBUTION\n');
  for (const p of policies) {
    console.log(`  ${p.id}`);
    console.log(`    calls/triggered analysis  ${p.calls}`);
    console.log(`    incremental cost          ${p.cost}      latency ${p.latency}`);
    console.log(`    reaches target            ${p.reachesTarget}`);
    console.log(`    addresses                 ${p.addresses}`);
    console.log(`    residue                   ${p.residue}`);
    console.log(`    reconciliation            ${p.reconciliation}`);
    console.log(`    fail-closed               ${p.failClosed}\n`);
  }

  const semanticResidue = 'THE DECISIVE LIMIT. On HS-A1, 7 of 10 draws asked a well-formed, '
    + 'plausible safety question about a DIFFERENT fact — auger lockout — rather than the human '
    + 'target. On HS-E1, 8 of 10 fell silent. Neither failure is a reliability failure that '
    + 'repetition can fix: repeating a draw resamples the same distribution, and that distribution '
    + 'is centred on the wrong answer on BOTH cases. Reliability policy can raise the chance that '
    + 'something is asked; it cannot make the verifier ask the right thing. A bounded reliability '
    + 'policy is therefore worth having and is NOT sufficient on its own.';
  console.log(`  ${semanticResidue}\n`);

  const out = {
    scoredAt: new Date().toISOString(),
    label: 'BOUNDED_DEVELOPMENT_RELIABILITY_SAMPLE — NOT a production error-rate estimate, NOT an '
      + 'accuracy percentage, NOT a reliability or safety claim',
    providerCallsThisScript: 0,
    truthBasis: 'frozen §162 human-reviewed semantic targets; no model graded any output',
    intentClusteringNote: 'INTENT_CLUSTERS is DESCRIPTIVE and is used only to count unique intents. '
      + 'It never decides semantic success and does not make any clustered fact acceptable truth.',
    perCase: byCase,
    acrossCases: {
      totalDraws: recs.length, executionValid: valid.length,
      semanticSuccesses: success.length,
      humanValidatedSemanticMisses: valid.length - success.length,
      executionFailures: recs.length - valid.length,
      withinCasePairwiseAgreement: `${pwAll.agree}/${pwAll.pairs} `
        + `(${((pwAll.agree / pwAll.pairs) * 100).toFixed(1)}%)`,
      betweenCaseDifference: `HS-A1 reached the target ${a1.semanticSuccess} and never fell silent; `
        + `HS-E1 reached it ${e1.semanticSuccess} and fell silent ${e1.settledSilenceCount}/10`,
    },
    CLEAN_DRAW_VARIANCE_ESTABLISHED,
    cleanVarianceEvidence,
    RELIABILITY_INTEGRATION_JUSTIFIED,
    policyComparison: policies,
    semanticResidue,
    recommendedPolicy: 'C. CONDITIONAL_SECOND_DRAW as the bounded starting point — it targets the '
      + 'modal-silence failure at ~1.8 calls per triggered analysis and has a trivial deterministic '
      + 'reconciliation. RECOMMENDED FOR DESIGN, NOT SELECTED FOR PRODUCTION: on the measured '
      + 'distribution it would lift HS-E1 target reach only from 10% to ~18%, which is not a '
      + 'decision boundary anyone should rely on. D is refuted outright. E is not supportable '
      + 'without a qualified second provider.',
    degeneratePolicyComposition: 'The existing degenerate-output policy is UNCHANGED and composes '
      + 'cleanly: it operates on RESPONSE STATE (degenerate vs usable) and fires at most one bounded '
      + 'reissue before failing closed to deterministic HazLenz. Any reliability policy here '
      + 'operates one layer up, on SEMANTIC OUTCOME among usable responses. The ordering is: '
      + 'transport -> degenerate policy (at most one reissue, then fail closed) -> contract '
      + 'admission -> semantic reliability policy. No loops, and the reliability policy never '
      + 'reissues a degenerate response — that remains the degenerate policy\'s single bounded '
      + 'retry.',
  };
  writeFileSync(join(OUT, 'DRAW-RELIABILITY-SCORES.json'), `${JSON.stringify(out, null, 2)}\n`);
  console.log(`  -> DRAW-RELIABILITY-SCORES.json`);
  console.log('  PROVIDER_CALLS_THIS_SCRIPT = 0');
}

main();
