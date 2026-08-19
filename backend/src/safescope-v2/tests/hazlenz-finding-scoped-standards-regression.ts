// Regression coverage for Phase 5/7 of the 2026-08-18 core-correctness
// remediation: standards evaluation and corrective-action generation must be
// scoped to each decomposed finding's own evidence, and must never leak a
// standard or action from one finding onto another. Exercises the real
// applyFindingScopedStandards() pipeline function directly (no HTTP/DB
// needed) against a multi-hazard observation where two findings have
// distinct, well-known applicable standards.
import { applyFindingScopedStandards } from '../evidence/evidence-foundation';

let failures = 0;
function check(name: string, condition: boolean, detail?: unknown) {
  if (condition) {
    console.log(`PASS ${name}`);
  } else {
    failures++;
    console.error(`FAIL ${name}`, detail !== undefined ? JSON.stringify(detail) : '');
  }
}

// Invariant 5: standards evaluation occurs at finding scope for eligible decomposed findings.
// Invariant 6: a standard belonging to Finding A cannot appear under Finding B.
{
  const result: any = {
    multiHazardDecomposition: {
      hazards: [
        {
          hazardId: 'haz-1',
          domainId: 'machine_guarding',
          hazardFamily: 'machine_guarding',
          observationFragment: 'the machine guard is missing on the conveyor, exposing a nip point',
          mechanism: 'guard',
          supportingSignals: ['guard'],
        },
        {
          hazardId: 'haz-2',
          domainId: 'lockout_tagout',
          hazardFamily: 'lockout_tagout',
          observationFragment: 'a worker was performing maintenance on an energized panel without lockout applied',
          mechanism: 'lockout',
          supportingSignals: ['lockout'],
        },
      ],
    },
  };
  applyFindingScopedStandards(result, { text: '', scopes: ['osha_general_industry'] } as any);
  const hazards = result.multiHazardDecomposition.hazards;

  check('Invariant 5: standardCandidates was computed (present) for every decomposed finding',
    hazards.every((h: any) => Array.isArray(h.standardCandidates)), hazards);

  const lotoHazard = hazards.find((h: any) => h.domainId === 'lockout_tagout');
  const lotoCitations = (lotoHazard.standardCandidates || []).map((c: any) => c.citation);
  check('Invariant 5: the LOTO finding\'s own evidence produces the LOTO standard (29 CFR 1910.147)',
    lotoCitations.some((c: string) => c.includes('1910.147')), lotoCitations);

  const guardHazard = hazards.find((h: any) => h.domainId === 'machine_guarding');
  const guardCitations = (guardHazard.standardCandidates || []).map((c: any) => c.citation);
  check('Invariant 6: the LOTO standard (1910.147) does not leak onto the machine_guarding finding',
    !guardCitations.some((c: string) => c.includes('1910.147')), guardCitations);
  check('Invariant 6: the machine_guarding finding\'s own standard does not leak onto the LOTO finding',
    !lotoCitations.some((c: string) => c.includes('1910.212')), lotoCitations);
}

// Invariant 5 (negative case): a finding whose fragment supports no rule in the engine legitimately
// gets an empty candidate list -- this must not throw or fabricate a citation.
{
  const result: any = {
    multiHazardDecomposition: {
      hazards: [
        {
          hazardId: 'haz-1',
          domainId: 'walking_working_surfaces',
          hazardFamily: 'walking_working_surfaces',
          observationFragment: 'a minor scuff mark was noted on the floor tile',
          mechanism: 'scuff',
          supportingSignals: [],
        },
      ],
    },
  };
  applyFindingScopedStandards(result, { text: '', scopes: ['osha_general_industry'] } as any);
  const hazard = result.multiHazardDecomposition.hazards[0];
  check('Invariant 5: a finding with no rule-matching evidence gets an empty (not fabricated) standardCandidates list',
    Array.isArray(hazard.standardCandidates) && hazard.standardCandidates.length === 0, hazard.standardCandidates);
}

console.log('='.repeat(60));
if (failures > 0) {
  console.error(`HazLenz finding-scoped standards regression: ${failures} FAILED`);
  process.exit(1);
}
console.log('HazLenz finding-scoped standards regression: all invariants passed, 0 failed');
