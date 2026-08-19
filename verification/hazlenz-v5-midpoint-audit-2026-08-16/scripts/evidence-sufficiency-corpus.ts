// V5 midpoint audit -- Task A: evidence-sufficiency calibration corpus.
// Pure in-memory computation, NO DATABASE. Instantiates EvidenceSufficiencyService directly
// (it has zero constructor dependencies) and buildEvidenceFacts() (also pure, synchronous).
// Mirrors the C03 "scratch_disconnect_probe.ts" methodology described in
// verification/hazlenz-v5-c03-evidence-finalization-2026-08-16/V5_C03_SUFFICIENCY_REASON_CLASSIFICATION.md:
// text-only path, observationUnderstanding/causalRiskReasoning passed as {} (the conservative floor --
// the live orchestrator would populate these from real structured services and score at or above this).
//
// Run: cd backend && npx ts-node ../verification/hazlenz-v5-midpoint-audit-2026-08-16/scripts/evidence-sufficiency-corpus.ts

import { EvidenceSufficiencyService } from '../../../backend/src/safescope-v2/evidence-sufficiency-core/evidence-sufficiency.service';
import { buildEvidenceFacts } from '../../../backend/src/safescope-v2/evidence/shared-evidence-facts';

type Case = { category: string; text: string; scopes?: string[] };

const CASES: Case[] = [
  {
    category: '1_clear_hazard_strong_evidence',
    text: 'The machine guard is missing and the operator can reach the rotating shaft while the conveyor is running.',
    scopes: ['osha_general_industry'],
  },
  {
    category: '2_vague_safety_concern',
    text: 'There is a problem with the equipment.',
  },
  {
    category: '3_effective_control',
    text: 'The machine guard is installed and prevents access to the rotating shaft, which is locked out and de-energized.',
    scopes: ['osha_general_industry'],
  },
  {
    category: '4_failed_control',
    text: 'Local exhaust ventilation is running but fumes remain in the worker breathing zone.',
    scopes: ['osha_general_industry'],
  },
  {
    category: '5_ambiguous_condition',
    text: 'Something unsafe was noted near the equipment area.',
  },
  {
    category: '6_unknown_control_status',
    text: 'A worker was servicing the conveyor drive.',
    scopes: ['osha_general_industry'],
  },
  {
    category: '7_negated_hazard',
    text: 'No exposed energized conductors were observed. The panel cover is intact.',
    scopes: ['osha_general_industry'],
  },
  {
    category: '8_historical_resolved_hazard',
    text: 'The guard was missing last week but was replaced before this inspection.',
    scopes: ['osha_general_industry'],
  },
  {
    category: '9_planned_future_correction',
    text: "The guard is missing. Replacement is scheduled tomorrow's shutdown.",
    scopes: ['osha_general_industry'],
  },
  {
    category: '10_multi_hazard_observation',
    text: 'An employee reached through an unguarded rotating pulley on a running conveyor drive while a nearby open junction box had exposed live parts.',
    scopes: ['osha_general_industry'],
  },
  {
    category: '11_standards_only_uncertainty',
    text: 'The employee worked near an exposed rotating shaft coupling on a running drive motor. It is unclear whether the applicable standard is the general machine guarding provision or the power-transmission-specific guarding provision.',
    scopes: ['osha_general_industry'],
  },
  {
    category: '12_jurisdiction_only_uncertainty',
    text: 'The machine guard is missing and the operator can reach the rotating shaft while the conveyor is running. It is unclear whether this site is subject to MSHA or OSHA general industry jurisdiction.',
  },
  {
    category: '13_optional_enrichment',
    text: 'The machine guard is missing and the operator can reach the rotating shaft while the conveyor is running. No photos or measurements were taken during the observation.',
    scopes: ['osha_general_industry'],
  },
];

async function main() {
  const svc = new EvidenceSufficiencyService();
  const results: any[] = [];

  for (const c of CASES) {
    const extracted = buildEvidenceFacts({ text: c.text, scopes: c.scopes });
    const output = await svc.evaluateEvidenceSufficiency({}, {}, c.text, extracted.facts);
    results.push({
      category: c.category,
      text: c.text,
      sufficiencyLevel: output.sufficiencyLevel,
      overallScore: output.overallScore,
      factScores: output.factScores,
      missingCriticalFacts: output.missingCriticalFacts,
      strongestFacts: output.strongestFacts,
      weakestFacts: output.weakestFacts,
      maximumSupportedConfidence: output.confidenceImpact.maximumSupportedConfidence,
      factTypes: extracted.facts.map(f => `${f.type}=${JSON.stringify(f.value)}(${f.status})`),
      currentHazardNegated: extracted.currentHazardNegated,
      correctedBeforeReview: extracted.correctedBeforeReview,
      noExposure: extracted.noExposure,
    });
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
