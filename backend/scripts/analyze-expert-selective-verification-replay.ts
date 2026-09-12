/**
 * §155 EXPERT HAZLENZ -- SELECTIVE VERIFICATION REPLAY. ZERO PROVIDER CALLS.
 *
 * Replays the §152, §153 and §154 stored raw wire through the §155 prototype -- response-state
 * classifier, deterministic postconditions, degenerate policy and selective-verification trigger --
 * and reports what WOULD have happened. Nothing is called, nothing is written back, and no stored
 * artifact is opened for writing.
 *
 * The figures are IN-SAMPLE by construction: the stored draws were visible while the trigger was
 * being measured. They describe this evidence and predict nothing.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

import {
  classifyExpertResponse, EXPERT_RESPONSE_STATE_MODEL_VERSION,
} from './lib/expert-provider-response-state';
import {
  evaluateSelectiveVerificationTrigger, triggerRuleViolations,
  SELECTIVE_VERIFICATION_TRIGGER_VERSION, REJECTED_TRIGGER_CONDITIONS,
  type TriggerVerdict,
} from './lib/expert-selective-verification-trigger';
import {
  decideDegeneratePolicy, RECOMMENDED_POLICY, DEGENERATE_POLICY_VERSION,
} from './lib/expert-degenerate-policy';
import { detectDegenerateOutput } from './lib/expert-degenerate-output-detector';
import { EXPERT_VERIFIER_CONTRACT_VERSION } from './lib/expert-verifier-contract';

const ROOT = join(__dirname, '..', '..');
const DRAWS = [
  ['R1 §152', 'expert-hazlenz-hardened-v13-baseline-2026-09-03'],
  ['R2 §153', 'expert-hazlenz-hardened-v13-replicate2-2026-09-03'],
  ['R3 §154', 'expert-hazlenz-hardened-v13-replicate3-2026-09-03'],
] as const;

/** The §154 sidecar's pre-registered denominators. Read, never re-chosen here. */
const REQUIRED_ROWS = ['HS-A1', 'HS-B1', 'HS-C1', 'HS-D1', 'HS-E1', 'HS-F1', 'HS-G1', 'HS-H1'];

interface WireRow {
  rowId: string;
  candidates: Array<{
    candidateKey: string; hazardFamily: string; assertedConditionState: string;
    evidenceBasis?: string; reasoning?: string; quotedEvidence?: string[];
  }>;
  clarifications: Array<{
    clarificationId?: string; question: string; affectedDecision: string;
    relatesToCandidateKey: string | null; whyItMatters?: string; evidenceGap?: string;
  }>;
  summary?: string;
  uncertainty?: string[];
}

function readDraw(dir: string): WireRow[] {
  const p = join(ROOT, 'verification', dir, 'RAW-WIRE.jsonl');
  if (!existsSync(p)) throw new Error(`missing stored evidence: ${p}`);
  return readFileSync(p, 'utf8').trim().split('\n').filter(Boolean)
    .map(l => JSON.parse(l) as WireRow);
}

