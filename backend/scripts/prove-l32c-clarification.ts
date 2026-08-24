/**
 * L3-2c -- R3 root-cause proof. Runs the REAL provider on the three clarification-expected
 * scenarios plus two must-not-ask controls, and records what the model actually produces at each
 * tier. Nothing is scored here; this establishes the trigger condition before any prompt change.
 *
 * Run: OUT=... npx ts-node scripts/prove-l32c-clarification.ts
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { HAZARD_TAXONOMY } from '../src/safescope-v2/taxonomy/hazard-taxonomy';
import { buildReasoningInput } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { OllamaReasoningProvider } from '../src/safescope-v2/reasoning-l3/ollama-reasoning-provider';
import { runValidatedReasoning } from '../src/safescope-v2/reasoning-l3/reasoning-runner';

const FAMILIES = [...new Set(HAZARD_TAXONOMY.map(p => p.id))].sort();

const CASES = [
  { id: 'H-AM-01', expectClarification: true, text: 'The overhead door track struck me as odd when I walked underneath it.' },
  { id: 'H-AM-02', expectClarification: true, text: 'One of the sling legs on the spreader bar may be cut.' },
  { id: 'H-AM-03', expectClarification: true, text: 'There was a puddle of something under the parts washer and I could not tell what it was or where it came from.' },
  { id: 'H-AM-06-control', expectClarification: false, text: 'The guard on the drill press is missing; I am not certain whether it was taken off this morning or last week.' },
  { id: 'H-EV-02-control', expectClarification: false, text: 'The bottom guard on the compound mitre saw does not return over the blade when the arm is raised.' },
];

async function main(): Promise<void> {
  const provider = new OllamaReasoningProvider();
  const records: any[] = [];
  for (const c of CASES) {
    const built = buildReasoningInput({
      analysisId: `l32c-clarification:${c.id}`, observationText: c.text,
      regulatoryContext: { value: 'osha-general-industry', provenance: 'USER_CONFIRMED' },
      allowedHazardFamilies: FAMILIES,
    });
    const run = await runValidatedReasoning(provider, built.input);
    const pre = run.validation?.validated?.hazards ?? [];
    const shipped = 'reasoning' in run.outcome ? run.outcome.reasoning.hazards : [];
    records.push({
      id: c.id, expectClarification: c.expectClarification, text: c.text,
      outcomeKind: run.outcome.kind,
      preSemanticCandidates: pre.map(h => ({ key: h.candidateKey, family: h.hazardFamily, state: h.conditionState, clarification: h.clarification })),
      shippedCandidates: shipped.map(h => ({ key: h.candidateKey, family: h.hazardFamily, state: h.conditionState, clarification: h.clarification })),
      clarificationRaisedPre: pre.some(h => h.clarification),
      clarificationRaisedShipped: shipped.some(h => h.clarification),
      binderSaidClarificationExpected: run.semantic?.clarificationExpected ?? [],
      semanticIssues: (run.semantic?.issues ?? []).map(i => ({ code: i.code, severity: i.severity })),
    });
    process.stderr.write(`${c.id} ${run.outcome.kind} pre=${pre.length} shipped=${shipped.length} clarPre=${pre.some(h => h.clarification)}\n`);
  }
  const path = process.env.OUT || '../verification/hazlenz-l3-2c-gate-polarity-2026-08-22/rootcause/clarification-pre-patch.json';
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify({ stage: 'PRE_PATCH', generatedAt: new Date().toISOString(), records }, null, 2) + '\n');
  const recall = records.filter(r => r.expectClarification && r.clarificationRaisedShipped).length;
  const expected = records.filter(r => r.expectClarification).length;
  const unnecessary = records.filter(r => !r.expectClarification && r.clarificationRaisedShipped).map(r => r.id);
  console.log(JSON.stringify({ recall: `${recall}/${expected}`, unnecessary, path }, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });
