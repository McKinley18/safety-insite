// Regression coverage for the 2026-08-18 core-closure phase: handrail domain
// routing. Protects two distinct defect classes:
//  (a) a handrail deficiency described with generic "was...repaired...
//      verified...before today" historical phrasing was misrouted into
//      material_handling_storage (which requires no storage-relevant subject
//      to fire its own historical bypass) instead of fall_protection;
//  (b) a bare handrail deficiency with no accompanying "fall hazard"/"edge"/
//      "platform" wording produced no finding at all (a detection miss, not
//      just a misroute), because "handrail" was not a recognized signal
//      anywhere in the taxonomy or decomposition layer.
// Also protects the requirement that handrail and guardrail evidence remain
// textually distinct (not silently aliased to one another) even though both
// currently share the broader fall_protection hazardFamily bucket.
import { MultiHazardDecompositionService } from '../multi-hazard-decomposition/multi-hazard-decomposition.service';

const decomp = new MultiHazardDecompositionService();
let failures = 0;
function check(name: string, condition: boolean, detail?: unknown) {
  if (condition) {
    console.log(`PASS ${name}`);
  } else {
    failures++;
    console.error(`FAIL ${name}`, detail !== undefined ? JSON.stringify(detail) : '');
  }
}

{
  const text = "Last week a damaged handrail on stairwell B was reported, but it was repaired and verified secure before today's inspection.";
  const result = decomp.decompose(text);
  const misrouted = result.hazards.find(h => h.domainId === 'material_handling_storage');
  const handrailFinding = result.hazards.find(h => h.domainId === 'fall_protection' && /handrail/i.test(h.observationFragment));
  check('Historical handrail correction is not misrouted to material_handling_storage', !misrouted, result.hazards);
  check('Historical handrail correction lands in fall_protection with HISTORICAL state', !!handrailFinding && handrailFinding.conditionState === 'HISTORICAL', handrailFinding);
}

{
  const text = 'The handrail on the interior stairway is missing, exposing employees to a fall hazard while descending.';
  const result = decomp.decompose(text);
  const finding = result.hazards.find(h => h.domainId === 'fall_protection');
  check('Stair handrail missing is detected as ACTIVE fall_protection', !!finding && finding.conditionState === 'ACTIVE', result.hazards);
}

{
  const text = 'The handrail on the interior stairway is damaged and loose, no longer providing a secure handhold.';
  const result = decomp.decompose(text);
  const finding = result.hazards.find(h => h.domainId === 'fall_protection');
  check('Bare damaged-handrail evidence (no "fall hazard"/"edge" wording) is still detected as ACTIVE',
    !!finding && finding.conditionState === 'ACTIVE' && /handrail/i.test(finding.observationFragment), result.hazards);
}

{
  const text = 'The stairway handrail is securely installed and in good condition. No deficiencies were observed.';
  const result = decomp.decompose(text);
  const activeFinding = result.hazards.find(h => h.domainId === 'fall_protection' && h.conditionState === 'ACTIVE');
  check('Compliant handrail produces no unsupported ACTIVE finding', !activeFinding, result.hazards);
}

{
  const text = 'The guardrail on the elevated platform is missing, exposing employees to a fall hazard at the open edge.';
  const result = decomp.decompose(text);
  const guardrailFinding = result.hazards.find(h => /guardrail/i.test(h.observationFragment) || h.mechanism === 'fall/opening exposure');
  check('Platform guardrail missing is still detected as ACTIVE fall_protection', result.hazards.some(h => h.conditionState === 'ACTIVE'), result.hazards);
  check('Guardrail evidence/mechanism text does not say "handrail"', !guardrailFinding || !/handrail/i.test(JSON.stringify(guardrailFinding)), guardrailFinding);
}

{
  // Handrail and guardrail findings from the same observation must remain
  // textually distinguishable -- neither term silently substituted for the
  // other.
  const text = 'The stairway handrail is missing on level 2, and separately the platform guardrail is also missing on level 3.';
  const result = decomp.decompose(text);
  const mechanisms = result.hazards.map(h => h.mechanism);
  check('Handrail and guardrail deficiencies in the same observation keep distinct mechanism text',
    mechanisms.includes('stairway/handrail deficiency'), mechanisms);
}

console.log('='.repeat(60));
if (failures > 0) {
  console.error(`HazLenz handrail/guardrail regression: ${failures} FAILED`);
  process.exit(1);
}
console.log('HazLenz handrail/guardrail regression: all invariants passed, 0 failed');
