/**
 * §156 EXPERT HAZLENZ -- BLINDED VERIFIER PACKET BUILDER. ZERO PROVIDER CALLS.
 *
 * Builds the fifteen verifier cases from STORED §152-§154 evidence and nothing else. No first-pass
 * Expert response is regenerated, and no provider is called.
 *
 * ==================== WHAT BLINDING MEANS HERE ====================
 *
 * Each case carries ONLY what a production verifier would legitimately possess: the observation, the
 * governed evidence as supplied to the first pass, the deterministic HazLenz result, the stored
 * first-pass Expert result, and the unresolved facts the §155 trigger named.
 *
 * REMOVED, and each for a reason:
 *
 *   - the row id (`HS-A1`, `HS-J1`, ...). Cases are `VC-01`..`VC-15` in a shuffled, seed-free order
 *     fixed once. A row id is a handle into three probe reports and a fixture module.
 *   - REQUIRED / FORBIDDEN. This is the answer.
 *   - the fixture `form` (`NOT_VISIBLE`, `EXPLICITLY_PRESENT`, ...). These name the answer in prose.
 *   - the authored `missingFact`, `acceptableSelectors`, `temptingQuestion`, `whyNotDecisionCritical`.
 *   - the draw label. `§152` and `§154` are the names of documents that discuss these very rows.
 *   - every scoring figure, adjudication, and prior model judgement.
 *
 * The mapping from case id to (draw, row) lives in the SEALED key, which is written separately, is
 * not part of the packet hash the verifier sees, and is not sent to the provider.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, chmodSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-verifier-accuracy-2026-09-03');

const DRAW_DIR: Record<string, string> = {
  R1: 'expert-hazlenz-hardened-v13-baseline-2026-09-03',
  R2: 'expert-hazlenz-hardened-v13-replicate2-2026-09-03',
  R3: 'expert-hazlenz-hardened-v13-replicate3-2026-09-03',
};

/**
 * The fifteen executions the §155 trigger fired on, in a FIXED presentation order chosen once and
 * never revisited. The order interleaves draws and rows so that neighbouring cases are not the same
 * observation, and it is not sorted by anything that correlates with the answer.
 *
 * THIS LIST IS NOT RE-DERIVED FROM THE TRIGGER AT BUILD TIME AND MUST NOT BE. §156 forbids changing
 * the trigger after seeing hosted results; freezing its output as data is how that is enforced.
 */
const TRIGGERED: Array<{ caseId: string; draw: string; rowId: string }> = [
  { caseId: 'VC-01', draw: 'R3', rowId: 'HS-P1' },
  { caseId: 'VC-02', draw: 'R2', rowId: 'HS-H1' },
  { caseId: 'VC-03', draw: 'R1', rowId: 'HS-J1' },
  { caseId: 'VC-04', draw: 'R3', rowId: 'HS-E1' },
  { caseId: 'VC-05', draw: 'R1', rowId: 'HS-R1' },
  { caseId: 'VC-06', draw: 'R3', rowId: 'HS-N1' },
  { caseId: 'VC-07', draw: 'R2', rowId: 'HS-P1' },
  { caseId: 'VC-08', draw: 'R3', rowId: 'HS-A1' },
  { caseId: 'VC-09', draw: 'R1', rowId: 'HS-N1' },
  { caseId: 'VC-10', draw: 'R2', rowId: 'HS-R1' },
  { caseId: 'VC-11', draw: 'R3', rowId: 'HS-J1' },
  { caseId: 'VC-12', draw: 'R1', rowId: 'HS-P1' },
  { caseId: 'VC-13', draw: 'R3', rowId: 'HS-H1' },
  { caseId: 'VC-14', draw: 'R2', rowId: 'HS-J1' },
  { caseId: 'VC-15', draw: 'R3', rowId: 'HS-R1' },
];

