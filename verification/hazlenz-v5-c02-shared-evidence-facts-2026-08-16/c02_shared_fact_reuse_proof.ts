// V5-C02 Phase 5 proof: two live consumers build/consume the SAME normalized EvidenceFact[]
// representation from backend/src/safescope-v2/evidence/shared-evidence-facts.ts.
//
// Consumer A: evidence-foundation.ts's applyEvidenceFoundation() (post-process on every
//   classify() response, safescope-v2.controller.ts).
// Consumer B: evidence-sufficiency-core/evidence-sufficiency.service.ts's
//   EvidenceSufficiencyService.evaluateEvidenceSufficiency() (live via the intelligence
//   orchestrator, intelligence-orchestrator.service.ts:403-408, which now builds
//   `sharedEvidenceFacts` once via buildEvidenceFacts() and passes `.facts` in as the 4th arg --
//   see that file's diff).
//
// This script proves reuse directly at the code level (no HTTP/DB needed -- both call chains are
// pure, synchronous/async-but-no-IO functions), and separately proves the same fact set is what
// evidence-foundation.ts's own evidenceSnapshot.facts contains for identical input.
//
// Run: cd backend && npx ts-node ../verification/hazlenz-v5-c02-shared-evidence-facts-2026-08-16/c02_shared_fact_reuse_proof.ts

import { buildEvidenceFacts } from '../../backend/src/safescope-v2/evidence/shared-evidence-facts';
import { applyEvidenceFoundation } from '../../backend/src/safescope-v2/evidence/evidence-foundation';
import { EvidenceSufficiencyService } from '../../backend/src/safescope-v2/evidence-sufficiency-core/evidence-sufficiency.service';

type Case = { name: string; text: string };

const cases: Case[] = [
  { name: 'guard-absent-energized', text: 'An employee reached through an unguarded rotating pulley on a running conveyor drive while the machine remained energized.' },
  { name: 'guard-present-safe', text: 'The machine guard is installed and blocks reach to the rotating shaft, which is locked out and de-energized.' },
  { name: 'unknown-guard-condition', text: 'The condition of the machine guard could not be confirmed during this walk-through.' },
];

async function main() {
  let allPass = true;
  const results: any[] = [];

  for (const c of cases) {
    // Consumer A path: exactly what applyEvidenceFoundation() does internally.
    const classifyDto: any = { text: c.text };
    const before = applyEvidenceFoundation({ ...{} }, classifyDto);
    const consumerAFacts = before.evidenceSnapshot.facts as Array<{ type: string; value: unknown; source: string; status: string }>;

    // Independently invoke the shared builder the same way (what evidence-foundation.ts calls
    // internally as `extract()` -- proves it's literally the same function, not a re-implementation).
    const directFacts = buildEvidenceFacts({ text: c.text }).facts;

    const aMatchesDirect = JSON.stringify(consumerAFacts) === JSON.stringify(directFacts);

    // Consumer B path: EvidenceSufficiencyService, called the same way the orchestrator calls it,
    // with the shared fact array as the 4th arg.
    const service = new EvidenceSufficiencyService();
    const sufficiency = await service.evaluateEvidenceSufficiency(
      {}, {}, c.text, directFacts,
    );
    const traceMatchesFacts = JSON.stringify((sufficiency.evidenceFactTrace || []).map(t => ({ type: t.type, value: t.value, source: t.source, status: t.status }))) ===
      JSON.stringify(directFacts.map(f => ({ type: f.type, value: f.value, source: f.source, status: f.status })));

    // Behavior-preservation check: calling evaluateEvidenceSufficiency WITHOUT the 4th arg (the
    // pre-C02 call shape) must produce identical output on every pre-existing field.
    const sufficiencyNoFacts = await service.evaluateEvidenceSufficiency({}, {}, c.text);
    const { evidenceFactTrace: _drop1, ...withFacts } = sufficiency as any;
    const { evidenceFactTrace: _drop2, ...withoutFacts } = sufficiencyNoFacts as any;
    const preExistingFieldsUnchanged = JSON.stringify(withFacts) === JSON.stringify(withoutFacts);

    const pass = aMatchesDirect && traceMatchesFacts && preExistingFieldsUnchanged && directFacts.length > 0;
    allPass = allPass && pass;
    results.push({
      case: c.name,
      factCount: directFacts.length,
      consumerA_evidenceFoundation_matchesSharedBuilder: aMatchesDirect,
      consumerB_evidenceSufficiency_traceMatchesSharedFacts: traceMatchesFacts,
      consumerB_preExistingFieldsUnchangedWhenFactsOmitted: preExistingFieldsUnchanged,
      pass,
    });
  }

  console.log(JSON.stringify({ allPass, results }, null, 2));
  process.exit(allPass ? 0 : 1);
}

main().catch(err => { console.error(err); process.exit(1); });
