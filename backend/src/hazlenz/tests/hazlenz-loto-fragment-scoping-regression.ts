// Regression coverage for the 2026-08-18 core-closure phase: LOTO fragment
// scoping. Protects two distinct defect classes:
//  (a) the LOTO cross-clause detectors previously persisted the ENTIRE
//      observation as observationFragment, bleeding unrelated sentences into
//      a LOTO finding's evidence;
//  (b) "no lockout/tagout has been applied" (control absent -- an active
//      deficiency) was being treated the same as safe negated-hazard language
//      ("no lockout deficiency exists"), producing zero findings for a
//      genuinely active LOTO case.
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

// Active deficiency: "no lockout/tagout has been applied" must be detected as
// an ACTIVE LOTO finding, not suppressed as if it were negated-safe language.
{
  const text = 'Equipment is being serviced and no lockout/tagout has been applied.';
  const result = decomp.decompose(text);
  const loto = result.hazards.find(h => h.domainId === 'lockout_tagout');
  check('Active LOTO deficiency ("no lockout/tagout has been applied") is detected as ACTIVE',
    !!loto && loto.conditionState === 'ACTIVE', result.hazards);
}

// Properly controlled: no unsupported active LOTO finding.
{
  const text = 'Equipment is locked out and tagged according to the procedure before servicing.';
  const result = decomp.decompose(text);
  const activeLoto = result.hazards.find(h => h.domainId === 'lockout_tagout' && h.conditionState === 'ACTIVE');
  check('Properly controlled LOTO produces no unsupported ACTIVE finding', !activeLoto, result.hazards);
}

// Mixed: two machines, one controlled and one not -- only the genuinely
// unsupported one should produce an active finding, bound to its own fragment.
{
  const text = 'Machine A is correctly locked out; Machine B is being serviced without isolation.';
  const result = decomp.decompose(text);
  const loto = result.hazards.find(h => h.domainId === 'lockout_tagout');
  check('Mixed LOTO case: active finding exists and is bound to Machine B\'s own fragment',
    !!loto && loto.conditionState === 'ACTIVE' && /machine b/i.test(loto.observationFragment) && !/machine a/i.test(loto.observationFragment),
    loto);
}

// Multi-hazard: a LOTO finding's fragment must not include an unrelated
// electrical finding's sentence (or any other sentence not about LOTO), and
// vice versa.
{
  const text = 'A worker is servicing the panel without lockout applied and stored energy has not been released. Separately, an extension cord nearby has exposed conductors and damaged insulation.';
  const result = decomp.decompose(text);
  const loto = result.hazards.find(h => h.domainId === 'lockout_tagout');
  const electrical = result.hazards.find(h => h.domainId === 'electrical');
  check('Multi-hazard: LOTO finding exists and does not include the electrical sentence',
    !!loto && !/extension cord/i.test(loto.observationFragment), loto);
  check('Multi-hazard: electrical finding exists and does not include the LOTO sentence',
    !!electrical && !/lockout/i.test(electrical.observationFragment), electrical);
}

// "Hazardous energy" (1910.147's own name for the hazard) is a common,
// realistic way to describe the energy source without naming a specific
// energy TYPE (electrical/hydraulic/etc.) or using the word "energized." The
// cross-clause LOTO detectors' energy-type vocabulary previously did not
// include this generic phrase, so a servicing verb in one clause ("A worker
// is servicing the press") and "hazardous energy has not been isolated" in
// another (joined by "and," a fragment-splitting boundary) produced no LOTO
// finding at all -- a false negative for a textbook-plain description of the
// exact hazard 1910.147 exists to address.
{
  const text = 'A worker is servicing the stamping press and hazardous energy has not been isolated or locked out.';
  const result = decomp.decompose(text);
  const loto = result.hazards.find(h => h.domainId === 'lockout_tagout');
  check('"hazardous energy has not been isolated" (no specific energy-type word) is detected as ACTIVE LOTO',
    !!loto && loto.conditionState === 'ACTIVE', result.hazards);
}

// Demonstrated regression, caught and fixed live during this session's own
// Chromium verification: the LOTO cross-clause sentence-selection keyword
// list originally included generic intervention verbs (servic*/maint*/
// repair*/interven*/clear*/unjam*), which also matched an UNRELATED
// sentence's "...was repaired and verified secure..." and pulled it into the
// LOTO finding's fragment. That contaminated fragment then contained
// "repaired...verified secure," which made the LOTO finding's own
// inferConditionState() misread the entire finding as SAFE_VERIFIED despite
// its own sentence explicitly saying energy had NOT been isolated or locked
// out -- inverting an active deficiency into a false "controlled" result.
{
  const text = 'A technician is servicing the hydraulic baler and hazardous energy has not been isolated or locked out. The handrail on stairwell C was found damaged last month, but it was repaired and verified secure before today\'s inspection.';
  const result = decomp.decompose(text);
  const loto = result.hazards.find(h => h.domainId === 'lockout_tagout');
  const fallProtection = result.hazards.find(h => h.domainId === 'fall_protection');
  check('LOTO fragment does not absorb the unrelated handrail sentence', !!loto && !/handrail/i.test(loto.observationFragment), loto);
  check('LOTO finding remains ACTIVE (not flipped to SAFE_VERIFIED by an unrelated sentence\'s "repaired/verified" language)',
    !!loto && loto.conditionState === 'ACTIVE', loto);
  check('The handrail finding independently remains HISTORICAL, correctly scoped to only its own sentence',
    !!fallProtection && fallProtection.conditionState === 'HISTORICAL' && !/hydraulic baler|lockout/i.test(fallProtection.observationFragment),
    fallProtection);
}

// General fragment-scoping invariant: no decomposed hazard's observationFragment
// may equal the full multi-sentence observation text when the observation
// contains an unrelated sentence, for ANY domain (not just LOTO) -- protects
// the same class of bug across hot_work/welding_fumes/ventilation/chemical_
// release/hazcom/mobile_equipment, which shared the identical root cause.
{
  const text = 'Guardrails are fully secured and no deficiencies were observed. A worker is servicing an energized panel without lockout applied and stored energy has not been released.';
  const result = decomp.decompose(text);
  const fullTextMatches = result.hazards.filter(h => h.observationFragment.trim().toLowerCase() === text.trim().toLowerCase());
  check('No finding\'s fragment equals the entire multi-sentence observation text',
    fullTextMatches.length === 0, result.hazards.map(h => h.observationFragment));
}

console.log('='.repeat(60));
if (failures > 0) {
  console.error(`HazLenz LOTO fragment-scoping regression: ${failures} FAILED`);
  process.exit(1);
}
console.log('HazLenz LOTO fragment-scoping regression: all invariants passed, 0 failed');