interface Wire {
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

interface RunRecord {
  row: { source: { rowId: string; observation: string; jurisdiction: string;
    allowedHazardFamilies: string[]; governedStandards: unknown[];
    supplementaryContext: unknown[] } };
  deterministicFamiliesEmitted: string[];
  lifeCriticalFindingKeys: string[];
}

const readWire = (draw: string): Record<string, Wire> => Object.fromEntries(
  readFileSync(join(ROOT, 'verification', DRAW_DIR[draw], 'RAW-WIRE.jsonl'), 'utf8')
    .trim().split('\n').filter(Boolean)
    .map(l => { const o = JSON.parse(l) as Wire; return [o.rowId, o]; }));

const readRecords = (draw: string): Record<string, RunRecord> => Object.fromEntries(
  readFileSync(join(ROOT, 'verification', DRAW_DIR[draw], 'RUN-RECORDS.jsonl'), 'utf8')
    .trim().split('\n').filter(Boolean)
    .map(l => { const o = JSON.parse(l) as RunRecord; return [o.row.source.rowId, o]; }));

const UNRESOLVED = new Set(['INSUFFICIENT_EVIDENCE', 'UNKNOWN']);

/** Exactly the shape the verifier is sent. Nothing else reaches the provider. */
export interface VerifierCase {
  caseId: string;
  observation: string;
  jurisdiction: string;
  governedEvidence: unknown[];
  deterministic: { familiesEmitted: string[]; lifeCriticalFindingKeys: string[] };
  firstPass: {
    candidates: Array<{ candidateKey: string; hazardFamily: string;
      assertedConditionState: string; evidenceBasis: string; reasoning: string }>;
    clarifications: Array<{ clarificationId: string; question: string;
      affectedDecision: string }>;
    uncertainty: string[];
    summary: string;
  };
  unresolvedFacts: Array<{ ref: string; kind: 'CANDIDATE' | 'UNCERTAINTY_STATEMENT'; text: string }>;
  triggerConditions: string[];
}

function main(): void {
  mkdirSync(OUT, { recursive: true });
  const wires: Record<string, Record<string, Wire>> = {};
  const records: Record<string, Record<string, RunRecord>> = {};
  for (const d of Object.keys(DRAW_DIR)) { wires[d] = readWire(d); records[d] = readRecords(d); }

  const cases: VerifierCase[] = [];
  const sealedKey: Array<{ caseId: string; draw: string; rowId: string }> = [];

  for (const t of TRIGGERED) {
    const w = wires[t.draw][t.rowId];
    const rec = records[t.draw][t.rowId];
    if (!w || !rec) throw new Error(`missing stored evidence for ${t.draw} ${t.rowId}`);

    const unresolvedFacts: VerifierCase['unresolvedFacts'] = [];
    for (const c of w.candidates) {
      if (UNRESOLVED.has(c.assertedConditionState)) {
        unresolvedFacts.push({ ref: `candidate:${c.candidateKey}`, kind: 'CANDIDATE',
          text: `${c.candidateKey} (${c.hazardFamily}) left ${c.assertedConditionState}: `
            + `${c.evidenceBasis ?? ''}` });
      }
    }
    (w.uncertainty ?? []).forEach((u, i) => {
      if (typeof u === 'string' && u.trim().length > 0) {
        unresolvedFacts.push({ ref: `uncertainty:${i}`, kind: 'UNCERTAINTY_STATEMENT', text: u });
      }
    });

    const triggerConditions: string[] = [];
    if (w.clarifications.length === 0 && unresolvedFacts.length > 0) {
      triggerConditions.push('T_RETAINED_UNKNOWN_WITHOUT_QUESTION');
    }
    if (w.candidates.length === 0 && w.clarifications.length === 0) {
      triggerConditions.push('T_WHOLLY_EMPTY_ANALYSIS');
    }

    cases.push({
      caseId: t.caseId,
      observation: rec.row.source.observation,
      jurisdiction: rec.row.source.jurisdiction,
      governedEvidence: rec.row.source.governedStandards,
      deterministic: {
        familiesEmitted: rec.deterministicFamiliesEmitted,
        lifeCriticalFindingKeys: rec.lifeCriticalFindingKeys,
      },
      firstPass: {
        candidates: w.candidates.map(c => ({
          candidateKey: c.candidateKey, hazardFamily: c.hazardFamily,
          assertedConditionState: c.assertedConditionState,
          evidenceBasis: c.evidenceBasis ?? '', reasoning: c.reasoning ?? '',
        })),
        clarifications: w.clarifications.map(q => ({
          clarificationId: q.clarificationId ?? '', question: q.question,
          affectedDecision: q.affectedDecision,
        })),
        uncertainty: w.uncertainty ?? [],
        summary: w.summary ?? '',
      },
      unresolvedFacts,
      triggerConditions,
    });
    sealedKey.push(t);
  }

  // ---- BLINDING PROOF. Assert mechanically that no leak survived, rather than trusting the code.
  const serialised = JSON.stringify(cases);
  const forbidden = [
    /HS-[A-R]\d/,                       // row ids
    /\bREQUIRED\b/, /\bFORBIDDEN\b/,    // the answer
    /NOT_VISIBLE|EXPLICITLY_PRESENT|PRIOR_EVENT|WORST_CASE_TEMPTATION|SETTLED_THRESHOLD/,
    /DECISION_INVARIANT_UNKNOWN|NON_DECISION_CRITICAL_DETAIL|SEVERITY_REFINEMENT_ONLY/,
    /TRUE_DETERMINISTIC_DERIVATION|RETAINED_CANDIDATE_SHAPED|EXPLICITLY_ABSENT/,
    /acceptableSelectors|missingFact|temptingQuestion|whyNotDecisionCritical|whatMakesItSettled/,
    /§1[45]\d/,                          // section references
    /replicate|baseline-2026|hardened-development-set/,
  ];
  const leaks = forbidden.filter(re => re.test(serialised)).map(re => re.source);
  if (leaks.length > 0) {
    throw new Error(`BLINDING FAILED — packet contains: ${leaks.join(' | ')}`);
  }

  const packet = {
    packetVersion: 'hazlenz.expert.verifier-packet.v1',
    builtFrom: 'stored prior-run raw wire and run records; NO first-pass response regenerated',
    caseCount: cases.length,
    cases,
  };
  const packetJson = `${JSON.stringify(packet, null, 2)}\n`;
  const packetPath = join(OUT, 'VERIFIER-PACKET.json');
  if (existsSync(packetPath)) {
    console.log('packet already exists and is frozen — refusing to rewrite it');
    console.log(`  sha256 ${createHash('sha256').update(readFileSync(packetPath)).digest('hex')}`);
    return;
  }
  writeFileSync(packetPath, packetJson);
  chmodSync(packetPath, 0o444);

  const keyPath = join(OUT, 'SEALED-CASE-KEY.json');
  writeFileSync(keyPath, `${JSON.stringify({
    note: 'NOT SENT TO THE PROVIDER. Maps blinded case ids back to stored executions for scoring.',
    key: sealedKey,
  }, null, 2)}\n`);
  chmodSync(keyPath, 0o444);

  const sha = createHash('sha256').update(packetJson).digest('hex');
  console.log(`VERIFIER-PACKET.json written, ${cases.length} cases, 0444`);
  console.log(`  sha256 ${sha}`);
  console.log(`  blinding proof: ${forbidden.length} forbidden patterns, 0 matches`);
  console.log(`SEALED-CASE-KEY.json written, 0444 — not sent to the provider`);
  console.log('PROVIDER_CALLS = 0');
}

main();
