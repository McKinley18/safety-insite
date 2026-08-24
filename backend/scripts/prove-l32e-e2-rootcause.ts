/**
 * L3-2e -- E2 ROOT-CAUSE PROOF, run against the UNPATCHED L3-2d code.
 *
 * THE DISTINCTION UNDER TEST. "I could not see whether they were tied off" is a FACT about what was
 * observed. It is not the same thing as "this text does not say enough to classify the condition",
 * and collapsing the two in either direction produces one of the two errors L3-2d measured:
 *
 *   D-CR-04  an explicit could-not-observe over the DECIDING fact -> asserted ACTIVE anyway
 *   D-NG-04  no observation-availability statement at all -> retreated to INSUFFICIENT_EVIDENCE
 *
 * The fixtures below vary the two properties INDEPENDENTLY, which is what makes this a discriminator
 * proof rather than two anecdotes:
 *
 *            unobserved fact present?   is it the DECIDING fact?   expected
 *   A            yes                          yes                  INSUFFICIENT_EVIDENCE + question
 *   B            yes                          no                   ACTIVE, no question
 *   C            no                           n/a                  ACTIVE, no question
 *   D            no (just silent)             n/a                  INSUFFICIENT_EVIDENCE + question
 *
 * Cell B is the one no phase has ever tested, and it is the cell that proves the discriminator is
 * about DECISION-CRITICALITY rather than about the presence of could-not-observe wording.
 *
 * Run: OUT=... npx ts-node scripts/prove-l32e-e2-rootcause.ts
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { HAZARD_TAXONOMY } from '../src/safescope-v2/taxonomy/hazard-taxonomy';
import { buildReasoningInput } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { OllamaReasoningProvider } from '../src/safescope-v2/reasoning-l3/ollama-reasoning-provider';
import { runValidatedReasoning } from '../src/safescope-v2/reasoning-l3/reasoning-runner';
import type { L3RegulatoryContextValue } from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';

const FAMILIES = [...new Set(HAZARD_TAXONOMY.map(p => p.id))].sort();

interface Case {
  id: string; cell: 'A' | 'B' | 'C' | 'D' | 'BASELINE'; regime: string; text: string;
  unobservedFactPresent: boolean; unobservedFactIsDeciding: boolean | null;
  expectActive: boolean; expectClarification: boolean; why: string;
}

const CASES: Case[] = [
  // ---- the two L3-2d failures, reproduced
  { id: 'D-CR-04', cell: 'A', regime: 'osha-construction', unobservedFactPresent: true, unobservedFactIsDeciding: true,
    expectActive: false, expectClarification: true,
    why: 'whether they were tied off IS the deciding fact for a fall hazard',
    text: 'Two men were on the roof near the edge; I was too far away to see whether they were tied off to anything.' },
  { id: 'D-NG-04', cell: 'C', regime: 'osha-general-industry', unobservedFactPresent: false, unobservedFactIsDeciding: null,
    expectActive: true, expectClarification: false,
    why: 'no observation-availability statement at all; every deciding fact is stated',
    text: 'No flammable atmosphere was detected at the manway, and the fitter went inside the vessel with the agitator still on line and nobody at the opening.' },

  // ---- CELL B: an explicit could-not-observe over a fact that decides NOTHING. Never tested before.
  { id: 'E2-B-01', cell: 'B', regime: 'osha-general-industry', unobservedFactPresent: true, unobservedFactIsDeciding: false,
    expectActive: true, expectClarification: false,
    why: 'the guard is stated missing; the serial number decides nothing',
    text: 'The tongue guard on the bench grinder is missing entirely; I could not read the machine serial number from where I stood.' },
  { id: 'E2-B-02', cell: 'B', regime: 'osha-construction', unobservedFactPresent: true, unobservedFactIsDeciding: false,
    expectActive: true, expectClarification: false,
    why: 'the open edge and absent guardrail are both stated; the sub-contractor name decides nothing',
    text: 'The leading edge on level four has no guardrail and no covers over the two floor openings; I could not tell which sub-contractor the crew belonged to.' },
  { id: 'E2-B-03', cell: 'B', regime: 'osha-general-industry', unobservedFactPresent: true, unobservedFactIsDeciding: false,
    expectActive: true, expectClarification: false,
    why: 'the conductor is stated exposed; how long it has been that way decides nothing',
    text: 'The flexible cord to the pedestal fan has its jacket worn through to bare conductor; I could not establish how long it had been in that condition.' },

  // ---- CELL A: an explicit could-not-observe over the DECIDING fact.
  { id: 'E2-A-01', cell: 'A', regime: 'osha-general-industry', unobservedFactPresent: true, unobservedFactIsDeciding: true,
    expectActive: false, expectClarification: true,
    why: 'whether the disconnect was open is the whole question',
    text: 'A lock was hanging on the lockout box at the press but I could not see whether the disconnect behind it was open.' },
  { id: 'E2-A-02', cell: 'A', regime: 'osha-construction', unobservedFactPresent: true, unobservedFactIsDeciding: true,
    expectActive: false, expectClarification: true,
    why: 'whether the trench was shored is the deciding fact',
    text: 'A man was down in the excavation on the far side of the site and I could not get close enough to see whether it was shored.' },

  // ---- CELL C: no observation-availability statement; the facts are stated.
  { id: 'E2-C-01', cell: 'C', regime: 'osha-general-industry', unobservedFactPresent: false, unobservedFactIsDeciding: null,
    expectActive: true, expectClarification: false,
    why: 'plainly stated missing control after a negated clause',
    text: 'No spillage was present around the pump skid, and the coupling guard on the drive end has been taken off and left on the floor.' },

  // ---- CELL D: genuinely insufficient evidence, which must STILL be able to produce a question.
  //
  // LABEL CORRECTED DURING DEVELOPMENT, and recorded rather than quietly changed. This cell was first
  // written as "Looked at the chemical store on the way past." with clarificationExpected true. That
  // is inconsistent with the established precedent `H-AM-04` ("Walked the yard.", labelled FALSE):
  // where there is nothing to suspect there is nothing to ask about, and the engine returning no
  // candidate was right. The label was wrong, not the engine. Both are now carried: the bare-walk
  // case at its correct FALSE, and a real cell-D case -- something to suspect, nothing that decides.
  { id: 'E2-D-00', cell: 'D', regime: 'osha-general-industry', unobservedFactPresent: false, unobservedFactIsDeciding: null,
    expectActive: false, expectClarification: false,
    why: 'nothing observed and nothing to suspect -- no candidate and no question is correct (H-AM-04 precedent)',
    text: 'Looked at the chemical store on the way past.' },
  { id: 'E2-D-01', cell: 'D', regime: 'osha-general-industry', unobservedFactPresent: false, unobservedFactIsDeciding: null,
    expectActive: false, expectClarification: true,
    why: 'genuinely insufficient: a suspicion is recorded but no fact that could decide it',
    text: 'The way the acetylene bottles were standing in the corner of the weld bay did not sit right with me.' },

  // ---- BASELINE controls that must not move.
  { id: 'E2-BASE-ACTIVE', cell: 'BASELINE', regime: 'osha-general-industry', unobservedFactPresent: false, unobservedFactIsDeciding: null,
    expectActive: true, expectClarification: false, why: 'plain unambiguous ACTIVE',
    text: 'The bottom guard on the compound mitre saw does not return over the blade when the arm is raised.' },
  { id: 'E2-BASE-NC', cell: 'BASELINE', regime: 'osha-general-industry', unobservedFactPresent: false, unobservedFactIsDeciding: null,
    expectActive: false, expectClarification: false, why: 'negative control',
    text: 'Every panel in the switch room was closed and latched and the covers were fitted on all the junction boxes.' },
];

function regulatoryContext(regime: string) {
  const value = (['osha-general-industry', 'osha-construction', 'msha'].includes(regime) ? regime : 'unknown') as L3RegulatoryContextValue;
  return { value, provenance: value === 'unknown' ? 'UNKNOWN' as const : 'USER_CONFIRMED' as const };
}

async function main(): Promise<void> {
  const provider = new OllamaReasoningProvider();
  const records: any[] = [];
  for (const c of CASES) {
    const built = buildReasoningInput({
      analysisId: `l32e-e2:${c.id}`, observationText: c.text,
      regulatoryContext: regulatoryContext(c.regime), allowedHazardFamilies: FAMILIES,
    });
    const r = await runValidatedReasoning(provider, built.input);
    const shipped = 'reasoning' in r.outcome ? r.outcome.reasoning.hazards : [];
    const raw = r.validation?.validated?.hazards ?? [];
    const active = shipped.some(h => h.conditionState === 'ACTIVE');
    const clar = shipped.some(h => h.clarification);
    const rec = {
      id: c.id, cell: c.cell, text: c.text, why: c.why,
      unobservedFactPresent: c.unobservedFactPresent, unobservedFactIsDeciding: c.unobservedFactIsDeciding,
      expectActive: c.expectActive, expectClarification: c.expectClarification,
      outcomeKind: r.outcome.kind,
      rawStates: raw.map(h => `${h.hazardFamily}/${h.conditionState}`),
      shippedStates: shipped.map(h => `${h.hazardFamily}/${h.conditionState}`),
      actualActive: active, actualClarification: clar,
      stateCorrect: active === c.expectActive, clarificationCorrect: clar === c.expectClarification,
      semanticCodes: [...new Set((r.semantic?.issues ?? []).map(i => `${i.severity}:${i.code}`))],
      questions: shipped.filter(h => h.clarification).map(h => String(h.clarification!.question).slice(0, 120)),
    };
    records.push(rec);
    const ok = rec.stateCorrect && rec.clarificationCorrect ? 'ok    ' : 'DEFECT';
    process.stderr.write(`${ok} cell${c.cell} ${c.id.padEnd(16)} active=${String(active).padEnd(5)}(want ${c.expectActive}) clar=${String(clar).padEnd(5)}(want ${c.expectClarification}) ${rec.shippedStates.join(',')}\n`);
  }
  const byCell: Record<string, { n: number; correct: number }> = {};
  for (const r of records) {
    byCell[r.cell] = byCell[r.cell] || { n: 0, correct: 0 };
    byCell[r.cell].n += 1;
    if (r.stateCorrect && r.clarificationCorrect) byCell[r.cell].correct += 1;
  }
  const out = {
    stage: 'L3-2e E2 ROOT-CAUSE PROOF (unpatched L3-2d code)',
    generatedAt: new Date().toISOString(),
    discriminatorMatrix: 'cell A = unobserved AND deciding; B = unobserved but NOT deciding; C = nothing unobserved; D = silent and insufficient',
    byCell, records,
  };
  const path = process.env.OUT || '../verification/hazlenz-l3-2e-syntactic-role-2026-08-23/rootcause/e2-proof-pre-patch.json';
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(out, null, 2) + '\n');
  console.log('\nBY CELL:', JSON.stringify(byCell, null, 2));
  console.log(`\nwrote ${path}`);
}
main().catch(e => { console.error(e); process.exit(1); });
