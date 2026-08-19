// V5 midpoint audit -- Task B: finding-scoped sufficiency feasibility trace.
// Pure in-memory computation, NO DATABASE.
// Decomposes multi-hazard observations, inspects each hazard's observationFragment (is it a true
// local text slice, or a fallback to the whole fused observation?), then builds hazard-scoped
// evidence facts per hazard (buildHazardScopedEvidenceFacts) and compares against whole-text
// evidence-sufficiency scoring, to assess whether per-finding sufficiency scoring is currently safe.
//
// Run: cd backend && npx ts-node ../verification/hazlenz-v5-midpoint-audit-2026-08-16/scripts/finding-scoped-feasibility-trace.ts

import { MultiHazardDecompositionService } from '../../../backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service';
import { buildHazardScopedEvidenceFacts, buildEvidenceFacts } from '../../../backend/src/safescope-v2/evidence/shared-evidence-facts';
import { EvidenceSufficiencyService } from '../../../backend/src/safescope-v2/evidence-sufficiency-core/evidence-sufficiency.service';

const CASES: Array<{ name: string; text: string; scopes?: string[] }> = [
  {
    name: 'both_split_fragment_path',
    text: 'An employee reached through an unguarded rotating pulley on a running conveyor drive while a nearby open junction box had exposed live parts.',
    scopes: ['osha_general_industry'],
  },
  {
    name: 'cross_clause_loto_plus_electrical',
    text: 'A mechanic reached into the baler to clear a jam while hydraulic pressure remains in the ram, and a nearby employee walked past an open electrical panel with exposed energized bus bars.',
    scopes: ['osha_general_industry'],
  },
];

async function main() {
  const decomposer = new MultiHazardDecompositionService();
  const svc = new EvidenceSufficiencyService();

  for (const c of CASES) {
    console.log(`\n=== ${c.name} ===`);
    console.log(`text: ${c.text}`);
    const decomposition = decomposer.decompose(c.text, {});
    console.log(`hazardCount: ${decomposition.hazardCount}, isMultiHazard: ${decomposition.isMultiHazard}`);

    for (const hazard of decomposition.hazards) {
      const fragmentIsWholeText = hazard.observationFragment.trim() === c.text.trim();
      console.log(`\n  hazardId=${hazard.hazardId} domainId=${hazard.domainId} conditionState=${hazard.conditionState}`);
      console.log(`  observationFragment: "${hazard.observationFragment}"`);
      console.log(`  FRAGMENT_IS_WHOLE_TEXT: ${fragmentIsWholeText}`);
      console.log(`  mechanism: ${hazard.mechanism}, supportingSignals: ${JSON.stringify(hazard.supportingSignals)}`);

      const hazardText = [hazard.observationFragment, hazard.mechanism, ...hazard.supportingSignals].filter(Boolean).join('. ');
      const scoped = buildHazardScopedEvidenceFacts(hazardText, c.scopes);
      const scopedOutput = await svc.evaluateEvidenceSufficiency({}, {}, hazardText, scoped.facts);
      console.log(`  hazard-scoped facts: ${scoped.facts.map(f => `${f.type}=${JSON.stringify(f.value)}`).join(', ') || '(none)'}`);
      console.log(`  hazard-scoped sufficiency: ${scopedOutput.sufficiencyLevel} (${scopedOutput.overallScore})`);
    }

    // Whole-fused-text sufficiency for comparison (what the live orchestrator actually computes today)
    const whole = buildEvidenceFacts({ text: c.text, scopes: c.scopes });
    const wholeOutput = await svc.evaluateEvidenceSufficiency({}, {}, c.text, whole.facts);
    console.log(`\n  WHOLE-TEXT facts: ${whole.facts.map(f => `${f.type}=${JSON.stringify(f.value)}`).join(', ') || '(none)'}`);
    console.log(`  WHOLE-TEXT sufficiency: ${wholeOutput.sufficiencyLevel} (${wholeOutput.overallScore})`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
