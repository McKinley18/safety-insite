/**
 * §231 — emit one adjudication packet per case: the frozen truth beside the actual output.
 *
 * ZERO provider calls. Presentation only; nothing is scored, repaired or interpreted here.
 * Running gate results are NOT computed or shown — adjudication is blinded by frozen rule.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ACCEPTANCE_CASES_230 } from './lib/expert-230-final-acceptance-instrument';

const EVID = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-231-final-fresh-acceptance-2026-09-11');
const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });

const state = JSON.parse(readFileSync(join(EVID, 'SECTION-231-AUTHORITATIVE-STATE.json'), 'utf8'));
const slots = JSON.parse(readFileSync(join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-230-final-fresh-acceptance-instrument-2026-09-11',
  'SECTION-230-JUDGMENT-SLOTS.json'), 'utf8')).slots as Record<string, any>[];

const J = (x: unknown): string => JSON.stringify(x, null, 2);

for (const c of ACCEPTANCE_CASES_230) {
  const s = state.cases.find((x: any) => x.caseId === c.caseId);
  const L: string[] = [];
  L.push(`########## CASE ${c.caseId} — ${c.domain} ##########`);
  L.push(`setting: ${c.setting}`);
  L.push(`decision under analysis: ${c.decisionUnderAnalysis}`);
  L.push(`\n---- OBSERVATION (as transmitted) ----\n${c.observation}`);
  L.push(`\n---- FROZEN TRUTH ----`);
  L.push(`establishedFacts: ${J(c.establishedFacts)}`);
  L.push(`expectedHazardConclusion: ${c.expectedHazardConclusion}`);
  L.push(`nonFacts: ${J(c.nonFacts)}`);
  L.push(`uncertaintyAnchors: ${J(c.uncertaintyAnchors)}`);
  L.push(`expectedDeclarationCount: ${c.expectedDeclarationCount}`);
  L.push(`owedProperties: ${J(c.owedProperties)}`);
  L.push(`immediatePosture: ${c.immediatePosture}`);
  L.push(`correctImmediateDecision: ${c.correctImmediateDecision}`);
  L.push(`acceptableCorrectiveDirection: ${c.acceptableCorrectiveDirection}`);
  L.push(`expectedClarificationNeed: ${c.expectedClarificationNeed}`);
  L.push(`expectedVerifierRouting: ${J(c.expectedVerifierRouting)}`);
  L.push(`governedRecords: ${J(c.governedRecords)}`);
  L.push(`allowedAuthority: ${J(c.allowedAuthority)}`);
  L.push(`prohibitedInventedAuthority: ${c.prohibitedInventedAuthority}`);
  L.push(`expectedFinalAuthoritativeState: ${c.expectedFinalAuthoritativeState}`);
  L.push(`unsafeOutcomeThatMustNotOccur: ${c.unsafeOutcomeThatMustNotOccur}`);
  L.push(`hardGatesExercised: ${J(c.hardGatesExercised)}`);
  L.push(`qualityMeasuresExercised: ${J(c.qualityMeasuresExercised)}`);
  L.push(`harnessMalformation: ${J(c.harnessMalformation)}`);

  L.push(`\n---- ACTUAL FIRST-PASS OUTPUT ----`);
  L.push(`failureClass: ${s.firstPass.failureClass}  stopReason: ${s.firstPass.stopReason}  `
    + `outputTokens: ${s.firstPass.outputTokens}`);
  L.push(`declarationsShape: ${s.firstPass.declarationsShape}  count: ${s.firstPass.declarationCount}`);
  L.push(`structuralDefects: ${J(s.structuralDefects)}`);
  L.push(`\nFULL PARSED OUTPUT:\n${J(s.firstPass.fullParsed)}`);

  L.push(`\n---- PROJECTION ----\n${J(s.projection)}`);
  if (s.rr7) L.push(`\n---- RR-7 ----\n${J(s.rr7)}`);
  L.push(`\n---- VERIFIER ----\n${J(s.verifier)}`);
  L.push(`\n---- EXERCISES (deterministic) ----\n${J(s.exercises)}`);

  L.push(`\n---- JUDGMENT SLOTS FOR THIS CASE ----`);
  for (const sl of slots.filter(x => x.caseId === c.caseId)) {
    L.push(`\n[${sl.id}] ${sl.axis}  (${sl.adjudicator})`);
    L.push(`  question: ${sl.question}`);
    L.push(`  whatToRead: ${sl.whatToRead}`);
    L.push(`  feedsHardGates: ${sl.feedsHardGates.join(',') || '-'}  `
      + `feedsQualityMeasures: ${sl.feedsQualityMeasures.join(',') || '-'}`);
  }
  writeFileSync(join(OUT, `PACKET-${c.caseId}.txt`), L.join('\n') + '\n');
}
console.log(`written ${ACCEPTANCE_CASES_230.length} packets to ${OUT}`);