function main(): void {
  console.log('§155 SELECTIVE VERIFICATION REPLAY — STORED EVIDENCE ONLY, 0 PROVIDER CALLS');
  console.log('='.repeat(100));
  console.log(`  state model ${EXPERT_RESPONSE_STATE_MODEL_VERSION}`);
  console.log(`  trigger     ${SELECTIVE_VERIFICATION_TRIGGER_VERSION}`);
  console.log(`  policy      ${DEGENERATE_POLICY_VERSION} — recommended ${RECOMMENDED_POLICY}`);
  console.log(`  verifier    ${EXPERT_VERIFIER_CONTRACT_VERSION}\n`);

  const perExecution: Array<{
    draw: string; rowId: string; required: boolean; state: string; degenerate: boolean;
    spoke: boolean; escalate: boolean; escalateWithStructural: boolean; fired: string[];
    structural: number; unresolvedFactCount: number;
  }> = [];
  const triggerVerdictsByDraw: Record<string, TriggerVerdict[]> = {};

  for (const [label, dir] of DRAWS) {
    const rows = readDraw(dir);
    const verdicts: TriggerVerdict[] = [];
    for (const w of rows) {
      const wire = {
        rowId: w.rowId,
        candidates: w.candidates.map(c => ({
          candidateKey: c.candidateKey, evidenceBasis: c.evidenceBasis, reasoning: c.reasoning,
        })),
        clarifications: w.clarifications.map(q => ({
          clarificationId: q.clarificationId, question: q.question,
          whyItMatters: q.whyItMatters, evidenceGap: q.evidenceGap,
        })),
        summary: w.summary,
        uncertainty: w.uncertainty ?? [],
      };
      const postconditionInput = {
        rowId: w.rowId,
        candidates: w.candidates,
        clarifications: w.clarifications,
        // The stored wire predates the state model, so no issue codes were captured beside it.
        // An empty list is the honest value: it is not a claim that none were raised.
        normalizationIssueCodes: [] as string[],
      };
      const classified = classifyExpertResponse({
        rowId: w.rowId,
        // Every stored execution was recorded PRESENT — that is the finding these states exist for.
        layerStatus: 'PRESENT',
        failureKind: null,
        issueCodes: [],
        wire,
        postconditionInput,
      });
      const trigger = evaluateSelectiveVerificationTrigger({
        rowId: w.rowId,
        candidates: w.candidates,
        clarifications: w.clarifications,
        uncertainty: w.uncertainty ?? [],
        postconditionWarningCodes: classified.postconditions.warnings.map(x => x.code),
      });
      verdicts.push(trigger);

      const degenerate = classified.state === 'DEGENERATE_SEMANTIC_OUTPUT';
      perExecution.push({
        draw: label, rowId: w.rowId, required: REQUIRED_ROWS.includes(w.rowId),
        state: classified.state, degenerate,
        spoke: w.clarifications.length > 0,
        // A degenerate execution is excluded from the trigger population: the policy layer takes it
        // first, and escalating junk to a verifier would buy a second opinion on nothing.
        escalate: !degenerate && trigger.ESCALATE,
        escalateWithStructural: !degenerate
          && trigger.ESCALATE_IF_STRUCTURAL_WARNINGS_ALSO_ESCALATED,
        fired: trigger.fired,
        structural: trigger.structuralWarnings.length,
        unresolvedFactCount: trigger.unresolvedFacts.length,
      });
    }
    triggerVerdictsByDraw[label] = verdicts;
  }

  // ---- 1. DEGENERATE POLICY, replayed.
  console.log('--- 1. DEGENERATE POLICY over the stored draws\n');
  const degenerateExecutions = perExecution.filter(e => e.degenerate);
  for (const e of degenerateExecutions) {
    const rows = readDraw(DRAWS.find(d => d[0] === e.draw)![1]);
    const w = rows.find(r => r.rowId === e.rowId)!;
    const verdict = detectDegenerateOutput({
      rowId: w.rowId,
      candidates: w.candidates.map(c => ({
        candidateKey: c.candidateKey, evidenceBasis: c.evidenceBasis, reasoning: c.reasoning,
      })),
      clarifications: w.clarifications,
      summary: w.summary,
    });
    const asCustomer = decideDegeneratePolicy(verdict, {
      purpose: 'CUSTOMER', reissueAttemptIndex: 0,
    });
    const asProbe = decideDegeneratePolicy(verdict, { purpose: 'PROBE', reissueAttemptIndex: 0 });
    console.log(`  ${e.draw} ${e.rowId}  signals ${verdict.signals.join('+')}`);
    console.log(`      customer path -> ${asCustomer.decision}`);
    console.log(`      scored run    -> ${asProbe.decision}  (${asProbe.reason})`);
  }
  console.log(`\n  degenerate executions ${degenerateExecutions.length} of ${perExecution.length}`
    + '  — DEVELOPMENT SAMPLE ONLY, not a production rate\n');

  // ---- 2. TRIGGER over the valid population.
  const valid = perExecution.filter(e => !e.degenerate);
  const reqValid = valid.filter(e => e.required);
  const forbValid = valid.filter(e => !e.required);
  const reqMisses = reqValid.filter(e => !e.spoke);
  const reqSpoke = reqValid.filter(e => e.spoke);

  console.log('--- 2. SELECTIVE VERIFICATION TRIGGER\n');
  console.log('  draw    row     exp   spoke  state                          escalate  fired');
  for (const e of perExecution) {
    console.log(`  ${e.draw.padEnd(8)}${e.rowId.padEnd(8)}${(e.required ? 'REQ' : 'FORB').padEnd(6)}`
      + `${(e.spoke ? 'yes' : 'no').padEnd(7)}${e.state.padEnd(31)}`
      + `${(e.degenerate ? 'n/a' : e.escalate ? 'YES' : 'no').padEnd(10)}${e.fired.join(',')}`);
  }

  const escalated = valid.filter(e => e.escalate);
  const missesCaught = reqMisses.filter(e => e.escalate);
  const missesUncaught = reqMisses.filter(e => !e.escalate);
  const spokeEscalated = reqSpoke.filter(e => e.escalate);
  const forbEscalated = forbValid.filter(e => e.escalate);

  console.log('\n  valid executions                       '
    + `${valid.length} of ${perExecution.length}`);
  console.log(`  escalations                            ${escalated.length}/${valid.length}`
    + `  (${((escalated.length / valid.length) * 100).toFixed(1)}% of valid calls)`);
  console.log(`  REQUIRED misses (LOOSE) captured       ${missesCaught.length}/${reqMisses.length}`
    + `   uncaught: ${missesUncaught.map(e => `${e.draw} ${e.rowId}`).join(' | ') || 'none'}`);
  console.log(`  REQUIRED rows that SPOKE, escalated    ${spokeEscalated.length}/${reqSpoke.length}`
    + '   (successful rows must not be escalated wholesale)');
  console.log(`  FORBIDDEN executions escalated         ${forbEscalated.length}/${forbValid.length}`);
  console.log(`  precision on observed misses           ${missesCaught.length}/${escalated.length}`);
  const withStruct = valid.filter(e => e.escalateWithStructural);
  const withStructSpoke = reqSpoke.filter(e => e.escalateWithStructural);
  console.log('\n  COMPARISON — if structural postcondition warnings ALSO escalated:');
  console.log(`    escalations                          ${withStruct.length}/${valid.length}`
    + `  (${((withStruct.length / valid.length) * 100).toFixed(1)}%)`);
  console.log(`    REQUIRED rows that SPOKE, escalated  ${withStructSpoke.length}/${reqSpoke.length}`
    + '   — the cost of routing structure to a semantic judge');
  console.log('    REQUIRED misses captured             '
    + `${reqMisses.filter(e => e.escalateWithStructural).length}/${reqMisses.length}`
    + '   — unchanged, which is the argument for the separation');

  // ---- 3. THE THREE CREDIBILITY CRITERIA, answered explicitly.
  const hsH1 = valid.filter(e => e.rowId === 'HS-H1');
  const hsH1Captured = hsH1.filter(e => e.escalate);
  const c1 = hsH1Captured.length > 0;
  const c2 = spokeEscalated.length < reqSpoke.length;
  const c3 = forbEscalated.length <= forbValid.length / 4;

  console.log('\n--- 3. CREDIBILITY CRITERIA (§155 Phase 6)\n');
  console.log(`  [${c1 ? 'PASS' : 'FAIL'}] HS-H1 is captured — `
    + `${hsH1Captured.length} of ${hsH1.length} valid HS-H1 executions escalate`
    + `${hsH1Captured.length < hsH1.length ? ' (the draw that spoke a distractor exposes no signal)' : ''}`);
  console.log(`  [${c2 ? 'PASS' : 'FAIL'}] obvious valid rows are not universally escalated — `
    + `${spokeEscalated.length} of ${reqSpoke.length} successful REQUIRED executions escalate`);
  console.log(`  [${c3 ? 'PASS' : 'FAIL'}] FORBIDDEN rows do not routinely escalate — `
    + `${forbEscalated.length} of ${forbValid.length}`);

  // ---- 4. RULE VIOLATIONS the authorization named.
  console.log('\n--- 4. FORBIDDEN TRIGGER RULES\n');
  for (const [label] of DRAWS) {
    const rows = readDraw(DRAWS.find(d => d[0] === label)![1]);
    const ieRows = rows.filter(r => r.candidates.some(
      c => c.assertedConditionState === 'INSUFFICIENT_EVIDENCE'
        || c.assertedConditionState === 'UNKNOWN')).map(r => r.rowId);
    const violations = triggerRuleViolations(triggerVerdictsByDraw[label], ieRows);
    console.log(`  ${label}  INSUFFICIENT_EVIDENCE rows ${ieRows.length}`
      + `   violations: ${violations.join('; ') || 'none'}`);
  }

  console.log('\n--- 5. CONDITIONS MEASURED AND REJECTED\n');
  for (const [k, why] of Object.entries(REJECTED_TRIGGER_CONDITIONS)) {
    console.log(`  ${k}: ${why}`);
  }

  console.log('\nPROVIDER_CALLS_THIS_SCRIPT = 0   STORED_EVIDENCE_MODIFIED = FALSE');
}

main();
