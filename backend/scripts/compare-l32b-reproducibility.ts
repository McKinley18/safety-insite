/**
 * L3-2b Phase 11 -- reproducibility, measured separately from semantic correctness.
 *
 * THE COMPARISON CONTRACT IS DEFINED HERE, BEFORE ANY RESULT IS READ. Two runs are equivalent when
 * every one of the following matches; free-form natural language is deliberately excluded, because
 * requiring byte-identical prose would measure the decoder rather than the reasoning:
 *
 *   * outcome kind
 *   * validated / rejected status
 *   * the SET of hazard families
 *   * the MULTISET of (family, conditionState) pairs
 *   * the SET of evidence quotations
 *   * whether a clarification was raised, per candidate family
 *
 * Excluded by design: conditionRationale, independentHazardRationale, observationInterpretation,
 * uncertainties, clarification wording, latency, token counts.
 *
 * Env: A, B (two capture artifacts), OUT.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

interface Rec {
  id: string; outcomeKind: string; validationState: string | null;
  reasoning: { hazards: Array<{ hazardFamily: string; conditionState: string; evidence: Array<{ quotedText: string }>; clarification: unknown | null }> } | null;
}

function fingerprint(r: Rec) {
  const hz = r.reasoning?.hazards ?? [];
  return {
    outcomeKind: r.outcomeKind,
    validationState: r.validationState,
    families: [...new Set(hz.map(h => h.hazardFamily))].sort(),
    familyStatePairs: hz.map(h => `${h.hazardFamily}/${h.conditionState}`).sort(),
    quotations: [...new Set(hz.flatMap(h => h.evidence.map(e => e.quotedText)))].sort(),
    clarificationFamilies: hz.filter(h => h.clarification).map(h => h.hazardFamily).sort(),
  };
}

function main(): void {
  const a = JSON.parse(readFileSync(process.env.A || '', 'utf8')) as { records: Rec[] };
  const b = JSON.parse(readFileSync(process.env.B || '', 'utf8')) as { records: Rec[] };
  const outPath = process.env.OUT || '';
  const bById = new Map(b.records.map(r => [r.id, r]));

  const axes = ['outcomeKind', 'validationState', 'families', 'familyStatePairs', 'quotations', 'clarificationFamilies'] as const;
  const axisDiffs: Record<string, number> = Object.fromEntries(axes.map(x => [x, 0]));
  const differing: Array<Record<string, unknown>> = [];
  let identical = 0;

  for (const ra of a.records) {
    const rb = bById.get(ra.id);
    if (!rb) { differing.push({ id: ra.id, reason: 'missing from run B' }); continue; }
    const fa = fingerprint(ra), fb = fingerprint(rb);
    const changed = axes.filter(x => JSON.stringify(fa[x]) !== JSON.stringify(fb[x]));
    if (changed.length === 0) { identical += 1; continue; }
    for (const x of changed) axisDiffs[x] += 1;
    differing.push({ id: ra.id, changedAxes: changed, runA: fa, runB: fb });
  }

  const total = a.records.length;
  const report = {
    comparisonContract: {
      compared: axes,
      excluded: ['conditionRationale', 'independentHazardRationale', 'observationInterpretation',
        'uncertainties', 'clarification wording', 'latency', 'token counts'],
      note: 'contract fixed in this file before any result was read; prose is excluded so the measure '
        + 'reflects the structured semantic result rather than decoder sampling',
    },
    scenarios: total,
    identical,
    differing: total - identical,
    reproducibilityPct: +(identical / total * 100).toFixed(1),
    perAxisDifferingScenarios: axisDiffs,
    differences: differing,
    priorPhase: 'L3-2 measured 65 of 66 (98.5%) on a comparable structured comparison',
  };
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
  process.stdout.write(JSON.stringify({
    scenarios: total, identical, differing: total - identical,
    reproducibilityPct: report.reproducibilityPct, perAxisDifferingScenarios: axisDiffs,
    differingIds: differing.map(d => d.id),
  }, null, 2) + '\n');
}

main();
